/**
 * Rate limiting utility for API routes
 * Based on the concept from Vercel's API Routes examples
 */

interface RateLimitOptions {
  interval: number;       // Time window in milliseconds
  max: number;            // Maximum requests per window
  uniqueTokenPerInterval?: number; // Max unique tokens to track
}

interface RateLimitStatus {
  limit: number;         // Maximum allowed requests
  remaining: number;     // Remaining requests in current window
  reset: number;         // Time when the current window resets (Unix timestamp)
}

// In-memory store for rate limiting
const tokenCache = new Map<string, number[]>();

/**
 * Creates a rate limiter with specified options
 */
export function rateLimit(options: RateLimitOptions) {
  const { interval, max, uniqueTokenPerInterval = 500 } = options;
  
  return {
    /**
     * Check if a token (IP, user ID, etc.) has exceeded rate limits
     */
    check: async (response: any, token: string, maxCount: number): Promise<RateLimitStatus> => {
      // Cleanup old tokens if we have too many
      if (tokenCache.size > uniqueTokenPerInterval) {
        const oldestTokenKey = Array.from(tokenCache.keys())[0];
        tokenCache.delete(oldestTokenKey);
      }
      
      // Get current timestamps for this token
      const now = Date.now();
      const timestamps = tokenCache.get(token) || [];
      const validTimestamps = timestamps.filter(t => now - t < interval);
      
      // Calculate rate limit information
      const count = validTimestamps.length;
      const reset = now + interval;
      
      // Store updated timestamps
      tokenCache.set(token, [...validTimestamps, now].slice(-maxCount));
      
      // Check if rate limit exceeded
      if (count >= max) {
        // Set rate limit headers
        response.headers.set('X-RateLimit-Limit', String(max));
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(reset / 1000)));
        response.headers.set('Retry-After', String(Math.ceil(interval / 1000)));
        
        throw new Error('Rate limit exceeded');
      }
      
      // Return rate limit status
      return {
        limit: max,
        remaining: Math.max(0, max - count - 1),
        reset: Math.ceil(reset / 1000)
      };
    }
  };
} 