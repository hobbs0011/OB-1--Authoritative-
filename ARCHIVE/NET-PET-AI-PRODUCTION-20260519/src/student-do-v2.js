/**
 * StudentDO v2 â€” Durable Object with OBI Integration
 * Implements full 5-layer continuity system + Mouseâ†’Tiger scoring
 */

import { SessionLogger } from './session-logger.js';
import { buildContext, generateNextAction } from './context-builder.js';
import { OBI_SYSTEM_PROMPT_V2, OBI_RULES } from './obi-prompt-v2.js';
import { MouseTigerScorer } from './mouse-tiger-scorer.js';

export class StudentDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.logger = new SessionLogger(state.storage);
    this.scorer = new MouseTigerScorer(state.storage);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/chat") return this.handleChat(request);
    if (url.pathname === "/daily") return this.handleDaily();
    if (url.pathname === "/progress") return this.handleProgress();
    if (url.pathname === "/state") return this.getState();
    if (url.pathname === "/sessions") return this.getSessions();

    // NEW: Accountability routes
    if (url.pathname === "/accountability/register") return this.registerAccountabilityNode(request);
    if (url.pathname === "/accountability/list") return this.listAccountabilityNodes();
    if (url.pathname === "/accountability/dashboard") return this.getAccountabilityDashboard(request);

    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  /**
   * â•â•â• OBI v2 INTEGRATED CHAT (All 5 Layers) + MOUSEâ†’TIGER â•â•â•
   */
  async handleChat(request) {
    const { message } = await request.json();
    const studentId = this.state.id.toString();
    const startTime = performance.now();

    try {
      // LAYER 2: Load Student State
      const memory = await this.getMemory();

      // NEW: SCORE MOUSEâ†’TIGER (Behavioral layer)
      const lastSession = await this.logger.getHistory(1);
      const mt_score = await this.scorer.computeMouseTigerScore(message, {
        responseTime: performance.now() - startTime,
        level: memory.level,
        lastSession: lastSession[0] ? {
          lastTopics: lastSession[0].topic ? [lastSession[0].topic] : [],
          weakPatterns: memory.weakAreas,
          previousMistakes: memory.recentMistakes || []
        } : null,
        studentId
      });

      // NEW: Generate behavioral trigger for OBI
      const behavioralTrigger = await this.scorer.generateBehavioralTrigger(
        mt_score.composite,
        mt_score.breakdown
      );

      // Store score for trend
      await this.scorer.storeScore(studentId, mt_score.composite);

      // LAYER 3: Build Context (memory assembly)
      const context = await buildContext(this.env, studentId, message);

      // LAYER 4: OBI System Prompt with memory + behavioral trigger
      const systemPrompt = `${OBI_SYSTEM_PROMPT_V2}

STUDENT CONTEXT:
- Level: ${memory.level}
- Weak areas: ${memory.weakAreas.join(", ") || "none yet"}
- Sessions: ${memory.sessionsCompleted}
- Streak: ${memory.streak} days
- Recent focus: ${context.weakPatterns.slice(0, 2).join(", ") || "general"}

BEHAVIORAL PROFILE (MOUSEâ†’TIGER):
- Mode: ${mt_score.mode.mode} ${mt_score.mode.emoji}
- Confidence: ${mt_score.breakdown.confidence}/100
- Volume: ${mt_score.breakdown.volume}/100
- OBI Vibe: ${behavioralTrigger.obi_vibe}
- Operating Temperature: ${behavioralTrigger.operatingTemperature}/5

INSTRUCTIONS FOR THIS RESPONSE:
${behavioralTrigger.instructions.map(i => `- ${i}`).join('\n')}

${mt_score.mode.mode === 'TIGER' ? 'Tone: Confident, peer-level, no handholding' : mt_score.mode.mode === 'CUB' ? 'Tone: Light sarcastic challenge' : 'Tone: Encouraging, permission-based, celebrate attempts'}

CONTINUITY RULE:
Student has completed ${memory.sessionsCompleted} sessions. 
${memory.sessionsCompleted > 0 ? "Reference previous work patterns." : "First session: establish baseline."}`;

      // LAYER 1 + 4: AI Response with OBI rules + behavioral trigger
      let aiResponse;
      try {
        const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.env.DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "deepseek-v4-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            temperature: 0.3,
            max_tokens: 600
          })
        });

        const data = await res.json();
        aiResponse = data.choices?.[0]?.message?.content || "Unable to process";
      } catch (err) {
        console.error("AI call failed:", err);
        aiResponse = "Connection issue. Please try again.";
        return new Response(JSON.stringify({ error: "AI service unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Extract mistakes
      const mistakes = this.extractMistakes(message, aiResponse);

      // Generate next action (deterministic)
      const nextAction = generateNextAction(context, mistakes.length);

      // LAYER 1: Event Sourcing â€” log session
      const sessionEntry = await this.logger.logSession({
        studentId,
        input: message,
        correction: aiResponse,
        topic: "conversational",
        mistakes: mistakes,
        weakPatterns: context.weakPatterns,
        nextAction: nextAction,
        continuityScore: context.continuityScore,
        driftScore: context.driftScore,
        accountabilityTriggered: context.mustInvolveAccountability
      });

      // Update state
      const updated = this.updateMemory(memory, mistakes.length);
      await this.state.storage.put("memory", updated);

      // Response
      return new Response(JSON.stringify({
        reply: aiResponse,
        nextAction: nextAction,
        memory: {
          level: updated.level,
          streak: updated.streak,
          weakAreas: updated.weakAreas,
          continuityScore: context.continuityScore
        },
        mouseTiger: {
          score: mt_score.composite,
          mode: mt_score.mode.mode,
          emoji: mt_score.mode.emoji,
          breakdown: mt_score.breakdown,
          trend: mt_score.trend,
          vibe: behavioralTrigger.obi_vibe
        },
        sessionId: sessionEntry.id
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      console.error("Chat error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  /**
   * Daily Task (references weak patterns)
   */
  async handleDaily() {
    const memory = await this.getMemory();
    const weakHistory = await this.logger.getWeakPatterns();

    return new Response(JSON.stringify({
      type: "speaking",
      prompt: "Describe your day using complete sentences",
      focus: weakHistory.length > 0 ? `Focus on: ${weakHistory[0][0]}` : "General fluency",
      duration: 15,
      sessionContext: `This is session #${memory.sessionsCompleted + 1}. Build on previous learning.`
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  /**
   * Progress Summary
   */
  async handleProgress() {
    const memory = await this.getMemory();
    const history = await this.logger.getHistory(30);
    const weakPatterns = await this.logger.getWeakPatterns();

    return new Response(JSON.stringify({
      level: memory.level,
      streak: memory.streak,
      sessionsCompleted: memory.sessionsCompleted,
      weakAreas: memory.weakAreas,
      topWeaknesses: weakPatterns.slice(0, 3),
      recentSessions: history.length,
      lastActive: new Date(memory.lastActive).toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  /**
   * Get current state (for context builder)
   */
  async getState() {
    const memory = await this.getMemory();
    return new Response(JSON.stringify(memory), {
      headers: { "Content-Type": "application/json" }
    });
  }

  /**
   * Get sessions (for context builder)
   */
  async getSessions() {
    const history = await this.logger.getHistory(20);
    return new Response(JSON.stringify({
      history: history,
      count: history.length
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MEMORY MANAGEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getMemory() {
    return (
      (await this.state.storage.get("memory")) || {
        studentId: this.state.id.toString(),
        level: "A1",
        streak: 0,
        sessionsCompleted: 0,
        weakAreas: [],
        lastActive: Date.now()
      }
    );
  }

  updateMemory(memory, mistakeCount) {
    memory.sessionsCompleted = (memory.sessionsCompleted || 0) + 1;
    memory.lastActive = Date.now();

    // Streak logic
    if (mistakeCount === 0) {
      memory.streak = (memory.streak || 0) + 1;
    } else if (mistakeCount > 3) {
      memory.streak = 0;
    }

    return memory;
  }

  extractMistakes(input, output) {
    const mistakes = [];
    if (output.includes("tense") || output.includes("past")) mistakes.push("tense");
    if (output.includes("article")) mistakes.push("articles");
    if (output.includes("pronoun")) mistakes.push("pronouns");
    return mistakes.slice(0, 3);
  }

  /**
   * ACCOUNTABILITY NETWORK METHODS
   */
  async registerAccountabilityNode(request) {
    const { nodeType, contact, frequency } = await request.json();
    const studentId = this.state.id.toString();

    const nodeId = crypto.randomUUID();
    const node = {
      id: nodeId,
      studentId,
      type: nodeType,
      contact,
      frequency: frequency || "weekly",
      createdAt: Date.now(),
      status: "ACTIVE"
    };

    await this.state.storage.put(`accountability:${nodeId}`, node);

    const nodeList = await this.state.storage.get(`accountability_nodes:${studentId}`) || [];
    nodeList.push(nodeId);
    await this.state.storage.put(`accountability_nodes:${studentId}`, nodeList);

    return new Response(JSON.stringify({ ok: true, node }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  }

  async listAccountabilityNodes() {
    const studentId = this.state.id.toString();
    const nodeIds = await this.state.storage.get(`accountability_nodes:${studentId}`) || [];
    const nodes = [];

    for (const nodeId of nodeIds) {
      const node = await this.state.storage.get(`accountability:${nodeId}`);
      if (node) nodes.push(node);
    }

    return new Response(JSON.stringify({ nodes }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  async getAccountabilityDashboard(request) {
    const url = new URL(request.url);
    const nodeType = url.searchParams.get("nodeType");
    const studentId = this.state.id.toString();

    const memory = await this.getMemory();
    const sessions = await this.getSessions();

    if (nodeType === "parent") {
      return new Response(JSON.stringify({
        studentName: studentId,
        level: memory.level,
        sessionsThisWeek: sessions.filter(s => s.timestamp > Date.now() - 604800000).length,
        streak: memory.streak,
        weakAreas: memory.weakAreas,
        nextMilestone: `Target: ${memory.level === "A1" ? "A2" : "B1"}`
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (nodeType === "boss") {
      return new Response(JSON.stringify({
        employeeName: studentId,
        speakingLevel: memory.level,
        learningConsistency: Math.round((sessions.length / 30) * 100),
        communicationReadiness: memory.level >= "B1" ? "READY" : "DEVELOPING"
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (nodeType === "self") {
      return new Response(JSON.stringify({
        myLevel: memory.level,
        myStreak: memory.streak,
        dailyGoal: "1 session (10 min)",
        focusArea: memory.weakAreas[0] || "speaking"
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid nodeType" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
}


