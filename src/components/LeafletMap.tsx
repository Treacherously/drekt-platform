'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// ── Leaflet default icon fix (webpack breaks default _getIconUrl) ─────────────
function fixLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// ── Custom colored icons ──────────────────────────────────────────────────────
function createColoredIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 14px; height: 14px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const icons = {
  operational: createColoredIcon('#16a34a'),
  warning: createColoredIcon('#f59e0b'),
  disrupted: createColoredIcon('#ef4444'),
  hub: createColoredIcon('#002db3'),
};

// ── Map marker data ───────────────────────────────────────────────────────────
const HUBS = [
  {
    name: 'Manila Port',
    coords: [14.5995, 120.9842] as [number, number],
    type: 'hub' as const,
    detail: 'Major international gateway · NCR',
  },
  {
    name: 'Cebu International Port',
    coords: [10.2990, 123.9043] as [number, number],
    type: 'hub' as const,
    detail: 'Visayas logistics hub · Region VII',
  },
  {
    name: 'Davao Port',
    coords: [7.1907, 125.4553] as [number, number],
    type: 'hub' as const,
    detail: 'Mindanao gateway · Region XI',
  },
  {
    name: 'Subic Bay Freeport',
    coords: [14.7942, 120.2724] as [number, number],
    type: 'hub' as const,
    detail: 'Freeport zone · Region III',
  },
];

const SUPPLIERS = [
  {
    name: 'San Miguel Yamamura (PKG-001)',
    coords: [14.2116, 121.1650] as [number, number],
    type: 'operational' as const,
    detail: 'Packaging Manufacturer · Calamba, Laguna',
  },
  {
    name: 'NutriAsia Inc.',
    coords: [14.7600, 120.9300] as [number, number],
    type: 'warning' as const,
    detail: 'Condiments Manufacturer · Marilao, Bulacan — Monitoring',
  },
  {
    name: 'Selecta Dairy (Disrupted)',
    coords: [15.0794, 120.6200] as [number, number],
    type: 'disrupted' as const,
    detail: 'Food Manufacturer · Pampanga — ⚠ Typhoon disruption',
  },
  {
    name: 'Atlas Fertilizer Cebu',
    coords: [10.1400, 123.7500] as [number, number],
    type: 'operational' as const,
    detail: 'Chemical Supplier · Talisay, Cebu',
  },
];

// Disrupted routes as polylines
const DISRUPTED_ROUTES: { positions: [number, number][]; label: string; severity: 'critical' | 'warning' }[] = [
  {
    positions: [[15.0794, 120.6200], [14.5995, 120.9842]],
    label: 'Pampanga → Manila Port (Typhoon Carina)',
    severity: 'critical',
  },
  {
    positions: [[10.1400, 123.7500], [10.2990, 123.9043]],
    label: 'Talisay → Cebu Port (Monsoon Advisory)',
    severity: 'warning',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function LeafletMap() {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer
      center={[12.8797, 121.7740]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Disrupted route lines */}
      {DISRUPTED_ROUTES.map((route, i) => (
        <Polyline
          key={i}
          positions={route.positions}
          pathOptions={{
            color: route.severity === 'critical' ? '#ef4444' : '#f59e0b',
            weight: 2.5,
            dashArray: '6 4',
            opacity: 0.8,
          }}
        >
          <Popup>
            <div className="text-xs font-medium">{route.label}</div>
          </Popup>
        </Polyline>
      ))}

      {/* Logistics hubs */}
      {HUBS.map((hub) => (
        <Marker key={hub.name} position={hub.coords} icon={icons.hub}>
          <Popup>
            <div>
              <p className="font-semibold text-xs text-[#002db3] mb-0.5">{hub.name}</p>
              <p className="text-xs text-gray-500">{hub.detail}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Supplier markers */}
      {SUPPLIERS.map((s) => (
        <Marker key={s.name} position={s.coords} icon={icons[s.type]}>
          <Popup>
            <div>
              <p className="font-semibold text-xs text-gray-800 mb-0.5">{s.name}</p>
              <p className="text-xs text-gray-500">{s.detail}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
