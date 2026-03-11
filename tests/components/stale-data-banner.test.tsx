import { render, screen, fireEvent } from '@testing-library/react';
import { StaleDataBanner } from '@/components/stale-data-banner';

describe('StaleDataBanner', () => {
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test 3: StaleDataBanner displays formatted timestamp', () => {
    it('should display "showing cached data" message with formatted timestamp', () => {
      const lastUpdated = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

      render(<StaleDataBanner lastUpdated={lastUpdated} onRefresh={mockOnRefresh} />);

      expect(screen.getByText(/showing cached data/i)).toBeInTheDocument();
      // Should contain time reference
      const banner = screen.getByText(/showing cached data/i).textContent;
      expect(banner).toMatch(/(minute|second|hour)/i);
    });

    it('should display warning icon', () => {
      const lastUpdated = new Date(Date.now() - 5 * 60 * 1000);

      render(<StaleDataBanner lastUpdated={lastUpdated} onRefresh={mockOnRefresh} />);

      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('Test 4: StaleDataBanner calls onRefresh when button clicked', () => {
    it('should call onRefresh callback when Refresh button clicked', () => {
      const lastUpdated = new Date(Date.now() - 5 * 60 * 1000);

      render(<StaleDataBanner lastUpdated={lastUpdated} onRefresh={mockOnRefresh} />);

      const button = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(button);

      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
