/**
 * LAYER 4 — CONTINUOUS SYNTHETIC CANARY
 *
 * Runs GATES 2-4 against prod every N minutes via cron.
 * Detects Deepgram API spec drift (Run 101 bug class) without any deploy.
 *
 * Usage: node test/canary-check.mjs [baseUrl]
 */

import { WebSocket } from "ws";

const BASE_URL = process.argv[2] || "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const TEST_ID = "keep-warm-ping";
const DG_WS = "wss://agent.deepgram.com/v1/agent/converse";
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK || ""; // Telegram / email / webhook

console.log(`\n=== LAYER 4 CANARY — ${new Date().toISOString()} ===`);

async function runCanary() {
  let errDesc = null;
  let gate2 = false, gate3 = false, gate4 = false;

  // GATE 1 — token serves
  const tokRes = await fetch(`${BASE_URL}/api/deepgram-token?studentId=${TEST_ID}`);
  if (!tokRes.ok) {
    errDesc = `GATE 1 RED — token endpoint ${tokRes.status}`;
    return { ok: false, error: errDesc };
  }
  const { token, settings } = await tokRes.json();
  if (!token || !settings) {
    errDesc = "GATE 1 RED — missing token/settings";
    return { ok: false, error: errDesc };
  }

  // GATES 2-4 — WS round-trip
  const ws = new WebSocket(DG_WS, ["token", token]);
  await new Promise((resolve) => {
    ws.on("message", (d) => {
      const isJson = typeof d === "string" || (d && d[0] === 0x7b);
      if (isJson) {
        const m = typeof d === "string" ? JSON.parse(d) : JSON.parse(d.toString());
        if (m.type === "Welcome") { gate2 = true; ws.send(JSON.stringify(settings)); }
        if (m.type === "SettingsApplied") { gate3 = true; setTimeout(resolve, 4000); }
        if (m.type === "Error") { errDesc = m.description; resolve(); }
      } else if (d && d.length > 0) { gate4 = true; }
    });
    ws.on("error", (e) => { errDesc = e.message; resolve(); });
    setTimeout(() => resolve(), 12000);
  });
  ws.close();

  const ok = gate2 && gate3 && gate4;
  return { ok, gate2, gate3, gate4, error: errDesc || null };
}

function sendAlert(msg) {
  if (!ALERT_WEBHOOK) {
    console.log(`[ALERT] ${msg}`);
    return;
  }
  fetch(ALERT_WEBHOOK, { method: "POST", body: JSON.stringify({ text: msg }) }).catch(() => {});
}

(async () => {
  const result = await runCanary();
  console.log(`Gate results: 2=${result.gate2} 3=${result.gate3} 4=${result.gate4}`);
  if (!result.ok) {
    console.error("CANARY RED — OBI voice path broken:", result.error);
    sendAlert(`🔴 OBI CANARY RED: ${result.error || 'gates 2-4 failed'}`);
    process.exit(1);
  }
  console.log("CANARY GREEN — gates 2-4 passed");
  process.exit(0);
})();