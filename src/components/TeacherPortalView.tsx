import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  GraduationCap,
  LogOut,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type {
  AssessmentResultRecord,
  ClassActivityEvent,
  ClassMembership,
  FirestoreStudentProgress,
  GradeClassLevel,
  PhysicsClass,
  TeacherNotification,
  UserProfile,
} from '../types/physics';
import { CLASS_LEVELS, EXPERIMENT_CATALOGUE } from '../data/ncertCurriculum';
import {
  createLocalTeacherClass,
  deleteLocalTeacherClass,
  markAllTeacherNotificationsRead,
  markTeacherNotificationRead,
  updateLocalTeacherClass,
  updateLocalUserProfile,
  createGuidedClassActivity,
  endGuidedClassActivity,
} from '../services/localAuthDb';
import type {
  GuidedActivityCompletion,
  GuidedClassroomActivity,
} from '../types/companion';
import { isExperimentLaunchable } from '../data/simulationRegistry';

interface TeacherPortalViewProps {
  profile: UserProfile;
  classes: PhysicsClass[];
  memberships: ClassMembership[];
  studentProgress: FirestoreStudentProgress[];
  assessmentResults: AssessmentResultRecord[];
  notifications: TeacherNotification[];
  activityFeed: ClassActivityEvent[];
  guidedActivities?: GuidedClassroomActivity[];
  guidedCompletions?: GuidedActivityCompletion[];
  onProfileUpdated: (next: UserProfile) => void;
  onRefreshData: () => Promise<void>;
  onOpenLibraryForGrade: (grade: GradeClassLevel) => void;
  onLogout: () => void;
}

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  profile,
  classes,
  memberships,
  studentProgress,
  assessmentResults,
  notifications,
  activityFeed,
  guidedActivities = [],
  guidedCompletions = [],
  onProfileUpdated,
  onRefreshData,
  onOpenLibraryForGrade,
  onLogout,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [updatingNotifs, setUpdatingNotifs] = useState(false);

  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeClassLevel>(8);
  const [newClassDesc, setNewClassDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editSchool, setEditSchool] = useState(profile.schoolOrSubject || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editClassGrade, setEditClassGrade] = useState<GradeClassLevel>(8);
  const [editClassDesc, setEditClassDesc] = useState('');

  // Guided Classroom Activity composer state
  const [showGuidedBuilder, setShowGuidedBuilder] = useState(false);
  const [guidedExperimentId, setGuidedExperimentId] = useState('');
  const [guidedPrompt, setGuidedPrompt] = useState('');
  const [guidedOptionA, setGuidedOptionA] = useState('');
  const [guidedOptionB, setGuidedOptionB] = useState('');
  const [guidedCorrectIdx, setGuidedCorrectIdx] = useState(0);
  const [launchingGuided, setLaunchingGuided] = useState(false);

  const activeClass = useMemo(() => {
    if (classes.length === 0) return null;
    if (selectedClassId) {
      const found = classes.find((c) => c.classId === selectedClassId);
      if (found) return found;
    }
    return classes[0];
  }, [classes, selectedClassId]);

  const classLaunchableExperiments = useMemo(() => {
    if (!activeClass) return [];
    return EXPERIMENT_CATALOGUE.filter(
      (e) => e.classLevel === activeClass.classGrade && isExperimentLaunchable(e)
    );
  }, [activeClass]);

  const activeClassGuidedActivities = useMemo(() => {
    if (!activeClass) return [];
    return guidedActivities.filter((a) => a.classId === activeClass.classId);
  }, [guidedActivities, activeClass]);

  const uniqueStudentIds = useMemo(() => {
    const ids = new Set<string>();
    memberships.forEach((m) => ids.add(m.studentId));
    return ids;
  }, [memberships]);

  const activeClassMemberships = useMemo(() => {
    if (!activeClass) return [];
    return memberships.filter((m) => m.classId === activeClass.classId);
  }, [activeClass, memberships]);

  const activeClassStudentIds = useMemo(
    () => new Set(activeClassMemberships.map((m) => m.studentId)),
    [activeClassMemberships]
  );

  // Scoped strictly to students actually enrolled in the selected class
  const activeClassProgress = useMemo(
    () =>
      studentProgress.filter(
        (p) =>
          activeClassStudentIds.has(p.studentId) &&
          (!activeClass || p.classGrade === activeClass.classGrade || p.classId === activeClass.classId)
      ),
    [studentProgress, activeClassStudentIds, activeClass]
  );

  const activeClassAssessments = useMemo(
    () =>
      assessmentResults.filter(
        (a) =>
          activeClassStudentIds.has(a.studentId) &&
          (!activeClass || a.classGrade === activeClass.classGrade || a.classId === activeClass.classId)
      ),
    [assessmentResults, activeClassStudentIds, activeClass]
  );

  const totalCompletedByEnrolledStudents = useMemo(
    () =>
      studentProgress.filter(
        (p) => uniqueStudentIds.has(p.studentId) && p.completionStatus === 'completed'
      ).length,
    [studentProgress, uniqueStudentIds]
  );

  const totalAssessmentsByEnrolledStudents = useMemo(
    () => assessmentResults.filter((a) => uniqueStudentIds.has(a.studentId)).length,
    [assessmentResults, uniqueStudentIds]
  );

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const activeClassActivity = useMemo(() => {
    if (!activeClass) return [];
    return activityFeed.filter((ev) => ev.classId === activeClass.classId);
  }, [activityFeed, activeClass]);

  const handleMarkNotificationRead = async (notificationId: string) => {
    setUpdatingNotifs(true);
    try {
      await markTeacherNotificationRead(profile.uid, notificationId);
      await onRefreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to mark notification as read.');
    } finally {
      setUpdatingNotifs(false);
    }
  };

  const handleMarkAllRead = async () => {
    setUpdatingNotifs(true);
    try {
      await markAllTeacherNotificationsRead(profile.uid);
      await onRefreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to mark all read.');
    } finally {
      setUpdatingNotifs(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setCreating(true);
    try {
      const created = await createLocalTeacherClass(profile.uid, {
        className: newClassName,
        classGrade: newClassGrade,
        description: newClassDesc,
      });
      setNewClassName('');
      setNewClassDesc('');
      setShowCreateForm(false);
      setSelectedClassId(created.classId);
      await onRefreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to create class.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClass = async (cls: PhysicsClass) => {
    setActionError(null);
    try {
      await deleteLocalTeacherClass(profile.uid, cls.classId);
      if (selectedClassId === cls.classId) {
        setSelectedClassId(null);
      }
      await onRefreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to delete class.');
    }
  };

  const handleSaveClassEdit = async (cls: PhysicsClass) => {
    setActionError(null);
    try {
      await updateLocalTeacherClass(profile.uid, cls.classId, {
        className: editClassName,
        classGrade: editClassGrade,
        description: editClassDesc,
      });
      setEditingClassId(null);
      await onRefreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update class.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSavingProfile(true);
    try {
      const updated = await updateLocalUserProfile(profile.uid, {
        name: editName,
        schoolOrSubject: editSchool,
      });
      onProfileUpdated(updated);
      await onRefreshData();
      setEditingProfile(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update teacher profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // Fallback if clipboard blocked
    }
  };

  const prefillGuidedFromExperiment = (expId: string) => {
    setGuidedExperimentId(expId);
    const exp = classLaunchableExperiments.find((e) => e.id === expId);
    if (!exp) return;
    const firstQ = exp.assessmentQuestions[0];
    setGuidedPrompt(
      firstQ
        ? firstQ.prompt
        : `What outcome do you expect when testing ${exp.title}?`
    );
    if (firstQ && firstQ.options.length >= 2) {
      setGuidedOptionA(firstQ.options[0]);
      setGuidedOptionB(firstQ.options[1]);
      setGuidedCorrectIdx(firstQ.correctIndex <= 1 ? firstQ.correctIndex : 0);
    } else {
      setGuidedOptionA(exp.expectedOutcome);
      setGuidedOptionB('No measurable change occurs during the experiment.');
      setGuidedCorrectIdx(0);
    }
  };

  const handleLaunchGuidedActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;
    const targetExpId = guidedExperimentId || classLaunchableExperiments[0]?.id;
    if (!targetExpId) return;
    setActionError(null);
    setLaunchingGuided(true);
    try {
      await createGuidedClassActivity(profile.uid, {
        classId: activeClass.classId,
        experimentId: targetExpId,
        predictionPrompt: guidedPrompt,
        predictionOptions: [guidedOptionA, guidedOptionB],
        correctPredictionIndex: guidedCorrectIdx,
      });
      setShowGuidedBuilder(false);
      await onRefreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to launch guided activity.');
    } finally {
      setLaunchingGuided(false);
    }
  };

  const handleEndGuided = async (activityId: string) => {
    setActionError(null);
    try {
      await endGuidedClassActivity(profile.uid, activityId);
      await onRefreshData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to end guided activity.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Teacher Header */}
      <section className="clay-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#C96D12]">
              <Users className="w-4 h-4" />
              <span>Teacher Portal</span>
              <span aria-hidden="true">·</span>
              <span>Educator Console</span>
              {profile.schoolOrSubject && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#6F7487] font-medium">{profile.schoolOrSubject}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171A2F]">
              Welcome, {profile.name}
            </h1>
            <p className="text-sm text-[#6F7487]">
              <span className="font-mono text-[#171A2F]">@{profile.username}</span>
              <span aria-hidden="true"> · </span>
              <span>Browser-Local Demo Mode (IndexedDB)</span>
              <span aria-hidden="true"> · </span>
              <span>
                Manage your Physics classrooms, share student join codes, and monitor enrolled student progress.
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              data-testid="teacher-notification-bell"
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-expanded={showNotifications}
              aria-label={`Notifications (${unreadNotificationCount} unread)`}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors cursor-pointer min-h-[44px] whitespace-nowrap ${
                unreadNotificationCount > 0
                  ? 'bg-[#FFF3E3] border-[#F49A3C] text-[#171A2F]'
                  : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F] hover:border-[#F49A3C]'
              }`}
            >
              <Bell className="w-4 h-4 text-[#C96D12]" />
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="font-mono-tabular px-1.5 py-0.5 rounded bg-[#F49A3C] text-white text-xs leading-none">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{showCreateForm ? 'Close Form' : 'Create Class'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditName(profile.name);
                setEditSchool(profile.schoolOrSubject || '');
                setEditingProfile((prev) => !prev);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-sm font-medium hover:bg-[#FFE6C7] transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
            >
              <Edit3 className="w-4 h-4" />
              <span>{editingProfile ? 'Close Profile' : 'Teacher Profile'}</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#EFE7DF] text-sm font-medium text-[#171A2F] hover:bg-[#FFF9F4] transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 text-[#6F7487]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Persistent Teacher Notification Center */}
        {showNotifications && (
          <div
            data-testid="teacher-notification-panel"
            className="pt-6 border-t border-[#EFE7DF] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold text-[#171A2F]">
                  Classroom Notifications
                </h2>
                <p className="text-xs text-[#6F7487]">
                  Real student enrollment alerts scoped strictly to your own classrooms.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {unreadNotificationCount > 0 && (
                  <button
                    type="button"
                    disabled={updatingNotifs}
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer disabled:opacity-60"
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  aria-label="Close notifications"
                  className="p-1.5 rounded-lg border border-[#EFE7DF] text-[#6F7487] hover:text-[#171A2F] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] text-xs text-[#6F7487]">
                No notifications yet. Notifications appear automatically when a student joins one
                of your classrooms using a join code.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.notificationId}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      n.isRead
                        ? 'bg-[#FFF9F4] border-[#EFE7DF]'
                        : 'bg-[#FFF3E3]/70 border-[#F49A3C]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <UserPlus className="w-3.5 h-3.5 text-[#C96D12]" />
                        <span className="font-semibold text-[#171A2F]">{n.title}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#C96D12]">
                          {n.className} (Class {n.classGrade})
                        </span>
                        {!n.isRead && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#C96D12]">Unread</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-[#171A2F]">{n.message}</p>
                      <p className="text-[11px] text-[#6F7487] font-mono-tabular">
                        Joined {new Date(n.joinedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassId(n.classId);
                          if (!n.isRead) {
                            handleMarkNotificationRead(n.notificationId);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#C96D12] hover:border-[#F49A3C] cursor-pointer"
                      >
                        View Class
                      </button>
                      {!n.isRead && (
                        <button
                          type="button"
                          disabled={updatingNotifs}
                          onClick={() => handleMarkNotificationRead(n.notificationId)}
                          className="px-3 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer disabled:opacity-60"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {editingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="pt-6 border-t border-[#EFE7DF] grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <label className="md:col-span-5 space-y-1.5">
              <span className="text-xs font-semibold text-[#171A2F] block">Teacher Name</span>
              <input
                type="text"
                required
                maxLength={100}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F]"
              />
            </label>
            <label className="md:col-span-5 space-y-1.5">
              <span className="text-xs font-semibold text-[#171A2F] block">
                School / Subject Focus
              </span>
              <input
                type="text"
                maxLength={120}
                value={editSchool}
                onChange={(e) => setEditSchool(e.target.value)}
                placeholder="e.g., High School Physics"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F]"
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 px-4 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer disabled:opacity-60 min-h-[42px]"
              >
                {savingProfile ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* Create Class Form */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateClass}
            className="pt-6 border-t border-[#EFE7DF] space-y-4"
          >
            <h2 className="text-base font-semibold text-[#171A2F]">Create a New Classroom</h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <label className="md:col-span-5 space-y-1.5">
                <span className="text-xs font-semibold text-[#171A2F] block">Class Name</span>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Grade 8 Physics — Section B"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F]"
                />
              </label>

              <div className="md:col-span-4 space-y-1.5">
                <span className="text-xs font-semibold text-[#171A2F] block">NCERT Grade</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {CLASS_LEVELS.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setNewClassGrade(cls)}
                      className={`py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                        newClassGrade === cls
                          ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                          : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <label className="md:col-span-3 space-y-1.5">
                <span className="text-xs font-semibold text-[#171A2F] block">
                  Notes (Optional)
                </span>
                <input
                  type="text"
                  maxLength={300}
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  placeholder="Term 1 Lab Group"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-lg border border-[#EFE7DF] text-xs font-medium text-[#171A2F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer disabled:opacity-60"
              >
                {creating ? 'Creating Class...' : 'Create Class & Generate Join Code'}
              </button>
            </div>
          </form>
        )}

        {actionError && (
          <div className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#E7B5AF] text-xs text-[#7A271A] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}
      </section>

      {/* Real Teacher Metrics Strip (Zero invented statistics) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5 space-y-1">
          <p className="text-xs text-[#6F7487]">Created Classes</p>
          <p className="text-2xl font-bold text-[#C96D12] font-mono-tabular">{classes.length}</p>
        </div>
        <div className="clay-card p-5 space-y-1">
          <p className="text-xs text-[#6F7487]">Total Enrolled Students</p>
          <p className="text-2xl font-bold text-[#171A2F] font-mono-tabular">
            {uniqueStudentIds.size}
          </p>
        </div>
        <div className="clay-card p-5 space-y-1">
          <p className="text-xs text-[#6F7487]">Completed Experiments</p>
          <p className="text-2xl font-bold text-[#171A2F] font-mono-tabular">
            {totalCompletedByEnrolledStudents}
          </p>
        </div>
        <div className="clay-card p-5 space-y-1">
          <p className="text-xs text-[#6F7487]">Quiz Submissions</p>
          <p className="text-2xl font-bold text-[#171A2F] font-mono-tabular">
            {totalAssessmentsByEnrolledStudents}
          </p>
        </div>
      </section>

      {/* Class List + Classroom Detail / Student Progress */}
      {classes.length === 0 ? (
        <section className="clay-card p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#FFF3E3] text-[#C96D12] flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-[#171A2F]">No classes created yet</h2>
            <p className="text-sm text-[#6F7487]">
              Create your first Class 6–10 classroom to receive a shareable join code. When students
              join, their real experiment completions and quiz scores will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Class</span>
          </button>
        </section>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 4: Teacher's Created Classes */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-base font-semibold text-[#171A2F]">Your Created Classes</h2>
            <div className="space-y-3">
              {classes.map((cls) => {
                const isSelected = activeClass?.classId === cls.classId;
                const enrolledCount = memberships.filter((m) => m.classId === cls.classId).length;
                return (
                  <div
                    key={cls.classId}
                    className={`rounded-2xl border p-4 transition-colors space-y-3 ${
                      isSelected
                        ? 'bg-white border-[#F49A3C] ring-1 ring-[#F49A3C]'
                        : 'bg-white border-[#EFE7DF] hover:border-[#F49A3C]/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedClassId(cls.classId)}
                      className="w-full text-left space-y-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-[#C96D12]">Class {cls.classGrade}</span>
                        <span className="font-mono-tabular text-[#6F7487]">
                          {enrolledCount} {enrolledCount === 1 ? 'student' : 'students'}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#171A2F]">{cls.className}</h3>
                      {cls.description && (
                        <p className="text-xs text-[#6F7487]">{cls.description}</p>
                      )}
                    </button>

                    <div className="pt-2.5 border-t border-[#EFE7DF] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(cls.joinCode)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] text-xs font-mono font-semibold text-[#171A2F] hover:border-[#F49A3C] cursor-pointer"
                      >
                        <span>{cls.joinCode}</span>
                        {copiedCode === cls.joinCode ? (
                          <Check className="w-3.5 h-3.5 text-[#C96D12]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#6F7487]" />
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClassId(cls.classId);
                            setEditClassName(cls.className);
                            setEditClassGrade(cls.classGrade);
                            setEditClassDesc(cls.description || '');
                          }}
                          aria-label={`Edit ${cls.className}`}
                          className="p-2 rounded-lg text-[#6F7487] hover:text-[#C96D12] hover:bg-[#FFF9F4] cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(cls)}
                          aria-label={`Delete ${cls.className}`}
                          className="p-2 rounded-lg text-[#6F7487] hover:text-[#B83A2D] hover:bg-[#FDF2F0] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {editingClassId === cls.classId && (
                      <div className="pt-3 border-t border-[#EFE7DF] space-y-2.5">
                        <input
                          type="text"
                          value={editClassName}
                          onChange={(e) => setEditClassName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-xs text-[#171A2F]"
                        />
                        <div className="flex items-center gap-2">
                          <select
                            value={editClassGrade}
                            onChange={(e) =>
                              setEditClassGrade(Number(e.target.value) as GradeClassLevel)
                            }
                            className="px-2.5 py-2 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-xs text-[#171A2F]"
                          >
                            {CLASS_LEVELS.map((g) => (
                              <option key={g} value={g}>
                                Class {g}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editClassDesc}
                            onChange={(e) => setEditClassDesc(e.target.value)}
                            placeholder="Description"
                            className="flex-1 px-2.5 py-2 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-xs text-[#171A2F]"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingClassId(null)}
                            className="px-3 py-1.5 text-xs text-[#6F7487] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveClassEdit(cls)}
                            className="px-3 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 8: Selected Class Activity & Student Progress Overview */}
          {activeClass && (
            <div className="lg:col-span-8 space-y-6">
              <div className="clay-card p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EFE7DF] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#C96D12]">
                      <span>Class {activeClass.classGrade}</span>
                      <span aria-hidden="true">·</span>
                      <span>Join Code: {activeClass.joinCode}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#171A2F]">{activeClass.className}</h2>
                    <p className="text-xs text-[#6F7487]">
                      {EXPERIMENT_CATALOGUE.filter((e) => e.classLevel === activeClass.classGrade).length}{' '}
                      NCERT Class {activeClass.classGrade} modules in curriculum
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenLibraryForGrade(activeClass.classGrade)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-xs font-semibold hover:bg-[#FFE6C7] cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Preview Class {activeClass.classGrade} Library</span>
                  </button>
                </div>

                {/* Empty state if class has 0 enrolled students */}
                {activeClassMemberships.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] text-center space-y-3">
                    <p className="text-sm font-semibold text-[#171A2F]">
                      No students enrolled in {activeClass.className} yet
                    </p>
                    <p className="text-xs text-[#6F7487] max-w-md mx-auto leading-relaxed">
                      Share join code{' '}
                      <span className="font-mono font-bold text-[#171A2F] bg-white px-2 py-0.5 rounded border border-[#EFE7DF]">
                        {activeClass.joinCode}
                      </span>{' '}
                      with your students so they can join from their Student Portal. Real student
                      records and quiz results will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Class Activity Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF]">
                        <p className="text-xs text-[#6F7487]">Enrolled Students</p>
                        <p className="text-xl font-bold text-[#171A2F] font-mono-tabular mt-0.5">
                          {activeClassMemberships.length}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF]">
                        <p className="text-xs text-[#6F7487]">Completed Labs</p>
                        <p className="text-xl font-bold text-[#C96D12] font-mono-tabular mt-0.5">
                          {activeClassProgress.filter((p) => p.completionStatus === 'completed').length}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF]">
                        <p className="text-xs text-[#6F7487]">Quiz Submissions</p>
                        <p className="text-xl font-bold text-[#171A2F] font-mono-tabular mt-0.5">
                          {activeClassAssessments.length}
                        </p>
                      </div>
                    </div>

                    {/* Enrolled Student Progress Table */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-[#171A2F]">
                        Enrolled Student Progress
                      </h3>
                      <div className="overflow-x-auto border border-[#EFE7DF] rounded-xl">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-[#FFF9F4] border-b border-[#EFE7DF] text-[#6F7487] text-xs">
                              <th className="py-2.5 px-4 font-semibold">Student</th>
                              <th className="py-2.5 px-4 font-semibold">Grade</th>
                              <th className="py-2.5 px-4 font-semibold">Completed Labs</th>
                              <th className="py-2.5 px-4 font-semibold">Observations</th>
                              <th className="py-2.5 px-4 font-semibold">Latest Quiz</th>
                              <th className="py-2.5 px-4 font-semibold">Joined</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EFE7DF]">
                            {activeClassMemberships.map((member) => {
                              const studentCompleted = activeClassProgress.filter(
                                (p) =>
                                  p.studentId === member.studentId &&
                                  p.completionStatus === 'completed'
                              );
                              const obsCount = activeClassProgress
                                .filter((p) => p.studentId === member.studentId)
                                .reduce((sum, p) => sum + p.recordedObservations.length, 0);
                              const latestQuiz = activeClassAssessments.find(
                                (a) => a.studentId === member.studentId
                              );

                              return (
                                <tr key={member.membershipId} className="bg-white">
                                  <td className="py-3 px-4 font-semibold text-[#171A2F]">
                                    {member.studentName}
                                  </td>
                                  <td className="py-3 px-4 font-mono-tabular text-[#6F7487]">
                                    Class {member.studentSelectedClass}
                                  </td>
                                  <td className="py-3 px-4 font-mono-tabular text-[#C96D12] font-semibold">
                                    {studentCompleted.length}
                                  </td>
                                  <td className="py-3 px-4 font-mono-tabular text-[#171A2F]">
                                    {obsCount}
                                  </td>
                                  <td className="py-3 px-4 font-mono-tabular text-[#171A2F]">
                                    {latestQuiz
                                      ? `${latestQuiz.score}/${latestQuiz.totalQuestions}`
                                      : '—'}
                                  </td>
                                  <td className="py-3 px-4 font-mono-tabular text-xs text-[#6F7487]">
                                    {new Date(member.joinedAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recent Assessment Submissions in This Class */}
                    {activeClassAssessments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#C96D12]" />
                          <h3 className="text-sm font-semibold text-[#171A2F]">
                            Recent Assessment Results
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {activeClassAssessments.slice(0, 6).map((item) => (
                            <div
                              key={item.resultId}
                              className="p-3.5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-0.5">
                                <p className="font-semibold text-[#171A2F]">
                                  {item.studentName} · {item.experimentTitle}
                                </p>
                                <p className="text-[#6F7487] font-mono-tabular">
                                  {new Date(item.completedAt).toLocaleString()}
                                </p>
                              </div>
                              <span className="font-mono-tabular text-sm font-bold text-[#C96D12]">
                                {item.score}/{item.totalQuestions}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Class Activity Feed (Persistent Real Student Events) */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#C96D12]" />
                        <h3 className="text-sm font-semibold text-[#171A2F]">
                          Recent Class Activity Feed
                        </h3>
                      </div>

                      {activeClassActivity.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] text-xs text-[#6F7487]">
                          No student activity recorded yet for {activeClass.className}. Joins,
                          completed labs, and quiz submissions appear here automatically.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeClassActivity.slice(0, 8).map((ev) => (
                            <div
                              key={ev.activityId}
                              className="p-3.5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="flex items-start gap-2.5">
                                {ev.eventType === 'student_joined' ? (
                                  <UserPlus className="w-4 h-4 text-[#C96D12] shrink-0 mt-0.5" />
                                ) : ev.eventType === 'experiment_completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#C96D12] shrink-0 mt-0.5" />
                                ) : (
                                  <Award className="w-4 h-4 text-[#C96D12] shrink-0 mt-0.5" />
                                )}
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-[#171A2F]">{ev.summary}</p>
                                  <p className="text-[#6F7487] font-mono-tabular">
                                    {new Date(ev.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Guided Classroom Activities Section */}
                <div className="pt-5 border-t border-[#EFE7DF] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-[#171A2F]">
                        Guided Classroom Activities
                      </h3>
                      <p className="text-xs text-[#6F7487]">
                        Launch a structured 6-step lab + prediction challenge for {activeClass.className}.
                      </p>
                    </div>
                    <button
                      type="button"
                      data-testid="toggle-guided-builder-btn"
                      onClick={() => {
                        if (!showGuidedBuilder && classLaunchableExperiments.length > 0 && !guidedExperimentId) {
                          prefillGuidedFromExperiment(classLaunchableExperiments[0].id);
                        }
                        setShowGuidedBuilder((v) => !v);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showGuidedBuilder ? 'Close Builder' : 'Launch Guided Activity'}</span>
                    </button>
                  </div>

                  {showGuidedBuilder && (
                    <form
                      onSubmit={handleLaunchGuidedActivity}
                      className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-3"
                    >
                      <label className="block space-y-1">
                        <span className="text-xs font-semibold text-[#171A2F]">
                          NCERT Class {activeClass.classGrade} Interactive Experiment
                        </span>
                        <select
                          value={guidedExperimentId || classLaunchableExperiments[0]?.id || ''}
                          onChange={(e) => prefillGuidedFromExperiment(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#EFE7DF] bg-white text-xs sm:text-sm text-[#171A2F]"
                        >
                          {classLaunchableExperiments.map((exp) => (
                            <option key={exp.id} value={exp.id}>
                              Ch. {exp.chapterNumber}: {exp.title}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block space-y-1">
                        <span className="text-xs font-semibold text-[#171A2F]">
                          Student Prediction Question
                        </span>
                        <input
                          type="text"
                          required
                          value={guidedPrompt}
                          onChange={(e) => setGuidedPrompt(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#EFE7DF] bg-white text-xs sm:text-sm text-[#171A2F]"
                        />
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="space-y-1">
                          <span className="text-xs font-semibold text-[#171A2F]">Option A</span>
                          <input
                            type="text"
                            required
                            value={guidedOptionA}
                            onChange={(e) => setGuidedOptionA(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#EFE7DF] bg-white text-xs text-[#171A2F]"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-semibold text-[#171A2F]">Option B</span>
                          <input
                            type="text"
                            required
                            value={guidedOptionB}
                            onChange={(e) => setGuidedOptionB(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#EFE7DF] bg-white text-xs text-[#171A2F]"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-xs text-[#171A2F]">
                          <span className="font-semibold">Correct Prediction:</span>
                          <select
                            value={guidedCorrectIdx}
                            onChange={(e) => setGuidedCorrectIdx(Number(e.target.value))}
                            className="px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs"
                          >
                            <option value={0}>Option A</option>
                            <option value={1}>Option B</option>
                          </select>
                        </label>

                        <button
                          type="submit"
                          data-testid="confirm-launch-guided-btn"
                          disabled={launchingGuided}
                          className="px-4 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer disabled:opacity-60"
                        >
                          {launchingGuided ? 'Launching...' : 'Start for Class Students'}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeClassGuidedActivities.length > 0 && (
                    <div className="space-y-2.5">
                      {activeClassGuidedActivities.map((act) => {
                        const subs = guidedCompletions.filter((c) => c.activityId === act.activityId);
                        return (
                          <div
                            key={act.activityId}
                            data-testid={`teacher-guided-item-${act.activityId}`}
                            className="p-3.5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span
                                  className={`font-semibold ${
                                    act.status === 'active' ? 'text-[#C96D12]' : 'text-[#6F7487]'
                                  }`}
                                >
                                  {act.status === 'active' ? 'Live Session' : 'Ended'}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono-tabular text-[#6F7487]">
                                  {subs.length} student completion{subs.length === 1 ? '' : 's'}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-[#171A2F] truncate">
                                {act.experimentTitle}
                              </p>
                              <p className="text-xs text-[#6F7487] truncate">
                                Predict: {act.predictionPrompt}
                              </p>
                            </div>
                            {act.status === 'active' && (
                              <button
                                type="button"
                                onClick={() => void handleEndGuided(act.activityId)}
                                className="px-3 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#B83A2D] hover:bg-[#FDF2F0] cursor-pointer shrink-0"
                              >
                                End Activity
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
