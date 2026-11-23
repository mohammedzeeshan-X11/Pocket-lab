import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, FlaskConical } from 'lucide-react';
import type {
  ExperimentCatalogItem,
  GradeClassLevel,
  NcertChapterMeta,
  SimulationMode,
  StudentProgressMap,
} from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import {
  CLASS_LEVELS,
  EXPERIMENT_CATALOGUE,
  NCERT_CLASS_CURRICULA,
} from '../data/ncertCurriculum';
import { isExperimentLaunchable } from '../data/simulationRegistry';

interface ClassroomSelectorProps {
  selectedClass: GradeClassLevel;
  lockedClass?: GradeClassLevel;
  studentProgress: StudentProgressMap;
  t: TranslationBundle;
  onSelectClass: (classLevel: GradeClassLevel) => void;
  onChapterAction?: (
    classLevel: GradeClassLevel,
    chapter: NcertChapterMeta,
    experiments: ExperimentCatalogItem[]
  ) => void;
  onLaunchExperiment?: (experiment: ExperimentCatalogItem, mode?: SimulationMode) => void;
  compact?: boolean;
}

export const ClassroomSelector: React.FC<ClassroomSelectorProps> = ({
  selectedClass,
  lockedClass,
  studentProgress,
  t,
  onSelectClass,
  onChapterAction,
}) => {
  const effectiveClasses: readonly GradeClassLevel[] = lockedClass ? [lockedClass] : CLASS_LEVELS;
  const [viewingClass, setViewingClass] = useState<GradeClassLevel>(lockedClass ?? selectedClass);

  useEffect(() => {
    setViewingClass(lockedClass ?? selectedClass);
  }, [lockedClass, selectedClass]);

  const curriculum = NCERT_CLASS_CURRICULA[viewingClass];
  const classExps = EXPERIMENT_CATALOGUE.filter((e) => e.classLevel === viewingClass);

  return (
    <section aria-labelledby="choose-classroom-heading" className="space-y-6">
      {/* Header + Clean Horizontal Grade Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 id="choose-classroom-heading" className="text-2xl font-bold text-[#171A2F]">
            NCERT <span className="text-[#F49A3C]">Curriculum</span>
          </h2>
          <p className="text-sm text-[#6F7487]">
            {curriculum.textbookSeries} · {curriculum.chapters.length} chapters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label="Select NCERT Class"
            className="inline-flex items-center gap-1 p-1.5 rounded-full clay-inset"
          >
            {effectiveClasses.map((cls) => {
              const active = viewingClass === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`dashboard-class-card-${cls}`}
                  onClick={() => setViewingClass(cls)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                    active
                      ? 'clay-btn-orange text-white'
                      : 'text-[#6F7487] hover:text-[#171A2F]'
                  }`}
                >
                  {t.classLibrary.classPrefix} {cls}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onSelectClass(viewingClass)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#49AD8B] hover:text-[#217A5C] cursor-pointer whitespace-nowrap min-h-[38px]"
          >
            <span>All Class {viewingClass} Labs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clean 3-Column Chapter Cards for the Active Grade Only */}
      <div
        data-testid={`classroom-card-${viewingClass}`}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {curriculum.chapters.map((ch) => {
          const chExps = classExps.filter((e) => e.chapterId === ch.id);
          const hasInteractive = chExps.some((e) => isExperimentLaunchable(e));
          const chDone = chExps.filter((e) => Boolean(studentProgress[e.id])).length;

          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                if (onChapterAction) {
                  onChapterAction(viewingClass, ch, chExps);
                } else {
                  onSelectClass(viewingClass);
                }
              }}
              className="group text-left clay-card clay-card-interactive p-5 cursor-pointer flex flex-col justify-between gap-4 min-h-[132px]"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono-tabular font-bold text-[#F49A3C]">
                    Chapter {ch.chapterNumber}
                  </span>
                  <span className="font-mono-tabular text-[#6F7487]">
                    {chDone}/{chExps.length} done
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#171A2F] leading-snug">
                  {ch.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-[#49AD8B]">
                <span className="inline-flex items-center gap-1.5">
                  {hasInteractive ? (
                    <FlaskConical className="w-3.5 h-3.5" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {chExps.length > 1
                      ? `${chExps.length} Modules`
                      : hasInteractive
                        ? 'Interactive Lab'
                        : 'Activity Guide'}
                  </span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
