/**
 * Security utilities for XSS protection, CSRF, and input sanitization
 */

import { sanitizeString, sanitizeObject } from './validation';

/**
 * XSS Protection - Escapes HTML special characters
 */
export const escapeHTML = (str: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return str.replace(/[&<>"']/g, (char) => map[char] || char);
};

/**
 * XSS Protection - Sanitizes user input for safe display
 */
export const sanitizeForDisplay = (input: string): string => {
  return escapeHTML(sanitizeString(input));
};

/**
 * XSS Protection - Sanitizes user input for safe storage
 */
export const sanitizeForStorage = (input: any): any => {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  if (typeof input === 'object' && input !== null) {
    return sanitizeObject(input);
  }
  return input;
};

/**
 * CSRF Protection - Generates CSRF token (for future use)
 * Note: Next.js has built-in CSRF protection via SameSite cookies
 */
export const generateCSRFToken = (): string => {
  // In production, use a cryptographically secure random generator
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Validates CSRF token (for future use)
 */
export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }

  return result === 0;
};

/**
 * Rate limiting helper (client-side check)
 * Note: Real rate limiting should be implemented server-side
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Remove requests outside the time window
    const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);

    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter((timestamp) => now - timestamp < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Reset rate limiter for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Content Security Policy helper
 * Returns CSP header string for Next.js
 */
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ');
};
