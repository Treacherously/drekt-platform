'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

interface MiniMapProps {
  lat: number;
  lng: number;
  name: string;
  emoji?: string;
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

export default function MiniMap({ lat, lng, name, emoji = '📍' }: MiniMapProps) {
  return (
    <MapContainer
      key={`minimap-${lat}-${lng}`}
      center={[lat, lng]}
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
      <MapUpdater lat={lat} lng={lng} />
      <Marker position={[lat, lng]} icon={makeEmojiIcon(emoji)}>
        <Popup>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{emoji} {name}</span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
