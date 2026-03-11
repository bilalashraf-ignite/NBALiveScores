import { render } from '@testing-library/react'
import { GameCardSkeleton } from '@/components/game-card-skeleton'

describe('GameCardSkeleton', () => {
  it('renders with structure matching GameCard layout', () => {
    const { container } = render(<GameCardSkeleton />)
    
    // Should have card-like container with proper styling
    const card = container.querySelector('.rounded-lg.border.border-gray-200.bg-white.p-6.shadow-sm')
    expect(card).toBeInTheDocument()
  })

  it('has animate-pulse class on skeleton elements', () => {
    const { container } = render(<GameCardSkeleton />)
    
    // Skeleton elements should have pulse animation
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('has same outer dimensions as GameCard', () => {
    const { container } = render(<GameCardSkeleton />)
    
    // Should have border, padding, and rounded corners matching GameCard
    const card = container.querySelector('.rounded-lg')
    expect(card).toHaveClass('border', 'border-gray-200', 'bg-white', 'p-6', 'shadow-sm')
  })

  it('does not animate entire card (only individual elements)', () => {
    const { container } = render(<GameCardSkeleton />)
    
    // Parent card should NOT have animate-pulse
    const card = container.querySelector('.rounded-lg.border.border-gray-200')
    expect(card).not.toHaveClass('animate-pulse')
    
    // But child elements should
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })

  it('renders skeleton elements for badge, teams, scores, and context', () => {
    const { container } = render(<GameCardSkeleton />)
    
    // Should have multiple skeleton boxes for different sections
    const skeletonBoxes = container.querySelectorAll('.bg-gray-200')
    expect(skeletonBoxes.length).toBeGreaterThan(5) // Badge, 2 teams, 2 scores, context
  })

  it('matches GameCard spacing with space-y-4', () => {
    const { container } = render(<GameCardSkeleton />)
    
    // Should have vertical spacing matching GameCard
    const spacedContainer = container.querySelector('.space-y-4')
    expect(spacedContainer).toBeInTheDocument()
  })
})
