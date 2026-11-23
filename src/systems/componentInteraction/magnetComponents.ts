import type { LanguageCode } from '../../types/physics';
import type {
  ComponentExplanationContent,
  RegisteredSimulationComponent,
} from './types';

function readMagnetState(state: Record<string, unknown>) {
  const angle =
    typeof state.magnetAngleDeg === 'number' ? Math.round(state.magnetAngleDeg) : 0;
  const pitch =
    typeof state.magnetPitchDeg === 'number' ? Math.round(state.magnetPitchDeg) : 0;
  const strength =
    typeof state.strength === 'number' ? state.strength.toFixed(1) : '1.2';
  const telemetry = (state.telemetry || {}) as {
    magnitudeMt?: number;
    angleDeg?: number;
    relX?: number;
    relY?: number;
  };
  const magMt =
    typeof telemetry.magnitudeMt === 'number'
      ? telemetry.magnitudeMt.toFixed(2)
      : '1.45';
  const fieldAngle =
    typeof telemetry.angleDeg === 'number' ? Math.round(telemetry.angleDeg) : 38;
  return { angle, pitch, strength, magMt, fieldAngle };
}

export const MAGNET_SIMULATION_COMPONENTS: RegisteredSimulationComponent[] = [
  {
    id: 'magnet_body',
    simulationId: 'bar_magnet',
    iconKey: 'magnet',
    displayName: {
      en: 'Bar Magnet',
      kn: 'ದಂಡ ಅಯಸ್ಕಾಂತ',
      hi: 'छड़ चुंबक',
    },
    identificationText: {
      en: 'Permanent ferromagnetic dipole body',
      kn: 'ಶಾಶ್ವತ ಕಾಂತೀಯ ದ್ವಿಧ್ರುವಿ ಕಾಯ',
      hi: 'स्थायी लौहचुंबकीय द्विध्रुव मुख्य भाग',
    },
    hitRegion: {
      kind: 'canvas_custom',
      description: 'Central ferromagnetic bar body between North and South poles',
    },
    highlight: {
      strokeColor: '#6F4E37',
      glowColor: 'rgba(111, 78, 55, 0.28)',
      strokeWidth: 3.5,
      emissiveHex: 0x6f4e37,
      emissiveIntensity: 0.48,
    },
    explanationContext:
      'Bar magnet main body: ferromagnetic alloy (Alnico/Neodymium/steel), internal aligned magnetic domains, permanent magnetic dipole moment m, inseparable poles.',
    describeCurrentState: (lang, state) => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return `ಪ್ರಸ್ತುತ ಕೋನ: ${s.angle}° · ಕಾಂತೀಯ ಶಕ್ತಿ: ${s.strength}×`;
      }
      if (lang === 'hi') {
        return `वर्तमान घूर्णन: ${s.angle}° · चुंबकीय शक्ति: ${s.strength}×`;
      }
      return `Orientation: ${s.angle}° · Dipole strength: ${s.strength}×`;
    },
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return {
          name: 'ದಂಡ ಅಯಸ್ಕಾಂತ (ಕಾಯ)',
          definition:
            'ದಂಡ ಅಯಸ್ಕಾಂತವು ತನ್ನ ಸುತ್ತಲೂ ನಿರಂತರ ಕಾಂತೀಯ ಕ್ಷೇತ್ರವನ್ನು ಉತ್ಪಾದಿಸುವ ಶಾಶ್ವತ ಕಾಂತೀಯ ದ್ವಿಧ್ರುವಿಯಾಗಿದೆ.',
          characteristics:
            'ಇದು ಕಬ್ಬಿಣ, ನಿಕೆಲ್, ಕೋಬಾಲ್ಟ್ ಅಥವಾ ಆಲ್ನಿಕೊದಂತಹ ಫೆರೋಮ್ಯಾಗ್ನೆಟಿಕ್ ವಸ್ತುಗಳಿಂದ ಮಾಡಲ್ಪಟ್ಟಿದೆ. ಇದರೊಳಗಿನ ಸೂಕ್ಷ್ಮ ಕಾಂತೀಯ ಡೊಮೇನ್‌ಗಳು ಒಂದೇ ದಿಕ್ಕಿನಲ್ಲಿ ಜೋಡಣೆಗೊಂಡಿರುತ್ತವೆ.',
          functionDescription:
            'ಉತ್ತರ (N) ಮತ್ತು ದಕ್ಷಿಣ (S) ಧ್ರುವಗಳನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಂಡು ಬಾಹ್ಯಾಕಾಶದಲ್ಲಿ ಬಾಗಿದ ದ್ವಿಧ್ರುವಿ ಕಾಂತೀಯ ಕ್ಷೇತ್ರವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.',
          scientificProperties:
            'ಒಂದು ದಂಡ ಅಯಸ್ಕಾಂತವನ್ನು ಕತ್ತರಿಸಿದರೂ ಪ್ರತ್ಯೇಕ ಏಕಧ್ರುವ (monopole) ಉಂಟಾಗುವುದಿಲ್ಲ; ಪ್ರತಿ ತುಂಡು ಮತ್ತೊಂದು ಉತ್ತರ ಮತ್ತು ದಕ್ಷಿಣ ಧ್ರುವವನ್ನು ಪಡೆಯುತ್ತದೆ.',
          behaviour: `ಪ್ರಸ್ತುತ ${s.strength}× ಶಕ್ತಿ ಮತ್ತು ${s.angle}° ಕೋನದಲ್ಲಿ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ಸಾಂದ್ರತೆ ಮತ್ತು ದಿಕ್ಕನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.`,
          relationshipWithOthers:
            'ಉತ್ತರ ಧ್ರುವದಿಂದ ಹೊರಡುವ ಮತ್ತು ದಕ್ಷಿಣ ಧ್ರುವಕ್ಕೆ ಪ್ರವೇಶಿಸುವ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಅಯಸ್ಕಾಂತದ ಕಾಯದ ಒಳಭಾಗದಲ್ಲಿ S ನಿಂದ N ಗೆ ಸಾಗಿ ಮುಚ್ಚಿದ ಲೂಪ್ ರಚಿಸುತ್ತವೆ.',
          realWorldExample:
            'ರೀಡ್ ಸ್ವಿಚ್ ಸೆನ್ಸರ್‌ಗಳು, ಸ್ಪೀಕರ್‌ಗಳು ಮತ್ತು ಶಾಲಾ ದಿಕ್ಸೂಚಿ ಮಾಪನಾಂಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಶಾಶ್ವತ ದಂಡ ಅಯಸ್ಕಾಂತಗಳನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.',
          whyItMatters:
            'ಅಯಸ್ಕಾಂತೀಯ ಧ್ರುವಗಳನ್ನು ಎಂದಿಗೂ ಬೇರ್ಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ ಎಂಬ ಮೂಲಭೂತ ನಿಯಮವು ಶಾಶ್ವತ ಅಯಸ್ಕಾಂತ ಮೋಟಾರ್‌ಗಳು, ಡೇಟಾ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಸೆನ್ಸರ್ ವಿನ್ಯಾಸಕ್ಕೆ ಆಧಾರವಾಗಿದೆ.',
          currentStateSummary: `ಪ್ರಸ್ತುತ ಕೋನ ${s.angle}° · ಶಕ್ತಿ ${s.strength}×`,
          source: 'curated',
        };
      }
      if (lang === 'hi') {
        return {
          name: 'छड़ चुंबक (मुख्य कंडक्टर/काय)',
          definition:
            'छड़ चुंबक एक आयताकार स्थायी चुंबक है जो बिना किसी बाहरी विद्युत धारा के अपने चारों ओर एक स्थिर चुंबकीय क्षेत्र उत्पन्न करता है।',
          characteristics:
            'यह लोहे, कोबाल्ट, निकेल या अल्निको जैसे लौहचुंबकीय पदार्थ से बना होता है, जिसके भीतर परमाण्विक चुंबकीय डोमेन एक ही दिशा में संरेखित रहते हैं।',
          functionDescription:
            'यह चुंबकीय द्विध्रुव आघूर्ण (m) प्रदान करता है और पूरे प्रयोग के चारों ओर 3D द्विध्रुवीय चुंबकीय क्षेत्र स्थापित करता है।',
          scientificProperties:
            'चुंबकीय ध्रुव हमेशा जोड़ों में रहते हैं — चुंबक को बीच से काटने पर भी अकेला उत्तरी या दक्षिणी ध्रुव (monopole) प्राप्त नहीं हो सकता।',
          behaviour: `अभी यह ${s.angle}° कोण और ${s.strength}× शक्ति पर सेट है; इसके घूमने या शक्ति बढ़ने पर पूरा क्षेत्र तुरंत बदलता है।`,
          relationshipWithOthers:
            'बाहर की क्षेत्र रेखाएँ इसके अंदर S से N ध्रुव की ओर गुजरकर निरंतर बंद वक्र पूरा करती हैं और दिक्सूचक सुई पर बलाघूर्ण लगाती हैं।',
          realWorldExample:
            'लाउडस्पीकर, रेफ्रिजरेटर डोर सील और प्रयोगशाला में चुंबकीय क्षेत्र मानचित्रण के लिए स्थायी छड़ चुंबक उपयोग किए जाते हैं।',
          whyItMatters:
            'द्विध्रुव की अविभाज्य प्रकृति यह समझाती है कि हर चुंबकीय प्रणाली हमेशा बंद लूप में क्षेत्र क्यों बनाती है — यही सिद्धांत मोटरों और सेंसरों की नींव है।',
          currentStateSummary: `कोण ${s.angle}° · शक्ति ${s.strength}×`,
          source: 'curated',
        };
      }
      return {
        name: 'Bar Magnet (Body)',
        definition:
          'A bar magnet is a permanent rectangular magnetic dipole that maintains a persistent magnetic field without external electric current.',
        characteristics:
          'Made from ferromagnetic alloys such as steel, Alnico, or neodymium, containing microscopic magnetic domains aligned in the same direction.',
        functionDescription:
          'Provides a steady magnetic dipole moment m that generates the surrounding magnetic flux density B(r) throughout the experiment.',
        scientificProperties:
          'Magnetic poles are inseparable: breaking a bar magnet creates two smaller dipoles, each with its own North and South pole (no magnetic monopoles).',
        behaviour: `Currently oriented at ${s.angle}° with relative dipole strength ${s.strength}×, scaling field intensity proportionally with m and inversely with r³.`,
        relationshipWithOthers:
          'Connects the South pole to the North pole internally so magnetic field lines entering S continue inside the body back to N, forming closed loops.',
        realWorldExample:
          'Used in magnetic latches, reed-switch door sensors, loudspeaker assemblies, and compass calibration setups.',
        whyItMatters:
          'Understanding permanent magnetic domains explains how energy-efficient motors, speakers, and non-contact door sensors work reliably without batteries.',
        currentStateSummary: `Orientation: ${s.angle}° · Strength: ${s.strength}×`,
        source: 'curated',
      };
    },
  },
  {
    id: 'north_pole',
    simulationId: 'bar_magnet',
    iconKey: 'north_pole',
    displayName: {
      en: 'North Pole (N)',
      kn: 'ಉತ್ತರ ಧ್ರುವ (N)',
      hi: 'उत्तरी ध्रुव (N)',
    },
    identificationText: {
      en: 'Field lines emerge outward from North',
      kn: 'ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಹೊರಹೊಮ್ಮುವ ಧ್ರುವ',
      hi: 'यहाँ से चुंबकीय क्षेत्र रेखाएँ बाहर निकलती हैं',
    },
    hitRegion: {
      kind: 'canvas_custom',
      description: 'Red North pole end of the bar magnet',
    },
    highlight: {
      strokeColor: '#F59E0B',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      strokeWidth: 3.5,
      emissiveHex: 0xd97706,
      emissiveIntensity: 0.55,
    },
    explanationContext:
      'North magnetic pole (red end): source of external magnetic field lines, repels another North pole, attracts South pole, highest local flux density near pole corners.',
    describeCurrentState: (lang, state) => {
      const s = readMagnetState(state);
      if (lang === 'kn') return `ಉತ್ತರ ಧ್ರುವ ದಿಕ್ಕು: ${s.angle}° · ಶಕ್ತಿ: ${s.strength}×`;
      if (lang === 'hi') return `उत्तरी ध्रुव दिशा: ${s.angle}° · शक्ति: ${s.strength}×`;
      return `Pointing at ${s.angle}° · Strength ${s.strength}×`;
    },
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return {
          name: 'ಉತ್ತರ ಧ್ರುವ (N)',
          definition:
            'ಮುಕ್ತವಾಗಿ ತೂಗುಹಾಕಿದಾಗ ಭೂಮಿಯ ಭೌಗೋಳಿಕ ಉತ್ತರ ದಿಕ್ಕಿನತ್ತ ಮುಖ ಮಾಡುವ ಅಯಸ್ಕಾಂತದ ತುದಿಯನ್ನು ಉತ್ತರ ಧ್ರುವ ಎನ್ನುತ್ತಾರೆ.',
          characteristics:
            'ಪ್ರಯೋಗದಲ್ಲಿ ಕೆಂಪು ಬಣ್ಣದಿಂದ ಗುರುತಿಸಲ್ಪಟ್ಟಿದ್ದು, ಧ್ರುವದ ಅಂಚುಗಳ ಬಳಿ ಕಾಂತೀಯ ಬಲ ರೇಖೆಗಳು ಅತಿ ದಟ್ಟವಾಗಿರುತ್ತವೆ.',
          functionDescription:
            'ಅಯಸ್ಕಾಂತದ ಹೊರಭಾಗದಲ್ಲಿ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಹೊರಹೊಮ್ಮುವ (emerge) ಧ್ರುವವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
          scientificProperties:
            'ಇದರ ಧ್ರುವ ಬಲ (+m) ದಕ್ಷಿಣ ಧ್ರುವದ ಧ್ರುವ ಬಲಕ್ಕೆ (−m) ಸಮಾನವಾಗಿರುತ್ತದೆ.',
          behaviour: `ಪ್ರಸ್ತುತ ${s.angle}° ದಿಕ್ಕಿನಲ್ಲಿ ತಿರುಗಿದ್ದು, ಸಮೀಪದ ಇನ್ನೊಂದು ಉತ್ತರ ಧ್ರುವವನ್ನು ವಿಕರ್ಷಿಸುತ್ತದೆ ಮತ್ತು ದಿಕ್ಸೂಚಿಯ ಕೆಂಪು ತುದಿಯನ್ನು ದೂರ ತಳ್ಳುತ್ತದೆ.`,
          relationshipWithOthers:
            'ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಮತ್ತು ದಿಕ್ಕಿನ ಬಾಣಗಳು ಇಲ್ಲಿಂದ ಹೊರಬಂದು ದಕ್ಷಿಣ ಧ್ರುವದ ಕಡೆಗೆ ಸಾಗುತ್ತವೆ; ದಿಕ್ಸೂಚಿ ಸೂಜಿಯ ದಕ್ಷಿಣ ತುದಿ ಇದರತ್ತ ತಿರುಗುತ್ತದೆ.',
          realWorldExample:
            'ಭೂಮಿಯ ದಕ್ಷಿಣ ಕಾಂತೀಯ ಧ್ರುವದ ಕಡೆಗೆ ಆಕರ್ಷಿತವಾಗುವ ನಾವಿಕರ ದಿಕ್ಸೂಚಿಯ ಉತ್ತರ ತುದಿ ದಿಕ್ಕು ತೋರಿಸಲು ಬಳಕೆಯಾಗುತ್ತದೆ.',
          whyItMatters:
            'ಕಾಂತೀಯ ಕ್ಷೇತ್ರವು ಎಲ್ಲಿಂದ ಹೊರಹೊಮ್ಮುತ್ತದೆ ಮತ್ತು ಸಮಾನ ಧ್ರುವಗಳು ಹೇಗೆ ಪರಸ್ಪರ ವಿಕರ್ಷಿಸುತ್ತವೆ ಎಂಬುದನ್ನು ತಿಳಿಯುವುದರಿಂದ ಎಲೆಕ್ಟ್ರಿಕ್ ಮೋಟಾರ್‌ಗಳು ಮತ್ತು ಮ್ಯಾಗ್ಲೆವ್ ತಂತ್ರಜ್ಞಾನ ಅರ್ಥವಾಗುತ್ತದೆ.',
          currentStateSummary: `ದಿಕ್ಕು: ${s.angle}° · ಶಕ್ತಿ: ${s.strength}×`,
          source: 'curated',
        };
      }
      if (lang === 'hi') {
        return {
          name: 'उत्तरी ध्रुव (N)',
          definition:
            'स्वतंत्र रूप से लटकाने पर चुंबक का जो सिरा पृथ्वी के भौगोलिक उत्तर की ओर संकेत करता है, वह उत्तरी ध्रुव (N) कहलाता है।',
          characteristics:
            'लाल रंग में चिह्नित इस सिरे के किनारों पर चुंबकीय क्षेत्र रेखाएँ सबसे अधिक सघन होती हैं।',
          functionDescription:
            'चुंबक के बाहर यह वह स्रोत बिंदु है जहाँ से चुंबकीय क्षेत्र रेखाएँ चारों ओर बाहर निकलती हैं।',
          scientificProperties:
            'समान ध्रुव एक-दूसरे को प्रतिकर्षित करते हैं (N–N प्रतिकर्षण) और विपरीत ध्रुव आकर्षित करते हैं (N–S आकर्षण)।',
          behaviour: `वर्तमान ${s.angle}° अभिविन्यास पर क्षेत्र रेखाएँ इसी सिरे से बाहर निकलकर बाहर की ओर मुड़ती हैं; शक्ति ${s.strength}× बढ़ाने पर यहाँ फ्लक्स घनत्व बढ़ता है।`,
          relationshipWithOthers:
            'इससे निकलने वाली क्षेत्र रेखाएँ दक्षिणी ध्रुव में प्रवेश करती हैं और पास रखे दिक्सूचक की लाल (N) नोक को प्रतिकर्षित करती हैं।',
          realWorldExample:
            'विद्युत मोटरों के स्टेटर और रोटर में विपरीत व समान ध्रुवों के आकर्षण-प्रतिकर्षण से ही घूर्णन बल उत्पन्न होता है।',
          whyItMatters:
            'ध्रुवीय प्रतिकर्षण और आकर्षण यह निर्धारित करते हैं कि क्षेत्र किस दिशा में बहेगा — इसी से पंखों से लेकर इलेक्ट्रिक वाहनों तक की मोटरें घूमती हैं।',
          currentStateSummary: `दिशा: ${s.angle}° · शक्ति: ${s.strength}×`,
          source: 'curated',
        };
      }
      return {
        name: 'North Pole (N)',
        definition:
          'The North-seeking pole of the magnet is the end that points toward geographic north when suspended freely in Earth’s magnetic field.',
        characteristics:
          'Color-coded crimson red; magnetic flux lines are tightly concentrated around its face and corners, creating high local field magnitude |B|.',
        functionDescription:
          'Acts as the external source pole from which magnetic field lines emerge into surrounding space.',
        scientificProperties:
          'Equal in magnitude to the South pole. Repels another North pole (like poles repel) and attracts any South pole (unlike poles attract).',
        behaviour: `Oriented at ${s.angle}° with strength ${s.strength}×, pushing the red North tip of any nearby compass needle away along the outgoing field direction.`,
        relationshipWithOthers:
          'Field lines and direction arrows originate here outside the magnet, curve around the bar magnet body, and enter the South pole.',
        realWorldExample:
          'Electric motors arrange alternating North and South magnetic poles to create continuous torque on a current-carrying rotor.',
        whyItMatters:
          'Knowing how poles attract, repel, and launch external field lines helps you predict compass deflection and how electric motors produce torque.',
        currentStateSummary: `Pointing at ${s.angle}° · Strength: ${s.strength}×`,
        source: 'curated',
      };
    },
  },
  {
    id: 'south_pole',
    simulationId: 'bar_magnet',
    iconKey: 'south_pole',
    displayName: {
      en: 'South Pole (S)',
      kn: 'ದಕ್ಷಿಣ ಧ್ರುವ (S)',
      hi: 'दक्षिणी ध्रुव (S)',
    },
    identificationText: {
      en: 'Field lines curve inward into South',
      kn: 'ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಒಳಪ್ರವೇಶಿಸುವ ಧ್ರುವ',
      hi: 'यहाँ चुंबकीय क्षेत्र रेखाएँ अंदर प्रवेश करती हैं',
    },
    hitRegion: {
      kind: 'canvas_custom',
      description: 'Dark slate South pole end of the bar magnet',
    },
    highlight: {
      strokeColor: '#8B5CF6',
      glowColor: 'rgba(139, 92, 246, 0.28)',
      strokeWidth: 3.5,
      emissiveHex: 0x7c3aed,
      emissiveIntensity: 0.55,
    },
    explanationContext:
      'South magnetic pole (dark slate end): sink of external magnetic field lines where loops re-enter the magnet, attracts North poles and compass red tip.',
    describeCurrentState: (lang, state) => {
      const s = readMagnetState(state);
      const sAngle = (s.angle + 180) % 360;
      if (lang === 'kn') return `ದಕ್ಷಿಣ ಧ್ರುವ ದಿಕ್ಕು: ${sAngle}° · ಶಕ್ತಿ: ${s.strength}×`;
      if (lang === 'hi') return `दक्षिणी ध्रुव दिशा: ${sAngle}° · शक्ति: ${s.strength}×`;
      return `Pointing at ${sAngle}° · Strength ${s.strength}×`;
    },
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => {
      const s = readMagnetState(state);
      const sAngle = (s.angle + 180) % 360;
      if (lang === 'kn') {
        return {
          name: 'ದಕ್ಷಿಣ ಧ್ರುವ (S)',
          definition:
            'ಮುಕ್ತವಾಗಿ ತೂಗುಹಾಕಿದಾಗ ಭೂಮಿಯ ಭೌಗೋಳಿಕ ದಕ್ಷಿಣ ದಿಕ್ಕಿನತ್ತ ನಿಲ್ಲುವ ದಂಡ ಅಯಸ್ಕಾಂತದ ತುದಿಯನ್ನು ದಕ್ಷಿಣ ಧ್ರುವ ಎನ್ನುತ್ತಾರೆ.',
          characteristics:
            'ಕಡು ಬೂದು (slate) ಬಣ್ಣದಲ್ಲಿ ತೋರಿಸಲಾಗಿದ್ದು, ಉತ್ತರ ಧ್ರುವಕ್ಕೆ ಸಮಾನವಾದ ಆದರೆ ವಿರುದ್ಧ ಧ್ರುವೀಯತೆಯನ್ನು ಹೊಂದಿದೆ.',
          functionDescription:
            'ಅಯಸ್ಕಾಂತದ ಹೊರಗಿನಿಂದ ಬಾಗಿದ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಮತ್ತೆ ಒಳಪ್ರವೇಶಿಸುವ ಧ್ರುವವಾಗಿದೆ.',
          scientificProperties:
            'ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಇಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುವುದಿಲ್ಲ; ಬದಲಿಗೆ ಅಯಸ್ಕಾಂತದ ಒಳಭಾಗದ ಮೂಲಕ ಉತ್ತರ ಧ್ರುವಕ್ಕೆ ಹಿಂತಿರುಗಿ ಮುಚ್ಚಿದ ಆವರ್ತವನ್ನು ಪೂರ್ಣಗೊಳಿಸುತ್ತವೆ.',
          behaviour: `ಪ್ರಸ್ತುತ ${sAngle}° ದಿಕ್ಕಿನಲ್ಲಿರುವ ಈ ಧ್ರುವವು ದಿಕ್ಸೂಚಿಯ ಕೆಂಪು ಉತ್ತರ ತುದಿಯನ್ನು ತನ್ನ ಕಡೆಗೆ ಆಕರ್ಷಿಸುತ್ತದೆ.`,
          relationshipWithOthers:
            'ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಹೊರಭಾಗದಲ್ಲಿ ಇಲ್ಲಿಗೆ ತಲುಪುತ್ತವೆ ಮತ್ತು ದಿಕ್ಕಿನ ಬಾಣಗಳು ಈ ಧ್ರುವದ ಒಳಕ್ಕೆ ಸೂಚಿಸುತ್ತವೆ.',
          realWorldExample:
            'ಮ್ಯಾಗ್ಲೆವ್ (Maglev) ರೈಲುಗಳಲ್ಲಿ ಧ್ರುವಗಳ ಆಕರ್ಷಣೆ-ವಿಕರ್ಷಣೆ ಬಳಸಿ ರೈಲನ್ನು ಹಳಿಯ ಮೇಲೆ ತೇಲಿಸಿ ಚಲಾಯಿಸಲಾಗುತ್ತದೆ.',
          whyItMatters:
            'ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ದಕ್ಷಿಣ ಧ್ರುವದಲ್ಲಿ ಕೊನೆಗೊಳ್ಳದೆ ಒಳಗೆ ಮುಂದುವರಿಯುತ್ತವೆ ಎಂಬ ಸತ್ಯವು ವಿದ್ಯುತ್ಕಾಂತೀಯ ಪ್ರೇರಣೆ ಮತ್ತು ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ವಿನ್ಯಾಸಕ್ಕೆ ಅತ್ಯಗತ್ಯ.',
          currentStateSummary: `ದಿಕ್ಕು: ${sAngle}° · ಶಕ್ತಿ: ${s.strength}×`,
          source: 'curated',
        };
      }
      if (lang === 'hi') {
        return {
          name: 'दक्षिणी ध्रुव (S)',
          definition:
            'स्वतंत्र रूप से लटकाने पर चुंबक का जो सिरा पृथ्वी के भौगोलिक दक्षिण की ओर संकेत करता है, वह दक्षिणी ध्रुव (S) कहलाता है।',
          characteristics:
            'गहरे स्लेटी रंग में दर्शाया गया है और इसकी चुंबकीय तीव्रता उत्तरी ध्रुव के ठीक बराबर होती है।',
          functionDescription:
            'चुंबक के बाहर यह वह सिरा है जहाँ से मुड़ी हुई चुंबकीय क्षेत्र रेखाएँ भीतर प्रवेश करती हैं।',
          scientificProperties:
            'विपरीत ध्रुव होने के कारण यह किसी भी उत्तरी ध्रुव या दिक्सूचक की लाल (N) नोक को आकर्षित करता है।',
          behaviour: `${sAngle}° पर स्थित यह ध्रुव पास के दिक्सूचक की लाल सुई को अपनी ओर मोड़ देता है (बल दूरी के साथ तेज़ी से घटता है)।`,
          relationshipWithOthers:
            'उत्तर ध्रुव से निकली क्षेत्र रेखाएँ यहाँ आकर अंदर प्रवेश करती हैं और छड़ चुंबक के भीतर से वापस उत्तर ध्रुव तक जाती हैं।',
          realWorldExample:
            'MRI मशीनों और जनरेटर में बंद चुंबकीय परिपथ बनाने के लिए उत्तरी व दक्षिणी ध्रुवों का युग्म आवश्यक होता है।',
          whyItMatters:
            'यह समझना कि क्षेत्र रेखाएँ S ध्रुव में समाप्त नहीं होतीं बल्कि बंद परिपथ बनाती हैं, जनरेटर और ट्रांसफ़ॉर्मर के कार्य को स्पष्ट करता है।',
          currentStateSummary: `दिशा: ${sAngle}° · शक्ति: ${s.strength}×`,
          source: 'curated',
        };
      }
      return {
        name: 'South Pole (S)',
        definition:
          'The South pole of the bar magnet is the end that aligns toward geographic south when allowed to rotate freely.',
        characteristics:
          'Displayed in dark slate opposite the North pole, matching the North pole in magnetic flux magnitude.',
        functionDescription:
          'Serves as the external entry pole where curved magnetic field lines converge back into the magnet body.',
        scientificProperties:
          'Field lines do not terminate at the South pole; they pass internally from South to North to preserve continuous closed flux loops (∇·B = 0).',
        behaviour: `Currently angled at ${sAngle}° with dipole strength ${s.strength}×, attracting the North-seeking red tip of the compass needle inward toward itself.`,
        relationshipWithOthers:
          'Works together with the North pole and magnet body to keep field loops closed and guides incoming direction arrows toward its surface.',
        realWorldExample:
          'In electromagnetic generators and MRI magnets, paired North and South poles guide flux efficiently through a closed magnetic circuit.',
        whyItMatters:
          'Recognizing that magnetic flux closes smoothly into the South pole—never terminating abruptly—is a core principle behind transformers and MRI coils.',
        currentStateSummary: `Pointing at ${sAngle}° · Strength: ${s.strength}×`,
        source: 'curated',
      };
    },
  },
  {
    id: 'field_lines',
    simulationId: 'bar_magnet',
    iconKey: 'field_lines',
    displayName: {
      en: 'Magnetic Field Line',
      kn: 'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆ',
      hi: 'चुंबकीय क्षेत्र रेखा',
    },
    identificationText: {
      en: 'Closed loop mapping magnetic flux',
      kn: 'ಕಾಂತೀಯ ಫ್ಲಕ್ಸ್ ತೋರಿಸುವ ಮುಚ್ಚಿದ ವಕ್ರರೇಖೆ',
      hi: 'चुंबकीय क्षेत्र का बंद वक्र पथ',
    },
    hitRegion: {
      kind: 'canvas_custom',
      description: 'Curved dipole magnetic field lines surrounding the magnet',
    },
    highlight: {
      strokeColor: '#6F4E37',
      glowColor: 'rgba(111, 78, 55, 0.25)',
      strokeWidth: 3.0,
      emissiveHex: 0x6f4e37,
      emissiveIntensity: 0.55,
    },
    explanationContext:
      'Magnetic field lines: continuous closed loops N→S outside and S→N inside, tangent gives B direction, spacing/density indicates |B| magnitude, why two field lines never intersect.',
    describeCurrentState: (lang, state) => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return `ಕ್ಷೇತ್ರ ಸಾಂದ್ರತೆ ಶಕ್ತಿ ${s.strength}× ಗೆ ಅನುಗುಣವಾಗಿದೆ · ಛೇದನವಿಲ್ಲ`;
      }
      if (lang === 'hi') {
        return `रेखा सघनता शक्ति ${s.strength}× के अनुरूप है · कोई प्रतिच्छेदन नहीं`;
      }
      return `Line contrast scaled to ${s.strength}× · Closed non-intersecting loops`;
    },
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return {
          name: 'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು',
          definition:
            'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಅಯಸ್ಕಾಂತದ ಸುತ್ತಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ದಿಕ್ಕು ಮತ್ತು ತೀವ್ರತೆಯನ್ನು ದೃಶ್ಯೀಕರಿಸಲು ಬಳಸುವ ಕಾಲ್ಪನಿಕ ಮುಚ್ಚಿದ ವಕ್ರರೇಖೆಗಳಾಗಿವೆ.',
          characteristics:
            'ಅಯಸ್ಕಾಂತದ ಹೊರಭಾಗದಲ್ಲಿ ಇವು ಉತ್ತರ (N) ನಿಂದ ದಕ್ಷಿಣಕ್ಕೆ (S) ಸಾಗುತ್ತವೆ ಮತ್ತು ಒಳಭಾಗದಲ್ಲಿ S ನಿಂದ N ಗೆ ಹಿಂತಿರುಗುತ್ತವೆ.',
          functionDescription:
            'ಕ್ಷೇತ್ರ ರೇಖೆಗಳ ನಡುವಿನ ಅಂತರವು (ದಟ್ಟತೆ) ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ಶಕ್ತಿ |B| ಅನ್ನು ತೋರಿಸುತ್ತದೆ — ಧ್ರುವಗಳ ಬಳಿ ರೇಖೆಗಳು ಹತ್ತಿರದಲ್ಲಿದ್ದು ಬಲವಾಗಿರುತ್ತವೆ.',
          scientificProperties:
            'ಎರಡು ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಎಂದಿಗೂ ಪರಸ್ಪರ ಛೇದಿಸುವುದಿಲ್ಲ. ಏಕೆಂದರೆ ಅವು ಛೇದಿಸಿದರೆ, ಆ ಬಿಂದುವಿನಲ್ಲಿ ದಿಕ್ಸೂಚಿಯು ಒಂದೇ ಸಮಯದಲ್ಲಿ ಎರಡು ದಿಕ್ಕುಗಳನ್ನು ತೋರಿಸಬೇಕಾಗುತ್ತದೆ, ಅದು ಅಸಾಧ್ಯ.',
          behaviour: `ಪ್ರಸ್ತುತ ${s.strength}× ಶಕ್ತಿಯಲ್ಲಿ ಧ್ರುವಗಳ ಬಳಿ ರೇಖೆಗಳು ದಟ್ಟವಾಗಿವೆ ಮತ್ತು ಅಯಸ್ಕಾಂತವನ್ನು ${s.angle}° ತಿರುಗಿಸಿದಾಗ ಇಡೀ ವಿನ್ಯಾಸವು ಒಟ್ಟಿಗೆ ತಿರುಗುತ್ತದೆ.`,
          relationshipWithOthers:
            'ದಿಕ್ಸೂಚಿ ಸೂಜಿಯು ಯಾವಾಗಲೂ ತಾನು ಇರುವ ಸ್ಥಳದ ಕ್ಷೇತ್ರ ರೇಖೆಗೆ ಸ್ಪರ್ಶಕವಾಗಿ (tangent) ತಿರುಗುತ್ತದೆ ಮತ್ತು ಬಾಣಗಳು ರೇಖೆಯ ದಿಕ್ಕನ್ನು ಸೂಚಿಸುತ್ತವೆ.',
          realWorldExample:
            'ದಂಡ ಅಯಸ್ಕಾಂತದ ಮೇಲಿರುವ ಕಾಗದದ ಮೇಲೆ ಕಬ್ಬಿಣದ ಹುಡಿಯನ್ನು (iron filings) ಹರಡಿದಾಗ ಅದು ನೇರವಾಗಿ ಇದೇ ಕ್ಷೇತ್ರ ರೇಖೆಗಳ ಮಾದರಿಯಲ್ಲಿ ಜೋಡಣೆಗೊಳ್ಳುತ್ತದೆ.',
          whyItMatters:
            'ಕಣ್ಣಿಗೆ ಕಾಣದ ಕಾಂತೀಯ ಶಕ್ತಿಯನ್ನು ನಕ್ಷೆ ಮಾಡಲು ಮತ್ತು ಭೂಮಿಯ ಅಯಸ್ಕಾಂತೀಯ ರಕ್ಷಾಕವಚದಂತೆ ಬಾಹ್ಯಾಕಾಶ ಕಣಗಳು ಹೇಗೆ ತಿರುಗುತ್ತವೆ ಎಂಬುದನ್ನು ಊಹಿಸಲು ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ನೆರವಾಗುತ್ತವೆ.',
          currentStateSummary: `ಶಕ್ತಿ ${s.strength}× · ಮುಚ್ಚಿದ ವಕ್ರರೇಖೆಗಳು`,
          source: 'curated',
        };
      }
      if (lang === 'hi') {
        return {
          name: 'चुंबकीय क्षेत्र रेखाएँ',
          definition:
            'चुंबकीय क्षेत्र रेखाएँ काल्पनिक सतत बंद वक्र हैं जो अंतरिक्ष के प्रत्येक बिंदु पर चुंबकीय क्षेत्र की दिशा और प्रबलता दर्शाती हैं।',
          characteristics:
            'चुंबक के बाहर ये उत्तरी ध्रुव (N) से निकलकर दक्षिणी ध्रुव (S) में जाती हैं और भीतर S से N की ओर लौटकर बंद लूप बनाती हैं।',
          functionDescription:
            'रेखाओं का घनापन चुंबकीय क्षेत्र की तीव्रता |B| दर्शाता है — ध्रुवों के पास रेखाएँ घनी (प्रबल क्षेत्र) और दूर विरल (दुर्बल क्षेत्र) होती हैं।',
          scientificProperties:
            'दो चुंबकीय क्षेत्र रेखाएँ कभी एक-दूसरे को नहीं काटतीं (intersect नहीं करतीं), क्योंकि प्रतिच्छेदन बिंदु पर क्षेत्र की दो दिशाएँ होंगी — जो संभव नहीं है।',
          behaviour: `वर्तमान ${s.strength}× शक्ति और ${s.angle}° कोण पर सभी रेखाएँ ध्रुवों के पास सबसे सघन हैं और कभी आपस में नहीं मिलतीं।`,
          relationshipWithOthers:
            'रेखाओं पर बने तीर इनकी N→S दिशा बताते हैं, और दिक्सूचक सुई हमेशा अपने स्थान की क्षेत्र रेखा के स्पर्शरेखा की दिशा में संरेखित होती है।',
          realWorldExample:
            'पृथ्वी के चारों ओर का मैग्नेटोस्फीयर इन्हीं बंद चुंबकीय क्षेत्र रेखाओं के रूप में सूर्य की हानिकारक सौर वायु से रक्षा करता है।',
          whyItMatters:
            'अदृश्य चुंबकीय बलों को देखने का यह सबसे शक्तिशाली तरीका है — इसी की मदद से वैज्ञानिक पृथ्वी की चुंबकीय ढाल और कण-त्वरक डिज़ाइन करते हैं।',
          currentStateSummary: `शक्ति ${s.strength}× · बंद अप्रतिच्छेदी लूप`,
          source: 'curated',
        };
      }
      return {
        name: 'Magnetic Field Lines',
        definition:
          'Magnetic field lines are imaginary continuous closed curves used to map the direction and relative strength of a magnetic field in space.',
        characteristics:
          'They emerge from the North pole and enter the South pole outside the magnet, then travel from South to North inside to form unbroken closed loops.',
        functionDescription:
          'Their spacing indicates field strength |B|: closely packed lines near the poles show strong magnetic flux density, while wide spacing shows weaker fields.',
        scientificProperties:
          'Magnetic field lines never intersect each other. If two lines crossed, the magnetic field at that single point would have two simultaneous directions—forcing a compass needle to point two ways at once, which is physically impossible.',
        behaviour: `At ${s.strength}× strength and ${s.angle}° magnet rotation, all field curves rotate rigidly with the dipole and remain dense near the N and S pole faces.`,
        relationshipWithOthers:
          'Direction arrows mark the forward path along each line, while the compass needle aligns tangent to whichever field line passes through its pivot.',
        realWorldExample:
          'Sprinkling iron filings around a bar magnet makes filings align into these exact field-line curves, and Earth’s magnetosphere uses the same dipole geometry to deflect solar wind.',
        whyItMatters:
          'Field lines turn an invisible force field into a readable map—helping physicists design magnetic shielding, fusion tokamaks, and Earth space-weather forecasts.',
        currentStateSummary: `Density scaled to ${s.strength}× · Non-intersecting`,
        source: 'curated',
      };
    },
  },
  {
    id: 'field_direction_arrows',
    simulationId: 'bar_magnet',
    iconKey: 'arrows',
    displayName: {
      en: 'Magnetic Field Direction Arrow',
      kn: 'ಕ್ಷೇತ್ರ ದಿಕ್ಕಿನ ಬಾಣ',
      hi: 'चुंबकीय क्षेत्र दिशा तीर',
    },
    identificationText: {
      en: 'Shows local tangent direction of B',
      kn: 'ಸ್ಥಳೀಯ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ದಿಕ್ಕನ್ನು ಸೂಚಿಸುತ್ತದೆ',
      hi: 'स्थानीय चुंबकीय क्षेत्र सदिश B की दिशा',
    },
    hitRegion: {
      kind: 'canvas_custom',
      description: 'Directional arrowheads along magnetic field lines and vector grid',
    },
    highlight: {
      strokeColor: '#D97706',
      glowColor: 'rgba(217, 119, 6, 0.35)',
      strokeWidth: 3.0,
      emissiveHex: 0xd97706,
      emissiveIntensity: 0.85,
      scaleBoost: 1.35,
    },
    explanationContext:
      'Magnetic field direction arrows: represent the tangent vector B̂ of the magnetic field line at that point (direction a hypothetical free North pole or compass North tip points, N to S outside).',
    describeCurrentState: (lang, state) => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return `ದಿಕ್ಸೂಚಿ ಬಿಂದುವಿನಲ್ಲಿ ಸ್ಪರ್ಶಕ ಕೋನ: ${s.fieldAngle}°`;
      }
      if (lang === 'hi') {
        return `कंपास स्थान पर स्पर्शरेखा दिशा: ${s.fieldAngle}°`;
      }
      return `Local tangent vector angle at probe: ${s.fieldAngle}°`;
    },
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return {
          name: 'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ದಿಕ್ಕಿನ ಬಾಣಗಳು',
          definition:
            'ಕ್ಷೇತ್ರ ರೇಖೆಗಳ ಮೇಲಿರುವ ದಿಕ್ಕಿನ ಬಾಣಗಳು ಆ ಬಿಂದುವಿನಲ್ಲಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ಸದಿಶ B ಯ ನಿಖರ ಸ್ಪರ್ಶಕ ದಿಕ್ಕನ್ನು ಸೂಚಿಸುತ್ತವೆ.',
          characteristics:
            'ಹೊರಭಾಗದಲ್ಲಿ ಪ್ರತಿಯೊಂದು ಬಾಣವೂ ಉತ್ತರ ಧ್ರುವದಿಂದ ದೂರ ಸರಿದು ದಕ್ಷಿಣ ಧ್ರುವದ ಕಡೆಗೆ ಮುಖ ಮಾಡಿರುತ್ತದೆ.',
          functionDescription:
            'ಒಂದು ಪ್ರತ್ಯೇಕ ಉತ್ತರ ಧ್ರುವ ಅಥವಾ ದಿಕ್ಸೂಚಿಯ ಕೆಂಪು ತುದಿಯು ಆ ಸ್ಥಳದಲ್ಲಿ ಯಾವ ದಿಕ್ಕಿಗೆ ತಳ್ಳಲ್ಪಡುತ್ತದೆ ಎಂಬುದನ್ನು ತಕ್ಷಣವೇ ತಿಳಿಸುತ್ತವೆ.',
          scientificProperties:
            'ಬಾಣದ ದಿಕ್ಕು ಆ ಬಿಂದುವಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ B ಯ ಏಕೈಕ ದಿಕ್ಕನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ (ವೆಕ್ಟರ್ ಪ್ರಮಾಣ).',
          behaviour: `ಅಯಸ್ಕಾಂತವನ್ನು ${s.angle}° ತಿರುಗಿಸಿದಾಗ ಪ್ರತಿಯೊಂದು ಬಾಣದ ದಿಕ್ಕು ತಕ್ಷಣವೇ ಬದಲಾಗಿ ಹೊಸ N→S ಹರಿವಿಗೆ ಹೊಂದಿಕೊಳ್ಳುತ್ತದೆ.`,
          relationshipWithOthers:
            'ದಿಕ್ಸೂಚಿ ಸೂಜಿಯ ಕೆಂಪು ತುದಿಯು ಯಾವಾಗಲೂ ತನ್ನ ಹತ್ತಿರದ ದಿಕ್ಕಿನ ಬಾಣವು ತೋರಿಸುವ ದಿಕ್ಕಿನಲ್ಲೇ ನಿಲ್ಲುತ್ತದೆ.',
          realWorldExample:
            'ವಿದ್ಯುತ್ಕಾಂತೀಯ ಕಾಯಿಲ್ ವಿನ್ಯಾಸ ಮತ್ತು ಹವಾಮಾನ ಕಾಂತೀಯ ನಕ್ಷೆಗಳಲ್ಲಿ (magnetic vector maps) ಫ್ಲಕ್ಸ್ ಹರಿವಿನ ದಿಕ್ಕನ್ನು ಗುರುತಿಸಲು ವೆಕ್ಟರ್ ಬಾಣಗಳನ್ನು ಬಳಸುತ್ತಾರೆ.',
          whyItMatters:
            'ಕ್ಷೇತ್ರದ ದಿಕ್ಕನ್ನು (ವೆಕ್ಟರ್ ಸ್ವಭಾವ) ತಿಳಿದರೆ ಮಾತ್ರ ವಿದ್ಯುತ್ ತಂತಿ ಅಥವಾ ಆವೇಶಿತ ಕಣದ ಮೇಲೆ ಬಲ ಯಾವ ದಿಕ್ಕಿನಲ್ಲಿ ಬೀಳುತ್ತದೆ ಎಂದು ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಬಹುದು.',
          currentStateSummary: `ಸ್ಥಳೀಯ ದಿಕ್ಕು: ${s.fieldAngle}°`,
          source: 'curated',
        };
      }
      if (lang === 'hi') {
        return {
          name: 'चुंबकीय क्षेत्र दिशा तीर',
          definition:
            'क्षेत्र रेखाओं पर बने ये तीर किसी भी बिंदु पर चुंबकीय क्षेत्र सदिश B की स्थानीय स्पर्शरेखा दिशा दर्शाते हैं।',
          characteristics:
            'चुंबक के बाहर हर तीर उत्तरी ध्रुव (N) से बाहर और दक्षिणी ध्रुव (S) की ओर इंगित करता है।',
          functionDescription:
            'यह दर्शाते हैं कि उस बिंदु पर रखा स्वतंत्र उत्तरी ध्रुव या दिक्सूचक सुई का लाल सिरा किस दिशा में बल अनुभव करेगा।',
          scientificProperties:
            'प्रत्येक स्थान पर क्षेत्र सदिश B एक अद्वितीय (single) दिशा रखता है, जिसे यही दिशा तीर प्रदर्शित करता है।',
          behaviour: `जब आप चुंबक को ${s.angle}° घुमाते हैं, तो सभी दिशा तीर तुरंत नए चुंबकीय क्षेत्र पथ के अनुसार मुड़ जाते हैं।`,
          relationshipWithOthers:
            'ये तीर क्षेत्र रेखाओं पर चलते हैं और दिक्सूचक सुई की लाल नोक के संरेखण से सीधे मेल खाते हैं।',
          realWorldExample:
            'इलेक्ट्रिकल इंजीनियरिंग में ट्रांसफ़ॉर्मर कोर और MRI कॉइल के भीतर चुंबकीय फ्लक्स की दिशा समझने के लिए दिशा तीरों का उपयोग होता है।',
          whyItMatters:
            'चुंबकीय क्षेत्र एक सदिश (vector) राशि है; सही दिशा जाने बिना हम लोरेंत्ज़ बल या फ्लेमिंग के नियमों का उपयोग नहीं कर सकते।',
          currentStateSummary: `प्रोब पर क्षेत्र कोण: ${s.fieldAngle}°`,
          source: 'curated',
        };
      }
      return {
        name: 'Magnetic Field Direction Arrows',
        definition:
          'Directional arrowheads on field lines and vector grid points indicate the exact tangent direction of the magnetic field vector B at that location.',
        characteristics:
          'Outside the bar magnet, every arrow points outward from the North pole and curves steadily toward the South pole.',
        functionDescription:
          'They show which way the North tip of a compass needle—or an isolated test North pole—experiences magnetic force at that spot.',
        scientificProperties:
          'Magnetic field B is a vector quantity; the arrow establishes orientation while field-line spacing shows magnitude.',
        behaviour: `As you rotate the magnet (currently ${s.angle}°), each arrow reverses or tilts dynamically to stay aligned with the local tangent of B.`,
        relationshipWithOthers:
          'Arrows sit along magnetic field lines and predict the exact direction the compass needle’s red tip will point when placed nearby.',
        realWorldExample:
          'Used in geomagnetic navigation charts and electric motor design diagrams to track magnetic flux orientation through stator cores.',
        whyItMatters:
          'Because B is a vector, knowing exact local field direction is essential for applying Fleming’s rules and predicting forces on moving charges.',
        currentStateSummary: `Field angle at probe: ${s.fieldAngle}°`,
        source: 'curated',
      };
    },
  },
  {
    id: 'compass_needle',
    simulationId: 'bar_magnet',
    iconKey: 'compass',
    displayName: {
      en: 'Compass Needle',
      kn: 'ದಿಕ್ಸೂಚಿ ಸೂಜಿ',
      hi: 'दिक्सूचक सुई',
    },
    identificationText: {
      en: 'Aligns tangent to local field B',
      kn: 'ಸ್ಥಳೀಯ ಕಾಂತೀಯ ಕ್ಷೇತ್ರಕ್ಕೆ ಸ್ಪರ್ಶಕವಾಗಿ ತಿರುಗುತ್ತದೆ',
      hi: 'स्थानीय चुंबकीय क्षेत्र की दिशा में संरेखित होती है',
    },
    hitRegion: {
      kind: 'canvas_custom',
      description: 'Magnetic compass dial and red/slate magnetized needle',
    },
    highlight: {
      strokeColor: '#6F4E37',
      glowColor: 'rgba(111, 78, 55, 0.28)',
      strokeWidth: 3.0,
      emissiveHex: 0x6f4e37,
      emissiveIntensity: 0.55,
    },
    explanationContext:
      'Compass needle: tiny lightweight permanent magnet dipole experiencing magnetic torque τ = m_compass × B, aligning its red North-seeking tip tangent to the local magnetic field.',
    describeCurrentState: (lang, state) => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return `ಸ್ಥಳೀಯ |B|: ${s.magMt} mT · ಸೂಜಿ ಕೋನ: ${s.fieldAngle}°`;
      }
      if (lang === 'hi') {
        return `स्थानीय |B|: ${s.magMt} mT · सुई कोण: ${s.fieldAngle}°`;
      }
      return `Local |B|: ${s.magMt} mT · Needle angle: ${s.fieldAngle}°`;
    },
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return {
          name: 'ಕಾಂತೀಯ ದಿಕ್ಸೂಚಿ ಸೂಜಿ',
          definition:
            'ದಿಕ್ಸೂಚಿ ಸೂಜಿಯು ತನ್ನ ಮಧ್ಯದ ಆಧಾರದ ಮೇಲೆ ಮುಕ್ತವಾಗಿ ತಿರುಗಬಲ್ಲ ಸಣ್ಣ, ಹಗುರವಾದ ಶಾಶ್ವತ ದಂಡ ಅಯಸ್ಕಾಂತವಾಗಿದೆ.',
          characteristics:
            'ಇದರ ಕೆಂಪು ತುದಿಯು ಉತ್ತರ-ಅನ್ವೇಷಕ ಧ್ರುವವಾಗಿದ್ದು, ಕಡು ಬೂದು ತುದಿಯು ದಕ್ಷಿಣ ಧ್ರುವವಾಗಿದೆ.',
          functionDescription:
            'ತನ್ನ ಸ್ಥಾನದಲ್ಲಿನ ಸ್ಥಳೀಯ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ B ಅನ್ನು ಪತ್ತೆಹಚ್ಚಿ ಅದರ ದಿಕ್ಕಿಗೆ ತಕ್ಕಂತೆ ತಿರುಗುತ್ತದೆ.',
          scientificProperties:
            'ಸೂಜಿಯ ಮೇಲೆ ವರ್ತಿಸುವ ಕಾಂತೀಯ ತಿರುಗುಬಲ τ = m × B ಅದನ್ನು ಕ್ಷೇತ್ರ ರೇಖೆಗೆ ಸಮಾನಾಂತರವಾಗಿ (ಸ್ಪರ್ಶಕವಾಗಿ) ನಿಲ್ಲಿಸುವವರೆಗೆ ತಿರುಗಿಸುತ್ತದೆ.',
          behaviour: `ಪ್ರಸ್ತುತ ಸ್ಥಾನದಲ್ಲಿ |B| = ${s.magMt} mT ಇದ್ದು, ಸೂಜಿಯು ${s.fieldAngle}° ಕೋನದಲ್ಲಿ ನಿಂತಿದೆ. ದಿಕ್ಸೂಚಿಯನ್ನು ಎಳೆದಂತೆಲ್ಲ ಕೋನ ತಕ್ಷಣ ಬದಲಾಗುತ್ತದೆ.`,
          relationshipWithOthers:
            'ದಿಕ್ಸೂಚಿ ಆಧಾರದ (pivot) ಮೇಲೆ ತಿರುಗುವ ಈ ಸೂಜಿಯು ಉತ್ತರ ಧ್ರುವದಿಂದ ವಿಕರ್ಷಿತವಾಗಿ ದಕ್ಷಿಣ ಧ್ರುವದ ಕಡೆಗೆ ಆಕರ್ಷಿತವಾಗುತ್ತದೆ.',
          realWorldExample:
            'ಹಡಗುಗಳು, ಪರ್ವತಾರೋಹಣ ಮತ್ತು ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಮ್ಯಾಗ್ನೆಟೋಮೀಟರ್ ದಿಕ್ಸೂಚಿಗಳಲ್ಲಿ ಕಾಂತೀಯ ದಿಕ್ಕನ್ನು ಅಳೆಯಲು ಇದೇ ತತ್ವ ಬಳಕೆಯಾಗುತ್ತದೆ.',
          whyItMatters:
            'ಕಣ್ಣಿಗೆ ಕಾಣದ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ದಿಕ್ಕನ್ನು ಅಳೆಯಲು ದಿಕ್ಸೂಚಿ ಸೂಜಿಯು ಮಾನವನಿಗೆ ಸಾವಿರಾರು ವರ್ಷಗಳಿಂದ ನೌಕಾಯಾನ ಮತ್ತು ವೈಜ್ಞಾನಿಕ ಸಂಶೋಧನೆಗೆ ದಾರಿ ತೋರಿಸಿದೆ.',
          currentStateSummary: `|B| = ${s.magMt} mT · ದಿಕ್ಕು ${s.fieldAngle}°`,
          source: 'curated',
        };
      }
      if (lang === 'hi') {
        return {
          name: 'दिक्सूचक सुई (कंपास नीडल)',
          definition:
            'दिक्सूचक सुई एक अत्यंत हल्का, छोटा स्थायी छड़ चुंबक है जो केंद्र कील पर क्षैतिज रूप से घूमने के लिए स्वतंत्र होता है।',
          characteristics:
            'इसका लाल सिरा उत्तरी ध्रुव (N) और गहरे स्लेटी रंग का सिरा दक्षिणी ध्रुव (S) होता है।',
          functionDescription:
            'अपने स्थान पर स्थानीय चुंबकीय क्षेत्र सदिश B की दिशा मापती है और चुंबकीय बल के प्रभाव से घूमकर सही दिशा दर्शाती है।',
          scientificProperties:
            'जब सुई क्षेत्र से कोण पर होती है तो उस पर चुंबकीय बलाघूर्ण τ = m × B लगता है, जो इसे क्षेत्र रेखा की स्पर्शरेखा के समानांतर ले आता है।',
          behaviour: `वर्तमान स्थान पर |B| = ${s.magMt} mT है और सुई ${s.fieldAngle}° पर संरेखित है। कंपास को घुमाने पर यह सुचारु रूप से नई दिशा में मुड़ती है।`,
          relationshipWithOthers:
            'यह दिक्सूचक पिवट (कील) पर घूमती है और छड़ चुंबक के पास ले जाने पर हमेशा क्षेत्र दिशा तीरों के समानांतर हो जाती है।',
          realWorldExample:
            'नौवहन (नेविगेशन), सर्वेक्षण और बिजली के तारों में चुंबकीय क्षेत्र की उपस्थिति जाँचने के लिए चुंबकीय कंपास का प्रयोग होता है।',
          whyItMatters:
            'अदृश्य चुंबकीय क्षेत्र का पता लगाने वाला यह सबसे सरल संसूचक है — सदियों से समुद्र में दिशा खोजने और प्रयोगशालाओं में क्षेत्र मापने में सहायक रहा है।',
          currentStateSummary: `|B| = ${s.magMt} mT · कोण ${s.fieldAngle}°`,
          source: 'curated',
        };
      }
      return {
        name: 'Compass Needle',
        definition:
          'A compass needle is a tiny, lightweight permanent bar magnet balanced so it can swivel freely in response to nearby magnetic fields.',
        characteristics:
          'Features a red North-seeking tip and a dark slate South tail inside a protective non-magnetic brass housing.',
        functionDescription:
          'Detects and visually aligns with the local magnetic field vector B at the compass probe’s exact coordinates.',
        scientificProperties:
          'Experiences magnetic torque τ = m_needle × B until its dipole axis lies tangent to the local magnetic field line (τ = 0 equilibrium).',
        behaviour: `At this probe position, |B| reads ${s.magMt} mT and the red tip aligns at ${s.fieldAngle}°. Dragging the compass updates deflection smoothly in real time.`,
        relationshipWithOthers:
          'Rotates around the central compass pivot; its red tip is repelled by the magnet’s North pole and pulled toward the South pole, matching nearby direction arrows.',
        realWorldExample:
          'Used in maritime and wilderness navigation, geological surveying, and detecting stray magnetic fields near current-carrying cables.',
        whyItMatters:
          'The compass needle turns invisible magnetic torque into a clear directional pointer—making navigation, field mapping, and current detection possible.',
        currentStateSummary: `|B| = ${s.magMt} mT · Angle: ${s.fieldAngle}°`,
        source: 'curated',
      };
    },
  },
  {
    id: 'compass_pivot',
    simulationId: 'bar_magnet',
    iconKey: 'pivot',
    displayName: {
      en: 'Compass Pivot',
      kn: 'ದಿಕ್ಸೂಚಿ ಆಧಾರ ಬಿಂದುವು',
      hi: 'दिक्सूचक कील (पिवट)',
    },
    identificationText: {
      en: 'Low-friction center bearing pin',
      kn: 'ಕಡಿಮೆ ಘರ್ಷಣೆಯ ಮಧ್ಯದ ಆಧಾರ',
      hi: 'कम घर्षण वाला केंद्र घूर्णन अक्ष',
    },
    hitRegion: {
      kind: 'canvas_custom',
      description: 'Center brass pivot pin supporting the rotating compass needle',
    },
    highlight: {
      strokeColor: '#D97706',
      glowColor: 'rgba(217, 119, 6, 0.35)',
      strokeWidth: 3.0,
      emissiveHex: 0xd97706,
      emissiveIntensity: 0.85,
    },
    explanationContext:
      'Compass pivot: low-friction central brass/jewel bearing pin at the center of mass of the compass needle, minimizing static friction so tiny magnetic torques rotate the needle accurately.',
    describeCurrentState: (lang, state) => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return `ಸೂಜಿ ಅಕ್ಷ ಕೋನ: ${s.fieldAngle}° · ಕಡಿಮೆ ಘರ್ಷಣೆಯ ಚಲನೆ`;
      }
      if (lang === 'hi') {
        return `घूर्णन अक्ष कोण: ${s.fieldAngle}° · मुक्त संरेखण`;
      }
      return `Rotation axis at ${s.fieldAngle}° · Free-swivel fulcrum`;
    },
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => {
      const s = readMagnetState(state);
      if (lang === 'kn') {
        return {
          name: 'ದಿಕ್ಸೂಚಿ ಆಧಾರ (Pivot)',
          definition:
            'ದಿಕ್ಸೂಚಿ ಸೂಜಿಯ ಗುರುತ್ವ ಕೇಂದ್ರವನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಂಡು ಅದು ಸುಲಭವಾಗಿ ತಿರುಗಲು ಅವಕಾಶ ನೀಡುವ ಚೂಪಾದ ಮಧ್ಯದ ಕೀಲು (pin) ಆಧಾರವಾಗಿದೆ.',
          characteristics:
            'ಅತಿಕಡಿಮೆ ಘರ್ಷಣೆಯ ಹಿತ್ತಾಳೆ ಅಥವಾ ರತ್ನದ (jewel) ಬೇರಿಂಗ್‌ನಿಂದ ಮಾಡಲ್ಪಟ್ಟಿದ್ದು, ಕೇವಲ ಚೂಪಾದ ಬಿಂದುವಿನಲ್ಲಿ ಸೂಜಿಯನ್ನು ಸ್ಪರ್ಶಿಸುತ್ತದೆ.',
          functionDescription:
            'ಘರ್ಷಣೆಯನ್ನು ಕನಿಷ್ಠಗೊಳಿಸುವ ಮೂಲಕ ದುರ್ಬಲ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದಲ್ಲೂ ಸೂಜಿಯು ನಿಖರವಾಗಿ ತಿರುಗುವಂತೆ ಮಾಡುತ್ತದೆ.',
          scientificProperties:
            'ತಿರುಗುಬಲ τ = m × B ಘರ್ಷಣಾ ಪ್ರತಿರೋಧಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದಾಗ ಮಾತ್ರ ಸೂಜಿ ತಿರುಗುತ್ತದೆ; ಆದ್ದರಿಂದ ಕಡಿಮೆ ಘರ್ಷಣೆ ಅತ್ಯಗತ್ಯ.',
          behaviour: `ಪ್ರಸ್ತುತ ${s.magMt} mT ಕ್ಷೇತ್ರದಲ್ಲಿ ಸೂಜಿಯನ್ನು ${s.fieldAngle}° ದಿಕ್ಕಿಗೆ ಮುಕ್ತವಾಗಿ ತಿರುಗಲು ಆಧಾರ ನೀಡುತ್ತಿದೆ.`,
          relationshipWithOthers:
            'ದಿಕ್ಸೂಚಿ ಸೂಜಿಯನ್ನು ದಿಕ್ಸೂಚಿ ಫಲಕದ ಮಧ್ಯದಲ್ಲಿ ಹಿಡಿದಿಟ್ಟು, ಹೊರಗಿನ ಕಾಂತೀಯ ಕ್ಷೇತ್ರಕ್ಕೆ ತಕ್ಕಂತೆ ಅದು ಸ್ವತಂತ್ರವಾಗಿ ತಿರುಗುವಂತೆ ಮಾಡುತ್ತದೆ.',
          realWorldExample:
            'ನಿಖರವಾದ ಕೈಗಡಿಯಾರಗಳು, ಗೈರೋಸ್ಕೋಪ್‌ಗಳು ಮತ್ತು ನೌಕಾಯಾನ ದಿಕ್ಸೂಚಿಗಳಲ್ಲಿ ಘರ್ಷಣೆ ತಡೆಯಲು ಸಫೈರ್ ಜ್ಯುವೆಲ್ ಪಿವಟ್ ಬೇರಿಂಗ್‌ಗಳನ್ನು ಬಳಸಲಾಗುತ್ತದೆ.',
          whyItMatters:
            'ಆಧಾರದ ಘರ್ಷಣೆ ಹೆಚ್ಚಿದ್ದರೆ ದುರ್ಬಲ ಕಾಂತೀಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸೂಜಿ ಅಂಟಿಕೊಂಡು ತಪ್ಪು ದಿಕ್ಕು ತೋರಿಸುತ್ತದೆ; ಕಡಿಮೆ ಘರ್ಷಣೆಯ ಪಿವಟ್ ನಿಖರ ಮಾಪನಕ್ಕೆ ಅತ್ಯವಶ್ಯಕ.',
          currentStateSummary: `ಸೂಜಿ ದಿಕ್ಕು: ${s.fieldAngle}°`,
          source: 'curated',
        };
      }
      if (lang === 'hi') {
        return {
          name: 'दिक्सूचक कील (पिवट)',
          definition:
            'पिवट कंपास के ठीक केंद्र में स्थित वह नुकीली धुरी (pin) है जिस पर चुंबकीय सुई संतुलित होकर स्वतंत्र रूप से घूमती है।',
          characteristics:
            'यह पीतल या कठोर मिश्रधातु की अत्यंत चिकनी नोक से बना होता है ताकि संपर्क क्षेत्र और घर्षण न्यूनतम रहे।',
          functionDescription:
            'सुई को संतुलित रखता है और कम से कम यांत्रिक प्रतिरोध के साथ क्षैतिज तल में घूमने की अनुमति देता है।',
          scientificProperties:
            'दुर्बल चुंबकीय क्षेत्र में बहुत कम बलाघूर्ण (τ) उत्पन्न होता है, इसलिए सटीक संरेखण के लिए पिवट घर्षण का लगभग शून्य होना आवश्यक है।',
          behaviour: `अभी यह ${s.magMt} mT क्षेत्र में सुई को ${s.fieldAngle}° कोण पर बिना अटके स्वतंत्र रूप से घूमने दे रहा है।`,
          relationshipWithOthers:
            'दिक्सूचक सुई इसी केंद्र बिंदु के परितः घूमती है ताकि सुई चुंबक के चारों ओर किसी भी स्थान की दिशा दिखा सके।',
          realWorldExample:
            'नावों के मैरीन कंपास और यांत्रिक घड़ियों में घर्षण शून्य के करीब रखने के लिए ज्वेल्ड पिवट बेयरिंग लगाए जाते हैं।',
          whyItMatters:
            'घर्षण कम किए बिना पृथ्वी या दूर के चुंबक जैसा कमजोर बल सुई को घुमा नहीं पाएगा — सटीक मापन यंत्रों में पिवट इंजीनियरिंग की बड़ी भूमिका है।',
          currentStateSummary: `सुई कोण: ${s.fieldAngle}°`,
          source: 'curated',
        };
      }
      return {
        name: 'Compass Pivot',
        definition:
          'The compass pivot is the sharp, low-friction central pin or jewel bearing at the center of mass on which the compass needle balances.',
        characteristics:
          'Constructed with a fine brass or jeweled point contact to minimize surface area and eliminate sticking friction.',
        functionDescription:
          'Supports the compass needle horizontally while letting tiny magnetic forces rotate it freely without mechanical drag.',
        scientificProperties:
          'Because weak magnetic fields at large distances (∝ 1/r³) produce very small torque τ, ultra-low pivot friction is critical for accurate needle alignment.',
        behaviour: `Currently allowing the needle to swivel smoothly to ${s.fieldAngle}° under the local ${s.magMt} mT magnetic field.`,
        relationshipWithOthers:
          'Anchors the center of the compass needle to the dial housing while enabling free angular response to the bar magnet’s field.',
        realWorldExample:
          'Precision marine compasses and analog galvanometers use hardened steel pivots resting in sapphire jewel bearings for near-frictionless motion.',
        whyItMatters:
          'Even Earth’s magnetic field is relatively weak—without a near-frictionless pivot, real compasses and analog meters would stick and give false readings.',
        currentStateSummary: `Free rotation axis · Needle at ${s.fieldAngle}°`,
        source: 'curated',
      };
    },
  },
];
