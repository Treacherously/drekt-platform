'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Supplier } from '../data/mockData';

interface BusinessMapProps {
  businesses: Supplier[];
  onLocationChange?: (location: { lat: number; lng: number }) => void;
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

export default function BusinessMap({ businesses, onLocationChange }: BusinessMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [manualLocationOverride, setManualLocationOverride] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Metro Manila (HARD FIX)
    if (!mapRef.current) {
      try {
        mapRef.current = L.map(mapContainerRef.current).setView([14.5995, 120.9842], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);

        // Wait for tiles to load before marking map as ready
        mapRef.current.whenReady(() => {
          console.log('Map is fully initialized and ready');
          setMapReady(true);
          // Force recalculation of map size to prevent ghost map
          if (mapRef.current) {
            setTimeout(() => {
              mapRef.current?.invalidateSize();
            }, 100);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        return;
      }

    }

    const map = mapRef.current;
    if (!map) return;

    // Clear existing business markers (but keep user marker)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
        map.removeLayer(layer);
      }
    });

    // Add user location marker if available
    if (userLocation && !userMarkerRef.current) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse-user 2s infinite;
          ">
            <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      userMarkerRef.current = L.marker(userLocation, { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <strong style="color: #2563EB; font-size: 14px;">📍 Your Location</strong>
            <p style="font-size: 11px; color: #6B7280; margin-top: 4px;">
              ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}
            </p>
          </div>
        `);
    }

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

    // Don't auto-fit bounds - keep user's view (Metro Manila or GPS location)
    // This prevents the map from zooming out when filters change

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [businesses, userLocation]);

  // Separate useEffect for HIGH-ACCURACY GPS with visual feedback
  useEffect(() => {
    if (!mapReady || !mapRef.current || userLocation) return;

    const map = mapRef.current;

    // HIGH-ACCURACY GPS REQUEST (Strict Settings)
    console.log('🔍 Requesting HIGH-ACCURACY GPS location...');
    console.log('⚙️ Settings: enableHighAccuracy=true, timeout=10s, maxZoom=16');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
          const accuracy = position.coords.accuracy; // meters
          
          console.log('✅ GPS SUCCESS!');
          console.log('📍 User Location:', userCoords);
          console.log('🎯 Accuracy:', accuracy, 'meters');
          console.log('📊 Full Position Data:', position.coords);
          
          setUserLocation(userCoords);
          setLocationAccuracy(accuracy);
          
          // Notify parent component of initial GPS location
          if (onLocationChange) {
            onLocationChange({ lat: userCoords[0], lng: userCoords[1] });
            console.log('📡 Initial GPS location sent to parent component');
          }

          // Remove old accuracy circle if exists
          if (accuracyCircleRef.current) {
            map.removeLayer(accuracyCircleRef.current);
          }

          // Add ACCURACY CIRCLE (light blue, semi-transparent)
          // Only show if not manually overridden
          if (!manualLocationOverride) {
            accuracyCircleRef.current = L.circle(userCoords, {
              radius: accuracy,
              color: '#3B82F6',
              fillColor: '#60A5FA',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '5, 5',
            }).addTo(map);
          }

          // Remove old user marker if exists
          if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
          }

          // Add BLUE CIRCLE MARKER (distinct from business markers)
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div style="
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 5px solid white;
                box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 4px 12px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse-user 2s infinite;
                position: relative;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  background: white;
                  border-radius: 50%;
                  box-shadow: 0 0 8px rgba(255,255,255,0.8);
                "></div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });

          // Make marker DRAGGABLE for manual location correction
          userMarkerRef.current = L.marker(userCoords, { 
            icon: userIcon,
            draggable: true,  // ✅ Allow user to drag and adjust location
          })
            .addTo(map)
            .bindPopup(`
              <div style="text-align: center; padding: 12px; min-width: 200px;">
                <div style="font-size: 20px; margin-bottom: 8px;">📍</div>
                <strong style="color: #2563EB; font-size: 16px; display: block; margin-bottom: 8px;">You are here</strong>
                <div style="background: #EFF6FF; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                  <p style="font-size: 12px; color: #1E40AF; margin: 4px 0;">
                    <strong>Accuracy:</strong> ${accuracy.toFixed(1)} meters
                  </p>
                  <p style="font-size: 11px; color: #6B7280; margin: 4px 0;">
                    ${accuracy < 50 ? '🟢 Excellent' : accuracy < 100 ? '🟡 Good' : '🟠 Fair'}
                  </p>
                </div>
                <p style="font-size: 10px; color: #9CA3AF; margin: 4px 0;">
                  ${userCoords[0].toFixed(6)}, ${userCoords[1].toFixed(6)}
                </p>
              </div>
            `, { maxWidth: 250 })
            .bindTooltip('📍 Drag me to your exact location', {
              permanent: true,
              direction: 'top',
              offset: [0, -25],
              className: 'user-location-tooltip',
            })
            .openPopup(); // Auto-open popup

          // Add dragend event listener for manual location adjustment
          userMarkerRef.current.on('dragend', (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            const newCoords: [number, number] = [position.lat, position.lng];
            
            console.log('🎯 MANUAL LOCATION OVERRIDE!');
            console.log('📍 New Location:', newCoords);
            console.log('📏 Old Location:', userCoords);
            
            // Update state with manually adjusted location
            setUserLocation(newCoords);
            setManualLocationOverride(true);
            
            // Notify parent component (App.tsx) for Sort by Nearest integration
            if (onLocationChange) {
              onLocationChange({ lat: newCoords[0], lng: newCoords[1] });
              console.log('📡 Location change sent to parent component');
            }
            
            // Remove accuracy circle since user confirmed exact location
            if (accuracyCircleRef.current) {
              map.removeLayer(accuracyCircleRef.current);
              accuracyCircleRef.current = null;
              console.log('✅ Accuracy circle removed (manual override)');
            }
            
            // Update popup with new coordinates
            marker.setPopupContent(`
              <div style="text-align: center; padding: 12px; min-width: 200px;">
                <div style="font-size: 20px; margin-bottom: 8px;">📍</div>
                <strong style="color: #2563EB; font-size: 16px; display: block; margin-bottom: 8px;">You are here</strong>
                <div style="background: #10B981; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                  <p style="font-size: 12px; color: white; margin: 4px 0; font-weight: bold;">
                    ✓ Manually Adjusted
                  </p>
                  <p style="font-size: 11px; color: #D1FAE5; margin: 4px 0;">
                    Location confirmed by you
                  </p>
                </div>
                <p style="font-size: 10px; color: #9CA3AF; margin: 4px 0;">
                  ${newCoords[0].toFixed(6)}, ${newCoords[1].toFixed(6)}
                </p>
              </div>
            `);
            
            marker.openPopup();
          });

          // SAFE FLYTO: Zoom to user location
          if (map && mapReady) {
            setTimeout(() => {
              if (map) {
                try {
                  map.flyTo(userCoords, 16, {
                    animate: true,
                    duration: 2.0,
                  });
                  console.log('🚀 Flying to user location (zoom 16)');
                } catch (error) {
                  console.error('❌ Error during flyTo:', error);
                }
              }
            }, 800);
          }
        },
        (error) => {
          // CRITICAL: Show alert on GPS failure (NO SILENT FALLBACK)
          console.error('❌ GPS FAILED:', error);
          console.error('Error Code:', error.code);
          console.error('Error Message:', error.message);
          
          let errorMsg = 'GPS Failed: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += 'Location permission denied. Please enable location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += 'Location information unavailable. Check if GPS is enabled on your device.';
              break;
            case error.TIMEOUT:
              errorMsg += 'Location request timed out after 10 seconds. Try again or check your GPS signal.';
              break;
            default:
              errorMsg += error.message;
          }
          
          alert(errorMsg);
          console.log('⚠️ Staying at Metro Manila default view');
        },
        {
          enableHighAccuracy: true,  // FORCE GPS HARDWARE (not WiFi/IP)
          timeout: 10000,             // Wait 10 seconds before giving up
          maximumAge: 0,              // Don't use cached location
        }
      );
    } else {
      alert('GPS Failed: Geolocation is not supported by your browser.');
      console.error('❌ Geolocation not supported');
    }
  }, [mapReady, userLocation, manualLocationOverride]);

  return (
    <div className="relative w-full h-[calc(100vh-250px)] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainerRef} className="w-full h-full" />
      <MapLegend />
      
      {/* GPS Status Indicator with Accuracy */}
      {userLocation && (
        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 text-xs font-medium">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${manualLocationOverride ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
            <span className="font-semibold">{manualLocationOverride ? 'Manual Location' : 'GPS Active'}</span>
          </div>
          {!manualLocationOverride && locationAccuracy && (
            <div className="text-[10px] text-gray-600 dark:text-gray-400">
              Accuracy: {locationAccuracy.toFixed(1)}m
              {locationAccuracy < 50 ? ' 🟢' : locationAccuracy < 100 ? ' 🟡' : ' 🟠'}
            </div>
          )}
          {manualLocationOverride && (
            <div className="text-[10px] text-green-600 dark:text-green-400">
              ✓ User confirmed
            </div>
          )}
        </div>
      )}
      
      {/* Add CSS animations for user marker and tooltip */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-user {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .user-location-tooltip {
          background: rgba(37, 99, 235, 0.95) !important;
          border: 2px solid white !important;
          border-radius: 8px !important;
          padding: 6px 12px !important;
          font-weight: 600 !important;
          font-size: 11px !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
          white-space: nowrap !important;
        }
        .user-location-tooltip::before {
          border-top-color: white !important;
        }
      `}} />
    </div>
  );
}
