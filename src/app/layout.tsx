import type { Metadata } from 'next';
import { Noto_Kufi_Arabic } from 'next/font/google';
import './globals.css';

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-kufi',
});

export const metadata: Metadata = {
  title: 'غرفة العمليات | War Room',
  description: 'لوحة متابعة العمليات العسكرية اليومية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={notoKufi.variable}>
      <body className="bg-[#0a0f1a] text-white font-[family-name:var(--font-noto-kufi)] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
