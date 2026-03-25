import type { Metadata } from 'next';
import { Noto_Kufi_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-kufi',
});

export const metadata: Metadata = {
  title: 'غرفة العمليات | War Room — متابعة العمليات العسكرية',
  description: 'لوحة متابعة يومية للعمليات العسكرية في لبنان وإيران والعراق — عمليات المقاومة الإسلامية، حزب الله، الحرس الثوري الإيراني، المقاومة العراقية، وعمليات العدو الأمريكي والصهيوني. تحديث مستمر من المصادر الرسمية.',
  keywords: [
    'غرفة العمليات',
    'War Room',
    'عمليات عسكرية',
    'حزب الله',
    'المقاومة الإسلامية',
    'معركة العصف المأكول',
    'الحرس الثوري الإيراني',
    'الوعد الصادق',
    'المقاومة الإسلامية في العراق',
    'محور المقاومة',
    'عمليات المقاومة',
    'الحرب على إيران',
    'العدوان الأمريكي',
    'العدوان الصهيوني',
    'كيان الاحتلال',
    'جنوب لبنان',
    'أخبار عسكرية',
    'أخبار المقاومة',
    'بيانات المقاومة',
    'تصريحات محور المقاومة',
    'لبنان',
    'إيران',
    'العراق',
    'فلسطين',
    'غزة',
  ],
  openGraph: {
    title: 'غرفة العمليات | War Room',
    description: 'لوحة متابعة يومية للعمليات العسكرية — تحديث مستمر من المصادر الرسمية لمحور المقاومة',
    type: 'website',
    locale: 'ar_LB',
    siteName: 'غرفة العمليات',
    url: 'https://warroom-ecru.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'غرفة العمليات | War Room',
    description: 'متابعة يومية للعمليات العسكرية — حزب الله، إيران، المقاومة العراقية، عمليات العدو',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://warroom-ecru.vercel.app',
  },
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
        <Analytics />
      </body>
    </html>
  );
}
