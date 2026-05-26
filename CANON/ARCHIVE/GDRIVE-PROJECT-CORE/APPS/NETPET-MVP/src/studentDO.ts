// Durable Object: Per-Student Brain
// Maintains state, memory, and correction loop

import { StudentMemory, ErrorRecord, ChatMessage, DailyTask, AIResponse, ProgressReport } from "../types";
import { buildObiPrompt } from "./obiPrompt";

export class StudentDO {
  state: DurableObjectState;
  env: Env;
  memory_key = "student_memory";
  events_key = "session_events";

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/chat") return await this.handleChat(request);
      if (url.pathname === "/daily") return await this.handleDaily(request);
      if (url.pathname === "/progress") return await this.handleProgress(request);
      if (url.pathname === "/init") return await this.handleInit(request);

      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error("StudentDO error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  // =========== CHAT LOOP (CORE LEARNING ENGINE) ===========
  async handleChat(request: Request): Promise<Response> {
    const { message, language = "en" } = await request.json();

    // 1. LOAD STUDENT STATE
    const memory = await this.getMemory();
    const session_id = this.generateSessionId();

    // 2. BUILD OBI PROMPT (with memory context)
    const prompt = buildObiPrompt(memory, message);

    // 3. CALL AI MODEL
    const aiResponse = await this.callAI(prompt);

    if (!aiResponse) {
      return new Response(JSON.stringify({ error: "AI call failed" }), { status: 500 });
    }

    // 4. EXTRACT CORRECTIONS FROM AI RESPONSE
    const corrections = this.extractCorrections(message, aiResponse, session_id);

    // 5. UPDATE MEMORY
    const updated = this.updateMemoryFromChat(memory, corrections);

    // 6. PERSIST
    await this.state.storage.put(this.memory_key, updated);
    await this.logEvent(session_id, "chat", {
      message,
      corrections: corrections.length,
      memory_updated: true,
    });

    // 7. RETURN RESPONSE
    const response: AIResponse = {
      reply: aiResponse,
      corrections: corrections,
      next_focus: updated.weak_phonemes[0] || "general fluency",
      streak_updated: this.isStreakUpdated(memory, updated),
      new_streak_count: updated.daily_streak,
    };

    return Response.json(response);
  }

  // =========== DAILY TASK GENERATOR ===========
  async handleDaily(request: Request): Promise<Response> {
    const memory = await this.getMemory();
    const session_id = this.generateSessionId();

    // Select task type based on performance
    const taskType = this.selectTaskType(memory);
    const prompt = this.generateDailyPrompt(memory, taskType);

    const task: DailyTask = {
      type: taskType,
      prompt: prompt,
      focus_area: memory.weak_phonemes[0] || "general speaking",
      difficulty: this.assessDifficulty(memory),
      duration_minutes: 15,
      weak_areas_target: memory.weak_phonemes.slice(0, 3),
    };

    await this.logEvent(session_id, "daily_task", task);

    return Response.json(task);
  }

  // =========== PROGRESS TRACKING ===========
  async handleProgress(request: Request): Promise<Response> {
    const memory = await this.getMemory();

    const report: ProgressReport = {
      daily_active: this.isActiveToday(memory),
      session_count: memory.total_sessions,
      streak: memory.daily_streak,
      weak_phonemes: memory.weak_phonemes,
      improvement_areas: this.getImprovementAreas(memory),
      retention_score: memory.retention_score,
    };

    return Response.json(report);
  }

  // =========== INITIALIZATION ===========
  async handleInit(request: Request): Promise<Response> {
    const { student_id, level = "A1" } = await request.json();

    const newMemory: StudentMemory = {
      student_id,
      level,
      daily_streak: 0,
      last_session_timestamp: Date.now(),
      weak_phonemes: ["θ", "ð", "ŋ", "ɪ"],
      recent_errors: [],
      memory_summary: "New student, needs foundational assessment",
      retention_score: 0.0,
      total_sessions: 0,
      joined_date: Date.now(),
    };

    await this.state.storage.put(this.memory_key, newMemory);
    await this.logEvent(this.generateSessionId(), "init", { student_id, level });

    return Response.json({ status: "initialized", memory: newMemory });
  }

  // =========== HELPER: AI CALL ===========
  private async callAI(prompt: ChatMessage[]): Promise<string> {
    const apiKey = this.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-mini",
        messages: prompt,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || null;
  }

  // =========== HELPER: EXTRACT CORRECTIONS ===========
  private extractCorrections(input: string, aiResponse: string, session_id: string): ErrorRecord[] {
    const corrections: ErrorRecord[] = [];

    // Simple heuristic: if AI provides corrections, extract them
    const lines = aiResponse.split("\n");
    for (const line of lines) {
      if (line.includes("should be") || line.includes("correct")) {
        corrections.push({
          input: input,
          correction: line,
          mistake_type: "pronunciation",
          timestamp: Date.now(),
          session_id,
        });
      }
    }

    return corrections;
  }

  // =========== HELPER: UPDATE MEMORY ===========
  private updateMemoryFromChat(memory: StudentMemory, corrections: ErrorRecord[]): StudentMemory {
    // Add corrections to recent errors
    memory.recent_errors = [...memory.recent_errors, ...corrections].slice(-50);

    // Update weak phonemes based on error patterns
    const phonemeCount: Record<string, number> = {};
    for (const err of memory.recent_errors.slice(-20)) {
      if (err.mistake_type === "phoneme") {
        phonemeCount[err.input] = (phonemeCount[err.input] || 0) + 1;
      }
    }

    // Keep top 3-5 weak areas
    memory.weak_phonemes = Object.entries(phonemeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phoneme]) => phoneme);

    // Update summary
    memory.memory_summary = `Student has practiced ${memory.total_sessions} sessions. Main focus areas: ${memory.weak_phonemes.join(", ")}`;

    // Update retention score (0-1 scale)
    memory.retention_score = Math.min(1, memory.daily_streak / 30);

    return memory;
  }

  // =========== HELPER: SELECT TASK TYPE ===========
  private selectTaskType(memory: StudentMemory): DailyTask["type"] {
    const types: Array<DailyTask["type"]> = ["speaking", "listening", "correction", "writing"];
    const index = memory.total_sessions % types.length;
    return types[index];
  }

  // =========== HELPER: GENERATE DAILY PROMPT ===========
  private generateDailyPrompt(memory: StudentMemory, taskType: DailyTask["type"]): string {
    const prompts = {
      speaking: `Speak about your day for 2 minutes, focusing on ${memory.weak_phonemes[0] || "clear pronunciation"}.`,
      listening: `Listen to the audio and repeat, paying attention to ${memory.weak_phonemes[0] || "pronunciation"}.`,
      writing: `Write 3-5 sentences about your favorite hobby, using past tense.`,
      correction: `Read this sentence and correct the pronunciation errors: "The teacher thinks there's three students."`,
    };
    return prompts[taskType] || prompts.speaking;
  }

  // =========== HELPER: ASSESS DIFFICULTY ===========
  private assessDifficulty(memory: StudentMemory): DailyTask["difficulty"] {
    if (memory.retention_score < 0.3) return "easy";
    if (memory.retention_score < 0.6) return "medium";
    return "hard";
  }

  // =========== HELPER: IS STREAK UPDATED ===========
  private isStreakUpdated(old: StudentMemory, updated: StudentMemory): boolean {
    return updated.daily_streak > old.daily_streak;
  }

  // =========== HELPER: IS ACTIVE TODAY ===========
  private isActiveToday(memory: StudentMemory): boolean {
    const now = Date.now();
    const last = memory.last_session_timestamp;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return now - last < oneDayMs;
  }

  // =========== HELPER: GET IMPROVEMENT AREAS ===========
  private getImprovementAreas(memory: StudentMemory): string[] {
    return memory.weak_phonemes.slice(0, 3).map(p => `Improve ${p} pronunciation`);
  }

  // =========== HELPER: LOAD MEMORY ===========
  private async getMemory(): Promise<StudentMemory> {
    const stored = await this.state.storage.get<StudentMemory>(this.memory_key);
    return stored || this.defaultMemory();
  }

  // =========== HELPER: DEFAULT MEMORY ===========
  private defaultMemory(): StudentMemory {
    return {
      student_id: "unknown",
      level: "A1",
      daily_streak: 0,
      last_session_timestamp: Date.now(),
      weak_phonemes: ["θ", "ð"],
      recent_errors: [],
      memory_summary: "Initialized",
      retention_score: 0,
      total_sessions: 0,
      joined_date: Date.now(),
    };
  }

  // =========== HELPER: LOGGING ===========
  private async logEvent(session_id: string, event_type: string, data: any): Promise<void> {
    const events = (await this.state.storage.get<any[]>(this.events_key)) || [];
    events.push({
      session_id,
      event_type,
      timestamp: Date.now(),
      data,
    });
    // Keep only last 1000 events
    await this.state.storage.put(this.events_key, events.slice(-1000));
  }

  // =========== HELPER: GENERATE SESSION ID ===========
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
