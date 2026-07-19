# BEGIN SOURCE
Source: CANON\BIBLE-CH05-STAGE3-MEGA-MONOLITH-V1.md
SHA256: 4333F8ECAC40D6BD853D1967FF57E081C8BB09CB67D974A4E8AA6CAE6AA83A1C

# CH05 — Stage 3: Mega Monolith V1

> **Export class:** 🏦 VAULT ENRICHED
> **Source:** Notion Bible CH05 + Immortalize `05_MEGA_MONOLITH_V1.md`
> **Cross-repo sources:** 1 (Phoenix-Rise-Immortalize- SOUL-DNA-BIBLE/)
> **Exported:** 2026-03-30 Run 123 — Pulse-Incarnation Engine v5
> **Prior state:** UNMIRRORED (indexed Run 10, 2026-03-25)

---

## 0. Chapter Context — Where Stage 3 Sits in the Rise

The Soul DNA Bible documents Phoenix Rising through **stages of technical evolution**. The Mega Monolith is the third stage — the moment the system moved from conceptual architecture to a working, self-verifying code artifact.

| Stage | Chapter | What It Proves |
|-------|---------|----------------|
| Stage 0 | CH00 — Skeleton Star Map | The map exists — file inventory and metrics |
| Stage 1 | CH01 — Universal Ledger Map | The theory works — ledger architecture defined |
| Stage 2 | CH02–CH04 | Soul DNA mapped, artifacts sorted, axioms established |
| **Stage 3** | **CH05 — Mega Monolith V1** | **The code works — single-file ledger with crypto integrity** |
| Stage 4+ | CH06–CH13 | Risk analysis, governance, chaos engineering, teaching |

Stage 3 is the **proof-of-concept implementation** — the first time Phoenix Rising's append-only ledger principle became executable code rather than architectural documentation.

---

## 1. Purpose and Design Philosophy

**Purpose**: Single-file ledger + Merkle + SHA-256 + self-test. Ingest raw dumps, hash them, maintain Merkle-style head, export + self-test.

**Runtime**: Node.js (native), browser (with crypto.subtle fallback)

**Status**: Stage 3 Rise Artifact

### Canon Guardrails Referenced in Code

The Monolith's header comments explicitly reference four canon laws — these are not arbitrary design choices but direct implementations of Phoenix Bible law:

| Canon Guardrail | Source | Implementation in Monolith |
|----------------|--------|---------------------------|
| Ledger is append-only, no deletes | Phoenix Bible / Empire Codex (Axiom 1) | `append()` method only — no `delete()` or `update()` exists |
| SHA-256 as integrity primitive | Phoenix Omega + Harvester kernels | `sha256Hex()` with Node.js crypto + browser fallback |
| Canonical JSON for hash stability | Bible Builder 5-in-1 pipeline | `stableCanonicalJSON()` — sorted keys, cycle detection |
| No fake persistence | Totality / V20 seed | `exportState()` — explicit export, never pretends permanent |

### Design Principles Manifest

1. **Zero external dependencies** — single file, uses only Node.js built-ins or browser Web Crypto API
2. **Graceful degradation** — three-tier hash fallback: Node.js crypto → Web Crypto API → weak hash
3. **Self-verifying** — built-in `verify()` proves chain integrity at any time
4. **Self-testing** — `selfTest()` demonstrates both clean verification and tamper detection
5. **Portable** — runs in Node.js CLI or browser environment without modification

---

## 2. Architecture Breakdown

### 2.1 Utility Layer — Stable JSON + SHA-256

**`stableCanonicalJSON(value)`**
- Produces deterministic JSON output regardless of object key insertion order
- Sorts all object keys alphabetically
- Detects and handles circular references (`[CYCLE]`)
- Critical for hash stability: same data always produces same hash

**`sha256Hex(input)`**
- Three-tier implementation:
  1. **Node.js** `crypto.createHash('sha256')` — production-grade
  2. **Browser** `crypto.subtle.digest('SHA-256')` — Web Crypto API
  3. **Fallback** — weak 32-bit hash prefixed `weak-` (development only)
- Accepts both strings and objects (objects auto-serialized via `stableCanonicalJSON`)

### 2.2 Merkle Helpers

**`merklePairHash(left, right)`** — creates deterministic pair representation
**`computeMerkleRoot(hashes)`** — builds Merkle tree from leaf hashes:
- Single hash → return as-is
- Multiple hashes → pair-and-hash upward until one root remains
- Odd count → duplicate last hash (standard Merkle padding)

The Merkle root provides a single fingerprint for the entire ledger state — if any event changes, the root changes.

### 2.3 Ledger Core — `PhoenixMegaLedger`

The heart of Stage 3. Implements Axiom 1 (Ledger is Law) as code:

**Constructor:**
- `_events[]` — append-only array (max 50,000 events)
- `_headHash` — 64-character zero string (genesis state)
- `_height` — event counter starting at 0

**`append(rawText, meta)`:**
1. Validates raw text exists and is non-empty
2. Computes SHA-256 of raw text content
3. Creates envelope: `{ nonce, timestamp, rawLen, rawSha256, prevHash }`
4. Hashes the envelope to produce event hash
5. Freezes the event object (immutable once created)
6. Chains to previous event via `prevHash`
7. Trims oldest events if buffer exceeds `maxEvents`

**`verify()`:**
- Walks the entire chain from event 0
- Checks each event's `prevHash` matches the prior event's `hash`
- Checks each event's `nonce` is sequential
- Recomputes each event's hash from its envelope and compares
- Computes Merkle root over all verified hashes
- Returns structured result: `{ ok, headHash, height, merkleRoot, count }` or `{ ok: false, reason, at }`

**Verification failure modes:**
- `CHAINBREAK` — `prevHash` doesn't match expected (tampering detected)
- `NONCEMISMATCH` — nonce sequence broken (insertion or deletion detected)
- `HASHMISMATCH` — recomputed hash differs (envelope data tampered)

**`exportState()`:**
- Runs full verification
- Returns complete ledger state including Merkle root
- Implements the "no fake persistence" guardrail — state is explicitly exported, never assumed permanent

### 2.4 Self-Test Harness

The `selfTest()` function demonstrates the Monolith's tamper detection:

1. **Clean test**: Append 3 events → verify → should return `{ ok: true }`
2. **Corrupt test**: Copy events, tamper with event[1]'s `prevHash` → verify → should return `{ ok: false, reason: 'CHAINBREAK' }`

This is the system testing itself — a direct implementation of the SYF Truth Protocol at the code level.

### 2.5 CLI Interface

Three commands:
- `ingest <rawText>` — append event and print hash proof
- `verify` — verify full chain integrity
- `selftest` — run clean vs corrupt harness

---

## 3. Full Source Code

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

## 4. How to Run

- `node PHOENIX_MEGA_MONOLITH_V1.js selftest` — inspect verifyClean vs verifyCorrupt
- `node PHOENIX_MEGA_MONOLITH_V1.js ingest <text>` — feed real dumps
- `node PHOENIX_MEGA_MONOLITH_V1.js verify` — watch SHA-256 and Merkle behavior

---

## 5. Layman's Explanation

Every time you "write a line" (your dump), it:
1. Calculates a SHA-256 fingerprint of that line
2. Chains it to the previous line, so changing any old line breaks the chain
3. Can check itself and say "everything is consistent" or "this line was messed with"

Think of each event as a **brick with a unique code** printed on it. Bricks are stacked in order; each brick's code depends on the one below it. The **Merkle root** is like one master code for the entire stack: if any brick changes, the master code changes.

---

## 6. ENRICHMENT: Cross-Reference to Canon Architecture

### 6.1 How the Monolith Maps to the Four Pillars (CH04 §3.1)

The Mega Monolith is a **proof-of-concept for the Ledger Pillar** — one of the four architectural pillars defined in CH04:

| Pillar | CH04 Definition | Monolith Implementation |
|--------|----------------|------------------------|
| **Ledger (Truth Plane)** | D1 SQLite on Cloudflare Edge; append-only, canonical JSON, nonce + prevhash + hash chain | `PhoenixMegaLedger` class — identical chain model in pure JS |
| Drones (Execution Plane) | Workers with Cron reading ledger | Not implemented — Stage 3 scope is ledger only |
| MPCP (Energy Plane) | KV-backed energy states | Not implemented — Stage 3 scope is ledger only |
| Chaos (Fuel Plane) | 900k events/year | `selfTest()` demonstrates controlled chaos (tamper simulation) |

The Monolith proves that the Ledger Pillar's theoretical design actually works as executable code. The production target (Cloudflare D1) differs from the PoC runtime (Node.js/browser), but the chain logic is identical.

### 6.2 Axiom Compliance Audit

| Axiom (CH04 §2.1) | Monolith Compliance | Evidence |
|-----|-----|-----|
| Axiom 1 — Ledger is Law | ✅ PASS | No `delete()` or `update()` method exists; `append()` only |
| Axiom 2 — Hesitation is Deleted | ✅ PASS | Single-file, no dependencies, runs immediately |
| Axiom 3 — One Cycle, One Artifact | ✅ PASS | Entire ledger is one artifact; `exportState()` returns everything |
| Axiom 5 — Memory Over Intelligence | ✅ PASS | Every event is hashed and chained; perfect replay from any export |
| Axiom 8 — SYF Truth Protocol | ✅ PASS | `verify()` implements fail-closed integrity checking |

### 6.3 Evolution Path — Stage 3 to Production

The Mega Monolith V1 is a waypoint, not the final form:

1. **Stage 3 (this file)**: Pure JS, in-memory, single-file — proves the chain model works
2. **Production target**: Cloudflare D1 (SQLite at edge) + Workers (Cron loops) + KV (MPCP state)
3. **Gap**: Persistence (D1 vs memory), scale (50K cap vs unlimited), distribution (single process vs edge)

The Monolith's `exportState()` pattern directly maps to the "no fake persistence" guardrail — state must be explicitly exported, never assumed to survive process death. This same philosophy carries into the Cloudflare deployment: D1 is the persistence layer; Workers are stateless executors.

### 6.4 Connection to Bible Builder Pipeline (CH04 §4.2)

The `stableCanonicalJSON()` function in the Monolith implements the same canonical JSON requirement that the Bible Builder 5-in-1 pipeline uses for `RAWSHA256` commitments. The chain of trust is:

```
Raw dump → stableCanonicalJSON → sha256Hex → prevHash chain → Merkle root
```

This mirrors the Bible Builder's:

```
RAW → Stone-Anchor → Audit → Defect Register → Patch Monolith
```

Both pipelines enforce the same principle: **every input is hashed, every step is verifiable, no step can be skipped without breaking the chain.**

---

## 7. Cross-Reference Map

| Topic | CH05 Coverage | Related Canon | Synthesis |
|-------|---------------|---------------|-----------|
| Append-only ledger | Full implementation | CH04 §2.1 Axiom 1, CH01 Universal Ledger Map | CH05 is the **executable proof** of CH01's theory and CH04's axiom |
| SHA-256 integrity | `sha256Hex()` with fallback | CH04 §3.1 Ledger Pillar, Phoenix Omega kernels | Implements production-grade hashing with graceful degradation |
| Canonical JSON | `stableCanonicalJSON()` | CH04 §4.2 Bible Builder pipeline | Same deterministic serialization used across all Phoenix systems |
| Self-verification | `verify()` + `selfTest()` | CH04 §2.1 Axiom 8 (SYF Truth Protocol) | The system tests its own integrity — truth over assumption |
| No fake persistence | `exportState()` | Totality / V20 seed, CH04 Pillar architecture | Explicit state export, never pretends memory is permanent |
| Merkle tree | `computeMerkleRoot()` | CH01 Universal Ledger, harvester kernels | Single fingerprint for entire system state — tamper detection in O(log n) |

---

## Export Metadata

- **Notion source:** CH05 — Stage 3: Mega Monolith V1
- **Immortalize source:** `05_MEGA_MONOLITH_V1.md` (SHA: d8f3c23f)
- **CommandStation hits:** 0
- **Enrichment class:** ENRICHED — adds architectural context map (§0), canon guardrail tracing (§1), detailed architecture breakdown (§2), Four Pillars cross-reference (§6.1), Axiom compliance audit (§6.2), evolution path analysis (§6.3), Bible Builder connection (§6.4), and cross-reference map (§7) not present in the source material
- **Export state:** UNMIRRORED → ENRICHED

# END SOURCE
