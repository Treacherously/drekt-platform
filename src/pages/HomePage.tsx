'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import SearchBar from '../components/SearchBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import type { GetServerSideProps } from 'next';

interface SurplusTick {
  _id: string;
  productName: string;
  quantity: number;
  unit: string;
  ownerLocation: string;
  createdAt: string;
  isFree: boolean;
}

const FALLBACK_TICKS: SurplusTick[] = [
  { _id: '1', productName: 'Tomatoes', quantity: 500, unit: 'kg', ownerLocation: 'Benguet', createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), isFree: false },
  { _id: '2', productName: 'Overripe Bananas', quantity: 200, unit: 'kg', ownerLocation: 'Davao del Sur', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), isFree: true },
  { _id: '3', productName: 'B-Grade Mangoes', quantity: 350, unit: 'kg', ownerLocation: 'Zambales', createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), isFree: false },
];

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

const INDUSTRIES = [
  { label: 'Packaging', icon: '📦', description: 'Bottles, bags, labels & more' },
  { label: 'Agriculture', icon: '🌾', description: 'Farms, mills & raw crops' },
  { label: 'Textiles', icon: '🧵', description: 'Fabrics, yarns & fibres' },
  { label: 'Food & Beverage', icon: '🍽️', description: 'Manufacturers & processors' },
  { label: 'Chemicals', icon: '🧪', description: 'Industrial & specialty chemicals' },
  { label: 'Logistics', icon: '🚛', description: 'Cold chain, freight & 3PL' },
  { label: 'Manufacturing', icon: '🏭', description: 'OEM, contract & light mfg.' },
  { label: 'Glass & Plastics', icon: '🫙', description: 'Containers, sheets & profiles' },
];

const STATS = [
  { value: '80+', label: 'Verified Businesses' },
  { value: '15+', label: 'Industries Covered' },
  { value: '10+', label: 'Regions in PH' },
  { value: '100%', label: 'Free to Search' },
];

export default function HomePage() {
  const router = useRouter();
  const [ticks, setTicks] = useState<SurplusTick[]>(FALLBACK_TICKS);
  const [tickIdx, setTickIdx] = useState(0);
  const [tickVisible, setTickVisible] = useState(true);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/surplus/latest')
      .then((r) => r.json())
      .then((json) => { if (json.success && json.data?.length > 0) setTicks(json.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (ticks.length <= 1) return;
    tickTimer.current = setInterval(() => {
      setTickVisible(false);
      setTimeout(() => {
        setTickIdx((i) => (i + 1) % ticks.length);
        setTickVisible(true);
      }, 350);
    }, 4000);
    return () => { if (tickTimer.current) clearInterval(tickTimer.current); };
  }, [ticks]);

  const handleSearch = (query: string, location: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location.trim()) params.set('loc', location.trim());
    router.push(`/suppliers${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleIndustryClick = (label: string) => {
    router.push(`/suppliers?q=${encodeURIComponent(label)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero — clean slate */}
      <section className="bg-slate-50 dark:bg-slate-900 flex-shrink-0 px-6 py-20 md:py-28 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <p className="text-sm font-semibold text-brand-accent dark:text-brand-primary uppercase tracking-widest mb-5">
            The Philippine B2B Directory
          </p>

          {/* Headline */}
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-brand-accent dark:text-white leading-tight mb-4">
            Find the right supplier<br className="hidden sm:block" /> for your business
          </h1>

          {/* Sub-headline */}
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Connect with verified Philippine manufacturers, farms, and distributors — no middlemen, no guesswork.
          </p>

          {/* Search bar */}
          <SearchBar onSearch={handleSearch} />

          {/* Popular searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-400 mr-1">Popular:</span>
            {['PET Bottles', 'Rice', 'Corrugated Boxes', 'Coconut Oil', 'Cold Chain'].map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term, '')}
                className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 hover:border-gray-300 rounded-full px-3 py-1 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-heading font-bold text-2xl text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Agri-RESCUE Section ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

              {/* Left — headline + description */}
              <div className="px-8 py-10 lg:border-r border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌾</span>
                  <span className="text-xs font-bold text-brand-accent dark:text-brand-primary bg-brand-accent/10 dark:bg-brand-primary/10 border border-brand-accent/20 dark:border-brand-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    Agri-RESCUE
                  </span>
                </div>
                <h2 className="font-heading font-bold text-2xl text-gray-900 leading-tight mb-3">
                  Zero Waste<br />Agricultural Exchange
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  Don&apos;t let the harvest go to waste. Connect overripe, surplus, and B-grade produce directly with processors who turn it into fertilizer, animal feed, and biomass — before it ends up in a landfill.
                </p>

                {/* Live Alerts ticker */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse inline-block" />
                    <span className="text-xs font-bold text-brand-accent dark:text-brand-primary uppercase tracking-wide">Live Surplus Alerts</span>
                  </div>
                  {ticks.length > 0 ? (
                    <div
                      key={tickIdx}
                      style={{ transition: 'opacity 0.35s', opacity: tickVisible ? 1 : 0 }}
                      className="flex items-center justify-between gap-3"
                    >
                      <p className="text-sm text-gray-800 font-medium truncate">
                        <span className="text-brand-accent dark:text-brand-primary font-semibold">{ticks[tickIdx].quantity}{ticks[tickIdx].unit}</span>
                        {' '}{ticks[tickIdx].productName}
                        {' '}<span className="text-gray-400 font-normal">in {ticks[tickIdx].ownerLocation}</span>
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(ticks[tickIdx].createdAt)}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No surplus listed yet — be the first!</p>
                  )}
                  {ticks.length > 1 && (
                    <div className="flex gap-1 mt-2">
                      {ticks.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setTickIdx(i); setTickVisible(true); }}
                          className={`h-1 rounded-full transition-all ${i === tickIdx ? 'bg-brand-primary w-4' : 'bg-brand-primary/30 w-1.5'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right — quick-action buttons */}
              <div className="px-8 py-10 flex flex-col justify-center gap-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quick Actions</p>

                <Link
                  href="/login"
                  className="flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 hover:border-brand-primary rounded-xl px-5 py-4 transition-all group hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-brand-primary/20 transition-colors">
                    📢
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
                      Report Surplus
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Farmers — post your unsold produce
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-primary ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/login"
                  className="flex items-center gap-4 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 hover:border-brand-primary rounded-xl px-5 py-4 transition-all group hover:shadow-md"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-brand-primary/20 transition-colors">
                    🚛
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
                      Rescue Products
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Processors — browse available surplus
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-primary ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <p className="text-xs text-gray-400 text-center mt-1">
                  Already have an account?{' '}
                  <Link href="/login" className="text-brand-accent dark:text-brand-primary hover:underline font-medium">Log in</Link>
                  {' '}to access the full exchange.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Industries */}
      <section className="flex-1 bg-gray-50 px-6 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-gray-900">Explore Top Industries</h2>
            <p className="text-sm text-gray-500 mt-1">Browse suppliers by sector — click any card to see results instantly.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry.label}
                onClick={() => handleIndustryClick(industry.label)}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-5 text-left hover:border-brand-primary hover:shadow-md transition-all group"
              >
                <span className="text-2xl mb-3 block">{industry.icon}</span>
                <p className="font-heading font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors mb-1">
                  {industry.label}
                </p>
                <p className="text-xs text-gray-400 leading-snug">{industry.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-white border-t border-gray-100 px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-gray-900 mb-3">
            Are you a supplier or manufacturer?
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            List your business on DREKT and get discovered by B2B buyers across the Philippines — for free.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register" className="bg-brand-accent text-white text-sm font-semibold px-6 py-3 rounded-md hover:bg-brand-primary transition-colors">
              List Your Business
            </Link>
            <button className="text-sm font-medium text-gray-700 border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
