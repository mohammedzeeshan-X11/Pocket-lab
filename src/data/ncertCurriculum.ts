import type {
  CurriculumTopicArea,
  ExperimentCatalogItem,
  GradeClassLevel,
  NcertClassCurriculum,
  SimulationEngineId,
} from '../types/physics.ts';
import { ALL_UNIQUE_SIMULATION_ENGINES, isExperimentLaunchable } from './simulationRegistry.ts';
import { NCERT_EXPANDED_EXPERIMENTS } from './ncertExpandedExperiments.ts';

export const CLASS_LEVELS: readonly GradeClassLevel[] = [6, 7, 8, 9, 10] as const;

export const TOPIC_AREA_LABELS: Record<CurriculumTopicArea, string> = {
  motion_measurement: 'Motion & Measurement',
  force_mechanics: 'Force, Pressure & Buoyancy',
  work_energy_machines: 'Work, Energy & Simple Machines',
  heat_temperature: 'Heat & Temperature',
  light_optics: 'Light & Optics',
  sound_waves: 'Sound & Waves',
  electricity_magnetism: 'Electricity & Magnetism',
  natural_phenomena_energy: 'Natural Phenomena & Energy',
};

export const NCERT_CLASS_CURRICULA: Record<GradeClassLevel, NcertClassCurriculum> = {
  6: {
    classLevel: 6,
    textbookSeries: 'NCERT Science · Curiosity (Class 6)',
    editionNote: 'NEP 2020 / NCF-SE 2023 Integrated Science Edition (2024–2026)',
    description:
      'Foundational middle-stage exploration of magnets, SI length measurement, types of motion, temperature scales, water state changes, and natural energy resources.',
    chapters: [
      {
        id: 'c6_ch4',
        classLevel: 6,
        chapterNumber: 1,
        title: 'Exploring Magnets',
        textbookTitle: 'Curiosity · Class 6',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Magnetic vs. non-magnetic materials',
          'North & South poles of a bar magnet',
          'Attraction, repulsion & magnetic compass',
          'Directional property of a freely suspended magnet',
        ],
        topicAreas: ['electricity_magnetism'],
      },
      {
        id: 'c6_ch5',
        classLevel: 6,
        chapterNumber: 2,
        title: 'Measurement of Length and Motion',
        textbookTitle: 'Curiosity · Class 6',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Standard SI unit of length (metre) & conversions',
          'Correct eye position & avoiding zero/parallax error',
          'State of rest vs. motion relative to surroundings',
          'Linear, circular, and oscillatory types of motion',
        ],
        topicAreas: ['motion_measurement'],
      },
      {
        id: 'c6_ch7',
        classLevel: 6,
        chapterNumber: 3,
        title: 'Temperature and its Measurement',
        textbookTitle: 'Curiosity · Class 6',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Heat vs. temperature intuition',
          'Clinical and laboratory thermometers',
          'Celsius (°C), Fahrenheit (°F), and Kelvin (K) scales',
        ],
        topicAreas: ['heat_temperature'],
      },
      {
        id: 'c6_ch8',
        classLevel: 6,
        chapterNumber: 4,
        title: 'A Journey through States of Water',
        textbookTitle: 'Curiosity · Class 6',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Role of heating & cooling in evaporation and condensation',
          'Everyday cooling applications of thermal energy exchange',
        ],
        topicAreas: ['heat_temperature', 'natural_phenomena_energy'],
      },
      {
        id: 'c6_ch11',
        classLevel: 6,
        chapterNumber: 5,
        title: "Nature's Treasures",
        textbookTitle: 'Curiosity · Class 6',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Solar energy, wind energy, and fossil fuels',
          'Renewable vs. non-renewable resources & conservation',
        ],
        topicAreas: ['natural_phenomena_energy'],
      },
    ],
  },
  7: {
    classLevel: 7,
    textbookSeries: 'NCERT Science · Curiosity (Class 7)',
    editionNote: 'NEP 2020 / NCF-SE 2023 Integrated Science Edition (2025–2026)',
    description:
      'Investigates simple electric circuits, conduction/convection/radiation heat transfer, pendulum timekeeping & speed graphs, and shadows/plane mirror reflection.',
    chapters: [
      {
        id: 'c7_ch4',
        classLevel: 7,
        chapterNumber: 1,
        title: 'Electricity: Circuits and their Components',
        textbookTitle: 'Curiosity · Class 7',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Electric cell, battery, switch, bulb, and circuit symbols',
          'Closed vs. open circuit path',
          'Electrical conductors vs. insulators',
        ],
        topicAreas: ['electricity_magnetism'],
      },
      {
        id: 'c7_ch7',
        classLevel: 7,
        chapterNumber: 2,
        title: 'Heat Transfer in Nature',
        textbookTitle: 'Curiosity · Class 7',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Conduction in solids (conductors vs. insulators)',
          'Convection currents in liquids and air (sea & land breeze)',
          'Thermal radiation and surface absorption',
        ],
        topicAreas: ['heat_temperature'],
      },
      {
        id: 'c7_ch8',
        classLevel: 7,
        chapterNumber: 3,
        title: 'Measurement of Time and Motion',
        textbookTitle: 'Curiosity · Class 7',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Periodic motion & time period of a simple pendulum',
          'Speed = Distance / Time & SI unit m/s',
          'Uniform vs. non-uniform motion & distance-time graphs',
        ],
        topicAreas: ['motion_measurement'],
      },
      {
        id: 'c7_ch11',
        classLevel: 7,
        chapterNumber: 4,
        title: 'Light: Shadows and Reflections',
        textbookTitle: 'Curiosity · Class 7',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Luminous & non-luminous sources of light',
          'Rectilinear propagation & shadow formation',
          'Reflection from plane mirrors & lateral inversion',
        ],
        topicAreas: ['light_optics'],
      },
    ],
  },
  8: {
    classLevel: 8,
    textbookSeries: 'NCERT Science · Curiosity (Class 8)',
    editionNote: 'NEP 2020 / NCF-SE 2023 Integrated Science Edition (2025–2026)',
    description:
      'Explores heating & magnetic effects of electric current, forces & friction, fluid & atmospheric pressure, buoyancy, and image formation in mirrors and lenses.',
    chapters: [
      {
        id: 'c8_ch4',
        classLevel: 8,
        chapterNumber: 1,
        title: 'Electricity: Magnetic and Heating Effects',
        textbookTitle: 'Curiosity · Class 8',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Heating effect of electric current & everyday appliances',
          'Magnetic needle deflection around current-carrying wire',
          'Electromagnet coil strength & electric bell/lifting applications',
        ],
        topicAreas: ['electricity_magnetism'],
      },
      {
        id: 'c8_ch5',
        classLevel: 8,
        chapterNumber: 2,
        title: 'Exploring Forces',
        textbookTitle: 'Curiosity · Class 8',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Effects of force on speed, direction, and shape',
          'Contact (muscular, friction) vs. non-contact (magnetic, electrostatic, gravitational)',
          'Friction comparison across surfaces',
          'Upward buoyant force, floating and sinking',
        ],
        topicAreas: ['force_mechanics'],
      },
      {
        id: 'c8_ch6',
        classLevel: 8,
        chapterNumber: 3,
        title: 'Pressure, Winds, Storms, and Cyclones',
        textbookTitle: 'Curiosity · Class 8',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Pressure = Force / Area',
          'Pressure exerted by liquids with depth & gases',
          'Atmospheric pressure & high-speed wind pressure drops',
        ],
        topicAreas: ['force_mechanics', 'natural_phenomena_energy'],
      },
      {
        id: 'c8_ch10',
        classLevel: 8,
        chapterNumber: 4,
        title: 'Light: Mirrors and Lenses',
        textbookTitle: 'Curiosity · Class 8',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Laws of reflection & normal reference',
          'Plane, concave & convex mirror behaviour',
          'Convex & concave lenses and everyday optical tools',
        ],
        topicAreas: ['light_optics'],
      },
      {
        id: 'c8_trans_phenomena',
        classLevel: 8,
        chapterNumber: 5,
        title: 'Static Electricity & Lightning (Transitional Mapping)',
        textbookTitle: 'Pre-Curiosity Class 8 · Needs Syllabus Check',
        verificationStatus: 'needs_verification',
        verificationNote:
          'Covered in the rationalised pre-Curiosity Class 8 ("Some Natural Phenomena"); check your school edition before treating it as prescribed in Curiosity Class 8.',
        physicsTopics: [
          'Charging by rubbing & electroscope repulsion',
          'Atmospheric electrical discharge, lightning & lightning conductors',
        ],
        topicAreas: ['natural_phenomena_energy', 'electricity_magnetism'],
      },
    ],
  },
  9: {
    classLevel: 9,
    textbookSeries: 'NCERT Science (Class 9 · Rationalised & Mechanics Bridge)',
    editionNote: 'Aligned to CBSE/NCERT Rationalised Class 9 Physics Chapters 1–5 (2024–2026)',
    description:
      'Quantitative physics aligned with Rationalised Class 9: motion graphs, Newton’s laws, gravitation/buoyancy, work & energy (with simple machines extension), and sound waves.',
    chapters: [
      {
        id: 'c9_ch4',
        classLevel: 9,
        chapterNumber: 1,
        title: 'Motion',
        textbookTitle: 'NCERT Class 9 Science · Chapter 1',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Distance vs. displacement vectors',
          'Speed, average speed, velocity & acceleration',
          'Distance–time & velocity–time graphs',
          'Uniform circular motion',
        ],
        topicAreas: ['motion_measurement'],
      },
      {
        id: 'c9_ch6',
        classLevel: 9,
        chapterNumber: 2,
        title: 'Force and Laws of Motion',
        textbookTitle: 'NCERT Class 9 Science · Chapter 2',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Balanced & unbalanced forces',
          'Inertia & Newton’s First, Second, and Third Laws',
          'Force, mass & acceleration F = ma',
        ],
        topicAreas: ['force_mechanics'],
      },
      {
        id: 'c9_grav_module',
        classLevel: 9,
        chapterNumber: 3,
        title: 'Gravitation, Free Fall & Archimedes Buoyancy',
        textbookTitle: 'NCERT Class 9 Science · Chapter 3',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Universal gravitation, free fall & mass vs. weight',
          'Thrust, fluid pressure & Archimedes’ buoyancy principle',
        ],
        topicAreas: ['force_mechanics'],
      },
      {
        id: 'c9_ch7',
        classLevel: 9,
        chapterNumber: 4,
        title: 'Work and Energy (with Simple Machines Extension)',
        textbookTitle: 'NCERT Class 9 Science · Chapter 4 (+ Pocket Lab Levers & Pulleys Bridge)',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Scientific work W = F·s & power P = W/t',
          'Kinetic energy ½mv², potential energy mgh & conservation of energy',
          'Levers, pulleys & mechanical advantage extension',
        ],
        topicAreas: ['work_energy_machines'],
      },
      {
        id: 'c9_ch10',
        classLevel: 9,
        chapterNumber: 5,
        title: 'Sound',
        textbookTitle: 'NCERT Class 9 Science · Chapter 5',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Production & propagation of longitudinal sound waves',
          'Frequency, amplitude, time period, pitch & loudness',
          'Human hearing range, echo & ultrasound applications',
        ],
        topicAreas: ['sound_waves'],
      },
    ],
  },
  10: {
    classLevel: 10,
    textbookSeries: 'NCERT Science (Class 10 · Rationalised)',
    editionNote: 'Official Rationalised NCERT Class 10 Textbook & Lab Manual (2024–2026)',
    description:
      'Secondary board physics: spherical mirrors & lenses, glass-slab & prism refraction, human eye & dispersion, Ohm’s law, series/parallel resistors, and electromagnetism.',
    chapters: [
      {
        id: 'c10_ch9',
        classLevel: 10,
        chapterNumber: 1,
        title: 'Light – Reflection and Refraction',
        textbookTitle: 'NCERT Class 10 Science',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Spherical mirror image formation & focal length',
          'Refraction through rectangular glass slab & Snell’s law',
          'Convex and concave lens ray diagrams & lens formula',
        ],
        topicAreas: ['light_optics'],
      },
      {
        id: 'c10_ch10',
        classLevel: 10,
        chapterNumber: 2,
        title: 'The Human Eye and the Colourful World',
        textbookTitle: 'NCERT Class 10 Science',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Accommodation of the human eye & myopia/hypermetropia correction',
          'Refraction and dispersion of white light through a glass prism',
        ],
        topicAreas: ['light_optics'],
      },
      {
        id: 'c10_ch11',
        classLevel: 10,
        chapterNumber: 3,
        title: 'Electricity',
        textbookTitle: 'NCERT Class 10 Science',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Electric charge, current I = Q/t, potential difference & symbols',
          'Ohm’s Law V = IR & resistance factors',
          'Resistors in series and parallel & Joule heating H = I²Rt',
        ],
        topicAreas: ['electricity_magnetism'],
      },
      {
        id: 'c10_ch12',
        classLevel: 10,
        chapterNumber: 4,
        title: 'Magnetic Effects of Electric Current',
        textbookTitle: 'NCERT Class 10 Science',
        verificationStatus: 'verified_ncert',
        physicsTopics: [
          'Bar magnet magnetic field lines & non-intersection property',
          'Magnetic field due to current-carrying conductor & solenoid',
          'Force on current-carrying conductor & electric motor principle',
        ],
        topicAreas: ['electricity_magnetism'],
      },
    ],
  },
};

const CORE_NCERT_EXPERIMENTS: ExperimentCatalogItem[] = [
  // =========================================================================
  // CLASS 6 — CURIOSITY
  // =========================================================================
  {
    id: 'c6_bar_magnet_poles',
    title: 'Magnetic Poles & Compass Direction Explorer',
    classLevel: 6,
    chapterId: 'c6_ch4',
    chapterNumber: 4,
    chapterTitle: 'Exploring Magnets',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'North and South poles of a magnet & directional compass alignment',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d_3d',
    simulationEngineId: 'bar_magnet',
    simulationPreset: 'class6_poles_basics',
    reusedAcrossClasses: [6, 10],
    learningObjective:
      'Discover how a bar magnet always has two poles (North and South) and how a magnetic compass aligns along its field.',
    whyItImportant:
      'Introduces non-contact magnetic forces and why navigators have relied on magnetic compasses for centuries.',
    realWorldApplication:
      'Navigation compasses, refrigerator door gaskets, and sorting iron scrap in recycling centres.',
    description:
      'Rotate a bar magnet in 2D or 3D space and move the compass probe to observe how the red North tip turns reliably toward the magnet’s South pole and away from its North pole.',
    apparatus: ['Bar magnet with N/S markings', 'Magnetic compass needle on low-friction pivot'],
    procedure: [
      'Open the 2D or 3D viewport and inspect the red (North) and slate (South) ends of the bar magnet.',
      'Drag the compass around the magnet in 2D and watch which pole attracts the red tip.',
      'Rotate the magnet angle slider and verify that the compass needle rotates correspondingly.',
      'Click any component twice inside the viewport to read how each pole works.',
    ],
    observationsGuide: [
      'Like poles repel and unlike poles attract—the compass North tip points away from magnet N and toward magnet S.',
      'Reversing magnet angle by 180° flips the compass needle direction completely.',
    ],
    expectedOutcome:
      'Students verify that magnets always possess paired North and South poles that steer compass needles predictably.',
    scientificExplanation:
      'Every magnet acts as a magnetic dipole creating an invisible region of influence around it. A freely pivoted compass needle experiences magnetic torque aligning it along the local field direction from North toward South outside the magnet.',
    gradeAdaptedNote:
      'Tailored for Class 6: focuses on pole identification, attraction/repulsion, and compass direction without vector calculus.',
    assessmentQuestions: [
      {
        id: 'c6_mag_q1',
        kind: 'conceptual',
        prompt: 'Which end of a bar magnet does the red North-seeking tip of a compass point toward when placed close to it?',
        options: [
          'The North pole of the bar magnet',
          'The South pole of the bar magnet',
          'Only the exact middle of the magnet',
          'It spins randomly without stopping',
        ],
        correctIndex: 1,
        explanation:
          'Unlike magnetic poles attract each other, so the North tip of the compass needle points toward the South pole of the bar magnet.',
      },
      {
        id: 'c6_mag_q2',
        kind: 'application',
        prompt: 'If a bar magnet breaks accidentally into two halves, what poles does each piece have?',
        options: [
          'One piece has only North and the other only South',
          'Both pieces completely lose magnetism',
          'Each piece develops its own North and South pole',
          'Only the larger piece keeps poles',
        ],
        correctIndex: 2,
        explanation:
          'Magnetic poles always exist in North–South pairs; breaking a magnet produces two smaller complete magnets.',
      },
      {
        id: 'c6_mag_q3',
        kind: 'conceptual',
        prompt: 'Why is the brass pivot inside a compass kept smooth and low-friction?',
        options: [
          'To make the needle heavier',
          'So even weak magnetic forces can turn the needle freely',
          'To block Earth’s magnetic field',
          'To heat up the needle',
        ],
        correctIndex: 1,
        explanation:
          'Low pivot friction lets the small magnetic torque align the needle accurately without sticking.',
      },
    ],
  },
  {
    id: 'c6_length_and_motion_types',
    title: 'Measuring Length, Scale Zeroing & Types of Motion',
    classLevel: 6,
    chapterId: 'c6_ch5',
    chapterNumber: 5,
    chapterTitle: 'Measurement of Length and Motion',
    topicArea: 'motion_measurement',
    relevantConcept: 'SI unit metre, reference origin, rectilinear vs. circular motion',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'motion_kinematics',
    simulationPreset: 'class6_measurement_motion',
    reusedAcrossClasses: [6, 7, 9],
    learningObjective:
      'Compare straight-line rectilinear motion with circular motion relative to a fixed zero-metre reference mark.',
    whyItImportant:
      'Accurate distance measurement from a clear reference point prevents everyday sizing and timing errors.',
    realWorldApplication:
      'Tailoring measurements, highway kilometre markers, athletics track calibration, and ceiling fans.',
    description:
      'Measure path length along a calibrated metre scale from the zero mark, and toggle between straight linear travel and circular rotation.',
    apparatus: ['Calibrated metre track (m)', 'Moving marker cart / rotating arm', 'Digital timer (s)'],
    procedure: [
      'Start in Straight Track mode and verify the object starts at 0.0 m reference origin.',
      'Set speed to 4.0 m/s and press Play to watch distance covered every second.',
      'Switch to Circular Orbit mode and observe how an object moves around a fixed centre.',
      'Click the Reference Origin and Distance Path components to explore measurement rules.',
    ],
    observationsGuide: [
      'In rectilinear motion, position climbs smoothly along the metre scale.',
      'In circular motion, distance grows around the circle while staying at constant radius r from the centre.',
    ],
    expectedOutcome:
      'Students distinguish linear motion from circular motion and anchor distance readings to a consistent origin.',
    scientificExplanation:
      'The SI unit of length is the metre (m), where 1 m = 100 cm. An object is in motion when its distance from a stationary reference point changes with time.',
    gradeAdaptedNote:
      'Class 6 focus: metre scale readings, zero reference origin, and visual recognition of straight vs. circular motion.',
    assessmentQuestions: [
      {
        id: 'c6_len_q1',
        kind: 'numerical',
        prompt: 'A student measures a desk edge starting at the 2 cm mark instead of 0 cm and reads 67 cm at the far end. What is the true length?',
        options: ['69 cm', '67 cm', '65 cm', '63 cm'],
        correctIndex: 2,
        explanation: 'Subtract the starting offset: 67 cm − 2 cm = 65 cm.',
      },
      {
        id: 'c6_len_q2',
        kind: 'conceptual',
        prompt: 'Which example best demonstrates circular motion?',
        options: [
          'A stone falling straight down',
          'A child sliding down a straight slide',
          'The tip of a ceiling fan blade turning around its hub',
          'A train on a straight track',
        ],
        correctIndex: 2,
        explanation:
          'A rotating fan blade tip maintains constant distance from the central hub while moving along a circular path.',
      },
    ],
  },
  {
    id: 'c6_temperature_scales',
    title: 'Thermometer Measurement & Temperature Scales (°C, K, °F)',
    classLevel: 6,
    chapterId: 'c6_ch7',
    chapterNumber: 7,
    chapterTitle: 'Temperature and its Measurement',
    topicArea: 'heat_temperature',
    relevantConcept: 'Clinical vs. laboratory thermometers and Celsius–Kelvin–Fahrenheit readings',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'heat_transfer_lab',
    simulationPreset: 'thermometer_scales',
    reusedAcrossClasses: [6, 7],
    learningObjective:
      'Read temperature reliably on Celsius, Kelvin, and Fahrenheit scales and understand thermal expansion inside a thermometer.',
    whyItImportant:
      'Human senses of hot and cold are subjective; calibrated thermometers give universal scientific readings.',
    realWorldApplication:
      'Checking body fever (37 °C / 98.6 °F), weather forecasts, and food storage.',
    description:
      'Adjust the laboratory heat bath from 30 °C to 100 °C and observe the thermometer column expand alongside live °C, K, and °F conversions.',
    apparatus: ['Laboratory thermometer', 'Controlled warm water bath', 'Multi-scale readout'],
    procedure: [
      'Adjust the source temperature to 37 °C (normal human body temperature) and note °F and K values.',
      'Raise the temperature to 100 °C (boiling point of water at sea level) and inspect the column.',
      'Click the Thermometer Probe inside the viewport to read clinical vs. lab thermometer differences.',
    ],
    observationsGuide: [
      '37 °C equals approximately 98.6 °F and 310.15 K.',
      'Each 1 °C temperature rise corresponds cleanly to 1 K step on the Kelvin scale.',
    ],
    expectedOutcome:
      'Students connect physical liquid expansion in a thermometer tube to numerical temperature scales.',
    scientificExplanation:
      'Temperature measures the degree of hotness of a body. As thermal energy rises, thermometric liquid expands up the capillary tube; Kelvin shifts the Celsius zero by +273.15.',
    gradeAdaptedNote:
      'Class 6 focus: safe thermometer reading, clinical range (35–42 °C), and scale comparison.',
    assessmentQuestions: [
      {
        id: 'c6_temp_q1',
        kind: 'numerical',
        prompt: 'What is normal human body temperature (37 °C) on the Kelvin scale (using K = °C + 273)?',
        options: ['236 K', '273 K', '310 K', '373 K'],
        correctIndex: 2,
        explanation: 'T(K) = 37 + 273 = 310 K.',
      },
      {
        id: 'c6_temp_q2',
        kind: 'conceptual',
        prompt: 'Why should a clinical thermometer not be used to measure boiling water at 100 °C?',
        options: [
          'It reads only in Kelvin',
          'Its range stops around 42 °C and extreme heat can break it',
          'Boiling water cannot touch glass',
          'It freezes above 50 °C',
        ],
        correctIndex: 1,
        explanation:
          'Clinical thermometers are designed for 35 °C–42 °C; a laboratory thermometer handles −10 °C to 110 °C.',
      },
    ],
  },
  {
    id: 'c6_states_of_water_thermal',
    title: 'Evaporation, Condensation & Thermal State Changes',
    classLevel: 6,
    chapterId: 'c6_ch8',
    chapterNumber: 8,
    chapterTitle: 'A Journey through States of Water',
    topicArea: 'heat_temperature',
    relevantConcept: 'Role of heating and cooling in evaporation, condensation, and everyday cooling',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Observe how heating speeds up evaporation while cooling causes water vapour to condense back into liquid droplets.',
    whyItImportant:
      'Explains morning dew drops, cloud formation, drying wet clothes, and how earthen pots keep drinking water cool.',
    realWorldApplication:
      'Drying clothes in sunlight and breeze, water droplets outside a chilled tumbler, and the natural water cycle.',
    description:
      'Guided NCERT Class 6 investigation of melting, evaporation, and condensation through heating and cooling exchanges.',
    apparatus: [
      'Clean steel saucer or shallow dish',
      'Glass tumbler with cold ice water',
      'Observation log notebook',
    ],
    procedure: [
      'Compare how quickly water evaporates from a wide shallow plate versus a narrow tall cup.',
      'Observe tiny water droplets appearing on the outer dry wall of an ice-cold glass tumbler.',
      'Trace how heat energy absorbed from the surroundings cools an earthen pot (matka) during evaporation.',
      'Complete the understanding check quiz to mark this module complete.',
    ],
    observationsGuide: [
      'Larger exposed surface area, warmer air, and steady wind speed up evaporation.',
      'Water droplets outside a cold glass come from condensation of invisible water vapour in surrounding air, not leakage.',
    ],
    expectedOutcome:
      'Students verify that heating drives evaporation while cooling converts water vapour back to liquid droplets via condensation.',
    scientificExplanation:
      'Heating gives surface water molecules enough energy to escape into air as vapour (evaporation). When humid air touches a cold surface, vapour loses heat energy and turns back into liquid water (condensation).',
    gradeAdaptedNote:
      'Honest activity & quiz module for Curiosity Class 6 Ch. 8 while a dedicated phase-change simulation is planned.',
    assessmentQuestions: [
      {
        id: 'c6_water_q1',
        kind: 'conceptual',
        prompt: 'Why do tiny water droplets appear on the outside of a steel glass filled with ice-cold water?',
        options: [
          'Cold water seeps through tiny pores in steel',
          'Water vapour in surrounding warm air cools down and condenses on the cold surface',
          'Ice melts directly on the outside wall',
          'Air turns into ice cubes inside the room',
        ],
        correctIndex: 1,
        explanation:
          'Warm, humid air touches the cold outer wall of the glass, loses thermal energy, and condenses into liquid droplets.',
      },
      {
        id: 'c6_water_q2',
        kind: 'application',
        prompt: 'Which condition causes wet clothes on a line to dry FASTEST?',
        options: [
          'Folded tightly indoors with no breeze',
          'Spread wide on a sunny, breezy afternoon',
          'Kept inside a closed damp bag',
          'Placed in cold shaded still air',
        ],
        correctIndex: 1,
        explanation:
          'Spreading increases exposed surface area while sunlight (heat) and breeze accelerate evaporation.',
      },
    ],
  },
  {
    id: 'c6_natural_solar_energy',
    title: 'Solar, Wind & Renewable Energy Conservation Guide',
    classLevel: 6,
    chapterId: 'c6_ch11',
    chapterNumber: 11,
    chapterTitle: "Nature's Treasures",
    topicArea: 'natural_phenomena_energy',
    relevantConcept: 'Renewable vs. non-renewable sources of energy & everyday conservation',
    entryCategory: 'ncert_concept',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Classify renewable vs. exhaustible natural energy sources and trace how sunlight drives wind, water cycles, and solar electricity.',
    whyItImportant:
      'Fossil fuels take millions of years to form; shifting to solar and wind power protects climate and resources.',
    realWorldApplication:
      'Rooftop solar photovoltaic panels, solar water heaters, and wind farms across Karnataka and India.',
    description:
      'Structured concept exploration comparing renewable energy streams (solar, wind, hydro) against finite fossil fuels.',
    apparatus: ['Concept comparison sheet', 'Solar & wind energy flow notes'],
    procedure: [
      'Review how solar radiation heats air unevenly to drive wind energy.',
      'Compare fossil coal/petroleum reserves against replenishable solar and hydro resources.',
      'Complete the conservation check quiz below.',
    ],
    observationsGuide: [
      'Renewable sources replenish naturally on human timescales.',
      'Energy conservation cuts waste across lighting, transport, and heating.',
    ],
    expectedOutcome:
      'Students distinguish renewable from non-renewable sources and explain practical household conservation steps.',
    scientificExplanation:
      'Solar radiation is Earth’s primary external energy input—driving photosynthesis, atmospheric convection winds, evaporation in the water cycle, and direct photovoltaic generation.',
    gradeAdaptedNote:
      'Explanation-only curriculum module mapped directly to Curiosity Class 6 Ch. 11.',
    assessmentQuestions: [
      {
        id: 'c6_eng_q1',
        kind: 'conceptual',
        prompt: 'Which pair contains ONLY renewable sources of energy?',
        options: [
          'Coal and sunlight',
          'Sunlight and wind',
          'Petroleum and natural gas',
          'Coal and diesel',
        ],
        correctIndex: 1,
        explanation: 'Sunlight and wind replenish continuously, whereas coal and petroleum are finite fossil fuels.',
      },
      {
        id: 'c6_eng_q2',
        kind: 'application',
        prompt: 'What natural energy source causes air to warm unevenly and generate winds on Earth?',
        options: ['Coal burning underground', 'Solar energy from the Sun', 'Bar magnets in soil', 'Fossil diesel'],
        correctIndex: 1,
        explanation: 'Solar heating warms Earth’s surface unevenly, causing warm air to rise and cooler air to blow in as wind.',
      },
    ],
  },

  // =========================================================================
  // CLASS 7 — CURIOSITY
  // =========================================================================
  {
    id: 'c7_simple_circuit_conductors',
    title: 'Simple Electric Circuit, Switch & Conductors vs. Insulators',
    classLevel: 7,
    chapterId: 'c7_ch4',
    chapterNumber: 3,
    chapterTitle: 'Electricity: Circuits and their Components',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Closed circuit loop, cell symbols, switch control & conductors vs. insulators',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'class7_conductors',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Construct a closed electric circuit with a cell, switch, and bulb, and test which materials conduct electricity.',
    whyItImportant:
      'Explains why electrical wires are metal inside and wrapped in plastic insulation outside.',
    realWorldApplication:
      'Flashlight switches, household copper wiring, and insulating rubber electrician gloves.',
    description:
      'Toggle the switch open or closed and insert different test materials (Copper, Graphite, Plastic, Dry Wood) into the circuit tester to observe bulb glow and current arrows.',
    apparatus: ['DC Cell (1.5 V–6 V)', 'Knife switch', 'Filament bulb', 'Conductor/insulator test strip'],
    procedure: [
      'Close the circuit switch and confirm current flows from + to − lighting the bulb.',
      'Switch the test sample between Copper, Graphite, Plastic, and Wood.',
      'Open the switch and observe why current stops everywhere in the loop.',
      'Click the Battery, Switch, and Bulb inside the canvas to inspect circuit symbols.',
    ],
    observationsGuide: [
      'Metallic copper lights the bulb brightly; plastic and dry wood break conduction so the bulb stays off.',
      'An open switch creates an air gap that stops charge flow completely.',
    ],
    expectedOutcome:
      'Students verify that electricity requires a continuous closed path made of conducting material.',
    scientificExplanation:
      'Conductors such as copper have mobile electrons that drift under battery voltage to transfer energy to the bulb filament. Insulators like plastic hold electrons tightly so no current flows.',
    gradeAdaptedNote:
      'Class 7 focus: closed circuit loop, standard symbols, and conductor vs. insulator sorting.',
    assessmentQuestions: [
      {
        id: 'c7_cir_q1',
        kind: 'conceptual',
        prompt: 'Why are electrical screwdriver handles coated with thick plastic or rubber?',
        options: [
          'To increase electric current',
          'Because plastic is an electrical insulator that protects your hand',
          'To act as an extra battery',
          'To make the metal tip magnetic',
        ],
        correctIndex: 1,
        explanation:
          'Plastic and rubber are insulators, preventing electric current from passing into the user’s hand.',
      },
      {
        id: 'c7_cir_q2',
        kind: 'application',
        prompt: 'If a switch in a single-loop torch circuit is open, what happens to the bulb?',
        options: [
          'It glows dimly',
          'It flickers rapidly',
          'It does not glow because the circuit is broken',
          'Only half the wire carries current',
        ],
        correctIndex: 2,
        explanation: 'An open switch leaves an air gap, stopping current around the entire single loop.',
      },
    ],
  },
  {
    id: 'c7_heat_transfer_modes',
    title: 'Heat Transfer: Conduction, Convection & Radiation Lab',
    classLevel: 7,
    chapterId: 'c7_ch7',
    chapterNumber: 7,
    chapterTitle: 'Heat Transfer in Nature',
    topicArea: 'heat_temperature',
    relevantConcept: 'Conduction along metals, fluid convection plumes & radiant heat absorption',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'heat_transfer_lab',
    simulationPreset: 'conduction_convection_radiation',
    reusedAcrossClasses: [6, 7],
    learningObjective:
      'Compare how heat travels through solids (conduction), liquids/gases (convection), and vacuum/space (radiation).',
    whyItImportant:
      'Explains cooking utensil design, coastal sea/land breezes, and thermos flask insulation.',
    realWorldApplication:
      'Copper-bottom cookware, room heaters/ventilation, and black solar water-heating panels.',
    description:
      'Switch between Conduction (wax pins dropping along Copper vs. Aluminum vs. Glass rods), Convection (rising warm fluid loops), and Radiation (black vs. silver surface warming).',
    apparatus: ['Heat source burner', 'Metal & glass rods with wax pins', 'Convection beaker', 'Black & silver plates'],
    procedure: [
      'In Conduction mode, compare how quickly wax pins fall on Copper versus Glass.',
      'Switch to Convection mode and raise burner temperature to observe rising warm currents.',
      'Switch to Radiation mode and compare thermometer readings on Black vs. Silver surfaces.',
    ],
    observationsGuide: [
      'Copper transfers heat far faster than glass by conduction.',
      'Warm water expands and rises while cooler fluid sinks in convection; matte black surfaces absorb radiation fastest.',
    ],
    expectedOutcome:
      'Students distinguish the three heat-transfer mechanisms and predict which materials conduct, convect, or radiate heat best.',
    scientificExplanation:
      'Conduction passes kinetic vibrations from particle to particle in solids; convection circulates warm less-dense fluids upward; radiation transfers infrared electromagnetic waves without any medium.',
    gradeAdaptedNote:
      'Class 7 Curiosity Ch. 7 interactive inquiry across all three heat-transfer modes.',
    assessmentQuestions: [
      {
        id: 'c7_heat_q1',
        kind: 'conceptual',
        prompt: 'By which process does the Sun’s heat reach Earth across the vacuum of space?',
        options: ['Conduction', 'Convection', 'Radiation', 'Evaporation'],
        correctIndex: 2,
        explanation:
          'Space has no material medium for conduction or convection, so thermal energy travels by radiation.',
      },
      {
        id: 'c7_heat_q2',
        kind: 'application',
        prompt: 'Why is a coastal sea breeze felt blowing from sea toward land during a hot sunny afternoon?',
        options: [
          'Land heats up faster, warm air rises, and cooler air from the sea moves in (convection)',
          'Water conducts heat faster than air',
          'Silver sand reflects wind',
          'Gravity pulls wind sideways',
        ],
        correctIndex: 0,
        explanation:
          'Uneven heating creates convection currents: rising warm land air draws cooler marine air inland.',
      },
    ],
  },
  {
    id: 'c7_speed_pendulum_graphs',
    title: 'Speed, Pendulum Time Period & Distance–Time Graphs',
    classLevel: 7,
    chapterId: 'c7_ch8',
    chapterNumber: 8,
    chapterTitle: 'Measurement of Time and Motion',
    topicArea: 'motion_measurement',
    relevantConcept: 'Speed = Distance / Time, uniform vs. non-uniform motion & distance–time graph',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'motion_kinematics',
    simulationPreset: 'class7_speed_graphs',
    reusedAcrossClasses: [6, 7, 9],
    learningObjective:
      'Measure speed from distance and time and read uniform vs. non-uniform motion directly from a live distance–time graph.',
    whyItImportant:
      'Graphs turn numerical speed tables into instant visual patterns for travel and timekeeping.',
    realWorldApplication:
      'Car speedometers, odometers, railway schedules, and pendulum clocks.',
    description:
      'Vary speed and acceleration while watching the moving vehicle and live distance–time curve update together.',
    apparatus: ['Calibrated track', 'Stopwatch timer', 'Live Distance–Time Plotter'],
    procedure: [
      'Set acceleration a = 0 m/s² and initial speed to 4 m/s to observe a straight distance–time line (uniform motion).',
      'Set acceleration a = 2 m/s² to observe an upward-curving graph (non-uniform motion).',
      'Click the Motion Graph inside the viewport to learn how slope reveals speed.',
    ],
    observationsGuide: [
      'Zero acceleration produces equal distances in equal times (straight diagonal line).',
      'Steeper slope corresponds to faster speed.',
    ],
    expectedOutcome:
      'Students calculate speed = distance/time and distinguish straight (uniform) from curved (non-uniform) graphs.',
    scientificExplanation:
      'Uniform motion covers equal distances in equal intervals of time, yielding a straight line on a distance–time plot whose gradient equals speed v = Δs / Δt.',
    gradeAdaptedNote:
      'Reuses the centralized kinematics engine with Class 7 distance–time graph focus.',
    assessmentQuestions: [
      {
        id: 'c7_spd_q1',
        kind: 'numerical',
        prompt: 'A cyclist travels 120 metres in 20 seconds at steady speed. What is the cyclist’s speed?',
        options: ['4 m/s', '6 m/s', '10 m/s', '2400 m/s'],
        correctIndex: 1,
        explanation: 'Speed = Distance / Time = 120 m / 20 s = 6 m/s.',
      },
      {
        id: 'c7_spd_q2',
        kind: 'conceptual',
        prompt: 'What shape does a distance–time graph have for an object moving at constant (uniform) speed?',
        options: [
          'A straight line inclined to the time axis',
          'A horizontal flat line at zero',
          'A zig-zag wave',
          'A circle',
        ],
        correctIndex: 0,
        explanation: 'Equal distance increments in equal time intervals form a straight sloped line.',
      },
    ],
  },
  {
    id: 'c7_plane_mirror_reflection',
    title: 'Plane Mirror Reflection & Shadows Lab',
    classLevel: 7,
    chapterId: 'c7_ch11',
    chapterNumber: 11,
    chapterTitle: 'Light: Shadows and Reflections',
    topicArea: 'light_optics',
    relevantConcept: 'Rectilinear propagation, plane mirror reflection & equal incidence/reflection angles',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'plane_mirror',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Observe how light travels in straight rays and bounces cleanly off a plane mirror at equal angles across the normal.',
    whyItImportant:
      'Explains how mirrors let us see around corners (periscopes) and why mirror images appear laterally inverted.',
    realWorldApplication:
      'Dressing mirrors, submarine periscopes, and bicycle rear reflectors.',
    description:
      'Adjust the incoming light beam angle onto a plane mirror and inspect the normal line and reflected ray live.',
    apparatus: ['Ray box', 'Plane mirror strip', 'Protractor angle scale'],
    procedure: [
      'Change the angle of incidence slider between 15° and 70°.',
      'Compare the angle of reflection readout against the angle of incidence.',
      'Click the Normal Line and Reflected Ray inside the viewport to read how angles are measured.',
    ],
    observationsGuide: [
      'Every degree you tilt the incident ray toward or away from the normal shifts the reflected ray identically.',
      'Light follows straight-line segments in uniform air.',
    ],
    expectedOutcome:
      'Students verify straight-line ray paths and symmetric plane-mirror reflection.',
    scientificExplanation:
      'Light travels in straight lines in a homogeneous medium. When hitting a smooth plane mirror, it reflects back at θ_r = θ_i measured from the perpendicular normal.',
    gradeAdaptedNote:
      'Reuses the central Optics Ray Bench configured in Class 7 Plane Mirror mode.',
    assessmentQuestions: [
      {
        id: 'c7_opt_q1',
        kind: 'numerical',
        prompt: 'If a light ray hits a plane mirror at 35° to the normal, what is the angle of reflection?',
        options: ['55°', '35°', '70°', '90°'],
        correctIndex: 1,
        explanation: 'By the law of reflection, angle of reflection equals angle of incidence = 35°.',
      },
      {
        id: 'c7_opt_q2',
        kind: 'conceptual',
        prompt: 'Which set describes the image of a candle formed by a flat plane mirror?',
        options: [
          'Real, inverted, and magnified',
          'Virtual, erect, same size, and laterally inverted',
          'Virtual, upside-down, and smaller',
          'Real and formed only on a paper screen',
        ],
        correctIndex: 1,
        explanation: 'A plane mirror forms an upright, virtual image of the same size at an equal distance behind the mirror, reversed left-to-right.',
      },
      {
        id: 'c7_opt_q3',
        kind: 'numerical',
        prompt: 'A student stands 2 m in front of a plane mirror. How far is the student from their mirror image?',
        options: ['1 m', '2 m', '4 m', '6 m'],
        correctIndex: 2,
        explanation: 'The image forms 2 m behind the mirror, so the distance from student to image is 2 m + 2 m = 4 m.',
      },
    ],
  },

  // =========================================================================
  // CLASS 8 — CURIOSITY
  // =========================================================================
  {
    id: 'c8_heating_electromagnet',
    title: 'Electromagnet & Magnetic Effect of Current (Oersted Activity)',
    classLevel: 8,
    chapterId: 'c8_ch4',
    chapterNumber: 4,
    chapterTitle: 'Electricity: Magnetic and Heating Effects',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Electric current creates a magnetic field; coil turns & current boost electromagnet strength',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'electromagnet',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Discover how electric current in a coil produces magnetism, deflects a compass needle, and strengthens with more turns or higher voltage.',
    whyItImportant:
      'Unlike permanent bar magnets, electromagnets can be switched on/off and tuned cleanly—powering electric bells, cranes, and motors.',
    realWorldApplication:
      'Electric doorbells, scrapyard electromagnetic cranes, circuit breakers, and speakers.',
    description:
      'Drive electric current through a solenoid coil near a compass probe. Adjust battery voltage and coil turns, or open the switch to turn magnetism off immediately.',
    apparatus: ['Insulated copper solenoid coil', 'DC Battery & Switch', 'Compass needle probe'],
    procedure: [
      'Close the circuit switch and notice the compass needle swing toward the coil.',
      'Increase voltage and coil turns sliders to observe stronger field lines and larger deflection.',
      'Open the switch and verify the temporary electromagnet loses its pull immediately.',
    ],
    observationsGuide: [
      'More coil turns and higher current produce a stronger magnetic field.',
      'Opening the switch shuts off the electromagnet cleanly.',
    ],
    expectedOutcome:
      'Students connect moving electric charge to magnetism and identify ways to control electromagnet strength.',
    scientificExplanation:
      'Electric current flowing through a wire generates a circular magnetic field around it (Oersted’s discovery). Winding the wire into a solenoid concentrates magnetic flux inside the coil, creating North and South poles.',
    gradeAdaptedNote:
      'Reuses the central Electric Circuit Workbench in Electromagnet mode for Class 8 Curiosity Ch. 4.',
    assessmentQuestions: [
      {
        id: 'c8_em_q1',
        kind: 'conceptual',
        prompt: 'How can you make an electromagnet stronger using the same wire?',
        options: [
          'Replace the battery with a wooden block',
          'Wrap more coil turns around an iron core and increase current',
          'Open the circuit switch',
          'Use plastic wire instead of copper',
        ],
        correctIndex: 1,
        explanation:
          'Increasing coil turns and electric current strengthens the magnetic field inside the solenoid.',
      },
      {
        id: 'c8_em_q2',
        kind: 'application',
        prompt: 'Why is an electromagnet preferred over a permanent magnet in a scrapyard lifting crane?',
        options: [
          'It never needs electricity',
          'Its magnetism can be switched off to drop heavy steel scrap on demand',
          'It lifts plastic bottles too',
          'It has no North pole',
        ],
        correctIndex: 1,
        explanation: 'Switching off the current releases the lifted iron scrap cleanly.',
      },
    ],
  },
  {
    id: 'c8_forces_and_friction',
    title: 'Effects of Force & Comparing Friction Across Surfaces',
    classLevel: 8,
    chapterId: 'c8_ch5',
    chapterNumber: 5,
    chapterTitle: 'Exploring Forces',
    topicArea: 'force_mechanics',
    relevantConcept: 'Balanced vs. unbalanced forces, contact friction across surfaces & acceleration',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'force_friction_buoyancy',
    simulationPreset: 'friction_surfaces',
    reusedAcrossClasses: [8, 9],
    learningObjective:
      'Test how surface roughness changes friction force and determine when applied push overcomes friction to accelerate a mass.',
    whyItImportant:
      'Friction makes walking, writing, and braking possible while causing heat and mechanical wear.',
    realWorldApplication:
      'Car tyre treads on wet roads, ball bearings in bicycles, and polishing ice rinks.',
    description:
      'Apply horizontal push to a wooden block across smooth Ice (μ = 0.05), Polished Wood (μ = 0.25), or Rough Sandpaper (μ = 0.55) and observe live net force and motion.',
    apparatus: ['Test mass block', 'Spring push gauge', 'Low/Medium/High friction surfaces'],
    procedure: [
      'Start with 20 N applied force on a 4 kg block over Rough Sandpaper (μ ≈ 0.55) and check whether it slides.',
      'Lower friction to Ice (μ ≈ 0.05) with the exact same push and observe acceleration jump.',
      'Click the Friction Force Arrow and Test Block to inspect normal reaction N and μ.',
    ],
    observationsGuide: [
      'If Applied Force ≤ Maximum Friction, Net Force = 0 and the block stays at rest.',
      'Rougher surfaces create greater opposing friction for the same block weight.',
    ],
    expectedOutcome:
      'Students observe how friction depends on surface interlocking and opposes relative sliding motion.',
    scientificExplanation:
      'Friction arises from microscopic irregularities interlocking between two surfaces in contact: f_max = μN = μmg. Only when applied force exceeds limiting friction does an unbalanced net force accelerate the block.',
    gradeAdaptedNote:
      'Class 8 Curiosity Ch. 5 exploration of contact forces, friction comparison, and net push.',
    assessmentQuestions: [
      {
        id: 'c8_frc_q1',
        kind: 'conceptual',
        prompt: 'Which surface produces the LEAST sliding friction on a wooden block?',
        options: ['Coarse sandpaper', 'Dry brick', 'Smooth wet ice', 'Rough carpet'],
        correctIndex: 2,
        explanation: 'Smooth wet ice has minimal surface interlocking (lowest μ), giving the least friction.',
      },
      {
        id: 'c8_frc_q2',
        kind: 'numerical',
        prompt: 'You push a box right with 25 N while friction pushes left with 25 N. What is the net force?',
        options: ['50 N right', '25 N left', '0 N (balanced)', '1 N right'],
        correctIndex: 2,
        explanation: 'Equal and opposite forces cancel out: F_net = 25 N − 25 N = 0 N.',
      },
    ],
  },
  {
    id: 'c8_floating_sinking_buoyancy',
    title: 'Floating, Sinking & Fluid Pressure with Depth',
    classLevel: 8,
    chapterId: 'c8_ch5',
    chapterNumber: 5,
    chapterTitle: 'Exploring Forces',
    topicArea: 'force_mechanics',
    relevantConcept: 'Buoyant upthrust vs. weight, relative density & hydrostatic pressure P = ρgh',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'force_friction_buoyancy',
    simulationPreset: 'buoyancy_pressure',
    reusedAcrossClasses: [8, 9],
    learningObjective:
      'Compare object density against liquid density to predict floating or sinking and measure how liquid pressure rises with depth.',
    whyItImportant:
      'Explains why a small iron nail sinks while a hollow ship floats and why dam walls are widest at the bottom.',
    realWorldApplication:
      'Submarines, life jackets, deep-sea diving suits, and hydroelectric dam construction.',
    description:
      'Lower test blocks of varying density (Wood, Ice, Aluminum, Iron) into freshwater or salty brine while inspecting Weight, Buoyant Force, and Fluid Pressure at depth.',
    apparatus: ['Fluid tank with depth scale', 'Density-adjustable test block', 'Pressure gauge'],
    procedure: [
      'Set block density below water (600 kg/m³) and observe it float with upward Buoyancy balancing Weight.',
      'Raise block density above water (1800 kg/m³) and see Weight exceed maximum Buoyancy so it sinks.',
      'Increase depth/saltiness and track hydrostatic pressure P = ρgh.',
    ],
    observationsGuide: [
      'Objects less dense than the fluid float; denser objects sink because Weight > Buoyant Upthrust.',
      'Hydrostatic liquid pressure grows steadily deeper beneath the surface.',
    ],
    expectedOutcome:
      'Students link density comparison and buoyant force directly to floating vs. sinking.',
    scientificExplanation:
      'Liquids exert upward buoyant force equal to the weight of displaced fluid (F_b = ρ_fluid · V_sub · g) and sideways/downward pressure P = ρgh increasing with depth h.',
    gradeAdaptedNote:
      'Bridges Class 8 Exploring Forces & Pressure with Class 9 Archimedes’ Principle via the shared Force/Fluid engine.',
    assessmentQuestions: [
      {
        id: 'c8_buo_q1',
        kind: 'conceptual',
        prompt: 'An object floats in water when:',
        options: [
          'Its density is lower than water and buoyant upthrust balances its weight',
          'Gravity disappears in water',
          'It has zero mass',
          'Water pressure drops to zero',
        ],
        correctIndex: 0,
        explanation:
          'When object density < fluid density, displacing only a fraction of its volume generates enough upthrust to balance weight.',
      },
      {
        id: 'c8_buo_q2',
        kind: 'application',
        prompt: 'A solid iron nail sinks in water, yet a massive iron ship floats. Why?',
        options: [
          'Ships are hollow and displace a huge volume of water so buoyant force balances total ship weight',
          'Ship iron has zero density',
          'Ocean water has no gravity',
          'Ship engines push downward less than nails',
        ],
        correctIndex: 0,
        explanation: 'Shaping the hull around air lowers average density below water and displaces enough water to generate large buoyant upthrust.',
      },
      {
        id: 'c8_buo_q3',
        kind: 'conceptual',
        prompt: 'How does liquid pressure P = ρgh change as a diver descends deeper underwater?',
        options: ['It decreases steadily', 'It remains zero', 'It increases proportionally with depth h', 'It disappears at 10 m'],
        correctIndex: 2,
        explanation: 'Hydrostatic pressure rises linearly with depth h and liquid density ρ.',
      },
    ],
  },
  {
    id: 'c8_atmospheric_pressure_storms',
    title: 'Atmospheric Pressure, Winds & Cyclone Formation',
    classLevel: 8,
    chapterId: 'c8_ch6',
    chapterNumber: 6,
    chapterTitle: 'Pressure, Winds, Storms, and Cyclones',
    topicArea: 'natural_phenomena_energy',
    relevantConcept: 'Force per unit area, atmospheric air pressure & high-speed wind pressure drops',
    entryCategory: 'ncert_concept',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Understand how atmospheric air exerts immense pressure, why winds blow from high to low pressure, and how warm ocean air fuels storms.',
    whyItImportant:
      'Understanding wind and pressure gradients supports early cyclone warnings and structural wind safety.',
    realWorldApplication:
      'Barometer weather forecasting, vacuum suction cups, and cyclone shelter preparedness.',
    description:
      'Conceptual guide to air pressure demonstrations (crushed tin can, blowing over paper strips) and cyclone pressure systems.',
    apparatus: ['Concept diagram & safety guide', 'Pressure = Force / Area worked examples'],
    procedure: [
      'Compare how narrow bag straps hurt more than wide straps (same force over smaller area = higher pressure).',
      'Trace why fast-moving wind lowers local air pressure above roofs and paper strips.',
    ],
    observationsGuide: [
      'Reducing contact area multiplies pressure P = F / A.',
      'Air moves continuously from high-pressure regions toward low-pressure centres.',
    ],
    expectedOutcome:
      'Students compute P = F / A and explain everyday atmospheric pressure and wind-storm behaviour.',
    scientificExplanation:
      'Atmospheric pressure (~101.3 kPa at sea level) comes from the weight of the overlying air column. Warm air rises creating low pressure beneath it, drawing surrounding air inward in swirling winds.',
    gradeAdaptedNote: 'Explanation/activity guide mapped to Class 8 Curiosity Chapter 6.',
    assessmentQuestions: [
      {
        id: 'c8_atm_q1',
        kind: 'numerical',
        prompt: 'A force of 200 N presses evenly over an area of 0.5 m². What is the pressure?',
        options: ['100 Pa', '200 Pa', '400 Pa', '0.0025 Pa'],
        correctIndex: 2,
        explanation: 'Pressure P = Force / Area = 200 N / 0.5 m² = 400 N/m² (Pa).',
      },
      {
        id: 'c8_atm_q2',
        kind: 'application',
        prompt: 'Why do school bags have wide straps instead of thin strings?',
        options: [
          'Wide straps spread the bag weight over a larger shoulder area, reducing pressure (P = F/A)',
          'Wide straps increase gravitational force',
          'Thin strings generate atmospheric storms',
          'Wide straps eliminate mass',
        ],
        correctIndex: 0,
        explanation: 'Increasing contact area A for the same downward force F cuts pressure on the shoulders.',
      },
      {
        id: 'c8_atm_q3',
        kind: 'conceptual',
        prompt: 'What happens to local air pressure when wind blows very fast over a tin roof?',
        options: [
          'Air pressure drops above the roof',
          'Air pressure becomes infinite',
          'Air turns into liquid water',
          'Atmospheric pressure stays completely unchanged',
        ],
        correctIndex: 0,
        explanation: 'Increased wind speed is accompanied by reduced air pressure, which is why gale-force winds can lift loose roofs.',
      },
    ],
  },
  {
    id: 'c8_mirrors_and_lenses',
    title: 'Laws of Reflection, Spherical Mirrors & Lenses',
    classLevel: 8,
    chapterId: 'c8_ch10',
    chapterNumber: 10,
    chapterTitle: 'Light: Mirrors and Lenses',
    topicArea: 'light_optics',
    relevantConcept: 'θ_i = θ_r, converging vs. diverging mirrors & lenses',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'spherical_mirror_lens',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Observe how curved concave/convex mirrors reflect parallel rays and how convex/concave lenses converge or spread light.',
    whyItImportant:
      'Explains vehicle headlights, magnifying lenses, side-view safety mirrors, and eyeglasses.',
    realWorldApplication:
      'Dentist mirrors, highway blind-spot convex mirrors, and magnifying reading glasses.',
    description:
      'Switch between Concave Mirror, Convex Lens, and Concave Lens optical setups to watch ray bending and focal point convergence.',
    apparatus: ['Optical bench', 'Concave/Convex Mirror', 'Convex/Concave Lens', 'Parallel beam emitter'],
    procedure: [
      'Select Convex Lens mode and adjust object position or focal power to trace converging rays.',
      'Switch to Concave Lens mode to see parallel rays diverge outward and form an upright virtual diminished image.',
      'Switch to Concave Mirror mode and notice parallel rays meet at the focal point F; click any optical component to explore focal length f.',
    ],
    observationsGuide: [
      'Concave mirrors and convex lenses bring parallel light beams together at a focus.',
      'Convex mirrors and concave lenses spread reflected or transmitted rays outward.',
    ],
    expectedOutcome:
      'Students identify converging vs. diverging mirrors and lenses accurately.',
    scientificExplanation:
      'Curved mirrors obey θ_r = θ_i at every tilted point along their surface, while curved lenses refract rays twice according to Snell’s law to converge or diverge beams.',
    gradeAdaptedNote:
      'Class 8 qualitative ray exploration using the shared Optics Ray Bench.',
    assessmentQuestions: [
      {
        id: 'c8_opt_q1',
        kind: 'conceptual',
        prompt: 'Which lens always spreads out (diverges) parallel rays of light passing through it?',
        options: ['Convex lens', 'Concave lens', 'Plane glass window', 'Magnifying lens'],
        correctIndex: 1,
        explanation: 'A concave (thinner-in-middle) lens bends light outward away from the principal axis.',
      },
      {
        id: 'c8_opt_q2',
        kind: 'application',
        prompt: 'Why is a convex mirror used as a side rear-view mirror on cars and scooters?',
        options: [
          'It flips cars upside down',
          'It forms an erect, diminished image giving a wide field of view behind the vehicle',
          'It concentrates sunlight onto the driver',
          'It only reflects red light',
        ],
        correctIndex: 1,
        explanation: 'Convex mirrors curve outward, producing upright smaller images across a much wider road area.',
      },
      {
        id: 'c8_opt_q3',
        kind: 'conceptual',
        prompt: 'Where do rays parallel to the principal axis meet after reflecting from a concave mirror?',
        options: ['At infinity', 'At the Principal Focus (F)', 'Behind the mirror glass', 'At 90° to the mirror'],
        correctIndex: 1,
        explanation: 'Concave mirrors converge parallel incident rays to their Principal Focus F.',
      },
    ],
  },
  {
    id: 'c8_static_lightning_verification',
    title: 'Static Electricity, Electroscope & Lightning Protection',
    classLevel: 8,
    chapterId: 'c8_trans_phenomena',
    chapterNumber: 14,
    chapterTitle: 'Static Electricity & Lightning (Transitional Mapping)',
    topicArea: 'natural_phenomena_energy',
    relevantConcept: 'Charging by friction, like-charge repulsion & earthing lightning conductors',
    entryCategory: 'ncert_concept',
    verificationStatus: 'needs_verification',
    verificationNote:
      'Prescribed in rationalised pre-Curiosity Class 8 Ch. 12; marked as needing curriculum verification for Curiosity 2025+ editions.',
    availabilityStatus: 'coming_soon',
    simulationEngineId: null,
    learningObjective:
      'Understand static electric charges produced by rubbing insulators and how lightning rods safely earth storm discharges.',
    whyItImportant:
      'Teaches essential lightning safety rules and why tall buildings carry copper earthing rods.',
    realWorldApplication:
      'Building lightning arresters, antistatic straps in electronics labs, and photocopier drums.',
    description:
      'Planned interactive electroscope & cloud discharge simulator. Currently available as a structured study guide.',
    apparatus: ['Glass/plastic rods', 'Gold-leaf electroscope concept', 'Lightning arrester schematic'],
    procedure: [
      'Review how rubbing transfers electrons leaving net positive or negative static charge.',
      'Notice how like charges repel in electroscope leaves and opposite charges attract.',
    ],
    observationsGuide: [
      'Two balloons rubbed with wool repel each other because both hold like charges.',
      'Earthing conducts accumulated charge safely into the ground.',
    ],
    expectedOutcome:
      'Students distinguish static charge accumulation from steady circuit current and understand lightning safety.',
    scientificExplanation:
      'Friction transfers surface electrons between materials. When huge potential builds up between storm clouds and Earth, air breaks down into a rapid electric discharge (lightning).',
    gradeAdaptedNote:
      'Flagged as transitional/needs_verification for Curiosity edition alignment; marked Coming Soon for interactive simulation.',
    assessmentQuestions: [
      {
        id: 'c8_sta_q1',
        kind: 'conceptual',
        prompt: 'What do two similarly charged plastic straws do when brought near each other?',
        options: ['Attract strongly', 'Repel each other', 'Melt', 'Become magnetic'],
        correctIndex: 1,
        explanation: 'Like static charges always repel each other.',
      },
      {
        id: 'c8_sta_q2',
        kind: 'application',
        prompt: 'How does a lightning conductor protect a tall building during a thunderstorm?',
        options: [
          'It absorbs rain water',
          'It provides a safe low-resistance copper path carrying storm charge straight into the Earth',
          'It repels clouds with sound waves',
          'It insulates the roof with dry wood',
        ],
        correctIndex: 1,
        explanation: 'Earthing transfers dangerous static discharge harmlessly into the ground.',
      },
    ],
  },

  // =========================================================================
  // CLASS 9 — EXPLORATION / RATIONALISED SCIENCE
  // =========================================================================
  {
    id: 'c9_distance_displacement_graphs',
    title: 'Distance vs. Displacement & Acceleration Motion Graphs',
    classLevel: 9,
    chapterId: 'c9_ch4',
    chapterNumber: 7,
    chapterTitle: 'Motion',
    topicArea: 'motion_measurement',
    relevantConcept: 'Vector displacement, uniform/non-uniform acceleration a = (v−u)/t & motion graphs',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'motion_kinematics',
    simulationPreset: 'class9_graphs_acceleration',
    reusedAcrossClasses: [6, 7, 9],
    learningObjective:
      'Analyze velocity–time and distance–time graphs quantitatively, test uniform acceleration s = ut + ½at², and compare distance with displacement.',
    whyItImportant:
      'Motion graphs and kinematic equations let scientists predict braking distances and orbital paths.',
    realWorldApplication:
      'Vehicle ABS braking calculations, rocket launch telemetry, and sports biomechanics.',
    description:
      'Control initial velocity u and acceleration a (including negative deceleration!) to trace live v–t and x–t plots simultaneously, or switch to Circular Motion to inspect changing velocity direction.',
    apparatus: ['Linear/Circular kinematics stage', 'Live x–t & v–t dual plotter', 'Velocity vector indicator'],
    procedure: [
      'Set u = 2 m/s and a = 1.5 m/s² and press Play; inspect the curved parabola in distance vs. straight sloped velocity line.',
      'Try negative acceleration (a = −1.5 m/s²) with u = 9 m/s to watch braking deceleration.',
      'Switch to Circular Orbit mode and observe why velocity direction changes continuously even at constant speed.',
    ],
    observationsGuide: [
      'Constant positive acceleration yields a linearly rising v–t graph and a parabolic x–t curve.',
      'In circular motion, one complete lap produces distance 2πr while net displacement equals zero.',
    ],
    expectedOutcome:
      'Students connect kinematic equations s = ut + ½at² and v = u + at directly to graph slopes and areas.',
    scientificExplanation:
      'Acceleration is rate of change of velocity: a = (v − u)/t. Because velocity is a vector, either changing speed or changing direction (circular motion) constitutes acceleration.',
    gradeAdaptedNote:
      'Class 9 quantitative kinematics & graph interpretation using the shared Motion Kinematics engine.',
    assessmentQuestions: [
      {
        id: 'c9_kin_q1',
        kind: 'numerical',
        prompt: 'A car starts from rest (u = 0) and accelerates uniformly at 2 m/s² for 5 s. What is its final velocity?',
        options: ['2.5 m/s', '7 m/s', '10 m/s', '25 m/s'],
        correctIndex: 2,
        explanation: 'Using v = u + at = 0 + (2 × 5) = 10 m/s.',
      },
      {
        id: 'c9_kin_q2',
        kind: 'conceptual',
        prompt: 'An athlete completes one full lap around a circular track of radius R. What is their net displacement?',
        options: ['2πR', 'πR', '2R', '0 m'],
        correctIndex: 3,
        explanation:
          'Starting and ending at the exact same point makes net straight-line displacement zero, even though distance = 2πR.',
      },
      {
        id: 'c9_kin_q3',
        kind: 'application',
        prompt: 'What does the slope of a velocity–time graph represent?',
        options: ['Total distance', 'Acceleration', 'Mass', 'Momentum'],
        correctIndex: 1,
        explanation: 'Slope Δv / Δt on a v–t graph equals acceleration a.',
      },
    ],
  },
  {
    id: 'c9_newton_second_law_inertia',
    title: 'Newton’s Laws, Inertia & F = ma Force Explorer',
    classLevel: 9,
    chapterId: 'c9_ch6',
    chapterNumber: 8,
    chapterTitle: 'Force and Laws of Motion',
    topicArea: 'force_mechanics',
    relevantConcept: 'Inertia of mass, unbalanced net force & F_net = m · a',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'force_friction_buoyancy',
    simulationPreset: 'newton_second_law',
    reusedAcrossClasses: [8, 9],
    learningObjective:
      'Verify experimentally how acceleration scales directly with net unbalanced force and inversely with object mass (a = F_net / m).',
    whyItImportant:
      'Explains inertia in seatbelts, rocket thrust acceleration, and vehicle stopping forces.',
    realWorldApplication:
      'Car airbags extending collision time, sports throws, and crane load acceleration limits.',
    description:
      'Set mass m and applied force F on a low-friction track, read live acceleration a = F_net / m, and compare how heavier mass resists acceleration (inertia).',
    apparatus: ['Variable-mass cart', 'Calibrated horizontal force actuator', 'Live acceleration gauge'],
    procedure: [
      'Set friction μ = 0.05, mass = 2 kg, and applied force = 20 N; record acceleration.',
      'Double mass to 4 kg with the same force and observe acceleration drop to roughly half.',
      'Click the Test Block and Applied Force Vector to inspect inertia and F = ma.',
    ],
    observationsGuide: [
      'Doubling mass at fixed net force halves acceleration.',
      'When applied force balances friction exactly, acceleration is zero and velocity stays constant.',
    ],
    expectedOutcome:
      'Students verify F_net = ma quantitatively and relate larger mass to greater inertia.',
    scientificExplanation:
      'Newton’s First Law defines inertia—objects resist changes to their velocity unless acted on by an unbalanced force. Newton’s Second Law quantifies acceleration as a = F_net / m.',
    gradeAdaptedNote:
      'Reuses the Force & Buoyancy Engine configured for Class 9 quantitative F = ma testing.',
    assessmentQuestions: [
      {
        id: 'c9_new_q1',
        kind: 'numerical',
        prompt: 'A net unbalanced force of 24 N acts on a 6 kg trolley. What acceleration does it produce?',
        options: ['144 m/s²', '18 m/s²', '4 m/s²', '0.25 m/s²'],
        correctIndex: 2,
        explanation: 'a = F_net / m = 24 N / 6 kg = 4 m/s².',
      },
      {
        id: 'c9_new_q2',
        kind: 'conceptual',
        prompt: 'When a bus brakes suddenly, standing passengers lurch forward due to:',
        options: [
          'Gravity increasing sideways',
          'Inertia of motion keeping their upper body moving forward',
          'Air suction',
          'Wheel magnetism',
        ],
        correctIndex: 1,
        explanation: 'By Newton’s First Law, inertia tends to keep the upper body moving forward when feet stop with the floor.',
      },
    ],
  },
  {
    id: 'c9_archimedes_buoyancy_gravitation',
    title: 'Archimedes’ Principle, Relative Density & Weight in Fluids',
    classLevel: 9,
    chapterId: 'c9_grav_module',
    chapterNumber: 9,
    chapterTitle: 'Gravitation, Free Fall & Archimedes Buoyancy',
    topicArea: 'force_mechanics',
    relevantConcept: 'Weight W = mg, buoyant upthrust equal to displaced fluid weight & relative density',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    verificationNote:
      'Prescribed in NCERT Class 9 Science Ch. 9 ("Gravitation") and Lab Manual (Archimedes’ Principle).',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'force_friction_buoyancy',
    simulationPreset: 'archimedes_fluid',
    reusedAcrossClasses: [8, 9],
    learningObjective:
      'Verify Archimedes’ Principle by comparing object weight against buoyant upthrust and computing relative density.',
    whyItImportant:
      'Allows engineers to determine ship displacement, milk purity (lactometers), and submarine ballast.',
    realWorldApplication:
      'Ship Plimsoll load lines, lactometers, and hydrometers.',
    description:
      'Adjust solid block density relative to freshwater (1000 kg/m³) or brine (1150 kg/m³) to inspect apparent weight and submerged fraction.',
    apparatus: ['Spring weight gauge (N)', 'Immersion tank', 'Variable-density test block'],
    procedure: [
      'Immerse a block of density 2000 kg/m³ in water (1000 kg/m³) and compare weight vs. buoyant force.',
      'Observe apparent weight reduction = buoyant force.',
      'Lower block density to 750 kg/m³ and measure what fraction stays submerged (75%).',
    ],
    observationsGuide: [
      'A fully submerged block experiences buoyant force equal to fluid weight of equal volume.',
      'A floating object immerses just enough volume so displaced fluid weight equals its total weight.',
    ],
    expectedOutcome:
      'Students verify Archimedes’ Principle quantitatively and compute relative density.',
    scientificExplanation:
      'Gravity pulls mass downward with W = mg (varying across planets, while mass m stays constant). Fluid pressure rising with depth creates upward buoyant force F_b = ρ_fluid · V_sub · g.',
    gradeAdaptedNote:
      'Reuses Force & Buoyancy Engine with quantitative N readouts for Class 9 Ch. 9.',
    assessmentQuestions: [
      {
        id: 'c9_arc_q1',
        kind: 'numerical',
        prompt: 'A stone weighs 12 N in air and appears to weigh 8 N when completely immersed in water. What is the buoyant force exerted by water?',
        options: ['20 N', '12 N', '8 N', '4 N'],
        correctIndex: 3,
        explanation: 'Buoyant force = loss in weight = 12 N − 8 N = 4 N.',
      },
      {
        id: 'c9_arc_q2',
        kind: 'conceptual',
        prompt: 'According to Archimedes’ Principle, the upward buoyant force on an immersed body equals:',
        options: [
          'The weight of the fluid displaced by the body',
          'Twice the mass of the container',
          'Atmospheric temperature',
          'Only the density of the metal block',
        ],
        correctIndex: 0,
        explanation: 'Upthrust equals the exact weight of fluid displaced by the submerged volume.',
      },
      {
        id: 'c9_arc_q3',
        kind: 'numerical',
        prompt: 'An object has mass 10 kg. What is its weight on Earth (g = 9.8 m/s²)?',
        options: ['10 N', '19.8 N', '98 N', '0.98 N'],
        correctIndex: 2,
        explanation: 'Weight W = m · g = 10 kg × 9.8 m/s² = 98 N (while mass stays 10 kg).',
      },
    ],
  },
  {
    id: 'c9_conservation_of_energy_machines',
    title: 'Conservation of Mechanical Energy, Levers & Pulleys',
    classLevel: 9,
    chapterId: 'c9_ch7',
    chapterNumber: 10,
    chapterTitle: 'Work and Energy (with Simple Machines Extension)',
    topicArea: 'work_energy_machines',
    relevantConcept: 'KE = ½mv², PE = mgh, total energy conservation, levers & pulley mechanical advantage',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'simple_machines_energy',
    simulationPreset: 'energy_and_machines',
    reusedAcrossClasses: [9],
    learningObjective:
      'Track gravitational potential energy transforming seamlessly into kinetic energy and explore how levers and pulleys multiply force.',
    whyItImportant:
      'Conservation of energy and mechanical advantage underpin every machine from bicycles to hydroelectric dams.',
    realWorldApplication:
      'Roller coasters, hydroelectric turbines, construction cranes, and crowbars.',
    description:
      'Switch between Pendulum Conservation (watch KE & PE bars trade continuously) and Pulley/Lever Machine mode (measure Effort force vs. Load and Mechanical Advantage).',
    apparatus: ['Energy conservation pendulum', 'Live KE/PE meter', 'Pulley & Lever assembly'],
    procedure: [
      'Release the pendulum from 5.0 m height with zero damping and track KE + PE = constant.',
      'Switch to Lever & Pulley mode and increase pulley rope strands from 1 to 4 to cut lifting effort.',
      'Click the Energy Gauge, Fulcrum, or Pulley Wheel to understand mechanical advantage vs. work.',
    ],
    observationsGuide: [
      'At peak height KE = 0 and PE = max; at lowest point PE = 0 and KE = max.',
      'A 4-strand pulley cuts effort to one-fourth of load weight while requiring 4× rope pulled.',
    ],
    expectedOutcome:
      'Students verify mechanical energy conservation and explain why simple machines reduce force without reducing work.',
    scientificExplanation:
      'Work W = F·d changes an object’s energy. Ignoring friction, mgh + ½mv² stays constant. Simple machines satisfy F_effort × d_effort = Load × h_lift.',
    gradeAdaptedNote:
      'Built specifically for Class 9 Exploration Ch. 7 combining Energy Conservation with Simple Machines.',
    assessmentQuestions: [
      {
        id: 'c9_en_q1',
        kind: 'numerical',
        prompt: 'A 2 kg ball is held 5 m above the ground (g = 10 m/s²). What is its Potential Energy?',
        options: ['10 J', '25 J', '50 J', '100 J'],
        correctIndex: 3,
        explanation: 'PE = m·g·h = 2 × 10 × 5 = 100 J.',
      },
      {
        id: 'c9_en_q2',
        kind: 'conceptual',
        prompt: 'If a pulley system has Mechanical Advantage = 3, how much ideal effort lifts a 300 N load?',
        options: ['900 N', '300 N', '100 N', '30 N'],
        correctIndex: 2,
        explanation: 'Effort = Load / MA = 300 N / 3 = 100 N.',
      },
    ],
  },
  {
    id: 'c9_sound_waves_echo',
    title: 'Sound Waves, Frequency/Pitch, Amplitude & Echo Reflection',
    classLevel: 9,
    chapterId: 'c9_ch10',
    chapterNumber: 11,
    chapterTitle: 'Sound',
    topicArea: 'sound_waves',
    relevantConcept: 'Longitudinal compressions & rarefactions, v = fλ, T = 1/f, pitch, loudness & echo delay',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'sound_wave_lab',
    simulationPreset: 'waves_and_echo',
    reusedAcrossClasses: [9],
    learningObjective:
      'Observe how frequency controls pitch and wavelength, amplitude controls loudness, and minimum wall distance enables a distinct echo.',
    whyItImportant:
      'Connects acoustic waves to musical instruments, medical ultrasound imaging, and sonar depth sounding.',
    realWorldApplication:
      'Medical ultrasound scans, ocean sonar mapping, and concert hall acoustic panels.',
    description:
      'Adjust vibration frequency (Hz), amplitude (%), and reflection wall distance to watch longitudinal air particles form compressions and rarefactions plus round-trip echo timing.',
    apparatus: ['Variable-frequency tuning source', 'Air particle longitudinal tube', 'Echo reflecting wall'],
    procedure: [
      'Raise frequency from 220 Hz to 660 Hz and watch compressions pack closer together (shorter λ).',
      'Increase amplitude to see particles oscillate wider (louder sound) without changing wavelength.',
      'Toggle Echo Reflection mode and test wall distances below and above 17.2 m in air (343 m/s).',
    ],
    observationsGuide: [
      'Higher frequency decreases time period T = 1/f and shortens wavelength λ = v/f.',
      'For a distinct human echo (0.1 s persistence), the obstacle in air must be at least ~17.2 m away.',
    ],
    expectedOutcome:
      'Students distinguish pitch (frequency) from loudness (amplitude) and compute echo round-trip distance.',
    scientificExplanation:
      'Sound travels as longitudinal waves of alternating compressions (high pressure) and rarefactions (low pressure) at speed v = fλ. Ultrasound (>20 kHz) travels cleanly for medical diagnostics and sonar.',
    gradeAdaptedNote:
      'Covers Class 9 Exploration Ch. 10 Sound Waves and echo reflection calculations.',
    assessmentQuestions: [
      {
        id: 'c9_snd_q1',
        kind: 'numerical',
        prompt: 'A sound wave has frequency 500 Hz and travels at 340 m/s in air. What is its wavelength?',
        options: ['0.68 m', '1.47 m', '170 m', '840 m'],
        correctIndex: 0,
        explanation: 'λ = v / f = 340 / 500 = 0.68 m.',
      },
      {
        id: 'c9_snd_q2',
        kind: 'conceptual',
        prompt: 'Which wave property determines the loudness (intensity) of a sound?',
        options: ['Frequency', 'Amplitude', 'Speed in air', 'Wave medium alone'],
        correctIndex: 1,
        explanation: 'Loudness grows with the square of vibration amplitude; frequency controls pitch.',
      },
      {
        id: 'c9_snd_q3',
        kind: 'numerical',
        prompt: 'An echo returns to a student 0.4 s after clapping near a cliff (speed of sound = 340 m/s). How far away is the cliff?',
        options: ['136 m', '68 m', '34 m', '17 m'],
        correctIndex: 1,
        explanation: 'Distance d = (v × t) / 2 = (340 × 0.4) / 2 = 68 m.',
      },
    ],
  },

  // =========================================================================
  // CLASS 10 — RATIONALISED NCERT SCIENCE
  // =========================================================================
  {
    id: 'c10_spherical_mirrors_focal',
    title: 'Focal Length & Image Formation in Spherical Mirrors',
    classLevel: 10,
    chapterId: 'c10_ch9',
    chapterNumber: 9,
    chapterTitle: 'Light – Reflection and Refraction',
    topicArea: 'light_optics',
    relevantConcept: 'Concave/convex mirror ray diagrams, focal length f = R/2 & mirror magnification',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'concave_mirror_image',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Trace principal rays off a concave mirror to locate real vs. virtual images and determine focal length.',
    whyItImportant:
      'Prescribed Class 10 Board Practical underpinning telescopes, solar concentrators, and rear-view mirrors.',
    realWorldApplication:
      'Automotive headlamp parabolic reflectors, shaving mirrors, and convex rear-view mirrors.',
    description:
      'Place an illuminated object at varying distances u from a concave mirror and inspect live ray intersections, image height, and mirror formula values.',
    apparatus: ['Concave mirror', 'Optical bench scale', 'Illuminated object arrow'],
    procedure: [
      'Move the object beyond 2F (centre of curvature C) to observe a diminished, inverted real image between F and C.',
      'Bring the object inside the focal point F and observe an enlarged upright virtual image behind the mirror.',
      'Click the Mirror or Reflected Ray inside the viewport to review the mirror formula 1/f = 1/v + 1/u.',
    ],
    observationsGuide: [
      'Real inverted images form when u > f; upright virtual magnified images form only when u < f.',
      'Convex mirrors always form diminished upright virtual images regardless of object distance.',
    ],
    expectedOutcome:
      'Students predict real/virtual, upright/inverted, and magnified/diminished mirror images using ray geometry.',
    scientificExplanation:
      'Paraxial rays parallel to the principal axis reflect through focus F; rays passing through C strike normally and retrace themselves. Their intersection locates image distance v via 1/f = 1/v + 1/u.',
    gradeAdaptedNote:
      'Class 10 Board Practical configuration of the shared Optics Ray Bench.',
    assessmentQuestions: [
      {
        id: 'c10_mir_q1',
        kind: 'conceptual',
        prompt: 'Where should an object be placed in front of a concave mirror to get a virtual, erect, and magnified image?',
        options: [
          'At infinity',
          'Beyond Centre of Curvature C',
          'Between Pole P and Focus F',
          'Exactly at C',
        ],
        correctIndex: 2,
        explanation:
          'Placing the object inside the focal length (between P and F) causes reflected rays to diverge as if from an enlarged upright virtual image behind the mirror.',
      },
      {
        id: 'c10_mir_q2',
        kind: 'numerical',
        prompt: 'A spherical mirror has radius of curvature R = 30 cm. What is its focal length f?',
        options: ['60 cm', '30 cm', '15 cm', '10 cm'],
        correctIndex: 2,
        explanation: 'For spherical mirrors of small aperture, f = R / 2 = 30 / 2 = 15 cm.',
      },
    ],
  },
  {
    id: 'c10_glass_slab_refraction',
    title: 'Refraction Through a Rectangular Glass Slab (Snell’s Law)',
    classLevel: 10,
    chapterId: 'c10_ch9',
    chapterNumber: 9,
    chapterTitle: 'Light – Reflection and Refraction',
    topicArea: 'light_optics',
    relevantConcept: 'Snell’s Law n₁ sin i = n₂ sin r, bending toward/away from normal & lateral shift',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'glass_slab',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Measure angles of incidence, refraction, and emergence through a glass slab and verify Snell’s law.',
    whyItImportant:
      'Explains why underwater objects appear shallower and how optical fibres and camera lenses bend light.',
    realWorldApplication:
      'Camera lenses, optical glass prisms, fibre-optic cables, and corrective eyewear.',
    description:
      'Aim a ray at a rectangular glass slab of adjustable refractive index n and angle of incidence i, observing bending toward the normal inside glass and parallel emergent ray.',
    apparatus: ['Rectangular glass slab', 'Laser ray pointer', 'Normal & angle protractor'],
    procedure: [
      'Set angle of incidence i = 40° and refractive index n = 1.50 (crown glass).',
      'Read refracted angle r inside the glass and emergent angle e outside.',
      'Check sin(i)/sin(r) and verify the emergent ray stays parallel to the incident ray with lateral shift.',
    ],
    observationsGuide: [
      'Entering optically denser glass (n > 1) bends the ray toward the normal (r < i).',
      'Emerging back into air bends away identically so e = i.',
    ],
    expectedOutcome:
      'Students verify Snell’s Law n₁ sin i = n₂ sin r and explain lateral displacement.',
    scientificExplanation:
      'Light slows down inside optically denser media (v = c/n), causing its wavefront to tilt toward the normal at the boundary while keeping wave frequency constant.',
    gradeAdaptedNote:
      'Class 10 NCERT Prescribed Practical on rectangular glass slab refraction.',
    assessmentQuestions: [
      {
        id: 'c10_slb_q1',
        kind: 'conceptual',
        prompt: 'When a ray passes from air into glass at an oblique angle, how does it bend?',
        options: [
          'Away from the normal',
          'Toward the normal because light slows down in glass',
          'It reflects 100% without entering',
          'It travels straight without bending',
        ],
        correctIndex: 1,
        explanation: 'Passing into a medium with higher refractive index slows light and bends the ray toward the normal.',
      },
      {
        id: 'c10_slb_q2',
        kind: 'numerical',
        prompt: 'The refractive index of crown glass is 1.50 and speed of light in vacuum is 3 × 10⁸ m/s. What is light’s speed inside glass?',
        options: ['4.5 × 10⁸ m/s', '2.0 × 10⁸ m/s', '1.5 × 10⁸ m/s', '3.0 × 10⁸ m/s'],
        correctIndex: 1,
        explanation: 'v = c / n = (3.0 × 10⁸) / 1.50 = 2.0 × 10⁸ m/s.',
      },
      {
        id: 'c10_slb_q3',
        kind: 'conceptual',
        prompt: 'How does the emergent ray leaving a parallel-sided glass slab compare to the original incident ray?',
        options: [
          'It bends 90° sideways',
          'It emerges parallel to the incident ray (angle e = i), shifted laterally',
          'It stops inside the slab',
          'It converges to a single point',
        ],
        correctIndex: 1,
        explanation: 'Opposite parallel faces produce equal and opposite refraction, keeping e = i with a sideways lateral displacement.',
      },
    ],
  },
  {
    id: 'c10_convex_lens_image',
    title: 'Convex & Concave Lens Focal Length & Image Formation',
    classLevel: 10,
    chapterId: 'c10_ch9',
    chapterNumber: 9,
    chapterTitle: 'Light – Reflection and Refraction',
    topicArea: 'light_optics',
    relevantConcept: 'Thin lens formula 1/f = 1/v − 1/u, convex vs. concave lenses & optical power P = 1/f (D)',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'convex_lens_image',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Determine image position, magnification, and lens power P = 1/f across both convex (converging) and concave (diverging) thin lenses.',
    whyItImportant:
      'Explains human eye focusing, microscopes, magnifying glasses, and positive/negative spectacle lens prescriptions.',
    realWorldApplication:
      'Positive (+D) and negative (−D) eyeglass prescriptions, projector lenses, and smartphone cameras.',
    description:
      'Slide object distance u and switch between Convex Lens and Concave Lens optical modes to watch principal rays converge into real/virtual images or diverge into upright diminished virtual images.',
    apparatus: ['Double convex & biconcave lenses', 'Illuminated arrow object', 'Movable image screen'],
    procedure: [
      'In Convex Lens mode, position the object beyond 2F and confirm a smaller inverted real image forms between F and 2F.',
      'Move object to 2F (real, inverted, same size at 2F) and inside F (virtual magnified magnifying glass).',
      'Switch to Concave Lens mode and verify rays always diverge to form a virtual, erect, diminished image between O and F₁.',
    ],
    observationsGuide: [
      'Shorter focal length f means stronger lens power P = 1/f (D); convex has +f/+D while concave has −f/−D.',
      'Convex lenses form real inverted images except when u < f; concave lenses always form virtual, upright, diminished images.',
    ],
    expectedOutcome:
      'Students apply 1/f = 1/v − 1/u across both converging and diverging lenses and compute Dioptre power P = 1/f(m).',
    scientificExplanation:
      'A convex lens refracts rays toward the principal axis (positive focal length), whereas a concave lens refracts rays outward (negative focal length). Both obey 1/f = 1/v − 1/u.',
    gradeAdaptedNote:
      'Reuses the central Optics Ray Bench in Class 10 Thin Lens quantitative mode (Convex + Concave Lens).',
    assessmentQuestions: [
      {
        id: 'c10_lns_q1',
        kind: 'numerical',
        prompt: 'What is the optical power of a convex lens whose focal length is +0.5 m?',
        options: ['+0.5 D', '+2.0 D', '−2.0 D', '+5.0 D'],
        correctIndex: 1,
        explanation: 'Power P = 1 / f(m) = 1 / 0.5 = +2.0 Dioptre (D).',
      },
      {
        id: 'c10_lns_q2',
        kind: 'conceptual',
        prompt: 'What kind of image does a concave (diverging) lens ALWAYS form for a real object?',
        options: [
          'Real, inverted, and magnified',
          'Virtual, erect, and diminished on the same side as the object',
          'Real and same size at 2F',
          'Inverted and enlarged beyond 2F',
        ],
        correctIndex: 1,
        explanation: 'Because a concave lens spreads rays apart, backward extensions always meet between O and F₁ to form an upright, diminished, virtual image.',
      },
      {
        id: 'c10_lns_q3',
        kind: 'conceptual',
        prompt: 'Where should a candle be placed in front of a convex lens to form a real, inverted image of the EXACT same size?',
        options: ['At focus F₁', 'Between O and F₁', 'At 2F₁', 'Beyond infinity'],
        correctIndex: 2,
        explanation: 'When object distance u = −2f (at 2F₁), the real inverted image forms at 2F₂ with magnification m = −1.',
      },
    ],
  },
  {
    id: 'c10_prism_dispersion_eye',
    title: 'Prism Dispersion & Human Eye Vision Correction',
    classLevel: 10,
    chapterId: 'c10_ch10',
    chapterNumber: 10,
    chapterTitle: 'The Human Eye and the Colourful World',
    topicArea: 'light_optics',
    relevantConcept: 'Refraction through glass prism, VIBGYOR dispersion & myopia/hypermetropia lenses',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'prism_dispersion',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Trace white light splitting into the seven-colour spectrum through a triangular glass prism and understand why violet bends more than red.',
    whyItImportant:
      'Explains natural rainbows and how wavelength-dependent refraction works across optical prisms.',
    realWorldApplication:
      'Spectrometers identifying star elements, rainbows after rainfall, and corrective myopia/hypermetropia glasses.',
    description:
      'Send white light at varying incidence angles into an equilateral glass prism to inspect angle of deviation δ and spectral separation from Red to Violet.',
    apparatus: ['Equilateral glass prism (60°)', 'White-light collimator slit', 'Spectrum screen'],
    procedure: [
      'Aim the white beam onto the prism face and watch violet bend steepest while red bends least.',
      'Vary incidence angle to observe minimum deviation and full VIBGYOR spread.',
      'Click the Refracted Ray and Normal to explore why dispersion occurs.',
    ],
    observationsGuide: [
      'Violet light travels slightly slower in glass than red light, giving a larger refractive index and greater deviation.',
      'A rainbow forms by combined refraction, dispersion, and internal reflection inside raindrops.',
    ],
    expectedOutcome:
      'Students explain spectral dispersion by wavelength-dependent refractive index inside glass.',
    scientificExplanation:
      'White sunlight is a mixture of wavelengths. Glass has slightly higher refractive index n for shorter violet wavelengths than longer red wavelengths, separating the colours cleanly.',
    gradeAdaptedNote:
      'Reuses Optics Ray Bench in Prism Dispersion mode for Class 10 Ch. 10.',
    assessmentQuestions: [
      {
        id: 'c10_prs_q1',
        kind: 'conceptual',
        prompt: 'Which colour of visible light bends the MOST when white light passes through a glass prism?',
        options: ['Red', 'Yellow', 'Green', 'Violet'],
        correctIndex: 3,
        explanation: 'Violet has the shortest visible wavelength and encounters the highest refractive index in glass, bending most.',
      },
      {
        id: 'c10_prs_q2',
        kind: 'application',
        prompt: 'Which lens is prescribed to correct myopia (nearsightedness)?',
        options: ['Convex lens', 'Concave (diverging) lens', 'Plane glass', 'Cylindrical mirror'],
        correctIndex: 1,
        explanation:
          'Myopia focuses distant light in front of the retina; a concave lens diverges rays slightly so they focus right onto the retina.',
      },
    ],
  },
  {
    id: 'c10_ohms_law_verification',
    title: 'Verification of Ohm’s Law (V–I Graph & Resistance)',
    classLevel: 10,
    chapterId: 'c10_ch11',
    chapterNumber: 11,
    chapterTitle: 'Electricity',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'V = I·R proportionality, linear V–I graph & Joule heating power P = VI',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'ohms_law',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Verify Ohm’s Law V = I·R experimentally, plot the V–I line, and compute resistance from its slope.',
    whyItImportant:
      'Fundamental law of electrical engineering governing household wiring, chargers, and resistors.',
    realWorldApplication:
      'LED current-limiting resistors, electric heater coils, and fuse current ratings.',
    description:
      'Vary battery voltage V (1.5 V–12 V) and resistor R (2 Ω–30 Ω) while reading live current I (A), power P (W), and real-time V–I curve slope.',
    apparatus: ['Variable DC Power Supply', 'Known resistor R', 'Digital Ammeter & Voltmeter', 'Plug key switch'],
    procedure: [
      'Close the switch and sweep Voltage from 2 V to 10 V keeping R fixed at 10 Ω.',
      'Observe that current I scales linearly with V (V/I remains constant = 10 Ω).',
      'Click the Resistor and Current Arrows inside the canvas to inspect Joule heating and electron drift.',
    ],
    observationsGuide: [
      'At constant resistance, doubling voltage doubles electric current.',
      'Higher resistance drops current and dims the series load bulb.',
    ],
    expectedOutcome:
      'Students confirm linear V ∝ I behaviour and determine R = V / I accurately.',
    scientificExplanation:
      'Ohm’s Law states that at constant temperature, potential difference V across a metallic conductor is directly proportional to current I: V = IR, with power dissipated P = VI = I²R.',
    gradeAdaptedNote:
      'Class 10 Board Practical mode of the reusable Electric Circuit Workbench.',
    assessmentQuestions: [
      {
        id: 'c10_ohm_q1',
        kind: 'numerical',
        prompt: 'A 12 V battery drives a steady current of 0.6 A through a heating coil. What is its resistance?',
        options: ['7.2 Ω', '12.6 Ω', '20 Ω', '0.05 Ω'],
        correctIndex: 2,
        explanation: 'R = V / I = 12 V / 0.6 A = 20 Ω.',
      },
      {
        id: 'c10_ohm_q2',
        kind: 'conceptual',
        prompt: 'On a Voltage (Y-axis) vs. Current (X-axis) graph for an ohmic resistor, what does the straight-line slope equal?',
        options: ['Power', 'Resistance R', 'Charge', 'Voltage drop'],
        correctIndex: 1,
        explanation: 'Slope = ΔV / ΔI = R.',
      },
    ],
  },
  {
    id: 'c10_series_parallel_resistors',
    title: 'Resistors in Series & Parallel Equivalent Resistance Lab',
    classLevel: 10,
    chapterId: 'c10_ch11',
    chapterNumber: 11,
    chapterTitle: 'Electricity',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Series R_s = R₁ + R₂ vs. Parallel 1/R_p = 1/R₁ + 1/R₂ current division',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'series_parallel',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Compare equivalent resistance, branch currents, and voltage sharing when R₁ and R₂ are connected in series versus parallel.',
    whyItImportant:
      'Explains why home wall sockets are wired in parallel so appliances keep independent 220 V supply and switches.',
    realWorldApplication:
      'Household parallel wiring circuits versus old series decorative string lights.',
    description:
      'Toggle instantly between Series and Parallel wiring for resistors R₁ and R₂ powered by battery V, reading live equivalent resistance R_eq, total current, and branch currents.',
    apparatus: ['DC Voltage Source', 'Two variable resistors R₁ & R₂', 'Series/Parallel topology selector'],
    procedure: [
      'Set R₁ = 6 Ω, R₂ = 12 Ω, V = 12 V in Series mode and verify R_eq = 18 Ω and single loop current I = 0.67 A.',
      'Switch to Parallel mode with identical values and observe R_eq drop to 4 Ω while total current rises to 3.0 A.',
      'Verify I_total = I₁ + I₂ in parallel mode.',
    ],
    observationsGuide: [
      'Series equivalent resistance is always larger than either resistor alone; parallel equivalent resistance is smaller than the smallest branch.',
      'Parallel branches share equal voltage V while splitting current inversely with resistance.',
    ],
    expectedOutcome:
      'Students compute and experimentally verify both R_s = R₁ + R₂ and R_p = (R₁R₂)/(R₁+R₂).',
    scientificExplanation:
      'In series, charges must cross both resistors one after another so resistances add. In parallel, extra pathways lower net opposition and provide full supply voltage across every branch.',
    gradeAdaptedNote:
      'Covers both Class 10 Prescribed Practicals (Resistors in Series & Resistors in Parallel) in one interactive circuit topology engine.',
    assessmentQuestions: [
      {
        id: 'c10_ser_q1',
        kind: 'numerical',
        prompt: 'Two 10 Ω resistors are connected in parallel across a 10 V battery. What is their equivalent resistance?',
        options: ['20 Ω', '10 Ω', '5 Ω', '2 Ω'],
        correctIndex: 2,
        explanation: '1/R_p = 1/10 + 1/10 = 2/10, so R_p = 5 Ω.',
      },
      {
        id: 'c10_ser_q2',
        kind: 'application',
        prompt: 'Why are household lights and fans wired in parallel rather than series?',
        options: [
          'Series uses too little current',
          'Parallel gives every appliance full voltage and independent switching without cutting others off',
          'Parallel increases resistance to infinity',
          'Series cannot use copper wires',
        ],
        correctIndex: 1,
        explanation:
          'In parallel, switching off or blowing one bulb leaves every other branch closed at full supply voltage.',
      },
    ],
  },
  {
    id: 'c10_bar_magnet_field_lines',
    title: 'Magnetic Field Lines Around a Bar Magnet (2D & 3D)',
    classLevel: 10,
    chapterId: 'c10_ch12',
    chapterNumber: 12,
    chapterTitle: 'Magnetic Effects of Electric Current',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Closed continuous field loops, non-intersection rule & dipole flux density B',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d_3d',
    simulationEngineId: 'bar_magnet',
    simulationPreset: 'class10_field_lines',
    reusedAcrossClasses: [6, 10],
    learningObjective:
      'Map continuous dipole field lines in 2D and 3D, prove why field lines never intersect, and measure local magnetic flux density |B|.',
    whyItImportant:
      'Activity 12.2 & 12.3 foundation for understanding solenoids, generators, and magnetic flux.',
    realWorldApplication:
      'MRI superconducting magnets, magnetic levitation trains, and electric generators.',
    description:
      'Manipulate dipole strength, 2D compass probes, vector grids, and 3D orbitable field loops. Click field lines, arrows, poles, or compass pivot to inspect component physics.',
    apparatus: ['Bar magnet dipole', 'Draggable compass telemetry probe (mT & °)', '3D WebGL field-line visualizer'],
    procedure: [
      'Observe the closed-loop density near N and S poles as you raise Magnetic Strength from 0.5× to 2.0×.',
      'Drag the 2D compass near the pole versus far along the equator to compare |B| (mT) and tangent alignment.',
      'Switch to 3D Dipole Lab and click Field Direction Arrows or Field Lines twice to see why two lines never cross.',
    ],
    observationsGuide: [
      'Field lines emerge from North and enter South outside the magnet while continuing South→North internally.',
      'Crowded lines near poles represent stronger |B|; at any point, the compass takes one unique tangent direction.',
    ],
    expectedOutcome:
      'Students explain closed dipole loops, inverse-cube decay with distance, and non-intersection from unique local tangent vectors.',
    scientificExplanation:
      'The magnetic dipole field B = (μ₀/4π)[3(m·r̂)r̂ − m]/r³ defines a single unique vector at every spatial coordinate. Because two crossing lines would require a compass to point in two directions simultaneously, field lines never intersect.',
    gradeAdaptedNote:
      'Reuses the Bar Magnet 2D + 3D engine adapted for Class 10 flux density, vector tangent, and non-intersection mastery.',
    assessmentQuestions: [
      {
        id: 'c10_mag_q1',
        kind: 'conceptual',
        prompt: 'Why do two magnetic field lines never cross each other?',
        options: [
          'They have the same colour',
          'At an intersection a compass needle would have to point in two directions simultaneously, which is impossible',
          'Magnets push field lines out of the page',
          'They only exist near the North pole',
        ],
        correctIndex: 1,
        explanation:
          'At every point in space, net magnetic field B has one unique direction; crossing lines would imply two conflicting directions.',
      },
      {
        id: 'c10_mag_q2',
        kind: 'conceptual',
        prompt: 'Inside a bar magnet, what is the direction of magnetic field lines?',
        options: [
          'From North pole to South pole',
          'From South pole back to North pole, forming closed loops',
          'Strictly perpendicular to the magnet',
          'Zero inside the bar',
        ],
        correctIndex: 1,
        explanation:
          'Outside the magnet lines run N → S, and inside they return S → N so every magnetic field line forms a continuous closed loop.',
      },
    ],
  },
  {
    id: 'c10_solenoid_conductor_field',
    title: 'Magnetic Field of Current-Carrying Wire & Solenoid',
    classLevel: 10,
    chapterId: 'c10_ch12',
    chapterNumber: 12,
    chapterTitle: 'Magnetic Effects of Electric Current',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Oersted deflection, Right-Hand Thumb Rule & uniform solenoid field',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'solenoid_class10',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Investigate how current magnitude, polarity reversal, and coil turn count shape the magnetic field of a solenoid.',
    whyItImportant:
      'Directly connects electric current to uniform solenoid fields used in relays, speakers, and electric motors.',
    realWorldApplication:
      'Electric motors, MRI coils, solenoid valves, and loudspeaker voice coils.',
    description:
      'Drive variable DC current through a solenoid coil, flip supply voltage, change winding turns N, and watch compass alignment and magnetic pole polarity respond.',
    apparatus: ['Multi-turn copper solenoid', 'Variable DC supply', 'Compass probe & pole indicator'],
    procedure: [
      'Increase voltage to boost current I and note the proportional rise in solenoid magnetic field index.',
      'Increase coil turns N and see field lines inside the coil pack tighter.',
      'Click the Electromagnet Coil to inspect the Right-Hand Thumb Rule.',
    ],
    observationsGuide: [
      'A current-carrying solenoid behaves closely like a bar magnet whose strength scales with current I and turn density n.',
      'Cutting current returns magnetic strength to zero.',
    ],
    expectedOutcome:
      'Students relate solenoid polarity to current direction and strength to n × I.',
    scientificExplanation:
      'Each circular turn contributes magnetic flux along the central axis; summing N turns produces a nearly uniform internal field B ∝ μ₀ n I.',
    gradeAdaptedNote:
      'Class 10 quantitative solenoid extension built on the reusable Electric Circuit Workbench.',
    assessmentQuestions: [
      {
        id: 'c10_sol_q1',
        kind: 'conceptual',
        prompt: 'What does the magnetic field inside a long straight current-carrying solenoid look like?',
        options: [
          'Zero at the centre',
          'Uniform, with parallel equally spaced field lines along the axis',
          'Circular loops pointing sideways out of the ends only',
          'Randomly oscillating',
        ],
        correctIndex: 1,
        explanation:
          'Inside a long solenoid, field lines run parallel and evenly spaced, indicating a uniform magnetic field.',
      },
      {
        id: 'c10_sol_q2',
        kind: 'conceptual',
        prompt: 'What happens if you reverse the direction of electric current flowing through a solenoid?',
        options: [
          'Its magnetic North and South poles swap ends',
          'The magnetic field doubles permanently',
          'The copper wire turns into plastic',
          'Nothing changes',
        ],
        correctIndex: 0,
        explanation: 'Reversing current direction reverses the direction of magnetic field lines, swapping N and S poles.',
      },
    ],
  },
  {
    id: 'c10_electric_motor_principle',
    title: 'Force on Current-Carrying Conductor & Electric Motor Principle',
    classLevel: 10,
    chapterId: 'c10_ch12',
    chapterNumber: 12,
    chapterTitle: 'Magnetic Effects of Electric Current',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Fleming’s Left-Hand Rule, magnetic force F = BIL & electric motor torque',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Understand why a current-carrying conductor placed perpendicular to a magnetic field experiences a sideways force.',
    whyItImportant:
      'Forms the operating principle of every electric fan, mixer, EV traction motor, and washing machine.',
    realWorldApplication:
      'Ceiling fans, electric vehicle motors, and railway traction drives.',
    description:
      'Activity-based study guide covering NCERT Activity 12.7 (kicking aluminum rod in a horseshoe magnet) and Fleming’s Left-Hand Rule.',
    apparatus: ['Horseshoe magnet', 'Suspended aluminum rod', 'DC battery & reversing key'],
    procedure: [
      'Trace current direction (middle finger) and magnetic field direction N→S (forefinger) using Fleming’s Left-Hand Rule.',
      'Predict the perpendicular thrust direction (thumb) when either current or magnet poles reverse.',
    ],
    observationsGuide: [
      'Reversing current direction reverses the rod’s sideways kick.',
      'Maximum force occurs when current and magnetic field are perpendicular (90°).',
    ],
    expectedOutcome:
      'Students determine magnetic force direction accurately using Fleming’s Left-Hand Rule.',
    scientificExplanation:
      'Moving charges inside a conductor interact with an external magnetic field B, creating Lorentz magnetic force perpendicular to both current and field.',
    gradeAdaptedNote:
      'Explanation/activity module for Class 10 Ch. 12; electric generator is noted as rationalised out of current Class 10 board exams.',
    assessmentQuestions: [
      {
        id: 'c10_mot_q1',
        kind: 'conceptual',
        prompt: 'In Fleming’s Left-Hand Rule, what does the Thumb represent?',
        options: [
          'Direction of electric current',
          'Direction of magnetic field',
          'Direction of force (motion) acting on the conductor',
          'Resistance of the wire',
        ],
        correctIndex: 2,
        explanation:
          'Forefinger = Field, Middle finger = Current, Thumb = Force / Motion (mutually perpendicular).',
      },
      {
        id: 'c10_mot_q2',
        kind: 'application',
        prompt: 'In a DC electric motor activity, how can you reverse the sideways push on the current-carrying rod?',
        options: [
          'Reverse either the current direction OR the magnetic poles',
          'Paint the rod red',
          'Remove the magnet completely',
          'Use a wooden rod instead of aluminum',
        ],
        correctIndex: 0,
        explanation: 'By Fleming’s Left-Hand Rule, reversing either magnetic field or current reverses the force vector.',
      },
    ],
  },
];

const CHAPTER_NUMBER_BY_ID: Record<string, number> = Object.values(NCERT_CLASS_CURRICULA).reduce(
  (acc, curriculum) => {
    for (const ch of curriculum.chapters) {
      acc[ch.id] = ch.chapterNumber;
    }
    return acc;
  },
  {} as Record<string, number>
);

export const EXPERIMENT_CATALOGUE: ExperimentCatalogItem[] = [
  ...CORE_NCERT_EXPERIMENTS,
  ...NCERT_EXPANDED_EXPERIMENTS,
]
  .map((item) => ({
    ...item,
    chapterNumber: CHAPTER_NUMBER_BY_ID[item.chapterId] ?? item.chapterNumber,
  }))
  .sort((a, b) => a.classLevel - b.classLevel || a.chapterNumber - b.chapterNumber);

export interface ClassCoverageRow {
  classLevel: GradeClassLevel;
  textbookSeries: string;
  physicsChaptersCount: number;
  physicsTopicsCount: number;
  totalExperimentsListed: number;
  simulatableCount: number;
  implementedCount: number;
  uniqueEnginesUsed: SimulationEngineId[];
  reusedFromOtherClassesCount: number;
  remainingToDevelopCount: number;
  verifiedCount: number;
  supplementaryCount: number;
  needsVerificationCount: number;
}

export interface CurriculumCoverageReport {
  totalUniqueSimulationEngines: number;
  implementedUniqueSimulationEngines: number;
  totalClassExperimentListings: number;
  totalInteractiveListings: number;
  totalRemainingToDevelop: number;
  rows: ClassCoverageRow[];
}

export function getExperimentsForClass(classLevel: GradeClassLevel): ExperimentCatalogItem[] {
  return EXPERIMENT_CATALOGUE.filter((item) => item.classLevel === classLevel);
}

export function getExperimentById(id: string): ExperimentCatalogItem | null {
  return EXPERIMENT_CATALOGUE.find((item) => item.id === id) || null;
}

export function computeCurriculumCoverageReport(): CurriculumCoverageReport {
  const seenEnginesGlobal = new Set<SimulationEngineId>();

  const rows: ClassCoverageRow[] = CLASS_LEVELS.map((classLevel) => {
    const curriculum = NCERT_CLASS_CURRICULA[classLevel];
    const items = getExperimentsForClass(classLevel);
    const enginesHere = new Set<SimulationEngineId>();
    let reusedCount = 0;

    for (const item of items) {
      if (item.simulationEngineId) {
        enginesHere.add(item.simulationEngineId);
        if (seenEnginesGlobal.has(item.simulationEngineId)) {
          reusedCount += 1;
        }
        seenEnginesGlobal.add(item.simulationEngineId);
      }
    }

    const implementedCount = items.filter((i) => isExperimentLaunchable(i)).length;

    const remainingToDevelopCount = items.filter(
      (i) => i.availabilityStatus === 'coming_soon'
    ).length;

    const simulatableCount = implementedCount + remainingToDevelopCount;

    const physicsTopicsCount = curriculum.chapters.reduce(
      (sum, ch) => sum + ch.physicsTopics.length,
      0
    );

    return {
      classLevel,
      textbookSeries: curriculum.textbookSeries,
      physicsChaptersCount: curriculum.chapters.length,
      physicsTopicsCount,
      totalExperimentsListed: items.length,
      simulatableCount,
      implementedCount,
      uniqueEnginesUsed: Array.from(enginesHere),
      reusedFromOtherClassesCount: reusedCount,
      remainingToDevelopCount,
      verifiedCount: items.filter((i) => i.verificationStatus === 'verified_ncert').length,
      supplementaryCount: items.filter(
        (i) => i.verificationStatus === 'supplementary_physix'
      ).length,
      needsVerificationCount: items.filter(
        (i) => i.verificationStatus === 'needs_verification'
      ).length,
    };
  });

  return {
    totalUniqueSimulationEngines: ALL_UNIQUE_SIMULATION_ENGINES.length,
    implementedUniqueSimulationEngines: ALL_UNIQUE_SIMULATION_ENGINES.filter(
      (e) => e.implemented
    ).length,
    totalClassExperimentListings: EXPERIMENT_CATALOGUE.length,
    totalInteractiveListings: rows.reduce((s, r) => s + r.implementedCount, 0),
    totalRemainingToDevelop: rows.reduce((s, r) => s + r.remainingToDevelopCount, 0),
    rows,
  };
}
