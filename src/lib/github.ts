import { Operation } from './types';

const REPO = 'jamalcheaib/warroom';

interface GitHubFile {
  content: string;
  sha: string;
}

async function getFile(path: string, token: string): Promise<GitHubFile | null> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`GitHub getFile error: ${res.status}`);
    return null;
  }

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

async function commitFile(
  path: string,
  content: string,
  message: string,
  token: string,
  sha?: string
): Promise<boolean> {
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`GitHub commit error: ${res.status} — ${err}`);
    return false;
  }

  return true;
}

export async function updateDailyOperations(
  date: string,
  newOperations: Operation[],
  token: string
): Promise<{ added: number; total: number; reviewItems: Operation[] }> {
  const filePath = `data/operations/${date}.json`;
  const existing = await getFile(filePath, token);

  let currentData: { date: string; lastUpdated: string; operations: Operation[] };

  if (existing) {
    try {
      currentData = JSON.parse(existing.content);
    } catch {
      currentData = { date, lastUpdated: new Date().toISOString(), operations: [] };
    }
  } else {
    currentData = { date, lastUpdated: new Date().toISOString(), operations: [] };
  }

  // Merge: add new operations that don't already exist
  const existingIds = new Set(currentData.operations.map(op => op.id));
  const toAdd = newOperations.filter(op => !existingIds.has(op.id));

  if (toAdd.length === 0) {
    return { added: 0, total: currentData.operations.length, reviewItems: [] };
  }

  currentData.operations.push(...toAdd);
  // Sort by time descending
  currentData.operations.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  currentData.lastUpdated = new Date().toISOString();

  const content = JSON.stringify(currentData, null, 2);
  const message = `📡 تحديث تلقائي — ${toAdd.length} عملية جديدة (${date})`;

  const success = await commitFile(filePath, content, message, token, existing?.sha);

  const reviewItems = toAdd.filter(op => op.needsReview);

  return {
    added: success ? toAdd.length : 0,
    total: currentData.operations.length,
    reviewItems,
  };
}
