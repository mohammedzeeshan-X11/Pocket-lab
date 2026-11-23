import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  AssessmentResultRecord,
  ClassMembership,
  FirestoreStudentProgress,
  GradeClassLevel,
  PhysicsClass,
  StudentProgressMap,
  UserProfile,
  UserRole,
} from '../types/physics';
import { EXPERIMENT_CATALOGUE } from '../data/ncertCurriculum';
import {
  auth,
  db,
  firebaseProjectId,
  handleFirestoreError,
  isFirebaseConfigured,
  OperationType,
} from './firebaseClient';

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_JOIN_CODE_REGEX = /^[A-Z0-9]{6,12}$/;

export class PortalAuthError extends Error {
  code: string;
  requiresEmailProviderSetup: boolean;

  constructor(message: string, code = 'AUTH_ERROR', requiresEmailProviderSetup = false) {
    super(message);
    this.name = 'PortalAuthError';
    this.code = code;
    this.requiresEmailProviderSetup = requiresEmailProviderSetup;
  }
}

function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

function normalizeJoinCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function toIsoTimestamp(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return new Date().toISOString();
}

function isValidGrade(val: unknown): val is GradeClassLevel {
  return typeof val === 'number' && Number.isInteger(val) && val >= 6 && val <= 10;
}

function mapFirebaseAuthError(err: unknown): PortalAuthError {
  const errObj = err as { code?: string; message?: string };
  const code = String(errObj?.code || '');
  const raw = String(errObj?.message || 'Authentication failed.');

  switch (code) {
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return new PortalAuthError(
        `Email/Password sign-in is not yet enabled in Firebase Console for project "${firebaseProjectId}". Enable it under Authentication > Sign-in method, or use Continue with Google.`,
        code,
        true
      );
    case 'auth/email-already-in-use':
      return new PortalAuthError(
        'An account with this email already exists. Please sign in instead.',
        code
      );
    case 'auth/invalid-email':
      return new PortalAuthError('Please enter a valid email address.', code);
    case 'auth/weak-password':
      return new PortalAuthError(
        'Password is too weak. Use at least 6 characters.',
        code
      );
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new PortalAuthError(
        'Invalid email or password. Please check your credentials and try again.',
        code
      );
    case 'auth/too-many-requests':
      return new PortalAuthError(
        'Too many unsuccessful attempts. Please wait a moment before trying again.',
        code
      );
    case 'auth/popup-closed-by-user':
      return new PortalAuthError('Google sign-in popup was closed before finishing.', code);
    case 'auth/network-request-failed':
      return new PortalAuthError(
        'Network error while connecting to Firebase Authentication.',
        code
      );
    default:
      return new PortalAuthError(raw, code || 'AUTH_ERROR');
  }
}

function requireFirebase(): { auth: NonNullable<typeof auth>; db: NonNullable<typeof db> } {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new PortalAuthError(
      'Firebase is not configured. Please provision Firebase and verify firebase-applet-config.json.',
      'FIREBASE_NOT_CONFIGURED'
    );
  }
  return { auth, db };
}

function parseUserProfile(data: Record<string, unknown>, uid: string): UserProfile | null {
  const role = data.role === 'teacher' ? 'teacher' : data.role === 'student' ? 'student' : null;
  if (!role) return null;
  const selectedClass = isValidGrade(data.selectedClass) ? data.selectedClass : undefined;
  return {
    uid: String(data.uid || uid),
    name: String(data.name || 'Pocket Lab User'),
    email: String(data.email || ''),
    role,
    selectedClass: role === 'student' ? selectedClass ?? 6 : selectedClass,
    schoolOrSubject:
      typeof data.schoolOrSubject === 'string' ? data.schoolOrSubject : undefined,
    createdAt: toIsoTimestamp(data.createdAt),
    updatedAt: toIsoTimestamp(data.updatedAt),
  };
}

export async function fetchAuthoritativeUserProfile(uid: string): Promise<UserProfile | null> {
  const { db: firestore } = requireFirebase();
  const path = `users/${uid}`;
  try {
    let snap;
    try {
      snap = await getDocFromServer(doc(firestore, 'users', uid));
    } catch {
      snap = await getDoc(doc(firestore, 'users', uid));
    }
    if (!snap.exists()) return null;
    return parseUserProfile(snap.data() as Record<string, unknown>, uid);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function registerUserWithEmail(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  selectedClass?: GradeClassLevel;
  schoolOrSubject?: string;
}): Promise<UserProfile> {
  const { auth: firebaseAuth, db: firestore } = requireFirebase();

  const cleanName = clampString(params.name, 100);
  const cleanEmail = clampString(params.email, 254).toLowerCase();
  const cleanSchool = params.schoolOrSubject
    ? clampString(params.schoolOrSubject, 120)
    : undefined;

  if (cleanName.length < 1) {
    throw new PortalAuthError('Please enter your full name.', 'INVALID_NAME');
  }
  if (!cleanEmail.includes('@') || cleanEmail.length < 3) {
    throw new PortalAuthError('Please enter a valid email address.', 'INVALID_EMAIL');
  }
  if (params.password.length < 6) {
    throw new PortalAuthError('Password must be at least 6 characters long.', 'WEAK_PASSWORD');
  }

  let credential;
  try {
    credential = await createUserWithEmailAndPassword(firebaseAuth, cleanEmail, params.password);
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }

  const user = credential.user;
  try {
    await updateProfile(user, { displayName: cleanName });
  } catch {
    // Non-fatal
  }

  const profilePayload: Record<string, unknown> = {
    uid: user.uid,
    name: cleanName,
    email: cleanEmail,
    role: params.role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (params.role === 'student') {
    profilePayload.selectedClass = isValidGrade(params.selectedClass) ? params.selectedClass : 6;
  }
  if (cleanSchool) {
    profilePayload.schoolOrSubject = cleanSchool;
  }

  try {
    await setDoc(doc(firestore, 'users', user.uid), profilePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
  }

  const created = await fetchAuthoritativeUserProfile(user.uid);
  if (!created) {
    throw new PortalAuthError('Profile created but could not be verified.', 'PROFILE_READ_FAILED');
  }
  return created;
}

export async function loginUserWithEmail(params: {
  email: string;
  password: string;
}): Promise<UserProfile> {
  const { auth: firebaseAuth } = requireFirebase();
  const cleanEmail = clampString(params.email, 254).toLowerCase();

  let credential;
  try {
    credential = await signInWithEmailAndPassword(firebaseAuth, cleanEmail, params.password);
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }

  const profile = await fetchAuthoritativeUserProfile(credential.user.uid);
  if (!profile) {
    throw new PortalAuthError(
      'Your account record was not found. Please complete registration.',
      'PROFILE_MISSING'
    );
  }
  return profile;
}

export async function loginWithGooglePortal(): Promise<{
  user: User;
  profile: UserProfile | null;
}> {
  const { auth: firebaseAuth } = requireFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let credential;
  try {
    credential = await signInWithPopup(firebaseAuth, provider);
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }

  const profile = await fetchAuthoritativeUserProfile(credential.user.uid);
  return { user: credential.user, profile };
}

export async function createProfileForGoogleUser(params: {
  user: User;
  name: string;
  role: UserRole;
  selectedClass?: GradeClassLevel;
  schoolOrSubject?: string;
}): Promise<UserProfile> {
  const { db: firestore } = requireFirebase();

  const cleanName = clampString(params.name || params.user.displayName || 'Pocket Lab User', 100);
  const cleanEmail = clampString(params.user.email || '', 254).toLowerCase();
  const cleanSchool = params.schoolOrSubject
    ? clampString(params.schoolOrSubject, 120)
    : undefined;

  const existing = await fetchAuthoritativeUserProfile(params.user.uid);
  if (existing) return existing;

  const payload: Record<string, unknown> = {
    uid: params.user.uid,
    name: cleanName,
    email: cleanEmail,
    role: params.role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (params.role === 'student') {
    payload.selectedClass = isValidGrade(params.selectedClass) ? params.selectedClass : 6;
  }
  if (cleanSchool) {
    payload.schoolOrSubject = cleanSchool;
  }

  try {
    await setDoc(doc(firestore, 'users', params.user.uid), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${params.user.uid}`);
  }

  const created = await fetchAuthoritativeUserProfile(params.user.uid);
  if (!created) {
    throw new PortalAuthError('Could not load created profile.', 'PROFILE_READ_FAILED');
  }
  return created;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { auth: firebaseAuth } = requireFirebase();
  try {
    await sendPasswordResetEmail(firebaseAuth, clampString(email, 254));
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }
}

export async function logoutPortalUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

// ---------------------------------------------------------------------------
// Profile Updates
// ---------------------------------------------------------------------------

export async function updateUserProfileDetails(
  profile: UserProfile,
  patch: {
    name?: string;
    selectedClass?: GradeClassLevel;
    schoolOrSubject?: string;
  },
  studentMemberships: ClassMembership[] = []
): Promise<UserProfile> {
  const { db: firestore } = requireFirebase();
  const nextName = patch.name !== undefined ? clampString(patch.name, 100) : profile.name;
  if (nextName.length < 1) {
    throw new Error('Name cannot be empty.');
  }

  const updatePayload: Record<string, unknown> = {
    name: nextName,
    updatedAt: serverTimestamp(),
  };

  if (profile.role === 'student') {
    updatePayload.selectedClass = isValidGrade(patch.selectedClass)
      ? patch.selectedClass
      : profile.selectedClass ?? 6;
  }

  if (patch.schoolOrSubject !== undefined) {
    const cleanSchool = clampString(patch.schoolOrSubject, 120);
    if (cleanSchool.length > 0) {
      updatePayload.schoolOrSubject = cleanSchool;
    }
  }

  const userPath = `users/${profile.uid}`;
  try {
    await updateDoc(doc(firestore, 'users', profile.uid), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }

  // Keep studentName / studentSelectedClass synchronized in joined class memberships
  if (profile.role === 'student' && studentMemberships.length > 0) {
    const nextClass = isValidGrade(patch.selectedClass)
      ? patch.selectedClass
      : profile.selectedClass ?? 6;
    const batch = writeBatch(firestore);
    for (const m of studentMemberships) {
      batch.update(doc(firestore, 'classMemberships', m.membershipId), {
        studentName: nextName,
        studentSelectedClass: nextClass,
      });
    }
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'classMemberships');
    }
  }

  const refreshed = await fetchAuthoritativeUserProfile(profile.uid);
  return refreshed ?? {
    ...profile,
    name: nextName,
    selectedClass:
      profile.role === 'student'
        ? (patch.selectedClass ?? profile.selectedClass ?? 6)
        : profile.selectedClass,
    schoolOrSubject: patch.schoolOrSubject ?? profile.schoolOrSubject,
    updatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Teacher Class Management
// ---------------------------------------------------------------------------

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PHY${suffix}`;
}

export async function createTeacherClass(
  teacher: UserProfile,
  input: {
    className: string;
    classGrade: GradeClassLevel;
    description?: string;
  }
): Promise<PhysicsClass> {
  const { db: firestore } = requireFirebase();
  if (teacher.role !== 'teacher') {
    throw new Error('Only teacher accounts can create classes.');
  }

  const cleanName = clampString(input.className, 100);
  if (cleanName.length < 2) {
    throw new Error('Class name must be at least 2 characters.');
  }
  if (!isValidGrade(input.classGrade)) {
    throw new Error('Class grade must be between 6 and 10.');
  }

  const cleanDescription = input.description ? clampString(input.description, 300) : '';
  const classId = `cls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const joinCode = generateJoinCode();

  if (!VALID_ID_REGEX.test(classId) || !VALID_JOIN_CODE_REGEX.test(joinCode)) {
    throw new Error('Generated invalid class identifier.');
  }

  const batch = writeBatch(firestore);
  const classData: Record<string, unknown> = {
    classId,
    teacherId: teacher.uid,
    teacherName: clampString(teacher.name, 100),
    className: cleanName,
    classGrade: input.classGrade,
    joinCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (cleanDescription) {
    classData.description = cleanDescription;
  }

  batch.set(doc(firestore, 'classes', classId), classData);
  batch.set(doc(firestore, 'classJoinCodes', joinCode), {
    joinCode,
    classId,
    teacherId: teacher.uid,
    teacherName: clampString(teacher.name, 100),
    className: cleanName,
    classGrade: input.classGrade,
    createdAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `classes/${classId}`);
  }

  return {
    classId,
    teacherId: teacher.uid,
    teacherName: teacher.name,
    className: cleanName,
    classGrade: input.classGrade,
    joinCode,
    description: cleanDescription || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateTeacherClass(
  teacher: UserProfile,
  existingClass: PhysicsClass,
  patch: {
    className: string;
    classGrade: GradeClassLevel;
    description?: string;
  }
): Promise<void> {
  const { db: firestore } = requireFirebase();
  if (teacher.role !== 'teacher' || existingClass.teacherId !== teacher.uid) {
    throw new Error('Unauthorized class modification.');
  }

  const cleanName = clampString(patch.className, 100);
  if (cleanName.length < 2) {
    throw new Error('Class name must be at least 2 characters.');
  }

  const cleanDescription = patch.description ? clampString(patch.description, 300) : '';
  const batch = writeBatch(firestore);
  batch.update(doc(firestore, 'classes', existingClass.classId), {
    className: cleanName,
    classGrade: patch.classGrade,
    description: cleanDescription,
    teacherName: clampString(teacher.name, 100),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(firestore, 'classJoinCodes', existingClass.joinCode), {
    className: cleanName,
    classGrade: patch.classGrade,
    teacherName: clampString(teacher.name, 100),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `classes/${existingClass.classId}`);
  }
}

export async function deleteTeacherClass(
  teacher: UserProfile,
  cls: PhysicsClass,
  memberships: ClassMembership[]
): Promise<void> {
  const { db: firestore } = requireFirebase();
  if (teacher.role !== 'teacher' || cls.teacherId !== teacher.uid) {
    throw new Error('Unauthorized class deletion.');
  }

  const batch = writeBatch(firestore);
  batch.delete(doc(firestore, 'classes', cls.classId));
  batch.delete(doc(firestore, 'classJoinCodes', cls.joinCode));
  for (const m of memberships.filter((item) => item.classId === cls.classId)) {
    batch.delete(doc(firestore, 'classMemberships', m.membershipId));
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `classes/${cls.classId}`);
  }
}

// ---------------------------------------------------------------------------
// Student Class Joining & Progress Synchronization
// ---------------------------------------------------------------------------

export async function joinClassWithCode(
  student: UserProfile,
  rawJoinCode: string
): Promise<ClassMembership> {
  const { db: firestore } = requireFirebase();
  if (student.role !== 'student') {
    throw new Error('Only student accounts can join classes with a join code.');
  }

  const code = normalizeJoinCode(rawJoinCode);
  if (!VALID_JOIN_CODE_REGEX.test(code)) {
    throw new Error('Please enter a valid 6–12 character alphanumeric class join code.');
  }

  let joinSnap;
  try {
    joinSnap = await getDocFromServer(doc(firestore, 'classJoinCodes', code));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `classJoinCodes/${code}`);
  }

  if (!joinSnap.exists()) {
    throw new Error(`No class found for join code "${code}". Check the code with your teacher.`);
  }

  const joinData = joinSnap.data() as Record<string, unknown>;
  const classId = String(joinData.classId || '');
  const teacherId = String(joinData.teacherId || '');
  const membershipId = `${classId}_${student.uid}`;

  let existingMembership;
  try {
    existingMembership = await getDoc(doc(firestore, 'classMemberships', membershipId));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `classMemberships/${membershipId}`);
  }

  if (existingMembership.exists()) {
    throw new Error('You have already joined this class.');
  }

  const membershipPayload = {
    membershipId,
    classId,
    teacherId,
    teacherName: clampString(String(joinData.teacherName || 'Teacher'), 100),
    className: clampString(String(joinData.className || 'Physics Class'), 100),
    classGrade: Number(joinData.classGrade) as GradeClassLevel,
    joinCode: code,
    studentId: student.uid,
    studentName: clampString(student.name, 100),
    studentSelectedClass: student.selectedClass ?? 6,
    joinedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(firestore, 'classMemberships', membershipId), membershipPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `classMemberships/${membershipId}`);
  }

  // Share student's existing progress and assessment records with this teacher
  try {
    const [progSnap, assessSnap] = await Promise.all([
      getDocs(query(collection(firestore, 'studentProgress'), where('studentId', '==', student.uid))),
      getDocs(query(collection(firestore, 'assessmentResults'), where('studentId', '==', student.uid))),
    ]);

    if (!progSnap.empty || !assessSnap.empty) {
      const batch = writeBatch(firestore);
      progSnap.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          teacherIds: arrayUnion(teacherId),
          updatedAt: serverTimestamp(),
        });
      });
      assessSnap.forEach((docSnap) => {
        batch.update(docSnap.ref, {
          teacherIds: arrayUnion(teacherId),
        });
      });
      await batch.commit();
    }
  } catch (error) {
    // Non-blocking sync warning
    console.warn('Could not retroactively attach teacherId to prior progress:', error);
  }

  return {
    ...membershipPayload,
    joinedAt: new Date().toISOString(),
  };
}

export async function leaveJoinedClass(membershipId: string): Promise<void> {
  const { db: firestore } = requireFirebase();
  try {
    const batch = writeBatch(firestore);
    batch.delete(doc(firestore, 'classMemberships', membershipId));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `classMemberships/${membershipId}`);
  }
}

export async function persistStudentExperimentProgress(params: {
  student: UserProfile;
  experimentId: string;
  memberships: ClassMembership[];
  patch: {
    quizScore?: number;
    quizTotal?: number;
    observation?: string;
    markCompleted?: boolean;
  };
}): Promise<void> {
  const { db: firestore } = requireFirebase();
  if (params.student.role !== 'student') return;

  const expMeta = EXPERIMENT_CATALOGUE.find((e) => e.id === params.experimentId);
  if (!expMeta || !VALID_ID_REGEX.test(params.experimentId)) return;

  const progressId = `${params.student.uid}_${params.experimentId}`;
  const progressRef = doc(firestore, 'studentProgress', progressId);

  let existingData: Record<string, unknown> | null = null;
  try {
    const snap = await getDoc(progressRef);
    if (snap.exists()) {
      existingData = snap.data() as Record<string, unknown>;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `studentProgress/${progressId}`);
  }

  const teacherIds = Array.from(
    new Set(params.memberships.map((m) => m.teacherId).filter((id) => VALID_ID_REGEX.test(id)))
  ).slice(0, 20);

  const matchingMembership =
    params.memberships.find((m) => m.classGrade === expMeta.classLevel) ?? params.memberships[0];
  const classId = matchingMembership?.classId || 'self';

  const existingObs = Array.isArray(existingData?.recordedObservations)
    ? existingData.recordedObservations.filter((x): x is string => typeof x === 'string')
    : [];
  const trimmedObs = params.patch.observation ? clampString(params.patch.observation, 500) : '';
  const nextObs =
    trimmedObs && !existingObs.includes(trimmedObs)
      ? [...existingObs, trimmedObs].slice(-20)
      : existingObs.slice(0, 20);

  const prevScore =
    typeof existingData?.quizScore === 'number' ? existingData.quizScore : undefined;
  const nextScore =
    typeof params.patch.quizScore === 'number'
      ? typeof prevScore === 'number'
        ? Math.max(prevScore, params.patch.quizScore)
        : params.patch.quizScore
      : prevScore;
  const nextTotal =
    typeof params.patch.quizTotal === 'number'
      ? params.patch.quizTotal
      : typeof existingData?.quizTotal === 'number'
        ? existingData.quizTotal
        : undefined;

  const isAlreadyCompleted = existingData?.completionStatus === 'completed';
  const completionStatus: 'in_progress' | 'completed' =
    isAlreadyCompleted || params.patch.markCompleted ? 'completed' : 'in_progress';

  const payload: Record<string, unknown> = {
    progressId,
    studentId: params.student.uid,
    classId,
    classGrade: expMeta.classLevel,
    moduleId: expMeta.chapterId,
    experimentId: expMeta.id,
    experimentTitle: clampString(expMeta.title, 200),
    completionStatus,
    recordedObservations: nextObs,
    teacherIds,
    updatedAt: serverTimestamp(),
  };

  if (typeof nextScore === 'number' && typeof nextTotal === 'number' && nextTotal >= 1) {
    payload.quizScore = nextScore;
    payload.quizTotal = nextTotal;
  }

  if (completionStatus === 'completed') {
    payload.completedAt = existingData?.completedAt ?? serverTimestamp();
  }

  try {
    await setDoc(progressRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `studentProgress/${progressId}`);
  }

  // If this update includes a quiz submission, append an immutable assessmentResults entry
  if (
    typeof params.patch.quizScore === 'number' &&
    typeof params.patch.quizTotal === 'number' &&
    params.patch.quizTotal >= 1
  ) {
    const resultId = `${params.student.uid}_${params.experimentId}_${Date.now()}`;
    try {
      await setDoc(doc(firestore, 'assessmentResults', resultId), {
        resultId,
        studentId: params.student.uid,
        studentName: clampString(params.student.name, 100),
        classId,
        classGrade: expMeta.classLevel,
        experimentId: expMeta.id,
        experimentTitle: clampString(expMeta.title, 200),
        score: Math.min(params.patch.quizScore, params.patch.quizTotal),
        totalQuestions: params.patch.quizTotal,
        teacherIds,
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `assessmentResults/${resultId}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Real-Time Subscriptions (Only attached when auth & role are ready)
// ---------------------------------------------------------------------------

export function subscribeStudentMemberships(
  studentId: string,
  onData: (memberships: ClassMembership[]) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const path = 'classMemberships';
  const q = query(collection(firestore, path), where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snap) => {
      const items: ClassMembership[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          membershipId: String(data.membershipId || d.id),
          classId: String(data.classId || ''),
          teacherId: String(data.teacherId || ''),
          teacherName: String(data.teacherName || 'Teacher'),
          className: String(data.className || ''),
          classGrade: Number(data.classGrade || 6) as GradeClassLevel,
          joinCode: String(data.joinCode || ''),
          studentId: String(data.studentId || studentId),
          studentName: String(data.studentName || ''),
          studentSelectedClass: Number(data.studentSelectedClass || 6) as GradeClassLevel,
          joinedAt: toIsoTimestamp(data.joinedAt),
        };
      });
      items.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeStudentProgress(
  studentId: string,
  onData: (records: FirestoreStudentProgress[], asMap: StudentProgressMap) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const path = 'studentProgress';
  const q = query(collection(firestore, path), where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snap) => {
      const list: FirestoreStudentProgress[] = [];
      const map: StudentProgressMap = {};
      snap.docs.forEach((d) => {
        const data = d.data() as Record<string, unknown>;
        const rec: FirestoreStudentProgress = {
          progressId: String(data.progressId || d.id),
          studentId: String(data.studentId || studentId),
          classId: String(data.classId || 'self'),
          classGrade: Number(data.classGrade || 6) as GradeClassLevel,
          moduleId: String(data.moduleId || ''),
          experimentId: String(data.experimentId || ''),
          experimentTitle: String(data.experimentTitle || ''),
          completionStatus: data.completionStatus === 'completed' ? 'completed' : 'in_progress',
          recordedObservations: Array.isArray(data.recordedObservations)
            ? data.recordedObservations.filter((x): x is string => typeof x === 'string')
            : [],
          quizScore: typeof data.quizScore === 'number' ? data.quizScore : undefined,
          quizTotal: typeof data.quizTotal === 'number' ? data.quizTotal : undefined,
          teacherIds: Array.isArray(data.teacherIds)
            ? data.teacherIds.filter((x): x is string => typeof x === 'string')
            : [],
          completedAt: data.completedAt ? toIsoTimestamp(data.completedAt) : undefined,
          updatedAt: toIsoTimestamp(data.updatedAt),
        };
        list.push(rec);
        if (rec.completionStatus === 'completed' || rec.recordedObservations.length > 0 || typeof rec.quizScore === 'number') {
          map[rec.experimentId] = {
            experimentId: rec.experimentId,
            completedAt: rec.completedAt || rec.updatedAt,
            quizScore: rec.quizScore,
            quizTotal: rec.quizTotal,
            recordedObservations: rec.recordedObservations,
          };
        }
      });
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onData(list, map);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeStudentAssessments(
  studentId: string,
  onData: (results: AssessmentResultRecord[]) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const path = 'assessmentResults';
  const q = query(collection(firestore, path), where('studentId', '==', studentId));
  return onSnapshot(
    q,
    (snap) => {
      const items: AssessmentResultRecord[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          resultId: String(data.resultId || d.id),
          studentId: String(data.studentId || studentId),
          studentName: String(data.studentName || ''),
          classId: String(data.classId || 'self'),
          classGrade: Number(data.classGrade || 6) as GradeClassLevel,
          experimentId: String(data.experimentId || ''),
          experimentTitle: String(data.experimentTitle || ''),
          score: Number(data.score || 0),
          totalQuestions: Number(data.totalQuestions || 1),
          teacherIds: Array.isArray(data.teacherIds)
            ? data.teacherIds.filter((x): x is string => typeof x === 'string')
            : [],
          completedAt: toIsoTimestamp(data.completedAt),
        };
      });
      items.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeTeacherClasses(
  teacherId: string,
  onData: (classes: PhysicsClass[]) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const path = 'classes';
  const q = query(collection(firestore, path), where('teacherId', '==', teacherId));
  return onSnapshot(
    q,
    (snap) => {
      const items: PhysicsClass[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          classId: String(data.classId || d.id),
          teacherId: String(data.teacherId || teacherId),
          teacherName: String(data.teacherName || ''),
          className: String(data.className || ''),
          classGrade: Number(data.classGrade || 6) as GradeClassLevel,
          joinCode: String(data.joinCode || ''),
          description: typeof data.description === 'string' ? data.description : undefined,
          createdAt: toIsoTimestamp(data.createdAt),
          updatedAt: toIsoTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeTeacherMemberships(
  teacherId: string,
  onData: (memberships: ClassMembership[]) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const path = 'classMemberships';
  const q = query(collection(firestore, path), where('teacherId', '==', teacherId));
  return onSnapshot(
    q,
    (snap) => {
      const items: ClassMembership[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          membershipId: String(data.membershipId || d.id),
          classId: String(data.classId || ''),
          teacherId: String(data.teacherId || teacherId),
          teacherName: String(data.teacherName || ''),
          className: String(data.className || ''),
          classGrade: Number(data.classGrade || 6) as GradeClassLevel,
          joinCode: String(data.joinCode || ''),
          studentId: String(data.studentId || ''),
          studentName: String(data.studentName || 'Student'),
          studentSelectedClass: Number(data.studentSelectedClass || 6) as GradeClassLevel,
          joinedAt: toIsoTimestamp(data.joinedAt),
        };
      });
      items.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeTeacherStudentProgress(
  teacherId: string,
  onData: (records: FirestoreStudentProgress[]) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const path = 'studentProgress';
  const q = query(collection(firestore, path), where('teacherIds', 'array-contains', teacherId));
  return onSnapshot(
    q,
    (snap) => {
      const items: FirestoreStudentProgress[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          progressId: String(data.progressId || d.id),
          studentId: String(data.studentId || ''),
          classId: String(data.classId || 'self'),
          classGrade: Number(data.classGrade || 6) as GradeClassLevel,
          moduleId: String(data.moduleId || ''),
          experimentId: String(data.experimentId || ''),
          experimentTitle: String(data.experimentTitle || ''),
          completionStatus: data.completionStatus === 'completed' ? 'completed' : 'in_progress',
          recordedObservations: Array.isArray(data.recordedObservations)
            ? data.recordedObservations.filter((x): x is string => typeof x === 'string')
            : [],
          quizScore: typeof data.quizScore === 'number' ? data.quizScore : undefined,
          quizTotal: typeof data.quizTotal === 'number' ? data.quizTotal : undefined,
          teacherIds: Array.isArray(data.teacherIds)
            ? data.teacherIds.filter((x): x is string => typeof x === 'string')
            : [],
          completedAt: data.completedAt ? toIsoTimestamp(data.completedAt) : undefined,
          updatedAt: toIsoTimestamp(data.updatedAt),
        };
      });
      items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeTeacherAssessments(
  teacherId: string,
  onData: (results: AssessmentResultRecord[]) => void
): Unsubscribe {
  const { db: firestore } = requireFirebase();
  const path = 'assessmentResults';
  const q = query(collection(firestore, path), where('teacherIds', 'array-contains', teacherId));
  return onSnapshot(
    q,
    (snap) => {
      const items: AssessmentResultRecord[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          resultId: String(data.resultId || d.id),
          studentId: String(data.studentId || ''),
          studentName: String(data.studentName || 'Student'),
          classId: String(data.classId || 'self'),
          classGrade: Number(data.classGrade || 6) as GradeClassLevel,
          experimentId: String(data.experimentId || ''),
          experimentTitle: String(data.experimentTitle || ''),
          score: Number(data.score || 0),
          totalQuestions: Number(data.totalQuestions || 1),
          teacherIds: Array.isArray(data.teacherIds)
            ? data.teacherIds.filter((x): x is string => typeof x === 'string')
            : [],
          completedAt: toIsoTimestamp(data.completedAt),
        };
      });
      items.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}
