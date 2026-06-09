/**
 * NET-PET-AI Class Preflight — Tests real student sessions against prod
 *
 * GO/NO-GO table for quy + mai-tram × 3 modes (free, study, phonics).
 */

const STUDENTS = ["quy-bluetech", "mai-tram-bluetech"];
const MODES = ["free", "study", "phonics"];
const BASE = "https://net-pet-ai.mrmichaelhobbs123.workers.dev";

const results = [];

for (const student of STUDENTS) {
  for (const mode of MODES) {
    const url = `${BASE}/api/deepgram-token?studentId=${student}&mode=${mode}`;
    try {
      const res = await fetch(url);
      const ok = res.ok;
      let hasToken = false, hasSettings = false;
      if (ok) {
        const data = await res.json().catch(() => ({}));
        hasToken = !!data.token;
        hasSettings = !!data.settings;
      }
      results.push({
        student,
        mode,
        status: ok ? "GO" : "NO-GO",
        code: res.status,
        token: hasToken,
        settings: hasSettings,
        url
      });
    } catch (e) {
      results.push({
        student,
        mode,
        status: "NO-GO",
        code: "ERR",
        token: false,
        settings: false,
        error: e.message
      });
    }
  }
}

console.log("\n=== CLASS PREFLIGHT TABLE ===\n");
console.log("| Student | Mode | Status | Code | Token | Settings |");
console.log("|---------|------|--------|------|-------|----------|");
for (const r of results) {
  const t = r.token ? "GO" : "NO-GO";
  const s = r.settings ? "GO" : "NO-GO";
  console.log(`| ${r.student} | ${r.mode} | ${r.status} | ${r.code} | ${t} | ${s} |`);
}
console.log("");

const allGreen = results.every(r => r.status === "GO" && r.token && r.settings);
console.log(`Overall: ${allGreen ? "ALL GREEN" : "SOME FAILED"}`);
process.exit(allGreen ? 0 : 1);