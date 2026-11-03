import type { Metadata } from 'next';
import PlacePage from '@/components/field/PlacePage';
import { getPlace, getPlaces, PLACE_PAGE_MIN } from '@/lib/field-data';
import { formatDateLong } from '@/lib/field-format';

export const dynamicParams = false;

export function generateStaticParams() {
  return getPlaces().filter((p) => p.total >= PLACE_PAGE_MIN).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPlace(slug);
  if (!p) return {};
  const title = `${p.name} — ملف المكان | غرفة الحرب`;
  const description = `${p.total} ذكراً لـ${p.name} في سجل الجبهة اللبنانية بين ${formatDateLong(p.first)} و${formatDateLong(p.last)}: الاعتداءات والعمليات والأثر المعلن.`;
  return { title, description, alternates: { canonical: `https://warroom-ecru.vercel.app/places/${p.slug}` }, openGraph: { title, description, locale: 'ar_LB', siteName: 'غرفة الحرب' } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlacePage slug={slug} />;
}
