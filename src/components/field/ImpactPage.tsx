import Link from 'next/link';
import { getDay, getIndex, type FieldEvent, type ImpactItem } from '@/lib/field-data';
import { CATEGORY, MONTHS, fmt, formatDateLong, formatGap, placesOf } from '@/lib/field-format';
import SiteHeader from './SiteHeader';
import { BarList, Footer, Kicker, PageFrame, Panel, PanelTitle } from './ui';

const GOLD = '#C9A227';

export default function ImpactPage() {
  const idx = getIndex();
  const all: ImpactItem[] = [];
  const eventsById = new Map<string, FieldEvent>();
  for (const d of idx.days) {
    const f = getDay(d.date);
    if (!f) continue;
    all.push(...f.impact);
    for (const e of f.events) if (e.impacts) eventsById.set(e.id, e);
  }

  const places = new Map<string, number>();
  for (const im of all) for (const p of placesOf(im)) places.set(p.name, (places.get(p.name) ?? 0) + 1);
  const topPlaces = [...places.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value }));

  const types = Object.entries(idx.impactTypes).map(([label, value]) => ({ label, value }));
  const monthKeys = Object.keys(idx.impactByMonth).filter((k) => Object.values(idx.impactByMonth[k]).reduce((a, b) => a + b, 0) > 5);
  const lastDay = idx.lastDate;

  // تجميع الأثر المعلن تحت العملية المرتبطة به
  const groups = new Map<string, { link: NonNullable<ImpactItem['events']>[number]; items: ImpactItem[] }>();
  for (const im of all) {
    if (im.link !== 'linked' || !im.events?.length || im.type === 'صفارات واعتراض') continue;
    const link = im.events[0];
    const g = groups.get(link.id) ?? { link, items: [] };
    g.items.push(im);
    groups.set(link.id, g);
  }
  const chains = [...groups.values()]
    .sort((a, b) => (b.link.date + b.link.time).localeCompare(a.link.date + a.link.time))
    .slice(0, 20)
    .map((g) => ({ ...g, items: g.items.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)) }));

  const links = idx.impactLinks;
  const kpis = [
    { label: 'إجمالي البنود', value: idx.totals.impact },
    ...types.slice(0, 5).map((t) => ({ label: t.label, value: t.value })),
  ];

  return (
    <PageFrame>
      <SiteHeader active="impact" band={{ right: 'الأثر المعلن', left: `${formatDateLong(idx.firstDate)} — ${formatDateLong(lastDay)}` }} />
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <Kicker>ما أقرّت به المصادر الإسرائيلية</Kicker>
          <h1 className="font-kufi text-3xl md:text-[40px] font-extrabold">الأثر المعلن</h1>
          <p className="text-wr-sub text-base md:text-[17px] max-w-[780px] leading-8">
            الصفارات والاعتراضات والخسائر التي أعلنتها وسائل الإعلام والجهات الإسرائيلية، مربوطةً، حيث أمكن، بالعملية التي سبقتها. الأرقام هنا عدد البنود المعلنة لا عدد الإصابات.
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="bg-wr-panel/95 border border-wr-line p-4 flex flex-col gap-1.5">
              <span className="text-[13px] text-wr-muted">{k.label}</span>
              <span className="font-wrmono text-[30px] font-semibold leading-tight">{fmt(k.value)}</span>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap gap-5">
          <Panel corners className="flex-[999_1_620px] flex flex-col gap-4">
            <PanelTitle>الأثر المعلن شهرياً</PanelTitle>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="text-wr-muted text-right">
                    <th scope="col" className="py-2.5 px-2 font-medium border-b border-wr-line">النوع</th>
                    {monthKeys.map((k) => <th key={k} scope="col" className="py-2.5 px-2 font-medium border-b border-wr-line">{MONTHS[Number(k.slice(5)) - 1]}</th>)}
                    <th scope="col" className="py-2.5 px-2 font-medium border-b border-wr-line">الاتجاه</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t) => {
                    const vals = monthKeys.map((k) => idx.impactByMonth[k][t.label] ?? 0);
                    const m = Math.max(...vals, 1);
                    return (
                      <tr key={t.label}>
                        <th scope="row" className="py-3 px-2 border-b border-wr-soft text-right font-normal">{t.label}</th>
                        {vals.map((v, i) => <td key={i} className="py-3 px-2 border-b border-wr-soft font-wrmono">{fmt(v)}</td>)}
                        <td className="py-3 px-2 border-b border-wr-soft">
                          <div className="flex items-end gap-[3px] h-7" aria-hidden="true">
                            {vals.map((v, i) => <span key={i} className="w-3" style={{ height: Math.max(2, (v / m) * 28), background: i === vals.length - 1 ? '#8B96A5' : GOLD }} />)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <span className="text-xs text-wr-dim">آخر شهر حتى {formatDateLong(lastDay)}.</span>
          </Panel>
          <Panel className="flex-[1_1_340px] flex flex-col gap-4">
            <PanelTitle>أين سُجّل الأثر</PanelTitle>
            <BarList items={topPlaces} color={GOLD} />
          </Panel>
        </div>

        <section className="flex flex-col gap-3.5" aria-labelledby="chains-h">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h2 id="chains-h" className="font-kufi text-xl font-bold">من العملية إلى الأثر</h2>
            <div className="flex flex-wrap gap-2 text-[13px]">
              <span className="border border-wr-res text-wr-res rounded px-2.5 py-0.5">مربوط {fmt(links.linked ?? 0)}</span>
              <span className="border border-wr-line2 text-wr-sub rounded px-2.5 py-0.5">مرشّح {fmt(links.candidate ?? 0)}</span>
              <span className="border border-wr-line2 text-wr-sub rounded px-2.5 py-0.5">غير مربوط {fmt(links.unlinked ?? 0)}</span>
            </div>
          </div>
          <p className="text-sm text-wr-muted">أحدث {chains.length} عملية لها أثر معلن مربوط (عدا الصفارات)، مع الفارق الزمني بين العملية وكل إعلان.</p>
          {chains.map(({ link, items }) => {
            const ev = eventsById.get(link.id);
            return (
              <div key={link.id} className="flex flex-wrap items-stretch bg-wr-panel/95 border border-wr-line">
                <Link href={`/log/${link.date}#${link.id}`} className="flex-[1_1_420px] min-w-0 px-5 py-4 flex flex-col gap-2 border-l border-wr-soft hover:bg-white/[0.02]">
                  <span className="flex flex-wrap gap-2 text-xs"><span className="font-semibold" style={{ color: CATEGORY.resistance.text }}>العملية</span><span className="text-wr-muted">{formatDateLong(link.date)} · {link.time} · {link.subtype}{ev && placesOf(ev).length ? ` · ${placesOf(ev).map((p) => p.name).join('، ')}` : ''}</span></span>
                  <span className="text-[15px] leading-7 line-clamp-4">{ev?.text ?? '—'}</span>
                </Link>
                <div className="flex-[1_1_420px] min-w-0 flex flex-col bg-[#141A12]">
                  {items.map((im) => {
                    const gap = im.events!.find((e) => e.id === link.id)?.gap ?? 0;
                    return (
                      <Link key={im.id} href={`/log/${im.date}#${im.id}`} className="flex gap-3 px-5 py-3.5 border-b border-wr-soft last:border-b-0 hover:bg-[#171E14]">
                        <span className="flex-none w-14 flex flex-col items-center gap-0.5 text-wr-muted">
                          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                          <span className="font-wrmono text-xs">{formatGap(gap)}</span>
                        </span>
                        <span className="flex flex-col gap-1 min-w-0">
                          <span className="flex flex-wrap gap-2 text-xs"><span className="font-semibold text-wr-gold">{im.type}</span><span className="text-wr-muted">{im.date !== link.date ? `${formatDateLong(im.date)} · ` : ''}{im.time}{placesOf(im).length ? ` · ${placesOf(im).map((p) => p.name).join('، ')}` : ''}</span></span>
                          <span className="text-[15px] leading-7 line-clamp-3">{im.text}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <p className="text-[13px] text-wr-muted">
          الأرشيف القديم لصفحة «الخسائر الإسرائيلية» متاح في <Link href="/archive/losses" className="text-wr-gold">الأرشيف</Link>.
        </p>
      </main>
      <Footer text={`${fmt(idx.totals.impact)} بنداً من الأثر المعلن · الربط بالعمليات آلي ويُراجَع`} />
    </PageFrame>
  );
}
