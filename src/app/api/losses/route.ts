import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { LossesData, EnemyLoss } from '@/lib/types';

// أرشيف ثابت: يُقرأ من ملف المستودع عند البناء، بلا اتصال بـGitHub ولا مفتاح.
export const dynamic = 'force-static';

function aggregateTotals(losses: EnemyLoss[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const loss of losses) {
    totals[loss.category] = (totals[loss.category] || 0) + loss.count;
  }
  return totals;
}

export function GET() {
  const file = path.join(process.cwd(), 'data', 'losses', 'current.json');
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as LossesData;
    data.totals = aggregateTotals(data.losses);
    return NextResponse.json(data);
  }
  const empty: LossesData = { lastUpdated: '', losses: [], totals: {} };
  return NextResponse.json(empty);
}
