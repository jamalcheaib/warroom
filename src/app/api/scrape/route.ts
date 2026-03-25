import { NextRequest, NextResponse } from 'next/server';
import { scrapeTelegram, scrapeRSS } from '@/lib/scraper';
import { parseOperations } from '@/lib/parser';
import { updateDailyOperations } from '@/lib/github';

const TELEGRAM_CHANNELS = ['mmirleb', 'ElamAlmoqawama', 'unewschannel', 'almayadeen'];

const RSS_FEEDS = [
  { url: 'https://www.aljazeera.net/feed/rss2', name: 'Al Jazeera' },
];

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify secret
  const secret = request.nextUrl.searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
  }

  try {
    // Scrape all sources
    const allItems = [];

    for (const channel of TELEGRAM_CHANNELS) {
      const items = await scrapeTelegram(channel);
      allItems.push(...items);
      console.log(`@${channel}: ${items.length} messages scraped`);
    }

    for (const feed of RSS_FEEDS) {
      const items = await scrapeRSS(feed.url, feed.name);
      allItems.push(...items);
      console.log(`${feed.name} RSS: ${items.length} items scraped`);
    }

    // Parse into operations
    const existingIds = new Set<string>(); // GitHub module handles dedup
    const operations = parseOperations(allItems, existingIds);
    console.log(`Parsed ${operations.length} operations from ${allItems.length} items`);

    // Get today's date in Beirut timezone
    const beirutNow = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);
    const today = beirutNow.toISOString().split('T')[0];

    // Update GitHub
    const result = await updateDailyOperations(today, operations, githubToken);

    const response = {
      success: true,
      date: today,
      scraped: allItems.length,
      parsed: operations.length,
      added: result.added,
      total: result.total,
      reviewItems: result.reviewItems.map(op => ({
        title: op.title,
        source: op.source,
        category: op.category,
      })),
      timestamp: new Date().toISOString(),
    };

    console.log('Scrape complete:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: 'Scrape failed', details: String(error) },
      { status: 500 }
    );
  }
}
