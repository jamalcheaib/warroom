import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDay, getIndex, getPlace, type FieldEvent, type ImpactItem } from '@/lib/field-data';
import { CATEGORY, CATEGORY_ORDER, MONTHS, PLACE_KIND, VERIFICATION, fmt, formatCoords, formatDateLong } from '@/lib/field-format';
import SiteHeader from './SiteHeader';
import MiniMapClient from './MiniMapClient';
import { Footer, Kicker, PageFrame, Panel, PanelTitle, Swatch } from './ui';

const GOLD = '#C9A227';

export default function PlacePage({ slug }: { slug: string }) {
  const place = getPlace(slug);
  if (!place) notFound();
  const idx = getIndex();

  // اجلب الأحداث والأثر من ملفات الأيام
  const items: ({ t: 'e'; o: FieldEvent; m: boolean } | { t: 'i'; o: ImpactItem; m: boolean })[] = [];
  const wanted = new Map<string, Map<string, boolean>>();
  for (const r of place.refs) {
    const [d, id] = r;
    if (!wanted.has(d)) wanted.set(d, new Map());
    const cur = wanted.get(d)!;
    cur.set(id, (cur.get(id) ?? true) && r[2] === 'm');
  }
  for (const [d, ids] of wanted) {
    const day = getDay(d);
    if (!day) continue;
    for (const e of day.events) if (ids.has(e.id)) items.push({ t: 'e', o: e, m: ids.get(e.id)! });
    for (const i of day.impact) if (ids.has(i.id)) items.push({ t: 'i', o: i, m: ids.get(i.id)! });
  }
  items.sort((a, b) => (b.o.date + b.o.time).localeCompare(a.o.date + a.o.time));
  const byDate = new Map<string, typeof items>();
  for (const it of items) {
    if (!byDate.has(it.o.date)) byDate.set(it.o.date, []);
    byDate.get(it.o.date)!.push(it);
  }

  const months = Object.keys(idx.days.reduce((m, d) => ({ ...m, [d.date.slice(0, 7)]: 1 }), {} as Record<string, number>));
  const mmax = Math.max(...Object.values(place.months), 1);
  const kindLabel = place.kind ? PLACE_KIND[place.kind] : place.geo === 'area' ? 'منطقة' : 'بلدة / موقع';
  const c = place.counts;
  const readouts = [
    { v: place.total, l: 'ذكراً في السجل', color: '#E8ECF1' },
    { v: c.enemy ?? 0, l: CATEGORY.enemy.label, color: CATEGORY.enemy.text },
    { v: c.resistance ?? 0, l: CATEGORY.resistance.label, color: CATEGORY.resistance.text },
    { v: c.political ?? 0, l: 'سياسي', color: CATEGORY.political.text },
    { v: c.impact ?? 0, l: 'أثر معلن', color: GOLD },
  ];
  const mentioned = c.mention ?? 0;

  return (
    <PageFrame>
      <SiteHeader active="places" band={{ right: `ملف المكان · ${place.name}`, left: `${formatDateLong(place.first)} — ${formatDateLong(place.last)}` }} />
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-6">
        <nav aria-label="مسار التنقل" className="text-[13px] text-wr-muted"><Link href="/places" className="hover:text-white">الأماكن</Link> ← {place.name}</nav>
        <div className="flex flex-wrap gap-5">
          <Panel corners className="flex-[999_1_600px] flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Kicker>{kindLabel}{place.lat != null ? ` · ${formatCoords(place.lat, place.lon, place.geo === 'town' ? undefined : place.geo)}` : ''}</Kicker>
              <h1 className="font-kufi text-3xl md:text-[42px] font-extrabold leading-tight">{place.name}</h1>
              {place.note && <p className="text-wr-sub leading-7 max-w-[680px]">{place.note}</p>}
              <p className="text-sm text-wr-muted">أول ذكر: {formatDateLong(place.first)} · آخر ذكر: {formatDateLong(place.last)}{mentioned ? ` · منها ${fmt(mentioned)} ذكراً في نص أخبار عن أماكن أخرى` : ''}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-wr-line2 border border-wr-line2">
              {readouts.map((r, i) => (
                <div key={r.l} className={`bg-wr-deep px-4 py-3.5 flex flex-col gap-1 min-w-0 ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}>
                  <span className="font-wrmono text-[30px] font-semibold leading-none" style={{ color: r.color }}>{fmt(r.v)}</span>
                  <span className="text-[13px] text-wr-sub truncate">{r.l}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold">الذكر شهرياً</span>
              <div className="flex items-end gap-2 h-20 border-b border-[#3A4656]" role="img" aria-label="عدد مرات الذكر في كل شهر">
                {months.map((m) => (
                  <div key={m} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                    <span className="font-wrmono text-[11px] text-wr-muted">{place.months[m] ?? 0}</span>
                    <div className="w-full max-w-12" style={{ height: ((place.months[m] ?? 0) / mmax) * 56, background: '#E8622C' }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 text-[11px] text-wr-dim">{months.map((m) => <span key={m} className="flex-1 text-center">{MONTHS[Number(m.slice(5)) - 1]}</span>)}</div>
            </div>
          </Panel>
          <div className="flex-[1_1_340px] min-w-0 min-h-[300px] border border-wr-line overflow-hidden bg-wr-deep">
            {place.lat != null ? (
              <MiniMapClient points={[{ name: place.name, count: place.total, lat: place.lat, lon: place.lon! }]} center={[place.lat, place.lon!]} zoom={place.geo === 'area' ? 11 : 12} />
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-sm text-wr-muted leading-7">
                {place.kind === 'region' || place.kind === 'concept' || place.kind === 'river' ? 'هذا المكان لا يُمثَّل بنقطة واحدة على الخريطة.' : 'لم تُحدَّد إحداثيات هذا المكان بعد.'}
              </div>
            )}
          </div>
        </div>

        <Panel className="flex flex-col gap-4">
          <PanelTitle action={<span className="text-[13px] text-wr-muted">{fmt(items.length)} بنداً · الأحدث أولاً</span>}>السجل الكامل</PanelTitle>
          <div className="flex flex-wrap gap-4 text-[13px] text-wr-sub">
            {CATEGORY_ORDER.map((k) => <span key={k} className="flex items-center gap-1.5"><Swatch color={CATEGORY[k].color} />{CATEGORY[k].label}</span>)}
            <span className="flex items-center gap-1.5"><Swatch color={GOLD} />أثر معلن</span>
          </div>
          {[...byDate.entries()].map(([d, list]) => (
            <section key={d} aria-label={formatDateLong(d)} className="flex flex-col">
              <h3 className="py-2 mt-2 border-b border-wr-line2 flex justify-between items-baseline">
                <Link href={`/log/${d}`} className="font-kufi font-bold hover:text-wr-gold">{formatDateLong(d)}</Link>
                <span className="font-wrmono text-xs text-wr-muted">{list.length}</span>
              </h3>
              {list.map(({ t, o, m }) => {
                const color = t === 'e' ? CATEGORY[(o as FieldEvent).category].color : GOLD;
                const label = t === 'e' ? (o as FieldEvent).subtype : `أثر معلن · ${(o as ImpactItem).type}`;
                return (
                  <Link key={o.id} href={`/log/${o.date}#${o.id}`} className="flex gap-3.5 py-3 border-b border-wr-soft items-start hover:bg-white/[0.02]">
                    <span className="font-wrmono text-[13px] text-wr-dim w-11 flex-none pt-0.5">{o.time}</span>
                    <span className="w-1 self-stretch flex-none" style={{ background: color }} />
                    <span className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs font-semibold flex flex-wrap gap-2" style={{ color: t === 'e' ? CATEGORY[(o as FieldEvent).category].text : GOLD }}>{label}{m && <span className="text-wr-muted font-normal border border-dashed border-wr-line2 px-1.5">مذكور في النص</span>}</span>
                      <span className="text-[15px] leading-7 line-clamp-3">{o.text}</span>
                      <span className="text-xs text-wr-muted">{t === 'e' ? VERIFICATION[(o as FieldEvent).verification].label + ' · ' : ''}{o.source}</span>
                    </span>
                  </Link>
                );
              })}
            </section>
          ))}
        </Panel>
      </main>
      <Footer text={`مصدر الإحداثيات: ${place.source === 'wikidata' ? 'Wikidata (CC0)' : place.source === 'manual' ? 'تدقيق يدوي' : '—'}`} />
    </PageFrame>
  );
}
