'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix missing marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

interface SupplierLike {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  location?: string | { lat?: number; lng?: number; coordinates?: number[] };
}

interface MiniMapProps {
  lat?: number;
  lng?: number;
  name: string;
  emoji?: string;
  supplier?: SupplierLike;
}

function resolveCoords(
  flat: { lat?: number; lng?: number },
  supplier?: SupplierLike,
): { lat: number; lng: number } | null {
  // 1. Flat props passed directly
  if (typeof flat.lat === 'number' && typeof flat.lng === 'number') {
    return { lat: flat.lat, lng: flat.lng };
  }
  if (!supplier) return null;
  // 2. supplier.latitude / longitude
  if (typeof supplier.latitude === 'number' && typeof supplier.longitude === 'number') {
    return { lat: supplier.latitude, lng: supplier.longitude };
  }
  // 3. supplier.lat / lng aliases
  if (typeof supplier.lat === 'number' && typeof supplier.lng === 'number') {
    return { lat: supplier.lat, lng: supplier.lng };
  }
  // 4. Nested location object or GeoJSON
  const loc = supplier.location as any;
  if (loc && typeof loc === 'object') {
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      return { lat: loc.lat, lng: loc.lng };
    }
    if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
      return { lat: loc.coordinates[1], lng: loc.coordinates[0] };
    }
  }
  return null;
}

function makeEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.28));cursor:default;">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export default function MiniMap({ lat, lng, name, emoji = '📍', supplier }: MiniMapProps) {
  const coords = resolveCoords({ lat, lng }, supplier);

  if (!coords) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 rounded text-xs text-gray-400">
        No location data
      </div>
    );
  }

  return (
    <MapContainer
      key={`minimap-${coords.lat}-${coords.lng}`}
      center={[coords.lat, coords.lng]}
      zoom={13}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      doubleClickZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater lat={coords.lat} lng={coords.lng} />
      <Marker position={[coords.lat, coords.lng]} icon={makeEmojiIcon(emoji)}>
        <Popup>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{emoji} {name}</span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
