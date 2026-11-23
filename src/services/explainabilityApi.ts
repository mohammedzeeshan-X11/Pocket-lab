import type {
  ExperimentExplanation,
  ExperimentParametersSnapshot,
  LanguageCode,
  LearningSessionContext,
  SimulationMode,
  SimulationObjectId,
  TextbookAnalysisResult,
  TutorRequestedStyle,
  TutorResponse,
  TutorSpeechAudioResult,
  TutorTranscriptionResult,
} from '../types/physics';
import type { ComponentExplanationContent } from '../systems/componentInteraction/types';
import { TextbookApiError } from './textbookApi';

export interface ExplainExperimentPayload {
  experimentId: string;
  experimentName: string;
  visualizationMode: SimulationMode;
  parameters: ExperimentParametersSnapshot;
  previousParameters?: ExperimentParametersSnapshot | null;
  telemetry: {
    magnitudeMt: number;
    angleDeg: number;
    relX: number;
    relY: number;
  };
  selectedObject?: SimulationObjectId | null;
  textbookContext?: TextbookAnalysisResult | null;
  language: LanguageCode;
}

export interface SelectedComponentTutorContext {
  id: string;
  name: string;
  identification: string;
  currentState?: string;
  explanationContext?: string;
}

export interface AskTutorPayload {
  audioBase64?: string;
  audioMimeType?: string;
  textQuestion?: string;
  language: LanguageCode;
  forceAlternativeStrategy?: boolean;
  requestedStyle?: TutorRequestedStyle;
  studentClass?: number;
  chapterMeta?: {
    chapterNumber?: number;
    chapterTitle?: string;
  } | null;
  experimentMeta?: {
    id?: string;
    title?: string;
    simulationEngineId?: string | null;
    relevantConcept?: string;
    scientificExplanation?: string;
    learningObjective?: string;
    dynamicExperimentMeta?: {
      templateId?: string;
      educationalObjective?: string;
      expectedBehaviour?: string;
      equations?: string[];
      procedureSteps?: string[];
      components?: string[];
      isSimplifiedModel?: boolean;
      limitationNote?: string;
    };
  } | null;
  conversationHistory?: Array<{
    role: 'student' | 'tutor';
    text: string;
    strategy?: string;
  }>;
  previousTutorResponse?: TutorResponse | null;
  existingExplanation?: ExperimentExplanation | null;
  selectedComponent?: SelectedComponentTutorContext | null;
  componentExplanation?: ComponentExplanationContent | null;
  parameters: ExperimentParametersSnapshot | Record<string, unknown>;
  telemetry: Record<string, unknown>;
  textbookContext?: TextbookAnalysisResult | null;
  sessionContext: LearningSessionContext;
}

function trimTextbookContext(analysis?: TextbookAnalysisResult | null) {
  if (!analysis) return null;
  return {
    chapter: analysis.chapter,
    main_topic: analysis.main_topic,
    summary: analysis.summary,
    concepts: analysis.concepts.slice(0, 5).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    })),
    equations: analysis.equations.slice(0, 5),
  };
}

function createRequestAbortControl(timeoutMs: number, externalSignal?: AbortSignal) {
  const controller = new AbortController();
  let didTimeout = false;
  let cancelledExternally = Boolean(externalSignal?.aborted);

  const onExternalAbort = () => {
    cancelledExternally = true;
    if (!controller.signal.aborted) {
      controller.abort(externalSignal?.reason ?? 'USER_CANCELLED');
    }
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      onExternalAbort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  const timer = window.setTimeout(() => {
    didTimeout = true;
    if (!controller.signal.aborted) {
      controller.abort('REQUEST_TIMEOUT');
    }
  }, timeoutMs);

  const cleanup = () => {
    window.clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  };

  const mapCaughtError = (err: unknown, timeoutMessage: string): never => {
    const reason = controller.signal.reason;
    const isAbortLike =
      (err instanceof DOMException && (err.name === 'AbortError' || err.name === 'TimeoutError')) ||
      (err instanceof Error &&
        (err.name === 'AbortError' ||
          err.name === 'TimeoutError' ||
          err.message.toLowerCase().includes('signal is aborted')));

    if (cancelledExternally || reason === 'USER_CANCELLED' || reason === 'COMPONENT_UNMOUNTED') {
      throw new TextbookApiError(
        'Request cancelled.',
        reason === 'COMPONENT_UNMOUNTED' ? 'COMPONENT_UNMOUNTED' : 'USER_CANCELLED',
        499
      );
    }

    if (didTimeout || reason === 'REQUEST_TIMEOUT' || isAbortLike) {
      throw new TextbookApiError(timeoutMessage, 'REQUEST_TIMEOUT', 504);
    }

    if (err instanceof TextbookApiError) {
      throw err;
    }

    if (err instanceof TypeError) {
      throw new TextbookApiError(
        'Network connection was interrupted while contacting the server. Please check your connection and retry.',
        'NETWORK_ERROR',
        0
      );
    }

    throw err;
  };

  return { signal: controller.signal, cleanup, mapCaughtError };
}

export async function requestExperimentExplanation(
  payload: ExplainExperimentPayload
): Promise<ExperimentExplanation> {
  const reqCtrl = createRequestAbortControl(35000);
  try {
    const response = await fetch('/api/explain-experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: reqCtrl.signal,
      body: JSON.stringify({
        ...payload,
        textbookContext: trimTextbookContext(payload.textbookContext),
      }),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new TextbookApiError(
        'Received an invalid response from the experiment explainability server.',
        'INVALID_SERVER_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      const errObj = data as { error?: string; code?: string };
      throw new TextbookApiError(
        errObj?.error || `Failed to explain experiment (status ${response.status}).`,
        errObj?.code,
        response.status
      );
    }

    return data as ExperimentExplanation;
  } catch (err) {
    return reqCtrl.mapCaughtError(
      err,
      'Experiment explanation timed out while waiting for Gemini AI. Please retry.'
    );
  } finally {
    reqCtrl.cleanup();
  }
}

export async function transcribeStudentAudio(
  payload: {
    audioBase64: string;
    audioMimeType: string;
    preferredLanguage: LanguageCode;
  },
  externalSignal?: AbortSignal
): Promise<TutorTranscriptionResult> {
  const reqCtrl = createRequestAbortControl(35000, externalSignal);
  try {
    const response = await fetch('/api/tutor-transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: reqCtrl.signal,
      body: JSON.stringify(payload),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new TextbookApiError(
        'Received an invalid response from the speech recognition service.',
        'INVALID_SERVER_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      const errObj = data as { error?: string; code?: string };
      throw new TextbookApiError(
        errObj?.error || `Speech transcription failed (status ${response.status}).`,
        errObj?.code,
        response.status
      );
    }

    return data as TutorTranscriptionResult;
  } catch (err) {
    return reqCtrl.mapCaughtError(
      err,
      'Speech transcription timed out. Please try recording again or type your question.'
    );
  } finally {
    reqCtrl.cleanup();
  }
}

export async function requestTutorSpeechAudio(
  payload: { text: string; language: LanguageCode },
  externalSignal?: AbortSignal
): Promise<TutorSpeechAudioResult> {
  const reqCtrl = createRequestAbortControl(30000, externalSignal);
  try {
    const response = await fetch('/api/tutor-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: reqCtrl.signal,
      body: JSON.stringify(payload),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new TextbookApiError(
        'Received an invalid response from the natural speech service.',
        'INVALID_SERVER_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      const errObj = data as { error?: string; code?: string };
      throw new TextbookApiError(
        errObj?.error || `Speech synthesis failed (status ${response.status}).`,
        errObj?.code,
        response.status
      );
    }

    return data as TutorSpeechAudioResult;
  } catch (err) {
    return reqCtrl.mapCaughtError(
      err,
      'Voice generation timed out. Switching to backup voice or tap Retry.'
    );
  } finally {
    reqCtrl.cleanup();
  }
}

function buildCompactTutorRequestBody(payload: AskTutorPayload) {
  return {
    ...payload,
    conversationHistory: Array.isArray(payload.conversationHistory)
      ? payload.conversationHistory.slice(-4)
      : undefined,
    previousTutorResponse: undefined,
    existingExplanation: payload.existingExplanation
      ? {
          what_we_observe: payload.existingExplanation.what_we_observe,
          scientific_principles: payload.existingExplanation.scientific_principles,
        }
      : null,
    componentExplanation: payload.componentExplanation
      ? {
          name: payload.componentExplanation.name,
          definition: payload.componentExplanation.definition,
          behaviour: payload.componentExplanation.behaviour,
        }
      : null,
    textbookContext: trimTextbookContext(payload.textbookContext),
  };
}

export async function askPhysicsTutor(
  payload: AskTutorPayload,
  externalSignal?: AbortSignal
): Promise<TutorResponse> {
  const reqCtrl = createRequestAbortControl(45000, externalSignal);
  try {
    const response = await fetch('/api/tutor-ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: reqCtrl.signal,
      body: JSON.stringify(buildCompactTutorRequestBody(payload)),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new TextbookApiError(
        'Received an invalid response from the Pocket Lab tutor server.',
        'INVALID_SERVER_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      const errObj = data as { error?: string; code?: string };
      throw new TextbookApiError(
        errObj?.error || `Pocket Lab tutor request failed (status ${response.status}).`,
        errObj?.code,
        response.status
      );
    }

    return data as TutorResponse;
  } catch (err) {
    return reqCtrl.mapCaughtError(
      err,
      'The AI tutor took too long to respond (timeout). Please tap Retry.'
    );
  } finally {
    reqCtrl.cleanup();
  }
}

export async function askPhysicsTutorStream(
  payload: AskTutorPayload,
  handlers: {
    onDelta?: (deltaText: string) => void;
  },
  externalSignal?: AbortSignal
): Promise<TutorResponse> {
  const reqCtrl = createRequestAbortControl(45000, externalSignal);
  try {
    const response = await fetch('/api/tutor-ask-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: reqCtrl.signal,
      body: JSON.stringify(buildCompactTutorRequestBody(payload)),
    });

    if (!response.ok) {
      let errObj: { error?: string; code?: string } = {};
      try {
        errObj = (await response.json()) as { error?: string; code?: string };
      } catch {
        // ignore JSON parse error on non-OK body
      }
      throw new TextbookApiError(
        errObj?.error || `Pocket Lab tutor request failed (status ${response.status}).`,
        errObj?.code,
        response.status
      );
    }

    if (!response.body) {
      return await askPhysicsTutor(payload, reqCtrl.signal);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult: TutorResponse | null = null;

    const processEventBlock = (block: string) => {
      const lines = block.split(/\r?\n/);
      let eventName = 'message';
      const dataLines: string[] = [];

      for (const line of lines) {
        if (!line || line.startsWith(':')) continue;
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      if (dataLines.length === 0) return;
      const rawData = dataLines.join('\n');
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawData);
      } catch {
        return;
      }

      if (eventName === 'delta') {
        const deltaObj = parsed as { text?: string };
        if (typeof deltaObj?.text === 'string' && deltaObj.text.length > 0) {
          handlers.onDelta?.(deltaObj.text);
        }
      } else if (eventName === 'done') {
        finalResult = parsed as TutorResponse;
      } else if (eventName === 'error') {
        const errObj = parsed as { error?: string; code?: string };
        throw new TextbookApiError(
          errObj?.error || 'Pocket Lab streaming failed.',
          errObj?.code || 'STREAM_ERROR',
          502
        );
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        let boundaryIdx = buffer.search(/\r?\n\r?\n/);
        while (boundaryIdx !== -1) {
          const block = buffer.slice(0, boundaryIdx);
          const sepMatch = buffer.slice(boundaryIdx).match(/^\r?\n\r?\n/);
          const sepLen = sepMatch ? sepMatch[0].length : 2;
          buffer = buffer.slice(boundaryIdx + sepLen);
          if (block.trim().length > 0) {
            processEventBlock(block);
          }
          boundaryIdx = buffer.search(/\r?\n\r?\n/);
        }
      }
      if (done) {
        buffer += decoder.decode();
        if (buffer.trim().length > 0) {
          processEventBlock(buffer);
        }
        break;
      }
    }

    if (!finalResult) {
      throw new TextbookApiError(
        'The AI tutor stream ended before completing the explanation. Please tap Retry.',
        'INCOMPLETE_STREAM',
        502
      );
    }

    return finalResult;
  } catch (err) {
    return reqCtrl.mapCaughtError(
      err,
      'The AI tutor took too long to respond (timeout). Please tap Retry.'
    );
  } finally {
    reqCtrl.cleanup();
  }
}

export interface ExplainComponentPayload {
  componentId: string;
  componentName: string;
  componentContext: string;
  experimentId: string;
  experimentName: string;
  visualizationMode: SimulationMode;
  studentClass?: number;
  relevantConcept?: string;
  parameters: Record<string, unknown>;
  currentState: string;
  textbookContext?: TextbookAnalysisResult | null;
  language: LanguageCode;
}

export interface ApiComponentExplanationResponse {
  name: string;
  definition: string;
  characteristics: string;
  functionDescription: string;
  scientificProperties: string;
  behaviour: string;
  relationshipWithOthers: string;
  realWorldExample: string;
  whyItMatters: string;
  currentStateSummary?: string;
  source: 'ai_enhanced';
}

export async function requestComponentExplanation(
  payload: ExplainComponentPayload,
  externalSignal?: AbortSignal
): Promise<ApiComponentExplanationResponse> {
  const reqCtrl = createRequestAbortControl(30000, externalSignal);
  try {
    const response = await fetch('/api/explain-component', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: reqCtrl.signal,
      body: JSON.stringify({
        ...payload,
        textbookContext: trimTextbookContext(payload.textbookContext),
      }),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new TextbookApiError(
        'Received an invalid response from the component explanation service.',
        'INVALID_SERVER_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      const errObj = data as { error?: string; code?: string };
      throw new TextbookApiError(
        errObj?.error || `Failed to explain selected component (status ${response.status}).`,
        errObj?.code,
        response.status
      );
    }

    return data as ApiComponentExplanationResponse;
  } catch (err) {
    return reqCtrl.mapCaughtError(
      err,
      'Component explanation timed out. Showing verified built-in physics reference.'
    );
  } finally {
    reqCtrl.cleanup();
  }
}

export interface CompanionReactionPayload {
  eventType: string;
  language: LanguageCode;
  studentName?: string;
  studentClass?: number;
  experimentTitle?: string;
  engineId?: string;
  selectedComponentName?: string;
  parameterSummary?: string;
  extraContext?: string;
}

export interface CompanionReactionResponse {
  speechText: string;
  emotion: 'idle' | 'thinking' | 'speaking' | 'excited' | 'encouraging' | 'celebrating';
  quickPromptSuggestion: string;
  source?: 'gemini' | 'fallback';
}

export async function requestCompanionReaction(
  payload: CompanionReactionPayload,
  externalSignal?: AbortSignal
): Promise<CompanionReactionResponse | null> {
  const reqCtrl = createRequestAbortControl(6000, externalSignal);
  try {
    const response = await fetch('/api/companion-react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: reqCtrl.signal,
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as CompanionReactionResponse;
    if (!data?.speechText) return null;
    return data;
  } catch {
    return null;
  } finally {
    reqCtrl.cleanup();
  }
}
