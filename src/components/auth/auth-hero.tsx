'use client';

import Image from 'next/image';

export function AuthHero() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] p-8 lg:p-12">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />

      {/* Basketball player image - positioned to the right */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[80%] h-[90%] opacity-90">
        <div className="relative h-full w-full">
          {/* Placeholder gradient for basketball player silhouette */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-purple-500/5 to-transparent" />
          {/* Basketball player image would go here */}
          <Image
            src="/images/basketball-player.png"
            alt="Basketball player"
            fill
            className="object-contain object-right"
            priority
            onError={(e) => {
              // Hide image on error
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
            <svg
              className="h-6 w-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">FunkySports</span>
        </div>

        {/* Hero text - centered */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
            <span className="text-white italic">LEVEL UP</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent italic">
              YOUR GAME
            </span>
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Join the most vibrant sports community on the planet. Access elite stats and connect with top-tier players.
          </p>
        </div>

        {/* Hashtag badges */}
        <div className="flex gap-3">
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            #VibrantAthletics
          </span>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            #NeonSports
          </span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[#0f0f1a] to-transparent" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
    </div>
  );
}
