import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { articles, getArticleBySlug } from '@/data/articles';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | غرفة الحرب`,
    description: article.summary,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const formattedDate = new Date(article.date).toLocaleDateString('ar-LB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        {article.heroImage && (
          <div className="relative h-64 md:h-96 bg-zinc-900">
            <Image src={article.heroImage} alt={article.title} fill className="object-cover opacity-60" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">{article.title}</h1>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{article.author}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-red-950/20 text-red-400 border border-red-900/30">
                {tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <article
            className="prose-custom text-zinc-800 dark:text-zinc-200 leading-loose text-base"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Back */}
          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <Link href="/analysis" className="text-red-500 hover:text-red-400 transition-colors text-sm">
              ← العودة إلى التحليلات
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
