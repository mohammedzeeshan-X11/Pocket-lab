import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  Bell,
  Box,
  CheckCircle2,
  FlaskConical,
  LogOut,
  Menu,
  UserPlus,
  X,
} from 'lucide-react';
import type {
  AppView,
  GradeClassLevel,
  LanguageCode,
  TeacherNotification,
  UserProfile,
} from '../types/physics';
import type { BadgeDefinition, GuidedClassroomActivity } from '../types/companion';
import type { TranslationBundle } from '../i18n/translations';
import { CLASS_LEVELS } from '../data/ncertCurriculum';
import { PocketLabSwitch } from './PocketLabSwitch';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  selectedClass: GradeClassLevel;
  lockedClass?: GradeClassLevel;
  onSelectClass: (cls: GradeClassLevel) => void;
  userProfile: UserProfile | null;
  authReady: boolean;
  teacherNotifications?: TeacherNotification[];
  studentGuidedActivities?: GuidedClassroomActivity[];
  latestBadgeToast?: BadgeDefinition | null;
  onDismissBadgeToast?: () => void;
  onOpenGuidedActivity?: (activity: GuidedClassroomActivity) => void;
  onToggleMobileSidebar: () => void;
  mobileSidebarOpen: boolean;
  onTogglePocketLab: (nextPocketLab: boolean) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  t: TranslationBundle;
}

const LANG_OPTIONS: Array<{ code: LanguageCode; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  language,
  onLanguageChange,
  selectedClass,
  lockedClass,
  onSelectClass,
  userProfile,
  authReady,
  teacherNotifications = [],
  studentGuidedActivities = [],
  latestBadgeToast = null,
  onDismissBadgeToast,
  onOpenGuidedActivity,
  onToggleMobileSidebar,
  mobileSidebarOpen,
  onTogglePocketLab,
  onOpenAuth,
  onLogout,
  t,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [notifOpen]);

  const portalView: AppView =
    userProfile?.role === 'teacher' ? 'teacher_portal' : 'student_portal';

  const unreadTeacherNotifs = teacherNotifications.filter((n) => !n.isRead);
  const realNotifCount =
    userProfile?.role === 'teacher'
      ? unreadTeacherNotifs.length
      : studentGuidedActivities.length + (latestBadgeToast ? 1 : 0);

  // Separated feature navigation shown ONLY after signing in
  const appNavLinks: Array<{ id: AppView; label: string; isActive: boolean }> = [
    { id: 'home', label: 'Home', isActive: currentView === 'home' },
    {
      id: 'explore',
      label: 'Chapters',
      isActive: currentView === 'explore' || currentView === 'lab',
    },
    { id: 'scanner', label: 'Scanner', isActive: currentView === 'scanner' },
    { id: 'challenge', label: 'Daily Quiz', isActive: currentView === 'challenge' },
    {
      id: portalView,
      label: userProfile?.role === 'teacher' ? 'Portal' : 'Progress',
      isActive:
        currentView === 'learning' ||
        currentView === 'student_portal' ||
        currentView === 'teacher_portal',
    },
  ];

  const scrollToLandingSection = (sectionId: string) => {
    if (currentView !== 'home') {
      onNavigate('home');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 clay-header">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Clean Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {userProfile && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              aria-label={t.nav.menu}
              aria-expanded={mobileSidebarOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-[#171A2F] hover:bg-[#FAF6F1] cursor-pointer shrink-0"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-['Outfit'] text-xl font-bold tracking-tight cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F49A3C] focus-visible:outline-offset-4 rounded-lg whitespace-nowrap shrink-0"
          >
            <span className="text-[#171A2F]">Pocket</span>{' '}
            <span className="text-[#F49A3C] font-semibold">Lab</span>
          </button>
        </div>

        {/* Zone 2: Landing Informational Links (Logged Out) OR Separated App Nav + Pocket Lab Switch (Logged In) */}
        {userProfile ? (
          <div className="hidden lg:flex items-center gap-6 min-w-0">
            <PocketLabSwitch
              isPocketLab={currentView === 'pocket_lab'}
              onToggle={onTogglePocketLab}
              size="compact"
            />
            <nav
              aria-label="Workspace navigation"
              className="flex items-center gap-6 text-sm"
            >
              {appNavLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  className={`py-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#F49A3C] focus-visible:outline-offset-4 rounded ${
                    link.isActive
                      ? 'text-[#171A2F] font-bold'
                      : 'text-[#6F7487] font-medium hover:text-[#171A2F]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        ) : (
          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-8 text-sm"
          >
            <button
              type="button"
              onClick={() => scrollToLandingSection('pocket-lab')}
              className="py-1 text-[#C9511F] font-semibold hover:text-[#A93E12] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              3D · AR · VR
            </button>
            <button
              type="button"
              onClick={() => scrollToLandingSection('features')}
              className="py-1 text-[#6F7487] font-medium hover:text-[#171A2F] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToLandingSection('how-it-works')}
              className="py-1 text-[#6F7487] font-medium hover:text-[#171A2F] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToLandingSection('curriculum')}
              className="py-1 text-[#6F7487] font-medium hover:text-[#171A2F] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Curriculum
            </button>
          </nav>
        )}

        {/* Zone 3: Controls + Auth Action */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Quick Mobile/Tablet Pocket Lab Switch when logged in */}
          {userProfile && (
            <button
              type="button"
              data-testid="mobile-pocket-lab-switch-btn"
              onClick={() => onTogglePocketLab(currentView !== 'pocket_lab')}
              className={`lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer min-h-[36px] transition-all ${
                currentView === 'pocket_lab'
                  ? 'clay-btn-orange text-white'
                  : 'bg-[#FFF0E0] text-[#C24D1C] border border-[#F4C8A2]/70'
              }`}
            >
              <Box className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{currentView === 'pocket_lab' ? 'NCERT' : '3D · AR · VR'}</span>
            </button>
          )}
          {/* Class selector only shown after login; language switch always available */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#6F7487]">
            {userProfile && (
              <>
                {lockedClass ? (
                  <span className="px-2 py-1 text-[#171A2F] font-semibold whitespace-nowrap">
                    {t.classLibrary.classPrefix} {lockedClass}
                  </span>
                ) : (
                  <select
                    aria-label="Select NCERT Class"
                    data-testid="header-class-selector"
                    value={selectedClass}
                    onChange={(e) =>
                      onSelectClass(Number(e.target.value) as GradeClassLevel)
                    }
                    className="bg-transparent px-2 py-1.5 rounded-lg text-xs font-semibold text-[#171A2F] hover:bg-[#FAF6F1] focus:outline-none cursor-pointer"
                  >
                    {CLASS_LEVELS.map((cls) => (
                      <option key={cls} value={cls}>
                        {t.classLibrary.classPrefix} {cls}
                      </option>
                    ))}
                  </select>
                )}
                <span aria-hidden="true" className="text-[#E4DDD5]">|</span>
              </>
            )}

            <select
              aria-label="Select learning language"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent px-2 py-1.5 rounded-lg text-xs font-semibold text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FAF6F1] focus:outline-none cursor-pointer"
            >
              {LANG_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications (only shown when signed in) */}
          {userProfile && (
            <div className="relative" ref={notifContainerRef}>
              <button
                type="button"
                data-testid="header-notifications-btn"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-expanded={notifOpen}
                aria-label={`Notifications (${realNotifCount})`}
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-full text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FAF6F1] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {realNotifCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#F49A3C] text-white text-[9px] font-bold font-mono-tabular flex items-center justify-center">
                    {realNotifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div
                  role="region"
                  aria-label="Notifications"
                  className="absolute right-0 mt-2.5 w-80 max-w-[90vw] clay-card p-4 space-y-3 z-50"
                >
                  <div className="flex items-center justify-between border-b border-[#EFE9E2] pb-2.5">
                    <span className="text-sm font-bold text-[#171A2F]">Notifications</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      aria-label="Close notifications"
                      className="p-1 rounded-lg text-[#6F7487] hover:text-[#171A2F] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {realNotifCount === 0 ? (
                    <p className="text-xs text-[#6F7487] py-2">You&apos;re all caught up.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {latestBadgeToast && (
                        <div className="p-3 rounded-2xl bg-[#FFF6EB] flex items-start justify-between gap-2 text-xs">
                          <div className="flex items-start gap-2">
                            <Award className="w-4 h-4 text-[#F49A3C] shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-[#171A2F]">
                                {latestBadgeToast.title[language]}
                              </p>
                              <p className="text-[#6F7487] mt-0.5">
                                {latestBadgeToast.description[language]}
                              </p>
                            </div>
                          </div>
                          {onDismissBadgeToast && (
                            <button
                              type="button"
                              onClick={onDismissBadgeToast}
                              className="text-[11px] font-semibold text-[#C96D12] hover:underline cursor-pointer shrink-0"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      )}

                      {userProfile.role === 'teacher' &&
                        unreadTeacherNotifs.slice(0, 5).map((n) => (
                          <button
                            key={n.notificationId}
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              onNavigate('teacher_portal');
                            }}
                            className="w-full text-left p-3 rounded-2xl clay-inset flex items-start gap-2 text-xs cursor-pointer"
                          >
                            <UserPlus className="w-4 h-4 text-[#49AD8B] shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-[#171A2F]">{n.title}</p>
                              <p className="text-[#6F7487]">{n.message}</p>
                            </div>
                          </button>
                        ))}

                      {userProfile.role === 'student' &&
                        studentGuidedActivities.slice(0, 5).map((act) => (
                          <button
                            key={act.activityId}
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              if (onOpenGuidedActivity) {
                                onOpenGuidedActivity(act);
                              } else {
                                onNavigate('student_portal');
                              }
                            }}
                            className="w-full text-left p-3 rounded-2xl clay-inset flex items-start gap-2 text-xs cursor-pointer"
                          >
                            <FlaskConical className="w-4 h-4 text-[#49AD8B] shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-[#171A2F]">
                                {act.experimentTitle}
                              </p>
                              <p className="text-[#6F7487]">
                                {act.className} · {act.teacherName}
                              </p>
                            </div>
                          </button>
                        ))}

                      {teacherNotifications.length > 0 &&
                        unreadTeacherNotifs.length === 0 &&
                        userProfile.role === 'teacher' && (
                          <div className="flex items-center gap-2 text-xs text-[#6F7487] py-1">
                            <CheckCircle2 className="w-4 h-4 text-[#49AD8B]" />
                            <span>All notifications read.</span>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Primary Action: Login (Logged Out) or Profile + Logout (Logged In) */}
          {authReady && (
            <>
              {userProfile ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(portalView)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full clay-btn-teal text-xs font-semibold cursor-pointer whitespace-nowrap max-w-[140px] min-h-[38px]"
                  >
                    <span className="truncate">{userProfile.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    aria-label="Sign Out"
                    title="Sign Out"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#6F7487] hover:text-[#171A2F] hover:bg-[#FAF6F1] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  data-testid="navbar-signin-btn"
                  onClick={onOpenAuth}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-[#242736] hover:bg-[#171A2F] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[38px]"
                >
                  Login
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
