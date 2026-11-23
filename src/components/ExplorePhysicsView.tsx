import React from 'react';
import { BookOpen, Box, Compass, Info } from 'lucide-react';
import type { SimulationMode } from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';

interface ExplorePhysicsViewProps {
  t: TranslationBundle;
  onLaunchLab: (mode: SimulationMode) => void;
  onOpenConcepts: () => void;
}

export const ExplorePhysicsView: React.FC<ExplorePhysicsViewProps> = ({
  t,
  onLaunchLab,
  onOpenConcepts,
}) => {
  const upcomingTopics = [
    {
      title: t.explorePhysics.upcoming1Title,
      desc: t.explorePhysics.upcoming1Desc,
      chapter: 'NCERT Class 12 · Ch. 6',
    },
    {
      title: t.explorePhysics.upcoming2Title,
      desc: t.explorePhysics.upcoming2Desc,
      chapter: 'NCERT Class 10 · Ch. 11',
    },
    {
      title: t.explorePhysics.upcoming3Title,
      desc: t.explorePhysics.upcoming3Desc,
      chapter: 'NCERT Class 10 · Ch. 12',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      <div className="border-b border-[#EFE7DF] pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171A2F] mb-1">
          {t.explorePhysics.title}
        </h1>
        <p className="text-sm text-[#6F7487]">{t.explorePhysics.subtitle}</p>
      </div>

      {/* Active Interactive Module */}
      <section className="clay-card p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs font-semibold text-[#C96D12]">
            {t.explorePhysics.availableNow}
          </p>
          <h2 className="text-2xl font-bold text-[#171A2F]">
            {t.explorePhysics.barMagnetTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#6F7487] leading-relaxed max-w-2xl">
            {t.explorePhysics.barMagnetDesc}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onLaunchLab('2d')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F49A3C] text-white text-sm font-semibold hover:bg-[#E5882A] transition-colors cursor-pointer min-h-[44px]"
            >
              <Compass className="w-4 h-4" />
              <span>{t.explorePhysics.open2dLab}</span>
            </button>
            <button
              type="button"
              onClick={() => onLaunchLab('3d')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FFF3E3] text-[#171A2F] text-sm font-semibold hover:bg-[#FFE6C7] transition-colors cursor-pointer min-h-[44px]"
            >
              <Box className="w-4 h-4 text-[#C96D12]" />
              <span>{t.explorePhysics.open3dLab}</span>
            </button>
            <button
              type="button"
              onClick={onOpenConcepts}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#EFE7DF] text-[#171A2F] text-sm font-medium hover:bg-[#FFF9F4] transition-colors cursor-pointer min-h-[44px]"
            >
              <BookOpen className="w-4 h-4 text-[#C96D12]" />
              <span>{t.explorePhysics.viewConcepts}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] p-6 flex items-center justify-center">
          <svg viewBox="0 0 320 150" className="w-full max-w-[300px] h-auto" aria-hidden="true">
            <path d="M 102 65 C 85 18, 235 18, 218 65" fill="none" stroke="#F49A3C" strokeWidth="1.6" />
            <path d="M 102 65 C 55 4, 265 4, 218 65" fill="none" stroke="#6F7487" strokeWidth="1.1" />
            <path d="M 102 85 C 85 132, 235 132, 218 85" fill="none" stroke="#F49A3C" strokeWidth="1.6" />
            <path d="M 102 85 C 55 146, 265 146, 218 85" fill="none" stroke="#6F7487" strokeWidth="1.1" />
            <rect x="98" y="62" width="62" height="26" rx="3" fill="#B83A2D" />
            <rect x="160" y="62" width="62" height="26" rx="3" fill="#3E4C59" />
            <text x="129" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">N</text>
            <text x="191" y="80" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">S</text>
          </svg>
        </div>
      </section>

      {/* Curriculum Roadmap / Explanation-Only Previews */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#171A2F]">
          {t.explorePhysics.comingSoon}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingTopics.map((topic) => (
            <article
              key={topic.title}
              className="clay-card p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#6F7487]">{topic.chapter}</p>
                <h3 className="text-base font-semibold text-[#171A2F]">{topic.title}</h3>
                <p className="text-sm text-[#6F7487] leading-relaxed">{topic.desc}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#FFF3E3]/40 text-xs text-[#171A2F] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#C96D12] shrink-0 mt-0.5" />
                <span>{t.explorePhysics.comingSoon}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
