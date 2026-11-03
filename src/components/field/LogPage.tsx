import { notFound } from 'next/navigation';
import { getDay, getIndex, dayNumber } from '@/lib/field-data';
import { fmt, formatDateLong } from '@/lib/field-format';
import SiteHeader from './SiteHeader';
import DayStrip from './DayStrip';
import SitrepPanel from './SitrepPanel';
import FieldLog from './FieldLog';
import { Footer, PageFrame } from './ui';

export default function LogPage({ date }: { date: string }) {
  const idx = getIndex();
  const day = getDay(date);
  if (!day) notFound();
  const i = idx.days.findIndex((d) => d.date === date);
  const prev = i > 0 ? idx.days[i - 1].date : undefined;
  const next = i >= 0 && i < idx.days.length - 1 ? idx.days[i + 1].date : undefined;
  const no = dayNumber(date);

  return (
    <PageFrame>
      <SiteHeader
        active="log"
        band={{ right: `موقف ميداني يومي · SITREP ${no}`, left: `الجبهة اللبنانية · ${date} · توقيت بيروت` }}
      />
      <DayStrip days={idx.days} selected={date} />
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 pt-7 pb-16 flex flex-col gap-6">
        <SitrepPanel day={day} dayNo={no} prev={prev} next={next} />
        <FieldLog day={day} />
      </main>
      <Footer text={`${fmt(idx.totals.events)} حدثاً موثّقاً من ${formatDateLong(idx.firstDate)} إلى ${formatDateLong(idx.lastDate)} · المصادر: ${Object.keys(idx.sources).join(' · ')}`} />
    </PageFrame>
  );
}
