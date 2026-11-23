import type { LanguageCode, SimulationEngineId } from '../types/physics';
import batteryImg from '../assets/images/battery_component_1794946708574.jpg';
import barMagnetImg from '../assets/images/bar_magnet_component_1794946708351.jpg';
import convexMirrorImg from '../assets/images/convex_mirror_component_1794946710421.jpg';
import concaveMirrorImg from '../assets/images/concave_mirror_component_1794946710493.jpg';
import resistorImg from '../assets/images/resistor_component_1794946711099.jpg';
import wireImg from '../assets/images/wire_component_1794946711253.jpg';
import compassImg from '../assets/images/compass_component_1794946711989.jpg';
import convexLensImg from '../assets/images/lens_component_1794946712264.jpg';
import concaveLensImg from '../assets/images/concave_lens_component_1794947770285.jpg';
import bulbImg from '../assets/images/bulb_component_1794946712903.jpg';
import switchImg from '../assets/images/switch_component_1794946713479.jpg';
import ironFilingsImg from '../assets/images/iron_filings_field_1794950275635.jpg';
import glassSlabImg from '../assets/images/glass_slab_refraction_1794950274854.jpg';
import glassPrismImg from '../assets/images/glass_prism_dispersion_1794950276066.jpg';
import planeMirrorImg from '../assets/images/plane_mirror_lab_1794950275976.jpg';
import electromagnetImg from '../assets/images/electromagnet_solenoid_1794950276605.jpg';
import kinematicsCartImg from '../assets/images/kinematics_cart_track_1794950277166.jpg';
import pulleyLeverImg from '../assets/images/pulley_lever_rig_1794950277789.jpg';
import thermometerHeatImg from '../assets/images/thermometer_calorimetry_1794950278404.jpg';
import tuningForkImg from '../assets/images/tuning_fork_sound_1794950279538.jpg';
import buoyancyBalanceImg from '../assets/images/buoyancy_spring_balance_1794950279672.jpg';

export type ComponentVisualType = 'generated_visual' | 'illustration' | 'photograph';

export interface ComponentRealWorldVisual {
  componentId: string;
  displayName: string;
  src: string;
  imageType: ComponentVisualType;
  attribution: Record<LanguageCode, string>;
  fallbackDescription: Record<LanguageCode, string>;
  alt: Record<LanguageCode, string>;
  caption: Record<LanguageCode, string>;
}

const DEFAULT_GENERATED_ATTRIBUTION: Record<LanguageCode, string> = {
  en: 'Lab reference visual · Studio apparatus photograph',
  kn: 'ಪ್ರಯೋಗಾಲಯ ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಉಪಕರಣದ ನೈಜ ಚಿತ್ರ',
  hi: 'प्रयोगशाला संदर्भ दृश्य · वास्तविक उपकरण चित्र',
};

const COMPONENT_ID_ALIASES: Record<string, string> = {
  bar_magnet: 'magnet_body',
  connection_wire: 'wires',
  wire: 'wires',
  compass: 'compass_needle',
  lens: 'convex_lens',
  plane_mirror: 'mirror',
  emergent_ray: 'refracted_ray',
  object_pin: 'convex_lens',
  formed_image: 'convex_lens',
  pendulum_bob: 'energy_bob',
  bob: 'energy_bob',
  spring: 'energy_bob',
  incline_block: 'test_block',
  ramp: 'test_block',
  inclined_plane: 'test_block',
  projectile: 'moving_body',
  launcher: 'moving_body',
  calorimeter: 'thermometer_probe',
  beaker: 'surface_or_fluid',
  fluid_tank: 'surface_or_fluid',
  string_wave: 'wave',
  speaker: 'vibrating_source',
  ammeter: 'resistor',
  voltmeter: 'battery',
};

function makeVisual(
  componentId: string,
  displayName: string,
  src: string,
  fallbackEn: string,
  fallbackKn: string,
  fallbackHi: string,
  captionEn: string,
  captionKn: string,
  captionHi: string,
  altEn?: string
): ComponentRealWorldVisual {
  return {
    componentId,
    displayName,
    src,
    imageType: 'generated_visual',
    attribution: DEFAULT_GENERATED_ATTRIBUTION,
    fallbackDescription: { en: fallbackEn, kn: fallbackKn, hi: fallbackHi },
    alt: {
      en: altEn || captionEn,
      kn: captionKn,
      hi: captionHi,
    },
    caption: {
      en: captionEn,
      kn: captionKn,
      hi: captionHi,
    },
  };
}

const COMPONENT_VISUAL_MAP: Record<string, ComponentRealWorldVisual> = {
  battery: makeVisual(
    'battery',
    'Dry Cell Battery',
    batteryImg,
    'Standard 1.5V cylindrical dry cell / 9V cell with raised positive (+) cap and flat negative (−) terminal.',
    'ಧನ (+) ಮತ್ತು ಋಣ (−) ತುದಿಗಳನ್ನು ಹೊಂದಿರುವ ಸಾಮಾನ್ಯ 1.5V / 9V ಬ್ಯಾಟರಿ.',
    'धनात्मक (+) और ऋणात्मक (−) टर्मिनल वाली मानक 1.5V / 9V बैटरी।',
    'Lab reference visual · Dry cell (+ / − terminals)',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಬ್ಯಾಟರಿ (+ / − ತುದಿಗಳು)',
    'दृश्य संदर्भ · बैटरी (+ / − टर्मिनल)',
    'Dry cell batteries (1.5V AA and 9V) showing positive (+) and negative (−) metal terminals'
  ),
  resistor: makeVisual(
    'resistor',
    'Axial Carbon-Film Resistor',
    resistorImg,
    'Ceramic-body axial resistor marked with resistance color bands and two axial metal wire leads.',
    'ಬಣ್ಣದ ಪಟ್ಟಿಗಳು ಮತ್ತು ಎರಡು ತಂತಿ ತುದಿಗಳನ್ನು ಹೊಂದಿರುವ ರೋಧಕ (Resistor).',
    'रंगीन बैंड और दो धातु तार लीड वाला अक्षीय प्रतिरोधक।',
    'Lab reference visual · Axial carbon-film resistor',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಎಲೆಕ್ಟ್ರಾನಿಕ್ ರೋಧಕ',
    'दृश्य संदर्भ · इलेक्ट्रॉनिक प्रतिरोधक',
    'Axial carbon-film electronic resistor with color-code bands and metal leads'
  ),
  wires: makeVisual(
    'wires',
    'Insulated Copper Connecting Wires',
    wireImg,
    'Red and black PVC-insulated flexible copper leads with stripped ends or crocodile test clips.',
    'ನಿರೋಧಕ ಕವಚ ಮತ್ತು ಕ್ಲಿಪ್‌ಗಳನ್ನು ಹೊಂದಿರುವ ತಾಮ್ರದ ಸಂಪರ್ಕ ತಂತಿಗಳು.',
    'PVC आवरण और क्लिप वाले लचीले तांबे के संयोजक तार।',
    'Lab reference visual · Insulated copper leads',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ತಾಮ್ರದ ಸಂಪರ್ಕ ತಂತಿ',
    'दृश्य संदर्भ · तांबे के संयोजक तार'
  ),
  bulb: makeVisual(
    'bulb',
    'Incandescent Laboratory Bulb',
    bulbImg,
    'Miniature glass filament bulb mounted on a brass screw-base laboratory lamp holder.',
    'ಹಿತ್ತಾಳೆ ಹೋಲ್ಡರ್ ಮೇಲೆ ಜೋಡಿಸಲಾದ ಸಣ್ಣ ಗಾಜಿನ ವಿದ್ಯುತ್ ಬಲ್ಬ್.',
    'पीतल के लैंप होल्डर पर लगा छोटा काँच का फिलामेंट बल्ब।',
    'Lab reference visual · Incandescent lab bulb',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಪ್ರಯೋಗಾಲಯ ವಿದ್ಯುತ್ ಬಲ್ಬ್',
    'दृश्य संदर्भ · प्रयोगशाला फिलामेंट बल्ब'
  ),
  switch: makeVisual(
    'switch',
    'Single-Pole Lab Knife Switch',
    switchImg,
    'Insulated-handle copper blade switch on a mounting block that opens or closes the metal contact.',
    'ಮಂಡಲವನ್ನು ತೆರೆಯುವ ಅಥವಾ ಮುಚ್ಚುವ ತಾಮ್ರದ ಸ್ವಿಚ್.',
    'परिपथ को खोलने या बंद करने वाला एकल-पोल तांबे का नाइफ़ स्विच।',
    'Lab reference visual · Single-pole lab switch',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಪ್ರಯೋಗಾಲಯದ ಸ್ವಿಚ್',
    'दृश्य संदर्भ · प्रयोगशाला परिपथ स्विच'
  ),
  electromagnet_coil: makeVisual(
    'electromagnet_coil',
    'Solenoid Electromagnet Coil',
    electromagnetImg,
    'Insulated copper wire wound tightly in cylindrical solenoid turns around a ferromagnetic steel nail core.',
    'ಕಬ್ಬಿಣದ ಕೋರ್ ಸುತ್ತಲೂ ಸುತ್ತಿದ ತಾಮ್ರದ ತಂತಿಯ ವಿದ್ಯುತ್ಕಾಂತ ಸುರುಳಿ.',
    'लोहे की कोर पर लिपटी तांबे के तार की परिनालिका कुंडली (विद्युतचुंबक)।',
    'Lab reference visual · Copper solenoid coil & iron core',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ವಿದ್ಯುತ್ಕಾಂತ ತಾಮ್ರದ ಸುರುಳಿ',
    'दृश्य संदर्भ · तांबे की परिनालिका व लौह कोर'
  ),
  current_direction: makeVisual(
    'current_direction',
    'Circuit Current Loop',
    electromagnetImg,
    'Closed copper conductor loop showing conventional current flow from battery (+) to (−) creating magnetic flux.',
    'ಧನ (+) ದಿಂದ ಋಣ (−) ತುದಿಯತ್ತ ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಹರಿಯುವ ಮುಚ್ಚಿದ ತಂತಿ ಪಥ.',
    'धनात्मक (+) से ऋणात्मक (−) टर्मिनल की ओर धारा प्रवाह दर्शाता बंद परिपथ।',
    'Lab reference visual · Closed circuit current & flux',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ವಿದ್ಯುತ್ ಪ್ರವಾಹ ದಿಕ್ಕು',
    'दृश्य संदर्भ · विद्युत धारा प्रवाह दिशा'
  ),
  magnet_body: makeVisual(
    'magnet_body',
    'Permanent Bar Magnet',
    barMagnetImg,
    'Rectangular Alnico bar magnet painted red at the North (N) end and dark slate at the South (S) end.',
    'ಕೆಂಪು ಉತ್ತರ (N) ಮತ್ತು ನೀಲಿ ದಕ್ಷಿಣ (S) ತುದಿಗಳಿರುವ ಆಯತಾಕಾರದ ದಂಡ ಅಯಸ್ಕಾಂತ.',
    'लाल उत्तरी (N) और नीले दक्षिणी (S) ध्रुव वाला आयताकार छड़ चुंबक।',
    'Lab reference visual · Permanent bar magnet (N / S)',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ದಂಡ ಅಯಸ್ಕಾಂತ (N / S)',
    'दृश्य संदर्भ · स्थायी छड़ चुंबक (N / S)'
  ),
  north_pole: makeVisual(
    'north_pole',
    'Magnet North Pole (N)',
    barMagnetImg,
    'Red-painted N pole tip of a permanent bar magnet from which magnetic field lines emerge externally.',
    'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಹೊರಹೊಮ್ಮುವ ಅಯಸ್ಕಾಂತದ ಕೆಂಪು ಉತ್ತರ (N) ತುದಿ.',
    'छड़ चुंबक का लाल उत्तरी (N) सिरा जहाँ से चुंबकीय क्षेत्र रेखाएँ बाहर निकलती हैं।',
    'Lab reference visual · Magnet North (N) end',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಅಯಸ್ಕಾಂತದ ಉತ್ತರ (N) ತುದಿ',
    'दृश्य संदर्भ · चुंबक का उत्तरी (N) सिरा'
  ),
  south_pole: makeVisual(
    'south_pole',
    'Magnet South Pole (S)',
    barMagnetImg,
    'Dark slate S pole end of a permanent bar magnet into which external magnetic field lines converge.',
    'ಬಾಹ್ಯ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಪ್ರವೇಶಿಸುವ ದಕ್ಷಿಣ (S) ತುದಿ.',
    'छड़ चुंबक का दक्षिणी (S) सिरा जहाँ बाहरी चुंबकीय क्षेत्र रेखाएँ प्रवेश करती हैं।',
    'Lab reference visual · Magnet South (S) end',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಅಯಸ್ಕಾಂತದ ದಕ್ಷಿಣ (S) ತುದಿ',
    'दृश्य संदर्भ · चुंबक का दक्षिणी (S) सिरा'
  ),
  field_lines: makeVisual(
    'field_lines',
    'Magnetic Field Lines (Iron Filings Pattern)',
    ironFilingsImg,
    'Fine iron filings scattered on a glass sheet over a bar magnet reveal closed dipole magnetic field loops.',
    'ದಂಡ ಅಯಸ್ಕಾಂತದ ಮೇಲಿನ ಗಾಜಿನ ಹಾಳೆಯ ಮೇಲೆ ಹರಡಿದ ಕಬ್ಬಿಣದ ಚೂರುಗಳು ತೋರಿಸುವ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು.',
    'काँच की प्लेट पर लोहे के बुरादे से दिखती हुई छड़ चुंबक की चुंबकीय क्षेत्र रेखाएँ।',
    'Lab reference visual · Iron filings dipole field lines',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಕಬ್ಬಿಣದ ಚೂರುಗಳ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು',
    'दृश्य संदर्भ · लौह चूर्ण द्वारा चुंबकीय क्षेत्र रेखाएँ'
  ),
  field_direction_arrows: makeVisual(
    'field_direction_arrows',
    'Magnetic Field Vector Orientation',
    ironFilingsImg,
    'Tangent magnetic flux curves emerging from North (N) and entering South (S) visualized with iron filings.',
    'ಉತ್ತರ ಧ್ರುವದಿಂದ ಹೊರಟು ದಕ್ಷಿಣ ಧ್ರುವಕ್ಕೆ ಬಾಗುವ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ದಿಕ್ಕು.',
    'उत्तरी ध्रुव से निकलकर दक्षिणी ध्रुव में प्रवेश करती चुंबकीय क्षेत्र दिशा।',
    'Lab reference visual · Dipole field tangent flow (N → S)',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಕ್ಷೇತ್ರ ದಿಕ್ಕಿನ ಹರಿವು (N → S)',
    'दृश्य संदर्भ · चुंबकीय क्षेत्र स्पर्शरेखा दिशा (N → S)'
  ),
  compass_needle: makeVisual(
    'compass_needle',
    'Pivoted Magnetic Compass',
    compassImg,
    'Circular degree dial housing a balanced magnetized pointer with a painted red North-seeking tip.',
    'ಕೆಂಪು ಉತ್ತರ ದಿಕ್ಕು ಸೂಚಿಸುವ ಸಮತೋಲಿತ ಸೂಜಿ ಹೊಂದಿರುವ ದಿಕ್ಸೂಚಿ.',
    'डिग्री डायल और लाल उत्तर-सूंई वाला चुंबकीय दिक्सूचक।',
    'Lab reference visual · Pivoted magnetic compass',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಕಾಂತೀಯ ದಿಕ್ಸೂಚಿ',
    'दृश्य संदर्भ · चुंबकीय दिक्सूचक (कंपास)'
  ),
  compass_pivot: makeVisual(
    'compass_pivot',
    'Compass Jewel Pivot',
    compassImg,
    'Low-friction central vertical pin bearing supporting the compass needle so it turns freely.',
    'ದಿಕ್ಸೂಚಿ ಸೂಜಿ ಮುಕ್ತವಾಗಿ ತಿರುಗಲು ಸಹಾಯ ಮಾಡುವ ಕಡಿಮೆ ಘರ್ಷಣೆಯ ಕೀಲು.',
    'कंपास सुई को स्वतंत्र रूप से घूमने देने वाला कम घर्षण वाला केंद्रीय धुराग्र।',
    'Lab reference visual · Low-friction compass pivot',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ದಿಕ್ಸೂಚಿ ಕೀಲು ಆಧಾರ',
    'दृश्य संदर्भ · दिक्सूचक धुराग्र (Pivot)'
  ),
  mirror: makeVisual(
    'mirror',
    'Optical Plane Mirror',
    planeMirrorImg,
    'Flat silvered glass plane mirror mounted upright in a wooden/brass stand for angle-of-reflection experiments.',
    'ಪ್ರತಿಫಲನ ನಿಯಮಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಸ್ಟ್ಯಾಂಡ್‌ನಲ್ಲಿ ಇರಿಸಿದ ಸಮತಲ ದರ್ಪಣ.',
    'परावर्तन के नियमों के प्रयोग के लिए स्टैंड में लगा समतल दर्पण।',
    'Lab reference visual · Optical plane mirror in stand',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಸಮತಲ ದರ್ಪಣ',
    'दृश्य संदर्भ · समतल दर्पण (Plane Mirror)'
  ),
  convex_mirror: makeVisual(
    'convex_mirror',
    'Spherical Convex Mirror',
    convexMirrorImg,
    'Outward-bulging spherical mirror in a lab stand producing a wide, upright, diminished reflection.',
    'ಹೊರಕ್ಕೆ ಉಬ್ಬಿದ ಪ್ರತಿಫಲಿಸುವ ಮೇಲ್ಮೈ ಹೊಂದಿರುವ ಪೀನ ದರ್ಪಣ.',
    'बाहर की ओर उभरा परावर्तक पृष्ठ वाला उत्तल दर्पण।',
    'Lab reference visual · Outward-curved convex mirror',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಹೊರಕ್ಕೆ ಬಾಗಿದ ಪೀನ ದರ್ಪಣ',
    'दृश्य संदर्भ · बाहर उभरा उत्तल दर्पण'
  ),
  concave_mirror: makeVisual(
    'concave_mirror',
    'Spherical Concave Mirror',
    concaveMirrorImg,
    'Inward-hollowed spherical concave dish mirror held on a laboratory stand for converging light.',
    'ಒಳಕ್ಕೆ ಬಾಗಿದ ಪ್ರತಿಫಲಿಸುವ ಮೇಲ್ಮೈ ಹೊಂದಿರುವ ನಿಮ್ನ ದರ್ಪಣ.',
    'अंदर की ओर धंसा परावर्तक पृष्ठ वाला अवतल दर्पण।',
    'Lab reference visual · Inward-curved concave mirror',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಒಳಕ್ಕೆ ಬಾಗಿದ ನಿಮ್ನ ದರ್ಪಣ',
    'दृश्य संदर्भ · अंदर धंसा अवतल दर्पण'
  ),
  convex_lens: makeVisual(
    'convex_lens',
    'Biconvex Glass Lens',
    convexLensImg,
    'Double-convex glass optical lens thicker in the middle than at its rim, mounted on a lab bench.',
    'ಮಧ್ಯದಲ್ಲಿ ದಪ್ಪವಾಗಿರುವ ದ್ವಿ-ಪೀನ ಗಾಜಿನ ಮಸೂರ.',
    'बीच से मोटा द्वि-उत्तल काँच का लेंस।',
    'Lab reference visual · Biconvex glass lens (converging)',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಗಾಜಿನ ದ್ವಿ-ಪೀನ ಮಸೂರ',
    'दृश्य संदर्भ · द्वि-उत्तल काँच का लेंस'
  ),
  concave_lens: makeVisual(
    'concave_lens',
    'Biconcave Glass Lens',
    concaveLensImg,
    'Double-concave glass optical lens thinner at the center and thicker at the edges, used to diverge rays.',
    'ಮಧ್ಯದಲ್ಲಿ ತೆಳುವಾಗಿ ಅಂಚಿನಲ್ಲಿ ದಪ್ಪವಾಗಿರುವ ದ್ವಿ-ನಿಮ್ನ ಗಾಜಿನ ಮಸೂರ.',
    'बीच से पतला और किनारों से मोटा द्वि-अवतल काँच का लेंस।',
    'Lab reference visual · Biconcave glass lens (diverging)',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಗಾಜಿನ ದ್ವಿ-ನಿಮ್ನ ಮಸೂರ',
    'दृश्य संदर्भ · द्वि-अवतल काँच का लेंस'
  ),
  glass_slab: makeVisual(
    'glass_slab',
    'Rectangular Optical Glass Slab',
    glassSlabImg,
    'Thick rectangular crown glass block bending an oblique laser ray toward the normal and emerging parallel.',
    'ಬೆಳಕಿನ ಕಿರಣವನ್ನು ವಕ್ರೀಭವಿಸುವ ಆಯತಾಕಾರದ ಗಾಜಿನ ಸ್ಲ್ಯಾಬ್.',
    'तिरछी प्रकाश किरण को अपवर्तित करने वाला आयताकार काँच का स्लैब।',
    'Lab reference visual · Rectangular glass slab refraction',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಆಯತಾಕಾರದ ಗಾಜಿನ ಸ್ಲ್ಯಾಬ್ ವಕ್ರೀಭವನ',
    'दृश्य संदर्भ · आयताकार काँच का गुटका अपवर्तन'
  ),
  prism: makeVisual(
    'prism',
    'Triangular Glass Prism',
    glassPrismImg,
    'Equilateral optical flint glass prism dispersing white light into a continuous seven-color spectrum.',
    'ಬಿಳಿ ಬೆಳಕನ್ನು ಕಾಮನಬಿಲ್ಲಿನ ಬಣ್ಣಗಳಾಗಿ ವಿಭಜಿಸುವ ಗಾಜಿನ ಪ್ರಿಸಂ.',
    'श्वेत प्रकाश को इंद्रधनुषी वर्णक्रम में विभक्त करने वाला काँच का प्रिज्म।',
    'Lab reference visual · Triangular glass prism dispersion',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಗಾಜಿನ ಪ್ರಿಸಂ ಬೆಳಕಿನ ವರ್ಣವಿಭಜನೆ',
    'दृश्य संदर्भ · काँच के प्रिज्म द्वारा वर्ण विक्षेपण'
  ),
  incident_ray: makeVisual(
    'incident_ray',
    'Incident Light Beam',
    glassSlabImg,
    'Collimated narrow light beam striking the optical mirror or glass boundary at angle of incidence θᵢ.',
    'ದರ್ಪಣ ಅಥವಾ ಗಾಜಿನ ಮೇಲ್ಮೈಯನ್ನು θᵢ ಕೋನದಲ್ಲಿ ತಾಕುವ ಪತನ ಕಿರಣ.',
    'दर्पण या काँच के पृष्ठ पर आपतन कोण θᵢ से टकराने वाली आपतित किरण।',
    'Lab reference visual · Incident optical ray beam',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಪತನ ಬೆಳಕಿನ ಕಿರಣ',
    'दृश्य संदर्भ · आपतित प्रकाश किरण'
  ),
  reflected_ray: makeVisual(
    'reflected_ray',
    'Reflected Light Ray',
    planeMirrorImg,
    'Light beam bouncing back from the reflecting surface with angle of reflection θᵣ equal to θᵢ.',
    'ಪ್ರತಿಫಲಿಸುವ ಮೇಲ್ಮೈಯಿಂದ θᵣ = θᵢ ಕೋನದಲ್ಲಿ ಹಿಂದಿರುಗುವ ಪ್ರತಿಫಲಿತ ಕಿರಣ.',
    'परावर्तक पृष्ठ से θᵣ = θᵢ कोण पर वापस लौटने वाली परावर्तित किरण।',
    'Lab reference visual · Reflected light path',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಪ್ರತಿಫಲಿತ ಕಿರಣ',
    'दृश्य संदर्भ · परावर्तित प्रकाश किरण'
  ),
  refracted_ray: makeVisual(
    'refracted_ray',
    'Refracted Light Ray',
    glassSlabImg,
    'Light ray bending at the air-glass interface according to Snell’s Law (n₁ sin θᵢ = n₂ sin θₜ).',
    'ಸ್ನೆಲ್ ನಿಯಮದಂತೆ ಗಾಳಿ-ಗಾಜಿನ ಸೀಮೆಯಲ್ಲಿ ಬಾಗುವ ವಕ್ರೀಭವನ ಕಿರಣ.',
    'स्नेल के नियम के अनुसार वायु-काँच सीमा पर मुड़ने वाली अपवर्तित किरण।',
    'Lab reference visual · Refracted ray inside glass',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ವಕ್ರೀಭವಿತ ಬೆಳಕಿನ ಕಿರಣ',
    'दृश्य संदर्भ · काँच के भीतर अपवर्तित किरण'
  ),
  normal: makeVisual(
    'normal',
    'Surface Normal Line',
    planeMirrorImg,
    'Imaginary perpendicular line (90°) drawn at the point of incidence from which angles θᵢ and θᵣ are measured.',
    'ಪತನ ಬಿಂದುವಿನಲ್ಲಿ ಮೇಲ್ಮೈಗೆ 90° ಲಂಬವಾಗಿ ಎಳೆಯುವ ರೇಖೆ (Normal).',
    'आपतन बिंदु पर सतह से 90° लंबवत खींची गई अभिलंब रेखा।',
    'Lab reference visual · 90° optical surface reference',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಲಂಬ ರೇಖೆ (90°)',
    'दृश्य संदर्भ · अभिलंब संदर्भ (90°)'
  ),
  moving_body: makeVisual(
    'moving_body',
    'Dynamics Lab Trolley Cart',
    kinematicsCartImg,
    'Low-friction wooden and brass dynamics cart rolling smoothly along a graduated metre ruler track.',
    'ಅಳತೆ ಪಟ್ಟಿಯ ಮೇಲೆ ಸುಲಭವಾಗಿ ಚಲಿಸುವ ಪ್ರಯೋಗಾಲಯದ ಟ್ರಾಲಿ ಗಾಡಿ.',
    'मापित ट्रैक पर कम घर्षण के साथ चलती प्रयोगशाला ट्रॉली कार्ट।',
    'Lab reference visual · Dynamics cart on graduated track',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಚಲನಶಾಸ್ತ್ರ ಟ್ರಾಲಿ ಗಾಡಿ',
    'दृश्य संदर्भ · गतिकी ट्रॉली और ट्रैक'
  ),
  reference_origin: makeVisual(
    'reference_origin',
    'Graduated Metre Track Origin (x = 0)',
    kinematicsCartImg,
    'Zero-centimetre reference datum on the aluminium metre ruler track used to measure position and displacement.',
    'ಸ್ಥಾನ ಮತ್ತು ಸ್ಥಾನಪಲ್ಲಟವನ್ನು ಅಳೆಯಲು ಬಳಸುವ ಟ್ರ್ಯಾಕ್‌ನ ಆರಂಭಿಕ ಬಿಂದು (0 m).',
    'स्थिति और विस्थापन मापने के लिए मीटर स्केल ट्रैक का शून्य संदर्भ बिंदु।',
    'Lab reference visual · Calibrated metre track origin',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಮೀಟರ್ ಪಟ್ಟಿಯ ಆರಂಭಿಕ ಬಿಂದು',
    'दृश्य संदर्भ · मापित मीटर स्केल उद्गम'
  ),
  distance_path: makeVisual(
    'distance_path',
    'Graduated Motion Track (Total Path)',
    kinematicsCartImg,
    'Full physical path traced along the graduated ruler track measuring total path length covered.',
    'ಚಲಿಸುವ ವಸ್ತು ಕ್ರಮಿಸಿದ ಒಟ್ಟು ದೂರದ ಪಥ.',
    'वस्तु द्वारा तय की गई कुल दूरी को दर्शाता मापित पथ।',
    'Lab reference visual · Graduated distance track',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಕ್ರಮಿಸಿದ ದೂರದ ಪಥ',
    'दृश्य संदर्भ · तय कुल दूरी का ट्रैक'
  ),
  displacement_vector: makeVisual(
    'displacement_vector',
    'Displacement Vector',
    kinematicsCartImg,
    'Direct straight-line change in position measured from the 0 m start mark to the cart’s current mark.',
    'ಆರಂಭಿಕ ಬಿಂದುವಿನಿಂದ ಪ್ರಸ್ತುತ ಸ್ಥಾನದವರೆಗಿನ ನೇರ ಸ್ಥಾನಪಲ್ಲಟ.',
    'प्रारंभिक बिंदु से वर्तमान स्थिति तक सीधी रेखा में विस्थापन।',
    'Lab reference visual · Start-to-position displacement',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ನೇರ ಸ್ಥಾನಪಲ್ಲಟ ಸದಿಶ',
    'दृश्य संदर्भ · सीधा विस्थापन सदिश'
  ),
  velocity_vector: makeVisual(
    'velocity_vector',
    'Instantaneous Velocity',
    kinematicsCartImg,
    'Speed and forward direction of the rolling trolley at a given instant along the track.',
    'ನಿರ್ದಿಷ್ಟ ಕ್ಷಣದಲ್ಲಿ ಟ್ರಾಲಿಯ ವೇಗ ಮತ್ತು ಚಲನೆಯ ದಿಕ್ಕು.',
    'किसी क्षण ट्रॉली की चाल और गति की दिशा।',
    'Lab reference visual · Trolley velocity along track',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ತತ್‌ಕ್ಷಣದ ವೇಗ',
    'दृश्य संदर्भ · तात्कालिक वेग सदिश'
  ),
  motion_graph: makeVisual(
    'motion_graph',
    'Kinematics Position & Velocity Data',
    kinematicsCartImg,
    'Real-time distance-time and velocity-time readings recorded from trolley positions along the metre rail.',
    'ಮೀಟರ್ ಪಟ್ಟಿಯ ಮೇಲೆ ದಾಖಲಾದ ದೂರ-ಸಮಯ ಮತ್ತು ವೇಗ-ಸಮಯ ಗ್ರಾಫ್.',
    'मीटर ट्रैक की स्थितियों से प्राप्त दूरी-समय और वेग-समय ग्राफ़।',
    'Lab reference visual · Motion track telemetry',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಚಲನೆಯ ಗ್ರಾಫ್ ದತ್ತಾಂಶ',
    'दृश्य संदर्भ · गति-समय ग्राफ़ डेटा'
  ),
  test_block: makeVisual(
    'test_block',
    'Density & Force Test Block',
    buoyancyBalanceImg,
    'Calibrated solid block suspended from a spring balance to measure weight, sliding friction, and buoyant upthrust.',
    'ತೂಕ, ಘರ್ಷಣೆ ಮತ್ತು ಪ್ಲವನಶೀಲತೆಯನ್ನು ಪರೀಕ್ಷಿಸುವ ಸಾಂದ್ರತೆ ಬ್ಲಾಕ್.',
    'भार, घर्षण और उत्प्लावन बल मापने के लिए स्प्रिंग तुला से लटका ठोस गुटका।',
    'Lab reference visual · Density block & spring balance',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಪರೀಕ್ಷಾ ಬ್ಲಾಕ್ ಮತ್ತು ಸ್ಪ್ರಿಂಗ್ ತಕ್ಕಡಿ',
    'दृश्य संदर्भ · घनत्व गुटका व कमानी तुला'
  ),
  surface_or_fluid: makeVisual(
    'surface_or_fluid',
    'Graduated Fluid Column / Test Surface',
    buoyancyBalanceImg,
    'Graduated glass beaker of fluid supporting submerged blocks via Archimedes upthrust, or friction test plane.',
    'ಪ್ಲವನ ಬಲವನ್ನು ಒದಗಿಸುವ ಅಳತೆ ಜಾಡಿಯ ದ್ರವ ಅಥವಾ ಘರ್ಷಣಾ ಮೇಲ್ಮೈ.',
    'उत्प्लावन बल देने वाला मापित द्रव स्तंभ या घर्षण परीक्षण सतह।',
    'Lab reference visual · Graduated fluid beaker column',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ದ್ರವ ಮಾಪನ ಜಾಡಿ / ಮೇಲ್ಮೈ',
    'दृश्य संदर्भ · अंशांकित द्रव बीकर स्तंभ'
  ),
  applied_force_arrow: makeVisual(
    'applied_force_arrow',
    'Applied Force (Spring Balance Pull)',
    buoyancyBalanceImg,
    'External push or gravitational pull measured in Newtons (N) with a calibrated spring dynamometer.',
    'ನ್ಯೂಟನ್‌ಗಳಲ್ಲಿ (N) ಅಳೆಯುವ ಬಾಹ್ಯ ತಳ್ಳುವಿಕೆ ಅಥವಾ ಗುರುತ್ವಾಕರ್ಷಣ ತೂಕ.',
    'कमानी तुला द्वारा न्यूटन (N) में मापा गया बाह्य बल या भार।',
    'Lab reference visual · Calibrated Newton spring scale',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ನ್ಯೂಟನ್ ಸ್ಪ್ರಿಂಗ್ ತಕ್ಕಡಿ ಬಲ',
    'दृश्य संदर्भ · न्यूटन कमानी तुला बल'
  ),
  friction_force_arrow: makeVisual(
    'friction_force_arrow',
    'Opposing Friction Force',
    buoyancyBalanceImg,
    'Surface resistance opposing motion along the contact boundary, quantified using F_s ≤ μN.',
    'ಚಲನೆಯನ್ನು ವಿರೋಧಿಸುವ ಮೇಲ್ಮೈ ಘರ್ಷಣಾ ಬಲ.',
    'संपर्क सतह पर गति का विरोध करने वाला घर्षण बल।',
    'Lab reference visual · Force balance measurement',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಘರ್ಷಣಾ ಬಲ ಮಾಪನ',
    'दृश्य संदर्भ · घर्षण बल मापन'
  ),
  buoyancy_arrow: makeVisual(
    'buoyancy_arrow',
    'Archimedes Upthrust (Buoyant Force)',
    buoyancyBalanceImg,
    'Upward buoyant force equal to the weight of displaced fluid, reducing apparent reading on the spring balance.',
    'ಸ್ಥಳಾಂತರಗೊಂಡ ದ್ರವದ ತೂಕಕ್ಕೆ ಸಮನಾದ ಮೇಲ್ಮುಖ ಪ್ಲವನ ಬಲ.',
    'विस्थापित द्रव के भार के बराबर ऊपर की ओर लगने वाला उत्प्लावन बल।',
    'Lab reference visual · Apparent weight loss in water',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ನೀರಿನಲ್ಲಿ ಪ್ಲವನ ಬಲ',
    'दृश्य संदर्भ · जल में उत्प्लावन बल'
  ),
  pulley_wheel: makeVisual(
    'pulley_wheel',
    'Brass Fixed & Block Pulley Rig',
    pulleyLeverImg,
    'Grooved brass pulley wheel on a retort stand guiding taut cord attached to slotted brass masses.',
    'ಭಾರ ಎತ್ತಲು ದಿಕ್ಕು ಮತ್ತು ಬಲದ ಅನುಕೂಲ ನೀಡುವ ಹಿತ್ತಾಳೆ ಕಪ್ಪಿ ಚಕ್ರ.',
    'डोरी और भार उठाने के लिए स्टैंड पर लगी पीतल की घिरनी (Pulley)।',
    'Lab reference visual · Brass pulley with slotted weights',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಹಿತ್ತಾಳೆ ಕಪ್ಪಿ ಮತ್ತು ತೂಕದ ಬಟ್ಟುಗಳು',
    'दृश्य संदर्भ · पीतल की घिरनी व बाट'
  ),
  fulcrum_pivot: makeVisual(
    'fulcrum_pivot',
    'Triangular Fulcrum & Lever Beam',
    pulleyLeverImg,
    'Balanced wooden ruler lever pivoting on a triangular fulcrum prism to multiply effort torque.',
    'ಯಾಂತ್ರಿಕ ಅನುಕೂಲ ಪಡೆಯಲು ತ್ರಿಕೋನಾಕಾರದ ಆಧಾರದ ಮೇಲೆ ಸಮತೋಲನಗೊಂಡ ಸನ್ನೆಕೋಲು.',
    'त्रिभुजाकार आलंब (Fulcrum) पर संतुलित लकड़ी का उत्तोलक।',
    'Lab reference visual · Ruler lever on triangular fulcrum',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ತ್ರಿಕೋನ ಆಧಾರದ ಸನ್ನೆಕೋಲು',
    'दृश्य संदर्भ · आलंब व उत्तोलक प्रणाली'
  ),
  energy_bob: makeVisual(
    'energy_bob',
    'Suspended Brass Load / Pendulum Mass',
    pulleyLeverImg,
    'Slotted brass mass converting gravitational potential energy (mgh) and kinetic energy (½mv²).',
    'ಸ್ಥಿತಿಜ ಶಕ್ತಿ ಮತ್ತು ಚಲನ ಶಕ್ತಿಯ ನಡುವೆ ಪರಿವರ್ತನೆಗೊಳ್ಳುವ ಹಿತ್ತಾಳೆ ತೂಕದ ಬಟ್ಟು.',
    'स्थितिज ऊर्जा और गतिज ऊर्जा रूपांतरण करने वाला पीतल का भार।',
    'Lab reference visual · Slotted brass mass load',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ತೂಕದ ಹಿತ್ತಾಳೆ ಬಟ್ಟು',
    'दृश्य संदर्भ · पीतल का लटकता भार'
  ),
  track_height_marker: makeVisual(
    'track_height_marker',
    'Vertical Height Reference (h₀)',
    pulleyLeverImg,
    'Initial release height above the datum storing gravitational potential energy E_p = mgh.',
    'ಗುರುತ್ವಾಕರ್ಷಣ ಸ್ಥಿತಿಜ ಶಕ್ತಿ mgh ಅನ್ನು ನಿರ್ಧರಿಸುವ ಆರಂಭಿಕ ಎತ್ತರ.',
    'गुरुत्वीय स्थितिज ऊर्जा mgh निर्धारित करने वाली प्रारंभिक ऊँचाई।',
    'Lab reference visual · Vertical height & energy datum',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಎತ್ತರದ ಆಧಾರ ಮಟ್ಟ',
    'दृश्य संदर्भ · प्रारंभिक ऊँचाई संदर्भ'
  ),
  ke_pe_meter: makeVisual(
    'ke_pe_meter',
    'Mechanical Energy Balance',
    pulleyLeverImg,
    'Work-energy accounting showing total mechanical energy split cleanly between KE, PE, and friction heat.',
    'ಚಲನ ಶಕ್ತಿ (KE), ಸ್ಥಿತಿಜ ಶಕ್ತಿ (PE) ಮತ್ತು ಶಾಖದ ನಡುವಿನ ಶಕ್ತಿ ಹಂಚಿಕೆ.',
    'गतिज ऊर्जा (KE), स्थितिज ऊर्जा (PE) और ऊष्मा का संतुलन।',
    'Lab reference visual · Lever & pulley work-energy bench',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಯಾಂತ್ರಿಕ ಶಕ್ತಿ ಸಮತೋಲನ',
    'दृश्य संदर्भ · यांत्रिक ऊर्जा संतुलन'
  ),
  heat_source: makeVisual(
    'heat_source',
    'Alcohol Spirit Laboratory Burner',
    thermometerHeatImg,
    'Glass spirit burner heating water inside a borosilicate beaker over a wire-gauze tripod stand.',
    'ಬೀಕರ್‌ನಲ್ಲಿರುವ ನೀರನ್ನು ಕಾಯಿಸುವ ಸ್ಪಿರಿಟ್ ದೀಪದ ಶಾಖ ಮೂಲ.',
    'बीकर के जल को गर्म करने वाला प्रयोगशाला स्पिरिट लैंप ऊष्मा स्रोत।',
    'Lab reference visual · Spirit burner & tripod heat source',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಸ್ಪಿರಿಟ್ ಬರ್ನರ್ ಶಾಖ ಮೂಲ',
    'दृश्य संदर्भ · स्पिरिट लैंप ऊष्मा स्रोत'
  ),
  thermometer_probe: makeVisual(
    'thermometer_probe',
    'Calibrated Lab Glass Thermometer',
    thermometerHeatImg,
    'Celsius-graduated glass laboratory thermometer clamped vertically with its red bulb immersed in water.',
    'ನೀರಿನ ತಾಪಮಾನವನ್ನು ಅಳೆಯುವ ಮಾಪಾಂಕಿತ ಗಾಜಿನ ತಾಪಮಾಪಕ.',
    'जल का तापमान मापने वाला अंशांकित काँच का प्रयोगशाला थर्मामीटर।',
    'Lab reference visual · Calibrated laboratory thermometer',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಪ್ರಯೋಗಾಲಯದ ತಾಪಮಾಪಕ',
    'दृश्य संदर्भ · प्रयोगशाला थर्मामीटर'
  ),
  conducting_rod: makeVisual(
    'conducting_rod',
    'Thermal Conduction Apparatus',
    thermometerHeatImg,
    'Metal and glass lab vessels demonstrating differences in thermal conductivity across materials.',
    'ವಿವಿಧ ವಸ್ತುಗಳಲ್ಲಿ ಶಾಖ ವಹನ ದರವನ್ನು ತೋರಿಸುವ ಪ್ರಯೋಗ ಸಲಕರಣೆ.',
    'विभिन्न पदार्थों में ऊष्मा चालकता दर्शाने वाला तापीय उपकरण।',
    'Lab reference visual · Thermal heating & conduction bench',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಶಾಖ ವಹನ ಉಪಕರಣ',
    'दृश्य संदर्भ · ऊष्मा चालन उपकरण'
  ),
  convection_fluid: makeVisual(
    'convection_fluid',
    'Convection Water Beaker',
    thermometerHeatImg,
    'Clear borosilicate water beaker where warmed lower fluid becomes less dense and rises in convection currents.',
    'ಬಿಸಿಯಾದ ನೀರು ಮೇಲೇರಿ ತಂಪಾದ ನೀರು ಕೆಳಗಿಳಿಯುವ ಸಂವಹನ ಬೀಕರ್.',
    'जहाँ गर्म जल ऊपर उठता और ठंडा जल नीचे आता है — संवहन बीकर।',
    'Lab reference visual · Water convection beaker',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಸಂವಹನ ನೀರಿನ ಬೀಕರ್',
    'दृश्य संदर्भ · जल संवहन बीकर'
  ),
  radiating_surface: makeVisual(
    'radiating_surface',
    'Thermal Radiation Surface',
    thermometerHeatImg,
    'Heated vessel radiating infrared thermal energy outward even without direct fluid contact.',
    'ನೇರ ಸಂಪರ್ಕವಿಲ್ಲದೆಯೇ ವಿಕಿರಣದ ಮೂಲಕ ಶಾಖವನ್ನು ಹೊರಸೂಸುವ ಮೇಲ್ಮೈ.',
    'बिना सीधे संपर्क के ऊष्मीय विकिरण उत्सर्जित करने वाली गर्म सतह।',
    'Lab reference visual · Thermal radiation heating setup',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಶಾಖ ವಿಕಿರಣ ಮೇಲ್ಮೈ',
    'दृश्य संदर्भ · ऊष्मीय विकिरण सतह'
  ),
  vibrating_source: makeVisual(
    'vibrating_source',
    'Steel Tuning Fork & Resonance Box',
    tuningForkImg,
    'Chrome steel acoustic tuning fork mounted on a hollow wooden sounding box with rubber striker mallet.',
    'ಮರದ ಪ್ರತಿಧ್ವನಿ ಪೆಟ್ಟಿಗೆಯ ಮೇಲೆ ಜೋಡಿಸಿದ ಉಕ್ಕಿನ ಶ್ರುತಿ ಕವಲು (Tuning Fork).',
    'लकड़ी के अनुनाद बॉक्स पर लगा इस्पात का स्वरित्र द्विभुज (Tuning Fork)।',
    'Lab reference visual · Steel tuning fork & resonator box',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಶ್ರುತಿ ಕವಲು ಮತ್ತು ಮರದ ಪೆಟ್ಟಿಗೆ',
    'दृश्य संदर्भ · स्वरित्र द्विभुज (Tuning Fork)'
  ),
  wave: makeVisual(
    'wave',
    'Acoustic Longitudinal Sound Wave',
    tuningForkImg,
    'Sound waves produced by vibrating prongs travelling through air as alternating compressions and rarefactions.',
    'ಕಂಪಿಸುವ ಶ್ರುತಿ ಕವಲಿನಿಂದ ಗಾಳಿಯಲ್ಲಿ ಹರಡುವ ಶಬ್ದ ತರಂಗಗಳು.',
    'कंपित स्वरित्र द्विभुज से वायु में संपीड़न व विरलन के रूप में चलती ध्वनि तरंगें।',
    'Lab reference visual · Acoustic wave generator',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಶಬ್ದ ತರಂಗ ಉತ್ಪಾದಕ',
    'दृश्य संदर्भ · ध्वनि तरंग स्रोत'
  ),
  compression: makeVisual(
    'compression',
    'High-Pressure Compression Zone',
    tuningForkImg,
    'Region in front of a vibrating tuning fork prong where air molecules are momentarily crowded together.',
    'ಕಂಪಿಸುವ ತೋಳಿನ ಮುಂದೆ ಗಾಳಿಯ ಕಣಗಳು ಒತ್ತಾಗಿ ಸೇರುವ ಸಂಕೋಚನ (Compression) ವಲಯ.',
    'स्वरित्र की कंपित भुजा के आगे वायु अणुओं के उच्च दाब वाला संपीड़न क्षेत्र।',
    'Lab reference visual · Tuning fork pressure pulse',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಶಬ್ದ ಸಂಕೋಚನ ವಲಯ',
    'दृश्य संदर्भ · ध्वनि संपीड़न क्षेत्र'
  ),
  rarefaction: makeVisual(
    'rarefaction',
    'Low-Pressure Rarefaction Zone',
    tuningForkImg,
    'Lower-pressure spacing behind an inward-moving tuning fork prong where medium particles spread apart.',
    'ಗಾಳಿಯ ಕಣಗಳು ದೂರ ಸರಿಯುವ ಕಡಿಮೆ ಒತ್ತಡದ ವಿರಳನ (Rarefaction) ವಲಯ.',
    'भुजा के पीछे लौटते समय वायु अणुओं के निम्न दाब वाला विरलन क्षेत्र।',
    'Lab reference visual · Tuning fork rarefaction cycle',
    'ದೃಶ್ಯ ಉಲ್ಲೇಖ · ಶಬ್ದ ವಿರಳನ ವಲಯ',
    'दृश्य संदर्भ · ध्वनि विरलन क्षेत्र'
  ),
};

export function normalizeComponentVisualId(componentId?: string | null): string | null {
  if (!componentId) return null;
  const cleaned = componentId.trim().toLowerCase();
  if (!cleaned) return null;
  return COMPONENT_ID_ALIASES[cleaned] || cleaned;
}

export function getComponentRealWorldVisual(
  componentId?: string | null,
  engineFallback?: SimulationEngineId,
  preset?: string
): ComponentRealWorldVisual | null {
  const canonicalId = normalizeComponentVisualId(componentId);
  if (canonicalId && COMPONENT_VISUAL_MAP[canonicalId]) {
    return COMPONENT_VISUAL_MAP[canonicalId];
  }
  if (engineFallback) {
    return getExperimentRealWorldVisual(engineFallback, preset);
  }
  return null;
}

export function getExperimentRealWorldVisual(
  engineId?: SimulationEngineId | null,
  preset?: string
): ComponentRealWorldVisual {
  if (engineId === 'optics_ray_lab') {
    if (preset === 'glass_slab') return COMPONENT_VISUAL_MAP.glass_slab;
    if (preset === 'prism_dispersion') return COMPONENT_VISUAL_MAP.prism;
    if (preset === 'concave_mirror_image') return COMPONENT_VISUAL_MAP.concave_mirror;
    if (preset === 'convex_mirror_image') return COMPONENT_VISUAL_MAP.convex_mirror;
    if (preset === 'concave_lens_image') return COMPONENT_VISUAL_MAP.concave_lens;
    if (preset === 'convex_lens_image' || preset === 'spherical_mirror_lens') {
      return COMPONENT_VISUAL_MAP.convex_lens;
    }
    return COMPONENT_VISUAL_MAP.mirror;
  }
  if (engineId === 'electric_circuit_lab') {
    if (preset === 'electromagnet' || preset === 'solenoid_class10') {
      return COMPONENT_VISUAL_MAP.electromagnet_coil;
    }
    return COMPONENT_VISUAL_MAP.bulb;
  }
  if (engineId === 'motion_kinematics') return COMPONENT_VISUAL_MAP.moving_body;
  if (engineId === 'force_friction_buoyancy') return COMPONENT_VISUAL_MAP.test_block;
  if (engineId === 'simple_machines_energy') return COMPONENT_VISUAL_MAP.pulley_wheel;
  if (engineId === 'heat_transfer_lab') return COMPONENT_VISUAL_MAP.thermometer_probe;
  if (engineId === 'sound_wave_lab') return COMPONENT_VISUAL_MAP.vibrating_source;
  return COMPONENT_VISUAL_MAP.magnet_body;
}

export function getDynamicExperimentVisual(
  visualAssetKey?: string | null,
  templateId?: string
): ComponentRealWorldVisual {
  const canonical = normalizeComponentVisualId(visualAssetKey);
  if (canonical && COMPONENT_VISUAL_MAP[canonical]) {
    return COMPONENT_VISUAL_MAP[canonical];
  }
  switch (templateId) {
    case 'optics_ray_model':
      return COMPONENT_VISUAL_MAP.convex_lens;
    case 'dc_circuit_model':
      return COMPONENT_VISUAL_MAP.resistor;
    case 'magnetic_dipole_3d':
      return COMPONENT_VISUAL_MAP.magnet_body;
    case 'wave_acoustics':
      return COMPONENT_VISUAL_MAP.vibrating_source;
    case 'thermal_calorimetry':
      return COMPONENT_VISUAL_MAP.thermometer_probe;
    case 'buoyancy_pressure':
      return COMPONENT_VISUAL_MAP.buoyancy_arrow;
    case 'inclined_plane_forces':
      return COMPONENT_VISUAL_MAP.test_block;
    case 'lever_pulley_energy':
      return COMPONENT_VISUAL_MAP.fulcrum_pivot;
    case 'projectile_motion':
      return COMPONENT_VISUAL_MAP.moving_body;
    case 'spring_oscillation':
    case 'pendulum_shm':
    default:
      return COMPONENT_VISUAL_MAP.energy_bob;
  }
}

