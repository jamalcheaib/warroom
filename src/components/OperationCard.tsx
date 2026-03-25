'use client';

import { Operation } from '@/lib/types';
import {
  categoryLabels,
  categoryColors,
  statusLabels,
  statusColors,
  OperationCategory,
  OperationStatus,
} from '@/lib/terminology';

interface OperationCardProps {
  operation: Operation;
}

const sourceIcons: Record<string, string> = {
  '@mmirleb': '🟡',
  '@ElamAlmoqawama': '🟢',
  '@unewschannel': '🔵',
  '@almayadeen': '🔴',
  'Al Jazeera': '📺',
  'Reuters': '📰',
};

export default function OperationCard({ operation }: OperationCardProps) {
  const time = new Date(operation.time).toLocaleTimeString('ar-LB', {
    timeZone: 'Asia/Beirut',
    hour: '2-digit',
    minute: '2-digit',
  });

  const catColor = categoryColors[operation.category as OperationCategory];
  const statColor = statusColors[operation.status as OperationStatus];
  const statLabel = statusLabels[operation.status as OperationStatus];
  const catLabel = categoryLabels[operation.category as OperationCategory];
  const icon = sourceIcons[operation.source] || '📌';

  const isEnemy = operation.category === 'enemy';

  return (
    <div
      className={`bg-[#111827] border rounded-lg p-4 transition-all hover:border-opacity-80 ${
        isEnemy ? 'border-red-900/50' : 'border-gray-700/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-mono">{time}</span>
          <span
            className="px-2 py-0.5 rounded text-xs font-semibold"
            style={{ backgroundColor: `${catColor}20`, color: catColor }}
          >
            {catLabel}
          </span>
        </div>
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap"
          style={{ backgroundColor: `${statColor}20`, color: statColor }}
        >
          {statLabel}
        </span>
      </div>

      <h3 className="text-white font-bold text-base mb-2 leading-relaxed">
        {operation.title}
      </h3>

      <p className="text-gray-400 text-sm leading-relaxed mb-3">
        {operation.description}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{icon}</span>
        <span>{operation.source}</span>
      </div>
    </div>
  );
}
