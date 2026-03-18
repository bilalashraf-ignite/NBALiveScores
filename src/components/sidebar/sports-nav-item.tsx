'use client';

interface SportsNavItemProps {
  name: string;
  icon: React.ReactNode;
  count: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function SportsNavItem({
  name,
  icon,
  count,
  isActive = false,
  onClick,
}: SportsNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-3 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'bg-purple-500/20 text-white border border-purple-500/30'
          : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="font-medium">{name}</span>
      </div>
      <span
        className={`
          px-2 py-0.5 rounded-full text-xs font-semibold
          ${isActive
            ? 'bg-purple-500 text-white'
            : 'bg-purple-500/20 text-purple-300'
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}
