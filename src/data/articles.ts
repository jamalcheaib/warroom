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

export const articles: Article[] = [
  {
    slug: 'taofan-alsawarikh-march-2026',
    title: 'طوفان الصواريخ ومقبرة الميركافا: الميدان اللبناني يكسر أرقاماً قياسية',
    author: 'جمال شعيب',
    date: '2026-03-25',
    heroImage: '/images/analysis-infographic-20260325.jpeg',
    summary: 'شهدت الجبهة اللبنانية في الساعات الـ 24 الماضية تحولاً دراماتيكياً وضع الآلة العسكرية الإسرائيلية في مأزق عملياتي غير مسبوق. سجلت المقاومة الإسلامية رقماً قياسياً بتنفيذ 87 عملية عسكرية.',
    tags: ['تقرير ميداني', 'جنوب لبنان', 'دبابات', 'المقاومة الإسلامية'],
    content: '',
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return articles;
}
