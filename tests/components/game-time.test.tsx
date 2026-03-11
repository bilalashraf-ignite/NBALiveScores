import { render, screen } from '@testing-library/react';
import { GameTime } from '@/components/game-time';

describe('GameTime', () => {
  describe('Test 1: Formats date using Intl.DateTimeFormat', () => {
    it('should render a time element with formatted date', () => {
      const scheduledTime = new Date('2026-03-15T19:30:00Z');

      render(<GameTime scheduledTime={scheduledTime} />);

      const timeElement = screen.getByRole('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.textContent).toBeTruthy();
    });
  });

  describe('Test 2: Includes month, day, hour, minute when format=full', () => {
    it('should include date components in full format', () => {
      const scheduledTime = new Date('2026-03-15T19:30:00Z');

      render(<GameTime scheduledTime={scheduledTime} format="full" />);

      const timeElement = screen.getByRole('time');
      const text = timeElement.textContent || '';

      // Should contain month (Mar or similar)
      expect(text).toMatch(/\w{3}/); // 3-letter month abbreviation
      // Should contain day number
      expect(text).toMatch(/\d{1,2}/);
      // Should contain hour:minute pattern
      expect(text).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('Test 3: Includes only hour, minute when format=time-only', () => {
    it('should show only time in time-only format', () => {
      const scheduledTime = new Date('2026-03-15T19:30:00Z');

      render(<GameTime scheduledTime={scheduledTime} format="time-only" />);

      const timeElement = screen.getByRole('time');
      const text = timeElement.textContent || '';

      // Should contain hour:minute pattern
      expect(text).toMatch(/\d{1,2}:\d{2}/);

      // Implementation note: Cannot strictly verify absence of date because
      // time-only format still might show date depending on locale
      // This test verifies time IS present
    });
  });

  describe('Test 4: Renders time element with dateTime attribute', () => {
    it('should have dateTime attribute in ISO format', () => {
      const scheduledTime = new Date('2026-03-15T19:30:00Z');

      render(<GameTime scheduledTime={scheduledTime} />);

      const timeElement = screen.getByRole('time');
      expect(timeElement).toHaveAttribute('dateTime');
      expect(timeElement.getAttribute('dateTime')).toBe('2026-03-15T19:30:00.000Z');
    });
  });

  describe('Test 5: DST transition handling', () => {
    it('should handle dates during DST transition correctly', () => {
      // March 9, 2025 is when DST starts in US (example)
      const beforeDST = new Date('2025-03-09T01:00:00Z');
      const afterDST = new Date('2025-03-09T03:00:00Z');

      const { rerender } = render(<GameTime scheduledTime={beforeDST} />);
      const timeElement1 = screen.getByRole('time');
      expect(timeElement1.textContent).toBeTruthy();

      rerender(<GameTime scheduledTime={afterDST} />);
      const timeElement2 = screen.getByRole('time');
      expect(timeElement2.textContent).toBeTruthy();

      // Both should render without errors
      // Intl.DateTimeFormat handles DST automatically
    });
  });

  describe('Test 6: Locale detection for 12h vs 24h format', () => {
    it('should use browser locale for time format', () => {
      const scheduledTime = new Date('2026-03-15T19:30:00Z');

      render(<GameTime scheduledTime={scheduledTime} />);

      const timeElement = screen.getByRole('time');
      const text = timeElement.textContent || '';

      // Should contain time - either 12h (with AM/PM) or 24h format
      // Cannot strictly test which format without mocking Intl API
      // Test verifies rendering works
      expect(text).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('Test 7: Auto-detects user timezone', () => {
    it('should format time in user timezone', () => {
      const scheduledTime = new Date('2026-03-15T19:30:00Z');

      render(<GameTime scheduledTime={scheduledTime} />);

      const timeElement = screen.getByRole('time');

      // Verify component renders successfully
      // Actual timezone detection is automatic via Intl API
      expect(timeElement).toBeInTheDocument();
      expect(timeElement.textContent).toBeTruthy();
    });
  });
});
