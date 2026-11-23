import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FileText,
  FlaskConical,
  Info,
  Loader2,
  Shapes,
  Sigma,
  Sparkles,
  Upload,
} from 'lucide-react';
import type {
  LanguageCode,
  PhysicsConcept,
  TextbookAnalysisResult,
} from '../types/physics';
import type { DynamicExperimentSpec } from '../types/dynamicExperiment';
import type { TranslationBundle } from '../i18n/translations';
import { SIMULATION_REGISTRY } from '../data/simulationRegistry';
import { matchExperimentInRegistry } from '../data/experimentMatcher';
import { LanguageSelector } from './LanguageSelector';

interface ConceptExplorerViewProps {
  analysis: TextbookAnalysisResult | null;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  t: TranslationBundle;
  onLaunchSimulation: (simulationId?: string, matchedExperimentId?: string) => void;
  savedDynamicExperiments?: DynamicExperimentSpec[];
  onLaunchDynamicExperiment?: (spec: DynamicExperimentSpec) => void;
  onGenerateDynamicExperiment?: (focusConcept?: PhysicsConcept) => void;
  isGeneratingDynamic?: boolean;
  generationStageText?: string | null;
  generationError?: string | null;
  onDismissGenerationError?: () => void;
  onOpenSampleModule: () => void;
  onBackHome: () => void;
}

export const ConceptExplorerView: React.FC<ConceptExplorerViewProps> = ({
  analysis,
  language,
  onLanguageChange,
  t,
  onLaunchSimulation,
  savedDynamicExperiments = [],
  onLaunchDynamicExperiment,
  onGenerateDynamicExperiment,
  isGeneratingDynamic = false,
  generationStageText = null,
  generationError = null,
  onDismissGenerationError,
  onOpenSampleModule,
  onBackHome,
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);

  useEffect(() => {
    if (analysis && analysis.concepts.length > 0) {
      setSelectedConceptId(analysis.concepts[0].id);
    } else {
      setSelectedConceptId(null);
    }
    setShowExtractedText(false);
  }, [analysis]);

  const effectiveMatch = useMemo(() => {
    if (!analysis || !analysis.is_physics_content) return null;
    if (savedDynamicExperiments.length > 0) {
      return matchExperimentInRegistry({
        experimentName: analysis.detected_experiment?.experiment_name || analysis.main_topic,
        conceptName: analysis.detected_experiment?.physics_concept || analysis.concepts[0]?.name,
        conceptId: analysis.concepts[0]?.id,
        summary: analysis.summary,
        equations: analysis.equations.map((e) => e.formula),
        apparatus: analysis.detected_experiment?.components_apparatus,
        classLevel: analysis.detected_experiment?.class_level_numeric,
        savedDynamicExperiments,
      });
    }
    if (analysis.registry_match) return analysis.registry_match;
    return matchExperimentInRegistry({
      experimentName: analysis.detected_experiment?.experiment_name || analysis.main_topic,
      conceptName: analysis.detected_experiment?.physics_concept || analysis.concepts[0]?.name,
      conceptId: analysis.concepts[0]?.id,
      summary: analysis.summary,
      equations: analysis.equations.map((e) => e.formula),
      apparatus: analysis.detected_experiment?.components_apparatus,
      classLevel: analysis.detected_experiment?.class_level_numeric,
      savedDynamicExperiments,
    });
  }, [analysis, savedDynamicExperiments]);

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="clay-card p-8 sm:p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#FFF3E3] text-[#C96D12] flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold text-[#171A2F] mb-3">
            {t.conceptExplorer.emptyTitle}
          </h1>
          <p className="text-sm sm:text-base text-[#6F7487] max-w-lg mx-auto mb-8 leading-relaxed">
            {t.conceptExplorer.emptyDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>{t.conceptExplorer.uploadPageBtn}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSampleModule}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-sm font-semibold hover:bg-[#FFE6C7] transition-colors cursor-pointer min-h-[44px]"
            >
              <Compass className="w-4 h-4 text-[#C96D12]" />
              <span>{t.conceptExplorer.openSampleModuleBtn}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Instant trilingual lookup without re-analyzing the textbook photograph
  const localized = analysis.translations?.[language];
  const displayChapter = localized?.chapter || analysis.chapter;
  const displayTopic = localized?.main_topic || analysis.main_topic;
  const displaySummary = localized?.summary || analysis.summary;

  const localizedConcepts = analysis.concepts.map((concept, idx) => {
    const match =
      localized?.concepts?.find((c) => c.id === concept.id) || localized?.concepts?.[idx];
    return {
      ...concept,
      name: match?.name || concept.name,
      description: match?.description || concept.description,
      relationships: match?.relationships || concept.relationships,
      variables:
        match?.variables && match.variables.length > 0
          ? match.variables
          : concept.variables,
      terminology:
        match?.terminology && match.terminology.length > 0
          ? match.terminology
          : concept.terminology || [],
    };
  });

  const displayDiagrams = analysis.detected_diagrams.map((diag, idx) => {
    const match = localized?.diagrams?.[idx];
    return {
      ...diag,
      title: match?.title || diag.title,
      description: match?.description || diag.description,
      components:
        match?.components && match.components.length > 0
          ? match.components
          : diag.components,
    };
  });

  // Aggregate localized terminology if available
  const displayTerminology = (() => {
    const seen = new Set<string>();
    const combined: Array<{ term: string; definition: string }> = [];
    for (const c of localizedConcepts) {
      for (const item of c.terminology || []) {
        const key = item.term.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }
    }
    return combined.length > 0 ? combined : analysis.terminology;
  })();

  const selectedConcept:
    | (PhysicsConcept & { terminology: Array<{ term: string; definition: string }> })
    | undefined =
    localizedConcepts.find((c) => c.id === selectedConceptId) || localizedConcepts[0];

  const isSelectedInteractive = Boolean(
    selectedConcept?.simulation_supported &&
      selectedConcept.simulation_id !== 'none' &&
      SIMULATION_REGISTRY[selectedConcept.simulation_id]?.implemented
  );

  const registeredSimLabel =
    selectedConcept &&
    selectedConcept.simulation_id !== 'none' &&
    SIMULATION_REGISTRY[selectedConcept.simulation_id]
      ? SIMULATION_REGISTRY[selectedConcept.simulation_id].label
      : null;

  const matchedSavedExperiment = effectiveMatch?.matchedDynamicExperimentId
    ? savedDynamicExperiments.find((d) => d.id === effectiveMatch.matchedDynamicExperimentId) ?? null
    : null;

  const findSavedDynamicForConcept = (concept: PhysicsConcept): DynamicExperimentSpec | null => {
    const q = concept.name.toLowerCase();
    return (
      savedDynamicExperiments.find(
        (d) =>
          d.conceptId === concept.id ||
          d.conceptName.toLowerCase() === q ||
          d.title.toLowerCase().includes(q)
      ) ?? null
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFE7DF] pb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#C96D12]">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.conceptExplorer.backToDashboard}</span>
            </button>
            <span aria-hidden="true" className="text-[#6F7487]">·</span>
            <span className="text-[#6F7487]">
              {analysis.source === 'gemini_scan'
                ? t.conceptExplorer.scannedPageBadge
                : t.conceptExplorer.builtInModuleBadge}
            </span>
            <span aria-hidden="true" className="text-[#6F7487]">·</span>
            <span className="text-[#6F7487]">
              {analysis.subject} · {analysis.class_level}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171A2F]">
            {t.conceptExplorer.title}
          </h1>
          <p className="text-sm text-[#6F7487]">{t.conceptExplorer.subtitle}</p>
        </div>

        <LanguageSelector language={language} onChange={onLanguageChange} />
      </div>

      {/* Non-physics image warning */}
      {!analysis.is_physics_content && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#FDF2F0] border border-[#E5B8B0] text-sm text-[#7A271A] flex items-start gap-3"
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{t.conceptExplorer.nonPhysicsWarning}</span>
        </div>
      )}

      {/* Generation Error Notice */}
      {generationError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-[#FDF2F0] border border-[#E5B8B0] text-sm text-[#7A271A] flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t.dynamicLab.generateFailedHeading}</p>
              <p className="text-xs sm:text-sm mt-0.5">{generationError}</p>
            </div>
          </div>
          {onDismissGenerationError && (
            <button
              type="button"
              onClick={onDismissGenerationError}
              className="text-xs font-semibold underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Uncertain content alert if Gemini flagged blurry / illegible areas */}
      {analysis.uncertain_content && analysis.uncertain_content.length > 0 && (
        <div
          role="status"
          className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] text-sm text-[#171A2F] flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-[#C96D12] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[#171A2F]">
              {t.conceptExplorer.uncertainContentHeading}
            </p>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-[#6F7487] space-y-0.5">
              {analysis.uncertain_content.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Chapter, Topic, Overview & Uploaded Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div
          className={`${
            analysis.imagePreviewUrl ? 'lg:col-span-8' : 'lg:col-span-12'
          } clay-card p-6 sm:p-8 space-y-6`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-6 border-b border-[#EFE7DF]">
            <div>
              <p className="text-xs font-medium text-[#6F7487] mb-1">
                {t.conceptExplorer.chapterLabel}
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#171A2F]">
                {displayChapter}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6F7487] mb-1">
                {t.conceptExplorer.topicLabel}
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#C96D12]">
                {displayTopic}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#6F7487] mb-1">
                {t.conceptExplorer.confidenceLabel}
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#171A2F]">
                {t.conceptExplorer.confidenceLevels[analysis.overall_confidence]} ·{' '}
                {analysis.class_level}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#6F7487] mb-2">
              {t.conceptExplorer.summaryLabel}
            </p>
            <p className="text-sm sm:text-base text-[#171A2F] leading-relaxed">
              {displaySummary}
            </p>
          </div>
        </div>

        {analysis.imagePreviewUrl && (
          <div className="lg:col-span-4 clay-card p-4">
            <div className="rounded-xl overflow-hidden bg-[#FFF9F4] border border-[#EFE7DF]">
              <img
                src={analysis.imagePreviewUrl}
                alt="Analyzed textbook page"
                className="w-full max-h-64 object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Intelligent Simulation Match OR Dynamic Experiment Generation Panel */}
      {analysis.is_physics_content && effectiveMatch && (
        <section
          data-testid="experiment-match-card"
          className="clay-card p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                {effectiveMatch.matchType === 'exact_existing' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF3E3] text-[#C96D12] border border-[#EFE7DF]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.dynamicLab.registryExactMatchLabel}</span>
                  </span>
                ) : effectiveMatch.matchType === 'saved_dynamic' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF3E3] text-[#C96D12] border border-[#EFE7DF]">
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>{t.dynamicLab.reopenSavedLabBtn}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF3E3] text-[#C96D12] border border-[#EFE7DF]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.dynamicLab.registryDynamicLabel}</span>
                  </span>
                )}
                {analysis.detected_experiment?.preferred_dimension && (
                  <span className="px-2 py-1 rounded-md bg-[#FFF9F4] border border-[#EFE7DF] text-[#6F7487] font-mono-tabular uppercase">
                    {analysis.detected_experiment.preferred_dimension}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[#171A2F]">
                {analysis.detected_experiment?.experiment_name ||
                  effectiveMatch.matchedExperimentTitle ||
                  displayTopic}
              </h2>
              <p className="text-xs sm:text-sm text-[#6F7487] leading-relaxed">
                {effectiveMatch.reason}
              </p>

              {analysis.detected_experiment?.components_apparatus &&
                analysis.detected_experiment.components_apparatus.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-[#171A2F]">
                      {t.dynamicLab.detectedApparatusLabel}:
                    </span>
                    {analysis.detected_experiment.components_apparatus.map((item, i) => (
                      <span
                        key={`${item}-${i}`}
                        className="px-2 py-0.5 rounded bg-[#FFF9F4] border border-[#EFE7DF] text-[#171A2F]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {effectiveMatch.matchType === 'exact_existing' && (
                <button
                  type="button"
                  data-testid="open-matched-existing-btn"
                  onClick={() =>
                    onLaunchSimulation(
                      effectiveMatch.matchedSimulationEngineId || selectedConcept?.simulation_id,
                      effectiveMatch.matchedExperimentId
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px]"
                >
                  <Compass className="w-4 h-4" />
                  <span>{t.dynamicLab.openExistingLabBtn}</span>
                </button>
              )}

              {effectiveMatch.matchType === 'saved_dynamic' &&
                matchedSavedExperiment &&
                onLaunchDynamicExperiment && (
                  <button
                    type="button"
                    data-testid="reopen-saved-dynamic-btn"
                    onClick={() => onLaunchDynamicExperiment(matchedSavedExperiment)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px]"
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>{t.dynamicLab.reopenSavedLabBtn}</span>
                  </button>
                )}

              {onGenerateDynamicExperiment &&
                (effectiveMatch.matchType === 'generate_new' ||
                  effectiveMatch.matchType === 'saved_dynamic') && (
                  <button
                    type="button"
                    data-testid="generate-dynamic-experiment-btn"
                    disabled={isGeneratingDynamic}
                    onClick={() => onGenerateDynamicExperiment(selectedConcept)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed ${
                      effectiveMatch.matchType === 'saved_dynamic'
                        ? 'bg-[#FFF3E3] text-[#171A2F] hover:bg-[#FFE6C7]'
                        : 'bg-[#F49A3C] text-white hover:bg-[#E5882A]'
                    }`}
                  >
                    {isGeneratingDynamic ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>
                      {isGeneratingDynamic
                        ? t.dynamicLab.generatingHeading
                        : t.dynamicLab.generateExperimentBtn}
                    </span>
                  </button>
                )}
            </div>
          </div>

          {isGeneratingDynamic && generationStageText && (
            <div
              role="status"
              data-testid="dynamic-generation-progress"
              className="rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] p-4 flex items-center gap-3"
            >
              <Loader2 className="w-5 h-5 text-[#C96D12] animate-spin shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-semibold text-[#171A2F]">
                  {generationStageText}
                </p>
                <p className="text-[11px] text-[#6F7487]">
                  Validating physical laws, equations, SI bounds, and 2D/3D apparatus components before launch...
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Interactive Concept Cards & Controlled Simulation Routing */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[#171A2F]">
            {t.conceptExplorer.conceptsLabel}
          </h2>
          <p className="text-xs sm:text-sm text-[#6F7487]">
            {t.conceptExplorer.selectConceptPrompt}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localizedConcepts.map((concept) => {
            const isInteractive = Boolean(
              concept.simulation_supported &&
                concept.simulation_id !== 'none' &&
                SIMULATION_REGISTRY[concept.simulation_id]?.implemented
            );
            const savedForConcept = findSavedDynamicForConcept(concept);
            const isSelected = selectedConcept?.id === concept.id;

            return (
              <article
                key={concept.id}
                onClick={() => setSelectedConceptId(concept.id)}
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#F49A3C] ring-1 ring-[#F49A3C]'
                    : 'border-[#EFE7DF] hover:border-[#F49A3C]/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-[#171A2F]">
                      {concept.name}
                    </h3>
                  </div>

                  <p className="text-xs font-medium text-[#C96D12] mb-3">
                    {isInteractive
                      ? t.conceptExplorer.simulationAvailableLabel
                      : savedForConcept
                        ? t.dynamicLab.reopenSavedLabBtn
                        : analysis.is_physics_content
                          ? t.dynamicLab.registryDynamicLabel
                          : t.conceptExplorer.confidenceLevels[concept.confidence]}
                  </p>

                  <p className="text-sm text-[#6F7487] leading-relaxed mb-4">
                    {concept.description}
                  </p>

                  {concept.equations.length > 0 && (
                    <div className="px-3.5 py-2.5 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] font-mono-tabular text-sm text-[#171A2F] mb-4">
                      {concept.equations[0].formula}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#EFE7DF]">
                  {isInteractive ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchSimulation(concept.simulation_id, concept.matched_experiment_id);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px]"
                    >
                      <Compass className="w-4 h-4" />
                      <span>{t.conceptExplorer.exploreSimulationBtn}</span>
                    </button>
                  ) : savedForConcept && onLaunchDynamicExperiment ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchDynamicExperiment(savedForConcept);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px]"
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>{t.dynamicLab.reopenSavedLabBtn}</span>
                    </button>
                  ) : analysis.is_physics_content && onGenerateDynamicExperiment ? (
                    <button
                      type="button"
                      disabled={isGeneratingDynamic}
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateDynamicExperiment(concept);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-sm font-semibold hover:bg-[#FFE6C7] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-[#C96D12]" />
                      <span>{t.dynamicLab.generateExperimentBtn}</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-lg bg-[#FFF3E3]/45 text-xs text-[#171A2F] leading-relaxed flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#C96D12] shrink-0 mt-0.5" />
                      <span>
                        {concept.simulation_reason || t.conceptExplorer.explanationOnlyLabel}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Selected Concept Deep-Dive Inspector (Variables, Units, Relationships, Equations) */}
      {selectedConcept && (
        <section className="clay-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EFE7DF] pb-5">
            <div className="space-y-1 max-w-3xl">
              <p className="text-xs font-medium text-[#C96D12]">
                {t.conceptExplorer.confidenceLabel}:{' '}
                {t.conceptExplorer.confidenceLevels[selectedConcept.confidence]}
                {registeredSimLabel ? ` · ${registeredSimLabel}` : ''}
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#171A2F]">
                {selectedConcept.name}
              </h2>
              <p className="text-sm text-[#6F7487] leading-relaxed pt-1">
                {selectedConcept.description}
              </p>
            </div>

            {isSelectedInteractive ? (
              <button
                type="button"
                onClick={() =>
                  onLaunchSimulation(
                    selectedConcept.simulation_id,
                    selectedConcept.matched_experiment_id
                  )
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px] shrink-0"
              >
                <Compass className="w-4 h-4" />
                <span>{t.conceptExplorer.exploreSimulationBtn}</span>
              </button>
            ) : analysis.is_physics_content && onGenerateDynamicExperiment ? (
              <button
                type="button"
                disabled={isGeneratingDynamic}
                onClick={() => onGenerateDynamicExperiment(selectedConcept)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] disabled:opacity-60 transition-colors cursor-pointer min-h-[44px] shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.dynamicLab.generateExperimentBtn}</span>
              </button>
            ) : (
              <p className="text-xs font-medium text-[#6F7487] max-w-xs">
                {selectedConcept.simulation_reason || t.conceptExplorer.explanationOnlyLabel}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Variables & Units Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#171A2F]">
                {t.conceptExplorer.variablesLabel}
              </h3>
              {selectedConcept.variables.length === 0 ? (
                <p className="text-sm text-[#6F7487]">—</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#EFE7DF]">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FFF9F4] border-b border-[#EFE7DF] text-xs font-medium text-[#6F7487]">
                      <tr>
                        <th className="py-2.5 px-3.5">{t.conceptExplorer.symbolLabel}</th>
                        <th className="py-2.5 px-3.5">{t.conceptExplorer.meaningLabel}</th>
                        <th className="py-2.5 px-3.5">{t.conceptExplorer.unitsLabel}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE7DF]">
                      {selectedConcept.variables.map((v, i) => (
                        <tr key={`${v.symbol}-${i}`}>
                          <td className="py-2.5 px-3.5 font-mono-tabular font-semibold text-[#C96D12]">
                            {v.symbol}
                          </td>
                          <td className="py-2.5 px-3.5 text-[#171A2F]">{v.meaning}</td>
                          <td className="py-2.5 px-3.5 font-mono-tabular text-xs text-[#6F7487]">
                            {v.unit || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Relationships & Concept-Specific Equations */}
            <div className="space-y-4">
              {selectedConcept.relationships && (
                <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5">
                  <h3 className="text-sm font-semibold text-[#171A2F]">
                    {t.conceptExplorer.relationshipsLabel}
                  </h3>
                  <p className="text-sm text-[#6F7487] leading-relaxed">
                    {selectedConcept.relationships}
                  </p>
                </div>
              )}

              {selectedConcept.equations.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-sm font-semibold text-[#171A2F]">
                    {t.conceptExplorer.equationsLabel}
                  </h3>
                  {selectedConcept.equations.map((eq, idx) => (
                    <div
                      key={`${eq.formula}-${idx}`}
                      className="p-3.5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1"
                    >
                      <p className="text-xs font-medium text-[#6F7487]">{eq.name}</p>
                      <p className="font-mono-tabular text-base font-semibold text-[#171A2F]">
                        {eq.formula}
                      </p>
                      <p className="text-xs text-[#6F7487]">
                        {eq.variables}
                        {eq.units ? ` · ${eq.units}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Equations & Scientific Terminology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equations */}
        <section className="clay-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-[#171A2F]">
            <Sigma className="w-5 h-5 text-[#C96D12]" />
            <h2 className="text-lg font-semibold">{t.conceptExplorer.equationsLabel}</h2>
          </div>

          {analysis.equations.length === 0 ? (
            <p className="text-sm text-[#6F7487]">—</p>
          ) : (
            <div className="divide-y divide-[#EFE7DF]">
              {analysis.equations.map((eq, idx) => (
                <div key={`${eq.name}-${idx}`} className="py-4 first:pt-1 last:pb-1 space-y-1.5">
                  <p className="text-xs font-medium text-[#6F7487]">{eq.name}</p>
                  <p className="font-mono-tabular text-base font-medium text-[#171A2F]">
                    {eq.formula}
                  </p>
                  <p className="text-xs text-[#6F7487] leading-relaxed">
                    {eq.variables}
                    {eq.units ? ` · ${eq.units}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Terminology */}
        <section className="clay-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-[#171A2F]">
            <BookOpen className="w-5 h-5 text-[#C96D12]" />
            <h2 className="text-lg font-semibold">{t.conceptExplorer.terminologyLabel}</h2>
          </div>

          {displayTerminology.length === 0 ? (
            <p className="text-sm text-[#6F7487]">—</p>
          ) : (
            <dl className="divide-y divide-[#EFE7DF]">
              {displayTerminology.map((item, idx) => (
                <div key={`${item.term}-${idx}`} className="py-3.5 first:pt-1 last:pb-1">
                  <dt className="text-sm font-semibold text-[#171A2F] mb-1">{item.term}</dt>
                  <dd className="text-sm text-[#6F7487] leading-relaxed">{item.definition}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      {/* Detected Diagrams */}
      {displayDiagrams.length > 0 && (
        <section className="clay-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-[#171A2F]">
            <Shapes className="w-5 h-5 text-[#C96D12]" />
            <h2 className="text-lg font-semibold">{t.conceptExplorer.diagramsLabel}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayDiagrams.map((diag, idx) => (
              <div
                key={`${diag.title}-${idx}`}
                className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-2"
              >
                <h3 className="text-sm font-semibold text-[#171A2F]">{diag.title}</h3>
                <p className="text-sm text-[#6F7487] leading-relaxed">{diag.description}</p>
                {diag.components && diag.components.length > 0 && (
                  <p className="text-xs font-medium text-[#C96D12] pt-1">
                    {t.conceptExplorer.diagramComponentsLabel}: {diag.components.join(' · ')}
                  </p>
                )}
                {!diag.interpretable && (
                  <p className="text-xs text-[#7A271A] pt-1">
                    {t.conceptExplorer.diagramUnclearNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Optional Extracted Page Text Accordion */}
      {analysis.extracted_text && analysis.extracted_text.trim().length > 0 && (
        <section className="clay-card p-5 sm:p-6">
          <button
            type="button"
            onClick={() => setShowExtractedText((prev) => !prev)}
            className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-[#171A2F]">
              <FileText className="w-4 h-4 text-[#C96D12]" />
              <span className="text-sm font-semibold">
                {showExtractedText
                  ? t.conceptExplorer.hideExtractedText
                  : t.conceptExplorer.showExtractedText}
              </span>
            </div>
            {showExtractedText ? (
              <ChevronUp className="w-4 h-4 text-[#6F7487]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6F7487]" />
            )}
          </button>

          {showExtractedText && (
            <div className="mt-4 pt-4 border-t border-[#EFE7DF]">
              <p className="text-xs font-medium text-[#6F7487] mb-2">
                {t.conceptExplorer.extractedTextLabel}
              </p>
              <pre className="whitespace-pre-wrap text-xs sm:text-sm text-[#171A2F] font-sans leading-relaxed bg-[#FFF9F4] p-4 rounded-xl border border-[#EFE7DF]">
                {analysis.extracted_text}
              </pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
