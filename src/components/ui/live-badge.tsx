'use client';

interface LiveBadgeProps {
  time?: string;
  variant?: 'live' | 'halftime' | 'finished' | 'upcoming';
}

export function LiveBadge({ time, variant = 'live' }: LiveBadgeProps) {
  const variants = {
    live: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      dot: 'bg-red-500',
      label: 'LIVE',
    },
    halftime: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      dot: 'bg-yellow-500',
      label: 'HT',
    },
    finished: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      dot: 'bg-gray-500',
      label: 'FT',
    },
    upcoming: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      dot: 'bg-blue-500',
      label: 'SOON',
    },
  };

  const style = variants[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-xs font-semibold
        ${style.bg} ${style.text}
      `}
    >
      {variant === 'live' && (
        <span className={`h-2 w-2 rounded-full ${style.dot} animate-pulse`} />
      )}
      <span>{style.label}</span>
      {time && <span>{time}</span>}
    </span>
  );
}
