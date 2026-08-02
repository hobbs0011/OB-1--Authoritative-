/**
 * NET-PET-AI Class Preflight — Tests real student sessions against prod
 *
 * GO/NO-GO table for active students × 3 modes (free, study, phonics).
 * Also runs: voice-lock assertion + banana-mode negative.
 */

const STUDENTS = ["mai-tram-bluetech", "huong-bluetech"];
const MODES = ["free", "study", "phonics"];
const BASE = (process.env.BASE && process.env.BASE.includes('dev'))
  ? "https://net-pet-ai-dev.mrmichaelhobbs123.workers.dev"
  : "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
const PREFLIGHT_DELAY_MS = 12000; // stay under deepgram quota bucket

const results = [];

for (const student of STUDENTS) {
  for (const mode of MODES) {
    const url = `${BASE}/api/deepgram-token?studentId=${student}&mode=${mode}`;
    await new Promise(r => setTimeout(r, PREFLIGHT_DELAY_MS));
    try {
      const res = await fetch(url);
      const ok = res.ok;
      let hasToken = false, hasSettings = false, voiceLocked = false;
      if (ok) {
        const data = await res.json().catch(() => ({}));
        hasToken = !!data.token;
        hasSettings = !!data.settings;
        // Voice-lock: prod must use gpt-4o-mini think, nova-3 listen, aura-2-zeus-en speak
        const think = data.settings?.agent?.think?.provider?.model ?? "";
        const listen = data.settings?.agent?.listen?.provider?.model ?? "";
        const speak = data.settings?.agent?.speak?.provider?.model ?? "";
        voiceLocked = think.includes("gpt-4o-mini") && listen.includes("nova-3") && speak.includes("aura-2-zeus-en");
      }
      results.push({
        student, mode,
        status: ok ? "GO" : "NO-GO",
        code: res.status,
        token: hasToken,
        settings: hasSettings,
        voiceLock: voiceLocked,
        url
      });
    } catch (e) {
      results.push({
        student, mode,
        status: "NO-GO", code: "ERR",
        token: false, settings: false, voiceLock: false,
        error: e.message
      });
    }
  }
}

// Negative test: mode=banana must return 400
const bananaRes = await fetch(`${BASE}/api/deepgram-token?studentId=sov100-test-magic&mode=banana`).catch(() => null);
const bananaNeg = bananaRes?.status === 400;
results.push({
  student: "sov100-test-magic", mode: "banana",
  status: bananaNeg ? "GO" : "NO-GO",
  code: bananaRes?.status ?? "ERR",
  token: false, settings: false, voiceLock: "N/A",
  note: "negative test — expect 400"
});

console.log("\n=== CLASS PREFLIGHT TABLE ===\n");
console.log("| Student | Mode | Status | Code | Token | Settings | VoiceLock |");
console.log("|---------|------|--------|------|-------|----------|-----------|");
for (const r of results) {
  const t = r.token ? "GO" : "NO-GO";
  const s = r.settings ? "GO" : "NO-GO";
  const v = r.voiceLock === "N/A" ? "N/A" : (r.voiceLock ? "LOCKED" : "FAIL");
  console.log(`| ${r.student} | ${r.mode} | ${r.status} | ${r.code} | ${t} | ${s} | ${v} |`);
}
console.log("");

const mainGreen = results
  .filter(r => r.mode !== "banana")
  .every(r => r.status === "GO" && r.token && r.settings && r.voiceLock);
const negGreen = bananaNeg;
const allGreen = mainGreen && negGreen;
if (!mainGreen) console.log("FAIL: one or more student/mode sessions failed");
if (!negGreen)  console.log("FAIL: banana-mode did not return 400 (voice-lock bypass risk)");
console.log(`Overall: ${allGreen ? "ALL GREEN" : "SOME FAILED"}`);
process.exit(allGreen ? 0 : 1);