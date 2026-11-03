'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { Category, DayFile, FieldEvent, Verification } from '@/lib/field-data';
import { CATEGORY, CATEGORY_ORDER, NO_POINT_KINDS, PLACE_KIND, VERIFICATION, formatCoords, formatGap, placesOf, shortCode } from '@/lib/field-format';

const FieldMap = dynamic(() => import('./FieldMap'), {
  ssr: false,
  loading: () => <div className="h-[70vh] border border-wr-line bg-wr-deep flex items-center justify-center text-wr-muted text-sm">جارٍ تحميل الخريطة…</div>,
});

const VER_ORDER: Verification[] = ['official', 'multi', 'single'];
const CLAMP = 480;

function EventText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > CLAMP;
  return (
    <div className="px-4 py-3.5">
      <p className="text-base leading-8 whitespace-pre-line">{long && !open ? text.slice(0, CLAMP).replace(/\s+\S*$/, '') + '…' : text}</p>
      {long && (
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="mt-1 min-h-9 text-sm text-wr-gold hover:underline">
          {open ? 'إخفاء' : 'اقرأ المزيد'}
        </button>
      )}
    </div>
  );
}

function CategoryIcon({ c }: { c: Category }) {
  const p = { 'aria-hidden': true, width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (c === 'enemy') return <svg {...p}><circle cx="12" cy="12" r="7" /><path d="M12 2v5M12 17v5M2 12h5M17 12h5" /></svg>;
  if (c === 'resistance') return <svg {...p}><path d="M5 19l4-4M14 4l6 6-9 9-6-6 9-9z" /></svg>;
  return <svg {...p}><path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18" /></svg>;
}

function VerBars({ v }: { v: Verification }) {
  const lvl = VERIFICATION[v].level;
  return (
    <span className="flex items-center gap-0.5" title={VERIFICATION[v].label}>
      {[1, 2, 3].map((i) => (
        <span key={i} className="w-2 h-2" style={{ background: i <= lvl ? '#E8ECF1' : '#2A3644' }} />
      ))}
      <span className="pr-1.5">{VERIFICATION[v].label}</span>
    </span>
  );
}

function toCsv(rows: FieldEvent[]): string {
  const head = ['المعرف', 'التاريخ', 'الوقت', 'الفئة', 'النوع', 'النص', 'الموقع', 'خط العرض', 'خط الطول', 'دقة الموقع', 'التحقق', 'المصدر', 'الرابط'];
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((e) => [e.id, e.date, e.time, CATEGORY[e.category].label, e.subtype, e.text, placesOf(e).map((p) => p.name).join('، '), e.lat, e.lon, e.geo, VERIFICATION[e.verification].label, e.source, e.url].map(esc).join(','));
  return '﻿' + [head.join(','), ...lines].join('\n');
}

export default function FieldLog({ day, placeLinks = {} }: { day: DayFile; placeLinks?: Record<string, string> }) {
  const [q, setQ] = useState('');
  const [cats, setCats] = useState<Set<Category>>(new Set(CATEGORY_ORDER));
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [vers, setVers] = useState<Set<Verification>>(new Set(VER_ORDER));
  const [src, setSrc] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [copied, setCopied] = useState<string | null>(null);
  const [panel, setPanel] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Category, number> = { enemy: 0, resistance: 0, political: 0 };
    const s = new Map<string, { n: number; cat: Category }>();
    const so = new Map<string, number>();
    for (const e of day.events) {
      c[e.category]++;
      const k = s.get(e.subtype) ?? { n: 0, cat: e.category };
      k.n++;
      s.set(e.subtype, k);
      if (e.source) so.set(e.source, (so.get(e.source) ?? 0) + 1);
    }
    return { c, subs: [...s.entries()].sort((a, b) => b[1].n - a[1].n), sources: [...so.keys()].sort() };
  }, [day.events]);
  const subMax = counts.subs[0]?.[1].n ?? 1;

  const filtered = useMemo(() => {
    const qq = q.trim();
    return day.events
      .filter((e) => cats.has(e.category) && vers.has(e.verification))
      .filter((e) => subs.size === 0 || subs.has(e.subtype))
      .filter((e) => !src || e.source === src)
      .filter((e) => !qq || e.text.includes(qq) || placesOf(e).some((p) => p.name.includes(qq)) || (e.mentions ?? []).some((p) => p.name.includes(qq)) || e.subtype.includes(qq))
      .sort((a, b) => b.time.localeCompare(a.time));
  }, [day.events, q, cats, subs, vers, src]);

  const toggle = <T,>(set: Set<T>, v: T, fn: (s: Set<T>) => void) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    fn(n);
  };
  const reset = () => {
    setQ('');
    setCats(new Set(CATEGORY_ORDER));
    setSubs(new Set());
    setVers(new Set(VER_ORDER));
    setSrc('');
  };
  const download = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `warroom-${day.date}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/log/${day.date}#${id}`);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex flex-wrap gap-6 items-start">
      <aside className="flex-[1_1_270px] min-w-0 flex flex-col gap-5 bg-wr-panel/95 border border-wr-line p-[18px]">
        <div className="flex justify-between items-center">
          <h2 className="font-kufi text-base font-bold">
            <button type="button" aria-expanded={panel} aria-controls="wr-filters" onClick={() => setPanel(!panel)} className="md:pointer-events-none flex items-center gap-2 min-h-11">
              لوحة التصفية
              <span aria-hidden="true" className="md:hidden text-wr-gold">{panel ? '▴' : '▾'}</span>
            </button>
          </h2>
          <button type="button" onClick={reset} className="min-h-11 px-1 text-[13px] text-wr-gold">مسح</button>
        </div>
        <div id="wr-filters" className={`${panel ? 'flex' : 'hidden'} md:flex flex-col gap-5`}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wr-q" className="font-wrmono text-xs text-wr-muted">بحث</label>
          <input id="wr-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="بلدة، سلاح، جهة…" className="h-[42px] bg-wr-deep border border-wr-line2 rounded px-3 text-sm text-wr-text placeholder:text-wr-dim focus:outline-none focus:border-wr-gold" />
        </div>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="font-wrmono text-xs text-wr-muted pb-2">الفئة</legend>
          {CATEGORY_ORDER.map((c) => (
            <label key={c} className="flex items-center gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={cats.has(c)} onChange={() => toggle(cats, c, setCats)} className="w-[18px] h-[18px]" style={{ accentColor: CATEGORY[c].color }} />
              {CATEGORY[c].label}
              <span className="mr-auto font-wrmono" style={{ color: CATEGORY[c].text }}>{counts.c[c]}</span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <span className="font-wrmono text-xs text-wr-muted pb-1">النوع {subs.size > 0 && <span className="text-wr-gold">· {subs.size} محدد</span>}</span>
          {counts.subs.map(([s, v]) => {
            const on = subs.has(s);
            return (
              <button key={s} type="button" aria-pressed={on} onClick={() => toggle(subs, s, setSubs)} className={`flex items-center gap-2 text-[13px] text-right px-2 min-h-9 rounded border ${on ? 'border-wr-gold bg-wr-soft' : 'border-transparent hover:bg-wr-soft/60'}`}>
                <span className="flex-1 min-w-0 truncate">{s}</span>
                <span className="w-16 h-1.5 bg-wr-soft"><span className="block h-1.5" style={{ width: `${Math.round((v.n / subMax) * 100)}%`, background: CATEGORY[v.cat].color }} /></span>
                <span className="w-6 font-wrmono text-wr-muted text-left">{v.n}</span>
              </button>
            );
          })}
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="font-wrmono text-xs text-wr-muted pb-2">مستوى التحقق</legend>
          {VER_ORDER.map((v) => (
            <label key={v} className="flex gap-2.5 items-center text-sm cursor-pointer">
              <input type="checkbox" checked={vers.has(v)} onChange={() => toggle(vers, v, setVers)} className="w-[18px] h-[18px] accent-[#C9A227]" />
              {VERIFICATION[v].label}
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wr-src" className="font-wrmono text-xs text-wr-muted">المصدر</label>
          <select id="wr-src" value={src} onChange={(e) => setSrc(e.target.value)} className="h-[42px] bg-wr-deep border border-wr-line2 rounded px-2.5 text-sm text-wr-text">
            <option value="">كل المصادر</option>
            {counts.sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        </div>
      </aside>

      <section className="flex-[999_1_640px] min-w-0 flex flex-col gap-3">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-kufi text-xl font-bold">التسلسل الزمني للأحداث</h2>
            <span className="text-[13px] text-wr-muted">يُعرض {filtered.length} من {day.events.length} · الأحدث أولاً · توقيت بيروت</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={download} className="h-11 px-4 rounded border border-wr-line2 bg-wr-deep text-sm text-wr-text hover:border-wr-gold">تنزيل CSV</button>
            <div className="flex border border-wr-line2 rounded overflow-hidden" role="group" aria-label="طريقة العرض">
              {(['list', 'map'] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`h-11 px-4 text-sm ${view === v ? 'bg-wr-soft text-white' : 'bg-wr-deep text-wr-sub'}`}>
                  {v === 'list' ? 'تسلسل' : 'خريطة'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === 'map' ? (
          <FieldMap events={filtered} />
        ) : (
          <div className="flex flex-col">
            {filtered.map((e) => {
              const C = CATEGORY[e.category];
              return (
                <article key={e.id} id={e.id} className="flex items-stretch scroll-mt-28">
                  <div className="flex-none w-[62px] md:w-[78px] flex flex-col items-center pt-3.5 gap-1">
                    <span className="font-wrmono text-base md:text-lg font-semibold text-wr-text">{e.time}</span>
                    <span className="flex-1 w-px bg-wr-line2" />
                  </div>
                  <div className="flex-1 min-w-0 mb-3 bg-wr-panel/95 border border-wr-line flex flex-col" style={{ borderRightWidth: 4, borderRightColor: C.color }}>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 px-4 py-2.5 border-b border-wr-soft bg-wr-bg/60">
                      <span className="w-[30px] h-[30px] border flex items-center justify-center" style={{ borderColor: C.color, color: C.text }}><CategoryIcon c={e.category} /></span>
                      <span className="font-kufi text-sm font-bold" style={{ color: C.text }}>{e.subtype}</span>
                      {placesOf(e).map((p, i) => (
                        <span key={p.name} className="flex items-center gap-1.5">
                          {i > 0 && <span className="text-wr-dim">·</span>}
                          {placeLinks[p.name] ? (
                            <a href={`/places/${placeLinks[p.name]}`} className="text-sm font-semibold hover:text-wr-gold underline decoration-wr-line2 underline-offset-4">{p.name}</a>
                          ) : (
                            <span className="text-sm font-semibold">{p.name}</span>
                          )}
                          {p.kind && p.kind !== 'area' && <span className="text-[11px] text-wr-gold border border-wr-line2 px-1">{PLACE_KIND[p.kind]}</span>}
                          {(i === 0 || p.lat == null) && !(p.kind && NO_POINT_KINDS.includes(p.kind)) && <span className="font-wrmono text-[11px] text-wr-dim">{formatCoords(p.lat, p.lon, p.geo)}</span>}
                        </span>
                      ))}
                      <span className="mr-auto font-wrmono text-[11px] text-wr-dim">{shortCode(e.id)}</span>
                    </div>
                    <EventText text={e.text} />
                    {e.mentions && e.mentions.length > 0 && (
                      <div className="px-4 -mt-1.5 pb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-wr-muted">
                        <span>مذكور في النص:</span>
                        {e.mentions.map((m) => placeLinks[m.name] ? (
                          <a key={m.name} href={`/places/${placeLinks[m.name]}`} className="text-wr-sub hover:text-wr-gold border border-dashed border-wr-line2 px-1.5">{m.name}</a>
                        ) : (
                          <span key={m.name} className="text-wr-sub border border-dashed border-wr-line2 px-1.5">{m.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center px-4 pb-3 text-xs text-wr-muted">
                      <VerBars v={e.verification} />
                      {e.url ? <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-wr-sub hover:text-white">{e.source} ↗</a> : <span>{e.source}</span>}
                      {e.duplicates && e.duplicates.length > 0 && <span title={e.duplicates.join('، ')}>+{e.duplicates.length} مصادر مكرِّرة</span>}
                      {e.impacts?.map((im) => (
                        <a key={im.id} href={im.date === day.date ? `#${im.id}` : `/log/${im.date}#${im.id}`} className="bg-wr-gold text-[#14110A] px-2 py-0.5 font-semibold">
                          أثر معلن: {im.type} {formatGap(im.gap)} ←
                        </a>
                      ))}
                      <button type="button" onClick={() => copyLink(e.id)} className="mr-auto min-h-8 text-wr-muted hover:text-white">{copied === e.id ? 'نُسخ ✓' : 'نسخ الرابط'}</button>
                    </div>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && <div className="text-center text-wr-muted py-16 border border-wr-line bg-wr-panel/80">لا أحداث تطابق التصفية.</div>}
          </div>
        )}

        {day.impact.length > 0 && (
          <section className="mt-6 flex flex-col gap-3" aria-labelledby="impact-h">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="impact-h" className="font-kufi text-xl font-bold">الأثر المعلن في هذا اليوم</h2>
              <span className="text-[13px] text-wr-muted">{day.impact.length} بنداً · ما أقرّت به المصادر الإسرائيلية</span>
            </div>
            <div className="flex flex-col gap-2">
              {[...day.impact].sort((a, b) => b.time.localeCompare(a.time)).map((im) => (
                <div key={im.id} id={im.id} className="scroll-mt-28 flex flex-wrap gap-x-4 gap-y-2 items-start bg-[#141A12]/90 border border-wr-line px-4 py-3" style={{ borderRightWidth: 4, borderRightColor: '#C9A227' }}>
                  <span className="font-wrmono text-sm font-semibold w-12">{im.time}</span>
                  <span className="font-kufi text-sm font-bold text-wr-gold w-28">{im.type}</span>
                  <div className="flex-[1_1_320px] min-w-0 flex flex-col gap-1.5">
                    <p className="text-[15px] leading-7">{im.text}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-wr-muted">
                      {placesOf(im).length > 0 && <span>{placesOf(im).map((p) => p.name).join('، ')}</span>}
                      {im.url ? <a href={im.url} target="_blank" rel="noopener noreferrer" className="text-wr-sub hover:text-white">{im.source} ↗</a> : <span>{im.source}</span>}
                      {im.events?.map((ev) => (
                        <a key={ev.id} href={ev.date === day.date ? `#${ev.id}` : `/log/${ev.date}#${ev.id}`} className="text-wr-res hover:underline">→ العملية: {ev.subtype} {ev.time}</a>
                      ))}
                      {im.link === 'candidate' && <span>ربط مرشّح غير مؤكد</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
