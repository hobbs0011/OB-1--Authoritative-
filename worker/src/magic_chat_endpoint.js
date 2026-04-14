export async function handleMagicChat(request, env) {
  const corsH = corsHeadersFor(request, env);
  if (request.method === "OPTIONS") return withCors(new Response("", { status: 204 }), corsH);
  if (request.method !== "POST") return withCors(json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405), corsH);

  const chatKey = request.headers.get("x-chat-key");
  if (!chatKey || !env.CHAT_KEY || chatKey !== env.CHAT_KEY) {
    return withCors(json({ ok: false, error: "UNAUTHORIZED" }, 403), corsH);
  }

  const maxBytes = Number(env.MAX_BODY_BYTES || 65536);
  const parsed = await readJsonLimited(request, maxBytes);
  if (parsed.error === "PAYLOAD_TOO_LARGE") return withCors(json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, 413), corsH);
  if (parsed.error === "BAD_JSON") return withCors(json({ ok: false, error: "BAD_JSON" }, 400), corsH);

  const body = parsed.value || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const session_id = (typeof body.session_id === "string" && body.session_id.trim()) ? body.session_id.trim() : crypto.randomUUID();
  if (!message) return withCors(json({ ok: false, error: "MESSAGE_REQUIRED" }, 400), corsH);

  const rpm = Number(env.CHAT_RPM || 60);
  const id = env.PHOENIX_LEDGER.idFromName("global");
  const stub = env.PHOENIX_LEDGER.get(id);
  const rl = await stub.fetch("https://do/_chat_ratelimit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ k: chatKey, rpm })
  });
  if (rl.status === 429) return withCors(json({ ok: false, error: "RATE_LIMITED" }, 429), corsH);
  if (!rl.ok) return withCors(json({ ok: false, error: "RATE_LIMIT_ERROR" }, 502), corsH);

  const intent = classifyIntent(message);
  let provider = intent.provider;
  try {
    const timeoutMs = Number(env.CHAT_TIMEOUT_MS || 20000);
    let responseText = "";
    switch (provider) {
      case "claude": responseText = await routeToClaude(message, env, timeoutMs); break;
      case "gpt": responseText = await routeToOpenAI(message, env, timeoutMs); break;
      case "gemini": responseText = await routeToGemini(message, env, timeoutMs); break;
      case "perplexity": responseText = await routeToPerplexity(message, env, timeoutMs); break;
      default: provider = "claude"; responseText = await routeToClaude(message, env, timeoutMs);
    }
    console.log("MAGIC_CHAT_EVENT", JSON.stringify({ session_id, provider, intent: intent.type, message_len: message.length, response_len: responseText.length, ts: Date.now() }));
    return withCors(json({ ok: true, response: responseText, provider, intent: intent.type, session_id }), corsH);
  } catch (err) {
    console.error("PROVIDER_ERROR:", err.message, err.stack);
    return withCors(json({ ok: false, error: "PROVIDER_ROUTING_FAILED", details: err.message }, 502), corsH);
  }
}

function corsHeadersFor(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
  const h = new Headers();
  h.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type, x-chat-key");
  h.set("Access-Control-Max-Age", "86400");
  h.set("Vary", "Origin");
  if (origin && allowed.includes(origin)) h.set("Access-Control-Allow-Origin", origin);
  return h;
}

function withCors(resp, corsH) {
  const h = new Headers(resp.headers);
  for (const [k, v] of corsH.entries()) h.set(k, v);
  return new Response(resp.body, { status: resp.status, headers: h });
}

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

async function readJsonLimited(request, maxBytes) {
  const ab = await request.arrayBuffer();
  if (ab.byteLength > maxBytes) return { error: "PAYLOAD_TOO_LARGE" };
  try { return { value: JSON.parse(new TextDecoder().decode(ab)) }; }
  catch { return { error: "BAD_JSON" }; }
}

function classifyIntent(message) {
  const msg = message.toLowerCase();
  if (/\b(audit|verify|validate|check|drift|forensic)\b/.test(msg)) return { provider: "claude", type: "audit" };
  if (/\b(code|build|generate|script|function|refactor)\b/.test(msg)) return { provider: "gpt", type: "build" };
  if (/\b(search|research|find|lookup)\b/.test(msg)) return { provider: "perplexity", type: "research" };
  if (/\b(idea|creative|design|brainstorm)\b/.test(msg)) return { provider: "gemini", type: "creative" };
  return { provider: "claude", type: "general" };
}

function fetchWithTimeout(url, init, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

async function routeToClaude(message, env, timeoutMs) {
  if (!env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_KEY_MISSING");
  const r = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, messages: [{ role: "user", content: message }] })
  }, timeoutMs);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("ANTHROPIC_UPSTREAM_ERROR: " + JSON.stringify(data));
  const blocks = Array.isArray(data.content) ? data.content : [];
  const text = blocks.filter(b => b?.type === "text" && typeof b.text === "string").map(b => b.text).join("").trim();
  if (!text) throw new Error("ANTHROPIC_EMPTY");
  return text;
}

async function routeToOpenAI(message, env, timeoutMs) {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_KEY_MISSING");
  const r = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: message }], max_tokens: 1024 })
  }, timeoutMs);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("OPENAI_UPSTREAM_ERROR: " + JSON.stringify(data));
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("OPENAI_EMPTY");
  return text;
}

async function routeToGemini(message, env, timeoutMs) {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_KEY_MISSING");
  const model = "gemini-2.0-flash-exp";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const r = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
  }, timeoutMs);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("GEMINI_UPSTREAM_ERROR: " + JSON.stringify(data));
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join("") || "";
  if (!text.trim()) throw new Error("GEMINI_EMPTY");
  return text;
}

async function routeToPerplexity(message, env, timeoutMs) {
  if (!env.PERPLEXITY_API_KEY) throw new Error("PPLX_KEY_MISSING");
  const r = await fetchWithTimeout("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.PERPLEXITY_API_KEY}` },
    body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: message }] })
  }, timeoutMs);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("PPLX_UPSTREAM_ERROR: " + JSON.stringify(data));
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("PPLX_EMPTY");
  return text;
}
