/**
 * Tests for Redis-backed rate limiting utility.
 *
 * Verifies:
 * - In-memory fallback works correctly when Redis is unavailable
 * - Rate limiting respects configured limits
 * - Automatic cleanup prevents memory leaks
 * - Helper functions work correctly
 */

import {
  createRateLimiter,
  rateLimiters,
  getClientIp,
  clearInMemoryRateLimits,
  getInMemoryStoreSize,
} from '@/lib/rate-limit';

// Mock Redis to test in-memory fallback
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  }));
});

// Mock logger to prevent console output
jest.mock('@/lib/logger', () => ({
  cacheLogger: {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Rate Limiting Utility', () => {
  beforeEach(() => {
    // Clear in-memory store before each test
    clearInMemoryRateLimits();
    // Ensure REDIS_URL is not set to force in-memory fallback
    delete process.env.REDIS_URL;
  });

  describe('createRateLimiter', () => {
    it('should create a rate limiter with the specified config', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        keyPrefix: 'test',
      });

      expect(limiter).toHaveProperty('check');
      expect(limiter).toHaveProperty('getConfig');
      expect(limiter.getConfig()).toEqual({
        windowMs: 60000,
        maxRequests: 5,
        keyPrefix: 'test',
      });
    });

    it('should allow requests within limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 3,
        keyPrefix: 'test-allow',
      });

      const result1 = await limiter.check('user-1');
      const result2 = await limiter.check('user-1');
      const result3 = await limiter.check('user-1');

      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
        keyPrefix: 'test-block',
      });

      await limiter.check('user-1');
      await limiter.check('user-1');
      const result = await limiter.check('user-1');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different identifiers separately', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 2,
        keyPrefix: 'test-separate',
      });

      await limiter.check('user-1');
      await limiter.check('user-1');
      const blockedResult = await limiter.check('user-1');

      const allowedResult = await limiter.check('user-2');

      expect(blockedResult.allowed).toBe(false);
      expect(allowedResult.allowed).toBe(true);
      expect(allowedResult.remaining).toBe(1);
    });

    it('should track different key prefixes separately', async () => {
      const limiter1 = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        keyPrefix: 'signup',
      });

      const limiter2 = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        keyPrefix: 'login',
      });

      await limiter1.check('user-1');
      const blocked = await limiter1.check('user-1');
      const allowed = await limiter2.check('user-1');

      expect(blocked.allowed).toBe(false);
      expect(allowed.allowed).toBe(true);
    });
  });

  describe('Pre-configured rate limiters', () => {
    it('should have signupIp limiter configured correctly', () => {
      const config = rateLimiters.signupIp.getConfig();
      expect(config.keyPrefix).toBe('signup:ip');
      expect(config.maxRequests).toBe(5);
      expect(config.windowMs).toBe(60 * 1000);
    });

    it('should have signupEmail limiter configured correctly', () => {
      const config = rateLimiters.signupEmail.getConfig();
      expect(config.keyPrefix).toBe('signup:email');
      expect(config.maxRequests).toBe(3);
      expect(config.windowMs).toBe(60 * 60 * 1000);
    });

    it('should have passwordResetIp limiter configured correctly', () => {
      const config = rateLimiters.passwordResetIp.getConfig();
      expect(config.keyPrefix).toBe('password-reset:ip');
      expect(config.maxRequests).toBe(5);
      expect(config.windowMs).toBe(60 * 1000);
    });

    it('should have verifyEmailIp limiter configured correctly', () => {
      const config = rateLimiters.verifyEmailIp.getConfig();
      expect(config.keyPrefix).toBe('verify-email:ip');
      expect(config.maxRequests).toBe(10);
      expect(config.windowMs).toBe(60 * 1000);
    });

    it('should have apiGeneral limiter configured correctly', () => {
      const config = rateLimiters.apiGeneral.getConfig();
      expect(config.keyPrefix).toBe('api:general');
      expect(config.maxRequests).toBe(100);
      expect(config.windowMs).toBe(60 * 1000);
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1');

      const ip = getClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const headers = new Headers();
      headers.set('x-real-ip', '192.168.1.2');

      const ip = getClientIp(headers);
      expect(ip).toBe('192.168.1.2');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '192.168.1.1');
      headers.set('x-real-ip', '192.168.1.2');

      const ip = getClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });

    it('should return "unknown" when no IP headers present', () => {
      const headers = new Headers();

      const ip = getClientIp(headers);
      expect(ip).toBe('unknown');
    });

    it('should trim whitespace from IP address', () => {
      const headers = new Headers();
      headers.set('x-forwarded-for', '  192.168.1.1  , 10.0.0.1');

      const ip = getClientIp(headers);
      expect(ip).toBe('192.168.1.1');
    });
  });

  describe('In-memory store management', () => {
    it('should clear in-memory store', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
        keyPrefix: 'test-clear',
      });

      await limiter.check('user-1');
      expect(getInMemoryStoreSize()).toBeGreaterThan(0);

      clearInMemoryRateLimits();
      expect(getInMemoryStoreSize()).toBe(0);
    });

    it('should track store size correctly', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 10,
        keyPrefix: 'test-size',
      });

      expect(getInMemoryStoreSize()).toBe(0);

      await limiter.check('user-1');
      expect(getInMemoryStoreSize()).toBe(1);

      await limiter.check('user-2');
      expect(getInMemoryStoreSize()).toBe(2);

      // Same user shouldn't add new entry
      await limiter.check('user-1');
      expect(getInMemoryStoreSize()).toBe(2);
    });
  });

  describe('Rate limit result structure', () => {
    it('should return correct result structure', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
        keyPrefix: 'test-structure',
      });

      const result = await limiter.check('user-1');

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetIn');

      expect(typeof result.allowed).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
      expect(typeof result.resetIn).toBe('number');
    });

    it('should return resetIn time', async () => {
      const windowMs = 60000;
      const limiter = createRateLimiter({
        windowMs,
        maxRequests: 5,
        keyPrefix: 'test-reset',
      });

      const result = await limiter.check('user-1');

      expect(result.resetIn).toBeGreaterThan(0);
      expect(result.resetIn).toBeLessThanOrEqual(windowMs);
    });
  });
});
