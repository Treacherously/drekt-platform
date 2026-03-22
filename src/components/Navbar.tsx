'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const role = (session?.user as any)?.role as string | undefined;
  const isLoading = status === 'loading';

  useEffect(() => setMounted(true), []);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/full.logo.png" alt="DREKT" className="h-8 w-auto" />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/suppliers" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
              Find Businesses
            </a>
            <a href="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
              DrektSTATS
            </a>
            <a href="/register" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
              List Your Business
            </a>
            <a href="/pricing" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
              Pricing
            </a>
          </div>

          {/* CTA + Dark Mode Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle dark mode"
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>
            )}

            {isLoading ? (
              <div className="w-20 h-8 rounded-md bg-gray-200 dark:bg-slate-700 animate-pulse" />
            ) : session ? (
              <>
                {role === 'ADMIN' ? (
                  <Link href="/admin" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link href="/dashboard/supplier" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                    My Business
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-primary transition-colors"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <a href="/suppliers" className="block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary py-1">Find Businesses</a>
          <a href="/dashboard" className="block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary py-1">DrektSTATS</a>
          <a href="/register" className="block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary py-1">List Your Business</a>
          <a href="/pricing" className="block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary py-1">Pricing</a>
          <div className="pt-3 border-t border-gray-200 dark:border-slate-800 flex flex-col gap-2">
            {session ? (
              <>
                {role === 'ADMIN' ? (
                  <a href="/admin" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary py-1">Admin Dashboard</a>
                ) : (
                  <a href="/dashboard/supplier" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary py-1">My Business</a>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-primary py-1"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary py-1">Log In</a>
                <a href="/login" className="bg-brand-accent text-white text-sm font-medium px-4 py-2 rounded-md text-center hover:bg-brand-primary transition-colors">
                  Sign Up Free
                </a>
              </>
            )}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-1 flex items-center gap-2"
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
