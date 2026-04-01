import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { articles } from '@/data/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ميداني | غرفة الحرب',
  description: 'تقارير وتحليلات ميدانية معمّقة',
};

export const revalidate = 0; // Disable caching for this page

export default function AnalysisPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">ميداني</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">تقارير وتحليلات ميدانية معمّقة</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/analysis/${article.slug}`}
              className="group block rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-red-500/50 transition-colors"
            >
              {article.heroImage && (
                <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={article.heroImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  <span>{article.author}</span>
                  <span>•</span>
                  <span>{new Date(article.date).toLocaleDateString('ar-LB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h2 className="font-bold text-lg mb-2 group-hover:text-red-500 transition-colors leading-relaxed">
                  {article.title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {article.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-red-950/20 text-red-400 border border-red-900/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
