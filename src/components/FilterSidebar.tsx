'use client';

interface FilterSidebarProps {
  selectedIndustries: string[];
  selectedLocations: string[];
  minOrderQuantity: string;
  onIndustryChange: (industry: string) => void;
  onLocationChange: (location: string) => void;
  onMinOrderChange: (value: string) => void;
  onClearAll: () => void;
}

const INDUSTRIES = [
  'Packaging',
  'Food & Beverage',
  'Textiles',
  'Chemicals',
  'Agriculture',
  'Logistics',
  'Manufacturing',
  'Glass & Plastics',
];

const LOCATIONS = [
  'Metro Manila',
  'Cebu',
  'Davao',
  'Laguna',
  'Pampanga',
  'Bulacan',
  'Cavite',
  'Batangas',
];

const MIN_ORDER_OPTIONS = [
  { label: 'Any quantity', value: '' },
  { label: '100+ units', value: '100' },
  { label: '500+ units', value: '500' },
  { label: '1,000+ units', value: '1000' },
  { label: '5,000+ units', value: '5000' },
];

export default function FilterSidebar({
  selectedIndustries,
  selectedLocations,
  minOrderQuantity,
  onIndustryChange,
  onLocationChange,
  onMinOrderChange,
  onClearAll,
}: FilterSidebarProps) {
  const hasActiveFilters =
    selectedIndustries.length > 0 || selectedLocations.length > 0 || minOrderQuantity !== '';

  return (
    <aside className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-sm text-gray-900 uppercase tracking-wide">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-brand-accent hover:underline font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Industry */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Industry</h3>
        <div className="space-y-2">
          {INDUSTRIES.map((industry) => (
            <label key={industry} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedIndustries.includes(industry)}
                onChange={() => onIndustryChange(industry)}
                className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent cursor-pointer accent-brand-accent"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {industry}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Minimum Order Quantity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum Order Quantity</h3>
        <div className="space-y-2">
          {MIN_ORDER_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="minOrder"
                value={option.value}
                checked={minOrderQuantity === option.value}
                onChange={() => onMinOrderChange(option.value)}
                className="w-4 h-4 border-gray-300 text-brand-accent focus:ring-brand-accent cursor-pointer accent-brand-accent"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Location</h3>
        <div className="space-y-2">
          {LOCATIONS.map((loc) => (
            <label key={loc} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLocations.includes(loc)}
                onChange={() => onLocationChange(loc)}
                className="w-4 h-4 rounded border-gray-300 text-brand-accent focus:ring-brand-accent cursor-pointer accent-brand-accent"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {loc}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
