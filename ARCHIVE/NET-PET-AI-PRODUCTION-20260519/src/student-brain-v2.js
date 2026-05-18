/**
 * STUDENT BRAIN v2 (RETENTION-HARDENED)
 * ─────────────────────────────────────────────────────────────
 * Durable Object per student
 * Combines: memory + retention tracking + streak system + escalation flags
 * 
 * This is your core product primitive. Do NOT over-architect this.
 * Keep it simple. Keep it fast.
 */

import { RetentionEngineV1 } from "./retention-engine-v1.js";
import { buildSystemPrompt, buildUserPrompt, parseAIResponse } from "./prompt-builder-complete.js";

export class StudentBrainV2 {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  /**
   * Main fetch handler: routes to appropriate handler
   */
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/chat") return this.handleChat(request);
    if (path === "/state") return this.getState();
    if (path === "/retention-check") return this.checkRetention();
    if (path === "/reset") return this.resetState();

    return new Response("Not Found", { status: 404 });
  }

  /**
   * LOAD MEMORY: Get or initialize student memory
   */
  async getMemory() {
    return (
      (await this.state.storage.get("memory")) || {
        // Identity
        student_id: null,
        level: "A1",
        created_at: Date.now(),

        // Learning state
        weak_phonemes: [],
        recent_errors: [],
        session_count: 0,

        // Retention + Accountability
        streak: 0,
        last_active: Date.now(),
        inactive_since: null,
        attention_required: false,
        escalation_level: 0,

        // Summary for AI context
        summary: "New student. No behavioral pattern yet.",
      }
    );
  }

  /**
   * SAVE MEMORY: Persist to Durable Object storage
   */
  async saveMemory(memory) {
    await this.state.storage.put("memory", memory);
  }

  /**
   * PRIMARY LOOP: /chat handler
   * This runs on every student interaction
   */
  async handleChat(request) {
    try {
      const { message } = await request.json();

      let memory = await this.getMemory();

      // ─ RETENTION ENGINE: Update active status (THIS IS CRITICAL)
      const retention = new RetentionEngineV1(memory);
      retention.updateActive(); // Mark as active NOW
      memory = Object.assign({}, memory, retention.memory); // Sync retention state (immutable update

      // ─ LEARNING LAYER: Detect mistakes
      const mistakes = this.detectMistakes(message);
      if (mistakes.length > 0) {
        memory.recent_errors.push(...mistakes);
        memory.recent_errors = memory.recent_errors.slice(-10); // Keep last 10
      }

      // Update session
      memory.session_count++;
      memory.summary = this.generateSummary(memory);

      // Save immediately
      await this.saveMemory(memory);

      // ─ AI GENERATION: Build OBI response
      const systemPrompt = buildSystemPrompt(memory);
      const userPrompt = buildUserPrompt(message, memory);
      const aiResponse = await this.callAI([{role: 'system', content: systemPrompt}, {role: 'user', content: userPrompt}]);

      // ─ RETURN RESPONSE + STATE
      return Response.json({
        reply: aiResponse,
        memory,
        retention: {
          streak: memory.streak,
          needs_attention: memory.attention_required,
          escalation_level: memory.escalation_level,
        },
      });
    } catch (err) {
      console.error("[StudentBrain] Chat error:", err);
      return Response.json(
        { error: "Chat processing failed", details: err.message },
        { status: 500 }
      );
    }
  }

  /**
   * RETENTION CHECK: Triggered by cron job
   * Returns: escalation level, needs_attention flag, and suggested action
   */
  async checkRetention() {
    let studentMemory = await this.getMemory();
    const retention = new RetentionEngineV1(studentMemory);
    const result = retention.checkStreakDecay();

    // Update memory with new escalation state
    studentMemory = Object.assign({}, studentMemory, retention.memory);
    await this.saveMemory(studentMemory);

    return Response.json({
      retention_check_result: result,
      student_memory_snapshot: {
        streak: studentMemory.streak,
        attention_required: studentMemory.attention_required,
        escalation_level: studentMemory.escalation_level,
        last_active: studentMemory.last_active,
      },
      suggested_action: result.triggerZaloWebhook ? "SEND_ZALO_ALERT" : "NO_ACTION",
    });
  }

  /**
   * GET STATE: Return current student snapshot (for dashboard/analytics)
   */
  async getState() {
    const memory = await this.getMemory();
    const retention = new RetentionEngineV1(memory);
    const snapshot = retention.getRetentionSnapshot();

    return Response.json({
      memory,
      retention_snapshot: snapshot,
    });
  }

  /**
   * RESET STATE: For testing or refunds
   */
  async resetState() {
    await this.state.storage.delete("memory");
    return Response.json({ status: "reset", message: "Student memory cleared" });
  }

  /**
   * MISTAKE DETECTION: Simple heuristics (MVP)
   * In production, this would be more sophisticated
   */
  detectMistakes(userMessage) {
    const mistakes = [];

    // Simple Jolly Phonics mapping
    if (userMessage.includes("think") && userMessage.includes("sink")) {
      mistakes.push({
        type: "phoneme_confusion",
        phoneme: "θ vs s",
        example: userMessage.slice(0, 50),
      });
    }

    if (userMessage.includes("the") && userMessage.includes("de")) {
      mistakes.push({
        type: "phoneme_confusion",
        phoneme: "ð vs d",
        example: userMessage.slice(0, 50),
      });
    }

    // Grammar patterns
    if (userMessage.match(/i\s+(am|is|are)\s+\w+\s+(go|is|do)/i)) {
      mistakes.push({
        type: "tense_error",
        pattern: "present simple/continuous mix",
        example: userMessage.slice(0, 50),
      });
    }

    return mistakes;
  }

  /**
   * SUMMARY GENERATION: Compression for AI context window
   * Keep this lightweight—it's what the LLM sees in every prompt
   */
  generateSummary(memory) {
    const weakPhonemes = memory.weak_phonemes.slice(-5).join(", ") || "none identified";
    const recentErrors =
      memory.recent_errors
        .slice(-3)
        .map((e) => e.type)
        .join("; ") || "none";

    const retentionStatus =
      memory.streak > 7
        ? "Strong streak"
        : memory.streak > 0
          ? "Active but inconsistent"
          : "New or recovering";

    return `Student: ${memory.level} | Streak: ${memory.streak} days (${retentionStatus}) | Weak phonemes: ${weakPhonemes} | Recent errors: ${recentErrors} | Sessions: ${memory.session_count}`;
  }

  /**
   * AI CALL: Invoke OpenAI/Claude/DeepSeek
   * This should be injected via env variables
   */
  async callAI(prompt) {
    const apiKey = this.env.OPENAI_API_KEY || this.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return "OBI error: No AI API key configured. Contact admin.";
    }

    try {
      // Example: OpenAI
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: prompt,
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[AI] API error:", data);
        return "OBI error: AI service unavailable. Try again.";
      }

      return data.choices[0].message.content;
    } catch (err) {
      console.error("[StudentBrain] AI call error:", err);
      return "OBI error: Network issue. Try again.";
    }
  }
}

/**
 * DURABLE OBJECT REGISTRATION (in wrangler.toml):
 * 
 * [[durable_objects.bindings]]
 * name = "STUDENT_BRAIN"
 * class_name = "StudentBrainV2"
 * 
 * [[migrations]]
 * tag = "retention_v1"
 * new_classes = ["StudentBrainV2"]
 */
