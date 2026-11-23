import React from 'react';
import type { LanguageCode } from '../types/physics';

interface LanguageSelectorProps {
  language: LanguageCode;
  onChange: (lang: LanguageCode) => void;
  compact?: boolean;
}

const OPTIONS: Array<{ code: LanguageCode; short: string; label: string }> = [
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'kn', short: 'ಕನ್ನಡ', label: 'ಕನ್ನಡ' },
  { code: 'hi', short: 'हिन्दी', label: 'हिन्दी' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onChange,
  compact = false,
}) => {
  return (
    <div
      role="group"
      aria-label="Select learning language"
      className="inline-flex items-center rounded-2xl clay-inset p-1"
    >
      {OPTIONS.map((opt) => {
        const isActive = language === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => onChange(opt.code)}
            aria-pressed={isActive}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F49A3C] focus-visible:outline-offset-2 ${
              isActive
                ? 'clay-btn-orange text-white'
                : 'text-[#6F7487] hover:text-[#171A2F] hover:bg-white/75'
            }`}
          >
            {compact ? opt.short : opt.label}
          </button>
        );
      })}
    </div>
  );
};
