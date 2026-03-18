'use client';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-purple-500/20 bg-[#1a1a2e] p-1">
      <button
        onClick={() => onChange('grid')}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium
          transition-all duration-200
          ${view === 'grid'
            ? 'bg-purple-500/20 text-white'
            : 'text-gray-400 hover:text-white'
          }
        `}
      >
        Grid
      </button>
      <button
        onClick={() => onChange('list')}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium
          transition-all duration-200
          ${view === 'list'
            ? 'bg-purple-500/20 text-white'
            : 'text-gray-400 hover:text-white'
          }
        `}
      >
        List
      </button>
    </div>
  );
}
