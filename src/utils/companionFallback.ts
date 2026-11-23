import type { LanguageCode } from '../types/physics';
import type {
  CompanionEmotion,
  CompanionEventType,
  CompanionMessageState,
  CompanionPointTarget,
} from '../types/companion';

export function buildLocalCompanionMessage(params: {
  eventType: CompanionEventType;
  language: LanguageCode;
  studentName?: string;
  studentClass?: number;
  experimentTitle?: string;
  componentName?: string;
  parameterSummary?: string;
  pointTarget?: CompanionPointTarget;
}): CompanionMessageState {
  const {
    eventType,
    language,
    studentName,
    studentClass = 8,
    experimentTitle = 'Physics Lab',
    componentName,
    parameterSummary,
    pointTarget = 'none',
  } = params;

  const id = `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const createdAt = Date.now();
  const who = studentName?.trim();

  const pick = (
    textEn: string,
    textKn: string,
    textHi: string,
    promptEn: string,
    promptKn: string,
    promptHi: string,
    emotion: CompanionEmotion
  ): CompanionMessageState => ({
    id,
    eventType,
    text: language === 'kn' ? textKn : language === 'hi' ? textHi : textEn,
    emotion,
    pointTarget,
    quickPrompt: language === 'kn' ? promptKn : language === 'hi' ? promptHi : promptEn,
    createdAt,
  });

  switch (eventType) {
    case 'dashboard_welcome':
    case 'returning_user':
      return pick(
        `Hey ${who || 'Explorer'}! Ready to test a Class ${studentClass} physics experiment together?`,
        `ನಮಸ್ಕಾರ ${who || 'ಸ್ನೇಹಿತರೆ'}! ಇಂದು ${studentClass}ನೇ ತರಗತಿಯ ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗವನ್ನು ಮಾಡೋಣವೇ?`,
        `नमस्ते ${who || 'दोस्त'}! क्या आज कक्षा ${studentClass} का कोई भौतिकी प्रयोग करके देखें?`,
        'Suggest an interesting experiment for my class',
        'ನನ್ನ ತರಗತಿಗೆ ಒಂದು ಉತ್ತಮ ಪ್ರಯೋಗ ಸೂಚಿಸಿ',
        'मेरी कक्षा के लिए एक मज़ेदार प्रयोग सुझाएँ',
        'excited'
      );

    case 'experiment_intro':
      return pick(
        `Welcome to ${experimentTitle}! Adjust the sliders or tap any apparatus part on the canvas.`,
        `${experimentTitle} ಪ್ರಯೋಗಕ್ಕೆ ಸ್ವಾಗತ! ಸ್ಲೈಡರ್‌ಗಳನ್ನು ಬದಲಿಸಿ ಅಥವಾ ಕ್ಯಾನ್ವಾಸ್ ಮೇಲಿನ ಭಾಗಗಳನ್ನು ಸ್ಪರ್ಶಿಸಿ.`,
        `${experimentTitle} में स्वागत है! स्लाइडर बदलें या कैनवास पर किसी भी उपकरण भाग को चुनें।`,
        'What should I observe closely in this experiment?',
        'ಈ ಪ್ರಯೋಗದಲ್ಲಿ ನಾನು ಏನನ್ನು ಗಮನಿಸಬೇಕು?',
        'इस प्रयोग में मुझे क्या ध्यान से देखना चाहिए?',
        'excited'
      );

    case 'component_inspected':
      return pick(
        `Great catch! Watch how ${componentName || 'this part'} interacts inside ${experimentTitle}.`,
        `ಚೆನ್ನಾಗಿದೆ! ${experimentTitle} ನಲ್ಲಿ ${componentName || 'ಈ ಭಾಗ'} ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ ಗಮನಿಸಿ.`,
        `बहुत बढ़िया! देखें कि ${experimentTitle} में ${componentName || 'यह भाग'} कैसे काम करता है।`,
        `Why is ${componentName || 'this component'} important here?`,
        `${componentName || 'ಈ ಭಾಗ'} ಇಲ್ಲಿ ಏಕೆ ಮುಖ್ಯವಾಗಿದೆ?`,
        `यहाँ ${componentName || 'यह भाग'} क्यों महत्वपूर्ण है?`,
        'speaking'
      );

    case 'quiz_correct':
      return pick(
        `Awesome job${who ? `, ${who}` : ''}! You nailed the physics concept cleanly.`,
        `ಶಭಾಷ್${who ? ` ${who}` : ''}! ನೀವು ಭೌತಶಾಸ್ತ್ರದ ತತ್ವವನ್ನು ಸರಿಯಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೀರಿ.`,
        `शाबाश${who ? ` ${who}` : ''}! आपने भौतिकी की अवधारणा बिल्कुल सही समझी।`,
        'Give me a real-life application of this concept',
        'ಇದರ ನಿಜಜೀವನದ ಉದಾಹರಣೆ ಕೊಡಿ',
        'इसका दैनिक जीवन में उदाहरण बताएँ',
        'celebrating'
      );

    case 'quiz_wrong':
      return pick(
        `Close try${who ? `, ${who}` : ''}! Adjust the simulation once more to verify the effect.`,
        `ಪರವಾಗಿಲ್ಲ${who ? ` ${who}` : ''}! ಸಿಮ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ಮತ್ತೊಮ್ಮೆ ಪರೀಕ್ಷಿಸಿ ನೋಡಿ.`,
        `कोई बात नहीं${who ? ` ${who}` : ''}! सिमुलेशन में एक बार फिर बदलाव करके कारण देखें।`,
        'Give me a hint for this quiz question',
        'ಈ ಪ್ರಶ್ನೆಗೆ ಒಂದು ಸುಳಿವು ಕೊಡಿ',
        'इस प्रश्न के लिए एक संकेत दें',
        'encouraging'
      );

    case 'experiment_completed':
    case 'badge_unlocked':
      return pick(
        `Fantastic work${who ? `, ${who}` : ''}! You earned XP for mastering ${experimentTitle}.`,
        `ಅದ್ಭುತ${who ? ` ${who}` : ''}! ನೀವು ${experimentTitle} ಪೂರ್ಣಗೊಳಿಸಿ XP ಗಳಿಸಿದ್ದೀರಿ.`,
        `बधाई हो${who ? ` ${who}` : ''}! आपने ${experimentTitle} पूरा करके XP प्राप्त किया है।`,
        'What experiment should I try next?',
        'ನಾನು ಮುಂದಿನ ಯಾವ ಪ್ರಯೋಗವನ್ನು ಮಾಡಬೇಕು?',
        'मुझे आगे कौन-सा प्रयोग करना चाहिए?',
        'celebrating'
      );

    case 'guided_step':
      return pick(
        `Follow each guided step carefully—${parameterSummary || 'test your prediction in the live simulation!'}`,
        `ಪ್ರತಿ ಹಂತವನ್ನು ಗಮನವಿಟ್ಟು ಅನುಸರಿಸಿ—${parameterSummary || 'ಸಿಮ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಊಹೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ!'}`,
        `हर चरण को ध्यान से पूरा करें—${parameterSummary || 'लाइव सिमुलेशन में अपना अनुमान जाँचें!'}`,
        'Help me check my prediction reasoning',
        'ನನ್ನ ಊಹೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ಸಹಾಯ ಮಾಡಿ',
        'मेरा पूर्वानुमान समझाने में मदद करें',
        'encouraging'
      );

    default:
      return pick(
        `Look closely! ${parameterSummary ? `With ${parameterSummary}, watch ` : 'Watch '}how the physics system reacts right away.`,
        `ಗಮನಿಸಿ! ${parameterSummary ? `${parameterSummary} ಬದಲಾವಣೆಯಿಂದ ` : ''}ಭೌತಶಾಸ್ತ್ರ ವ್ಯವಸ್ಥೆ ಹೇಗೆ ಬದಲಾಗುತ್ತದೆ ನೋಡಿ.`,
        `ध्यान दें! ${parameterSummary ? `${parameterSummary} के साथ ` : ''}भौतिकी प्रणाली तुरंत कैसे बदलती है देखें।`,
        'Explain why this parameter changed the result',
        'ಈ ಬದಲಾವಣೆಯಿಂದ ಫಲಿತಾಂಶ ಏಕೆ ಬದಲಾಯಿತು?',
        'इस बदलाव से परिणाम क्यों बदला?',
        'speaking'
      );
  }
}
