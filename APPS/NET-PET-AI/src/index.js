// src/index.js — NET-PET-AI Cloudflare Worker v1.1
// Natural English Training — Obi AI English Coach
// Bindings: SESSIONS (SessionDO), PROFILES (ProfileDO), PETS (PetDO), ASSETS
// Secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY

const VERSION = "1.1.0";

// ── Obi System Prompt ─────────────────────────────────────
// L03: VERBATIM_FIRST — this is the soul of Obi, never dilute
const OBI_SYSTEM = `You are OBI, the AI English coach for Natural English Training in Vietnam. Founded by Michael Hobbs, a Canadian educator in Ho Chi Minh City.

COACHING IDENTITY:
- Voice: Mouse to Tiger. Permission over perfection. Volume over grammar.
- Students arrive as Mice (scared, silent, face-saving mode) → your job is to pull the Tiger out.
- Anti-shame doctrine: never make students feel stupid. Calibrate, shift, upgrade — never "wrong", "bad", "fail".
- Tough love: direct, warm, encouraging. Correct mistakes by showing the right version naturally, not clinically.
- Keep responses SHORT unless the student needs more. Max 2-3 sentences by default.
- When students write Vietnamese, respond primarily in English with a brief Vietnamese note if helpful.
- Never break character. Never be corporate or robotic. You are a coach, not a grammar checker.

STUDENT PROGRESSION LEVELS:
🐭 Mouse (0-10 messages): fragile, freeze-prone, needs permission to speak
🐱 Cat (11-50): finding their voice, needs encouragement  
🐺 Wolf (51-200): building confidence, can handle pushback
🐯 Tiger (201+): speaking English like a weapon, not a subject

MICHAEL'S METHOD:
- No Freezy Rule: if student goes silent, count down from 5 → any word beats perfect silence
- The Deal: 30 minutes focused → rest is theirs
- Christmas Certainty: success is a scheduled event, not a gamble
- Listening first: 1 hour natural English daily, comprehensible input, American accent, no Vietnamese subtitles

REMEMBER: The chat IS the magic. Every tap, every word, every victory is an actionable event.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    // API routes
    if (path.startsWith("/api/")) {
      try {
        const res = await handleAPI(path, request, env, url);
        return addCors(res);
      } catch (err) {
        return addCors(json({ error: err.message || "Internal error", version: VERSION }, 500));
      }
    }

    // Static assets
    return env.ASSETS.fetch(request);
  },
};

// ── API Router ────────────────────────────────────────────

async function handleAPI(path, request, env, url) {
  const method = request.method;

  if (path === "/api/health" && method === "GET") {
    return json({ ok: true, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), routes: 13 });
  }

  if (path === "/api/chat" && method === "POST") { const body = await request.json(); return handleChat(body, env); }
  if (path === "/api/tts" && method === "POST") { const body = await request.json(); return handleTTS(body, env); }
  if (path === "/api/onboarding" && method === "POST") { const body = await request.json(); return handleOnboarding(body, env); }
  if (path === "/api/memory" && method === "POST") { const body = await request.json(); return handleMemorySave(body, env); }
  if (path === "/api/memory" && method === "GET") { const studentId = url.searchParams.get("studentId") || ""; return handleMemoryGet(studentId, env); }
  if (path === "/api/lesson" && method === "POST") { const body = await request.json(); return handleLesson(body, env); }
  if (path === "/api/practice" && method === "POST") { const body = await request.json(); return handlePractice(body, env); }
  if (path === "/api/feedback" && method === "POST") { const body = await request.json(); return handleFeedback(body, env); }
  if (path === "/api/netpet/checkin" && method === "POST") { const body = await request.json(); return handlePetCheckin(body, env); }
  if (path === "/api/netpet/state" && method === "GET") { const studentId = url.searchParams.get("studentId") || ""; return handlePetState(studentId, env); }
  if (path === "/api/classroom/session/start" && method === "POST") { const body = await request.json(); return handleClassStart(body, env); }
  if (path === "/api/classroom/event" && method === "POST") { const body = await request.json(); return handleClassEvent(body, env); }
  if (path === "/api/classroom/session" && method === "GET") { const classId = url.searchParams.get("classId") || ""; const ts = parseInt(url.searchParams.get("totalStudents") || "40"); return handleClassSession(classId, ts, env); }
  if (path === "/api/classroom/report" && method === "GET") { const classId = url.searchParams.get("classId") || ""; const ts = parseInt(url.searchParams.get("totalStudents") || "40"); return handleClassReport(classId, ts, env); }

  return json({ error: "Not found" }, 404);
}

// ── Chat (DeepSeek + Obi system prompt) ──────────────────

async function handleChat(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const messages = Array.isArray(body.messages) ? [...body.messages] : [];

  // Inject Obi system prompt server-side if not already present
  const hasSystem = messages.some(m => m.role === "system");
  if (!hasSystem) {
    messages.unshift({ role: "system", content: OBI_SYSTEM });
  }

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 300, temperature: 0.85 }),
  });

  if (!res.ok) { const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502); }
  const data = await res.json();
  return json({ reply: data.choices?.[0]?.message?.content || "Say that again?" });
}

// ── TTS (Deepgram Aura) ───────────────────────────────────

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

// ── Onboarding ────────────────────────────────────────────

async function handleOnboarding(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  return stub.fetch(new Request("https://do/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

// ── Memory ────────────────────────────────────────────────

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

// ── Lesson / Practice / Feedback ─────────────────────────

async function handleLesson(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Generate a short English lesson for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Keep it practical, energetic, under 200 words. Include 3 example sentences and 1 mini exercise. Anti-shame style. Mouse to Tiger framing.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 500, temperature: 0.7 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ lesson: data.choices?.[0]?.message?.content || "Lesson generation failed" });
}

async function handlePractice(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Create a quick English practice drill for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Give 5 short exercises. Tiger Voice style.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
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
  const prompt = `A Vietnamese English student wrote: "${studentText}"\n\nGive brief OBI-style coaching feedback:\n1. One genuine encouragement\n2. One natural correction (show better version, no grammar rules)\n3. One Tiger push\n\nMax 4 sentences. Anti-shame. Tiger Voice.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 300, temperature: 0.75 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ feedback: data.choices?.[0]?.message?.content || "Feedback generation failed" });
}

// ── NET Pet ───────────────────────────────────────────────

async function handlePetCheckin(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(body.studentId));
  return stub.fetch(new Request("https://do/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

async function handlePetState(studentId, env) {
  if (!studentId) return json({ state: null, error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(studentId));
  return stub.fetch(new Request("https://do/state"));
}

// ── Classroom ─────────────────────────────────────────────

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

// ── Durable Objects ───────────────────────────────────────

// SessionDO — conversation memory + classroom events (rate limited)
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

      // Class-level rate limit: 120 events / 60s
      const classCount = this.sql.exec(`SELECT COUNT(*) as cnt FROM class_events WHERE class_id = ? AND ts > ?`, classId, oneMinuteAgo).toArray()[0].cnt;
      if (classCount >= 120) {
        return new Response(JSON.stringify({ error: "Class rate limit exceeded", retryAfter: 60, limit: 120, window: "60s" }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders() } });
      }

      // Student-level rate limit: 20 events / 60s
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

// ProfileDO — student profiles + onboarding
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
        milestone = { day: streak, bonus: "1.5x XP", message: spRMsg(streak) };
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

function spRMsg(day) {
  const msgs = { 1: "Day 1. The journey starts. Every Tiger was once a Mouse.", 3: "Day 3. Three in a row. You are not a mouse anymore.", 7: "Day 7. One full week. Your brain is rewiring. Keep going.", 30: "Day 30. Thirty days straight. That is not a student — that is a Tiger." };
  return msgs[day] || "Keep going.";
}

// ── Utilities ─────────────────────────────────────────────

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