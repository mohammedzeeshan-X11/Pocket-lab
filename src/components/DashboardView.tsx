import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Box,
  Camera,
  CheckCircle2,
  Compass,
  Flame,
  FlaskConical,
  Glasses,
  GraduationCap,
  HelpCircle,
  Layers,
  Play,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import type {
  ExperimentCatalogItem,
  GradeClassLevel,
  LanguageCode,
  SimulationMode,
  StudentProgressMap,
  UserProfile,
} from '../types/physics';
import type { BadgeDefinition, RewardProgressState } from '../types/companion';
import type { TranslationBundle } from '../i18n/translations';
import { EXPERIMENT_CATALOGUE, NCERT_CLASS_CURRICULA } from '../data/ncertCurriculum';
import { isExperimentLaunchable } from '../data/simulationRegistry';
import { getTodayIsoLocal } from '../data/dailyChallenges';
import { BADGE_CATALOG, getRankForXp } from '../services/rewardsEngine';
import { getExperimentRealWorldVisual } from '../data/componentImages';
import { PhysixCompanionAvatar } from './PhysixCompanionAvatar';
import { ExperimentActivityModal } from './ExperimentActivityModal';
import { PocketLabSwitch } from './PocketLabSwitch';

export interface LastAccessedExperimentInfo {
  experimentId: string;
  accessedAt: string;
  mode: SimulationMode;
}

interface DashboardViewProps {
  language: LanguageCode;
  t: TranslationBundle;
  selectedClass: GradeClassLevel;
  studentProgress: StudentProgressMap;
  userProfile: UserProfile;
  rewardState: RewardProgressState;
  latestBadgeToast?: BadgeDefinition | null;
  reducedMotion?: boolean;
  lastAccessedExperiment?: LastAccessedExperimentInfo | null;
  onDismissBadgeToast?: () => void;
  onOpenPocketLab: () => void;
  onOpenChaptersLibrary: () => void;
  onOpenScanner: () => void;
  onOpenDailyChallenge: () => void;
  onOpenConcepts: () => void;
  onOpenAiTutor: () => void;
  onOpenActivePortal: () => void;
  onOpenAchievements: () => void;
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
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  t,
  selectedClass,
  studentProgress,
  userProfile,
  rewardState,
  latestBadgeToast,
  reducedMotion = false,
  lastAccessedExperiment,
  onDismissBadgeToast,
  onOpenPocketLab,
  onOpenChaptersLibrary,
  onOpenScanner,
  onOpenDailyChallenge,
  onOpenConcepts,
  onOpenAiTutor,
  onOpenActivePortal,
  onOpenAchievements,
  onLaunchExperiment,
  onSaveProgress,
}) => {
  const [modalExperiment, setModalExperiment] = useState<ExperimentCatalogItem | null>(null);
  const [thumbError, setThumbError] = useState(false);

  const curriculum = NCERT_CLASS_CURRICULA[selectedClass];
  const classExperiments = useMemo(
    () => EXPERIMENT_CATALOGUE.filter((e) => e.classLevel === selectedClass),
    [selectedClass]
  );

  const completedInClass = useMemo(
    () => classExperiments.filter((e) => Boolean(studentProgress[e.id])).length,
    [classExperiments, studentProgress]
  );

  const interactiveCount = useMemo(
    () => classExperiments.filter((e) => isExperimentLaunchable(e)).length,
    [classExperiments]
  );

  const { currentRank } = useMemo(() => getRankForXp(rewardState.xp), [rewardState.xp]);
  const todayIso = getTodayIsoLocal();
  const dailySolvedToday = Boolean(rewardState.dailyChallengeDates?.includes(todayIso));

  const continueExperiment = useMemo(() => {
    if (lastAccessedExperiment) {
      const match = EXPERIMENT_CATALOGUE.find((e) => e.id === lastAccessedExperiment.experimentId);
      if (match && match.classLevel === selectedClass) return match;
    }
    const nextUnfinished = classExperiments.find(
      (e) => isExperimentLaunchable(e) && !studentProgress[e.id]
    );
    return nextUnfinished || classExperiments.find((e) => isExperimentLaunchable(e)) || null;
  }, [lastAccessedExperiment, classExperiments, selectedClass, studentProgress]);

  const continueCompletion = continueExperiment
    ? studentProgress[continueExperiment.id]
    : undefined;

  const continueThumbnailUrl = continueExperiment
    ? getExperimentRealWorldVisual(
        continueExperiment.simulationEngineId,
        continueExperiment.simulationPreset
      ).src
    : '';

  const firstName = userProfile.name.trim().split(/\s+/)[0] || userProfile.name;

  const featureDestinations = [
    {
      id: 'chapters',
      title: 'Chapters & Labs',
      description: `Browse Class ${selectedClass} chapters (1–${curriculum.chapters.length}) and launch interactive 2D/3D simulations.`,
      meta: `${curriculum.chapters.length} chapters · ${interactiveCount} interactive`,
      icon: FlaskConical,
      iconBg: 'clay-icon-orange',
      onClick: onOpenChaptersLibrary,
      testId: 'workspace-tile-chapters',
    },
    {
      id: 'scanner',
      title: 'Textbook Scanner',
      description:
        'Upload a photo of any NCERT Physics page to extract concepts, formulas, and matching virtual labs.',
      meta: 'AI page analysis',
      icon: Camera,
      iconBg: 'clay-icon-periwinkle',
      onClick: onOpenScanner,
      testId: 'workspace-tile-scanner',
    },
    {
      id: 'challenge',
      title: 'Daily Physics Challenge',
      description:
        'Test your physics intuition with a quick Class-aligned conceptual question every day.',
      meta: dailySolvedToday ? 'Solved today ✓' : '+25 XP available',
      icon: HelpCircle,
      iconBg: 'clay-icon-teal',
      onClick: onOpenDailyChallenge,
      testId: 'workspace-tile-challenge',
    },
    {
      id: 'concepts',
      title: 'Concepts Explorer',
      description:
        'Inspect equations, physical variables, and visual breakdowns for each topic in your syllabus.',
      meta: 'Formulas & guides',
      icon: Layers,
      iconBg: 'clay-icon-blush',
      onClick: onOpenConcepts,
      testId: 'workspace-tile-concepts',
    },
    {
      id: 'tutor',
      title: 'AI Physics Companion',
      description:
        'Ask Nova questions inside the live lab with voice explanations in English, Kannada, or Hindi.',
      meta: 'Interactive tutor',
      icon: Sparkles,
      iconBg: 'clay-icon-orange',
      onClick: onOpenAiTutor,
      testId: 'workspace-tile-tutor',
    },
    {
      id: 'portal',
      title: userProfile.role === 'teacher' ? 'Teacher Portal' : 'Student Portal',
      description:
        userProfile.role === 'teacher'
          ? 'Manage classrooms, assign guided activities, and review student assessment scores.'
          : 'View joined classrooms, teacher assignments, completed experiments, and quiz history.',
      meta: `${completedInClass}/${classExperiments.length} completed`,
      icon: userProfile.role === 'teacher' ? Users : GraduationCap,
      iconBg: 'clay-icon-teal',
      onClick: onOpenActivePortal,
      testId: 'workspace-tile-portal',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Optional Newly Unlocked Badge Notice */}
      {latestBadgeToast && (
        <div className="clay-card px-5 py-3.5 flex items-center justify-between gap-4 border border-[#F3D7B8]">
          <div className="flex items-center gap-3 text-xs sm:text-sm min-w-0">
            <Award className="w-5 h-5 text-[#F49A3C] shrink-0" />
            <p className="truncate text-[#171A2F]">
              <span className="font-bold">Unlocked: {latestBadgeToast.title[language]}</span>
              <span className="text-[#6F7487]"> — {latestBadgeToast.description[language]}</span>
            </p>
          </div>
          {onDismissBadgeToast && (
            <button
              type="button"
              onClick={onDismissBadgeToast}
              className="text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* 1. Clean Personal Welcome Header */}
      <section className="clay-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#F4F6FD] border border-white flex items-center justify-center shadow-sm">
            <PhysixCompanionAvatar
              emotion="idle"
              size={66}
              reducedMotion={reducedMotion}
            />
          </div>

          <div className="min-w-0 space-y-1">
            <p className="text-xs font-semibold text-[#C96D12]">
              {userProfile.role === 'teacher' ? 'Teacher Workspace' : `Class ${selectedClass} Workspace`}
              <span aria-hidden="true"> · </span>
              <span>Level {currentRank.level}</span>
            </p>
            <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-[#171A2F] tracking-tight truncate">
              Welcome back, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6F7487]">
              Pick a dedicated workspace below to explore chapters, scan textbook pages, or
              practice.
            </p>
          </div>
        </div>

        {/* Compact Unboxed Metrics */}
        <div className="flex flex-wrap items-center gap-5 sm:gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#EFE7DF]">
          <div>
            <p className="text-[11px] font-medium text-[#6F7487]">XP Earned</p>
            <p className="text-lg font-bold text-[#171A2F] font-mono-tabular inline-flex items-center gap-1">
              <Trophy className="w-4 h-4 text-[#F49A3C]" />
              <span>{rewardState.xp}</span>
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#6F7487]">Streak</p>
            <p className="text-lg font-bold text-[#171A2F] font-mono-tabular inline-flex items-center gap-1">
              <Flame className="w-4 h-4 text-[#D97706]" />
              <span>{rewardState.streakDays}d</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAchievements}
            className="text-left cursor-pointer group"
          >
            <p className="text-[11px] font-medium text-[#6F7487] group-hover:text-[#171A2F]">
              Badges
            </p>
            <p className="text-lg font-bold text-[#49AD8B] font-mono-tabular inline-flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>
                {rewardState.unlockedBadgeIds.length}/{BADGE_CATALOG.length}
              </span>
            </p>
          </button>
        </div>
      </section>

      {/* 2. Flagship Main Feature: Pocket Lab Switch & Spotlight */}
      <section
        aria-label="Pocket Lab 3D, AR and VR Main Feature"
        data-testid="pocket-lab-spotlight"
        className="clay-hero p-6 sm:p-8 lg:p-10 relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-wide text-[#C9511F]">
                Main Feature · Walkable 3D, AR &amp; VR Science Workspace
              </p>
              <h2
                className="font-['Outfit'] text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-[#171A2F] tracking-tight leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Switch Instantly Into{' '}
                <span className="text-[#D95B26]">3D · AR · VR Lab</span>
              </h2>
              <p className="text-sm sm:text-base text-[#555B6E] leading-relaxed max-w-xl">
                Flip the switch to step inside 24 walkable 3D Physics, Chemistry, and Biology lab
                benches with Stereo WebXR VR, Camera Tabletop AR, and an on-demand AI 3D NCERT
                concept simulator.
              </p>
            </div>

            {/* Tactile Mode Switch + Primary Launch CTA */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3.5 pt-1">
              <PocketLabSwitch
                isPocketLab={false}
                onToggle={(next) => {
                  if (next) onOpenPocketLab();
                }}
                size="hero"
              />

              <button
                type="button"
                data-testid="pocket-lab-spotlight-launch-btn"
                onClick={onOpenPocketLab}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl clay-btn-orange text-sm font-bold cursor-pointer min-h-[48px] whitespace-nowrap"
              >
                <Box className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Enter 3D · AR · VR Lab</span>
                <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right: Structured Pocket Lab Capabilities Overview */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-[#1E2233] text-white p-5 sm:p-6 shadow-[0_18px_36px_-18px_rgba(23,26,47,0.45)] space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                <span className="font-['Outfit'] text-base font-bold text-white">
                  Pocket Lab 3D Highlights
                </span>
                <span className="text-xs font-mono-tabular text-[#F49A3C] font-semibold">
                  3D · AR · VR
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-4 h-4 text-[#F49A3C]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">24 Live 3D Lab Benches</p>
                    <p className="text-xs text-white/70">
                      Physics, Chemistry &amp; Biology walkable rooms
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Glasses className="w-4 h-4 text-[#54BC98]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">WebXR Stereo VR &amp; Camera AR</p>
                    <p className="text-xs text-white/70">
                      3rd-person, 1st-person, Orbit, VR headset &amp; tabletop AR
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#8DA2FB]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">AI NCERT 3D Simulator</p>
                    <p className="text-xs text-white/70">
                      Generate live 3D models &amp; explanations in EN, ಕನ್ನಡ &amp; हिन्दी
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Separated Feature Workspaces (Each opens its own dedicated page) */}
      <section aria-label="Workspaces" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[#171A2F]">Your Workspaces</h2>
          <span className="text-xs text-[#6F7487]">Each tool opens in its own view</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featureDestinations.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={item.testId}
                onClick={item.onClick}
                className="group text-left clay-card clay-card-interactive p-5 sm:p-6 flex flex-col justify-between gap-4 cursor-pointer min-h-[168px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-[#6F7487] font-mono-tabular">
                      {item.meta}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#171A2F]">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-[#6F7487] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96D12]">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Single Focused Continue Learning Strip */}
      {continueExperiment && (
        <section aria-label="Continue learning" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#171A2F]">Pick Up Where You Left Off</h2>
            <button
              type="button"
              onClick={onOpenChaptersLibrary}
              className="text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer"
            >
              All Class {selectedClass} Chapters &rarr;
            </button>
          </div>

          <div
            data-testid="continue-learning-card"
            className="clay-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-5"
          >
            <div className="sm:w-36 h-28 rounded-2xl bg-[#F9F2EA] overflow-hidden shrink-0">
              {!thumbError && continueThumbnailUrl ? (
                <img
                  src={continueThumbnailUrl}
                  alt={continueExperiment.title}
                  referrerPolicy="no-referrer"
                  onError={() => setThumbError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FFF7EE]">
                  <FlaskConical className="w-7 h-7 text-[#F49A3C]" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#6F7487]">
                <span className="font-semibold text-[#C96D12]">
                  Class {continueExperiment.classLevel} · Chapter {continueExperiment.chapterNumber}
                </span>
                {continueCompletion && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#49AD8B] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#171A2F] leading-snug">
                {continueExperiment.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6F7487] line-clamp-2">
                {continueExperiment.learningObjective}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                data-testid="continue-learning-btn"
                onClick={() =>
                  isExperimentLaunchable(continueExperiment)
                    ? onLaunchExperiment(continueExperiment, lastAccessedExperiment?.mode ?? '2d')
                    : setModalExperiment(continueExperiment)
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full clay-btn-orange text-xs sm:text-sm font-semibold cursor-pointer min-h-[42px] whitespace-nowrap"
              >
                {isExperimentLaunchable(continueExperiment) ? (
                  <Play className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}
                <span>{continueCompletion ? 'Revisit Lab' : 'Launch Lab'}</span>
              </button>

              {continueExperiment.availabilityStatus === 'interactive_2d_3d' && (
                <button
                  type="button"
                  onClick={() => onLaunchExperiment(continueExperiment, '3d')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full clay-btn-soft text-xs font-semibold cursor-pointer min-h-[42px] whitespace-nowrap"
                >
                  <Compass className="w-3.5 h-3.5 text-[#49AD8B]" />
                  <span>3D</span>
                </button>
              )}
            </div>
          </div>
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
