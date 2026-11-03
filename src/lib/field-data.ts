import fs from 'fs';
import path from 'path';

export type Category = 'resistance' | 'enemy' | 'political';
export type Verification = 'official' | 'multi' | 'single';
export type GeoPrecision = 'town' | 'approx' | 'area';
export type PlaceKind = 'farm' | 'position' | 'area' | 'region' | 'river' | 'concept';

export interface Place {
  name: string;
  lat?: number;
  lon?: number;
  geo?: GeoPrecision;
  kind?: PlaceKind;
}

export interface FieldEvent {
  id: string;
  date: string;
  time: string;
  category: Category;
  subtype: string;
  text: string;
  target?: string;
  impact?: string;
  location?: string;
  lat?: number;
  lon?: number;
  geo?: GeoPrecision;
  kind?: PlaceKind;
  places?: Place[];
  mentions?: Place[];
  source?: string;
  url?: string;
  duplicates?: string[];
  related?: string;
  verification: Verification;
  impacts?: { id: string; type: string; gap: number; date: string }[];
}

export interface ImpactItem {
  id: string;
  date: string;
  time: string;
  type: string;
  text: string;
  location?: string;
  lat?: number;
  lon?: number;
  geo?: GeoPrecision;
  kind?: PlaceKind;
  places?: Place[];
  mentions?: Place[];
  source?: string;
  url?: string;
  duplicates?: string[];
  link: 'linked' | 'candidate' | 'unlinked';
  linkedEvents?: string[];
  events?: { id: string; date: string; time: string; subtype: string; gap: number }[];
}

export interface DayFile {
  date: string;
  events: FieldEvent[];
  impact: ImpactItem[];
}

export interface DaySummary {
  date: string;
  total: number;
  resistance: number;
  enemy: number;
  political: number;
  impact: number;
}

export interface IndexData {
  generatedAt: string;
  firstDate: string;
  lastDate: string;
  totals: Record<string, number>;
  verification: Record<Verification, number>;
  subtypes: Record<Category, Record<string, number>>;
  impactTypes: Record<string, number>;
  impactLinks: Record<string, number>;
  impactByMonth: Record<string, Record<string, number>>;
  sources: Record<string, number>;
  topLocations: { name: string; count: number; lat: number; lon: number }[];
  excluded: { total: number; reasons: Record<string, number>; sources: Record<string, number> };
  days: DaySummary[];
}

export interface PlaceRecord {
  name: string;
  slug: string;
  lat?: number;
  lon?: number;
  geo?: GeoPrecision;
  kind?: PlaceKind;
  source?: string;
  note?: string;
  counts: Partial<Record<Category | 'impact' | 'mention', number>>;
  months: Record<string, number>;
  first: string;
  last: string;
  total: number;
  side: 'lb' | 'il' | 'none';
  refs: ([string, string] | [string, string, 'm'])[];
}

/** الحد الأدنى من الذكر لتوليد صفحة مكان */
export const PLACE_PAGE_MIN = 2;

const DATA = path.join(process.cwd(), 'data');

let indexCache: IndexData | null = null;

export function getIndex(): IndexData {
  if (!indexCache) {
    indexCache = JSON.parse(fs.readFileSync(path.join(DATA, 'index.json'), 'utf-8')) as IndexData;
  }
  return indexCache;
}

const dayCache = new Map<string, DayFile | null>();

export function getDay(date: string): DayFile | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (dayCache.has(date)) return dayCache.get(date)!;
  const p = path.join(DATA, 'events', `${date}.json`);
  const v = fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, 'utf-8')) as DayFile) : null;
  dayCache.set(date, v);
  return v;
}

let placesCache: PlaceRecord[] | null = null;

export function getPlaces(): PlaceRecord[] {
  if (!placesCache) placesCache = JSON.parse(fs.readFileSync(path.join(DATA, 'places.json'), 'utf-8')) as PlaceRecord[];
  return placesCache;
}

/** أسماء الأماكن التي لها صفحة ← slug */
export function placePageMap(): Record<string, string> {
  const m: Record<string, string> = {};
  for (const p of getPlaces()) if (p.total >= PLACE_PAGE_MIN) m[p.name] = p.slug;
  return m;
}

export function getPlace(slug: string): PlaceRecord | undefined {
  let s = slug;
  try {
    s = decodeURIComponent(slug);
  } catch {
    /* already decoded */
  }
  return getPlaces().find((p) => p.slug === s);
}

/** كل الأحداث (لصفحات تجمع أكثر من يوم) */
export function getAllEvents(): FieldEvent[] {
  return getIndex().days.flatMap((d) => getDay(d.date)?.events ?? []);
}

export function getAllImpact(): ImpactItem[] {
  return getIndex().days.flatMap((d) => getDay(d.date)?.impact ?? []);
}

/** رقم اليوم من بداية الرصد (1-based) */
export function dayNumber(date: string): number {
  const idx = getIndex();
  const i = idx.days.findIndex((d) => d.date === date);
  return i + 1;
}
