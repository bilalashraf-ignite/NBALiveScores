import { useEffect } from 'react';

/**
 * Hook for integrating modal state with browser history.
 * Enables browser back button to close modal instead of navigating away.
 *
 * Pattern from RESEARCH.md Pattern 3 (browser history integration).
 *
 * How it works:
 * 1. When modal opens (isOpen changes to true), push a history state
 * 2. When user clicks back button, popstate event fires
 * 3. popstate listener calls onClose to dismiss modal
 * 4. Cleanup removes event listener on unmount
 *
 * @param isOpen - Current modal open state
 * @param onClose - Callback to close modal
 */
export function useModalHistory(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    // When modal opens, push a history state
    if (isOpen) {
      window.history.pushState({ modal: true }, '');
    }

    // Listen for popstate (back button)
    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup: remove event listener
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);
}
