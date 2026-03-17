import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

// Create base logger configuration
const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        // Production: JSON format for log aggregators
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});

// Create child loggers for different modules
export const authLogger = logger.child({ module: 'auth' });
export const profileLogger = logger.child({ module: 'profile' });
export const walletLogger = logger.child({ module: 'wallet' });
export const cacheLogger = logger.child({ module: 'cache' });
export const apiLogger = logger.child({ module: 'api' });
export const adapterLogger = logger.child({ module: 'adapter' });

// Export default logger for general use
export default logger;

// Type-safe logging helpers with context
export type LogContext = Record<string, unknown>;

export function createLogger(module: string) {
  return logger.child({ module });
}
