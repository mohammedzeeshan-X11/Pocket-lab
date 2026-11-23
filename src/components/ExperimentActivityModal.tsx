import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardList, X } from 'lucide-react';
import type {
  ExperimentCatalogItem,
  StudentExperimentCompletion,
} from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import { ExperimentAssessment } from './ExperimentAssessment';

interface ExperimentActivityModalProps {
  experiment: ExperimentCatalogItem;
  completion?: StudentExperimentCompletion;
  t: TranslationBundle;
  onClose: () => void;
  onSaveProgress: (
    experimentId: string,
    patch: {
      quizScore?: number;
      quizTotal?: number;
      observation?: string;
      markCompleted?: boolean;
    }
  ) => void;
}

export const ExperimentActivityModal: React.FC<ExperimentActivityModalProps> = ({
  experiment,
  completion,
  t,
  onClose,
  onSaveProgress,
}) => {
  const [noteInput, setNoteInput] = useState('');

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = noteInput.trim();
    if (!cleaned) return;
    onSaveProgress(experiment.id, { observation: cleaned });
    setNoteInput('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-modal-title"
      className="fixed inset-0 z-50 bg-[#171A2F]/50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="bg-[#FFF9F4] border border-[#EFE7DF] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#EFE7DF] px-6 py-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#C96D12]">
              {t.classLibrary.classPrefix} {experiment.classLevel} · Ch. {experiment.chapterNumber}: {experiment.chapterTitle}
            </p>
            <h2 id="activity-modal-title" className="text-lg sm:text-xl font-bold text-[#171A2F]">
              {experiment.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.componentOverlay.closeBtn}
            className="p-2 rounded-lg border border-[#EFE7DF] bg-white text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Transparency Note */}
          <div className="p-4 rounded-xl bg-[#FFF3E3]/55 border border-[#EFE7DF] text-xs sm:text-sm text-[#171A2F] space-y-1">
            <p className="font-semibold text-[#C96D12]">
              {experiment.availabilityStatus === 'coming_soon'
                ? t.classLibrary.statusComingSoon
                : t.classLibrary.statusExplanationOnly}
            </p>
            <p>{experiment.gradeAdaptedNote}</p>
            {experiment.verificationNote && (
              <p className="text-xs text-[#6F7487] pt-1">{experiment.verificationNote}</p>
            )}
          </div>

          {/* A. Structured Overview */}
          <div className="clay-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#171A2F]">
              <BookOpen className="w-5 h-5 text-[#C96D12]" />
              <h3 className="text-base font-semibold">{t.experimentLab.tabIntroduction}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1">
                <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.objectiveLabel}</p>
                <p className="text-[#171A2F] leading-relaxed">{experiment.learningObjective}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1">
                <p className="text-xs font-semibold text-[#C96D12]">{t.experimentLab.realWorldLabel}</p>
                <p className="text-[#171A2F] leading-relaxed">{experiment.realWorldApplication}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#171A2F]">{t.experimentLab.apparatusLabel}</p>
                <ul className="list-disc pl-5 text-[#6F7487] space-y-1">
                  {experiment.apparatus.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#171A2F]">{t.experimentLab.procedureLabel}</p>
                <ol className="list-decimal pl-5 text-[#6F7487] space-y-1">
                  {experiment.procedure.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5 text-sm">
              <p className="text-xs font-semibold text-[#C96D12]">
                {t.experimentLab.scientificExplanationLabel}
              </p>
              <p className="text-[#171A2F] leading-relaxed">{experiment.scientificExplanation}</p>
            </div>
          </div>

          {/* D. Observation Logbook & Conclusion */}
          <div className="clay-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#171A2F]">
                <ClipboardList className="w-5 h-5 text-[#C96D12]" />
                <h3 className="text-base font-semibold">{t.experimentLab.tabObservations}</h3>
              </div>

              <button
                type="button"
                onClick={() => onSaveProgress(experiment.id, { markCompleted: true })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completion
                    ? t.experimentLab.completedBadge
                    : t.experimentLab.markCompletedBtn}
                </span>
              </button>
            </div>

            <ul className="list-disc pl-5 text-xs sm:text-sm text-[#6F7487] space-y-1">
              {experiment.observationsGuide.map((obs, idx) => (
                <li key={idx}>{obs}</li>
              ))}
            </ul>

            <form onSubmit={handleAddObservation} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={t.experimentLab.observationPlaceholder}
                className="flex-1 px-3.5 py-2 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg border border-[#F49A3C] bg-white text-[#C96D12] text-xs sm:text-sm font-semibold hover:bg-[#FFF3E3]/40 cursor-pointer whitespace-nowrap"
              >
                {t.experimentLab.saveObservationBtn}
              </button>
            </form>

            {completion?.recordedObservations && completion.recordedObservations.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {completion.recordedObservations.map((entry, idx) => (
                  <li
                    key={idx}
                    className="px-3 py-2 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] text-xs text-[#171A2F]"
                  >
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* E. Interactive Assessment */}
          <ExperimentAssessment
            experimentId={experiment.id}
            questions={experiment.assessmentQuestions}
            t={t}
            savedScore={completion?.quizScore}
            savedTotal={completion?.quizTotal}
            onSaveScore={(score, total, markCompleted) =>
              onSaveProgress(experiment.id, {
                quizScore: score,
                quizTotal: total,
                markCompleted,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
