import LogPage from '@/components/field/LogPage';
import { getIndex } from '@/lib/field-data';

export default function Home() {
  return <LogPage date={getIndex().lastDate} />;
}
