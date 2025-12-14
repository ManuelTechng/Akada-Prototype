/**
 * Rate Limiter Utility
 *
 * Provides client-side rate limiting to prevent brute force attacks
 * on authentication endpoints (signIn, signUp, resetPassword).
 *
 * SECURITY: This is a client-side defense-in-depth measure.
 * Server-side rate limiting is still required for production security.
 */

import { logger } from './logger';

interface RateLimitConfig {
  maxAttempts: number;      // Maximum attempts allowed in the time window
  windowMs: number;         // Time window in milliseconds
  keyPrefix: string;        // Prefix for storage keys (e.g., 'auth', 'login')
}

interface AttemptRecord {
  count: number;            // Number of attempts
  firstAttempt: number;     // Timestamp of first attempt in current window
  blockedUntil?: number;    // Timestamp when block expires
}

/**
 * In-memory rate limiter
 * Uses Map for storage - resets on page reload
 */
export class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private config: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.startCleanup();
  }

  /**
   * Generate storage key for identifier
   */
  private getKey(identifier: string): string {
    return `${this.config.keyPrefix}:${identifier}`;
  }

  /**
   * Check if an attempt is allowed for the given identifier
   * @param identifier - User identifier (email, IP, etc.)
   * @returns true if attempt is allowed, false if rate limited
   */
  async check(identifier: string): Promise<boolean> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const record = this.attempts.get(key);

    // If blocked, check if block has expired
    if (record?.blockedUntil) {
      if (now < record.blockedUntil) {
        const remainingMs = record.blockedUntil - now;
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        logger.warn(`Rate limit active for ${identifier}. ${remainingMinutes} minutes remaining.`);
        return false;
      } else {
        // Block expired, reset record
        this.attempts.delete(key);
        return true;
      }
    }

    // No record or window expired
    if (!record || now - record.firstAttempt > this.config.windowMs) {
      return true;
    }

    // Within window, check attempt count
    if (record.count >= this.config.maxAttempts) {
      // Block the identifier
      const blockedUntil = now + this.config.windowMs;
      record.blockedUntil = blockedUntil;
      this.attempts.set(key, record);

      const blockedMinutes = Math.ceil(this.config.windowMs / 60000);
      logger.warn(`Rate limit exceeded for ${identifier}. Blocked for ${blockedMinutes} minutes.`);
      return false;
    }

    return true;
  }

  /**
   * Increment attempt counter for identifier
   * @param identifier - User identifier (email, IP, etc.)
   */
  async increment(identifier: string): Promise<void> {
    const key = this.getKey(identifier);
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now - record.firstAttempt > this.config.windowMs) {
      // New window
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now
      });
      logger.debug(`Rate limiter: First attempt for ${identifier} in new window`);
    } else {
      // Increment existing window
      record.count += 1;
      this.attempts.set(key, record);
      logger.debug(`Rate limiter: Attempt ${record.count}/${this.config.maxAttempts} for ${identifier}`);
    }
  }

  /**
   * Reset rate limit for identifier (e.g., after successful login)
   * @param identifier - User identifier (email, IP, etc.)
   */
  async reset(identifier: string): Promise<void> {
    const key = this.getKey(identifier);
    this.attempts.delete(key);
    logger.debug(`Rate limiter: Reset for ${identifier}`);
  }

  /**
   * Get remaining attempts for identifier
   * @param identifier - User identifier (email, IP, etc.)
   * @returns Number of remaining attempts, or null if blocked
   */
  getRemainingAttempts(identifier: string): number | null {
    const key = this.getKey(identifier);
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return this.config.maxAttempts;
    }

    if (record.blockedUntil && now < record.blockedUntil) {
      return null; // Blocked
    }

    if (now - record.firstAttempt > this.config.windowMs) {
      return this.config.maxAttempts; // Window expired
    }

    return Math.max(0, this.config.maxAttempts - record.count);
  }

  /**
   * Get time until block expires (in milliseconds)
   * @param identifier - User identifier (email, IP, etc.)
   * @returns Milliseconds until unblocked, or 0 if not blocked
   */
  getBlockedTimeRemaining(identifier: string): number {
    const key = this.getKey(identifier);
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record?.blockedUntil || now >= record.blockedUntil) {
      return 0;
    }

    return record.blockedUntil - now;
  }

  /**
   * Cleanup expired records periodically
   */
  private startCleanup(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, record] of this.attempts.entries()) {
        // Remove if:
        // 1. Window expired and not blocked
        // 2. Block expired
        const windowExpired = now - record.firstAttempt > this.config.windowMs;
        const blockExpired = record.blockedUntil && now >= record.blockedUntil;

        if ((windowExpired && !record.blockedUntil) || blockExpired) {
          this.attempts.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.debug(`Rate limiter cleanup: Removed ${cleanedCount} expired records`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop cleanup interval (call on unmount/cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.attempts.clear();
  }

  /**
   * Get current state (for debugging)
   */
  getState(): { totalRecords: number; blocked: number; active: number } {
    const now = Date.now();
    let blocked = 0;
    let active = 0;

    for (const record of this.attempts.values()) {
      if (record.blockedUntil && now < record.blockedUntil) {
        blocked++;
      } else if (now - record.firstAttempt <= this.config.windowMs) {
        active++;
      }
    }

    return {
      totalRecords: this.attempts.size,
      blocked,
      active
    };
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Auth operations (login, signup, password reset)
// 5 attempts per 15 minutes
export const authRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'auth'
});

// Profile updates
// 10 attempts per 5 minutes
export const profileRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 5 * 60 * 1000,
  keyPrefix: 'profile'
});

// API requests (general)
// 30 attempts per minute
export const apiRateLimiter = new RateLimiter({
  maxAttempts: 30,
  windowMs: 60 * 1000,
  keyPrefix: 'api'
});

// Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    authRateLimiter.destroy();
    profileRateLimiter.destroy();
    apiRateLimiter.destroy();
  });
}

export default RateLimiter;
