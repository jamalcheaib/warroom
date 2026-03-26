import { NextResponse } from 'next/server';
import { LossesData, EnemyLoss } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function fetchFromGitHub(): Promise<LossesData | null> {
  const repo = process.env.GITHUB_REPO || 'jamalcheaib/warroom';
  const token = process.env.GITHUB_TOKEN;
  const filePath = 'data/losses/current.json';

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

function aggregateTotals(losses: EnemyLoss[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const loss of losses) {
    totals[loss.category] = (totals[loss.category] || 0) + loss.count;
  }
  return totals;
}

export async function GET() {
  const data = await fetchFromGitHub();

  if (data) {
    // Recalculate totals
    data.totals = aggregateTotals(data.losses);
    return NextResponse.json(data);
  }

  const empty: LossesData = {
    lastUpdated: new Date().toISOString(),
    losses: [],
    totals: {},
  };
  return NextResponse.json(empty);
}
