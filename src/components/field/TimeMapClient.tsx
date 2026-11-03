'use client';

import dynamic from 'next/dynamic';

const TimeMap = dynamic(() => import('./TimeMap'), {
  ssr: false,
  loading: () => <div className="h-[75vh] flex items-center justify-center text-wr-muted text-sm">جارٍ تحميل الخريطة…</div>,
});

export default function TimeMapClient() {
  return <TimeMap />;
}
