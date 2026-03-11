interface GameTimeProps {
  scheduledTime: Date;
  format?: 'full' | 'time-only';
}

/**
 * Timezone-aware game time display component.
 * Automatically detects user timezone and locale preferences for 12h/24h format.
 * Handles DST transitions automatically via browser Intl API.
 *
 * Pattern source: RESEARCH.md Pattern 5 (Timezone Handling)
 * Requirements: SCHED-01, SCHED-02, SCHED-03, SCHED-04
 */
export function GameTime({ scheduledTime, format = 'full' }: GameTimeProps) {
  // Auto-detect user timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Format with locale-aware 12h/24h preference
  const formatter = new Intl.DateTimeFormat('default', {
    ...(format === 'full' ? {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    } : {
      hour: 'numeric',
      minute: '2-digit',
    }),
    timeZone: userTimeZone,
    // hour12 omitted — browser auto-detects from locale
  });

  return (
    <time dateTime={scheduledTime.toISOString()}>
      {formatter.format(scheduledTime)}
    </time>
  );
}
