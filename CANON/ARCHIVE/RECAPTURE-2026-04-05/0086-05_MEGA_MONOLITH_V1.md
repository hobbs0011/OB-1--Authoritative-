# BEGIN SOURCE
Source: TEMP-PHOENIX-IMMORTALIZE\SOUL-DNA-BIBLE\05_MEGA_MONOLITH_V1.md
SHA256: 75DA201862F19FA19CCE6E7E925D4B4F34174347118FDBE15D57B6F4F6C9524A

# CH05 — Stage 3: Mega Monolith V1

## Stage 3 — PHOENIX_MEGA_MONOLITH_V1.js

**Purpose**: Single-file ledger + Merkle + SHA-256 + self-test. Ingest raw dumps, hash them, maintain Merkle-style head, export + self-test.  
**Runtime**: Node.js (native), browser (with crypto.subtle fallback)  
**Status**: Stage 3 Rise Artifact

---

### Full Source Code

```javascript
// PHOENIX_MEGA_MONOLITH_V1.js
// STATUS: SINGLE-FILE LEDGER + MERKLE + SHA-256 + SELF-TEST
// RUNTIME: Node.js (native), browser (with crypto.subtle fallback)
// PURPOSE: Ingest raw dumps, hash them, maintain Merkle-style head, export + self-test.
// CANON GUARDRAILS (REFERENCE-ONLY, NOT CANON-EDIT):
// - Ledger is append-only, no deletes. [PHOENIX BIBLE / Empire Codex]
// - SHA-256 as integrity primitive. [PHOENIX OMEGA + Harvester kernels]
// - Canonical JSON for hash stability. [Bible Builder 5-in-1 pipeline]
// - No fake persistence: export state, don't pretend permanent. [Totality / V20 seed]

"use strict";

// ---------- 0. UTILITIES: STABLE JSON + SHA-256 --------------------------------
function stableCanonicalJSON(value) {
  const seen = new WeakSet();
  function norm(v) {
    if (v === null || typeof v !== "object") return v;
    if (seen.has(v)) return "[CYCLE]";
    seen.add(v);
    if (Array.isArray(v)) return v.map(norm);
    const out = {};
    for (const k of Object.keys(v).sort()) out[k] = norm(v[k]);
    return out;
  }
  return JSON.stringify(norm(value));
}

async function sha256Hex(input) {
  const str = typeof input === "string" ? input : stableCanonicalJSON(input);
  try {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(str, "utf8").digest("hex");
  } catch {
    if (typeof globalThis.crypto?.subtle !== "undefined") {
      const enc = new TextEncoder();
      const buf = await globalThis.crypto.subtle.digest("SHA-256", enc.encode(str));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0;
    }
    return `weak-${(h >>> 0).toString(16).padStart(8, "0")}`;
  }
}

// ---------- 1. MERKLE HELPERS --------------------------------------------------
function merklePairHash(left, right) {
  return stableCanonicalJSON({ left, right });
}

async function computeMerkleRoot(hashes) {
  if (!hashes || hashes.length === 0) return null;
  if (hashes.length === 1) return hashes[0];
  let level = hashes.slice();
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = level[i];
      const b = i + 1 < level.length ? level[i + 1] : a;
      const pairHash = await sha256Hex(merklePairHash(a, b));
      next.push(pairHash);
    }
    level = next;
  }
  return level[0];
}

// ---------- 2. LEDGER CORE (APPEND-ONLY) --------------------------------------
class PhoenixMegaLedger {
  constructor(maxEvents = 50000) {
    this._events = [];
    this._headHash = "0".repeat(64);
    this._height = 0;
    this._maxEvents = maxEvents;
  }
  get height() { return this._height; }
  get headHash() { return this._headHash; }
  get events() { return this._events.slice(); }

  async append(rawText, meta = {}) {
    if (typeof rawText !== "string" || !rawText.trim()) {
      throw new Error("RAWTEXT_REQUIRED");
    }
    const ts = new Date().toISOString();
    const rawLen = Buffer.byteLength(rawText, "utf8");
    const rawSha256 = await sha256Hex(rawText);
    const nonce = this._height + 1;
    const prevHash = this._headHash;
    const envelope = { nonce, ts, rawLen, rawSha256, prevHash };
    const hash = await sha256Hex(envelope);
    const event = Object.freeze({
      idx: this._events.length, nonce, ts, rawLen,
      rawSha256, prevHash, hash,
      meta: Object.freeze({ ...meta })
    });
    this._events.push(event);
    this._headHash = hash;
    this._height = nonce;
    if (this._events.length > this._maxEvents) {
      this._events.splice(0, this._events.length - this._maxEvents);
    }
    return event;
  }

  async verify() {
    let expectedPrev = "0".repeat(64);
    let expectedNonce = 1;
    const hashes = [];
    for (const e of this._events) {
      if (e.prevHash !== expectedPrev) {
        return { ok: false, reason: "CHAINBREAK", at: e.idx, expectedPrev, gotPrev: e.prevHash };
      }
      if (e.nonce !== expectedNonce) {
        return { ok: false, reason: "NONCEMISMATCH", at: e.idx, expectedNonce, gotNonce: e.nonce };
      }
      const envelope = { nonce: e.nonce, ts: e.ts, rawLen: e.rawLen, rawSha256: e.rawSha256, prevHash: e.prevHash };
      const recomputed = await sha256Hex(envelope);
      if (recomputed !== e.hash) {
        return { ok: false, reason: "HASHMISMATCH", at: e.idx, expected: e.hash, got: recomputed };
      }
      expectedPrev = e.hash;
      expectedNonce += 1;
      hashes.push(e.hash);
    }
    const merkleRoot = await computeMerkleRoot(hashes);
    return { ok: true, headHash: this._headHash, height: this._height, merkleRoot, count: this._events.length };
  }

  async exportState() {
    const v = await this.verify();
    return {
      headHash: this._headHash, height: this._height,
      merkleRoot: v.ok ? v.merkleRoot : null,
      verified: v.ok, events: this._events
    };
  }
}

// ---------- 3. SELF-TEST / POKE-HOLES HARNESS ----------------------------------
async function selfTest() {
  const ledger = new PhoenixMegaLedger();
  const e1 = await ledger.append("DUMP-001: hello world", { tag: "TEST", seq: 1 });
  const e2 = await ledger.append("DUMP-002: another event", { tag: "TEST", seq: 2 });
  const e3 = await ledger.append("DUMP-003: large-ish payload " + "x".repeat(1024), { tag: "TEST", seq: 3 });
  const v1 = await ledger.verify();
  const corruptLedger = new PhoenixMegaLedger();
  corruptLedger._events = ledger.events.map((e) => ({ ...e }));
  if (corruptLedger._events[1]) {
    corruptLedger._events[1].prevHash = "9".repeat(64);
  }
  corruptLedger._headHash = ledger.headHash;
  corruptLedger._height = ledger.height;
  const v2 = await corruptLedger.verify();
  return { sampleEvents: [e1, e2, e3], verifyClean: v1, verifyCorrupt: v2 };
}

// ---------- 4. CLI ENTRYPOINT --------------------------------------------------
async function main() {
  const args = process.argv.slice(2);
  const cmd = (args[0] || "").toLowerCase();
  if (!cmd || cmd === "help" || cmd === "--help") {
    console.log([
      "PHOENIX_MEGA_MONOLITH_V1",
      "Commands:",
      "  ingest <rawText>    Append a single event and print its hash.",
      "  verify              Verify chain + Merkle root.",
      "  selftest            Run built-in harness (clean vs corrupt).",
      "",
      "NOTE: Events kept in memory only. Persist via exportState()."
    ].join("\n"));
    return;
  }
  if (!globalThis.__PHOENIX_MEGA_LEDGER__) {
    globalThis.__PHOENIX_MEGA_LEDGER__ = new PhoenixMegaLedger();
  }
  const ledger = globalThis.__PHOENIX_MEGA_LEDGER__;
  if (cmd === "ingest") {
    const rawText = args.slice(1).join(" ");
    const ev = await ledger.append(rawText, { source: "CLI" });
    console.log(JSON.stringify({ ok: true, nonce: ev.nonce, hash: ev.hash, prevHash: ev.prevHash, rawSha256: ev.rawSha256 }, null, 2));
  } else if (cmd === "verify") {
    console.log(JSON.stringify(await ledger.verify(), null, 2));
  } else if (cmd === "selftest") {
    console.log(JSON.stringify(await selfTest(), null, 2));
  } else {
    console.log(JSON.stringify({ ok: false, error: "UNKNOWN_COMMAND", cmd }, null, 2));
  }
}

if (typeof require !== "undefined" && require.main === module) {
  main().catch((e) => {
    console.error(JSON.stringify({ ts: new Date().toISOString(), level: "ERROR", event: "MEGA_MONOLITH_FATAL", message: e?.message || String(e) }, null, 2));
    process.exitCode = 1;
  });
}

module.exports = { PhoenixMegaLedger, computeMerkleRoot, stableCanonicalJSON, sha256Hex, selfTest };
```

---

### How to Run

- `node PHOENIX_MEGA_MONOLITH_V1.js selftest` — inspect verifyClean vs verifyCorrupt
- `node PHOENIX_MEGA_MONOLITH_V1.js ingest <text>` — feed real dumps
- `node PHOENIX_MEGA_MONOLITH_V1.js verify` — watch SHA-256 and Merkle behavior

### Layman's Explanation

Every time you "write a line" (your dump), it:
1. Calculates a SHA-256 fingerprint of that line
2. Chains it to the previous line, so changing any old line breaks the chain
3. Can check itself and say "everything is consistent" or "this line was messed with"

Think of each event as a **brick with a unique code** printed on it. Bricks are stacked in order; each brick's code depends on the one below it. The **Merkle root** is like one master code for the entire stack: if any brick changes, the master code changes.

# END SOURCE
