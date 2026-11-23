import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Mic,
  Square,
  X,
  Send,
  Volume2,
  Pause,
  Play,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  Check,
  Trash2,
} from 'lucide-react';
import type {
  AdaptiveSimulationId,
  LanguageCode,
  LearningSessionContext,
  TutorChatMessage,
  TutorMicStatus,
  TutorParameterSuggestion,
  TutorRequestedStyle,
} from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import { transcribeStudentAudio } from '../services/explainabilityApi';
import { TutorAudioController, type TutorAudioSnapshot } from '../utils/speechUtils';

interface VoiceTutorPanelProps {
  t: TranslationBundle;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeAdaptiveId: AdaptiveSimulationId;
  experimentContextSummary?: {
    classLevel?: number;
    chapterNumber?: number;
    experimentTitle?: string;
    engineId?: string;
  };
  selectedComponent?: {
    id: string;
    name: string;
    currentState?: string;
  } | null;
  messages: TutorChatMessage[];
  sessionContext: LearningSessionContext;
  isAsking: boolean;
  errorMsg: string | null;
  onAskTutor: (payload: {
    textQuestion: string;
    forceAlternativeStrategy?: boolean;
    requestedStyle?: TutorRequestedStyle;
    languageOverride?: LanguageCode;
    isRetry?: boolean;
  }) => Promise<void>;
  onCancelAsk?: () => void;
  onApplyParameterSuggestion?: (
    suggestion: TutorParameterSuggestion,
    messageId: string
  ) => void;
  appliedSuggestionIds?: Record<string, boolean>;
  onResetAdaptiveSimulation: () => void;
  onClearConversation?: () => void;
  onCloseDrawer?: () => void;
  variant?: 'sidepanel' | 'drawer';
}

const COMPONENT_SUGGESTED_QUESTIONS: Record<
  string,
  Record<LanguageCode, string[]>
> = {
  field_lines: {
    en: [
      'Why do magnetic field lines never cross each other?',
      'Why are lines closer together near the poles?',
    ],
    kn: [
      'ಎರಡು ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಏಕೆ ಪರಸ್ಪರ ಛೇದಿಸುವುದಿಲ್ಲ?',
      'ಧ್ರುವಗಳ ಬಳಿ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಏಕೆ ಹತ್ತಿರದಲ್ಲಿರುತ್ತವೆ?',
    ],
    hi: [
      'दो चुंबकीय क्षेत्र रेखाएँ कभी एक-दूसरे को क्यों नहीं काटतीं?',
      'ध्रुवों के पास क्षेत्र रेखाएँ अधिक घनी क्यों होती हैं?',
    ],
  },
  north_pole: {
    en: [
      'Why do field lines emerge from the North pole?',
      'What happens if two North poles face each other?',
    ],
    kn: [
      'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಉತ್ತರ ಧ್ರುವದಿಂದಲೇ ಏಕೆ ಹೊರಹೊಮ್ಮುತ್ತವೆ?',
      'ಎರಡು ಉತ್ತರ ಧ್ರುವಗಳು ಹತ್ತಿರ ಬಂದಾಗ ಏನಾಗುತ್ತದೆ?',
    ],
    hi: [
      'चुंबकीय क्षेत्र रेखाएँ उत्तरी ध्रुव से बाहर क्यों निकलती हैं?',
      'जब दो उत्तरी ध्रुव पास आते हैं तो क्या होता है?',
    ],
  },
  south_pole: {
    en: [
      'Do field lines end at the South pole or continue inside?',
      'Why does the compass red tip point toward the South pole?',
    ],
    kn: [
      'ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ದಕ್ಷಿಣ ಧ್ರುವದಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುತ್ತವೆಯೇ ಅಥವಾ ಒಳಗೆ ಮುಂದುವರಿಯುತ್ತವೆಯೇ?',
      'ದಿಕ್ಸೂಚಿಯ ಕೆಂಪು ತುದಿ ದಕ್ಷಿಣ ಧ್ರುವದ ಕಡೆಗೆ ಏಕೆ ತಿರುಗುತ್ತದೆ?',
    ],
    hi: [
      'क्या क्षेत्र रेखाएँ दक्षिणी ध्रुव पर समाप्त होती हैं या अंदर आगे बढ़ती हैं?',
      'दिक्सूचक की लाल नोक दक्षिणी ध्रुव की ओर क्यों मुड़ती है?',
    ],
  },
  compass_needle: {
    en: [
      'Why does the compass needle rotate around the magnet?',
      'How does the needle show magnetic field direction?',
    ],
    kn: [
      'ಅಯಸ್ಕಾಂತದ ಸುತ್ತ ದಿಕ್ಸೂಚಿ ಸೂಜಿ ಏಕೆ ತಿರುಗುತ್ತದೆ?',
      'ಸೂಜಿಯು ಕಾಂತೀಯ ಕ್ಷೇತ್ರದ ದಿಕ್ಕನ್ನು ಹೇಗೆ ತೋರಿಸುತ್ತದೆ?',
    ],
    hi: [
      'चुंबक के चारों ओर कंपास की सुई क्यों घूमती है?',
      'सुई चुंबकीय क्षेत्र की दिशा कैसे दर्शाती है?',
    ],
  },
};

function buildGenericComponentPrompts(
  componentName: string,
  language: LanguageCode
): string[] {
  if (language === 'kn') {
    return [
      `ಈ ಪ್ರಯೋಗದಲ್ಲಿ ${componentName} ಏನು ಕೆಲಸ ಮಾಡುತ್ತದೆ?`,
      `ನಿಯಂತ್ರಣಗಳನ್ನು ಬದಲಾಯಿಸಿದಾಗ ${componentName} ಹೇಗೆ ವರ್ತಿಸುತ್ತದೆ?`,
    ];
  }
  if (language === 'hi') {
    return [
      `इस प्रयोग में ${componentName} की क्या भूमिका है?`,
      `मापदंड बदलने पर ${componentName} का व्यवहार कैसे बदलता है?`,
    ];
  }
  return [
    `How does ${componentName} work in this experiment?`,
    `What changes if I adjust the controls affecting ${componentName}?`,
  ];
}

function buildStarterPrompts(
  engineId: string | undefined,
  language: LanguageCode
): string[] {
  if (language === 'kn') {
    switch (engineId) {
      case 'electric_circuit_lab':
        return [
          'ವೋಲ್ಟೇಜ್ ಹೆಚ್ಚಿಸಿದಾಗ ವಿದ್ಯುತ್ ಪ್ರವಾಹ ಏಕೆ ಹೆಚ್ಚುತ್ತದೆ?',
          'ಶ್ರೇಣಿ ಮತ್ತು ಸಮಾನಾಂತರ ರೋಧಗಳ ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು?',
        ];
      case 'optics_ray_lab':
        return [
          'ಪತನ ಕೋನ ಮತ್ತು ಪ್ರತಿಫಲನ ಕೋನ ಯಾವಾಗಲೂ ಸಮಾನವಾಗಿರುತ್ತವೆಯೇ?',
          'ಬೆಳಕು ಗಾಜಿನೊಳಗೆ ಪ್ರವೇಶಿಸಿದಾಗ ಏಕೆ ಬಾಗುತ್ತದೆ?',
        ];
      case 'heat_transfer_lab':
        return [
          'ತಾಮ್ರದಲ್ಲಿ ಗಾಜಿಗಿಂತ ವೇಗವಾಗಿ ಶಾಖ ಏಕೆ ಹರಿಯುತ್ತದೆ?',
          'ವಹನ ಮತ್ತು ಸಂವಹನ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ಸರಳವಾಗಿ ವಿವರಿಸಿ.',
        ];
      case 'sound_wave_lab':
        return [
          'ಆವೃತ್ತಿ (Pitch) ಮತ್ತು ಕಂಪನದ ವ್ಯಾಪ್ತಿ (Loudness) ಹೇಗೆ ಭಿನ್ನವಾಗಿವೆ?',
          'ಪ್ರತಿಧ್ವನಿ ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸಲು ಕನಿಷ್ಠ ದೂರ ಏಕೆ ಬೇಕು?',
        ];
      case 'motion_kinematics':
        return [
          'ದೂರ ಮತ್ತು ಸ್ಥಳಾಂತರದ ನಡುವಿನ ವ್ಯತ್ಯಾಸವನ್ನು ಉದಾಹರಣೆಯೊಂದಿಗೆ ತಿಳಿಸಿ.',
          'ವೇಗ ಮತ್ತು ವೇಗೋತ್ಕರ್ಷ ಹೇಗೆ ಸಂಬಂಧಿಸಿವೆ?',
        ];
      case 'force_friction_buoyancy':
        return [
          'ಕೆಲವು ವಸ್ತುಗಳು ನೀರಿನಲ್ಲಿ ಏಕೆ ತೇಲುತ್ತವೆ ಮತ್ತು ಕೆಲವು ಏಕೆ ಮುಳುಗುತ್ತವೆ?',
          'ಘರ್ಷಣೆಯು ಚಲಿಸುವ ವಸ್ತುವಿನ ಮೇಲೆ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತದೆ?',
        ];
      case 'simple_machines_energy':
        return [
          'ಲೋಲಕದ ಚಲನ ಶಕ್ತಿ ಮತ್ತು ಸ್ಥಿತಿ ಶಕ್ತಿ ಹೇಗೆ ಬದಲಾಗುತ್ತವೆ?',
          'ಪುಲ್ಲಿ ವ್ಯವಸ್ಥೆಯು ಭಾರ ಎತ್ತಲು ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ?',
        ];
      default:
        return [
          'ಕಾಂತೀಯ ಕ್ಷೇತ್ರ ರೇಖೆಗಳು ಏಕೆ ಪರಸ್ಪರ ಛೇದಿಸುವುದಿಲ್ಲ?',
          'ಧ್ರುವಗಳ ಹತ್ತಿರ ಕಾಂತೀಯ ಶಕ್ತಿ ಏಕೆ ಹೆಚ್ಚಾಗಿರುತ್ತದೆ?',
        ];
    }
  }
  if (language === 'hi') {
    switch (engineId) {
      case 'electric_circuit_lab':
        return [
          'वोल्टेज बढ़ाने पर परिपथ में धारा क्यों बढ़ती है?',
          'श्रेणीक्रम और समानांतर प्रतिरोध में क्या अंतर है?',
        ];
      case 'optics_ray_lab':
        return [
          'आपतन कोण और परावर्तन कोण हमेशा बराबर क्यों होते हैं?',
          'काँच में प्रवेश करने पर प्रकाश की किरण क्यों मुड़ती है?',
        ];
      case 'heat_transfer_lab':
        return [
          'ताँबे में काँच की तुलना में ऊष्मा तेज़ी से क्यों चलती है?',
          'चालन और संवहन में सरल अंतर समझाइए।',
        ];
      case 'sound_wave_lab':
        return [
          'आवृत्ति (तारत्व) और आयाम (प्रबलता) में क्या अंतर है?',
          'स्पष्ट प्रतिध्वनि सुनने के लिए न्यूनतम दूरी क्यों आवश्यक है?',
        ];
      case 'motion_kinematics':
        return [
          'दूरी और विस्थापन में उदाहरण सहित क्या अंतर है?',
          'वेग और त्वरण आपस में कैसे जुड़े हैं?',
        ];
      case 'force_friction_buoyancy':
        return [
          'कुछ वस्तुएँ पानी में क्यों तैरती हैं और कुछ क्यों डूब जाती हैं?',
          'घर्षण बल चलती हुई वस्तु की गति को कैसे प्रभावित करता है?',
        ];
      case 'simple_machines_energy':
        return [
          'लोलक में स्थितिज और गतिज ऊर्जा कैसे बदलती हैं?',
          'घिरनी भारी वस्तु उठाने को आसान कैसे बनाती है?',
        ];
      default:
        return [
          'चुंबकीय क्षेत्र रेखाएँ कभी एक-दूसरे को क्यों नहीं काटतीं?',
          'ध्रुवों के पास चुंबकीय क्षेत्र सबसे अधिक क्यों होता है?',
        ];
    }
  }

  switch (engineId) {
    case 'electric_circuit_lab':
      return [
        'Why does current increase when I raise battery voltage?',
        'How is a series circuit different from a parallel circuit?',
      ];
    case 'optics_ray_lab':
      return [
        'Why does a light ray bend when entering glass?',
        'What is the difference between a real image and a virtual image?',
      ];
    case 'heat_transfer_lab':
      return [
        'Why does copper conduct heat faster than glass?',
        'What is the difference between conduction and convection?',
      ];
    case 'sound_wave_lab':
      return [
        'How do frequency and amplitude change a sound wave?',
        'Why must a wall be at least ~17 m away to hear a distinct echo?',
      ];
    case 'motion_kinematics':
      return [
        'What is the difference between distance and displacement?',
        'How does positive acceleration change velocity over time?',
      ];
    case 'force_friction_buoyancy':
      return [
        'Why do some objects float in water while others sink?',
        'What happens when applied push exceeds friction force?',
      ];
    case 'simple_machines_energy':
      return [
        'How do kinetic and potential energy trade off as the bob swings?',
        'How do extra pulley strands reduce the effort force needed?',
      ];
    default:
      return [
        'Why do magnetic field lines never intersect?',
        'How does rotating the bar magnet affect the compass needle?',
      ];
  }
}

interface BrowserSpeechRecognitionAlternative {
  transcript?: string;
}

interface BrowserSpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: BrowserSpeechRecognitionAlternative;
}

interface BrowserSpeechRecognitionEvent {
  results: ArrayLike<BrowserSpeechRecognitionResult>;
}

interface BrowserSpeechRecognitionErrorEvent {
  error?: string;
}

interface BrowserSpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((ev: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type BrowserSpeechRecognitionCtor = new () => BrowserSpeechRecognitionInstance;

function getBrowserSpeechRecognitionCtor(): BrowserSpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: BrowserSpeechRecognitionCtor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionCtor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

function getSpeechRecLangTag(lang: LanguageCode): string {
  if (lang === 'kn') return 'kn-IN';
  if (lang === 'hi') return 'hi-IN';
  return 'en-IN';
}

function pickSupportedRecorderMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
  ];
  return candidates.find((c) => {
    try {
      return typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(c);
    } catch {
      return false;
    }
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const VoiceTutorPanel: React.FC<VoiceTutorPanelProps> = ({
  t,
  language,
  onLanguageChange,
  activeAdaptiveId,
  experimentContextSummary,
  selectedComponent = null,
  messages,
  sessionContext,
  isAsking,
  errorMsg,
  onAskTutor,
  onCancelAsk,
  onApplyParameterSuggestion,
  appliedSuggestionIds = {},
  onResetAdaptiveSimulation,
  onClearConversation,
  onCloseDrawer,
  variant = 'sidepanel',
}) => {
  const [textQuestion, setTextQuestion] = useState('');
  const [micStatus, setMicStatus] = useState<TutorMicStatus>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micLevelPct, setMicLevelPct] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [transcriptReadyHint, setTranscriptReadyHint] = useState<string | null>(null);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [lastAskAttempt, setLastAskAttempt] = useState<{
    textQuestion: string;
    forceAlternativeStrategy?: boolean;
    requestedStyle?: TutorRequestedStyle;
    languageOverride?: LanguageCode;
  } | null>(null);
  const [audioState, setAudioState] = useState<TutorAudioSnapshot>({
    status: 'idle',
    messageId: null,
    provider: null,
    errorNote: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speechRecRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const speechRecTranscriptRef = useRef('');
  const isStartingMicRef = useRef(false);
  const cancelledRef = useRef(false);
  const hadVoiceSignalRef = useRef(false);
  const transcribeAbortRef = useRef<AbortController | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioControllerRef = useRef<TutorAudioController | null>(null);
  const languageRef = useRef<LanguageCode>(language);
  const lastAutoSpokenIdRef = useRef<string | null>(null);
  const shouldAutoSpeakNextRef = useRef(false);

  languageRef.current = language;

  const focusEditableTranscriptBox = () => {
    window.setTimeout(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        const end = el.value.length;
        el.setSelectionRange?.(end, end);
      }
    }, 30);
  };

  useEffect(() => {
    if (!onCloseDrawer) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && micStatus !== 'recording' && micStatus !== 'requesting_permission') {
        audioControllerRef.current?.stop();
        onCloseDrawer();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCloseDrawer, micStatus]);

  useEffect(() => {
    const controller = new TutorAudioController((next) => {
      setAudioState(next);
    });
    audioControllerRef.current = controller;
    return () => {
      controller.dispose();
      audioControllerRef.current = null;
    };
  }, []);

  const cleanupRecordingStream = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (levelRafRef.current !== null) {
      window.cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    setMicLevelPct(0);
    if (audioCtxRef.current) {
      try {
        void audioCtxRef.current.close();
      } catch {
        // ignore AudioContext close errors
      }
      audioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    if (speechRecRef.current) {
      const sr = speechRecRef.current;
      speechRecRef.current = null;
      sr.onstart = null;
      sr.onresult = null;
      sr.onerror = null;
      sr.onend = null;
      try {
        sr.abort();
      } catch {
        // ignore cleanup abort errors
      }
    }
  };

  useEffect(() => {
    return () => {
      cleanupRecordingStream();
      if (transcribeAbortRef.current && !transcribeAbortRef.current.signal.aborted) {
        transcribeAbortRef.current.abort('COMPONENT_UNMOUNTED');
      }
      transcribeAbortRef.current = null;
    };
  }, []);

  // Scroll conversation thread smoothly when new messages or streamed tokens arrive
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isAsking]);

  // Auto-play spoken reply only after streaming finishes so full sentences play smoothly
  useEffect(() => {
    if (messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (
      latest.role === 'tutor' &&
      !latest.isStreaming &&
      (autoSpeakEnabled || shouldAutoSpeakNextRef.current) &&
      lastAutoSpokenIdRef.current !== latest.id
    ) {
      lastAutoSpokenIdRef.current = latest.id;
      shouldAutoSpeakNextRef.current = false;
      const speechText = latest.spokenSummary || latest.text;
      void audioControllerRef.current?.playMessage(latest.id, speechText, latest.language);
    }
  }, [messages, autoSpeakEnabled]);

  const startBrowserSpeechRecognitionFallback = (): boolean => {
    const SpeechRecCtor = getBrowserSpeechRecognitionCtor();
    if (!SpeechRecCtor) return false;

    try {
      const rec = new SpeechRecCtor();
      speechRecRef.current = rec;
      speechRecTranscriptRef.current = '';
      rec.lang = getSpeechRecLangTag(languageRef.current);
      rec.interimResults = true;
      rec.continuous = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setMicStatus('recording');
        timerRef.current = window.setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      rec.onresult = (ev) => {
        let combined = '';
        for (let i = 0; i < ev.results.length; i++) {
          const item = ev.results[i]?.[0]?.transcript || '';
          combined += item;
        }
        speechRecTranscriptRef.current = combined.trim();
        if (combined.trim()) {
          hadVoiceSignalRef.current = true;
          setMicLevelPct(65);
        }
      };

      rec.onerror = (ev) => {
        cleanupRecordingStream();
        const code = ev?.error || '';
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setMicError(t.voiceTutor.micPermissionDeniedError);
        } else if (code === 'audio-capture') {
          setMicError(t.voiceTutor.micNotFoundError);
        } else if (code === 'no-speech') {
          setMicError(t.voiceTutor.emptyRecordingError);
        } else {
          setMicError(t.voiceTutor.recordingInterruptedError);
        }
        setMicStatus('error');
      };

      rec.onend = () => {
        const wasCancelled = cancelledRef.current;
        const captured = speechRecTranscriptRef.current.trim();
        cleanupRecordingStream();
        if (wasCancelled) {
          setMicStatus('idle');
          return;
        }
        if (!captured) {
          setMicError(t.voiceTutor.emptyRecordingError);
          setMicStatus('error');
          return;
        }
        setTextQuestion((prev) => (prev.trim() ? `${prev.trim()} ${captured}` : captured));
        shouldAutoSpeakNextRef.current = true;
        setTranscriptReadyHint(t.voiceTutor.transcriptPreviewHint);
        setMicStatus('transcript_ready');
        focusEditableTranscriptBox();
      };

      rec.start();
      return true;
    } catch {
      cleanupRecordingStream();
      return false;
    }
  };

  const handleStartRecording = async () => {
    if (
      isStartingMicRef.current ||
      micStatus === 'requesting_permission' ||
      micStatus === 'recording' ||
      micStatus === 'transcribing' ||
      isAsking
    ) {
      return;
    }

    isStartingMicRef.current = true;
    setMicError(null);
    setTranscriptReadyHint(null);
    audioControllerRef.current?.stop();
    audioControllerRef.current?.unlock();

    try {
      if (typeof window !== 'undefined') {
        const isLocalhost =
          window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!window.isSecureContext && !isLocalhost) {
          setMicError(t.voiceTutor.micInsecureContextError);
          setMicStatus('error');
          return;
        }
      }

      if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
        try {
          const permStatus = await navigator.permissions.query({
            name: 'microphone' as PermissionName,
          });
          if (permStatus.state === 'denied') {
            setMicError(t.voiceTutor.micBlockedSettingsError);
            setMicStatus('error');
            return;
          }
        } catch {
          // Safari/Firefox may not support permissions.query({ name: 'microphone' })
        }
      }

      cancelledRef.current = false;
      hadVoiceSignalRef.current = false;
      chunksRef.current = [];
      setRecordingSeconds(0);
      setMicLevelPct(0);

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined'
      ) {
        setMicStatus('requesting_permission');
        if (!startBrowserSpeechRecognitionFallback()) {
          setMicError(t.voiceTutor.micUnsupportedError);
          setMicStatus('error');
        }
        return;
      }

      setMicStatus('requesting_permission');

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (constraintErr: unknown) {
        const cname = (constraintErr as { name?: string })?.name;
        if (cname === 'OverconstrainedError' || cname === 'ConstraintNotSatisfiedError') {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw constraintErr;
        }
      }

      mediaStreamRef.current = stream;
      const audioTracks = stream.getAudioTracks();
      const liveTrack = audioTracks.find((tr) => tr.readyState === 'live');
      if (audioTracks.length === 0 || !liveTrack) {
        cleanupRecordingStream();
        setMicError(t.voiceTutor.micNotFoundError);
        setMicStatus('error');
        return;
      }

      liveTrack.onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          cancelledRef.current = true;
          try {
            mediaRecorderRef.current.stop();
          } catch {
            cleanupRecordingStream();
          }
          setMicError(t.voiceTutor.recordingInterruptedError);
          setMicStatus('error');
        }
      };

      // Live mic level meter using Web Audio AnalyserNode (helps verify mic is receiving voice)
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          if (ctx.state === 'suspended') {
            void ctx.resume().catch(() => {});
          }
          const srcNode = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          srcNode.connect(analyser);
          const timeBuf = new Uint8Array(analyser.fftSize);
          const pollLevel = () => {
            if (!audioCtxRef.current || mediaRecorderRef.current?.state !== 'recording') return;
            analyser.getByteTimeDomainData(timeBuf);
            let peak = 0;
            for (let i = 0; i < timeBuf.length; i++) {
              const amp = Math.abs(timeBuf[i] - 128);
              if (amp > peak) peak = amp;
            }
            const pct = Math.min(100, Math.round((peak / 48) * 100));
            if (peak >= 2) hadVoiceSignalRef.current = true;
            setMicLevelPct(pct);
            levelRafRef.current = window.requestAnimationFrame(pollLevel);
          };
          levelRafRef.current = window.requestAnimationFrame(pollLevel);
        }
      } catch {
        // Level meter is progressive enhancement; never block recording
      }

      const preferredMime = pickSupportedRecorderMime();
      let recorder: MediaRecorder;
      try {
        recorder = preferredMime
          ? new MediaRecorder(stream, { mimeType: preferredMime })
          : new MediaRecorder(stream);
      } catch {
        try {
          recorder = new MediaRecorder(stream);
        } catch {
          cleanupRecordingStream();
          if (!startBrowserSpeechRecognitionFallback()) {
            setMicError(t.voiceTutor.micFormatError);
            setMicStatus('error');
          }
          return;
        }
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        cleanupRecordingStream();
        setMicStatus('error');
        setMicError(t.voiceTutor.recordingInterruptedError);
      };

      recorder.onstop = () => {
        const wasCancelled = cancelledRef.current;
        const firstChunkType = chunksRef.current.find((c) => Boolean(c.type))?.type;
        const resolvedMime =
          recorder.mimeType || firstChunkType || preferredMime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: resolvedMime });
        chunksRef.current = [];
        cleanupRecordingStream();

        if (wasCancelled) {
          setMicStatus('idle');
          return;
        }

        if (blob.size < 300) {
          setMicError(t.voiceTutor.emptyRecordingError);
          setMicStatus('error');
          return;
        }

        setMicStatus('transcribing');
        const reader = new FileReader();
        reader.onerror = () => {
          setMicError(t.voiceTutor.recordingInterruptedError);
          setMicStatus('error');
        };
        reader.onloadend = async () => {
          const sttController = new AbortController();
          transcribeAbortRef.current = sttController;
          try {
            const dataUrl = String(reader.result || '');
            const base64 = dataUrl.split(',')[1] || '';
            if (!base64) {
              setMicError(t.voiceTutor.emptyRecordingError);
              setMicStatus('error');
              return;
            }

            const result = await transcribeStudentAudio(
              {
                audioBase64: base64,
                audioMimeType: resolvedMime,
                preferredLanguage: languageRef.current,
              },
              sttController.signal
            );

            if (result.unclearSpeech || !result.transcript.trim()) {
              setMicError(result.note || t.voiceTutor.emptyRecordingError);
              setMicStatus('error');
              return;
            }

            if (result.detectedLanguage !== languageRef.current) {
              onLanguageChange(result.detectedLanguage);
            }

            setTextQuestion((prev) =>
              prev.trim() ? `${prev.trim()} ${result.transcript}` : result.transcript
            );
            shouldAutoSpeakNextRef.current = true;
            setTranscriptReadyHint(t.voiceTutor.transcriptPreviewHint);
            setMicStatus('transcript_ready');
            focusEditableTranscriptBox();
          } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === 'USER_CANCELLED' || code === 'COMPONENT_UNMOUNTED') {
              setMicStatus('idle');
              return;
            }
            setMicError(
              err instanceof Error ? err.message : t.voiceTutor.recordingInterruptedError
            );
            setMicStatus('error');
          } finally {
            if (transcribeAbortRef.current === sttController) {
              transcribeAbortRef.current = null;
            }
          }
        };
        reader.readAsDataURL(blob);
      };

      // Single-shot start() avoids fragmented multi-chunk WebM/MP4 headers on mobile & Safari
      recorder.start();
      setMicStatus('recording');
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      cleanupRecordingStream();
      setMicStatus('error');
      const domErr = err as { name?: string };
      if (domErr?.name === 'NotAllowedError' || domErr?.name === 'PermissionDeniedError') {
        let isBlocked = false;
        if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
          try {
            const check = await navigator.permissions.query({
              name: 'microphone' as PermissionName,
            });
            isBlocked = check.state === 'denied';
          } catch {
            // ignore
          }
        }
        setMicError(
          isBlocked ? t.voiceTutor.micBlockedSettingsError : t.voiceTutor.micPermissionDeniedError
        );
      } else if (domErr?.name === 'NotFoundError' || domErr?.name === 'DevicesNotFoundError') {
        setMicError(t.voiceTutor.micNotFoundError);
      } else if (
        domErr?.name === 'NotReadableError' ||
        domErr?.name === 'TrackStartError' ||
        domErr?.name === 'AbortError'
      ) {
        setMicError(t.voiceTutor.micBusyError);
      } else if (domErr?.name === 'SecurityError') {
        setMicError(t.voiceTutor.micInsecureContextError);
      } else if (domErr?.name === 'NotSupportedError') {
        setMicError(t.voiceTutor.micFormatError);
      } else {
        setMicError(t.voiceTutor.micUnsupportedError);
      }
    } finally {
      isStartingMicRef.current = false;
    }
  };

  const handleStopRecording = () => {
    audioControllerRef.current?.unlock();
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      cancelledRef.current = false;
      rec.stop();
      return;
    }
    const sr = speechRecRef.current;
    if (sr) {
      cancelledRef.current = false;
      sr.stop();
    }
  };

  const handleCancelRecording = () => {
    const rec = mediaRecorderRef.current;
    const sr = speechRecRef.current;
    cancelledRef.current = true;
    if (transcribeAbortRef.current && !transcribeAbortRef.current.signal.aborted) {
      transcribeAbortRef.current.abort('USER_CANCELLED');
    }
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    } else if (sr) {
      sr.stop();
    } else {
      cleanupRecordingStream();
      setMicStatus('idle');
    }
    setRecordingSeconds(0);
    setTranscriptReadyHint(null);
  };

  const runAskTutor = async (payload: {
    textQuestion: string;
    forceAlternativeStrategy?: boolean;
    requestedStyle?: TutorRequestedStyle;
    languageOverride?: LanguageCode;
    isRetry?: boolean;
  }) => {
    audioControllerRef.current?.unlock();
    setLastAskAttempt({
      textQuestion: payload.textQuestion,
      forceAlternativeStrategy: payload.forceAlternativeStrategy,
      requestedStyle: payload.requestedStyle,
      languageOverride: payload.languageOverride,
    });
    await onAskTutor(payload);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (
      isAsking ||
      micStatus === 'requesting_permission' ||
      micStatus === 'recording' ||
      micStatus === 'transcribing'
    ) {
      return;
    }
    setMicError(null);

    const trimmed = textQuestion.trim();
    if (!trimmed) {
      setMicError(t.voiceTutor.emptyQuestionError);
      return;
    }

    audioControllerRef.current?.stop();
    audioControllerRef.current?.unlock();
    setTextQuestion('');
    setTranscriptReadyHint(null);
    if (micStatus === 'transcript_ready') {
      setMicStatus('idle');
    }
    await runAskTutor({
      textQuestion: trimmed,
      forceAlternativeStrategy: false,
      requestedStyle: 'auto',
    });
  };

  const handleQuickFollowUp = async (
    style: TutorRequestedStyle,
    labelText: string,
    forceAlternative = false,
    languageOverride?: LanguageCode
  ) => {
    if (
      isAsking ||
      micStatus === 'requesting_permission' ||
      micStatus === 'recording' ||
      micStatus === 'transcribing'
    ) {
      return;
    }
    audioControllerRef.current?.stop();
    if (languageOverride && languageOverride !== language) {
      onLanguageChange(languageOverride);
    }
    await runAskTutor({
      textQuestion: labelText,
      forceAlternativeStrategy: forceAlternative,
      requestedStyle: style,
      languageOverride,
    });
  };

  const componentPrompts = useMemo(() => {
    if (!selectedComponent) return [];
    const preset = COMPONENT_SUGGESTED_QUESTIONS[selectedComponent.id];
    if (preset) {
      return preset[language] || preset.en;
    }
    return buildGenericComponentPrompts(selectedComponent.name, language);
  }, [selectedComponent, language]);

  const starterPrompts = useMemo(
    () => buildStarterPrompts(experimentContextSummary?.engineId, language),
    [experimentContextSummary?.engineId, language]
  );

  const hasStreamingTutorMsg = useMemo(
    () => messages.some((m) => m.role === 'tutor' && Boolean(m.isStreaming)),
    [messages]
  );

  const statusInfo = useMemo<{
    label: string;
    tone: 'ready' | 'listening' | 'processing' | 'speaking' | 'paused' | 'error';
  }>(() => {
    if (micStatus === 'requesting_permission') {
      return { label: t.voiceTutor.requestingPermissionLabel, tone: 'processing' };
    }
    if (micStatus === 'recording') {
      return {
        label: `${t.voiceTutor.recordingLabel} · ${formatDuration(recordingSeconds)}`,
        tone: 'listening',
      };
    }
    if (micStatus === 'transcribing') {
      return { label: t.voiceTutor.transcribingLabel, tone: 'processing' };
    }
    if (hasStreamingTutorMsg) {
      return { label: t.voiceTutor.streamingLabel, tone: 'processing' };
    }
    if (isAsking) {
      return { label: t.voiceTutor.processingLabel, tone: 'processing' };
    }
    if (audioState.status === 'preparing') {
      return { label: t.voiceTutor.preparingVoiceLabel, tone: 'processing' };
    }
    if (audioState.status === 'playing') {
      return { label: t.voiceTutor.speakingLabel, tone: 'speaking' };
    }
    if (audioState.status === 'paused') {
      return { label: t.voiceTutor.pausedLabel, tone: 'paused' };
    }
    if (micStatus === 'error' || Boolean(errorMsg) || audioState.status === 'error') {
      return { label: t.voiceTutor.errorLabel, tone: 'error' };
    }
    if (micStatus === 'transcript_ready') {
      return { label: t.voiceTutor.transcriptReadyLabel, tone: 'ready' };
    }
    return { label: t.voiceTutor.readyLabel, tone: 'ready' };
  }, [
    micStatus,
    recordingSeconds,
    hasStreamingTutorMsg,
    isAsking,
    audioState.status,
    errorMsg,
    t.voiceTutor,
  ]);

  const latestTutorMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'tutor') return messages[i].id;
    }
    return null;
  }, [messages]);

  return (
    <section
      aria-labelledby="voice-tutor-heading"
      data-testid="voice-tutor-panel"
      className={
        variant === 'drawer'
          ? 'flex flex-col h-full bg-white overflow-hidden'
          : 'flex flex-col h-full clay-card overflow-hidden'
      }
    >
      {/* Compact Sticky Header */}
      <div className="px-4 py-3 border-b border-[#EFE7DF] bg-[#FFF9F4]/80 shrink-0 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C96D12]">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t.voiceTutor.title}</span>
            </div>
            {experimentContextSummary?.experimentTitle && (
              <p className="text-xs font-medium text-[#171A2F] truncate">
                {experimentContextSummary.classLevel
                  ? `${t.classLibrary.classPrefix} ${experimentContextSummary.classLevel} · `
                  : ''}
                {experimentContextSummary.experimentTitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                audioControllerRef.current?.unlock();
                setAutoSpeakEnabled((prev) => {
                  const next = !prev;
                  if (!next) audioControllerRef.current?.stop();
                  return next;
                });
              }}
              aria-pressed={autoSpeakEnabled}
              title={autoSpeakEnabled ? 'Auto-voice On' : 'Auto-voice Muted'}
              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer min-h-[36px] ${
                autoSpeakEnabled
                  ? 'bg-[#FFF3E3] border-[#F49A3C]/45 text-[#171A2F]'
                  : 'bg-white border-[#EFE7DF] text-[#6F7487]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{autoSpeakEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
            {messages.length > 0 && onClearConversation && (
              <button
                type="button"
                onClick={() => {
                  audioControllerRef.current?.stop();
                  onClearConversation();
                }}
                title={t.voiceTutor.clearChatBtn}
                aria-label={t.voiceTutor.clearChatBtn}
                className="p-2 rounded-lg border border-[#EFE7DF] bg-white text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onCloseDrawer && (
              <button
                type="button"
                data-testid="voice-tutor-close-btn"
                onClick={() => {
                  audioControllerRef.current?.stop();
                  onCloseDrawer();
                }}
                aria-label={t.voiceTutor.closeTutorDrawerBtn}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[36px]"
              >
                <X className="w-4 h-4" />
                <span className="sr-only sm:not-sr-only">{t.voiceTutor.closeTutorDrawerBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Manual Language Switcher inside Tutor + Live Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="group"
            aria-label={t.languages.selectorLabel}
            className="inline-flex items-center rounded-lg bg-[#F3EAE1]/70 p-0.5 border border-[#EFE7DF]"
          >
            {(
              [
                { code: 'en' as LanguageCode, label: 'English' },
                { code: 'kn' as LanguageCode, label: 'ಕನ್ನಡ' },
                { code: 'hi' as LanguageCode, label: 'हिन्दी' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  audioControllerRef.current?.stop();
                  onLanguageChange(opt.code);
                }}
                aria-pressed={language === opt.code}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === opt.code
                    ? 'bg-[#F49A3C] text-white'
                    : 'text-[#171A2F] hover:bg-white/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span
            role="status"
            data-testid="voice-tutor-status-badge"
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold font-mono-tabular px-2 py-0.5 rounded-md border ${
              statusInfo.tone === 'error'
                ? 'bg-[#FDF2F0] border-[#E5B8B0] text-[#7A271A]'
                : statusInfo.tone === 'listening'
                  ? 'bg-[#FDF2F0] border-[#E5B8B0] text-[#7A271A]'
                  : statusInfo.tone === 'speaking'
                    ? 'bg-[#FFF3E3] border-[#F49A3C]/45 text-[#171A2F]'
                    : statusInfo.tone === 'processing'
                      ? 'bg-[#FFF3E3]/60 border-[#EFE7DF] text-[#C96D12]'
                      : 'bg-white border-[#EFE7DF] text-[#5C5148]'
            }`}
          >
            {statusInfo.tone === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
            {statusInfo.tone === 'listening' && (
              <span className="w-2 h-2 rounded-full bg-[#B83A2D] animate-pulse" />
            )}
            {statusInfo.tone === 'speaking' && (
              <Volume2 className="w-3.5 h-3.5 text-[#C96D12]" />
            )}
            {statusInfo.tone === 'error' && <AlertCircle className="w-3 h-3" />}
            {statusInfo.tone === 'ready' && (
              <span className="w-2 h-2 rounded-full bg-[#F49A3C]" />
            )}
            <span>{statusInfo.label}</span>
          </span>
        </div>

        {activeAdaptiveId !== 'bar_magnet_explorer' && (
          <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
            <span className="text-[#C96D12] font-medium truncate">
              {t.voiceTutor.adaptiveSimLabel}
            </span>
            <button
              type="button"
              onClick={onResetAdaptiveSimulation}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#EFE7DF] bg-white font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3 text-[#C96D12]" />
              <span>{t.voiceTutor.returnDefaultSimBtn}</span>
            </button>
          </div>
        )}
      </div>

      {/* Independently Scrollable Conversation Area */}
      <div
        ref={scrollContainerRef}
        data-testid="voice-tutor-scroll-area"
        className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 min-h-0"
      >
        {/* Focused Simulation Component Card */}
        {selectedComponent && (
          <div
            data-testid="voice-tutor-component-context"
            className="rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] p-3 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <span className="font-semibold text-[#C96D12]">
                {t.voiceTutor.focusedComponentLabel}:{' '}
                <span className="text-[#171A2F]">{selectedComponent.name}</span>
              </span>
              {selectedComponent.currentState && (
                <span className="text-[11px] text-[#6F7487] font-mono-tabular">
                  {selectedComponent.currentState}
                </span>
              )}
            </div>

            <div
              data-testid="voice-tutor-component-quick-actions"
              className="grid grid-cols-2 gap-1.5 pt-0.5"
            >
              {(
                [
                  {
                    key: 'simple',
                    label: t.voiceTutor.quickCompSimple,
                    style: 'simpler' as TutorRequestedStyle,
                    prompt: `${t.voiceTutor.quickCompSimple}: ${selectedComponent.name}`,
                  },
                  {
                    key: 'step',
                    label: t.voiceTutor.quickCompStepByStep,
                    style: 'step_by_step' as TutorRequestedStyle,
                    prompt: `${t.voiceTutor.quickCompStepByStep}: ${selectedComponent.name}`,
                  },
                  {
                    key: 'why',
                    label: t.voiceTutor.quickCompWhyUsed,
                    style: 'auto' as TutorRequestedStyle,
                    prompt: `${selectedComponent.name} — ${t.voiceTutor.quickCompWhyUsed}`,
                  },
                  {
                    key: 'change',
                    label: t.voiceTutor.quickCompChangeValue,
                    style: 'visual' as TutorRequestedStyle,
                    prompt: `${selectedComponent.name} — ${t.voiceTutor.quickCompChangeValue}`,
                  },
                  {
                    key: 'example',
                    label: t.voiceTutor.quickCompRealExample,
                    style: 'analogy' as TutorRequestedStyle,
                    prompt: `${selectedComponent.name} — ${t.voiceTutor.quickCompRealExample}`,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  data-testid={`voice-tutor-comp-action-${item.key}`}
                  disabled={isAsking || micStatus === 'recording' || micStatus === 'transcribing'}
                  onClick={() => {
                    audioControllerRef.current?.stop();
                    shouldAutoSpeakNextRef.current = false;
                    void runAskTutor({
                      textQuestion: item.prompt,
                      requestedStyle: item.style,
                    });
                  }}
                  className="text-left text-[11px] font-medium text-[#171A2F] bg-white hover:bg-[#FFF3E3]/60 border border-[#EFE7DF] rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                data-testid="voice-tutor-comp-action-another"
                disabled={micStatus === 'recording' || micStatus === 'transcribing'}
                onClick={() => {
                  textareaRef.current?.focus();
                  textareaRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }}
                className="text-left text-[11px] font-semibold text-[#C96D12] bg-white hover:bg-[#FFF3E3]/60 border border-[#F49A3C]/35 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {t.voiceTutor.quickCompAnother}
              </button>
            </div>

            {componentPrompts.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-[#EFE7DF]/60">
                <p className="text-[11px] font-medium text-[#6F7487]">
                  {t.voiceTutor.contextualSuggestionsLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {componentPrompts.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      disabled={isAsking || micStatus === 'recording' || micStatus === 'transcribing'}
                      onClick={() => {
                        audioControllerRef.current?.stop();
                        shouldAutoSpeakNextRef.current = false;
                        void runAskTutor({
                          textQuestion: promptText,
                          requestedStyle: 'auto',
                        });
                      }}
                      className="text-left text-[11px] font-medium text-[#171A2F] bg-white hover:bg-[#FFF3E3]/60 border border-[#EFE7DF] rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty / Welcome State */}
        {messages.length === 0 && !isAsking && (
          <div className="rounded-xl border border-[#EFE7DF] bg-[#FFF9F4]/75 p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#171A2F]">
                {t.voiceTutor.welcomeTitle}
              </p>
              <p className="text-xs text-[#6F7487] leading-relaxed">
                {t.voiceTutor.welcomeHint}
              </p>
            </div>
            <div className="space-y-1.5">
              {starterPrompts.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => {
                    audioControllerRef.current?.stop();
                    shouldAutoSpeakNextRef.current = false;
                    void runAskTutor({
                      textQuestion: starter,
                      requestedStyle: 'auto',
                    });
                  }}
                  className="w-full text-left text-xs font-medium text-[#171A2F] bg-white hover:bg-[#FFF3E3]/55 border border-[#EFE7DF] rounded-lg px-3 py-2 transition-colors cursor-pointer"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Multi-turn Conversation Bubbles */}
        {messages.map((msg) => {
          if (msg.role === 'student') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-br-sm bg-[#F49A3C] text-white px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          const isThisMessageActive = audioState.messageId === msg.id;
          const isPreparingThis = isThisMessageActive && audioState.status === 'preparing';
          const isPlayingThis = isThisMessageActive && audioState.status === 'playing';
          const isPausedThis = isThisMessageActive && audioState.status === 'paused';
          const hasAudioErrThis = isThisMessageActive && audioState.status === 'error';
          const isLatestTutorMsg = msg.id === latestTutorMessageId;
          const isSuggestionApplied = Boolean(appliedSuggestionIds[msg.id]);

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="w-full rounded-2xl rounded-bl-sm bg-[#FFF9F4] border border-[#EFE7DF] p-3.5 space-y-2.5 text-[#171A2F]">
                {/* Inline pedagogical header (no pill clutter) */}
                {(msg.teachingStrategy || msg.misunderstoodConcept) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6F7487] border-b border-[#EFE7DF]/80 pb-2">
                    <span className="font-semibold text-[#C96D12]">
                      {msg.teachingStrategy
                        ? t.voiceTutor.strategies[msg.teachingStrategy] || msg.teachingStrategy
                        : t.voiceTutor.personalizedExplanationLabel}
                    </span>
                    {msg.misunderstoodConcept && (
                      <span className="truncate max-w-[200px] text-[#171A2F]">
                        {msg.misunderstoodConcept}
                      </span>
                    )}
                  </div>
                )}

                {msg.needsLanguageClarification && msg.clarificationMessage && (
                  <p className="text-xs text-[#C96D12] bg-white border border-[#EFE7DF] rounded-lg px-2.5 py-1.5">
                    {msg.clarificationMessage}
                  </p>
                )}

                {/* Natural Conversational Explanation */}
                {msg.isStreaming && (
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-[#C96D12]">
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{t.voiceTutor.streamingLabel}</span>
                    </span>
                    {onCancelAsk && (
                      <button
                        type="button"
                        onClick={onCancelAsk}
                        className="px-2 py-0.5 rounded border border-[#EFE7DF] bg-white text-[11px] font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer"
                      >
                        {t.voiceTutor.cancelButton}
                      </button>
                    )}
                  </div>
                )}

                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-[#171A2F]">
                  {msg.text}
                </p>

                {/* Optional Visual Suggestion / Experiment Note */}
                {msg.alternativeExperimentNote && (
                  <div className="p-2.5 rounded-lg bg-[#FFF3E3]/45 border border-[#EFE7DF] text-xs text-[#171A2F] leading-relaxed">
                    {msg.alternativeExperimentNote}
                  </div>
                )}

                {msg.parameterAdjustments && onApplyParameterSuggestion && (
                  <button
                    type="button"
                    disabled={isSuggestionApplied}
                    onClick={() => onApplyParameterSuggestion(msg.parameterAdjustments!, msg.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[36px] ${
                      isSuggestionApplied
                        ? 'bg-[#FFF3E3] border-[#F49A3C] text-[#171A2F]'
                        : 'bg-white border-[#F49A3C] text-[#C96D12] hover:bg-[#F49A3C] hover:text-white'
                    }`}
                  >
                    {isSuggestionApplied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isSuggestionApplied
                        ? t.voiceTutor.appliedSuggestionLabel
                        : msg.parameterAdjustments.summaryLabel ||
                          t.voiceTutor.applySuggestionBtn}
                    </span>
                  </button>
                )}

                {/* Follow-up prompt from tutor */}
                {msg.followUpQuestion && (
                  <p className="text-xs text-[#6F7487] italic leading-relaxed">
                    {msg.followUpQuestion}
                  </p>
                )}

                {/* Audio Playback Controls: shown once streaming finishes */}
                {!msg.isStreaming && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#EFE7DF]/80">
                  {!isPlayingThis && !isPausedThis && !isPreparingThis && (
                    <button
                      type="button"
                      onClick={() => {
                        const speechText = msg.spokenSummary || msg.text;
                        void audioControllerRef.current?.playMessage(
                          msg.id,
                          speechText,
                          msg.language
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-xs font-semibold hover:bg-[#FFE6C7] cursor-pointer min-h-[36px]"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#C96D12]" />
                      <span>{t.voiceTutor.playBtn}</span>
                    </button>
                  )}

                  {isPreparingThis && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF3E3]/70 text-xs font-medium text-[#C96D12] min-h-[36px]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.voiceTutor.preparingVoiceLabel}</span>
                    </span>
                  )}

                  {isPlayingThis && (
                    <button
                      type="button"
                      onClick={() => void audioControllerRef.current?.pause()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-xs font-semibold hover:bg-[#FFE6C7] cursor-pointer min-h-[36px]"
                    >
                      <Pause className="w-3.5 h-3.5 text-[#C96D12]" />
                      <span>{t.voiceTutor.pauseBtn}</span>
                    </button>
                  )}

                  {isPausedThis && (
                    <button
                      type="button"
                      onClick={() => void audioControllerRef.current?.resume()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer min-h-[36px]"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{t.voiceTutor.resumeBtn}</span>
                    </button>
                  )}

                  {(isPlayingThis || isPausedThis) && (
                    <>
                      <button
                        type="button"
                        onClick={() => void audioControllerRef.current?.replay()}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-medium text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[36px]"
                      >
                        <RotateCcw className="w-3 h-3 text-[#C96D12]" />
                        <span>{t.voiceTutor.replayBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => audioControllerRef.current?.stop()}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-medium text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[36px]"
                      >
                        <Square className="w-3 h-3 text-[#C96D12]" />
                        <span>{t.voiceTutor.stopVoiceBtn}</span>
                      </button>
                    </>
                  )}
                </div>
                )}

                {(hasAudioErrThis || (isPausedThis && audioState.errorNote)) && audioState.errorNote && (
                  <div className="text-[11px] text-[#7A271A] bg-[#FDF2F0] border border-[#E5B8B0] rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                    <span>{audioState.errorNote}</span>
                    <button
                      type="button"
                      onClick={() => {
                        audioControllerRef.current?.unlock();
                        const speechText = msg.spokenSummary || msg.text;
                        void audioControllerRef.current?.playMessage(
                          msg.id,
                          speechText,
                          msg.language
                        );
                      }}
                      className="px-2 py-1 rounded bg-white border border-[#E5B8B0] font-semibold text-[#7A271A] hover:bg-[#FDF2F0] shrink-0 cursor-pointer"
                    >
                      {t.voiceTutor.retryBtn}
                    </button>
                  </div>
                )}

                {/* Adaptive Quick Follow-ups (All 9 Modes + Language Switch) on Latest Finalized Message */}
                {isLatestTutorMsg && !msg.isStreaming && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          { style: 'simpler' as TutorRequestedStyle, label: t.voiceTutor.quickSimpler },
                          { style: 'step_by_step' as TutorRequestedStyle, label: t.voiceTutor.quickStepByStep },
                          { style: 'real_life_example' as TutorRequestedStyle, label: t.voiceTutor.quickRealLife },
                          { style: 'analogy' as TutorRequestedStyle, label: t.voiceTutor.quickAnalogy },
                          { style: 'formula' as TutorRequestedStyle, label: t.voiceTutor.quickFormula },
                          { style: 'numerical' as TutorRequestedStyle, label: t.voiceTutor.quickNumerical },
                          {
                            style: 'component' as TutorRequestedStyle,
                            label: selectedComponent
                              ? `${t.voiceTutor.quickComponent}: ${selectedComponent.name}`
                              : t.voiceTutor.quickComponent,
                          },
                          { style: 'repeat' as TutorRequestedStyle, label: t.voiceTutor.quickRepeat },
                          { style: 'detailed' as TutorRequestedStyle, label: t.voiceTutor.quickDetailed },
                        ] as const
                      ).map((chip) => (
                        <button
                          key={chip.style}
                          type="button"
                          disabled={isAsking}
                          onClick={() =>
                            void handleQuickFollowUp(
                              chip.style,
                              `${chip.label} — ${msg.misunderstoodConcept || t.voiceTutor.tryAnotherButton}`,
                              chip.style !== 'repeat'
                            )
                          }
                          className="px-2.5 py-1 rounded-lg border border-[#EFE7DF] bg-white text-[11px] font-medium text-[#171A2F] hover:bg-[#FFF3E3]/55 disabled:opacity-50 cursor-pointer"
                        >
                          {chip.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={isAsking}
                        onClick={() =>
                          void handleQuickFollowUp(
                            'auto',
                            t.voiceTutor.tryAnotherButton,
                            true
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#EFE7DF] bg-white text-[11px] font-semibold text-[#C96D12] hover:bg-[#FFF3E3]/55 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{t.voiceTutor.tryAnotherButton}</span>
                      </button>
                    </div>

                    {/* Explain in another supported language */}
                    <div className="flex flex-wrap gap-1.5">
                      {(['en', 'kn', 'hi'] as LanguageCode[])
                        .filter((code) => code !== msg.language)
                        .map((targetCode) => {
                          const langLabel =
                            targetCode === 'en'
                              ? 'English'
                              : targetCode === 'kn'
                                ? 'ಕನ್ನಡ'
                                : 'हिन्दी';
                          return (
                            <button
                              key={targetCode}
                              type="button"
                              disabled={isAsking}
                              onClick={() =>
                                void handleQuickFollowUp(
                                  'repeat',
                                  `${t.voiceTutor.explainInLangPrefix} ${langLabel}: ${msg.misunderstoodConcept || msg.text.slice(0, 80)}`,
                                  false,
                                  targetCode
                                )
                              }
                              className="px-2.5 py-1 rounded-lg border border-[#F49A3C]/35 bg-white text-[11px] font-semibold text-[#C96D12] hover:bg-[#FFF3E3]/55 disabled:opacity-50 cursor-pointer"
                            >
                              {t.voiceTutor.explainInLangPrefix} {langLabel}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isAsking && !hasStreamingTutorMsg && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-[#FFF9F4] border border-[#EFE7DF] px-3.5 py-2.5 inline-flex items-center gap-2.5 text-xs text-[#C96D12] font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t.voiceTutor.thinkingLabel}</span>
              {onCancelAsk && (
                <button
                  type="button"
                  onClick={onCancelAsk}
                  className="ml-1 px-2 py-0.5 rounded border border-[#EFE7DF] bg-white text-[11px] font-semibold text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer"
                >
                  {t.voiceTutor.cancelButton}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Composer: Editable Transcript / Question Box + Mic + Send */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="px-3.5 py-3 border-t border-[#EFE7DF] bg-white shrink-0 space-y-2"
      >
        {(micError || errorMsg) && (
          <div
            role="alert"
            className="p-2.5 rounded-xl bg-[#FDF2F0] border border-[#E5B8B0] text-xs text-[#7A271A] flex items-center justify-between gap-2"
          >
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{micError || errorMsg}</span>
            </div>
            <button
              type="button"
              data-testid="voice-tutor-retry-btn"
              onClick={() => {
                if (micError) {
                  setMicError(null);
                  setMicStatus('idle');
                  void handleStartRecording();
                } else if (lastAskAttempt && !isAsking) {
                  audioControllerRef.current?.stop();
                  audioControllerRef.current?.unlock();
                  void runAskTutor({ ...lastAskAttempt, isRetry: true });
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5B8B0] text-[11px] font-semibold text-[#7A271A] hover:bg-[#FDF2F0] shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t.voiceTutor.retryBtn}</span>
            </button>
          </div>
        )}

        {transcriptReadyHint && (
          <p className="text-[11px] text-[#C96D12] font-medium px-0.5">
            {transcriptReadyHint}
          </p>
        )}

        <textarea
          ref={textareaRef}
          rows={2}
          value={textQuestion}
          onChange={(e) => {
            setTextQuestion(e.target.value);
            if (micStatus === 'transcript_ready') {
              setMicStatus('idle');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          disabled={
            isAsking ||
            micStatus === 'requesting_permission' ||
            micStatus === 'recording' ||
            micStatus === 'transcribing'
          }
          placeholder={t.voiceTutor.inputPlaceholder}
          aria-label={t.voiceTutor.inputPlaceholder}
          className="w-full rounded-xl border border-[#EFE7DF] bg-[#FFF9F4] px-3 py-2 text-xs sm:text-sm text-[#171A2F] placeholder:text-[#6F7487] focus:outline-2 focus:outline-[#F49A3C] resize-none"
        />

        <div className="flex items-center justify-between gap-2">
          {/* Mic Controls */}
          <div className="flex items-center gap-1.5">
            {micStatus !== 'recording' ? (
              <button
                type="button"
                data-testid="voice-tutor-mic-btn"
                disabled={
                  isAsking ||
                  micStatus === 'requesting_permission' ||
                  micStatus === 'transcribing'
                }
                onClick={() => void handleStartRecording()}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-xs font-semibold hover:bg-[#FFE6C7] disabled:opacity-50 transition-colors cursor-pointer min-h-[40px]"
              >
                {micStatus === 'requesting_permission' || micStatus === 'transcribing' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C96D12]" />
                ) : (
                  <Mic className="w-4 h-4 text-[#C96D12]" />
                )}
                <span>
                  {micStatus === 'requesting_permission'
                    ? t.voiceTutor.requestingPermissionLabel
                    : micStatus === 'transcribing'
                      ? t.voiceTutor.transcribingLabel
                      : t.voiceTutor.recordButton}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FDF2F0] border border-[#E5B8B0]">
                <span className="px-1.5 text-[11px] font-semibold text-[#7A271A] font-mono-tabular">
                  {formatDuration(recordingSeconds)}
                </span>
                <div
                  aria-hidden="true"
                  className="w-8 h-2 rounded-full bg-[#E5B8B0]/60 overflow-hidden"
                >
                  <div
                    className="h-full bg-[#B83A2D] transition-all duration-75"
                    style={{ width: `${Math.max(12, micLevelPct)}%` }}
                  />
                </div>
                <button
                  type="button"
                  data-testid="voice-tutor-stop-btn"
                  onClick={handleStopRecording}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer min-h-[34px]"
                >
                  <Square className="w-3 h-3" />
                  <span>{t.voiceTutor.stopButton}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelRecording}
                  aria-label={t.voiceTutor.cancelButton}
                  className="p-1.5 rounded-lg border border-[#EFE7DF] bg-white text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={
              isAsking ||
              micStatus === 'requesting_permission' ||
              micStatus === 'recording' ||
              micStatus === 'transcribing' ||
              textQuestion.trim().length === 0
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#F49A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#E5882A] disabled:bg-[#EFE7DF] disabled:text-[#6F7487] disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[40px] shrink-0"
          >
            {isAsking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{t.voiceTutor.sendButton}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#6F7487] flex items-center justify-between">
          <span>
            {t.voiceTutor.sessionTrackedNote}: {sessionContext.questionsAsked.length} ·{' '}
            {sessionContext.strategiesAttempted.length}
          </span>
        </p>
      </form>
    </section>
  );
};
