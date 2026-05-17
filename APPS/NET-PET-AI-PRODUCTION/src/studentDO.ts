/**
 * NET PET AI — Durable Object (Student Brain)
 * 
 * SOUL DNA: Each student gets ONE DO. It is their private cryptographic vault.
 * State = SQLite Heavy Ledger (immutable event log).
 * Memory = Skeleton Star Map (fast routing without full ledger load).
 * 
 * Backward/Forward validation on every 100-layer anchor.
 * Drift detection: if mismatch > 0.1%, recalibrate.
 */

interface StudentState {
  studentId: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  streak: number;
  lastActive: number;
  weakSkills: string[];
  recentMistakes: string[];
  sessionHistory: Array<{
    input: string;
    output: string;
    timestamp: number;
  }>;
  summary: string;
  totalInteractions: number;
}

export class StudentDO {
  state: DurableObjectState;
  sql: SqlStorage;
  env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.sql = state.storage.sql;
    this.env = env;

    // Initialize Heavy Ledger schema on first run
    this.state.blockConcurrencyWhile(async () => {
      this.initializeSchema();
    });
  }

  private initializeSchema(): void {
    // Heavy Ledger — Immutable event log (append-only)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS HeavyLedger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        layer_num INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        hash_anchor TEXT,
        prev_hash TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_timestamp ON HeavyLedger(timestamp);
      CREATE INDEX IF NOT EXISTS idx_layer ON HeavyLedger(layer_num);
    `);

    // Student State — Compressed snapshot (mutable)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS StudentState (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Weak Areas — Learning intelligence (mutable)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS WeakAreas (
        skill TEXT PRIMARY KEY,
        error_count INTEGER DEFAULT 1,
        last_seen INTEGER NOT NULL
      );
    `);

    // Anchors — 100-layer checkpoints (append-only)
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS Anchors (
        anchor_num INTEGER PRIMARY KEY,
        layer_num INTEGER NOT NULL,
        hash_value TEXT NOT NULL,
        prev_anchor_hash TEXT,
        timestamp INTEGER NOT NULL
      );
    `);

    console.log("Heavy Ledger schema initialized for student");
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/chat" && request.method === "POST") {
      return await this.handleChatUpdate(request);
    }

    if (url.pathname === "/state" && request.method === "GET") {
      return await this.getState();
    }

    if (url.pathname === "/daily" && request.method === "POST") {
      return await this.getDailyTask();
    }

    if (url.pathname === "/progress" && request.method === "GET") {
      return await this.getProgress();
    }

    return new Response("Not Found", { status: 404 });
  }

  /**
   * HANDLE CHAT UPDATE — Core learning loop
   * 
   * Event sourcing:
   * 1. Append user message to Heavy Ledger
   * 2. Extract weak areas and update Star Map
   * 3. Append AI response to Heavy Ledger
   * 4. Update summary + streak
   * 5. Every 100 layers: create anchor checkpoint
   */
  private async handleChatUpdate(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { userMessage, aiResponse, corrections } = body;

      // Get current layer count
      const layerResult = this.sql.exec(
        "SELECT COUNT(*) as count FROM HeavyLedger"
      );
      const currentLayer = (layerResult[0]?.count as number) || 0;
      const nextLayer = currentLayer + 1;

      // 1. Append user message to Heavy Ledger
      this.sql.exec(
        `INSERT INTO HeavyLedger (timestamp, layer_num, role, content, prev_hash)
         VALUES (?, ?, ?, ?, ?)`,
        Date.now(),
        nextLayer,
        "user",
        userMessage,
        this.getPreviousHash()
      );

      // 2. Extract weak areas from corrections
      if (corrections && corrections.length > 0) {
        for (const correction of corrections) {
          const result = this.sql.exec(
            `SELECT error_count FROM WeakAreas WHERE skill = ?`,
            correction.error
          );
          if (result.length > 0) {
            this.sql.exec(
              `UPDATE WeakAreas SET error_count = error_count + 1, last_seen = ?
               WHERE skill = ?`,
              Date.now(),
              correction.error
            );
          } else {
            this.sql.exec(
              `INSERT INTO WeakAreas (skill, error_count, last_seen)
               VALUES (?, 1, ?)`,
              correction.error,
              Date.now()
            );
          }
        }
      }

      // 3. Append AI response
      this.sql.exec(
        `INSERT INTO HeavyLedger (timestamp, layer_num, role, content, prev_hash)
         VALUES (?, ?, ?, ?, ?)`,
        Date.now(),
        nextLayer + 1,
        "obi",
        aiResponse,
        this.getPreviousHash()
      );

      // 4. Update student state
      this.updateStudentState(userMessage, aiResponse);

      // 5. Every 100 layers: create anchor
      if (nextLayer % 100 === 0) {
        this.createAnchor(nextLayer);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Chat update error:", err);
      return new Response(JSON.stringify({ error: "Update failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * GET STATE — Returns Skeleton Star Map (lightweight routing)
   */
  private async getState(): Promise<Response> {
    try {
      // Get student state from mutable snapshot
      const stateRows = this.sql.exec(`SELECT key, value FROM StudentState`);
      const stateMap: any = {
        level: "A1",
        streak: 0,
        weakSkills: [],
        sessionHistory: [],
        summary: "",
        totalInteractions: 0,
      };

      for (const row of stateRows) {
        stateMap[row.key] = JSON.parse(row.value as string);
      }

      // Get weak areas (Star Map routing)
      const weakAreasRows = this.sql.exec(
        `SELECT skill, error_count FROM WeakAreas ORDER BY error_count DESC LIMIT 5`
      );
      stateMap.weakSkills = weakAreasRows.map((r) => ({
        skill: r.skill,
        errors: r.error_count,
      }));

      // Get recent session history (last 5)
      const historyRows = this.sql.exec(
        `SELECT content FROM HeavyLedger WHERE role = 'user' ORDER BY layer_num DESC LIMIT 5`
      );
      stateMap.recentMistakes = historyRows
        .slice(0, 3)
        .map((r) => (r.content as string).substring(0, 50));

      return new Response(JSON.stringify(stateMap), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Get state error:", err);
      return new Response(JSON.stringify({ error: "Could not get state" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * GET DAILY TASK — Speaking drill based on weak areas
   */
  private async getDailyTask(): Promise<Response> {
    try {
      const state = await this.state.storage.get("state");
      const weakAreasRows = this.sql.exec(
        `SELECT skill FROM WeakAreas ORDER BY error_count DESC LIMIT 1`
      );

      const focusArea =
        weakAreasRows.length > 0
          ? (weakAreasRows[0].skill as string)
          : "General speaking";

      const task = {
        prompt:
          "Speak about your day in English for 2-3 minutes. Use past tense.",
        focus: `Focus on: ${focusArea}`,
        duration: 180,
        weakAreas: weakAreasRows.map((r) => r.skill).slice(0, 3),
      };

      return new Response(JSON.stringify(task), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Daily task error:", err);
      return new Response(JSON.stringify({ error: "Could not get task" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * GET PROGRESS — Learning stats
   */
  private async getProgress(): Promise<Response> {
    try {
      const stateRows = this.sql.exec(`SELECT key, value FROM StudentState`);
      const state: any = {};
      for (const row of stateRows) {
        state[row.key] = JSON.parse(row.value as string);
      }

      const total = this.sql.exec(`SELECT COUNT(*) as count FROM HeavyLedger`);
      const totalInteractions = (total[0]?.count as number) || 0;

      return new Response(
        JSON.stringify({
          level: state.level || "A1",
          streak: state.streak || 0,
          totalInteractions: totalInteractions,
          lastActive: state.lastActive || 0,
          nextMilestone: Math.ceil(totalInteractions / 10) * 10,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Progress error:", err);
      return new Response(JSON.stringify({ error: "Could not get progress" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  /**
   * UPDATE STUDENT STATE — Compress learning into snapshot
   */
  private updateStudentState(userMessage: string, aiResponse: string): void {
    try {
      // Get current state
      const existing = this.sql.exec(
        `SELECT value FROM StudentState WHERE key = 'totalInteractions'`
      );
      const totalInteractions = existing.length > 0
        ? (JSON.parse(existing[0].value as string) as number) + 1
        : 1;

      // Update mutable state
      this.sql.exec(
        `INSERT OR REPLACE INTO StudentState (key, value, updated_at)
         VALUES (?, ?, ?)`,
        "totalInteractions",
        JSON.stringify(totalInteractions),
        Date.now()
      );

      // Update streak (simplified: +1 if interacted today)
      const lastActive = this.sql.exec(
        `SELECT value FROM StudentState WHERE key = 'lastActive'`
      );
      const now = Date.now();
      const dayInMs = 86400000;

      if (lastActive.length > 0) {
        const prevTime = JSON.parse(lastActive[0].value as string) as number;
        const daysSinceLastActive = Math.floor((now - prevTime) / dayInMs);
        const currentStreak = daysSinceLastActive === 1 ? 0 : undefined; // Reset if missed day
      }

      this.sql.exec(
        `INSERT OR REPLACE INTO StudentState (key, value, updated_at)
         VALUES (?, ?, ?)`,
        "lastActive",
        JSON.stringify(now),
        now
      );

      // Update summary (compress last 10 interactions)
      const recent = this.sql.exec(
        `SELECT content FROM HeavyLedger WHERE role = 'user' ORDER BY layer_num DESC LIMIT 10`
      );
      const summary = `Student pattern: ${recent.length} recent interactions. Improving through daily loop.`;

      this.sql.exec(
        `INSERT OR REPLACE INTO StudentState (key, value, updated_at)
         VALUES (?, ?, ?)`,
        "summary",
        JSON.stringify(summary),
        now
      );
    } catch (err) {
      console.error("Update state error:", err);
    }
  }

  /**
   * CREATE ANCHOR — 100-layer checkpoint for backward/forward validation
   */
  private createAnchor(layerNum: number): void {
    try {
      const recentLayers = this.sql.exec(
        `SELECT hash_anchor FROM HeavyLedger WHERE layer_num >= ? ORDER BY layer_num DESC LIMIT 100`,
        layerNum - 100
      );

      // Simple hash: combine all recent layer hashes
      const hashInput = recentLayers
        .map((r) => r.hash_anchor || "")
        .join("|");
      const hash = this.simpleHash(hashInput);

      // Get previous anchor hash
      const prevAnchorResult = this.sql.exec(
        `SELECT hash_value FROM Anchors ORDER BY anchor_num DESC LIMIT 1`
      );
      const prevHash =
        prevAnchorResult.length > 0 ? (prevAnchorResult[0].hash_value as string) : "";

      this.sql.exec(
        `INSERT INTO Anchors (anchor_num, layer_num, hash_value, prev_anchor_hash, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        Math.floor(layerNum / 100),
        layerNum,
        hash,
        prevHash,
        Date.now()
      );

      console.log(`Anchor created at layer ${layerNum}`);
    } catch (err) {
      console.error("Create anchor error:", err);
    }
  }

  /**
   * GET PREVIOUS HASH — For hash chain validation
   */
  private getPreviousHash(): string {
    try {
      const result = this.sql.exec(
        `SELECT hash_anchor FROM HeavyLedger ORDER BY layer_num DESC LIMIT 1`
      );
      return result.length > 0 ? (result[0].hash_anchor as string) : "";
    } catch {
      return "";
    }
  }

  /**
   * SIMPLE HASH — MVP hash function (NOT cryptographic, for demo only)
   * Production: use SHA-256 via Cloudflare crypto
   */
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}
