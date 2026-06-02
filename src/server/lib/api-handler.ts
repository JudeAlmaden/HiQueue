/**
 * API route handler with built-in security, rate limiting, and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, createRateLimitHeaders, RateLimitConfig } from './rate-limit'
import { getSecurityHeaders } from './security-headers'
import { logSecurityEvent } from './security-headers'
import { auth } from '@/auth'

export interface ApiHandlerConfig {
  /** Require authentication */
  requireAuth?: boolean
  /** Required roles for access */
  requiredRoles?: string[]
  /** Rate limit configuration */
  rateLimit?: RateLimitConfig
  /** Allow specific HTTP methods only */
  allowedMethods?: string[]
}

export interface ApiContext {
  /** Authenticated user (if requireAuth is true) */
  user?: {
    id: string
    email?: string | null
    name?: string | null
    isWorkspaceOwner?: boolean
  }
  /** Client IP address */
  ip: string
  /** Request headers */
  headers: Headers
}

export type ApiHandler<T = any> = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse<T>>

/**
 * Wrap an API handler with security middleware
 */
export function withApiHandler<T = any>(
  handler: ApiHandler<T>,
  config: ApiHandlerConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const {
      requireAuth = false,
      requiredRoles = [],
      rateLimit,
      allowedMethods,
    } = config

    try {
      const ip = getClientIp(request.headers)
      const method = request.method

      // Check HTTP method
      if (allowedMethods && !allowedMethods.includes(method)) {
        return NextResponse.json(
          { error: 'Method not allowed' },
          { status: 405, headers: { Allow: allowedMethods.join(', ') } }
        )
      }

      // Apply rate limiting
      if (rateLimit) {
        const rateLimitResult = checkRateLimit(ip, rateLimit)
        
        if (!rateLimitResult.success) {
          logSecurityEvent({
            timestamp: new Date(),
            type: 'rate_limit',
            ip,
            userAgent: request.headers.get('user-agent') || undefined,
            details: {
              path: request.nextUrl.pathname,
              limit: rateLimitResult.limit,
              retryAfter: rateLimitResult.retryAfter,
            },
          })

          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: createRateLimitHeaders(rateLimitResult),
            }
          )
        }
      }

      // Check authentication
      let user: ApiContext['user'] | undefined

      if (requireAuth || requiredRoles.length > 0) {
        const session = await auth()
        
        if (!session?.user?.id) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }

        user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          isWorkspaceOwner: session.user.isWorkspaceOwner,
        }

        // TODO: Check required roles if needed
        // This would require fetching user's role from database
      }

      // Create context
      const context: ApiContext = {
        user,
        ip,
        headers: request.headers,
      }

      // Call handler
      const response = await handler(request, context)

      // Add security headers
      const securityHeaders = getSecurityHeaders({
        enableCSP: process.env.NODE_ENV === 'production',
        enableHSTS: false, // Don't set HSTS for API routes
      })

      Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value && key !== 'Strict-Transport-Security') {
          response.headers.set(key, value)
        }
      })

      // Add rate limit headers if applicable
      if (rateLimit) {
        const rateLimitResult = checkRateLimit(ip, rateLimit)
        const rateLimitHeaders = createRateLimitHeaders(rateLimitResult)
        Object.entries(rateLimitHeaders).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      }

      return response
    } catch (error) {
      console.error('API Handler Error:', error)

      // Don't expose internal errors in production
      const isDev = process.env.NODE_ENV === 'development'
      const errorMessage = isDev && error instanceof Error ? error.message : 'Internal server error'

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  }
}

/**
 * Create a JSON response with proper headers
 */
export function jsonResponse<T = any>(
  data: T,
  init?: ResponseInit
): NextResponse<T> {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...details,
    },
    { status }
  )
}

/**
 * Create a success response
 */
export function successResponse<T = any>(
  data: T,
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    data,
  })
}
