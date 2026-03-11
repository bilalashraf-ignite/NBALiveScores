import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/status-badge'
import { GameState } from '@/types/sports-data'

describe('StatusBadge', () => {
  it('renders LIVE badge with red color and pulse animation', () => {
    render(<StatusBadge status={GameState.LIVE} />)
    const badge = screen.getByText('LIVE')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200', 'animate-pulse')
  })

  it('renders HALFTIME badge with red color and pulse animation', () => {
    render(<StatusBadge status={GameState.HALFTIME} />)
    const badge = screen.getByText('HALFTIME')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-red-100', 'text-red-800', 'border-red-200', 'animate-pulse')
  })

  it('renders FINAL badge with gray color and no animation', () => {
    render(<StatusBadge status={GameState.FINAL} />)
    const badge = screen.getByText('FINAL')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800', 'border-gray-200')
    expect(badge).not.toHaveClass('animate-pulse')
  })

  it('renders SCHEDULED badge with blue color and no animation', () => {
    render(<StatusBadge status={GameState.SCHEDULED} />)
    const badge = screen.getByText('SCHEDULED')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800', 'border-blue-200')
    expect(badge).not.toHaveClass('animate-pulse')
  })

  it('renders POSTPONED badge with yellow color and no animation', () => {
    render(<StatusBadge status={GameState.POSTPONED} />)
    const badge = screen.getByText('POSTPONED')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200')
    expect(badge).not.toHaveClass('animate-pulse')
  })

  it('renders CANCELLED badge with yellow color and no animation', () => {
    render(<StatusBadge status={GameState.CANCELLED} />)
    const badge = screen.getByText('CANCELLED')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'border-yellow-200')
    expect(badge).not.toHaveClass('animate-pulse')
  })

  it('displays correct label text for each state', () => {
    const { rerender } = render(<StatusBadge status={GameState.LIVE} />)
    expect(screen.getByText('LIVE')).toBeInTheDocument()

    rerender(<StatusBadge status={GameState.HALFTIME} />)
    expect(screen.getByText('HALFTIME')).toBeInTheDocument()

    rerender(<StatusBadge status={GameState.FINAL} />)
    expect(screen.getByText('FINAL')).toBeInTheDocument()

    rerender(<StatusBadge status={GameState.SCHEDULED} />)
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument()

    rerender(<StatusBadge status={GameState.POSTPONED} />)
    expect(screen.getByText('POSTPONED')).toBeInTheDocument()

    rerender(<StatusBadge status={GameState.CANCELLED} />)
    expect(screen.getByText('CANCELLED')).toBeInTheDocument()
  })
})
