// agent-99-obi-engine.js
// OBI Learning Enforcement Engine for Agent 99
// Handles: correction, repetition, memory tracking, accountability

class AgentOBI {
  constructor() {
    this.memory = new Map(); // student_id → state
  }

  /**
   * CORE LOOP: Receive input → Detect errors → Correct → Force repetition → Update memory
   */
  async processUserInput(userInput, studentId, sessionContext = {}) {
    // STEP 1: Retrieve student memory (if exists)
    let studentState = this.memory.get(studentId) || this.initializeStudent(studentId);

    // STEP 2: Detect language issues
    const errors = this.detectLanguageErrors(userInput);

    // STEP 3: Apply corrections
    const corrections = this.generateCorrections(userInput, errors);

    // STEP 4: Determine if repetition is needed
    const repetitionRequired = this.shouldForceRepetition(studentState, errors);

    // STEP 5: Update student memory
    if (errors.length > 0) {
      this.updateStudentMemory(studentId, errors, studentState);
    }

    // STEP 6: Format response
    const response = this.formatOBIResponse(
      corrections,
      repetitionRequired,
      studentState
    );

    // Save updated state
    this.memory.set(studentId, studentState);

    return {
      user_input: userInput,
      errors_detected: errors,
      corrections,
      repetition_required: repetitionRequired,
      obi_response: response,
      student_state: studentState
    };
  }

  /**
   * STEP 1: Initialize student state
   */
  initializeStudent(studentId) {
    return {
      student_id: studentId,
      created_at: new Date().toISOString(),
      weak_skills: {},
      error_history: [],
      streak: 0,
      last_session: null,
      drills_required: []
    };
  }

  /**
   * STEP 2: Detect language errors
   * Returns array of error objects
   */
  detectLanguageErrors(input) {
    const errors = [];

    // Grammar patterns
    if (/^i\s/i.test(input)) {
      errors.push({
        type: "capitalization",
        detected: "i ",
        corrected: "I ",
        skill: "capitalization"
      });
    }

    if (/go\s+(school|home|work)/i.test(input)) {
      errors.push({
        type: "past_tense",
        detected: "go",
        corrected: "went",
        skill: "past_tense"
      });
    }

    // Phonetic patterns (would need audio to detect fully)
    if (/th/i.test(input)) {
      // Placeholder: when audio input available, detect /θ/ and /ð/
      errors.push({
        type: "phonetic",
        detected: "th-sound",
        skill: "/θ/_/ð/_sounds"
      });
    }

    return errors;
  }

  /**
   * STEP 3: Generate corrections
   */
  generateCorrections(userInput, errors) {
    if (errors.length === 0) {
      return {
        is_correct: true,
        message: "Perfect! No errors detected."
      };
    }

    return {
      is_correct: false,
      original: userInput,
      corrected: this.applyCorrections(userInput, errors),
      errors: errors.map(e => ({
        type: e.type,
        issue: e.detected,
        fix: e.corrected,
        skill: e.skill
      }))
    };
  }

  /**
   * Helper: Apply corrections to user input
   */
  applyCorrections(input, errors) {
    let corrected = input;

    errors.forEach(error => {
      if (error.corrected) {
        corrected = corrected.replace(
          new RegExp(error.detected, "gi"),
          error.corrected
        );
      }
    });

    return corrected;
  }

  /**
   * STEP 4: Determine if repetition is required
   */
  shouldForceRepetition(studentState, errors) {
    // Force repetition if:
    // 1. Same error appears 2+ times in history
    // 2. Skill is marked as high-priority weak
    // 3. Student missed yesterday's drill

    const errorSkills = errors.map(e => e.skill);

    for (const skill of errorSkills) {
      if (studentState.weak_skills[skill]?.count >= 2) {
        return true;
      }
    }

    return false;
  }

  /**
   * STEP 5: Update student memory with errors
   */
  updateStudentMemory(studentId, errors, studentState) {
    errors.forEach(error => {
      const skill = error.skill;

      if (!studentState.weak_skills[skill]) {
        studentState.weak_skills[skill] = {
          skill,
          count: 0,
          last_error: null,
          status: "active"
        };
      }

      studentState.weak_skills[skill].count += 1;
      studentState.weak_skills[skill].last_error = new Date().toISOString();

      // If error count >= 3, mark for tomorrow's drill
      if (studentState.weak_skills[skill].count >= 3) {
        if (!studentState.drills_required.includes(skill)) {
          studentState.drills_required.push(skill);
        }
      }
    });

    // Update streak
    if (errors.length === 0) {
      studentState.streak += 1;
    } else {
      // Reset streak on errors (re-engage to rebuild)
      studentState.streak = 0;
    }

    studentState.last_session = new Date().toISOString();
  }

  /**
   * STEP 6: Format OBI response for student
   */
  formatOBIResponse(corrections, repetitionRequired, studentState) {
    if (corrections.is_correct) {
      return {
        message: "✅ Perfect! No errors detected.",
        streak_update: `Streak: ${studentState.streak} days`
      };
    }

    let response = `\n❌ CORRECTION NEEDED\n\n`;
    response += `Your input: "${corrections.original}"\n`;
    response += `Corrected: "${corrections.corrected}"\n\n`;

    corrections.errors.forEach(err => {
      response += `• ${err.type}: "${err.issue}" → "${err.fix}"\n`;
    });

    // Force repetition if needed
    if (repetitionRequired) {
      response += `\n🔁 REPETITION REQUIRED\n`;
      response += `Repeat this 3 times:\n"${corrections.corrected}"\n`;
    }

    // Daily report
    response += `\n📊 TODAY'S STATUS\n`;
    response += `Weak skills: ${Object.keys(studentState.weak_skills).length}\n`;
    response += `Drills required tomorrow: ${studentState.drills_required.join(", ") || "None"}\n`;
    response += `Current streak: ${studentState.streak} days\n`;

    return response;
  }

  /**
   * Generate daily drill for weak skills
   */
  generateDailyDrill(studentId) {
    const studentState = this.memory.get(studentId);
    if (!studentState || studentState.drills_required.length === 0) {
      return null;
    }

    const drillSkills = studentState.drills_required;

    return {
      student_id: studentId,
      drills_required: drillSkills,
      message: `🎯 TODAY'S DRILLS\n\nFocus on these skills:\n${drillSkills
        .map(s => `• ${s}`)
        .join("\n")}\n\nRepeat each drill 5 times.`
    };
  }

  /**
   * Generate end-of-session report
   */
  generateDailyReport(studentId) {
    const studentState = this.memory.get(studentId);
    if (!studentState) {
      return null;
    }

    const weakPoints = Object.entries(studentState.weak_skills)
      .filter(([_, data]) => data.count > 0)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([skill, data]) => `${skill} (${data.count} errors)`);

    return {
      date: new Date().toISOString().split("T")[0],
      student_id: studentId,
      report: `
📊 OBI DAILY REPORT

Weak Points:
${weakPoints.map(p => `• ${p}`).join("\n") || "• None"}

Action Required:
${
  studentState.drills_required.length > 0
    ? `→ Tomorrow: Focus on ${studentState.drills_required.join(", ")}`
    : "→ Keep up the great work!"
}

Streak: ${studentState.streak} days 🔥
      `.trim()
    };
  }
}

module.exports = { AgentOBI };
