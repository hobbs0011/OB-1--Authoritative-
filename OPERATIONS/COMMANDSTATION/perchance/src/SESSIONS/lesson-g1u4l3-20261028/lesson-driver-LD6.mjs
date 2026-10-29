// LESSON-DRIVER LD6 — section writer for single-file HTML lessons (Kilo free brain).
// LD5 + queued fixes (Pro Tmvsolaec + D10): 150ch prior-section summary per prompt,
// artifact guard on PASS (re-read file, markers must be on disk), honest DONE-EMPTY.
// Between-runs seed only — never mid-flight. Usage: DRIVER=lesson-driver-LD6.mjs ./keepalive-LD6.sh
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";

const GATE = "https://ai-gateway.kilo.ai/api/v1";
const MDIR = "/root/mission";
const PDIR = MDIR + "/lesson-parts";
const TRACE = MDIR + "/solo-launch.log";
const STATEF = MDIR + "/LESSON-STATE.json";
const SUMF = MDIR + "/LESSON-SUMMARY.json";
const SRCF = MDIR + "/g1u4l3-source.txt";
const KILO_KEY = readFileSync("/root/.kilo_key", "utf8").trim();
const RENV = readFileSync("/root/.runner_env", "utf8");
const RUNNER_KEY = (RENV.match(/^KEY=(.+)$/m) || [])[1]?.trim();
const RUNNER_URL = (RENV.match(/^URL=(.+)$/m) || [])[1]?.trim().replace(/\/+$/, "");

function log(s) { const l = new Date().toISOString() + " " + s; appendFileSync(TRACE, l + "\n"); console.log(l); }
const FREE_MODELS = ["kilo-auto/free", "recursive/flint-v1.0:free", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"];
async function brain(prompt, maxTokens = 500) {
  for (let i = 0; i < 6; i++) {
    const model = FREE_MODELS[i % FREE_MODELS.length];
    const body = JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] });
    try {
      const r = await fetch(GATE + "/chat/completions", {
        method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + KILO_KEY },
        body, signal: AbortSignal.timeout(90000)
      });
      const j = await r.json().catch(() => null);
      const t = j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "").trim();
      if (r.ok && t && t.length > 40) return t;
      log("brain try " + (i + 1) + " [" + model + "] empty/status " + r.status);
    } catch (e) { log("brain try " + (i + 1) + " error " + String(e && e.message || e).slice(0, 100)); }
    await new Promise((r) => setTimeout(r, [2000, 3000, 5000, 8000, 8000][Math.min(i, 4)]));
  }
  return "";
}
async function hb(msg) {
  for (let i = 0; i < 2; i++) {
    try {
      await fetch(RUNNER_URL + "/run", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: RUNNER_KEY, prompt: "LESSON " + msg + " Reply with exactly: logged", model: "kilo-auto/free", max_tokens: 64 }),
        signal: AbortSignal.timeout(90000)
      });
      return;
    } catch (e) { await new Promise((r) => setTimeout(r, 3000)); }
  }
}
function wscope(path, content) {
  const ok = path === MDIR + "/lesson-g1u4l3.html" || path === MDIR + "/LESSON-REPORT.md" || path === STATEF || path === SUMF || (path.startsWith(PDIR + "/") && !path.includes(".."));
  if (!ok) throw new Error("write out of scope: " + path);
  writeFileSync(path, content);
}
function summarize(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150);
}
const CTX = "Write ONE fragment of a single-file HTML Grade-1 phonics lesson. Tokens --neon-purple #a855f7 --gold #f59e0b --deep-dark #0f0f1a, glass cards, Inter. Only classes: dialogue-block speaker chatty-clue chatty-hint vocab-list vocab-item chatty-choices chatty-feedback summary-card. Chatty: 2nd person warm 2 sentences max. No inline style. Output ONLY the fragment.";
const SECTIONS = [
  { id: "s1-shell", file: "s1-shell.html", spec: "HTML head: meta viewport, style with the brand tokens, blob background, card CSS, coin pill, sticky nav row. Landing: logo tile, gradient title THIS IS A LAMP, one-line promise, one CTA pill Begin Your Journey, 3 feature cards. Lesson card shell: progress bar, rooms div, script shell with rooms array open and coin counter.", markers: ["--neon-purple", "Begin Your Journey", "rooms", "coin"] },
  { id: "s2-r1", file: "s2-r1.html", spec: "Room 1 Entrance Warm-Up: Dd hero letter big, lamp picture emoji, What you will learn bullets (say /d/, meet dance dino dot, chant), one chatty-hint with the transferable rule, warm-up tap game: 3 emoji buttons apple cat ant, tap the /d/ word scores.", markers: ["Warm-Up", "Dd", "lamp", "chatty-hint"] },
  { id: "s3-r2", file: "s3-r2.html", spec: "Room 2 Scene Group Work: verbatim classroom dialogue, Ms Hoa teacher with Minh and Anh, late-to-class about a lamp, Dd words spoken naturally, one chatty-clue reality check.", markers: ["Ms Hoa", "Minh", "Anh", "dialogue-block"] },
  { id: "s4-r3", file: "s4-r3.html", spec: "Room 3 Text Scene: the same lamp moment as a phone chat, emoji punctuation, one chatty-hint about text clues.", markers: ["chatty-hint"] },
  { id: "s5-r4", file: "s5-r4.html", spec: "Room 4 Vocab Vault Learn: 4 numbered vocab-items, dance dino dot lamp, EACH inside a full spoken sentence with situation, mid-lesson game: tap the picture that starts with /d/ from 3.", markers: ["vocab-item", "dance", "dino", "dot", "lamp"] },
  { id: "s6-r5", file: "s6-r5.html", spec: "Room 5 Practice Test: 2 chatty-choices blocks. Block A: scenario tap the /d/ word (dance cat bed). Block B: This is a lamp vs This is a desk choice. Buttons disable on click, correct green pulse wrong red shake with re-teaching feedback, coins plus 10.", markers: ["chatty-choices", "data-answer", "coins"] },
  { id: "s7-r6", file: "s7-r6.html", spec: "Room 6 Exit Mastery: summary-card with the reward (Dd Detective), the chant lines, what to do next, finale chant-along game button, restart resets coins.", markers: ["summary-card", "chant"] },
];
async function main() {
  mkdirSync(PDIR, { recursive: true });
  log("LESSON-DRIVER LD6 START (section writer + prior-summary + artifact guard)");
  await hb("START section-writer-LD6");
  let src = "";
  try { src = readFileSync(SRCF, "utf8").slice(0, 900); } catch (e) {}
  let state = { done: {} };
  try { state = JSON.parse(readFileSync(STATEF, "utf8")); } catch (e) {}
  let sums = {};
  try { sums = JSON.parse(readFileSync(SUMF, "utf8")); } catch (e) {}
  let pass = 0, skip = 0, prev = "";
  const ids = SECTIONS.map((s) => s.id);
  for (const s of SECTIONS) {
    const idx = ids.indexOf(s.id);
    if (idx > 0) prev = sums[ids[idx - 1]] || "";
    const fp = PDIR + "/" + s.file;
    try {
      if (state.done[s.id] && existsSync(fp)) {
        const cur = readFileSync(fp, "utf8");
        if (s.markers.every((m) => cur.includes(m))) { log("SEC " + s.id + " resumed-ok"); sums[s.id] = summarize(cur); pass++; continue; }
      }
    } catch (e) {}
    let got = "";
    for (let t = 0; t < 3 && !got; t++) {
      const p = (CTX + (prev ? " Prior: " + prev + "." : "") + " " + s.spec).slice(0, 650);
      const out = await brain(p, 200);
      if (!out) { log("sec " + s.id + " try " + (t + 1) + " empty"); continue; }
      const miss = s.markers.filter((m) => !out.includes(m));
      if (!miss.length) { got = out; break; }
      log("sec " + s.id + " try " + (t + 1) + " missing " + miss.length + ", follow-ups");
      let aug = out;
      for (const m of miss.slice(0, 3)) {
        const f = await brain("Write ONLY the HTML snippet containing " + m + ", under 120 chars. No explanations.", 150);
        if (f && f.includes(m)) aug += "\n" + f;
      }
      if (s.markers.every((m) => aug.includes(m))) { got = aug; break; }
    }
    if (!got) { log("SEC " + s.id + " SKIP"); state.done[s.id] = "skip"; skip++; }
    else {
      wscope(fp, got);
      let ok = false;
      try { const back = readFileSync(fp, "utf8"); ok = s.markers.every((m) => back.includes(m)); } catch (e) {}
      if (!ok) { log("SEC " + s.id + " pass-UNVERIFIED (markers missing on disk) SKIP"); state.done[s.id] = "skip"; skip++; }
      else { state.done[s.id] = "pass"; sums[s.id] = summarize(got); log("SEC " + s.id + " PASS (" + got.length + " chars)"); pass++; }
    }
    wscope(STATEF, JSON.stringify(state));
    try { wscope(SUMF, JSON.stringify(sums)); } catch (e) {}
    await hb(s.id + " " + state.done[s.id]);
  }
  const missing = SECTIONS.filter((s) => state.done[s.id] !== "pass").map((s) => s.id);
  let html = "";
  try { html = readFileSync(PDIR + "/s1-shell.html", "utf8"); } catch (e) { html = "<!doctype html><html><head><meta charset=utf8></head><body>"; }
  for (const s of SECTIONS.slice(1)) {
    try { html += "\n" + readFileSync(PDIR + "/" + s.file, "utf8"); }
    catch (e) { html += "\n<!-- MISSING " + s.id + " -->"; }
  }
  html += "\n</body></html>";
  wscope(MDIR + "/lesson-g1u4l3.html", html);
  const rep = ["# LESSON REPORT", "finished: " + new Date().toISOString(), "sections PASS " + pass + "/7 SKIP " + skip + "/7", "missing: " + (missing.join(", ") || "none"), "bytes: " + html.length, "file: /root/mission/lesson-g1u4l3.html"].join("\n");
  wscope(MDIR + "/LESSON-REPORT.md", rep);
  if (pass === 0) log("DONE-EMPTY PASS 0/7 SKIP 7/7 (lane hollow, keeper may retry)");
  else log("DONE PASS " + pass + "/7 SKIP " + skip + "/7");
  await hb("DONE PASS " + pass + "/7 SKIP " + skip + "/7");
}
main().catch((e) => { log("FATAL " + String(e && e.message || e).slice(0, 200)); process.exit(1); });
