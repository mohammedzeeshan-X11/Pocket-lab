import React from 'react';
import {
  Award,
  BookOpen,
  Box,
  Camera,
  FlaskConical,
  HelpCircle,
  Home,
  LogOut,
  MessageSquareText,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';
import type { AppView, LanguageCode, UserProfile } from '../types/physics';
import type { RewardProgressState } from '../types/companion';
import { BADGE_CATALOG } from '../services/rewardsEngine';

export type SidebarItemId =
  | 'pocket_lab'
  | 'home'
  | 'learn'
  | 'experiments'
  | 'scanner'
  | 'challenge'
  | 'ai_tutor'
  | 'my_progress'
  | 'achievements';

interface SidebarNavProps {
  currentView: AppView;
  activeSidebarOverride?: SidebarItemId | null;
  language: LanguageCode;
  userProfile: UserProfile | null;
  rewardState: RewardProgressState;
  reducedMotion?: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectItem: (item: SidebarItemId) => void;
  onNavigateView: (view: AppView) => void;
  onLogout: () => void;
}

const SIDEBAR_LABELS: Record<
  LanguageCode,
  {
    home: string;
    learn: string;
    experiments: string;
    scanner: string;
    challenge: string;
    aiTutor: string;
    myProgress: string;
    achievements: string;
    settings: string;
    signOut: string;
    studentRole: string;
    teacherRole: string;
  }
> = {
  en: {
    home: 'Workspace Home',
    experiments: 'Chapters & Labs',
    scanner: 'Textbook Scanner',
    challenge: 'Daily Challenge',
    learn: 'Concepts',
    aiTutor: 'AI Tutor',
    myProgress: 'My Portal',
    achievements: 'Achievements',
    settings: 'Settings',
    signOut: 'Sign Out',
    studentRole: 'Student',
    teacherRole: 'Teacher',
  },
  kn: {
    home: 'ಮುಖಪುಟ',
    experiments: 'ಅಧ್ಯಾಯಗಳು ಮತ್ತು ಪ್ರಯೋಗಗಳು',
    scanner: 'ಪುಸ್ತಕ ಸ್ಕ್ಯಾನ್',
    challenge: 'ದೈನಂದಿನ ಸವಾಲು',
    learn: 'ಪರಿಕಲ್ಪನೆಗಳು',
    aiTutor: 'AI ಟ್ಯೂಟರ್',
    myProgress: 'ನನ್ನ ಪ್ರಗತಿ',
    achievements: 'ಸಾಧನೆಗಳು',
    settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    signOut: 'ಸೈನ್ ಔಟ್',
    studentRole: 'ವಿದ್ಯಾರ್ಥಿ',
    teacherRole: 'ಶಿಕ್ಷಕರು',
  },
  hi: {
    home: 'वर्कस्पेस होम',
    experiments: 'अध्याय और लैब',
    scanner: 'पाठ्यपुस्तक स्कैन',
    challenge: 'दैनिक चुनौती',
    learn: 'अवधारणाएँ',
    aiTutor: 'AI ट्यूटर',
    myProgress: 'मेरा पोर्टल',
    achievements: 'उपलब्धियाँ',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    studentRole: 'विद्यार्थी',
    teacherRole: 'शिक्षक',
  },
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentView,
  activeSidebarOverride = null,
  language,
  userProfile,
  rewardState,
  mobileOpen,
  onCloseMobile,
  onSelectItem,
  onNavigateView,
  onLogout,
}) => {
  if (!mobileOpen || !userProfile) return null;

  const labels = SIDEBAR_LABELS[language];

  const resolvedActive: SidebarItemId | 'settings' = (() => {
    if (activeSidebarOverride) return activeSidebarOverride;
    if (currentView === 'pocket_lab') return 'pocket_lab';
    if (currentView === 'home') return 'home';
    if (currentView === 'explore' || currentView === 'lab') return 'experiments';
    if (currentView === 'scanner') return 'scanner';
    if (currentView === 'challenge') return 'challenge';
    if (currentView === 'concepts') return 'learn';
    if (
      currentView === 'learning' ||
      currentView === 'student_portal' ||
      currentView === 'teacher_portal'
    ) {
      return 'my_progress';
    }
    if (currentView === 'settings') return 'settings';
    return 'home';
  })();

  const items: Array<{
    id: SidebarItemId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    meta?: string;
  }> = [
    { id: 'home', label: labels.home, icon: Home },
    { id: 'experiments', label: labels.experiments, icon: FlaskConical },
    { id: 'scanner', label: labels.scanner, icon: Camera },
    { id: 'challenge', label: labels.challenge, icon: HelpCircle },
    { id: 'learn', label: labels.learn, icon: BookOpen },
    { id: 'ai_tutor', label: labels.aiTutor, icon: MessageSquareText },
    { id: 'my_progress', label: labels.myProgress, icon: TrendingUp },
    {
      id: 'achievements',
      label: labels.achievements,
      icon: Award,
      meta: `${rewardState.unlockedBadgeIds.length}/${BADGE_CATALOG.length}`,
    },
  ];

  return (
    <div
      className="lg:hidden fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Workspace navigation"
    >
      <div
        className="fixed inset-0 bg-[#171A2F]/30 backdrop-blur-[2px]"
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <div className="relative w-72 max-w-[84vw] h-full clay-sidebar shadow-2xl z-10 flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-[#EFE9E2] shrink-0">
          <span className="font-['Outfit'] text-lg font-bold tracking-tight text-[#171A2F]">
            Pocket <span className="text-[#F49A3C] font-semibold">Lab</span>
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl text-[#6F7487] hover:text-[#171A2F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {/* Highlighted Flagship Pocket Lab Switch */}
          <button
            type="button"
            data-testid="sidebar-nav-pocket_lab"
            onClick={() => {
              onSelectItem('pocket_lab');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl text-sm transition-all cursor-pointer min-h-[48px] mb-2 ${
              resolvedActive === 'pocket_lab'
                ? 'clay-btn-orange text-white font-bold'
                : 'bg-[#FFF3E6] text-[#B94916] hover:bg-[#FFE6CE] font-bold border border-[#F4C8A2]/70'
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Box className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">3D · AR · VR Lab</span>
            </span>
            <span
              className={`text-[11px] font-mono-tabular whitespace-nowrap ${
                resolvedActive === 'pocket_lab' ? 'text-white/90' : 'text-[#C9511F]'
              }`}
            >
              24 Benches
            </span>
          </button>

          {items.map((item) => {
            const Icon = item.icon;
            const isActive = resolvedActive === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectItem(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-colors cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-[#FFF3E3] text-[#171A2F] font-semibold'
                    : 'text-[#6F7487] hover:bg-[#FAF6F1] hover:text-[#171A2F]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#F49A3C]' : 'text-[#6F7487]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.meta && (
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#6F7487]">
                    {item.meta}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#EFE9E2] space-y-2 shrink-0">
          <button
            type="button"
            data-testid="sidebar-nav-settings"
            onClick={() => {
              onNavigateView('settings');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm cursor-pointer min-h-[44px] ${
              resolvedActive === 'settings'
                ? 'bg-[#FFF3E3] text-[#171A2F] font-semibold'
                : 'text-[#6F7487] hover:bg-[#FAF6F1]'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>{labels.settings}</span>
          </button>

          <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl clay-inset">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full clay-btn-teal text-white flex items-center justify-center text-xs font-bold shrink-0">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#171A2F] truncate">{userProfile.name}</p>
                <p className="text-[11px] text-[#6F7487] truncate">
                  {userProfile.role === 'teacher'
                    ? labels.teacherRole
                    : `${labels.studentRole} · Class ${userProfile.selectedClass ?? 6}`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                onLogout();
              }}
              aria-label={labels.signOut}
              title={labels.signOut}
              className="p-2 rounded-xl text-[#6F7487] hover:text-[#171A2F] cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
