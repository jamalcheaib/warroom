import type { Category, Verification, GeoPrecision, Place, PlaceKind } from './field-data';

export const MONTHS = [
  'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
  'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول',
];
export const MONTHS_SHORT = MONTHS;
const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function parts(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

export function formatDateLong(date: string): string {
  const { y, m, d } = parts(date);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function weekday(date: string): string {
  return WEEKDAYS[parts(date).wd];
}

export function formatDayShort(date: string): string {
  const { m, d } = parts(date);
  return `${d}/${m}`;
}

export function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatGap(min: number): string {
  const sign = min < 0 ? '−' : '+';
  const a = Math.abs(min);
  return `${sign}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`;
}

export const CATEGORY: Record<Category, { label: string; short: string; color: string; text: string }> = {
  enemy: { label: 'اعتداءات العدو', short: 'اعتداء', color: '#E8622C', text: '#F08A5D' },
  resistance: { label: 'عمليات المقاومة', short: 'عملية', color: '#45D39A', text: '#45D39A' },
  political: { label: 'سياسي — لبنان', short: 'سياسي', color: '#5B7BD6', text: '#8FA8E8' },
};

export const CATEGORY_ORDER: Category[] = ['enemy', 'resistance', 'political'];

export const VERIFICATION: Record<Verification, { label: string; level: number }> = {
  official: { label: 'بيان رسمي', level: 3 },
  multi: { label: 'متعدد المصادر', level: 2 },
  single: { label: 'مصدر واحد', level: 1 },
};

export function formatCoords(lat?: number, lon?: number, geo?: GeoPrecision): string {
  if (lat == null || lon == null) return 'إحداثيات: غير محددة';
  const c = `${lat.toFixed(2)}N ${lon.toFixed(2)}E`;
  if (geo === 'area') return `منطقة · ${c}`;
  if (geo === 'approx') return `≈ ${c}`;
  return c;
}

export const PLACE_KIND: Record<PlaceKind, string> = {
  farm: 'مزرعة',
  position: 'موقع عسكري',
  area: 'منطقة',
};

/** كل أماكن الحدث (قد يذكر الحدث أكثر من مكان) */
export function placesOf(o: { location?: string; lat?: number; lon?: number; geo?: GeoPrecision; kind?: PlaceKind; places?: Place[] }): Place[] {
  if (o.places && o.places.length) return o.places;
  return o.location ? [{ name: o.location, lat: o.lat, lon: o.lon, geo: o.geo, kind: o.kind }] : [];
}

export function shortCode(id: string): string {
  const m = id.match(/(\d+)$/);
  return m ? `#${m[1]}` : id;
}
