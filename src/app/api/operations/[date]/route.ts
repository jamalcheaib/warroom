import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { DailyOperations } from '@/lib/types';

// أرشيف ثابت (28 شباط – 17 نيسان 2026): يُولَّد عند البناء من data/operations،
// بلا اتصال بـGitHub ولا مفتاح.
export const dynamic = 'force-static';
export const dynamicParams = false;

const FIRST = '2026-02-28';
const LAST = '2026-04-17';

export function generateStaticParams() {
  const out: { date: string }[] = [];
  const d = new Date(`${FIRST}T00:00:00Z`);
  const end = new Date(`${LAST}T00:00:00Z`);
  while (d <= end) {
    out.push({ date: d.toISOString().slice(0, 10) });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export async function GET(_request: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const file = path.join(process.cwd(), 'data', 'operations', `${date}.json`);
  if (fs.existsSync(file)) {
    return NextResponse.json(JSON.parse(fs.readFileSync(file, 'utf-8')) as DailyOperations);
  }
  const empty: DailyOperations = { date, operations: [], lastUpdated: '' };
  return NextResponse.json(empty);
}
