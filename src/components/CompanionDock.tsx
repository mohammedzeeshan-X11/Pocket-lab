import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  Flame,
  MessageSquareText,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { LanguageCode } from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import type {
  BadgeDefinition,
  CompanionMessageState,
  RewardProgressState,
} from '../types/companion';
import { BADGE_CATALOG, getRankForXp } from '../services/rewardsEngine';
import { TutorAudioController, type TutorAudioSnapshot } from '../utils/speechUtils';
import { transcribeStudentAudio } from '../services/explainabilityApi';
import { PhysixCompanionAvatar } from './PhysixCompanionAvatar';

interface CompanionDockProps {
  variant: 'dashboard' | 'floating';
  language: LanguageCode;
  t: TranslationBundle;
  message: CompanionMessageState;
  rewardState: RewardProgressState;
  latestBadgeToast?: BadgeDefinition | null;
  reducedMotion?: boolean;
  onOpenFullTutor: (prefillQuestion?: string) => void;
  onDismissReaction?: () => void;
  onDismissBadgeToast?: () => void;
}

const COMPACT_SPEECH_LOCALE_TEXT = {
  en: {
    novaName: 'Nova · Science Buddy',
    listen: 'Listen',
    pause: 'Pause',
    resume: 'Resume',
    replay: 'Replay',
    stop: 'Stop',
    muteLabel: 'Mute voice',
    unmuteLabel: 'Unmute voice',
    askPlaceholder: 'Ask Nova anything...',
    askFullTutor: 'Open Tutor',
    badgesBtn: 'Badges',
    xpUnit: 'XP',
    dayStreak: 'd streak',
    badgesTitle: 'Lab Achievements & Badges',
    unlockedLabel: 'Unlocked',
    lockedLabel: 'Locked',
    tapNovaHint: 'Tap Nova for help & voice',
    voiceMic: 'Speak to Nova',
    recordingHint: 'Listening… tap to stop',
    badgeEarnedPrefix: 'Badge Unlocked:',
  },
  kn: {
    novaName: 'ನೋವಾ · ವಿಜ್ಞಾನ ಸ್ನೇಹಿತ',
    listen: 'ಕೇಳಿ',
    pause: 'ವಿರಾಮ',
    resume: 'ಮುಂದುವರಿಸಿ',
    replay: 'ಮರುಪ್ರಸಾರ',
    stop: 'ನಿಲ್ಲಿಸಿ',
    muteLabel: 'ಧ್ವನಿ ಮ್ಯೂಟ್',
    unmuteLabel: 'ಧ್ವನಿ ಆನ್',
    askPlaceholder: 'ನೋವಾಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ...',
    askFullTutor: 'ಪೂರ್ಣ ಟ್ಯೂಟರ್',
    badgesBtn: 'ಬ್ಯಾಡ್ಜ್‌ಗಳು',
    xpUnit: 'XP',
    dayStreak: 'ದಿನ',
    badgesTitle: 'ಪ್ರಯೋಗಶಾಲೆ ಸಾಧನೆಗಳು ಮತ್ತು ಬ್ಯಾಡ್ಜ್‌ಗಳು',
    unlockedLabel: 'ಅನ್‌ಲಾಕ್',
    lockedLabel: 'ಬಾಕಿ',
    tapNovaHint: 'ಸಹಾಯಕ್ಕಾಗಿ ನೋವಾ ಒತ್ತಿ',
    voiceMic: 'ಮೈಕ್ ಮೂಲಕ ಕೇಳಿ',
    recordingHint: 'ಆಲಿಸುತ್ತಿದೆ… ನಿಲ್ಲಿಸಲು ಒತ್ತಿ',
    badgeEarnedPrefix: 'ಹೊಸ ಬ್ಯಾಡ್ಜ್:',
  },
  hi: {
    novaName: 'नोवा · विज्ञान साथी',
    listen: 'सुनें',
    pause: 'रोकें',
    resume: 'जारी रखें',
    replay: 'दोबारा',
    stop: 'बंद करें',
    muteLabel: 'आवाज़ बंद',
    unmuteLabel: 'आवाज़ चालू',
    askPlaceholder: 'नोवा से कुछ भी पूछें...',
    askFullTutor: 'पूरा ट्यूटर',
    badgesBtn: 'बैज',
    xpUnit: 'XP',
    dayStreak: 'दिन',
    badgesTitle: 'प्रयोगशाला उपलब्धियाँ और बैज',
    unlockedLabel: 'अनलॉक',
    lockedLabel: 'लॉक',
    tapNovaHint: 'मदद के लिए नोवा दबाएँ',
    voiceMic: 'बोलकर पूछें',
    recordingHint: 'सुन रहा है… रोकने के लिए दबाएँ',
    badgeEarnedPrefix: 'नया बैज:',
  },
} as const;

export const CompanionDock: React.FC<CompanionDockProps> = ({
  variant,
  language,
  message,
  rewardState,
  latestBadgeToast = null,
  reducedMotion = false,
  onOpenFullTutor,
  onDismissReaction,
  onDismissBadgeToast,
}) => {
  const copy = COMPACT_SPEECH_LOCALE_TEXT[language];
  const [isMuted, setIsMuted] = useState(false);
  const [isFloatingCardOpen, setIsFloatingCardOpen] = useState(false);
  const [showBadgesDrawer, setShowBadgesDrawer] = useState(false);
  const [questionDraft, setQuestionDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micNote, setMicNote] = useState<string | null>(null);
  const [hasUnreadReaction, setHasUnreadReaction] = useState(false);
  const [audioSnap, setAudioSnap] = useState<TutorAudioSnapshot>({
    status: 'idle',
    messageId: null,
    provider: null,
    errorNote: null,
    amplitude: 0,
  });

  const audioCtrlRef = useRef<TutorAudioController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const lastMsgIdRef = useRef<string>(message.id);

  useEffect(() => {
    const ctrl = new TutorAudioController((snap) => setAudioSnap(snap));
    audioCtrlRef.current = ctrl;
    return () => {
      ctrl.dispose();
      audioCtrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (message.id !== lastMsgIdRef.current) {
      lastMsgIdRef.current = message.id;
      if (variant === 'floating') {
        setHasUnreadReaction(true);
        // Auto-open briefly only for explicit high-priority events when not muted or already open
        if (
          message.eventType === 'experiment_intro' ||
          message.eventType === 'quiz_correct' ||
          message.eventType === 'quiz_wrong' ||
          message.eventType === 'experiment_completed' ||
          message.eventType === 'badge_unlocked'
        ) {
          setIsFloatingCardOpen(true);
        }
      }
    }
  }, [message.id, message.eventType, variant]);

  const { currentRank, nextRank, progressPercent } = getRankForXp(rewardState.xp);
  const isSpeaking = audioSnap.status === 'playing';
  const effectiveEmotion = isSpeaking ? 'speaking' : message.emotion;

  const handlePlayMessage = async () => {
    if (isMuted) return;
    audioCtrlRef.current?.unlock();
    await audioCtrlRef.current?.playMessage(message.id, message.text, language);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      audioCtrlRef.current?.stop();
    }
  };

  const handleAskSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = questionDraft.trim();
    setQuestionDraft('');
    onOpenFullTutor(q || message.quickPrompt);
  };

  const stopRecordingStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((tr) => tr.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleToggleVoiceMic = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setMicNote(null);
    audioCtrlRef.current?.unlock();

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      onOpenFullTutor();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        stopRecordingStream();
        if (blob.size < 400) return;

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const str = String(reader.result || '');
              resolve(str.includes(',') ? str.split(',')[1] : '');
            };
            reader.onerror = () => reject(new Error('Audio read error'));
            reader.readAsDataURL(blob);
          });
          if (base64) {
            const res = await transcribeStudentAudio({
              audioBase64: base64,
              audioMimeType: mimeType,
              preferredLanguage: language,
            });
            if (res.transcript?.trim()) {
              onOpenFullTutor(res.transcript.trim());
            } else {
              setMicNote('Speak clearly or type your question.');
            }
          }
        } catch {
          onOpenFullTutor();
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      stopRecordingStream();
      onOpenFullTutor();
    }
  };

  if (variant === 'floating') {
    return (
      <div
        data-testid="companion-floating-dock"
        className="pointer-events-none absolute bottom-3 right-3 z-30 flex flex-col items-end gap-2 max-w-[calc(100%-1.5rem)]"
      >
        {/* Unlocked Badge Celebration Toast */}
        {latestBadgeToast && (
          <div
            data-testid="badge-unlock-toast"
            className="pointer-events-auto rounded-xl bg-[#171A2F] text-white px-3 py-2 shadow-lg border border-[#FFF3E3]/50 flex items-center gap-2.5 max-w-[290px]"
          >
            <Trophy className="w-4 h-4 text-[#FFF3E3] shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold leading-tight truncate">
                {copy.badgeEarnedPrefix} {latestBadgeToast.title[language]}
              </p>
              <p className="text-[10px] text-white/80 leading-snug line-clamp-1">
                {latestBadgeToast.description[language]}
              </p>
            </div>
            {onDismissBadgeToast && (
              <button
                type="button"
                onClick={onDismissBadgeToast}
                aria-label="Dismiss badge notification"
                className="p-0.5 text-white/70 hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Compact Expandable Companion Bubble */}
        {isFloatingCardOpen && (
          <div
            data-testid="companion-floating-card"
            className="pointer-events-auto w-[285px] sm:w-[320px] rounded-xl bg-white border border-[#EFE7DF] shadow-xl overflow-hidden"
          >
            <div className="bg-[#FFF3E3]/75 border-b border-[#EFE7DF] px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-[#171A2F] truncate">
                  {copy.novaName}
                </span>
                <span className="text-[11px] font-semibold text-[#C96D12] tabular-nums whitespace-nowrap">
                  {rewardState.xp} {copy.xpUnit}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  aria-label={isMuted ? copy.unmuteLabel : copy.muteLabel}
                  title={isMuted ? copy.unmuteLabel : copy.muteLabel}
                  className="p-1 rounded-md text-[#C96D12] hover:bg-white/80 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFloatingCardOpen(false);
                    setHasUnreadReaction(false);
                    onDismissReaction?.();
                  }}
                  aria-label="Close Nova card"
                  className="p-1 rounded-md text-[#6F7487] hover:text-[#171A2F] hover:bg-white/80 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3 space-y-2.5">
              <p className="text-xs text-[#171A2F] leading-relaxed">{message.text}</p>

              {/* Audio Playback & Quick Suggestion Controls */}
              <div className="flex flex-wrap items-center gap-1.5">
                {audioSnap.status === 'idle' || audioSnap.status === 'error' ? (
                  <button
                    type="button"
                    disabled={isMuted}
                    onClick={handlePlayMessage}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFF9F4] border border-[#EFE7DF] text-[11px] font-semibold text-[#C96D12] hover:bg-[#FFF3E3]/60 disabled:opacity-45 cursor-pointer whitespace-nowrap"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{copy.listen}</span>
                  </button>
                ) : audioSnap.status === 'playing' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => audioCtrlRef.current?.pause()}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FFF9F4] border border-[#EFE7DF] text-[11px] font-semibold text-[#C96D12] cursor-pointer whitespace-nowrap"
                    >
                      <Pause className="w-3 h-3" />
                      <span>{copy.pause}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => audioCtrlRef.current?.stop()}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FFF9F4] border border-[#EFE7DF] text-[11px] font-semibold text-[#171A2F] cursor-pointer whitespace-nowrap"
                    >
                      <Square className="w-2.5 h-2.5" />
                      <span>{copy.stop}</span>
                    </button>
                  </>
                ) : audioSnap.status === 'paused' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => audioCtrlRef.current?.resume()}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FFF9F4] border border-[#EFE7DF] text-[11px] font-semibold text-[#C96D12] cursor-pointer whitespace-nowrap"
                    >
                      <Play className="w-3 h-3" />
                      <span>{copy.resume}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => audioCtrlRef.current?.replay()}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FFF9F4] border border-[#EFE7DF] text-[11px] font-semibold text-[#171A2F] cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{copy.replay}</span>
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-[#6F7487]">Preparing voice…</span>
                )}

                <button
                  type="button"
                  onClick={handleToggleVoiceMic}
                  disabled={isTranscribing}
                  title={isRecording ? copy.recordingHint : copy.voiceMic}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold cursor-pointer whitespace-nowrap ${
                    isRecording
                      ? 'bg-[#B83A2D] text-white border-[#B83A2D]'
                      : 'bg-[#FFF9F4] text-[#171A2F] border-[#EFE7DF] hover:bg-[#FFF3E3]/55'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>{isRecording ? copy.stop : isTranscribing ? '…' : copy.voiceMic}</span>
                </button>
              </div>

              {message.quickPrompt && (
                <button
                  type="button"
                  onClick={() => onOpenFullTutor(message.quickPrompt)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] hover:border-[#F49A3C] text-[11px] font-medium text-[#C96D12] transition-colors cursor-pointer"
                >
                  {message.quickPrompt} →
                </button>
              )}

              <form onSubmit={handleAskSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={questionDraft}
                  onChange={(e) => setQuestionDraft(e.target.value)}
                  placeholder={copy.askPlaceholder}
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs text-[#171A2F] placeholder-[#6F7487] focus:outline-none focus:border-[#F49A3C]"
                />
                <button
                  type="submit"
                  aria-label="Send question to Nova"
                  className="p-1.5 rounded-lg bg-[#F49A3C] text-white hover:bg-[#E5882A] cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenFullTutor()}
                  title={copy.askFullTutor}
                  className="px-2 py-1.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-[11px] font-semibold text-[#171A2F] hover:bg-[#FFF3E3]/55 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </form>
              {micNote && <p className="text-[10px] text-[#6F7487]">{micNote}</p>}
            </div>
          </div>
        )}

        {/* Animated Nova Floating Trigger Button */}
        <button
          type="button"
          data-testid="floating-physix-ai-btn"
          onClick={() => {
            audioCtrlRef.current?.unlock();
            setIsFloatingCardOpen((prev) => !prev);
            setHasUnreadReaction(false);
          }}
          title={copy.tapNovaHint}
          aria-label={copy.tapNovaHint}
          aria-expanded={isFloatingCardOpen}
          className="group pointer-events-auto relative rounded-full bg-[#F4F6FD] border-2 border-[#6356B5]/65 shadow-lg p-1 hover:scale-105 active:scale-95 transition-transform cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B4EB8]"
        >
          <PhysixCompanionAvatar
            emotion={effectiveEmotion}
            pointTarget={message.pointTarget || 'none'}
            amplitude={audioSnap.amplitude || 0}
            size={52}
            reducedMotion={reducedMotion}
          />
          {hasUnreadReaction && !isFloatingCardOpen && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#D97706] border-2 border-white"
            />
          )}
        </button>
      </div>
    );
  }

  // Dashboard interactive companion bar
  return (
    <section
      aria-label={copy.novaName}
      data-testid="dashboard-companion-card"
      className="rounded-xl bg-white border border-[#EFE7DF] overflow-hidden"
    >
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        {/* Left: Animated Nova + Contextual Speech Bubble */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="shrink-0">
            <PhysixCompanionAvatar
              emotion={effectiveEmotion}
              pointTarget={message.pointTarget || 'none'}
              amplitude={audioSnap.amplitude || 0}
              size={72}
              reducedMotion={reducedMotion}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
              <span className="font-bold text-[#171A2F]">{copy.novaName}</span>
              <span className="text-[#6F7487]" aria-hidden="true">·</span>
              <span className="font-semibold text-[#C96D12]">{currentRank.title[language]}</span>
              <span className="text-[#6F7487]" aria-hidden="true">·</span>
              <span className="tabular-nums font-medium text-[#171A2F]">
                {rewardState.xp} {copy.xpUnit}
              </span>
              {rewardState.streakDays > 0 && (
                <>
                  <span className="text-[#6F7487]" aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 tabular-nums font-medium text-[#B45309]">
                    <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                    {rewardState.streakDays} {copy.dayStreak}
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-[#171A2F] leading-relaxed">{message.text}</p>

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {audioSnap.status === 'idle' || audioSnap.status === 'error' ? (
                <button
                  type="button"
                  onClick={handlePlayMessage}
                  disabled={isMuted}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] hover:bg-[#FFF3E3]/55 text-xs font-semibold text-[#C96D12] disabled:opacity-45 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{copy.listen}</span>
                </button>
              ) : audioSnap.status === 'playing' ? (
                <>
                  <button
                    type="button"
                    onClick={() => audioCtrlRef.current?.pause()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] text-xs font-semibold text-[#C96D12] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{copy.pause}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => audioCtrlRef.current?.stop()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] text-xs font-semibold text-[#171A2F] cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Square className="w-3 h-3" />
                    <span>{copy.stop}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => audioCtrlRef.current?.resume()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] text-xs font-semibold text-[#C96D12] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{copy.resume}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={isMuted ? copy.unmuteLabel : copy.muteLabel}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#EFE7DF] bg-white hover:bg-[#FFF9F4] text-xs font-medium text-[#6F7487] cursor-pointer whitespace-nowrap shrink-0"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isMuted ? copy.unmuteLabel : copy.muteLabel}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceMic}
                disabled={isTranscribing}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                  isRecording
                    ? 'bg-[#B83A2D] text-white border-[#B83A2D]'
                    : 'bg-white text-[#171A2F] border-[#EFE7DF] hover:bg-[#FFF3E3]/55'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? copy.stop : isTranscribing ? '…' : copy.voiceMic}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBadgesDrawer((v) => !v)}
                aria-expanded={showBadgesDrawer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] hover:bg-[#FFF3E3]/55 text-xs font-semibold text-[#171A2F] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Award className="w-3.5 h-3.5 text-[#C96D12]" />
                <span>
                  {copy.badgesBtn} ({rewardState.unlockedBadgeIds.length}/{BADGE_CATALOG.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenFullTutor(message.quickPrompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F49A3C] hover:bg-[#E5882A] text-white text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{copy.askFullTutor}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Rank Progress Bar */}
        <div className="lg:w-56 shrink-0 pt-2 lg:pt-0 lg:border-l lg:border-[#EFE7DF]/80 lg:pl-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#171A2F]">Lv. {currentRank.level}</span>
            <span className="tabular-nums text-[#6F7487]">
              {nextRank ? `${rewardState.xp}/${nextRank.minXp} XP` : `${rewardState.xp} XP`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#EFECE7] overflow-hidden">
            <div
              className="h-full bg-[#F49A3C] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {nextRank && (
            <p className="text-[11px] text-[#6F7487] truncate">
              → {nextRank.title[language]}
            </p>
          )}
        </div>
      </div>

      {/* Expandable Badges Shelf */}
      {showBadgesDrawer && (
        <div
          data-testid="rewards-badges-shelf"
          className="border-t border-[#EFE7DF] bg-[#FFF9F4]/75 px-4 sm:px-5 py-3.5 space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#171A2F]">{copy.badgesTitle}</h3>
            <span className="text-[11px] text-[#6F7487] tabular-nums">
              {rewardState.unlockedBadgeIds.length} / {BADGE_CATALOG.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {BADGE_CATALOG.map((badge) => {
              const unlocked = rewardState.unlockedBadgeIds.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`rounded-lg border p-2.5 space-y-1 ${
                    unlocked
                      ? 'bg-white border-[#F49A3C]/45'
                      : 'bg-[#FFF9F4] border-[#EFE7DF] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#171A2F] truncate">
                      {badge.title[language]}
                    </span>
                    <span
                      className={`text-[10px] font-semibold shrink-0 ${
                        unlocked ? 'text-[#2E7D32]' : 'text-[#6F7487]'
                      }`}
                    >
                      {unlocked ? copy.unlockedLabel : copy.lockedLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6F7487] leading-snug">
                    {badge.description[language]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
