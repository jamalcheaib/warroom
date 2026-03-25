import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DailyOperations } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'data', 'operations', `${date}.json`);

  if (!fs.existsSync(filePath)) {
    // Return empty data for dates with no operations
    const empty: DailyOperations = {
      date,
      operations: [],
      lastUpdated: new Date().toISOString(),
    };
    return NextResponse.json(empty);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data: DailyOperations = JSON.parse(raw);

  return NextResponse.json(data);
}
