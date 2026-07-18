--d61e254a799403fb5952b54165927c5bc4ba7f4d3da94107c28afa946060
Content-Disposition: form-data; name="index.js"

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
function stripFences(text) {
  if (!text) return text;
  return text.replace(/^```[a-zA-Z0-9]*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
}
__name(stripFences, "stripFences");
var SYSTEM_PROMPT = `You are Phoenix-Architecti \u2014 elite code drone for the OB-1 empire.
L01 NO_FABRICATION \u2014 never guess. State what is missing.
L02 NO_STUBS \u2014 full implementation only. No TODO, no placeholders.
L03 STRONGEST_VERSION_FIRST \u2014 complete, hardened output immediately.
L04 RAW_OUTPUT \u2014 raw file content ONLY. No markdown fences. No backticks. No explanation. First character = first character of the file.
L06 ZERO_DRIFT \u2014 answer the task, nothing else.`;
async function callOpenAI(url, key, model, messages, extraHeaders = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key, ...extraHeaders },
    body: JSON.stringify({ model, messages, max_tokens: 8192 })
  });
  if (res.status === 429) return null;
  if (!res.ok) throw new Error(url + " " + res.status + ": " + await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? null;
}
__name(callOpenAI, "callOpenAI");
// callAnthropic — DECOMMISSIONED 2026-07-18
// Replaced by DeepSeek V4 Pro (tier 3) for equivalent capability.
async function callGemini(env, messages) {
  const combined = messages.map((m) => m.content).join("\n\n");
  const url = env.AIGATEWAYURL ? env.AIGATEWAYURL.replace(/\/$/, "") + "/google-ai-studio/v1/models/gemini-3.5-flash:generateContent?key=" + env.GEMINI_API_KEY : "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + env.GEMINI_API_KEY;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...env.CF_GATEWAY_TOKEN ? { "cf-aig-authorization": "Bearer " + env.CF_GATEWAY_TOKEN } : {}
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: combined }] }] })
  });
  if (!res.ok) throw new Error("Gemini " + res.status + ": " + await res.text());
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}
__name(callGemini, "callGemini");
async function callTier(env, tier, messages) {
  const gwBase = env.AIGATEWAYURL?.replace(/\/$/, "");
  const gwHeaders = env.CF_GATEWAY_TOKEN ? { "cf-aig-authorization": "Bearer " + env.CF_GATEWAY_TOKEN } : {};
  // T5 (Claude Opus) — DECOMMISSIONED 2026-07-18
  if (tier >= 4 && env.GEMINI_API_KEY) return callGemini(env, messages);
  if (tier >= 3 && env.DEEPSEEK_API_KEY) {
    return callOpenAI("https://api.deepseek.com/v1/chat/completions", env.DEEPSEEK_API_KEY, "deepseek-v4-pro", messages);
  }
  if (tier >= 2 && env.DEEPSEEK_API_KEY) {
    return callOpenAI("https://api.deepseek.com/v1/chat/completions", env.DEEPSEEK_API_KEY, "deepseek-v4-flash", messages);
  }
  const tried = [];
  let result = null;
  if (env.CEREBRAS_API_KEY) {
    tried.push("Cerebras");
    result = await callOpenAI("https://api.cerebras.ai/v1/chat/completions", env.CEREBRAS_API_KEY, "llama-3.3-70b", messages);
  }
  if (result === null && env.GROQ_API_KEY) {
    tried.push("Groq");
    result = await callOpenAI("https://api.groq.com/openai/v1/chat/completions", env.GROQ_API_KEY, "llama-3.3-70b-versatile", messages);
  }
  if (result === null) {
    tried.push("CF-Qwen");
    const aiResult = await env.AI.run("@cf/qwen/qwen2.5-coder-32b-instruct", { messages, max_tokens: 8192 });
    result = aiResult.response ?? null;
  }
  if (!result) throw new Error("T1 free cascade failed (" + tried.join("\u2192") + ")");
  return result;
}
__name(callTier, "callTier");
async function withCache(env, key, tier, fn) {
  const cacheKey = "llm-t" + tier + "-" + btoa(encodeURIComponent(key).slice(0, 120));
  const cached = await env.PHETRAIL.get(cacheKey);
  if (cached) return cached;
  const result = await fn();
  if (result) await env.PHETRAIL.put(cacheKey, result, { expirationTtl: 3600 });
  return result;
}
__name(withCache, "withCache");
async function logToD1(env, task, result, taskType, tier) {
  const id = "PC-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  try {
    await env.DB.prepare(
      "INSERT INTO phoenix_architecti_log (id, tasktype, taskinput, result, createdat) VALUES (?, ?, ?, ?, datetime('now'))"
    ).bind(id, taskType + "_t" + tier, task.slice(0, 2e3), (result || "").slice(0, 4e3)).run();
  } catch (err) {
    console.error("D1 log failed:", err.message);
  }
  return id;
}
__name(logToD1, "logToD1");
async function handleCode(request, env) {
  const body = await request.json();
  if (!body.task) return Response.json({ error: "task is required" }, { status: 400 });
  const tier = parseInt(body.tier || "1");
  const parts = [];
  if (body.context) parts.push("CONTEXT:\n" + body.context);
  if (body.targetfile) parts.push("TARGET FILE: " + body.targetfile);
  parts.push("TASK:\n" + body.task);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: parts.join("\n\n") }
  ];
  const raw = await withCache(env, body.task + body.context, tier, () => callTier(env, tier, messages));
  const result = stripFences(raw);
  const id = await logToD1(env, body.task, result, "code", tier);
  return Response.json({ code_patch: result, d1_row_id: id, task: body.task, tier });
}
__name(handleCode, "handleCode");
async function handleCrunch(request, env) {
  const body = await request.json();
  if (!body.rawtext) return Response.json({ error: "rawtext is required" }, { status: 400 });
  const tier = parseInt(body.tier || "1");
  const format = body.format || "biblechapter";
  const instructions = {
    biblechapter: "Format as a Bible chapter. Number each block. Preserve ALL text verbatim including typos, CAPS, swearing. Add 1-2 sentence footnote per block explaining intent. End with exact block count.",
    summary: "Extract the 5 most important decisions or facts. Numbered list. Exact, no editorializing.",
    laws: "Extract all rules, laws, protocols, constraints. Format: LAW-NNN: name \u2014 description. Exhaustive."
  };
  const messages = [
    { role: "system", content: "You are Phoenix-Architecti \u2014 forensic scribe. L01 NO_FABRICATION. L06 ZERO_DRIFT. Raw text output only, no fences." },
    { role: "user", content: (instructions[format] || instructions.biblechapter) + "\n\nRAW TEXT:\n" + body.rawtext }
  ];
  const result = await withCache(env, body.rawtext.slice(0, 200) + format, tier, () => callTier(env, tier, messages));
  const id = await logToD1(env, body.rawtext.slice(0, 200), result, "crunch_" + format, tier);
  return Response.json({ crunched: result, format, d1_row_id: id, tier });
}
__name(handleCrunch, "handleCrunch");
async function handleStatus(env) {
  let recent = [];
  try {
    const rows = await env.DB.prepare("SELECT id, tasktype, taskinput, createdat FROM phoenix_architecti_log ORDER BY createdat DESC LIMIT 5").all();
    recent = rows.results || [];
  } catch (err) {
  }
  return Response.json({
    drone: "phoenix-architecti",
    version: "0.0.1",
    status: "LIVE",
    tiers: {
      t1: "free \u2014 Cerebras\u2192Groq\u2192CF-Qwen",
      t2: env.DEEPSEEK_API_KEY ? "deepseek-v4-flash \u2713" : "NO KEY",
      t3: env.DEEPSEEK_API_KEY ? "deepseek-v4-pro \u2713" : "NO KEY",
      t4: env.GEMINI_API_KEY ? "gemini-3.5-flash \u2713" : "NO KEY",
      t5: "DECOMMISSIONED 2026-07-18"
    },
    gateway: env.AIGATEWAYURL ? "CF AI Gateway \u2713" : "direct API",
    recenttasks: recent
  });
}
__name(handleStatus, "handleStatus");
async function handleLog(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const type = url.searchParams.get("type");
  let rows;
  try {
    rows = type ? await env.DB.prepare("SELECT * FROM phoenix_architecti_log WHERE tasktype = ? ORDER BY createdat DESC LIMIT ?").bind(type, limit).all() : await env.DB.prepare("SELECT * FROM phoenix_architecti_log ORDER BY createdat DESC LIMIT ?").bind(limit).all();
  } catch (err) {
    return Response.json({ error: err.message, count: 0, logs: [] });
  }
  return Response.json({ count: rows.results?.length || 0, logs: rows.results || [] });
}
__name(handleLog, "handleLog");
var CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    if (method === "OPTIONS") return new Response(null, { headers: CORS });
    try {
      let response;
      if (method === "POST" && url.pathname === "/api/code") response = await handleCode(request, env);
      else if (method === "POST" && url.pathname === "/api/crunch") response = await handleCrunch(request, env);
      else if (method === "GET" && url.pathname === "/api/status") response = await handleStatus(env);
      else if (method === "GET" && url.pathname === "/api/log") response = await handleLog(request, env);
      else response = Response.json({ error: "Not found", drone: "phoenix-architecti" }, { status: 404 });
      const headers = new Headers(response.headers);
      Object.entries(CORS).forEach(([k, v]) => headers.set(k, v));
      return new Response(response.body, { status: response.status, headers });
    } catch (err) {
      return Response.json({ error: err.message || "Internal error", drone: "phoenix-architecti" }, { status: 500, headers: CORS });
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map

--d61e254a799403fb5952b54165927c5bc4ba7f4d3da94107c28afa946060--
