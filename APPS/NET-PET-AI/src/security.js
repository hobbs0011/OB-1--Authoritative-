// src/security.js — NET-PET-AI Security Middleware
// Input sanitization, rate limiting, and threat protection
// ZERO SUMMARIZATION — Clean security, no secrets leaked

const VERSION = "1.2.1";

// ═══════════════════════════════════════════════════════════════
// CONFIG — Tunable security parameters
// ═══════════════════════════════════════════════════════════════

const SECURITY = {
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 100,   // Max requests per window per IP
    blockDuration: 5 * 60 * 1000, // Block for 5 minutes if exceeded
  },
  
  // Input sanitization
  SANITIZE: {
    maxMessageLength: 10000,   // Max chat message length
    maxStudentIdLength: 64,    // Max student ID length
    stripHtml: true,           // Remove HTML tags
    blockSql: true,          // Block SQL injection patterns
    blockXss: true,         // Block XSS patterns
  },
  
  // CORS
  CORS: {
    // Add your allowed origins here
    allowedOrigins: [
      'https://naturalenglishtraining.com',
      'https://www.naturalenglishtraining.com',
      'chrome-extension://*',
    ],
    allowCredentials: true,
  }
};

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING — Simple in-memory implementation
// For production, use Cloudflare Rate Limiting or KV
// ═══════════════════════════════════════════════════════════════

const rateLimitStore = new Map();

/**
 * Check if request exceeds rate limit
 * @returns {object} { allowed: boolean, remaining: number, resetAt: number }
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - SECURITY.RATE_LIMIT.windowMs;
  
  // Clean old entries
  for (const [key, data] of rateLimitStore) {
    if (data.resetAt < windowStart) {
      rateLimitStore.delete(key);
    }
  }
  
  const record = rateLimitStore.get(ip) || {
    count: 0,
    resetAt: now + SECURITY.RATE_LIMIT.windowMs,
    blocked: false,
    blockUntil: 0,
  };
  
  // Check if currently blocked
  if (record.blocked && record.blockUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.blockUntil,
      reason: 'rate_limit_blocked'
    };
  }
  
  // Check limit
  if (record.count >= SECURITY.RATE_LIMIT.maxRequests) {
    record.blocked = true;
    record.blockUntil = now + SECURITY.RATE_LIMIT.blockDuration;
    rateLimitStore.set(ip, record);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.blockUntil,
      reason: 'rate_limit_exceeded'
    };
  }
  
  // Increment
  record.count++;
  rateLimitStore.set(ip, record);
  
  return {
    allowed: true,
    remaining: SECURITY.RATE_LIMIT.maxRequests - record.count,
    resetAt: record.resetAt
  };
}

// ═══════════════════════════════════════════════════════════════
// INPUT SANITIZATION — XSS, SQL injection, malicious input
// ═══════════════════════════════════════════════════════

/**
 * Sanitize user input — remove malicious patterns
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  let output = input;
  
  // Length limits
  if (output.length > SECURITY.SANITIZE.maxMessageLength) {
    output = output.slice(0, SECURITY.SANITIZE.maxMessageLength);
  }
  
  // Remove HTML tags (prevent XSS)
  if (SECURITY.SANITIZE.stripHtml) {
    output = output.replace(/<[^>]*>/g, '');
  }
  
  // Block common SQL injection patterns
  if (SECURITY.SANITIZE.blockSql) {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bDROP\s+TABLE\b)/i,
      /(\bDELETE\s+FROM\b)/i,
      /(\bINSERT\s+INTO\b)/i,
      /(';\s*DROP\b)/i,
      /(\bOR\s+1\s*=\s*1\b)/i,
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(output)) {
        // Log attempt but don't reject — sanitize instead
        console.warn('SQL_INJECTION_ATTEMPT:', output.slice(0, 50));
        output = output.replace(pattern, '[BLOCKED_SQL]');
      }
    }
  }
  
  // Block common XSS attempts
  if (SECURITY.SANITIZE.blockXss) {
    const xssPatterns = [
      /<script\b/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\s*\(/i,
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(output)) {
        console.warn('XSS_ATTEMPT:', output.slice(0, 50));
        output = output.replace(pattern, '[BLOCKED_XSS]');
      }
    }
  }
  
  // Trim whitespace
  output = output.trim();
  
  return output;
}

/**
 * Validate student ID format
 */
function validateStudentId(studentId) {
  if (!studentId || typeof studentId !== 'string') {
    return { valid: false, error: 'studentId required' };
  }
  
  if (studentId.length > SECURITY.SANITIZE.maxStudentIdLength) {
    return { valid: false, error: 'studentId too long' };
  }
  
  // Allow alphanumeric, dash, underscore, dot only
  if (!/^[a-zA-Z0-9._-]+$/.test(studentId)) {
    return { valid: false, error: 'studentId contains invalid characters' };
  }
  
  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════
// CORS HEADERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get CORS headers for request origin
 */
function getCorsHeaders(origin = '') {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Check if origin is allowed
  const isAllowed = SECURITY.CORS.allowedOrigins.some(allowed => 
    allowed === '*' || 
    origin === allowed ||
    allowed.startsWith('*') && origin.endsWith(allowed.slice(2))
  );
  
  if (isAllowed || SECURITY.CORS.allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  if (SECURITY.CORS.allowCredentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}

/**
 * Validate origin header
 */
function validateOrigin(origin) {
  if (!origin) return true; // No origin = curl/script access
  
  return SECURITY.CORS.allowedOrigins.some(allowed => 
    allowed === '*' || 
    origin === allowed ||
    (allowed.endsWith('*') && origin.startsWith(allowed.slice(0, -1))))
  ;
}

// ═══════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE — Compose all checks
// ���══════════════════════════════════════════════════════════════

/**
 * Apply security middleware to request
 * @returns {Response|null} Error response or null if passing
 */
async function securityMiddleware(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const origin = request.headers.get('Origin') || '';
  const url = new URL(request.url);
  
  // 1. Rate limiting (skip health check)
  if (!url.pathname.startsWith('/api/health')) {
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateCheck.resetAt - Date.now()) / 1000).toString(),
          ...getCorsHeaders(origin),
        }
      });
    }
  }
  
  // 2. Origin validation (skip non-API)
  if (url.pathname.startsWith('/api/') && !validateOrigin(origin)) {
    console.warn('CORS_BLOCKED:', origin);
    return new Response(JSON.stringify({
      error: 'Origin not allowed'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) }
    });
  }
  
  // Request passes all checks
  return null;
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default {
  VERSION,
  SECURITY,
  securityMiddleware,
  sanitizeInput,
  validateStudentId,
  checkRateLimit,
  getCorsHeaders,
  validateOrigin,
};

export { VERSION, SECURITY, securityMiddleware, sanitizeInput, validateStudentId, checkRateLimit, getCorsHeaders, validateOrigin };