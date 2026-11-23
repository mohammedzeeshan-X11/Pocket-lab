import type { LanguageCode, TutorAudioStatus } from '../types/physics';
import { requestTutorSpeechAudio } from '../services/explainabilityApi';

const LANG_LOCALE_CANDIDATES: Record<LanguageCode, string[]> = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  kn: ['kn-IN', 'kn'],
  hi: ['hi-IN', 'hi'],
};

export interface SpeechResult {
  started: boolean;
  reason?: 'UNSUPPORTED' | 'VOICE_UNAVAILABLE' | 'EMPTY_TEXT';
  voiceUsed?: string;
}

export interface TutorAudioSnapshot {
  status: TutorAudioStatus;
  messageId: string | null;
  provider: 'gemini_tts' | 'browser_tts' | null;
  errorNote: string | null;
  amplitude?: number;
}

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Tiny 44-byte silent WAV data URI used solely to unlock HTMLAudioElement inside user gestures
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

function loadAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      resolve(immediate);
      return;
    }

    let settled = false;
    let timerId = 0;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timerId);
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
      resolve(window.speechSynthesis.getVoices());
    };

    const onVoices = () => finish();
    window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    timerId = window.setTimeout(finish, 350);
  });
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  language: LanguageCode
): SpeechSynthesisVoice | null {
  const prefixes = LANG_LOCALE_CANDIDATES[language];
  for (const prefix of prefixes) {
    const exact = voices.find((v) => v.lang.toLowerCase() === prefix.toLowerCase());
    if (exact) return exact;
  }
  for (const prefix of prefixes) {
    const short = prefix.split('-')[0].toLowerCase();
    const partial = voices.find((v) => v.lang.toLowerCase().startsWith(short));
    if (partial) return partial;
  }
  return null;
}

function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType || 'audio/wav' });
  return URL.createObjectURL(blob);
}

export async function speakExplanation(
  text: string,
  language: LanguageCode,
  onEnd?: () => void
): Promise<SpeechResult> {
  const cleaned = text.trim();
  if (!cleaned) {
    return { started: false, reason: 'EMPTY_TEXT' };
  }

  if (!isSpeechSynthesisSupported()) {
    return { started: false, reason: 'UNSUPPORTED' };
  }

  stopSpeech();
  const voices = await loadAvailableVoices();
  const selectedVoice = pickVoice(voices, language);

  if (!selectedVoice && (language === 'kn' || language === 'hi' || voices.length > 0)) {
    return { started: false, reason: 'VOICE_UNAVAILABLE' };
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = LANG_LOCALE_CANDIDATES[language][0];
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  utterance.rate = 0.96;
  utterance.pitch = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return {
    started: true,
    voiceUsed: selectedVoice?.name || utterance.lang,
  };
}

/**
 * Full-control audio playback manager for the PHYSIX AI Tutor.
 * Uses server-side neural Gemini TTS (audio/wav) with a persistent unlocked HTMLAudioElement
 * for reliable mobile & desktop playback, instant Replay caching, and honest language-matched fallback.
 */
export class TutorAudioController {
  private cache = new Map<string, string>();
  private sharedAudio: HTMLAudioElement | null = null;
  private isAudioUnlocked = false;
  private abortController: AbortController | null = null;
  private activePayload: { messageId: string; text: string; language: LanguageCode } | null = null;
  private amplitudeTimer: number | null = null;
  private speechPhase = 0;
  private snapshot: TutorAudioSnapshot = {
    status: 'idle',
    messageId: null,
    provider: null,
    errorNote: null,
    amplitude: 0,
  };
  private listener: (next: TutorAudioSnapshot) => void;

  constructor(onStateChange: (next: TutorAudioSnapshot) => void) {
    this.listener = onStateChange;
    if (typeof Audio !== 'undefined') {
      this.sharedAudio = new Audio();
      this.sharedAudio.preload = 'auto';
    }
  }

  private startAmplitudeLoop() {
    if (this.amplitudeTimer !== null || typeof window === 'undefined') return;
    this.speechPhase = 0;
    this.amplitudeTimer = window.setInterval(() => {
      if (this.snapshot.status !== 'playing') {
        this.stopAmplitudeLoop();
        return;
      }
      const clock =
        this.sharedAudio && !this.sharedAudio.paused && this.sharedAudio.currentTime > 0
          ? this.sharedAudio.currentTime
          : (this.speechPhase += 0.08);
      // Multi-harmonic speech syllable cadence synced cleanly to playback time
      const syllabic = Math.abs(Math.sin(clock * 14.5)) * 0.65 + Math.abs(Math.sin(clock * 23.2 + 0.7)) * 0.35;
      const pauseGate = Math.sin(clock * 3.1) > -0.68 ? 1 : 0.15;
      const nextAmp = Math.min(1, Math.max(0.08, syllabic * pauseGate));
      this.snapshot = { ...this.snapshot, amplitude: Number(nextAmp.toFixed(2)) };
      this.listener(this.snapshot);
    }, 85);
  }

  private stopAmplitudeLoop() {
    if (this.amplitudeTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.amplitudeTimer);
      this.amplitudeTimer = null;
    }
    if (this.snapshot.amplitude !== 0) {
      this.snapshot = { ...this.snapshot, amplitude: 0 };
      this.listener(this.snapshot);
    }
  }

  private emit(patch: Partial<TutorAudioSnapshot>) {
    const nextStatus = patch.status ?? this.snapshot.status;
    this.snapshot = {
      ...this.snapshot,
      ...patch,
      amplitude: nextStatus === 'playing' ? (this.snapshot.amplitude || 0.45) : 0,
    };
    this.listener(this.snapshot);
    if (nextStatus === 'playing') {
      this.startAmplitudeLoop();
    } else {
      this.stopAmplitudeLoop();
    }
  }

  /**
   * Call synchronously inside user click/tap handlers so mobile Safari/Chrome and iframe sandboxes
   * permit audio.play() once async Gemini responses arrive seconds later.
   */
  public unlock(): void {
    if (this.isAudioUnlocked || typeof Audio === 'undefined') return;
    if (!this.sharedAudio) {
      this.sharedAudio = new Audio();
      this.sharedAudio.preload = 'auto';
    }
    try {
      // Only prime with silent WAV if nothing is actively playing or paused
      if (this.snapshot.status === 'idle' && (!this.sharedAudio.src || this.sharedAudio.ended)) {
        this.sharedAudio.src = SILENT_WAV_DATA_URI;
        this.sharedAudio.muted = true;
        const p = this.sharedAudio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            if (this.sharedAudio && this.sharedAudio.src === SILENT_WAV_DATA_URI) {
              this.sharedAudio.pause();
              this.sharedAudio.currentTime = 0;
              this.sharedAudio.muted = false;
            }
            this.isAudioUnlocked = true;
          }).catch(() => {
            if (this.sharedAudio) this.sharedAudio.muted = false;
          });
        }
      }
    } catch {
      if (this.sharedAudio) this.sharedAudio.muted = false;
    }
  }

  private stopActiveTransportOnly(reason: string) {
    if (this.abortController) {
      if (!this.abortController.signal.aborted) {
        this.abortController.abort(reason);
      }
      this.abortController = null;
    }
    if (this.sharedAudio) {
      this.sharedAudio.onended = null;
      this.sharedAudio.onerror = null;
      this.sharedAudio.onpause = null;
      this.sharedAudio.onplay = null;
      try {
        this.sharedAudio.pause();
        this.sharedAudio.currentTime = 0;
      } catch {
        // Ignore media reset errors
      }
    }
    stopSpeech();
  }

  public getSnapshot(): TutorAudioSnapshot {
    return this.snapshot;
  }

  public async playMessage(
    messageId: string,
    text: string,
    language: LanguageCode
  ): Promise<void> {
    const cleaned = text.trim();
    if (!cleaned) return;

    // If resuming the same paused audio
    if (
      this.snapshot.messageId === messageId &&
      this.snapshot.status === 'paused' &&
      this.sharedAudio &&
      this.sharedAudio.src &&
      this.sharedAudio.src !== SILENT_WAV_DATA_URI
    ) {
      await this.resume();
      return;
    }

    this.stopActiveTransportOnly('USER_STOPPED');
    this.activePayload = { messageId, text: cleaned, language };
    this.emit({
      status: 'preparing',
      messageId,
      provider: null,
      errorNote: null,
    });

    const cacheKey = `${language}::${cleaned}`;
    let blobUrl = this.cache.get(cacheKey);
    const localController = new AbortController();
    this.abortController = localController;

    try {
      if (!blobUrl) {
        const ttsRes = await requestTutorSpeechAudio(
          { text: cleaned, language },
          localController.signal
        );
        blobUrl = base64ToBlobUrl(ttsRes.audioBase64, ttsRes.mimeType || 'audio/wav');
        this.cache.set(cacheKey, blobUrl);
      }

      // Verify this message is still the active target (wasn't stopped/superseded)
      if (localController.signal.aborted || this.snapshot.messageId !== messageId) return;

      const audio = this.sharedAudio || new Audio();
      this.sharedAudio = audio;
      audio.muted = false;
      audio.onended = null;
      audio.onerror = null;
      audio.onpause = null;
      audio.onplay = null;
      audio.src = blobUrl;
      audio.currentTime = 0;

      audio.onplay = () => {
        if (this.snapshot.messageId === messageId) {
          this.isAudioUnlocked = true;
          this.emit({ status: 'playing', provider: 'gemini_tts', errorNote: null });
        }
      };

      audio.onpause = () => {
        if (
          this.snapshot.messageId === messageId &&
          !audio.ended &&
          this.snapshot.status === 'playing'
        ) {
          this.emit({ status: 'paused' });
        }
      };

      audio.onended = () => {
        if (this.snapshot.messageId === messageId) {
          this.emit({ status: 'idle', messageId: null });
        }
      };

      audio.onerror = () => {
        if (this.snapshot.messageId === messageId) {
          this.emit({
            status: 'error',
            errorNote: 'Could not decode or play the generated audio in this browser.',
          });
        }
      };

      try {
        await audio.play();
      } catch (playErr: unknown) {
        const errName = (playErr as { name?: string })?.name;
        if (errName === 'NotAllowedError') {
          this.emit({
            status: 'paused',
            messageId,
            provider: 'gemini_tts',
            errorNote: 'Audio ready — tap Resume or Listen to hear the tutor.',
          });
          return;
        }
        throw playErr;
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (
        code === 'USER_CANCELLED' ||
        code === 'COMPONENT_UNMOUNTED' ||
        localController.signal.reason === 'USER_STOPPED'
      ) {
        return;
      }

      // Honest fallback ONLY to a voice matching the exact language
      const fallback = await speakExplanation(cleaned, language, () => {
        if (this.snapshot.messageId === messageId) {
          this.emit({ status: 'idle', messageId: null });
        }
      });

      if (fallback.started) {
        this.emit({
          status: 'playing',
          provider: 'browser_tts',
          errorNote: null,
        });
        return;
      }

      const reasonMsg =
        err instanceof Error && err.message
          ? err.message
          : 'Natural voice playback is unavailable for the selected language right now.';
      this.emit({
        status: 'error',
        provider: null,
        errorNote: reasonMsg,
      });
    } finally {
      if (this.abortController === localController) {
        this.abortController = null;
      }
    }
  }

  public async pause(): Promise<void> {
    if (this.sharedAudio && !this.sharedAudio.paused) {
      this.sharedAudio.pause();
      this.emit({ status: 'paused' });
      return;
    }
    if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.emit({ status: 'paused' });
    }
  }

  public async resume(): Promise<void> {
    if (this.sharedAudio && this.sharedAudio.paused && this.sharedAudio.src) {
      try {
        this.sharedAudio.muted = false;
        await this.sharedAudio.play();
        this.emit({ status: 'playing', errorNote: null });
      } catch {
        this.emit({
          status: 'error',
          errorNote: 'Audio playback could not resume. Try clicking Replay.',
        });
      }
      return;
    }
    if (isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.emit({ status: 'playing' });
    }
  }

  public async replay(): Promise<void> {
    if (!this.activePayload) return;
    const { messageId, text, language } = this.activePayload;
    if (
      this.sharedAudio &&
      this.sharedAudio.src &&
      this.sharedAudio.src !== SILENT_WAV_DATA_URI &&
      this.snapshot.provider !== 'browser_tts'
    ) {
      try {
        this.sharedAudio.muted = false;
        this.sharedAudio.currentTime = 0;
        this.emit({
          status: 'playing',
          messageId,
          provider: 'gemini_tts',
          errorNote: null,
        });
        await this.sharedAudio.play();
        return;
      } catch {
        // Re-run via playMessage
      }
    }
    await this.playMessage(messageId, text, language);
  }

  public stop(): void {
    this.stopActiveTransportOnly('USER_STOPPED');
    this.emit({
      status: 'idle',
      messageId: null,
      provider: null,
      errorNote: null,
    });
  }

  public dispose(): void {
    this.stopAmplitudeLoop();
    this.stopActiveTransportOnly('COMPONENT_UNMOUNTED');
    this.sharedAudio = null;
    this.cache.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // Ignore cleanup errors
      }
    });
    this.cache.clear();
  }
}
