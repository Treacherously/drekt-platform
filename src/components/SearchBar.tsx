'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch?: (query: string, location: string) => void;
  initialQuery?: string;
  initialLocation?: string;
}

export default function SearchBar({
  onSearch,
  initialQuery = '',
  initialLocation = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query, location);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch rounded-xl overflow-hidden shadow-2xl"
    >
      {/* What field — 50% */}
      <div className="flex-1 flex items-center bg-white px-5 py-4 gap-3 border-b sm:border-b-0 sm:border-r border-gray-200 min-w-0">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">What</p>
          <input
            type="text"
            placeholder="Describe what you're looking for (product, industry...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        {query && (
          <button type="button" onClick={() => setQuery('')} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Where field — 50% */}
      <div className="flex-1 flex items-center bg-white px-5 py-4 gap-3 min-w-0">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Where</p>
          <input
            type="text"
            placeholder="Enter city or region"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* SEARCH button */}
      <button
        type="submit"
        className="bg-brand-accent text-white font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-brand-primary active:bg-brand-primary/80 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
      >
        Search
      </button>
    </form>
  );
}
