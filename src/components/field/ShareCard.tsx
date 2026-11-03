'use client';

import { useRef, useState } from 'react';

export interface CardData {
  date: string;
  dateLabel: string;
  weekday: string;
  dayNo: number;
  total: number;
  enemy: number;
  resistance: number;
  political: number;
  impact: number;
  topEnemy?: [string, number];
  topLocs: [string, number][];
  hours: { enemy: number; resistance: number; political: number }[];
  peak: number;
}

const FORMATS = {
  portrait: { w: 1080, h: 1350, label: 'عمودي 1080×1350 (إنستغرام)' },
  wide: { w: 1200, h: 675, label: 'أفقي 1200×675 (إكس وفيسبوك)' },
} as const;
type Fmt = keyof typeof FORMATS;

const C = { bg: '#080B0F', panel: '#11171F', line: '#2A3644', text: '#E8ECF1', sub: '#B7C0CC', muted: '#9BA6B4', enemy: '#E8622C', res: '#45D39A', pol: '#5B7BD6', gold: '#C9A227' };

function Card({ d, f }: { d: CardData; f: Fmt }) {
  const { w, h } = FORMATS[f];
  const wide = f === 'wide';
  const s = wide ? 0.62 : 1;
  const hmax = Math.max(...d.hours.map((x) => x.enemy + x.resistance + x.political), 1);
  const barH = (wide ? 130 : 300);
  const stats = [
    { v: d.total, l: 'حدثاً موثّقاً', c: C.text },
    { v: d.enemy, l: 'اعتداء للعدو', c: C.enemy },
    { v: d.resistance, l: 'عملية للمقاومة', c: C.res },
    { v: d.impact, l: 'أثر معلن', c: C.gold },
  ];
  return (
    <div dir="rtl" style={{ width: w, height: h, background: C.bg, color: C.text, fontFamily: 'var(--font-plex-ar), sans-serif', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
      backgroundImage: 'linear-gradient(rgba(120,140,160,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,160,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
      <div style={{ background: C.gold, color: '#14110A', fontFamily: 'var(--font-plex-mono), var(--font-plex-ar), monospace', fontWeight: 600, fontSize: 26 * s, padding: `${14 * s}px ${48 * s}px`, display: 'flex', justifyContent: 'space-between' }}>
        <span>موقف ميداني يومي · SITREP {d.dayNo}</span>
        <span>الجبهة اللبنانية</span>
      </div>
      <div style={{ flex: 1, padding: `${44 * s}px ${56 * s}px`, display: 'flex', flexDirection: 'column', gap: 34 * s }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 * s }}>
          <span style={{ color: C.gold, fontSize: 28 * s }}>{d.weekday}</span>
          <span style={{ fontFamily: 'var(--font-noto-kufi), sans-serif', fontWeight: 800, fontSize: 88 * s, lineHeight: 1.15 }}>{d.dateLabel}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: C.line, border: `2px solid ${C.line}` }}>
          {stats.map((x) => (
            <div key={x.l} style={{ background: '#0D1218', padding: `${22 * s}px ${24 * s}px`, display: 'flex', flexDirection: 'column', gap: 6 * s }}>
              <span style={{ fontFamily: 'var(--font-plex-mono), monospace', fontWeight: 600, fontSize: 72 * s, lineHeight: 1, color: x.c }}>{x.v}</span>
              <span style={{ fontSize: 26 * s, color: C.sub }}>{x.l}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 * s }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26 * s }}>
            <span style={{ fontWeight: 600 }}>كثافة الأحداث على مدار 24 ساعة</span>
            <span style={{ color: C.enemy }}>الذروة {String(d.peak).padStart(2, '0')}:00</span>
          </div>
          <div style={{ height: barH, display: 'flex', alignItems: 'flex-end', gap: 5 * s, borderBottom: `2px solid ${C.line}` }}>
            {d.hours.map((x, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', gap: 2 }}>
                {x.enemy > 0 && <div style={{ height: (x.enemy / hmax) * barH, background: C.enemy }} />}
                {x.resistance > 0 && <div style={{ height: (x.resistance / hmax) * barH, background: C.res }} />}
                {x.political > 0 && <div style={{ height: (x.political / hmax) * barH, background: C.pol }} />}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-plex-mono), monospace', fontSize: 20 * s, color: C.muted }}><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
          <div style={{ display: 'flex', gap: 28 * s, fontSize: 22 * s, color: C.sub }}>
            {[['اعتداءات العدو', C.enemy], ['عمليات المقاومة', C.res], ['سياسي', C.pol]].map(([l, c]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 * s }}><span style={{ width: 16 * s, height: 16 * s, background: c }} />{l}</span>
            ))}
          </div>
        </div>
        {wide && d.topLocs.length > 0 && (
          <div style={{ fontSize: 24 * s * 1.3, color: C.sub }}>
            <span style={{ color: C.enemy }}>المواقع الأكثر ذكراً: </span>
            <span style={{ fontWeight: 700, color: C.text }}>{d.topLocs.map(([n]) => n).slice(0, 3).join(' · ')}</span>
          </div>
        )}
        {!wide && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, border: '2px solid #3A2A1F', background: 'rgba(232,98,44,0.07)', padding: '24px 28px' }}>
            <span style={{ color: C.enemy, fontSize: 24 }}>المواقع الأكثر ذكراً</span>
            <span style={{ fontFamily: 'var(--font-noto-kufi), sans-serif', fontWeight: 700, fontSize: 44 }}>{d.topLocs.map(([n]) => n).slice(0, 3).join(' · ') || '—'}</span>
            {d.topEnemy && <span style={{ color: C.sub, fontSize: 28 }}>أبرز الاعتداءات: {d.topEnemy[0]} ({d.topEnemy[1]})</span>}
          </div>
        )}
      </div>
      <div style={{ padding: `${18 * s}px ${56 * s}px`, borderTop: `2px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', fontSize: 24 * s, color: C.muted }}>
        <span style={{ fontFamily: 'var(--font-noto-kufi), sans-serif', fontWeight: 800, color: C.text }}>غرفة الحرب</span>
        <span>warroom-ecru.vercel.app/log/{d.date}</span>
      </div>
    </div>
  );
}

export default function ShareCard({ data }: { data: CardData }) {
  const [open, setOpen] = useState(false);
  const [fmtKey, setFmtKey] = useState<Fmt>('portrait');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const { w, h } = FORMATS[fmtKey];
  const scale = Math.min(1, 520 / w);

  const download = async () => {
    if (!ref.current) return;
    setBusy(true);
    setErr('');
    try {
      const { toPng } = await import('html-to-image');
      await document.fonts.ready;
      const url = await toPng(ref.current, { width: w, height: h, pixelRatio: 1, cacheBust: true, style: { transform: 'none' } });
      const a = document.createElement('a');
      a.href = url;
      a.download = `warroom-sitrep-${data.date}-${fmtKey}.png`;
      a.click();
    } catch {
      setErr('تعذّر توليد الصورة في هذا المتصفح. جرّب متصفحاً آخر.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="h-11 px-4 rounded bg-wr-gold text-[#14110A] text-sm font-bold flex items-center">بطاقة الموقف للنشر</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="بطاقة الموقف للنشر" className="fixed inset-0 z-[2000] bg-black/80 flex items-start md:items-center justify-center overflow-y-auto p-4" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-wr-panel border border-wr-line2 p-4 md:p-5 flex flex-col gap-4 max-w-full">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className="font-kufi text-lg font-bold">بطاقة الموقف للنشر</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" className="w-11 h-11 rounded border border-wr-line2 text-wr-sub hover:text-white">✕</button>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="المقاس">
              {(Object.keys(FORMATS) as Fmt[]).map((k) => (
                <button key={k} type="button" aria-pressed={fmtKey === k} onClick={() => setFmtKey(k)} className={`min-h-10 px-3 rounded border text-sm ${fmtKey === k ? 'border-wr-gold bg-wr-soft' : 'border-wr-line2 bg-wr-deep text-wr-sub'}`}>{FORMATS[k].label}</button>
              ))}
            </div>
            <div className="overflow-hidden border border-wr-line self-center" style={{ width: w * scale, height: h * scale, maxWidth: '100%' }}>
              <div ref={ref} style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top right' }}>
                <Card d={data} f={fmtKey} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <button type="button" onClick={download} disabled={busy} className="h-11 px-5 rounded bg-wr-gold text-[#14110A] text-sm font-bold disabled:opacity-60">{busy ? 'جارٍ التوليد…' : 'تنزيل الصورة PNG'}</button>
              {err && <span className="text-sm text-[#F08A5D]">{err}</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
