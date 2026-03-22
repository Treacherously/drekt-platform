'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InventoryItem {
  _id: string;
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
  lastUpdated: string;
}

const EMPTY_FORM = { itemName: '', quantity: '', unit: '', price: '' };

export default function SupplierInventoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role === 'GUEST') { router.push('/dashboard'); return; }
      const isVerified = (session?.user as any)?.isVerified;
      if (!isVerified) { router.push('/dashboard/supplier'); return; }
      fetchInventory();
    }
  }, [status]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/supplier/inventory');
      const json = await res.json();
      if (json.success) setItems(json.data);
      else setError(json.message ?? 'Failed to load inventory');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item._id);
    setForm({
      itemName: item.itemName,
      quantity: String(item.quantity),
      unit: item.unit,
      price: String(item.price),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim() || !form.quantity || !form.unit.trim() || !form.price) return;
    setSaving(true);
    try {
      const res = await fetch('/api/dashboard/supplier/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: form.itemName,
          quantity: Number(form.quantity),
          unit: form.unit,
          price: Number(form.price),
          ...(editingId ? { itemId: editingId } : {}),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        setForm(EMPTY_FORM);
        setEditingId(null);
        showToast(editingId ? 'Item updated.' : 'Item added to DREKT inventory.');
      } else {
        setError(json.message ?? 'Save failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Remove this item from your DREKT-exclusive inventory?')) return;
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/dashboard/supplier/inventory/${itemId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        showToast('Item removed.');
      } else {
        setError(json.message ?? 'Delete failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ backgroundColor: '#001a80' }} className="px-8 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="font-heading font-bold text-xl text-white tracking-tight">
              DRE<span className="text-brand-primary">KT</span>
            </Link>
            <p className="text-xs text-white/40 mt-0.5">Dedicated Inventory Manager</p>
          </div>
          <Link href="/dashboard/supplier" className="text-xs text-white/60 hover:text-white transition-colors">
            ← My Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* DREKT-Exclusive Legal Banner */}
        <div className="mb-8 bg-amber-50 border-2 border-amber-300 rounded-xl px-5 py-4 flex gap-4">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">⚠ NOTICE: DREKT-EXCLUSIVE STOCK ONLY</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              All stock listed here must be <strong>reserved exclusively for DREKT platform buyers</strong>.
              Cross-platform listing of these specific units on other marketplaces is <strong>strictly prohibited</strong>.
              This ensures real-time stock accuracy and maintains buyer trust on the DREKT platform.
              Violation may result in account suspension.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex justify-between">
            {error}
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Add / Edit Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-heading font-semibold text-base text-gray-900 mb-4">
            {editingId ? '✏ Edit Item' : '+ Add DREKT-Exclusive Stock'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Item Name</label>
              <input
                type="text"
                value={form.itemName}
                onChange={(e) => setForm((f) => ({ ...f, itemName: e.target.value }))}
                required
                placeholder="e.g. Premium Rice Sacks"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Quantity</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                required
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                required
                placeholder="kg / bags / pcs"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Price (PHP)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001a80]/20 dark:focus:ring-brand-primary/30 focus:border-[#001a80] dark:focus:border-brand-primary transition-colors bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-500"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-accent text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-primary transition-colors disabled:opacity-60"
              >
                {saving ? '…' : editingId ? 'Save Changes' : 'Add Item'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-3.5 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-base text-gray-900">
              DREKT-Exclusive Stock
              <span className="ml-2 text-sm font-normal text-gray-400">({items.length} items)</span>
            </h2>
            <span className="text-xs bg-brand-primary/10 border border-brand-primary/30 text-brand-accent font-semibold rounded-full px-2.5 py-0.5">
              ✓ DREKT Verified
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700">No dedicated stock yet</p>
              <p className="text-xs text-gray-400 mt-1">Add items above to reserve DREKT-exclusive inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Item Name', 'Quantity', 'Unit', 'Price (PHP)', 'Last Updated', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 font-semibold">{item.quantity.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-500">{item.unit}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-800">₱{Number(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs text-gray-400">
                          {new Date(item.lastUpdated).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-xs font-medium px-2.5 py-1 rounded border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="text-xs font-medium px-2.5 py-1 rounded border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {deletingId === item._id ? '…' : 'Remove'}
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
