/* PaiS MCP CLOUD + RUNNER — Cloudflare Worker serving the tool lane over MCP
   (streamable HTTP) AND running the closed-browser pulse on a cron.

   WHAT THIS IS. The browser page cannot survive the browser being closed — no web
   page can. This Worker can: Cloudflare runs it on a schedule whether any browser
   exists or not. Every 10 minutes the cron fires `scheduled()`, which runs ONE
   tiny fixed-prompt inference (Flash by default, ~$0.00001) and appends a receipt
   line to the canonical RUNNER-LOG.md in the authority repo. That log is the
   proof it ran with every browser shut. POST /run is the general primitive:
   an authenticated caller (Kilo Cloud schedule, curl, another Worker) can ask
   the runner to do one model call and have the receipt durably logged.

   ENDPOINTS.
     GET  /health          — { ok, tools, cron, hasKeys (booleans only) }
     GET  /pulse?key=...  — manual pulse (needs RUNNER_KEY when set)
     POST /mcp            — initialize, tools/list, tools/call (gateway_chat,
                            openrouter_chat, edtech_build-stub)
     POST /run            — { key, prompt?, model?, max_tokens? } → one model
                            call + durable log line (needs RUNNER_KEY when set)

   SECRETS (never in code — `wrangler secret put NAME` on the command machine):
     OPENROUTER_KEY — preferred brain for the pulse (DeepSeek Flash, fixed prompt)
     KILO_KEY       — fallback brain (kilo-auto/free) when no OpenRouter key
     GH_TOKEN       — fine-grained PAT, contents:read+write on the ONE authority
                      repo; without it the pulse still runs but the receipt only
                      lives in the Worker log (ephemeral) instead of RUNNER-LOG.md
     RUNNER_KEY     — long random string guarding /pulse and /run; without it
                      those endpoints are open (don't run open)
   VARS (public, in wrangler.toml):
     GATEWAY_BASE, OR_BASE, OR_MODEL, GH_REPO ("owner/repo"), GH_BRANCH,
     RUNNER_LOG_PATH (path inside the repo).

   COST SHAPE. Cron 10-min = 144 pulses/day. Flash fixed-prompt ≈ $0.00001 each
   → ≈ $0.04/mo. Kilo free lane → $0. The Worker itself is free-tier. */
const GATEWAY_BASE = "https://ai-gateway.kilo.ai/api/v1";
const OR_BASE = "https://openrouter.ai/api/v1";
const PULSE_PROMPT = "Reply with exactly: pulse ok";
const PULSE_MODEL = "deepseek/deepseek-v4-flash";
const PULSE_MAX_TOKENS = 60;
const TOOL_DEFS = [
  { name: "gateway_chat", description: "Chat completion via the Kilo Gateway (free lane first, usage metered)", inputSchema: { type: "object", properties: { model: { type: "string" }, prompt: { type: "string" }, max_tokens: { type: "integer" } }, required: ["prompt"] } },
  { name: "openrouter_chat", description: "Chat via OpenRouter (DeepSeek Flash default, metered)", inputSchema: { type: "object", properties: { model: { type: "string" }, prompt: { type: "string" }, max_tokens: { type: "integer" } }, required: ["prompt"] } },
  { name: "edtech_build", description: "Lesson build on the edtech desk (stub until the desk exposes a callable lane)", inputSchema: { type: "object", properties: { spec: { type: "object" } } } }
];

function repoOf(env) {
  const full = String(env.GH_REPO || "Phoenix-Rising-Ai-Solutions/OB-1--Authoritative-").trim();
  const i = full.indexOf("/");
  if (i < 1) return null;
  return { owner: full.slice(0, i), repo: full.slice(i + 1), branch: String(env.GH_BRANCH || "master"), logPath: String(env.RUNNER_LOG_PATH || "OPERATIONS/COMMANDSTATION/perchance/RUNNER-LOG.md") };
}
function needKey(env, url) {
  if (!env.RUNNER_KEY) return null; // open (deploy should set one)
  const got = url.searchParams.get("key") || "";
  return got === env.RUNNER_KEY ? null : "bad or missing key";
}

async function callOpenRouter(env, prompt, model, max_tokens) {
  if (!env.OPENROUTER_KEY) throw new Error("no OPENROUTER_KEY secret");
  const r = await fetch(OR_BASE + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + env.OPENROUTER_KEY, "HTTP-Referer": "https://perchance.org", "X-Title": "PaiS-Runner" },
    body: JSON.stringify({ model: model || PULSE_MODEL, max_tokens: Math.min(max_tokens || PULSE_MAX_TOKENS, 8000), messages: [{ role: "user", content: prompt }] })
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error("openrouter HTTP " + r.status);
  const m = (j && j.choices && j.choices[0] && j.choices[0].message) || {};
  const text = String(m.content || "");
  if (!text.trim()) throw new Error("empty model reply");
  return { via: "openrouter", model: model || PULSE_MODEL, text, usage: (j && j.usage) || null };
}
async function callGateway(env, prompt, model, max_tokens) {
  if (!env.KILO_KEY) throw new Error("no KILO_KEY secret");
  const r = await fetch(GATEWAY_BASE + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + env.KILO_KEY },
    body: JSON.stringify({ model: model || "kilo-auto/free", max_tokens: Math.min(Math.max(max_tokens || 1000, 300), 2000), messages: [{ role: "user", content: prompt }] })
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error("gateway HTTP " + r.status);
  const txt = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  return { via: "kilo-gateway", model: model || "kilo-auto/free", text: String(txt), usage: (j && j.usage) || null };
}
/* One brain call: Kilo free lane FIRST (the Kilo-chat replication — $0),
   OpenRouter as fallback. Same ladder the station uses in the browser. */
async function brainOnce(env, prompt, model, max_tokens) {
  const t0 = Date.now();
  let out;
  const kiloModel = model || "kilo-auto/free";
  try {
    out = await callGateway(env, prompt, kiloModel, max_tokens);
  } catch (e1) {
    if (!env.OPENROUTER_KEY) throw e1;
    out = await callOpenRouter(env, prompt, model || (prompt === PULSE_PROMPT ? PULSE_MODEL : undefined), max_tokens);
  }
  out.ms = Date.now() - t0;
  return out;
}

function b64encode(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(String(b64).replace(/\n/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
/* Durable receipt: one appended line in the canonical RUNNER-LOG.md. Without
   GH_TOKEN the pulse still runs — the receipt just lives in the Worker log. */
async function logToGitHub(env, line) {
  const R = repoOf(env);
  if (!R || !env.GH_TOKEN) return { logged: false, why: !R ? "no GH_REPO var" : "no GH_TOKEN secret" };
  const url = "https://api.github.com/repos/" + R.owner + "/" + R.repo + "/contents/" + R.logPath + "?ref=" + encodeURIComponent(R.branch);
  const h = { "authorization": "Bearer " + env.GH_TOKEN, "accept": "application/vnd.github+json", "content-type": "application/json", "user-agent": "pais-runner/1.0" };
  let sha = null, cur = "";
  try {
    const g = await fetch(url, { headers: h });
    if (g.status === 200) { const j = await g.json(); sha = j.sha; cur = b64decode(j.content || ""); }
    else if (g.status !== 404) return { logged: false, why: "read HTTP " + g.status };
  } catch (e) { return { logged: false, why: "read failed: " + e.message }; }
  if (!cur) cur = "# Runner log — the closed-browser pulse\n\nCloudflare cron appends one line per firing. Each line is a receipt: it ran with every browser shut.\n\n";
  if (cur.length > 400000) cur = cur.slice(-200000); // bound the file: keep the tail
  const next = cur + line + "\n";
  const put = await fetch(url, { method: "PUT", headers: h, body: JSON.stringify({ message: "runner pulse " + new Date().toISOString(), content: b64encode(next), sha: sha || undefined, branch: R.branch }) });
  if (!put.ok && put.status !== 201 && put.status !== 200) return { logged: false, why: "write HTTP " + put.status };
  return { logged: true };
}

async function doPulse(env, source) {
  const at = new Date().toISOString();
  try {
    const out = await brainOnce(env, PULSE_PROMPT, PULSE_MODEL, PULSE_MAX_TOKENS);
    const line = "- " + at + " · " + source + " · " + out.via + ":" + out.model + " · " + out.text.trim().slice(0, 40).replace(/\s+/g, " ") + " · " + out.ms + "ms" + (out.usage && out.usage.total_tokens != null ? " · " + out.usage.total_tokens + "tok" : "");
    const log = await logToGitHub(env, line);
    console.log("[runner-pulse]", line, log.logged ? "(logged)" : "(" + log.why + ")");
    return { ok: true, at, source, reply: out.text.trim().slice(0, 120), via: out.via, model: out.model, ms: out.ms, usage: out.usage || null, logged: log.logged, logWhy: log.logged ? null : log.why };
  } catch (e) {
    console.log("[runner-pulse]", at, source, "FAILED:", (e && e.message) || e);
    return { ok: false, at, source, error: String((e && e.message) || e).slice(0, 300) };
  }
}

/* Classic service-worker format (addEventListener) ON PURPOSE, not modules: the
   station deploys this Worker through the plain-script upload endpoint
   (PUT workers/scripts/:name, Content-Type application/javascript), which is
   what survives the browser's CORS-free proxy — multipart module uploads do
   not. In this format secrets/vars arrive as globals, so the listeners below
   pass globalThis as `env`. wrangler deploys this format fine too. */
addEventListener("scheduled", (e) => {
  /* Cloudflare cron: fires whether any browser exists or not. That is the
     whole point — this is the closed-browser runner. */
  e.waitUntil(doPulse(globalThis, "cron:" + (e.cron || "default")));
});
async function handleFetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health")
      return Response.json({ ok: true, service: "pais-mcp-cloud+runner", tools: TOOL_DEFS.map(t => t.name), cron: "*/10 * * * *", time: new Date().toISOString(), keys: { openrouter: !!env.OPENROUTER_KEY, kilo: !!env.KILO_KEY, github: !!env.GH_TOKEN, runnerKey: !!env.RUNNER_KEY } });
    if (req.method === "GET" && url.pathname === "/pulse") {
      const bad = needKey(env, url);
      if (bad) return Response.json({ ok: false, error: bad }, { status: 401 });
      return Response.json(await doPulse(env, "manual"));
    }
    if (req.method === "POST" && (url.pathname === "/run" || url.pathname === "/api/run")) {
      let body = null;
      try { body = await req.json(); } catch (e) { return Response.json({ ok: false, error: "parse error" }, { status: 400 }); }
      if (env.RUNNER_KEY && body.key !== env.RUNNER_KEY) return Response.json({ ok: false, error: "bad or missing key" }, { status: 401 });
      const prompt = String((body && (body.prompt || body.text)) || PULSE_PROMPT);
      const t0 = Date.now();
      try {
        const out = await brainOnce(env, prompt, body.model, body.max_tokens);
        const line = "- " + new Date().toISOString() + " · run · " + out.via + ":" + out.model + " · " + prompt.slice(0, 80).replace(/\s+/g, " ") + " → " + out.text.trim().slice(0, 60).replace(/\s+/g, " ") + " · " + out.ms + "ms";
        const log = await logToGitHub(env, line);
        return Response.json({ ok: true, reply: out.text, via: out.via, model: out.model, ms: Date.now() - t0, usage: out.usage || null, logged: log.logged });
      } catch (e) { return Response.json({ ok: false, error: String((e && e.message) || e).slice(0, 300) }, { status: 502 }); }
    }
    if (req.method === "POST" && url.pathname === "/mcp") {
      let body = null;
      try { body = await req.json(); } catch (e) { return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }, { status: 400 }); }
      const id = body.id ?? null;
      const ok = (result) => Response.json({ jsonrpc: "2.0", id, result });
      const err = (code, message) => Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 200 });
      if (body.method === "initialize")
        return ok({ protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "pais-mcp-cloud", version: "0.2.0" } });
      if (body.method === "notifications/initialized") return new Response(null, { status: 202 });
      if (body.method === "tools/list") return ok({ tools: TOOL_DEFS });
      if (body.method === "tools/call") {
        const name = body.params && body.params.name;
        const args = (body.params && body.params.arguments) || {};
        try {
          if (name === "gateway_chat") {
            if (!args.prompt) return err(-32602, "missing prompt");
            const out = await callGateway(env, String(args.prompt), args.model, args.max_tokens);
            return ok({ content: [{ type: "text", text: out.text }], _meta: { usage: out.usage, model: out.model } });
          }
          if (name === "openrouter_chat") {
            if (!args.prompt) return err(-32602, "missing prompt");
            const out = await callOpenRouter(env, String(args.prompt), args.model, args.max_tokens);
            return ok({ content: [{ type: "text", text: out.text }], _meta: { usage: out.usage, model: out.model } });
          }
          if (name === "edtech_build") return err(-32601, "edtech_build: desk has no callable lane yet (stub)");
          return err(-32601, "unknown tool: " + name);
        } catch (e) { return ok({ content: [{ type: "text", text: "error: " + String((e && e.message) || e).slice(0, 300) }], isError: true }); }
      }
      return err(-32601, "unknown method: " + body.method);
    }
    return new Response("pais-mcp-cloud+runner — POST /mcp · POST /run · GET /pulse · GET /health", { status: 404 });
}
addEventListener("fetch", (e) => { e.respondWith(handleFetch(e.request, globalThis)); });
