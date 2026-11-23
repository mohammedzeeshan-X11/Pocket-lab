import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Box,
  Camera,
  CheckCircle2,
  Compass,
  FlaskConical,
  Glasses,
  Globe,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Volume2,
} from 'lucide-react';
import type { AppView, LanguageCode, UserRole } from '../types/physics';
import { PhysixCompanionAvatar } from './PhysixCompanionAvatar';
import { PocketLabSwitch } from './PocketLabSwitch';

interface LandingPageViewProps {
  language: LanguageCode;
  reducedMotion?: boolean;
  onOpenAuth: (role?: UserRole, mode?: 'login' | 'register', targetView?: AppView) => void;
}

const FEATURES = [
  {
    icon: FlaskConical,
    title: '2D & 3D Virtual Physics Labs',
    description:
      '40 interactive simulations spanning Magnetism, Optics, Electric Circuits, Motion, Heat, Forces, and Sound.',
  },
  {
    icon: BookOpen,
    title: 'Class 6–10 NCERT Chapters',
    description:
      'All 23 Physics chapters and 58 experiments organized sequentially as Chapter 1, 2, 3… for every grade.',
  },
  {
    icon: Camera,
    title: 'Textbook Page Scanner',
    description:
      'Upload or photograph any NCERT Physics page to extract concepts, equations, and matching virtual labs.',
  },
  {
    icon: Globe,
    title: 'Multilingual Learning',
    description:
      'Switch smoothly across English, Kannada, and Hindi for experiment guides, voice explanations, and quizzes.',
  },
  {
    icon: Bot,
    title: 'AI Companion & Voice Tutor',
    description:
      'Learn alongside Nova, your interactive pet-robot guide who explains live parameters step by step.',
  },
  {
    icon: Users,
    title: 'Student & Teacher Portals',
    description:
      'Separate dashboards for students to track progress and daily quizzes, and teachers to manage classrooms.',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Sign In to Your Workspace',
    description:
      'Choose a Student account for your class (6–10) or a Teacher account to manage classes and guided labs.',
  },
  {
    step: '02',
    title: 'Pick a Dedicated Tool',
    description:
      'Open Chapters & Labs, Textbook Scanner, Daily Challenge, or Concepts—each in its own clean space.',
  },
  {
    step: '03',
    title: 'Experiment & Master',
    description:
      'Adjust live physics parameters, record observations, complete quizzes, and track your mastery over time.',
  },
];

const PLATFORM_STANDARDS = [
  { icon: Box, label: 'Built-in Pocket Lab Switch (3D · AR · VR Laboratories)' },
  { icon: BookOpen, label: 'Aligned with NCERT & Curiosity (Classes 6–10)' },
  { icon: Compass, label: 'Real-Time 2D & 3D Physics Engines' },
  { icon: CheckCircle2, label: 'Step-by-Step Lab Procedures & Quizzes' },
  { icon: Volume2, label: 'Voice Explanations in English, Kannada & Hindi' },
  { icon: Camera, label: 'AI Textbook Diagram & Formula Extraction' },
  { icon: Trophy, label: 'Daily Physics Challenges & Milestone Badges' },
  { icon: ShieldCheck, label: 'Role-Separated Student & Teacher Portals' },
];

const PRO_HIGHLIGHTS = [
  { icon: Box, label: 'Instant Switch into Pocket Lab (24 Live 3D · AR · VR Benches)' },
  { icon: FlaskConical, label: '58 NCERT Experiments & Guided Practicals' },
  { icon: BookOpen, label: 'Sequential Chapters (1, 2, 3…) for Classes 6–10' },
  { icon: Camera, label: 'Dedicated Textbook Page Scanner Workspace' },
  { icon: Trophy, label: 'Dedicated Daily Physics Challenge & Streak Tracker' },
  { icon: Bot, label: 'Interactive AI Pet-Robot Lab Tutor' },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  reducedMotion = false,
  onOpenAuth,
}) => {
  return (
    <div className="w-full overflow-x-hidden">
      {/* 1. Editorial Hero Section (Subtle Technical Blueprint Grid) */}
      <section
        id="overview"
        className="relative bg-white border-b border-[#EFE7DF]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(23,26,47,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,26,47,0.035) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Clear Informational Value Proposition + Auth CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-bold tracking-wider uppercase text-[#C9511F]">
                NCERT Physics · Classes 6 to 10
              </p>

              <h1
                className="font-['Outfit'] text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-[#171A2F] tracking-tight leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Experience Physics.{' '}
                <span className="text-[#D95B26]">Understand Everything.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#555B6E] leading-relaxed max-w-xl">
                <strong className="font-semibold text-[#171A2F]">Pocket Lab</strong> pairs complete
                NCERT Class 6–10 Physics chapters with a built-in{' '}
                <strong className="font-semibold text-[#171A2F]">3D, AR &amp; VR Lab Switch</strong>
                —so after you sign in, you can flip straight into walkable 3D science laboratories,
                scan textbook pages, and learn in English, Kannada, and Hindi.
              </p>

              {/* Primary & Secondary Login CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  data-testid="landing-get-started-btn"
                  onClick={() => onOpenAuth('student', 'register')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D95B26] hover:bg-[#C24D1C] text-white text-sm sm:text-base font-semibold shadow-sm transition-colors cursor-pointer min-h-[48px] whitespace-nowrap"
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  data-testid="landing-student-login-btn"
                  onClick={() => onOpenAuth('student', 'login')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#242736] hover:bg-[#171A2F] text-white text-sm sm:text-base font-semibold transition-colors cursor-pointer min-h-[48px] whitespace-nowrap"
                >
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  data-testid="landing-teacher-login-btn"
                  onClick={() => onOpenAuth('teacher', 'login')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#F3EFEA] hover:bg-[#EAE3DB] text-[#171A2F] text-sm font-semibold transition-colors cursor-pointer min-h-[48px] whitespace-nowrap"
                >
                  <Users className="w-4 h-4 text-[#555B6E] shrink-0" />
                  <span>Teacher Portal</span>
                </button>
              </div>

              {/* Clean 4-Metric Informational Strip */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl text-xs sm:text-sm text-[#3E4357]">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#D95B26] shrink-0" />
                  <span className="font-semibold text-[#171A2F]">Pocket Lab 3D</span>
                </div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-[#D95B26] shrink-0" />
                  <span className="font-medium font-mono-tabular">58 Experiments</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#D95B26] shrink-0" />
                  <span className="font-medium font-mono-tabular">23 Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#D95B26] shrink-0" />
                  <span className="font-medium">3 Languages</span>
                </div>
              </div>
            </div>

            {/* Right: Clean Informational Showcase Visual (Companion + Structured Overview) */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#F9F7F4] border border-[#E9E2DA] p-6 sm:p-8 shadow-[0_18px_40px_-24px_rgba(23,26,47,0.22)] space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C9511F]">
                      Inside Your Workspace
                    </p>
                    <p className="text-base font-bold text-[#171A2F]">
                      Meet Nova, Your Pocket Lab Companion
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-4 rounded-2xl bg-white border border-[#EFE9E2]">
                  <PhysixCompanionAvatar
                    emotion="idle"
                    pointTarget="none"
                    size={144}
                    reducedMotion={reducedMotion}
                  />
                  <p className="mt-3 px-4 text-center text-xs sm:text-sm text-[#555B6E] max-w-xs">
                    Sign in to unlock your class chapters, live simulations, textbook scanner, and
                    daily physics challenges.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white border border-[#EFE9E2] p-3 space-y-1">
                    <p className="font-bold text-[#171A2F]">Class 6–10</p>
                    <p className="text-[#6F7487]">Grade-specific physics chapters</p>
                  </div>
                  <div className="rounded-xl bg-white border border-[#EFE9E2] p-3 space-y-1">
                    <p className="font-bold text-[#171A2F]">EN · ಕನ್ನಡ · हिन्दी</p>
                    <p className="text-[#6F7487]">Full multilingual support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5. Highlighted Main Feature: Pocket Lab Switch Informational Spotlight */}
      <section
        id="pocket-lab"
        className="py-14 sm:py-20 bg-[#FBF9F6] border-b border-[#E9E2DA]"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="clay-hero p-7 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs font-bold tracking-wider uppercase text-[#C9511F]">
                Flagship Feature · Integrated Mode Switch
              </p>
              <h2
                className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-[#171A2F] tracking-tight leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                One Switch Into{' '}
                <span className="text-[#D95B26]">Pocket Lab 3D, AR &amp; VR</span>
              </h2>
              <p className="text-sm sm:text-base text-[#555B6E] leading-relaxed max-w-xl">
                Once signed in, flip the built-in Pocket Lab switch right from your main workspace
                to explore 24 walkable 3D Physics, Chemistry, and Biology benches, launch Stereo
                WebXR VR or Camera AR, and generate live 3D NCERT concept simulations.
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3.5 pt-1">
                <PocketLabSwitch
                  isPocketLab={false}
                  onToggle={(next) => {
                    if (next) onOpenAuth('student', 'login', 'pocket_lab');
                  }}
                  size="hero"
                />

                <button
                  type="button"
                  data-testid="landing-open-pocket-lab-auth-btn"
                  onClick={() => onOpenAuth('student', 'login', 'pocket_lab')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#242736] hover:bg-[#171A2F] text-white text-sm font-semibold transition-colors cursor-pointer min-h-[48px] whitespace-nowrap"
                >
                  <span>Sign In to Open Pocket Lab</span>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#1E2233] text-white p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-['Outfit'] text-base font-bold">
                    Inside Pocket Lab
                  </span>
                  <span className="text-xs font-mono-tabular text-[#F49A3C] font-semibold">
                    24 Live Benches
                  </span>
                </div>

                <ul className="space-y-3.5 text-sm text-white/90">
                  <li className="flex items-start gap-3">
                    <Box className="w-4 h-4 text-[#F49A3C] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Walkable 3D Physics, Chemistry &amp; Biology lab rooms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Glasses className="w-4 h-4 text-[#54BC98] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>3rd-person, 1st-person, Orbit, WebXR VR &amp; Camera AR views</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-[#8DA2FB] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>AI NCERT 3D concept generator with EN, ಕನ್ನಡ &amp; हिन्दी voice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Layers className="w-4 h-4 text-[#F49A3C] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Seamless one-click switch back to NCERT chapters anytime</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "What's Included" Informational Cards (Subtle Dotted Background) */}
      <section
        id="features"
        className="py-16 sm:py-24 bg-[#F6F4F1] border-b border-[#E9E2DA]"
        style={{
          backgroundImage: 'radial-gradient(rgba(23,26,47,0.11) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="max-w-2xl space-y-2.5">
            <p className="text-xs font-bold tracking-wider uppercase text-[#C9511F]">
              All You Need to Understand Physics
            </p>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-[#171A2F] tracking-tight">
              What&apos;s Included in Pocket Lab?
            </h2>
            <p className="text-sm sm:text-base text-[#555B6E] leading-relaxed">
              Every tool lives in its own dedicated workspace after sign-in—so students and
              teachers can focus without distraction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl bg-white border border-[#E8E2DA] p-6 sm:p-7 shadow-[0_6px_20px_-14px_rgba(23,26,47,0.18)] space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FDF5EF] border border-[#F5E1D3] flex items-center justify-center text-[#171A2F]">
                    <Icon className="w-5 h-5 text-[#D95B26]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#171A2F]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#555B6E] leading-relaxed">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. How It Works & Curriculum Standards (Clean White Editorial Band) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* 3-Step Flow */}
          <div className="space-y-8">
            <div className="max-w-2xl space-y-2.5">
              <p className="text-xs font-bold tracking-wider uppercase text-[#C9511F]">
                Clean, Separated Workflow
              </p>
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-[#171A2F] tracking-tight">
                Simple Structure. Focused Workspaces.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WORKFLOW_STEPS.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl bg-[#FAF8F5] border border-[#ECE5DD] p-6 space-y-2.5"
                >
                  <span className="font-mono-tabular text-xs font-bold text-[#D95B26]">
                    {item.step}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#171A2F]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#555B6E] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Standards Checklist (Inspired by Reference Screenshot 5) */}
          <div
            id="curriculum"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-8 border-t border-[#EFE9E2]"
          >
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-bold tracking-wider uppercase text-[#C9511F]">
                Curriculum Standards
              </p>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-[#171A2F] tracking-tight">
                Built around NCERT &amp; Curiosity textbooks from Class 6 through Class 10.
              </h2>
              <p className="text-sm sm:text-base text-[#555B6E] leading-relaxed">
                From exploring magnets and simple circuits in middle school to Ohm&apos;s Law,
                ray optics, and electromagnetism in Class 10, every concept maps directly to real
                physics laws.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {PLATFORM_STANDARDS.map((std) => {
                const Icon = std.icon;
                return (
                  <div
                    key={std.label}
                    className="flex items-start gap-3 py-2 border-b border-[#F2ECE5]"
                  >
                    <Icon className="w-4 h-4 text-[#171A2F] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-[#2A2E42]">{std.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bold Accent Call-to-Action Section (Inspired by Reference Screenshot 4) */}
      <section
        className="py-16 sm:py-24 bg-[#D25728] text-white"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Start Exploring Physics Today
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-lg">
                Create a free Student or Teacher account in seconds to enter your personalized
                workspace—with every chapter, interactive lab, textbook scanner, and daily
                challenge neatly organized.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenAuth('student', 'register')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#FAF7F4] text-[#171A2F] text-sm font-semibold transition-colors cursor-pointer min-h-[46px] whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-[#D25728]" />
                  <span>Create Free Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('student', 'login')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#232635] hover:bg-[#171A2F] text-white text-sm font-semibold transition-colors cursor-pointer min-h-[46px] whitespace-nowrap"
                >
                  <span>Sign In to Workspace</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#232635] border border-white/10 p-6 space-y-3.5 shadow-xl">
                {PRO_HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 text-sm text-white/90">
                      <Icon className="w-4 h-4 text-[#F49A3C] shrink-0 mt-0.5" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
