'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SupplierProfile {
  _id: string;
  businessName: string;
  industry: string;
  location: string;
  status: string;
  entityType: string[];
  specialties: string[];
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  logoUrl?: string;
}

interface SurplusListing {
  _id: string;
  ownerName: string;
  ownerLocation: string;
  productName: string;
  quantity: number;
  unit: string;
  condition: string;
  description?: string;
  price: number;
  isFree: boolean;
  isAvailable: boolean;
  createdAt: string;
}

const CONDITIONS = ['Overripe', 'Surplus', 'B-Grade', 'Damaged Packaging', 'Near Expiry', 'Other'] as const;
const EMPTY_SURPLUS = { productName: '', quantity: '', unit: '', condition: '', description: '', price: '', isFree: false };

interface InquirySummary {
  total: number;
  unread: number;
}

export default function SupplierDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'rescue'>('overview');
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [inquiries, setInquiries] = useState<InquirySummary>({ total: 0, unread: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [surplusListings, setSurplusListings] = useState<SurplusListing[]>([]);
  const [surplusRole, setSurplusRole] = useState<'FARMER' | 'PROCESSOR' | null>(null);
  const [surplusLoading, setSurplusLoading] = useState(false);
  const [surplusError, setSurplusError] = useState<string | null>(null);
  const [surplusForm, setSurplusForm] = useState<typeof EMPTY_SURPLUS>({ ...EMPTY_SURPLUS });
  const [surplusSubmitting, setSurplusSubmitting] = useState(false);
  const [surplusToast, setSurplusToast] = useState<string | null>(null);

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoToast, setLogoToast] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role === 'ADMIN') {
        router.push('/admin');
        return;
      }
      if (role === 'GUEST') {
        router.push('/dashboard');
        return;
      }
      loadDashboard();
    }
  }, [status, session]);

  useEffect(() => {
    if (activeTab === 'rescue') loadSurplus();
  }, [activeTab]);

  const loadSurplus = async () => {
    setSurplusLoading(true);
    setSurplusError(null);
    try {
      const res = await fetch('/api/dashboard/supplier/surplus');
      const json = await res.json();
      if (json.success) {
        setSurplusListings(json.data);
        setSurplusRole(json.role);
      } else {
        setSurplusError(json.message ?? 'Failed to load');
      }
    } catch {
      setSurplusError('Network error');
    } finally {
      setSurplusLoading(false);
    }
  };

  const handlePostSurplus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surplusForm.productName.trim() || !surplusForm.quantity || !surplusForm.unit.trim() || !surplusForm.condition) return;
    setSurplusSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/supplier/surplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...surplusForm,
          quantity: Number(surplusForm.quantity),
          price: surplusForm.isFree ? 0 : Number(surplusForm.price || 0),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSurplusListings((prev) => [json.data, ...prev]);
        setSurplusForm({ ...EMPTY_SURPLUS });
        showSurplusToast('Surplus posted to Agri-RESCUE!');
      } else {
        setSurplusError(json.message ?? 'Post failed');
      }
    } catch {
      setSurplusError('Network error');
    } finally {
      setSurplusSubmitting(false);
    }
  };

  const handleToggleAvailable = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/supplier/surplus/${id}`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        setSurplusListings((prev) => prev.map((l) => l._id === id ? { ...l, isAvailable: json.data.isAvailable } : l));
      }
    } catch { /* silent */ }
  };

  const handleDeleteSurplus = async (id: string) => {
    if (!confirm('Remove this surplus listing?')) return;
    try {
      const res = await fetch(`/api/dashboard/supplier/surplus/${id}`, { method: 'DELETE' });
      if ((await res.json()).success) setSurplusListings((prev) => prev.filter((l) => l._id !== id));
    } catch { /* silent */ }
  };

  const showSurplusToast = (msg: string) => {
    setSurplusToast(msg);
    setTimeout(() => setSurplusToast(null), 3000);
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, inquiryRes] = await Promise.all([
        fetch('/api/dashboard/supplier/profile'),
        fetch('/api/dashboard/supplier/inquiries'),
      ]);

      const profileJson = await profileRes.json();
      const inquiryJson = await inquiryRes.json();

      if (profileJson.success) setProfile(profileJson.data);
      if (inquiryJson.success) setInquiries(inquiryJson.data);
    } catch {
      setError('Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const isFarmer = profile?.entityType?.includes('FARMER');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ backgroundColor: '#001a80' }} className="px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="font-heading font-bold text-xl text-white tracking-tight">
              DRE<span className="text-brand-primary">KT</span>
            </Link>
            <p className="text-xs text-white/40 mt-0.5">Supplier Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/suppliers" className="text-xs text-white/60 hover:text-white transition-colors">
              ← Directory
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-xs text-white/60 hover:text-white border border-white/20 rounded px-3 py-1.5 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="max-w-5xl mx-auto px-8 pt-6">
        <div className="flex gap-1 border-b border-gray-200 mb-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('rescue')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'rescue'
                ? 'border-brand-primary text-brand-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🌾 Agri-RESCUE
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'overview' ? (
        <>
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-2xl text-gray-900">
            Welcome back{profile ? `, ${profile.businessName}` : ''}!
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {session?.user?.email} · {profile?.status ?? 'PENDING'}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Inquiries</p>
            <p className="text-3xl font-bold text-gray-900">{inquiries.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Unread</p>
            <p className={`text-3xl font-bold ${inquiries.unread > 0 ? 'text-brand-accent' : 'text-gray-900'}`}>
              {inquiries.unread}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Profile Status</p>
            <span className={`inline-block text-sm font-bold mt-1 px-2.5 py-0.5 rounded-full border ${
              profile?.status === 'FEATURED'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : profile?.status === 'VERIFIED'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {profile?.status ?? 'PENDING'}
            </span>
          </div>
        </div>

        {/* Profile card */}
        {profile ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-heading font-semibold text-base text-gray-900">Business Profile</h2>
              <Link
                href={`/suppliers?q=${encodeURIComponent(profile.businessName)}`}
                className="text-xs text-brand-accent hover:underline font-medium"
              >
                View in Directory →
              </Link>
            </div>
            {/* Logo upload row */}
            <div className="flex items-center gap-5 mb-5 pb-5 border-b border-gray-100">
              <div className="relative flex-shrink-0">
                {(logoPreview || profile.logoUrl) ? (
                  <img
                    src={logoPreview ?? profile.logoUrl}
                    alt="Company logo"
                    className="w-16 h-16 rounded-xl object-contain border border-gray-200 bg-gray-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {logoUploading && (
                  <div className="absolute inset-0 rounded-xl bg-white/70 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-accent animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 mb-0.5">Company Logo</p>
                <p className="text-xs text-gray-400 mb-2">PNG, JPG or WEBP · max 5 MB</p>
                <label className="inline-flex items-center gap-1.5 cursor-pointer bg-white border border-gray-300 hover:border-brand-primary hover:text-brand-accent text-gray-600 text-xs font-medium px-3 py-1.5 rounded-md transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {logoUploading ? 'Uploading…' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    disabled={logoUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoPreview(URL.createObjectURL(file));
                      setLogoUploading(true);
                      try {
                        const fd = new FormData();
                        fd.append('file', file);
                        const up = await fetch('/api/upload', { method: 'POST', body: fd });
                        const upJson = await up.json();
                        if (!upJson.success) throw new Error(upJson.message);
                        const save = await fetch('/api/dashboard/supplier/profile', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ logoUrl: upJson.url }),
                        });
                        const saveJson = await save.json();
                        if (!saveJson.success) throw new Error(saveJson.message);
                        setProfile((p) => p ? { ...p, logoUrl: upJson.url } : p);
                        setLogoToast('Logo updated successfully!');
                        setTimeout(() => setLogoToast(null), 3000);
                      } catch (err: any) {
                        setLogoPreview(null);
                        setLogoToast(`Upload failed: ${err.message}`);
                        setTimeout(() => setLogoToast(null), 4000);
                      } finally {
                        setLogoUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
                {logoToast && (
                  <p className={`text-xs mt-1.5 font-medium ${logoToast.startsWith('Upload failed') ? 'text-red-500' : 'text-brand-accent'}`}>
                    {logoToast}
                  </p>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-xs text-gray-400 font-medium mb-0.5">Business Name</dt>
                <dd className="text-gray-800 font-medium">{profile.businessName}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium mb-0.5">Industry</dt>
                <dd className="text-gray-800">{profile.industry}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium mb-0.5">Location</dt>
                <dd className="text-gray-800">{profile.location}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400 font-medium mb-0.5">Contact Email</dt>
                <dd className="text-gray-800">{profile.contactEmail ?? '—'}</dd>
              </div>
            </dl>
            {profile.description && (
              <p className="mt-4 text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                {profile.description}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 mb-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">No profile linked yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                Your account email doesn't match any business in the directory. Register your business to get linked automatically.
              </p>
            </div>
            <Link
              href="/register"
              className="bg-brand-accent text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-primary transition-colors"
            >
              Register Your Business
            </Link>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/dashboard/supplier/inventory"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-primary hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">Manage Inventory</p>
            <p className="text-xs text-gray-400 mt-0.5">Add your DREKT-exclusive stock</p>
          </Link>

          <Link
            href="/register"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-primary hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">Edit Profile</p>
            <p className="text-xs text-gray-400 mt-0.5">Update your business information</p>
          </Link>

          <Link
            href="/suppliers"
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-primary hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-primary transition-colors">Browse Directory</p>
            <p className="text-xs text-gray-400 mt-0.5">Explore other businesses</p>
          </Link>
        </div>
        </>
      ) : (
        /* ── AGRI-RESCUE TAB ── */
        <div>
          {/* Mission banner */}
          <div className="mb-6 bg-brand-accent/5 border border-brand-accent/20 rounded-xl px-5 py-4 flex gap-4">
            <div className="flex-shrink-0 text-2xl mt-0.5">🌾</div>
            <div>
              <p className="text-sm font-bold text-brand-accent mb-1">Agri-RESCUE: Zero Waste Agricultural Exchange</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isFarmer
                  ? 'Post your unsold or surplus produce and connect with processors who can turn it into fertilizer, animal feed, or biomass instead of letting it go to waste.'
                  : 'Browse surplus produce from local farmers. Source affordable raw materials for fertilizer, animal feed, or biomass processing.'}
              </p>
            </div>
          </div>

          {surplusError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex justify-between">
              {surplusError}
              <button onClick={() => setSurplusError(null)} className="text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {isFarmer ? (
            /* ── FARMER VIEW ── */
            <div>
              {/* Post form */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="font-heading font-semibold text-base text-gray-900 mb-4">+ Post Surplus Product</h2>
                <form onSubmit={handlePostSurplus} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Name</label>
                      <input
                        type="text"
                        value={surplusForm.productName}
                        onChange={(e) => setSurplusForm((f) => ({ ...f, productName: e.target.value }))}
                        required
                        placeholder="e.g. Overripe Bananas"
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Condition</label>
                      <select
                        value={surplusForm.condition}
                        onChange={(e) => setSurplusForm((f) => ({ ...f, condition: e.target.value }))}
                        required
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                      >
                        <option value="">Select condition…</option>
                        {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={surplusForm.quantity}
                        onChange={(e) => setSurplusForm((f) => ({ ...f, quantity: e.target.value }))}
                        required
                        placeholder="0"
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Unit</label>
                      <input
                        type="text"
                        value={surplusForm.unit}
                        onChange={(e) => setSurplusForm((f) => ({ ...f, unit: e.target.value }))}
                        required
                        placeholder="kg / bags / crates"
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Additional Notes (optional)</label>
                    <textarea
                      value={surplusForm.description}
                      onChange={(e) => setSurplusForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      placeholder="Harvest date, pickup instructions, etc."
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={surplusForm.isFree}
                        onChange={(e) => setSurplusForm((f) => ({ ...f, isFree: e.target.checked }))}
                        className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
                      />
                      Offer for FREE (rescue donation)
                    </label>
                    {!surplusForm.isFree && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-600">Price (PHP)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={surplusForm.price}
                          onChange={(e) => setSurplusForm((f) => ({ ...f, price: e.target.value }))}
                          placeholder="0.00"
                          className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={surplusSubmitting}
                    className="bg-brand-accent text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-primary transition-colors disabled:opacity-60"
                  >
                    {surplusSubmitting ? 'Posting…' : '🌾 Post Surplus'}
                  </button>
                </form>
              </div>

              {/* Farmer's own listings */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-heading font-semibold text-base text-gray-900">
                    Your Listings
                    <span className="ml-2 text-sm font-normal text-gray-400">({surplusListings.length})</span>
                  </h2>
                </div>
                {surplusLoading ? (
                  <div className="py-12 flex justify-center text-gray-400 text-sm">Loading…</div>
                ) : surplusListings.length === 0 ? (
                  <div className="py-14 flex flex-col items-center text-center">
                    <p className="text-sm text-gray-500 font-medium">No listings yet</p>
                    <p className="text-xs text-gray-400 mt-1">Post your first surplus product above.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {['Product', 'Qty', 'Condition', 'Price', 'Status', ''].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {surplusListings.map((l) => (
                          <tr key={l._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900">{l.productName}</p>
                              {l.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{l.description}</p>}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm text-gray-700">{l.quantity.toLocaleString()} {l.unit}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-medium bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-2 py-0.5">{l.condition}</span>
                            </td>
                            <td className="px-4 py-3">
                              {l.isFree
                                ? <span className="text-xs font-bold text-brand-primary">FREE</span>
                                : <span className="text-sm text-gray-700">₱{Number(l.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${
                                l.isAvailable
                                  ? 'bg-brand-primary/10 text-brand-accent border-brand-primary/30'
                                  : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}>{l.isAvailable ? 'Available' : 'Claimed'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleAvailable(l._id)}
                                  className="text-xs font-medium px-2.5 py-1 rounded border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors whitespace-nowrap"
                                >
                                  {l.isAvailable ? 'Mark Claimed' : 'Reopen'}
                                </button>
                                <button
                                  onClick={() => handleDeleteSurplus(l._id)}
                                  className="text-xs font-medium px-2.5 py-1 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── PROCESSOR / OTHER VIEW — rescue feed ── */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-base text-gray-900">
                  Available Surplus Near You
                  <span className="ml-2 text-sm font-normal text-gray-400">({surplusListings.filter((l) => l.isAvailable).length} active listings)</span>
                </h2>
                <button
                  onClick={loadSurplus}
                  className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-3 py-1.5 transition-colors"
                >
                  ↻ Refresh
                </button>
              </div>

              {surplusLoading ? (
                <div className="flex justify-center py-16 text-gray-400 text-sm">Loading rescue feed…</div>
              ) : surplusListings.filter((l) => l.isAvailable).length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center text-center">
                  <div className="text-4xl mb-3">🌱</div>
                  <p className="text-sm font-semibold text-gray-700">No surplus listings right now</p>
                  <p className="text-xs text-gray-400 mt-1">Check back soon — farmers post new surplus daily.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {surplusListings.filter((l) => l.isAvailable).map((l) => (
                    <div key={l._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-primary hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-gray-900">{l.productName}</p>
                            <span className="text-xs font-medium bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-2 py-0.5">{l.condition}</span>
                            {l.isFree && (
                              <span className="text-xs font-bold bg-brand-primary/10 border border-brand-primary/30 text-brand-accent rounded-full px-2 py-0.5">FREE</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            <span className="font-medium text-gray-700">{l.ownerName}</span> · {l.ownerLocation}
                          </p>
                          {l.description && (
                            <p className="text-xs text-gray-400 leading-relaxed">{l.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-gray-900">
                            {l.quantity.toLocaleString()} <span className="text-sm font-normal text-gray-500">{l.unit}</span>
                          </p>
                          {!l.isFree && (
                            <p className="text-sm text-brand-accent font-semibold">₱{Number(l.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(l.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Surplus toast */}
      {surplusToast && (
        <div className="fixed bottom-6 right-6 bg-brand-accent text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg z-50">
          {surplusToast}
        </div>
      )}
    </div>
  );
}
