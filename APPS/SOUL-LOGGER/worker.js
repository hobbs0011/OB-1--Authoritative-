// soul-logger — Chat dump ingestion and crunching drone
// Rescued from Cloudflare Workers 2026-05-18 (bundled output — original TS source not yet found)
// DB: soul-archive (c69a11bc-064b-478f-9b1f-e9b8e2431fb8)
// Env: DB (D1 soul-archive), KV (SESSIONS), AI (Workers AI), AI_GATEWAY_URL, DEEPSEEK_API_KEY, CF_AIG_TOKEN
// Endpoints: GET /health, POST /api/soul/extract, POST /api/soul/crunch, GET /api/soul/session/:id

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/parsers/index.ts
var parsers = {
  claude: /* @__PURE__ */ __name((text) => {
    return text.split(/^Human:\s/m).slice(1).map((chunk) => chunk.split(/^Assistant:\s/m)[0].trim()).filter((prompt) => prompt.length > 0);
  }, "claude"),
  chatgpt: /* @__PURE__ */ __name((text) => {
    return text.split(/^You said:/m).slice(1).map((chunk) => chunk.split(/^ChatGPT said:/m)[0].trim()).filter((prompt) => prompt.length > 0);
  }, "chatgpt"),
  notebooklm: /* @__PURE__ */ __name((text) => {
    return text.split(/Today\s•\s\d+:\d+\s[AP]M/).slice(1).map((chunk) => chunk.trim()).filter((prompt) => prompt.length > 0);
  }, "notebooklm"),
  vscode: /* @__PURE__ */ __name((text) => {
    return text.split(/^### User:/m).slice(1).map((chunk) => chunk.split(/^### GitHub Copilot:/m)[0].trim()).filter((prompt) => prompt.length > 0);
  }, "vscode"),
  gemini: /* @__PURE__ */ __name((text) => {
    return text.split(/^Show drafts/m).slice(1).map((chunk) => chunk.trim()).filter((prompt) => prompt.length > 0);
  }, "gemini")
};

// src/parsers/auto-detect.ts
var FORMAT_SIGNATURES = {
  claude: [/^Human:\s/m, /^Assistant:\s/m],
  chatgpt: [/^You said:/m, /^ChatGPT said:/m],
  notebooklm: [/Today\s•\s\d+:\d+\s[AP]M/, /IDENTITY_LOAD INITIALIZED/],
  vscode: [/^### \w+:/m],
  gemini: [/^Show drafts/m]
};
function detectFormat(text) {
  for (const [format, patterns] of Object.entries(FORMAT_SIGNATURES)) {
    if (patterns.every((p) => p.test(text))) return format;
  }
  return "unknown";
}
__name(detectFormat, "detectFormat");

// src/utils/hash.ts
async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");

// src/utils/markers.ts
function detectMarkers(text) {
  return JSON.stringify({
    caps_words: (text.match(/\b[A-Z]{2,}\b/g) || []).length,
    exclamations: (text.match(/!/g) || []).length,
    questions: (text.match(/\?/g) || []).length,
    ellipses: (text.match(/\.\.\./g) || []).length,
    repeated_chars: (text.match(/(.)\1{3,}/g) || []).length,
    length_chars: text.length
  });
}
__name(detectMarkers, "detectMarkers");

// src/db/queries.ts
async function createSession(env, sessionData) {
  const { session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status } = sessionData;
  await env.DB.prepare("INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status).run();
  return session_id;
}
__name(createSession, "createSession");
async function insertPrompts(env, sessionId, promptsArray) {
  const stmts = promptsArray.map(
    (p) => env.DB.prepare("INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(p.id, sessionId, p.position, p.text, p.estimated_timestamp, p.byte_count, p.hash_sha256, p.emotional_markers)
  );
  await env.DB.batch(stmts);
}
__name(insertPrompts, "insertPrompts");

// src/extractors/soul-extractor.ts
async function extractSoul(env, chatDump, format, sessionTag, sourceDate) {
  const actualFormat = format === "auto" ? detectFormat(chatDump) : format;
  if (actualFormat === "unknown" || !parsers[actualFormat]) {
    throw new Error("Format unrecognized. Calibrate input or specify format manually.");
  }
  const rawPrompts = parsers[actualFormat](chatDump);
  const sessionId = "SL-" + crypto.randomUUID().slice(0, 8);
  const ingestedAt = (/* @__PURE__ */ new Date()).toISOString();
  const byteSize = new TextEncoder().encode(chatDump).length;
  const sessionData = {
    session_id: sessionId,
    session_tag: sessionTag,
    source_format: actualFormat,
    source_date: sourceDate,
    ingested_at: ingestedAt,
    prompt_count: rawPrompts.length,
    raw_byte_size: byteSize,
    status: "extracted"
  };
  const promptsArray = await Promise.all(rawPrompts.map(async (text, index) => {
    const promptId = sessionId + "-" + String(index + 1).padStart(3, "0");
    const hash = await sha256(text);
    const markers = detectMarkers(text);
    return {
      id: promptId,
      position: index + 1,
      text,
      estimated_timestamp: ingestedAt,
      byte_count: new TextEncoder().encode(text).length,
      hash_sha256: hash,
      emotional_markers: markers
    };
  }));
  await createSession(env, sessionData);
  await insertPrompts(env, sessionId, promptsArray);
  return { session_id: sessionId, prompts_extracted: rawPrompts.length, prompts: promptsArray, ready_for_crunch: true };
}
__name(extractSoul, "extractSoul");

// src/ai/deepseek-gateway.ts
async function callDeepSeek(env, systemPrompt, userPrompt) {
  const url = env.AI_GATEWAY_URL + "/deepseek/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
      "cf-aig-authorization": `Bearer ${env.CF_AIG_TOKEN}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek gateway error ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}
__name(callDeepSeek, "callDeepSeek");

// src/crunchers/bible-chapter.ts
var BIBLE_SYSTEM_PROMPT = "You are the SOUL-Logger Bible Chapter formatter. Take the verbatim user prompts provided and reformat them as a Bible chapter:\n- Each prompt becomes a numbered verse (1., 2., 3., ...)\n- PRESERVE EVERY WORD VERBATIM. Do NOT paraphrase, summarize, correct typos, or sanitize swearing.\n- Add a footnote section at the end listing the position and SHA-256 hash of each verse.\n- Format: '# Chapter [session_tag]\\n\\n1. [verbatim prompt]\\n\\n2. [verbatim prompt]\\n\\n---\\nFootnotes:\\n[1] hash:...\\n[2] hash:...'";
async function crunchBibleChapter(env, sessionId) {
  const sessionRow = await env.DB.prepare(
    "SELECT session_tag FROM soul_sessions WHERE session_id = ?"
  ).bind(sessionId).first();
  if (!sessionRow) throw new Error(`Session not found: ${sessionId}`);
  const { results: prompts } = await env.DB.prepare(
    "SELECT position, text, hash_sha256 FROM soul_prompts WHERE session_id = ? ORDER BY position ASC"
  ).bind(sessionId).all();
  const userPrompt = `Session tag: ${sessionRow.session_tag}\n\nPrompts:\n` + prompts.map((p) => `[${p.position}] ${p.text}`).join("\n\n");
  const chapter = await callDeepSeek(env, BIBLE_SYSTEM_PROMPT, userPrompt);
  const crunchId = "CR-" + crypto.randomUUID().slice(0, 8);
  await env.DB.prepare(
    "INSERT INTO soul_crunches (crunch_id, session_id, crunch_mode, artifact, ai_tier_used, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(crunchId, sessionId, "bible", chapter, "deepseek", (/* @__PURE__ */ new Date()).toISOString()).run();
  return chapter;
}
__name(crunchBibleChapter, "crunchBibleChapter");

// src/ai/workers-ai.ts
async function extractThemes(env, prompts) {
  const numbered = prompts.map((p, i) => `${i + 1}. ${p}`).join("\n");
  const result = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: "Extract 3-5 recurring themes from these user prompts. Return only a valid JSON array of short theme strings. No explanation." },
      { role: "user", content: numbered }
    ]
  });
  try {
    return JSON.parse(result.response);
  } catch {
    return [result.response];
  }
}
__name(extractThemes, "extractThemes");

// src/index.ts
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ status: "alive", drone: "soul-logger", version: "1.0.0", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    }
    if (request.method === "POST" && url.pathname === "/api/soul/extract") {
      const body = await request.json();
      if (!body.chat_dump || !body.session_tag) {
        return Response.json({ error: "Missing required parameters: chat_dump or session_tag" }, { status: 400 });
      }
      try {
        const result = await extractSoul(env, body.chat_dump, body.format || "auto", body.session_tag, body.source_date || (/* @__PURE__ */ new Date()).toISOString());
        return Response.json(result);
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }
    /* Breath feeds the soul FIRST — every pheromone breath is an soul event before
       it touches DNA. This is the authoritative soul event intake (Gospel999 I.022). */
    if (request.method === "POST" && url.pathname === "/api/soul/event") {
      const body = await request.json();
      const { event_type, source, payload, run_number, head_sha, breath_timestamp } = body;
      if (!event_type || !source) {
        return Response.json({ error: "Missing required parameters: event_type, source" }, { status: 400 });
      }
      const eventId = "SE-" + crypto.randomUUID().slice(0, 8);
      const ingestedAt = (/* @__PURE__ */ new Date()).toISOString();
      const byteSize = new TextEncoder().encode(JSON.stringify(body)).length;
      const hash = await sha256(JSON.stringify(body));
      try {
        await env.DB.prepare(
          "INSERT INTO soul_events (event_id, event_type, source, payload, run_number, head_sha, breath_timestamp, ingested_at, byte_count, hash_sha256, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'breath')"
        ).bind(eventId, event_type, source, JSON.stringify(payload || {}), run_number || null, head_sha || null, breath_timestamp || ingestedAt, ingestedAt, byteSize, hash).run();
        return Response.json({ event_id: eventId, status: "breath_fed_to_soul", ingested_at: ingestedAt, hash_sha256: hash });
      } catch (e) {
        // Table may not exist yet — try creating it
        try {
          await env.DB.prepare(
            "CREATE TABLE IF NOT EXISTS soul_events (event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, source TEXT NOT NULL, payload TEXT, run_number INTEGER, head_sha TEXT, breath_timestamp TEXT, ingested_at TEXT NOT NULL, byte_count INTEGER, hash_sha256 TEXT, status TEXT DEFAULT 'breath')"
          ).run();
          await env.DB.prepare(
            "INSERT INTO soul_events (event_id, event_type, source, payload, run_number, head_sha, breath_timestamp, ingested_at, byte_count, hash_sha256, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'breath')"
          ).bind(eventId, event_type, source, JSON.stringify(payload || {}), run_number || null, head_sha || null, breath_timestamp || ingestedAt, ingestedAt, byteSize, hash).run();
          return Response.json({ event_id: eventId, status: "breath_fed_to_soul", ingested_at: ingestedAt, hash_sha256: hash, note: "soul_events table created" });
        } catch (e2) {
          return Response.json({ error: e2.message }, { status: 500 });
        }
      }
    }
    if (request.method === "POST" && url.pathname === "/api/soul/crunch") {
      const body = await request.json();
      const { session_id, mode } = body;
      if (!session_id || !mode) {
        return Response.json({ error: "Missing required parameters: session_id or mode" }, { status: 400 });
      }
      if (mode !== "bible" && mode !== "themes") {
        return Response.json({ error: 'mode must be "bible" or "themes"' }, { status: 400 });
      }
      try {
        const kvKey = `crunch:${session_id}:${mode}`;
        const kvHit = await env.KV.get(kvKey);
        if (kvHit !== null) {
          return Response.json({ session_id, mode, artifact: kvHit, cached: true, cache_tier: "kv" });
        }
        const d1Hit = await env.DB.prepare(
          "SELECT artifact FROM soul_crunches WHERE session_id = ? AND crunch_mode = ? ORDER BY created_at DESC LIMIT 1"
        ).bind(session_id, mode).first();
        if (d1Hit) {
          await env.KV.put(kvKey, d1Hit.artifact, { expirationTtl: 86400 });
          return Response.json({ session_id, mode, artifact: d1Hit.artifact, cached: true, cache_tier: "d1" });
        }
        let artifact;
        if (mode === "bible") {
          artifact = await crunchBibleChapter(env, session_id);
        } else {
          const { results: prompts } = await env.DB.prepare(
            "SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position ASC"
          ).bind(session_id).all();
          const themes = await extractThemes(env, prompts.map((p) => p.text));
          artifact = JSON.stringify(themes);
        }
        await env.KV.put(kvKey, artifact, { expirationTtl: 86400 });
        return Response.json({ session_id, mode, artifact, cached: false });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }
    if (request.method === "GET" && url.pathname.startsWith("/api/soul/session/")) {
      const sessionId = url.pathname.split("/").pop();
      const session = await env.DB.prepare(
        "SELECT * FROM soul_sessions WHERE session_id = ?"
      ).bind(sessionId).first();
      if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
      const { results: prompts } = await env.DB.prepare(
        "SELECT * FROM soul_prompts WHERE session_id = ? ORDER BY position ASC"
      ).bind(sessionId).all();
      return Response.json({ session, prompts });
    }
    return Response.json({ drone: "soul-logger", status: "online", endpoints: ["/health", "/api/soul/extract", "/api/soul/event", "/api/soul/crunch", "/api/soul/session/:id"] });
  }
};
export { index_default as default };
