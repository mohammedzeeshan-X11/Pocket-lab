import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Compass,
  FlaskConical,
  Trash2,
  Upload,
} from 'lucide-react';
import type { SavedStudySession } from '../types/physics';
import type { DynamicExperimentSpec } from '../types/dynamicExperiment';
import type { TranslationBundle } from '../i18n/translations';

interface MyLearningViewProps {
  sessions: SavedStudySession[];
  savedDynamicExperiments?: DynamicExperimentSpec[];
  t: TranslationBundle;
  onOpenSession: (session: SavedStudySession) => void;
  onDeleteSession: (id: string) => void;
  onLaunchDynamicExperiment?: (spec: DynamicExperimentSpec) => void;
  onDeleteDynamicExperiment?: (id: string) => void;
  onOpenMagnetismLab: () => void;
  onGoHome: () => void;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  sessions,
  savedDynamicExperiments = [],
  t,
  onOpenSession,
  onDeleteSession,
  onLaunchDynamicExperiment,
  onDeleteDynamicExperiment,
  onOpenMagnetismLab,
  onGoHome,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="border-b border-[#EFE7DF] pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171A2F] mb-1">
          {t.myLearning.title}
        </h1>
        <p className="text-sm text-[#6F7487]">{t.myLearning.subtitle}</p>
      </div>

      {/* Featured Interactive Module Shortcut */}
      <div className="clay-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#C96D12]">{t.sampleCard.kicker}</p>
          <h2 className="text-lg font-semibold text-[#171A2F]">
            {t.myLearning.featuredModuleTitle}
          </h2>
          <p className="text-sm text-[#6F7487]">{t.myLearning.featuredModuleDesc}</p>
        </div>
        <button
          type="button"
          onClick={onOpenMagnetismLab}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <Compass className="w-4 h-4" />
          <span>{t.myLearning.launchLabBtn}</span>
        </button>
      </div>

      {/* Saved AI-Generated Interactive Experiments */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-[#171A2F]">
            {t.dynamicLab.savedGeneratedSectionTitle}
          </h2>
          <span className="font-mono-tabular text-xs font-semibold text-[#C96D12]">
            {savedDynamicExperiments.length}
          </span>
        </div>

        {savedDynamicExperiments.length === 0 ? (
          <div className="clay-card p-6 text-sm text-[#6F7487]">
            {t.dynamicLab.savedGeneratedEmpty}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedDynamicExperiments.map((spec) => (
              <article
                key={spec.id}
                data-testid={`saved-dynamic-card-${spec.id}`}
                className="clay-card p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#C96D12]">
                      Class {spec.studentClass} · {spec.supports3d ? '2D + 3D' : '2D'}
                    </span>
                    {spec.isSimplifiedModel ? (
                      <span className="inline-flex items-center gap-1 font-medium text-[#B45309]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t.dynamicLab.validatedSimplifiedBadge}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-[#C96D12]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.dynamicLab.validatedExactBadge}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-[#171A2F]">{spec.title}</h3>
                  <p className="text-xs font-medium text-[#6F7487]">
                    {spec.conceptName} · {new Date(spec.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[#6F7487] line-clamp-3 leading-relaxed">
                    {spec.educationalObjective || spec.conceptExplanation}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EFE7DF] flex items-center gap-2.5">
                  {onLaunchDynamicExperiment && (
                    <button
                      type="button"
                      onClick={() => onLaunchDynamicExperiment(spec)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer min-h-[40px]"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>{t.dynamicLab.reopenSavedLabBtn}</span>
                    </button>
                  )}
                  {onDeleteDynamicExperiment && (
                    <button
                      type="button"
                      onClick={() => onDeleteDynamicExperiment(spec.id)}
                      aria-label={t.dynamicLab.deleteSavedLab}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-[#EFE7DF] text-xs font-medium text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[40px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Saved Textbook Analyses */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[#171A2F]">
          {t.conceptExplorer.scannedPageBadge}
        </h2>
        {sessions.length === 0 ? (
          <div className="clay-card p-10 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#FFF3E3] text-[#C96D12] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#171A2F] mb-2">
              {t.myLearning.emptyTitle}
            </h3>
            <p className="text-sm text-[#6F7487] max-w-md mx-auto mb-6 leading-relaxed">
              {t.myLearning.emptyDescription}
            </p>
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>{t.conceptExplorer.uploadPageBtn}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <article
                key={session.id}
                className="clay-card p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <p className="text-xs text-[#6F7487]">
                    {session.fileName} · {new Date(session.savedAt).toLocaleDateString()}
                  </p>
                  <h3 className="text-base font-semibold text-[#171A2F]">
                    {session.analysis.main_topic}
                  </h3>
                  <p className="text-xs font-medium text-[#C96D12]">
                    {session.analysis.chapter} · {session.analysis.class_level}
                  </p>
                  <p className="text-sm text-[#6F7487] line-clamp-3 leading-relaxed">
                    {session.analysis.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EFE7DF] flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenSession(session)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer min-h-[40px]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t.myLearning.openAnalysis}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSession(session.id)}
                    aria-label={t.myLearning.deleteEntry}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-[#EFE7DF] text-xs font-medium text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer min-h-[40px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
