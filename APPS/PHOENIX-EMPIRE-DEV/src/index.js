import { handleMagicChat } from "./magic_chat_endpoint.js";
import { DurableObject } from "cloudflare:workers";
import { captureRevenue, getTotalRevenue } from "./revenue_logic.js";

export class PhoenixLedgerDO extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
  }
  async fetch(request) {
    return new Response("LEGACY_GHOST");
  }
}

export class PhoenixLedgerDOv2 extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
  }
  
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const sql = this.state.storage.sql;
      
      // RATE LIMITER FOR MAGIC CHAT
      if (url.pathname === "/_chat_ratelimit" && request.method === "POST") {
        return this.state.blockConcurrencyWhile(async () => {
          const { k, rpm } = await request.json().catch(() => ({}));
          const key = String(k || "");
          const limit = Math.max(1, Number(rpm || 60));
          if (!key) return new Response("bad", { status: 400 });

          await sql.exec(`CREATE TABLE IF NOT EXISTS chat_rl (k TEXT PRIMARY KEY, window_start INTEGER, count INTEGER)`);

          const now = Date.now();
          const windowStart = Math.floor(now / 60000) * 60000;
          const rows = sql.exec(`SELECT window_start, count FROM chat_rl WHERE k = ?`, key).toArray();
          const row = rows[0];

          if (!row || row.window_start !== windowStart) {
            await sql.exec(`INSERT OR REPLACE INTO chat_rl (k, window_start, count) VALUES (?, ?, ?)`, key, windowStart, 1);
            return new Response("ok", { status: 200 });
          }
          if (row.count >= limit) return new Response("rate", { status: 429 });
          await sql.exec(`UPDATE chat_rl SET count = count + 1 WHERE k = ?`, key);
          return new Response("ok", { status: 200 });
        });
      }
      
      // Create tables
      sql.exec(`
        CREATE TABLE IF NOT EXISTS blocks (
          height INTEGER PRIMARY KEY,
          hash TEXT NOT NULL,
          timestamp INTEGER NOT NULL
        )
      `);
      
      // GENESIS
      if (url.pathname === "/genesis") {
        const check = sql.exec("SELECT COUNT(*) as count FROM blocks WHERE height = 0");
        const exists = check?.toArray?.()?.[0]?.count > 0;
        
        if (exists) {
          return Response.json({ ok: false, error: "Genesis exists" });
        }
        
        sql.exec(`INSERT INTO blocks (height, hash, timestamp) VALUES (0, 'GENESIS_HASH_000', ${Date.now()})`);
        return Response.json({ ok: true, message: "Genesis created", height: 0 });
      }
      
      // VERIFY CHAIN
      if (url.pathname === "/verifychain") {
        const result = sql.exec("SELECT MAX(height) as max_height FROM blocks");
        const row = result?.toArray?.()?.[0];
        const height = row?.max_height ?? 0;
        
        return Response.json({ 
          ok: true,
          height: height,
          timestamp: Date.now()
        });
      }
      
      // CAPTURE REVENUE
      if (url.pathname === "/revenue") {
        const body = await request.json();
        const amount = parseInt(body.amount) || 0;
        const source = body.source || "unknown";
        
        if (amount <= 0) {
          return Response.json({ ok: false, error: "Invalid amount" }, { status: 400 });
        }
        
        const result = captureRevenue(sql, amount, source);
        return Response.json(result);
      }
      
      // GET TOTAL REVENUE
      if (url.pathname === "/revenue/total") {
        const total = getTotalRevenue(sql);
        return Response.json({ 
          ok: true,
          total: total,
          target: 1000000000,
          progress: (total / 1000000000 * 100).toFixed(2) + "%"
        });
      }
      
      return Response.json({ ok: true, status: "ANCHORED" });
      
    } catch (error) {
      return Response.json({ 
        ok: false,
        error: error.message
      }, { status: 500 });
    }
  }
}

export class PhoenixOmegaDO_v2 extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
  }
  async fetch(request) {
    return new Response("LEGACY_OMEGA_V2");
  }
}

export class PhoenixOmegaDO extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
  }
  async fetch(request) {
    return new Response("LEGACY_OMEGA");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // MAGIC CHAT ROUTE
    if (url.pathname === "/chat") return handleMagicChat(request, env);
    
    if (url.pathname === "/health") {
      return Response.json({ 
        ok: true, 
        version: env.PHOENIX_VERSION || "v68.1-MAGIC-CHAT",
        gospel: env.GOSPEL || "444",
        stage: "MAGIC-CHAT-ACTIVE"
      });
    }
    
    const protectedPaths = ["/execute", "/verifychain", "/genesis", "/revenue"];
    if (protectedPaths.some(p => url.pathname.startsWith(p))) {
      const key = request.headers.get("x-sovereign-key");
      if (!key) return Response.json({ error: "Missing key" }, { status: 401 });
      if (!env.SOVEREIGN_KEY) return Response.json({ error: "Server key not set" }, { status: 500 });
      if (key !== env.SOVEREIGN_KEY) return Response.json({ error: "Invalid key" }, { status: 403 });
      
      const id = env.PHOENIX_LEDGER.idFromName("OMEGA_PRIME");
      const stub = env.PHOENIX_LEDGER.get(id);
      return stub.fetch(request);
    }
    
    return Response.json({ error: "Not Found" }, { status: 404 });
  }
};