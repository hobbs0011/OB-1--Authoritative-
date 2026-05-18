// soul-capture-engine.js
// Soul DNA Capture Engine for OBI Learning System
// Captures raw verbatim, extracts soul, generates DNA index

class SoulCaptureEngine {
  /**
   * STEP 1: Capture raw verbatim (IMMUTABLE)
   * Never clean, never summarize, never edit
   */
  static captureRaw(input, metadata = {}) {
    return {
      event_id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      raw_verbatim: input, // NEVER CLEAN
      metadata: {
        speaker: metadata.speaker || "student",
        session_type: metadata.session_type || "learning",
        student_id: metadata.student_id || null,
        ...metadata
      }
    };
  }

  /**
   * STEP 2: Extract soul meaning (WHY layer)
   * Uses LLM to identify intent, emotional signal, behavioral pattern
   */
  static async extractSoul(capturedEvent, llmClient) {
    const prompt = `
You are an expert learning psychologist analyzing raw student intent.

Raw student input: "${capturedEvent.raw_verbatim}"

Extract ONLY these three elements (respond with valid JSON only):
1. core_intent: What does the student actually want? (string)
2. why_signal: What emotional or cognitive pattern caused this message? (string)
3. behavioral_pattern: What learning loop is this? (one of: repeated_failure_loop, breakthrough_moment, consistency_check, weakness_exposed, skill_mastery)

Respond ONLY with valid JSON:
{
  "core_intent": "...",
  "why_signal": "...",
  "behavioral_pattern": "..."
}
`;

    try {
      const response = await llmClient.generate(prompt);
      const soul = typeof response === 'string' ? JSON.parse(response) : response;
      
      return {
        ...capturedEvent,
        soul_extraction: {
          core_intent: soul.core_intent,
          why_signal: soul.why_signal,
          behavioral_pattern: soul.behavioral_pattern
        }
      };
    } catch (error) {
      console.error('Soul extraction failed:', error);
      return {
        ...capturedEvent,
        soul_extraction: {
          core_intent: "extraction_error",
          why_signal: error.message,
          behavioral_pattern: "error"
        }
      };
    }
  }

  /**
   * STEP 3: Generate DNA index (MACHINE layer)
   * Structured, queryable representation of learning state
   */
  static async generateDNA(soulEvent, llmClient) {
    const prompt = `
You are a learning data engineer. Convert this soul extraction into structured DNA.

Soul: ${JSON.stringify(soulEvent.soul_extraction)}

Generate structured DNA (respond with valid JSON only):
{
  "skills": ["skill1", "skill2"],
  "weak_points": ["specific_area1", "specific_area2"],
  "behavioral_tags": ["tag1", "tag2"],
  "drift_risk": 0.75,
  "urgency": 0.8,
  "action": "DAILY_DRILL_REQUIRED" or "MONITOR" or "RESOLVED"
}

Rules:
- skills: array of ["past_tense", "/θ/ sound", "vocabulary", "grammar", "fluency", etc]
- weak_points: specific areas to drill
- drift_risk: 0-1 score of how far from core intent
- urgency: 0-1 score of how immediately action is needed
- action: immediate next step

Respond ONLY with valid JSON:
`;

    try {
      const response = await llmClient.generate(prompt);
      const dna = typeof response === 'string' ? JSON.parse(response) : response;
      
      return {
        ...soulEvent,
        dna_index: {
          skills: dna.skills || [],
          weak_points: dna.weak_points || [],
          behavioral_tags: dna.behavioral_tags || [],
          drift_risk: dna.drift_risk || 0.5,
          urgency: dna.urgency || 0.5,
          action: dna.action || "MONITOR"
        }
      };
    } catch (error) {
      console.error('DNA generation failed:', error);
      return {
        ...soulEvent,
        dna_index: {
          skills: [],
          weak_points: [],
          behavioral_tags: ["error"],
          drift_risk: 1.0,
          urgency: 1.0,
          action: "MANUAL_REVIEW"
        }
      };
    }
  }

  /**
   * STEP 4: Validate before commit
   * Ensure all 3 layers are present
   */
  static validate(fullEvent) {
    const checks = {
      has_raw_verbatim: !!fullEvent.raw_verbatim && fullEvent.raw_verbatim.length > 0,
      has_soul_extraction: !!fullEvent.soul_extraction && !!fullEvent.soul_extraction.core_intent,
      has_dna_index: !!fullEvent.dna_index && Array.isArray(fullEvent.dna_index.skills),
      no_empty_verbatim: fullEvent.raw_verbatim.length > 3,
      has_timestamp: !!fullEvent.timestamp,
      has_event_id: !!fullEvent.event_id
    };

    return {
      is_valid: Object.values(checks).every(v => v),
      checks,
      missing: Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k]) => k)
    };
  }

  /**
   * STEP 5: Prepare for GitHub commit
   * Split into raw + indexed for proper version control
   */
  static prepareForCommit(fullEvent) {
    return {
      raw: {
        event_id: fullEvent.event_id,
        timestamp: fullEvent.timestamp,
        verbatim: fullEvent.raw_verbatim,
        metadata: fullEvent.metadata
      },
      indexed: {
        event_id: fullEvent.event_id,
        timestamp: fullEvent.timestamp,
        soul: fullEvent.soul_extraction,
        dna: fullEvent.dna_index
      }
    };
  }

  /**
   * FULL PIPELINE: Capture → Extract → Generate → Validate → Prepare
   */
  static async fullPipeline(userInput, metadata, llmClient) {
    // Step 1: Capture raw
    const raw = this.captureRaw(userInput, metadata);

    // Step 2: Extract soul
    const withSoul = await this.extractSoul(raw, llmClient);

    // Step 3: Generate DNA
    const withDNA = await this.generateDNA(withSoul, llmClient);

    // Step 4: Validate
    const validation = this.validate(withDNA);
    if (!validation.is_valid) {
      throw new Error(
        `Validation failed. Missing: ${validation.missing.join(", ")}`
      );
    }

    // Step 5: Prepare for commit
    const forGitHub = this.prepareForCommit(withDNA);

    return {
      event: withDNA,
      commit_package: forGitHub,
      validation
    };
  }

  /**
   * Helper: Generate unique event ID
   */
  static generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = { SoulCaptureEngine };
