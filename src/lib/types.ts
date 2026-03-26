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

export type LossCategory =
  | 'military_vehicles'      // آليات عسكرية
  | 'technical_equipment'    // تجهيزات فنيّة
  | 'military_factories'     // مصانع وشركات عسكرية
  | 'artillery_positions'    // مرابض مدفعية
  | 'bunkers'                // دشم وتحصينات
  | 'radar'                  // رادار
  | 'drones'                 // طائرات مسيّرة
  | 'quadcopter'             // كوادكابتر
  | 'settlement_units'       // وحدات استيطانية
  | 'aircraft'               // محلّقة
  | 'command_centers'        // مراكز قيادة
  | 'iron_dome'              // منصة قبة حديدية
  | 'soldiers_killed'        // جنود قتلى
  | 'soldiers_wounded'       // جنود جرحى
  | 'settlers_killed'        // مستوطنون قتلى
  | 'settlers_wounded'       // مستوطنون جرحى
  | 'other';                 // مختلف

export interface EnemyLoss {
  id: string;
  date: string;
  category: LossCategory;
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
