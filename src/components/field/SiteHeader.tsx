import Link from 'next/link';

const NAV = [
  { href: '/', key: 'log', label: 'السجل الميداني' },
  { href: '/losses', key: 'losses', label: 'الخسائر الإسرائيلية' },
  { href: '/analysis', key: 'analysis', label: 'تحليلات' },
  { href: '/archive', key: 'archive', label: 'الأرشيف' },
];

export default function SiteHeader({ active, band }: { active: string; band?: { left: string; right: string } }) {
  return (
    <>
      {band && (
        <div className="bg-wr-gold text-[#14110A] font-wrmono text-xs font-semibold tracking-wide">
          <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-1.5 flex flex-wrap justify-between gap-x-4 gap-y-1">
            <span>{band.right}</span>
            <span>{band.left}</span>
          </div>
        </div>
      )}
      <header className="border-b border-wr-line bg-wr-deep/95 sticky top-0 z-[1000] backdrop-blur">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F04438] shadow-[0_0_0_4px_rgba(240,68,56,0.18)]" />
            <span className="font-kufi text-xl font-extrabold text-wr-text">غرفة الحرب</span>
            <span className="hidden sm:inline text-xs text-wr-muted border border-wr-line rounded px-1.5 py-0.5">الجبهة اللبنانية</span>
          </Link>
          <nav className="flex gap-1 text-sm w-full md:w-auto md:flex-1 overflow-x-auto wr-scroll-x whitespace-nowrap">
            {NAV.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                aria-current={active === n.key ? 'page' : undefined}
                className={
                  active === n.key
                    ? 'px-3 py-2.5 rounded bg-wr-soft text-white font-semibold shadow-[inset_0_-2px_0_#C9A227]'
                    : 'px-3 py-2.5 rounded text-wr-sub hover:text-white hover:bg-wr-soft/60'
                }
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
