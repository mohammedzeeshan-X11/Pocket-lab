import React from 'react';
import { Sparkles } from 'lucide-react';

interface FloatingAiTutorButtonProps {
  onClick: () => void;
  tooltip: string;
  isOpen?: boolean;
}

export const FloatingAiTutorButton: React.FC<FloatingAiTutorButtonProps> = ({
  onClick,
  tooltip,
  isOpen = false,
}) => {
  return (
    <button
      type="button"
      data-testid="floating-physix-ai-btn"
      onClick={onClick}
      title={tooltip}
      aria-label={tooltip}
      aria-expanded={isOpen}
      className={`group pointer-events-auto absolute bottom-3.5 right-3.5 z-30 w-13 h-13 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F49A3C] ${
        isOpen
          ? 'clay-btn-teal scale-95'
          : 'clay-btn-orange hover:scale-105 active:scale-95'
      }`}
    >
      <Sparkles className="w-5 h-5" aria-hidden="true" />
      <span className="sr-only">{tooltip}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-2.5 hidden sm:group-hover:inline-flex whitespace-nowrap rounded-xl bg-[#171A2F] text-white text-[11px] font-semibold px-3 py-1.5 shadow-lg"
      >
        {tooltip}
      </span>
    </button>
  );
};
