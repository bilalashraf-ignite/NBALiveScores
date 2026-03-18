'use client';

import { SportsNavItem } from './sports-nav-item';
import { LeaguesNavItem } from './leagues-nav-item';
import { ProFeatureCard } from './pro-feature-card';
import type { Sport, League } from '@/types/sports-data';

interface SportItem {
  id: Sport;
  name: string;
  icon: React.ReactNode;
  count: number;
}

interface LeagueItem {
  id: League;
  name: string;
  color: string;
}

interface LeftSidebarProps {
  sports: SportItem[];
  leagues: LeagueItem[];
  selectedSport: Sport;
  selectedLeague?: League | 'all';
  onSelectSport: (sport: Sport) => void;
  onSelectLeague?: (league: League | 'all') => void;
}

export function LeftSidebar({
  sports,
  leagues,
  selectedSport,
  selectedLeague = 'all',
  onSelectSport,
  onSelectLeague,
}: LeftSidebarProps) {
  return (
    <div className="flex flex-col h-full p-4">
      {/* Popular Sports */}
      <div>
        <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Popular Sports
        </h3>
        <div className="mt-3 space-y-1">
          {sports.map((sport) => (
            <SportsNavItem
              key={sport.id}
              name={sport.name}
              icon={sport.icon}
              count={sport.count}
              isActive={selectedSport === sport.id}
              onClick={() => onSelectSport(sport.id)}
            />
          ))}
        </div>
      </div>

      {/* Top Leagues */}
      <div className="mt-8">
        <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Top Leagues
        </h3>
        <div className="mt-3 space-y-1">
          {leagues.map((league) => (
            <LeaguesNavItem
              key={league.id}
              name={league.name}
              color={league.color}
              isActive={selectedLeague === league.id}
              onClick={() => onSelectLeague?.(league.id)}
            />
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Pro Feature Card */}
      <div className="mt-8">
        <ProFeatureCard />
      </div>
    </div>
  );
}
