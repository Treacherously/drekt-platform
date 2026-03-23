'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ApiSupplier, ApiDedicatedInventoryItem } from '../types/supplier';

const MiniMap = dynamic(() => import('./MiniMap'), { ssr: false });

const ENTITY_EMOJI: Record<string, string> = {
  FARMER: '🚜',
  MANUFACTURER: '🏭',
  LOGISTICS: '🚛',
  WAREHOUSE: '🏪',
  AGRICULTURE: '🌾',
  DISTRIBUTOR: '📦',
  SUPPLIER: '🏢',
  PROCESSOR: '⚙️',
};

interface SupplierDetailViewProps {
  supplier: ApiSupplier | null;
}

function InquiryModal({ supplier, onClose }: { supplier: ApiSupplier; onClose: () => void }) {
  const defaultMsg = `Hi ${supplier.businessName},\n\nI found you on DREKT and I'm interested in your ${supplier.industry} services. I'd like to get a quote or more information about what you offer.\n\nPlease contact me at your earliest convenience.\n\nThank you!`;

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState(defaultMsg);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setMessage(defaultMsg); setSent(false); setError(null); }, [supplier.businessName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: supplier._id,
          businessName: supplier.businessName,
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim(),
          senderPhone: senderPhone.trim(),
          message: message.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSent(true);
        if (supplier.contactEmail) {
          window.open(`mailto:${supplier.contactEmail}?subject=Inquiry from DREKT&body=${encodeURIComponent(message)}`);
        }
      } else {
        setError(json.message ?? 'Failed to send inquiry. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
          <div>
            <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white">Send Inquiry</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{supplier.businessName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <svg className="w-7 h-7 text-brand-accent dark:text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Inquiry Sent!</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px] leading-relaxed">
                Your message has been recorded on DREKT.
                {supplier.contactEmail ? ' Your email client has also been opened.' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-brand-accent text-white text-sm font-medium px-6 py-2 rounded-lg hover:opacity-90 transition-opacity mt-1"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
                placeholder="e.g. Juan dela Cruz"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-brand-accent focus:border-brand-accent dark:focus:border-brand-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-brand-accent focus:border-brand-accent dark:focus:border-brand-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-brand-accent focus:border-brand-accent dark:focus:border-brand-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message / Requirements <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 dark:focus:ring-brand-primary/30 focus:border-brand-accent dark:focus:border-brand-primary resize-none leading-relaxed"
              />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="pb-2">
              <button
                type="submit"
                disabled={submitting || !senderName.trim() || !message.trim()}
                className="w-full bg-brand-accent text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending…' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Claim Modal ─────────────────────────────────────────────────────────────

function ClaimModal({
  supplierId,
  item,
  onClose,
  onSuccess,
}: {
  supplierId: string;
  item: ApiDedicatedInventoryItem;
  onClose: () => void;
  onSuccess: (itemId: string, newQuantity: number) => void;
}) {
  const [qty, setQty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantityClaimed = parseInt(qty, 10);
    if (!quantityClaimed || quantityClaimed <= 0) {
      setError('Enter a valid quantity.');
      return;
    }
    if (quantityClaimed > item.quantity) {
      setError(`Only ${item.quantity} ${item.unit} available.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/transactions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, itemId: item._id, quantityClaimed }),
      });
      const json = await res.json();
      if (json.success) {
        onSuccess(item._id, json.newQuantity);
        onClose();
      } else {
        setError(json.message ?? 'Claim failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
          <div>
            <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white">Initiate Order</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate max-w-[240px]">{item.itemName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleClaim} className="px-6 py-5 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg px-4 py-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Available stock</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{item.quantity.toLocaleString()} {item.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Unit price</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">₱{Number(item.price).toFixed(2)}/{item.unit}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Quantity to claim <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={item.quantity}
                value={qty}
                onChange={(e) => { setQty(e.target.value); setError(null); }}
                placeholder={`Max ${item.quantity}`}
                required
                className="flex-1 border border-gray-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-colors"
              />
              <span className="text-sm text-gray-500 dark:text-slate-400 flex-shrink-0">{item.unit}</span>
            </div>
            {qty && !error && parseInt(qty) > 0 && (
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                Estimated total: <span className="font-semibold text-gray-700 dark:text-slate-300">₱{(parseInt(qty) * Number(item.price)).toLocaleString()}</span>
              </p>
            )}
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5">
              <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !qty}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: '#002db3' }}
            >
              {submitting ? 'Processing…' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SupplierDetailView({ supplier }: { supplier: ApiSupplier | null }) {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [claimTarget, setClaimTarget] = useState<ApiDedicatedInventoryItem | null>(null);
  const [claimToast, setClaimToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [localDedicated, setLocalDedicated] = useState<ApiDedicatedInventoryItem[]>(
    supplier?.dedicatedInventory ?? []
  );

  useEffect(() => {
    setLocalDedicated(supplier?.dedicatedInventory ?? []);
  }, [supplier]);

  type InventoryRow = {
    key: string;
    itemName: string;
    quantity: number;
    unit: string;
    price: number;
    stockLevel: 'high' | 'medium' | 'low';
  };

  const products = Array.isArray(supplier?.products) ? supplier.products : [];
  const inventory = Array.isArray(supplier?.inventory) ? supplier.inventory : [];

  const inventoryRows: InventoryRow[] = products.length > 0
    ? products.map((p, idx) => ({
        key: `product-${idx}`,
        itemName: p.name,
        quantity: p.mockQuantity,
        unit: 'units',
        price: p.price,
        stockLevel: p.stockStatus === 'High' ? 'high' : p.stockStatus === 'Medium' ? 'medium' : 'low',
      }))
    : inventory.map((i, idx) => ({
        key: `inventory-${idx}`,
        itemName: i.itemName,
        quantity: i.quantity,
        unit: i.unit,
        price: i.price,
        stockLevel: i.quantity >= 200 ? 'high' : i.quantity >= 50 ? 'medium' : 'low',
      }));

  const handleClaimSuccess = (itemId: string, newQuantity: number) => {
    setLocalDedicated((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity: newQuantity } : i))
    );
    setClaimToast({ msg: 'Inventory Auto-Updated!', type: 'success' });
    setTimeout(() => setClaimToast(null), 3500);
  };

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
        <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Select a supplier to view their profile</p>
        <p className="text-xs text-gray-400 mt-1">Click any card on the left to get started</p>
      </div>
    );
  }

  const initials = supplier.businessName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-[#1a1a1a]">
      <div className="p-8 max-w-3xl">
        {/* Top: Logo + name + meta */}
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="font-heading font-bold text-lg text-brand-accent dark:text-brand-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-heading font-bold text-xl text-gray-900 dark:text-white leading-tight">
                {supplier.businessName}
              </h1>
              {supplier.isExternal && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded-full px-2.5 py-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Unclaimed Business
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {supplier.location}
              </span>
              <span className="text-gray-300">·</span>
              <span>{supplier.productCategory ?? supplier.industry}</span>
              <span className="text-gray-300">·</span>
              <span className="inline-block text-xs font-medium text-brand-accent dark:text-brand-primary bg-brand-accent/5 dark:bg-brand-primary/10 border border-brand-accent/20 dark:border-brand-primary/20 rounded px-2 py-0.5">
                {supplier.industry}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 mb-8">
          {supplier.isExternal ? (
            <>
              <a
                href={`/register?claim=${encodeURIComponent(supplier.businessName)}&lat=${supplier.latitude ?? ''}&lng=${supplier.longitude ?? ''}`}
                className="inline-flex items-center gap-2 bg-brand-accent text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
              >
                <span>👑</span> Claim This Profile
              </a>
              <p className="text-xs text-gray-400">This business hasn&apos;t joined DREKT yet.</p>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="bg-brand-accent text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
              >
                Send Inquiry
              </button>
              <a
                href={`/supplier/${supplier._id}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Full Profile
              </a>
              <button
                onClick={handleSave}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Save to List
              </button>
            </>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 mb-6" />

        {/* About */}
        <section className="mb-8">
          <h2 className="font-heading font-semibold text-sm text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            About
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{supplier.description}</p>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="font-heading font-semibold text-sm text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            Contact Information
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${supplier.contactEmail}`} className="text-brand-accent dark:text-brand-primary hover:underline">
                {supplier.contactEmail}
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">{supplier.contactPhone}</span>
            </div>
          </div>
        </section>

        {/* Location mini-map */}
        {typeof supplier.latitude === 'number' && typeof supplier.longitude === 'number' && (
          <section className="mb-8">
            <h2 className="font-heading font-semibold text-sm text-gray-900 uppercase tracking-wide mb-3">
              Location
            </h2>
            <div className="h-56 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 z-0">
              <MiniMap
                lat={supplier.latitude}
                lng={supplier.longitude}
                name={supplier.businessName}
                emoji={supplier.markerEmoji || (supplier.entityType?.[0] && ENTITY_EMOJI[supplier.entityType[0]]) || '📍'}
              />
            </div>
          </section>
        )}

        {/* Dedicated Inventory — DREKT Verified Stock */}
        {localDedicated.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-heading font-semibold text-sm text-gray-900 dark:text-white uppercase tracking-wide">
                Dedicated Stock
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                DREKT Verified Stock
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              This stock is reserved exclusively for DREKT buyers — real-time availability guaranteed.
            </p>
            <div className="border border-green-200 dark:border-green-900 rounded-lg overflow-hidden bg-green-50/20 dark:bg-green-900/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-50 dark:bg-green-900/30 border-b border-green-200 dark:border-green-900">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wide">Item</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wide">Price / Unit</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wide">Qty Available</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wide" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100 dark:divide-green-900/40">
                  {localDedicated.map((item) => (
                    <tr key={item._id} className="hover:bg-green-50/40 dark:hover:bg-green-900/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.itemName}</td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        ₱{Number(item.price).toFixed(2)}<span className="text-gray-400">/{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold tabular-nums ${
                          item.quantity === 0
                            ? 'text-red-500'
                            : item.quantity < 10
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {Number(item.quantity).toLocaleString()}
                        </span>
                        <span className="text-gray-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.quantity > 0 ? (
                          <button
                            onClick={() => setClaimTarget(item)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-md text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#002db3' }}
                          >
                            Order
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-red-400">Out of stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Regular Inventory */}
        <section>
          <h2 className="font-heading font-semibold text-sm text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            Products &amp; Inventory ({inventoryRows.length})
          </h2>

            {/* Estimated Data Disclaimer Banner */}
            <div className="flex items-start gap-3 mb-4 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40">
              <span className="text-base mt-0.5 shrink-0">💡</span>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <span className="font-semibold">Note:</span> Prices and inventory levels shown are{' '}
                <span className="font-semibold">estimated industry averages</span>, generated to give you a preliminary overview.{' '}
                <a
                  href="/register"
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400 underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                >
                  🔓 Unlock Premium
                </a>{' '}
                to access real-time verified supplier data, direct quotes, and exact warehouse stock.
              </p>
            </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Item</th>
                  <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stock Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Est. Price / Unit</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Est. Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {inventoryRows.length > 0 ? (
                  inventoryRows.map((item: InventoryRow) => {
                    const level = item.stockLevel;
                    const stockBadge =
                      level === 'high'
                        ? { label: 'High Stock',   dots: '●●●', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800' }
                        : level === 'medium'
                        ? { label: 'Medium Stock', dots: '●●○', cls: 'text-amber-700  bg-amber-50  border-amber-200  dark:text-amber-400  dark:bg-amber-900/20  dark:border-amber-800'  }
                        : { label: 'Low Stock',    dots: '●○○', cls: 'text-red-600   bg-red-50    border-red-200    dark:text-red-400    dark:bg-red-900/20    dark:border-red-800'    };
                    return (
                      <tr key={item.key} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.itemName}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${stockBadge.cls}`}>
                            <span className="tracking-tighter text-[10px]">{stockBadge.dots}</span>
                            {stockBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                          ₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="text-gray-400 text-xs">/{item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-700 dark:text-gray-300">
                            Est.{" "}
                            <span className="font-semibold">{Number(item.quantity).toLocaleString('en-PH')}</span>
                          </span>
                          <span className="block text-[11px] text-gray-400 dark:text-gray-500">{item.unit}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                      Standard Industry Inventory
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        {/* Data Integrity Notice */}
        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-300">ℹ️ Data Integrity Notice:</span>{' '}
            Inventory and analytics displayed are exclusively tracked within the DREKT ecosystem. Real-world stock levels may vary if suppliers conduct sales outside of this platform. Auto-sync is currently limited to DREKT-facilitated transactions.
          </p>
        </div>
      </div>

      {/* Contact modal */}
      {showModal && <InquiryModal supplier={supplier} onClose={() => setShowModal(false)} />}

      {/* Claim modal */}
      {claimTarget && (
        <ClaimModal
          supplierId={supplier._id}
          item={claimTarget}
          onClose={() => setClaimTarget(null)}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Claim toast */}
      {claimToast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg flex items-center gap-2.5 transition-all ${
          claimToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {claimToast.type === 'success' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {claimToast.msg}
        </div>
      )}

      {/* Save toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          Saved to your favorites!
        </div>
      )}
    </div>
  );
}
