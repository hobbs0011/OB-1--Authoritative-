/**
 * Session Logger — Event Sourcing
 * Implements: Append-only session log with Soul DNA anchoring
 */

export class SessionLogger {
  constructor(doStorage) {
    this.storage = doStorage;
  }

  /**
   * Log a session event (append-only)
   */
  async logSession(session) {
    const log = {
      id: crypto.randomUUID(),
      studentId: session.studentId,
      createdAt: Date.now(),

      // Input/Output
      input: session.input,
      correction: session.correction,

      // Learning Data
      topic: session.topic || "conversational",
      mistakes: session.mistakes || [],
      weakPatterns: session.weakPatterns || [],

      // OBI Output
      nextAction: session.nextAction,
      continuityScore: session.continuityScore,
      driftScore: session.driftScore,

      // Accountability
      accountabilityTriggered: session.accountabilityTriggered || false,

      // Soul DNA anchor (link to founder intent if exists)
      soulAnchorId: session.soulAnchorId || null
    };

    // Append to logs
    const logs = (await this.storage.get("session_logs")) || [];
    logs.push(log);

    // Keep only last 200 sessions (MVP safe limit)
    if (logs.length > 200) {
      logs.shift();
    }

    await this.storage.put("session_logs", logs);
    return log;
  }

  /**
   * Get session history
   */
  async getHistory(limit = 20) {
    const logs = (await this.storage.get("session_logs")) || [];
    return logs.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Get weak patterns over time
   */
  async getWeakPatterns() {
    const logs = (await this.storage.get("session_logs")) || [];
    const patterns = {};

    logs.forEach(log => {
      log.weakPatterns?.forEach(pattern => {
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      });
    });

    return Object.entries(patterns)
      .sort((a, b) => b[1] - a[1]);
  }

  /**
   * Compress memory (from N sessions → summary)
   */
  async compressMemory() {
    const logs = (await this.storage.get("session_logs")) || [];
    const patterns = await this.getWeakPatterns();

    const summary = {
      totalSessions: logs.length,
      weakPatterns: patterns.slice(0, 3),
      averageContinuityScore: logs.length > 0
        ? Math.round(logs.reduce((sum, l) => sum + (l.continuityScore || 0), 0) / logs.length)
        : 0,
      lastActive: logs[logs.length - 1]?.createdAt || null,
      compressedAt: Date.now()
    };

    return summary;
  }
}
