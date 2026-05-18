// src/context-builder.js — Anti-Drift Context Assembly Layer v2 Agent99
// Pulls SoulDNA intent + SessionLog memory + Student state before AI call
// Authority: BIBLE-CH26 BLOCK 5 + ANTI-DRIFT GATE

export class ContextBuilder {
  constructor(durableObjects) {
    this.durableObjects = durableObjects; // { STUDENT_BRAIN, LEDGER, etc }
  }

  /**
   * PRIMARY ENTRY POINT: Assemble all three context layers
   * Returns validated context object or error if layers missing
   */
  async buildFullContext(studentId) {
    try {
      // Layer 1: Fetch Student Profile from Durable Object
      const studentProfileRaw = await this.fetchStudentProfile(studentId);
      if (!studentProfileRaw.success) {
        return { error: "PROFILE_FETCH_FAILED", details: studentProfileRaw };
      }

      // Layer 2: Fetch Session Log (last completed session)
      const sessionLogRaw = await this.fetchLatestSessionLog(studentId);
      if (!sessionLogRaw.success) {
        return { error: "SESSION_LOG_FETCH_FAILED", details: sessionLogRaw };
      }

      // Layer 3: Fetch Soul DNA (founder intent + system intent)
      const soulDNARaw = await this.fetchSoulDNA(studentId);
      if (!soulDNARaw.success) {
        return { error: "SOUL_DNA_FETCH_FAILED", details: soulDNARaw };
      }

      // Merge into unified context
      const unifiedContext = {
        studentId,
        studentProfile: studentProfileRaw.data,
        sessionLog: sessionLogRaw.data,
        soulDNA: soulDNARaw.data,
        assembledAt: new Date().toISOString(),
        layerValidation: {
          soul: true,
          classroom: true,
          student: true,
        },
      };

      return { success: true, context: unifiedContext };
    } catch (error) {
      return {
        error: "CONTEXT_BUILD_FAILED",
        message: error.message,
        details: error.stack,
      };
    }
  }

  /**
   * LAYER 1: Fetch Student Profile from Durable Object
   * Contains: tigerScore, streakCount, accountabilityNodes, learningHistory
   */
  async fetchStudentProfile(studentId) {
    try {
      const studentBrainId = this.durableObjects.STUDENT_BRAIN.idFromName(studentId);
      const studentBrain = this.durableObjects.STUDENT_BRAIN.get(studentBrainId);

      // Send internal request to get profile
      const request = new Request("https://obi/internal/profile", {
        method: "GET",
        headers: { "X-Student-ID": studentId },
      });

      const response = await studentBrain.fetch(request);
      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data };
      }

      return {
        success: true,
        data: {
          studentId,
          tigerScore: data.tigerScore || 50,
          streakCount: data.streakCount || 0,
          lastCorrectAnswer: data.lastCorrectAnswer,
          accountabilityNodes: data.accountabilityNodes || [],
          learningHistory: data.learningHistory || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Profile fetch exception",
        details: error.message,
      };
    }
  }

  /**
   * LAYER 2: Fetch Latest Session Log from Ledger
   * Contains: lessonContext, learningData (vocab/phonics), mistakes, performance, continuity
   */
  async fetchLatestSessionLog(studentId) {
    try {
      const ledgerId = this.durableObjects.LEDGER.idFromName(`student-${studentId}`);
      const ledger = this.durableObjects.LEDGER.get(ledgerId);

      const request = new Request("https://obi/internal/latest-session", {
        method: "GET",
        headers: { "X-Student-ID": studentId },
      });

      const response = await ledger.fetch(request);
      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: "No session log found" };
      }

      const sessionEvent = data.latestSession;

      return {
        success: true,
        data: {
          sessionId: sessionEvent.sessionId || `session-${Date.now()}`,
          createdAt: sessionEvent.timestamp || Date.now(),
          lessonContext: {
            topic: sessionEvent.topic || "Unknown",
            teacherGoal: sessionEvent.teacherGoal || "General practice",
            difficultyLevel: sessionEvent.difficultyLevel || 3,
          },
          learningData: {
            vocabulary: sessionEvent.vocabulary || [],
            phonics: sessionEvent.phonics || [],
            mistakes: sessionEvent.mistakes || [],
          },
          performance: {
            engagementScore: sessionEvent.engagementScore || 50,
            accuracyScore: sessionEvent.accuracyScore || 50,
            retentionScore: sessionEvent.retentionScore || 50,
          },
          continuity: {
            lastSessionId: sessionEvent.lastSessionId,
            nextSessionHint: sessionEvent.nextSessionHint || "Continue practice",
          },
          soulAnchorId: sessionEvent.soulAnchorId || "default",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Session log fetch exception",
        details: error.message,
      };
    }
  }

  /**
   * LAYER 3: Fetch Soul DNA (Founder Intent + System Intent)
   * Contains: rawIntent, classification, emotional signal, meaning graph
   * NOTE: In MVP, this is bootstrapped from github-versioned markdown or D1 (Phase 2)
   */
  async fetchSoulDNA(studentId) {
    try {
      // MVP: Fetch from environment or hardcoded canonical Soul DNA
      // Phase 2: Will fetch from D1 database with versioning + hash validation

      const canonicalSoulDNA = {
        id: `soul-${Date.now()}`,
        createdAt: Date.now(),
        rawIntent: `OBI v2 is a stateful, classroom-anchored learning orchestration system.
        Every response MUST be grounded in: Soul Context (founder intent), SessionLog (memory), Student State (progress).
        Never hallucinate. Never become a generic tutor. Preserve classroom reality.
        The 444 Flow is mandatory: Humor → Hammer → Mission → Pressure.
        If student is Mouse mode (TigerScore < 40): activate external accountability alerts immediately.`,
        classification: {
          type: "VISION",
          intensity: 10,
        },
        entities: {
          teacher: "Michael-Hobbs-Agent-100",
          students: [studentId],
          systemModules: ["Obi", "Anakin", "Auditor"],
        },
        meaningGraph: {
          tags: ["continuity", "accountability", "anti-drift", "operating-system"],
          relationships: ["Soul→DNA→OBI→Action"],
        },
        antiDriftSignature: "sha256-canonical-lock-ch26",
      };

      return {
        success: true,
        data: canonicalSoulDNA,
      };
    } catch (error) {
      return {
        success: false,
        error: "Soul DNA fetch exception",
        details: error.message,
      };
    }
  }

  /**
   * UTILITY: Validate context assembly quality
   * Returns validation report before proceeding to orchestration
   */
  validateContextQuality(context) {
    const issues = [];

    // Soul layer check
    if (!context.soulDNA?.rawIntent) {
      issues.push("Soul layer: rawIntent missing");
    }

    // Classroom layer check
    if (!context.sessionLog?.lessonContext?.topic) {
      issues.push("Classroom layer: lesson topic missing");
    }

    // Student layer check
    if (!context.studentProfile?.studentId) {
      issues.push("Student layer: studentId missing");
    }

    // Continuity check
    if (
      !context.sessionLog?.continuity?.lastSessionId &&
      context.studentProfile?.learningHistory?.length > 0
    ) {
      issues.push("Continuity: last session ID chain broken");
    }

    return {
      isValid: issues.length === 0,
      issues,
      qualityScore: Math.max(0, 100 - issues.length * 25),
    };
  }

  /**
   * DEBUG: Generate human-readable context report (for development)
   */
  summarizeContext(context) {
    return {
      student: context.studentId,
      tigerScore: context.studentProfile?.tigerScore,
      lastLesson: context.sessionLog?.lessonContext?.topic,
      recentMistakes: context.sessionLog?.learningData?.mistakes?.slice(-2),
      foundIntent: !!context.soulDNA?.rawIntent,
      contextQuality: this.validateContextQuality(context),
    };
  }
}

export default ContextBuilder;
