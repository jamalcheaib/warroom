import { ScrapedItem } from './scraper';
import { applyTerminology } from './terminology';
import { Operation } from './types';
import { OperationCategory } from './terminology';
import { extractGeoFromText } from './geo-dictionary';

const CHANNEL_CATEGORY_MAP: Record<string, string> = {
  '@mmirleb': 'hezbollah',
  '@ElamAlmoqawama': 'iraq_resistance',
  '@unewschannel': 'iran',
  '@almayadeen': 'statements',
  'Al Jazeera': 'political',
  'Reuters': 'political',
};

const ENEMY_KEYWORDS = [
  'جيش الاحتلال', 'سلاح الجو', 'غارات', 'قصف صهيوني', 'عدوان',
  'الجيش الإسرائيلي', 'IDF', 'Israeli', 'اجتياح', 'توغل',
  'البنتاغون', 'القيادة المركزية', 'CENTCOM', 'البحرية الأمريكية',
];

const STATEMENT_KEYWORDS = [
  'تصريح', 'بيان', 'أعلن', 'صرّح', 'خطاب', 'كلمة', 'مؤتمر صحفي',
  'الأمين العام', 'وزير الخارجية', 'المتحدث باسم', 'المرشد',
];

const POLITICAL_KEYWORDS = [
  'مجلس الأمن', 'الأمم المتحدة', 'مفاوضات', 'دبلوماسي', 'ترمب', 'ترامب',
  'البيت الأبيض', 'الكونغرس', 'الاتحاد الأوروبي', 'فيتو', 'عقوبات',
];

const DEVELOPING_KEYWORDS = [
  'تقارير تشير', 'أنباء أولية', 'مصادر تؤكد', 'عاجل', 'متواصل',
  'لم تتأكد', 'غير مؤكد', 'يُرجَّح',
];

const REVIEW_KEYWORDS = [
  'مصادر مقربة', 'لم يُعرف', 'غير واضح', 'تناقض', 'نفى',
];

function detectCategory(text: string, source: string): string {
  const defaultCat = CHANNEL_CATEGORY_MAP[source] || 'political';

  if (ENEMY_KEYWORDS.some(k => text.includes(k)) && !text.includes('المقاومة الإسلامية')) {
    // Check if it's about enemy operations rather than resistance
    if (text.includes('شنّ') || text.includes('نفّذ جيش') || text.includes('غارات') || text.includes('قصف')) {
      return 'enemy';
    }
  }

  // Hezbollah detection — cross-channel (highest priority for resistance ops)
  const hezKeywords = [
    'حزب الله', 'المقاومة الإسلامية في لبنان', 'المقاومة الإسلامية:',
    'بيان صادر عن المقاومة الإسلامية',
  ];
  const hezGeoKeywords = [
    'جنوب لبنان', 'جنوب_لبنان', 'الجليل', 'شمال فلسطين', 'شمالي فلسطين',
    'غولاني', 'كريات شمونة', 'المطلة', 'الناقورة', 'مارون الراس',
    'عيتا الشعب', 'بنت جبيل', 'الخيام', 'كفرشوبا', 'مزارع شبعا',
    'الطيبة', 'المحيسة', 'المحيس', 'نخبة غولاني', 'لواء غولاني',
    'القنطرة', 'علما الشعب', 'مسكاف عام', 'مسغاف عام', 'شلومي',
    'بيت هلل', 'دبّابة ميركافا', 'ميركافا', 'مروحين', 'حولا',
    'إصبع الجليل', 'الجليل الغربي', 'الجليل الأعلى',
    'موقع البغدادي', 'موقع المرج', 'موقع الراهب', 'موقع السماقة',
    'موقع رويسات', 'موقع الأبيض', 'ثكنة برانيت', 'قاعدة دادو',
    'دير سريان', 'مرتفع المحيس', 'وادي السلوقي',
  ];

  if (hezKeywords.some(k => text.includes(k))) return 'hezbollah';
  if (source === '@unewschannel' || source === '@almayadeen') {
    if (hezGeoKeywords.some(k => text.includes(k))) return 'hezbollah';
    if (text.includes('إيران') || text.includes('الحرس الثوري') || text.includes('الوعد الصادق')) return 'iran';
    if (text.includes('المقاومة الإسلامية في العراق')) return 'iraq_resistance';
  }

  if (STATEMENT_KEYWORDS.some(k => text.includes(k))) return 'statements';
  if (POLITICAL_KEYWORDS.some(k => text.includes(k))) return 'political';

  return defaultCat;
}

function detectStatus(text: string): 'confirmed' | 'developing' | 'unconfirmed' {
  if (DEVELOPING_KEYWORDS.some(k => text.includes(k))) return 'developing';
  if (text.includes('بيان صادر') || text.includes('تبنّت')) return 'confirmed';
  return 'confirmed';
}

function extractTime(text: string, fallbackTimestamp: string): string {
  // Pattern: "عند الساعة HH:MM" or "الساعة HH:MM"
  const timeMatch = text.match(/(?:عند\s+)?الساعة\s+(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const date = new Date(fallbackTimestamp);
    date.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
    return date.toISOString().replace('Z', '+03:00');
  }
  return fallbackTimestamp;
}

function extractTitle(text: string, source: string): string {
  // For Telegram: use first meaningful line
  const lines = text.split('\n').filter(l => l.trim().length > 10);

  if (source === '@mmirleb') {
    // Skip بسم الله and Quran verses, get the operation description
    const opLine = lines.find(l =>
      l.includes('استهدف') || l.includes('دفاعًا') || l.includes('نفّذ')
    );
    if (opLine) {
      return opLine.slice(0, 100).trim();
    }
  }

  if (source === '@ElamAlmoqawama') {
    const opLine = lines.find(l => l.includes('نفذ مجاهدو'));
    if (opLine) return opLine.slice(0, 100).trim();
  }

  if (source === '@unewschannel') {
    // Usually starts with "عاجل |"
    const headline = lines[0]?.replace(/^عاجل\s*\|\s*/, '').trim();
    if (headline) return headline.slice(0, 100);
  }

  // Fallback: first line
  return (lines[0] || text.slice(0, 100)).trim();
}

function needsReview(text: string): boolean {
  return REVIEW_KEYWORDS.some(k => text.includes(k));
}

export function parseOperations(items: ScrapedItem[], existingIds: Set<string>, targetDate?: string): Operation[] {
  const operations: Operation[] = [];
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' });

  for (const item of items) {
    // Skip duplicates
    if (existingIds.has(item.id)) continue;

    // Skip non-operation content (ads, forwards without substance)
    if (item.text.length < 30) continue;

    // Check if this is from today (Beirut timezone) — unless targetDate is specified
    const itemDate = new Date(item.timestamp);
    const beirutDate = new Date(itemDate.getTime() + 3 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    // Only include operations matching the target date
    if (beirutDate !== (targetDate || today)) continue;

    const category = detectCategory(item.text, item.source);
    const status = detectStatus(item.text);
    const time = extractTime(item.text, item.timestamp);
    const title = extractTitle(item.text, item.source);
    const description = applyTerminology(
      item.text.split('\n')
        .filter(l => !l.startsWith('بِسْمِ') && !l.startsWith('﴿') && !l.startsWith('صَدَقَ') && !l.startsWith('#'))
        .join(' ')
        .slice(0, 300)
        .trim()
    );

    const geo = extractGeoFromText(item.text);

    operations.push({
      id: item.id,
      time,
      title: applyTerminology(title),
      description,
      category: category as OperationCategory,
      status,
      source: item.source,
      needsReview: needsReview(item.text),
      ...(geo ? { lat: geo.lat, lon: geo.lon } : {}),
    });
  }

  return operations;
}
