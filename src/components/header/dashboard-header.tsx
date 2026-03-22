'use client';

import { useSession } from 'next-auth/react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { SearchBar } from './search-bar';
import { UserMenu } from './user-menu';
import { NavTabs, AuthButtons, StarBalanceBadge } from './header-components';

const navTabs = [
  { id: 'live', label: 'Live Scores' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'news', label: 'News' },
];

interface DashboardHeaderProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onSearch?: (query: string) => void;
  hasUnreadNotifications?: boolean;
}

export function DashboardHeader({
  activeTab = 'live',
  onTabChange,
  onSearch,
  hasUnreadNotifications = false,
}: DashboardHeaderProps) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <header className="sticky top-0 z-20 bg-[#0f0f1a] border-b border-purple-500/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <BrandLogo size="md" />
            <div className="hidden md:block">
              <NavTabs
                tabs={navTabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
              />
            </div>
          </div>

          {/* Right: Search + User */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-64">
              <SearchBar onSearch={onSearch} />
            </div>

            {/* Notification Bell */}
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-500/10 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Notification dot */}
              {hasUnreadNotifications && (
                <span
                  className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pink-500"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* User Section */}
            {isLoading ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-purple-500/20" />
            ) : session ? (
              <div className="flex items-center gap-3">
                <StarBalanceBadge />
                <UserMenu session={session} />
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden pb-3 -mx-4 px-4 overflow-x-auto">
          <NavTabs
            tabs={navTabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>
      </div>
    </header>
  );
}
