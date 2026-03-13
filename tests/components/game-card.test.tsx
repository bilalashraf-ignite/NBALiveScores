import { render, screen } from '@testing-library/react'
import { GameCard } from '@/components/game-card'
import { Game, GameState } from '@/types/sports-data'

// Mock GameTime component
jest.mock('@/components/game-time', () => ({
  GameTime: ({ scheduledTime }: { scheduledTime: Date }) => (
    <time data-testid="game-time">{scheduledTime.toISOString()}</time>
  ),
}));

const mockGame: Game = {
  id: '1',
  league: 'NBA',
  homeTeam: {
    id: 'lal',
    name: 'Los Angeles Lakers',
    abbreviation: 'LAL',
    logoUrl: 'https://example.com/lal.png'
  },
  awayTeam: {
    id: 'gsw',
    name: 'Golden State Warriors',
    abbreviation: 'GSW',
    logoUrl: 'https://example.com/gsw.png'
  },
  score: {
    home: 98,
    away: 92
  },
  state: GameState.LIVE,
  scheduledTime: new Date('2026-03-11T19:30:00Z'),
  period: 3,
  timeRemaining: '5:32',
  possession: 'home'
}

describe('GameCard', () => {
  it('displays team names, abbreviations, and scores', () => {
    render(<GameCard game={mockGame} index={0} />)
    
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument()
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument()
    expect(screen.getByText('98')).toBeInTheDocument()
    expect(screen.getByText('92')).toBeInTheDocument()
  })

  it('shows status badge in top-right corner', () => {
    render(<GameCard game={mockGame} index={0} />)
    
    // StatusBadge should render with LIVE text
    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('displays quarter/period and time remaining when available', () => {
    render(<GameCard game={mockGame} index={0} />)
    
    expect(screen.getByText(/Q3/)).toBeInTheDocument()
    expect(screen.getByText(/5:32/)).toBeInTheDocument()
  })

  it('shows possession indicator highlighting team with possession', () => {
    const { container } = render(<GameCard game={mockGame} index={0} />)
    
    // Possession indicator should be present (green dot)
    const possessionIndicators = container.querySelectorAll('[title="Possession"]')
    expect(possessionIndicators.length).toBeGreaterThan(0)
  })

  it('handles missing optional data gracefully', () => {
    const minimalGame: Game = {
      ...mockGame,
      period: undefined,
      timeRemaining: undefined,
      possession: undefined,
      homeTeam: { ...mockGame.homeTeam, logoUrl: undefined },
      awayTeam: { ...mockGame.awayTeam, logoUrl: undefined }
    }
    
    render(<GameCard game={minimalGame} index={0} />)
    
    // Should still render without crashing
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument()
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument()
  })

  it('displays team logos with fallback for missing logoUrl', () => {
    const gameWithoutLogos: Game = {
      ...mockGame,
      homeTeam: { ...mockGame.homeTeam, logoUrl: undefined },
      awayTeam: { ...mockGame.awayTeam, logoUrl: undefined }
    }
    
    const { container } = render(<GameCard game={gameWithoutLogos} index={0} />)
    
    // Should show abbreviations as fallback
    expect(screen.getByText('LAL')).toBeInTheDocument()
    expect(screen.getByText('GSW')).toBeInTheDocument()
  })

  it('displays team logos when logoUrl is provided', () => {
    render(<GameCard game={mockGame} index={0} />)

    const images = screen.getAllByRole('img')
    expect(images.length).toBe(2)
    // Next.js Image component transforms URLs to /_next/image?url=...
    expect(images[0]).toHaveAttribute('src', expect.stringContaining('lal.png'))
    expect(images[0]).toHaveAttribute('alt', 'Los Angeles Lakers')
    expect(images[1]).toHaveAttribute('src', expect.stringContaining('gsw.png'))
    expect(images[1]).toHaveAttribute('alt', 'Golden State Warriors')
  })

  it('shows scheduled game time for SCHEDULED state using GameTime component', () => {
    const scheduledGame: Game = {
      ...mockGame,
      state: GameState.SCHEDULED,
      period: undefined,
      timeRemaining: undefined,
      possession: undefined
    }

    render(<GameCard game={scheduledGame} index={0} />)

    // Should render GameTime component
    expect(screen.getByTestId('game-time')).toBeInTheDocument()
  })

  it('hides game context section for scheduled games', () => {
    const scheduledGame: Game = {
      ...mockGame,
      state: GameState.SCHEDULED,
      period: 3,
      timeRemaining: '5:32'
    }
    
    render(<GameCard game={scheduledGame} index={0} />)
    
    // Period and time should not be shown for scheduled games
    expect(screen.queryByText(/Q3/)).not.toBeInTheDocument()
    expect(screen.queryByText(/5:32/)).not.toBeInTheDocument()
  })

  it('shows game context for LIVE games', () => {
    render(<GameCard game={mockGame} index={0} />)
    
    // Live game should show period and time
    expect(screen.getByText(/Q3/)).toBeInTheDocument()
    expect(screen.getByText(/5:32/)).toBeInTheDocument()
  })

  it('shows game context for HALFTIME games', () => {
    const halftimeGame: Game = {
      ...mockGame,
      state: GameState.HALFTIME,
      period: 2
    }

    render(<GameCard game={halftimeGame} index={0} />)

    // Halftime game should show period
    expect(screen.getByText(/Q2/)).toBeInTheDocument()
  })

  it('shows fouls count when teamFouls exists for LIVE game', () => {
    const gameWithFouls: Game = {
      ...mockGame,
      state: GameState.LIVE,
      teamFouls: {
        home: 3,
        away: 2
      }
    }

    render(<GameCard game={gameWithFouls} index={0} />)

    // Should display "Fouls: 3-2"
    expect(screen.getByText('Fouls: 3-2')).toBeInTheDocument()
  })

  it('shows fouls count when teamFouls exists for HALFTIME game', () => {
    const gameWithFouls: Game = {
      ...mockGame,
      state: GameState.HALFTIME,
      teamFouls: {
        home: 4,
        away: 5
      }
    }

    render(<GameCard game={gameWithFouls} index={0} />)

    // Should display "Fouls: 4-5"
    expect(screen.getByText('Fouls: 4-5')).toBeInTheDocument()
  })

  it('hides fouls section when teamFouls is undefined', () => {
    const gameWithoutFouls: Game = {
      ...mockGame,
      state: GameState.LIVE,
      teamFouls: undefined
    }

    render(<GameCard game={gameWithoutFouls} index={0} />)

    // Should NOT display fouls text
    expect(screen.queryByText(/Fouls:/)).not.toBeInTheDocument()
  })

  it('hides fouls section for FINAL game even if teamFouls exists', () => {
    const finalGame: Game = {
      ...mockGame,
      state: GameState.FINAL,
      teamFouls: {
        home: 6,
        away: 4
      }
    }

    render(<GameCard game={finalGame} index={0} />)

    // Should NOT display fouls for final games
    expect(screen.queryByText(/Fouls:/)).not.toBeInTheDocument()
  })

  it('displays fouls in correct format "Fouls: H-A"', () => {
    const gameWithFouls: Game = {
      ...mockGame,
      state: GameState.LIVE,
      teamFouls: {
        home: 0,
        away: 6
      }
    }

    render(<GameCard game={gameWithFouls} index={0} />)

    // Should display exact format
    expect(screen.getByText('Fouls: 0-6')).toBeInTheDocument()
  })

  it('shows GameTime component only for SCHEDULED games, not for LIVE', () => {
    const liveGame: Game = {
      ...mockGame,
      state: GameState.LIVE,
    }

    render(<GameCard game={liveGame} index={0} />)

    // Should NOT render GameTime for live games
    expect(screen.queryByTestId('game-time')).not.toBeInTheDocument()
  })

  it('shows GameTime component only for SCHEDULED games, not for FINAL', () => {
    const finalGame: Game = {
      ...mockGame,
      state: GameState.FINAL,
    }

    render(<GameCard game={finalGame} index={0} />)

    // Should NOT render GameTime for final games
    expect(screen.queryByTestId('game-time')).not.toBeInTheDocument()
  })
})
