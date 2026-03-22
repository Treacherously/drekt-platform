'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { EntityType } from '../types/supplier';
import type { GetServerSideProps } from 'next';

const ENTITY_TYPES: { value: EntityType; label: string; description: string }[] = [
  { value: 'MANUFACTURER', label: 'Manufacturer', description: 'Produces goods or processes raw materials' },
  { value: 'LOGISTICS', label: 'Logistics', description: 'Freight, cargo, and delivery services' },
  { value: 'WAREHOUSE', label: 'Warehouse / Cold Chain', description: 'Storage and cold-chain facilities' },
  { value: 'AGRICULTURE', label: 'Agriculture / Farm', description: 'Farms, fisheries, and crop producers' },
  { value: 'DISTRIBUTOR', label: 'Distributor', description: 'Wholesale and distribution networks' },
  { value: 'SUPPLIER', label: 'Raw Materials Supplier', description: 'Supplies inputs and raw ingredients' },
];

const INDUSTRIES = [
  'Food & Beverage', 'Agriculture & Farming', 'Packaging', 'Chemicals',
  'Logistics & Freight', 'Warehousing & Storage', 'Textiles & Apparel',
  'Construction Materials', 'Pharmaceuticals', 'Electronics', 'Retail & Distribution', 'Other',
];

interface FormData {
  businessName: string;
  entityType: EntityType[];
  industry: string;
  location: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  productCategory: string;
}

const EMPTY_FORM: FormData = {
  businessName: '',
  entityType: [],
  industry: '',
  location: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
  productCategory: '',
};

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function RegisterBusiness() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleEntityType = (value: EntityType) => {
    setForm((prev) => ({
      ...prev,
      entityType: prev.entityType.includes(value)
        ? prev.entityType.filter((t) => t !== value)
        : [...prev.entityType, value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.industry || !form.location.trim()) return;
    if (form.entityType.length === 0) {
      setErrorMessage('Please select at least one entity type.');
      return;
    }

    setSubmitState('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: 'PENDING',
          isVerified: false,
          inventory: [],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitState('success');
      } else {
        setErrorMessage(json.message ?? 'Submission failed. Please try again.');
        setSubmitState('error');
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setSubmitState('error');
    }
  };

  if (submitState === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-slate-700 p-12 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-2">You&apos;re in the network!</h2>
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-semibold text-gray-700">{form.businessName}</span> has been submitted.
            </p>
            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Your listing is currently <span className="font-medium text-yellow-600">Pending Review</span>. 
              Our team will verify and publish it within 1–2 business days.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/suppliers')}
                className="bg-brand-accent text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-primary transition-colors"
              >
                Browse the Directory
              </button>
              <button
                onClick={() => { setForm(EMPTY_FORM); setSubmitState('idle'); }}
                className="text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Register another business
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      <Navbar />

      {/* Hero header */}
      <div className="bg-brand-accent px-6 py-10 text-center">
        <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-2">Join the Network</p>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">
          List Your Business on Drekt
        </h1>
        <p className="text-sm text-white/60 max-w-lg mx-auto">
          Connect with MSME buyers across the Philippines. Registration is free — your listing goes live after a quick review.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex justify-center px-6 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">

          {/* Section 1: Identity */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <h2 className="font-heading font-semibold text-sm text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                1 · Business Identity
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                  Business / Organization Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={set('businessName')}
                  placeholder="e.g. Marikina Leather Goods Co."
                  required
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    Industry / Sector <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.industry}
                    onChange={set('industry')}
                    required
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                  >
                    <option value="">Select industry…</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                    Product / Service Category
                  </label>
                  <input
                    type="text"
                    value={form.productCategory}
                    onChange={set('productCategory')}
                    placeholder="e.g. Leather Footwear, Cold Storage"
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                  City / Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={set('location')}
                  placeholder="e.g. Marikina City, Metro Manila"
                  required
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                  Business Description
                </label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Briefly describe what your business offers, your specialization, or key certifications…"
                  rows={3}
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Entity Type */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <h2 className="font-heading font-semibold text-sm text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                2 · Entity Type <span className="text-red-400">*</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Select all that apply to your business.</p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ENTITY_TYPES.map(({ value, label, description }) => {
                const checked = form.entityType.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleEntityType(value)}
                    className={`text-left flex items-start gap-3 p-3.5 rounded-lg border-2 transition-all ${
                      checked
                        ? 'border-brand-accent bg-brand-accent/5 dark:bg-brand-accent/10'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      checked ? 'bg-brand-accent text-white' : 'border-2 border-gray-300'
                    }`}>
                      {checked && <CheckIcon />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${checked ? 'text-brand-accent' : 'text-gray-800 dark:text-slate-200'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Contact */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <h2 className="font-heading font-semibold text-sm text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                3 · Contact Information
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={set('contactEmail')}
                  placeholder="contact@yourbusiness.com"
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={set('contactPhone')}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {submitState === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 pb-10">
            <p className="text-xs text-gray-400">
              <span className="text-red-400">*</span> Required fields. Your listing will be reviewed before going live.
            </p>
            <button
              type="submit"
              disabled={submitState === 'loading'}
              className="bg-brand-accent text-white text-sm font-semibold px-8 py-3 rounded-lg hover:bg-brand-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
            >
              {submitState === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
