import Image from 'next/image';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { LossesData, EnemyLoss } from '@/lib/types';

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'military_vehicles', label: 'آليات عسكرية', icon: '🚛' },
  { key: 'technical_equipment', label: 'تجهيزات فنيّة', icon: '⚙️' },
  { key: 'military_factories', label: 'مصانع وشركات عسكرية', icon: '🏭' },
  { key: 'artillery_positions', label: 'مرابض مدفعية', icon: '💣' },
  { key: 'bunkers', label: 'دشم وتحصينات', icon: '🏚️' },
  { key: 'radar', label: 'رادار', icon: '📡' },
  { key: 'drones', label: 'طائرات مسيّرة', icon: '✈️' },
  { key: 'quadcopter', label: 'كوادكابتر', icon: '🚁' },
  { key: 'settlement_units', label: 'وحدات استيطانية', icon: '🏘️' },
  { key: 'aircraft', label: 'محلّقة', icon: '🛩️' },
  { key: 'command_centers', label: 'مراكز قيادة', icon: '🎯' },
  { key: 'iron_dome', label: 'منصة قبة حديدية', icon: '🛡️' },
  { key: 'soldiers_killed', label: 'جنود قتلى', icon: '💀' },
  { key: 'soldiers_wounded', label: 'جنود جرحى', icon: '🏥' },
  { key: 'settlers_killed', label: 'مستوطنون قتلى', icon: '💀' },
  { key: 'settlers_wounded', label: 'مستوطنون جرحى', icon: '🏥' },
  { key: 'other', label: 'مختلف', icon: '➕' },
];

function toArabicNum(n: number): string {
  return n.toLocaleString('en-US');
}

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{toArabicNum(display)}</span>;
}

export default function LossesPage() {
  const [data, setData] = useState<LossesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/losses')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalAll = data ? Object.values(data.totals).reduce((a, b) => a + b, 0) : 0;

  function getLossesForCategory(cat: string): EnemyLoss[] {
    return data?.losses.filter((l) => l.category === cat) || [];
  }

  function getSubcategoryBreakdown(losses: EnemyLoss[]): Record<string, number> {
    const map: Record<string, number> = {};
    for (const l of losses) {
      const key = l.subcategory || 'غير محدد';
      map[key] = (map[key] || 0) + l.count;
    }
    return map;
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          الخسائر الإسرائيلية في جنوب لبنان
        </h1>
        <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm mb-8">
          من 2/3/2026 حتى 25/3/2026
        </p>

        {/* New Infographic Section */}
        <div className="my-8 flex justify-center">
          <Image 
            src="/images/losses/loses.jpeg" 
            alt="أحدث انفوغراف للخسائر الإسرائيلية" 
            width={1000} 
            height={600} 
            className="rounded-lg shadow-md"
          />
        </div>
        {/* End New Infographic Section */}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Total Overview */}
            <div className="text-center mb-10 p-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">إجمالي الخسائر المسجّلة</p>
              <p className="text-5xl md:text-7xl font-bold text-red-500">
                <AnimatedCounter value={totalAll} />
              </p>
              {data?.lastUpdated && (
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-3">
                  آخر تحديث: {new Date(data.lastUpdated).toLocaleString('en-GB', { timeZone: 'Asia/Beirut' })}
                </p>
              )}
            </div>

            {/* Category Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {CATEGORIES.map(({ key, label, icon }) => {
                const count = data?.totals[key] || 0;
                if (count === 0 && !['soldiers_killed','soldiers_wounded','settlers_killed','settlers_wounded','other'].includes(key)) return null;
                const losses = getLossesForCategory(key);
                const breakdown = getSubcategoryBreakdown(losses);
                const hasBreakdown = Object.keys(breakdown).length > 0 && !(Object.keys(breakdown).length === 1 && breakdown['غير محدد']);

                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <h3 className="font-bold text-base">{label}</h3>
                      </div>
                      <span className="text-2xl font-bold text-red-400">
                        <AnimatedCounter value={count} />
                      </span>
                    </div>

                    {hasBreakdown && (
                      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-2 space-y-1">
                        {Object.entries(breakdown)
                          .filter(([k]) => k !== 'غير محدد')
                          .sort(([, a], [, b]) => b - a)
                          .map(([sub, cnt]) => (
                            <div key={sub} className="flex justify-between text-sm">
                              <span className="text-zinc-500 dark:text-zinc-400">{sub}</span>
                              <span className="text-zinc-700 dark:text-zinc-300 font-medium">{toArabicNum(cnt)}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {losses.length > 0 && (
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                        {losses[losses.length - 1]?.date} — {losses[0]?.date}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
