import { renderHook, act } from '@testing-library/react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

describe('useHapticFeedback', () => {
  afterEach(() => {
    // Clean up
    delete (navigator as any).vibrate;
  });

  it('Returns trigger function', () => {
    const { result } = renderHook(() => useHapticFeedback());

    expect(result.current.trigger).toBeDefined();
    expect(typeof result.current.trigger).toBe('function');
  });

  it('Does not crash when vibration API unsupported', () => {
    // Mock unsupported browser
    delete (navigator as any).vibrate;

    const { result } = renderHook(() => useHapticFeedback());

    expect(() => {
      act(() => {
        result.current.trigger('success');
      });
    }).not.toThrow();
  });

  it('Handles nudge pattern without error', () => {
    const mockVibrate = jest.fn(() => true);
    (navigator as any).vibrate = mockVibrate;

    const { result } = renderHook(() => useHapticFeedback());

    // Test that calling trigger doesn't throw
    expect(() => {
      act(() => {
        result.current.trigger('nudge');
      });
    }).not.toThrow();
  });

  it('Handles success pattern without error', () => {
    const mockVibrate = jest.fn(() => true);
    (navigator as any).vibrate = mockVibrate;

    const { result } = renderHook(() => useHapticFeedback());

    expect(() => {
      act(() => {
        result.current.trigger('success');
      });
    }).not.toThrow();
  });

  it('Handles error pattern without error', () => {
    const mockVibrate = jest.fn(() => true);
    (navigator as any).vibrate = mockVibrate;

    const { result } = renderHook(() => useHapticFeedback());

    expect(() => {
      act(() => {
        result.current.trigger('error');
      });
    }).not.toThrow();
  });
});
