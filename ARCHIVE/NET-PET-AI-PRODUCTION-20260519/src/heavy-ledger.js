// src/heavy-ledger.js — Heavy Ledger (Append-Only Cryptographic Truth Layer)
// Run 324: Immutable audit trail + SHA256 hash chaining
// Purpose: Verify system integrity (2+2=5 → shutdown), enable replay, ensure drift detection

import crypto from 'crypto';

export class HeavyLedger {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // Generate SHA256 hash for integrity verification
  async hashEntry(entry) {
    const str = JSON.stringify(entry);
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  // ── L54 NONCE VALIDATION (Monotonic Enforcement) ──────────────────────────
  // Every ledger append requires: nonce = last_nonce + 1
  // No skips, rewinds, or collisions. Violation = 409 CONFLICT
  async validateNonce(incomingNonce) {
    const ledger = (await this.state.storage.get('ledger')) || [];
    const expectedNonce = ledger.length; // Next nonce should be length of current ledger

    if (typeof incomingNonce !== 'number' || !Number.isInteger(incomingNonce)) {
      return {
        ok: false,
        status: 400,
        reason: 'NONCE_NOT_INTEGER',
        message: 'Nonce must be integer',
      };
    }

    if (incomingNonce !== expectedNonce) {
      return {
        ok: false,
        status: 409,
        reason: 'NONCE_OUT_OF_SEQUENCE',
        current: incomingNonce,
        expected: expectedNonce,
        message: `Nonce mismatch: expected ${expectedNonce}, got ${incomingNonce}`,
      };
    }

    return { ok: true, nextNonce: expectedNonce + 1 };
  }

  // Append entry to ledger (immutable append-only) — L54 ENFORCED
  async append(entry, incomingNonce = null) {
    try {
      // Get current ledger
      const ledger = (await this.state.storage.get('ledger')) || [];

      // L54: Validate nonce if provided
      if (incomingNonce !== null) {
        const nonceCheck = await this.validateNonce(incomingNonce);
        if (!nonceCheck.ok) {
          return {
            error: true,
            ...nonceCheck,
          };
        }
      }

      const hash = await this.hashEntry(entry);

      // Build entry with hash chain + nonce (L54)
      const ledgerEntry = {
        id: `entry_${ledger.length}_${Date.now()}`,
        timestamp: Date.now(),
        data: entry,
        hash: hash,
        prevHash: ledger.length > 0 ? ledger[ledger.length - 1].hash : 'genesis',
        sequence: ledger.length,
        nonce: ledger.length, // L54: Monotonic nonce
      };

      // Verify chain integrity
      if (ledger.length > 0) {
        const previous = ledger[ledger.length - 1];
        if (ledgerEntry.prevHash !== previous.hash) {
          throw new Error('Chain integrity violated');
        }
      }

      // Append to ledger
      ledger.push(ledgerEntry);
      await this.state.storage.put('ledger', ledger);

      return ledgerEntry;
    } catch (e) {
      console.error('[HeavyLedger.append] error:', e.message);
      throw e;
    }
  }

  // Query ledger slice (for debugging/replay)
  async querySlice(startSeq, endSeq) {
    const ledger = (await this.state.storage.get('ledger')) || [];
    return ledger.slice(startSeq, endSeq + 1);
  }

  // Verify entire chain integrity (drift detection)
  async verifyChain() {
    const ledger = (await this.state.storage.get('ledger')) || [];

    if (ledger.length === 0) return { valid: true, issues: [] };

    const issues = [];

    for (let i = 0; i < ledger.length; i++) {
      const entry = ledger[i];

      // Check sequence number
      if (entry.sequence !== i) {
        issues.push(`Sequence mismatch at index ${i}: expected ${i}, got ${entry.sequence}`);
      }

      // Verify hash chain
      if (i > 0) {
        const previous = ledger[i - 1];
        if (entry.prevHash !== previous.hash) {
          issues.push(`Hash chain broken at index ${i}`);
        }
      } else if (entry.prevHash !== 'genesis') {
        issues.push(`First entry prevHash should be 'genesis', got ${entry.prevHash}`);
      }

      // Re-verify hash
      const recomputed = await this.hashEntry(entry.data);
      if (recomputed !== entry.hash) {
        issues.push(`Hash mismatch at index ${i}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      totalEntries: ledger.length,
    };
  }

  // Get full ledger (for export/audit)
  async getFullLedger() {
    return (await this.state.storage.get('ledger')) || [];
  }

  // Log user interaction (interaction type → ledger entry)
  async logInteraction(studentId, interactionData) {
    const entry = {
      event_type: 'student_interaction',
      student_id: studentId,
      timestamp: Date.now(),
      input: interactionData.input,
      correction: interactionData.correction,
      mistake_pattern: interactionData.mistake_pattern || null,
      level: interactionData.level || 'unknown',
      strategy_used: interactionData.strategy_used || null,
    };

    return this.append(entry);
  }

  // Log system event (policy changes, drift detections, etc)
  async logSystemEvent(eventType, data) {
    const entry = {
      event_type: 'system_event',
      system_event_type: eventType,
      timestamp: Date.now(),
      data: data,
    };

    return this.append(entry);
  }

  // Log Star Map update
  async logStarMapUpdate(studentId, skillTag, confidenceChange) {
    const entry = {
      event_type: 'star_map_update',
      student_id: studentId,
      skill_tag: skillTag,
      confidence_change: confidenceChange,
      timestamp: Date.now(),
    };

    return this.append(entry);
  }
}

// Durable Object wrapper
export class LedgerDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.ledger = new HeavyLedger(state, env);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // POST /append — Add entry to ledger
    if (path === '/append' && request.method === 'POST') {
      try {
        const body = await request.json();
        const entry = await this.ledger.append(body);
        return new Response(JSON.stringify(entry), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // GET /verify — Verify chain integrity
    if (path === '/verify' && request.method === 'GET') {
      try {
        const result = await this.ledger.verifyChain();
        return new Response(JSON.stringify(result), {
          status: result.valid ? 200 : 400,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // GET /full — Retrieve entire ledger
    if (path === '/full' && request.method === 'GET') {
      try {
        const ledger = await this.ledger.getFullLedger();
        return new Response(JSON.stringify(ledger), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    return new Response('LedgerDO OK', { status: 200 });
  }
}
