'use client';

import Image from 'next/image';
import type { Team } from '@/types/sports-data';

interface TeamShieldProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

const fontSizes = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function TeamShield({ team, size = 'md', showName = true }: TeamShieldProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20
          border border-purple-500/30
          flex items-center justify-center overflow-hidden
        `}
      >
        {team.logoUrl ? (
          <Image
            src={team.logoUrl}
            alt={team.name}
            width={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
            height={size === 'lg' ? 64 : size === 'md' ? 48 : 32}
            className="object-contain"
          />
        ) : (
          <span className={`font-bold text-purple-400 ${fontSizes[size]}`}>
            {team.abbreviation?.charAt(0) || team.name.charAt(0)}
          </span>
        )}
      </div>
      {showName && (
        <span className="text-sm font-medium text-white text-center max-w-[100px] truncate">
          {team.name}
        </span>
      )}
    </div>
  );
}
