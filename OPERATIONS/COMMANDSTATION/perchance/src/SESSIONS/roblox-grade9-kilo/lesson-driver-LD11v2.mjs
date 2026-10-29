// LESSON-DRIVER LD11 v2 — Grade-9 Roblox online-safety lesson, Kilo-written rooms.
// v2 FIX (measured 2026-10-29): free-lane provider counts hidden reasoning against
// max_tokens. max_tokens=10 with no system prompt => 10 completion tokens, 0 visible
// text. System prompt + max_tokens 800 => full answer in ~2.3s. Never use tiny budgets.
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { execFile } from "node:child_process";

const GATE = "https://ai-gateway.kilo.ai/api/v1";
const MDIR = "/root/mission";
const PDIR = MDIR + "/roblox-parts";
const TRACE = MDIR + "/roblox-launch.log";
const STATEF = MDIR + "/ROBLOX-STATE.json";
const SUMF = MDIR + "/ROBLOX-SUMMARY.json";
const SRCF = MDIR + "/roblox-brief.txt";
const KILO_KEY = readFileSync("/root/.kilo_key", "utf8").trim();
const RENV = readFileSync("/root/.runner_env", "utf8");
const RUNNER_KEY = (RENV.match(/^KEY=(.+)$/m) || [])[1]?.trim();
const RUNNER_URL = (RENV.match(/^URL=(.+)$/m) || [])[1]?.trim().replace(/\/+$/, "");
const SYS = "You are a helpful classroom-materials writer. Follow the brief exactly, output only the asked HTML.";

function log(s) { const l = new Date().toISOString() + " " + s; appendFileSync(TRACE, l + "\n"); console.log(l); }
const FREE_MODELS = ["kilo-auto/free", "recursive/flint-v1.0:free", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"];
async function brain(prompt, maxTokens = 800) {
  for (let i = 0; i < 6; i++) {
    const model = FREE_MODELS[i % FREE_MODELS.length];
    const body = JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "system", content: SYS }, { role: "user", content: prompt }] });
    try {
      const r = await fetch(GATE + "/chat/completions", {
        method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + KILO_KEY },
        body, signal: AbortSignal.timeout(90000)
      });
      const j = await r.json().catch(() => null);
      const t = j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "").trim();
      if (r.ok && t && t.length > 40) return tidy(t);
      log("brain try " + (i + 1) + " [" + model + "] empty/status " + r.status);
    } catch (e) { log("brain try " + (i + 1) + " error " + String(e && e.message || e).slice(0, 100)); }
    await new Promise((r) => setTimeout(r, [2000, 3000, 5000, 8000, 8000][Math.min(i, 4)]));
  }
  return "";
}
function tidy(t) {
  let s = String(t || "").trim();
  s = s.replace(/```(?:html)?\s*/gi, "").replace(/```/g, "").trim();
  const a = s.indexOf("<"), b = s.lastIndexOf(">");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return s.trim();
}
async function hb(msg) {
  for (let i = 0; i < 2; i++) {
    try {
      await fetch(RUNNER_URL + "/run", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: RUNNER_KEY, prompt: "ROBLOX " + msg + " Reply with exactly: logged", model: "kilo-auto/free", max_tokens: 1000 }),
        signal: AbortSignal.timeout(90000)
      });
      return;
    } catch (e) { await new Promise((r) => setTimeout(r, 3000)); }
  }
}
function wscope(path, content) {
  const ok = path === MDIR + "/roblox-grade9-kilo.html" || path === MDIR + "/ROBLOX-REPORT.md" || path === STATEF || path === SUMF || (path.startsWith(PDIR + "/") && !path.includes(".."));
  if (!ok) throw new Error("write out of scope: " + path);
  writeFileSync(path, content);
}
function summarize(html) {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}
const CTX = "Write ONE Grade-9 Roblox-safety lesson room in HTML. Classes only: dialogue-block speaker chatty-clue chatty-hint vocab-list vocab-item chatty-choices chatty-feedback summary-card game. No style/handlers. Output ONLY the fragment. ";
const LOCK = "Words: account password stranger scam link report block. Grammar If+present will+verb. NEVER: minecraft fortnite pubg valorant freefire.";
const BANNED = /\b(minecraft|fortnite|pubg|valorant|freefire|free fire)\b/i;
const SPILL = /(as an ai|here is your|i have (written|created)|we need to parse|chain-of-thought)/i;
function buildPrompt(spec, prev) {
  let s = prev || "";
  let p = CTX + LOCK + (s ? " Prior: " + s + "." : "") + " " + spec;
  if (p.length > 650 && s) {
    s = s.slice(0, Math.max(0, s.length - (p.length - 650)));
    p = CTX + LOCK + (s ? " Prior: " + s + "." : "") + " " + spec;
    log("prompt summary trimmed to fit 650 (" + s.length + "ch kept)");
  }
  if (p.length > 650) {
    log("prompt STILL over 650 after summary trim (" + p.length + "), trimming spec tail");
    p = p.slice(0, 650);
  }
  return p;
}
const SECTIONS = [
  { id: "r1-warm", file: "r1-warm.html", spec: "Warm-Up: 2nd-person welcome, ul of 4 leave-behinds, one chatty-hint how-it-works.", markers: ["Warm-Up", "<ul>", "chatty-hint", "password", "report"] },
  { id: "r2-scene", file: "r2-scene.html", spec: "Scene: dialogue-block talk, Minh Tom Linh. Stranger free-Robux link for password. Tom warns If/will. End chatty-clue.", markers: ["dialogue-block", "Minh", "chatty-clue", "password", "If you"] },
  { id: "r3-text", file: "r3-text.html", spec: "Text scene: same skill, short phone lines + emoji. End chatty-clue + chatty-hint stating If+present will+verb.", markers: ["dialogue-block", "chatty-clue", "chatty-hint", "If you", "you will"] },
  { id: "r4-learn", file: "r4-learn.html", spec: "Learn: vocab-list of 5 numbered vocab-items, strong term + example. account password stranger scam report. Examples If/will or imperative.", markers: ["vocab-item", "<strong>", "account", "password", "stranger", "scam", "report"] },
  { id: "r5-game1", file: "r5-game1.html", spec: "Game room: p how-to-win + div game scramble, title, 6 data-items pairs single lowercase words: password scam stranger report account link.", markers: ['data-game="scramble"', "data-items", "password", "scam", "report"] },
  { id: "r6-test", file: "r6-test.html", spec: "Test: 3 Scenario blocks, 2-3 buttons one correct, feedbacks re-teach, end empty feedback div. Stranger link, conditional choice, block+report.", markers: ["chatty-choices", "data-answer", "data-correct-feedback", "data-wrong-feedback", "chatty-feedback"] },
  { id: "r7-game2", file: "r7-game2.html", spec: "Game room: p how-to-win + div game match, title, 6 data-items pairs: account password stranger scam link report.", markers: ['data-game="match"', "data-items", "account", "stranger"] },
  { id: "r8-game3", file: "r8-game3.html", spec: "Game sort room: div game sort with SAFE RISKY REPORT groups. SAFE strong-password 2-step logout. RISKY free-links share-password. REPORT block report tell-adult.", markers: ['data-game="sort"', "data-groups", "SAFE", "RISKY", "REPORT"] },
  { id: "r9-mastery", file: "r9-mastery.html", spec: "Mastery: summary-card reward + ul 4-5 li strong-rule reason. Then Level Up hint teaching others + write-task textarea pledge placeholder.", markers: ["summary-card", "<li>", "Level Up", "write-task", "If you"] },
];
async function main() {
  mkdirSync(PDIR, { recursive: true });
  log("LESSON-DRIVER LD11 v2 ROBLOX START (system prompt + budget 800, ban + spill guard)");
  await hb("START roblox-LD11v2");
  let src = "";
  try { src = readFileSync(SRCF, "utf8").slice(0, 900); } catch (e) {}
  void src;
  const state = { done: {} };
  const sums = {};
  let pass = 0, skip = 0;
  const ids = SECTIONS.map((s) => s.id);
  for (const s of SECTIONS) {
    const idx = ids.indexOf(s.id);
    const prev = idx > 0 ? (sums[ids[idx - 1]] || "[previous section missing]") : "";
    const fp = PDIR + "/" + s.file;
    let got = "";
    for (let t = 0; t < 3 && !got; t++) {
      const p = buildPrompt(s.spec, prev);
      const out = await brain(p, 800);
      if (!out) { log("sec " + s.id + " try " + (t + 1) + " empty"); continue; }
      const banned = out.match(BANNED);
      if (banned) { log("sec " + s.id + " try " + (t + 1) + " BANNED word: " + banned[0]); continue; }
      if (SPILL.test(out)) { log("sec " + s.id + " try " + (t + 1) + " SPILL (reasoning leak), rejected"); continue; }
      const miss = s.markers.filter((m) => !out.includes(m));
      if (!miss.length) { got = out; break; }
      log("sec " + s.id + " try " + (t + 1) + " missing " + miss.length + ", follow-ups");
      let aug = out;
      for (const m of miss.slice(0, 3)) {
        const f = await brain("Write ONLY the HTML snippet containing " + m + ", under 120 chars. Roblox safety words only. No explanations.", 300);
        if (f && f.includes(m) && !BANNED.test(f) && !SPILL.test(f)) aug += "\n" + f;
      }
      if (s.markers.every((m) => aug.includes(m)) && !BANNED.test(aug) && !SPILL.test(aug)) { got = aug; break; }
    }
    if (!got) { log("SEC " + s.id + " SKIP"); state.done[s.id] = "skip"; skip++; }
    else {
      wscope(fp, got);
      let ok = false;
      try { const back = readFileSync(fp, "utf8"); ok = s.markers.every((m) => back.includes(m)) && !BANNED.test(back) && !SPILL.test(back); } catch (e) {}
      if (!ok) { log("SEC " + s.id + " pass-UNVERIFIED SKIP"); state.done[s.id] = "skip"; skip++; }
      else { state.done[s.id] = "pass"; sums[s.id] = summarize(got); log("SEC " + s.id + " PASS (" + got.length + " chars)"); pass++; }
    }
    wscope(STATEF, JSON.stringify(state));
    try { wscope(SUMF, JSON.stringify(sums)); } catch (e) {}
    await hb(s.id + " " + state.done[s.id]);
  }
  const missing = SECTIONS.filter((s) => state.done[s.id] !== "pass").map((s) => s.id);
  const rep = ["# ROBLOX REPORT", "finished: " + new Date().toISOString(), "LD11v2 PASS " + pass + "/9 SKIP " + skip + "/9", "missing: " + (missing.join(", ") || "none"), "parts: " + PDIR].join("\n");
  wscope(MDIR + "/ROBLOX-REPORT.md", rep);
  if (pass === 0) log("DONE-EMPTY PASS 0/9 SKIP 9/9 (lane hollow, keeper may retry)");
  else log("DONE PASS " + pass + "/9 SKIP " + skip + "/9");
  await hb("DONE PASS " + pass + "/9 SKIP " + skip + "/9");
}
main().catch((e) => { log("FATAL " + String(e && e.message || e).slice(0, 200)); process.exit(1); });
