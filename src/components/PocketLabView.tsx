import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { PocketLabSwitch } from './PocketLabSwitch';

export const POCKET_LAB_URL = 'https://pocketlab-six.vercel.app/';

interface PocketLabViewProps {
  onExitPocketLab: () => void;
}

export const PocketLabView: React.FC<PocketLabViewProps> = ({ onExitPocketLab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be restricted in nested iframes; ignore cleanly
    }
  };

  const handleReload = () => {
    setIsLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <section
      ref={containerRef}
      aria-label="Pocket Lab 3D, AR and VR Science Workspace"
      data-testid="pocket-lab-workspace"
      className="flex flex-col w-full bg-[#FBF9F6]"
      style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 4.5rem)' }}
    >
      {/* Compact Workspace Switcher & Utility Strip */}
      <div className="shrink-0 border-b border-[#EFE7DF] bg-white/95 backdrop-blur-sm px-3 sm:px-5 h-13 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onExitPocketLab}
            data-testid="pocket-lab-back-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FAF6F1] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <PocketLabSwitch
            isPocketLab={true}
            onToggle={(next) => {
              if (!next) onExitPocketLab();
            }}
            size="compact"
          />

          <p className="hidden md:block text-xs text-[#6F7487] truncate">
            <span className="font-semibold text-[#171A2F]">Pocket Lab</span>
            <span aria-hidden="true"> · </span>
            <span>3D, AR &amp; VR Science Laboratories</span>
            <span aria-hidden="true"> · </span>
            <span className="font-mono-tabular">24 Live Benches</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleReload}
            title="Reload Pocket Lab"
            aria-label="Reload Pocket Lab"
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FAF6F1] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${!isLoaded ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FAF6F1] transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          <a
            href={POCKET_LAB_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Pocket Lab in a new browser tab"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E9E2DA] bg-[#FAF6F1] hover:bg-[#F3ECE4] text-xs font-semibold text-[#171A2F] transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <span className="hidden sm:inline">Full Tab</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C9511F] shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Full-Viewport Live Pocket Lab Frame */}
      <div className="relative flex-1 w-full bg-white overflow-hidden">
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#FBF9F6] px-6 text-center">
            <div className="w-12 h-12 rounded-2xl clay-icon-orange flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="font-['Outfit'] text-lg font-bold text-[#171A2F]">
                Switching to Pocket Lab
              </p>
              <p className="text-xs sm:text-sm text-[#6F7487]">
                Loading interactive 3D, AR &amp; VR Science Laboratories...
              </p>
            </div>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={POCKET_LAB_URL}
          title="Pocket Lab — Interactive 3D, AR & VR Science Laboratories"
          data-testid="pocket-lab-iframe"
          onLoad={() => setIsLoaded(true)}
          allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; fullscreen; gyroscope; microphone; xr-spatial-tracking"
          allowFullScreen
          className={`w-full h-full border-0 transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </section>
  );
};
