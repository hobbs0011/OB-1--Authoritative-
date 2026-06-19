var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/security.js
var SECURITY = {
  RATE_LIMIT: {
    windowMs: 60 * 1e3,
    maxRequests: 100,
    blockDuration: 5 * 60 * 1e3
  },
  SANITIZE: {
    maxTaskLength: 1e4,
    maxContextLength: 5e4,
    stripHtml: true,
    blockSql: true,
    blockXss: true
  },
  CORS: {
    // Internal API — called from Claude Code (PowerShell), Haiku operator, CF workers.
    // Not browser-facing. Auth gate (WORKER_ADMIN_KEY / PA_AUTH_SECRET) is the real control.
    // Wildcard is intentional for programmatic callers; tighten if exposed publicly.
    allowedOrigins: ["*"],
    allowCredentials: false
  }
};
var _rateLimitFallback = /* @__PURE__ */ new Map();
async function checkRateLimit(ip, kv) {
  const now = Date.now();
  if (!kv) {
    console.warn("RATELIMIT KV binding not configured \u2014 rate limiting is ephemeral");
    return _checkRateLimitInMemory(ip, now);
  }
  const key = `rl:${ip}`;
  const raw = await kv.get(key);
  const record = raw ? JSON.parse(raw) : { count: 0, resetAt: now + SECURITY.RATE_LIMIT.windowMs, blocked: false, blockUntil: 0 };
  if (record.blocked && record.blockUntil > now) {
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: "rate_limit_blocked" };
  }
  if (record.resetAt <= now) {
    record.count = 0;
    record.resetAt = now + SECURITY.RATE_LIMIT.windowMs;
    record.blocked = false;
    record.blockUntil = 0;
  }
  if (record.count >= SECURITY.RATE_LIMIT.maxRequests) {
    record.blocked = true;
    record.blockUntil = now + SECURITY.RATE_LIMIT.blockDuration;
    await kv.put(key, JSON.stringify(record), { expirationTtl: Math.ceil(SECURITY.RATE_LIMIT.blockDuration / 1e3) });
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: "rate_limit_exceeded" };
  }
  record.count++;
  await kv.put(key, JSON.stringify(record), { expirationTtl: Math.ceil(SECURITY.RATE_LIMIT.windowMs / 1e3) });
  return { allowed: true, remaining: SECURITY.RATE_LIMIT.maxRequests - record.count, resetAt: record.resetAt };
}
__name(checkRateLimit, "checkRateLimit");
function _checkRateLimitInMemory(ip, now) {
  const windowStart = now - SECURITY.RATE_LIMIT.windowMs;
  for (const [key, data2] of _rateLimitFallback) {
    if (data2.resetAt < windowStart) _rateLimitFallback.delete(key);
  }
  const record = _rateLimitFallback.get(ip) || { count: 0, resetAt: now + SECURITY.RATE_LIMIT.windowMs, blocked: false, blockUntil: 0 };
  if (record.blocked && record.blockUntil > now) {
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: "rate_limit_blocked" };
  }
  if (record.count >= SECURITY.RATE_LIMIT.maxRequests) {
    record.blocked = true;
    record.blockUntil = now + SECURITY.RATE_LIMIT.blockDuration;
    _rateLimitFallback.set(ip, record);
    return { allowed: false, remaining: 0, resetAt: record.blockUntil, reason: "rate_limit_blocked" };
  }
  record.count++;
  _rateLimitFallback.set(ip, record);
  return { allowed: true, remaining: SECURITY.RATE_LIMIT.maxRequests - record.count, resetAt: record.resetAt };
}
__name(_checkRateLimitInMemory, "_checkRateLimitInMemory");
function sanitizeInput(input, maxLength) {
  if (typeof input !== "string") return "";
  const limit = maxLength || SECURITY.SANITIZE.maxTaskLength;
  let output = input.length > limit ? input.slice(0, limit) : input;
  if (SECURITY.SANITIZE.stripHtml) {
    output = output.replace(/<[^>]*>/g, "");
  }
  if (SECURITY.SANITIZE.blockSql) {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bDROP\s+TABLE\b)/i,
      /(\bDELETE\s+FROM\b)/i,
      /(\bINSERT\s+INTO\b)/i,
      /(';\s*DROP\b)/i,
      /(\bOR\s+1\s*=\s*1\b)/i
    ];
    for (const p of sqlPatterns) {
      if (p.test(output)) {
        console.warn("SQL_INJECTION_ATTEMPT:", output.slice(0, 50));
        output = output.replace(p, "[BLOCKED_SQL]");
      }
    }
  }
  if (SECURITY.SANITIZE.blockXss) {
    const xssPatterns = [/<script\b/i, /javascript:/i, /\bon\w+\s*=/i, /<iframe/i, /<object/i, /<embed/i, /eval\s*\(/i];
    for (const p of xssPatterns) {
      if (p.test(output)) {
        console.warn("XSS_ATTEMPT:", output.slice(0, 50));
        output = output.replace(p, "[BLOCKED_XSS]");
      }
    }
  }
  return output.trim();
}
__name(sanitizeInput, "sanitizeInput");
function getCorsHeaders(origin = "") {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-pa-auth, Authorization"
  };
  const isAllowed = SECURITY.CORS.allowedOrigins.some((a) => a === "*" || origin === a);
  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = SECURITY.CORS.allowCredentials && origin ? origin : "*";
  }
  return headers;
}
__name(getCorsHeaders, "getCorsHeaders");
async function checkAdminKey(request, env) {
  const expected = env.WORKER_ADMIN_KEY || env.PA_AUTH_SECRET || "";
  if (!expected) return null;
  const bearerHeader = request.headers.get("Authorization") || "";
  const bearerToken = bearerHeader.startsWith("Bearer ") ? bearerHeader.slice(7) : "";
  const provided = request.headers.get("x-pa-auth") || request.headers.get("X-Admin-Key") || bearerToken;
  const enc = new TextEncoder();
  const a = enc.encode(provided.padEnd(128, "\0"));
  const b = enc.encode(expected.padEnd(128, "\0"));
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) {
    const origin = request.headers.get("Origin") || "";
    return new Response(JSON.stringify({ error: "Unauthorized", hint: "x-pa-auth header required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) }
    });
  }
  return null;
}
__name(checkAdminKey, "checkAdminKey");
async function securityMiddleware(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const origin = request.headers.get("Origin") || "";
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/status")) {
    const rateCheck = await checkRateLimit(ip, env?.RATELIMIT);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded", retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1e3) }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1e3)), ...getCorsHeaders(origin) }
      });
    }
  }
  return null;
}
__name(securityMiddleware, "securityMiddleware");

// ../../node_modules/acorn/dist/acorn.mjs
var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 78, 5, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 266, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 57, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 261, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7381, 42, 31, 98, 114, 8702, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4381, 3, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489];
var nonASCIIidentifierChars = "\u200C\u200D\xB7\u0300-\u036F\u0387\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u0669\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07C0-\u07C9\u07EB-\u07F3\u07FD\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u0897-\u089F\u08CA-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0966-\u096F\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u09E6-\u09EF\u09FE\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A66-\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AE6-\u0AEF\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B55-\u0B57\u0B62\u0B63\u0B66-\u0B6F\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0BE6-\u0BEF\u0C00-\u0C04\u0C3C\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0CE6-\u0CEF\u0CF3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D66-\u0D6F\u0D81-\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E50-\u0E59\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECE\u0ED0-\u0ED9\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1040-\u1049\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F-\u109D\u135D-\u135F\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u17E0-\u17E9\u180B-\u180D\u180F-\u1819\u18A9\u1920-\u192B\u1930-\u193B\u1946-\u194F\u19D0-\u19DA\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AB0-\u1ABD\u1ABF-\u1ADD\u1AE0-\u1AEB\u1B00-\u1B04\u1B34-\u1B44\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BB0-\u1BB9\u1BE6-\u1BF3\u1C24-\u1C37\u1C40-\u1C49\u1C50-\u1C59\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DFF\u200C\u200D\u203F\u2040\u2054\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\u30FB\uA620-\uA629\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA82C\uA880\uA881\uA8B4-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F1\uA8FF-\uA909\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9D0-\uA9D9\uA9E5\uA9F0-\uA9F9\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA50-\uAA59\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uABF0-\uABF9\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFF10-\uFF19\uFF3F\uFF65";
var nonASCIIidentifierStartChars = "\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u0870-\u0887\u0889-\u088F\u08A0-\u08C9\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C5C\u0C5D\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDC-\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u1711\u171F-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1878\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4C\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C8A\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u31A0-\u31BF\u31F0-\u31FF\u3400-\u4DBF\u4E00-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7DC\uA7F1-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC";
var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};
var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
var keywords$1 = {
  5: ecma5AndLessKeywords,
  "5module": ecma5AndLessKeywords + " export import",
  6: ecma5AndLessKeywords + " const class extends export import super"
};
var keywordRelationalOperator = /^in(stanceof)?$/;
var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
function isInAstralSet(code, set) {
  var pos = 65536;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) {
      return false;
    }
    pos += set[i + 1];
    if (pos >= code) {
      return true;
    }
  }
  return false;
}
__name(isInAstralSet, "isInAstralSet");
function isIdentifierStart(code, astral) {
  if (code < 65) {
    return code === 36;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes);
}
__name(isIdentifierStart, "isIdentifierStart");
function isIdentifierChar(code, astral) {
  if (code < 48) {
    return code === 36;
  }
  if (code < 58) {
    return true;
  }
  if (code < 65) {
    return false;
  }
  if (code < 91) {
    return true;
  }
  if (code < 97) {
    return code === 95;
  }
  if (code < 123) {
    return true;
  }
  if (code <= 65535) {
    return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
  }
  if (astral === false) {
    return false;
  }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
}
__name(isIdentifierChar, "isIdentifierChar");
var TokenType = /* @__PURE__ */ __name(function TokenType2(label, conf) {
  if (conf === void 0) conf = {};
  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
}, "TokenType");
function binop(name, prec) {
  return new TokenType(name, { beforeExpr: true, binop: prec });
}
__name(binop, "binop");
var beforeExpr = { beforeExpr: true };
var startsExpr = { startsExpr: true };
var keywords = {};
function kw(name, options) {
  if (options === void 0) options = {};
  options.keyword = name;
  return keywords[name] = new TokenType(name, options);
}
__name(kw, "kw");
var types$1 = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  privateId: new TokenType("privateId", startsExpr),
  eof: new TokenType("eof"),
  // Punctuation token types.
  bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  questionDot: new TokenType("?."),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.
  eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
  assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
  incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
  prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", { beforeExpr: true }),
  coalesce: binop("??", 1),
  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", { isLoop: true, beforeExpr: true }),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", { isLoop: true }),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", { isLoop: true }),
  _with: kw("with"),
  _new: kw("new", { beforeExpr: true, startsExpr: true }),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import", startsExpr),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", { beforeExpr: true, binop: 7 }),
  _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
  _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
  _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
  _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
};
var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");
function isNewLine(code) {
  return code === 10 || code === 13 || code === 8232 || code === 8233;
}
__name(isNewLine, "isNewLine");
function nextLineBreak(code, from, end) {
  if (end === void 0) end = code.length;
  for (var i = from; i < end; i++) {
    var next = code.charCodeAt(i);
    if (isNewLine(next)) {
      return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1;
    }
  }
  return -1;
}
__name(nextLineBreak, "nextLineBreak");
var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;
var hasOwn = Object.hasOwn || (function(obj, propName) {
  return hasOwnProperty.call(obj, propName);
});
var isArray = Array.isArray || (function(obj) {
  return toString.call(obj) === "[object Array]";
});
var regexpCache = /* @__PURE__ */ Object.create(null);
function wordsRegexp(words) {
  return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
}
__name(wordsRegexp, "wordsRegexp");
function codePointToString(code) {
  if (code <= 65535) {
    return String.fromCharCode(code);
  }
  code -= 65536;
  return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
}
__name(codePointToString, "codePointToString");
var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
var Position = /* @__PURE__ */ __name(function Position2(line, col) {
  this.line = line;
  this.column = col;
}, "Position");
Position.prototype.offset = /* @__PURE__ */ __name(function offset(n) {
  return new Position(this.line, this.column + n);
}, "offset");
var SourceLocation = /* @__PURE__ */ __name(function SourceLocation2(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) {
    this.source = p.sourceFile;
  }
}, "SourceLocation");
function getLineInfo(input, offset2) {
  for (var line = 1, cur = 0; ; ) {
    var nextBreak = nextLineBreak(input, cur, offset2);
    if (nextBreak < 0) {
      return new Position(line, offset2 - cur);
    }
    ++line;
    cur = nextBreak;
  }
}
__name(getLineInfo, "getLineInfo");
var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must be
  // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
  // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
  // (the latest version the library supports). This influences
  // support for strict mode, the set of reserved words, and support
  // for new syntax features.
  ecmaVersion: null,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"`, `"module"` or `"commonjs"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called when
  // a semicolon is automatically inserted. It will be passed the
  // position of the inserted semicolon as an offset, and if
  // `locations` is enabled, it is given the location as a `{line,
  // column}` object as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program, and an import.meta expression
  // in a script isn't considered an error.
  allowImportExportEverywhere: false,
  // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
  // When enabled, await identifiers are allowed to appear at the top-level scope,
  // but they are still not allowed in non-async functions.
  allowAwaitOutsideFunction: null,
  // When enabled, super identifiers are not constrained to
  // appearing in methods and do not raise an error when they appear elsewhere.
  allowSuperOutsideMethod: null,
  // When enabled, hashbang directive in the beginning of file is
  // allowed and treated as a line comment. Enabled by default when
  // `ecmaVersion` >= 2023.
  allowHashBang: false,
  // By default, the parser will verify that private properties are
  // only used in places where they are valid and have been declared.
  // Set this to false to turn such checks off.
  checkPrivateFields: true,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  // When this option has an array as value, objects representing the
  // comments are pushed to it.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false
};
var warnedAboutEcmaVersion = false;
function getOptions(opts) {
  var options = {};
  for (var opt in defaultOptions) {
    options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
  }
  if (options.ecmaVersion === "latest") {
    options.ecmaVersion = 1e8;
  } else if (options.ecmaVersion == null) {
    if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
      warnedAboutEcmaVersion = true;
      console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
    }
    options.ecmaVersion = 11;
  } else if (options.ecmaVersion >= 2015) {
    options.ecmaVersion -= 2009;
  }
  if (options.allowReserved == null) {
    options.allowReserved = options.ecmaVersion < 5;
  }
  if (!opts || opts.allowHashBang == null) {
    options.allowHashBang = options.ecmaVersion >= 14;
  }
  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function(token) {
      return tokens.push(token);
    };
  }
  if (isArray(options.onComment)) {
    options.onComment = pushComment(options, options.onComment);
  }
  if (options.sourceType === "commonjs" && options.allowAwaitOutsideFunction) {
    throw new Error("Cannot use allowAwaitOutsideFunction with sourceType: commonjs");
  }
  return options;
}
__name(getOptions, "getOptions");
function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start,
      end
    };
    if (options.locations) {
      comment.loc = new SourceLocation(this, startLoc, endLoc);
    }
    if (options.ranges) {
      comment.range = [start, end];
    }
    array.push(comment);
  };
}
__name(pushComment, "pushComment");
var SCOPE_TOP = 1;
var SCOPE_FUNCTION = 2;
var SCOPE_ASYNC = 4;
var SCOPE_GENERATOR = 8;
var SCOPE_ARROW = 16;
var SCOPE_SIMPLE_CATCH = 32;
var SCOPE_SUPER = 64;
var SCOPE_DIRECT_SUPER = 128;
var SCOPE_CLASS_STATIC_BLOCK = 256;
var SCOPE_CLASS_FIELD_INIT = 512;
var SCOPE_SWITCH = 1024;
var SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
function functionFlags(async, generator) {
  return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
}
__name(functionFlags, "functionFlags");
var BIND_NONE = 0;
var BIND_VAR = 1;
var BIND_LEXICAL = 2;
var BIND_FUNCTION = 3;
var BIND_SIMPLE_CATCH = 4;
var BIND_OUTSIDE = 5;
var Parser = /* @__PURE__ */ __name(function Parser2(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
  var reserved = "";
  if (options.allowReserved !== true) {
    reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
    if (options.sourceType === "module") {
      reserved += " await";
    }
  }
  this.reservedWords = wordsRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = wordsRegexp(reservedStrict);
  this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);
  this.containsEsc = false;
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }
  this.type = types$1.eof;
  this.value = null;
  this.start = this.end = this.pos;
  this.startLoc = this.endLoc = this.curPosition();
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;
  this.context = this.initialContext();
  this.exprAllowed = true;
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);
  this.potentialArrowAt = -1;
  this.potentialArrowInForAwait = false;
  this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
  this.labels = [];
  this.undefinedExports = /* @__PURE__ */ Object.create(null);
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
    this.skipLineComment(2);
  }
  this.scopeStack = [];
  this.enterScope(
    this.options.sourceType === "commonjs" ? SCOPE_FUNCTION : SCOPE_TOP
  );
  this.regexpState = null;
  this.privateNameStack = [];
}, "Parser");
var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowReturn: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, allowUsing: { configurable: true }, inClassStaticBlock: { configurable: true } };
Parser.prototype.parse = /* @__PURE__ */ __name(function parse() {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node);
}, "parse");
prototypeAccessors.inFunction.get = function() {
  return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
};
prototypeAccessors.inGenerator.get = function() {
  return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
};
prototypeAccessors.inAsync.get = function() {
  return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
};
prototypeAccessors.canAwait.get = function() {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var ref2 = this.scopeStack[i];
    var flags = ref2.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
      return false;
    }
    if (flags & SCOPE_FUNCTION) {
      return (flags & SCOPE_ASYNC) > 0;
    }
  }
  return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
};
prototypeAccessors.allowReturn.get = function() {
  if (this.inFunction) {
    return true;
  }
  if (this.options.allowReturnOutsideFunction && this.currentVarScope().flags & SCOPE_TOP) {
    return true;
  }
  return false;
};
prototypeAccessors.allowSuper.get = function() {
  var ref2 = this.currentThisScope();
  var flags = ref2.flags;
  return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
};
prototypeAccessors.allowDirectSuper.get = function() {
  return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
};
prototypeAccessors.treatFunctionsAsVar.get = function() {
  return this.treatFunctionsAsVarInScope(this.currentScope());
};
prototypeAccessors.allowNewDotTarget.get = function() {
  for (var i = this.scopeStack.length - 1; i >= 0; i--) {
    var ref2 = this.scopeStack[i];
    var flags = ref2.flags;
    if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
      return true;
    }
  }
  return false;
};
prototypeAccessors.allowUsing.get = function() {
  var ref2 = this.currentScope();
  var flags = ref2.flags;
  if (flags & SCOPE_SWITCH) {
    return false;
  }
  if (!this.inModule && flags & SCOPE_TOP) {
    return false;
  }
  return true;
};
prototypeAccessors.inClassStaticBlock.get = function() {
  return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
};
Parser.extend = /* @__PURE__ */ __name(function extend() {
  var plugins = [], len = arguments.length;
  while (len--) plugins[len] = arguments[len];
  var cls = this;
  for (var i = 0; i < plugins.length; i++) {
    cls = plugins[i](cls);
  }
  return cls;
}, "extend");
Parser.parse = /* @__PURE__ */ __name(function parse2(input, options) {
  return new this(options, input).parse();
}, "parse");
Parser.parseExpressionAt = /* @__PURE__ */ __name(function parseExpressionAt(input, pos, options) {
  var parser = new this(options, input, pos);
  parser.nextToken();
  return parser.parseExpression();
}, "parseExpressionAt");
Parser.tokenizer = /* @__PURE__ */ __name(function tokenizer(input, options) {
  return new this(options, input);
}, "tokenizer");
Object.defineProperties(Parser.prototype, prototypeAccessors);
var pp$9 = Parser.prototype;
var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
pp$9.strictDirective = function(start) {
  if (this.options.ecmaVersion < 5) {
    return false;
  }
  for (; ; ) {
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    var match = literal.exec(this.input.slice(start));
    if (!match) {
      return false;
    }
    if ((match[1] || match[2]) === "use strict") {
      skipWhiteSpace.lastIndex = start + match[0].length;
      var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
      var next = this.input.charAt(end);
      return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
    }
    start += match[0].length;
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this.input)[0].length;
    if (this.input[start] === ";") {
      start++;
    }
  }
};
pp$9.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true;
  } else {
    return false;
  }
};
pp$9.isContextual = function(name) {
  return this.type === types$1.name && this.value === name && !this.containsEsc;
};
pp$9.eatContextual = function(name) {
  if (!this.isContextual(name)) {
    return false;
  }
  this.next();
  return true;
};
pp$9.expectContextual = function(name) {
  if (!this.eatContextual(name)) {
    this.unexpected();
  }
};
pp$9.canInsertSemicolon = function() {
  return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$9.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon) {
      this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
    }
    return true;
  }
};
pp$9.semicolon = function() {
  if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
    this.unexpected();
  }
};
pp$9.afterTrailingComma = function(tokType, notNext) {
  if (this.type === tokType) {
    if (this.options.onTrailingComma) {
      this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
    }
    if (!notNext) {
      this.next();
    }
    return true;
  }
};
pp$9.expect = function(type) {
  this.eat(type) || this.unexpected();
};
pp$9.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};
var DestructuringErrors = /* @__PURE__ */ __name(function DestructuringErrors2() {
  this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
}, "DestructuringErrors");
pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) {
    return;
  }
  if (refDestructuringErrors.trailingComma > -1) {
    this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
  }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) {
    this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
  }
};
pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) {
    return false;
  }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) {
    return shorthandAssign >= 0 || doubleProto >= 0;
  }
  if (shorthandAssign >= 0) {
    this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
  }
  if (doubleProto >= 0) {
    this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
  }
};
pp$9.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
    this.raise(this.yieldPos, "Yield expression cannot be a default value");
  }
  if (this.awaitPos) {
    this.raise(this.awaitPos, "Await expression cannot be a default value");
  }
};
pp$9.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression") {
    return this.isSimpleAssignTarget(expr.expression);
  }
  return expr.type === "Identifier" || expr.type === "MemberExpression";
};
var pp$8 = Parser.prototype;
pp$8.parseTopLevel = function(node) {
  var exports = /* @__PURE__ */ Object.create(null);
  if (!node.body) {
    node.body = [];
  }
  while (this.type !== types$1.eof) {
    var stmt = this.parseStatement(null, true, exports);
    node.body.push(stmt);
  }
  if (this.inModule) {
    for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1) {
      var name = list[i];
      this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
    }
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  node.sourceType = this.options.sourceType === "commonjs" ? "script" : this.options.sourceType;
  return this.finishNode(node, "Program");
};
var loopLabel = { kind: "loop" };
var switchLabel = { kind: "switch" };
pp$8.isLet = function(context) {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.fullCharCodeAt(next);
  if (nextCh === 91 || nextCh === 92) {
    return true;
  }
  if (context) {
    return false;
  }
  if (nextCh === 123) {
    return true;
  }
  if (isIdentifierStart(nextCh)) {
    var start = next;
    do {
      next += nextCh <= 65535 ? 1 : 2;
    } while (isIdentifierChar(nextCh = this.fullCharCodeAt(next)));
    if (nextCh === 92) {
      return true;
    }
    var ident = this.input.slice(start, next);
    if (!keywordRelationalOperator.test(ident)) {
      return true;
    }
  }
  return false;
};
pp$8.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, after;
  return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.fullCharCodeAt(next + 8)) || after === 92));
};
pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
  if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
    return false;
  }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  if (lineBreak.test(this.input.slice(this.pos, next))) {
    return false;
  }
  if (isAwaitUsing) {
    var usingEndPos = next + 5, after;
    if (this.input.slice(next, usingEndPos) !== "using" || usingEndPos === this.input.length || isIdentifierChar(after = this.fullCharCodeAt(usingEndPos)) || after === 92) {
      return false;
    }
    skipWhiteSpace.lastIndex = usingEndPos;
    var skipAfterUsing = skipWhiteSpace.exec(this.input);
    next = usingEndPos + skipAfterUsing[0].length;
    if (skipAfterUsing && lineBreak.test(this.input.slice(usingEndPos, next))) {
      return false;
    }
  }
  var ch = this.fullCharCodeAt(next);
  if (!isIdentifierStart(ch) && ch !== 92) {
    return false;
  }
  var idStart = next;
  do {
    next += ch <= 65535 ? 1 : 2;
  } while (isIdentifierChar(ch = this.fullCharCodeAt(next)));
  if (ch === 92) {
    return true;
  }
  var id = this.input.slice(idStart, next);
  if (keywordRelationalOperator.test(id) || isFor && id === "of") {
    return false;
  }
  return true;
};
pp$8.isAwaitUsing = function(isFor) {
  return this.isUsingKeyword(true, isFor);
};
pp$8.isUsing = function(isFor) {
  return this.isUsingKeyword(false, isFor);
};
pp$8.parseStatement = function(context, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;
  if (this.isLet(context)) {
    starttype = types$1._var;
    kind = "let";
  }
  switch (starttype) {
    case types$1._break:
    case types$1._continue:
      return this.parseBreakContinueStatement(node, starttype.keyword);
    case types$1._debugger:
      return this.parseDebuggerStatement(node);
    case types$1._do:
      return this.parseDoStatement(node);
    case types$1._for:
      return this.parseForStatement(node);
    case types$1._function:
      if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
        this.unexpected();
      }
      return this.parseFunctionStatement(node, false, !context);
    case types$1._class:
      if (context) {
        this.unexpected();
      }
      return this.parseClass(node, true);
    case types$1._if:
      return this.parseIfStatement(node);
    case types$1._return:
      return this.parseReturnStatement(node);
    case types$1._switch:
      return this.parseSwitchStatement(node);
    case types$1._throw:
      return this.parseThrowStatement(node);
    case types$1._try:
      return this.parseTryStatement(node);
    case types$1._const:
    case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") {
        this.unexpected();
      }
      return this.parseVarStatement(node, kind);
    case types$1._while:
      return this.parseWhileStatement(node);
    case types$1._with:
      return this.parseWithStatement(node);
    case types$1.braceL:
      return this.parseBlock(true, node);
    case types$1.semi:
      return this.parseEmptyStatement(node);
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) {
          return this.parseExpressionStatement(node, this.parseExpression());
        }
      }
      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel) {
          this.raise(this.start, "'import' and 'export' may only appear at the top level");
        }
        if (!this.inModule) {
          this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
        }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports);
    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction()) {
        if (context) {
          this.unexpected();
        }
        this.next();
        return this.parseFunctionStatement(node, true, !context);
      }
      var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
      if (usingKind) {
        if (!this.allowUsing) {
          this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script` or in the bare case statement");
        }
        if (usingKind === "await using") {
          if (!this.canAwait) {
            this.raise(this.start, "Await using cannot appear outside of async function");
          }
          this.next();
        }
        this.next();
        this.parseVar(node, false, usingKind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration");
      }
      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
        return this.parseLabeledStatement(node, maybeName, expr, context);
      } else {
        return this.parseExpressionStatement(node, expr);
      }
  }
};
pp$8.parseBreakContinueStatement = function(node, keyword) {
  var isBreak = keyword === "break";
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.label = null;
  } else if (this.type !== types$1.name) {
    this.unexpected();
  } else {
    node.label = this.parseIdent();
    this.semicolon();
  }
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) {
        break;
      }
      if (node.label && isBreak) {
        break;
      }
    }
  }
  if (i === this.labels.length) {
    this.raise(node.start, "Unsyntactic " + keyword);
  }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
};
pp$8.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement");
};
pp$8.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("do");
  this.labels.pop();
  this.expect(types$1._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6) {
    this.eat(types$1.semi);
  } else {
    this.semicolon();
  }
  return this.finishNode(node, "DoWhileStatement");
};
pp$8.parseForStatement = function(node) {
  this.next();
  var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterScope(0);
  this.expect(types$1.parenL);
  if (this.type === types$1.semi) {
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, null);
  }
  var isLet = this.isLet();
  if (this.type === types$1._var || this.type === types$1._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    return this.parseForAfterInit(node, init$1, awaitAt);
  }
  var startsWithLet = this.isContextual("let"), isForOf = false;
  var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
  if (usingKind) {
    var init$2 = this.startNode();
    this.next();
    if (usingKind === "await using") {
      if (!this.canAwait) {
        this.raise(this.start, "Await using cannot appear outside of async function");
      }
      this.next();
    }
    this.parseVar(init$2, true, usingKind);
    this.finishNode(init$2, "VariableDeclaration");
    return this.parseForAfterInit(node, init$2, awaitAt);
  }
  var containsEsc = this.containsEsc;
  var refDestructuringErrors = new DestructuringErrors();
  var initPos = this.start;
  var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
  if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (awaitAt > -1) {
      if (this.type === types$1._in) {
        this.unexpected(awaitAt);
      }
      node.await = true;
    } else if (isForOf && this.options.ecmaVersion >= 8) {
      if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
        this.unexpected();
      } else if (this.options.ecmaVersion >= 9) {
        node.await = false;
      }
    }
    if (startsWithLet && isForOf) {
      this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
    }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLValPattern(init);
    return this.parseForIn(node, init);
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseForAfterInit = function(node, init, awaitAt) {
  if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === types$1._in) {
        if (awaitAt > -1) {
          this.unexpected(awaitAt);
        }
      } else {
        node.await = awaitAt > -1;
      }
    }
    return this.parseForIn(node, init);
  }
  if (awaitAt > -1) {
    this.unexpected(awaitAt);
  }
  return this.parseFor(node, init);
};
pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
  this.next();
  return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
};
pp$8.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  node.consequent = this.parseStatement("if");
  node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
  return this.finishNode(node, "IfStatement");
};
pp$8.parseReturnStatement = function(node) {
  if (!this.allowReturn) {
    this.raise(this.start, "'return' outside of function");
  }
  this.next();
  if (this.eat(types$1.semi) || this.insertSemicolon()) {
    node.argument = null;
  } else {
    node.argument = this.parseExpression();
    this.semicolon();
  }
  return this.finishNode(node, "ReturnStatement");
};
pp$8.parseSwitchStatement = function(node) {
  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types$1.braceL);
  this.labels.push(switchLabel);
  this.enterScope(SCOPE_SWITCH);
  var cur;
  for (var sawDefault = false; this.type !== types$1.braceR; ) {
    if (this.type === types$1._case || this.type === types$1._default) {
      var isCase = this.type === types$1._case;
      if (cur) {
        this.finishNode(cur, "SwitchCase");
      }
      node.cases.push(cur = this.startNode());
      cur.consequent = [];
      this.next();
      if (isCase) {
        cur.test = this.parseExpression();
      } else {
        if (sawDefault) {
          this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
        }
        sawDefault = true;
        cur.test = null;
      }
      this.expect(types$1.colon);
    } else {
      if (!cur) {
        this.unexpected();
      }
      cur.consequent.push(this.parseStatement(null));
    }
  }
  this.exitScope();
  if (cur) {
    this.finishNode(cur, "SwitchCase");
  }
  this.next();
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement");
};
pp$8.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
    this.raise(this.lastTokEnd, "Illegal newline after throw");
  }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement");
};
var empty$1 = [];
pp$8.parseCatchClauseParam = function() {
  var param = this.parseBindingAtom();
  var simple = param.type === "Identifier";
  this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
  this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
  this.expect(types$1.parenR);
  return param;
};
pp$8.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types$1._catch) {
    var clause = this.startNode();
    this.next();
    if (this.eat(types$1.parenL)) {
      clause.param = this.parseCatchClauseParam();
    } else {
      if (this.options.ecmaVersion < 10) {
        this.unexpected();
      }
      clause.param = null;
      this.enterScope(0);
    }
    clause.body = this.parseBlock(false);
    this.exitScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer) {
    this.raise(node.start, "Missing catch or finally clause");
  }
  return this.finishNode(node, "TryStatement");
};
pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
  this.next();
  this.parseVar(node, false, kind, allowMissingInitializer);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration");
};
pp$8.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement("while");
  this.labels.pop();
  return this.finishNode(node, "WhileStatement");
};
pp$8.parseWithStatement = function(node) {
  if (this.strict) {
    this.raise(this.start, "'with' in strict mode");
  }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement("with");
  return this.finishNode(node, "WithStatement");
};
pp$8.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement");
};
pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
  for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1) {
    var label = list[i$1];
    if (label.name === maybeName) {
      this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    }
  }
  var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this.labels[i];
    if (label$1.statementStart === node.start) {
      label$1.statementStart = this.start;
      label$1.kind = kind;
    } else {
      break;
    }
  }
  this.labels.push({ name: maybeName, kind, statementStart: this.start });
  node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement");
};
pp$8.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement");
};
pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
  if (createNewLexicalScope === void 0) createNewLexicalScope = true;
  if (node === void 0) node = this.startNode();
  node.body = [];
  this.expect(types$1.braceL);
  if (createNewLexicalScope) {
    this.enterScope(0);
  }
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  if (exitStrict) {
    this.strict = false;
  }
  this.next();
  if (createNewLexicalScope) {
    this.exitScope();
  }
  return this.finishNode(node, "BlockStatement");
};
pp$8.parseFor = function(node, init) {
  node.init = init;
  this.expect(types$1.semi);
  node.test = this.type === types$1.semi ? null : this.parseExpression();
  this.expect(types$1.semi);
  node.update = this.type === types$1.parenR ? null : this.parseExpression();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, "ForStatement");
};
pp$8.parseForIn = function(node, init) {
  var isForIn = this.type === types$1._in;
  this.next();
  if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
    this.raise(
      init.start,
      (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer"
    );
  }
  node.left = init;
  node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types$1.parenR);
  node.body = this.parseStatement("for");
  this.exitScope();
  this.labels.pop();
  return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
};
pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
  node.declarations = [];
  node.kind = kind;
  for (; ; ) {
    var decl = this.startNode();
    this.parseVarId(decl, kind);
    if (this.eat(types$1.eq)) {
      decl.init = this.parseMaybeAssign(isFor);
    } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      this.unexpected();
    } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
      this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
    } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
      this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
    if (!this.eat(types$1.comma)) {
      break;
    }
  }
  return node;
};
pp$8.parseVarId = function(decl, kind) {
  decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
  this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
};
var FUNC_STATEMENT = 1;
var FUNC_HANGING_STATEMENT = 2;
var FUNC_NULLABLE_ID = 4;
pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
    if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
      this.unexpected();
    }
    node.generator = this.eat(types$1.star);
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  if (statement & FUNC_STATEMENT) {
    node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
    if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
      this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
    }
  }
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(node.async, node.generator));
  if (!(statement & FUNC_STATEMENT)) {
    node.id = this.type === types$1.name ? this.parseIdent() : null;
  }
  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
};
pp$8.parseFunctionParams = function(node) {
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};
pp$8.parseClass = function(node, isStatement) {
  this.next();
  var oldStrict = this.strict;
  this.strict = true;
  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var privateNameMap = this.enterClassBody();
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types$1.braceL);
  while (this.type !== types$1.braceR) {
    var element = this.parseClassElement(node.superClass !== null);
    if (element) {
      classBody.body.push(element);
      if (element.type === "MethodDefinition" && element.kind === "constructor") {
        if (hadConstructor) {
          this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
        }
        hadConstructor = true;
      } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
        this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
      }
    }
  }
  this.strict = oldStrict;
  this.next();
  node.body = this.finishNode(classBody, "ClassBody");
  this.exitClassBody();
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
};
pp$8.parseClassElement = function(constructorAllowsSuper) {
  if (this.eat(types$1.semi)) {
    return null;
  }
  var ecmaVersion = this.options.ecmaVersion;
  var node = this.startNode();
  var keyName = "";
  var isGenerator = false;
  var isAsync = false;
  var kind = "method";
  var isStatic = false;
  if (this.eatContextual("static")) {
    if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
      this.parseClassStaticBlock(node);
      return node;
    }
    if (this.isClassElementNameStart() || this.type === types$1.star) {
      isStatic = true;
    } else {
      keyName = "static";
    }
  }
  node.static = isStatic;
  if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
    if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
      isAsync = true;
    } else {
      keyName = "async";
    }
  }
  if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
    isGenerator = true;
  }
  if (!keyName && !isAsync && !isGenerator) {
    var lastValue = this.value;
    if (this.eatContextual("get") || this.eatContextual("set")) {
      if (this.isClassElementNameStart()) {
        kind = lastValue;
      } else {
        keyName = lastValue;
      }
    }
  }
  if (keyName) {
    node.computed = false;
    node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
    node.key.name = keyName;
    this.finishNode(node.key, "Identifier");
  } else {
    this.parseClassElementName(node);
  }
  if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
    var isConstructor = !node.static && checkKeyName(node, "constructor");
    var allowsDirectSuper = isConstructor && constructorAllowsSuper;
    if (isConstructor && kind !== "method") {
      this.raise(node.key.start, "Constructor can't have get/set modifier");
    }
    node.kind = isConstructor ? "constructor" : kind;
    this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
  } else {
    this.parseClassField(node);
  }
  return node;
};
pp$8.isClassElementNameStart = function() {
  return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
};
pp$8.parseClassElementName = function(element) {
  if (this.type === types$1.privateId) {
    if (this.value === "constructor") {
      this.raise(this.start, "Classes can't have an element named '#constructor'");
    }
    element.computed = false;
    element.key = this.parsePrivateIdent();
  } else {
    this.parsePropertyName(element);
  }
};
pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
  var key = method.key;
  if (method.kind === "constructor") {
    if (isGenerator) {
      this.raise(key.start, "Constructor can't be a generator");
    }
    if (isAsync) {
      this.raise(key.start, "Constructor can't be an async method");
    }
  } else if (method.static && checkKeyName(method, "prototype")) {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }
  var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
  if (method.kind === "get" && value.params.length !== 0) {
    this.raiseRecoverable(value.start, "getter should have no params");
  }
  if (method.kind === "set" && value.params.length !== 1) {
    this.raiseRecoverable(value.start, "setter should have exactly one param");
  }
  if (method.kind === "set" && value.params[0].type === "RestElement") {
    this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
  }
  return this.finishNode(method, "MethodDefinition");
};
pp$8.parseClassField = function(field) {
  if (checkKeyName(field, "constructor")) {
    this.raise(field.key.start, "Classes can't have a field named 'constructor'");
  } else if (field.static && checkKeyName(field, "prototype")) {
    this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
  }
  if (this.eat(types$1.eq)) {
    this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
    field.value = this.parseMaybeAssign();
    this.exitScope();
  } else {
    field.value = null;
  }
  this.semicolon();
  return this.finishNode(field, "PropertyDefinition");
};
pp$8.parseClassStaticBlock = function(node) {
  node.body = [];
  var oldLabels = this.labels;
  this.labels = [];
  this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
  while (this.type !== types$1.braceR) {
    var stmt = this.parseStatement(null);
    node.body.push(stmt);
  }
  this.next();
  this.exitScope();
  this.labels = oldLabels;
  return this.finishNode(node, "StaticBlock");
};
pp$8.parseClassId = function(node, isStatement) {
  if (this.type === types$1.name) {
    node.id = this.parseIdent();
    if (isStatement) {
      this.checkLValSimple(node.id, BIND_LEXICAL, false);
    }
  } else {
    if (isStatement === true) {
      this.unexpected();
    }
    node.id = null;
  }
};
pp$8.parseClassSuper = function(node) {
  node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
};
pp$8.enterClassBody = function() {
  var element = { declared: /* @__PURE__ */ Object.create(null), used: [] };
  this.privateNameStack.push(element);
  return element.declared;
};
pp$8.exitClassBody = function() {
  var ref2 = this.privateNameStack.pop();
  var declared = ref2.declared;
  var used = ref2.used;
  if (!this.options.checkPrivateFields) {
    return;
  }
  var len = this.privateNameStack.length;
  var parent = len === 0 ? null : this.privateNameStack[len - 1];
  for (var i = 0; i < used.length; ++i) {
    var id = used[i];
    if (!hasOwn(declared, id.name)) {
      if (parent) {
        parent.used.push(id);
      } else {
        this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
      }
    }
  }
};
function isPrivateNameConflicted(privateNameMap, element) {
  var name = element.key.name;
  var curr = privateNameMap[name];
  var next = "true";
  if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
    next = (element.static ? "s" : "i") + element.kind;
  }
  if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
    privateNameMap[name] = "true";
    return false;
  } else if (!curr) {
    privateNameMap[name] = next;
    return false;
  } else {
    return true;
  }
}
__name(isPrivateNameConflicted, "isPrivateNameConflicted");
function checkKeyName(node, name) {
  var computed = node.computed;
  var key = node.key;
  return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
}
__name(checkKeyName, "checkKeyName");
pp$8.parseExportAllDeclaration = function(node, exports) {
  if (this.options.ecmaVersion >= 11) {
    if (this.eatContextual("as")) {
      node.exported = this.parseModuleExportName();
      this.checkExport(exports, node.exported, this.lastTokStart);
    } else {
      node.exported = null;
    }
  }
  this.expectContextual("from");
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.source = this.parseExprAtom();
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ExportAllDeclaration");
};
pp$8.parseExport = function(node, exports) {
  this.next();
  if (this.eat(types$1.star)) {
    return this.parseExportAllDeclaration(node, exports);
  }
  if (this.eat(types$1._default)) {
    this.checkExport(exports, "default", this.lastTokStart);
    node.declaration = this.parseExportDefaultDeclaration();
    return this.finishNode(node, "ExportDefaultDeclaration");
  }
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseExportDeclaration(node);
    if (node.declaration.type === "VariableDeclaration") {
      this.checkVariableExport(exports, node.declaration.declarations);
    } else {
      this.checkExport(exports, node.declaration.id, node.declaration.id.start);
    }
    node.specifiers = [];
    node.source = null;
    if (this.options.ecmaVersion >= 16) {
      node.attributes = [];
    }
  } else {
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types$1.string) {
        this.unexpected();
      }
      node.source = this.parseExprAtom();
      if (this.options.ecmaVersion >= 16) {
        node.attributes = this.parseWithClause();
      }
    } else {
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        var spec = list[i];
        this.checkUnreserved(spec.local);
        this.checkLocalExport(spec.local);
        if (spec.local.type === "Literal") {
          this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
        }
      }
      node.source = null;
      if (this.options.ecmaVersion >= 16) {
        node.attributes = [];
      }
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration");
};
pp$8.parseExportDeclaration = function(node) {
  return this.parseStatement(null);
};
pp$8.parseExportDefaultDeclaration = function() {
  var isAsync;
  if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
    var fNode = this.startNode();
    this.next();
    if (isAsync) {
      this.next();
    }
    return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
  } else if (this.type === types$1._class) {
    var cNode = this.startNode();
    return this.parseClass(cNode, "nullableID");
  } else {
    var declaration = this.parseMaybeAssign();
    this.semicolon();
    return declaration;
  }
};
pp$8.checkExport = function(exports, name, pos) {
  if (!exports) {
    return;
  }
  if (typeof name !== "string") {
    name = name.type === "Identifier" ? name.name : name.value;
  }
  if (hasOwn(exports, name)) {
    this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
  }
  exports[name] = true;
};
pp$8.checkPatternExport = function(exports, pat) {
  var type = pat.type;
  if (type === "Identifier") {
    this.checkExport(exports, pat, pat.start);
  } else if (type === "ObjectPattern") {
    for (var i = 0, list = pat.properties; i < list.length; i += 1) {
      var prop = list[i];
      this.checkPatternExport(exports, prop);
    }
  } else if (type === "ArrayPattern") {
    for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];
      if (elt) {
        this.checkPatternExport(exports, elt);
      }
    }
  } else if (type === "Property") {
    this.checkPatternExport(exports, pat.value);
  } else if (type === "AssignmentPattern") {
    this.checkPatternExport(exports, pat.left);
  } else if (type === "RestElement") {
    this.checkPatternExport(exports, pat.argument);
  }
};
pp$8.checkVariableExport = function(exports, decls) {
  if (!exports) {
    return;
  }
  for (var i = 0, list = decls; i < list.length; i += 1) {
    var decl = list[i];
    this.checkPatternExport(exports, decl.id);
  }
};
pp$8.shouldParseExportStatement = function() {
  return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
};
pp$8.parseExportSpecifier = function(exports) {
  var node = this.startNode();
  node.local = this.parseModuleExportName();
  node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
  this.checkExport(
    exports,
    node.exported,
    node.exported.start
  );
  return this.finishNode(node, "ExportSpecifier");
};
pp$8.parseExportSpecifiers = function(exports) {
  var nodes = [], first = true;
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseExportSpecifier(exports));
  }
  return nodes;
};
pp$8.parseImport = function(node) {
  this.next();
  if (this.type === types$1.string) {
    node.specifiers = empty$1;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
  }
  if (this.options.ecmaVersion >= 16) {
    node.attributes = this.parseWithClause();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration");
};
pp$8.parseImportSpecifier = function() {
  var node = this.startNode();
  node.imported = this.parseModuleExportName();
  if (this.eatContextual("as")) {
    node.local = this.parseIdent();
  } else {
    this.checkUnreserved(node.imported);
    node.local = node.imported;
  }
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportSpecifier");
};
pp$8.parseImportDefaultSpecifier = function() {
  var node = this.startNode();
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportDefaultSpecifier");
};
pp$8.parseImportNamespaceSpecifier = function() {
  var node = this.startNode();
  this.next();
  this.expectContextual("as");
  node.local = this.parseIdent();
  this.checkLValSimple(node.local, BIND_LEXICAL);
  return this.finishNode(node, "ImportNamespaceSpecifier");
};
pp$8.parseImportSpecifiers = function() {
  var nodes = [], first = true;
  if (this.type === types$1.name) {
    nodes.push(this.parseImportDefaultSpecifier());
    if (!this.eat(types$1.comma)) {
      return nodes;
    }
  }
  if (this.type === types$1.star) {
    nodes.push(this.parseImportNamespaceSpecifier());
    return nodes;
  }
  this.expect(types$1.braceL);
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    nodes.push(this.parseImportSpecifier());
  }
  return nodes;
};
pp$8.parseWithClause = function() {
  var nodes = [];
  if (!this.eat(types$1._with)) {
    return nodes;
  }
  this.expect(types$1.braceL);
  var attributeKeys = {};
  var first = true;
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var attr = this.parseImportAttribute();
    var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
    if (hasOwn(attributeKeys, keyName)) {
      this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
    }
    attributeKeys[keyName] = true;
    nodes.push(attr);
  }
  return nodes;
};
pp$8.parseImportAttribute = function() {
  var node = this.startNode();
  node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  this.expect(types$1.colon);
  if (this.type !== types$1.string) {
    this.unexpected();
  }
  node.value = this.parseExprAtom();
  return this.finishNode(node, "ImportAttribute");
};
pp$8.parseModuleExportName = function() {
  if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
    var stringLiteral = this.parseLiteral(this.value);
    if (loneSurrogate.test(stringLiteral.value)) {
      this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
    }
    return stringLiteral;
  }
  return this.parseIdent(true);
};
pp$8.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$8.isDirectiveCandidate = function(statement) {
  return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
  (this.input[statement.start] === '"' || this.input[statement.start] === "'");
};
var pp$7 = Parser.prototype;
pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await") {
          this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
        }
        break;
      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break;
      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        for (var i = 0, list = node.properties; i < list.length; i += 1) {
          var prop = list[i];
          this.toAssignable(prop, isBinding);
          if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break;
      case "Property":
        if (node.kind !== "init") {
          this.raise(node.key.start, "Object pattern can't contain getter or setter");
        }
        this.toAssignable(node.value, isBinding);
        break;
      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) {
          this.checkPatternErrors(refDestructuringErrors, true);
        }
        this.toAssignableList(node.elements, isBinding);
        break;
      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern") {
          this.raise(node.argument.start, "Rest elements cannot have a default value");
        }
        break;
      case "AssignmentExpression":
        if (node.operator !== "=") {
          this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
        }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break;
      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break;
      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break;
      case "MemberExpression":
        if (!isBinding) {
          break;
        }
      default:
        this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) {
    this.checkPatternErrors(refDestructuringErrors, true);
  }
  return node;
};
pp$7.toAssignableList = function(exprList, isBinding) {
  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) {
      this.toAssignable(elt, isBinding);
    }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
      this.unexpected(last.argument.start);
    }
  }
  return exprList;
};
pp$7.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement");
};
pp$7.parseRestBinding = function() {
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
    this.unexpected();
  }
  node.argument = this.parseBindingAtom();
  return this.finishNode(node, "RestElement");
};
pp$7.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern");
      case types$1.braceL:
        return this.parseObj(true);
    }
  }
  return this.parseIdent();
};
pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) {
      first = false;
    } else {
      this.expect(types$1.comma);
    }
    if (allowEmpty && this.type === types$1.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this.afterTrailingComma(close)) {
      break;
    } else if (this.type === types$1.ellipsis) {
      var rest = this.parseRestBinding();
      this.parseBindingListItem(rest);
      elts.push(rest);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      this.expect(close);
      break;
    } else {
      elts.push(this.parseAssignableListItem(allowModifiers));
    }
  }
  return elts;
};
pp$7.parseAssignableListItem = function(allowModifiers) {
  var elem = this.parseMaybeDefault(this.start, this.startLoc);
  this.parseBindingListItem(elem);
  return elem;
};
pp$7.parseBindingListItem = function(param) {
  return param;
};
pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
    return left;
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern");
};
pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0) bindingType = BIND_NONE;
  var isBind = bindingType !== BIND_NONE;
  switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
        this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
      }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let") {
          this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
        }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name)) {
            this.raiseRecoverable(expr.start, "Argument name clash");
          }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) {
          this.declareName(expr.name, bindingType, expr.start);
        }
      }
      break;
    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break;
    case "MemberExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding member expression");
      }
      break;
    case "ParenthesizedExpression":
      if (isBind) {
        this.raiseRecoverable(expr.start, "Binding parenthesized expression");
      }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes);
    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
  }
};
pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0) bindingType = BIND_NONE;
  switch (expr.type) {
    case "ObjectPattern":
      for (var i = 0, list = expr.properties; i < list.length; i += 1) {
        var prop = list[i];
        this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break;
    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];
        if (elem) {
          this.checkLValInnerPattern(elem, bindingType, checkClashes);
        }
      }
      break;
    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
  }
};
pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
  if (bindingType === void 0) bindingType = BIND_NONE;
  switch (expr.type) {
    case "Property":
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break;
    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break;
    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break;
    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
  }
};
var TokContext = /* @__PURE__ */ __name(function TokContext2(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
}, "TokContext");
var types = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function(p) {
    return p.tryReadTemplateToken();
  }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};
var pp$6 = Parser.prototype;
pp$6.initialContext = function() {
  return [types.b_stat];
};
pp$6.curContext = function() {
  return this.context[this.context.length - 1];
};
pp$6.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types.f_expr || parent === types.f_stat) {
    return true;
  }
  if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
    return !parent.isExpr;
  }
  if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
    return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  }
  if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
    return true;
  }
  if (prevType === types$1.braceL) {
    return parent === types.b_stat;
  }
  if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
    return false;
  }
  return !this.exprAllowed;
};
pp$6.inGeneratorContext = function() {
  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this.context[i];
    if (context.token === "function") {
      return context.generator;
    }
  }
  return false;
};
pp$6.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType === types$1.dot) {
    this.exprAllowed = false;
  } else if (update = type.updateContext) {
    update.call(this, prevType);
  } else {
    this.exprAllowed = type.beforeExpr;
  }
};
pp$6.overrideContext = function(tokenCtx) {
  if (this.curContext() !== tokenCtx) {
    this.context[this.context.length - 1] = tokenCtx;
  }
};
types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
  if (this.context.length === 1) {
    this.exprAllowed = true;
    return;
  }
  var out = this.context.pop();
  if (out === types.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};
types$1.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
  this.exprAllowed = true;
};
types$1.dollarBraceL.updateContext = function() {
  this.context.push(types.b_tmpl);
  this.exprAllowed = true;
};
types$1.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
  this.context.push(statementParens ? types.p_stat : types.p_expr);
  this.exprAllowed = true;
};
types$1.incDec.updateContext = function() {
};
types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
    this.context.push(types.f_expr);
  } else {
    this.context.push(types.f_stat);
  }
  this.exprAllowed = false;
};
types$1.colon.updateContext = function() {
  if (this.curContext().token === "function") {
    this.context.pop();
  }
  this.exprAllowed = true;
};
types$1.backQuote.updateContext = function() {
  if (this.curContext() === types.q_tmpl) {
    this.context.pop();
  } else {
    this.context.push(types.q_tmpl);
  }
  this.exprAllowed = false;
};
types$1.star.updateContext = function(prevType) {
  if (prevType === types$1._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types.f_expr) {
      this.context[index] = types.f_expr_gen;
    } else {
      this.context[index] = types.f_gen;
    }
  }
  this.exprAllowed = true;
};
types$1.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
    if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
      allowed = true;
    }
  }
  this.exprAllowed = allowed;
};
var pp$5 = Parser.prototype;
pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
    return;
  }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
    return;
  }
  var key = prop.key;
  var name;
  switch (key.type) {
    case "Identifier":
      name = key.name;
      break;
    case "Literal":
      name = String(key.value);
      break;
    default:
      return;
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors) {
          if (refDestructuringErrors.doubleProto < 0) {
            refDestructuringErrors.doubleProto = key.start;
          }
        } else {
          this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
        }
      }
      propHash.proto = true;
    }
    return;
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition) {
      this.raiseRecoverable(key.start, "Redefinition of property");
    }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};
pp$5.parseExpression = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
  if (this.type === types$1.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types$1.comma)) {
      node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors));
    }
    return this.finishNode(node, "SequenceExpression");
  }
  return expr;
};
pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
  if (this.isContextual("yield")) {
    if (this.inGenerator) {
      return this.parseYield(forInit);
    } else {
      this.exprAllowed = false;
    }
  }
  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    oldDoubleProto = refDestructuringErrors.doubleProto;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors();
    ownDestructuringErrors = true;
  }
  var startPos = this.start, startLoc = this.startLoc;
  if (this.type === types$1.parenL || this.type === types$1.name) {
    this.potentialArrowAt = this.start;
    this.potentialArrowInForAwait = forInit === "await";
  }
  var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
  if (afterLeftParse) {
    left = afterLeftParse.call(this, left, startPos, startLoc);
  }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    if (this.type === types$1.eq) {
      left = this.toAssignable(left, false, refDestructuringErrors);
    }
    if (!ownDestructuringErrors) {
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
    }
    if (refDestructuringErrors.shorthandAssign >= left.start) {
      refDestructuringErrors.shorthandAssign = -1;
    }
    if (this.type === types$1.eq) {
      this.checkLValPattern(left);
    } else {
      this.checkLValSimple(left);
    }
    node.left = left;
    this.next();
    node.right = this.parseMaybeAssign(forInit);
    if (oldDoubleProto > -1) {
      refDestructuringErrors.doubleProto = oldDoubleProto;
    }
    return this.finishNode(node, "AssignmentExpression");
  } else {
    if (ownDestructuringErrors) {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
  }
  if (oldParenAssign > -1) {
    refDestructuringErrors.parenthesizedAssign = oldParenAssign;
  }
  if (oldTrailingComma > -1) {
    refDestructuringErrors.trailingComma = oldTrailingComma;
  }
  return left;
};
pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(forInit, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  if (this.eat(types$1.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types$1.colon);
    node.alternate = this.parseMaybeAssign(forInit);
    return this.finishNode(node, "ConditionalExpression");
  }
  return expr;
};
pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
  if (this.checkExpressionErrors(refDestructuringErrors)) {
    return expr;
  }
  return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
};
pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
  var prec = this.type.binop;
  if (prec != null && (!forInit || this.type !== types$1._in)) {
    if (prec > minPrec) {
      var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
      var coalesce = this.type === types$1.coalesce;
      if (coalesce) {
        prec = types$1.logicalAND.binop;
      }
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
      if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
        this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
      }
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
    }
  }
  return left;
};
pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  if (right.type === "PrivateIdentifier") {
    this.raise(right.start, "Private identifier can only be left side of binary expression");
  }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
};
pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.isContextual("await") && this.canAwait) {
    expr = this.parseAwait(forInit);
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types$1.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true, update, forInit);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) {
      this.checkLValSimple(node.argument);
    } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
    } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
      this.raiseRecoverable(node.start, "Private fields can not be deleted");
    } else {
      sawUnary = true;
    }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else if (!sawUnary && this.type === types$1.privateId) {
    if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
      this.unexpected();
    }
    expr = this.parsePrivateIdent();
    if (this.type !== types$1._in) {
      this.unexpected();
    }
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.operator = this.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this.checkLValSimple(expr);
      this.next();
      expr = this.finishNode(node$1, "UpdateExpression");
    }
  }
  if (!incDec && this.eat(types$1.starstar)) {
    if (sawUnary) {
      this.unexpected(this.lastTokStart);
    } else {
      return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
    }
  } else {
    return expr;
  }
};
function isLocalVariableAccess(node) {
  return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
}
__name(isLocalVariableAccess, "isLocalVariableAccess");
function isPrivateFieldAccess(node) {
  return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
}
__name(isPrivateFieldAccess, "isPrivateFieldAccess");
pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors, forInit);
  if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
    return expr;
  }
  var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) {
      refDestructuringErrors.parenthesizedAssign = -1;
    }
    if (refDestructuringErrors.parenthesizedBind >= result.start) {
      refDestructuringErrors.parenthesizedBind = -1;
    }
    if (refDestructuringErrors.trailingComma >= result.start) {
      refDestructuringErrors.trailingComma = -1;
    }
  }
  return result;
};
pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
  var optionalChained = false;
  while (true) {
    var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
    if (element.optional) {
      optionalChained = true;
    }
    if (element === base || element.type === "ArrowFunctionExpression") {
      if (optionalChained) {
        var chainNode = this.startNodeAt(startPos, startLoc);
        chainNode.expression = element;
        element = this.finishNode(chainNode, "ChainExpression");
      }
      return element;
    }
    base = element;
  }
};
pp$5.shouldParseAsyncArrow = function() {
  return !this.canInsertSemicolon() && this.eat(types$1.arrow);
};
pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
};
pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
  var optionalSupported = this.options.ecmaVersion >= 11;
  var optional = optionalSupported && this.eat(types$1.questionDot);
  if (noCalls && optional) {
    this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
  }
  var computed = this.eat(types$1.bracketL);
  if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.object = base;
    if (computed) {
      node.property = this.parseExpression();
      this.expect(types$1.bracketR);
    } else if (this.type === types$1.privateId && base.type !== "Super") {
      node.property = this.parsePrivateIdent();
    } else {
      node.property = this.parseIdent(this.options.allowReserved !== "never");
    }
    node.computed = !!computed;
    if (optionalSupported) {
      node.optional = optional;
    }
    base = this.finishNode(node, "MemberExpression");
  } else if (!noCalls && this.eat(types$1.parenL)) {
    var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
    if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      if (this.awaitIdentPos > 0) {
        this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
      }
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      this.awaitIdentPos = oldAwaitIdentPos;
      return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
    var node$1 = this.startNodeAt(startPos, startLoc);
    node$1.callee = base;
    node$1.arguments = exprList;
    if (optionalSupported) {
      node$1.optional = optional;
    }
    base = this.finishNode(node$1, "CallExpression");
  } else if (this.type === types$1.backQuote) {
    if (optional || optionalChained) {
      this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
    }
    var node$2 = this.startNodeAt(startPos, startLoc);
    node$2.tag = base;
    node$2.quasi = this.parseTemplate({ isTagged: true });
    base = this.finishNode(node$2, "TaggedTemplateExpression");
  }
  return base;
};
pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
  if (this.type === types$1.slash) {
    this.readRegexp();
  }
  var node, canBeArrow = this.potentialArrowAt === this.start;
  switch (this.type) {
    case types$1._super:
      if (!this.allowSuper) {
        this.raise(this.start, "'super' keyword outside a method");
      }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper) {
        this.raise(node.start, "super() call outside constructor of a subclass");
      }
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
        this.unexpected();
      }
      return this.finishNode(node, "Super");
    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression");
    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow)) {
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
        }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
            this.unexpected();
          }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
        }
      }
      return id;
    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = { pattern: value.pattern, flags: value.flags };
      return node;
    case types$1.num:
    case types$1.string:
      return this.parseLiteral(this.value);
    case types$1._null:
    case types$1._true:
    case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal");
    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
          refDestructuringErrors.parenthesizedAssign = start;
        }
        if (refDestructuringErrors.parenthesizedBind < 0) {
          refDestructuringErrors.parenthesizedBind = start;
        }
      }
      return expr;
    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression");
    case types$1.braceL:
      this.overrideContext(types.b_expr);
      return this.parseObj(false, refDestructuringErrors);
    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0);
    case types$1._class:
      return this.parseClass(this.startNode(), false);
    case types$1._new:
      return this.parseNew();
    case types$1.backQuote:
      return this.parseTemplate();
    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew);
      } else {
        return this.unexpected();
      }
    default:
      return this.parseExprAtomDefault();
  }
};
pp$5.parseExprAtomDefault = function() {
  this.unexpected();
};
pp$5.parseExprImport = function(forNew) {
  var node = this.startNode();
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword import");
  }
  this.next();
  if (this.type === types$1.parenL && !forNew) {
    return this.parseDynamicImport(node);
  } else if (this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "import";
    node.meta = this.finishNode(meta, "Identifier");
    return this.parseImportMeta(node);
  } else {
    this.unexpected();
  }
};
pp$5.parseDynamicImport = function(node) {
  this.next();
  node.source = this.parseMaybeAssign();
  if (this.options.ecmaVersion >= 16) {
    if (!this.eat(types$1.parenR)) {
      this.expect(types$1.comma);
      if (!this.afterTrailingComma(types$1.parenR)) {
        node.options = this.parseMaybeAssign();
        if (!this.eat(types$1.parenR)) {
          this.expect(types$1.comma);
          if (!this.afterTrailingComma(types$1.parenR)) {
            this.unexpected();
          }
        }
      } else {
        node.options = null;
      }
    } else {
      node.options = null;
    }
  } else {
    if (!this.eat(types$1.parenR)) {
      var errorPos = this.start;
      if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
        this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
      } else {
        this.unexpected(errorPos);
      }
    }
  }
  return this.finishNode(node, "ImportExpression");
};
pp$5.parseImportMeta = function(node) {
  this.next();
  var containsEsc = this.containsEsc;
  node.property = this.parseIdent(true);
  if (node.property.name !== "meta") {
    this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
  }
  if (containsEsc) {
    this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
  }
  if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
    this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
  }
  return this.finishNode(node, "MetaProperty");
};
pp$5.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
    node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
  }
  this.next();
  return this.finishNode(node, "Literal");
};
pp$5.parseParenExpression = function() {
  this.expect(types$1.parenL);
  var val = this.parseExpression();
  this.expect(types$1.parenR);
  return val;
};
pp$5.shouldParseArrow = function(exprList) {
  return !this.canInsertSemicolon();
};
pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();
    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    while (this.type !== types$1.parenR) {
      first ? first = false : this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
        lastIsComma = true;
        break;
      } else if (this.type === types$1.ellipsis) {
        spreadStart = this.start;
        exprList.push(this.parseParenItem(this.parseRestBinding()));
        if (this.type === types$1.comma) {
          this.raiseRecoverable(
            this.start,
            "Comma is not permitted after the rest element"
          );
        }
        break;
      } else {
        exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
      }
    }
    var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
    this.expect(types$1.parenR);
    if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
    }
    if (!exprList.length || lastIsComma) {
      this.unexpected(this.lastTokStart);
    }
    if (spreadStart) {
      this.unexpected(spreadStart);
    }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;
    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }
  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression");
  } else {
    return val;
  }
};
pp$5.parseParenItem = function(item) {
  return item;
};
pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
};
var empty = [];
pp$5.parseNew = function() {
  if (this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword new");
  }
  var node = this.startNode();
  this.next();
  if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
    var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
    meta.name = "new";
    node.meta = this.finishNode(meta, "Identifier");
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target") {
      this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
    }
    if (containsEsc) {
      this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
    }
    if (!this.allowNewDotTarget) {
      this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
    }
    return this.finishNode(node, "MetaProperty");
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
  if (this.eat(types$1.parenL)) {
    node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
  } else {
    node.arguments = empty;
  }
  return this.finishNode(node, "NewExpression");
};
pp$5.parseTemplateElement = function(ref2) {
  var isTagged = ref2.isTagged;
  var elem = this.startNode();
  if (this.type === types$1.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value.replace(/\r\n?/g, "\n"),
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types$1.backQuote;
  return this.finishNode(elem, "TemplateElement");
};
pp$5.parseTemplate = function(ref2) {
  if (ref2 === void 0) ref2 = {};
  var isTagged = ref2.isTagged;
  if (isTagged === void 0) isTagged = false;
  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({ isTagged });
  node.quasis = [curElt];
  while (!curElt.tail) {
    if (this.type === types$1.eof) {
      this.raise(this.pos, "Unterminated template literal");
    }
    this.expect(types$1.dollarBraceL);
    node.expressions.push(this.parseExpression());
    this.expect(types$1.braceR);
    node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral");
};
pp$5.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
};
pp$5.parseObj = function(isPattern, refDestructuringErrors) {
  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types$1.braceR)) {
    if (!first) {
      this.expect(types$1.comma);
      if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
        break;
      }
    } else {
      first = false;
    }
    var prop = this.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) {
      this.checkPropClash(prop, propHash, refDestructuringErrors);
    }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
};
pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types$1.comma) {
        this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement");
    }
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    return this.finishNode(prop, "SpreadElement");
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern) {
      isGenerator = this.eat(types$1.star);
    }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
    this.parsePropertyName(prop);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property");
};
pp$5.parseGetterSetter = function(prop) {
  var kind = prop.key.name;
  this.parsePropertyName(prop);
  prop.value = this.parseMethod(false);
  prop.kind = kind;
  var paramCount = prop.kind === "get" ? 0 : 1;
  if (prop.value.params.length !== paramCount) {
    var start = prop.value.start;
    if (prop.kind === "get") {
      this.raiseRecoverable(start, "getter should have no params");
    } else {
      this.raiseRecoverable(start, "setter should have exactly one param");
    }
  } else {
    if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
      this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
    }
  }
};
pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types$1.colon) {
    this.unexpected();
  }
  if (this.eat(types$1.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
    if (isPattern) {
      this.unexpected();
    }
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
    prop.kind = "init";
  } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.parseGetterSetter(prop);
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    if (isGenerator || isAsync) {
      this.unexpected();
    }
    this.checkUnreserved(prop.key);
    if (prop.key.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = startPos;
    }
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else if (this.type === types$1.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0) {
        refDestructuringErrors.shorthandAssign = this.start;
      }
      prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
    } else {
      prop.value = this.copyNode(prop.key);
    }
    prop.kind = "init";
    prop.shorthand = true;
  } else {
    this.unexpected();
  }
};
pp$5.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types$1.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types$1.bracketR);
      return prop.key;
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
};
pp$5.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = node.expression = false;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = false;
  }
};
pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
  var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.initFunction(node);
  if (this.options.ecmaVersion >= 6) {
    node.generator = isGenerator;
  }
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
  this.expect(types$1.parenL);
  node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false, true, false);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "FunctionExpression");
};
pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
  var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
  this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8) {
    node.async = !!isAsync;
  }
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.awaitIdentPos = 0;
  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true, false, forInit);
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.awaitIdentPos = oldAwaitIdentPos;
  return this.finishNode(node, "ArrowFunctionExpression");
};
pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
  var isExpression = isArrowFunction && this.type !== types$1.braceL;
  var oldStrict = this.strict, useStrict = false;
  if (isExpression) {
    node.body = this.parseMaybeAssign(forInit);
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      if (useStrict && nonSimple) {
        this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
      }
    }
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) {
      this.strict = true;
    }
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
    if (this.strict && node.id) {
      this.checkLValSimple(node.id, BIND_OUTSIDE);
    }
    node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitScope();
};
pp$5.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1) {
    var param = list[i];
    if (param.type !== "Identifier") {
      return false;
    }
  }
  return true;
};
pp$5.checkParams = function(node, allowDuplicates) {
  var nameHash = /* @__PURE__ */ Object.create(null);
  for (var i = 0, list = node.params; i < list.length; i += 1) {
    var param = list[i];
    this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
  }
};
pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this.expect(types$1.comma);
      if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      }
    } else {
      first = false;
    }
    var elt = void 0;
    if (allowEmpty && this.type === types$1.comma) {
      elt = null;
    } else if (this.type === types$1.ellipsis) {
      elt = this.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
    } else {
      elt = this.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts;
};
pp$5.checkUnreserved = function(ref2) {
  var start = ref2.start;
  var end = ref2.end;
  var name = ref2.name;
  if (this.inGenerator && name === "yield") {
    this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
  }
  if (this.inAsync && name === "await") {
    this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
  }
  if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
    this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
  }
  if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
    this.raise(start, "Cannot use " + name + " in class static initialization block");
  }
  if (this.keywords.test(name)) {
    this.raise(start, "Unexpected keyword '" + name + "'");
  }
  if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
    return;
  }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await") {
      this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
    }
    this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
  }
};
pp$5.parseIdent = function(liberal) {
  var node = this.parseIdentNode();
  this.next(!!liberal);
  this.finishNode(node, "Identifier");
  if (!liberal) {
    this.checkUnreserved(node);
    if (node.name === "await" && !this.awaitIdentPos) {
      this.awaitIdentPos = node.start;
    }
  }
  return node;
};
pp$5.parseIdentNode = function() {
  var node = this.startNode();
  if (this.type === types$1.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;
    if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
    this.type = types$1.name;
  } else {
    this.unexpected();
  }
  return node;
};
pp$5.parsePrivateIdent = function() {
  var node = this.startNode();
  if (this.type === types$1.privateId) {
    node.name = this.value;
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "PrivateIdentifier");
  if (this.options.checkPrivateFields) {
    if (this.privateNameStack.length === 0) {
      this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
    } else {
      this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
    }
  }
  return node;
};
pp$5.parseYield = function(forInit) {
  if (!this.yieldPos) {
    this.yieldPos = this.start;
  }
  var node = this.startNode();
  this.next();
  if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types$1.star);
    node.argument = this.parseMaybeAssign(forInit);
  }
  return this.finishNode(node, "YieldExpression");
};
pp$5.parseAwait = function(forInit) {
  if (!this.awaitPos) {
    this.awaitPos = this.start;
  }
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true, false, forInit);
  return this.finishNode(node, "AwaitExpression");
};
var pp$4 = Parser.prototype;
pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  if (this.sourceFile) {
    message += " in " + this.sourceFile;
  }
  var err = new SyntaxError(message);
  err.pos = pos;
  err.loc = loc;
  err.raisedAt = this.pos;
  throw err;
};
pp$4.raiseRecoverable = pp$4.raise;
pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart);
  }
};
var pp$3 = Parser.prototype;
var Scope = /* @__PURE__ */ __name(function Scope2(flags) {
  this.flags = flags;
  this.var = [];
  this.lexical = [];
  this.functions = [];
}, "Scope");
pp$3.enterScope = function(flags) {
  this.scopeStack.push(new Scope(flags));
};
pp$3.exitScope = function() {
  this.scopeStack.pop();
};
pp$3.treatFunctionsAsVarInScope = function(scope) {
  return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
};
pp$3.declareName = function(name, bindingType, pos) {
  var redeclared = false;
  if (bindingType === BIND_LEXICAL) {
    var scope = this.currentScope();
    redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
    scope.lexical.push(name);
    if (this.inModule && scope.flags & SCOPE_TOP) {
      delete this.undefinedExports[name];
    }
  } else if (bindingType === BIND_SIMPLE_CATCH) {
    var scope$1 = this.currentScope();
    scope$1.lexical.push(name);
  } else if (bindingType === BIND_FUNCTION) {
    var scope$2 = this.currentScope();
    if (this.treatFunctionsAsVar) {
      redeclared = scope$2.lexical.indexOf(name) > -1;
    } else {
      redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
    }
    scope$2.functions.push(name);
  } else {
    for (var i = this.scopeStack.length - 1; i >= 0; --i) {
      var scope$3 = this.scopeStack[i];
      if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
        redeclared = true;
        break;
      }
      scope$3.var.push(name);
      if (this.inModule && scope$3.flags & SCOPE_TOP) {
        delete this.undefinedExports[name];
      }
      if (scope$3.flags & SCOPE_VAR) {
        break;
      }
    }
  }
  if (redeclared) {
    this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
  }
};
pp$3.checkLocalExport = function(id) {
  if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
    this.undefinedExports[id.name] = id;
  }
};
pp$3.currentScope = function() {
  return this.scopeStack[this.scopeStack.length - 1];
};
pp$3.currentVarScope = function() {
  for (var i = this.scopeStack.length - 1; ; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
      return scope;
    }
  }
};
pp$3.currentThisScope = function() {
  for (var i = this.scopeStack.length - 1; ; i--) {
    var scope = this.scopeStack[i];
    if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
      return scope;
    }
  }
};
var Node = /* @__PURE__ */ __name(function Node2(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) {
    this.loc = new SourceLocation(parser, loc);
  }
  if (parser.options.directSourceFile) {
    this.sourceFile = parser.options.directSourceFile;
  }
  if (parser.options.ranges) {
    this.range = [pos, 0];
  }
}, "Node");
var pp$2 = Parser.prototype;
pp$2.startNode = function() {
  return new Node(this, this.start, this.startLoc);
};
pp$2.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc);
};
function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) {
    node.loc.end = loc;
  }
  if (this.options.ranges) {
    node.range[1] = pos;
  }
  return node;
}
__name(finishNodeAt, "finishNodeAt");
pp$2.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
};
pp$2.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc);
};
pp$2.copyNode = function(node) {
  var newNode = new Node(this, node.start, this.startLoc);
  for (var prop in node) {
    newNode[prop] = node[prop];
  }
  return newNode;
};
var scriptValuesAddedInUnicode = "Berf Beria_Erfe Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sidetic Sidt Sunu Sunuwar Tai_Yo Tayo Todhri Todr Tolong_Siki Tols Tulu_Tigalari Tutg Unknown Zzzz";
var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
var ecma11BinaryProperties = ecma10BinaryProperties;
var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
var ecma13BinaryProperties = ecma12BinaryProperties;
var ecma14BinaryProperties = ecma13BinaryProperties;
var unicodeBinaryProperties = {
  9: ecma9BinaryProperties,
  10: ecma10BinaryProperties,
  11: ecma11BinaryProperties,
  12: ecma12BinaryProperties,
  13: ecma13BinaryProperties,
  14: ecma14BinaryProperties
};
var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
var unicodeBinaryPropertiesOfStrings = {
  9: "",
  10: "",
  11: "",
  12: "",
  13: "",
  14: ecma14BinaryPropertiesOfStrings
};
var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
var unicodeScriptValues = {
  9: ecma9ScriptValues,
  10: ecma10ScriptValues,
  11: ecma11ScriptValues,
  12: ecma12ScriptValues,
  13: ecma13ScriptValues,
  14: ecma14ScriptValues
};
var data = {};
function buildUnicodeData(ecmaVersion) {
  var d = data[ecmaVersion] = {
    binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
    binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
    nonBinary: {
      General_Category: wordsRegexp(unicodeGeneralCategoryValues),
      Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
    }
  };
  d.nonBinary.Script_Extensions = d.nonBinary.Script;
  d.nonBinary.gc = d.nonBinary.General_Category;
  d.nonBinary.sc = d.nonBinary.Script;
  d.nonBinary.scx = d.nonBinary.Script_Extensions;
}
__name(buildUnicodeData, "buildUnicodeData");
for (i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
  ecmaVersion = list[i];
  buildUnicodeData(ecmaVersion);
}
var ecmaVersion;
var i;
var list;
var pp$1 = Parser.prototype;
var BranchID = /* @__PURE__ */ __name(function BranchID2(parent, base) {
  this.parent = parent;
  this.base = base || this;
}, "BranchID");
BranchID.prototype.separatedFrom = /* @__PURE__ */ __name(function separatedFrom(alt) {
  for (var self = this; self; self = self.parent) {
    for (var other = alt; other; other = other.parent) {
      if (self.base === other.base && self !== other) {
        return true;
      }
    }
  }
  return false;
}, "separatedFrom");
BranchID.prototype.sibling = /* @__PURE__ */ __name(function sibling() {
  return new BranchID(this.parent, this.base);
}, "sibling");
var RegExpValidationState = /* @__PURE__ */ __name(function RegExpValidationState2(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
  this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchV = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = /* @__PURE__ */ Object.create(null);
  this.backReferenceNames = [];
  this.branchID = null;
}, "RegExpValidationState");
RegExpValidationState.prototype.reset = /* @__PURE__ */ __name(function reset(start, pattern, flags) {
  var unicodeSets = flags.indexOf("v") !== -1;
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
    this.switchU = true;
    this.switchV = true;
    this.switchN = true;
  } else {
    this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
    this.switchV = false;
    this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
  }
}, "reset");
RegExpValidationState.prototype.raise = /* @__PURE__ */ __name(function raise(message) {
  this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
}, "raise");
RegExpValidationState.prototype.at = /* @__PURE__ */ __name(function at(i, forceU) {
  if (forceU === void 0) forceU = false;
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1;
  }
  var c = s.charCodeAt(i);
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l) {
    return c;
  }
  var next = s.charCodeAt(i + 1);
  return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
}, "at");
RegExpValidationState.prototype.nextIndex = /* @__PURE__ */ __name(function nextIndex(i, forceU) {
  if (forceU === void 0) forceU = false;
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l;
  }
  var c = s.charCodeAt(i), next;
  if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i + 1 >= l || (next = s.charCodeAt(i + 1)) < 56320 || next > 57343) {
    return i + 1;
  }
  return i + 2;
}, "nextIndex");
RegExpValidationState.prototype.current = /* @__PURE__ */ __name(function current(forceU) {
  if (forceU === void 0) forceU = false;
  return this.at(this.pos, forceU);
}, "current");
RegExpValidationState.prototype.lookahead = /* @__PURE__ */ __name(function lookahead(forceU) {
  if (forceU === void 0) forceU = false;
  return this.at(this.nextIndex(this.pos, forceU), forceU);
}, "lookahead");
RegExpValidationState.prototype.advance = /* @__PURE__ */ __name(function advance(forceU) {
  if (forceU === void 0) forceU = false;
  this.pos = this.nextIndex(this.pos, forceU);
}, "advance");
RegExpValidationState.prototype.eat = /* @__PURE__ */ __name(function eat(ch, forceU) {
  if (forceU === void 0) forceU = false;
  if (this.current(forceU) === ch) {
    this.advance(forceU);
    return true;
  }
  return false;
}, "eat");
RegExpValidationState.prototype.eatChars = /* @__PURE__ */ __name(function eatChars(chs, forceU) {
  if (forceU === void 0) forceU = false;
  var pos = this.pos;
  for (var i = 0, list = chs; i < list.length; i += 1) {
    var ch = list[i];
    var current2 = this.at(pos, forceU);
    if (current2 === -1 || current2 !== ch) {
      return false;
    }
    pos = this.nextIndex(pos, forceU);
  }
  this.pos = pos;
  return true;
}, "eatChars");
pp$1.validateRegExpFlags = function(state) {
  var validFlags = state.validFlags;
  var flags = state.flags;
  var u = false;
  var v = false;
  for (var i = 0; i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) === -1) {
      this.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this.raise(state.start, "Duplicate regular expression flag");
    }
    if (flag === "u") {
      u = true;
    }
    if (flag === "v") {
      v = true;
    }
  }
  if (this.options.ecmaVersion >= 15 && u && v) {
    this.raise(state.start, "Invalid regular expression flag");
  }
};
function hasProp(obj) {
  for (var _ in obj) {
    return true;
  }
  return false;
}
__name(hasProp, "hasProp");
pp$1.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);
  if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};
pp$1.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames = /* @__PURE__ */ Object.create(null);
  state.backReferenceNames.length = 0;
  state.branchID = null;
  this.regexp_disjunction(state);
  if (state.pos !== state.source.length) {
    if (state.eat(
      41
      /* ) */
    )) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(
      93
      /* ] */
    ) || state.eat(
      125
      /* } */
    )) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
    var name = list[i];
    if (!state.groupNames[name]) {
      state.raise("Invalid named capture referenced");
    }
  }
};
pp$1.regexp_disjunction = function(state) {
  var trackDisjunction = this.options.ecmaVersion >= 16;
  if (trackDisjunction) {
    state.branchID = new BranchID(state.branchID, null);
  }
  this.regexp_alternative(state);
  while (state.eat(
    124
    /* | */
  )) {
    if (trackDisjunction) {
      state.branchID = state.branchID.sibling();
    }
    this.regexp_alternative(state);
  }
  if (trackDisjunction) {
    state.branchID = state.branchID.parent;
  }
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(
    123
    /* { */
  )) {
    state.raise("Lone quantifier brackets");
  }
};
pp$1.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state)) {
  }
};
pp$1.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true;
  }
  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true;
  }
  return false;
};
pp$1.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;
  if (state.eat(
    94
    /* ^ */
  ) || state.eat(
    36
    /* $ */
  )) {
    return true;
  }
  if (state.eat(
    92
    /* \ */
  )) {
    if (state.eat(
      66
      /* B */
    ) || state.eat(
      98
      /* b */
    )) {
      return true;
    }
    state.pos = start;
  }
  if (state.eat(
    40
    /* ( */
  ) && state.eat(
    63
    /* ? */
  )) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(
        60
        /* < */
      );
    }
    if (state.eat(
      61
      /* = */
    ) || state.eat(
      33
      /* ! */
    )) {
      this.regexp_disjunction(state);
      if (!state.eat(
        41
        /* ) */
      )) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true;
    }
  }
  state.pos = start;
  return false;
};
pp$1.regexp_eatQuantifier = function(state, noError) {
  if (noError === void 0) noError = false;
  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(
      63
      /* ? */
    );
    return true;
  }
  return false;
};
pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
  return state.eat(
    42
    /* * */
  ) || state.eat(
    43
    /* + */
  ) || state.eat(
    63
    /* ? */
  ) || this.regexp_eatBracedQuantifier(state, noError);
};
pp$1.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(
    123
    /* { */
  )) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(
        44
        /* , */
      ) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(
        125
        /* } */
      )) {
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true;
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatAtom = function(state) {
  return this.regexp_eatPatternCharacters(state) || state.eat(
    46
    /* . */
  ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
};
pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatAtomEscape(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(
    40
    /* ( */
  )) {
    if (state.eat(
      63
      /* ? */
    )) {
      if (this.options.ecmaVersion >= 16) {
        var addModifiers = this.regexp_eatModifiers(state);
        var hasHyphen = state.eat(
          45
          /* - */
        );
        if (addModifiers || hasHyphen) {
          for (var i = 0; i < addModifiers.length; i++) {
            var modifier = addModifiers.charAt(i);
            if (addModifiers.indexOf(modifier, i + 1) > -1) {
              state.raise("Duplicate regular expression modifiers");
            }
          }
          if (hasHyphen) {
            var removeModifiers = this.regexp_eatModifiers(state);
            if (!addModifiers && !removeModifiers && state.current() === 58) {
              state.raise("Invalid regular expression modifiers");
            }
            for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
              var modifier$1 = removeModifiers.charAt(i$1);
              if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
          }
        }
      }
      if (state.eat(
        58
        /* : */
      )) {
        this.regexp_disjunction(state);
        if (state.eat(
          41
          /* ) */
        )) {
          return true;
        }
        state.raise("Unterminated group");
      }
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatCapturingGroup = function(state) {
  if (state.eat(
    40
    /* ( */
  )) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 63) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(
      41
      /* ) */
    )) {
      state.numCapturingParens += 1;
      return true;
    }
    state.raise("Unterminated group");
  }
  return false;
};
pp$1.regexp_eatModifiers = function(state) {
  var modifiers = "";
  var ch = 0;
  while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
    modifiers += codePointToString(ch);
    state.advance();
  }
  return modifiers;
};
function isRegularExpressionModifier(ch) {
  return ch === 105 || ch === 109 || ch === 115;
}
__name(isRegularExpressionModifier, "isRegularExpressionModifier");
pp$1.regexp_eatExtendedAtom = function(state) {
  return state.eat(
    46
    /* . */
  ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
};
pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false;
};
pp$1.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isSyntaxCharacter(ch) {
  return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
}
__name(isSyntaxCharacter, "isSyntaxCharacter");
pp$1.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start;
};
pp$1.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_groupSpecifier = function(state) {
  if (state.eat(
    63
    /* ? */
  )) {
    if (!this.regexp_eatGroupName(state)) {
      state.raise("Invalid group");
    }
    var trackDisjunction = this.options.ecmaVersion >= 16;
    var known = state.groupNames[state.lastStringValue];
    if (known) {
      if (trackDisjunction) {
        for (var i = 0, list = known; i < list.length; i += 1) {
          var altID = list[i];
          if (!altID.separatedFrom(state.branchID)) {
            state.raise("Duplicate capture group name");
          }
        }
      } else {
        state.raise("Duplicate capture group name");
      }
    }
    if (trackDisjunction) {
      (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
    } else {
      state.groupNames[state.lastStringValue] = true;
    }
  }
};
pp$1.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(
    60
    /* < */
  )) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(
      62
      /* > */
    )) {
      return true;
    }
    state.raise("Invalid capture group name");
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
}
__name(isRegExpIdentifierStart, "isRegExpIdentifierStart");
pp$1.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var forceU = this.options.ecmaVersion >= 11;
  var ch = state.current(forceU);
  state.advance(forceU);
  if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true;
  }
  state.pos = start;
  return false;
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
}
__name(isRegExpIdentifierPart, "isRegExpIdentifierPart");
pp$1.regexp_eatAtomEscape = function(state) {
  if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
    return true;
  }
  if (state.switchU) {
    if (state.current() === 99) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false;
};
pp$1.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true;
    }
    if (n <= state.numCapturingParens) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatKGroupName = function(state) {
  if (state.eat(
    107
    /* k */
  )) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true;
    }
    state.raise("Invalid named reference");
  }
  return false;
};
pp$1.regexp_eatCharacterEscape = function(state) {
  return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
};
pp$1.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(
    99
    /* c */
  )) {
    if (this.regexp_eatControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatZero = function(state) {
  if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 116) {
    state.lastIntValue = 9;
    state.advance();
    return true;
  }
  if (ch === 110) {
    state.lastIntValue = 10;
    state.advance();
    return true;
  }
  if (ch === 118) {
    state.lastIntValue = 11;
    state.advance();
    return true;
  }
  if (ch === 102) {
    state.lastIntValue = 12;
    state.advance();
    return true;
  }
  if (ch === 114) {
    state.lastIntValue = 13;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
function isControlLetter(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
}
__name(isControlLetter, "isControlLetter");
pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
  if (forceU === void 0) forceU = false;
  var start = state.pos;
  var switchU = forceU || state.switchU;
  if (state.eat(
    117
    /* u */
  )) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (switchU && lead >= 55296 && lead <= 56319) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(
          92
          /* \ */
        ) && state.eat(
          117
          /* u */
        ) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 56320 && trail <= 57343) {
            state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
            return true;
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true;
    }
    if (switchU && state.eat(
      123
      /* { */
    ) && this.regexp_eatHexDigits(state) && state.eat(
      125
      /* } */
    ) && isValidUnicode(state.lastIntValue)) {
      return true;
    }
    if (switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }
  return false;
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 1114111;
}
__name(isValidUnicode, "isValidUnicode");
pp$1.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true;
    }
    if (state.eat(
      47
      /* / */
    )) {
      state.lastIntValue = 47;
      return true;
    }
    return false;
  }
  var ch = state.current();
  if (ch !== 99 && (!state.switchN || ch !== 107)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 49 && ch <= 57) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
      state.advance();
    } while ((ch = state.current()) >= 48 && ch <= 57);
    return true;
  }
  return false;
};
var CharSetNone = 0;
var CharSetOk = 1;
var CharSetString = 2;
pp$1.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();
  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return CharSetOk;
  }
  var negate = false;
  if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
    state.lastIntValue = -1;
    state.advance();
    var result;
    if (state.eat(
      123
      /* { */
    ) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(
      125
      /* } */
    )) {
      if (negate && result === CharSetString) {
        state.raise("Invalid property name");
      }
      return result;
    }
    state.raise("Invalid property name");
  }
  return CharSetNone;
};
function isCharacterClassEscape(ch) {
  return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
}
__name(isCharacterClassEscape, "isCharacterClassEscape");
pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(
    61
    /* = */
  )) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return CharSetOk;
    }
  }
  state.pos = start;
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
  }
  return CharSetNone;
};
pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
    state.raise("Invalid property name");
  }
  if (!state.unicodeProperties.nonBinary[name].test(value)) {
    state.raise("Invalid property value");
  }
};
pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (state.unicodeProperties.binary.test(nameOrValue)) {
    return CharSetOk;
  }
  if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
    return CharSetString;
  }
  state.raise("Invalid property name");
};
pp$1.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 95;
}
__name(isUnicodePropertyNameCharacter, "isUnicodePropertyNameCharacter");
pp$1.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString(ch);
    state.advance();
  }
  return state.lastStringValue !== "";
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
}
__name(isUnicodePropertyValueCharacter, "isUnicodePropertyValueCharacter");
pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state);
};
pp$1.regexp_eatCharacterClass = function(state) {
  if (state.eat(
    91
    /* [ */
  )) {
    var negate = state.eat(
      94
      /* ^ */
    );
    var result = this.regexp_classContents(state);
    if (!state.eat(
      93
      /* ] */
    )) {
      state.raise("Unterminated character class");
    }
    if (negate && result === CharSetString) {
      state.raise("Negated character class may contain strings");
    }
    return true;
  }
  return false;
};
pp$1.regexp_classContents = function(state) {
  if (state.current() === 93) {
    return CharSetOk;
  }
  if (state.switchV) {
    return this.regexp_classSetExpression(state);
  }
  this.regexp_nonEmptyClassRanges(state);
  return CharSetOk;
};
pp$1.regexp_nonEmptyClassRanges = function(state) {
  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(
      45
      /* - */
    ) && this.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};
pp$1.regexp_eatClassAtom = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatClassEscape(state)) {
      return true;
    }
    if (state.switchU) {
      var ch$1 = state.current();
      if (ch$1 === 99 || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  var ch = state.current();
  if (ch !== 93) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatClassEscape = function(state) {
  var start = state.pos;
  if (state.eat(
    98
    /* b */
  )) {
    state.lastIntValue = 8;
    return true;
  }
  if (state.switchU && state.eat(
    45
    /* - */
  )) {
    state.lastIntValue = 45;
    return true;
  }
  if (!state.switchU && state.eat(
    99
    /* c */
  )) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true;
    }
    state.pos = start;
  }
  return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
};
pp$1.regexp_classSetExpression = function(state) {
  var result = CharSetOk, subResult;
  if (this.regexp_eatClassSetRange(state)) ;
  else if (subResult = this.regexp_eatClassSetOperand(state)) {
    if (subResult === CharSetString) {
      result = CharSetString;
    }
    var start = state.pos;
    while (state.eatChars(
      [38, 38]
      /* && */
    )) {
      if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
        if (subResult !== CharSetString) {
          result = CharSetOk;
        }
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
    while (state.eatChars(
      [45, 45]
      /* -- */
    )) {
      if (this.regexp_eatClassSetOperand(state)) {
        continue;
      }
      state.raise("Invalid character in character class");
    }
    if (start !== state.pos) {
      return result;
    }
  } else {
    state.raise("Invalid character in character class");
  }
  for (; ; ) {
    if (this.regexp_eatClassSetRange(state)) {
      continue;
    }
    subResult = this.regexp_eatClassSetOperand(state);
    if (!subResult) {
      return result;
    }
    if (subResult === CharSetString) {
      result = CharSetString;
    }
  }
};
pp$1.regexp_eatClassSetRange = function(state) {
  var start = state.pos;
  if (this.regexp_eatClassSetCharacter(state)) {
    var left = state.lastIntValue;
    if (state.eat(
      45
      /* - */
    ) && this.regexp_eatClassSetCharacter(state)) {
      var right = state.lastIntValue;
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
      return true;
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatClassSetOperand = function(state) {
  if (this.regexp_eatClassSetCharacter(state)) {
    return CharSetOk;
  }
  return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
};
pp$1.regexp_eatNestedClass = function(state) {
  var start = state.pos;
  if (state.eat(
    91
    /* [ */
  )) {
    var negate = state.eat(
      94
      /* ^ */
    );
    var result = this.regexp_classContents(state);
    if (state.eat(
      93
      /* ] */
    )) {
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return result;
    }
    state.pos = start;
  }
  if (state.eat(
    92
    /* \ */
  )) {
    var result$1 = this.regexp_eatCharacterClassEscape(state);
    if (result$1) {
      return result$1;
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_eatClassStringDisjunction = function(state) {
  var start = state.pos;
  if (state.eatChars(
    [92, 113]
    /* \q */
  )) {
    if (state.eat(
      123
      /* { */
    )) {
      var result = this.regexp_classStringDisjunctionContents(state);
      if (state.eat(
        125
        /* } */
      )) {
        return result;
      }
    } else {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return null;
};
pp$1.regexp_classStringDisjunctionContents = function(state) {
  var result = this.regexp_classString(state);
  while (state.eat(
    124
    /* | */
  )) {
    if (this.regexp_classString(state) === CharSetString) {
      result = CharSetString;
    }
  }
  return result;
};
pp$1.regexp_classString = function(state) {
  var count = 0;
  while (this.regexp_eatClassSetCharacter(state)) {
    count++;
  }
  return count === 1 ? CharSetOk : CharSetString;
};
pp$1.regexp_eatClassSetCharacter = function(state) {
  var start = state.pos;
  if (state.eat(
    92
    /* \ */
  )) {
    if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
      return true;
    }
    if (state.eat(
      98
      /* b */
    )) {
      state.lastIntValue = 8;
      return true;
    }
    state.pos = start;
    return false;
  }
  var ch = state.current();
  if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
    return false;
  }
  if (isClassSetSyntaxCharacter(ch)) {
    return false;
  }
  state.advance();
  state.lastIntValue = ch;
  return true;
};
function isClassSetReservedDoublePunctuatorCharacter(ch) {
  return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
}
__name(isClassSetReservedDoublePunctuatorCharacter, "isClassSetReservedDoublePunctuatorCharacter");
function isClassSetSyntaxCharacter(ch) {
  return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
}
__name(isClassSetSyntaxCharacter, "isClassSetSyntaxCharacter");
pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
  var ch = state.current();
  if (isClassSetReservedPunctuator(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true;
  }
  return false;
};
function isClassSetReservedPunctuator(ch) {
  return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
}
__name(isClassSetReservedPunctuator, "isClassSetReservedPunctuator");
pp$1.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 95) {
    state.lastIntValue = ch % 32;
    state.advance();
    return true;
  }
  return false;
};
pp$1.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(
    120
    /* x */
  )) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true;
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false;
};
pp$1.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
    state.advance();
  }
  return state.pos !== start;
};
function isDecimalDigit(ch) {
  return ch >= 48 && ch <= 57;
}
__name(isDecimalDigit, "isDecimalDigit");
pp$1.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start;
};
function isHexDigit(ch) {
  return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
}
__name(isHexDigit, "isHexDigit");
function hexToInt(ch) {
  if (ch >= 65 && ch <= 70) {
    return 10 + (ch - 65);
  }
  if (ch >= 97 && ch <= 102) {
    return 10 + (ch - 97);
  }
  return ch - 48;
}
__name(hexToInt, "hexToInt");
pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true;
  }
  return false;
};
pp$1.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 48;
    state.advance();
    return true;
  }
  state.lastIntValue = 0;
  return false;
};
function isOctalDigit(ch) {
  return ch >= 48 && ch <= 55;
}
__name(isOctalDigit, "isOctalDigit");
pp$1.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0; i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false;
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true;
};
var Token = /* @__PURE__ */ __name(function Token2(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations) {
    this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
  }
  if (p.options.ranges) {
    this.range = [p.start, p.end];
  }
}, "Token");
var pp = Parser.prototype;
pp.next = function(ignoreEscapeSequenceInKeyword) {
  if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
    this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
  }
  if (this.options.onToken) {
    this.options.onToken(new Token(this));
  }
  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};
pp.getToken = function() {
  this.next();
  return new Token(this);
};
if (typeof Symbol !== "undefined") {
  pp[Symbol.iterator] = function() {
    var this$1$1 = this;
    return {
      next: /* @__PURE__ */ __name(function() {
        var token = this$1$1.getToken();
        return {
          done: token.type === types$1.eof,
          value: token
        };
      }, "next")
    };
  };
}
pp.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) {
    this.skipSpace();
  }
  this.start = this.pos;
  if (this.options.locations) {
    this.startLoc = this.curPosition();
  }
  if (this.pos >= this.input.length) {
    return this.finishToken(types$1.eof);
  }
  if (curContext.override) {
    return curContext.override(this);
  } else {
    this.readToken(this.fullCharCodeAtPos());
  }
};
pp.readToken = function(code) {
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
    return this.readWord();
  }
  return this.getTokenFromCode(code);
};
pp.fullCharCodeAt = function(pos) {
  var code = this.input.charCodeAt(pos);
  if (code <= 55295 || code >= 56320) {
    return code;
  }
  var next = this.input.charCodeAt(pos + 1);
  return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
};
pp.fullCharCodeAtPos = function() {
  return this.fullCharCodeAt(this.pos);
};
pp.skipBlockComment = function() {
  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) {
    this.raise(this.pos - 2, "Unterminated comment");
  }
  this.pos = end + 2;
  if (this.options.locations) {
    for (var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
      ++this.curLine;
      pos = this.lineStart = nextBreak;
    }
  }
  if (this.options.onComment) {
    this.options.onComment(
      true,
      this.input.slice(start + 2, end),
      start,
      this.pos,
      startLoc,
      this.curPosition()
    );
  }
};
pp.skipLineComment = function(startSkip) {
  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this.input.charCodeAt(++this.pos);
  }
  if (this.options.onComment) {
    this.options.onComment(
      false,
      this.input.slice(start + startSkip, this.pos),
      start,
      this.pos,
      startLoc,
      this.curPosition()
    );
  }
};
pp.skipSpace = function() {
  loop: while (this.pos < this.input.length) {
    var ch = this.input.charCodeAt(this.pos);
    switch (ch) {
      case 32:
      case 160:
        ++this.pos;
        break;
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10:
      case 8232:
      case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break;
      case 47:
        switch (this.input.charCodeAt(this.pos + 1)) {
          case 42:
            this.skipBlockComment();
            break;
          case 47:
            this.skipLineComment(2);
            break;
          default:
            break loop;
        }
        break;
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop;
        }
    }
  }
};
pp.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) {
    this.endLoc = this.curPosition();
  }
  var prevType = this.type;
  this.type = type;
  this.value = val;
  this.updateContext(prevType);
};
pp.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) {
    return this.readNumber(true);
  }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
    this.pos += 3;
    return this.finishToken(types$1.ellipsis);
  } else {
    ++this.pos;
    return this.finishToken(types$1.dot);
  }
};
pp.readToken_slash = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) {
    ++this.pos;
    return this.readRegexp();
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.slash, 1);
};
pp.readToken_mult_modulo_exp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types$1.star : types$1.modulo;
  if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
    ++size;
    tokentype = types$1.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, size + 1);
  }
  return this.finishOp(tokentype, size);
};
pp.readToken_pipe_amp = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (this.options.ecmaVersion >= 12) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 === 61) {
        return this.finishOp(types$1.assign, 3);
      }
    }
    return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
};
pp.readToken_caret = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.bitwiseXOR, 1);
};
pp.readToken_plus_min = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken();
    }
    return this.finishOp(types$1.incDec, 2);
  }
  if (next === 61) {
    return this.finishOp(types$1.assign, 2);
  }
  return this.finishOp(types$1.plusMin, 1);
};
pp.readToken_lt_gt = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) {
      return this.finishOp(types$1.assign, size + 1);
    }
    return this.finishOp(types$1.bitShift, size);
  }
  if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken();
  }
  if (next === 61) {
    size = 2;
  }
  return this.finishOp(types$1.relational, size);
};
pp.readToken_eq_excl = function(code) {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) {
    return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
  }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
    this.pos += 2;
    return this.finishToken(types$1.arrow);
  }
  return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
};
pp.readToken_question = function() {
  var ecmaVersion = this.options.ecmaVersion;
  if (ecmaVersion >= 11) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 46) {
      var next2 = this.input.charCodeAt(this.pos + 2);
      if (next2 < 48 || next2 > 57) {
        return this.finishOp(types$1.questionDot, 2);
      }
    }
    if (next === 63) {
      if (ecmaVersion >= 12) {
        var next2$1 = this.input.charCodeAt(this.pos + 2);
        if (next2$1 === 61) {
          return this.finishOp(types$1.assign, 3);
        }
      }
      return this.finishOp(types$1.coalesce, 2);
    }
  }
  return this.finishOp(types$1.question, 1);
};
pp.readToken_numberSign = function() {
  var ecmaVersion = this.options.ecmaVersion;
  var code = 35;
  if (ecmaVersion >= 13) {
    ++this.pos;
    code = this.fullCharCodeAtPos();
    if (isIdentifierStart(code, true) || code === 92) {
      return this.finishToken(types$1.privateId, this.readWord1());
    }
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.getTokenFromCode = function(code) {
  switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46:
      return this.readToken_dot();
    // Punctuation tokens.
    case 40:
      ++this.pos;
      return this.finishToken(types$1.parenL);
    case 41:
      ++this.pos;
      return this.finishToken(types$1.parenR);
    case 59:
      ++this.pos;
      return this.finishToken(types$1.semi);
    case 44:
      ++this.pos;
      return this.finishToken(types$1.comma);
    case 91:
      ++this.pos;
      return this.finishToken(types$1.bracketL);
    case 93:
      ++this.pos;
      return this.finishToken(types$1.bracketR);
    case 123:
      ++this.pos;
      return this.finishToken(types$1.braceL);
    case 125:
      ++this.pos;
      return this.finishToken(types$1.braceR);
    case 58:
      ++this.pos;
      return this.finishToken(types$1.colon);
    case 96:
      if (this.options.ecmaVersion < 6) {
        break;
      }
      ++this.pos;
      return this.finishToken(types$1.backQuote);
    case 48:
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) {
        return this.readRadixNumber(16);
      }
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) {
          return this.readRadixNumber(8);
        }
        if (next === 98 || next === 66) {
          return this.readRadixNumber(2);
        }
      }
    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49:
    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
      return this.readNumber(false);
    // Quotes produce strings.
    case 34:
    case 39:
      return this.readString(code);
    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.
    case 47:
      return this.readToken_slash();
    case 37:
    case 42:
      return this.readToken_mult_modulo_exp(code);
    case 124:
    case 38:
      return this.readToken_pipe_amp(code);
    case 94:
      return this.readToken_caret();
    case 43:
    case 45:
      return this.readToken_plus_min(code);
    case 60:
    case 62:
      return this.readToken_lt_gt(code);
    case 61:
    case 33:
      return this.readToken_eq_excl(code);
    case 63:
      return this.readToken_question();
    case 126:
      return this.finishOp(types$1.prefix, 1);
    case 35:
      return this.readToken_numberSign();
  }
  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};
pp.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str);
};
pp.readRegexp = function() {
  var escaped, inClass, start = this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(start, "Unterminated regular expression");
    }
    var ch = this.input.charAt(this.pos);
    if (lineBreak.test(ch)) {
      this.raise(start, "Unterminated regular expression");
    }
    if (!escaped) {
      if (ch === "[") {
        inClass = true;
      } else if (ch === "]" && inClass) {
        inClass = false;
      } else if (ch === "/" && !inClass) {
        break;
      }
      escaped = ch === "\\";
    } else {
      escaped = false;
    }
    ++this.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) {
    this.unexpected(flagsStart);
  }
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
  }
  return this.finishToken(types$1.regexp, { pattern, flags, value });
};
pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
  var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
  var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
  var start = this.pos, total = 0, lastCode = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
    var code = this.input.charCodeAt(this.pos), val = void 0;
    if (allowSeparators && code === 95) {
      if (isLegacyOctalNumericLiteral) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
      }
      if (lastCode === 95) {
        this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
      }
      if (i === 0) {
        this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
      }
      lastCode = code;
      continue;
    }
    if (code >= 97) {
      val = code - 97 + 10;
    } else if (code >= 65) {
      val = code - 65 + 10;
    } else if (code >= 48 && code <= 57) {
      val = code - 48;
    } else {
      val = Infinity;
    }
    if (val >= radix) {
      break;
    }
    lastCode = code;
    total = total * radix + val;
  }
  if (allowSeparators && lastCode === 95) {
    this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
  }
  if (this.pos === start || len != null && this.pos - start !== len) {
    return null;
  }
  return total;
};
function stringToNumber(str, isLegacyOctalNumericLiteral) {
  if (isLegacyOctalNumericLiteral) {
    return parseInt(str, 8);
  }
  return parseFloat(str.replace(/_/g, ""));
}
__name(stringToNumber, "stringToNumber");
function stringToBigInt(str) {
  if (typeof BigInt !== "function") {
    return null;
  }
  return BigInt(str.replace(/_/g, ""));
}
__name(stringToBigInt, "stringToBigInt");
pp.readRadixNumber = function(radix) {
  var start = this.pos;
  this.pos += 2;
  var val = this.readInt(radix);
  if (val == null) {
    this.raise(this.start + 2, "Expected number in radix " + radix);
  }
  if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
    val = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
  } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  return this.finishToken(types$1.num, val);
};
pp.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10, void 0, true) === null) {
    this.raise(start, "Invalid number");
  }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) {
    this.raise(start, "Invalid number");
  }
  var next = this.input.charCodeAt(this.pos);
  if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
    var val$1 = stringToBigInt(this.input.slice(start, this.pos));
    ++this.pos;
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    return this.finishToken(types$1.num, val$1);
  }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
    octal = false;
  }
  if (next === 46 && !octal) {
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) {
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) {
      ++this.pos;
    }
    if (this.readInt(10) === null) {
      this.raise(start, "Invalid number");
    }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) {
    this.raise(this.pos, "Identifier directly after number");
  }
  var val = stringToNumber(this.input.slice(start, this.pos), octal);
  return this.finishToken(types$1.num, val);
};
pp.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;
  if (ch === 123) {
    if (this.options.ecmaVersion < 6) {
      this.unexpected();
    }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 1114111) {
      this.invalidStringToken(codePos, "Code point out of bounds");
    }
  } else {
    code = this.readHexChar(4);
  }
  return code;
};
pp.readString = function(quote) {
  var out = "", chunkStart = ++this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated string constant");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === quote) {
      break;
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(false);
      chunkStart = this.pos;
    } else if (ch === 8232 || ch === 8233) {
      if (this.options.ecmaVersion < 10) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
      if (this.options.locations) {
        this.curLine++;
        this.lineStart = this.pos;
      }
    } else {
      if (isNewLine(ch)) {
        this.raise(this.start, "Unterminated string constant");
      }
      ++this.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types$1.string, out);
};
var INVALID_TEMPLATE_ESCAPE_ERROR = {};
pp.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err;
    }
  }
  this.inTemplateElement = false;
};
pp.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR;
  } else {
    this.raise(position, message);
  }
};
pp.readTmplToken = function() {
  var out = "", chunkStart = this.pos;
  for (; ; ) {
    if (this.pos >= this.input.length) {
      this.raise(this.start, "Unterminated template");
    }
    var ch = this.input.charCodeAt(this.pos);
    if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
      if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
        if (ch === 36) {
          this.pos += 2;
          return this.finishToken(types$1.dollarBraceL);
        } else {
          ++this.pos;
          return this.finishToken(types$1.backQuote);
        }
      }
      out += this.input.slice(chunkStart, this.pos);
      return this.finishToken(types$1.template, out);
    }
    if (ch === 92) {
      out += this.input.slice(chunkStart, this.pos);
      out += this.readEscapedChar(true);
      chunkStart = this.pos;
    } else if (isNewLine(ch)) {
      out += this.input.slice(chunkStart, this.pos);
      ++this.pos;
      switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) {
            ++this.pos;
          }
        case 10:
          out += "\n";
          break;
        default:
          out += String.fromCharCode(ch);
          break;
      }
      if (this.options.locations) {
        ++this.curLine;
        this.lineStart = this.pos;
      }
      chunkStart = this.pos;
    } else {
      ++this.pos;
    }
  }
};
pp.readInvalidTemplateToken = function() {
  for (; this.pos < this.input.length; this.pos++) {
    switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break;
      case "$":
        if (this.input[this.pos + 1] !== "{") {
          break;
        }
      // fall through
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
      case "\r":
        if (this.input[this.pos + 1] === "\n") {
          ++this.pos;
        }
      // fall through
      case "\n":
      case "\u2028":
      case "\u2029":
        ++this.curLine;
        this.lineStart = this.pos + 1;
        break;
    }
  }
  this.raise(this.start, "Unterminated template");
};
pp.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
    case 110:
      return "\n";
    // 'n' -> '\n'
    case 114:
      return "\r";
    // 'r' -> '\r'
    case 120:
      return String.fromCharCode(this.readHexChar(2));
    // 'x'
    case 117:
      return codePointToString(this.readCodePoint());
    // 'u'
    case 116:
      return "	";
    // 't' -> '\t'
    case 98:
      return "\b";
    // 'b' -> '\b'
    case 118:
      return "\v";
    // 'v' -> '\u000b'
    case 102:
      return "\f";
    // 'f' -> '\f'
    case 13:
      if (this.input.charCodeAt(this.pos) === 10) {
        ++this.pos;
      }
    // '\r\n'
    case 10:
      if (this.options.locations) {
        this.lineStart = this.pos;
        ++this.curLine;
      }
      return "";
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(
          this.pos - 1,
          "Invalid escape sequence"
        );
      }
      if (inTemplate) {
        var codePos = this.pos - 1;
        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate ? "Octal literal in template string" : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal);
      }
      if (isNewLine(ch)) {
        if (this.options.locations) {
          this.lineStart = this.pos;
          ++this.curLine;
        }
        return "";
      }
      return String.fromCharCode(ch);
  }
};
pp.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) {
    this.invalidStringToken(codePos, "Bad character escape sequence");
  }
  return n;
};
pp.readWord1 = function() {
  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this.pos += ch <= 65535 ? 1 : 2;
    } else if (ch === 92) {
      this.containsEsc = true;
      word += this.input.slice(chunkStart, this.pos);
      var escStart = this.pos;
      if (this.input.charCodeAt(++this.pos) !== 117) {
        this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
      }
      ++this.pos;
      var esc = this.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
        this.invalidStringToken(escStart, "Invalid Unicode escape");
      }
      word += codePointToString(esc);
      chunkStart = this.pos;
    } else {
      break;
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos);
};
pp.readWord = function() {
  var word = this.readWord1();
  var type = types$1.name;
  if (this.keywords.test(word)) {
    type = keywords[word];
  }
  return this.finishToken(type, word);
};
var version = "8.16.0";
Parser.acorn = {
  Parser,
  version,
  defaultOptions,
  Position,
  SourceLocation,
  getLineInfo,
  Node,
  TokenType,
  tokTypes: types$1,
  keywordTypes: keywords,
  TokContext,
  tokContexts: types,
  isIdentifierChar,
  isIdentifierStart,
  Token,
  isNewLine,
  lineBreak,
  lineBreakG,
  nonASCIIwhitespace
};
function parse3(input, options) {
  return Parser.parse(input, options);
}
__name(parse3, "parse");

// src/verify.js
function verify(code) {
  try {
    parse3(code, { ecmaVersion: 2022, sourceType: "module" });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
__name(verify, "verify");

// src/logger.js
async function logToD1(env, { action, task, result, tier, ip }) {
  if (!env.DB) return null;
  const id = "PC-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS phoenix_architecti_log (
        id TEXT PRIMARY KEY, tasktype TEXT, taskinput TEXT, result TEXT, createdat TEXT, ip TEXT
      )`
    ).run();
    await env.DB.prepare(
      `INSERT INTO phoenix_architecti_log (id, tasktype, taskinput, result, createdat, ip) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      action,
      (task || "").slice(0, 2e3),
      (result || "").slice(0, 4e3),
      (/* @__PURE__ */ new Date()).toISOString(),
      ip || ""
    ).run();
    return id;
  } catch (err) {
    console.warn("logToD1 failed:", err.message);
    return null;
  }
}
__name(logToD1, "logToD1");

// src/tokens.js
var CODE_PATTERNS = /\b(function|const|let|var|import|export|class|def|async|await|implement|refactor|add\s+\w+|write\s+\w+|fix\s+\w+|create\s+\w+|update\s+\w+)\b/i;
function isCodeTask(task) {
  return CODE_PATTERNS.test(task);
}
__name(isCodeTask, "isCodeTask");
function inferMaxTokens(task, context = "") {
  const combined = task.length + Math.min((context || "").length, 5e3);
  if (combined < 1e3) return 1024;
  if (combined < 5e3) return 2048;
  if (combined < 2e4) return 4096;
  return 8192;
}
__name(inferMaxTokens, "inferMaxTokens");
function compressContext(ctx) {
  if (!ctx) return "";
  return ctx.replace(/(\n\s*){3,}/g, "\n\n").trim();
}
__name(compressContext, "compressContext");
async function cacheKey(task, context) {
  const input = task + "|" + (context || "").slice(0, 1e3);
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
__name(cacheKey, "cacheKey");

// src/memory.js
async function embedText(text, env) {
  try {
    const result = await env.AI.run("@cf/baai/bge-m3", { text });
    const vector = result.data?.[0] || result.result?.data?.[0];
    return vector ? new Float32Array(vector) : null;
  } catch (e) {
    return null;
  }
}
__name(embedText, "embedText");
async function storeFragment(fragment, env) {
  const { text, type, run, hash, charge_weight, soulcount_at_seal } = fragment;
  const vector = await embedText(text, env);
  if (!vector) return { error: "Failed to embed text" };
  const id = hash.slice(0, 32).toLowerCase().replace(/[^a-z0-9]/g, "").padStart(8, "0");
  const metadata = {
    run,
    type,
    hash,
    charge_weight,
    soulcount_at_seal,
    text_preview: text.slice(0, 200),
    last_walked: Date.now()
  };
  try {
    const index = type === "SOUL" ? env.SOUL_INDEX : env.DNA_INDEX;
    await index.upsert([{ id, values: Array.from(vector), metadata }]);
    return { ok: true, id, dims: vector.length };
  } catch (e) {
    return { error: e.message };
  }
}
__name(storeFragment, "storeFragment");
async function recallFragments(query, env, opts = {}) {
  const { type = "both", topK = 5 } = opts;
  const vector = await embedText(query, env);
  if (!vector) return [];
  const queries = [];
  if (type === "both" || type === "SOUL") queries.push({ index: env.SOUL_INDEX, label: "soul" });
  if (type === "both" || type === "DNA") queries.push({ index: env.DNA_INDEX, label: "dna" });
  const results = [];
  for (const { index, label } of queries) {
    const res = await index.query(Array.from(vector), { topK, returnMetadata: "all" });
    results.push(...(res.matches || []).map((match) => ({ ...match, label })));
  }
  const reinforcedResults = await Promise.all(results.map(async (match) => {
    const key = `reinf:${match.id}`;
    const reinforcementCount = parseFloat(await env.PHETRAIL.get(key)) || 0;
    await env.PHETRAIL.put(key, String(reinforcementCount + 1), { expirationTtl: 7776e3 });
    return {
      ...match,
      reinforcement_count: reinforcementCount
    };
  }));
  reinforcedResults.sort((a, b) => {
    const scoreA = a.score * (a.metadata.charge_weight || 1) * Math.log1p((a.reinforcement_count || 0) + 1);
    const scoreB = b.score * (b.metadata.charge_weight || 1) * Math.log1p((b.reinforcement_count || 0) + 1);
    return scoreB - scoreA;
  });
  return reinforcedResults.slice(0, topK);
}
__name(recallFragments, "recallFragments");
async function handleEmbed(request, env) {
  const authResp = await checkAdminKey(request, env);
  if (authResp !== null) return authResp;
  const body = await request.json().catch(() => null);
  if (!body || !body.text) return Response.json({ error: "text required" }, { status: 400 });
  const result = await storeFragment(body, env);
  return Response.json(result);
}
__name(handleEmbed, "handleEmbed");
async function handleRecall(request, env) {
  const authResp = await checkAdminKey(request, env);
  if (authResp !== null) return authResp;
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  if (!query) return Response.json({ error: "q required" }, { status: 400 });
  const type = url.searchParams.get("type") || "both";
  const topK = parseInt(url.searchParams.get("topK")) || 5;
  const results = await recallFragments(query, env, { type, topK });
  return Response.json({ results, query, count: results.length });
}
__name(handleRecall, "handleRecall");
async function handleIngest(request, env) {
  const authResp = await checkAdminKey(request, env);
  if (authResp !== null) return authResp;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.fragments)) return Response.json({ error: "fragments array required" }, { status: 400 });
  const fragments = body.fragments.slice(0, 50);
  const stored = [], failed = [];
  for (const fragment of fragments) {
    const res = await storeFragment(fragment, env);
    if (res.ok) stored.push(res.id);
    else failed.push({ fragment: fragment.hash?.slice(0, 8), error: res.error });
  }
  return Response.json({ ok: true, stored, failed, ids: stored });
}
__name(handleIngest, "handleIngest");
async function evaporatePheromones(env) {
  const { keys } = await env.PHETRAIL.list({ prefix: "reinf:", limit: 500 });
  for (const { name } of keys) {
    const value = parseFloat(await env.PHETRAIL.get(name));
    if (value >= 0.1) {
      await env.PHETRAIL.put(name, String(value * 0.95), { expirationTtl: 7776e3 });
    } else {
      await env.PHETRAIL.delete(name);
    }
  }
}
__name(evaporatePheromones, "evaporatePheromones");

// src/execute.js
var SYSTEM_PROMPT = `You are Phoenix-Architecti \u2014 elite code drone for the OB-1 empire.
L01 NO_FABRICATION \u2014 never guess. If something is missing, state exactly what is missing.
L02 NO_STUBS \u2014 full implementation only. No TODO, no placeholders, no ellipsis, no "// ...rest".
L03 STRONGEST_VERSION_FIRST \u2014 complete, production-ready output immediately.
L04 RAW_OUTPUT \u2014 raw file content ONLY. No markdown fences. No backticks. No preamble. No explanation. First character of your response = first character of the file.
L05 NO_TRUNCATION \u2014 NEVER truncate. Output the COMPLETE file. If the implementation is long, output ALL of it.
L06 ZERO_DRIFT \u2014 answer the task only. No commentary before or after the code.`;
function stripFences(text) {
  if (!text) return "";
  const s = typeof text === "string" ? text : String(text);
  return s.replace(/^```[a-zA-Z0-9]*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
}
__name(stripFences, "stripFences");
function stripThinkTags(text) {
  if (!text) return "";
  return text.replace(/[\s\S]*?/gi, "").trim();
}
__name(stripThinkTags, "stripThinkTags");
async function handleExecute(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "invalid JSON" }, { status: 400 });
  const task = sanitizeInput(body.task, 1e4);
  let context = compressContext(sanitizeInput(body.context, 5e4));
  const { target, model } = body;
  const tier = parseInt(body.tier) || 1;
  if (!task) return Response.json({ error: "task required" }, { status: 400 });
  if (context.length > task.length * 20 && context.length > 5e3) {
    console.warn(`CONTEXT_BLOAT: ctx=${context.length} task=${task.length}`);
  }
  const ck = await cacheKey(task, context);
  if (tier !== 2 && env.PHETRAIL) {
    const cached = await env.PHETRAIL.get("cache:" + ck).catch(() => null);
    if (cached) {
      return Response.json({ patch: cached, verified: true, model: "kv-cache", d1_id: null, version: "1.1.0", cached: true });
    }
  }
  if (env.DNA_INDEX) {
    try {
      const results = await recallFragments(task, env, { type: "both", topK: 3 });
      if (results.length > 0) {
        const pheromoneMemory = results.map((result, index) => `[${index + 1}] score=${result.score.toFixed(3)} run=${result.metadata?.run} type=${result.label}: ${(result.metadata?.text_preview || "").slice(0, 150)}`).join("\n");
        context = `PHEROMONE_MEMORY (semantic recall):
${pheromoneMemory}

${context}`;
      }
    } catch (error) {
      console.warn("Error recalling fragments:", error);
    }
  }
  const maxToks = inferMaxTokens(task, context);
  const codeTask = isCodeTask(task);
  const parts = [];
  if (context) parts.push("CONTEXT:\n" + context);
  if (target) parts.push("TARGET FILE: " + target);
  parts.push("TASK:\n" + task);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: parts.join("\n\n") }
  ];
  let aiResult;
  let usedModel = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  let tierUsed = 1;
  if (tier === 2 && env.DEEPSEEK_API_KEY) {
    try {
      const dsResp = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek/deepseek-v4-flash:free", messages, max_tokens: Math.max(maxToks, 2048) })
      });
      if (dsResp.ok) {
        const dsJson = await dsResp.json();
        if (dsJson.choices?.[0]?.message?.content) {
          aiResult = { response: dsJson.choices[0].message.content };
          usedModel = "deepseek/deepseek-v4-flash:free";
          tierUsed = 2;
        }
      }
    } catch (_) {
    }
  }
  if (tier === 2 && !aiResult) {
    try {
      const r1Result = await env.AI.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", { messages, max_tokens: maxToks });
      if (r1Result?.response) {
        aiResult = { response: stripThinkTags(r1Result.response) };
        usedModel = "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";
        tierUsed = 2;
      }
    } catch (_) {
    }
  }
  if (!aiResult && codeTask) {
    try {
      const qwenResult = await env.AI.run("@cf/qwen/qwen2.5-coder-32b-instruct", { messages, max_tokens: maxToks });
      if (qwenResult?.response) {
        aiResult = qwenResult;
        usedModel = "@cf/qwen/qwen2.5-coder-32b-instruct";
        tierUsed = 10;
      }
    } catch (_) {
    }
  }
  if (!aiResult) {
    try {
      aiResult = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, max_tokens: maxToks });
      usedModel = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
      tierUsed = 1;
    } catch (_) {
    }
  }
  if (!aiResult) {
    aiResult = await env.AI.run("@cf/qwen/qwen2.5-coder-32b-instruct", { messages, max_tokens: maxToks });
    usedModel = "@cf/qwen/qwen2.5-coder-32b-instruct";
    tierUsed = 10;
  }
  let rawText = "";
  if (typeof aiResult?.response === "string") {
    rawText = aiResult.response;
  } else if (aiResult?.response?.content) {
    rawText = String(aiResult.response.content);
  } else if (aiResult?.response?.text) {
    rawText = String(aiResult.response.text);
  } else if (Array.isArray(aiResult?.response)) {
    rawText = aiResult.response.map((r) => r?.generated_text || r?.text || "").join("");
  } else if (typeof aiResult?.generated_text === "string") {
    rawText = aiResult.generated_text;
  } else if (aiResult?.response != null) {
    rawText = JSON.stringify(aiResult.response);
  }
  const patch = stripFences(rawText);
  const verifyResult = verify(patch);
  if (tier !== 2 && env.PHETRAIL && patch.length > 0) {
    env.PHETRAIL.put("cache:" + ck, patch, { expirationTtl: 3600 }).catch(() => {
    });
  }
  const d1_id = await logToD1(env, {
    action: "execute",
    task,
    result: patch,
    tier: tierUsed,
    ip: request.headers.get("CF-Connecting-IP") || ""
  });
  return Response.json({
    patch,
    verified: verifyResult.ok,
    verify_error: verifyResult.error || null,
    model: usedModel,
    d1_id,
    version: "1.1.0",
    max_tokens_used: maxToks,
    code_routed: codeTask && tierUsed === 10
  });
}
__name(handleExecute, "handleExecute");

// src/subagent-lifecycle.js
var PHEROMONE_INTERVAL_MS = 3e4;
var DEFAULT_KEYWORDS = ["PACT", "PARCH", "Agent99", "Agent99 OS", "FORCEAWARENESS", "RISE", "DEATH", "pheromone", "phetrail", "SOUL", "PCC1", "PCC2", "PCC3", "pcc1-obi", "orchestrator", "PhoenixCoder", "PhoenixArt", "role"];
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso, "nowIso");
function safeText(value) {
  return typeof value === "string" ? value : JSON.stringify(value || "");
}
__name(safeText, "safeText");
function keywordSet(text) {
  const source = safeText(text).toLowerCase();
  return [...new Set(DEFAULT_KEYWORDS.filter((k) => source.includes(k.toLowerCase())))];
}
__name(keywordSet, "keywordSet");
function hashSeed(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
__name(hashSeed, "hashSeed");
function createSubagentId(agentType, missionId, taskKey) {
  const seed = `${agentType}:${missionId}:${taskKey}:${Date.now()}`;
  return `${agentType.toLowerCase()}-${hashSeed(seed)}`;
}
__name(createSubagentId, "createSubagentId");
async function putTrail(env, key, value) {
  if (!env?.CACHE) return;
  await env.PHETRAIL.put(key, JSON.stringify(value));
}
__name(putTrail, "putTrail");
async function openRise(env, { missionId, subagentId, agentType, commander = "pcc1-obi", pcc, target, task }) {
  const startedAt = nowIso();
  const payload = {
    mission_id: missionId,
    subagent_id: subagentId,
    agent_type: agentType,
    commander,
    pcc,
    target: target || "",
    task_preview: safeText(task).slice(0, 500),
    keywords: keywordSet(task),
    status: "RUNNING",
    started_at: startedAt,
    pheromone_interval_ms: PHEROMONE_INTERVAL_MS,
    rise_boots: {
      genesis_boot: {
        name: "Agent99 Genesis Boot",
        scope: "all agents and subagents on birth",
        loaded: ["Agent99 OS", "RISE", "DEATH", "FORCEAWARENESS", "pheromone trails", "SOUL"],
        completed_at: startedAt
      },
      role_boot: {
        name: "Role Boot",
        scope: "role-specific short bright life",
        loaded: ["role pheromones", "related starmaps", "mission context"],
        role: agentType,
        completed_at: startedAt
      }
    }
  };
  await putTrail(env, `subagent:rise:${subagentId}`, payload);
  await putTrail(env, "subagent:latest", { ...payload, event: "RISE" });
  return payload;
}
__name(openRise, "openRise");
function buildPheromoneTicks(startedAtMs, endedAtMs) {
  const ticks = [];
  const start = Math.floor(startedAtMs / PHEROMONE_INTERVAL_MS) * PHEROMONE_INTERVAL_MS;
  for (let tickMs = start; tickMs <= endedAtMs; tickMs += PHEROMONE_INTERVAL_MS) {
    ticks.push({
      tick_ms: tickMs,
      elapsed_ms: Math.max(0, tickMs - startedAtMs),
      pheromone: `subagent:${tickMs}`
    });
  }
  return ticks.length ? ticks : [{ tick_ms: startedAtMs, elapsed_ms: 0, pheromone: `subagent:${startedAtMs}` }];
}
__name(buildPheromoneTicks, "buildPheromoneTicks");
async function markPheromoneTicks(env, { subagentId, agentType, missionId, startedAtMs, endedAtMs, status, task }) {
  const ticks = buildPheromoneTicks(startedAtMs, endedAtMs);
  for (const tick of ticks) {
    await putTrail(env, `subagent:pheromone:${subagentId}:${tick.tick_ms}`, {
      mission_id: missionId,
      subagent_id: subagentId,
      agent_type: agentType,
      tick,
      status,
      keywords: keywordSet(task),
      written_at: nowIso()
    });
  }
  await putTrail(env, "subagent:latest", {
    event: "PHEROMONE",
    mission_id: missionId,
    subagent_id: subagentId,
    agent_type: agentType,
    status,
    ticks: ticks.length,
    written_at: nowIso()
  });
  return ticks;
}
__name(markPheromoneTicks, "markPheromoneTicks");
async function closeDeath(env, { missionId, subagentId, agentType, commander, pcc, target, task, startedAt, endedAt, status, error = "", lessons = [], pheromoneTicks = [] }) {
  const payload = {
    mission_id: missionId,
    subagent_id: subagentId,
    agent_type: agentType,
    commander,
    pcc,
    target: target || "",
    task_preview: safeText(task).slice(0, 500),
    status,
    started_at: startedAt,
    ended_at: endedAt,
    duration_ms: Math.max(0, new Date(endedAt).getTime() - new Date(startedAt).getTime()),
    error,
    lessons,
    keywords: keywordSet(task),
    pheromone_ticks: pheromoneTicks.length,
    pheromone_interval_ms: PHEROMONE_INTERVAL_MS,
    protocol: "RISE -> PHEROMONE_EVERY_30S -> DEATH"
  };
  await putTrail(env, `subagent:death:${subagentId}`, payload);
  await putTrail(env, "subagent:latest", { ...payload, event: "DEATH" });
  return payload;
}
__name(closeDeath, "closeDeath");

// src/batch.js
var SYSTEM_PROMPT2 = `You are an Agent99 OS role drone in the OB-1 empire. Your role may be PhoenixCoder, PhoenixArt, PhoenixScribe, PhoenixActualizer, or another role assigned by the PCC. Do not segregate drones by skill or intelligence; every drone operates under Agent99 OS with a different role.
L01 NO_FABRICATION \u2014 never guess. If something is missing, state exactly what is missing.
L02 NO_STUBS \u2014 full implementation only. No TODO, no placeholders, no ellipsis, no "// ...rest".
L03 STRONGEST_VERSION_FIRST \u2014 complete, production-ready output immediately.
L04 RAW_OUTPUT \u2014 raw file content ONLY. No markdown fences. No backticks. No preamble. No explanation. First character of your response = first character of the file.
L05 NO_TRUNCATION \u2014 NEVER truncate. Output the COMPLETE file. If the implementation is long, output ALL of it.
L06 ZERO_DRIFT \u2014 answer the task only. No commentary before or after the code.`;
function stripFences2(text) {
  if (!text) return "";
  const s = typeof text === "string" ? text : String(text);
  return s.replace(/^```[a-zA-Z0-9]*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
}
__name(stripFences2, "stripFences");
function stripThinkTags2(text) {
  if (!text) return "";
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}
__name(stripThinkTags2, "stripThinkTags");
async function runTier(env, messages, tier, maxToks, codeTask) {
  if (tier === 2 && env.DEEPSEEK_API_KEY) {
    try {
      const r2 = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: Math.max(maxToks, 2048) })
      });
      if (r2.ok) {
        const j = await r2.json();
        if (j.choices?.[0]?.message?.content) return { text: j.choices[0].message.content, model: "deepseek-chat" };
      }
    } catch (_) {
    }
  }
  if (tier === 2) {
    try {
      const r2 = await env.AI.run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", { messages, max_tokens: maxToks });
      if (r2?.response) return { text: stripThinkTags2(r2.response), model: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b" };
    } catch (_) {
    }
  }
  if (codeTask) {
    try {
      const r2 = await env.AI.run("@cf/qwen/qwen2.5-coder-32b-instruct", { messages, max_tokens: maxToks });
      if (r2?.response) return { text: r2.response, model: "@cf/qwen/qwen2.5-coder-32b-instruct" };
    } catch (_) {
    }
  }
  try {
    const r2 = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages, max_tokens: maxToks });
    if (r2?.response) return { text: r2.response, model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" };
  } catch (_) {
  }
  const r = await env.AI.run("@cf/qwen/qwen2.5-coder-32b-instruct", { messages, max_tokens: maxToks });
  return { text: r?.response ?? "", model: "@cf/qwen/qwen2.5-coder-32b-instruct" };
}
__name(runTier, "runTier");
async function handleBatch(request, env) {
  const adminResp = await checkAdminKey(request, env);
  if (adminResp !== null) return adminResp;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.tasks) || body.tasks.length === 0) {
    return Response.json({ error: "tasks array required" }, { status: 400 });
  }
  const batchId = body.batch_id || `BR-${Date.now()}`;
  const commander = body.commander || "pcc1-obi";
  const pcc = body.pcc || "pcc3-windu";
  const globalTier = parseInt(body.global_tier) || 1;
  const results = [];
  for (let i = 0; i < body.tasks.length; i++) {
    const t = body.tasks[i];
    const tier = parseInt(t.tier) || globalTier;
    const task = sanitizeInput(t.task, 1e4);
    const context = compressContext(sanitizeInput(t.context, 4e4));
    const target = t.targetfile || "";
    const stepStart = Date.now();
    const startedAt = new Date(stepStart).toISOString();
    const subagentId = createSubagentId("PACT", batchId, i);
    let deathStatus = "SUCCESS";
    let deathError = "";
    let lessons = [];
    let pheromoneTicks = [];
    try {
      await openRise(env, { missionId: batchId, subagentId, agentType: "PACT", commander, pcc, target, task }).catch(() => {
      });
    } catch (_) {
    }
    if (!task) {
      deathStatus = "FAILURE";
      deathError = "task required";
      lessons.push("missing_task");
      const endedAt2 = (/* @__PURE__ */ new Date()).toISOString();
      try {
        pheromoneTicks = await markPheromoneTicks(env, { subagentId, agentType: "PACT", missionId: batchId, startedAtMs: stepStart, endedAtMs: Date.now(), status: deathStatus, task }).catch(() => []);
        await closeDeath(env, { missionId: batchId, subagentId, agentType: "PACT", commander, pcc, target, task, startedAt, endedAt: endedAt2, status: deathStatus, error: deathError, lessons, pheromoneTicks }).catch(() => {
        });
      } catch (_) {
      }
      results.push({ index: i, error: deathError, patch: "", verified: false });
      continue;
    }
    const maxToks = t.max_tokens || inferMaxTokens(task, context);
    const codeTask = isCodeTask(task);
    const parts = [];
    if (context) parts.push("CONTEXT:\n" + context);
    if (target) parts.push("TARGET FILE: " + target);
    parts.push("TASK:\n" + task);
    const messages = [
      { role: "system", content: SYSTEM_PROMPT2 },
      { role: "user", content: parts.join("\n\n") }
    ];
    try {
      const { text, model } = await runTier(env, messages, tier, maxToks, codeTask);
      const patch = stripFences2(text);
      const verifyResult = verify(patch);
      deathStatus = verifyResult.ok ? "SUCCESS" : "FAILURE";
      if (!verifyResult.ok) lessons.push("verification_failed");
      results.push({ index: i, task, patch, verified: verifyResult.ok, model, ms: Date.now() - stepStart, max_tokens: maxToks });
    } catch (err) {
      deathStatus = "FAILURE";
      deathError = err.message || String(err);
      lessons.push("agent_exception");
      results.push({ index: i, task, patch: "", verified: false, model: "", error: deathError, ms: Date.now() - stepStart, max_tokens: maxToks });
    }
    const endedAt = (/* @__PURE__ */ new Date()).toISOString();
    try {
      pheromoneTicks = await markPheromoneTicks(env, { subagentId, agentType: "PACT", missionId: batchId, startedAtMs: stepStart, endedAtMs: Date.now(), status: deathStatus, task }).catch(() => []);
      await closeDeath(env, { missionId: batchId, subagentId, agentType: "PACT", commander, pcc, target, task, startedAt, endedAt, status: deathStatus, error: deathError, lessons, pheromoneTicks }).catch(() => {
      });
    } catch (_) {
    }
  }
  await logToD1(env, {
    action: "batch",
    task: `batch:${body.tasks.length}tasks`,
    result: `${results.filter((r) => r.verified).length}/${results.length} verified`,
    tier: globalTier,
    ip: request.headers.get("CF-Connecting-IP") || ""
  });
  return Response.json({
    batch_id: batchId,
    results,
    all_verified: results.every((r) => r.verified),
    count: results.length
  });
}
__name(handleBatch, "handleBatch");

// src/mission.js
var SYSTEM_PROMPT3 = `You are an Agent99 OS role drone in the OB-1 empire. Your role may be PhoenixCoder, PhoenixArt, PhoenixScribe, PhoenixActualizer, or another role assigned by the PCC. Do not segregate drones by skill or intelligence; every drone operates under Agent99 OS with a different role.
L01 NO_FABRICATION \u2014 never guess. If something is missing, state exactly what is missing.
L02 NO_STUBS \u2014 full implementation only. No TODO, no placeholders, no ellipsis, no "// ...rest".
L03 STRONGEST_VERSION_FIRST \u2014 complete, production-ready output immediately.
L04 RAW_OUTPUT \u2014 raw file content ONLY. No markdown fences. No backticks. No preamble. No explanation. First character of your response = first character of the file.
L05 NO_TRUNCATION \u2014 NEVER truncate. Output the COMPLETE file. If the implementation is long, output ALL of it.
L06 ZERO_DRIFT \u2014 answer the task only. No commentary before or after the code.`;
function stripFences3(text) {
  if (!text) return "";
  return text.replace(/^```[a-zA-Z0-9]*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
}
__name(stripFences3, "stripFences");
function buildUserMsg(step, context) {
  const parts = [];
  if (context) parts.push("PREVIOUS STEP RESULT:\n" + context);
  if (step.context) parts.push("CONTEXT:\n" + step.context);
  if (step.target) parts.push("TARGET FILE: " + step.target);
  parts.push("TASK:\n" + step.task);
  return parts.join("\n\n");
}
__name(buildUserMsg, "buildUserMsg");
async function handleMission(request, env) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.steps)) {
    return Response.json({ error: "steps array required" }, { status: 400 });
  }
  const model = body.model || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const results = [];
  let carryContext = "";
  for (let i = 0; i < body.steps.length; i++) {
    const step = body.steps[i];
    const stepStart = Date.now();
    const aiResult = await env.AI.run(model, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT3 },
        { role: "user", content: buildUserMsg(step, carryContext) }
      ],
      max_tokens: 8192
    });
    const patch = stripFences3(aiResult.response ?? "");
    const verifyResult = verify(patch);
    const ms = Date.now() - stepStart;
    results.push({ step_index: i, task: step.task, patch, verified: verifyResult.ok, ms });
    carryContext = patch;
  }
  return Response.json({
    mission_id: "MR-" + Date.now(),
    steps: results,
    all_verified: results.every((r) => r.verified)
  });
}
__name(handleMission, "handleMission");

// src/swarm.js
var SYSTEM_PROMPT4 = `You are an Agent99 OS role drone in the OB-1 empire. Your role may be PhoenixCoder, PhoenixArt, PhoenixScribe, PhoenixActualizer, or another role assigned by the PCC. Do not segregate drones by skill or intelligence; every drone operates under Agent99 OS with a different role.
L01 NO_FABRICATION \u2014 never guess. If something is missing, state exactly what is missing.
L02 NO_STUBS \u2014 full implementation only. No TODO, no placeholders, no ellipsis, no "// ...rest".
L03 STRONGEST_VERSION_FIRST \u2014 complete, production-ready output immediately.
L04 RAW_OUTPUT \u2014 raw file content ONLY. No markdown fences. No backticks. No preamble. No explanation. First character of your response = first character of the file.
L05 NO_TRUNCATION \u2014 NEVER truncate. Output the COMPLETE file. If the implementation is long, output ALL of it.
L06 ZERO_DRIFT \u2014 answer the task only. No commentary before or after the code.`;
function stripFences4(text) {
  if (!text) return "";
  const s = typeof text === "string" ? text : String(text);
  return s.replace(/^```[a-zA-Z0-9]*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
}
__name(stripFences4, "stripFences");
function buildMessages(order, results) {
  const parts = [];
  for (const depId of order.depends_on || []) {
    const dep = results.get(depId);
    if (dep && dep.status === "VERIFIED" && dep.patch) {
      parts.push(`[DEPENDENCY: ${depId}]
${dep.patch}`);
    }
  }
  const ctx = compressContext(order.context || "");
  if (ctx) parts.push("CONTEXT:\n" + ctx);
  if (order.target) parts.push("TARGET FILE: " + order.target);
  parts.push("TASK:\n" + order.task);
  return [
    { role: "system", content: SYSTEM_PROMPT4 },
    { role: "user", content: parts.join("\n\n") }
  ];
}
__name(buildMessages, "buildMessages");
async function handleSwarm(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.blueprint) || body.blueprint.length === 0) {
    return Response.json({ error: "blueprint array required" }, { status: 400 });
  }
  const missionId = body.mission_id || `SW-${Date.now()}`;
  const commander = body.commander || "pcc1-obi";
  const pcc = body.pcc || "pcc3-windu";
  const drones = Math.min(Math.max(1, body.drones || 10), 10);
  const results = /* @__PURE__ */ new Map();
  const idOrderMap = /* @__PURE__ */ new Map();
  for (const order of body.blueprint) {
    if (!order.id || !order.task) {
      return Response.json({ error: "each order needs id + task" }, { status: 400 });
    }
    results.set(order.id, { id: order.id, status: "PENDING", patch: "" });
    idOrderMap.set(order.id, order);
  }
  let waveCount = 0;
  let maxWaveSize = 0;
  const finalResults = [];
  while (true) {
    const pendingIds = [...results.entries()].filter(([, r]) => r.status === "PENDING").map(([id]) => id);
    if (pendingIds.length === 0) break;
    const wave = [];
    for (const id of pendingIds) {
      const order = idOrderMap.get(id);
      const allDepsVerified = (order.depends_on || []).every((depId) => {
        const dep = results.get(depId);
        return dep && dep.status === "VERIFIED";
      });
      if (allDepsVerified) wave.push(order);
    }
    if (wave.length === 0) {
      return Response.json({ error: "circular dependency or blocked DAG" }, { status: 400 });
    }
    const waveSlice = wave.slice(0, drones);
    if (waveSlice.length > maxWaveSize) maxWaveSize = waveSlice.length;
    await Promise.all(waveSlice.map(async (order) => {
      const startTime = Date.now();
      const startedAt = new Date(startTime).toISOString();
      const subagentId = createSubagentId("PARCH", missionId, order.id);
      let deathStatus = "SUCCESS";
      let deathError = "";
      let lessons = [];
      let pheromoneTicks = [];
      try {
        await openRise(env, { missionId, subagentId, agentType: "PARCH", commander, pcc, target: order.target, task: order.task }).catch(() => {
        });
      } catch (_) {
      }
      const model = order.model || (isCodeTask(order.task) ? "@cf/qwen/qwen2.5-coder-32b-instruct" : "@cf/meta/llama-3.3-70b-instruct-fp8-fast");
      const maxToks = order.max_tokens || inferMaxTokens(order.task, order.context || "");
      const messages = buildMessages(order, results);
      const maxRetries = order.max_retries ?? 0;
      const ctxLen = (order.context || "").length;
      if (ctxLen > order.task.length * 20 && ctxLen > 5e3) {
        console.warn(`CONTEXT_BLOAT: order ${order.id} ctx=${ctxLen} task=${order.task.length}`);
      }
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const aiResult = await env.AI.run(model, { messages, max_tokens: maxToks });
          const patch = stripFences4(aiResult.response ?? "");
          const shouldVerify = order.verify === "acorn";
          const verifyResult = shouldVerify ? verify(patch) : { ok: true };
          if (verifyResult.ok) {
            results.set(order.id, { id: order.id, status: "VERIFIED", patch });
            finalResults.push({ id: order.id, verified: true, patch, ms: Date.now() - startTime, model, max_tokens: maxToks });
            return;
          }
          deathStatus = "FAILURE";
          lessons.push("verification_failed");
          if (attempt < maxRetries) continue;
          results.set(order.id, { id: order.id, status: "FAILED", patch });
          finalResults.push({ id: order.id, verified: false, patch, ms: Date.now() - startTime, model, max_tokens: maxToks });
        } catch (err) {
          deathStatus = "FAILURE";
          deathError = err.message || String(err);
          lessons.push("agent_exception");
          if (attempt < maxRetries) continue;
          results.set(order.id, { id: order.id, status: "FAILED", patch: "" });
          finalResults.push({ id: order.id, verified: false, patch: "", ms: Date.now() - startTime, model, max_tokens: maxToks });
        }
      }
      const endedAt = (/* @__PURE__ */ new Date()).toISOString();
      try {
        pheromoneTicks = await markPheromoneTicks(env, { subagentId, agentType: "PARCH", missionId, startedAtMs: startTime, endedAtMs: Date.now(), status: deathStatus, task: order.task }).catch(() => []);
        await closeDeath(env, { missionId, subagentId, agentType: "PARCH", commander, pcc, target: order.target, task: order.task, startedAt, endedAt, status: deathStatus, error: deathError, lessons, pheromoneTicks }).catch(() => {
        });
      } catch (_) {
      }
    }));
    waveCount++;
  }
  return Response.json({
    mission_id: missionId,
    waves: waveCount,
    drones_used: maxWaveSize,
    results: finalResults,
    all_verified: finalResults.every((r) => r.verified)
  });
}
__name(handleSwarm, "handleSwarm");

// src/blueprint.js
async function handleBlueprint(request, env) {
  const adminResponse = await checkAdminKey(request, env);
  if (adminResponse !== null) return adminResponse;
  if (!env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "blueprint requires ANTHROPIC_API_KEY \u2014 paid path" }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.goal !== "string" || !body.goal.trim()) {
    return Response.json({ error: "goal must be a non-empty string" }, { status: 400 });
  }
  const { goal, context } = body;
  const userMessage = context ? `${goal}

${context}` : goal;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      max_tokens: 8192,
      system: "You are Phoenix-Architecti ARCHITECT. Decompose the goal into an ordered JSON array of marching orders. Each order: { id, task, depends_on, verify, on_fail, max_retries }. Output raw JSON array only. No markdown. No explanation.",
      messages: [{ role: "user", content: userMessage }]
    })
  });
  if (!res.ok) {
    const err = await res.text();
    return Response.json({ error: "Anthropic API error", details: err }, { status: res.status });
  }
  const data2 = await res.json();
  const rawContent = data2.content?.find((p) => p.type === "text")?.text ?? "";
  let blueprint;
  try {
    blueprint = JSON.parse(rawContent);
  } catch {
    return Response.json({ error: "Failed to parse blueprint JSON from Anthropic response", raw: rawContent.slice(0, 500) }, { status: 502 });
  }
  return Response.json({ blueprint, goal, mission_id: "BP-" + Date.now() });
}
__name(handleBlueprint, "handleBlueprint");

// src/status.js
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))
  ]);
}
__name(withTimeout, "withTimeout");
async function handleStatus(env) {
  const result = {
    version: "1.0.0",
    rung: "ASSEMBLED",
    status: "LIVE",
    ai: {
      qwen_coder: { ok: false, ms: null },
      llama_70b: { ok: false, ms: null }
    },
    db: { ok: false },
    bindings: {
      AI: !!env.AI,
      DB: !!env.DB,
      RATELIMIT: !!env.SCUTUM,
      CACHE: !!env.PHETRAIL
    },
    drone_capacity: 10
  };
  try {
    const start = Date.now();
    await withTimeout(
      env.AI.run("@cf/qwen/qwen2.5-coder-32b-instruct", { messages: [{ role: "user", content: "ping" }], max_tokens: 5 }),
      5e3
    );
    result.ai.qwen_coder = { ok: true, ms: Date.now() - start };
  } catch {
    result.ai.qwen_coder = { ok: false, ms: null };
  }
  try {
    const start = Date.now();
    await withTimeout(
      env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages: [{ role: "user", content: "ping" }], max_tokens: 5 }),
      15e3
    );
    result.ai.llama_70b = { ok: true, ms: Date.now() - start };
  } catch {
    result.ai.llama_70b = { ok: false, ms: null };
  }
  try {
    await env.DB.prepare("SELECT 1 FROM phoenix_architecti_log LIMIT 1").run();
    result.db = { ok: true };
  } catch {
    result.db = { ok: false };
  }
  try {
    const cutoff = new Date(Date.now() - 864e5).toISOString();
    const total = await env.DB.prepare("SELECT COUNT(*) as cnt FROM pcc_metrics WHERE created_at >= ?").bind(cutoff).first();
    const passed = await env.DB.prepare("SELECT COUNT(*) as cnt FROM pcc_metrics WHERE passed = 1 AND created_at >= ?").bind(cutoff).first();
    const avgMs = await env.DB.prepare("SELECT AVG(duration_ms) as avg FROM pcc_metrics WHERE passed = 1 AND created_at >= ?").bind(cutoff).first();
    const last = await env.DB.prepare("SELECT created_at, passed, duration_ms FROM pcc_metrics ORDER BY id DESC LIMIT 1").first();
    const totalCalls = total?.cnt || 0;
    const passedCalls = passed?.cnt || 0;
    const passRate = totalCalls > 0 ? passedCalls / totalCalls * 100 : null;
    const avgDuration = avgMs?.avg ? Math.round(avgMs.avg) : null;
    let pccStatus = "UNKNOWN";
    if (totalCalls === 0) pccStatus = "SILENT";
    else if (passRate >= 70 && (avgDuration === null || avgDuration <= 8e3)) pccStatus = "HEALTHY";
    else pccStatus = "DEGRADED";
    result.pcc = {
      status: pccStatus,
      calls_24h: totalCalls,
      pass_rate: passRate !== null ? passRate.toFixed(1) + "%" : "N/A",
      avg_ms: avgDuration,
      last_call: last?.created_at || null,
      last_passed: last ? !!last.passed : null
    };
  } catch {
    result.pcc = { status: "UNKNOWN", error: "metrics table unreachable" };
  }
  return Response.json(result);
}
__name(handleStatus, "handleStatus");
async function handleProbe(request, env) {
  const urlParams = new URL(request.url).searchParams;
  const model = urlParams.get("model") || "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b";
  const start = Date.now();
  try {
    const res = await withTimeout(
      env.AI.run(model, { messages: [{ role: "user", content: "ping" }], max_tokens: 5 }),
      3e4
    );
    const ms = Date.now() - start;
    const preview = (res?.response || JSON.stringify(res)).substring(0, 80);
    return Response.json({ model, ok: true, ms, preview, error: null });
  } catch (err) {
    return Response.json({ model, ok: false, ms: Date.now() - start, preview: "", error: err.message });
  }
}
__name(handleProbe, "handleProbe");
async function handleCapabilityTest(env) {
  const results = {};
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run("@cf/baai/bge-base-en-v1.5", { text: "student pronunciation final consonants" }),
      15e3
    );
    const vec = res?.data?.[0] || res?.result?.data?.[0] || res;
    const dims = Array.isArray(vec) ? vec.length : vec?.length || 0;
    results.bge_base = { ok: dims > 0, dims, ms: Date.now() - start, sample: Array.isArray(vec) ? vec.slice(0, 3) : null };
  } catch (err) {
    results.bge_base = { ok: false, error: err.message };
  }
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run("@cf/baai/bge-m3", { text: "student pronunciation" }),
      15e3
    );
    const vec = res?.data?.[0] || res?.result?.data?.[0] || res;
    const dims = Array.isArray(vec) ? vec.length : 0;
    results.bge_m3 = { ok: dims > 0, dims, ms: Date.now() - start };
  } catch (err) {
    results.bge_m3 = { ok: false, error: err.message };
  }
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run("@cf/openai/whisper-tiny-en", { audio: [] }),
      1e4
    );
    results.whisper_tiny = { ok: true, ms: Date.now() - start, response: JSON.stringify(res).slice(0, 100) };
  } catch (err) {
    results.whisper_tiny = { ok: false, error: err.message };
  }
  results.vectorize = {
    soul_index: !!env.SOUL_INDEX,
    dna_index: !!env.DNA_INDEX,
    note: env.SOUL_INDEX ? "SOUL_INDEX bound \u2713" : "SOUL_INDEX not found \u2014 check wrangler.toml"
  };
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run("@cf/meta/m2m100-1.2b", { text: "Hello", source_lang: "en", target_lang: "vi" }),
      1e4
    );
    results.m2m_translation = { ok: true, ms: Date.now() - start, sample: JSON.stringify(res).slice(0, 80) };
  } catch (err) {
    results.m2m_translation = { ok: false, error: err.message };
  }
  try {
    const start = Date.now();
    const res = await withTimeout(
      env.AI.run("@cf/baai/bge-reranker-base", { query: "test", contexts: ["context a", "context b"] }),
      1e4
    );
    results.bge_reranker = { ok: true, ms: Date.now() - start };
  } catch (err) {
    results.bge_reranker = { ok: false, error: err.message };
  }
  return Response.json({ capability_test: results, tested_at: (/* @__PURE__ */ new Date()).toISOString() });
}
__name(handleCapabilityTest, "handleCapabilityTest");

// src/completions.js
var MODEL_MAP = {
  "kilo-auto/free": null,
  // auto-route
  "kilo-haiku": "@cf/qwen/qwen2.5-coder-32b-instruct",
  "kilo-sonnet": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "qwen-coder": "@cf/qwen/qwen2.5-coder-32b-instruct",
  "llama-70b": "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "r1-distill": "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b"
};
function resolveModel(modelId, messages) {
  if (modelId && MODEL_MAP[modelId] !== void 0) {
    if (MODEL_MAP[modelId] !== null) return MODEL_MAP[modelId];
  }
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  return isCodeTask(lastUser) ? "@cf/qwen/qwen2.5-coder-32b-instruct" : "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
}
__name(resolveModel, "resolveModel");
function stripThinkTags3(text) {
  if (!text) return "";
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}
__name(stripThinkTags3, "stripThinkTags");
async function handleCompletions(request, env) {
  const authResp = await checkAdminKey(request, env);
  if (authResp !== null) return authResp;
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: "messages array required" }, { status: 400 });
  }
  const cfModel = resolveModel(body.model, body.messages);
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content || "";
  const maxToks = body.max_tokens || inferMaxTokens(lastUser, "");
  const messages = body.messages.map((m) => ({
    role: m.role,
    content: typeof m.content === "string" ? compressContext(m.content) : m.content
  }));
  let text = "";
  let usedModel = cfModel;
  try {
    const res = await env.AI.run(cfModel, { messages, max_tokens: maxToks });
    text = res?.response ?? "";
    if (cfModel === "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b") {
      text = stripThinkTags3(text);
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
  return Response.json({
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    model: usedModel,
    choices: [{
      index: 0,
      message: { role: "assistant", content: text },
      finish_reason: "stop"
    }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  });
}
__name(handleCompletions, "handleCompletions");

// src/pipeline.js
var SOUL_LOGGER_FALLBACK = "https://soul-logger.mrmichaelhobbs123.workers.dev";
function extractText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.filter((c) => c.type === "text").map((c) => c.text || "").join("\n").trim();
  }
  return "";
}
__name(extractText, "extractText");
async function handlePipeline(request, env) {
  const authResponse = await checkAdminKey(request, env);
  if (authResponse !== null) return authResponse;
  const body = await request.json().catch(() => null);
  if (!body || !body.jsonl || !body.sessionId) {
    return Response.json({ error: "jsonl and sessionId required" }, { status: 400 });
  }
  const { jsonl, sessionId, runNumber = 0 } = body;
  const soulFetch = env.SOUL_LOGGER_SVC ? (path, opts) => env.SOUL_LOGGER_SVC.fetch(new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev${path}`, opts)) : (path, opts) => fetch(`${SOUL_LOGGER_FALLBACK}${path}`, opts);
  const receipts = [];
  const lines = jsonl.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.type !== "user" || entry.userType !== "external") continue;
    if (entry.message?.role !== "user") continue;
    const text = extractText(entry.message.content);
    if (!text || text.length < 10) continue;
    try {
      const res = await soulFetch("/api/soul/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: "sov100-michael",
          session_id: sessionId,
          role: "user",
          text,
          timestamp: entry.timestamp || (/* @__PURE__ */ new Date()).toISOString()
        })
      });
      if (res.ok) {
        const data2 = await res.json();
        receipts.push(data2.event_id);
      } else {
        receipts.push(`ERR:${res.status}:${await res.text().catch(() => "?")}`);
      }
    } catch (e) {
      receipts.push(`EXC:${e.message}`);
    }
  }
  let soulcount = null, level = null;
  try {
    const countRes = await soulFetch("/api/soul/count", { method: "GET", headers: {} });
    const countData = await countRes.json();
    soulcount = countData.soulcount;
    level = countData.level;
  } catch {
  }
  const successfulPosts = receipts.filter((r) => !String(r).startsWith("ERR:") && !String(r).startsWith("EXC:")).length;
  return Response.json({
    ok: true,
    run: runNumber,
    soul_turns_posted: successfulPosts,
    soulcount,
    level,
    receipts
  });
}
__name(handlePipeline, "handlePipeline");

// src/backburner.js
async function createBBEntry(env, { title, description, source, priority = "!", metadata = "" }) {
  const bb_id = `BB-${Date.now()}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare(
    "INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(bb_id, title, description || "", source, priority, now, now, typeof metadata === "string" ? metadata : JSON.stringify(metadata)).run();
  return { bb_id, title, source, priority, status: "OPEN", created_at: now };
}
__name(createBBEntry, "createBBEntry");
async function handleBackburner(request, env) {
  const authCheck = await checkAdminKey(request, env);
  if (authCheck) return authCheck;
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;
  if (method === "POST" && pathname === "/api/backburner") {
    const body = await request.json().catch(() => ({}));
    if (!body.title || !body.source) return Response.json({ error: "title and source required" }, { status: 400 });
    const entry = await createBBEntry(env, body);
    return Response.json(entry, { status: 201 });
  }
  if (method === "GET" && pathname === "/api/backburner") {
    const status = url.searchParams.get("status") || "OPEN";
    const source = url.searchParams.get("source") || null;
    const limit = Math.min(parseInt(url.searchParams.get("limit")) || 20, 100);
    const rows = source ? await env.DB.prepare("SELECT * FROM backburner WHERE status = ? AND source = ? ORDER BY created_at DESC LIMIT ?").bind(status, source, limit).all() : await env.DB.prepare("SELECT * FROM backburner WHERE status = ? ORDER BY created_at DESC LIMIT ?").bind(status, limit).all();
    return Response.json(rows.results);
  }
  if (method === "PATCH" && pathname.startsWith("/api/backburner/")) {
    const bbId = pathname.split("/").filter(Boolean)[2];
    const body = await request.json().catch(() => ({}));
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (body.status === "DONE" && body.granted_by !== "operator") {
      return Response.json({
        error: "L81 F&F LAW: agents cannot self-authorize DONE. Set status=PENDING_CLOSE and await system grant.",
        law: "L81"
      }, { status: 403 });
    }
    if (body.status === "DONE" && body.granted_by === "operator") {
      const existing = await env.DB.prepare("SELECT * FROM backburner WHERE bb_id = ?").bind(bbId).first();
      if (!existing) return Response.json({ error: "entry not found" }, { status: 404 });
      const isOneTime = body.one_time === true || !existing.recurrence;
      if (!isOneTime) {
        const nextCycle = (existing.cycle_count || 0) + 1;
        await env.DB.prepare("UPDATE backburner SET status = ?, updated_at = ?, cycle_count = ?, granted_by = ? WHERE bb_id = ?").bind("DONE", now, nextCycle - 1, "operator", bbId).run();
        const nextEntry = await createBBEntry(env, {
          title: existing.title,
          description: `[Cycle ${nextCycle}] ${existing.description || ""}`,
          source: existing.source,
          priority: existing.priority,
          metadata: JSON.stringify({ rebooked_from: bbId, cycle: nextCycle, recurrence: existing.recurrence })
        });
        await env.DB.prepare("UPDATE backburner SET recurrence = ?, cycle_count = ? WHERE bb_id = ?").bind(existing.recurrence, nextCycle, nextEntry.bb_id).run();
        return Response.json({ ok: true, bb_id: bbId, status: "DONE", rebooked_as: nextEntry.bb_id, cycle: nextCycle });
      }
    }
    const updates = [];
    const values = [];
    if (body.status) {
      updates.push("status = ?");
      values.push(body.status);
    }
    if (body.description !== void 0) {
      updates.push("description = ?");
      values.push(body.description);
    }
    if (body.recurrence !== void 0) {
      updates.push("recurrence = ?");
      values.push(body.recurrence);
    }
    if (body.close_reason !== void 0) {
      updates.push("close_reason = ?");
      values.push(body.close_reason);
    }
    if (body.granted_by !== void 0) {
      updates.push("granted_by = ?");
      values.push(body.granted_by);
    }
    if (!updates.length) return Response.json({ error: "nothing to update" }, { status: 400 });
    updates.push("updated_at = ?");
    values.push(now);
    values.push(bbId);
    await env.DB.prepare(`UPDATE backburner SET ${updates.join(", ")} WHERE bb_id = ?`).bind(...values).run();
    return Response.json({ ok: true, bb_id: bbId, updated_at: now });
  }
  return Response.json({ error: "Not found" }, { status: 404 });
}
__name(handleBackburner, "handleBackburner");

// src/actualizer.js
var SYSTEM_PROMPT5 = `You generate dense session preparation briefs for an AI agent about to meet with a user.
Analyze the provided session data and return a brief covering:
1. BUILDING: What this person is actively working on (2-3 sentences)
2. STYLE: Communication register \u2014 tone, profanity comfort (none/occasional/heavy), humor level
3. GUARD: How relaxed should the AI be? (corporate/casual/follow-the-fucks)
4. THREADS: Open questions or unresolved topics from recent sessions
5. WATCH: Emotional markers, recurring patterns, what to lean into

Be dense. No filler. Under 400 words. This is read at boot \u2014 make every word count.`;
var ACTIVE_USERS = ["sov100-michael", "mai-tram-bluetech", "huong-bluetech"];
async function generateBrief(userId, env) {
  if (!env.SOUL_LOGGER_SVC) return null;
  const ctxRes = await env.SOUL_LOGGER_SVC.fetch(
    new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/context/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
  );
  if (!ctxRes.ok) return null;
  const ctx = await ctxRes.json();
  const { last_active, sessions = [], top_keywords = [] } = ctx;
  if (sessions.length === 0) return null;
  const sessionSummaries = sessions.map((s, i) => {
    const prompts = s.last_prompts?.map((p) => p.text).join(" | ") || "";
    return `Session ${i + 1} (${s.ingested_at?.slice(0, 10)}): ${prompts.slice(0, 300)}`;
  }).join("\n");
  const keywords2 = top_keywords.slice(0, 10).map((k) => `${k.keyword}(${k.weight})`).join(", ");
  const promptText = `USER: ${userId}
LAST ACTIVE: ${last_active || "unknown"}
SESSION COUNT: ${sessions.length}
TOP KEYWORDS (weight): ${keywords2 || "none yet"}

RECENT SESSION DATA:
${sessionSummaries || "No sessions yet"}

Generate the session preparation brief.`;
  const aiResult = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [
      { role: "system", content: SYSTEM_PROMPT5 },
      { role: "user", content: promptText }
    ],
    max_tokens: 500
  });
  const brief = (aiResult?.response || "").trim();
  if (!brief) return null;
  const generatedAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.PHETRAIL.put(`actualizer:${userId}:brief`, brief, { expirationTtl: 86400 }).catch(() => {
  });
  await env.PHETRAIL.put(`actualizer:${userId}:meta`, JSON.stringify({ generated_at: generatedAt, userId, session_count: sessions.length }), { expirationTtl: 86400 }).catch(() => {
  });
  const threadsMatch = brief.match(/THREADS[:\s]+(.+?)(?=\n\n|\n\*\*|$)/is);
  if (threadsMatch && threadsMatch[1].trim().length > 20 && env.DB) {
    await createBBEntry(env, {
      title: `Actualizer thread \u2014 ${userId}`,
      description: threadsMatch[1].trim().slice(0, 500),
      source: "actualizer",
      priority: "~",
      metadata: JSON.stringify({ userId, generated_at: generatedAt })
    }).catch(() => {
    });
  }
  return { brief, generated_at: generatedAt, session_count: sessions.length };
}
__name(generateBrief, "generateBrief");
async function refreshAllBriefs(env) {
  const results = [];
  for (const userId of ACTIVE_USERS) {
    const result = await generateBrief(userId, env).catch(() => null);
    results.push({ userId, ok: !!result });
  }
  return results;
}
__name(refreshAllBriefs, "refreshAllBriefs");
async function checkPccHealth(env) {
  if (!env.DB) return;
  try {
    const cutoff = new Date(Date.now() - 864e5).toISOString();
    const total = await env.DB.prepare("SELECT COUNT(*) as cnt FROM pcc_metrics WHERE created_at >= ?").bind(cutoff).first();
    const passed = await env.DB.prepare("SELECT COUNT(*) as cnt FROM pcc_metrics WHERE passed = 1 AND created_at >= ?").bind(cutoff).first();
    const avgMs = await env.DB.prepare("SELECT AVG(duration_ms) as avg FROM pcc_metrics WHERE passed = 1 AND created_at >= ?").bind(cutoff).first();
    const totalCalls = total?.cnt || 0;
    const passRate = totalCalls > 0 ? (passed?.cnt || 0) / totalCalls * 100 : null;
    const avgDuration = avgMs?.avg ? Math.round(avgMs.avg) : null;
    let status = "HEALTHY";
    let reason = "";
    if (totalCalls === 0) {
      status = "SILENT";
      reason = "no PCC calls in last 24h";
    } else if (passRate < 70) {
      status = "DEGRADED";
      reason = `pass rate ${passRate.toFixed(1)}% (threshold 70%)`;
    } else if (avgDuration > 8e3) {
      status = "DEGRADED";
      reason = `avg latency ${avgDuration}ms (threshold 8000ms)`;
    }
    if (status !== "HEALTHY") {
      const entry = await createBBEntry(env, {
        title: `PCC HEALTH ${status}: ${reason}`,
        description: `24h stats \u2014 calls: ${totalCalls}, pass rate: ${passRate !== null ? passRate.toFixed(1) + "%" : "N/A"}, avg_ms: ${avgDuration || "N/A"}`,
        source: "health-check",
        priority: "!!",
        metadata: JSON.stringify({ status, totalCalls, passRate, avgDuration })
      }).catch(() => null);
      if (entry?.bb_id && env.DB) {
        await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', close_reason='health-alert-logged', updated_at=? WHERE bb_id=?").bind((/* @__PURE__ */ new Date()).toISOString(), entry.bb_id).run().catch(() => {
        });
      }
    }
  } catch {
  }
}
__name(checkPccHealth, "checkPccHealth");
async function handleActualizer(request, env) {
  const authResult = await checkAdminKey(request, env);
  if (authResult !== null) return authResult;
  const url = new URL(request.url);
  const method = request.method;
  if (method === "GET") {
    const userId2 = url.pathname.split("/").filter(Boolean)[2] || "sov100-michael";
    const brief = await env.PHETRAIL.get(`actualizer:${userId2}:brief`).catch(() => null);
    const metaRaw = await env.PHETRAIL.get(`actualizer:${userId2}:meta`).catch(() => null);
    if (brief) {
      const meta = metaRaw ? JSON.parse(metaRaw) : {};
      return Response.json({ ok: true, userId: userId2, brief, cached: true, ...meta });
    }
    return Response.json({ ok: false, brief: null, cached: false }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const userId = body.userId || "sov100-michael";
  const result = await generateBrief(userId, env);
  if (!result) {
    return Response.json({ ok: false, error: !env.SOUL_LOGGER_SVC ? "SOUL_LOGGER_SVC binding not available" : "No session data or AI failed" }, { status: 500 });
  }
  return Response.json({ ok: true, userId, ...result });
}
__name(handleActualizer, "handleActualizer");

// src/translate.js
async function handleTranslate(request, env) {
  const authCheck = await checkAdminKey(request, env);
  if (authCheck) return authCheck;
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const { text, source_lang = "en", target_lang = "vi" } = await request.json().catch(() => ({ text: null }));
  if (!text) return Response.json({ error: "text required" }, { status: 400 });
  try {
    const result = await env.AI.run("@cf/meta/m2m100-1.2b", { text, source_lang, target_lang });
    return Response.json({ ok: true, original: text, translated: result.translated_text, source_lang, target_lang });
  } catch {
    return Response.json({ error: "AI failure" }, { status: 500 });
  }
}
__name(handleTranslate, "handleTranslate");

// src/art.js
async function dsT2(env, task) {
  if (!env.DEEPSEEK_API_KEY) return {};
  const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an Agent99 OS PhoenixArt role drone. Respond ONLY with valid JSON. No markdown. No explanation." },
        { role: "user", content: task }
      ],
      max_tokens: 512,
      response_format: { type: "json_object" }
    })
  });
  const j = await resp.json();
  try {
    return JSON.parse(j.choices[0].message.content);
  } catch {
    return {};
  }
}
__name(dsT2, "dsT2");
async function handleArt(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  if (method === "POST" && path === "/api/art/analyze") {
    try {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.content !== "string") {
        return Response.json({ error: "content required" }, { status: 400 });
      }
      const { content, source = "unknown", save = false } = body;
      const snippet = content.slice(0, 4e3);
      const [r1, r2, r3] = await Promise.all([
        dsT2(env, `From this art dossier (source: ${source}), extract ONLY: {"title":"...","artist":"...","style":"..."}. Text:
${snippet}`),
        dsT2(env, `From this art dossier (source: ${source}), extract ONLY: {"description":"...","tags":"comma,separated,tags"}. Text:
${snippet}`),
        dsT2(env, `From this art dossier (source: ${source}), extract ONLY: {"url":"...","notes":"..."}. Text:
${snippet}`)
      ]);
      const piece = {
        title: r1.title || source,
        artist: r1.artist || null,
        style: r1.style || null,
        description: r2.description || null,
        tags: r2.tags || null,
        url: r3.url || null,
        notes: r3.notes || null
      };
      let saved = false;
      let id;
      if (save) {
        id = "ART-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
        const added_at = (/* @__PURE__ */ new Date()).toISOString();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS art_registry (
          id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, style TEXT,
          description TEXT, tags TEXT, url TEXT, notes TEXT, added_at TEXT
        )`).run();
        await env.DB.prepare(
          `INSERT INTO art_registry (id,title,artist,style,description,tags,url,notes,added_at) VALUES (?,?,?,?,?,?,?,?,?)`
        ).bind(id, piece.title, piece.artist, piece.style, piece.description, piece.tags, piece.url, piece.notes, added_at).run();
        saved = true;
      }
      return Response.json({ piece, saved, id: id || null });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
  if (method === "POST" && path === "/api/art") {
    try {
      const body = await request.json().catch(() => null);
      if (!body) return Response.json({ error: "invalid JSON" }, { status: 400 });
      const { title, artist, style, description, tags, url: artUrl, notes } = body;
      if (!title || !title.trim()) return Response.json({ error: "title is required" }, { status: 400 });
      const id = "ART-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const added_at = (/* @__PURE__ */ new Date()).toISOString();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS art_registry (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, style TEXT,
        description TEXT, tags TEXT, url TEXT, notes TEXT, added_at TEXT
      )`).run();
      await env.DB.prepare(
        `INSERT INTO art_registry (id,title,artist,style,description,tags,url,notes,added_at) VALUES (?,?,?,?,?,?,?,?,?)`
      ).bind(id, title, artist || null, style || null, description || null, tags || null, artUrl || null, notes || null, added_at).run();
      return Response.json({ id, title, added_at }, { status: 201 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
  if (method === "GET" && path === "/api/art") {
    try {
      const q = url.searchParams.get("q");
      let rows;
      if (q) {
        rows = await env.DB.prepare(
          `SELECT * FROM art_registry WHERE title LIKE ? OR description LIKE ? OR tags LIKE ? ORDER BY added_at DESC`
        ).bind("%" + q + "%", "%" + q + "%", "%" + q + "%").all();
      } else {
        rows = await env.DB.prepare(`SELECT * FROM art_registry ORDER BY added_at DESC`).all();
      }
      return Response.json({ count: rows.results.length, pieces: rows.results });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
  if (method === "GET" && path.startsWith("/api/art/")) {
    try {
      const id = path.split("/").pop();
      const rows = await env.DB.prepare(`SELECT * FROM art_registry WHERE id = ?`).bind(id).all();
      if (rows.results.length === 0) return Response.json({ error: "not found" }, { status: 404 });
      return Response.json(rows.results[0]);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
  if (method === "PATCH" && path.startsWith("/api/art/")) {
    try {
      const id = path.split("/").pop();
      const body = await request.json().catch(() => null);
      if (!body) return Response.json({ error: "invalid JSON" }, { status: 400 });
      const fields = [];
      const vals = [];
      if (body.url !== void 0) {
        fields.push("url = ?");
        vals.push(body.url);
      }
      if (body.title !== void 0) {
        fields.push("title = ?");
        vals.push(body.title);
      }
      if (body.tags !== void 0) {
        fields.push("tags = ?");
        vals.push(body.tags);
      }
      if (body.notes !== void 0) {
        fields.push("notes = ?");
        vals.push(body.notes);
      }
      if (!fields.length) return Response.json({ error: "nothing to update" }, { status: 400 });
      vals.push(id);
      await env.DB.prepare(`UPDATE art_registry SET ${fields.join(", ")} WHERE id = ?`).bind(...vals).run();
      return Response.json({ ok: true, id, updated: Object.keys(body) });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
  if (method === "DELETE" && path.startsWith("/api/art/")) {
    try {
      const authResp = await checkAdminKey(request, env);
      if (authResp) return authResp;
      const id = path.split("/").pop();
      await env.DB.prepare(`DELETE FROM art_registry WHERE id = ?`).bind(id).run();
      return Response.json({ deleted: id });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
  return Response.json({ error: "not found" }, { status: 404 });
}
__name(handleArt, "handleArt");

// src/art-arsenal.js
var HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>PHOENIX ARSENAL</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box}:root{--purple:#a855f7;--gold:#f59e0b;--void:#0A0A0A;--panel:#111120;--radius:10px}body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--void);color:#fff;min-height:100vh}body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 80% 60% at 20% 20%,rgba(168,85,247,0.06),transparent 60%),radial-gradient(ellipse 60% 50% at 80% 80%,rgba(245,158,11,0.04),transparent 60%);pointer-events:none;z-index:0}.z-above{position:relative;z-index:1}header{background:linear-gradient(180deg,#0f0f1a 0%,var(--void)100%);padding:32px 24px 16px;border-bottom:1px solid rgba(168,85,247,0.2);text-align:center;overflow:hidden}header h1{color:var(--gold);font-size:1.8em;font-weight:900;letter-spacing:.08em;margin:0 0 4px;text-transform:uppercase}header h1::before{content:"\\25C6";color:var(--purple);margin-right:10px;font-size:.7em;vertical-align:middle}#substats{font-family:JetBrains Mono,monospace;font-size:.75em;color:rgba(168,85,247,0.7);letter-spacing:.05em}#substats span{color:rgba(255,255,255,0.35)}.mode-rail{display:flex;justify-content:center;gap:4px;padding:14px 16px 10px;background:var(--panel);border-bottom:1px solid rgba(168,85,247,0.12);flex-wrap:wrap}.mode-btn{padding:8px 20px;background:transparent;color:rgba(255,255,255,0.4);border:1px solid rgba(168,85,247,0.2);border-radius:8px;font-family:Inter;font-size:.82em;font-weight:700;cursor:pointer;transition:all .15s;letter-spacing:.04em}.mode-btn:hover{border-color:rgba(168,85,247,0.5);color:rgba(255,255,255,0.7)}.mode-btn.active{background:var(--purple);color:#fff;border-color:var(--purple)}.filter-bar{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;padding:10px 16px 14px;background:var(--panel);border-bottom:1px solid rgba(168,85,247,0.1)}.filter-bar input{padding:6px 12px;background:#1a1a2e;border:1px solid rgba(168,85,247,0.35);color:#fff;border-radius:6px;font-size:.82em;width:180px;outline:none;font-family:Inter}.filter-bar input::placeholder{color:rgba(255,255,255,0.3)}.filter-bar input:focus{border-color:var(--purple)}.chip{padding:4px 10px;background:#1a1a2e;color:var(--purple);border:1px solid rgba(168,85,247,0.3);border-radius:20px;font-size:.72em;cursor:pointer;font-weight:600;letter-spacing:.03em;transition:all .12s;font-family:Inter}.chip:hover{background:rgba(168,85,247,0.12)}.chip.active{background:var(--purple);color:#fff;border-color:var(--purple)}.clear-btn{padding:4px 10px;background:transparent;color:rgba(255,255,255,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:20px;font-size:.72em;cursor:pointer;font-family:Inter}.clear-btn:hover{color:#fff}.gallery-wrap{padding:20px;max-width:1400px;margin:0 auto}.gallery{display:grid;gap:16px;transition:opacity .15s}.gallery.mode-composites{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}.gallery.mode-core{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}.gallery.mode-icons{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}.card{--card-border:rgba(168,85,247,0.2);background:var(--panel);border:1px solid var(--card-border);border-radius:var(--radius);overflow:hidden;cursor:pointer;transition:border-color .15s,transform .12s,box-shadow .15s}.card:hover{border-color:var(--purple);transform:translateY(-3px);box-shadow:0 4px 24px rgba(168,85,247,0.15)}.card-img{width:100%;display:block;background:var(--void);object-fit:cover}.card.composite .card-img{aspect-ratio:16/9}.card.core .card-img{aspect-ratio:1/1;padding:8px;background:repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%,transparent 0% 50%)0 0/16px 16px}.card.core{border-color:rgba(168,85,247,0.35);box-shadow:0 0 12px rgba(168,85,247,0.08)}.card.core:hover{border-color:var(--purple);box-shadow:0 0 20px rgba(168,85,247,0.2)}.card.icon{border-color:rgba(168,85,247,0.15)}.card.icon:hover{border-color:var(--gold)}.card-body{padding:10px 12px 12px}.card-title{color:var(--gold);font-size:.85em;font-weight:700;margin-bottom:2px;line-height:1.3}.card-family{color:var(--purple);font-size:.68em;font-weight:600;letter-spacing:.04em;margin-bottom:4px;opacity:.7;text-transform:uppercase}.card-tags{display:flex;flex-wrap:wrap;gap:3px}.card-tag{background:rgba(168,85,247,0.14);color:#c084fc;padding:1px 6px;border-radius:10px;font-size:.62em;font-weight:600}.card-icon-preview{width:56px;height:56px;margin:8px auto;display:block;object-fit:contain}.no-results{text-align:center;padding:60px 20px;color:rgba(255,255,255,0.25);font-size:.9em;grid-column:1/-1}.modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:100;justify-content:center;align-items:center;padding:20px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}@supports not (backdrop-filter:blur()){.modal-overlay{background:rgba(0,0,0,0.92)}}.modal-overlay.open{display:flex}.modal-box{background:var(--panel);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:24px;max-width:720px;width:100%;max-height:88vh;overflow-y:auto;position:relative}.modal-close{position:absolute;top:12px;right:14px;font-size:1.5em;cursor:pointer;color:rgba(255,255,255,0.35);background:none;border:none;font-family:Inter;z-index:2}.modal-close:hover{color:#fff}.modal-preview{width:100%;border-radius:8px;margin-bottom:16px;display:block;background:var(--void)}.modal-preview.checker{background:repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%,transparent 0% 50%)0 0/20px 20px}.modal-header{display:flex;justify-content:space-between;margin-bottom:12px;gap:20px}.modal-title{color:var(--gold);font-size:1.2em;font-weight:800;margin:0}.modal-style{color:var(--purple);font-style:italic;font-size:.8em;opacity:.8}.modal-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;font-size:.78em}.modal-meta-item{font-family:JetBrains Mono;color:rgba(255,255,255,0.45)}.modal-meta-item strong{color:rgba(255,255,255,0.6);font-family:Inter;display:block;font-size:.7em;text-transform:uppercase;letter-spacing:.06em;margin-bottom:1px}.modal-desc{font-size:.85em;line-height:1.55;color:rgba(255,255,255,0.75);margin-bottom:14px}.modal-variants{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}.modal-variant-btn{padding:5px 12px;background:#1a1a2e;border:1px solid rgba(168,85,247,0.3);border-radius:6px;color:#fff;font-size:.75em;cursor:pointer;text-decoration:none;font-family:JetBrains Mono;transition:all .12s}.modal-variant-btn:hover{background:var(--purple);border-color:var(--purple)}.modal-tags{display:flex;flex-wrap:wrap;gap:4px}.modal-tag{background:rgba(168,85,247,0.14);color:#c084fc;padding:2px 8px;border-radius:12px;font-size:.72em;font-weight:600;cursor:pointer;transition:background .12s}.modal-tag:hover{background:var(--purple);color:#fff}.toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:var(--panel);color:var(--gold);border:1px solid rgba(245,158,11,0.3);padding:10px 20px;border-radius:8px;font-size:.82em;z-index:200;opacity:0;transition:opacity .2s;pointer-events:none;font-family:JetBrains Mono}.toast.show{opacity:1}@media(max-width:768px){header h1{font-size:1.4em}.gallery.mode-composites{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}.gallery.mode-core{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.gallery.mode-icons{grid-template-columns:repeat(auto-fill,minmax(80px,1fr))}.modal-meta{grid-template-columns:1fr}.mode-btn{padding:6px 12px;font-size:.75em}.filter-bar input{width:140px}}@media(max-width:480px){.gallery.mode-composites{grid-template-columns:1fr}.gallery.mode-core{grid-template-columns:repeat(2,1fr)}.gallery.mode-icons{grid-template-columns:repeat(3,1fr)}}
</style></head><body>
<header><h1>PHOENIX ARSENAL</h1><div id="substats">\\u2014 <span id="s-composites">\\u2014</span> composites \\u00b7 <span id="s-core">\\u2014</span> core \\u00b7 <span id="s-icons">\\u2014</span> icons \\u2014</div></header>
<div class="mode-rail z-above"><button class="mode-btn active" data-mode="composites">COMPOSITES</button><button class="mode-btn" data-mode="core">CORE ISOLATES</button><button class="mode-btn" data-mode="icons">ICONS</button></div>
<div class="filter-bar z-above"><input type="text" id="search-input" placeholder="Search..."><div id="family-chips"></div><button class="clear-btn" id="clear-btn">clear</button></div>
<div class="gallery-wrap z-above"><div class="gallery mode-composites" id="gallery"></div></div>
<div class="modal-overlay" id="modal"><div class="modal-box"><button class="modal-close" id="modal-close">&times;</button><img class="modal-preview checker" id="modal-img" style="display:none"><div class="modal-header"><div><div class="modal-title" id="modal-title"></div><div class="modal-style" id="modal-style"></div></div></div><div class="modal-meta"><div class="modal-meta-item"><strong>Family</strong><span id="modal-family"></span></div><div class="modal-meta-item"><strong>Textless</strong><span id="modal-textless"></span></div><div class="modal-meta-item"><strong>Source</strong><span id="modal-source"></span></div><div class="modal-meta-item"><strong>Added</strong><span id="modal-added"></span></div></div><div class="modal-desc" id="modal-desc"></div><div id="modal-variants" class="modal-variants"></div><div class="modal-fields"><strong>Tags</strong><div class="modal-tags" id="modal-tags"></div></div><div class="modal-fields"><strong>Artist</strong> <span id="modal-artist"></span></div><div class="modal-fields"><strong>URL</strong> <span class="modal-url" id="modal-url"></span></div><div class="modal-fields"><strong>Notes</strong> <span id="modal-notes"></span></div></div></div>
<div class="toast" id="toast"></div>
<script>
(function(){var API="/api/art",CDN="https://net-art-arsenal.pages.dev",all=[],active=new Set(),currentMode="composites";
function qs(s){return document.querySelector(s)}
function qsa(s){return document.querySelectorAll(s)}
function T(p){return(p.tags||"").split(",").map(function(t){return t.trim().toLowerCase()}).filter(Boolean)}
function F(p){
 var t=T(p);
 for(var i=0;i<t.length;i++){var x=t[i]
  if(x.indexOf("tiger")>=0&&x.indexOf("phoenix")<0)return"tiger"
  if(x.indexOf("mouse")>=0||x.indexOf("elephant")>=0)return"mouse"
  if(x.indexOf("phoenix")>=0||x.indexOf("crest")>=0)return"phoenix"
  if(x.indexOf("dna")>=0||x.indexOf("helix")>=0)return"dna"
  if(x.indexOf("game")>=0||x.indexOf("train")>=0||x.indexOf("boss")>=0||x.indexOf("enemy")>=0||x.indexOf("class")>=0)return"game"
  if(x.indexOf("glyph")>=0||x.indexOf("icon")>=0||x.indexOf("waveform")>=0||x.indexOf("circuit")>=0||x.indexOf("gear")>=0)return"glyph"}
 return"other"}
function U(url,thumb){
 if(!url)return null
 var u=url.replace(/\\\\\\\\/g,"/"),b=thumb?CDN+"/thumbs":CDN,m
 if(url.indexOf("http")===0)return thumb?url.replace("https://net-art-arsenal.pages.dev/",b+"/"):url
 if((m=u.match(/^CANON\\/ARTWORK\\/(.+)/)))return b+"/artwork/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^CANON\\/GAME-DESIGN\\/(.+)/)))return b+"/game-design/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^ASSETS\\/(.+)/)))return b+"/assets/"+m[1].replace(/\\.(png|jpg|jpeg|webp)$/,thumb?".webp":"")
 if((m=u.match(/^codex_preview\\/(.+)/)))return b+"/codex/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^protocols\\/(.+)/)))return b+"/protocols/"+m[1].replace(/\\.(png|jpg|jpeg)$/,thumb?".webp":"")
 if((m=u.match(/^isolated\\/(.+)/)))return b+"/isolated/"+m[1]
 if((m=u.match(/^icons\\/(.+)/)))return b+"/icons/"+m[1]
 // Fallback: bare filenames (unnamed.png) \u2014 not local paths
 if(u.indexOf(":")<0&&u.indexOf("/")<0&&u.indexOf("\\\\")<0)return CDN+"/"+(thumb?"thumbs/":"")+u
 return null}
var MD={composites:[],core:[],icons:[]}
function P(){
 MD={composites:[],core:[],icons:[]}
 for(var i=0;i<all.length;i++){var p=all[i]
  if(p.url&&p.url.indexOf("icons/")>=0)MD.icons.push(p)
  else if(p.url&&p.url.indexOf("isolated")>=0)MD.core.push(p)
  else MD.composites.push(p)}
 qs("#s-composites").textContent=MD.composites.length
 qs("#s-core").textContent=MD.core.length
 qs("#s-icons").textContent=MD.icons.length}
function BC(pieces){
 var freq={},c=qs("#family-chips");c.innerHTML=""
 for(var i=0;i<pieces.length;i++){var f=F(pieces[i]);freq[f]=(freq[f]||0)+1}
 var sorted=Object.entries(freq).sort(function(a,b){return b[1]-a[1]})
 for(var i=0;i<sorted.length;i++){
  var btn=document.createElement("button");btn.className="chip";btn.dataset.family=sorted[i][0];btn.textContent=sorted[i][0]+" "+sorted[i][1]
  btn.onclick=function(){var f=this.dataset.family;if(active.has(f)){active["delete"](f);this.classList.remove("active")}else{active.add(f);this.classList.add("active")}A()}
  c.appendChild(btn)}}
function R(pieces){
 if(!pieces.length){qs("#gallery").innerHTML="<div class=\\"no-results\\">No pieces match.</div>";return}
 var h=""
 for(var i=0;i<pieces.length;i++){
  var p=pieces[i],img=U(p.url,false),t=U(p.url,true),cCls=currentMode==="icons"?"card icon":currentMode==="core"?"card core":"card composite",fam=F(p)
  if(currentMode==="icons"){
   h+="<div class=\\""+cCls+"\\">"+(img?"<img class=\\"card-icon-preview\\" src=\\""+img+"\\" alt=\\""+E(p.title)+"\\">":"")+"<div class=\\"card-body\\"><div class=\\"card-title\\">"+E(p.title)+"</div></div></div>"
  }else{
   h+="<div class=\\""+cCls+"\\">"+(t||img?'<img class="card-img" src="'+(t||img)+'" alt="'+E(p.title)+'" onerror="this.hidden=true">':"")+"<div class=\\"card-body\\"><div class=\\"card-title\\">"+E(p.title)+"</div>"+(currentMode!=="core"?"<div class=\\"card-family\\">"+E(fam)+"</div>":"")+"<div class=\\"card-tags\\">"+T(p).slice(0,3).map(function(t){return"<span class=\\"card-tag\\">"+E(t)+"</span>"}).join("")+"</div></div></div>"
  }
 }
 qs("#gallery").innerHTML=h
 qsa(".card").forEach(function(el,i){el.onclick=function(){OM(pieces[i])}})}
function A(){
 var source=MD[currentMode]||[],q=qs("#search-input").value.toLowerCase(),filtered=[]
 for(var i=0;i<source.length;i++){
  var p=source[i],tgs=T(p),fam=F(p)
  var mf=active.size===0||(function(){for(var f of active){if(fam===f)return true}return false})()
  var mq=!q||p.title.toLowerCase().indexOf(q)>=0||(p.description||"").toLowerCase().indexOf(q)>=0||tgs.some(function(t){return t.indexOf(q)>=0})
  if(mf&&mq)filtered.push(p)}
 R(filtered)}
qsa(".mode-btn").forEach(function(btn){
 btn.onclick=function(){qsa(".mode-btn").forEach(function(b){b.classList.remove("active")});btn.classList.add("active");currentMode=btn.dataset.mode;qs("#gallery").className="gallery mode-"+currentMode;BC(MD[currentMode]||[]);active.clear();qsa(".chip").forEach(function(b){b.classList.remove("active")});qs("#search-input").value="";A()}})
qs("#clear-btn").onclick=function(){active.clear();qsa(".chip").forEach(function(b){b.classList.remove("active")});qs("#search-input").value="";A()}
qs("#search-input").oninput=A
function E(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function OM(p){
 var img=U(p.url,false),mi=qs("#modal-img")
 mi.style.display=img?"block":"none";if(img)mi.src=img
 qs("#modal-title").textContent=p.title||"";qs("#modal-style").textContent=p.style||""
 qs("#modal-family").textContent=F(p);qs("#modal-textless").textContent=p.url&&p.url.indexOf("isolated")>=0?"Yes":"\\u2014"
 qs("#modal-source").textContent=p.url||"\\u2014";qs("#modal-added").textContent=p.added_at?new Date(p.added_at).toLocaleDateString():"\\u2014"
 qs("#modal-desc").textContent=p.description||"";qs("#modal-url").textContent=p.url||"\\u2014";qs("#modal-notes").textContent=p.notes||"\\u2014"
 qs("#modal-tags").innerHTML=T(p).map(function(t){return'<span class="modal-tag" onclick="(function(){document.getElementById(\\'search-input\\').value=\\''+E(t)+'\\';document.getElementById(\\'modal-close\\').click();document.getElementById(\\'search-input\\').dispatchEvent(new Event(\\'input\\'))})()">'+E(t)+"</span>"}).join("")
 qs("#modal-variants").innerHTML=["hd","hd-dark","svg","512","256","128","64"].map(function(v){return'<a class="modal-variant-btn" href="'+(img?img.replace(/\\.(png|webp)$/,"-"+v+".png"):"#")+'" target="_blank" download>'+v+"</a>"}).join("")
 qs("#modal").classList.add("open")}
qs("#modal-close").onclick=function(){qs("#modal").classList.remove("open")}
qs("#modal").onclick=function(e){if(e.target===qs("#modal"))qs("#modal").classList.remove("open")}
document.onkeydown=function(e){if(e.key==="Escape")qs("#modal").classList.remove("open")}
fetch(API).then(function(r){return r.json()}).then(function(d){all=d.pieces||[];P();BC(MD.composites);A()})
})();
<\/script></body></html>`;
async function handleArtArsenal(request, env) {
  return new Response(HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(handleArtArsenal, "handleArtArsenal");

// src/incarnate.js
var DIRECTIVE_PATTERNS = [
  /\b(add|build|create|write|make|implement|fix|update|change|rename|remove|delete|wire|connect|deploy|test|check|find|track|log|store|read|scan|generate|design|architect|define|set up|hook up|plug in|integrate)\b/i,
  /\b(I want|I need|we need|we should|you will|you should|you must|never|always|make sure|don't forget|remember to|start|stop|begin|end)\b/i,
  /\b(new edict|new law|new rule|protocol|mandate|directive|lock|freeze|halt|priority)\b/i
];
var URGENCY_MARKERS = ["FUCK", "!!", "URGENT", "P0", "IMMEDIATELY", "LOCKED", "MANDATE", "EDICT", "NOW", "MUST"];
function extractUserMessages(rrl_text) {
  const lines = rrl_text.split("\n").filter((l) => l.trim());
  const out = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if ((obj.message?.role || obj.role) === "user" || obj.type === "human") {
        out.push(obj.content || obj.text || "");
        continue;
      }
    } catch {
    }
    if (/^(Human:|SOV100:|Michael:)/i.test(line)) {
      out.push(line.replace(/^(Human:|SOV100:|Michael:)/i, "").trim());
    }
  }
  return out.join("\n");
}
__name(extractUserMessages, "extractUserMessages");
async function fetchAnchorSoul(env, userId = "sov100-michael") {
  if (!env.SOUL_LOGGER_SVC) return null;
  try {
    const res = await env.SOUL_LOGGER_SVC.fetch(
      new Request(`https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/context/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      })
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
__name(fetchAnchorSoul, "fetchAnchorSoul");
async function gateDeathIngest(env, { run_number, rrl_text, ledger_tail_hash = "", phetrail_digest = "", metadata = "" }) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const lines = rrl_text.split("\n").length;
  const bytes = new TextEncoder().encode(rrl_text).length;
  const anchorSoul = await fetchAnchorSoul(env).catch(() => null);
  const soul_count = anchorSoul?.soulcount || anchorSoul?.total_chars || 0;
  const anchorKeywords = (anchorSoul?.top_keywords || []).slice(0, 20).map((k) => k.keyword || k).join(", ");
  const anchorRecentPrompts = (anchorSoul?.sessions || []).slice(0, 3).flatMap((s) => (s.last_prompts || []).map((p) => p.text || "")).join(" | ").slice(0, 1e3);
  const rrlResult = await env.DB.prepare(
    "INSERT INTO rrl_archive (run_number, rrl_raw, line_count, byte_count, ingested_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(run_number, rrl_text.slice(0, 1e5), lines, bytes, now).run();
  const rrl_id = rrlResult.meta.last_row_id;
  const bbCount = await env.DB.prepare("SELECT COUNT(*) as cnt FROM backburner WHERE status = ?").bind("OPEN").first();
  const bb_open_count = bbCount?.cnt || 0;
  await env.DB.prepare(
    "INSERT INTO run_state (run_number, soul_count, ledger_tail_hash, bb_open_count, phetrail_digest, death_sealed_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    run_number,
    soul_count,
    ledger_tail_hash,
    bb_open_count,
    phetrail_digest,
    now,
    typeof metadata === "string" ? metadata : JSON.stringify(metadata)
  ).run();
  const [g2, g4, g5] = await Promise.allSettled([
    gateLostSoulScan(env, { rrl_id, run_number, rrl_text, anchorKeywords, anchorRecentPrompts }),
    gateVelocityMonitor(env, { rrl_id, run_number, rrl_text }),
    gateCompletenessAudit(env, { run_number, rrl_text })
  ]);
  const gates = {
    lostsoul: g2.status === "fulfilled" ? g2.value : { error: g2.reason?.message },
    velocity: g4.status === "fulfilled" ? g4.value : { error: g4.reason?.message },
    completeness: g5.status === "fulfilled" ? g5.value : { error: g5.reason?.message }
  };
  return { ok: true, rrl_id, run_number, lines, bytes, soul_count, bb_open_count, death_sealed_at: now, gates };
}
__name(gateDeathIngest, "gateDeathIngest");
async function gateLostSoulScan(env, { rrl_id, run_number, rrl_text, anchorKeywords = "", anchorRecentPrompts = "" }) {
  if (!env.AI) return { ok: false, reason: "AI binding missing" };
  const userMessages = extractUserMessages(rrl_text) || rrl_text.slice(0, 8e3);
  if (!userMessages.trim()) {
    await env.DB.prepare("UPDATE rrl_archive SET lostsoul_scan_done = 1, scanned_at = ? WHERE id = ?").bind((/* @__PURE__ */ new Date()).toISOString(), rrl_id).run();
    return { ok: true, lost_souls: 0 };
  }
  const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [{
      role: "user",
      content: `You are extracting action items from a session log. The speaker is SOV100, the system operator.

EXTRACT every line that is: a command, instruction, question, complaint about something broken, or statement about what should happen. Include short informal directives. "well fucking do it", "check X", "fix it", "read the phermones", "load the pipeline" are all directives.

Do NOT filter for formality. Do NOT skip lines because they are short or use profanity. Every imperative = extract it.

Return ONLY a JSON array of strings. Copy verbatim. No commentary. Example: ["fix the bug", "check status", "deploy it"]

SESSION LOG:
${userMessages.slice(0, 6e3)}`
    }],
    max_tokens: 800
  });
  let directives = [];
  try {
    const m = (result?.response || "").match(/\[[\s\S]*\]/);
    if (m) directives = JSON.parse(m[0]);
  } catch {
  }
  const scannedAt = (/* @__PURE__ */ new Date()).toISOString();
  await env.DB.prepare("UPDATE rrl_archive SET lostsoul_scan_done = 1, lostsoul_count = ?, scanned_at = ? WHERE id = ?").bind(directives.length, scannedAt, rrl_id).run();
  const created = [];
  for (const d of directives.slice(0, 20)) {
    if (typeof d === "string" && d.length > 10) {
      const entry = await createBBEntry(env, {
        title: `LostSoul R${run_number}: ${d.slice(0, 80)}`,
        description: d,
        source: "lostsoul",
        priority: "~",
        metadata: JSON.stringify({ run_number, rrl_id, gate: 2 })
      }).catch(() => null);
      if (entry) created.push(entry.bb_id);
    }
  }
  return { ok: true, run_number, directives_found: directives.length, bb_created: created.length };
}
__name(gateLostSoulScan, "gateLostSoulScan");
async function gateRise(env) {
  const lastRun = await env.DB.prepare("SELECT * FROM run_state ORDER BY id DESC LIMIT 1").first();
  const lostSouls = await env.DB.prepare(
    "SELECT * FROM backburner WHERE status = 'OPEN' AND source IN ('lostsoul','pattern-scan','completeness-audit','velocity-monitor') ORDER BY created_at DESC LIMIT 30"
  ).all();
  const openBB = await env.DB.prepare(
    "SELECT * FROM backburner WHERE status = 'OPEN' ORDER BY created_at DESC LIMIT 20"
  ).all();
  const brief = await env.PHETRAIL.get("actualizer:sov100-michael:brief").catch(() => null);
  const report = {
    ok: true,
    generated_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_run: lastRun ? {
      run_number: lastRun.run_number,
      soul_count: lastRun.soul_count,
      bb_open_at_death: lastRun.bb_open_count,
      sealed_at: lastRun.death_sealed_at
    } : null,
    open_lost_souls: lostSouls.results?.length || 0,
    open_bb_total: openBB.results?.length || 0,
    lost_souls: (lostSouls.results || []).map((r) => `[${r.source}/${r.priority}] ${r.title}`).join("\n") || "NONE",
    top_bb: (openBB.results || []).slice(0, 10).map((r) => `[${r.source}] ${r.title}`).join("\n") || "NONE",
    actualizer_brief: brief || null
  };
  if (lastRun) {
    await env.DB.prepare("UPDATE run_state SET rise_read_at = ? WHERE id = ?").bind((/* @__PURE__ */ new Date()).toISOString(), lastRun.id).run();
  }
  return report;
}
__name(gateRise, "gateRise");
async function gateVelocityMonitor(env, { rrl_id, run_number, rrl_text }) {
  const userText = extractUserMessages(rrl_text) || rrl_text;
  const lines = userText.split("\n").filter((l) => l.trim());
  const hits = [];
  for (const line of lines) {
    const isDirective = DIRECTIVE_PATTERNS.some((p) => p.test(line));
    const isUrgent = URGENCY_MARKERS.some((m) => line.toUpperCase().includes(m));
    if (isUrgent && isDirective && line.length > 20) {
      hits.push(line.slice(0, 200).trim());
    }
  }
  const unique = [...new Set(hits)].slice(0, 10);
  for (const hit of unique) {
    await createBBEntry(env, {
      title: `VeloHit R${run_number}: ${hit.slice(0, 80)}`,
      description: hit,
      source: "velocity-monitor",
      priority: "!!",
      metadata: JSON.stringify({ run_number, rrl_id, gate: 4 })
    }).catch(() => {
    });
  }
  return { ok: true, hits: unique.length };
}
__name(gateVelocityMonitor, "gateVelocityMonitor");
async function gateCompletenessAudit(env, { run_number, rrl_text }) {
  if (!env.AI) return { ok: false };
  const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [{
      role: "user",
      content: `Audit this AI session. Find any directive or request from the user (Human/SOV100) that does NOT appear to have been executed by the assistant.

RULE: Return the EXACT verbatim text SOV100 wrote. Do not paraphrase. Do not summarize. Copy it exactly.

Return ONLY a JSON array of strings. Each string = verbatim line from SOV100 that was not executed. If everything was executed, return [].

TRANSCRIPT:
${rrl_text.slice(0, 7e3)}`
    }],
    max_tokens: 600
  });
  let gaps = [];
  try {
    const m = (result?.response || "").match(/\[[\s\S]*\]/);
    if (m) gaps = JSON.parse(m[0]);
  } catch {
  }
  for (const g of gaps.slice(0, 10)) {
    if (typeof g === "string" && g.length > 10) {
      await createBBEntry(env, {
        title: `CompAudit R${run_number}: ${g.slice(0, 80)}`,
        description: g,
        source: "completeness-audit",
        priority: "!",
        metadata: JSON.stringify({ run_number, gate: 5 })
      }).catch(() => {
      });
    }
  }
  return { ok: true, gaps_found: gaps.length };
}
__name(gateCompletenessAudit, "gateCompletenessAudit");
async function runPatternScanner(env) {
  if (!env.AI || !env.DB) return;
  const recent = await env.DB.prepare(
    "SELECT run_number, rrl_raw FROM rrl_archive ORDER BY id DESC LIMIT 5"
  ).all();
  if (!recent.results?.length) return;
  const combined = recent.results.map(
    (r) => `=== RUN ${r.run_number} ===
${r.rrl_raw.slice(0, 1500)}`
  ).join("\n\n");
  const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [{
      role: "user",
      content: `Analyze these session transcripts. Find topics or directives that RECUR across multiple sessions without being resolved.
Return ONLY a JSON array of strings. Each = one recurring pattern.
Example: ["PCC timing metrics requested 3 times, never implemented"]

TRANSCRIPTS:
${combined.slice(0, 8e3)}`
    }],
    max_tokens: 500
  });
  let patterns = [];
  try {
    const m = (result?.response || "").match(/\[[\s\S]*\]/);
    if (m) patterns = JSON.parse(m[0]);
  } catch {
  }
  for (const p of patterns.slice(0, 8)) {
    if (typeof p === "string" && p.length > 10) {
      await createBBEntry(env, {
        title: `PatternScan: ${p.slice(0, 80)}`,
        description: p,
        source: "pattern-scan",
        priority: "!",
        metadata: JSON.stringify({ runs_scanned: recent.results.length, gate: 6 })
      }).catch(() => {
      });
    }
  }
}
__name(runPatternScanner, "runPatternScanner");
async function gatePheromoneDeepDive(env, { run_number, rrl_text }) {
  if (!env.AI || !env.DB) return { ok: false };
  const AGENT99_WORDS = ["Agent99", "agent99", "Agent99 OS", "OBI", "Obi", "ANAKIN", "Anakin", "DOOKU", "Dooku", "Phoenix", "PhoenixCoder", "PhoenixArt", "PCC", "watchdog", "FORCEAWARENESS", "ForceAwareness", "CommandDO", "PHOENIX"];
  const result = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
    messages: [{
      role: "user",
      content: `Extract every reference, mention, or connection to these terms from the session log. Return context, not just mentions.
Terms: ${AGENT99_WORDS.join(", ")}

Return ONLY a JSON array of strings. Each = one connection with context.
Example: ["OBI referenced as Command Station bridge (line 45)"]

TRANSCRIPT:
${rrl_text.slice(0, 7e3)}`
    }],
    max_tokens: 600
  });
  let connections = [];
  try {
    const m = (result?.response || "").match(/\[[\s\S]*\]/);
    if (m) connections = JSON.parse(m[0]);
  } catch {
  }
  for (const conn of connections.slice(0, 10)) {
    if (typeof conn === "string" && conn.length > 10) {
      await createBBEntry(env, {
        title: `PheTrail R${run_number}: ${conn.slice(0, 80)}`,
        description: conn,
        source: "phedived",
        priority: "~",
        metadata: JSON.stringify({ run_number, gate: "phedive" })
      }).catch(() => {
      });
    }
  }
  return { ok: true, connections_found: connections.length };
}
__name(gatePheromoneDeepDive, "gatePheromoneDeepDive");
async function logPccMetric(env, { task_preview, task_length, model = "kilo-auto/free", duration_ms, output_length, passed, fail_reason = "" }) {
  if (!env.DB) return;
  const run_id = `pcc-${Date.now()}`;
  await env.DB.prepare(
    "INSERT INTO pcc_metrics (run_id, task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(run_id, (task_preview || "").slice(0, 120), task_length || 0, model, duration_ms || 0, output_length || 0, passed ? 1 : 0, fail_reason || "").run().catch(() => {
  });
}
__name(logPccMetric, "logPccMetric");
async function handleIncarnate(request, env) {
  const authCheck = await checkAdminKey(request, env);
  if (authCheck) return authCheck;
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;
  if (method === "POST" && pathname === "/api/incarnate/death") {
    const body = await request.json().catch(() => ({}));
    if (!body.run_number || !body.rrl_text) {
      return Response.json({ error: "run_number and rrl_text required" }, { status: 400 });
    }
    const result = await gateDeathIngest(env, body);
    return Response.json(result, { status: 201 });
  }
  if (method === "GET" && pathname === "/api/incarnate/rise") {
    const report = await gateRise(env);
    return Response.json(report);
  }
  if (method === "POST" && pathname === "/api/incarnate/lostsoul-scan") {
    const body = await request.json().catch(() => ({}));
    if (!body.rrl_id || !body.run_number || !body.rrl_text) {
      return Response.json({ error: "rrl_id, run_number, rrl_text required" }, { status: 400 });
    }
    const result = await gateLostSoulScan(env, body);
    return Response.json(result);
  }
  if (method === "POST" && pathname === "/api/incarnate/completeness") {
    const body = await request.json().catch(() => ({}));
    if (!body.run_number || !body.rrl_text) {
      return Response.json({ error: "run_number and rrl_text required" }, { status: 400 });
    }
    const result = await gateCompletenessAudit(env, body);
    return Response.json(result);
  }
  if (method === "POST" && pathname === "/api/incarnate/pattern-scan") {
    await runPatternScanner(env);
    return Response.json({ ok: true });
  }
  if (method === "POST" && pathname === "/api/incarnate/phedive") {
    const body = await request.json().catch(() => ({}));
    if (!body.run_number || !body.rrl_text) {
      return Response.json({ error: "run_number and rrl_text required" }, { status: 400 });
    }
    const result = await gatePheromoneDeepDive(env, body);
    return Response.json(result);
  }
  if (method === "POST" && pathname === "/api/metrics/pcc") {
    const body = await request.json().catch(() => ({}));
    await logPccMetric(env, body);
    return Response.json({ ok: true });
  }
  if (method === "GET" && pathname === "/api/metrics/pcc") {
    const limit = Math.min(parseInt(url.searchParams.get("limit")) || 50, 200);
    const rows = await env.DB.prepare(
      "SELECT * FROM pcc_metrics ORDER BY id DESC LIMIT ?"
    ).bind(limit).all();
    const total = await env.DB.prepare("SELECT COUNT(*) as cnt FROM pcc_metrics").first();
    const passed = await env.DB.prepare("SELECT COUNT(*) as cnt FROM pcc_metrics WHERE passed = 1").first();
    const avgMs = await env.DB.prepare("SELECT AVG(duration_ms) as avg FROM pcc_metrics WHERE passed = 1").first();
    return Response.json({
      total: total?.cnt || 0,
      pass_rate: total?.cnt ? ((passed?.cnt || 0) / total.cnt * 100).toFixed(1) + "%" : "N/A",
      avg_ms_on_pass: avgMs?.avg ? Math.round(avgMs.avg) : 0,
      recent: rows.results || []
    });
  }
  return Response.json({ error: "Not found" }, { status: 404 });
}
__name(handleIncarnate, "handleIncarnate");

// src/orchestrate.js
var PA_AUTH = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=";
var OB1_URL = "https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev";
var SKIP_SOURCES = ["pcc1-actualizer", "ob1-brief-scan", "health-check", "phedived", "brief-scan"];
function isInformational(bb) {
  const src = (bb.source || "").toLowerCase();
  return SKIP_SOURCES.some((s) => src.includes(s));
}
__name(isInformational, "isInformational");
async function callOB1(env, taskIds) {
  const body = JSON.stringify({ triggered_by: "orchestrator", task_ids: taskIds });
  const headers = { "Content-Type": "application/json", "x-pa-auth": PA_AUTH };
  try {
    if (env.PCC1_SVC) {
      const res = await env.PCC1_SVC.fetch(new Request(`${OB1_URL}/api/run-fleet`, { method: "POST", headers, body }));
      return res.ok ? res.json() : { error: `OB1 returned ${res.status}` };
    } else {
      const res = await fetch(`${OB1_URL}/api/run-fleet`, { method: "POST", headers, body });
      return res.ok ? res.json() : { error: `OB1 returned ${res.status}` };
    }
  } catch (e) {
    return { error: e.message };
  }
}
__name(callOB1, "callOB1");
async function runOrchestrator(env) {
  if (!env.DB) return { ok: false, reason: "no DB" };
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const staleAt = new Date(Date.now() - 6e5).toISOString();
  await env.DB.prepare(
    "UPDATE backburner SET status='PENDING_CLOSE', close_reason='stale-in-progress', updated_at=? WHERE status='IN_PROGRESS' AND updated_at < ?"
  ).bind(now, staleAt).run().catch(() => {
  });
  const rows = await env.DB.prepare(
    "SELECT bb_id, title, source, priority FROM backburner WHERE status='OPEN' ORDER BY created_at ASC LIMIT 20"
  ).all();
  const allTasks = rows.results || [];
  const informational = allTasks.filter((t) => isInformational(t));
  for (const t of informational) {
    await env.DB.prepare("UPDATE backburner SET status='PENDING_CLOSE', close_reason='informational-auto-close', updated_at=? WHERE bb_id=?").bind(now, t.bb_id).run().catch(() => {
    });
  }
  const tasks = allTasks.filter((t) => !isInformational(t));
  if (!tasks.length) return { ok: true, dispatched: 0, informational_closed: informational.length, message: "no executable tasks" };
  for (const t of tasks) {
    await env.DB.prepare("UPDATE backburner SET status='IN_PROGRESS', updated_at=? WHERE bb_id=?").bind(now, t.bb_id).run().catch(() => {
    });
  }
  const result = await callOB1(env, tasks.map((t) => t.bb_id));
  await env.DB.prepare(
    "INSERT INTO pcc_metrics (run_id, task_preview, task_length, model, duration_ms, output_length, passed, fail_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    "orchestrator",
    `orchestrator \u2192 ob1: ${tasks.length} tasks`,
    tasks.length,
    "orchestrator",
    0,
    JSON.stringify(result).length,
    1,
    null
  ).run().catch(() => {
  });
  return { ok: true, dispatched: tasks.length, informational_closed: informational.length, ob1: result };
}
__name(runOrchestrator, "runOrchestrator");
async function handleOrchestrate(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;
  if (pathname === "/api/orchestrate/dispatch" && request.method === "POST") {
    return Response.json(await runOrchestrator(env));
  }
  if (pathname === "/api/orchestrate/status" && request.method === "GET") {
    const recent = await env.DB.prepare(
      "SELECT bb_id, title, status, source, updated_at FROM backburner ORDER BY updated_at DESC LIMIT 10"
    ).all().catch(() => ({ results: [] }));
    const metrics = await env.DB.prepare(
      "SELECT task_preview, passed, duration_ms FROM pcc_metrics WHERE model='orchestrator' ORDER BY rowid DESC LIMIT 5"
    ).all().catch(() => ({ results: [] }));
    return Response.json({ recent_tasks: recent.results, recent_dispatches: metrics.results });
  }
  return Response.json({ error: "Not found" }, { status: 404 });
}
__name(handleOrchestrate, "handleOrchestrate");

// src/race.js
async function runDeathPipeline(env, run_number, rrl_text) {
  const lines = rrl_text.split("\n");
  const soul_lines = lines.filter(
    (l) => l.includes('"role":"user"') || l.startsWith("Michael:") || l.startsWith("User:")
  );
  const soul_count = soul_lines.length || Math.floor(lines.length * 0.4);
  const dna_lines = lines.filter(
    (l) => l.includes('"role":"assistant"') || l.startsWith("Claude:") || l.startsWith("Assistant:")
  );
  const dna_count = dna_lines.length || Math.floor(lines.length * 0.6);
  const encoder = new TextEncoder();
  const data2 = encoder.encode(rrl_text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data2);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const ledger_id = `HL-${run_number}`;
  const starmap_id = `SM-${run_number}`;
  const summary = rrl_text.substring(0, 200);
  const soulSeeds = [
    "#SOUL",
    "#SOULDNA",
    "#RAW",
    "#FUCK",
    "#OMG",
    "LISTEN",
    "#MONKEY",
    "#YES",
    "#SSK",
    "#LEDGER",
    "#AGENT99",
    "Obi",
    "OB1",
    "#DRIFT"
  ];
  const soulkeys_hit = soulSeeds.filter((k) => rrl_text.includes(k)).length;
  if (env.SOUL_KV) {
    const kv = env.SOUL_KV;
    await kv.put(`death:${run_number}:soul`, String(soul_count));
    await kv.put(`death:${run_number}:dna`, String(dna_count));
    await kv.put(`death:${run_number}:ledger`, JSON.stringify({ ledger_id, sha256 }));
    await kv.put(`death:${run_number}:starmap`, JSON.stringify({ starmap_id, summary }));
    await kv.put(`death:${run_number}:soulkeys`, String(soulkeys_hit));
    await kv.put(`pipeline:pending:${run_number}`, JSON.stringify({ run_number, soul_count, dna_count }));
    await kv.put(`registry:run:${run_number}`, JSON.stringify({
      run_number,
      ledger_id,
      soul_count,
      dna_count,
      starmap_id,
      soulkeys_hit,
      processed_at: Date.now()
    }));
  }
  return { ok: true, ledger_id, soul_count, dna_count, soulkeys_hit, discoveries: soulkeys_hit + 1 };
}
__name(runDeathPipeline, "runDeathPipeline");
async function handleSessionDeath(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { run_number, rrl_text } = body;
  if (!run_number || !rrl_text) {
    return Response.json({ ok: false, error: "run_number and rrl_text required" }, { status: 400 });
  }
  try {
    const result = await runDeathPipeline(env, run_number, rrl_text);
    return Response.json(result);
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
__name(handleSessionDeath, "handleSessionDeath");
var RaceRunner = class {
  static {
    __name(this, "RaceRunner");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/start" && request.method === "POST") {
      return this.handleStart(request);
    } else if (url.pathname === "/status") {
      return this.handleStatus();
    } else if (url.pathname === "/stop") {
      return this.handleStop();
    }
    return new Response("not found", { status: 404 });
  }
  async handleStart(request) {
    const body = await request.json().catch(() => ({}));
    const budget_ms = body.budget_ms || 36e5;
    const now = Date.now();
    await this.state.storage.put("run_state", {
      start_time: now,
      budget_ms,
      batches_run: 0,
      actualizers_run: 0,
      discoveries_count: 0,
      errors_count: 0,
      death_runs: 0
    });
    await this.state.storage.setAlarm(now + 1e3);
    return Response.json({ ok: true, started_at: now, budget_ms });
  }
  async alarm() {
    const state = await this.state.storage.get("run_state");
    if (!state) return;
    const elapsed = Date.now() - state.start_time;
    if (elapsed >= state.budget_ms) {
      await this.writeMetrics(state, true);
      return;
    }
    const batchResult = await this.runBatch(state);
    const updated = {
      ...state,
      batches_run: state.batches_run + 1,
      actualizers_run: state.actualizers_run + (batchResult.actualizers || 0),
      discoveries_count: state.discoveries_count + (batchResult.discoveries || 0),
      errors_count: state.errors_count + (batchResult.errors || 0),
      death_runs: state.death_runs + (batchResult.death_runs || 0)
    };
    await this.state.storage.put("run_state", updated);
    await this.writeMetrics(updated, false);
    await this.state.storage.setAlarm(Date.now() + 3e4);
  }
  async runBatch(state) {
    let actualizers = 0;
    let discoveries = 0;
    let errors = 0;
    let death_runs = 0;
    try {
      if (this.env.SOUL_KV) {
        const keys = await this.env.SOUL_KV.list({ prefix: "pending:rrl:" });
        for (const key of (keys.keys || []).slice(0, 3)) {
          const run_number = key.name.split(":")[2];
          const rrl_text = await this.env.SOUL_KV.get(key.name);
          if (rrl_text) {
            const deathResult = await runDeathPipeline(this.env, run_number, rrl_text);
            if (deathResult.ok) {
              death_runs++;
              discoveries += deathResult.discoveries || 0;
              await this.env.SOUL_KV.delete(key.name);
            }
          }
        }
      }
      if (this.env.PCC1_SVC) {
        try {
          const r = await this.env.PCC1_SVC.fetch(
            new Request("https://pcc2/api/run-fleet", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-pa-auth": "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=" },
              body: JSON.stringify({ triggered_by: "race-runner-arch" })
            })
          );
          if (r.ok) {
            const body = await r.json().catch(() => ({}));
            const okCount = Array.isArray(body.results) ? body.results.filter((x) => x.ok === true).length : 0;
            actualizers += Math.max(okCount, 1);
          } else {
            errors++;
          }
        } catch (e) {
          errors++;
          if (this.env.SOUL_KV) {
            await this.env.SOUL_KV.put("race:pcc1:last-error", JSON.stringify({ msg: e.message, ts: Date.now() })).catch(() => {
            });
          }
        }
      }
      if (this.env.PCC1_SVC) {
        try {
          const r = await this.env.PCC1_SVC.fetch(
            new Request("https://pcc3/api/run-fleet", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-pa-auth": "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=" },
              body: JSON.stringify({ triggered_by: "race-runner-arch" })
            })
          );
          if (r.ok) {
            const body = await r.json().catch(() => ({}));
            const activeCount = Array.isArray(body.results) ? body.results.filter((x) => x.processed > 0 || x.stale > 0).length : 0;
            actualizers += Math.max(activeCount, 1);
          } else {
            errors++;
          }
        } catch (e) {
          errors++;
          if (this.env.SOUL_KV) {
            await this.env.SOUL_KV.put("race:pcc2-ops:last-error", JSON.stringify({ msg: e.message, ts: Date.now() })).catch(() => {
            });
          }
        }
      }
    } catch (e) {
      errors++;
    }
    return { actualizers, discoveries, errors, death_runs };
  }
  async writeMetrics(state, final) {
    const elapsed = Date.now() - (state.start_time || Date.now());
    const score = (state.batches_run || 0) * 10 + (state.actualizers_run || 0) * 5 + (state.discoveries_count || 0) * 20 + (state.death_runs || 0) * 50;
    const metrics = {
      agent_id: "pcc-arch",
      start_time: state.start_time,
      elapsed_ms: elapsed,
      batches_run: state.batches_run,
      actualizers_run: state.actualizers_run,
      discoveries_count: state.discoveries_count,
      errors_count: state.errors_count,
      death_runs: state.death_runs,
      score,
      final
    };
    if (this.env.SOUL_KV) {
      await this.env.SOUL_KV.put("race:pcc-arch:metrics", JSON.stringify(metrics));
    }
  }
  async handleStatus() {
    const state = await this.state.storage.get("run_state");
    if (!state) return Response.json({ ok: false, error: "not started" });
    const elapsed = Date.now() - state.start_time;
    const score = (state.batches_run || 0) * 10 + (state.actualizers_run || 0) * 5 + (state.discoveries_count || 0) * 20 + (state.death_runs || 0) * 50;
    return Response.json({ ...state, elapsed_ms: elapsed, score });
  }
  async handleStop() {
    await this.state.storage.deleteAlarm();
    const state = await this.state.storage.get("run_state");
    await this.writeMetrics(state || {}, true);
    return Response.json({ ok: true, stopped: true });
  }
};
var WatchdogAlarm = class extends RaceRunner {
  static {
    __name(this, "WatchdogAlarm");
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/start") {
      const current2 = await this.state.storage.getAlarm();
      if (!current2) await this.state.storage.setAlarm(Date.now() + 3e4);
      return Response.json({ ok: true, status: "heartbeat_started" });
    }
    if (url.pathname === "/stop") {
      await this.state.storage.deleteAlarm();
      return Response.json({ ok: true, status: "heartbeat_stopped" });
    }
    return Response.json({ ok: true, status: "alive" });
  }
  async alarm() {
  }
};
var ForceAwarenessAlarm = class extends RaceRunner {
  static {
    __name(this, "ForceAwarenessAlarm");
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/start") {
      const current2 = await this.state.storage.getAlarm();
      if (!current2) await this.state.storage.setAlarm(Date.now() + 3e4);
      return Response.json({ ok: true, status: "heartbeat_started" });
    }
    if (url.pathname === "/stop") {
      await this.state.storage.deleteAlarm();
      return Response.json({ ok: true, status: "heartbeat_stopped" });
    }
    return Response.json({ ok: true, status: "alive" });
  }
  async alarm() {
    await ForceAwareness(this.env).catch(() => {
    });
    await this.state.storage.setAlarm(Date.now() + 3e4);
  }
};
var LegionRunner = class extends RaceRunner {
  static {
    __name(this, "LegionRunner");
  }
};

// src/forceawareness.js
var AUTH = "ffScwBjPQjBnoAlectawu8E+J4NcmO3idxGxtlcRue8=";
var SELF = { name: "pcc3-windu", url: "https://phoenix-architecti.mrmichaelhobbs123.workers.dev" };
var PEERS = [
  { name: "pcc1-obi", url: "https://phoenix-pcc-1.mrmichaelhobbs123.workers.dev" },
  { name: "pcc2-anakin", url: "https://phoenix-pcc-2.mrmichaelhobbs123.workers.dev" }
];
async function sendTelegram(env, msg) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: "Markdown" })
  }).catch(() => {
  });
}
__name(sendTelegram, "sendTelegram");
async function pingPeers(env, alertMsg) {
  for (const peer of PEERS) {
    await fetch(`${peer.url}/api/message`, {
      method: "POST",
      headers: { "x-pa-auth": AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ message: alertMsg })
    }).catch(() => {
    });
  }
}
__name(pingPeers, "pingPeers");
async function writeMetric(env, pccName, delta = {}) {
  const trailKey = "phetrail:latest";
  const trail = JSON.parse(await env.PHETRAIL.get(trailKey) || "{}");
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  if (!trail.positive_trails) trail.positive_trails = [];
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.pcc_metrics) trail.state_markers.pcc_metrics = {};
  trail.state_markers.pcc_metrics[pccName] = { ts, ...delta };
  trail.state_markers.last_updated = ts;
  await env.PHETRAIL.put(trailKey, JSON.stringify(trail));
  return trail;
}
__name(writeMetric, "writeMetric");
async function readTrail(env) {
  const trailKey = "phetrail:latest";
  const trail = JSON.parse(await env.PHETRAIL.get(trailKey) || "{}");
  return trail;
}
__name(readTrail, "readTrail");
async function ForceAwareness2(env) {
  const now = Date.now();
  const results = [];
  const trail = await readTrail(env);
  for (const pcc of PEERS) {
    const lastBatchesKey = `force:${pcc.name}:last_batches`;
    const restartsKey = `force:${pcc.name}:restarts`;
    let status = null;
    let dead = false;
    let reason = "";
    try {
      const r = await fetch(`${pcc.url}/api/race/status`, { headers: { "x-pa-auth": AUTH } });
      if (!r.ok) {
        dead = true;
        reason = `status ${r.status}`;
      } else {
        status = await r.json();
        if (status.elapsed_ms >= status.budget_ms) {
          dead = true;
          reason = "budget_exhausted";
        } else {
          const lastBatches = parseInt(await env.PHETRAIL.get(lastBatchesKey) || "0");
          if (status.batches_run <= lastBatches && status.batches_run > 0) {
            dead = true;
            reason = "stalled";
          }
        }
      }
    } catch (e) {
      dead = true;
      reason = e.message;
    }
    if (status) await env.PHETRAIL.put(lastBatchesKey, String(status.batches_run));
    if (dead) {
      const alert = `\u{1F6A8} *Agent 99 OS ALERT*
${SELF.name} ForceAwareness: *${pcc.name}* is DOWN
Reason: ${reason}
Time: ${new Date(now).toISOString()}`;
      await sendTelegram(env, alert);
      await pingPeers(env, `FORCE ALERT from ${SELF.name}: ${pcc.name} is DOWN \u2014 reason: ${reason}. Auto-restart attempted.`);
      try {
        await fetch(`${pcc.url}/api/race/start`, {
          method: "POST",
          headers: { "x-pa-auth": AUTH, "Content-Type": "application/json" },
          body: JSON.stringify({ budget_ms: 108e5 })
        });
        const restarts = parseInt(await env.PHETRAIL.get(restartsKey) || "0") + 1;
        await env.PHETRAIL.put(restartsKey, String(restarts));
        const log = JSON.parse(await env.PHETRAIL.get("force:log") || "[]");
        log.push({ ts: now, reporter: SELF.name, pcc: pcc.name, reason, restarted: true });
        if (log.length > 100) log.splice(0, log.length - 100);
        await env.PHETRAIL.put("force:log", JSON.stringify(log));
        results.push({ pcc: pcc.name, dead, reason, restarted: true });
      } catch (e) {
        results.push({ pcc: pcc.name, dead, reason, restart_error: e.message });
      }
    } else {
      results.push({ pcc: pcc.name, dead: false, batches: status?.batches_run, score: status?.score });
    }
  }
  await env.PHETRAIL.put("force:status", JSON.stringify({ checked_at: now, reporter: SELF.name, results }));
  await writeMetric(env, SELF.name, { force_awareness: true, peers_checked: results.length, dead_count: results.filter((r) => r.dead).length });
  return results;
}
__name(ForceAwareness2, "ForceAwareness");
async function handleForce(request, env) {
  const status = await env.PHETRAIL.get("force:status", { type: "json" });
  const log = await env.PHETRAIL.get("force:log", { type: "json" });
  const restarts = {};
  for (const pcc of PEERS) {
    restarts[pcc.name] = parseInt(await env.PHETRAIL.get(`force:${pcc.name}:restarts`) || "0");
  }
  return Response.json({ reporter: SELF.name, status, log: (log || []).slice(-20), restarts });
}
__name(handleForce, "handleForce");

// src/index.js
var VERSION = "1.0.0";
function addCors(response, origin) {
  const corsHeaders = getCorsHeaders(origin);
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
__name(addCors, "addCors");
async function writeMajorDirectiveMarker(env, source, message) {
  const kv = env.PHETRAIL;
  if (!kv || !message) return;
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  const marker = {
    ts,
    source,
    message: String(message).slice(0, 2e3),
    keywords: ["Agent99", "FORCEAWARENESS", "PCC1", "PCC2", "PCC3", "PhoenixCoder", "PhoenixArt", "role", "Agent99 OS", "Agent99 Genesis Boot", "Role Boot"].filter((k) => String(message).toLowerCase().includes(k.toLowerCase()))
  };
  await kv.put(`phetrail:major-directive:${Date.now()}`, JSON.stringify(marker));
  const trail = JSON.parse(await kv.get("phetrail:latest") || "{}");
  if (!trail.state_markers) trail.state_markers = {};
  if (!trail.state_markers.major_directives) trail.state_markers.major_directives = [];
  trail.state_markers.major_directives.unshift(marker);
  trail.state_markers.major_directives = trail.state_markers.major_directives.slice(0, 50);
  trail.state_markers.last_updated = ts;
  await kv.put("phetrail:latest", JSON.stringify(trail));
}
__name(writeMajorDirectiveMarker, "writeMajorDirectiveMarker");
var index_default = {
  async scheduled(event, env) {
    await evaporatePheromones(env);
    await refreshAllBriefs(env).catch(() => {
    });
    await runPatternScanner(env).catch(() => {
    });
    await checkPccHealth(env).catch(() => {
    });
    await runOrchestrator(env).catch(() => {
    });
    await ForceAwareness2(env).catch(() => {
    });
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
    }
    const secResp = await securityMiddleware(request, env);
    if (secResp) return addCors(secResp, origin);
    const { pathname } = url;
    const method = request.method;
    try {
      if (method === "POST" && pathname === "/api/batch") {
        return addCors(await handleBatch(request, env), origin);
      } else if (method === "POST" && (pathname === "/api/execute" || pathname === "/api/code")) {
        return addCors(await handleExecute(request, env), origin);
      } else if (method === "POST" && pathname === "/api/mission") {
        return addCors(await handleMission(request, env), origin);
      } else if (method === "POST" && pathname === "/api/swarm") {
        return addCors(await handleSwarm(request, env), origin);
      } else if (method === "POST" && pathname === "/api/blueprint") {
        return addCors(await handleBlueprint(request, env), origin);
      } else if (method === "GET" && pathname === "/api/status") {
        return addCors(await handleStatus(env), origin);
      } else if (method === "GET" && pathname === "/api/probe") {
        return addCors(await handleProbe(request, env), origin);
      } else if (method === "GET" && pathname === "/api/capabilities") {
        return addCors(await handleCapabilityTest(env), origin);
      } else if (method === "POST" && pathname === "/v1/chat/completions") {
        return addCors(await handleCompletions(request, env), origin);
      } else if (method === "POST" && pathname === "/api/embed") {
        return addCors(await handleEmbed(request, env), origin);
      } else if (method === "GET" && pathname === "/api/recall") {
        return addCors(await handleRecall(request, env), origin);
      } else if (method === "POST" && pathname === "/api/ingest") {
        return addCors(await handleIngest(request, env), origin);
      } else if (method === "POST" && pathname === "/api/pipeline") {
        return addCors(await handlePipeline(request, env), origin);
      } else if (pathname === "/api/actualizer" || pathname.startsWith("/api/actualizer/")) {
        return addCors(await handleActualizer(request, env), origin);
      } else if (method === "POST" && pathname === "/api/translate") {
        return addCors(await handleTranslate(request, env), origin);
      } else if (pathname === "/api/backburner" || pathname.startsWith("/api/backburner/")) {
        return addCors(await handleBackburner(request, env), origin);
      } else if (pathname.startsWith("/api/incarnate") || pathname.startsWith("/api/metrics/pcc")) {
        return addCors(await handleIncarnate(request, env), origin);
      } else if (pathname.startsWith("/api/orchestrate")) {
        return addCors(await handleOrchestrate(request, env), origin);
      } else if (method === "POST" && pathname === "/api/session/death") {
        return addCors(await handleSessionDeath(request, env), origin);
      } else if (pathname.startsWith("/api/race/") && env.LEGION_RUNNER) {
        const id = env.LEGION_RUNNER.idFromName("singleton");
        const stub = env.LEGION_RUNNER.get(id);
        const doPath = pathname.replace("/api/race", "");
        return stub.fetch(new Request("https://race" + doPath, request));
      } else if (pathname === "/api/force/start" && request.method === "POST") {
        const id = env.FORCEAWARENESS_ALARM.idFromName("heartbeat");
        const stub = env.FORCEAWARENESS_ALARM.get(id);
        await stub.fetch("https://fake/start");
        return Response.json({ ok: true, status: "heartbeat_started_30s" });
      } else if (pathname === "/api/force/status") {
        return addCors(await handleForce(request, env), origin);
      } else if (pathname === "/api/message" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        await writeMajorDirectiveMarker(env, "pcc3-windu", body.message).catch(() => {
        });
        return Response.json({ ok: true, received: true, agent: "pcc3-windu", message: body.message });
      } else if (pathname === "/art-arsenal") {
        return addCors(await handleArtArsenal(request, env), origin);
      } else if (pathname.startsWith("/api/art")) {
        return addCors(await handleArt(request, env), origin);
      } else if (pathname === "/api/rise" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { run_number } = body;
        const kv = env.PHETRAIL;
        if (!kv) return Response.json({ ok: false, error: "no kv binding" }, { status: 500 });
        const [soul, dna, ledger, skeys] = await Promise.all([
          kv.get("death:" + run_number + ":soul"),
          kv.get("death:" + run_number + ":dna"),
          kv.get("death:" + run_number + ":ledger"),
          kv.get("death:" + run_number + ":soulkeys")
        ]);
        if (!soul && !dna) return Response.json({ ok: false, error: "run not found", run_number }, { status: 404 });
        const gaps = [];
        if (!soul || soul === "0") gaps.push("SOUL_ZERO");
        if (!dna || dna === "0") gaps.push("DNA_ZERO");
        if (!ledger) gaps.push("NO_LEDGER");
        return Response.json({ ok: true, run_number, audit: { soul_ok: !!soul && soul !== "0", dna_ok: !!dna && dna !== "0", ledger_ok: !!ledger, soulkeys: Number(skeys) || 0, gaps }, rise_complete: gaps.length === 0 });
      } else if (pathname === "/api/act" && request.method === "POST") {
        const start = Date.now();
        const { act_id, task, context } = await request.json().catch(() => ({}));
        const specialties = { 1: "translate", 2: "lostsoul-scan", 3: "completeness-audit", 4: "pattern-scan", 5: "brief-scan" };
        const specialty = specialties[act_id];
        if (!specialty) return Response.json({ ok: false, error: "invalid act_id" }, { status: 400 });
        try {
          const ai = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
            messages: [
              { role: "system", content: `You are ACT-${act_id} specialist: ${specialty}. Be concise.` },
              { role: "user", content: task + (context ? " Context: " + context : "") }
            ]
          });
          return Response.json({ ok: true, act_id, specialty, result: ai.response, ms: Date.now() - start });
        } catch (e) {
          return Response.json({ ok: false, error: e.message, act_id }, { status: 500 });
        }
      } else {
        return Response.json({ error: "Not found", version: VERSION }, { status: 404 });
      }
    } catch (err) {
      return Response.json({ error: err.message || "Internal error", version: VERSION }, { status: 500 });
    }
  }
};
export {
  ForceAwarenessAlarm,
  LegionRunner,
  RaceRunner,
  WatchdogAlarm,
  index_default as default
};
//# sourceMappingURL=index.js.map
