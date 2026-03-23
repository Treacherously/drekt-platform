'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ContactModal from '../../../components/ContactModal';
import { getProductImage } from '../../../utils/productImages';

type StockLevel = 'high' | 'medium' | 'low';

type ApiSupplierProduct = {
  name: string;
  price: number;
  mockQuantity: number;
  stockStatus: 'High' | 'Medium' | 'Low';
};

type ApiSupplierInventoryItem = {
  itemName: string;
  quantity: number;
  unit: string;
  price: number;
};

type ApiSupplier = {
  _id: string;
  businessName: string;
  description?: string;
  location: string;
  industry: string;
  contactEmail?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  products?: ApiSupplierProduct[];
  inventory?: ApiSupplierInventoryItem[];
};

type InventoryRow = {
  key: string;
  name: string;
  sku: string;
  stockLevel: StockLevel;
  quantity: number;
  unit: string;
  pricePerUnit: number;
};

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('../../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.id as string;
  const [selectedProduct, setSelectedProduct] = useState<{ name: string; id: string } | null>(null);

  const [supplier, setSupplier] = useState<ApiSupplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/suppliers/${supplierId}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || 'Failed to fetch supplier');
        }
        if (!cancelled) setSupplier(json.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to fetch supplier');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    if (supplierId) load();
    return () => {
      cancelled = true;
    };
  }, [supplierId]);

  const handleDrektItClick = (productName: string, productId: string) => {
    setSelectedProduct({ name: productName, id: productId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading supplier…</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Supplier Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "The supplier you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStockLevelColor = (level: StockLevel) => {
    switch (level) {
      case 'high':
        return 'bg-brand-primary/10 text-brand-accent dark:bg-brand-primary/20 dark:text-brand-primary';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStockLevelIcon = (level: StockLevel) => {
    switch (level) {
      case 'high':
        return '●●●';
      case 'medium':
        return '●●○';
      case 'low':
        return '●○○';
      default:
        return '○○○';
    }
  };

  const products: ApiSupplierProduct[] = Array.isArray(supplier.products) ? supplier.products : [];
  const inventory: ApiSupplierInventoryItem[] = Array.isArray(supplier.inventory) ? supplier.inventory : [];

  const rows: InventoryRow[] = products.length > 0
    ? products.map((p, idx) => ({
        key: `product-${idx}`,
        name: p.name,
        sku: `EST-${String(idx + 1).padStart(4, '0')}`,
        stockLevel: (p.stockStatus === 'High' ? 'high' : p.stockStatus === 'Medium' ? 'medium' : 'low') as StockLevel,
        quantity: p.mockQuantity,
        unit: 'units',
        pricePerUnit: p.price,
      }))
    : inventory.map((i, idx) => ({
        key: `inventory-${idx}`,
        name: i.itemName,
        sku: `EST-${String(idx + 1).padStart(4, '0')}`,
        stockLevel: (i.quantity >= 200 ? 'high' : i.quantity >= 50 ? 'medium' : 'low') as StockLevel,
        quantity: i.quantity,
        unit: i.unit,
        pricePerUnit: i.price,
      }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Supplier ID:</span>
              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                {supplier._id}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Supplier Overview Card */}
        <div className="dashboard-card p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {supplier.businessName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {supplier.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{supplier.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{supplier.industry}</span>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                Active Supplier
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.contactEmail || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{supplier.contactPhone || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products & Inventory Section */}
        <div className="dashboard-card p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Inventory
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {rows.length} {rows.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {/* Estimated Data Disclaimer Banner */}
          <div className="flex items-start gap-3 mb-6 px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40">
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

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="text-left">Image</th>
                  <th className="text-left">Product Name</th>
                  <th className="text-left">SKU</th>
                  <th className="text-center">Stock Level</th>
                  <th className="text-right">Est. Qty</th>
                  <th className="text-right">Est. Price / Unit</th>
                  <th className="text-right">Est. Total Value</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((product: InventoryRow, index: number) => (
                    <tr key={product.key}>
                      <td>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img
                            src={getProductImage(product.name, supplier.industry)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {product.sku}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStockLevelColor(product.stockLevel)}`}>
                            <span className="mr-1.5">{getStockLevelIcon(product.stockLevel)}</span>
                            {product.stockLevel.charAt(0).toUpperCase() + product.stockLevel.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Est. {product.quantity.toLocaleString('en-PH')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          {product.unit}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₱{product.pricePerUnit.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          / {product.unit}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="font-bold text-primary-600 dark:text-primary-400">
                          ₱{(product.quantity * product.pricePerUnit).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleDrektItClick(product.name, product.sku)}
                          className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 inline-flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          DREKT IT
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                        <span className="text-2xl">📦</span>
                        <span className="text-sm font-medium">Standard Industry Inventory</span>
                        <span className="text-xs">
                          Stock status:{' '}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-accent dark:bg-brand-primary/20 dark:text-brand-primary">
                            ●●● High
                          </span>
                          {' '}— Detailed data available to{' '}
                          <a href="/register" className="underline font-semibold text-blue-600 dark:text-blue-400">Premium members</a>.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="dashboard-stat">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {rows.length}
              </p>
            </div>
            <div className="dashboard-stat">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Est. Total Value</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                ₱{rows.reduce((sum, p) => sum + (p.quantity * p.pricePerUnit), 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="dashboard-stat">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Stock Status</p>
              <div className="flex gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-primary/10 text-brand-accent dark:bg-brand-primary/20 dark:text-brand-primary">
                  {rows.filter(p => p.stockLevel === 'high').length} High
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  {rows.filter(p => p.stockLevel === 'medium').length} Medium
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  {rows.filter(p => p.stockLevel === 'low').length} Low
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map */}
        <div className="dashboard-card p-8 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Supplier Location
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{supplier.location}</span>
            </div>
          </div>
          <MapComponent
            latitude={supplier.latitude ?? 14.5995}
            longitude={supplier.longitude ?? 120.9842}
            supplierName={supplier.businessName}
            city={supplier.location}
          />
        </div>
      </main>

      {/* Contact Modal */}
      {selectedProduct && (
        <ContactModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          supplierName={supplier.businessName}
          supplierEmail={supplier.contactEmail || ''}
          productName={selectedProduct.name}
        />
      )}
    </div>
  );
}
