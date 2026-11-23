import type { LanguageCode } from '../../types/physics';
import type {
  ComponentExplanationContent,
  ComponentIconKey,
  RegisteredSimulationComponent,
  SimulationComponentRegistryEntry,
} from './types';
import { FUTURE_SIMULATION_ENTRIES } from './futureSimulationComponents';

function makeComponent(
  simulationId: string,
  id: string,
  iconKey: ComponentIconKey,
  names: Record<LanguageCode, string>,
  ident: Record<LanguageCode, string>,
  definition: string,
  characteristics: string,
  fnDesc: string,
  props: string,
  behaviour: string,
  rel: string,
  example: string,
  whyItMatters: string
): RegisteredSimulationComponent {
  return {
    id,
    simulationId,
    iconKey,
    displayName: names,
    identificationText: ident,
    hitRegion: { kind: 'canvas_custom', description: names.en },
    highlight: {
      strokeColor: '#6F4E37',
      glowColor: 'rgba(111, 78, 55, 0.28)',
      strokeWidth: 3,
      emissiveHex: 0x6f4e37,
      emissiveIntensity: 0.45,
    },
    explanationContext: `${names.en}: ${definition} ${props}`,
    describeCurrentState: (_lang, state) =>
      typeof state.componentStateSummary === 'string' && state.componentStateSummary
        ? state.componentStateSummary
        : typeof state.summary === 'string'
          ? state.summary
          : ident.en,
    buildDefaultExplanation: (lang, state): ComponentExplanationContent => ({
      name: names[lang] || names.en,
      definition,
      characteristics,
      functionDescription: fnDesc,
      scientificProperties: props,
      behaviour,
      relationshipWithOthers: rel,
      realWorldExample: example,
      whyItMatters,
      currentStateSummary:
        typeof state.summary === 'string' ? state.summary : undefined,
      source: 'curated',
    }),
  };
}

const opticsEntry = FUTURE_SIMULATION_ENTRIES.find((e) => e.simulationId === 'optics');
const soundEntry = FUTURE_SIMULATION_ENTRIES.find((e) => e.simulationId === 'sound');
const circuitEntry = FUTURE_SIMULATION_ENTRIES.find(
  (e) => e.simulationId === 'electric_circuits'
);

export const MULTI_DOMAIN_SIMULATION_ENTRIES: SimulationComponentRegistryEntry[] = [
  {
    simulationId: 'motion_kinematics',
    experimentName: {
      en: 'Motion, Measurement & Kinematics Lab',
      kn: 'ಚಲನೆ ಮತ್ತು ಅಳತೆ ಪ್ರಯೋಗಾಲಯ',
      hi: 'गति एवं मापन प्रयोगशाला',
    },
    components: [
      makeComponent(
        'motion_kinematics',
        'moving_body',
        'generic',
        { en: 'Moving Object / Cart', kn: 'ಚಲಿಸುವ ವಸ್ತು', hi: 'गतिशील वस्तु' },
        {
          en: 'Body whose position changes with time',
          kn: 'ಕಾಲದೊಂದಿಗೆ ಸ್ಥಾನ ಬದಲಾಯಿಸುವ ವಸ್ತು',
          hi: 'समय के साथ स्थिति बदलने वाली वस्तु',
        },
        'An object observed relative to a fixed reference point to determine whether it is at rest or in motion.',
        'Possesses instantaneous position x(t), speed, velocity, and acceleration.',
        'Traces distance travelled and sweeps out displacement along the track or circular orbit.',
        'Obeys s = ut + ½at² for uniformly accelerated linear motion and v = 2πr/T for uniform circular motion.',
        'Accelerates smoothly along the track when acceleration a ≠ 0 and moves at constant speed when a = 0.',
        'Measured against the fixed reference origin and plotted continuously on the live motion graph.',
        'A train pulling out of a railway station or a runner on an athletics track.',
        'Tracking how position changes over time is the foundation of all mechanics, GPS navigation, and vehicle safety.'
      ),
      makeComponent(
        'motion_kinematics',
        'reference_origin',
        'pivot',
        { en: 'Reference Origin (O)', kn: 'ಉಲ್ಲೇಖ ಬಿಂದು (O)', hi: 'संदर्भ मूल बिंदु (O)' },
        {
          en: 'Fixed starting mark at x = 0',
          kn: 'x = 0 ಸ್ಥಿರ ಪ್ರಾರಂಭಿಕ ಬಿಂದು',
          hi: 'x = 0 पर स्थिर संदर्भ बिंदु',
        },
        'A chosen stationary landmark or zero mark on a scale from which position and displacement are measured.',
        'Prevents parallax and zero-error errors when reading length or distance.',
        'Anchors all distance measurements in metres (m) and determines sign of displacement.',
        'Motion is always relative—changing the reference origin shifts position values without changing displacement Δx.',
        'Remains fixed at x = 0 m while the moving object advances along the scale.',
        'Provides the starting anchor for both the distance path and displacement vector.',
        'The zero-kilometre milestone on a highway or the 0 cm mark on a meter ruler.',
        'Without a consistent reference origin and zero-error alignment, scientific measurements across different observers cannot match.'
      ),
      makeComponent(
        'motion_kinematics',
        'distance_path',
        'field_lines',
        { en: 'Distance Path', kn: 'ದೂರದ ಪಥ', hi: 'दूरी पथ' },
        {
          en: 'Total actual path length covered',
          kn: 'ಕ್ರಮಿಸಿದ ಒಟ್ಟು ನಿಜವಾದ ಪಥದ ಉದ್ದ',
          hi: 'तय किए गए वास्तविक पथ की कुल लंबाई',
        },
        'The complete scalar length of the trajectory actually travelled by an object between start and finish.',
        'Always positive or zero; increases whenever an object moves even if it turns back.',
        'Distinguishes curved or round-trip travel from net straight-line displacement.',
        'Distance ≥ |Displacement| holds true for every possible path in physics.',
        'Grows steadily along the entire track or circular arc as time advances.',
        'Contrasts directly with the shorter straight displacement vector connecting start to current position.',
        'A car odometer showing total kilometres driven on winding mountain roads.',
        'Understanding distance vs. displacement helps compute fuel consumption vs. net travel efficiency.'
      ),
      makeComponent(
        'motion_kinematics',
        'displacement_vector',
        'arrows',
        { en: 'Displacement Vector', kn: 'ಸ್ಥಾನಪಲ್ಲಟ ವೆಕ್ಟರ್', hi: 'विस्थापन सदिश' },
        {
          en: 'Shortest straight arrow from start to end',
          kn: 'ಪ್ರಾರಂಭದಿಂದ ಅಂತ್ಯದ ನೇರ ಕನಿಷ್ಠ ದೂರ',
          hi: 'प्रारंभ से अंतिम बिंदु तक न्यूनतम सीधी रेखा',
        },
        'A vector quantity pointing directly from the initial position to the final position of a moving object.',
        'Has both magnitude and direction; equals zero after one complete circular lap even though distance = 2πr.',
        'Determines average velocity v_avg = Δx / Δt.',
        'Never exceeds total distance travelled; matches distance only in one-way straight motion.',
        'Stretches directly from the origin to the object’s current position.',
        'Directly determines velocity vector direction and separates scalar speed from vector velocity.',
        'A straight crow-flies flight route between two cities compared to winding road distance.',
        'Distinguishing displacement from distance explains why returning home gives zero net displacement.'
      ),
      makeComponent(
        'motion_kinematics',
        'motion_graph',
        'generic',
        { en: 'Live Motion Graph', kn: 'ಲೈವ್ ಚಲನೆಯ ಗ್ರಾಫ್', hi: 'लाइव गति ग्राफ़' },
        {
          en: 'Real-time distance-time / velocity-time plot',
          kn: 'ಕಾಲದೊಂದಿಗೆ ದೂರ / ವೇಗದ ಗ್ರಾಫ್',
          hi: 'समय के साथ दूरी / वेग का ग्राफ़',
        },
        'A graphical plot showing how distance or speed varies continuously with elapsed time.',
        'Straight sloped line on a distance–time graph indicates uniform motion; curved upward indicates acceleration.',
        'Lets students read speed from the slope (Δs/Δt) and identify uniform vs. non-uniform motion visually.',
        'Slope of x–t graph = velocity; slope of v–t graph = acceleration; area under v–t graph = displacement.',
        'Redraws live as you change initial speed or acceleration.',
        'Summarizes the entire motion of the moving body across time.',
        'Speed telemetry charts recorded in trains, rockets, and fitness trackers.',
        'Motion graphs turn invisible time-varying rates into an instant visual signature you can read at a glance.'
      ),
      makeComponent(
        'motion_kinematics',
        'velocity_vector',
        'arrows',
        { en: 'Velocity Vector', kn: 'ವೇಗ ವೆಕ್ಟರ್', hi: 'वेग सदिश' },
        {
          en: 'Instantaneous speed with direction',
          kn: 'ತಕ್ಷಣದ ವೇಗ ಮತ್ತು ಚಲನೆಯ ದಿಕ್ಕು',
          hi: 'दिशा सहित तात्कालिक चाल',
        },
        'Rate of change of displacement with time, shown as an arrow pointing in the direction of motion.',
        'Vector length scales proportionally with current speed; in circular motion its direction turns continuously tangent to the circle.',
        'Visualizes why circular motion at constant speed is still accelerated motion.',
        'v = u + at in linear motion; perpendicular to radius in circular motion.',
        'Lengthens under positive acceleration and rotates tangentially around circular paths.',
        'Attached directly to the moving body and governed by acceleration.',
        'An aircraft airspeed and heading indicator.',
        'Knowing both speed and direction predicts collisions, orbits, and curved trajectories.'
      ),
    ],
  },
  {
    simulationId: 'force_friction_buoyancy',
    experimentName: {
      en: 'Forces, Friction, Pressure & Buoyancy Lab',
      kn: 'ಬಲ, ಘರ್ಷಣೆ, ಒತ್ತಡ ಮತ್ತು ಪ್ಲವನತೆ ಪ್ರಯೋಗಾಲಯ',
      hi: 'बल, घर्षण, दाब एवं उत्प्लावन प्रयोगशाला',
    },
    components: [
      makeComponent(
        'force_friction_buoyancy',
        'test_block',
        'generic',
        { en: 'Test Mass / Block', kn: 'ಪರೀಕ್ಷಾ ವಸ್ತು / ಬ್ಲಾಕ್', hi: 'परीक्षण पिंड / गुटका' },
        {
          en: 'Object experiencing forces or buoyancy',
          kn: 'ಬಲ ಅಥವಾ ಪ್ಲವನತೆಗೆ ಒಳಗಾದ ವಸ್ತು',
          hi: 'बल या उत्प्लावन का अनुभव करने वाला पिंड',
        },
        'The solid test object upon which applied force, friction, gravity, and fluid buoyancy act.',
        'Mass m resists changes in motion (inertia) and sets downward weight W = mg.',
        'Accelerates when forces are unbalanced (F_net ≠ 0) and floats or sinks according to relative density.',
        'Newton’s Second Law: a = F_net / m; floats when density ρ_obj < ρ_fluid.',
        'Slides along the surface or settles at equilibrium depth inside the liquid tank.',
        'Receives simultaneous pulls/pushes from applied force, friction, gravity, and upthrust.',
        'A wooden crate pushed across a warehouse floor or a ship hull floating in seawater.',
        'Observing how net force determines motion rather than single forces clears up Newton’s laws immediately.'
      ),
      makeComponent(
        'force_friction_buoyancy',
        'applied_force_arrow',
        'arrows',
        { en: 'Applied Force / Weight Vector', kn: 'ಪ್ರಯೋಗಿಸಿದ ಬಲ / ತೂಕ', hi: 'आरोपित बल / भार सदिश' },
        {
          en: 'External push or gravitational pull',
          kn: 'ಹೊರಗಿನ ತಳ್ಳುವ ಬಲ ಅಥವಾ ಗುರುತ್ವ ಎಳೆತ',
          hi: 'बाहरी धक्का या गुरुत्वाकर्षण बल',
        },
        'The driving force pushing the block horizontally or the downward weight W = mg pulling a submerged object.',
        'Measured in Newtons (N); arrow length is proportional to force magnitude.',
        'Overcomes static/kinetic friction or fluid upthrust when sufficiently large.',
        'In balanced state, applied force equals opposing friction (F_net = 0).',
        'Grows immediately as you increase the Applied Force slider.',
        'Competes directly against the opposing friction or buoyancy vector.',
        'Pushing a heavy box across a classroom floor.',
        'Comparing driving and opposing arrows makes balanced vs. unbalanced forces obvious.'
      ),
      makeComponent(
        'force_friction_buoyancy',
        'friction_force_arrow',
        'arrows',
        { en: 'Friction Force Vector', kn: 'ಘರ್ಷಣಾ ಬಲದ ಬಾಣ', hi: 'घर्षण बल सदिश' },
        {
          en: 'Contact resistance opposing motion',
          kn: 'ಚಲನೆಗೆ ವಿರುದ್ಧವಾದ ಸಂಪರ್ಕ ಪ್ರತಿರೋಧ',
          hi: 'गति का विरोध करने वाला संपर्क बल',
        },
        'A contact force exerted by microscopic surface interlocking that opposes sliding motion.',
        'Depends on surface roughness (μ) and normal reaction N = mg, not on contact area.',
        'Slows moving objects and prevents sliding until applied force exceeds limiting friction.',
        'Maximum friction f_max = μN = μmg.',
        'Increases sharply on rough sandpaper and drops nearly to zero on smooth ice.',
        'Points opposite to applied motion along the surface interface.',
        'Car brake pads gripping a rotor or shoe soles gripping wet pavement.',
        'Friction lets us walk and stop safely while also wearing down machine parts unless lubricated.'
      ),
      makeComponent(
        'force_friction_buoyancy',
        'buoyancy_arrow',
        'arrows',
        { en: 'Buoyant Upthrust (F_b)', kn: 'ಪ್ಲವನ ಬಲ (F_b)', hi: 'उत्प्लावन बल (F_b)' },
        {
          en: 'Upward fluid force equal to displaced weight',
          kn: 'ಸ್ಥಳಾಂತರಗೊಂಡ ದ್ರವದ ತೂಕಕ್ಕೆ ಸಮನಾದ ಮೇಲ್ಮುಖ ಬಲ',
          hi: 'विस्थापित द्रव के भार के बराबर ऊर्ध्वमुखी बल',
        },
        'The upward force exerted by a fluid on an immersed or floating object due to pressure increasing with depth.',
        'Equals the weight of fluid displaced (Archimedes’ Principle: F_b = ρ_fluid · V_sub · g).',
        'Supports floating vessels when F_b balances downward weight W.',
        'Greater fluid density (like salty water) creates stronger upward buoyant force.',
        'Pushes upward from the submerged volume of the block.',
        'Opposes gravity acting on the test block inside the fluid.',
        'Steel cargo ships floating effortlessly and hot-air balloons rising in air.',
        'Archimedes’ principle governs ship stability, submarines, and hydrometers.'
      ),
      makeComponent(
        'force_friction_buoyancy',
        'surface_or_fluid',
        'generic',
        { en: 'Contact Surface / Fluid Medium', kn: 'ಸಂಪರ್ಕ ಮೇಲ್ಮೈ / ದ್ರವ ಮಾಧ್ಯಮ', hi: 'संपर्क सतह / तरल माध्यम' },
        {
          en: 'Surface texture or fluid column exerting pressure',
          kn: 'ಘರ್ಷಣೆ ಅಥವಾ ದ್ರವ ಒತ್ತಡ ನೀಡುವ ಮಾಧ್ಯಮ',
          hi: 'घर्षण या द्रव दाब उत्पन्न करने वाला माध्यम',
        },
        'The floor surface generating friction or the liquid tank exerting hydrostatic pressure P = ρgh.',
        'Pressure increases linearly with depth h and fluid density ρ; surface roughness sets friction μ.',
        'Determines normal support, frictional resistance, and depth-dependent pressure.',
        'Fluid pressure P = F/A = ρgh acts equally in all directions at a given depth.',
        'Changes texture and pressure gradients when you switch surface or liquid density.',
        'Interacts across the bottom face and sides of the test block.',
        'Dam walls built thicker at the bottom to withstand greater deep-water pressure.',
        'Explains why deep-sea submersibles need reinforced hulls and why sharp knives cut easily (small area = high pressure).'
      ),
    ],
  },
  {
    simulationId: 'simple_machines_energy',
    experimentName: {
      en: 'Work, Energy Conservation & Simple Machines Lab',
      kn: 'ಕೆಲಸ, ಶಕ್ತಿ ಸಂರಕ್ಷಣೆ ಮತ್ತು ಸರಳ ಯಂತ್ರಗಳು',
      hi: 'कार्य, ऊर्जा संरक्षण एवं सरल मशीनें',
    },
    components: [
      makeComponent(
        'simple_machines_energy',
        'energy_bob',
        'generic',
        { en: 'Swinging Mass / Load', kn: 'ತೂಗಾಡುವ ದ್ರವ್ಯರಾಶಿ / ಭಾರ', hi: 'दोलन पिंड / भार' },
        {
          en: 'Mass converting between PE and KE',
          kn: 'ಸ್ಥಿತಿಜ ಮತ್ತು ಚಲನ ಶಕ್ತಿ ಬದಲಾಯಿಸುವ ವಸ್ತು',
          hi: 'स्थितिज एवं गतिज ऊर्जा बदलने वाला पिंड',
        },
        'The moving mass (or lifted load) whose gravitational potential energy and kinetic energy continuously interconvert.',
        'Total mechanical energy E = mgh + ½mv² stays constant in the absence of friction.',
        'Demonstrates zero KE at peak height and maximum KE at the lowest point.',
        'Speed at bottom v = √(2gh), independent of mass m in ideal conditions.',
        'Swings faster from higher release heights and gradually damps if friction is added.',
        'Exchanges energy vertically against the height marker and updates live KE/PE bars.',
        'A playground swing or hydroelectric water turbine.',
        'Energy conservation lets engineers predict speeds and heights without tracking complex forces at every step.'
      ),
      makeComponent(
        'simple_machines_energy',
        'track_height_marker',
        'pivot',
        { en: 'Height & Potential Reference (h)', kn: 'ಎತ್ತರ ಮಟ್ಟದ ಗುರುತು (h)', hi: 'ऊँचाई संदर्भ (h)' },
        {
          en: 'Vertical elevation above lowest point',
          kn: 'ಕನಿಷ್ಠ ಬಿಂದುವಿನಿಂದ ಎತ್ತರ',
          hi: 'न्यूनतम बिंदु से ऊर्ध्वाधर ऊँचाई',
        },
        'The vertical elevation h (in metres) above the zero-potential reference datum.',
        'Directly determines gravitational potential energy PE = mgh.',
        'Provides a visual scale showing how initial drop height caps maximum return height.',
        'Doubling height h doubles stored potential energy PE.',
        'Moves up or down immediately with the Release Height slider.',
        'Paired with mass m to set total initial energy before motion starts.',
        'Elevated water reservoirs storing gravitational energy for pumped-storage hydro.',
        'Clearly proves why a frictionless pendulum never rises higher than its release height.'
      ),
      makeComponent(
        'simple_machines_energy',
        'ke_pe_meter',
        'generic',
        { en: 'Energy Bar Gauge (KE / PE)', kn: 'ಶಕ್ತಿ ಮಾಪಕ (KE / PE)', hi: 'ऊर्जा मापक (KE / PE)' },
        {
          en: 'Live split between Kinetic & Potential energy',
          kn: 'ಚಲನ ಮತ್ತು ಸ್ಥಿತಿಜ ಶಕ್ತಿಯ ನೇರ ವಿಭಜನೆ',
          hi: 'गतिज व स्थितिज ऊर्जा का लाइव विभाजन',
        },
        'A synchronized meter showing instantaneous Kinetic Energy (½mv²), Potential Energy (mgh), and Thermal loss.',
        'KE + PE + Heat always sums strictly to initial mechanical energy E₀.',
        'Proves energy is never created or destroyed—only transformed.',
        'When damping = 0, Total E remains flat across every oscillation.',
        'KE bar rises as PE bar falls smoothly during downward swing.',
        'Reads real-time speed and height of the swinging mass.',
        'Regenerative braking indicators inside electric cars.',
        'Visualizing conservation of energy turns abstract equations into an intuitive balance scale.'
      ),
      makeComponent(
        'simple_machines_energy',
        'fulcrum_pivot',
        'pivot',
        { en: 'Fulcrum / Pivot', kn: 'ಆಧಾರ ಬಿಂದು (Fulcrum)', hi: 'आलंब बिंदु (Fulcrum)' },
        {
          en: 'Fixed turning point of a lever',
          kn: 'ಸನ್ನೆಕೋಲಿನ ತಿರುಗುವ ಸ್ಥಿರ ಆಧಾರ',
          hi: 'उत्तोलक का स्थिर घूर्णन बिंदु',
        },
        'The fixed hinge or support point about which a rigid lever rotates to multiply force or distance.',
        'Torque balance: Effort × Effort Arm = Load × Load Arm.',
        'Lets a small effort lift a heavy load when placed closer to the load.',
        'Ideal Mechanical Advantage MA = Effort Arm / Load Arm.',
        'Changes required effort force instantly when effort arm length is adjusted.',
        'Supports the lever beam connecting effort force and load mass.',
        'Crowbars, seesaws, scissors, and bottle openers.',
        'Understanding levers shows how simple machines trade greater movement distance for lower effort force.'
      ),
      makeComponent(
        'simple_machines_energy',
        'pulley_wheel',
        'generic',
        { en: 'Pulley & Rope System', kn: 'ಕಪ್ಪಿ ಮತ್ತು ಹಗ್ಗ ವ್ಯವಸ್ಥೆ', hi: 'घिरनी व रस्सी तंत्र' },
        {
          en: 'Grooved wheel redirecting or multiplying effort',
          kn: 'ಬಲದ ದಿಕ್ಕು ಬದಲಾಯಿಸುವ ಅಥವಾ ಗುಣಿಸುವ ಕಪ್ಪಿ',
          hi: 'बल की दिशा बदलने या गुणन करने वाली घिरनी',
        },
        'A grooved wheel carrying a rope that either redirects force (single fixed pulley) or shares load across multiple strands.',
        'Mechanical advantage equals the number of supporting rope segments N; effort = Load / N.',
        'Reduces pulling force required to raise heavy loads vertically.',
        'Work input F_effort × d_pull equals work output Load × h_lift (ideal).',
        'Adding pulley strands cuts effort force proportionally while increasing rope length pulled.',
        'Connects the suspended load to the effort gauge.',
        'Construction cranes, well water pulleys, and stage rigging.',
        'Demonstrates why simple machines reduce force without reducing total work done.'
      ),
    ],
  },
  {
    simulationId: 'heat_transfer_lab',
    experimentName: {
      en: 'Temperature & Heat Transfer Lab',
      kn: 'ತಾಪಮಾನ ಮತ್ತು ಉಷ್ಣ ಪ್ರಸರಣ ಪ್ರಯೋಗಾಲಯ',
      hi: 'तापमान एवं ऊष्मा स्थानांतरण प्रयोगशाला',
    },
    components: [
      makeComponent(
        'heat_transfer_lab',
        'heat_source',
        'generic',
        { en: 'Thermal Heat Source', kn: 'ಉಷ್ಣ ಮೂಲ (ಬರ್ನರ್)', hi: 'ऊष्मा स्रोत (बर्नर)' },
        {
          en: 'Controlled thermal energy input',
          kn: 'ನಿಯಂತ್ರಿತ ಉಷ್ಣ ಶಕ್ತಿ ಮೂಲ',
          hi: 'नियंत्रित ऊष्मीय ऊर्जा स्रोत',
        },
        'The laboratory heating burner supplying thermal energy at a selectable temperature (°C).',
        'Drives temperature gradient ΔT across solids, fluids, and radiating surfaces.',
        'Initiates conduction, convection currents, or infrared thermal emission.',
        'Higher temperature increases average kinetic energy of particles.',
        'Brightens flame/element intensity as source temperature slider rises.',
        'Transfers thermal energy directly to the conducting rod, fluid base, or radiating plate.',
        'A laboratory spirit lamp, gas stove burner, or solar heating surface.',
        'Heat always flows spontaneously from a hotter source to cooler surroundings until thermal equilibrium.'
      ),
      makeComponent(
        'heat_transfer_lab',
        'conducting_rod',
        'magnet',
        { en: 'Conducting Metal / Insulator Rod', kn: 'ಉಷ್ಣ ವಾಹಕ / ಅವಾಹಕ ದಂಡ', hi: 'ऊष्मा चालक / कुचालक छड़' },
        {
          en: 'Solid bar transferring heat by conduction',
          kn: 'ವಹನದ ಮೂಲಕ ಉಷ್ಣ ಹರಿಸುವ ದಂಡ',
          hi: 'चालन द्वारा ऊष्मा प्रवाहित करने वाली छड़',
        },
        'A solid test rod showing heat propagation from particle to particle without bulk movement of matter.',
        'Copper conducts rapidly (k ≈ 400 W/m·K), aluminum moderately, and glass/wood very slowly.',
        'Melts wax pins sequentially from the hot end toward the cooler end.',
        'Good thermal conductors have free electrons that carry energy swiftly.',
        'Displays a smooth temperature colour gradient and faster pin drops for copper than glass.',
        'Absorbs heat from the source and delivers it along its length to the thermometer probe.',
        'Metal cooking pans with insulated wooden or plastic handles.',
        'Comparing conduction rates explains why cooking pots use copper/steel while handles use insulators.'
      ),
      makeComponent(
        'heat_transfer_lab',
        'thermometer_probe',
        'pivot',
        { en: 'Digital & Mercury Thermometer', kn: 'ತಾಪಮಾಪಕ (Thermometer)', hi: 'तापमापी (थर्मामीटर)' },
        {
          en: 'Measures temperature in °C, K, and °F',
          kn: '°C, K ಮತ್ತು °F ನಲ್ಲಿ ತಾಪಮಾನ ಅಳೆಯುತ್ತದೆ',
          hi: '°C, K व °F में तापमान मापता है',
        },
        'A calibrated temperature-measuring instrument displaying readings simultaneously in Celsius (°C), Kelvin (K), and Fahrenheit (°F).',
        'Clinical thermometers cover 35°C–42°C; laboratory thermometers cover −10°C–110°C.',
        'Tracks real-time thermal equilibrium or heat-transfer rise accurately.',
        'T(K) = T(°C) + 273.15 and T(°F) = (9/5)T(°C) + 32.',
        'Liquid column expands and numerical scales update immediately with source temperature.',
        'Samples local temperature at the heated surface or along the rod.',
        'Fever diagnosis with digital thermometers and industrial furnace monitoring.',
        'Distinguishing temperature (hotness) from heat (energy transferred) prevents one of the biggest misconceptions in science.'
      ),
      makeComponent(
        'heat_transfer_lab',
        'convection_fluid',
        'field_lines',
        { en: 'Convection Fluid Currents', kn: 'ಸಂವಹನ ದ್ರವ ಪ್ರವಾಹ', hi: 'संवहन तरल धाराएँ' },
        {
          en: 'Warm fluid rises, cool fluid sinks',
          kn: 'ಬಿಸಿ ದ್ರವ ಮೇಲೇರಿ ತಂಪು ದ್ರವ ಕೆಳಗಿಳಿಯುತ್ತದೆ',
          hi: 'गर्म तरल ऊपर उठता और ठंडा नीचे आता है',
        },
        'Circular fluid currents driven by density differences when a liquid or gas is heated from below.',
        'Warm fluid expands, becomes less dense, and rises while cooler denser fluid sinks to replace it.',
        'Transfers heat rapidly throughout liquids and gases—impossible in rigid solids.',
        'Drives atmospheric sea breezes, land breezes, and boiling water circulation.',
        'Circulation speed increases as heater temperature climbs.',
        'Carries heat upward from the bottom heat source through the liquid column.',
        'Sea breeze cooling coastal towns in daytime and heating water in a kettle.',
        'Convection shapes Earth’s weather, ocean currents, and home ventilation.'
      ),
      makeComponent(
        'heat_transfer_lab',
        'radiating_surface',
        'generic',
        { en: 'Black vs. Silver Surface', kn: 'ಕಪ್ಪು vs ಬೆಳ್ಳಿ ಮೇಲ್ಮೈ', hi: 'काली बनाम चमकीली सतह' },
        {
          en: 'Absorbs or reflects radiant heat waves',
          kn: 'ವಿಕಿರಣ ಉಷ್ಣವನ್ನು ಹೀರುವ ಅಥವಾ ಪ್ರತಿಫಲಿಸುವ ಮೇಲ್ಮೈ',
          hi: 'विकिरण ऊष्मा को अवशोषित या परावर्तित करती सतह',
        },
        'Test surfaces comparing how dark matte black vs. shiny silver surfaces absorb and emit thermal radiation.',
        'Requires zero material medium—radiation travels across vacuum at the speed of light.',
        'Black surfaces absorb and radiate heat fastest; shiny surfaces reflect most infrared rays.',
        'Explains why solar heaters are painted black and summer clothes are light-coloured.',
        'Dark surface warms steeply while shiny reflective surface stays cooler.',
        'Receives infrared radiation rays directly from the heat source across space.',
        'Solar water heater collectors painted black and shiny thermos flasks.',
        'Radiation is how the Sun warms Earth across 150 million km of empty vacuum.'
      ),
    ],
  },
  ...(opticsEntry
    ? [
        {
          ...opticsEntry,
          simulationId: 'optics_ray_lab',
        },
      ]
    : []),
  ...(soundEntry
    ? [
        {
          ...soundEntry,
          simulationId: 'sound_wave_lab',
        },
      ]
    : []),
  ...(circuitEntry
    ? [
        {
          ...circuitEntry,
          simulationId: 'electric_circuit_lab',
          components: [
            ...circuitEntry.components,
            makeComponent(
              'electric_circuit_lab',
              'electromagnet_coil',
              'magnet',
              { en: 'Solenoid / Electromagnet Coil', kn: 'ವಿದ್ಯುತ್ಕಾಂತ ಸುರುಳಿ', hi: 'परिनालिका / विद्युत चुंबक कुंडली' },
              {
                en: 'Current-carrying coil creating magnetic field',
                kn: 'ವಿದ್ಯುತ್ ಪ್ರವಾಹದಿಂದ ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ಸೃಷ್ಟಿಸುವ ಸುರುಳಿ',
                hi: 'धारा से चुंबकीय क्षेत्र बनाने वाली कुंडली',
              },
              'A closely wound insulated copper coil around a soft iron core that acts as a controllable magnet when current flows.',
              'Magnetic strength increases with coil turns N, current I, and an iron core.',
              'Deflects a nearby magnetic compass (Oersted’s discovery) and reverses poles if battery polarity flips.',
              'Right-hand thumb rule gives North pole direction along the solenoid axis.',
              'Loses magnetism immediately when the circuit switch opens.',
              'Driven by battery voltage and switch state, attracting iron filings and aligning the nearby compass.',
              'Scrapyard lifting cranes, electric doorbells, MRI machines, and relay switches.',
              'Electromagnetism bridges electricity and magnetism—powering motors, generators, and modern grids.'
            ),
          ],
        },
      ]
    : []),
];
