'use client';

import React, { useState, useMemo } from 'react';
import { suppliers as allBusinesses } from '../../data/mockData';

interface ConnectionNode {
  id: string;
  name: string;
  type: 'supplier' | 'distributor';
  status: 'active' | 'warning' | 'delayed';
}

interface NetworkData {
  business: {
    name: string;
  };
  suppliers: ConnectionNode[];
  distributors: ConnectionNode[];
}

const mockNetworkData: NetworkData = {
  business: {
    name: "MY OPERATIONS",
  },
  suppliers: [
    { id: 'SUP-001', name: 'Nueva Ecija Rice Farmers', type: 'supplier', status: 'active' },
    { id: 'SUP-002', name: 'Bulacan Packaging Corp', type: 'supplier', status: 'active' },
    { id: 'SUP-003', name: 'Cavite Glass Jar Suppliers', type: 'supplier', status: 'active' },
    { id: 'SUP-004', name: 'Bicol Chili Farmers', type: 'supplier', status: 'warning' },
    { id: 'SUP-005', name: 'Batangas Garlic Growers', type: 'supplier', status: 'delayed' },
  ],
  distributors: [
    { id: 'DIST-001', name: 'SM Supermarket', type: 'distributor', status: 'active' },
    { id: 'DIST-002', name: 'Shopee Store', type: 'distributor', status: 'active' },
    { id: 'DIST-003', name: 'Divisoria Wholesalers', type: 'distributor', status: 'active' },
    { id: 'DIST-004', name: 'Direct Customers', type: 'distributor', status: 'active' },
  ],
};

// Professional Card Component
function SchematicCard({ node, onMenuClick }: { node: ConnectionNode; onMenuClick: (id: string) => void }) {
  const getStatusBadge = () => {
    switch (node.status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-brand-primary/10 text-brand-accent">Active</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Warning</span>;
      case 'delayed':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Delayed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Unknown</span>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <span className="text-gray-900 text-sm font-medium block mb-2">{node.name}</span>
          {getStatusBadge()}
        </div>
        <button
          onClick={() => onMenuClick(node.id)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          title="Edit or Remove"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="8" cy="2" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="14" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}


export default function NetworkPage() {
  // State for current network
  const [mySuppliers, setMySuppliers] = useState<ConnectionNode[]>(mockNetworkData.suppliers);
  const [myBuyers, setMyBuyers] = useState<ConnectionNode[]>(mockNetworkData.distributors);
  
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'supplier' | 'buyer'>('supplier');
  const [searchQuery, setSearchQuery] = useState('');

  const { business } = mockNetworkData;

  // Get available businesses not in current network
  const availableBusinesses = useMemo(() => {
    const currentIds = new Set([
      ...mySuppliers.map(s => s.id),
      ...myBuyers.map(b => b.id)
    ]);
    
    return allBusinesses
      .filter(b => !currentIds.has(b.id))
      .filter(b => {
        if (searchQuery.trim() === '') return true;
        const query = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(query) ||
          b.city.toLowerCase().includes(query) ||
          b.productCategory.toLowerCase().includes(query) ||
          b.role.toLowerCase().includes(query)
        );
      });
  }, [mySuppliers, myBuyers, searchQuery]);

  const handleMenuClick = (id: string) => {
    console.log('Menu clicked for:', id);
    if (window.confirm(`Remove this partner from your network?`)) {
      setMySuppliers(prev => prev.filter(s => s.id !== id));
      setMyBuyers(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleAddSupplier = () => {
    setModalType('supplier');
    setSearchQuery('');
    setIsAddModalOpen(true);
  };

  const handleAddBuyer = () => {
    setModalType('buyer');
    setSearchQuery('');
    setIsAddModalOpen(true);
  };

  const handleAddPartner = (business: typeof allBusinesses[0]) => {
    const newNode: ConnectionNode = {
      id: business.id,
      name: business.name,
      type: modalType === 'supplier' ? 'supplier' : 'distributor',
      status: 'active',
    };

    if (modalType === 'supplier') {
      setMySuppliers(prev => [...prev, newNode]);
    } else {
      setMyBuyers(prev => [...prev, newNode]);
    }

    setIsAddModalOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">DREKSTATS</h1>
        <p className="text-gray-600 text-sm">Supply Chain Network Visualization</p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-8 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-brand-primary/10 text-brand-accent">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Delayed</span>
        </div>
      </div>

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Column 1: Suppliers (Inbound) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">SUPPLIERS</h2>
              <span className="text-gray-400 text-sm">(Inbound)</span>
            </div>
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {mySuppliers.map((supplier) => (
              <SchematicCard key={supplier.id} node={supplier} onMenuClick={handleMenuClick} />
            ))}
          </div>

          <button
            onClick={handleAddSupplier}
            className="w-full mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Add New Supplier</span>
          </button>
        </div>

        {/* Column 2: My Operations (Center Hub) */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-400 rounded-xl shadow-xl p-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">🏭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{business.name}</h2>
            <p className="text-sm text-gray-600 mb-6">Central Operations Hub</p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{mySuppliers.length}</div>
                <div className="text-xs text-gray-600 mt-1">Suppliers</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-brand-accent">{myBuyers.length}</div>
                <div className="text-xs text-gray-600 mt-1">Buyers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Buyers (Outbound) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">(Outbound)</span>
              <h2 className="text-lg font-bold text-gray-900">BUYERS</h2>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
            {myBuyers.map((buyer) => (
              <SchematicCard key={buyer.id} node={buyer} onMenuClick={handleMenuClick} />
            ))}
          </div>

          <button
            onClick={handleAddBuyer}
            className="w-full mt-4 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-brand-primary hover:text-brand-accent hover:bg-brand-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Add New Buyer</span>
          </button>
        </div>
      </div>

      {/* Add Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New Partner</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Select a business from the database to add as a {modalType === 'supplier' ? 'supplier' : 'buyer'}
              </p>

              {/* Search Bar */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, city, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Body - Scrollable List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {availableBusinesses.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500">No businesses found matching your search</p>
                </div>
              ) : (
                availableBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{business.name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {business.city}
                          </span>
                          <span>•</span>
                          <span>{business.productCategory}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                            {business.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{business.description}</p>
                      </div>
                      <button
                        onClick={() => handleAddPartner(business)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {availableBusinesses.length} available businesses from database
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{mySuppliers.length}</div>
          <div className="text-xs text-gray-600 mt-1">Total Suppliers</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{myBuyers.length}</div>
          <div className="text-xs text-gray-600 mt-1">Total Buyers</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="text-2xl font-bold text-brand-accent">
            {mySuppliers.filter(s => s.status === 'active').length + myBuyers.filter(d => d.status === 'active').length}
          </div>
          <div className="text-xs text-gray-600 mt-1">Active Connections</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="text-2xl font-bold text-red-600">
            {mySuppliers.filter(s => s.status === 'delayed' || s.status === 'warning').length + 
             myBuyers.filter(d => d.status === 'delayed' || d.status === 'warning').length}
          </div>
          <div className="text-xs text-gray-600 mt-1">Issues Detected</div>
        </div>
      </div>
    </div>
  );
}
