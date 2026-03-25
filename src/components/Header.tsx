'use client';

export default function Header() {
  const today = new Date().toLocaleDateString('ar-LB', {
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
          <h1 className="text-xl md:text-2xl font-bold text-white">
            غرفة العمليات{' '}
            <span className="text-gray-500 font-normal text-sm md:text-base">| War Room</span>
          </h1>
        </div>
        <div className="text-gray-400 text-sm">{today}</div>
      </div>
    </header>
  );
}
