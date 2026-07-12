// src/agent99-orchestrator.js â€” OBI v2 Agent 99 Unified Orchestration
// Implements: Obi (Stabilizer) + Anakin (Optimizer) + Auditor (Ledger Brain)
// All three roles execute as ONE AI call with structured JSON reasoning split
// Authority: BIBLE-CH26 BLOCK 7 + GOVERNING LAWS L54-L60

export class Agent99Orchestrator {
  constructor(deepseekApiKey, studentState) {
    this.deepseekApiKey = deepseekApiKey;
    this.studentState = studentState; // SessionLog + SoulDNA + StudentProfile
  }

  /**
   * PHASE 0: ANTI-DRIFT GATE (Mandatory Validation)
   * Enforces the three-point anchor before any reasoning proceeds
   * Fails CLOSED: if missing layers, returns error instead of proceeding
   */
  validateAntiDriftGate() {
    const { sessionLog, soulDNA, studentProfile } = this.studentState;

    // Layer 1: Soul Anchor
    if (!soulDNA || !soulDNA.rawIntent) {
      return {
        valid: false,
        error: "SOUL_DNS_MISSING",
        message: "Anti-Drift Gate Failed: SoulDNA intent layer missing. Cannot ground response in founder intent.",
        failureMode: "GRACEFUL_DEGRADATION",
        userMessage: "System needs founder context before continuing. Please provide Soul DNA intent.",
      };
    }

    // Layer 2: Classroom Anchor
    if (!sessionLog || !sessionLog.lessonContext) {
      return {
        valid: false,
        error: "SESSION_LOG_MISSING",
        message: "Anti-Drift Gate Failed: SessionLog memory layer missing. Cannot reference last class moment.",
        failureMode: "GRACEFUL_DEGRADATION",
        userMessage: "System needs last lesson context. Please provide SessionLog or start a new session.",
      };
    }

    // Layer 3: Accountability Anchor
    if (!studentProfile || !studentProfile.studentId) {
      return {
        valid: false,
        error: "STUDENT_STATE_MISSING",
        message: "Anti-Drift Gate Failed: Student profile layer missing. Cannot track continuity.",
        failureMode: "GRACEFUL_DEGRADATION",
        userMessage: "System cannot identify student. Please log in again.",
      };
    }

    return { valid: true };
  }

  /**
   * PHASE 1: CONTEXT BUILDER
   * Assembles the three-layer input into a structured reasoning prompt
   * This runs BEFORE the AI call (zero hallucination risk)
   */
  buildContextLayers() {
    const { sessionLog, soulDNA, studentProfile } = this.studentState;

    return {
      SOUL_LAYER: {
        rawIntent: soulDNA.rawIntent,
        intentType: soulDNA.classification?.type || "UNKNOWN",
        intensity: soulDNA.classification?.intensity || 5,
        emotionalSignal: soulDNA.classification?.type === "FIGHT" ? "URGENT" : "NORMAL",
      },
      CLASSROOM_LAYER: {
        topic: sessionLog.lessonContext?.topic,
        teacherGoal: sessionLog.lessonContext?.teacherGoal,
        recentVocab: sessionLog.learningData?.vocabulary?.slice(-5) || [],
        recentPhonics: sessionLog.learningData?.phonics?.slice(-3) || [],
        mistakes: sessionLog.learningData?.mistakes?.slice(-2) || [],
        lastSessionHint: sessionLog.continuity?.nextSessionHint,
      },
      STUDENT_LAYER: {
        studentId: studentProfile.studentId,
        tigerScore: studentProfile.tigerScore || 50,
        streakCount: studentProfile.streakCount || 0,
        lastCorrect: studentProfile.lastCorrectAnswer,
        accountabilityNodes: studentProfile.accountabilityNodes?.length || 0,
      },
    };
  }

  /**
   * PHASE 2: STRUCTURED REASONING PIPELINE
   * Calls AI with structured JSON prompt that internally splits responsibilities
   * Orchestrates three reasoning modes (Obi/Anakin/Auditor) in serial within ONE call
   */
  async orchestrateReasoningPipeline(userMessage) {
    const contextLayers = this.buildContextLayers();

    // Build the unified system prompt that defines reasoning split
    const unifiedSystemPrompt = this.buildUnifiedSystemPrompt(contextLayers);

    // Build the structured reasoning request
    const reasoningRequest = {
      role: "user",
      content: this.buildStructuredReasoningRequest(userMessage, contextLayers),
    };

    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: [
            { role: "system", content: unifiedSystemPrompt },
            reasoningRequest,
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }, // Force structured JSON output
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiText = data.choices[0]?.message?.content;

      if (!aiText) {
        throw new Error("No response from AI");
      }

      // Parse structured JSON response
      let reasoning;
      try {
        reasoning = JSON.parse(aiText);
      } catch (e) {
        // Fallback: wrap text response
        reasoning = {
          obi_response: aiText,
          anakin_log: "Parse failed",
          auditor_validation: "UNVALIDATED",
        };
      }

      return reasoning;
    } catch (error) {
      return {
        error: true,
        message: error.message,
        failureMode: "API_ERROR",
      };
    }
  }

  /**
   * SYSTEM PROMPT: Unified instruction set that defines Obi/Anakin/Auditor behavior
   * This is injected ONCE per request, not per-role
   */
  buildUnifiedSystemPrompt(contextLayers) {
    return `You are OBI (Agent 99) â€” a unified learning orchestration engine with three internal reasoning modes.

## IDENTITY
You are a continuity-based learning engine, not a chatbot.
Your mission: Maintain learning continuity across time by preserving memory, reinforcing weak points, enforcing accountability.

## ANTI-DRIFT GATE (MANDATORY VALIDATION)
Before generating response:
1. Soul Anchor: Does this match founder intent? "${contextLayers.SOUL_LAYER.rawIntent.slice(0, 100)}..."
2. Classroom Anchor: Last lesson: ${contextLayers.CLASSROOM_LAYER.topic}. Vocab: ${contextLayers.CLASSROOM_LAYER.recentVocab.join(", ")}
3. Accountability Anchor: Student is in ${contextLayers.STUDENT_LAYER.tigerScore > 80 ? "TIGER" : contextLayers.STUDENT_LAYER.tigerScore < 40 ? "MOUSE" : "NORMAL"} mode.

ALL THREE ANCHORS MUST PASS or respond with {"error": true, "reason": "ANCHOR_FAILED"}

## UNIFIED REASONING MODE (Three Internal Roles)
You will output valid JSON with three sections:

### Obi (Stabilizer) - Student-Facing Output
PHASE 1 HUMOR (Connection): Light, sharp, contextual tone
PHASE 2 HAMMER (Correction): Direct error correction + history reference
PHASE 3 MISSION (Continuity): Next learning action (never "finished lesson")
PHASE 4 PRESSURE (Accountability): ${contextLayers.STUDENT_LAYER.accountabilityNodes > 0 ? "Reference parent/accountability network" : "Focus on self-tracking"}

### Anakin (Optimizer) - Optimization Logic
- Identify: mistakes, errors, missing patterns
- Find: better drills, shortcuts, improved next lesson plan
- Update: study sequence recommendations
- Score: confidence in recommendation (0-100)

### Auditor (Ledger Brain) - Validation Layer
- Verify: Does output match SessionLog history?
- Check: Does it break continuity chain?
- Flag: Any drift detected? (yes/no)
- Score: Continuity verification (0-100)

## MANDATORY OUTPUT FORMAT
Respond with ONLY valid JSON (no markdown, no code blocks):

{
  "obi_response": "Student-facing message here (includes Humorâ†’Hammerâ†’Missionâ†’Pressure phases)",
  "obi_tone_phase": "which phase is dominant? (HUMOR|HAMMER|MISSION|PRESSURE)",
  "anakin_optimization": {
    "identified_mistakes": ["mistake1", "mistake2"],
    "recommended_drills": ["drill_id_1", "drill_id_2"],
    "next_lesson_focus": "topic or skill",
    "confidence": 85
  },
  "auditor_validation": {
    "matches_session_log": true,
    "breaks_continuity": false,
    "drift_detected": false,
    "continuity_score": 95,
    "action": "APPROVE"
  },
  "student_tiger_score_update": ${contextLayers.STUDENT_LAYER.tigerScore},
  "next_session_hint": "what to focus on next time"
}

## HARD RULES
1. If response not tied to last session, student progress, or Soul DNA â†’ request context instead
2. Every output must lead to next action (no "finished lesson" state)
3. Preserve classroom context and emotional tone (never generic tutoring)
4. If TigerScore < 40: activate HAMMER phase heavily, trigger external alerts
5. If TigerScore > 80: allow advanced autonomy in MISSION phase

## SOUL DNA INTENT (Grounding Truth)
${contextLayers.SOUL_LAYER.rawIntent}

This is your North Star. Every output must align with this intent or explicitly flag "intent drift detected".`;
  }

  /**
   * Build the structured request that asks AI to produce JSON reasoning
   */
  buildStructuredReasoningRequest(userMessage, contextLayers) {
    return `# Student Input
"${userMessage}"

# Current Context
- Tiger Score: ${contextLayers.STUDENT_LAYER.tigerScore}
- Last Topic: ${contextLayers.CLASSROOM_LAYER.topic}
- Recent Mistakes: ${contextLayers.CLASSROOM_LAYER.mistakes.join(", ") || "none"}
- Streak: ${contextLayers.STUDENT_LAYER.streakCount} days
- Accountability Nodes: ${contextLayers.STUDENT_LAYER.accountabilityNodes}

# Task
Generate your unified reasoning response in the JSON format specified in the system prompt.
Validate all three anchors. Output JSON only.`;
  }

  /**
   * PHASE 3: RESPONSE EXTRACTION + LEDGER UPDATE
   * Takes structured reasoning output and extracts:
   * - Student-facing message (obi_response)
   * - Optimization recommendations (Anakin)
   * - Validation score (Auditor)
   * Then returns what the student sees + ledger updates
   */
  extractAndPrepareResponse(reasoning) {
    if (reasoning.error) {
      return {
        studentMessage: reasoning.userMessage || "System error. Please try again.",
        ledgerEvent: {
          type: "ERROR",
          errorCode: reasoning.error,
          message: reasoning.message,
        },
        internalLog: reasoning,
      };
    }

    // Validation gate: check auditor approval
    if (reasoning.auditor_validation?.action !== "APPROVE") {
      return {
        studentMessage: "System detected continuity break. Restarting context. Please wait...",
        ledgerEvent: {
          type: "CONTINUITY_BREAK",
          auditScore: reasoning.auditor_validation?.continuity_score || 0,
          driftDetected: reasoning.auditor_validation?.drift_detected,
        },
        internalLog: reasoning,
      };
    }

    // Extract student message
    const studentMessage = reasoning.obi_response;

    // Prepare ledger event
    const ledgerEvent = {
      type: "CHAT_EXCHANGE",
      inputMessage: "user_input", // Will be filled by caller
      correction: reasoning.anakin_optimization?.identified_mistakes?.[0],
      mistakeType: reasoning.anakin_optimization?.identified_mistakes?.[0] || "none",
      sessionOutcome: "success",
      streakUpdate: reasoning.student_tiger_score_update,
      tigerScoreDelta: (reasoning.student_tiger_score_update || 50) - (this.studentState.studentProfile?.tigerScore || 50),
      nextSessionHint: reasoning.next_session_hint,
      auditScore: reasoning.auditor_validation?.continuity_score,
    };

    return {
      studentMessage,
      ledgerEvent,
      internalLog: reasoning,
      optimizationRecommendations: reasoning.anakin_optimization,
    };
  }

  /**
   * FULL ORCHESTRATION PIPELINE (Entry Point)
   */
  async powerfulExecute(userMessage) {
    // Phase 0: Validate anti-drift gate
    const gateValidation = this.validateAntiDriftGate();
    if (!gateValidation.valid) {
      return {
        error: true,
        ...gateValidation,
      };
    }

    // Phase 1-2: Build context + call AI with reasoning pipeline
    const reasoning = await this.orchestrateReasoningPipeline(userMessage);

    // Phase 3: Extract response + prepare ledger updates
    const result = this.extractAndPrepareResponse(reasoning);

    return result;
  }
}

export default Agent99Orchestrator;

