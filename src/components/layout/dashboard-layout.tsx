'use client';

import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
}

export function DashboardLayout({
  children,
  leftSidebar,
  rightSidebar,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex">
          {/* Left Sidebar */}
          {leftSidebar && (
            <aside className="hidden lg:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-purple-500/10">
              {leftSidebar}
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Right Sidebar */}
          {rightSidebar && (
            <aside className="hidden xl:block w-80 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-l border-purple-500/10">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
