'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { suppliers, Supplier } from '../data/mockData';
import { scanAllRegions, RegionalWeather } from '../lib/weatherService';
import { analyzeSupplyRisk, generateRecommendations, SupplierRisk, Recommendation } from '../lib/supplyRiskAnalysis';

const DisasterMap = dynamic(() => import('../components/DisasterMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-lg bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">Loading map...</p>
    </div>
  ),
});

interface Disaster {
  name: string;
  coordinates: [number, number];
  radius: number;
  type: 'storm' | 'flood' | 'earthquake';
  windSpeed?: number;
  precipitation?: number;
}

const mockAlerts = [
  {
    id: 1,
    title: 'Typhoon Signal #2 - Luzon',
    severity: 'critical',
    time: '5 mins ago',
    description: 'Super Typhoon Pepito approaching Central Luzon',
  },
  {
    id: 2,
    title: 'Supply Chain Disruption',
    severity: 'high',
    time: '12 mins ago',
    description: '15 suppliers in affected area',
  },
  {
    id: 3,
    title: 'Port Closure - Manila',
    severity: 'high',
    time: '25 mins ago',
    description: 'Manila Port operations suspended',
  },
  {
    id: 4,
    title: 'Road Blockage - NLEX',
    severity: 'medium',
    time: '1 hour ago',
    description: 'NLEX northbound closed due to flooding',
  },
  {
    id: 5,
    title: 'Power Outage - Bulacan',
    severity: 'medium',
    time: '2 hours ago',
    description: 'Intermittent power in Bulacan area',
  },
];

export default function VisionPage() {
  const [weatherData, setWeatherData] = useState<RegionalWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDisasters, setActiveDisasters] = useState<Disaster[]>([]);
  const [supplierRisks, setSupplierRisks] = useState<SupplierRisk[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Auto-scan weather data on page load
  useEffect(() => {
    async function fetchWeatherData() {
      setLoading(true);
      try {
        const results = await scanAllRegions();
        setWeatherData(results);

        // Convert high-risk regions to disaster objects
        const disasters: Disaster[] = results
          .filter(region => region.isHighRisk)
          .map(region => ({
            name: region.region,
            coordinates: [region.latitude, region.longitude] as [number, number],
            radius: 100000, // 100km radius for high-risk zones
            type: region.windSpeed > 60 ? 'storm' : 'flood',
            windSpeed: region.windSpeed,
            precipitation: region.precipitation,
          }));

        setActiveDisasters(disasters);

        // Analyze supply chain risk
        const risks = analyzeSupplyRisk(suppliers, results);
        setSupplierRisks(risks);

        // Generate recommendations
        const recs = generateRecommendations(risks, suppliers);
        setRecommendations(recs);
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeatherData();
  }, []);

  // Use first disaster for primary display, or create a default if none
  const primaryDisaster: Disaster = activeDisasters.length > 0
    ? activeDisasters[0]
    : {
        name: 'No Active Threats',
        coordinates: [12.8797, 121.7740],
        radius: 0,
        type: 'storm',
        windSpeed: 0,
        precipitation: 0,
      };

  // Calculate which suppliers are affected by ANY disaster
  const { affectedSuppliers, safeSuppliers, totalRiskScore } = useMemo(() => {
    const affected: Supplier[] = [];
    const safe: Supplier[] = [];
    let riskScore = 0;

    suppliers.forEach((supplier) => {
      if (supplier.latitude && supplier.longitude) {
        let isAffected = false;

        // Check if supplier is within any disaster zone
        for (const disaster of activeDisasters) {
          const distance = calculateDistance(
            disaster.coordinates[0],
            disaster.coordinates[1],
            supplier.latitude,
            supplier.longitude
          );

          if (distance <= disaster.radius) {
            isAffected = true;
            riskScore += (disaster.windSpeed || 0) + (disaster.precipitation || 0);
            break;
          }
        }

        if (isAffected) {
          affected.push(supplier);
        } else {
          safe.push(supplier);
        }
      }
    });

    return { affectedSuppliers: affected, safeSuppliers: safe, totalRiskScore: riskScore };
  }, [activeDisasters]);

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex overflow-hidden">
      {/* Left Panel - Risk Feed */}
      <div className="w-[30%] bg-gray-900 border-r border-red-900/30 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-red-900/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-red-500">RISK FEED</h2>
          </div>
          <p className="text-sm text-gray-400">Real-time supply chain alerts</p>
        </div>

        {/* Weather Data List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">Scanning regions...</p>
            </div>
          ) : (
            weatherData.map((region, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  region.isHighRisk
                    ? 'bg-red-950/50 border-red-500'
                    : 'bg-green-950/50 border-green-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm text-white">{region.region}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      region.isHighRisk
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {region.isHighRisk ? 'HIGH RISK' : 'SAFE'}
                  </span>
                </div>
                <div className="space-y-1 mb-2">
                  <p className="text-xs text-gray-400">
                    <span className="font-semibold">Wind:</span> {region.windSpeed.toFixed(1)} km/h
                  </p>
                  <p className="text-xs text-gray-400">
                    <span className="font-semibold">Rain:</span> {region.precipitation.toFixed(1)} mm
                  </p>
                </div>
                {region.isHighRisk && region.riskFactors.length > 0 && (
                  <div className="text-xs text-red-400">
                    {region.riskFactors.map((factor, i) => (
                      <p key={i}>⚠️ {factor}</p>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Active Threats Summary */}
        <div className="p-4 border-t border-red-900/30 bg-gray-950">
          <h3 className="text-sm font-semibold text-red-500 mb-2">ACTIVE THREATS</h3>
          <div className="space-y-2">
            {activeDisasters.length > 0 ? (
              activeDisasters.map((disaster, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <span className="text-sm font-medium text-white block">{disaster.name}</span>
                    <span className="text-xs text-gray-400">
                      Wind: {disaster.windSpeed?.toFixed(1)} km/h | Rain: {disaster.precipitation?.toFixed(1)} mm
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-green-500">All regions safe</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Map View */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                DREKT VISION
              </h1>
              <p className="text-sm text-gray-400 mt-1">Supply Chain Resilience Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-400">
                  Safe: <span className="text-green-500 font-semibold">{safeSuppliers.length}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">
                  At Risk: <span className="text-red-500 font-semibold">{affectedSuppliers.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative p-6">
          <DisasterMap
            businesses={suppliers}
            disaster={primaryDisaster}
            affectedSuppliers={affectedSuppliers}
            allDisasters={activeDisasters}
          />

          {/* Strategic Advice Section */}
          {recommendations.length > 0 && (
            <div className="absolute top-10 right-10 bg-gray-900/95 backdrop-blur-md border border-orange-500/30 rounded-lg p-6 shadow-2xl w-96 z-[1000] max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">STRATEGIC ADVICE</h3>
                  <p className="text-xs text-gray-400">AI-Powered Recommendations</p>
                </div>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-gray-950/50 border border-orange-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-2xl">⚠️</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-orange-500 mb-1">
                          {rec.title}
                        </h4>
                        <p className="text-xs text-gray-400 mb-2">{rec.description}</p>
                      </div>
                    </div>

                    <div className="bg-gray-900/50 rounded p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-2">
                        <span className="font-semibold text-green-400">Recommended Action:</span>
                      </p>
                      <p className="text-sm text-white font-medium mb-3">{rec.action}</p>

                      {rec.alternativeSuppliers.length > 0 && (
                        <div className="space-y-2">
                          {rec.alternativeSuppliers.slice(0, 2).map((supplier) => (
                            <div
                              key={supplier.id}
                              className="flex items-center justify-between bg-gray-800/50 rounded p-2"
                            >
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-white">{supplier.name}</p>
                                <p className="text-xs text-gray-400">{supplier.city}</p>
                              </div>
                              <a
                                href={`/supplier/${supplier.id}`}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded transition-colors"
                              >
                                Connect Now →
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {rec.affectedSuppliers.length} supplier{rec.affectedSuppliers.length > 1 ? 's' : ''} affected
                      </span>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                        {rec.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Summary Widget */}
          <div className="absolute top-10 left-10 bg-gray-900/95 backdrop-blur-md border border-red-500/30 rounded-lg p-6 shadow-2xl w-80 z-[1000]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">IMPACT SUMMARY</h3>
                <p className="text-xs text-gray-400">
                  {activeDisasters.length > 0 ? primaryDisaster.name : 'Real-time Weather Monitoring'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Affected Suppliers</span>
                <span className="text-2xl font-bold text-red-500">{affectedSuppliers.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Max Wind Speed</span>
                <span className="text-2xl font-bold text-orange-500">
                  {primaryDisaster.windSpeed?.toFixed(1) || 0} km/h
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Precipitation</span>
                <span className="text-xl font-bold text-blue-400">
                  {primaryDisaster.precipitation?.toFixed(1) || 0} mm
                </span>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Risk Level</span>
                  <span className={`px-3 py-1 text-white text-xs font-bold rounded-full ${
                    activeDisasters.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                  }`}>
                    {activeDisasters.length > 0 ? 'CRITICAL' : 'NORMAL'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Producers Affected</span>
                  <span className="text-red-400 font-semibold">
                    {affectedSuppliers.filter(s => s.role === 'Producer').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Distributors Affected</span>
                  <span className="text-red-400 font-semibold">
                    {affectedSuppliers.filter(s => s.role === 'Distributor').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
