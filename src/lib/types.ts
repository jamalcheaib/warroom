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
}

export interface DailyOperations {
  date: string; // YYYY-MM-DD
  operations: Operation[];
  lastUpdated: string; // ISO 8601
}
