import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Database,
  GraduationCap,
  KeyRound,
  Lock,
  LogIn,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  UserPlus,
  Users,
} from 'lucide-react';
import type {
  GradeClassLevel,
  LocalDemoAccountSummary,
  UserProfile,
  UserRole,
} from '../types/physics';
import { CLASS_LEVELS } from '../data/ncertCurriculum';
import {
  deleteLocalDemoAccount,
  listLocalDemoAccounts,
  registerLocalAccount,
  signInLocalAccount,
} from '../services/localAuthDb';

interface AuthPortalViewProps {
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
  onAuthenticated: (profile: UserProfile) => void | Promise<void>;
  onCancel?: () => void;
}

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  initialRole = 'student',
  initialMode = 'login',
  onAuthenticated,
  onCancel,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Shared / Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Create Account fields
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Required explicit selection for students (null until chosen)
  const [selectedClass, setSelectedClass] = useState<GradeClassLevel | null>(null);
  const [schoolOrSubject, setSchoolOrSubject] = useState('');

  // Saved Local Demo Accounts
  const [savedAccounts, setSavedAccounts] = useState<LocalDemoAccountSummary[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const loadAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const list = await listLocalDemoAccounts();
      setSavedAccounts(list);
    } catch {
      setSavedAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const isTeacher = mode === 'register' && selectedRole === 'teacher';
  const accentBg = isTeacher
    ? 'bg-[#171A2F] hover:bg-[#E5882A]'
    : 'bg-[#F49A3C] hover:bg-[#E5882A]';
  const accentText = 'text-[#C96D12]';

  const handleModeSwitch = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
    setInfoMessage(null);
    setPassword('');
    setConfirmPassword('');
    if (nextMode === 'register') {
      setSelectedClass(null);
    }
  };

  const handleSelectSavedAccount = (account: LocalDemoAccountSummary) => {
    setMode('login');
    setUsername(account.username);
    setPassword('');
    setErrorMessage(null);
    setInfoMessage(
      `Selected @${account.username} (${account.name}). Enter password to sign in.`
    );
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 40);
  };

  const handleDeleteSavedAccount = async (uid: string, accountUsername: string) => {
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await deleteLocalDemoAccount(uid);
      setConfirmDeleteUid(null);
      if (username.trim().toLowerCase() === accountUsername.toLowerCase()) {
        setUsername('');
        setPassword('');
      }
      await loadAccounts();
      setInfoMessage(`Removed local demo account @${accountUsername} from this browser.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to remove demo account.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setErrorMessage('Please enter your full name (at least 2 characters).');
        return;
      }
      if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username.trim())) {
        setErrorMessage(
          'Username must be 3–32 characters using letters, numbers, underscores, dots, or hyphens.'
        );
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (selectedRole === 'student' && selectedClass === null) {
        setErrorMessage('Please select your NCERT Class (6, 7, 8, 9, or 10) before continuing.');
        return;
      }

      setSubmitting(true);
      try {
        const profile = await registerLocalAccount({
          name,
          username,
          password,
          confirmPassword,
          role: selectedRole,
          selectedClass: selectedRole === 'student' ? selectedClass : null,
          schoolOrSubject: schoolOrSubject.trim() || undefined,
        });
        await onAuthenticated(profile);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to create account.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Local Sign-In Mode
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const profile = await signInLocalAccount({
        username,
        password,
      });
      await onAuthenticated(profile);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Honest Browser-Local Demo Mode Banner */}
      <div className="rounded-2xl bg-white border border-[#EFE7DF] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FFF3E3] text-[#C96D12] flex items-center justify-center shrink-0 mt-0.5">
            <Database className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[#C96D12] uppercase tracking-wide">
              Browser-Local Demo Mode (IndexedDB)
            </p>
            <p className="text-xs sm:text-sm text-[#6F7487]">
              Create multiple Student (Classes 6–10) and Teacher accounts locally with salted PBKDF2
              password hashing. Accounts persist on this browser across refreshes and do not require
              external login or cloud sync.
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Class 6–10 Library</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Auth Form (Sign In / Create Account) */}
        <div className="lg:col-span-7 clay-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFE7DF] pb-4">
            <div className="space-y-0.5">
              <span className={`text-xs font-semibold ${accentText}`}>
                {mode === 'login'
                  ? 'Pocket Lab Local Portal'
                  : isTeacher
                    ? 'New Educator Account'
                    : 'New Learner Account'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#171A2F]">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h1>
            </div>

            {/* Clear Two-Option Switcher: Sign In | Create Account */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="inline-flex items-center rounded-lg bg-[#F3EAE1]/70 p-1 border border-[#EFE7DF]"
            >
              <button
                type="button"
                role="tab"
                data-testid="auth-tab-signin"
                aria-selected={mode === 'login'}
                onClick={() => handleModeSwitch('login')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap min-h-[38px] ${
                  mode === 'login'
                    ? 'bg-[#F49A3C] text-white'
                    : 'text-[#171A2F] hover:bg-white/70'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                role="tab"
                data-testid="auth-tab-register"
                aria-selected={mode === 'register'}
                onClick={() => handleModeSwitch('register')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap min-h-[38px] ${
                  mode === 'register'
                    ? `${selectedRole === 'teacher' ? 'bg-[#171A2F]' : 'bg-[#F49A3C]'} text-white`
                    : 'text-[#171A2F] hover:bg-white/70'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Account Type Selector in Create Account mode */}
            {mode === 'register' && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#171A2F] block">Account Type</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-testid="register-role-student"
                    onClick={() => {
                      setSelectedRole('student');
                      setErrorMessage(null);
                    }}
                    className={`text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                      selectedRole === 'student'
                        ? 'bg-[#FFF3E3]/60 border-[#F49A3C] ring-1 ring-[#F49A3C]'
                        : 'bg-[#FFF9F4] border-[#EFE7DF] hover:border-[#F49A3C]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-sm text-[#171A2F]">
                        <GraduationCap className="w-4 h-4 text-[#C96D12]" />
                        <span>Student</span>
                      </div>
                      {selectedRole === 'student' && (
                        <CheckCircle2 className="w-4 h-4 text-[#C96D12]" />
                      )}
                    </div>
                    <p className="text-xs text-[#6F7487]">
                      Class 6–10 library, labs, &amp; personal progress
                    </p>
                  </button>

                  <button
                    type="button"
                    data-testid="register-role-teacher"
                    onClick={() => {
                      setSelectedRole('teacher');
                      setSelectedClass(null);
                      setErrorMessage(null);
                    }}
                    className={`text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                      selectedRole === 'teacher'
                        ? 'bg-[#FFF3E3]/75 border-[#171A2F] ring-1 ring-[#171A2F]'
                        : 'bg-[#FFF9F4] border-[#EFE7DF] hover:border-[#F49A3C]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-sm text-[#171A2F]">
                        <Users className="w-4 h-4 text-[#C96D12]" />
                        <span>Teacher</span>
                      </div>
                      {selectedRole === 'teacher' && (
                        <CheckCircle2 className="w-4 h-4 text-[#C96D12]" />
                      )}
                    </div>
                    <p className="text-xs text-[#6F7487]">
                      Manage classrooms &amp; track enrolled students
                    </p>
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-[#171A2F]">Full Name</span>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#6F7487] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={100}
                    data-testid="auth-fullname-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTeacher ? 'e.g., Asha Rao' : 'e.g., Ryan Verma'}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
                  />
                </div>
              </label>
            )}

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#171A2F]">Username</span>
              <div className="relative">
                <span className="text-xs font-mono font-semibold text-[#6F7487] absolute left-3.5 top-1/2 -translate-y-1/2">
                  @
                </span>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  maxLength={32}
                  data-testid="auth-username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., ryan_7 or teacher_asha"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
                />
              </div>
              {mode === 'register' && (
                <p className="text-[11px] text-[#6F7487]">
                  3–32 characters (letters, numbers, _, ., -). Must be unique.
                </p>
              )}
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#171A2F]">Password</span>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6F7487] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={passwordInputRef}
                  type="password"
                  required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  data-testid="auth-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
                />
              </div>
            </label>

            {mode === 'register' && (
              <>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-[#171A2F]">Confirm Password</span>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#6F7487] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      data-testid="auth-confirm-password-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
                    />
                  </div>
                </label>

                {selectedRole === 'student' ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#171A2F]">
                        Select Your NCERT Class (Required)
                      </span>
                      <span className="text-[11px] font-medium text-[#6F7487]">
                        {selectedClass ? `Class ${selectedClass} selected` : 'Choose Class 6–10'}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2" role="group" aria-label="Student class selection">
                      {CLASS_LEVELS.map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          data-testid={`register-class-${cls}`}
                          onClick={() => {
                            setSelectedClass(cls);
                            setErrorMessage(null);
                          }}
                          className={`py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors min-h-[42px] ${
                            selectedClass === cls
                              ? 'bg-[#F49A3C] border-[#F49A3C] text-white'
                              : 'bg-[#FFF9F4] border-[#EFE7DF] text-[#171A2F] hover:border-[#F49A3C]'
                          }`}
                        >
                          Class {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-[#171A2F]">
                      School or Subject Focus (Optional)
                    </span>
                    <input
                      type="text"
                      maxLength={120}
                      value={schoolOrSubject}
                      onChange={(e) => setSchoolOrSubject(e.target.value)}
                      placeholder="e.g., Kendriya Vidyalaya · Classes 6–10 Physics"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#EFE7DF] bg-[#FFF9F4] text-sm text-[#171A2F] focus:outline-none focus:border-[#F49A3C]"
                    />
                  </label>
                )}
              </>
            )}

            {errorMessage && (
              <div
                role="alert"
                data-testid="auth-error-banner"
                className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#E7B5AF] text-xs sm:text-sm text-[#7A271A] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3.5 rounded-xl bg-[#FFF3E3]/65 border border-[#EFE7DF] text-xs sm:text-sm text-[#171A2F] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C96D12] shrink-0 mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-testid="auth-submit-btn"
              className={`w-full py-3 px-5 rounded-lg text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 min-h-[44px] ${accentBg}`}
            >
              {submitting
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign In'
                  : selectedRole === 'teacher'
                    ? 'Create Teacher Account'
                    : 'Create Student Account'}
            </button>
          </form>
        </div>

        {/* Right Column: Local Demo Account Switcher & Role Isolation Info */}
        <div className="lg:col-span-5 space-y-5">
          <section className="clay-card p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#EFE7DF] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#171A2F]">Saved Local Accounts</h2>
                <p className="text-xs text-[#6F7487]">
                  Select any account to pre-fill username (password still required)
                </p>
              </div>
              <span className="font-mono-tabular text-xs font-semibold text-[#C96D12]">
                {savedAccounts.length} saved
              </span>
            </div>

            {loadingAccounts ? (
              <p className="text-xs text-[#6F7487] py-4">Loading saved local accounts...</p>
            ) : savedAccounts.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FFF9F4] border border-[#EFE7DF] space-y-2">
                <p className="text-xs font-semibold text-[#171A2F]">No local accounts created yet</p>
                <p className="text-xs text-[#6F7487] leading-relaxed">
                  Use <strong>Create Account</strong> to register students in any class (6–10) and
                  teacher accounts. Multiple students per class and multiple teachers are supported.
                </p>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C96D12] hover:underline cursor-pointer pt-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create your first account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {savedAccounts.map((acc) => {
                  const isTeacherAccount = acc.role === 'teacher';
                  const isSelectedForLogin =
                    mode === 'login' &&
                    username.trim().toLowerCase() === acc.username.toLowerCase();

                  return (
                    <div
                      key={acc.uid}
                      className={`rounded-xl border p-3.5 transition-colors space-y-2 ${
                        isSelectedForLogin
                          ? 'bg-[#FFF3E3]/65 border-[#F49A3C]'
                          : 'bg-[#FFF9F4] border-[#EFE7DF] hover:border-[#F49A3C]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          data-testid={`saved-account-${acc.username}`}
                          onClick={() => handleSelectSavedAccount(acc)}
                          className="flex-1 text-left cursor-pointer space-y-0.5 min-w-0"
                        >
                          <div className="flex items-center gap-2">
                            {isTeacherAccount ? (
                              <Users className="w-3.5 h-3.5 text-[#C96D12] shrink-0" />
                            ) : (
                              <GraduationCap className="w-3.5 h-3.5 text-[#C96D12] shrink-0" />
                            )}
                            <span className="text-sm font-semibold text-[#171A2F] truncate">
                              {acc.name}
                            </span>
                          </div>
                          <p className="text-xs text-[#6F7487] truncate">
                            <span className="font-mono text-[#171A2F]">@{acc.username}</span>
                            <span aria-hidden="true"> · </span>
                            <span className="text-[#C96D12] font-medium">
                              {isTeacherAccount
                                ? 'Teacher'
                                : `Student · Class ${acc.selectedClass ?? 6}`}
                            </span>
                          </p>
                        </button>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSelectSavedAccount(acc)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-[#EFE7DF] text-xs font-semibold text-[#171A2F] hover:border-[#F49A3C] cursor-pointer min-h-[34px]"
                          >
                            Use
                          </button>

                          {confirmDeleteUid === acc.uid ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteSavedAccount(acc.uid, acc.username)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#B83A2D] text-white text-xs font-semibold cursor-pointer min-h-[34px]"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUid(acc.uid)}
                              aria-label={`Delete local account @${acc.username}`}
                              className="p-2 rounded-lg text-[#6F7487] hover:text-[#B83A2D] hover:bg-white cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="p-5 rounded-2xl bg-[#F3EAE1]/55 border border-[#EFE7DF] space-y-2 text-xs text-[#6F7487]">
            <div className="flex items-center gap-2 text-[#171A2F] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#C96D12]" />
              <span>Account Isolation &amp; Role Separation</span>
            </div>
            <p className="leading-relaxed">
              Each student and teacher account stores its own profile, selected class, experiment
              completions, assessment history, and textbook scans separately inside IndexedDB.
              Signing into another account never exposes the previous user&apos;s data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
