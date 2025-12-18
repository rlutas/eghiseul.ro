/**
 * Simple in-memory rate limiter for API endpoints
 * For production, consider using Redis or Upstash for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (cleared on server restart)
const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;       // Milliseconds until reset
}

/**
 * Check if request is allowed under rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let entry = store.get(key);

  // If no entry or expired, create new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  // Increment count
  entry.count++;

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for real IP (behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Vercel specific
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    return vercelIP.split(',')[0].trim();
  }

  // Fallback
  return 'unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // OCR endpoint - more restrictive for guests
  ocr: {
    guest: { windowMs: 60 * 1000, maxRequests: 10 },      // 10 per minute
    authenticated: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute
  },
  // KYC validation
  kyc: {
    guest: { windowMs: 60 * 1000, maxRequests: 5 },
    authenticated: { windowMs: 60 * 1000, maxRequests: 20 },
  },
  // Order creation
  orders: {
    guest: { windowMs: 60 * 1000, maxRequests: 3 },
    authenticated: { windowMs: 60 * 1000, maxRequests: 10 },
  },
} as const;
