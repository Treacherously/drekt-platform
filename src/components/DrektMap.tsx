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

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapSupplier {
  _id: string;
  businessName: string;
  industry: string;
  location: string | { lat?: number; lng?: number; coordinates?: number[] };
  status: string;
  entityType: string[];
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  markerEmoji?: string;
}

// ─── Resilient coordinate resolver ────────────────────────────────────────────

function resolveCoords(s: MapSupplier): { lat: number; lng: number } | null {
  // 1. Flat latitude / longitude (primary schema)
  if (typeof s.latitude === 'number' && typeof s.longitude === 'number') {
    return { lat: s.latitude, lng: s.longitude };
  }
  // 2. Flat lat / lng aliases
  if (typeof s.lat === 'number' && typeof s.lng === 'number') {
    return { lat: s.lat, lng: s.lng };
  }
  // 3. Nested location object with lat/lng or GeoJSON coordinates [lng, lat]
  const loc = s.location as any;
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

// ─── Emoji derivation ─────────────────────────────────────────────────────────

const ENTITY_EMOJI: Record<string, string> = {
  FARMER: '🚜',
  MANUFACTURER: '🏭',
  LOGISTICS: '🚛',
  WAREHOUSE: '🏪',
  AGRICULTURE: '🌾',
  DISTRIBUTOR: '📦',
  SUPPLIER: '🏢',
  PROCESSOR: '⚙️',
};

function resolveEmoji(supplier: MapSupplier): string {
  if (supplier.markerEmoji) return supplier.markerEmoji;
  const primary = supplier.entityType?.[0];
  return (primary && ENTITY_EMOJI[primary]) ?? '📍';
}

// ─── Leaflet DivIcon factory ───────────────────────────────────────────────────

function makeEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="
      font-size:26px;
      line-height:1;
      filter:drop-shadow(0 2px 4px rgba(0,0,0,0.30));
      cursor:pointer;
      user-select:none;
    ">${emoji}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  VERIFIED: 'bg-brand-primary/10 text-brand-accent',
  FEATURED: 'bg-yellow-100 text-yellow-700',
  PENDING: 'bg-gray-100 text-gray-500',
};

// ─── Legend ─────────────────────────────────────────────────────────────

const LEGEND = Object.entries(ENTITY_EMOJI);

// ─── MapUpdater ───────────────────────────────────────────────────

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { animate: true, duration: 1.5 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);
  return null;
}

// ─── User location icon ──────────────────────────────────────────────

const userLocationIcon = L.divIcon({
  html: `<div style="
    width:18px;
    height:18px;
    background:#2563eb;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 5px rgba(37,99,235,0.25),0 2px 6px rgba(0,0,0,0.25);
  "></div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DrektMap({
  suppliers: propSuppliers,
  userLocation,
}: {
  suppliers: MapSupplier[];
  userLocation?: { lat: number; lng: number } | null;
}) {
  const suppliersWithCoords = propSuppliers
    .map((s) => ({ s, coords: resolveCoords(s) }))
    .filter((x): x is { s: MapSupplier; coords: { lat: number; lng: number } } => x.coords !== null);
  const mapped = suppliersWithCoords.length;
  const total = propSuppliers.length;

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div>
          <h1 className="font-heading font-bold text-base text-gray-900">DrektMAP</h1>
          <p className="text-xs text-gray-400">
            {`${mapped} of ${total} filtered result${total !== 1 ? 's' : ''} mapped · Philippines`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {LEGEND.map(([type, emoji]) => (
            <span key={type} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
              <span>{emoji}</span>
              <span className="capitalize">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <MapContainer
          key="drekt-global-map"
          center={[12.8797, 121.774]}
          zoom={6}
          scrollWheelZoom
          className="z-0"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <>
              <MapUpdater center={[userLocation.lat, userLocation.lng]} />
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>
                  <div style={{ minWidth: '140px' }}>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: '#2563eb', marginBottom: '2px' }}>📍 Your Location</p>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>GPS coordinates</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {suppliersWithCoords.map(({ s, coords }) => {
            const emoji = resolveEmoji(s);
            const locLabel = typeof s.location === 'string' ? s.location : 'Metro Manila';
            return (
              <Marker
                key={s._id}
                position={[coords.lat, coords.lng]}
                icon={makeEmojiIcon(emoji)}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#111' }}>
                      {emoji} {s.businessName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      {s.industry} · {locLabel}
                    </p>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        marginBottom: '8px',
                      }}
                      className={STATUS_STYLE[s.status] ?? 'bg-gray-100 text-gray-500'}
                    >
                      {s.status}
                    </span>
                    <br />
                    <a
                      href={`/suppliers?q=${encodeURIComponent(s.businessName)}`}
                      style={{ fontSize: '12px', color: '#002db3', fontWeight: 600 }}
                    >
                      View Profile →
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* No-coordinates notice */}
        {mapped === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/90 pointer-events-none">
            <p className="text-3xl mb-3">🗺️</p>
            <p className="text-sm font-semibold text-gray-700">No suppliers with coordinates yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs text-center">
              Set <code>latitude</code> and <code>longitude</code> on a supplier record to have it appear on the map.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
