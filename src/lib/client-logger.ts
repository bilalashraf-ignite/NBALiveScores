/**
 * Client-side logger for browser environments.
 *
 * Provides a consistent logging interface that mirrors pino's API
 * but uses console methods under the hood. Structured logging with
 * context objects for better debugging.
 *
 * Note: For production, this can be extended to send logs to a
 * monitoring service like Sentry or Datadog RUM.
 */

type LogContext = Record<string, unknown>;

interface ClientLogger {
  debug: (context: LogContext | string, message?: string) => void;
  info: (context: LogContext | string, message?: string) => void;
  warn: (context: LogContext | string, message?: string) => void;
  error: (context: LogContext | string, message?: string) => void;
  child: (defaultContext: LogContext) => ClientLogger;
}

const isDevelopment = process.env.NODE_ENV === 'development';

function formatMessage(module: string, context: LogContext | string, message?: string): [string, LogContext?] {
  if (typeof context === 'string') {
    return [`[${module}] ${context}`];
  }
  return [`[${module}] ${message || ''}`, context];
}

function createClientLogger(module: string): ClientLogger {
  return {
    debug: (context, message) => {
      if (isDevelopment) {
        const [msg, ctx] = formatMessage(module, context, message);
        if (ctx) {
          console.debug(msg, ctx);
        } else {
          console.debug(msg);
        }
      }
    },
    info: (context, message) => {
      if (isDevelopment) {
        const [msg, ctx] = formatMessage(module, context, message);
        if (ctx) {
          console.info(msg, ctx);
        } else {
          console.info(msg);
        }
      }
    },
    warn: (context, message) => {
      const [msg, ctx] = formatMessage(module, context, message);
      if (ctx) {
        console.warn(msg, ctx);
      } else {
        console.warn(msg);
      }
    },
    error: (context, message) => {
      const [msg, ctx] = formatMessage(module, context, message);
      if (ctx) {
        console.error(msg, ctx);
      } else {
        console.error(msg);
      }
    },
    child: (defaultContext: LogContext) => {
      const childModule = defaultContext.module
        ? `${module}:${defaultContext.module}`
        : module;
      return createClientLogger(childModule);
    },
  };
}

// Pre-configured client loggers for different modules
export const sseLogger = createClientLogger('sse');
export const uiLogger = createClientLogger('ui');

export default createClientLogger;
