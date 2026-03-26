import { OperationCategory, OperationStatus } from './terminology';

export interface Operation {
  id: string;
  time: string; // ISO 8601 in Asia/Beirut
  title: string;
  description: string;
  category: OperationCategory;
  status: OperationStatus;
  source: string;
  sourceUrl?: string;
  needsReview?: boolean;
  lat?: number;
  lon?: number;
}

export interface DailyOperations {
  date: string; // YYYY-MM-DD
  operations: Operation[];
  lastUpdated: string; // ISO 8601
}

export interface EnemyLoss {
  id: string;
  date: string;
  category: 'tanks' | 'drones' | 'soldiers_killed' | 'soldiers_wounded' | 'settlers_killed' | 'settlers_wounded' | 'infrastructure' | 'bases' | 'other';
  subcategory?: string;
  count: number;
  description: string;
  source: string;
  location?: string;
}

export interface LossesData {
  lastUpdated: string;
  losses: EnemyLoss[];
  totals: Record<string, number>;
}
