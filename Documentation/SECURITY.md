# Security Implementation Guide

## Overview

This document describes the security measures implemented in HiQueue to protect against common web vulnerabilities and attacks.

## Table of Contents

1. [Rate Limiting](#rate-limiting)
2. [Input Validation & Sanitization](#input-validation--sanitization)
3. [Security Headers](#security-headers)
4. [Authentication & Authorization](#authentication--authorization)
5. [CSRF Protection](#csrf-protection)
6. [SQL Injection Prevention](#sql-injection-prevention)
7. [XSS Protection](#xss-protection)
8. [API Security](#api-security)
9. [Monitoring & Logging](#monitoring--logging)
10. [Best Practices](#best-practices)

---

## Rate Limiting

### Implementation

**File:** `src/server/lib/rate-limit.ts`

Uses in-memory sliding window algorithm for rate limiting. In production, consider using Redis for distributed rate limiting.

### Rate Limit Presets

| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| **Login** | 5 requests | 5 minutes | Prevent brute force attacks |
| **Signup** | 3 requests | 1 hour | Prevent spam registrations |
| **Password Reset** | 3 requests | 1 hour | Prevent email flooding |
| **API (Strict)** | 10 requests | 1 minute | Sensitive operations |
| **API (Moderate)** | 30 requests | 1 minute | Standard API calls |
| **API (Relaxed)** | 60 requests | 1 minute | Read-heavy operations |
| **Create Queue** | 5 requests | 1 hour | Prevent resource abuse |
| **Create Member** | 10 requests | 1 hour | Prevent spam invites |
| **Create Ticket** | 100 requests | 1 hour | Allow high traffic queues |
| **Public Ticket** | 30 requests | 1 hour | Public kiosk protection |

### Usage Example

```typescript
import { checkRateLimit, RATE_LIMITS } from '@/server/lib/rate-limit'

const result = checkRateLimit('user-id-or-ip', RATE_LIMITS.LOGIN)

if (!result.success) {
  return fail(`Too many requests. Try again in ${result.retryAfter} seconds.`)
}
```

### Response Headers

Rate-limited responses include:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds until retry allowed (on 429 only)

### IP Address Detection

Supports common reverse proxy headers:
- `X-Forwarded-For`
- `X-Real-IP`
- `CF-Connecting-IP` (Cloudflare)

---

## Input Validation & Sanitization

### Implementation

**File:** `src/server/lib/sanitize.ts`

All user input is validated and sanitized before processing.

### Sanitization Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `sanitizeString()` | Remove dangerous characters | Names, descriptions |
| `sanitizeEmail()` | Validate and normalize emails | User emails |
| `sanitizeSlug()` | Create URL-safe slugs | Organization slugs |
| `sanitizePrefix()` | Alphanumeric prefixes | Ticket codes |
| `sanitizeNumber()` | Validate numeric input | Durations, counts |
| `sanitizeUrl()` | Validate URLs | External links |
| `stripHtml()` | Remove HTML tags | User-generated content |

### Password Validation

```typescript
import { validatePasswordStrength, isCommonPassword } from '@/server/lib/sanitize'

const strength = validatePasswordStrength(password, {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
})

if (!strength.isValid) {
  console.log(strength.errors) // Array of error messages
}

if (isCommonPassword(password)) {
  // Reject common passwords like "password123"
}
```

### Validator Integration

Zod validators automatically sanitize input:

```typescript
// src/server/validators/member.validator.ts
const sanitizedString = (maxLength: number = 1000) =>
  z.string().transform(val => sanitizeString(val, maxLength))

const createMemberSchema = z.object({
  name: sanitizedString(50).pipe(
    z.string().min(2).max(50)
  ),
  email: sanitizedEmail.pipe(
    z.string().email()
  ),
  password: securePassword,
})
```

### Attack Detection

```typescript
import { containsSqlInjection, containsXss } from '@/server/lib/sanitize'

if (containsSqlInjection(input)) {
  logSecurityEvent({ type: 'sql_injection_attempt', ... })
  return fail('Invalid input')
}

if (containsXss(input)) {
  logSecurityEvent({ type: 'xss_attempt', ... })
  return fail('Invalid input')
}
```

---

## Security Headers

### Implementation

**File:** `src/server/lib/security-headers.ts`
**Middleware:** `src/middleware.ts`

### Headers Applied

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enable XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Content-Security-Policy` | (see below) | Prevent XSS, injection |
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS |
| `Permissions-Policy` | (restrictive) | Disable unused features |

### Content Security Policy (CSP)

Production CSP configuration:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests;
```

### HSTS (HTTP Strict Transport Security)

Enabled in production:
- Max age: 1 year (31536000 seconds)
- Include subdomains: Yes
- Preload: Optional

---

## Authentication & Authorization

### Session Management

- **Provider:** NextAuth.js v5
- **Strategy:** JWT with secure cookies
- **Adapter:** Prisma (database sessions)

### Password Security

- **Hashing:** bcrypt with salt rounds
- **Minimum length:** 8 characters
- **Requirements:**
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Common passwords:** Rejected (see `COMMON_PASSWORDS` list)

### Access Control Layers

1. **Workspace Owner Check**
   - Self-registered users (workspace owners)
   - Created users (staff members)
   - Redirect staff to organization portal

2. **Organization Membership**
   - Verify user belongs to organization
   - Redirect to user's own dashboard if not a member

3. **Role-Based Permissions**
   - Owner: Full control
   - Admin: Operations management
   - Staff: Limited to assigned counters

### Permission Helpers

```typescript
import { hasOrganizationRole } from '@/server/lib/permissions'

const isOwner = await hasOrganizationRole(userId, orgId, ['owner'])
const canManage = await hasOrganizationRole(userId, orgId, ['owner', 'admin'])
```

---

## CSRF Protection

### NextAuth CSRF Tokens

NextAuth automatically includes CSRF protection for authentication flows.

### Form Protection

All server actions include CSRF tokens via Next.js form actions:

```typescript
<form action={serverAction}>
  {/* CSRF token automatically included */}
  <button type="submit">Submit</button>
</form>
```

### API Route Protection

For custom API routes, use the `withApiHandler` wrapper:

```typescript
import { withApiHandler } from '@/server/lib/api-handler'

export const POST = withApiHandler(async (request, context) => {
  // Handler logic
}, {
  requireAuth: true,
  rateLimit: RATE_LIMITS.API_MODERATE,
})
```

---

## SQL Injection Prevention

### Parameterized Queries

**Always use Prisma ORM** - all queries are parameterized:

```typescript
// ✅ SAFE - Prisma parameterizes automatically
const user = await db.user.findUnique({
  where: { email: userInput }
})

// ❌ NEVER DO THIS - Raw SQL with user input
await db.$executeRaw`SELECT * FROM users WHERE email = '${userInput}'`

// ✅ SAFE - Use parameterized raw queries if needed
await db.$executeRaw`SELECT * FROM users WHERE email = ${userInput}`
```

### Input Validation

```typescript
import { containsSqlInjection } from '@/server/lib/sanitize'

if (containsSqlInjection(input)) {
  logSecurityEvent({
    type: 'sql_injection_attempt',
    ip: clientIp,
    details: { input }
  })
  return fail('Invalid input detected')
}
```

---

## XSS Protection

### Output Encoding

React automatically escapes output:

```typescript
// ✅ SAFE - React escapes by default
<div>{userInput}</div>

// ❌ DANGEROUS - Bypasses React escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Content Security Policy

CSP headers prevent inline script execution and restrict script sources.

### Input Sanitization

```typescript
import { stripHtml, containsXss } from '@/server/lib/sanitize'

// Remove all HTML tags
const cleanInput = stripHtml(userInput)

// Detect XSS attempts
if (containsXss(input)) {
  logSecurityEvent({ type: 'xss_attempt', ... })
  return fail('Invalid input')
}
```

---

## API Security

### API Handler Wrapper

**File:** `src/server/lib/api-handler.ts`

Provides built-in security for API routes:

```typescript
import { withApiHandler, successResponse } from '@/server/lib/api-handler'
import { RATE_LIMITS } from '@/server/lib/rate-limit'

export const POST = withApiHandler(async (request, context) => {
  const { user, ip } = context
  
  // Handler logic
  const data = await processRequest()
  
  return successResponse(data, 'Operation completed')
}, {
  requireAuth: true,
  rateLimit: RATE_LIMITS.API_MODERATE,
  allowedMethods: ['POST'],
})
```

### CORS Configuration

For public APIs that need CORS:

```typescript
import { getCORSHeaders } from '@/server/lib/security-headers'

const corsHeaders = getCORSHeaders(request.headers.get('origin'), {
  allowedOrigins: ['https://example.com'],
  allowedMethods: ['GET', 'POST'],
  allowCredentials: true,
})
```

---

## Monitoring & Logging

### Security Event Logging

**File:** `src/server/lib/security-headers.ts`

```typescript
import { logSecurityEvent } from '@/server/lib/security-headers'

logSecurityEvent({
  timestamp: new Date(),
  type: 'rate_limit', // or 'suspicious_input', 'auth_failure', etc.
  userId: user?.id,
  ip: clientIp,
  userAgent: request.headers.get('user-agent'),
  details: {
    path: request.url,
    action: 'attempted_action',
  },
})
```

### Event Types

- `rate_limit` - Rate limit exceeded
- `suspicious_input` - SQL injection or XSS detected
- `auth_failure` - Failed authentication attempt
- `access_denied` - Unauthorized access attempt
- `sql_injection_attempt` - SQL injection pattern detected
- `xss_attempt` - XSS pattern detected

### Production Logging

In production, integrate with monitoring services:
- Sentry (error tracking)
- DataDog (application monitoring)
- CloudWatch (AWS)
- LogRocket (session replay)

---

## Best Practices

### Development Workflow

1. **Never trust user input** - Always validate and sanitize
2. **Use Prisma ORM** - Prevents SQL injection
3. **Let React handle escaping** - Avoid `dangerouslySetInnerHTML`
4. **Apply rate limiting** - Especially for auth and creation endpoints
5. **Log security events** - Monitor for attacks
6. **Keep dependencies updated** - Run `npm audit` regularly

### Code Review Checklist

- [ ] All user input is validated with Zod schemas
- [ ] Input is sanitized before processing
- [ ] Rate limiting is applied to endpoint
- [ ] Authentication is checked for protected routes
- [ ] Authorization verifies user permissions
- [ ] Prisma is used for all database queries
- [ ] No raw SQL with user input
- [ ] Security headers are applied
- [ ] CSRF protection is in place
- [ ] Error messages don't leak sensitive info

### Testing Security

```bash
# Run security audit
npm audit

# Check for vulnerable dependencies
npm audit fix

# Run tests
npm test
```

### Deployment Checklist

- [ ] `NODE_ENV=production` is set
- [ ] HTTPS is enabled (Let's Encrypt, Cloudflare)
- [ ] Security headers are enabled
- [ ] Rate limiting is active
- [ ] Logging is configured
- [ ] Backup strategy is in place
- [ ] Monitoring alerts are set up
- [ ] API keys are in environment variables
- [ ] Database credentials are secured
- [ ] CORS is properly configured

---

## Security Contacts

### Reporting Vulnerabilities

To report a security vulnerability:
1. **Do not** open a public GitHub issue
2. Email security contact (configure in production)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Security Updates

- Subscribe to GitHub Security Advisories
- Monitor NextAuth.js security releases
- Follow Prisma security announcements
- Review OWASP Top 10 annually

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/advanced-type-safety/operating-against-partial-structures-of-model-types)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-06-02 | Initial security implementation | System |

