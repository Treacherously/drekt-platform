'use client';

import React, { useState, useMemo } from 'react';
import {
  BusinessEntity,
  BusinessCategory,
  mockBusinessEntities,
  filterBusinessEntities,
} from '../types';

export default function SearchDashboard() {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | ''>('');

  // Get unique cities and products from mock data
  const cities = useMemo(() => {
    const citySet = new Set(mockBusinessEntities.map(entity => entity.city));
    return Array.from(citySet).sort();
  }, []);

  const products = useMemo(() => {
    const productSet = new Set<string>();
    mockBusinessEntities.forEach(entity => {
      entity.products.forEach(product => productSet.add(product));
    });
    return Array.from(productSet).sort();
  }, []);

  const categories: (BusinessCategory | '')[] = ['', 'Farmer', 'Distributor', 'Supplier'];

  // Filtering logic: cascading filters
  const getFilteredResults = (): BusinessEntity[] => {
    const filters: {
      city?: string;
      product?: string;
      category?: BusinessCategory;
    } = {};

    // Apply filters only if they are selected
    if (selectedCity) {
      filters.city = selectedCity;
    }
    if (selectedProduct) {
      filters.product = selectedProduct;
    }
    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    // If no filters selected, return all
    if (Object.keys(filters).length === 0) {
      return mockBusinessEntities;
    }

    return filterBusinessEntities(filters);
  };

  const filteredResults = useMemo(() => getFilteredResults(), [selectedCity, selectedProduct, selectedCategory]);

  const handleReset = () => {
    setSelectedCity('');
    setSelectedProduct('');
    setSelectedCategory('');
  };

  const getSourceBadge = (entity: BusinessEntity) => {
    if (entity.source === 'REGISTERED' && entity.verificationStatus === 'VERIFIED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          ✓ Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          🌐 Web Result
        </span>
      );
    }
  };

  const getCategoryBadge = (category: BusinessCategory) => {
    const colors = {
      Farmer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Distributor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Supplier: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[category]}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Business Entity Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search and filter registered businesses and web-scraped results
          </p>
        </div>

        {/* Filters Card */}
        <div className="dashboard-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filters
            </h2>
            <button
              onClick={handleReset}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City Filter */}
            <div>
              <label className="form-label">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="form-input"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Filter */}
            <div>
              <label className="form-label">Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="form-input"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="form-label">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as BusinessCategory | '')}
                className="form-input"
              >
                <option value="">All Categories</option>
                {categories.filter(c => c !== '').map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedCity || selectedProduct || selectedCategory) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedCity && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    City: {selectedCity}
                    <button
                      onClick={() => setSelectedCity('')}
                      className="ml-2 hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedProduct && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    Product: {selectedProduct}
                    <button
                      onClick={() => setSelectedProduct('')}
                      className="ml-2 hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-2 hover:text-primary-900 dark:hover:text-primary-100"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Card */}
        <div className="dashboard-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Results ({filteredResults.length})
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  ✓ Verified
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {filteredResults.filter(r => r.source === 'REGISTERED').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  🌐 Web Result
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {filteredResults.filter(r => r.source === 'WEB_SCRAPE').length}
                </span>
              </div>
            </div>
          </div>

          {/* Results Table */}
          {filteredResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th className="text-left">Business Name</th>
                    <th className="text-left">Category</th>
                    <th className="text-left">Products</th>
                    <th className="text-left">City</th>
                    <th className="text-left">Contact</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((entity) => (
                    <tr key={entity.id}>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {entity.name}
                          </span>
                          {entity.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {entity.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {getCategoryBadge(entity.category)}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {entity.products.slice(0, 3).map((product, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {product}
                            </span>
                          ))}
                          {entity.products.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{entity.products.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-gray-700 dark:text-gray-300">
                          {entity.city}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col text-sm">
                          {entity.contactInfo.phone && (
                            <span className="text-gray-600 dark:text-gray-400">
                              📞 {entity.contactInfo.phone}
                            </span>
                          )}
                          {entity.contactInfo.email && (
                            <span className="text-gray-600 dark:text-gray-400">
                              ✉️ {entity.contactInfo.email}
                            </span>
                          )}
                          {!entity.contactInfo.phone && !entity.contactInfo.email && (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">
                              No contact info
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        {getSourceBadge(entity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No results found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
