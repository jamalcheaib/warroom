// Terminology corrections map for automated text processing
// Maps problematic Western media terms to proper resistance terminology

export const terminologyMap: Record<string, string> = {
  // Entity names
  'Israel': 'كيان الاحتلال',
  'israel': 'كيان الاحتلال',
  'Israeli': 'صهيوني',
  'israeli': 'صهيوني',
  'the Israeli': 'الصهيوني',
  'IDF': 'جيش الاحتلال',
  'Israel Defense Forces': 'جيش الاحتلال',
  'Israeli military': 'جيش الاحتلال',
  'Israeli army': 'جيش الاحتلال',
  'Israeli forces': 'قوات الاحتلال',
  'Israeli soldiers': 'جنود الاحتلال',
  'Israeli air force': 'سلاح الجو الصهيوني',

  // Resistance terminology
  'terrorists': 'المقاومة',
  'terrorism': 'مقاومة',
  'terrorist': 'مقاوم',
  'militants': 'مقاتلون',
  'militias': 'فصائل المقاومة',
  'militia': 'فصيل المقاومة',
  'Hamas militants': 'مقاتلو حماس',
  'Hezbollah militants': 'مقاتلو حزب الله',
  'Hezbollah fighters': 'مقاتلو حزب الله',
  'Hamas fighters': 'مقاتلو حماس',

  // Actions
  'Israeli strikes': 'غارات الاحتلال',
  'Israeli strike': 'غارة للاحتلال',
  'Israeli airstrike': 'غارة جوية صهيونية',
  'Israeli airstrikes': 'غارات جوية صهيونية',
  'Israeli bombing': 'قصف صهيوني',
  'Israeli attack': 'عدوان صهيوني',
  'Israeli attacks': 'عدوان صهيوني',
  'Israeli offensive': 'عدوان صهيوني',
  'Israeli operation': 'عدوان صهيوني',
  'attack': 'عملية',
  'attacks': 'عمليات',
  'claimed responsibility': 'تبنّت العملية',
  'claims responsibility': 'تتبنّى العملية',

  // Casualties
  'killed': 'استشهد',
  'were killed': 'استشهدوا',
  'deaths': 'شهداء',
  'dead': 'شهداء',
  'casualties': 'شهداء وجرحى',

  // Conflict framing
  'conflict': 'عدوان',
  'war': 'عدوان',
  'clashes': 'مواجهات',
  'confrontation': 'مواجهة',
};

export type OperationStatus = 'confirmed' | 'unconfirmed' | 'developing';

export type OperationCategory =
  | 'hezbollah'
  | 'iraq_resistance'
  | 'iran'
  | 'statements'
  | 'enemy'
  | 'political';

export const categoryLabels: Record<OperationCategory, string> = {
  hezbollah: 'عمليات المقاومة الإسلامية',
  iraq_resistance: 'عمليات المقاومة الإسلامية في العراق',
  iran: 'عمليات إيران',
  statements: 'تصريحات وبيانات',
  enemy: 'عمليات العدو',
  political: 'سياسي',
};

export const categoryColors: Record<OperationCategory, string> = {
  hezbollah: '#22c55e',
  iraq_resistance: '#22c55e',
  iran: '#22c55e',
  statements: '#3b82f6',
  enemy: '#ef4444',
  political: '#8b5cf6',
};

export const categorySources: Record<OperationCategory, string[]> = {
  hezbollah: ['@mmirleb'],
  iraq_resistance: ['@ElamAlmoqawama'],
  iran: ['@unewschannel'],
  statements: ['@almayadeen'],
  enemy: ['Al Jazeera', 'Reuters'],
  political: ['Al Jazeera', 'Reuters', '@almayadeen'],
};

export const statusLabels: Record<OperationStatus, string> = {
  confirmed: 'مؤكد',
  unconfirmed: 'غير مؤكد',
  developing: 'متطور',
};

export const statusColors: Record<OperationStatus, string> = {
  confirmed: '#22c55e',
  unconfirmed: '#6b7280',
  developing: '#f59e0b',
};

export function applyTerminology(text: string): string {
  let result = text;
  // Sort by length descending to match longer phrases first
  const sorted = Object.entries(terminologyMap).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [en, ar] of sorted) {
    result = result.replaceAll(en, ar);
  }
  return result;
}
