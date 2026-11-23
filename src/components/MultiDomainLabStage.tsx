import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Gauge,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import type {
  ExperimentCatalogItem,
  LanguageCode,
  SimulationEngineId,
  TextbookAnalysisResult,
  TutorParameterSuggestion,
} from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import { SIMULATION_ENGINE_REGISTRY } from '../data/simulationRegistry';
import type { SelectedComponentTutorContext } from '../services/explainabilityApi';
import type { ComponentExplanationContent } from '../systems/componentInteraction/types';
import { getSimulationComponents } from '../systems/componentInteraction/registry';
import { useTwoStageInteraction } from '../systems/componentInteraction/useTwoStageInteraction';
import { ViewportComponentOverlay } from './ViewportComponentOverlay';
import { ParameterSliderInput } from './ParameterSliderInput';
import { CompanionDock } from './CompanionDock';
import type { CompanionMessageState, RewardProgressState, BadgeDefinition } from '../types/companion';
import {
  MotionKinematicsCanvas,
  type MotionPathMode,
  type MotionTelemetry,
} from './simulations/MotionKinematicsCanvas';
import {
  ForceBuoyancyCanvas,
  type ForceBuoyancyTelemetry,
} from './simulations/ForceBuoyancyCanvas';
import {
  SimpleMachinesEnergyCanvas,
  type EnergyMachinesTelemetry,
} from './simulations/SimpleMachinesEnergyCanvas';
import {
  HeatTransferCanvas,
  type HeatTransferMode,
  type HeatTransferTelemetry,
} from './simulations/HeatTransferCanvas';
import {
  OpticsRayCanvas,
  computeOpticsTelemetry,
  type OpticsSubMode,
  type OpticsTelemetry,
} from './simulations/OpticsRayCanvas';
import {
  SoundWaveCanvas,
  type SoundMedium,
  type SoundWaveTelemetry,
} from './simulations/SoundWaveCanvas';
import {
  ElectricCircuitCanvas,
  type CircuitSubMode,
  type ConductorMaterial,
  type ElectricCircuitTelemetry,
} from './simulations/ElectricCircuitCanvas';

export interface MultiDomainTutorContext {
  selectedComponent: SelectedComponentTutorContext | null;
  componentExplanation: ComponentExplanationContent | null;
  parameters: Record<string, unknown>;
  telemetry: Record<string, unknown>;
}

interface MultiDomainLabStageProps {
  engineId: Exclude<SimulationEngineId, 'bar_magnet'>;
  preset?: string;
  experiment?: ExperimentCatalogItem | null;
  studentClass?: number;
  language: LanguageCode;
  t: TranslationBundle;
  reducedMotion: boolean;
  activeAnalysis?: TextbookAnalysisResult | null;
  tutorOpen?: boolean;
  compactForTutor?: boolean;
  tutorSuggestionApply?: { id: string; suggestion: TutorParameterSuggestion } | null;
  companionMessage?: CompanionMessageState | null;
  rewardState?: RewardProgressState;
  latestBadgeToast?: BadgeDefinition | null;
  onDismissBadgeToast?: () => void;
  onComponentExplored?: (engineId: SimulationEngineId, componentId: string) => void;
  onCompanionLabEvent?: (event: {
    eventType: 'component_inspected' | 'parameter_changed';
    componentName?: string;
    parameterSummary?: string;
  }) => void;
  onToggleTutor?: () => void;
  onAskComponentInTutor?: (prefill?: string) => void;
  onCaptureObservation?: (summary: string) => void;
  onTutorContextChange?: (ctx: MultiDomainTutorContext) => void;
}

export const MultiDomainLabStage: React.FC<MultiDomainLabStageProps> = ({
  engineId,
  preset,
  experiment,
  studentClass,
  language,
  t,
  reducedMotion,
  activeAnalysis = null,
  tutorOpen = false,
  compactForTutor = false,
  tutorSuggestionApply = null,
  companionMessage = null,
  rewardState,
  latestBadgeToast = null,
  onDismissBadgeToast,
  onComponentExplored,
  onCompanionLabEvent,
  onToggleTutor,
  onAskComponentInTutor,
  onCaptureObservation,
  onTutorContextChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [firstOpenHintVisible, setFirstOpenHintVisible] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('physix_sim_hint_dismissed') !== '1';
    } catch {
      return true;
    }
  });

  const handleDismissFirstOpenHint = useCallback(() => {
    setFirstOpenHintVisible(false);
    try {
      sessionStorage.setItem('physix_sim_hint_dismissed', '1');
    } catch {
      // ignore storage errors
    }
  }, []);

  // Motion Kinematics state
  const [motionPathMode, setMotionPathMode] = useState<MotionPathMode>('linear');
  const [initialSpeed, setInitialSpeed] = useState(3.5);
  const [acceleration, setAcceleration] = useState(1.0);
  const [pathLength, setPathLength] = useState(5.0);
  const [motionTel, setMotionTel] = useState<MotionTelemetry>({
    elapsedSec: 0,
    distanceM: 0,
    displacementM: 0,
    velocityMs: 3.5,
    accelerationMs2: 1.0,
  });

  // Force & Buoyancy state
  const [forceOrDensity, setForceOrDensity] = useState(24);
  const [massKg, setMassKg] = useState(4);
  const [frictionOrFluid, setFrictionOrFluid] = useState(0.25);
  const [forceTel, setForceTel] = useState<ForceBuoyancyTelemetry>({
    mode: 'friction',
    netForceN: 14.2,
    frictionOrUpthrustN: 9.8,
    accelerationOrDepth: 3.55,
    pressureKpa: 0.33,
    statusLabel: 'Unbalanced',
  });

  // Energy & Machines state
  const [energySubMode, setEnergySubMode] = useState<'pendulum' | 'machines'>('pendulum');
  const [releaseHeight, setReleaseHeight] = useState(5.0);
  const [dampingOrStrands, setDampingOrStrands] = useState(0);
  const [energyTel, setEnergyTel] = useState<EnergyMachinesTelemetry>({
    subMode: 'pendulum',
    totalEnergyJ: 196,
    kineticEnergyJ: 98,
    potentialEnergyJ: 98,
    mechanicalAdvantage: 1,
    requiredEffortN: 39.2,
  });

  // Heat Transfer state
  const [heatMode, setHeatMode] = useState<HeatTransferMode>('conduction');
  const [heaterTempC, setHeaterTempC] = useState(72);
  const [materialIdx, setMaterialIdx] = useState(0);
  const [heatTel, setHeatTel] = useState<HeatTransferTelemetry>({
    celsius: 72,
    kelvin: 345.2,
    fahrenheit: 161.6,
    materialOrSurfaceLabel: 'Copper (High Conductivity)',
    rateLabel: 'Conducting heat',
  });

  // Optics Ray state
  const [opticsSubMode, setOpticsSubMode] = useState<OpticsSubMode>('plane_mirror');
  const [incidenceDeg, setIncidenceDeg] = useState(40);
  const [refractiveOrFocal, setRefractiveOrFocal] = useState(1.5);
  const [opticsObjectCm, setOpticsObjectCm] = useState(34);
  const [opticsFocalCm, setOpticsFocalCm] = useState(15);
  const [, setOpticsTel] = useState<OpticsTelemetry>(() =>
    computeOpticsTelemetry({
      subMode: 'plane_mirror',
      incidenceOrObjDeg: 40,
      refractiveOrFocal: 1.5,
      objectDistanceCm: 34,
      focalLengthCm: 15,
    })
  );

  const liveOpticsTel = useMemo(
    () =>
      computeOpticsTelemetry({
        subMode: opticsSubMode,
        incidenceOrObjDeg: incidenceDeg,
        refractiveOrFocal,
        objectDistanceCm: opticsObjectCm,
        focalLengthCm: opticsFocalCm,
      }),
    [opticsSubMode, incidenceDeg, refractiveOrFocal, opticsObjectCm, opticsFocalCm]
  );

  // Sound Wave state
  const [frequencyHz, setFrequencyHz] = useState(380);
  const [amplitudePct, setAmplitudePct] = useState(65);
  const [wallDistanceM, setWallDistanceM] = useState(45);
  const [soundMedium, setSoundMedium] = useState<SoundMedium>('air');
  const [echoMode, setEchoMode] = useState(true);
  const [soundTel, setSoundTel] = useState<SoundWaveTelemetry>({
    speedMs: 343,
    wavelengthM: 0.9,
    periodMs: 2.63,
    echoDelaySec: 0.262,
    isDistinctEcho: true,
  });

  // Electric Circuit state
  const [circuitSubMode, setCircuitSubMode] = useState<CircuitSubMode>('ohms_law');
  const [voltageV, setVoltageV] = useState(9);
  const [resistance1, setResistance1] = useState(6);
  const [resistance2OrTurns, setResistance2OrTurns] = useState(12);
  const [switchClosed, setSwitchClosed] = useState(true);
  const [conductorMat, setConductorMat] = useState<ConductorMaterial>('copper');
  const [circuitTel, setCircuitTel] = useState<ElectricCircuitTelemetry>({
    subMode: 'ohms_law',
    switchClosed: true,
    equivalentResistanceOhm: 6,
    totalCurrentA: 1.5,
    powerWatts: 13.5,
    branchSummary: 'Slope ΔV/ΔI = 6.0 Ω',
  });

  // Reset defaults cleanly whenever experiment/preset changes
  const applyPresetDefaults = useCallback(() => {
    setIsPlaying(true);
    if (preset === 'class6_circular_motion' || preset === 'class9_circular_motion') {
      setMotionPathMode('circular');
      setInitialSpeed(4.5);
      setAcceleration(0);
      setPathLength(5.0);
    } else {
      setMotionPathMode('linear');
      setInitialSpeed(preset === 'class6_measurement_motion' ? 4.0 : 3.5);
      setAcceleration(preset === 'class9_graphs_acceleration' ? 1.5 : 0);
      setPathLength(5.0);
    }

    if (preset === 'class9_levers_pulleys') {
      setMassKg(6);
    } else {
      setMassKg(4);
    }

    if (preset === 'buoyancy_pressure' || preset === 'archimedes_fluid') {
      setForceOrDensity(12); // floats in water initially
      setFrictionOrFluid(0.25);
    } else if (preset === 'newton_second_law') {
      setForceOrDensity(28);
      setFrictionOrFluid(0.05);
    } else {
      setForceOrDensity(24);
      setFrictionOrFluid(0.25);
    }

    if (preset === 'class9_levers_pulleys') {
      setEnergySubMode('machines');
      setReleaseHeight(4.0);
      setDampingOrStrands(3);
    } else {
      setEnergySubMode('pendulum');
      setReleaseHeight(preset === 'class7_pendulum_period' ? 4.5 : 5.0);
      setDampingOrStrands(0);
    }

    if (preset === 'thermometer_scales') {
      setHeatMode('thermometer');
      setHeaterTempC(37);
    } else if (preset === 'convection_currents') {
      setHeatMode('convection');
      setHeaterTempC(82);
    } else if (preset === 'radiation_surfaces') {
      setHeatMode('radiation');
      setHeaterTempC(88);
    } else {
      setHeatMode('conduction');
      setHeaterTempC(76);
    }
    setMaterialIdx(0);

    if (preset === 'glass_slab') setOpticsSubMode('glass_slab');
    else if (preset === 'concave_mirror_image') setOpticsSubMode('concave_mirror');
    else if (preset === 'convex_mirror_image') setOpticsSubMode('convex_mirror');
    else if (preset === 'concave_lens_image') setOpticsSubMode('concave_lens');
    else if (preset === 'convex_lens_image' || preset === 'spherical_mirror_lens')
      setOpticsSubMode('convex_lens');
    else if (preset === 'prism_dispersion') setOpticsSubMode('prism_dispersion');
    else setOpticsSubMode('plane_mirror');
    setIncidenceDeg(42);
    setRefractiveOrFocal(1.5);
    setOpticsObjectCm(34);
    setOpticsFocalCm(15);

    if (preset === 'class9_sound_media') {
      setFrequencyHz(440);
      setAmplitudePct(70);
      setWallDistanceM(45);
      setSoundMedium('water');
      setEchoMode(false);
    } else {
      setFrequencyHz(380);
      setAmplitudePct(65);
      setWallDistanceM(45);
      setSoundMedium('air');
      setEchoMode(true);
    }

    if (preset === 'class7_conductors' || preset === 'class7_torch_switch') {
      setCircuitSubMode('conductors');
      setVoltageV(preset === 'class7_torch_switch' ? 4.5 : 6);
      setResistance1(6);
      setResistance2OrTurns(12);
    } else if (preset === 'electromagnet' || preset === 'solenoid_class10') {
      setCircuitSubMode('electromagnet');
      setVoltageV(9);
      setResistance1(6);
      setResistance2OrTurns(10);
    } else if (preset === 'series_parallel') {
      setCircuitSubMode('series');
      setVoltageV(12);
      setResistance1(6);
      setResistance2OrTurns(12);
    } else if (preset === 'parallel_resistors') {
      setCircuitSubMode('parallel');
      setVoltageV(12);
      setResistance1(6);
      setResistance2OrTurns(12);
    } else if (preset === 'class8_joule_heating') {
      setCircuitSubMode('ohms_law');
      setVoltageV(12);
      setResistance1(4);
      setResistance2OrTurns(12);
    } else {
      setCircuitSubMode('ohms_law');
      setVoltageV(9);
      setResistance1(6);
      setResistance2OrTurns(12);
    }
    setSwitchClosed(true);
    setConductorMat('copper');

    setResetSignal((n) => n + 1);
  }, [preset]);

  useEffect(() => {
    applyPresetDefaults();
  }, [applyPresetDefaults, experiment?.id]);

  useEffect(() => {
    if (!tutorSuggestionApply) return;
    const s = tutorSuggestionApply.suggestion;
    if (engineId === 'electric_circuit_lab') {
      if (typeof s.voltageV === 'number' && Number.isFinite(s.voltageV)) {
        setVoltageV(Number(Math.max(1.5, Math.min(12, s.voltageV)).toFixed(1)));
      }
      if (typeof s.resistance1 === 'number' && Number.isFinite(s.resistance1)) {
        setResistance1(Math.max(2, Math.min(30, Math.round(s.resistance1))));
      }
      if (typeof s.switchClosed === 'boolean') {
        setSwitchClosed(s.switchClosed);
      }
    } else if (engineId === 'optics_ray_lab') {
      if (typeof s.incidenceDeg === 'number' && Number.isFinite(s.incidenceDeg)) {
        setIncidenceDeg(Math.max(10, Math.min(75, Math.round(s.incidenceDeg))));
      }
      if (typeof s.objectDistanceCm === 'number' && Number.isFinite(s.objectDistanceCm)) {
        setOpticsObjectCm(Math.max(8, Math.min(60, Math.round(s.objectDistanceCm))));
      }
      if (typeof s.focalLengthCm === 'number' && Number.isFinite(s.focalLengthCm)) {
        setOpticsFocalCm(Math.max(10, Math.min(28, Math.round(s.focalLengthCm))));
      }
    } else if (engineId === 'heat_transfer_lab') {
      if (typeof s.heaterTempC === 'number' && Number.isFinite(s.heaterTempC)) {
        setHeaterTempC(Math.max(30, Math.min(100, Math.round(s.heaterTempC))));
      }
    } else if (engineId === 'sound_wave_lab') {
      if (typeof s.frequencyHz === 'number' && Number.isFinite(s.frequencyHz)) {
        setFrequencyHz(Math.max(120, Math.min(880, Math.round(s.frequencyHz))));
      }
      if (typeof s.amplitudePct === 'number' && Number.isFinite(s.amplitudePct)) {
        setAmplitudePct(Math.max(20, Math.min(100, Math.round(s.amplitudePct))));
      }
    }
  }, [tutorSuggestionApply?.id, engineId]);

  const interactionParams = useMemo(() => {
    const summaryByEngine: Record<Exclude<SimulationEngineId, 'bar_magnet'>, string> = {
      motion_kinematics: `Mode: ${motionPathMode} · v = ${motionTel.velocityMs} m/s · Distance = ${motionTel.distanceM} m · Displacement = ${motionTel.displacementM} m`,
      force_friction_buoyancy: `${forceTel.statusLabel} · F_net = ${forceTel.netForceN} N · P = ${forceTel.pressureKpa} kPa`,
      simple_machines_energy:
        energySubMode === 'pendulum'
          ? `Total E = ${energyTel.totalEnergyJ} J (KE = ${energyTel.kineticEnergyJ} J, PE = ${energyTel.potentialEnergyJ} J)`
          : `MA = ${energyTel.mechanicalAdvantage}× · Effort Required = ${energyTel.requiredEffortN} N`,
      heat_transfer_lab: `${heatTel.celsius}°C (${heatTel.kelvin} K / ${heatTel.fahrenheit}°F) · ${heatTel.rateLabel}`,
      optics_ray_lab: `${liveOpticsTel.primaryMetricLabel} · ${liveOpticsTel.secondaryMetricLabel} · ${liveOpticsTel.imageOrDeviationSummary}`,
      sound_wave_lab: `f = ${frequencyHz} Hz · λ = ${soundTel.wavelengthM} m · Echo = ${soundTel.echoDelaySec} s`,
      electric_circuit_lab: `${circuitTel.switchClosed ? 'Switch CLOSED' : 'Switch OPEN'} · V = ${voltageV} V · R_eq = ${circuitTel.equivalentResistanceOhm} Ω · I = ${circuitTel.totalCurrentA} A`,
    };

    const engineValues: Record<Exclude<SimulationEngineId, 'bar_magnet'>, Record<string, unknown>> = {
      motion_kinematics: { motionPathMode, initialSpeed, acceleration, pathLength },
      force_friction_buoyancy: { forceOrDensity, massKg, frictionOrFluid },
      simple_machines_energy: { energySubMode, massKg, releaseHeight, dampingOrStrands },
      heat_transfer_lab: { heatMode, heaterTempC, materialIdx },
      optics_ray_lab: {
        opticsSubMode,
        incidenceDeg,
        refractiveOrFocal,
        objectDistanceCm: opticsObjectCm,
        focalLengthCm: opticsFocalCm,
      },
      sound_wave_lab: { frequencyHz, amplitudePct, wallDistanceM, soundMedium, echoMode },
      electric_circuit_lab: {
        circuitSubMode,
        voltageV,
        resistance1,
        resistance2OrTurns,
        switchClosed,
        conductorMat,
      },
    };

    return {
      engineId,
      preset: preset || 'default',
      isPlaying,
      ...engineValues[engineId],
      summary: summaryByEngine[engineId],
      componentStateSummary: summaryByEngine[engineId],
    };
  }, [
    engineId,
    preset,
    isPlaying,
    motionPathMode,
    initialSpeed,
    acceleration,
    pathLength,
    motionTel,
    forceOrDensity,
    massKg,
    frictionOrFluid,
    forceTel,
    energySubMode,
    releaseHeight,
    dampingOrStrands,
    energyTel,
    heatMode,
    heaterTempC,
    materialIdx,
    heatTel,
    opticsSubMode,
    incidenceDeg,
    refractiveOrFocal,
    opticsObjectCm,
    opticsFocalCm,
    liveOpticsTel,
    frequencyHz,
    amplitudePct,
    wallDistanceM,
    soundMedium,
    echoMode,
    soundTel,
    circuitSubMode,
    voltageV,
    resistance1,
    resistance2OrTurns,
    switchClosed,
    conductorMat,
    circuitTel,
  ]);

  const componentInteraction = useTwoStageInteraction({
    simulationId: engineId,
    visualizationMode: '2d',
    language,
    studentClass: studentClass || experiment?.classLevel,
    relevantConcept: experiment?.relevantConcept,
    parameters: interactionParams,
    textbookContext: activeAnalysis,
  });

  const engineDescriptor = SIMULATION_ENGINE_REGISTRY[engineId];

  const discreteTutorKey = useMemo(
    () =>
      JSON.stringify({
        engineId,
        language,
        selId: componentInteraction.selectedComponent?.id || null,
        hasExpl: Boolean(componentInteraction.explanation),
        explName: componentInteraction.explanation?.name || null,
        motionPathMode,
        initialSpeed,
        acceleration,
        pathLength,
        forceOrDensity,
        massKg,
        frictionOrFluid,
        energySubMode,
        releaseHeight,
        dampingOrStrands,
        heatMode,
        heaterTempC,
        materialIdx,
        opticsSubMode,
        incidenceDeg,
        refractiveOrFocal,
        opticsObjectCm,
        opticsFocalCm,
        frequencyHz,
        amplitudePct,
        wallDistanceM,
        soundMedium,
        echoMode,
        circuitSubMode,
        voltageV,
        resistance1,
        resistance2OrTurns,
        switchClosed,
        conductorMat,
      }),
    [
      engineId,
      language,
      componentInteraction.selectedComponent?.id,
      componentInteraction.explanation,
      motionPathMode,
      initialSpeed,
      acceleration,
      pathLength,
      forceOrDensity,
      massKg,
      frictionOrFluid,
      energySubMode,
      releaseHeight,
      dampingOrStrands,
      heatMode,
      heaterTempC,
      materialIdx,
      opticsSubMode,
      incidenceDeg,
      refractiveOrFocal,
      opticsObjectCm,
      opticsFocalCm,
      frequencyHz,
      amplitudePct,
      wallDistanceM,
      soundMedium,
      echoMode,
      circuitSubMode,
      voltageV,
      resistance1,
      resistance2OrTurns,
      switchClosed,
      conductorMat,
    ]
  );

  const lastTutorEmitAtRef = useRef(0);
  const lastDiscreteKeyRef = useRef('');
  const latestTutorCtxRef = useRef<MultiDomainTutorContext | null>(null);

  const liveTelemetryByEngine: Record<Exclude<SimulationEngineId, 'bar_magnet'>, Record<string, unknown>> = {
    motion_kinematics: { ...motionTel },
    force_friction_buoyancy: { ...forceTel },
    simple_machines_energy: { ...energyTel },
    heat_transfer_lab: { ...heatTel },
    optics_ray_lab: { ...liveOpticsTel },
    sound_wave_lab: { ...soundTel },
    electric_circuit_lab: { ...circuitTel },
  };
  const selCompForCtx = componentInteraction.selectedComponent;
  latestTutorCtxRef.current = {
    selectedComponent: selCompForCtx
      ? {
          id: selCompForCtx.id,
          name: selCompForCtx.displayName[language] || selCompForCtx.displayName.en,
          identification:
            selCompForCtx.identificationText[language] || selCompForCtx.identificationText.en,
          currentState: selCompForCtx.describeCurrentState(language, interactionParams),
          explanationContext: selCompForCtx.explanationContext,
        }
      : null,
    componentExplanation: componentInteraction.explanation,
    parameters: interactionParams,
    telemetry: {
      ...liveTelemetryByEngine[engineId],
      summary: interactionParams.componentStateSummary,
    },
  };

  useEffect(() => {
    if (!onTutorContextChange || !latestTutorCtxRef.current) return;
    const now = performance.now();
    const isDiscreteChange = discreteTutorKey !== lastDiscreteKeyRef.current;
    if (isDiscreteChange || now - lastTutorEmitAtRef.current >= 900) {
      lastDiscreteKeyRef.current = discreteTutorKey;
      lastTutorEmitAtRef.current = now;
      onTutorContextChange(latestTutorCtxRef.current);
    }
  }, [
    onTutorContextChange,
    discreteTutorKey,
    interactionParams,
  ]);

  const lastExploredIdRef = useRef<string | null>(null);
  useEffect(() => {
    const comp = componentInteraction.selectedComponent;
    if (!comp) {
      lastExploredIdRef.current = null;
      return;
    }
    if (lastExploredIdRef.current !== comp.id) {
      lastExploredIdRef.current = comp.id;
      onComponentExplored?.(engineId, comp.id);
      onCompanionLabEvent?.({
        eventType: 'component_inspected',
        componentName: comp.displayName[language] || comp.displayName.en,
        parameterSummary: String(interactionParams.summary || ''),
      });
    }
  }, [componentInteraction.selectedComponent?.id, engineId, language]);

  const isFirstParamRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstParamRenderRef.current) {
      isFirstParamRenderRef.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      onCompanionLabEvent?.({
        eventType: 'parameter_changed',
        parameterSummary: String(interactionParams.summary || ''),
      });
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [
    motionPathMode,
    initialSpeed,
    acceleration,
    pathLength,
    forceOrDensity,
    massKg,
    frictionOrFluid,
    energySubMode,
    releaseHeight,
    dampingOrStrands,
    heatMode,
    heaterTempC,
    materialIdx,
    opticsSubMode,
    incidenceDeg,
    refractiveOrFocal,
    opticsObjectCm,
    opticsFocalCm,
    frequencyHz,
    amplitudePct,
    wallDistanceM,
    soundMedium,
    echoMode,
    circuitSubMode,
    voltageV,
    resistance1,
    resistance2OrTurns,
    switchClosed,
    conductorMat,
  ]);

  const interactivePartCount = useMemo(
    () => getSimulationComponents(engineId).length,
    [engineId]
  );

  const handleLogCurrentTelemetry = () => {
    if (onCaptureObservation && typeof interactionParams.summary === 'string') {
      onCaptureObservation(interactionParams.summary);
    }
  };

  const renderControlsBody = () => (
    <div className="space-y-3">
      {engineId === 'motion_kinematics' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(['linear', 'circular'] as MotionPathMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMotionPathMode(m)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border cursor-pointer ${
                  motionPathMode === m
                    ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                    : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                }`}
              >
                {m === 'linear' ? 'Straight Track' : 'Circular Orbit'}
              </button>
            ))}
          </div>
          <ParameterSliderInput
            label="Initial Speed (u)"
            unit="m/s"
            min={0.5}
            max={12}
            step={0.5}
            value={initialSpeed}
            onChange={setInitialSpeed}
            testId="param-initial-speed"
          />
          {motionPathMode === 'linear' && (
            <ParameterSliderInput
              label="Acceleration (a)"
              unit="m/s²"
              min={-2.5}
              max={4}
              step={0.25}
              value={acceleration}
              onChange={setAcceleration}
              testId="param-acceleration"
            />
          )}
          <ParameterSliderInput
            label={motionPathMode === 'linear' ? 'Track Scale' : 'Orbit Radius'}
            unit="m"
            min={2}
            max={10}
            step={0.5}
            value={pathLength}
            onChange={setPathLength}
            testId="param-track-scale"
          />
        </div>
      )}

      {engineId === 'force_friction_buoyancy' && (
        <div className="space-y-3">
          {preset === 'buoyancy_pressure' || preset === 'archimedes_fluid' ? (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Wood', val: 6 },
                  { label: 'Waterlike', val: 19 },
                  { label: 'Iron', val: 48 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setForceOrDensity(opt.val)}
                    className="py-1.5 px-2 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-xs font-semibold text-[#171A2F] hover:border-[#F49A3C] cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <ParameterSliderInput
                label="Object Density Index"
                displayValue={`${Math.round(450 + (forceOrDensity / 60) * 1700)} kg/m³`}
                min={0}
                max={60}
                step={2}
                value={forceOrDensity}
                onChange={setForceOrDensity}
                testId="param-object-density"
              />
              <ParameterSliderInput
                label="Mass (m)"
                unit="kg"
                min={1}
                max={10}
                step={0.5}
                value={massKg}
                onChange={setMassKg}
                testId="param-mass"
              />
              <ParameterSliderInput
                label="Fluid Density Index"
                displayValue={`${Math.round(850 + ((frictionOrFluid - 0.05) / 0.6) * 450)} kg/m³`}
                min={0.05}
                max={0.65}
                step={0.05}
                value={frictionOrFluid}
                onChange={setFrictionOrFluid}
                testId="param-fluid-density"
              />
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Ice (0.05)', mu: 0.05 },
                  { label: 'Wood (0.25)', mu: 0.25 },
                  { label: 'Sand (0.55)', mu: 0.55 },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setFrictionOrFluid(s.mu)}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                      Math.abs(frictionOrFluid - s.mu) < 0.03
                        ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                        : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <ParameterSliderInput
                label="Applied Push (F)"
                unit="N"
                min={0}
                max={60}
                step={2}
                value={forceOrDensity}
                onChange={setForceOrDensity}
                testId="param-applied-push"
              />
              <ParameterSliderInput
                label="Block Mass (m)"
                unit="kg"
                min={1}
                max={10}
                step={0.5}
                value={massKg}
                onChange={setMassKg}
                testId="param-block-mass"
              />
              <ParameterSliderInput
                label="Surface Friction (μ)"
                min={0.05}
                max={0.65}
                step={0.05}
                value={frictionOrFluid}
                onChange={setFrictionOrFluid}
                testId="param-surface-friction"
              />
            </>
          )}
        </div>
      )}

      {engineId === 'simple_machines_energy' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(['pendulum', 'machines'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setEnergySubMode(m)}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  energySubMode === m
                    ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                    : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                }`}
              >
                {m === 'pendulum' ? 'KE ↔ PE Pendulum' : 'Lever & Pulley'}
              </button>
            ))}
          </div>
          <ParameterSliderInput
            label="Mass / Load (m)"
            unit="kg"
            min={1}
            max={10}
            step={0.5}
            value={massKg}
            onChange={setMassKg}
            testId="param-energy-mass"
          />
          <ParameterSliderInput
            label={energySubMode === 'pendulum' ? 'Release Height (h)' : 'Effort Arm Length'}
            unit="m"
            min={1}
            max={8}
            step={0.5}
            value={releaseHeight}
            onChange={setReleaseHeight}
            testId="param-release-height"
          />
          <ParameterSliderInput
            label={energySubMode === 'pendulum' ? 'Track Friction Damping' : 'Extra Pulley Strands'}
            displayValue={
              energySubMode === 'machines' ? `${dampingOrStrands + 1} total` : undefined
            }
            min={0}
            max={5}
            step={1}
            value={dampingOrStrands}
            onChange={setDampingOrStrands}
            testId="param-damping-strands"
          />
        </div>
      )}

      {engineId === 'heat_transfer_lab' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {(['thermometer', 'conduction', 'convection', 'radiation'] as HeatTransferMode[]).map(
              (hm) => (
                <button
                  key={hm}
                  type="button"
                  onClick={() => setHeatMode(hm)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border capitalize cursor-pointer ${
                    heatMode === hm
                      ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                      : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                  }`}
                >
                  {hm}
                </button>
              )
            )}
          </div>
          <ParameterSliderInput
            label="Source Temperature"
            unit="°C"
            min={30}
            max={100}
            step={1}
            value={heaterTempC}
            onChange={setHeaterTempC}
            testId="param-heater-temp"
          />
          {heatMode === 'conduction' && (
            <div className="grid grid-cols-3 gap-1.5">
              {['Copper', 'Aluminum', 'Glass'].map((mat, idx) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setMaterialIdx(idx)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                    materialIdx === idx
                      ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                      : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {engineId === 'optics_ray_lab' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
            {[
              { id: 'plane_mirror' as OpticsSubMode, label: 'Plane Mirror' },
              { id: 'concave_mirror' as OpticsSubMode, label: 'Concave Mirror' },
              { id: 'convex_mirror' as OpticsSubMode, label: 'Convex Mirror' },
              { id: 'glass_slab' as OpticsSubMode, label: 'Glass Slab' },
              { id: 'convex_lens' as OpticsSubMode, label: 'Convex Lens' },
              { id: 'concave_lens' as OpticsSubMode, label: 'Concave Lens' },
              { id: 'prism_dispersion' as OpticsSubMode, label: 'Prism Spectrum' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setOpticsSubMode(opt.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                  opticsSubMode === opt.id
                    ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                    : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {opticsSubMode === 'plane_mirror' && (
            <ParameterSliderInput
              label="Angle of Incidence (θᵢ)"
              unit="°"
              min={10}
              max={75}
              step={1}
              value={incidenceDeg}
              onChange={setIncidenceDeg}
              testId="param-optics-incidence"
            />
          )}

          {(opticsSubMode === 'concave_mirror' ||
            opticsSubMode === 'convex_mirror' ||
            opticsSubMode === 'convex_lens' ||
            opticsSubMode === 'concave_lens') && (
            <>
              <ParameterSliderInput
                label="Object Distance (u)"
                unit="cm"
                min={8}
                max={60}
                step={1}
                value={opticsObjectCm}
                onChange={setOpticsObjectCm}
                testId="param-optics-object-u"
              />
              <ParameterSliderInput
                label="Focal Length (f)"
                unit="cm"
                min={10}
                max={28}
                step={1}
                value={opticsFocalCm}
                onChange={setOpticsFocalCm}
                testId="param-optics-focal-f"
              />
            </>
          )}

          {(opticsSubMode === 'glass_slab' || opticsSubMode === 'prism_dispersion') && (
            <>
              <ParameterSliderInput
                label="Angle of Incidence"
                unit="°"
                min={10}
                max={75}
                step={1}
                value={incidenceDeg}
                onChange={setIncidenceDeg}
                testId="param-optics-incidence"
              />
              <ParameterSliderInput
                label="Refractive Index n"
                min={1.1}
                max={2.0}
                step={0.05}
                value={refractiveOrFocal}
                onChange={setRefractiveOrFocal}
                testId="param-optics-refractive"
              />
            </>
          )}
        </div>
      )}

      {engineId === 'sound_wave_lab' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {(['air', 'water', 'steel'] as SoundMedium[]).map((med) => (
              <button
                key={med}
                type="button"
                onClick={() => setSoundMedium(med)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border capitalize cursor-pointer ${
                  soundMedium === med
                    ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                    : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                }`}
              >
                {med}
              </button>
            ))}
          </div>
          <ParameterSliderInput
            label="Frequency (f · Pitch)"
            unit="Hz"
            min={120}
            max={880}
            step={20}
            value={frequencyHz}
            onChange={setFrequencyHz}
            testId="param-sound-frequency"
          />
          <ParameterSliderInput
            label="Amplitude (Loudness)"
            unit="%"
            min={20}
            max={100}
            step={5}
            value={amplitudePct}
            onChange={setAmplitudePct}
            testId="param-sound-amplitude"
          />
          <label className="flex items-center justify-between rounded-xl border border-[#EFE7DF]/85 bg-[#FFF9F4]/55 px-3 py-2 text-xs font-medium text-[#171A2F] cursor-pointer">
            <span>Show Echo Reflecting Wall</span>
            <input
              type="checkbox"
              checked={echoMode}
              onChange={(e) => setEchoMode(e.target.checked)}
              className="w-4 h-4 accent-[#6F4E37]"
            />
          </label>
          {echoMode && (
            <ParameterSliderInput
              label="Echo Wall Distance"
              unit="m"
              min={10}
              max={120}
              step={5}
              value={wallDistanceM}
              onChange={setWallDistanceM}
              testId="param-sound-wall-distance"
            />
          )}
        </div>
      )}

      {engineId === 'electric_circuit_lab' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'conductors' as CircuitSubMode, label: 'Conductors' },
              { id: 'ohms_law' as CircuitSubMode, label: "Ohm's Law" },
              { id: 'series' as CircuitSubMode, label: 'Series R₁+R₂' },
              { id: 'parallel' as CircuitSubMode, label: 'Parallel R₁||R₂' },
              { id: 'electromagnet' as CircuitSubMode, label: 'Solenoid Coil' },
            ].map((cm) => (
              <button
                key={cm.id}
                type="button"
                onClick={() => setCircuitSubMode(cm.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                  circuitSubMode === cm.id
                    ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                    : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                }`}
              >
                {cm.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            data-testid="circuit-switch-toggle"
            onClick={() => setSwitchClosed((s) => !s)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border cursor-pointer ${
              switchClosed
                ? 'bg-[#FFF3E3] border-[#F49A3C] text-[#171A2F]'
                : 'bg-[#FDF2F0] border-[#B83A2D] text-[#7A271A]'
            }`}
          >
            Circuit Switch: {switchClosed ? 'CLOSED (Current ON)' : 'OPEN (Current OFF)'}
          </button>

          {circuitSubMode === 'conductors' && (
            <div className="grid grid-cols-2 gap-1.5">
              {(['copper', 'graphite', 'plastic', 'dry_wood'] as ConductorMaterial[]).map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setConductorMat(mat)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border capitalize cursor-pointer ${
                    conductorMat === mat
                      ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                      : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F]'
                  }`}
                >
                  {mat.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          <ParameterSliderInput
            label="Battery Voltage (V)"
            unit="V"
            min={1.5}
            max={12}
            step={0.5}
            value={voltageV}
            onChange={setVoltageV}
            testId="param-circuit-voltage"
          />

          {circuitSubMode !== 'conductors' && (
            <ParameterSliderInput
              label={circuitSubMode === 'electromagnet' ? 'Coil Load R' : 'Resistor R₁'}
              unit="Ω"
              min={2}
              max={30}
              step={1}
              value={resistance1}
              onChange={setResistance1}
              testId="param-circuit-r1"
            />
          )}

          {(circuitSubMode === 'series' ||
            circuitSubMode === 'parallel' ||
            circuitSubMode === 'electromagnet') && (
            <ParameterSliderInput
              label={
                circuitSubMode === 'electromagnet' ? 'Solenoid Coil Turns (N)' : 'Resistor R₂'
              }
              unit={circuitSubMode === 'electromagnet' ? 'turns' : 'Ω'}
              min={circuitSubMode === 'electromagnet' ? 4 : 2}
              max={circuitSubMode === 'electromagnet' ? 14 : 30}
              step={1}
              value={resistance2OrTurns}
              onChange={setResistance2OrTurns}
              testId="param-circuit-r2"
            />
          )}
        </div>
      )}
    </div>
  );

  const renderLiveResultsBody = () => {
    let tiles: Array<{ label: string; value: string; accent?: boolean; testId?: string }> = [];
    let noteLine: string | null = null;

    if (engineId === 'electric_circuit_lab') {
      tiles = [
        { label: 'Voltage (V)', value: `${voltageV.toFixed(1)} V` },
        {
          label: circuitSubMode === 'ohms_law' ? 'Resistance (R)' : 'R_eq',
          value: `${circuitTel.equivalentResistanceOhm} Ω`,
        },
        {
          label: 'Current (I = V/R)',
          value: `${circuitTel.totalCurrentA.toFixed(2)} A`,
          accent: true,
          testId: 'live-result-current',
        },
        { label: 'Power (P = V×I)', value: `${circuitTel.powerWatts.toFixed(1)} W` },
      ];
      noteLine = circuitTel.branchSummary;
    } else if (engineId === 'motion_kinematics') {
      tiles = [
        { label: 'Velocity (v)', value: `${motionTel.velocityMs} m/s`, accent: true },
        { label: 'Distance', value: `${motionTel.distanceM} m` },
        { label: 'Displacement', value: `${motionTel.displacementM} m` },
        { label: 'Time (t)', value: `${motionTel.elapsedSec} s` },
      ];
    } else if (engineId === 'force_friction_buoyancy') {
      tiles = [
        { label: 'Net Force', value: `${forceTel.netForceN} N`, accent: true },
        { label: 'Friction / Upthrust', value: `${forceTel.frictionOrUpthrustN} N` },
        { label: 'Pressure', value: `${forceTel.pressureKpa} kPa` },
        { label: 'State', value: forceTel.statusLabel },
      ];
    } else if (engineId === 'simple_machines_energy') {
      tiles =
        energySubMode === 'pendulum'
          ? [
              { label: 'Total E', value: `${energyTel.totalEnergyJ} J`, accent: true },
              { label: 'Kinetic (KE)', value: `${energyTel.kineticEnergyJ} J` },
              { label: 'Potential (PE)', value: `${energyTel.potentialEnergyJ} J` },
            ]
          : [
              {
                label: 'Mech. Advantage',
                value: `${energyTel.mechanicalAdvantage}×`,
                accent: true,
              },
              { label: 'Effort Needed', value: `${energyTel.requiredEffortN} N` },
              { label: 'Total Energy', value: `${energyTel.totalEnergyJ} J` },
            ];
    } else if (engineId === 'heat_transfer_lab') {
      tiles = [
        { label: 'Celsius', value: `${heatTel.celsius} °C`, accent: true },
        { label: 'Kelvin', value: `${heatTel.kelvin} K` },
        { label: 'Fahrenheit', value: `${heatTel.fahrenheit} °F` },
      ];
      noteLine = `${heatTel.materialOrSurfaceLabel} · ${heatTel.rateLabel}`;
    } else if (engineId === 'optics_ray_lab') {
      tiles =
        opticsSubMode === 'concave_mirror' ||
        opticsSubMode === 'convex_mirror' ||
        opticsSubMode === 'convex_lens' ||
        opticsSubMode === 'concave_lens'
          ? [
              { label: 'Setup (f · u)', value: liveOpticsTel.primaryMetricLabel, accent: true },
              { label: 'Image (v · m)', value: liveOpticsTel.secondaryMetricLabel },
            ]
          : [
              { label: 'Incident', value: liveOpticsTel.primaryMetricLabel, accent: true },
              { label: 'Output', value: liveOpticsTel.secondaryMetricLabel },
            ];
      noteLine = liveOpticsTel.imageOrDeviationSummary;
    } else if (engineId === 'sound_wave_lab') {
      tiles = [
        { label: 'Wave Speed', value: `${soundTel.speedMs} m/s` },
        { label: 'Wavelength (λ)', value: `${soundTel.wavelengthM} m`, accent: true },
        { label: 'Period (T)', value: `${soundTel.periodMs} ms` },
        { label: 'Echo Delay', value: `${soundTel.echoDelaySec} s` },
      ];
      noteLine = soundTel.isDistinctEcho
        ? 'Distinct echo (> 0.10 s)'
        : 'Too close for distinct echo (< 0.10 s)';
    }

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171A2F]">
            <Gauge className="w-3.5 h-3.5 text-[#C96D12]" aria-hidden="true" />
            <span>{t.lab.liveResultsHeading}</span>
          </div>
          {onCaptureObservation && (
            <button
              type="button"
              onClick={handleLogCurrentTelemetry}
              className="text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer"
            >
              + Log Reading
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              data-testid={tile.testId}
              className="rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] px-2.5 py-2 min-w-0"
            >
              <p className="text-[11px] text-[#6F7487] truncate">{tile.label}</p>
              <p
                className={`font-mono-tabular text-xs sm:text-sm font-bold leading-snug break-words ${
                  tile.accent ? 'text-[#C96D12]' : 'text-[#171A2F]'
                }`}
              >
                {tile.value}
              </p>
            </div>
          ))}
        </div>

        {noteLine && (
          <p className="text-[11px] font-mono-tabular text-[#171A2F] bg-[#FFF3E3]/35 border border-[#EFE7DF] rounded-lg px-2.5 py-1.5">
            {noteLine}
          </p>
        )}

        <div className="hidden sm:flex items-start gap-2 text-[11px] text-[#6F7487] leading-relaxed pt-1 border-t border-[#EFE7DF]/70">
          <BookOpen className="w-3.5 h-3.5 text-[#C96D12] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="line-clamp-2">{engineDescriptor.physicsModelSummary}</p>
        </div>
      </div>
    );
  };

  return (
    <div
      data-testid="simulation-workspace-grid"
      className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start"
    >
      {/* LEFT / TOP: Interactive Simulation Viewport */}
      <div
        className={`${
          compactForTutor ? 'lg:col-span-7' : 'lg:col-span-8'
        } min-w-0 clay-card p-2.5 sm:p-4 space-y-2`}
      >
        <div
          data-testid="simulation-viewport-container"
          className="relative rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] overflow-hidden h-[240px] sm:h-[320px] lg:h-[520px]"
        >
          {engineId === 'motion_kinematics' && (
            <MotionKinematicsCanvas
              preset={preset}
              pathMode={motionPathMode}
              initialSpeed={initialSpeed}
              acceleration={acceleration}
              pathLength={pathLength}
              isPlaying={isPlaying}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              selectedComponentId={componentInteraction.selectedComponentId}
              onTelemetryChange={setMotionTel}
              onComponentHit={componentInteraction.handleComponentHit}
              onAnchorMove={componentInteraction.updateLiveAnchor}
            />
          )}

          {engineId === 'force_friction_buoyancy' && (
            <ForceBuoyancyCanvas
              preset={preset}
              forceOrDensity={forceOrDensity}
              massKg={massKg}
              frictionOrFluid={frictionOrFluid}
              isPlaying={isPlaying}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              selectedComponentId={componentInteraction.selectedComponentId}
              onTelemetryChange={setForceTel}
              onComponentHit={componentInteraction.handleComponentHit}
              onAnchorMove={componentInteraction.updateLiveAnchor}
            />
          )}

          {engineId === 'simple_machines_energy' && (
            <SimpleMachinesEnergyCanvas
              subMode={energySubMode}
              massKg={massKg}
              releaseHeightOrArm={releaseHeight}
              dampingOrStrands={dampingOrStrands}
              isPlaying={isPlaying}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              selectedComponentId={componentInteraction.selectedComponentId}
              onTelemetryChange={setEnergyTel}
              onComponentHit={componentInteraction.handleComponentHit}
              onAnchorMove={componentInteraction.updateLiveAnchor}
            />
          )}

          {engineId === 'heat_transfer_lab' && (
            <HeatTransferCanvas
              heatMode={heatMode}
              heaterTempC={heaterTempC}
              materialIdx={materialIdx}
              isPlaying={isPlaying}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              selectedComponentId={componentInteraction.selectedComponentId}
              onTelemetryChange={setHeatTel}
              onComponentHit={componentInteraction.handleComponentHit}
              onAnchorMove={componentInteraction.updateLiveAnchor}
            />
          )}

          {engineId === 'optics_ray_lab' && (
            <OpticsRayCanvas
              subMode={opticsSubMode}
              incidenceOrObjDeg={incidenceDeg}
              refractiveOrFocal={refractiveOrFocal}
              objectDistanceCm={opticsObjectCm}
              focalLengthCm={opticsFocalCm}
              isPlaying={isPlaying}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              selectedComponentId={componentInteraction.selectedComponentId}
              onTelemetryChange={setOpticsTel}
              onComponentHit={componentInteraction.handleComponentHit}
              onAnchorMove={componentInteraction.updateLiveAnchor}
            />
          )}

          {engineId === 'sound_wave_lab' && (
            <SoundWaveCanvas
              frequencyHz={frequencyHz}
              amplitudePct={amplitudePct}
              wallDistanceM={wallDistanceM}
              medium={soundMedium}
              echoMode={echoMode}
              isPlaying={isPlaying}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              selectedComponentId={componentInteraction.selectedComponentId}
              onTelemetryChange={setSoundTel}
              onComponentHit={componentInteraction.handleComponentHit}
              onAnchorMove={componentInteraction.updateLiveAnchor}
            />
          )}

          {engineId === 'electric_circuit_lab' && (
            <ElectricCircuitCanvas
              subMode={circuitSubMode}
              voltageV={voltageV}
              resistance1={resistance1}
              resistance2OrTurns={resistance2OrTurns}
              switchClosed={switchClosed}
              onToggleSwitch={() => setSwitchClosed((s) => !s)}
              conductorMaterial={conductorMat}
              isPlaying={isPlaying}
              reducedMotion={reducedMotion}
              resetSignal={resetSignal}
              selectedComponentId={componentInteraction.selectedComponentId}
              onTelemetryChange={setCircuitTel}
              onComponentHit={componentInteraction.handleComponentHit}
              onAnchorMove={componentInteraction.updateLiveAnchor}
            />
          )}

          <ViewportComponentOverlay
            stage={componentInteraction.stage}
            language={language}
            t={t}
            reducedMotion={reducedMotion}
            simulationEngineId={engineId}
            simulationPreset={preset}
            selectedComponent={componentInteraction.selectedComponent}
            anchorPx={componentInteraction.anchorPx}
            viewportSize={componentInteraction.viewportSize}
            explanation={componentInteraction.explanation}
            isLoadingAi={componentInteraction.isLoadingAi}
            aiNotice={componentInteraction.aiNotice}
            interactivePartCount={interactivePartCount}
            firstOpenHintVisible={firstOpenHintVisible}
            onDismissFirstOpenHint={handleDismissFirstOpenHint}
            onAskPhysixAi={() => onAskComponentInTutor?.()}
            onOpenExplain={() => componentInteraction.openExplainForComponent()}
            onClose={componentInteraction.closeInteraction}
            onRefreshAi={componentInteraction.refreshAiExplanation}
          />

          {onToggleTutor && companionMessage && rewardState && (
            <CompanionDock
              variant="floating"
              language={language}
              t={t}
              message={companionMessage}
              rewardState={rewardState}
              latestBadgeToast={latestBadgeToast}
              reducedMotion={reducedMotion}
              onOpenFullTutor={(prefill) =>
                prefill ? onAskComponentInTutor?.(prefill) : onToggleTutor()
              }
              onDismissBadgeToast={onDismissBadgeToast}
            />
          )}
        </div>

        {/* Single-line viewport footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#6F7487]">
          <p className="truncate max-w-full sm:max-w-[74%]">{t.experimentLab.clickComponentTip}</p>
          <button
            type="button"
            onClick={() => componentInteraction.openExplainForComponent()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{t.explainability.explainButton}</span>
          </button>
        </div>
      </div>

      {/* RIGHT (Desktop) / PERSISTENT BELOW (Mobile): Experiment Control Panel */}
      <aside
        aria-label={t.lab.parametersHeading}
        data-testid="experiment-control-panel"
        className={`flex flex-col ${
          compactForTutor ? 'lg:col-span-5' : 'lg:col-span-4'
        } min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5.75rem)] clay-card lg:overflow-hidden`}
      >
        {/* Header with Play/Pause & Reset Defaults */}
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-[#EFE7DF] bg-[#FFF9F4]/80 flex items-center justify-between gap-2 shrink-0">
          <h2 className="text-sm font-bold text-[#171A2F] truncate">
            {t.lab.parametersHeading}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer min-h-[34px]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? t.lab.pause : t.lab.play}</span>
            </button>
            <button
              type="button"
              data-testid="reset-defaults-btn"
              onClick={applyPresetDefaults}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[34px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C96D12]" />
              <span>{t.lab.resetDefaults}</span>
            </button>
          </div>
        </div>

        {/* Controls & Live Results: Mobile shows Live Results directly under simulation, Desktop keeps Controls above Live Results */}
        <div className="flex-1 lg:overflow-y-auto px-3.5 sm:px-4 py-3 sm:py-3.5 flex flex-col gap-3.5 min-h-0">
          <div className="order-2 lg:order-1 pt-3 border-t border-[#EFE7DF] lg:pt-0 lg:border-t-0">
            {renderControlsBody()}
          </div>
          <div className="order-1 lg:order-2 lg:pt-3 lg:border-t lg:border-[#EFE7DF]">
            {renderLiveResultsBody()}
          </div>
        </div>
      </aside>
    </div>
  );
};
