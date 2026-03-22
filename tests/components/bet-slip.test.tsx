/**
 * Tests for BetSlip component.
 *
 * Verifies:
 * - Empty state displays correctly
 * - Selections render with proper odds
 * - Total odds calculation is correct
 * - Potential return calculation is accurate
 * - Clear all functionality works
 * - Remove selection functionality works
 * - Place bet callback is triggered
 * - Stake input updates correctly
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BetSlip } from '@/components/betting/bet-slip';

// Mock the dependent components
jest.mock('@/components/ui/gradient-button', () => ({
  GradientButton: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="gradient-button">
      {children}
    </button>
  ),
}));

jest.mock('@/components/betting/stake-input', () => ({
  StakeInput: ({ value, onChange }: any) => (
    <div data-testid="stake-input">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        data-testid="stake-input-field"
      />
    </div>
  ),
}));

jest.mock('@/components/betting/betting-primitives', () => ({
  ComboBoostPromo: () => <div data-testid="combo-boost-promo">Combo Boost Promo</div>,
}));

const mockSelections = [
  { id: '1', type: 'home', odds: 1.5, label: 'Team A to Win' },
  { id: '2', type: 'over25', odds: 1.8, label: 'Over 2.5 Goals' },
];

describe('BetSlip', () => {
  describe('Empty State', () => {
    it('renders empty state message when no selections', () => {
      render(<BetSlip selections={[]} />);

      expect(screen.getByText('Click on odds to add selections')).toBeInTheDocument();
    });

    it('displays BET SLIP header', () => {
      render(<BetSlip selections={[]} />);

      expect(screen.getByText('BET SLIP')).toBeInTheDocument();
    });

    it('does not show selection count badge when empty', () => {
      render(<BetSlip selections={[]} />);

      // Should not have any number badge
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('does not show Clear All button when empty', () => {
      render(<BetSlip selections={[]} />);

      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    });

    it('does not show Place Bet button when empty', () => {
      render(<BetSlip selections={[]} />);

      expect(screen.queryByTestId('gradient-button')).not.toBeInTheDocument();
    });

    it('always shows combo boost promo', () => {
      render(<BetSlip selections={[]} />);

      expect(screen.getByTestId('combo-boost-promo')).toBeInTheDocument();
    });
  });

  describe('With Selections', () => {
    it('displays selection count badge', () => {
      render(<BetSlip selections={mockSelections} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows Clear All button', () => {
      render(<BetSlip selections={mockSelections} />);

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('shows Place Bet button', () => {
      render(<BetSlip selections={mockSelections} />);

      expect(screen.getByTestId('gradient-button')).toBeInTheDocument();
      expect(screen.getByText('Place Bet')).toBeInTheDocument();
    });

    it('renders selection labels', () => {
      render(<BetSlip selections={mockSelections} />);

      expect(screen.getByText('Team A to Win')).toBeInTheDocument();
      expect(screen.getByText('Over 2.5 Goals')).toBeInTheDocument();
    });

    it('displays odds for each selection', () => {
      render(<BetSlip selections={mockSelections} />);

      expect(screen.getByText('1.50')).toBeInTheDocument();
      expect(screen.getByText('1.80')).toBeInTheDocument();
    });

    it('shows potential return section', () => {
      render(<BetSlip selections={mockSelections} />);

      expect(screen.getByText('Potential Return')).toBeInTheDocument();
    });

    it('calculates potential return correctly', () => {
      // Default stake is 10, total odds = 1.5 * 1.8 = 2.7
      // Potential return = 10 * 2.7 = 27.00
      render(<BetSlip selections={mockSelections} />);

      expect(screen.getByText('$27.00')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClearAll when Clear All is clicked', () => {
      const mockClearAll = jest.fn();
      render(<BetSlip selections={mockSelections} onClearAll={mockClearAll} />);

      fireEvent.click(screen.getByText('Clear All'));

      expect(mockClearAll).toHaveBeenCalledTimes(1);
    });

    it('calls onRemoveSelection when remove button is clicked', () => {
      const mockRemove = jest.fn();
      render(<BetSlip selections={mockSelections} onRemoveSelection={mockRemove} />);

      // Find and click the first remove button (X icon)
      const removeButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('bg-red-500')
      );
      fireEvent.click(removeButtons[0]);

      expect(mockRemove).toHaveBeenCalledWith('1');
    });

    it('calls onPlaceBet with stake when Place Bet is clicked', () => {
      const mockPlaceBet = jest.fn();
      render(<BetSlip selections={mockSelections} onPlaceBet={mockPlaceBet} />);

      fireEvent.click(screen.getByText('Place Bet'));

      expect(mockPlaceBet).toHaveBeenCalledWith(10); // Default stake
    });

    it('updates potential return when stake changes', () => {
      render(<BetSlip selections={mockSelections} />);

      const stakeInput = screen.getByTestId('stake-input-field');
      fireEvent.change(stakeInput, { target: { value: '20' } });

      // New potential return = 20 * 2.7 = 54.00
      expect(screen.getByText('$54.00')).toBeInTheDocument();
    });
  });

  describe('Odds Calculation', () => {
    it('calculates total odds by multiplying individual odds', () => {
      const selections = [
        { id: '1', type: 'home', odds: 2.0, label: 'Selection 1' },
        { id: '2', type: 'away', odds: 3.0, label: 'Selection 2' },
      ];

      render(<BetSlip selections={selections} />);

      // Total odds = 2.0 * 3.0 = 6.0
      // Potential return = 10 * 6.0 = 60.00
      expect(screen.getByText('$60.00')).toBeInTheDocument();
    });

    it('handles single selection correctly', () => {
      const selections = [{ id: '1', type: 'home', odds: 2.5, label: 'Single Bet' }];

      render(<BetSlip selections={selections} />);

      // Total odds = 2.5
      // Potential return = 10 * 2.5 = 25.00
      expect(screen.getByText('$25.00')).toBeInTheDocument();
    });

    it('rounds potential return to 2 decimal places', () => {
      const selections = [
        { id: '1', type: 'home', odds: 1.33, label: 'Selection 1' },
        { id: '2', type: 'away', odds: 1.57, label: 'Selection 2' },
      ];

      render(<BetSlip selections={selections} />);

      // Total odds = 1.33 * 1.57 = 2.0881
      // Potential return = 10 * 2.0881 = 20.88 (rounded)
      const returnElement = screen.getByText(/\$20\.8[89]/); // Allow for floating point
      expect(returnElement).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero stake gracefully', () => {
      render(<BetSlip selections={mockSelections} />);

      const stakeInput = screen.getByTestId('stake-input-field');
      fireEvent.change(stakeInput, { target: { value: '0' } });

      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('handles very small odds', () => {
      const selections = [{ id: '1', type: 'home', odds: 1.01, label: 'Low Odds' }];

      render(<BetSlip selections={selections} />);

      expect(screen.getByText('1.01')).toBeInTheDocument();
    });

    it('handles very high odds', () => {
      const selections = [{ id: '1', type: 'home', odds: 999.99, label: 'High Odds' }];

      render(<BetSlip selections={selections} />);

      expect(screen.getByText('999.99')).toBeInTheDocument();
    });

    it('works without callback props', () => {
      // Should not throw when callbacks are not provided
      render(<BetSlip selections={mockSelections} />);

      fireEvent.click(screen.getByText('Clear All'));
      fireEvent.click(screen.getByText('Place Bet'));

      // Component should still be functional
      expect(screen.getByText('BET SLIP')).toBeInTheDocument();
    });
  });
});
