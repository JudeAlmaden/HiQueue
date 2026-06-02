/**
 * Rate limiting utilities using in-memory store with sliding window algorithm.
 * For production, consider using Redis or a database-backed solution.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
  requests: number[]
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Optional custom identifier (defaults to IP) */
  identifier?: string
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * Check if a request should be rate limited using sliding window algorithm.
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `${identifier}:${config.maxRequests}:${config.windowSeconds}`

  // Get or create entry
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + windowMs,
      requests: []
    }
    rateLimitStore.set(key, entry)
  }

  // Remove requests outside the sliding window
  entry.requests = entry.requests.filter(timestamp => timestamp > now - windowMs)

  // Check if limit exceeded
  if (entry.requests.length >= config.maxRequests) {
    const oldestRequest = entry.requests[0]
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000)

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: Math.ceil((oldestRequest + windowMs) / 1000),
      retryAfter
    }
  }

  // Add current request
  entry.requests.push(now)
  entry.count++

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.requests.length,
    reset: Math.ceil(entry.resetTime / 1000)
  }
}

/**
 * Rate limit presets for different types of operations
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { maxRequests: 5, windowSeconds: 60 * 5 }, // 5 attempts per 5 minutes
  SIGNUP: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 signups per hour
  PASSWORD_RESET: { maxRequests: 3, windowSeconds: 60 * 60 }, // 3 resets per hour

  // API endpoints
  API_STRICT: { maxRequests: 10, windowSeconds: 60 }, // 10 requests per minute
  API_MODERATE: { maxRequests: 30, windowSeconds: 60 }, // 30 requests per minute
  API_RELAXED: { maxRequests: 60, windowSeconds: 60 }, // 60 requests per minute

  // Creation endpoints (prevent spam)
  CREATE_QUEUE: { maxRequests: 5, windowSeconds: 60 * 60 }, // 5 per hour
  CREATE_MEMBER: { maxRequests: 10, windowSeconds: 60 * 60 }, // 10 per hour
  CREATE_TICKET: { maxRequests: 100, windowSeconds: 60 * 60 }, // 100 per hour
  CREATE_SERVICE: { maxRequests: 20, windowSeconds: 60 * 60 }, // 20 per hour

  // Deletion endpoints
  DELETE_OPERATIONS: { maxRequests: 20, windowSeconds: 60 }, // 20 per minute

  // Public endpoints (more restrictive)
  PUBLIC_TICKET_CREATE: { maxRequests: 30, windowSeconds: 60 * 60 }, // 30 tickets per hour
  PUBLIC_API: { maxRequests: 20, windowSeconds: 60 }, // 20 requests per minute
} as const

/**
 * Get client IP address from request headers
 * Works with common reverse proxies (Nginx, Cloudflare, etc.)
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * Create rate limit headers for HTTP response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = result.retryAfter.toString()
  }

  return headers
}

/**
 * Clear rate limit for a specific identifier (useful for testing or admin overrides)
 */
export function clearRateLimit(identifier: string, config: RateLimitConfig): void {
  const key = `${identifier}:${config.maxRequests}:${config.windowSeconds}`
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `${identifier}:${config.maxRequests}:${config.windowSeconds}`

  const entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Math.ceil((now + windowMs) / 1000)
    }
  }

  const validRequests = entry.requests.filter(timestamp => timestamp > now - windowMs)
  
  return {
    success: validRequests.length < config.maxRequests,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - validRequests.length),
    reset: Math.ceil(entry.resetTime / 1000)
  }
}
