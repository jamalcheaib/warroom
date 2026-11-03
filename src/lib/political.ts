/** جهات المسار السياسي، مشتقة من نوع البند */
export const ACTORS = [
  { key: 'israel', label: 'العدو الإسرائيلي', color: '#E8622C', match: (s: string) => s.includes('إسرائيلي') },
  { key: 'resistance', label: 'المقاومة', color: '#45D39A', match: (s: string) => s.startsWith('المقاومة') },
  { key: 'lebanon', label: 'لبنان الرسمي', color: '#8FA8E8', match: (s: string) => s.includes('لبناني') },
  { key: 'mediator', label: 'الوسيط', color: '#C9A227', match: (s: string) => s.includes('الوسيط') },
  { key: 'unifil', label: 'اليونيفيل', color: '#B7C0CC', match: (s: string) => s.includes('يونيفيل') },
] as const;
export type ActorKey = (typeof ACTORS)[number]['key'];

export function actorOf(subtype: string): ActorKey {
  return (ACTORS.find((a) => a.match(subtype))?.key ?? 'israel') as ActorKey;
}
