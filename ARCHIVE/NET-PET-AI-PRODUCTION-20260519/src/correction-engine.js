// src/correction-engine.js — Run 323 Correction Engine
// Enhances /api/speak with rule-based classification, pronunciation guidance, pattern detection

/**
 * Rule-based error classifier for Vietnamese English learners
 * Detects common mistakes BEFORE LLM, adds pronunciation guidance AFTER LLM
 */

const VIETNAMESE_LEARNER_PATTERNS = {
  // Articles (most common Vietnamese error)
  articles: {
    rules: [
      { regex: /^(I am|You are|He is|She is|It is|We are|They are)\s+([a-z])/i, desc: "missing article (a/an)" },
      { regex: /\bthe\s+(job|work|school|friend)s?\s+(?!at|in|for)/i, desc: "unnecessary 'the' with plural generic nouns" },
      { regex: /\bI go to (home|work|school)(?!\s+to)/i, desc: "missing preposition or article" },
    ],
    pronunciation: "Articles: 'a' before consonants, 'an' before vowels",
  },

  // Tenses (Vietnamese has no tense system)
  tenses: {
    rules: [
      { regex: /I go to school yesterday/i, desc: "present tense used for past action" },
      { regex: /\b(go|come|eat|play|study)\s+tomorrow/i, desc: "present tense used for future" },
      { regex: /\b(went|came|ate|played|studied)\s+every day/i, desc: "past tense used for habitual action" },
    ],
    pronunciation: "Tenses: 'went' (past), 'goes' (present), 'will go' (future)",
  },

  // Prepositions (highly mixed up in Vietnamese)
  prepositions: {
    rules: [
      { regex: /at (home|school|office)(?!\s+(at|in|to))/i, desc: "preposition confusion / missing preposition" },
      { regex: /\bon (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i, desc: "use 'on' for days (not 'in')" },
      { regex: /\bin (morning|afternoon|evening)/i, desc: "use 'in' for times of day" },
    ],
    pronunciation: "Prepositions: 'at' (location), 'on' (days), 'in' (months/seasons/times)",
  },

  // Word order (SVO→VSO confusion)
  wordOrder: {
    rules: [
      { regex: /^(like I|like you|like he|like she|like it|like we|like they)/i, desc: "wrong word order: verb before subject" },
      { regex: /\b(eat I|play you|study we|like they)\b/i, desc: "wrong word order" },
    ],
    pronunciation: "Word Order: English is Subject-Verb-Object (like I do, not do I like)",
  },

  // Subject-verb agreement (Vietnamese doesn't inflect)
  agreement: {
    rules: [
      { regex: /\b(he|she|it)\s+(go|eat|play|like|want|have)\b/i, desc: "missing verb -s: should be 'goes', 'eats', 'plays', 'likes', 'wants', 'has'" },
      { regex: /\b(i|you|we|they)\s+(goes|eats|plays|likes|wants|has)\b/i, desc: "extra verb -s: should be 'go', 'eat', 'play', 'like', 'want', 'have'" },
    ],
    pronunciation: "Agreement: 3rd person singular gets -s (he goes, she eats)",
  },

  // Verb infinitive confusion
  infinitive: {
    rules: [
      { regex: /\b(can|will|might|should|must|could|would|may)\s+([a-z]+ed|ing)\b/i, desc: "modal + non-infinitive: use base form after modals" },
      { regex: /\b(like|love|want|try|help)\s+([a-z]+ed)\b/i, desc: "missing infinitive marker: use 'to' (like to eat, not liked eating)" },
    ],
    pronunciation: "Infinitive: use base form after modals (can go, will eat), 'to' after like/want",
  },

  // Pluralization errors
  plurals: {
    rules: [
      { regex: /(\d+)\s+(student|teacher|friend|book|class)(?!s?\b)/i, desc: "missing plural -s after number" },
      { regex: /\b(child|person|foot|tooth|ox|goose)\s+is/i, desc: "uses singular with irregular plural noun" },
    ],
    pronunciation: "Plurals: add -s for most nouns, but some are irregular (children, people, feet, teeth)",
  },

  // Question formation (completely different syntax in Vietnamese)
  questions: {
    rules: [
      { regex: /^(you|he|she|it|we|they)\s+[a-z]+\?$/i, desc: "question without inversion: did you... (not you did...)" },
      { regex: /\?$/i, desc: "question formed as statement with question mark", minConfidence: 0.1 }, // weak signal
    ],
    pronunciation: "Questions: invert subject & verb (Are you...?, Does he...?, Can they...?)",
  },
};

/**
 * Classify error using rule-based patterns
 * Returns array of matched patterns with confidence scores
 */
export function classifyErrorRules(text) {
  const matches = [];
  
  for (const [category, { rules, pronunciation }] of Object.entries(VIETNAMESE_LEARNER_PATTERNS)) {
    for (const rule of rules) {
      if (rule.regex.test(text)) {
        matches.push({
          category,
          error: rule.desc,
          pronunciation,
          confidence: rule.minConfidence || 0.7,
        });
      }
    }
  }
  
  return matches.length > 0 ? matches : null;
}

/**
 * Build correction response with pronunciation guidance
 * Integrates LLM feedback + rule-based classification + pronunciation
 */
export function enrichCorrectionResponse(llmResponse, ruleMatches, studentText) {
  const response = {
    ...llmResponse,
    rule_matches: ruleMatches || null,
    confidence: ruleMatches ? 0.9 : 0.7, // Higher confidence if rule matched
  };

  // Add pronunciation guidance if rule matched
  if (ruleMatches && ruleMatches.length > 0) {
    const topMatch = ruleMatches[0];
    response.pronunciation_category = topMatch.category;
    response.pronunciation_tip = topMatch.pronunciation;
  }

  return response;
}

/**
 * Pattern tracker for repeated mistakes
 * Detects when student makes same error twice in succession
 */
export class PatternTracker {
  constructor() {
    this.history = {};
  }

  recordError(studentId, errorType) {
    if (!this.history[studentId]) {
      this.history[studentId] = [];
    }
    this.history[studentId].push({
      errorType,
      timestamp: Date.now(),
    });
    
    // Keep only last 5 errors per student
    this.history[studentId] = this.history[studentId].slice(-5);
  }

  /**
   * Detect if student just repeated the same error
   * Returns { isRepeated: boolean, count: number }
   */
  detectRepeatedError(studentId, errorType) {
    if (!this.history[studentId] || this.history[studentId].length < 2) {
      return { isRepeated: false, count: 1 };
    }

    const recentErrors = this.history[studentId].slice(-2);
    const isSameError = recentErrors.every(e => e.errorType === errorType);
    const count = recentErrors.filter(e => e.errorType === errorType).length;

    return {
      isRepeated: isSameError,
      count,
      escalationSignal: isSameError ? "student_stuck_on_pattern" : null,
    };
  }
}

/**
 * Build escalation signal if pattern detected
 * Used for DO logging + coach alerts
 */
export function buildEscalationSignal(trackingResult, studentId) {
  if (!trackingResult.escalationSignal) return null;

  return {
    signal: trackingResult.escalationSignal,
    student_id: studentId,
    error_count: trackingResult.count,
    timestamp: Date.now(),
    action: "flag_for_coach_intervention",
  };
}

/**
 * Generate next instruction based on error category
 */
export function getRepeatInstruction(category, corrected) {
  const instructions = {
    articles: `Say slowly: "${corrected}" — pay attention to the article (a, an, or the)`,
    tenses: `Say this sentence: "${corrected}" — notice the past tense ending`,
    prepositions: `Repeat: "${corrected}" — listen to the preposition`,
    wordOrder: `Say this correctly: "${corrected}" — subject first, then verb, then object`,
    agreement: `Say it together: "${corrected}" — hear the -s sound on the verb`,
    infinitive: `Repeat: "${corrected}" — notice the base form after the modal`,
    plurals: `Say this: "${corrected}" — add the -s for plural`,
    questions: `Ask like this: "${corrected}" — verb comes before subject in questions`,
  };

  return instructions[category] || `Say: "${corrected}"`;
}
