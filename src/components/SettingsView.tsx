import React from 'react';
import { CheckCircle2, Info, LogIn, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import type { GradeClassLevel, SimulationMode, UserPreferences, UserProfile } from '../types/physics';
import type { TranslationBundle } from '../i18n/translations';
import { CLASS_LEVELS } from '../data/ncertCurriculum';
import { LanguageSelector } from './LanguageSelector';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  t: TranslationBundle;
  geminiConfigured: boolean | null;
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onOpenPortal: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  t,
  geminiConfigured,
  userProfile,
  onOpenAuth,
  onOpenPortal,
  onLogout,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      <div className="border-b border-[#EFE7DF] pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171A2F] mb-1">
          {t.settings.title}
        </h1>
        <p className="text-sm text-[#6F7487]">{t.settings.subtitle}</p>
      </div>

      {/* Account & Portal Session */}
      <section className="clay-card p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFE7DF] pb-3">
          <div className="flex items-center gap-2 text-[#171A2F]">
            <UserIcon className="w-5 h-5 text-[#C96D12]" />
            <h2 className="text-base font-semibold">Student &amp; Teacher Account</h2>
          </div>
          <span className="text-xs font-medium text-[#C96D12]">
            Browser-Local Demo Auth (IndexedDB)
          </span>
        </div>

        {userProfile ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#171A2F]">
                {userProfile.name} ·{' '}
                <span className="capitalize">
                  {userProfile.role}
                </span>
                {userProfile.role === 'student' && userProfile.selectedClass
                  ? ` · Class ${userProfile.selectedClass}`
                  : ''}
              </p>
              <p className="text-xs text-[#6F7487]">
                <span className="font-mono text-[#171A2F]">@{userProfile.username}</span>
                <span aria-hidden="true"> · </span>
                <span>Stored locally on this browser only (no external sync)</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onOpenPortal}
                className="px-4 py-2 rounded-lg bg-[#F49A3C] text-white text-xs font-semibold hover:bg-[#E5882A] cursor-pointer"
              >
                Open {userProfile.role === 'teacher' ? 'Teacher' : 'Student'} Portal
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#EFE7DF] text-xs font-medium text-[#171A2F] hover:bg-[#FFF9F4] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-[#6F7487]">
              Sign in or create local Student (Classes 6–10) and Teacher accounts stored in this
              browser&apos;s IndexedDB. Accounts stay saved across refreshes on this device.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#F49A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#E5882A] cursor-pointer shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        )}
      </section>

      {/* Language Selection */}
      <section className="clay-card p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#171A2F]">
              {t.settings.languageSection}
            </h2>
            <p className="text-sm text-[#6F7487]">{t.settings.languageHelp}</p>
          </div>
          <LanguageSelector
            language={preferences.language}
            onChange={(language) => onUpdatePreferences({ language })}
          />
        </div>
      </section>

      {/* Simulation & Class Defaults */}
      <section className="clay-card p-6 sm:p-7 space-y-5">
        <h2 className="text-base font-semibold text-[#171A2F] pb-3 border-b border-[#EFE7DF]">
          {t.settings.simulationSection}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#171A2F]">
            {t.classLibrary.defaultClassSettingLabel}
          </span>
          {userProfile?.role === 'student' ? (
            <div className="px-3.5 py-2 rounded-lg bg-[#FFF9F4] border border-[#EFE7DF] text-xs font-semibold text-[#C96D12]">
              Class {userProfile.selectedClass ?? 6} · Locked to your student account
            </div>
          ) : (
            <div className="inline-flex flex-wrap items-center rounded-lg bg-[#F3EAE1]/70 p-1 border border-[#EFE7DF] self-start">
              {CLASS_LEVELS.map((cls: GradeClassLevel) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onUpdatePreferences({ selectedClass: cls })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                    preferences.selectedClass === cls
                      ? 'bg-[#F49A3C] text-white'
                      : 'text-[#171A2F] hover:bg-white/70'
                  }`}
                >
                  {t.classLibrary.classPrefix} {cls}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm font-medium text-[#171A2F]">
            {t.settings.defaultModeLabel}
          </span>
          <div className="inline-flex items-center rounded-lg bg-[#F3EAE1]/70 p-1 border border-[#EFE7DF] self-start">
            {(['2d', '3d'] as SimulationMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onUpdatePreferences({ defaultSimulationMode: m })}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                  preferences.defaultSimulationMode === m
                    ? 'bg-[#F49A3C] text-white'
                    : 'text-[#171A2F] hover:bg-white/70'
                }`}
              >
                {m === '2d' ? t.lab.mode2d : t.lab.mode3d}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 text-sm text-[#171A2F] cursor-pointer pt-2">
          <span>{t.settings.defaultVectorGridLabel}</span>
          <input
            type="checkbox"
            checked={preferences.showVectorGridByDefault}
            onChange={(e) =>
              onUpdatePreferences({ showVectorGridByDefault: e.target.checked })
            }
            className="w-4 h-4 accent-[#6F4E37] cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between gap-4 text-sm text-[#171A2F] cursor-pointer pt-2">
          <span>{t.settings.reducedMotionLabel}</span>
          <input
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) => onUpdatePreferences({ reducedMotion: e.target.checked })}
            className="w-4 h-4 accent-[#6F4E37] cursor-pointer"
          />
        </label>
      </section>

      {/* Server AI Connection Status (No API Key Inputs) */}
      <section className="clay-card p-6 sm:p-7 space-y-3">
        <div className="flex items-center gap-2 text-[#171A2F]">
          <ShieldCheck className="w-5 h-5 text-[#C96D12]" />
          <h2 className="text-base font-semibold">{t.settings.aiConnectionSection}</h2>
        </div>

        <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] flex items-start gap-3 text-sm">
          {geminiConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-[#C96D12] shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-[#6F7487] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="text-[#171A2F] font-medium">
              {geminiConfigured
                ? t.settings.aiConnectedText
                : t.settings.aiNotConfiguredText}
            </p>
            <p className="text-xs text-[#6F7487]">{t.settings.aiSecurityNote}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

