/**
 * Input sanitization utilities to prevent XSS, SQL injection, and other attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * while preserving useful characters for names, descriptions, etc.
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    .slice(0, maxLength)
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newline, tab, carriage return
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Sanitize HTML content (strip all HTML tags)
 * Use this for user input that should not contain any HTML
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')   // Decode HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''

  return email
    .trim()
    .toLowerCase()
    .slice(0, 255)
    .replace(/[^\w@.+-]/g, '') // Only allow email-safe characters
}

/**
 * Sanitize organization/queue slug
 * Slugs should only contain lowercase letters, numbers, and hyphens
 */
export function sanitizeSlug(slug: string): string {
  if (typeof slug !== 'string') return ''

  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/--+/g, '-')        // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
    .slice(0, 50)
}

/**
 * Sanitize service prefix (ticket codes)
 * Prefixes should only contain uppercase letters and numbers
 */
export function sanitizePrefix(prefix: string): string {
  if (typeof prefix !== 'string') return ''

  return prefix
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Only allow letters and numbers
    .slice(0, 10)
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: unknown, min?: number, max?: number): number | null {
  const num = Number(input)

  if (isNaN(num) || !isFinite(num)) {
    return null
  }

  if (min !== undefined && num < min) return min
  if (max !== undefined && num > max) return max

  return num
}

/**
 * Sanitize integer input
 */
export function sanitizeInteger(input: unknown, min?: number, max?: number): number | null {
  const num = sanitizeNumber(input, min, max)
  return num !== null ? Math.floor(num) : null
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string, allowedProtocols: string[] = ['http', 'https']): string | null {
  if (typeof url !== 'string') return null

  try {
    const parsed = new URL(url)
    
    if (!allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Validate and sanitize phone number (basic)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return ''

  return phone
    .trim()
    .replace(/[^\d+\-() ]/g, '') // Only allow numbers, +, -, (), space
    .slice(0, 20)
}

/**
 * Check if string contains SQL injection patterns
 * This is a basic check - always use parameterized queries as the primary defense
 */
export function containsSqlInjection(input: string): boolean {
  if (typeof input !== 'string') return false

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
    /(--|\*\/|\/\*)/,
    /('|;|"|\\)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ]

  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Check if string contains XSS patterns
 */
export function containsXss(input: string): boolean {
  if (typeof input !== 'string') return false

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onload, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
  ]

  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * Sanitize object by applying sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizers?: Partial<Record<keyof T, (value: any) => any>>
): T {
  const result = { ...obj }

  for (const key in result) {
    const value = result[key]
    
    if (sanitizers && sanitizers[key]) {
      result[key] = sanitizers[key]!(value)
    } else if (typeof value === 'string') {
      result[key] = sanitizeString(value) as any
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value) as any
    }
  }

  return result
}

/**
 * Validate password strength
 */
export interface PasswordStrength {
  isValid: boolean
  errors: string[]
  score: number // 0-5
}

export function validatePasswordStrength(
  password: string,
  options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {}
): PasswordStrength {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options

  const errors: string[] = []
  let score = 0

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
  } else {
    score++
    if (password.length >= 12) score++
    if (password.length >= 16) score++
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (/[A-Z]/.test(password)) {
    score++
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (/[a-z]/.test(password)) {
    score++
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (/\d/.test(password)) {
    score++
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5),
  }
}

/**
 * Check for common weak passwords
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567', 
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'admin', 'changeme'
])

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase())
}
