import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  FlaskConical,
  Lock,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  EntryCategory,
  ExperimentCatalogItem,
  GradeClassLevel,
  SimulationAvailabilityStatus,
  SimulationMode,
  StudentProgressMap,
} from '../types/physics';
import type { DynamicExperimentSpec } from '../types/dynamicExperiment';
import type { TranslationBundle } from '../i18n/translations';
import {
  CLASS_LEVELS,
  EXPERIMENT_CATALOGUE,
  NCERT_CLASS_CURRICULA,
} from '../data/ncertCurriculum';
import { isExperimentLaunchable } from '../data/simulationRegistry';
import { CurriculumCoveragePanel } from './CurriculumCoveragePanel';
import { ExperimentActivityModal } from './ExperimentActivityModal';

interface ClassLibraryViewProps {
  selectedClass: GradeClassLevel;
  lockedClass?: GradeClassLevel;
  onSelectClass: (classLevel: GradeClassLevel) => void;
  studentProgress: StudentProgressMap;
  t: TranslationBundle;
  onLaunchExperiment: (experiment: ExperimentCatalogItem, mode?: SimulationMode) => void;
  onSaveProgress: (
    experimentId: string,
    patch: {
      quizScore?: number;
      quizTotal?: number;
      observation?: string;
      markCompleted?: boolean;
    }
  ) => void;
  savedDynamicExperiments?: DynamicExperimentSpec[];
  onLaunchDynamicExperiment?: (spec: DynamicExperimentSpec) => void;
  onDeleteDynamicExperiment?: (id: string) => void;
}

export const ClassLibraryView: React.FC<ClassLibraryViewProps> = ({
  selectedClass,
  lockedClass,
  onSelectClass,
  studentProgress,
  t,
  onLaunchExperiment,
  onSaveProgress,
  savedDynamicExperiments = [],
  onLaunchDynamicExperiment,
  onDeleteDynamicExperiment,
}) => {
  const effectiveClass: GradeClassLevel = lockedClass ?? selectedClass;

  const [viewTab, setViewTab] = useState<'chapters' | 'saved' | 'coverage'>('chapters');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalExperiment, setModalExperiment] = useState<ExperimentCatalogItem | null>(null);

  const curriculum = NCERT_CLASS_CURRICULA[effectiveClass];

  const classExperiments = useMemo(
    () => EXPERIMENT_CATALOGUE.filter((item) => item.classLevel === effectiveClass),
    [effectiveClass]
  );

  const completedInClass = useMemo(
    () => classExperiments.filter((exp) => Boolean(studentProgress[exp.id])).length,
    [classExperiments, studentProgress]
  );

  const progressPct =
    classExperiments.length > 0
      ? Math.round((completedInClass / classExperiments.length) * 100)
      : 0;

  const activeChapter = useMemo(
    () => curriculum.chapters.find((ch) => ch.id === activeChapterId) ?? null,
    [curriculum.chapters, activeChapterId]
  );

  const activeChapterIndex = useMemo(
    () => curriculum.chapters.findIndex((ch) => ch.id === activeChapterId),
    [curriculum.chapters, activeChapterId]
  );

  const activeChapterExperiments = useMemo(
    () =>
      activeChapter
        ? classExperiments.filter((exp) => exp.chapterId === activeChapter.id)
        : [],
    [activeChapter, classExperiments]
  );

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return classExperiments.filter((exp) => {
      const haystack =
        `${exp.title} ${exp.chapterTitle} ${exp.relevantConcept} ${exp.description}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [classExperiments, searchQuery]);

  const handleClassSwitch = (nextClass: GradeClassLevel) => {
    if (lockedClass && nextClass !== lockedClass) return;
    onSelectClass(nextClass);
    setActiveChapterId(null);
    setSearchQuery('');
    setViewTab('chapters');
  };

  const openChapterPage = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availabilityShortLabel = (status: SimulationAvailabilityStatus) => {
    switch (status) {
      case 'interactive_2d_3d':
        return 'Interactive 2D & 3D';
      case 'interactive_2d':
        return 'Interactive 2D';
      case 'interactive_3d':
        return 'Interactive 3D';
      case 'explanation_only':
        return 'Activity Guide';
      default:
        return 'Coming Soon';
    }
  };

  const categoryLabel = (cat: EntryCategory) => {
    switch (cat) {
      case 'ncert_practical':
        return t.classLibrary.catPractical;
      case 'ncert_activity':
        return t.classLibrary.catActivity;
      case 'ncert_concept':
        return t.classLibrary.catConcept;
      default:
        return t.classLibrary.catSupplementary;
    }
  };

  const renderExperimentCard = (exp: ExperimentCatalogItem, showChapterPrefix = false) => {
    const completion = studentProgress[exp.id];
    const isInteractive = isExperimentLaunchable(exp);

    return (
      <article
        key={exp.id}
        data-testid={`experiment-card-${exp.id}`}
        className="clay-card p-5 sm:p-6 flex flex-col justify-between gap-4 min-w-0"
      >
        <div className="space-y-2.5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#C96D12]">
              {showChapterPrefix ? `Ch. ${exp.chapterNumber} · ` : ''}
              {categoryLabel(exp.entryCategory)}
            </span>
            <span className="text-[#6F7487] font-medium">
              {availabilityShortLabel(exp.availabilityStatus)}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#171A2F] leading-snug">
            {exp.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#6F7487] leading-relaxed line-clamp-2">
            {exp.description}
          </p>
        </div>

        <div className="pt-3.5 border-t border-[#EFE7DF] space-y-3">
          {completion && (
            <div className="flex items-center justify-between text-xs font-semibold text-[#49AD8B]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.experimentLab.completedBadge}</span>
              </span>
              {typeof completion.quizScore === 'number' &&
                typeof completion.quizTotal === 'number' && (
                  <span className="font-mono-tabular">
                    {completion.quizScore}/{completion.quizTotal}
                  </span>
                )}
            </div>
          )}

          {isInteractive ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onLaunchExperiment(exp, '2d')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full clay-btn-orange text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px] whitespace-nowrap"
              >
                <FlaskConical className="w-4 h-4 shrink-0" />
                <span>{t.classLibrary.launchLabBtn}</span>
              </button>

              {exp.availabilityStatus === 'interactive_2d_3d' && (
                <button
                  type="button"
                  onClick={() => onLaunchExperiment(exp, '3d')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full clay-btn-soft text-xs sm:text-sm font-semibold text-[#171A2F] cursor-pointer min-h-[44px] whitespace-nowrap shrink-0"
                >
                  <Compass className="w-4 h-4 text-[#49AD8B]" />
                  <span>3D</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setModalExperiment(exp)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full clay-btn-soft text-xs sm:text-sm font-semibold text-[#171A2F] cursor-pointer min-h-[44px] whitespace-nowrap"
            >
              {exp.availabilityStatus === 'coming_soon' ? (
                <Sparkles className="w-4 h-4 text-[#C96D12] shrink-0" />
              ) : (
                <BookOpen className="w-4 h-4 text-[#49AD8B] shrink-0" />
              )}
              <span>{t.classLibrary.openActivityGuideBtn}</span>
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Slim Top Navigation Bar: Class Tabs + View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!lockedClass ? (
          <div
            role="tablist"
            aria-label="Select NCERT Class"
            className="inline-flex items-center gap-1 p-1 rounded-full clay-inset overflow-x-auto max-w-full"
          >
            {CLASS_LEVELS.map((cls) => {
              const active = cls === effectiveClass && viewTab !== 'coverage';
              return (
                <button
                  key={cls}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleClassSwitch(cls)}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                    active
                      ? 'clay-btn-orange'
                      : 'text-[#6F7487] hover:text-[#171A2F]'
                  }`}
                >
                  {t.classLibrary.classPrefix} {cls}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96D12]">
            <Lock className="w-3.5 h-3.5" />
            <span>Registered Class {lockedClass}</span>
          </span>
        )}

        <div className="inline-flex items-center gap-1 p-1 rounded-full clay-inset shrink-0">
          <button
            type="button"
            onClick={() => {
              setViewTab('chapters');
              setActiveChapterId(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
              viewTab === 'chapters'
                ? 'bg-[#171A2F] text-white'
                : 'text-[#6F7487] hover:text-[#171A2F]'
            }`}
          >
            Chapters
          </button>

          {savedDynamicExperiments.length > 0 && onLaunchDynamicExperiment && (
            <button
              type="button"
              onClick={() => {
                setViewTab('saved');
                setActiveChapterId(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                viewTab === 'saved'
                  ? 'bg-[#171A2F] text-white'
                  : 'text-[#6F7487] hover:text-[#171A2F]'
              }`}
            >
              Saved ({savedDynamicExperiments.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setViewTab('coverage');
              setActiveChapterId(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
              viewTab === 'coverage'
                ? 'bg-[#171A2F] text-white'
                : 'text-[#6F7487] hover:text-[#171A2F]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Coverage</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Curriculum Coverage Panel (Dedicated View) */}
      {viewTab === 'coverage' && (
        <CurriculumCoveragePanel
          t={t}
          lockedClass={lockedClass}
          onSelectClass={(cls) => handleClassSwitch(cls)}
        />
      )}

      {/* VIEW 2: Saved Generated Labs (Dedicated View) */}
      {viewTab === 'saved' && onLaunchDynamicExperiment && (
        <section className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#171A2F]">
              {t.dynamicLab.savedGeneratedSectionTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#6F7487]">
              {savedDynamicExperiments.length} saved textbook simulations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedDynamicExperiments.map((spec) => {
              const completion = studentProgress[spec.id];
              return (
                <article
                  key={spec.id}
                  className="clay-card p-5 sm:p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#C96D12]">
                        Class {spec.studentClass} · {t.dynamicLab.generatedBadge}
                      </span>
                      <span className="font-mono-tabular text-[#6F7487]">
                        {spec.supports3d ? '2D & 3D' : '2D'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#171A2F] leading-snug">
                      {spec.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6F7487] leading-relaxed line-clamp-2">
                      {spec.educationalObjective || spec.conceptExplanation}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-[#EFE7DF] space-y-2.5">
                    {completion && (
                      <div className="flex items-center justify-between text-xs font-semibold text-[#49AD8B]">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t.experimentLab.completedBadge}</span>
                        </span>
                        {typeof completion.quizScore === 'number' &&
                          typeof completion.quizTotal === 'number' && (
                            <span className="font-mono-tabular">
                              {completion.quizScore}/{completion.quizTotal}
                            </span>
                          )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onLaunchDynamicExperiment(spec)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full clay-btn-orange text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
                      >
                        <FlaskConical className="w-4 h-4" />
                        <span>{t.classLibrary.launchLabBtn}</span>
                      </button>
                      {onDeleteDynamicExperiment && (
                        <button
                          type="button"
                          onClick={() => onDeleteDynamicExperiment(spec.id)}
                          aria-label={t.dynamicLab.deleteSavedLab}
                          className="px-3.5 py-2.5 rounded-full clay-btn-soft text-xs font-semibold text-[#6F7487] hover:text-[#171A2F] cursor-pointer min-h-[44px]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* VIEW 3A: Dedicated Single-Chapter Experiments Page (Step 2) */}
      {viewTab === 'chapters' && activeChapter && (
        <section className="space-y-6">
          {/* Clean Back Navigation & Chapter Heading */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setActiveChapterId(null)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C96D12] hover:text-[#171A2F] transition-colors cursor-pointer min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                Back to {t.classLibrary.classPrefix} {effectiveClass} Chapters
              </span>
            </button>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <p className="font-mono-tabular text-xs font-bold text-[#F49A3C]">
                  {t.classLibrary.classPrefix} {effectiveClass} · Chapter {activeChapter.chapterNumber}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-[#171A2F] leading-snug">
                  {activeChapter.title}
                </h1>
              </div>

              <p className="text-xs font-mono-tabular text-[#6F7487]">
                {activeChapterExperiments.length}{' '}
                {activeChapterExperiments.length === 1 ? 'experiment' : 'experiments'}
              </p>
            </div>
          </div>

          {/* ONLY This Chapter's Experiments */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeChapterExperiments.map((exp) => renderExperimentCard(exp, false))}
          </div>

          {/* Clean Previous / Next Chapter Stepper */}
          <div className="pt-4 border-t border-[#EFE7DF] flex items-center justify-between gap-4">
            {activeChapterIndex > 0 ? (
              <button
                type="button"
                onClick={() => openChapterPage(curriculum.chapters[activeChapterIndex - 1].id)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6F7487] hover:text-[#171A2F] cursor-pointer min-h-[40px]"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-xs">
                  Ch. {curriculum.chapters[activeChapterIndex - 1].chapterNumber}:{' '}
                  {curriculum.chapters[activeChapterIndex - 1].title}
                </span>
              </button>
            ) : (
              <span />
            )}

            {activeChapterIndex >= 0 && activeChapterIndex < curriculum.chapters.length - 1 ? (
              <button
                type="button"
                onClick={() => openChapterPage(curriculum.chapters[activeChapterIndex + 1].id)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C96D12] hover:text-[#171A2F] cursor-pointer min-h-[40px] ml-auto"
              >
                <span className="truncate max-w-[160px] sm:max-w-xs">
                  Ch. {curriculum.chapters[activeChapterIndex + 1].chapterNumber}:{' '}
                  {curriculum.chapters[activeChapterIndex + 1].title}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <span />
            )}
          </div>
        </section>
      )}

      {/* VIEW 3B: Chapters Overview Page (Step 1 — ONLY Chapters, Nothing Dumped Below) */}
      {viewTab === 'chapters' && !activeChapter && (
        <section className="space-y-5">
          {/* Calm Header + Single Clean Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#171A2F]">
                {t.classLibrary.classPrefix} {effectiveClass} · Physics Chapters
              </h1>
              <p className="text-xs sm:text-sm text-[#6F7487] font-mono-tabular">
                {curriculum.chapters.length} chapters · {classExperiments.length} experiments ·{' '}
                {progressPct}% completed
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#6F7487] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search Class ${effectiveClass} experiments...`}
                aria-label={`Search Class ${effectiveClass} experiments`}
                className="w-full pl-10 pr-9 py-2.5 rounded-full clay-inset text-xs sm:text-sm text-[#171A2F] placeholder:text-[#8E93A6] focus:outline-none focus:ring-2 focus:ring-[#F49A3C]/40 min-h-[42px]"
              />
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6F7487] hover:text-[#171A2F] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Either Search Results OR Clean Chapters Grid (Never Both Stacked Together) */}
          {searchQuery.trim().length > 0 ? (
            searchMatches.length === 0 ? (
              <div className="clay-card p-10 text-center space-y-2">
                <p className="text-sm sm:text-base font-bold text-[#171A2F]">
                  {t.classLibrary.noResultsTitle}
                </p>
                <p className="text-xs sm:text-sm text-[#6F7487]">
                  Try another keyword or clear search to browse by chapter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-mono-tabular text-[#6F7487]">
                  {searchMatches.length} matching{' '}
                  {searchMatches.length === 1 ? 'experiment' : 'experiments'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchMatches.map((exp) => renderExperimentCard(exp, true))}
                </div>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {curriculum.chapters.map((ch) => {
                const chExps = classExperiments.filter((e) => e.chapterId === ch.id);
                const chDone = chExps.filter((e) => Boolean(studentProgress[e.id])).length;
                const interactiveChCount = chExps.filter((e) => isExperimentLaunchable(e)).length;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    data-testid={`concept-card-${ch.id}`}
                    onClick={() => openChapterPage(ch.id)}
                    className="group text-left clay-card clay-card-interactive p-5 sm:p-6 flex flex-col justify-between gap-4 cursor-pointer min-h-[156px]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono-tabular font-bold text-[#F49A3C]">
                          Chapter {ch.chapterNumber}
                        </span>
                        <span className="font-mono-tabular text-[#6F7487]">
                          {chDone}/{chExps.length} done
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-[#171A2F] leading-snug">
                        {ch.title}
                      </h2>

                      <p className="text-xs text-[#6F7487] line-clamp-2 leading-relaxed">
                        {ch.physicsTopics.slice(0, 2).join(' · ')}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#49AD8B]">
                      <span className="inline-flex items-center gap-1.5">
                        {interactiveChCount > 0 ? (
                          <FlaskConical className="w-3.5 h-3.5" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {chExps.length}{' '}
                          {chExps.length === 1 ? 'Experiment' : 'Experiments'}
                        </span>
                      </span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {modalExperiment && (
        <ExperimentActivityModal
          experiment={modalExperiment}
          completion={studentProgress[modalExperiment.id]}
          t={t}
          onClose={() => setModalExperiment(null)}
          onSaveProgress={onSaveProgress}
        />
      )}
    </div>
  );
};
