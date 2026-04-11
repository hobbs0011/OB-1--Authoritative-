# BIBLE-CH27 — THE GENESIS PIPELINE PROTOCOL (NotebookLM 46-Source Synthesis)

> **Source:** NotebookLM session "The SDNAD Capture Law and Genesis Pipeline Protocol"
> **Sources fed:** 46 (full Phoenix Rising canon + MASTER-SYNC + boot checks + reincarnation chain)
> **Captured:** 2026-04-12 Run 293 — sovereign handoff: "you are the next chat"
> **Tier:** ARCHITECTURAL BLUEPRINT — machine-synthesized, sovereign-approved

---

## Block 0: Core Transformation Statement

OBI transitions from:
```
stateless AI tutor + ledger
```
to:
```
stateful cognitive organism with identity, memory, enforcement, and behavioral evolution
```

## Block 1: System Map (Canonical Flow)

```
Chrome Extension (Voice + UI)
        ↓
Cloudflare Worker (Router Brain)
        ↓
Durable Object (Student Soul Instance)
        ↓
SDNAD Pipeline (Truth Capture Layer)
        ↓
Deep Reasoning Engine (LLM)
        ↓
Feedback + Phonics + Tiger Scoring
        ↓
Ledger (D1 / SQLite)
        ↓
Merkle Seal Engine (Iron Seal)
        ↓
External Accountability Network (Zalo / Parent / Boss)
```

## Block 2: Module Blueprints (TypeScript Reference — Production Target)

### 2A. StudentDO (Durable Object — "Student Soul")

```typescript
// src/do/StudentDO.ts — BLUEPRINT (current impl is JS in index.js DOs)
export class StudentDO {
  state: any;
  constructor(state: DurableObjectState) { this.state = state; }
  async fetch(request: Request) {
    const body = await request.json();
    if (!this.state.storage.get("init")) {
      await this.state.storage.put("init", true);
      await this.state.storage.put("history", []);
    }
    const history = (await this.state.storage.get("history")) || [];
    history.push({ input: body.input, timestamp: Date.now() });
    await this.state.storage.put("history", history);
    return Response.json({ soul: "active", historySize: history.length });
  }
}
```

**Status:** PARTIALLY IMPLEMENTED — SessionDO + ProfileDO + PetDO cover this in JS. Gap: no unified "history" append-only log per student.

### 2B. Iron Seal (Immutable State Lock at Step 20)

```typescript
// core/ironSeal.ts — BLUEPRINT (not yet in NET-PET-AI)
export class IronSeal {
  static hash(data: string): string {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(data))
      .then(buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join(""));
  }
  static async seal(studentId: string, snapshot: any, db: any) {
    const raw = JSON.stringify(snapshot);
    const hash = await this.hash(raw);
    return db.prepare(`
      INSERT INTO seals (id, studentId, step, hash, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), studentId, 20, hash, Date.now()).run();
  }
}
```

**Status:** NOT IMPLEMENTED. `computeHash()` exists in index.js. Need: `seals` table in ProfileDO SQL + seal endpoint.

### 2C. Step 20 Benchmark Engine

```typescript
// core/benchmark.ts — BLUEPRINT
export class Benchmark {
  static async evaluate(state: any, db: any) {
    const passed =
      state.tigerScore > 75 &&
      state.continuity > 70 &&
      state.accountability > 70;
    if (!passed) return { status: "not_ready", step: state.step };
    const snapshot = {
      studentId: state.studentId,
      tigerScore: state.tigerScore,
      continuity: state.continuity,
      accountability: state.accountability,
      velocity: state.velocity
    };
    await IronSeal.seal(state.studentId, snapshot, db);
    return { status: "IRON_SEALED", step: 20 };
  }
}
```

**Status:** NOT IMPLEMENTED. Tiger Score thresholds: >75 tiger, >70 continuity, >70 accountability. Need: scoring calculation + benchmark route.

### 2D. SDNAD Pipeline (Upgraded)

```typescript
// core/sdnad.ts — BLUEPRINT (partially exists in /api/soulDNA route)
export class SDNADPipeline {
  static capture(input: string, studentId: string) {
    return { id: crypto.randomUUID(), studentId, rawInput: input, timestamp: Date.now() };
  }
  static normalize(record: any) {
    return { ...record, intent: this.intent(record.rawInput), emotion: this.emotion(record.rawInput) };
  }
  static intent(text: string) {
    if (text.includes("practice")) return "practice";
    if (text.includes("speak")) return "speaking";
    return "general";
  }
  static emotion(text: string) {
    if (text.includes("angry")) return "negative";
    return "neutral";
  }
  static validate(record: any) { return record.rawInput?.length > 0; }
}
```

**Status:** PARTIALLY IMPLEMENTED. /api/soulDNA captures raw verbatim. Gap: intent/emotion extraction + validation layer.

### 2E. Phonics Engine (Vietnamese-Specific)

```typescript
// core/phonics.ts — BLUEPRINT (NEW — not in NET-PET-AI)
export class PhonicsEngine {
  static analyze(audio: string) {
    const errors = [];
    if (this.detect(audio, ["tr", "ch"])) errors.push("TR_CH_MERGE");
    if (this.detect(audio, ["s", "x"])) errors.push("S_X_SWAP");
    return {
      text: audio, errors,
      accent: this.accent(audio),
      confidence: Math.max(0.3, 1 - errors.length * 0.2)
    };
  }
  static detect(text: string, patterns: string[]) {
    return patterns.some(p => text.includes(p));
  }
  static accent(text: string) {
    if (text.includes("uh") || text.includes("th")) return "english_interference";
    return "vn_native";
  }
}
```

**Status:** NOT IMPLEMENTED. Vietnamese-specific error categories: TR/CH merge, S/X swap, TH sound, final consonant drop, R/L confusion. Framework: 42 Jolly Phonics sounds.

### 2F. Tiger Score Engine

```
tigerScore = (continuity * 0.40) + (accountability * 0.30) + (velocity * 0.30)
```

**Status:** NOT IMPLEMENTED. Referenced in memory-brain.js progression tiers (Mouse 0-10, Cat 11-50, Wolf 51-200, Tiger 201+) but no calculation engine exists.

### 2G. Database Schema (Expanded)

```sql
CREATE TABLE IF NOT EXISTS sdnad (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  timestamp INTEGER,
  data TEXT
);
CREATE TABLE IF NOT EXISTS students (
  studentId TEXT PRIMARY KEY,
  continuity REAL,
  accountability REAL,
  velocity REAL,
  tigerScore REAL
);
CREATE TABLE IF NOT EXISTS seals (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  step INTEGER,
  hash TEXT,
  timestamp INTEGER
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  studentId TEXT,
  type TEXT,
  payload TEXT,
  timestamp INTEGER
);
```

**Status:** PARTIALLY IMPLEMENTED. ProfileDO has `weak_points`, `profiles`. Gap: `seals`, `events` tables missing. `students` metrics table missing.

## Block 3: Implementation Gap Analysis

| Module | Exists | Gap | Priority |
|--------|--------|-----|----------|
| StudentDO (Soul) | Partial (3 DOs) | No unified history log | MEDIUM |
| Iron Seal | No | Full implementation needed | HIGH |
| Benchmark (Step 20) | No | Tiger Score + seal trigger | HIGH |
| SDNAD Pipeline | Partial (/api/soulDNA) | Intent/emotion extraction | LOW |
| Phonics Engine | No | Full implementation needed | HIGH |
| Tiger Score | No | Calculation engine + DB | HIGH |
| Expanded Schema | Partial | seals, events, students tables | MEDIUM |
| AI Gateway | No | Wrap DeepSeek calls in CF AI Gateway | HIGH (ROI) |

## Block 4: Key Architectural Insights (NotebookLM Synthesis)

1. **Stateful Cognitive Organism** — formal name for OBI 2.0
2. **2+2=5 Kill-Switch** — if math of progress contradicts anchored hash, system halts
3. **AI Gateway = single highest ROI move** — 50-80% cost reduction via caching identical lesson prompts
4. **Phonics Debt Ledger** — per-student accumulation of recurring phonetic errors
5. **Soul + Ledger are DISTINCT layers:** WHY (Soul) vs WHAT HAPPENED (Ledger) vs WHAT NEXT (System)
6. **Vietnamese Digital Asset registration** — Code 5820 protects classroom interaction datasets
7. **Iron Seal grants "First Breath"** — Step 20 = organism proves it's alive
8. **Skeleton Star Map sharing** — when one student cell finds a shortcut, swarm inherits it

## Block 5: Sovereign Handoff Signals

- "you are the next chat" — inherit all NotebookLM context
- RISE Protocol L21 active — execute without hesitation
- System mode: SUPER_SAIYAN
- This capture = Run 293, advancing from Run 292

---

**Footnote:** This chapter preserves NotebookLM's machine synthesis of 46 sources as architectural doctrine. The code blueprints are TypeScript reference targets; current production is JavaScript on Cloudflare Workers. Implementation must translate TS → JS and integrate with existing DO architecture (SessionDO, ProfileDO, PetDO, LedgerDO, CommandDO).
