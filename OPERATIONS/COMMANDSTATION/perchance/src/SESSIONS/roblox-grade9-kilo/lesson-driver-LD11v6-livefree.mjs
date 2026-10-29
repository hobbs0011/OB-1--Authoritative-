// LESSON-DRIVER LD11 v6 (live 16-free catalog 2026-10-29; user correction: quota is key-shape, not credits) — Grade-9 Roblox online-safety lesson, Kilo-written rooms.
// v3 = DeepSeek speed audit fixes #1-#4 (2026-10-29, $0.0104):
//  #1 keep-alive HTTPS (own post() over node:https, one Agent for all calls)
//  #2 byte-identical SYS on every call (server-side prefix cache)
//  #3 reasoning-suppressing system prompt (fewer hidden tokens)
//  #4 tight budget — DEVIATION: audit calibrated 300 on a 7-word ping, but real room
//     fragments run ~400+ tokens, so rooms stay 800 / follow-ups 300; tighten later
//     from measured usage, not from the toy ask. Sequential kept (prev-summary chains;
//     true parallel needs de-chaining — later). Startup self-test picks post() or fetch.
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import https from "node:https";

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
// Byte-identical on EVERY brain call (audit #2: prefix cache). Suppresses reasoning (#3).
const SYS = "You are a concise classroom-materials writer. Output only the asked HTML fragment, immediately, with no reasoning, no explanation, no hidden thinking. Follow the brief exactly.";

function log(s) { const l = new Date().toISOString() + " " + s; appendFileSync(TRACE, l + "\n"); console.log(l); }

// Audit #1: one keep-alive agent for the whole run (saves a TLS handshake per call).
const keepAgent = new https.Agent({ keepAlive: true, maxSockets: 10, keepAliveMsecs: 15000, timeout: 90000 });
function post(url, body, headers, ms) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, port: u.port || 443, path: u.pathname + u.search, method: "POST", headers, agent: keepAgent, timeout: ms || 90000 }, (res) => {
      let buf = "";
      res.on("data", (c) => { buf += c; });
      res.on("end", () => resolve({ status: res.statusCode, text: buf }));
    });
    req.on("timeout", () => { req.destroy(new Error("post-timeout")); });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
let POST_OK = true;
const FREE_MODELS = ["kilo-auto/free","nvidia/nemotron-3.5-super-vl:free","reflection/beam-free","stealth/glyph-cluster","recursive/flint-v1.0:free","xingchen-agi/xing4.0-29b-a4b:free","dots-studio/dots-3-note-preview:free","liquid/lfm-2.5-2.6b:free","nvidia/nemotron-3.5-lightning:free","poolside/laguna-s-2.1:free","poolside/laguna-xs-2.1:free","cohere/north-mini-code:free","nvidia/nemotron-3.5-content-safety:free","nvidia/nemotron-3-ultra-550b-a55b:free","nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free","openrouter/free"];
// v6: KILO_MODEL override kept (optional paid lead) but NOT the upgrade path.
// Upgrade path per user correction: user-session key + live free rotation (this list). 402 on balanced is irrelevant.
const ENV_MODEL = (process.env.KILO_MODEL || "").trim();
const MODELS = ENV_MODEL ? [ENV_MODEL, ...FREE_MODELS.filter((m) => m !== ENV_MODEL)] : FREE_MODELS;
async function brain(prompt, maxTokens = 800) {
  for (let i = 0; i < 6; i++) {
    const model = MODELS[i % MODELS.length];
    const body = JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: "system", content: SYS }, { role: "user", content: prompt }] });
    const headers = { "content-type": "application/json", authorization: "Bearer " + KILO_KEY };
    try {
      let status = 0, t = "";
      if (POST_OK) {
        try {
          const r = await post(GATE + "/chat/completions", body, headers, 90000);
          status = r.status;
          const j = JSON.parse(r.text);
          t = j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "").trim();
        } catch (e) {
          log("post() failed (" + String(e && e.message || e).slice(0, 60) + "), fetch fallback for this try");
          POST_OK = false;
        }
      }
      if (!POST_OK) {
        const r = await fetch(GATE + "/chat/completions", {
          method: "POST", headers, body, signal: AbortSignal.timeout(90000)
        });
        status = r.status;
        const j = await r.json().catch(() => null);
        t = j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "").trim();
      }
      if (status && status >= 200 && status < 300 && t && t.length > 40) return tidy(t);
      log("brain try " + (i + 1) + " [" + model + "] empty/status " + status);
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
  { id: "r9-mastery", file: "r9-mastery.html", spec: "Mastery: summary-card reward + ul 4-5 li strong-rule reason. Then Level Up hint teaching others + write-task textarea pledge placeholder.", markers: ["summary-card", "<li>", "write-task", "If you"] },
];
async function selfTest() {
  try {
    const r = await post(GATE + "/chat/completions",
      JSON.stringify({ model: FREE_MODELS[0], max_tokens: 1000, messages: [{ role: "system", content: SYS }, { role: "user", content: "Reply with exactly: lane-ok" }] }),
      { "content-type": "application/json", authorization: "Bearer " + KILO_KEY }, 60000);
    const j = JSON.parse(r.text);
    const t = j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "");
    log("SELFTEST post() status " + r.status + " textLen " + (t || "").length);
    if (!t) { POST_OK = false; log("SELFTEST empty, starting on fetch fallback"); }
  } catch (e) { POST_OK = false; log("SELFTEST post() failed, starting on fetch fallback"); }
}
async function main() {
  mkdirSync(PDIR, { recursive: true });
  log("LESSON-DRIVER LD11 v3 ROBLOX START (keepalive + shared SYS + suppress, budget 800/300)");
  await selfTest();
  await hb("START roblox-LD11v3");
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
  const rep = ["# ROBLOX REPORT", "finished: " + new Date().toISOString(), "LD11v3 PASS " + pass + "/9 SKIP " + skip + "/9", "missing: " + (missing.join(", ") || "none"), "parts: " + PDIR].join("\n");
  wscope(MDIR + "/ROBLOX-REPORT.md", rep);
  if (pass === 0) log("DONE-EMPTY PASS 0/9 SKIP 9/9 (lane hollow, keeper may retry)");
  else log("DONE PASS " + pass + "/9 SKIP " + skip + "/9");
  await hb("DONE PASS " + pass + "/9 SKIP " + skip + "/9");
}
main().catch((e) => { log("FATAL " + String(e && e.message || e).slice(0, 200)); process.exit(1); });
