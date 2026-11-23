import type {
  LanguageCode,
  LocalizedAnalysisBundle,
  TextbookAnalysisResult,
} from '../types/physics';

const TRANSLATIONS_BUNDLE: Record<LanguageCode, LocalizedAnalysisBundle> = {
  en: {
    chapter: 'Chapter 13: Magnetic Effects of Electric Current (NCERT)',
    main_topic: 'Magnetic Field Around a Bar Magnet',
    summary:
      'A bar magnet generates a dipole magnetic field in the space around it. Outside the magnet, magnetic field lines emerge from the North pole and curve smoothly to enter the South pole, continuing inside the magnet to form continuous closed loops that never intersect.',
    concepts: [
      {
        id: 'bar-magnet-field-lines',
        name: 'Magnetic Field & Closed Field Lines',
        description:
          'The region surrounding a magnet where magnetic force can be detected. Outside the magnet, field lines emerge from North (N) and enter South (S); inside, they run from South to North to form closed loops.',
        relationships:
          'Higher field-line density indicates a stronger magnetic flux density B; field magnitude decreases rapidly with distance (∝ 1/r³ for a dipole).',
        variables: [
          { symbol: 'B', meaning: 'Magnetic flux density', unit: 'T (Tesla) / mT' },
          { symbol: 'm', meaning: 'Magnetic dipole moment', unit: 'A·m²' },
          { symbol: 'r', meaning: 'Radial distance from dipole center', unit: 'm' },
        ],
        terminology: [
          {
            term: 'North & South Poles',
            definition:
              'Opposite ends of a magnet where magnetic field lines emerge (N) and re-enter (S) most densely.',
          },
          {
            term: 'Magnetic Flux Density (B)',
            definition:
              'The magnitude and direction of the magnetic field passing through unit area, measured in Tesla (T).',
          },
        ],
      },
      {
        id: 'compass-deflection',
        name: 'Compass Needle Alignment & Torque',
        description:
          'A freely pivoted magnetic compass needle behaves like a small magnetic dipole. When placed in a magnetic field, it experiences a restoring torque that rotates it tangent to the local magnetic field vector B.',
        relationships:
          'Restoring torque τ = m · B · sin(θ) is maximum when the needle is perpendicular to the local field (θ = 90°) and zero when aligned (θ = 0°).',
        variables: [
          { symbol: 'τ', meaning: 'Restoring magnetic torque', unit: 'N·m' },
          { symbol: 'θ', meaning: 'Angle between needle moment and field B', unit: 'rad / deg' },
        ],
        terminology: [
          {
            term: 'Magnetic Dipole Moment (m)',
            definition:
              'A vector quantity directed from South to North inside the magnet, measuring overall magnetic strength.',
          },
        ],
      },
      {
        id: 'earth-magnetism-note',
        name: 'Earth’s Geomagnetic Field (Reference)',
        description:
          'Earth acts like a giant tilted magnetic dipole (~11.3° from the geographic rotation axis), guiding freely suspended compass needles along north-south meridians.',
        relationships:
          'Geographic North roughly corresponds to Earth’s magnetic South pole, attracting the North pole of a compass needle.',
        variables: [
          { symbol: 'B_E', meaning: 'Earth’s surface magnetic field (~30–60 μT)', unit: 'μT' },
        ],
        terminology: [
          {
            term: 'Magnetic Meridian',
            definition:
              'Vertical plane passing through the magnetic North and South poles at a given location.',
          },
        ],
      },
    ],
    diagrams: [
      {
        title: 'Bar Magnet Dipole Field & Compass Probe',
        description:
          'Symmetrical closed magnetic field loops emerging from N and entering S with tangent compass alignment.',
        components: ['North Pole (N)', 'South Pole (S)', 'Closed Flux Loops', 'Compass Needle'],
      },
    ],
  },
  kn: {
    chapter: 'ಅಧ್ಯಾಯ 13: ವಿದ್ಯುತ್ ಪ್ರವಾಹದ ಕಾಂತೀಯ ಪರಿಣಾಮಗಳು (NCERT)',
    main_topic: 'ದಂಡ ಅಯಸ್ಕಾಂತದ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ಮತ್ತು ಕ್ಷೇತ್ರ ರೇಖೆಗಳು',
    summary:
      'ದಂಡ ಅಯಸ್ಕಾಂತವು ತನ್ನ ಸುತ್ತಲಿನ ಪ್ರದೇಶದಲ್ಲಿ ಕಾಂತೀಯ ಕ್ಷೇತ್ರವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ. ಹೊರಭಾಗದಲ್ಲಿ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಉತ್ತರ ಧ್ರುವದಿಂದ (N) ಹೊರಟು ದಕ್ಷಿಣ ಧ್ರುವವನ್ನು (S) ಪ್ರವೇಶಿಸುತ್ತವೆ ಮತ್ತು ಒಳಭಾಗದಲ್ಲಿ ಮುಂದುವರೆದು ಮುಚ್ಚಿದ ಆವರ್ತಗಳನ್ನು ರಚಿಸುತ್ತವೆ. ಎರಡು ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಎಂದಿಗೂ ಒಂದನ್ನೊಂದು ಛೇದಿಸುವುದಿಲ್ಲ.',
    concepts: [
      {
        id: 'bar-magnet-field-lines',
        name: 'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ಮತ್ತು ಮುಚ್ಚಿದ ಬಲ ರೇಖೆಗಳು',
        description:
          'ಅಯಸ್ಕಾಂತದ ಬಲವನ್ನು ಅನುಭವಿಸಬಹುದಾದ ಸುತ್ತಲಿನ ಪ್ರದೇಶವನ್ನು ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ಎನ್ನುವರು. ಹೊರಭಾಗದಲ್ಲಿ ರೇಖೆಗಳು ಉತ್ತರ ಧ್ರುವದಿಂದ (N) ದಕ್ಷಿಣ ಧ್ರುವಕ್ಕೆ (S) ಚಲಿಸುತ್ತವೆ.',
        relationships:
          'ಧ್ರುವಗಳ ಹತ್ತಿರ ರೇಖೆಗಳು ದಟ್ಟವಾಗಿದ್ದಷ್ಟೂ ಕಾಂತೀಯ ಫ್ಲಕ್ಸ್ ಸಾಂದ್ರತೆ B ಹೆಚ್ಚಿರುತ್ತದೆ; ದೂರ ಹೋದಂತೆ ಕ್ಷೇತ್ರವು 1/r³ ಅನುಪಾತದಲ್ಲಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ.',
        variables: [
          { symbol: 'B', meaning: 'ಕಾಂತೀಯ ಫ್ಲಕ್ಸ್ ಸಾಂದ್ರತೆ', unit: 'T / mT' },
          { symbol: 'm', meaning: 'ಕಾಂತೀಯ ದ್ವಿಧ್ರುವಿ ಭ್ರಾಮಕ', unit: 'A·m²' },
          { symbol: 'r', meaning: 'ದ್ವಿಧ್ರುವಿ ಕೇಂದ್ರದಿಂದ ದೂರ', unit: 'm' },
        ],
        terminology: [
          {
            term: 'ಉತ್ತರ ಮತ್ತು ದಕ್ಷಿಣ ಧ್ರುವಗಳು',
            definition: 'ಅಯಸ್ಕಾಂತದ ಎರಡು ತುದಿಗಳು, ಇಲ್ಲಿ ಕಾಂತೀಯ ಶಕ್ತಿಯು ಅತ್ಯಧಿಕವಾಗಿರುತ್ತದೆ.',
          },
          {
            term: 'ಕಾಂತೀಯ ಫ್ಲಕ್ಸ್ ಸಾಂದ್ರತೆ (B)',
            definition: 'ಏಕಮಾನ ವಿಸ್ತೀರ್ಣದ ಮೂಲಕ ಹಾದುಹೋಗುವ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ಪ್ರಮಾಣ (Tesla / mT).',
          },
        ],
      },
      {
        id: 'compass-deflection',
        name: 'ದಿಕ್ಸೂಚಿ ಸೂಜಿಯ ವಿಚಲನೆ ಮತ್ತು ತಿರುಗುಬಲ',
        description:
          'ಕಾಂತೀಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ಇರಿಸಿದ ಸಣ್ಣ ದಿಕ್ಸೂಚಿಯು ತಿರುಗುಬಲವನ್ನು (Torque) ಅನುಭವಿಸಿ ಸ್ಥಳೀಯ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ದಿಕ್ಕಿಗೆ ಸ್ಪರ್ಶಕವಾಗಿ ತಿರುಗಿ ನಿಲ್ಲುತ್ತದೆ.',
        relationships:
          'ದಿಕ್ಸೂಚಿಯು ಕ್ಷೇತ್ರಕ್ಕೆ ಲಂಬವಾಗಿದ್ದಾಗ (θ = 90°) ತಿರುಗುಬಲ τ = m·B·sin(θ) ಗರಿಷ್ಠವಾಗಿರುತ್ತದೆ.',
        variables: [
          { symbol: 'τ', meaning: 'ಕಾಂತೀಯ ತಿರುಗುಬಲ', unit: 'N·m' },
          { symbol: 'θ', meaning: 'm ಮತ್ತು B ನಡುವಿನ ಕೋನ', unit: 'rad / deg' },
        ],
        terminology: [
          {
            term: 'ಕಾಂತೀಯ ದ್ವಿಧ್ರುವಿ ಭ್ರಾಮಕ (m)',
            definition: 'ಅಯಸ್ಕಾಂತದ ಶಕ್ತಿ ಮತ್ತು ಅದರ ಧ್ರುವಗಳ ನಡುವಿನ ಅಂತರದ ಗುಣಲಬ್ಧ.',
          },
        ],
      },
      {
        id: 'earth-magnetism-note',
        name: 'ಭೂಮಿಯ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ (ಸೈದ್ಧಾಂತಿಕ)',
        description:
          'ಭೂಮಿಯೂ ಒಂದು ಬೃಹತ್ ಕಾಂತೀಯ ದ್ವಿಧ್ರುವಿಯಂತೆ ವರ್ತಿಸುತ್ತದೆ. ಇದರ ಕಾಂತೀಯ ಅಕ್ಷವು ಭೌಗೋಳಿಕ ಅಕ್ಷದಿಂದ ಸುಮಾರು 11.3° ಕೋನದಷ್ಟು ವಾಲಿರುತ್ತದೆ.',
        relationships: 'ಭೌಗೋಳಿಕ ಉತ್ತರ ದಿಕ್ಕಿನ ಹತ್ತಿರ ಭೂಮಿಯ ಕಾಂತೀಯ ದಕ್ಷಿಣ ಧ್ರುವವಿರುತ್ತದೆ.',
        variables: [{ symbol: 'B_E', meaning: 'ಭೂಮಿಯ ಮೇಲ್ಮೈ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ (~30–60 μT)', unit: 'μT' }],
        terminology: [
          {
            term: 'ಕಾಂತೀಯ ಯಾಮ್ಯೋತ್ತರ (Magnetic Meridian)',
            definition: 'ಭೂಮಿಯ ಕಾಂತೀಯ ಉತ್ತರ ಮತ್ತು ದಕ್ಷಿಣ ಧ್ರುವಗಳ ಮೂಲಕ ಹಾದುಹೋಗುವ ಲಂಬ ಸಮತಲ.',
          },
        ],
      },
    ],
    diagrams: [
      {
        title: 'ದಂಡ ಅಯಸ್ಕಾಂತದ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು',
        description: 'N ಧ್ರುವದಿಂದ S ಧ್ರುವದ ಕಡೆಗೆ ಬಾಣದ ಗುರುತುಗಳೊಂದಿಗೆ ಸಮಪಾರ್ಶ್ವ ಮುಚ್ಚಿದ ವಕ್ರರೇಖೆಗಳು.',
        components: ['ಉತ್ತರ ಧ್ರುವ (N)', 'ದಕ್ಷಿಣ ಧ್ರುವ (S)', 'ಮುಚ್ಚಿದ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು', 'ದಿಕ್ಸೂಚಿ'],
      },
    ],
  },
  hi: {
    chapter: 'अध्याय 13: विद्युत धारा के चुंबकीय प्रभाव (NCERT)',
    main_topic: 'छड़ चुंबक के चारों ओर चुंबकीय क्षेत्र एवं क्षेत्र रेखाएँ',
    summary:
      'एक छड़ चुंबक अपने चारों ओर एक चुंबकीय क्षेत्र उत्पन्न करता है। चुंबक के बाहर क्षेत्र रेखाएँ उत्तरी ध्रुव (N) से निकलकर दक्षिणी ध्रुव (S) में प्रवेश करती हैं और चुंबक के भीतर से होकर बंद वक्र बनाती हैं। दो क्षेत्र रेखाएँ कभी एक-दूसरे को नहीं काटतीं।',
    concepts: [
      {
        id: 'bar-magnet-field-lines',
        name: 'चुंबकीय क्षेत्र और बंद क्षेत्र रेखाएँ',
        description:
          'चुंबक के चारों ओर का वह क्षेत्र जहाँ इसके चुंबकीय बल का अनुभव किया जा सकता है। बाहर की ओर रेखाएँ N से S की तरफ जाती हैं और अंदर S से N की ओर लौटती हैं।',
        relationships:
          'ध्रुवों के पास क्षेत्र रेखाओं का घनत्व अधिक होने से चुंबकीय क्षेत्र B प्रबल होता है; दूरी बढ़ने पर तीव्रता 1/r³ के अनुसार घटती है।',
        variables: [
          { symbol: 'B', meaning: 'चुंबकीय फ्लक्स घनत्व', unit: 'T / mT' },
          { symbol: 'm', meaning: 'चुंबकीय द्विध्रुव आघूर्ण', unit: 'A·m²' },
          { symbol: 'r', meaning: 'द्विध्रुव केंद्र से दूरी', unit: 'm' },
        ],
        terminology: [
          {
            term: 'उत्तरी और दक्षिणी ध्रुव',
            definition: 'छड़ चुंबक के वे दो सिरे जहाँ चुंबकीय क्षेत्र की तीव्रता सबसे अधिक होती है।',
          },
          {
            term: 'चुंबकीय क्षेत्र तीव्रता (B)',
            definition: 'किसी बिंदु पर चुंबकीय बल के परिमाण और दिशा को व्यक्त करने वाला सदिश (Tesla / mT)।',
          },
        ],
      },
      {
        id: 'compass-deflection',
        name: 'दिक्सूचक सुई का संरेखण एवं बलाघूर्ण',
        description:
          'चुंबकीय क्षेत्र में रखा गया दिक्सूचक एक बलाघूर्ण (torque) अनुभव करता है और स्थानीय क्षेत्र रेखा की स्पर्शरेखा की दिशा में संरेखित हो जाता है।',
        relationships:
          'बलाघूर्ण τ = m·B·sin(θ) तब अधिकतम होता है जब सुई क्षेत्र के लंबवत (θ = 90°) हो।',
        variables: [
          { symbol: 'τ', meaning: 'प्रत्यानयन चुंबकीय बलाघूर्ण', unit: 'N·m' },
          { symbol: 'θ', meaning: 'm और B के बीच का कोण', unit: 'rad / deg' },
        ],
        terminology: [
          {
            term: 'चुंबकीय द्विध्रुव आघूर्ण (m)',
            definition: 'चुंबक की ध्रुव शक्ति और चुंबकीय लंबाई के गुणनफल को दर्शाने वाली सदिश राशि।',
          },
        ],
      },
      {
        id: 'earth-magnetism-note',
        name: 'पृथ्वी का चुंबकीय क्षेत्र (सैद्धांतिक)',
        description:
          'पृथ्वी स्वयं एक विशाल चुंबकीय द्विध्रुव की तरह व्यवहार करती है, जिसकी चुंबकीय धुरी भौगोलिक धुरी से लगभग 11.3° झुकी होती है।',
        relationships: 'भौगोलिक उत्तर के निकट पृथ्वी का चुंबकीय दक्षिणी ध्रुव स्थित होता है।',
        variables: [{ symbol: 'B_E', meaning: 'पृथ्वी की सतह पर चुंबकीय क्षेत्र (~30–60 μT)', unit: 'μT' }],
        terminology: [
          {
            term: 'चुंबकीय याम्योत्तर (Magnetic Meridian)',
            definition: 'किसी स्थान पर चुंबकीय उत्तर और दक्षिण ध्रुवों से गुजरने वाला ऊर्ध्वाधर तल।',
          },
        ],
      },
    ],
    diagrams: [
      {
        title: 'छड़ चुंबक की चुंबकीय क्षेत्र रेखाएँ',
        description: 'N ध्रुव से S ध्रुव की ओर दिशा तीरों के साथ सममित बंद चुंबकीय वक्र।',
        components: ['उत्तरी ध्रुव (N)', 'दक्षिणी ध्रुव (S)', 'बंद क्षेत्र लूप', 'दिक्सूचक सुई'],
      },
    ],
  },
};

export function getBuiltInMagnetismModule(language: LanguageCode): TextbookAnalysisResult {
  const localized = TRANSLATIONS_BUNDLE[language] ?? TRANSLATIONS_BUNDLE.en;
  const en = TRANSLATIONS_BUNDLE.en;

  const dipoleEq = {
    name:
      language === 'kn'
        ? 'ದ್ವಿಧ್ರುವಿ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ'
        : language === 'hi'
        ? 'चुंबकीय द्विध्रुव क्षेत्र'
        : 'Magnetic Dipole Field',
    formula: 'B = (μ₀ / 4π) · [3(m·r̂)r̂ − m] / r³',
    variables:
      language === 'kn'
        ? 'B: ಕಾಂತೀಯ ಕ್ಷೇತ್ರ, m: ದ್ವಿಧ್ರುವಿ ಭ್ರಾಮಕ, r: ದೂರ'
        : language === 'hi'
        ? 'B: चुंबकीय क्षेत्र, m: द्विध्रुव आघूर्ण, r: दूरी'
        : 'B: magnetic flux density, m: dipole moment, r: radial distance',
    units: 'B in T (Tesla), m in A·m², r in m',
  };

  const torqueEq = {
    name:
      language === 'kn'
        ? 'ದಿಕ್ಸೂಚಿಯ ಮೇಲಿನ ತಿರುಗುಬಲ (Torque)'
        : language === 'hi'
        ? 'चुंबक पर बलाघूर्ण (Torque)'
        : 'Torque on a Compass Dipole',
    formula: 'τ = m · B · sin(θ)',
    variables:
      language === 'kn'
        ? 'τ: ತಿರುಗುಬಲ, m: ದ್ವಿಧ್ರುವಿ ಭ್ರಾಮಕ, θ: m ಮತ್ತು B ನಡುವಿನ ಕೋನ'
        : language === 'hi'
        ? 'τ: बलाघूर्ण, m: द्विध्रुव आघूर्ण, θ: m और B के बीच का कोण'
        : 'τ: restoring torque, m: needle dipole moment, θ: angle between m and B',
    units: 'τ in N·m, B in T, θ in rad',
  };

  return {
    is_physics_content: true,
    subject: 'Physics',
    class_level: 'NCERT Class 10 / Class 12',
    chapter: localized.chapter,
    main_topic: localized.main_topic,
    summary: localized.summary,
    concepts: [
      {
        id: 'bar-magnet-field-lines',
        name: localized.concepts[0].name,
        description: localized.concepts[0].description,
        equations: [dipoleEq],
        variables: localized.concepts[0].variables,
        relationships: localized.concepts[0].relationships,
        terminology: localized.concepts[0].terminology,
        diagram_detected: true,
        simulation_id: 'bar_magnet',
        simulation_supported: true,
        confidence: 'high',
      },
      {
        id: 'compass-deflection',
        name: localized.concepts[1].name,
        description: localized.concepts[1].description,
        equations: [torqueEq],
        variables: localized.concepts[1].variables,
        relationships: localized.concepts[1].relationships,
        terminology: localized.concepts[1].terminology,
        diagram_detected: true,
        simulation_id: 'bar_magnet',
        simulation_supported: true,
        confidence: 'high',
      },
      {
        id: 'earth-magnetism-note',
        name: localized.concepts[2].name,
        description: localized.concepts[2].description,
        equations: [],
        variables: localized.concepts[2].variables,
        relationships: localized.concepts[2].relationships,
        terminology: localized.concepts[2].terminology,
        diagram_detected: false,
        simulation_id: 'magnetic_field',
        simulation_supported: false,
        simulation_reason:
          language === 'kn'
            ? 'ಈ ವಿಭಾಗವು ಭೂಕಾಂತೀಯತೆಯ ಸೈದ್ಧಾಂತಿಕ ವಿವರಣೆಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.'
            : language === 'hi'
            ? 'यह अवधारणा भू-चुंबकत्व के सैद्धांतिक परिचय के रूप में दी गई है।'
            : 'Conceptual background topic; use the Bar Magnet concepts above to launch the interactive 2D & 3D dipole simulation.',
        confidence: 'high',
      },
    ],
    equations: [dipoleEq, torqueEq],
    terminology: [...localized.concepts[0].terminology, ...localized.concepts[1].terminology],
    detected_diagrams: [
      {
        title: localized.diagrams[0].title,
        description: localized.diagrams[0].description,
        components: localized.diagrams[0].components,
        interpretable: true,
      },
    ],
    extracted_text: `${en.chapter}\n${en.main_topic}\n${en.summary}`,
    uncertain_content: [],
    overall_confidence: 'high',
    translations: TRANSLATIONS_BUNDLE,
    analyzedAt: new Date().toISOString(),
    language,
    source: 'built_in_module',
  };
}
