import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LanguageCode, TextbookAnalysisResult } from '../../types/physics';
import type {
  ComponentExplanationContent,
  InteractionStage,
  SimulationComponentHit,
} from './types';
import {
  getRegisteredComponent,
  getSimulationComponents,
  getSimulationEntry,
} from './registry';
import { requestComponentExplanation } from '../../services/explainabilityApi';

interface UseTwoStageInteractionOptions {
  simulationId: string;
  visualizationMode: '2d' | '3d';
  language: LanguageCode;
  studentClass?: number;
  relevantConcept?: string;
  parameters: Record<string, unknown>;
  textbookContext?: TextbookAnalysisResult | null;
}

const VOLATILE_PARAM_KEYS = new Set([
  'summary',
  'componentStateSummary',
  'telemetryMagnitudeMt',
  'telemetryAngleDeg',
]);

function buildStableParamDigest(params: Record<string, unknown>): string {
  const entries = Object.keys(params)
    .filter((k) => !VOLATILE_PARAM_KEYS.has(k))
    .sort()
    .map((k) => [k, params[k]]);
  return JSON.stringify(entries);
}

export function useTwoStageInteraction({
  simulationId,
  visualizationMode,
  language,
  studentClass,
  relevantConcept,
  parameters,
  textbookContext = null,
}: UseTwoStageInteractionOptions) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [stage, setStage] = useState<InteractionStage>('idle');
  const [anchorPx, setAnchorPx] = useState<{ x: number; y: number } | null>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: 640,
    height: 440,
  });

  const [aiExplanation, setAiExplanation] =
    useState<ComponentExplanationContent | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const requestSeqRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const explanationCacheRef = useRef<Map<string, ComponentExplanationContent>>(new Map());
  const latestParamsRef = useRef(parameters);
  latestParamsRef.current = parameters;

  const cancelPendingRequest = useCallback((reason = 'USER_CANCELLED') => {
    requestSeqRef.current += 1;
    if (abortControllerRef.current) {
      if (!abortControllerRef.current.signal.aborted) {
        abortControllerRef.current.abort(reason);
      }
      abortControllerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cancelPendingRequest('COMPONENT_UNMOUNTED');
  }, [cancelPendingRequest]);

  useEffect(() => {
    cancelPendingRequest('SIMULATION_CHANGED');
    setSelectedComponentId(null);
    setStage('idle');
    setAnchorPx(null);
    setAiExplanation(null);
    setAiNotice(null);
    setIsLoadingAi(false);
  }, [simulationId, cancelPendingRequest]);

  const selectedComponent = useMemo(
    () => getRegisteredComponent(simulationId, selectedComponentId),
    [simulationId, selectedComponentId]
  );

  const simulationEntry = useMemo(
    () => getSimulationEntry(simulationId),
    [simulationId]
  );

  const defaultExplanation = useMemo(() => {
    if (!selectedComponent) return null;
    return selectedComponent.buildDefaultExplanation(language, parameters);
  }, [selectedComponent, language, parameters]);

  const activeExplanation = aiExplanation ?? defaultExplanation;

  const fetchAiComponentExplanation = useCallback(
    async (componentId: string, forceRefresh = false) => {
      const comp = getRegisteredComponent(simulationId, componentId);
      if (!comp) return;

      const paramsSnapshot = latestParamsRef.current;
      const cacheKey = `${simulationId}:${comp.id}:${language}:${studentClass ?? 7}:${visualizationMode}:${buildStableParamDigest(paramsSnapshot)}`;
      if (!forceRefresh) {
        const cached = explanationCacheRef.current.get(cacheKey);
        if (cached) {
          cancelPendingRequest('CACHE_HIT');
          setAiNotice(null);
          setIsLoadingAi(false);
          setAiExplanation(cached);
          return;
        }
      }

      cancelPendingRequest('USER_CANCELLED');
      const seq = requestSeqRef.current;
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoadingAi(true);
      setAiNotice(null);

      try {
        const result = await requestComponentExplanation(
          {
            componentId: comp.id,
            componentName: comp.displayName[language] || comp.displayName.en,
            componentContext: comp.explanationContext,
            experimentId: simulationId,
            experimentName:
              simulationEntry?.experimentName[language] ||
              simulationEntry?.experimentName.en ||
              'Magnetic Field Around a Bar Magnet',
            visualizationMode,
            studentClass,
            relevantConcept,
            parameters: paramsSnapshot,
            currentState: comp.describeCurrentState(language, paramsSnapshot),
            textbookContext,
            language,
          },
          controller.signal
        );

        if (requestSeqRef.current !== seq) return;
        explanationCacheRef.current.set(cacheKey, result);
        setAiExplanation(result);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (
          controller.signal.aborted ||
          requestSeqRef.current !== seq ||
          code === 'USER_CANCELLED' ||
          code === 'COMPONENT_UNMOUNTED'
        ) {
          return;
        }
        const msg =
          err instanceof Error
            ? err.message
            : 'Using verified built-in component physics reference.';
        setAiNotice(msg);
      } finally {
        if (requestSeqRef.current === seq) {
          setIsLoadingAi(false);
          if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
          }
        }
      }
    },
    [
      simulationId,
      simulationEntry,
      visualizationMode,
      language,
      studentClass,
      relevantConcept,
      textbookContext,
      cancelPendingRequest,
    ]
  );

  // Re-fetch AI component explanation cleanly if language switches while explain panel is open
  useEffect(() => {
    if (stage === 'explain' && selectedComponentId) {
      setAiExplanation(null);
      void fetchAiComponentExplanation(selectedComponentId);
    } else {
      setAiExplanation(null);
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComponentHit = useCallback(
    (hit: SimulationComponentHit | null) => {
      if (!hit) {
        cancelPendingRequest();
        setSelectedComponentId(null);
        setStage('idle');
        setAnchorPx(null);
        setAiExplanation(null);
        setAiNotice(null);
        setIsLoadingAi(false);
        return;
      }

      setViewportSize(hit.viewportSize);
      setAnchorPx(hit.anchorPx);

      // Stage transition:
      // 1) Different component clicked:
      //    - If explanation panel is already open, immediately switch highlight + explanation!
      //    - Otherwise enter Stage 1 (Identify) tooltip.
      if (hit.componentId !== selectedComponentId) {
        cancelPendingRequest();
        setSelectedComponentId(hit.componentId);
        setAiExplanation(null);
        setAiNotice(null);
        if (stage === 'explain') {
          setStage('explain');
          void fetchAiComponentExplanation(hit.componentId);
        } else {
          setStage('identify');
          setIsLoadingAi(false);
        }
        return;
      }

      // 2) Same component clicked a second time -> Stage 2 (Explain) inside viewport
      if (stage === 'identify') {
        setStage('explain');
        setAiExplanation(null);
        void fetchAiComponentExplanation(hit.componentId);
        return;
      }

      // 3) Clicking while already in explain updates anchor silently
      if (stage === 'idle') {
        setStage('identify');
      }
    },
    [selectedComponentId, stage, cancelPendingRequest, fetchAiComponentExplanation]
  );

  const openExplainForComponent = useCallback(
    (componentId?: string) => {
      const defaultComponentId = getSimulationComponents(simulationId)[0]?.id;
      const targetId = componentId || selectedComponentId || defaultComponentId;
      if (!targetId) return;
      setSelectedComponentId(targetId);
      setStage('explain');
      setAiExplanation(null);
      void fetchAiComponentExplanation(targetId);
    },
    [simulationId, selectedComponentId, fetchAiComponentExplanation]
  );

  const updateLiveAnchor = useCallback(
    (nextAnchor: { x: number; y: number }, nextViewport?: { width: number; height: number }) => {
      setAnchorPx((prev) => {
        if (
          prev &&
          Math.abs(prev.x - nextAnchor.x) < 1.5 &&
          Math.abs(prev.y - nextAnchor.y) < 1.5
        ) {
          return prev;
        }
        return nextAnchor;
      });
      if (nextViewport) {
        setViewportSize(nextViewport);
      }
    },
    []
  );

  const closeInteraction = useCallback(() => {
    cancelPendingRequest();
    setSelectedComponentId(null);
    setStage('idle');
    setAnchorPx(null);
    setAiExplanation(null);
    setAiNotice(null);
    setIsLoadingAi(false);
  }, [cancelPendingRequest]);

  const refreshAiExplanation = useCallback(() => {
    if (!selectedComponentId) return;
    void fetchAiComponentExplanation(selectedComponentId, true);
  }, [selectedComponentId, fetchAiComponentExplanation]);

  return {
    selectedComponentId,
    selectedComponent,
    stage,
    anchorPx,
    viewportSize,
    explanation: activeExplanation,
    isLoadingAi,
    aiNotice,
    handleComponentHit,
    openExplainForComponent,
    updateLiveAnchor,
    closeInteraction,
    refreshAiExplanation,
  };
}
