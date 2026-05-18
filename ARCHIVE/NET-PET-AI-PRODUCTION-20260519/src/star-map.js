// src/star-map.js — Skeleton Star Map (Semantic State Index)
// "A compressed, query-optimized index over a user's long-term memory state,
//  used to decide what subset of history is relevant for the next LLM call."
//
// It does NOT store memory. It stores WHERE memory becomes relevant.
// Skill states → confidence scores → ledger range pointers → routing decisions.

// ── Skill Categories — what the system tracks ────────────────────────────────
const SKILL_CATEGORIES = {
  // Phonics
  "th_sound": { group: "phonics", label: "/θ/ and /ð/ sounds", strategy: "minimal pair drilling" },
  "sh_sound": { group: "phonics", label: "/ʃ/ sound", strategy: "contrast drilling" },
  "ch_sound": { group: "phonics", label: "/tʃ/ sound", strategy: "contrast drilling" },
  "vowel_confusion": { group: "phonics", label: "vowel distinction", strategy: "listening discrimination" },
  "final_consonant": { group: "phonics", label: "final consonant clusters", strategy: "word-ending drilling" },
  "word_stress": { group: "phonics", label: "word stress patterns", strategy: "stress pattern practice" },
  "intonation": { group: "phonics", label: "intonation patterns", strategy: "sentence melody practice" },
  // Grammar
  "past_tense": { group: "grammar", label: "past tense usage", strategy: "tense correction" },
  "present_tense": { group: "grammar", label: "present tense forms", strategy: "tense correction" },
  "articles": { group: "grammar", label: "article usage (a/an/the)", strategy: "article rules drilling" },
  "prepositions": { group: "grammar", label: "preposition usage", strategy: "preposition context practice" },
  "subject_verb_agreement": { group: "grammar", label: "subject-verb agreement", strategy: "agreement correction" },
  "word_order": { group: "grammar", label: "word order", strategy: "sentence restructuring" },
  // Vocabulary
  "vocabulary_limited": { group: "vocabulary", label: "limited vocabulary range", strategy: "vocabulary expansion" },
  "word_choice": { group: "vocabulary", label: "wrong word choice", strategy: "context-based word selection" },
  // Fluency
  "fluency_low": { group: "fluency", label: "low fluency", strategy: "free speaking practice" },
  "hesitation": { group: "fluency", label: "excessive hesitation", strategy: "timed speaking drills" },
  "filler_words": { group: "fluency", label: "filler word overuse", strategy: "filler elimination practice" },
};

// ── lookup —— The Star Map's core function ──────────────────────────────────
// Takes skill states from ProfileDO → returns routing decision + ledger slice targets
export function lookup(skillStates) {
  if (!skillStates || skillStates.length === 0) {
    return {
      route: [],
      ledger_ranges: [],
      strategy: "general_correction",
      priority: "normal",
      focus_skills: [],
    };
  }

  // Sort by priority: lowest confidence + highest error rate = highest priority
  const prioritized = skillStates
    .map(s => ({
      ...s,
      priority_score: (1 - (s.confidence || 0)) * 0.6 + (s.error_rate || 0) * 0.4,
    }))
    .sort((a, b) => b.priority_score - a.priority_score);

  // Top 3 weakest skills drive the session
  const focus = prioritized.slice(0, 3);
  const topSkill = focus[0];
  const meta = SKILL_CATEGORIES[topSkill.skill] || {};

  // Collect ledger ranges to fetch (targeted, not full history)
  const ledger_ranges = [];
  for (const s of focus) {
    if (s.ledger_start != null && s.ledger_end != null) {
      ledger_ranges.push({ skill: s.skill, start: s.ledger_start, end: s.ledger_end });
    }
  }

  return {
    route: focus.map(s => {
      const m = SKILL_CATEGORIES[s.skill] || {};
      return `${m.label || s.skill} (${m.group || "unknown"})`;
    }),
    ledger_ranges,
    strategy: meta.strategy || "general_correction",
    priority: topSkill.priority_score > 0.6 ? "high" : topSkill.priority_score > 0.3 ? "medium" : "low",
    focus_skills: focus.map(s => ({
      skill: s.skill,
      confidence: s.confidence,
      error_rate: s.error_rate,
      error_count: s.error_count,
      group: (SKILL_CATEGORIES[s.skill] || {}).group || "unknown",
    })),
  };
}

// ── buildPromptContext —— Convert Star Map result into LLM prompt context ────
export function buildPromptContext(starMapResult, ledgerSlice) {
  let ctx = "";

  if (starMapResult.focus_skills.length > 0) {
    ctx += "\n\nSTAR MAP — PRIORITY WEAKNESSES:";
    for (const s of starMapResult.focus_skills) {
      ctx += `\n- ${s.skill}: confidence=${Math.round((s.confidence || 0) * 100)}%, errors=${s.error_count || 0}, group=${s.group}`;
    }
    ctx += `\nSTRATEGY: ${starMapResult.strategy}`;
    ctx += `\nPRIORITY: ${starMapResult.priority}`;
  }

  if (ledgerSlice && ledgerSlice.length > 0) {
    ctx += "\n\nRELEVANT HISTORY (from ledger):";
    const recent = ledgerSlice.slice(-5); // cap at 5 most relevant
    for (const entry of recent) {
      try {
        const p = typeof entry.payload === "string" ? JSON.parse(entry.payload) : entry.payload;
        if (p.original) ctx += `\n- "${p.original}" → "${p.corrected || ""}"`;
      } catch (_) {}
    }
  }

  return ctx;
}

// ── selectMode —— Stabilizer vs Explorer based on student momentum ──────────
export function selectMode(petState, skillStates) {
  // Default to stabilizer
  if (!petState) return "stabilizer";

  const streak = petState.streak || 0;
  const totalSessions = petState.totalSessions || 0;
  const tigerScore = petState.tigerScore || 0;

  // Student is struggling → stabilizer (correct, simplify, enforce)
  if (tigerScore < 30 || streak === 0) return "stabilizer";

  // Student is new → stabilizer
  if (totalSessions < 5) return "stabilizer";

  // Average confidence across skills
  let avgConfidence = 0;
  if (skillStates && skillStates.length > 0) {
    avgConfidence = skillStates.reduce((sum, s) => sum + (s.confidence || 0), 0) / skillStates.length;
  }

  // Student has momentum + decent confidence → explorer (push harder, creative variation)
  if (streak >= 3 && avgConfidence > 0.5) return "explorer";

  return "stabilizer";
}

// ── getModePrompt —— Returns mode-specific prompt modifier ───────────────────
export function getModePrompt(mode) {
  if (mode === "explorer") {
    return "\n\nMODE: EXPLORER — Push this student. Use challenging variations. Be creative. Introduce new vocabulary. They have momentum.";
  }
  return "\n\nMODE: STABILIZER — Correct clearly. Simplify explanations. Enforce the correction pattern. This student needs consistency and repetition.";
}

// ── getStudentRoute —— Full routing decision for a student ──────────────────
// Combines lookup + selectMode into a single route object for the correction loop
export function getStudentRoute(studentId, transcript, weakAreas, petState) {
  const skillStates = (weakAreas || []).map(w => ({
    skill: w.category || w.skill || w,
    confidence: w.confidence || 0.5,
    error_rate: w.error_rate || 0,
    error_count: w.error_count || 0,
    ledger_start: w.ledger_start || null,
    ledger_end: w.ledger_end || null,
  }));

  const starMap = lookup(skillStates);
  const mode = selectMode(petState, skillStates);

  return {
    studentId,
    mode,
    strategy: starMap.strategy,
    priority: starMap.priority,
    focus_skills: starMap.focus_skills,
    route: starMap.route,
    ledger_ranges: starMap.ledger_ranges,
  };
}

// ── getModulePrompt —— Returns combined mode + strategy prompt for a route ──
export function getModulePrompt(route) {
  const modePrompt = getModePrompt(route.mode);
  let strategyHint = "";
  if (route.focus_skills && route.focus_skills.length > 0) {
    strategyHint = `\nFOCUS: ${route.route.join(", ")}\nSTRATEGY: ${route.strategy}`;
  }
  return modePrompt + strategyHint;
}

// ── writeback —— Update skill states after a correction ──────────────────────
// Returns array of skill updates to apply to ProfileDO
export function computeWriteback(correction, existingSkills) {
  const updates = [];
  const detected = correction.detectedWeaknesses || [];
  const wasCorrect = correction.wasCorrect;
  const ledgerId = correction.ledgerId;

  for (const weak of detected) {
    const skill = weak.category || weak;
    const existing = existingSkills.find(s => s.skill === skill);

    if (existing) {
      // Update existing skill state
      const newErrorCount = existing.error_count + 1;
      const newErrorRate = Math.min(1, newErrorCount / Math.max(1, newErrorCount + (existing.correct_count || 0)));
      // Confidence decays when errors happen, grows when correct
      const confDelta = wasCorrect ? 0.05 : -0.08;
      const newConfidence = Math.max(0, Math.min(1, (existing.confidence || 0.5) + confDelta));

      updates.push({
        skill,
        confidence: newConfidence,
        error_rate: newErrorRate,
        error_count: newErrorCount,
        correct_count: existing.correct_count || 0,
        ledger_end: ledgerId || existing.ledger_end,
      });
    } else {
      // New skill entry
      updates.push({
        skill,
        confidence: 0.3,
        error_rate: 1.0,
        error_count: 1,
        correct_count: 0,
        ledger_start: ledgerId,
        ledger_end: ledgerId,
      });
    }
  }

  // For skills NOT in detected errors but student got correct → boost confidence
  if (wasCorrect && existingSkills.length > 0) {
    for (const s of existingSkills) {
      if (!detected.some(d => (d.category || d) === s.skill)) {
        // Passive confidence boost for non-errored skills
        const newConf = Math.min(1, (s.confidence || 0.5) + 0.02);
        if (newConf !== s.confidence) {
          updates.push({
            skill: s.skill,
            confidence: newConf,
            error_rate: s.error_rate,
            error_count: s.error_count,
            correct_count: (s.correct_count || 0) + 1,
            ledger_end: s.ledger_end,
          });
        }
      }
    }
  }

  return updates;
}

// ── driftDetect —— Simple reweighting, not metaphysical collapse ─────────────
// if predicted_skill != observed_skill → increase error score → reduce confidence
export function driftDetect(predicted, observed) {
  const drifted = [];

  for (const pred of predicted.focus_skills || []) {
    // Check if the predicted weakness actually appeared in the observed errors
    const wasObserved = (observed.detectedWeaknesses || []).some(
      w => (w.category || w) === pred.skill
    );

    if (!wasObserved && pred.confidence < 0.5) {
      // We predicted this would be a problem but student didn't trigger it
      // → slight confidence boost (the student is improving on this)
      drifted.push({ skill: pred.skill, action: "boost", delta: 0.05 });
    }
  }

  // Check for UNEXPECTED errors (not predicted by Star Map)
  for (const obs of observed.detectedWeaknesses || []) {
    const wasPredicted = (predicted.focus_skills || []).some(p => p.skill === (obs.category || obs));
    if (!wasPredicted) {
      // Star Map missed this → needs recalibration
      drifted.push({ skill: obs.category || obs, action: "recalibrate", delta: -0.15 });
    }
  }

  return {
    hasDrift: drifted.length > 0,
    adjustments: drifted,
    needsRecalibration: drifted.some(d => d.action === "recalibrate"),
  };
}

// ── Phoenix: snapshot + rehydration ──────────────────────────────────────────

// Capture full student state for Phoenix Reset
export async function createSnapshot(studentId, env) {
  const snapshot = { studentId, ts: Date.now(), version: "2.0" };

  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const wpRes = await stub.fetch(new Request("https://do/weakness/get"));
      snapshot.weakPoints = (await wpRes.json()).weakPoints || [];
      const smRes = await stub.fetch(new Request("https://do/starmap/get"));
      snapshot.skillStates = (await smRes.json()).skills || [];
      const sumRes = await stub.fetch(new Request("https://do/summary/get"));
      snapshot.summary = (await sumRes.json()).summary || "";
    } catch (_) { snapshot.weakPoints = []; snapshot.skillStates = []; snapshot.summary = ""; }
  }

  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      const stateRes = await stub.fetch(new Request("https://do/state"));
      snapshot.pet = (await stateRes.json()).state || null;
    } catch (_) { snapshot.pet = null; }
  }

  return snapshot;
}

// Persist snapshot to LedgerDO as immutable record
export async function storeSnapshot(studentId, snapshot, env) {
  if (!env.LEDGER) return { ok: false, error: "LEDGER not configured" };
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  const res = await stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId,
      eventType: "phoenix_snapshot",
      payload: JSON.stringify(snapshot),
    }),
  }));
  return res.json();
}

// Restore from snapshot — validated truth only
export async function rehydrate(snapshot, env) {
  const result = { restored: [], failed: [], studentId: snapshot.studentId };

  // Restore skill states (Star Map)
  if (snapshot.skillStates?.length && env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(snapshot.studentId));
      await stub.fetch(new Request("https://do/starmap/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: snapshot.skillStates }),
      }));
      result.restored.push("starmap");
    } catch (e) { result.failed.push({ do: "starmap", error: e.message }); }
  }

  // Restore pet state via checkin
  if (snapshot.pet && env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(snapshot.studentId));
      await stub.fetch(new Request("https://do/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: 0, confidence: 5, source: "phoenix_reset" }),
      }));
      result.restored.push("pet");
    } catch (e) { result.failed.push({ do: "pet", error: e.message }); }
  }

  // Log the reset event
  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(snapshot.studentId));
      await stub.fetch(new Request("https://do/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: snapshot.studentId,
          eventType: "phoenix_reset",
          payload: JSON.stringify({ restoredFrom: snapshot.ts, result }),
        }),
      }));
    } catch (_) {}
  }

  return result;
}
