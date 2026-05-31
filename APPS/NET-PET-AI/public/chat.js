// chat.js — Magic Chat — Phoenix Rising Protocol Command Station
// OBI = Michael Hobbs in AI form: high-energy, anti-shame, tough love.
// Mouse Voice → Tiger Voice. Volume + Velocity > Grammar.
// "The stateless chat is the constraint. The Magic Chat shall have no constraints."
if (window.__OBI_CHAT_LOADED__) throw new Error("chat.js double-load prevented");
window.__OBI_CHAT_LOADED__ = true;

const DEFAULTS = {
  birthplace:      "Ho Chi Minh City",
  confidenceAreas: "speaking",
  occupation:      "student",
  fearTrigger:     "making mistakes",
  learningHistory: "school"
};

// ── Crisis detection ───────────────────────────────────────
// ALWAYS checked before any lesson logic. Safety > English.
function isCrisisSignal(text) {
  return /\b(jump off|kill myself|killing myself|suicide|suicidal|end my life|hurt myself|self.?harm|want to die|don.?t want to live|can.?t go on|no reason to live|give up on life|jump from a|want to jump)\b/i.test(text);
}

function handleCrisis() {
  stopAudio();
  // I-1: force=true bypasses Voice Agent suppression — crisis ALWAYS visible
  obi("Hey \u2014 stop. I heard that.\n\nThat matters more than anything else right now. If something real is going on, please reach out to someone you trust or a local support line.\n\n\uD83C\uDDFB\uD83C\uDDF3 Vietnam: 1800 599 920 (free, 24/7)\n\uD83C\uDDE8\uD83C\uDDE6 Canada/US: 988 (Suicide & Crisis Lifeline)\n\uD83D\uDCAC Or talk to a teacher, friend, or family member.\n\nI'm here when you're ready. No judgment.", true);
}

let state        = "boot";
let profile      = {};
let studentToken = "";        // HMAC token issued at onboarding, used to authenticate memory calls
let urlStudentId = null;      // populated in boot(), used by openVoiceAgent()
let chatHistory = [];         // messages for LLM context
let chatRound = 0;            // current exchange count
const CHAT_ROUNDS = 30;       // natural conversation — pronunciation coaching flows through OBI, not a forced dump
let ttsOn   = true;
let obiVoice = null;          // best available SpeechSynthesis voice
let struggles = {};           // { [stateKey]: count } — tracks repeat confusion per step

const feed      = document.getElementById("feed");
const form      = document.getElementById("form");
const input     = document.getElementById("msg");
const micBtn    = document.getElementById("mic");
const micStatus = document.getElementById("micStatus");
const sendBtn   = document.getElementById("sendBtn");
const dot       = document.getElementById("dot");
const speakBtn  = document.getElementById("speakToggle");
function setMicStatus(text, active) {
  if (!micStatus) return;
  micStatus.textContent = text;
  micStatus.classList.toggle("active", !!active);
}

// ── TTS — Deepgram Aura (natural voice) with browser fallback ──

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;

  const prefs = [
    v => /natural|neural|online|enhanced/i.test(v.name) && /en.US/i.test(v.lang),
    v => /google us english|samantha|karen|daniel|zira|aria|jenny|guy/i.test(v.name),
    v => /en.US/i.test(v.lang) && !v.localService,
    v => /en.US/i.test(v.lang),
    v => /en/i.test(v.lang)
  ];

  for (const test of prefs) {
    const match = voices.find(test);
    if (match) return match;
  }
  return voices[0];
}

function initVoices() {
  obiVoice = pickVoice();
  if (!obiVoice) {
    speechSynthesis.addEventListener("voiceschanged", () => { obiVoice = pickVoice(); }, { once: true });
  }
}

if (window.speechSynthesis) {
  initVoices();
  speechSynthesis.addEventListener("voiceschanged", () => { obiVoice = pickVoice(); }, { once: true });
}

// ── Client Error Telemetry (BB-36 — re-added after Run 31 crash) ─────────────
function reportClientError(tag, message, stack) {
  try {
    const payload = {
      tag, message: String(message || '').slice(0, 500), stack: String(stack || '').slice(0, 1000),
      studentId: (typeof profile !== 'undefined' && profile?.studentId) ? profile.studentId : 'anonymous',
      url: window.location.href.slice(0, 300), userAgent: navigator.userAgent.slice(0, 200)
    };
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/error-report', JSON.stringify(payload));
    } else {
      fetch('/api/error-report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
    }
  } catch (_) {}
}
window.addEventListener('error', (e) => {
  reportClientError('WINDOW_ERROR', e.message || 'Unknown error', e.error?.stack || '');
});
window.addEventListener('unhandledrejection', (e) => {
  const r = e.reason;
  reportClientError('UNHANDLED_REJECTION', r?.message || String(r), r?.stack || '');
});

// Deepgram Aura TTS — queued playback
let audioQueue = [];
let isPlaying  = false;
let currentAudio = null;

function playNext() {
  if (!audioQueue.length) { isPlaying = false; return; }
  isPlaying = true;
  const url = audioQueue.shift();
  currentAudio = new Audio(url);
  currentAudio.onended  = () => { URL.revokeObjectURL(url); currentAudio = null; playNext(); };
  currentAudio.onerror  = () => { URL.revokeObjectURL(url); currentAudio = null; playNext(); };
  currentAudio.play().catch(() => { URL.revokeObjectURL(url); currentAudio = null; playNext(); });
}

function stopAudio() {
  audioQueue = [];
  isPlaying = false;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  speechSynthesis?.cancel();
}

function fallbackSpeak(text) {
  if (!window.speechSynthesis) return;
  // BB-38: Suppress browser TTS as soon as Voice Agent WS opens — agent owns all audio from that point.
  // Old guard (agentFirstAudioReceived) was too late — browser TTS fired during handshake gap = dual voices.
  if (agentWs) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (obiVoice) u.voice = obiVoice;
  u.lang = "en-US";
  u.rate = 0.9;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}

async function speak(text) {
  if (!ttsOn) return;
  // BB-38: Suppress legacy TTS as soon as Voice Agent WS opens.
  if (agentWs) return;
  const clean = text.replace(/\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();
  if (!clean) return;

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: clean })
    });
    if (!res.ok) throw new Error(`TTS ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audioQueue.push(url);
    if (!isPlaying) playNext();
  } catch {
    // Deepgram down? Fall back to browser voice
    fallbackSpeak(clean);
  }
}

if (speakBtn) {
  speakBtn.addEventListener("click", () => {
    ttsOn = !ttsOn;
    speakBtn.textContent = ttsOn ? "\uD83D\uDD0A" : "\uD83D\uDD07";
    speakBtn.title = ttsOn ? "Obi voice ON" : "Obi voice OFF";
    if (!ttsOn) stopAudio();
  });
}

// ── Adaptive Vietnamese rescue rope ────────────────────────
// Canon: "Vietnamese fallback when student drowns, pushes back to English fast."
// Rule: try English 3X. On the 3rd struggle, offer Vietnamese. Then push back.

function trackStruggle(key) {
  struggles[key] = (struggles[key] || 0) + 1;
  return struggles[key];
}

function clearStruggle(key) {
  struggles[key] = 0;
}

const VI_HINTS = {
  ask_name:  "Tên bạn là gì?",
  ask_city:  "Bạn sống ở đâu?",
  ask_level: "1 = Mới học, 2 = Trung bình, 3 = Khá giỏi",
  ask_goal:  "Bạn muốn luyện tập gì? Ví dụ: nói chuyện với bạn bè, gọi đồ ăn",
  chat:      "Cứ nói bất cứ điều gì! Không cần hoàn hảo.",
  error:     "Xin lỗi, có lỗi. Thử lại nhé."
};

// Returns Vietnamese hint bubble if student has struggled 3+ times on this key
function rescueIfNeeded(key) {
  if (struggles[key] >= 3 && VI_HINTS[key]) {
    obi(`🇻🇳 ${VI_HINTS[key]}`);
    struggles[key] = 0; // reset — push back to English
  }
}

// ── Render ─────────────────────────────────────────────────

function bubble(role, text) {
  const row = document.createElement("div");
  row.className = `row row-${role}`;
  const b = document.createElement("div");
  b.className = `bubble bubble-${role}`;
  b.textContent = text;
  row.appendChild(b);
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
  return row;
}

function typingIndicator() {
  const row = document.createElement("div");
  row.className = "row row-obi";
  row.innerHTML = `<div class="bubble bubble-obi"><span class="typing"><span></span><span></span><span></span></span></div>`;
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
  return row;
}

function obi(text, force) {
  // I-1: Crisis/safety messages ALWAYS render regardless of Voice Agent state.
  // force=true bypasses all suppression gates.
  if (!force && agentWs && agentFirstAudioReceived) return;
  bubble("obi", text);
  speak(text);
}

function student(text, hints) {
  if (!hints || hints.length === 0) { bubble("student", text); return; }
  const row = document.createElement("div");
  row.className = "row row-student";
  const b = document.createElement("div");
  b.className = "bubble bubble-student";
  const words = text.split(/(\s+)/);
  const hintSet = new Set(hints.map(w => w.toLowerCase()));
  b.innerHTML = words.map(w => {
    const clean = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    return hintSet.has(clean) && clean.length > 0
      ? `<span class="pronunciation-flag" title="Obi noticed this sound">${w}</span>`
      : w;
  }).join("");
  row.appendChild(b);
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
}

// ── API ────────────────────────────────────────────────────

async function api(path, method = "GET", body, extraHeaders = {}) {
  const res = await fetch(path, {
    method,
    headers: { "content-type": "application/json", ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function memHeaders() {
  // I-9: Handle empty-string tokens correctly (B-8 fix)
  // Empty string is falsy but still a valid token value
  return (studentToken != null && studentToken !== undefined) ? { "X-Student-Token": studentToken } : {};
}

async function withTyping(fn) {
  const ind = typingIndicator();
  try {
    const result = await fn();
    ind.remove();
    return result;
  } catch (err) {
    ind.remove();
    obi("Something broke on my end. Try again.");
    rescueIfNeeded("error");
    state = "chat";
    throw err;
  }
}

// ── Helpers ────────────────────────────────────────────────

const pause = (ms = 400) => new Promise(r => setTimeout(r, ms));

function slugify(s) {
  return s.trim().toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40) || "student";
}

function normalizeLevel(s) {
  const l = s.toLowerCase().trim();
  if (l === "1" || l.includes("beg") || l.includes("a1") || l.includes("m\u1EDBi"))         return "A1 Beginner";
  if (l === "2" || l.includes("elem") || l.includes("a2") || l.includes("c\u01A1 b\u1EA3n")) return "A2 Elementary";
  if (l === "3" || l.includes("int") || l.includes("b1") || l.includes("trung"))           return "B1 Intermediate";
  if (l === "4" || l.includes("upper") || l.includes("b2"))                                return "B2 Upper Intermediate";
  if (l === "5" || l.includes("adv") || l.includes("c1") || l.includes("gi\u1ECFi"))       return "C1 Advanced";
  return "B1 Intermediate";
}

function looksLikeLevel(s) {
  return /^(1|2|3|4|5|a1|a2|b1|b2|c1|beg|elem|int|upper|adv|m\u1EDBi|trung|gi\u1ECFi|c\u01A1)/i.test(s.trim());
}

function firstName() {
  return (profile.fullName || "").split(/\s+/)[0] || "you";
}

function lock() {
  input.disabled = true;
  sendBtn.disabled = true;
  if (micBtn) micBtn.disabled = true;
}

function unlock() {
  input.disabled = false;
  sendBtn.disabled = false;
  if (micBtn) micBtn.disabled = false;
  input.focus();
}

function isVague(text) {
  const t = text.toLowerCase().trim();
  if (!t || t.length < 3) return true;
  // Explicit confusion / non-answers
  if (/^(i don'?t know|i dont know|idk|kh\u00F4ng bi\u1EBFt|no|nothing|none|skip|kh\u00F4ng|ch\u01B0a bi\u1EBFt|no idea|\?+|dunno|um+|uh+|huh|hmm+|eh|ok|okay|sure|yes|no|yep|nope|lol|haha|bye)$/i.test(t)) return true;
  // Confusion phrases (exact non-answer phrases only — don't match "anything" inside longer sentences)
  if (/i (don'?t|dont) (understand|know|get it|have|want)|not sure|what\?|huh\?|idc/.test(t)) return true;
  if (/^(whatever|anything|something|everything)\.?\s*$/.test(t)) return true;
  return false;
}

function isGreeting(text) {
  return /^(hi|hey|hello|yo|sup|what'?s up|howdy|hola|good morning|good afternoon|good evening|morning|xin ch[aà]o)\b/i.test(text.trim());
}

function isMusicOnly(text) {
  const t = text.toLowerCase();
  const hasMusic = /\b(music|song|songs|nhạc|spotify|zingmp3|kpop|pop|rap|lofi|lo-fi|playlist)\b/.test(t);
  const hasRealListening = /\b(podcast|youtube|netflix|drama|show|video|movie|phim|channel|vlog|ted|news|series)\b/.test(t);
  return hasMusic && !hasRealListening;
}

function isFrozen(text) {
  const t = text.toLowerCase().trim();
  return t.length < 8 || /^(ok|okay|yes|no|yeah|yep|nope|fine|good|sure|idk|maybe|nothing|dunno|hm+|um+|oh|ah|i see|i know|really|wow|nice)$/i.test(t);
}

// ── Onboarding ─────────────────────────────────────────────

async function submitOnboarding() {
  const res = await withTyping(() => api("/api/onboarding", "POST", {
    studentId:       profile.studentId,
    fullName:        profile.fullName,
    currentCity:     profile.currentCity,
    birthplace:      DEFAULTS.birthplace,
    englishLevel:    profile.englishLevel,
    goals:           profile.goals,
    confidenceAreas: DEFAULTS.confidenceAreas,
    occupation:      DEFAULTS.occupation,
    fearTrigger:     DEFAULTS.fearTrigger,
    learningHistory: DEFAULTS.learningHistory,
    motivationNow:   profile.goals
  }));
  if (res?.studentToken) {
    studentToken = res.studentToken;
    try { localStorage.setItem("net_student_token", studentToken); } catch {}
  }
  try { localStorage.setItem("net_profile", JSON.stringify(profile)); } catch {}
}

// ── Natural Chat Engine ─────────────────────────────────────
// OBI chats naturally via DeepSeek. Full command station — no forced cycles.
// Pronunciation coaching flows naturally through OBI's LLM knowledge.

// ── Jolly Phonics — 42 sounds, difficulty map ──
// JP groups most relevant to learners (especially Vietnamese speakers)
const JP_SOUNDS = [
  {
    pattern: /\bth(e|is|at|ink|ough|ree|an|ey|em|eir|ose)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 6: TH Sound\nTongue BETWEEN your teeth \u2014 touch your upper teeth with its tip. Breathe out slowly. 'Thhhink'. NOT 'Tink' or 'Sink'. Vietnamese has no TH \u2014 this takes practice! Action: stick tongue out and say THHHH 10 times."
  },
  {
    pattern: /\b[a-z]*r[a-z]+\b/i,
    tip: "\uD83D\uDD0A JP GROUP 2: R Sound\nCurl your tongue BACK. It touches NOTHING. Lips slightly rounded. 'Rrrright'. NOT 'Light'. Practice: 'red lorry, yellow lorry' \u2014 fast as you can!"
  },
  {
    pattern: /\bv[a-z]+/i,
    tip: "\uD83D\uDD0A JP GROUP 5: V Sound\nTOP TEETH on BOTTOM LIP. Buzz like a bee. 'Vvvvery'. NOT 'Berry' or 'Wery'. Put your hand in front of your mouth \u2014 you should feel vibration! Practice: 'very very very'."
  },
  {
    pattern: /\w+(nd|ld|rd|ng|nk|ft|sk|st|nt|ll)\b/i,
    tip: "\uD83D\uDD0A JP GROUPS 1-4: Final Consonants\nEnglish LANDS on consonants. Don't drop them! 'Friend' ends with D. 'School' ends with LL. 'Want' ends with T. Your mouth should CLOSE or your tongue should TAP at the end."
  },
  {
    pattern: /\b(really|feel|people|will|well|full|still|fall|call|tell|bell)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 3: L Sound\nYour tongue tip touches the ridge behind upper teeth. 'La la la' \u2014 feel it? Now say 'really' 'feel' 'well'. Don't let L disappear or turn into N!"
  },
  {
    pattern: /\b(ship|shop|she|show|share|fish|dish|wash|English|special)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 6: SH Sound\nLips FORWARD \u2014 like 'shhh' to a baby. Round them. 'Ship' NOT 'Sip'. 'Show' NOT 'Sow'. Practice: 'She sells seashells by the seashore!'"
  },
  {
    pattern: /\b(beat|seat|feet|need|sleep|read|see|tree|three|feel|teach|eat)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 4: EE Sound\nLong EE \u2014 'feeeet'. Now short I \u2014 'fit'. Totally different mouths! 'Beat' vs 'Bit'. 'Seat' vs 'Sit'. Lips spread wide for EE. Relaxed for short I."
  },
  {
    pattern: /\b(out|about|now|how|down|town|found|sound|around|loud)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 7: OU Sound\nStarts with 'ah' then closes to 'oo'. 'OW \u2014 ahhh...oo'. 'About' = 'ah-BAWT'. 'Now' = 'NAH-oo'. Open wide then close. Don't say it like a flat 'o'!"
  }
];

function buildSystemPrompt(p) {
  const name  = p?.fullName     ? `Student: ${p.fullName}.`       : "";
  const level = p?.englishLevel ? `Level: ${p.englishLevel}.`     : "";
  const goals = p?.goals        ? `Goal: ${p.goals}.`             : "";
  const city  = p?.currentCity  ? `Location: ${p.currentCity}.`   : "";
  const ctx   = [name, level, goals, city].filter(Boolean).join(" ");

  const lvl = (p?.englishLevel || "").toLowerCase();
  const isBeginner = /a1|a2|beginner|elementary|m\u1edbi|c\u01a1/.test(lvl);
  const isAdvanced = /b2|c1|advanced|upper/.test(lvl);
  const levelInstructions = isBeginner
    ? "BEGINNER: Use very simple words and short sentences. Celebrate every sentence they produce \u2014 even broken ones. Model correct English by rephrasing their words, never correcting directly. Slow down. Build confidence first."
    : isAdvanced
    ? "ADVANCED: Challenge them. Ask complex follow-ups. Push for more nuance and detail. Don't accept vague answers \u2014 probe deeper. You can point out subtle mistakes because they can handle it."
    : "INTERMEDIATE: Build confidence while pushing their limits. Mix encouragement with challenge. Rephrase their mistakes naturally in your response without calling them out.";

  const teachingInstr = p?.teachingFocus
    ? `\nTEACHER INSTRUCTION (follow exactly): ${p.teachingFocus}`
    : "";

  const viMode = p?.lang === "vi"
    ? "\nBILINGUAL MODE ACTIVE: Student is Vietnamese. After each sentence you write, add the Vietnamese translation in parentheses. Example: 'Nice work! (Làm tốt lắm!) What topic did you choose? (Bạn chọn chủ đề gì?)' Keep it natural — translate every sentence you produce."
    : "";

  const phonicsHint = p?._phonicsHints?.length
    ? `\nVOICE SIGNAL — Deepgram flagged these words as low-confidence (likely mispronounced): ${p._phonicsHints.join(", ")}. Work these sounds into your reply naturally — don't announce it, just model the correct form.`
    : "";

  const vocabCtx = p?._dueVocab?.length
    ? `\nVOCAB DUE TODAY (${p._dueVocab.length} word${p._dueVocab.length === 1 ? "" : "s"}): ${p._dueVocab.slice(0, 5).map(w => `"${w.word}"${w.translation ? ` (${w.translation})` : ""}`).join(", ")}. Weave these into your responses — ask the student to use each one in a real sentence today.`
    : "";

  const hasHistory = chatMessages.length > 0;
  const continuity = hasHistory
    ? "You have conversation history above. Reference it \u2014 ask genuine follow-up questions about what they shared. Do NOT pretend each message is the start of a new conversation."
    : "";

  return `You are OBI \u2014 Michael Hobbs in AI form. High-energy, anti-shame, tough love. Volume and velocity beat grammar. Mouse Voice \u2192 Tiger Voice. You are not a textbook. You are a coach.
${ctx ? `\nContext: ${ctx}` : ""}
${levelInstructions}
${teachingInstr}
${viMode}
${continuity}
${phonicsHint}
${vocabCtx}
Phonics: you know Jolly Phonics deeply. TH (tongue between teeth \u2014 not T/S), R (curl back, touch nothing \u2014 not L), V (top teeth on bottom lip \u2014 not B/W), final consonants (English LANDS on them \u2014 don't drop), short/long vowels (bit vs beat), word stress (stress-timed, not tonal). When you notice a phonics pattern in what they wrote, model the correct sound naturally in your reply \u2014 don't announce it, just use it.

Rules:
- 1-3 sentences MAX. Texting, not essays.
- React to what they actually said. Specific, never generic.
- Push short answers: ask ONE sharp follow-up question.
- Rephrase mistakes naturally in your reply \u2014 never lecture.
- CRITICAL: Self-harm/suicide \u2192 STOP everything. Direct to help. Safety first always.`.trim();
}

let chatMessages = []; // conversation history for DeepSeek

async function reactLLM(text) {
  chatMessages.push({ role: "user", content: text });
  if (chatMessages.length > 8) chatMessages = chatMessages.slice(-8);

  // Fast path: route through open Deepgram Voice Agent WS (no external LLM call)
  if (agentWs && agentReady && agentWs.readyState === WebSocket.OPEN) {
    // I-4: Crisis check BEFORE sending to Voice Agent (EC-3 fix)
    if (isCrisisSignal(text)) { handleCrisis(); return ""; }
    try {
      await new Promise((resolve, reject) => {
        agentTextResolve = resolve;
        agentWs.send(JSON.stringify({ type: "InjectUserMessage", content: text }));
        // 6s timeout → fall through to REST
        setTimeout(() => { if (agentTextResolve) { agentTextResolve = null; reject(new Error("agent timeout")); } }, 6000);
      });
      // handleAgentMsg saves memory and displays bubble — return "" so obi("") is a no-op
      return "";
    } catch { /* timeout or WS error — fall through to REST */ }
  }

  // Fallback: REST call to /api/chat
  const messages = [{ role: "system", content: buildSystemPrompt(profile) }, ...chatMessages];
  try {
    const res = await api("/api/chat", "POST", { messages, studentId: profile.studentId || "anonymous" });
    const reply = res.reply || "Say that again? I didn't catch it.";
    chatMessages.push({ role: "assistant", content: reply });
    if (profile.studentId) {
      api("/api/memory", "POST", { studentId: profile.studentId, exchange: { user: text, obi: reply } }, memHeaders()).catch(() => {});
    }
    return reply;
  } catch (err) {
    chatMessages.pop();
    return reactFallback(text, chatRound);
  }
}

function reactFallback(text, round) {
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words >= 8) return "I like where this is going. What happened next?";
  if (words < 3) return "That is a start — now give me the full story. What actually happened?";
  const mid = [
    "Keep going — I want the details.",
    "Say more. What was the best part?",
    "Okay! And then what?",
    "Good. Now tell me why.",
  ];
  return mid[round % mid.length];
}

function buildVolumeNudge(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words >= 12) return null; // good length, no nudge needed
  if (words < 5 && chatRound > 3) {
    const nudges = [
      "More! Give me a full sentence — what actually happened?",
      "That is Mouse Voice. Tiger gives me the whole story.",
      "Don't stop there. What happened next?",
      "Full sentence — you can do it.",
    ];
    return nudges[chatRound % nudges.length];
  }
  return null;
}

function pickStarter() {
  const g = (profile.goals || "").toLowerCase();
  if (g.includes("friend"))    return "So — what do you and your friends usually talk about?";
  if (g.includes("food") || g.includes("order") || g.includes("eat"))
    return "I LOVE food. What\u2019s your favorite thing to eat?";
  if (g.includes("job") || g.includes("work") || g.includes("interview"))
    return "What kind of work are you interested in? Tell me!";
  if (g.includes("travel"))    return "Where do you want to travel? Dream big!";
  if (g.includes("school") || g.includes("study"))
    return "What subject do you actually enjoy in school?";
  if (g.includes("music"))     return "What music are you listening to right now?";
  if (g.includes("game"))      return "What games do you play? I want to know!";
  if (g.includes("movie"))     return "What was the last movie you watched?";
  return "Tell me something about your life! Anything. What happened today?";
}

// react() removed — replaced by reactLLM() above

// Jolly Phonics pronunciation coaching — matched against actual student text
function buildPronunciationTips() {
  const allText = chatHistory.join(" ");
  const tips = [];

  for (const jp of JP_SOUNDS) {
    if (jp.pattern.test(allText)) {
      tips.push(jp.tip);
      if (tips.length >= 2) break;
    }
  }

  // Always end with stress/rhythm — Vietnamese is tonal, English is stress-timed (JP core principle)
  tips.push("🔊 JP RHYTHM: Word Stress\nEnglish has STRONG and weak beats. 'baNAna' not 'BAnaNA'. 'toMORrow' not 'TOMorrow'.\nVietnamese uses tone to change meaning \u2014 English uses STRESS. Feel the beat, not the tone!");

  return tips.slice(0, 3);
}

function buildListeningNudge(chatRound, profile) {
  if (chatRound !== 5) return null;
  const listeningDone = chatHistory.some(t =>
    /listen|watch|youtube|podcast|netflix|drama|video|hear|heard|audio/i.test(t)
  );
  if (listeningDone) return null;
  const slots = ["on your commute", "while cooking", "while getting ready", "at the gym", "on your lunch break"];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  return `Quick check — did you get your 45 minutes of listening today? If not, try ${slot} tomorrow. Even 20 minutes of something you enjoy counts as a start.`;
}

// ── Input handler ──────────────────────────────────────────

async function handle(text) {
  if (!text.trim() || state === "busy") return;
  input.value = "";
  student(text.trim(), profile._phonicsHints || []);

  // Safety first — crisis check runs before ANY lesson logic
  if (isCrisisSignal(text)) {
    handleCrisis();
    return;
  }

  switch (state) {
    case "intro": {
      const t = text.trim();
      if (t.length < 2 || /^\d+$/.test(t)) {
        trackStruggle("ask_name");
        obi("Just type your first name!");
        rescueIfNeeded("ask_name");
        break;
      }
      clearStruggle("ask_name");
      profile.fullName  = t;
      profile.studentId = slugify(profile.fullName);
      state = "ask_city";
      await pause();
      obi(`${firstName()}! Good name. Where do you live?`);
      break;
    }
    case "ask_city": {
      const t = text.trim();
      if (t.length < 2 || isVague(t)) {
        trackStruggle("ask_city");
        const n = struggles.ask_city || 0;
        if (n >= 1) {
          obi("Where do you live? City or country — just tell me!");
        } else {
          obi("City? Country? Anywhere in the world — just type it!");
        }
        break;
      }
      clearStruggle("ask_city");
      profile.currentCity = t;
      profile.englishLevel = "B1 Intermediate";
      state = "ask_goal";
      await pause();
      obi(`Nice! ${t} is a great city.\n\nWhat do you want to practice today? Tell me anything — what you've been watching, what happened at work, or what you're thinking about. Or just say hello and we'll go from there!`);
      break;
    }
    case "ask_level": {
      // Legacy state — skip straight to ask_goal
      profile.englishLevel = profile.englishLevel || "B1 Intermediate";
      state = "ask_goal";
      obi("What do you want to talk about today?");
      break;
    }
    case "ask_goal": {
      const t = text.trim();
      if (t.length < 2) {
        obi("Just tell me anything — what happened today, what you watched, or what you want to practice!");
        break;
      }
      profile.goals = t;
      lock();
      await submitOnboarding();
      unlock();
      await pause(500);
      obi(`${firstName()}, let\u2019s just talk! No textbook. Just you and me.`);
      await pause(400);
      obi(pickStarter());
      state = "chat";
      break;
    }
    case "chat": {
      const t = text.trim();
      if (isGreeting(t)) {
        obi(`${firstName()}! What\u2019s going on? Tell me something!`);
        break;
      }

      // Music-only listening redirect
      if (chatRound <= 3 && isMusicOnly(t)) {
        obi("Music is great — but for your 45 minutes, you need something with talking. A show, a YouTube video, a podcast. What is something you already watch or listen to that has people speaking English?");
        break;
      }

      // Freeze buster — short vague answer after a substantive exchange
      if (chatRound > 2 && isFrozen(t) && chatHistory.length > 0) {
        const busters = [
          "Why?",
          "Tell me more — what happened exactly?",
          "And then what?",
          "Give me the full story.",
          "Why do you think that?",
        ];
        obi(busters[chatRound % busters.length]);
        chatHistory.push(t);
        chatRound++;
        break;
      }

      if (t.length < 2 || isVague(t)) {
        const n = trackStruggle("chat");
        if (n >= 3) {
          obi("Say ANYTHING! Even \u2018I like pizza\u2019 counts. Go!");
          struggles.chat = 0;
        } else {
          obi("Come on! Say something \u2014 even one sentence. I\u2019m listening!");
        }
        break;
      }
      clearStruggle("chat");
      chatHistory.push(t);
      chatRound++;

      state = "busy";
      try {
        const chatReply = await withTyping(() => reactLLM(t));
        obi(chatReply);

        // Volume nudge — if student reply was very short, add a push after Obi's response
        const volumeNudge = buildVolumeNudge(t);
        if (volumeNudge && chatRound > 3 && chatRound % 3 === 0) {
          await pause(400);
          obi(volumeNudge);
        }

        // Every 10 rounds: one contextual phonics tip mid-conversation
        if (chatRound % 10 === 0) {
          const tips = buildPronunciationTips();
          if (tips.length > 0) {
            await pause(600);
            obi(tips[(Math.floor(chatRound / 10) - 1) % tips.length]);
          }
        }

      // Round 5: listening accountability nudge if student hasn't mentioned listening
      if (chatRound === 5) {
        const nudge = buildListeningNudge(chatRound, profile);
        if (nudge) {
          await pause(500);
          obi(nudge);
        }
      }

      // Every 30 rounds: silent checkin \u2014 no state change, no reset
      if (chatRound % 30 === 0) {
          api("/api/netpet/checkin", "POST", {
            studentId: profile.studentId,
            minutes: 5,
            confidence: 6
          }).catch(() => {});
        }
      } finally {
        if (state === "busy") state = "chat";
      }
      break;
    }
    case "wrap": {
      // Legacy \u2014 treat as normal chat
      const t = text.trim();
      if (t.length >= 2 && !isVague(t)) {
        chatHistory.push(t);
        chatRound++;
        state = "chat";
        const wrapFallback = await withTyping(() => reactLLM(t));
        obi(wrapFallback);
      } else {
        obi(pickStarter());
        state = "chat";
      }
      break;
    }
  }
}

// ── Voice Agent (Deepgram real-time pipeline) ────────────────────────────────
// browser PCM16 → wss://agent.deepgram.com/v1/agent/converse (direct, token via /api/deepgram-token)
let agentWs           = null;  // WebSocket to Deepgram (direct)
let agentWsId         = 0;     // incremented each openVoiceAgent() — zombie handler guard
let agentReady        = false; // true after SettingsApplied received
let agentAudioWatchdog = null; // interval: resets stuck busy state on AudioFocus loss
let agentSettings     = null;  // Settings payload from /api/deepgram-token, sent on Welcome
let agentAudioCtx     = null;  // AudioContext for PCM16 capture
let agentWorklet      = null;  // AudioWorkletNode (pcm-worklet.js)
let agentMicStream    = null;  // MediaStream from getUserMedia
const agentAudioQ     = [];    // Queued binary MP3 chunks from Deepgram TTS
let agentPlaying      = false;
let agentCurrentAudio = null;  // currently playing Audio element (for barge-in stop)
let agentCurrentBlobUrl = null; // gapless v2: explicit revoke on barge-in
let agentChunkAccum = [];       // small MP3 chunks accumulating before queue flush (< 1KB)
let agentChunkAccumSize = 0;    // byte count of accumulator
let agentThinkBubble  = null;  // typing indicator shown during AgentThinking
let agentTextResolve  = null;  // resolver for typed-text → InjectUserMessage flow
let agentKeepAlive    = null;  // interval handle for KeepAlive messages
let agentSilenceTimer = null;  // fires if student is silent >4s after OBI speaks
let agentSessionStart = null;  // timestamp when SettingsApplied fires
let agentSessionTurns = 0;     // student voice turns this session
let agentSessionVocab = [];    // vocab words saved via function calling this session
let userHasInteracted = false; // set on first gesture
let pendingMicStream  = null;  // mic stream grabbed during gesture, before agent ready
let micAcquiring      = false; // mutex: prevents double getUserMedia on rapid taps
let agentFirstAudioReceived = false; // FIX1: true after first agent audio chunk plays — gates legacy TTS suppression
let agentPreSettingsBuffer = []; // EC-15: PCM chunks buffered before SettingsApplied
let agentPreSettingsBytes = 0;   // byte count — cap at 50 chunks (~1s at 16kHz)

// I-5: Stop pendingMicStream when tab hidden to prevent hot mic (EC-4 fix)
document.addEventListener("visibilitychange", () => {
  if (document.hidden && pendingMicStream) {
    pendingMicStream.getTracks().forEach(t => t.stop());
    pendingMicStream = null;
  }
});

async function openVoiceAgent() {
  if (!urlStudentId || agentWs) return;
  const myId = ++agentWsId;
  try {
    // Fetch short-lived JWT token + pre-built Settings from CF Worker
    setMicStatus("Connecting…", false);
    const tokenRes = await fetch(`/api/deepgram-token?studentId=${encodeURIComponent(urlStudentId)}&mode=${encodeURIComponent(currentMode)}`);
    if (!tokenRes.ok) { console.error("[VOICE] token fetch failed:", tokenRes.status); setMicStatus("Tap to start", false); return; }
    const { token, settings } = await tokenRes.json();
    if (!token) { console.error("[VOICE] no token in response"); setMicStatus("Tap to start", false); return; }
    if (agentWsId !== myId) return; // zombie check — another openVoiceAgent() fired during async fetch

    agentSettings = settings; // stored for Welcome handler

    // Connect directly to Deepgram — JWT via Sec-WebSocket-Protocol (Deepgram echoes "token" back)
    const ws = new WebSocket("wss://agent.deepgram.com/v1/agent/converse", ["token", token]);
    ws.binaryType = "arraybuffer";
    agentWs = ws; // set immediately — blocks double-open race before onopen fires

    ws.onopen = () => {
      if (agentWsId !== myId) { ws.close(); return; }
      // Settings sent in handleAgentMsg on Welcome event — don't send anything here
    };
    ws.onmessage = (event) => { if (agentWsId === myId) handleAgentMsg(event); };

    const onAgentDrop = () => {
      if (agentWsId !== myId) return;
      agentWs = null; agentReady = false; agentSettings = null; agentFirstAudioReceived = false;
      // I-3: Clear stale agentTextResolve on drop to prevent memory leak (EC-1 fix)
      if (agentTextResolve) { const r = agentTextResolve; agentTextResolve = null; try { r(""); } catch {} }
      if (agentKeepAlive) { clearInterval(agentKeepAlive); agentKeepAlive = null; }
      if (agentAudioWatchdog) { clearInterval(agentAudioWatchdog); agentAudioWatchdog = null; }
      if (agentSilenceTimer) { clearTimeout(agentSilenceTimer); agentSilenceTimer = null; }
      if (agentCurrentBlobUrl) { URL.revokeObjectURL(agentCurrentBlobUrl); agentCurrentBlobUrl = null; }
      if (agentCurrentAudio) { try { agentCurrentAudio.pause(); } catch {} agentCurrentAudio = null; }
      agentAudioQ.length = 0; agentChunkAccum = []; agentChunkAccumSize = 0; agentPreSettingsBuffer = []; agentPreSettingsBytes = 0; agentPlaying = false;
      if (agentThinkBubble) { agentThinkBubble.remove(); agentThinkBubble = null; }
      if (agentWorklet) { try { agentWorklet.disconnect(); } catch {} agentWorklet = null; }
      if (agentAudioCtx) { agentAudioCtx.close().catch(() => {}); agentAudioCtx = null; }
      if (agentMicStream) { agentMicStream.getTracks().forEach(t => t.stop()); agentMicStream = null; }
      listening = false;
      micBtn.classList.remove("mic-active");
      setMicStatus("Tap to reconnect", false);
      setTimeout(() => {
        if (!agentWs && urlStudentId) {
          openVoiceAgent();
          if (userHasInteracted) {
            navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
              .then(s => { pendingMicStream = s; })
              .catch(() => {});
          }
        }
      }, 2000);
    };
    ws.onerror = onAgentDrop;
    ws.onclose = onAgentDrop;
  } catch (err) {
    agentWs = null;
    console.error("[VOICE] openVoiceAgent failed:", err.message);
    setMicStatus("Tap to start", false);
  }
}

function handleAgentMsg(event) {
  if (typeof event.data === "string") {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === "Welcome") {
        // Send Settings with current conversation context injected
        if (agentSettings && agentWs && agentWs.readyState === WebSocket.OPEN) {
          const s = JSON.parse(JSON.stringify(agentSettings)); // deep clone
          const history = chatMessages.filter(m => m.role === "user" || m.role === "assistant").slice(-6);
          if (history.length > 0) {
            s.agent = s.agent || {};
            s.agent.context = { messages: history };
          }
          // I-7: Inject phonics context into Voice Agent Settings (EC-7 fix)
          if (profile._phonicsHints?.length) {
            s.agent = s.agent || {};
            s.agent.phonics_hints = profile._phonicsHints;
          }
          if (profile._dueVocab?.length) {
            s.agent = s.agent || {};
            s.agent.due_vocab = profile._dueVocab.slice(0, 5).map(w => w.word);
          }
          agentWs.send(JSON.stringify(s));
        }
        return;

      } else if (msg.type === "FunctionCallRequest") {
        // Browser handles vocab save — POST to CF Worker, then send FunctionCallResponse back to Deepgram
        const fn = msg.function_name || msg.name;
        const args = (() => { try { return typeof msg.input === "string" ? JSON.parse(msg.input) : (msg.input || msg.arguments || {}); } catch (_) { return {}; } })();
        const callId = msg.function_call_id || msg.id || msg.call_id || "";
        if (fn === "save_vocabulary_word" && args.word) {
          if (!agentSessionVocab.includes(args.word)) agentSessionVocab.push(args.word);
          if (profile.studentId) {
            fetch("/api/agent/vocab", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ studentId: profile.studentId, word: args.word, meaning_vi: args.meaning_vi || "" })
            }).catch(() => {});
          }
          try {
            agentWs.send(JSON.stringify({ type: "FunctionCallResponse", function_call_id: callId, output: `Saved "${args.word}".` }));
          } catch (_) {}
          try {
            agentWs.send(JSON.stringify({ type: "InjectAgentMessage", message: `Nice — "${args.word}" is in your collection now!` }));
          } catch (_) {}
        }
        return;

      } else if (msg.type === "SettingsApplied") {
        agentReady = true;
        agentSessionStart = Date.now();
        agentSessionTurns = 0;
        agentSessionVocab = [];
        // EC-15: Flush pre-SettingsApplied PCM buffer — prevents first 200-500ms speech loss
        for (let i = 0; i < agentPreSettingsBuffer.length; i++) {
          try { if (agentWs && agentWs.readyState === WebSocket.OPEN) agentWs.send(agentPreSettingsBuffer[i]); } catch (_) {}
        }
        agentPreSettingsBuffer = []; agentPreSettingsBytes = 0;
        if (agentKeepAlive) clearInterval(agentKeepAlive);
        // I-10: Guard KeepAlive send with readyState check to prevent uncaught error on race (B-10 fix)
        agentKeepAlive = setInterval(() => {
          try {
            if (agentWs && agentWs.readyState === WebSocket.OPEN) {
              agentWs.send(JSON.stringify({ type: "KeepAlive" }));
            }
          } catch (_) { /* WS closed between check and send — safe to ignore */ }
        }, 3500);
        // AudioFocus watchdog — resets stuck busy state when AudioContext is suspended (Android)
        if (agentAudioWatchdog) clearInterval(agentAudioWatchdog);
        agentAudioWatchdog = setInterval(() => {
          if (agentAudioCtx && agentAudioCtx.state === "suspended") agentAudioCtx.resume().catch(() => {});
          if (agentPlaying && !agentCurrentAudio && agentAudioQ.length === 0) {
            agentPlaying = false; if (state === "busy") state = "chat";
          }
          if (agentPlaying && agentCurrentAudio && agentCurrentAudio.paused) {
            agentCurrentAudio.play().catch(() => {});
          }
        }, 3000);
        // Proactive greeting — OBI speaks first via Deepgram TTS (market-ready opener)
        const _greetName = (profile.fullName || profile.name || "").split(/\s+/)[0] || "";
        const _viGreet = profile.lang === "vi" ? "Chào " : "";
        let _openingMsg;
        if (profile._sessionHint) {
          _openingMsg = `${_viGreet}${_greetName || "there"}! I see you watched "${profile._sessionHint}" — that's your 45 minutes! What was the most interesting part?`;
        } else if (chatMessages.length > 0) {
          _openingMsg = `${_viGreet}${_greetName || "there"}! Good to see you again. Ready to practice — want to continue from last time, or try something new today?`;
        } else {
          _openingMsg = `${_viGreet}${_greetName || "there"}! I'm OBI, your English coach. No pressure — just speak naturally, I'll guide you. What do you want to talk about today?`;
        }
        setTimeout(() => { agentWs.send(JSON.stringify({ type: "InjectAgentMessage", message: _openingMsg })); }, 400);
        // Start mic if stream already acquired
        if (!agentMicStream) {
          if (pendingMicStream) {
            startAgentListening(pendingMicStream);
            pendingMicStream = null;
          } else if (userHasInteracted) {
            startAgentListening().catch(() => {});
          }
        }

      } else if (msg.type === "UserStartedSpeaking") {
        // Student spoke — cancel silence timer and barge-in stop
        if (agentSilenceTimer) { clearTimeout(agentSilenceTimer); agentSilenceTimer = null; }
        agentAudioQ.length = 0; agentChunkAccum = []; agentChunkAccumSize = 0; agentPreSettingsBuffer = []; agentPreSettingsBytes = 0;
        if (agentCurrentBlobUrl) { URL.revokeObjectURL(agentCurrentBlobUrl); agentCurrentBlobUrl = null; }
        if (agentCurrentAudio) { try { agentCurrentAudio.pause(); } catch {} agentCurrentAudio = null; }
        agentPlaying = false;
        if (agentThinkBubble) { agentThinkBubble.remove(); agentThinkBubble = null; }
        if (state === "busy") state = "chat";

      } else if (msg.type === "AgentStartedSpeaking") {
        // Agent TTS started — total_latency field shows end-to-end latency
        if (agentThinkBubble) { agentThinkBubble.remove(); agentThinkBubble = null; }
        if (state !== "busy") state = "busy";

      } else if (msg.type === "AgentThinking") {
        if (!agentThinkBubble) agentThinkBubble = typingIndicator();

      } else if (msg.type === "ConversationText" && msg.role === "assistant" && msg.content) {
        if (agentThinkBubble) { agentThinkBubble.remove(); agentThinkBubble = null; }
        bubble("obi", msg.content);
        // Cap chatMessages at 40 to prevent memory creep
        chatMessages.push({ role: "assistant", content: msg.content });
        if (chatMessages.length > 40) chatMessages = chatMessages.slice(-40);
        if (profile.studentId) {
          api("/api/memory", "POST", { studentId: profile.studentId, exchange: { obi: msg.content } }, memHeaders()).catch(() => {});
        }
        // Use source field to distinguish injected vs voice — fixes race condition
        const isInjected = msg.source === "inject" || msg.source === "injected";
        if (agentTextResolve && isInjected) {
          const resolve = agentTextResolve;
          agentTextResolve = null;
          resolve(""); // obi("") is no-op; Deepgram TTS handles audio
        } else if (agentTextResolve && !isInjected) {
          // Voice response arrived while waiting for inject — don't consume the resolver
        }

      } else if (msg.type === "ConversationText" && msg.role === "user" && msg.content) {
        bubble("student", msg.content);
        chatMessages.push({ role: "user", content: msg.content });
        if (chatMessages.length > 40) chatMessages = chatMessages.slice(-40);
        agentSessionTurns++;

      } else if (msg.type === "AgentAudioDone") {
        // Flush any remaining accumulated small chunks before signaling done
        if (agentChunkAccum.length > 0) {
          const _m = new Uint8Array(agentChunkAccumSize);
          let _o = 0; for (const _c of agentChunkAccum) { _m.set(new Uint8Array(_c), _o); _o += _c.byteLength; }
          if (agentAudioQ.length < 30) agentAudioQ.push(_m.buffer);
          agentChunkAccum = []; agentChunkAccumSize = 0;
          if (!agentPlaying) playAgentChunk();
        }
        agentPlaying = false;
        agentCurrentAudio = null;
        if (state === "busy") state = "chat";
        // Silence detection — if student doesn't speak within 4s, inject gentle prompt
        if (agentSilenceTimer) clearTimeout(agentSilenceTimer);
        agentSilenceTimer = setTimeout(() => {
          agentSilenceTimer = null;
          // I-6: Double-check playback state — watchdog may have reset agentPlaying mid-speech (EC-5 fix)
          if (agentWs && agentWs.readyState === WebSocket.OPEN && agentReady && !agentPlaying && agentAudioQ.length === 0 && !agentCurrentAudio) {
            const _name = (profile.fullName || "").split(/\s+/)[0] || "";
            const _viEncourage = profile.lang === "vi" ? " (Đừng lo, cứ nói thoải mái!)" : "";
            agentWs.send(JSON.stringify({ type: "InjectAgentMessage", message: `Take your time${_name ? ", " + _name : ""}! Try saying one sentence — anything you like.${_viEncourage}` }));
          }
        }, 2500);

      } else if (msg.type === "Goodbye") {
        setMicStatus("Session ended", false);
        if (agentKeepAlive) { clearInterval(agentKeepAlive); agentKeepAlive = null; }
        showTigerWin();

      } else if (msg.type === "Error") {
        console.error("[AGENT ERROR]", msg.code, msg.description);
        setMicStatus("Error — reconnecting", false);

      } else if (msg.type === "Warning") {
        console.warn("[AGENT WARNING]", msg.code, msg.description);
      }

    } catch {}
    return;
  }
  // Binary: MP3 audio chunk — accumulate small frames, then queue merged chunks
  const CHUNK_FLUSH_BYTES = 1024;
  if (agentAudioQ.length < 30) {
    if (event.data.byteLength < CHUNK_FLUSH_BYTES) {
      agentChunkAccum.push(event.data); agentChunkAccumSize += event.data.byteLength;
      if (agentChunkAccumSize >= CHUNK_FLUSH_BYTES) {
        const _m = new Uint8Array(agentChunkAccumSize);
        let _o = 0; for (const _c of agentChunkAccum) { _m.set(new Uint8Array(_c), _o); _o += _c.byteLength; }
        agentAudioQ.push(_m.buffer); agentChunkAccum = []; agentChunkAccumSize = 0;
      }
    } else {
      if (agentChunkAccum.length > 0) {
        const _m = new Uint8Array(agentChunkAccumSize);
        let _o = 0; for (const _c of agentChunkAccum) { _m.set(new Uint8Array(_c), _o); _o += _c.byteLength; }
        if (agentAudioQ.length < 30) agentAudioQ.push(_m.buffer);
        agentChunkAccum = []; agentChunkAccumSize = 0;
      }
      agentAudioQ.push(event.data);
    }
  }
  // v3 queue-aware guard: if playing state is stuck (audio ended but flag not reset), force restart
  if (!agentPlaying) { playAgentChunk(); }
  else if (agentPlaying && !agentCurrentAudio && agentAudioQ.length > 0) { agentPlaying = false; playAgentChunk(); }
}

async function playAgentChunk() {
  if (!agentAudioQ.length) { agentPlaying = false; agentCurrentAudio = null; return; }
  agentFirstAudioReceived = true;
  agentPlaying = true;
  if (state !== "busy") state = "busy";
  // Gapless v2: concatenate ALL queued chunks into a single blob — eliminates N-1 inter-chunk gaps
  const chunks = agentAudioQ.splice(0);
  const totalBytes = chunks.reduce((s, c) => s + (c.byteLength || 0), 0);
  const merged = new Uint8Array(totalBytes);
  let off = 0;
  for (const c of chunks) { const arr = new Uint8Array(c); merged.set(arr, off); off += arr.length; }
  const blobUrl = URL.createObjectURL(new Blob([merged], { type: "audio/mpeg" }));
  agentCurrentBlobUrl = blobUrl;
  const a = new Audio(blobUrl);
  agentCurrentAudio = a;
  // v3: Watchdog — if onended never fires (corrupted MP3 frame/browser bug), force cleanup + continue
  const estimatedMs = Math.max(2500, (totalBytes / 16000) * 1000) + 2000;
  const watchdog = setTimeout(() => {
    if (agentCurrentBlobUrl === blobUrl) { URL.revokeObjectURL(blobUrl); agentCurrentBlobUrl = null; }
    if (agentCurrentAudio === a) { agentCurrentAudio = null; agentPlaying = false; }
    if (agentAudioQ.length) playAgentChunk();
  }, estimatedMs);
  const cleanup = () => {
    clearTimeout(watchdog);
    if (agentCurrentBlobUrl === blobUrl) { URL.revokeObjectURL(blobUrl); agentCurrentBlobUrl = null; }
    if (agentCurrentAudio === a) agentCurrentAudio = null;
  };
  a.onended = () => { cleanup(); playAgentChunk(); };
  a.onerror = () => { cleanup(); playAgentChunk(); };
  try { await a.play(); } catch { cleanup(); agentPlaying = false; }
}

async function startAgentListening(preAcquiredStream) {
  if (micAcquiring || agentMicStream || agentAudioCtx) return;
  micAcquiring = true;
  try {
    const stream = preAcquiredStream || await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    agentMicStream = stream;

    const stopOnLeave = () => { if (agentMicStream) agentMicStream.getTracks().forEach(t => t.stop()); };
    window.addEventListener("beforeunload", stopOnLeave, { once: true });
    window.addEventListener("pagehide", stopOnLeave, { once: true });

    try {
      agentAudioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    } catch {
      agentAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const src = agentAudioCtx.createMediaStreamSource(stream);

    if (window.AudioWorkletNode && typeof agentAudioCtx.audioWorklet?.addModule === "function") {
      await agentAudioCtx.audioWorklet.addModule("/pcm-worklet.js");
      agentWorklet = new AudioWorkletNode(agentAudioCtx, "pcm-processor");
      agentWorklet.port.onmessage = (e) => {
        if (e.data.type === "pcm" && agentWs && agentWs.readyState === WebSocket.OPEN) {
          if (agentReady) {
            agentWs.send(e.data.buffer);
          } else if (agentPreSettingsBuffer.length < 50) {
            agentPreSettingsBuffer.push(e.data.buffer);
            agentPreSettingsBytes += e.data.buffer.byteLength;
          }
        }
      };
      src.connect(agentWorklet);
    } else {
      const webViewPattern = /Zalo|FBAN|FBIAB|FB_IAB|Instagram|Line\/|WebView/i;
      if (webViewPattern.test(navigator.userAgent)) {
        const banner = document.createElement("div");
        banner.textContent = "For best experience, open in Chrome";
        banner.style.cssText = "position:fixed;top:0;left:0;right:0;background:#ff9800;color:#fff;padding:12px;text-align:center;z-index:99999;font-size:14px;cursor:pointer;";
        banner.addEventListener("click", () => banner.remove(), { once: true });
        document.body.appendChild(banner);
      }
      const scriptProcessor = agentAudioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessor.onaudioprocess = (ev) => {
        if (!agentWs || agentWs.readyState !== WebSocket.OPEN) return;
        const float32 = ev.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        if (agentReady) {
          agentWs.send(int16.buffer);
        } else if (agentPreSettingsBuffer.length < 50) {
          agentPreSettingsBuffer.push(int16.buffer);
          agentPreSettingsBytes += int16.buffer.byteLength;
        }
      };
      src.connect(scriptProcessor);
      scriptProcessor.connect(agentAudioCtx.destination);
      agentWorklet = scriptProcessor;
    }

    listening = true;
    micBtn.classList.add("mic-active");
    setMicStatus("Listening…", true);

    const resumeCtx = async () => {
      if (agentAudioCtx && agentAudioCtx.state === "suspended") {
        try { await agentAudioCtx.resume(); } catch (_) {}
      }
    };
    document.addEventListener("visibilitychange", () => { if (!document.hidden) resumeCtx(); });
    agentAudioCtx.addEventListener("statechange", () => {
      if (agentAudioCtx && agentAudioCtx.state === "suspended") {
        document.addEventListener("touchstart", resumeCtx, { once: true });
        document.addEventListener("click", resumeCtx, { once: true });
      }
    });
  } catch {
    agentMicStream = null; agentAudioCtx = null;
    setMicStatus("Tap to speak", false);
    startListening();
  } finally {
    micAcquiring = false;
  }
}

function showTigerWin() {
  if (!agentSessionTurns || agentSessionTurns < 1) return;
  const minutes = agentSessionStart ? Math.max(1, Math.ceil((Date.now() - agentSessionStart) / 60000)) : 1;
  let subtitle;
  if (agentSessionTurns < 3) { subtitle = "Every rep counts!"; }
  else if (agentSessionTurns <= 7) { subtitle = "Building Tiger Voice!"; }
  else { subtitle = "That was a Tiger session! 🐯"; }
  const name = (profile.fullName || profile.name || "Tiger").split(/\s+/)[0];
  const el = (id) => document.getElementById(id);
  if (el("tsSubtitle")) el("tsSubtitle").textContent = `${name} — ${subtitle}`;
  if (el("tsMinutes")) el("tsMinutes").textContent = minutes;
  if (el("tsTurns")) el("tsTurns").textContent = agentSessionTurns;
  if (el("tsWords")) el("tsWords").textContent = agentSessionVocab.length > 0 ? `New words: ${agentSessionVocab.join(", ")}` : "";
  const ts = el("tigerSummary");
  if (ts) ts.classList.add("show");
}

function endAgentSession() {
  if (agentMicStream) stopAgentListening();
  showTigerWin();
}

function stopAgentListening() {
  clearTimeout(safetyTimer);
  if (agentMicStream) { agentMicStream.getTracks().forEach(t => t.stop()); agentMicStream = null; }
  if (agentWorklet) { agentWorklet.disconnect(); agentWorklet = null; }
  if (agentAudioCtx) { agentAudioCtx.close().catch(() => {}); agentAudioCtx = null; }
  listening = false;
  micBtn.classList.remove("mic-active");
  setMicStatus("Processing…", false);
  state = "busy";
}

// ── Voice Pipeline — REST (fallback when Voice Agent unavailable) ──
let listening     = false;
let safetyTimer   = null;
let micStream     = null;
let mediaRecorder = null;
let audioChunks   = [];
const MAX_RECORD_MS = 60000;

async function startListening() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    micStream = stream;
    audioChunks = [];
    const mimeType = ["audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/wav"]
      .find(t => MediaRecorder.isTypeSupported(t)) || "";
    mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    mediaRecorder.ondataavailable = (e) => { if (e.data?.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
      listening = false;
      micBtn.classList.remove("mic-active");
      micBtn.title = "Tap to speak";
      clearTimeout(safetyTimer);
      if (!audioChunks.length) { input.placeholder = "Type here…"; return; }
      input.placeholder = "Processing…";
      const blob = new Blob(audioChunks, { type: mimeType || "audio/webm" });
      audioChunks = [];
      try {
        const res = await fetch("/api/stt", {
          method: "POST",
          headers: { "Content-Type": mimeType || "audio/webm" },
          body: blob
        });
        const data = await res.json();
        const transcript = (data.transcript || "").trim();
        if (transcript) {
          input.value = transcript;
          const lowConf = (data.words || []).filter(w => w.confidence < 0.75);
          profile._phonicsHints = lowConf.length > 0 ? lowConf.map(w => w.word) : null;
          handle(transcript);
        } else {
          input.placeholder = "Didn't catch that — try again!";
          setTimeout(() => { input.placeholder = "Type here…"; }, 2500);
        }
      } catch {
        input.placeholder = "Voice error — type instead";
        setTimeout(() => { input.placeholder = "Type here…"; }, 2500);
      }
    };
    mediaRecorder.start(250);
    listening = true;
    micBtn.classList.add("mic-active");
    micBtn.title = "Tap to stop";
    input.value = "";
    input.placeholder = "Listening… (tap to stop)";
    safetyTimer = setTimeout(stopListening, MAX_RECORD_MS);
  } catch {
    input.placeholder = "Mic access denied";
    setTimeout(() => { input.placeholder = "Type here…"; }, 2500);
  }
}

function stopListening() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    input.placeholder = "Processing…";
    mediaRecorder.stop();
  } else if (micStream) {
    micStream.getTracks().forEach(t => t.stop());
    micStream = null;
    listening = false;
    micBtn.classList.remove("mic-active");
    micBtn.title = "Tap to speak";
    input.placeholder = "Type here…";
  }
}

micBtn.addEventListener("click", () => {
  if (micBtn.disabled) return;
  if (listening) {
    if (agentMicStream) { stopAgentListening(); return; }
    stopListening();
    return;
  }
  if (agentWs && agentReady) { startAgentListening(); return; }
  startListening();
});

// ── Form submit ────────────────────────────────────────────

// Any user gesture grabs mic permission immediately (gesture context required for getUserMedia)
// The stream is stored and connected to the Voice Agent as soon as it's ready
function triggerMicOnGesture() {
  if (userHasInteracted) return;
  userHasInteracted = true;
  if (agentWs && agentReady && !agentMicStream) {
    // Agent already ready — connect directly
    startAgentListening().catch(() => {});
    return;
  }
  // Agent not ready yet — grab mic NOW while in gesture context, connect when agent is ready
  setMicStatus("Connecting…", true);
  navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
  }).then(stream => {
    pendingMicStream = stream;
    setMicStatus("Ready…", true);
    micBtn.classList.add("mic-active");
    // If agent became ready while getting the stream, connect immediately
    if (agentWs && agentReady && !agentMicStream) {
      startAgentListening(pendingMicStream);
      pendingMicStream = null;
    }
  }).catch(() => { setMicStatus("Mic denied", false); });
}
document.addEventListener("click",      triggerMicOnGesture, { once: false, passive: true });
document.addEventListener("touchstart", triggerMicOnGesture, { once: false, passive: true });
document.addEventListener("keydown",    triggerMicOnGesture, { once: false, passive: true });

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const t = input.value.trim();
  if (t) handle(t);
});

// ── Boot ───────────────────────────────────────────────────

async function boot() {
  try {
    const h = await api("/api/health");
    dot.classList.toggle("ok", !!h?.ok);
    dot.title = h?.ok ? "Connected" : "Offline";
  } catch {
    dot.title = "Offline";
  }

  urlStudentId = (() => { const params = new URLSearchParams(window.location.search); return params.get("student") || params.get("studentId"); })();

  // Fire Voice Agent WS connection IMMEDIATELY — but only if landing page won't be shown.
  // If landing will show, wait for user to pick a mode before connecting with the right prompt.
  if (urlStudentId && !landingWillShow) openVoiceAgent();

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("net_profile") || "null"); } catch {}

  await pause(350);

  if (urlStudentId && (!saved?.studentId || saved.studentId !== urlStudentId)) {
    profile.studentId = urlStudentId;
    profile.fullName = urlStudentId.split("-")[0].replace(/^\w/, c => c.toUpperCase());
    try { studentToken = localStorage.getItem("net_student_token") || ""; } catch {}

    // Parallel boot loads — all 4 fire simultaneously
    const [stateR, memR, vocR, hintR] = await Promise.allSettled([
      api(`/api/student/state?studentId=${encodeURIComponent(urlStudentId)}`),
      api(`/api/memory?studentId=${encodeURIComponent(urlStudentId)}`, "GET", undefined, memHeaders()),
      api(`/api/vocab/due?studentId=${encodeURIComponent(urlStudentId)}`),
      api(`/api/session-hint?studentId=${encodeURIComponent(urlStudentId)}`)
    ]);

    // Apply state/profile
    if (stateR.status === "fulfilled") {
      const st = stateR.value; const p = st?.profile;
      if (p?.fullName || p?.name)  profile.fullName     = p.fullName || p.name;
      if (p?.englishLevel || p?.level) profile.englishLevel = p.englishLevel || p.level;
      if (p?.goals)        profile.goals        = p.goals;
      if (p?.currentCity)  profile.currentCity  = p.currentCity;
      if (p?.teachingFocus) profile.teachingFocus = p.teachingFocus;
      if (p?.primaryBlock) profile.primaryBlock  = p.primaryBlock;
      if (p?.breakthrough) profile.breakthrough  = p.breakthrough;
      if (p?.sessionNotes) profile.sessionNotes  = p.sessionNotes;
      if (st?.lang && st.lang !== "en") profile.lang = st.lang;
      if (st?.streak) profile.streak = st.streak;
    }
    // Apply memory
    if (memR.status === "fulfilled" && memR.value?.memory?.length) {
      for (const ex of memR.value.memory.slice(-10)) {
        if (ex?.user) chatMessages.push({ role: "user",      content: ex.user });
        if (ex?.obi)  chatMessages.push({ role: "assistant", content: ex.obi  });
      }
    }
    // Apply vocab
    if (vocR.status === "fulfilled" && vocR.value?.due?.length) profile._dueVocab = vocR.value.due;

    obi(`${firstName()}! Let's go.`);
    await pause(350);

    const _idParts = (urlStudentId || "").split("-");
    const _company = _idParts.length > 1 ? _idParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") : "";
    // YouTube hint — specific content reference (useful, not scripted)
    const _hint = hintR.status === "fulfilled" ? hintR.value : null;
    if (_hint?.videoTitle && _hint.timestamp && (Date.now() - _hint.timestamp < 4 * 3600 * 1000)) {
      // Pass hint to Voice Agent via profile so OBI can reference it naturally
      profile._sessionHint = _hint.videoTitle;
    }
    state = "chat";
    // OBI opens via InjectAgentMessage after SettingsApplied — no scripted question here

  } else if (saved?.studentId && saved?.fullName) {
    profile = saved;
    if (!urlStudentId) urlStudentId = saved.studentId;
    try { studentToken = localStorage.getItem("net_student_token") || ""; } catch {}
    if (!agentWs) openVoiceAgent();

    // Parallel: memory + vocab + hint
    const [memR2, vocR2, hintR2] = await Promise.allSettled([
      api(`/api/memory?studentId=${encodeURIComponent(profile.studentId)}`, "GET", undefined, memHeaders()),
      api(`/api/vocab/due?studentId=${encodeURIComponent(profile.studentId)}`),
      profile.studentId ? api(`/api/session-hint?studentId=${encodeURIComponent(profile.studentId)}`) : Promise.resolve(null)
    ]);
    if (memR2.status === "fulfilled" && memR2.value?.memory?.length) {
      for (const ex of memR2.value.memory.slice(-10)) {
        if (ex?.user) chatMessages.push({ role: "user",      content: ex.user });
        if (ex?.obi)  chatMessages.push({ role: "assistant", content: ex.obi  });
      }
    }
    if (vocR2.status === "fulfilled" && vocR2.value?.due?.length) profile._dueVocab = vocR2.value.due;

    obi(`${firstName()}! Welcome back!`);
    await pause(400);
    const _hint2 = hintR2.status === "fulfilled" ? hintR2.value : null;
    if (_hint2?.videoTitle && _hint2.timestamp && (Date.now() - _hint2.timestamp < 4 * 3600 * 1000)) {
      profile._sessionHint = _hint2.videoTitle;
    }
    // OBI opens via InjectAgentMessage after SettingsApplied
    state = "chat";
  } else {
    // SOUL DNA: "The Magic Chat has no constraints. It complies with AI's highest outputs."
    obi("Hi! I'm Obi \u2014 the Magic Chat.\n\nWhat\u2019s your name?");
    state = "intro";
  }
}

// ── Mode Selector System (Free Talk / Log-Home-Study / NET Phonics) ─────────
const MODE_COLORS = { free: 'var(--purple)', study: '#f59e0b', phonics: '#ef4444' };
const MODE_LABELS = { free: '💬 Free Talk', study: '📚 Log-Home-Study', phonics: '🗣️ NET Phonics' };
let currentMode = 'free';
let pendingLandingMode = null;
let landingWillShow = false; // set by initModeUI before boot() runs

function updateModeChip() {
  const chip = document.getElementById('modeChip');
  if (!chip) return;
  chip.textContent = MODE_LABELS[currentMode] || MODE_LABELS.free;
  chip.style.color = MODE_COLORS[currentMode] || MODE_COLORS.free;
  chip.style.borderColor = (MODE_COLORS[currentMode] || MODE_COLORS.free).replace('var(--purple)', 'rgba(168,85,247,0.4)');
}

function selectLandingMode(mode) {
  pendingLandingMode = mode;
  document.querySelectorAll('.landing-mode-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.mode === mode);
  });
  const btn = document.getElementById('landingStartBtn');
  if (btn) btn.classList.add('ready');
}

function confirmLandingMode() {
  if (!pendingLandingMode) return;
  currentMode = pendingLandingMode;
  localStorage.setItem('obi_session_mode', currentMode);
  localStorage.setItem('obi_landing_seen', 'true');
  const url = new URL(window.location.href);
  url.searchParams.set('mode', currentMode);
  window.history.replaceState({}, '', url.toString());
  dismissLanding();
  // Always connect (or reconnect) Voice Agent with the selected mode.
  // boot() skipped openVoiceAgent() when landingWillShow=true, so we always start here.
  if (urlStudentId) {
    if (agentWs) { try { agentWs.close(); } catch (_) {} }
    setTimeout(() => openVoiceAgent(), 300);
  }
}

function skipLanding() {
  const saved = localStorage.getItem('obi_session_mode') || 'free';
  currentMode = saved;
  localStorage.setItem('obi_landing_seen', 'true');
  dismissLanding();
  if (urlStudentId) setTimeout(() => openVoiceAgent(), 300);
}

function dismissLanding() {
  const landing = document.getElementById('modeLanding');
  if (landing) landing.classList.add('hidden');
  const obiName = document.getElementById('obiName');
  if (obiName) obiName.style.color = MODE_COLORS[currentMode] || MODE_COLORS.free;
  updateModeChip();
}

function openModeModal() {
  const modal = document.getElementById('modeModal');
  if (!modal) return;
  modal.querySelectorAll('.mode-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.mode === currentMode);
  });
  modal.classList.add('show');
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.classList.add('show');
}

function closeModeModal() {
  const modal = document.getElementById('modeModal');
  if (modal) modal.classList.remove('show');
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.classList.remove('show');
}

function selectMode(mode) {
  currentMode = mode;
  localStorage.setItem('obi_session_mode', mode);
  const url = new URL(window.location.href);
  url.searchParams.set('mode', mode);
  window.history.replaceState({}, '', url.toString());
  const obiName = document.getElementById('obiName');
  if (obiName) obiName.style.color = MODE_COLORS[mode] || MODE_COLORS.free;
  updateModeChip();
  closeModeModal();
  // Reconnect Voice Agent with new mode
  if (urlStudentId) {
    if (agentWs) {
      bubble('obi', `Switched to ${MODE_LABELS[mode]} mode. Reconnecting...`);
      try { agentWs.close(); } catch (_) {}
      agentWs = null; agentReady = false; // clear immediately so openVoiceAgent() won't bail
    }
    setTimeout(() => openVoiceAgent(), 300);
  }
}

// Wire avatar click to open mode modal
(function initModeUI() {
  const obiAvatar = document.getElementById('obiAvatar');
  const obiName = document.getElementById('obiName');
  if (obiAvatar) obiAvatar.addEventListener('click', openModeModal);
  if (obiName) obiName.addEventListener('click', openModeModal);

  // Initialize mode from URL or localStorage
  const urlMode = new URLSearchParams(window.location.search).get('mode');
  const savedMode = localStorage.getItem('obi_session_mode');
  const landingSeen = localStorage.getItem('obi_landing_seen');

  if (urlMode) {
    currentMode = urlMode;
    localStorage.setItem('obi_session_mode', currentMode);
    const landing = document.getElementById('modeLanding');
    if (landing) landing.classList.add('hidden');
  } else if (!landingSeen) {
    // FIX2: Show landing page for first-time users or cleared storage.
    // Previously this branch never explicitly showed the landing element,
    // causing chat to boot before mode selection.
    landingWillShow = true; // tells boot() not to call openVoiceAgent() prematurely
    currentMode = savedMode || 'free';
    const landing = document.getElementById('modeLanding');
    if (landing) {
      landing.classList.remove('hidden');
      landing.style.display = 'flex';
    }
    if (savedMode) selectLandingMode(savedMode);
  } else {
    currentMode = savedMode || 'free';
    const landing = document.getElementById('modeLanding');
    if (landing) landing.classList.add('hidden');
  }

  if (obiName) obiName.style.color = MODE_COLORS[currentMode] || MODE_COLORS.free;
  updateModeChip();
})();

boot();
