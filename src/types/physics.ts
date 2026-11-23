import type { RegisteredSimulationId } from '../data/simulationRegistry';
import type {
  DetectedTextbookExperiment,
  ExperimentRegistryMatchResult,
} from './dynamicExperiment';

export type LanguageCode = 'en' | 'kn' | 'hi';

export type AppView =
  | 'home'
  | 'pocket_lab'
  | 'learning'
  | 'explore'
  | 'scanner'
  | 'challenge'
  | 'concepts'
  | 'lab'
  | 'settings'
  | 'auth'
  | 'student_portal'
  | 'teacher_portal';

export type SimulationMode = '2d' | '3d';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConceptVariable {
  symbol: string;
  meaning: string;
  unit: string;
}

export interface PhysicsEquation {
  formula: string;
  name: string;
  variables: string;
  units?: string;
}

export interface ScientificTerm {
  term: string;
  definition: string;
}

export interface PhysicsConcept {
  id: string;
  name: string;
  description: string;
  equations: PhysicsEquation[];
  variables: ConceptVariable[];
  relationships?: string;
  terminology?: ScientificTerm[];
  diagram_detected: boolean;
  simulation_id: RegisteredSimulationId | 'none';
  simulation_supported: boolean;
  simulation_reason?: string;
  matched_experiment_id?: string;
  needs_dynamic_generation?: boolean;
  confidence: ConfidenceLevel;
}

export interface DetectedDiagram {
  title: string;
  description: string;
  components: string[];
  interpretable: boolean;
}

export interface LocalizedConceptTranslation {
  id: string;
  name: string;
  description: string;
  relationships?: string;
  variables: ConceptVariable[];
  terminology: ScientificTerm[];
}

export interface LocalizedDiagramTranslation {
  title: string;
  description: string;
  components: string[];
}

export interface LocalizedAnalysisBundle {
  chapter: string;
  main_topic: string;
  summary: string;
  concepts: LocalizedConceptTranslation[];
  diagrams: LocalizedDiagramTranslation[];
}

export interface TextbookAnalysisResult {
  is_physics_content: boolean;
  subject: string;
  class_level: string;
  chapter: string;
  main_topic: string;
  summary: string;
  concepts: PhysicsConcept[];
  equations: PhysicsEquation[];
  terminology: ScientificTerm[];
  detected_diagrams: DetectedDiagram[];
  extracted_text: string;
  uncertain_content: string[];
  overall_confidence: ConfidenceLevel;
  translations?: Record<LanguageCode, LocalizedAnalysisBundle>;
  analyzedAt: string;
  language: LanguageCode;
  source: 'gemini_scan' | 'built_in_module';
  imagePreviewUrl?: string;
  detected_experiment?: DetectedTextbookExperiment;
  registry_match?: ExperimentRegistryMatchResult;
}

export interface SavedStudySession {
  id: string;
  savedAt: string;
  fileName: string;
  analysis: TextbookAnalysisResult;
}

export type GradeClassLevel = 6 | 7 | 8 | 9 | 10;

export interface UserPreferences {
  language: LanguageCode;
  defaultSimulationMode: SimulationMode;
  showVectorGridByDefault: boolean;
  reducedMotion: boolean;
  selectedClass: GradeClassLevel;
}

// ---------------------------------------------------------------------------
// Prompt 04: Explainability Engine, Object Selection & Voice Tutor Types
// ---------------------------------------------------------------------------

export type SimulationObjectId =
  | 'magnet_body'
  | 'north_pole'
  | 'south_pole'
  | 'field_lines'
  | 'field_direction_arrows'
  | 'compass_needle'
  | 'compass_pivot'
  | 'bar_magnet';

export interface SelectableObjectInfo {
  id: SimulationObjectId;
  name: string;
  characteristics: string;
  functionDescription: string;
  interactionDescription: string;
}

export type AdaptiveSimulationId =
  | 'bar_magnet_explorer'
  | 'compass_field_explorer'
  | 'field_line_intersection_explorer';

export interface ExperimentParametersSnapshot {
  activeExperimentId: AdaptiveSimulationId;
  mode: SimulationMode;
  magnetAngleDeg: number;
  magnetPitchDeg: number;
  strength: number;
  showFieldLines: boolean;
  showVectorGrid: boolean;
  showDirectionArrows: boolean;
  compassCount: number;
}

export interface ExperimentEquationBreakdown {
  formula: string;
  name: string;
  variables: string;
}

export interface ExperimentExplanation {
  what_we_observe: string;
  objects_characteristics: SelectableObjectInfo[];
  important_components: string[];
  scientific_principles: string;
  how_it_works: string;
  step_by_step: string[];
  equations_and_variables: ExperimentEquationBreakdown[];
  real_world_applications: string[];
  parameter_effects: string;
  key_learning_outcomes: string[];
  spoken_summary: string;
  generatedAt: string;
  language: LanguageCode;
  mode: SimulationMode;
}

export type TeachingStrategy =
  | 'simpler_explanation'
  | 'step_by_step'
  | 'real_world_analogy'
  | 'numerical_example'
  | 'visual_explanation'
  | 'detailed_scientific'
  | 'alternative_experiment';

export interface AdaptiveSimulationConfig {
  simulation_id: AdaptiveSimulationId;
  visualization_mode: '2D' | '3D';
  valid: boolean;
  fallback_used: boolean;
  parameters: {
    show_compass: boolean;
    show_field_lines: boolean;
    show_direction_arrows: boolean;
    show_vector_grid: boolean;
    compass_count: number;
    highlight_intersection_test: boolean;
  };
}

export type TutorAudioStatus = 'idle' | 'preparing' | 'playing' | 'paused' | 'error';

export type TutorMicStatus =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'transcribing'
  | 'transcript_ready'
  | 'error';

export type TutorRequestedStyle =
  | 'auto'
  | 'simpler'
  | 'step_by_step'
  | 'real_life_example'
  | 'analogy'
  | 'formula'
  | 'numerical'
  | 'component'
  | 'detailed'
  | 'repeat';

export interface TutorParameterSuggestion {
  magnetAngleDeg?: number;
  magnetPitchDeg?: number;
  strength?: number;
  showFieldLines?: boolean;
  showVectorGrid?: boolean;
  showCompass?: boolean;
  compassCount?: number;
  mode?: SimulationMode;
  // Validated multi-engine controls (strictly clamped server-side & client-side)
  voltageV?: number;
  resistance1?: number;
  switchClosed?: boolean;
  incidenceDeg?: number;
  objectDistanceCm?: number;
  focalLengthCm?: number;
  heaterTempC?: number;
  frequencyHz?: number;
  amplitudePct?: number;
  summaryLabel?: string;
}

export interface TutorResponse {
  student_question: string;
  detected_language: string;
  needs_language_clarification: boolean;
  clarification_message?: string;
  misunderstood_concept: string;
  why_previous_was_hard: string;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  teaching_strategy: TeachingStrategy;
  response_language: LanguageCode;
  explanation: string;
  alternative_experiment_note: string;
  alternative_simulation: AdaptiveSimulationConfig;
  parameter_adjustments?: TutorParameterSuggestion | null;
  follow_up_question: string;
  spoken_summary: string;
  answeredAt: string;
}

export interface TutorChatMessage {
  id: string;
  role: 'student' | 'tutor';
  text: string;
  spokenSummary?: string;
  language: LanguageCode;
  detectedLanguage?: string;
  needsLanguageClarification?: boolean;
  clarificationMessage?: string;
  misunderstoodConcept?: string;
  whyPreviousHard?: string;
  difficultyLevel?: 'basic' | 'intermediate' | 'advanced';
  teachingStrategy?: TeachingStrategy;
  alternativeExperimentNote?: string;
  alternativeSimulation?: AdaptiveSimulationConfig;
  parameterAdjustments?: TutorParameterSuggestion | null;
  followUpQuestion?: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface TutorTranscriptionResult {
  transcript: string;
  detectedLanguage: LanguageCode;
  unclearSpeech: boolean;
  note?: string;
}

export interface TutorSpeechAudioResult {
  audioBase64: string;
  mimeType: string;
  language: LanguageCode;
  voiceName: string;
  provider: 'gemini_tts';
}

export interface LearningSessionContext {
  currentExperiment: AdaptiveSimulationId;
  selectedLanguage: LanguageCode;
  questionsAsked: string[];
  confusedConcepts: string[];
  strategiesAttempted: TeachingStrategy[];
  alternativeSimulationsViewed: AdaptiveSimulationId[];
}

// ---------------------------------------------------------------------------
// Prompt 05: Complete NCERT Physics Learning Library (Classes 6–10)
// ---------------------------------------------------------------------------

export type SimulationEngineId =
  | 'bar_magnet'
  | 'motion_kinematics'
  | 'force_friction_buoyancy'
  | 'simple_machines_energy'
  | 'heat_transfer_lab'
  | 'optics_ray_lab'
  | 'sound_wave_lab'
  | 'electric_circuit_lab';

export type CurriculumTopicArea =
  | 'motion_measurement'
  | 'force_mechanics'
  | 'work_energy_machines'
  | 'heat_temperature'
  | 'light_optics'
  | 'sound_waves'
  | 'electricity_magnetism'
  | 'natural_phenomena_energy';

export type EntryCategory =
  | 'ncert_concept'
  | 'ncert_activity'
  | 'ncert_practical'
  | 'physix_supplementary';

export type CurriculumVerificationStatus =
  | 'verified_ncert'
  | 'supplementary_physix'
  | 'needs_verification';

export type SimulationAvailabilityStatus =
  | 'interactive_2d_3d'
  | 'interactive_2d'
  | 'interactive_3d'
  | 'explanation_only'
  | 'coming_soon';

export interface ExperimentAssessmentQuestion {
  id: string;
  kind: 'conceptual' | 'application' | 'numerical';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NcertChapterMeta {
  id: string;
  classLevel: GradeClassLevel;
  chapterNumber: number;
  title: string;
  textbookTitle: string;
  verificationStatus: CurriculumVerificationStatus;
  verificationNote?: string;
  physicsTopics: string[];
  topicAreas: CurriculumTopicArea[];
}

export interface NcertClassCurriculum {
  classLevel: GradeClassLevel;
  textbookSeries: string;
  editionNote: string;
  description: string;
  chapters: NcertChapterMeta[];
}

export interface ExperimentCatalogItem {
  id: string;
  title: string;
  classLevel: GradeClassLevel;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  topicArea: CurriculumTopicArea;
  relevantConcept: string;
  entryCategory: EntryCategory;
  verificationStatus: CurriculumVerificationStatus;
  verificationNote?: string;
  availabilityStatus: SimulationAvailabilityStatus;
  simulationEngineId: SimulationEngineId | null;
  simulationPreset?: string;
  reusedAcrossClasses?: GradeClassLevel[];
  learningObjective: string;
  whyItImportant: string;
  realWorldApplication: string;
  description: string;
  apparatus: string[];
  procedure: string[];
  observationsGuide: string[];
  expectedOutcome: string;
  scientificExplanation: string;
  gradeAdaptedNote: string;
  assessmentQuestions: ExperimentAssessmentQuestion[];
}

export interface StudentExperimentCompletion {
  experimentId: string;
  completedAt: string;
  quizScore?: number;
  quizTotal?: number;
  recordedObservations: string[];
}

export type StudentProgressMap = Record<string, StudentExperimentCompletion>;

// ---------------------------------------------------------------------------
// Prompt 06: Student & Teacher Portals + Firebase Authentication Types
// ---------------------------------------------------------------------------

export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  username?: string;
  name: string;
  email?: string;
  role: UserRole;
  selectedClass?: GradeClassLevel;
  schoolOrSubject?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalDemoAccountSummary {
  uid: string;
  username: string;
  name: string;
  role: UserRole;
  selectedClass?: GradeClassLevel;
  schoolOrSubject?: string;
  createdAt: string;
}

export interface PhysicsClass {
  classId: string;
  teacherId: string;
  teacherName: string;
  className: string;
  classGrade: GradeClassLevel;
  joinCode: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassMembership {
  membershipId: string;
  classId: string;
  teacherId: string;
  teacherName: string;
  className: string;
  classGrade: GradeClassLevel;
  joinCode: string;
  studentId: string;
  studentName: string;
  studentSelectedClass: GradeClassLevel;
  joinedAt: string;
}

export interface FirestoreStudentProgress {
  progressId: string;
  studentId: string;
  classId: string;
  classGrade: GradeClassLevel;
  moduleId: string;
  experimentId: string;
  experimentTitle: string;
  completionStatus: 'in_progress' | 'completed';
  recordedObservations: string[];
  quizScore?: number;
  quizTotal?: number;
  teacherIds: string[];
  completedAt?: string;
  updatedAt: string;
}

export interface AssessmentResultRecord {
  resultId: string;
  studentId: string;
  studentName: string;
  classId: string;
  classGrade: GradeClassLevel;
  experimentId: string;
  experimentTitle: string;
  score: number;
  totalQuestions: number;
  teacherIds: string[];
  completedAt: string;
}

export interface TeacherNotification {
  notificationId: string;
  teacherId: string;
  classId: string;
  className: string;
  classGrade: GradeClassLevel;
  studentId: string;
  studentName: string;
  type: 'student_joined';
  title: string;
  message: string;
  joinedAt: string;
  createdAt: string;
  isRead: boolean;
}

export type ClassActivityEventType =
  | 'student_joined'
  | 'experiment_completed'
  | 'assessment_submitted';

export interface ClassActivityEvent {
  activityId: string;
  teacherId: string;
  classId: string;
  className: string;
  classGrade: GradeClassLevel;
  studentId: string;
  studentName: string;
  eventType: ClassActivityEventType;
  summary: string;
  experimentId?: string;
  experimentTitle?: string;
  score?: number;
  totalQuestions?: number;
  createdAt: string;
}

