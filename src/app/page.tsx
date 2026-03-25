'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatsBar from '@/components/StatsBar';
import OperationCard from '@/components/OperationCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Operation, DailyOperations } from '@/lib/types';
import { OperationCategory } from '@/lib/terminology';

function getTodayDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Beirut' });
}

export default function Home() {
  const [data, setData] = useState<DailyOperations | null>(null);
  const [filter, setFilter] = useState<OperationCategory | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const date = getTodayDate();
    fetch(`/api/operations/${date}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const operations: Operation[] = data?.operations ?? [];
  const filtered =
    filter === 'all'
      ? operations
      : operations.filter((op) => op.category === filter);

  // Sort by time descending (newest first)
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
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
        )}
      </main>
    </div>
  );
}
