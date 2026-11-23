import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Box,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Compass,
  Disc,
  Eye,
  Flame,
  Gauge,
  Loader2,
  Magnet,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { LanguageCode } from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import type {
  ComponentExplanationContent,
  ComponentIconKey,
  InteractionStage,
  RegisteredSimulationComponent,
} from '../systems/componentInteraction/types';
import { getComponentRealWorldVisual } from '../data/componentImages';

interface ViewportComponentOverlayProps {
  stage: InteractionStage;
  language: LanguageCode;
  t: TranslationBundle;
  reducedMotion?: boolean;
  simulationEngineId?: import('../types/physics').SimulationEngineId;
  simulationPreset?: string;
  selectedComponent: RegisteredSimulationComponent | null;
  anchorPx: { x: number; y: number } | null;
  viewportSize: { width: number; height: number };
  explanation: ComponentExplanationContent | null;
  isLoadingAi: boolean;
  aiNotice: string | null;
  interactivePartCount?: number;
  firstOpenHintVisible?: boolean;
  onDismissFirstOpenHint?: () => void;
  onAskPhysixAi?: () => void;
  onOpenExplain: () => void;
  onClose: () => void;
  onRefreshAi: () => void;
}

function getComponentIcon(iconKey?: ComponentIconKey, componentId?: string) {
  const key =
    iconKey ||
    (componentId === 'north_pole'
      ? 'north_pole'
      : componentId === 'south_pole'
        ? 'south_pole'
        : componentId === 'field_lines'
          ? 'field_lines'
          : componentId === 'field_direction_arrows'
            ? 'arrows'
            : componentId === 'compass_needle'
              ? 'compass'
              : componentId === 'compass_pivot'
                ? 'pivot'
                : 'magnet');

  if (
    componentId &&
    ['battery', 'switch', 'resistor', 'bulb', 'wires', 'electromagnet_coil', 'current_direction'].includes(
      componentId
    )
  ) {
    return {
      Icon: Zap,
      tintClass: 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]/40',
    };
  }
  if (
    componentId &&
    ['mirror', 'convex_mirror', 'concave_mirror', 'convex_lens', 'concave_lens', 'glass_slab', 'prism', 'incident_ray', 'reflected_ray', 'refracted_ray', 'normal'].includes(
      componentId
    )
  ) {
    return {
      Icon: Eye,
      tintClass: 'bg-[#FFF3E3] text-[#5B3E78] border-[#F49A3C]/25',
    };
  }
  if (
    componentId &&
    ['heat_source', 'thermometer_probe', 'conducting_rod', 'convection_fluid', 'radiating_surface'].includes(
      componentId
    )
  ) {
    return {
      Icon: Flame,
      tintClass: 'bg-[#FEE2E2] text-[#B83A2D] border-[#B83A2D]/25',
    };
  }
  if (componentId && ['vibrating_source', 'compression', 'rarefaction', 'wave'].includes(componentId)) {
    return {
      Icon: Activity,
      tintClass: 'bg-[#FFF3E3] text-[#C96D12] border-[#EFE7DF]',
    };
  }
  if (
    componentId &&
    ['moving_body', 'velocity_vector', 'motion_graph', 'distance_path', 'displacement_vector', 'reference_origin'].includes(
      componentId
    )
  ) {
    return {
      Icon: Gauge,
      tintClass: 'bg-[#FFF9F4] text-[#C96D12] border-[#EFE7DF]',
    };
  }
  if (
    componentId &&
    ['test_block', 'surface_or_fluid', 'applied_force_arrow', 'friction_force_arrow', 'buoyancy_arrow', 'pulley_wheel', 'fulcrum_pivot', 'energy_bob', 'track_height_marker', 'ke_pe_meter'].includes(
      componentId
    )
  ) {
    return {
      Icon: Box,
      tintClass: 'bg-[#FFF9F4] text-[#C96D12] border-[#EFE7DF]',
    };
  }

  switch (key) {
    case 'north_pole':
      return {
        Icon: Magnet,
        tintClass: 'bg-[#B83A2D]/12 text-[#B83A2D] border-[#B83A2D]/25',
      };
    case 'south_pole':
      return {
        Icon: Magnet,
        tintClass: 'bg-[#3E4C59]/12 text-[#3E4C59] border-[#3E4C59]/25',
      };
    case 'field_lines':
      return {
        Icon: Waves,
        tintClass: 'bg-[#F49A3C]/12 text-[#C96D12] border-[#F49A3C]/25',
      };
    case 'arrows':
      return {
        Icon: ArrowUpRight,
        tintClass: 'bg-[#D97706]/12 text-[#B45309] border-[#D97706]/30',
      };
    case 'compass':
      return {
        Icon: Compass,
        tintClass: 'bg-[#F49A3C]/12 text-[#C96D12] border-[#F49A3C]/25',
      };
    case 'pivot':
      return {
        Icon: CircleDot,
        tintClass: 'bg-[#8A5A19]/12 text-[#8A5A19] border-[#8A5A19]/25',
      };
    case 'magnet':
      return {
        Icon: Magnet,
        tintClass: 'bg-[#F49A3C]/12 text-[#C96D12] border-[#F49A3C]/25',
      };
    default:
      return {
        Icon: Disc,
        tintClass: 'bg-[#FFF3E3] text-[#171A2F] border-[#EFE7DF]',
      };
  }
}

function computeTooltipPosition(
  anchor: { x: number; y: number } | null,
  viewport: { width: number; height: number }
): { left: number; top: number } {
  const vw = Math.max(260, viewport.width);
  const vh = Math.max(180, viewport.height);
  const tipW = Math.min(248, vw - 20);
  const tipH = 98;
  const pad = 8;

  if (!anchor) {
    return {
      left: Math.round((vw - tipW) / 2),
      top: pad,
    };
  }

  // Place tooltip away from the clicked point so it never covers the inspected component
  const placeLeft = anchor.x > vw * 0.58;
  const placeAbove = anchor.y > vh * 0.44;

  const rawX = placeLeft ? anchor.x - tipW - 14 : anchor.x + 14;
  const rawY = placeAbove ? anchor.y - tipH - 16 : anchor.y + 18;

  const left = Math.max(pad, Math.min(vw - tipW - pad, Math.round(rawX)));
  const top = Math.max(pad, Math.min(vh - tipH - pad, Math.round(rawY)));

  return { left, top };
}

export const ViewportComponentOverlay: React.FC<ViewportComponentOverlayProps> = ({
  stage,
  language,
  t,
  reducedMotion = false,
  simulationEngineId,
  simulationPreset,
  selectedComponent,
  anchorPx,
  viewportSize,
  explanation,
  isLoadingAi,
  aiNotice,
  interactivePartCount,
  firstOpenHintVisible = false,
  onDismissFirstOpenHint,
  onAskPhysixAi,
  onOpenExplain,
  onClose,
  onRefreshAi,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [loadState, setLoadState] = useState<{
    key: string;
    status: 'loading' | 'loaded' | 'error';
  }>({ key: '', status: 'loading' });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const copy = t.componentOverlay;
  const realWorldVisual = getComponentRealWorldVisual(
    selectedComponent?.id,
    simulationEngineId,
    simulationPreset
  );
  const imageKey = realWorldVisual
    ? `${realWorldVisual.componentId}:${realWorldVisual.src}:${imageRetryCount}`
    : '';
  const effectiveLoadStatus: 'loading' | 'loaded' | 'error' =
    loadState.key === imageKey ? loadState.status : 'loading';
  const { Icon, tintClass } = getComponentIcon(
    selectedComponent?.iconKey,
    selectedComponent?.id
  );
  const transitionDuration = reducedMotion ? 0 : 0.2;

  useEffect(() => {
    setIsExpanded(false);
    setImageRetryCount(0);
  }, [selectedComponent?.id, stage]);

  useEffect(() => {
    if (stage !== 'explain' || !imageKey) return;
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete) {
      setLoadState({
        key: imageKey,
        status: imgEl.naturalWidth > 0 ? 'loaded' : 'error',
      });
    }
  }, [stage, imageKey]);

  const pos = computeTooltipPosition(anchorPx, viewportSize);
  const displayName = selectedComponent
    ? selectedComponent.displayName[language] || selectedComponent.displayName.en
    : '';
  const identifyText = selectedComponent
    ? selectedComponent.identificationText[language] || selectedComponent.identificationText.en
    : '';

  const dockLeft = Boolean(
    anchorPx && viewportSize.width > 0 && anchorPx.x > viewportSize.width * 0.56
  );

  const conciseSections: Array<{ label: string; value: string }> = explanation
    ? [
        { label: copy.fields.definition, value: explanation.definition },
        { label: copy.fields.function, value: explanation.functionDescription },
        { label: copy.fields.behaviour, value: explanation.behaviour },
        { label: copy.fields.relationshipWithOthers, value: explanation.relationshipWithOthers },
      ]
    : [];

  const expandedSections: Array<{ label: string; value: string }> = explanation
    ? [
        { label: copy.fields.characteristics, value: explanation.characteristics },
        { label: copy.fields.scientificProperties, value: explanation.scientificProperties },
        { label: copy.fields.realWorldExample, value: explanation.realWorldExample },
      ]
    : [];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Top-Left Quiet Indicator & Dismissible First-Open Hint */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5 max-w-[calc(100%-5rem)]">
        {(selectedComponent || (typeof interactivePartCount === 'number' && interactivePartCount > 0)) && (
          <div
            data-testid="viewport-parts-indicator"
            className="rounded-lg bg-white/95 border border-[#EFE7DF] px-2.5 py-1 text-[11px] font-medium text-[#171A2F] shadow-xs"
          >
            {selectedComponent
              ? `${copy.selectedPrefix}: ${displayName}`
              : `${interactivePartCount} ${copy.interactivePartsLabel}`}
          </div>
        )}

        {firstOpenHintVisible && stage === 'idle' && (
          <div
            data-testid="viewport-first-open-hint"
            className="pointer-events-auto rounded-lg bg-[#171A2F] text-white px-2.5 py-1.5 text-[11px] shadow-md flex items-center gap-2"
          >
            <span className="leading-snug">{copy.firstOpenHint}</span>
            {onDismissFirstOpenHint && (
              <button
                type="button"
                onClick={onDismissFirstOpenHint}
                aria-label={copy.dismissHintBtn}
                title={copy.dismissHintBtn}
                className="p-0.5 rounded-sm text-white/80 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {stage === 'idle' && (
          <motion.div
            key="idle-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitionDuration }}
            data-testid="viewport-idle-hint"
            className="hidden sm:block absolute bottom-2.5 left-2.5 max-w-[calc(100%-5rem)] rounded-lg bg-white/95 border border-[#EFE7DF] px-2.5 py-1 text-[11px] font-medium text-[#6F7487] shadow-xs"
          >
            {copy.idleHint}
          </motion.div>
        )}

        {stage === 'identify' && selectedComponent && (
          <motion.div
            key={`identify-${selectedComponent.id}`}
            data-testid="viewport-identify-tooltip"
            data-component-id={selectedComponent.id}
            role="dialog"
            aria-label={displayName}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: transitionDuration, ease: 'easeOut' }}
            style={{ left: `${pos.left}px`, top: `${pos.top}px` }}
            className="pointer-events-auto absolute w-[240px] sm:w-[252px] rounded-xl bg-white border border-[#F49A3C]/45 shadow-md p-2.5 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${tintClass}`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <h3 className="text-xs font-bold text-[#171A2F] leading-tight truncate">
                  {displayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={copy.closeBtn}
                className="text-[#6F7487] hover:text-[#171A2F] p-0.5 rounded-sm cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#6F7487] leading-snug">{identifyText}</p>
            <button
              type="button"
              onClick={onOpenExplain}
              data-testid="viewport-identify-explain-trigger"
              className="w-full text-left text-[11px] font-semibold text-[#C96D12] hover:underline pt-0.5 cursor-pointer"
            >
              {copy.clickAgainHint} →
            </button>
          </motion.div>
        )}

        {stage === 'explain' && explanation && (
          <motion.aside
            key={`explain-${selectedComponent?.id || explanation.name}`}
            data-testid="viewport-explain-panel"
            data-component-id={selectedComponent?.id || ''}
            aria-label={explanation.name}
            initial={
              reducedMotion
                ? { opacity: 1 }
                : { opacity: 0, x: dockLeft ? -16 : 16, scale: 0.98 }
            }
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: dockLeft ? -14 : 14, scale: 0.98 }
            }
            transition={{ duration: transitionDuration, ease: 'easeOut' }}
            className={`pointer-events-auto absolute bottom-2 left-2 right-2 max-h-[84%] sm:top-2.5 sm:max-h-none sm:w-[276px] md:w-[304px] sm:max-w-[40%] rounded-xl bg-white border border-[#EFE7DF] shadow-lg flex flex-col overflow-hidden ${
              dockLeft
                ? 'sm:bottom-2.5 sm:left-2.5 sm:right-auto'
                : 'sm:bottom-[72px] sm:left-auto sm:right-2.5'
            }`}
          >
            {/* Header with Component Icon */}
            <div className="bg-[#FFF3E3]/65 border-b border-[#EFE7DF] px-3.5 py-2.5 flex items-start justify-between gap-2 shrink-0">
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  data-testid="viewport-explain-icon"
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${tintClass}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#171A2F] leading-snug truncate">
                    {explanation.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
                    {isLoadingAi ? (
                      <span className="inline-flex items-center gap-1 text-[#C96D12]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{copy.tailoringAiLabel}</span>
                      </span>
                    ) : explanation.source === 'ai_enhanced' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-[#EFE7DF] text-[#C96D12]">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{copy.aiTailoredBadge}</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={onRefreshAi}
                  disabled={isLoadingAi}
                  aria-label={copy.refreshAiBtn}
                  title={copy.refreshAiBtn}
                  className="p-1.5 rounded-lg border border-[#EFE7DF] bg-white text-[#C96D12] hover:bg-[#FFF9F4] disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`}
                  />
                </button>
                <button
                  type="button"
                  data-testid="viewport-explain-close"
                  onClick={onClose}
                  aria-label={copy.closeBtn}
                  className="p-1.5 rounded-lg border border-[#EFE7DF] bg-white text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Component Explanation Body */}
            <div className="overflow-y-auto px-3.5 py-3 space-y-2.5 text-xs text-[#171A2F]">
              {realWorldVisual && (
                <figure
                  data-testid="component-real-world-visual"
                  data-component-id={realWorldVisual.componentId}
                  data-image-type={realWorldVisual.imageType}
                  data-image-status={effectiveLoadStatus}
                  className="rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] overflow-hidden"
                >
                  {effectiveLoadStatus === 'loading' && (
                    <div
                      data-testid="component-visual-skeleton"
                      className="w-full h-24 sm:h-28 bg-gradient-to-r from-[#EFECE7] via-[#FFF9F4] to-[#EFECE7] animate-pulse flex items-center justify-center px-3"
                    >
                      <span className="text-[11px] font-medium text-[#6F7487]">
                        {copy.imageLoadingLabel}
                      </span>
                    </div>
                  )}

                  {effectiveLoadStatus === 'error' ? (
                    <div
                      data-testid="component-visual-error"
                      className="w-full min-h-[5.5rem] bg-white px-3 py-2.5 flex flex-col justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold text-[#B83A2D]">
                          {copy.imageErrorLabel}
                        </p>
                        <p className="text-[11px] text-[#171A2F] leading-snug">
                          {realWorldVisual.fallbackDescription[language] ||
                            realWorldVisual.fallbackDescription.en}
                        </p>
                      </div>
                      <div>
                        <button
                          type="button"
                          data-testid="component-visual-retry-btn"
                          onClick={() => {
                            setImageRetryCount((c) => c + 1);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#EFE7DF] bg-[#FFF9F4] hover:bg-[#FFF3E3]/50 text-[11px] font-semibold text-[#C96D12] cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" aria-hidden="true" />
                          <span>{copy.retryImageBtn}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <img
                      key={imageKey}
                      ref={imgRef}
                      src={realWorldVisual.src}
                      alt={realWorldVisual.alt[language] || realWorldVisual.alt.en}
                      loading="eager"
                      referrerPolicy="no-referrer"
                      onLoad={() => setLoadState({ key: imageKey, status: 'loaded' })}
                      onError={() => setLoadState({ key: imageKey, status: 'error' })}
                      className={
                        effectiveLoadStatus === 'loaded'
                          ? 'w-full h-24 sm:h-28 object-contain p-1.5 bg-white block'
                          : 'sr-only'
                      }
                    />
                  )}

                  <figcaption className="px-2.5 py-1.5 border-t border-[#EFE7DF]/80 space-y-0.5">
                    <p className="text-[11px] font-medium text-[#171A2F] leading-tight">
                      {realWorldVisual.caption[language] || realWorldVisual.caption.en}
                    </p>
                    <p className="text-[10px] text-[#6F7487]">
                      {realWorldVisual.attribution[language] || copy.visualReferenceBadge}
                    </p>
                  </figcaption>
                </figure>
              )}

              {explanation.currentStateSummary && (
                <div className="rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] p-2.5 space-y-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#C96D12]">
                    {copy.liveStateLabel}
                  </p>
                  <p className="text-xs text-[#171A2F] leading-relaxed">
                    {explanation.currentStateSummary}
                  </p>
                </div>
              )}

              {aiNotice && (
                <p className="text-[11px] text-[#6F7487] italic">{aiNotice}</p>
              )}

              {conciseSections.map((sec) => (
                <section
                  key={sec.label}
                  className="rounded-lg border border-[#EFE7DF]/80 bg-white p-2.5 space-y-1"
                >
                  <h4 className="text-[11px] font-semibold text-[#C96D12]">
                    {sec.label}
                  </h4>
                  <p className="text-xs text-[#171A2F] leading-relaxed">{sec.value}</p>
                </section>
              ))}

              <button
                type="button"
                data-testid="viewport-learn-more-btn"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] hover:bg-[#FFF3E3]/55 text-xs font-semibold text-[#C96D12] cursor-pointer transition-colors"
              >
                <span>{isExpanded ? copy.showLessBtn : copy.learnMoreBtn}</span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>

              {isExpanded && (
                <div data-testid="viewport-expanded-details" className="space-y-2.5">
                  {expandedSections.map((sec) => (
                    <section
                      key={sec.label}
                      className="rounded-lg border border-[#EFE7DF]/80 bg-white p-2.5 space-y-1"
                    >
                      <h4 className="text-[11px] font-semibold text-[#C96D12]">
                        {sec.label}
                      </h4>
                      <p className="text-xs text-[#171A2F] leading-relaxed">{sec.value}</p>
                    </section>
                  ))}

                  {explanation.whyItMatters && (
                    <section
                      data-testid="viewport-explain-why-matters"
                      className="rounded-lg border border-[#F49A3C]/30 bg-[#FFF3E3]/50 p-2.5 space-y-1"
                    >
                      <h4 className="text-[11px] font-bold text-[#C96D12]">
                        {copy.fields.whyItMatters}
                      </h4>
                      <p className="text-xs text-[#171A2F] leading-relaxed">
                        {explanation.whyItMatters}
                      </p>
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* Footer with Ask PHYSIX AI action */}
            <div className="border-t border-[#EFE7DF] bg-[#FFF9F4] px-3 py-2 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[10px] text-[#6F7487] truncate">{copy.deselectHint}</span>
              {onAskPhysixAi && (
                <button
                  type="button"
                  data-testid="viewport-ask-physix-ai-btn"
                  onClick={onAskPhysixAi}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F49A3C] text-white text-[11px] font-semibold hover:bg-[#E5882A] cursor-pointer shrink-0"
                >
                  <MessageSquareText className="w-3 h-3" aria-hidden="true" />
                  <span>{copy.askPhysixAiBtn}</span>
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};
