# MEGAMERGE CHAT DELEGATION PROMPTS

> Copy-paste one prompt per chat window. Each chat develops and refines its 100-item section of the PIPELINE-600.
> Created: 2026-04-12 | Run 298 | Source: CANON/PIPELINE-600.md
> Hardened: 2026-04-12 | Run 299 | Full-circle MERGE6 close; SPRINT-0 gate added; MM-1 orchestrator prompt added

---

## CANON SOURCE CONTEXT (shared across all chats)

| File | Lines | Role |
|------|-------|------|
| MEGAMERGE-1-GPT.txt | 26,210 | Genesis — why, who, what |
| MEGAMERGE-2-GPT.txt + 2B | ~15,000 | Implementation layer |
| MEGAMERGE-3-GPT.txt | ~8,000 | Stack decision — ground zero |
| MEGAMERGE-4-GPT.txt | 7,098 | Kernel compilation |
| MEGAMERGE-5-GPT.txt | 15,276 | Distribution & enforcement |
| MEGAMERGE-6-GPT.txt | 8,781 | Product crystallization (FINAL vision) |
| **TOTAL** | **~80,000** | |

**Notion Soul DNA Index (consolidation reference — requires login):**
`https://www.notion.so/the-phoenix-rising-protocol/Chat-Archive-Index-Soul-DNA-Verbatim-First-bc1c8df6c2314b0f9c628f2c5c082006`

**Production Stack (LOCKED — MM-6 stack pivot REJECTED):**
- Runtime: Cloudflare Workers + Durable Objects (SQLite)
- AI: DeepSeek V3.2 via Cloudflare AI Gateway
- Voice: Deepgram Aura 2 (TTS) + Nova-2 (STT)
- Storage: D1 (SQL) + KV (cache) + R2 (assets)

**CRITICAL REGRESSION — DO NOT IGNORE:**
- Commit `16c9598` destroyed student Magic Chat (`getMagicChatHTML`)
- Must revert to `0a5c92d` before any new student-facing feature work

---

## SPRINT-0 GATE (resolve before ANY sprint work)

These 3 items must close before any other pipeline work proceeds:
1. `MM1-001` — REVERT `16c9598` to restore student chat
2. `MM1-071` — Vietnam company incorporation (legal foundation)
3. `MM1-034` — `session_log` table (memory backbone for all other features)

---

## HOW TO USE

1. Open each of your 5 other megamerge chats
2. Copy the prompt for that chat's megamerge number
3. Paste it in
4. Each chat will deep-read its source megamerge file and refine/expand its 100 items
5. When all 5 return, merge their refinements back into PIPELINE-600.md
6. This chat (MM-1 orchestrator) runs the merge-back + final PIPELINE-600 commit

---

## ═══════════════════════════════════════════════════════
## PROMPT FOR MM-1 / ORCHESTRATOR CHAT (this chat — merge-back owner)
## ═══════════════════════════════════════════════════════

```
RISE — PIPELINE DEVELOPMENT ASSIGNMENT: MM-1 (ORCHESTRATOR)

You are assigned to MEGAMERGE-1 (Genesis Layer) AND the merge-back coordinator role. Your megamerge source file is:
- MEGAMERGE-1-GPT.txt (26,210 lines — the oldest, largest genesis file)
- CANON/MEGAMERGE-1-INDEX.md (archaeological navigation index — created Run 297 MERGE4)

CRITICAL CONTEXT: MM-1 is the SOURCE OF WHY. It precedes product decisions. Every other megamerge answers MM-1's core question: "Why does a 17-year-old Vietnamese student need OBI?" Your 100 items (MM1-001 through MM1-100) represent the foundation layer — if any item here is wrong, the entire 600-item pipeline is misaligned.

A master pipeline of 600 items has been created at CANON/PIPELINE-600.md. Your 100 items are MM1-001 through MM1-100 (the "MM-1: THE GENESIS" section).

YOUR TASK (Part 1 — MM-1 lane):
1. Load CANON/MEGAMERGE-1-INDEX.md first (909-line navigation guide — use it to navigate the 26,210-line source)
2. Review your assigned 100 items in PIPELINE-600.md
3. For each item:
   - Validate it actually exists in MEGAMERGE-1-GPT.txt (use index to find line ranges fast)
   - Refine the description to be more specific and actionable
   - Add the exact line ranges where this concept appears in the source file
   - Add any implementation notes from the source text
   - Correct the priority (P0/P1/P2/P3) based on actual importance
4. Find items I MISSED — concepts in MM-1 that aren't covered by any of the 100 items
5. Flag any items that DUPLICATE items in other megamerge sections
6. Rate each item: SHIP / SPEC / CONCEPT
7. SPECIAL: For SPRINT-0 items (MM1-001, MM1-071, MM1-034) — add full implementation spec

YOUR TASK (Part 2 — merge-back coordinator):
After your MM-1 lane work, when all 5 other chats return:
1. Copy each chat's refined 100 items back into PIPELINE-600.md (overwriting that section)
2. Resolve MISSED ITEMS and CROSS-MERGE DUPLICATES across all 6 chats
3. Merge all TOP 10 QUICK WINS into a unified SPRINT-BACKLOG section at the top of PIPELINE-600.md
4. Final commit: `pipeline-600: refined by 6-chat parallel development`
5. Push to origin + ob1

OUTPUT FORMAT:
Return your refined 100 items in the same markdown checkbox format used in PIPELINE-600.md, plus:
- A "MISSED ITEMS" section listing concepts I didn't capture
- A "CROSS-MERGE DUPLICATES" section listing overlap with other MM sections
- A "TOP 10 QUICK WINS" list
- A "SPRINT-0 GATE SPECS" section — full implementation spec for MM1-001, MM1-071, MM1-034

DO NOT modify items outside your MM1-001 through MM1-100 range until the other 5 chats return.
STAY IN YOUR LANE FIRST. Then merge-back.
```

---

## ═══════════════════════════════════════════════════════
## PROMPT FOR MEGAMERGE-2 CHAT
## ═══════════════════════════════════════════════════════

```
RISE — PIPELINE DEVELOPMENT ASSIGNMENT: MM-2

You are assigned to MEGAMERGE-2 (Implementation Layer). Your megamerge source files are:
- MEGAMERGE-2-GPT.txt
- MEGAMERGE-2B-GPT.txt

A master pipeline of 600 items has been created at CANON/PIPELINE-600.md. Your 100 items are MM2-101 through MM2-200 (the "MM-2: THE IMPLEMENTATION" section).

YOUR TASK:
1. Deep-read your megamerge source files (MM-2 and MM-2B) line by line
2. Review your assigned 100 items (MM2-101 through MM2-200) in PIPELINE-600.md
3. For each item:
   - Validate it actually exists in the megamerge source text
   - Refine the description to be more specific and actionable
   - Add the exact line ranges where this concept appears in the source file
   - Add any implementation notes from the source text
   - Correct the priority (P0/P1/P2/P3) based on actual importance
4. Find items I MISSED — concepts in MM-2/2B that aren't covered by any of the 100 items
5. Flag any items that DUPLICATE items in other megamerge sections (cross-reference awareness)
6. Rate each item: SHIP (actually shippable code exists), SPEC (spec exists but no code), CONCEPT (idea only)

OUTPUT FORMAT:
Return your refined 100 items in the same markdown checkbox format used in PIPELINE-600.md, plus:
- A "MISSED ITEMS" section listing concepts I didn't capture
- A "CROSS-MERGE DUPLICATES" section listing overlap with other MM sections
- A "TOP 10 QUICK WINS" list — items that could ship fastest with most impact

DO NOT modify items outside your MM2-101 through MM2-200 range.
DO NOT rewrite the entire pipeline — only return your section.
STAY IN YOUR LANE. Your megamerge is MM-2. Report findings, halt when done.
```

---

## ═══════════════════════════════════════════════════════
## PROMPT FOR MEGAMERGE-3 CHAT
## ═══════════════════════════════════════════════════════

```
RISE — PIPELINE DEVELOPMENT ASSIGNMENT: MM-3

You are assigned to MEGAMERGE-3 (Stack Decision Layer — THE ACTUAL GENESIS FILE). Your megamerge source file is:
- MEGAMERGE-3-GPT.txt

CRITICAL CONTEXT: MM-3 is the chronologically EARLIEST megamerge. It predates MM-1. The stack decisions made here (Cloudflare Workers + DO + D1 + DeepSeek + Deepgram) are the ones that actually shipped to production. This is ground zero.

A master pipeline of 600 items has been created at CANON/PIPELINE-600.md. Your 100 items are MM3-201 through MM3-300 (the "MM-3: THE STACK DECISION" section).

YOUR TASK:
1. Deep-read MEGAMERGE-3-GPT.txt line by line
2. Review your assigned 100 items (MM3-201 through MM3-300) in PIPELINE-600.md
3. For each item:
   - Validate it actually exists in the megamerge source text
   - Refine the description to be more specific and actionable
   - Add the exact line ranges where this concept appears in the source file
   - Add any implementation notes from the source text
   - Correct the priority (P0/P1/P2/P3) based on actual importance
4. Find items I MISSED — concepts in MM-3 that aren't covered by any of the 100 items
5. Flag any items that DUPLICATE items in other megamerge sections
6. Rate each item: SHIP (actually shippable code exists), SPEC (spec exists but no code), CONCEPT (idea only)
7. SPECIAL: Since MM-3 is the genesis file, identify any FOUNDATIONAL DECISIONS that constrain all other pipeline items

OUTPUT FORMAT:
Return your refined 100 items in the same markdown checkbox format used in PIPELINE-600.md, plus:
- A "MISSED ITEMS" section
- A "CROSS-MERGE DUPLICATES" section
- A "FOUNDATIONAL CONSTRAINTS" section — decisions in MM-3 that every other item must respect
- A "TOP 10 QUICK WINS" list

DO NOT modify items outside your MM3-201 through MM3-300 range.
STAY IN YOUR LANE. Your megamerge is MM-3. Report findings, halt when done.
```

---

## ═══════════════════════════════════════════════════════
## PROMPT FOR MEGAMERGE-4 CHAT
## ═══════════════════════════════════════════════════════

```
RISE — PIPELINE DEVELOPMENT ASSIGNMENT: MM-4

You are assigned to MEGAMERGE-4 (Kernel Compilation Layer). Your megamerge source file is:
- MEGAMERGE-4-GPT.txt (7,098 lines)

CRITICAL CONTEXT: MM-4 is the MAXIMUM ARCHITECTURE AMBITION merge. It attempted to compile ALL subsystems into a single kernel. This ambition was checked by GPT's reality statement: "Does the student speak English more tomorrow than today? That's your entire system KPI." The kernel compilation concept was shelved, but the individual components (buildContext, driftCheck, hashEvent, SoulDNA type, SDNAD Bible Entry 0001) remain actionable.

A master pipeline of 600 items has been created at CANON/PIPELINE-600.md. Your 100 items are MM4-301 through MM4-400 (the "MM-4: THE KERNEL COMPILATION" section).

YOUR TASK:
1. Deep-read MEGAMERGE-4-GPT.txt line by line (all 7,098 lines)
2. Review your assigned 100 items (MM4-301 through MM4-400) in PIPELINE-600.md
3. For each item:
   - Validate it actually exists in the megamerge source text
   - Refine the description to be more specific and actionable
   - Add the exact line ranges where this concept appears
   - Add any implementation notes, code snippets, or type definitions from the source
   - Correct the priority based on actual importance
   - Flag items that are OVER-ENGINEERED per MM-6's mandate to strip complexity
4. Find items I MISSED
5. Flag cross-merge duplicates
6. Rate each item: SHIP / SPEC / CONCEPT
7. SPECIAL: For each item, add an "OVER-ENGINEERING RISK" score (LOW/MED/HIGH) — does this item violate MM-6's "strip everything" mandate?

OUTPUT FORMAT:
Return your refined 100 items plus:
- A "MISSED ITEMS" section
- A "CROSS-MERGE DUPLICATES" section
- An "OVER-ENGINEERING RISK ASSESSMENT" — which items should be REMOVED from the pipeline
- A "REALITY CHECK" section — what actually matters from MM-4
- A "TOP 10 QUICK WINS" list

STAY IN YOUR LANE. MM4-301 through MM4-400 only.
```

---

## ═══════════════════════════════════════════════════════
## PROMPT FOR MEGAMERGE-5 CHAT
## ═══════════════════════════════════════════════════════

```
RISE — PIPELINE DEVELOPMENT ASSIGNMENT: MM-5

You are assigned to MEGAMERGE-5 (Distribution & Enforcement Layer). Your megamerge source file is:
- MEGAMERGE-5-GPT.txt (15,276 lines)

CRITICAL CONTEXT: MM-5 is the LARGEST megamerge and the MOST REPETITIVE. Approximately 60% of its content is iterative repetition. It represents maximum SCALE ambition — multi-platform distribution, behavioral enforcement, Vietnam go-to-market. Key unique artifacts: ControlEngine.ts, Virality Engine v3/v4.1, Auto Post Engine, Zalo Pressure API, Relation Graph v1/v2, HMAC Iron Seal, 7-Day Retention Engine, Humor→Hammer escalation.

WARNING: Some files already exist partially in production:
- tiger-score.js (partial)
- virality.js (partial)  
- zalo.js (partial)

A master pipeline of 600 items has been created at CANON/PIPELINE-600.md. Your 100 items are MM5-401 through MM5-500 (the "MM-5: THE DISTRIBUTION & ENFORCEMENT ENGINE" section).

YOUR TASK:
1. Deep-read MEGAMERGE-5-GPT.txt line by line (all 15,276 lines)
2. Review your assigned 100 items (MM5-401 through MM5-500) in PIPELINE-600.md
3. For each item:
   - Validate it exists in the source text (careful: much content is repeated)
   - Find the BEST version of repeated content (weights/formulas vary across iterations)
   - Add exact line ranges for the CANONICAL version (not duplicates)
   - Refine descriptions
   - Correct priorities
4. DEDUPLICATION PASS: Identify which of your 100 items are just repeats of each other within MM-5
5. Find items I MISSED
6. Flag cross-merge duplicates
7. Rate each item: SHIP / SPEC / CONCEPT
8. SPECIAL: For the Tiger Score formula, document ALL weight variations found across the file and recommend the FINAL canonical version
9. SPECIAL: Check tiger-score.js, virality.js, and zalo.js in APPS/NET-PET-AI/src/ and report what's already implemented vs what's still missing

OUTPUT FORMAT:
Return your refined 100 items plus:
- A "MISSED ITEMS" section
- A "INTERNAL DUPLICATES" section (same concept repeated within MM-5)
- A "CROSS-MERGE DUPLICATES" section
- A "TIGER SCORE CANONICAL FORMULA" — the final recommended weights
- A "PRODUCTION GAP ANALYSIS" — what exists in src/*.js vs what MM-5 specifies
- A "TOP 10 QUICK WINS" list

STAY IN YOUR LANE. MM5-401 through MM5-500 only.
```

---

## ═══════════════════════════════════════════════════════
## PROMPT FOR MEGAMERGE-6 CHAT
## ═══════════════════════════════════════════════════════

```
RISE — PIPELINE DEVELOPMENT ASSIGNMENT: MM-6

You are assigned to MEGAMERGE-6 (Product Crystallization Layer). Your megamerge source file is:
- MEGAMERGE-6-GPT.txt (8,781 lines)

CRITICAL CONTEXT: MM-6 is the FINAL megamerge and represents MAXIMUM COMPRESSION. Its core mandate: "remove agent hierarchies, soul DNA stacks, heavy ledger metaphysics — they DO NOT increase retention." Every version (V3→V4→V5) STRIPS complexity. The system definition crystallized to: "closed-loop phoneme error correction system" / "strict coach in a chat window."

KEY FACT: MM-6 proposed a stack pivot to Next.js + Supabase + OpenAI, but production STAYED on Cloudflare Workers + DeepSeek + Deepgram. Your items must be adapted to the PRODUCTION stack, not the MM-6 proposed stack.

WARNING: Some files already exist partially in production:
- phoneme-engine.js (partial)
- phonics-drills.js (partial)

A master pipeline of 600 items has been created at CANON/PIPELINE-600.md. Your 100 items are MM6-501 through MM6-600 (the "MM-6: THE PRODUCT CRYSTALLIZATION" section).

YOUR TASK:
1. Deep-read MEGAMERGE-6-GPT.txt line by line (all 8,781 lines)
2. Review your assigned 100 items (MM6-501 through MM6-600) in PIPELINE-600.md
3. For each item:
   - Validate it exists in the source text
   - TRANSLATE to production stack where needed (e.g., Supabase → D1, Next.js → Workers static HTML)
   - Add exact line ranges
   - Refine descriptions with implementation-specific details
   - Correct priorities — MM-6 items should generally be P0/P1 since this is the final product vision
4. STACK TRANSLATION PASS: For every item that references Next.js/Supabase/OpenAI, provide the Cloudflare Workers/D1/DeepSeek equivalent
5. Find items I MISSED
6. Flag cross-merge duplicates
7. Rate each item: SHIP / SPEC / CONCEPT
8. SPECIAL: Check phoneme-engine.js and phonics-drills.js in APPS/NET-PET-AI/src/ and report what's implemented vs what's specified in MM-6
9. SPECIAL: Extract the complete Vietnamese phoneme error map (42 Jolly Phonics sounds) from the source text

OUTPUT FORMAT:
Return your refined 100 items plus:
- A "MISSED ITEMS" section
- A "STACK TRANSLATION TABLE" — every MM-6 technology mapped to production equivalent
- A "CROSS-MERGE DUPLICATES" section
- A "PHONEME ERROR MAP" — complete 42-sound map extracted from source
- A "PRODUCTION GAP ANALYSIS" — what exists in src/*.js vs what MM-6 specifies
- A "V3/V4/V5 EVOLUTION SUMMARY" — what changed at each version and which is canonical
- A "TOP 10 QUICK WINS" list

STAY IN YOUR LANE. MM6-501 through MM6-600 only.
```

---

## MERGE-BACK PROTOCOL

When all 5 delegation chats return their refined sections:

**Step 1 — Ingest refined sections**
- Copy each chat's 100-item refined block into PIPELINE-600.md (overwrite only its range)
- Preserve the `[x]` / `[~]` / `[ ]` status of pre-marked shipped items

**Step 2 — Resolve MISSED ITEMS**
- Review each chat's "MISSED ITEMS" section
- Add valid items to the correct MM section (maintain 100-item cap per section; overflow goes to appendix)

**Step 3 — Resolve CROSS-MERGE DUPLICATES**
- For each duplicate: keep the higher-priority version, delete the lower, add `(see MMX-NNN)` note

**Step 4 — Build unified SPRINT BACKLOG**
- Merge all 6 "TOP 10 QUICK WINS" lists into a single `## SPRINT BACKLOG` section at the top of PIPELINE-600.md
- Sort by P0 → P1 → P2 → P3, then by estimated impact
- Lock SPRINT-0 items (MM1-001, MM1-071, MM1-034) at top regardless of sort

**Step 5 — Final commit + push**
- Commit as: `pipeline-600: refined by 6-chat parallel development`
- Push to `origin` (Phoenix-Rising-Ultimate) + `ob1` (OB-1)

**Step 6 — Notion sync (manual)**
- Update Notion Soul DNA Index at: `https://www.notion.so/the-phoenix-rising-protocol/Chat-Archive-Index-Soul-DNA-Verbatim-First-bc1c8df6c2314b0f9c628f2c5c082006`
- Add link to final PIPELINE-600.md commit

**This chat (MM-1 / orchestrator) owns the merge-back and final commit.**

---

*6 prompts. 6 chats. 600 items. SPRINT-0 gate. 1 pipeline to rule them all.*
