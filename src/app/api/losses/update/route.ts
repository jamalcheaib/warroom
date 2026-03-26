import { NextRequest, NextResponse } from 'next/server';
import { EnemyLoss, LossesData } from '@/lib/types';

export const dynamic = 'force-dynamic';

const REPO = process.env.GITHUB_REPO || 'jamalcheaib/warroom';
const FILE_PATH = 'data/losses/current.json';

export async function POST(request: NextRequest) {
  const secret = process.env.WARROOM_SECRET;
  const auth = request.headers.get('authorization');

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Missing GITHUB_TOKEN' }, { status: 500 });
  }

  const body = await request.json();
  const newLoss: EnemyLoss = body;

  if (!newLoss.id || !newLoss.category || !newLoss.count) {
    return NextResponse.json({ error: 'Missing required fields: id, category, count' }, { status: 400 });
  }

  // Fetch existing file
  const headers: Record<string, string> = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };

  let currentData: LossesData = { lastUpdated: '', losses: [], totals: {} };
  let sha: string | undefined;

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, { headers });
    if (res.ok) {
      const ghData = await res.json();
      sha = ghData.sha;
      currentData = JSON.parse(Buffer.from(ghData.content, 'base64').toString('utf-8'));
    }
  } catch {
    // File doesn't exist yet, use empty
  }

  // Add or update
  const idx = currentData.losses.findIndex((l) => l.id === newLoss.id);
  if (idx >= 0) {
    currentData.losses[idx] = newLoss;
  } else {
    currentData.losses.push(newLoss);
  }

  // Recalculate totals
  currentData.totals = {};
  for (const loss of currentData.losses) {
    currentData.totals[loss.category] = (currentData.totals[loss.category] || 0) + loss.count;
  }
  currentData.lastUpdated = new Date().toISOString();

  // Commit to GitHub
  const commitBody: Record<string, string> = {
    message: `📊 تحديث الخسائر الإسرائيلية — ${newLoss.category}: ${newLoss.count}`,
    content: Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64'),
  };
  if (sha) commitBody.sha = sha;

  const commitRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(commitBody),
  });

  if (!commitRes.ok) {
    const err = await commitRes.text();
    return NextResponse.json({ error: 'GitHub commit failed', details: err }, { status: 500 });
  }

  return NextResponse.json({ success: true, totals: currentData.totals });
}
