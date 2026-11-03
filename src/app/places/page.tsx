import type { Metadata } from 'next';
import SiteHeader from '@/components/field/SiteHeader';
import PlaceDirectory, { type DirEntry } from '@/components/field/PlaceDirectory';
import { Footer, Kicker, PageFrame } from '@/components/field/ui';
import { getPlaces, PLACE_PAGE_MIN } from '@/lib/field-data';
import { fmt } from '@/lib/field-format';

export const metadata: Metadata = {
  title: 'الأماكن | غرفة الحرب',
  description: 'ملف لكل بلدة وموقع في سجل الجبهة اللبنانية: عدد الاعتداءات والعمليات والأثر المعلن، وسجلها الكامل.',
};

export default function PlacesPage() {
  const all = getPlaces().filter((p) => p.total >= PLACE_PAGE_MIN);
  const entries: DirEntry[] = all.map((p) => ({
    name: p.name, slug: p.slug, total: p.total, enemy: p.counts.enemy ?? 0,
    resistance: p.counts.resistance ?? 0, impact: p.counts.impact ?? 0,
    kind: p.kind, hasPoint: p.lat != null, side: p.side,
  }));
  return (
    <PageFrame>
      <SiteHeader active="places" band={{ right: 'الأماكن', left: `${fmt(entries.length)} ملفاً` }} />
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 pt-8 pb-16 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Kicker>ملف لكل مكان ورد ذكره مرتين فأكثر</Kicker>
          <h1 className="font-kufi text-3xl md:text-[40px] font-extrabold">الأماكن</h1>
          <p className="text-wr-sub leading-7 max-w-[760px]">لكل بلدة أو موقع سجلّه الكامل: الاعتداءات التي طالته، والعمليات التي انطلقت نحوه أو جرت فيه، والأثر المعلن، موزّعة على الأشهر.</p>
        </div>
        <PlaceDirectory places={entries} />
      </main>
      <Footer text="الشريط: برتقالي اعتداءات · أخضر عمليات · ذهبي أثر معلن" />
    </PageFrame>
  );
}
