'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORY, formatDateLong } from '@/lib/field-format';

type Point = [number, number, number, number, number, number, number]; // day, layer, lat, lon, subtype, location, geo
interface MapData { days: string[]; subtypes: string[]; locations: string[]; points: Point[] }

const LAYERS = [
  { key: 0, label: CATEGORY.enemy.label, color: CATEGORY.enemy.color },
  { key: 1, label: CATEGORY.resistance.label, color: CATEGORY.resistance.color },
  { key: 2, label: CATEGORY.political.label, color: CATEGORY.political.color },
  { key: 3, label: 'الأثر المعلن', color: '#C9A227' },
];
type Mode = 'day' | 'week' | 'cumulative';
const MODES: { key: Mode; label: string }[] = [
  { key: 'day', label: 'يوم واحد' },
  { key: 'week', label: 'آخر 7 أيام' },
  { key: 'cumulative', label: 'تراكمي' },
];

export default function TimeMap() {
  const [data, setData] = useState<MapData | null>(null);
  const [error, setError] = useState(false);
  const [day, setDay] = useState(0);
  const [mode, setMode] = useState<Mode>('week');
  const [layers, setLayers] = useState<Set<number>>(new Set([0, 1, 3]));
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/data/map.json')
      .then((r) => r.json())
      .then((d: MapData) => {
        setData(d);
        setDay(d.days.length - 1);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!playing || !data) return;
    timer.current = setInterval(() => {
      setDay((d) => {
        if (d >= data.days.length - 1) {
          setPlaying(false);
          return d;
        }
        return d + 1;
      });
    }, 450);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, data]);

  const from = mode === 'day' ? day : mode === 'week' ? Math.max(0, day - 6) : 0;
  const visible = useMemo(() => {
    if (!data) return [];
    return data.points.filter((p) => p[0] >= from && p[0] <= day && layers.has(p[1]));
  }, [data, from, day, layers]);

  const stats = useMemo(() => {
    const byLayer = [0, 0, 0, 0];
    const byLoc = new Map<number, number>();
    for (const p of visible) {
      byLayer[p[1]]++;
      if (p[6] !== 2 && p[1] < 3) byLoc.set(p[5], (byLoc.get(p[5]) ?? 0) + 1);
    }
    return { byLayer, top: [...byLoc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8) };
  }, [visible]);

  if (error) return <div className="p-8 text-wr-muted">تعذّر تحميل بيانات الخريطة.</div>;
  if (!data) return <div className="h-[75vh] flex items-center justify-center text-wr-muted text-sm">جارٍ تحميل بيانات الخريطة…</div>;

  const toggle = (k: number) => {
    const n = new Set(layers);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    setLayers(n);
  };
  const startPlay = () => {
    if (day >= data.days.length - 1) setDay(0);
    setPlaying(true);
  };

  return (
    <div className="flex flex-wrap gap-5 items-start">
      <div className="flex-[999_1_640px] min-w-0 flex flex-col gap-3">
        <div className="h-[62vh] md:h-[72vh] border border-wr-line2 overflow-hidden">
          <MapContainer center={[33.3, 35.5]} zoom={9} preferCanvas className="w-full h-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {visible.map((p, i) => {
              const L = LAYERS[p[1]];
              const area = p[6] === 2;
              const today = p[0] === day;
              return (
                <CircleMarker
                  key={`${p[0]}-${i}`}
                  center={[p[2], p[3]]}
                  radius={area ? 12 : today ? 6 : 4}
                  pathOptions={{ color: L.color, fillColor: L.color, weight: today ? 1.5 : 0.5, opacity: today ? 1 : 0.5, fillOpacity: area ? 0.08 : today ? 0.7 : 0.3 }}
                >
                  <Popup>
                    <div dir="rtl" className="text-right" style={{ minWidth: 180 }}>
                      <div style={{ fontWeight: 700, color: L.color }}>{data.subtypes[p[4]]}</div>
                      <div style={{ fontSize: 13 }}>{data.locations[p[5]]}</div>
                      <a href={`/log/${data.days[p[0]]}`} style={{ fontSize: 12, color: '#C9A227' }}>{formatDateLong(data.days[p[0]])} ←</a>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
        <div className="bg-wr-panel/95 border border-wr-line p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => (playing ? setPlaying(false) : startPlay())} aria-label={playing ? 'إيقاف التشغيل' : 'تشغيل التسلسل الزمني'} className="w-11 h-11 rounded bg-wr-gold text-[#14110A] flex items-center justify-center flex-none">
              {playing ? (
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
              ) : (
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'scaleX(-1)' }}><path d="M7 4l13 8-13 8z" /></svg>
              )}
            </button>
            <div className="flex flex-col">
              <span className="font-kufi text-lg font-bold">{formatDateLong(data.days[day])}</span>
              <span className="text-xs text-wr-muted">
                {mode === 'day' ? 'هذا اليوم فقط' : `من ${formatDateLong(data.days[from])}`} · {visible.length} نقطة
              </span>
            </div>
            <div className="mr-auto flex border border-wr-line2 rounded overflow-hidden" role="group" aria-label="نطاق العرض">
              {MODES.map((m) => (
                <button key={m.key} type="button" aria-pressed={mode === m.key} onClick={() => setMode(m.key)} className={`h-11 px-3 text-sm ${mode === m.key ? 'bg-wr-soft text-white' : 'bg-wr-deep text-wr-sub'}`}>{m.label}</button>
              ))}
            </div>
          </div>
          <label htmlFor="wr-day" className="sr-only">اليوم</label>
          <input id="wr-day" type="range" min={0} max={data.days.length - 1} value={day} onChange={(e) => { setPlaying(false); setDay(Number(e.target.value)); }} className="w-full accent-[#C9A227]" dir="rtl" />
          <div className="flex justify-between font-wrmono text-[11px] text-wr-dim">
            <span>{formatDateLong(data.days[0])}</span>
            <span>{formatDateLong(data.days[data.days.length - 1])}</span>
          </div>
        </div>
      </div>

      <aside className="flex-[1_1_280px] min-w-0 flex flex-col gap-4">
        <div className="bg-wr-panel/95 border border-wr-line p-4 flex flex-col gap-3">
          <h2 className="font-kufi text-base font-bold">الطبقات</h2>
          {LAYERS.map((L) => (
            <label key={L.key} className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={layers.has(L.key)} onChange={() => toggle(L.key)} className="w-[18px] h-[18px]" style={{ accentColor: L.color }} />
              {L.label}
              <span className="mr-auto font-wrmono" style={{ color: L.color }}>{stats.byLayer[L.key]}</span>
            </label>
          ))}
          <p className="text-xs text-wr-muted leading-6 border-t border-wr-soft pt-3">النقاط المضيئة: أحداث اليوم المحدد. الباهتة: الأيام السابقة ضمن النطاق. الدوائر الكبيرة الشفافة: مناطق لا بلدات محددة.</p>
        </div>
        <div className="bg-wr-panel/95 border border-wr-line p-4 flex flex-col gap-2">
          <h2 className="font-kufi text-base font-bold">الأكثر ذكراً في النطاق</h2>
          {stats.top.length === 0 && <span className="text-sm text-wr-muted">لا نقاط.</span>}
          {stats.top.map(([loc, n]) => (
            <div key={loc} className="flex justify-between text-sm border-b border-wr-soft py-1.5">
              <span>{data.locations[loc]}</span>
              <span className="font-wrmono text-wr-muted">{n}</span>
            </div>
          ))}
          <a href={`/log/${data.days[day]}`} className="mt-2 text-sm text-wr-gold">سجل {formatDateLong(data.days[day])} ←</a>
        </div>
      </aside>
    </div>
  );
}
