'use client';

import { GradientButton } from '@/components/ui/gradient-button';

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
