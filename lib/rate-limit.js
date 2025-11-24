// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

const rateLimitStore = new Map();

/**
 * Simple rate limiter
 * @param {string} identifier - Unique identifier (IP, email, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{allowed: boolean, remaining: number, resetTime: number}}
 */
export function rateLimit(
  identifier,
  maxRequests = 5,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now();
  const key = identifier.toLowerCase();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  // Clean up old entries periodically (every 5 minutes)
  if (Math.random() < 0.01) {
    // 1% chance to clean up on each request
    const cutoff = now - windowMs;
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < cutoff) {
        rateLimitStore.delete(k);
      }
    }
  }

  const remaining = Math.max(0, maxRequests - entry.count);
  const allowed = entry.count <= maxRequests;

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request
 * @param {Request} request - Next.js request object
 * @returns {string}
 */
export function getClientIP(request) {
  // Try various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier
  return "unknown";
}
