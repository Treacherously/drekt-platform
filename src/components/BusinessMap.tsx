'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Supplier } from '../data/mockData';

interface BusinessMapProps {
  businesses: Supplier[];
}

// Map Legend Component
const MapLegend = () => {
  return (
    <div className="absolute bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-[1000]">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Business Types
      </h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-700 dark:text-gray-300">Producer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-700 dark:text-gray-300">Distributor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-700 dark:text-gray-300">Supplier</span>
        </div>
      </div>
    </div>
  );
};

export default function BusinessMap({ businesses }: BusinessMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Philippines
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([12.8797, 121.7740], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each business
    const markers: L.Marker[] = [];
    
    businesses.forEach((business) => {
      if (business.latitude && business.longitude) {
        // Determine marker color based on business role
        let markerColor = '#3B82F6'; // Blue for Supplier (default)
        if (business.role === 'Producer') {
          markerColor = '#10B981'; // Green
        } else if (business.role === 'Distributor') {
          markerColor = '#EF4444'; // Red
        }

        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${markerColor};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([business.latitude, business.longitude], {
          icon: customIcon,
        }).addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #111827;">
              ${business.name}
            </h3>
            <p style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
              <strong>Type:</strong> ${business.role}
            </p>
            <p style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
              <strong>Category:</strong> ${business.productCategory}
            </p>
            <p style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
              <strong>Location:</strong> ${business.city}
            </p>
            <a 
              href="/supplier/${business.id}" 
              style="
                display: inline-block;
                background-color: #2563EB;
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                text-decoration: none;
                font-size: 12px;
                font-weight: 500;
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

    // Fit map bounds to show all markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [businesses]);

  return (
    <div className="relative w-full h-[calc(100vh-250px)] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full" />
      <MapLegend />
    </div>
  );
}
