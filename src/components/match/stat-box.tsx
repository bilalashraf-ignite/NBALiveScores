'use client';

interface StatBoxProps {
  value: number;
  label: string;
  icon?: 'corner' | 'yellow' | 'foul' | 'red' | 'shot' | 'save';
}

const iconMap: Record<string, string> = {
  corner: '🚩',
  yellow: '🟨',
  foul: '⚠️',
  red: '🟥',
  shot: '⚽',
  save: '🧤',
};

export function StatBox({ value, label, icon }: StatBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#1a1a2e] border border-purple-500/10 min-w-[80px]">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="flex items-center gap-1 mt-1">
        {icon && <span className="text-sm">{iconMap[icon]}</span>}
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}
