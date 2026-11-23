import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  ADAPTIVE_SIMULATION_IDS,
  REGISTERED_SIMULATION_IDS,
  resolveAdaptiveSimulation,
  resolveRegisteredSimulation,
} from './src/data/simulationRegistry.ts';
import { matchExperimentInRegistry } from './src/data/experimentMatcher.ts';
import {
  APPROVED_DYNAMIC_DOMAINS,
  APPROVED_TEMPLATE_IDS,
  APPROVED_VISUAL_ASSET_KEYS,
  TEMPLATE_PHYSICS_CONFIG,
  validateAndSanitizeDynamicExperimentSpec,
} from './src/utils/dynamicPhysicsValidator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const MAX_BASE64_BYTES = 14 * 1024 * 1024;

function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 0 && key !== 'MY_GEMINI_API_KEY');
}

function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) return null;
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function normalizeConfidence(val: unknown): 'high' | 'medium' | 'low' {
  if (val === 'high' || val === 'medium' || val === 'low') return val;
  return 'medium';
}

function extractReadableErrorMessage(rawMessage: string): string {
  const trimmed = rawMessage.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { error?: { message?: string }; message?: string };
      if (parsed?.error?.message) return parsed.error.message;
      if (parsed?.message) return parsed.message;
    } catch {
      // Fall back to raw message
    }
  }
  return trimmed;
}

const ALLOWED_AUDIO_MIME_TYPES = new Set([
  'audio/webm',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/ogg',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/aac',
  'audio/flac',
  'audio/mpeg',
  'audio/mp3',
]);

function normalizeAudioMimeType(rawMime?: string): string | null {
  if (!rawMime || typeof rawMime !== 'string') return null;
  const base = rawMime.split(';')[0].trim().toLowerCase();
  if (!ALLOWED_AUDIO_MIME_TYPES.has(base)) return null;
  if (base === 'audio/m4a' || base === 'audio/x-m4a') return 'audio/mp4';
  if (base === 'audio/wave' || base === 'audio/x-wav') return 'audio/wav';
  if (base === 'audio/mp3') return 'audio/mpeg';
  return base;
}

function getLanguageDisplayName(lang?: string): string {
  if (lang === 'kn') return 'Kannada (ಕನ್ನಡ)';
  if (lang === 'hi') return 'Hindi (हिन्दी)';
  return 'English';
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(`${label} exceeded ${ms}ms deadline.`) as Error & { status?: number; code?: string };
      err.status = 504;
      err.code = 'DEADLINE_EXCEEDED';
      reject(err);
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function handleGeminiRouteError(err: unknown, res: Response) {
  const errorObj = err as { status?: number; code?: string; message?: string };
  const rawMessage = errorObj?.message || 'Unexpected error while calling PHYSIX AI.';
  const cleanMessage = extractReadableErrorMessage(rawMessage);
  const status =
    typeof errorObj?.status === 'number' && errorObj.status >= 400
      ? errorObj.status
      : 500;

  if (status === 400 || rawMessage.includes('INVALID_ARGUMENT')) {
    res.status(400).json({
      error: cleanMessage || 'Invalid request sent to the Gemini AI service.',
      code: 'INVALID_REQUEST',
    });
    return;
  }

  if (
    status === 401 ||
    status === 403 ||
    rawMessage.includes('PERMISSION_DENIED') ||
    rawMessage.includes('API_KEY_INVALID')
  ) {
    res.status(status === 401 ? 401 : 403).json({
      error: 'Gemini API authentication or permission failed. Please verify GEMINI_API_KEY in Settings > Secrets.',
      code: status === 401 ? 'AUTH_FAILED' : 'PERMISSION_DENIED',
    });
    return;
  }

  if (status === 404 || rawMessage.includes('NOT_FOUND')) {
    res.status(404).json({
      error: `Requested Gemini model or endpoint was not found (${cleanMessage}).`,
      code: 'MODEL_NOT_FOUND',
    });
    return;
  }

  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    res.status(429).json({
      error: 'Gemini API quota or rate limit reached. Please wait a moment and try again.',
      code: 'RATE_LIMITED',
    });
    return;
  }

  if (status === 504 || errorObj?.code === 'DEADLINE_EXCEEDED' || rawMessage.includes('DEADLINE_EXCEEDED')) {
    res.status(504).json({
      error: 'The AI service took too long to respond (504 deadline exceeded). Please retry.',
      code: 'DEADLINE_EXCEEDED',
    });
    return;
  }

  if (status === 503 || rawMessage.includes('UNAVAILABLE')) {
    res.status(503).json({
      error: 'The AI service is temporarily unavailable due to high demand. Please wait a few seconds and retry.',
      code: 'MODEL_UNAVAILABLE',
    });
    return;
  }

  res.status(status).json({
    error: cleanMessage,
    code: status >= 500 ? 'SERVER_ERROR' : 'ANALYSIS_FAILED',
  });
}

async function generateJsonWithModelFallback(
  ai: GoogleGenAI,
  parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>,
  responseSchema: Record<string, unknown>,
  timeoutMs = 22000
) {
  const attempts: Array<{ model: string; thinkingLevel: ThinkingLevel; backoffMs: number }> = [
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, backoffMs: 350 },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.LOW, backoffMs: 0 },
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const { model, thinkingLevel, backoffMs } = attempts[i];
    try {
      return await withTimeout(
        ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            thinkingConfig: { thinkingLevel },
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
        timeoutMs,
        `Gemini (${model})`
      );
    } catch (err: unknown) {
      lastError = err;
      const errObj = err as { status?: number; code?: string; message?: string };
      const msg = String(errObj?.message || '');
      const status = typeof errObj?.status === 'number' ? errObj.status : 0;
      const isTransient =
        status === 503 ||
        status === 504 ||
        status === 429 ||
        errObj?.code === 'DEADLINE_EXCEEDED' ||
        msg.includes('"code":503') ||
        msg.includes('"code":429') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('RESOURCE_EXHAUSTED');

      if (!isTransient || i === attempts.length - 1) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
  throw lastError;
}

function sanitizeStudentPlainText(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLocalizedBundleSchema(languageName: string) {
  return {
    type: Type.OBJECT,
    description: `Student-friendly, scientifically accurate translation in ${languageName}. Keep SI symbols and formulas intact.`,
    properties: {
      chapter: { type: Type.STRING },
      main_topic: { type: Type.STRING },
      summary: { type: Type.STRING },
      concepts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            relationships: { type: Type.STRING },
            variables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  unit: { type: Type.STRING },
                },
                required: ['symbol', 'meaning', 'unit'],
              },
            },
            terminology: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
          },
          required: ['id', 'name', 'description', 'variables', 'terminology'],
        },
      },
      diagrams: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            components: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'description', 'components'],
        },
      },
    },
    required: ['chapter', 'main_topic', 'summary', 'concepts', 'diagrams'],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      geminiConfigured: isGeminiConfigured(),
    });
  });

  app.post('/api/analyze-textbook', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType, language } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        language?: string;
      };

      if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.trim().length < 32) {
        res.status(400).json({
          error: 'No valid textbook image data was provided.',
          code: 'MISSING_IMAGE',
        });
        return;
      }

      if (imageBase64.length > MAX_BASE64_BYTES) {
        res.status(413).json({
          error: 'The uploaded image is too large to process. Please choose a smaller or clearer photograph.',
          code: 'IMAGE_TOO_LARGE',
        });
        return;
      }

      if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
        res.status(400).json({
          error: 'Unsupported file format. Please upload a JPG, JPEG, PNG, or WEBP image.',
          code: 'UNSUPPORTED_MIME_TYPE',
        });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini AI analysis is not configured yet because GEMINI_API_KEY is missing in environment secrets. Configure GEMINI_API_KEY in Settings > Secrets to enable live textbook scanning.',
          code: 'API_KEY_NOT_CONFIGURED',
        });
        return;
      }

      const prompt = `You are an expert NCERT Physics teacher and scientific visual analysis assistant.

Carefully inspect the uploaded textbook page.

Identify the actual content visible in the photograph.

Extract:
- Subject.
- Class or grade if identifiable (e.g., "Class 10", "Class 12", or "Not specified" if not visible).
- Chapter title if identifiable.
- Main topic.
- Individual physics concepts.
- Scientific definitions.
- Mathematical equations.
- Variables and their meanings.
- Units.
- Diagrams and their components.
- Important relationships between variables.
- Relevant experimental principles.

Read text and inspect diagrams together.

Strict honesty rules:
- Do not invent text that is not visible.
- Do not hallucinate equations.
- If text is unclear or blurry, identify it in uncertain_content.
- If a diagram cannot be interpreted reliably, set interpretable to false and state that in uncertain_content.
- If the image is completely unreadable or does NOT show Physics textbook content/diagrams/notes, set is_physics_content to false and leave concepts empty.

Keep explanations understandable for school students.

Controlled simulation registry rules:
For each concept, select simulation_id from:
${REGISTERED_SIMULATION_IDS.join(', ')}, or "none".
- Also populate detected_experiment summarizing the primary experiment/activity on the page: experiment_name, physics_concept, domain_category (one of ${APPROVED_DYNAMIC_DOMAINS.join(', ')}), class_level_numeric (6 to 10), components_apparatus (list of physical apparatus/components visible), diagram_structure (spatial layout description), variables_units, experimental_procedure (3-5 concise steps), expected_behaviour, preferred_dimension ("2d" or "3d"), dimension_reason, and is_complex_or_unsupported (true only if the page depicts advanced college/quantum/nuclear/multi-body CFD phenomena outside Class 6-10 deterministic physics models, with limitation_summary explaining why a simplified educational model is needed).

Multilingual requirement:
Populate the canonical English fields AND generate complete, student-friendly, scientifically accurate translations in:
1. English (translations.en)
2. Kannada (translations.kn - natural Kannada script ಕನ್ನಡ, preserving SI symbols and formulas)
3. Hindi (translations.hi - natural Devanagari script हिन्दी, preserving SI symbols and formulas)
Ensure every concept id in translations.{en,kn,hi}.concepts matches the id in concepts[].`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          is_physics_content: { type: Type.BOOLEAN },
          subject: { type: Type.STRING },
          class_level: { type: Type.STRING },
          chapter: { type: Type.STRING },
          main_topic: { type: Type.STRING },
          summary: { type: Type.STRING },
          concepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                equations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      formula: { type: Type.STRING },
                      name: { type: Type.STRING },
                      variables: { type: Type.STRING },
                      units: { type: Type.STRING },
                    },
                    required: ['formula', 'name', 'variables'],
                  },
                },
                variables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      symbol: { type: Type.STRING },
                      meaning: { type: Type.STRING },
                      unit: { type: Type.STRING },
                    },
                    required: ['symbol', 'meaning', 'unit'],
                  },
                },
                relationships: { type: Type.STRING },
                terminology: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                    },
                    required: ['term', 'definition'],
                  },
                },
                diagram_detected: { type: Type.BOOLEAN },
                simulation_id: { type: Type.STRING },
                confidence: { type: Type.STRING },
              },
              required: [
                'id',
                'name',
                'description',
                'equations',
                'variables',
                'terminology',
                'diagram_detected',
                'simulation_id',
                'confidence',
              ],
            },
          },
          detected_diagrams: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                components: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                interpretable: { type: Type.BOOLEAN },
              },
              required: ['title', 'description', 'components', 'interpretable'],
            },
          },
          extracted_text: { type: Type.STRING },
          uncertain_content: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          overall_confidence: { type: Type.STRING },
          detected_experiment: {
            type: Type.OBJECT,
            properties: {
              experiment_name: { type: Type.STRING },
              physics_concept: { type: Type.STRING },
              domain_category: { type: Type.STRING },
              class_level_numeric: { type: Type.NUMBER },
              components_apparatus: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              diagram_structure: { type: Type.STRING },
              variables_units: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    symbol: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                    unit: { type: Type.STRING },
                  },
                  required: ['symbol', 'meaning', 'unit'],
                },
              },
              experimental_procedure: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              expected_behaviour: { type: Type.STRING },
              preferred_dimension: { type: Type.STRING },
              dimension_reason: { type: Type.STRING },
              is_complex_or_unsupported: { type: Type.BOOLEAN },
              limitation_summary: { type: Type.STRING },
            },
            required: [
              'experiment_name',
              'physics_concept',
              'domain_category',
              'class_level_numeric',
              'components_apparatus',
              'diagram_structure',
              'experimental_procedure',
              'expected_behaviour',
              'preferred_dimension',
              'dimension_reason',
            ],
          },
          translations: {
            type: Type.OBJECT,
            properties: {
              en: buildLocalizedBundleSchema('English'),
              kn: buildLocalizedBundleSchema('Kannada (ಕನ್ನಡ)'),
              hi: buildLocalizedBundleSchema('Hindi (हिन्दी)'),
            },
            required: ['en', 'kn', 'hi'],
          },
        },
        required: [
          'is_physics_content',
          'subject',
          'class_level',
          'chapter',
          'main_topic',
          'summary',
          'concepts',
          'detected_diagrams',
          'extracted_text',
          'uncertain_content',
          'overall_confidence',
          'detected_experiment',
          'translations',
        ],
      };

      const normalizedImageMime =
        mimeType.toLowerCase() === 'image/jpg' ? 'image/jpeg' : mimeType.toLowerCase();

      const response = await generateJsonWithModelFallback(
        ai,
        [
          {
            inlineData: {
              mimeType: normalizedImageMime,
              data: imageBase64,
            },
          },
          { text: prompt },
        ],
        responseSchema
      );

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'The AI model returned an empty response. Please try again with a clearer textbook photograph.',
          code: 'EMPTY_MODEL_RESPONSE',
        });
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        res.status(502).json({
          error: 'Received malformed structured output from the textbook analyzer. Please try again.',
          code: 'INVALID_AI_RESPONSE',
        });
        return;
      }

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        typeof parsed.is_physics_content !== 'boolean' ||
        !Array.isArray(parsed.concepts)
      ) {
        res.status(502).json({
          error: 'The textbook analysis response was incomplete. Please retry with a clear photograph.',
          code: 'INVALID_AI_RESPONSE',
        });
        return;
      }

      if (!parsed.is_physics_content) {
        res.status(422).json({
          error:
            typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
              ? parsed.summary
              : 'This image does not appear to be a readable Physics textbook page. Please upload a clear photograph showing physics concepts, equations, or diagrams.',
          code: 'NOT_PHYSICS_CONTENT',
        });
        return;
      }

      if (parsed.concepts.length === 0) {
        res.status(422).json({
          error:
            'No identifiable Physics concepts were detected on this page. Please ensure the text and diagrams are clearly visible and in focus.',
          code: 'NO_PHYSICS_CONCEPTS',
        });
        return;
      }

      // Server-side validation & controlled simulation registry enforcement
      const aggregatedEquations: Array<{ formula: string; name: string; variables: string; units?: string }> = [];
      const aggregatedTerms: Array<{ term: string; definition: string }> = [];
      const seenEq = new Set<string>();
      const seenTerm = new Set<string>();

      const validatedConcepts = parsed.concepts.map((rawItem: unknown, idx: number) => {
        const item = (rawItem || {}) as Record<string, unknown>;
        const rawSimId = typeof item.simulation_id === 'string' ? item.simulation_id : 'none';
        const resolved = resolveRegisteredSimulation(rawSimId);

        const equations = Array.isArray(item.equations)
          ? item.equations
              .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === 'object'))
              .map((e) => ({
                formula: String(e.formula || '').trim(),
                name: String(e.name || '').trim(),
                variables: String(e.variables || '').trim(),
                units: e.units ? String(e.units).trim() : undefined,
              }))
              .filter((e) => e.formula.length > 0)
          : [];

        for (const eq of equations) {
          if (!seenEq.has(eq.formula)) {
            seenEq.add(eq.formula);
            aggregatedEquations.push(eq);
          }
        }

        const terminology = Array.isArray(item.terminology)
          ? item.terminology
              .filter((t): t is Record<string, unknown> => Boolean(t && typeof t === 'object'))
              .map((t) => ({
                term: String(t.term || '').trim(),
                definition: String(t.definition || '').trim(),
              }))
              .filter((t) => t.term.length > 0)
          : [];

        for (const term of terminology) {
          if (!seenTerm.has(term.term.toLowerCase())) {
            seenTerm.add(term.term.toLowerCase());
            aggregatedTerms.push(term);
          }
        }

        const variables = Array.isArray(item.variables)
          ? item.variables
              .filter((v): v is Record<string, unknown> => Boolean(v && typeof v === 'object'))
              .map((v) => ({
                symbol: String(v.symbol || '').trim(),
                meaning: String(v.meaning || '').trim(),
                unit: String(v.unit || '—').trim(),
              }))
              .filter((v) => v.symbol.length > 0)
          : [];

        return {
          id: String(item.id || `concept_${idx + 1}`),
          name: String(item.name || `Concept ${idx + 1}`),
          description: String(item.description || ''),
          equations,
          variables,
          relationships: typeof item.relationships === 'string' ? item.relationships : undefined,
          terminology,
          diagram_detected: Boolean(item.diagram_detected),
          simulation_id: resolved.simulationId,
          // Strictly authoritative from controlled registry — never trust AI boolean blindly
          simulation_supported: resolved.supported,
          simulation_reason:
            !resolved.supported && resolved.entry
              ? `${resolved.entry.label} simulation is registered as upcoming (explanation-only for this milestone).`
              : !resolved.supported
              ? 'Explanation-only concept — interactive simulation not yet implemented.'
              : undefined,
          confidence: normalizeConfidence(item.confidence),
        };
      });

      const detectedDiagrams = Array.isArray(parsed.detected_diagrams)
        ? parsed.detected_diagrams
            .filter((d): d is Record<string, unknown> => Boolean(d && typeof d === 'object'))
            .map((d) => ({
              title: String(d.title || 'Detected Diagram'),
              description: String(d.description || ''),
              components: Array.isArray(d.components) ? d.components.map(String) : [],
              interpretable: d.interpretable !== false,
            }))
        : [];

      const uncertainContent = Array.isArray(parsed.uncertain_content)
        ? parsed.uncertain_content.map(String).filter((s) => s.trim().length > 0)
        : [];

      const rawDetectedExp = (parsed.detected_experiment || {}) as Record<string, unknown>;
      const parsedClassMatch = String(parsed.class_level || '').match(/\b(6|7|8|9|10)\b/);
      const classNumRaw = Number(rawDetectedExp.class_level_numeric || parsedClassMatch?.[1] || 9);
      const classLevelNumeric = Math.max(6, Math.min(10, Math.round(Number.isFinite(classNumRaw) ? classNumRaw : 9)));
      const rawDomain = String(rawDetectedExp.domain_category || '').trim();
      const domainCategory = (APPROVED_DYNAMIC_DOMAINS as readonly string[]).includes(rawDomain)
        ? rawDomain
        : 'mechanics';

      const detectedExperiment = {
        experiment_name: String(rawDetectedExp.experiment_name || parsed.main_topic || 'Physics Experiment'),
        physics_concept: String(rawDetectedExp.physics_concept || validatedConcepts[0]?.name || parsed.main_topic || 'Physics'),
        domain_category: domainCategory as (typeof APPROVED_DYNAMIC_DOMAINS)[number],
        class_level_numeric: classLevelNumeric,
        components_apparatus: Array.isArray(rawDetectedExp.components_apparatus)
          ? rawDetectedExp.components_apparatus.map(String).slice(0, 10)
          : [],
        diagram_structure: String(rawDetectedExp.diagram_structure || ''),
        variables_units: Array.isArray(rawDetectedExp.variables_units)
          ? rawDetectedExp.variables_units
              .filter((v): v is Record<string, unknown> => Boolean(v && typeof v === 'object'))
              .map((v) => ({
                symbol: String(v.symbol || '').trim(),
                meaning: String(v.meaning || '').trim(),
                unit: String(v.unit || '—').trim(),
              }))
          : [],
        experimental_procedure: Array.isArray(rawDetectedExp.experimental_procedure)
          ? rawDetectedExp.experimental_procedure.map(String).slice(0, 6)
          : [],
        expected_behaviour: String(rawDetectedExp.expected_behaviour || ''),
        preferred_dimension: (rawDetectedExp.preferred_dimension === '3d' ? '3d' : '2d') as '2d' | '3d',
        dimension_reason: String(
          rawDetectedExp.dimension_reason || '2D diagram highlights vectors and equations clearly.'
        ),
        is_complex_or_unsupported: Boolean(rawDetectedExp.is_complex_or_unsupported),
        limitation_summary: rawDetectedExp.limitation_summary
          ? String(rawDetectedExp.limitation_summary)
          : undefined,
      };

      const overallMatch = matchExperimentInRegistry({
        experimentName: detectedExperiment.experiment_name,
        conceptName: detectedExperiment.physics_concept,
        summary: String(parsed.summary || ''),
        equations: aggregatedEquations.map((e) => `${e.name} ${e.formula}`),
        apparatus: detectedExperiment.components_apparatus,
        classLevel: classLevelNumeric,
      });

      const enrichedConcepts = validatedConcepts.map((c) => {
        const cMatch = matchExperimentInRegistry({
          experimentName: detectedExperiment.experiment_name,
          conceptName: c.name,
          conceptId: c.id,
          summary: c.description,
          equations: c.equations.map((e) => `${e.name} ${e.formula}`),
          apparatus: detectedExperiment.components_apparatus,
          classLevel: classLevelNumeric,
        });
        if (cMatch.matchType === 'exact_existing' && cMatch.matchedExperimentId) {
          return {
            ...c,
            simulation_supported: true,
            matched_experiment_id: cMatch.matchedExperimentId,
            needs_dynamic_generation: false,
            simulation_reason: cMatch.reason,
          };
        }
        return {
          ...c,
          matched_experiment_id: undefined,
          needs_dynamic_generation: true,
          simulation_reason: cMatch.reason,
        };
      });

      const safeResult = {
        is_physics_content: true,
        subject: String(parsed.subject || 'Physics'),
        class_level: String(parsed.class_level || `Class ${classLevelNumeric}`),
        chapter: String(parsed.chapter || 'Physics Chapter'),
        main_topic: String(parsed.main_topic || 'Physics Concepts'),
        summary: String(parsed.summary || ''),
        concepts: enrichedConcepts,
        equations: aggregatedEquations,
        terminology: aggregatedTerms,
        detected_diagrams: detectedDiagrams,
        extracted_text: String(parsed.extracted_text || ''),
        uncertain_content: uncertainContent,
        overall_confidence: normalizeConfidence(parsed.overall_confidence),
        translations: parsed.translations,
        analyzedAt: new Date().toISOString(),
        language: language === 'kn' || language === 'hi' ? language : 'en',
        source: 'gemini_scan',
        detected_experiment: detectedExperiment,
        registry_match: overallMatch,
      };

      res.json(safeResult);
    } catch (err: unknown) {
      handleGeminiRouteError(err, res);
    }
  });

  // -------------------------------------------------------------------------
  // Dynamic AI Physics Experiment Generator (Schema-Validated & Deterministic)
  // -------------------------------------------------------------------------
  app.post('/api/generate-experiment', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as {
        analysisContext?: Record<string, unknown>;
        focusConcept?: Record<string, unknown>;
        imageBase64?: string;
        mimeType?: string;
        studentClass?: number;
        preferredTemplateId?: string;
        language?: string;
        ownerUid?: string;
      };

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini AI experiment generator is unavailable because GEMINI_API_KEY is missing in environment secrets.',
          code: 'API_KEY_NOT_CONFIGURED',
        });
        return;
      }

      const analysisCtx = (body.analysisContext || {}) as Record<string, unknown>;
      const focusConcept = (body.focusConcept || {}) as Record<string, unknown>;
      const detectedExp = (analysisCtx.detected_experiment || {}) as Record<string, unknown>;

      const templateParamGuide = APPROVED_TEMPLATE_IDS.map((tid) => {
        const cfg = TEMPLATE_PHYSICS_CONFIG[tid];
        const keys = Object.keys(cfg.paramRules).join(', ');
        return `- "${tid}" (supports3d=${cfg.supports3d}, domain=${cfg.defaultDomain}): allowed parameter keys = [${keys}]`;
      }).join('\n');

      const prompt = `You are a Principal Physics Curriculum & Simulation Architect for Class 6-10 students.
Assemble a strictly deterministic, safe, structured simulation specification using ONLY one of the approved physics solver templates below.
NEVER write JavaScript, HTML, CSS, or code snippets. Output structured data only.

Approved Simulation Templates & Exact Allowed Parameter Keys:
${templateParamGuide}

Approved Component visualAssetKey values:
${Array.from(APPROVED_VISUAL_ASSET_KEYS).join(', ')}

Textbook / Concept Context:
- Main Topic: ${sanitizeStudentPlainText(analysisCtx.main_topic || detectedExp.experiment_name || focusConcept.name || 'Physics Experiment')}
- Concept Name: ${sanitizeStudentPlainText(focusConcept.name || detectedExp.physics_concept || analysisCtx.main_topic || '')}
- Concept Description: ${sanitizeStudentPlainText(focusConcept.description || analysisCtx.summary || '')}
- Chapter: ${sanitizeStudentPlainText(analysisCtx.chapter || '')}
- Class Level: ${body.studentClass || detectedExp.class_level_numeric || 9}
- Apparatus Detected: ${JSON.stringify(detectedExp.components_apparatus || [])}
- Equations Detected: ${JSON.stringify(focusConcept.equations || analysisCtx.equations || [])}
- Preferred Template Hint: ${sanitizeStudentPlainText(body.preferredTemplateId || '')}
- Complexity Flag: ${Boolean(detectedExp.is_complex_or_unsupported)} (${sanitizeStudentPlainText(detectedExp.limitation_summary || '')})

Rules:
1. Pick the single most scientifically accurate templateId from [${APPROVED_TEMPLATE_IDS.join(', ')}].
2. Every parameter's "key" MUST match one of the exact allowed parameter keys for that chosen templateId! Include 2 to 4 meaningful sliders/toggles within realistic school lab SI bounds.
3. Choose visualizationMode = "3d" ONLY when supports3d=true AND 3D spatial understanding genuinely improves comprehension (e.g. inclined plane geometry, pendulum arc, magnetic dipole 3D field); otherwise use "2d".
4. Include 3 to 5 interactive components with normalized viewport coordinates positionNormalized { x: 0.12..0.88, y: 0.15..0.85, z: -0.5..0.5 } reflecting how the apparatus is spatially arranged in the diagram, each mapped to a valid visualAssetKey.
5. Never invent fake laws. If the textbook topic relies on effects simplified by the template (e.g., neglecting air resistance, point mass assumption, idealized fluid/wire, or representing a complex phenomenon with an educational analogue), set isSimplifiedModel=true and write an honest 1-sentence limitationNote explaining the approximation.
6. Provide 3 concise assessmentQuestions (conceptual, application, numerical) with 4 options and clear explanations.
7. Populate natural student-friendly translations in translations.en, translations.kn (Kannada script), and translations.hi (Hindi Devanagari script) keeping SI symbols intact.`;

      const translationLocaleSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          educationalObjective: { type: Type.STRING },
          conceptExplanation: { type: Type.STRING },
          whyImportant: { type: Type.STRING },
          realWorldApplication: { type: Type.STRING },
          expectedBehaviour: { type: Type.STRING },
          limitationNote: { type: Type.STRING },
          procedureSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          'title',
          'educationalObjective',
          'conceptExplanation',
          'expectedBehaviour',
          'procedureSteps',
        ],
      };

      const generateSchema = {
        type: Type.OBJECT,
        properties: {
          templateId: { type: Type.STRING },
          domain: { type: Type.STRING },
          visualizationMode: { type: Type.STRING },
          visualRepresentationNotes: { type: Type.STRING },
          title: { type: Type.STRING },
          educationalObjective: { type: Type.STRING },
          conceptExplanation: { type: Type.STRING },
          whyImportant: { type: Type.STRING },
          realWorldApplication: { type: Type.STRING },
          expectedBehaviour: { type: Type.STRING },
          isSimplifiedModel: { type: Type.BOOLEAN },
          limitationNote: { type: Type.STRING },
          components: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                role: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
                characteristics: { type: Type.STRING },
                functionDescription: { type: Type.STRING },
                relationship: { type: Type.STRING },
                realWorldExample: { type: Type.STRING },
                visualAssetKey: { type: Type.STRING },
                positionNormalized: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    z: { type: Type.NUMBER },
                  },
                  required: ['x', 'y'],
                },
              },
              required: [
                'id',
                'role',
                'label',
                'description',
                'relationship',
                'visualAssetKey',
                'positionNormalized',
              ],
            },
          },
          parameters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                label: { type: Type.STRING },
                symbol: { type: Type.STRING },
                unit: { type: Type.STRING },
                min: { type: Type.NUMBER },
                max: { type: Type.NUMBER },
                step: { type: Type.NUMBER },
                defaultValue: { type: Type.NUMBER },
                controlType: { type: Type.STRING },
              },
              required: ['key', 'label', 'symbol', 'unit', 'min', 'max', 'step', 'defaultValue'],
            },
          },
          equations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                formula: { type: Type.STRING },
                variables: { type: Type.STRING },
                units: { type: Type.STRING },
              },
              required: ['name', 'formula', 'variables', 'units'],
            },
          },
          procedureSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          assessmentQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                kind: { type: Type.STRING },
                prompt: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
              },
              required: ['id', 'kind', 'prompt', 'options', 'correctIndex', 'explanation'],
            },
          },
          translations: {
            type: Type.OBJECT,
            properties: {
              en: translationLocaleSchema,
              kn: translationLocaleSchema,
              hi: translationLocaleSchema,
            },
            required: ['en', 'kn', 'hi'],
          },
        },
        required: [
          'templateId',
          'domain',
          'visualizationMode',
          'title',
          'educationalObjective',
          'conceptExplanation',
          'expectedBehaviour',
          'components',
          'parameters',
          'equations',
          'procedureSteps',
          'assessmentQuestions',
          'translations',
        ],
      };

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (
        typeof body.imageBase64 === 'string' &&
        body.imageBase64.trim().length > 64 &&
        body.imageBase64.length <= MAX_BASE64_BYTES &&
        body.mimeType &&
        ALLOWED_MIME_TYPES.has(body.mimeType.toLowerCase())
      ) {
        parts.push({
          inlineData: {
            mimeType:
              body.mimeType.toLowerCase() === 'image/jpg'
                ? 'image/jpeg'
                : body.mimeType.toLowerCase(),
            data: body.imageBase64,
          },
        });
      }
      parts.push({ text: prompt });

      const response = await generateJsonWithModelFallback(ai, parts, generateSchema, 28000);
      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'Experiment generator returned an empty response. Please retry.',
          code: 'EMPTY_MODEL_RESPONSE',
        });
        return;
      }

      const rawParsed = JSON.parse(rawText) as Record<string, unknown>;
      const validatedSpec = validateAndSanitizeDynamicExperimentSpec(rawParsed, {
        studentClass: Number(body.studentClass || detectedExp.class_level_numeric || 9),
        chapterTitle: sanitizeStudentPlainText(analysisCtx.chapter || ''),
        conceptId: sanitizeStudentPlainText(focusConcept.id || ''),
        conceptName: sanitizeStudentPlainText(focusConcept.name || detectedExp.physics_concept || ''),
        sourceScanTopic: sanitizeStudentPlainText(analysisCtx.main_topic || detectedExp.experiment_name || ''),
        ownerUid: sanitizeStudentPlainText(body.ownerUid || '') || undefined,
        forceSimplifiedNote: detectedExp.is_complex_or_unsupported
          ? sanitizeStudentPlainText(detectedExp.limitation_summary || '')
          : undefined,
      });

      res.json({
        experiment: validatedSpec,
        validationReport: {
          status: validatedSpec.validationStatus,
          checksPassed: validatedSpec.validationChecksPassed,
          warnings: validatedSpec.validationWarnings,
          isSimplifiedModel: validatedSpec.isSimplifiedModel,
          limitationNote: validatedSpec.limitationNote,
        },
      });
    } catch (err: unknown) {
      handleGeminiRouteError(err, res);
    }
  });

  // -------------------------------------------------------------------------
  // Prompt 04: Context-Aware Experiment Explainability Engine
  // -------------------------------------------------------------------------
  app.post('/api/explain-experiment', async (req: Request, res: Response) => {
    try {
      const {
        experimentId,
        experimentName,
        visualizationMode,
        parameters,
        previousParameters,
        telemetry,
        selectedObject,
        textbookContext,
        language,
      } = req.body as {
        experimentId?: string;
        experimentName?: string;
        visualizationMode?: string;
        parameters?: Record<string, unknown>;
        previousParameters?: Record<string, unknown> | null;
        telemetry?: Record<string, unknown>;
        selectedObject?: string | null;
        textbookContext?: Record<string, unknown> | null;
        language?: string;
      };

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini AI explainability is unavailable because GEMINI_API_KEY is missing. Configure GEMINI_API_KEY in Settings > Secrets.',
          code: 'API_KEY_NOT_CONFIGURED',
        });
        return;
      }

      const targetLangCode = language === 'kn' || language === 'hi' ? language : 'en';
      const targetLanguageName = getLanguageDisplayName(targetLangCode);
      const safeMode = visualizationMode === '3d' || visualizationMode === '3D' ? '3d' : '2d';

      const currentParams = parameters || {};
      const prevParams = previousParameters || null;
      const changedDescriptions: string[] = [];
      if (prevParams) {
        for (const key of [
          'strength',
          'magnetAngleDeg',
          'magnetPitchDeg',
          'showFieldLines',
          'showVectorGrid',
          'mode',
          'compassCount',
          'activeExperimentId',
        ]) {
          if (
            prevParams[key] !== undefined &&
            currentParams[key] !== undefined &&
            prevParams[key] !== currentParams[key]
          ) {
            changedDescriptions.push(
              `${key} changed from ${String(prevParams[key])} to ${String(currentParams[key])}`
            );
          }
        }
      }

      const prompt = `You are PHYSIX AI, an expert NCERT Physics teacher and scientific visualization explainability assistant.

Generate a clear, accurate, student-friendly structured explanation for the currently open physics experiment.

CURRENT EXPERIMENT CONTEXT:
- Experiment ID: ${experimentId || 'bar_magnet_explorer'}
- Experiment Name: ${experimentName || 'Magnetic Field Around a Bar Magnet'}
- Selected Mode: ${safeMode.toUpperCase()}
- Selected Object Focus (if any): ${selectedObject || 'none'}
- Current Simulation Parameters: ${JSON.stringify(currentParams)}
- Previous Parameters Snapshot: ${prevParams ? JSON.stringify(prevParams) : 'First explanation (no prior snapshot)'}
- Verified Parameter Deltas Since Last Explanation: ${
        changedDescriptions.length > 0
          ? changedDescriptions.join('; ')
          : 'No parameter values changed since last snapshot.'
      }
- Live Compass Probe Telemetry: ${JSON.stringify(telemetry || {})}
- Detected Textbook Context (if scanned): ${textbookContext ? JSON.stringify(textbookContext) : 'Built-in NCERT Magnetism curriculum'}

TARGET LANGUAGE: ${targetLanguageName}
Write ALL descriptive fields in natural, scientifically accurate ${targetLanguageName}. Keep standard mathematical formulas and SI unit symbols (B, m, r, τ, T, mT, A·m², N·m) clear.

CRITICAL HONESTY & OBJECT RULES:
1. Identify the important objects specifically present in THIS experiment.
   - For the bar magnet experiments (bar_magnet_explorer, compass_field_explorer, field_line_intersection_explorer), explain: bar magnet, North pole, South pole, magnetic field, magnetic field lines, compass needle, magnetic dipole, magnetic field direction, and magnetic field strength. Map objects_characteristics ids using ONLY: "north_pole", "south_pole", "bar_magnet", "field_lines", "compass_needle".
   - Do NOT include magnetism-specific concepts if the experiment is unrelated.
2. In "parameter_effects" (Section I), inspect the ACTUAL current parameters and Verified Parameter Deltas above.
   - If magnetic strength changed (or is set to a specific multiplier like ${String(currentParams.strength ?? 1.2)}×), explain the exact physical effect on |B|, field-line density, and compass torque.
   - If magnet angle/rotation changed (currently ${String(currentParams.magnetAngleDeg ?? 0)}°), explain how pole orientation rotates the magnetic field and compass alignment.
   - NEVER claim a variable changed if Verified Parameter Deltas says it did not change!
3. Produce all 10 sections (A–J) cleanly plus a concise 2–3 sentence "spoken_summary" suitable for audio playback.`;

      const explainSchema = {
        type: Type.OBJECT,
        properties: {
          what_we_observe: { type: Type.STRING },
          objects_characteristics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                characteristics: { type: Type.STRING },
                functionDescription: { type: Type.STRING },
                interactionDescription: { type: Type.STRING },
              },
              required: [
                'id',
                'name',
                'characteristics',
                'functionDescription',
                'interactionDescription',
              ],
            },
          },
          important_components: { type: Type.ARRAY, items: { type: Type.STRING } },
          scientific_principles: { type: Type.STRING },
          how_it_works: { type: Type.STRING },
          step_by_step: { type: Type.ARRAY, items: { type: Type.STRING } },
          equations_and_variables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                formula: { type: Type.STRING },
                name: { type: Type.STRING },
                variables: { type: Type.STRING },
              },
              required: ['formula', 'name', 'variables'],
            },
          },
          real_world_applications: { type: Type.ARRAY, items: { type: Type.STRING } },
          parameter_effects: { type: Type.STRING },
          key_learning_outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
          spoken_summary: { type: Type.STRING },
        },
        required: [
          'what_we_observe',
          'objects_characteristics',
          'important_components',
          'scientific_principles',
          'how_it_works',
          'step_by_step',
          'equations_and_variables',
          'real_world_applications',
          'parameter_effects',
          'key_learning_outcomes',
          'spoken_summary',
        ],
      };

      const response = await generateJsonWithModelFallback(
        ai,
        [{ text: prompt }],
        explainSchema
      );

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'The AI explainability engine returned an empty response. Please try again.',
          code: 'EMPTY_MODEL_RESPONSE',
        });
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        res.status(502).json({
          error: 'Received malformed structured explanation output. Please try again.',
          code: 'INVALID_AI_RESPONSE',
        });
        return;
      }

      const objectsCharacteristics = Array.isArray(parsed.objects_characteristics)
        ? parsed.objects_characteristics
            .filter((o): o is Record<string, unknown> => Boolean(o && typeof o === 'object'))
            .filter((o) => /^[a-z0-9_]{2,48}$/.test(String(o.id || '').trim()))
            .map((o) => ({
              id: String(o.id).trim(),
              name: String(o.name || ''),
              characteristics: String(o.characteristics || ''),
              functionDescription: String(o.functionDescription || ''),
              interactionDescription: String(o.interactionDescription || ''),
            }))
        : [];

      res.json({
        what_we_observe: String(parsed.what_we_observe || ''),
        objects_characteristics: objectsCharacteristics,
        important_components: Array.isArray(parsed.important_components)
          ? parsed.important_components.map(String)
          : [],
        scientific_principles: String(parsed.scientific_principles || ''),
        how_it_works: String(parsed.how_it_works || ''),
        step_by_step: Array.isArray(parsed.step_by_step)
          ? parsed.step_by_step.map(String)
          : [],
        equations_and_variables: Array.isArray(parsed.equations_and_variables)
          ? parsed.equations_and_variables
              .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === 'object'))
              .map((e) => ({
                formula: String(e.formula || ''),
                name: String(e.name || ''),
                variables: String(e.variables || ''),
              }))
          : [],
        real_world_applications: Array.isArray(parsed.real_world_applications)
          ? parsed.real_world_applications.map(String)
          : [],
        parameter_effects: String(parsed.parameter_effects || ''),
        key_learning_outcomes: Array.isArray(parsed.key_learning_outcomes)
          ? parsed.key_learning_outcomes.map(String)
          : [],
        spoken_summary: String(parsed.spoken_summary || parsed.what_we_observe || ''),
        generatedAt: new Date().toISOString(),
        language: targetLangCode,
        mode: safeMode,
      });
    } catch (err: unknown) {
      handleGeminiRouteError(err, res);
    }
  });

  // -------------------------------------------------------------------------
  // Two-Stage In-Viewport Component-Specific AI Explanation
  // -------------------------------------------------------------------------
  app.post('/api/explain-component', async (req: Request, res: Response) => {
    try {
      const {
        componentId,
        componentName,
        componentContext,
        experimentId,
        experimentName,
        visualizationMode,
        studentClass,
        relevantConcept,
        parameters,
        currentState,
        textbookContext,
        language,
      } = req.body as {
        componentId?: string;
        componentName?: string;
        componentContext?: string;
        experimentId?: string;
        experimentName?: string;
        visualizationMode?: string;
        studentClass?: number;
        relevantConcept?: string;
        parameters?: Record<string, unknown>;
        currentState?: string;
        textbookContext?: Record<string, unknown> | null;
        language?: string;
      };

      if (!componentId || typeof componentId !== 'string') {
        res.status(400).json({
          error: 'A valid simulation component ID is required.',
          code: 'MISSING_COMPONENT_ID',
        });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini AI component explanation is unavailable because GEMINI_API_KEY is missing.',
          code: 'API_KEY_NOT_CONFIGURED',
        });
        return;
      }

      const targetLangCode = language === 'kn' || language === 'hi' ? language : 'en';
      const targetLanguageName = getLanguageDisplayName(targetLangCode);
      const safeMode = visualizationMode === '3d' || visualizationMode === '3D' ? '3d' : '2d';
      const effectiveGrade =
        typeof studentClass === 'number' && studentClass >= 6 && studentClass <= 10
          ? studentClass
          : 7;

      const prompt = `You are PHYSIX AI, a NCERT Class ${effectiveGrade} Physics teacher inside a live simulation.
Explain ONLY the clicked component below concisely (1-2 clear sentences per field) in natural ${targetLanguageName}. Never use HTML, markdown, or code.

Component: ${componentName || componentId} (id: ${componentId})
Concept Focus: ${relevantConcept || componentContext || componentName || componentId}
Experiment: ${experimentName || experimentId || 'Physics Lab'} (${safeMode.toUpperCase()})
Live State: ${currentState || 'Active'}
Parameters: ${JSON.stringify(parameters || {}).slice(0, 360)}
${textbookContext ? `Textbook: ${JSON.stringify(textbookContext).slice(0, 260)}` : ''}`;

      const componentSchema = {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          definition: { type: Type.STRING },
          characteristics: { type: Type.STRING },
          functionDescription: { type: Type.STRING },
          scientificProperties: { type: Type.STRING },
          behaviour: { type: Type.STRING },
          relationshipWithOthers: { type: Type.STRING },
          realWorldExample: { type: Type.STRING },
          whyItMatters: { type: Type.STRING },
        },
        required: [
          'name',
          'definition',
          'characteristics',
          'functionDescription',
          'scientificProperties',
          'behaviour',
          'relationshipWithOthers',
          'realWorldExample',
          'whyItMatters',
        ],
      };

      const response = await generateJsonWithModelFallback(
        ai,
        [{ text: prompt }],
        componentSchema
      );

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'Empty response from AI component explainer.',
          code: 'EMPTY_MODEL_RESPONSE',
        });
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        res.status(502).json({
          error: 'Received invalid structured data from AI component explainer.',
          code: 'INVALID_AI_RESPONSE',
        });
        return;
      }

      const validated = {
        name: sanitizeStudentPlainText(parsed.name) || String(componentName || componentId),
        definition: sanitizeStudentPlainText(parsed.definition),
        characteristics: sanitizeStudentPlainText(parsed.characteristics),
        functionDescription: sanitizeStudentPlainText(parsed.functionDescription),
        scientificProperties: sanitizeStudentPlainText(parsed.scientificProperties),
        behaviour: sanitizeStudentPlainText(parsed.behaviour),
        relationshipWithOthers: sanitizeStudentPlainText(parsed.relationshipWithOthers),
        realWorldExample: sanitizeStudentPlainText(parsed.realWorldExample),
        whyItMatters: sanitizeStudentPlainText(parsed.whyItMatters),
        currentStateSummary: sanitizeStudentPlainText(currentState),
        source: 'ai_enhanced' as const,
      };

      if (!validated.definition || !validated.functionDescription) {
        res.status(502).json({
          error: 'AI component explanation was incomplete.',
          code: 'INVALID_AI_RESPONSE',
        });
        return;
      }

      res.json(validated);
    } catch (err: unknown) {
      handleGeminiRouteError(err, res);
    }
  });

  // -------------------------------------------------------------------------
  // Prompt 07: Natural Multilingual Speech Transcription, Neural TTS & Conversational Tutor
  // -------------------------------------------------------------------------
  function detectScriptLanguage(
    text: string,
    fallback: 'en' | 'kn' | 'hi'
  ): 'en' | 'kn' | 'hi' {
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    if (/[a-zA-Z]/.test(text)) return 'en';
    return fallback;
  }

  function prepareTextForNaturalSpeech(rawText: string, lang: 'en' | 'kn' | 'hi'): string {
    let cleaned = sanitizeStudentPlainText(rawText)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#_~]/g, ' ')
      .replace(/[•·|→⇒]/g, ', ')
      .replace(/−/g, '-');

    if (lang === 'en') {
      cleaned = cleaned
        .replace(/m\/s²/g, 'meters per second squared')
        .replace(/m\/s/g, 'meters per second')
        .replace(/(\d+(?:\.\d+)?)\s*°\s*C\b/gi, '$1 degrees Celsius')
        .replace(/(\d+(?:\.\d+)?)\s*°\s*F\b/gi, '$1 degrees Fahrenheit')
        .replace(/(\d+(?:\.\d+)?)\s*°/g, '$1 degrees')
        .replace(/(\d+(?:\.\d+)?)\s*Ω/g, '$1 ohms')
        .replace(/×/g, ' times ');
    } else if (lang === 'kn') {
      cleaned = cleaned
        .replace(/m\/s²/g, 'ಮೀಟರ್ ಪರ್ ಸೆಕೆಂಡ್ ಸ್ಕ್ವೇರ್ಡ್')
        .replace(/m\/s/g, 'ಮೀಟರ್ ಪರ್ ಸೆಕೆಂಡ್')
        .replace(/(\d+(?:\.\d+)?)\s*°\s*C\b/gi, '$1 ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್')
        .replace(/(\d+(?:\.\d+)?)\s*°\s*F\b/gi, '$1 ಡಿಗ್ರಿ ಫ್ಯಾರನ್‌ಹೀಟ್')
        .replace(/(\d+(?:\.\d+)?)\s*°/g, '$1 ಡಿಗ್ರಿ')
        .replace(/(\d+(?:\.\d+)?)\s*Ω/g, '$1 ಓಮ್')
        .replace(/×/g, ' ');
    } else if (lang === 'hi') {
      cleaned = cleaned
        .replace(/m\/s²/g, 'मीटर प्रति सेकंड वर्ग')
        .replace(/m\/s/g, 'मीटर प्रति सेकंड')
        .replace(/(\d+(?:\.\d+)?)\s*°\s*C\b/gi, '$1 डिग्री सेल्सियस')
        .replace(/(\d+(?:\.\d+)?)\s*°\s*F\b/gi, '$1 डिग्री फ़ारेनहाइट')
        .replace(/(\d+(?:\.\d+)?)\s*°/g, '$1 डिग्री')
        .replace(/(\d+(?:\.\d+)?)\s*Ω/g, '$1 ओम')
        .replace(/×/g, ' गुना ');
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    if (cleaned.length > 1100) {
      const slice = cleaned.slice(0, 1100);
      const lastBreak = Math.max(
        slice.lastIndexOf('.'),
        slice.lastIndexOf('।'),
        slice.lastIndexOf('?'),
        slice.lastIndexOf('!')
      );
      cleaned = lastBreak > 400 ? slice.slice(0, lastBreak + 1) : `${slice}...`;
    }
    return cleaned;
  }

  function buildPcmWavHeader(pcmByteLength: number, sampleRate = 24000): Buffer {
    const header = Buffer.alloc(44);
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcmByteLength, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(pcmByteLength, 40);
    return header;
  }

  function sanitizeTutorParameterSuggestion(
    raw: unknown,
    engineId: string
  ): {
    magnetAngleDeg?: number;
    magnetPitchDeg?: number;
    strength?: number;
    showFieldLines?: boolean;
    showVectorGrid?: boolean;
    showCompass?: boolean;
    compassCount?: number;
    mode?: '2d' | '3d';
    voltageV?: number;
    resistance1?: number;
    switchClosed?: boolean;
    incidenceDeg?: number;
    objectDistanceCm?: number;
    focalLengthCm?: number;
    heaterTempC?: number;
    frequencyHz?: number;
    amplitudePct?: number;
    summaryLabel?: string;
  } | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    const obj = raw as Record<string, unknown>;
    if (!obj.apply_adjustment) {
      return null;
    }

    const suggestion: {
      magnetAngleDeg?: number;
      magnetPitchDeg?: number;
      strength?: number;
      showFieldLines?: boolean;
      showVectorGrid?: boolean;
      showCompass?: boolean;
      compassCount?: number;
      mode?: '2d' | '3d';
      voltageV?: number;
      resistance1?: number;
      switchClosed?: boolean;
      incidenceDeg?: number;
      objectDistanceCm?: number;
      focalLengthCm?: number;
      heaterTempC?: number;
      frequencyHz?: number;
      amplitudePct?: number;
      summaryLabel?: string;
    } = {};

    if (engineId === 'bar_magnet') {
      if (typeof obj.strength === 'number' && Number.isFinite(obj.strength)) {
        suggestion.strength = Number(Math.max(0.3, Math.min(2.4, obj.strength)).toFixed(1));
      }
      if (typeof obj.magnet_angle_deg === 'number' && Number.isFinite(obj.magnet_angle_deg)) {
        suggestion.magnetAngleDeg = Math.round(((obj.magnet_angle_deg % 360) + 360) % 360);
      }
      if (typeof obj.magnet_pitch_deg === 'number' && Number.isFinite(obj.magnet_pitch_deg)) {
        suggestion.magnetPitchDeg = Math.max(-60, Math.min(60, Math.round(obj.magnet_pitch_deg)));
      }
      if (typeof obj.show_field_lines === 'boolean') {
        suggestion.showFieldLines = obj.show_field_lines;
      }
      if (typeof obj.show_vector_grid === 'boolean') {
        suggestion.showVectorGrid = obj.show_vector_grid;
      }
      if (typeof obj.show_compass === 'boolean') {
        suggestion.showCompass = obj.show_compass;
      }
      if (typeof obj.compass_count === 'number' && Number.isFinite(obj.compass_count)) {
        suggestion.compassCount = Math.max(1, Math.min(7, Math.round(obj.compass_count)));
      }
      if (obj.mode === '2d' || obj.mode === '3d') {
        suggestion.mode = obj.mode;
      }
    } else if (engineId === 'electric_circuit_lab') {
      if (typeof obj.voltage_v === 'number' && Number.isFinite(obj.voltage_v)) {
        suggestion.voltageV = Number(Math.max(1.5, Math.min(12, obj.voltage_v)).toFixed(1));
      }
      if (typeof obj.resistance_1 === 'number' && Number.isFinite(obj.resistance_1)) {
        suggestion.resistance1 = Math.max(2, Math.min(30, Math.round(obj.resistance_1)));
      }
      if (typeof obj.switch_closed === 'boolean') {
        suggestion.switchClosed = obj.switch_closed;
      }
    } else if (engineId === 'optics_ray_lab') {
      if (typeof obj.incidence_deg === 'number' && Number.isFinite(obj.incidence_deg)) {
        suggestion.incidenceDeg = Math.max(10, Math.min(75, Math.round(obj.incidence_deg)));
      }
      if (typeof obj.object_distance_cm === 'number' && Number.isFinite(obj.object_distance_cm)) {
        suggestion.objectDistanceCm = Math.max(8, Math.min(60, Math.round(obj.object_distance_cm)));
      }
      if (typeof obj.focal_length_cm === 'number' && Number.isFinite(obj.focal_length_cm)) {
        suggestion.focalLengthCm = Math.max(10, Math.min(28, Math.round(obj.focal_length_cm)));
      }
    } else if (engineId === 'heat_transfer_lab') {
      if (typeof obj.heater_temp_c === 'number' && Number.isFinite(obj.heater_temp_c)) {
        suggestion.heaterTempC = Math.max(30, Math.min(100, Math.round(obj.heater_temp_c)));
      }
    } else if (engineId === 'sound_wave_lab') {
      if (typeof obj.frequency_hz === 'number' && Number.isFinite(obj.frequency_hz)) {
        suggestion.frequencyHz = Math.max(120, Math.min(880, Math.round(obj.frequency_hz)));
      }
      if (typeof obj.amplitude_pct === 'number' && Number.isFinite(obj.amplitude_pct)) {
        suggestion.amplitudePct = Math.max(20, Math.min(100, Math.round(obj.amplitude_pct)));
      }
    } else {
      return null;
    }

    if (typeof obj.summary_label === 'string' && obj.summary_label.trim().length > 0) {
      suggestion.summaryLabel = sanitizeStudentPlainText(obj.summary_label);
    }

    const hasAnyChange =
      suggestion.strength !== undefined ||
      suggestion.magnetAngleDeg !== undefined ||
      suggestion.magnetPitchDeg !== undefined ||
      suggestion.showFieldLines !== undefined ||
      suggestion.showVectorGrid !== undefined ||
      suggestion.showCompass !== undefined ||
      suggestion.compassCount !== undefined ||
      suggestion.mode !== undefined ||
      suggestion.voltageV !== undefined ||
      suggestion.resistance1 !== undefined ||
      suggestion.switchClosed !== undefined ||
      suggestion.incidenceDeg !== undefined ||
      suggestion.objectDistanceCm !== undefined ||
      suggestion.focalLengthCm !== undefined ||
      suggestion.heaterTempC !== undefined ||
      suggestion.frequencyHz !== undefined ||
      suggestion.amplitudePct !== undefined;

    return hasAnyChange ? suggestion : null;
  }

  // Step A: Transcribe spoken student audio (with auto language detection for EN / KN / HI)
  app.post('/api/tutor-transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, audioMimeType, preferredLanguage } = req.body as {
        audioBase64?: string;
        audioMimeType?: string;
        preferredLanguage?: string;
      };

      if (typeof audioBase64 !== 'string' || audioBase64.trim().length < 48) {
        res.status(400).json({
          error: 'The recorded audio clip was empty. Please speak clearly and try again.',
          code: 'EMPTY_AUDIO',
        });
        return;
      }

      if (audioBase64.length > MAX_BASE64_BYTES) {
        res.status(413).json({
          error: 'The audio recording is too long. Please keep questions concise.',
          code: 'AUDIO_TOO_LARGE',
        });
        return;
      }

      const normalizedAudioMime = normalizeAudioMimeType(audioMimeType);
      if (!normalizedAudioMime) {
        res.status(400).json({
          error: 'Unsupported recorded audio format. Please try recording again or type your question.',
          code: 'UNSUPPORTED_AUDIO_FORMAT',
        });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Voice transcription requires GEMINI_API_KEY in server Secrets. You can still type your question directly.',
          code: 'API_KEY_NOT_CONFIGURED',
        });
        return;
      }

      const fallbackLang: 'en' | 'kn' | 'hi' =
        preferredLanguage === 'kn' || preferredLanguage === 'hi' ? preferredLanguage : 'en';
      const preferredLangDisplay = getLanguageDisplayName(fallbackLang);

      const audioPart = {
        inlineData: {
          mimeType: normalizedAudioMime,
          data: audioBase64.trim(),
        },
      };

      const transcribeInstruction = `Transcribe the student speech accurately into clean plain text in the exact spoken language: English (Latin script), Kannada (ಕನ್ನಡ script), or Hindi (हिन्दी Devanagari script). The student's selected lab language is ${preferredLangDisplay}, though they may speak in any of those three languages. Preserve physics terms clearly. If the clip is only silence, background noise, or completely unintelligible, output exactly [UNCLEAR]. Output only the transcribed words with no extra commentary.`;

      let rawTranscript = '';
      try {
        const transcribeResp = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.5-transcribe',
            contents: { parts: [audioPart, { text: transcribeInstruction }] },
          }),
          16000,
          'Gemini Transcribe'
        );
        rawTranscript = (transcribeResp.text || '').trim();
      } catch (primaryErr) {
        // Resilient fallback to multimodal flash-lite if transcribe endpoint hits transient/format issue
        const fallbackResp = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: { parts: [audioPart, { text: transcribeInstruction }] },
            config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
          }),
          16000,
          'Gemini Audio Fallback'
        );
        rawTranscript = (fallbackResp.text || '').trim();
        if (!rawTranscript) throw primaryErr;
      }

      const cleaned = sanitizeStudentPlainText(rawTranscript).replace(/^["“]|["”]$/g, '').trim();
      const unclear =
        !cleaned ||
        cleaned === '[UNCLEAR]' ||
        cleaned.toLowerCase() === 'unclear' ||
        cleaned.length < 2;

      if (unclear) {
        res.json({
          transcript: '',
          detectedLanguage: fallbackLang,
          unclearSpeech: true,
          note: 'Could not hear clear speech in the recording. Please try speaking closer to the microphone or type your question.',
        });
        return;
      }

      const detectedLanguage = detectScriptLanguage(cleaned, fallbackLang);
      res.json({
        transcript: cleaned,
        detectedLanguage,
        unclearSpeech: false,
      });
    } catch (err: unknown) {
      handleGeminiRouteError(err, res);
    }
  });

  // Step B: Natural Neural Text-to-Speech (EN / KN / HI) via Gemini 3.8 Flash Lite TTS
  app.post('/api/tutor-tts', async (req: Request, res: Response) => {
    try {
      const { text, language } = req.body as {
        text?: string;
        language?: string;
      };

      if (typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({
          error: 'No explanation text provided for speech synthesis.',
          code: 'MISSING_TEXT',
        });
        return;
      }

      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error: 'Natural neural voice requires GEMINI_API_KEY in server Secrets.',
          code: 'API_KEY_NOT_CONFIGURED',
        });
        return;
      }

      const targetLangCode: 'en' | 'kn' | 'hi' =
        language === 'kn' || language === 'hi' ? language : 'en';
      const speechText = prepareTextForNaturalSpeech(text, targetLangCode);

      if (!speechText) {
        res.status(400).json({
          error: 'Explanation text could not be prepared for speech.',
          code: 'EMPTY_SPEECH_TEXT',
        });
        return;
      }

      const voiceStyleByLanguage: Record<'en' | 'kn' | 'hi', string> = {
        en: 'Warm, patient, friendly, conversational school Physics teacher speaking clearly in natural English with gentle pauses and clear pronunciation of scientific terms.',
        kn: 'Warm, patient, friendly, conversational school Physics teacher speaking fluent natural Kannada (ಕನ್ನಡ) with clear pronunciation, smooth sentence rhythm, and gentle pauses.',
        hi: 'Warm, patient, friendly, conversational school Physics teacher speaking fluent natural Hindi (हिन्दी) with clear pronunciation, smooth sentence rhythm, and gentle pauses.',
      };

      const selectedVoiceName = 'Kore';
      const ttsClientV1Beta = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        apiVersion: 'v1beta',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const ttsAttempts: Array<{
        client: GoogleGenAI;
        model: string;
        includeSpeechMeta: boolean;
        includeSpeechConfig: boolean;
      }> = [
        {
          client: ttsClientV1Beta,
          model: 'gemini-3.8-flash-lite-tts',
          includeSpeechMeta: true,
          includeSpeechConfig: true,
        },
        {
          client: ttsClientV1Beta,
          model: 'gemini-3.8-flash-lite-tts',
          includeSpeechMeta: false,
          includeSpeechConfig: true,
        },
        {
          client: ttsClientV1Beta,
          model: 'gemini-3.8-flash-tts',
          includeSpeechMeta: false,
          includeSpeechConfig: true,
        },
      ];

      let base64Audio: string | undefined;
      let returnedMime = 'audio/wav';
      let lastTtsErr: unknown;

      for (let i = 0; i < ttsAttempts.length; i++) {
        const attempt = ttsAttempts[i];
        try {
          const textPart = attempt.includeSpeechMeta
            ? {
                text: speechText,
                speechMetadata: {
                  style: voiceStyleByLanguage[targetLangCode],
                },
              }
            : {
                text: speechText,
              };

          const ttsConfig: Record<string, unknown> = {
            responseModalities: ['AUDIO'],
          };
          if (attempt.includeSpeechConfig) {
            ttsConfig.speechConfig = {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoiceName },
              },
            };
          }

          const ttsResponse = await withTimeout(
            attempt.client.models.generateContent({
              model: attempt.model,
              contents: [{ role: 'user', parts: [textPart] }],
              config: ttsConfig,
            }),
            12000,
            `Gemini TTS (${attempt.model})`
          );

          const inlinePart = ttsResponse.candidates?.[0]?.content?.parts?.find(
            (p) => Boolean(p?.inlineData?.data)
          )?.inlineData;

          if (inlinePart?.data) {
            base64Audio = inlinePart.data;
            returnedMime = inlinePart.mimeType || 'audio/wav';
            break;
          }
        } catch (err) {
          lastTtsErr = err;
          if (i === ttsAttempts.length - 1) throw err;
        }
      }

      if (!base64Audio) {
        if (lastTtsErr) throw lastTtsErr;
        res.status(502).json({
          error: 'Neural voice generator did not return playable audio.',
          code: 'EMPTY_AUDIO_RESPONSE',
        });
        return;
      }

      // Unary Gemini 3.8 TTS returns a complete WAV file (RIFF header). Verify RIFF signature defensively.
      const rawBuffer = Buffer.from(base64Audio, 'base64');
      const isRiffWav =
        rawBuffer.length >= 12 && rawBuffer.subarray(0, 4).toString('ascii') === 'RIFF';

      const finalBuffer =
        !isRiffWav && (returnedMime.includes('l16') || returnedMime.includes('pcm'))
          ? Buffer.concat([buildPcmWavHeader(rawBuffer.length, 24000), rawBuffer])
          : rawBuffer;

      const finalMime =
        isRiffWav || returnedMime.includes('l16') || returnedMime.includes('pcm')
          ? 'audio/wav'
          : returnedMime;

      res.json({
        audioBase64: finalBuffer.toString('base64'),
        mimeType: finalMime,
        language: targetLangCode,
        voiceName: selectedVoiceName,
        provider: 'gemini_tts',
      });
    } catch (err: unknown) {
      handleGeminiRouteError(err, res);
    }
  });

  interface PreparedTutorPrompt {
    targetLangCode: 'en' | 'kn' | 'hi';
    targetLanguageName: string;
    activeEngineId: string;
    hasAudio: boolean;
    hasText: boolean;
    textQuestion?: string;
    normalizedAudioMime: string | null;
    audioBase64?: string;
    systemInstruction: string;
    promptText: string;
  }

  function buildPreparedTutorPrompt(
    body: Record<string, unknown>,
    streamingMode: boolean
  ): { errorStatus?: number; errorCode?: string; errorMessage?: string; prepared?: PreparedTutorPrompt } {
    const {
      audioBase64,
      audioMimeType,
      textQuestion,
      language,
      forceAlternativeStrategy,
      requestedStyle,
      studentClass,
      chapterMeta,
      experimentMeta,
      conversationHistory,
      selectedComponent,
      componentExplanation,
      parameters,
      telemetry,
      textbookContext,
      sessionContext,
    } = body as {
      audioBase64?: string;
      audioMimeType?: string;
      textQuestion?: string;
      language?: string;
      forceAlternativeStrategy?: boolean;
      requestedStyle?: string;
      studentClass?: number;
      chapterMeta?: { chapterNumber?: number; chapterTitle?: string } | null;
      experimentMeta?: {
        id?: string;
        title?: string;
        simulationEngineId?: string | null;
        relevantConcept?: string;
        scientificExplanation?: string;
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
      conversationHistory?: Array<{ role?: string; text?: string; strategy?: string }>;
      selectedComponent?: {
        id?: string;
        name?: string;
        identification?: string;
        currentState?: string;
      } | null;
      componentExplanation?: Record<string, unknown> | null;
      parameters?: Record<string, unknown>;
      telemetry?: Record<string, unknown>;
      textbookContext?: Record<string, unknown> | null;
      sessionContext?: {
        currentExperiment?: string;
        strategiesAttempted?: string[];
      };
    };

    const hasAudio = typeof audioBase64 === 'string' && audioBase64.trim().length > 0;
    const hasText = typeof textQuestion === 'string' && textQuestion.trim().length > 0;

    if (!hasAudio && !hasText) {
      return {
        errorStatus: 400,
        errorCode: 'MISSING_QUESTION',
        errorMessage: 'Please record a voice question or type a question before sending.',
      };
    }

    let normalizedAudioMime: string | null = null;
    if (hasAudio) {
      if (audioBase64!.trim().length < 48) {
        return {
          errorStatus: 400,
          errorCode: 'EMPTY_AUDIO',
          errorMessage: 'The recorded audio clip was empty. Please speak clearly and try again.',
        };
      }
      if (audioBase64!.length > MAX_BASE64_BYTES) {
        return {
          errorStatus: 413,
          errorCode: 'AUDIO_TOO_LARGE',
          errorMessage: 'The audio recording is too long. Please ask a shorter question.',
        };
      }
      normalizedAudioMime = normalizeAudioMimeType(audioMimeType);
      if (!normalizedAudioMime) {
        return {
          errorStatus: 400,
          errorCode: 'UNSUPPORTED_AUDIO_FORMAT',
          errorMessage: 'Unsupported recorded audio format. Please try recording again or type your question.',
        };
      }
    }

    const targetLangCode: 'en' | 'kn' | 'hi' =
      language === 'kn' || language === 'hi' ? language : 'en';
    const targetLanguageName = getLanguageDisplayName(targetLangCode);
    const strategiesAttempted = Array.isArray(sessionContext?.strategiesAttempted)
      ? sessionContext.strategiesAttempted
      : [];
    const activeEngineId = experimentMeta?.simulationEngineId || 'bar_magnet';
    const recentHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-4).map((m) => ({
          role: m.role === 'student' ? 'S' : 'T',
          text: sanitizeStudentPlainText(m.text).slice(0, 220),
        }))
      : [];

    const styleDirectiveMap: Record<string, string> = {
      simpler: 'Explain in simple everyday language for younger students; 2-3 short sentences.',
      step_by_step: 'Walk through the reasoning in 3-4 clear numbered steps.',
      real_life_example: 'Center your answer on one relatable everyday example; 2-4 sentences.',
      analogy: 'Use one vivid physical analogy; 2-4 sentences.',
      formula: 'State the formula in plain words, name each variable + SI unit, and explain proportional effects.',
      numerical: 'Show one quick, solved numerical example using realistic values from this lab.',
      component: 'Focus directly on the selected component, its current live state, and its role here.',
      detailed: 'Give a crisp 4-5 sentence scientific explanation linking physical laws and live parameters.',
      repeat: 'Recap the core idea warmly in fresh phrasing (2-3 sentences).',
    };

    const effectiveClass =
      typeof studentClass === 'number' && studentClass >= 6 && studentClass <= 10 ? studentClass : 7;
    const lengthTarget =
      requestedStyle === 'detailed' || requestedStyle === 'step_by_step' || requestedStyle === 'numerical'
        ? '4-6 concise sentences'
        : '2-4 warm, clear sentences';
    const gradeRule =
      effectiveClass <= 7
        ? `Class ${effectiveClass} (11-13y): visual intuition & everyday examples, avoid dense algebra.`
        : effectiveClass === 8
          ? `Class 8 (13-14y): link observation to physical laws and SI units.`
          : `Class ${effectiveClass} (14-16y): include NCERT laws, formulas, SI units, and rigor.`;

    const sliderSpec =
      activeEngineId === 'bar_magnet'
        ? `Allowed alternative_simulation.simulation_id: ${ADAPTIVE_SIMULATION_IDS.join(', ')}. Optional parameter_adjustments: strength(0.3..2.4), magnet_angle_deg(0..360), compass_count(1..7), show_field_lines, show_vector_grid, mode("2d"|"3d").`
        : activeEngineId === 'dynamic_generated'
          ? `Keep alternative_simulation.simulation_id="bar_magnet_explorer". Refer directly to the parameters, equations, units, components, and simplified-model notes listed in the Generated Experiment Spec and live Telemetry above (never instruct sliders from unrelated labs).`
          : `Keep alternative_simulation.simulation_id="bar_magnet_explorer". Optional ${activeEngineId} adjustment bounds: electric_circuit_lab[voltage_v 1.5..12, resistance_1 2..30, switch_closed], optics_ray_lab[incidence_deg 10..75, object_distance_cm 8..60, focal_length_cm 10..28], heat_transfer_lab[heater_temp_c 30..100], sound_wave_lab[frequency_hz 120..880, amplitude_pct 20..100].`;

    const systemInstruction = `You are PHYSIX AI, a warm, friendly personal Physics teacher beside a school student's lab bench.
- Language: fluent, natural ${targetLanguageName}. Never use stiff openers ("Greetings", "As an AI"), HTML, markdown (**bold**, \`code\`, bullets), or raw formatting.
- Pedagogy: ${gradeRule} Length: ${lengthTarget} so it is fast to read and pleasant to hear via TTS.
- Stay grounded strictly in open lab (${activeEngineId})${selectedComponent?.id ? ` and selected component "${selectedComponent.name || selectedComponent.id}"` : ''}.
- Allowed teaching_strategy: simpler_explanation, step_by_step, real_world_analogy, numerical_example, visual_explanation, detailed_scientific, alternative_experiment.${
      forceAlternativeStrategy && strategiesAttempted.length > 0
        ? ` Pick a fresh strategy different from: ${strategiesAttempted.join(', ')}.`
        : ''
    }`;

    const dynMeta = (experimentMeta as {
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
    } | null)?.dynamicExperimentMeta;

    const contextLines = [
      `Lab: ${experimentMeta?.title || 'Bar Magnet Explorer'} (engine: ${activeEngineId}, Class ${effectiveClass}${chapterMeta?.chapterNumber ? `, Ch.${chapterMeta.chapterNumber}` : ''})`,
      `Concept: ${experimentMeta?.relevantConcept || 'Dipole magnetic field'}${experimentMeta?.scientificExplanation ? ` — ${experimentMeta.scientificExplanation.slice(0, 220)}` : ''}`,
      dynMeta
        ? `Generated Experiment Spec: template=${dynMeta.templateId}; objective=${sanitizeStudentPlainText(dynMeta.educationalObjective || '').slice(0, 180)}; equations=${(dynMeta.equations || []).slice(0, 3).join('; ')}; parts=${(dynMeta.components || []).slice(0, 6).join(', ')}; steps=${(dynMeta.procedureSteps || []).slice(0, 3).join(' | ')}${dynMeta.isSimplifiedModel ? `; limitationNote=${dynMeta.limitationNote}` : ''}`
        : '',
      selectedComponent?.id
        ? `Selected Component: ${selectedComponent.name || selectedComponent.id} (${selectedComponent.currentState || selectedComponent.identification || ''})`
        : 'Selected Component: none',
      componentExplanation
        ? `Component Note: ${String((componentExplanation as Record<string, unknown>).definition || '').slice(0, 160)}`
        : '',
      `Parameters: ${JSON.stringify(parameters || {}).slice(0, 360)}`,
      `Telemetry: ${JSON.stringify(telemetry || {}).slice(0, 260)}`,
      textbookContext ? `Textbook: ${JSON.stringify(textbookContext).slice(0, 260)}` : '',
      recentHistory.length > 0 ? `History: ${JSON.stringify(recentHistory)}` : '',
      requestedStyle && styleDirectiveMap[requestedStyle]
        ? `Style Directive: ${styleDirectiveMap[requestedStyle]}`
        : '',
      hasAudio
        ? 'Student asked via attached voice clip. Understand EN/KN/HI audio and reply cleanly.'
        : `Student Question: "${textQuestion!.trim()}"`,
      hasAudio && hasText ? `Typed context: "${textQuestion!.trim()}"` : '',
      sliderSpec,
    ]
      .filter(Boolean)
      .join('\n');

    const promptText = streamingMode
      ? `${contextLines}

OUTPUT FORMAT (STRICT — DO NOT USE MARKDOWN OR CODE FENCES):
First, write ONLY the warm conversational explanation directly in ${targetLanguageName} (${lengthTarget}, plain prose with natural commas and periods).
Immediately after the explanation, write a newline containing exactly:
<<<META>>>
Then output a single compact valid JSON object with keys:
{"student_question":"...","detected_language":"${targetLanguageName}","needs_language_clarification":false,"misunderstood_concept":"...","why_previous_was_hard":"...","difficulty_level":"basic","teaching_strategy":"visual_explanation","alternative_experiment_note":"...","alternative_simulation":{"simulation_id":"bar_magnet_explorer","visualization_mode":"2D","parameters":{"show_compass":true,"show_field_lines":true,"show_direction_arrows":true,"show_vector_grid":false,"compass_count":1,"highlight_intersection_test":false}},"parameter_adjustments":{"apply_adjustment":false},"follow_up_question":"..."}`
      : contextLines;

    return {
      prepared: {
        targetLangCode,
        targetLanguageName,
        activeEngineId,
        hasAudio,
        hasText,
        textQuestion,
        normalizedAudioMime,
        audioBase64,
        systemInstruction,
        promptText,
      },
    };
  }

  function finalizeTutorResponseObject(
    parsed: Record<string, unknown>,
    explanationOverride: string | null,
    prepared: PreparedTutorPrompt
  ) {
    const allowedStrategies = new Set([
      'simpler_explanation',
      'step_by_step',
      'real_world_analogy',
      'numerical_example',
      'visual_explanation',
      'detailed_scientific',
      'alternative_experiment',
    ]);

    const rawStrategy = String(parsed.teaching_strategy || 'visual_explanation');
    const teachingStrategy = allowedStrategies.has(rawStrategy)
      ? rawStrategy
      : 'visual_explanation';

    const rawDiff = String(parsed.difficulty_level || 'basic');
    const difficultyLevel =
      rawDiff === 'intermediate' || rawDiff === 'advanced' ? rawDiff : 'basic';

    const validatedSim = resolveAdaptiveSimulation(
      (parsed.alternative_simulation || {}) as Record<string, unknown>
    );
    const parameterAdjustments = sanitizeTutorParameterSuggestion(
      parsed.parameter_adjustments,
      prepared.activeEngineId
    );
    const finalExplanation = sanitizeStudentPlainText(
      explanationOverride ?? parsed.explanation ?? ''
    );
    const spokenSummary =
      sanitizeStudentPlainText(parsed.spoken_summary) || finalExplanation;

    return {
      student_question:
        sanitizeStudentPlainText(parsed.student_question) ||
        sanitizeStudentPlainText(prepared.textQuestion) ||
        'Physics question',
      detected_language:
        sanitizeStudentPlainText(parsed.detected_language) || prepared.targetLanguageName,
      needs_language_clarification: Boolean(parsed.needs_language_clarification),
      clarification_message: parsed.clarification_message
        ? sanitizeStudentPlainText(parsed.clarification_message)
        : undefined,
      misunderstood_concept: sanitizeStudentPlainText(parsed.misunderstood_concept),
      why_previous_was_hard: sanitizeStudentPlainText(parsed.why_previous_was_hard),
      difficulty_level: difficultyLevel,
      teaching_strategy: teachingStrategy,
      response_language: prepared.targetLangCode,
      explanation: finalExplanation,
      alternative_experiment_note: sanitizeStudentPlainText(
        parsed.alternative_experiment_note
      ),
      alternative_simulation: validatedSim,
      parameter_adjustments: parameterAdjustments,
      follow_up_question: sanitizeStudentPlainText(parsed.follow_up_question),
      spoken_summary: spokenSummary,
      answeredAt: new Date().toISOString(),
    };
  }

  // Step C1: Real SSE Streaming Conversational Physics Tutor (fast TTFT via generateContentStream)
  app.post('/api/tutor-ask-stream', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini AI tutor is unavailable because GEMINI_API_KEY is missing. Configure GEMINI_API_KEY in Settings > Secrets.',
        code: 'API_KEY_NOT_CONFIGURED',
      });
      return;
    }

    const prepResult = buildPreparedTutorPrompt(req.body as Record<string, unknown>, true);
    if (!prepResult.prepared) {
      res.status(prepResult.errorStatus || 400).json({
        error: prepResult.errorMessage || 'Invalid tutor request.',
        code: prepResult.errorCode || 'INVALID_REQUEST',
      });
      return;
    }

    const prepared = prepResult.prepared;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let clientClosed = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientClosed = true;
      }
    });

    const writeSseEvent = (event: string, data: unknown) => {
      if (clientClosed || res.writableEnded) return;
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    if (prepared.hasAudio && prepared.normalizedAudioMime) {
      parts.push({
        inlineData: {
          mimeType: prepared.normalizedAudioMime,
          data: prepared.audioBase64!.trim(),
        },
      });
    }
    parts.push({ text: prepared.promptText });

    const DELIM = '<<<META>>>';
    const streamAttempts = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
    let lastErr: unknown;
    let completed = false;

    for (let attemptIdx = 0; attemptIdx < streamAttempts.length; attemptIdx++) {
      if (clientClosed) break;
      const model = streamAttempts[attemptIdx];
      let fullText = '';
      let emittedLength = 0;
      let delimReached = false;

      try {
        const streamIter = await withTimeout(
          ai.models.generateContentStream({
            model,
            contents: { parts },
            config: {
              systemInstruction: prepared.systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          }),
          14000,
          `Gemini stream init (${model})`
        );

        for await (const chunk of streamIter) {
          if (clientClosed) break;
          const piece = chunk.text || '';
          if (!piece) continue;
          fullText += piece;

          if (!delimReached) {
            const delimIdx = fullText.indexOf(DELIM);
            if (delimIdx !== -1) {
              delimReached = true;
              const remainingClean = fullText
                .slice(emittedLength, delimIdx)
                .replace(/\*\*|\*/g, '')
                .replace(/`/g, '')
                .replace(/\s+$/, '');
              if (remainingClean.length > 0) {
                writeSseEvent('delta', { text: remainingClean });
              }
              emittedLength = delimIdx;
            } else {
              // Hold back trailing characters that could be the prefix of <<<META>>>
              const safeUpTo = Math.max(emittedLength, fullText.length - (DELIM.length + 2));
              if (safeUpTo > emittedLength) {
                const safeDelta = fullText
                  .slice(emittedLength, safeUpTo)
                  .replace(/\*\*|\*/g, '')
                  .replace(/`/g, '');
                if (safeDelta.length > 0) {
                  writeSseEvent('delta', { text: safeDelta });
                }
                emittedLength = safeUpTo;
              }
            }
          }
        }

        if (clientClosed) {
          if (!res.writableEnded) res.end();
          return;
        }

        const delimIdx = fullText.indexOf(DELIM);
        let explanationRaw = fullText;
        let metaParsed: Record<string, unknown> = {};

        if (delimIdx !== -1) {
          explanationRaw = fullText.slice(0, delimIdx).trim();
          let metaStr = fullText.slice(delimIdx + DELIM.length).trim();
          metaStr = metaStr.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
          const firstBrace = metaStr.indexOf('{');
          const lastBrace = metaStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            try {
              metaParsed = JSON.parse(metaStr.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
            } catch {
              metaParsed = {};
            }
          }
        } else if (emittedLength < fullText.length) {
          const tail = fullText
            .slice(emittedLength)
            .replace(/\*\*|\*/g, '')
            .replace(/`/g, '');
          if (tail.length > 0) {
            writeSseEvent('delta', { text: tail });
          }
        }

        const finalPayload = finalizeTutorResponseObject(metaParsed, explanationRaw, prepared);
        if (!finalPayload.explanation) {
          throw new Error('Empty explanation streamed from model.');
        }

        writeSseEvent('done', finalPayload);
        completed = true;
        break;
      } catch (err: unknown) {
        lastErr = err;
        // Retry fallback model only if we haven't streamed user-visible explanation text yet
        if (emittedLength > 0 || attemptIdx === streamAttempts.length - 1) {
          break;
        }
      }
    }

    if (!completed && !clientClosed) {
      const errObj = lastErr as { message?: string; code?: string };
      writeSseEvent('error', {
        error: extractReadableErrorMessage(
          errObj?.message || 'Unable to stream response from PHYSIX AI right now.'
        ),
        code: errObj?.code || 'STREAM_ERROR',
      });
    }

    if (!res.writableEnded) {
      res.end();
    }
  });

  // Step C2: Context-Aware Multilingual Conversational Physics Tutor (Unary JSON)
  app.post('/api/tutor-ask', async (req: Request, res: Response) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini AI tutor is unavailable because GEMINI_API_KEY is missing. Configure GEMINI_API_KEY in Settings > Secrets.',
          code: 'API_KEY_NOT_CONFIGURED',
        });
        return;
      }

      const prepResult = buildPreparedTutorPrompt(req.body as Record<string, unknown>, false);
      if (!prepResult.prepared) {
        res.status(prepResult.errorStatus || 400).json({
          error: prepResult.errorMessage || 'Invalid tutor request.',
          code: prepResult.errorCode || 'INVALID_REQUEST',
        });
        return;
      }
      const prepared = prepResult.prepared;

      const tutorSchema = {
        type: Type.OBJECT,
        properties: {
          audio_unintelligible: { type: Type.BOOLEAN },
          student_question: { type: Type.STRING },
          detected_language: { type: Type.STRING },
          needs_language_clarification: { type: Type.BOOLEAN },
          clarification_message: { type: Type.STRING },
          misunderstood_concept: { type: Type.STRING },
          why_previous_was_hard: { type: Type.STRING },
          difficulty_level: { type: Type.STRING },
          teaching_strategy: { type: Type.STRING },
          explanation: { type: Type.STRING },
          alternative_experiment_note: { type: Type.STRING },
          alternative_simulation: {
            type: Type.OBJECT,
            properties: {
              simulation_id: { type: Type.STRING },
              visualization_mode: { type: Type.STRING },
              parameters: {
                type: Type.OBJECT,
                properties: {
                  show_compass: { type: Type.BOOLEAN },
                  show_field_lines: { type: Type.BOOLEAN },
                  show_direction_arrows: { type: Type.BOOLEAN },
                  show_vector_grid: { type: Type.BOOLEAN },
                  compass_count: { type: Type.INTEGER },
                  highlight_intersection_test: { type: Type.BOOLEAN },
                },
                required: [
                  'show_compass',
                  'show_field_lines',
                  'show_direction_arrows',
                  'show_vector_grid',
                  'compass_count',
                  'highlight_intersection_test',
                ],
              },
            },
            required: ['simulation_id', 'visualization_mode', 'parameters'],
          },
          parameter_adjustments: {
            type: Type.OBJECT,
            properties: {
              apply_adjustment: { type: Type.BOOLEAN },
              strength: { type: Type.NUMBER },
              magnet_angle_deg: { type: Type.INTEGER },
              magnet_pitch_deg: { type: Type.INTEGER },
              show_field_lines: { type: Type.BOOLEAN },
              show_vector_grid: { type: Type.BOOLEAN },
              show_compass: { type: Type.BOOLEAN },
              compass_count: { type: Type.INTEGER },
              mode: { type: Type.STRING },
              voltage_v: { type: Type.NUMBER },
              resistance_1: { type: Type.INTEGER },
              switch_closed: { type: Type.BOOLEAN },
              incidence_deg: { type: Type.INTEGER },
              object_distance_cm: { type: Type.INTEGER },
              focal_length_cm: { type: Type.INTEGER },
              heater_temp_c: { type: Type.INTEGER },
              frequency_hz: { type: Type.INTEGER },
              amplitude_pct: { type: Type.INTEGER },
              summary_label: { type: Type.STRING },
            },
            required: ['apply_adjustment'],
          },
          follow_up_question: { type: Type.STRING },
        },
        required: [
          'audio_unintelligible',
          'student_question',
          'detected_language',
          'needs_language_clarification',
          'misunderstood_concept',
          'why_previous_was_hard',
          'difficulty_level',
          'teaching_strategy',
          'explanation',
          'alternative_experiment_note',
          'alternative_simulation',
          'parameter_adjustments',
          'follow_up_question',
        ],
      };

      const parts: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [];
      if (prepared.hasAudio && prepared.normalizedAudioMime) {
        parts.push({
          inlineData: {
            mimeType: prepared.normalizedAudioMime,
            data: prepared.audioBase64!.trim(),
          },
        });
      }
      parts.push({ text: `${prepared.systemInstruction}\n\n${prepared.promptText}` });

      const response = await generateJsonWithModelFallback(ai, parts, tutorSchema, 15000);

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({
          error: 'PHYSIX AI tutor returned an empty response. Please try asking again.',
          code: 'EMPTY_MODEL_RESPONSE',
        });
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        res.status(502).json({
          error: 'Received malformed structured tutor output. Please try asking again.',
          code: 'INVALID_AI_RESPONSE',
        });
        return;
      }

      if (parsed.audio_unintelligible && !prepared.hasText) {
        res.status(422).json({
          error:
            'Could not clearly hear a question in your recording. Please speak closer to the microphone or type your question.',
          code: 'UNINTELLIGIBLE_AUDIO',
        });
        return;
      }

      res.json(finalizeTutorResponseObject(parsed, null, prepared));
    } catch (err: unknown) {
      handleGeminiRouteError(err, res);
    }
  });

  app.post('/api/companion-react', async (req: Request, res: Response) => {
    const body = (req.body || {}) as {
      eventType?: string;
      language?: string;
      studentName?: string;
      studentClass?: number;
      experimentTitle?: string;
      engineId?: string;
      selectedComponentName?: string;
      parameterSummary?: string;
      extraContext?: string;
    };

    const lang = body.language === 'kn' || body.language === 'hi' ? body.language : 'en';
    const eventType = sanitizeStudentPlainText(body.eventType || 'parameter_changed') || 'parameter_changed';
    const studentName = sanitizeStudentPlainText(body.studentName || '');
    const experimentTitle = sanitizeStudentPlainText(body.experimentTitle || 'Physics Lab');
    const componentName = sanitizeStudentPlainText(body.selectedComponentName || '');
    const paramSummary = sanitizeStudentPlainText(body.parameterSummary || '');
    const extraContext = sanitizeStudentPlainText(body.extraContext || '');
    const studentClass =
      typeof body.studentClass === 'number' && body.studentClass >= 6 && body.studentClass <= 10
        ? body.studentClass
        : 8;

    const buildFallback = (): {
      speechText: string;
      emotion: string;
      quickPromptSuggestion: string;
      source: 'fallback';
    } => {
      const greetingName = studentName ? `${studentName}, ` : '';
      if (lang === 'kn') {
        switch (eventType) {
          case 'dashboard_welcome':
          case 'returning_user':
            return {
              speechText: `ನಮಸ್ಕಾರ ${studentName || 'ಸ್ನೇಹಿತರೆ'}! ಇಂದು ${studentClass}ನೇ ತರಗತಿಯ ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗಶಾಲೆಯಲ್ಲಿ ಹೊಸ ಪರಿಕಲ್ಪನೆಯನ್ನು ಕಲಿಯೋಣವೇ?`,
              emotion: 'excited',
              quickPromptSuggestion: 'ಇಂದಿನ ಪ್ರಯೋಗವನ್ನು ಸೂಚಿಸಿ',
              source: 'fallback',
            };
          case 'experiment_intro':
            return {
              speechText: `${greetingName}"${experimentTitle}" ಪ್ರಯೋಗಕ್ಕೆ ಸ್ವಾಗತ! ನಿಯತಾಂಕಗಳನ್ನು ಬದಲಾಯಿಸಿ ಏನಾಗುತ್ತದೆ ನೋಡಿ.`,
              emotion: 'excited',
              quickPromptSuggestion: 'ಈ ಪ್ರಯೋಗದಲ್ಲಿ ಏನು ಗಮನಿಸಬೇಕು?',
              source: 'fallback',
            };
          case 'component_inspected':
            return {
              speechText: `ಚೆನ್ನಾಗಿದೆ! ನೀವು "${componentName || 'ಈ ಭಾಗ'}" ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ಇದು ಪ್ರಯೋಗದಲ್ಲಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಗಮನಿಸಿ.`,
              emotion: 'speaking',
              quickPromptSuggestion: `${componentName || 'ಈ ಭಾಗ'} ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?`,
              source: 'fallback',
            };
          case 'quiz_correct':
            return {
              speechText: `ಅದ್ಭುತ ${greetingName}ಸರಿಯಾದ ಉತ್ತರ! ನಿಮ್ಮ ಭೌತಶಾಸ್ತ್ರದ ತಿಳುವಳಿಕೆ ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ.`,
              emotion: 'celebrating',
              quickPromptSuggestion: 'ಮುಂದಿನ ಸವಾಲು ಕೊಡಿ',
              source: 'fallback',
            };
          case 'quiz_wrong':
            return {
              speechText: `ಚಿಂತಿಸಬೇಡಿ ${greetingName}ಸಿಮ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ—ನೀವು ಖಂಡಿತ ಕಂಡುಹಿಡಿಯುತ್ತೀರಿ!`,
              emotion: 'encouraging',
              quickPromptSuggestion: 'ಈ ಪ್ರಶ್ನೆಗೆ ಸುಳಿವು ಕೊಡಿ',
              source: 'fallback',
            };
          case 'experiment_completed':
          case 'badge_unlocked':
            return {
              speechText: `ಶಭಾಷ್ ${greetingName}ನೀವು ಈ ಪ್ರಯೋಗವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿ ಹೊಸ XP ಗಳಿಸಿದ್ದೀರಿ!`,
              emotion: 'celebrating',
              quickPromptSuggestion: 'ನನ್ನ ಮುಂದಿನ ಪ್ರಯೋಗ ಯಾವುದು?',
              source: 'fallback',
            };
          default:
            return {
              speechText: `ನೋಡಿ! ${paramSummary ? `${paramSummary} ಬದಲಾವಣೆಯಿಂದ ` : ''}ಸಿಮ್ಯುಲೇಶನ್‌ನಲ್ಲಿ ಹೇಗೆ ಪರಿಣಾಮ ಬೀರುತ್ತಿದೆ ಗಮನಿಸಿ.`,
              emotion: 'speaking',
              quickPromptSuggestion: 'ಈ ಬದಲಾವಣೆ ಏಕೆ ಆಯಿತು?',
              source: 'fallback',
            };
        }
      }

      if (lang === 'hi') {
        switch (eventType) {
          case 'dashboard_welcome':
          case 'returning_user':
            return {
              speechText: `नमस्ते ${studentName || 'दोस्त'}! आज कक्षा ${studentClass} की भौतिकी प्रयोगशाला में नया प्रयोग शुरू करें?`,
              emotion: 'excited',
              quickPromptSuggestion: 'आज कौन-सा प्रयोग करूँ?',
              source: 'fallback',
            };
          case 'experiment_intro':
            return {
              speechText: `${greetingName}"${experimentTitle}" प्रयोग में आपका स्वागत है! स्लाइडर बदलकर देखें कि क्या होता है।`,
              emotion: 'excited',
              quickPromptSuggestion: 'इस प्रयोग में मुझे क्या देखना चाहिए?',
              source: 'fallback',
            };
          case 'component_inspected':
            return {
              speechText: `बढ़िया! आपने "${componentName || 'इस हिस्से'}" को चुना है। देखें कि यह प्रयोग में कैसे काम करता है।`,
              emotion: 'speaking',
              quickPromptSuggestion: `${componentName || 'यह भाग'} कैसे काम करता है?`,
              source: 'fallback',
            };
          case 'quiz_correct':
            return {
              speechText: `शाबाश ${greetingName}बिल्कुल सही जवाब! आपकी भौतिकी की समझ शानदार है।`,
              emotion: 'celebrating',
              quickPromptSuggestion: 'मुझे अगला प्रश्न दें',
              source: 'fallback',
            };
          case 'quiz_wrong':
            return {
              speechText: `कोई बात नहीं ${greetingName}सिमुलेशन को ध्यान से देखें और फिर प्रयास करें—आप कर सकते हैं!`,
              emotion: 'encouraging',
              quickPromptSuggestion: 'मुझे एक छोटा संकेत दें',
              source: 'fallback',
            };
          case 'experiment_completed':
          case 'badge_unlocked':
            return {
              speechText: `बधाई हो ${greetingName}आपने यह प्रयोग पूरा करके नया XP और बैज अर्जित किया है!`,
              emotion: 'celebrating',
              quickPromptSuggestion: 'आगे क्या सीखें?',
              source: 'fallback',
            };
          default:
            return {
              speechText: `ध्यान से देखें! ${paramSummary ? `${paramSummary} बदलने से ` : ''}सिमुलेशन में तुरंत क्या बदलाव आया है?`,
              emotion: 'speaking',
              quickPromptSuggestion: 'ऐसा क्यों हुआ?',
              source: 'fallback',
            };
        }
      }

      switch (eventType) {
        case 'dashboard_welcome':
        case 'returning_user':
          return {
            speechText: `Hey ${studentName || 'Explorer'}! Ready to test a Class ${studentClass} physics simulation together?`,
            emotion: 'excited',
            quickPromptSuggestion: 'Suggest a fun experiment for me',
            source: 'fallback',
          };
        case 'experiment_intro':
          return {
            speechText: `Welcome to ${experimentTitle}, ${studentName || 'explorer'}! Tweak the controls or tap any part on the canvas.`,
            emotion: 'excited',
            quickPromptSuggestion: 'What should I watch closely here?',
            source: 'fallback',
          };
        case 'component_inspected':
          return {
            speechText: `Great spot! Notice how ${componentName || 'this component'} shapes what happens in ${experimentTitle}.`,
            emotion: 'speaking',
            quickPromptSuggestion: `Why is ${componentName || 'this part'} important?`,
            source: 'fallback',
          };
        case 'quiz_correct':
          return {
            speechText: `Spot on, ${studentName || 'scientist'}! You connected the physics principle cleanly.`,
            emotion: 'celebrating',
            quickPromptSuggestion: 'Give me a deeper real-world example',
            source: 'fallback',
          };
        case 'quiz_wrong':
          return {
            speechText: `Almost there, ${studentName || 'explorer'}! Adjust the simulation once more and watch the cause and effect.`,
            emotion: 'encouraging',
            quickPromptSuggestion: 'Give me a quick hint',
            source: 'fallback',
          };
        case 'experiment_completed':
        case 'badge_unlocked':
          return {
            speechText: `Awesome work, ${studentName || 'scientist'}! You mastered ${experimentTitle} and earned lab XP.`,
            emotion: 'celebrating',
            quickPromptSuggestion: 'What experiment should I try next?',
            source: 'fallback',
          };
        default:
          return {
            speechText: `Look closely! ${paramSummary ? `With ${paramSummary}, watch ` : 'Watch '}how the physics system responds right away.`,
            emotion: 'speaking',
            quickPromptSuggestion: 'Explain why this changed',
            source: 'fallback',
          };
      }
    };

    const ai = getGeminiClient();
    if (!ai) {
      res.json(buildFallback());
      return;
    }

    try {
      const targetLang = getLanguageDisplayName(lang);
      const reactionSchema = {
        type: Type.OBJECT,
        properties: {
          speechText: {
            type: Type.STRING,
            description: `One or two concise, warm, spoken sentences (max 32 words) in ${targetLang} from Nova, an encouraging NCERT Class ${studentClass} physics companion.`,
          },
          emotion: {
            type: Type.STRING,
            description: 'One of: excited, speaking, encouraging, celebrating, thinking',
          },
          quickPromptSuggestion: {
            type: Type.STRING,
            description: `One short 3-7 word follow-up question in ${targetLang} a student can ask Nova.`,
          },
        },
        required: ['speechText', 'emotion', 'quickPromptSuggestion'],
      };

      const prompt = `You are Nova, a warm, curious, interactive science scholar companion for NCERT Class ${studentClass} Physics students.
Respond strictly in ${targetLang}. Keep speechText crisp (1-2 sentences, <= 30 words), playful yet scientifically accurate, and specific to the student's live lab action. Do NOT use markdown or emojis.

Event: ${eventType}
Student: ${studentName || 'Student'} (Class ${studentClass})
Experiment: ${experimentTitle}
Engine: ${sanitizeStudentPlainText(body.engineId || '')}
Selected component: ${componentName || 'None'}
Live parameters: ${paramSummary || 'Default values'}
Extra context: ${extraContext || 'None'}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: { parts: [{ text: prompt }] },
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: reactionSchema,
          },
        }),
        4800,
        'Companion reaction'
      );

      const raw = response.text;
      if (!raw) {
        res.json(buildFallback());
        return;
      }

      const parsed = JSON.parse(raw) as {
        speechText?: string;
        emotion?: string;
        quickPromptSuggestion?: string;
      };

      const allowedEmotions = new Set(['idle', 'thinking', 'speaking', 'excited', 'encouraging', 'celebrating']);
      const fallback = buildFallback();
      res.json({
        speechText: sanitizeStudentPlainText(parsed.speechText) || fallback.speechText,
        emotion: allowedEmotions.has(String(parsed.emotion)) ? parsed.emotion : fallback.emotion,
        quickPromptSuggestion:
          sanitizeStudentPlainText(parsed.quickPromptSuggestion) || fallback.quickPromptSuggestion,
        source: 'gemini',
      });
    } catch {
      res.json(buildFallback());
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PHYSIX AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PHYSIX AI server:', err);
  process.exit(1);
});
