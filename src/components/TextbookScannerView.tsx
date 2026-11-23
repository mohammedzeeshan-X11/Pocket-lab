import React, { useRef } from 'react';
import { ArrowLeft, Camera, FlaskConical, History } from 'lucide-react';
import type { LanguageCode, SavedStudySession, TextbookAnalysisResult } from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import { TextbookUploadCard } from './TextbookUploadCard';

interface TextbookScannerViewProps {
  language: LanguageCode;
  t: TranslationBundle;
  geminiConfigured: boolean | null;
  sessions: SavedStudySession[];
  onAnalysisComplete: (
    result: TextbookAnalysisResult,
    fileName: string,
    previewUrl: string,
    rawImage?: { base64: string; mimeType: string }
  ) => void;
  onOpenSession: (session: SavedStudySession) => void;
  onBackHome: () => void;
}

export const TextbookScannerView: React.FC<TextbookScannerViewProps> = ({
  language,
  t,
  geminiConfigured,
  sessions,
  onAnalysisComplete,
  onOpenSession,
  onBackHome,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Focused Page Header */}
      <header className="space-y-3">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C96D12]">
            <Camera className="w-4 h-4" />
            <span>Dedicated Textbook Scanner</span>
          </div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-[#171A2F] tracking-tight">
            {t.upload.title}
          </h1>
          <p className="text-sm text-[#6F7487] max-w-2xl">
            Upload a clear photo of any NCERT Physics page or diagram to extract key concepts,
            formulas, and launch a matching interactive simulation.
          </p>
        </div>
      </header>

      {/* Main Scanner Card */}
      <TextbookUploadCard
        language={language}
        t={t}
        geminiConfigured={geminiConfigured}
        onAnalysisComplete={onAnalysisComplete}
        fileInputRef={fileInputRef}
      />

      {/* Recent Scanned Pages (Only shown if user has past scans) */}
      {sessions.length > 0 && (
        <section className="space-y-3 pt-2 border-t border-[#EFE7DF]">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[#171A2F] inline-flex items-center gap-2">
              <History className="w-4 h-4 text-[#49AD8B]" />
              <span>Recent Scanned Pages</span>
            </h2>
            <span className="text-xs font-mono-tabular text-[#6F7487]">
              {sessions.length} saved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.slice(0, 6).map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onOpenSession(session)}
                className="text-left clay-card clay-card-interactive p-4 space-y-2 cursor-pointer"
              >
                <p className="text-xs font-semibold text-[#C96D12] truncate">
                  {session.analysis.chapter || 'NCERT Physics Scan'}
                </p>
                <p className="text-sm font-bold text-[#171A2F] line-clamp-2">
                  {session.analysis.concepts[0]?.name || session.fileName}
                </p>
                <div className="flex items-center justify-between text-xs text-[#6F7487] pt-1">
                  <span>{session.analysis.concepts.length} concepts</span>
                  <span className="inline-flex items-center gap-1 text-[#49AD8B] font-semibold">
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
