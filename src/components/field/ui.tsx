import type { ReactNode } from 'react';

export function Corners() {
  const c = 'absolute w-[18px] h-[18px] border-wr-gold pointer-events-none';
  return (
    <>
      <span aria-hidden="true" className={`${c} -top-px -right-px border-t-2 border-r-2`} />
      <span aria-hidden="true" className={`${c} -top-px -left-px border-t-2 border-l-2`} />
      <span aria-hidden="true" className={`${c} -bottom-px -right-px border-b-2 border-r-2`} />
      <span aria-hidden="true" className={`${c} -bottom-px -left-px border-b-2 border-l-2`} />
    </>
  );
}

export function Panel({ children, className = '', corners = false, as: Tag = 'section' }: { children: ReactNode; className?: string; corners?: boolean; as?: 'section' | 'div' | 'aside' }) {
  return (
    <Tag className={`relative bg-wr-panel/95 border ${corners ? 'border-wr-line2' : 'border-wr-line'} p-5 md:p-6 min-w-0 ${className}`}>
      {corners && <Corners />}
      {children}
    </Tag>
  );
}

export function Kicker({ children, color = '#C9A227' }: { children: ReactNode; color?: string }) {
  return <span className="font-wrmono text-xs tracking-wide" style={{ color }}>{children}</span>;
}

export function PanelTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3">
      <h2 className="font-kufi text-lg md:text-xl font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function Swatch({ color, round = false }: { color: string; round?: boolean }) {
  return <span aria-hidden="true" className={`inline-block w-2.5 h-2.5 flex-none ${round ? 'rounded-full' : ''}`} style={{ background: color }} />;
}

export function BarList({ items, color, max }: { items: { label: string; value: number; href?: string }[]; color: string; max?: number }) {
  const m = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex flex-col gap-3">
      {items.map((i) => (
        <div key={i.label} className="flex flex-col gap-1.5">
          <div className="flex justify-between gap-3 text-sm">
            {i.href ? <a href={i.href} className="hover:text-white text-wr-text">{i.label}</a> : <span>{i.label}</span>}
            <span className="font-wrmono text-wr-sub">{i.value.toLocaleString('en-US')}</span>
          </div>
          <div className="h-1.5 bg-wr-soft"><div className="h-1.5" style={{ width: `${Math.round((i.value / m) * 100)}%`, background: color }} /></div>
        </div>
      ))}
    </div>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="wr-field wr-grid min-h-screen text-wr-text font-plex" dir="rtl">{children}</div>;
}

export function Footer({ text }: { text: string }) {
  return (
    <footer className="border-t border-wr-line bg-wr-deep/95">
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-6 flex flex-wrap justify-between gap-3 text-[13px] text-wr-muted">
        <span>غرفة الحرب · رصد وتوثيق: جمال شعيب</span>
        <span>{text}</span>
      </div>
    </footer>
  );
}
