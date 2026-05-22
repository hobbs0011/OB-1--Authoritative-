// src/index.js
// NET-PET-AI Ship Version (MVP)

const VERSION = "2.0.0";

const OBI_SYSTEM_PROMPT = [
  "You are OBI, an English coach.",
  "Rules:",
  "- Correct mistakes first.",
  "- Keep response short.",
  "- Focus on one improvement point.",
  "- Always include a repeat drill.",
  "- End with a score from 0 to 100.",
  "Output format:",
  "Correct: <sentence>",
  "Why: <short reason>",
  "Repeat: <short drill>",
  "Score: <number>/100",
].join("\n");

function json(data, status = 200, request = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
    },
  });
}

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

function sanitizeMessage(input) {
  return String(input || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function sanitizeUserId(input) {
  const id = String(input || "anon").trim().toLowerCase();
  return id.replace(/[^a-z0-9_-]/g, "").slice(0, 64) || "anon";
}

function extractMessageFromBody(body) {
  if (typeof body?.message === "string" && body.message.trim()) {
    return body.message;
  }

  if (Array.isArray(body?.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i -= 1) {
      const msg = body.messages[i];
      if (msg?.role === "user" && typeof msg.content === "string" && msg.content.trim()) {
        return msg.content;
      }
    }
  }

  return "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if ((path === "/health" || path === "/api/health") && request.method === "GET") {
      return json(
        {
          ok: true,
          version: VERSION,
          mode: "ship-mvp",
          memoryBinding: Boolean(env.MEMORY),
          deepseekConfigured: Boolean(env.DEEPSEEK_API_KEY),
          app: env.APP_NAME || "Natural English Training",
          coach: env.APP_COACH_NAME || "Obi",
          ts: Date.now(),
        },
        200,
        request,
      );
    }

    if ((path === "/chat" || path === "/api/chat") && request.method === "POST") {
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, request);
      }

      const userId = sanitizeUserId(body.userId || body.studentId || "anon");
      const message = sanitizeMessage(extractMessageFromBody(body));
      if (!message) {
        return json({ error: "message required" }, 400, request);
      }

      const id = env.MEMORY.idFromName(userId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if ((path === "/daily" || path === "/api/daily") && (request.method === "GET" || request.method === "POST")) {
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      const studentId = sanitizeUserId(
        url.searchParams.get("studentId") || url.searchParams.get("userId") || "anon",
      );

      const id = env.MEMORY.idFromName(studentId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/daily", { method: "GET" });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if (path === "/api/memory" && request.method === "GET") {
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      const studentId = sanitizeUserId(
        url.searchParams.get("studentId") || url.searchParams.get("userId") || "anon",
      );
      const id = env.MEMORY.idFromName(studentId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/memory", { method: "GET" });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if (path === "/api/onboarding" && request.method === "POST") {
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, request);
      }

      const studentId = sanitizeUserId(body.studentId || body.userId || "anon");
      const id = env.MEMORY.idFromName(studentId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: String(body.englishLevel || "A1"),
          goals: String(body.goals || "daily speaking"),
        }),
      });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if (path === "/" && request.method === "GET") {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response("OBI online", { status: 200, headers: corsHeaders(request) });
    }

    if (env.ASSETS && request.method === "GET") {
      return env.ASSETS.fetch(request);
    }

    return json({ error: "Not found" }, 404, request);
  },
};

function detectWeakArea(message, reply) {
  const m = message.toLowerCase();
  const r = reply.toLowerCase();
  if (m.includes("yesterday") && !m.includes("went") && r.includes("went")) return "past tense";
  if (m.includes(" he ") && m.includes(" go ") && r.includes("goes")) return "third-person singular";
  if (m.includes("i am agree") || r.includes("i agree")) return "common phrase correction";
  return null;
}

function scoreAttempt(message, reply) {
  const m = message.toLowerCase();
  const r = reply.toLowerCase();
  let score = 80;
  if (m === r) score = 92;
  if (m.includes("yesterday") && !m.includes("went")) score -= 18;
  if (m.split(" ").length < 4) score -= 10;
  return Math.max(40, Math.min(98, score));
}

async function callDeepSeek(message, memory, apiKey) {
  const history = (memory.history || []).slice(-6);
  const contextLines = history
    .map((h) => `Student: ${h.message}\nOBI: ${h.reply}`)
    .join("\n---\n");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        { role: "system", content: OBI_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Student message: ${message}`,
            `Weak areas: ${(memory.weakAreas || []).join(", ") || "none"}`,
            `History:\n${contextLines || "none"}`,
          ].join("\n\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "Correct: Please try again with one clear sentence.\nWhy: I need more context.\nRepeat: I can say one clear English sentence.\nScore: 60/100";
}

function fallbackReply(message) {
  const raw = message.trim();
  let corrected = raw;
  let why = "Clearer grammar makes your meaning stronger.";

  if (/\bi go yesterday\b/i.test(raw)) {
    corrected = raw.replace(/\bi go yesterday\b/i, "I went yesterday");
    why = "Use past tense 'went' for yesterday.";
  } else if (/\bi am agree\b/i.test(raw)) {
    corrected = raw.replace(/\bi am agree\b/i, "I agree");
    why = "Say 'I agree', not 'I am agree'.";
  } else if (/\bhe go to\b/i.test(raw)) {
    corrected = raw.replace(/\bhe go to\b/i, "He goes to");
    why = "Use 'goes' with he/she/it in present simple.";
  }

  const score = scoreAttempt(raw, corrected);
  return [
    `Correct: ${corrected}`,
    `Why: ${why}`,
    `Repeat: Say this three times: ${corrected}`,
    `Score: ${score}/100`,
  ].join("\n");
}

function updateStreak(lastActive, now) {
  if (!lastActive) return 1;
  const lastDay = Math.floor(lastActive / 86400000);
  const nowDay = Math.floor(now / 86400000);
  const diff = nowDay - lastDay;
  if (diff <= 0) return null;
  if (diff === 1) return "increment";
  return "reset";
}

export class MemoryDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/chat" && request.method === "POST") {
      return this.handleChat(request);
    }

    if (url.pathname === "/daily" && request.method === "GET") {
      return this.handleDaily();
    }

    if (url.pathname === "/memory" && request.method === "GET") {
      const memory = await this.loadMemory();
      return json({
        streak: memory.streak,
        weakAreas: memory.weakAreas,
        summary: memory.summary,
        history: memory.history,
        lastScore: memory.lastScore,
      });
    }

    if (url.pathname === "/onboarding" && request.method === "POST") {
      const body = await request.json();
      const memory = await this.loadMemory();
      memory.level = String(body.level || memory.level || "A1");
      memory.goal = String(body.goals || memory.goal || "daily speaking");
      await this.saveMemory(memory);
      return json({ ok: true, level: memory.level, goal: memory.goal });
    }

    return json({ error: "Not found" }, 404);
  }

  async handleDaily() {
    const memory = await this.loadMemory();
    const weakest = memory.weakAreas[0] || "past tense";

    return json({
      task: "Speak 5 sentences about your day in English.",
      focus: weakest,
      streak: memory.streak,
    });
  }

  async handleChat(request) {
    const body = await request.json();
    const message = sanitizeMessage(body.message);

    if (!message) {
      return json({ error: "message required" }, 400);
    }

    const now = Date.now();
    const memory = await this.loadMemory();

    let reply;
    try {
      if (this.env.DEEPSEEK_API_KEY) {
        reply = await callDeepSeek(message, memory, this.env.DEEPSEEK_API_KEY);
      } else {
        reply = fallbackReply(message);
      }
    } catch {
      reply = fallbackReply(message);
    }

    const streakAction = updateStreak(memory.lastActive, now);
    if (streakAction === "increment") memory.streak += 1;
    if (streakAction === "reset") memory.streak = 1;
    if (!memory.lastActive) memory.streak = 1;

    const weakArea = detectWeakArea(message, reply);
    if (weakArea && !memory.weakAreas.includes(weakArea)) {
      memory.weakAreas.unshift(weakArea);
      memory.weakAreas = memory.weakAreas.slice(0, 5);
    }

    const scoreMatch = reply.match(/Score:\s*(\d{1,3})\s*\/100/i);
    memory.lastScore = scoreMatch ? Math.max(0, Math.min(100, Number(scoreMatch[1]))) : memory.lastScore;

    memory.history.push({ message, reply, ts: now });
    memory.history = memory.history.slice(-30);
    memory.lastActive = now;
    memory.summary = `Streak ${memory.streak}. Last score ${memory.lastScore}. Focus: ${(memory.weakAreas || []).join(", ") || "none"}.`;

    await this.saveMemory(memory);

    return json({
      reply,
      streak: memory.streak,
      score: memory.lastScore,
      weakAreas: memory.weakAreas,
      summary: memory.summary,
    });
  }

  async loadMemory() {
    const stored = await this.state.storage.get("memory");
    if (stored) return stored;

    return {
      level: "A1",
      goal: "daily speaking",
      streak: 0,
      weakAreas: [],
      history: [],
      lastActive: 0,
      lastScore: 0,
      summary: "",
    };
  }

  async saveMemory(memory) {
    await this.state.storage.put("memory", memory);
  }
}
// src/index.js
// NET-PET-AI Ship Version (MVP):
// - Worker router
// - Single Durable Object memory source of truth
// - Simple chat + daily loop

const VERSION = "2.0.0";

const OBI_SYSTEM_PROMPT = [
  "You are OBI, an English coach.",
  "Rules:",
  "- Correct mistakes first.",
  "- Keep response short.",
  "- Focus on one improvement point.",
  "- Always include a repeat drill.",
  "- End with a score from 0 to 100.",
  "Output format:",
  "Correct: <sentence>",
  "Why: <short reason>",
  "Repeat: <short drill>",
  "Score: <number>/100",
].join("\n");

function json(data, status = 200, request = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
    },
  });
}

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

function sanitizeMessage(input) {
  return String(input || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function sanitizeUserId(input) {
  const id = String(input || "anon").trim().toLowerCase();
  return id.replace(/[^a-z0-9_-]/g, "").slice(0, 64) || "anon";
}

function extractMessageFromBody(body) {
  if (typeof body?.message === "string" && body.message.trim()) {
    return body.message;
  }

  if (Array.isArray(body?.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i -= 1) {
      const msg = body.messages[i];
      if (msg?.role === "user" && typeof msg.content === "string" && msg.content.trim()) {
        return msg.content;
      }
    }
  }

  return "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if ((path === "/health" || path === "/api/health") && request.method === "GET") {
      return json(
        {
          ok: true,
          version: VERSION,
          mode: "ship-mvp",
          memoryBinding: Boolean(env.MEMORY),
          deepseekConfigured: Boolean(env.DEEPSEEK_API_KEY),
          app: env.APP_NAME || "Natural English Training",
          coach: env.APP_COACH_NAME || "Obi",
          ts: Date.now(),
        },
        200,
        request,
      );
    }

    if ((path === "/chat" || path === "/api/chat") && request.method === "POST") {
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, request);
      }

      const userId = sanitizeUserId(body.userId || body.studentId || "anon");
      const message = sanitizeMessage(extractMessageFromBody(body));

      if (!message) {
        return json({ error: "message required" }, 400, request);
      }

      const id = env.MEMORY.idFromName(userId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if ((path === "/daily" || path === "/api/daily") && (request.method === "GET" || request.method === "POST")) {
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      const studentId = sanitizeUserId(
        url.searchParams.get("studentId") ||
          url.searchParams.get("userId") ||
          "anon",
      );

      const id = env.MEMORY.idFromName(studentId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/daily", { method: "GET" });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if (path === "/api/memory" && request.method === "GET") {
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      const studentId = sanitizeUserId(
        url.searchParams.get("studentId") ||
          url.searchParams.get("userId") ||
          "anon",
      );
      const id = env.MEMORY.idFromName(studentId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/memory", { method: "GET" });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if (path === "/api/onboarding" && request.method === "POST") {
      // Compatibility endpoint: initialize student memory profile quickly.
      if (!env.MEMORY) {
        return json({ error: "MEMORY binding not configured" }, 500, request);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, request);
      }

      const studentId = sanitizeUserId(body.studentId || body.userId || "anon");
      const id = env.MEMORY.idFromName(studentId);
      const stub = env.MEMORY.get(id);
      const response = await stub.fetch("https://do/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: String(body.englishLevel || "A1"),
          goals: String(body.goals || "daily speaking"),
        }),
      });

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request),
        },
      });
    }

    if (path === "/" && request.method === "GET") {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
      return new Response("OBI online", { status: 200, headers: corsHeaders(request) });
    }

    if (env.ASSETS && request.method === "GET") {
      return env.ASSETS.fetch(request);
    }

    return json({ error: "Not found" }, 404, request);
  },
};

function detectWeakArea(message, reply) {
  const m = message.toLowerCase();
  const r = reply.toLowerCase();
  if (m.includes("yesterday") && !m.includes("went") && r.includes("went")) return "past tense";
  if (m.includes(" he ") && m.includes(" go ") && r.includes("goes")) return "third-person singular";
  if (m.includes("i am agree") || r.includes("i agree")) return "common phrase correction";
  return null;
}

function scoreAttempt(message, reply) {
  const m = message.toLowerCase();
  const r = reply.toLowerCase();
  let score = 80;
  if (m === r) score = 92;
  if (m.includes("yesterday") && !m.includes("went")) score -= 18;
  if (m.split(" ").length < 4) score -= 10;
  return Math.max(40, Math.min(98, score));
}

async function callDeepSeek(message, memory, apiKey) {
  const history = (memory.history || []).slice(-6);
  const contextLines = history
    .map((h) => `Student: ${h.message}\nOBI: ${h.reply}`)
    .join("\n---\n");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        { role: "system", content: OBI_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Student message: ${message}`,
            `Weak areas: ${(memory.weakAreas || []).join(", ") || "none"}`,
            `History:\n${contextLines || "none"}`,
          ].join("\n\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || "Correct: Please try again with one clear sentence.\nWhy: I need more context.\nRepeat: I can say one clear English sentence.\nScore: 60/100";
}

function fallbackReply(message) {
  const raw = message.trim();
  let corrected = raw;
  let why = "Clearer grammar makes your meaning stronger.";

  if (/\bi go yesterday\b/i.test(raw)) {
    corrected = raw.replace(/\bi go yesterday\b/i, "I went yesterday");
    why = "Use past tense 'went' for yesterday.";
  } else if (/\bi am agree\b/i.test(raw)) {
    corrected = raw.replace(/\bi am agree\b/i, "I agree");
    why = "Say 'I agree', not 'I am agree'.";
  } else if (/\bhe go to\b/i.test(raw)) {
    corrected = raw.replace(/\bhe go to\b/i, "He goes to");
    why = "Use 'goes' with he/she/it in present simple.";
  }

  const score = scoreAttempt(raw, corrected);
  return [
    `Correct: ${corrected}`,
    `Why: ${why}`,
    `Repeat: Say this three times: ${corrected}`,
    `Score: ${score}/100`,
  ].join("\n");
}

function updateStreak(lastActive, now) {
  if (!lastActive) return 1;
  const lastDay = Math.floor(lastActive / 86400000);
  const nowDay = Math.floor(now / 86400000);
  const diff = nowDay - lastDay;
  if (diff <= 0) return null;
  if (diff === 1) return "increment";
  return "reset";
}

export class MemoryDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/chat" && request.method === "POST") {
      return this.handleChat(request);
    }

    if (url.pathname === "/daily" && request.method === "GET") {
      return this.handleDaily();
    }

    if (url.pathname === "/memory" && request.method === "GET") {
      const memory = await this.loadMemory();
      return json({
        streak: memory.streak,
        weakAreas: memory.weakAreas,
        summary: memory.summary,
        history: memory.history,
        lastScore: memory.lastScore,
      });
    }

    if (url.pathname === "/onboarding" && request.method === "POST") {
      const body = await request.json();
      const memory = await this.loadMemory();
      memory.level = String(body.level || memory.level || "A1");
      memory.goal = String(body.goals || memory.goal || "daily speaking");
      await this.saveMemory(memory);
      return json({ ok: true, level: memory.level, goal: memory.goal });
    }

    return json({ error: "Not found" }, 404);
  }

  async handleDaily() {
    const memory = await this.loadMemory();
    const weakest = memory.weakAreas[0] || "past tense";

    return json({
      task: "Speak 5 sentences about your day in English.",
      focus: weakest,
      streak: memory.streak,
    });
  }

  async handleChat(request) {
    const body = await request.json();
    const message = sanitizeMessage(body.message);

    if (!message) {
      return json({ error: "message required" }, 400);
    }

    const now = Date.now();
    const memory = await this.loadMemory();

    let reply;
    try {
      if (this.env.DEEPSEEK_API_KEY) {
        reply = await callDeepSeek(message, memory, this.env.DEEPSEEK_API_KEY);
      } else {
        reply = fallbackReply(message);
      }
    } catch {
      reply = fallbackReply(message);
    }

    const streakAction = updateStreak(memory.lastActive, now);
    if (streakAction === "increment") memory.streak += 1;
    if (streakAction === "reset") memory.streak = 1;
    if (!memory.lastActive) memory.streak = 1;

    const weakArea = detectWeakArea(message, reply);
    if (weakArea && !memory.weakAreas.includes(weakArea)) {
      memory.weakAreas.unshift(weakArea);
      memory.weakAreas = memory.weakAreas.slice(0, 5);
    }

    const scoreMatch = reply.match(/Score:\s*(\d{1,3})\s*\/100/i);
    memory.lastScore = scoreMatch ? Math.max(0, Math.min(100, Number(scoreMatch[1]))) : memory.lastScore;

    memory.history.push({ message, reply, ts: now });
    memory.history = memory.history.slice(-30);
    memory.lastActive = now;
    memory.summary = `Streak ${memory.streak}. Last score ${memory.lastScore}. Focus: ${(memory.weakAreas || []).join(", ") || "none"}.`;

    await this.saveMemory(memory);

    return json({
      reply,
      streak: memory.streak,
      score: memory.lastScore,
      weakAreas: memory.weakAreas,
      summary: memory.summary,
    });
  }

  async loadMemory() {
    const stored = await this.state.storage.get("memory");
    if (stored) return stored;

    return {
      level: "A1",
      goal: "daily speaking",
      streak: 0,
      weakAreas: [],
      history: [],
      lastActive: 0,
      lastScore: 0,
      summary: "",
    };
  }

  async saveMemory(memory) {
    await this.state.storage.put("memory", memory);
  }
}
