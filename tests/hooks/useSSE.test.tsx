/**
 * Tests for useSSE hook.
 *
 * Verifies:
 * - Connection lifecycle (open, receive data, close on unmount)
 * - Error handling
 * - Reconnect functionality
 * - Cleanup prevents memory leaks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useSSE } from '@/hooks/useSSE';

// Mock EventSource
class MockEventSource {
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState: number = 0;

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url: string) {
    this.url = url;
    this.readyState = MockEventSource.CONNECTING;

    // Simulate connection opening
    setTimeout(() => {
      this.readyState = MockEventSource.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  // Helper for tests to simulate receiving messages
  simulateMessage(data: string) {
    if (this.onmessage) {
      const event = new MessageEvent('message', { data });
      this.onmessage(event);
    }
  }

  // Helper for tests to simulate errors
  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Store instances for test control
let eventSourceInstances: MockEventSource[] = [];

describe('useSSE', () => {
  beforeEach(() => {
    eventSourceInstances = [];

    // Mock global EventSource
    global.EventSource = jest.fn((url: string) => {
      const instance = new MockEventSource(url);
      eventSourceInstances.push(instance);
      return instance as any;
    }) as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    eventSourceInstances = [];
  });

  it('should connect to the SSE endpoint', async () => {
    const { result } = renderHook(() =>
      useSSE({ url: '/api/scores/live' })
    );

    // Initially not connected
    expect(result.current.isConnected).toBe(false);
    expect(result.current.data).toBe(null);

    // Wait for connection to open
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(EventSource).toHaveBeenCalledWith('/api/scores/live?frequency=10000');
  });

  it('should receive and parse SSE messages', async () => {
    const { result } = renderHook(() =>
      useSSE<{ message: string }>({ url: '/api/scores/live' })
    );

    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate receiving a message
    const mockData = { message: 'test data' };
    eventSourceInstances[0].simulateMessage(JSON.stringify(mockData));

    // Wait for data to be updated
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });

  it('should handle JSON parse errors', async () => {
    const { result } = renderHook(() =>
      useSSE({ url: '/api/scores/live' })
    );

    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate receiving invalid JSON
    eventSourceInstances[0].simulateMessage('invalid json');

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toBe('Failed to parse SSE data');
    });
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() =>
      useSSE({ url: '/api/scores/live' })
    );

    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate connection error
    eventSourceInstances[0].simulateError();

    // Wait for error state
    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).not.toBe(null);
      expect(result.current.error?.message).toBe('SSE connection failed');
    });
  });

  it('should close connection on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useSSE({ url: '/api/scores/live' })
    );

    // Wait for connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const eventSource = eventSourceInstances[0];
    expect(eventSource.readyState).toBe(MockEventSource.OPEN);

    // Unmount the hook
    unmount();

    // Verify connection was closed
    expect(eventSource.readyState).toBe(MockEventSource.CLOSED);
  });

  it('should reconnect when reconnect is called', async () => {
    const { result } = renderHook(() =>
      useSSE({ url: '/api/scores/live' })
    );

    // Wait for initial connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const firstInstance = eventSourceInstances[0];

    // Call reconnect
    result.current.reconnect();

    // Wait for new connection
    await waitFor(() => {
      expect(eventSourceInstances.length).toBe(2);
    });

    // Verify old connection was closed
    expect(firstInstance.readyState).toBe(MockEventSource.CLOSED);

    // Verify new connection was created
    expect(EventSource).toHaveBeenCalledTimes(2);
  });

  it('should not connect when enabled is false', () => {
    const { result } = renderHook(() =>
      useSSE({ url: '/api/scores/live', enabled: false })
    );

    expect(result.current.isConnected).toBe(false);
    expect(EventSource).not.toHaveBeenCalled();
  });

  it('should close and reconnect when URL changes', async () => {
    const { result, rerender } = renderHook(
      ({ url }) => useSSE({ url }),
      { initialProps: { url: '/api/scores/live' } }
    );

    // Wait for initial connection
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const firstInstance = eventSourceInstances[0];

    // Change URL
    rerender({ url: '/api/scores/other' });

    // Wait for new connection
    await waitFor(() => {
      expect(eventSourceInstances.length).toBe(2);
    });

    // Verify old connection was closed
    expect(firstInstance.readyState).toBe(MockEventSource.CLOSED);

    // Verify new connection with new URL (includes default frequency)
    expect(EventSource).toHaveBeenCalledWith('/api/scores/other?frequency=10000');
  });

  // TODO (05-04): Add adaptive frequency tests when implementing cellular data optimization
  // describe('Adaptive Frequency', () => {
  //   it('Uses 10s frequency on WiFi/4G', () => {
  //     // Mock navigator.connection with effectiveType: '4g'
  //     // Verify URL includes frequency=10000 parameter
  //   });
  //
  //   it('Uses 20s frequency on 2G/3G', () => {
  //     // Mock navigator.connection with effectiveType: '3g'
  //     // Verify URL includes frequency=20000 parameter
  //   });
  // });
});
