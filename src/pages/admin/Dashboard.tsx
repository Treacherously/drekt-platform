'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ApiSupplier, BusinessStatus } from '../../types/supplier';
import type { GetServerSideProps } from 'next';

// ─── User type (for Users tab) ──────────────────────────────────────────────

interface AdminUser {
  _id: string;
  email: string;
  role: 'ADMIN' | 'SUPPLIER';
  isVerified: boolean;
  businessId?: string;
  createdAt: string;
}

// ─── Inquiry type (mirrors IInquiry from models/Inquiry.ts) ───────────────────

interface Inquiry {
  _id: string;
  businessId: string;
  businessName: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  message: string;
  status: 'PENDING' | 'READ';
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BusinessStatus, string> = {
  PENDING:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  VERIFIED: 'bg-blue-50 text-blue-700 border-blue-200',
  FEATURED: 'bg-purple-50 text-purple-700 border-purple-200',
};

function StatusBadge({ status }: { status: BusinessStatus }) {
  return (
    <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function VerifiedIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

// ─── Action cell ──────────────────────────────────────────────────────────────

function ActionButtons({
  business,
  onAction,
  loadingId,
}: {
  business: ApiSupplier;
  onAction: (id: string, action: 'VERIFIED' | 'FEATURED' | 'PENDING' | 'DELETE') => void;
  loadingId: string | null;
}) {
  const busy = loadingId === business._id;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {business.status !== 'VERIFIED' && (
        <button
          onClick={() => onAction(business._id, 'VERIFIED')}
          disabled={busy}
          className="text-xs font-medium px-2.5 py-1 rounded border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          ✓ Verify
        </button>
      )}
      {business.status !== 'FEATURED' && (
        <button
          onClick={() => onAction(business._id, 'FEATURED')}
          disabled={busy}
          className="text-xs font-medium px-2.5 py-1 rounded border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors disabled:opacity-50"
        >
          ★ Feature
        </button>
      )}
      {business.status !== 'PENDING' && (
        <button
          onClick={() => onAction(business._id, 'PENDING')}
          disabled={busy}
          className="text-xs font-medium px-2.5 py-1 rounded border border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          ↩ Pending
        </button>
      )}
      <button
        onClick={() => onAction(business._id, 'DELETE')}
        disabled={busy}
        className="text-xs font-medium px-2.5 py-1 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {busy ? '…' : '✕ Delete'}
      </button>
    </div>
  );
}

// ─── Business row ─────────────────────────────────────────────────────────────

function BusinessRow({
  business,
  onAction,
  loadingId,
}: {
  business: ApiSupplier;
  onAction: (id: string, action: 'VERIFIED' | 'FEATURED' | 'PENDING' | 'DELETE') => void;
  loadingId: string | null;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{business.businessName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{business.location}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-gray-700">{business.industry}</p>
        {business.productCategory && (
          <p className="text-xs text-gray-400 mt-0.5">{business.productCategory}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {business.entityType?.length > 0 ? (
            business.entityType.map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{t}</span>
            ))
          ) : (
            <span className="text-xs text-gray-300 italic">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={business.status} />
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-gray-500">
          {business.contactEmail ?? <span className="text-gray-300 italic">—</span>}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{business.contactPhone ?? ''}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs text-gray-400">
          {business.createdAt ? new Date(business.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
        </p>
      </td>
      <td className="px-4 py-3">
        <ActionButtons business={business} onAction={onAction} loadingId={loadingId} />
      </td>
    </tr>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState<ApiSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [masterSearch, setMasterSearch] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'queue' | 'all' | 'leads' | 'users'>('queue');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [fixingPurest, setFixingPurest] = useState(false);
  const [harvesting, setHarvesting] = useState(false);

  const handleFixPurest = async () => {
    setFixingPurest(true);
    try {
      const res = await fetch('/api/admin/fix-purest');
      const json = await res.json();
      showToast(json.message, json.success ? 'success' : 'error');
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setFixingPurest(false);
    }
  };

  const handleHarvestOsm = async () => {
    setHarvesting(true);
    showToast('Fetching real data from OpenStreetMap…', 'success');
    try {
      const res = await fetch('/api/admin/harvest-osm', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        if (json.created > 0) fetchAll();
      } else {
        showToast(json.message ?? 'Harvest failed.', 'error');
      }
    } catch {
      showToast('Network error during harvest.', 'error');
    } finally {
      setHarvesting(false);
    }
  };

  const handleGeocode = async () => {
    setGeocoding(true);
    showToast('Geocoding in progress… this may take a few minutes.', 'success');
    try {
      const res = await fetch('/api/admin/geocode', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
      } else {
        showToast(json.message ?? 'Geocoding failed.', 'error');
      }
    } catch {
      showToast('Network error during geocoding.', 'error');
    } finally {
      setGeocoding(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/suppliers');
      const json = await res.json();
      if (json.success) {
        setBusinesses(json.data);
      } else {
        setError(json.message ?? 'Failed to load');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role === 'GUEST' || role === 'SUPPLIER') { router.push('/dashboard'); return; }
    }
  }, [status, session]);

  useEffect(() => { fetchAll(); }, []);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    setLeadsError(null);
    try {
      const res = await fetch('/api/inquiries');
      const json = await res.json();
      if (json.success) {
        setInquiries(json.data);
      } else {
        setLeadsError(json.message ?? 'Failed to load inquiries');
      }
    } catch {
      setLeadsError('Network error');
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leads') fetchLeads();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleForceVerify = async (userId: string) => {
    setVerifyingId(userId);
    try {
      const res = await fetch('/api/admin/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isVerified: true } : u));
        showToast(json.message);
      } else {
        showToast(json.message ?? 'Failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleMarkRead = async (inquiryId: string) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId }),
      });
      const json = await res.json();
      if (json.success) {
        setInquiries((prev) =>
          prev.map((i) => (i._id === inquiryId ? { ...i, status: 'READ' } : i))
        );
      }
    } catch {
      showToast('Failed to update inquiry', 'error');
    }
  };

  const handleAction = async (id: string, action: 'VERIFIED' | 'FEATURED' | 'PENDING' | 'DELETE') => {
    setLoadingId(id);
    try {
      if (action === 'DELETE') {
        const res = await fetch('/api/admin/businesses', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: id }),
        });
        const json = await res.json();
        if (json.success) {
          setBusinesses((prev) => prev.filter((b) => b._id !== id));
          showToast('Business deleted.');
        } else {
          showToast(json.message ?? 'Delete failed', 'error');
        }
      } else {
        const res = await fetch('/api/admin/businesses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: id, status: action }),
        });
        const json = await res.json();
        if (json.success) {
          setBusinesses((prev) =>
            prev.map((b) => (b._id === id ? { ...b, status: action, isVerified: action !== 'PENDING' } : b))
          );
          showToast(`Marked as ${action}.`);
        } else {
          showToast(json.message ?? 'Update failed', 'error');
        }
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const pending   = useMemo(() => businesses.filter((b) => b.status === 'PENDING'), [businesses]);
  const verified  = useMemo(() => businesses.filter((b) => b.status === 'VERIFIED'), [businesses]);
  const featured  = useMemo(() => businesses.filter((b) => b.status === 'FEATURED'), [businesses]);

  const masterFiltered = useMemo(() => {
    if (!masterSearch.trim()) return businesses;
    const q = masterSearch.toLowerCase();
    return businesses.filter(
      (b) =>
        b.businessName.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q) ||
        (b.productCategory ?? '').toLowerCase().includes(q)
    );
  }, [businesses, masterSearch]);

  const TABLE_HEAD = ['Business', 'Industry', 'Entity Types', 'Status', 'Contact', 'Registered', 'Actions'];

  if (typeof window === 'undefined') return null;
  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ backgroundColor: '#001a80' }} className="px-8 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <a href="/" className="font-heading font-bold text-xl text-white tracking-tight">
              DRE<span className="text-brand-primary">KT</span>
            </a>
            <span className="text-white/30 text-sm">/</span>
            <span className="text-sm text-white/60 font-medium">Admin</span>
          </div>
          <p className="text-xs text-white/40">Business Directory Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/suppliers" className="text-xs text-white/60 hover:text-white transition-colors">← View Directory</a>
          <button
            onClick={fetchAll}
            className="text-xs text-white/70 hover:text-white border border-white/20 rounded px-3 py-1.5 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          <span className="text-sm text-gray-700"><span className="font-bold">{pending.length}</span> Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          <span className="text-sm text-gray-700"><span className="font-bold">{verified.length}</span> Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
          <span className="text-sm text-gray-700"><span className="font-bold">{featured.length}</span> Featured</span>
        </div>
        <div className="flex items-center gap-2 ml-2 text-gray-300">|</div>
        <span className="text-sm text-gray-500"><span className="font-bold text-gray-700">{businesses.length}</span> total in database</span>
      </div>

      {/* Tab Nav */}
      <div className="px-8 pt-6">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'queue'
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Verification Queue
            {pending.length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full px-1.5 py-0.5">
                {pending.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Master List
            <span className="ml-2 text-xs text-gray-400">({businesses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Customer Leads
            {inquiries.filter((i) => i.status === 'PENDING').length > 0 && (
              <span className="ml-2 bg-brand-accent/10 text-brand-accent text-xs font-bold rounded-full px-1.5 py-0.5">
                {inquiries.filter((i) => i.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Users
            {users.filter((u) => !u.isVerified).length > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full px-1.5 py-0.5">
                {users.filter((u) => !u.isVerified).length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'users' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-base text-gray-900">
                Platform Users
                <span className="ml-2 text-sm font-normal text-gray-400">({users.length} total)</span>
              </h2>
              <button
                onClick={fetchUsers}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-3 py-1.5 transition-colors"
              >
                ↻ Refresh
              </button>
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center text-center">
                <p className="text-sm text-gray-400">No users registered yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Email', 'Role', 'Verified', 'Business Linked', 'Registered', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{u.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {u.isVerified ? (
                              <span className="text-xs font-semibold text-brand-accent bg-brand-primary/10 border border-brand-primary/30 rounded-full px-2.5 py-0.5">✓ Verified</span>
                            ) : (
                              <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-full px-2.5 py-0.5">⚠ Unverified</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-500">{u.businessId ? '✓ Linked' : <span className="text-gray-300 italic">—</span>}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-xs text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {!u.isVerified && (
                              <button
                                onClick={() => handleForceVerify(u._id)}
                                disabled={verifyingId === u._id}
                                className="text-xs font-medium px-2.5 py-1 rounded border border-brand-primary/30 text-brand-accent bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {verifyingId === u._id ? '…' : '✓ Force Verify'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'leads' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-base text-gray-900">
                Customer Inquiries
                <span className="ml-2 text-sm font-normal text-gray-400">({inquiries.length} total)</span>
              </h2>
              <button
                onClick={fetchLeads}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-3 py-1.5 transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {loadingLeads ? (
              <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading leads…</div>
            ) : leadsError ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-sm text-red-500">{leadsError}</p>
                <button onClick={fetchLeads} className="text-xs text-brand-accent hover:underline">Retry</button>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">No inquiries yet</p>
                <p className="text-xs text-gray-400 mt-1">Inquiries from the directory will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Business', 'From', 'Contact', 'Message', 'Date', 'Status', ''].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq._id} className={`border-b border-gray-100 transition-colors ${
                          inq.status === 'PENDING' ? 'bg-brand-primary/5 hover:bg-brand-primary/10' : 'hover:bg-gray-50'
                        }`}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900 leading-snug">{inq.businessName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-800">{inq.senderName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-600">{inq.senderEmail || '—'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{inq.senderPhone || ''}</p>
                          </td>
                          <td className="px-4 py-3 max-w-[240px]">
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{inq.message}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-xs text-gray-400">
                              {new Date(inq.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${
                              inq.status === 'PENDING'
                                ? 'bg-brand-primary/10 text-brand-accent border-brand-primary/30'
                                : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {inq.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {inq.status === 'PENDING' && (
                              <button
                                onClick={() => handleMarkRead(inq._id)}
                                className="text-xs font-medium px-2.5 py-1 rounded border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                              >
                                Mark Read
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading database…</div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={fetchAll} className="text-xs text-brand-accent hover:underline">Retry</button>
          </div>
        ) : (
          <>
            {/* ── QUEUE TAB ── */}
            {activeTab === 'queue' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-base text-gray-900">
                    Pending Review
                    <span className="ml-2 text-sm font-normal text-gray-400">({pending.length} awaiting action)</span>
                  </h2>
                </div>

                {pending.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">All clear!</p>
                    <p className="text-xs text-gray-400 mt-1">No pending registrations.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {TABLE_HEAD.map((h) => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pending.map((b) => (
                            <BusinessRow key={b._id} business={b} onAction={handleAction} loadingId={loadingId} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MASTER LIST TAB ── */}
            {activeTab === 'all' && (
              <div>
                <div className="flex items-center justify-between mb-4 gap-4">
                  <h2 className="font-heading font-semibold text-base text-gray-900 whitespace-nowrap">
                    All Businesses
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleFixPurest}
                      disabled={fixingPurest}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {fixingPurest ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : '🎯'}
                      Fix Purest Coordinates
                    </button>
                    <button
                      onClick={handleHarvestOsm}
                      disabled={harvesting}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {harvesting ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : '🌍'}
                      Harvest Real Data (OSM)
                    </button>
                    <button
                      onClick={handleGeocode}
                      disabled={geocoding}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {geocoding ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : '🗺️'}
                      Auto-Geocode Missing
                    </button>
                  </div>
                  <div className="relative max-w-sm w-full">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name, location, industry…"
                      value={masterSearch}
                      onChange={(e) => setMasterSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent dark:focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {TABLE_HEAD.map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {masterFiltered.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                              No businesses match &ldquo;{masterSearch}&rdquo;
                            </td>
                          </tr>
                        ) : (
                          masterFiltered.map((b) => (
                            <BusinessRow key={b._id} business={b} onAction={handleAction} loadingId={loadingId} />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white z-50 transition-all ${
          toast.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
