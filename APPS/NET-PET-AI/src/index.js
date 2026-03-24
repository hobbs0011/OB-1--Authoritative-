// src/index.js — NET-PET-AI Cloudflare Worker
// Natural English Training — Obi AI English Coach
// Bindings: SESSIONS (SessionDO), PROFILES (ProfileDO), PETS (PetDO), ASSETS
// Secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY

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
        return addCors(json({ error: err.message || "Internal error" }, 500));
      }
    }

    // Static assets (index.html, chat.js, app.js, etc.)
    return env.ASSETS.fetch(request);
  },
};

// ── API Router ────────────────────────────────────────────

async function handleAPI(path, request, env, url) {
  const method = request.method;

  // Health
  if (path === "/api/health" && method === "GET") {
    return json({ ok: true, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now() });
  }

  // Chat — DeepSeek
  if (path === "/api/chat" && method === "POST") {
    const body = await request.json();
    return handleChat(body, env);
  }

  // TTS — Deepgram Aura
  if (path === "/api/tts" && method === "POST") {
    const body = await request.json();
    return handleTTS(body, env);
  }

  // Onboarding
  if (path === "/api/onboarding" && method === "POST") {
    const body = await request.json();
    return handleOnboarding(body, env);
  }

  // Memory — save/retrieve conversation exchanges
  if (path === "/api/memory" && method === "POST") {
    const body = await request.json();
    return handleMemorySave(body, env);
  }
  if (path === "/api/memory" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    return handleMemoryGet(studentId, env);
  }

  // Lesson generation
  if (path === "/api/lesson" && method === "POST") {
    const body = await request.json();
    return handleLesson(body, env);
  }

  // Practice mode
  if (path === "/api/practice" && method === "POST") {
    const body = await request.json();
    return handlePractice(body, env);
  }

  // Feedback
  if (path === "/api/feedback" && method === "POST") {
    const body = await request.json();
    return handleFeedback(body, env);
  }

  // NET Pet — check-in
  if (path === "/api/netpet/checkin" && method === "POST") {
    const body = await request.json();
    return handlePetCheckin(body, env);
  }

  // NET Pet — state
  if (path === "/api/netpet/state" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    return handlePetState(studentId, env);
  }

  // Classroom — start session
  if (path === "/api/classroom/session/start" && method === "POST") {
    const body = await request.json();
    return handleClassStart(body, env);
  }

  // Classroom — log event
  if (path === "/api/classroom/event" && method === "POST") {
    const body = await request.json();
    return handleClassEvent(body, env);
  }

  // Classroom — get session
  if (path === "/api/classroom/session" && method === "GET") {
    const classId = url.searchParams.get("classId") || "";
    const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
    return handleClassSession(classId, totalStudents, env);
  }

  // Classroom — report
  if (path === "/api/classroom/report" && method === "GET") {
    const classId = url.searchParams.get("classId") || "";
    const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
    return handleClassReport(classId, totalStudents, env);
  }

  return json({ error: "Not found" }, 404);
}

// ── Chat (DeepSeek) ───────────────────────────────────────

async function handleChat(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const messages = body.messages || [];
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 200,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Say that again?";
  return json({ reply });
}

// ── TTS (Deepgram Aura) ───────────────────────────────────

async function handleTTS(body, env) {
  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not configured" }, 500);

  const text = (body.text || "").slice(0, 1000);
  if (!text) return json({ error: "No text provided" }, 400);

  const res = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    return json({ error: `Deepgram TTS ${res.status}` }, 502);
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
      ...corsHeaders(),
    },
  });
}

// ── Onboarding ────────────────────────────────────────────

async function handleOnboarding(body, env) {
  const id = env.PROFILES.idFromName(body.studentId || "unknown");
  const stub = env.PROFILES.get(id);
  return stub.fetch(new Request("https://do/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

// ── Memory ────────────────────────────────────────────────

async function handleMemorySave(body, env) {
  const studentId = body.studentId || "unknown";
  const id = env.SESSIONS.idFromName(studentId);
  const stub = env.SESSIONS.get(id);
  return stub.fetch(new Request("https://do/memory/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function handleMemoryGet(studentId, env) {
  if (!studentId) return json({ memory: [] });
  const id = env.SESSIONS.idFromName(studentId);
  const stub = env.SESSIONS.get(id);
  return stub.fetch(new Request("https://do/memory/get"));
}

// ── Lesson / Practice / Feedback (DeepSeek) ───────────────

async function handleLesson(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const prompt = `Generate a short English lesson for level ${body.level || "B1"} on the topic: ${body.topic || "daily conversation"}. Keep it practical, fun, and under 200 words. Include 3 example sentences and a mini practice exercise. Style: energetic, anti-shame, Tiger Voice.`;

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], max_tokens: 500, temperature: 0.7 }),
  });

  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ lesson: data.choices?.[0]?.message?.content || "Lesson generation failed" });
}

async function handlePractice(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const prompt = `Create a quick English practice drill for level ${body.level || "B1"} on topic: ${body.topic || "daily conversation"}. Give 5 fill-in-the-blank or short-answer questions. Make it fun and encouraging. Tiger Voice style.`;

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], max_tokens: 400, temperature: 0.7 }),
  });

  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ practice: data.choices?.[0]?.message?.content || "Practice generation failed" });
}

async function handleFeedback(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const prompt = `A Vietnamese English student wrote: "${body.studentResponse || ""}"

Give brief, encouraging feedback on their English. Correct any grammar mistakes by showing the corrected version naturally (don't lecture). Note any pronunciation risks for Vietnamese speakers. Keep it short and Tiger Voice style — tough love, anti-shame, volume over perfection.`;

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], max_tokens: 300, temperature: 0.7 }),
  });

  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ feedback: data.choices?.[0]?.message?.content || "Feedback generation failed" });
}

// ── NET Pet ───────────────────────────────────────────────

async function handlePetCheckin(body, env) {
  const studentId = body.studentId || "unknown";
  const id = env.PETS.idFromName(studentId);
  const stub = env.PETS.get(id);
  return stub.fetch(new Request("https://do/checkin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function handlePetState(studentId, env) {
  if (!studentId) return json({ state: null });
  const id = env.PETS.idFromName(studentId);
  const stub = env.PETS.get(id);
  return stub.fetch(new Request("https://do/state"));
}

// ── Classroom ─────────────────────────────────────────────

async function handleClassStart(body, env) {
  const classId = body.classId || "default";
  const id = env.SESSIONS.idFromName(`class-${classId}`);
  const stub = env.SESSIONS.get(id);
  return stub.fetch(new Request("https://do/class/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function handleClassEvent(body, env) {
  const classId = body.classId || "default";
  const id = env.SESSIONS.idFromName(`class-${classId}`);
  const stub = env.SESSIONS.get(id);
  return stub.fetch(new Request("https://do/class/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function handleClassSession(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const id = env.SESSIONS.idFromName(`class-${classId}`);
  const stub = env.SESSIONS.get(id);
  return stub.fetch(new Request(`https://do/class/session?totalStudents=${totalStudents}`));
}

async function handleClassReport(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const id = env.SESSIONS.idFromName(`class-${classId}`);
  const stub = env.SESSIONS.get(id);
  return stub.fetch(new Request(`https://do/class/report?totalStudents=${totalStudents}`));
}

// ── Durable Objects ───────────────────────────────────────

// SessionDO — handles conversation memory + classroom sessions
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
      this.sql.exec(`INSERT INTO memory (student_id, user_msg, obi_msg, ts) VALUES (?, ?, ?, ?)`,
        body.studentId || "unknown", exchange.user || "", exchange.obi || "", Date.now());
      return json({ ok: true });
    }

    if (path === "/memory/get") {
      const rows = this.sql.exec(`SELECT user_msg, obi_msg FROM memory ORDER BY id DESC LIMIT 20`).toArray().reverse();
      const memory = rows.map(r => ({ user: r.user_msg, obi: r.obi_msg }));
      return json({ memory });
    }

    if (path === "/class/start" && request.method === "POST") {
      const body = await request.json();
      this.sql.exec(`INSERT INTO class_sessions (class_id, teacher_id, total_students, started_at) VALUES (?, ?, ?, ?)`,
        body.classId || "default", body.teacherId || "obi", body.totalStudents || 40, Date.now());
      return json({ ok: true, classId: body.classId, startedAt: Date.now() });
    }

    if (path === "/class/event" && request.method === "POST") {
      const body = await request.json();
      this.sql.exec(`INSERT INTO class_events (class_id, student_id, type, rule_status, notes, ts) VALUES (?, ?, ?, ?, ?, ?)`,
        body.classId || "default", body.studentId || "", body.type || "", body.ruleStatus || "", body.notes || "", Date.now());
      return json({ ok: true });
    }

    if (path === "/class/session") {
      const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
      const session = this.sql.exec(`SELECT * FROM class_sessions ORDER BY id DESC LIMIT 1`).toArray()[0];
      const events = this.sql.exec(`SELECT * FROM class_events ORDER BY id DESC LIMIT 50`).toArray();
      return json({ session: session || null, events, totalStudents });
    }

    if (path === "/class/report") {
      const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
      const events = this.sql.exec(`SELECT * FROM class_events ORDER BY id`).toArray();
      const summary = events.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {});
      const reportText = `Class Report — ${events.length} events logged across ${totalStudents} students.\n` +
        Object.entries(summary).map(([k, v]) => `  ${k}: ${v}`).join("\n");
      return json({ reportText, events: events.length, summary });
    }

    return json({ error: "Not found" }, 404);
  }
}

// ProfileDO — student profiles
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
      this.sql.exec(
        `INSERT OR REPLACE INTO profiles (student_id, full_name, current_city, birthplace, english_level, goals, confidence_areas, occupation, fear_trigger, learning_history, motivation_now, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        b.studentId || "unknown", b.fullName || "", b.currentCity || "", b.birthplace || "",
        b.englishLevel || "", b.goals || "", b.confidenceAreas || "", b.occupation || "",
        b.fearTrigger || "", b.learningHistory || "", b.motivationNow || "", Date.now()
      );
      return json({ ok: true, studentId: b.studentId });
    }

    if (url.pathname === "/profile" && request.method === "GET") {
      const rows = this.sql.exec(`SELECT * FROM profiles LIMIT 1`).toArray();
      return json({ profile: rows[0] || null });
    }

    return json({ error: "Not found" }, 404);
  }
}

// PetDO — NET Pet gamification (streak, XP, mood)
export class PetDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS pet_state (id INTEGER PRIMARY KEY CHECK (id = 1), streak INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, mood TEXT DEFAULT 'neutral', total_sessions INTEGER DEFAULT 0, last_checkin INTEGER DEFAULT 0)`);
    this.sql.exec(`INSERT OR IGNORE INTO pet_state (id, streak, xp, mood, total_sessions, last_checkin) VALUES (1, 0, 0, 'neutral', 0, 0)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, minutes INTEGER, confidence INTEGER, ts INTEGER)`);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/checkin" && request.method === "POST") {
      const body = await request.json();
      const minutes = body.minutes || 5;
      const confidence = body.confidence || 5;
      const now = Date.now();

      // Log the check-in
      this.sql.exec(`INSERT INTO checkins (minutes, confidence, ts) VALUES (?, ?, ?)`, minutes, confidence, now);

      // Get current state
      const current = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray()[0];
      const lastCheckin = current.last_checkin || 0;
      const dayMs = 86400000;
      const hoursSince = (now - lastCheckin) / 3600000;

      // Streak logic: consecutive days
      let streak = current.streak;
      if (hoursSince < 48 && hoursSince > 4) streak += 1;
      else if (hoursSince >= 48) streak = 1;
      // If checking in same session (< 4 hrs), don't bump streak

      // XP: minutes * confidence multiplier
      const xpGain = Math.round(minutes * (1 + confidence / 10));
      const newXp = current.xp + xpGain;

      // Mood based on recent activity
      let mood = "neutral";
      if (streak >= 5 && confidence >= 7) mood = "fired_up";
      else if (streak >= 3) mood = "happy";
      else if (confidence <= 3) mood = "sleepy";
      else if (streak >= 1) mood = "content";

      const totalSessions = current.total_sessions + 1;

      this.sql.exec(`UPDATE pet_state SET streak = ?, xp = ?, mood = ?, total_sessions = ?, last_checkin = ? WHERE id = 1`,
        streak, newXp, mood, totalSessions, now);

      const state = { streak, xp: newXp, mood, totalSessions, xpGain };
      return json({ ok: true, state });
    }

    if (url.pathname === "/state") {
      const rows = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray();
      const s = rows[0] || { streak: 0, xp: 0, mood: "neutral", total_sessions: 0 };
      return json({ state: { streak: s.streak, xp: s.xp, mood: s.mood, totalSessions: s.total_sessions } });
    }

    return json({ error: "Not found" }, 404);
  }
}

// ── Utilities ─────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function addCors(response) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders())) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}
