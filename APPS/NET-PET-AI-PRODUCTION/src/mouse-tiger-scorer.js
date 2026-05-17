/**
 * MOUSE → TIGER CONFIDENCE TRANSFORMATION ENGINE
 * 
 * Tracks behavioral progression from learned helplessness (Mouse)
 * to powerful agency (Tiger) across 3 modes with real-time scoring.
 * 
 * Architecture: Scores input across 5 dimensions, generates behavioral triggers
 */

export class MouseTigerScorer {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Core Scoring Dimensions (Each 0–100)
   */

  // Dimension 1: CONFIDENCE — How much hesitation vs. immediacy?
  async scoreConfidence(studentInput, previousResponseTime = null) {
    let score = 50; // Base

    // Detection: Apology markers (Mouse behavior)
    if (studentInput.includes("sorry") || studentInput.includes("sorry my")) {
      score -= 20;
    }

    // Detection: Hedges/hesitation ("I think", "maybe", "I'm not sure")
    const hedges = ["i think", "maybe", "i'm not sure", "um", "uh", "err"];
    const hedgeCount = hedges.filter(h => studentInput.toLowerCase().includes(h)).length;
    score -= hedgeCount * 5;

    // Detection: Mental translation markers ("Translate to English: ")
    if (studentInput.includes("in English") || studentInput.includes("how to say")) {
      score -= 15;
    }

    // Boost: Immediate responses (Cub/Tiger behavior)
    if (previousResponseTime && previousResponseTime < 500) { // <500ms = immediate
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Dimension 2: VOLUME — Message length & expression intensity
  async scoreVolume(studentInput) {
    let score = 50;

    const wordCount = studentInput.split(/\s+/).length;

    // Mouse: <5 words (whispered)
    if (wordCount < 5) score -= 15;
    // Cub: 5–15 words (normal speech)
    else if (wordCount >= 5 && wordCount < 15) score += 10;
    // Tiger: >15 words (expansive, confident)
    else if (wordCount >= 15) score += 25;

    // Exclamation marks = high expression
    const exclamations = (studentInput.match(/!/g) || []).length;
    score += exclamations * 5;

    // ALL CAPS = intensity
    const capsWords = (studentInput.match(/\b[A-Z]{2,}\b/g) || []).length;
    score += Math.min(capsWords * 3, 15);

    return Math.max(0, Math.min(100, score));
  }

  // Dimension 3: TRANSLATION_LOAD — Direct English vs. mental Vietnamese translation
  async scoreTranslationLoad(studentInput) {
    let score = 100; // Start high (no translation = good)

    // Markers: "in Vietnamese", "[translated]", "meaning:", etc.
    const translationMarkers = [
      "in vietnamese",
      "translated",
      "meaning:",
      "means:",
      "tiếng việt"
    ];

    const markerCount = translationMarkers.filter(m =>
      studentInput.toLowerCase().includes(m)
    ).length;

    score -= markerCount * 20;

    // BONUS: Direct Vietnamese → English code-switch (sign of Tiger confidence)
    // "I go school yesterday, không hay, I speak English now"
    // Shows direct thinking without pre-translation
    const codeSwitch = /[À-ỹ]+.*[A-Za-z]|[A-Za-z]+.*[À-ỹ]+/.test(studentInput);
    if (codeSwitch && markerCount === 0) {
      score += 20; // Tiger behavior: mixing without apology
    }

    return Math.max(0, Math.min(100, score));
  }

  // Dimension 4: ACCOUNTABILITY_READINESS — Can this go to parent/boss/partner?
  async scoreAccountabilityReadiness(studentInput, studentLevel = "A1") {
    let score = 50;

    // Tiger-ready: Grammatical correctness (even if flawed, it's finished)
    const sentenceCount = (studentInput.match(/[.!?]/g) || []).length;
    if (sentenceCount > 0) score += 15;

    // Subject-verb presence (structure)
    const hasSubjectVerb = /\b(i|you|he|she|it|we|they)\s+(am|is|are|was|were|do|does|have|has)\b/i.test(studentInput);
    if (hasSubjectVerb) score += 20;

    // Mistakes (low score if lots of errors)
    const commonMistakes = [
      "i am student", // missing article
      "i go yesterday", // wrong tense
      "he go", // wrong conjugation
    ];

    const mistakeCount = commonMistakes.filter(m =>
      studentInput.toLowerCase().includes(m)
    ).length;

    score -= mistakeCount * 10;

    // LEVEL BONUS: Advanced students (B1+) get higher accountability scores
    const levelMultiplier = { "A1": 0.7, "A2": 0.85, "B1": 1.0, "B2": 1.1 };
    const multiplier = levelMultiplier[studentLevel] || 0.7;
    score = Math.round(score * multiplier);

    return Math.max(0, Math.min(100, score));
  }

  // Dimension 5: RETENTION_CONTINUITY — Does this build on last session?
  async scoreRetentionContinuity(studentInput, lastSessionContext) {
    let score = 50;

    if (!lastSessionContext) return score; // No previous session

    const { lastTopics, weakPatterns, previousMistakes } = lastSessionContext;

    // BONUS: Student references previous topic
    if (lastTopics && lastTopics.length > 0) {
      const topicMentioned = lastTopics.some(topic =>
        studentInput.toLowerCase().includes(topic.toLowerCase())
      );
      if (topicMentioned) score += 25;
    }

    // PENALTY: Student repeats exact same mistake
    if (previousMistakes && previousMistakes.length > 0) {
      const mistakeRepeated = previousMistakes.some(mistake =>
        studentInput.toLowerCase().includes(mistake.toLowerCase())
      );
      if (mistakeRepeated) score -= 20;
    }

    // BONUS: Student corrects themselves from weak pattern
    if (weakPatterns && weakPatterns.includes("tense")) {
      // If they used correct past tense this time
      if (/went|did|was|were/.test(studentInput)) score += 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * COMPOSITE SCORE: Aggregate all 5 dimensions
   */
  async computeMouseTigerScore(studentInput, context = {}) {
    const confidence = await this.scoreConfidence(studentInput, context.responseTime);
    const volume = await this.scoreVolume(studentInput);
    const translationLoad = await this.scoreTranslationLoad(studentInput);
    const accountability = await this.scoreAccountabilityReadiness(
      studentInput,
      context.level
    );
    const continuity = await this.scoreRetentionContinuity(
      studentInput,
      context.lastSession
    );

    // Weighted average (all dimensions equal weight for now)
    const composite = Math.round(
      (confidence + volume + translationLoad + accountability + continuity) / 5
    );

    return {
      composite,
      breakdown: {
        confidence,
        volume,
        translationLoad,
        accountability,
        continuity
      },
      mode: this.getMode(composite),
      trend: await this.calculateTrend(context.studentId)
    };
  }

  /**
   * MODE CLASSIFICATION
   */
  getMode(score) {
    if (score >= 80) return { mode: "TIGER", emoji: "🐅", description: "Powerful + Confident" };
    if (score >= 41) return { mode: "CUB", emoji: "🦁", description: "Transitioning" };
    return { mode: "MOUSE", emoji: "🐭", description: "Hesitant + Dependent" };
  }

  /**
   * BEHAVIORAL TRIGGER SYSTEM
   * Based on mode + dimensions, generate OBI response modifications
   */
  async generateBehavioralTrigger(score, breakdown) {
    const mode = this.getMode(score);

    let trigger = {
      mode: mode.mode,
      emoji: mode.emoji,
      operatingTemperature: Math.round(score / 20) // 1–5 intensity
    };

    // MOUSE: Encourage with permission + low stakes
    if (mode.mode === "MOUSE") {
      trigger.obi_vibe = "ENCOURAGING";
      trigger.instructions = [
        "Acknowledge courage (any attempt is good)",
        "Use permission language: 'You're allowed to...'",
        "Ask simpler follow-up questions",
        "Celebrate micro-wins"
      ];
      trigger.humor = "gentle_support";
    }

    // CUB: Challenge with gentle sarcasm
    else if (mode.mode === "CUB") {
      trigger.obi_vibe = "CHALLENGING";
      trigger.instructions = [
        "Use light sarcasm: 'Oh, I see you're getting brave now...'",
        "Ask harder questions",
        "Point out improvements from last session",
        "Push for volume + confidence"
      ];
      trigger.humor = "witty_sarcasm";
    }

    // TIGER: Go gangster — high expectations, no apologies
    else if (mode.mode === "TIGER") {
      trigger.obi_vibe = "GANGSTER";
      trigger.instructions = [
        "Treat as equal peer, not student",
        "Use slang: 'Yo, that's fire.'",
        "Ask complex/nuanced questions",
        "Reference their strengths mockingly: 'Show me what you got.'",
        "No handholding — expect excellence"
      ];
      trigger.humor = "confident_roast";
    }

    return trigger;
  }

  /**
   * TREND CALCULATION: Is student moving Mouse→Tiger?
   */
  async calculateTrend(studentId) {
    if (!studentId) return { trend: "UNKNOWN", velocity: 0 };

    const scores = await this.storage.get(`mouse_tiger_history:${studentId}`) || [];

    if (scores.length < 2) return { trend: "INITIALIZING", velocity: 0 };

    // Last 3 scores
    const recent = scores.slice(-3);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;

    // Previous 3 scores
    const previous = scores.slice(-6, -3);
    const avgPrevious = previous.length > 0
      ? previous.reduce((a, b) => a + b, 0) / previous.length
      : avgRecent;

    const velocity = avgRecent - avgPrevious; // +/- change

    return {
      trend: velocity > 5 ? "RISING_TIGER" : velocity < -5 ? "FALLING_MOUSE" : "STABLE",
      velocity,
      avgRecent,
      avgPrevious
    };
  }

  /**
   * STORE SCORE: Log for trend analysis
   */
  async storeScore(studentId, score) {
    const history = await this.storage.get(`mouse_tiger_history:${studentId}`) || [];
    history.push(score);

    // Keep last 20 scores
    if (history.length > 20) history.shift();

    await this.storage.put(`mouse_tiger_history:${studentId}`, history);
  }
}
