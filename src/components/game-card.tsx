import Image from 'next/image'
import { Game, GameState } from '@/types/sports-data'
import { StatusBadge } from './status-badge'
import { GameTime } from './game-time'

interface GameCardProps {
  game: Game
  index: number
  onClick?: () => void
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
 * - Clickable for LIVE/FINAL games to open detail modal (Phase 4)
 *
 * Material Design touch target minimum: 48x48px
 * https://m2.material.io/develop/web/supporting/touch-target
 */
export function GameCard({ game, index, onClick }: GameCardProps) {
  // Determine if game details can be shown (only for LIVE or FINAL games)
  const canShowDetails = game.state === GameState.LIVE || game.state === GameState.FINAL;

  // Handle keyboard accessibility (Enter/Space keys)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (canShowDetails && onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`relative min-h-[120px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${
        canShowDetails ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={canShowDetails ? onClick : undefined}
      role={canShowDetails ? 'button' : undefined}
      tabIndex={canShowDetails ? 0 : undefined}
      onKeyDown={canShowDetails ? handleKeyDown : undefined}
    >
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
              <Image
                src={game.homeTeam.logoUrl}
                alt={game.homeTeam.name}
                width={40}
                height={40}
                loading={index < 3 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+"
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
              <Image
                src={game.awayTeam.logoUrl}
                alt={game.awayTeam.name}
                width={40}
                height={40}
                loading={index < 3 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+"
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
          <GameTime scheduledTime={game.scheduledTime} format="full" />
        </div>
      )}
    </div>
  )
}
