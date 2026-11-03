import Link from 'next/link';
import { getDay, getIndex } from '@/lib/field-data';
import { CATEGORY, CATEGORY_ORDER, MONTHS, VERIFICATION, fmt, formatDateLong, formatDayShort, placesOf } from '@/lib/field-format';
import { ANNOTATIONS } from '@/data/annotations';
import { articles } from '@/data/articles';
import SiteHeader from './SiteHeader';
import MiniMapClient from './MiniMapClient';
import { BarList, Footer, Kicker, PageFrame, Panel, PanelTitle, Swatch } from './ui';

const IMPACT_COLOR = '#C9A227';

export default function Dashboard() {
  const idx = getIndex();
  const t = idx.totals;
  const last = getDay(idx.lastDate)!;
  const peakDay = idx.days.reduce((a, b) => (b.total > a.total ? b : a));

  // أسابيع تبدأ من أول يوم رصد
  const weeks: { start: string; enemy: number; resistance: number; political: number; total: number }[] = [];
  idx.days.forEach((d, i) => {
    const w = Math.floor(i / 7);
    if (!weeks[w]) weeks[w] = { start: d.date, enemy: 0, resistance: 0, political: 0, total: 0 };
    weeks[w].enemy += d.enemy;
    weeks[w].resistance += d.resistance;
    weeks[w].political += d.political;
    weeks[w].total += d.total;
  });
  const wmax = Math.max(...weeks.map((w) => w.total), 1);
  const H = 230;
  const marks = ANNOTATIONS.map((a) => {
    const i = idx.days.findIndex((d) => d.date === a.date);
    return i < 0 ? null : { ...a, week: Math.floor(i / 7) };
  }).filter(Boolean) as { date: string; label: string; week: number }[];

  // أشهر
  const months = new Map<string, { total: number; enemy: number; resistance: number; political: number; impact: number; days: number }>();
  for (const d of idx.days) {
    const k = d.date.slice(0, 7);
    const m = months.get(k) ?? { total: 0, enemy: 0, resistance: 0, political: 0, impact: 0, days: 0 };
    m.total += d.total; m.enemy += d.enemy; m.resistance += d.resistance; m.political += d.political; m.impact += d.impact; m.days++;
    months.set(k, m);
  }

  const top = (o: Record<string, number>, n: number) =>
    Object.entries(o).filter(([k]) => k !== 'أخرى').sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }));

  const latest = [...last.events].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6);
  const ver = idx.verification;

  const kpis = [
    { label: 'حدثاً موثّقاً', value: t.events, sub: `${idx.days.length} يوماً من الرصد`, color: '#E8ECF1' },
    { label: CATEGORY.resistance.label, value: t.resistance, sub: 'بيانات رسمية', color: CATEGORY.resistance.color },
    { label: CATEGORY.enemy.label, value: t.enemy, sub: `منها ${fmt(idx.subtypes.enemy['غارة جوية'] ?? 0)} غارة جوية`, color: CATEGORY.enemy.color },
    { label: 'المسار السياسي', value: t.political, sub: 'تصريحات وقرارات', color: CATEGORY.political.color },
    { label: 'الأثر المعلن', value: t.impact, sub: `${fmt(idx.impactLinks.linked ?? 0)} مربوطاً بعملية`, color: IMPACT_COLOR },
    { label: 'ذروة يومية', value: peakDay.total, sub: formatDateLong(peakDay.date), color: '#8B96A5', href: `/log/${peakDay.date}` },
  ];

  return (
    <PageFrame>
      <SiteHeader active="home" band={{ right: 'لوحة الجبهة · ملخّص الرصد', left: `${formatDateLong(idx.firstDate)} — ${formatDateLong(idx.lastDate)} · توقيت بيروت` }} />
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-6">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Kicker color="#45D39A">● آخر تحديث: {formatDateLong(idx.lastDate)}</Kicker>
            <h1 className="font-kufi text-3xl md:text-[42px] font-extrabold leading-tight">سجلّ الجبهة اللبنانية</h1>
            <p className="text-wr-sub text-base md:text-[17px] max-w-[720px] leading-8">
              رصد يومي موثَّق للعمليات والاعتداءات والمسار السياسي، من {formatDateLong(idx.firstDate)} إلى {formatDateLong(idx.lastDate)}، مع مستوى التحقق ومصدر كل حدث وموقعه.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/map" className="h-11 px-4 rounded border border-wr-line2 bg-wr-deep text-sm flex items-center hover:border-wr-gold">الخريطة الزمنية</Link>
            <Link href={`/log/${idx.lastDate}`} className="h-11 px-4 rounded bg-wr-gold text-[#14110A] text-sm font-bold flex items-center">موقف اليوم الأخير ←</Link>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((k) => {
            const body = (
              <>
                <span className="text-[13px] text-wr-muted flex items-center gap-2"><Swatch color={k.color} />{k.label}</span>
                <span className="font-wrmono text-[30px] font-semibold leading-tight">{fmt(k.value)}</span>
                <span className="text-xs text-wr-dim">{k.sub}</span>
              </>
            );
            const cls = 'relative bg-wr-panel/95 border border-wr-line p-4 flex flex-col gap-1.5 min-w-0';
            return k.href ? <Link key={k.label} href={k.href} className={`${cls} hover:border-wr-gold`}>{body}</Link> : <div key={k.label} className={cls}>{body}</div>;
          })}
        </section>

        <div className="flex flex-wrap gap-5">
          <Panel corners className="flex-[999_1_620px] flex flex-col gap-4">
            <PanelTitle action={
              <div className="flex flex-wrap gap-4 text-[13px] text-wr-sub">
                {CATEGORY_ORDER.map((c) => <span key={c} className="flex items-center gap-1.5"><Swatch color={CATEGORY[c].color} />{CATEGORY[c].label}</span>)}
              </div>
            }>إيقاع الجبهة — أسبوعياً</PanelTitle>
            <div className="relative flex items-end gap-1.5 md:gap-2 border-b border-[#3A4656] pt-8" style={{ height: H + 32 }} role="img" aria-label={`عدد الأحداث أسبوعياً على مدى ${weeks.length} أسبوعاً`}>
              {weeks.map((w, i) => (
                <Link key={w.start} href={`/log/${w.start}`} title={`أسبوع ${formatDayShort(w.start)}: اعتداءات ${w.enemy} · مقاومة ${w.resistance} · سياسي ${w.political}`} className="relative flex-1 min-w-0 flex flex-col-reverse gap-px h-full justify-start group">
                  <div style={{ height: (w.enemy / wmax) * H, background: CATEGORY.enemy.color }} />
                  <div style={{ height: (w.resistance / wmax) * H, background: CATEGORY.resistance.color }} />
                  <div style={{ height: (w.political / wmax) * H, background: CATEGORY.political.color }} />
                  <span className="absolute inset-0 group-hover:bg-white/5" />
                  {marks.filter((m) => m.week === i).map((m) => (
                    <span key={m.date} className="absolute top-0 bottom-0 right-1/2 border-r border-dashed border-[#6B7787] pointer-events-none">
                      <span className="absolute -top-8 translate-x-1/2 whitespace-nowrap text-[11px] md:text-xs bg-wr-soft border border-wr-line2 rounded px-2 py-0.5 text-wr-text">{m.label} · {formatDayShort(m.date)}</span>
                    </span>
                  ))}
                </Link>
              ))}
            </div>
            <div className="flex gap-1.5 md:gap-2 font-wrmono text-[10px] md:text-[11px] text-wr-dim">
              {weeks.map((w, i) => <span key={w.start} className="flex-1 min-w-0 text-center">{i % 2 === 0 ? formatDayShort(w.start) : ''}</span>)}
            </div>
          </Panel>

          <Panel className="flex-[1_1_320px] flex flex-col gap-4">
            <PanelTitle>مستوى التحقق</PanelTitle>
            <p className="text-sm text-wr-muted leading-7">كل حدث منشور يحمل وسماً يبيّن كيف تأكّدنا منه.</p>
            <div className="flex h-3.5 gap-0.5 overflow-hidden rounded">
              <div style={{ flex: ver.official, background: '#E8ECF1' }} />
              <div style={{ flex: ver.multi, background: '#8B96A5' }} />
              <div style={{ flex: ver.single, background: '#3A4656' }} />
            </div>
            <div className="flex flex-col gap-2.5 text-sm">
              {(['official', 'multi', 'single'] as const).map((v, i) => (
                <div key={v} className="flex justify-between">
                  <span className="flex gap-2 items-center"><Swatch round color={['#E8ECF1', '#8B96A5', '#3A4656'][i]} />{VERIFICATION[v].label}</span>
                  <span className="font-wrmono">{fmt(ver[v] ?? 0)}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto border-t border-wr-soft pt-3.5 text-[13px] text-wr-muted leading-7">
              {fmt(t.geolocated)} حدثاً محدد الموقع على الخريطة من أصل {fmt(t.withLocation)} حدثاً يذكر مكاناً.
            </div>
          </Panel>
        </div>

        <div className="flex flex-wrap gap-5">
          <Panel className="flex-[1_1_360px] flex flex-col gap-4">
            <PanelTitle><span className="flex items-center gap-2"><Swatch color={CATEGORY.resistance.color} />عمليات المقاومة حسب السلاح</span></PanelTitle>
            <BarList items={top(idx.subtypes.resistance, 6)} color={CATEGORY.resistance.color} />
          </Panel>
          <Panel className="flex-[1_1_360px] flex flex-col gap-4">
            <PanelTitle><span className="flex items-center gap-2"><Swatch color={CATEGORY.enemy.color} />اعتداءات العدو حسب النوع</span></PanelTitle>
            <BarList items={top(idx.subtypes.enemy, 6)} color={CATEGORY.enemy.color} />
          </Panel>
          <Panel className="flex-[1_1_360px] flex flex-col gap-3">
            <PanelTitle action={<Link href="/map" className="text-[13px] text-wr-gold">الخريطة ←</Link>}>المواقع الأكثر ذكراً</PanelTitle>
            <div className="h-[220px] border border-wr-soft overflow-hidden"><MiniMapClient points={idx.topLocations} /></div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
              {idx.topLocations.slice(0, 10).map((l) => (
                <div key={l.name} className="flex justify-between border-b border-wr-soft py-1"><span>{l.name}</span><span className="font-wrmono text-wr-muted">{l.count}</span></div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel className="flex flex-col gap-4">
          <PanelTitle>حصاد الأشهر</PanelTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...months.entries()].filter(([, m]) => m.days > 3).map(([k, m]) => {
              const [y, mo] = k.split('-').map(Number);
              return (
                <Link key={k} href={`/log/${idx.days.find((d) => d.date.startsWith(k))!.date}`} className="bg-wr-deep border border-wr-line p-4 flex flex-col gap-2 hover:border-wr-gold">
                  <span className="font-kufi text-lg font-bold">{MONTHS[mo - 1]} {y}</span>
                  <span className="font-wrmono text-2xl font-semibold">{fmt(m.total)} <span className="text-sm text-wr-muted font-plex">حدثاً · {m.days} يوماً</span></span>
                  <div className="flex h-2 gap-px">
                    {CATEGORY_ORDER.map((c) => <div key={c} style={{ flex: m[c], background: CATEGORY[c].color }} />)}
                  </div>
                  <span className="text-xs text-wr-sub leading-6">
                    {fmt(m.enemy)} اعتداء · {fmt(m.resistance)} عملية · {fmt(m.political)} سياسي · {fmt(m.impact)} أثر معلن
                  </span>
                </Link>
              );
            })}
          </div>
        </Panel>

        <div className="flex flex-wrap gap-5">
          <Panel className="flex-[999_1_620px] flex flex-col">
            <PanelTitle action={<Link href={`/log/${idx.lastDate}`} className="text-[13px] text-wr-gold">السجل الكامل ({last.events.length} حدثاً) ←</Link>}>
              آخر الأحداث · {formatDateLong(idx.lastDate)}
            </PanelTitle>
            <div className="mt-3">
              {latest.map((e) => (
                <Link key={e.id} href={`/log/${e.date}#${e.id}`} className="flex gap-3.5 py-3 border-t border-wr-soft items-start hover:bg-white/[0.02]">
                  <span className="font-wrmono text-[13px] text-wr-dim w-11 flex-none pt-0.5">{e.time}</span>
                  <span className="w-1 self-stretch flex-none" style={{ background: CATEGORY[e.category].color }} />
                  <span className="flex flex-col gap-1.5 min-w-0">
                    <span className="text-[15px] leading-7 line-clamp-3">{e.text}</span>
                    <span className="flex flex-wrap gap-2 text-xs text-wr-muted">
                      <span className="bg-wr-soft px-2 py-0.5">{e.subtype}</span>
                      {placesOf(e).map((p) => <span key={p.name} className="bg-wr-soft px-2 py-0.5">{p.name}</span>)}
                      <span className="border border-wr-line2 px-2">{VERIFICATION[e.verification].label}</span>
                      <span>{e.source}</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Panel>
          <div className="flex-[1_1_340px] min-w-0 flex flex-col gap-4">
            <PanelTitle action={<Link href="/analysis" className="text-[13px] text-wr-gold">الكل ←</Link>}>تحليلات</PanelTitle>
            {articles.map((a) => (
              <Link key={a.slug} href={`/analysis/${a.slug}`} className="bg-wr-panel/95 border border-wr-line p-4 flex flex-col gap-2 hover:border-wr-gold">
                <span className="text-xs text-wr-muted">{a.tags[0]} · {formatDateLong(a.date)} · {a.author}</span>
                <span className="text-[17px] font-semibold leading-7">{a.title}</span>
                <span className="text-[13px] text-wr-sub leading-6 line-clamp-2">{a.summary}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer text={`المصادر: ${Object.keys(idx.sources).join(' · ')}`} />
    </PageFrame>
  );
}
