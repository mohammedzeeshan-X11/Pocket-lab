import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Compass,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type {
  AdaptiveSimulationId,
  ExperimentCatalogItem,
  ExperimentParametersSnapshot,
  LanguageCode,
  LearningSessionContext,
  SimulationEngineId,
  SimulationMode,
  StudentExperimentCompletion,
  TextbookAnalysisResult,
  TutorChatMessage,
  TutorParameterSuggestion,
  TutorRequestedStyle,
  TutorResponse,
} from '../types/physics';
import type { DynamicComponentDef, DynamicExperimentSpec } from '../types/dynamicExperiment';
import type {
  BadgeDefinition,
  CompanionEventType,
  CompanionMessageState,
  GuidedClassroomActivity,
  GuidedStepId,
  RewardProgressState,
} from '../types/companion';
import type { TranslationBundle } from '../i18n/translations';
import { getDynamicExperimentVisual } from '../data/componentImages';
import {
  ADAPTIVE_SIMULATION_REGISTRY,
  resolveAdaptiveSimulation,
} from '../data/simulationRegistry';
import {
  askPhysicsTutorStream,
  requestCompanionReaction,
} from '../services/explainabilityApi';
import {
  loadRewardState,
  type RewardMilestoneEvent,
} from '../services/rewardsEngine';
import { buildLocalCompanionMessage } from '../utils/companionFallback';
import { getSimulationComponents } from '../systems/componentInteraction/registry';
import { useTwoStageInteraction } from '../systems/componentInteraction/useTwoStageInteraction';
import { LanguageSelector } from './LanguageSelector';
import { Magnetism2DCanvas, type CompassTelemetry } from './simulations/Magnetism2DCanvas';
import { Magnetism3DViewport } from './simulations/Magnetism3DViewport';
import { ViewportComponentOverlay } from './ViewportComponentOverlay';
import { VoiceTutorPanel } from './VoiceTutorPanel';
import { ParameterSliderInput } from './ParameterSliderInput';
import { CompanionDock } from './CompanionDock';
import { GuidedClassroomFlowBar } from './GuidedClassroomFlowBar';
import {
  MultiDomainLabStage,
  type MultiDomainTutorContext,
} from './MultiDomainLabStage';
import { DynamicLabStage } from './DynamicLabStage';
import { ExperimentAssessment } from './ExperimentAssessment';

interface SimulationLabViewProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  t: TranslationBundle;
  initialMode: SimulationMode;
  defaultVectorGrid: boolean;
  reducedMotion: boolean;
  studentClass?: number;
  accountName?: string;
  activeAnalysis?: TextbookAnalysisResult | null;
  activeExperiment?: ExperimentCatalogItem | null;
  activeDynamicExperiment?: DynamicExperimentSpec | null;
  isDynamicExperimentSaved?: boolean;
  onSaveDynamicExperiment?: (spec: DynamicExperimentSpec) => void;
  experimentCompletion?: StudentExperimentCompletion;
  rewardState?: RewardProgressState;
  latestBadgeToast?: BadgeDefinition | null;
  onDismissBadgeToast?: () => void;
  onRecordRewardEvent?: (event: RewardMilestoneEvent) => void;
  guidedActivity?: GuidedClassroomActivity | null;
  guidedCompleted?: boolean;
  onSubmitGuidedCompletion?: (payload: {
    selectedPredictionIndex: number;
    quizScore: number;
    quizTotal: number;
    summaryNotes?: string;
  }) => Promise<void>;
  onExitGuidedMode?: () => void;
  initialOpenTutorPrefill?: string | null;
  onConsumeTutorPrefill?: () => void;
  onSaveExperimentProgress?: (
    experimentId: string,
    patch: {
      quizScore?: number;
      quizTotal?: number;
      observation?: string;
      markCompleted?: boolean;
    }
  ) => void;
  sessionContext: LearningSessionContext;
  onUpdateSessionContext: React.Dispatch<React.SetStateAction<LearningSessionContext>>;
  onBackToConcepts?: () => void;
  onBackToLibrary?: () => void;
}

export const SimulationLabView: React.FC<SimulationLabViewProps> = ({
  language,
  onLanguageChange,
  t,
  initialMode,
  defaultVectorGrid,
  reducedMotion,
  studentClass,
  accountName,
  activeAnalysis = null,
  activeExperiment = null,
  activeDynamicExperiment = null,
  isDynamicExperimentSaved = false,
  onSaveDynamicExperiment,
  experimentCompletion,
  rewardState,
  latestBadgeToast = null,
  onDismissBadgeToast,
  onRecordRewardEvent,
  guidedActivity = null,
  guidedCompleted = false,
  onSubmitGuidedCompletion,
  onExitGuidedMode,
  initialOpenTutorPrefill = null,
  onConsumeTutorPrefill,
  onSaveExperimentProgress,
  sessionContext,
  onUpdateSessionContext,
  onBackToConcepts,
  onBackToLibrary,
}) => {
  const labContainerRef = useRef<HTMLDivElement>(null);

  const isDynamic = Boolean(activeDynamicExperiment);
  const staticEngineId: SimulationEngineId =
    activeExperiment?.simulationEngineId || 'bar_magnet';
  const activeEngineId: SimulationEngineId | 'dynamic_generated' = isDynamic
    ? 'dynamic_generated'
    : staticEngineId;

  const [labSectionTab, setLabSectionTab] = useState<
    'experiment' | 'introduction' | 'observations' | 'assessment'
  >('experiment');
  const [observationDraft, setObservationDraft] = useState('');

  const [mode, setMode] = useState<SimulationMode>(initialMode);
  const [isPlaying, setIsPlaying] = useState(true);
  const [magnetAngleDeg, setMagnetAngleDeg] = useState(0);
  const [magnetPitchDeg, setMagnetPitchDeg] = useState(0);
  const [strength, setStrength] = useState(1.2);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showVectorGrid, setShowVectorGrid] = useState(defaultVectorGrid);
  const [resetSignal, setResetSignal] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Adaptive simulation state
  const [activeAdaptiveId, setActiveAdaptiveId] =
    useState<AdaptiveSimulationId>('bar_magnet_explorer');
  const [compassCount, setCompassCount] = useState(1);
  const [showCompass, setShowCompass] = useState(true);
  const [showDirectionArrows, setShowDirectionArrows] = useState(true);
  const [highlightIntersectionTest, setHighlightIntersectionTest] = useState(false);

  // Personalized Conversational Voice Tutor state & Drawer state
  const [tutorResponse, setTutorResponse] = useState<TutorResponse | null>(null);
  const [chatMessages, setChatMessages] = useState<TutorChatMessage[]>([]);
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<Record<string, boolean>>({});
  const [isAskingTutor, setIsAskingTutor] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const activeTutorAbortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const [showMoreBarControls, setShowMoreBarControls] = useState(false);
  const [compassPos, setCompassPos] = useState<{ x: number; y: number }>({ x: 135, y: 90 });
  const [pendingMultiDomainSuggestion, setPendingMultiDomainSuggestion] = useState<{
    id: string;
    suggestion: TutorParameterSuggestion;
  } | null>(null);
  const [firstOpenHintVisible, setFirstOpenHintVisible] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('physix_sim_hint_dismissed') !== '1';
    } catch {
      return true;
    }
  });
  const [multiDomainCtx, setMultiDomainCtx] = useState<MultiDomainTutorContext | null>(null);
  const [dynamicCtx, setDynamicCtx] = useState<{
    params: Record<string, number>;
    telemetry: Record<string, string | number>;
    selectedComponent?: DynamicComponentDef | null;
  } | null>(null);

  const [telemetry, setTelemetry] = useState<CompassTelemetry>({
    magnitudeMt: 1.45,
    angleDeg: 38,
    relX: 135,
    relY: 90,
  });

  const localizedDynamic = activeDynamicExperiment?.translations?.[language];
  const dynamicTitle = localizedDynamic?.title || activeDynamicExperiment?.title;
  const activeExperimentTitle = activeDynamicExperiment
    ? dynamicTitle || activeDynamicExperiment.title
    : activeExperiment
      ? activeExperiment.title
      : t.lab.subtitle;
  const effectiveStudentClass =
    studentClass || activeDynamicExperiment?.studentClass || activeExperiment?.classLevel;
  const activeStructuredId = activeDynamicExperiment?.id || activeExperiment?.id;
  const effectiveRewardState = rewardState ?? loadRewardState('guest');
  const [companionMessage, setCompanionMessage] = useState<CompanionMessageState>(() =>
    buildLocalCompanionMessage({
      eventType: 'experiment_intro',
      language,
      studentName: accountName,
      studentClass: effectiveStudentClass,
      experimentTitle: activeExperimentTitle,
    })
  );
  const companionAbortRef = useRef<AbortController | null>(null);
  const lastRemoteReactAtRef = useRef<number>(0);

  const triggerCompanionReaction = useCallback(
    (
      eventType: CompanionEventType,
      opts?: {
        componentName?: string;
        parameterSummary?: string;
        extraContext?: string;
        pointTarget?: CompanionMessageState['pointTarget'];
        skipRemote?: boolean;
      }
    ) => {
      const localMsg = buildLocalCompanionMessage({
        eventType,
        language,
        studentName: accountName,
        studentClass: effectiveStudentClass,
        experimentTitle: activeExperimentTitle,
        componentName: opts?.componentName,
        parameterSummary: opts?.parameterSummary,
        pointTarget:
          opts?.pointTarget ??
          (eventType === 'component_inspected'
            ? 'left_canvas'
            : eventType === 'parameter_changed'
              ? 'right_controls'
              : 'none'),
      });
      setCompanionMessage(localMsg);

      const now = Date.now();
      const isMinorSliderTick = eventType === 'parameter_changed';
      if (opts?.skipRemote || (isMinorSliderTick && now - lastRemoteReactAtRef.current < 7500)) {
        return;
      }
      lastRemoteReactAtRef.current = now;

      if (companionAbortRef.current) {
        companionAbortRef.current.abort();
      }
      const ac = new AbortController();
      companionAbortRef.current = ac;

      void requestCompanionReaction(
        {
          eventType,
          language,
          studentName: accountName,
          studentClass: effectiveStudentClass,
          experimentTitle: activeExperimentTitle,
          engineId: activeEngineId,
          selectedComponentName: opts?.componentName,
          parameterSummary: opts?.parameterSummary,
          extraContext: opts?.extraContext,
        },
        ac.signal
      ).then((res) => {
        if (!res || ac.signal.aborted || !isMountedRef.current) return;
        setCompanionMessage((prev) => ({
          ...prev,
          id: `cmp_${Date.now()}`,
          text: res.speechText,
          emotion: res.emotion,
          quickPrompt: res.quickPromptSuggestion || prev.quickPrompt,
          createdAt: Date.now(),
        }));
      });
    },
    [language, accountName, effectiveStudentClass, activeExperimentTitle, activeEngineId]
  );

  const toggleTutor = useCallback(() => {
    setTutorOpen((prev) => !prev);
  }, []);

  const handleDismissFirstOpenHint = useCallback(() => {
    setFirstOpenHintVisible(false);
    try {
      sessionStorage.setItem('physix_sim_hint_dismissed', '1');
    } catch {
      // ignore storage errors
    }
  }, []);

  const interactionParameters = useMemo(
    () => ({
      activeExperimentId: activeAdaptiveId,
      mode,
      magnetAngleDeg,
      magnetPitchDeg,
      strength,
      showFieldLines,
      showVectorGrid,
      showDirectionArrows,
      compassCount,
      telemetryMagnitudeMt: telemetry.magnitudeMt,
      telemetryAngleDeg: telemetry.angleDeg,
    }),
    [
      activeAdaptiveId,
      mode,
      magnetAngleDeg,
      magnetPitchDeg,
      strength,
      showFieldLines,
      showVectorGrid,
      showDirectionArrows,
      compassCount,
      telemetry.magnitudeMt,
      telemetry.angleDeg,
    ]
  );

  const componentInteraction = useTwoStageInteraction({
    simulationId: 'bar_magnet',
    visualizationMode: mode,
    language,
    studentClass: studentClass || activeExperiment?.classLevel,
    relevantConcept: activeExperiment?.relevantConcept,
    parameters: interactionParameters,
    textbookContext: activeAnalysis,
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (activeTutorAbortRef.current && !activeTutorAbortRef.current.signal.aborted) {
        activeTutorAbortRef.current.abort('COMPONENT_UNMOUNTED');
      }
      activeTutorAbortRef.current = null;
      if (companionAbortRef.current) {
        companionAbortRef.current.abort();
        companionAbortRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (activeTutorAbortRef.current && !activeTutorAbortRef.current.signal.aborted) {
      activeTutorAbortRef.current.abort('USER_CANCELLED');
    }
    activeTutorAbortRef.current = null;
    setLabSectionTab('experiment');
    setObservationDraft('');
    setChatMessages([]);
    setTutorResponse(null);
    setTutorError(null);
    setIsAskingTutor(false);
    setAppliedSuggestionIds({});
    setPendingMultiDomainSuggestion(null);
    setMultiDomainCtx(null);
    setDynamicCtx(null);
    triggerCompanionReaction('experiment_intro', {
      extraContext: activeDynamicExperiment
        ? `${activeDynamicExperiment.educationalObjective}${activeDynamicExperiment.isSimplifiedModel && activeDynamicExperiment.limitationNote ? ` Note: ${activeDynamicExperiment.limitationNote}` : ''}`
        : undefined,
    });
  }, [activeExperiment?.id, activeDynamicExperiment?.id, activeEngineId, language]);

  const lastBarExploredIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeEngineId !== 'bar_magnet') return;
    const comp = componentInteraction.selectedComponent;
    if (!comp) {
      lastBarExploredIdRef.current = null;
      return;
    }
    if (lastBarExploredIdRef.current !== comp.id) {
      lastBarExploredIdRef.current = comp.id;
      onRecordRewardEvent?.({
        type: 'component_explored',
        engineId: 'bar_magnet',
        componentId: comp.id,
      });
      triggerCompanionReaction('component_inspected', {
        componentName: comp.displayName[language] || comp.displayName.en,
        parameterSummary: `Strength ${strength.toFixed(1)}×, Magnet Angle ${magnetAngleDeg}°`,
      });
    }
  }, [activeEngineId, componentInteraction.selectedComponent?.id, language]);

  const firstBarParamRenderRef = useRef(true);
  useEffect(() => {
    if (activeEngineId !== 'bar_magnet') return;
    if (firstBarParamRenderRef.current) {
      firstBarParamRenderRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      triggerCompanionReaction('parameter_changed', {
        parameterSummary: `Strength ${strength.toFixed(1)}×, Angle ${magnetAngleDeg}°, Mode ${mode.toUpperCase()}`,
      });
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [activeEngineId, magnetAngleDeg, magnetPitchDeg, strength, showFieldLines, showVectorGrid, mode]);

  const lastBadgeToastIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (latestBadgeToast && latestBadgeToast.id !== lastBadgeToastIdRef.current) {
      lastBadgeToastIdRef.current = latestBadgeToast.id;
      triggerCompanionReaction('badge_unlocked', {
        extraContext: `Unlocked badge: ${latestBadgeToast.title[language]}`,
      });
    }
  }, [latestBadgeToast?.id, language]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    if (componentInteraction.stage === 'idle') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        componentInteraction.closeInteraction();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [componentInteraction.stage, componentInteraction.closeInteraction]);

  const buildCurrentParamsSnapshot = useCallback(
    (): ExperimentParametersSnapshot => ({
      activeExperimentId: activeAdaptiveId,
      mode,
      magnetAngleDeg,
      magnetPitchDeg,
      strength,
      showFieldLines,
      showVectorGrid,
      showDirectionArrows,
      compassCount,
    }),
    [
      activeAdaptiveId,
      mode,
      magnetAngleDeg,
      magnetPitchDeg,
      strength,
      showFieldLines,
      showVectorGrid,
      showDirectionArrows,
      compassCount,
    ]
  );

  const handleToggleFullscreen = async () => {
    const el = labContainerRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    } else if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleReset = () => {
    setMagnetAngleDeg(0);
    setMagnetPitchDeg(0);
    setStrength(1.2);
    setShowFieldLines(true);
    setShowVectorGrid(defaultVectorGrid);
    setShowCompass(true);
    setShowDirectionArrows(true);
    setCompassCount(1);
    setHighlightIntersectionTest(false);
    setActiveAdaptiveId('bar_magnet_explorer');
    setCompassPos({ x: 135, y: 90 });
    setIsPlaying(true);
    setResetSignal((n) => n + 1);
  };

  const handleResetAdaptiveSimulation = () => {
    setActiveAdaptiveId('bar_magnet_explorer');
    setCompassCount(1);
    setShowCompass(true);
    setShowFieldLines(true);
    setShowDirectionArrows(true);
    setShowVectorGrid(defaultVectorGrid);
    setHighlightIntersectionTest(false);
    onUpdateSessionContext((prev) => ({
      ...prev,
      currentExperiment: 'bar_magnet_explorer',
    }));
  };

  const handleTelemetry = useCallback((next: CompassTelemetry) => {
    setTelemetry(next);
  }, []);

  const handleCancelAskTutor = useCallback(() => {
    if (activeTutorAbortRef.current && !activeTutorAbortRef.current.signal.aborted) {
      activeTutorAbortRef.current.abort('USER_CANCELLED');
    }
    activeTutorAbortRef.current = null;
    setIsAskingTutor(false);
  }, []);

  const handleAskTutor = async (payload: {
    textQuestion: string;
    forceAlternativeStrategy?: boolean;
    requestedStyle?: TutorRequestedStyle;
    languageOverride?: LanguageCode;
    isRetry?: boolean;
  }) => {
    if (isAskingTutor || activeTutorAbortRef.current) return;
    setTutorError(null);
    setIsAskingTutor(true);

    const requestController = new AbortController();
    activeTutorAbortRef.current = requestController;

    const effectiveLang = payload.languageOverride || language;
    const questionText = payload.textQuestion.trim();
    const lastMsg = chatMessages[chatMessages.length - 1];
    const shouldReuseLastStudentBubble =
      Boolean(payload.isRetry) &&
      lastMsg &&
      lastMsg.role === 'student' &&
      lastMsg.text.trim() === questionText;

    const studentMsgId = shouldReuseLastStudentBubble ? lastMsg.id : `st_${Date.now()}`;
    const studentBubble: TutorChatMessage = shouldReuseLastStudentBubble
      ? lastMsg
      : {
          id: studentMsgId,
          role: 'student',
          text: questionText,
          language: effectiveLang,
          timestamp: new Date().toISOString(),
        };

    const nextThread = shouldReuseLastStudentBubble
      ? chatMessages
      : [...chatMessages, studentBubble];

    const updatedHistoryForApi = nextThread.slice(-4).map((m) => ({
      role: m.role,
      text: m.text,
      strategy: m.teachingStrategy,
    }));

    if (!shouldReuseLastStudentBubble) {
      setChatMessages(nextThread);
    }

    const isBarMagnet = activeEngineId === 'bar_magnet';
    const currentSnapshot = buildCurrentParamsSnapshot();
    const selComp = componentInteraction.selectedComponent;
    const barMagnetSelectedComp = selComp
      ? {
          id: selComp.id,
          name: selComp.displayName[effectiveLang] || selComp.displayName.en,
          identification:
            selComp.identificationText[effectiveLang] || selComp.identificationText.en,
          currentState: selComp.describeCurrentState(effectiveLang, interactionParameters),
          explanationContext: selComp.explanationContext,
        }
      : null;

    const selectedComponentContext = isBarMagnet
      ? barMagnetSelectedComp
      : isDynamic && dynamicCtx?.selectedComponent
        ? {
            id: dynamicCtx.selectedComponent.id,
            name: dynamicCtx.selectedComponent.label,
            identification: dynamicCtx.selectedComponent.description,
            currentState: dynamicCtx.selectedComponent.functionDescription,
            explanationContext: dynamicCtx.selectedComponent.relationship,
          }
        : multiDomainCtx?.selectedComponent || null;

    const activeComponentExplanation = isBarMagnet
      ? componentInteraction.explanation
      : multiDomainCtx?.componentExplanation || null;

    const activeParameters = isBarMagnet
      ? currentSnapshot
      : isDynamic
        ? dynamicCtx?.params || activeDynamicExperiment?.initialConditions || {}
        : multiDomainCtx?.parameters || { engineId: activeEngineId };

    const activeTelemetry: Record<string, unknown> = isBarMagnet
      ? { ...telemetry }
      : isDynamic
        ? dynamicCtx?.telemetry || {}
        : multiDomainCtx?.telemetry || {};

    const tutorMsgId = `tu_${Date.now()}`;
    let streamedAccumulated = '';
    let streamingBubbleInserted = false;

    try {
      const result = await askPhysicsTutorStream(
        {
          textQuestion: questionText,
          language: effectiveLang,
          forceAlternativeStrategy: payload.forceAlternativeStrategy,
          requestedStyle: payload.requestedStyle || 'auto',
          studentClass: effectiveStudentClass,
          chapterMeta: activeExperiment
            ? {
                chapterNumber: activeExperiment.chapterNumber,
                chapterTitle: activeExperiment.chapterTitle,
              }
            : activeDynamicExperiment
              ? {
                  chapterNumber: activeDynamicExperiment.chapterNumber,
                  chapterTitle:
                    activeDynamicExperiment.chapterTitle || activeDynamicExperiment.sourceScanTopic,
                }
              : null,
          experimentMeta: activeDynamicExperiment
            ? {
                id: activeDynamicExperiment.id,
                title: dynamicTitle || activeDynamicExperiment.title,
                simulationEngineId: 'dynamic_generated',
                relevantConcept: activeDynamicExperiment.conceptName,
                scientificExplanation:
                  localizedDynamic?.conceptExplanation ||
                  activeDynamicExperiment.conceptExplanation,
                learningObjective:
                  localizedDynamic?.educationalObjective ||
                  activeDynamicExperiment.educationalObjective,
                dynamicExperimentMeta: {
                  templateId: activeDynamicExperiment.templateId,
                  educationalObjective:
                    localizedDynamic?.educationalObjective ||
                    activeDynamicExperiment.educationalObjective,
                  expectedBehaviour:
                    localizedDynamic?.expectedBehaviour ||
                    activeDynamicExperiment.expectedBehaviour,
                  equations: activeDynamicExperiment.equations.map(
                    (e) => `${e.name}: ${e.formula} (${e.units})`
                  ),
                  procedureSteps:
                    localizedDynamic?.procedureSteps || activeDynamicExperiment.procedureSteps,
                  components: activeDynamicExperiment.components.map((c) => c.label),
                  isSimplifiedModel: activeDynamicExperiment.isSimplifiedModel,
                  limitationNote:
                    localizedDynamic?.limitationNote || activeDynamicExperiment.limitationNote,
                },
              }
            : activeExperiment
              ? {
                  id: activeExperiment.id,
                  title: activeExperiment.title,
                  simulationEngineId: activeExperiment.simulationEngineId,
                  relevantConcept: activeExperiment.relevantConcept,
                  scientificExplanation: activeExperiment.scientificExplanation,
                  learningObjective: activeExperiment.learningObjective,
                }
              : {
                  id: 'bar_magnet',
                  title: t.lab.subtitle,
                  simulationEngineId: 'bar_magnet',
                  relevantConcept: 'Magnetic Field Around a Bar Magnet',
                },
          conversationHistory: updatedHistoryForApi,
          previousTutorResponse: null,
          existingExplanation: null,
          selectedComponent: selectedComponentContext,
          componentExplanation: activeComponentExplanation,
          parameters: activeParameters,
          telemetry: activeTelemetry,
          textbookContext: activeAnalysis,
          sessionContext,
        },
        {
          onDelta: (deltaText) => {
            if (!isMountedRef.current || requestController.signal.aborted) return;
            streamedAccumulated += deltaText;
            const liveText = streamedAccumulated;
            setChatMessages((prev) => {
              const existingIdx = prev.findIndex((m) => m.id === tutorMsgId);
              if (existingIdx !== -1) {
                const copy = prev.slice();
                copy[existingIdx] = { ...copy[existingIdx], text: liveText, isStreaming: true };
                return copy;
              }
              streamingBubbleInserted = true;
              return [
                ...prev,
                {
                  id: tutorMsgId,
                  role: 'tutor',
                  text: liveText,
                  language: effectiveLang,
                  timestamp: new Date().toISOString(),
                  isStreaming: true,
                },
              ];
            });
          },
        },
        requestController.signal
      );

      if (!isMountedRef.current || requestController.signal.aborted) {
        return;
      }

      setTutorResponse(result);

      const finalizedBubble: TutorChatMessage = {
        id: tutorMsgId,
        role: 'tutor',
        text: result.explanation,
        spokenSummary: result.spoken_summary,
        language: result.response_language || effectiveLang,
        detectedLanguage: result.detected_language,
        needsLanguageClarification: result.needs_language_clarification,
        clarificationMessage: result.clarification_message,
        misunderstoodConcept: result.misunderstood_concept,
        whyPreviousHard: result.why_previous_was_hard,
        difficultyLevel: result.difficulty_level,
        teachingStrategy: result.teaching_strategy,
        alternativeExperimentNote: result.alternative_experiment_note,
        alternativeSimulation: result.alternative_simulation,
        parameterAdjustments: result.parameter_adjustments || null,
        followUpQuestion: result.follow_up_question,
        timestamp: result.answeredAt,
        isStreaming: false,
      };

      setChatMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === tutorMsgId);
        if (idx !== -1) {
          const copy = prev.slice();
          copy[idx] = finalizedBubble;
          return copy;
        }
        return [...prev, finalizedBubble];
      });

      const validatedSim = resolveAdaptiveSimulation(result.alternative_simulation);
      if (isBarMagnet) {
        setActiveAdaptiveId(validatedSim.simulation_id);
        setMode(validatedSim.visualization_mode === '3D' ? '3d' : '2d');
        setShowCompass(validatedSim.parameters.show_compass);
        setShowFieldLines(validatedSim.parameters.show_field_lines);
        setShowDirectionArrows(validatedSim.parameters.show_direction_arrows);
        setShowVectorGrid(validatedSim.parameters.show_vector_grid);
        setCompassCount(validatedSim.parameters.compass_count);
        setHighlightIntersectionTest(
          validatedSim.parameters.highlight_intersection_test
        );
      }

      onUpdateSessionContext((prev) => {
        const nextQuestions = [...prev.questionsAsked, result.student_question].slice(-12);
        const nextConcepts = prev.confusedConcepts.includes(result.misunderstood_concept)
          ? prev.confusedConcepts
          : [...prev.confusedConcepts, result.misunderstood_concept].slice(-10);
        const nextStrategies = prev.strategiesAttempted.includes(result.teaching_strategy)
          ? prev.strategiesAttempted
          : [...prev.strategiesAttempted, result.teaching_strategy];
        const nextSims = prev.alternativeSimulationsViewed.includes(
          validatedSim.simulation_id
        )
          ? prev.alternativeSimulationsViewed
          : [...prev.alternativeSimulationsViewed, validatedSim.simulation_id];

        return {
          currentExperiment: isBarMagnet ? validatedSim.simulation_id : prev.currentExperiment,
          selectedLanguage: effectiveLang,
          questionsAsked: nextQuestions,
          confusedConcepts: nextConcepts,
          strategiesAttempted: nextStrategies,
          alternativeSimulationsViewed: nextSims,
        };
      });
    } catch (err: unknown) {
      if (streamingBubbleInserted && isMountedRef.current) {
        setChatMessages((prev) =>
          prev.filter((m) => m.id !== tutorMsgId || (m.text.trim().length > 0 && !m.isStreaming))
        );
      }
      const code = (err as { code?: string })?.code;
      if (
        !isMountedRef.current ||
        code === 'COMPONENT_UNMOUNTED' ||
        code === 'USER_CANCELLED'
      ) {
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : 'Pocket Lab Tutor could not process your question right now.';
      setTutorError(message);
    } finally {
      if (activeTutorAbortRef.current === requestController) {
        activeTutorAbortRef.current = null;
      }
      if (isMountedRef.current) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === tutorMsgId && m.isStreaming ? { ...m, isStreaming: false } : m))
        );
        setIsAskingTutor(false);
      }
    }
  };

  const handleApplyParameterSuggestion = useCallback(
    (suggestion: TutorParameterSuggestion, messageId: string) => {
      if (activeEngineId === 'bar_magnet') {
        if (typeof suggestion.strength === 'number') setStrength(suggestion.strength);
        if (typeof suggestion.magnetAngleDeg === 'number') {
          setMagnetAngleDeg(suggestion.magnetAngleDeg);
        }
        if (typeof suggestion.magnetPitchDeg === 'number') {
          setMagnetPitchDeg(suggestion.magnetPitchDeg);
        }
        if (typeof suggestion.showFieldLines === 'boolean') {
          setShowFieldLines(suggestion.showFieldLines);
        }
        if (typeof suggestion.showVectorGrid === 'boolean') {
          setShowVectorGrid(suggestion.showVectorGrid);
        }
        if (typeof suggestion.showCompass === 'boolean') {
          setShowCompass(suggestion.showCompass);
        }
        if (typeof suggestion.compassCount === 'number') {
          setCompassCount(suggestion.compassCount);
        }
        if (suggestion.mode === '2d' || suggestion.mode === '3d') {
          setMode(suggestion.mode);
        }
      } else {
        setPendingMultiDomainSuggestion({ id: messageId, suggestion });
      }
      setAppliedSuggestionIds((prev) => ({ ...prev, [messageId]: true }));
    },
    [activeEngineId]
  );

  const handleAskTutorRef = useRef(handleAskTutor);
  handleAskTutorRef.current = handleAskTutor;

  const openTutorWithPrefill = useCallback((prefill?: string) => {
    setTutorOpen(true);
    const trimmed = prefill?.trim();
    if (trimmed) {
      window.setTimeout(() => {
        void handleAskTutorRef.current({ textQuestion: trimmed });
      }, 40);
    }
  }, []);

  useEffect(() => {
    if (initialOpenTutorPrefill === null || initialOpenTutorPrefill === undefined) return;
    setTutorOpen(true);
    const trimmed = initialOpenTutorPrefill.trim();
    onConsumeTutorPrefill?.();
    if (trimmed) {
      window.setTimeout(() => {
        void handleAskTutorRef.current({ textQuestion: trimmed });
      }, 60);
    }
  }, [initialOpenTutorPrefill, onConsumeTutorPrefill]);

  const handleSaveProgressWithReaction = useCallback(
    (
      experimentId: string,
      patch: {
        quizScore?: number;
        quizTotal?: number;
        observation?: string;
        markCompleted?: boolean;
      }
    ) => {
      onSaveExperimentProgress?.(experimentId, patch);
      if (typeof patch.quizScore === 'number' && typeof patch.quizTotal === 'number' && patch.quizTotal > 0) {
        const passed = patch.quizScore >= Math.ceil(patch.quizTotal / 2);
        triggerCompanionReaction(passed ? 'quiz_correct' : 'quiz_wrong', {
          extraContext: `Scored ${patch.quizScore}/${patch.quizTotal}`,
        });
      } else if (patch.markCompleted) {
        triggerCompanionReaction('experiment_completed');
      } else if (patch.observation) {
        triggerCompanionReaction('experiment_completed', {
          extraContext: `Observation recorded: ${patch.observation.slice(0, 120)}`,
        });
      }
    },
    [onSaveExperimentProgress, triggerCompanionReaction]
  );

  const handleGuidedStepPrompt = useCallback(
    (step: GuidedStepId, extraContext?: string) => {
      triggerCompanionReaction('guided_step', {
        parameterSummary: `Step: ${step}${extraContext ? ` · ${extraContext}` : ''}`,
        extraContext,
      });
    },
    [triggerCompanionReaction]
  );

  const activeDescriptor = ADAPTIVE_SIMULATION_REGISTRY[activeAdaptiveId];

  const activeTutorSelectedComponent =
    activeEngineId === 'bar_magnet'
      ? componentInteraction.selectedComponent
        ? {
            id: componentInteraction.selectedComponent.id,
            name:
              componentInteraction.selectedComponent.displayName[language] ||
              componentInteraction.selectedComponent.displayName.en,
            currentState: componentInteraction.selectedComponent.describeCurrentState(
              language,
              interactionParameters
            ),
          }
        : null
      : isDynamic && dynamicCtx?.selectedComponent
        ? {
            id: dynamicCtx.selectedComponent.id,
            name: dynamicCtx.selectedComponent.label,
            currentState: dynamicCtx.selectedComponent.description,
          }
        : multiDomainCtx?.selectedComponent
          ? {
              id: multiDomainCtx.selectedComponent.id,
              name: multiDomainCtx.selectedComponent.name,
              currentState: multiDomainCtx.selectedComponent.currentState,
            }
          : null;

  return (
    <div
      ref={labContainerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#FFF9F4] overflow-y-auto p-3 sm:p-6'
          : 'max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 lg:py-8 space-y-3.5 sm:space-y-5'
      }
    >
      {/* Clean Unified Laboratory Header & Tabs */}
      <header className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6F7487]">
              {onBackToLibrary && (
                <button
                  type="button"
                  onClick={onBackToLibrary}
                  className="inline-flex items-center gap-1 font-semibold text-[#C96D12] hover:underline cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {activeExperiment
                      ? `${t.classLibrary.classPrefix} ${activeExperiment.classLevel}`
                      : t.experimentLab.backToClassLibrary}
                  </span>
                </button>
              )}
              {onBackToConcepts && !onBackToLibrary && (
                <button
                  type="button"
                  onClick={onBackToConcepts}
                  className="inline-flex items-center gap-1 font-semibold text-[#C96D12] hover:underline cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.conceptExplorer.title}</span>
                </button>
              )}
              {activeExperiment && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">
                    Chapter {activeExperiment.chapterNumber}
                  </span>
                </>
              )}
              {activeDynamicExperiment && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">
                    {t.classLibrary.classPrefix} {activeDynamicExperiment.studentClass} ·{' '}
                    {t.dynamicLab.generatedBadge}
                  </span>
                </>
              )}
              {experimentCompletion && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#2E8B6E] whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.experimentLab.completedBadge}</span>
                  </span>
                </>
              )}
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-[#171A2F] tracking-tight leading-snug truncate">
              {activeExperimentTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeEngineId === 'bar_magnet' && (
              <>
                {/* Compact 2D / 3D Segmented Switch */}
                <div
                  role="group"
                  aria-label="Simulation dimension mode"
                  className="inline-flex items-center rounded-xl bg-[#EFE6DC] p-1"
                >
                  <button
                    type="button"
                    onClick={() => setMode('2d')}
                    aria-pressed={mode === '2d'}
                    aria-label={t.lab.mode2d}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[32px] ${
                      mode === '2d'
                        ? 'bg-white text-[#171A2F] shadow-sm'
                        : 'text-[#6F7487] hover:text-[#171A2F]'
                    }`}
                  >
                    2D
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('3d')}
                    aria-pressed={mode === '3d'}
                    aria-label={t.lab.mode3d}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[32px] ${
                      mode === '3d'
                        ? 'bg-white text-[#171A2F] shadow-sm'
                        : 'text-[#6F7487] hover:text-[#171A2F]'
                    }`}
                  >
                    3D
                  </button>
                </div>

                {/* Calm Secondary Explain Action */}
                <button
                  type="button"
                  onClick={() => componentInteraction.openExplainForComponent()}
                  title={t.explainability.explainButton}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl clay-btn-soft text-xs font-semibold text-[#171A2F] cursor-pointer min-h-[36px] whitespace-nowrap"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#F49A3C] shrink-0" />
                  <span>Explain</span>
                </button>
              </>
            )}

            {/* Show language switch here only in Fullscreen (Navbar already has it otherwise) */}
            {isFullscreen && (
              <LanguageSelector language={language} onChange={onLanguageChange} compact />
            )}

            <button
              type="button"
              onClick={() => void handleToggleFullscreen()}
              title={isFullscreen ? t.lab.exitFullscreen : t.lab.fullscreen}
              aria-label={isFullscreen ? t.lab.exitFullscreen : t.lab.fullscreen}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl clay-btn-soft text-[#171A2F] cursor-pointer shrink-0"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-[#6F7487]" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[#6F7487]" />
              )}
            </button>
          </div>
        </div>

        {/* Guided Classroom Mode 6-Step Progress Flow */}
        {guidedActivity && activeExperiment && onSubmitGuidedCompletion && onExitGuidedMode && (
          <GuidedClassroomFlowBar
            activity={guidedActivity}
            experiment={activeExperiment}
            language={language}
            alreadyCompleted={guidedCompleted}
            onSelectStepTab={setLabSectionTab}
            onCompanionStepPrompt={handleGuidedStepPrompt}
            onSubmitGuidedCompletion={async (payload) => {
              await onSubmitGuidedCompletion(payload);
              triggerCompanionReaction('experiment_completed', {
                extraContext: `Completed classroom guided lab (${payload.quizScore}/${payload.quizTotal})`,
              });
            }}
            onExitGuidedMode={onExitGuidedMode}
          />
        )}

        {/* Clean Single-Row Underline Navigation Tabs (All 4 Fit Without Wrapping or Scrolling) */}
        {(activeExperiment || activeDynamicExperiment) && (
          <div
            role="tablist"
            aria-label="Structured experiment sections"
            className="grid grid-cols-4 sm:flex sm:items-center gap-1 sm:gap-7 border-b border-[#EAE0D6]"
          >
            {[
              {
                id: 'experiment' as const,
                shortLabel: language === 'kn' ? 'ಪ್ರಯೋಗ' : language === 'hi' ? 'लैब' : 'Lab',
                fullLabel: t.experimentLab.tabExperiment,
                icon: Compass,
              },
              {
                id: 'introduction' as const,
                shortLabel: language === 'kn' ? 'ವಿಧಾನ' : language === 'hi' ? 'विधि' : 'Guide',
                fullLabel: t.experimentLab.tabIntroduction,
                icon: BookOpen,
              },
              {
                id: 'observations' as const,
                shortLabel: language === 'kn' ? 'ಟಿಪ್ಪಣಿ' : language === 'hi' ? 'नोट्स' : 'Notes',
                fullLabel: t.experimentLab.tabObservations,
                icon: ClipboardList,
              },
              {
                id: 'assessment' as const,
                shortLabel: language === 'kn' ? 'ಕ್ವಿಜ್' : language === 'hi' ? 'क्विज़' : 'Quiz',
                fullLabel: t.experimentLab.tabAssessment,
                icon: HelpCircle,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = labSectionTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={tab.fullLabel}
                  title={tab.fullLabel}
                  onClick={() => setLabSectionTab(tab.id)}
                  className={`relative inline-flex items-center justify-center sm:justify-start gap-1.5 pb-2.5 pt-1 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-px min-h-[40px] ${
                    active
                      ? 'border-[#F49A3C] text-[#171A2F]'
                      : 'border-transparent text-[#6F7487] hover:text-[#171A2F]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#F49A3C]' : 'text-[#8C90A3]'}`}
                  />
                  <span>{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* A. Introduction & Procedure Tab (Built-in OR Dynamic Generated) */}
      {activeDynamicExperiment && labSectionTab === 'introduction' && (
        <section className="clay-card p-6 sm:p-8 space-y-6">
          {activeDynamicExperiment.isSimplifiedModel && (
            <div className="p-4 rounded-xl bg-[#FEF7EC] border border-[#F2CF96] text-xs sm:text-sm text-[#7A4B10] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{t.dynamicLab.simplifiedModelHeading}: </span>
                <span>
                  {localizedDynamic?.limitationNote || activeDynamicExperiment.limitationNote}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5">
              <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.objectiveLabel}</p>
              <p className="text-[#171A2F] leading-relaxed">
                {localizedDynamic?.educationalObjective || activeDynamicExperiment.educationalObjective}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5">
              <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.whyImportantLabel}</p>
              <p className="text-[#171A2F] leading-relaxed">
                {localizedDynamic?.whyImportant || activeDynamicExperiment.whyImportant}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5">
              <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.realWorldLabel}</p>
              <p className="text-[#171A2F] leading-relaxed">
                {localizedDynamic?.realWorldApplication || activeDynamicExperiment.realWorldApplication}
              </p>
            </div>
          </div>

          {/* Apparatus Components with Real-World Visual References & Procedure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#171A2F]">{t.experimentLab.apparatusLabel}</h2>
              <div className="space-y-2.5">
                {activeDynamicExperiment.components.map((comp) => {
                  const visualRef = getDynamicExperimentVisual(
                    comp.visualAssetKey,
                    activeDynamicExperiment.templateId
                  );
                  return (
                    <div
                      key={comp.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF]"
                    >
                      {visualRef?.src && (
                        <img
                          src={visualRef.src}
                          alt={visualRef.alt[language] || comp.label}
                          className="w-12 h-12 rounded-lg object-cover border border-[#EFE7DF] shrink-0"
                        />
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs sm:text-sm font-semibold text-[#171A2F]">{comp.label}</p>
                        <p className="text-xs text-[#6F7487]">{comp.description}</p>
                        {comp.relationship && (
                          <p className="text-[11px] text-[#C96D12]">{comp.relationship}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-[#171A2F]">{t.experimentLab.procedureLabel}</h2>
                <ol className="list-decimal pl-5 text-[#6F7487] space-y-1.5">
                  {(localizedDynamic?.procedureSteps || activeDynamicExperiment.procedureSteps).map(
                    (step, idx) => (
                      <li key={idx}>{step}</li>
                    )
                  )}
                </ol>
              </div>

              {activeDynamicExperiment.equations.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-[#171A2F]">
                    {t.conceptExplorer.equationsLabel}
                  </h2>
                  {activeDynamicExperiment.equations.map((eq, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1"
                    >
                      <p className="text-xs font-medium text-[#6F7487]">{eq.name}</p>
                      <p className="font-mono-tabular text-sm font-semibold text-[#171A2F]">
                        {eq.formula}
                      </p>
                      <p className="text-[11px] text-[#6F7487]">
                        {eq.variables} {eq.units ? `· ${eq.units}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-2 text-sm">
            <h2 className="text-sm font-semibold text-[#C96D12]">
              {t.experimentLab.scientificExplanationLabel}
            </h2>
            <p className="text-[#171A2F] leading-relaxed">
              {localizedDynamic?.conceptExplanation || activeDynamicExperiment.conceptExplanation}
            </p>
          </div>
        </section>
      )}

      {!activeDynamicExperiment && activeExperiment && labSectionTab === 'introduction' && (
        <section className="clay-card p-6 sm:p-8 space-y-6">
          <div className="p-4 rounded-xl bg-[#FFF3E3]/55 border border-[#EFE7DF] text-xs sm:text-sm text-[#171A2F]">
            <span className="font-semibold text-[#C96D12]">{t.experimentLab.gradeAdaptedHeading}: </span>
            {activeExperiment.gradeAdaptedNote}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5">
              <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.objectiveLabel}</p>
              <p className="text-[#171A2F] leading-relaxed">{activeExperiment.learningObjective}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5">
              <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.whyImportantLabel}</p>
              <p className="text-[#171A2F] leading-relaxed">{activeExperiment.whyItImportant}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5">
              <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.realWorldLabel}</p>
              <p className="text-[#171A2F] leading-relaxed">{activeExperiment.realWorldApplication}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-[#171A2F]">{t.experimentLab.apparatusLabel}</h2>
              <ul className="list-disc pl-5 text-[#6F7487] space-y-1.5">
                {activeExperiment.apparatus.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-[#171A2F]">{t.experimentLab.procedureLabel}</h2>
              <ol className="list-decimal pl-5 text-[#6F7487] space-y-1.5">
                {activeExperiment.procedure.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-2 text-sm">
            <h2 className="text-sm font-semibold text-[#C96D12]">
              {t.experimentLab.scientificExplanationLabel}
            </h2>
            <p className="text-[#171A2F] leading-relaxed">{activeExperiment.scientificExplanation}</p>
          </div>

          <div className="pt-4 border-t border-[#EFE7DF] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setLabSectionTab('experiment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] text-xs sm:text-sm font-semibold text-[#171A2F] hover:border-[#F49A3C] cursor-pointer"
            >
              <span>&larr; {t.experimentLab.tabExperiment}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLabSectionTab('observations');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F49A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#E5882A] cursor-pointer"
            >
              <span>{t.experimentLab.tabObservations} &rarr;</span>
            </button>
          </div>
        </section>
      )}

      {/* D. Live Observations & Conclusion Logbook Tab */}
      {activeStructuredId && labSectionTab === 'observations' && (
        <section className="clay-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFE7DF] pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#171A2F]">
                {t.experimentLab.tabObservations}
              </h2>
              <p className="text-sm text-[#6F7487]">
                {activeDynamicExperiment
                  ? localizedDynamic?.expectedBehaviour || activeDynamicExperiment.expectedBehaviour
                  : activeExperiment?.expectedOutcome}
              </p>
            </div>

            {onSaveExperimentProgress && (
              <button
                type="button"
                onClick={() =>
                  handleSaveProgressWithReaction(activeStructuredId, { markCompleted: true })
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F49A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#E5882A] cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {experimentCompletion
                    ? t.experimentLab.completedBadge
                    : t.experimentLab.markCompletedBtn}
                </span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#171A2F]">
              {t.experimentLab.observationsGuideLabel}
            </h3>
            <ul className="list-disc pl-5 text-sm text-[#6F7487] space-y-1.5">
              {(activeDynamicExperiment
                ? localizedDynamic?.procedureSteps || activeDynamicExperiment.procedureSteps
                : activeExperiment?.observationsGuide || []
              ).map((obs, idx) => (
                <li key={idx}>{obs}</li>
              ))}
            </ul>
          </div>

          {onSaveExperimentProgress && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleaned = observationDraft.trim();
                if (!cleaned) return;
                handleSaveProgressWithReaction(activeStructuredId, { observation: cleaned });
                setObservationDraft('');
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={observationDraft}
                onChange={(e) => setObservationDraft(e.target.value)}
                placeholder={t.experimentLab.observationPlaceholder}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#E5882A] cursor-pointer whitespace-nowrap"
              >
                {t.experimentLab.saveObservationBtn}
              </button>
            </form>
          )}

          {experimentCompletion?.recordedObservations &&
            experimentCompletion.recordedObservations.length > 0 && (
              <div className="space-y-2">
                {experimentCompletion.recordedObservations.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] text-xs sm:text-sm text-[#171A2F]"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            )}

          <div className="pt-4 border-t border-[#EFE7DF] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setLabSectionTab('introduction');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] text-xs sm:text-sm font-semibold text-[#171A2F] hover:border-[#F49A3C] cursor-pointer"
            >
              <span>&larr; {t.experimentLab.tabIntroduction}</span>
            </button>
            {onSaveExperimentProgress && (
              <button
                type="button"
                onClick={() => {
                  setLabSectionTab('assessment');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F49A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#E5882A] cursor-pointer"
              >
                <span>{t.experimentLab.tabAssessment} &rarr;</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* E. Assessment Quiz Tab */}
      {activeStructuredId && labSectionTab === 'assessment' && onSaveExperimentProgress && (
        <ExperimentAssessment
          experimentId={activeStructuredId}
          questions={
            activeDynamicExperiment
              ? activeDynamicExperiment.assessmentQuestions
              : activeExperiment?.assessmentQuestions || []
          }
          t={t}
          savedScore={experimentCompletion?.quizScore}
          savedTotal={experimentCompletion?.quizTotal}
          onSaveScore={(score, total, markCompleted) =>
            handleSaveProgressWithReaction(activeStructuredId, {
              quizScore: score,
              quizTotal: total,
              markCompleted,
            })
          }
        />
      )}

      {/* B & C. Two-Zone Virtual Experiment Workspace + Docked Desktop / Drawer Mobile PHYSIX AI Tutor */}
      {(!activeStructuredId || labSectionTab === 'experiment') && (
        <div
          className={
            tutorOpen ? 'lg:grid lg:grid-cols-12 lg:gap-4 lg:items-start' : ''
          }
        >
          <div className={tutorOpen ? 'lg:col-span-8 min-w-0' : 'min-w-0'}>
            {activeDynamicExperiment ? (
              <DynamicLabStage
                spec={activeDynamicExperiment}
                language={language}
                t={t}
                reducedMotion={reducedMotion}
                tutorOpen={tutorOpen}
                companionMessage={companionMessage}
                rewardState={effectiveRewardState}
                latestBadgeToast={latestBadgeToast}
                isSavedInLibrary={isDynamicExperimentSaved}
                onSaveToLibrary={onSaveDynamicExperiment}
                onDismissBadgeToast={onDismissBadgeToast}
                onToggleTutor={toggleTutor}
                onAskComponentInTutor={openTutorWithPrefill}
                onCaptureObservation={
                  onSaveExperimentProgress
                    ? (summary) =>
                        handleSaveProgressWithReaction(activeDynamicExperiment.id, {
                          observation: summary,
                        })
                    : undefined
                }
                onCompanionLabEvent={(ev) => {
                  const mappedEvent: CompanionEventType =
                    ev.eventType === 'observation_logged'
                      ? 'experiment_completed'
                      : ev.eventType;
                  triggerCompanionReaction(mappedEvent, {
                    componentName: ev.componentName,
                    parameterSummary: ev.parameterSummary,
                  });
                }}
                onTelemetryContextChange={setDynamicCtx}
              />
            ) : staticEngineId !== 'bar_magnet' ? (
              <MultiDomainLabStage
                engineId={staticEngineId}
                preset={activeExperiment?.simulationPreset}
                experiment={activeExperiment}
                studentClass={studentClass || activeExperiment?.classLevel}
                language={language}
                t={t}
                reducedMotion={reducedMotion}
                activeAnalysis={activeAnalysis}
                tutorOpen={tutorOpen}
                compactForTutor={tutorOpen}
                tutorSuggestionApply={pendingMultiDomainSuggestion}
                companionMessage={companionMessage}
                rewardState={effectiveRewardState}
                latestBadgeToast={latestBadgeToast}
                onDismissBadgeToast={onDismissBadgeToast}
                onComponentExplored={(eId, compId) =>
                  onRecordRewardEvent?.({
                    type: 'component_explored',
                    engineId: eId,
                    componentId: compId,
                  })
                }
                onCompanionLabEvent={(ev) =>
                  triggerCompanionReaction(ev.eventType, {
                    componentName: ev.componentName,
                    parameterSummary: ev.parameterSummary,
                  })
                }
                onToggleTutor={toggleTutor}
                onAskComponentInTutor={openTutorWithPrefill}
                onCaptureObservation={
                  activeExperiment && onSaveExperimentProgress
                    ? (summary) =>
                        handleSaveProgressWithReaction(activeExperiment.id, {
                          observation: summary,
                        })
                    : undefined
                }
                onTutorContextChange={setMultiDomainCtx}
              />
            ) : (
            (() => {
              const barMagnetPartCount = getSimulationComponents('bar_magnet').length;

              const renderBarMagnetControls = () => (
                <div className="space-y-3">
                  <ParameterSliderInput
                    id="magnet-angle-slider"
                    label={t.lab.magnetAngleLabel}
                    unit="°"
                    min={0}
                    max={360}
                    step={1}
                    value={magnetAngleDeg}
                    onChange={setMagnetAngleDeg}
                    testId="param-magnet-angle"
                  />

                  {mode === '3d' && (
                    <ParameterSliderInput
                      id="magnet-pitch-slider"
                      label={t.lab.magnetPitchLabel}
                      unit="°"
                      min={-60}
                      max={60}
                      step={1}
                      value={magnetPitchDeg}
                      onChange={setMagnetPitchDeg}
                      testId="param-magnet-pitch"
                    />
                  )}

                  <ParameterSliderInput
                    id="magnet-strength-slider"
                    label={t.lab.magneticStrengthLabel}
                    unit="×"
                    min={0.3}
                    max={2.4}
                    step={0.1}
                    value={strength}
                    onChange={setStrength}
                    testId="param-magnet-strength"
                  />

                  <div className="lg:hidden pt-1">
                    <button
                      type="button"
                      onClick={() => setShowMoreBarControls((v) => !v)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#EFE7DF] bg-[#FFF9F4]/70 text-xs font-semibold text-[#171A2F] cursor-pointer min-h-[36px]"
                    >
                      <span>
                        {showMoreBarControls
                          ? 'Hide Compass & Display Options'
                          : 'Compass Position & Field Options'}
                      </span>
                      {showMoreBarControls ? (
                        <ChevronUp className="w-4 h-4 text-[#C96D12]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#C96D12]" />
                      )}
                    </button>
                  </div>

                  <div
                    className={`${showMoreBarControls ? 'block' : 'hidden'} lg:block space-y-2.5`}
                  >
                    {mode === '2d' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                        <ParameterSliderInput
                          label={t.lab.compassXLabel}
                          unit="px"
                          min={-240}
                          max={240}
                          step={5}
                          value={compassPos.x}
                          onChange={(x) => setCompassPos((prev) => ({ ...prev, x }))}
                          testId="param-compass-x"
                        />
                        <ParameterSliderInput
                          label={t.lab.compassYLabel}
                          unit="px"
                          min={-160}
                          max={160}
                          step={5}
                          value={compassPos.y}
                          onChange={(y) => setCompassPos((prev) => ({ ...prev, y }))}
                          testId="param-compass-y"
                        />
                      </div>
                    )}

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center justify-between gap-3 rounded-xl border border-[#EFE7DF]/85 bg-[#FFF9F4]/55 px-3 py-2 text-xs font-medium text-[#171A2F] cursor-pointer">
                        <span>{t.lab.showFieldLinesLabel}</span>
                        <input
                          type="checkbox"
                          checked={showFieldLines}
                          onChange={(e) => setShowFieldLines(e.target.checked)}
                          className="w-4 h-4 accent-[#6F4E37] cursor-pointer"
                        />
                      </label>

                      {mode === '2d' && (
                        <label className="flex items-center justify-between gap-3 rounded-xl border border-[#EFE7DF]/85 bg-[#FFF9F4]/55 px-3 py-2 text-xs font-medium text-[#171A2F] cursor-pointer">
                          <span>{t.lab.showVectorGridLabel}</span>
                          <input
                            type="checkbox"
                            checked={showVectorGrid}
                            onChange={(e) => setShowVectorGrid(e.target.checked)}
                            className="w-4 h-4 accent-[#6F4E37] cursor-pointer"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );

              const renderBarMagnetResults = () => (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171A2F]">
                    <Compass className="w-3.5 h-3.5 text-[#C96D12]" aria-hidden="true" />
                    <span>{t.lab.liveResultsHeading}</span>
                  </div>

                  {mode === '2d' && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF]">
                        <p className="text-[11px] text-[#6F7487]">|B|</p>
                        <p
                          data-testid="live-result-b-mag"
                          className="font-mono-tabular text-xs font-bold text-[#171A2F]"
                        >
                          {telemetry.magnitudeMt} {t.lab.fieldStrengthUnit}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF]">
                        <p className="text-[11px] text-[#6F7487]">{t.lab.fieldAngleLabel}</p>
                        <p
                          data-testid="live-result-b-angle"
                          className="font-mono-tabular text-xs font-bold text-[#C96D12]"
                        >
                          {telemetry.angleDeg}°
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF]">
                        <p className="text-[11px] text-[#6F7487]">{t.lab.compassPositionLabel}</p>
                        <p className="font-mono-tabular text-[11px] font-bold text-[#171A2F]">
                          {telemetry.relX}, {telemetry.relY}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-[#FFF3E3]/40 border border-[#EFE7DF] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C96D12]">
                      <BookOpen className="w-3 h-3" aria-hidden="true" />
                      <span>{t.lab.dipoleEquationName}</span>
                    </div>
                    <p className="font-mono-tabular text-[11px] font-medium text-[#171A2F]">
                      B = (μ₀ / 4π) · [3(m·r̂)r̂ − m] / r³
                    </p>
                  </div>
                </div>
              );

              return (
                <div
                  data-testid="simulation-workspace-grid"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start"
                >
                  {/* LEFT / TOP: Bar Magnet 2D/3D Viewport */}
                  <div
                    className={`${
                      tutorOpen ? 'lg:col-span-7' : 'lg:col-span-8'
                    } min-w-0 clay-card p-2.5 sm:p-4 space-y-2`}
                  >
                    {activeAdaptiveId !== 'bar_magnet_explorer' && activeDescriptor && (
                      <div className="rounded-xl border border-[#EFE7DF] bg-[#FFF3E3]/55 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-semibold text-[#C96D12] truncate">
                            {t.voiceTutor.adaptiveSimLabel}: {activeDescriptor.title}
                          </p>
                          <p className="text-xs text-[#171A2F] line-clamp-1">
                            {activeDescriptor.summary}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetAdaptiveSimulation}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer shrink-0"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#C96D12]" />
                          <span>{t.voiceTutor.returnDefaultSimBtn}</span>
                        </button>
                      </div>
                    )}

                    <div
                      data-testid="simulation-viewport-container"
                      className="relative rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] overflow-hidden h-[240px] sm:h-[320px] lg:h-[520px]"
                    >
                      {mode === '2d' ? (
                        <Magnetism2DCanvas
                          magnetAngleDeg={magnetAngleDeg}
                          strength={strength}
                          isPlaying={isPlaying}
                          showVectorGrid={showVectorGrid}
                          showFieldLines={showFieldLines}
                          reducedMotion={reducedMotion}
                          resetSignal={resetSignal}
                          onTelemetryChange={handleTelemetry}
                          selectedComponentId={componentInteraction.selectedComponentId}
                          onComponentHit={componentInteraction.handleComponentHit}
                          onAnchorMove={componentInteraction.updateLiveAnchor}
                          showCompass={showCompass}
                          showDirectionArrows={showDirectionArrows}
                          compassCount={compassCount}
                          highlightIntersectionTest={highlightIntersectionTest}
                          compassPosition={compassPos}
                          onCompassPositionChange={setCompassPos}
                        />
                      ) : (
                        <Magnetism3DViewport
                          magnetYawDeg={magnetAngleDeg}
                          magnetPitchDeg={magnetPitchDeg}
                          strength={strength}
                          isPlaying={isPlaying}
                          showFieldLines={showFieldLines}
                          reducedMotion={reducedMotion}
                          resetSignal={resetSignal}
                          fallbackMessage={t.lab.webglFallback}
                          selectedComponentId={componentInteraction.selectedComponentId}
                          onComponentHit={componentInteraction.handleComponentHit}
                          onAnchorMove={componentInteraction.updateLiveAnchor}
                        />
                      )}

                      <ViewportComponentOverlay
                        stage={componentInteraction.stage}
                        language={language}
                        t={t}
                        reducedMotion={reducedMotion}
                        simulationEngineId="bar_magnet"
                        simulationPreset={activeExperiment?.simulationPreset}
                        selectedComponent={componentInteraction.selectedComponent}
                        anchorPx={componentInteraction.anchorPx}
                        viewportSize={componentInteraction.viewportSize}
                        explanation={componentInteraction.explanation}
                        isLoadingAi={componentInteraction.isLoadingAi}
                        aiNotice={componentInteraction.aiNotice}
                        interactivePartCount={barMagnetPartCount}
                        firstOpenHintVisible={firstOpenHintVisible}
                        onDismissFirstOpenHint={handleDismissFirstOpenHint}
                        onAskPhysixAi={() => openTutorWithPrefill()}
                        onOpenExplain={() => componentInteraction.openExplainForComponent()}
                        onClose={componentInteraction.closeInteraction}
                        onRefreshAi={componentInteraction.refreshAiExplanation}
                      />

                      <CompanionDock
                        variant="floating"
                        language={language}
                        t={t}
                        message={companionMessage}
                        rewardState={effectiveRewardState}
                        latestBadgeToast={latestBadgeToast}
                        reducedMotion={reducedMotion}
                        onOpenFullTutor={(prefill) =>
                          prefill ? openTutorWithPrefill(prefill) : toggleTutor()
                        }
                        onDismissBadgeToast={onDismissBadgeToast}
                      />
                    </div>

                    {/* Compact Single-Line Legend & Hint */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#6F7487]">
                      <p className="truncate max-w-full sm:max-w-[65%]">
                        {mode === '2d' ? t.lab.dragCompassHint : t.lab.orbit3dHint}
                      </p>
                      <div className="flex items-center gap-3 shrink-0 font-medium text-[#171A2F]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#B83A2D]" aria-hidden="true" />
                          {t.lab.northPole}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#3E4C59]" aria-hidden="true" />
                          {t.lab.southPole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT (Desktop) / PERSISTENT BELOW (Mobile): Experiment Control Panel */}
                  <aside
                    aria-label={t.lab.parametersHeading}
                    data-testid="experiment-control-panel"
                    className={`flex flex-col ${
                      tutorOpen ? 'lg:col-span-5' : 'lg:col-span-4'
                    } min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.75rem)] clay-card lg:overflow-hidden`}
                  >
                    <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-[#EFE7DF] bg-[#FFF9F4]/80 flex items-center justify-between gap-2 shrink-0">
                      <h2 className="text-sm font-bold text-[#171A2F] truncate">
                        {t.lab.parametersHeading}
                      </h2>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsPlaying((p) => !p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer min-h-[34px]"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlaying ? t.lab.pause : t.lab.play}</span>
                        </button>
                        <button
                          type="button"
                          data-testid="reset-defaults-btn"
                          onClick={handleReset}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[34px]"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#C96D12]" />
                          <span>{t.lab.resetDefaults}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 lg:overflow-y-auto px-3.5 sm:px-4 py-3 sm:py-3.5 flex flex-col gap-3.5 min-h-0">
                      <div className="order-2 lg:order-1 pt-3 border-t border-[#EFE7DF] lg:pt-0 lg:border-t-0">
                        {renderBarMagnetControls()}
                      </div>
                      <div className="order-1 lg:order-2 lg:pt-3 lg:border-t lg:border-[#EFE7DF]">
                        {renderBarMagnetResults()}
                      </div>
                    </div>
                  </aside>
                </div>
              );
            })()
          )}

            {activeStructuredId && (
              <div className="mt-4 clay-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#6F7487]">
                  Completed testing the simulation? Continue to review the concept guide or record observations and take the quiz.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLabSectionTab('introduction');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] text-xs font-semibold text-[#171A2F] hover:border-[#F49A3C] cursor-pointer"
                  >
                    <span>{t.experimentLab.tabIntroduction}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLabSectionTab('observations');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] text-xs font-semibold text-[#171A2F] hover:border-[#F49A3C] cursor-pointer"
                  >
                    <span>{t.experimentLab.tabObservations}</span>
                  </button>
                  {onSaveExperimentProgress && (
                    <button
                      type="button"
                      onClick={() => {
                        setLabSectionTab('assessment');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer"
                    >
                      <span>{t.experimentLab.tabAssessment} &rarr;</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Unified PHYSIX AI Assistant: Docked non-overlapping panel on Desktop (lg:), accessible slide-in drawer on Mobile */}
          {tutorOpen && (
            <aside
              role="dialog"
              aria-modal="false"
              aria-label={t.voiceTutor.title}
              data-testid="floating-tutor-overlay"
              className="fixed inset-0 z-50 bg-[#171A2F]/35 flex justify-end lg:sticky lg:top-20 lg:inset-auto lg:z-auto lg:bg-transparent lg:block lg:col-span-4 lg:h-[calc(100vh-5.75rem)]"
              onClick={(e) => {
                if (e.target === e.currentTarget) setTutorOpen(false);
              }}
            >
              <div className="w-full max-w-md lg:max-w-none h-full bg-white shadow-2xl lg:shadow-none border-l border-[#EFE7DF] lg:border lg:rounded-2xl overflow-hidden">
                <VoiceTutorPanel
                  variant="drawer"
                  t={t}
                  language={language}
                  onLanguageChange={onLanguageChange}
                  activeAdaptiveId={activeAdaptiveId}
                  experimentContextSummary={{
                    classLevel: effectiveStudentClass,
                    chapterNumber:
                      activeExperiment?.chapterNumber || activeDynamicExperiment?.chapterNumber,
                    experimentTitle: activeExperimentTitle,
                    engineId: activeEngineId,
                  }}
                  selectedComponent={activeTutorSelectedComponent}
                  messages={chatMessages}
                  sessionContext={sessionContext}
                  isAsking={isAskingTutor}
                  errorMsg={tutorError}
                  onAskTutor={handleAskTutor}
                  onCancelAsk={handleCancelAskTutor}
                  onApplyParameterSuggestion={handleApplyParameterSuggestion}
                  appliedSuggestionIds={appliedSuggestionIds}
                  onResetAdaptiveSimulation={handleResetAdaptiveSimulation}
                  onClearConversation={() => {
                    handleCancelAskTutor();
                    setChatMessages([]);
                    setTutorResponse(null);
                    setTutorError(null);
                  }}
                  onCloseDrawer={() => setTutorOpen(false)}
                />
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
};
