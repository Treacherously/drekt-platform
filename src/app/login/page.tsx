'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Tab = 'login' | 'register';

// ─── Banner helper derived from query params ──────────────────────────────────

function usePageAlert() {
  const params = useSearchParams();
  if (params.get('verified') === 'true') {
    return { type: 'success' as const, message: 'Email verified! You can now sign in.' };
  }
  const error = params.get('error');
  if (error === 'expired-token') {
    return { type: 'error' as const, message: 'Verification link has expired. Please register again.' };
  }
  if (error === 'invalid-token') {
    return { type: 'error' as const, message: 'Invalid verification link. Please try again.' };
  }
  if (error === 'server-error') {
    return { type: 'error' as const, message: 'Something went wrong. Please try again.' };
  }
  return null;
}

// ─── Inner page (uses useSearchParams — must be inside <Suspense>) ────────────

function LoginPageInner() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  const pageAlert = usePageAlert();

  // ── Login state ────────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // ── Register state ─────────────────────────────────────────────────────────
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regRole, setRegRole] = useState<'SUPPLIER' | 'ADMIN'>('SUPPLIER');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email: loginEmail.trim(),
      password: loginPassword,
    });

    setLoginLoading(false);

    if (result?.error) {
      const msg = result.error === 'CredentialsSignin'
        ? 'Incorrect email or password.'
        : result.error;
      setLoginError(msg);
      return;
    }

    const res = await fetch('/api/auth/session');
    const session = await res.json();
    const role = session?.user?.role;

    if (role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/suppliers');
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    await signIn('credentials', {
      email: 'guest@drekt.ph',
      password: 'guest',
      callbackUrl: '/dashboard',
    });
    setGuestLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), password: regPassword, role: regRole }),
      });
      const json = await res.json();
      if (json.success) {
        setRegSuccess(json.message ?? 'Account created! Check your email for a verification link.');
        setRegEmail('');
        setRegPassword('');
        setRegConfirm('');
      } else {
        setRegError(json.message ?? 'Registration failed.');
      }
    } catch {
      setRegError('Network error. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fc] dark:bg-slate-950">
      {/* Top bar */}
      <div style={{ backgroundColor: '#001a80' }} className="px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-xl text-white tracking-tight">
          DRE<span className="text-brand-primary">KT</span>
        </Link>
        <Link href="/suppliers" className="text-xs text-white/60 hover:text-white transition-colors">
          ← Browse Directory
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Page-level alert (verified / token error) */}
          {pageAlert && (
            <div className={`mb-4 rounded-lg px-4 py-3 flex items-start gap-2.5 border text-sm ${
              pageAlert.type === 'success'
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-accent'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {pageAlert.type === 'success' ? (
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p>{pageAlert.message}</p>
            </div>
          )}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-none border border-gray-100 dark:border-slate-700 w-full overflow-hidden">
          {/* Tab selector */}
          <div className="flex border-b border-gray-100 dark:border-slate-700">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'text-[#001a80] dark:text-brand-primary border-b-2 border-[#001a80] dark:border-brand-primary'
                    : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="px-8 py-7">
            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Welcome back</p>
                  <p className="text-xs text-gray-400">Sign in to your DREKT account</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPw ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showLoginPw ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-red-700">{loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#001a80' }}
                >
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
                  <span className="text-xs text-gray-400 dark:text-slate-500">or</span>
                  <div className="flex-1 border-t border-gray-200 dark:border-slate-700" />
                </div>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={guestLoading}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {guestLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  {guestLoading ? 'Loading…' : 'Continue as Guest'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  No account?{' '}
                  <button type="button" onClick={() => setTab('register')} className="text-brand-accent font-medium hover:underline">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white mb-0.5">Create an account</p>
                  <p className="text-xs text-gray-400">Join DREKT to manage your listing</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Account type</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as 'SUPPLIER' | 'ADMIN')}
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors"
                  >
                    <option value="SUPPLIER">Supplier / Business</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPw ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors"
                  />
                </div>

                {regError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-red-700">{regError}</p>
                  </div>
                )}

                {regSuccess && (
                  <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-lg px-3.5 py-2.5 flex items-start gap-2">
                    <svg className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-xs text-brand-accent">{regSuccess}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-brand-accent text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {regLoading ? 'Creating account…' : 'Create Account'}
                </button>

                <p className="text-center text-xs text-gray-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-[#001a80] font-medium hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-gray-300 dark:text-slate-600 border-t border-gray-100 dark:border-slate-800">
        <span>© 2026 Drekt · </span>
        <Link href="/admin" className="hover:text-gray-400 transition-colors">Admin</Link>
        <span> · </span>
        <Link href="/suppliers" className="hover:text-gray-400 transition-colors">Directory</Link>
      </footer>
    </div>
  );
}

// ─── Default export: wrap in Suspense for useSearchParams ────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-950" />}>
      <LoginPageInner />
    </Suspense>
  );
}
