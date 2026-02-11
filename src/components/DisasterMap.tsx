'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Supplier } from '../data/mockData';

interface Disaster {
  name: string;
  coordinates: [number, number];
  radius: number;
  type: 'storm' | 'flood' | 'earthquake';
}

interface DisasterMapProps {
  businesses: Supplier[];
  disaster: Disaster;
  affectedSuppliers: Supplier[];
  allDisasters?: Disaster[];
  mapCenter?: [number, number];
  onVisibleBusinessesChange?: (businesses: Supplier[]) => void;
}

export default function DisasterMap({ businesses, disaster, affectedSuppliers, allDisasters = [], mapCenter = [14.6091, 121.0223], onVisibleBusinessesChange }: DisasterMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circlesRef = useRef<L.Circle[]>([]);
  const [visibleBusinesses, setVisibleBusinesses] = useState<Supplier[]>([]);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [initialFilterDone, setInitialFilterDone] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Filter businesses within map bounds
  const filterBusinessesInBounds = (map: L.Map) => {
    const bounds = map.getBounds();
    const filtered = businesses.filter(b => {
      if (!b.latitude || !b.longitude) return false;
      return bounds.contains([b.latitude, b.longitude]);
    });
    setVisibleBusinesses(filtered);
    if (onVisibleBusinessesChange) {
      onVisibleBusinessesChange(filtered);
    }
    console.log('Visible businesses in viewport:', filtered.length, 'of', businesses.length);
    return filtered;
  };

  // Handle manual search trigger
  const handleSearchThisArea = () => {
    if (mapRef.current) {
      filterBusinessesInBounds(mapRef.current);
      setShowSearchButton(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Ensure container has dimensions
    const container = mapContainerRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.warn('Map container has no dimensions yet');
      return;
    }

    // Initialize map only once
    if (!mapRef.current) {
      try {
        mapRef.current = L.map(container, {
          center: mapCenter,
          zoom: 10,
          zoomControl: true,
          preferCanvas: true,
        });

        // Use dark mode tiles for command center aesthetic
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
        }).addTo(mapRef.current);

        // Wait for map to be fully ready before operations
        mapRef.current.whenReady(() => {
          console.log('DisasterMap is fully initialized and ready');
          setMapReady(true);
        });

        // Add map event listeners for viewport-based loading (with safety checks)
        mapRef.current.on('moveend', () => {
          if (mapRef.current && mapReady) {
            try {
              filterBusinessesInBounds(mapRef.current);
            } catch (error) {
              console.error('Error during moveend filter:', error);
            }
          }
        });

        mapRef.current.on('movestart', () => {
          setShowSearchButton(true);
        });

        mapRef.current.on('zoomend', () => {
          if (mapRef.current && mapReady) {
            try {
              filterBusinessesInBounds(mapRef.current);
            } catch (error) {
              console.error('Error during zoomend filter:', error);
            }
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        return;
      }
    }

    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Ensure map size is correct
    try {
      map.invalidateSize();
    } catch (e) {
      console.warn('Could not invalidate map size:', e);
    }

    // Clear existing markers and circles
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    const allCircles: L.Circle[] = [];

    // Draw all disaster zones (use allDisasters if available, otherwise use primary disaster)
    const disastersToRender = allDisasters.length > 0 ? allDisasters : (disaster.radius > 0 ? [disaster] : []);

    disastersToRender.forEach((disasterZone) => {
      // Draw disaster zone (red circle) with pulse animation
      const disasterCircle = L.circle(disasterZone.coordinates, {
        radius: disasterZone.radius,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.2,
        weight: 3,
        dashArray: '10, 10',
        className: 'disaster-zone-pulse',
      }).addTo(map);

      allCircles.push(disasterCircle);

      // Add disaster center marker
      const disasterIcon = L.divIcon({
        className: 'custom-disaster-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 4px solid #fca5a5;
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      L.marker(disasterZone.coordinates, { icon: disasterIcon }).addTo(map).bindPopup(`
        <div style="min-width: 200px; background: #111827; color: white; padding: 8px; border-radius: 8px;">
          <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #ef4444;">
            ${disasterZone.name}
          </h3>
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">
            <strong>Type:</strong> ${disasterZone.type.toUpperCase()}
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">
            <strong>Radius:</strong> ${disasterZone.radius / 1000}km
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            <strong>Status:</strong> <span style="color: #ef4444;">ACTIVE</span>
          </p>
        </div>
      `);
    });

    // Create set of affected supplier IDs for quick lookup
    const affectedIds = new Set(affectedSuppliers.map(s => s.id));

    // Add markers for VISIBLE businesses only (viewport-based loading)
    const markers: L.Marker[] = [];
    const businessesToRender = visibleBusinesses.length > 0 ? visibleBusinesses : businesses;
    
    businessesToRender.forEach((business) => {
      if (business.latitude && business.longitude) {
        const isAffected = affectedIds.has(business.id);

        // Create custom icon based on affected status
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${isAffected ? '#ef4444' : '#22c55e'};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid ${isAffected ? '#fca5a5' : '#86efac'};
              box-shadow: 0 4px 12px rgba(0,0,0,0.5), 0 0 20px ${isAffected ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              ${isAffected ? 'animation: pulse 2s infinite;' : ''}
            ">
              ${isAffected ? '⚠️' : '🛡️'}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([business.latitude, business.longitude], {
          icon: customIcon,
        }).addTo(map);

        // Create popup content with command center styling
        const popupContent = `
          <div style="min-width: 250px; background: #111827; color: white; padding: 12px; border-radius: 8px; border: 2px solid ${isAffected ? '#ef4444' : '#22c55e'};">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 24px;">${isAffected ? '⚠️' : '🛡️'}</span>
              <h3 style="font-weight: bold; font-size: 14px; color: white; margin: 0;">
                ${business.name}
              </h3>
            </div>
            
            <div style="background: ${isAffected ? '#7f1d1d' : '#14532d'}; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px;">
              <p style="font-size: 11px; font-weight: bold; color: ${isAffected ? '#fca5a5' : '#86efac'}; margin: 0;">
                STATUS: ${isAffected ? 'AT RISK' : 'SAFE'}
              </p>
            </div>
            
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">
              <strong>Type:</strong> ${business.role}
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">
              <strong>Category:</strong> ${business.productCategory}
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
              <strong>Location:</strong> ${business.city}
            </p>
            
            ${isAffected ? `
              <div style="background: #7f1d1d; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                <p style="font-size: 11px; color: #fca5a5; margin: 0;">
                  ⚠️ This supplier is within the disaster zone. Supply chain disruption expected.
                </p>
              </div>
            ` : ''}
            
            <a 
              href="/supplier/${business.id}" 
              style="
                display: inline-block;
                background-color: ${isAffected ? '#ef4444' : '#22c55e'};
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                text-decoration: none;
                font-size: 12px;
                font-weight: 600;
                width: 100%;
                text-align: center;
              "
            >
              View Details →
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
      }
    });

    // Fit map bounds to show disaster zones and all markers
    if (markers.length > 0 || allCircles.length > 0) {
      const group = L.featureGroup([...markers, ...allCircles]);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Add custom CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.8;
        }
      }
      
      @keyframes disaster-pulse {
        0% {
          stroke-opacity: 1;
          stroke-width: 3;
        }
        50% {
          stroke-opacity: 0.4;
          stroke-width: 6;
        }
        100% {
          stroke-opacity: 1;
          stroke-width: 3;
        }
      }
      
      .disaster-zone-pulse {
        animation: disaster-pulse 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup markers and circles
      markersRef.current.forEach(marker => {
        if (map && marker) {
          try {
            map.removeLayer(marker);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      });
      circlesRef.current.forEach(circle => {
        if (map && circle) {
          try {
            map.removeLayer(circle);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      });
    };
  }, [businesses, disaster, affectedSuppliers, allDisasters, mapCenter, visibleBusinesses, mapReady]);

  // Separate useEffect for initial filtering (only after map is ready)
  useEffect(() => {
    if (!mapReady || !mapRef.current || initialFilterDone) return;

    // Initial load: filter businesses immediately after map is ready
    setTimeout(() => {
      if (mapRef.current && mapReady) {
        try {
          mapRef.current.invalidateSize();
          filterBusinessesInBounds(mapRef.current);
          setInitialFilterDone(true);
          console.log('Initial auto-filter triggered for Metro Manila bounds');
        } catch (error) {
          console.error('Error during initial filter:', error);
        }
      }
    }, 200); // Slightly longer delay for safety
  }, [mapReady, initialFilterDone]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Search This Area Button (Google Maps style) */}
      {showSearchButton && (
        <button
          onClick={handleSearchThisArea}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search this area
        </button>
      )}
      
      {/* Visible businesses counter */}
      {visibleBusinesses.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 text-xs font-medium">
          Showing {visibleBusinesses.length} of {businesses.length} suppliers
        </div>
      )}
    </div>
  );
}
