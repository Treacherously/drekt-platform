'use client';

import { Supplier } from '../data/mockData';

interface SupplierListProps {
  suppliers: Supplier[];
  totalCount: number;
  isLoading?: boolean;
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          {/* Entity type badge */}
          <span className="inline-block text-xs font-medium text-brand-accent bg-brand-primary/10 border border-brand-primary/20 rounded px-2 py-0.5 mb-2">
            {Array.isArray(supplier.entityType)
              ? supplier.entityType.join(', ')
              : (supplier.entityType ?? supplier.role ?? 'Supplier')}
          </span>

          {/* Name */}
          <h3 className="font-heading font-semibold text-base text-gray-900 truncate mb-1">
            {supplier.name}
          </h3>

          {/* Location + category */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {supplier.city}
            </span>
            <span className="text-gray-300">·</span>
            <span>{supplier.productCategory}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {supplier.description}
          </p>
        </div>

        {/* Right: CTA */}
        <div className="flex-shrink-0">
          <button className="text-sm font-medium text-brand-accent border border-brand-accent/40 rounded-md px-3 py-1.5 hover:bg-brand-accent/5 transition-colors whitespace-nowrap">
            View Profile
          </button>
        </div>
      </div>

      {/* Products chips */}
      {supplier.products.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {supplier.products.slice(0, 4).map((product) => (
            <span
              key={product.id}
              className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5"
            >
              {product.name}
            </span>
          ))}
          {supplier.products.length > 4 && (
            <span className="text-xs text-gray-400 px-1 py-0.5">
              +{supplier.products.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
        <div className="h-8 w-24 bg-gray-100 rounded-md" />
      </div>
    </div>
  );
}

export default function SupplierList({ suppliers, totalCount, isLoading = false }: SupplierListProps) {
  return (
    <div className="flex-1">
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {isLoading ? 'Searching…' : (
            <><span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span> suppliers found</>
          )}
        </p>
        <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-accent bg-white">
          <option>Relevance</option>
          <option>Nearest first</option>
          <option>Name A–Z</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : suppliers.length > 0
            ? suppliers.map((s) => <SupplierCard key={s.id} supplier={s} />)
            : (
              <div className="text-center py-16 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">No suppliers match your filters.</p>
                <p className="text-sm text-gray-400 mt-1">Try broadening your search or clearing some filters.</p>
              </div>
            )
        }
      </div>
    </div>
  );
}
