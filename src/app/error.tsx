'use client'; // Required for error boundaries in Next.js App Router

import { ErrorFallback } from '@/components/error-fallback';

/**
 * App-level error boundary for the home page.
 * Catches errors in page.tsx and child components per Next.js App Router conventions.
 *
 * Pattern source: Next.js App Router error handling conventions.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}
