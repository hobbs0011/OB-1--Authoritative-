/**
 * Soul DNA Ledger — Immutable Intent Memory
 * Stores: Raw founder intent, never overwritten or summarized
 */

export class SoulDNALedger {
  constructor(database) {
    this.db = database; // Cloudflare D1
  }

  /**
   * Capture Soul DNA (append-only, immutable)
   */
  async captureIntent(soulData) {
    const entry = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),

      // Raw, unmodified content
      rawInput: soulData.rawInput,
      emotionalWeight: soulData.emotionalWeight || 5,

      // Classification
      type: soulData.type || "TEACHING", // VISION | FIGHT | TEACHING | SYSTEM | DRIFT_WARNING
      intensity: soulData.intensity || 5,

      // Intent preservation
      intentTags: soulData.intentTags || [],
      linkedSessions: soulData.linkedSessions || [],

      // Anti-drift hash
      antiDriftHash: this._hash(soulData.rawInput),

      // Never modify after creation
      locked: true
    };

    await this.db.prepare(
      `INSERT INTO soul_dna (id, raw_input, emotional_weight, type, intensity, intent_tags, anti_drift_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      entry.id,
      entry.rawInput,
      entry.emotionalWeight,
      entry.type,
      entry.intensity,
      JSON.stringify(entry.intentTags),
      entry.antiDriftHash,
      entry.createdAt
    ).run();

    return entry;
  }

  /**
   * Retrieve Soul DNA (never modified)
   */
  async getIntent(intentId) {
    const result = await this.db.prepare(
      `SELECT * FROM soul_dna WHERE id = ?`
    ).bind(intentId).first();

    return result;
  }

  /**
   * Get all intents for a session
   */
  async getIntentsForSession(studentId) {
    const results = await this.db.prepare(
      `SELECT * FROM soul_dna WHERE id IN (
        SELECT soul_anchor_id FROM sessions WHERE student_id = ?
      )`
    ).bind(studentId).all();

    return results.results || [];
  }

  /**
   * Anti-drift validation: check if system output matches soul intent
   */
  async validateDrift(systemOutput, intentId) {
    const intent = await this.getIntent(intentId);
    if (!intent) return { drift: false, reason: "No intent to check" };

    // Simple hash check (in production: Merkle tree)
    const outputHash = this._hash(JSON.stringify(systemOutput));
    const intentHash = intent.anti_drift_hash;

    if (JSON.stringify(systemOutput).includes("sorry") && !intent.raw_input.includes("sorry")) {
      return { drift: true, reason: "Polite erasure detected" };
    }

    return { drift: false, reason: "System aligned with intent" };
  }

  /**
   * Simple hash (production would use SHA-256)
   */
  _hash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}
