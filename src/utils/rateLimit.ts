/**
 * Simple rate limiting utility for API routes
 */

interface RateLimitConfig {
  interval: number; // Time window in ms
  limit: number;    // Maximum requests allowed in the interval
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitData>();

/**
 * Checks if a request should be rate limited
 * @param key The unique key to rate limit on (e.g., IP address or API key)
 * @param config Rate limiting configuration
 * @returns Object with exceeded flag and headers for rate limit info
 */
export function rateLimit(key: string, config: RateLimitConfig = { interval: 60000, limit: 10 }) {
  const now = Date.now();
  const resetTime = now + config.interval;
  
  // Get existing data or create new entry
  const data = rateLimitStore.get(key) || {
    count: 0,
    resetTime
  };
  
  // Reset count if the interval has passed
  if (now > data.resetTime) {
    data.count = 0;
    data.resetTime = resetTime;
  }
  
  // Increment request count
  data.count += 1;
  
  // Update store
  rateLimitStore.set(key, data);
  
  // Calculate remaining requests and time until reset
  const remaining = Math.max(0, config.limit - data.count);
  const reset = Math.ceil((data.resetTime - now) / 1000); // Seconds until reset
  
  return {
    exceeded: data.count > config.limit,
    headers: {
      'X-RateLimit-Limit': config.limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    }
  };
}

/**
 * Middleware for rate limiting
 * @param req Request object
 * @param res Response object
 * @param config Rate limiting configuration
 * @returns Boolean indicating if request is allowed to proceed
 */
export function rateLimitMiddleware(req: Request, config?: RateLimitConfig) {
  // Get IP from headers if available, fallback to a default
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  
  // Apply rate limiting
  const result = rateLimit(ip, config);
  
  return {
    ...result,
    clientIp: ip
  };
} 