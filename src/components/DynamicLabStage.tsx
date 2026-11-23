import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  FlaskConical,
  Layers,
  MessageSquareText,
  Pause,
  Play,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';
import type { LanguageCode } from '../types/physics';
import type {
  DynamicComponentDef,
  DynamicExperimentSpec,
  DynamicSimulationFrame,
} from '../types/dynamicExperiment';
import type {
  BadgeDefinition,
  CompanionEmotion,
  CompanionMessageState,
  RewardProgressState,
} from '../types/companion';
import type { SimulationComponentHit } from '../systems/componentInteraction/types';
import type { TranslationBundle } from '../i18n/translations';
import { computeDynamicSimulationState } from '../utils/dynamicPhysicsValidator';
import { getDynamicExperimentVisual } from '../data/componentImages';
import { ParameterSliderInput } from './ParameterSliderInput';
import { CompanionDock } from './CompanionDock';
import { DynamicExperimentCanvas } from './simulations/DynamicExperimentCanvas';
import { DynamicExperiment3DViewport } from './simulations/DynamicExperiment3DViewport';

interface DynamicLabStageProps {
  spec: DynamicExperimentSpec;
  language: LanguageCode;
  t: TranslationBundle;
  reducedMotion?: boolean;
  tutorOpen?: boolean;
  companionMessage: CompanionMessageState;
  rewardState: RewardProgressState;
  latestBadgeToast?: BadgeDefinition | null;
  isSavedInLibrary?: boolean;
  onSaveToLibrary?: (spec: DynamicExperimentSpec) => void;
  onDismissBadgeToast?: () => void;
  onToggleTutor: () => void;
  onAskComponentInTutor: (prefill?: string) => void;
  onCaptureObservation?: (summary: string) => void;
  onCompanionLabEvent?: (event: {
    eventType:
      | 'parameter_changed'
      | 'component_inspected'
      | 'experiment_intro'
      | 'observation_logged';
    componentName?: string;
    parameterSummary?: string;
    emotion?: CompanionEmotion;
  }) => void;
  onTelemetryContextChange?: (ctx: {
    params: Record<string, number>;
    telemetry: Record<string, string | number>;
    selectedComponent?: DynamicComponentDef | null;
  }) => void;
}

export const DynamicLabStage: React.FC<DynamicLabStageProps> = ({
  spec,
  language,
  t,
  reducedMotion = false,
  tutorOpen = false,
  companionMessage,
  rewardState,
  latestBadgeToast = null,
  isSavedInLibrary = false,
  onSaveToLibrary,
  onDismissBadgeToast,
  onToggleTutor,
  onAskComponentInTutor,
  onCaptureObservation,
  onCompanionLabEvent,
  onTelemetryContextChange,
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(
    spec.supports3d ? spec.visualizationMode : '2d'
  );
  const [paramValues, setParamValues] = useState<Record<string, number>>(() => ({
    ...spec.initialConditions,
  }));
  const [isPlaying, setIsPlaying] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [liveFrame, setLiveFrame] = useState<DynamicSimulationFrame>(() =>
    computeDynamicSimulationState(spec, spec.initialConditions, 0)
  );
  const [selectedHit, setSelectedHit] = useState<SimulationComponentHit | null>(null);
  const [stageMode, setStageMode] = useState<'idle' | 'identify' | 'explain'>('idle');
  const [imgFailed, setImgFailed] = useState(false);

  const paramTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setViewMode(spec.supports3d ? spec.visualizationMode : '2d');
    setParamValues({ ...spec.initialConditions });
    setSelectedHit(null);
    setStageMode('idle');
    setIsPlaying(true);
    setResetSignal((n) => n + 1);
    setLiveFrame(computeDynamicSimulationState(spec, spec.initialConditions, 0));
  }, [spec.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const localized = spec.translations?.[language] || spec.translations?.en;

  const selectedComponent = useMemo(
    () =>
      selectedHit
        ? spec.components.find((c) => c.id === selectedHit.componentId) || null
        : null,
    [selectedHit, spec.components]
  );

  const selectedVisual = useMemo(
    () =>
      selectedComponent
        ? getDynamicExperimentVisual(selectedComponent.visualAssetKey, spec.templateId)
        : null,
    [selectedComponent, spec.templateId]
  );

  useEffect(() => {
    setImgFailed(false);
  }, [selectedComponent?.id]);

  useEffect(() => {
    const telemetryObj: Record<string, string | number> = {
      summary: liveFrame.summaryText,
    };
    for (const m of liveFrame.metrics) {
      telemetryObj[m.key] = `${m.value} ${m.unit}`.trim();
    }
    onTelemetryContextChange?.({
      params: paramValues,
      telemetry: telemetryObj,
      selectedComponent,
    });
  }, [paramValues, liveFrame.summaryText, selectedComponent, onTelemetryContextChange]);

  const handleParamChange = (key: string, nextVal: number) => {
    const nextParams = { ...paramValues, [key]: nextVal };
    setParamValues(nextParams);
    setLiveFrame(computeDynamicSimulationState(spec, nextParams, 0.25));

    if (paramTimerRef.current) window.clearTimeout(paramTimerRef.current);
    paramTimerRef.current = window.setTimeout(() => {
      const pMeta = spec.parameters.find((p) => p.key === key);
      const summary = pMeta ? `${pMeta.symbol} = ${nextVal} ${pMeta.unit}`.trim() : `${key} = ${nextVal}`;
      onCompanionLabEvent?.({
        eventType: 'parameter_changed',
        parameterSummary: summary,
      });
    }, 320);
  };

  const handleReset = () => {
    setParamValues({ ...spec.initialConditions });
    setResetSignal((n) => n + 1);
    setLiveFrame(computeDynamicSimulationState(spec, spec.initialConditions, 0));
  };

  const handleComponentHit = (hit: SimulationComponentHit | null) => {
    if (!hit) {
      setSelectedHit(null);
      setStageMode('idle');
      return;
    }
    if (selectedHit?.componentId === hit.componentId && stageMode === 'identify') {
      setStageMode('explain');
      const comp = spec.components.find((c) => c.id === hit.componentId);
      const compLabel =
        (comp && localized?.componentLabels?.[comp.id]?.label) || comp?.label || hit.componentId;
      onCompanionLabEvent?.({
        eventType: 'component_inspected',
        componentName: compLabel,
      });
      return;
    }
    setSelectedHit(hit);
    setStageMode(stageMode === 'explain' ? 'explain' : 'identify');
  };

  return (
    <div className="space-y-4">
      {/* Validation Status & Simplified Model Transparency Banner */}
      <div className="rounded-2xl border border-[#EFE7DF] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF3E3]/70 text-[#171A2F] font-semibold">
            <FlaskConical className="w-3.5 h-3.5 text-[#C96D12]" />
            <span>{t.dynamicLab.generatedBadge}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[#2E7D32] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {spec.isSimplifiedModel
                ? t.dynamicLab.validatedSimplifiedBadge
                : t.dynamicLab.validatedExactBadge}
            </span>
          </span>
          <span className="text-[#6F7487]">·</span>
          <span className="text-[#6F7487] font-medium">
            {t.classLibrary.classPrefix} {spec.studentClass} · {spec.templateId.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {spec.supports3d && (
            <div className="inline-flex rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  viewMode === '2d'
                    ? 'bg-[#F49A3C] text-white'
                    : 'text-[#171A2F] hover:bg-white'
                }`}
              >
                2D
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-[#F49A3C] text-white'
                    : 'text-[#171A2F] hover:bg-white'
                }`}
              >
                3D
              </button>
            </div>
          )}

          {onSaveToLibrary && (
            <button
              type="button"
              data-testid="save-generated-experiment-btn"
              onClick={() => onSaveToLibrary(spec)}
              disabled={isSavedInLibrary}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                isSavedInLibrary
                  ? 'bg-[#E6F4EA] border-[#A8DAB5] text-[#1E6E38]'
                  : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F] hover:border-[#F49A3C]'
              }`}
            >
              {isSavedInLibrary ? (
                <BookmarkCheck className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5 text-[#C96D12]" />
              )}
              <span>
                {isSavedInLibrary ? t.dynamicLab.savedToLibraryBtn : t.dynamicLab.saveToLibraryBtn}
              </span>
            </button>
          )}
        </div>
      </div>

      {spec.isSimplifiedModel && spec.limitationNote && (
        <div
          role="note"
          data-testid="dynamic-simplified-model-notice"
          className="rounded-xl border border-[#D97706]/35 bg-[#FEF3C7]/45 px-4 py-2.5 flex items-start gap-2.5 text-xs text-[#171A2F]"
        >
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{t.dynamicLab.simplifiedModelHeading}: </span>
            <span>{localized?.limitationNote || spec.limitationNote}</span>
          </div>
        </div>
      )}

      {/* Main Viewport + Parameter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        <div
          className={`${
            tutorOpen ? 'lg:col-span-7' : 'lg:col-span-8'
          } min-w-0 clay-card p-2.5 sm:p-4 space-y-2.5`}
        >
          <div
            data-testid="dynamic-simulation-viewport"
            className="relative rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] overflow-hidden h-[280px] sm:h-[360px] lg:h-[490px]"
          >
            {viewMode === '3d' && spec.supports3d ? (
              <DynamicExperiment3DViewport
                spec={spec}
                paramValues={paramValues}
                isPlaying={isPlaying}
                reducedMotion={reducedMotion}
                resetSignal={resetSignal}
                fallbackMessage={t.lab.webglFallback}
                selectedComponentId={selectedHit?.componentId}
                onFrameUpdate={setLiveFrame}
                onComponentHit={handleComponentHit}
              />
            ) : (
              <DynamicExperimentCanvas
                spec={spec}
                paramValues={paramValues}
                isPlaying={isPlaying}
                reducedMotion={reducedMotion}
                resetSignal={resetSignal}
                selectedComponentId={selectedHit?.componentId}
                onFrameUpdate={setLiveFrame}
                onComponentHit={handleComponentHit}
              />
            )}

            {/* Top-left part count badge */}
            <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 rounded-lg bg-white/95 border border-[#EFE7DF] px-2.5 py-1 text-[11px] font-medium text-[#171A2F]">
              {selectedComponent
                ? `${t.componentOverlay.selectedPrefix}: ${localized?.componentLabels?.[selectedComponent.id]?.label || selectedComponent.label}`
                : `${spec.components.length} ${t.componentOverlay.interactivePartsLabel}`}
            </div>

            {/* Stage 1: Identify tooltip */}
            {stageMode === 'identify' && selectedComponent && selectedHit && (
              <div
                data-testid="dynamic-component-identify"
                style={{
                  left: `${Math.min(Math.max(12, selectedHit.anchorPx.x - 110), Math.max(12, selectedHit.viewportSize.width - 256))}px`,
                  top: `${Math.min(Math.max(12, selectedHit.anchorPx.y + 18), Math.max(12, selectedHit.viewportSize.height - 118))}px`,
                }}
                className="absolute z-20 w-[240px] rounded-xl bg-white border border-[#F49A3C]/45 shadow-md p-2.5 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-[#171A2F] truncate">
                    {localized?.componentLabels?.[selectedComponent.id]?.label || selectedComponent.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHit(null);
                      setStageMode('idle');
                    }}
                    className="p-0.5 text-[#6F7487] hover:text-[#171A2F] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#6F7487] line-clamp-2">
                  {localized?.componentLabels?.[selectedComponent.id]?.description ||
                    selectedComponent.description}
                </p>
                <button
                  type="button"
                  onClick={() => setStageMode('explain')}
                  className="text-[11px] font-semibold text-[#C96D12] hover:underline cursor-pointer"
                >
                  {t.componentOverlay.clickAgainHint} &rarr;
                </button>
              </div>
            )}

            {/* Stage 2: Rich Component Reference & Explanation Card */}
            {stageMode === 'explain' && selectedComponent && (
              <aside
                data-testid="dynamic-component-explain"
                className="absolute bottom-2 left-2 right-2 sm:top-2.5 sm:bottom-[68px] sm:left-auto sm:right-2.5 sm:w-[295px] z-20 rounded-xl bg-white border border-[#EFE7DF] shadow-lg flex flex-col overflow-hidden"
              >
                <div className="bg-[#FFF3E3]/70 border-b border-[#EFE7DF] px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#171A2F] truncate">
                    {localized?.componentLabels?.[selectedComponent.id]?.label || selectedComponent.label}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHit(null);
                      setStageMode('idle');
                    }}
                    className="p-1 rounded-lg bg-white border border-[#EFE7DF] text-[#171A2F] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-y-auto p-3 space-y-2.5 text-xs text-[#171A2F]">
                  {selectedVisual && (
                    <figure className="rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] overflow-hidden">
                      {!imgFailed ? (
                        <img
                          src={selectedVisual.src}
                          alt={selectedVisual.alt[language] || selectedVisual.alt.en}
                          onError={() => setImgFailed(true)}
                          className="w-full h-24 object-contain bg-white p-1.5"
                        />
                      ) : (
                        <div className="p-2.5 bg-white text-[11px] text-[#6F7487]">
                          {selectedVisual.fallbackDescription[language] ||
                            selectedVisual.fallbackDescription.en}
                        </div>
                      )}
                      <figcaption className="px-2.5 py-1 border-t border-[#EFE7DF] text-[10px] text-[#6F7487]">
                        {selectedVisual.caption[language] || selectedVisual.caption.en}
                      </figcaption>
                    </figure>
                  )}

                  <div className="p-2.5 rounded-lg border border-[#EFE7DF]/80 bg-white space-y-1">
                    <p className="text-[11px] font-semibold text-[#C96D12]">
                      {t.componentOverlay.fields.definition}
                    </p>
                    <p className="leading-relaxed">
                      {localized?.componentLabels?.[selectedComponent.id]?.description ||
                        selectedComponent.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[#EFE7DF]/80 bg-white space-y-1">
                    <p className="text-[11px] font-semibold text-[#C96D12]">
                      {t.componentOverlay.fields.relationshipWithOthers}
                    </p>
                    <p className="leading-relaxed">
                      {localized?.componentLabels?.[selectedComponent.id]?.relationship ||
                        selectedComponent.relationship}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#EFE7DF] bg-[#FFF9F4] px-3 py-2 flex items-center justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onAskComponentInTutor(
                        `Explain the role of ${selectedComponent.label} in ${spec.title}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F49A3C] text-white text-[11px] font-semibold cursor-pointer"
                  >
                    <MessageSquareText className="w-3 h-3" />
                    <span>{t.componentOverlay.askPhysixAiBtn}</span>
                  </button>
                </div>
              </aside>
            )}

            <CompanionDock
              variant="floating"
              language={language}
              t={t}
              message={companionMessage}
              rewardState={rewardState}
              latestBadgeToast={latestBadgeToast}
              reducedMotion={reducedMotion}
              onOpenFullTutor={(prefill) =>
                prefill ? onAskComponentInTutor(prefill) : onToggleTutor()
              }
              onDismissBadgeToast={onDismissBadgeToast}
            />
          </div>

          <p className="text-xs text-[#6F7487] px-1 truncate">{liveFrame.summaryText}</p>
        </div>

        {/* Right Controls & Live Telemetry Panel */}
        <aside
          className={`flex flex-col ${
            tutorOpen ? 'lg:col-span-5' : 'lg:col-span-4'
          } min-w-0 clay-card overflow-hidden`}
        >
          <div className="px-4 py-3 border-b border-[#EFE7DF] bg-[#FFF9F4]/80 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#171A2F] truncate">
              {t.lab.parametersHeading}
            </h2>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? t.lab.pause : t.lab.play}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#C96D12]" />
                <span>{t.lab.resetDefaults}</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Live SI Telemetry Readout */}
            <div className="grid grid-cols-2 gap-2">
              {liveFrame.metrics.map((m) => (
                <div
                  key={m.key}
                  className={`p-2.5 rounded-xl border ${
                    m.accent
                      ? 'bg-[#FFF3E3]/45 border-[#F49A3C]/30'
                      : 'bg-[#FFF9F4] border-[#EFE7DF]'
                  }`}
                >
                  <p className="text-[11px] text-[#6F7487] truncate">{m.label}</p>
                  <p className="font-mono-tabular text-sm font-bold text-[#171A2F]">
                    {m.value}{' '}
                    <span className="text-xs font-normal text-[#6F7487]">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Dynamic Controls */}
            <div className="space-y-3 pt-2 border-t border-[#EFE7DF]">
              {spec.parameters.map((param) => {
                const label = localized?.parameterLabels?.[param.key] || param.label;
                const val = paramValues[param.key] ?? param.defaultValue;

                if (param.controlType === 'toggle') {
                  return (
                    <label
                      key={param.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#EFE7DF] bg-[#FFF9F4]/60 px-3 py-2 text-xs font-medium text-[#171A2F] cursor-pointer"
                    >
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={val >= 0.5}
                        onChange={(e) => handleParamChange(param.key, e.target.checked ? 1 : 0)}
                        className="w-4 h-4 accent-[#6F4E37] cursor-pointer"
                      />
                    </label>
                  );
                }

                return (
                  <ParameterSliderInput
                    key={param.key}
                    id={`dyn-param-${param.key}`}
                    label={`${label} (${param.symbol})`}
                    unit={param.unit}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={val}
                    onChange={(next) => handleParamChange(param.key, next)}
                  />
                );
              })}
            </div>

            {/* Governing Equation & Quick Observation Capture */}
            {spec.equations[0] && (
              <div className="p-2.5 rounded-xl bg-[#FFF3E3]/40 border border-[#EFE7DF] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C96D12]">
                  <BookOpen className="w-3 h-3" />
                  <span>{spec.equations[0].name}</span>
                </div>
                <p className="font-mono-tabular text-xs font-semibold text-[#171A2F]">
                  {spec.equations[0].formula}
                </p>
              </div>
            )}

            {onCaptureObservation && (
              <button
                type="button"
                onClick={() => {
                  onCaptureObservation(liveFrame.summaryText);
                  onCompanionLabEvent?.({
                    eventType: 'observation_logged',
                    parameterSummary: liveFrame.summaryText,
                  });
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] hover:border-[#F49A3C] text-xs font-semibold text-[#171A2F] cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#C96D12]" />
                <span>{t.experimentLab.saveObservationBtn}</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
