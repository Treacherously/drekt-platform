'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type SurplusCondition = 'Overripe' | 'Surplus' | 'B-Grade' | 'Damaged Packaging' | 'Near Expiry' | 'Other';

type SurplusItem = {
  _id: string;
  ownerName: string;
  ownerLocation: string;
  productName: string;
  quantity: number;
  unit: string;
  condition: SurplusCondition;
  description?: string;
  price: number;
  isFree: boolean;
  isAvailable: boolean;
  createdAt: string;
};

function timeLeftLabel(createdAtIso: string): string {
  const createdAt = new Date(createdAtIso).getTime();
  const expiresAt = createdAt + 48 * 60 * 60 * 1000;
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / (60 * 60 * 1000));
  const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  if (h <= 0) return `${m}m left`;
  return `${h}h ${m}m left`;
}

function ReportSurplusModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState<SurplusCondition>('Surplus');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/surplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: Number(quantity),
          unit,
          condition,
          ownerLocation: location,
          description,
          isFree,
          price: isFree ? 0 : Number(price || 0),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        router.push(`/login?next=${encodeURIComponent('/agri-rescue?action=report')}`);
        return;
      }

      const json = await res.json();
      if (!res.ok || !json?.success) {
        setError(json?.message ?? 'Failed to post surplus listing');
        return;
      }

      onClose();
      onCreated();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white">Report Surplus</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Farmers — post unsold produce for rescue</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Produce Type</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Mangoes"
                required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Zambales"
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              >
                <option value="kg">kg</option>
                <option value="pcs">pcs</option>
                <option value="box">box</option>
                <option value="sack">sack</option>
                <option value="tray">tray</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as SurplusCondition)}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              >
                <option value="Surplus">Surplus</option>
                <option value="B-Grade">B-Grade</option>
                <option value="Overripe">Overripe</option>
                <option value="Near Expiry">Near Expiry</option>
                <option value="Damaged Packaging">Damaged Packaging</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 select-none">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                />
                Free
              </label>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₱)</label>
                <input
                  type="number"
                  min="0"
                  disabled={isFree}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
              placeholder="Harvest date, pickup window, handling notes…"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand-accent hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Posting…' : 'Post Listing'}
            </button>
          </div>

          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
            Viewing is public. Posting requires a logged-in FARMER account.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function AgriRescuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const action = searchParams.get('action') ?? '';
  const [reportOpen, setReportOpen] = useState(false);

  const [items, setItems] = useState<SurplusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/surplus', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Failed to load');
      setItems(json.data ?? []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (action === 'report') setReportOpen(true);
  }, [action]);

  const active = useMemo(() => items.filter((i) => i.isAvailable), [items]);

  const requestStock = (item: SurplusItem) => {
    // Prompt login only when the action is attempted.
    router.push(`/login?next=${encodeURIComponent('/agri-rescue')}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <p className="text-xs font-bold text-brand-accent dark:text-brand-primary uppercase tracking-widest">Agri-RESCUE</p>
            <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white mt-2">Zero Waste Exchange</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl">
              A live feed of surplus and near-expiry harvests. Browse freely. Post or request stock when you&apos;re ready.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReportOpen(true);
                router.replace('/agri-rescue?action=report');
              }}
              className="bg-brand-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90"
            >
              Report Surplus
            </button>
            <button
              onClick={load}
              className="text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-heading font-semibold text-sm text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            Active Rescue Missions ({active.length})
          </h2>

          {loading ? (
            <div className="text-sm text-gray-400">Loading feed…</div>
          ) : error ? (
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : active.length === 0 ? (
            <div className="border border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">No active missions yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to report surplus to prevent waste.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 dark:border-slate-700 rounded-2xl p-5 bg-white dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.quantity.toLocaleString()} {item.unit} {item.productName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.ownerLocation} · {item.condition}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      Expires in {timeLeftLabel(item.createdAt)}
                    </span>
                  </div>

                  {item.description?.trim() && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.isFree ? 'Free' : `₱${Number(item.price).toLocaleString()}`}
                    </p>
                    <button
                      onClick={() => requestStock(item)}
                      className="bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90"
                    >
                      Request This Stock
                    </button>
                  </div>

                  <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
                    Farmer: {item.ownerName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ReportSurplusModal
        open={reportOpen}
        onClose={() => {
          setReportOpen(false);
          router.replace('/agri-rescue');
        }}
        onCreated={load}
      />
    </div>
  );
}
