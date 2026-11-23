import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type {
  AppView,
  AssessmentResultRecord,
  ClassActivityEvent,
  ClassMembership,
  ExperimentCatalogItem,
  FirestoreStudentProgress,
  GradeClassLevel,
  LanguageCode,
  LearningSessionContext,
  NcertChapterMeta,
  PhysicsClass,
  PhysicsConcept,
  SavedStudySession,
  SimulationMode,
  StudentProgressMap,
  TeacherNotification,
  TextbookAnalysisResult,
  UserPreferences,
  UserProfile,
  UserRole,
} from './types/physics';
import type { DynamicExperimentSpec } from './types/dynamicExperiment';
import type {
  BadgeDefinition,
  GuidedActivityCompletion,
  GuidedClassroomActivity,
  RewardProgressState,
} from './types/companion';
import { TRANSLATIONS } from './i18n/translations';
import { getBuiltInMagnetismModule } from './data/magnetismModule';
import { EXPERIMENT_CATALOGUE, NCERT_CLASS_CURRICULA } from './data/ncertCurriculum';
import { getExperimentsForConceptSimulation } from './data/simulationRegistry';
import { matchExperimentInRegistry } from './data/experimentMatcher';
import { validateAndSanitizeDynamicExperimentSpec } from './utils/dynamicPhysicsValidator';
import { fetchServerHealth, generateDynamicExperiment } from './services/textbookApi';
import {
  loadSavedDynamicExperiments,
  removeSavedDynamicExperiment,
  saveGeneratedExperimentToLibrary,
} from './services/dynamicExperimentStore';
import {
  loadRewardState,
  recordRewardAction,
  type RewardMilestoneEvent,
} from './services/rewardsEngine';
import {
  deleteAccountStudySession,
  getAccountStudySessions,
  getStudentAssessmentHistory,
  getStudentGuidedActivitiesAndCompletions,
  getStudentMemberships,
  getStudentProgressData,
  getTeacherActivityFeed,
  getTeacherClasses,
  getTeacherGuidedActivities,
  getTeacherMemberships,
  getTeacherNotifications,
  getTeacherScopedStudentData,
  persistLocalStudentProgress,
  restoreActiveLocalSession,
  saveAccountStudySession,
  signOutLocalAccount,
  submitStudentGuidedCompletion,
} from './services/localAuthDb';
import { Navbar } from './components/Navbar';
import { SidebarNav, type SidebarItemId } from './components/SidebarNav';
import { LandingPageView } from './components/LandingPageView';
import { DashboardView, type LastAccessedExperimentInfo } from './components/DashboardView';
import { PocketLabView } from './components/PocketLabView';
import { TextbookScannerView } from './components/TextbookScannerView';
import { DailyChallengeView } from './components/DailyChallengeView';
import { AchievementsModal } from './components/AchievementsModal';
import { ConceptExplorerView } from './components/ConceptExplorerView';
import { SimulationLabView } from './components/SimulationLabView';
import { MyLearningView } from './components/MyLearningView';
import { ClassLibraryView } from './components/ClassLibraryView';
import { SettingsView } from './components/SettingsView';
import { AuthPortalView } from './components/AuthPortalView';
import { StudentPortalView } from './components/StudentPortalView';
import { TeacherPortalView } from './components/TeacherPortalView';
import { PortalErrorBoundary } from './components/PortalErrorBoundary';
import { ConceptExperimentChooserModal } from './components/ConceptExperimentChooserModal';
import { ExperimentActivityModal } from './components/ExperimentActivityModal';

const PREFS_STORAGE_KEY = 'physix_ai_preferences_v1';
const SESSIONS_STORAGE_KEY = 'physix_ai_sessions_v1';
const PROGRESS_STORAGE_KEY = 'physix_ai_progress_v1';
const LAST_ACCESSED_KEY_PREFIX = 'physix_last_exp_v1_';

function loadLastAccessedExperiment(accountId?: string | null): LastAccessedExperimentInfo | null {
  try {
    const raw = localStorage.getItem(`${LAST_ACCESSED_KEY_PREFIX}${accountId || 'guest'}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastAccessedExperimentInfo>;
    if (!parsed || typeof parsed.experimentId !== 'string' || !parsed.experimentId) return null;
    return {
      experimentId: parsed.experimentId,
      accessedAt: typeof parsed.accessedAt === 'string' ? parsed.accessedAt : new Date().toISOString(),
      mode: parsed.mode === '3d' ? '3d' : '2d',
    };
  } catch {
    return null;
  }
}

function saveLastAccessedExperiment(
  accountId: string | null | undefined,
  info: LastAccessedExperimentInfo
): void {
  try {
    localStorage.setItem(`${LAST_ACCESSED_KEY_PREFIX}${accountId || 'guest'}`, JSON.stringify(info));
  } catch {
    // Ignore storage quota issues
  }
}

const VALID_CLASSES: readonly GradeClassLevel[] = [6, 7, 8, 9, 10];

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  defaultSimulationMode: '2d',
  showVectorGridByDefault: false,
  reducedMotion: false,
  selectedClass: 6,
};

function isValidClassLevel(val: unknown): val is GradeClassLevel {
  return typeof val === 'number' && (VALID_CLASSES as readonly number[]).includes(val);
}

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      language: parsed.language === 'kn' || parsed.language === 'hi' ? parsed.language : 'en',
      defaultSimulationMode: parsed.defaultSimulationMode === '3d' ? '3d' : '2d',
      showVectorGridByDefault: Boolean(parsed.showVectorGridByDefault),
      reducedMotion: Boolean(parsed.reducedMotion),
      selectedClass: isValidClassLevel(parsed.selectedClass) ? parsed.selectedClass : 6,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function loadSessions(): SavedStudySession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is SavedStudySession =>
        Boolean(
          s &&
            typeof s === 'object' &&
            s.analysis &&
            typeof s.analysis.main_topic === 'string' &&
            Array.isArray(s.analysis.concepts) &&
            Array.isArray(s.analysis.detected_diagrams)
        )
    );
  } catch {
    return [];
  }
}

function loadLocalStudentProgress(): StudentProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const clean: StudentProgressMap = {};
    for (const [expId, entry] of Object.entries(parsed as Record<string, unknown>)) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const record = entry as Record<string, unknown>;
        clean[expId] = {
          experimentId: expId,
          completedAt:
            typeof record.completedAt === 'string'
              ? record.completedAt
              : new Date().toISOString(),
          quizScore: typeof record.quizScore === 'number' ? record.quizScore : undefined,
          quizTotal: typeof record.quizTotal === 'number' ? record.quizTotal : undefined,
          recordedObservations: Array.isArray(record.recordedObservations)
            ? record.recordedObservations.filter((x): x is string => typeof x === 'string')
            : [],
        };
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeLabMode, setActiveLabMode] = useState<SimulationMode>(
    preferences.defaultSimulationMode
  );
  const [activeAnalysis, setActiveAnalysis] = useState<TextbookAnalysisResult | null>(null);
  const [activeExperiment, setActiveExperiment] = useState<ExperimentCatalogItem | null>(null);
  const [activeDynamicExperiment, setActiveDynamicExperiment] =
    useState<DynamicExperimentSpec | null>(null);
  const [savedDynamicExperiments, setSavedDynamicExperiments] = useState<DynamicExperimentSpec[]>(
    []
  );
  const [isGeneratingDynamic, setIsGeneratingDynamic] = useState(false);
  const [generationStageText, setGenerationStageText] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const lastScannedImageRef = useRef<{ base64: string; mimeType: string } | null>(null);
  const [localProgress, setLocalProgress] = useState<StudentProgressMap>(loadLocalStudentProgress);
  const [sessions, setSessions] = useState<SavedStudySession[]>(loadSessions);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [learningSession, setLearningSession] = useState<LearningSessionContext>(() => ({
    currentExperiment: 'bar_magnet_explorer',
    selectedLanguage: preferences.language,
    questionsAsked: [],
    confusedConcepts: [],
    strategiesAttempted: [],
    alternativeSimulationsViewed: [],
  }));

  // Local Demo Auth & Portal State (IndexedDB)
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authIntentRole, setAuthIntentRole] = useState<UserRole>('student');
  const [authIntentMode, setAuthIntentMode] = useState<'login' | 'register'>('login');
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [conceptChooser, setConceptChooser] = useState<{
    chapter: NcertChapterMeta;
    experiments: ExperimentCatalogItem[];
  } | null>(null);
  const [conceptActivityModal, setConceptActivityModal] = useState<ExperimentCatalogItem | null>(null);

  // Student Portal Scoped State
  const [studentMemberships, setStudentMemberships] = useState<ClassMembership[]>([]);
  const [firestoreProgressList, setFirestoreProgressList] = useState<FirestoreStudentProgress[]>([]);
  const [firestoreProgressMap, setFirestoreProgressMap] = useState<StudentProgressMap>({});
  const [studentAssessments, setStudentAssessments] = useState<AssessmentResultRecord[]>([]);

  // Teacher Portal Scoped State
  const [teacherClasses, setTeacherClasses] = useState<PhysicsClass[]>([]);
  const [teacherMemberships, setTeacherMemberships] = useState<ClassMembership[]>([]);
  const [teacherProgressRecords, setTeacherProgressRecords] = useState<FirestoreStudentProgress[]>([]);
  const [teacherAssessments, setTeacherAssessments] = useState<AssessmentResultRecord[]>([]);
  const [teacherNotifications, setTeacherNotifications] = useState<TeacherNotification[]>([]);
  const [teacherActivityFeed, setTeacherActivityFeed] = useState<ClassActivityEvent[]>([]);

  // Companion Rewards & Guided Classroom Activities State
  const [rewardState, setRewardState] = useState<RewardProgressState>(() => loadRewardState('guest'));
  const [latestBadgeToast, setLatestBadgeToast] = useState<BadgeDefinition | null>(null);
  const [activeGuidedActivity, setActiveGuidedActivity] = useState<GuidedClassroomActivity | null>(null);
  const [studentGuidedActivities, setStudentGuidedActivities] = useState<GuidedClassroomActivity[]>([]);
  const [studentGuidedCompletions, setStudentGuidedCompletions] = useState<GuidedActivityCompletion[]>([]);
  const [teacherGuidedActivities, setTeacherGuidedActivities] = useState<GuidedClassroomActivity[]>([]);
  const [teacherGuidedCompletions, setTeacherGuidedCompletions] = useState<GuidedActivityCompletion[]>([]);
  const [initialTutorPrefill, setInitialTutorPrefill] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [lastAccessedExperiment, setLastAccessedExperiment] =
    useState<LastAccessedExperimentInfo | null>(() => loadLastAccessedExperiment('guest'));
  const [recentCompletedExperimentId, setRecentCompletedExperimentId] = useState<string | null>(
    null
  );

  // Track if initial session restoration already redirected
  const restoredSessionRef = useRef(false);
  const previousNonPocketViewRef = useRef<AppView>('home');
  const postAuthTargetViewRef = useRef<AppView | null>(null);

  const t = TRANSLATIONS[preferences.language];

  const lockedStudentClass: GradeClassLevel | undefined =
    userProfile?.role === 'student' ? (userProfile.selectedClass ?? 6) : undefined;
  const effectiveSelectedClass: GradeClassLevel = lockedStudentClass ?? preferences.selectedClass;

  const effectiveStudentProgress: StudentProgressMap =
    userProfile?.role === 'student'
      ? firestoreProgressMap
      : userProfile?.role === 'teacher'
        ? {}
        : localProgress;

  useEffect(() => {
    setRewardState(loadRewardState(userProfile?.uid ?? 'guest'));
    setLastAccessedExperiment(loadLastAccessedExperiment(userProfile?.uid));
    setRecentCompletedExperimentId(null);
    loadSavedDynamicExperiments(userProfile?.uid)
      .then(setSavedDynamicExperiments)
      .catch(() => {});
  }, [userProfile?.uid]);

  const recordExperimentAccess = useCallback(
    (experimentId: string, mode: SimulationMode) => {
      const info: LastAccessedExperimentInfo = {
        experimentId,
        accessedAt: new Date().toISOString(),
        mode,
      };
      setLastAccessedExperiment(info);
      saveLastAccessedExperiment(userProfile?.uid, info);
    },
    [userProfile?.uid]
  );

  const handleRecordRewardEvent = useCallback(
    (event: RewardMilestoneEvent) => {
      const result = recordRewardAction(userProfile?.uid ?? 'guest', event);
      setRewardState(result.nextState);
      if (result.newlyUnlockedBadges.length > 0) {
        setLatestBadgeToast(result.newlyUnlockedBadges[0]);
      }
    },
    [userProfile?.uid]
  );

  const loadPortalStateForProfile = useCallback(async (profile: UserProfile) => {
    try {
      const accountSessions = await getAccountStudySessions(profile.uid);
      setSessions(accountSessions);
    } catch {
      setSessions([]);
    }

    if (profile.role === 'student') {
      const [mems, prog, assessments, guided] = await Promise.all([
        getStudentMemberships(profile.uid),
        getStudentProgressData(profile.uid),
        getStudentAssessmentHistory(profile.uid),
        getStudentGuidedActivitiesAndCompletions(profile.uid),
      ]);
      setStudentMemberships(mems);
      setFirestoreProgressList(prog.list);
      setFirestoreProgressMap(prog.map);
      setStudentAssessments(assessments);
      setStudentGuidedActivities(guided.activities);
      setStudentGuidedCompletions(guided.completions);
      setTeacherClasses([]);
      setTeacherMemberships([]);
      setTeacherProgressRecords([]);
      setTeacherAssessments([]);
      setTeacherNotifications([]);
      setTeacherActivityFeed([]);
      setTeacherGuidedActivities([]);
      setTeacherGuidedCompletions([]);
    } else if (profile.role === 'teacher') {
      const [classes, mems, scoped, notifications, activity, guided] = await Promise.all([
        getTeacherClasses(profile.uid),
        getTeacherMemberships(profile.uid),
        getTeacherScopedStudentData(profile.uid),
        getTeacherNotifications(profile.uid),
        getTeacherActivityFeed(profile.uid),
        getTeacherGuidedActivities(profile.uid),
      ]);
      setTeacherClasses(classes);
      setTeacherMemberships(mems);
      setTeacherProgressRecords(scoped.progress);
      setTeacherAssessments(scoped.assessments);
      setTeacherNotifications(notifications);
      setTeacherActivityFeed(activity);
      setTeacherGuidedActivities(guided.activities);
      setTeacherGuidedCompletions(guided.completions);
      setStudentMemberships([]);
      setFirestoreProgressList([]);
      setFirestoreProgressMap({});
      setStudentAssessments([]);
      setStudentGuidedActivities([]);
      setStudentGuidedCompletions([]);
    }
  }, []);

  useEffect(() => {
    fetchServerHealth()
      .then((health) => setGeminiConfigured(health.geminiConfigured))
      .catch(() => setGeminiConfigured(false));
  }, []);

  // Restore active browser-local IndexedDB demo session on boot
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored = await restoreActiveLocalSession();
        if (cancelled) return;
        if (restored) {
          setUserProfile(restored);
          await loadPortalStateForProfile(restored);
          if (cancelled) return;
          if (restored.role === 'student' && restored.selectedClass) {
            setPreferences((prev) => {
              const next = { ...prev, selectedClass: restored.selectedClass! };
              try {
                localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
              } catch {
                // Ignore storage quota issues
              }
              return next;
            });
          }
          if (!restoredSessionRef.current) {
            restoredSessionRef.current = true;
            setCurrentView((curr) =>
              curr === 'home' || curr === 'auth'
                ? restored.role === 'teacher'
                  ? 'teacher_portal'
                  : 'student_portal'
                : curr
            );
          }
        }
      } catch (err) {
        console.error('Failed to restore local demo session:', err);
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadPortalStateForProfile]);

  const updatePreferences = (patch: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const safePatch =
        lockedStudentClass !== undefined
          ? { ...patch, selectedClass: lockedStudentClass }
          : patch;
      const next = { ...prev, ...safePatch };
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota issues
      }
      return next;
    });
  };

  const handleSaveExperimentProgress = (
    experimentId: string,
    patch: {
      quizScore?: number;
      quizTotal?: number;
      observation?: string;
      markCompleted?: boolean;
    }
  ) => {
    const expMeta = EXPERIMENT_CATALOGUE.find((e) => e.id === experimentId);
    if (patch.observation?.trim()) {
      handleRecordRewardEvent({ type: 'observation_recorded', experimentId });
    }
    if (
      typeof patch.quizScore === 'number' &&
      typeof patch.quizTotal === 'number' &&
      patch.quizTotal > 0
    ) {
      handleRecordRewardEvent({
        type: 'quiz_submitted',
        experimentId,
        score: patch.quizScore,
        total: patch.quizTotal,
      });
    }
    if (patch.markCompleted) {
      setRecentCompletedExperimentId(experimentId);
      handleRecordRewardEvent({
        type: 'experiment_completed',
        experimentId,
        engineId: expMeta?.simulationEngineId ?? undefined,
      });
    }
    if (patch.observation?.trim() || typeof patch.quizScore === 'number' || patch.markCompleted) {
      recordExperimentAccess(experimentId, activeLabMode);
    }

    // When signed in as a student, persist strictly to this student's IndexedDB scope
    if (userProfile?.role === 'student') {
      persistLocalStudentProgress(userProfile.uid, experimentId, patch)
        .then(() => loadPortalStateForProfile(userProfile))
        .catch((err) => {
          console.error('Failed to persist student progress:', err);
        });
      return;
    }

    if (userProfile?.role === 'teacher') {
      return;
    }

    // Guest browsing (unauthenticated) uses local browser cache
    setLocalProgress((prev) => {
      const existing = prev[experimentId];
      const existingObs = existing?.recordedObservations ?? [];
      const trimmedObs = patch.observation?.trim();
      const nextObservations =
        trimmedObs && !existingObs.includes(trimmedObs)
          ? [...existingObs, trimmedObs]
          : existingObs;

      const nextScore =
        typeof patch.quizScore === 'number'
          ? typeof existing?.quizScore === 'number'
            ? Math.max(existing.quizScore, patch.quizScore)
            : patch.quizScore
          : existing?.quizScore;

      const nextTotal =
        typeof patch.quizTotal === 'number' ? patch.quizTotal : existing?.quizTotal;

      const updated: StudentProgressMap = {
        ...prev,
        [experimentId]: {
          experimentId,
          completedAt:
            patch.markCompleted || !existing?.completedAt
              ? new Date().toISOString()
              : existing.completedAt,
          quizScore: nextScore,
          quizTotal: nextTotal,
          recordedObservations: nextObservations,
        },
      };

      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage quota issues
      }

      return updated;
    });
  };

  const handleLanguageChange = (language: LanguageCode) => {
    updatePreferences({ language });
    handleRecordRewardEvent({ type: 'language_used', language });
    setLearningSession((prev) => ({
      ...prev,
      selectedLanguage: language,
    }));
    if (activeAnalysis?.source === 'built_in_module') {
      setActiveAnalysis(getBuiltInMagnetismModule(language));
    }
  };

  const handleSelectClass = (classLevel: GradeClassLevel, navigateToLibrary = true) => {
    // Part 3: Strictly lock student accounts to their registered class
    if (userProfile?.role === 'student') {
      const registeredClass = userProfile.selectedClass ?? 6;
      if (classLevel !== registeredClass) {
        setAccessNotice(
          `Your student account is registered in Class ${registeredClass} and cannot switch to Class ${classLevel}.`
        );
      }
      updatePreferences({ selectedClass: registeredClass });
      if (navigateToLibrary) {
        setCurrentView('explore');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    updatePreferences({ selectedClass: classLevel });

    if (navigateToLibrary) {
      setCurrentView('explore');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnalysisComplete = (
    result: TextbookAnalysisResult,
    fileName: string,
    previewUrl: string,
    rawImage?: { base64: string; mimeType: string }
  ) => {
    lastScannedImageRef.current = rawImage ?? null;
    setGenerationError(null);
    const enriched: TextbookAnalysisResult = {
      ...result,
      imagePreviewUrl: previewUrl,
    };
    setActiveAnalysis(enriched);

    const newSession: SavedStudySession = {
      id: `${Date.now()}`,
      savedAt: new Date().toISOString(),
      fileName,
      analysis: {
        ...result,
      },
    };

    if (userProfile) {
      saveAccountStudySession(userProfile.uid, newSession)
        .then(() => getAccountStudySessions(userProfile.uid))
        .then(setSessions)
        .catch(() => {
          setSessions((prev) => [newSession, ...prev].slice(0, 8));
        });
    } else {
      setSessions((prev) => {
        const updated = [newSession, ...prev].slice(0, 8);
        try {
          localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore storage quota issues
        }
        return updated;
      });
    }

    setCurrentView('concepts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSampleConcepts = () => {
    lastScannedImageRef.current = null;
    setGenerationError(null);
    setActiveAnalysis(getBuiltInMagnetismModule(preferences.language));
    setCurrentView('concepts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchLab = (mode?: SimulationMode) => {
    setActiveGuidedActivity(null);
    setActiveExperiment(null);
    setActiveDynamicExperiment(null);
    setActiveLabMode(mode ?? preferences.defaultSimulationMode);
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchExperiment = (
    experiment: ExperimentCatalogItem,
    mode?: SimulationMode
  ) => {
    const resolvedMode = mode ?? preferences.defaultSimulationMode;
    setActiveGuidedActivity(null);
    setActiveDynamicExperiment(null);
    setActiveExperiment(experiment);
    setActiveLabMode(resolvedMode);
    recordExperimentAccess(experiment.id, resolvedMode);
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchDynamicExperiment = (spec: DynamicExperimentSpec) => {
    setActiveGuidedActivity(null);
    setActiveExperiment(null);
    setActiveDynamicExperiment(spec);
    setActiveLabMode(spec.supports3d ? spec.visualizationMode : '2d');
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDynamicExperiment = (spec: DynamicExperimentSpec) => {
    saveGeneratedExperimentToLibrary(spec, userProfile?.uid)
      .then((savedSpec) => {
        setSavedDynamicExperiments((prev) => [
          savedSpec,
          ...prev.filter((item) => item.id !== savedSpec.id),
        ]);
      })
      .catch((err) => console.error('Failed to save dynamic experiment:', err));
  };

  const handleDeleteDynamicExperiment = (id: string) => {
    removeSavedDynamicExperiment(id)
      .then(() => {
        setSavedDynamicExperiments((prev) => prev.filter((item) => item.id !== id));
        if (activeDynamicExperiment?.id === id) {
          setActiveDynamicExperiment(null);
        }
      })
      .catch((err) => console.error('Failed to remove generated experiment:', err));
  };

  const handleGenerateDynamicExperiment = async (focusConcept?: PhysicsConcept) => {
    if (!activeAnalysis || isGeneratingDynamic) return;
    setGenerationError(null);
    setIsGeneratingDynamic(true);
    setGenerationStageText('1/3 · Generating structured physics experiment specification...');

    try {
      const match = matchExperimentInRegistry({
        experimentName:
          focusConcept?.name ||
          activeAnalysis.detected_experiment?.experiment_name ||
          activeAnalysis.main_topic,
        conceptName: focusConcept?.name || activeAnalysis.detected_experiment?.physics_concept,
        conceptId: focusConcept?.id,
        summary: focusConcept?.description || activeAnalysis.summary,
        equations: (focusConcept?.equations?.length
          ? focusConcept.equations
          : activeAnalysis.equations
        ).map((e) => e.formula),
        apparatus: activeAnalysis.detected_experiment?.components_apparatus,
        classLevel:
          activeAnalysis.detected_experiment?.class_level_numeric || effectiveSelectedClass,
        savedDynamicExperiments,
      });

      const response = await generateDynamicExperiment({
        analysisContext: activeAnalysis,
        focusConcept: focusConcept
          ? (focusConcept as unknown as Record<string, unknown>)
          : undefined,
        imageBase64: lastScannedImageRef.current?.base64,
        mimeType: lastScannedImageRef.current?.mimeType,
        studentClass:
          activeAnalysis.detected_experiment?.class_level_numeric || effectiveSelectedClass,
        preferredTemplateId: match.recommendedTemplateId,
        language: preferences.language,
        ownerUid: userProfile?.uid,
      });

      setGenerationStageText(
        '2/3 · Validating equations, physical bounds, and SI consistency...'
      );

      const clientValidated = validateAndSanitizeDynamicExperimentSpec(
        response.experiment as unknown as Record<string, unknown>,
        {
          studentClass: response.experiment.studentClass || effectiveSelectedClass,
          chapterNumber: response.experiment.chapterNumber,
          chapterTitle: response.experiment.chapterTitle || activeAnalysis.chapter,
          conceptId: response.experiment.conceptId || focusConcept?.id,
          conceptName: response.experiment.conceptName || focusConcept?.name,
          sourceScanTopic: activeAnalysis.main_topic,
          sourceImagePreviewUrl: activeAnalysis.imagePreviewUrl,
          ownerUid: userProfile?.uid || 'guest',
        }
      );

      const finalSpec: DynamicExperimentSpec = {
        ...clientValidated,
        id: response.experiment.id || clientValidated.id,
        createdAt: response.experiment.createdAt || clientValidated.createdAt,
      };

      setGenerationStageText('3/3 · Saving and mounting 2D/3D simulation apparatus...');
      const savedSpec = await saveGeneratedExperimentToLibrary(finalSpec, userProfile?.uid);
      setSavedDynamicExperiments((prev) => [
        savedSpec,
        ...prev.filter((item) => item.id !== savedSpec.id),
      ]);
      handleLaunchDynamicExperiment(savedSpec);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not generate a validated simulation for this page. Please retry.';
      setGenerationError(msg);
    } finally {
      setIsGeneratingDynamic(false);
      setGenerationStageText(null);
    }
  };

  const handleLaunchGuidedActivity = (activity: GuidedClassroomActivity) => {
    const exp = EXPERIMENT_CATALOGUE.find((e) => e.id === activity.experimentId) || null;
    const resolvedMode = preferences.defaultSimulationMode;
    setActiveDynamicExperiment(null);
    setActiveExperiment(exp);
    setActiveGuidedActivity(activity);
    setActiveLabMode(resolvedMode);
    if (exp) {
      recordExperimentAccess(exp.id, resolvedMode);
    }
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitGuidedCompletion = async (payload: {
    selectedPredictionIndex: number;
    quizScore: number;
    quizTotal: number;
    summaryNotes?: string;
  }) => {
    if (!userProfile || userProfile.role !== 'student' || !activeGuidedActivity) return;
    await submitStudentGuidedCompletion(
      userProfile.uid,
      activeGuidedActivity.activityId,
      payload
    );
    await loadPortalStateForProfile(userProfile);
    handleRecordRewardEvent({
      type: 'guided_activity_completed',
      activityId: activeGuidedActivity.activityId,
      engineId: activeGuidedActivity.simulationEngineId,
    });
  };

  const handleAskNovaFromDashboard = (prefillQuestion?: string) => {
    const preferredExp =
      EXPERIMENT_CATALOGUE.find(
        (e) => e.classLevel === effectiveSelectedClass && e.simulationEngineId
      ) ?? null;
    setActiveGuidedActivity(null);
    setActiveDynamicExperiment(null);
    setActiveExperiment(preferredExp);
    setActiveLabMode(preferences.defaultSimulationMode);
    setInitialTutorPrefill(prefillQuestion ?? '');
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchFromConcept = (
    simulationId?: string,
    matchedExperimentId?: string
  ) => {
    setAccessNotice(null);

    if (matchedExperimentId) {
      const directMatch = EXPERIMENT_CATALOGUE.find((e) => e.id === matchedExperimentId);
      if (
        directMatch &&
        (lockedStudentClass === undefined || directMatch.classLevel === lockedStudentClass)
      ) {
        handleLaunchExperiment(directMatch);
        return;
      }
    }

    const { engineId, resolvedEntry, matches } = getExperimentsForConceptSimulation(
      simulationId,
      EXPERIMENT_CATALOGUE,
      lockedStudentClass
    );

    if (matches.length === 1) {
      handleLaunchExperiment(matches[0]);
      return;
    }

    if (matches.length > 1) {
      if (engineId === 'bar_magnet') {
        const preferred =
          matches.find((m) => m.classLevel === effectiveSelectedClass) ?? matches[0];
        handleLaunchExperiment(preferred);
        return;
      }

      const first = matches[0];
      const chapter =
        NCERT_CLASS_CURRICULA[first.classLevel]?.chapters.find((c) => c.id === first.chapterId) ?? {
          id: first.chapterId,
          classLevel: first.classLevel,
          chapterNumber: first.chapterNumber,
          title: resolvedEntry?.label || first.chapterTitle,
          textbookTitle: `NCERT Class ${first.classLevel}`,
          verificationStatus: first.verificationStatus,
          physicsTopics: matches.map((m) => m.relevantConcept),
          topicAreas: [first.topicArea],
        };
      setConceptChooser({ chapter, experiments: matches });
      return;
    }

    if (engineId === 'bar_magnet' && lockedStudentClass === undefined) {
      handleLaunchLab();
      return;
    }

    const label = resolvedEntry?.label || simulationId || 'this Physics concept';
    setAccessNotice(
      lockedStudentClass !== undefined
        ? `No pre-built simulation for "${label}" is assigned to Class ${lockedStudentClass}; use Generate & Launch Interactive Experiment below.`
        : `No pre-built NCERT simulation module matches "${label}" yet; use Generate & Launch Interactive Experiment.`
    );
  };

  const handleDeleteSession = (id: string) => {
    if (userProfile) {
      deleteAccountStudySession(userProfile.uid, id)
        .then(() => getAccountStudySessions(userProfile.uid))
        .then(setSessions)
        .catch(() => {
          setSessions((prev) => prev.filter((s) => s.id !== id));
        });
      return;
    }

    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  // Strict Auth & Role-Based Navigation Guard
  const handleNavigate = (view: AppView) => {
    setAccessNotice(null);
    setMobileSidebarOpen(false);

    // Before login, only the informational Landing Page ('home') and Auth Portal ('auth') are accessible
    if (!userProfile && view !== 'home' && view !== 'auth') {
      setAuthIntentRole(view === 'teacher_portal' ? 'teacher' : 'student');
      setAuthIntentMode('login');
      setCurrentView('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'teacher_portal' && userProfile && userProfile.role !== 'teacher') {
      setAccessNotice(
        'Access restricted: Student accounts cannot open the Teacher Portal.'
      );
      setCurrentView('student_portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view === 'student_portal' && userProfile && userProfile.role !== 'student') {
      setAccessNotice(
        'Signed in as a Teacher. Redirected to your Teacher Portal.'
      );
      setCurrentView('teacher_portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (view !== 'pocket_lab' && view !== 'auth') {
      previousNonPocketViewRef.current = view;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePocketLab = (nextPocketLab: boolean) => {
    setAccessNotice(null);
    setMobileSidebarOpen(false);
    if (nextPocketLab) {
      if (currentView !== 'pocket_lab' && currentView !== 'auth') {
        previousNonPocketViewRef.current = currentView;
      }
      handleNavigate('pocket_lab');
      return;
    }
    const returnView =
      previousNonPocketViewRef.current && previousNonPocketViewRef.current !== 'pocket_lab'
        ? previousNonPocketViewRef.current
        : 'home';
    handleNavigate(returnView);
  };

  const handleSidebarSelect = (item: SidebarItemId) => {
    setAccessNotice(null);
    setMobileSidebarOpen(false);

    switch (item) {
      case 'pocket_lab':
        handleTogglePocketLab(true);
        return;
      case 'home':
        handleNavigate('home');
        return;
      case 'learn':
        if (activeAnalysis) {
          handleNavigate('concepts');
        } else {
          handleOpenSampleConcepts();
        }
        return;
      case 'experiments':
        handleNavigate('explore');
        return;
      case 'scanner':
        handleNavigate('scanner');
        return;
      case 'challenge':
        handleNavigate('challenge');
        return;
      case 'ai_tutor':
        handleAskNovaFromDashboard();
        return;
      case 'my_progress':
        if (userProfile?.role === 'teacher') {
          handleNavigate('teacher_portal');
        } else if (userProfile?.role === 'student') {
          handleNavigate('student_portal');
        } else {
          handleNavigate('learning');
        }
        return;
      case 'achievements':
        setAchievementsOpen(true);
        return;
    }
  };

  const handleOpenPortalAuth = (
    role: UserRole = 'student',
    mode: 'login' | 'register' = 'login',
    targetView?: AppView
  ) => {
    setAccessNotice(null);
    setMobileSidebarOpen(false);
    setAuthIntentRole(role);
    setAuthIntentMode(mode);
    postAuthTargetViewRef.current = targetView ?? null;
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthenticated = async (profile: UserProfile) => {
    restoredSessionRef.current = true;
    setAccessNotice(null);
    setUserProfile(profile);
    await loadPortalStateForProfile(profile);
    if (profile.role === 'student' && profile.selectedClass) {
      updatePreferences({ selectedClass: profile.selectedClass });
    }
    const desiredTarget = postAuthTargetViewRef.current;
    postAuthTargetViewRef.current = null;
    if (desiredTarget === 'pocket_lab') {
      previousNonPocketViewRef.current = profile.role === 'teacher' ? 'teacher_portal' : 'home';
      setCurrentView('pocket_lab');
    } else {
      setCurrentView(profile.role === 'teacher' ? 'teacher_portal' : 'home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await signOutLocalAccount();
    restoredSessionRef.current = false;
    setUserProfile(null);
    setStudentMemberships([]);
    setFirestoreProgressList([]);
    setFirestoreProgressMap({});
    setStudentAssessments([]);
    setTeacherClasses([]);
    setTeacherMemberships([]);
    setTeacherProgressRecords([]);
    setTeacherAssessments([]);
    setTeacherNotifications([]);
    setTeacherActivityFeed([]);
    setStudentGuidedActivities([]);
    setStudentGuidedCompletions([]);
    setTeacherGuidedActivities([]);
    setTeacherGuidedCompletions([]);
    setActiveGuidedActivity(null);
    setLatestBadgeToast(null);
    setInitialTutorPrefill(null);
    setRecentCompletedExperimentId(null);
    setLastAccessedExperiment(loadLastAccessedExperiment('guest'));
    setRewardState(loadRewardState('guest'));
    setLocalProgress(loadLocalStudentProgress());
    setSessions(loadSessions());
    setActiveAnalysis(null);
    setActiveExperiment(null);
    setActiveDynamicExperiment(null);
    setGenerationError(null);
    setGenerationStageText(null);
    lastScannedImageRef.current = null;
    setAccessNotice(null);
    setAuthIntentMode('login');
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F6] text-[#171A2F]">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        language={preferences.language}
        onLanguageChange={handleLanguageChange}
        selectedClass={effectiveSelectedClass}
        lockedClass={lockedStudentClass}
        onSelectClass={(cls) => handleSelectClass(cls, currentView === 'explore')}
        userProfile={userProfile}
        authReady={authReady}
        teacherNotifications={teacherNotifications}
        studentGuidedActivities={studentGuidedActivities}
        latestBadgeToast={latestBadgeToast}
        onDismissBadgeToast={() => setLatestBadgeToast(null)}
        onOpenGuidedActivity={handleLaunchGuidedActivity}
        onToggleMobileSidebar={() => setMobileSidebarOpen((v) => !v)}
        mobileSidebarOpen={mobileSidebarOpen}
        onTogglePocketLab={handleTogglePocketLab}
        onOpenAuth={() => handleOpenPortalAuth('student', 'login')}
        onLogout={handleLogout}
        t={t}
      />

      <div className="flex-1 flex min-w-0">
        <SidebarNav
          currentView={currentView}
          activeSidebarOverride={achievementsOpen ? 'achievements' : null}
          language={preferences.language}
          userProfile={userProfile}
          rewardState={rewardState}
          reducedMotion={preferences.reducedMotion}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onSelectItem={handleSidebarSelect}
          onNavigateView={handleNavigate}
          onLogout={handleLogout}
        />

        <div className="relative flex-1 flex flex-col min-w-0">

          {accessNotice && (
            <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#E7B5AF] text-xs sm:text-sm text-[#7A271A] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{accessNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAccessNotice(null)}
                  className="text-xs font-semibold underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <main className="relative z-10 flex-1 min-w-0">
            <PortalErrorBoundary onResetView={() => handleNavigate('home')}>
              {/* LOGGED OUT: Only Pure Informational Landing Page or Auth Screen */}
              {!userProfile ? (
                currentView === 'auth' ? (
                  <AuthPortalView
                    initialRole={authIntentRole}
                    initialMode={authIntentMode}
                    onAuthenticated={handleAuthenticated}
                    onCancel={() => handleNavigate('home')}
                  />
                ) : (
                  <LandingPageView
                    language={preferences.language}
                    reducedMotion={preferences.reducedMotion}
                    onOpenAuth={handleOpenPortalAuth}
                  />
                )
              ) : (
                <>
                  {/* LOGGED IN: Cleanly Separated Dedicated Workspaces */}
                  {currentView === 'home' && (
                    <DashboardView
                      language={preferences.language}
                      t={t}
                      selectedClass={effectiveSelectedClass}
                      studentProgress={effectiveStudentProgress}
                      userProfile={userProfile}
                      rewardState={rewardState}
                      latestBadgeToast={latestBadgeToast}
                      reducedMotion={preferences.reducedMotion}
                      lastAccessedExperiment={lastAccessedExperiment}
                      onDismissBadgeToast={() => setLatestBadgeToast(null)}
                      onOpenPocketLab={() => handleTogglePocketLab(true)}
                      onOpenChaptersLibrary={() => handleNavigate('explore')}
                      onOpenScanner={() => handleNavigate('scanner')}
                      onOpenDailyChallenge={() => handleNavigate('challenge')}
                      onOpenConcepts={handleOpenSampleConcepts}
                      onOpenAiTutor={handleAskNovaFromDashboard}
                      onOpenActivePortal={() =>
                        handleNavigate(
                          userProfile.role === 'teacher' ? 'teacher_portal' : 'student_portal'
                        )
                      }
                      onOpenAchievements={() => setAchievementsOpen(true)}
                      onLaunchExperiment={handleLaunchExperiment}
                      onSaveProgress={handleSaveExperimentProgress}
                    />
                  )}

                  {currentView === 'pocket_lab' && (
                    <PocketLabView onExitPocketLab={() => handleTogglePocketLab(false)} />
                  )}

                  {currentView === 'auth' && (
                    <AuthPortalView
                      initialRole={authIntentRole}
                      initialMode={authIntentMode}
                      onAuthenticated={handleAuthenticated}
                      onCancel={() => handleNavigate('home')}
                    />
                  )}

                  {currentView === 'scanner' && (
                    <TextbookScannerView
                      language={preferences.language}
                      t={t}
                      geminiConfigured={geminiConfigured}
                      sessions={sessions}
                      onAnalysisComplete={handleAnalysisComplete}
                      onOpenSession={(session) => {
                        setActiveAnalysis(session.analysis);
                        handleNavigate('concepts');
                      }}
                      onBackHome={() => handleNavigate('home')}
                    />
                  )}

                  {currentView === 'challenge' && (
                    <DailyChallengeView
                      language={preferences.language}
                      selectedClass={effectiveSelectedClass}
                      rewardState={rewardState}
                      reducedMotion={preferences.reducedMotion}
                      onSolveDailyChallenge={(dateIso) =>
                        handleRecordRewardEvent({ type: 'daily_challenge_solved', dateIso })
                      }
                      onLaunchExperiment={handleLaunchExperiment}
                      onBackHome={() => handleNavigate('home')}
                    />
                  )}

                  {currentView === 'student_portal' && userProfile.role === 'student' && (
                    <StudentPortalView
                      profile={userProfile}
                      memberships={studentMemberships}
                      progressRecords={firestoreProgressList}
                      studentProgressMap={effectiveStudentProgress}
                      assessmentResults={studentAssessments}
                      guidedActivities={studentGuidedActivities}
                      guidedCompletions={studentGuidedCompletions}
                      t={t}
                      onProfileUpdated={(next) => {
                        setUserProfile(next);
                        if (next.selectedClass) {
                          updatePreferences({ selectedClass: next.selectedClass });
                        }
                      }}
                      onRefreshData={() => loadPortalStateForProfile(userProfile)}
                      onOpenLibrary={() => handleNavigate('explore')}
                      onLaunchExperiment={handleLaunchExperiment}
                      onLaunchGuidedActivity={handleLaunchGuidedActivity}
                      onSaveProgress={handleSaveExperimentProgress}
                      onOpenTextbookScanner={() => handleNavigate('scanner')}
                      onLogout={handleLogout}
                    />
                  )}

                  {currentView === 'teacher_portal' && userProfile.role === 'teacher' && (
                    <TeacherPortalView
                      profile={userProfile}
                      classes={teacherClasses}
                      memberships={teacherMemberships}
                      studentProgress={teacherProgressRecords}
                      assessmentResults={teacherAssessments}
                      notifications={teacherNotifications}
                      activityFeed={teacherActivityFeed}
                      guidedActivities={teacherGuidedActivities}
                      guidedCompletions={teacherGuidedCompletions}
                      onProfileUpdated={setUserProfile}
                      onRefreshData={() => loadPortalStateForProfile(userProfile)}
                      onOpenLibraryForGrade={(grade) => handleSelectClass(grade, true)}
                      onLogout={handleLogout}
                    />
                  )}

                  {currentView === 'explore' && (
                    <ClassLibraryView
                      selectedClass={effectiveSelectedClass}
                      lockedClass={lockedStudentClass}
                      onSelectClass={(cls) => handleSelectClass(cls, false)}
                      studentProgress={effectiveStudentProgress}
                      t={t}
                      onLaunchExperiment={handleLaunchExperiment}
                      onSaveProgress={handleSaveExperimentProgress}
                      savedDynamicExperiments={savedDynamicExperiments}
                      onLaunchDynamicExperiment={handleLaunchDynamicExperiment}
                      onDeleteDynamicExperiment={handleDeleteDynamicExperiment}
                    />
                  )}

          {currentView === 'concepts' && (
            <ConceptExplorerView
              analysis={activeAnalysis}
              language={preferences.language}
              onLanguageChange={handleLanguageChange}
              t={t}
              onLaunchSimulation={handleLaunchFromConcept}
              savedDynamicExperiments={savedDynamicExperiments}
              onLaunchDynamicExperiment={handleLaunchDynamicExperiment}
              onGenerateDynamicExperiment={handleGenerateDynamicExperiment}
              isGeneratingDynamic={isGeneratingDynamic}
              generationStageText={generationStageText}
              generationError={generationError}
              onDismissGenerationError={() => setGenerationError(null)}
              onOpenSampleModule={handleOpenSampleConcepts}
              onBackHome={() => handleNavigate('home')}
            />
          )}

          {currentView === 'lab' && (
            <SimulationLabView
              language={preferences.language}
              onLanguageChange={handleLanguageChange}
              t={t}
              initialMode={activeLabMode}
              defaultVectorGrid={preferences.showVectorGridByDefault}
              reducedMotion={preferences.reducedMotion}
              studentClass={
                userProfile?.role === 'student' ? userProfile.selectedClass : undefined
              }
              accountName={userProfile?.name}
              activeAnalysis={activeAnalysis}
              activeExperiment={activeExperiment}
              activeDynamicExperiment={activeDynamicExperiment}
              isDynamicExperimentSaved={Boolean(
                activeDynamicExperiment &&
                  savedDynamicExperiments.some((d) => d.id === activeDynamicExperiment.id)
              )}
              onSaveDynamicExperiment={handleSaveDynamicExperiment}
              experimentCompletion={
                activeDynamicExperiment
                  ? effectiveStudentProgress[activeDynamicExperiment.id]
                  : activeExperiment
                    ? effectiveStudentProgress[activeExperiment.id]
                    : undefined
              }
              rewardState={rewardState}
              latestBadgeToast={latestBadgeToast}
              onDismissBadgeToast={() => setLatestBadgeToast(null)}
              onRecordRewardEvent={handleRecordRewardEvent}
              guidedActivity={activeGuidedActivity}
              guidedCompleted={Boolean(
                activeGuidedActivity &&
                  studentGuidedCompletions.some(
                    (c) => c.activityId === activeGuidedActivity.activityId
                  )
              )}
              onSubmitGuidedCompletion={handleSubmitGuidedCompletion}
              onExitGuidedMode={() => setActiveGuidedActivity(null)}
              initialOpenTutorPrefill={initialTutorPrefill}
              onConsumeTutorPrefill={() => setInitialTutorPrefill(null)}
              onSaveExperimentProgress={handleSaveExperimentProgress}
              sessionContext={learningSession}
              onUpdateSessionContext={setLearningSession}
              onBackToConcepts={activeAnalysis ? () => handleNavigate('concepts') : undefined}
              onBackToLibrary={() => handleNavigate('explore')}
            />
          )}

          {currentView === 'learning' && (
            <MyLearningView
              sessions={sessions}
              savedDynamicExperiments={savedDynamicExperiments}
              t={t}
              onOpenSession={(session) => {
                setActiveAnalysis(session.analysis);
                handleNavigate('concepts');
              }}
              onDeleteSession={handleDeleteSession}
              onLaunchDynamicExperiment={handleLaunchDynamicExperiment}
              onDeleteDynamicExperiment={handleDeleteDynamicExperiment}
              onOpenMagnetismLab={() => handleLaunchLab()}
              onGoHome={() => handleNavigate('home')}
            />
          )}

                  {currentView === 'settings' && (
                    <SettingsView
                      preferences={preferences}
                      onUpdatePreferences={updatePreferences}
                      t={t}
                      geminiConfigured={geminiConfigured}
                      userProfile={userProfile}
                      onOpenAuth={() => handleOpenPortalAuth('student', 'login')}
                      onOpenPortal={() =>
                        handleNavigate(
                          userProfile.role === 'teacher' ? 'teacher_portal' : 'student_portal'
                        )
                      }
                      onLogout={handleLogout}
                    />
                  )}
                </>
              )}
            </PortalErrorBoundary>
          </main>

          {currentView !== 'pocket_lab' && (
            <footer className="border-t border-[#D8D1CA] bg-white/70 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#756B63]">
                <p className="font-medium text-[#302820]">{t.footer.tagline}</p>
                <p>{t.footer.languagesNote}</p>
              </div>
            </footer>
          )}
        </div>
      </div>

      {conceptChooser && (
        <ConceptExperimentChooserModal
          chapter={conceptChooser.chapter}
          experiments={conceptChooser.experiments}
          studentProgress={effectiveStudentProgress}
          t={t}
          onLaunchExperiment={handleLaunchExperiment}
          onOpenActivityGuide={(exp) => setConceptActivityModal(exp)}
          onClose={() => setConceptChooser(null)}
        />
      )}

      {conceptActivityModal && (
        <ExperimentActivityModal
          experiment={conceptActivityModal}
          completion={effectiveStudentProgress[conceptActivityModal.id]}
          t={t}
          onClose={() => setConceptActivityModal(null)}
          onSaveProgress={handleSaveExperimentProgress}
        />
      )}

      <AchievementsModal
        isOpen={achievementsOpen}
        language={preferences.language}
        rewardState={rewardState}
        reducedMotion={preferences.reducedMotion}
        onClose={() => setAchievementsOpen(false)}
      />
    </div>
  );
}
