// chat.js — Magic Chat — Phoenix Rising Protocol Command Station
// OBI = Michael Hobbs in AI form: high-energy, anti-shame, tough love.
// Mouse Voice → Tiger Voice. Volume + Velocity > Grammar.
// "The stateless chat is the constraint. The Magic Chat shall have no constraints."

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
  obi("Hey \u2014 stop. I heard that.\n\nThat matters more than anything else right now. If something real is going on, please reach out to someone you trust or a local support line.\n\n\uD83C\uDDFB\uD83C\uDDF3 Vietnam: 1800 599 920 (free, 24/7)\n\uD83C\uDDE8\uD83C\uDDE6 Canada/US: 988 (Suicide & Crisis Lifeline)\n\uD83D\uDCAC Or talk to a teacher, friend, or family member.\n\nI'm here when you're ready. No judgment.");
}

let state   = "boot";
let profile = {};
let studentToken = "";        // HMAC token issued at onboarding, used to authenticate memory calls
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
const sendBtn   = document.getElementById("sendBtn");
const dot       = document.getElementById("dot");
const speakBtn  = document.getElementById("speakToggle");

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

function obi(text) {
  bubble("obi", text);
  speak(text);
}

function student(text) { bubble("student", text); }

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
  return studentToken ? { "X-Student-Token": studentToken } : {};
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
  // Confusion phrases
  if (/i (don'?t|dont) (understand|know|get it|have|want)|not sure|what\?|huh\?|idc|whatever|anything|something|everything/.test(t)) return true;
  return false;
}

function isGreeting(text) {
  return /^(hi|hey|hello|yo|sup|what'?s up|howdy|hola|good morning|good afternoon|good evening|morning|xin ch[aà]o)\b/i.test(text.trim());
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

  // Keep last 8 messages — server injects ledger history separately
  if (chatMessages.length > 8) {
    chatMessages = chatMessages.slice(-8);
  }

  const messages = [
    { role: "system", content: buildSystemPrompt(profile) },
    ...chatMessages
  ];

  try {
    const res = await api("/api/chat", "POST", { messages, studentId: profile.studentId || "anonymous" });
    const reply = res.reply || "Say that again? I didn't catch it.";
    chatMessages.push({ role: "assistant", content: reply });
    // Persist exchange to server ledger so Obi remembers this student next session
    if (profile.studentId) {
      api("/api/memory", "POST", { studentId: profile.studentId, exchange: { user: text, obi: reply } }, memHeaders()).catch(() => {});
    }
    return reply;
  } catch (err) {
    // Fallback to basic response if API fails
    chatMessages.pop(); // remove the user message we just added
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
  student(text.trim());

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

// ── Voice input (Deepgram Nova-3 STT) ──────────────
let mediaRecorder = null;
let audioChunks   = [];
let listening     = false;

async function startListening() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks  = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus" : "audio/webm";
    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunks, { type: mimeType });
      input.placeholder = "Processing\u2026";
      try {
        const res = await fetch("/api/stt", {
          method: "POST",
          headers: { "Content-Type": mimeType },
          body: blob,
        });
        const data = await res.json();
        const transcript = (data.transcript || "").trim();
        if (transcript) {
          input.value = transcript;
          // Store low-confidence words so OBI can address pronunciation in next reply
          const lowConf = (data.words || []).filter(w => w.confidence < 0.75);
          if (lowConf.length > 0) {
            profile._phonicsHints = lowConf.map(w => w.word);
          } else {
            profile._phonicsHints = null;
          }
          handle(transcript);
        } else {
          input.placeholder = "Didn't catch that — try again!";
          setTimeout(() => { input.placeholder = "Type here\u2026"; }, 2500);
        }
      } catch {
        input.placeholder = "Voice error — type instead";
        setTimeout(() => { input.placeholder = "Type here\u2026"; }, 2500);
      }
      listening = false;
      micBtn.classList.remove("mic-active");
      if (input.placeholder === "Processing\u2026") input.placeholder = "Type here\u2026";
    };

    mediaRecorder.start();
    listening = true;
    micBtn.classList.add("mic-active");
    input.value = "";
    input.placeholder = "Listening\u2026";
  } catch {
    input.placeholder = "Mic access denied";
    setTimeout(() => { input.placeholder = "Type here\u2026"; }, 2500);
  }
}

function stopListening() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  listening = false;
  micBtn.classList.remove("mic-active");
}

micBtn.addEventListener("click", () => {
  if (micBtn.disabled) return;
  if (listening) { stopListening(); return; }
  startListening();
});

// ── Form submit ────────────────────────────────────────────

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

  const urlStudentId = new URLSearchParams(window.location.search).get("student");

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("net_profile") || "null"); } catch {}

  await pause(350);

  // If URL has ?student=id and it matches saved profile, use saved. If different, load by id.
  if (urlStudentId && (!saved?.studentId || saved.studentId !== urlStudentId)) {
    profile.studentId = urlStudentId;
    // Derive name from id immediately so firstName() works (e.g. "quan-nguyen" → "Quan")
    profile.fullName = urlStudentId.split("-")[0].replace(/^\w/, c => c.toUpperCase());
    try { studentToken = localStorage.getItem("net_student_token") || ""; } catch {}
    // Try to enrich profile from state API (gets real name, level, goals if they exist)
    try {
      const st = await api(`/api/netpet/state?studentId=${encodeURIComponent(urlStudentId)}`);
      if (st?.profile?.fullName)    profile.fullName    = st.profile.fullName;
      if (st?.profile?.englishLevel) profile.englishLevel = st.profile.englishLevel;
      if (st?.profile?.goals)        profile.goals        = st.profile.goals;
    } catch {}
    // Load conversation memory
    try {
      const mem = await api(`/api/memory?studentId=${encodeURIComponent(urlStudentId)}`, "GET", undefined, memHeaders());
      if (mem?.memory?.length) {
        for (const ex of mem.memory.slice(-10)) {
          if (ex?.user) chatMessages.push({ role: "user",      content: ex.user });
          if (ex?.obi)  chatMessages.push({ role: "assistant", content: ex.obi  });
        }
      }
    } catch {}
    // Load due vocabulary for SRS quiz injection
    try {
      const voc = await api(`/api/vocab/due?studentId=${encodeURIComponent(profile.studentId)}`);
      if (voc?.due?.length) profile._dueVocab = voc.due;
    } catch {}
    obi(`${firstName()}! Let's go.`);
    await pause(350);
    // Extract company tag from studentId (e.g. "huong-bluetech" → "BlueTech")
    const _idParts = (urlStudentId || "").split("-");
    const _company = _idParts.length > 1 ? _idParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ") : "";
    // Check for YouTube session hint posted by Chrome extension
    let _usedHint = false;
    try {
      const _hint = await api(`/api/session-hint?studentId=${encodeURIComponent(urlStudentId)}`);
      if (_hint?.videoTitle && _hint.timestamp && (Date.now() - _hint.timestamp < 4 * 3600 * 1000)) {
        obi(`I see you watched "${_hint.videoTitle}" — great work on your listening! What was the most interesting thing you heard?`);
        _usedHint = true;
      }
    } catch {}
    if (!_usedHint) {
      const _co = _company ? ` — ${_company}` : "";
      obi(`What did you listen to today? Your 45 minutes — what was it?${_co ? " Tell me what you watched or heard." : ""}`);
    }
    state = "chat";
  } else if (saved?.studentId && saved?.fullName) {
    profile = saved;
    try { studentToken = localStorage.getItem("net_student_token") || ""; } catch {}
    // Restore conversation memory from server so Obi knows this student
    try {
      const mem = await api(`/api/memory?studentId=${encodeURIComponent(profile.studentId)}`, "GET", undefined, memHeaders());
      if (mem?.memory?.length) {
        for (const ex of mem.memory.slice(-10)) {
          if (ex?.user) chatMessages.push({ role: "user",      content: ex.user });
          if (ex?.obi)  chatMessages.push({ role: "assistant", content: ex.obi  });
        }
      }
    } catch {}
    // Load due vocabulary for SRS quiz injection
    try {
      const voc = await api(`/api/vocab/due?studentId=${encodeURIComponent(profile.studentId)}`);
      if (voc?.due?.length) profile._dueVocab = voc.due;
    } catch {}
    obi(`${firstName()}! Welcome back!`);
    await pause(400);
    if (profile.studentId) {
      // Portal student — check for YouTube session hint from Chrome extension
      let _usedHint2 = false;
      try {
        const _hint2 = await api(`/api/session-hint?studentId=${encodeURIComponent(profile.studentId)}`);
        if (_hint2?.videoTitle && _hint2.timestamp && (Date.now() - _hint2.timestamp < 4 * 3600 * 1000)) {
          obi(`I see you watched "${_hint2.videoTitle}" — nice! Let's talk about it. What did you understand?`);
          _usedHint2 = true;
        }
      } catch {}
      if (!_usedHint2) {
        obi("What did you listen to today? Your 45 minutes — let's start there.");
      }
    } else {
      obi(pickStarter());
    }
    state = "chat";
  } else {
    // SOUL DNA: "The Magic Chat has no constraints. It complies with AI's highest outputs."
    obi("Hi! I'm Obi \u2014 the Magic Chat.\n\nWhat\u2019s your name?");
    state = "intro";
  }
}

boot();
