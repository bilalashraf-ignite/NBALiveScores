'use client';

interface StakeInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
}

export function StakeInput({ value, onChange, currency = '$' }: StakeInputProps) {
  const quickAmounts = [5, 10, 25, 50, 100];

  return (
    <div className="space-y-3">
      <label className="text-sm text-gray-400">Stake Amount</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{currency}</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="
            w-full pl-8 pr-4 py-3 rounded-lg
            bg-[#1a1a2e] border border-purple-500/20
            text-white text-lg font-semibold
            focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
            transition-all duration-200
          "
          min="0"
          step="0.01"
        />
      </div>
      <div className="flex gap-2">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => onChange(amount)}
            className={`
              flex-1 py-1.5 rounded-md text-xs font-medium
              transition-all duration-200
              ${value === amount
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'bg-[#252540] text-gray-400 hover:text-white border border-transparent'
              }
            `}
          >
            {currency}{amount}
          </button>
        ))}
      </div>
    </div>
  );
}
