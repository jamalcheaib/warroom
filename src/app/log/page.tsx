import type { Metadata } from 'next';
import LogPage from '@/components/field/LogPage';
import { getIndex } from '@/lib/field-data';

export const metadata: Metadata = {
  title: 'السجل الميداني | غرفة الحرب',
  description: 'الموقف الميداني اليومي للجبهة اللبنانية: كل حدث بوقته وموقعه ومصدره ومستوى التحقق منه.',
};

export default function Page() {
  return <LogPage date={getIndex().lastDate} />;
}
