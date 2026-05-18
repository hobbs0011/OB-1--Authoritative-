/**
 * StudentDO — Durable Object (1 per student)
 * Stores: session state, memory, progress, mistake tracking
 * 
 * Manages:
 * - Persistent student profile
 * - Correction history
 * - Weak areas detection
 * - Daily task generation
 * - Progress tracking
 */

export class StudentDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/chat") return this.handleChat(request);
    if (url.pathname === "/daily") return this.handleDaily();
    if (url.pathname === "/progress") return this.handleProgress();

    return new Response("Not found", { status: 404 });
  }

  /**
   * CORE CHAT LOOP (OBI Accountability Engine)
   */
  async handleChat(request) {
    const { message } = await request.json();

    // 1. LOAD MEMORY
    const memory = await this.getMemory();

    // 2. BUILD PROMPT (OBI + memory context)
    const messages = this.buildPrompt(memory, message);

    // 3. CALL AI (DeepSeek via Cloudflare)
    let aiResponse;
    try {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.3,
          max_tokens: 500
        })
      });

      const data = await res.json();
      aiResponse = data.choices?.[0]?.message?.content || "Unable to process";
    } catch (err) {
      console.error("AI call failed:", err);
      aiResponse = "I'm having trouble right now. Please try again in a moment.";
    }

    // 4. UPDATE MEMORY (track correction + learning)
    const updated = this.updateMemory(memory, message, aiResponse);
    await this.state.storage.put("memory", updated);

    // 5. LOG EVENT (for analysis later)
    await this.logEvent("chat", { message, reply: aiResponse });

    return new Response(JSON.stringify({
      reply: aiResponse,
      memory: {
        level: updated.level,
        streak: updated.streak,
        weakAreas: updated.weakAreas
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  /**
   * DAILY TASK GENERATOR
   */
  async handleDaily() {
    const memory = await this.getMemory();

    const focus = memory.weakAreas[0] || "general fluency";
    const task = {
      type: "speaking",
      prompt: "Describe your day using full sentences",
      focus: `Focus on: ${focus}`,
      duration: 10,
      nextLevel: this.getNextLevel(memory.level)
    };

    await this.logEvent("daily_task", task);

    return new Response(JSON.stringify(task), {
      headers: { "Content-Type": "application/json" }
    });
  }

  /**
   * PROGRESS ENDPOINT
   */
  async handleProgress() {
    const memory = await this.getMemory();
    const logs = (await this.state.storage.get("logs")) || [];

    return new Response(JSON.stringify({
      level: memory.level,
      streak: memory.streak,
      weakAreas: memory.weakAreas,
      corrections: memory.corrections?.length || 0,
      lastActive: new Date(memory.lastActive).toISOString(),
      sessionsCompleted: memory.sessionsCompleted || 0
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // ────────────────────────── MEMORY MANAGEMENT ──────────────────────────

  /**
   * Load or initialize student memory
   */
  async getMemory() {
    return (
      (await this.state.storage.get("memory")) || {
        studentId: this.state.id.toString(),
        level: "A1", // A1, A2, B1, B2
        streak: 0,
        sessionsCompleted: 0,
        weakAreas: [],
        strongAreas: [],
        corrections: [],
        summary: "New student",
        lastActive: Date.now()
      }
    );
  }

  /**
   * Update memory after each chat
   */
  updateMemory(memory, input, output) {
    // Extract mistake patterns
    const mistakes = this.extractMistakes(input, output);

    // Add to correction history
    memory.corrections = memory.corrections || [];
    memory.corrections.push({
      input,
      output,
      mistakes,
      ts: Date.now()
    });

    // Keep only last 50 corrections (MVP safe)
    if (memory.corrections.length > 50) {
      memory.corrections = memory.corrections.slice(-50);
    }

    // Recalculate weak areas
    memory.weakAreas = this.calculateWeakness(memory.corrections);

    // Update compressed summary (Soul DNA v1)
    memory.summary = this.compressMemory(memory);

    // Update activity
    memory.lastActive = Date.now();
    memory.sessionsCompleted = (memory.sessionsCompleted || 0) + 1;

    return memory;
  }

  /**
   * Simple mistake extraction (MVP version)
   * Real version would call a tagger or use regex
   */
  extractMistakes(input, output) {
    const mistakes = [];

    if (output.includes("tense") || output.includes("past")) {
      mistakes.push("tense");
    }
    if (output.includes("article") || output.includes("a/an")) {
      mistakes.push("articles");
    }
    if (output.includes("pronoun") || output.includes("subject")) {
      mistakes.push("pronouns");
    }

    return mistakes;
  }

  /**
   * Calculate weak areas from correction history
   */
  calculateWeakness(corrections) {
    const patterns = {};

    corrections.slice(-20).forEach(c => {
      c.mistakes?.forEach(m => {
        patterns[m] = (patterns[m] || 0) + 1;
      });
    });

    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area]) => area);
  }

  /**
   * Compress memory into short Soul DNA summary
   */
  compressMemory(memory) {
    return `
Level: ${memory.level}
Sessions: ${memory.sessionsCompleted}
Focus areas: ${memory.weakAreas.join(", ") || "general"}
Streak: ${memory.streak} days
Summary: Student responds well to correction + repetition loops
    `.trim();
  }

  // ────────────────────────── OBI PROMPT ENGINE ──────────────────────────

  /**
   * Build AI prompt with OBI personality + student memory
   */
  buildPrompt(memory, message) {
    const systemPrompt = `
You are OBI, an English learning accountability coach.

Rules:
- Always correct mistakes FIRST
- Force repetition when needed
- Keep student accountable
- Track weak patterns
- Be strict but supportive
- Never skip correction

Student State:
Level: ${memory.level}
Weak areas: ${memory.weakAreas.join(", ") || "general"}
Sessions: ${memory.sessionsCompleted}

Last summary: ${memory.summary}

Current instruction:
1. Read what they wrote
2. Correct it immediately
3. Explain the rule
4. Give them a repeat exercise
5. Motivate them to practice daily

Be direct. Don't waste words.
    `.trim();

    return [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: message
      }
    ];
  }

  // ────────────────────────── EVENT LOGGING (Light Ledger v1) ──────────────────────────

  /**
   * Log events for later analysis (Daily, Weekly, Monthly)
   * Not full ledger yet, just activity tracking
   */
  async logEvent(type, data) {
    const logs = (await this.state.storage.get("logs")) || [];

    logs.push({
      type,
      data,
      ts: Date.now()
    });

    // Keep only last 500 events (MVP safe, ~1 month of activity)
    if (logs.length > 500) {
      logs.shift();
    }

    await this.state.storage.put("logs", logs);
  }

  // ────────────────────────── HELPER FUNCTIONS ──────────────────────────

  getNextLevel(currentLevel) {
    const levels = ["A1", "A2", "B1", "B2", "C1"];
    const idx = levels.indexOf(currentLevel);
    return idx < levels.length - 1 ? levels[idx + 1] : currentLevel;
  }
}
