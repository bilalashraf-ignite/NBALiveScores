import { useState, useEffect } from 'react';

/**
 * Hook to detect network connection type for adaptive behavior.
 * Uses Network Information API (Chrome, Edge, Samsung Internet only as of 2026).
 * Gracefully degrades to '4g' assumption on unsupported browsers.
 *
 * Browser support: ~70% global coverage (Chrome/Edge dominant on mobile)
 * Unsupported browsers (Safari, Firefox) default to '4g' for fast connection assumption
 *
 * Returns: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
 *
 * @example
 * ```tsx
 * const { effectiveType, isSupported } = useNetworkType();
 * // effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
 * // isSupported: whether Network Information API is available
 * ```
 */
export function useNetworkType() {
  const [effectiveType, setEffectiveType] = useState<string>('4g');
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Type assertion for Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (!connection) {
      // Unsupported browser (Safari, Firefox)
      setIsSupported(false);
      setEffectiveType('4g'); // Assume fast connection
      return;
    }

    setIsSupported(true);

    const updateType = () => {
      setEffectiveType(connection.effectiveType || '4g');
    };

    // Set initial value
    updateType();

    // Listen for changes (WiFi ↔ cellular transitions)
    connection.addEventListener('change', updateType);

    return () => {
      connection.removeEventListener('change', updateType);
    };
  }, []);

  return { effectiveType, isSupported };
}
