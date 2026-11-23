import { EXPERIMENT_CATALOGUE } from './ncertCurriculum.ts';
import { isExperimentLaunchable } from './simulationRegistry.ts';
import type { ExperimentCatalogItem } from '../types/physics.ts';
import type {
  DynamicExperimentDomain,
  DynamicExperimentSpec,
  DynamicSimulationTemplateId,
  ExperimentRegistryMatchResult,
} from '../types/dynamicExperiment.ts';

/**
 * Curated keyword signatures for topics that DO NOT yet have an exact dedicated
 * preset in the built-in NCERT catalogue, so we explicitly route them to
 * Dynamic AI Experiment Generation rather than mismatching them to an unrelated lab.
 */
const DYNAMIC_GENERATION_SIGNATURES: Array<{
  pattern: RegExp;
  templateId: DynamicSimulationTemplateId;
  domain: DynamicExperimentDomain;
  preferredDimension: '2d' | '3d';
  label: string;
}> = [
  {
    pattern: /\b(projectile|trajectory|parabola|range\s+of\s+projectile|horizontal\s+range|launch\s+angle)\b/i,
    templateId: 'projectile_motion',
    domain: 'motion',
    preferredDimension: '2d',
    label: 'Projectile Trajectory & Range',
  },
  {
    pattern: /\b(hooke'?s?\s*law|spring\s+constant|spring[- ]mass|elastic\s+potential|restoring\s+force\s*=\s*-?\s*k\s*x)\b/i,
    templateId: 'spring_oscillation',
    domain: 'mechanics',
    preferredDimension: '2d',
    label: "Hooke's Law & Spring Oscillation",
  },
  {
    pattern: /\b(inclined\s+plane|wedge|ramp\s+friction|mg\s*sin|angle\s+of\s+repose)\b/i,
    templateId: 'inclined_plane_forces',
    domain: 'forces',
    preferredDimension: '3d',
    label: 'Inclined Plane Forces & Friction',
  },
  {
    pattern: /\b(simple\s+pendulum|time\s+period\s+of\s+pendulum|2\s*pi\s*sqrt\s*\(?\s*l\s*\/\s*g|acceleration\s+due\s+to\s+gravity.*pendulum)\b/i,
    templateId: 'pendulum_shm',
    domain: 'motion',
    preferredDimension: '3d',
    label: 'Simple Pendulum Period & Gravity Lab',
  },
  {
    pattern: /\b(calorimet|specific\s+heat|thermal\s+equilibrium|mixing\s+water|newton'?s?\s+law\s+of\s+cooling|latent\s+heat|q\s*=\s*m\s*c)\b/i,
    templateId: 'thermal_calorimetry',
    domain: 'heat',
    preferredDimension: '2d',
    label: 'Calorimetry & Thermal Mixing',
  },
  {
    pattern: /\b(doppler|standing\s+wave|harmonics?\s+on\s+string|overtone|resonance\s+tube|organ\s+pipe)\b/i,
    templateId: 'wave_acoustics',
    domain: 'waves_sound',
    preferredDimension: '2d',
    label: 'Wave Harmonics & Doppler Acoustics',
  },
  {
    pattern: /\b(total\s+internal\s+reflection|critical\s+angle|optical\s+fibre|tir\b)\b/i,
    templateId: 'optics_ray_model',
    domain: 'optics_refraction',
    preferredDimension: '2d',
    label: 'Total Internal Reflection & Critical Angle',
  },
  {
    pattern: /\b(hydrostatic\s+pressure|pascal'?s?\s+law|hydraulic\s+lift|manometer|apparent\s+weight.*liquid)\b/i,
    templateId: 'buoyancy_pressure',
    domain: 'forces',
    preferredDimension: '2d',
    label: 'Hydrostatic Pressure & Buoyancy',
  },
  {
    pattern: /\b(moment\s+of\s+force|torque|principle\s+of\s+moments|seesaw\s+balance|rotational\s+equilibrium)\b/i,
    templateId: 'lever_pulley_energy',
    domain: 'mechanics',
    preferredDimension: '2d',
    label: 'Torque & Principle of Moments',
  },
  {
    pattern: /\b(voltage\s+divider|wheatstone|kirchhoff|internal\s+resistance|emf\s+and\s+terminal)\b/i,
    templateId: 'dc_circuit_model',
    domain: 'electricity',
    preferredDimension: '2d',
    label: 'DC Circuit Divider & Kirchhoff Analysis',
  },
  {
    pattern: /\b(electromagnetic\s+induction|faraday|lenz|lorentz\s+force|fleming.*left\s+hand|motor\s+principle)\b/i,
    templateId: 'magnetic_dipole_3d',
    domain: 'magnetism',
    preferredDimension: '3d',
    label: 'Electromagnetic Field & Induction Model',
  },
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'using',
  'study',
  'experiment',
  'ncert',
  'class',
  'chapter',
  'physics',
  'science',
  'observe',
  'show',
  'shows',
  'between',
]);

function inferFallbackTemplate(combinedText: string): {
  templateId: DynamicSimulationTemplateId;
  domain: DynamicExperimentDomain;
  preferredDimension: '2d' | '3d';
} {
  const lower = combinedText.toLowerCase();
  if (/pendulum|oscillat|harmonic|shm/.test(lower)) {
    return { templateId: 'pendulum_shm', domain: 'motion', preferredDimension: '3d' };
  }
  if (/projectile|throw|launch|range|parabolic|free\s+fall/.test(lower)) {
    return { templateId: 'projectile_motion', domain: 'motion', preferredDimension: '2d' };
  }
  if (/incline|slope|ramp|wedge/.test(lower)) {
    return { templateId: 'inclined_plane_forces', domain: 'forces', preferredDimension: '3d' };
  }
  if (/spring|hooke|elastic/.test(lower)) {
    return { templateId: 'spring_oscillation', domain: 'mechanics', preferredDimension: '2d' };
  }
  if (/buoyan|archimedes|float|sink|fluid\s+pressure|pascal|hydraulic/.test(lower)) {
    return { templateId: 'buoyancy_pressure', domain: 'forces', preferredDimension: '2d' };
  }
  if (/lever|pulley|torque|moment|fulcrum|machine/.test(lower)) {
    return { templateId: 'lever_pulley_energy', domain: 'energy', preferredDimension: '2d' };
  }
  if (/refract|snell|prism|lens|critical\s+angle|dispersion/.test(lower)) {
    return { templateId: 'optics_ray_model', domain: 'optics_refraction', preferredDimension: '2d' };
  }
  if (/reflect|mirror|incidence/.test(lower)) {
    return { templateId: 'optics_ray_model', domain: 'optics_reflection', preferredDimension: '2d' };
  }
  if (/circuit|ohm|resistor|voltage|current|kirchhoff|joule/.test(lower)) {
    return { templateId: 'dc_circuit_model', domain: 'electricity', preferredDimension: '2d' };
  }
  if (/magnet|dipole|compass|solenoid|induction|flux/.test(lower)) {
    return { templateId: 'magnetic_dipole_3d', domain: 'magnetism', preferredDimension: '3d' };
  }
  if (/sound|wave|frequency|wavelength|doppler|resonance|pitch/.test(lower)) {
    return { templateId: 'wave_acoustics', domain: 'waves_sound', preferredDimension: '2d' };
  }
  if (/heat|temp|thermal|calori|cooling|conduction|convection|radiation/.test(lower)) {
    return { templateId: 'thermal_calorimetry', domain: 'heat', preferredDimension: '2d' };
  }
  return { templateId: 'pendulum_shm', domain: 'mechanics', preferredDimension: '2d' };
}

function scoreCatalogExperiment(
  exp: ExperimentCatalogItem,
  queryTokens: string[],
  rawQueryLower: string,
  preferredClass?: number
): number {
  if (!isExperimentLaunchable(exp)) return 0;

  const titleLower = exp.title.toLowerCase();
  const conceptLower = exp.relevantConcept.toLowerCase();
  const haystack = `${titleLower} ${conceptLower} ${exp.chapterTitle.toLowerCase()} ${exp.learningObjective.toLowerCase()} ${exp.apparatus.join(' ').toLowerCase()}`;
  const haystackTokens = new Set(tokenize(haystack));

  let score = 0;

  // Exact strong concept hits
  if (rawQueryLower.includes('bar magnet') && exp.simulationEngineId === 'bar_magnet') score += 0.45;
  if (rawQueryLower.includes('ohm') && exp.simulationPreset === 'ohms_law') score += 0.55;
  if (
    (rawQueryLower.includes('series') || rawQueryLower.includes('parallel')) &&
    rawQueryLower.includes('resistor') &&
    exp.simulationPreset === 'series_parallel'
  ) {
    score += 0.5;
  }
  if (rawQueryLower.includes('electromagnet') && exp.simulationPreset === 'electromagnet') score += 0.5;
  if (rawQueryLower.includes('solenoid') && exp.simulationPreset === 'solenoid_class10') score += 0.5;
  if (rawQueryLower.includes('glass slab') && exp.simulationPreset === 'glass_slab') score += 0.55;
  if (rawQueryLower.includes('prism') && exp.simulationPreset === 'prism_dispersion') score += 0.55;
  if (rawQueryLower.includes('concave mirror') && exp.simulationPreset === 'concave_mirror_image') score += 0.5;
  if (rawQueryLower.includes('convex mirror') && exp.simulationPreset === 'convex_mirror_image') score += 0.5;
  if (rawQueryLower.includes('convex lens') && exp.simulationPreset === 'convex_lens_image') score += 0.5;
  if (rawQueryLower.includes('concave lens') && exp.simulationPreset === 'concave_lens_image') score += 0.5;
  if (rawQueryLower.includes('plane mirror') && exp.simulationPreset === 'plane_mirror') score += 0.5;
  if (rawQueryLower.includes('echo') && exp.simulationPreset === 'echo_reflection') score += 0.5;
  if (rawQueryLower.includes('conduction') && exp.simulationPreset === 'heat_conduction') score += 0.5;
  if (rawQueryLower.includes('convection') && exp.simulationPreset === 'heat_convection') score += 0.5;
  if (rawQueryLower.includes('radiation') && exp.simulationPreset === 'heat_radiation') score += 0.5;

  if (queryTokens.length > 0) {
    let overlap = 0;
    for (const tok of queryTokens) {
      if (haystackTokens.has(tok)) overlap += 1;
      if (titleLower.includes(tok)) overlap += 0.5;
    }
    score += (overlap / Math.max(3, queryTokens.length)) * 0.55;
  }

  if (preferredClass && exp.classLevel === preferredClass) {
    score += 0.08;
  }

  return Math.min(1, score);
}

export function matchExperimentInRegistry(input: {
  experimentName?: string;
  conceptName?: string;
  conceptId?: string;
  summary?: string;
  equations?: string[];
  apparatus?: string[];
  classLevel?: number;
  savedDynamicExperiments?: DynamicExperimentSpec[];
}): ExperimentRegistryMatchResult {
  const combined = [
    input.experimentName || '',
    input.conceptName || '',
    input.summary || '',
    ...(input.equations || []),
    ...(input.apparatus || []),
  ]
    .join(' ')
    .trim();

  const lower = combined.toLowerCase();
  const tokens = tokenize(combined);

  // 1. Check saved generated experiments first if there is a strong semantic/concept match
  if (input.savedDynamicExperiments && input.savedDynamicExperiments.length > 0) {
    let bestDyn: DynamicExperimentSpec | null = null;
    let bestDynScore = 0;
    for (const dyn of input.savedDynamicExperiments) {
      if (input.conceptId && dyn.conceptId === input.conceptId) {
        return {
          matchType: 'saved_dynamic',
          confidence: 0.96,
          matchedDynamicExperimentId: dyn.id,
          matchedExperimentTitle: dyn.title,
          reason: `Matched previously generated & validated lab "${dyn.title}".`,
          recommendedTemplateId: dyn.templateId,
          recommendedDomain: dyn.domain,
          preferredDimension: dyn.visualizationMode,
        };
      }
      const dynTokens = new Set(tokenize(`${dyn.title} ${dyn.conceptName} ${dyn.sourceScanTopic || ''}`));
      let hits = 0;
      for (const t of tokens) {
        if (dynTokens.has(t)) hits++;
      }
      const sc = tokens.length > 0 ? hits / Math.max(3, tokens.length) : 0;
      if (sc > bestDynScore) {
        bestDynScore = sc;
        bestDyn = dyn;
      }
    }
    if (bestDyn && bestDynScore >= 0.72) {
      return {
        matchType: 'saved_dynamic',
        confidence: bestDynScore,
        matchedDynamicExperimentId: bestDyn.id,
        matchedExperimentTitle: bestDyn.title,
        reason: `Reusing saved generated experiment "${bestDyn.title}".`,
        recommendedTemplateId: bestDyn.templateId,
        recommendedDomain: bestDyn.domain,
        preferredDimension: bestDyn.visualizationMode,
      };
    }
  }

  // 2. Check if this specifically matches a missing-preset dynamic experiment signature
  for (const sig of DYNAMIC_GENERATION_SIGNATURES) {
    if (sig.pattern.test(lower)) {
      return {
        matchType: 'generate_new',
        confidence: 0.9,
        reason: `"${sig.label}" goes beyond the existing static presets and benefits from a dedicated AI-generated deterministic simulation.`,
        recommendedTemplateId: sig.templateId,
        recommendedDomain: sig.domain,
        preferredDimension: sig.preferredDimension,
      };
    }
  }

  // 3. Score against all launchable NCERT Catalog experiments
  let bestExp: ExperimentCatalogItem | null = null;
  let bestScore = 0;
  for (const exp of EXPERIMENT_CATALOGUE) {
    const s = scoreCatalogExperiment(exp, tokens, lower, input.classLevel);
    if (s > bestScore) {
      bestScore = s;
      bestExp = exp;
    }
  }

  if (bestExp && bestScore >= 0.48) {
    return {
      matchType: 'exact_existing',
      confidence: Number(bestScore.toFixed(2)),
      matchedExperimentId: bestExp.id,
      matchedExperimentTitle: bestExp.title,
      matchedSimulationEngineId: bestExp.simulationEngineId || undefined,
      reason: `Matched existing interactive simulation "${bestExp.title}" (Class ${bestExp.classLevel}).`,
    };
  }

  // 4. Default to generating a dedicated new experiment with inferred template
  const inferred = inferFallbackTemplate(lower);
  return {
    matchType: 'generate_new',
    confidence: 0.75,
    reason: 'No exact pre-built experiment preset matches this textbook diagram; ready to generate a validated interactive simulation.',
    recommendedTemplateId: inferred.templateId,
    recommendedDomain: inferred.domain,
    preferredDimension: inferred.preferredDimension,
  };
}
