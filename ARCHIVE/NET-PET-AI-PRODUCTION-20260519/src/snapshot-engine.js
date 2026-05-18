// src/snapshot-engine.js
// Canonical context snapshot builder used by chat continuity and drift gates.

async function safeJsonFetch(promiseFactory, fallback) {
  try {
    const res = await promiseFactory();
    return await res.json();
  } catch (_) {
    return fallback;
  }
}

function summarizeAnchors(snapshot) {
  const topWeakness = snapshot.weakPoints[0]?.specific || null;
  const lastTopic = snapshot.sessionEvents[0]?.topic || snapshot.lastSession?.topic || null;
  const state = snapshot.studentState?.state || (snapshot.petState?.tigerScore >= 80 ? "TIGER" : snapshot.petState?.tigerScore >= 40 ? "CUB" : "MOUSE");
  return { topWeakness, lastTopic, state };
}

export async function buildSnapshot(env, studentId) {
  const snapshot = {
    studentId,
    ts: Date.now(),
    soulAnchors: [],
    sessionEvents: [],
    lastSession: null,
    studentState: null,
    profile: null,
    weakPoints: [],
    petState: null,
    anchors: null,
  };

  if (env.LEDGER) {
    const soulData = await safeJsonFetch(
      () => env.LEDGER.get(env.LEDGER.idFromName("sov100")).fetch(new Request("https://do/history?limit=3&eventType=soul_dna_capture")),
      { entries: [] }
    );
    snapshot.soulAnchors = (soulData.entries || []).map(e => {
      try { return JSON.parse(e.payload); } catch { return null; }
    }).filter(Boolean);

    const sessionData = await safeJsonFetch(
      () => env.LEDGER.get(env.LEDGER.idFromName(studentId)).fetch(new Request("https://do/history?limit=1&eventType=session_log")),
      { entries: [] }
    );
    const lastEntry = (sessionData.entries || []).slice(-1)[0];
    if (lastEntry) {
      try { snapshot.lastSession = JSON.parse(lastEntry.payload); } catch (_) {}
    }
  }

  if (env.SESSIONS) {
    const sessionEvents = await safeJsonFetch(
      () => env.SESSIONS.get(env.SESSIONS.idFromName(`events-${studentId}`)).fetch(new Request("https://do/events/recent?limit=10")),
      { events: [] }
    );
    snapshot.sessionEvents = sessionEvents.events || [];
  }

  if (env.PROFILES) {
    const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
    const [stateData, profileData, weakData] = await Promise.all([
      safeJsonFetch(() => profileStub.fetch(new Request("https://do/state/get")), {}),
      safeJsonFetch(() => profileStub.fetch(new Request("https://do/profile")), {}),
      safeJsonFetch(() => profileStub.fetch(new Request("https://do/weakness/get")), {}),
    ]);
    snapshot.studentState = stateData.studentState || null;
    snapshot.profile = profileData.profile || null;
    snapshot.weakPoints = weakData.weakPoints || [];
  }

  if (env.PETS) {
    const petData = await safeJsonFetch(
      () => env.PETS.get(env.PETS.idFromName(studentId)).fetch(new Request("https://do/state")),
      {}
    );
    snapshot.petState = petData.state || null;
  }

  snapshot.anchors = summarizeAnchors(snapshot);
  return snapshot;
}

export function formatSnapshotPrompt(snapshot) {
  if (!snapshot) return "";

  const lines = [];
  if (snapshot.anchors?.lastTopic) lines.push(`Last topic: ${snapshot.anchors.lastTopic}`);
  if (snapshot.anchors?.topWeakness) lines.push(`Top weakness: ${snapshot.anchors.topWeakness}`);
  if (snapshot.anchors?.state) lines.push(`Behavior state: ${snapshot.anchors.state}`);

  if (snapshot.sessionEvents.length > 0) {
    const recent = snapshot.sessionEvents.slice(0, 3).map(e => {
      const mistakes = e.mistakes ? `mistakes=${e.mistakes}` : "";
      return `${e.topic || "general"}${mistakes ? ` (${mistakes})` : ""}`;
    });
    lines.push(`Recent continuity: ${recent.join("; ")}`);
  }

  if (lines.length === 0) return "";
  return `\n\nCANONICAL SNAPSHOT:\n- ${lines.join("\n- ")}`;
}
