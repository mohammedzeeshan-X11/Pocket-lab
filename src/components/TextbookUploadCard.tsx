import React, { useRef, useState } from 'react';
import { Camera, Upload, RotateCw, Trash2, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import type { LanguageCode, TextbookAnalysisResult } from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import {
  analyzeTextbookPage,
  isSupportedImageFile,
  prepareTextbookImage,
  type PreparedImagePayload,
} from '../services/textbookApi';

interface TextbookUploadCardProps {
  language: LanguageCode;
  t: TranslationBundle;
  geminiConfigured: boolean | null;
  onAnalysisComplete: (
    result: TextbookAnalysisResult,
    fileName: string,
    previewUrl: string,
    rawImage?: { base64: string; mimeType: string }
  ) => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const TextbookUploadCard: React.FC<TextbookUploadCardProps> = ({
  language,
  t,
  geminiConfigured,
  onAnalysisComplete,
  fileInputRef: externalInputRef,
}) => {
  const internalFileRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const browseInputRef = externalInputRef ?? internalFileRef;
  const inFlightRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [prepared, setPrepared] = useState<PreparedImagePayload | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isPreparing, setIsPreparing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoNote, setInfoNote] = useState<string | null>(null);

  const handleSelectedFile = async (file: File | undefined) => {
    if (!file || inFlightRef.current) return;
    setErrorMsg(null);
    setInfoNote(null);

    if (file.size === 0) {
      setErrorMsg(t.upload.emptyUploadError);
      return;
    }

    if (!isSupportedImageFile(file)) {
      setErrorMsg(t.upload.unsupportedTypeError);
      return;
    }

    setIsPreparing(true);
    try {
      const payload = await prepareTextbookImage(file);
      setPrepared(payload);
      setFileName(file.name);
      if (payload.wasResized) {
        setInfoNote(t.upload.fileTooLargeWarning);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.upload.fileReadError;
      setErrorMsg(message);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (inFlightRef.current || isAnalyzing) return;
    const file = e.dataTransfer.files?.[0];
    void handleSelectedFile(file);
  };

  const handleClear = () => {
    if (inFlightRef.current || isAnalyzing) return;
    setPrepared(null);
    setFileName('');
    setUploadProgress(0);
    setErrorMsg(null);
    setInfoNote(null);
    if (browseInputRef.current) browseInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (inFlightRef.current || isAnalyzing) return;
    if (!prepared) {
      setErrorMsg(t.upload.emptyUploadError);
      return;
    }

    inFlightRef.current = true;
    setErrorMsg(null);
    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      const result = await analyzeTextbookPage(
        {
          imageBase64: prepared.base64,
          mimeType: prepared.mimeType,
          language,
        },
        (pct) => setUploadProgress(pct)
      );
      onAnalysisComplete(result, fileName, prepared.previewDataUrl, {
        base64: prepared.base64,
        mimeType: prepared.mimeType,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to analyze textbook image.';
      setErrorMsg(msg);
    } finally {
      inFlightRef.current = false;
      setIsAnalyzing(false);
    }
  };

  const formattedSize = prepared
    ? prepared.fileSizeBytes >= 1024 * 1024
      ? `${(prepared.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(prepared.fileSizeBytes / 1024)} KB`
    : '';

  return (
    <section
      id="textbook-upload-section"
      aria-labelledby="upload-card-title"
      className="clay-card p-6 sm:p-8 flex flex-col justify-between"
    >
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <h2 id="upload-card-title" className="text-xl sm:text-2xl font-bold text-[#171A2F]">
            {t.upload.title}
          </h2>
          <span className="text-xs font-medium text-[#6F7487]">
            JPG · JPEG · PNG · WEBP
          </span>
        </div>
        <p className="text-sm text-[#6F7487] mb-5 leading-relaxed">
          {t.upload.subtitle}
        </p>

        {/* Hidden File Inputs */}
        <input
          ref={browseInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => void handleSelectedFile(e.target.files?.[0])}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => void handleSelectedFile(e.target.files?.[0])}
        />

        {/* Drop Zone or Preview */}
        {!prepared ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-3xl border-2 border-dashed transition-all duration-150 p-7 sm:p-9 text-center ${
              isDragging
                ? 'border-[#F49A3C] bg-[#FFF2E2]'
                : 'clay-inset border-[#E4D5C6] hover:border-[#F49A3C]/70'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl clay-icon-periwinkle flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>

            {isPreparing ? (
              <p className="text-sm font-semibold text-[#171A2F]">{t.upload.optimizingImage}</p>
            ) : (
              <>
                <p className="text-sm sm:text-base font-semibold text-[#171A2F] mb-1.5">
                  {t.upload.dropHint}
                </p>
                <p className="text-xs text-[#6F7487] mb-6">{t.upload.supportedFormats}</p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => browseInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full clay-btn-orange text-sm font-semibold cursor-pointer min-h-[44px]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t.upload.browseButton}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full clay-btn-soft text-sm font-semibold cursor-pointer min-h-[44px]"
                  >
                    <Camera className="w-4 h-4 text-[#49AD8B]" />
                    <span>{t.upload.cameraButton}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="rounded-3xl clay-inset overflow-hidden">
            <div className="relative bg-[#F9F2EA] flex items-center justify-center max-h-72 overflow-hidden">
              <img
                src={prepared.previewDataUrl}
                alt="Uploaded NCERT physics textbook preview"
                className="max-h-72 w-full object-contain"
              />
            </div>

            <div className="p-4 border-t border-[#EFE7DF] bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#171A2F] truncate max-w-[240px] sm:max-w-xs">
                  {fileName}
                </p>
                <p className="text-xs text-[#6F7487] font-mono-tabular">
                  {prepared.width} × {prepared.height} px · {formattedSize}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => browseInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl clay-btn-soft text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#F49A3C]" />
                  <span>{t.upload.replaceButton}</span>
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl clay-btn-soft text-xs font-semibold text-[#6F7487] hover:text-[#171A2F] disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.upload.removeButton}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Note / Resizing Feedback */}
        {infoNote && (
          <p className="mt-3 text-xs text-[#6F7487] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#49AD8B] shrink-0" />
            <span>{infoNote}</span>
          </p>
        )}

        {/* Error Display */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-4 p-3.5 rounded-2xl bg-[#FFF1EE] border border-[#F5C2B8] text-sm text-[#9A3424] flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload & AI Progress Bar */}
        {isAnalyzing && (
          <div className="mt-4 space-y-2 rounded-2xl clay-inset p-3.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171A2F]">
              <span>
                {uploadProgress < 100
                  ? `1/3 · ${t.upload.uploadingLabel}`
                  : `2/3 · ${t.upload.analyzingLabel}`}
              </span>
              <span className="font-mono-tabular text-[#F49A3C]">{uploadProgress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#EFE5DA] overflow-hidden shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFAC54] to-[#F49A3C] transition-all duration-200"
                style={{ width: `${Math.max(12, uploadProgress)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6F7487]">
              {uploadProgress < 100
                ? 'Sending compressed textbook image to Pocket Lab vision pipeline...'
                : 'Identifying physics concepts, apparatus, equations, and checking existing NCERT simulations...'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Row */}
      <div className="mt-6 pt-5 border-t border-[#EFE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-[#6F7487] leading-relaxed">
          {geminiConfigured === false
            ? t.upload.aiStatusMissingKey
            : t.upload.aiStatusReady}
        </p>

        <button
          type="button"
          disabled={!prepared || isAnalyzing || isPreparing}
          onClick={() => void handleAnalyze()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full clay-btn-teal text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAnalyzing ? t.upload.analyzingLabel : t.upload.analyzeButton}</span>
        </button>
      </div>
    </section>
  );
};
