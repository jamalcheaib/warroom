'use client';

import Link from 'next/link';

export default function Header() {
  const today = new Date().toLocaleDateString('en-GB', {
    timeZone: 'Asia/Beirut',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-[#0a0f1a] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <Link href="/" className="text-xl md:text-2xl font-bold text-white hover:text-green-400 transition-colors">
            غرفة الحرب{' '}
            <span className="text-gray-500 font-normal text-sm md:text-base">| War Room</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/losses"
            className="text-sm text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            خسائر العدو
          </Link>
          <div className="text-gray-400 text-sm hidden md:block">{today}</div>
        </div>
      </div>
    </header>
  );
}
