import type {
  AssessmentResultRecord,
  ClassActivityEvent,
  ClassMembership,
  FirestoreStudentProgress,
  GradeClassLevel,
  LocalDemoAccountSummary,
  PhysicsClass,
  SavedStudySession,
  StudentProgressMap,
  TeacherNotification,
  UserProfile,
  UserRole,
} from '../types/physics';
import type {
  GuidedActivityCompletion,
  GuidedClassroomActivity,
} from '../types/companion';
import { EXPERIMENT_CATALOGUE } from '../data/ncertCurriculum';
import type { DynamicExperimentSpec } from '../types/dynamicExperiment';

const DB_NAME = 'physix_ai_local_demo_v1';
const DB_VERSION = 4;

const STORE_ACCOUNTS = 'accounts';
const STORE_SESSION = 'session';
const STORE_CLASSES = 'classes';
const STORE_MEMBERSHIPS = 'classMemberships';
const STORE_PROGRESS = 'studentProgress';
const STORE_ASSESSMENTS = 'assessmentResults';
const STORE_STUDY_SESSIONS = 'studySessions';
const STORE_NOTIFICATIONS = 'notifications';
const STORE_ACTIVITY = 'classActivity';
const STORE_GUIDED_ACTIVITIES = 'guidedActivities';
const STORE_GUIDED_COMPLETIONS = 'guidedCompletions';
const STORE_GENERATED_EXPERIMENTS = 'generatedExperiments';

const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,32}$/;
const VALID_JOIN_CODE_REGEX = /^[A-Z0-9]{6,12}$/;

interface StoredAccountRecord {
  uid: string;
  username: string;
  normalizedUsername: string;
  name: string;
  role: UserRole;
  selectedClass?: GradeClassLevel;
  schoolOrSubject?: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredSessionRecord {
  id: 'active';
  uid: string;
  role: UserRole;
  signedInAt: string;
}

interface StoredStudySessionRecord {
  sessionId: string;
  ownerId: string;
  savedAt: string;
  fileName: string;
  analysis: SavedStudySession['analysis'];
}

export class LocalAuthError extends Error {
  code: string;
  constructor(message: string, code = 'LOCAL_AUTH_ERROR') {
    super(message);
    this.name = 'LocalAuthError';
    this.code = code;
  }
}

function clampString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

function isValidGrade(val: unknown): val is GradeClassLevel {
  return typeof val === 'number' && Number.isInteger(val) && val >= 6 && val <= 10;
}

function normalizeJoinCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function toSafeUserProfile(record: StoredAccountRecord): UserProfile {
  return {
    uid: record.uid,
    username: record.username,
    name: record.name,
    role: record.role,
    selectedClass: record.role === 'student' ? record.selectedClass : undefined,
    schoolOrSubject: record.schoolOrSubject,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toAccountSummary(record: StoredAccountRecord): LocalDemoAccountSummary {
  return {
    uid: record.uid,
    username: record.username,
    name: record.name,
    role: record.role,
    selectedClass: record.role === 'student' ? record.selectedClass : undefined,
    schoolOrSubject: record.schoolOrSubject,
    createdAt: record.createdAt,
  };
}

// ---------------------------------------------------------------------------
// Password Hashing (PBKDF2 SHA-256 via Web Crypto + salted fallback)
// ---------------------------------------------------------------------------

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : `0${hex}`;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function generateSaltHex(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(bytes);
}

// Pure-TS fallback iterated hash used only if SubtleCrypto is unavailable
function fallbackIteratedHash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let round = 0; round < 5000; round++) {
    const str = `${round}:${input}:${h1}:${h2}`;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 ^= ch;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 = (Math.imul(h2, 33) ^ ch ^ (h1 >>> 7)) >>> 0;
    }
  }
  return `iter_fnv:${h1.toString(16).padStart(8, '0')}${h2.toString(16).padStart(8, '0')}`;
}

async function hashPassword(password: string, saltHex: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const saltBytes = hexToBytes(saltHex);
    const saltBuffer = saltBytes.buffer.slice(
      saltBytes.byteOffset,
      saltBytes.byteOffset + saltBytes.byteLength
    ) as ArrayBuffer;
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    return `pbkdf2_sha256:${bytesToHex(new Uint8Array(derivedBits))}`;
  }
  return fallbackIteratedHash(`${saltHex}:${password}`);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function verifyPassword(
  password: string,
  saltHex: string,
  storedHash: string
): Promise<boolean> {
  if (storedHash.startsWith('pbkdf2_sha256:') && typeof crypto !== 'undefined' && crypto.subtle) {
    const candidate = await hashPassword(password, saltHex);
    return constantTimeEqual(candidate, storedHash);
  }
  if (storedHash.startsWith('iter_fnv:')) {
    const candidate = fallbackIteratedHash(`${saltHex}:${password}`);
    return constantTimeEqual(candidate, storedHash);
  }
  const candidate = await hashPassword(password, saltHex);
  return constantTimeEqual(candidate, storedHash);
}

// ---------------------------------------------------------------------------
// IndexedDB Core Connection & Helpers
// ---------------------------------------------------------------------------

let dbPromise: Promise<IDBDatabase> | null = null;

function openLocalDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(
      new LocalAuthError(
        'IndexedDB is not supported in this browser environment.',
        'INDEXEDDB_UNAVAILABLE'
      )
    );
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_ACCOUNTS)) {
        const accounts = db.createObjectStore(STORE_ACCOUNTS, { keyPath: 'uid' });
        accounts.createIndex('by_normalized_username', 'normalizedUsername', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORE_SESSION)) {
        db.createObjectStore(STORE_SESSION, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_CLASSES)) {
        const classes = db.createObjectStore(STORE_CLASSES, { keyPath: 'classId' });
        classes.createIndex('by_teacher', 'teacherId', { unique: false });
        classes.createIndex('by_join_code', 'joinCode', { unique: true });
      }

      if (!db.objectStoreNames.contains(STORE_MEMBERSHIPS)) {
        const memberships = db.createObjectStore(STORE_MEMBERSHIPS, {
          keyPath: 'membershipId',
        });
        memberships.createIndex('by_student', 'studentId', { unique: false });
        memberships.createIndex('by_teacher', 'teacherId', { unique: false });
        memberships.createIndex('by_class', 'classId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_PROGRESS)) {
        const progress = db.createObjectStore(STORE_PROGRESS, { keyPath: 'progressId' });
        progress.createIndex('by_student', 'studentId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_ASSESSMENTS)) {
        const assessments = db.createObjectStore(STORE_ASSESSMENTS, { keyPath: 'resultId' });
        assessments.createIndex('by_student', 'studentId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_STUDY_SESSIONS)) {
        const studySessions = db.createObjectStore(STORE_STUDY_SESSIONS, {
          keyPath: 'sessionId',
        });
        studySessions.createIndex('by_owner', 'ownerId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NOTIFICATIONS)) {
        const notifications = db.createObjectStore(STORE_NOTIFICATIONS, {
          keyPath: 'notificationId',
        });
        notifications.createIndex('by_teacher', 'teacherId', { unique: false });
        notifications.createIndex('by_class', 'classId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_ACTIVITY)) {
        const activity = db.createObjectStore(STORE_ACTIVITY, {
          keyPath: 'activityId',
        });
        activity.createIndex('by_teacher', 'teacherId', { unique: false });
        activity.createIndex('by_class', 'classId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_GUIDED_ACTIVITIES)) {
        const guided = db.createObjectStore(STORE_GUIDED_ACTIVITIES, {
          keyPath: 'activityId',
        });
        guided.createIndex('by_teacher', 'teacherId', { unique: false });
        guided.createIndex('by_class', 'classId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_GUIDED_COMPLETIONS)) {
        const completions = db.createObjectStore(STORE_GUIDED_COMPLETIONS, {
          keyPath: 'completionId',
        });
        completions.createIndex('by_student', 'studentId', { unique: false });
        completions.createIndex('by_activity', 'activityId', { unique: false });
        completions.createIndex('by_teacher', 'teacherId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_GENERATED_EXPERIMENTS)) {
        const genStore = db.createObjectStore(STORE_GENERATED_EXPERIMENTS, {
          keyPath: 'id',
        });
        genStore.createIndex('by_owner', 'ownerUid', { unique: false });
        genStore.createIndex('by_class', 'studentClass', { unique: false });
        genStore.createIndex('by_concept', 'conceptId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed to open IndexedDB database.'));
    };
  });

  return dbPromise;
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbTxComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction error'));
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
  });
}

async function getByKey<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openLocalDb();
  const tx = db.transaction(storeName, 'readonly');
  return idbRequest<T | undefined>(tx.objectStore(storeName).get(key));
}

async function getAllByIndex<T>(
  storeName: string,
  indexName: string,
  key: IDBValidKey
): Promise<T[]> {
  const db = await openLocalDb();
  const tx = db.transaction(storeName, 'readonly');
  return idbRequest<T[]>(tx.objectStore(storeName).index(indexName).getAll(key));
}

async function getByIndex<T>(
  storeName: string,
  indexName: string,
  key: IDBValidKey
): Promise<T | undefined> {
  const db = await openLocalDb();
  const tx = db.transaction(storeName, 'readonly');
  return idbRequest<T | undefined>(tx.objectStore(storeName).index(indexName).get(key));
}

async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openLocalDb();
  const tx = db.transaction(storeName, 'readonly');
  return idbRequest<T[]>(tx.objectStore(storeName).getAll());
}

// ---------------------------------------------------------------------------
// Local Demo Account Authentication & Management
// ---------------------------------------------------------------------------

export async function listLocalDemoAccounts(): Promise<LocalDemoAccountSummary[]> {
  const records = await getAllFromStore<StoredAccountRecord>(STORE_ACCOUNTS);
  records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return records.map(toAccountSummary);
}

export async function registerLocalAccount(params: {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  selectedClass: GradeClassLevel | null;
  schoolOrSubject?: string;
}): Promise<UserProfile> {
  const cleanName = clampString(params.name, 100);
  const rawUsername = params.username.trim();
  const normalizedUsername = rawUsername.toLowerCase();
  const cleanSchool = params.schoolOrSubject
    ? clampString(params.schoolOrSubject, 120)
    : undefined;

  if (cleanName.length < 2) {
    throw new LocalAuthError('Please enter your full name (at least 2 characters).', 'INVALID_NAME');
  }
  if (!USERNAME_REGEX.test(rawUsername)) {
    throw new LocalAuthError(
      'Username must be 3–32 characters using letters, numbers, underscores, dots, or hyphens.',
      'INVALID_USERNAME'
    );
  }
  if (params.password.length < 6) {
    throw new LocalAuthError('Password must be at least 6 characters long.', 'WEAK_PASSWORD');
  }
  if (params.password !== params.confirmPassword) {
    throw new LocalAuthError('Passwords do not match.', 'PASSWORD_MISMATCH');
  }
  if (params.role !== 'student' && params.role !== 'teacher') {
    throw new LocalAuthError('Please choose a valid account type (Student or Teacher).', 'INVALID_ROLE');
  }
  if (params.role === 'student' && !isValidGrade(params.selectedClass)) {
    throw new LocalAuthError(
      'Please select your NCERT Class (6, 7, 8, 9, or 10) before creating a student account.',
      'CLASS_REQUIRED'
    );
  }

  const existing = await getByIndex<StoredAccountRecord>(
    STORE_ACCOUNTS,
    'by_normalized_username',
    normalizedUsername
  );
  if (existing) {
    throw new LocalAuthError(
      `Username "${rawUsername}" is already taken. Please choose a unique username.`,
      'DUPLICATE_USERNAME'
    );
  }

  const saltHex = generateSaltHex(16);
  const passwordHash = await hashPassword(params.password, saltHex);
  const now = new Date().toISOString();
  const uid = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const newRecord: StoredAccountRecord = {
    uid,
    username: rawUsername,
    normalizedUsername,
    name: cleanName,
    role: params.role,
    selectedClass: params.role === 'student' ? params.selectedClass! : undefined,
    schoolOrSubject: cleanSchool || undefined,
    passwordSalt: saltHex,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  const sessionRecord: StoredSessionRecord = {
    id: 'active',
    uid,
    role: params.role,
    signedInAt: now,
  };

  const db = await openLocalDb();
  const tx = db.transaction([STORE_ACCOUNTS, STORE_SESSION], 'readwrite');
  tx.objectStore(STORE_ACCOUNTS).add(newRecord);
  tx.objectStore(STORE_SESSION).put(sessionRecord);
  await idbTxComplete(tx);

  return toSafeUserProfile(newRecord);
}

export async function signInLocalAccount(params: {
  username: string;
  password: string;
}): Promise<UserProfile> {
  const normalizedUsername = params.username.trim().toLowerCase();
  if (!normalizedUsername || !params.password) {
    throw new LocalAuthError(
      'Please enter both your username and password.',
      'MISSING_CREDENTIALS'
    );
  }

  const account = await getByIndex<StoredAccountRecord>(
    STORE_ACCOUNTS,
    'by_normalized_username',
    normalizedUsername
  );

  if (!account) {
    throw new LocalAuthError('Invalid username or password.', 'INVALID_CREDENTIALS');
  }

  const valid = await verifyPassword(params.password, account.passwordSalt, account.passwordHash);
  if (!valid) {
    throw new LocalAuthError('Invalid username or password.', 'INVALID_CREDENTIALS');
  }

  const db = await openLocalDb();
  const tx = db.transaction(STORE_SESSION, 'readwrite');
  const sessionRecord: StoredSessionRecord = {
    id: 'active',
    uid: account.uid,
    role: account.role,
    signedInAt: new Date().toISOString(),
  };
  tx.objectStore(STORE_SESSION).put(sessionRecord);
  await idbTxComplete(tx);

  return toSafeUserProfile(account);
}

export async function restoreActiveLocalSession(): Promise<UserProfile | null> {
  try {
    const session = await getByKey<StoredSessionRecord>(STORE_SESSION, 'active');
    if (!session || !session.uid) return null;
    const account = await getByKey<StoredAccountRecord>(STORE_ACCOUNTS, session.uid);
    if (!account) return null;
    return toSafeUserProfile(account);
  } catch {
    return null;
  }
}

export async function signOutLocalAccount(): Promise<void> {
  const db = await openLocalDb();
  const tx = db.transaction(STORE_SESSION, 'readwrite');
  tx.objectStore(STORE_SESSION).delete('active');
  await idbTxComplete(tx);
}

export async function deleteLocalDemoAccount(uid: string): Promise<void> {
  const account = await getByKey<StoredAccountRecord>(STORE_ACCOUNTS, uid);
  if (!account) return;

  const [
    session,
    studentMems,
    teacherMems,
    teacherClasses,
    studentProg,
    studentAssess,
    studySess,
    teacherNotifications,
    teacherActivities,
  ] = await Promise.all([
    getByKey<StoredSessionRecord>(STORE_SESSION, 'active'),
    getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_student', uid),
    getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_teacher', uid),
    getAllByIndex<PhysicsClass>(STORE_CLASSES, 'by_teacher', uid),
    getAllByIndex<FirestoreStudentProgress>(STORE_PROGRESS, 'by_student', uid),
    getAllByIndex<AssessmentResultRecord>(STORE_ASSESSMENTS, 'by_student', uid),
    getAllByIndex<StoredStudySessionRecord>(STORE_STUDY_SESSIONS, 'by_owner', uid),
    getAllByIndex<TeacherNotification>(STORE_NOTIFICATIONS, 'by_teacher', uid),
    getAllByIndex<ClassActivityEvent>(STORE_ACTIVITY, 'by_teacher', uid),
  ]);

  const db = await openLocalDb();
  const tx = db.transaction(
    [
      STORE_ACCOUNTS,
      STORE_SESSION,
      STORE_CLASSES,
      STORE_MEMBERSHIPS,
      STORE_PROGRESS,
      STORE_ASSESSMENTS,
      STORE_STUDY_SESSIONS,
      STORE_NOTIFICATIONS,
      STORE_ACTIVITY,
    ],
    'readwrite'
  );

  tx.objectStore(STORE_ACCOUNTS).delete(uid);
  if (session?.uid === uid) {
    tx.objectStore(STORE_SESSION).delete('active');
  }
  for (const m of studentMems) tx.objectStore(STORE_MEMBERSHIPS).delete(m.membershipId);
  for (const m of teacherMems) tx.objectStore(STORE_MEMBERSHIPS).delete(m.membershipId);
  for (const c of teacherClasses) tx.objectStore(STORE_CLASSES).delete(c.classId);
  for (const p of studentProg) tx.objectStore(STORE_PROGRESS).delete(p.progressId);
  for (const a of studentAssess) tx.objectStore(STORE_ASSESSMENTS).delete(a.resultId);
  for (const s of studySess) tx.objectStore(STORE_STUDY_SESSIONS).delete(s.sessionId);
  for (const n of teacherNotifications) tx.objectStore(STORE_NOTIFICATIONS).delete(n.notificationId);
  for (const act of teacherActivities) tx.objectStore(STORE_ACTIVITY).delete(act.activityId);

  await idbTxComplete(tx);
}

// ---------------------------------------------------------------------------
// Authoritative Role & Profile Helpers
// ---------------------------------------------------------------------------

async function requireAuthoritativeAccount(
  uid: string,
  expectedRole?: UserRole
): Promise<StoredAccountRecord> {
  const account = await getByKey<StoredAccountRecord>(STORE_ACCOUNTS, uid);
  if (!account) {
    throw new LocalAuthError('Authenticated account does not exist.', 'ACCOUNT_NOT_FOUND');
  }
  const activeSession = await getByKey<StoredSessionRecord>(STORE_SESSION, 'active');
  if (!activeSession || activeSession.uid !== uid) {
    throw new LocalAuthError('Your session is not active. Please sign in again.', 'UNAUTHENTICATED');
  }
  if (expectedRole && account.role !== expectedRole) {
    throw new LocalAuthError(
      `Access denied: This operation requires a ${expectedRole} account.`,
      'FORBIDDEN_ROLE'
    );
  }
  return account;
}

export async function updateLocalUserProfile(
  uid: string,
  patch: {
    name?: string;
    selectedClass?: GradeClassLevel;
    schoolOrSubject?: string;
  }
): Promise<UserProfile> {
  const account = await requireAuthoritativeAccount(uid);

  const nextName =
    patch.name !== undefined ? clampString(patch.name, 100) : account.name;
  if (nextName.length < 2) {
    throw new LocalAuthError('Name must be at least 2 characters.', 'INVALID_NAME');
  }

  if (
    account.role === 'student' &&
    patch.selectedClass !== undefined &&
    patch.selectedClass !== account.selectedClass
  ) {
    throw new LocalAuthError(
      'Your registered NCERT class is locked to your account and cannot be switched.',
      'CLASS_LOCKED'
    );
  }

  const nextClass =
    account.role === 'student'
      ? account.selectedClass ?? 6
      : undefined;

  const nextSchool =
    patch.schoolOrSubject !== undefined
      ? clampString(patch.schoolOrSubject, 120) || undefined
      : account.schoolOrSubject;

  const updatedRecord: StoredAccountRecord = {
    ...account,
    name: nextName,
    selectedClass: nextClass,
    schoolOrSubject: nextSchool,
    updatedAt: new Date().toISOString(),
  };

  const memberships =
    account.role === 'student'
      ? await getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_student', uid)
      : [];

  const teacherClasses =
    account.role === 'teacher'
      ? await getAllByIndex<PhysicsClass>(STORE_CLASSES, 'by_teacher', uid)
      : [];

  const db = await openLocalDb();
  const tx = db.transaction([STORE_ACCOUNTS, STORE_MEMBERSHIPS, STORE_CLASSES], 'readwrite');
  tx.objectStore(STORE_ACCOUNTS).put(updatedRecord);

  if (account.role === 'student' && memberships.length > 0) {
    for (const m of memberships) {
      tx.objectStore(STORE_MEMBERSHIPS).put({
        ...m,
        studentName: nextName,
        studentSelectedClass: nextClass ?? m.studentSelectedClass,
      });
    }
  }

  if (account.role === 'teacher' && teacherClasses.length > 0) {
    for (const cls of teacherClasses) {
      tx.objectStore(STORE_CLASSES).put({
        ...cls,
        teacherName: nextName,
        updatedAt: updatedRecord.updatedAt,
      });
    }
  }

  await idbTxComplete(tx);
  return toSafeUserProfile(updatedRecord);
}

// ---------------------------------------------------------------------------
// Teacher Classroom Management (Strictly Role-Verified & Scoped)
// ---------------------------------------------------------------------------

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PHY${suffix}`;
}

export async function getTeacherClasses(teacherUid: string): Promise<PhysicsClass[]> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const items = await getAllByIndex<PhysicsClass>(STORE_CLASSES, 'by_teacher', teacherUid);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items;
}

export async function getTeacherMemberships(teacherUid: string): Promise<ClassMembership[]> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const items = await getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_teacher', teacherUid);
  items.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  return items;
}

export async function getTeacherScopedStudentData(teacherUid: string): Promise<{
  progress: FirestoreStudentProgress[];
  assessments: AssessmentResultRecord[];
}> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const memberships = await getAllByIndex<ClassMembership>(
    STORE_MEMBERSHIPS,
    'by_teacher',
    teacherUid
  );
  const enrolledStudentIds = Array.from(new Set(memberships.map((m) => m.studentId)));
  if (enrolledStudentIds.length === 0) {
    return { progress: [], assessments: [] };
  }

  const progressGroups = await Promise.all(
    enrolledStudentIds.map((sid) =>
      getAllByIndex<FirestoreStudentProgress>(STORE_PROGRESS, 'by_student', sid)
    )
  );
  const assessmentGroups = await Promise.all(
    enrolledStudentIds.map((sid) =>
      getAllByIndex<AssessmentResultRecord>(STORE_ASSESSMENTS, 'by_student', sid)
    )
  );

  const progress = progressGroups.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const assessments = assessmentGroups
    .flat()
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  return { progress, assessments };
}

export async function createLocalTeacherClass(
  teacherUid: string,
  input: {
    className: string;
    classGrade: GradeClassLevel;
    description?: string;
  }
): Promise<PhysicsClass> {
  const teacher = await requireAuthoritativeAccount(teacherUid, 'teacher');
  const cleanName = clampString(input.className, 100);
  if (cleanName.length < 2) {
    throw new LocalAuthError('Class name must be at least 2 characters.', 'INVALID_CLASS_NAME');
  }
  if (!isValidGrade(input.classGrade)) {
    throw new LocalAuthError('Class grade must be between 6 and 10.', 'INVALID_GRADE');
  }

  const cleanDesc = input.description ? clampString(input.description, 300) : undefined;
  let joinCode = generateJoinCode();
  // Ensure unique joinCode
  for (let attempts = 0; attempts < 5; attempts++) {
    const clash = await getByIndex<PhysicsClass>(STORE_CLASSES, 'by_join_code', joinCode);
    if (!clash) break;
    joinCode = generateJoinCode();
  }

  const now = new Date().toISOString();
  const classId = `cls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const newClass: PhysicsClass = {
    classId,
    teacherId: teacher.uid,
    teacherName: teacher.name,
    className: cleanName,
    classGrade: input.classGrade,
    joinCode,
    description: cleanDesc,
    createdAt: now,
    updatedAt: now,
  };

  const db = await openLocalDb();
  const tx = db.transaction(STORE_CLASSES, 'readwrite');
  tx.objectStore(STORE_CLASSES).add(newClass);
  await idbTxComplete(tx);

  return newClass;
}

export async function updateLocalTeacherClass(
  teacherUid: string,
  classId: string,
  patch: {
    className: string;
    classGrade: GradeClassLevel;
    description?: string;
  }
): Promise<PhysicsClass> {
  const teacher = await requireAuthoritativeAccount(teacherUid, 'teacher');
  const existing = await getByKey<PhysicsClass>(STORE_CLASSES, classId);
  if (!existing || existing.teacherId !== teacher.uid) {
    throw new LocalAuthError('You can only modify classes you own.', 'FORBIDDEN_CLASS');
  }

  const cleanName = clampString(patch.className, 100);
  if (cleanName.length < 2) {
    throw new LocalAuthError('Class name must be at least 2 characters.', 'INVALID_CLASS_NAME');
  }

  const updated: PhysicsClass = {
    ...existing,
    teacherName: teacher.name,
    className: cleanName,
    classGrade: patch.classGrade,
    description: patch.description ? clampString(patch.description, 300) : undefined,
    updatedAt: new Date().toISOString(),
  };

  const memberships = await getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_class', classId);
  const db = await openLocalDb();
  const tx = db.transaction([STORE_CLASSES, STORE_MEMBERSHIPS], 'readwrite');
  tx.objectStore(STORE_CLASSES).put(updated);
  for (const m of memberships) {
    tx.objectStore(STORE_MEMBERSHIPS).put({
      ...m,
      className: updated.className,
      classGrade: updated.classGrade,
      teacherName: updated.teacherName,
    });
  }
  await idbTxComplete(tx);

  return updated;
}

export async function deleteLocalTeacherClass(
  teacherUid: string,
  classId: string
): Promise<void> {
  const teacher = await requireAuthoritativeAccount(teacherUid, 'teacher');
  const existing = await getByKey<PhysicsClass>(STORE_CLASSES, classId);
  if (!existing || existing.teacherId !== teacher.uid) {
    throw new LocalAuthError('You can only delete classes you own.', 'FORBIDDEN_CLASS');
  }

  const [memberships, classNotifications, classActivities] = await Promise.all([
    getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_class', classId),
    getAllByIndex<TeacherNotification>(STORE_NOTIFICATIONS, 'by_class', classId),
    getAllByIndex<ClassActivityEvent>(STORE_ACTIVITY, 'by_class', classId),
  ]);
  const db = await openLocalDb();
  const tx = db.transaction(
    [STORE_CLASSES, STORE_MEMBERSHIPS, STORE_NOTIFICATIONS, STORE_ACTIVITY],
    'readwrite'
  );
  tx.objectStore(STORE_CLASSES).delete(classId);
  for (const m of memberships) {
    tx.objectStore(STORE_MEMBERSHIPS).delete(m.membershipId);
  }
  for (const n of classNotifications) {
    tx.objectStore(STORE_NOTIFICATIONS).delete(n.notificationId);
  }
  for (const act of classActivities) {
    tx.objectStore(STORE_ACTIVITY).delete(act.activityId);
  }
  await idbTxComplete(tx);
}

// ---------------------------------------------------------------------------
// Teacher Notifications & Real Class Activity Feed (Role + Owner Verified)
// ---------------------------------------------------------------------------

export async function getTeacherNotifications(
  teacherUid: string
): Promise<TeacherNotification[]> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const items = await getAllByIndex<TeacherNotification>(
    STORE_NOTIFICATIONS,
    'by_teacher',
    teacherUid
  );
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items;
}

export async function markTeacherNotificationRead(
  teacherUid: string,
  notificationId: string
): Promise<void> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const existing = await getByKey<TeacherNotification>(STORE_NOTIFICATIONS, notificationId);
  if (!existing || existing.teacherId !== teacherUid) {
    throw new LocalAuthError('Notification does not belong to this teacher.', 'FORBIDDEN_NOTIFICATION');
  }
  if (existing.isRead) return;
  const db = await openLocalDb();
  const tx = db.transaction(STORE_NOTIFICATIONS, 'readwrite');
  tx.objectStore(STORE_NOTIFICATIONS).put({
    ...existing,
    isRead: true,
  });
  await idbTxComplete(tx);
}

export async function markAllTeacherNotificationsRead(teacherUid: string): Promise<void> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const items = await getAllByIndex<TeacherNotification>(
    STORE_NOTIFICATIONS,
    'by_teacher',
    teacherUid
  );
  const unread = items.filter((n) => !n.isRead);
  if (unread.length === 0) return;

  const db = await openLocalDb();
  const tx = db.transaction(STORE_NOTIFICATIONS, 'readwrite');
  const store = tx.objectStore(STORE_NOTIFICATIONS);
  for (const item of unread) {
    store.put({ ...item, isRead: true });
  }
  await idbTxComplete(tx);
}

export async function getTeacherActivityFeed(
  teacherUid: string
): Promise<ClassActivityEvent[]> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const items = await getAllByIndex<ClassActivityEvent>(
    STORE_ACTIVITY,
    'by_teacher',
    teacherUid
  );
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items;
}

// ---------------------------------------------------------------------------
// Student Memberships, Progress & Assessment Isolation
// ---------------------------------------------------------------------------

export async function getStudentMemberships(studentUid: string): Promise<ClassMembership[]> {
  await requireAuthoritativeAccount(studentUid, 'student');
  const items = await getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_student', studentUid);
  items.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
  return items;
}

export async function joinLocalClassByCode(
  studentUid: string,
  rawJoinCode: string
): Promise<ClassMembership> {
  const student = await requireAuthoritativeAccount(studentUid, 'student');
  const code = normalizeJoinCode(rawJoinCode);
  if (!VALID_JOIN_CODE_REGEX.test(code)) {
    throw new LocalAuthError(
      'Enter a valid 6–12 character alphanumeric join code.',
      'INVALID_JOIN_CODE'
    );
  }

  const cls = await getByIndex<PhysicsClass>(STORE_CLASSES, 'by_join_code', code);
  if (!cls) {
    throw new LocalAuthError(
      `No class found with join code "${code}". Check the code with your teacher.`,
      'CLASS_NOT_FOUND'
    );
  }

  const studentGrade = student.selectedClass ?? 6;
  if (studentGrade !== cls.classGrade) {
    throw new LocalAuthError(
      `This classroom is for Class ${cls.classGrade}, while your account is registered in Class ${studentGrade}. Students can only join Class ${studentGrade} classrooms.`,
      'GRADE_MISMATCH'
    );
  }

  const membershipId = `${cls.classId}_${student.uid}`;
  const existing = await getByKey<ClassMembership>(STORE_MEMBERSHIPS, membershipId);
  if (existing) {
    throw new LocalAuthError('You have already joined this class.', 'ALREADY_JOINED');
  }

  const now = new Date().toISOString();
  const membership: ClassMembership = {
    membershipId,
    classId: cls.classId,
    teacherId: cls.teacherId,
    teacherName: cls.teacherName,
    className: cls.className,
    classGrade: cls.classGrade,
    joinCode: cls.joinCode,
    studentId: student.uid,
    studentName: student.name,
    studentSelectedClass: studentGrade,
    joinedAt: now,
  };

  const notification: TeacherNotification = {
    notificationId: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    teacherId: cls.teacherId,
    classId: cls.classId,
    className: cls.className,
    classGrade: cls.classGrade,
    studentId: student.uid,
    studentName: student.name,
    type: 'student_joined',
    title: 'New student joined!',
    message: `${student.name} has joined your Class ${cls.classGrade}.`,
    joinedAt: now,
    createdAt: now,
    isRead: false,
  };

  const activityEvent: ClassActivityEvent = {
    activityId: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    teacherId: cls.teacherId,
    classId: cls.classId,
    className: cls.className,
    classGrade: cls.classGrade,
    studentId: student.uid,
    studentName: student.name,
    eventType: 'student_joined',
    summary: `${student.name} joined ${cls.className}`,
    createdAt: now,
  };

  const db = await openLocalDb();
  const tx = db.transaction(
    [STORE_MEMBERSHIPS, STORE_NOTIFICATIONS, STORE_ACTIVITY],
    'readwrite'
  );
  tx.objectStore(STORE_MEMBERSHIPS).add(membership);
  tx.objectStore(STORE_NOTIFICATIONS).add(notification);
  tx.objectStore(STORE_ACTIVITY).add(activityEvent);
  await idbTxComplete(tx);

  return membership;
}

export async function leaveLocalClass(
  studentUid: string,
  membershipId: string
): Promise<void> {
  await requireAuthoritativeAccount(studentUid, 'student');
  const existing = await getByKey<ClassMembership>(STORE_MEMBERSHIPS, membershipId);
  if (!existing || existing.studentId !== studentUid) {
    throw new LocalAuthError('Membership not found for this student.', 'FORBIDDEN_MEMBERSHIP');
  }
  const db = await openLocalDb();
  const tx = db.transaction(STORE_MEMBERSHIPS, 'readwrite');
  tx.objectStore(STORE_MEMBERSHIPS).delete(membershipId);
  await idbTxComplete(tx);
}

export async function getStudentProgressData(studentUid: string): Promise<{
  list: FirestoreStudentProgress[];
  map: StudentProgressMap;
}> {
  await requireAuthoritativeAccount(studentUid, 'student');
  const list = await getAllByIndex<FirestoreStudentProgress>(
    STORE_PROGRESS,
    'by_student',
    studentUid
  );
  list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const map: StudentProgressMap = {};
  for (const rec of list) {
    if (
      rec.completionStatus === 'completed' ||
      rec.recordedObservations.length > 0 ||
      typeof rec.quizScore === 'number'
    ) {
      map[rec.experimentId] = {
        experimentId: rec.experimentId,
        completedAt: rec.completedAt || rec.updatedAt,
        quizScore: rec.quizScore,
        quizTotal: rec.quizTotal,
        recordedObservations: rec.recordedObservations,
      };
    }
  }
  return { list, map };
}

export async function getStudentAssessmentHistory(
  studentUid: string
): Promise<AssessmentResultRecord[]> {
  await requireAuthoritativeAccount(studentUid, 'student');
  const items = await getAllByIndex<AssessmentResultRecord>(
    STORE_ASSESSMENTS,
    'by_student',
    studentUid
  );
  items.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return items;
}

export async function persistLocalStudentProgress(
  studentUid: string,
  experimentId: string,
  patch: {
    quizScore?: number;
    quizTotal?: number;
    observation?: string;
    markCompleted?: boolean;
  }
): Promise<void> {
  const student = await requireAuthoritativeAccount(studentUid, 'student');
  const catalogMeta = EXPERIMENT_CATALOGUE.find((e) => e.id === experimentId);
  const dynamicMeta = catalogMeta
    ? null
    : await getByKey<DynamicExperimentSpec>(STORE_GENERATED_EXPERIMENTS, experimentId);
  const expMeta = catalogMeta
    ? {
        id: catalogMeta.id,
        title: catalogMeta.title,
        classLevel: catalogMeta.classLevel,
        chapterId: catalogMeta.chapterId,
      }
    : dynamicMeta
      ? {
          id: dynamicMeta.id,
          title: dynamicMeta.title,
          classLevel: (dynamicMeta.studentClass >= 6 && dynamicMeta.studentClass <= 10
            ? dynamicMeta.studentClass
            : 9) as GradeClassLevel,
          chapterId: dynamicMeta.conceptId || dynamicMeta.id,
        }
      : null;
  if (!expMeta) return;

  const memberships = await getAllByIndex<ClassMembership>(
    STORE_MEMBERSHIPS,
    'by_student',
    student.uid
  );
  const matchingMembership =
    memberships.find((m) => m.classGrade === expMeta.classLevel) ?? memberships[0];
  const classId = matchingMembership?.classId || 'self';
  const teacherIds = Array.from(new Set(memberships.map((m) => m.teacherId))).slice(0, 20);

  const progressId = `${student.uid}_${experimentId}`;
  const existing = await getByKey<FirestoreStudentProgress>(STORE_PROGRESS, progressId);

  const existingObs = existing?.recordedObservations ?? [];
  const trimmedObs = patch.observation ? clampString(patch.observation, 500) : '';
  const nextObs =
    trimmedObs && !existingObs.includes(trimmedObs)
      ? [...existingObs, trimmedObs].slice(-20)
      : existingObs.slice(0, 20);

  const prevScore = existing?.quizScore;
  const nextScore =
    typeof patch.quizScore === 'number'
      ? typeof prevScore === 'number'
        ? Math.max(prevScore, patch.quizScore)
        : patch.quizScore
      : prevScore;
  const nextTotal =
    typeof patch.quizTotal === 'number' ? patch.quizTotal : existing?.quizTotal;

  const wasCompleted = existing?.completionStatus === 'completed';
  const isCompleted = wasCompleted || Boolean(patch.markCompleted);
  const now = new Date().toISOString();

  const updatedProgress: FirestoreStudentProgress = {
    progressId,
    studentId: student.uid,
    classId,
    classGrade: expMeta.classLevel,
    moduleId: expMeta.chapterId,
    experimentId: expMeta.id,
    experimentTitle: clampString(expMeta.title, 200),
    completionStatus: isCompleted ? 'completed' : 'in_progress',
    recordedObservations: nextObs,
    quizScore: nextScore,
    quizTotal: nextTotal,
    teacherIds,
    completedAt: isCompleted ? existing?.completedAt ?? now : undefined,
    updatedAt: now,
  };

  const hasQuizSubmission =
    typeof patch.quizScore === 'number' &&
    typeof patch.quizTotal === 'number' &&
    patch.quizTotal >= 1;

  const matchingMemberships = memberships.filter((m) => m.classGrade === expMeta.classLevel);
  const shouldWriteActivity =
    matchingMemberships.length > 0 && ((!wasCompleted && isCompleted) || hasQuizSubmission);

  const db = await openLocalDb();
  const stores: string[] = [STORE_PROGRESS];
  if (hasQuizSubmission) stores.push(STORE_ASSESSMENTS);
  if (shouldWriteActivity) stores.push(STORE_ACTIVITY);

  const tx = db.transaction(stores, 'readwrite');
  tx.objectStore(STORE_PROGRESS).put(updatedProgress);

  if (hasQuizSubmission && typeof patch.quizScore === 'number' && typeof patch.quizTotal === 'number') {
    const cleanScore = Math.min(patch.quizScore, patch.quizTotal);
    const resultRecord: AssessmentResultRecord = {
      resultId: `${student.uid}_${expMeta.id}_${Date.now()}`,
      studentId: student.uid,
      studentName: student.name,
      classId,
      classGrade: expMeta.classLevel,
      experimentId: expMeta.id,
      experimentTitle: clampString(expMeta.title, 200),
      score: cleanScore,
      totalQuestions: patch.quizTotal,
      teacherIds,
      completedAt: now,
    };
    tx.objectStore(STORE_ASSESSMENTS).put(resultRecord);

    if (shouldWriteActivity) {
      const actStore = tx.objectStore(STORE_ACTIVITY);
      for (const m of matchingMemberships) {
        const quizEvent: ClassActivityEvent = {
          activityId: `act_quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          teacherId: m.teacherId,
          classId: m.classId,
          className: m.className,
          classGrade: m.classGrade,
          studentId: student.uid,
          studentName: student.name,
          eventType: 'assessment_submitted',
          summary: `${student.name} scored ${cleanScore}/${patch.quizTotal} on "${clampString(expMeta.title, 120)}"`,
          experimentId: expMeta.id,
          experimentTitle: clampString(expMeta.title, 200),
          score: cleanScore,
          totalQuestions: patch.quizTotal,
          createdAt: now,
        };
        actStore.add(quizEvent);
      }
    }
  }

  if (shouldWriteActivity && !wasCompleted && isCompleted) {
    const actStore = tx.objectStore(STORE_ACTIVITY);
    for (const m of matchingMemberships) {
      const completionEvent: ClassActivityEvent = {
        activityId: `act_done_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        teacherId: m.teacherId,
        classId: m.classId,
        className: m.className,
        classGrade: m.classGrade,
        studentId: student.uid,
        studentName: student.name,
        eventType: 'experiment_completed',
        summary: `${student.name} completed "${clampString(expMeta.title, 120)}"`,
        experimentId: expMeta.id,
        experimentTitle: clampString(expMeta.title, 200),
        createdAt: now,
      };
      actStore.add(completionEvent);
    }
  }

  await idbTxComplete(tx);
}

// ---------------------------------------------------------------------------
// Per-Account Isolated Textbook Study Sessions
// ---------------------------------------------------------------------------

export async function getAccountStudySessions(ownerId: string): Promise<SavedStudySession[]> {
  const rows = await getAllByIndex<StoredStudySessionRecord>(
    STORE_STUDY_SESSIONS,
    'by_owner',
    ownerId
  );
  rows.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  return rows.map((r) => ({
    id: r.sessionId,
    savedAt: r.savedAt,
    fileName: r.fileName,
    analysis: r.analysis,
  }));
}

export async function saveAccountStudySession(
  ownerId: string,
  session: SavedStudySession
): Promise<void> {
  const db = await openLocalDb();
  const tx = db.transaction(STORE_STUDY_SESSIONS, 'readwrite');
  const record: StoredStudySessionRecord = {
    sessionId: `${ownerId}_${session.id}`,
    ownerId,
    savedAt: session.savedAt,
    fileName: session.fileName,
    analysis: session.analysis,
  };
  tx.objectStore(STORE_STUDY_SESSIONS).put(record);
  await idbTxComplete(tx);
}

export async function deleteAccountStudySession(
  ownerId: string,
  sessionId: string
): Promise<void> {
  const existing = await getByKey<StoredStudySessionRecord>(STORE_STUDY_SESSIONS, sessionId);
  if (!existing || existing.ownerId !== ownerId) return;
  const db = await openLocalDb();
  const tx = db.transaction(STORE_STUDY_SESSIONS, 'readwrite');
  tx.objectStore(STORE_STUDY_SESSIONS).delete(sessionId);
  await idbTxComplete(tx);
}

// ---------------------------------------------------------------------------
// Guided Classroom Learning Mode (Teacher Launch -> Student 6-Step Guided Flow)
// ---------------------------------------------------------------------------

export async function createGuidedClassActivity(
  teacherUid: string,
  input: {
    classId: string;
    experimentId: string;
    predictionPrompt: string;
    predictionOptions: string[];
    correctPredictionIndex: number;
    customObjective?: string;
  }
): Promise<GuidedClassroomActivity> {
  const teacher = await requireAuthoritativeAccount(teacherUid, 'teacher');
  const cls = await getByKey<PhysicsClass>(STORE_CLASSES, input.classId);
  if (!cls || cls.teacherId !== teacher.uid) {
    throw new LocalAuthError('You can only launch activities in your own classes.', 'FORBIDDEN_CLASS');
  }
  const exp = EXPERIMENT_CATALOGUE.find((e) => e.id === input.experimentId);
  if (!exp) {
    throw new LocalAuthError('Selected physics experiment was not found.', 'INVALID_EXPERIMENT');
  }

  const prompt = clampString(input.predictionPrompt, 280);
  const options = input.predictionOptions.map((o) => clampString(o, 160)).filter(Boolean);
  if (prompt.length < 5 || options.length < 2) {
    throw new LocalAuthError(
      'Provide a prediction question and at least 2 options.',
      'INVALID_PREDICTION'
    );
  }

  const now = new Date().toISOString();
  const activity: GuidedClassroomActivity = {
    activityId: `gact_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    classId: cls.classId,
    className: cls.className,
    classGrade: cls.classGrade,
    teacherId: teacher.uid,
    teacherName: teacher.name,
    experimentId: exp.id,
    experimentTitle: exp.title,
    simulationEngineId: exp.simulationEngineId || 'bar_magnet',
    customObjective: input.customObjective ? clampString(input.customObjective, 300) : undefined,
    predictionPrompt: prompt,
    predictionOptions: options,
    correctPredictionIndex: Math.max(0, Math.min(options.length - 1, input.correctPredictionIndex)),
    status: 'active',
    createdAt: now,
  };

  const db = await openLocalDb();
  const tx = db.transaction(STORE_GUIDED_ACTIVITIES, 'readwrite');
  tx.objectStore(STORE_GUIDED_ACTIVITIES).add(activity);
  await idbTxComplete(tx);
  return activity;
}

export async function endGuidedClassActivity(
  teacherUid: string,
  activityId: string
): Promise<void> {
  const teacher = await requireAuthoritativeAccount(teacherUid, 'teacher');
  const existing = await getByKey<GuidedClassroomActivity>(STORE_GUIDED_ACTIVITIES, activityId);
  if (!existing || existing.teacherId !== teacher.uid) {
    throw new LocalAuthError('Guided activity does not belong to this teacher.', 'FORBIDDEN_ACTIVITY');
  }
  const db = await openLocalDb();
  const tx = db.transaction(STORE_GUIDED_ACTIVITIES, 'readwrite');
  tx.objectStore(STORE_GUIDED_ACTIVITIES).put({
    ...existing,
    status: 'ended',
    endedAt: new Date().toISOString(),
  });
  await idbTxComplete(tx);
}

export async function getTeacherGuidedActivities(teacherUid: string): Promise<{
  activities: GuidedClassroomActivity[];
  completions: GuidedActivityCompletion[];
}> {
  await requireAuthoritativeAccount(teacherUid, 'teacher');
  const [activities, completions] = await Promise.all([
    getAllByIndex<GuidedClassroomActivity>(STORE_GUIDED_ACTIVITIES, 'by_teacher', teacherUid),
    getAllByIndex<GuidedActivityCompletion>(STORE_GUIDED_COMPLETIONS, 'by_teacher', teacherUid),
  ]);
  activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  completions.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return { activities, completions };
}

export async function getStudentGuidedActivitiesAndCompletions(studentUid: string): Promise<{
  activities: GuidedClassroomActivity[];
  completions: GuidedActivityCompletion[];
}> {
  await requireAuthoritativeAccount(studentUid, 'student');
  const [memberships, completions] = await Promise.all([
    getAllByIndex<ClassMembership>(STORE_MEMBERSHIPS, 'by_student', studentUid),
    getAllByIndex<GuidedActivityCompletion>(STORE_GUIDED_COMPLETIONS, 'by_student', studentUid),
  ]);
  if (memberships.length === 0) {
    return { activities: [], completions };
  }
  const byClass = await Promise.all(
    memberships.map((m) =>
      getAllByIndex<GuidedClassroomActivity>(STORE_GUIDED_ACTIVITIES, 'by_class', m.classId)
    )
  );
  const activities = byClass
    .flat()
    .filter((a) => a.status === 'active')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  completions.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return { activities, completions };
}

export async function submitStudentGuidedCompletion(
  studentUid: string,
  activityId: string,
  payload: {
    selectedPredictionIndex: number;
    quizScore: number;
    quizTotal: number;
    summaryNotes?: string;
  }
): Promise<GuidedActivityCompletion> {
  const student = await requireAuthoritativeAccount(studentUid, 'student');
  const activity = await getByKey<GuidedClassroomActivity>(STORE_GUIDED_ACTIVITIES, activityId);
  if (!activity) {
    throw new LocalAuthError('Guided classroom activity not found.', 'ACTIVITY_NOT_FOUND');
  }

  const membership = await getByKey<ClassMembership>(
    STORE_MEMBERSHIPS,
    `${activity.classId}_${student.uid}`
  );
  if (!membership) {
    throw new LocalAuthError('You are not enrolled in this classroom.', 'FORBIDDEN_MEMBERSHIP');
  }

  const now = new Date().toISOString();
  const completion: GuidedActivityCompletion = {
    completionId: `${activity.activityId}_${student.uid}`,
    activityId: activity.activityId,
    classId: activity.classId,
    teacherId: activity.teacherId,
    studentId: student.uid,
    studentName: student.name,
    experimentId: activity.experimentId,
    selectedPredictionIndex: payload.selectedPredictionIndex,
    predictionMatched: payload.selectedPredictionIndex === activity.correctPredictionIndex,
    quizScore: payload.quizScore,
    quizTotal: payload.quizTotal,
    summaryNotes: payload.summaryNotes ? clampString(payload.summaryNotes, 400) : undefined,
    completedAt: now,
  };

  const actEvent: ClassActivityEvent = {
    activityId: `act_guided_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    teacherId: activity.teacherId,
    classId: activity.classId,
    className: activity.className,
    classGrade: activity.classGrade,
    studentId: student.uid,
    studentName: student.name,
    eventType: 'experiment_completed',
    summary: `${student.name} finished Guided Lab "${clampString(activity.experimentTitle, 90)}" (${payload.quizScore}/${payload.quizTotal})`,
    experimentId: activity.experimentId,
    experimentTitle: activity.experimentTitle,
    score: payload.quizScore,
    totalQuestions: payload.quizTotal,
    createdAt: now,
  };

  const db = await openLocalDb();
  const tx = db.transaction([STORE_GUIDED_COMPLETIONS, STORE_ACTIVITY], 'readwrite');
  tx.objectStore(STORE_GUIDED_COMPLETIONS).put(completion);
  tx.objectStore(STORE_ACTIVITY).add(actEvent);
  await idbTxComplete(tx);

  await persistLocalStudentProgress(student.uid, activity.experimentId, {
    quizScore: payload.quizScore,
    quizTotal: payload.quizTotal,
    observation: payload.summaryNotes,
    markCompleted: true,
  });

  return completion;
}

export async function saveLocalGeneratedExperiment(
  spec: DynamicExperimentSpec,
  ownerUid = 'guest'
): Promise<DynamicExperimentSpec> {
  const db = await openLocalDb();
  const record: DynamicExperimentSpec = {
    ...spec,
    ownerUid: ownerUid || spec.ownerUid || 'guest',
    updatedAt: Date.now(),
  };
  const tx = db.transaction(STORE_GENERATED_EXPERIMENTS, 'readwrite');
  tx.objectStore(STORE_GENERATED_EXPERIMENTS).put(record);
  await idbTxComplete(tx);
  return record;
}

export async function fetchLocalGeneratedExperiments(
  ownerUid?: string | null
): Promise<DynamicExperimentSpec[]> {
  const db = await openLocalDb();
  const tx = db.transaction(STORE_GENERATED_EXPERIMENTS, 'readonly');
  const all = await idbRequest<DynamicExperimentSpec[]>(
    tx.objectStore(STORE_GENERATED_EXPERIMENTS).getAll()
  );
  const filtered = ownerUid
    ? all.filter((item) => !item.ownerUid || item.ownerUid === ownerUid || item.ownerUid === 'guest')
    : all;
  return filtered.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
}

export async function deleteLocalGeneratedExperiment(experimentId: string): Promise<void> {
  const db = await openLocalDb();
  const tx = db.transaction(STORE_GENERATED_EXPERIMENTS, 'readwrite');
  tx.objectStore(STORE_GENERATED_EXPERIMENTS).delete(experimentId);
  await idbTxComplete(tx);
}


