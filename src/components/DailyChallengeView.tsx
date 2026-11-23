import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  FlaskConical,
  HelpCircle,
  RefreshCw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { ExperimentCatalogItem, GradeClassLevel, LanguageCode, SimulationMode } from '../types/physics';
import type { RewardProgressState } from '../types/companion';
import { getDailyChallengeForClass, getTodayIsoLocal } from '../data/dailyChallenges';
import { getExperimentById } from '../data/ncertCurriculum';

interface DailyChallengeViewProps {
  language: LanguageCode;
  selectedClass: GradeClassLevel;
  rewardState: RewardProgressState;
  reducedMotion?: boolean;
  onSolveDailyChallenge: (dateIso: string) => void;
  onLaunchExperiment: (experiment: ExperimentCatalogItem, mode?: SimulationMode) => void;
  onBackHome: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  language,
  selectedClass,
  rewardState,
  reducedMotion = false,
  onSolveDailyChallenge,
  onLaunchExperiment,
  onBackHome,
}) => {
  const todayIso = getTodayIsoLocal();
  const [practiceOffset, setPracticeOffset] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const { challenge: activeChallenge } = getDailyChallengeForClass(selectedClass, practiceOffset);
  const solvedToday = Boolean(rewardState.dailyChallengeDates?.includes(todayIso));

  useEffect(() => {
    setSelectedOption(null);
  }, [selectedClass, practiceOffset]);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === activeChallenge.correctIndex && practiceOffset === 0) {
      onSolveDailyChallenge(todayIso);
    }
  };

  const handleTryInLab = () => {
    const exp = getExperimentById(activeChallenge.experimentId);
    if (exp) {
      onLaunchExperiment(exp, '2d');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Focused Page Header */}
      <header className="space-y-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#C96D12]">
              Class {selectedClass} · Daily Practice
            </p>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-[#171A2F] tracking-tight">
              Daily Physics Challenge
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-[#171A2F] font-mono-tabular">
            <span className="inline-flex items-center gap-1.5 text-[#D97706]">
              <Flame className="w-4 h-4" />
              <span>{rewardState.streakDays}d streak</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#49AD8B]">
              <Trophy className="w-4 h-4" />
              <span>{rewardState.xp} XP</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Challenge Card */}
      <section
        data-testid="daily-physics-challenge"
        className="clay-card p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="inline-flex items-center gap-2 font-semibold text-[#C96D12]">
            <HelpCircle className="w-4 h-4 text-[#6E85E8]" />
            <span>{activeChallenge.topicLabel[language]}</span>
          </div>
          <span className="font-semibold text-[#49AD8B] font-mono-tabular">
            {solvedToday && practiceOffset === 0 ? 'Solved Today ✓' : '+25 XP'}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[#171A2F] leading-snug">
          {activeChallenge.question[language]}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {activeChallenge.options[language].map((opt, idx) => {
            const answered = selectedOption !== null;
            const isChosen = selectedOption === idx;
            const isRight = idx === activeChallenge.correctIndex;

            let btnStyle = 'clay-btn-soft text-[#171A2F]';
            if (answered && isRight) {
              btnStyle = 'bg-[#E7F8F1] border-2 border-[#49AD8B] text-[#171A2F] font-semibold';
            } else if (answered && isChosen && !isRight) {
              btnStyle = 'bg-[#FFF1EE] border-2 border-[#E36B5B] text-[#8E2B1E]';
            }

            return (
              <button
                key={`${activeChallenge.id}_${idx}`}
                type="button"
                data-testid={`daily-challenge-option-${idx}`}
                onClick={() => handleSelectOption(idx)}
                className={`text-left px-4 py-3.5 rounded-2xl text-sm transition-all duration-150 cursor-pointer flex items-start gap-3 min-h-[52px] ${btnStyle}`}
              >
                <span className="font-mono-tabular font-bold text-[#C96D12] shrink-0">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            data-testid="daily-challenge-feedback"
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              selectedOption === activeChallenge.correctIndex
                ? 'bg-[#ECFAF4] border-[#B6E6D3] text-[#171A2F]'
                : 'bg-[#FFF1EE] border-[#F4C2BA] text-[#171A2F]'
            }`}
          >
            <div className="flex items-start gap-2.5 text-sm">
              {selectedOption === activeChallenge.correctIndex ? (
                <CheckCircle2 className="w-5 h-5 text-[#49AD8B] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-[#D94E3E] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {selectedOption === activeChallenge.correctIndex
                    ? 'Spot on! Great physics intuition.'
                    : 'Not quite — check the physics principle below.'}
                </p>
                <p className="text-xs sm:text-sm text-[#171A2F]/85 leading-relaxed">
                  {activeChallenge.explanation[language]}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="daily-challenge-lab-btn"
                onClick={handleTryInLab}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full clay-btn-orange text-xs font-semibold cursor-pointer min-h-[40px] whitespace-nowrap"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Try in Lab</span>
              </button>
              <button
                type="button"
                onClick={() => setPracticeOffset((n) => n + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full clay-btn-soft text-xs font-semibold cursor-pointer min-h-[40px] whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#49AD8B]" />
                <span>Next Question</span>
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
};
