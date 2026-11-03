'use client';

import dynamic from 'next/dynamic';

const MiniMap = dynamic(() => import('./MiniMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-wr-deep" />,
});

export default function MiniMapClient(props: { points: { name: string; count: number; lat: number; lon: number }[] }) {
  return <MiniMap {...props} />;
}
