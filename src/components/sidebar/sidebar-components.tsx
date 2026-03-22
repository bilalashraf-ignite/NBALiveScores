'use client';

import { GradientButton } from '@/components/ui/gradient-button';

// Pro feature card for upselling
export function ProFeatureCard() {
  return (
    <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
        Pro Feature
      </p>
      <h3 className="mt-2 text-lg font-bold text-white">
        Win Predictions
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        Get AI-driven insights for every live match.
      </p>
      <GradientButton size="sm" fullWidth className="mt-4">
        Upgrade Now
      </GradientButton>
    </div>
  );
}

// League navigation item
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

// Sports navigation item with count badge
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
