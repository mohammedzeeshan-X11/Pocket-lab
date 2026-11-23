import type { ExperimentCatalogItem } from '../types/physics.ts';

/**
 * Expanded Class-Wise NCERT Physics Activities & Practicals (Classes 6–10)
 * Covers the individual textbook experiments across Curiosity (Classes 6–8)
 * and Rationalised NCERT Science & Lab Manuals (Classes 9–10).
 */
export const NCERT_EXPANDED_EXPERIMENTS: ExperimentCatalogItem[] = [
  // =========================================================================
  // CLASS 6 — CURIOSITY (EXPANDED ACTIVITIES)
  // =========================================================================
  {
    id: 'c6_magnetic_nonmagnetic_sorting',
    title: 'Magnetic vs. Non-Magnetic Materials & Pole Iron-Filings Test',
    classLevel: 6,
    chapterId: 'c6_ch4',
    chapterNumber: 4,
    chapterTitle: 'Exploring Magnets',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Sorting magnetic materials (iron, nickel, cobalt) and locating strongest pull at poles',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Classify everyday materials as magnetic or non-magnetic and verify using iron filings that magnetic pull is strongest near the two poles.',
    whyItImportant:
      'Helps distinguish ferromagnetic metals from non-magnetic materials like wood, glass, plastic, copper, and aluminium.',
    realWorldApplication:
      'Separating iron scrap from municipal waste using magnetic drums and locating metal studs behind walls.',
    description:
      'Step-by-step NCERT Class 6 Ch. 4 activity sorting everyday objects with a bar magnet and rolling the magnet in iron filings to reveal pole concentration.',
    apparatus: [
      'Bar magnet',
      'Sample tray: iron nail, steel paperclip, plastic ruler, wooden pencil, glass marble, copper coin',
      'Sheet of white paper & fine iron filings',
    ],
    procedure: [
      'Bring the bar magnet close to each item on the tray one by one and record whether it is attracted.',
      'Group items that cling to the magnet as magnetic materials and those unaffected as non-magnetic.',
      'Spread fine iron filings evenly on a white paper sheet and roll the bar magnet across them.',
      'Lift the magnet and notice where the thickest clusters of filings stick (the two ends / poles).',
      'Place a cardboard sheet or wooden ruler between the magnet and a steel paperclip to test whether magnetism acts through non-magnetic barriers.',
    ],
    observationsGuide: [
      'Iron nails and steel paperclips stick firmly, while wood, plastic, glass, and copper do not.',
      'Iron filings cluster heavily at the two poles and very sparsely near the centre of the bar magnet.',
      'Magnetic attraction still passes cleanly through thin paper, glass, wood, and water.',
    ],
    expectedOutcome:
      'Students identify iron/nickel/cobalt as magnetic materials and confirm that maximum magnetic strength lies near the poles.',
    scientificExplanation:
      'Only ferromagnetic materials contain magnetic domains that align strongly in a magnet’s field. Because field lines enter and emerge most densely at the two ends of a bar magnet, iron filings crowd at the poles.',
    gradeAdaptedNote:
      'Mapped directly to NCERT Curiosity Class 6 Ch. 4 Activities 4.1, 4.2, and 4.6.',
    assessmentQuestions: [
      {
        id: 'c6_sort_q1',
        kind: 'conceptual',
        prompt: 'When you roll a bar magnet over fine iron filings, where do the MOST filings stick?',
        options: [
          'Only at the exact middle',
          'Uniformly across the entire surface',
          'Near the two ends (North and South poles)',
          'Nowhere on the magnet',
        ],
        correctIndex: 2,
        explanation:
          'Magnetic strength is greatest near the two poles of a bar magnet, so filings cluster densely at both ends.',
      },
      {
        id: 'c6_sort_q2',
        kind: 'application',
        prompt: 'Which group contains ONLY non-magnetic materials?',
        options: [
          'Iron nail, plastic comb, wooden scale',
          'Plastic ruler, glass marble, wooden pencil',
          'Steel pin, nickel coin, iron key',
          'Cobalt rod, rubber eraser, glass',
        ],
        correctIndex: 1,
        explanation:
          'Plastic, glass, and wood are non-magnetic; iron, steel, nickel, and cobalt are magnetic.',
      },
    ],
  },
  {
    id: 'c6_compass_making_suspension',
    title: 'Freely Suspended Magnet & DIY Floating-Needle Compass',
    classLevel: 6,
    chapterId: 'c6_ch4',
    chapterNumber: 4,
    chapterTitle: 'Exploring Magnets',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Directional North–South alignment of a freely suspended magnet & homemade magnetic compass',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d_3d',
    simulationEngineId: 'bar_magnet',
    simulationPreset: 'class6_suspended_compass',
    reusedAcrossClasses: [6, 10],
    learningObjective:
      'Verify that a freely suspended magnet always settles along the geographic North–South line and test how a magnetised floating needle works as a compass.',
    whyItImportant:
      'Explains how ancient sailors navigated open oceans in cloudy weather without seeing the Sun or stars.',
    realWorldApplication:
      'Marine navigation compasses, hiking compasses, and smartphone magnetometer orientation sensors.',
    description:
      'Explore directional alignment in the interactive 2D/3D bar-magnet and compass lab while following the NCERT Class 6 DIY floating cork-and-needle compass activity.',
    apparatus: [
      'Bar magnet & cotton thread stand',
      'Iron sewing needle (magnetised by stroking in one direction)',
      'Small cork piece & bowl of still water',
    ],
    procedure: [
      'Rotate the magnet in the 2D/3D viewport and observe how the freely pivoted compass aligns with the field line.',
      'To build the NCERT activity at home: stroke an iron needle 30–40 times in one direction with one pole of a bar magnet.',
      'Push the magnetised needle horizontally through a light cork and float it in a bowl of water away from iron objects.',
      'Gently turn the cork and observe that it always returns to point along the same North–South direction.',
    ],
    observationsGuide: [
      'A freely suspended magnet comes to rest along the North–South direction every time it is disturbed.',
      'Bringing another magnet close deflects the compass away from Earth’s weak field.',
    ],
    expectedOutcome:
      'Students verify the directional property of magnets and explain how stroking magnetises a steel needle into a working compass.',
    scientificExplanation:
      'Earth itself behaves like a giant magnet whose field gently turns any freely rotating magnetic needle until its North-seeking pole points toward geographic North.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 6 Ch. 4 Activities 4.3 & 4.4 with interactive 2D/3D compass exploration.',
    assessmentQuestions: [
      {
        id: 'c6_susp_q1',
        kind: 'conceptual',
        prompt: 'In which direction does a freely suspended bar magnet always come to rest away from other magnets?',
        options: ['East–West', 'North–South', 'Northeast–Southwest', 'Random direction each time'],
        correctIndex: 1,
        explanation:
          'Earth’s magnetic field aligns a freely suspended magnet along the geographic North–South direction.',
      },
      {
        id: 'c6_susp_q2',
        kind: 'application',
        prompt: 'When magnetising a sewing needle with a bar magnet, how should you stroke the needle?',
        options: [
          'Rub back and forth randomly with both poles',
          'Stroke repeatedly in ONE direction using the same pole',
          'Tap the needle once in the middle',
          'Heat the needle in boiling water first',
        ],
        correctIndex: 1,
        explanation:
          'Stroking consistently in one direction with one pole aligns the iron domains inside the needle.',
      },
    ],
  },
  {
    id: 'c6_curved_line_parallax',
    title: 'Avoiding Parallax Error, Broken-Zero Scale & Curved-Line Thread Test',
    classLevel: 6,
    chapterId: 'c6_ch5',
    chapterNumber: 5,
    chapterTitle: 'Measurement of Length and Motion',
    topicArea: 'motion_measurement',
    relevantConcept: 'SI units, eye-level parallax prevention, broken-scale offset subtraction & measuring curves with thread',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Measure straight lengths accurately without parallax or broken-zero errors and measure curved paths using a flexible thread.',
    whyItImportant:
      'Handspans vary from person to person; proper ruler alignment guarantees reproducible SI measurements everywhere.',
    realWorldApplication:
      'Tailoring cloth curves, map route tracing, engineering drafting, and carpentry.',
    description:
      'Hands-on NCERT Class 6 Ch. 5 measurement protocol comparing handspans, correcting broken-end ruler readings, keeping your eye vertically overhead, and tracing curved lines with string.',
    apparatus: [
      '30 cm metric ruler (mm & cm markings)',
      'Flexible non-stretchable cotton thread',
      'Pencil & curved path drawn on paper',
    ],
    procedure: [
      'Measure a table width with your handspan and compare with a classmate to see why standard SI units (metre/cm) are required.',
      'Place the ruler tightly along a pencil; read the mark with your eye directly vertical above the tip (never slanted).',
      'Simulate a broken zero end: start measuring from the 1.0 cm mark and subtract 1.0 cm from the final reading.',
      'Lay a cotton thread carefully along a curved line from start to finish, pinch the end mark, then stretch the thread along a straight metre scale.',
    ],
    observationsGuide: [
      'Viewing a ruler mark from the left or right angle shifts the apparent reading (parallax error).',
      'True length with a shifted start = Final reading − Initial reading.',
    ],
    expectedOutcome:
      'Students eliminate zero and parallax errors and measure curved paths accurately in centimetres and millimetres.',
    scientificExplanation:
      'Parallax occurs when the line of sight is oblique to the graduated scale face. A flexible thread conforms to curve arc length and preserves that length when straightened along a rigid SI scale.',
    gradeAdaptedNote:
      'Mapped directly to NCERT Curiosity Class 6 Ch. 5 measurement activities.',
    assessmentQuestions: [
      {
        id: 'c6_par_q1',
        kind: 'numerical',
        prompt: 'One end of a pencil sits at the 1.5 cm mark of a worn ruler and the tip sits at 14.8 cm. What is the pencil’s length?',
        options: ['16.3 cm', '14.8 cm', '13.3 cm', '12.3 cm'],
        correctIndex: 2,
        explanation: 'True length = 14.8 cm − 1.5 cm = 13.3 cm.',
      },
      {
        id: 'c6_par_q2',
        kind: 'conceptual',
        prompt: 'Where should your eye be positioned when reading a length mark on a ruler?',
        options: [
          'Tilted to the left side',
          'Directly vertically above the mark being read',
          'At a 45° angle from the zero end',
          'Closed while feeling the edge',
        ],
        correctIndex: 1,
        explanation: 'Looking straight down perpendicular to the scale eliminates parallax error.',
      },
    ],
  },
  {
    id: 'c6_circular_oscillatory_motion',
    title: 'Circular & Oscillatory Motion Explorer',
    classLevel: 6,
    chapterId: 'c6_ch5',
    chapterNumber: 5,
    chapterTitle: 'Measurement of Length and Motion',
    topicArea: 'motion_measurement',
    relevantConcept: 'Comparing rectilinear, circular orbit, and to-and-fro oscillatory motion',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'motion_kinematics',
    simulationPreset: 'class6_circular_motion',
    reusedAcrossClasses: [6, 7, 9],
    learningObjective:
      'Distinguish circular motion around a fixed centre from straight-line rectilinear motion and oscillatory to-and-fro motion.',
    whyItImportant:
      'Helps students classify real-world motion patterns in machines, swings, fans, and planetary orbits.',
    realWorldApplication:
      'Ceiling fan blades, merry-go-rounds, bicycle wheels, and playground swings.',
    description:
      'Launches directly in Circular Orbit mode so students can vary orbit radius and speed, compare curved distance with straight-line displacement, and switch to Straight Track to contrast rectilinear motion.',
    apparatus: ['Circular orbit track simulator', 'Adjustable radius arm (m)', 'Digital speed & timer readout'],
    procedure: [
      'Observe the object orbiting around the fixed central pivot at constant radius r = 5.0 m.',
      'Adjust Orbit Radius and Speed sliders and notice how the path stays circular while total distance increases continuously.',
      'Toggle to Straight Track mode to contrast rectilinear motion with circular motion.',
    ],
    observationsGuide: [
      'In circular motion, every point on the path stays at equal distance (radius) from the centre.',
      'After one complete circle, the object returns to its starting point.',
    ],
    expectedOutcome:
      'Students distinguish linear, circular, and oscillatory motion accurately with real-world examples.',
    scientificExplanation:
      'In rectilinear motion an object moves along a straight line; in circular motion it follows a closed circular path at constant distance from a centre; in oscillatory motion it repeats to-and-fro movement about a mean position.',
    gradeAdaptedNote:
      'Reuses the Motion Kinematics Engine initialized in Circular Orbit mode for Class 6 Ch. 5.',
    assessmentQuestions: [
      {
        id: 'c6_circ_q1',
        kind: 'conceptual',
        prompt: 'A child swinging back and forth on a playground swing exhibits which type of motion?',
        options: ['Rectilinear motion', 'Oscillatory motion', 'Random zigzag motion', 'Stationary rest'],
        correctIndex: 1,
        explanation: 'Repeated to-and-fro movement about a central resting position is oscillatory motion.',
      },
      {
        id: 'c6_circ_q2',
        kind: 'application',
        prompt: 'What motion does a stone tied to a thread show when whirled smoothly around your hand?',
        options: ['Circular motion', 'Straight-line motion only', 'Zero motion', 'Static equilibrium'],
        correctIndex: 0,
        explanation: 'The taut string keeps the stone at fixed radius from your hand, producing circular motion.',
      },
    ],
  },
  {
    id: 'c6_touch_vs_clinical_lab_thermometer',
    title: 'Three-Bowl Touch Test & Clinical vs. Laboratory Thermometer Protocol',
    classLevel: 6,
    chapterId: 'c6_ch7',
    chapterNumber: 7,
    chapterTitle: 'Temperature and its Measurement',
    topicArea: 'heat_temperature',
    relevantConcept: 'Why sense of touch is unreliable & safe reading rules for clinical vs. laboratory thermometers',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Prove through the three-bowl water activity that human touch is relative, and practice safe reading protocols for clinical and laboratory thermometers.',
    whyItImportant:
      'Prevents thermometer breakage and inaccurate readings during fever checks and science experiments.',
    realWorldApplication:
      'Home digital fever thermometers, medical clinics, and school chemistry/physics water baths.',
    description:
      'Guided NCERT Class 6 Ch. 7 inquiry: dip one hand in warm water and one in cold water before placing both in tap water, then compare clinical (35–42 °C) and laboratory (−10–110 °C) thermometer rules.',
    apparatus: [
      'Three bowls: Bowl A (warm water), Bowl B (tap water), Bowl C (cool water)',
      'Digital clinical thermometer (35 °C–42 °C)',
      'Laboratory thermometer (−10 °C–110 °C) & beaker',
    ],
    procedure: [
      'Dip your right hand in warm water (Bowl A) and left hand in cool water (Bowl C) for 1–2 minutes.',
      'Transfer BOTH hands together into lukewarm tap water (Bowl B) and notice the conflicting sensation.',
      'Review clinical thermometer rules: wash tip, place under tongue, wait for beep, read at eye level (normal ≈ 37.0 °C).',
      'Review laboratory thermometer rules: hold vertically immersed in liquid WITHOUT touching the beaker bottom or walls, and read WHILE still immersed.',
    ],
    observationsGuide: [
      'The exact same tap water feels cool to the warmed hand and warm to the chilled hand.',
      'A laboratory thermometer drops immediately if lifted out of hot water, so it must be read while immersed.',
    ],
    expectedOutcome:
      'Students explain why thermometers are essential and apply correct reading precautions for both thermometer types.',
    scientificExplanation:
      'Skin thermoreceptors detect heat flow rate rather than absolute temperature. Calibrated thermometers measure thermal equilibrium reproducibly on a fixed scale.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 6 Ch. 7 Activities 7.1–7.5.',
    assessmentQuestions: [
      {
        id: 'c6_tth_q1',
        kind: 'conceptual',
        prompt: 'In the three-bowl activity, why does the same lukewarm water feel cold to one hand and warm to the other?',
        options: [
          'The water changes temperature instantaneously',
          'Human sense of touch judges hotness relative to the hand’s previous temperature',
          'Left hands cannot feel warmth',
          'Tap water has two temperatures at once',
        ],
        correctIndex: 1,
        explanation:
          'Touch senses relative heat gain or loss, which is why objective thermometers are needed.',
      },
      {
        id: 'c6_tth_q2',
        kind: 'application',
        prompt: 'When measuring warm water with a laboratory thermometer, when should you read the temperature?',
        options: [
          'After taking it out and wiping it dry',
          'While its bulb is still dipped in the water without touching the beaker walls or base',
          'While pressing the bulb tightly against the hot burner base',
          'Only after the water cools completely',
        ],
        correctIndex: 1,
        explanation:
          'Laboratory thermometers have no kink, so the column moves immediately if removed from the liquid.',
      },
    ],
  },
  {
    id: 'c6_evaporation_factors_matka',
    title: 'Factors Affecting Evaporation & Earthen Pot (Matka) Cooling',
    classLevel: 6,
    chapterId: 'c6_ch8',
    chapterNumber: 8,
    chapterTitle: 'A Journey through States of Water',
    topicArea: 'heat_temperature',
    relevantConcept: 'Surface area, wind, temperature & humidity effects on evaporation; evaporative cooling',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Investigate how exposed surface area, sunlight, and air movement change evaporation rate and explain why evaporation causes cooling.',
    whyItImportant:
      'Explains earthen water coolers, sweating to cool our bodies in summer, and desert air coolers.',
    realWorldApplication:
      'Earthen *matka* pots, pot-in-pot rural vegetable coolers, and summer evaporative coolers.',
    description:
      'NCERT Class 6 Ch. 8 comparative investigation measuring water evaporation in a saucer vs. bottle cap and sunny vs. shaded breezy places, plus the pot-in-pot cooler model.',
    apparatus: [
      'Bottle cap & wide shallow saucer with equal teaspoons of water',
      'Two small earthenware pots + damp sand (pot-in-pot cooler model)',
      'Thermometer or observation log',
    ],
    procedure: [
      'Pour one equal teaspoon of water into a narrow bottle cap and a wide shallow plate; keep both side-by-side.',
      'Compare another pair placed in sunlight/breeze versus a cool shaded corner.',
      'Record which sample dries first and explain why.',
      'Notice how water seeping through tiny pores of an earthen pot evaporates by absorbing heat from the water inside.',
    ],
    observationsGuide: [
      'Water in the wide saucer evaporates much faster than the same volume in a narrow cap.',
      'Higher temperature, stronger breeze, and lower humidity all speed up evaporation and cooling.',
    ],
    expectedOutcome:
      'Students identify all four factors governing evaporation and connect evaporation to cooling.',
    scientificExplanation:
      'Fastest-moving surface liquid molecules escape into vapour during evaporation, carrying away thermal energy (latent heat) and lowering the temperature of the remaining liquid.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 6 Ch. 8 Activities 8.5–8.8.',
    assessmentQuestions: [
      {
        id: 'c6_evp_q1',
        kind: 'application',
        prompt: 'Why does drinking water stored in a porous clay earthen pot (matka) stay cool in summer?',
        options: [
          'Clay generates ice inside',
          'Water seeps through tiny pores and evaporates, taking heat away from the water inside',
          'Clay blocks gravity',
          'Water turns into solid salt',
        ],
        correctIndex: 1,
        explanation:
          'Evaporation absorbs heat energy from the pot and remaining water, cooling it naturally.',
      },
      {
        id: 'c6_evp_q2',
        kind: 'conceptual',
        prompt: 'Why does hot tea cool faster when poured from a narrow cup into a wide saucer?',
        options: [
          'Larger surface area lets more molecules evaporate quickly, carrying away heat',
          'Ceramic saucers freeze liquids',
          'The saucer increases tea mass',
          'Gravity pulls heat downward',
        ],
        correctIndex: 0,
        explanation: 'Increasing exposed surface area accelerates evaporation and heat loss.',
      },
    ],
  },

  // =========================================================================
  // CLASS 7 — CURIOSITY (EXPANDED ACTIVITIES)
  // =========================================================================
  {
    id: 'c7_torch_led_circuit_symbols',
    title: 'Inside a Torchlight, LED Polarity & Standard Circuit Symbols',
    classLevel: 7,
    chapterId: 'c7_ch4',
    chapterNumber: 3,
    chapterTitle: 'Electricity: Circuits and their Components',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Series battery cells in a torch, LED polarity, homemade switch & schematic symbols',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'class7_torch_switch',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Trace how cells connect positive-to-negative inside a torch, operate an interactive circuit switch, and match real components to standard NCERT symbols.',
    whyItImportant:
      'Standard circuit symbols let engineers anywhere in the world read and build electrical devices without confusion.',
    realWorldApplication:
      'LED flashlights, remote control battery trays, wall switches, and circuit schematics.',
    description:
      'Interactive torch-voltage circuit workbench where students toggle the switch, inspect battery polarity (+ / −), and connect standard symbols to live bulb glow.',
    apparatus: ['Multi-cell battery (1.5 V–4.5 V)', 'Lab knife switch', 'Lamp / LED indicator', 'Copper connecting leads'],
    procedure: [
      'Inspect the closed copper loop at 4.5 V (three 1.5 V torch cells in series).',
      'Toggle the Circuit Switch OPEN and CLOSED to see how a torch slider interrupts the metallic path.',
      'Click the Battery, Switch, Wires, and Bulb in the canvas to review their standard NCERT schematic symbols.',
    ],
    observationsGuide: [
      'Cells in a battery connect positive (+) terminal of one cell to negative (−) terminal of the next.',
      'An LED conducts only when its longer positive lead connects to the battery’s positive terminal.',
    ],
    expectedOutcome:
      'Students build closed cell-switch-lamp circuits and draw standard electrical circuit diagrams accurately.',
    scientificExplanation:
      'Connecting cells in series sums their voltages (e.g. 3 × 1.5 V = 4.5 V). Standard symbols represent a cell (long thick/short thin line), switch, wire, and bulb cleanly.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 7 Ch. 3 Activities 3.1–3.5.',
    assessmentQuestions: [
      {
        id: 'c7_tch_q1',
        kind: 'conceptual',
        prompt: 'In an electrical cell symbol, what does the LONGER thin line represent?',
        options: [
          'The negative (−) terminal',
          'The positive (+) terminal',
          'An open switch',
          'A plastic insulator',
        ],
        correctIndex: 1,
        explanation: 'By convention, the longer line represents the positive (+) terminal and the shorter thick line represents negative (−).',
      },
      {
        id: 'c7_tch_q2',
        kind: 'application',
        prompt: 'Why did an LED fail to light even though the battery and wires were completely connected?',
        options: [
          'Its positive and negative legs were connected backwards (wrong polarity)',
          'Copper wires cannot carry LED current',
          'LEDs work only in water',
          'Batteries have no polarity',
        ],
        correctIndex: 0,
        explanation: 'Unlike filament bulbs, an LED allows current in only one direction—longer leg to (+), shorter leg to (−).',
      },
    ],
  },
  {
    id: 'c7_convection_sea_land_breeze',
    title: 'Convection Currents in Water & Coastal Sea/Land Breeze Lab',
    classLevel: 7,
    chapterId: 'c7_ch7',
    chapterNumber: 7,
    chapterTitle: 'Heat Transfer in Nature',
    topicArea: 'heat_temperature',
    relevantConcept: 'Fluid expansion, rising warm plumes, sinking cool fluid & coastal convection winds',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'heat_transfer_lab',
    simulationPreset: 'convection_currents',
    reusedAcrossClasses: [6, 7],
    learningObjective:
      'Visualize rising warm convection plumes and sinking cool return currents in heated fluids and connect them to coastal sea and land breezes.',
    whyItImportant:
      'Convection drives ocean currents, coastal weather winds, room heaters, and boiling water in a kettle.',
    realWorldApplication:
      'Coastal sea breeze in daytime, land breeze at night, chimneys, and room AC/heater placement.',
    description:
      'Opens directly in Convection Beaker mode: raise the burner temperature and watch warm buoyant water rise centrally while cooler water circulates down the edges.',
    apparatus: ['Borosilicate convection beaker', 'Spirit burner heat source', 'Coloured tracer plume'],
    procedure: [
      'Start at 45 °C and gradually increase Source Temperature to 95 °C.',
      'Watch how heated fluid near the bottom rises upward and cooler fluid moves down along the sides to replace it.',
      'Click the Convection Beaker and Heat Source inside the canvas to trace sea breeze (day) vs. land breeze (night).',
    ],
    observationsGuide: [
      'Higher heater temperature drives faster circulating convection loops.',
      'During the day, land warms faster than sea so cool sea air flows inland (sea breeze); at night the reverse occurs (land breeze).',
    ],
    expectedOutcome:
      'Students explain convection via density changes in heated liquids and gases.',
    scientificExplanation:
      'When a fluid is heated from below, it expands, becomes less dense than the cooler fluid above, and rises due to buoyancy—setting up a continuous convection current.',
    gradeAdaptedNote:
      'Opens the Heat Transfer Engine directly in Convection mode for NCERT Class 7 Ch. 7.',
    assessmentQuestions: [
      {
        id: 'c7_cnv_q1',
        kind: 'conceptual',
        prompt: 'Why are room air-conditioners mounted high near the ceiling while room heaters are kept near the floor?',
        options: [
          'Cool air sinks and warm air rises, setting up efficient convection throughout the room',
          'Air conditioners only work near lights',
          'Warm air is heavier than cold air',
          'Conduction only happens downwards',
        ],
        correctIndex: 0,
        explanation:
          'Cold dense air from an upper AC sinks to cool the whole room, while warm less-dense air from a floor heater rises.',
      },
      {
        id: 'c7_cnv_q2',
        kind: 'application',
        prompt: 'At night near the coast, which way does the land breeze blow?',
        options: [
          'From the warmer sea toward the land',
          'From the cooler land toward the warmer sea',
          'Straight down into the sand',
          'There is no air movement at night',
        ],
        correctIndex: 1,
        explanation:
          'Land cools faster than seawater at night, so warm air rises over the sea and cooler air blows from land toward sea.',
      },
    ],
  },
  {
    id: 'c7_thermal_radiation_surfaces',
    title: 'Thermal Radiation Absorption: Black vs. Silver Surfaces Lab',
    classLevel: 7,
    chapterId: 'c7_ch7',
    chapterNumber: 7,
    chapterTitle: 'Heat Transfer in Nature',
    topicArea: 'heat_temperature',
    relevantConcept: 'Infrared radiation without a medium & dark matte vs. shiny reflective surfaces',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'heat_transfer_lab',
    simulationPreset: 'radiation_surfaces',
    reusedAcrossClasses: [6, 7],
    learningObjective:
      'Compare radiant heat absorption on matte black versus polished silver surfaces and explain why radiation requires no medium.',
    whyItImportant:
      'Explains why light-coloured clothes keep us cooler in summer and why solar cookers & water heaters are painted black inside.',
    realWorldApplication:
      'Black solar water heater tubes, shiny thermos flask inner walls, and white summer roofs.',
    description:
      'Opens directly in Thermal Radiation mode: adjust radiant heater temperature and compare live warming rates of matte black versus shiny silver test surfaces.',
    apparatus: ['Infrared radiant heat lamp', 'Matte black metal plate & thermometer', 'Polished silver plate & thermometer'],
    procedure: [
      'Adjust the radiant Source Temperature from 50 °C to 95 °C.',
      'Compare how much faster the matte black surface warms compared to the shiny reflective silver surface.',
      'Click the Radiating Surface inside the viewport to inspect thermos flask silvering.',
    ],
    observationsGuide: [
      'Dark matte surfaces are strong absorbers (and emitters) of thermal radiation.',
      'Shiny white or silver surfaces reflect most incoming thermal radiation.',
    ],
    expectedOutcome:
      'Students predict surface heating/cooling behaviour from colour and finish.',
    scientificExplanation:
      'All warm objects emit electromagnetic thermal radiation that travels even across vacuum. Dark matte finishes absorb most incident infrared waves, while shiny bright surfaces reflect them.',
    gradeAdaptedNote:
      'Opens Heat Transfer Engine directly in Radiation mode for NCERT Class 7 Ch. 7.',
    assessmentQuestions: [
      {
        id: 'c7_rad_q1',
        kind: 'application',
        prompt: 'Why are the inner glass walls of a vacuum thermos flask coated with shiny silver?',
        options: [
          'To increase conduction',
          'To reflect thermal radiation and keep hot drinks hot (or cold drinks cold)',
          'To make the bottle heavier',
          'To create convection currents',
        ],
        correctIndex: 1,
        explanation:
          'Shiny silver surfaces reflect infrared radiation, minimizing radiant heat loss or gain.',
      },
      {
        id: 'c7_rad_q2',
        kind: 'conceptual',
        prompt: 'Two identical cans—one painted matte black, one polished white—sit in bright sunlight for 30 minutes. Which water gets hotter?',
        options: [
          'The polished white can',
          'The matte black can',
          'Both freeze',
          'Neither changes temperature',
        ],
        correctIndex: 1,
        explanation: 'Matte black absorbs far more solar radiation than polished white.',
      },
    ],
  },
  {
    id: 'c7_simple_pendulum_time_period',
    title: 'Simple Pendulum Oscillations & Time Period (T) Lab',
    classLevel: 7,
    chapterId: 'c7_ch8',
    chapterNumber: 8,
    chapterTitle: 'Measurement of Time and Motion',
    topicArea: 'motion_measurement',
    relevantConcept: 'Periodic oscillatory motion, counting 10–20 oscillations & Time Period T = t / n',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'simple_machines_energy',
    simulationPreset: 'class7_pendulum_period',
    reusedAcrossClasses: [7, 9],
    learningObjective:
      'Observe periodic swings of a simple pendulum, measure time for multiple oscillations to compute Time Period T, and test how bob mass affects swing rhythm.',
    whyItImportant:
      'Galileo’s discovery of constant pendulum time period enabled the first accurate mechanical clocks.',
    realWorldApplication:
      'Grandfather pendulum clocks, metronomes, and timing periodic events.',
    description:
      'Watch a swinging pendulum bob oscillate smoothly across its mean position; vary bob mass and release height to test what affects periodic timing.',
    apparatus: ['Simple pendulum bob on thread', 'Rigid support stand', 'Stopwatch timer'],
    procedure: [
      'Release the pendulum with zero friction damping and observe one full oscillation (extreme → centre → other extreme → back).',
      'Change the Bob Mass slider from 2 kg to 8 kg and notice that mass does NOT change the pendulum’s swing period!',
      'Increase Track Friction Damping slightly to see real-world air resistance gradually reduce swing amplitude.',
    ],
    observationsGuide: [
      'Time Period T = Total time taken / Number of complete oscillations.',
      'A simple pendulum’s time period depends on string length (and gravity), NOT on the mass of the bob.',
    ],
    expectedOutcome:
      'Students compute time period T = t/n and verify that pendulum period is independent of bob mass.',
    scientificExplanation:
      'A simple pendulum executes periodic motion with period T = 2π√(L/g). Because heavier bobs experience both greater gravitational pull and greater inertia equally, mass cancels out.',
    gradeAdaptedNote:
      'Reuses the Pendulum Engine initialized for Class 7 Ch. 8 Time Period inquiry.',
    assessmentQuestions: [
      {
        id: 'c7_pnd_q1',
        kind: 'numerical',
        prompt: 'A simple pendulum completes 20 full oscillations in 32 seconds. What is its Time Period T?',
        options: ['0.625 s', '1.6 s', '12 s', '640 s'],
        correctIndex: 1,
        explanation: 'Time Period T = Total time / Oscillations = 32 s / 20 = 1.6 s.',
      },
      {
        id: 'c7_pnd_q2',
        kind: 'conceptual',
        prompt: 'If you replace a 50 g iron bob with a 100 g brass bob on the SAME string length, what happens to the Time Period?',
        options: [
          'It doubles',
          'It cuts in half',
          'It stays practically the same',
          'The pendulum stops swinging',
        ],
        correctIndex: 2,
        explanation: 'A simple pendulum’s period depends on length L, not bob mass.',
      },
    ],
  },
  {
    id: 'c7_rectilinear_shadows_pinhole',
    title: 'Rectilinear Propagation, Shadow Formation & Pinhole Camera',
    classLevel: 7,
    chapterId: 'c7_ch11',
    chapterNumber: 11,
    chapterTitle: 'Light: Shadows and Reflections',
    topicArea: 'light_optics',
    relevantConcept: 'Straight-line travel of light, opaque/translucent/transparent shadows & inverted pinhole image',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Demonstrate that light travels in straight lines, test how object distance alters shadow size, and explain why a pinhole camera forms an inverted image.',
    whyItImportant:
      'Straight-line light travel explains solar/lunar eclipses, shadows, and how all cameras project images.',
    realWorldApplication:
      'Safe pinhole solar eclipse viewers, shadow puppetry, and camera obscura optics.',
    description:
      'Hands-on NCERT Class 7 Ch. 11 light activities: three aligned cardboard pinholes, opaque/translucent shadow testing, and sliding-box pinhole camera construction.',
    apparatus: [
      'Three identical cardboard squares with aligned centre pinholes + LED torch',
      'Opaque, translucent, and transparent test objects + screen',
      'Two sliding cardboard boxes + tracing paper screen (pinhole camera)',
    ],
    procedure: [
      'Align three cardboard pinholes in a straight line and shine a torch through—observe light reaching the screen.',
      'Shift the middle cardboard slightly sideways and confirm the light spot vanishes (proving rectilinear propagation).',
      'Hold an opaque hand/object between torch and wall; move it closer to the torch to enlarge the shadow.',
      'Point a pinhole camera at a bright tree or candle flame and observe the sharp, upside-down image on the tracing paper.',
    ],
    observationsGuide: [
      'Opaque objects cast dark shadows; transparent glass casts almost no shadow.',
      'In a pinhole camera, rays from the top of the object travel straight through the pinhole to the bottom of the screen—inverting the image.',
    ],
    expectedOutcome:
      'Students connect straight-line propagation to shadow geometry and inverted pinhole camera images.',
    scientificExplanation:
      'In a uniform medium, light travels strictly along straight paths (rays). Because rays from top and bottom cross at the tiny pinhole aperture, the projected real image is inverted.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 7 Ch. 11 Activities 11.1–11.5.',
    assessmentQuestions: [
      {
        id: 'c7_pin_q1',
        kind: 'conceptual',
        prompt: 'What kind of image is formed on the tracing-paper screen of a pinhole camera?',
        options: [
          'Upright and black-and-white only',
          'Upside-down (inverted) and coloured',
          'Always larger than the sky',
          'No image forms unless a mirror is added',
        ],
        correctIndex: 1,
        explanation:
          'Straight light rays crossing through the pinhole produce an inverted, naturally coloured real image.',
      },
      {
        id: 'c7_pin_q2',
        kind: 'application',
        prompt: 'Which three things are ALWAYS needed to form a shadow?',
        options: [
          'A light source, an opaque object, and a screen',
          'A bar magnet, a wire, and a bulb',
          'Only a transparent glass sheet',
          'A battery and a thermometer',
        ],
        correctIndex: 0,
        explanation: 'A shadow forms when an opaque object blocks light from a source before it hits a screen.',
      },
    ],
  },
  {
    id: 'c7_periscope_kaleidoscope_mirrors',
    title: 'Lateral Inversion, Two-Mirror Periscope & Kaleidoscope',
    classLevel: 7,
    chapterId: 'c7_ch11',
    chapterNumber: 11,
    chapterTitle: 'Light: Shadows and Reflections',
    topicArea: 'light_optics',
    relevantConcept: 'Plane mirror lateral inversion, 45° double-reflection periscope & multiple reflections',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Build and trace ray paths through a 45° two-mirror periscope and explain how three angled mirrors generate symmetric kaleidoscope patterns.',
    whyItImportant:
      'Shows how combining simple plane reflections lets us see over obstacles or multiply images.',
    realWorldApplication:
      'Submarine periscopes, ambulance mirror-writing (“ECNALUBMA”), and optical kaleidoscopes.',
    description:
      'NCERT Class 7 Ch. 11 optical craft & reflection guide covering lateral inversion, two parallel 45° mirrors inside a Z-tube periscope, and multiple reflections in a triangular kaleidoscope.',
    apparatus: [
      'Two rectangular plane mirror strips (for 45° periscope)',
      'Cardboard Z-tube',
      'Three equal mirror strips taped at 60° + coloured glass bangles (kaleidoscope)',
    ],
    procedure: [
      'Raise your right hand in front of a plane mirror and note that your image raises its left hand (lateral inversion).',
      'Mount two plane mirrors parallel to each other at 45° inside a Z-shaped tube so top light reflects 90° down and 90° into your eye.',
      'Tape three narrow mirror strips into a 60° hollow triangle with coloured beads at one end to observe repeated symmetric reflections.',
    ],
    observationsGuide: [
      'Two parallel 45° mirrors turn a horizontal ray down the tube and back out horizontally upright.',
      'Angled mirrors form multiple repeated images of a single set of beads.',
    ],
    expectedOutcome:
      'Students trace double reflection in a periscope and explain why “AMBULANCE” is painted laterally inverted on emergency vehicles.',
    scientificExplanation:
      'Each plane mirror reflects rays obeying θ_i = θ_r. At 45° incidence, a mirror deflects light cleanly by 90°; a second parallel 45° mirror restores the original viewing direction.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 7 Ch. 11 Activities 11.6–11.8.',
    assessmentQuestions: [
      {
        id: 'c7_per_q1',
        kind: 'conceptual',
        prompt: 'At what angle to the tube walls are the two plane mirrors fixed inside a simple periscope?',
        options: ['0°', '30°', '45°', '90°'],
        correctIndex: 2,
        explanation: 'At 45°, incident rays reflect at 45° to the normal, turning the light beam cleanly by 90°.',
      },
      {
        id: 'c7_per_q2',
        kind: 'application',
        prompt: 'Why is the word AMBULANCE printed backwards on the front of an ambulance?',
        options: [
          'Drivers ahead read it correctly upright in their rear-view mirror due to lateral inversion',
          'To save paint',
          'Because glass bends letters upside down',
          'It glows brighter at night',
        ],
        correctIndex: 0,
        explanation: 'Plane mirror lateral inversion flips the reversed letters back into normal readable order.',
      },
    ],
  },

  // =========================================================================
  // CLASS 8 — CURIOSITY (EXPANDED ACTIVITIES)
  // =========================================================================
  {
    id: 'c8_heating_effect_nichrome_fuse',
    title: 'Heating Effect of Electric Current (Nichrome Wire & Safety Fuse)',
    classLevel: 8,
    chapterId: 'c8_ch4',
    chapterNumber: 4,
    chapterTitle: 'Electricity: Magnetic and Heating Effects',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Electrical resistance heating in nichrome wire, power P = VI & melting fuse wire protection',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'class8_joule_heating',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Observe how electric current heats a resistive conductor (nichrome wire), see how higher voltage/current boosts heat power P = VI, and explain how fuses protect circuits.',
    whyItImportant:
      'Powers irons, kettles, and room heaters while explaining why electrical overloads cause fires without fuses or MCBs.',
    realWorldApplication:
      'Electric irons, water immersion heaters, toasters, incandescent filaments, and cartridge safety fuses.',
    description:
      'Drive strong current through a resistive heating wire element in the interactive circuit lab; sweep voltage and resistance to read live electrical heating power (Watts).',
    apparatus: ['DC Power Supply (up to 12 V)', 'Nichrome heating resistance element', 'Switch & Ammeter/Wattmeter'],
    procedure: [
      'Start with V = 12 V and R = 4 Ω and inspect current I = 3.0 A and heating power P = 36 W.',
      'Lower resistance R or raise voltage V and observe current and thermal power climb sharply.',
      'Open the switch to cut power to 0 W, mirroring how a melted fuse or tripped MCB isolates a fault.',
    ],
    observationsGuide: [
      'Higher current through a resistive wire produces much greater heat energy per second (P = I²R).',
      'A safety fuse uses a thin low-melting-point wire that melts first if current surges dangerously.',
    ],
    expectedOutcome:
      'Students relate current, resistance, and thermal power to household heating appliances and fuse safety.',
    scientificExplanation:
      'Moving electrons collide repeatedly with atoms inside high-resistance nichrome wire, transferring electrical energy into thermal vibration heat at rate P = I²R = VI.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 8 Ch. 4 Heating Effect of Current activity.',
    assessmentQuestions: [
      {
        id: 'c8_htg_q1',
        kind: 'application',
        prompt: 'Why is nichrome alloy used for electric heater coils instead of low-resistance copper wire?',
        options: [
          'Nichrome has high resistance and high melting point, generating strong steady heat without melting',
          'Nichrome is an electrical insulator',
          'Copper cannot conduct electricity',
          'Nichrome melts at room temperature',
        ],
        correctIndex: 0,
        explanation: 'High resistance converts electrical energy efficiently into heat while withstanding red-hot temperatures.',
      },
      {
        id: 'c8_htg_q2',
        kind: 'conceptual',
        prompt: 'What special property must a safety fuse wire have?',
        options: [
          'A very high melting point like tungsten',
          'A low melting point so it melts quickly and breaks the circuit during excessive current',
          'Zero electrical conductivity',
          'Thick wooden insulation inside',
        ],
        correctIndex: 1,
        explanation: 'A low melting point ensures the fuse blows before household wiring overheats or catches fire.',
      },
    ],
  },
  {
    id: 'c8_voltaic_lemon_cell',
    title: 'Building a Simple Voltaic Cell (Copper–Zinc Electrolyte Battery)',
    classLevel: 8,
    chapterId: 'c8_ch4',
    chapterNumber: 4,
    chapterTitle: 'Electricity: Magnetic and Heating Effects',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Chemical-to-electrical energy conversion using two dissimilar metal electrodes in an acidic electrolyte',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Construct a simple lemon/saltwater Voltaic cell using copper and zinc strips and connect multiple cells in series to light an LED.',
    whyItImportant:
      'Reveals how everyday dry cells and rechargeable batteries produce electric current from chemical reactions.',
    realWorldApplication:
      'AA dry cells, car lead-acid batteries, and lithium-ion smartphone batteries.',
    description:
      'NCERT Curiosity Class 8 Ch. 4 hands-on electrochemical cell activity using juicy lemons, copper wire/strips, zinc-coated nails, and a low-current LED.',
    apparatus: [
      '4 juicy lemons (or saltwater beakers)',
      '4 copper strips/wires & 4 galvanised iron (zinc) nails',
      'Connecting crocodile clips & 1 red LED',
    ],
    procedure: [
      'Insert one clean copper strip (+) and one zinc nail (−) into each lemon without letting them touch inside.',
      'Connect the copper electrode of Lemon 1 to the zinc nail of Lemon 2, chaining 3–4 lemons in series.',
      'Connect the free copper end to the LED’s longer (+) lead and the free zinc end to the shorter (−) lead.',
      'Observe the LED glow softly (flip LED leads if it does not glow).',
    ],
    observationsGuide: [
      'Two DIFFERENT metals (copper + zinc) are required; two identical copper strips produce zero voltage.',
      'Connecting 3–4 lemon cells in series adds their voltages enough to light an LED.',
    ],
    expectedOutcome:
      'Students identify the electrolyte and dissimilar electrodes inside a Voltaic cell and explain energy conversion.',
    scientificExplanation:
      'Acidic lemon juice acts as an electrolyte. Chemical reactions release electrons more readily at the zinc electrode (−) than at copper (+), establishing a potential difference that drives current through the external LED.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 8 Ch. 4 Voltaic Cell activity.',
    assessmentQuestions: [
      {
        id: 'c8_vol_q1',
        kind: 'conceptual',
        prompt: 'What energy conversion takes place inside a lemon Voltaic cell or dry cell?',
        options: [
          'Sound energy → Light energy',
          'Chemical energy → Electrical energy',
          'Magnetic energy → Gravitational energy',
          'Nuclear energy → Mechanical energy',
        ],
        correctIndex: 1,
        explanation: 'Electrochemical reactions between the electrodes and electrolyte convert stored chemical energy into electrical energy.',
      },
      {
        id: 'c8_vol_q2',
        kind: 'application',
        prompt: 'Why must a Voltaic cell use two DIFFERENT metals like copper and zinc?',
        options: [
          'Two identical metals react equally and produce no potential difference between them',
          'Only zinc conducts electricity',
          'Copper dissolves instantly in water',
          'Lemons repel identical metals',
        ],
        correctIndex: 0,
        explanation: 'A voltage difference arises only when two electrodes have different tendencies to release electrons.',
      },
    ],
  },
  {
    id: 'c8_contact_noncontact_spring_weight',
    title: 'Contact vs. Non-Contact Forces & Spring Balance Weight Measurement',
    classLevel: 8,
    chapterId: 'c8_ch5',
    chapterNumber: 5,
    chapterTitle: 'Exploring Forces',
    topicArea: 'force_mechanics',
    relevantConcept: 'Muscular & friction contact forces vs. magnetic, electrostatic & gravitational non-contact forces; weight in newtons',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Differentiate contact forces from non-contact forces through hands-on tests and measure gravitational weight accurately in newtons (N) on a spring balance.',
    whyItImportant:
      'Clarifies the crucial distinction between mass (kg) and gravitational weight force (N) while categorizing all everyday forces.',
    realWorldApplication:
      'Luggage hanging scales, electrostatic dust precipitators, and magnetic cranes.',
    description:
      'NCERT Class 8 Ch. 5 hands-on force exploration: rubbed plastic straw electrostatic pull, bar magnet push-at-a-distance, and calibrating weight readings with a spring balance.',
    apparatus: [
      'Spring balance graduated in newtons (N) & grams',
      'Plastic drinking straw + paper bits + wool cloth',
      'Two bar magnets & slotted masses',
    ],
    procedure: [
      'Rub a dry plastic straw briskly with wool or dry paper and bring it close to tiny paper bits—observe attraction without touching (electrostatic force).',
      'Hold two bar magnet North poles facing each other and feel the non-contact repulsion across air.',
      'Check the spring balance zero mark, hang a 100 g, 200 g, and 500 g object in turn, and read gravitational weight in newtons (~1 N, ~2 N, ~5 N).',
    ],
    observationsGuide: [
      'Magnetic, electrostatic, and gravitational forces all act across empty space without physical contact.',
      'Every 100 g mass experiences roughly 0.98 N (≈ 1 N) of Earth’s gravitational weight.',
    ],
    expectedOutcome:
      'Students classify forces accurately and read a spring balance scale without zero error.',
    scientificExplanation:
      'Contact forces require touching surfaces (muscular push, friction). Non-contact forces act through fields (gravitational, magnetic, electrostatic). Weight W = m·g is Earth’s gravitational pull measured in newtons (N).',
    gradeAdaptedNote:
      'Mapped directly to NCERT Curiosity Class 8 Ch. 5 force & weight activities.',
    assessmentQuestions: [
      {
        id: 'c8_cnc_q1',
        kind: 'conceptual',
        prompt: 'Which set lists ONLY non-contact forces?',
        options: [
          'Friction, muscular force, magnetic force',
          'Gravitational force, magnetic force, electrostatic force',
          'Muscular push, friction, spring tension',
          'Air drag, sliding friction, kicking a ball',
        ],
        correctIndex: 1,
        explanation: 'Gravity, magnetism, and electrostatics act at a distance without physical contact.',
      },
      {
        id: 'c8_cnc_q2',
        kind: 'numerical',
        prompt: 'What is the SI unit of force and weight measured on a laboratory spring balance?',
        options: ['Kilogram (kg)', 'Metre (m)', 'Newton (N)', 'Celsius (°C)'],
        correctIndex: 2,
        explanation: 'Mass is measured in kilograms (kg), whereas force and weight are measured in newtons (N).',
      },
    ],
  },
  {
    id: 'c8_liquid_pressure_depth_column',
    title: 'Liquid Pressure with Depth & Container Wall Jets (P = ρgh)',
    classLevel: 8,
    chapterId: 'c8_ch6',
    chapterNumber: 6,
    chapterTitle: 'Pressure, Winds, Storms, and Cyclones',
    topicArea: 'force_mechanics',
    relevantConcept: 'Hydrostatic liquid pressure increasing with water column depth h & fluid density ρ',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'force_friction_buoyancy',
    simulationPreset: 'buoyancy_pressure',
    reusedAcrossClasses: [8, 9],
    learningObjective:
      'Investigate how liquid pressure increases with depth beneath the surface and with liquid density, explaining why deep bottle holes shoot water farthest.',
    whyItImportant:
      'Explains why concrete hydroelectric dams are built thickest at the base and why deep-sea submarines need reinforced hulls.',
    realWorldApplication:
      'Overhead water tanks creating tap pressure, hydroelectric dam design, and deep-sea diving gear.',
    description:
      'Interactive fluid column bench showing live hydrostatic pressure (kPa) rising with submersion depth and brine density alongside buoyant equilibrium.',
    apparatus: ['Graduated fluid column tank', 'Hydrostatic pressure gauge (kPa)', 'Freshwater / salty brine selector'],
    procedure: [
      'Lower a denser block deeper into the liquid column and track the live Pressure (kPa) readout.',
      'Increase Fluid Density from freshwater toward salty brine and notice hydrostatic pressure increase at the same depth.',
      'Connect this to the NCERT bottle-with-three-holes activity: the bottom hole has the deepest water column above it, shooting water the farthest.',
    ],
    observationsGuide: [
      'Hydrostatic pressure P = ρgh grows proportionally with column height h and liquid density ρ.',
      'At equal depth, a liquid exerts equal sideways pressure in all directions.',
    ],
    expectedOutcome:
      'Students connect water column height directly to liquid pressure in kPa.',
    scientificExplanation:
      'The weight of liquid above any depth h presses downward and sideways equally in all directions, creating gauge pressure P = ρgh.',
    gradeAdaptedNote:
      'Mapped to NCERT Curiosity Class 8 Ch. 6 liquid pressure activities using the interactive Fluid Pressure bench.',
    assessmentQuestions: [
      {
        id: 'c8_liq_q1',
        kind: 'application',
        prompt: 'Three holes are punched at top, middle, and bottom on the side of a tall water bottle. Which hole shoots a jet of water the FARTHEST?',
        options: [
          'The top hole',
          'The middle hole',
          'The bottom hole (deepest water column above it)',
          'All three shoot identically',
        ],
        correctIndex: 2,
        explanation: 'Liquid pressure rises with depth h, so the bottom hole experiences the highest pressure.',
      },
      {
        id: 'c8_liq_q2',
        kind: 'conceptual',
        prompt: 'Why are hydroelectric dam walls engineered much thicker at the bottom than at the top?',
        options: [
          'Water pressure is greatest near the bottom of the reservoir',
          'Water is warmer at the bottom',
          'Sunlight hits the bottom harder',
          'Top water has higher density',
        ],
        correctIndex: 0,
        explanation: 'Greater depth means much larger horizontal hydrostatic pressure pushing against the lower dam wall.',
      },
    ],
  },
  {
    id: 'c8_concave_convex_spoon_mirrors',
    title: 'Spoon Mirror Inquiry: Convex vs. Concave Mirror Images',
    classLevel: 8,
    chapterId: 'c8_ch10',
    chapterNumber: 10,
    chapterTitle: 'Light: Mirrors and Lenses',
    topicArea: 'light_optics',
    relevantConcept: 'Comparing outward-curved convex mirror wide-field images against inward concave mirror reflections',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'convex_mirror_image',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Observe how a convex (outer spoon) mirror always produces an upright, diminished, wide-field virtual image and compare it with a concave (inner spoon) mirror.',
    whyItImportant:
      'Directly connects a kitchen steel spoon to road safety mirrors, ATMs, and dental inspection mirrors.',
    realWorldApplication:
      'Vehicle side-view mirrors, sharp-turn mountain road mirrors, and store security domes.',
    description:
      'Launches directly in Convex Mirror mode on the Optics Ray Bench; move the object slider near and far to confirm the image always stays upright and smaller, then switch to Concave Mirror to contrast.',
    apparatus: ['Convex spherical mirror', 'Concave spherical mirror', 'Optical bench & movable object arrow'],
    procedure: [
      'In Convex Mirror mode, sweep Object Distance u from 10 cm to 55 cm and verify the virtual image behind the mirror stays upright and diminished.',
      'Switch to Concave Mirror mode in the control panel and compare how the image flips upside down once u > f.',
      'Click the Convex Mirror component inside the canvas to review why vehicles warn “Objects in mirror are closer than they appear.”',
    ],
    observationsGuide: [
      'Convex mirrors diverge reflected rays so virtual extensions always meet behind the mirror between P and F.',
      'Concave mirrors invert distant images but magnify very close objects upright.',
    ],
    expectedOutcome:
      'Students distinguish concave and convex mirror image properties across object distances.',
    scientificExplanation:
      'An outward-bulging convex mirror spreads reflected rays apart, capturing a broad field of view into a small erect virtual image behind the mirror.',
    gradeAdaptedNote:
      'Opens Optics Ray Bench directly in Convex Mirror mode for Class 8 Ch. 10.',
    assessmentQuestions: [
      {
        id: 'c8_spn_q1',
        kind: 'application',
        prompt: 'Looking into the shiny OUTER curved back of a steel spoon acts like which type of mirror?',
        options: ['Plane mirror', 'Concave mirror', 'Convex mirror', 'Glass prism'],
        correctIndex: 2,
        explanation: 'The outward-bulging back of a spoon curves outward like a convex mirror, showing an upright smaller face.',
      },
      {
        id: 'c8_spn_q2',
        kind: 'conceptual',
        prompt: 'No matter how far you move an object in front of a convex mirror, its image is ALWAYS:',
        options: [
          'Real and inverted',
          'Virtual, erect, and diminished',
          'Virtual and magnified 10×',
          'Formed on a paper screen in front of the mirror',
        ],
        correctIndex: 1,
        explanation: 'Convex mirrors always form upright, smaller, virtual images behind the mirror.',
      },
    ],
  },
  {
    id: 'c8_diverging_concave_lens_activity',
    title: 'Diverging Rays Through a Concave Lens Lab',
    classLevel: 8,
    chapterId: 'c8_ch10',
    chapterNumber: 10,
    chapterTitle: 'Light: Mirrors and Lenses',
    topicArea: 'light_optics',
    relevantConcept: 'Concave lens ray divergence & upright diminished virtual image formation',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'concave_lens_image',
    reusedAcrossClasses: [8, 10],
    learningObjective:
      'Trace how a concave (thinner-in-centre) lens diverges incoming rays outward and always produces an upright, diminished virtual image.',
    whyItImportant:
      'Contrasts directly with converging magnifying lenses and explains door peepholes and myopia spectacles.',
    realWorldApplication:
      'Front-door wide-angle peepholes, nearsightedness eyeglasses, and laser beam expanders.',
    description:
      'Opens directly in Concave Lens mode: slide object distance u and focal length f to watch transmitted rays diverge and trace virtual dashed extensions back to the upright diminished image.',
    apparatus: ['Double concave lens', 'Optical bench scale', 'Illuminated object arrow'],
    procedure: [
      'Adjust Object Distance u across the full range (10 cm–55 cm) and confirm the image stays upright, smaller, and on the same side as the object.',
      'Adjust Focal Length f and see how shorter focal length bends rays outward more strongly.',
      'Toggle to Convex Lens to compare converging vs. diverging behaviour.',
    ],
    observationsGuide: [
      'A concave lens never converges parallel sunlight to a burning spot—it spreads the beam out.',
      'Virtual image always forms between the optical centre O and focus F₁.',
    ],
    expectedOutcome:
      'Students distinguish diverging concave lenses from converging convex lenses visually and conceptually.',
    scientificExplanation:
      'Because a concave lens is thinner at the middle and thicker at the edges, refraction bends rays away from the principal axis as if diverging from the virtual principal focus F₁.',
    gradeAdaptedNote:
      'Opens Optics Ray Bench directly in Concave Lens mode for Class 8 Ch. 10.',
    assessmentQuestions: [
      {
        id: 'c8_cln_q1',
        kind: 'conceptual',
        prompt: 'Can you ignite a piece of dry paper by focusing sunlight through a concave lens?',
        options: [
          'Yes, it focuses sunlight to a tiny hot spot',
          'No, a concave lens diverges (spreads) parallel sunlight instead of focusing it',
          'Only if the lens is painted black',
          'Yes, at midnight',
        ],
        correctIndex: 1,
        explanation: 'Only a converging convex lens focuses parallel sunlight to a real focal spot; a concave lens spreads rays apart.',
      },
      {
        id: 'c8_cln_q2',
        kind: 'application',
        prompt: 'How does text on a book page look when viewed closely through a concave lens?',
        options: ['Upside-down and giant', 'Upright and smaller (diminished)', 'Completely invisible', 'Split into a rainbow'],
        correctIndex: 1,
        explanation: 'A concave lens always produces an erect, diminished virtual image.',
      },
    ],
  },

  // =========================================================================
  // CLASS 9 — RATIONALISED NCERT SCIENCE (EXPANDED ACTIVITIES)
  // =========================================================================
  {
    id: 'c9_uniform_circular_motion',
    title: 'Uniform Circular Motion & Tangential Velocity Release Lab',
    classLevel: 9,
    chapterId: 'c9_ch4',
    chapterNumber: 7,
    chapterTitle: 'Motion',
    topicArea: 'motion_measurement',
    relevantConcept: 'Constant speed v = 2πr/t with continuously changing velocity direction (accelerated motion)',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'motion_kinematics',
    simulationPreset: 'class9_circular_motion',
    reusedAcrossClasses: [6, 7, 9],
    learningObjective:
      'Verify why uniform circular motion is accelerated even at constant speed and compute orbital speed v = 2πr / t.',
    whyItImportant:
      'Explains why hammer-throw athletes release along a tangent and how satellites and planets stay in orbit.',
    realWorldApplication:
      'Artificial Earth satellites, hammer/discus athletics throw, and banked highway curves.',
    description:
      'Launches directly in Circular Orbit mode for Class 9 Ch. 7: inspect the live tangent velocity vector turning continuously while speed remains constant, and compare distance (2πr) with net displacement.',
    apparatus: ['Circular kinematics track', 'Live tangent velocity vector arrow', 'Radius & speed controls'],
    procedure: [
      'Set Orbit Radius r = 5.0 m and speed v = 4.5 m/s and watch the velocity vector rotate tangent to the circle.',
      'Verify that after one complete revolution, distance covered equals 2πr while displacement returns to 0 m.',
      'Recall NCERT Activity 7.11: releasing a whirled stone causes it to fly straight along the tangent at the release point.',
    ],
    observationsGuide: [
      'Velocity is a vector; changing direction alone means the body is accelerating.',
      'Orbital speed along a circle of radius r completed in time t is v = 2πr / t.',
    ],
    expectedOutcome:
      'Students explain why uniform circular motion is accelerated motion and calculate v = 2πr / t.',
    scientificExplanation:
      'Even when speed |v| is constant, the velocity vector continuously turns inward toward the centre, requiring centripetal acceleration.',
    gradeAdaptedNote:
      'Opens Motion Kinematics Engine directly in Circular Orbit mode for NCERT Class 9 Ch. 7 (Activity 7.11).',
    assessmentQuestions: [
      {
        id: 'c9_ucm_q1',
        kind: 'conceptual',
        prompt: 'Why is uniform circular motion considered accelerated motion even though speed stays constant?',
        options: [
          'Because mass keeps increasing',
          'Because the direction of velocity changes continuously at every point along the circle',
          'Because time stops at the centre',
          'Because distance is zero',
        ],
        correctIndex: 1,
        explanation: 'Acceleration is any change in velocity—whether in magnitude OR direction.',
      },
      {
        id: 'c9_ucm_q2',
        kind: 'application',
        prompt: 'When a stone whirled in a horizontal circle on a string is suddenly released, which path does it follow?',
        options: [
          'Straight outward away from the centre',
          'Straight along the tangent to the circle at the point of release',
          'It continues orbiting in a smaller circle',
          'It drops straight back to the centre',
        ],
        correctIndex: 1,
        explanation: 'Without inward string pull, inertia carries the stone straight along its instantaneous tangent velocity.',
      },
    ],
  },
  {
    id: 'c9_inertia_card_coin_third_law',
    title: 'Card-and-Coin Inertia, Carrom Stack & Coupled Spring Balances',
    classLevel: 9,
    chapterId: 'c9_ch6',
    chapterNumber: 8,
    chapterTitle: 'Force and Laws of Motion',
    topicArea: 'force_mechanics',
    relevantConcept: 'Inertia of rest (First Law) & equal-and-opposite action–reaction pairs (Third Law)',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Demonstrate inertia of rest using the card-and-coin and carrom-stack activities, and verify Newton’s Third Law using two hooked spring balances.',
    whyItImportant:
      'Builds crystal-clear physical intuition for Newton’s First and Third Laws before solving momentum & force problems.',
    realWorldApplication:
      'Shaking wet clothes or tree branches, rocket exhaust propulsion, and swimmer push-off.',
    description:
      'NCERT Class 9 Ch. 8 classic classroom demonstrations (Activities 8.1–8.4): flicking a playing card beneath a five-rupee coin, striking the bottom carrom coin, and pulling two interlinked spring balances.',
    apparatus: [
      'Glass tumbler, stiff playing card & ₹5 metal coin',
      'Stack of carrom coins & striker',
      'Two identical spring balances A and B + inflated balloon on straw',
    ],
    procedure: [
      'Place a stiff card over a glass tumbler and balance a ₹5 coin at its centre; flick the card sharply horizontally—watch the coin drop straight into the glass.',
      'Build a vertical stack of carrom coins and hit only the bottom coin rapidly with the striker; observe the upper stack drop straight down.',
      'Hook Spring Balance A to a fixed wall hook and link Spring Balance B to A; pull B steadily and compare both scale readings.',
      'Release an inflated balloon taped to a straw threaded on a taut string to observe forward jet motion from backward escaping air.',
    ],
    observationsGuide: [
      'The heavy coin resists rapid horizontal acceleration (inertia of rest) and falls vertically once the card slides away.',
      'Both spring balances ALWAYS show identical force magnitudes in opposite directions (F_AB = −F_BA).',
    ],
    expectedOutcome:
      'Students connect inertia to mass and recognize that action–reaction forces act on TWO different bodies simultaneously.',
    scientificExplanation:
      'Newton’s First Law states objects maintain rest or uniform motion unless acted on by net external force; heavier mass has larger inertia. Newton’s Third Law states every force exerted by body A on body B produces an equal and opposite force by B on A.',
    gradeAdaptedNote:
      'Mapped directly to NCERT Class 9 Ch. 8 Activities 8.1, 8.2, 8.3 & 8.4.',
    assessmentQuestions: [
      {
        id: 'c9_in3_q1',
        kind: 'conceptual',
        prompt: 'When you flick the stiff card swiftly off a glass tumbler, why does the coin fall straight into the glass instead of flying off with the card?',
        options: [
          'Gravity switches off for the card',
          'Because of inertia of rest, the coin resists sudden horizontal motion and falls downward when support vanishes',
          'Air suction pulls the coin sideways',
          'The coin is glued to air',
        ],
        correctIndex: 1,
        explanation: 'The coin tends to stay at rest (Newton’s First Law) while the brief flick removes the card beneath it.',
      },
      {
        id: 'c9_in3_q2',
        kind: 'application',
        prompt: 'Spring balance A is hooked to a wall and spring balance B pulls it with 15 N. What does spring balance A read?',
        options: ['0 N', '7.5 N', '15 N', '30 N'],
        correctIndex: 2,
        explanation: 'By Newton’s Third Law, both balances exert equal and opposite 15 N forces on each other.',
      },
    ],
  },
  {
    id: 'c9_free_fall_solid_density_practical',
    title: 'Free Fall (Paper vs. Crumpled Ball) & Solid Density Practical',
    classLevel: 9,
    chapterId: 'c9_grav_module',
    chapterNumber: 9,
    chapterTitle: 'Gravitation, Free Fall & Archimedes Buoyancy',
    topicArea: 'force_mechanics',
    relevantConcept: 'Uniform gravitational acceleration g = 9.8 m/s², air resistance & measuring solid density ρ = m / V',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Understand why all bodies share the same free-fall acceleration g in vacuum and execute the NCERT Class 9 practical determining density of a solid using a spring balance and measuring cylinder.',
    whyItImportant:
      'Resolves the common misconception that heavier objects naturally fall faster and teaches precision displacement volume measurement.',
    realWorldApplication:
      'Identifying pure metals/alloys by density, parachute aerodynamic drag, and spacecraft re-entry.',
    description:
      'Guided NCERT Class 9 Ch. 9 Lab Manual practical combining the flat-sheet vs. crumpled-paper free-fall test with step-by-step solid density calculation (spring balance + graduated cylinder).',
    apparatus: [
      'Two identical sheets of paper (one flat, one crumpled tightly)',
      'Spring balance (least count noted) & metal bob/stone',
      'Graduated measuring cylinder with water',
    ],
    procedure: [
      'Drop a flat paper sheet and a tightly crumpled identical paper sheet from the same height—observe air drag slowing the flat sheet despite equal mass.',
      'Record the dry solid’s mass m (in grams) using the spring balance after checking zero error.',
      'Record initial water level V₁ (mL) in the measuring cylinder; gently immerse the tied solid completely and read V₂ (mL).',
      'Compute solid volume V = V₂ − V₁ (cm³) and density ρ = m / V (g/cm³ or kg/m³).',
    ],
    observationsGuide: [
      'In vacuum (no air drag), a feather and a stone fall together at g = 9.8 m/s² because mass cancels in g = GM / R².',
      '1 mL of displaced water equals 1 cm³ of submerged solid volume.',
    ],
    expectedOutcome:
      'Students compute solid density accurately from displacement volume and explain why g is independent of falling mass.',
    scientificExplanation:
      'Gravitational force F = GMm/R² gives acceleration a = F/m = GM/R² = g, independent of the falling object’s mass m. Density ρ = m/V is an intrinsic material property.',
    gradeAdaptedNote:
      'Covers NCERT Class 9 Ch. 9 Free Fall activity & Prescribed Board Lab Manual Density Practical.',
    assessmentQuestions: [
      {
        id: 'c9_den_q1',
        kind: 'numerical',
        prompt: 'A 156 g metal block raises water in a measuring cylinder from 40 mL to 60 mL. What is the metal’s density?',
        options: ['3.9 g/cm³', '2.6 g/cm³', '7.8 g/cm³', '15.6 g/cm³'],
        correctIndex: 2,
        explanation: 'Volume V = 60 − 40 = 20 cm³; Density ρ = m / V = 156 / 20 = 7.8 g/cm³ (iron/steel).',
      },
      {
        id: 'c9_den_q2',
        kind: 'conceptual',
        prompt: 'Why does a crumpled paper ball hit the floor before an identical flat sheet of paper?',
        options: [
          'Crumpling increases its mass',
          'Gravity pulls harder on round objects',
          'The flat sheet experiences much larger upward air resistance over its wider area',
          'Air has zero effect on flat sheets',
        ],
        correctIndex: 2,
        explanation: 'Both share the same gravitational acceleration g, but air drag slows the wide flat sheet far more.',
      },
    ],
  },
  {
    id: 'c9_levers_pulleys_mechanical_advantage',
    title: 'Levers, Pulleys & Mechanical Advantage Work-Energy Lab',
    classLevel: 9,
    chapterId: 'c9_ch7',
    chapterNumber: 10,
    chapterTitle: 'Work and Energy (with Simple Machines Extension)',
    topicArea: 'work_energy_machines',
    relevantConcept: 'Mechanical Advantage MA = Load / Effort, pulley strands & conservation of work W_in = W_out',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'simple_machines_energy',
    simulationPreset: 'class9_levers_pulleys',
    reusedAcrossClasses: [9],
    learningObjective:
      'Measure how adding supporting pulley strands or lengthening a lever’s effort arm multiplies lifting force while conserving total mechanical work W = F·d.',
    whyItImportant:
      'Shows why simple machines reduce required effort force without creating “free energy.”',
    realWorldApplication:
      'Construction tower cranes, block-and-tackle hoists, crowbars, nutcrackers, and wheelbarrows.',
    description:
      'Launches directly in Lever & Pulley Machine mode: adjust load mass, effort arm length, and pulley rope strands to inspect Mechanical Advantage and Effort Force live.',
    apparatus: ['Multi-strand pulley hoist', 'Lever beam on triangular fulcrum', 'Slotted brass loads (kg)'],
    procedure: [
      'Set Load Mass = 6 kg and Extra Pulley Strands = 0 (single fixed pulley) and note Effort = Load weight.',
      'Increase Pulley Strands from 1 to 4 and watch Mechanical Advantage rise to 4× while Effort drops to one-fourth.',
      'Click the Pulley Wheel and Fulcrum Pivot to understand the force-vs-distance trade-off.',
    ],
    observationsGuide: [
      'Doubling Mechanical Advantage halves Effort Force, but requires pulling twice the length of rope.',
      'Ideal Work Input (Effort × Effort Distance) always equals Work Output (Load × Height lifted).',
    ],
    expectedOutcome:
      'Students compute Mechanical Advantage and Effort Force and connect simple machines to conservation of energy.',
    scientificExplanation:
      'Energy conservation ensures no passive machine can output more work than input: F_effort · d_effort = Load · h. Thus MA = Load / Effort = d_effort / h.',
    gradeAdaptedNote:
      'Opens the Work & Energy Engine directly in Lever & Pulley mode for Class 9 Ch. 10.',
    assessmentQuestions: [
      {
        id: 'c9_mac_q1',
        kind: 'numerical',
        prompt: 'A 4-strand ideal pulley lifts a 400 N crate by 1 m. What effort force is required and how much rope must be pulled?',
        options: [
          '400 N effort, 1 m rope',
          '100 N effort, 4 m rope',
          '100 N effort, 0.25 m rope',
          '1600 N effort, 4 m rope',
        ],
        correctIndex: 1,
        explanation: 'MA = 4 cuts effort to 400/4 = 100 N while multiplying rope pulled to 4 × 1 m = 4 m (Work = 400 J conserved).',
      },
      {
        id: 'c9_mac_q2',
        kind: 'conceptual',
        prompt: 'Does a simple machine reduce the total amount of ideal work needed to lift a heavy stone to a given height?',
        options: [
          'Yes, it eliminates half the work',
          'No, it trades a smaller effort force for a proportionally longer effort distance',
          'Yes, it creates extra energy',
          'Only when used in water',
        ],
        correctIndex: 1,
        explanation: 'Machines make work easier by lowering force or changing direction, while ideal work mgh stays unchanged.',
      },
    ],
  },
  {
    id: 'c9_sound_speed_media_slinky',
    title: 'Longitudinal Sound Waves Across Air, Water & Steel (Slinky & Tuning Fork)',
    classLevel: 9,
    chapterId: 'c9_ch10',
    chapterNumber: 11,
    chapterTitle: 'Sound',
    topicArea: 'sound_waves',
    relevantConcept: 'Mechanical wave requirement of medium, compressions/rarefactions & speed v_solid > v_liquid > v_gas',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'sound_wave_lab',
    simulationPreset: 'class9_sound_media',
    reusedAcrossClasses: [9],
    learningObjective:
      'Compare how longitudinal compressions and rarefactions propagate at different speeds through Air (343 m/s), Water (1480 m/s), and Steel (5100 m/s).',
    whyItImportant:
      'Explains why sound cannot travel in outer space vacuum and why underwater sonar & railway tracks carry sound far faster than air.',
    realWorldApplication:
      'Submarine underwater SONAR, rail-track acoustic inspection, and stethoscope diagnostics.',
    description:
      'Opens the Sound Wave Lab focused on medium propagation (Air vs. Water vs. Steel): switch media at fixed frequency to watch wavelength λ = v/f expand dramatically in denser elastic solids and liquids.',
    apparatus: ['Acoustic longitudinal wave tube', 'Medium selector (Air / Water / Steel)', 'Tuning fork frequency generator'],
    procedure: [
      'Hold Frequency constant at 440 Hz and switch Medium from Air → Water → Steel.',
      'Observe Wave Speed jump from 343 m/s to 1480 m/s to 5100 m/s while Wavelength λ stretches proportionally.',
      'Click Compression and Rarefaction regions inside the viewport to connect air particle pulses to a stretched slinky spring.',
    ],
    observationsGuide: [
      'Particles oscillate back and forth parallel to wave travel direction (longitudinal wave) without travelling across the room.',
      'Sound travels fastest in solids, slower in liquids, slowest in gases, and cannot travel in vacuum.',
    ],
    expectedOutcome:
      'Students explain longitudinal propagation and rank sound speeds across solids, liquids, and gases.',
    scientificExplanation:
      'Sound is a mechanical elastic wave. Stronger inter-atomic restoring forces in solids like steel transmit compressions much faster than loosely spaced gas molecules in air, obeying v = fλ.',
    gradeAdaptedNote:
      'Opens Sound Wave Lab in medium-comparison mode for NCERT Class 9 Ch. 11 (Slinky & Tuning Fork activities).',
    assessmentQuestions: [
      {
        id: 'c9_med_q1',
        kind: 'conceptual',
        prompt: 'In which medium does a sound wave travel FASTEST at room temperature?',
        options: ['Vacuum of space', 'Air (gas)', 'Water (liquid)', 'Steel (solid)'],
        correctIndex: 3,
        explanation: 'High elasticity and tightly bonded atoms make sound travel fastest in solids like steel (~5100 m/s).',
      },
      {
        id: 'c9_med_q2',
        kind: 'conceptual',
        prompt: 'Why can astronauts on the Moon not hear each other talking directly without radio headsets?',
        options: [
          'Moon gravity is too strong',
          'Sound is a mechanical wave requiring a material medium, and the Moon has no atmosphere (vacuum)',
          'Sound waves freeze on the Moon',
          'Helmets block radio waves',
        ],
        correctIndex: 1,
        explanation: 'Without air particles to form compressions and rarefactions, mechanical sound waves cannot propagate.',
      },
    ],
  },
  {
    id: 'c9_laws_of_reflection_of_sound',
    title: 'NCERT Practical: Laws of Reflection of Sound (Two-Pipe Tube Setup)',
    classLevel: 9,
    chapterId: 'c9_ch10',
    chapterNumber: 11,
    chapterTitle: 'Sound',
    topicArea: 'sound_waves',
    relevantConcept: 'Acoustic reflection ∠i = ∠r, coplanar normal & hard vs. soft sound-absorbing surfaces',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Verify experimentally that sound obeys the same two laws of reflection as light (∠i = ∠r) using two cardboard pipes, a ticking clock, and a hard reflecting board.',
    whyItImportant:
      'Prescribed NCERT Class 9 Lab Manual practical explaining megaphones, stethoscopes, and concert hall curved ceilings.',
    realWorldApplication:
      'Doctor’s stethoscopes, curved auditorium ceilings, acoustic diffusers, and ultrasound imaging.',
    description:
      'Complete NCERT Class 9 Ch. 11 Board Practical guide for measuring angles of incidence and reflection of sound waves off a hard vertical board separated by a sound-blocking screen.',
    apparatus: [
      'Two identical long hollow cardboard pipes (≈ 50 cm)',
      'Smooth vertical hard reflecting board & soft wooden baffle screen',
      'Ticking stopwatch/clock & protractor drawn on table',
    ],
    procedure: [
      'Place the vertical reflecting board along a baseline and draw a perpendicular normal line with a protractor.',
      'Place Pipe 1 at an incident angle ∠i = 30° with a ticking clock at its outer end; set a vertical baffle screen along the normal to block direct sound.',
      'Slowly swing Pipe 2 on the other side of the normal while listening at its end until the ticking sounds LOUDEST.',
      'Measure the reflection angle ∠r of Pipe 2 and repeat for ∠i = 40° and 50°; lift Pipe 2 slightly out of the table plane to test coplanarity.',
    ],
    observationsGuide: [
      'Maximum loudness is heard consistently when ∠r equals ∠i (30° = 30°, 40° = 40°, 50° = 50°).',
      'Lifting Pipe 2 upward makes the sound drop sharply, confirming incident wave, normal, and reflected wave lie in the same plane.',
    ],
    expectedOutcome:
      'Students record ∠i = ∠r across three trials and verify both laws of reflection of sound.',
    scientificExplanation:
      'Acoustic pressure wavefronts reflect cleanly off smooth, hard surfaces whose dimensions exceed the sound wavelength, obeying ∠i = ∠r in the plane of incidence.',
    gradeAdaptedNote:
      'Prescribed NCERT Class 9 Lab Manual Practical (Reflection of Sound).',
    assessmentQuestions: [
      {
        id: 'c9_ref_q1',
        kind: 'numerical',
        prompt: 'In the two-pipe sound reflection practical, Pipe 1 is placed at 38° to the normal. At what angle to the normal will Pipe 2 hear the loudest ticking?',
        options: ['52°', '38°', '76°', '19°'],
        correctIndex: 1,
        explanation: 'By the law of reflection of sound, angle of reflection equals angle of incidence = 38°.',
      },
      {
        id: 'c9_ref_q2',
        kind: 'application',
        prompt: 'Why do auditoriums cover rear walls with heavy curtains and porous fibreboard panels?',
        options: [
          'To increase echoes',
          'Soft porous materials absorb sound waves and prevent excessive reverberation',
          'To speed up sound to 5000 m/s',
          'To reflect sound back to the ceiling',
        ],
        correctIndex: 1,
        explanation: 'Sound-absorbing materials damp repeated reflections, keeping speech and music crisp.',
      },
    ],
  },

  // =========================================================================
  // CLASS 10 — RATIONALISED NCERT SCIENCE (EXPANDED ACTIVITIES & PRACTICALS)
  // =========================================================================
  {
    id: 'c10_convex_mirror_wide_field',
    title: 'Convex Mirror Image Formation, Sign Convention & Wide Field of View',
    classLevel: 10,
    chapterId: 'c10_ch9',
    chapterNumber: 9,
    chapterTitle: 'Light – Reflection and Refraction',
    topicArea: 'light_optics',
    relevantConcept: 'Convex mirror positive focal length (+f), Cartesian sign convention & virtual diminished magnification (0 < m < 1)',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'convex_mirror_image',
    reusedAcrossClasses: [8, 10],
    learningObjective:
      'Apply the New Cartesian Sign Convention (+f, −u, +v) to a convex mirror and verify why magnification m = −v/u always lies between 0 and +1.',
    whyItImportant:
      'Core Class 10 board numerical topic paired with concave mirror ray tracing (Activities 9.5–9.6).',
    realWorldApplication:
      'Automobile wing mirrors, blind-intersection road mirrors, and security dome mirrors.',
    description:
      'Launches directly in Convex Mirror mode with live u, v, f, and magnification readouts obeying the NCERT New Cartesian Sign Convention.',
    apparatus: ['Convex spherical mirror (+f)', 'Optical bench ruler', 'Illuminated arrow object'],
    procedure: [
      'Set focal length f = +15 cm and sweep object distance u from 10 cm to 55 cm.',
      'Verify that image distance v stays positive (behind mirror, between P and F) and magnification m stays positive and less than 1.',
      'Check 1/v + 1/u = 1/f using the live telemetry tiles.',
    ],
    observationsGuide: [
      'For any finite object distance u < 0, a convex mirror forms a virtual, erect, diminished image between P and F.',
      'Bringing the object closer to the pole makes the virtual image grow slightly closer to full size, never exceeding 1×.',
    ],
    expectedOutcome:
      'Students solve convex mirror formula problems accurately with proper Cartesian signs.',
    scientificExplanation:
      'In the New Cartesian Sign Convention, a convex mirror’s focus lies behind the reflecting face so f > 0. With u < 0, 1/v = 1/f − 1/u is always positive and larger than 1/f, guaranteeing 0 < v < f.',
    gradeAdaptedNote:
      'Opens Optics Ray Bench directly in Convex Mirror quantitative mode for NCERT Class 10 Ch. 9 (Activities 9.5–9.6).',
    assessmentQuestions: [
      {
        id: 'c10_cvm_q1',
        kind: 'numerical',
        prompt: 'A rear-view convex mirror has radius of curvature R = +3.0 m. A bus is located 5.0 m in front of it (u = −5.0 m). Where does the image form?',
        options: [
          'v = +1.15 m behind the mirror (virtual, erect, diminished)',
          'v = −1.15 m in front of the mirror',
          'v = +5.0 m behind the mirror',
          'At infinity',
        ],
        correctIndex: 0,
        explanation: 'f = +1.5 m; 1/v = 1/1.5 − 1/(−5.0) = 1/1.5 + 1/5.0 = 13/15 → v = +1.15 m behind the mirror.',
      },
      {
        id: 'c10_cvm_q2',
        kind: 'conceptual',
        prompt: 'What is the sign of focal length (f) and magnification (m) for a convex mirror forming an image of a real car?',
        options: [
          'f negative, m negative',
          'f positive, m positive (between 0 and +1)',
          'f negative, m positive (> 1)',
          'f zero, m zero',
        ],
        correctIndex: 1,
        explanation: 'Convex mirror focus is on the +X side (+f) and the erect diminished image gives 0 < m < +1.',
      },
    ],
  },
  {
    id: 'c10_concave_lens_diverging_images',
    title: 'Concave Lens Ray Diagrams, Lens Formula & Negative Dioptre Power',
    classLevel: 10,
    chapterId: 'c10_ch9',
    chapterNumber: 9,
    chapterTitle: 'Light – Reflection and Refraction',
    topicArea: 'light_optics',
    relevantConcept: 'Diverging thin lens formula 1/v − 1/u = 1/f with negative focal length (−f) & power P < 0 D',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'optics_ray_lab',
    simulationPreset: 'concave_lens_image',
    reusedAcrossClasses: [8, 10],
    learningObjective:
      'Trace principal rays through a concave lens, apply 1/v − 1/u = 1/f with negative focal length, and compute negative Dioptre lens power.',
    whyItImportant:
      'Essential for Class 10 optics numericals and understanding minus-power (−D) myopia spectacle prescriptions.',
    realWorldApplication:
      'Myopia eyeglasses (−1.5 D, −2.5 D), camera zoom lens assemblies, and Galilean telescopes.',
    description:
      'Launches directly in Concave Lens mode with live Cartesian u, v, f, magnification m = v/u, and negative optical power P = 1/f(m).',
    apparatus: ['Double concave glass lens (−f)', 'Optical bench scale', 'Illuminated object arrow'],
    procedure: [
      'Set focal length f = −15 cm and test object positions at u = −45 cm, −30 cm, and −12 cm.',
      'Verify that image distance v always stays negative (same side as object, between O and F₁) and magnification is positive and < 1.',
      'Compute optical power P = 1 / f(m) and confirm concave lenses always carry negative Dioptre power.',
    ],
    observationsGuide: [
      'All object positions produce a virtual, erect, diminished image on the object side between O and F₁.',
      'A concave lens of f = −20 cm (−0.20 m) has optical power P = −5.0 D.',
    ],
    expectedOutcome:
      'Students solve concave lens formula and power numericals accurately with negative signs.',
    scientificExplanation:
      'By Cartesian sign convention, a concave lens has negative focal length f < 0. Therefore 1/v = 1/f + 1/u is always negative, placing the virtual erect image on the same side between O and F₁.',
    gradeAdaptedNote:
      'Opens Optics Ray Bench directly in Concave Lens quantitative mode for NCERT Class 10 Ch. 9 (Activity 9.13).',
    assessmentQuestions: [
      {
        id: 'c10_cvl_q1',
        kind: 'numerical',
        prompt: 'A student’s spectacles have a concave lens of focal length −25 cm (−0.25 m). What is the lens power?',
        options: ['+4.0 D', '−4.0 D', '−0.25 D', '+2.5 D'],
        correctIndex: 1,
        explanation: 'Power P = 1 / f(m) = 1 / (−0.25 m) = −4.0 Dioptre (D).',
      },
      {
        id: 'c10_cvl_q2',
        kind: 'numerical',
        prompt: 'An object sits 30 cm in front of a concave lens of focal length −15 cm. Where does the image form?',
        options: ['−10 cm (same side as object)', '+10 cm (other side)', '−30 cm', 'At infinity'],
        correctIndex: 0,
        explanation: '1/v = 1/f + 1/u = 1/(−15) + 1/(−30) = −3/30 = −1/10 → v = −10 cm.',
      },
    ],
  },
  {
    id: 'c10_tyndall_scattering_atmosphere',
    title: 'Tyndall Effect, Colloidal Scattering & Blue Sky / Red Sunset',
    classLevel: 10,
    chapterId: 'c10_ch10',
    chapterNumber: 10,
    chapterTitle: 'The Human Eye and the Colourful World',
    topicArea: 'light_optics',
    relevantConcept: 'Wavelength-dependent Rayleigh scattering (blue scatters most, red least) & Tyndall beam visibility',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Explain NCERT Activity 10.3 (colloidal sulphur tank scattering) and connect short-wavelength blue scattering to sky colour and red danger signals.',
    whyItImportant:
      'Explains why clear daytime sky is blue, why sunrises/sunsets glow red, why danger lights are red, and why space looks black to astronauts.',
    realWorldApplication:
      'Red traffic/railway danger signals, foggy-weather amber headlights, and optical haze sensors.',
    description:
      'Structured NCERT Class 10 Ch. 10 Activity 10.3 guide tracing a white light beam through clear water mixed with sodium thiosulphate and dilute acid as fine colloidal sulphur particles form.',
    apparatus: [
      'Strong white-light source & converging lens',
      'Transparent glass tank with water + sodium thiosulphate (hypo) + drops of dilute sulphuric acid',
      'Cardboard circular aperture & white projection screen',
    ],
    procedure: [
      'Pass a parallel beam of white light through the clear water tank onto a white screen—the beam looks pure white.',
      'Dissolve sodium thiosulphate in water and add 1–2 mL of dilute sulphuric acid; fine microscopic sulphur particles precipitate within 2–3 minutes.',
      'View the tank from the THREE sides: notice a sky-blue glow scattered sideways from the fine particles.',
      'View the transmitted spot directly on the screen: notice it shifts from orange-red to crimson-red as shorter blue light is scattered out.',
    ],
    observationsGuide: [
      'Fine air molecules & colloidal particles scatter shorter wavelengths (blue/violet) far more strongly than longer red wavelengths.',
      'Red light scatters the least through fog or smoke, remaining visible from the farthest distance.',
    ],
    expectedOutcome:
      'Students explain Tyndall scattering, blue sky, red danger signals, and dark sky at high altitudes.',
    scientificExplanation:
      'When particle diameter is much smaller than light wavelength, scattering intensity rises sharply for shorter wavelengths (∝ 1/λ⁴). Blue light scatters across the sky, while longer red wavelengths penetrate farther.',
    gradeAdaptedNote:
      'Mapped directly to NCERT Class 10 Ch. 10 Activity 10.3.',
    assessmentQuestions: [
      {
        id: 'c10_tyn_q1',
        kind: 'application',
        prompt: 'Why are railway danger signals and brake lights universally RED in colour?',
        options: [
          'Red light has the longest visible wavelength and is scattered the LEAST by fog or smoke, staying visible from afar',
          'Red light travels faster in air than blue light',
          'Red light bends the most in prisms',
          'Human eyes can only see red at night',
        ],
        correctIndex: 0,
        explanation: 'Least scattering allows red signal beams to travel long distances clearly even through mist or haze.',
      },
      {
        id: 'c10_tyn_q2',
        kind: 'conceptual',
        prompt: 'Why does the sky appear dark/black instead of blue to an astronaut orbiting above Earth’s atmosphere?',
        options: [
          'Sunlight does not reach space',
          'There are no atmospheric air molecules in space to scatter sunlight',
          'Space absorbs only blue light',
          'Stars block blue light',
        ],
        correctIndex: 1,
        explanation: 'Without an atmosphere, no scattering occurs, so space looks dark except where looking directly at light sources.',
      },
    ],
  },
  {
    id: 'c10_parallel_resistors_practical',
    title: 'Board Practical: Resistors in Parallel (1/R_p = 1/R₁ + 1/R₂ & Branch Currents)',
    classLevel: 10,
    chapterId: 'c10_ch11',
    chapterNumber: 11,
    chapterTitle: 'Electricity',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Parallel branch voltage constancy (V₁ = V₂ = V), current splitting (I = I₁ + I₂) & lower equivalent resistance R_p',
    entryCategory: 'ncert_practical',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'interactive_2d',
    simulationEngineId: 'electric_circuit_lab',
    simulationPreset: 'parallel_resistors',
    reusedAcrossClasses: [7, 8, 10],
    learningObjective:
      'Verify experimentally that parallel branches share identical voltage V, split total current I = I₁ + I₂, and yield equivalent resistance 1/R_p = 1/R₁ + 1/R₂ smaller than either branch.',
    whyItImportant:
      'Dedicated CBSE/NCERT Class 10 Board Practical (Activity 11.6) explaining household parallel socket wiring.',
    realWorldApplication:
      'Home parallel room circuits, automotive headlights, and multi-USB power hubs.',
    description:
      'Launches directly in Parallel R₁ || R₂ mode: vary V, R₁, and R₂ to inspect branch currents I₁ and I₂, confirm I_total = I₁ + I₂, and verify R_p = (R₁·R₂)/(R₁+R₂).',
    apparatus: ['DC Power Supply (1.5 V–12 V)', 'Two parallel resistors R₁ & R₂', 'Ammeter, Voltmeter & Plug Key'],
    procedure: [
      'Start with V = 12 V, R₁ = 6 Ω, R₂ = 12 Ω in Parallel mode.',
      'Compute expected R_p = (6×12)/(6+12) = 4.0 Ω and total current I = 12/4 = 3.0 A, and verify against Live Results.',
      'Check the branch readout: I₁ = 2.0 A and I₂ = 1.0 A sum cleanly to 3.0 A while both resistors receive full 12 V.',
    ],
    observationsGuide: [
      'Equivalent resistance R_p is ALWAYS smaller than the smallest individual branch resistor.',
      'Lower-resistance branch draws proportionally larger share of the total current.',
    ],
    expectedOutcome:
      'Students verify 1/R_p = 1/R₁ + 1/R₂ and I = I₁ + I₂ experimentally across multiple resistor pairs.',
    scientificExplanation:
      'Parallel resistors connect across the exact same two potential nodes, so each branch receives full supply voltage V and draws independent current I_k = V/R_k; summing currents gives 1/R_p = 1/R₁ + 1/R₂.',
    gradeAdaptedNote:
      'Opens Electric Circuit Workbench directly in Parallel mode for NCERT Class 10 Prescribed Practical (Activity 11.6).',
    assessmentQuestions: [
      {
        id: 'c10_par_q1',
        kind: 'numerical',
        prompt: 'A 6 Ω resistor and a 3 Ω resistor are connected in parallel across a 6 V battery. What is the TOTAL current drawn from the battery?',
        options: ['0.67 A', '1.0 A', '2.0 A', '3.0 A'],
        correctIndex: 3,
        explanation: 'R_p = (6×3)/(6+3) = 2 Ω, so I_total = V / R_p = 6 V / 2 Ω = 3.0 A (I₁ = 1 A + I₂ = 2 A).',
      },
      {
        id: 'c10_par_q2',
        kind: 'conceptual',
        prompt: 'In a parallel combination of two unequal resistors R₁ and R₂, which quantity is IDENTICAL across both resistors?',
        options: [
          'Electric current I',
          'Potential difference (Voltage V)',
          'Power dissipated',
          'Wire length',
        ],
        correctIndex: 1,
        explanation: 'Both ends of R₁ and R₂ meet at the same junction pair, giving identical voltage V across each branch.',
      },
    ],
  },
  {
    id: 'c10_factors_affecting_resistance',
    title: 'Factors Affecting Resistance (R = ρl/A: Length, Area & Material)',
    classLevel: 10,
    chapterId: 'c10_ch11',
    chapterNumber: 11,
    chapterTitle: 'Electricity',
    topicArea: 'electricity_magnetism',
    relevantConcept: 'Resistance R ∝ l, R ∝ 1/A, and material resistivity ρ (Activity 11.3)',
    entryCategory: 'ncert_activity',
    verificationStatus: 'verified_ncert',
    availabilityStatus: 'explanation_only',
    simulationEngineId: null,
    learningObjective:
      'Investigate how conductor length l, cross-sectional thickness A, and material resistivity ρ change ammeter current and electrical resistance.',
    whyItImportant:
      'Explains why thick copper cables carry heavy AC current safely while thin nichrome coils glow hot inside toasters.',
    realWorldApplication:
      'High-voltage aluminium transmission lines, heavy-gauge home AC wiring, and precision strain gauges.',
    description:
      'NCERT Class 10 Ch. 11 Activity 11.3 comparison substituting four test wires into the same battery-ammeter gap: (1) nichrome wire of length l, (2) nichrome wire of length 2l, (3) thicker nichrome wire of length l, and (4) copper wire of identical length & thickness.',
    apparatus: [
      'DC cell, plug key & ammeter',
      'Nichrome wire (length l, area A) & double-length nichrome wire (2l, A)',
      'Thick nichrome wire (l, 2A) & copper wire (l, A)',
    ],
    procedure: [
      'Insert nichrome wire (l, A) into the test gap and record ammeter reading I₁.',
      'Replace with double-length nichrome wire (2l, A) and observe ammeter current drop to half (resistance doubled).',
      'Replace with thicker nichrome wire (l, 2A) and observe current rise (resistance halved).',
      'Replace with copper wire of equal dimensions (l, A) and observe much larger current due to copper’s tiny resistivity ρ.',
    ],
    observationsGuide: [
      'Doubling wire length doubles resistance (R ∝ l); doubling cross-sectional area halves resistance (R ∝ 1/A).',
      'Copper has much lower resistivity (≈ 1.6×10⁻⁸ Ω·m) than nichrome alloy (≈ 10⁻⁶ Ω·m).',
    ],
    expectedOutcome:
      'Students derive and apply R = ρ · (l / A) and distinguish resistance (Ω) from material resistivity (Ω·m).',
    scientificExplanation:
      'Longer conductors force drifting electrons through more atomic collisions (R ∝ l), wider cross-sections open parallel drift lanes (R ∝ 1/A), and intrinsic lattice structure sets resistivity ρ.',
    gradeAdaptedNote:
      'Mapped directly to NCERT Class 10 Ch. 11 Activities 11.2 & 11.3.',
    assessmentQuestions: [
      {
        id: 'c10_fac_q1',
        kind: 'numerical',
        prompt: 'A copper wire has resistance 4 Ω. What is the resistance of a copper wire of TWICE the length and the SAME thickness?',
        options: ['1 Ω', '2 Ω', '4 Ω', '8 Ω'],
        correctIndex: 3,
        explanation: 'Since R = ρl/A is directly proportional to length l, doubling length doubles resistance to 8 Ω.',
      },
      {
        id: 'c10_fac_q2',
        kind: 'conceptual',
        prompt: 'If a wire is stretched or replaced with a wire of twice the cross-sectional area A (same material & length), what happens to its resistance?',
        options: [
          'It doubles',
          'It halves',
          'It stays unchanged',
          'Resistivity ρ becomes zero',
        ],
        correctIndex: 1,
        explanation: 'Resistance varies inversely with cross-sectional area (R ∝ 1/A), so doubling A cuts R in half.',
      },
    ],
  },
];
