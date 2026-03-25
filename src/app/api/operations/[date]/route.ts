import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DailyOperations } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function fetchFromGitHub(date: string): Promise<DailyOperations | null> {
  const repo = process.env.GITHUB_REPO || 'jamalcheaib/warroom';
  const token = process.env.GITHUB_TOKEN;
  const filePath = `data/operations/${date}.json`;

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token) headers.Authorization = `token ${token}`;

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filePath}`,
      { headers, next: { revalidate: 60 } }
    );

    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  }

  // Try local file first (works in dev)
  const filePath = path.join(process.cwd(), 'data', 'operations', `${date}.json`);
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  }

  // Try GitHub (works on Vercel where filesystem is read-only)
  const ghData = await fetchFromGitHub(date);
  if (ghData) {
    return NextResponse.json(ghData);
  }

  // Empty
  const empty: DailyOperations = {
    date,
    operations: [],
    lastUpdated: new Date().toISOString(),
  };
  return NextResponse.json(empty);
}
