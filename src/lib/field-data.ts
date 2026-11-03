import fs from 'fs';
import path from 'path';

export type Category = 'resistance' | 'enemy' | 'political';
export type Verification = 'official' | 'multi' | 'single';
export type GeoPrecision = 'town' | 'approx' | 'area';
export type PlaceKind = 'farm' | 'position' | 'area';

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
  days: DaySummary[];
}

const DATA = path.join(process.cwd(), 'data');

let indexCache: IndexData | null = null;

export function getIndex(): IndexData {
  if (!indexCache) {
    indexCache = JSON.parse(fs.readFileSync(path.join(DATA, 'index.json'), 'utf-8')) as IndexData;
  }
  return indexCache;
}

export function getDay(date: string): DayFile | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const p = path.join(DATA, 'events', `${date}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as DayFile;
}

/** رقم اليوم من بداية الرصد (1-based) */
export function dayNumber(date: string): number {
  const idx = getIndex();
  const i = idx.days.findIndex((d) => d.date === date);
  return i + 1;
}
