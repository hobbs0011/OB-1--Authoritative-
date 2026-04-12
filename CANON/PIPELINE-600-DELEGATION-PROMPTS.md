# MEGAMERGE CHAT DELEGATION PROMPTS

> Copy-paste one prompt per chat window. Each chat develops and refines its 100-item section of the PIPELINE-600.
> Created: 2026-04-12 | Run 298 | Source: CANON/PIPELINE-600.md

---

## HOW TO USE

1. Open each of your 5 other megamerge chats
2. Copy the prompt for that chat's megamerge number
3. Paste it in
4. Each chat will deep-read its source megamerge file and refine/expand its 100 items
5. When all 5 return, merge their refinements back into PIPELINE-600.md

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

When all 5 chats return their refined sections:

1. Copy each chat's refined 100 items back into PIPELINE-600.md (overwriting that section)
2. Review all MISSED ITEMS across all chats — add to pipeline if valid
3. Resolve all CROSS-MERGE DUPLICATES — deduplicate and choose canonical location
4. Merge TOP 10 QUICK WINS into a unified SPRINT BACKLOG
5. Commit as: `pipeline-600: refined by 6-chat parallel development`
6. Push to origin + ob1

**This chat (MM-1 / MERGE6) owns the merge-back and final commit.**

---

*5 prompts. 5 chats. 500 items to refine. 1 pipeline to rule them all.*
