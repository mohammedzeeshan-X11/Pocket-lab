import type {
  AdaptiveSimulationConfig,
  AdaptiveSimulationId,
  CurriculumTopicArea,
  ExperimentCatalogItem,
  GradeClassLevel,
  SimulationEngineId,
  SimulationMode,
} from '../types/physics';

export const REGISTERED_SIMULATION_IDS = [
  'bar_magnet',
  'magnetic_field',
  'projectile_motion',
  'reflection',
  'refraction',
  'simple_electric_circuit',
] as const;

export type RegisteredSimulationId = (typeof REGISTERED_SIMULATION_IDS)[number];

export interface SimulationRegistryEntry {
  id: RegisteredSimulationId;
  label: string;
  implemented: boolean;
  labTarget?: 'magnetism';
  engineId?: SimulationEngineId;
}

export const SIMULATION_REGISTRY: Record<RegisteredSimulationId, SimulationRegistryEntry> = {
  bar_magnet: {
    id: 'bar_magnet',
    label: 'Magnetic Field Around a Bar Magnet (2D & 3D)',
    implemented: true,
    labTarget: 'magnetism',
    engineId: 'bar_magnet',
  },
  magnetic_field: {
    id: 'magnetic_field',
    label: 'Magnetic Field & Electromagnetism',
    implemented: true,
    engineId: 'electric_circuit_lab',
  },
  projectile_motion: {
    id: 'projectile_motion',
    label: 'Motion & Kinematics Trajectory',
    implemented: true,
    engineId: 'motion_kinematics',
  },
  reflection: {
    id: 'reflection',
    label: 'Reflection of Light & Mirrors',
    implemented: true,
    engineId: 'optics_ray_lab',
  },
  refraction: {
    id: 'refraction',
    label: 'Refraction Through Glass Slabs & Lenses',
    implemented: true,
    engineId: 'optics_ray_lab',
  },
  simple_electric_circuit: {
    id: 'simple_electric_circuit',
    label: 'Simple Electric Circuit & Ohm’s Law',
    implemented: true,
    engineId: 'electric_circuit_lab',
  },
};

export function resolveRegisteredSimulation(simulationId?: string | null): {
  simulationId: RegisteredSimulationId | 'none';
  supported: boolean;
  entry: SimulationRegistryEntry | null;
} {
  if (!simulationId) {
    return { simulationId: 'none', supported: false, entry: null };
  }
  const normalized = simulationId.trim().toLowerCase() as RegisteredSimulationId;
  const entry = SIMULATION_REGISTRY[normalized];
  if (!entry) {
    return { simulationId: 'none', supported: false, entry: null };
  }
  return {
    simulationId: entry.id,
    supported: entry.implemented,
    entry,
  };
}

// ---------------------------------------------------------------------------
// Prompt 05: Centralized Reusable Simulation Engine Registry (No Duplicates)
// ---------------------------------------------------------------------------

export interface SimulationParameterDescriptor {
  key: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
}

export interface SimulationEngineDescriptor {
  id: SimulationEngineId;
  name: string;
  supportedModes: SimulationMode[];
  componentKey:
    | 'MagnetismDualEngine'
    | 'MotionKinematicsCanvas'
    | 'ForceBuoyancyCanvas'
    | 'SimpleMachinesEnergyCanvas'
    | 'HeatTransferCanvas'
    | 'OpticsRayCanvas'
    | 'SoundWaveCanvas'
    | 'ElectricCircuitCanvas';
  implemented: boolean;
  physicsModelSummary: string;
  selectableComponentIds: string[];
  adjustableParameters: SimulationParameterDescriptor[];
  explanationMetadata: string;
  supportedClasses: GradeClassLevel[];
  relatedTopics: CurriculumTopicArea[];
}

export const SIMULATION_ENGINE_REGISTRY: Record<
  SimulationEngineId,
  SimulationEngineDescriptor
> = {
  bar_magnet: {
    id: 'bar_magnet',
    name: 'Bar Magnet Dipole & Compass Lab',
    supportedModes: ['2d', '3d'],
    componentKey: 'MagnetismDualEngine',
    implemented: true,
    physicsModelSummary:
      'Dipole field B = (μ₀/4π)[3(m·r̂)r̂ − m]/r³ with continuous closed flux loops and compass torque τ = m × B.',
    selectableComponentIds: [
      'north_pole',
      'south_pole',
      'magnet_body',
      'field_lines',
      'field_direction_arrows',
      'compass_needle',
      'compass_pivot',
    ],
    adjustableParameters: [
      { key: 'magnetAngleDeg', label: 'Magnet Rotation', unit: '°', min: 0, max: 360, step: 1 },
      { key: 'strength', label: 'Magnetic Strength', unit: '×', min: 0.3, max: 2.4, step: 0.1 },
    ],
    explanationMetadata:
      'Reused across Class 6 magnet basics and Class 10 magnetic field line density & dipole behaviour.',
    supportedClasses: [6, 10],
    relatedTopics: ['electricity_magnetism'],
  },
  motion_kinematics: {
    id: 'motion_kinematics',
    name: 'Kinematics, Motion Graphs & Measurement Engine',
    supportedModes: ['2d'],
    componentKey: 'MotionKinematicsCanvas',
    implemented: true,
    physicsModelSummary:
      'Uniform & accelerated 1D kinematics (v = u + at, s = ut + ½at²), circular motion angular speed ω, and pendulum period T = 2π√(L/g).',
    selectableComponentIds: [
      'moving_body',
      'reference_origin',
      'distance_path',
      'displacement_vector',
      'motion_graph',
      'velocity_vector',
    ],
    adjustableParameters: [
      { key: 'initialSpeed', label: 'Initial Speed (u)', unit: 'm/s', min: 0, max: 12, step: 0.5 },
      { key: 'acceleration', label: 'Acceleration (a)', unit: 'm/s²', min: -3, max: 4, step: 0.25 },
      { key: 'pathLength', label: 'Scale / Radius', unit: 'm', min: 2, max: 10, step: 0.5 },
    ],
    explanationMetadata:
      'Single kinematics & timing engine serving length measurement (Class 6), speed & time-period (Class 7), and velocity/acceleration graphs (Class 9).',
    supportedClasses: [6, 7, 9],
    relatedTopics: ['motion_measurement'],
  },
  force_friction_buoyancy: {
    id: 'force_friction_buoyancy',
    name: 'Forces, Friction, Pressure & Buoyancy Engine',
    supportedModes: ['2d'],
    componentKey: 'ForceBuoyancyCanvas',
    implemented: true,
    physicsModelSummary:
      'Newtonian net force F_net = F_app − μN, acceleration a = F_net/m, hydrostatic pressure P = ρgh, and Archimedes buoyant force F_b = ρ_f V_sub g.',
    selectableComponentIds: [
      'test_block',
      'applied_force_arrow',
      'friction_force_arrow',
      'buoyancy_arrow',
      'surface_or_fluid',
    ],
    adjustableParameters: [
      { key: 'appliedForce', label: 'Applied Force / Object Density', unit: '', min: 0, max: 60, step: 2 },
      { key: 'massKg', label: 'Mass / Contact Area', unit: 'kg', min: 1, max: 10, step: 0.5 },
      { key: 'frictionCoeff', label: 'Surface Friction (μ) / Depth', unit: '', min: 0.05, max: 0.65, step: 0.05 },
    ],
    explanationMetadata:
      'Reused across Class 8 Exploring Forces & Pressure and Class 9 Laws of Motion & Archimedes Principle.',
    supportedClasses: [8, 9],
    relatedTopics: ['force_mechanics'],
  },
  simple_machines_energy: {
    id: 'simple_machines_energy',
    name: 'Work, Energy Conservation & Simple Machines Engine',
    supportedModes: ['2d'],
    componentKey: 'SimpleMachinesEnergyCanvas',
    implemented: true,
    physicsModelSummary:
      'Mechanical energy conservation E = PE + KE = mgh + ½mv², work W = F·d, and mechanical advantage MA = Load / Effort.',
    selectableComponentIds: [
      'energy_bob',
      'track_height_marker',
      'ke_pe_meter',
      'fulcrum_pivot',
      'pulley_wheel',
    ],
    adjustableParameters: [
      { key: 'massKg', label: 'Mass / Load', unit: 'kg', min: 1, max: 10, step: 0.5 },
      { key: 'releaseHeight', label: 'Height / Effort Arm', unit: 'm', min: 1, max: 8, step: 0.5 },
      { key: 'damping', label: 'Track Friction / Pulleys', unit: '', min: 0, max: 5, step: 1 },
    ],
    explanationMetadata:
      'Covers Class 7 Simple Pendulum Time Period and Class 9 Work, Energy & Simple Machines (energy transformation, levers, and pulley systems).',
    supportedClasses: [7, 9],
    relatedTopics: ['work_energy_machines', 'motion_measurement'],
  },
  heat_transfer_lab: {
    id: 'heat_transfer_lab',
    name: 'Temperature & Heat Transfer (Conduction, Convection, Radiation)',
    supportedModes: ['2d'],
    componentKey: 'HeatTransferCanvas',
    implemented: true,
    physicsModelSummary:
      'Thermal scale conversions (°C ↔ K ↔ °F), Fourier conduction along metals vs insulators, buoyant convection plumes, and surface radiation absorption.',
    selectableComponentIds: [
      'heat_source',
      'conducting_rod',
      'thermometer_probe',
      'convection_fluid',
      'radiating_surface',
    ],
    adjustableParameters: [
      { key: 'heaterTempC', label: 'Source Temperature', unit: '°C', min: 30, max: 100, step: 2 },
      { key: 'materialIdx', label: 'Material / Surface Mode', unit: '', min: 0, max: 2, step: 1 },
    ],
    explanationMetadata:
      'Reused across Class 6 Temperature & Measurement and Class 7 Heat Transfer in Nature.',
    supportedClasses: [6, 7],
    relatedTopics: ['heat_temperature'],
  },
  optics_ray_lab: {
    id: 'optics_ray_lab',
    name: 'Geometric Ray Optics & Image Formation Bench',
    supportedModes: ['2d'],
    componentKey: 'OpticsRayCanvas',
    implemented: true,
    physicsModelSummary:
      'Law of reflection (θ_r = θ_i), Snell refraction (n₁ sin θᵢ = n₂ sin θₜ), and Gaussian mirror/lens ray tracing (1/f = 1/v ± 1/u).',
    selectableComponentIds: [
      'incident_ray',
      'reflected_ray',
      'refracted_ray',
      'normal',
      'convex_lens',
      'concave_lens',
      'concave_mirror',
      'convex_mirror',
      'glass_slab',
      'prism',
      'mirror',
      'lens',
    ],
    adjustableParameters: [
      { key: 'incidenceDeg', label: 'Incidence Angle / Object u', unit: '', min: 10, max: 75, step: 1 },
      { key: 'refractiveIndex', label: 'Refractive Index / Focal f', unit: '', min: 1.1, max: 2.0, step: 0.05 },
    ],
    explanationMetadata:
      'Reused across Class 7 Plane Mirror & Shadows, Class 8 Mirrors & Lenses, and Class 10 Light Reflection/Refraction & Dispersion.',
    supportedClasses: [7, 8, 10],
    relatedTopics: ['light_optics'],
  },
  sound_wave_lab: {
    id: 'sound_wave_lab',
    name: 'Longitudinal Sound Waves, Pitch, Loudness & Echo Lab',
    supportedModes: ['2d'],
    componentKey: 'SoundWaveCanvas',
    implemented: true,
    physicsModelSummary:
      'Longitudinal acoustic particle displacement y(x,t) = A sin(kx − ωt), wave speed v = fλ, time period T = 1/f, and echo round-trip delay t = 2d/v.',
    selectableComponentIds: [
      'vibrating_source',
      'wave',
      'compression',
      'rarefaction',
    ],
    adjustableParameters: [
      { key: 'frequencyHz', label: 'Frequency (f)', unit: 'Hz', min: 120, max: 880, step: 20 },
      { key: 'amplitude', label: 'Amplitude (A)', unit: '%', min: 20, max: 100, step: 5 },
      { key: 'wallDistanceM', label: 'Echo Wall Distance', unit: 'm', min: 15, max: 120, step: 5 },
    ],
    explanationMetadata:
      'Serves Class 9 Sound Waves (amplitude, frequency, time period, propagation media, and echo reflection).',
    supportedClasses: [9],
    relatedTopics: ['sound_waves'],
  },
  electric_circuit_lab: {
    id: 'electric_circuit_lab',
    name: 'Electric Circuits, Ohm’s Law & Electromagnet Workbench',
    supportedModes: ['2d'],
    componentKey: 'ElectricCircuitCanvas',
    implemented: true,
    physicsModelSummary:
      'Ohm’s Law V = IR, series resistance R_s = R₁ + R₂, parallel 1/R_p = 1/R₁ + 1/R₂, Joule heating H = I²Rt, and solenoid field B ∝ nI.',
    selectableComponentIds: [
      'battery',
      'wires',
      'switch',
      'resistor',
      'bulb',
      'electromagnet_coil',
      'compass_needle',
      'current_direction',
    ],
    adjustableParameters: [
      { key: 'voltageV', label: 'Battery Voltage (V)', unit: 'V', min: 1.5, max: 12, step: 0.5 },
      { key: 'resistance1', label: 'Resistor R₁', unit: 'Ω', min: 2, max: 30, step: 1 },
      { key: 'resistance2', label: 'Resistor R₂ / Turns', unit: 'Ω', min: 2, max: 30, step: 1 },
    ],
    explanationMetadata:
      'Reused across Class 7 Electric Circuits & Conductors, Class 8 Heating & Electromagnets, and Class 10 Ohm’s Law & Series/Parallel Networks.',
    supportedClasses: [7, 8, 10],
    relatedTopics: ['electricity_magnetism'],
  },
};

export const ALL_UNIQUE_SIMULATION_ENGINES = Object.values(SIMULATION_ENGINE_REGISTRY);

// ---------------------------------------------------------------------------
// Prompt 04: Controlled Adaptive Resimulation Registry
// ---------------------------------------------------------------------------

export const ADAPTIVE_SIMULATION_IDS: readonly AdaptiveSimulationId[] = [
  'bar_magnet_explorer',
  'compass_field_explorer',
  'field_line_intersection_explorer',
] as const;

export interface AdaptiveSimulationDescriptor {
  id: AdaptiveSimulationId;
  title: string;
  summary: string;
  implemented: boolean;
  defaultParams: AdaptiveSimulationConfig['parameters'];
}

export const ADAPTIVE_SIMULATION_REGISTRY: Record<
  AdaptiveSimulationId,
  AdaptiveSimulationDescriptor
> = {
  bar_magnet_explorer: {
    id: 'bar_magnet_explorer',
    title: 'Bar Magnet Dipole Explorer',
    summary: 'Standard 2D & 3D dipole field with draggable compass probe and rotation controls.',
    implemented: true,
    defaultParams: {
      show_compass: true,
      show_field_lines: true,
      show_direction_arrows: true,
      show_vector_grid: false,
      compass_count: 1,
      highlight_intersection_test: false,
    },
  },
  compass_field_explorer: {
    id: 'compass_field_explorer',
    title: 'Multi-Compass Field Direction Explorer',
    summary: 'Places multiple compasses around the bar magnet to show local field direction everywhere.',
    implemented: true,
    defaultParams: {
      show_compass: true,
      show_field_lines: true,
      show_direction_arrows: true,
      show_vector_grid: true,
      compass_count: 5,
      highlight_intersection_test: false,
    },
  },
  field_line_intersection_explorer: {
    id: 'field_line_intersection_explorer',
    title: 'Field Line Non-Intersection Explorer',
    summary: 'Demonstrates unique local tangent direction B at every point and why lines never cross.',
    implemented: true,
    defaultParams: {
      show_compass: true,
      show_field_lines: true,
      show_direction_arrows: true,
      show_vector_grid: true,
      compass_count: 5,
      highlight_intersection_test: true,
    },
  },
};

export function resolveAdaptiveSimulation(
  rawConfig?: Partial<{
    simulation_id?: string;
    visualization_mode?: string;
    parameters?: Record<string, unknown>;
  }> | null
): AdaptiveSimulationConfig {
  const rawId =
    typeof rawConfig?.simulation_id === 'string'
      ? rawConfig.simulation_id.trim().toLowerCase()
      : '';

  const matched = ADAPTIVE_SIMULATION_REGISTRY[rawId as AdaptiveSimulationId];
  const valid = Boolean(matched && matched.implemented);
  const descriptor = valid
    ? matched
    : ADAPTIVE_SIMULATION_REGISTRY.bar_magnet_explorer;

  const rawParams = (rawConfig?.parameters || {}) as Record<string, unknown>;
  const rawCount =
    typeof rawParams.compass_count === 'number' && Number.isFinite(rawParams.compass_count)
      ? Math.round(rawParams.compass_count)
      : descriptor.defaultParams.compass_count;

  const compassCount = Math.max(1, Math.min(7, rawCount));
  const visMode: '2D' | '3D' =
    typeof rawConfig?.visualization_mode === 'string' &&
    rawConfig.visualization_mode.trim().toUpperCase() === '3D' &&
    descriptor.id === 'bar_magnet_explorer'
      ? '3D'
      : '2D';

  return {
    simulation_id: descriptor.id,
    visualization_mode: visMode,
    valid,
    fallback_used: !valid,
    parameters: {
      show_compass:
        typeof rawParams.show_compass === 'boolean'
          ? rawParams.show_compass
          : descriptor.defaultParams.show_compass,
      show_field_lines:
        typeof rawParams.show_field_lines === 'boolean'
          ? rawParams.show_field_lines
          : descriptor.defaultParams.show_field_lines,
      show_direction_arrows:
        typeof rawParams.show_direction_arrows === 'boolean'
          ? rawParams.show_direction_arrows
          : descriptor.defaultParams.show_direction_arrows,
      show_vector_grid:
        typeof rawParams.show_vector_grid === 'boolean'
          ? rawParams.show_vector_grid
          : descriptor.defaultParams.show_vector_grid,
      compass_count:
        descriptor.id === 'bar_magnet_explorer' ? Math.max(1, compassCount) : Math.max(3, compassCount),
      highlight_intersection_test:
        descriptor.id === 'field_line_intersection_explorer'
          ? true
          : Boolean(rawParams.highlight_intersection_test),
    },
  };
}

export function isExperimentLaunchable(
  exp?: Pick<ExperimentCatalogItem, 'simulationEngineId' | 'availabilityStatus'> | null
): boolean {
  if (!exp || !exp.simulationEngineId) return false;
  if (exp.availabilityStatus === 'coming_soon' || exp.availabilityStatus === 'explanation_only') {
    return false;
  }
  const engine = SIMULATION_ENGINE_REGISTRY[exp.simulationEngineId];
  return Boolean(engine && engine.implemented);
}

const CONCEPT_PREFERRED_PRESETS: Partial<Record<RegisteredSimulationId, readonly string[]>> = {
  magnetic_field: ['electromagnet', 'solenoid_class10'],
  reflection: ['plane_mirror', 'concave_mirror_image', 'convex_mirror_image', 'spherical_mirror_lens'],
  refraction: ['glass_slab', 'convex_lens_image', 'concave_lens_image', 'prism_dispersion', 'spherical_mirror_lens'],
  simple_electric_circuit: [
    'class7_conductors',
    'class7_torch_switch',
    'class8_joule_heating',
    'ohms_law',
    'series_parallel',
    'parallel_resistors',
  ],
};

export function getExperimentsForConceptSimulation(
  simulationId: string | undefined | null,
  catalogue: readonly ExperimentCatalogItem[],
  lockedClass?: GradeClassLevel
): {
  engineId: SimulationEngineId | null;
  resolvedEntry: SimulationRegistryEntry | null;
  matches: ExperimentCatalogItem[];
} {
  const resolved = resolveRegisteredSimulation(simulationId);
  const engineId = resolved.entry?.engineId ?? null;
  if (!resolved.entry || !resolved.entry.implemented || !engineId) {
    return { engineId: null, resolvedEntry: resolved.entry, matches: [] };
  }

  const scoped = catalogue.filter(
    (exp) =>
      isExperimentLaunchable(exp) &&
      exp.simulationEngineId === engineId &&
      (lockedClass === undefined || exp.classLevel === lockedClass)
  );

  const preferredPresets = CONCEPT_PREFERRED_PRESETS[resolved.entry.id];
  if (preferredPresets && preferredPresets.length > 0) {
    const presetMatched = scoped.filter(
      (exp) => exp.simulationPreset && preferredPresets.includes(exp.simulationPreset)
    );
    if (presetMatched.length > 0) {
      return { engineId, resolvedEntry: resolved.entry, matches: presetMatched };
    }
  }

  return { engineId, resolvedEntry: resolved.entry, matches: scoped };
}
