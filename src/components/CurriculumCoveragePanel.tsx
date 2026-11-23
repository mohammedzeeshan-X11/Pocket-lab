import React from 'react';
import { CheckCircle2, Cpu, Layers, ShieldAlert } from 'lucide-react';
import { ALL_UNIQUE_SIMULATION_ENGINES } from '../data/simulationRegistry';
import { computeCurriculumCoverageReport } from '../data/ncertCurriculum';
import type { TranslationBundle } from '../i18n/translations';

import type { GradeClassLevel } from '../types/physics';

interface CurriculumCoveragePanelProps {
  t: TranslationBundle;
  lockedClass?: GradeClassLevel;
  onSelectClass: (classLevel: 6 | 7 | 8 | 9 | 10) => void;
}

export const CurriculumCoveragePanel: React.FC<CurriculumCoveragePanelProps> = ({
  t,
  lockedClass,
  onSelectClass,
}) => {
  const report = computeCurriculumCoverageReport();

  return (
    <div className="space-y-6">
      {/* Architecture Headline Metrics (Separating Unique Engines from Reused Listings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5 space-y-1">
          <p className="text-xs font-medium text-[#6F7487]">
            {t.classLibrary.coverageUniqueEnginesLabel}
          </p>
          <p className="text-2xl font-bold text-[#C96D12] font-mono-tabular">
            {report.implementedUniqueSimulationEngines} / {report.totalUniqueSimulationEngines}
          </p>
          <p className="text-xs text-[#6F7487]">
            {t.classLibrary.coverageZeroDuplicatesNote}
          </p>
        </div>

        <div className="clay-card p-5 space-y-1">
          <p className="text-xs font-medium text-[#6F7487]">
            {t.classLibrary.coverageClassListingsLabel}
          </p>
          <p className="text-2xl font-bold text-[#171A2F] font-mono-tabular">
            {report.totalClassExperimentListings}
          </p>
          <p className="text-xs text-[#6F7487]">
            {t.classLibrary.coverageInteractiveListingsLabel}: {report.totalInteractiveListings}
          </p>
        </div>

        <div className="clay-card p-5 space-y-1">
          <p className="text-xs font-medium text-[#6F7487]">
            {t.classLibrary.coverageRemainingLabel}
          </p>
          <p className="text-2xl font-bold text-[#171A2F] font-mono-tabular">
            {report.totalRemainingToDevelop}
          </p>
          <p className="text-xs text-[#6F7487]">
            {t.classLibrary.coverageRemainingNote}
          </p>
        </div>

        <div className="clay-card p-5 space-y-1">
          <p className="text-xs font-medium text-[#6F7487]">
            {t.classLibrary.coverageGradesLabel}
          </p>
          <p className="text-2xl font-bold text-[#171A2F] font-mono-tabular">6 – 10</p>
          <p className="text-xs text-[#6F7487]">Curiosity · Exploration · Rationalised</p>
        </div>
      </div>

      {/* Per-Class Coverage Table */}
      <div className="clay-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EFE7DF] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#171A2F]">
            <Layers className="w-5 h-5 text-[#C96D12]" />
            <h3 className="text-base font-semibold">{t.classLibrary.coverageTableHeading}</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FFF9F4] border-b border-[#EFE7DF] text-xs font-semibold text-[#6F7487]">
              <tr>
                <th className="py-3 px-4">{t.conceptExplorer.classLevelLabel}</th>
                <th className="py-3 px-4">{t.classLibrary.statChapters}</th>
                <th className="py-3 px-4">{t.classLibrary.coverageColListed}</th>
                <th className="py-3 px-4">{t.classLibrary.coverageColImplemented}</th>
                <th className="py-3 px-4">{t.classLibrary.coverageColReused}</th>
                <th className="py-3 px-4">{t.classLibrary.coverageColVerification}</th>
                <th className="py-3 px-4 text-right">{t.classLibrary.coverageColAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE7DF]">
              {report.rows.map((row) => {
                const isAllowed = !lockedClass || lockedClass === row.classLevel;
                return (
                  <tr key={row.classLevel} className="hover:bg-[#FFF9F4]/60">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#171A2F]">
                        {t.classLibrary.classPrefix} {row.classLevel}
                      </p>
                      <p className="text-xs text-[#6F7487]">{row.textbookSeries}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-[#171A2F]">
                      {row.physicsChaptersCount} ({row.physicsTopicsCount} topics)
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-[#171A2F]">
                      {row.totalExperimentsListed}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular font-semibold text-[#C96D12]">
                      {row.implementedCount} / {row.simulatableCount}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-[#6F7487]">
                      {row.reusedFromOtherClassesCount}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="inline-flex items-center gap-1 text-[#C96D12] font-medium mr-3">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {row.verifiedCount} verified
                      </span>
                      {row.needsVerificationCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[#B45309] font-medium">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {row.needsVerificationCount} check
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isAllowed ? (
                        <button
                          type="button"
                          onClick={() => onSelectClass(row.classLevel)}
                          className="px-3 py-1.5 rounded-lg border border-[#EFE7DF] bg-white text-xs font-semibold text-[#C96D12] hover:bg-[#FFF3E3]/50 cursor-pointer whitespace-nowrap"
                        >
                          {t.classLibrary.openClassBtn} {row.classLevel}
                        </button>
                      ) : (
                        <span className="text-xs text-[#6F7487]">
                          Locked to Class {lockedClass}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Simulation Engine Registry Directory */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-[#171A2F]">
          <Cpu className="w-5 h-5 text-[#C96D12]" />
          <h3 className="text-base font-semibold">{t.classLibrary.sharedEnginesHeading}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_UNIQUE_SIMULATION_ENGINES.map((engine) => (
            <div
              key={engine.id}
              className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#171A2F]">{engine.name}</p>
                <span className="font-mono-tabular text-xs font-semibold text-[#C96D12] shrink-0">
                  {engine.supportedModes.map((m) => m.toUpperCase()).join(' + ')}
                </span>
              </div>
              <p className="text-xs text-[#6F7487] leading-relaxed">{engine.explanationMetadata}</p>
              <p className="text-[11px] font-medium text-[#C96D12]">
                {t.classLibrary.sharedAcrossPrefix}: {engine.supportedClasses.map((c) => `Class ${c}`).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
