import type { Metadata } from 'next';
import SiteHeader from '@/components/field/SiteHeader';
import PoliticalTrack, { type PolItem } from '@/components/field/PoliticalTrack';
import { ACTORS, actorOf } from '@/lib/political';
import { Footer, Kicker, PageFrame, Panel, PanelTitle, Swatch } from '@/components/field/ui';
import { getAllEvents, getIndex } from '@/lib/field-data';
import { MONTHS, fmt, formatDateLong } from '@/lib/field-format';

export const metadata: Metadata = {
  title: 'المسار السياسي | غرفة الحرب',
  description: 'تصريحات العدو وقراراته، ومواقف المقاومة ولبنان الرسمي، وإعلانات الوسيط، على الجبهة اللبنانية.',
};

export default function PoliticalPage() {
  const idx = getIndex();
  const items: PolItem[] = getAllEvents()
    .filter((e) => e.category === 'political')
    .map((e) => ({ id: e.id, date: e.date, time: e.time, subtype: e.subtype, text: e.text, source: e.source, url: e.url, verification: e.verification }));

  const months = [...new Set(idx.days.map((d) => d.date.slice(0, 7)))];
  const grid = months.map((m) => {
    const row: Record<string, number> = {};
    for (const i of items) if (i.date.startsWith(m)) row[actorOf(i.subtype)] = (row[actorOf(i.subtype)] ?? 0) + 1;
    return { m, row, total: Object.values(row).reduce((a, b) => a + b, 0) };
  }).filter((g) => g.total > 0);
  const gmax = Math.max(...grid.map((g) => g.total), 1);

  return (
    <PageFrame>
      <SiteHeader active="political" band={{ right: 'المسار السياسي', left: `${formatDateLong(idx.firstDate)} — ${formatDateLong(idx.lastDate)}` }} />
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Kicker>{fmt(items.length)} بنداً سياسياً</Kicker>
          <h1 className="font-kufi text-3xl md:text-[40px] font-extrabold">المسار السياسي</h1>
          <p className="text-wr-sub leading-7 max-w-[780px]">ما قيل وقُرّر حول الجبهة: تصريحات العدو الإسرائيلي وقراراته وتهديداته، وبيانات المقاومة، والقرارات الرسمية اللبنانية، وإعلانات الوسيط، وحوادث اليونيفيل.</p>
        </div>
        <Panel corners className="flex flex-col gap-4">
          <PanelTitle action={<div className="flex flex-wrap gap-4 text-[13px] text-wr-sub">{ACTORS.map((a) => <span key={a.key} className="flex items-center gap-1.5"><Swatch color={a.color} />{a.label}</span>)}</div>}>الإيقاع الشهري حسب الجهة</PanelTitle>
          <div className="flex flex-col gap-3">
            {grid.map((g) => (
              <div key={g.m} className="flex items-center gap-3">
                <span className="w-24 flex-none text-sm">{MONTHS[Number(g.m.slice(5)) - 1]} {g.m.slice(0, 4)}</span>
                <div className="flex-1 flex h-6 gap-px" style={{ maxWidth: `${(g.total / gmax) * 100}%` }} role="img" aria-label={`${g.total} بنداً`}>
                  {ACTORS.map((a) => g.row[a.key] ? <div key={a.key} title={`${a.label}: ${g.row[a.key]}`} style={{ flex: g.row[a.key], background: a.color }} /> : null)}
                </div>
                <span className="w-10 font-wrmono text-sm text-wr-sub">{g.total}</span>
              </div>
            ))}
          </div>
        </Panel>
        <PoliticalTrack items={items} />
      </main>
      <Footer text="التصنيف حسب الجهة مشتق من نوع البند في ملف الرصد" />
    </PageFrame>
  );
}
