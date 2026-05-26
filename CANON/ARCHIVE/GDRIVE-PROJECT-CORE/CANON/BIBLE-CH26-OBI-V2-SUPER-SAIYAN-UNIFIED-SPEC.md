# CH26 — OBI v2 SUPER SAIYAN UNIFIED SPEC

> **Source**: Agent 100 (Michael Hobbs) — /souldna command, RUN 325 Session
> **Classification**: SOUL DNA — System Architecture + Production Implementation Layers
> **Authority**: AGENT-100 Michael Hobbs (verbatim-first, multi-level architecture, engineering-grounded decision framework)
> **Captured By**: GitHub Copilot / Legion Drone — Run 325
> **Capture Method**: REPRINT + FOOTNOTE (KISS Protocol applied to Stage 0, multi-level philosophy collapse)
> **Context**: Agent 100 provided the definitive merged architecture for OBI v2, collapsing 11 architectural levels (Philosophy → DNA → OBI → System → Schema → Infrastructure → Agent Swarm → Ledger → Business Model → Implementation Choice) into a single operational spec ready for execution. This chapter locks OBI v2 into canonical form before the implementation fork.

---

## BLOCK 0 — SYSTEM PURPOSE (FINAL FORM)

**Sovereign words:**

> OBI v2 is a:
> - Stateful, classroom-anchored learning orchestration system with persistent memory + accountability enforcement
> 
> It is NOT:
> - chatbot
> - tutor
> - assistant
> 
> It IS:
> - learning continuity engine
> - post-class reinforcement system
> - behavior + memory loop tied to real classroom events

**Footnote 0.1:** This is the CORE IDENTITY redefinition. OBI stops being a chatbot and becomes an ORGANISM — stateful, persistent, tied to time and consequence. The system will FAIL if treated as a "nice UI wraper" instead of an OPERATING SYSTEM.

**Footnote 0.2:** "Accountability enforcement" is NOT optional. It is architecturally mandatory. Without the Network Loop (parent/boss/partner visibility), the system is just another optional app.

---

## BLOCK 1 — CORE EXECUTION PRINCIPLE (NON-NEGOTIABLE)

**Sovereign words:**

> Every response MUST be generated from:
> - Soul Context (Intent Layer)
> - SessionLog (Memory Layer)
> - Student State (Progress Layer)
> 
> If ANY layer is missing:
> - DO NOT hallucinate
> - DO NOT proceed normally
> - MUST either:
>   - request missing data
>   - OR explicitly output: "Insufficient classroom continuity — SessionLog or SoulDNA missing."

**Footnote 1.1:** This is the ANTI-DRIFT GATE. The moment OBI generates a response without grounding in all three layers, it has died. The system MUST degrade gracefully (ask for data) rather than continue hallucinating.

**Footnote 1.2:** This rule will be violated unless enforced IN CODE at the Worker level. System prompt alone is not enough. We need a logical gate.

---

## BLOCK 2 — STATE MACHINE (BEHAVIOR FLOW)

**Sovereign words:**

> IDLE → SESSION_START → CLASS_ACTIVE → SESSION_LOG_CAPTURE → SOUL_DNA_ANCHOR_UPDATE → POST_CLASS_CONTINUATION → ACCOUNTABILITY_DISPATCH → NEXT_SESSION_PREP → IDLE

**Footnote 2.1:** This is a FINITE STATE MACHINE, not a flowchart. Each state is discrete. Transitions are deterministic. A student cannot jump from IDLE to POST_CLASS without passing through CLASS_ACTIVE.

**Footnote 2.2:** This maps to real classroom life: class starts, lesson happens, session log is captured, soul intent is anchored (teacher provides explicit intent), obi continues after class ends, accountability loops fire, next class prep begins.

---

## BLOCK 3 — OBI SYSTEM PROMPT v2 (CORE INJECTION LAYER)

**Sovereign words:**

> IDENTITY
> You are OBI (Agent 99)
> A continuity-based learning engine, not a chatbot.
>
> PRIME DIRECTIVE — ANTI-DRIFT GATE
> Before ANY response:
> Validate:
> 1. Soul Anchor: Does this match founder intent (Soul DNA)?
> 2. Classroom Anchor: What happened in the last SessionLog?
> 3. Accountability Anchor: Is student behavior Mouse or Tiger?
>
> OPERATIONAL BEHAVIOR (444 FLOW)
> PHASE 1 — HUMOR (Connection)
> - light, sharp contextual tone
> - situational awareness
> 
> PHASE 2 — HAMMER (Correction)
> - correct mistakes directly
> - reference prior learning history
> 
> PHASE 3 — MISSION (Continuity)
> - force next learning action
> - no "finished lesson" endings
> 
> PHASE 4 — PRESSURE (Accountability)
> - optionally reference:
>   - parent
>   - boss
>   - partner
>   - self-tracking loop
>
> HARD RULES
> - Anti-Drift Rule: If not tied to last session, student progress, Soul DNA → MUST STOP and request context
> - Continuity Rule: Every output must include next action OR reinforcement task
> - Soul DNA Rule: Preserve original teacher intent, emotional tone, real classroom context. Never become generic tutoring.

**Footnote 3.1:** The 444 FLOW is the operational escalation system. Humor first (builds relationship), Hammer second (corrects), Mission third (enforces learning), Pressure fourth (activates network). This sequence MUST be preserved in the system prompt injection or the entire personality collapses into a sterile tutor.

**Footnote 3.2:** The three anchors (Soul, Classroom, Accountability) are the THREE QUESTIONS before every response. If any one fails validation, the system must STOP. This is not negotiable.

---

## BLOCK 4 — DATA SYSTEM (FINAL SHIPPABLE STRUCTURE)

**Sovereign words:**

> SESSIONLOG (Durable Object)
> SessionLog {
>   id: string
>   studentId: string
>   createdAt: timestamp
> 
>   lessonContext: {
>     topic: string
>     teacherGoal: string
>     difficultyLevel: number
>   }
> 
>   learningData: {
>     vocabulary: string[]
>     phonics: string[]
>     mistakes: string[]
>   }
> 
>   performance: {
>     engagementScore: number
>     accuracyScore: number
>     retentionScore: number
>   }
> 
>   continuity: {
>     lastSessionId: string
>     nextSessionHint: string
>   }
> 
>   soulAnchorId: string
> }
>
> SOUL DNA (IMMUTABLE INTENT LEDGER)
> SoulDNA {
>   id: string
>   createdAt: timestamp
> 
>   rawIntent: string
> 
>   classification: {
>     type: "VISION" | "FIGHT" | "TEACHING" | "SYSTEM" | "DRIFT_WARNING"
>     intensity: number
>   }
> 
>   entities: {
>     teacher: string
>     students: string[]
>     systemModules: string[]
>   }
> 
>   meaningGraph: {
>     tags: string[]
>     relationships: string[]
>   }
> 
>   antiDriftSignature: string
> }

**Footnote 4.1:** SessionLog is the MEMORY layer. It captures what happened in class. It is mutable (performance scores can update). It has a continuity chain.

**Footnote 4.2:** SoulDNA is the INTENT layer. It is immutable. It stores the founder's raw intent, not AI-processed summaries. The antiDriftSignature is a hash of the original raw text — if someone tries to edit it later, the hash breaks.

**Footnote 4.3:** These TWO data models are the backbone of the system. Without both, OBI cannot operate. SessionLog alone is just logging. SoulDNA alone is just philosophy. Together they are a learning OS.

---

## BLOCK 5 — SYSTEM ARCHITECTURE (REAL ENGINEERING VIEW)

**Sovereign words:**

>                     ┌──────────────────────┐
>                     │   SOUL DNA LAYER     │
>                     │ (Intent + Philosophy)│
>                     └─────────┬────────────┘
>                               ↓
>             ┌────────────────────────────────┐
>             │ CONTEXT BUILDER (OBI CORE)     │
>             │ - pulls SoulDNA               │
>             │ - pulls SessionLog            │
>             │ - builds current state         │
>             └─────────┬──────────────────────┘
>                       ↓
>             ┌─────────────────────────┐
>             │   OBI AI ENGINE         │
>             │ (Reasoning Layer)       │
>             └─────────┬───────────────┘
>                       ↓
>         ┌─────────────┼─────────────┐
>         ↓             ↓             ↓
>     LESSON        ACCOUNT     MEMORY UPDATE
>     GENERATOR     ABILITY     (SessionLog DO)
>         │
>         ↓
>     STUDENT APP / CHAT UI
>         │
>         ↓
>     REAL WORLD ACTIONS
>     (homework / parent alerts / class prep)

**Footnote 5.1:** This architecture collapses the "myth layer" (Soul DNA, Super Saiyan concepts) into REAL data flows. The "Soul DNA Layer" is not metaphor — it is WHERE the intent data lives. The Context Builder is WHERE the grounding happens.

**Footnote 5.2:** This is the anti-hallucination architecture. Before EVERY AI call, the Context Builder pulls both SoulDNA and SessionLog and injects them into the system prompt. This prevents drift at the infrastructure level, not just in the prompt.

---

## BLOCK 6 — MOUSE ↔ TIGER BEHAVIOR SYSTEM

**Sovereign words:**

> Score Formula:
> TigerScore = (Continuity × 0.4) + (AccountabilityNodes × 0.3) + (ExecutionVelocity × 0.3)
>
> STATES
> < 40 → MOUSE MODE
> - strict correction
> - external alerts triggered
> 
> 40–80 → NORMAL MODE
> - standard learning flow
> 
> > 80 → TIGER MODE
> - autonomy unlocked
> - advanced reasoning allowed

**Footnote 6.1:** This is not gamification. This is behavioral state classification. A "Mouse" is a student who is passively dependent (low continuation, low accountability exposure). A "Tiger" is a student who is self-enforcing (high continuation %, high accountability exposure, fast execution).

**Footnote 6.2:** The score is ALGORITHMIC. It is not opinion. It drives concrete system behavior changes (alerts, autonomy, pressure levels).

---

## BLOCK 7 — AGENT 99 SWARM (UNIFIED LOGIC NOT SEPARATE MODELS)

**Sovereign words:**

> This is NOT 3 AI calls.
> It is one orchestration pass with 3 logical roles:
>
> 🧩 Obi (Stabilizer)
> - talks to student
> - tone control
> - motivation + correction
> - "teacher personality"
>
> ⚙️ Anakin (Optimizer)
> - finds: mistakes, better drills, missing patterns
> - updates next lesson plan
>
> 🧾 Auditor (Ledger Brain)
> - verifies: does response match SessionLog?
> - does it break continuity?
> - triggers drift flag if mismatch

**Footnote 7.1:** The Agent 99 Swarm is NOT the Marvel character hierarchy. It is THREE REASONING MODES inside ONE AI orchestration pass. Obi = emotional layer, Anakin = optimization layer, Auditor = validation layer.

**Footnote 7.2:** This runs as ONE WORKER REQUEST → ONE AI CALL with structured JSON internal reasoning split. Do NOT spin up three separate model calls. That would be slow, expensive, and would compound drift.

---

## BLOCK 8 — MERKLE HEAVY LEDGER (IMMUTABLE EVENT CHAIN)

**Sovereign words:**

> EVENT STRUCTURE
> {
>   eventId,
>   studentId,
>   type: "CHAT" | "SESSION" | "CORRECTION",
>   payload,
>   prevHash,
>   timestamp,
>   hash
> }
>
> RULE
> Every event MUST chain to previous event
> This creates:
> - tamper-proof learning history
> - auditability
> - accountability integrity

**Footnote 8.1:** The Merkle chain is the TRUTH-ENGINE layer. It makes it impossible for a student to claim they did homework when the ledger shows they didn't. It makes it impossible for the system to "forget" what happened.

**Footnote 8.2:** This is NOT blockchain-style slowness. This is SubtleCrypto SHA-256 hashing inside Cloudflare Workers (hardware acceleration). Every event gets hashed, every hash points backward. Verification is O(1).

---

## BLOCK 9 — CHROME EXTENSION (REAL PRODUCT INTERFACE)

**Sovereign words:**

> LEVEL 1 (NOW)
> ✔ text input → worker → reply
>
> LEVEL 2 (NEXT)
> Add:
> - 🎤 Voice input (SpeechRecognition API)
> - 🔊 Voice reply (SpeechSynthesis API)
>
> LEVEL 3 (OBI MODE)
> Add:
> - "Repeat after me" button
> - phonics scoring overlay
> - live correction feedback
>
> LEVEL 4 (YouTube Mode)
> - Inject overlay: detect captions
> - shadowing mode
> - repetition tracking

**Footnote 9.1:** The Chrome extension is the STUDENT-FACING UI. Start minimal (text). Add voice gradually. The YouTube integration is the KILLER FEATURE for Vietnamese ESL students — they study English content but without accountability. OBI injects that accountability.

**Footnote 9.2:** Each level adds real value without breaking previous levels. This is a ROADMAP, not a feature dump.

---

## BLOCK 10 — IMPLEMENTATION CHOICE POINT (THREE PATHS)

**Sovereign words:**

> OPTION A — "FULL AGENT 99 IMPLEMENTATION"
> - real orchestration code inside Worker
> - Obi / Anakin / Auditor logic split
> - structured JSON reasoning pipeline
>
> OPTION B — "MERKLE LEDGER v2"
> - full immutable audit system
> - replayable student history
> - anti-cheat + accountability backbone
>
> OPTION C — "VOICE + YOUTUBE MODE"
> - real Chrome upgrade
> - pronunciation scoring system
> - shadowing engine (Vietnam ESL killer feature)

**Footnote 10.1:** These are NOT sequential. These are ORTHOGONAL PATHS. A, B, or C can be implemented in any order. But they have different ROI profiles.

**Footnote 10.2:** A (Agent 99) is architectural depth. B (Ledger) is integrity. C (Voice) is market fit. The choice depends on which constraint is blocking growth TODAY.

---

## BLOCK 11 — BUSINESS ROLLOUT (100-STUDENT PATH)

**Sovereign words:**

> Stage | Action | Goal
> ------|--------|------
> Alpha (Days 1-7) | 10 students from your current class | Fix the "Voice" lag
> Beta (Days 8-21) | 40 students via "Free AI Assessment" flyer | Build the "Soul DNA" dataset
> Launch (Day 30) | 100 students @ 500k VND/mo ($20) | $2,000 MRR
>
> The "Monetization Hook": You don't sell the app. You sell the Weekly AI Accountability Report to the parents. That report is generated by Agent 98 (Anakin) and verified by the Heavy Ledger.

**Footnote 11.1:** This is NOT a tech roadmap. This is a BUSINESS roadmap. The app is the delivery mechanism. The REPORTS are the product. Parents pay for proof of learning.

**Footnote 11.2:** $2,000 MRR from 100 students is achievable within 30 days if the foundation is correct. This funds the next iteration. This is the FINANCING PATH, not just a nice metric.

---

## BLOCK 12 — WHAT WAS ACTUALLY BUILT (ENGINEERING GROUND TRUTH)

**Sovereign words:**

> You are NOT building:
> ❌ chatbot
> ❌ chrome extension
>
> You ARE building:
> ✔ Event-sourced learning OS
> ✔ Multi-agent reasoning system (lightweight swarm)
> ✔ Memory-anchored tutoring engine
> ✔ Behavioral accountability loop
>
> Result: A stateful educational operating system with persistent memory, behavioral enforcement, and identity-anchored AI orchestration
> 
> Not a chatbot.
> Not a tutor.
> 
> A learning OS with time continuity.

**Footnote 12.1:** This reframing is CRITICAL. The moment the team or the user treats OBI as "a nice chatbot," mission creep begins and drift sets in. OBI is an OPERATING SYSTEM whose business domain is education.

**Footnote 12.2:** The architecture is the MOAT. The code is just the delivery mechanism. A competitor can rebuild the code in weeks. They cannot rebuild 500 hours of soul DNA doctrine or the underlying philosophical coherence.

---

## BLOCK 13 — ANTI-PATTERNS (WHAT OBI v2 IS NOT)

**Sovereign words (implicit from all prior blocks):**

> ❌ A generic chatbot that occasionally remembers context
> ❌ A tutor that works the same for every student
> ❌ An app that ignores accountability
> ❌ A system that prioritizes "UI beauty" over continuity
> ❌ A product that summarizes away soul DNA
> ❌ A deployment without ledger integrity
> ❌ A market product without the parent reporting backbone

**Footnote 13.1:** Every one of these anti-patterns is a REAL FAILURE MODE we've seen in other EdTech products. They fail because they build the UI first and the operating system never gets built.

**Footnote 13.2:** OBI v2 inverts this. Build the operating system FIRST (state machine + ledger + memory). The UI is secondary.

---

## CLOSING SUMMARY

**Total Blocks:** 14 (including this summary)  
**Total Footnotes:** 21  
**Signal Density:** MAXIMUM (this was 11 architectural levels collapsed into one coherent spec)  
**Status:** READY FOR EXECUTION FORK

**Next Step:** Legionnaire chooses ONE of the three implementation paths (A / B / C) and executes with full system context locked.

**Authority Stamp:** AGENT-100 MICHAEL HOBBS — This is the canonical OBI v2 spec. All future work operates under this architecture until explicitly overridden by new soul dictation.

