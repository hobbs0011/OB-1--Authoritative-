// src/auth.js — NET-PET-AI Authentication
// Only the REAL Michael can unlock secrets with "The Phoenix Rising Protocol"
// Soul DNA verification — verbatim, never diluted

const VERSION = "1.2.3";

const PHOENIX_RISING_PHRASE = "The Phoenix Rising Protocol";

// HMAC-SHA256 helpers — tokens are signed, not plain base64
async function _importKey(secret) {
  if (!secret) throw new Error("SESSION_SECRET not configured — set it as a Cloudflare Worker secret");
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function _signPayload(payload, secret) {
  const key = await _importKey(secret);
  const data = new TextEncoder().encode(payload);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function _verifySignature(payload, signature, secret) {
  const key = await _importKey(secret);
  const data = new TextEncoder().encode(payload);
  const sigBytes = new Uint8Array(signature.match(/.{2}/g).map(b => parseInt(b, 16)));
  return crypto.subtle.verify("HMAC", key, sigBytes, data);
}

function verifyPhoenixPhrase(inputPhrase) {
  const normalized = (inputPhrase || '').trim();
  if (normalized.toLowerCase() === PHOENIX_RISING_PHRASE.toLowerCase()) {
    return { verified: true, identity: 'MICHAEL_HOBBS', timestamp: Date.now(), phrase: PHOENIX_RISING_PHRASE };
  }
  return { verified: false, identity: null, timestamp: Date.now() };
}

async function requirePhoenixAuth(request) {
  const body = await request.json();
  const phrase = body.phrase || body.unlockPhrase || body.secret;
  const result = verifyPhoenixPhrase(phrase);
  if (!result.verified) {
    return { allowed: false, error: 'PHOENIX_RISING_REQUIRED', message: 'This action requires authentication with Phoenix Rising Protocol' };
  }
  return { allowed: true, identity: result.identity, timestamp: result.timestamp };
}

async function handleKeyRotation(body, env) {
  const auth = await requirePhoenixAuth({ json: () => Promise.resolve(body) });
  if (!auth.allowed) {
    return { success: false, error: auth.error, code: 'AUTH_REQUIRED' };
  }
  // Actual rotation happens via Cloudflare Wrangler — this just authorizes the intent
  return { success: true, message: 'Key rotation authorized', keyName: body.keyName, authorizedBy: auth.identity, timestamp: auth.timestamp };
}

async function handleSecretQuery(body, env) {
  const auth = await requirePhoenixAuth({ json: () => Promise.resolve(body) });
  if (!auth.allowed) {
    return { success: false, error: auth.error, code: 'AUTH_REQUIRED' };
  }
  const secrets = {
    DEEPSEEK_API_KEY: { exists: !!env.DEEPSEEK_API_KEY, lastRotated: null },
    DEEPGRAM_API_KEY: { exists: !!env.DEEPGRAM_API_KEY, lastRotated: null },
  };
  return { success: true, secrets, queryBy: auth.identity, timestamp: auth.timestamp };
}

async function handleAdminDashboard(body, env) {
  const auth = await requirePhoenixAuth({ json: () => Promise.resolve(body) });
  if (!auth.allowed) {
    return { success: false, error: auth.error, code: 'AUTH_REQUIRED' };
  }
  return {
    success: true,
    dashboard: {
      version: VERSION,
      app: 'NET-PET-AI',
      apiKeysConfigured: { DEEPSEEK: !!env.DEEPSEEK_API_KEY, DEEPGRAM: !!env.DEEPGRAM_API_KEY },
      bindings: { SESSIONS: !!env.SESSIONS, LEDGER: !!env.LEDGER, PROFILES: !!env.PROFILES },
      phoenixVerified: true,
      locked: false,
    },
    accessedBy: auth.identity,
    timestamp: auth.timestamp,
  };
}

// Token format: base64(JSON payload) + "." + HMAC-SHA256 signature
// The session secret comes from env.SESSION_SECRET (set as a Cloudflare Worker secret).
// Falls back to a dev key when env is not passed — never use default in production.

async function createPhoenixSession(env) {
  const payload = {
    id: crypto.randomUUID(),
    identity: 'MICHAEL_HOBBS',
    created: Date.now(),
    expires: Date.now() + (24 * 60 * 60 * 1000),
    level: 'PHOENIX',
  };
  const encoded = btoa(JSON.stringify(payload));
  const sig = await _signPayload(encoded, env?.SESSION_SECRET);
  return { token: `${encoded}.${sig}`, expires: payload.expires };
}

async function verifyPhoenixSession(token, env) {
  try {
    const dot = token.lastIndexOf('.');
    if (dot < 0) return { valid: false, error: 'MALFORMED_TOKEN' };
    const encoded = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const ok = await _verifySignature(encoded, sig, env?.SESSION_SECRET);
    if (!ok) return { valid: false, error: 'INVALID_SIGNATURE' };
    const payload = JSON.parse(atob(encoded));
    if (payload.identity !== 'MICHAEL_HOBBS') return { valid: false, error: 'INVALID_IDENTITY' };
    if (payload.expires < Date.now()) return { valid: false, error: 'TOKEN_EXPIRED' };
    return { valid: true, identity: payload.identity, level: payload.level };
  } catch {
    return { valid: false, error: 'INVALID_TOKEN' };
  }
}

export {
  VERSION,
  verifyPhoenixPhrase,
  requirePhoenixAuth,
  handleKeyRotation,
  handleSecretQuery,
  handleAdminDashboard,
  createPhoenixSession,
  verifyPhoenixSession,
};
