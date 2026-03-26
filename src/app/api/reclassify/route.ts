import { NextRequest, NextResponse } from 'next/server';

const REPO = 'jamalcheaib/warroom';

const HEZ_GEO_KEYWORDS = [
  'جنوب لبنان', 'جنوب_لبنان', 'الجليل', 'شمال فلسطين', 'شمالي فلسطين',
  'غولاني', 'كريات شمونة', 'المطلة', 'الناقورة', 'مارون الراس',
  'عيتا الشعب', 'بنت جبيل', 'الخيام', 'كفرشوبا', 'مزارع شبعا',
  'الطيبة', 'المحيسة', 'المحيس', 'نخبة غولاني', 'لواء غولاني',
  'حزب الله', 'المقاومة الإسلامية في لبنان',
];

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 500 });
  }

  try {
    // List all files in data/operations/
    const listRes = await fetch(`https://api.github.com/repos/${REPO}/contents/data/operations`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    if (!listRes.ok) return NextResponse.json({ error: 'Cannot list files' }, { status: 500 });
    const files = await listRes.json();

    let totalFixed = 0;
    const details: string[] = [];

    for (const file of files) {
      if (!file.name.endsWith('.json')) continue;

      const fileRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${file.path}`, {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
      });
      if (!fileRes.ok) continue;
      const fileData = await fileRes.json();
      const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

      let changed = 0;
      for (const op of content.operations) {
        if (op.category !== 'iran') continue;
        const text = `${op.title} ${op.description}`;
        if (HEZ_GEO_KEYWORDS.some(k => text.includes(k))) {
          op.category = 'hezbollah';
          changed++;
        }
      }

      if (changed > 0) {
        content.lastUpdated = new Date().toISOString();
        const newContent = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
        await fetch(`https://api.github.com/repos/${REPO}/contents/${file.path}`, {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `🏷️ إعادة تصنيف ${changed} عملية → حزب الله (${file.name})`,
            content: newContent,
            sha: fileData.sha,
          }),
        });
        totalFixed += changed;
        details.push(`${file.name}: ${changed} fixed`);
      }
    }

    return NextResponse.json({ success: true, totalFixed, details });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
