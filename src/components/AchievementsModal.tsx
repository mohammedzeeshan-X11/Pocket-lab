import React, { useEffect } from 'react';
import { Award, CheckCircle2, Flame, Lock, Sparkles, Trophy, X } from 'lucide-react';
import type { LanguageCode } from '../types/physics';
import type { RewardProgressState } from '../types/companion';
import { BADGE_CATALOG, getRankForXp } from '../services/rewardsEngine';
import { PhysixCompanionAvatar } from './PhysixCompanionAvatar';

interface AchievementsModalProps {
  isOpen: boolean;
  language: LanguageCode;
  rewardState: RewardProgressState;
  reducedMotion?: boolean;
  onClose: () => void;
}

const MODAL_COPY: Record<
  LanguageCode,
  {
    title: string;
    subtitle: string;
    xpLabel: string;
    streakLabel: string;
    unlockedCount: string;
    unlockedBadge: string;
    lockedBadge: string;
    nextRankPrefix: string;
    maxRankNote: string;
  }
> = {
  en: {
    title: 'Achievements & Science Rank',
    subtitle: 'Earn XP and unlock badges by running experiments, recording observations, and completing quizzes.',
    xpLabel: 'Total XP',
    streakLabel: 'Active Streak',
    unlockedCount: 'Unlocked Badges',
    unlockedBadge: 'Unlocked',
    lockedBadge: 'Locked',
    nextRankPrefix: 'Next rank:',
    maxRankNote: 'Highest Pocket Lab science rank achieved!',
  },
  kn: {
    title: 'ಸಾಧನೆಗಳು ಮತ್ತು ವಿಜ್ಞಾನ ಶ್ರೇಣಿ',
    subtitle: 'ಪ್ರಯೋಗಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ, ವೀಕ್ಷಣೆಗಳನ್ನು ದಾಖಲಿಸಿ ಮತ್ತು ಕ್ವಿಜ್ ಮೂಲಕ XP ಹಾಗೂ ಬ್ಯಾಡ್ಜ್‌ಗಳನ್ನು ಪಡೆಯಿರಿ.',
    xpLabel: 'ಒಟ್ಟು XP',
    streakLabel: 'ಸತತ ದಿನಗಳು',
    unlockedCount: 'ಅನ್‌ಲಾಕ್ ಬ್ಯಾಡ್ಜ್‌ಗಳು',
    unlockedBadge: 'ಅನ್‌ಲಾಕ್',
    lockedBadge: 'ಬಾಕಿ',
    nextRankPrefix: 'ಮುಂದಿನ ಶ್ರೇಣಿ:',
    maxRankNote: 'ಅತ್ಯುನ್ನತ ವಿಜ್ಞಾನ ಶ್ರೇಣಿ ತಲುಪಿದ್ದೀರಿ!',
  },
  hi: {
    title: 'उपलब्धियाँ और विज्ञान रैंक',
    subtitle: 'प्रयोग पूरा करके, अवलोकन दर्ज करके और क्विज़ हल करके XP व बैज अर्जित करें।',
    xpLabel: 'कुल XP',
    streakLabel: 'सक्रिय स्ट्रीक',
    unlockedCount: 'अनलॉक बैज',
    unlockedBadge: 'अनलॉक',
    lockedBadge: 'लॉक',
    nextRankPrefix: 'अगला रैंक:',
    maxRankNote: 'सर्वोच्च Pocket Lab विज्ञान रैंक प्राप्त!',
  },
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  language,
  rewardState,
  reducedMotion = false,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copy = MODAL_COPY[language];
  const { currentRank, nextRank, progressPercent } = getRankForXp(rewardState.xp);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#171A2F]/40 backdrop-blur-[3px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
      onClick={onClose}
    >
      <div
        className="clay-card max-w-3xl w-full max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#EFE7DF] px-6 py-4 flex items-start justify-between gap-4 rounded-t-[26px]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl clay-icon-orange flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="achievements-modal-title"
                className="text-lg sm:text-xl font-bold text-[#171A2F]"
              >
                {copy.title}
              </h2>
              <p className="text-xs text-[#6F7487]">{copy.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close achievements"
            className="p-2 rounded-2xl clay-btn-soft text-[#171A2F] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Companion Rank Summary Card */}
          <div className="clay-inset rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <PhysixCompanionAvatar
                emotion="celebrating"
                size={68}
                reducedMotion={reducedMotion}
              />
            </div>

            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#F49A3C]">
                    Level {currentRank.level} · {currentRank.title[language]}
                  </p>
                  <p className="text-xl font-bold text-[#171A2F] font-mono-tabular">
                    {rewardState.xp} XP
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#6F7487] font-mono-tabular">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#171A2F]">
                    <Flame className="w-4 h-4 text-[#F49A3C]" />
                    {rewardState.streakDays}d
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#49AD8B]">
                    <Award className="w-4 h-4" />
                    {rewardState.unlockedBadgeIds.length}/{BADGE_CATALOG.length}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-[#EFE5DA] shadow-inner overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FFAC54] to-[#F49A3C] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-[#6F7487]">
                  {nextRank
                    ? `${copy.nextRankPrefix} ${nextRank.title[language]} (${nextRank.minXp} XP)`
                    : copy.maxRankNote}
                </p>
              </div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BADGE_CATALOG.map((badge) => {
              const isUnlocked = rewardState.unlockedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl p-4 flex items-start gap-3.5 transition-all ${
                    isUnlocked
                      ? 'clay-card'
                      : 'clay-inset opacity-85'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'clay-btn-teal text-white'
                        : 'bg-[#EDE6DF] text-[#6F7487]'
                    }`}
                  >
                    {isUnlocked ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#171A2F] truncate">
                        {badge.title[language]}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold shrink-0 ${
                          isUnlocked ? 'text-[#49AD8B]' : 'text-[#6F7487]'
                        }`}
                      >
                        {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{isUnlocked ? copy.unlockedBadge : copy.lockedBadge}</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#6F7487] leading-relaxed">
                      {badge.description[language]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
