import type { DayFile } from '@/lib/field-data';
import { CATEGORY, fmt, formatDateLong, weekday, formatCoords } from '@/lib/field-format';

function Corners() {
  const c = 'absolute w-[18px] h-[18px] border-wr-gold pointer-events-none';
  return (
    <>
      <span aria-hidden="true" className={`${c} -top-px -right-px border-t-2 border-r-2`} />
      <span aria-hidden="true" className={`${c} -top-px -left-px border-t-2 border-l-2`} />
      <span aria-hidden="true" className={`${c} -bottom-px -right-px border-b-2 border-r-2`} />
      <span aria-hidden="true" className={`${c} -bottom-px -left-px border-b-2 border-l-2`} />
    </>
  );
}

export default function SitrepPanel({ day, dayNo, prev, next }: { day: DayFile; dayNo: number; prev?: string; next?: string }) {
  const ev = day.events;
  const count = { enemy: 0, resistance: 0, political: 0 };
  const hours = Array.from({ length: 24 }, () => ({ enemy: 0, resistance: 0, political: 0 }));
  const enemySub = new Map<string, number>();
  const locs = new Map<string, { n: number; lat?: number; lon?: number }>();
  for (const e of ev) {
    count[e.category]++;
    const h = Math.min(23, parseInt(e.time.slice(0, 2), 10) || 0);
    hours[h][e.category]++;
    if (e.category === 'enemy') enemySub.set(e.subtype, (enemySub.get(e.subtype) ?? 0) + 1);
    if (e.location && e.geo !== 'area') {
      const l = locs.get(e.location) ?? { n: 0, lat: e.lat, lon: e.lon };
      l.n++;
      locs.set(e.location, l);
    }
  }
  const topEnemy = [...enemySub.entries()].sort((a, b) => b[1] - a[1])[0];
  const topLocs = [...locs.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 4);
  const hourTotals = hours.map((h) => h.enemy + h.resistance + h.political);
  const peak = hourTotals.reduce((best, v, i) => (v > hourTotals[best] ? i : best), 0);
  const hmax = Math.max(...hourTotals, 1);
  const scale = 84 / hmax;

  const readouts = [
    { v: ev.length, l: 'حدثاً موثّقاً', c: '#E8ECF1' },
    { v: count.enemy, l: 'اعتداء للعدو', c: CATEGORY.enemy.text },
    { v: topEnemy ? topEnemy[1] : 0, l: topEnemy ? topEnemy[0] : '—', c: CATEGORY.enemy.text },
    { v: count.resistance, l: 'عملية للمقاومة', c: CATEGORY.resistance.text },
    { v: locs.size, l: 'موقعاً مذكوراً', c: '#C9A227' },
  ];

  return (
    <section className="relative bg-wr-panel/95 border border-wr-line2 p-5 md:p-6 flex flex-col gap-5">
      <Corners />
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-wrmono text-xs text-wr-gold tracking-wide">اليوم {dayNo} من الرصد · {weekday(day.date)}</span>
          <h1 className="font-kufi text-3xl md:text-[40px] font-extrabold leading-tight text-wr-text">{formatDateLong(day.date)}</h1>
        </div>
        <div className="flex gap-2">
          {prev ? (
            <a href={`/log/${prev}`} className="h-11 px-4 rounded border border-wr-line2 bg-wr-deep text-wr-text text-sm flex items-center hover:border-wr-gold">→ اليوم السابق</a>
          ) : null}
          {next ? (
            <a href={`/log/${next}`} className="h-11 px-4 rounded border border-wr-line2 bg-wr-deep text-wr-text text-sm flex items-center hover:border-wr-gold">اليوم التالي ←</a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-wr-line2 border border-wr-line2">
        {readouts.map((r, i) => (
          <div key={i} className={`bg-wr-deep px-4 py-3.5 flex flex-col gap-1 min-w-0 ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}>
            <span className="font-wrmono text-[34px] font-semibold leading-none" style={{ color: r.c }}>{fmt(r.v)}</span>
            <span className="text-[13px] text-wr-sub truncate">{r.l}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-2">
          <div className="flex justify-between text-[13px] gap-2">
            <span className="font-semibold">كثافة الأحداث على مدار 24 ساعة</span>
            <span className="font-wrmono text-[#F08A5D]">ذروة {String(peak).padStart(2, '0')}:00 — {hourTotals[peak]} حدثاً</span>
          </div>
          <div className="h-[92px] flex items-end gap-[3px] border-b border-[#3A4656]" role="img" aria-label={`توزيع ${ev.length} حدثاً على ساعات اليوم، الذروة عند الساعة ${peak}`}>
            {hours.map((h, i) => (
              <div key={i} title={`${String(i).padStart(2, '0')}:00 — اعتداءات ${h.enemy} · مقاومة ${h.resistance} · سياسي ${h.political}`} className="flex-1 min-w-0 flex flex-col-reverse gap-px">
                {h.enemy > 0 && <div style={{ height: h.enemy * scale, background: CATEGORY.enemy.color }} />}
                {h.resistance > 0 && <div style={{ height: h.resistance * scale, background: CATEGORY.resistance.color }} />}
                {h.political > 0 && <div style={{ height: h.political * scale, background: CATEGORY.political.color }} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between font-wrmono text-[11px] text-wr-dim"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
        </div>
        <div className="flex-[1_1_280px] min-w-0 border border-[#3A2A1F] bg-[rgba(232,98,44,0.06)] px-4 py-3.5 flex flex-col gap-2">
          <span className="font-wrmono text-xs text-[#F08A5D] tracking-wide">المواقع الأكثر ذكراً</span>
          {topLocs.length ? (
            <>
              <span className="font-kufi text-[22px] font-bold">{topLocs[0][0]}</span>
              <span className="text-sm text-wr-sub leading-7">
                {topLocs[0][1].n} حدثاً
                {topLocs.length > 1 && <> · ثم {topLocs.slice(1).map(([n, v]) => `${n} (${v.n})`).join('، ')}</>}
              </span>
              <span className="font-wrmono text-xs text-wr-muted">{formatCoords(topLocs[0][1].lat, topLocs[0][1].lon)}</span>
            </>
          ) : (
            <span className="text-sm text-wr-sub">لا مواقع محددة في هذا اليوم.</span>
          )}
        </div>
      </div>
    </section>
  );
}
