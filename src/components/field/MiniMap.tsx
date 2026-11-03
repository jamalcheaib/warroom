'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MiniMap({ points }: { points: { name: string; count: number; lat: number; lon: number }[] }) {
  const max = Math.max(...points.map((p) => p.count), 1);
  return (
    <MapContainer center={[33.3, 35.45]} zoom={9} className="w-full h-full" scrollWheelZoom={false} attributionControl={false}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
      {points.map((p) => (
        <CircleMarker
          key={p.name}
          center={[p.lat, p.lon]}
          radius={4 + Math.sqrt(p.count / max) * 14}
          pathOptions={{ color: '#E8622C', fillColor: '#E8622C', weight: 1, fillOpacity: 0.35 }}
        >
          <Tooltip direction="top">
            <span dir="rtl">{p.name} · {p.count}</span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
