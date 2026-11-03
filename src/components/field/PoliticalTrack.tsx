'use client';

import { useMemo, useState } from 'react';
import type { Verification } from '@/lib/field-data';
import { VERIFICATION, formatDateLong } from '@/lib/field-format';
import { ACTORS, actorOf, type ActorKey } from '@/lib/political';

export interface PolItem {
  id: string;
  date: string;
  time: string;
  subtype: string;
  text: string;
  source?: string;
  url?: string;
  verification: Verification;
}

export default function PoliticalTrack({ items }: { items: PolItem[] }) {
  const [actor, setActor] = useState<ActorKey | 'all'>('all');
  const [sub, setSub] = useState('');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(60);

  const subs = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of items) if (actor === 'all' || actorOf(i.subtype) === actor) m.set(i.subtype, (m.get(i.subtype) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items, actor]);

  const list = useMemo(() => {
    const qq = q.trim();
    return items
      .filter((i) => (actor === 'all' || actorOf(i.subtype) === actor) && (!sub || i.subtype === sub) && (!qq || i.text.includes(qq)))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [items, actor, sub, q]);

  const shown = list.slice(0, limit);
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-wr-panel/95 border border-wr-line p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="الجهة">
          <button type="button" aria-pressed={actor === 'all'} onClick={() => { setActor('all'); setSub(''); }} className={`min-h-10 px-3 rounded border text-sm ${actor === 'all' ? 'border-wr-gold bg-wr-soft' : 'border-wr-line2 bg-wr-deep text-wr-sub'}`}>الكل · {items.length}</button>
          {ACTORS.map((a) => {
            const n = items.filter((i) => actorOf(i.subtype) === a.key).length;
            return (
              <button key={a.key} type="button" aria-pressed={actor === a.key} onClick={() => { setActor(a.key); setSub(''); }} className={`min-h-10 px-3 rounded border text-sm flex items-center gap-2 ${actor === a.key ? 'border-wr-gold bg-wr-soft' : 'border-wr-line2 bg-wr-deep text-wr-sub'}`}>
                <span aria-hidden="true" className="w-2.5 h-2.5" style={{ background: a.color }} />{a.label} · {n}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <label htmlFor="pol-sub" className="sr-only">النوع</label>
          <select id="pol-sub" value={sub} onChange={(e) => setSub(e.target.value)} className="h-11 bg-wr-deep border border-wr-line2 rounded px-2.5 text-sm text-wr-text">
            <option value="">كل الأنواع</option>
            {subs.map(([s, n]) => <option key={s} value={s}>{s} ({n})</option>)}
          </select>
          <label htmlFor="pol-q" className="sr-only">بحث</label>
          <input id="pol-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في النص: 1701، وقف إطلاق النار، الليطاني…" className="h-11 flex-[1_1_260px] bg-wr-deep border border-wr-line2 rounded px-3 text-sm text-wr-text placeholder:text-wr-dim focus:outline-none focus:border-wr-gold" />
          <span className="text-[13px] text-wr-muted">{list.length} بنداً</span>
        </div>
      </div>

      <div className="flex flex-col">
        {shown.map((i, n) => {
          const a = ACTORS.find((x) => x.key === actorOf(i.subtype))!;
          const head = n === 0 || shown[n - 1].date !== i.date;
          return (
            <div key={i.id}>
              {head && <h3 className="font-kufi font-bold pt-5 pb-2 border-b border-wr-line2"><a href={`/log/${i.date}`} className="hover:text-wr-gold">{formatDateLong(i.date)}</a></h3>}
              <article className="flex gap-3.5 py-3 border-b border-wr-soft items-start">
                <span className="font-wrmono text-[13px] text-wr-dim w-11 flex-none pt-0.5">{i.time}</span>
                <span className="w-1 self-stretch flex-none" style={{ background: a.color }} />
                <span className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-xs font-semibold" style={{ color: a.color }}>{i.subtype}</span>
                  <span className="text-[15px] leading-7 whitespace-pre-line line-clamp-6">{i.text}</span>
                  <span className="flex flex-wrap gap-3 text-xs text-wr-muted">
                    <span>{VERIFICATION[i.verification].label}</span>
                    {i.url ? <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-wr-sub hover:text-white">{i.source} ↗</a> : <span>{i.source}</span>}
                    <a href={`/log/${i.date}#${i.id}`} className="text-wr-gold">في السجل ←</a>
                  </span>
                </span>
              </article>
            </div>
          );
        })}
      </div>
      {list.length > limit && (
        <button type="button" onClick={() => setLimit(limit + 80)} className="self-center h-11 px-6 rounded border border-wr-line2 bg-wr-deep text-sm hover:border-wr-gold">عرض المزيد ({list.length - limit} متبقٍ)</button>
      )}
    </div>
  );
}
