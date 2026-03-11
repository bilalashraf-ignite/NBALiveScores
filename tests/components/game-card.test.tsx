import { render, screen } from '@testing-library/react'
import { GameCard } from '@/components/game-card'
import { Game, GameState } from '@/types/sports-data'

const mockGame: Game = {
  id: '1',
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
    render(<GameCard game={mockGame} />)
    
    expect(screen.getByText('Los Angeles Lakers')).toBeInTheDocument()
    expect(screen.getByText('Golden State Warriors')).toBeInTheDocument()
    expect(screen.getByText('98')).toBeInTheDocument()
    expect(screen.getByText('92')).toBeInTheDocument()
  })

  it('shows status badge in top-right corner', () => {
    render(<GameCard game={mockGame} />)
    
    // StatusBadge should render with LIVE text
    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('displays quarter/period and time remaining when available', () => {
    render(<GameCard game={mockGame} />)
    
    expect(screen.getByText(/Q3/)).toBeInTheDocument()
    expect(screen.getByText(/5:32/)).toBeInTheDocument()
  })

  it('shows possession indicator highlighting team with possession', () => {
    const { container } = render(<GameCard game={mockGame} />)
    
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
    
    render(<GameCard game={minimalGame} />)
    
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
    
    const { container } = render(<GameCard game={gameWithoutLogos} />)
    
    // Should show abbreviations as fallback
    expect(screen.getByText('LAL')).toBeInTheDocument()
    expect(screen.getByText('GSW')).toBeInTheDocument()
  })

  it('displays team logos when logoUrl is provided', () => {
    render(<GameCard game={mockGame} />)
    
    const images = screen.getAllByRole('img')
    expect(images.length).toBe(2)
    expect(images[0]).toHaveAttribute('src', 'https://example.com/lal.png')
    expect(images[0]).toHaveAttribute('alt', 'Los Angeles Lakers')
    expect(images[1]).toHaveAttribute('src', 'https://example.com/gsw.png')
    expect(images[1]).toHaveAttribute('alt', 'Golden State Warriors')
  })

  it('shows scheduled game time for SCHEDULED state', () => {
    const scheduledGame: Game = {
      ...mockGame,
      state: GameState.SCHEDULED,
      period: undefined,
      timeRemaining: undefined,
      possession: undefined
    }
    
    render(<GameCard game={scheduledGame} />)
    
    // Should show formatted date/time (Mar 11 at ...)
    expect(screen.getByText(/Mar/)).toBeInTheDocument()
  })

  it('hides game context section for scheduled games', () => {
    const scheduledGame: Game = {
      ...mockGame,
      state: GameState.SCHEDULED,
      period: 3,
      timeRemaining: '5:32'
    }
    
    render(<GameCard game={scheduledGame} />)
    
    // Period and time should not be shown for scheduled games
    expect(screen.queryByText(/Q3/)).not.toBeInTheDocument()
    expect(screen.queryByText(/5:32/)).not.toBeInTheDocument()
  })

  it('shows game context for LIVE games', () => {
    render(<GameCard game={mockGame} />)
    
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
    
    render(<GameCard game={halftimeGame} />)
    
    // Halftime game should show period
    expect(screen.getByText(/Q2/)).toBeInTheDocument()
  })
})
