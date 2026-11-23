import React from 'react';
import { Box, Layers } from 'lucide-react';

interface PocketLabSwitchProps {
  isPocketLab: boolean;
  onToggle: (nextPocketLab: boolean) => void;
  size?: 'compact' | 'hero';
  className?: string;
}

/**
 * Tactile claymorphic workspace switch between Pocket Lab NCERT Labs and 3D · AR · VR Lab.
 */
export const PocketLabSwitch: React.FC<PocketLabSwitchProps> = ({
  isPocketLab,
  onToggle,
  size = 'compact',
  className = '',
}) => {
  if (size === 'hero') {
    return (
      <div
        role="group"
        aria-label="Switch between NCERT Labs and 3D, AR & VR Lab"
        className={`inline-flex items-center gap-3 rounded-2xl p-1.5 bg-[#FAF6F1] border border-[#EADFD3] shadow-[inset_0_2px_6px_rgba(23,26,47,0.06)] ${className}`}
      >
        <button
          type="button"
          data-testid="pocket-lab-hero-switch-physix"
          aria-pressed={!isPocketLab}
          onClick={() => onToggle(false)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-[#D95B26] focus-visible:outline-offset-2 ${
            !isPocketLab
              ? 'bg-white text-[#171A2F] shadow-[0_6px_16px_-6px_rgba(23,26,47,0.18)] border border-white'
              : 'text-[#6F7487] hover:text-[#171A2F]'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0 text-[#49AD8B]" aria-hidden="true" />
          <span>NCERT Labs</span>
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={isPocketLab}
          aria-label={isPocketLab ? 'Switch back to NCERT Labs' : 'Switch to 3D, AR & VR Lab'}
          data-testid="pocket-lab-hero-toggle"
          onClick={() => onToggle(!isPocketLab)}
          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D95B26] focus-visible:outline-offset-2 ${
            isPocketLab
              ? 'bg-[#D95B26] shadow-[inset_0_2px_4px_rgba(122,42,10,0.35)]'
              : 'bg-[#E2D9CE] hover:bg-[#D7CBBF] shadow-[inset_0_2px_4px_rgba(23,26,47,0.14)]'
          }`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-6 w-6 rounded-full bg-white shadow-[0_3px_8px_rgba(23,26,47,0.22)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isPocketLab ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>

        <button
          type="button"
          data-testid="pocket-lab-hero-switch-pocket"
          aria-pressed={isPocketLab}
          onClick={() => onToggle(true)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-[#D95B26] focus-visible:outline-offset-2 ${
            isPocketLab
              ? 'clay-btn-orange text-white'
              : 'bg-[#FFF3E6] text-[#B94916] hover:bg-[#FFE8D1] border border-[#F4C8A2]/70'
          }`}
        >
          <Box className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>3D · AR · VR Lab</span>
        </button>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Pocket Lab mode switch"
      data-testid="pocket-lab-header-switch"
      className={`inline-flex items-center gap-1 rounded-full p-1 bg-[#FAF4EC] border border-[#EBDCCB] shadow-[inset_0_1px_3px_rgba(23,26,47,0.06)] shrink-0 ${className}`}
    >
      <button
        type="button"
        aria-pressed={!isPocketLab}
        data-testid="switch-mode-physix"
        onClick={() => onToggle(false)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer min-h-[34px] focus-visible:outline-2 focus-visible:outline-[#D95B26] focus-visible:outline-offset-2 ${
          !isPocketLab
            ? 'bg-white text-[#171A2F] shadow-[0_3px_10px_-3px_rgba(23,26,47,0.18)]'
            : 'text-[#6F7487] hover:text-[#171A2F]'
        }`}
      >
        <span>NCERT</span>
      </button>

      <button
        type="button"
        aria-pressed={isPocketLab}
        data-testid="switch-mode-pocket-lab"
        onClick={() => onToggle(true)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer min-h-[34px] focus-visible:outline-2 focus-visible:outline-[#D95B26] focus-visible:outline-offset-2 ${
          isPocketLab
            ? 'clay-btn-orange text-white'
            : 'bg-[#FFF0E0] text-[#C24D1C] hover:bg-[#FFE3C7]'
        }`}
      >
        <Box className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>3D · AR · VR</span>
      </button>
    </div>
  );
};
