export interface Article {
  slug: string;
  title: string;
  author: string;
  date: string;
  heroImage?: string;
  summary: string;
  tags: string[];
  content: string;
}

const articles: Article[] = [];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return articles;
}
