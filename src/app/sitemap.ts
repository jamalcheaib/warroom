import { MetadataRoute } from 'next';
import { getIndex } from '@/lib/field-data';
import { articles } from '@/data/articles';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://warroom-ecru.vercel.app';
  const idx = getIndex();
  const generated = new Date(idx.generatedAt);

  return [
    { url: baseUrl, lastModified: generated, changeFrequency: 'daily', priority: 1 },
    ...idx.days.map((d) => ({
      url: `${baseUrl}/log/${d.date}`,
      lastModified: generated,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${baseUrl}/analysis`, lastModified: generated, changeFrequency: 'weekly', priority: 0.7 },
    ...articles.map((a) => ({ url: `${baseUrl}/analysis/${a.slug}`, lastModified: new Date(a.date), changeFrequency: 'monthly' as const, priority: 0.6 })),
    { url: `${baseUrl}/losses`, lastModified: generated, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/archive`, lastModified: generated, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
