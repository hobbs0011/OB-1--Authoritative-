/**
 * LAYER 3 — POST-DEPLOY VERIFY + AUTO-ROLLBACK
 *
 * Runs GATES 2-4 immediately after wrangler deploy against the just-deployed worker.
 * RED → automatic rollback + HALT. A bad deploy cannot survive >60s.
 *
 * Usage: node test/post-deploy-verify.mjs [env:dev|prod] [optional-url]
 */

import { WebSocket } from "ws";
import { execSync } from "child_process";

const ENV = process.argv[2] || "prod";
const BASE_URL = process.argv[3] || (ENV === "dev" ? "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev" : "https://net-pet-ai.mrmichaelhobbs123.workers.dev");
const TEST_ID = "sov100-test-magic";
const DG_WS = "wss://agent.deepgram.com/v1/agent/converse";
const VERSION_TIMEOUT_MS = 30000;

console.log(`\n=== LAYER 3 POST-DEPLOY VERIFY — ${ENV.toUpperCase()} ===`);
console.log(`Target: ${BASE_URL}`);
console.log(`Timeout: ${VERSION_TIMEOUT_MS}ms`);

async function checkVersion() {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error(`health endpoint ${res.status}`);
  const data = await res.json();
  if (!data.version) throw new Error("no version in health response");
  console.log(`Version: ${data.version} | AI: ${data.ai} | Voice: ${data.voice}`);
  return data.version;
}

async function runGates24() {
  const res = await fetch(`${BASE_URL}/api/deepgram-token?studentId=${TEST_ID}`);
  if (!res.ok) {
    throw new Error(`GATE 1 RED — token endpoint ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const { token, settings } = await res.json();
  if (!token || !settings) { throw new Error("GATE 1 RED — missing token/settings in response"); }

  const ws = new WebSocket(DG_WS, ["token", token]);
  let welcome = false, applied = false, audio = false, errDesc = null;

  await new Promise((resolve) => {
    ws.on("message", (d) => {
      const isJson = typeof d === "string" || d[0] === 0x7b;
      if (isJson) {
        const m = JSON.parse(d.toString());
        if (m.type === "Welcome") { welcome = true; ws.send(JSON.stringify(settings)); }
        if (m.type === "SettingsApplied") { applied = true; setTimeout(resolve, 4000); }
        if (m.type === "Error") { errDesc = m.description; resolve(); }
      } else if (d.length > 0) { audio = true; }
    });
    ws.on("error", (e) => { errDesc = `WS error: ${e.message}`; resolve(); });
    setTimeout(resolve, 10000);
  });
  ws.close();

  if (!welcome) { throw new Error(`GATE 2 RED — no Welcome (WS auth failed). Token scope insufficient or key dead.`); }
  if (!applied) { throw new Error(`GATE 3 RED — Settings NOT accepted (Run 101 bug class). Deepgram said: ${errDesc || "(timeout)"}`); }
  if (!audio) { throw new Error("GATE 4 RED — SettingsApplied but NO audio in 5s. OBI is silent."); }
  return true;
}
  const { token, settings } = await res.json();
  if (!token || !settings) throw new Error("missing token/settings in response");

  const ws = new WebSocket(DG_WS, ["token", token]);
  let welcome = false, applied = false, audio = false, errDesc = null;

  await new Promise((resolve) => {
    ws.on("message", (d) => {
      const isJson = typeof d === "string" || d[0] === 0x7b;
      if (isJson) {
        const m = JSON.parse(d.toString());
        if (m.type === "Welcome") welcome = true;
        if (m.type === "SettingsApplied") { applied = true; setTimeout(resolve, 5000); }
        if (m.type === "Error") { errDesc = m.description; resolve(); }
      } else if (d.length > 0) { audio = true; }
    });
    ws.on("error", (e) => { errDesc = `WS error: ${e.message}`; resolve(); });
    setTimeout(resolve, 15000);
  });
  ws.close();

  if (!welcome) throw new Error(`GATE 2 RED — no Welcome (WS auth failed). ${errDesc || ""}`);
  if (!applied) throw new Error(`GATE 3 RED — Settings NOT accepted (Run 101 bug class). Deepgram: ${errDesc || "(timeout)"}`);
  if (!audio) throw new Error("GATE 4 RED — SettingsApplied but NO audio in 5s. OBI silent.");
  return true;
}

function autoRollback() {
  console.log("\nRED DETECTED — attempting auto-rollback...");
  try {
    const versions = execSync(`npx wrangler versions list --json`, { encoding: "utf8", cwd: process.cwd() });
    const list = JSON.parse(versions);
    const prev = list.versions?.find(v => v.status === "deployed" && v.deployment_id !== list.versions?.[0]?.deployment_id);
    if (prev?.deployment_id) {
      execSync(`npx wrangler rollback --deployment-id ${prev.deployment_id}`, { stdio: "inherit", cwd: process.cwd() });
      console.log(`Rolled back to: ${prev.deployment_id}`);
    } else {
      console.error("No previous deployment found for rollback");
    }
  } catch (e) {
    console.error("ROLLBACK FAILED:", e.message);
  }
}

(async () => {
  try {
    await checkVersion();
    await runGates24();
    console.log("\nLAYER 3 GREEN — OBI is live after deploy");
    process.exit(0);
  } catch (e) {
    console.error(`\n${e.message}`);
    autoRollback();
    console.error("\nLAYER 3 RED — deploy rolled back, FIX REQUIRED");
    process.exit(1);
  }
})();