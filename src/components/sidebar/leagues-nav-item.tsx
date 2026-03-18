'use client';

interface LeaguesNavItemProps {
  name: string;
  icon?: React.ReactNode;
  color?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function LeaguesNavItem({
  name,
  icon,
  color = 'purple',
  isActive = false,
  onClick,
}: LeaguesNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'text-white bg-purple-500/10'
          : 'text-gray-400 hover:text-white hover:bg-purple-500/5'
        }
      `}
    >
      {icon ? (
        <span className="text-lg">{icon}</span>
      ) : (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="font-medium text-sm">{name}</span>
    </button>
  );
}
