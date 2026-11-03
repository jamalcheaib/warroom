'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { DaySummary } from '@/lib/field-data';
import { formatDayShort, formatDateLong } from '@/lib/field-format';

export default function DayStrip({ days, selected }: { days: DaySummary[]; selected: string }) {
  const router = useRouter();
  const selRef = useRef<HTMLAnchorElement>(null);
  const calRef = useRef<HTMLInputElement>(null);
  const max = Math.max(...days.map((d) => d.total), 1);

  useEffect(() => {
    selRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [selected]);

  return (
    <div className="border-b border-wr-soft bg-wr-deep/95">
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-3 flex items-center gap-1.5">
        <button
          type="button"
          aria-label="اختيار تاريخ من التقويم"
          onClick={() => calRef.current?.showPicker?.()}
          className="relative flex-none w-11 h-14 rounded border border-wr-line2 bg-wr-panel text-wr-gold flex items-center justify-center"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
          <input
            ref={calRef}
            type="date"
            aria-label="التاريخ"
            min={days[0]?.date}
            max={days[days.length - 1]?.date}
            value={selected}
            onChange={(e) => e.target.value && router.push(`/log/${e.target.value}`)}
            className="absolute opacity-0 w-0 h-0"
          />
        </button>
        <div className="flex-1 flex gap-1.5 overflow-x-auto wr-scroll-x py-0.5">
          {days.map((d) => {
            const k = d.total / max;
            const sel = d.date === selected;
            const heat = k > 0.6 ? '#E8622C' : k > 0.3 ? '#C9A227' : '#6B7787';
            return (
              <Link
                key={d.date}
                ref={sel ? selRef : undefined}
                href={`/log/${d.date}`}
                title={`${formatDateLong(d.date)} — ${d.total} حدثاً`}
                aria-current={sel ? 'date' : undefined}
                className={`flex-none w-[66px] h-14 rounded border font-wrmono flex flex-col items-center justify-center gap-1 ${
                  sel ? 'border-wr-gold bg-wr-soft' : 'border-wr-line bg-wr-deep hover:border-wr-line2'
                }`}
              >
                <span className="text-[15px] font-semibold text-wr-text">{formatDayShort(d.date)}</span>
                <span className="flex items-end gap-1 h-3.5">
                  <span style={{ width: 4, height: Math.max(2, Math.round(k * 14)), background: heat }} />
                  <span className="text-[10px] text-wr-muted leading-none">{d.total}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
