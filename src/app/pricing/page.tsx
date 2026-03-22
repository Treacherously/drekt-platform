'use client';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Check, X, Zap, Leaf } from 'lucide-react';

interface Feature {
  label: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: Feature[] = [
  { label: 'Basic supplier search & directory', free: true, premium: true },
  { label: 'Agri-RESCUE surplus alerts', free: true, premium: true },
  { label: 'View business name & location', free: true, premium: true },
  { label: 'Full contact information (email & phone)', free: false, premium: true },
  { label: 'Unlimited profile views', free: false, premium: true },
  { label: 'DrektSTATS — analytics dashboard', free: false, premium: true },
  { label: 'DrektVISION — logistics & weather map', free: false, premium: true },
  { label: 'Priority listing badge in directory', free: false, premium: true },
  { label: 'Agri-RESCUE full exchange access', free: false, premium: true },
  { label: 'Dedicated account support', free: false, premium: true },
];

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
      {included ? (
        <Check className="w-4 h-4 text-brand-accent dark:text-brand-primary flex-shrink-0 mt-0.5" />
      ) : (
        <X className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
      )}
      <span className={`text-sm leading-snug ${included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
        {label}
      </span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212]">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-700 px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold text-brand-accent dark:text-brand-primary uppercase tracking-widest mb-4">
            Simple, transparent pricing
          </p>
          <h1 className="font-heading font-bold text-4xl text-gray-900 dark:text-white mb-3">
            Start for free.<br /> Scale when you&apos;re ready.
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
            Every Philippine business deserves access to the supply chain. Our free tier covers the basics — upgrade to unlock the full DREKT intelligence suite.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="flex-1 px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* ── FREE Card ── */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col h-full shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-heading font-bold text-lg text-gray-900 dark:text-white">Free</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Forever, no credit card</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="font-heading font-bold text-4xl text-gray-900 dark:text-white">₱0</span>
              <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">/ month</span>
            </div>

            <Link
              href="/register"
              className="block w-full text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 px-5 py-3 rounded-xl transition-colors mb-8"
            >
              Get Started Free
            </Link>

            <ul className="flex-1 space-y-0">
              {FEATURES.map((f) => (
                <FeatureRow key={f.label} label={f.label} included={f.free} />
              ))}
            </ul>
          </div>

          {/* ── PREMIUM Card ── */}
          <div className="relative bg-white dark:bg-[#1a1a1a] border-2 border-brand-accent dark:border-brand-primary rounded-2xl p-8 flex flex-col h-full shadow-lg">
            {/* Most popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-brand-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6 mt-2">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/10 dark:bg-brand-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-accent dark:text-brand-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-lg text-gray-900 dark:text-white">Premium</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Full access, cancel anytime</p>
              </div>
            </div>

            <div className="mb-6">
              <span className="font-heading font-bold text-4xl text-gray-900 dark:text-white">₱600</span>
              <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">/ month</span>
            </div>

            <Link
              href="/login"
              className="block w-full text-center text-sm font-semibold text-white bg-brand-accent hover:opacity-90 px-5 py-3 rounded-xl transition-opacity mb-8 shadow-sm"
            >
              Start Premium
            </Link>

            <ul className="flex-1 space-y-0">
              {FEATURES.map((f) => (
                <FeatureRow key={f.label} label={f.label} included={f.premium} />
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ strip */}
      <section className="bg-gray-50 dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-gray-700 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-6 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I switch plans anytime?', a: 'Yes. Upgrade or downgrade at any time — changes apply at the start of your next billing cycle.' },
              { q: 'Is Agri-RESCUE available on the free plan?', a: 'You get early surplus alerts on the free plan. Full exchange access (posting surplus, claiming products) requires Premium.' },
              { q: 'How is payment processed?', a: 'We accept GCash, Maya, and major credit/debit cards. All payments are secured with TLS encryption.' },
              { q: 'Is there a trial for Premium?', a: 'Yes — new accounts get a 14-day Premium trial, no credit card required.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{q}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
