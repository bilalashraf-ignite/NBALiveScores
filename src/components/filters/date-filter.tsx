'use client';

interface DateFilterProps {
  selected?: string;
  onChange?: (date: string) => void;
}

export function DateFilter({ selected = 'today', onChange }: DateFilterProps) {
  return (
    <button
      onClick={() => onChange?.('today')}
      className="
        flex items-center gap-2 px-4 py-2 rounded-lg
        bg-[#1a1a2e] border border-purple-500/20
        text-gray-300 hover:border-purple-500/40
        transition-all duration-200
      "
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
        />
      </svg>
      <span className="text-sm font-medium">Filter By Date</span>
    </button>
  );
}
