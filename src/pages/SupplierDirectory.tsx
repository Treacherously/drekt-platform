'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ApiSupplier } from '../types/supplier';
import type { GetServerSideProps } from 'next';
import Navbar from '../components/Navbar';
import SupplierDetailView from '../components/SupplierDetailView';

const DrektMap = dynamic<{ suppliers: ApiSupplier[]; userLocation?: { lat: number; lng: number } | null }>(
  () => import('../components/DrektMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading map…</p>
      </div>
    ),
  }
);

// ─── Haversine distance (km) ─────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const PAGE_SIZE = 15;
const SERVICE_TYPES = [
  'MANUFACTURER', 'LOGISTICS', 'WAREHOUSE', 'AGRICULTURE', 'DISTRIBUTOR', 'SUPPLIER',
];
const INDUSTRIES = [
  'Agriculture & Farming', 'Logistics & Freight', 'Textiles & Apparel',
  'Pharmaceuticals', 'Retail & Distribution',
  'Packaging', 'Packaging Manufacturer', 'Plastics Manufacturer', 'Glass Manufacturer',
  'Flour Mill', 'Baking Ingredients', 'Sugar Mill', 'Condiments Manufacturer',
  'Chemical Supplier', 'Food Manufacturer', 'Cold Chain',
  'Rice Farm', 'Corn Farm', 'Mango Farm', 'Coconut Farm',
];
const LOCATIONS = [
  'Manila', 'Quezon City', 'Pasig', 'Makati', 'Taguig', 'Pasay',
  'Malabon', 'Valenzuela', 'Marikina', 'Mandaluyong', 'Calamba',
  'Marilao', 'Bulacan', 'Lucena', 'Davao', 'Cebu', 'Iligan',
  'Ilagan', 'Cabanatuan', 'Victorias',
];

const SERVICE_TYPE_LABELS: Record<string, string> = {
  MANUFACTURER: 'Manufacturer',
  LOGISTICS: 'Logistics',
  WAREHOUSE: 'Warehouse',
  AGRICULTURE: 'Agriculture',
  DISTRIBUTOR: 'Distributor',
  SUPPLIER: 'Raw Materials',
};

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

interface DropdownFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function DropdownFilter({ label, options, selected, onToggle, onClear, isOpen, onOpenChange }: DropdownFilterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onOpenChange]);

  const isActive = selected.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => onOpenChange(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
          isActive
            ? 'bg-brand-accent text-white border-transparent'
            : 'text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500'
        }`}
      >
        {label}
        {isActive && (
          <span className="bg-[#002db3] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {selected.length}
          </span>
        )}
        <ChevronDown />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
            {isActive && (
              <button onClick={onClear} className="text-xs text-brand-accent hover:underline">Clear</button>
            )}
          </div>
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-brand-accent"
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="p-8 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        {query ? `No results for "${query}"` : 'No businesses found'}
      </p>
      <p className="text-xs text-gray-400 mb-4 max-w-[180px] leading-relaxed">
        Missing a business? Help us grow the network.
      </p>
      <a
        href="/register"
        className="bg-brand-accent text-white text-xs font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
      >
        + Register a Business
      </a>
    </div>
  );
}

function CompactSupplierCard({
  supplier,
  isActive,
  onClick,
}: {
  supplier: ApiSupplier;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 border-b border-gray-100 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 focus:outline-none ${
        isActive ? 'bg-brand-primary/10 dark:bg-brand-primary/5 border-l-2 border-l-brand-accent dark:border-l-brand-primary' : 'border-l-2 border-l-transparent'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className={`text-sm font-semibold leading-snug truncate ${isActive ? 'text-brand-accent dark:text-brand-primary' : 'text-gray-900 dark:text-gray-100'}`}>
              {supplier.businessName}
            </p>
            {supplier.status === 'FEATURED' && (
              <span title="Featured" className="flex-shrink-0 flex items-center gap-0.5 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-1.5 py-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured
              </span>
            )}
            {supplier.status === 'VERIFIED' && (
              <span title="Verified" className="flex-shrink-0 text-blue-500">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            {supplier.isExternal ? (
              <span className="flex-shrink-0 text-xs text-gray-500 bg-gray-100 border border-gray-300 rounded-full px-1.5 py-0.5 font-medium">
                Unclaimed
              </span>
            ) : supplier.status === 'PENDING' && (
              <span className="flex-shrink-0 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-full px-1.5 py-0.5 font-medium">
                Pending
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {supplier.location} · {supplier.productCategory ?? supplier.industry}
          </p>
          {supplier.description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
              {supplier.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default function SupplierDirectory() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const initialLoc = searchParams.get('loc') ?? '';

  const [inputQuery, setInputQuery] = useState(initialQ);
  const [inputLocation, setInputLocation] = useState(initialLoc);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [debouncedLocation, setDebouncedLocation] = useState(initialLoc);

  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputQuery), 300);
    return () => clearTimeout(t);
  }, [inputQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocation(inputLocation), 300);
    return () => clearTimeout(t);
  }, [inputLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by this browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsError('Location access denied.');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchSuppliers() {
      setLoading(true);
      setError(null);
      setVisibleCount(PAGE_SIZE);

      try {
        let url: string;
        if (debouncedQuery && userLocation) {
          const params = new URLSearchParams({
            query: debouncedQuery,
            lat: String(userLocation.lat),
            lng: String(userLocation.lng),
          });
          url = `/api/search?${params.toString()}`;
        } else {
          const params = new URLSearchParams();
          if (debouncedQuery) params.set('q', debouncedQuery);
          if (debouncedLocation) params.set('location', debouncedLocation);
          if (selectedIndustry) params.set('industry', selectedIndustry);
          if (selectedServiceType) params.set('entityType', selectedServiceType.toUpperCase());
          url = `/api/suppliers?${params.toString()}`;
        }

        const res = await fetch(url);
        const json = await res.json();
        if (!cancelled) {
          if (json.success) {
            setSuppliers(json.data ?? []);
          } else {
            setSuppliers([]);
            setError(json.message ?? 'Failed to load suppliers');
          }
        }
      } catch {
        if (!cancelled) {
          setSuppliers([]);
          setError('Network error. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSuppliers();
    return () => { cancelled = true; };
  }, [debouncedQuery, debouncedLocation, selectedIndustry, selectedServiceType, userLocation]);

  const NEAR_ME_RADIUS_KM = 15;

  const filteredSuppliers = useMemo(() => {
    let result = suppliers;
    if (selectedLocations.length > 0) {
      result = result.filter((s) =>
        selectedLocations.some((loc) => s.location.toLowerCase().includes(loc.toLowerCase()))
      );
    }
    if (userLocation) {
      result = result.filter((s) => {
        if (typeof s.latitude !== 'number' || typeof s.longitude !== 'number') return false;
        return haversineKm(userLocation.lat, userLocation.lng, s.latitude, s.longitude) <= NEAR_ME_RADIUS_KM;
      });
    }
    return result;
  }, [suppliers, selectedLocations, userLocation]);

  const suppliersToRender = filteredSuppliers ?? [];

  const visibleSuppliers = useMemo(
    () => suppliersToRender.slice(0, visibleCount),
    [suppliersToRender, visibleCount]
  );

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s._id === selectedSupplierId) ?? filteredSuppliers[0] ?? null,
    [suppliers, filteredSuppliers, selectedSupplierId]
  );

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) =>
    setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);

  const activeFilterCount = (selectedServiceType ? 1 : 0) + (selectedIndustry ? 1 : 0) + selectedLocations.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(inputQuery);
    setDebouncedLocation(inputLocation);
  };

  console.log("Current Filters:", { selectedIndustry, selectedServiceType });

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#121212] overflow-hidden">
      <Navbar />

      {/* Back to home breadcrumb */}
      <div style={{ backgroundColor: '#001a80' }} className="flex-shrink-0 px-6 py-2 flex items-center gap-2">
        <a href="/" className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </a>
        <span className="text-white/30 text-xs">/</span>
        <span className="text-xs text-white/60">Search Results</span>
        {debouncedQuery && (
          <><span className="text-white/30 text-xs">/</span><span className="text-xs text-white/80">&ldquo;{debouncedQuery}&rdquo;</span></>
        )}
      </div>

      {/* Search + filter header */}
      <div className="flex-shrink-0 px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex items-stretch gap-0 bg-white dark:bg-slate-700 rounded-lg overflow-hidden shadow-md dark:shadow-none mb-3">
          <div className="flex-1 flex items-center px-4 gap-2 border-r border-gray-200 dark:border-slate-600">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="What are you looking for? e.g. Glass jars, packaging"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none bg-transparent"
            />
          </div>
          <div className="w-44 flex items-center px-4 gap-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <input
              type="text"
              placeholder="Location"
              value={inputLocation}
              onChange={(e) => setInputLocation(e.target.value)}
              className="flex-1 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none bg-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={gpsLoading}
            title={userLocation ? `GPS active: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Use my location'}
            className={`flex items-center gap-1.5 px-3 border-r text-sm transition-colors flex-shrink-0 ${
              userLocation
                ? 'text-brand-primary dark:text-brand-primary font-semibold'
                : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
            }`}
          >
            {gpsLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <circle cx="12" cy="11" r="3" strokeWidth={2} />
              </svg>
            )}
            {userLocation ? 'GPS On' : 'Near Me'}
          </button>
          <button
            type="submit"
            className="bg-brand-accent text-white px-6 text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
          >
            Search
          </button>
        </form>
        {(gpsError || userLocation) && (
          <div className="flex items-center gap-2 mb-2">
            {gpsError && <p className="text-xs text-red-300">{gpsError}</p>}
            {userLocation && (
              <p className="text-xs text-brand-primary flex items-center gap-1">
                <span>📍</span> GPS active — showing nearby results first
                <button onClick={() => setUserLocation(null)} className="ml-1 underline opacity-70 hover:opacity-100">Clear</button>
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-gray-500 dark:text-slate-400 text-xs mr-1">Filter by:</span>

          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors cursor-pointer ${
              selectedServiceType
                ? 'bg-brand-accent text-white border-transparent'
                : 'text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <option value="">Service Type</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>{SERVICE_TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors cursor-pointer ${
              selectedIndustry
                ? 'bg-brand-accent text-white border-transparent'
                : 'text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <option value="">Industry</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <DropdownFilter
            label="Location"
            options={LOCATIONS}
            selected={selectedLocations}
            onToggle={toggle(setSelectedLocations)}
            onClear={() => setSelectedLocations([])}
            isOpen={activeDropdown === 'location'}
            onOpenChange={(open) => setActiveDropdown(open ? 'location' : null)}
          />

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSelectedServiceType(''); setSelectedIndustry(''); setSelectedLocations([]); }}
              className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white underline ml-1 transition-colors"
            >
              Clear all
            </button>
          )}

          <span className="ml-auto text-xs text-gray-500 dark:text-slate-400">
            {loading ? '…' : `${filteredSuppliers.length} result${filteredSuppliers.length !== 1 ? 's' : ''}`}
          </span>

          {/* View mode toggle */}
          <div className="flex items-center bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden ml-2 flex-shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-500 text-brand-accent dark:text-white' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'map' ? 'bg-white dark:bg-slate-500 text-brand-accent dark:text-white' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Master-Detail body */}
      <div className="flex flex-1 overflow-hidden">
        {viewMode === 'map' && <DrektMap suppliers={suppliersToRender} userLocation={userLocation} />}
        {viewMode === 'list' && (
          <>
            {/* Left: compact scrollable list (35%) */}
            <div className="w-[35%] flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] flex-shrink-0 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {loading ? 'Loading…' : `${filteredSuppliers.length} Business${filteredSuppliers.length !== 1 ? 'es' : ''} & Partner${filteredSuppliers.length !== 1 ? 's' : ''}`}
                </p>
                <a href="/register" className="text-xs text-brand-accent dark:text-brand-primary hover:underline font-medium">
                  + List yours
                </a>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
                ) : error ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-red-500 font-medium mb-1">Connection error</p>
                    <p className="text-xs text-gray-400">{error}</p>
                  </div>
                ) : filteredSuppliers.length === 0 ? (
                  <EmptyState query={debouncedQuery} />
                ) : (
                  <>
                    {visibleSuppliers.map((supplier) => (
                      <CompactSupplierCard
                        key={supplier._id}
                        supplier={supplier}
                        isActive={
                          selectedSupplierId
                            ? supplier._id === selectedSupplierId
                            : supplier._id === filteredSuppliers[0]?._id
                        }
                        onClick={() => setSelectedSupplierId(supplier._id)}
                      />
                    ))}
                    {visibleCount < filteredSuppliers.length && (
                      <div className="p-4 flex justify-center border-t border-gray-100">
                        <button
                          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                          className="text-xs font-medium text-brand-accent dark:text-brand-primary border border-brand-accent dark:border-brand-primary rounded-md px-4 py-2 hover:bg-brand-accent/5 dark:hover:bg-brand-primary/10 transition-colors"
                        >
                          Load More ({filteredSuppliers.length - visibleCount} remaining)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: detail view (65%) */}
            <div className="flex-1 overflow-hidden bg-white dark:bg-[#1a1a1a]">
              <SupplierDetailView supplier={selectedSupplier} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
