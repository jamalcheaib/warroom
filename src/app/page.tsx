'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import OperationCard from '@/components/OperationCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Operation, DailyOperations } from '@/lib/types';
import { OperationCategory } from '@/lib/terminology';

const OperationsMap = dynamic(() => import('@/components/OperationsMap'), { ssr: false });

const ARABIC_MONTHS: Record<number, string> = {
  1: 'كانون 2',
  2: 'شباط',
  3: 'آذار',
  4: 'نيسان',
  5: 'أيار',
  6: 'حزيران',
  7: 'تموز',
  8: 'آب',
  9: 'أيلول',
  10: 'تشرين 1',
  11: 'تشرين 2',
  12: 'كانون 1',
};

function toArabicNum(n: number): string {
  return String(n);
}

function getTodayDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' });
}

function generateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (cur <= last) {
    dates.push(cur.toLocaleDateString('en-CA'));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDateArabic(dateStr: string): { day: string; month: string } {
  const [, m, d] = dateStr.split('-').map(Number);
  return { day: toArabicNum(d), month: ARABIC_MONTHS[m] };
}

export default function Home() {
  const [data, setData] = useState<DailyOperations | null>(null);
  const [filter, setFilter] = useState<OperationCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [view, setView] = useState<'list' | 'map'>('list');
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLInputElement>(null);

  const dates = generateDates('2026-02-28', getTodayDate());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/operations/${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  // Scroll to selected date on mount
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, []);

  const operations: Operation[] = data?.operations ?? [];
  const filtered =
    filter === 'all'
      ? operations
      : operations.filter((op) => op.category === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  const today = getTodayDate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Date Navigation Bar */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => calendarRef.current?.showPicker()}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800/80 hover:bg-gray-700 transition-colors text-green-400"
            title="فتح التقويم"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              ref={calendarRef}
              type="date"
              min="2026-02-28"
              max={today}
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="absolute opacity-0 w-0 h-0"
            />
          </button>
          <div
            ref={scrollRef}
            className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide py-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dates.map((date) => {
              const { day, month } = formatDateArabic(date);
              const isSelected = date === selectedDate;
              const isToday = date === today;
              return (
                <button
                  key={date}
                  ref={isSelected ? selectedRef : undefined}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/30'
                      : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:border-green-600 hover:text-green-400'
                  } ${isToday && !isSelected ? 'border-green-700' : ''}`}
                >
                  <div className="leading-tight text-center">
                    <div className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>{day}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-green-100' : 'text-gray-500'}`}>{month}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <StatsBar
              operations={operations}
              lastUpdated={data?.lastUpdated ?? new Date().toISOString()}
            />

            {/* View Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'list'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-green-600 hover:text-green-400'
                }`}
              >
                القائمة
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  view === 'map'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-green-600 hover:text-green-400'
                }`}
              >
                الخريطة
              </button>
            </div>

            {view === 'list' ? (
              <>
                <CategoryFilter active={filter} onChange={setFilter} />
                <div className="grid gap-4 md:grid-cols-2">
                  {sorted.map((op) => (
                    <OperationCard key={op.id} operation={op} />
                  ))}
                </div>
                {sorted.length === 0 && (
                  <div className="text-center text-gray-500 py-20">
                    لا توجد عمليات مسجّلة
                  </div>
                )}
              </>
            ) : (
              <OperationsMap operations={operations} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
