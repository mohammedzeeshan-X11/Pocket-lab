import React from 'react';
import { BookOpen, CheckCircle2, Compass, FlaskConical, X } from 'lucide-react';
import type {
  ExperimentCatalogItem,
  NcertChapterMeta,
  SimulationMode,
  StudentProgressMap,
} from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import { isExperimentLaunchable } from '../data/simulationRegistry';

interface ConceptExperimentChooserModalProps {
  chapter: NcertChapterMeta;
  experiments: ExperimentCatalogItem[];
  studentProgress: StudentProgressMap;
  t: TranslationBundle;
  onLaunchExperiment: (experiment: ExperimentCatalogItem, mode?: SimulationMode) => void;
  onOpenActivityGuide: (experiment: ExperimentCatalogItem) => void;
  onClose: () => void;
}

export const ConceptExperimentChooserModal: React.FC<ConceptExperimentChooserModalProps> = ({
  chapter,
  experiments,
  studentProgress,
  t,
  onLaunchExperiment,
  onOpenActivityGuide,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="concept-chooser-title"
    >
      <div className="clay-card max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-lg p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFE7DF] pb-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#C96D12]">
              {t.classLibrary.classPrefix} {chapter.classLevel} · Ch. {chapter.chapterNumber}
            </p>
            <h2 id="concept-chooser-title" className="text-xl font-bold text-[#171A2F]">
              {chapter.title}
            </h2>
            <p className="text-xs text-[#6F7487]">
              This chapter includes {experiments.length} physics modules. Choose one to open
              directly:
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg border border-[#EFE7DF] text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {experiments.map((exp) => {
            const done = Boolean(studentProgress[exp.id]);
            const isInteractive = isExperimentLaunchable(exp);

            return (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#C96D12]">
                    <span>{exp.relevantConcept}</span>
                    {done && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#C96D12] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.experimentLab.completedBadge}</span>
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#171A2F]">{exp.title}</h3>
                  <p className="text-xs text-[#6F7487]">{exp.learningObjective}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isInteractive ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onLaunchExperiment(exp, '2d');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer whitespace-nowrap min-h-[40px]"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>Open Interactive Lab</span>
                      </button>
                      {exp.availabilityStatus === 'interactive_2d_3d' && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onLaunchExperiment(exp, '3d');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-xs font-semibold hover:bg-[#FFE6C7] cursor-pointer whitespace-nowrap min-h-[40px]"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#C96D12]" />
                          <span>3D</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenActivityGuide(exp);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-xs font-semibold hover:bg-[#FFE6C7] cursor-pointer whitespace-nowrap min-h-[40px]"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#C96D12]" />
                      <span>{t.classLibrary.openActivityGuideBtn}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
