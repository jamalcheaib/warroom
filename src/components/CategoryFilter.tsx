'use client';

import { categoryLabels, categoryColors, OperationCategory } from '@/lib/terminology';

interface CategoryFilterProps {
  active: OperationCategory | 'all';
  onChange: (cat: OperationCategory | 'all') => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const categories: (OperationCategory | 'all')[] = [
    'all',
    'hezbollah',
    'iraq_resistance',
    'iran',
    'statements',
    'enemy',
    'political',
  ];

  const labels: Record<string, string> = {
    all: 'الكل',
    ...categoryLabels,
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((cat) => {
        const isActive = active === cat;
        const color = cat === 'all' ? '#9ca3af' : categoryColors[cat as OperationCategory];
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
            style={{
              backgroundColor: isActive ? `${color}20` : 'transparent',
              borderColor: isActive ? color : '#374151',
              color: isActive ? color : '#9ca3af',
            }}
          >
            {labels[cat]}
          </button>
        );
      })}
    </div>
  );
}
