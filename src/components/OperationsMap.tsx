'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Operation } from '@/lib/types';
import { extractGeoFromText } from '@/lib/geo-dictionary';

const CATEGORY_COLORS: Record<string, string> = {
  hezbollah: '#22c55e',
  enemy: '#ef4444',
  iran: '#f97316',
  iraq_resistance: '#eab308',
  yemen: '#06b6d4',
  statements: '#3b82f6',
  political: '#6b7280',
};

interface Props {
  operations: Operation[];
}

export default function OperationsMap({ operations }: Props) {
  const geoOps = operations
    .map((op) => {
      if (op.lat && op.lon) return { ...op, lat: op.lat, lon: op.lon };
      const geo = extractGeoFromText(op.title + ' ' + op.description);
      if (geo) return { ...op, lat: geo.lat, lon: geo.lon };
      return null;
    })
    .filter(Boolean) as (Operation & { lat: number; lon: number })[];

  return (
    <div className="w-full h-[70vh] rounded-lg overflow-hidden border border-zinc-800">
      <MapContainer
        center={[33.15, 35.4]}
        zoom={10}
        className="w-full h-full"
        style={{ background: '#0a0a0a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {geoOps.map((op) => (
          <CircleMarker
            key={op.id}
            center={[op.lat, op.lon]}
            radius={8}
            fillColor={CATEGORY_COLORS[op.category] || '#6b7280'}
            color={CATEGORY_COLORS[op.category] || '#6b7280'}
            weight={2}
            opacity={0.9}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="text-right" dir="rtl" style={{ minWidth: 200 }}>
                <p className="font-bold text-sm mb-1">{op.title}</p>
                <p className="text-xs text-gray-600">
                  {new Date(op.time).toLocaleTimeString('ar-LB', { timeZone: 'Asia/Beirut', hour: '2-digit', minute: '2-digit' })}
                  {' | '}{op.source}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
