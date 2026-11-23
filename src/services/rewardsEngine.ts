import type { LanguageCode, SimulationEngineId } from '../types/physics';
import type {
  BadgeDefinition,
  BadgeId,
  RewardActionResult,
  RewardProgressState,
  RewardRank,
} from '../types/companion';

const STORAGE_PREFIX = 'physix_rewards_v1_';

export const REWARD_RANKS: RewardRank[] = [
  {
    level: 1,
    minXp: 0,
    title: {
      en: 'Curiosity Spark',
      kn: 'ಕುತೂಹಲದ ಕಿಡಿ',
      hi: 'जिज्ञासा की चिंगारी',
    },
  },
  {
    level: 2,
    minXp: 100,
    title: {
      en: 'Lab Explorer',
      kn: 'ಪ್ರಯೋಗಶಾಲೆ ಅನ್ವೇಷಕ',
      hi: 'प्रयोगशाला अन्वेषक',
    },
  },
  {
    level: 3,
    minXp: 250,
    title: {
      en: 'Force Finder',
      kn: 'ಬಲ ಶೋಧಕ',
      hi: 'बल खोजकर्ता',
    },
  },
  {
    level: 4,
    minXp: 450,
    title: {
      en: 'Field Theorist',
      kn: 'ಕ್ಷೇತ್ರ ಸಿದ್ಧಾಂತಿ',
      hi: 'क्षेत्र सिद्धांतकार',
    },
  },
  {
    level: 5,
    minXp: 750,
    title: {
      en: 'Physics Laureate',
      kn: 'ಭೌತಶಾಸ್ತ್ರ ಪುರಸ್ಕೃತ',
      hi: 'भौतिकी विद्वान',
    },
  },
];

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'first_spark',
    iconKey: 'spark',
    title: {
      en: 'First Spark',
      kn: 'ಮೊದಲ ಕಿಡಿ',
      hi: 'पहली चिंगारी',
    },
    description: {
      en: 'Complete your first NCERT physics experiment.',
      kn: 'ನಿಮ್ಮ ಮೊದಲ NCERT ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
      hi: 'अपना पहला NCERT भौतिकी प्रयोग पूरा करें।',
    },
  },
  {
    id: 'magnet_master',
    iconKey: 'magnet',
    title: {
      en: 'Magnet Master',
      kn: 'ಅಯಸ್ಕಾಂತ ಮಾಸ್ಟರ್',
      hi: 'चुंबक विशेषज्ञ',
    },
    description: {
      en: 'Complete a Magnetism simulation experiment.',
      kn: 'ಕಾಂತೀಯತೆ ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಯೋಗವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
      hi: 'चुंबकत्व सिमुलेशन प्रयोग पूरा करें।',
    },
  },
  {
    id: 'ray_tracer',
    iconKey: 'optics',
    title: {
      en: 'Ray Tracer',
      kn: 'ಕಿರಣ ಪಥಗಾರ',
      hi: 'किरण पथदर्शक',
    },
    description: {
      en: 'Complete a Light & Optics ray simulation.',
      kn: 'ಬೆಳಕು ಮತ್ತು ದೃಗ್ವಿಜ್ಞಾನ ಕಿರಣ ಪ್ರಯೋಗವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
      hi: 'प्रकाश एवं प्रकाशिकी किरण प्रयोग पूरा करें।',
    },
  },
  {
    id: 'circuit_architect',
    iconKey: 'circuit',
    title: {
      en: 'Circuit Architect',
      kn: 'ಸರ್ಕ್ಯೂಟ್ ಶಿಲ್ಪಿ',
      hi: 'परिपथ निर्माता',
    },
    description: {
      en: 'Complete an Electricity or Electromagnet lab.',
      kn: 'ವಿದ್ಯುತ್ ಅಥವಾ ವಿದ್ಯುತ್ಕಾಂತ ಪ್ರಯೋಗವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
      hi: 'विद्युत या विद्युत-चुंबक प्रयोग पूरा करें।',
    },
  },
  {
    id: 'mechanics_pioneer',
    iconKey: 'mechanics',
    title: {
      en: 'Mechanics Pioneer',
      kn: 'ಯಂತ್ರಶಾಸ್ತ್ರ ಪ್ರವರ್ತಕ',
      hi: 'यांत्रिकी अग्रदूत',
    },
    description: {
      en: 'Complete a Motion, Force, Energy, Heat, or Sound lab.',
      kn: 'ಚಲನೆ, ಬಲ, ಶಕ್ತಿ, ಶಾಖ ಅಥವಾ ಧ್ವನಿ ಪ್ರಯೋಗವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.',
      hi: 'गति, बल, ऊर्जा, ऊष्मा या ध्वनि प्रयोग पूरा करें।',
    },
  },
  {
    id: 'curious_observer',
    iconKey: 'observer',
    title: {
      en: 'Curious Observer',
      kn: 'ಸೂಕ್ಷ್ಮ ವೀಕ್ಷಕ',
      hi: 'जिज्ञासु प्रेक्षक',
    },
    description: {
      en: 'Inspect 5 unique real-world apparatus parts in the viewport.',
      kn: 'ವ್ಯೂಪೋರ್ಟ್‌ನಲ್ಲಿ 5 ವಿಭಿನ್ನ ಉಪಕರಣ ಭಾಗಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.',
      hi: 'व्यूपोर्ट में 5 अलग-अलग उपकरण भागों का निरीक्षण करें।',
    },
  },
  {
    id: 'quiz_champion',
    iconKey: 'quiz',
    title: {
      en: 'Quiz Champion',
      kn: 'ಕ್ವಿಜ್ ಚಾಂಪಿಯನ್',
      hi: 'क्विज़ चैंपियन',
    },
    description: {
      en: 'Score 100% on an experiment concept check quiz.',
      kn: 'ಪ್ರಯೋಗ ಪರಿಕಲ್ಪನೆ ಪರೀಕ್ಷೆಯಲ್ಲಿ 100% ಅಂಕ ಗಳಿಸಿ.',
      hi: 'प्रयोग अवधारणा क्विज़ में 100% अंक प्राप्त करें।',
    },
  },
  {
    id: 'multilingual_explorer',
    iconKey: 'language',
    title: {
      en: 'Multilingual Explorer',
      kn: 'ಬಹುಭಾಷಾ ಅನ್ವೇಷಕ',
      hi: 'बहुभाषी अन्वेषक',
    },
    description: {
      en: 'Explore physics in more than one language (EN / ಕ / हि).',
      kn: 'ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಭಾಷೆಯಲ್ಲಿ ಭೌತಶಾಸ್ತ್ರವನ್ನು ಅನ್ವೇಷಿಸಿ.',
      hi: 'एक से अधिक भाषा में भौतिकी का अन्वेषण करें।',
    },
  },
];

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isYesterdayIso(prevDate: string | null, todayDate: string): boolean {
  if (!prevDate) return false;
  const prevMs = Date.parse(`${prevDate}T00:00:00Z`);
  const todayMs = Date.parse(`${todayDate}T00:00:00Z`);
  if (!Number.isFinite(prevMs) || !Number.isFinite(todayMs)) return false;
  const diffDays = Math.round((todayMs - prevMs) / 86400000);
  return diffDays === 1;
}

function createEmptyState(accountId: string): RewardProgressState {
  return {
    accountId,
    xp: 0,
    streakDays: 0,
    lastActiveDate: null,
    unlockedBadgeIds: [],
    completedExperimentIds: [],
    exploredComponentKeys: [],
    recordedObservationExpIds: [],
    perfectQuizExpIds: [],
    attemptedQuizExpIds: [],
    guidedActivityIds: [],
    languagesUsed: ['en'],
    dailyChallengeDates: [],
  };
}

function storageKey(accountId?: string | null): string {
  return `${STORAGE_PREFIX}${accountId && accountId.trim() ? accountId.trim() : 'guest'}`;
}

export function loadRewardState(accountId?: string | null): RewardProgressState {
  const key = accountId && accountId.trim() ? accountId.trim() : 'guest';
  const fallback = createEmptyState(key);
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<RewardProgressState>;
    return {
      accountId: key,
      xp: typeof parsed.xp === 'number' && parsed.xp >= 0 ? parsed.xp : 0,
      streakDays: typeof parsed.streakDays === 'number' && parsed.streakDays >= 0 ? parsed.streakDays : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : null,
      unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds) ? (parsed.unlockedBadgeIds as BadgeId[]) : [],
      completedExperimentIds: Array.isArray(parsed.completedExperimentIds) ? parsed.completedExperimentIds : [],
      exploredComponentKeys: Array.isArray(parsed.exploredComponentKeys) ? parsed.exploredComponentKeys : [],
      recordedObservationExpIds: Array.isArray(parsed.recordedObservationExpIds) ? parsed.recordedObservationExpIds : [],
      perfectQuizExpIds: Array.isArray(parsed.perfectQuizExpIds) ? parsed.perfectQuizExpIds : [],
      attemptedQuizExpIds: Array.isArray(parsed.attemptedQuizExpIds) ? parsed.attemptedQuizExpIds : [],
      guidedActivityIds: Array.isArray(parsed.guidedActivityIds) ? parsed.guidedActivityIds : [],
      languagesUsed:
        Array.isArray(parsed.languagesUsed) && parsed.languagesUsed.length > 0
          ? (parsed.languagesUsed as LanguageCode[])
          : ['en'],
      dailyChallengeDates: Array.isArray(parsed.dailyChallengeDates)
        ? parsed.dailyChallengeDates
        : [],
    };
  } catch {
    return fallback;
  }
}

function saveRewardState(state: RewardProgressState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(storageKey(state.accountId), JSON.stringify(state));
  } catch {
    // Ignore storage quota issues
  }
}

export function getRankForXp(xp: number): {
  currentRank: RewardRank;
  nextRank: RewardRank | null;
  progressPercent: number;
} {
  let currentRank = REWARD_RANKS[0];
  let nextRank: RewardRank | null = REWARD_RANKS[1] ?? null;
  for (let i = 0; i < REWARD_RANKS.length; i++) {
    if (xp >= REWARD_RANKS[i].minXp) {
      currentRank = REWARD_RANKS[i];
      nextRank = REWARD_RANKS[i + 1] ?? null;
    }
  }
  if (!nextRank) {
    return { currentRank, nextRank: null, progressPercent: 100 };
  }
  const span = Math.max(1, nextRank.minXp - currentRank.minXp);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((xp - currentRank.minXp) / span) * 100))
  );
  return { currentRank, nextRank, progressPercent };
}

export type RewardMilestoneEvent =
  | { type: 'experiment_completed'; experimentId: string; engineId?: SimulationEngineId }
  | { type: 'component_explored'; engineId: SimulationEngineId; componentId: string }
  | { type: 'observation_recorded'; experimentId: string }
  | { type: 'quiz_submitted'; experimentId: string; score: number; total: number }
  | { type: 'guided_activity_completed'; activityId: string; engineId?: SimulationEngineId }
  | { type: 'language_used'; language: LanguageCode }
  | { type: 'daily_challenge_solved'; dateIso: string };

export function recordRewardAction(
  accountId: string | null | undefined,
  event: RewardMilestoneEvent
): RewardActionResult {
  const prev = loadRewardState(accountId);
  const prevRank = getRankForXp(prev.xp).currentRank;
  const next: RewardProgressState = {
    ...prev,
    unlockedBadgeIds: [...prev.unlockedBadgeIds],
    completedExperimentIds: [...prev.completedExperimentIds],
    exploredComponentKeys: [...prev.exploredComponentKeys],
    recordedObservationExpIds: [...prev.recordedObservationExpIds],
    perfectQuizExpIds: [...prev.perfectQuizExpIds],
    attemptedQuizExpIds: [...prev.attemptedQuizExpIds],
    guidedActivityIds: [...prev.guidedActivityIds],
    languagesUsed: [...prev.languagesUsed],
    dailyChallengeDates: [...(prev.dailyChallengeDates ?? [])],
  };

  let xpEarned = 0;
  let touchStreak = false;

  const unlockBadge = (id: BadgeId, newlyUnlocked: BadgeDefinition[]) => {
    if (!next.unlockedBadgeIds.includes(id)) {
      next.unlockedBadgeIds.push(id);
      const def = BADGE_CATALOG.find((b) => b.id === id);
      if (def) newlyUnlocked.push(def);
    }
  };

  const newlyUnlockedBadges: BadgeDefinition[] = [];

  if (event.type === 'experiment_completed') {
    touchStreak = true;
    if (!next.completedExperimentIds.includes(event.experimentId)) {
      next.completedExperimentIds.push(event.experimentId);
      xpEarned += 45;
    }
    unlockBadge('first_spark', newlyUnlockedBadges);
    if (event.engineId === 'bar_magnet') {
      unlockBadge('magnet_master', newlyUnlockedBadges);
    } else if (event.engineId === 'optics_ray_lab') {
      unlockBadge('ray_tracer', newlyUnlockedBadges);
    } else if (event.engineId === 'electric_circuit_lab') {
      unlockBadge('circuit_architect', newlyUnlockedBadges);
    } else if (
      event.engineId === 'motion_kinematics' ||
      event.engineId === 'force_friction_buoyancy' ||
      event.engineId === 'simple_machines_energy' ||
      event.engineId === 'heat_transfer_lab' ||
      event.engineId === 'sound_wave_lab'
    ) {
      unlockBadge('mechanics_pioneer', newlyUnlockedBadges);
    }
  } else if (event.type === 'component_explored') {
    touchStreak = true;
    const key = `${event.engineId}:${event.componentId}`;
    if (!next.exploredComponentKeys.includes(key)) {
      next.exploredComponentKeys.push(key);
      xpEarned += 10;
    }
    if (next.exploredComponentKeys.length >= 5) {
      unlockBadge('curious_observer', newlyUnlockedBadges);
    }
  } else if (event.type === 'observation_recorded') {
    touchStreak = true;
    if (!next.recordedObservationExpIds.includes(event.experimentId)) {
      next.recordedObservationExpIds.push(event.experimentId);
      xpEarned += 15;
    }
  } else if (event.type === 'quiz_submitted') {
    touchStreak = true;
    if (event.total > 0 && event.score >= 1 && !next.attemptedQuizExpIds.includes(event.experimentId)) {
      next.attemptedQuizExpIds.push(event.experimentId);
      xpEarned += 25;
    }
    if (event.total > 0 && event.score === event.total) {
      if (!next.perfectQuizExpIds.includes(event.experimentId)) {
        next.perfectQuizExpIds.push(event.experimentId);
        xpEarned += 25;
      }
      unlockBadge('quiz_champion', newlyUnlockedBadges);
    }
  } else if (event.type === 'guided_activity_completed') {
    touchStreak = true;
    if (!next.guidedActivityIds.includes(event.activityId)) {
      next.guidedActivityIds.push(event.activityId);
      xpEarned += 60;
    }
    unlockBadge('first_spark', newlyUnlockedBadges);
  } else if (event.type === 'language_used') {
    if (!next.languagesUsed.includes(event.language)) {
      next.languagesUsed.push(event.language);
      if (next.languagesUsed.length >= 2) {
        xpEarned += 10;
        unlockBadge('multilingual_explorer', newlyUnlockedBadges);
      }
    }
  } else if (event.type === 'daily_challenge_solved') {
    touchStreak = true;
    const solvedDates = next.dailyChallengeDates ?? [];
    if (!solvedDates.includes(event.dateIso)) {
      solvedDates.push(event.dateIso);
      next.dailyChallengeDates = solvedDates;
      xpEarned += 20;
    }
  }

  if (touchStreak) {
    const today = getTodayIsoDate();
    if (next.lastActiveDate !== today) {
      next.streakDays = isYesterdayIso(next.lastActiveDate, today)
        ? Math.max(1, next.streakDays + 1)
        : 1;
      next.lastActiveDate = today;
    }
  }

  // Badge celebration bonus XP (once per badge unlock)
  if (newlyUnlockedBadges.length > 0) {
    xpEarned += newlyUnlockedBadges.length * 15;
  }

  next.xp += xpEarned;
  saveRewardState(next);

  const nextRank = getRankForXp(next.xp).currentRank;
  const leveledUpTo = nextRank.level > prevRank.level ? nextRank : null;

  return {
    nextState: next,
    xpEarned,
    newlyUnlockedBadges,
    leveledUpTo,
  };
}
