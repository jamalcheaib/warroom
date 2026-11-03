import type { Metadata } from 'next';
import ImpactPage from '@/components/field/ImpactPage';

export const metadata: Metadata = {
  title: 'الأثر المعلن | غرفة الحرب',
  description: 'الصفارات والاعتراضات والخسائر التي أعلنتها المصادر الإسرائيلية، مربوطة بعمليات المقاومة.',
};

export default function Page() {
  return <ImpactPage />;
}
