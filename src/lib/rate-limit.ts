/**
 * Redis-backed Rate Limiting Utility
 *
 * Provides production-ready rate limiting using Redis for distributed state.
 * Falls back to in-memory storage when Redis is unavailable (development/testing).
 *
 * Features:
 * - Sliding window rate limiting
 * - Multiple identifier support (IP, email, user ID)
 * - Automatic cleanup of stale entries
 * - Graceful degradation when Redis is unavailable
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 });
 *   const { allowed, remaining } = await limiter.check(identifier);
 */

import Redis from 'ioredis';
import { cacheLogger } from '@/lib/logger';

let redis: Redis | null = null;

/**
 * Get or create Redis client for rate limiting.
 * Uses same connection as cache if available.
 */
function getRedisClient(): Redis | null {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry, fall back to in-memory
    });

    redis.on('error', (err) => {
      cacheLogger.warn({ err }, 'Rate limit Redis connection error');
    });
  }
  return redis;
}

/**
 * In-memory fallback storage for when Redis is unavailable.
 * Includes automatic cleanup to prevent memory leaks.
 */
interface InMemoryRecord {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, InMemoryRecord>();
const MAX_IN_MEMORY_ENTRIES = 10000;
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function cleanupInMemoryStore(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanup = now;

  for (const [key, record] of inMemoryStore) {
    if (now >= record.resetAt) {
      inMemoryStore.delete(key);
    }
  }

  // Safety cap: if map is too large, clear oldest entries
  if (inMemoryStore.size >= MAX_IN_MEMORY_ENTRIES) {
    const entries = Array.from(inMemoryStore.entries());
    entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
    const toRemove = entries.slice(0, Math.floor(MAX_IN_MEMORY_ENTRIES / 2));
    for (const [key] of toRemove) {
      inMemoryStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Key prefix for namespacing (e.g., 'signup', 'password-reset') */
  keyPrefix: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Time in ms until the window resets */
  resetIn: number;
}

/**
 * Check rate limit using Redis with in-memory fallback.
 */
async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const client = getRedisClient();
  const key = `ratelimit:${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  if (client) {
    try {
      // Use Redis sorted set for sliding window
      // Score = timestamp, member = unique request ID
      const requestId = `${now}:${Math.random().toString(36).slice(2)}`;

      const pipeline = client.pipeline();
      // Remove old entries outside the window
      pipeline.zremrangebyscore(key, 0, windowStart);
      // Add current request
      pipeline.zadd(key, now, requestId);
      // Count requests in window
      pipeline.zcard(key);
      // Set expiry on the key
      pipeline.pexpire(key, config.windowMs);

      const results = await pipeline.exec();

      if (results) {
        const count = results[2]?.[1] as number;
        const allowed = count <= config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - count);

        // If not allowed, remove the request we just added
        if (!allowed) {
          await client.zrem(key, requestId);
        }

        return {
          allowed,
          remaining,
          resetIn: config.windowMs,
        };
      }
    } catch (error) {
      cacheLogger.warn({ err: error }, 'Redis rate limit error, falling back to in-memory');
    }
  }

  // Fall back to in-memory
  return checkRateLimitInMemory(identifier, config);
}

/**
 * In-memory rate limit check (fallback when Redis unavailable).
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `${config.keyPrefix}:${identifier}`;

  // Periodic cleanup
  cleanupInMemoryStore();

  const record = inMemoryStore.get(key);

  if (!record || now >= record.resetAt) {
    // New window
    inMemoryStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetAt - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetIn: record.resetAt - now,
  };
}

/**
 * Create a rate limiter instance with the specified configuration.
 */
export function createRateLimiter(config: RateLimitConfig) {
  return {
    /**
     * Check if a request from the given identifier is allowed.
     * @param identifier - Unique identifier (IP address, email, user ID, etc.)
     */
    check: (identifier: string) => checkRateLimitRedis(identifier, config),

    /**
     * Get the configuration for this limiter.
     */
    getConfig: () => config,
  };
}

/**
 * Pre-configured rate limiters for common use cases.
 */
export const rateLimiters = {
  /** Signup: 5 requests per minute per IP */
  signupIp: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'signup:ip',
  }),

  /** Signup: 3 requests per hour per email */
  signupEmail: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    keyPrefix: 'signup:email',
  }),

  /** Password reset: 5 requests per minute per IP */
  passwordResetIp: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'password-reset:ip',
  }),

  /** Email verification: 10 requests per minute per IP */
  verifyEmailIp: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'verify-email:ip',
  }),

  /** General API: 100 requests per minute per IP */
  apiGeneral: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'api:general',
  }),
};

/**
 * Helper to get client IP from request headers.
 * Handles common proxy headers (x-forwarded-for, x-real-ip).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Clear all in-memory rate limit data.
 * Useful for testing.
 */
export function clearInMemoryRateLimits(): void {
  inMemoryStore.clear();
}

/**
 * Get in-memory store size (for monitoring/debugging).
 */
export function getInMemoryStoreSize(): number {
  return inMemoryStore.size;
}
