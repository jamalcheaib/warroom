'use client';

import { Operation } from '@/lib/types';
import { categoryLabels, OperationCategory } from '@/lib/terminology';

interface StatsBarProps {
  operations: Operation[];
  lastUpdated: string;
}

export default function StatsBar({ operations, lastUpdated }: StatsBarProps) {
  const total = operations.length;

  const byCat = operations.reduce<Record<string, number>>((acc, op) => {
    acc[op.category] = (acc[op.category] || 0) + 1;
    return acc;
  }, {});

  const updated = new Date(lastUpdated).toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Beirut',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-zinc-50 dark:bg-[#111827] border border-zinc-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 dark:text-gray-400 text-sm">إجمالي العمليات:</span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">{total}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {(Object.entries(byCat) as [OperationCategory, number][]).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-1 text-sm">
              <span className="text-zinc-500 dark:text-gray-400">{categoryLabels[cat as OperationCategory]}:</span>
              <span className="text-zinc-900 dark:text-white font-semibold">{count}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-zinc-500 dark:text-gray-400">آخر تحديث:</span>
          <span className="text-zinc-900 dark:text-white">{updated}</span>
        </div>
      </div>
    </div>
  );
}
