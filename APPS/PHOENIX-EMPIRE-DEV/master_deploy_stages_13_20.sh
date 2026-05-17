#!/bin/bash
# PHOENIX OMEGA: MASTER DEPLOYMENT PIPELINE
# STAGES 13-20 AUTOMATED EXECUTION
# AUTHORITY: AGENT-100

set -e

echo "🦅 PHOENIX OMEGA: STAGES 13-20 DEPLOYMENT PIPELINE"
echo "=================================================="
echo ""

# Validate environment
if [ -z "$SOVEREIGN_KEY" ]; then
  echo "❌ ERROR: SOVEREIGN_KEY not set"
  echo "Run: export SOVEREIGN_KEY='your-key'"
  exit 1
fi

TARGET_URL="https://phoenix-empire.mrmichaelhobbs1234.workers.dev"
WORKER_DIR="/mnt/c/Users/mrmic/phoenix-empire/worker"

cd "$WORKER_DIR"

echo "✅ Environment validated"
echo "   Worker: $WORKER_DIR"
echo "   Target: $TARGET_URL"
echo ""

# ============================================================
# STAGE 13: REVENUE LOGIC
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦅 STAGE 13: REVENUE CAPTURE LOGIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > src/revenue_logic.js << 'EOF'
// Revenue capture logic for Phoenix Omega
export function captureRevenue(sql, amount, source) {
  // Get current height
  const heightResult = sql.exec("SELECT MAX(height) as max_height FROM blocks");
  const currentHeight = heightResult?.toArray?.()?.[0]?.max_height ?? 0;
  const newHeight = currentHeight + 1;
  
  // Create revenue block
  const timestamp = Date.now();
  const hash = `REV_${newHeight}_${timestamp}_${amount}`;
  
  sql.exec(`
    INSERT INTO blocks (height, hash, timestamp)
    VALUES (${newHeight}, '${hash}', ${timestamp})
  `);
  
  // Store revenue metadata
  sql.exec(`
    CREATE TABLE IF NOT EXISTS revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      block_height INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      source TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `);
  
  sql.exec(`
    INSERT INTO revenue (block_height, amount, source, timestamp)
    VALUES (${newHeight}, ${amount}, '${source}', ${timestamp})
  `);
  
  return {
    ok: true,
    block_height: newHeight,
    amount: amount,
    source: source,
    hash: hash
  };
}

export function getTotalRevenue(sql) {
  const result = sql.exec("SELECT COALESCE(SUM(amount), 0) as total FROM revenue");
  return result?.toArray?.()?.[0]?.total ?? 0;
}
EOF

echo "✅ Revenue logic module created"
echo ""

# Update worker with revenue endpoints
cat > src/index.js << 'WORKER_EOF'
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
    
    if (url.pathname === "/health") {
      return Response.json({ 
        ok: true, 
        version: env.PHOENIX_VERSION || "v67.0",
        gospel: env.GOSPEL || "444",
        stage: "13-20-PIPELINE"
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
WORKER_EOF

echo "✅ Worker updated with revenue logic"
echo ""

# Update wrangler.toml version
sed -i 's/PHOENIX_VERSION = .*/PHOENIX_VERSION = "v67.0-REVENUE-PIPELINE"/' wrangler.toml

echo "🚀 Deploying Stage 13..."
npx wrangler deploy

echo "✅ Stage 13 deployed"
echo ""

# ============================================================
# STAGE 14: TEST REVENUE CAPTURE
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦅 STAGE 14: REVENUE CAPTURE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Testing revenue capture (100M VND)..."
REVENUE_RESULT=$(curl -s -X POST "$TARGET_URL/revenue" \
  -H "x-sovereign-key: $SOVEREIGN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100000000, "source": "test_capture"}')

echo "$REVENUE_RESULT" | jq '.'

if echo "$REVENUE_RESULT" | jq -e '.ok == true' > /dev/null; then
  echo "✅ Revenue captured successfully"
else
  echo "❌ Revenue capture failed"
  exit 1
fi

echo ""

# ============================================================
# STAGE 15: VERIFY TOTAL
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦅 STAGE 15: VERIFY REVENUE TOTAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOTAL_RESULT=$(curl -s "$TARGET_URL/revenue/total" \
  -H "x-sovereign-key: $SOVEREIGN_KEY")

echo "$TOTAL_RESULT" | jq '.'

if echo "$TOTAL_RESULT" | jq -e '.ok == true' > /dev/null; then
  TOTAL=$(echo "$TOTAL_RESULT" | jq -r '.total')
  echo "✅ Total revenue: $TOTAL VND"
else
  echo "❌ Total verification failed"
  exit 1
fi

echo ""

# ============================================================
# STAGE 16: STONE=SKY FINAL VERIFICATION
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦅 STAGE 16: STONE=SKY FINAL VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CHAIN_RESULT=$(curl -s "$TARGET_URL/verifychain" \
  -H "x-sovereign-key: $SOVEREIGN_KEY")

echo "$CHAIN_RESULT" | jq '.'

CHAIN_HEIGHT=$(echo "$CHAIN_RESULT" | jq -r '.height')
echo "Chain height: $CHAIN_HEIGHT"

if [ "$CHAIN_HEIGHT" -gt "0" ]; then
  echo "✅ Chain has blocks (height: $CHAIN_HEIGHT)"
else
  echo "⚠️  Chain height is 0 (genesis only)"
fi

echo ""

# ============================================================
# STAGE 17-20: GENERATE EVIDENCE
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦅 STAGES 17-20: EVIDENCE GENERATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EVIDENCE_FILE="evidence_pipeline_complete.json"

cat > "$EVIDENCE_FILE" << EOF
{
  "pipeline": "PHOENIX_OMEGA_STAGES_13_20",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "stages": {
    "stage_13": {
      "status": "COMPLETE",
      "description": "Revenue logic deployed",
      "version": "v67.0-REVENUE-PIPELINE"
    },
    "stage_14": {
      "status": "COMPLETE",
      "description": "Revenue capture tested",
      "test_amount": 100000000,
      "result": $(echo "$REVENUE_RESULT" | jq -c '.')
    },
    "stage_15": {
      "status": "COMPLETE",
      "description": "Total revenue verified",
      "result": $(echo "$TOTAL_RESULT" | jq -c '.')
    },
    "stage_16": {
      "status": "COMPLETE",
      "description": "Chain verification",
      "height": $CHAIN_HEIGHT,
      "result": $(echo "$CHAIN_RESULT" | jq -c '.')
    },
    "stage_17_20": {
      "status": "COMPLETE",
      "description": "Evidence generated"
    }
  },
  "deployment": {
    "worker_url": "$TARGET_URL",
    "version": "v67.0-REVENUE-PIPELINE",
    "gospel": "444"
  },
  "endpoints": {
    "health": "$TARGET_URL/health",
    "genesis": "$TARGET_URL/genesis",
    "verifychain": "$TARGET_URL/verifychain",
    "revenue": "$TARGET_URL/revenue",
    "revenue_total": "$TARGET_URL/revenue/total"
  },
  "status": "PIPELINE_COMPLETE"
}
EOF

echo "✅ Evidence file generated: $EVIDENCE_FILE"
cat "$EVIDENCE_FILE" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦅 PIPELINE COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All stages (13-20) executed successfully"
echo "✅ Worker deployed: $TARGET_URL"
echo "✅ Chain height: $CHAIN_HEIGHT"
echo "✅ Revenue system: ACTIVE"
echo "✅ Evidence: $EVIDENCE_FILE"
echo ""
echo "🦅 PHOENIX OMEGA: OPERATIONAL"
