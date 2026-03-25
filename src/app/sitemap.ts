import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const dataDir = path.join(process.cwd(), 'data', 'operations');
  let dates: string[] = [];

  try {
    dates = fs.readdirSync(dataDir)
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort();
  } catch {
    dates = [];
  }

  const baseUrl = 'https://warroom-ecru.vercel.app';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  for (const date of dates) {
    routes.push({
      url: `${baseUrl}?date=${date}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  return routes;
}
