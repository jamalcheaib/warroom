'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { FieldEvent } from '@/lib/field-data';
import { CATEGORY, formatCoords } from '@/lib/field-format';

export default function FieldMap({ events }: { events: FieldEvent[] }) {
  const pts = events.filter((e) => e.lat != null && e.lon != null);
  const missing = events.length - pts.length;
  return (
    <div className="flex flex-col gap-2">
      <div className="h-[70vh] border border-wr-line2 overflow-hidden">
        <MapContainer center={[33.25, 35.45]} zoom={10} className="w-full h-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {pts.map((e) => {
            const c = CATEGORY[e.category].color;
            const area = e.geo === 'area';
            return (
              <CircleMarker
                key={e.id}
                center={[e.lat!, e.lon!]}
                radius={area ? 14 : 7}
                pathOptions={{ color: c, fillColor: c, weight: area ? 1 : 2, opacity: 0.9, fillOpacity: area ? 0.12 : 0.55, dashArray: area ? '4 4' : undefined }}
              >
                <Popup>
                  <div dir="rtl" className="text-right" style={{ minWidth: 220, maxWidth: 300 }}>
                    <div style={{ color: CATEGORY[e.category].text, fontWeight: 700, fontSize: 13 }}>{e.time} · {e.subtype}</div>
                    <div style={{ fontSize: 13, margin: '6px 0', lineHeight: 1.6 }}>{e.text.slice(0, 220)}{e.text.length > 220 ? '…' : ''}</div>
                    <div style={{ fontSize: 11, color: '#9BA6B4' }}>{e.location} · {formatCoords(e.lat, e.lon, e.geo)}</div>
                    {e.url ? <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#C9A227' }}>{e.source} ↗</a> : <span style={{ fontSize: 12 }}>{e.source}</span>}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <span className="text-xs text-wr-muted">
        {pts.length} حدثاً على الخريطة{missing > 0 ? ` · ${missing} بلا موقع محدد` : ''} · الدوائر المتقطعة = منطقة لا بلدة محددة
      </span>
    </div>
  );
}
