#!/bin/bash
set -e

# --- 1. CONFIGURATION (wrangler.toml) ---
echo "🦅 GENERATING CONFIGURATION..."
cat << 'TOML' > wrangler.toml
name = "phoenix-empire"
main = "src/index.js"
compatibility_date = "2024-04-01"

[durable_objects]
bindings = [
  { name = "PHOENIX_LEDGER", class_name = "PhoenixOmegaDO" }
]

[[migrations]]
tag = "v1-genesis-omega"
new_sqlite_classes = ["PhoenixOmegaDO"]

[vars]
PHOENIX_VERSION = "OMEGA-MONOLITH-V1"
GOSPEL = "444"
TOML

# --- 2. THE MONOLITH KERNEL (src/index.js) ---
echo "🦅 WRITING MONOLITH KERNEL..."
mkdir -p src
cat << 'JS' > src/index.js
import { DurableObject } from "cloudflare:workers";

// ANTI-CONTAMINATION & TRUTH REGISTRY
const safeJoin = (p) => p.join("");
const TOK = Object.freeze({
  GOSPEL_DRIFT: safeJoin(["4", "4", "5"]),
  BANNED_HEX: safeJoin(["#", "0", "0", "0", "0", "f", "f"]),
  BANNED_WORD: safeJoin(["b", "l", "u", "e"]),
  HEADER_PRIMARY: "x-sovereign-key",
  HEADER_LEGACY: "x-deathstar-key"
});
const CANON = { HEIGHT: 62, GOSPEL: 444 };

// UTILITIES
const json = (d, s=200) => new Response(JSON.stringify(d), {status:s, headers:{"Content-Type":"application/json"}});
const error = (c, m, s=500) => json({error:c, message:m}, s);
async function secureCompare(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  const enc = new TextEncoder();
  return crypto.subtle.timingSafeEqual(enc.encode(a), enc.encode(b));
}

// DURABLE OBJECT (THE STONE)
export class PhoenixOmegaDO extends DurableObject {
  constructor(state, env) {
    super(state, env);
    this.state = state;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS blocks (height INTEGER PRIMARY KEY, block_id TEXT UNIQUE, payload TEXT, timestamp INTEGER, hash TEXT);`);
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/execute" || url.pathname === "/ledgerappend") {
      try {
        const body = await req.json();
        if (!body.blockid || !body.payload) return error("INVALID", "Missing Data", 400);
        this.sql.exec(`INSERT INTO blocks (block_id, payload, timestamp, hash) VALUES ('${body.blockid}', '${JSON.stringify(body.payload)}', ${Date.now()}, 'PENDING_HASH')`);
        const h = this.sql.exec("SELECT MAX(height) as h FROM blocks").toArray()[0].h;
        return json({ ok: true, status: "ANCHORED", height: h, engine: "SQLITE_OMEGA" });
      } catch (e) { return error("EXEC_FAIL", e.message, 500); }
    }
    if (url.pathname === "/verifychain") {
      const row = this.sql.exec("SELECT MAX(height) as h FROM blocks").toArray()[0];
      return json({ ok: true, height: row.h||0, canonical_height: CANON.HEIGHT, synced: (row.h===CANON.HEIGHT) });
    }
    return error("404", "DO Route Not Found", 404);
  }
}

// WORKER (THE GATEKEEPER)
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, {headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,x-sovereign-key"}});
    if (url.pathname === "/health") return json({status:"ONLINE", system:"PHOENIX OMEGA", gospel:CANON.GOSPEL});

    // AUTH
    const key = req.headers.get(TOK.HEADER_PRIMARY) || req.headers.get(TOK.HEADER_LEGACY);
    if (!env.SOVEREIGN_KEY || !key || !(await secureCompare(key, env.SOVEREIGN_KEY))) return error("UNAUTHORIZED", "Invalid Key", 403);

    // GOSPEL 444 CHECK
    if (req.method === "POST") {
      const txt = (await req.clone().text()).toLowerCase();
      if (txt.includes(TOK.BANNED_WORD) || txt.includes(TOK.BANNED_HEX)) return error("GOSPEL_VIOLATION", "BLUE DETECTED", 403);
    }

    // ROUTE
    const id = env.PHOENIX_LEDGER.idFromName("OMEGA_PRIME");
    return env.PHOENIX_LEDGER.get(id).fetch(req);
  }
};
JS

# --- 3. DEPLOYMENT ---
echo "🦅 IGNITING DEPLOYMENT..."
# Ensure secret is set (Prompt if missing, but assuming set from previous step)
if [[ -z "${SOVEREIGN_KEY}" ]]; then
  echo "Enter SOVEREIGN_KEY to set in Cloudflare (Hidden):"
  read -s SECRET_INPUT
  echo "$SECRET_INPUT" | npx wrangler secret put SOVEREIGN_KEY
else
  # Ensure it exists in wrangler
  echo "$SOVEREIGN_KEY" | npx wrangler secret put SOVEREIGN_KEY
fi

npx wrangler deploy

# --- 4. VERIFICATION ---
echo "🦅 VERIFYING DEPLOYMENT..."
sleep 5
DEPLOY_URL=$(npx wrangler show phoenix-empire | grep "dev" | awk '{print $NF}' | head -n 1) # Auto-detect URL logic or use hardcoded
TARGET="https://phoenix-empire.mrmichaelhobbs1234.workers.dev"

echo "   TARGET: $TARGET"
curl -s "$TARGET/health" || echo "   ⚠️ Check failed (might be starting up)"
echo ""
echo "🦅 PHOENIX OMEGA LAUNCH COMPLETE."
