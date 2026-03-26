import { NextRequest, NextResponse } from 'next/server';
import { scrapeTelegram, scrapeRSS } from '@/lib/scraper';
import { parseOperations } from '@/lib/parser';
import { updateDailyOperations } from '@/lib/github';

const TELEGRAM_CHANNELS = ['mmirleb', 'ElamAlmoqawama', 'unewschannel', 'almayadeen'];

const RSS_FEEDS = [
  { url: 'https://www.aljazeera.net/feed/rss2', name: 'Al Jazeera' },
  { url: 'https://www.reuters.com/arc/outboundfeeds/rss/', name: 'Reuters' },
];

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify secret
  const secret = request.nextUrl.searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  // Vercel crons send authorization via header, manual calls use query param
  const vercelCron = request.headers.get('x-vercel-cron');
  if (cronSecret && secret !== cronSecret && !vercelCron) {
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

    // Group items by date (Beirut timezone) to support multi-day backfill
    const itemsByDate = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const d = new Date(item.timestamp);
      const beirutDate = new Date(d.getTime() + 3 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      if (!itemsByDate.has(beirutDate)) itemsByDate.set(beirutDate, []);
      itemsByDate.get(beirutDate)!.push(item);
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' });
    const existingIds = new Set<string>(); // GitHub module handles dedup

    // Process each date
    let totalAdded = 0;
    let totalParsed = 0;
    let todayResult: Awaited<ReturnType<typeof updateDailyOperations>> | null = null;

    const dates = Array.from(itemsByDate.keys()).sort();
    for (const date of dates) {
      const ops = parseOperations(itemsByDate.get(date)!, existingIds, date);
      totalParsed += ops.length;
      if (ops.length === 0) continue;
      const result = await updateDailyOperations(date, ops, githubToken);
      totalAdded += result.added;
      if (date === today) todayResult = result;
    }

    // Fallback: if today had no items, still parse for today
    if (!todayResult) {
      const ops = parseOperations(allItems, existingIds, today);
      todayResult = await updateDailyOperations(today, ops, githubToken);
      totalAdded += todayResult.added;
      totalParsed += ops.length;
    }

    const result = todayResult;

    const response = {
      success: true,
      date: today,
      dates: dates,
      scraped: allItems.length,
      parsed: totalParsed,
      added: totalAdded,
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
