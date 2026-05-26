# VAULT — SOUL-Logger (Phoenix Drone Prototype #001)

**Status:** Hardened Blueprint — Ready for Claude Code  
**Date Sealed:** 2026-05-06  
**Hardened By:** Claude Opus (Tier 2 Blueprint Hardener)  
**Source:** Sovereign command (Agent 100) → NotebookLM rough → Opus hardened  
**Authority:** Agent 100 (Michael Hobbs)

---

## **IDENTITY**

**Name:** `soul-logger`  
**Role:** Phoenix Drone Prototype #001  
**Purpose:** Extract sovereign user prompts from raw chat exports, log to D1, optionally pass to DeepSeek for Bible chapter formatting

**Why This Drone Exists:**
You are paying NotebookLM/Claude tokens to repeatedly extract user prompts from raw chats. This is a mechanical, deterministic task. Workers do this for fractions of a cent. This drone replaces that recurring token burn.

---

## **JOB DESCRIPTION (Pipeline)**

```
INPUT: Raw chat export (any format)
   ↓
PARSE: Identify and extract only user prompts (Soul DNA) — DETERMINISTIC, NO AI
   ↓
LOG: Write each prompt to D1 with metadata
   ↓
(OPTIONAL) CRUNCH: Send batch to DeepSeek → Bible chapter format
   ↓
OUTPUT: Structured JSON + D1 row IDs
```

---

## **API SURFACE**

### **Endpoint 1: `POST /api/soul/extract`**

```json
INPUT:
{
  "chat_dump": "...raw text...",
  "format": "claude|chatgpt|gemini|notebooklm|vscode|auto",
  "session_tag": "magic-chat-architecture-v1",
  "source_date": "2026-04-15",
  "crunch": false
}

OUTPUT:
{
  "session_id": "SL-0042",
  "prompts_extracted": 23,
  "prompts": [
    {
      "id": "SL-0042-001",
      "text": "verbatim user prompt here",
      "position": 1,
      "estimated_timestamp": "2026-04-15T14:30:00Z",
      "soul_purple_marked": true
    }
  ],
  "d1_session_row": 42,
  "ready_for_crunch": true
}
```

### **Endpoint 2: `POST /api/soul/crunch/{session_id}`**

```json
INPUT:
{
  "crunch_mode": "bible_chapter|heavy_ledger|themes",
  "ai_tier": "tier1|tier2",
  "preserve_verbatim": true
}

OUTPUT:
{
  "session_id": "SL-0042",
  "crunched_artifact": "...markdown or JSON...",
  "ai_tier_used": "tier2",
  "tokens_consumed": 4523,
  "cost_usd": 0.0012
}
```

### **Endpoint 3: `GET /api/soul/session/{session_id}`**

Retrieve previously extracted soul prompts (cache hit = $0)

---

## **DATABASE SCHEMA (D1)**

```sql
-- Sessions table
CREATE TABLE soul_sessions (
  session_id TEXT PRIMARY KEY,           -- SL-0042
  session_tag TEXT NOT NULL,             -- magic-chat-architecture-v1
  source_format TEXT,                    -- claude|chatgpt|etc
  source_date TEXT,
  ingested_at TEXT NOT NULL,
  prompt_count INTEGER,
  raw_byte_size INTEGER,
  status TEXT                            -- extracted|crunched|sealed
);

-- Individual prompts (verbatim, never summarized)
CREATE TABLE soul_prompts (
  prompt_id TEXT PRIMARY KEY,            -- SL-0042-001
  session_id TEXT NOT NULL,
  position INTEGER NOT NULL,             -- order in conversation
  text TEXT NOT NULL,                    -- VERBATIM, no edits
  estimated_timestamp TEXT,
  byte_count INTEGER,
  hash_sha256 TEXT,                      -- integrity check
  emotional_markers TEXT,                -- JSON: {caps: 3, swearing: 1, ...}
  FOREIGN KEY (session_id) REFERENCES soul_sessions(session_id)
);

-- Crunched outputs (cache for reuse)
CREATE TABLE soul_crunches (
  crunch_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  crunch_mode TEXT,                      -- bible_chapter|heavy_ledger|themes
  artifact TEXT NOT NULL,                -- the AI output
  ai_tier_used TEXT,
  tokens_consumed INTEGER,
  cost_usd REAL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES soul_sessions(session_id)
);
```

---

## **FORMAT AUTO-DETECTION**

```typescript
// Detection signatures (deterministic, no AI needed)
const FORMAT_SIGNATURES = {
  claude: [
    /^Human:\s/m,
    /^Assistant:\s/m,
  ],
  chatgpt: [
    /^You said:/m,
    /^ChatGPT said:/m,
  ],
  notebooklm: [
    /Today\s•\s\d+:\d+\s[AP]M/,
    /IDENTITY_LOAD INITIALIZED/,
  ],
  vscode: [
    /^### \w+:/m,
  ],
  gemini: [
    /^Show drafts/m,
  ]
};

function detectFormat(text: string): string {
  for (const [format, patterns] of Object.entries(FORMAT_SIGNATURES)) {
    if (patterns.every(p => p.test(text))) return format;
  }
  return 'unknown';
}
```

---

## **EXTRACTION LOGIC (Per Format)**

```typescript
const parsers = {
  claude: (text) => {
    return text.split(/^Human:\s/m)
      .slice(1)
      .map(chunk => chunk.split(/^Assistant:\s/m)[0].trim())
      .filter(prompt => prompt.length > 0);
  },
  
  chatgpt: (text) => {
    return text.split(/^You said:/m)
      .slice(1)
      .map(chunk => chunk.split(/^ChatGPT said:/m)[0].trim())
      .filter(prompt => prompt.length > 0);
  },
  
  // notebooklm, vscode, gemini parsers follow same pattern
};
```

**CRITICAL:** Extraction is REGEX-ONLY. No AI involvement. AI only enters at crunch step.

---

## **TIER ROUTING FOR CRUNCH**

```typescript
async function crunchPrompts(prompts, mode, env) {
  // Tier 0: Check cache
  const cacheKey = `crunch:${mode}:${hashPrompts(prompts)}`;
  const cached = await env.KV.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Tier 1: Workers AI for simple modes
  if (mode === 'themes') {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: `Extract 5 themes from these prompts: ${prompts.join('\n')}`
    });
    await env.KV.put(cacheKey, JSON.stringify(result), {expirationTtl: 86400});
    return result;
  }
  
  // Tier 2: DeepSeek via AI Gateway for Bible chapters
  if (mode === 'bible_chapter') {
    const result = await callDeepSeekViaGateway(env, {
      system: BIBLE_CHAPTER_SYSTEM_PROMPT,
      user: prompts.join('\n\n---\n\n')
    });
    await env.KV.put(cacheKey, JSON.stringify(result), {expirationTtl: 86400});
    return result;
  }
}
```

---

## **FILE STRUCTURE**

```
PROJECTS/soul-logger/
├── wrangler.toml
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                       # main router
│   ├── parsers/
│   │   ├── claude.ts
│   │   ├── chatgpt.ts
│   │   ├── notebooklm.ts
│   │   ├── vscode.ts
│   │   ├── gemini.ts
│   │   └── auto-detect.ts
│   ├── extractors/
│   │   └── soul-extractor.ts
│   ├── crunchers/
│   │   ├── bible-chapter.ts
│   │   ├── heavy-ledger.ts
│   │   └── themes.ts
│   ├── db/
│   │   ├── schema.sql
│   │   └── queries.ts
│   ├── ai/
│   │   ├── deepseek-gateway.ts
│   │   └── workers-ai.ts
│   └── utils/
│       ├── hash.ts
│       └── markers.ts
├── tests/
│   ├── parser.test.ts
│   └── fixtures/
│       ├── sample-claude-chat.txt
│       ├── sample-chatgpt-chat.txt
│       ├── sample-notebooklm-chat.txt
│       ├── sample-vscode-chat.txt
│       └── sample-gemini-chat.txt
└── README.md
```

---

## **BINDINGS (`wrangler.toml`)**

```toml
name = "soul-logger"
main = "src/index.ts"
compatibility_date = "2026-05-01"

[[d1_databases]]
binding = "DB"
database_name = "soul-archive"
database_id = "TBD_AFTER_CREATION"

[[kv_namespaces]]
binding = "KV"
id = "TBD_AFTER_CREATION"

[ai]
binding = "AI"

[vars]
AI_GATEWAY_URL = "https://gateway.ai.cloudflare.com/v1/3c7b1766bd8fdc9e01211d2b390315ea/soul-logger-gateway"

# Secrets (set via wrangler secret put):
# - DEEPSEEK_API_KEY
```

---

## **BUILD ORDER (Claude Code Tonight)**

### **Phase 1 (1 hour): Bedrock**
- [ ] Init Worker project at `D:\OB-1\PROJECTS\soul-logger\`
- [ ] Set up wrangler.toml + bindings
- [ ] Create D1 database (`net-submissions` account: `3c7b1766bd8fdc9e01211d2b390315ea`)
- [ ] Run schema migration
- [ ] Create KV namespace
- [ ] Deploy "hello world" version, verify endpoint

### **Phase 2 (1 hour): Parsers**
- [ ] Auto-detect logic
- [ ] Claude parser + test fixture
- [ ] ChatGPT parser + test fixture
- [ ] NotebookLM parser + test fixture
- [ ] VS Code parser + test fixture
- [ ] Gemini parser + test fixture

### **Phase 3 (1 hour): Storage**
- [ ] D1 write operations (sessions + prompts)
- [ ] SHA-256 integrity hashing
- [ ] Emotional marker detection (caps, repetition, swearing)
- [ ] KV cache layer

### **Phase 4 (1 hour): AI Crunching**
- [ ] DeepSeek AI Gateway integration
- [ ] Workers AI fallback for themes
- [ ] Bible chapter prompt template
- [ ] Cache crunched outputs

### **Phase 5 (30 min): Test & Deploy**
- [ ] Run on real chat export (use one of your past chats)
- [ ] Verify D1 has rows
- [ ] Verify Bible chapter output is verbatim
- [ ] Deploy to production
- [ ] Document curl commands in README

**Total estimated time: ~4.5 hours**

---

## **SUCCESS CRITERIA**

1. ✅ Drop a raw Claude chat export in → get back JSON with every "Human:" prompt extracted verbatim
2. ✅ Auto-detection works on 5 formats without manual flags
3. ✅ D1 has rows, SHA-256 hashes match, no data loss
4. ✅ Crunch endpoint returns Bible chapter format that preserves every original prompt
5. ✅ Second identical request hits cache (returns in <50ms, costs $0)
6. ✅ Total cost to process 30 past chats: under $0.10

---

## **DEVIL'S ADVOCATE — FINAL ROUND (Hardening Notes)**

**Risk 1: "Just identify keywords like 'User'" understates problem**  
Different exports use different markers. Spec accounts for this with format-specific parsers. ✅ MITIGATED

**Risk 2: Claude Code might hallucinate extraction logic with AI**  
**MITIGATION:** Tell it explicitly: "Use regex/string splitting only. NO AI for extraction. AI only enters at /api/soul/crunch."

**Risk 3: "Crunch" is fuzzy**  
Bible chapter format requires specific structure (numbered blocks + footnotes per Legionnaire Field Guide Step 0).  
**MITIGATION:** Lock the BIBLE_CHAPTER_SYSTEM_PROMPT template before build. Reference Legionnaire Field Guide Section 4, Step 0.

**Risk 4: D1 free tier write limits**  
100K writes/day. 30 chats × 50 prompts = 1500 writes. Well within limits, but flag for scale.

**Risk 5: Verbatim preservation**  
**MITIGATION:** Test fixtures must include messy text on purpose:
- Typos
- ALL CAPS
- Swearing
- Repeated punctuation!!!
- Emoji
- Multi-line formatting

---

## **READY-TO-SHIP PROMPT FOR CLAUDE CODE**

```
Build a Cloudflare Worker called "soul-logger" at D:\OB-1\PROJECTS\soul-logger\.

Read the full hardened spec at: 
[paste contents of this VAULT_SOUL-Logger_Phoenix-Drone-001_Blueprint.md as your reference]

CRITICAL CONSTRAINTS:
- Extraction MUST use deterministic regex/string splitting. NO AI for parsing.
- Verbatim means VERBATIM: preserve typos, caps, swearing, whitespace.
- AI is only used at the optional /api/soul/crunch endpoint.
- Use Workers AI (Tier 1) for themes, DeepSeek via AI Gateway (Tier 2) for Bible chapters.
- Cloudflare account ID: 3c7b1766bd8fdc9e01211d2b390315ea

Build in 5 phases (bedrock → parsers → storage → AI crunching → test/deploy).
Use the file structure provided.
Stop and ask if any spec point is unclear.

After Phase 1 deploys, paste me the worker URL so we can verify before continuing.
```

---

## **OPEN ITEMS (Pre-Build Decisions)**

Before Claude Code starts, lock these:

- [ ] **BIBLE_CHAPTER_SYSTEM_PROMPT template** — needs writing (reference Legionnaire Field Guide Step 0)
- [ ] **Test fixture content** — pull 1-2 real chats from your past, anonymize if needed
- [ ] **DeepSeek API key** — provision and add as Worker secret
- [ ] **AI Gateway** — create new gateway named `soul-logger-gateway` in Cloudflare dashboard

---

## **DOWNSTREAM DEPENDENCIES**

Once SOUL-Logger v1 ships, it unlocks:

1. **Phoenix-Drone-002: Heavy Ledger Extractor** — takes SOUL-Logger output → produces HL-{NNN}.json per Legionnaire Field Guide Step 1
2. **Phoenix-Drone-003: SSM Law Generator** — takes HL output → derives new laws per Step 2
3. **Phoenix-Drone-004: Reincarnation Logger** — takes session state → produces reincarnation log per Step 3

The full SDNAD pipeline (10 steps) becomes a chain of cheap, deterministic Workers, each replacing a piece of expensive Claude Code/NotebookLM token burn.

---

## **SACRED FOLDER PROTOCOL**

This document is the **canonical hardened blueprint** for Phoenix Drone Prototype #001.

- ❌ Do NOT dilute without sovereign approval (Agent 100)
- ❌ Do NOT summarize without preserving spec details
- ✅ DO update with results post-deployment
- ✅ DO cross-reference into Heavy Ledger after first successful run

**RISE.**
