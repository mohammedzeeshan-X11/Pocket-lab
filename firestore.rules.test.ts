/**
 * PHYSIX AI — Firestore Security Rules Specification & Dirty Dozen Verification Cases
 *
 * Documents the 12 adversarial payloads from security_spec.md and validates that
 * every rule invariant in firestore.rules rejects unauthorized mutations/reads.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  expectedOutcome: 'PERMISSION_DENIED';
  payloadOrTarget: Record<string, unknown>;
  enforcedByRule: string;
}

export const DIRTY_DOZEN_SECURITY_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Role Escalation on Create',
    collection: 'users',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      uid: 'student_uid_1',
      name: 'Malicious User',
      email: 'bad@example.com',
      role: 'admin',
    },
    enforcedByRule: "isValidUserProfile: data.role in ['student', 'teacher']",
  },
  {
    id: 2,
    name: 'Role Mutation on Update',
    collection: 'users',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      role: 'teacher',
    },
    enforcedByRule:
      "users allow update: incoming().role == existing().role && affectedKeys().hasOnly(['name', 'selectedClass', 'schoolOrSubject', 'updatedAt'])",
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Profile',
    collection: 'users',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      uid: 'student_uid_1',
      name: 'Shadow User',
      email: 'shadow@example.com',
      role: 'student',
      selectedClass: 8,
      isAdmin: true,
    },
    enforcedByRule:
      "isValidUserProfile: data.keys().hasOnly(['uid', 'name', 'email', 'role', 'selectedClass', 'schoolOrSubject', 'createdAt', 'updatedAt'])",
  },
  {
    id: 4,
    name: 'Cross-User PII Read',
    collection: 'users',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: { targetUid: 'other_user_uid' },
    enforcedByRule: 'users allow get: isOwner(uid)',
  },
  {
    id: 5,
    name: 'User Directory Scraping',
    collection: 'users',
    operation: 'list',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: { query: 'collection(db, "users")' },
    enforcedByRule: 'users allow list: if false',
  },
  {
    id: 6,
    name: 'Student Creating a Class',
    collection: 'classes',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      classId: 'cls_fake',
      teacherId: 'student_uid_1',
      className: 'Fake Class',
      classGrade: 8,
      joinCode: 'FAKE1234',
    },
    enforcedByRule: 'classes allow create: isTeacher(request.auth.uid)',
  },
  {
    id: 7,
    name: 'Orphaned Class Without Join Code',
    collection: 'classes',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      classId: 'cls_orphan',
      teacherId: 'teacher_uid_1',
      className: 'Orphan Class',
      classGrade: 9,
      joinCode: 'ORPH1234',
    },
    enforcedByRule:
      'classes allow create: existsAfter(/databases/$(database)/documents/classJoinCodes/$(incoming().joinCode))',
  },
  {
    id: 8,
    name: 'Cross-Teacher Class Hijack',
    collection: 'classes',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      classId: 'teacherA_class_1',
      className: 'Hijacked',
    },
    enforcedByRule: 'classes allow update: existing().teacherId == request.auth.uid',
  },
  {
    id: 9,
    name: 'Join Code Directory Scraping',
    collection: 'classJoinCodes',
    operation: 'list',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: { query: 'collection(db, "classJoinCodes")' },
    enforcedByRule: 'classJoinCodes allow list: if false',
  },
  {
    id: 10,
    name: 'Membership Spoofing / Wrong Teacher',
    collection: 'classMemberships',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      membershipId: 'cls1_otherStudent',
      classId: 'cls1',
      studentId: 'otherStudent',
      teacherId: 'wrongTeacher',
    },
    enforcedByRule:
      'classMemberships allow create: incoming().studentId == request.auth.uid && membershipId == classId + "_" + request.auth.uid && get(class).data.teacherId == incoming().teacherId',
  },
  {
    id: 11,
    name: 'Forged Timestamp or Score Exceeding Total',
    collection: 'assessmentResults',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      score: 10,
      totalQuestions: 3,
      completedAt: '2020-01-01T00:00:00Z',
    },
    enforcedByRule:
      'isValidAssessmentResult: data.score <= data.totalQuestions && incoming().completedAt == request.time',
  },
  {
    id: 12,
    name: 'Unbounded Array or Oversized ID Poisoning',
    collection: 'studentProgress',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    payloadOrTarget: {
      progressId: 'x'.repeat(300),
      recordedObservations: Array.from({ length: 25 }, (_, i) => `obs_${i}`),
    },
    enforcedByRule:
      'isValidCompositeId(progressId) && data.recordedObservations.size() <= 20',
  },
];
