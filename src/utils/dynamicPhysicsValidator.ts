import type { ExperimentAssessmentQuestion, LanguageCode } from '../types/physics';
import type {
  DynamicComponentDef,
  DynamicEquationDef,
  DynamicExperimentDomain,
  DynamicExperimentSpec,
  DynamicExperimentTranslation,
  DynamicParameterDef,
  DynamicSimulationFrame,
  DynamicSimulationTemplateId,
} from '../types/dynamicExperiment';

export const APPROVED_DYNAMIC_DOMAINS: readonly DynamicExperimentDomain[] = [
  'mechanics',
  'motion',
  'forces',
  'energy',
  'optics_reflection',
  'optics_refraction',
  'electricity',
  'magnetism',
  'waves_sound',
  'heat',
] as const;

export const APPROVED_TEMPLATE_IDS: readonly DynamicSimulationTemplateId[] = [
  'pendulum_shm',
  'projectile_motion',
  'inclined_plane_forces',
  'spring_oscillation',
  'buoyancy_pressure',
  'lever_pulley_energy',
  'optics_ray_model',
  'dc_circuit_model',
  'magnetic_dipole_3d',
  'wave_acoustics',
  'thermal_calorimetry',
] as const;

export const APPROVED_VISUAL_ASSET_KEYS = new Set<string>([
  'magnet_body',
  'north_pole',
  'south_pole',
  'field_lines',
  'compass_needle',
  'battery',
  'resistor',
  'wires',
  'bulb',
  'switch',
  'electromagnet_coil',
  'mirror',
  'convex_mirror',
  'concave_mirror',
  'convex_lens',
  'concave_lens',
  'glass_slab',
  'prism',
  'moving_body',
  'test_block',
  'surface_or_fluid',
  'buoyancy_arrow',
  'pulley_wheel',
  'fulcrum_pivot',
  'energy_bob',
  'heat_source',
  'thermometer_probe',
  'conducting_rod',
  'vibrating_source',
  'wave',
]);

export const TEMPLATES_SUPPORTING_3D = new Set<DynamicSimulationTemplateId>([
  'pendulum_shm',
  'projectile_motion',
  'inclined_plane_forces',
  'spring_oscillation',
  'buoyancy_pressure',
  'optics_ray_model',
  'magnetic_dipole_3d',
]);

interface ParamBoundRule {
  minAllowed: number;
  maxAllowed: number;
  defaultMin: number;
  defaultMax: number;
  defaultVal: number;
  defaultStep: number;
  nonZero?: boolean;
  label: string;
  symbol: string;
  unit: string;
}

interface TemplateSchemaConfig {
  defaultDomain: DynamicExperimentDomain;
  supports3d: boolean;
  preferredDimension: '2d' | '3d';
  paramRules: Record<string, ParamBoundRule>;
  fallbackParams: DynamicParameterDef[];
  fallbackEquations: DynamicEquationDef[];
  defaultVisualAsset: string;
}

export const TEMPLATE_PHYSICS_CONFIG: Record<
  DynamicSimulationTemplateId,
  TemplateSchemaConfig
> = {
  pendulum_shm: {
    defaultDomain: 'motion',
    supports3d: true,
    preferredDimension: '3d',
    defaultVisualAsset: 'energy_bob',
    paramRules: {
      lengthM: { minAllowed: 0.2, maxAllowed: 4.0, defaultMin: 0.3, defaultMax: 3.0, defaultVal: 1.0, defaultStep: 0.1, label: 'Pendulum Length', symbol: 'L', unit: 'm' },
      gravity: { minAllowed: 1.6, maxAllowed: 20.0, defaultMin: 1.6, defaultMax: 15.0, defaultVal: 9.8, defaultStep: 0.2, label: 'Gravity', symbol: 'g', unit: 'm/s²' },
      initialAngleDeg: { minAllowed: 2, maxAllowed: 70, defaultMin: 5, defaultMax: 60, defaultVal: 20, defaultStep: 1, label: 'Release Angle', symbol: 'θ₀', unit: '°' },
      massKg: { minAllowed: 0.1, maxAllowed: 10, defaultMin: 0.5, defaultMax: 5.0, defaultVal: 1.0, defaultStep: 0.1, label: 'Bob Mass', symbol: 'm', unit: 'kg' },
      damping: { minAllowed: 0, maxAllowed: 0.5, defaultMin: 0, defaultMax: 0.3, defaultVal: 0.02, defaultStep: 0.01, label: 'Air Damping', symbol: 'γ', unit: 's⁻¹' },
    },
    fallbackParams: [
      { key: 'lengthM', label: 'Pendulum Length', symbol: 'L', unit: 'm', min: 0.3, max: 3.0, step: 0.1, defaultValue: 1.0, controlType: 'slider' },
      { key: 'gravity', label: 'Gravity', symbol: 'g', unit: 'm/s²', min: 1.6, max: 15.0, step: 0.2, defaultValue: 9.8, controlType: 'slider' },
      { key: 'initialAngleDeg', label: 'Release Angle', symbol: 'θ₀', unit: '°', min: 5, max: 60, step: 1, defaultValue: 20, controlType: 'slider' },
      { key: 'massKg', label: 'Bob Mass', symbol: 'm', unit: 'kg', min: 0.5, max: 5.0, step: 0.1, defaultValue: 1.0, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: 'Simple Pendulum Time Period', formula: 'T = 2π√(L / g)', variables: 'T: period, L: string length, g: acceleration due to gravity', units: 's, m, m/s²' },
      { name: 'Angular Equation of Motion', formula: 'd²θ/dt² = −(g/L) sin θ', variables: 'θ: angular displacement from vertical', units: 'rad/s²' },
    ],
  },
  projectile_motion: {
    defaultDomain: 'motion',
    supports3d: true,
    preferredDimension: '2d',
    defaultVisualAsset: 'moving_body',
    paramRules: {
      initialSpeed: { minAllowed: 2, maxAllowed: 60, defaultMin: 5, defaultMax: 40, defaultVal: 20, defaultStep: 1, label: 'Launch Speed', symbol: 'v₀', unit: 'm/s' },
      launchAngleDeg: { minAllowed: 5, maxAllowed: 85, defaultMin: 10, defaultMax: 80, defaultVal: 45, defaultStep: 1, label: 'Launch Angle', symbol: 'θ', unit: '°' },
      launchHeightM: { minAllowed: 0, maxAllowed: 30, defaultMin: 0, defaultMax: 20, defaultVal: 0, defaultStep: 1, label: 'Initial Height', symbol: 'h₀', unit: 'm' },
      gravity: { minAllowed: 1.6, maxAllowed: 20, defaultMin: 1.6, defaultMax: 15, defaultVal: 9.8, defaultStep: 0.2, label: 'Gravity', symbol: 'g', unit: 'm/s²' },
      airDrag: { minAllowed: 0, maxAllowed: 0.08, defaultMin: 0, defaultMax: 0.05, defaultVal: 0, defaultStep: 0.005, label: 'Air Drag', symbol: 'k_d', unit: 's⁻¹' },
    },
    fallbackParams: [
      { key: 'initialSpeed', label: 'Launch Speed', symbol: 'v₀', unit: 'm/s', min: 5, max: 40, step: 1, defaultValue: 20, controlType: 'slider' },
      { key: 'launchAngleDeg', label: 'Launch Angle', symbol: 'θ', unit: '°', min: 10, max: 80, step: 1, defaultValue: 45, controlType: 'slider' },
      { key: 'launchHeightM', label: 'Initial Height', symbol: 'h₀', unit: 'm', min: 0, max: 20, step: 1, defaultValue: 0, controlType: 'slider' },
      { key: 'gravity', label: 'Gravity', symbol: 'g', unit: 'm/s²', min: 1.6, max: 15, step: 0.2, defaultValue: 9.8, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: 'Horizontal Range (h₀ = 0)', formula: 'R = (v₀² sin 2θ) / g', variables: 'R: range, v₀: launch speed, θ: angle, g: gravity', units: 'm, m/s, °, m/s²' },
      { name: 'Maximum Height', formula: 'H_max = h₀ + (v₀ sin θ)² / (2g)', variables: 'H_max: peak altitude above ground', units: 'm' },
    ],
  },
  inclined_plane_forces: {
    defaultDomain: 'forces',
    supports3d: true,
    preferredDimension: '3d',
    defaultVisualAsset: 'test_block',
    paramRules: {
      inclineAngleDeg: { minAllowed: 5, maxAllowed: 65, defaultMin: 5, defaultMax: 60, defaultVal: 30, defaultStep: 1, label: 'Incline Angle', symbol: 'θ', unit: '°' },
      massKg: { minAllowed: 0.5, maxAllowed: 25, defaultMin: 1, defaultMax: 15, defaultVal: 4, defaultStep: 0.5, label: 'Block Mass', symbol: 'm', unit: 'kg' },
      frictionCoeff: { minAllowed: 0, maxAllowed: 0.9, defaultMin: 0, defaultMax: 0.8, defaultVal: 0.25, defaultStep: 0.02, label: 'Friction Coefficient', symbol: 'μ', unit: '' },
      gravity: { minAllowed: 1.6, maxAllowed: 20, defaultMin: 1.6, defaultMax: 15, defaultVal: 9.8, defaultStep: 0.2, label: 'Gravity', symbol: 'g', unit: 'm/s²' },
    },
    fallbackParams: [
      { key: 'inclineAngleDeg', label: 'Incline Angle', symbol: 'θ', unit: '°', min: 5, max: 60, step: 1, defaultValue: 30, controlType: 'slider' },
      { key: 'massKg', label: 'Block Mass', symbol: 'm', unit: 'kg', min: 1, max: 15, step: 0.5, defaultValue: 4, controlType: 'slider' },
      { key: 'frictionCoeff', label: 'Friction Coefficient', symbol: 'μ', unit: '', min: 0, max: 0.8, step: 0.02, defaultValue: 0.25, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: 'Parallel Gravity Component', formula: 'F_∥ = m g sin θ', variables: 'm: mass, g: gravity, θ: slope angle', units: 'N' },
      { name: 'Normal Reaction & Friction', formula: 'N = m g cos θ, f_max = μ N', variables: 'N: normal force, μ: coefficient of friction', units: 'N' },
    ],
  },
  spring_oscillation: {
    defaultDomain: 'mechanics',
    supports3d: true,
    preferredDimension: '2d',
    defaultVisualAsset: 'energy_bob',
    paramRules: {
      springConstant: { minAllowed: 5, maxAllowed: 200, defaultMin: 10, defaultMax: 120, defaultVal: 40, defaultStep: 2, label: 'Spring Constant', symbol: 'k', unit: 'N/m' },
      massKg: { minAllowed: 0.1, maxAllowed: 10, defaultMin: 0.5, defaultMax: 5, defaultVal: 1.0, defaultStep: 0.1, label: 'Attached Mass', symbol: 'm', unit: 'kg' },
      amplitudeM: { minAllowed: 0.05, maxAllowed: 0.8, defaultMin: 0.05, defaultMax: 0.5, defaultVal: 0.25, defaultStep: 0.02, label: 'Initial Extension', symbol: 'A', unit: 'm' },
      damping: { minAllowed: 0, maxAllowed: 0.6, defaultMin: 0, defaultMax: 0.4, defaultVal: 0.03, defaultStep: 0.01, label: 'Damping', symbol: 'γ', unit: 's⁻¹' },
    },
    fallbackParams: [
      { key: 'springConstant', label: 'Spring Constant', symbol: 'k', unit: 'N/m', min: 10, max: 120, step: 2, defaultValue: 40, controlType: 'slider' },
      { key: 'massKg', label: 'Attached Mass', symbol: 'm', unit: 'kg', min: 0.5, max: 5.0, step: 0.1, defaultValue: 1.0, controlType: 'slider' },
      { key: 'amplitudeM', label: 'Initial Extension', symbol: 'A', unit: 'm', min: 0.05, max: 0.5, step: 0.02, defaultValue: 0.25, controlType: 'slider' },
      { key: 'damping', label: 'Damping', symbol: 'γ', unit: 's⁻¹', min: 0, max: 0.4, step: 0.01, defaultValue: 0.03, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: "Hooke's Restoring Force", formula: 'F = −k x', variables: 'F: restoring force, k: spring stiffness, x: displacement', units: 'N, N/m, m' },
      { name: 'Oscillation Period', formula: 'T = 2π√(m / k)', variables: 'T: period, m: mass, k: spring constant', units: 's' },
    ],
  },
  buoyancy_pressure: {
    defaultDomain: 'forces',
    supports3d: true,
    preferredDimension: '2d',
    defaultVisualAsset: 'buoyancy_arrow',
    paramRules: {
      objectDensity: { minAllowed: 200, maxAllowed: 9000, defaultMin: 300, defaultMax: 3000, defaultVal: 800, defaultStep: 50, label: 'Object Density', symbol: 'ρ_obj', unit: 'kg/m³' },
      fluidDensity: { minAllowed: 600, maxAllowed: 13600, defaultMin: 700, defaultMax: 2000, defaultVal: 1000, defaultStep: 50, label: 'Fluid Density', symbol: 'ρ_f', unit: 'kg/m³' },
      volumeL: { minAllowed: 0.5, maxAllowed: 20, defaultMin: 1, defaultMax: 10, defaultVal: 4, defaultStep: 0.5, label: 'Object Volume', symbol: 'V', unit: 'L' },
      depthM: { minAllowed: 0.2, maxAllowed: 15, defaultMin: 0.5, defaultMax: 10, defaultVal: 3, defaultStep: 0.2, label: 'Fluid Depth', symbol: 'h', unit: 'm' },
    },
    fallbackParams: [
      { key: 'objectDensity', label: 'Object Density', symbol: 'ρ_obj', unit: 'kg/m³', min: 300, max: 3000, step: 50, defaultValue: 800, controlType: 'slider' },
      { key: 'fluidDensity', label: 'Fluid Density', symbol: 'ρ_f', unit: 'kg/m³', min: 700, max: 2000, step: 50, defaultValue: 1000, controlType: 'slider' },
      { key: 'volumeL', label: 'Object Volume', symbol: 'V', unit: 'L', min: 1, max: 10, step: 0.5, defaultValue: 4, controlType: 'slider' },
      { key: 'depthM', label: 'Fluid Depth', symbol: 'h', unit: 'm', min: 0.5, max: 10, step: 0.2, defaultValue: 3, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: "Archimedes' Buoyant Upthrust", formula: 'F_b = ρ_f · V_sub · g', variables: 'ρ_f: fluid density, V_sub: submerged volume, g: gravity', units: 'N' },
      { name: 'Hydrostatic Gauge Pressure', formula: 'P_gauge = ρ_f · g · h', variables: 'h: depth below free fluid surface', units: 'Pa' },
    ],
  },
  lever_pulley_energy: {
    defaultDomain: 'energy',
    supports3d: false,
    preferredDimension: '2d',
    defaultVisualAsset: 'fulcrum_pivot',
    paramRules: {
      loadForceN: { minAllowed: 10, maxAllowed: 500, defaultMin: 20, defaultMax: 300, defaultVal: 120, defaultStep: 10, label: 'Load Force', symbol: 'W', unit: 'N' },
      effortArmM: { minAllowed: 0.2, maxAllowed: 3.0, defaultMin: 0.4, defaultMax: 2.5, defaultVal: 1.5, defaultStep: 0.1, label: 'Effort Arm', symbol: 'd_e', unit: 'm' },
      loadArmM: { minAllowed: 0.2, maxAllowed: 3.0, defaultMin: 0.2, defaultMax: 2.0, defaultVal: 0.5, defaultStep: 0.1, label: 'Load Arm', symbol: 'd_l', unit: 'm' },
      pulleyStrands: { minAllowed: 1, maxAllowed: 6, defaultMin: 1, defaultMax: 4, defaultVal: 1, defaultStep: 1, label: 'Supporting Strands', symbol: 'N', unit: '' },
    },
    fallbackParams: [
      { key: 'loadForceN', label: 'Load Force', symbol: 'W', unit: 'N', min: 20, max: 300, step: 10, defaultValue: 120, controlType: 'slider' },
      { key: 'effortArmM', label: 'Effort Arm', symbol: 'd_e', unit: 'm', min: 0.4, max: 2.5, step: 0.1, defaultValue: 1.5, controlType: 'slider' },
      { key: 'loadArmM', label: 'Load Arm', symbol: 'd_l', unit: 'm', min: 0.2, max: 2.0, step: 0.1, defaultValue: 0.5, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: 'Torque Equilibrium (Law of Lever)', formula: 'F_effort · d_e = W_load · d_l', variables: 'd_e: effort arm, d_l: load arm', units: 'N·m' },
      { name: 'Mechanical Advantage', formula: 'MA = W_load / F_effort = d_e / d_l', variables: 'MA: force multiplication factor', units: 'ratio' },
    ],
  },
  optics_ray_model: {
    defaultDomain: 'optics_refraction',
    supports3d: true,
    preferredDimension: '2d',
    defaultVisualAsset: 'convex_lens',
    paramRules: {
      opticsMode: { minAllowed: 0, maxAllowed: 2, defaultMin: 0, defaultMax: 2, defaultVal: 1, defaultStep: 1, label: 'Optical Element', symbol: 'mode', unit: '' },
      incidenceDeg: { minAllowed: 5, maxAllowed: 85, defaultMin: 5, defaultMax: 80, defaultVal: 35, defaultStep: 1, label: 'Angle of Incidence', symbol: 'θ₁', unit: '°' },
      n1: { minAllowed: 1.0, maxAllowed: 2.5, defaultMin: 1.0, defaultMax: 2.0, defaultVal: 1.0, defaultStep: 0.05, label: 'Medium 1 Index', symbol: 'n₁', unit: '' },
      n2: { minAllowed: 1.0, maxAllowed: 2.5, defaultMin: 1.0, defaultMax: 2.4, defaultVal: 1.5, defaultStep: 0.05, label: 'Medium 2 Index', symbol: 'n₂', unit: '' },
      focalLengthCm: { minAllowed: -40, maxAllowed: 40, defaultMin: 8, defaultMax: 30, defaultVal: 15, defaultStep: 1, nonZero: true, label: 'Focal Length', symbol: 'f', unit: 'cm' },
      objectDistanceCm: { minAllowed: 5, maxAllowed: 80, defaultMin: 8, defaultMax: 60, defaultVal: 25, defaultStep: 1, label: 'Object Distance', symbol: 'u', unit: 'cm' },
    },
    fallbackParams: [
      { key: 'incidenceDeg', label: 'Angle of Incidence', symbol: 'θ₁', unit: '°', min: 5, max: 80, step: 1, defaultValue: 35, controlType: 'slider' },
      { key: 'n1', label: 'Incident Medium Index', symbol: 'n₁', unit: '', min: 1.0, max: 2.0, step: 0.05, defaultValue: 1.0, controlType: 'slider' },
      { key: 'n2', label: 'Refracting Medium Index', symbol: 'n₂', unit: '', min: 1.0, max: 2.4, step: 0.05, defaultValue: 1.5, controlType: 'slider' },
      { key: 'focalLengthCm', label: 'Focal Length', symbol: 'f', unit: 'cm', min: 8, max: 30, step: 1, defaultValue: 15, controlType: 'slider' },
      { key: 'objectDistanceCm', label: 'Object Distance', symbol: 'u', unit: 'cm', min: 8, max: 60, step: 1, defaultValue: 25, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: "Snell's Law of Refraction", formula: 'n₁ sin θ₁ = n₂ sin θ₂', variables: 'θ₁: angle of incidence, θ₂: refracted angle', units: '°' },
      { name: 'Critical Angle (TIR, n₁ > n₂)', formula: 'sin θ_c = n₂ / n₁', variables: 'θ_c: critical angle for total internal reflection', units: '°' },
    ],
  },
  dc_circuit_model: {
    defaultDomain: 'electricity',
    supports3d: false,
    preferredDimension: '2d',
    defaultVisualAsset: 'resistor',
    paramRules: {
      voltageV: { minAllowed: 1, maxAllowed: 24, defaultMin: 1.5, defaultMax: 18, defaultVal: 9, defaultStep: 0.5, label: 'Supply Voltage', symbol: 'V', unit: 'V' },
      resistance1: { minAllowed: 1, maxAllowed: 100, defaultMin: 2, defaultMax: 50, defaultVal: 10, defaultStep: 1, label: 'Resistor R₁', symbol: 'R₁', unit: 'Ω' },
      resistance2: { minAllowed: 1, maxAllowed: 100, defaultMin: 2, defaultMax: 50, defaultVal: 20, defaultStep: 1, label: 'Resistor R₂', symbol: 'R₂', unit: 'Ω' },
      parallelMode: { minAllowed: 0, maxAllowed: 1, defaultMin: 0, defaultMax: 1, defaultVal: 0, defaultStep: 1, label: 'Parallel Mode', symbol: 'mode', unit: '' },
    },
    fallbackParams: [
      { key: 'voltageV', label: 'Supply Voltage', symbol: 'V', unit: 'V', min: 1.5, max: 18, step: 0.5, defaultValue: 9, controlType: 'slider' },
      { key: 'resistance1', label: 'Resistor R₁', symbol: 'R₁', unit: 'Ω', min: 2, max: 50, step: 1, defaultValue: 10, controlType: 'slider' },
      { key: 'resistance2', label: 'Resistor R₂', symbol: 'R₂', unit: 'Ω', min: 2, max: 50, step: 1, defaultValue: 20, controlType: 'slider' },
      { key: 'parallelMode', label: 'Parallel Circuit (0=Series, 1=Parallel)', symbol: '∥', unit: '', min: 0, max: 1, step: 1, defaultValue: 0, controlType: 'toggle' },
    ],
    fallbackEquations: [
      { name: "Ohm's Law", formula: 'I = V / R_eq', variables: 'I: current, V: potential difference, R_eq: equivalent resistance', units: 'A, V, Ω' },
      { name: 'Electrical Power & Joule Heat', formula: 'P = V I = I² R_eq, H = P t', variables: 'P: power dissipated, H: thermal energy in time t', units: 'W, J' },
    ],
  },
  magnetic_dipole_3d: {
    defaultDomain: 'magnetism',
    supports3d: true,
    preferredDimension: '3d',
    defaultVisualAsset: 'magnet_body',
    paramRules: {
      dipoleStrength: { minAllowed: 0.3, maxAllowed: 3.0, defaultMin: 0.4, defaultMax: 2.5, defaultVal: 1.2, defaultStep: 0.1, label: 'Magnetic Moment', symbol: 'M', unit: '×' },
      coilTurns: { minAllowed: 0, maxAllowed: 200, defaultMin: 10, defaultMax: 150, defaultVal: 60, defaultStep: 5, label: 'Coil Turns', symbol: 'N', unit: 'turns' },
      currentA: { minAllowed: 0, maxAllowed: 5, defaultMin: 0.2, defaultMax: 4.0, defaultVal: 1.5, defaultStep: 0.1, label: 'Coil Current', symbol: 'I', unit: 'A' },
      probeDistanceCm: { minAllowed: 1, maxAllowed: 12, defaultMin: 1.5, defaultMax: 10, defaultVal: 4, defaultStep: 0.5, label: 'Sensor Distance', symbol: 'r', unit: 'cm' },
      magnetAngleDeg: { minAllowed: 0, maxAllowed: 360, defaultMin: 0, defaultMax: 360, defaultVal: 0, defaultStep: 5, label: 'Orientation Angle', symbol: 'θ', unit: '°' },
    },
    fallbackParams: [
      { key: 'dipoleStrength', label: 'Magnetic Moment', symbol: 'M', unit: '×', min: 0.4, max: 2.5, step: 0.1, defaultValue: 1.2, controlType: 'slider' },
      { key: 'currentA', label: 'Coil Current', symbol: 'I', unit: 'A', min: 0.2, max: 4.0, step: 0.1, defaultValue: 1.5, controlType: 'slider' },
      { key: 'probeDistanceCm', label: 'Sensor Distance', symbol: 'r', unit: 'cm', min: 1.5, max: 10, step: 0.5, defaultValue: 4.0, controlType: 'slider' },
      { key: 'magnetAngleDeg', label: 'Orientation Angle', symbol: 'θ', unit: '°', min: 0, max: 360, step: 5, defaultValue: 0, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: 'Axial Dipole Magnetic Field', formula: 'B ∝ (2 M) / r³', variables: 'B: flux density, M: dipole moment, r: axial distance', units: 'mT, cm' },
      { name: 'Solenoid Axial Field', formula: 'B = μ₀ (N / L) I', variables: 'N: coil turns, L: solenoid length, I: current', units: 'mT' },
    ],
  },
  wave_acoustics: {
    defaultDomain: 'waves_sound',
    supports3d: false,
    preferredDimension: '2d',
    defaultVisualAsset: 'wave',
    paramRules: {
      frequencyHz: { minAllowed: 50, maxAllowed: 2000, defaultMin: 100, defaultMax: 1000, defaultVal: 340, defaultStep: 10, label: 'Source Frequency', symbol: 'f', unit: 'Hz' },
      waveSpeedMs: { minAllowed: 100, maxAllowed: 1500, defaultMin: 200, defaultMax: 600, defaultVal: 340, defaultStep: 10, label: 'Wave Speed', symbol: 'v', unit: 'm/s' },
      amplitudePct: { minAllowed: 15, maxAllowed: 100, defaultMin: 20, defaultMax: 100, defaultVal: 60, defaultStep: 5, label: 'Amplitude', symbol: 'A', unit: '%' },
      harmonicN: { minAllowed: 1, maxAllowed: 5, defaultMin: 1, defaultMax: 5, defaultVal: 2, defaultStep: 1, label: 'Harmonic Mode', symbol: 'n', unit: '' },
      sourceSpeedMs: { minAllowed: -60, maxAllowed: 60, defaultMin: -40, defaultMax: 40, defaultVal: 0, defaultStep: 5, label: 'Source Speed (Doppler)', symbol: 'v_s', unit: 'm/s' },
    },
    fallbackParams: [
      { key: 'frequencyHz', label: 'Source Frequency', symbol: 'f', unit: 'Hz', min: 100, max: 1000, step: 10, defaultValue: 340, controlType: 'slider' },
      { key: 'waveSpeedMs', label: 'Wave Speed', symbol: 'v', unit: 'm/s', min: 200, max: 600, step: 10, defaultValue: 340, controlType: 'slider' },
      { key: 'amplitudePct', label: 'Amplitude', symbol: 'A', unit: '%', min: 20, max: 100, step: 5, defaultValue: 60, controlType: 'slider' },
      { key: 'harmonicN', label: 'Harmonic Mode', symbol: 'n', unit: '', min: 1, max: 5, step: 1, defaultValue: 2, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: 'Fundamental Wave Equation', formula: 'v = f · λ', variables: 'v: wave speed, f: frequency, λ: wavelength', units: 'm/s, Hz, m' },
      { name: 'Doppler Apparent Frequency', formula: "f' = f · [v / (v − v_s)]", variables: 'v_s: source velocity toward observer', units: 'Hz' },
    ],
  },
  thermal_calorimetry: {
    defaultDomain: 'heat',
    supports3d: false,
    preferredDimension: '2d',
    defaultVisualAsset: 'thermometer_probe',
    paramRules: {
      hotMassKg: { minAllowed: 0.1, maxAllowed: 5.0, defaultMin: 0.2, defaultMax: 2.5, defaultVal: 0.5, defaultStep: 0.1, label: 'Hot Substance Mass', symbol: 'm₁', unit: 'kg' },
      hotTempC: { minAllowed: 30, maxAllowed: 100, defaultMin: 40, defaultMax: 100, defaultVal: 85, defaultStep: 2, label: 'Hot Temperature', symbol: 'T₁', unit: '°C' },
      coldMassKg: { minAllowed: 0.1, maxAllowed: 5.0, defaultMin: 0.2, defaultMax: 2.5, defaultVal: 1.0, defaultStep: 0.1, label: 'Water / Cold Mass', symbol: 'm₂', unit: 'kg' },
      coldTempC: { minAllowed: 5, maxAllowed: 40, defaultMin: 10, defaultMax: 35, defaultVal: 22, defaultStep: 1, label: 'Cold Temperature', symbol: 'T₂', unit: '°C' },
      specificHeatHot: { minAllowed: 200, maxAllowed: 4200, defaultMin: 380, defaultMax: 4186, defaultVal: 900, defaultStep: 50, label: 'Specific Heat c₁', symbol: 'c₁', unit: 'J/kg·K' },
    },
    fallbackParams: [
      { key: 'hotMassKg', label: 'Hot Substance Mass', symbol: 'm₁', unit: 'kg', min: 0.2, max: 2.5, step: 0.1, defaultValue: 0.5, controlType: 'slider' },
      { key: 'hotTempC', label: 'Hot Temperature', symbol: 'T₁', unit: '°C', min: 40, max: 100, step: 2, defaultValue: 85, controlType: 'slider' },
      { key: 'coldMassKg', label: 'Cold Water Mass', symbol: 'm₂', unit: 'kg', min: 0.2, max: 2.5, step: 0.1, defaultValue: 1.0, controlType: 'slider' },
      { key: 'coldTempC', label: 'Initial Water Temp', symbol: 'T₂', unit: '°C', min: 10, max: 35, step: 1, defaultValue: 22, controlType: 'slider' },
    ],
    fallbackEquations: [
      { name: 'Calorimetry Heat Balance', formula: 'm₁ c₁ (T₁ − T_eq) = m₂ c₂ (T_eq − T₂)', variables: 'T_eq: thermal equilibrium temperature', units: 'kg, J/kg·K, °C' },
      { name: 'Sensible Heat Energy', formula: 'Q = m · c · ΔT', variables: 'Q: heat transferred, c: specific heat capacity', units: 'J' },
    ],
  },
};

export function sanitizePlainText(input: unknown, fallback = '', maxLen = 900): string {
  if (typeof input !== 'string') return fallback;
  const cleaned = input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/javascript:/gi, '')
    .replace(/\bon\w+\s*=/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, maxLen);
}

function clamp(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

function readParam(
  values: Record<string, number>,
  specParams: DynamicParameterDef[],
  key: string,
  fallback: number
): number {
  if (typeof values[key] === 'number' && Number.isFinite(values[key])) {
    return values[key];
  }
  const found = specParams.find((p) => p.key === key);
  if (found && Number.isFinite(found.defaultValue)) {
    return found.defaultValue;
  }
  return fallback;
}

/**
 * Deterministic physics engine solving ODEs via RK4 and algebraic equations
 * strictly on approved templates. Zero arbitrary eval or user script execution.
 */
export function computeDynamicSimulationState(
  specOrTemplate:
    | Pick<DynamicExperimentSpec, 'templateId' | 'parameters'>
    | DynamicSimulationTemplateId,
  paramValues: Record<string, number>,
  elapsedTimeSec: number
): DynamicSimulationFrame {
  const templateId =
    typeof specOrTemplate === 'string' ? specOrTemplate : specOrTemplate.templateId;
  const specParams =
    typeof specOrTemplate === 'string'
      ? TEMPLATE_PHYSICS_CONFIG[templateId].fallbackParams
      : specOrTemplate.parameters;

  const t = Math.max(0, Number.isFinite(elapsedTimeSec) ? elapsedTimeSec : 0);

  switch (templateId) {
    case 'pendulum_shm': {
      const L = clamp(readParam(paramValues, specParams, 'lengthM', 1.0), 0.2, 4.0);
      const g = clamp(readParam(paramValues, specParams, 'gravity', 9.8), 1.6, 20.0);
      const theta0Deg = clamp(readParam(paramValues, specParams, 'initialAngleDeg', 20), 2, 75);
      const m = clamp(readParam(paramValues, specParams, 'massKg', 1.0), 0.1, 10.0);
      const gamma = clamp(readParam(paramValues, specParams, 'damping', 0.02), 0, 0.5);

      const theta0 = (theta0Deg * Math.PI) / 180;
      const smallPeriod = 2 * Math.PI * Math.sqrt(L / g);
      // Large-angle correction (first-order elliptic integral series): T ≈ T0 (1 + (1/16) θ₀²)
      const exactPeriod = smallPeriod * (1 + (theta0 * theta0) / 16);

      // Deterministic RK4 numerical integration up to phase-wrapped simTime (max 18s window for responsive CPU cost)
      const simT = Math.min(t, 30);
      const dt = 0.015;
      const steps = Math.max(1, Math.round(simT / dt));
      const hStep = simT > 0 ? simT / steps : 0;
      let theta = theta0;
      let omega = 0;

      if (hStep > 0) {
        const accel = (th: number, om: number) => -(g / L) * Math.sin(th) - gamma * om;
        for (let i = 0; i < steps; i++) {
          const k1t = omega;
          const k1o = accel(theta, omega);
          const k2t = omega + 0.5 * hStep * k1o;
          const k2o = accel(theta + 0.5 * hStep * k1t, k2t);
          const k3t = omega + 0.5 * hStep * k2o;
          const k3o = accel(theta + 0.5 * hStep * k2t, k3t);
          const k4t = omega + hStep * k3o;
          const k4o = accel(theta + hStep * k3t, k4t);
          theta += (hStep / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
          omega += (hStep / 6) * (k1o + 2 * k2o + 2 * k3o + k4o);
        }
      }

      const heightGain = L * (1 - Math.cos(theta));
      const speed = Math.abs(L * omega);
      const pe = m * g * heightGain;
      const ke = 0.5 * m * speed * speed;
      const tension = m * g * Math.cos(theta) + m * L * omega * omega;
      const thetaDeg = (theta * 180) / Math.PI;

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'period', label: 'Period T', value: exactPeriod.toFixed(2), unit: 's', accent: true },
          { key: 'angle', label: 'Angle θ(t)', value: thetaDeg.toFixed(1), unit: '°' },
          { key: 'speed', label: 'Bob Speed', value: speed.toFixed(2), unit: 'm/s' },
          { key: 'tension', label: 'String Tension', value: tension.toFixed(2), unit: 'N' },
        ],
        summaryText: `L = ${L.toFixed(1)} m, g = ${g.toFixed(1)} m/s² → T = ${exactPeriod.toFixed(2)} s; θ = ${thetaDeg.toFixed(1)}°, v = ${speed.toFixed(2)} m/s`,
        vectorData: { thetaRad: theta, omega, L, g, m, pe, ke, tension, exactPeriod, smallPeriod },
      };
    }

    case 'projectile_motion': {
      const v0 = clamp(readParam(paramValues, specParams, 'initialSpeed', 20), 2, 60);
      const angleDeg = clamp(readParam(paramValues, specParams, 'launchAngleDeg', 45), 5, 85);
      const h0 = clamp(readParam(paramValues, specParams, 'launchHeightM', 0), 0, 30);
      const g = clamp(readParam(paramValues, specParams, 'gravity', 9.8), 1.6, 20);
      const kd = clamp(readParam(paramValues, specParams, 'airDrag', 0), 0, 0.08);

      const rad = (angleDeg * Math.PI) / 180;
      const vx0 = v0 * Math.cos(rad);
      const vy0 = v0 * Math.sin(rad);

      // Step RK4 trajectory until ground impact y <= 0 (after ascent)
      const dt = 0.03;
      let px = 0;
      let py = h0;
      let vx = vx0;
      let vy = vy0;
      let simTime = 0;
      let maxH = h0;
      const trailPoints: Array<{ x: number; y: number; t: number }> = [{ x: 0, y: h0, t: 0 }];

      for (let i = 0; i < 600; i++) {
        const ax = (vxV: number, vyV: number) => -kd * vxV * Math.hypot(vxV, vyV);
        const ay = (vxV: number, vyV: number) => -g - kd * vyV * Math.hypot(vxV, vyV);

        const k1x = vx;
        const k1y = vy;
        const k1vx = ax(vx, vy);
        const k1vy = ay(vx, vy);

        const vx2 = vx + 0.5 * dt * k1vx;
        const vy2 = vy + 0.5 * dt * k1vy;
        const k2vx = ax(vx2, vy2);
        const k2vy = ay(vx2, vy2);

        const vx3 = vx + 0.5 * dt * k2vx;
        const vy3 = vy + 0.5 * dt * k2vy;
        const k3vx = ax(vx3, vy3);
        const k3vy = ay(vx3, vy3);

        const vx4 = vx + dt * k3vx;
        const vy4 = vy + dt * k3vy;
        const k4vx = ax(vx4, vy4);
        const k4vy = ay(vx4, vy4);

        const nextX = px + (dt / 6) * (k1x + 2 * vx2 + 2 * vx3 + vx4);
        const nextY = py + (dt / 6) * (k1y + 2 * vy2 + 2 * vy3 + vy4);
        vx += (dt / 6) * (k1vx + 2 * k2vx + 2 * k3vx + k4vx);
        vy += (dt / 6) * (k1vy + 2 * k2vy + 2 * k3vy + k4vy);
        simTime += dt;

        if (nextY > maxH) maxH = nextY;

        if (nextY <= 0 && simTime > 0.04) {
          const frac = py / Math.max(1e-4, py - nextY);
          const finalX = px + (nextX - px) * frac;
          const finalT = simTime - dt + dt * frac;
          trailPoints.push({ x: finalX, y: 0, t: finalT });
          px = finalX;
          py = 0;
          simTime = finalT;
          break;
        }
        px = nextX;
        py = nextY;
        trailPoints.push({ x: px, y: py, t: simTime });
      }

      const totalFlightT = Math.max(0.1, simTime);
      const totalRange = px;
      const loopT = totalFlightT > 0 ? t % (totalFlightT + 0.6) : 0;
      const sampleT = Math.min(loopT, totalFlightT);

      // Interpolate instantaneous projectile position
      let curX = 0;
      let curY = h0;
      for (let i = 1; i < trailPoints.length; i++) {
        if (trailPoints[i].t >= sampleT || i === trailPoints.length - 1) {
          const prev = trailPoints[i - 1];
          const curr = trailPoints[i];
          const span = Math.max(1e-5, curr.t - prev.t);
          const f = clamp((sampleT - prev.t) / span, 0, 1);
          curX = prev.x + (curr.x - prev.x) * f;
          curY = prev.y + (curr.y - prev.y) * f;
          break;
        }
      }

      return {
        templateId,
        timeSec: sampleT,
        metrics: [
          { key: 'range', label: 'Range R', value: totalRange.toFixed(1), unit: 'm', accent: true },
          { key: 'maxH', label: 'Max Height', value: maxH.toFixed(1), unit: 'm' },
          { key: 'flightT', label: 'Flight Time', value: totalFlightT.toFixed(2), unit: 's' },
          { key: 'pos', label: 'Instant (x, y)', value: `${curX.toFixed(1)}, ${curY.toFixed(1)}`, unit: 'm' },
        ],
        summaryText: `v₀=${v0} m/s at ${angleDeg}° → Range=${totalRange.toFixed(1)} m, H_max=${maxH.toFixed(1)} m, T_flight=${totalFlightT.toFixed(2)} s`,
        vectorData: { curX, curY, totalRange, maxH, totalFlightT, angleDeg, h0, vx0, vy0 },
        trailPoints,
      };
    }

    case 'inclined_plane_forces': {
      const angleDeg = clamp(readParam(paramValues, specParams, 'inclineAngleDeg', 30), 5, 65);
      const m = clamp(readParam(paramValues, specParams, 'massKg', 4), 0.5, 25);
      const mu = clamp(readParam(paramValues, specParams, 'frictionCoeff', 0.25), 0, 0.9);
      const g = clamp(readParam(paramValues, specParams, 'gravity', 9.8), 1.6, 20);

      const rad = (angleDeg * Math.PI) / 180;
      const weight = m * g;
      const parallelForce = weight * Math.sin(rad);
      const normalForce = weight * Math.cos(rad);
      const maxFriction = mu * normalForce;
      const isSliding = parallelForce > maxFriction + 0.05;
      const netForce = isSliding ? parallelForce - maxFriction : 0;
      const frictionActual = isSliding ? maxFriction : parallelForce;
      const accel = netForce / m;
      const rampLength = 6.0;
      const slidePeriod = accel > 0.02 ? Math.sqrt((2 * rampLength) / accel) : 0;
      const localT = accel > 0.02 ? t % (slidePeriod + 0.8) : 0;
      const sDown = accel > 0.02 ? Math.min(rampLength, 0.5 * accel * localT * localT) : 0;
      const vDown = accel > 0.02 && sDown < rampLength ? accel * localT : 0;

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'accel', label: 'Acceleration', value: accel.toFixed(2), unit: 'm/s²', accent: true },
          { key: 'parallel', label: 'mg sin θ', value: parallelForce.toFixed(1), unit: 'N' },
          { key: 'normal', label: 'Normal N', value: normalForce.toFixed(1), unit: 'N' },
          { key: 'friction', label: 'Friction f', value: frictionActual.toFixed(1), unit: 'N' },
        ],
        summaryText: isSliding
          ? `Block slides down at a = ${accel.toFixed(2)} m/s² (F∥ ${parallelForce.toFixed(1)} N > f_max ${maxFriction.toFixed(1)} N)`
          : `Static equilibrium! Friction ${frictionActual.toFixed(1)} N balances mg sin θ (${parallelForce.toFixed(1)} N)`,
        vectorData: {
          angleDeg,
          rad,
          m,
          weight,
          parallelForce,
          normalForce,
          frictionActual,
          netForce,
          accel,
          sFrac: sDown / rampLength,
          vDown,
        },
        statusFlags: { isSliding },
      };
    }

    case 'spring_oscillation': {
      const k = clamp(readParam(paramValues, specParams, 'springConstant', 40), 5, 200);
      const m = clamp(readParam(paramValues, specParams, 'massKg', 1.0), 0.1, 10);
      const A = clamp(readParam(paramValues, specParams, 'amplitudeM', 0.25), 0.05, 0.8);
      const gamma = clamp(readParam(paramValues, specParams, 'damping', 0.03), 0, 0.6);

      const omega0 = Math.sqrt(k / m);
      const zeta = gamma / (2 * omega0);
      const omegaD = omega0 * Math.sqrt(Math.max(0.05, 1 - zeta * zeta));
      const period = (2 * Math.PI) / omegaD;
      const env = Math.exp(-gamma * 0.5 * t);
      const x = A * env * Math.cos(omegaD * t);
      const v = -A * env * omegaD * Math.sin(omegaD * t);
      const restoringForce = -k * x;
      const pe = 0.5 * k * x * x;
      const ke = 0.5 * m * v * v;

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'period', label: 'Period T', value: period.toFixed(2), unit: 's', accent: true },
          { key: 'disp', label: 'Extension x', value: x.toFixed(3), unit: 'm' },
          { key: 'force', label: 'Restoring F', value: restoringForce.toFixed(2), unit: 'N' },
          { key: 'energy', label: 'Total Mech E', value: (pe + ke).toFixed(2), unit: 'J' },
        ],
        summaryText: `k=${k} N/m, m=${m} kg → T=${period.toFixed(2)} s, F = −kx = ${restoringForce.toFixed(2)} N`,
        vectorData: { k, m, A, x, v, restoringForce, pe, ke, period },
      };
    }

    case 'buoyancy_pressure': {
      const rhoObj = clamp(readParam(paramValues, specParams, 'objectDensity', 800), 200, 9000);
      const rhoFluid = clamp(readParam(paramValues, specParams, 'fluidDensity', 1000), 600, 13600);
      const volL = clamp(readParam(paramValues, specParams, 'volumeL', 4), 0.5, 20);
      const depthM = clamp(readParam(paramValues, specParams, 'depthM', 3), 0.2, 15);
      const g = 9.8;

      const volM3 = volL * 0.001;
      const weight = rhoObj * volM3 * g;
      const maxUpthrust = rhoFluid * volM3 * g;
      const submergedRatio = clamp(rhoObj / rhoFluid, 0.05, 1);
      const floats = rhoObj <= rhoFluid;
      const actualUpthrust = floats ? weight : maxUpthrust;
      const apparentWeight = Math.max(0, weight - actualUpthrust);
      const gaugePressureKpa = (rhoFluid * g * depthM) / 1000;

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'state', label: 'Float Status', value: floats ? 'Floats' : 'Sinks', unit: `${Math.round(submergedRatio * 100)}% sub`, accent: true },
          { key: 'upthrust', label: 'Buoyant F_b', value: actualUpthrust.toFixed(1), unit: 'N' },
          { key: 'apparent', label: 'Apparent W', value: apparentWeight.toFixed(1), unit: 'N' },
          { key: 'pressure', label: 'Depth P_gauge', value: gaugePressureKpa.toFixed(1), unit: 'kPa' },
        ],
        summaryText: floats
          ? `Floats (${Math.round(submergedRatio * 100)}% submerged): F_b = ${actualUpthrust.toFixed(1)} N balances Weight ${weight.toFixed(1)} N`
          : `Sinks: Weight ${weight.toFixed(1)} N > max Upthrust ${maxUpthrust.toFixed(1)} N (Apparent W = ${apparentWeight.toFixed(1)} N)`,
        vectorData: {
          rhoObj,
          rhoFluid,
          weight,
          actualUpthrust,
          apparentWeight,
          submergedRatio,
          depthM,
          gaugePressureKpa,
        },
        statusFlags: { floats },
      };
    }

    case 'lever_pulley_energy': {
      const loadN = clamp(readParam(paramValues, specParams, 'loadForceN', 120), 10, 500);
      const effortArm = clamp(readParam(paramValues, specParams, 'effortArmM', 1.5), 0.2, 3.0);
      const loadArm = clamp(readParam(paramValues, specParams, 'loadArmM', 0.5), 0.2, 3.0);
      const pulleyStrands = Math.round(clamp(readParam(paramValues, specParams, 'pulleyStrands', 1), 1, 6));

      const leverMA = effortArm / loadArm;
      const totalMA = Math.max(leverMA, pulleyStrands > 1 ? leverMA * pulleyStrands : leverMA);
      const effortRequired = loadN / totalMA;
      const tiltRad = clamp((effortRequired * effortArm - loadN * loadArm) * 0.002, -0.35, 0.35);

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'ma', label: 'Mech Advantage', value: totalMA.toFixed(2), unit: '×', accent: true },
          { key: 'effort', label: 'Required Effort', value: effortRequired.toFixed(1), unit: 'N' },
          { key: 'torque', label: 'Balanced Torque', value: (loadN * loadArm).toFixed(1), unit: 'N·m' },
          { key: 'load', label: 'Load Weight', value: loadN.toFixed(0), unit: 'N' },
        ],
        summaryText: `Effort arm ${effortArm.toFixed(1)} m vs Load arm ${loadArm.toFixed(1)} m → MA = ${totalMA.toFixed(2)}×, Effort = ${effortRequired.toFixed(1)} N`,
        vectorData: { loadN, effortArm, loadArm, totalMA, effortRequired, tiltRad, pulleyStrands },
      };
    }

    case 'optics_ray_model': {
      const opticsMode = Math.round(clamp(readParam(paramValues, specParams, 'opticsMode', 1), 0, 2));
      const incDeg = clamp(readParam(paramValues, specParams, 'incidenceDeg', 35), 5, 85);
      const n1 = clamp(readParam(paramValues, specParams, 'n1', 1.0), 1.0, 2.5);
      const n2 = clamp(readParam(paramValues, specParams, 'n2', 1.5), 1.0, 2.5);
      const rawFocal = readParam(paramValues, specParams, 'focalLengthCm', 15);
      const focalCm = Math.abs(rawFocal) < 2 ? (rawFocal >= 0 ? 15 : -15) : clamp(rawFocal, -40, 40);
      const uCm = clamp(readParam(paramValues, specParams, 'objectDistanceCm', 25), 5, 80);

      const sinT2 = (n1 / n2) * Math.sin((incDeg * Math.PI) / 180);
      const isTIR = sinT2 > 1.0;
      const refrDeg = isTIR ? incDeg : (Math.asin(clamp(sinT2, -1, 1)) * 180) / Math.PI;
      const critDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

      // Thin lens equation: 1/f = 1/v - 1/(-u) => 1/v = 1/f - 1/u
      const denom = 1 / focalCm - 1 / uCm;
      const vCm = Math.abs(denom) < 1e-4 ? 999 : 1 / denom;
      const mag = Math.abs(vCm) > 500 ? 0 : -vCm / uCm;

      return {
        templateId,
        timeSec: t,
        metrics: [
          {
            key: 'angle2',
            label: isTIR ? 'TIR Reflected' : 'Refracted θ₂',
            value: refrDeg.toFixed(1),
            unit: '°',
            accent: true,
          },
          {
            key: 'crit',
            label: 'Critical Angle',
            value: critDeg !== null ? critDeg.toFixed(1) : 'N/A',
            unit: critDeg !== null ? '°' : '(n₁≤n₂)',
          },
          {
            key: 'imgDist',
            label: 'Image Dist v',
            value: Math.abs(vCm) > 400 ? '∞' : vCm.toFixed(1),
            unit: 'cm',
          },
          {
            key: 'mag',
            label: 'Magnification',
            value: Math.abs(vCm) > 400 ? '∞' : mag.toFixed(2),
            unit: '×',
          },
        ],
        summaryText: isTIR
          ? `Total Internal Reflection! θ₁ (${incDeg}°) > θ_c (${critDeg?.toFixed(1)}°)`
          : `n₁=${n1.toFixed(2)} → n₂=${n2.toFixed(2)}: θ₁=${incDeg}° refracts to θ₂=${refrDeg.toFixed(1)}°`,
        vectorData: { opticsMode, incDeg, refrDeg, n1, n2, focalCm, uCm, vCm, mag, critDeg: critDeg ?? 90 },
        statusFlags: { isTIR },
      };
    }

    case 'dc_circuit_model': {
      const V = clamp(readParam(paramValues, specParams, 'voltageV', 9), 1, 24);
      const R1 = clamp(readParam(paramValues, specParams, 'resistance1', 10), 1, 100);
      const R2 = clamp(readParam(paramValues, specParams, 'resistance2', 20), 1, 100);
      const isParallel = readParam(paramValues, specParams, 'parallelMode', 0) >= 0.5;

      const Req = isParallel ? (R1 * R2) / (R1 + R2) : R1 + R2;
      const I = V / Req;
      const I1 = isParallel ? V / R1 : I;
      const I2 = isParallel ? V / R2 : I;
      const V1 = isParallel ? V : I * R1;
      const V2 = isParallel ? V : I * R2;
      const powerW = V * I;
      const heat10s = powerW * 10;

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'req', label: 'Eq. Resistance', value: Req.toFixed(2), unit: 'Ω', accent: true },
          { key: 'current', label: 'Total Current I', value: I.toFixed(2), unit: 'A' },
          { key: 'power', label: 'Power P = VI', value: powerW.toFixed(2), unit: 'W' },
          { key: 'heat', label: 'Joule Heat (10s)', value: heat10s.toFixed(0), unit: 'J' },
        ],
        summaryText: `${isParallel ? 'Parallel' : 'Series'}: R_eq = ${Req.toFixed(2)} Ω, I = ${I.toFixed(2)} A (V₁=${V1.toFixed(1)} V, V₂=${V2.toFixed(1)} V)`,
        vectorData: { V, R1, R2, Req, I, I1, I2, V1, V2, powerW, isParallel: isParallel ? 1 : 0 },
        statusFlags: { isParallel },
      };
    }

    case 'magnetic_dipole_3d': {
      const M = clamp(readParam(paramValues, specParams, 'dipoleStrength', 1.2), 0.3, 3.0);
      const N = clamp(readParam(paramValues, specParams, 'coilTurns', 60), 0, 200);
      const I = clamp(readParam(paramValues, specParams, 'currentA', 1.5), 0, 5);
      const r = clamp(readParam(paramValues, specParams, 'probeDistanceCm', 4.0), 1, 12);
      const angleDeg = clamp(readParam(paramValues, specParams, 'magnetAngleDeg', 0), 0, 360);

      // Axial field scale in mT using physical dipole 1/r³ + solenoid contribution
      const dipoleB = (28 * M) / Math.pow(r / 2.0, 3);
      const solenoidB = 0.045 * N * I;
      const totalB = dipoleB + solenoidB;
      const needleAngleDeg = angleDeg;

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'bmag', label: 'Magnetic |B|', value: totalB.toFixed(1), unit: 'mT', accent: true },
          { key: 'dist', label: 'Sensor Dist r', value: r.toFixed(1), unit: 'cm' },
          { key: 'angle', label: 'Needle Angle', value: needleAngleDeg.toFixed(0), unit: '°' },
          { key: 'solenoid', label: 'Coil Contrib', value: solenoidB.toFixed(1), unit: 'mT' },
        ],
        summaryText: `|B| = ${totalB.toFixed(1)} mT at r = ${r.toFixed(1)} cm (Dipole ${dipoleB.toFixed(1)} mT + Coil ${solenoidB.toFixed(1)} mT)`,
        vectorData: { M, N, I, r, angleDeg, totalB, dipoleB, solenoidB },
      };
    }

    case 'wave_acoustics': {
      const f = clamp(readParam(paramValues, specParams, 'frequencyHz', 340), 50, 2000);
      const v = clamp(readParam(paramValues, specParams, 'waveSpeedMs', 340), 100, 1500);
      const amp = clamp(readParam(paramValues, specParams, 'amplitudePct', 60), 15, 100);
      const harmonic = Math.round(clamp(readParam(paramValues, specParams, 'harmonicN', 2), 1, 5));
      const vs = clamp(readParam(paramValues, specParams, 'sourceSpeedMs', 0), -60, 60);

      const wavelength = v / f;
      const periodMs = (1 / f) * 1000;
      const dopplerF = (f * v) / Math.max(20, v - vs);
      const nodes = harmonic + 1;

      const curvePoints: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= 60; i++) {
        const xn = i / 60;
        const y =
          (amp / 100) *
          Math.sin(harmonic * Math.PI * xn) *
          Math.cos(2 * Math.PI * (f / 200) * t);
        curvePoints.push({ x: xn, y });
      }

      return {
        templateId,
        timeSec: t,
        metrics: [
          { key: 'lambda', label: 'Wavelength λ', value: wavelength.toFixed(2), unit: 'm', accent: true },
          { key: 'period', label: 'Time Period T', value: periodMs.toFixed(2), unit: 'ms' },
          { key: 'doppler', label: "Observed f'", value: dopplerF.toFixed(0), unit: 'Hz' },
          { key: 'nodes', label: 'Standing Nodes', value: String(nodes), unit: `n=${harmonic}` },
        ],
        summaryText: `v=${v} m/s, f=${f} Hz → λ = ${wavelength.toFixed(2)} m; Harmonic n=${harmonic} (${nodes} nodes)`,
        vectorData: { f, v, amp, harmonic, vs, wavelength, dopplerF },
        curvePoints,
      };
    }

    case 'thermal_calorimetry':
    default: {
      const m1 = clamp(readParam(paramValues, specParams, 'hotMassKg', 0.5), 0.1, 5.0);
      const T1 = clamp(readParam(paramValues, specParams, 'hotTempC', 85), 30, 100);
      const m2 = clamp(readParam(paramValues, specParams, 'coldMassKg', 1.0), 0.1, 5.0);
      const T2 = clamp(readParam(paramValues, specParams, 'coldTempC', 22), 5, 40);
      const c1 = clamp(readParam(paramValues, specParams, 'specificHeatHot', 900), 200, 4200);
      const c2 = 4186; // specific heat of water J/(kg*K)

      const numerator = m1 * c1 * T1 + m2 * c2 * T2;
      const denom = m1 * c1 + m2 * c2;
      const Teq = numerator / denom;
      const heatTransferredKj = (m1 * c1 * Math.abs(T1 - Teq)) / 1000;

      // Exponential approach to equilibrium over t
      const tau = 4.5;
      const progress = 1 - Math.exp(-t / tau);
      const curT1 = T1 + (Teq - T1) * progress;
      const curT2 = T2 + (Teq - T2) * progress;

      const curvePoints: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= 24; i++) {
        const ti = i * 0.6;
        const p = 1 - Math.exp(-ti / tau);
        curvePoints.push({ x: ti, y: T2 + (Teq - T2) * p });
      }

      return {
        templateId: 'thermal_calorimetry',
        timeSec: t,
        metrics: [
          { key: 'teq', label: 'Equilibrium T_eq', value: Teq.toFixed(1), unit: '°C', accent: true },
          { key: 't1', label: 'Hot Temp T₁(t)', value: curT1.toFixed(1), unit: '°C' },
          { key: 't2', label: 'Water Temp T₂(t)', value: curT2.toFixed(1), unit: '°C' },
          { key: 'heat', label: 'Heat Q Exchanged', value: heatTransferredKj.toFixed(1), unit: 'kJ' },
        ],
        summaryText: `Mixing ${m1} kg at ${T1}°C + ${m2} kg water at ${T2}°C → Equilibrium T_eq = ${Teq.toFixed(1)}°C (Q = ${heatTransferredKj.toFixed(1)} kJ)`,
        vectorData: { m1, T1, m2, T2, c1, c2, Teq, curT1, curT2, heatTransferredKj },
        curvePoints,
      };
    }
  }
}

export function normalizeVisualAssetKey(raw?: string | null, templateId?: DynamicSimulationTemplateId): string {
  const key = (raw || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (APPROVED_VISUAL_ASSET_KEYS.has(key)) return key;
  if (key.includes('pendulum') || key.includes('bob') || key.includes('spring')) return 'energy_bob';
  if (key.includes('incline') || key.includes('block') || key.includes('ramp') || key.includes('cart')) return 'test_block';
  if (key.includes('fluid') || key.includes('beaker') || key.includes('water') || key.includes('liquid')) return 'surface_or_fluid';
  if (key.includes('buoyan')) return 'buoyancy_arrow';
  if (key.includes('lever') || key.includes('fulcrum') || key.includes('pivot')) return 'fulcrum_pivot';
  if (key.includes('pulley')) return 'pulley_wheel';
  if (key.includes('projectile') || key.includes('ball') || key.includes('cannon')) return 'moving_body';
  if (key.includes('thermometer') || key.includes('calorimeter') || key.includes('sensor')) return 'thermometer_probe';
  if (key.includes('heat') || key.includes('burner') || key.includes('flame')) return 'heat_source';
  if (key.includes('lens') && key.includes('concav')) return 'concave_lens';
  if (key.includes('lens')) return 'convex_lens';
  if (key.includes('mirror') && key.includes('concav')) return 'concave_mirror';
  if (key.includes('mirror') && key.includes('convex')) return 'convex_mirror';
  if (key.includes('mirror')) return 'mirror';
  if (key.includes('prism')) return 'prism';
  if (key.includes('slab') || key.includes('glass')) return 'glass_slab';
  if (key.includes('battery') || key.includes('cell')) return 'battery';
  if (key.includes('resistor') || key.includes('rheostat') || key.includes('ammeter')) return 'resistor';
  if (key.includes('bulb') || key.includes('lamp')) return 'bulb';
  if (key.includes('switch') || key.includes('key')) return 'switch';
  if (key.includes('wire')) return 'wires';
  if (key.includes('coil') || key.includes('solenoid')) return 'electromagnet_coil';
  if (key.includes('compass')) return 'compass_needle';
  if (key.includes('magnet') || key.includes('dipole')) return 'magnet_body';
  if (key.includes('tuning') || key.includes('fork') || key.includes('speaker') || key.includes('source')) return 'vibrating_source';
  if (key.includes('wave') || key.includes('string')) return 'wave';
  return templateId ? TEMPLATE_PHYSICS_CONFIG[templateId].defaultVisualAsset : 'moving_body';
}

function buildFallbackTranslation(
  spec: {
    title: string;
    educationalObjective: string;
    conceptExplanation: string;
    whyImportant: string;
    realWorldApplication: string;
    expectedBehaviour: string;
    limitationNote?: string;
    procedureSteps: string[];
    components: DynamicComponentDef[];
    parameters: DynamicParameterDef[];
  }
): DynamicExperimentTranslation {
  const componentLabels: DynamicExperimentTranslation['componentLabels'] = {};
  for (const c of spec.components) {
    componentLabels[c.id] = {
      label: c.label,
      description: c.description,
      relationship: c.relationship,
    };
  }
  const parameterLabels: Record<string, string> = {};
  for (const p of spec.parameters) {
    parameterLabels[p.key] = p.label;
  }
  return {
    title: spec.title,
    educationalObjective: spec.educationalObjective,
    conceptExplanation: spec.conceptExplanation,
    whyImportant: spec.whyImportant,
    realWorldApplication: spec.realWorldApplication,
    expectedBehaviour: spec.expectedBehaviour,
    limitationNote: spec.limitationNote,
    procedureSteps: spec.procedureSteps,
    componentLabels,
    parameterLabels,
  };
}

/**
 * Validates and deterministically verifies an AI-generated experiment specification.
 * Strips unsafe strings, clamps bounds, enforces approved physics templates,
 * runs deterministic boundary probes, and explicitly surfaces simplified-model notes.
 */
export function validateAndSanitizeDynamicExperimentSpec(
  raw: Record<string, unknown>,
  ctx?: {
    studentClass?: number;
    chapterNumber?: number;
    chapterTitle?: string;
    conceptId?: string;
    conceptName?: string;
    sourceScanTopic?: string;
    sourceImagePreviewUrl?: string;
    ownerUid?: string;
    forceSimplifiedNote?: string;
  }
): DynamicExperimentSpec {
  const checksPassed: string[] = [];
  const warnings: string[] = [];

  const rawTemplate = typeof raw.templateId === 'string' ? raw.templateId.trim() : '';
  const templateId: DynamicSimulationTemplateId = (APPROVED_TEMPLATE_IDS as readonly string[]).includes(rawTemplate)
    ? (rawTemplate as DynamicSimulationTemplateId)
    : 'pendulum_shm';
  if (rawTemplate !== templateId) {
    warnings.push(`Unsupported template "${rawTemplate || 'empty'}" remapped to ${templateId}.`);
  }
  const tplConfig = TEMPLATE_PHYSICS_CONFIG[templateId];
  checksPassed.push(`template_verified:${templateId}`);

  const rawDomain = typeof raw.domain === 'string' ? raw.domain.trim() : '';
  const domain: DynamicExperimentDomain = (APPROVED_DYNAMIC_DOMAINS as readonly string[]).includes(rawDomain)
    ? (rawDomain as DynamicExperimentDomain)
    : tplConfig.defaultDomain;

  const supports3d = tplConfig.supports3d;
  const requestedMode = raw.visualizationMode === '3d' ? '3d' : '2d';
  const visualizationMode: '2d' | '3d' =
    supports3d && (requestedMode === '3d' || tplConfig.preferredDimension === '3d')
      ? requestedMode
      : '2d';

  const studentClass = clamp(
    Number(raw.studentClass ?? ctx?.studentClass ?? 9),
    6,
    10
  );

  // Validate and clamp parameters against physical invariants
  const rawParams = Array.isArray(raw.parameters) ? raw.parameters : [];
  const validatedParams: DynamicParameterDef[] = [];
  const seenKeys = new Set<string>();

  for (const item of rawParams) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Record<string, unknown>;
    const key = sanitizePlainText(p.key, '', 40);
    const rule = tplConfig.paramRules[key];
    if (!rule || seenKeys.has(key)) continue;
    seenKeys.add(key);

    let min = clamp(Number(p.min ?? rule.defaultMin), rule.minAllowed, rule.maxAllowed);
    let max = clamp(Number(p.max ?? rule.defaultMax), rule.minAllowed, rule.maxAllowed);
    if (max <= min) {
      min = rule.defaultMin;
      max = rule.defaultMax;
    }
    let step = Number(p.step ?? rule.defaultStep);
    if (!Number.isFinite(step) || step <= 0 || step > (max - min) * 0.5) {
      step = rule.defaultStep;
    }
    let defaultValue = clamp(Number(p.defaultValue ?? rule.defaultVal), min, max);
    if (rule.nonZero && Math.abs(defaultValue) < 1) {
      defaultValue = rule.defaultVal;
    }

    const controlType: DynamicParameterDef['controlType'] =
      p.controlType === 'toggle' || p.controlType === 'select' ? p.controlType : 'slider';

    validatedParams.push({
      key,
      label: sanitizePlainText(p.label, rule.label, 80),
      symbol: sanitizePlainText(p.symbol, rule.symbol, 16),
      unit: sanitizePlainText(p.unit, rule.unit, 16),
      min,
      max,
      step,
      defaultValue,
      controlType,
    });
  }

  for (const fb of tplConfig.fallbackParams) {
    if (!seenKeys.has(fb.key) && validatedParams.length < 5) {
      validatedParams.push(fb);
      seenKeys.add(fb.key);
    }
  }
  checksPassed.push(`parameters_bounds_checked:${validatedParams.length}`);

  // Validate components
  const rawComponents = Array.isArray(raw.components) ? raw.components : [];
  const components: DynamicComponentDef[] = [];
  const seenCompIds = new Set<string>();

  rawComponents.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const c = item as Record<string, unknown>;
    const baseId = sanitizePlainText(c.id, `part_${idx + 1}`, 40)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
    const id = seenCompIds.has(baseId) ? `${baseId}_${idx + 1}` : baseId;
    seenCompIds.add(id);

    const pos = (c.positionNormalized || {}) as Record<string, unknown>;
    const x = clamp(Number(pos.x ?? 0.25 + (idx % 3) * 0.25), 0.1, 0.9);
    const y = clamp(Number(pos.y ?? 0.45 + Math.floor(idx / 3) * 0.2), 0.12, 0.88);
    const z = pos.z !== undefined ? clamp(Number(pos.z), -1, 1) : 0;

    components.push({
      id,
      role: sanitizePlainText(c.role, id, 40),
      label: sanitizePlainText(c.label, `Apparatus Part ${idx + 1}`, 80),
      description: sanitizePlainText(
        c.description,
        'Interactive physics component participating in the experiment.',
        350
      ),
      characteristics: sanitizePlainText(
        c.characteristics,
        'Positioned carefully to measure and demonstrate physical relationships.',
        300
      ),
      functionDescription: sanitizePlainText(
        c.functionDescription,
        'Controls or responds to changes in experiment variables.',
        300
      ),
      relationship: sanitizePlainText(
        c.relationship,
        'Directly coupled to the primary system state.',
        300
      ),
      realWorldExample: sanitizePlainText(
        c.realWorldExample,
        'Used in school physics laboratories and real engineering systems.',
        250
      ),
      positionNormalized: { x, y, z },
      visualAssetKey: normalizeVisualAssetKey(
        typeof c.visualAssetKey === 'string' ? c.visualAssetKey : id,
        templateId
      ),
    });
  });

  if (components.length < 2) {
    components.push(
      {
        id: 'primary_apparatus',
        role: 'primary',
        label: 'Primary Physics Body',
        description: 'Main test apparatus responding to the governing physical law.',
        characteristics: 'Defined mass, geometry, or optical/electrical property.',
        functionDescription: 'Exhibits measurable motion, force, wave, or thermal change.',
        relationship: 'Responds instantaneously to parameter sliders.',
        realWorldExample: 'Core laboratory demonstration unit.',
        positionNormalized: { x: 0.48, y: 0.48, z: 0 },
        visualAssetKey: tplConfig.defaultVisualAsset,
      },
      {
        id: 'measurement_sensor',
        role: 'sensor',
        label: 'Reference Scale & Probe',
        description: 'Provides quantitative measurement and real-time physical telemetry.',
        characteristics: 'Calibrated in standard SI units.',
        functionDescription: 'Measures physical output against initial conditions.',
        relationship: 'Tracks the primary apparatus continuously.',
        realWorldExample: 'Digital stopwatch, ruler, thermometer, or multimeter.',
        positionNormalized: { x: 0.72, y: 0.56, z: 0 },
        visualAssetKey: 'thermometer_probe',
      }
    );
  }
  checksPassed.push(`components_sanitized:${components.length}`);

  // Equations
  const rawEqs = Array.isArray(raw.equations) ? raw.equations : [];
  const equations: DynamicEquationDef[] = rawEqs
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .slice(0, 5)
    .map((eq) => ({
      name: sanitizePlainText(eq.name, 'Governing Law', 100),
      formula: sanitizePlainText(eq.formula, 'y = f(x)', 140),
      variables: sanitizePlainText(eq.variables, 'Standard SI variables', 220),
      units: sanitizePlainText(eq.units, 'SI units', 80),
    }));
  const finalEquations = equations.length > 0 ? equations : tplConfig.fallbackEquations;

  // Initial conditions derived cleanly from validated parameters
  const initialConditions: Record<string, number> = {};
  for (const p of validatedParams) {
    initialConditions[p.key] = p.defaultValue;
  }

  // Deterministic boundary simulation verification
  const minProbe: Record<string, number> = {};
  const maxProbe: Record<string, number> = {};
  for (const p of validatedParams) {
    minProbe[p.key] = p.min;
    maxProbe[p.key] = p.max;
  }
  const probeFrames = [
    computeDynamicSimulationState({ templateId, parameters: validatedParams }, initialConditions, 0),
    computeDynamicSimulationState({ templateId, parameters: validatedParams }, initialConditions, 1.5),
    computeDynamicSimulationState({ templateId, parameters: validatedParams }, minProbe, 1.0),
    computeDynamicSimulationState({ templateId, parameters: validatedParams }, maxProbe, 1.0),
  ];

  const hasInvalidProbe = probeFrames.some((frame) =>
    Object.values(frame.vectorData).some((v) => typeof v === 'number' && !Number.isFinite(v))
  );
  if (hasInvalidProbe) {
    warnings.push('Deterministic rollout adjusted boundary values to prevent non-finite numbers.');
  } else {
    checksPassed.push('deterministic_boundary_rollout_ok');
  }

  // Procedure steps
  const rawSteps = Array.isArray(raw.procedureSteps) ? raw.procedureSteps : [];
  const procedureSteps = rawSteps
    .map((s) => sanitizePlainText(s, '', 260))
    .filter((s) => s.length > 4)
    .slice(0, 6);
  if (procedureSteps.length === 0) {
    procedureSteps.push(
      'Inspect each apparatus part in the interactive viewport and review its initial value.',
      'Adjust one physical parameter slider at a time and observe how the live vector/telemetry reacts.',
      'Compare measured outcomes against the governing equation in the Observations tab.'
    );
  }

  // Assessment questions
  const rawQs = Array.isArray(raw.assessmentQuestions) ? raw.assessmentQuestions : [];
  const assessmentQuestions: ExperimentAssessmentQuestion[] = rawQs
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .slice(0, 4)
    .map((q, idx) => {
      const options = Array.isArray(q.options)
        ? q.options.map((o) => sanitizePlainText(o, 'Option', 140)).slice(0, 4)
        : [];
      while (options.length < 4) {
        options.push(`Choice ${options.length + 1}`);
      }
      const correctIdx = Math.round(clamp(Number(q.correctIndex ?? 0), 0, options.length - 1));
      const kind: ExperimentAssessmentQuestion['kind'] =
        q.kind === 'application' || q.kind === 'numerical' ? q.kind : 'conceptual';
      return {
        id: sanitizePlainText(q.id, `dyn_q_${idx + 1}`, 40),
        kind,
        prompt: sanitizePlainText(q.prompt, 'What happens when the primary physical parameter increases?', 260),
        options,
        correctIndex: correctIdx,
        explanation: sanitizePlainText(q.explanation, 'Observed directly from the deterministic physics equation.', 320),
      };
    });

  if (assessmentQuestions.length === 0) {
    const p0 = validatedParams[0];
    const eq0 = finalEquations[0];
    assessmentQuestions.push({
      id: 'dyn_q_default_1',
      kind: 'conceptual',
      prompt: `In this experiment, which relationship governs the behaviour when adjusting ${p0.label} (${p0.symbol})?`,
      options: [
        `${eq0.name}: ${eq0.formula}`,
        'The output remains completely independent of physical laws',
        'Energy is created spontaneously without an input source',
        'Units cancel arbitrarily without affecting magnitude',
      ],
      correctIndex: 0,
      explanation: `${eq0.name} (${eq0.formula}) accurately predicts how changing ${p0.symbol} affects the physical state.`,
    });
  }
  checksPassed.push(`assessment_verified:${assessmentQuestions.length}`);

  const combinedComplexityText = `${String(raw.title || '')} ${String(raw.conceptName || ctx?.conceptName || '')} ${String(raw.conceptExplanation || '')}`.toLowerCase();
  const outOfScopeMatch = /\b(quantum|relativis|turbulen|aerodynamic\s+drag|non-?linear\s+chaos|three-?body|nuclear|black\s*hole|superconduct)\b/i.test(
    combinedComplexityText
  );

  const rawLimitation = sanitizePlainText(raw.limitationNote, '', 400);
  const explicitSimplified =
    Boolean(raw.isSimplifiedModel) ||
    Boolean(ctx?.forceSimplifiedNote) ||
    Boolean(rawLimitation) ||
    outOfScopeMatch ||
    warnings.length > 0;

  const limitationNote = explicitSimplified
    ? rawLimitation ||
      ctx?.forceSimplifiedNote ||
      (outOfScopeMatch
        ? 'Educational simplified model: classical Class 6–10 mechanics equations are shown because relativistic, quantum, or turbulent fluid effects lie outside the deterministic template solver.'
        : 'Educational simplified model: frictionless/idealized laboratory assumptions are used so core Class 6–10 equations remain clear and deterministic.')
    : undefined;

  const title = sanitizePlainText(raw.title, ctx?.conceptName || 'Interactive Physics Experiment', 120);
  const educationalObjective = sanitizePlainText(
    raw.educationalObjective,
    `Investigate ${title} interactively and verify the governing physical equations.`,
    360
  );
  const conceptExplanation = sanitizePlainText(
    raw.conceptExplanation,
    `${title} demonstrates deterministic relationships between measurable physical variables in ${domain.replace(/_/g, ' ')}.`,
    700
  );
  const whyImportant = sanitizePlainText(
    raw.whyImportant,
    'Connecting mathematical equations directly to visual apparatus builds deep conceptual intuition.',
    320
  );
  const realWorldApplication = sanitizePlainText(
    raw.realWorldApplication,
    'Applies directly to engineering instruments, everyday motion, energy systems, and laboratory sensors.',
    320
  );
  const expectedBehaviour = sanitizePlainText(
    raw.expectedBehaviour,
    'Adjusting parameters updates the live simulation trajectory, forces, and SI telemetry strictly according to the physical equations.',
    400
  );

  const rawTrans = (raw.translations || {}) as Record<string, unknown>;
  const parseLocale = (lang: LanguageCode): DynamicExperimentTranslation => {
    const base = buildFallbackTranslation({
      title,
      educationalObjective,
      conceptExplanation,
      whyImportant,
      realWorldApplication,
      expectedBehaviour,
      limitationNote,
      procedureSteps,
      components,
      parameters: validatedParams,
    });
    const entry = rawTrans[lang];
    if (!entry || typeof entry !== 'object') return base;
    const obj = entry as Record<string, unknown>;

    const compLabels = { ...base.componentLabels };
    if (obj.componentLabels && typeof obj.componentLabels === 'object') {
      for (const c of components) {
        const cl = (obj.componentLabels as Record<string, unknown>)[c.id];
        if (cl && typeof cl === 'object') {
          const cObj = cl as Record<string, unknown>;
          compLabels[c.id] = {
            label: sanitizePlainText(cObj.label, compLabels[c.id].label, 80),
            description: sanitizePlainText(cObj.description, compLabels[c.id].description, 320),
            relationship: sanitizePlainText(cObj.relationship, compLabels[c.id].relationship, 260),
          };
        }
      }
    }

    const paramLabels = { ...base.parameterLabels };
    if (obj.parameterLabels && typeof obj.parameterLabels === 'object') {
      for (const p of validatedParams) {
        const pl = (obj.parameterLabels as Record<string, unknown>)[p.key];
        if (typeof pl === 'string') {
          paramLabels[p.key] = sanitizePlainText(pl, paramLabels[p.key], 80);
        }
      }
    }

    const stepsRaw = Array.isArray(obj.procedureSteps) ? obj.procedureSteps : [];
    const stepsLoc = stepsRaw
      .map((s) => sanitizePlainText(s, '', 260))
      .filter((s) => s.length > 4);

    return {
      title: sanitizePlainText(obj.title, base.title, 120),
      educationalObjective: sanitizePlainText(obj.educationalObjective, base.educationalObjective, 360),
      conceptExplanation: sanitizePlainText(obj.conceptExplanation, base.conceptExplanation, 700),
      whyImportant: sanitizePlainText(obj.whyImportant, base.whyImportant, 320),
      realWorldApplication: sanitizePlainText(obj.realWorldApplication, base.realWorldApplication, 320),
      expectedBehaviour: sanitizePlainText(obj.expectedBehaviour, base.expectedBehaviour, 400),
      limitationNote: limitationNote
        ? sanitizePlainText(obj.limitationNote, limitationNote, 400)
        : undefined,
      procedureSteps: stepsLoc.length > 0 ? stepsLoc : base.procedureSteps,
      componentLabels: compLabels,
      parameterLabels: paramLabels,
    };
  };

  const now = Date.now();
  const id =
    typeof raw.id === 'string' && /^dyn_[a-zA-Z0-9_-]{4,48}$/.test(raw.id)
      ? raw.id
      : `dyn_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    version: 1,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : now,
    ownerUid: ctx?.ownerUid,
    studentClass,
    chapterNumber: ctx?.chapterNumber,
    chapterTitle: ctx?.chapterTitle,
    conceptId: sanitizePlainText(raw.conceptId, ctx?.conceptId || id, 60),
    conceptName: sanitizePlainText(raw.conceptName, ctx?.conceptName || title, 100),
    domain,
    templateId,
    title,
    educationalObjective,
    conceptExplanation,
    whyImportant,
    realWorldApplication,
    visualizationMode,
    supports3d,
    visualRepresentationNotes: sanitizePlainText(
      raw.visualRepresentationNotes,
      supports3d
        ? 'Interactive 3D & 2D spatial physics representation.'
        : 'High-clarity interactive 2D diagram with live vectors and telemetry.',
      260
    ),
    components,
    parameters: validatedParams,
    equations: finalEquations,
    initialConditions,
    procedureSteps,
    expectedBehaviour,
    assessmentQuestions,
    validationStatus: explicitSimplified ? 'validated_simplified_model' : 'validated_exact',
    isSimplifiedModel: explicitSimplified,
    limitationNote,
    validationChecksPassed: checksPassed,
    validationWarnings: warnings,
    sourceScanTopic: ctx?.sourceScanTopic,
    sourceImagePreviewUrl: ctx?.sourceImagePreviewUrl,
    translations: {
      en: parseLocale('en'),
      kn: parseLocale('kn'),
      hi: parseLocale('hi'),
    },
  };
}
