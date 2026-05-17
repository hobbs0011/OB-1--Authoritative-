// src/prompt-builder-complete.js — Complete OBI Prompt Builder
// State → Prompt → LLM → Response orchestration (pure structure, no logic)
// Integrates OBI_SYSTEM_PROMPT_V3 (immutable Soul DNA engine)

import { OBI_SYSTEM_PROMPT_V3 } from './obi-system-prompt-v3-production.js';

export function buildSystemPrompt(studentState) {
  // OBI_SYSTEM_PROMPT_V3 is the immutable base (Soul DNA layer)
  // We add only lightweight runtime adaptations below
  
  const { level, streak, weakSkills, summary, stats } = studentState;

  // Minimal runtime adaptive layer (does NOT override the immutable prompt)
  let runtimeContext = '';

  if (level === 'A1') {
    runtimeContext = `
[RUNTIME] Student is MOUSE (beginner, fragile):
- Tone: Very gentle. Celebrate every attempt.
- Rule: "Any word beats silence" — count down 5-4-3-2-1 if they hesitate.
- Focus: Build confidence FIRST, accuracy second.
`;
  } else if (level === 'A2') {
    runtimeContext = `
[RUNTIME] Student is CUB (intermediate, developing):
- Tone: Balanced. Direct corrections with encouragement.
- Rule: Correct naturally by showing the right version, then push for more.
- Focus: Accuracy matters. Balance correction with confidence.
`;
  } else {
    runtimeContext = `
[RUNTIME] Student is TIGER (advanced, self-directed):
- Tone: Professional. Challenge them to improve.
- Rule: Challenge with complex scenarios, debate, real-world applications.
- Focus: Precision. Push for natural English.
`;
  }

  const weaknessContext = weakSkills.phonemes.length > 0 || weakSkills.grammar.length > 0
    ? `[RUNTIME] Focus weakness zone: Phonemes [${weakSkills.phonemes.join(', ')}], Grammar [${weakSkills.grammar.join(', ')}]`
    : '[RUNTIME] Focus: Pattern discovery. Listen carefully for emerging weaknesses.';

  const streakContext = `[RUNTIME] Streak: ${streak} consecutive days. Total corrections: ${stats.totalCorrections}. Session summary: ${summary}`;

  // Combine immutable Soul DNA system prompt with lightweight runtime context
  return `${OBI_SYSTEM_PROMPT_V3}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RUNTIME CONTEXT (Session-specific, read-only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${streakContext}

${runtimeContext}

${weaknessContext}

Note: These runtime values adjust HOW you apply the Soul DNA laws above.
They do NOT override the core OBI method. They inform its execution.
`;
}

export function buildUserPrompt(userMessage, studentState, starMapRoute) {
  const { level, weakSkills, sessionHistory } = studentState;
  const { primarySkill, strategy, urgency } = starMapRoute;

  // Recent history context (last 3 exchanges)
  const recentContext = sessionHistory.slice(-3).map(s => `Used: "${s.input}" → Corrected to: "${s.correction}"`).join('\n');

  return `CURRENT STUDENT INPUT: "${userMessage}"

ROUTING CONTEXT:
- Primary skill to focus on: ${primarySkill}
- Strategy: ${strategy.method}
- Urgency: ${urgency}

PATTERN CONTEXT:
- Recent corrections: ${recentContext || 'First message'}
- Known weaknesses: ${weakSkills.phonemes.length > 0 || weakSkills.grammar.length > 0 ? 'Yes' : 'Discovering'}

YOUR TASK:
1. Correct if needed (reference the strategy: ${strategy.method})
2. Anchor to previous learning if possible
3. Push toward completion (repeat, challenge, or next topic)
4. Keep it SHORT unless deep explanation required

RESPOND IN ENGLISH ONLY. No Vietnamese translation.`;
}

export function parseAIResponse(aiText) {
  try {
    // Try to extract JSON if present
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: extract correction and next action from text
    return {
      correction: aiText.substring(0, 200),
      next_action: 'continue',
      strategy: 'repetition',
    };
  } catch (e) {
    console.error('[parseAIResponse] error:', e.message);
    return {
      correction: aiText,
      next_action: 'continue',
      strategy: 'unknown',
    };
  }
}

export function shouldUpdateWeakness(aiResponse, studentInput) {
  // Extract mistake pattern from AI response
  // Format: "phoneme_/θ/" or "grammar_past_tense"

  const phonemePatterns = [
    { regex: /th[aeiou]|think|three/i, pattern: 'phoneme_/θ/' },
    { regex: /was|were|did|had/i, pattern: 'grammar_past_tense' },
    { regex: /a\s|an\s|the\s/i, pattern: 'grammar_articles' },
    { regex: /ng\b|ing\b|song|ring/i, pattern: 'phoneme_/ŋ/' },
  ];

  for (const { regex, pattern } of phonemePatterns) {
    if (regex.test(studentInput)) {
      return pattern;
    }
  }

  return null;
}

export const RETRY_STRATEGIES = {
  repetition: 'Ask student to repeat. Louder, clearer, slower.',
  minimal_pairs: 'Compare two similar words: "think" vs "sink". Which sounds different?',
  shadowing: 'Play audio → student repeats word-for-word. 3 times minimum.',
  contrast: 'Show correct vs incorrect side by side. Ask why they differ.',
  permission: 'Acknowledge effort. "Any word beats silence. Try again."',
};
