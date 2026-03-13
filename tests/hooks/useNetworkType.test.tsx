import { renderHook } from '@testing-library/react';
import { useNetworkType } from '@/hooks/useNetworkType';

describe('useNetworkType', () => {
  let originalConnection: any;

  beforeEach(() => {
    // Save original connection
    originalConnection = (navigator as any).connection;
  });

  afterEach(() => {
    // Restore original connection
    if (originalConnection !== undefined) {
      (navigator as any).connection = originalConnection;
    } else {
      delete (navigator as any).connection;
    }
  });

  it('Returns default 4g when Network Information API unsupported', () => {
    // Mock unsupported browser
    delete (navigator as any).connection;

    const { result } = renderHook(() => useNetworkType());

    expect(result.current.effectiveType).toBe('4g');
    expect(result.current.isSupported).toBe(false);
  });

  it('Detects network type when API supported', () => {
    // Mock Network Information API
    const mockConnection = {
      effectiveType: '3g',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    (navigator as any).connection = mockConnection;

    const { result } = renderHook(() => useNetworkType());

    expect(result.current.effectiveType).toBe('3g');
    expect(result.current.isSupported).toBe(true);
    expect(mockConnection.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('Cleans up event listener on unmount', () => {
    const mockConnection = {
      effectiveType: '4g',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    (navigator as any).connection = mockConnection;

    const { unmount } = renderHook(() => useNetworkType());
    unmount();

    expect(mockConnection.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('Handles 2g connection type', () => {
    const mockConnection = {
      effectiveType: '2g',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    (navigator as any).connection = mockConnection;

    const { result } = renderHook(() => useNetworkType());

    expect(result.current.effectiveType).toBe('2g');
    expect(result.current.isSupported).toBe(true);
  });

  it('Handles slow-2g connection type', () => {
    const mockConnection = {
      effectiveType: 'slow-2g',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    (navigator as any).connection = mockConnection;

    const { result } = renderHook(() => useNetworkType());

    expect(result.current.effectiveType).toBe('slow-2g');
    expect(result.current.isSupported).toBe(true);
  });
});
