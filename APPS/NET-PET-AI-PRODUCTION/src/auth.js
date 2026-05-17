// src/auth.js — NET-PET-AI Authentication
// Only the REAL Michael can unlock secrets with "The Phoenix Rising Protocol"
// Soul DNA verification — verbatim, never diluted

const VERSION = "1.2.2";

// ═══════════════════════════════════════════════════════════════
// PHOENIX RISING PROTOCOL — The Only Key to Unlock
// ═══════════════════════════════════════════════════════

const PHOENIX_RISING_PHRASE = "The Phoenix Rising Protocol";

// Verbatim Soul DNA — This IS the key
// "The Phoenix Rising Protocol" = access to admin functions
// No variations accepted (case-insensitive is intentional for UX)

/**
 * Verify Phoenix Rising Protocol phrase
 * @returns {object} { verified: boolean, identity: string|null }
 */
function verifyPhoenixPhrase(inputPhrase) {
  const normalized = (inputPhrase || '').trim();
  
  // Case-insensitive match for the sacred phrase
  if (normalized.toLowerCase() === PHOENIX_RISING_PHRASE.toLowerCase()) {
    return {
      verified: true,
      identity: 'MICHAEL_HOBBS',
      timestamp: Date.now(),
      phrase: PHOENIX_RISING_PHRASE
    };
  }
  
  return {
    verified: false,
    identity: null,
    timestamp: Date.now()
  };
}

/**
 * Require Phoenix authentication for protected routes
 * Used in API handlers that need admin/secret access
 */
async function requirePhoenixAuth(request) {
  const body = await request.json();
  const phrase = body.phrase || body.unlockPhrase || body.secret;
  
  const result = verifyPhoenixPhrase(phrase);
  
  if (!result.verified) {
    return {
      allowed: false,
      error: 'PHOENIX_RISING_REQUIRED',
      message: 'This action requires authentication with Phoenix Rising Protocol'
    };
  }
  
  return {
    allowed: true,
    identity: result.identity,
    timestamp: result.timestamp
  };
}

// ═══════════════════════════════════════════════════════
// ADMIN KEY ROTATION — Protected by Phoenix Protocol
// ═══════════════════════════════════════════════════════

/**
 * Rotate API key — REQUIRES Phoenix authentication
 * 
 * Body: { phrase: "The Phoenix Rising Protocol", keyName: "DEEPSEEK_API_KEY", newValue: "sk-..." }
 */
async function handleKeyRotation(body, env) {
  // First: Verify Phoenix
  const auth = await requirePhoenixAuth({ json: () => Promise.resolve(body) });
  
  if (!auth.allowed) {
    return {
      success: false,
      error: auth.error,
      code: 'AUTH_REQUIRED'
    };
  }
  
  // Verify identity
  if (auth.identity !== 'MICHAEL_HOBBS') {
    return {
      success: false,
      error: 'INVALID_IDENTITY',
      code: 'FORBIDDEN'
    };
  }
  
  // Key rotation logic would go here
  // Note: Actual rotation happens via Cloudflare Wrangler
  // This just logs the intent
  
  return {
    success: true,
    message: 'Key rotation authorized',
    keyName: body.keyName,
    authorizedBy: auth.identity,
    timestamp: auth.timestamp
  };
}

// ═══════════════════════════════════════════════════════
// SECRET RETRIEVAL — Protected by Phoenix Protocol
// ═════════════════════════���═════════════════════════════

/**
 * Retrieve secret metadata (NOT the actual secret)
 * REQUIRES Phoenix authentication
 * 
 * Body: { phrase: "The Phoenix Rising Protocol" }
 * Returns: { keyName: "...", exists: true/false, lastRotated: timestamp }
 */
async function handleSecretQuery(body, env) {
  const auth = await requirePhoenixAuth({ json: () => Promise.resolve(body) });
  
  if (!auth.allowed) {
    return {
      success: false,
      error: auth.error,
      code: 'AUTH_REQUIRED'
    };
  }
  
  // Return metadata only — NEVER the actual key
  const secrets = {
    DEEPSEEK_API_KEY: {
      exists: !!env.DEEPSEEK_API_KEY,
      lastRotated: null // Could track in KV
    },
    DEEPGRAM_API_KEY: {
      exists: !!env.DEEPGRAM_API_KEY,
      lastRotated: null
    }
  };
  
  return {
    success: true,
    secrets: secrets,
    queryBy: auth.identity,
    timestamp: auth.timestamp
  };
}

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD DATA — Protected by Phoenix Protocol
// ═══════════════════════════════════════════════════════

/**
 * Get admin dashboard data
 * REQUIRES Phoenix authentication
 */
async function handleAdminDashboard(body, env) {
  const auth = await requirePhoenixAuth({ json: () => Promise.resolve(body) });
  
  if (!auth.allowed) {
    return {
      success: false,
      error: auth.error,
      code: 'AUTH_REQUIRED'
    };
  }
  
  // Return sanitized dashboard data (no secrets)
  return {
    success: true,
    dashboard: {
      version: VERSION,
      app: 'NET-PET-AI',
      apiKeysConfigured: {
        DEEPSEEK: !!env.DEEPSEEK_API_KEY,
        DEEPGRAM: !!env.DEEPGRAM_API_KEY
      },
      bindings: {
        SESSIONS: !!env.SESSIONS,
        LEDGER: !!env.LEDGER,
        PROFILES: !!env.PROFILES
      },
      phoenixVerified: true,
      locked: false
    },
    accessedBy: auth.identity,
    timestamp: auth.timestamp
  };
}

// ═══════════════════════════════════════════════════════
// SESSION VERIFICATION — For Michael's sessions
// ═══════════════════════════════════════════════════════

/**
 * Create a verified session token for Phoenix
 * Used for subsequent requests after initial auth
 */
function createPhoenixSession(studentId) {
  const payload = {
    id: crypto.randomUUID(),
    identity: 'MICHAEL_HOBBS',
    created: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    level: 'PHOENIX'
  };
  
  // Simple encoded token (NOT JWT — keeping it simple)
  const encoded = btoa(JSON.stringify(payload));
  
  return {
    token: encoded,
    expires: payload.expires
  };
}

/**
 * Verify a Phoenix session token
 */
function verifyPhoenixSession(token) {
  try {
    const payload = JSON.parse(atob(token));
    
    if (payload.identity !== 'MICHAEL_HOBBS') {
      return { valid: false, error: 'INVALID_IDENTITY' };
    }
    
    if (payload.expires < Date.now()) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }
    
    return {
      valid: true,
      identity: payload.identity,
      level: payload.level
    };
  } catch (e) {
    return { valid: false, error: 'INVALID_TOKEN' };
  }
}

// ════════════════════════════════════════��══════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════

export default {
  VERSION,
  PHOENIX_RISING_PHRASE,
  verifyPhoenixPhrase,
  requirePhoenixAuth,
  handleKeyRotation,
  handleSecretQuery,
  handleAdminDashboard,
  createPhoenixSession,
  verifyPhoenixSession,
};

export { 
  VERSION, 
  PHOENIX_RISING_PHRASE,
  verifyPhoenixPhrase,
  requirePhoenixAuth,
  handleKeyRotation,
  handleSecretQuery,
  handleAdminDashboard,
  createPhoenixSession,
  verifyPhoenixSession
};