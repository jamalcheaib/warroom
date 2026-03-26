'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { theme, toggle } = useTheme();

  const today = new Date().toLocaleDateString('en-GB', {
    timeZone: 'Asia/Beirut',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white dark:bg-[#0a0f1a] border-b border-zinc-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <Link href="/" className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors">
            غرفة الحرب{' '}
            <span className="text-zinc-400 dark:text-gray-500 font-normal text-sm md:text-base">| War Room</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-gray-700 bg-zinc-100 dark:bg-gray-800/80 hover:bg-zinc-200 dark:hover:bg-gray-700 transition-colors text-lg"
            title="تبديل الوضع"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link
            href="/analysis"
            className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            تحليلات
          </Link>
          <Link
            href="/losses"
            className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            الخسائر الإسرائيلية
          </Link>
          <div className="text-zinc-500 dark:text-gray-400 text-sm hidden md:block">{today}</div>
        </div>
      </div>
    </header>
  );
}
