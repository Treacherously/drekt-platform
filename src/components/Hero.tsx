'use client';

import SearchBar from './SearchBar';

export default function Hero() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900 py-16 md:py-24 border-b border-gray-100 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow label */}
        <p className="text-sm font-medium text-brand-accent dark:text-brand-primary uppercase tracking-widest mb-4">
          The Philippine B2B Directory
        </p>

        {/* Headline */}
        <h1 className="font-heading font-bold text-4xl md:text-5xl text-brand-accent dark:text-white leading-tight mb-4">
          Find Verified B2B Suppliers<br className="hidden md:block" /> in the Philippines
        </h1>

        {/* Sub-headline */}
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Connect directly with manufacturers, distributors, and farms across
          every region — no middlemen, no guesswork.
        </p>

        {/* Search bar */}
        <SearchBar />

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            80+ verified businesses
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Multiple regions covered
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free to search
          </span>
        </div>
      </div>
    </section>
  );
}
