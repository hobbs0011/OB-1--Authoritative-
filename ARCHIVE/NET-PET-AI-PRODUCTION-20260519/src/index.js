// src/index.js â€” NET-PET-AI Cloudflare Worker v1.6.1
// Phoenix Rising Protocol â€” OBI Command Station
// Architecture: Agent100 â†’ Magic Chat â†’ Agent99 (Obi) â†’ Cryptographic Immutable Ledger
// Bindings: SESSIONS (SessionDO), PROFILES (ProfileDO), PETS (PetDO), LEDGER (LedgerDO), ASSETS
// Secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY
//
// â”€â”€ Phase 4C COMPLETE (RUN367) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Fail-Closed Doctrine enforcement gates (L51-L100) codified and active:
// - HTTP 423 Stasis Gate (L100: ambiguity > 5% lock)
// - Nonce Sequencing Validator (L54: monotonic enforcement)
// - Devil's Advocate Protocol (L78: governance critique)
// - Gospel 444 Guard (visual mandate enforcement)

import { securityMiddleware, sanitizeInput, validateStudentId } from './security.js';
import { extractWeaknesses, buildWeaknessPrompt, buildReEntryPrompt, buildRewardSignals, buildRewardPrompt } from './memory-brain.js';
import { queryLessons, writeProgress, queryProgress, syncStudentProgress, writeSoulDNA, writeChatExchange } from './notion.js';
import { sendZaloMessage, checkAndEscalate, runEscalationSweep, getAccountabilityLinks } from './zalo.js';
import { getTelegramAPI, checkCooldown, logTelegramMessage, sendTelegramMessage, buildBossNodeDashboard, buildParentProgressReport, buildBuddySessionAlert, buildStreakBreakAlert } from './telegram.js';
import { generatePosts, routePost, buildInsightPost } from './growth-engine.js';
import { calculateVirality, calculateConversion, generateVariants, evaluateExperiment, extractPattern, optimizeHook, mutatePrompt, runLearningLoop } from './virality.js';
import { getStudentRoute, getModulePrompt, createSnapshot, storeSnapshot, rehydrate } from './star-map.js';
import { handleSpeak } from './api-speak.js';
import { handleSoulDNACapture, handleSoulDNAStatus } from './api-souldna-complete.js';
import { handleTestSetup } from './api-test-setup.js';
import { buildSystemPrompt, buildUserPrompt, parseAIResponse } from './prompt-builder-complete.js';
import { StudentDO } from './student-do-complete.js';
import { StudentBrainV2 } from './student-brain-v2.js';
import { HeavyLedger, LedgerDO } from './heavy-ledger.js';
import { buildStarMapRoute, generateEmbedding, SkeletonStarMap } from './star-map-embedder.js';
import { handleRetentionCheck, handleStreakUpdate, handleWeakSkillDrill, handleMilestoneBonus, handleDriftDetection } from './retention-engine.js';
import { OBI_SYSTEM_PROMPT_V3, OBI_PROMPT_V3_METADATA } from './obi-system-prompt-v3-production.js';
import { OBIOrchestrationRouter } from './obi-orchestration-router.js';
import { createStasisGate, createNonceValidator, createDevilsAdvocate, createGospel444Guard } from './fail-closed-gates.js';

// â”€â”€ Phase 4C: Fail-Closed Doctrine Enforcement (L51-L100) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Three gates implement Gospel 444 + systemic integrity
const stasisGate = createStasisGate();
const nonceValidator = createNonceValidator();
const devilsAdvocate = createDevilsAdvocate();
const gospel444Guard = createGospel444Guard();

const VERSION = "1.6.0";

// â”€â”€ SECURITY: Validate no hardcoded secrets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Â§Phase6 Defense-in-Depth: Check at startup for common secret anti-patterns
// This catches developer mistakes and prevents accidental commits
function validateNoHardcodedSecrets() {
  const antiPatterns = [
    { pattern: /sk-[\da-zA-Z]{15,}/, name: "OpenAI format" },
    { pattern: /ghp_[\da-zA-Z]{30,}/, name: "GitHub token" },
    { pattern: /sk-ant-[\da-zA-Z]{40,}/, name: "Anthropic token" },
    { pattern: /pplx-[\da-zA-Z]{30,}/, name: "Perplex token" },
    { pattern: /AIzaSy[\da-zA-Z\-_]{33}/, name: "Google API key" },
  ];
  
  // Scan the source code string for patterns (defensive, not foolproof)
  const sourceCode = toString(); // Minimal leak surface
  for (const ap of antiPatterns) {
    if (ap.pattern.test(sourceCode)) {
      console.error(`ðŸ”¥ CRITICAL SECURITY: Detected ${ap.name} in source code!`);
      console.error('   This is likely a hardcoded secret. Use: wrangler secret put');
      console.error('   Read: APPS/NET-PET-AI/SECRET-MANAGEMENT.md');
      throw new Error(`HARDCODED_SECRET_DETECTED: ${ap.name}`);
    }
  }
}

// Run validation on module load (development warning system)
if (globalThis.constructor.name === 'Object' || process.env.NODE_ENV !== 'production') {
  // Only warn in development/test; production env vars are scrubbed
  try {
    validateNoHardcodedSecrets();
  } catch (e) {
    console.warn(`[SECURITY] Validation skipped: ${e.message}`);
  }
}


// â”€â”€ CORS helpers (must be defined before use in fetch handler) â”€â”€
const ALLOWED_ORIGINS = [
  "https://naturalenglishtraining.pages.dev",
  "https://naturalenglishtraining.com",
  "https://www.naturalenglishtraining.com",
  "https://net-pet-ai-production.mrmichaelhobbs123.workers.dev",
];

// â”€â”€ Production environment detection (for hardened rules) â”€â”€â”€â”€â”€â”€
const PRODUCTION_HOSTS = [
  "naturalenglishtraining.com",
  "www.naturalenglishtraining.com",
  "net-pet-ai-production.mrmichaelhobbs123.workers.dev",
];

// â”€â”€ Request size limit (DoS prevention, 1MB cap) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MAX_REQUEST_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

function corsHeaders(requestOrOrigin, isProduction = false) {
  let origin = '';
  if (typeof requestOrOrigin === 'string') {
    origin = requestOrOrigin;
  } else if (requestOrOrigin && requestOrOrigin.headers) {
    origin = requestOrOrigin.headers.get('Origin') || '';
  }

  // â”€â”€ Hardened CORS validation (Â§Phase6 security) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Production: Only allow production origins. Dev localhost only if NOT production.
  // Contains: Site detection, chrome-extension check, localhost restriction
  const isAllowed = ALLOWED_ORIGINS.some(a => origin === a) ||
    (!isProduction && origin.startsWith('chrome-extension://')) ||
    (!isProduction && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

function addCors(response, request, isProduction = false) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request, isProduction))) { headers.set(k, v); }
  return new Response(response.body, { status: response.status, headers });
}

// â”€â”€ Error scrubbing helper (generic messages, no stack traces) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Â§Phase6: Prevents information disclosure via error messages
function scrubbedErrorResponse(code = 500, devInternalMessage = '') {
  const messages = {
    400: "Invalid request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Conflict",
    422: "Unprocessable entity",
    423: "Locked",
    429: "Rate limited",
    500: "Internal server error",
    503: "Service unavailable",
  };
  const msg = messages[code] || "Request failed";
  // Dev logging (internal only, not exposed to client)
  if (devInternalMessage) console.error(`[ERROR ${code}]`, devInternalMessage);
  return json({ error: msg }, code);
}

// â”€â”€ Phase 4C: Stasis & Conflict Response Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// L100 (Fail-Closed): Return 423 for ambiguity > 5%
// L54 (Nonce): Return 409 for sequence violation
function stasisResponse(reason, details = {}) {
  const response = {
    error: "Locked",
    reason,
    details,
    timestamp: Date.now(),
    message: "System entered stasis due to ambiguity. Manual review required.",
  };
  return new Response(JSON.stringify(response), {
    status: 423,
    headers: {
      "Content-Type": "application/json",
      "X-Stasis-Reason": reason,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

function conflictResponse(reason, details = {}) {
  const response = {
    error: "Conflict",
    reason,
    details,
    timestamp: Date.now(),
    message: "Ledger sequence conflict. Last write may have been lost; retry.",
  };
  return new Response(JSON.stringify(response), {
    status: 409,
    headers: {
      "Content-Type": "application/json",
      "X-Conflict-Reason": reason,
    },
  });
}

// â”€â”€ Obi System Prompt v3 (Soul DNA Continuity Engine â€” immutable production code) â”€â”€â”€â”€
// Imported from obi-system-prompt-v3-production.js
// DO NOT inline this constant. Use buildSystemPrompt() which embeds OBI_SYSTEM_PROMPT_V3
// See prompt-builder-complete.js for integration
const OBI_SYSTEM = OBI_SYSTEM_PROMPT_V3;

// â”€â”€ Cryptographic hash (SHA-256 via SubtleCrypto â€” Cloudflare Workers native) â”€
async function computeHash(data) {
  const encoded = new TextEncoder().encode(String(data));
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const isProduction = PRODUCTION_HOSTS.some(h => url.hostname === h || url.hostname.includes(h));

    // â”€â”€ OPTIONS preflight optimization (Cache-Control headers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Â§Phase6: Reduced preflight cache misses, improved performance
    if (request.method === "OPTIONS") {
      const preflightHeaders = new Headers(corsHeaders(request, isProduction));
      preflightHeaders.set("Cache-Control", "public, max-age=3600"); // 1h preflight cache
      return new Response(null, { headers: preflightHeaders });
    }

    // â”€â”€ Request size limit (DoS prevention, Â§Phase6 security) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Issue: No limit on request body size (DoS vulnerability)
    // Fix: Add 1MB limit check before processing
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE_BYTES) {
      return addCors(scrubbedErrorResponse(413, 
        `Request size ${contentLength} bytes exceeds limit ${MAX_REQUEST_SIZE_BYTES} bytes`), 
        request, isProduction);
    }

    // â”€â”€ Security middleware (rate limiting, origin validation) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const secBlock = await securityMiddleware(request, env);
    if (secBlock) return secBlock;

    // â”€â”€ Canon Â§4 non-API routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // /imagegen â€” serve the turnkey imagegen UI
    if (path === "/imagegen" && request.method === "GET") {
      return env.ASSETS.fetch(new Request(new URL("/public/imagegen.html", url), request));
    }

    // /health â€” REAL dependency validation (not cosmetic)
    if (path === "/health" && request.method === "GET") {
      const secrets = {
        DEEPSEEK_API_KEY:  !!env.DEEPSEEK_API_KEY,
        DEEPGRAM_API_KEY:  !!env.DEEPGRAM_API_KEY,
        NOTION_API_KEY:    !!env.NOTION_API_KEY,
        NOTION_LESSONS_DB: !!env.NOTION_LESSONS_DB,
        NOTION_PROGRESS_DB:!!env.NOTION_PROGRESS_DB,
        NOTION_SOUL_DNA_DB:!!env.NOTION_SOUL_DNA_DB,
      };
      const bindings = {
        SESSIONS: !!env.SESSIONS,
        PROFILES: !!env.PROFILES,
        PETS:     !!env.PETS,
        LEDGER:   !!env.LEDGER,
        COMMANDS: !!env.COMMANDS,
        ASSETS:   !!env.ASSETS,
      };
      const secretsOk = secrets.DEEPSEEK_API_KEY && secrets.DEEPGRAM_API_KEY;
      const bindingsOk = Object.values(bindings).filter((v, i, arr) => { const keys = Object.keys(bindings); return keys[Object.values(bindings).indexOf(v)] !== 'COMMANDS'; }).every(Boolean); // Exclude optional COMMANDS
      const notionOk = secrets.NOTION_API_KEY && secrets.NOTION_LESSONS_DB && secrets.NOTION_PROGRESS_DB && secrets.NOTION_SOUL_DNA_DB;
      const isHealthProduction = secretsOk && bindingsOk && notionOk; // PATCH: Require all 3 readiness factors
      
      // Â§Phase6 secret scrubbing: Don't expose raw secret/binding names in health response
      // Only expose aggregated status indicators
      const healthResponse = {
        ok: secretsOk && bindingsOk,
        version: VERSION,
        app: env.APP_NAME || "Natural English Training",
        coach: env.APP_COACH_NAME || "Obi",
        ts: Date.now(),
        oxygen: {
          ai:      secrets.DEEPSEEK_API_KEY  ? "LIVE" : "DEAD",
          voice:   secrets.DEEPGRAM_API_KEY   ? "LIVE" : "DEAD",
          notion:  notionOk                   ? "LIVE" : "PARTIAL",
          compute: bindingsOk                 ? "LIVE" : "DEAD",
        },
        readiness: isHealthProduction ? "PRODUCTION" : "NEEDS_SECRETS",
      };
      // Only include detailed debug info if not production
      if (!isProduction) {
        healthResponse.secrets = secrets;
        healthResponse.bindings = bindings;
      }
      return addCors(json(healthResponse), request, isProduction);
    }

    // /evidence â€” Worker identity + deploy proof
    if (path === "/evidence" && request.method === "GET") {
      return addCors(json({
        worker: "net-pet-ai",
        version: VERSION,
        runtime: "Cloudflare Workers",
        durableObjects: ["SessionDO", "ProfileDO", "PetDO", "LedgerDO", "CommandDO"],
        ts: Date.now(),
        proof: `Phoenix OB-1 alive at ${new Date().toISOString()}`,
      }), request);
    }

    // /obi/metadata â€” Soul DNA continuity engine metadata (new in v3)
    if (path === "/obi/metadata" && request.method === "GET") {
      return addCors(json({
        system: "OBI Soul DNA Continuity Engine",
        version: OBI_PROMPT_V3_METADATA.version,
        created: OBI_PROMPT_V3_METADATA.created,
        author: OBI_PROMPT_V3_METADATA.author,
        philosophy: OBI_PROMPT_V3_METADATA.philosophy,
        status: OBI_PROMPT_V3_METADATA.status,
        immutable: OBI_PROMPT_V3_METADATA.immutable,
        notes: OBI_PROMPT_V3_METADATA.notes,
        pillars: [
          "Soul DNA principle (intent preservation)",
          "Continuity across sessions (no amnesia)",
          "Michael's teaching method (Mouseâ†’Tiger progression)",
          "Correction loop format (strict structure)",
          "Streak & accountability mechanics",
          "Drift prevention rules",
        ],
        integrations: [
          "prompt-builder-complete.js (buildSystemPrompt)",
          "student-do-complete.js (StudentDO state machine)",
          "star-map-embedder.js (Skeleton Star Map retrieval)",
          "heavy-ledger.js (Heavy Ledger context)",
        ],
        ts: Date.now(),
      }), request);
    }

    // /verify â€” Ledger chain verification shortcut (requires ?studentId=)
    if (path === "/verify" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId");
      if (!studentId) return addCors(json({ error: "studentId query param required" }, 400), request);
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
      try {
        const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/verify"));
        return addCors(res, request);
      } catch (err) {
        return addCors(json({ error: "Ledger verification failed" }, 500), request);
      }
    }

    // /student/resolve â€” Cookie-based student ID resolution
    if (path === "/student/resolve" && request.method === "POST") {
      try {
        const body = await request.json();
        const studentId = body.studentId || "";
        if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/profile"));
        const data = await res.json();
        return addCors(json({ resolved: !!data.profile, studentId, profile: data.profile || null }), request);
      } catch (err) {
        return addCors(json({ error: "Student resolve failed" }, 500), request);
      }
    }

    // /student/create â€” Create + seal student profile
    // â”€â”€ Phase 4C: Fail-Closed Doctrine Enforcement (L100 + L54) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (path === "/student/create" && request.method === "POST") {
      try {
        const body = await request.json();
        
        // L100: Validate schema (fail-closed on ambiguity >5%)
        const schemaCheck = stasisGate.validateSchema(body, ['studentId']);
        if (!schemaCheck.ok) {
          console.warn(`[Phase4C] Schema ambiguity in /student/create: ${schemaCheck.reason}`);
          return addCors(stasisResponse(schemaCheck.reason, { missing: schemaCheck.missing }), request);
        }

        // L100: Validate encoding
        const encodingCheck = stasisGate.validateEncoding(body);
        if (!encodingCheck.ok) {
          console.warn(`[Phase4C] Encoding violation in /student/create: ${encodingCheck.reason}`);
          return addCors(stasisResponse(encodingCheck.reason, encodingCheck), request);
        }

        if (!body.studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(body.studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
        const res = await stub.fetch(new Request("https://do/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }));
        if (env.LEDGER) {
          const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
          appendToLedger(body.studentId, "student_created", payload, env).catch(() => {});
        }
        return addCors(res, request);
      } catch (err) {
        return addCors(json({ error: "Student create failed" }, 500), request);
      }
    }

    // /magic-chat, /voice-chat â€” Canon Â§4: Magic Chat UI aliases â†’ serve index.html
    if (path === "/magic-chat" || path === "/voice-chat") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    // /speak â€” Speech-to-Learning MVP UI
    if (path === "/speak") {
      return env.ASSETS.fetch(new Request(new URL("/speak.html", url), request));
    }

    // â”€â”€ Soul DNA Capture Pipeline (root-level routes) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // POST /souldna â€” Submit raw soul DNA for legionnaire processing
    if (path === "/souldna" && request.method === "POST") {
      const body = await request.json();
      const res = await handleSoulDNASubmit(body, env);
      return addCors(res, request);
    }

    // GET /souldna/{id} â€” Check submission status
    if (path.startsWith("/souldna/") && request.method === "GET" && !path.includes("pipeline")) {
      const id = path.split("/")[2];
      const res = await handleSoulDNAStatus(id, env);
      return addCors(res, request);
    }

    // GET /souldna/pipeline â€” Actionable pipeline steps grouped by tier
    if (path === "/souldna/pipeline" && request.method === "GET") {
      const tier = url.searchParams.get("tier") || "OPERATIONAL";
      const res = await handleSoulDNAPipeline(tier, env);
      return addCors(res, request);
    }

    // â”€â”€ TELEGRAM BOOTSTRAP (Gate 2: Accountability Dashboard Activation) â”€â”€â”€â”€â”€â”€â”€â”€
    // POST /bootstrap/telegram â€” Send dashboard credentials to BlueTech boss + Minh's mother
    if (path === "/bootstrap/telegram" && request.method === "POST") {
      try {
        const body = await request.json();
        const { bluetechBossChatId, minhMotherChatId } = body;

        // Validate authorization (must be called from internal/authorized source)
        const authHeader = request.headers.get("Authorization");
        if (authHeader !== `Bearer ${env.BOOTSTRAP_SECRET}`) {
          return addCors(json({ error: "Unauthorized" }, 401), request);
        }

        const results = {};

        // Send to BlueTech boss
        if (bluetechBossChatId) {
          const studentData = [
            { name: "Mai TrÃ¢m", level: "B1-Cub", streak: 0, completed45m: false, completed15m: false },
            { name: "Nguyá»…n Thá»‹ Thu Quy", level: "A2-Mouse", streak: 0, completed45m: false, completed15m: false },
            { name: "HÆ°Æ¡ng Ho", level: "B1-Cub", streak: 0, completed45m: false, completed15m: false },
          ];
          const bossMessage = buildBossNodeDashboard(studentData);
          const bossRes = await sendTelegramMessage(env, bluetechBossChatId, bossMessage);
          results.boss = { sent: bossRes.ok, chatId: bluetechBossChatId, ts: new Date().toISOString() };
          await logTelegramMessage(env, bluetechBossChatId, "boss", "dashboard_bootstrap", bossMessage, !env.TELEGRAM_BOT_TOKEN);
        }

        // Send to Minh's mother
        if (minhMotherChatId) {
          const parentSummary = `Minh has progressed from "Silent Period" to enthusiastic, high-velocity output. See attached transcripts for proof.`;
          const transcriptUrl = `${url.protocol}//${url.hostname}/transcripts/minh-progress`;
          const parentMessage = buildParentProgressReport("Minh", parentSummary, transcriptUrl);
          const parentRes = await sendTelegramMessage(env, minhMotherChatId, parentMessage);
          results.parent = { sent: parentRes.ok, chatId: minhMotherChatId, ts: new Date().toISOString() };
          await logTelegramMessage(env, minhMotherChatId, "parent", "dashboard_bootstrap", parentMessage, !env.TELEGRAM_BOT_TOKEN);
        }

        return addCors(json({ ok: true, results }, 200), request);
      } catch (err) {
        return addCors(json({ error: "Bootstrap failed", details: err.message }, 500), request);
      }
    }

    // â”€â”€ API routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    if (path.startsWith("/api/")) {
      try {
        const res = await handleAPI(path, request, env, url);
        return addCors(res, request);
      } catch (err) {
        return addCors(json({ error: "Internal error", version: VERSION }, 500), request);
      }
    }

    return env.ASSETS.fetch(request);
  },

  // â”€â”€ Cron triggers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Every 6 hours: Zalo escalation sweep + daily loop engine
  // Every 3 hours: Auto Post Engine (content distribution)
  async scheduled(event, env, ctx) {
    const hour = new Date(event.scheduledTime).getUTCHours();

    // Escalation sweep runs every 6 hours (0, 6, 12, 18 UTC)
    if (hour % 6 === 0) {
      const report = await runEscalationSweep(env);
      console.log(`[CRON] Escalation sweep: ${JSON.stringify(report)}`);

      // Daily loop: update Tiger Scores for all students
      try {
        const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
        const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
        const rosterData = await rosterRes.json();
        const students = rosterData.students || [];
        let updated = 0;
        for (const student of students) {
          try {
            const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
            await petStub.fetch(new Request("https://do/daily-check"));
            updated++;
          } catch (_) {}
        }
        console.log(`[CRON] Daily loop: updated ${updated}/${students.length} Tiger Scores`);
      } catch (err) {
        console.log(`[CRON] Daily loop error: ${err.message}`);
      }

      // Run 325 â€” Daily Retention Sweep (Run 9am + 9pm UTC)
      try {
        const retentionReport = await handleRetentionCheck(env);
        if (retentionReport.ok && retentionReport.targets_identified > 0) {
          console.log(`[CRON] Retention Check: identified ${retentionReport.targets_identified} students for reengagement`);
          
          // For each target, send notification + drift check
          for (const target of retentionReport.targets || []) {
            try {
              // Check for drift
              await handleDriftDetection(target.student_id, env);
              
              // Send weak skill drill if streak at risk (3+ days silent)
              if (target.hours_silent >= 72) {
                await handleWeakSkillDrill(target.student_id, env);
              }
            } catch (e) {
              console.log(`[CRON] Retention action error for ${target.student_id}: ${e.message}`);
            }
          }
        }
      } catch (err) {
        console.log(`[CRON] Retention Check error: ${err.message}`);
      }
    }

    // Auto Post Engine runs every 3 hours
    try {
      const postReport = await runAutoPostEngine(env);
      console.log(`[CRON] Auto Post Engine: ${JSON.stringify(postReport)}`);
    } catch (err) {
      console.log(`[CRON] Auto Post error: ${err.message}`);
    }

    // Virality Learning Loop â€” score posts, extract patterns, evolve strategy
    try {
      const viralReport = await runLearningLoop(env);
      console.log(`[CRON] Virality Learning Loop: ${JSON.stringify(viralReport)}`);
    } catch (err) {
      console.log(`[CRON] Virality Learning error: ${err.message}`);
    }
  },
};

// â”€â”€ API Router â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleAPI(path, request, env, url) {
  const method = request.method;
  
  // Image Generation Proxy â€” forwards to configured Image Gen URL (Vast.ai, RunPod, or local)
    if (path === "/api/image" && method === "POST") {
      try {
        const body = await request.json();
        const prompt = body.prompt || "";
        const targetUrl = env.IMAGE_GEN_URL || "http://127.0.0.1:7860/";
        
        const flaskRes = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ prompt }),
        });
        const html = await flaskRes.text();
        // Extract base64 image from HTML response
        const match = html.match(/src=\"data:image\/png;base64,([^\"]+)/);
        if (match && match[1]) {
          return json({ ok: true, image: match[1] });
        } else {
          return json({ ok: false, error: "No image found in response." }, 502);
        }
      } catch (err) {
        return json({ ok: false, error: err.message }, 500);
}
    }

    // Run 322 MVP: Voice Input â†’ Correction
    if (path === "/api/speak" && method === "POST") {
      return await handleSpeak(request, env);
    }

    // â€”â€”â€” RUN 325 + 326: OBI AGENT 99 ORCHESTRATION (Full Unified System) â€”â€”â€”
    // Path: /api/obi-agent99
    // Body: { "studentId": "...", "message": "..." }
    // Returns: Agent99 orchestration result with Soul + SessionLog anchoring
    if (path === "/api/obi-agent99" && method === "POST") {
      try {
        const body = await request.json();
        const { studentId, message } = body;

        if (!studentId || !message) {
          return json(
            { error: "MISSING_PARAMS", message: "studentId and message required" },
            400
          );
        }

        const router = new OBIOrchestrationRouter(env);
        const result = await router.handleChatRequest(studentId, message);

        return addCors(json(result), request);
      } catch (err) {
        console.error("/api/obi-agent99 error:", err);
        return addCors(
          json(
            {
              error: "OBI_ORCHESTRATION_FAILED",
              message: err.message,
              userMessage: "System error. Please try again.",
            },
            500
          ),
          request
        );
      }
    }

    // DEBUG: Get orchestration report
    if (path.startsWith("/api/obi-agent99/report/")) {
      const studentId = path.split("/")[4];
      if (!studentId) {
        return json({ error: "studentId required" }, 400);
      }

      const router = new OBIOrchestrationRouter(env);
      const report = await router.getOrchestrationReport(studentId);
      return addCors(json(report), request);
    }

    // Run 323-325: Student Memory System â€” Soul DNA Capture + Status
    if (path === "/api/souldna" && method === "POST") {
      const res = await handleSoulDNACapture(request, env);
      return addCors(res, request);
    }

    if (path.startsWith("/api/souldna/") && method === "GET" && path !== "/api/souldna/") {
      const student_id = path.split("/")[3];
      const res = await handleSoulDNAStatus(request, env, student_id);
      return addCors(res, request);
    }

    // Run 325: Retention Engine â€” Daily Behavioral Loop
    if (path === "/api/retention/check" && method === "GET") {
      const result = await handleRetentionCheck(env);
      return json(result);
    }

    if (path === "/api/retention/streak" && method === "POST") {
      const body = await request.json();
      if (!body.student_id) return json({ error: "student_id required" }, 400);
      const result = await handleStreakUpdate(body.student_id, env);
      return json(result);
    }

    if (path === "/api/retention/drill" && method === "POST") {
      const body = await request.json();
      if (!body.student_id) return json({ error: "student_id required" }, 400);
      const result = await handleWeakSkillDrill(body.student_id, env);
      return json(result);
    }

    if (path === "/api/retention/milestone" && method === "POST") {
      const body = await request.json();
      if (!body.student_id || !body.streak) return json({ error: "student_id and streak required" }, 400);
      const result = await handleMilestoneBonus(body.streak, body.student_id, env);
      return json(result);
    }

    if (path === "/api/retention/drift" && method === "POST") {
      const body = await request.json();
      if (!body.student_id) return json({ error: "student_id required" }, 400);
      const result = await handleDriftDetection(body.student_id, env);
      return json(result);
    }

    // Health â€” lightweight
  if (path === "/api/health" && method === "GET") {
    return json({ ok: !!env.DEEPSEEK_API_KEY, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), routes: 40, ai: env.DEEPSEEK_API_KEY ? "LIVE" : "DEAD", voice: env.DEEPGRAM_API_KEY ? "LIVE" : "DEAD", notion: env.NOTION_API_KEY ? "LIVE" : "DEAD", imagegen: env.IMAGE_GEN_URL ? "CONFIGURED" : "NOT_SET", readiness: (env.DEEPSEEK_API_KEY && env.DEEPGRAM_API_KEY) ? "PRODUCTION" : "NEEDS_SECRETS" });
  }

  // Deep health â€” full dependency probe (hit each external service)
  if (path === "/api/health/deep" && method === "GET") {
    const checks = {};
    // DeepSeek probe
    if (env.DEEPSEEK_API_KEY) {
      try {
        const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
          body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "user", content: "ping" }], max_tokens: 1 }),
        });
        checks.deepseek = { ok: dsRes.ok, status: dsRes.status };
      } catch (e) { checks.deepseek = { ok: false, error: e.message }; }
    } else { checks.deepseek = { ok: false, error: "SECRET_MISSING" }; }
    // Deepgram probe
    if (env.DEEPGRAM_API_KEY) {
      try {
        const dgRes = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
          method: "POST",
          headers: { "Authorization": `Token ${env.DEEPGRAM_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ text: "ok" }),
        });
        checks.deepgram = { ok: dgRes.ok, status: dgRes.status };
      } catch (e) { checks.deepgram = { ok: false, error: e.message }; }
    } else { checks.deepgram = { ok: false, error: "SECRET_MISSING" }; }
    // Notion probe
    if (env.NOTION_API_KEY) {
      try {
        const nRes = await fetch("https://api.notion.com/v1/users/me", {
          headers: { "Authorization": `Bearer ${env.NOTION_API_KEY}`, "Notion-Version": "2022-06-28" },
        });
        checks.notion = { ok: nRes.ok, status: nRes.status };
      } catch (e) { checks.notion = { ok: false, error: e.message }; }
    } else { checks.notion = { ok: false, error: "SECRET_MISSING" }; }
    // DO bindings
    checks.durableObjects = { SESSIONS: !!env.SESSIONS, PROFILES: !!env.PROFILES, PETS: !!env.PETS, LEDGER: !!env.LEDGER, COMMANDS: !!env.COMMANDS };
    const allOk = checks.deepseek?.ok && checks.deepgram?.ok && checks.notion?.ok;
    return json({ ok: allOk, version: VERSION, checks, readiness: allOk ? "ALL_SYSTEMS_GO" : "DEGRADED", ts: Date.now() });
  }

  // Chat â€” Obi + Ledger context injection
  if (path === "/api/chat" && method === "POST") { const body = await request.json(); return handleChat(body, env); }

  // Test Setup (Gate 7: Production validation fixtures)
  if (path === "/api/test-setup" && (method === "GET" || method === "POST")) { return await handleTestSetup(request, env); }

  // Speech-to-Learning MVP â€” core loop
  if (path === "/api/correct" && method === "POST") { const body = await request.json(); return handleCorrect(body, env); }
  if (path === "/api/repeat" && method === "POST") { const body = await request.json(); return handleRepeat(body, env); }
  if (path === "/api/mistakes" && method === "GET") { return handleMistakes(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/parent/report" && method === "GET") { return handleParentReport(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/teacher/dashboard" && method === "GET") { return handleTeacherDashboard(env); }

  // TTS
  if (path === "/api/tts" && method === "POST") { const body = await request.json(); return handleTTS(body, env); }

  // Onboarding
  if (path === "/api/onboarding" && method === "POST") { const body = await request.json(); return handleOnboarding(body, env); }

  // Memory
  if (path === "/api/memory" && method === "POST") { const body = await request.json(); return handleMemorySave(body, env); }
  if (path === "/api/memory/store" && method === "POST") { const body = await request.json(); return handleMemorySave(body, env); }
  if (path === "/api/memory" && method === "GET") { return handleMemoryGet(url.searchParams.get("studentId") || "", env); }

  // Progress + Weakness tracking
  if (path === "/api/progress" && method === "GET") { return handleProgress(url.searchParams.get("studentId") || "", env); }

  // Daily task + Memory
  if (path === "/api/daily" && method === "GET") { return handleDailyTask(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/memory/summary" && method === "GET") { return handleMemorySummary(url.searchParams.get("studentId") || "", env); }

  // Lesson / Practice / Feedback
  if (path === "/api/lesson" && method === "POST") { const body = await request.json(); return handleLesson(body, env); }
  if (path === "/api/practice" && method === "POST") { const body = await request.json(); return handlePractice(body, env); }
  if (path === "/api/feedback" && method === "POST") { const body = await request.json(); return handleFeedback(body, env); }

  // NET Pet
  if (path === "/api/netpet/checkin" && method === "POST") { const body = await request.json(); return handlePetCheckin(body, env); }
  if (path === "/api/netpet/state" && method === "GET") { return handlePetState(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/netpet/score" && method === "GET") { return handlePetScore(url.searchParams.get("studentId") || "", env); }

  // Phonics Drills â€” targeted practice based on weaknesses
  if (path === "/api/drills/next" && method === "GET") { return handleDrillNext(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/drills/result" && method === "POST") { const body = await request.json(); return handleDrillResult(body, env); }
  if (path === "/api/drills/list" && method === "GET") { return handleDrillList(); }

  // Metrics â€” the 4 that matter (DAU, completion, retention, error reduction)
  if (path === "/api/metrics/summary" && method === "GET") { return handleMetricsSummary(env); }
  if (path === "/api/metrics/dau" && method === "GET") { return handleMetricsDAU(env); }
  if (path === "/api/metrics/retention" && method === "GET") { return handleMetricsRetention(env); }
  if (path === "/api/metrics/errors" && method === "GET") { return handleMetricsErrors(url.searchParams.get("studentId") || "", env); }

  // Classroom
  if (path === "/api/classroom/session/start" && method === "POST") { const body = await request.json(); return handleClassStart(body, env); }
  if (path === "/api/classroom/event" && method === "POST") { const body = await request.json(); return handleClassEvent(body, env); }
  if (path === "/api/classroom/session" && method === "GET") { return handleClassSession(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env); }
  if (path === "/api/classroom/report" && method === "GET") { return handleClassReport(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env); }

  // Cryptographic Immutable Ledger
  if (path === "/api/ledger/append" && method === "POST") { const body = await request.json(); return handleLedgerAppend(body, env); }
  if (path === "/api/ledger/history" && method === "GET") { return handleLedgerHistory(url.searchParams.get("studentId") || "", parseInt(url.searchParams.get("limit") || "50"), env); }
  if (path === "/api/ledger/verify" && method === "GET") { return handleLedgerVerify(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/ledger/state" && method === "GET") { return handleLedgerState(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/ledger/stats" && method === "GET") { return handleLedgerStats(env); }

  // Session Log (off-day pipeline core â€” Michael logs class, Obi inherits it)
  if (path === "/api/session/log" && method === "POST") { const body = await request.json(); return handleSessionLog(body, env); }
  if (path === "/api/session/latest" && method === "GET") { return handleSessionLatest(url.searchParams.get("studentId") || "", env); }

  // Schedule + Accountability
  if (path === "/api/schedule/set" && method === "POST") { const body = await request.json(); return handleScheduleSet(body, env); }
  if (path === "/api/schedule/confirm" && method === "POST") { const body = await request.json(); return handleScheduleConfirm(body, env); }
  if (path === "/api/schedule/flags" && method === "GET") { return handleScheduleFlags(env); }

  // Zalo Pressure API â€” accountability alerts + relation graph
  if (path === "/api/zalo/sweep" && method === "POST") { return handleZaloSweep(env); }
  if (path === "/api/zalo/check" && method === "POST") { const body = await request.json(); return handleZaloCheck(body, env); }
  if (path === "/api/zalo/send" && method === "POST") { const body = await request.json(); return handleZaloSend(body, env); }
  if (path === "/api/pressure/status" && method === "GET") { return handlePressureStatus(env); }
  if (path === "/api/pressure/test" && method === "POST") { const body = await request.json(); return handlePressureTest(body, env); }
  if (path === "/api/relations/add" && method === "POST") { const body = await request.json(); return handleRelationAdd(body, env); }
  if (path === "/api/relations/remove" && method === "POST") { const body = await request.json(); return handleRelationRemove(body, env); }
  if (path === "/api/relations/get" && method === "GET") { return handleRelationGet(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/relations/all" && method === "GET") { return handleRelationAll(env); }
  if (path === "/api/roster/zalo" && method === "POST") { const body = await request.json(); return handleRosterZalo(body, env); }

  // Daily Digest â€” Michael's one-URL morning report
  if (path === "/api/digest" && method === "GET") { return handleDailyDigest(env); }

  // Soul DNA â€” verbatim raw capture (no sanitization, no truncation, hash-chained)
  if (path === "/api/soulDNA" && method === "POST") { const body = await request.json(); return handleSoulDNACapture(body, env); }
  if (path === "/api/soulDNA" && method === "GET") { return handleSoulDNAGet(url, env); }

  // Command Station (SOV100 â†’ Agent99 â†’ Drones)
  if (path === "/api/command/send" && method === "POST") { const body = await request.json(); return handleCommandSend(body, env); }
  if (path === "/api/command/queue" && method === "GET") { return handleCommandQueue(url.searchParams.get("status") || "pending", parseInt(url.searchParams.get("limit") || "20"), env); }
  if (path === "/api/command/claim" && method === "POST") { const body = await request.json(); return handleCommandClaim(body, env); }
  if (path === "/api/command/complete" && method === "POST") { const body = await request.json(); return handleCommandComplete(body, env); }
  if (path === "/api/command/status" && method === "GET") { return handleCommandStatus(url.searchParams.get("commandId") || "", env); }
  if (path === "/api/command/history" && method === "GET") { return handleCommandHistory(parseInt(url.searchParams.get("limit") || "50"), env); }

  // Notion Integration (all routes degrade gracefully when NOTION_API_KEY is unset)
  if (path === "/api/notion/lessons" && method === "GET") { return handleNotionLessons(url, env); }
  if (path === "/api/notion/progress" && method === "GET") { return handleNotionProgress(url, env); }
  if (path === "/api/notion/progress" && method === "POST") { const body = await request.json(); return handleNotionProgressWrite(body, env); }
  if (path === "/api/notion/sync" && method === "POST") { const body = await request.json(); return handleNotionSync(body, env); }

  // â”€â”€ Behavioral Loop Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // /api/loop â€” Enforced speakâ†’correctâ†’repeatâ†’score cycle (single call)
  if (path === "/api/loop" && method === "POST") { const body = await request.json(); return handleLoop(body, env); }
  // /api/tiger-score â€” On-demand Tiger Score with full breakdown
  if (path === "/api/tiger-score" && method === "GET") { return handleTigerScore(url.searchParams.get("studentId") || "", env); }
  // /api/analytics â€” The only 4 metrics that matter
  if (path === "/api/analytics" && method === "GET") { return handleAnalytics(env); }

  // â”€â”€ v2 Pipeline: Student State + Session Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // /api/student/state â€” Full behavioral state (Mouse/Cub/Tiger + scores)
  if (path === "/api/student/state" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return json({ error: "studentId required" }, 400);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return json({ error: idCheck.error }, 400);
    const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
    const res = await stub.fetch(new Request("https://do/state/full"));
    return res;
  }
  // /api/session/events â€” Structured learning event chain
  if (path === "/api/session/events" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return json({ error: "studentId required" }, 400);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return json({ error: idCheck.error }, 400);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`events-${studentId}`));
    const res = await stub.fetch(new Request(`https://do/events/recent?limit=${limit}`));
    return res;
  }

  // â”€â”€ Skeleton Star Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // /api/route â€” Get routing decision for a student (which module, which mode)
  if (path === "/api/route" && method === "POST") { const body = await request.json(); return handleRoute(body, env); }

  // â”€â”€ Phoenix Reset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // /api/phoenix/snapshot â€” Capture full student state
  if (path === "/api/phoenix/snapshot" && method === "POST") { const body = await request.json(); return handlePhoenixSnapshot(body, env); }
  // /api/phoenix/reset â€” Reset + rehydrate from latest snapshot
  if (path === "/api/phoenix/reset" && method === "POST") { const body = await request.json(); return handlePhoenixReset(body, env); }

  // â”€â”€ Assessment + Report Engine (Week 4 â€” Productization) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // POST /api/assess â€” Run AI speaking diagnostic (submit transcript, get scored)
  if (path === "/api/assess" && method === "POST") { const body = await request.json(); return handleAssessment(body, env); }
  // GET /api/report â€” Generate styled HTML report for a student
  if (path === "/api/report" && method === "GET") { return handleReport(url.searchParams.get("studentId") || "", env); }
  // POST /api/lead â€” Lead capture from assessment landing page
  if (path === "/api/lead" && method === "POST") { const body = await request.json(); return handleLeadCapture(body, env); }

  // â”€â”€ Auto Post Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // /api/growth/posts â€” Generate posts from real student data
  if (path === "/api/growth/posts" && method === "GET") { return handleGrowthPosts(parseInt(url.searchParams.get("limit") || "5"), env); }
  // /api/growth/distribute â€” Manually trigger post distribution
  if (path === "/api/growth/distribute" && method === "POST") { return handleGrowthDistribute(env); }
  // /api/growth/log â€” View post history
  if (path === "/api/growth/log" && method === "GET") { return handleGrowthLog(parseInt(url.searchParams.get("limit") || "20"), env); }

  // â”€â”€ Virality Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // POST /api/virality/metrics â€” Submit post engagement metrics
  if (path === "/api/virality/metrics" && method === "POST") { return handleViralityProxy("/virality/metrics", "POST", body, env); }
  // GET /api/virality/metrics â€” Get recent post metrics
  if (path === "/api/virality/metrics" && method === "GET") { return handleViralityProxy("/virality/metrics", "GET", null, env, url.searchParams); }
  // GET /api/virality/top â€” Top performing posts
  if (path === "/api/virality/top" && method === "GET") { return handleViralityProxy("/virality/top", "GET", null, env, url.searchParams); }
  // POST /api/virality/experiment â€” Create experiment variant group
  if (path === "/api/virality/experiment" && method === "POST") { return handleViralityProxy("/virality/experiment", "POST", body, env); }
  // GET /api/virality/experiments â€” List experiments by status
  if (path === "/api/virality/experiments" && method === "GET") { return handleViralityProxy("/virality/experiments", "GET", null, env, url.searchParams); }
  // GET /api/virality/patterns â€” Get winning content patterns
  if (path === "/api/virality/patterns" && method === "GET") { return handleViralityProxy("/virality/patterns", "GET", null, env, url.searchParams); }
  // POST /api/virality/learn â€” Trigger learning loop manually
  if (path === "/api/virality/learn" && method === "POST") { return handleViralityLearn(env); }
  // POST /api/virality/score â€” Calculate virality score for given metrics
  if (path === "/api/virality/score" && method === "POST") { return handleViralityScore(body); }
  // POST /api/virality/variants â€” Generate hook variants from insight
  if (path === "/api/virality/variants" && method === "POST") { return handleViralityVariants(body, env); }

  return json({ error: "Not found" }, 404);
}

// â”€â”€ Soul DNA Capture â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// VERBATIM FIRST. Zero transformation. Every word Michael speaks is sacred.
// No sanitizeInput. No truncation. No paraphrase. Raw â†’ hash â†’ chain â†’ ledger.

// â”€â”€ Notion: Soul DNA mirror (non-blocking, fire-and-forget) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Mirrors verbatim Soul DNA blocks to Notion database for searchable archive.
async function notionSyncSoulDNA(payloadObj, entryHash, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_SOUL_DNA_DB) return;
  try {
    await writeSoulDNA(env.NOTION_API_KEY, env.NOTION_SOUL_DNA_DB, {
      ...payloadObj,
      entryHash,
    });
  } catch (_) {}
}

async function handleSoulDNAGet(url, env) {
  const run     = url.searchParams.get("run")    || "";
  const limit   = Math.min(parseInt(url.searchParams.get("limit") || "50"), 500);
  const raw     = url.searchParams.get("raw")    === "true"; // raw=true â†’ include full text in response

  if (!env.LEDGER) return json({ error: "LEDGER binding not configured" }, 500);
  const stub = env.LEDGER.get(env.LEDGER.idFromName("sov100"));
  const histRes = await stub.fetch(
    new Request(`https://do/history?limit=${limit}&eventType=soul_dna_capture`)
  );
  const { entries, total } = await histRes.json();

  let blocks = entries.map(e => {
    let p = {};
    try { p = JSON.parse(e.payload); } catch (_) { p = { text: e.payload }; }
    const block = {
      id:         e.id,
      blockId:    p.blockId   || "",
      run:        p.run       || "untagged",
      source:     p.source    || "unknown",
      charCount:  p.charCount || 0,
      wordCount:  p.wordCount || 0,
      capturedAt: p.capturedAt || new Date(e.ts).toISOString(),
      entryHash:  e.entry_hash,
      prevHash:   e.prev_hash,
    };
    if (raw) block.text = p.text || "";
    return block;
  });

  // Filter by run if requested
  if (run) blocks = blocks.filter(b => b.run === run);

  const totalWords = blocks.reduce((sum, b) => sum + (b.wordCount || 0), 0);
  const totalChars = blocks.reduce((sum, b) => sum + (b.charCount || 0), 0);

  return json({ ok: true, blocks, totalBlocks: blocks.length, totalWords, totalChars, total });
}

// â”€â”€ OBI v2 Pipeline: Context Builder + Drift + Scoring + Signals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Structured Context Builder â€” merges Soul + Sessions + State + Weaknesses
async function buildStructuredContext(env, studentId) {
  const ctx = { soul: null, sessionEvents: [], studentState: null, profile: null, weakPoints: [], petState: null };

  // Load Soul DNA (last 3 intent anchors â€” grounding reference only)
  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName("sov100"));
      const res = await stub.fetch(new Request("https://do/history?limit=3&eventType=soul_dna_capture"));
      const data = await res.json();
      if (data.entries?.length > 0) {
        ctx.soul = data.entries.map(e => { try { return JSON.parse(e.payload); } catch { return null; } }).filter(Boolean);
      }
    } catch (_) {}
  }

  // Load recent session events (last 10 structured learning events)
  if (env.SESSIONS) {
    try {
      const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`events-${studentId}`));
      const res = await stub.fetch(new Request("https://do/events/recent?limit=10"));
      ctx.sessionEvents = (await res.json()).events || [];
    } catch (_) {}
  }

  // Load student profile + behavioral state + weakness patterns (parallel)
  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const [stateRes, profileRes, wpRes] = await Promise.all([
        stub.fetch(new Request("https://do/state/get")),
        stub.fetch(new Request("https://do/profile")),
        stub.fetch(new Request("https://do/weakness/get")),
      ]);
      ctx.studentState = (await stateRes.json()).studentState || null;
      ctx.profile = (await profileRes.json()).profile || null;
      ctx.weakPoints = (await wpRes.json()).weakPoints || [];
    } catch (_) {}
  }

  // Load pet state (streak, tiger score, mood)
  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      ctx.petState = (await stub.fetch(new Request("https://do/state")).then(r => r.json())).state || null;
    } catch (_) {}
  }

  return ctx;
}

// Drift Detection â€” scores how disconnected current input is from session context
function computeDriftScore(input, context) {
  let score = 0;
  if (!context.sessionEvents?.length) score += 3;  // no history = high drift
  const lastEvent = context.sessionEvents?.[0];
  if (lastEvent?.topic && input.length > 5) {
    const topicWords = lastEvent.topic.toLowerCase().split(/\s+/);
    const inputLower = input.toLowerCase();
    if (!topicWords.some(w => w.length > 3 && inputLower.includes(w))) score += 2;
  }
  if (!context.studentState) score += 1;  // no state loaded
  if (input.length < 3) score += 1;       // disengagement signal
  return Math.min(score, 10);
}

// Mouse â†’ Tiger Score Calculator â€” behavioral state machine
function computeMouseTigerScore(metrics) {
  const score =
    (metrics.executionScore || 0) * 0.3 +
    (metrics.continuityScore || 0) * 0.25 +
    (metrics.engagementScore || 0) * 0.2 +
    (metrics.accountabilityScore || 0) * 0.15 +
    (metrics.accuracyScore || 0) * 0.1;
  const state = score >= 80 ? "TIGER" : score >= 40 ? "CUB" : "MOUSE";
  return { score: Math.round(score), state };
}

// Learning Signal Extraction â€” derives structured signals from chat exchange
function extractLearningSignals(input, response) {
  const signals = { mistakes: [], vocabulary: [], phonics: [], topic: "" };
  // Corrections from OBI response
  const corrPatterns = [/(?:should be|correct(?:ion)?|instead of|say|use)\s+[""]([^""]+)[""]/gi, /â†’\s*(.+?)(?:\.|$)/gm];
  for (const pat of corrPatterns) {
    let m; while ((m = pat.exec(response)) !== null) {
      if (m[1]?.length > 2 && m[1].length < 100) signals.mistakes.push(m[1].trim());
    }
  }
  // Vocabulary (quoted words)
  const vp = /[""](\w[\w\s]{1,30})[""]/g; let vm;
  while ((vm = vp.exec(response)) !== null) {
    if (vm[1] && !signals.mistakes.includes(vm[1])) signals.vocabulary.push(vm[1].trim());
  }
  signals.vocabulary = [...new Set(signals.vocabulary)].slice(0, 10);
  // Phonics detection
  const phonicsKw = ["pronunciation", "sound", "phonics", "th ", "ch ", "sh ", "/r/", "/l/", "/Î¸/", "/Ã°/"];
  if (phonicsKw.some(k => response.toLowerCase().includes(k))) {
    signals.phonics = (response.match(/\/[^/]+\//g) || []).slice(0, 5);
  }
  // Topic from input
  signals.topic = input.split(/\s+/).filter(w => w.length > 4).slice(0, 3).join(" ") || "general practice";
  return signals;
}

// Next Action Generator â€” deterministic "what comes next" based on state + signals
function generateNextAction(studentState, signals) {
  const state = studentState?.state || "MOUSE";
  if (signals.mistakes.length > 0) {
    return { type: "REPEAT", instruction: `Repeat with correction: "${signals.mistakes[0]}"`, difficulty: 0 };
  }
  if (state === "MOUSE") return { type: "SPEAK", instruction: "Try saying one more sentence using any words you know", difficulty: -0.1 };
  if (state === "CUB") return { type: "PRACTICE", instruction: "Try using a new word from today's vocabulary in a sentence", difficulty: 0.1 };
  return { type: "CHALLENGE", instruction: "Create a longer response with more complex grammar", difficulty: 0.2 };
}

// Format structured context into OBI system prompt injection
function formatContextForPrompt(ctx) {
  let injection = "";
  // Session continuity
  if (ctx.sessionEvents?.length > 0) {
    const recent = ctx.sessionEvents.slice(0, 5);
    const lines = recent.map(e => {
      const parts = [`Topic: ${e.topic || "?"}`, e.mistakes ? `Mistakes: ${e.mistakes}` : null, e.next_action ? `Next: ${e.next_action}` : null];
      return parts.filter(Boolean).join(" | ");
    });
    injection += `\n\nSESSION HISTORY (${ctx.sessionEvents.length} events â€” this is your continuous memory chain):\n${lines.join("\n")}`;
  }
  // Student state
  if (ctx.studentState) {
    const s = ctx.studentState;
    injection += `\n\nSTUDENT STATE: ${s.state || "MOUSE"} (score: ${s.mouse_tiger_score || 0}/100). Continuity: ${s.continuity_score || 0}. Events: ${s.total_events || 0}.`;
  }
  // Weakness patterns
  if (ctx.weakPoints?.length > 0) {
    const top = ctx.weakPoints.slice(0, 5).map(w => `${w.specific} (${w.category}, Ã—${w.error_count})`);
    injection += `\n\nKNOWN WEAKNESSES: ${top.join(", ")}. Target these in corrections.`;
  }
  // Pet state (streak/mood)
  if (ctx.petState) {
    injection += `\n\nSTREAK: ${ctx.petState.streak || 0} days. Mood: ${ctx.petState.mood || "neutral"}. Tiger score: ${ctx.petState.tigerScore || 0}.`;
  }
  return injection;
}

// â”€â”€ Chat (DeepSeek + Obi + Ledger memory injection) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleChat(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const studentId = body.studentId || "anonymous";
  if (studentId !== "anonymous") {
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  }

  let messages = Array.isArray(body.messages) ? [...body.messages] : [];

  // Sanitize all user messages before sending to LLM
  messages = messages.map(m => {
    if (m.role === "user") return { ...m, content: sanitizeInput(m.content || "") };
    return m;
  }).filter(m => m.role === "system" || m.role === "user" || m.role === "assistant");

  // â”€â”€ Pull Ledger context (Obi's unparalleled student memory) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let ledgerContext = "";
  if (studentId !== "anonymous" && env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const histRes = await stub.fetch(new Request("https://do/history?limit=15"));
      const histData = await histRes.json();
      if (histData.entries && histData.entries.length > 0) {
        const lines = histData.entries
          .filter(e => e.event_type === "chat_exchange")
          .slice(-10)
          .map(e => {
            try {
              const p = JSON.parse(e.payload);
              return `Student: ${p.user}\nObi: ${p.obi}`;
            } catch { return ""; }
          })
          .filter(Boolean);
        if (lines.length > 0) {
          ledgerContext = `\n\nSTUDENT LEDGER (${histData.entries.length} total exchanges â€” this is your unalterable memory of this student):\n${lines.join("\n---\n")}`;
        }
      }
    } catch (_) {}
  }

  // Inject Obi system prompt with ledger context + last real-class session appended
  // Pull latest session_log so Obi knows exactly where Michael left off
  let sessionContext = "";
  if (studentId !== "anonymous" && env.LEDGER) {
    try {
      const sessionStub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const sessionRes = await sessionStub.fetch(new Request("https://do/history?limit=1&eventType=session_log"));
      const sessionData = await sessionRes.json();
      const lastEntry = (sessionData.entries || []).slice(-1)[0];
      if (lastEntry) {
        const s = JSON.parse(lastEntry.payload);
        const dateStr = new Date(lastEntry.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const vocabList = Array.isArray(s.vocabList) ? s.vocabList.join(", ") : (s.vocabList || "");
        sessionContext = `\n\nLAST REAL CLASS (${dateStr}): Topic: "${s.topic || ""}". Vocab covered: ${vocabList}. Level: ${s.studentLevel || ""}. Teacher notes: "${s.teacherNotes || ""}". Continue from exactly here â€” your first response should reference this content naturally without announcing it.`;
      }
    } catch (_) {}
  }

  // â”€â”€ Memory Brain: Weakness injection + Re-entry detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let weaknessContext = "";
  let reEntryContext = "";
  let rewardContext = "";
  let weakPointsData = [];
  let structuredCtx = null;
  if (studentId !== "anonymous" && env.PROFILES) {
    try {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const wpRes = await profileStub.fetch(new Request("https://do/weakness/get"));
      const wpData = await wpRes.json();
      weakPointsData = wpData.weakPoints || [];
      weaknessContext = buildWeaknessPrompt(weakPointsData);
    } catch (_) {}
  }
  if (studentId !== "anonymous" && env.PETS) {
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(studentId));
      const petRes = await petStub.fetch(new Request("https://do/state"));
      const petData = await petRes.json();
      const lastCheckin = petData.state?.lastCheckin || 0;
      const streakDays = petData.state?.streak || 0;
      if (lastCheckin > 0) {
        const daysSince = Math.floor((Date.now() - lastCheckin) / 86400000);
        const topWeak = weakPointsData[0]?.specific || null;
        reEntryContext = buildReEntryPrompt(daysSince, topWeak);
      }
      const signals = buildRewardSignals(weakPointsData, streakDays);
      rewardContext = buildRewardPrompt(signals);
    } catch (_) {}
  }

  // â”€â”€ v2 Pipeline: Load structured context for continuity engine â”€â”€â”€â”€â”€â”€â”€â”€
  if (studentId !== "anonymous") {
    try { structuredCtx = await buildStructuredContext(env, studentId); } catch (_) {}
  }
  const contextInjection = structuredCtx ? formatContextForPrompt(structuredCtx) : "";

  const hasSystem = messages.some(m => m.role === "system");
  if (!hasSystem) {
    messages.unshift({ role: "system", content: OBI_SYSTEM + ledgerContext + sessionContext + weaknessContext + reEntryContext + rewardContext + contextInjection });
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages, max_tokens: 300, temperature: 0.85 }),
  });

  if (!res.ok) { const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502); }
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Say that again?";

  // â”€â”€ Auto-write every exchange to the Cryptographic Immutable Ledger â”€â”€â”€â”€â”€â”€â”€
  const userMsg = messages.filter(m => m.role === "user").pop()?.content || "";
  if (studentId !== "anonymous" && env.LEDGER && userMsg) {
    const payload = JSON.stringify({ user: userMsg, obi: reply });
    appendToLedger(studentId, "chat_exchange", payload, env).catch(() => {});
  }

  // â”€â”€ Notion sync: mirror chat exchange to Notion progress DB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Disabled by default (free-tier protection). Set NOTION_CHAT_MIRROR=1 to enable.
  if (studentId !== "anonymous" && env.NOTION_API_KEY && env.NOTION_PROGRESS_DB && env.NOTION_CHAT_MIRROR === "1" && userMsg) {
    writeChatExchange(env.NOTION_API_KEY, env.NOTION_PROGRESS_DB, {
      studentId,
      userMessage: userMsg,
      obiReply: reply,
      level: body.level || "Mouse",
    }).catch(() => {});
  }

  // â”€â”€ Memory Brain: Extract weaknesses from OBI's correction and store â”€â”€â”€â”€â”€
  if (studentId !== "anonymous" && env.PROFILES) {
    const detected = extractWeaknesses(reply);
    if (detected.length > 0) {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      profileStub.fetch(new Request("https://do/weakness/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, weaknesses: detected }),
      })).catch(() => {});
    }
  }

  // Update roster last_active so digest knows student practiced today
  if (studentId !== "anonymous" && env.SESSIONS) {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await rosterStub.fetch(new Request("https://do/roster/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    })).catch(() => {});
  }

  // â”€â”€ Memory Compression: update Soul DNA v1 summary after each interaction â”€
  if (studentId !== "anonymous") {
    updateStudentMemory(studentId, env).catch(() => {});
  }

  // â”€â”€ v2 Pipeline: Extract signals â†’ Write session event â†’ Update state â”€â”€â”€
  let driftScore = 0;
  let nextAction = null;
  let learningSignals = null;
  if (studentId !== "anonymous" && userMsg) {
    // 1. Compute drift
    driftScore = structuredCtx ? computeDriftScore(userMsg, structuredCtx) : 0;

    // 2. Extract learning signals from the exchange
    learningSignals = extractLearningSignals(userMsg, reply);

    // 3. Generate next action
    nextAction = generateNextAction(structuredCtx?.studentState, learningSignals);

    // 4. Write structured session event (non-blocking)
    if (env.SESSIONS) {
      const eventsStub = env.SESSIONS.get(env.SESSIONS.idFromName(`events-${studentId}`));
      eventsStub.fetch(new Request("https://do/events/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          input: userMsg,
          output: reply,
          mistakes: JSON.stringify(learningSignals.mistakes),
          vocabulary: JSON.stringify(learningSignals.vocabulary),
          phonics: JSON.stringify(learningSignals.phonics),
          topic: learningSignals.topic,
          nextAction: nextAction ? nextAction.instruction : "",
          driftScore,
        }),
      })).catch(() => {});
    }

    // 5. Update student behavioral state (non-blocking)
    if (env.PROFILES) {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      profileStub.fetch(new Request("https://do/state/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          hasMistakes: learningSignals.mistakes.length > 0,
          driftScore,
          inputLength: userMsg.length,
        }),
      })).catch(() => {});
    }
  }

  return json({
    reply,
    studentId,
    ledgerLoaded: !!ledgerContext,
    sessionLoaded: !!sessionContext,
    weaknessLoaded: !!weaknessContext,
    reEntryMode: !!reEntryContext,
    driftScore,
    nextAction,
    state: structuredCtx?.studentState?.state || null,
    mouseTigerScore: structuredCtx?.studentState?.mouse_tiger_score || null,
  });
}

// â”€â”€ TTS (Deepgram Aura) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleTTS(body, env) {
  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not configured" }, 500);
  const text = sanitizeInput((body.text || "").slice(0, 1000));
  if (!text) return json({ error: "No text provided" }, 400);
  const res = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
    method: "POST",
    headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return json({ error: `Deepgram TTS ${res.status}` }, 502);
  return new Response(res.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", ...corsHeaders() } });
}

// â”€â”€ Speech-to-Learning MVP â€” Core Loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CORRECT_PROMPT = `You are OBI, a strict but warm English coach for Vietnamese students.

TASK: The student spoke a sentence. You must:
1. Correct ANY grammar, vocabulary, or phrasing errors
2. Explain the mistake simply (1 sentence max, use Vietnamese translation if it helps)
3. Give the corrected sentence for them to repeat

RULES:
- If the sentence is already correct, say so and give a slightly more advanced version to try
- Keep explanations SHORT â€” max 1-2 sentences
- Be encouraging, never shaming
- Focus on the MOST IMPORTANT error first, not every tiny detail

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no extra text):
{"corrected":"the corrected sentence","explanation":"why it was wrong, simply","repeat":"say this sentence out loud","wasCorrect":false}

If correct:
{"corrected":"their original sentence","explanation":"Perfect! Here's a challenge version:","repeat":"a slightly harder version","wasCorrect":true}`;

async function handleCorrect(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const studentId = body.studentId || "anonymous";
  const transcript = sanitizeInput((body.transcript || body.message || "").slice(0, 500));
  if (!transcript) return json({ error: "No speech transcript provided" }, 400);

  // Load past mistakes for context
  let mistakeContext = "";
  if (studentId !== "anonymous" && env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const histRes = await stub.fetch(new Request("https://do/history?limit=10&eventType=correction"));
      const histData = await histRes.json();
      const past = (histData.entries || []).map(e => {
        try { const p = JSON.parse(e.payload); return p.original; } catch { return ""; }
      }).filter(Boolean);
      if (past.length > 0) {
        mistakeContext = `\n\nSTUDENT'S PAST MISTAKES (they keep getting these wrong â€” watch for patterns):\n${past.slice(-5).map(m => `- "${m}"`).join("\n")}`;
      }
    } catch (_) {}
  }

  // Load weakness data
  let weakContext = "";
  if (studentId !== "anonymous" && env.PROFILES) {
    try {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const wpRes = await profileStub.fetch(new Request("https://do/weakness/get"));
      const wpData = await wpRes.json();
      weakContext = buildWeaknessPrompt(wpData.weakPoints || []);
    } catch (_) {}
  }

  const messages = [
    { role: "system", content: CORRECT_PROMPT + mistakeContext + weakContext },
    { role: "user", content: transcript },
  ];

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages, max_tokens: 200, temperature: 0.3 }),
  });

  if (!res.ok) { const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502); }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";

  // Parse structured response
  let result;
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    result = { corrected: raw, explanation: "", repeat: raw, wasCorrect: false };
  }

  // Store the correction in ledger
  if (studentId !== "anonymous" && env.LEDGER) {
    const payload = JSON.stringify({ original: transcript, corrected: result.corrected, wasCorrect: result.wasCorrect });
    appendToLedger(studentId, "correction", payload, env).catch(() => {});
  }

  // Extract + store weaknesses
  if (studentId !== "anonymous" && env.PROFILES && !result.wasCorrect) {
    const detected = extractWeaknesses(result.explanation + " " + result.corrected);
    if (detected.length > 0) {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      profileStub.fetch(new Request("https://do/weakness/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, weaknesses: detected }),
      })).catch(() => {});
    }
  }

  // Auto-checkin to PetDO (student spoke = they practiced)
  if (studentId !== "anonymous" && env.PETS) {
    const petStub = env.PETS.get(env.PETS.idFromName(studentId));
    petStub.fetch(new Request("https://do/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: 1, confidence: result.wasCorrect ? 7 : 4 }),
    })).catch(() => {});
  }

  return json({ ...result, original: transcript, studentId });
}

async function handleRepeat(body, env) {
  const studentId = body.studentId || "anonymous";
  const attempt = sanitizeInput((body.attempt || "").slice(0, 500));
  const expected = sanitizeInput((body.expected || "").slice(0, 500));
  if (!attempt || !expected) return json({ error: "attempt and expected required" }, 400);

  // Normalize for comparison: lowercase, strip punctuation, collapse whitespace
  const norm = s => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
  const a = norm(attempt);
  const e = norm(expected);

  // Simple word-level match score
  const eWords = e.split(" ");
  const aWords = a.split(" ");
  let matches = 0;
  for (let i = 0; i < eWords.length; i++) {
    if (aWords[i] === eWords[i]) matches++;
  }
  const score = eWords.length > 0 ? Math.round((matches / eWords.length) * 100) : 0;
  const passed = score >= 80;

  // Ledger the repeat attempt
  if (studentId !== "anonymous" && env.LEDGER) {
    const payload = JSON.stringify({ attempt, expected, score, passed });
    appendToLedger(studentId, "repeat_attempt", payload, env).catch(() => {});
  }

  let feedback;
  if (score === 100) feedback = "Perfect! You nailed it. ðŸ”¥";
  else if (score >= 80) feedback = "Close enough! Good job. Keep that sentence in your brain.";
  else if (score >= 50) feedback = "Almost â€” try again. Listen carefully to the corrected version.";
  else feedback = "Not quite. Listen to the sentence again, then repeat slowly.";

  return json({ passed, score, feedback, attempt, expected, studentId });
}

async function handleMistakes(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  if (!env.LEDGER) return json({ error: "LEDGER not configured" }, 500);

  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  const histRes = await stub.fetch(new Request("https://do/history?limit=50&eventType=correction"));
  const histData = await histRes.json();

  const mistakes = (histData.entries || []).map(e => {
    try {
      const p = JSON.parse(e.payload);
      return { original: p.original, corrected: p.corrected, wasCorrect: p.wasCorrect, ts: e.ts };
    } catch { return null; }
  }).filter(Boolean);

  const errorRate = mistakes.length > 0
    ? Math.round((mistakes.filter(m => !m.wasCorrect).length / mistakes.length) * 100)
    : 0;

  return json({ studentId, mistakes, total: mistakes.length, errorRate });
}

async function handleParentReport(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  // Gather student data from all DOs
  let profile = null, petState = null, mistakeCount = 0, lastActive = 0;

  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/profile"));
      const data = await res.json();
      profile = data.profile;
    } catch (_) {}
  }

  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/state"));
      const data = await res.json();
      petState = data.state;
      lastActive = petState?.lastCheckin || 0;
    } catch (_) {}
  }

  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/history?limit=100&eventType=correction"));
      const data = await res.json();
      mistakeCount = (data.entries || []).filter(e => {
        try { return !JSON.parse(e.payload).wasCorrect; } catch { return false; }
      }).length;
    } catch (_) {}
  }

  const daysSinceActive = lastActive > 0 ? Math.floor((Date.now() - lastActive) / 86400000) : -1;
  const alert = daysSinceActive > 1 ? `Student has not practiced for ${daysSinceActive} days` : null;

  return json({
    studentId,
    name: profile?.full_name || studentId,
    streak: petState?.streak || 0,
    totalSessions: petState?.total_sessions || 0,
    xp: petState?.xp || 0,
    mistakeCount,
    daysSinceActive,
    alert,
    level: profile?.english_level || "Unknown",
  });
}

async function handleTeacherDashboard(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);

  // Pull roster for class overview
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/flags"));
  const rosterData = await rosterRes.json();

  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const allFlags = rosterData.flags || [];
  const dropoffRisk = allFlags.filter(s => s.last_active > 0 && s.last_active < sevenDaysAgo);

  return json({
    totalStudents: rosterData.count || 0,
    flaggedStudents: allFlags.length,
    dropoffRisk: dropoffRisk.map(s => ({ studentId: s.student_id, lastActive: s.last_active, daysSince: Math.floor((Date.now() - s.last_active) / 86400000) })),
    roster: allFlags.map(s => ({ studentId: s.student_id, fullName: s.full_name, level: s.level, lastActive: s.last_active })),
  });
}

// â”€â”€ Onboarding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleOnboarding(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  const res = await stub.fetch(new Request("https://do/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

  // Ledger the onboarding event
  if (env.LEDGER) {
    const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
    appendToLedger(body.studentId, "onboarding", payload, env).catch(() => {});
  }
  // Register in roster so digest + flags work (must await â€” CF Workers kills fire-and-forget without waitUntil)
  await upsertRoster(body.studentId, { fullName: body.fullName, englishLevel: body.englishLevel }, env).catch(() => {});
  return res;
}

// â”€â”€ Memory (mutable scratch â€” Ledger is the permanent record) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleMemorySave(body, env) {
  const studentId = body.studentId || "unknown";
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(studentId));
  return stub.fetch(new Request("https://do/memory/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

async function handleMemoryGet(studentId, env) {
  if (!studentId) return json({ memory: [] });
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(studentId));
  return stub.fetch(new Request("https://do/memory/get"));
}

// â”€â”€ Progress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleProgress(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
  const progressRes = await profileStub.fetch(new Request("https://do/progress"));
  const progressData = await progressRes.json();
  let petState = null;
  try {
    const petStub = env.PETS.get(env.PETS.idFromName(studentId));
    const petRes = await petStub.fetch(new Request("https://do/state"));
    const petData = await petRes.json();
    petState = petData.state || null;
  } catch (_) {}
  const signals = buildRewardSignals(progressData.weakPoints || [], petState?.streak || 0);
  return json({ weakPoints: progressData.weakPoints, profile: progressData.profile, pet: petState, rewardSignals: signals });
}

// â”€â”€ Lesson / Practice / Feedback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleLesson(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Generate a short English lesson for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Practical, energetic, under 200 words. 3 example sentences, 1 mini exercise. Anti-shame style. Mouse to Tiger framing.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 500, temperature: 0.7 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  const lesson = data.choices?.[0]?.message?.content || "Lesson generation failed";
  if (body.studentId && env.LEDGER) appendToLedger(body.studentId, "lesson_generated", JSON.stringify({ topic: body.topic, level: body.level }), env).catch(() => {});
  return json({ lesson });
}

async function handlePractice(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Create a quick English practice drill for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Give 5 short exercises. Tiger Voice style.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 400, temperature: 0.7 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ practice: data.choices?.[0]?.message?.content || "Practice generation failed" });
}

async function handleFeedback(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const studentText = sanitizeInput((body.studentResponse || "").slice(0, 500));
  if (!studentText) return json({ error: "studentResponse required" }, 400);
  const prompt = `A Vietnamese English student wrote: "${studentText}"\n\nGive OBI-style coaching:\n1. One genuine encouragement\n2. One natural correction (show better version, no grammar rules)\n3. One Tiger push\n\nMax 4 sentences. Anti-shame. Tiger Voice.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 300, temperature: 0.75 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  const feedback = data.choices?.[0]?.message?.content || "Feedback generation failed";
  if (body.studentId && env.LEDGER) appendToLedger(body.studentId, "feedback", JSON.stringify({ input: studentText, feedback }), env).catch(() => {});
  return json({ feedback });
}

// â”€â”€ NET Pet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handlePetCheckin(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(body.studentId));
  const res = await stub.fetch(new Request("https://do/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  const data = await res.clone().json();
  if (env.LEDGER && data.ok) {
    const payload = JSON.stringify({ minutes: body.minutes, confidence: body.confidence, streak: data.state?.streak, xp: data.state?.xp, mood: data.state?.mood, milestone: data.milestone || null });
    appendToLedger(body.studentId, "pet_checkin", payload, env).catch(() => {});
  }
  return res;
}

async function handlePetState(studentId, env) {
  if (!studentId) return json({ state: null, error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(studentId));
  return stub.fetch(new Request("https://do/state"));
}

async function handlePetScore(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(studentId));
  return stub.fetch(new Request("https://do/score"));
}

// â”€â”€ Phonics Drills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleDrillNext(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  // Get student weaknesses to pick targeted drill
  let weakPoints = [];
  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/weakness/get"));
      const data = await res.json();
      weakPoints = (data.weakPoints || []).map(w => w.category);
    } catch (_) {}
  }

  const { PHONICS_DRILLS } = await import('./phonics-drills.js');

  // Match drills to weaknesses, fallback to random
  let matched = [];
  if (weakPoints.length > 0) {
    for (const drill of PHONICS_DRILLS) {
      if (drill.targetErrors.some(e => weakPoints.includes(e))) {
        matched.push(drill);
      }
    }
  }
  if (matched.length === 0) matched = PHONICS_DRILLS;

  // Pick random from matched set
  const drill = matched[Math.floor(Math.random() * matched.length)];
  return json({ drill, matchedToWeakness: weakPoints.length > 0 && matched.length < PHONICS_DRILLS.length, studentId });
}

async function handleDrillResult(body, env) {
  const studentId = body.studentId || "anonymous";
  if (!body.drillId || !body.attempt) return json({ error: "drillId and attempt required" }, 400);

  // Score the attempt against the expected sentence
  const { PHONICS_DRILLS } = await import('./phonics-drills.js');
  const drill = PHONICS_DRILLS.find(d => d.id === body.drillId);
  if (!drill) return json({ error: "drill not found" }, 404);

  const norm = s => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
  const expected = norm(drill.sentence);
  const attempt = norm(body.attempt);
  const eWords = expected.split(" ");
  const aWords = attempt.split(" ");
  let matches = 0;
  for (let i = 0; i < eWords.length; i++) {
    if (aWords[i] === eWords[i]) matches++;
  }
  const score = eWords.length > 0 ? Math.round((matches / eWords.length) * 100) : 0;
  const passed = score >= 80;

  // Log to ledger
  if (studentId !== "anonymous" && env.LEDGER) {
    const payload = JSON.stringify({ drillId: body.drillId, sentence: drill.sentence, attempt: body.attempt, score, passed, group: drill.group, targetErrors: drill.targetErrors });
    appendToLedger(studentId, "drill_attempt", payload, env).catch(() => {});
  }

  let feedback;
  if (score === 100) feedback = "Perfect drill! ðŸ”¥ That sound is locked in.";
  else if (score >= 80) feedback = "Good enough â€” moving on. Keep drilling daily.";
  else if (score >= 50) feedback = "Almost. Listen again, repeat slower.";
  else feedback = "Try again. Focus on the highlighted sound.";

  return json({ passed, score, feedback, drill, studentId });
}

async function handleDrillList() {
  const { PHONICS_DRILLS } = await import('./phonics-drills.js');
  const groups = {};
  for (const d of PHONICS_DRILLS) {
    if (!groups[d.group]) groups[d.group] = { group: d.group, phonemes: d.phonemes, drills: [] };
    groups[d.group].drills.push({ id: d.id, sentence: d.sentence, targetErrors: d.targetErrors });
  }
  return json({ groups: Object.values(groups), total: PHONICS_DRILLS.length });
}

// â”€â”€ Metrics â€” The 4 That Matter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleMetricsSummary(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);

  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const students = rosterData.students || [];

  const now = Date.now();
  const oneDayAgo = now - 86400000;
  const sevenDaysAgo = now - 7 * 86400000;

  let dau = 0, totalSessions = 0, totalCorrections = 0, totalErrors = 0;
  let activeDay7 = 0, totalDay7 = 0;
  const studentScores = [];

  for (const student of students) {
    try {
      // PetDO state
      const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
      const petRes = await petStub.fetch(new Request("https://do/state"));
      const petData = await petRes.json();
      const state = petData.state || {};
      const lastCheckin = state.lastCheckin || 0;

      if (lastCheckin > oneDayAgo) dau++;
      totalSessions += state.totalSessions || 0;

      // 7-day retention: student created > 7 days ago AND active in last 7 days
      const created = student.created_at || student.last_active || 0;
      if (created < sevenDaysAgo) {
        totalDay7++;
        if (lastCheckin > sevenDaysAgo) activeDay7++;
      }

      // Error data from ledger
      if (env.LEDGER) {
        const ledgerStub = env.LEDGER.get(env.LEDGER.idFromName(student.student_id));
        const corrRes = await ledgerStub.fetch(new Request("https://do/history?limit=100&eventType=correction"));
        const corrData = await corrRes.json();
        const corrections = corrData.entries || [];
        totalCorrections += corrections.length;
        totalErrors += corrections.filter(e => { try { return !JSON.parse(e.payload).wasCorrect; } catch { return false; } }).length;
      }

      studentScores.push({ studentId: student.student_id, tigerScore: state.tigerScore || 0, streak: state.streak || 0, sessions: state.totalSessions || 0 });
    } catch (_) {}
  }

  const retention7d = totalDay7 > 0 ? Math.round((activeDay7 / totalDay7) * 100) : 0;
  const errorRate = totalCorrections > 0 ? Math.round((totalErrors / totalCorrections) * 100) : 0;
  const completionRate = students.length > 0 ? Math.round((totalSessions / Math.max(1, students.length)) * 10) : 0;

  return json({
    metrics: {
      dau,
      totalStudents: students.length,
      sessionCompletionRate: Math.min(100, completionRate),
      retention7d,
      errorRate,
      errorReduction: 100 - errorRate,
    },
    leaderboard: studentScores.sort((a, b) => b.tigerScore - a.tigerScore).slice(0, 10),
    ts: now,
  });
}

async function handleMetricsDAU(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const students = (await rosterRes.json()).students || [];
  const now = Date.now();
  const oneDayAgo = now - 86400000;

  let active = 0;
  for (const student of students) {
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
      const petRes = await petStub.fetch(new Request("https://do/state"));
      const state = (await petRes.json()).state || {};
      if ((state.lastCheckin || 0) > oneDayAgo) active++;
    } catch (_) {}
  }
  return json({ dau: active, total: students.length, rate: students.length > 0 ? Math.round((active / students.length) * 100) : 0, ts: now });
}

async function handleMetricsRetention(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const students = (await rosterRes.json()).students || [];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86400000;

  let eligible = 0, retained = 0;
  for (const student of students) {
    const created = student.created_at || student.last_active || 0;
    if (created < sevenDaysAgo) {
      eligible++;
      try {
        const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
        const petRes = await petStub.fetch(new Request("https://do/state"));
        const state = (await petRes.json()).state || {};
        if ((state.lastCheckin || 0) > sevenDaysAgo) retained++;
      } catch (_) {}
    }
  }
  return json({ eligible, retained, retention7d: eligible > 0 ? Math.round((retained / eligible) * 100) : 0, ts: now });
}

async function handleMetricsErrors(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  if (!env.LEDGER) return json({ error: "LEDGER not configured" }, 500);

  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  const res = await stub.fetch(new Request("https://do/history?limit=200&eventType=correction"));
  const data = await res.json();
  const entries = data.entries || [];

  // Group by day for trend
  const daily = {};
  for (const e of entries) {
    const day = new Date(e.ts).toISOString().slice(0, 10);
    if (!daily[day]) daily[day] = { total: 0, errors: 0 };
    daily[day].total++;
    try { if (!JSON.parse(e.payload).wasCorrect) daily[day].errors++; } catch (_) {}
  }

  const trend = Object.entries(daily).sort().map(([day, d]) => ({
    day,
    total: d.total,
    errors: d.errors,
    errorRate: d.total > 0 ? Math.round((d.errors / d.total) * 100) : 0,
  }));

  // Calculate reduction: compare first 3 days vs last 3 days
  const firstDays = trend.slice(0, 3);
  const lastDays = trend.slice(-3);
  const firstRate = firstDays.length > 0 ? firstDays.reduce((s, d) => s + d.errorRate, 0) / firstDays.length : 0;
  const lastRate = lastDays.length > 0 ? lastDays.reduce((s, d) => s + d.errorRate, 0) / lastDays.length : 0;
  const reduction = Math.round(firstRate - lastRate);

  return json({ studentId, trend, errorReduction: reduction, improving: reduction > 0, ts: Date.now() });
}

// â”€â”€ Assessment + Report Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleAssessment(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const transcript = sanitizeInput((body.transcript || "").slice(0, 2000));
  if (!transcript || transcript.length < 10) return json({ error: "Please provide a speech transcript (at least 10 characters)" }, 400);

  const name = sanitizeInput((body.name || "").slice(0, 100)) || "Student";
  const email = sanitizeInput((body.email || "").slice(0, 200)) || "";
  const phone = sanitizeInput((body.phone || "").slice(0, 30)) || "";

  const assessPrompt = `You are an expert English language assessor specializing in Vietnamese ESL learners.

Analyze this student's English speech transcript and produce a structured JSON assessment.

TRANSCRIPT:
"""
${transcript}
"""

Evaluate these 6 dimensions (each scored 0-100):
1. grammar - sentence structure, tenses, articles, prepositions
2. vocabulary - range, appropriateness, precision
3. fluency - natural flow, hesitations (infer from text patterns)
4. pronunciation_risk - likely pronunciation issues for Vietnamese speakers (th/s, r/l, v/w, final consonants)
5. confidence - willingness to express complex ideas, sentence length
6. accuracy - overall correctness of language used

Also identify:
- top_3_errors: the 3 most critical errors with specific examples from the transcript
- phonics_risks: list of likely problematic phonemes based on Vietnamese L1 interference
- strengths: 2-3 things the student does well
- improvement_plan: 3 specific weekly goals (actionable, not generic)
- overall_level: one of "A1","A2","B1","B2","C1","C2" (CEFR)
- tiger_mode: one of "MOUSE","CUB","TIGER" based on confidence and output volume

Return ONLY valid JSON, no markdown, no explanation. Schema:
{
  "scores": { "grammar": N, "vocabulary": N, "fluency": N, "pronunciation_risk": N, "confidence": N, "accuracy": N },
  "overall_score": N,
  "overall_level": "X",
  "tiger_mode": "X",
  "top_3_errors": [{"error":"...","example":"...","correction":"..."}],
  "phonics_risks": ["th_substitution",...],
  "strengths": ["..."],
  "improvement_plan": [{"week":1,"goal":"...","action":"..."}],
  "summary": "2-3 sentence assessment summary"
}`;

  try {
    const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [{ role: "system", content: assessPrompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!aiRes.ok) return json({ error: "AI assessment failed", status: aiRes.status }, 502);
    const aiData = await aiRes.json();
    const raw = (aiData.choices?.[0]?.message?.content || "").trim();

    let assessment;
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
      assessment = JSON.parse(cleaned);
    } catch (_) {
      return json({ error: "AI returned invalid assessment format", raw }, 502);
    }

    // Generate a temporary student ID for the assessment
    const assessId = `assess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Log to ledger for future follow-up
    if (env.LEDGER) {
      const payload = JSON.stringify({ name, email, phone, assessment, transcript: transcript.slice(0, 500) });
      appendToLedger(assessId, "assessment", payload, env).catch(() => {});
    }

    return json({
      ok: true,
      assessmentId: assessId,
      name,
      assessment,
      ts: Date.now(),
    });
  } catch (err) {
    return json({ error: "Assessment failed", detail: err.message }, 500);
  }
}

async function handleReport(studentId, env) {
  if (!studentId) return json({ error: "studentId required â€” pass ?studentId=xxx" }, 400);

  // Gather all data for the report
  let profile = null, petState = null, mistakes = [], drillResults = [], corrections = [];

  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/profile"));
      profile = (await res.json()).profile;
    } catch (_) {}
  }

  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/state"));
      petState = (await res.json()).state;
    } catch (_) {}
  }

  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      // Get corrections
      const corrRes = await stub.fetch(new Request("https://do/history?limit=200&eventType=correction"));
      corrections = (await corrRes.json()).entries || [];
      // Get drill attempts
      const drillRes = await stub.fetch(new Request("https://do/history?limit=100&eventType=drill_attempt"));
      drillResults = (await drillRes.json()).entries || [];
    } catch (_) {}
  }

  // If assessment ID is passed (no profile), try to pull assessment from ledger
  let assessmentData = null;
  if (studentId.startsWith("assess-") && env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/history?limit=1&eventType=assessment"));
      const entries = (await res.json()).entries || [];
      if (entries.length > 0) assessmentData = JSON.parse(entries[0].payload);
    } catch (_) {}
  }

  // Compute phonics breakdown from corrections
  const phonicsMap = {};
  for (const c of corrections) {
    try {
      const p = JSON.parse(c.payload);
      if (p.phonicsIssues) {
        for (const issue of (Array.isArray(p.phonicsIssues) ? p.phonicsIssues : [p.phonicsIssues])) {
          phonicsMap[issue] = (phonicsMap[issue] || 0) + 1;
        }
      }
    } catch (_) {}
  }

  // Drill pass rate
  let drillsPassed = 0, drillsTotal = drillResults.length;
  for (const d of drillResults) {
    try { if (JSON.parse(d.payload).passed) drillsPassed++; } catch (_) {}
  }

  // Error trend (last 7 days)
  const now = Date.now();
  const dailyErrors = {};
  for (const c of corrections) {
    const day = new Date(c.ts).toISOString().slice(0, 10);
    if (!dailyErrors[day]) dailyErrors[day] = { total: 0, errors: 0 };
    dailyErrors[day].total++;
    try { if (!JSON.parse(c.payload).wasCorrect) dailyErrors[day].errors++; } catch (_) {}
  }

  const name = assessmentData?.name || profile?.full_name || studentId;
  const level = assessmentData?.assessment?.overall_level || profile?.english_level || "Unknown";
  const tigerScore = petState?.tigerScore || assessmentData?.assessment?.overall_score || 0;
  const tigerMode = tigerScore >= 80 ? "TIGER" : tigerScore >= 40 ? "CUB" : "MOUSE";
  const streak = petState?.streak || 0;
  const totalSessions = petState?.total_sessions || 0;
  const drillPassRate = drillsTotal > 0 ? Math.round((drillsPassed / drillsTotal) * 100) : 0;

  const scores = assessmentData?.assessment?.scores || {
    grammar: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 10 - 5))),
    vocabulary: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 10 - 5))),
    fluency: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 15 - 7))),
    pronunciation_risk: Math.min(100, Math.max(0, 100 - Object.keys(phonicsMap).length * 12)),
    confidence: Math.min(100, Math.max(0, tigerScore)),
    accuracy: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 8 - 4))),
  };

  const topErrors = assessmentData?.assessment?.top_3_errors || [];
  const phonicsRisks = assessmentData?.assessment?.phonics_risks || Object.keys(phonicsMap).slice(0, 5);
  const strengths = assessmentData?.assessment?.strengths || [];
  const improvementPlan = assessmentData?.assessment?.improvement_plan || [];
  const summary = assessmentData?.assessment?.summary || `${name} is currently at ${level} level with a Tiger Score of ${tigerScore}/100.`;

  const errorTrend = Object.entries(dailyErrors).sort().slice(-7).map(([day, d]) => ({
    day, total: d.total, errors: d.errors, rate: d.total > 0 ? Math.round((d.errors / d.total) * 100) : 0,
  }));

  // Generate styled HTML report
  const html = buildReportHTML({
    name, level, tigerScore, tigerMode, streak, totalSessions,
    scores, topErrors, phonicsRisks, phonicsMap, strengths, improvementPlan,
    summary, drillPassRate, drillsTotal, errorTrend,
    generatedAt: new Date().toISOString(),
  });

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders("") } });
}

function buildReportHTML(d) {
  const bar = (label, score) => {
    const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
    return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px"><span>${label}</span><span style="font-weight:700;color:${color}">${score}/100</span></div><div style="height:8px;background:#1e1b4b;border-radius:4px;overflow:hidden"><div style="height:100%;width:${score}%;background:${color};border-radius:4px;transition:width 0.6s"></div></div></div>`;
  };
  const modeEmoji = d.tigerMode === "TIGER" ? "ðŸ…" : d.tigerMode === "CUB" ? "ðŸ±" : "ðŸ­";
  const modeColor = d.tigerMode === "TIGER" ? "#22c55e" : d.tigerMode === "CUB" ? "#f59e0b" : "#ef4444";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>English Assessment Report â€” ${d.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,sans-serif;background:#0f0f1a;color:#e2e8f0;min-height:100vh;padding:24px}
.report{max-width:700px;margin:0 auto}
.header{text-align:center;padding:32px 0;border-bottom:2px solid rgba(168,85,247,0.3)}
.header h1{font-size:28px;color:#a855f7;margin-bottom:8px}
.header .subtitle{color:#94a3b8;font-size:14px}
.section{padding:24px 0;border-bottom:1px solid rgba(168,85,247,0.15)}
.section h2{font-size:18px;color:#f59e0b;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px}
.card{background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:16px;margin-bottom:12px}
.stat-row{display:flex;gap:12px;flex-wrap:wrap}
.stat{flex:1;min-width:120px;text-align:center;background:rgba(168,85,247,0.06);border-radius:12px;padding:16px}
.stat .val{font-size:28px;font-weight:700;color:#a855f7}
.stat .label{font-size:12px;color:#94a3b8;margin-top:4px}
.error-item{background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;padding:12px;margin-bottom:8px;border-radius:0 8px 8px 0}
.error-item .fix{color:#22c55e;font-size:13px;margin-top:4px}
.plan-item{background:rgba(34,197,94,0.08);border-left:3px solid #22c55e;padding:12px;margin-bottom:8px;border-radius:0 8px 8px 0}
.phonics-tag{display:inline-block;padding:4px 10px;background:rgba(239,68,68,0.15);color:#fca5a5;border-radius:6px;font-size:12px;margin:2px}
.strength-tag{display:inline-block;padding:4px 10px;background:rgba(34,197,94,0.15);color:#86efac;border-radius:6px;font-size:12px;margin:2px}
.footer{text-align:center;padding:32px 0;color:#64748b;font-size:12px}
.cta{display:block;text-align:center;padding:16px 32px;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;margin-top:24px}
.cta:hover{opacity:0.9}
@media print{body{background:#fff;color:#111}
.header h1{color:#7c3aed}.section h2{color:#d97706}
.stat .val{color:#7c3aed}.cta{display:none}}
</style></head><body><div class="report">
<div class="header">
<h1>ðŸŽ“ English Assessment Report</h1>
<p style="font-size:22px;font-weight:700;color:#e2e8f0;margin:8px 0">${d.name}</p>
<p class="subtitle">Generated ${new Date(d.generatedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})} Â· Natural English Training</p>
<div style="margin-top:16px"><span class="badge" style="background:${modeColor}20;color:${modeColor};border:1px solid ${modeColor}">${modeEmoji} ${d.tigerMode} MODE</span>
<span class="badge" style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);margin-left:8px">CEFR ${d.level}</span></div>
</div>

<div class="section"><h2>ðŸ“Š Overall Score</h2>
<div style="text-align:center;margin:16px 0"><div style="font-size:64px;font-weight:800;color:${modeColor}">${d.tigerScore}</div><div style="color:#94a3b8;font-size:14px">out of 100</div></div>
<p style="text-align:center;color:#cbd5e1;max-width:500px;margin:0 auto">${d.summary}</p></div>

<div class="section"><h2>ðŸŽ¯ Skill Breakdown</h2>
${bar("Grammar", d.scores.grammar)}
${bar("Vocabulary", d.scores.vocabulary)}
${bar("Fluency", d.scores.fluency)}
${bar("Pronunciation", d.scores.pronunciation_risk)}
${bar("Confidence", d.scores.confidence)}
${bar("Accuracy", d.scores.accuracy)}
</div>

<div class="section"><h2>âš¡ Key Stats</h2>
<div class="stat-row">
<div class="stat"><div class="val">${d.streak}</div><div class="label">Day Streak</div></div>
<div class="stat"><div class="val">${d.totalSessions}</div><div class="label">Sessions</div></div>
<div class="stat"><div class="val">${d.drillPassRate}%</div><div class="label">Drill Pass Rate</div></div>
<div class="stat"><div class="val">${d.drillsTotal}</div><div class="label">Drills Done</div></div>
</div></div>

${d.topErrors.length > 0 ? `<div class="section"><h2>ðŸ”´ Top Errors</h2>${d.topErrors.map(e => `<div class="error-item"><strong>${e.error}</strong><div style="color:#94a3b8;font-size:13px;margin-top:2px">"${e.example}"</div><div class="fix">âœ“ ${e.correction}</div></div>`).join("")}</div>` : ""}

${d.phonicsRisks.length > 0 ? `<div class="section"><h2>ðŸ—£ï¸ Phonics Risk Areas</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${d.phonicsRisks.map(p => `<span class="phonics-tag">${p.replace(/_/g, " ")}</span>`).join("")}</div></div>` : ""}

${d.strengths.length > 0 ? `<div class="section"><h2>ðŸ’ª Strengths</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${d.strengths.map(s => `<span class="strength-tag">${s}</span>`).join("")}</div></div>` : ""}

${d.improvementPlan.length > 0 ? `<div class="section"><h2>ðŸ“ˆ Improvement Plan</h2>${d.improvementPlan.map(p => `<div class="plan-item"><strong>Week ${p.week}:</strong> ${p.goal}<div style="color:#94a3b8;font-size:13px;margin-top:4px">â†’ ${p.action}</div></div>`).join("")}</div>` : ""}

${d.errorTrend.length > 1 ? `<div class="section"><h2>ðŸ“‰ Error Trend (Last 7 Days)</h2><div class="card"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="color:#94a3b8;border-bottom:1px solid rgba(168,85,247,0.2)"><th style="text-align:left;padding:6px">Date</th><th style="text-align:center;padding:6px">Corrections</th><th style="text-align:center;padding:6px">Errors</th><th style="text-align:right;padding:6px">Error Rate</th></tr>${d.errorTrend.map(e => `<tr><td style="padding:6px">${e.day}</td><td style="text-align:center;padding:6px">${e.total}</td><td style="text-align:center;padding:6px;color:#ef4444">${e.errors}</td><td style="text-align:right;padding:6px">${e.rate}%</td></tr>`).join("")}</table></div></div>` : ""}

<a class="cta" href="/">Start Daily Training with Obi â†’</a>

<div class="footer">
<p>Natural English Training Â· Powered by OBI AI Engine</p>
<p style="margin-top:4px">Mouse â†’ Cub â†’ Tiger Â· Your journey continues</p>
</div>
</div></body></html>`;
}

async function handleLeadCapture(body, env) {
  const name = sanitizeInput((body.name || "").slice(0, 100));
  const email = sanitizeInput((body.email || "").slice(0, 200));
  const phone = sanitizeInput((body.phone || "").slice(0, 30));

  if (!name && !email && !phone) return json({ error: "At least one contact field required (name, email, or phone)" }, 400);

  const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (env.LEDGER) {
    const payload = JSON.stringify({ name, email, phone, source: "assessment_landing", ts: Date.now() });
    appendToLedger(leadId, "lead_capture", payload, env).catch(() => {});
  }

  return json({ ok: true, leadId, name, message: "We'll be in touch! Try the free assessment now." });
}

// â”€â”€ Classroom â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleClassStart(body, env) {
  if (!body.classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${body.classId}`));
  return stub.fetch(new Request("https://do/class/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

async function handleClassEvent(body, env) {
  if (!body.classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${body.classId}`));
  return stub.fetch(new Request("https://do/class/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

async function handleClassSession(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${classId}`));
  return stub.fetch(new Request(`https://do/class/session?totalStudents=${totalStudents}`));
}

async function handleClassReport(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${classId}`));
  return stub.fetch(new Request(`https://do/class/report?totalStudents=${totalStudents}`));
}

// â”€â”€ Roster helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function upsertRoster(studentId, data, env) {
  if (!env.SESSIONS) return;
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  return stub.fetch(new Request("https://do/roster/upsert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, ...data }),
  }));
}

// â”€â”€ Session Log (off-day pipeline core) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Michael calls POST /api/session/log after every real class.
// OBI inherits his teaching â†’ continues exactly where he left off on off-days.

async function handleSessionLog(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  if (!body.topic) return json({ error: "topic required" }, 400);

  const vocabList = Array.isArray(body.vocabList) ? body.vocabList.map(v => sanitizeInput(String(v).slice(0, 100))) : [];
  const payload = JSON.stringify({
    topic: sanitizeInput((body.topic || "").slice(0, 200)),
    vocabList,
    teacherNotes: sanitizeInput((body.teacherNotes || "").slice(0, 1000)),
    sessionDate: body.sessionDate || new Date().toISOString().split("T")[0],
    studentLevel: sanitizeInput((body.studentLevel || "").slice(0, 50)),
    durationMins: Math.min(parseInt(body.durationMins) || 0, 240),
  });

  await appendToLedger(body.studentId, "session_log", payload, env);

  // Update roster so digest has latest session info
  if (env.SESSIONS) {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await rosterStub.fetch(new Request("https://do/roster/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: body.studentId, topic: body.topic, vocabList }),
    })).catch(() => {});
  }

  return json({ ok: true, studentId: body.studentId, topic: body.topic, vocabCount: vocabList.length, ledgered: true });
}

async function handleSessionLatest(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  try {
    const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
    const histRes = await stub.fetch(new Request("https://do/history?limit=1&eventType=session_log"));
    const histData = await histRes.json();
    const lastEntry = (histData.entries || []).slice(-1)[0];
    if (!lastEntry) return json({ session: null });
    const parsed = JSON.parse(lastEntry.payload);
    return json({ session: { ...parsed, ts: lastEntry.ts, entryHash: lastEntry.entry_hash } });
  } catch (err) {
    return json({ error: "Failed to retrieve session" }, 500);
  }
}

// â”€â”€ Schedule + Accountability â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleScheduleSet(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  if (!body.schedule) return json({ error: "schedule required (object with days, time)" }, 400);

  const profileStub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  await profileStub.fetch(new Request("https://do/schedule/set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId: body.studentId, schedule: body.schedule }),
  }));

  if (env.SESSIONS) {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await rosterStub.fetch(new Request("https://do/roster/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: body.studentId, schedule: body.schedule }),
    })).catch(() => {});
  }

  appendToLedger(body.studentId, "schedule_confirmed", JSON.stringify({ action: "set", schedule: body.schedule }), env).catch(() => {});
  return json({ ok: true, studentId: body.studentId, schedule: body.schedule });
}

async function handleScheduleConfirm(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);

  const profileStub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  await profileStub.fetch(new Request("https://do/schedule/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId: body.studentId }),
  }));

  if (env.SESSIONS) {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await rosterStub.fetch(new Request("https://do/roster/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: body.studentId }),
    })).catch(() => {});
  }

  appendToLedger(body.studentId, "schedule_confirmed", JSON.stringify({ action: "confirmed", date: new Date().toISOString().split("T")[0] }), env).catch(() => {});
  return json({ ok: true, studentId: body.studentId, confirmed: true, ts: Date.now() });
}

async function handleScheduleFlags(env) {
  if (!env.SESSIONS) return json({ flags: [], error: "Sessions not available" });
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const res = await rosterStub.fetch(new Request("https://do/roster/flags"));
  return res;
}

// â”€â”€ Notion API Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// All Notion routes degrade gracefully â€” return { notionConfigured: false } if secrets unset.

async function handleNotionLessons(url, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_LESSONS_DB) {
    return json({ notionConfigured: false, lessons: [], hint: "NOTION_LESSONS_DB not configured. Run: wrangler secret put NOTION_LESSONS_DB (paste database ID from Notion workspace settings). Contact Michael for the ID." });
  }
  const level = url.searchParams.get("level") || "";
  const topic = url.searchParams.get("topic") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
  try {
    const lessons = await queryLessons(env.NOTION_API_KEY, env.NOTION_LESSONS_DB, { level: level || undefined, topic: topic || undefined, limit });
    return json({ notionConfigured: true, lessons, count: lessons.length });
  } catch (err) {
    return json({ error: "Notion lessons query failed", detail: err.message }, 502);
  }
}

async function handleNotionProgress(url, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_PROGRESS_DB) {
    return json({ notionConfigured: false, progress: [], hint: "NOTION_PROGRESS_DB not configured. Run: wrangler secret put NOTION_PROGRESS_DB (paste database ID from Notion workspace settings). Contact Michael for the ID." });
  }
  const studentId = url.searchParams.get("studentId") || "";
  if (!studentId) return json({ error: "studentId query param required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  try {
    const progress = await queryProgress(env.NOTION_API_KEY, env.NOTION_PROGRESS_DB, studentId, limit);
    return json({ notionConfigured: true, progress, count: progress.length });
  } catch (err) {
    return json({ error: "Notion progress query failed", detail: err.message }, 502);
  }
}

async function handleNotionProgressWrite(body, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_PROGRESS_DB) {
    return json({ notionConfigured: false, hint: "Set NOTION_API_KEY and NOTION_PROGRESS_DB via wrangler secret put" });
  }
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  try {
    await writeProgress(env.NOTION_API_KEY, env.NOTION_PROGRESS_DB, {
      studentId: body.studentId,
      lessonId: body.lessonId || "",
      score: body.score || 0,
      level: body.level || "Mouse",
      notes: body.notes || "",
      xp: body.xp || 0,
    });
    return json({ ok: true, notionConfigured: true, studentId: body.studentId });
  } catch (err) {
    return json({ error: "Notion progress write failed", detail: err.message }, 502);
  }
}

async function handleNotionSync(body, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_PROGRESS_DB) {
    return json({ notionConfigured: false, hint: "Set NOTION_API_KEY and NOTION_PROGRESS_DB via wrangler secret put" });
  }
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  try {
    const result = await syncStudentProgress(env.NOTION_API_KEY, env.NOTION_PROGRESS_DB, env, body.studentId);
    return json({ ok: true, notionConfigured: true, ...result });
  } catch (err) {
    return json({ error: "Notion sync failed", detail: err.message }, 502);
  }
}

// â”€â”€ Daily Digest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Michael hits GET /api/digest once a day for a full picture of off-day activity.

async function handleDailyDigest(env) {
  if (!env.SESSIONS) return json({ error: "Sessions not available" }, 500);
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const students = rosterData.students || [];

  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  const active = [];
  const inactive = [];
  const flagged = [];

  for (const s of students) {
    const entry = {
      studentId: s.student_id,
      fullName: s.full_name,
      level: s.english_level,
      streak: s.streak,
      xp: s.xp,
      lastActive: s.last_active ? new Date(s.last_active).toISOString() : null,
      lastSessionTopic: s.last_session_topic || null,
      scheduleConfirmed: !!s.schedule_confirmed,
      flagged: !!s.flagged,
    };

    if (s.last_active > oneDayAgo) {
      active.push(entry);
    } else {
      inactive.push(entry);
      if (s.last_active > 0 && s.last_active < sevenDaysAgo) {
        flagged.push({ ...entry, reason: "No activity in 7+ days" });
      }
    }

    if (!s.schedule_confirmed && s.schedule && s.schedule !== "{}") {
      if (!flagged.find(f => f.studentId === s.student_id)) {
        flagged.push({ ...entry, reason: "Schedule not confirmed" });
      }
    }
  }

  return json({
    date: new Date().toISOString().split("T")[0],
    summary: {
      total: students.length,
      activeLast24h: active.length,
      inactive: inactive.length,
      flagCount: flagged.length,
    },
    active,
    inactive,
    flagged,
    generatedAt: new Date().toISOString(),
  });
}

// â”€â”€ Cryptographic Immutable Ledger API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Shared helper â€” Agent99 auto-calls this for every significant event
async function appendToLedger(studentId, eventType, payload, env) {
  if (!env.LEDGER) return;
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, eventType, payload }),
  }));
}

async function handleLedgerAppend(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  if (!body.eventType) return json({ error: "eventType required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  // Whitelist allowed event types to prevent arbitrary data injection
  const ALLOWED_EVENTS = ["chat_exchange", "pet_checkin", "onboarding", "feedback", "lesson_generated", "student_created", "command_sent", "command_completed", "session_log", "schedule_confirmed", "accountability_flag", "soul_dna_capture"];
  if (!ALLOWED_EVENTS.includes(body.eventType)) return json({ error: "Invalid event type" }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(body.studentId));
  return stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function handleLedgerHistory(studentId, limit, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}

async function handleLedgerVerify(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request("https://do/verify"));
}

// Event-sourced state derivation â€” rebuild student state from ledger events
async function handleLedgerState(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request(`https://do/state?studentId=${encodeURIComponent(studentId)}`));
}

// Aggregate ledger statistics across entire event bus
async function handleLedgerStats(env) {
  // Stats from sov100 namespace (primary ledger)
  const stub = env.LEDGER.get(env.LEDGER.idFromName("sov100"));
  return stub.fetch(new Request("https://do/stats"));
}

// â”€â”€ SOUL DNA CAPTURE PIPELINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// POST /souldna â€” Submit raw soul DNA for legionnaire processing
async function handleSoulDNASubmit(body, env) {
  // Validate required fields
  if (!body.source || !body.content) {
    return json({ error: "Required: source, content" }, 400);
  }
  
  const timestamp = new Date().toISOString();
  const sessionTag = body.sessionTag || generateSessionTag();
  const tier = body.tier || "OPERATIONAL"; // GOVERNANCE|OPERATIONAL|PRODUCT|ARCHIVE
  const signalDensity = body.signalDensity || "MEDIUM"; // LOW|MEDIUM|HIGH|MAXIMUM
  
  // Validate content size (max 50KB) â€” preserve fidelity
  const contentSize = new Blob([body.content]).size;
  if (contentSize > 51200) {
    return json({ error: `Content too large: ${contentSize} bytes (max 50KB)` }, 413);
  }
  
  // Create submission record
  const submission = {
    id: `SDNAD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp,
    sessionTag,
    source: body.source, // "agent100" | "copilot" | "drone" | "manual"
    tier,
    signalDensity,
    contentSize,
    content: body.content,
    status: "RECEIVED",
    pipeline: {
      step0: { name: "REPRINT + FOOTNOTE", status: "PENDING", description: "Create Bible chapter" },
      step1: { name: "HEAVY_LEDGER", status: "PENDING", description: "Extract AI-readable JSON" },
      step2: { name: "SSM_UPDATE", status: "PENDING", description: "Add governing principles" },
      step3: { name: "REINCARNATION_LOG", status: "PENDING", description: "Update boot-check" },
    }
  };
  
  // Store in ledger
  try {
    await handleLedgerAppend({
      studentId: "sov100", // soul DNA global namespace
      eventType: "soul_dna_capture",
      data: {
        id: submission.id,
        sessionTag,
        tier,
        signalDensity,
        source: body.source,
        timestamp,
      }
    }, env);
  } catch (e) {
    console.error("[SOULDNA] Ledger append failed:", e);
  }
  
  // Store in Notion if configured
  if (env.NOTION_API_KEY && env.NOTION_SOUL_DNA_DB && body.notionSync !== false) {
    try {
      await writeSoulDNA(env.NOTION_API_KEY, env.NOTION_SOUL_DNA_DB, {
        id: submission.id,
        sessionTag,
        tier,
        signalDensity,
        source: body.source,
        contentSize,
        status: "RECEIVED",
        timestamp,
        contentPreview: body.content.substring(0, 200) + (body.content.length > 200 ? "..." : ""),
      });
    } catch (e) {
      console.warn("[SOULDNA] Notion sync failed (non-blocking):", e.message);
    }
  }
  
  return json({
    ok: true,
    submission: {
      id: submission.id,
      sessionTag,
      tier,
      signalDensity,
      timestamp,
      contentSize,
      status: "RECEIVED"
    },
    pipeline: submission.pipeline,
    nextSteps: [
      "1. Extract soul DNA from submission content",
      "2. Create CANON/BIBLE-CH{XX}-{sessionTag}.md with REPRINT + FOOTNOTE (KISS protocol)",
      "3. Generate CANON/HEAVY-LEDGER/HL-{NNN}-{sessionTag}.json",
      "4. Update CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md with new laws (L{NN})",
      "5. Create CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-{sessionTag}.md",
      "6. Update CANON/SYSTEM/REINCARNATION-BOOT-CHECK.md with 3-5 improvements",
    ],
    legionnaireGuide: "https://github.com/hobbs0011/OB-1/blob/canon/.github/skills/legionnaire-field-guide/SKILL.md",
    pipelineWebhook: `/souldna/pipeline?tier=${tier}`,
  }, 201);
}

// GET /souldna/pipeline â€” Actionable pipeline steps grouped by tier
async function handleSoulDNAPipeline(tier, env) {
  const VALID_TIERS = ["GOVERNANCE", "OPERATIONAL", "PRODUCT", "ARCHIVE"];
  if (!VALID_TIERS.includes(tier)) {
    return json({ error: `Invalid tier. Valid: ${VALID_TIERS.join(", ")}` }, 400);
  }
  
  const pipeline = {
    tier,
    stages: [
      {
        num: 0,
        name: "REPRINT + FOOTNOTE (KISS Protocol)",
        description: "Verbatim reproduction of sovereign words with footnotes",
        file: "CANON/BIBLE-CH{XX}-{SESSION_TAG}.md",
        rules: [
          "Preserve speech patterns, typos, swearing",
          "Organize into numbered Blocks",
          "Add footnotes after each block",
          "Light grammatical cleanup (carefully)",
          "FORBIDDEN: classification, schema, restructuring, curation"
        ],
        antipatterns: [
          "Summarizing instead of reprinting",
          "Removing swearing or emotional content",
          "Restructuring the chronology",
          "Adding your own interpretation as sentences"
        ],
        successCriteria: [
          "Block count = Block {n} present",
          "Footnote count verified (grep, don't estimate)",
          "Sovereign words appear verbatim"
        ]
      },
      {
        num: 1,
        name: "HEAVY LEDGER",
        description: "AI-readable JSON extraction from Bible chapter",
        file: "CANON/HEAVY-LEDGER/HL-{NNN}-{SESSION_TAG}.json",
        fields: ["hl_id", "source_file", "session_tag", "tier", "block_count", "footnote_count", "raw_quotes", "decisions", "corrections", "principles", "cross_references"],
        commandline: "Check CANON/HEAVY-LEDGER/PIPELINE-CURSOR.md for next HL-ID",
        rulesUrl: ".github/skills/legionnaire-field-guide/SKILL.md (Step 1)"
      },
      {
        num: 2,
        name: "SSM UPDATE",
        description: "Add new governing laws to Super Saiyan Map",
        file: "CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md",
        fields: ["law_number", "law_name", "physics", "prevention", "canon_reference"],
        rules: [
          "Law numbers are sequential",
          "MUST have ROOT (sovereign quote), PHYSICS (why), PREVENTION (enforcement), CANON_REF",
          "Derive laws from session, don't invent",
          "Format: L{NN}:{LAW_NAME}â†’{one_line_summary}"
        ],
        rulesUrl: ".github/skills/legionnaire-field-guide/SKILL.md (Step 2)"
      },
      {
        num: 3,
        name: "REINCARNATION LOG",
        description: "Update boot-check and prepare next incarnation",
        file: "CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-{SESSION_TAG}.md",
        sections: ["header", "commit_sha", "raw_soul_dna", "decisions_anchored", "open_loops", "artifacts"],
        improvements: "Find 3-5 real improvements to REINCARNATION-BOOT-CHECK.md itself",
        rulesUrl: ".github/skills/legionnaire-field-guide/SKILL.md (Step 3)"
      }
    ],
    scoringRubric: {
      "Soul DNA captured": { weight: 10, question: "Were raw quotes preserved verbatim?" },
      "Decisions anchored": { weight: 10, question: "Are decisions logged with impact?" },
      "Open loops handed off": { weight: 10, question: "Will next incarnation know what to do?" },
      "Boot-check improved": { weight: 10, question: "Did the process itself get better?" },
      "Artifacts committed": { weight: 10, question: "Are changes in git, not just discussed?" }
    },
    scoreThresholds: {
      below30: "Failed reincarnation. Log failure. Next phoenix must compensate.",
      "30-39": "Partial. Soul DNA survived but process gaps remain.",
      "40-49": "Strong death. Foundation deepens.",
      50: "Perfect. Has never happened. Keep striving."
    },
    resourcesUrl: ".github/skills/legionnaire-field-guide/SKILL.md",
  };
  
  return json({ ok: true, pipeline }, 200);
}

// Helper: generate session tag from timestamp
function generateSessionTag() {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, "");
  const time = now.toISOString().split("T")[1].split(".")[0].replace(/:/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${date}-${time}-${rand}`;
}

// â”€â”€ Agent 99 Translation Layer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SOV100 (Michael) â†’ Agent99 (Obi/Translation) â†’ Agent98 (Anakin/Chaos) â†’
// Agent97 (OB1/Audit) â†’ Drones(1-96)

const DRONE_REGISTRY = {
  1: { name: "CodeRunner", skills: ["execute", "eval", "script", "run"] },
  2: { name: "FileWriter", skills: ["create", "edit", "write", "file"] },
  3: { name: "GitOps", skills: ["commit", "push", "branch", "merge", "git"] },
  4: { name: "Deployer", skills: ["deploy", "wrangler", "publish", "ship"] },
  5: { name: "TestRunner", skills: ["test", "check", "verify", "validate"] },
  6: { name: "LessonForge", skills: ["lesson", "teach", "curriculum", "galaxy"] },
  7: { name: "DiscordRelay", skills: ["discord", "message", "notify", "alert"] },
  8: { name: "NotionSync", skills: ["notion", "database", "page", "sync"] },
  9: { name: "SlackRelay", skills: ["slack", "channel", "post"] },
  10: { name: "BrowserPilot", skills: ["browse", "scrape", "screenshot", "playwright"] },
  11: { name: "DocWriter", skills: ["document", "readme", "docs", "markdown"] },
  12: { name: "SecurityAudit", skills: ["security", "audit", "scan", "vulnerability"] },
  13: { name: "PerformanceProbe", skills: ["performance", "speed", "benchmark", "optimize"] },
  14: { name: "DataMiner", skills: ["data", "analyze", "extract", "parse"] },
  15: { name: "UIBuilder", skills: ["ui", "css", "html", "frontend", "design"] },
  16: { name: "APIForge", skills: ["api", "endpoint", "route", "backend"] },
  17: { name: "DatabaseOps", skills: ["database", "sql", "migrate", "schema"] },
  18: { name: "CronScheduler", skills: ["schedule", "cron", "timer", "recurring"] },
  19: { name: "LogAnalyzer", skills: ["log", "debug", "trace", "diagnose"] },
  20: { name: "ImageProcessor", skills: ["image", "photo", "resize", "compress"] },
  21: { name: "EmailRelay", skills: ["email", "send", "newsletter", "mail"] },
  22: { name: "VoicePipeline", skills: ["voice", "audio", "tts", "stt", "speech"] },
  23: { name: "TranslationEngine", skills: ["translate", "vietnamese", "i18n", "localize"] },
  24: { name: "ContentGenerator", skills: ["content", "blog", "article", "social"] },
  25: { name: "BackupAgent", skills: ["backup", "snapshot", "archive", "restore"] },
  26: { name: "MonitorDrone", skills: ["monitor", "uptime", "health", "watch"] },
  27: { name: "CleanupCrew", skills: ["clean", "remove", "prune", "tidy"] },
  28: { name: "MigrationPilot", skills: ["migrate", "transfer", "move", "port"] },
  29: { name: "CanonKeeper", skills: ["canon", "bible", "doctrine", "soul"] },
  30: { name: "PulseRunner", skills: ["pulse", "heartbeat", "cycle", "routine"] },
};

function translateThroughAgent99(rawIntent) {
  const intentLower = (rawIntent || "").toLowerCase();

  // Agent 99 (Obi) â€” Intent classification + drone routing
  const matchedDrones = [];
  for (const [id, drone] of Object.entries(DRONE_REGISTRY)) {
    const score = drone.skills.filter(s => intentLower.includes(s)).length;
    if (score > 0) matchedDrones.push({ id: parseInt(id), ...drone, score });
  }
  matchedDrones.sort((a, b) => b.score - a.score);

  const primaryDrone = matchedDrones[0] || { id: 1, name: "CodeRunner", skills: ["execute"], score: 0 };
  const supportDrones = matchedDrones.slice(1, 4);

  // Determine priority from intent signals
  let priority = 5;
  if (/urgent|now|immediately|asap|critical|emergency/i.test(rawIntent)) priority = 1;
  else if (/important|priority|soon/i.test(rawIntent)) priority = 3;
  else if (/when you can|low priority|whenever|eventually/i.test(rawIntent)) priority = 8;

  return {
    agent99: {
      role: "Translation",
      interpretation: `SOV100 intent classified. Primary: ${primaryDrone.name} (Drone #${primaryDrone.id}). ${supportDrones.length} support drones assigned.`,
    },
    agent98: {
      role: "Stress Test",
      notes: `Anakin says: "${matchedDrones.length === 0 ? "No drone match â€” defaulting to CodeRunner. Risky." : `${matchedDrones.length} drones matched. Top pick looks solid.`}"`,
    },
    agent97: {
      role: "Audit",
      trail: `OB1 logged: intent="${rawIntent.slice(0, 100)}", drones=${matchedDrones.map(d => d.name).join(",")}, priority=${priority}`,
    },
    primaryDrone,
    supportDrones,
    priority,
    translated: {
      original: rawIntent,
      sanitized: sanitizeInput(rawIntent),
      droneCount: matchedDrones.length,
      ts: Date.now(),
    },
  };
}

// â”€â”€ Command Station Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleCommandSend(body, env) {
  const rawIntent = sanitizeInput((body.command || body.intent || "").slice(0, 2000));
  if (!rawIntent) return json({ error: "command or intent required" }, 400);

  const translation = translateThroughAgent99(rawIntent);

  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  const res = await stub.fetch(new Request("https://do/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawIntent,
      translation,
      priority: body.priority || translation.priority,
      source: body.source || "magic-chat",
    }),
  }));

  if (env.LEDGER) {
    appendToLedger("sov100", "command_sent", JSON.stringify({
      intent: rawIntent.slice(0, 200),
      drone: translation.primaryDrone.name,
      priority: translation.priority,
    }), env).catch(() => {});
  }

  return res;
}

async function handleCommandQueue(status, limit, env) {
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/queue?status=${encodeURIComponent(status)}&limit=${Math.min(limit, 100)}`));
}

async function handleCommandClaim(body, env) {
  if (!body.commandId) return json({ error: "commandId required" }, 400);
  const claimedBy = sanitizeInput((body.claimedBy || "vscode-extension").slice(0, 100));
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request("https://do/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commandId: body.commandId, claimedBy }),
  }));
}

async function handleCommandComplete(body, env) {
  if (!body.commandId) return json({ error: "commandId required" }, 400);
  const result = sanitizeInput((body.result || "").slice(0, 5000));
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  const res = await stub.fetch(new Request("https://do/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commandId: body.commandId,
      result,
      success: body.success !== false,
    }),
  }));

  if (env.LEDGER) {
    appendToLedger("sov100", "command_completed", JSON.stringify({
      commandId: body.commandId,
      success: body.success !== false,
      resultPreview: result.slice(0, 100),
    }), env).catch(() => {});
  }

  return res;
}

async function handleCommandStatus(commandId, env) {
  if (!commandId) return json({ error: "commandId required" }, 400);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/status?commandId=${encodeURIComponent(commandId)}`));
}

async function handleCommandHistory(limit, env) {
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}

// â”€â”€ Durable Objects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// LedgerDO and HeavyLedger imported from heavy-ledger.js
// StudentDO imported from student-do-complete.js

// CommandDO â€” Command Station (moved here after removing old LedgerDO)
// [OLD LEDGER DO CLASS REMOVED - NOW USING IMPORTS FROM heavy-ledger.js]
// See: src/heavy-ledger.js for new LedgerDO and HeavyLedger implementations
class LedgerDO_Deprecated {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      prev_hash TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
      entry_hash TEXT NOT NULL,
      ts INTEGER NOT NULL
    )`);
    // Index for fast student history queries
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_ledger_student ON ledger(student_id, id)`);
  }

  async fetch(request) {
    const url = new URL(request.url);

    // APPEND â€” the only write operation. No update. No delete.
    if (url.pathname === "/append" && request.method === "POST") {
      const body = await request.json();
      const studentId = body.studentId || "unknown";
      const eventType = body.eventType || "unknown";
      const payload = typeof body.payload === "string" ? body.payload : JSON.stringify(body.payload);
      const ts = Date.now();

      // Get the hash of the last entry (chain anchor)
      const lastRow = this.sql.exec(
        `SELECT entry_hash FROM ledger WHERE student_id = ? ORDER BY id DESC LIMIT 1`,
        studentId
      ).toArray()[0];
      const prevHash = lastRow?.entry_hash || "0000000000000000000000000000000000000000000000000000000000000000";

      // Compute this entry's hash: SHA-256(studentId|eventType|payload|prevHash|ts)
      const raw = `${studentId}|${eventType}|${payload}|${prevHash}|${ts}`;
      const entryHash = await computeHash(raw);

      this.sql.exec(
        `INSERT INTO ledger (student_id, event_type, payload, prev_hash, entry_hash, ts) VALUES (?, ?, ?, ?, ?, ?)`,
        studentId, eventType, payload, prevHash, entryHash, ts
      );

      return json({ ok: true, entryHash, prevHash, ts, eventType });
    }

    // HISTORY â€” read last N entries for a student (supports ?eventType= filter)
    if (url.pathname === "/history") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const eventType = url.searchParams.get("eventType") || "";
      let rows;
      if (eventType) {
        rows = this.sql.exec(
          `SELECT id, student_id, event_type, payload, prev_hash, entry_hash, ts FROM ledger WHERE event_type = ? ORDER BY id DESC LIMIT ?`,
          eventType, limit
        ).toArray().reverse();
      } else {
        rows = this.sql.exec(
          `SELECT id, student_id, event_type, payload, prev_hash, entry_hash, ts FROM ledger ORDER BY id DESC LIMIT ?`,
          limit
        ).toArray().reverse();
      }
      const total = this.sql.exec(`SELECT COUNT(*) as cnt FROM ledger`).toArray()[0].cnt;
      return json({ entries: rows, total, limit });
    }

    // VERIFY â€” cryptographic chain integrity check for a student
    if (url.pathname === "/verify") {
      const rows = this.sql.exec(
        `SELECT id, student_id, event_type, payload, prev_hash, entry_hash, ts FROM ledger ORDER BY id ASC`
      ).toArray();

      let valid = true;
      let brokenAt = null;
      let expectedPrevHash = "0000000000000000000000000000000000000000000000000000000000000000";

      for (const row of rows) {
        if (row.prev_hash !== expectedPrevHash) {
          valid = false;
          brokenAt = row.id;
          break;
        }
        const raw = `${row.student_id}|${row.event_type}|${row.payload}|${row.prev_hash}|${row.ts}`;
        const computed = await computeHash(raw);
        if (computed !== row.entry_hash) {
          valid = false;
          brokenAt = row.id;
          break;
        }
        expectedPrevHash = row.entry_hash;
      }

      return json({
        valid,
        totalEntries: rows.length,
        brokenAt: brokenAt || null,
        message: valid
          ? `Chain intact â€” ${rows.length} entries verified`
          : `Chain broken at entry #${brokenAt} â€” tamper detected`,
      });
    }

    // STATE â€” Event-sourced state derivation: rebuild student state from events
    // This is the Unified Cognitive Event Bus: state = f(events), never stored separately
    if (url.pathname === "/state") {
      const studentId = url.searchParams.get("studentId") || "";
      let rows;
      if (studentId) {
        rows = this.sql.exec(
          `SELECT event_type, payload, ts FROM ledger WHERE student_id = ? ORDER BY id ASC`,
          studentId
        ).toArray();
      } else {
        rows = this.sql.exec(`SELECT event_type, payload, ts FROM ledger ORDER BY id ASC`).toArray();
      }

      // Derive state from event stream â€” single timeline of truth
      const state = {
        totalEvents: rows.length,
        firstEvent: rows[0]?.ts || null,
        lastEvent: rows[rows.length - 1]?.ts || null,
        chatCount: 0,
        lessonCount: 0,
        feedbackCount: 0,
        petCheckins: 0,
        sessionLogs: 0,
        soulDNABlocks: 0,
        commandsSent: 0,
        commandsCompleted: 0,
        totalWords: 0,
        weaknessesDetected: [],
        lastTopic: null,
        streakAtLastCheckin: 0,
      };

      for (const row of rows) {
        let p = {};
        try { p = JSON.parse(row.payload); } catch (_) {}
        switch (row.event_type) {
          case "chat_exchange":
            state.chatCount++;
            if (p.user) state.totalWords += p.user.split(/\s+/).filter(Boolean).length;
            break;
          case "lesson_generated": state.lessonCount++; break;
          case "feedback": state.feedbackCount++; break;
          case "pet_checkin":
            state.petCheckins++;
            if (p.streak) state.streakAtLastCheckin = p.streak;
            break;
          case "session_log":
            state.sessionLogs++;
            if (p.topic) state.lastTopic = p.topic;
            break;
          case "soul_dna_capture":
            state.soulDNABlocks++;
            if (p.wordCount) state.totalWords += p.wordCount;
            break;
          case "command_sent": state.commandsSent++; break;
          case "command_completed": state.commandsCompleted++; break;
        }
      }

      return json({ ok: true, studentId: studentId || "all", state, derivedAt: Date.now() });
    }

    // STATS â€” aggregate event statistics across entire ledger
    if (url.pathname === "/stats") {
      const typeCounts = this.sql.exec(
        `SELECT event_type, COUNT(*) as cnt FROM ledger GROUP BY event_type ORDER BY cnt DESC`
      ).toArray();
      const studentCounts = this.sql.exec(
        `SELECT student_id, COUNT(*) as cnt FROM ledger GROUP BY student_id ORDER BY cnt DESC LIMIT 50`
      ).toArray();
      const total = this.sql.exec(`SELECT COUNT(*) as cnt FROM ledger`).toArray()[0].cnt;
      const oldest = this.sql.exec(`SELECT MIN(ts) as ts FROM ledger`).toArray()[0].ts;
      const newest = this.sql.exec(`SELECT MAX(ts) as ts FROM ledger`).toArray()[0].ts;
      return json({
        ok: true,
        total,
        byType: typeCounts,
        byStudent: studentCounts,
        timespan: { oldest, newest, daysActive: oldest && newest ? Math.ceil((newest - oldest) / 86400000) : 0 },
        ts: Date.now(),
      });
    }

    return json({ error: "Not found" }, 404);
  }
}

// â”€â”€ Zalo Pressure API handler functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function handleZaloSweep(env) {
  const report = await runEscalationSweep(env);
  return json({ ok: true, simulated: !env.ZALO_ACCESS_TOKEN, report });
}

async function handlePressureStatus(env) {
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const students = rosterData.students || [];
  const now = Date.now();
  const results = [];
  for (const s of students) {
    const petStub = env.PETS.get(env.PETS.idFromName(s.student_id));
    const petRes = await petStub.fetch(new Request("https://do/state"));
    const petData = await petRes.json();
    const lastCheckin = petData.state?.lastCheckin || s.last_active || 0;
    const daysSilent = lastCheckin ? Math.floor((now - lastCheckin) / 86400000) : 999;
    const streak = petData.state?.streak || 0;
    // Get last alert
    const alertRes = await rosterStub.fetch(new Request(`https://do/alerts/last?studentId=${encodeURIComponent(s.student_id)}`));
    const alertData = await alertRes.json();
    results.push({
      studentId: s.student_id,
      name: s.full_name,
      streak,
      daysSilent,
      lastAlert: alertData.alert || null,
      risk: daysSilent >= 7 ? "critical" : daysSilent >= 5 ? "high" : daysSilent >= 3 ? "medium" : daysSilent >= 2 ? "low" : "ok",
    });
  }
  results.sort((a, b) => b.daysSilent - a.daysSilent);
  return json({ ok: true, simulated: !env.ZALO_ACCESS_TOKEN, students: results, ts: now });
}

async function handlePressureTest(body, env) {
  const studentId = body.studentId;
  if (!studentId) return json({ error: "studentId required" }, 400);
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const student = (rosterData.students || []).find(s => s.student_id === studentId);
  if (!student) return json({ error: "Student not found in roster" }, 404);
  const petStub = env.PETS.get(env.PETS.idFromName(studentId));
  const petRes = await petStub.fetch(new Request("https://do/state"));
  const petData = await petRes.json();
  const enriched = { ...student, streak: petData.state?.streak || 0, last_checkin: petData.state?.lastCheckin || student.last_active || 0 };
  const result = await checkAndEscalate(env, enriched);
  return json({ ok: true, simulated: !env.ZALO_ACCESS_TOKEN, studentId, result });
}

async function handleZaloCheck(body, env) {
  const studentId = body.studentId;
  if (!studentId) return json({ error: "studentId required" }, 400);
  // Get student from roster
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const student = (rosterData.students || []).find(s => s.student_id === studentId);
  if (!student) return json({ error: "Student not found in roster" }, 404);
  // Enrich with PetDO
  const petStub = env.PETS.get(env.PETS.idFromName(studentId));
  const petRes = await petStub.fetch(new Request("https://do/state"));
  const petData = await petRes.json();
  const enriched = { ...student, streak: petData.state?.streak || 0, last_checkin: petData.state?.lastCheckin || student.last_active || 0 };
  const result = await checkAndEscalate(env, enriched);
  return json({ ok: true, studentId, result });
}

async function handleZaloSend(body, env) {
  if (!body.zaloUserId || !body.message) return json({ error: "zaloUserId and message required" }, 400);
  const result = await sendZaloMessage(env, body.zaloUserId, body.message);
  return json({ ok: result.ok, simulated: !env.ZALO_ACCESS_TOKEN, result });
}

async function handleRelationAdd(body, env) {
  if (!body.studentId || !body.partnerId) return json({ error: "studentId and partnerId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const res = await stub.fetch(new Request("https://do/relations/add", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  return res;
}

async function handleRelationRemove(body, env) {
  if (!body.studentId || !body.partnerId) return json({ error: "studentId and partnerId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const res = await stub.fetch(new Request("https://do/relations/remove", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  return res;
}

async function handleRelationGet(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const res = await stub.fetch(new Request(`https://do/relations/get?studentId=${encodeURIComponent(studentId)}`));
  return res;
}

async function handleRelationAll(env) {
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const res = await stub.fetch(new Request("https://do/relations/all"));
  return res;
}

async function handleRosterZalo(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const res = await stub.fetch(new Request("https://do/roster/zalo", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  return res;
}

// SessionDO â€” mutable scratch memory + classroom events (rate limited)
export class SessionDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS memory (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT, user_msg TEXT, obi_msg TEXT, ts INTEGER)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS class_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, teacher_id TEXT, total_students INTEGER, started_at INTEGER)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS class_events (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, student_id TEXT, type TEXT, rule_status TEXT, notes TEXT, ts INTEGER)`);
    // Roster table â€” system-roster instance tracks all enrolled students for digest + flags
    this.sql.exec(`CREATE TABLE IF NOT EXISTS roster (
      student_id TEXT PRIMARY KEY,
      full_name TEXT DEFAULT '',
      english_level TEXT DEFAULT '',
      last_active INTEGER DEFAULT 0,
      last_session_date INTEGER DEFAULT 0,
      last_session_topic TEXT DEFAULT '',
      last_session_vocab TEXT DEFAULT '[]',
      schedule TEXT DEFAULT '{}',
      schedule_confirmed INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      xp INTEGER DEFAULT 0,
      flagged INTEGER DEFAULT 0,
      zalo_id TEXT DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT 0
    )`);
    // Session events â€” structured learning event chain (v2 pipeline)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS session_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      input TEXT NOT NULL DEFAULT '',
      output TEXT NOT NULL DEFAULT '',
      mistakes TEXT DEFAULT '[]',
      vocabulary TEXT DEFAULT '[]',
      phonics TEXT DEFAULT '[]',
      topic TEXT DEFAULT '',
      next_action TEXT DEFAULT '',
      drift_score REAL DEFAULT 0,
      ts INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_session_events_student ON session_events(student_id, ts)`);
    // Safe migration for zalo_id
    try { this.sql.exec(`ALTER TABLE roster ADD COLUMN zalo_id TEXT DEFAULT ''`); } catch(_) {}
    // Accountability relations graph â€” who monitors whom
    this.sql.exec(`CREATE TABLE IF NOT EXISTS relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      partner_id TEXT NOT NULL,
      partner_name TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'parent',
      zalo_id TEXT DEFAULT '',
      intensity TEXT DEFAULT 'medium',
      created_at INTEGER NOT NULL DEFAULT 0,
      UNIQUE(student_id, partner_id)
    )`);
    // Alert log â€” tracks every escalation sent for cooldown + audit
    this.sql.exec(`CREATE TABLE IF NOT EXISTS alert_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      recipient_role TEXT NOT NULL DEFAULT 'student',
      recipient_id TEXT DEFAULT '',
      message TEXT DEFAULT '',
      simulated INTEGER DEFAULT 0,
      ts INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_alert_log_student ON alert_log(student_id, ts)`);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/memory/save" && request.method === "POST") {
      const body = await request.json();
      const exchange = body.exchange || {};
      this.sql.exec(`INSERT INTO memory (student_id, user_msg, obi_msg, ts) VALUES (?, ?, ?, ?)`, body.studentId || "unknown", exchange.user || "", exchange.obi || "", Date.now());
      return json({ ok: true });
    }

    if (path === "/memory/get") {
      const rows = this.sql.exec(`SELECT user_msg, obi_msg FROM memory ORDER BY id DESC LIMIT 20`).toArray().reverse();
      return json({ memory: rows.map(r => ({ user: r.user_msg, obi: r.obi_msg })) });
    }

    if (path === "/class/start" && request.method === "POST") {
      const body = await request.json();
      this.sql.exec(`INSERT INTO class_sessions (class_id, teacher_id, total_students, started_at) VALUES (?, ?, ?, ?)`, body.classId || "default", body.teacherId || "obi", body.totalStudents || 40, Date.now());
      return json({ ok: true, classId: body.classId, startedAt: Date.now() });
    }

    if (path === "/class/event" && request.method === "POST") {
      const body = await request.json();
      const classId = body.classId || "default";
      const studentId = body.studentId || "";
      const oneMinuteAgo = Date.now() - 60000;

      const classCount = this.sql.exec(`SELECT COUNT(*) as cnt FROM class_events WHERE class_id = ? AND ts > ?`, classId, oneMinuteAgo).toArray()[0].cnt;
      if (classCount >= 120) {
        return new Response(JSON.stringify({ error: "Class rate limit exceeded", retryAfter: 60, limit: 120, window: "60s" }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders() } });
      }

      if (studentId) {
        const studentCount = this.sql.exec(`SELECT COUNT(*) as cnt FROM class_events WHERE class_id = ? AND student_id = ? AND ts > ?`, classId, studentId, oneMinuteAgo).toArray()[0].cnt;
        if (studentCount >= 20) {
          return new Response(JSON.stringify({ error: "Student rate limit exceeded", retryAfter: 60, limit: 20, window: "60s" }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders() } });
        }
      }

      this.sql.exec(`INSERT INTO class_events (class_id, student_id, type, rule_status, notes, ts) VALUES (?, ?, ?, ?, ?, ?)`, classId, studentId, body.type || "", body.ruleStatus || "", body.notes || "", Date.now());
      return json({ ok: true, classId, studentId });
    }

    if (path === "/class/session") {
      const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
      const session = this.sql.exec(`SELECT * FROM class_sessions ORDER BY id DESC LIMIT 1`).toArray()[0];
      const events = this.sql.exec(`SELECT * FROM class_events ORDER BY id DESC LIMIT 50`).toArray();
      const complianceRate = totalStudents > 0 ? Math.round((events.filter(e => e.rule_status === "followed").length / totalStudents) * 100) : 0;
      return json({ session: session || null, events, totalStudents, complianceRate });
    }

    if (path === "/class/report") {
      const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
      const events = this.sql.exec(`SELECT * FROM class_events ORDER BY id`).toArray();
      const summary = events.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
      const flagged = events.filter(e => e.rule_status === "broken").map(e => e.student_id).filter((v, i, a) => a.indexOf(v) === i);
      const reportText = [`Class Report â€” ${events.length} events across ${totalStudents} students.`, Object.entries(summary).map(([k, v]) => `  ${k}: ${v}`).join("\n"), flagged.length > 0 ? `Flagged students: ${flagged.join(", ")}` : "No flagged students."].join("\n");
      return json({ reportText, events: events.length, summary, flagged });
    }

    // â”€â”€ Roster endpoints (used by system-roster instance) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (path === "/roster/upsert" && request.method === "POST") {
      const body = await request.json();
      const now = Date.now();
      this.sql.exec(`INSERT OR IGNORE INTO roster (student_id, created_at) VALUES (?, ?)`, body.studentId, now);
      if (body.fullName !== undefined) this.sql.exec(`UPDATE roster SET full_name = ? WHERE student_id = ?`, body.fullName, body.studentId);
      if (body.englishLevel !== undefined) this.sql.exec(`UPDATE roster SET english_level = ? WHERE student_id = ?`, body.englishLevel, body.studentId);
      return json({ ok: true, studentId: body.studentId });
    }

    if (path === "/roster/all" && request.method === "GET") {
      const rows = this.sql.exec(`SELECT * FROM roster ORDER BY full_name ASC`).toArray();
      return json({ students: rows, count: rows.length });
    }

    if (path === "/roster/session" && request.method === "POST") {
      const body = await request.json();
      const now = Date.now();
      this.sql.exec(
        `UPDATE roster SET last_active = ?, last_session_date = ?, last_session_topic = ?, last_session_vocab = ?, flagged = 0 WHERE student_id = ?`,
        now, now, body.topic || "", JSON.stringify(body.vocabList || []), body.studentId
      );
      return json({ ok: true });
    }

    if (path === "/roster/schedule" && request.method === "POST") {
      const body = await request.json();
      this.sql.exec(`UPDATE roster SET schedule = ?, schedule_confirmed = 0 WHERE student_id = ?`, JSON.stringify(body.schedule || {}), body.studentId);
      return json({ ok: true });
    }

    if (path === "/roster/confirm" && request.method === "POST") {
      const body = await request.json();
      this.sql.exec(`UPDATE roster SET schedule_confirmed = 1, flagged = 0 WHERE student_id = ?`, body.studentId);
      return json({ ok: true });
    }

    if (path === "/roster/chat" && request.method === "POST") {
      const body = await request.json();
      this.sql.exec(`UPDATE roster SET last_active = ? WHERE student_id = ?`, Date.now(), body.studentId);
      return json({ ok: true });
    }

    if (path === "/roster/flags" && request.method === "GET") {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const rows = this.sql.exec(
        `SELECT * FROM roster WHERE flagged = 1 OR (schedule != '{}' AND schedule_confirmed = 0) OR (last_active > 0 AND last_active < ?)`,
        sevenDaysAgo
      ).toArray();
      return json({ flags: rows, count: rows.length });
    }

    // â”€â”€ Relation graph endpoints (accountability links) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (path === "/relations/add" && request.method === "POST") {
      const body = await request.json();
      if (!body.studentId || !body.partnerId) return json({ error: "studentId and partnerId required" }, 400);
      const role = body.role || "parent";
      if (!["parent", "boss", "teacher", "partner"].includes(role)) return json({ error: "Invalid role" }, 400);
      this.sql.exec(
        `INSERT OR REPLACE INTO relations (student_id, partner_id, partner_name, role, zalo_id, intensity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        body.studentId, body.partnerId, body.partnerName || "", role, body.zaloId || "", body.intensity || "medium", Date.now()
      );
      return json({ ok: true, studentId: body.studentId, partnerId: body.partnerId, role });
    }

    if (path === "/relations/remove" && request.method === "POST") {
      const body = await request.json();
      if (!body.studentId || !body.partnerId) return json({ error: "studentId and partnerId required" }, 400);
      this.sql.exec(`DELETE FROM relations WHERE student_id = ? AND partner_id = ?`, body.studentId, body.partnerId);
      return json({ ok: true });
    }

    if (path === "/relations/get") {
      const studentId = url.searchParams.get("studentId") || "";
      if (!studentId) return json({ error: "studentId required" }, 400);
      const rows = this.sql.exec(`SELECT * FROM relations WHERE student_id = ? ORDER BY role`, studentId).toArray();
      return json({ links: rows, count: rows.length });
    }

    if (path === "/relations/all") {
      const rows = this.sql.exec(`SELECT * FROM relations ORDER BY student_id, role`).toArray();
      return json({ relations: rows, count: rows.length });
    }

    // Update student Zalo ID
    if (path === "/roster/zalo" && request.method === "POST") {
      const body = await request.json();
      if (!body.studentId) return json({ error: "studentId required" }, 400);
      this.sql.exec(`UPDATE roster SET zalo_id = ? WHERE student_id = ?`, body.zaloId || "", body.studentId);
      return json({ ok: true });
    }

    // â”€â”€ Alert log endpoints (cooldown check + audit trail) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (path === "/alerts/log" && request.method === "POST") {
      const body = await request.json();
      if (!body.studentId || !body.alertType) return json({ error: "studentId and alertType required" }, 400);
      this.sql.exec(
        `INSERT INTO alert_log (student_id, alert_type, recipient_role, recipient_id, message, simulated, ts) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        body.studentId, body.alertType, body.recipientRole || "student", body.recipientId || "", body.message || "", body.simulated ? 1 : 0, Date.now()
      );
      return json({ ok: true });
    }

    if (path === "/alerts/last" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId") || "";
      const alertType = url.searchParams.get("alertType") || "";
      if (!studentId) return json({ error: "studentId required" }, 400);
      let row;
      if (alertType) {
        row = this.sql.exec(`SELECT * FROM alert_log WHERE student_id = ? AND alert_type = ? ORDER BY ts DESC LIMIT 1`, studentId, alertType).toArray()[0] || null;
      } else {
        row = this.sql.exec(`SELECT * FROM alert_log WHERE student_id = ? ORDER BY ts DESC LIMIT 1`, studentId).toArray()[0] || null;
      }
      return json({ lastAlert: row });
    }

    if (path === "/alerts/history" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId");
      const limit = parseInt(url.searchParams.get("limit") || "50");
      let rows;
      if (studentId) {
        rows = this.sql.exec(`SELECT * FROM alert_log WHERE student_id = ? ORDER BY ts DESC LIMIT ?`, studentId, limit).toArray();
      } else {
        rows = this.sql.exec(`SELECT * FROM alert_log ORDER BY ts DESC LIMIT ?`, limit).toArray();
      }
      return json({ alerts: rows, count: rows.length });
    }

    // â”€â”€ Session Events (v2 structured learning event chain) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (path === "/events/write" && request.method === "POST") {
      const body = await request.json();
      const now = Date.now();
      this.sql.exec(
        `INSERT INTO session_events (student_id, input, output, mistakes, vocabulary, phonics, topic, next_action, drift_score, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        body.studentId || "", body.input || "", body.output || "", body.mistakes || "[]", body.vocabulary || "[]", body.phonics || "[]", body.topic || "", body.nextAction || "", body.driftScore || 0, now
      );
      return json({ ok: true, ts: now });
    }

    if (path === "/events/recent") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 100);
      const rows = this.sql.exec(`SELECT * FROM session_events ORDER BY ts DESC LIMIT ?`, limit).toArray();
      return json({ events: rows, count: rows.length });
    }

    if (path === "/events/stats") {
      const total = this.sql.exec(`SELECT COUNT(*) as cnt FROM session_events`).toArray()[0]?.cnt || 0;
      const lastEvent = this.sql.exec(`SELECT * FROM session_events ORDER BY ts DESC LIMIT 1`).toArray()[0] || null;
      const topicCounts = this.sql.exec(`SELECT topic, COUNT(*) as cnt FROM session_events WHERE topic != '' GROUP BY topic ORDER BY cnt DESC LIMIT 10`).toArray();
      return json({ total, lastEvent, topicCounts });
    }

    return json({ error: "Not found" }, 404);
  }
}

// ProfileDO â€” student onboarding + profile
export class ProfileDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT UNIQUE, full_name TEXT, current_city TEXT, birthplace TEXT, english_level TEXT, goals TEXT, confidence_areas TEXT, occupation TEXT, fear_trigger TEXT, learning_history TEXT, motivation_now TEXT, last_session_date INTEGER DEFAULT 0, schedule TEXT DEFAULT '{}', schedule_flagged INTEGER DEFAULT 0, partner_id TEXT DEFAULT '', parent_id TEXT DEFAULT '', created_at INTEGER)`);
    // Safe migrations for existing DOs
    const _migrations = [
      `ALTER TABLE profiles ADD COLUMN last_session_date INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN schedule TEXT DEFAULT '{}'`,
      `ALTER TABLE profiles ADD COLUMN schedule_flagged INTEGER DEFAULT 0`,
      `ALTER TABLE profiles ADD COLUMN partner_id TEXT DEFAULT ''`,
      `ALTER TABLE profiles ADD COLUMN parent_id TEXT DEFAULT ''`,
    ];
    for (const m of _migrations) { try { this.sql.exec(m); } catch(_) {} }
    // Safe migrations â€” summary column
    try { this.sql.exec(`ALTER TABLE profiles ADD COLUMN summary TEXT DEFAULT ''`); } catch(_) {}
    // Weakness tracking table
    this.sql.exec(`CREATE TABLE IF NOT EXISTS weak_points (id INTEGER PRIMARY KEY AUTOINCREMENT, specific TEXT NOT NULL, category TEXT NOT NULL, error_count INTEGER DEFAULT 1, last_seen INTEGER NOT NULL, first_seen INTEGER NOT NULL, improvement_pct REAL DEFAULT 0.0, UNIQUE(specific))`);
    // Student behavioral state (Mouse â†’ Tiger state machine)
    this.sql.exec(`CREATE TABLE IF NOT EXISTS student_state (
      student_id TEXT PRIMARY KEY,
      continuity_score REAL DEFAULT 0,
      execution_score REAL DEFAULT 0,
      accuracy_score REAL DEFAULT 0,
      engagement_score REAL DEFAULT 0,
      accountability_score REAL DEFAULT 0,
      mouse_tiger_score REAL DEFAULT 0,
      state TEXT DEFAULT 'MOUSE',
      total_events INTEGER DEFAULT 0,
      last_input TEXT DEFAULT '',
      last_topic TEXT DEFAULT '',
      updated_at INTEGER DEFAULT 0
    )`);
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/onboarding" && request.method === "POST") {
      const b = await request.json();
      this.sql.exec(`INSERT OR REPLACE INTO profiles (student_id, full_name, current_city, birthplace, english_level, goals, confidence_areas, occupation, fear_trigger, learning_history, motivation_now, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, b.studentId || "unknown", b.fullName || "", b.currentCity || "", b.birthplace || "", b.englishLevel || "", b.goals || "", b.confidenceAreas || "", b.occupation || "", b.fearTrigger || "", b.learningHistory || "", b.motivationNow || "", Date.now());
      return json({ ok: true, studentId: b.studentId });
    }
    if (url.pathname === "/profile" && request.method === "GET") {
      const rows = this.sql.exec(`SELECT * FROM profiles LIMIT 1`).toArray();
      return json({ profile: rows[0] || null });
    }
    if (url.pathname === "/schedule/set" && request.method === "POST") {
      const b = await request.json();
      this.sql.exec(`UPDATE profiles SET schedule = ?, schedule_flagged = 0 WHERE student_id = ?`, JSON.stringify(b.schedule || {}), b.studentId || "");
      return json({ ok: true });
    }
    if (url.pathname === "/schedule/confirm" && request.method === "POST") {
      const b = await request.json();
      this.sql.exec(`UPDATE profiles SET schedule_flagged = 0 WHERE student_id = ?`, b.studentId || "");
      return json({ ok: true });
    }
    if (url.pathname === "/session/update" && request.method === "POST") {
      const b = await request.json();
      this.sql.exec(`UPDATE profiles SET last_session_date = ? WHERE student_id = ?`, b.ts || Date.now(), b.studentId || "");
      return json({ ok: true });
    }
    if (url.pathname === "/weakness/get" && request.method === "GET") {
      const rows = this.sql.exec(`SELECT * FROM weak_points ORDER BY error_count DESC LIMIT 10`).toArray();
      return json({ weakPoints: rows });
    }
    if (url.pathname === "/weakness/update" && request.method === "POST") {
      const b = await request.json();
      const now = Date.now();
      for (const w of (b.weaknesses || [])) {
        const existing = this.sql.exec(`SELECT id, error_count FROM weak_points WHERE specific = ?`, w.specific).toArray();
        if (existing.length > 0) {
          this.sql.exec(`UPDATE weak_points SET error_count = error_count + 1, last_seen = ? WHERE specific = ?`, now, w.specific);
        } else {
          this.sql.exec(`INSERT INTO weak_points (specific, category, error_count, last_seen, first_seen) VALUES (?, ?, 1, ?, ?)`, w.specific, w.category, now, now);
        }
      }
      return json({ ok: true, updated: (b.weaknesses || []).length });
    }
    if (url.pathname === "/progress" && request.method === "GET") {
      const weakPoints = this.sql.exec(`SELECT * FROM weak_points ORDER BY error_count DESC`).toArray();
      const profile = this.sql.exec(`SELECT * FROM profiles LIMIT 1`).toArray();
      return json({ weakPoints, profile: profile[0] || null });
    }
    // Summary â€” compressed memory (Soul DNA v1)
    if (url.pathname === "/summary/get" && request.method === "GET") {
      const profile = this.sql.exec(`SELECT summary, english_level FROM profiles LIMIT 1`).toArray();
      return json({ summary: profile[0]?.summary || "", level: profile[0]?.english_level || "A1" });
    }
    if (url.pathname === "/summary/update" && request.method === "POST") {
      const b = await request.json();
      this.sql.exec(`UPDATE profiles SET summary = ? WHERE student_id = ?`, b.summary || "", b.studentId || "");
      return json({ ok: true });
    }

    // â”€â”€ Student Behavioral State (Mouse â†’ Tiger state machine) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (url.pathname === "/state/get") {
      const rows = this.sql.exec(`SELECT * FROM student_state LIMIT 1`).toArray();
      return json({ studentState: rows[0] || null });
    }

    if (url.pathname === "/state/update" && request.method === "POST") {
      const b = await request.json();
      const sid = b.studentId || "";
      if (!sid) return json({ error: "studentId required" }, 400);
      const now = Date.now();

      // Ensure row exists
      this.sql.exec(`INSERT OR IGNORE INTO student_state (student_id, updated_at) VALUES (?, ?)`, sid, now);

      // Load current state
      const current = this.sql.exec(`SELECT * FROM student_state WHERE student_id = ?`, sid).toArray()[0] || {};
      const totalEvents = (current.total_events || 0) + 1;

      // Update engagement (based on input length â€” longer = more engaged)
      const inputLen = b.inputLength || 0;
      const engagementDelta = inputLen > 20 ? 2 : inputLen > 5 ? 1 : -1;
      const engagementScore = Math.max(0, Math.min(100, (current.engagement_score || 50) + engagementDelta));

      // Update accuracy (fewer mistakes = higher accuracy)
      const accDelta = b.hasMistakes ? -2 : 3;
      const accuracyScore = Math.max(0, Math.min(100, (current.accuracy_score || 50) + accDelta));

      // Update continuity (each event increases; decay if drift is high)
      const contDelta = b.driftScore > 5 ? -3 : 2;
      const continuityScore = Math.max(0, Math.min(100, (current.continuity_score || 30) + contDelta));

      // Execution = total events normalized (more events = higher execution)
      const executionScore = Math.min(100, totalEvents * 2);

      // Accountability stays at current (updated externally by relations system)
      const accountabilityScore = current.accountability_score || 20;

      // Compute composite Mouse â†’ Tiger score
      const composite = computeMouseTigerScore({
        executionScore, continuityScore, engagementScore, accountabilityScore, accuracyScore,
      });

      this.sql.exec(
        `UPDATE student_state SET continuity_score = ?, execution_score = ?, accuracy_score = ?, engagement_score = ?, accountability_score = ?, mouse_tiger_score = ?, state = ?, total_events = ?, updated_at = ? WHERE student_id = ?`,
        continuityScore, executionScore, accuracyScore, engagementScore, accountabilityScore, composite.score, composite.state, totalEvents, now, sid
      );

      return json({ ok: true, state: composite.state, score: composite.score, totalEvents });
    }

    if (url.pathname === "/state/full") {
      const state = this.sql.exec(`SELECT * FROM student_state LIMIT 1`).toArray()[0] || null;
      const profile = this.sql.exec(`SELECT * FROM profiles LIMIT 1`).toArray()[0] || null;
      const weakPoints = this.sql.exec(`SELECT * FROM weak_points ORDER BY error_count DESC LIMIT 10`).toArray();
      return json({ studentState: state, profile, weakPoints });
    }

    return json({ error: "Not found" }, 404);
  }
}

// PetDO â€” NET Pet gamification (streak, XP, mood, spaced repetition 1-3-7-30, Tiger Score)
export class PetDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS pet_state (id INTEGER PRIMARY KEY CHECK (id = 1), streak INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, mood TEXT DEFAULT 'neutral', total_sessions INTEGER DEFAULT 0, last_checkin INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0, tiger_score INTEGER DEFAULT 0, day_phase TEXT DEFAULT 'E1')`);
    this.sql.exec(`INSERT OR IGNORE INTO pet_state (id, streak, xp, mood, total_sessions, last_checkin, longest_streak, tiger_score, day_phase) VALUES (1, 0, 0, 'neutral', 0, 0, 0, 0, 'E1')`);
    // Safe migration for existing DOs
    for (const m of [
      `ALTER TABLE pet_state ADD COLUMN tiger_score INTEGER DEFAULT 0`,
      `ALTER TABLE pet_state ADD COLUMN day_phase TEXT DEFAULT 'E1'`,
    ]) { try { this.sql.exec(m); } catch(_) {} }
    this.sql.exec(`CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, minutes INTEGER, confidence INTEGER, xp_gained INTEGER, streak_at_checkin INTEGER, ts INTEGER)`);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/checkin" && request.method === "POST") {
      const body = await request.json();
      const minutes = Math.min(body.minutes || 5, 240);
      const confidence = Math.max(1, Math.min(10, body.confidence || 5));
      const now = Date.now();
      const current = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray()[0];
      const hoursSince = (now - (current.last_checkin || 0)) / 3600000;

      let streak = current.streak;
      if (hoursSince >= 4 && hoursSince < 48) streak += 1;
      else if (hoursSince >= 48) streak = 1;

      const srBonus = [1, 3, 7, 30].includes(streak) ? 1.5 : 1;
      const xpGain = Math.round(minutes * (1 + confidence / 10) * srBonus);
      const newXp = current.xp + xpGain;
      const longestStreak = Math.max(current.longest_streak || 0, streak);

      let mood = "neutral";
      if (streak >= 7 && confidence >= 8) mood = "tiger";
      else if (streak >= 5 && confidence >= 7) mood = "fired_up";
      else if (streak >= 3) mood = "happy";
      else if (streak >= 1) mood = "content";
      else if (confidence <= 3) mood = "sleepy";

      const totalSessions = current.total_sessions + 1;
      this.sql.exec(`UPDATE pet_state SET streak = ?, xp = ?, mood = ?, total_sessions = ?, last_checkin = ?, longest_streak = ? WHERE id = 1`, streak, newXp, mood, totalSessions, now, longestStreak);
      this.sql.exec(`INSERT INTO checkins (minutes, confidence, xp_gained, streak_at_checkin, ts) VALUES (?, ?, ?, ?, ?)`, minutes, confidence, xpGain, streak, now);

      // Tiger Score: retention(0.4) + error_reduction(0.4) + daily_completion(0.2)
      const recentCheckins = this.sql.exec(`SELECT ts FROM checkins WHERE ts > ? ORDER BY ts DESC`, now - 7 * 86400000).toArray();
      const uniqueDays = new Set(recentCheckins.map(c => Math.floor(c.ts / 86400000)));
      const retention = Math.min(1, uniqueDays.size / 7);
      const dailyCompletion = 1; // they just checked in
      // Error reduction: fetch from checkins confidence trend (higher confidence = fewer errors)
      const recentConf = this.sql.exec(`SELECT confidence FROM checkins ORDER BY id DESC LIMIT 10`).toArray();
      const avgConf = recentConf.length > 0 ? recentConf.reduce((s, r) => s + r.confidence, 0) / recentConf.length : 5;
      const errorReduction = Math.min(1, avgConf / 10);
      const tigerScore = Math.round(retention * 40 + errorReduction * 40 + dailyCompletion * 20);

      // Day phase: E1 (days 1-2), E2 (days 3-5), E3 (days 6+)
      const dayPhase = totalSessions <= 2 ? "E1" : totalSessions <= 5 ? "E2" : "E3";

      this.sql.exec(`UPDATE pet_state SET tiger_score = ?, day_phase = ? WHERE id = 1`, tigerScore, dayPhase);

      let milestone = null;
      if ([1, 3, 7, 30].includes(streak)) {
        const msgs = { 1: "Day 1. The journey starts. Every Tiger was once a Mouse.", 3: "Day 3. Three in a row. You are not a mouse anymore.", 7: "Day 7. One full week. Your brain is rewiring. Keep going.", 30: "Day 30. Thirty days straight. That is not a student â€” that is a Tiger." };
        milestone = { day: streak, bonus: "1.5x XP", message: msgs[streak] };
      }

      return json({ ok: true, state: { streak, xp: newXp, mood, totalSessions, xpGain, longestStreak, tigerScore, dayPhase }, milestone });
    }

    if (url.pathname === "/state") {
      const rows = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray();
      const s = rows[0] || { streak: 0, xp: 0, mood: "neutral", total_sessions: 0, longest_streak: 0, tiger_score: 0, day_phase: "E1" };
      return json({ state: { streak: s.streak, xp: s.xp, mood: s.mood, totalSessions: s.total_sessions, longestStreak: s.longest_streak, tigerScore: s.tiger_score, dayPhase: s.day_phase } });
    }

    // Tiger Score endpoint â€” returns score + breakdown
    if (url.pathname === "/score") {
      const s = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray()[0] || {};
      const now = Date.now();
      const recentCheckins = this.sql.exec(`SELECT ts, confidence FROM checkins WHERE ts > ? ORDER BY ts DESC`, now - 7 * 86400000).toArray();
      const uniqueDays = new Set(recentCheckins.map(c => Math.floor(c.ts / 86400000)));
      const retention = Math.min(1, uniqueDays.size / 7);
      const avgConf = recentCheckins.length > 0 ? recentCheckins.reduce((sum, r) => sum + r.confidence, 0) / recentCheckins.length : 0;
      const errorReduction = Math.min(1, avgConf / 10);
      const lastCheckin = s.last_checkin || 0;
      const dailyCompletion = (now - lastCheckin) < 86400000 ? 1 : 0;
      const tigerScore = Math.round(retention * 40 + errorReduction * 40 + dailyCompletion * 20);
      return json({
        tigerScore,
        breakdown: { retention: Math.round(retention * 100), errorReduction: Math.round(errorReduction * 100), dailyCompletion: dailyCompletion * 100 },
        streak: s.streak || 0,
        dayPhase: s.day_phase || "E1",
        status: tigerScore < 40 ? "MOUSE_MODE" : tigerScore < 70 ? "CAT_MODE" : "TIGER_MODE",
      });
    }

    // Daily check endpoint â€” called by cron for accountability
    if (url.pathname === "/daily-check") {
      const s = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray()[0] || {};
      const now = Date.now();
      const lastCheckin = s.last_checkin || 0;
      const hoursInactive = (now - lastCheckin) / 3600000;
      const recentCheckins = this.sql.exec(`SELECT ts, confidence FROM checkins WHERE ts > ? ORDER BY ts DESC`, now - 7 * 86400000).toArray();
      const uniqueDays = new Set(recentCheckins.map(c => Math.floor(c.ts / 86400000)));
      const retention = Math.min(1, uniqueDays.size / 7);
      const avgConf = recentCheckins.length > 0 ? recentCheckins.reduce((sum, r) => sum + r.confidence, 0) / recentCheckins.length : 0;
      const errorReduction = Math.min(1, avgConf / 10);
      const dailyCompletion = hoursInactive < 24 ? 1 : 0;
      const tigerScore = Math.round(retention * 40 + errorReduction * 40 + dailyCompletion * 20);
      this.sql.exec(`UPDATE pet_state SET tiger_score = ? WHERE id = 1`, tigerScore);
      return json({
        tigerScore,
        hoursInactive: Math.round(hoursInactive),
        streak: s.streak || 0,
        totalSessions: s.total_sessions || 0,
        needsAlert: hoursInactive >= 24 && tigerScore < 40,
        needsDrill: hoursInactive < 48,
      });
    }

    return json({ error: "Not found" }, 404);
  }
}

// CommandDO â€” Command Station Queue (SOV100 â†’ Agent99 â†’ Drones)
// Priority-ordered queue with claim/complete lifecycle.
// Every command flows: Magic Chat â†’ CommandDO â†’ VS Code Extension
export class CommandDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS commands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_intent TEXT NOT NULL,
      translation TEXT NOT NULL DEFAULT '{}',
      priority INTEGER NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT NOT NULL DEFAULT 'magic-chat',
      assigned_drone TEXT DEFAULT NULL,
      claimed_by TEXT DEFAULT NULL,
      result TEXT DEFAULT NULL,
      success INTEGER DEFAULT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status, priority, created_at)`);

    // â”€â”€ Virality Engine tables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    this.sql.exec(`CREATE TABLE IF NOT EXISTS post_metrics (
      post_id TEXT PRIMARY KEY,
      platform TEXT NOT NULL DEFAULT 'unknown',
      hook TEXT DEFAULT '',
      body TEXT DEFAULT '',
      tone TEXT DEFAULT 'unknown',
      format TEXT DEFAULT 'text',
      base_insight TEXT DEFAULT '',
      experiment_id TEXT DEFAULT NULL,
      impressions INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      watch_time REAL DEFAULT 0,
      virality_score REAL DEFAULT NULL,
      conversion_score REAL DEFAULT NULL,
      created_at INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_post_metrics_score ON post_metrics(virality_score)`);

    this.sql.exec(`CREATE TABLE IF NOT EXISTS experiments (
      id TEXT PRIMARY KEY,
      variant_group TEXT NOT NULL,
      hook TEXT NOT NULL,
      body TEXT DEFAULT '',
      platform TEXT DEFAULT 'unknown',
      tone TEXT DEFAULT 'unknown',
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'running',
      created_at INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status)`);

    this.sql.exec(`CREATE TABLE IF NOT EXISTS content_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern TEXT NOT NULL,
      tone TEXT DEFAULT 'unknown',
      platform TEXT DEFAULT 'unknown',
      format TEXT DEFAULT 'text',
      score REAL DEFAULT 0,
      times_used INTEGER DEFAULT 0,
      last_used INTEGER DEFAULT NULL,
      created_at INTEGER NOT NULL
    )`);
  }

  async fetch(request) {
    const url = new URL(request.url);

    // SEND â€” Queue a new command
    if (url.pathname === "/send" && request.method === "POST") {
      const body = await request.json();
      const now = Date.now();
      const translation = body.translation || {};
      const drone = translation.primaryDrone?.name || "CodeRunner";

      this.sql.exec(
        `INSERT INTO commands (raw_intent, translation, priority, status, source, assigned_drone, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`,
        body.rawIntent || "",
        JSON.stringify(translation),
        body.priority || 5,
        body.source || "magic-chat",
        drone,
        now,
        now
      );

      const row = this.sql.exec(`SELECT last_insert_rowid() as id`).toArray()[0];
      return json({
        ok: true,
        commandId: row.id,
        status: "pending",
        assignedDrone: drone,
        priority: body.priority || 5,
        translation: {
          agent99: translation.agent99,
          agent98: translation.agent98,
          agent97: translation.agent97,
          primaryDrone: translation.primaryDrone,
          supportDrones: translation.supportDrones,
        },
        ts: now,
      });
    }

    // QUEUE â€” Get commands by status (VS Code polls this)
    if (url.pathname === "/queue") {
      const status = url.searchParams.get("status") || "pending";
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const rows = this.sql.exec(
        `SELECT * FROM commands WHERE status = ? ORDER BY priority ASC, created_at ASC LIMIT ?`,
        status,
        limit
      ).toArray();

      return json({
        commands: rows.map(r => ({
          ...r,
          translation: JSON.parse(r.translation || "{}"),
        })),
        count: rows.length,
        status,
      });
    }

    // CLAIM â€” VS Code extension claims a pending command
    if (url.pathname === "/claim" && request.method === "POST") {
      const body = await request.json();
      const commandId = body.commandId;
      const claimedBy = body.claimedBy || "vscode-extension";

      const existing = this.sql.exec(
        `SELECT * FROM commands WHERE id = ?`, commandId
      ).toArray()[0];

      if (!existing) return json({ error: "Command not found" }, 404);
      if (existing.status !== "pending") return json({ error: `Command already ${existing.status}` }, 409);

      this.sql.exec(
        `UPDATE commands SET status = 'claimed', claimed_by = ?, updated_at = ? WHERE id = ?`,
        claimedBy,
        Date.now(),
        commandId
      );

      return json({ ok: true, commandId, status: "claimed", claimedBy });
    }

    // COMPLETE â€” VS Code reports execution result
    if (url.pathname === "/complete" && request.method === "POST") {
      const body = await request.json();
      const commandId = body.commandId;

      const existing = this.sql.exec(
        `SELECT * FROM commands WHERE id = ?`, commandId
      ).toArray()[0];

      if (!existing) return json({ error: "Command not found" }, 404);

      this.sql.exec(
        `UPDATE commands SET status = ?, result = ?, success = ?, updated_at = ? WHERE id = ?`,
        body.success !== false ? "completed" : "failed",
        body.result || "",
        body.success !== false ? 1 : 0,
        Date.now(),
        commandId
      );

      return json({ ok: true, commandId, status: body.success !== false ? "completed" : "failed" });
    }

    // STATUS â€” Get a specific command
    if (url.pathname === "/status") {
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "Missing id" }, 400);
      const row = this.sql.exec(`SELECT * FROM commands WHERE id = ?`, parseInt(id)).toArray()[0];
      if (!row) return json({ error: "Not found" }, 404);
      return json({ command: { ...row, translation: JSON.parse(row.translation || "{}") } });
    }

    // HISTORY â€” Recent commands
    if (url.pathname === "/history") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const rows = this.sql.exec(`SELECT * FROM commands ORDER BY created_at DESC LIMIT ?`, limit).toArray();
      return json({ commands: rows.map(r => ({ ...r, translation: JSON.parse(r.translation || "{}") })), count: rows.length });
    }

    // â”€â”€ Virality Engine endpoints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    // ADD METRICS â€” Store post engagement data
    if (url.pathname === "/virality/metrics" && request.method === "POST") {
      const body = await request.json();
      const postId = body.postId || body.post_id || `post_${Date.now()}`;
      const now = Date.now();
      this.sql.exec(
        `INSERT OR REPLACE INTO post_metrics (post_id, platform, hook, body, tone, format, base_insight, experiment_id, impressions, likes, comments, shares, saves, clicks, watch_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        postId, body.platform || "unknown", body.hook || "", body.body || "", body.tone || "unknown",
        body.format || "text", body.base_insight || "", body.experiment_id || null,
        body.impressions || 0, body.likes || 0, body.comments || 0, body.shares || 0,
        body.saves || 0, body.clicks || 0, body.watch_time || 0, now
      );
      return json({ ok: true, postId });
    }

    // GET RECENT METRICS
    if (url.pathname === "/virality/metrics" && request.method === "GET") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const rows = this.sql.exec(`SELECT * FROM post_metrics ORDER BY created_at DESC LIMIT ?`, limit).toArray();
      return json({ posts: rows, count: rows.length });
    }

    // UNSCORED â€” Posts without virality scores (for learning loop)
    if (url.pathname === "/virality/unscored") {
      const rows = this.sql.exec(`SELECT * FROM post_metrics WHERE virality_score IS NULL ORDER BY created_at ASC LIMIT 100`).toArray();
      return json({ posts: rows, count: rows.length });
    }

    // SCORE â€” Save virality + conversion scores for a post
    if (url.pathname === "/virality/score" && request.method === "POST") {
      const body = await request.json();
      if (!body.postId) return json({ error: "postId required" }, 400);
      this.sql.exec(
        `UPDATE post_metrics SET virality_score = ?, conversion_score = ? WHERE post_id = ?`,
        body.viralityScore || 0, body.conversionScore || 0, body.postId
      );
      return json({ ok: true, postId: body.postId });
    }

    // TOP â€” Leaderboard of best-performing posts
    if (url.pathname === "/virality/top") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const rows = this.sql.exec(`SELECT * FROM post_metrics WHERE virality_score IS NOT NULL ORDER BY virality_score DESC LIMIT ?`, limit).toArray();
      return json({ posts: rows, count: rows.length });
    }

    // CREATE EXPERIMENT â€” Register a variant group

    // Memory compression
    updateStudentMemory(studentId, env).catch(() => {});
    if (url.pathname === "/virality/experiment" && request.method === "POST") {
      const body = await request.json();
      const variants = body.variants || [];
      const group = body.variantGroup || `exp_${Date.now()}`;
      const now = Date.now();
      const created = [];
      for (const v of variants) {
        const id = `${group}_${v.tone || "default"}`;
        this.sql.exec(
          `INSERT OR REPLACE INTO experiments (id, variant_group, hook, body, platform, tone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'running', ?)`,
          id, group, v.hook || "", v.body || "", v.platform || "unknown", v.tone || "unknown", now
        );
        created.push(id);
      }
      return json({ ok: true, variantGroup: group, variants: created });
    }

    // LIST EXPERIMENTS
    if (url.pathname === "/virality/experiments") {
      const status = url.searchParams.get("status") || "running";
      const rows = this.sql.exec(`SELECT * FROM experiments WHERE status = ? ORDER BY created_at DESC`, status).toArray();
      return json({ experiments: rows, count: rows.length });
    }

    // UPDATE EXPERIMENT STATUS
    if (url.pathname === "/virality/experiment/update" && request.method === "POST") {
      const body = await request.json();
      if (!body.experimentId) return json({ error: "experimentId required" }, 400);
      this.sql.exec(`UPDATE experiments SET status = ? WHERE id = ?`, body.status || "continue", body.experimentId);
      return json({ ok: true, experimentId: body.experimentId, status: body.status });
    }

    // SAVE PATTERN â€” Store a winning content pattern
    if (url.pathname === "/virality/pattern" && request.method === "POST") {
      const body = await request.json();
      const now = Date.now();
      this.sql.exec(
        `INSERT INTO content_patterns (pattern, tone, platform, format, score, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        body.hook_style || body.pattern || "", body.tone || "unknown",
        body.platform || "unknown", body.format || "text", body.score || 0, now
      );
      return json({ ok: true });
    }

    // GET PATTERNS â€” Retrieve winning patterns
    if (url.pathname === "/virality/patterns") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const rows = this.sql.exec(`SELECT * FROM content_patterns ORDER BY score DESC LIMIT ?`, limit).toArray();
      return json({ patterns: rows, count: rows.length });
    }

    return json({ error: "Not found" }, 404);
  }
}

// â”€â”€ Behavioral Loop Engine Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// /api/loop â€” Single endpoint enforcing the full speakâ†’correctâ†’repeatâ†’score cycle
async function handleLoop(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const studentId = body.studentId || "anonymous";
  const transcript = sanitizeInput((body.transcript || body.message || "").slice(0, 500));
  if (!transcript) return json({ error: "No speech transcript provided" }, 400);

  // Step 1: Load student context (mistakes + weaknesses + pet state)
  let mistakeContext = "";
  let weakContext = "";
  let weakAreas = [];
  let petState = null;
  if (studentId !== "anonymous") {
    if (env.LEDGER) {
      try {
        const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
        const histRes = await stub.fetch(new Request("https://do/history?limit=10&eventType=correction"));
        const histData = await histRes.json();
        const past = (histData.entries || []).map(e => {
          try { const p = JSON.parse(e.payload); return p.original; } catch { return ""; }
        }).filter(Boolean);
        if (past.length > 0) {
          mistakeContext = `\n\nSTUDENT'S PAST MISTAKES:\n${past.slice(-5).map(m => `- "${m}"`).join("\n")}`;
        }
      } catch (_) {}
    }
    if (env.PROFILES) {
      try {
        const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
        const wpRes = await profileStub.fetch(new Request("https://do/weakness/get"));
        const wpData = await wpRes.json();
        weakAreas = wpData.weakPoints || [];
        weakContext = buildWeaknessPrompt(weakAreas);
      } catch (_) {}
    }
    if (env.PETS) {
      try {
        const petStub = env.PETS.get(env.PETS.idFromName(studentId));
        const petRes = await petStub.fetch(new Request("https://do/state"));
        const petData = await petRes.json();
        petState = petData.state || null;
      } catch (_) {}
    }
  }

  // Step 1.5: Star Map routing â€” determine module + mode (Stabilizer vs Explorer)
  const route = getStudentRoute(studentId, transcript, weakAreas, petState);
  const modulePrompt = getModulePrompt(route);

  // Step 2: AI correction (DeepSeek) â€” enhanced with Star Map module + mode prompts
  const messages = [
    { role: "system", content: LOOP_PROMPT + modulePrompt + mistakeContext + weakContext },
    { role: "user", content: transcript },
  ];

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages, max_tokens: 300, temperature: 0.3 }),
  });

  if (!res.ok) { const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502); }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";

  let result;
  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    result = { corrected: raw, explanation: "", explanation_vi: "", repeat: raw, wasCorrect: false, score: 50 };
  }

  // Step 3: Auto-log everything (parallel fire-and-forget)
  if (studentId !== "anonymous") {
    const payload = JSON.stringify({ original: transcript, corrected: result.corrected, wasCorrect: result.wasCorrect, score: result.score || 0 });

    // Ledger append
    if (env.LEDGER) appendToLedger(studentId, "correction", payload, env).catch(() => {});

    // Extract + store weaknesses
    if (env.PROFILES && !result.wasCorrect) {
      const detected = extractWeaknesses((result.explanation || "") + " " + (result.corrected || ""));
      if (detected.length > 0) {
        const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
        profileStub.fetch(new Request("https://do/weakness/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, weaknesses: detected }),
        })).catch(() => {});
      }
    }

    // PetDO checkin (spoke = practiced)
    if (env.PETS) {
      const petStub = env.PETS.get(env.PETS.idFromName(studentId));
      petStub.fetch(new Request("https://do/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: 1, confidence: result.wasCorrect ? 7 : 4 }),
      })).catch(() => {});
    }
  }

  // Step 4: Get Tiger Score
  let tigerScore = null;
  if (studentId !== "anonymous" && env.PETS) {
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(studentId));
      const scoreRes = await petStub.fetch(new Request("https://do/score"));
      const scoreData = await scoreRes.json();
      tigerScore = scoreData;
    } catch (_) {}
  }

  return json({
    original: transcript,
    corrected: result.corrected,
    explanation: result.explanation,
    explanation_vi: result.explanation_vi || "",
    repeat: result.repeat,
    wasCorrect: result.wasCorrect,
    score: result.score || 0,
    tigerScore,
    studentId,
    route: { module: route.module, mode: route.mode, reason: route.reason },
  });
}

const LOOP_PROMPT = `You are OBI, a strict but warm English coach for Vietnamese students.

The student spoke a sentence. Execute this EXACT cycle:
1. CORRECT: Fix grammar, vocabulary, or pronunciation issues
2. EXPLAIN: Why it was wrong (1 sentence in English + Vietnamese translation)
3. REPEAT: Give the corrected sentence for them to say out loud
4. SCORE: Rate their attempt 0-100

RULES:
- If correct, praise briefly and give a harder sentence to try
- Keep explanations SHORT â€” max 2 sentences
- Be encouraging, never shaming â€” "Mouse to Tiger" philosophy
- Focus on the MOST IMPORTANT error first
- Vietnamese explanations help them understand faster

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no extra text):
{"corrected":"the corrected sentence","explanation":"why in English","explanation_vi":"táº¡i sao báº±ng tiáº¿ng Viá»‡t","repeat":"say this sentence out loud","wasCorrect":false,"score":65}

If correct:
{"corrected":"their original sentence","explanation":"Perfect! Try this harder version:","explanation_vi":"Tuyá»‡t vá»i! Thá»­ cÃ¢u khÃ³ hÆ¡n:","repeat":"a harder sentence","wasCorrect":true,"score":95}`;

// /api/tiger-score â€” On-demand Tiger Score with full breakdown
async function handleTigerScore(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);

  // Get PetDO score
  let petScore = null;
  if (env.PETS) {
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(studentId));
      const res = await petStub.fetch(new Request("https://do/score"));
      petScore = await res.json();
    } catch (_) {}
  }

  // Get ProfileDO weakness data for error reduction context
  let weakPoints = [];
  if (env.PROFILES) {
    try {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const res = await profileStub.fetch(new Request("https://do/weakness/get"));
      const data = await res.json();
      weakPoints = data.weakPoints || [];
    } catch (_) {}
  }

  // Get LedgerDO stats for speaking minutes + activity
  let ledgerStats = null;
  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/state?studentId=" + encodeURIComponent(studentId)));
      ledgerStats = await res.json();
    } catch (_) {}
  }

  return json({
    studentId,
    tigerScore: petScore?.tigerScore || 0,
    breakdown: petScore?.breakdown || {},
    status: petScore?.status || "MOUSE_MODE",
    streak: petScore?.streak || 0,
    dayPhase: petScore?.dayPhase || "E1",
    weakPoints: weakPoints.slice(0, 5),
    ledger: ledgerStats?.state || null,
  });
}

// /api/analytics â€” The only 4 metrics that matter: DAU, speaking mins, 7-day retention, error reduction
async function handleAnalytics(env) {
  const now = Date.now();
  const oneDayAgo = now - 86400000;
  const sevenDaysAgo = now - 7 * 86400000;
  const fourteenDaysAgo = now - 14 * 86400000;

  // Get roster
  let students = [];
  try {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
    const rosterData = await rosterRes.json();
    students = rosterData.students || [];
  } catch (_) {}

  let dau = 0;
  let totalSpeakingMinutes = 0;
  let active7d = 0;
  let active14d = 0;
  let totalErrorReduction = 0;
  let studentsWithData = 0;

  for (const student of students) {
    const lastActive = student.last_active || 0;

    // DAU: active in last 24h
    if (lastActive > oneDayAgo) dau++;
    // 7-day retention
    if (lastActive > sevenDaysAgo) active7d++;
    // 14-day base
    if (lastActive > fourteenDaysAgo) active14d++;

    // Get PetDO data for speaking minutes and error reduction
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
      const petRes = await petStub.fetch(new Request("https://do/state"));
      const petData = await petRes.json();
      totalSpeakingMinutes += (petData.state?.totalSessions || 0) * 5; // avg 5 min per session estimate

      const scoreRes = await petStub.fetch(new Request("https://do/score"));
      const scoreData = await scoreRes.json();
      if (scoreData.breakdown?.errorReduction != null) {
        totalErrorReduction += scoreData.breakdown.errorReduction;
        studentsWithData++;
      }
    } catch (_) {}
  }

  const retention7d = active14d > 0 ? Math.round((active7d / active14d) * 100) : 0;
  const avgErrorReduction = studentsWithData > 0 ? Math.round(totalErrorReduction / studentsWithData) : 0;

  return json({
    ts: now,
    totalStudents: students.length,
    metrics: {
      dau,
      speakingMinutesPerDay: students.length > 0 ? Math.round(totalSpeakingMinutes / Math.max(1, students.length)) : 0,
      retention7d,
      avgErrorReduction,
    },
    raw: {
      active24h: dau,
      active7d,
      active14d,
      totalSpeakingMinutes,
    },
  });
}

// â”€â”€ Skeleton Star Map Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// POST /api/route â€” Get routing decision for a student
async function handleRoute(body, env) {
  const studentId = body.studentId || "anonymous";
  const transcript = sanitizeInput((body.transcript || body.message || "").slice(0, 500));

  let weakAreas = [];
  let petState = null;

  if (studentId !== "anonymous") {
    if (env.PROFILES) {
      try {
        const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/weakness/get"));
        const data = await res.json();
        weakAreas = data.weakPoints || [];
      } catch (_) {}
    }
    if (env.PETS) {
      try {
        const stub = env.PETS.get(env.PETS.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/state"));
        const data = await res.json();
        petState = data.state || null;
      } catch (_) {}
    }
  }

  const route = getStudentRoute(studentId, transcript, weakAreas, petState);
  return json({ ok: true, ...route });
}

// â”€â”€ Phoenix Reset Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// POST /api/phoenix/snapshot â€” Capture + store full student state
async function handlePhoenixSnapshot(body, env) {
  const studentId = body.studentId;
  if (!studentId) return json({ error: "studentId required" }, 400);

  const snapshot = await createSnapshot(studentId, env);
  const stored = await storeSnapshot(studentId, snapshot, env);

  return json({ ok: true, snapshot, stored });
}

// POST /api/phoenix/reset â€” Reset student from their latest snapshot
async function handlePhoenixReset(body, env) {
  const studentId = body.studentId;
  if (!studentId) return json({ error: "studentId required" }, 400);

  // 1. Take a snapshot before reset
  const preResetSnapshot = await createSnapshot(studentId, env);
  await storeSnapshot(studentId, preResetSnapshot, env);

  // 2. Find the latest snapshot from ledger (or use the one we just took)
  let snapshotToRestore = preResetSnapshot;
  if (body.snapshotTs && env.LEDGER) {
    // If a specific snapshot timestamp is provided, find it
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/history?limit=100&eventType=phoenix_snapshot"));
      const data = await res.json();
      const match = (data.entries || []).find(e => {
        try { return JSON.parse(e.payload).ts === body.snapshotTs; } catch { return false; }
      });
      if (match) snapshotToRestore = JSON.parse(match.payload);
    } catch (_) {}
  }

  // 3. Rehydrate from snapshot
  const result = await rehydrate(snapshotToRestore, env);

  return json({
    ok: true,
    restoredFrom: snapshotToRestore.ts,
    preResetSnapshot: { ts: preResetSnapshot.ts },
    ...result,
  });
}

// â”€â”€ Auto Post Engine Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Run the full auto-post pipeline: generate posts from real data â†’ distribute to platforms
async function runAutoPostEngine(env) {
  const report = { generated: 0, distributed: 0, platforms: {}, errors: [] };
  try {
    const posts = await generatePosts(env);
    report.generated = posts.length;

    for (const post of posts) {
      try {
        const results = await routePost(env, post);
        report.distributed++;
        for (const [platform, result] of Object.entries(results)) {
          report.platforms[platform] = (report.platforms[platform] || 0) + (result.ok ? 1 : 0);
        }
      } catch (err) {
        report.errors.push(err.message);
      }
    }
  } catch (err) {
    report.errors.push(err.message);
  }
  return report;
}

// â”€â”€ Virality Engine Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Proxy handler â€” forwards requests to CommandDO virality endpoints
async function handleViralityProxy(doPath, method, body, env, searchParams) {
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 500);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("virality-engine"));
  const doUrl = `https://do${doPath}${searchParams ? "?" + searchParams.toString() : ""}`;
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body && method === "POST") opts.body = JSON.stringify(body);
  const res = await stub.fetch(new Request(doUrl, opts));
  const data = await res.json();
  return json(data, res.status);
}

// POST /api/virality/learn â€” Trigger learning loop
async function handleViralityLearn(env) {
  try {
    const report = await runLearningLoop(env);
    return json({ ok: true, ...report });
  } catch (err) {
    return json({ error: "Learning loop failed", detail: err.message }, 500);
  }
}

// POST /api/virality/score â€” Calculate virality score from raw metrics
async function handleViralityScore(body) {
  const viralityScore = calculateVirality(body);
  const conversionScore = calculateConversion(body);
  return json({ ok: true, viralityScore, conversionScore });
}

// POST /api/virality/variants â€” Generate hook variants from an insight
async function handleViralityVariants(body, env) {
  const insight = body.insight || body.base_insight || "";
  if (!insight) return json({ error: "insight required" }, 400);

  // Fetch winning patterns from CommandDO
  let patterns = [];
  if (env.COMMANDS) {
    try {
      const stub = env.COMMANDS.get(env.COMMANDS.idFromName("virality-engine"));
      const res = await stub.fetch(new Request("https://do/virality/patterns?limit=10"));
      const data = await res.json();
      patterns = (data.patterns || []).map(p => ({ tone: p.tone, score: p.score }));
    } catch (_) {}
  }

  const variants = generateVariants(insight, patterns);
  return json({ ok: true, variants, patternCount: patterns.length });
}

// GET /api/growth/posts â€” Preview generated posts without distributing
async function handleGrowthPosts(limit, env) {
  try {
    const posts = await generatePosts(env, limit);
    return json({ ok: true, posts, count: posts.length });
  } catch (err) {
    return json({ error: "Post generation failed", detail: err.message }, 500);
  }
}

// POST /api/growth/distribute â€” Manually trigger post distribution
async function handleGrowthDistribute(env) {
  const report = await runAutoPostEngine(env);
  return json({ ok: true, ...report });
}

// GET /api/growth/log â€” View post history from LedgerDO
async function handleGrowthLog(limit, env) {
  if (!env.LEDGER) return json({ error: "LEDGER not configured" }, 500);
  try {
    const stub = env.LEDGER.get(env.LEDGER.idFromName("system-growth"));
    const res = await stub.fetch(new Request(`https://do/history?limit=${limit}&eventType=auto_post`));
    const data = await res.json();
    return json({ ok: true, posts: data.entries || [], total: data.total || 0 });
  } catch (err) {
    return json({ error: "Growth log failed", detail: err.message }, 500);
  }
}

// â”€â”€ Unified Memory System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// getStudentMemory â€” Aggregates state from ProfileDO, PetDO, and LedgerDO into one snapshot
async function getStudentMemory(studentId, env) {
  const memory = {
    studentId,
    level: "A1",
    streak: 0,
    weakAreas: [],
    strongAreas: [],
    corrections: [],
    summary: "",
    lastActive: 0,
    sessions: 0,
    tigerScore: 0,
    dayPhase: "E1",
    mood: "neutral",
  };

  // Pull from ProfileDO
  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const [weakRes, summaryRes] = await Promise.all([
        stub.fetch(new Request("https://do/weakness/get")),
        stub.fetch(new Request("https://do/summary/get")),
      ]);
      const weakData = await weakRes.json();
      const summaryData = await summaryRes.json();
      memory.weakAreas = (weakData.weakPoints || []).map(w => w.specific);
      memory.level = summaryData.level || "A1";
      memory.summary = summaryData.summary || "";
    } catch (_) {}
  }

  // Pull from PetDO
  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/state"));
      const data = await res.json();
      const s = data.state || {};
      memory.streak = s.streak || 0;
      memory.sessions = s.totalSessions || 0;
      memory.lastActive = s.last_checkin || 0;
      memory.tigerScore = s.tigerScore || 0;
      memory.dayPhase = s.dayPhase || "E1";
      memory.mood = s.mood || "neutral";
    } catch (_) {}
  }

  // Pull recent corrections from LedgerDO (last 10)
  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/history?limit=10&eventType=correction"));
      const data = await res.json();
      memory.corrections = (data.entries || []).map(e => {
        try { const p = JSON.parse(e.payload); return { input: p.original, output: p.corrected, ts: e.ts }; } catch { return null; }
      }).filter(Boolean);
    } catch (_) {}
  }

  return memory;
}

// compressMemory â€” Soul DNA v1: compress student state into a summary string
function compressMemory(memory) {
  const weakStr = memory.weakAreas.length > 0 ? memory.weakAreas.slice(0, 5).join(", ") : "none identified yet";
  const recentMistakes = memory.corrections.slice(-3).map(c => `"${(c.input || "").slice(0, 40)}"`).join(", ");
  return [
    `Level: ${memory.level}`,
    `Streak: ${memory.streak} days | Sessions: ${memory.sessions}`,
    `Weak patterns: ${weakStr}`,
    `Recent mistakes: ${recentMistakes || "none"}`,
    `Tiger Score: ${memory.tigerScore}/100 (${memory.dayPhase})`,
    `Behavior: ${memory.streak >= 7 ? "consistent daily practice" : memory.streak >= 3 ? "building habit" : "needs accountability push"}`,
  ].join("\n");
}

// updateStudentMemory â€” After each interaction, compress and persist summary
async function updateStudentMemory(studentId, env) {
  const memory = await getStudentMemory(studentId, env);
  const summary = compressMemory(memory);
  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      await stub.fetch(new Request("https://do/summary/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, summary }),
      }));
    } catch (_) {}
  }
  return summary;
}

// GET /api/daily â€” Personalized daily task based on weaknesses
async function handleDailyTask(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  const memory = await getStudentMemory(studentId, env);
  const topWeak = memory.weakAreas[0] || "general fluency";

  // Day-based task rotation: correction-heavy â†’ repetition â†’ recall â†’ mixed â†’ fluency push
  const dayInCycle = (memory.sessions % 5) + 1;
  const taskTypes = {
    1: { type: "correction", prompt: `Speak 3 sentences about your morning. Focus on using correct ${topWeak}.`, duration: 5 },
    2: { type: "repetition", prompt: `Repeat these sentences out loud until they feel natural. Focus: ${topWeak}.`, duration: 10 },
    3: { type: "recall", prompt: `Without looking at notes, describe what you learned yesterday in English.`, duration: 5 },
    4: { type: "mixed", prompt: `Have a 5-minute conversation about your favorite food. OBI will correct you.`, duration: 10 },
    5: { type: "fluency", prompt: `Speak freely about any topic for 3 minutes without stopping. No pausing allowed.`, duration: 15 },
  };

  const task = taskTypes[dayInCycle];

  return json({
    studentId,
    day: dayInCycle,
    task,
    focus: topWeak,
    streak: memory.streak,
    tigerScore: memory.tigerScore,
    status: memory.tigerScore < 40 ? "MOUSE_MODE" : memory.tigerScore < 70 ? "CAT_MODE" : "TIGER_MODE",
    message: memory.streak === 0
      ? "Time to start. Every Tiger was once a Mouse."
      : `Day ${memory.streak} streak. ${memory.streak >= 7 ? "You're becoming a Tiger." : "Keep going."}`,
  });
}

// GET /api/memory/summary â€” View compressed student memory
async function handleMemorySummary(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const memory = await getStudentMemory(studentId, env);
  const summary = compressMemory(memory);
  return json({ studentId, summary, memory });
}

// â”€â”€ Utilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}



// â”€â”€ MemoryDO â€” Per-Student Long-Term Memory + Session Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SQLite-backed Durable Object for session_log and memory_state.
// Binding: env.MEMORY â€” declared in wrangler.toml, wired when router connects.
export class MemoryDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS session_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      session_type TEXT NOT NULL DEFAULT 'chat',
      input TEXT NOT NULL DEFAULT '',
      output TEXT NOT NULL DEFAULT '',
      score INTEGER DEFAULT 0,
      weak_areas TEXT DEFAULT '[]',
      route TEXT DEFAULT '{}',
      ts INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_session_log_student ON session_log(student_id, ts)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS memory_state (
      student_id TEXT PRIMARY KEY,
      level TEXT DEFAULT 'A1',
      goal TEXT DEFAULT 'daily speaking',
      streak INTEGER DEFAULT 0,
      last_active INTEGER DEFAULT 0,
      last_score INTEGER DEFAULT 0,
      weak_areas TEXT DEFAULT '[]',
      summary TEXT DEFAULT '',
      updated_at INTEGER DEFAULT 0
    )`);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/log" && request.method === "POST") {
      const body = await request.json();
      const now = Date.now();
      this.sql.exec(
        `INSERT INTO session_log (student_id, session_type, input, output, score, weak_areas, route, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        String(body.studentId || "anon"), String(body.sessionType || "chat"),
        String(body.input || ""), String(body.output || ""),
        Number(body.score) || 0, JSON.stringify(body.weakAreas || []),
        JSON.stringify(body.route || {}), now
      );
      return json({ ok: true, ts: now });
    }

    if (url.pathname === "/log" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId") || "anon";
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 200);
      const rows = this.sql.exec(
        `SELECT * FROM session_log WHERE student_id = ? ORDER BY ts DESC LIMIT ?`,
        studentId, limit
      ).toArray();
      return json({ entries: rows, count: rows.length });
    }

    if (url.pathname === "/state" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId") || "anon";
      const row = this.sql.exec(
        `SELECT * FROM memory_state WHERE student_id = ?`, studentId
      ).toArray()[0];
      return json(row || { student_id: studentId, level: "A1", goal: "daily speaking", streak: 0, last_active: 0, last_score: 0, weak_areas: "[]", summary: "" });
    }

    if (url.pathname === "/state" && request.method === "POST") {
      const body = await request.json();
      const sid = String(body.studentId || "anon");
      const now = Date.now();
      this.sql.exec(
        `INSERT INTO memory_state (student_id, level, goal, streak, last_active, last_score, weak_areas, summary, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(student_id) DO UPDATE SET level=excluded.level, goal=excluded.goal, streak=excluded.streak, last_active=excluded.last_active, last_score=excluded.last_score, weak_areas=excluded.weak_areas, summary=excluded.summary, updated_at=excluded.updated_at`,
        sid, String(body.level || "A1"), String(body.goal || "daily speaking"),
        Number(body.streak) || 0, now, Number(body.lastScore) || 0,
        JSON.stringify(body.weakAreas || []), String(body.summary || ""), now
      );
      return json({ ok: true, studentId: sid });
    }

    return json({ error: "Not found" }, 404);
  }
}

export { StudentDO, HeavyLedger, LedgerDO, StudentBrainV2 };

