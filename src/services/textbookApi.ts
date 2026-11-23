import type { LanguageCode, TextbookAnalysisResult } from '../types/physics';

export interface ServerHealthStatus {
  status: string;
  geminiConfigured: boolean;
}

export interface PreparedImagePayload {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  previewDataUrl: string;
  width: number;
  height: number;
  wasResized: boolean;
  fileSizeBytes: number;
}

export class TextbookApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'TextbookApiError';
    this.code = code;
    this.status = status;
  }
}

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export function isSupportedImageFile(file: File): boolean {
  if (SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return true;
  }
  const lowerName = file.name.toLowerCase();
  return (
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.webp')
  );
}

/**
 * Reads a textbook page photograph and preserves crisp detail (up to 2048px on longest edge)
 * so equations, subscripts, and diagram labels remain legible for Gemini vision analysis.
 */
export function prepareTextbookImage(file: File): Promise<PreparedImagePayload> {
  return new Promise((resolve, reject) => {
    if (!file || file.size === 0) {
      reject(new Error('The selected image file is empty. Please choose a valid textbook photograph.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Invalid or corrupted image file.'));
      };

      img.onload = () => {
        if (img.width <= 0 || img.height <= 0) {
          reject(new Error('Invalid image dimensions.'));
          return;
        }

        const maxDimension = 2048;
        const needsResize =
          img.width > maxDimension ||
          img.height > maxDimension ||
          file.size > 4.5 * 1024 * 1024;

        const targetMime: 'image/jpeg' | 'image/png' | 'image/webp' =
          file.type === 'image/png' && !needsResize
            ? 'image/png'
            : file.type === 'image/webp'
            ? 'image/webp'
            : 'image/jpeg';

        if (!needsResize) {
          const base64 = dataUrl.split(',')[1] || '';
          if (!base64) {
            reject(new Error('Unable to encode image data.'));
            return;
          }
          resolve({
            base64,
            mimeType: targetMime,
            previewDataUrl: dataUrl,
            width: img.width,
            height: img.height,
            wasResized: false,
            fileSizeBytes: file.size,
          });
          return;
        }

        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable for image optimization.'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const compressedDataUrl = canvas.toDataURL(targetMime, 0.9);
        const base64 = compressedDataUrl.split(',')[1] || '';
        const approxBytes = Math.round((base64.length * 3) / 4);

        resolve({
          base64,
          mimeType: targetMime,
          previewDataUrl: compressedDataUrl,
          width: targetWidth,
          height: targetHeight,
          wasResized: true,
          fileSizeBytes: approxBytes,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

export async function fetchServerHealth(): Promise<ServerHealthStatus> {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Unable to reach server health check.');
  }
  return (await response.json()) as ServerHealthStatus;
}

export function analyzeTextbookPage(
  payload: {
    imageBase64: string;
    mimeType: string;
    language: LanguageCode;
  },
  onUploadProgress?: (percent: number) => void
): Promise<TextbookAnalysisResult> {
  return new Promise((resolve, reject) => {
    if (!payload.imageBase64 || payload.imageBase64.trim().length < 32) {
      reject(
        new TextbookApiError(
          'Please select a valid textbook photograph before analyzing.',
          'MISSING_IMAGE',
          400
        )
      );
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/analyze-textbook');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 90000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onUploadProgress) {
        const pct = Math.min(100, Math.round((event.loaded / event.total) * 100));
        onUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          error?: string;
          code?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data as unknown as TextbookAnalysisResult);
        } else {
          reject(
            new TextbookApiError(
              data?.error || `Analysis failed with status ${xhr.status}.`,
              data?.code,
              xhr.status
            )
          );
        }
      } catch {
        reject(
          new TextbookApiError(
            'Received an invalid response from the textbook analysis server.',
            'INVALID_SERVER_RESPONSE',
            xhr.status
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new TextbookApiError(
          'Network error while connecting to the textbook analysis server. Check your connection and try again.',
          'NETWORK_ERROR'
        )
      );
    };

    xhr.ontimeout = () => {
      reject(
        new TextbookApiError(
          'Textbook analysis timed out. Please try again with a clear, well-lit image.',
          'REQUEST_TIMEOUT'
        )
      );
    };

    xhr.send(JSON.stringify(payload));
  });
}

export interface GenerateDynamicExperimentResponse {
  experiment: import('../types/dynamicExperiment').DynamicExperimentSpec;
  validationReport: {
    status: string;
    checksPassed: string[];
    warnings: string[];
    isSimplifiedModel: boolean;
    limitationNote?: string;
  };
}

export async function generateDynamicExperiment(payload: {
  analysisContext?: TextbookAnalysisResult | null;
  focusConcept?: Record<string, unknown>;
  imageBase64?: string;
  mimeType?: string;
  studentClass?: number;
  preferredTemplateId?: string;
  language: LanguageCode;
  ownerUid?: string;
}): Promise<GenerateDynamicExperimentResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 55000);
  try {
    const trimmedContext = payload.analysisContext
      ? {
          chapter: payload.analysisContext.chapter,
          main_topic: payload.analysisContext.main_topic,
          class_level: payload.analysisContext.class_level,
          summary: payload.analysisContext.summary,
          equations: payload.analysisContext.equations.slice(0, 6),
          detected_experiment: payload.analysisContext.detected_experiment,
        }
      : undefined;

    const response = await fetch('/api/generate-experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        ...payload,
        analysisContext: trimmedContext,
      }),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new TextbookApiError(
        'Received an invalid response from the experiment generator.',
        'INVALID_SERVER_RESPONSE',
        response.status
      );
    }

    if (!response.ok) {
      const errObj = data as { error?: string; code?: string };
      throw new TextbookApiError(
        errObj?.error || `Experiment generation failed (status ${response.status}).`,
        errObj?.code,
        response.status
      );
    }

    return data as GenerateDynamicExperimentResponse;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new TextbookApiError(
        'Dynamic experiment generation timed out. Please retry.',
        'REQUEST_TIMEOUT',
        504
      );
    }
    if (err instanceof TextbookApiError) throw err;
    throw new TextbookApiError(
      err instanceof Error ? err.message : 'Unable to generate experiment.',
      'GENERATION_FAILED'
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

