/**
 * Security headers configuration
 * Implements OWASP security best practices
 */

export interface SecurityHeadersConfig {
  /** Enable Content Security Policy */
  enableCSP?: boolean
  /** CSP directives (if enableCSP is true) */
  cspDirectives?: Record<string, string[]>
  /** Enable Strict Transport Security */
  enableHSTS?: boolean
  /** HSTS max age in seconds */
  hstsMaxAge?: number
  /** Include HSTS subdomains */
  hstsIncludeSubdomains?: boolean
  /** Enable HSTS preload */
  hstsPreload?: boolean
}

/**
 * Default CSP directives for Next.js application
 */
export const DEFAULT_CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Next.js in development
    "'unsafe-inline'", // Required for Next.js inline scripts
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
  ],
  'img-src': [
    "'self'",
    'data:', // For base64 images
    'blob:', // For object URLs
    'https:', // Allow images from HTTPS sources
  ],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'"],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': [],
}

/**
 * Generate Content Security Policy header value
 */
export function generateCSP(directives: Record<string, string[]> = DEFAULT_CSP_DIRECTIVES): string {
  return Object.entries(directives)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive
      }
      return `${directive} ${values.join(' ')}`
    })
    .join('; ')
}

/**
 * Get security headers for HTTP response
 */
export function getSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const {
    enableCSP = true,
    cspDirectives = DEFAULT_CSP_DIRECTIVES,
    enableHSTS = true,
    hstsMaxAge = 31536000, // 1 year
    hstsIncludeSubdomains = true,
    hstsPreload = false,
  } = config

  const headers: Record<string, string> = {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS filter in older browsers
    'X-XSS-Protection': '1; mode=block',

    // Control how much referrer information should be included
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Remove X-Powered-By header
    'X-Powered-By': '',

    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disable FLoC
    ].join(', '),
  }

  // Add Content Security Policy
  if (enableCSP) {
    headers['Content-Security-Policy'] = generateCSP(cspDirectives)
  }

  // Add Strict Transport Security (HTTPS only)
  if (enableHSTS) {
    let hstsValue = `max-age=${hstsMaxAge}`
    if (hstsIncludeSubdomains) {
      hstsValue += '; includeSubDomains'
    }
    if (hstsPreload) {
      hstsValue += '; preload'
    }
    headers['Strict-Transport-Security'] = hstsValue
  }

  return headers
}

/**
 * CORS headers configuration
 */
export interface CORSConfig {
  /** Allowed origins (use '*' for all, or array of specific origins) */
  allowedOrigins: string | string[]
  /** Allowed HTTP methods */
  allowedMethods?: string[]
  /** Allowed headers */
  allowedHeaders?: string[]
  /** Exposed headers */
  exposedHeaders?: string[]
  /** Allow credentials (cookies, authorization headers) */
  allowCredentials?: boolean
  /** Max age for preflight requests (in seconds) */
  maxAge?: number
}

/**
 * Get CORS headers for HTTP response
 */
export function getCORSHeaders(
  requestOrigin: string | null,
  config: CORSConfig
): Record<string, string> {
  const {
    allowedOrigins,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    exposedHeaders = [],
    allowCredentials = false,
    maxAge = 86400, // 24 hours
  } = config

  const headers: Record<string, string> = {}

  // Determine if origin is allowed
  let isOriginAllowed = false
  let allowedOrigin = ''

  if (allowedOrigins === '*') {
    isOriginAllowed = true
    allowedOrigin = '*'
  } else if (Array.isArray(allowedOrigins) && requestOrigin) {
    isOriginAllowed = allowedOrigins.includes(requestOrigin)
    allowedOrigin = requestOrigin
  }

  if (isOriginAllowed) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin

    if (allowCredentials && allowedOrigin !== '*') {
      headers['Access-Control-Allow-Credentials'] = 'true'
    }

    headers['Access-Control-Allow-Methods'] = allowedMethods.join(', ')
    headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ')

    if (exposedHeaders.length > 0) {
      headers['Access-Control-Expose-Headers'] = exposedHeaders.join(', ')
    }

    headers['Access-Control-Max-Age'] = maxAge.toString()
  }

  return headers
}

/**
 * Validate request origin against allowed origins
 */
export function isOriginAllowed(
  requestOrigin: string | null,
  allowedOrigins: string | string[]
): boolean {
  if (!requestOrigin) return false
  
  if (allowedOrigins === '*') return true
  
  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(requestOrigin)
  }
  
  return false
}

/**
 * Security audit log entry
 */
export interface SecurityAuditLog {
  timestamp: Date
  type: 'rate_limit' | 'suspicious_input' | 'auth_failure' | 'access_denied' | 'sql_injection_attempt' | 'xss_attempt'
  userId?: string
  ip: string
  userAgent?: string
  details: Record<string, unknown>
}

/**
 * Log security events (in production, send to monitoring service)
 */
export function logSecurityEvent(event: SecurityAuditLog): void {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn('[SECURITY]', event.type, {
      timestamp: event.timestamp.toISOString(),
      userId: event.userId || 'anonymous',
      ip: event.ip,
      ...event.details,
    })
  }

  // In production, send to logging service (e.g., Sentry, DataDog, CloudWatch)
  // Example:
  // await logToMonitoringService(event)
}

/**
 * Check if IP is in blocklist
 * In production, use a real IP blocklist service or database
 */
const IP_BLOCKLIST = new Set<string>([
  // Add known malicious IPs here
])

export function isIpBlocked(ip: string): boolean {
  return IP_BLOCKLIST.has(ip)
}

/**
 * Add IP to blocklist
 */
export function blockIp(ip: string, reason: string): void {
  IP_BLOCKLIST.add(ip)
  logSecurityEvent({
    timestamp: new Date(),
    type: 'access_denied',
    ip,
    details: { reason, action: 'ip_blocked' },
  })
}

/**
 * Remove IP from blocklist
 */
export function unblockIp(ip: string): void {
  IP_BLOCKLIST.delete(ip)
}
