/**
 * Redis Cache Wrapper with TTL Strategy
 *
 * Implements aggressive caching (PERF-03) with differentiated TTLs based on data volatility:
 * - Live games: 10s (high volatility)
 * - Scheduled games: 2min (low volatility)
 * - Final games: 15min (immutable)
 * - Team data: 24h (rarely changes)
 *
 * Strategy from ARCHITECTURE.md Pattern 3 - Multi-tier caching reduces origin requests by 90%+
 *
 * Graceful degradation: Cache failures return null and don't break the app (PITFALLS.md Pitfall 2).
 * If REDIS_URL is not set, all operations become no-ops.
 */

import Redis from 'ioredis'

let redis: Redis | null = null

/**
 * Lazy initialization of Redis client.
 * Returns null if REDIS_URL environment variable is not set.
 */
function getRedisClient() {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL)

    // Handle connection errors gracefully (don't crash on Redis unavailable)
    redis.on('error', (err) => {
      console.warn('Redis connection error (cache disabled):', err.message)
    })

    redis.on('connect', () => {
      console.log('Redis cache connected')
    })
  }
  return redis
}

/**
 * TTL strategy based on data volatility
 * Values in seconds
 */
export const CACHE_TTL = {
  LIVE_GAME: 10,        // 10 seconds for live game scores - high update frequency
  SCHEDULED_GAME: 120,  // 2 minutes for scheduled games - rarely change
  FINAL_GAME: 900,      // 15 minutes for final scores - immutable but may get updates
  TEAM_DATA: 86400,     // 24 hours for team info - rarely changes
} as const

export const cache = {
  /**
   * Get a value from cache
   * @returns Parsed value or null if not found/error
   * Graceful degradation: Returns null on error (doesn't throw)
   */
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient()
    if (!client) return null

    try {
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null  // Graceful degradation per PITFALLS.md Pitfall 2
    }
  },

  /**
   * Set a value in cache with TTL
   * @param key Cache key
   * @param value Value to cache (will be JSON stringified)
   * @param ttlSeconds Time to live in seconds
   * Graceful degradation: Errors are logged but not thrown
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
      await client.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
      // Don't throw - cache failures should not break app
    }
  },

  /**
   * Delete a value from cache
   * Graceful degradation: Errors are logged but not thrown
   */
  async del(key: string): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
      await client.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  },

  /**
   * Cache key helpers - Ensures consistent key naming across the application
   */
  keys: {
    liveGames: (league: string) => `games:live:${league}`,
    game: (id: string) => `game:${id}`,
    scheduledGames: (league: string, date: string) => `games:scheduled:${league}:${date}`,
    team: (id: string) => `team:${id}`,
  },
}
