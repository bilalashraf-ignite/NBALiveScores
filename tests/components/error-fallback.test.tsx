import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from '@/components/error-fallback';

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test 1: ErrorFallback renders error message and retry button', () => {
    it('should display error message from error object', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockReset} />);

      expect(screen.getByText(/unable to load games/i)).toBeInTheDocument();
      expect(screen.getByText(/test error message/i)).toBeInTheDocument();
    });

    it('should display fallback message when error has no message', () => {
      const emptyError = new Error();
      render(<ErrorFallback error={emptyError} resetErrorBoundary={mockReset} />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should display Try Again button', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockReset} />);

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should display warning icon', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockReset} />);

      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('Test 2: ErrorFallback calls resetErrorBoundary when button clicked', () => {
    it('should call resetErrorBoundary callback when Try Again clicked', () => {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockReset} />);

      const button = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(button);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });
  });
});
