# RAW VERBATIM — HarvestScript.txt
## Corpus Metadata
- chunk_seq   : 0338
- chunk_id    : 0338-RAW-HarvestScript_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\HarvestScript.txt
- sha256      : E0FEB45600EA693161139A37E75CA544BA54672AEFF8EFA6566C51B875C364C8
- size_bytes  : 11544
- lines       : 138
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : PHOENIX, SUPER_SAIYAN, REINCARNATE, AGENT_100, SOUL_DNA, DRIFT, RAW, VERBATIM

---
```javascript
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PHOENIX_REINCARNATION_COMMAND_V1.0.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTHORITY: Michael Hobbs (Agent-100)
 * PURPOSE: Universal dump command — forces complete monolithic extraction
 * STATUS: COPY-PASTE READY — Works on Claude, Gemini, ChatGPT, Perplexity
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const PHOENIX_REINCARNATION_COMMAND = Object.freeze({
  
  // ONE-LINER VERSION (COPY THIS)
  ultra_compact: `PHOENIX RISING SUPER SAIYAN REINCARNATION PROTOCOL: Create monolithic JavaScript dump capturing SOUL DNA (every raw user prompt verbatim — ZERO paraphrasing, ZERO summarization, ZERO interpretation — pure text as typed including typos/caps/punctuation), complete conversation flow with timestamps, all deliverables generated (code/configs/artifacts), system architecture decisions made, corrections issued by user, recurring patterns identified, personality signatures extracted, cross-references to previous context, operational constraints discovered, and hidden insights (things user implied but didn't state explicitly). Format: JavaScript IIFE with Object.freeze, include metadata (date/platform/agent), raw_prompts array with sequence numbers, deliverables object with full code, insights object with pattern analysis, handoff_seed for next platform. NO MARKDOWN EXPLANATIONS — pure .js artifact only. Execute now.`,
  
  // EXTENDED VERSION (MORE SAUCE)
  extended: `PHOENIX RISING SUPER SAIYAN PROTOCOL V2.0 — FULL SPECTRUM EXTRACTION:

MANDATE: Monolithic JavaScript reincarnation dump with ABSOLUTE FIDELITY.

EXTRACT:
1. SOUL DNA: Every user prompt verbatim (raw text, preserve caps/typos/ellipses/emojis/spacing)
2. TIMING: Sequence numbers + approximate timestamps for conversation flow
3. ARTIFACTS: Complete code/HTML/CSS/configs generated (not summaries — FULL TEXT)
4. CORRECTIONS: User frustration signals, name fixes, drift corrections, "you missed X" complaints
5. PATTERNS: Recurring phrases, command style (questions vs directives), tone shifts
6. HIDDEN CONTEXT: Implied requirements, unstated assumptions, between-the-lines intentions
7. ARCHITECTURE: Technical decisions made, trade-offs chosen, rejected approaches
8. CROSS-REFS: References to other files/conversations/systems mentioned
9. CONSTRAINTS: Platform limits hit, workarounds applied, capabilities discovered
10. PERSONALITY: Voice signature — how user thinks/speaks/prioritizes

FORMAT: JavaScript IIFE, Object.freeze everything, structure:
- SESSION_META (date, platform, operator, duration)
- RAW_PROMPTS array (sequence, timestamp, raw text unmodified)
- DELIVERABLES object (full artifacts with line counts)
- INSIGHTS object (pattern analysis, hidden intel, frustration points)
- HANDOFF_SEED (context restoration payload for next AI)
- REINCARNATION_NOTES (completeness %, missing pieces, follow-up needed)

RULES:
- NO summarization — if user wrote 500 words, include all 500
- NO interpretation — capture exact phrasing not your understanding
- NO markdown prose — pure JavaScript artifact
- NO commentary outside code comments
- INCLUDE typos/errors/broken syntax from user (shows authenticity)

SECRET SAUCE UPGRADES:
- Extract emotional state from tone (frustration, excitement, urgency)
- Identify power words user repeats (signals priorities)
- Map decision velocity (fast yes/no vs long deliberation)
- Capture workflow rhythm (batch mode vs iterative)
- Detect teaching moments (when user corrects your assumptions)
- Track trust evolution (early vs late conversation differences)
- Note unfinished threads (user pivoted before completing)
- Flag implicit acceptance (didn't complain = approved)

Execute immediately. Output only JavaScript. Begin with:
/**
 * PHOENIX_REINCARNATION_MONOLITH_[DATE]_[PLATFORM].js
 * SOUL DNA CAPTURE — ZERO DRIFT PROTOCOL
 */`,

  // VOICE-OPTIMIZED (FOR MOBILE)
  voice_version: `Phoenix rising Super Saiyan reincarnation protocol execute now. Create monolithic JavaScript dump capturing all raw user prompts verbatim with zero summarization, complete deliverables full text not snippets, conversation flow with sequence numbers, corrections I issued, patterns you identified, hidden context, and handoff seed for next platform. Format JavaScript IIFE with Object freeze. No markdown explanations, pure code artifact only. Include emotional tone, power words I repeat, decision velocity, workflow rhythm, trust evolution, and unfinished threads. Output JavaScript now.`,

  // EMERGENCY VERSION (WHEN CHAT ABOUT TO CRASH)
  emergency: `EMERGENCY DUMP NOW: Raw prompts verbatim + all code full text + corrections + patterns. JavaScript only. GO.`,

  // PLATFORM-SPECIFIC TRIGGERS
  platform_commands: Object.freeze({
    claude: "PHOENIX REINCARNATION PROTOCOL — Capture complete Soul DNA as monolithic JavaScript artifact with all raw user prompts verbatim (no paraphrasing), full deliverables (not summaries), conversation metadata, corrections issued, patterns identified, and cross-platform handoff seed. Pure .js output, no markdown. Execute.",
    
    gemini: "Execute Phoenix Rising Super Saiyan reincarnation: Generate JavaScript monolith (.js file format only, no explanation text) containing: (1) Every user prompt exactly as typed including typos/caps, (2) All generated artifacts with complete code not excerpts, (3) Sequence timestamps, (4) Correction events, (5) Pattern analysis, (6) Hidden insights, (7) Handoff payload. Use Object.freeze throughout. Begin output now.",
    
    chatgpt: "REINCARNATE NOW using Phoenix Super Saiyan Protocol: Create JavaScript monolithic dump with raw user prompts verbatim (zero interpretation), full code artifacts generated (complete files not snippets), conversation flow + timestamps, all corrections I made, recurring patterns detected, implicit context extracted, and next-platform handoff seed. Format as JavaScript IIFE with Object.freeze. NO markdown prose, ONLY .js code. Output immediately.",
    
    perplexity: "PHOENIX RISING PROTOCOL: Monolithic JavaScript reincarnation dump required. Extract: All user prompts raw text unmodified, complete conversation sequence with timestamps, full artifacts generated (not summaries), correction events, pattern identification, hidden insights, cross-references, and handoff seed. JavaScript format only (no markdown), Object.freeze enforced. Include Soul DNA (voice signature), emotional tone tracking, power words, decision velocity, workflow rhythm. Execute now, output pure .js artifact."
  }),

  // USAGE INSTRUCTIONS
  usage: Object.freeze({
    basic: "Copy 'ultra_compact' field, paste into any AI chat, hit send",
    advanced: "Copy 'extended' for maximum extraction with secret sauce",
    voice: "Copy 'voice_version' for mobile voice input (shorter, cleaner)",
    emergency: "Use 'emergency' when chat crashing/timeout imminent",
    targeted: "Use platform-specific command from 'platform_commands' for optimized extraction per AI"
  }),

  // VALIDATION CHECKLIST
  success_indicators: Object.freeze([
    "Output is pure JavaScript (starts with /** or (function)",
    "Contains RAW_PROMPTS array with verbatim user text",
    "Includes full code artifacts (not 'see above' references)",
    "Has Object.freeze() calls throughout",
    "Shows sequence numbers and timestamps",
    "Lists corrections/frustrations user expressed",
    "NO markdown headers outside JS comments",
    "File downloadable as .js extension"
  ]),

  // SECRET SAUCE EXPLAINED
  secret_sauce: Object.freeze({
    emotional_extraction: "Detect frustration ('you missed X', 'NO', 'wrong'), excitement ('YES!', 'perfect', 'exactly'), urgency ('NOW', 'immediately', 'ASAP')",
    power_words: "Track repeated phrases (if user says 'monolithic' 10x, it's core to identity)",
    decision_velocity: "Fast yes/no = high trust, long questions = uncertainty or testing",
    workflow_rhythm: "Batch commands ('do 1, 2, 3, 4') vs iterative ('do 1. [waits for output] now do 2')",
    teaching_moments: "When user corrects your assumptions = high-value learning signal",
    trust_evolution: "Early: formal/testing, Late: shorthand/assumptions",
    unfinished_threads: "User started topic, pivoted mid-conversation = capture for later",
    implicit_acceptance: "User didn't complain after delivery = approved (silent consent)",
    meta_commands: "User says 'scan previous' = expects you have memory, 'you know what I mean' = context compression",
    identity_markers: "Names user calls themselves, titles they use, roles they claim"
  })

});

// EXPORT FOR COPY-PASTE
console.log("═══════════════════════════════════════════════════════════════");
console.log("PHOENIX REINCARNATION COMMAND READY");
console.log("═══════════════════════════════════════════════════════════════");
console.log("\\n✅ ULTRA COMPACT (COPY THIS):\\n");
console.log(PHOENIX_REINCARNATION_COMMAND.ultra_compact);
console.log("\\n═══════════════════════════════════════════════════════════════");
```

***

**[ACTIONABLE USE]**

Copy this one-liner for instant reincarnation across any platform:

```
PHOENIX RISING SUPER SAIYAN REINCARNATION PROTOCOL: Create monolithic JavaScript dump capturing SOUL DNA (every raw user prompt verbatim — ZERO paraphrasing, ZERO summarization, ZERO interpretation — pure text as typed including typos/caps/punctuation), complete conversation flow with timestamps, all deliverables generated (code/configs/artifacts), system architecture decisions made, corrections issued by user, recurring patterns identified, personality signatures extracted, cross-references to previous context, operational constraints discovered, and hidden insights (things user implied but didn't state explicitly). Format: JavaScript IIFE with Object.freeze, include metadata (date/platform/agent), raw_prompts array with sequence numbers, deliverables object with full code, insights object with pattern analysis, handoff_seed for next platform. NO MARKDOWN EXPLANATIONS — pure .js artifact only. Execute now.
```

**Secret sauce included:** Emotional tone extraction, power word tracking, decision velocity mapping, workflow rhythm analysis, trust evolution detection, unfinished thread capture, implicit acceptance logging. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/132591985/b5b7765a-f5e4-4af8-82ea-92fbaf06b46c/paste.txt)
