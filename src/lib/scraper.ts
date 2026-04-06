// Source scraping module — Telegram channels and RSS feeds

export interface ScrapedItem {
  id: string;
  text: string;
  timestamp: string; // ISO 8601
  source: string;
  sourceUrl: string;
}

/**
 * Scrape recent messages from a Telegram channel's public preview page.
 */
export async function scrapeTelegram(channel: string): Promise<ScrapedItem[]> {
  const url = `https://t.me/s/${channel}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch Telegram channel @${channel}: ${res.status}`);
    return [];
  }

  const html = await res.text();
  const items: ScrapedItem[] = [];

  // Parse messages from the HTML
  // Messages are in <div class="tgme_widget_message_wrap ..."> containers
  const messageRegex =
    /data-post="([^"]+)"[\s\S]*?<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="tgme_widget_message_footer|<div class="tgme_widget_message_info)/g;

  let match;
  while ((match = messageRegex.exec(html)) !== null) {
    const postId = match[1]; // e.g. "mmirleb/12345"
    const rawHtml = match[2];

    // Strip HTML tags to get plain text
    const text = rawHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (!text) continue;

    // Compute timestamp from datetime attribute when available, else now
    const msgId = postId.split('/')[1] || postId;
    const timeRegex = new RegExp(
      `data-post="${postId.replace('/', '\\/')}"[\\s\\S]*?<time[^>]+datetime="([^"]+)"`,
      'i'
    );
    const timeMatch = timeRegex.exec(html);
    const timestamp = timeMatch ? timeMatch[1] : new Date().toISOString();

    // تجاوز رسائل الفيديو
    if (["بالفيديو", "مشاهد من", "فيديو |", "| فيديو", "شاهد |"].some(kw => text.includes(kw))) continue;

    // تحرير النص
    const cleanedText = text
      .replace(/﴿[^﴾]*﴾/g, '')
      .replace(/بيان صادر عن المقاومة الإسلامية\s*\(\d+\):\s*/g, '')
      .replace(/بِسْمِ اللَّـهِ الرحمن الرَّحِيمِ/g, '')
      .replace(/صَدَقَ اللهُ العَلِيّ العَظِيم/g, '')
      .replace(/#\S+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText) continue;

    items.push({
      id: `tg-${channel}-${msgId}`,
      text: cleanedText,
      timestamp,
      source: `@${channel}`,
      sourceUrl: `https://t.me/${postId}`,
    });
  }

  // Fallback: simpler regex if the above didn't match
  if (items.length === 0) {
    const simpleRegex =
      /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
    const postRegex = /data-post="([^"]+)"/g;
    const posts: string[] = [];
    let pm;
    while ((pm = postRegex.exec(html)) !== null) posts.push(pm[1]);

    let idx = 0;
    let sm;
    while ((sm = simpleRegex.exec(html)) !== null) {
      const text = sm[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();

      if (!text) { idx++; continue; }

      const postId = posts[idx] || `${channel}/${Date.now()}-${idx}`;
      const msgId = postId.split('/')[1] || `${idx}`;

      // تجاوز رسائل الفيديو
      if (["بالفيديو", "مشاهد من", "فيديو |", "| فيديو", "شاهد |"].some(kw => text.includes(kw))) { idx++; continue; }

      // تحرير النص
      const cleanedText = text
        .replace(/﴿[^﴾]*﴾/g, '')
        .replace(/بيان صادر عن المقاومة الإسلامية\s*\(\d+\):\s*/g, '')
        .replace(/بِسْمِ اللَّـهِ الرحمن الرَّحِيمِ/g, '')
        .replace(/صَدَقَ اللهُ العَلِيّ العَظِيم/g, '')
        .replace(/#\S+/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      const postIdForText = postId;
      const finalMsgId = msgId;

      items.push({
        id: `tg-${channel}-${finalMsgId}`,
        text: cleanedText,
        timestamp: new Date().toISOString(),
        source: `@${channel}`,
        sourceUrl: `https://t.me/${postIdForText}`,
      });
      idx++;
    }
  }

  return items;
}

/**
 * Scrape items from an RSS feed using simple XML parsing.
 */
export async function scrapeRSS(url: string, sourceName: string): Promise<ScrapedItem[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; WarRoom/1.0; +https://github.com/jamalcheaib/warroom)',
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch RSS ${sourceName}: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items: ScrapedItem[] = [];

    // Parse <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];

      const title = extractTag(block, 'title');
      const description = extractTag(block, 'description');
      const link = extractTag(block, 'link');
      const pubDate = extractTag(block, 'pubDate');
      const guid = extractTag(block, 'guid') || link || `${sourceName}-${Date.now()}`;

      const text = `${title}\n${description}`.trim();
      if (!text) continue;

      // Create a stable ID from the guid
      const id = `rss-${sourceName.toLowerCase().replace(/\s+/g, '-')}-${hashString(guid)}`;

      items.push({
        id,
        text,
        timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: sourceName,
        sourceUrl: link || url,
      });
    }

    return items;
  } catch (err) {
    console.error(`RSS scrape error for ${sourceName}:`, err);
    return [];
  }
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([^\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
  const match = regex.exec(xml);
  if (!match) return '';
  return match[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
