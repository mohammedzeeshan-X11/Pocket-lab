import type { GradeClassLevel, LanguageCode, SimulationEngineId } from './physics';

export type CompanionEmotion =
  | 'idle'
  | 'thinking'
  | 'speaking'
  | 'excited'
  | 'encouraging'
  | 'celebrating';

export type CompanionPointTarget = 'none' | 'left_canvas' | 'right_controls' | 'wave';

export type CompanionEventType =
  | 'dashboard_welcome'
  | 'returning_user'
  | 'experiment_intro'
  | 'parameter_changed'
  | 'component_inspected'
  | 'prediction_prompt'
  | 'quiz_correct'
  | 'quiz_wrong'
  | 'experiment_completed'
  | 'badge_unlocked'
  | 'guided_step';

export interface CompanionMessageState {
  id: string;
  eventType: CompanionEventType;
  text: string;
  emotion: CompanionEmotion;
  pointTarget?: CompanionPointTarget;
  quickPrompt?: string;
  createdAt: number;
}

export type BadgeId =
  | 'first_spark'
  | 'magnet_master'
  | 'ray_tracer'
  | 'circuit_architect'
  | 'mechanics_pioneer'
  | 'curious_observer'
  | 'quiz_champion'
  | 'multilingual_explorer';

export interface BadgeDefinition {
  id: BadgeId;
  iconKey:
    | 'spark'
    | 'magnet'
    | 'optics'
    | 'circuit'
    | 'mechanics'
    | 'observer'
    | 'quiz'
    | 'language';
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
}

export interface RewardRank {
  level: number;
  minXp: number;
  title: Record<LanguageCode, string>;
}

export interface RewardProgressState {
  accountId: string;
  xp: number;
  streakDays: number;
  lastActiveDate: string | null;
  unlockedBadgeIds: BadgeId[];
  completedExperimentIds: string[];
  exploredComponentKeys: string[];
  recordedObservationExpIds: string[];
  perfectQuizExpIds: string[];
  attemptedQuizExpIds: string[];
  guidedActivityIds: string[];
  languagesUsed: LanguageCode[];
  dailyChallengeDates?: string[];
}

export interface RewardActionResult {
  nextState: RewardProgressState;
  xpEarned: number;
  newlyUnlockedBadges: BadgeDefinition[];
  leveledUpTo: RewardRank | null;
}

export type GuidedStepId =
  | 'intro'
  | 'objective'
  | 'prediction'
  | 'experiment'
  | 'quiz'
  | 'summary';

export interface GuidedClassroomActivity {
  activityId: string;
  classId: string;
  className: string;
  classGrade: GradeClassLevel;
  teacherId: string;
  teacherName: string;
  experimentId: string;
  experimentTitle: string;
  simulationEngineId: SimulationEngineId;
  customObjective?: string;
  predictionPrompt: string;
  predictionOptions: string[];
  correctPredictionIndex: number;
  status: 'active' | 'ended';
  createdAt: string;
  endedAt?: string;
}

export interface GuidedActivityCompletion {
  completionId: string;
  activityId: string;
  classId: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  experimentId: string;
  selectedPredictionIndex: number;
  predictionMatched: boolean;
  quizScore: number;
  quizTotal: number;
  summaryNotes?: string;
  completedAt: string;
}
