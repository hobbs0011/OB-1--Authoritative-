/**
 * NET-PET-AI Functional Pre-Deploy — GATES 2-4 (the real ones)
 *
 * Sends the EXACT settings prod serves to the LIVE Deepgram Voice Agent WS and asserts:
 *   GATE 2  Welcome received   → token authenticates (WS auth ok)
 *   GATE 3  SettingsApplied    → Deepgram ACCEPTS the payload (the Run 101 gate)
 *   GATE 4  binary audio in 5s → OBI actually speaks
 *
 * Usage:  node test/preflight-ws.mjs [baseUrl]
 *   default baseUrl = https://net-pet-ai.mrmichaelhobbs123.workers.dev (prod)
 *   pass dev URL to verify dev before promotion.
 *
 * Exit 0 = all green (deploy authorized). Non-zero = HALT.
 *
 * Doctrine: this hits the LIVE dependency. "Field exists" is theater. See .kilo/command/netpet-preflight.md
 */

import { WebSocket } from "ws";

const BASE = process.argv[2] || "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const TEST_ID = "sov100-test-magic";
const DG_WS = "wss://agent.deepgram.com/v1/agent/converse";

const res = await fetch(`${BASE}/api/deepgram-token?studentId=${TEST_ID}`);
if (!res.ok) { console.error(`GATE 1 RED — token endpoint ${res.status}: ${await res.text()}`); process.exit(1); }
const { token, settings } = await res.json();
if (!token || !settings) { console.error("GATE 1 RED — missing token/settings in response"); process.exit(1); }

const ws = new WebSocket(DG_WS, ["token", token]);
let welcome = false, applied = false, audio = false, errDesc = null;

await new Promise((resolve) => {
  ws.on("message", (d) => {
    const isJson = typeof d === "string" || d[0] === 0x7b;
    if (isJson) {
      const m = JSON.parse(d.toString());
      if (m.type === "Welcome") { welcome = true; ws.send(JSON.stringify(settings)); }
      if (m.type === "SettingsApplied") { applied = true; setTimeout(resolve, 5000); }
      if (m.type === "Error") { errDesc = m.description; resolve(); }
    } else if (d.length > 0) { audio = true; }
  });
  ws.on("error", (e) => { errDesc = `WS error: ${e.message}`; resolve(); });
  setTimeout(resolve, 15000);
});
try { ws.close(); } catch {}

if (!welcome) { console.error("GATE 2 RED — no Welcome (WS auth failed). Token scope insufficient or key dead."); process.exit(1); }
console.log("GATE 2 GREEN — Welcome received (auth ok)");

if (!applied) {
  console.error(`GATE 3 RED — Settings NOT accepted (RUN 101 BUG CLASS). Deepgram said: ${errDesc || "(no message / timeout)"}`);
  process.exit(1);
}
console.log("GATE 3 GREEN — SettingsApplied (Deepgram accepts the served payload)");

if (!audio) { console.error("GATE 4 RED — SettingsApplied but NO audio in 5s. OBI is silent."); process.exit(1); }
console.log("GATE 4 GREEN — audio chunk received (OBI speaks)");

console.log(`\nALL FUNCTIONAL GATES GREEN against ${BASE} — OBI is live.`);
process.exit(0);
