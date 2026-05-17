// net-obi-api — Legacy NET OBI API prototype
// Rescued from Cloudflare Workers 2026-05-18
// STATUS: SUPERSEDED by net-pet-ai. Keep for reference only.
// Env: WAITLIST (KV), SESSIONS (KV)
// Endpoints: GET /, GET /api/health, GET /api/stats, POST /api/waitlist, POST /api/chat
// Note: /api/chat uses hardcoded responses — real AI was never wired ("TODO" in source)

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api.js
var api_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (url.pathname === "/" || url.pathname === "/app") {
        return html(renderFrontend(), corsHeaders);
      }
      switch (url.pathname) {
        case "/api/health":
          return json({ status: "ok", service: "NET-OBI-API", version: "0.1.0", timestamp: new Date().toISOString() }, corsHeaders);
        case "/api/waitlist":
          if (request.method !== "POST") return json({ error: "POST only" }, corsHeaders, 405);
          return handleWaitlist(request, env, corsHeaders);
        case "/api/chat":
          if (request.method !== "POST") return json({ error: "POST only" }, corsHeaders, 405);
          return handleChat(request, env, corsHeaders);
        case "/api/stats":
          return handleStats(env, corsHeaders);
        default:
          return json({ error: "Not found", ui: ["/", "/app"], endpoints: ["/api/health", "/api/waitlist", "/api/chat", "/api/stats"] }, corsHeaders, 404);
      }
    } catch (err) {
      return json({ error: "Internal error", message: err.message }, corsHeaders, 500);
    }
  }
};
async function handleWaitlist(request, env, corsHeaders) {
  const body = await request.json();
  const { email, name, source } = body;
  if (!email || !email.includes("@")) return json({ error: "Valid email required" }, corsHeaders, 400);
  const entry = { email: email.toLowerCase().trim(), name: name || "", source: source || "website", timestamp: new Date().toISOString(), ip: request.headers.get("CF-Connecting-IP") || "unknown", country: request.headers.get("CF-IPCountry") || "unknown" };
  if (env.WAITLIST) {
    const existing = await env.WAITLIST.get(email.toLowerCase());
    if (existing) return json({ success: true, message: "Already on the waitlist!", duplicate: true }, corsHeaders);
    await env.WAITLIST.put(email.toLowerCase(), JSON.stringify(entry));
  }
  return json({ success: true, message: "Welcome to the waitlist!" }, corsHeaders);
}
__name(handleWaitlist, "handleWaitlist");
async function handleChat(request, env, corsHeaders) {
  const { message, sessionId, level } = await request.json();
  if (!message || typeof message !== "string") return json({ error: "Message required" }, corsHeaders, 400);
  const sid = sessionId || crypto.randomUUID();
  const currentLevel = level || "mouse";
  let history = [];
  if (env.SESSIONS && sessionId) {
    const stored = await env.SESSIONS.get(`session:${sessionId}`);
    if (stored) history = JSON.parse(stored);
  }
  history.push({ role: "user", content: message, timestamp: new Date().toISOString() });
  let reply, encouragement = "";
  if (currentLevel === "mouse") { reply = getMouseResponse(message); encouragement = getEncouragement("mouse"); }
  else if (currentLevel === "cat") { reply = "That's a great point! My full AI brain is still being connected. Check back soon!"; encouragement = getEncouragement("cat"); }
  else { reply = "My full AI capabilities are coming online soon. 🐯"; encouragement = getEncouragement(currentLevel); }
  history.push({ role: "assistant", content: reply, timestamp: new Date().toISOString() });
  if (env.SESSIONS) await env.SESSIONS.put(`session:${sid}`, JSON.stringify(history.slice(-50)), { expirationTtl: 86400 * 7 });
  return json({ reply, sessionId: sid, level: currentLevel, corrections: [], encouragement, messageCount: history.length }, corsHeaders);
}
__name(handleChat, "handleChat");
async function handleStats(env, corsHeaders) {
  return json({ service: "NET-OBI-API", version: "0.1.0", features: { waitlist: !!env.WAITLIST, sessions: !!env.SESSIONS, ai: false }, levels: ["mouse", "cat", "wolf", "tiger"] }, corsHeaders);
}
__name(handleStats, "handleStats");
function getMouseResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) return "Hello! Welcome! I'm so glad you're here. How are you feeling today?";
  if (lower.includes("good") || lower.includes("fine") || lower.includes("great")) return "That's wonderful to hear! Tell me something interesting about your day.";
  if (lower.includes("help") || lower.includes("learn")) return "I'm here to help! Tell me about yourself — what do you do? Where are you from?";
  return "That's great — you're already practicing! Keep talking! 🐯";
}
__name(getMouseResponse, "getMouseResponse");
function getEncouragement(level) {
  const e = { mouse: ["Every word you type is progress!", "You're braver than you think!"], cat: ["Your English is getting stronger!", "Look how far you've come!"], wolf: ["You're having real conversations now!", "Almost Tiger level!"], tiger: ["You're a Tiger! Own it!", "Confident and fluent — that's you!"] };
  const pool = e[level] || e.mouse;
  return pool[Math.floor(Math.random() * pool.length)];
}
__name(getEncouragement, "getEncouragement");
function json(data, corsHeaders, status = 200) { return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json", ...corsHeaders } }); }
__name(json, "json");
function html(markup, corsHeaders, status = 200) { return new Response(markup, { status, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders } }); }
__name(html, "html");
function renderFrontend() { return "<!-- NET OBI API Console frontend omitted from rescue — full source in CF Workers dashboard -->"; }
__name(renderFrontend, "renderFrontend");
export { api_default as default };
