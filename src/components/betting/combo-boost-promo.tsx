'use client';

export function ComboBoostPromo() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-4">
      {/* Glow effect */}
      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-purple-500/30 blur-2xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          <span className="text-xl">🔥</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">COMBO BOOST</h4>
          <p className="text-xs text-gray-400">Add 3+ selections for 50% extra winnings!</p>
        </div>
      </div>
    </div>
  );
}
