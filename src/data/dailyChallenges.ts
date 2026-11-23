import type { GradeClassLevel, LanguageCode } from '../types/physics';

export interface DailyPhysicsChallenge {
  id: string;
  classes: GradeClassLevel[];
  experimentId: string;
  topicLabel: Record<LanguageCode, string>;
  question: Record<LanguageCode, string>;
  options: Record<LanguageCode, [string, string, string]>;
  correctIndex: 0 | 1 | 2;
  explanation: Record<LanguageCode, string>;
}

export interface StoredDailyChallengeAttempt {
  dateIso: string;
  challengeId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export const DAILY_PHYSICS_CHALLENGES: DailyPhysicsChallenge[] = [
  {
    id: 'convex_lens_convergence',
    classes: [7, 8, 10],
    experimentId: 'c10_convex_lens_image',
    topicLabel: {
      en: 'Light & Lenses',
      kn: 'ಬೆಳಕು ಮತ್ತು ಮಸೂರಗಳು',
      hi: 'प्रकाश और लेंस',
    },
    question: {
      en: 'What happens when parallel rays of light pass through a convex lens?',
      kn: 'ಸಮಾನಾಂತರ ಬೆಳಕಿನ ಕಿರಣಗಳು ಪೀನ ಮಸೂರದ (Convex lens) ಮೂಲಕ ಹಾದುಹೋದಾಗ ಏನಾಗುತ್ತದೆ?',
      hi: 'जब प्रकाश की समानांतर किरणें उत्तल लेंस से गुजरती हैं तो क्या होता है?',
    },
    options: {
      en: [
        'They converge at the principal focus',
        'They spread outward without meeting',
        'They reflect straight back toward the source',
      ],
      kn: [
        'ಅವು ಪ್ರಧಾನ ನಾಭಿಯಲ್ಲಿ (Focus) ಒಗ್ಗೂಡುತ್ತವೆ',
        'ಅವು ಸೇರದೆ ಹೊರಕ್ಕೆ ಹರಡುತ್ತವೆ',
        'ಅವು ಮೂಲದ ಕಡೆಗೆ ನೇರವಾಗಿ ಪ್ರತಿಫಲಿಸುತ್ತವೆ',
      ],
      hi: [
        'वे मुख्य फोकस पर अभिसरित (एकत्र) होती हैं',
        'वे मिले बिना बाहर की ओर फैल जाती हैं',
        'वे स्रोत की ओर सीधी वापस परावर्तित होती हैं',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'A convex lens is thicker at the middle, so it bends parallel light rays inward to meet at the principal focus F.',
      kn: 'ಪೀನ ಮಸೂರವು ಮಧ್ಯದಲ್ಲಿ ದಪ್ಪವಾಗಿರುವುದರಿಂದ ಸಮಾನಾಂತರ ಕಿರಣಗಳನ್ನು ಒಳಮುಖವಾಗಿ ಬಗ್ಗಿಸಿ ಪ್ರಧಾನ ನಾಭಿ F ನಲ್ಲಿ ಒಗ್ಗೂಡಿಸುತ್ತದೆ.',
      hi: 'उत्तल लेंस बीच में मोटा होता है, इसलिए यह समानांतर किरणों को अंदर की ओर मोड़कर मुख्य फोकस F पर केंद्रित करता है।',
    },
  },
  {
    id: 'concave_mirror_distance',
    classes: [7, 8, 10],
    experimentId: 'c8_mirrors_and_lenses',
    topicLabel: {
      en: 'Mirrors & Reflection',
      kn: 'ದರ್ಪಣಗಳು ಮತ್ತು ಪ್ರತಿಫಲನ',
      hi: 'दर्पण और परावर्तन',
    },
    question: {
      en: 'What happens when an object moves closer to a concave mirror inside its focal point?',
      kn: 'ಒಂದು ವಸ್ತುವು ನಿಮ್ನ ದರ್ಪಣದ ನಾಭಿಯ ಒಳಗೆ ಹತ್ತಿರ ಬಂದಾಗ ಪ್ರತಿಬಿಂಬವು ಹೇಗೆ ಕಾಣುತ್ತದೆ?',
      hi: 'जब कोई वस्तु अवतल दर्पण के फोकस के भीतर बहुत पास आती है, तो प्रतिबिंब कैसा बनता है?',
    },
    options: {
      en: [
        'The image becomes virtual, upright, and magnified',
        'No reflection occurs at the mirror surface',
        'The image shrinks to a single inverted dot',
      ],
      kn: [
        'ಪ್ರತಿಬಿಂಬವು ಮಿಥ್ಯ, ನೇರ ಮತ್ತು ದೊಡ್ಡದಾಗಿ ಕಾಣುತ್ತದೆ',
        'ದರ್ಪಣದ ಮೇಲೆ ಯಾವುದೇ ಪ್ರತಿಫಲನ ಆಗುವುದಿಲ್ಲ',
        'ಪ್ರತಿಬಿಂಬವು ತಲೆಕೆಳಗಾದ ಸಣ್ಣ ಬಿಂದುವಾಗುತ್ತದೆ',
      ],
      hi: [
        'प्रतिबिंब आभासी, सीधा और बड़ा (आवर्धित) बनता है',
        'दर्पण की सतह पर कोई परावर्तन नहीं होता',
        'प्रतिबिंब उल्टे छोटे बिंदु में सिमट जाता है',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'When an object sits between the pole P and focus F of a concave mirror, reflected rays appear to diverge from a larger upright virtual image behind the mirror.',
      kn: 'ವಸ್ತುವು ಧ್ರುವ P ಮತ್ತು ನಾಭಿ F ನಡುವೆ ಇದ್ದಾಗ, ದರ್ಪಣದ ಹಿಂದೆ ನೇರ ಮತ್ತು ದೊಡ್ಡದಾದ ಮಿಥ್ಯ ಪ್ರತಿಬಿಂಬವು ರೂಪುಗೊಳ್ಳುತ್ತದೆ.',
      hi: 'जब वस्तु ध्रुव P और फोकस F के बीच होती है, तो दर्पण के पीछे सीधा और बड़ा आभासी प्रतिबिंब बनता है (जैसे शेविंग/डेंटिस्ट दर्पण)।',
    },
  },
  {
    id: 'simple_circuit_completion',
    classes: [6, 7, 8, 10],
    experimentId: 'c7_simple_circuit_conductors',
    topicLabel: {
      en: 'Electric Circuits',
      kn: 'ವಿದ್ಯುತ್ ಸರ್ಕ್ಯೂಟ್',
      hi: 'विद्युत परिपथ',
    },
    question: {
      en: 'In a simple circuit with a cell and bulb, what is needed to complete the circuit and light the bulb?',
      kn: 'ಬ್ಯಾಟರಿ ಮತ್ತು ಬಲ್ಬ್ ಇರುವ ಸರಳ ಸರ್ಕ್ಯೂಟ್‌ನಲ್ಲಿ ಬಲ್ಬ್ ಬೆಳಗಲು ಏನು ಅಗತ್ಯವಿದೆ?',
      hi: 'सेल और बल्ब वाले सरल परिपथ में बल्ब जलाने के लिए परिपथ को पूरा करने हेतु क्या आवश्यक है?',
    },
    options: {
      en: [
        'A closed conducting path connecting both terminals with the switch closed',
        'Leaving the switch open so air carries the charge',
        'Connecting plastic tape between the battery and bulb',
      ],
      kn: [
        'ಸ್ವಿಚ್ ಮುಚ್ಚಿ ಎರಡೂ ತುದಿಗಳನ್ನು ಜೋಡಿಸುವ ನಿರಂತರ ವಾಹಕ ಮಾರ್ಗ',
        'ಗಾಳಿಯ ಮೂಲಕ ವಿದ್ಯುತ್ ಹರಿಯಲು ಸ್ವಿಚ್ ತೆರೆದಿಡುವುದು',
        'ಬ್ಯಾಟರಿ ಮತ್ತು ಬಲ್ಬ್ ನಡುವೆ ಪ್ಲಾಸ್ಟಿಕ್ ಟೇಪ್ ಜೋಡಿಸುವುದು',
      ],
      hi: [
        'स्विच बंद करके दोनों टर्मिनलों को जोड़ने वाला एक बंद चालक पथ',
        'स्विच को खुला छोड़ना ताकि हवा से आवेश बहे',
        'बैटरी और बल्ब के बीच प्लास्टिक टेप जोड़ना',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'Electric current flows only in an unbroken closed loop of conductors (such as copper wires) when the switch is closed.',
      kn: 'ಸ್ವಿಚ್ ಮುಚ್ಚಿದಾಗ ತಾಮ್ರದ ತಂತಿಯಂತಹ ವಾಹಕಗಳ ಮುಚ್ಚಿದ ವೃತ್ತಾಕಾರದ ಮಾರ್ಗದಲ್ಲಿ ಮಾತ್ರ ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಹರಿಯುತ್ತದೆ.',
      hi: 'विद्युत धारा केवल तभी बहती है जब स्विच बंद हो और तांबे जैसे सुचालकों का एक अटूट बंद लूप बने।',
    },
  },
  {
    id: 'bar_magnet_poles',
    classes: [6, 8, 10],
    experimentId: 'c6_bar_magnet_poles',
    topicLabel: {
      en: 'Exploring Magnets',
      kn: 'ಅಯಸ್ಕಾಂತಗಳ ಅನ್ವೇಷಣೆ',
      hi: 'चुंबकों की खोज',
    },
    question: {
      en: 'What happens when the North pole of one bar magnet approaches the North pole of another magnet?',
      kn: 'ಒಂದು ದಂಡ ಅಯಸ್ಕಾಂತದ ಉತ್ತರ ಧ್ರುವವನ್ನು ಇನ್ನೊಂದು ಅಯಸ್ಕಾಂತದ ಉತ್ತರ ಧ್ರುವದ ಹತ್ತಿರ ತಂದಾಗ ಏನಾಗುತ್ತದೆ?',
      hi: 'जब एक छड़ चुंबक के उत्तरी ध्रुव को दूसरे चुंबक के उत्तरी ध्रुव के पास लाया जाता है, तो क्या होता है?',
    },
    options: {
      en: [
        'They repel (push away from) each other',
        'They attract and snap tightly together',
        'Both magnets immediately lose all magnetism',
      ],
      kn: [
        'ಅವು ಪರಸ್ಪರ ವಿಕರ್ಷಿಸುತ್ತವೆ (ದೂರ ತಳ್ಳುತ್ತವೆ)',
        'ಅವು ಆಕರ್ಷಿಸಿ ಗಟ್ಟಿಯಾಗಿ ಅಂಟಿಕೊಳ್ಳುತ್ತವೆ',
        'ಎರಡೂ ಅಯಸ್ಕಾಂತಗಳು ಕಾಂತತ್ವವನ್ನು ಕಳೆದುಕೊಳ್ಳುತ್ತವೆ',
      ],
      hi: [
        'वे एक-दूसरे को प्रतिकर्षित (दूर धकेलते) हैं',
        'वे एक-दूसरे को आकर्षित करके चिपक जाते हैं',
        'दोनों चुंबक तुरंत अपना चुंबकत्व खो देते हैं',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'Like magnetic poles (North–North or South–South) always repel each other, while unlike poles (North–South) attract.',
      kn: 'ಸಜಾತೀಯ ಧ್ರುವಗಳು (ಉತ್ತರ–ಉತ್ತರ ಅಥವಾ ದಕ್ಷಿಣ–ದಕ್ಷಿಣ) ಯಾವಾಗಲೂ ವಿಕರ್ಷಿಸುತ್ತವೆ; ವಿಜಾತೀಯ ಧ್ರುವಗಳು ಆಕರ್ಷಿಸುತ್ತವೆ.',
      hi: 'समान चुंबकीय ध्रुव (उत्तरी–उत्तरी या दक्षिणी–दक्षिणी) हमेशा एक-दूसरे को प्रतिकर्षित करते हैं, जबकि असमान ध्रुव आकर्षित करते हैं।',
    },
  },
  {
    id: 'temperature_heat_conduction',
    classes: [6, 7],
    experimentId: 'c7_heat_transfer_modes',
    topicLabel: {
      en: 'Heat Transfer',
      kn: 'ಶಾಖ ವರ್ಗಾವಣೆ',
      hi: 'ऊष्मा स्थानांतरण',
    },
    question: {
      en: 'Why does a metal spoon left in hot soup feel warm at the handle after a minute?',
      kn: 'ಬಿಸಿ ಸೂಪ್‌ನಲ್ಲಿ ಇಟ್ಟ ಲೋಹದ ಚಮಚದ ಹಿಡಿಕೆ ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಏಕೆ ಬೆಚ್ಚಗಾಗುತ್ತದೆ?',
      hi: 'गर्म सूप में रखी धातु की चम्मच का हैंडल एक मिनट बाद गर्म क्यों लगने लगता है?',
    },
    options: {
      en: [
        'Thermal energy travels through the metal by conduction',
        'Cold soup rises into the handle by magnetism',
        'Metal creates new energy without touching heat',
      ],
      kn: [
        'ಲೋಹದ ಮೂಲಕ ವಹನ (Conduction) ಕ್ರಿಯೆಯಿಂದ ಶಾಖ ಹರಿಯುತ್ತದೆ',
        'ತಣ್ಣನೆಯ ಸೂಪ್ ಕಾಂತತ್ವದಿಂದ ಮೇಲಕ್ಕೆ ಬರುತ್ತದೆ',
        'ಲೋಹವು ಶಾಖವಿಲ್ಲದೆ ತಾನಾಗಿಯೇ ಶಕ್ತಿ ಸೃಷ್ಟಿಸುತ್ತದೆ',
      ],
      hi: [
        'ऊष्मा चालन (Conduction) द्वारा धातु के कणों से होकर हैंडल तक पहुँचती है',
        'ठंडा सूप चुंबकत्व से ऊपर चढ़ता है',
        'धातु बिना ऊष्मा के स्वयं नई ऊर्जा बनाती है',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'Metals are good conductors of heat; vibrating particles transfer thermal energy from the hot end to the cooler handle via conduction.',
      kn: 'ಲೋಹಗಳು ಉತ್ತಮ ಶಾಖ ವಾಹಕಗಳಾಗಿವೆ; ಬಿಸಿ ತುದಿಯಿಂದ ತಂಪಾದ ಹಿಡಿಕೆಗೆ ಕಣಗಳ ಕಂಪನದಿಂದ ಶಾಖ ವಹನವಾಗುತ್ತದೆ.',
      hi: 'धातुएँ ऊष्मा की सुचालक होती हैं; चालन द्वारा ऊष्मा गर्म सिरे से ठंडे सिरे (हैंडल) की ओर प्रवाहित होती है।',
    },
  },
  {
    id: 'archimedes_buoyancy_motion',
    classes: [8, 9],
    experimentId: 'c9_archimedes_buoyancy',
    topicLabel: {
      en: 'Buoyancy & Upthrust',
      kn: 'ತೇಲುವಿಕೆ ಮತ್ತು ಮೇಲ್ಮುಖ ಒತ್ತಡ',
      hi: 'उत्प्लावन बल',
    },
    question: {
      en: 'Why does an object feel lighter when submerged inside water?',
      kn: 'ಒಂದು ವಸ್ತುವನ್ನು ನೀರಿನಲ್ಲಿ ಮುಳುಗಿಸಿದಾಗ ಅದು ಏಕೆ ಹಗುರವಾಗಿ ಅನುಭವವಾಗುತ್ತದೆ?',
      hi: 'जब किसी वस्तु को पानी में डुबोया जाता है तो वह हल्की क्यों लगती है?',
    },
    options: {
      en: [
        'Water exerts an upward buoyant force equal to the weight of displaced water',
        'Gravity turns off as soon as an object touches water',
        'The object loses half of its mass underwater',
      ],
      kn: [
        'ಸ್ಥಳಾಂತರಗೊಂಡ ನೀರಿನ ತೂಕಕ್ಕೆ ಸಮನಾದ ಮೇಲ್ಮುಖ ಪ್ಲವನ ಬಲವು (Buoyancy) ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
        'ನೀರನ್ನು ಮುಟ್ಟಿದ ತಕ್ಷಣ ಗುರುತ್ವಾಕರ್ಷಣೆ ನಿಲ್ಲುತ್ತದೆ',
        'ನೀರಿನ ಒಳಗೆ ವಸ್ತುವಿನ ದ್ರವ್ಯರಾಶಿ ಅರ್ಧವಾಗುತ್ತದೆ',
      ],
      hi: [
        'पानी हटाए गए पानी के भार के बराबर ऊपर की ओर उत्प्लावन बल लगाता है',
        'पानी को छूते ही गुरुत्वाकर्षण समाप्त हो जाता है',
        'पानी के अंदर वस्तु का द्रव्यमान आधा हो जाता है',
      ],
    },
    correctIndex: 0,
    explanation: {
      en: 'By Archimedes’ principle, the fluid pushes upward with buoyant force F_b = ρVg, reducing the apparent weight while mass remains unchanged.',
      kn: 'ಆರ್ಕಿಮಿಡೀಸ್ ತತ್ವದ ಪ್ರಕಾರ, ದ್ರವವು F_b = ρVg ಪ್ಲವನ ಬಲವನ್ನು ಮೇಲಕ್ಕೆ ನೀಡುವುದರಿಂದ ವಸ್ತುವಿನ ತೂಕ ಕಡಿಮೆಯಾದಂತೆ ತೋರುತ್ತದೆ.',
      hi: 'आर्किमिडीज के सिद्धांत के अनुसार, द्रव F_b = ρVg के बराबर ऊपर की ओर उत्प्लावन बल लगाता है, जिससे आभासी भार कम महसूस होता है।',
    },
  },
];

export function getTodayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayOfYearIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function getDailyChallengeForClass(
  classLevel: GradeClassLevel,
  practiceOffset = 0
): { challenge: DailyPhysicsChallenge; totalPoolCount: number } {
  const classMatches = DAILY_PHYSICS_CHALLENGES.filter((c) =>
    c.classes.includes(classLevel)
  );
  const pool = classMatches.length > 0 ? classMatches : DAILY_PHYSICS_CHALLENGES;
  const idx = (getDayOfYearIndex() + Math.max(0, practiceOffset)) % pool.length;
  return {
    challenge: pool[idx],
    totalPoolCount: pool.length,
  };
}

const DAILY_CHALLENGE_STORAGE_PREFIX = 'physix_daily_challenge_v1_';

export function loadTodayChallengeAttempt(
  accountId?: string | null
): StoredDailyChallengeAttempt | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const key = `${DAILY_CHALLENGE_STORAGE_PREFIX}${accountId && accountId.trim() ? accountId.trim() : 'guest'}`;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDailyChallengeAttempt>;
    if (
      parsed.dateIso === getTodayIsoLocal() &&
      typeof parsed.challengeId === 'string' &&
      typeof parsed.selectedIndex === 'number' &&
      typeof parsed.isCorrect === 'boolean'
    ) {
      return parsed as StoredDailyChallengeAttempt;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveTodayChallengeAttempt(
  accountId: string | null | undefined,
  attempt: StoredDailyChallengeAttempt
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const key = `${DAILY_CHALLENGE_STORAGE_PREFIX}${accountId && accountId.trim() ? accountId.trim() : 'guest'}`;
  try {
    window.localStorage.setItem(key, JSON.stringify(attempt));
  } catch {
    // Ignore storage quota errors
  }
}
