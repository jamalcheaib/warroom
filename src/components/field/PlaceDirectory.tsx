'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { PlaceKind } from '@/lib/field-data';
import { PLACE_KIND } from '@/lib/field-format';

export interface DirEntry {
  name: string;
  slug: string;
  total: number;
  enemy: number;
  resistance: number;
  impact: number;
  kind?: PlaceKind;
  hasPoint: boolean;
  side: 'lb' | 'il' | 'none';
}

const SIDES = [
  { k: 'all', l: 'الكل' },
  { k: 'lb', l: 'لبنان' },
  { k: 'il', l: 'فلسطين المحتلة' },
] as const;

export default function PlaceDirectory({ places }: { places: DirEntry[] }) {
  const [q, setQ] = useState('');
  const [side, setSide] = useState<'all' | 'lb' | 'il'>('all');
  const [sort, setSort] = useState<'count' | 'name'>('count');
  const list = useMemo(() => {
    const qq = q.trim();
    const r = places.filter((p) => (side === 'all' || p.side === side) && (!qq || p.name.includes(qq)));
    return sort === 'name' ? [...r].sort((a, b) => a.name.localeCompare(b.name, 'ar')) : r;
  }, [places, q, side, sort]);
  const max = places[0]?.total ?? 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center bg-wr-panel/95 border border-wr-line p-4">
        <label htmlFor="pl-q" className="sr-only">ابحث عن مكان</label>
        <input id="pl-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن بلدة أو موقع…" className="h-11 flex-[1_1_240px] bg-wr-deep border border-wr-line2 rounded px-3 text-sm text-wr-text placeholder:text-wr-dim focus:outline-none focus:border-wr-gold" />
        <div className="flex border border-wr-line2 rounded overflow-hidden" role="group" aria-label="الجهة">
          {SIDES.map((s) => (
            <button key={s.k} type="button" aria-pressed={side === s.k} onClick={() => setSide(s.k)} className={`h-11 px-3 text-sm ${side === s.k ? 'bg-wr-soft text-white' : 'bg-wr-deep text-wr-sub'}`}>{s.l}</button>
          ))}
        </div>
        <div className="flex border border-wr-line2 rounded overflow-hidden" role="group" aria-label="الترتيب">
          <button type="button" aria-pressed={sort === 'count'} onClick={() => setSort('count')} className={`h-11 px-3 text-sm ${sort === 'count' ? 'bg-wr-soft text-white' : 'bg-wr-deep text-wr-sub'}`}>الأكثر ذكراً</button>
          <button type="button" aria-pressed={sort === 'name'} onClick={() => setSort('name')} className={`h-11 px-3 text-sm ${sort === 'name' ? 'bg-wr-soft text-white' : 'bg-wr-deep text-wr-sub'}`}>أبجدياً</button>
        </div>
        <span className="text-[13px] text-wr-muted mr-auto">{list.length} مكاناً</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {list.map((p) => (
          <Link key={p.slug} href={`/places/${p.slug}`} className="bg-wr-panel/95 border border-wr-line px-4 py-3 flex flex-col gap-2 hover:border-wr-gold">
            <span className="flex justify-between items-baseline gap-2">
              <span className="font-semibold truncate">{p.name}</span>
              <span className="font-wrmono text-sm text-wr-sub">{p.total}</span>
            </span>
            <span className="flex h-1.5 bg-wr-soft" style={{ width: `${Math.max(8, Math.round((p.total / max) * 100))}%` }} aria-hidden="true">
              <span style={{ flex: p.enemy, background: '#E8622C' }} />
              <span style={{ flex: p.resistance, background: '#45D39A' }} />
              <span style={{ flex: p.impact, background: '#C9A227' }} />
            </span>
            <span className="text-[11px] text-wr-muted">
              {p.kind ? PLACE_KIND[p.kind] : ''}{p.kind && !p.hasPoint ? ' · ' : ''}{!p.hasPoint ? 'بلا نقطة على الخريطة' : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
