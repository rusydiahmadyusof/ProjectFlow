/**
 * Server-side rate limiting utility
 * Uses in-memory storage (Map) for tracking requests per IP
 * 
 * Note: For production with multiple servers, consider using Redis or a distributed cache
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

interface RequestRecord {
  timestamps: number[];
  resetTime: number;
}

// In-memory store for rate limit tracking
// Key: IP address or user identifier
// Value: RequestRecord with timestamps and reset time
const rateLimitStore = new Map<string, RequestRecord>();

// Cleanup interval to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Clean up old entries from the rate limit store
 */
function cleanupStore() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    // Remove entries that are past their reset time
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Start cleanup timer if not already running
 */
function startCleanupTimer() {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(cleanupStore, CLEANUP_INTERVAL_MS);
  }
}

/**
 * Get client identifier from request
 * Priority: IP address > User ID (if authenticated)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
  
  return ip;
}

/**
 * Check rate limit for a client
 * @param identifier - Client identifier (IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    // First request from this client
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      timestamps: [now],
      resetTime,
    });
    startCleanupTimer();
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Clean up old timestamps outside the window
  const validTimestamps = record.timestamps.filter(
    (timestamp) => now - timestamp < config.windowMs
  );

  if (validTimestamps.length >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Add current request timestamp
  validTimestamps.push(now);
  rateLimitStore.set(identifier, {
    timestamps: validTimestamps,
    resetTime: record.resetTime,
  });

  return {
    allowed: true,
    remaining: config.maxRequests - validTimestamps.length,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limit configurations per endpoint
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Dashboard stats - moderate limit
  '/api/dashboard/stats': {
    maxRequests: 30, // 30 requests
    windowMs: 60 * 1000, // per minute
  },
  // Project operations - moderate limit
  '/api/projects': {
    maxRequests: 60, // 60 requests
    windowMs: 60 * 1000, // per minute
  },
  // Task operations - moderate limit
  '/api/tasks': {
    maxRequests: 60, // 60 requests
    windowMs: 60 * 1000, // per minute
  },
  // User operations - lower limit
  '/api/user': {
    maxRequests: 20, // 20 requests
    windowMs: 60 * 1000, // per minute
  },
  // Default for all other API routes
  default: {
    maxRequests: 100, // 100 requests
    windowMs: 60 * 1000, // per minute
  },
};

/**
 * Get rate limit config for a specific path
 */
export function getRateLimitConfig(pathname: string): RateLimitConfig {
  // Check for exact match first
  if (RATE_LIMIT_CONFIGS[pathname]) {
    return RATE_LIMIT_CONFIGS[pathname];
  }

  // Check for prefix match (e.g., /api/projects/[id] matches /api/projects)
  for (const [path, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    if (pathname.startsWith(path)) {
      return config;
    }
  }

  // Return default config
  return RATE_LIMIT_CONFIGS.default;
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
  config: RateLimitConfig
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(), // Unix timestamp in seconds
  };

  return headers;
}
