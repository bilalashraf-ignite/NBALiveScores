import { Game, GameState } from '@/types/sports-data'
import { StatusBadge } from './status-badge'

interface GameCardProps {
  game: Game
}

/**
 * Individual game card displaying comprehensive game information.
 * 
 * Layout decisions (from CONTEXT.md):
 * - Card-based design with shadows/borders (not list or grid)
 * - Status badge in top-right corner
 * - Team logos with fallback to abbreviation circles
 * - Possession indicator as small green dot
 * - Game context (period, time) shown only for LIVE/HALFTIME
 * - Scheduled time shown only for SCHEDULED games
 * - Mobile-first spacing with comfortable tap targets
 */
export function GameCard({ game }: GameCardProps) {
  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Status badge - top-right corner */}
      <div className="absolute right-4 top-4">
        <StatusBadge status={game.state} />
      </div>

      {/* Teams section */}
      <div className="space-y-4">
        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Team logo with fallback */}
            {game.homeTeam.logoUrl ? (
              <img 
                src={game.homeTeam.logoUrl} 
                alt={game.homeTeam.name} 
                className="h-10 w-10" 
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                {game.homeTeam.abbreviation}
              </div>
            )}
            <div>
              <div className="font-semibold">{game.homeTeam.name}</div>
              {/* Season record - placeholder for Phase 4 when team data model expanded */}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Possession indicator */}
            {game.possession === 'home' && (
              <div className="h-3 w-3 rounded-full bg-green-500" title="Possession" />
            )}
            {/* Score */}
            <div className="text-3xl font-bold">{game.score.home}</div>
          </div>
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Team logo with fallback */}
            {game.awayTeam.logoUrl ? (
              <img 
                src={game.awayTeam.logoUrl} 
                alt={game.awayTeam.name} 
                className="h-10 w-10" 
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                {game.awayTeam.abbreviation}
              </div>
            )}
            <div>
              <div className="font-semibold">{game.awayTeam.name}</div>
              {/* Season record - placeholder for Phase 4 when team data model expanded */}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Possession indicator */}
            {game.possession === 'away' && (
              <div className="h-3 w-3 rounded-full bg-green-500" title="Possession" />
            )}
            {/* Score */}
            <div className="text-3xl font-bold">{game.score.away}</div>
          </div>
        </div>
      </div>

      {/* Game context section - only show for live/halftime games */}
      {(game.state === GameState.LIVE || game.state === GameState.HALFTIME) && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-600">
          {/* Quarter and time */}
          {game.period && (
            <span>
              Q{game.period} {game.timeRemaining || ''}
            </span>
          )}
          {/* Team fouls - show if available */}
          {game.teamFouls && (
            <span>Fouls: {game.teamFouls.home}-{game.teamFouls.away}</span>
          )}
        </div>
      )}

      {/* Scheduled game time - only show for scheduled games */}
      {game.state === GameState.SCHEDULED && (
        <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
          {new Date(game.scheduledTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
          })}
        </div>
      )}
    </div>
  )
}
