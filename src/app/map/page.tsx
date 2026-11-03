import type { Metadata } from 'next';
import SiteHeader from '@/components/field/SiteHeader';
import TimeMapClient from '@/components/field/TimeMapClient';
import { Footer, Kicker, PageFrame } from '@/components/field/ui';
import { getIndex } from '@/lib/field-data';
import { fmt, formatDateLong } from '@/lib/field-format';

export const metadata: Metadata = {
  title: 'الخريطة الزمنية | غرفة الحرب',
  description: 'خريطة تفاعلية لأحداث الجبهة اللبنانية يوماً بيوم: الاعتداءات وعمليات المقاومة والأثر المعلن.',
};

export default function MapPage() {
  const idx = getIndex();
  return (
    <PageFrame>
      <SiteHeader active="map" band={{ right: 'الخريطة الزمنية', left: `${formatDateLong(idx.firstDate)} — ${formatDateLong(idx.lastDate)}` }} />
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 pt-7 pb-16 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Kicker>{fmt(idx.totals.geolocated)} حدثاً محدد الموقع</Kicker>
          <h1 className="font-kufi text-3xl md:text-4xl font-extrabold">الخريطة الزمنية للجبهة</h1>
          <p className="text-wr-sub leading-7 max-w-[760px]">حرّك المؤشر أو اضغط تشغيل لمشاهدة تطوّر الأحداث يوماً بيوم. اضغط على أي نقطة لفتح سجل يومها.</p>
        </div>
        <TimeMapClient />
      </main>
      <Footer text="الإحداثيات: Wikidata (CC0) وتدقيق يدوي · علامة ≈ للإحداثيات التقريبية" />
    </PageFrame>
  );
}
