import type { Metadata } from 'next';
import LogPage from '@/components/field/LogPage';
import { getDay, getIndex } from '@/lib/field-data';
import { formatDateLong } from '@/lib/field-format';

export const dynamicParams = false;

export function generateStaticParams() {
  return getIndex().days.map((d) => ({ date: d.date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const day = getDay(date);
  const n = day?.events.length ?? 0;
  const title = `السجل الميداني — ${formatDateLong(date)} | غرفة الحرب`;
  const description = `${n} حدثاً موثّقاً على الجبهة اللبنانية في ${formatDateLong(date)}: عمليات المقاومة واعتداءات العدو والمسار السياسي والأثر المعلن.`;
  return {
    title,
    description,
    alternates: { canonical: `https://warroom-ecru.vercel.app/log/${date}` },
    openGraph: { title, description, type: 'article', locale: 'ar_LB', siteName: 'غرفة الحرب' },
  };
}

export default async function Page({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <LogPage date={date} />;
}
