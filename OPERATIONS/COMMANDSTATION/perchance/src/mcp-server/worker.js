/* PaiS MCP CLOUD — Cloudflare Worker serving the tool lane over MCP
   (streamable HTTP). STAGED — NOT deployed (deploy needs /cf token).
   Endpoints: GET /health · POST /mcp (initialize, tools/list, tools/call).
   Secrets: set KILO_KEY with `wrangler secret put KILO_KEY` — never in code. */
const GATEWAY_BASE = "https://ai-gateway.kilo.ai/api/v1";
const TOOL_DEFS = [
  { name: "gateway_chat", description: "Chat completion via the Kilo Gateway (free lane first, usage metered)", inputSchema: { type: "object", properties: { model: { type: "string" }, prompt: { type: "string" }, max_tokens: { type: "integer" } }, required: ["prompt"] } },
  { name: "edtech_build", description: "Lesson build on the edtech desk (stub until the desk exposes a callable lane)", inputSchema: { type: "object", properties: { spec: { type: "object" } } } }
];
async function callGateway(env, model, prompt, max_tokens) {
  if (!env.KILO_KEY) throw new Error("server has no KILO_KEY secret");
  const r = await fetch(GATEWAY_BASE + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + env.KILO_KEY },
    body: JSON.stringify({ model: model || "kilo-auto/free", max_tokens: Math.min(max_tokens || 300, 2000), messages: [{ role: "user", content: prompt }] })
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error("gateway HTTP " + r.status);
  const txt = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  return { content: [{ type: "text", text: String(txt) }], usage: (j && j.usage) || null, model };
}
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/health")
      return Response.json({ ok: true, tools: TOOL_DEFS.map(t => t.name) });
    if (req.method === "POST" && url.pathname === "/mcp") {
      let body = null;
      try { body = await req.json(); } catch (e) { return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }, { status: 400 }); }
      const id = body.id ?? null;
      const ok = (result) => Response.json({ jsonrpc: "2.0", id, result });
      const err = (code, message) => Response.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 200 });
      if (body.method === "initialize")
        return ok({ protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "pais-mcp-cloud", version: "0.1.0" } });
      if (body.method === "notifications/initialized") return new Response(null, { status: 202 });
      if (body.method === "tools/list") return ok({ tools: TOOL_DEFS });
      if (body.method === "tools/call") {
        const name = body.params && body.params.name;
        const args = (body.params && body.params.arguments) || {};
        try {
          if (name === "gateway_chat") {
            if (!args.prompt) return err(-32602, "missing prompt");
            const out = await callGateway(env, args.model, String(args.prompt), args.max_tokens);
            return ok({ content: out.content, _meta: { usage: out.usage, model: out.model } });
          }
          if (name === "edtech_build") return err(-32601, "edtech_build: desk has no callable lane yet (stub)");
          return err(-32601, "unknown tool: " + name);
        } catch (e) { return ok({ content: [{ type: "text", text: "error: " + String((e && e.message) || e).slice(0, 300) }], isError: true }); }
      }
      return err(-32601, "unknown method: " + body.method);
    }
    return new Response("pais-mcp-cloud — POST /mcp (MCP streamable HTTP) · GET /health", { status: 404 });
  }
};
