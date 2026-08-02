// src/anti-drift.js
// Deterministic continuity gate for OBI responses.

export const DriftStatus = {
  OK: "OK",
  SOUL_MISSING: "SOUL_MISSING",
  SESSION_MISSING: "SESSION_MISSING",
  STATE_PARTIAL: "STATE_PARTIAL",
};

export function checkDrift(snapshot, input) {
  if (!snapshot) {
    return { ok: false, status: DriftStatus.STATE_PARTIAL, score: 10, reasons: ["snapshot_unavailable"] };
  }

  const reasons = [];
  let score = 0;

  const hasSoul = Array.isArray(snapshot.soulAnchors) && snapshot.soulAnchors.length > 0;
  const hasSession = (snapshot.sessionEvents || []).length > 0 || !!snapshot.lastSession;
  const hasState = !!snapshot.studentState || !!snapshot.petState;

  if (!hasSoul) {
    score += 4;
    reasons.push("soul_anchor_missing");
  }
  if (!hasSession) {
    score += 4;
    reasons.push("session_anchor_missing");
  }
  if (!hasState) {
    score += 2;
    reasons.push("behavior_state_missing");
  }

  const cleanInput = String(input || "").trim();
  if (cleanInput.length > 0 && cleanInput.length < 3) {
    score += 1;
    reasons.push("low_signal_input");
  }

  let status = DriftStatus.OK;
  if (!hasSoul) status = DriftStatus.SOUL_MISSING;
  else if (!hasSession) status = DriftStatus.SESSION_MISSING;
  else if (!hasState) status = DriftStatus.STATE_PARTIAL;

  return {
    ok: status === DriftStatus.OK,
    status,
    score: Math.min(score, 10),
    reasons,
  };
}

export function formatDriftPrompt(drift) {
  if (!drift || drift.ok) return "";

  if (drift.status === DriftStatus.SOUL_MISSING) {
    return "\n\nCONTINUITY ALERT: Soul anchors are unavailable. Ask what they worked on recently before teaching.";
  }
  if (drift.status === DriftStatus.SESSION_MISSING) {
    return "\n\nCONTINUITY ALERT: Session memory is missing. Ask for recent class topic and resume from there.";
  }
  if (drift.status === DriftStatus.STATE_PARTIAL) {
    return "\n\nCONTINUITY ALERT: Behavioral state is partial. Keep guidance short and adaptive.";
  }
  return "";
}
