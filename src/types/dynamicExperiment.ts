import type { ExperimentAssessmentQuestion, LanguageCode } from './physics';

export type DynamicExperimentDomain =
  | 'mechanics'
  | 'motion'
  | 'forces'
  | 'energy'
  | 'optics_reflection'
  | 'optics_refraction'
  | 'electricity'
  | 'magnetism'
  | 'waves_sound'
  | 'heat';

export type DynamicSimulationTemplateId =
  | 'pendulum_shm'
  | 'projectile_motion'
  | 'inclined_plane_forces'
  | 'spring_oscillation'
  | 'buoyancy_pressure'
  | 'lever_pulley_energy'
  | 'optics_ray_model'
  | 'dc_circuit_model'
  | 'magnetic_dipole_3d'
  | 'wave_acoustics'
  | 'thermal_calorimetry';

export type DynamicValidationStatus =
  | 'validated_exact'
  | 'validated_simplified_model';

export interface DynamicComponentDef {
  id: string;
  role: string;
  label: string;
  description: string;
  characteristics: string;
  functionDescription: string;
  relationship: string;
  realWorldExample: string;
  positionNormalized: {
    x: number; // 0..1
    y: number; // 0..1
    z?: number; // -1..1
  };
  visualAssetKey: string;
}

export interface DynamicParameterDef {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  controlType: 'slider' | 'toggle' | 'select';
  options?: Array<{ label: string; value: number }>;
}

export interface DynamicEquationDef {
  name: string;
  formula: string;
  variables: string;
  units: string;
}

export interface DynamicExperimentTranslation {
  title: string;
  educationalObjective: string;
  conceptExplanation: string;
  whyImportant: string;
  realWorldApplication: string;
  expectedBehaviour: string;
  limitationNote?: string;
  procedureSteps: string[];
  componentLabels: Record<
    string,
    {
      label: string;
      description: string;
      relationship: string;
    }
  >;
  parameterLabels: Record<string, string>;
}

export interface DynamicExperimentSpec {
  id: string; // e.g. 'dyn_1730...'
  version: number;
  createdAt: number;
  updatedAt?: number;
  ownerUid?: string;
  studentClass: number;
  chapterNumber?: number;
  chapterTitle?: string;
  conceptId: string;
  conceptName: string;
  domain: DynamicExperimentDomain;
  templateId: DynamicSimulationTemplateId;
  title: string;
  educationalObjective: string;
  conceptExplanation: string;
  whyImportant: string;
  realWorldApplication: string;
  visualizationMode: '2d' | '3d';
  supports3d: boolean;
  visualRepresentationNotes: string;
  components: DynamicComponentDef[];
  parameters: DynamicParameterDef[];
  equations: DynamicEquationDef[];
  initialConditions: Record<string, number>;
  procedureSteps: string[];
  expectedBehaviour: string;
  assessmentQuestions: ExperimentAssessmentQuestion[];
  validationStatus: DynamicValidationStatus;
  isSimplifiedModel: boolean;
  limitationNote?: string;
  validationChecksPassed: string[];
  validationWarnings: string[];
  sourceScanTopic?: string;
  sourceImagePreviewUrl?: string;
  translations: Record<LanguageCode, DynamicExperimentTranslation>;
}

export interface DynamicTelemetryMetric {
  key: string;
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}

export interface DynamicSimulationFrame {
  templateId: DynamicSimulationTemplateId;
  timeSec: number;
  metrics: DynamicTelemetryMetric[];
  summaryText: string;
  vectorData: Record<string, number>;
  trailPoints?: Array<{ x: number; y: number; t: number }>;
  curvePoints?: Array<{ x: number; y: number }>;
  statusFlags?: Record<string, boolean | string>;
}

export interface ExperimentRegistryMatchResult {
  matchType: 'exact_existing' | 'saved_dynamic' | 'generate_new';
  confidence: number; // 0..1
  matchedExperimentId?: string;
  matchedExperimentTitle?: string;
  matchedSimulationEngineId?: string;
  matchedDynamicExperimentId?: string;
  reason: string;
  recommendedTemplateId?: DynamicSimulationTemplateId;
  recommendedDomain?: DynamicExperimentDomain;
  preferredDimension?: '2d' | '3d';
}

export interface DetectedTextbookExperiment {
  experiment_name: string;
  physics_concept: string;
  domain_category: DynamicExperimentDomain;
  class_level_numeric: number;
  components_apparatus: string[];
  diagram_structure: string;
  variables_units: Array<{ symbol: string; meaning: string; unit: string }>;
  experimental_procedure: string[];
  expected_behaviour: string;
  preferred_dimension: '2d' | '3d';
  dimension_reason: string;
  is_complex_or_unsupported?: boolean;
  limitation_summary?: string;
}
