'use client';

import React, { useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { suppliers } from '../../data/mockData';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Generate product cards from supplier data
  const allProducts = suppliers.flatMap((supplier) =>
    supplier.products.map((product) => ({
      productId: product.id,
      productTitle: product.name,
      productDescription: `${product.sku} - ${product.quantity} ${product.unit}(s) available`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierEmail: supplier.contactEmail,
      city: supplier.city,
      price: product.pricePerUnit,
      stockLevel: product.stockLevel,
      verified: true,
      category: supplier.productCategory,
    }))
  );

  // Filter products based on search query
  const filteredProducts = searchQuery
    ? allProducts.filter(
        (product) =>
          product.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProducts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Product Catalog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse our verified supplier products with glassmorphism design
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search products, suppliers, cities, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{allProducts.length}</span> products
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.productId}
                productId={product.productId}
                productTitle={product.productTitle}
                productDescription={product.productDescription}
                supplierId={product.supplierId}
                supplierName={product.supplierName}
                supplierEmail={product.supplierEmail}
                city={product.city}
                price={product.price}
                stockLevel={product.stockLevel}
                verified={product.verified}
                category={product.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search query
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn-primary"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
