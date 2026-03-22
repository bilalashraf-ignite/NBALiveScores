'use client';

import { GradientButton } from '@/components/ui/gradient-button';

export function FeaturedMatch() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#252540] to-[#1a1a2e] border border-purple-500/20">
      {/* Background decoration */}
      <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full text-purple-500">
          <circle cx="150" cy="150" r="120" fill="currentColor" opacity="0.3" />
          <circle cx="180" cy="180" r="80" fill="currentColor" opacity="0.2" />
        </svg>
      </div>

      <div className="relative p-6 lg:p-8">
        <div className="max-w-lg">
          <h2 className="text-2xl lg:text-3xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Super Sunday Clash
            </span>
          </h2>
          <p className="mt-3 text-gray-400 text-lg">
            Real Madrid vs Barcelona.
            <br />
            Experience the El Clásico like never before with live 4K streaming.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <GradientButton>
              Get Early Access
            </GradientButton>
            <div className="text-sm text-gray-500">
              <span className="text-gray-400 font-medium">STARTS IN</span>
              <div className="text-xl font-bold text-white mt-1">
                18:42:05
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
