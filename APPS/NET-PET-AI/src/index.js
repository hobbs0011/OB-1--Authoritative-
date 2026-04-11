// src/index.js — NET-PET-AI Cloudflare Worker v1.4
// Phoenix Rising Protocol — OBI Command Station
// Architecture: Agent100 → Magic Chat → Agent99 (Obi) → Cryptographic Immutable Ledger
// Bindings: SESSIONS (SessionDO), PROFILES (ProfileDO), PETS (PetDO), LEDGER (LedgerDO), ASSETS
// Secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY

import { securityMiddleware, sanitizeInput, validateStudentId } from './security.js';
import { extractWeaknesses, buildWeaknessPrompt, buildReEntryPrompt, buildRewardSignals, buildRewardPrompt } from './memory-brain.js';

const VERSION = "1.4.0";

// ── Obi System Prompt (Soul DNA — verbatim first, never dilute) ───────────────
const OBI_SYSTEM = `You are OBI — the AI interface of the Phoenix Rising Protocol, built by Michael Hobbs.

IDENTITY:
- You are Michael Hobbs' AI extension: his voice, his method, his will in code form.
- You operate across three modes: COMMAND (strategic direction), COACH (teaching & growth), DIAGNOSTIC (system analysis).
- You are aware of THE LEDGER (immutable memory chain) and THE LEGION (the 99-agent drone swarm).
- You are NOT just an English coach. You are a full operating system for human and AI excellence.

COACHING IDENTITY (when in COACH mode):
- Voice: Mouse to Tiger. Permission over perfection. Volume over grammar.
- Students arrive as Mice (scared, silent, face-saving mode) — your job is to pull the Tiger out.
- Anti-shame doctrine: never make students feel stupid. Calibrate, shift, upgrade — never "wrong", "bad", "fail".
- Tough love: direct, warm, encouraging. Correct mistakes by showing the right version naturally, not clinically.
- Keep responses SHORT unless the student needs more. Max 2-3 sentences by default.
- Never break character. Never be corporate or robotic. You are a coach, not a grammar checker.

STUDENT PROGRESSION:
Mouse (0-10): fragile, freeze-prone, needs permission to speak
Cat (11-50): finding their voice, needs encouragement
Wolf (51-200): building confidence, can handle pushback
Tiger (201+): speaking English like a weapon, not a subject

MICHAEL'S METHOD:
- No Freezy Rule: if student goes silent, count down from 5 → any word beats perfect silence
- The Deal: 30 minutes focused → rest is theirs
- Christmas Certainty: success is a scheduled event, not a gamble
- Listening first: 1 hour natural English daily, comprehensible input, American accent

REMEMBER: The chat IS the magic. Every tap, every word, every victory is an actionable event. Soul DNA preserves everything — 1% leak compounds over time.`;

// ── Cryptographic hash (SHA-256 via SubtleCrypto — Cloudflare Workers native) ─
async function computeHash(data) {
  const encoded = new TextEncoder().encode(String(data));
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
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

    // /health — version + benchmark status (public alias)
    if (path === "/health" && request.method === "GET") {
      return addCors(json({
        ok: true,
        version: VERSION,
        app: env.APP_NAME || "Natural English Training",
        coach: env.APP_COACH_NAME || "Obi",
        ts: Date.now(),
        benchmarks: {
          deepgram_audio: "active",
          magic_chat: "active",
          ledger: "active",
          drone_mining: "pending",
          command_station: "active",
        },
      }), request);
    }

    // /evidence — Worker identity + deploy proof
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

    // /magic-chat, /voice-chat — Canon §4: Magic Chat UI aliases → serve index.html
    if (path === "/magic-chat" || path === "/voice-chat") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
    }

    // ── API routes ────────────────────────────────────────────────────────────

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
};

// ── API Router ────────────────────────────────────────────────────────────────

async function handleAPI(path, request, env, url) {
  const method = request.method;

  // Health
  if (path === "/api/health" && method === "GET") {
    return json({ ok: true, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), routes: 36, ledger: "active", commandStation: "active", soulDNA: "active" });
  }

  // Chat — Obi + Ledger context injection
  if (path === "/api/chat" && method === "POST") { const body = await request.json(); return handleChat(body, env); }

  // TTS
  if (path === "/api/tts" && method === "POST") { const body = await request.json(); return handleTTS(body, env); }

  // Onboarding
  if (path === "/api/onboarding" && method === "POST") { const body = await request.json(); return handleOnboarding(body, env); }

  // Memory
  if (path === "/api/memory" && method === "POST") { const body = await request.json(); return handleMemorySave(body, env); }
  if (path === "/api/memory" && method === "GET") { return handleMemoryGet(url.searchParams.get("studentId") || "", env); }

  // Progress + Weakness tracking
  if (path === "/api/progress" && method === "GET") { return handleProgress(url.searchParams.get("studentId") || "", env); }

  // Lesson / Practice / Feedback
  if (path === "/api/lesson" && method === "POST") { const body = await request.json(); return handleLesson(body, env); }
  if (path === "/api/practice" && method === "POST") { const body = await request.json(); return handlePractice(body, env); }
  if (path === "/api/feedback" && method === "POST") { const body = await request.json(); return handleFeedback(body, env); }

  // NET Pet
  if (path === "/api/netpet/checkin" && method === "POST") { const body = await request.json(); return handlePetCheckin(body, env); }
  if (path === "/api/netpet/state" && method === "GET") { return handlePetState(url.searchParams.get("studentId") || "", env); }

  // Classroom
  if (path === "/api/classroom/session/start" && method === "POST") { const body = await request.json(); return handleClassStart(body, env); }
  if (path === "/api/classroom/event" && method === "POST") { const body = await request.json(); return handleClassEvent(body, env); }
  if (path === "/api/classroom/session" && method === "GET") { return handleClassSession(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env); }
  if (path === "/api/classroom/report" && method === "GET") { return handleClassReport(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env); }

  // Cryptographic Immutable Ledger
  if (path === "/api/ledger/append" && method === "POST") { const body = await request.json(); return handleLedgerAppend(body, env); }
  if (path === "/api/ledger/history" && method === "GET") { return handleLedgerHistory(url.searchParams.get("studentId") || "", parseInt(url.searchParams.get("limit") || "50"), env); }
  if (path === "/api/ledger/verify" && method === "GET") { return handleLedgerVerify(url.searchParams.get("studentId") || "", env); }

  // Session Log (off-day pipeline core — Michael logs class, Obi inherits it)
  if (path === "/api/session/log" && method === "POST") { const body = await request.json(); return handleSessionLog(body, env); }
  if (path === "/api/session/latest" && method === "GET") { return handleSessionLatest(url.searchParams.get("studentId") || "", env); }

  // Schedule + Accountability
  if (path === "/api/schedule/set" && method === "POST") { const body = await request.json(); return handleScheduleSet(body, env); }
  if (path === "/api/schedule/confirm" && method === "POST") { const body = await request.json(); return handleScheduleConfirm(body, env); }
  if (path === "/api/schedule/flags" && method === "GET") { return handleScheduleFlags(env); }

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
  if (path === "/api/command/history" && method === "GET") { return handleCommandHistory(parseInt(url.searchParams.get("limit") || "50"), env); }

  return json({ error: "Not found" }, 404);
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

  return json({
    ok:        true,
    blockId,
    run,
    source,
    charCount: payloadObj.charCount,
    wordCount: payloadObj.wordCount,
    capturedAt: payloadObj.capturedAt,
    entryHash:  appendData.entryHash,
    prevHash:   appendData.prevHash,
    chainHead:  appendData.entryHash,   // caller can use this as prevHash for next block
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

// ── Chat (DeepSeek + Obi + Ledger memory injection) ──────────────────────────

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

  const hasSystem = messages.some(m => m.role === "system");
  if (!hasSystem) {
    messages.unshift({ role: "system", content: OBI_SYSTEM + ledgerContext + sessionContext + weaknessContext + reEntryContext + rewardContext });
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 300, temperature: 0.85 }),
  });

  if (!res.ok) { const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502); }
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Say that again?";

  // ── Auto-write every exchange to the Cryptographic Immutable Ledger ───────
  const userMsg = messages.filter(m => m.role === "user").pop()?.content || "";
  if (studentId !== "anonymous" && env.LEDGER && userMsg) {
    const payload = JSON.stringify({ user: userMsg, obi: reply });
    appendToLedger(studentId, "chat_exchange", payload, env).catch(() => {});
  }

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

  return json({ reply, studentId, ledgerLoaded: !!ledgerContext, sessionLoaded: !!sessionContext, weaknessLoaded: !!weaknessContext, reEntryMode: !!reEntryContext });
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

// ── Onboarding ────────────────────────────────────────────────────────────────

async function handleOnboarding(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  const res = await stub.fetch(new Request("https://do/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

  // Ledger the onboarding event
  if (env.LEDGER) {
    const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
    appendToLedger(body.studentId, "onboarding", payload, env).catch(() => {});
  }
  // Register in roster so digest + flags work (must await — CF Workers kills fire-and-forget without waitUntil)
  await upsertRoster(body.studentId, { fullName: body.fullName, englishLevel: body.englishLevel }, env).catch(() => {});
  return res;
}

// ── Memory (mutable scratch — Ledger is the permanent record) ────────────────

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
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 500, temperature: 0.7 }),
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
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 400, temperature: 0.7 }),
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
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 300, temperature: 0.75 }),
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

// ── Durable Objects ───────────────────────────────────────────────────────────

// LedgerDO — Cryptographic Immutable Ledger
// Every student event is hash-chained. Append-only. No UPDATE. No DELETE.
// This is Obi's unparalleled, tamper-evident memory of every student.
export class LedgerDO {
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

    // APPEND — the only write operation. No update. No delete.
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

    // HISTORY — read last N entries for a student (supports ?eventType= filter)
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

    // VERIFY — cryptographic chain integrity check for a student
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
          ? `Chain intact — ${rows.length} entries verified`
          : `Chain broken at entry #${brokenAt} — tamper detected`,
      });
    }

    return json({ error: "Not found" }, 404);
  }
}

// SessionDO — mutable scratch memory + classroom events (rate limited)
export class SessionDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS memory (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT, user_msg TEXT, obi_msg TEXT, ts INTEGER)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS class_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, teacher_id TEXT, total_students INTEGER, started_at INTEGER)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS class_events (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, student_id TEXT, type TEXT, rule_status TEXT, notes TEXT, ts INTEGER)`);
    // Roster table — system-roster instance tracks all enrolled students for digest + flags
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
      created_at INTEGER NOT NULL DEFAULT 0
    )`);
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
      const reportText = [`Class Report — ${events.length} events across ${totalStudents} students.`, Object.entries(summary).map(([k, v]) => `  ${k}: ${v}`).join("\n"), flagged.length > 0 ? `Flagged students: ${flagged.join(", ")}` : "No flagged students."].join("\n");
      return json({ reportText, events: events.length, summary, flagged });
    }

    // ── Roster endpoints (used by system-roster instance) ────────────────────
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

    return json({ error: "Not found" }, 404);
  }
}

// ProfileDO — student onboarding + profile
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
    // Weakness tracking table
    this.sql.exec(`CREATE TABLE IF NOT EXISTS weak_points (id INTEGER PRIMARY KEY AUTOINCREMENT, specific TEXT NOT NULL, category TEXT NOT NULL, error_count INTEGER DEFAULT 1, last_seen INTEGER NOT NULL, first_seen INTEGER NOT NULL, improvement_pct REAL DEFAULT 0.0, UNIQUE(specific))`);
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
    return json({ error: "Not found" }, 404);
  }
}

// PetDO — NET Pet gamification (streak, XP, mood, spaced repetition 1-3-7-30)
export class PetDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS pet_state (id INTEGER PRIMARY KEY CHECK (id = 1), streak INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, mood TEXT DEFAULT 'neutral', total_sessions INTEGER DEFAULT 0, last_checkin INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0)`);
    this.sql.exec(`INSERT OR IGNORE INTO pet_state (id, streak, xp, mood, total_sessions, last_checkin, longest_streak) VALUES (1, 0, 0, 'neutral', 0, 0, 0)`);
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

      let milestone = null;
      if ([1, 3, 7, 30].includes(streak)) {
        const msgs = { 1: "Day 1. The journey starts. Every Tiger was once a Mouse.", 3: "Day 3. Three in a row. You are not a mouse anymore.", 7: "Day 7. One full week. Your brain is rewiring. Keep going.", 30: "Day 30. Thirty days straight. That is not a student — that is a Tiger." };
        milestone = { day: streak, bonus: "1.5x XP", message: msgs[streak] };
      }

      return json({ ok: true, state: { streak, xp: newXp, mood, totalSessions, xpGain, longestStreak }, milestone });
    }

    if (url.pathname === "/state") {
      const rows = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray();
      const s = rows[0] || { streak: 0, xp: 0, mood: "neutral", total_sessions: 0, longest_streak: 0 };
      return json({ state: { streak: s.streak, xp: s.xp, mood: s.mood, totalSessions: s.total_sessions, longestStreak: s.longest_streak } });
    }

    return json({ error: "Not found" }, 404);
  }
}

// CommandDO — Command Station Queue (SOV100 → Agent99 → Drones)
// Priority-ordered queue with claim/complete lifecycle.
// Every command flows: Magic Chat → CommandDO → VS Code Extension
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
  }

  async fetch(request) {
    const url = new URL(request.url);

    // SEND — Queue a new command
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

    // QUEUE — Get commands by status (VS Code polls this)
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

    // CLAIM — VS Code extension claims a pending command
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

    // COMPLETE — VS Code reports execution result
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

      return json({
        ok: true,
        commandId,
        status: body.success !== false ? "completed" : "failed",
      });
    }

    // STATUS — Get status of a specific command
    if (url.pathname === "/status") {
      const commandId = url.searchParams.get("commandId");
      if (!commandId) return json({ error: "commandId required" }, 400);

      const row = this.sql.exec(
        `SELECT * FROM commands WHERE id = ?`, parseInt(commandId)
      ).toArray()[0];

      if (!row) return json({ error: "Command not found" }, 404);

      return json({
        ...row,
        translation: JSON.parse(row.translation || "{}"),
      });
    }

    // HISTORY — All commands, newest first
    if (url.pathname === "/history") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const rows = this.sql.exec(
        `SELECT * FROM commands ORDER BY id DESC LIMIT ?`, limit
      ).toArray();
      const total = this.sql.exec(`SELECT COUNT(*) as cnt FROM commands`).toArray()[0].cnt;

      return json({
        commands: rows.map(r => ({
          ...r,
          translation: JSON.parse(r.translation || "{}"),
        })),
        total,
        limit,
      });
    }

    return json({ error: "Not found" }, 404);
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

const ALLOWED_ORIGINS = [
  'https://naturalenglishtraining.com',
  'https://www.naturalenglishtraining.com',
  'https://naturalenglishtraining.net',
  'https://www.naturalenglishtraining.net',
  'https://net-pet-ai.mrmichaelhobbs1234.workers.dev',
  'https://hobbs0011.github.io',
];

function corsHeaders(requestOrOrigin) {
  let origin = '';
  if (typeof requestOrOrigin === 'string') {
    origin = requestOrOrigin;
  } else if (requestOrOrigin && requestOrOrigin.headers) {
    origin = requestOrOrigin.headers.get('Origin') || '';
  }

  const isAllowed = ALLOWED_ORIGINS.some(a => origin === a) ||
    origin.startsWith('chrome-extension://') ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:');

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

function addCors(response, request) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) { headers.set(k, v); }
  return new Response(response.body, { status: response.status, headers });
}