// src/fail-closed-gates.js — Phase 4C: Fail-Closed Doctrine Enforcement (L51-L100)
// 
// Three immutable gates implementing Gospel 444 + systemic integrity
// RUN367: Codified from SSM Laws L51-L100 (canonical enforcement)
//
// Gates:
// 1. HTTP 423 Stasis Gate (ambiguity detection) — L100
// 2. Nonce Sequencing Validator (monotonic enforcement) — L54
// 3. Devil's Advocate Protocol (governance critique) — L78

/**
 * GATE 1: HTTP 423 STASIS GATE (L100 — Fail-Closed Default)
 * 
 * If ambiguity is >5%:
 * - Return HTTP 423 (Locked)
 * - Do NOT attempt forward movement
 * - Preserve all state
 * - Log incident for manual review
 * 
 * Triggers:
 * - Schema validation failure
 * - Missing required ledger fields
 * - Nonce collision/skip
 * - Encoding malformation
 */
export function createStasisGate() {
  return {
    // Check request schema for required fields
    validateSchema: (payload, requiredFields) => {
      const missing = [];
      for (const field of requiredFields) {
        if (!(field in payload)) {
          missing.push(field);
        }
      }
      if (missing.length > 0) {
        const ambiguityRatio = missing.length / requiredFields.length;
        if (ambiguityRatio > 0.05) {
          return {
            ok: false,
            status: 423,
            reason: "SCHEMA_AMBIGUITY",
            missing,
            ambiguityRatio,
            message: `Ambiguity threshold exceeded: ${(ambiguityRatio * 100).toFixed(1)}% fields missing`,
          };
        }
      }
      return { ok: true };
    },

    // Check encoding validity (binary-only transmission, L68)
    validateEncoding: (payload) => {
      // Ensure no text-frame injection (payload must be parseable JSON without encoding errors)
      try {
        if (typeof payload === "string") {
          JSON.parse(payload);
        } else {
          JSON.stringify(payload);
        }
      } catch (e) {
        return {
          ok: false,
          status: 422,
          reason: "ENCODING_MALFORMATION",
          message: `Invalid JSON encoding: ${e.message}`,
        };
      }
      return { ok: true };
    },

    // Check numeric validity (IEEE 754 gate, L58)
    validateNumericFields: (payload, numericFields) => {
      const issues = [];
      for (const field of numericFields) {
        if (field in payload) {
          const val = payload[field];
          if (typeof val !== "number" || !Number.isInteger(val)) {
            issues.push(`${field} must be integer, got ${typeof val}`);
          }
        }
      }
      if (issues.length > 0) {
        return {
          ok: false,
          status: 423,
          reason: "NUMERIC_PRECISION_VIOLATION",
          issues,
          message: "IEEE 754 numeric gate failed",
        };
      }
      return { ok: true };
    },

    // Generate 423 response
    stasisResponse: (reason, details = {}) => {
      return {
        status: 423,
        headers: {
          "Content-Type": "application/json",
          "X-Stasis-Reason": reason,
          // Immutable lock marker
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify({
          error: "Locked",
          reason,
          details,
          timestamp: Date.now(),
          message: "System entered stasis due to ambiguity. Manual review required.",
        }),
      };
    },
  };
}

/**
 * GATE 2: NONCE SEQUENCING VALIDATOR (L54 — Monotonic Enforcement)
 *
 * Every ledger append requires:
 * - nonce = last_nonce + 1 (no skips, no rewinds, no collisions)
 * - If violated: return 409 CONFLICT
 * 
 * Prevents replay attacks and ensures causal ordering
 */
export function createNonceValidator() {
  return {
    // Validate nonce is exactly in sequence
    validateMonotonicNonce: async (currentNonce, expectedNonce) => {
      if (typeof currentNonce !== "number" || !Number.isInteger(currentNonce)) {
        return {
          ok: false,
          status: 400,
          reason: "NONCE_NOT_INTEGER",
          message: "Nonce must be integer",
        };
      }

      if (currentNonce !== expectedNonce) {
        return {
          ok: false,
          status: 409,
          reason: "NONCE_OUT_OF_SEQUENCE",
          current: currentNonce,
          expected: expectedNonce,
          message: `Nonce mismatch: expected ${expectedNonce}, got ${currentNonce}`,
        };
      }

      return { ok: true, nextNonce: currentNonce + 1 };
    },

    // Track last nonce from ledger
    getLastNonce: async (ledger) => {
      if (!ledger || ledger.length === 0) return 0;
      const lastEntry = ledger[ledger.length - 1];
      return (lastEntry.nonce || ledger.length - 1);
    },

    // Conflict response (409)
    conflictResponse: (reason, details = {}) => {
      return {
        status: 409,
        headers: {
          "Content-Type": "application/json",
          "X-Conflict-Reason": reason,
        },
        body: JSON.stringify({
          error: "Conflict",
          reason,
          details,
          timestamp: Date.now(),
          message: "Ledger sequence conflict. Last write may have been lost; retry.",
        }),
      };
    },
  };
}

/**
 * GATE 3: DEVIL'S ADVOCATE PROTOCOL (L78 — Governance Critique)
 *
 * For governance/veto decisions:
 * - Always run critique pass (/kernel/devils_advocate)
 * - Critique must reach satisfaction (predicate met)
 * - No silent bypass
 * - Pheromone issued AFTER critique passes
 * 
 * Implements "Deadlock Prevention" (L74) + "OS Verdict Engine" (L79)
 */
export function createDevilsAdvocate() {
  return {
    // Critique payload for decision quality
    critique: async (payload, decisionContext = {}) => {
      const critiques = [];

      // 1. Clarity check (CCA Quality Gate, L70)
      if (!payload.description || payload.description.length < 10) {
        critiques.push({
          severity: "HIGH",
          code: "CLARITY_FAILURE",
          message: "Decision description too vague (<10 chars)",
        });
      }

      // 2. Authority check (99+1 Hierarchy, L5)
      if (!payload.authorizedBy || payload.authorizedBy.length === 0) {
        critiques.push({
          severity: "HIGH",
          code: "AUTHORIZATION_MISSING",
          message: "Decision not authorized by governance body",
        });
      }

      // 3. Rollback path check (Fail-Closed default, L100)
      if (!payload.rollbackCondition) {
        critiques.push({
          severity: "MEDIUM",
          code: "NO_ROLLBACK_PATH",
          message: "No reversal condition defined for this decision",
        });
      }

      // 4. OS Verdict check (L79) — Agent-99 determines outcome
      if (payload.osVerdictRequired && !payload.osVerdictStatus) {
        critiques.push({
          severity: "CRITICAL",
          code: "OS_VERDICT_MISSING",
          message: "OS Verdict Engine not consulted for governance decision",
        });
      }

      // 5. Audit trail check
      if (!payload.auditTrail || payload.auditTrail.length === 0) {
        critiques.push({
          severity: "MEDIUM",
          code: "AUDIT_TRAIL_EMPTY",
          message: "Decision history not logged",
        });
      }

      return {
        critiques,
        passed: critiques.filter(c => c.severity === "CRITICAL").length === 0,
        satisfactionRequired: critiques.filter(c => c.severity !== "MEDIUM").length > 0,
        allowProceeding: critiques.filter(c => c.severity === "CRITICAL").length === 0,
      };
    },

    // Ensure critique gate passes before pheromone issuance
    gatePheromone: async (critiqueResult, payload) => {
      if (!critiqueResult.allowProceeding) {
        return {
          ok: false,
          status: 403,
          reason: "DEVIL_ADVOCATE_VETO",
          critiques: critiqueResult.critiques,
          message: "Governance decision blocked by Devil's Advocate protocol",
        };
      }
      if (critiqueResult.satisfactionRequired) {
        return {
          ok: false,
          status: 202,
          reason: "CRITIQUE_PENDING_RESOLUTION",
          critiques: critiqueResult.critiques.filter(c => c.severity !== "MEDIUM"),
          message: "Critique issues must be resolved before pheromone issuance",
        };
      }
      return { ok: true, pheromoneReady: true };
    },
  };
}

/**
 * GOSPEL 444 ENFORCEMENT (L03, L45, L50)
 *
 * Canonical palette lock (immutable):
 * - Void Black: #0f0f1a (primary background)
 * - Soul Purple: #a855f7 (emphasis, hierarchy)
 * - Imperial Gold: #f59e0b (warnings, highlights)
 * - ZERO BLUE (#0066cc, #0099ff, etc. — rejected always)
 */
export function createGospel444Guard() {
  const FORBIDDEN_COLORS = [
    /#0066cc/i,    // Standard web blue
    /#0099ff/i,    // Cyan
    /#0051ba/i,    // Dark blue
    /#3366ff/i,    // Light blue
    /#0066ff/i,    // Primary blue
    /#0099cc/i,    // Teal-blue
    /#6699ff/i,    // Pale blue
    /#00ccff/i,    // Aqua
    /rgba?\s*\(\s*0\s*,\s*102\s*,\s*204/ // RGB blue variations
  ];

  const PERMITTED_COLORS = {
    void: "#0f0f1a",
    purple: "#a855f7",
    gold: "#f59e0b",
    red: "#ef4444",
    green: "#22c55e",
    slate: "#94a3b8",
  };

  return {
    // Validate CSS/HTML for rogue blue
    validateCSS: (cssContent) => {
      const violations = [];
      for (const pattern of FORBIDDEN_COLORS) {
        const matches = cssContent.match(pattern);
        if (matches) {
          violations.push({
            color: matches[0],
            reason: "BLUE_FORBIDDEN_BY_GOSPEL_444",
          });
        }
      }
      return {
        clean: violations.length === 0,
        violations,
      };
    },

    // Stamp approved color for audit
    approveColor: (colorName) => {
      if (PERMITTED_COLORS[colorName]) {
        return { approved: true, value: PERMITTED_COLORS[colorName] };
      }
      return { approved: false, reason: `Color '${colorName}' not in approved Gospel 444 palette` };
    },

    // Generate Gospel 444 CSS guard (can be injected into HTML head)
    cssGuard: () => {
      const cssGuard = `
/* Gospel 444 Immutable Palette Lock — RUN367 Phase 4C */
:root {
  --void: #0f0f1a !important;
  --purple: #a855f7 !important;
  --gold: #f59e0b !important;
  --text: #e2e8f0 !important;
  --muted: #94a3b8 !important;
}

/* Detect & reject blue (any shade) */
*[style*="0066cc"],
*[style*="0099ff"],
*[style*="0051ba"],
*[style*="3366ff"],
*[style*="00ccff"],
*[class*="blue"],
*[class*="cyan"],
*[class*="sky"],
*[class*="indigo"] {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

/* Enforce Gospel 444 */
body { background: var(--void) !important; color: var(--text) !important; }
h1, h2, h3, h4, h5, h6 { color: var(--purple) !important; }
a, button, [role="button"] { color: var(--purple) !important; }
`;
      return cssGuard;
    },
  };
}
