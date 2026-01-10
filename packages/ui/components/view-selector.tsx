'use client';

import { cn } from '../lib/utils';

interface View {
  id: string;
  title: string;
  slug: string;
}

interface ViewSelectorProps {
  views: View[];
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  title?: string;
  className?: string;
}

export function ViewSelector({
  views,
  activeViewId,
  onViewChange,
  title = 'VIEWS',
  className,
}: ViewSelectorProps) {
  return (
    <div className={cn('w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto', className)}>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-1">
        {views.map((view) => {
          const isActive = view.id === activeViewId;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={cn(
                'w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              )}
            >
              <span className="text-xs">{isActive ? '►' : '○'}</span>
              <span className="truncate">{view.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
