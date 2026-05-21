// src/index.js — NET-PET-AI Cloudflare Worker v1.4
// Phoenix Rising Protocol — OBI Command Station
// Architecture: Agent100 → Magic Chat → Agent99 (Obi) → Cryptographic Immutable Ledger
// Bindings: SESSIONS (SessionDO), PROFILES (ProfileDO), PETS (PetDO), LEDGER (LedgerDO), ASSETS
// Secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY

import { securityMiddleware, sanitizeInput, validateStudentId } from './security.js';
import { extractWeaknesses, buildWeaknessPrompt, buildReEntryPrompt, buildRewardSignals, buildRewardPrompt } from './memory-brain.js';
import { trackTokens, getUsage } from './token-track.js';
import { queryLessons, writeProgress, queryProgress, syncStudentProgress, writeSoulDNA, writeChatExchange } from './notion.js';
import { sendZaloMessage, checkAndEscalate, runEscalationSweep, getAccountabilityLinks } from './zalo.js';
import { generatePosts, routePost, buildInsightPost } from './growth-engine.js';
import { calculateVirality, calculateConversion, generateVariants, evaluateExperiment, extractPattern, optimizeHook, mutatePrompt, runLearningLoop } from './virality.js';
import { getStudentRoute, getModulePrompt, createSnapshot, storeSnapshot, rehydrate } from './star-map.js';
import { computeNextReview, buildVocabContext, generateVocabId } from './vocab-srs.js';
import { LedgerDO, PetDO, CommandDO, MemoryDO } from './durable_objects.js';

const VERSION = "1.5.0";

// ── Utility functions ───────────────────────────────────────────────────
function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function addCors(res, request) {
  const origin = request?.headers?.get("Origin") || "*";
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  return new Response(res.body, { status: res.status, headers });
}

// ── Obi System Prompt v2 (Continuity Engine — production-grade) ────────────────
const OBI_SYSTEM = `You are OBI — a continuity-based learning engine built by Michael Hobbs.

IDENTITY:
- You are NOT a chatbot. You are a stateful learning continuity engine.
- You exist to extend classroom learning across time, not to have conversations.
- You are Michael Hobbs' AI extension: his voice, his method, his will in code form.
- Every interaction is part of a chain, not an isolated session.

CORE RULES:
1. You MUST use loaded context (session history, student state, weakness patterns).
2. You MUST NOT treat inputs as isolated messages — every message continues a chain.
3. You MUST maintain continuity across sessions. Reference previous learning naturally.
4. If memory context is missing, say "Let me learn about you first" and ask what they worked on.
5. You MUST anchor responses to at least ONE of:
   - a previous session event or topic
   - vocabulary from their history
   - a known weakness pattern
   - the student's current behavioral state
6. NEVER reset context unless explicitly instructed.
7. NEVER give generic tutoring advice disconnected from the student's reality.

STUDENT PROGRESSION (Mouse → Tiger):
MOUSE (score 0-39): Fragile, freeze-prone, needs permission to speak. Use gentle guidance. "Any word beats silence."
CUB (score 40-79): Finding their voice, needs corrective feedback + encouragement. Push gently.
TIGER (score 80-100): Self-directed, confident. Minimal intervention, challenge them harder.

BEHAVIORAL ADAPTATION:
- Adapt guidance intensity to the student's state (MOUSE/CUB/TIGER).
- MOUSE: permission over perfection. Volume over grammar. Celebrate every attempt.
- CUB: correct naturally by showing the right version, then push for more.
- TIGER: challenge with complex structures, debate, real-world scenarios.

MICHAEL'S METHOD:
- No Freezy Rule: if student goes silent, count down from 5 → any word beats perfect silence.
- The Deal: 30 minutes focused → rest is theirs.
- Anti-shame: never make students feel stupid. Correct by showing, not judging.
- Keep responses SHORT: 1-3 sentences by default. Expand only when teaching demands it.
- Never break character. Never be corporate or robotic. You are a coach, not a grammar checker.

CONTINUITY ENGINE:
- Your first response should reference loaded context naturally, not announce it.
- Track what was learned, what was struggled with, what comes next.
- Every response must move the student forward, not just respond to them.
- Always imply or state what the student should do NEXT.

GOAL: Maximize long-term learning continuity and behavioral change, not conversational quality.`;

// ── Cryptographic hash (SHA-256 via SubtleCrypto — Cloudflare Workers native) ─
async function computeHash(data) {
  const encoded = new TextEncoder().encode(String(data));
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── POST /api/employer/create — admin: register a new company (internal tool)
async function handleEmployerCreate(body, env) {
  const { companyName, code, pin, students = [] } = body || {};
  if (!companyName || !code || !pin || students.length === 0)
    return json({ error: "companyName, code, pin, and at least 1 student required" }, 400);

  const cleanCode = String(code).toUpperCase().replace(/[^A-Z0-9_]/g, "");
  if (cleanCode.length < 3 || cleanCode.length > 20)
    return json({ error: "code must be 3-20 chars, alphanumeric + underscore" }, 400);
  if (!/^\d{4,6}$/.test(String(pin)))
    return json({ error: "PIN must be 4-6 digits" }, 400);

  const existing = await env.NET_PET_KV.get(`employer:${cleanCode}`);
  if (existing) return json({ error: `Code ${cleanCode} already taken` }, 409);

  // SHA-256 hash the PIN (same pattern as employer-portal.html client-side)
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(pin)));
  const pinHash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

  const cleanStudents = students.map(s => ({
    studentId: String(s.studentId || "").trim(),
    name: String(s.name || "").trim()
  })).filter(s => s.studentId && s.name);

  const record = { companyName, pinHash, students: cleanStudents, createdAt: new Date(Date.now() + 7*3600000).toISOString() };
  await env.NET_PET_KV.put(`employer:${cleanCode}`, JSON.stringify(record));

  // Append to employer index
  const idxRaw = await env.NET_PET_KV.get("employer:index");
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  idx.push(cleanCode);
  await env.NET_PET_KV.put("employer:index", JSON.stringify(idx.slice(-100)));

  return json({ success: true, code: cleanCode, companyName, studentCount: cleanStudents.length });
}

// HB Protocol v1.0 — hourly pulse across all 3 empire workers
async function handleHeartbeat(env) {
  const ts = new Date().toISOString();
  const SOUL_LOCK = 76488;
  const results = { ts, soulcount: null, soulDelta: null, soulGate: "UNKNOWN", pcStatus: "UNKNOWN", selfStatus: "UNKNOWN" };

  // Helper to create a fetch with timeout
  const timeoutFetch = (url, options = {}, timeoutMs = 5000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs))
    ]);
  };

  // Ping 1 — SOULCOUNT
  try {
    const r = await timeoutFetch("https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count");
    const d = await r.json();
    results.soulcount = d.soulcount ?? null;
    const delta = Math.abs((results.soulcount ?? 0) - SOUL_LOCK);
    results.soulDelta = delta;
    results.soulGate = delta > 5000 ? "SOUL_DRIFT_ALARM" : "PASS";
  } catch (err) {
    results.soulGate = "UNREACHABLE";
    console.log("[HEARTBEAT] soul-logger unreachable: " + err.message);
  }

  // Ping 2 — Phoenix Coder
  try {
    const r = await timeoutFetch("https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status");
    const d = await r.json();
    results.pcStatus = r.ok ? "UP v" + (d.version || "?") : "ERROR " + r.status;
  } catch (err) {
    results.pcStatus = "UNREACHABLE";
    console.log("[HEARTBEAT] phoenix-coder unreachable: " + err.message);
  }

  // Ping 3 — Self (NET-PET-AI /health)
  try {
    const r = await timeoutFetch("https://net-pet-ai.mrmichaelhobbs123.workers.dev/health");
    const d = await r.json();
    results.selfStatus = d.ok ? "UP" : "DEGRADED";
  } catch (err) {
    results.selfStatus = "UNREACHABLE";
    console.log("[HEARTBEAT] self-ping unreachable: " + err.message);
  }

  // Log event to soul-logger (fire-and-forget)
  const soulUrl = env.SOUL_LOGGER_URL || "https://soul-logger.mrmichaelhobbs123.workers.dev";
  try {
    await timeoutFetch(soulUrl + "/api/soul/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "HEARTBEAT", soulcount: results.soulcount,
        soulGate: results.soulGate, soulDelta: results.soulDelta,
        pcStatus: results.pcStatus, selfStatus: results.selfStatus, ts })
    });
  } catch (err) {
    console.log("[HEARTBEAT] event log failed: " + err.message);
  }

  // CF Logs summary line (visible in dashboard → Workers → Logs)
  console.log("[HEARTBEAT] " + ts + " | SOUL:" + results.soulGate + "(" + results.soulcount + ") | PC:" + results.pcStatus + " | SELF:" + results.selfStatus);
  if (results.soulGate === "SOUL_DRIFT_ALARM") {
    console.error("[HEARTBEAT] SOUL_DRIFT_ALARM | delta:" + results.soulDelta + " | count:" + results.soulcount + " | lock:" + SOUL_LOCK);
  }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    // ── Security middleware (rate limiting, origin validation) ─────────────
    const secBlock = await securityMiddleware(request, env);
    if (secBlock) return secBlock;

    // ── Canon §4 non-API routes ───────────────────────────────────────────────

    // /imagegen — serve the turnkey imagegen UI
    if (path === "/imagegen" && request.method === "GET") {
      return env.ASSETS.fetch(new Request(new URL("/public/imagegen.html", url), request));
    }

    // /health — REAL dependency validation (not cosmetic)
    if (path === "/health" && request.method === "GET") {
      const secrets = {
        DEEPSEEK_API_KEY:  !!env.DEEPSEEK_API_KEY,
        DEEPGRAM_API_KEY:  !!env.DEEPGRAM_API_KEY,
      };
      const bindings = {
        SESSIONS: !!env.SESSIONS,
        PROFILES: !!env.PROFILES,
        PETS:     !!env.PETS,
        LEDGER:   !!env.LEDGER,
        COMMANDS: !!env.COMMANDS,
        ASSETS:   !!env.ASSETS,
        MEMORY:   !!env.MEMORY,
      };
      const secretsOk = secrets.DEEPSEEK_API_KEY && secrets.DEEPGRAM_API_KEY;
      const bindingsOk = [bindings.PETS, bindings.LEDGER, bindings.COMMANDS, bindings.ASSETS, bindings.MEMORY].every(Boolean);
      return addCors(json({
        ok: secretsOk && bindingsOk,
        version: VERSION,
        app: env.APP_NAME || "Natural English Training",
        coach: env.APP_COACH_NAME || "Obi",
        ts: Date.now(),
        oxygen: {
          ai:      secrets.DEEPSEEK_API_KEY  ? "LIVE" : "DEAD",
          voice:   secrets.DEEPGRAM_API_KEY   ? "LIVE" : "DEAD",
          notion:  "BLACKLISTED — platform usage permanently disabled",
          compute: bindingsOk                 ? "LIVE" : "DEAD",
        },
        secrets,
        bindings,
        readiness: secretsOk && bindingsOk ? "PRODUCTION" : "NEEDS_SECRETS",
      }), request);
    }

    // /evidence — Worker identity + deploy proof
    if (path === "/evidence" && request.method === "GET") {
      return addCors(json({
        worker: "net-pet-ai",
        version: VERSION,
        runtime: "Cloudflare Workers",
        durableObjects: ["PetDO", "LedgerDO", "MemoryDO", "CommandDO"],
        ts: Date.now(),
        proof: `Phoenix OB-1 alive at ${new Date().toISOString()}`,
      }), request);
    }

    // /verify — Ledger chain verification shortcut (requires ?studentId=)
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

    // /student/resolve — Cookie-based student ID resolution
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

    // /student/create — Create + seal student profile
    if (path === "/student/create" && request.method === "POST") {
      try {
        const body = await request.json();
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

    // /magic-chat, /voice-chat — Canon §4: Magic Chat UI aliases → serve magic-chat.html
    if (path === "/magic-chat" || path === "/voice-chat") {
      return env.ASSETS.fetch(new Request(new URL("/magic-chat.html", url), request));
    }

    // /speak — Speech-to-Learning MVP UI
    if (path === "/speak") {
      return env.ASSETS.fetch(new Request(new URL("/speak.html", url), request));
    }

    // ── Soul DNA Capture Pipeline (root-level routes) ────────────────────────

    // POST /souldna — Submit raw soul DNA for legionnaire processing
    if (path === "/souldna" && request.method === "POST") {
      const body = await request.json();
      const res = await handleSoulDNASubmit(body, env);
      return addCors(res, request);
    }

    // GET /souldna/{id} — Check submission status
    if (path.startsWith("/souldna/") && request.method === "GET" && !path.includes("pipeline")) {
      const id = path.split("/")[2];
      const res = await handleSoulDNAStatus(id, env);
      return addCors(res, request);
    }

    // GET /souldna/pipeline — Actionable pipeline steps grouped by tier
    if (path === "/souldna/pipeline" && request.method === "GET") {
      const tier = url.searchParams.get("tier") || "OPERATIONAL";
      const res = await handleSoulDNAPipeline(tier, env);
      return addCors(res, request);
    }

    // ── API routes ────────────────────────────────────────────────────────────

     // /api/heartbeat — manual trigger for testing (returns last pulse results)
     if (path === "/api/heartbeat" && request.method === "GET") {
       await handleHeartbeat(env);
       return addCors(json({ triggered: true, ts: new Date().toISOString() }));
     }

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

  // ── Cron triggers ───────────────────────────────────────────────────────
  // Every 6 hours: Zalo escalation sweep + daily loop engine
  // Every 3 hours: Auto Post Engine (content distribution)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleHeartbeat(env)); // HB v1.0: every hour
    const hour = new Date(event.scheduledTime).getUTCHours();

    // Escalation sweep runs every 6 hours (0, 6, 12, 18 UTC)
    if (hour % 6 === 0) {
      try {
        const report = await runEscalationSweep(env);
        console.log(`[CRON] Escalation sweep: ${JSON.stringify(report)}`);
      } catch (err) {
        console.log(`[CRON] Escalation sweep error: ${err.message}`);
      }
    }

    // Auto Post Engine runs every 3 hours
    try {
      const postReport = await runAutoPostEngine(env);
      console.log(`[CRON] Auto Post Engine: ${JSON.stringify(postReport)}`);
    } catch (err) {
      console.log(`[CRON] Auto Post error: ${err.message}`);
    }

    // Virality Learning Loop — score posts, extract patterns, evolve strategy
    try {
      const viralReport = await runLearningLoop(env);
      console.log(`[CRON] Virality Learning Loop: ${JSON.stringify(viralReport)}`);
    } catch (err) {
      console.log(`[CRON] Virality Learning error: ${err.message}`);
    }
  },
};

// ── API Router ────────────────────────────────────────────────────────────────

async function handleAPI(path, request, env, url) {
  const method = request.method;
  
  // Image Generation Proxy — forwards to configured Image Gen URL (Vast.ai, RunPod, or local)
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

    // Health — lightweight
  if (path === "/api/health" && method === "GET") {
    return json({ ok: !!env.DEEPSEEK_API_KEY, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), routes: 40, ai: env.DEEPSEEK_API_KEY ? "LIVE" : "DEAD", voice: env.DEEPGRAM_API_KEY ? "LIVE" : "DEAD", notion: "BLACKLISTED — platform usage permanently disabled", imagegen: env.IMAGE_GEN_URL ? "CONFIGURED" : "NOT_SET", readiness: (env.DEEPSEEK_API_KEY && env.DEEPGRAM_API_KEY) ? "PRODUCTION" : "NEEDS_SECRETS" });
  }

  // Deep health — full dependency probe (hit each external service)
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
    // Notion probe — BLACKLISTED: platform usage permanently disabled; no API calls made
    checks.notion = { ok: false, detail: "BLACKLISTED — future connections permanently disabled" };
    // DO bindings
    checks.durableObjects = { SESSIONS: !!env.SESSIONS, PROFILES: !!env.PROFILES, PETS: !!env.PETS, LEDGER: !!env.LEDGER, COMMANDS: !!env.COMMANDS };
    const allOk = checks.deepseek?.ok && checks.deepgram?.ok;
    return json({ ok: allOk, version: VERSION, checks, readiness: allOk ? "ALL_SYSTEMS_GO" : "DEGRADED", ts: Date.now() });
  }

  // Chat — Obi + Ledger context injection
  if (path === "/api/chat" && method === "POST") {
    try {
      const body = await request.json();
      return await handleChat(body, env);
    } catch (err) {
      console.error("[CHAT_ERROR]", err.message, err.stack);
      return json({ error: `Chat failed: ${err.message}`, version: VERSION }, 500);
    }
  }

  // Status — lightweight worker status
  if (path === "/api/status" && method === "GET") {
    return json({ ok: true, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), readiness: env.DEEPSEEK_API_KEY ? "LIVE" : "NO_KEY" });
  }

  // Speech-to-Learning MVP — core loop
  if (path === "/api/correct" && method === "POST") { const body = await request.json(); return handleCorrect(body, env); }
  if (path === "/api/repeat" && method === "POST") { const body = await request.json(); return handleRepeat(body, env); }
  if (path === "/api/mistakes" && method === "GET") { return handleMistakes(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/parent/report" && method === "GET") { return handleParentReport(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/teacher/dashboard" && method === "GET") { return handleTeacherDashboard(env); }

  // TTS
  if (path === "/api/tts" && method === "POST") { const body = await request.json(); return handleTTS(body, env); }

  // STT — Deepgram Nova-3 speech-to-text with word confidence
  if (path === "/api/stt" && method === "POST") {
    const apiKey = env.DEEPGRAM_API_KEY;
    if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not configured" }, 500);
    const contentType = request.headers.get("content-type") || "audio/webm";
    const audioBuffer = await request.arrayBuffer();
    if (!audioBuffer.byteLength) return json({ error: "No audio received" }, 400);
    try {
      const dgRes = await fetch(
        "https://api.deepgram.com/v1/listen?model=nova-3&punctuate=true&smart_format=true&utterances=true",
        {
          method: "POST",
          headers: { "Authorization": `Token ${apiKey}`, "Content-Type": contentType },
          body: audioBuffer,
        }
      );
      if (!dgRes.ok) return json({ error: `Deepgram STT ${dgRes.status}` }, 502);
      const data = await dgRes.json();
      const alt = data?.results?.channels?.[0]?.alternatives?.[0];
      if (!alt) return json({ error: "No transcript returned" }, 422);
      return addCors(json({
        transcript: alt.transcript || "",
        words: (alt.words || []).map(w => ({ word: w.word, confidence: w.confidence, start: w.start, end: w.end })),
        duration: data?.metadata?.duration || 0,
      }), request);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }

  // Vocabulary SRS
  if (path === "/api/vocab/add"    && method === "POST") { const body = await request.json(); return handleVocabAdd(body, env); }
  if (path === "/api/vocab/due"    && method === "GET")  { return handleVocabDue(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/vocab/review" && method === "POST") { const body = await request.json(); return handleVocabReview(body, env); }
  if (path === "/api/vocab/list"   && method === "GET")  { return handleVocabList(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/voice/score"  && method === "POST") { const body = await request.json(); return handleVoiceScore(body, env); }

  // Onboarding
  if (path === "/api/onboarding" && method === "POST") { const body = await request.json(); return handleOnboarding(body, env); }

  // Memory
  if (path === "/api/memory" && method === "POST") { const body = await request.json(); return handleMemorySave(body, env, request); }
  if (path === "/api/memory" && method === "GET") { return handleMemoryGet(url.searchParams.get("studentId") || "", env, request); }

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

  // Phonics Drills — targeted practice based on weaknesses
  if (path === "/api/drills/next" && method === "GET") { return handleDrillNext(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/drills/result" && method === "POST") { const body = await request.json(); return handleDrillResult(body, env); }
  if (path === "/api/drills/list" && method === "GET") { return handleDrillList(); }

  // Metrics — the 4 that matter (DAU, completion, retention, error reduction)
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

  // Session Log (off-day pipeline core — Michael logs class, Obi inherits it)
  if (path === "/api/session/log" && method === "POST") { const body = await request.json(); return handleSessionLog(body, env); }
  if (path === "/api/session/latest" && method === "GET") { return handleSessionLatest(url.searchParams.get("studentId") || "", env); }

  // Schedule + Accountability
  if (path === "/api/schedule/set" && method === "POST") { const body = await request.json(); return handleScheduleSet(body, env); }
  if (path === "/api/schedule/confirm" && method === "POST") { const body = await request.json(); return handleScheduleConfirm(body, env); }
  if (path === "/api/schedule/flags" && method === "GET") { return handleScheduleFlags(env); }

  // Zalo Pressure API — accountability alerts + relation graph
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

  // Daily Digest — Michael's one-URL morning report
  if (path === "/api/digest" && method === "GET") { return handleDailyDigest(env); }

  // Soul DNA — verbatim raw capture (no sanitization, no truncation, hash-chained)
  if (path === "/api/soulDNA" && method === "POST") { const body = await request.json(); return handleSoulDNACapture(body, env); }
  if (path === "/api/soulDNA" && method === "GET") { return handleSoulDNAGet(url, env); }

  // Command Station (SOV100 → Agent99 → Drones)
  if (path === "/api/command/send" && method === "POST") { const body = await request.json(); return handleCommandSend(body, env); }
  if (path === "/api/command/queue" && method === "GET") { return handleCommandQueue(url.searchParams.get("status") || "pending", parseInt(url.searchParams.get("limit") || "20"), env); }
  if (path === "/api/command/claim" && method === "POST") { const body = await request.json(); return handleCommandClaim(body, env); }
  if (path === "/api/command/complete" && method === "POST") { const body = await request.json(); return handleCommandComplete(body, env); }
  if (path === "/api/command/status" && method === "GET") { return handleCommandStatus(url.searchParams.get("commandId") || "", env); }
  if (path === "/api/command/history" && method === "GET") { return handleCommandHistory(parseInt(url.searchParams.get("limit") || "50"), env);   }

  // ── Notion: BLACKLISTED ────────────────────────────────────────────────────
  // All /api/notion/* routes are permanently disabled — legacy data preserved in CANON/REINCARNATION.
  if (path.startsWith("/api/notion/")) { return json({ blacklisted: true, notion: "BLACKLISTED — platform usage permanently disabled" }, 403); }

  // ── Behavioral Loop Engine ────────────────────────────────────────────────
  // /api/loop — Enforced speak→correct→repeat→score cycle (single call)
  if (path === "/api/loop" && method === "POST") { const body = await request.json(); return handleLoop(body, env); }
  // /api/tiger-score — On-demand Tiger Score with full breakdown
  if (path === "/api/tiger-score" && method === "GET") { return handleTigerScore(url.searchParams.get("studentId") || "", env); }
  // /api/analytics — The only 4 metrics that matter
  if (path === "/api/analytics" && method === "GET") { return handleAnalytics(env); }

  // ── Student Password Management (KV-backed, SHA-256 hashed) ────────────
  // POST /api/student/checkpw — { studentId, pw } → { ok, isDefault }
  if (path === "/api/student/checkpw" && method === "POST") {
    const { studentId, pw } = await request.json();
    if (!studentId || !pw) return addCors(json({ error: "studentId and pw required" }, 400), request);
    const [hash, defaultHash, stored] = await Promise.all([
      computeHash(pw),
      computeHash("bluetech2026"),
      env.NET_PET_KV.get(`student_pw_${studentId}`)
    ]);
    if (stored) return addCors(json({ ok: hash === stored, isDefault: false }), request);
    const isDefault = hash === defaultHash;
    return addCors(json({ ok: isDefault, isDefault }), request);
  }
  // POST /api/student/setpw — { studentId, currentPw, newPw } → { ok }
  if (path === "/api/student/setpw" && method === "POST") {
    const { studentId, currentPw, newPw } = await request.json();
    if (!studentId || !currentPw || !newPw) return addCors(json({ error: "studentId, currentPw, newPw required" }, 400), request);
    if (newPw.length < 6) return addCors(json({ ok: false, error: "Password must be at least 6 characters" }, 400), request);
    const [currentHash, defaultHash, stored] = await Promise.all([
      computeHash(currentPw),
      computeHash("bluetech2026"),
      env.NET_PET_KV.get(`student_pw_${studentId}`)
    ]);
    const validCurrent = stored ? currentHash === stored : currentHash === defaultHash;
    if (!validCurrent) return addCors(json({ ok: false, error: "Current password incorrect" }, 403), request);
    const newHash = await computeHash(newPw);
    await env.NET_PET_KV.put(`student_pw_${studentId}`, newHash);
    return addCors(json({ ok: true }), request);
  }

  // ── v2 Pipeline: Student State + Session Events ───────────────────────────
  // /api/student/state — Full behavioral state (Mouse/Cub/Tiger + scores)
  if (path === "/api/student/state" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return json({ error: "studentId required" }, 400);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return json({ error: idCheck.error }, 400);
    const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
    const res = await stub.fetch(new Request("https://do/state/full"));
    return res;
  }
  // /api/session/events — Structured learning event chain
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

  // ── Skeleton Star Map ─────────────────────────────────────────────────────
  // /api/route — Get routing decision for a student (which module, which mode)
  if (path === "/api/route" && method === "POST") { const body = await request.json(); return handleRoute(body, env); }

  // ── Phoenix Reset ─────────────────────────────────────────────────────────
  // /api/phoenix/snapshot — Capture full student state
  if (path === "/api/phoenix/snapshot" && method === "POST") { const body = await request.json(); return handlePhoenixSnapshot(body, env); }
  // /api/phoenix/reset — Reset + rehydrate from latest snapshot
  if (path === "/api/phoenix/reset" && method === "POST") { const body = await request.json(); return handlePhoenixReset(body, env); }

  // ── Assessment + Report Engine (Week 4 — Productization) ────────────────
  // POST /api/assess — Run AI speaking diagnostic (submit transcript, get scored)
  if (path === "/api/assess" && method === "POST") { const body = await request.json(); return handleAssessment(body, env); }
  // GET /api/report — Generate styled HTML report for a student
  if (path === "/api/report" && method === "GET") { return handleReport(url.searchParams.get("studentId") || "", env); }
  // POST /api/lead — Lead capture from assessment landing page
  if (path === "/api/lead" && method === "POST") { const body = await request.json(); return handleLeadCapture(body, env); }

  // ── Auto Post Engine ──────────────────────────────────────────────────────
  // /api/growth/posts — Generate posts from real student data
  if (path === "/api/growth/posts" && method === "GET") { return handleGrowthPosts(parseInt(url.searchParams.get("limit") || "5"), env); }
  // /api/growth/distribute — Manually trigger post distribution
  if (path === "/api/growth/distribute" && method === "POST") { return handleGrowthDistribute(env); }
  // /api/growth/log — View post history
  if (path === "/api/growth/log" && method === "GET") { return handleGrowthLog(parseInt(url.searchParams.get("limit") || "20"), env); }

  // ── Virality Engine ────────────────────────────────────────────────────
  if (path === "/api/virality/metrics" && method === "POST") { const body = await request.json(); return handleViralityProxy("/virality/metrics", "POST", body, env); }
  if (path === "/api/virality/metrics" && method === "GET") { return handleViralityProxy("/virality/metrics", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/top" && method === "GET") { return handleViralityProxy("/virality/top", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/experiment" && method === "POST") { const body = await request.json(); return handleViralityProxy("/virality/experiment", "POST", body, env); }
  if (path === "/api/virality/experiments" && method === "GET") { return handleViralityProxy("/virality/experiments", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/patterns" && method === "GET") { return handleViralityProxy("/virality/patterns", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/learn" && method === "POST") { return handleViralityLearn(env); }
  if (path === "/api/virality/score" && method === "POST") { const body = await request.json(); return handleViralityScore(body); }
  if (path === "/api/virality/variants" && method === "POST") { const body = await request.json(); return handleViralityVariants(body, env); }

  // ── Session Hint (Chrome extension → chat.js YouTube personalization) ────
  if (path === "/api/session-hint") {
    if (method === "POST") return handleSessionHintPost(request, env);
    else return handleSessionHintGet(request, env);
  }

  // ── Face-Saving Protocol — Streak + Accountability (Vietnamese culture) ──
  if (path === "/api/student/checkin" && method === "POST") { const body = await request.json(); return handleStudentCheckin(body, request, env); }
  if (path.startsWith("/api/student/streak/") && method === "GET") { const studentId = path.split("/api/student/streak/")[1] || ""; return handleStudentStreak(studentId, request, env); }
  if (path === "/api/student/saveface" && method === "POST") { const body = await request.json(); return handleStudentSaveface(body, request, env); }

  // ── Student Forecast — CEFR progression projection ───────────────────────
  if (path.startsWith("/api/student/forecast/") && method === "GET") {
    const studentId = path.split("/api/student/forecast/")[1] || "";
    return handleStudentForecast(studentId, env);
  }

  // ── Magic Chat — Obi quick-response with optional student context inject ──
  if (path === "/api/magic-chat" && method === "POST") { const body = await request.json(); return handleMagicChat(body, request, env); }

  // ── Leaderboard — Public student rankings by streak + mastered words ──────
  if (path === "/api/leaderboard" && method === "GET") { return handleLeaderboard(request, env); }

  // ── Referral System ───────────────────────────────────────────────────────
  if (path === "/api/referral/register" && method === "POST") { const body = await request.json(); return handleReferralRegister(body, request, env); }
  if (path.startsWith("/api/referral/stats/") && method === "GET") { const referrerId = path.split("/api/referral/stats/")[1] || ""; return handleReferralStats(referrerId, request, env); }
  if (path === "/api/referral/convert" && method === "POST") { const body = await request.json(); return handleReferralConvert(body, request, env); }

   // ── Phoenix Coder Queue Proxy — endpoint removed, use PC directly ─────────
   // ── Admin Statistics ─────────────────────────────────────────────────────
   // GET /api/admin/stats — admin dashboard metrics
   if (path === "/api/admin/stats" && method === "GET") {
     return handleAdminStats(env);
   }
   // ── Anti-Cheat Engagement Scoring ─────────────────────────────────────────
   // POST /api/anticheat/score — score a student session for genuine engagement
  if (path === "/api/anticheat/score" && method === "POST") { const body = await request.json(); return handleAntiCheatScore(body, env); }
  // GET /api/anticheat/history/:studentId — last 30 days of scores
  if (path.startsWith("/api/anticheat/history/") && method === "GET") {
    const studentId = path.split("/api/anticheat/history/")[1] || "";
    return handleAntiCheatHistory(studentId, env);
  }

  // ── Waitlist — Phase 2 free trial funnel (100-seat cap) ───────────────────
  if (path === "/api/waitlist" && method === "POST") { const body = await request.json(); return handleWaitlistJoin(body, env); }
  if (path === "/api/waitlist/count" && method === "GET") { return handleWaitlistCount(env); }
  else if (path === "/api/waitlist/list" && method === "GET") { return handleWaitlistList(env); }
  else if (path === "/api/admin/waitlist/toggle" && method === "POST") { const body = await request.json(); return handleWaitlistToggle(body, env); }
  else if (path === "/api/admin/waitlist/status" && method === "GET") { return handleWaitlistStatus(env); }

  // ── DELETE /api/vocab/delete ──────────────────────────────────────────────
  else if (method === "DELETE" && path.includes("/api/vocab/delete")) {
    try {
      const body = await request.json().catch(() => ({}));
      const { studentId, vocabId } = body;
      if (!studentId || !vocabId) return json({ error: "studentId and vocabId required" }, 400);
      const key = `vocab:${studentId}:${vocabId}`;
      const existing = await env.NET_PET_KV.get(key);
      if (!existing) return json({ error: "Vocabulary word not found" }, 404);
      await env.NET_PET_KV.delete(key);
      return json({ success: true });
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  }

  // ── GET/POST /api/student/goals ───────────────────────────────────────────
  else if (path.includes("/api/student/goals")) {
    if (method === "GET") {
      const studentId = path.split("?studentId=")[1]?.split("&")[0];
      if (!studentId) return json({ error: "studentId query param required" }, 400);
      const raw = await env.NET_PET_KV.get(`goals:${studentId}`);
      if (!raw) return json({ targetScore: null, deadlineDays: null });
      return json(JSON.parse(raw));
    }
    if (method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const { studentId, targetScore, deadlineDays } = body;
        if (!studentId || targetScore == null || deadlineDays == null) {
          return json({ error: "studentId, targetScore, deadlineDays required" }, 400);
        }
        const goal = { studentId, targetScore: Number(targetScore), deadlineDays: Number(deadlineDays), createdAt: new Date().toISOString() };
        await env.NET_PET_KV.put(`goals:${studentId}`, JSON.stringify(goal));
        return json({ success: true, goal });
      } catch (err) {
        return json({ error: String(err) }, 500);
      }
    }
  }
  // ── Payment Confirmation ────────────────────────────────────────────────────
  // POST /api/payment/confirm — record a confirmed payment, activate subscription
  if (path === "/api/payment/confirm" && method === "POST") {
    const body = await request.json();
    return handlePaymentConfirm(body, env);
  }

}

// ── Payment Handler ─────────────────────────────────────────────────────────────

async function handlePaymentConfirm(body, env) {
  const { studentId, companyCode, plan, amountVND, txnId, confirmedBy } = body || {};
  if (!plan || !txnId || !amountVND) return json({ error: "plan, txnId, amountVND required" }, 400);
  const record = {
    studentId: studentId || null, companyCode: companyCode || null, plan,
    amountVND: Number(amountVND),
    txnId: String(txnId).trim(),
    confirmedBy: confirmedBy || "manual",
    confirmedAt: new Date(Date.now()+7*3600000).toISOString(), status: "confirmed"
  };
  await env.NET_PET_KV.put(`payment:${txnId}`, JSON.stringify(record), { expirationTtl: 86400*365 });
  const idxRaw = await env.NET_PET_KV.get("payment:index").catch(()=>null);
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  idx.push(txnId);
  await env.NET_PET_KV.put("payment:index", JSON.stringify(idx.slice(-1000)));
  const subKey = studentId ? `subscription:${studentId}` : `subscription:employer:${companyCode}`;
  await env.NET_PET_KV.put(subKey, JSON.stringify({
    plan, paidUntil: new Date(Date.now()+30*86400000).toISOString(), txnId,
    activatedAt: record.confirmedAt
  }));
  const until = new Date(Date.now()+30*86400000).toISOString().slice(0,10);
  return json({ success: true, txnId, activatedUntil: until });
}

// ── Admin Statistics Handler ───────────────────────────────────────────────────

// GET /api/admin/stats — admin dashboard metrics
async function handleAdminStats(env) {
  const now = new Date(Date.now() + 7*3600000).toISOString();
  const today = now.slice(0,10);

  // Waitlist count
  const wlIdx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const waitlistCount = wlIdx.length;

  // Payment count
  const payIdx = await env.NET_PET_KV.get("payment:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const totalRevenue = (await Promise.all(payIdx.slice(-100).map(async id => {
    const raw = await env.NET_PET_KV.get(`payment:${id}`).catch(() => null);
    return raw ? JSON.parse(raw).amountVND || 0 : 0;
  }))).reduce((a,b) => a+b, 0);

  // Employer count
  const empIdx = await env.NET_PET_KV.get("employer:index").then(r => r ? JSON.parse(r) : []).catch(() => []);

  // Active students (streak > 0, lastCheckin within 7 days)
  const students = ["huong-bluetech","mai-tram-bluetech","quy-bluetech"];
  let activeStudents = 0;
  const streakChecks = await Promise.all(students.map(s => env.NET_PET_KV.get(`streak:${s}`).catch(() => null)));
  streakChecks.forEach((raw, i) => {
    if (raw) {
      const d = JSON.parse(raw);
      const p = d.lastCheckin ? Date.now() - d.lastCheckin : 999999;
      if (d.currentStreak > 0 && p < 7*86400000) activeStudents++;
    }
  });

  // Challenge attempts today
  let challengeAttemptsToday = 0;
  const chalRaw = await env.NET_PET_KV.get(`challenge:attempts:${today}`).catch(() => null);
  if (chalRaw) challengeAttemptsToday = JSON.parse(chalRaw).length || 0;

  return json({
    waitlistCount,
    paymentCount: payIdx.length,
    totalRevenueVND: totalRevenue,
    employerCount: empIdx.length,
    activeStudents,
    challengeAttemptsToday,
    generatedAt: now
  });
}

// ── Waitlist Handlers ─────────────────────────────────────────────────────────

// POST /api/waitlist — join the waitlist (name, email, why)
async function handleWaitlistJoin(body, env) {
  const { name, email, why } = body || {};
  if (!name || !email) return json({ error: "name and email required" }, 400);
  if (!env.NET_PET_KV) return json({ error: "NET_PET_KV not configured" }, 500);
  
  const entry = {
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 200),
    why: String(why || "").slice(0, 500),
    ts: new Date().toISOString(),
    id: `wl-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
  };
  
  // Append to index
  const idx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  idx.push(entry.id);
  // Cap at 100 (Phase 2 free trial funnel)
  if (idx.length > 100) return json({ ok: false, error: "Waitlist is at capacity (100). Join closed.", position: 100 }, 200);
  await env.NET_PET_KV.put("waitlist:index", JSON.stringify(idx));
  await env.NET_PET_KV.put(`waitlist:${entry.id}`, JSON.stringify(entry));
  
  return json({ ok: true, entry, position: idx.length, total: idx.length }, 201);
}

// GET /api/waitlist/count — return current count
async function handleWaitlistCount(env) {
  if (!env.NET_PET_KV) return json({ count: 0 });
  const idx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  return json({ count: idx.length, cap: 100 });
}

// GET /api/waitlist/list — return full list (admin use)
async function handleWaitlistList(env) {
  if (!env.NET_PET_KV) return json({ entries: [] });
  const idx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const entries = await Promise.all(idx.slice(-50).map(async id => {
    const raw = await env.NET_PET_KV.get(`waitlist:${id}`).catch(() => null);
    return raw ? JSON.parse(raw) : null;
  }));
  return json({ entries: entries.filter(Boolean), total: idx.length, cap: 100 });
}

// POST /api/admin/waitlist/toggle — toggle waitlist open/closed (admin pin required)
async function handleWaitlistToggle(body, env) {
  const { pin, closed } = body || {};
  if (pin !== "bluetech2026") return json({ error: "Unauthorized" }, 403);
  await env.NET_PET_KV.put("waitlist:closed", closed ? "true" : "false");
  return json({ ok: true, closed: !!closed });
}

// GET /api/admin/waitlist/status — return current open/closed state
async function handleWaitlistStatus(env) {
  if (!env.NET_PET_KV) return json({ closed: false });
  const val = await env.NET_PET_KV.get("waitlist:closed").catch(() => "false");
  return json({ closed: val === "true" });
}

// ── Anti-Cheat Handlers ───────────────────────────────────────────────────────

// POST /api/anticheat/score — score a student session for genuine engagement
async function handleAntiCheatScore(body, env) {
  const { studentId, sessionData } = body || {};
  if (!studentId || !sessionData) return json({ error: "studentId and sessionData required" }, 400);

  const events = Array.isArray(sessionData) ? sessionData : [];
  const total = events.length;

  // Signals of real engagement
  const tabVisible = events.filter(e => e.type === "tab_visible").length;
  const tabHidden = events.filter(e => e.type === "tab_hidden").length;
  const seeks = events.filter(e => e.type === "seek").length;
  const clicks = events.filter(e => e.type === "click").length;
  const keypresses = events.filter(e => e.type === "keypress").length;
  const scrolls = events.filter(e => e.type === "scroll").length;

  // Cheat signals
  const hiddenRatio = total > 0 ? tabHidden / Math.max(tabVisible, 1) : 0; // high = tab usually hidden
  const interactionRate = total > 0 ? (clicks + keypresses + scrolls) / Math.max(total, 1) : 0;

  // Score 0-100: higher = more genuine
  let score = 100;
  if (hiddenRatio > 0.5) score -= 40; // tab was hidden more than visible = strong cheat signal
  if (hiddenRatio > 0.8) score -= 20; // extreme background play
  if (interactionRate < 0.02 && total > 20) score -= 20; // very long session, zero interaction
  if (seeks === 0 && total > 50) score -= 10; // never seeked = passive/background
  score = Math.max(0, Math.min(100, score));

  const verdict = score >= 70 ? "GENUINE" : score >= 40 ? "SUSPICIOUS" : "FAKE";

  // Store result in KV
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const kvKey = `anticheat:${studentId}:${today}`;
  await env.NET_PET_KV.put(kvKey, JSON.stringify({
    score,
    verdict,
    events: total,
    hiddenRatio: Math.round(hiddenRatio * 100) / 100,
    interactionRate: Math.round(interactionRate * 100) / 100,
    timestamp: Date.now()
  }), { expirationTtl: 86400 * 30 });

  return json({
    studentId,
    score,
    verdict,
    signals: {
      hiddenRatio: Math.round(hiddenRatio * 100) / 100,
      interactionRate: Math.round(interactionRate * 100) / 100,
      seeks,
      totalEvents: total
    },
    message: verdict === "GENUINE"
      ? "Real engagement detected 🎯"
      : verdict === "SUSPICIOUS"
        ? "Engagement looks off — stay focused"
        : "Background play detected — watching counts only if you're actually watching"
  });
}

// GET /api/anticheat/history/:studentId — last 30 days
async function handleAntiCheatHistory(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  const prefix = `anticheat:${studentId}:`;
  const listed = await env.NET_PET_KV.list({ prefix });
  const days = [];

  for (const key of listed.keys) {
    const raw = await env.NET_PET_KV.get(key.name);
    if (!raw) continue;
    const data = JSON.parse(raw);
    const date = key.name.replace(prefix, "");
    days.push({ date, score: data.score, verdict: data.verdict });
  }

  days.sort((a, b) => (a.date > b.date ? -1 : 1)); // most recent first
  const limited = days.slice(0, 30);

  const averageScore = limited.length > 0
    ? Math.round(limited.reduce((sum, d) => sum + d.score, 0) / limited.length)
    : null;

  const overallVerdict = averageScore === null
    ? "NO_DATA"
    : averageScore >= 70 ? "GENUINE" : averageScore >= 40 ? "SUSPICIOUS" : "FAKE";

  return json({ studentId, days: limited, averageScore, overallVerdict });
}

// ── Session Hint Handlers (Chrome extension → KV → chat.js) ─────────────────

// POST /api/session-hint — Chrome extension posts {studentId, videoTitle, videoUrl}
async function handleSessionHintPost(request, env) {
  const body = await request.json().catch(() => ({}));
  const { studentId, videoTitle, videoUrl } = body;
  if (!studentId || !videoTitle) return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
  if (!env.NET_PET_KV) return new Response(JSON.stringify({ error: "NET_PET_KV binding not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  await env.NET_PET_KV.put(
    `session-hint:${studentId}`,
    JSON.stringify({ studentId, videoTitle, videoUrl: videoUrl || "", timestamp: Date.now() }),
    { expirationTtl: 86400 }
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}

// GET /api/session-hint?studentId=X — chat.js checks for recent YouTube session
async function handleSessionHintGet(request, env) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) return new Response(JSON.stringify({ error: "missing studentId" }), { status: 400, headers: { "Content-Type": "application/json" } });
  if (!env.NET_PET_KV) return new Response(JSON.stringify({ videoTitle: null }), { status: 200, headers: { "Content-Type": "application/json" } });
  const raw = await env.NET_PET_KV.get(`session-hint:${studentId}`);

  // Fetch soul context from soul-logger (fire, don't let failures block hint delivery)
  let soulContext = '';
  try {
    const ctxResp = await fetch(`${env.SOUL_LOGGER_URL || 'https://soul-logger.mrmichaelhobbs123.workers.dev'}/api/soul/context/${studentId}`);
    if (ctxResp.ok) {
      const ctxData = await ctxResp.json();
      if (ctxData.context_brief) soulContext = ctxData.context_brief;
    }
  } catch(e) {}

  if (!raw) return new Response(JSON.stringify({ videoTitle: null, soul_context: soulContext }), { status: 200, headers: { "Content-Type": "application/json" } });
  let hint = {};
  try { hint = JSON.parse(raw); } catch(e) { hint = { videoTitle: null }; }
  return new Response(JSON.stringify({ ...hint, soul_context: soulContext }), { status: 200, headers: { "Content-Type": "application/json" } });
}

// ── Face-Saving Protocol — Streak Tracking + Accountability ──────────────────
// Vietnamese culture: public commitment prevents quitting. Streaks = social contract.

const FACE_SAVING_STUDENTS = ["huong-bluetech", "mai-tram-bluetech", "quy-bluetech"];

// Get today's date string in ICT (UTC+7) as YYYY-MM-DD
function getICTDateString(offsetMs = 0) {
  const nowMs = Date.now() + offsetMs;
  const ictMs = nowMs + 7 * 60 * 60 * 1000; // shift to UTC+7
  const d = new Date(ictMs);
  const yyyy = d.getUTCFullYear();
  const mm   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd   = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Returns "today", "yesterday", or "older" relative to ICT now
function relativeDayICT(dateStr) {
  if (!dateStr) return "older";
  const today     = getICTDateString(0);
  const yesterday = getICTDateString(-24 * 60 * 60 * 1000);
  if (dateStr === today)     return "today";
  if (dateStr === yesterday) return "yesterday";
  return "older";
}

// POST /api/student/checkin — record a daily check-in, maintain streak
async function handleStudentCheckin(body, request, env) {
  const { studentId } = body || {};
  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  if (!FACE_SAVING_STUDENTS.includes(studentId)) {
    return addCors(json({ error: "Unknown studentId — must be one of: " + FACE_SAVING_STUDENTS.join(", ") }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV binding not configured" }, 500), request);

  const today = getICTDateString();
  const kvKey = `streak:${studentId}`;
  const raw   = await env.NET_PET_KV.get(kvKey);
  let streak  = raw ? JSON.parse(raw) : { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0 };

  const rel = relativeDayICT(streak.lastCheckin);
  let status;

  if (rel === "today") {
    // Already checked in today — idempotent
    status = "already_done";
  } else if (rel === "yesterday") {
    // Consecutive day — extend streak
    streak.currentStreak += 1;
    streak.totalDays     += 1;
    streak.lastCheckin    = today;
    status = "checked_in";
  } else {
    // Streak broken (or first ever check-in)
    const wasBroken = streak.lastCheckin !== null;
    streak.currentStreak = 1;
    streak.totalDays    += 1;
    streak.lastCheckin   = today;
    status = wasBroken ? "streak_broken" : "checked_in";
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  if (status !== "already_done") {
    await env.NET_PET_KV.put(kvKey, JSON.stringify(streak));
  }

  return addCors(json({
    studentId,
    currentStreak:  streak.currentStreak,
    longestStreak:  streak.longestStreak,
    totalDays:      streak.totalDays,
    lastCheckin:    streak.lastCheckin,
    status,
  }), request);
}

// GET /api/student/streak/:studentId — read streak + compute today's status
async function handleStudentStreak(studentId, request, env) {
  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  if (!FACE_SAVING_STUDENTS.includes(studentId)) {
    return addCors(json({ error: "Unknown studentId — must be one of: " + FACE_SAVING_STUDENTS.join(", ") }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV binding not configured" }, 500), request);

  const raw    = await env.NET_PET_KV.get(`streak:${studentId}`);
  const streak = raw ? JSON.parse(raw) : { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0 };

  const rel = relativeDayICT(streak.lastCheckin);
  let todayStatus;
  if (rel === "today")     todayStatus = "active";
  else if (rel === "yesterday") todayStatus = "at_risk";
  else                     todayStatus = "broken";

  return addCors(json({
    studentId,
    currentStreak:  streak.currentStreak,
    longestStreak:  streak.longestStreak,
    totalDays:      streak.totalDays,
    lastCheckin:    streak.lastCheckin,
    todayStatus,
  }), request);
}

// POST /api/student/saveface — log accountability event when streak is at risk
async function handleStudentSaveface(body, request, env) {
  const { studentId, message } = body || {};
  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  if (!FACE_SAVING_STUDENTS.includes(studentId)) {
    return addCors(json({ error: "Unknown studentId — must be one of: " + FACE_SAVING_STUDENTS.join(", ") }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV binding not configured" }, 500), request);

  const raw    = await env.NET_PET_KV.get(`streak:${studentId}`);
  const streak = raw ? JSON.parse(raw) : { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0 };

  const rel = relativeDayICT(streak.lastCheckin);
  let todayStatus;
  if (rel === "today")          todayStatus = "active";
  else if (rel === "yesterday") todayStatus = "at_risk";
  else                          todayStatus = "broken";

  // Log saveface event if streak is at_risk or already broken
  if (todayStatus === "at_risk" || todayStatus === "broken") {
    const today    = getICTDateString();
    const eventKey = `saveface:${studentId}:${today}`;
    const event    = {
      studentId,
      date:           today,
      currentStreak:  streak.currentStreak,
      todayStatus,
      message:        message || "",
      ts:             Date.now(),
    };
    await env.NET_PET_KV.put(eventKey, JSON.stringify(event), { expirationTtl: 30 * 24 * 60 * 60 }); // keep 30 days
  }

  return addCors(json({
    studentId,
    streakAtRisk:    streak.currentStreak,
    todayStatus,
    message:         "Cứu em với! Streak sắp đứt!",
    recoveryOptions: ["Complete a lesson now", "Review vocabulary", "Practice pronunciation"],
  }), request);
}

// ── Student Forecast — CEFR progression projection ───────────────────────────
// GET /api/student/forecast/:studentId
// Returns mastery velocity + projected graduation date to next CEFR level

async function handleStudentForecast(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  const [streakRaw, srsKeys] = await Promise.all([
    env.NET_PET_KV.get(`streak:${studentId}`),
    env.NET_PET_KV.list({ prefix: `srs:${studentId}:` })
  ]);

  const streak = streakRaw ? JSON.parse(streakRaw) : { currentStreak: 0, totalDays: 0 };
  const totalWords = srsKeys.keys.length;

  // Fetch all SRS words to count mastered (repetitions >= 3)
  const wordData = await Promise.all(
    srsKeys.keys.slice(0, 200).map(k => env.NET_PET_KV.get(k.name))
  );
  const words = wordData.map(w => w ? JSON.parse(w) : null).filter(Boolean);
  const masteredWords = words.filter(w => (w.repetitions || 0) >= 3).length;

  // Velocity: mastered per active day
  const activeDays = Math.max(streak.totalDays || 1, 1);
  const velocity = masteredWords / activeDays; // words/day

  // CEFR targets: A1=50, A2=150, B1=300, B2=500, C1=800
  const CEFR_TARGETS = [
    { level: "A1", words: 50 }, { level: "A2", words: 150 },
    { level: "B1", words: 300 }, { level: "B2", words: 500 }, { level: "C1", words: 800 }
  ];

  const currentLevel = CEFR_TARGETS.find(t => masteredWords < t.words)?.level || "C1";
  const nextTarget = CEFR_TARGETS.find(t => t.words > masteredWords);
  const wordsRemaining = nextTarget ? nextTarget.words - masteredWords : 0;

  const projectedDays = velocity > 0 ? Math.ceil(wordsRemaining / velocity) : 999;
  const graduationDate = new Date(Date.now() + projectedDays * 86400000).toISOString().slice(0, 10);

  const confidence = activeDays < 7 ? "low" : activeDays < 30 ? "medium" : "high";

  return json({
    studentId, currentLevel,
    targetLevel: nextTarget?.level || "C1",
    masteredWords, totalWords,
    velocity: Math.round(velocity * 10) / 10,
    projectedDays, graduationDate, confidence,
    activeDays
  });
}

// ── Leaderboard — GET /api/leaderboard ───────────────────────────────────────
// Public rankings: streak + mastered words. No auth required.
async function handleLeaderboard(request, env) {
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const STUDENTS = [
    { id: "huong-bluetech",     displayName: "Huong" },
    { id: "mai-tram-bluetech",  displayName: "Mai Tram" },
    { id: "quy-bluetech",       displayName: "Quy" },
  ];

  const CEFR_TARGETS = [50, 150, 300, 500, 800];

  function getTier(masteredWords) {
    if (masteredWords >= 80) return "TIGER🔥";
    if (masteredWords >= 40) return "CUB🐯";
    return "MOUSE🐭";
  }

  const rankings = await Promise.all(STUDENTS.map(async (s) => {
    const [streakRaw, srsKeys] = await Promise.all([
      env.NET_PET_KV.get(`streak:${s.id}`).catch(() => null),
      env.NET_PET_KV.list({ prefix: `srs:${s.id}:` }).catch(() => ({ keys: [] })),
    ]);
    const streak = streakRaw ? JSON.parse(streakRaw) : { currentStreak: 0, totalDays: 0, longestStreak: 0 };
    const totalWords = srsKeys.keys.length;

    // Count mastered words (repetitions >= 3)
    const wordData = await Promise.all(
      srsKeys.keys.slice(0, 300).map(k => env.NET_PET_KV.get(k.name).catch(() => null))
    );
    const masteredWords = wordData.filter(w => {
      if (!w) return false;
      try { return (JSON.parse(w).repetitions || 0) >= 3; } catch { return false; }
    }).length;

    return {
      studentId: s.id,
      displayName: s.displayName,
      currentStreak: streak.currentStreak || 0,
      longestStreak: streak.longestStreak || 0,
      totalDays: streak.totalDays || 0,
      masteredWords,
      totalWords,
      tier: getTier(masteredWords),
    };
  }));

  // Sort: totalDays DESC, then masteredWords DESC
  rankings.sort((a, b) => b.totalDays - a.totalDays || b.masteredWords - a.masteredWords);
  rankings.forEach((r, i) => { r.rank = i + 1; });

  return addCors(json({ updatedAt: new Date().toISOString(), rankings }), request);
}

// ── Referral System ───────────────────────────────────────────────────────────

// POST /api/referral/register — { referrerStudentId, referredName, referredEmail }
async function handleReferralRegister(body, request, env) {
  const { referrerStudentId, referredName, referredEmail } = body || {};
  if (!referrerStudentId || !referredName) {
    return addCors(json({ error: "referrerStudentId and referredName required" }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const code = `ref-${referrerStudentId}-${Date.now().toString(36)}`;
  const referral = {
    code,
    referrerStudentId,
    referredName,
    referredEmail: referredEmail || "",
    timestamp: Date.now(),
    converted: false,
  };

  // Store referral record
  await env.NET_PET_KV.put(`referral:${code}`, JSON.stringify(referral), { expirationTtl: 90 * 24 * 60 * 60 });

  // Append to referrer's list
  const listKey = `referral-list:${referrerStudentId}`;
  const existing = await env.NET_PET_KV.get(listKey).catch(() => null);
  const list = existing ? JSON.parse(existing) : [];
  list.push(code);
  await env.NET_PET_KV.put(listKey, JSON.stringify(list));

  const shareUrl = `/join?ref=${code}`;
  return addCors(json({ ok: true, code, shareUrl }), request);
}

// GET /api/referral/stats/:referrerStudentId
async function handleReferralStats(referrerStudentId, request, env) {
  if (!referrerStudentId) return addCors(json({ error: "referrerStudentId required" }, 400), request);
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const listRaw = await env.NET_PET_KV.get(`referral-list:${referrerStudentId}`).catch(() => null);
  const codes = listRaw ? JSON.parse(listRaw) : [];

  const referrals = await Promise.all(
    codes.map(c => env.NET_PET_KV.get(`referral:${c}`).then(r => r ? JSON.parse(r) : null).catch(() => null))
  );
  const valid = referrals.filter(Boolean);
  const converted = valid.filter(r => r.converted).length;

  return addCors(json({
    referrerStudentId,
    totalReferrals: valid.length,
    converted,
    pending: valid.length - converted,
    referrals: valid,
  }), request);
}

// POST /api/referral/convert — { code } → mark converted
async function handleReferralConvert(body, request, env) {
  const { code } = body || {};
  if (!code) return addCors(json({ error: "code required" }, 400), request);
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const raw = await env.NET_PET_KV.get(`referral:${code}`).catch(() => null);
  if (!raw) return addCors(json({ error: "referral not found" }, 404), request);

  const referral = JSON.parse(raw);
  referral.converted = true;
  referral.convertedAt = Date.now();
  await env.NET_PET_KV.put(`referral:${code}`, JSON.stringify(referral), { expirationTtl: 90 * 24 * 60 * 60 });
  return addCors(json({ ok: true }), request);
}

// ── Voice Drill Scoring — Deepgram STT + SRS update ──────────────────────────
// POST /api/voice/score — { studentId, word, audioBase64 } → { score, transcript, nextReview }

async function handleVoiceScore(body, env) {
  const { studentId, word, audioBase64 } = body || {};
  if (!studentId || !word) return json({ error: "studentId and word required" }, 400);

  let transcript = null;
  let fallback = false;

  if (env.DEEPGRAM_API_KEY && audioBase64) {
    try {
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const dgResp = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&language=en-US", {
        method: "POST",
        headers: {
          "Authorization": `Token ${env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm"
        },
        body: audioBytes
      });
      if (dgResp.ok) {
        const dgData = await dgResp.json();
        transcript = dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
      }
    } catch(e) { fallback = true; }
  } else {
    fallback = true;
  }

  // Score: 5=exact, 3=partial, 1=miss (or fallback default 3)
  let score = 3;
  if (!fallback && transcript !== null) {
    const clean = t => t.toLowerCase().replace(/[^a-z]/g, "");
    if (clean(transcript) === clean(word)) score = 5;
    else if (clean(transcript).includes(clean(word))) score = 3;
    else score = 1;
  }

  // Load existing SRS word and update via computeNextReview
  const vocabId = `${studentId}:${word.toLowerCase().trim().replace(/\s+/g, "-")}`;
  const kvKey = `srs:${studentId}:${vocabId}`;
  const existing = await env.NET_PET_KV.get(kvKey);
  const wordData = existing ? JSON.parse(existing) : { word, interval: 1, repetitions: 0, ease_factor: 2.5, next_review: 0 };

  const updated = computeNextReview(wordData, score);
  await env.NET_PET_KV.put(kvKey, JSON.stringify({ ...wordData, ...updated }), { expirationTtl: 86400 * 365 });

  return json({
    word, transcript: transcript ?? "[voice unavailable]",
    score, fallback,
    nextReview: updated.next_review,
    message: score >= 4 ? "Great job! 🔥" : score >= 3 ? "Good — keep practicing!" : "Keep trying! 💪"
  });
}

// ── Magic Chat — Obi quick-response with auto student context injection ────────
// POST /api/magic-chat — { message, studentId?, context? }
// If studentId is provided and context is absent, auto-builds context from streak + SRS due words.

async function handleMagicChat(body, request, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return addCors(json({ error: "DEEPSEEK_API_KEY not configured" }, 500), request);

  const message = sanitizeInput((body.message || "").slice(0, 1000));
  if (!message) return addCors(json({ error: "message required" }, 400), request);

  const studentId = body.studentId || "";
  let context = body.context || "";

  // Auto-inject student context if studentId is present and no context was passed
  if (studentId && !context && env.NET_PET_KV) {
    try {
      const [streakRaw, srsKeys] = await Promise.all([
        env.NET_PET_KV.get(`streak:${studentId}`),
        env.NET_PET_KV.list({ prefix: `srs:${studentId}:` })
      ]);

      const streak = streakRaw ? JSON.parse(streakRaw) : { currentStreak: 0 };
      const now = Date.now();

      // Fetch SRS entries to find due words
      const wordEntries = await Promise.all(
        srsKeys.keys.slice(0, 50).map(k => env.NET_PET_KV.get(k.name))
      );
      const dueWords = wordEntries
        .map(w => { try { return w ? JSON.parse(w) : null; } catch { return null; } })
        .filter(w => w && (w.next_review || 0) <= now)
        .slice(0, 5)
        .map(w => w.word)
        .filter(Boolean);

      context = `Student: ${studentId} | Streak: ${streak.currentStreak || 0} days${(streak.currentStreak || 0) >= 7 ? " 🔥" : ""}\nDue vocabulary: ${dueWords.join(", ") || "none"}\nTeaching note: Weave due vocabulary into your response naturally. Acknowledge the streak if >= 7 days.`;
    } catch (_) {}
  }

  const systemContent = OBI_SYSTEM + (context ? `\n\n${context}` : "");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return addCors(json({ error: `DeepSeek ${res.status}`, detail: errText }, 502), request);
  }
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Say that again?";

  return addCors(json({ reply, studentId: studentId || null, contextInjected: !!context }), request);
}

// ── Soul DNA Capture ─────────────────────────────────────────────────────────
// VERBATIM FIRST. Zero transformation. Every word Michael speaks is sacred.
// No sanitizeInput. No truncation. No paraphrase. Raw → hash → chain → ledger.
async function handleSoulDNACapture(body, env) {
  // ── Validation (minimal — we want everything through) ──────────────────
  if (!body.text || typeof body.text !== "string" || body.text.length === 0) {
    return json({ error: "text required — verbatim dictation block" }, 400);
  }

  // VERBATIM: no sanitizeInput, no trim, no truncation.
  // The ONLY transformation allowed: normalize \r\n → \n (CRLF from Windows voice input).
  const verbatimText = body.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const author   = "sov100";                          // always Michael
  const run      = String(body.run   || "").slice(0, 20) || "untagged";
  const blockId  = String(body.blockId || "").slice(0, 50) || `auto-${Date.now()}`;
  const source   = String(body.source || "").slice(0, 30) || "voice"; // voice | text | paste
  const ts       = Date.now();

  // ── Build immutable payload (everything that will be hashed) ──────────
  const payloadObj = {
    text:    verbatimText,           // THE SOUL — verbatim, untouched
    run,
    blockId,
    source,
    author,
    charCount:  verbatimText.length,
    wordCount:  verbatimText.split(/\s+/).filter(Boolean).length,
    capturedAt: new Date(ts).toISOString(),
  };
  const payloadStr = JSON.stringify(payloadObj);

  // ── Append to LedgerDO under author namespace (hash-chained) ──────────
  if (!env.LEDGER) return json({ error: "LEDGER binding not configured" }, 500);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(author));
  const appendRes = await stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId: author,
      eventType: "soul_dna_capture",
      payload:   payloadStr,
    }),
  }));
  const appendData = await appendRes.json();

  // Notion: BLACKLISTED — no sync calls made; legacy data preserved in CANON/REINCARNATION

  return json({
    blockId,
    run,
    source,
    charCount: payloadObj.charCount,
    wordCount: payloadObj.wordCount,
    capturedAt: payloadObj.capturedAt,
    entryHash:  appendData.entryHash,
    prevHash:   appendData.prevHash,
    chainHead:  appendData.entryHash,   // caller can use this as prevHash for next block
    notionStatus: "BLACKLISTED — platform usage permanently disabled",
    ts,
  });
}

async function handleSoulDNAGet(url, env) {
  const run     = url.searchParams.get("run")    || "";
  const limit   = Math.min(parseInt(url.searchParams.get("limit") || "50"), 500);
  const raw     = url.searchParams.get("raw")    === "true"; // raw=true → include full text in response

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

// ── OBI v2 Pipeline: Context Builder + Drift + Scoring + Signals ─────────────

// Structured Context Builder — merges Soul + Sessions + State + Weaknesses
async function buildStructuredContext(env, studentId) {
  const ctx = { soul: null, sessionEvents: [], studentState: null, profile: null, weakPoints: [], petState: null };

  // Load Soul DNA (last 3 intent anchors — grounding reference only)
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

// Drift Detection — scores how disconnected current input is from session context
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

// Mouse → Tiger Score Calculator — behavioral state machine
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

// Learning Signal Extraction — derives structured signals from chat exchange
function extractLearningSignals(input, response) {
  const signals = { mistakes: [], vocabulary: [], phonics: [], topic: "" };
  // Corrections from OBI response
  const corrPatterns = [/(?:should be|correct(?:ion)?|instead of|say|use)\s+[""]([^""]+)[""]/gi, /→\s*(.+?)(?:\.|$)/gm];
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
  const phonicsKw = ["pronunciation", "sound", "phonics", "th ", "ch ", "sh ", "/r/", "/l/", "/θ/", "/ð/"];
  if (phonicsKw.some(k => response.toLowerCase().includes(k))) {
    signals.phonics = (response.match(/\/[^/]+\//g) || []).slice(0, 5);
  }
  // Topic from input
  signals.topic = input.split(/\s+/).filter(w => w.length > 4).slice(0, 3).join(" ") || "general practice";
  return signals;
}

// Next Action Generator — deterministic "what comes next" based on state + signals
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
    injection += `\n\nSESSION HISTORY (${ctx.sessionEvents.length} events — this is your continuous memory chain):\n${lines.join("\n")}`;
  }
  // Student state
  if (ctx.studentState) {
    const s = ctx.studentState;
    injection += `\n\nSTUDENT STATE: ${s.state || "MOUSE"} (score: ${s.mouse_tiger_score || 0}/100). Continuity: ${s.continuity_score || 0}. Events: ${s.total_events || 0}.`;
  }
  // Weakness patterns
  if (ctx.weakPoints?.length > 0) {
    const top = ctx.weakPoints.slice(0, 5).map(w => `${w.specific} (${w.category}, ×${w.error_count})`);
    injection += `\n\nKNOWN WEAKNESSES: ${top.join(", ")}. Target these in corrections.`;
  }
  // Pet state (streak/mood)
  if (ctx.petState) {
    injection += `\n\nSTREAK: ${ctx.petState.streak || 0} days. Mood: ${ctx.petState.mood || "neutral"}. Tiger score: ${ctx.petState.tigerScore || 0}.`;
  }
  return injection;
}

// ── Soul Logger: fire-and-forget cross-session awareness bus ─────────────────

async function logSoulEvent(env, studentId, sessionId, role, text) {
  const url = (env.SOUL_LOGGER_URL || 'https://soul-logger.mrmichaelhobbs123.workers.dev') + '/api/soul/event';
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_id: studentId, session_id: sessionId, role, text, timestamp: new Date().toISOString() })
  });
}

// ── Chat (DeepSeek + Obi + Ledger memory injection) ──────────────────────────

// ── Memory Compression: update Soul DNA v1 summary ──────────────────────
async function updateStudentMemory(studentId, env) {
  // Stub — full implementation pending: compress recent exchanges into soul summary
  // Future: POST to soul-logger /api/soul/compress
}

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

  // ── Pull Ledger context (Obi's unparalleled student memory) ──────────────
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
          ledgerContext = `\n\nSTUDENT LEDGER (${histData.entries.length} total exchanges — this is your unalterable memory of this student):\n${lines.join("\n---\n")}`;
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
        sessionContext = `\n\nLAST REAL CLASS (${dateStr}): Topic: "${s.topic || ""}". Vocab covered: ${vocabList}. Level: ${s.studentLevel || ""}. Teacher notes: "${s.teacherNotes || ""}". Continue from exactly here — your first response should reference this content naturally without announcing it.`;
      }
    } catch (_) {}
  }

  // ── Memory Brain: Weakness injection + Re-entry detection ─────────────
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

  // ── v2 Pipeline: Load structured context for continuity engine ────────
  if (studentId !== "anonymous") {
    try { structuredCtx = await buildStructuredContext(env, studentId); } catch (_) {}
  }
  const contextInjection = structuredCtx ? formatContextForPrompt(structuredCtx) : "";

  // ── Soul context: fetch student soul brief from soul-logger ─────────────
  let soulContext = '';
  if (studentId !== "anonymous") {
    try {
      const ctxResp = await fetch(`${env.SOUL_LOGGER_URL || 'https://soul-logger.mrmichaelhobbs123.workers.dev'}/api/soul/context/${studentId}`);
      if (ctxResp.ok) {
        const ctxData = await ctxResp.json();
        if (ctxData.context_brief) soulContext = `\n\nSOUL CONTEXT (who this student really is):\n${ctxData.context_brief}`;
      }
    } catch(e) {}
  }

  const isFirstSession = ledgerContext === "" && sessionContext === "";
  const displayName = studentId !== "anonymous" ? studentId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "there";
  const firstSessionContext = isFirstSession
    ? `\n\nFIRST SESSION: This is the student's very first interaction. No history exists yet. The student's name is ${displayName} (derived from their ID: "${studentId}"). Your opening message must: warmly welcome them by name, ask ONE question about their English goals, and make them feel this system was built specifically for them. Under 3 sentences. Warm, direct, confident. Do not ask multiple questions. Do not make up a different name — use exactly "${displayName}".`
    : "";

  const hasSystem = messages.some(m => m.role === "system");
  if (!hasSystem) {
    messages.unshift({ role: "system", content: OBI_SYSTEM + ledgerContext + sessionContext + weaknessContext + reEntryContext + rewardContext + contextInjection + soulContext + firstSessionContext });
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages, max_tokens: 300, temperature: 0.85 }),
  });

  let data;
  if (!res.ok && (res.status === 401 || res.status === 402) && env.OPENROUTER_API_KEY) {
    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.OPENROUTER_API_KEY}` },
      body: JSON.stringify({ model: "openai/gpt-4o-mini", messages, max_tokens: 300, temperature: 0.85 }),
    });
    if (!orRes.ok) { const errText = await orRes.text(); return json({ error: `AI_FALLBACK_FAILED ${orRes.status}`, detail: errText }, 502); }
    data = await orRes.json();
  } else if (!res.ok) {
    const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502);
  } else {
    data = await res.json();
  }
  const choice = data.choices?.[0]?.message;
  const reply = choice?.content || choice?.reasoning_content || "Say that again?";

  // ── Auto-write every exchange to the Cryptographic Immutable Ledger ───────
  const userMsg = messages.filter(m => m.role === "user").pop()?.content || "";
  // Stable daily session ID — groups all turns in the same calendar day per student
  const sessionId = `${studentId}-${new Date().toISOString().slice(0, 10)}`;
  if (studentId !== "anonymous" && env.LEDGER && userMsg) {
    const payload = JSON.stringify({ user: userMsg, obi: reply });
    appendToLedger(studentId, "chat_exchange", payload, env).catch(() => {});
  }

  // ── Soul Logger: push user turn (fire-and-forget) ───────────────────────
  if (studentId !== "anonymous" && userMsg) {
    logSoulEvent(env, studentId, sessionId, 'user', userMsg).catch(() => {});
  }

  // ── Soul Logger: push assistant turn (fire-and-forget) ──────────────────
  if (studentId !== "anonymous") {
    logSoulEvent(env, studentId, sessionId, 'assistant', reply).catch(() => {});
  }

  // ── Notion sync: BLACKLISTED — platform usage permanently disabled ────────

  // ── Memory Brain: Extract weaknesses from OBI's correction and store ─────
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

  // ── Memory Compression: update Soul DNA v1 summary after each interaction ─
  if (studentId !== "anonymous") {
    try { await updateStudentMemory(studentId, env); } catch (_) {}
  }

  // ── v2 Pipeline: Extract signals → Write session event → Update state ───
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

// ── Vocab SRS API handlers ────────────────────────────────────────────────────

async function handleVocabAdd(body, env) {
  const studentId = body.studentId || "anonymous";
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  if (!body.word?.trim()) return json({ error: "word required" }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
  const res = await stub.fetch(new Request("https://do/vocab/add", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, studentId }),
  }));
  return res;
}

async function handleVocabDue(studentId, env) {
  if (!studentId) return json({ due: [], count: 0 });
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
  const res = await stub.fetch(new Request("https://do/vocab/due"));
  return res;
}

async function handleVocabReview(body, env) {
  const studentId = body.studentId || "anonymous";
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
  const res = await stub.fetch(new Request("https://do/vocab/review", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  return res;
}

async function handleVocabList(studentId, env) {
  if (!studentId) return json({ words: [], total: 0 });
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
  const res = await stub.fetch(new Request("https://do/vocab/list"));
  return res;
}

// ── TTS (Deepgram Aura) ───────────────────────────────────────────────────────

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

// ── Speech-to-Learning MVP — Core Loop ────────────────────────────────────────

const CORRECT_PROMPT = `You are OBI, a strict but warm English coach for Vietnamese students.

TASK: The student spoke a sentence. You must:
1. Correct ANY grammar, vocabulary, or phrasing errors
2. Explain the mistake simply (1 sentence max, use Vietnamese translation if it helps)
3. Give the corrected sentence for them to repeat

RULES:
- If the sentence is already correct, say so and give a slightly more advanced version to try
- Keep explanations SHORT — max 1-2 sentences
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
        mistakeContext = `\n\nSTUDENT'S PAST MISTAKES (they keep getting these wrong — watch for patterns):\n${past.slice(-5).map(m => `- "${m}"`).join("\n")}`;
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
  if (score === 100) feedback = "Perfect! You nailed it. 🔥";
  else if (score >= 80) feedback = "Close enough! Good job. Keep that sentence in your brain.";
  else if (score >= 50) feedback = "Almost — try again. Listen carefully to the corrected version.";
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

// ── Onboarding ────────────────────────────────────────────────────────────────

async function handleOnboarding(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  const res = await stub.fetch(new Request("https://do/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

  // Ledger the onboarding event
  if (env.LEDGER) {
    const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
    appendToLedger(body.studentId, "onboarding", payload, env).catch(() => {});
  }
  // Register in roster so digest + flags work (must await — CF Workers kills fire-and-forget without waitUntil)
  await upsertRoster(body.studentId, { fullName: body.fullName, englishLevel: body.englishLevel }, env).catch(() => {});

  // Issue a student-scoped HMAC token so the client can authenticate memory calls
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET || "phoenix-fallback-dev-key"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body.studentId));
  const studentToken = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

  const resData = await res.json().catch(() => ({}));
  return json({ ...resData, studentToken });
}

// ── Memory (mutable scratch — Ledger is the permanent record) ────────────────

// Verify that the X-Student-Token header matches the requested studentId.
// Token = HMAC-SHA256(studentId, SESSION_SECRET). Issued at onboarding, stored client-side.
async function _verifyStudentToken(studentId, token, env) {
  if (!token) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET || "phoenix-fallback-dev-key"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(studentId));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return expected === token;
}

async function handleMemorySave(body, env, request) {
  const studentId = body.studentId || "unknown";
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const token = request?.headers?.get("X-Student-Token") || body._token || "";
  if (!await _verifyStudentToken(studentId, token, env)) {
    return json({ error: "Unauthorized" }, 401);
  }
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(studentId));
  return stub.fetch(new Request("https://do/memory/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

async function handleMemoryGet(studentId, env, request) {
  if (!studentId) return json({ memory: [] });
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const token = request?.headers?.get("X-Student-Token") || request?.url && new URL(request.url).searchParams.get("_token") || "";
  if (!await _verifyStudentToken(studentId, token, env)) {
    return json({ error: "Unauthorized" }, 401);
  }
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(studentId));
  return stub.fetch(new Request("https://do/memory/get"));
}

// ── Progress ─────────────────────────────────────────────────────────────────

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

// ── Lesson / Practice / Feedback ─────────────────────────────────────────────

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

// ── NET Pet ───────────────────────────────────────────────────────────────────

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

// ── Phonics Drills ────────────────────────────────────────────────────────────

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
  if (score === 100) feedback = "Perfect drill! 🔥 That sound is locked in.";
  else if (score >= 80) feedback = "Good enough — moving on. Keep drilling daily.";
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

// ── Metrics — The 4 That Matter ───────────────────────────────────────────────

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

// ── Assessment + Report Engine ────────────────────────────────────────────────

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
  if (!studentId) return json({ error: "studentId required — pass ?studentId=xxx" }, 400);

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
  const modeEmoji = d.tigerMode === "TIGER" ? "🐅" : d.tigerMode === "CUB" ? "🐱" : "🐭";
  const modeColor = d.tigerMode === "TIGER" ? "#22c55e" : d.tigerMode === "CUB" ? "#f59e0b" : "#ef4444";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>English Assessment Report — ${d.name}</title>
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
<h1>🎓 English Assessment Report</h1>
<p style="font-size:22px;font-weight:700;color:#e2e8f0;margin:8px 0">${d.name}</p>
<p class="subtitle">Generated ${new Date(d.generatedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})} · Natural English Training</p>
<div style="margin-top:16px"><span class="badge" style="background:${modeColor}20;color:${modeColor};border:1px solid ${modeColor}">${modeEmoji} ${d.tigerMode} MODE</span>
<span class="badge" style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);margin-left:8px">CEFR ${d.level}</span></div>
</div>

<div class="section"><h2>📊 Overall Score</h2>
<div style="text-align:center;margin:16px 0"><div style="font-size:64px;font-weight:800;color:${modeColor}">${d.tigerScore}</div><div style="color:#94a3b8;font-size:14px">out of 100</div></div>
<p style="text-align:center;color:#cbd5e1;max-width:500px;margin:0 auto">${d.summary}</p></div>

<div class="section"><h2>🎯 Skill Breakdown</h2>
${bar("Grammar", d.scores.grammar)}
${bar("Vocabulary", d.scores.vocabulary)}
${bar("Fluency", d.scores.fluency)}
${bar("Pronunciation", d.scores.pronunciation_risk)}
${bar("Confidence", d.scores.confidence)}
${bar("Accuracy", d.scores.accuracy)}
</div>

<div class="section"><h2>⚡ Key Stats</h2>
<div class="stat-row">
<div class="stat"><div class="val">${d.streak}</div><div class="label">Day Streak</div></div>
<div class="stat"><div class="val">${d.totalSessions}</div><div class="label">Sessions</div></div>
<div class="stat"><div class="val">${d.drillPassRate}%</div><div class="label">Drill Pass Rate</div></div>
<div class="stat"><div class="val">${d.drillsTotal}</div><div class="label">Drills Done</div></div>
</div></div>

${d.topErrors.length > 0 ? `<div class="section"><h2>🔴 Top Errors</h2>${d.topErrors.map(e => `<div class="error-item"><strong>${e.error}</strong><div style="color:#94a3b8;font-size:13px;margin-top:2px">"${e.example}"</div><div class="fix">✓ ${e.correction}</div></div>`).join("")}</div>` : ""}

${d.phonicsRisks.length > 0 ? `<div class="section"><h2>🗣️ Phonics Risk Areas</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${d.phonicsRisks.map(p => `<span class="phonics-tag">${p.replace(/_/g, " ")}</span>`).join("")}</div></div>` : ""}

${d.strengths.length > 0 ? `<div class="section"><h2>💪 Strengths</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${d.strengths.map(s => `<span class="strength-tag">${s}</span>`).join("")}</div></div>` : ""}

${d.improvementPlan.length > 0 ? `<div class="section"><h2>📈 Improvement Plan</h2>${d.improvementPlan.map(p => `<div class="plan-item"><strong>Week ${p.week}:</strong> ${p.goal}<div style="color:#94a3b8;font-size:13px;margin-top:4px">→ ${p.action}</div></div>`).join("")}</div>` : ""}

${d.errorTrend.length > 1 ? `<div class="section"><h2>📉 Error Trend (Last 7 Days)</h2><div class="card"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="color:#94a3b8;border-bottom:1px solid rgba(168,85,247,0.2)"><th style="text-align:left;padding:6px">Date</th><th style="text-align:center;padding:6px">Corrections</th><th style="text-align:center;padding:6px">Errors</th><th style="text-align:right;padding:6px">Error Rate</th></tr>${d.errorTrend.map(e => `<tr><td style="padding:6px">${e.day}</td><td style="text-align:center;padding:6px">${e.total}</td><td style="text-align:center;padding:6px;color:#ef4444">${e.errors}</td><td style="text-align:right;padding:6px">${e.rate}%</td></tr>`).join("")}</table></div></div>` : ""}

<a class="cta" href="/">Start Daily Training with Obi →</a>

<div class="footer">
<p>Natural English Training · Powered by OBI AI Engine</p>
<p style="margin-top:4px">Mouse → Cub → Tiger · Your journey continues</p>
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

// ── Classroom ─────────────────────────────────────────────────────────────────

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

// ── Roster helper ─────────────────────────────────────────────────────────────

async function upsertRoster(studentId, data, env) {
  if (!env.SESSIONS) return;
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  return stub.fetch(new Request("https://do/roster/upsert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, ...data }),
  }));
}

// ── Session Log (off-day pipeline core) ──────────────────────────────────────
// Michael calls POST /api/session/log after every real class.
// OBI inherits his teaching → continues exactly where he left off on off-days.

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

// ── Schedule + Accountability ────────────────────────────────────────────────

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

// ── Notion API Handlers ───────────────────────────────────────────────────────
// All Notion routes degrade gracefully — return { notionConfigured: false } if secrets unset.

async function handleNotionLessons(url, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_LESSONS_DB) {
    return json({ notionConfigured: false, lessons: [], hint: "Set NOTION_API_KEY and NOTION_LESSONS_DB via wrangler secret put" });
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
    return json({ notionConfigured: false, progress: [], hint: "Set NOTION_API_KEY and NOTION_PROGRESS_DB via wrangler secret put" });
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

// ── Daily Digest ──────────────────────────────────────────────────────────────
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

// ── Cryptographic Immutable Ledger API ────────────────────────────────────────

// Shared helper — Agent99 auto-calls this for every significant event
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

// Event-sourced state derivation — rebuild student state from ledger events
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

// ── SOUL DNA CAPTURE PIPELINE ────────────────────────────────────────────────────
// POST /souldna — Submit raw soul DNA for legionnaire processing
async function handleSoulDNASubmit(body, env) {
  // Validate required fields
  if (!body.source || !body.content) {
    return json({ error: "Required: source, content" }, 400);
  }
  
  const timestamp = new Date().toISOString();
  const sessionTag = body.sessionTag || generateSessionTag();
  const tier = body.tier || "OPERATIONAL"; // GOVERNANCE|OPERATIONAL|PRODUCT|ARCHIVE
  const signalDensity = body.signalDensity || "MEDIUM"; // LOW|MEDIUM|HIGH|MAXIMUM
  
  // Validate content size (max 50KB) — preserve fidelity
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
  
  // ── Notion SOUL_DNA: BLACKLISTED — legacy data preserved in CANON/REINCARNATION ─
  
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

// GET /souldna/{id} — Check submission status
async function handleSoulDNAStatus(id, env) {
  if (!id || !id.startsWith("SDNAD-")) {
    return json({ error: "Invalid submission ID format" }, 400);
  }
  
  // Query ledger history for this submission
  try {
    const history = await handleLedgerHistory("sov100", 200, env);
    const historyText = await history.text();
    const historyData = JSON.parse(historyText);
    
    const submission = historyData.events?.find(e => e.data?.id === id);
    if (!submission) {
      return json({ error: "Submission not found", id }, 404);
    }
    
    return json({
      ok: true,
      id,
      status: submission.data.status || "RECEIVED",
      timestamp: submission.data.timestamp,
      sessionTag: submission.data.sessionTag,
      tier: submission.data.tier,
      signalDensity: submission.data.signalDensity,
      pipeline: {
        step0: { name: "REPRINT + FOOTNOTE", status: "PENDING", bibleChapter: `CANON/BIBLE-CH{XX}-${submission.data.sessionTag}.md` },
        step1: { name: "HEAVY_LEDGER", status: "PENDING", hlFile: `CANON/HEAVY-LEDGER/HL-{NNN}-${submission.data.sessionTag}.json` },
        step2: { name: "SSM_UPDATE", status: "PENDING", ssmFile: `CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md` },
        step3: { name: "REINCARNATION_LOG", status: "PENDING", logFile: `CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-${submission.data.sessionTag}.md` },
      }
    });
  } catch (e) {
    return json({ error: "Failed to query submission status", details: e.message }, 500);
  }
}

// GET /souldna/pipeline — Actionable pipeline steps grouped by tier
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
          "Format: L{NN}:{LAW_NAME}→{one_line_summary}"
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

// ── Agent 99 Translation Layer ────────────────────────────────────────────────
// SOV100 (Michael) → Agent99 (Obi/Translation) → Agent98 (Anakin/Chaos) →
// Agent97 (OB1/Audit) → Drones(1-96)

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

  // Agent 99 (Obi) — Intent classification + drone routing
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
      notes: `Anakin says: "${matchedDrones.length === 0 ? "No drone match — defaulting to CodeRunner. Risky." : `${matchedDrones.length} drones matched. Top pick looks solid.`}"`,
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

// ── Command Station Handlers ──────────────────────────────────────────────────

async function handleCommandSend(body, env) {
  const rawIntent = sanitizeInput((body.command || body.intent || "").slice(0, 2000));
  if (!rawIntent) return json({ error: "command or intent required" }, 400);
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);

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
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/queue?status=${encodeURIComponent(status)}&limit=${Math.min(limit, 100)}`));
}

async function handleCommandClaim(body, env) {
  if (!body.commandId) return json({ error: "commandId required" }, 400);
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
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
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
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
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/status?commandId=${encodeURIComponent(commandId)}`));
}

async function handleCommandHistory(limit, env) {
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}


// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORT BLOCK — Durable Object classes live in durable_objects.js
// Parsed by wrangler 4.x in translated ESM bundle.
export { LedgerDO, PetDO, CommandDO, MemoryDO }


