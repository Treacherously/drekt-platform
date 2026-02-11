import React from 'react';

export default function FavoritesPage() {
  const favoriteSuppliers = [
    {
      id: 'FAV-001',
      name: 'Universal Robina Corporation - Flour Division',
      category: 'Flour',
      city: 'Pasig',
      savedDate: '2 days ago',
    },
    {
      id: 'FAV-002',
      name: 'NutriAsia Inc - Marilao Sauce Plant',
      category: 'Condiments',
      city: 'Marilao',
      savedDate: '5 days ago',
    },
    {
      id: 'FAV-003',
      name: 'San Miguel Yamamura Packaging',
      category: 'Packaging',
      city: 'Calamba',
      savedDate: '1 week ago',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Saved Suppliers
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your favorite suppliers for quick access
        </p>
      </div>

      {favoriteSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteSuppliers.map((supplier) => (
            <div key={supplier.id} className="dashboard-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {supplier.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>{supplier.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{supplier.city}</span>
                  </div>
                </div>
                <button className="text-red-500 hover:text-red-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Saved {supplier.savedDate}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 btn-primary text-sm py-2">
                  View Details
                </button>
                <button className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="dashboard-card p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No saved suppliers yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Browse the dashboard and save your favorite suppliers for quick access
          </p>
          <button className="btn-primary">
            Browse Suppliers
          </button>
        </div>
      )}
    </div>
  );
}
