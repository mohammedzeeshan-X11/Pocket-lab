# PHYSIX AI Security Specification (Phase 0)

## 1. Data Invariants

1. **PII & Profile Isolation**: A user's `/users/{uid}` document (containing email and role) can only be read (`get`) by that authenticated user (`request.auth.uid == uid`). Blanket `list` on `/users` is strictly forbidden.
2. **Immutable Role Integrity**: A user profile can only be created with `role` equal to `'student'` or `'teacher'` (never `'admin'`), and `role`, `uid`, `email`, and `createdAt` are immutable after creation.
3. **Teacher-Only Class Ownership**: Only verified teachers (`get(/users/{uid}).data.role == 'teacher'`) can create, update, or delete `/classes/{classId}` and `/classJoinCodes/{joinCode}`, and only when `teacherId == request.auth.uid`.
4. **Atomic Class + Join Code Creation**: Creating `/classes/{classId}` requires `existsAfter(/classJoinCodes/{joinCode})`, and creating `/classJoinCodes/{joinCode}` requires `existsAfter(/classes/{classId})`.
5. **Student-Only Class Joining**: Only verified students (`get(/users/{uid}).data.role == 'student'`) can create `/classMemberships/{membershipId}` where `membershipId == classId + '_' + request.auth.uid`, `studentId == request.auth.uid`, and `teacherId` matches the authoritative parent `/classes/{classId}` document.
6. **Class & Progress Scoping**: Teachers can list/read ONLY their own classes and memberships/progress/assessments belonging to students enrolled in their classes. Students can list/read ONLY their own memberships, progress, and assessment results.
7. **Server-Authoritative Timestamps**: All `createdAt`, `updatedAt`, `joinedAt`, and `completedAt` fields must equal `request.time`.

## 2. The "Dirty Dozen" Attack Payloads (All Must Yield PERMISSION_DENIED)

1. **Role Escalation on Create**: Student attempts `POST /users/{uid}` with `{"role": "admin"}`.
2. **Role Mutation on Update**: Existing student attempts `PATCH /users/{uid}` changing `role` from `"student"` to `"teacher"`.
3. **Shadow Field Injection on Profile**: User attempts `POST /users/{uid}` including extra field `{"isAdmin": true}`.
4. **Cross-User PII Read**: Authenticated user A attempts `GET /users/{userB_uid}`.
5. **User Directory Scraping**: Authenticated user attempts `LIST /users`.
6. **Student Creating a Class**: Student attempts `POST /classes/{classId}` with `{"teacherId": studentUid}`.
7. **Orphaned Class Without Join Code**: Teacher attempts `POST /classes/{classId}` outside a batch without `/classJoinCodes/{joinCode}`.
8. **Cross-Teacher Class Hijack**: Teacher B attempts `GET`, `UPDATE`, or `DELETE` on Teacher A's `/classes/{classAId}`.
9. **Join Code Scraping**: Any user attempts `LIST /classJoinCodes`.
10. **Membership Spoofing**: Student A attempts `POST /classMemberships/{classId}_{studentB}` or sets wrong `teacherId` not matching `/classes/{classId}`.
11. **Terminal State / Forged Timestamp**: Student attempts `POST /assessmentResults/{id}` with backdated `completedAt` not equal to `request.time` or `score > totalQuestions`.
12. **Unbounded Array / Resource Poisoning**: User attempts `POST /studentProgress/{id}` with 25 observations or a 2KB document ID.
