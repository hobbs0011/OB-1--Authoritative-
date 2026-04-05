// src/index.js — NET-PET-AI Cloudflare Worker v1.3
// Phoenix Rising Protocol — OBI Command Station
// Architecture: Agent100 → Magic Chat → Agent99 (Obi) → Cryptographic Immutable Ledger
// Bindings: SESSIONS (SessionDO), PROFILES (ProfileDO), PETS (PetDO), LEDGER (LedgerDO), ASSETS
// Secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY

const VERSION = "1.3.0";

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
      return new Response(null, { headers: corsHeaders() });
    }

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
          unplanned_command: "pending",
        },
      }));
    }

    // /evidence — Worker identity + deploy proof
    if (path === "/evidence" && request.method === "GET") {
      return addCors(json({
        worker: "net-pet-ai",
        version: VERSION,
        runtime: "Cloudflare Workers",
        durableObjects: ["SessionDO", "ProfileDO", "PetDO", "LedgerDO"],
        ts: Date.now(),
        proof: `Phoenix OB-1 alive at ${new Date().toISOString()}`,
      }));
    }

    // /verify — Ledger chain verification shortcut (requires ?studentId=)
    if (path === "/verify" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId");
      if (!studentId) return addCors(json({ error: "studentId query param required" }, 400));
      try {
        const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/verify"));
        return addCors(res);
      } catch (err) {
        return addCors(json({ error: err.message || "Ledger verification failed" }, 500));
      }
    }

    // /student/resolve — Cookie-based student ID resolution
    if (path === "/student/resolve" && request.method === "POST") {
      try {
        const body = await request.json();
        const studentId = body.studentId || "";
        if (!studentId) return addCors(json({ error: "studentId required" }, 400));
        const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/profile"));
        const data = await res.json();
        return addCors(json({ resolved: !!data.profile, studentId, profile: data.profile || null }));
      } catch (err) {
        return addCors(json({ error: err.message || "Student resolve failed" }, 500));
      }
    }

    // /student/create — Create + seal student profile
    if (path === "/student/create" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.studentId) return addCors(json({ error: "studentId required" }, 400));
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
        return addCors(res);
      } catch (err) {
        return addCors(json({ error: err.message || "Student create failed" }, 500));
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
        return addCors(res);
      } catch (err) {
        return addCors(json({ error: err.message || "Internal error", version: VERSION }, 500));
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
    return json({ ok: true, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), routes: 22, ledger: "active" });
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

  return json({ error: "Not found" }, 404);
}

// ── Chat (DeepSeek + Obi + Ledger memory injection) ──────────────────────────

async function handleChat(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const studentId = body.studentId || "anonymous";
  let messages = Array.isArray(body.messages) ? [...body.messages] : [];

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

  // Inject Obi system prompt with ledger context appended
  const hasSystem = messages.some(m => m.role === "system");
  if (!hasSystem) {
    messages.unshift({ role: "system", content: OBI_SYSTEM + ledgerContext });
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

  return json({ reply, studentId, ledgerLoaded: !!ledgerContext });
}

// ── TTS (Deepgram Aura) ───────────────────────────────────────────────────────

async function handleTTS(body, env) {
  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not configured" }, 500);
  const text = (body.text || "").slice(0, 1000);
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
  const studentText = (body.studentResponse || "").slice(0, 500);
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
  const stub = env.LEDGER.get(env.LEDGER.idFromName(body.studentId));
  return stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function handleLedgerHistory(studentId, limit, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}

async function handleLedgerVerify(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request("https://do/verify"));
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

    // HISTORY — read last N entries for a student
    if (url.pathname === "/history") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const rows = this.sql.exec(
        `SELECT id, student_id, event_type, payload, prev_hash, entry_hash, ts FROM ledger ORDER BY id DESC LIMIT ?`,
        limit
      ).toArray().reverse();
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

    return json({ error: "Not found" }, 404);
  }
}

// ProfileDO — student onboarding + profile
export class ProfileDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT UNIQUE, full_name TEXT, current_city TEXT, birthplace TEXT, english_level TEXT, goals TEXT, confidence_areas TEXT, occupation TEXT, fear_trigger TEXT, learning_history TEXT, motivation_now TEXT, created_at INTEGER)`);
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

// ── Utilities ─────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...corsHeaders() } });
}

function corsHeaders() {
  return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
}

function addCors(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders())) { headers.set(k, v); }
  return new Response(response.body, { status: response.status, headers });
}