// src/memory-brain.js — OBI Memory Brain
// Weakness tracking, re-entry detection, reward signals, adaptive prompt injection
// Bridges ProfileDO weak points with OBI system prompt for behavioral targeting

// ── Weakness pattern detection (lightweight keyword extraction) ────────────────
// Not ML — just fast regex matching against OBI's correction patterns.
// Good enough for MVP. Upgrade to LLM extraction in Phase 2.

const WEAKNESS_PATTERNS = {
  past_tense:      { category: "grammar",        pattern: /past tense|went|was\/were|did not|irregular verb/i },
  present_perfect: { category: "grammar",        pattern: /present perfect|have been|has been|have done/i },
  articles:        { category: "grammar",        pattern: /\barticle|use "the"|use "a"|missing article/i },
  prepositions:    { category: "grammar",        pattern: /preposition|"in" not "on"|"at" not "in"|wrong preposition/i },
  word_order:      { category: "grammar",        pattern: /word order|sentence structure|rearrange|subject.*verb.*object/i },
  subject_verb:    { category: "grammar",        pattern: /subject.verb|agreement|plural.*singular|singular.*plural/i },
  conditionals:    { category: "grammar",        pattern: /conditional|if.*would|if.*will|would have/i },
  th_sound:        { category: "pronunciation",  pattern: /\/th\/|th sound|"th"|tongue.*teeth/i },
  r_l_sound:       { category: "pronunciation",  pattern: /\/r\/|\/l\/|r sound|l sound|r and l/i },
  final_consonant: { category: "pronunciation",  pattern: /final consonant|ending sound|drop.*end/i },
  word_stress:     { category: "pronunciation",  pattern: /stress|emphasis|syllable/i },
  vocabulary:      { category: "vocabulary",     pattern: /vocabulary|word choice|better word|synonym|collocation/i },
  formality:       { category: "vocabulary",     pattern: /formal|informal|register|polite|casual/i },
};

/**
 * Extract weakness categories from OBI's correction reply.
 * Returns array of { specific, category } objects.
 */
export function extractWeaknesses(obiReply) {
  const found = [];
  for (const [specific, { category, pattern }] of Object.entries(WEAKNESS_PATTERNS)) {
    if (pattern.test(obiReply)) {
      found.push({ specific, category });
    }
  }
  return found;
}

/**
 * Build system prompt excerpt from stored weak points.
 * Injected into OBI's context so corrections target known weaknesses.
 */
export function buildWeaknessPrompt(weakPoints) {
  if (!weakPoints || weakPoints.length === 0) return "";
  const top = weakPoints.slice(0, 5);
  const lines = top.map(w =>
    `- ${w.specific.replace(/_/g, " ")} (${w.category}): seen ${w.error_count}x, last ${daysAgo(w.last_seen)}`
  );
  return `\n\nSTUDENT WEAK POINTS (prioritize corrections targeting these):\n${lines.join("\n")}`;
}

/**
 * Detect re-entry state and build appropriate prompt injection.
 * daysSinceActive = days since last PetDO checkin or chat.
 */
export function buildReEntryPrompt(daysSinceActive, topWeakness) {
  if (daysSinceActive < 3) return "";
  const weakHint = topWeakness
    ? ` Their top weakness is still: ${topWeakness.replace(/_/g, " ")}.`
    : "";

  if (daysSinceActive >= 14) {
    return `\n\nRE-ENTRY MODE (${daysSinceActive} days absent): Welcome the student back warmly. No guilt. Give one easy win drill first, then target their known weakness.${weakHint} Resume progress — no reset. They are not starting over.`;
  }
  return `\n\nRE-ENTRY MODE (${daysSinceActive} days absent): Welcome back naturally. Start with their known weakness for quick re-engagement.${weakHint} No reset. Continue where they left off.`;
}

/**
 * Generate reward signal messages for progress visibility.
 * Returns array of human-readable progress strings.
 */
export function buildRewardSignals(weakPoints, streakDays) {
  const signals = [];
  for (const w of (weakPoints || [])) {
    if (w.improvement_pct > 20) {
      signals.push(`${w.specific.replace(/_/g, " ")} errors down ${w.improvement_pct}%`);
    }
  }
  if (streakDays >= 30) signals.push(`${streakDays}-day streak — Tiger status. Mention it: "Don't break this chain — it took ${streakDays} days to build."`);
  else if (streakDays >= 7) signals.push(`${streakDays}-day streak — real momentum. Mention it with stakes: "Day ${streakDays}. Your brain is rewiring. Show up tomorrow."`);
  else if (streakDays >= 3) signals.push(`${streakDays} days in a row — the habit is forming. Mention it: "Day ${streakDays}. Keep the chain alive."`);
  else if (streakDays === 2) signals.push(`Two days in a row — chain has started. Mention it: "Day 2. Day 3 is where it gets real."`);
  else if (streakDays === 1) signals.push(`First day back. Mention it: "Day 1. Show up tomorrow — that's all."`);
  return signals;
}

/**
 * Build reward prompt injection for OBI to naturally mention progress.
 */
export function buildRewardPrompt(signals) {
  if (!signals || signals.length === 0) return "";
  return `\n\nPROGRESS TO MENTION (naturally weave ONE of these into your response):\n- ${signals.join("\n- ")}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(ts) {
  if (!ts) return "unknown";
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}
