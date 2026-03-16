/**
 * Error fallback component for displaying user-friendly error messages.
 * Used with ErrorBoundary to catch and display errors gracefully.
 *
 * Design: Red-themed alert with clear error message and retry action (UX-03).
 * Pattern source: RESEARCH.md Pattern 4, OneUptime error boundaries guide.
 */

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <div className="mb-4 text-4xl">⚠️</div>
      <h2 className="mb-2 text-lg font-semibold text-red-800">Unable to load games</h2>
      <p className="mb-4 text-sm text-red-600">
        {errorMessage}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Try Again
      </button>
    </div>
  );
}
