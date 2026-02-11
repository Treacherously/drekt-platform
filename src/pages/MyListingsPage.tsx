import React from 'react';

export default function MyListingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Product Listings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your products and inventory
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Product
        </button>
      </div>

      <div className="dashboard-card p-12 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          No listings yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Start by adding your first product to showcase to potential buyers
        </p>
        <button className="btn-primary">
          Create Your First Listing
        </button>
      </div>
    </div>
  );
}
