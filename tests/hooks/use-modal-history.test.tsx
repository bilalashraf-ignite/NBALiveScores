/**
 * RED tests for useModalHistory hook
 * These tests MUST fail until the hook is implemented
 */

import { renderHook } from '@testing-library/react';
import { useModalHistory } from '@/hooks/use-modal-history';

describe('useModalHistory hook (RED TEST)', () => {
  let pushStateSpy: jest.SpyInstance;
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    pushStateSpy = jest.spyOn(window.history, 'pushState').mockImplementation();
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should call window.history.pushState when isOpen changes to true', () => {
    // This test will FAIL because useModalHistory hook doesn't exist yet
    const onClose = jest.fn();

    const { rerender } = renderHook(
      ({ isOpen }) => useModalHistory(isOpen, onClose),
      { initialProps: { isOpen: false } }
    );

    // Change isOpen to true
    rerender({ isOpen: true });

    expect(pushStateSpy).toHaveBeenCalledWith({ modal: true }, '');
  });

  it('should add popstate event listener when mounted with isOpen=true', () => {
    // This test will FAIL because useModalHistory hook doesn't exist yet
    const onClose = jest.fn();

    renderHook(() => useModalHistory(true, onClose));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'popstate',
      expect.any(Function)
    );
  });

  it('should call onClose when popstate event fires', () => {
    // This test will FAIL because useModalHistory hook doesn't exist yet
    const onClose = jest.fn();

    renderHook(() => useModalHistory(true, onClose));

    // Find the popstate handler and call it
    const popstateHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'popstate'
    )?.[1];

    expect(popstateHandler).toBeDefined();

    // Simulate popstate event
    if (popstateHandler) {
      popstateHandler(new PopStateEvent('popstate'));
    }

    expect(onClose).toHaveBeenCalled();
  });

  it('should remove event listener on unmount', () => {
    // This test will FAIL because useModalHistory hook doesn't exist yet
    const onClose = jest.fn();

    const { unmount } = renderHook(() => useModalHistory(true, onClose));

    // Clear mocks to isolate unmount behavior
    removeEventListenerSpy.mockClear();

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'popstate',
      expect.any(Function)
    );
  });

  it('should not push state when isOpen=false', () => {
    // This test will FAIL because useModalHistory hook doesn't exist yet
    const onClose = jest.fn();

    renderHook(() => useModalHistory(false, onClose));

    expect(pushStateSpy).not.toHaveBeenCalled();
  });
});
