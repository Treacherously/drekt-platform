'use client';

import React, { useRef, useEffect, useState } from 'react';

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
    name: "Juan's Chili Garlic Oil",
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

// Minimal 2D Card Component
function SchematicCard({ node }: { node: ConnectionNode }) {
  const getStatusColor = () => {
    switch (node.status) {
      case 'active': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'delayed': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 p-3 mb-3">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-medium">{node.name}</span>
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: getStatusColor() }}
        />
      </div>
    </div>
  );
}


export default function NetworkPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { suppliers, distributors, business } = mockNetworkData;

  // Layout constants
  const CARD_WIDTH = 280;
  const CARD_HEIGHT = 48;
  const CARD_SPACING = 12;
  const CENTER_SIZE = 160;

  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">DREKSTATS</h1>
        <p className="text-slate-400 text-sm">Supply Chain Command Center</p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mb-8 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Delayed</span>
        </div>
      </div>

      {/* Schematic Diagram */}
      <div 
        ref={containerRef}
        className="relative w-full h-[700px] bg-slate-900 border border-slate-700"
      >
        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Supplier Lines */}
          {suppliers.map((supplier, index) => {
            const startX = CARD_WIDTH + 40;
            const startY = 100 + index * (CARD_HEIGHT + CARD_SPACING) + CARD_HEIGHT / 2;
            const endX = dimensions.width / 2 - CENTER_SIZE / 2;
            const endY = dimensions.height / 2;
            
            const strokeColor = supplier.status === 'active' ? '#10b981' : 
                               supplier.status === 'warning' ? '#f59e0b' : '#ef4444';

            return (
              <g key={supplier.id}>
                <path
                  d={`M ${startX} ${startY} C ${startX + 150} ${startY}, ${endX - 150} ${endY}, ${endX} ${endY}`}
                  stroke={strokeColor}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="8 4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="12"
                    to="0"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            );
          })}

          {/* Distributor Lines */}
          {distributors.map((distributor, index) => {
            const startX = dimensions.width / 2 + CENTER_SIZE / 2;
            const startY = dimensions.height / 2;
            const endX = dimensions.width - CARD_WIDTH - 40;
            const endY = 100 + index * (CARD_HEIGHT + CARD_SPACING) + CARD_HEIGHT / 2;
            
            return (
              <g key={distributor.id}>
                <path
                  d={`M ${startX} ${startY} C ${startX + 150} ${startY}, ${endX - 150} ${endY}, ${endX} ${endY}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="8 4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="12"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            );
          })}
        </svg>

        {/* Left Column - Suppliers */}
        <div ref={leftColRef} className="absolute left-8 top-24" style={{ width: CARD_WIDTH }}>
          <div className="mb-4">
            <h2 className="text-white text-sm font-bold mb-1">INPUTS</h2>
            <div className="h-px bg-slate-700" />
          </div>
          {suppliers.map((supplier) => (
            <SchematicCard key={supplier.id} node={supplier} />
          ))}
        </div>

        {/* Center Hub */}
        <div 
          ref={centerRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 border-2 border-slate-600 flex items-center justify-center"
          style={{ width: CENTER_SIZE, height: CENTER_SIZE }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🏭</div>
            <div className="text-white text-sm font-bold">{business.name}</div>
          </div>
        </div>

        {/* Right Column - Distributors */}
        <div ref={rightColRef} className="absolute right-8 top-24" style={{ width: CARD_WIDTH }}>
          <div className="mb-4">
            <h2 className="text-white text-sm font-bold mb-1">OUTPUTS</h2>
            <div className="h-px bg-slate-700" />
          </div>
          {distributors.map((distributor) => (
            <SchematicCard key={distributor.id} node={distributor} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-slate-900 border border-slate-700 p-4">
          <div className="text-2xl font-bold text-white">{suppliers.length}</div>
          <div className="text-xs text-slate-400">Suppliers</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-4">
          <div className="text-2xl font-bold text-white">{distributors.length}</div>
          <div className="text-xs text-slate-400">Distributors</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-4">
          <div className="text-2xl font-bold text-green-500">
            {suppliers.filter(s => s.status === 'active').length}
          </div>
          <div className="text-xs text-slate-400">Active</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-4">
          <div className="text-2xl font-bold text-red-500">
            {suppliers.filter(s => s.status === 'delayed' || s.status === 'warning').length}
          </div>
          <div className="text-xs text-slate-400">Issues</div>
        </div>
      </div>
    </div>
  );
}
