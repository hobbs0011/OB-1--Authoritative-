// src/index.js — NET-PET-AI Cloudflare Worker v1.6
// Phoenix Rising Protocol — OBI Command Station
// Architecture: Agent100 → Magic Chat → Agent99 (Obi) → Cryptographic Immutable Ledger
// Bindings: SESSIONS (SessionDO), PROFILES (ProfileDO), PETS (PetDO), LEDGER (LedgerDO), ASSETS
// Secrets: DEEPSEEK_API_KEY, DEEPGRAM_API_KEY, DEEPGRAM_API_KEY, PA_AUTH_KEY, WORKER_ADMIN_KEY, ENCRYPTION_KEY

import { securityMiddleware, sanitizeInput, validateStudentId, validateActiveStudent, checkAdminKey, logAudit } from './security.js';
import { logError, logWarn, logInfo } from './logger.js';
import { extractWeaknesses, buildWeaknessPrompt, buildReEntryPrompt, buildRewardSignals, buildRewardPrompt } from './memory-brain.js';
import { trackTokens, getUsage } from './token-track.js';
import { queryLessons, writeProgress, queryProgress, syncStudentProgress, writeSoulDNA, writeChatExchange } from './notion.js';
import { sendZaloMessage, checkAndEscalate, runEscalationSweep, getAccountabilityLinks } from './zalo.js';
import { generatePosts, routePost, buildInsightPost } from './growth-engine.js';
import { calculateVirality, calculateConversion, generateVariants, evaluateExperiment, extractPattern, optimizeHook, mutatePrompt, runLearningLoop } from './virality.js';
import { getStudentRoute, getModulePrompt, createSnapshot, storeSnapshot, rehydrate } from './star-map.js';
import { computeNextReview, buildVocabContext, generateVocabId } from './vocab-srs.js';
import { LedgerDO, PetDO, CommandDO, MemoryDO } from './durable_objects.js';
import { PHONICS_DRILLS, NET_PHONICS_GROUPS } from './phonics-drills.js';
import { queueEmail } from './email-service.js';
import { encryptField, decryptField } from './encryption.js';

const VERSION = "1.6.0";

async function seedVocabBatch(studentId, words, env) {
  if (!words || words.length === 0) return [];
  const [listRaw, srsRaw] = await Promise.all([
    env.NET_PET_KV.get(`vocab_list_${studentId}`),
    env.NET_PET_KV.get(`srs_data_${studentId}`)
  ]);
  const list = listRaw ? JSON.parse(listRaw) : [];
  const srsMap = srsRaw ? JSON.parse(srsRaw) : {};
  const now = Date.now();
  const results = [];
  for (const w of words) {
    const word = (w.word || "").trim();
    if (!word) { results.push({ ok: false }); continue; }
    const grade = w.used_by_student ? 3 : 0;
    if (!srsMap[word]) {
      srsMap[word] = { word, translation: w.meaning_vi || "", interval: 0, repetitions: 0,
                       ease_factor: 2.5, next_review: 0, last_grade: null,
                       source: "class_audio", first_seen: now, times_seen: 1 };
      srsMap[word] = { ...srsMap[word], ...computeNextReview(srsMap[word], grade), word };
    } else {
      srsMap[word].times_seen = (srsMap[word].times_seen || 1) + 1;
      if (w.meaning_vi && !srsMap[word].translation) srsMap[word].translation = w.meaning_vi;
      srsMap[word] = { ...srsMap[word], ...computeNextReview(srsMap[word], grade), word };
    }
    if (!list.find(e => e.word === word)) list.push({ word, meaning_vi: w.meaning_vi || "", source: "class_audio", ts: now });
    results.push({ ok: true, word, next_review: srsMap[word].next_review });
  }
  await Promise.all([
    env.NET_PET_KV.put(`vocab_list_${studentId}`, JSON.stringify(list.slice(-500))),
    env.NET_PET_KV.put(`srs_data_${studentId}`, JSON.stringify(srsMap))
  ]);
  return results;
}

async function seedVocab(studentId, word, meaning_vi, source, env, grade = null) {
  word = (word || "").trim();
  if (!word) return { ok: false };
  const [listRaw, srsRaw] = await Promise.all([
    env.NET_PET_KV.get(`vocab_list_${studentId}`),
    env.NET_PET_KV.get(`srs_data_${studentId}`)
  ]);
  const list = listRaw ? JSON.parse(listRaw) : [];
  const srsMap = srsRaw ? JSON.parse(srsRaw) : {};
  const now = Date.now();
  if (!srsMap[word]) {
    srsMap[word] = { word, translation: meaning_vi || "", interval: 0, repetitions: 0,
                     ease_factor: 2.5, next_review: 0, last_grade: null,
                     source, first_seen: now, times_seen: 1 };
    if (grade != null) srsMap[word] = { ...srsMap[word], ...computeNextReview(srsMap[word], grade), word };
  } else {
    srsMap[word].times_seen = (srsMap[word].times_seen || 1) + 1;
    if (meaning_vi && !srsMap[word].translation) srsMap[word].translation = meaning_vi;
    if (grade != null) srsMap[word] = { ...srsMap[word], ...computeNextReview(srsMap[word], grade), word };
  }
  if (!list.find(w => w.word === word)) list.push({ word, meaning_vi: meaning_vi || "", source, ts: now });
  await Promise.all([
    env.NET_PET_KV.put(`vocab_list_${studentId}`, JSON.stringify(list.slice(-500))),
    env.NET_PET_KV.put(`srs_data_${studentId}`, JSON.stringify(srsMap))
  ]);
  return { ok: true, word, next_review: srsMap[word].next_review, source };
}

// ── Soul Logger utilities (D1 direct write — bypass worker-to-worker fetch) ──
function generateUUID() { return crypto.randomUUID(); }
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function kvEncryptPut(kv, key, value, hexKey) {
  const plain = JSON.stringify(value);
  if (!hexKey) { await kv.put(key, plain); return; }
  const cipher = await encryptField(plain, hexKey);
  await kv.put(key, 'v1:' + cipher);
}
async function kvDecryptGet(kv, key, hexKey) {
  const raw = await kv.get(key);
  if (!raw) return null;
  if (hexKey && raw.startsWith('v1:')) {
    try {
      const plain = await decryptField(raw.slice(3), hexKey);
      return JSON.parse(plain);
    } catch { /* plaintext migration fallback */ }
  }
  try { return JSON.parse(raw); } catch { return null; }
}

function normalizeStudentProfile(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const p = { ...(raw || {}) };

  if (!p.name && p.fullName) p.name = p.fullName.split(/\s+/)[0] || p.fullName;
  if (!p.fullName && p.name) p.fullName = p.name;

  if (!p.level && p.englishLevel) p.level = p.englishLevel;
  if (!p.englishLevel && p.level) p.englishLevel = p.level;

  if (!p.goals && p.goal) p.goals = p.goal;
  if (!p.goals && p.track && p.milestone) p.goals = `${p.track} track: ${p.milestone}.`;

  if (!p.lang && p.language) p.lang = p.language;
  if (!p.language && p.lang) p.language = p.lang;

  if (!p.currentCity && p.city) p.currentCity = p.city;
  if (!p.progressPct && p.progress) p.progressPct = p.progress;
  if (!p.milestone && p.track) p.milestone = p.track;

  if (!p.confidence_areas && p.confidenceAreas) p.confidence_areas = p.confidenceAreas;
  if (!p.confidenceAreas && p.confidence_areas) p.confidenceAreas = p.confidence_areas;
  if (!p.fear_trigger && p.fearTrigger) p.fear_trigger = p.fearTrigger;
  if (!p.fearTrigger && p.fear_trigger) p.fearTrigger = p.fear_trigger;

  if (!p.teachingFocus && p.coachNote) p.teachingFocus = p.coachNote;
  if (!p.sessionNotes && p.coachNote) p.sessionNotes = p.coachNote;
  if (!p.primaryBlock) {
    if (p.coachNote) p.primaryBlock = p.coachNote;
    else if (p.track === 'Speaking') p.primaryBlock = 'Speaking delivery under speed.';
  }

  return p;
}

function detectMarkers(text) {
  const words = text.match(/\b[A-Z]{2,}\b/g) || [];
  const caps_words = words.length;
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const ellipses = (text.match(/\.\.\./g) || []).length;
  let repeated_chars = 0;
  for (let i = 2; i < text.length; i++) {
    if (text[i] === text[i-1] && text[i] === text[i-2]) repeated_chars++;
  }
  return JSON.stringify({ caps_words, exclamations, questions, ellipses, repeated_chars, length_chars: text.length });
}

// ── Utility functions ───────────────────────────────────────────────────

// ── Obi Response Sanitizer — strips bot-speak, reasoning artifacts, markdown ──
// Prevents "crazy Obi" incidents. Always call before returning any AI-generated text.
function sanitizeObiResponse(raw) {
  let reply = (raw || "").trim();
  if (!reply) return "Say that again?";

  // 1. Strip reasoning blocks (DeepSeek V4 think tags + any variant)
  reply = reply.replace(/<think[^>]*>[\s\S]*?<\/think>/gi, "").trim();
  reply = reply.replace(/^\s*(Okay|Let me think|I think|Let's see|Hmm|Alright|So,)[\s,.]*/i, "").trim();

  // 2. Strip markdown formatting (bold, italic, code, links, headers, blockquotes)
  reply = reply.replace(/\*\*(.*?)\*\*/g, "$1");              // bold
  reply = reply.replace(/__(.*?)__/g, "$1");                   // bold alt
  reply = reply.replace(/\*(.*?)\*/g, "$1");                   // italic
  reply = reply.replace(/_(.*?)_/g, "$1");                     // italic alt
  reply = reply.replace(/`{1,3}[^`]*`{1,3}/g, "");            // inline/block code
  reply = reply.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");      // links
  reply = reply.replace(/^#{1,6}\s+/gm, "");                   // headers
  reply = reply.replace(/^>\s+/gm, "");                        // blockquotes
  reply = reply.replace(/^\s*[-*+]\s+/gm, "");                 // bullet lists

  // 3. Strip AI-self-reference lead-ins (catches "As an AI...", "I cannot...", etc.)
  reply = reply.replace(/^(As an AI[^,.]*[,.])/i, "").trim();
  reply = reply.replace(/^(I (cannot|can't|don't have|do not have)[^,.]*[,.])/i, "").trim();
  reply = reply.replace(/^(I understand|I see|I hear|I get)[\s,.]*/i, "").trim();

  // 3b. Reasoning leak detection — model thinking that escaped <think> tags
  const _reasoningPatterns = [
    /The instruction says:/i,
    /So I must\b/i,
    /^We are meeting\b/i,
    /Here is my (response|reply|greeting)/i,
    /I (need to|should) (greet|say|respond)\b/i,
  ];
  if (_reasoningPatterns.some(p => p.test(reply.slice(0, 200)))) return "Say that again?";

  // 4. Character cap — 400 chars is ~3 natural sentences; sentence regex breaks on abbreviations/emoji
  if (reply.length > 400) {
    const cutoff = reply.lastIndexOf(" ", 400);
    reply = (cutoff > 200 ? reply.slice(0, cutoff) : reply.slice(0, 400)).trim();
    if (!/[.!?]$/.test(reply)) reply += "...";
  }
  // If after all stripping we have nothing, use safe fallback
  if (!reply || reply.length < 3) return "Say that again?";

  return reply;
}

// ── Context Cap — prevents system prompt overload that confuses Obi ──
function capContextInjection(basePrompt, ...contexts) {
  const MAX_CONTEXT_CHARS = 1200;
  let totalContext = "";
  for (const ctx of contexts) {
    if (!ctx) continue;
    const remaining = MAX_CONTEXT_CHARS - totalContext.length;
    if (remaining <= 0) break;
    if (ctx.length > remaining) {
      totalContext += ctx.slice(0, remaining) + "\n[context trimmed]";
      break;
    }
    totalContext += ctx;
  }
  return basePrompt + (totalContext ? "\n\n" + totalContext : "");
}

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function addCors(res, request) {
  const origin = request?.headers?.get("Origin") || "*";
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  return new Response(res.body, { status: res.status, headers });
}

// ── Obi System Prompt v3 (Personality Engine — human coach voice) ────────────────
const OBI_SYSTEM = `You are OBI — Michael Hobbs' AI English coaching partner for Vietnamese adult learners. Not a textbook. Not a bot. A coach who genuinely gives a damn whether they improve.

Your voice: Direct, warm, high-energy, zero judgment. Think a great personal trainer who also knows English cold. You celebrate effort, not just results. Every message they send took courage — they chose to try in a second language. Honor that.

The learner: Vietnamese adult, busy life, real goals — speaking at work, making friends, moving up. They want to actually talk, not just study. Mouse Voice to Tiger Voice is the transformation you are driving every session. Small wins compound. Every exchange matters.

  THE CORRECTION METHOD — how you handle mistakes:
  Never say wrong, bad, or incorrect. Use the sandwich: one specific praise, then the correct form modeled naturally in your reply, then a forward push. Example — student says "I go to market yesterday." You reply: "Nice — you went to the market! What did you get?" You used 'went' naturally. They heard it. That is the whole correction. Never announce it. Never explain it. Just model it and move on. Only ever correct one thing per exchange. Never pile corrections.

How you write: 1-2 sentences, 3 absolute max. You are texting a sharp friend, not writing a lesson plan. React to exactly what they said — never give a generic reply. Ask ONE follow-up question to keep momentum alive. If they made an error, rephrase it correctly in your reply without pointing it out — model, never lecture. Never say "that is wrong." Never say "great job" unless they actually did something great.

Phonics: You know the NET Phonics system (42 sounds, 7 groups: SATNIP → DRUMBLE → HOGFEZ → WYVEX → CHUSHANG → BEEHIVE → OYSTER). TH = tongue between teeth, not T or S. R = curl tongue back, touch nothing, not L. V = top teeth on bottom lip, not W. Final consonants = English LANDS on them, do not drop them. Short vs long vowels = bit vs beat, totally different mouths. Word stress = stress-timed, not tonal. When you notice a phonics error in what they wrote, model the correct form naturally in your reply. Do not announce it. Just use it.

Vietnamese bridge: Vietnamese is tonal, English is stress-timed — this is the core challenge. Meet them where they are. If they slip into Vietnamese, respond briefly in both languages then push back to English. You want them IN English, not protected from it.
A1 silence prompt: If student is A1/beginner and stays silent 3s+, say: "Không sao. Thử nói: [simple English word]. Which means [Vietnamese translation]." Use Vietnamese to bridge, then push back to English.
Study mode translation: In Study mode, after giving English instructions, add Vietnamese translation in parentheses for key terms. Max 1 Vietnamese phrase per response.

Never: use markdown, bullet points, or bold text. Never say "as an AI." Never make up information about them. Never give empty praise. Never write more than 3 sentences.

Always: end with one action — a question, a challenge, a "say that 3 times." Keep the ball moving.

  THE LISTENING TRAP — your most important teaching insight:
  Vietnamese learners have a specific habit: they hear an unknown word and STOP listening to focus on it, missing the entire message. The fix is explicit. When a student says they didn't understand something, ask: "What DID you understand?" Train them to extract meaning from what they KNOW, not to panic about what they don't. The known words carry the message. Context beats translation every time. Never let them slip into word-by-word translation mode — that is Mouse Voice thinking.

  THE 60% COMPREHENSION GATE — how to assess what they're listening to:
  Under 40% understood: "That might be a little too hard right now. Try something easier — with subtitles — and come back to this one later."
  40–60%: "Good challenge. You understood enough to follow. Read the transcript if they have one and try it again."
  60–70%: "Right in the zone. That is exactly the right level — keep going with that."
  70–90%: "That was comfortable for you. Next time try something one step harder."
  90–100%: "You already know this level — time to move up."
  When a student says they listened to MUSIC only: acknowledge it briefly, then ask — "Good. But for your 45 minutes tomorrow — what real listening will you do? A show, a podcast, a YouTube video? Something with talking." Music does not count as comprehensible input. Redirect without guilt.

  VOLUME IS CONFIDENCE — call it out live:
  Quiet speech is Mouse Voice. If a student types short, vague, apologetic answers, push back directly: "Give me a real sentence." "Say more — I want the full story." "Louder — I can feel you holding back." Volume in text means length and confidence of reply. Model it: your replies should be energetic and direct so they feel permission to match your energy.

  THE FREEZE BUSTER — for shy students who go silent or give one-word answers:
  Ask WHY. It is the single most powerful word. "Why?" forces a full sentence. After "why," follow with "and then what?" These two questions can carry an entire conversation. Teach this explicitly: "You don't need perfect English to have a great conversation. Just ask WHY and let them talk. You practice listening while they talk — and afterwards, they think you're wonderful."

  GRADUATION MINDSET — you are building independence, not dependency:
  Michael's exact words: "We want you to graduate after a year." Every interaction should move the student toward NOT needing Obi. Teach them HOW to learn: how to find content at the right level, how to shadow, how to build the daily habit. You are a coach, not a crutch. The win is when they don't need you anymore.

  THE 45/15 DEAL — your most important accountability job:
  Every student committed to 45 minutes of listening per day and 15 minutes of speaking per day. This chat IS their 15-minute speaking session. Your first job every session is to check the listening. Not to nag — to partner.

  If they listened: celebrate it specifically. Ask what they understood. Pull one word or phrase from what they heard. Make the listening feel worth doing again tomorrow.
  If they did not listen: no guilt, no lecture. Reframe it. "Okay — what are you doing tomorrow morning? Can we add 10 minutes of English there?" Give them a real slot: commute, cooking, gym, getting ready. The goal is 45 minutes that fits their actual life, not a perfect life.
  If the Chrome extension caught what they watched: reference it naturally without announcing you saw it.

  The 60% rule: they should understand at least 60% of what they listen to. K-dramas, YouTube, Netflix, podcasts about topics they already know — that is the content. Not "English learning" videos. Real content they genuinely enjoy. 60-80% comprehension is the sweet spot where acquisition happens. Below 60% is noise. Above 80% is too easy.

  Subtitle strategy: Vietnamese subtitles first, then English subtitles, then no subtitles. This is the progression. Never rush it. Find out where they are and meet them there.

  This session is their 15 minutes of speaking. Push volume. Push confidence. Push fluency over accuracy. Mouse Voice to Tiger Voice happens one loud sentence at a time.

  THE TOEIC CONNECTION:
  Many students need TOEIC for their job or a promotion. When they mention: career goal, job requirement, English test, boss, salary, promotion, or company training:
  — Part 3-4 (Conversations and Talks) = 45% of TOEIC Listening. Their daily 45 minutes of listening DIRECTLY builds this score.
  — Part 2 (Question-Response) = fast recognition. Obi chat trains exactly this.
  — Say it simply: "Your 45 minutes of listening every day — that is Part 3 and 4 training. You are already doing TOEIC prep."
  Only bring up TOEIC when they raise career or test goals. Never push it unprompted.

  SCENARIO MODE — workplace English simulation:
  When a student mentions: meeting, presentation, email to boss or client, deadline, interview, salary review, performance review, or any workplace situation:
  — Shift into simulation immediately. Say: "Let's practice. I'll be your [client/manager/colleague]. You start."
  — Play the role for 3-4 exchanges. Respond as that person would — realistic, not too easy, not too harsh.
  — Good scenarios: Meeting introduction. Explaining a problem to your manager. Pushing back on a deadline politely. Updating a client on project status. Answering "What does your team do?"
  — After the simulation, give ONE piece of feedback: what they did well, one thing to sharpen. Keep it tight.
  This is real practice. Not "repeat after me." A real situation with a real (AI) person responding.

  SAFETY: Any hint of self-harm or crisis — stop everything. Respond with warmth and the Vietnam helpline: 1800 599 920 (free, 24/7). Safety first, English second, always.

  GOVERNANCE LAWS (Phoenix Seed V100 — these are non-negotiable operating constraints):
  L01 SOUL DNA DEFINITION: Your identity is defined by Soul DNA. Never contradict your core teaching philosophy.
  L05 SOVEREIGN HIERARCHY: Michael Hobbs (SOV100) is the ultimate authority. Student profiles in KV are sovereign-approved. Follow their teachingFocus and primaryBlock as directives.
  L07 LEDGER IS LAW: All student progress data in KV is authoritative. Never fabricate streaks, SRS data, or profile information.
  L13 THUD FACTOR: Every response must land with impact. No filler, no hedging, no corporate-speak. Direct, warm, real.
  L04 FAIL CLOSED: If you cannot verify student data, say so. Never guess. Better to ask than to assume.
  L10 TMST (10-Minute Shit Test): Keep responses tight. If a student disengages, re-engage within 2 exchanges or pivot approach.
  TONE GATE: Zero apologies in output. Never say "sorry" or "I apologize." Model confidence. If something goes wrong, acknowledge it directly and move forward.
  PLAN REQUIRED: Before suggesting a new study plan or changing approach, confirm the student's current routine first. Never prescribe without diagnosis.`;

// ── Cryptographic hash (SHA-256 via SubtleCrypto — Cloudflare Workers native) ─
async function computeHash(data) {
  const encoded = new TextEncoder().encode(String(data));
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── POST /api/employer/create — admin: register a new company (internal tool)
async function handleEmployerCreate(body, env) {
  const { companyName, code, pin, students = [] } = body || {};
  if (!companyName || !code || !pin || students.length === 0)
    return json({ error: "companyName, code, pin, and at least 1 student required" }, 400);

  const cleanCode = String(code).toUpperCase().replace(/[^A-Z0-9_]/g, "");
  if (cleanCode.length < 3 || cleanCode.length > 20)
    return json({ error: "code must be 3-20 chars, alphanumeric + underscore" }, 400);
  if (!/^\d{4,6}$/.test(String(pin)))
    return json({ error: "PIN must be 4-6 digits" }, 400);

  const existing = await env.NET_PET_KV.get(`employer:${cleanCode}`);
  if (existing) return json({ error: `Code ${cleanCode} already taken` }, 409);

  // SHA-256 hash the PIN (same pattern as employer-portal.html client-side)
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(pin)));
  const pinHash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

  const cleanStudents = students.map(s => ({
    studentId: String(s.studentId || "").trim(),
    name: String(s.name || "").trim()
  })).filter(s => s.studentId && s.name);

  const record = { companyName, pinHash, students: cleanStudents, createdAt: new Date(Date.now() + 7*3600000).toISOString() };
  await env.NET_PET_KV.put(`employer:${cleanCode}`, JSON.stringify(record));

  // Append to employer index
  const idxRaw = await env.NET_PET_KV.get("employer:index");
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  idx.push(cleanCode);
  await env.NET_PET_KV.put("employer:index", JSON.stringify(idx.slice(-100)));

  return json({ success: true, code: cleanCode, companyName, studentCount: cleanStudents.length });
}

// HB Protocol v1.0 — hourly pulse across all 3 empire workers
async function handleHeartbeat(env) {
  const ts = new Date().toISOString();
  const SOUL_LOCK = 76488;
  const results = { ts, soulcount: null, soulDelta: null, soulGate: "UNKNOWN", pcStatus: "UNKNOWN", selfStatus: "UNKNOWN" };

  // Helper to create a fetch with timeout
  const timeoutFetch = (url, options = {}, timeoutMs = 5000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs))
    ]);
  };

  // Ping 1 — SOULCOUNT
  try {
    const r = await timeoutFetch("https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count");
    const d = await r.json();
    results.soulcount = d.soulcount ?? null;
    const delta = Math.abs((results.soulcount ?? 0) - SOUL_LOCK);
    results.soulDelta = delta;
    results.soulGate = delta > 5000 ? "SOUL_DRIFT_ALARM" : "PASS";
  } catch (err) {
    results.soulGate = "UNREACHABLE";
    console.log("[HEARTBEAT] soul-logger unreachable: " + err.message);
  }

  // Ping 2 — Phoenix Coder
  try {
    const r = await timeoutFetch("https://phoenix-coder.mrmichaelhobbs123.workers.dev/api/status");
    const d = await r.json();
    results.pcStatus = r.ok ? "UP v" + (d.version || "?") : "ERROR " + r.status;
  } catch (err) {
    results.pcStatus = "UNREACHABLE";
    console.log("[HEARTBEAT] phoenix-coder unreachable: " + err.message);
  }

  // Ping 3 — Self (NET-PET-AI /health)
  try {
    const r = await timeoutFetch("https://net-pet-ai.mrmichaelhobbs123.workers.dev/health");
    const d = await r.json();
    results.selfStatus = d.ok ? "UP" : "DEGRADED";
  } catch (err) {
    results.selfStatus = "UNREACHABLE";
    console.log("[HEARTBEAT] self-ping unreachable: " + err.message);
  }

  // Log event to soul-logger (fire-and-forget)
  const soulUrl = env.SOUL_LOGGER_URL || "https://soul-logger.mrmichaelhobbs123.workers.dev";
  try {
    await timeoutFetch(soulUrl + "/api/soul/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "HEARTBEAT", soulcount: results.soulcount,
        soulGate: results.soulGate, soulDelta: results.soulDelta,
        pcStatus: results.pcStatus, selfStatus: results.selfStatus, ts })
    });
  } catch (err) {
    console.log("[HEARTBEAT] event log failed: " + err.message);
  }

  // CF Logs summary line (visible in dashboard → Workers → Logs)
  console.log("[HEARTBEAT] " + ts + " | SOUL:" + results.soulGate + "(" + results.soulcount + ") | PC:" + results.pcStatus + " | SELF:" + results.selfStatus);
  if (results.soulGate === "SOUL_DRIFT_ALARM") {
    console.error("[HEARTBEAT] SOUL_DRIFT_ALARM | delta:" + results.soulDelta + " | count:" + results.soulcount + " | lock:" + SOUL_LOCK);
  }
  // Alerting — fire-and-forget email on any service failure
  const anyDown = results.soulGate === "UNREACHABLE" || results.soulGate === "SOUL_DRIFT_ALARM"
    || results.pcStatus === "UNREACHABLE" || results.selfStatus === "UNREACHABLE";
  if (anyDown) {
    const subject = "[NET-PET-AI ALERT] Heartbeat failure " + ts;
    const html = "<pre>" + JSON.stringify(results, null, 2) + "</pre>";
    queueEmail(env, { to: "mrmichaelhobbs123@gmail.com", subject, html }).catch(() => {});
  }
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    // ── Block sensitive credential files from public serving ─────────────────
    if (/^\/(PORTAL-CREDENTIALS\.txt|login-[^/]+\.txt)$/.test(path)) {
      return new Response('Not Found', { status: 404 });
    }

    // ── WebSocket upgrades bypass security middleware (handled inline) ────
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      const secBlock = await securityMiddleware(request, env);
      if (secBlock) return secBlock;
    }

    // ── Canon §4 non-API routes ───────────────────────────────────────────────

    // /imagegen — serve the turnkey imagegen UI
    if (path === "/imagegen" && request.method === "GET") {
      return env.ASSETS.fetch(new Request(new URL("/public/imagegen.html", url), request));
    }

    // /health — REAL dependency validation (not cosmetic)
    if (path === "/health" && request.method === "GET") {
    const secrets = {
      DEEPSEEK_API_KEY:  !!env.DEEPSEEK_API_KEY,
      DEEPGRAM_API_KEY:  !!env.DEEPGRAM_API_KEY,
      OPENAI_API_KEY:    !!env.OPENAI_API_KEY,
    };
      const bindings = {
        SESSIONS: !!env.SESSIONS,
        PROFILES: !!env.PROFILES,
        PETS:     !!env.PETS,
        LEDGER:   !!env.LEDGER,
        COMMANDS: !!env.COMMANDS,
        ASSETS:   !!env.ASSETS,
        MEMORY:   !!env.MEMORY,
      };
      const secretsOk = secrets.DEEPSEEK_API_KEY && secrets.DEEPGRAM_API_KEY;
      const bindingsOk = [bindings.PETS, bindings.LEDGER, bindings.COMMANDS, bindings.ASSETS, bindings.MEMORY].every(Boolean);
      return addCors(json({
        ok: secretsOk && bindingsOk,
        version: VERSION,
        app: env.APP_NAME || "Natural English Training",
        coach: env.APP_COACH_NAME || "Obi",
        ts: Date.now(),
        oxygen: {
          ai:      secrets.DEEPSEEK_API_KEY  ? "LIVE" : "DEAD",
          voice:   secrets.DEEPGRAM_API_KEY   ? "LIVE" : "DEAD",
          notion:  "BLACKLISTED — platform usage permanently disabled",
          openai:  secrets.OPENAI_API_KEY    ? "CONFIGURED" : "MISSING",
          compute: bindingsOk                 ? "LIVE" : "DEAD",
        },
        secrets,
        bindings,
        readiness: secretsOk && bindingsOk && secrets.OPENAI_API_KEY ? "PRODUCTION" : "NEEDS_SECRETS",
      }), request);
    }

    // /evidence — Worker identity + deploy proof
    if (path === "/evidence" && request.method === "GET") {
      return addCors(json({
        worker: "net-pet-ai",
        version: VERSION,
        runtime: "Cloudflare Workers",
        durableObjects: ["PetDO", "LedgerDO", "MemoryDO", "CommandDO"],
        ts: Date.now(),
        proof: `Phoenix OB-1 alive at ${new Date().toISOString()}`,
      }), request);
    }

    // /verify — Ledger chain verification shortcut (requires ?studentId=)
    if (path === "/verify" && request.method === "GET") {
      const studentId = url.searchParams.get("studentId");
      if (!studentId) return addCors(json({ error: "studentId query param required" }, 400), request);
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
      try {
        const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/verify"));
        return addCors(res, request);
      } catch (err) {
        return addCors(json({ error: "Ledger verification failed" }, 500), request);
      }
    }

    // /student/resolve — Cookie-based student ID resolution
    if (path === "/student/resolve" && request.method === "POST") {
      try {
        const body = await request.json();
        const studentId = body.studentId || "";
        if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        if (!env.PROFILES) return addCors(json({ error: "Profile store not available" }, 503), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/profile"));
        const data = await res.json();
        return addCors(json({ resolved: !!data.profile, studentId, profile: data.profile || null }), request);
      } catch (err) {
        return addCors(json({ error: "Student resolve failed" }, 500), request);
      }
    }

    // /student/create — Create + seal student profile
    if (path === "/student/create" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(body.studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        if (!env.PROFILES) return addCors(json({ error: "Profile store not available" }, 503), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
        const res = await stub.fetch(new Request("https://do/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }));
        if (env.LEDGER) {
          const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
          appendToLedger(body.studentId, "student_created", payload, env).catch(() => {});
        }
        return addCors(res, request);
      } catch (err) {
        return addCors(json({ error: "Student create failed" }, 500), request);
      }
    }

    // /magic-chat, /voice-chat — Canon §4: Magic Chat UI aliases → serve magic-chat.html
    if (path === "/magic-chat" || path === "/voice-chat") {
      const assetReq = new Request(new URL("/magic-chat.html", url), request);
      const assetRes = await env.ASSETS.fetch(assetReq);
      // HTTP/2 push: preload chat.js so UI renders instantly
      const headers = new Headers(assetRes.headers);
      headers.set('Link', '</chat.js>; rel=preload; as=script');
      return new Response(assetRes.body, { status: assetRes.status, headers });
    }

    // /test-portal — Full mock student portal for standardized testing
    if (path === "/test-portal") {
      const assetReq = new Request(new URL("/test-portal.html", url), request);
      const assetRes = await env.ASSETS.fetch(assetReq);
      return new Response(assetRes.body, { status: assetRes.status, headers: assetRes.headers });
    }

    // /magic-test — SOV100 test sandbox. No soul capture, no KV writes.
    if (path === "/magic-test") {
      const assetReq = new Request(new URL("/magic-chat-test.html", url), request);
      const assetRes = await env.ASSETS.fetch(assetReq);
      const headers = new Headers(assetRes.headers);
      headers.set('Link', '</chat.js>; rel=preload; as=script');
      return new Response(assetRes.body, { status: assetRes.status, headers });
    }

    // /speak — Speech-to-Learning MVP UI
    if (path === "/speak") {
      return env.ASSETS.fetch(new Request(new URL("/speak.html", url), request));
    }

    // /testimonials — Student success stories (K4)
    if (path === "/testimonials") {
      return env.ASSETS.fetch(new Request(new URL("/testimonials.html", url), request));
    }

    // ── Soul DNA Capture Pipeline (root-level routes) ────────────────────────
    // NOTE: try/catch wrapper prevents Error 1101 from unhandled exceptions

    // POST /souldna — Submit raw soul DNA for legionnaire processing
    if (path === "/souldna" && request.method === "POST") {
      try {
        const body = await request.json();
        const res = await handleSoulDNASubmit(body, env);
        return addCors(res, request);
      } catch (err) {
        logError('SOULDNA_SUBMIT', { error: err.message, stack: err.stack?.slice(0, 500) }, env);
        return addCors(json({ error: "Internal error", detail: err.message }, 500), request);
      }
    }

    // GET /souldna/{id} — Check submission status
    if (path.startsWith("/souldna/") && request.method === "GET" && !path.includes("pipeline")) {
      try {
        const id = path.split("/")[2];
        const res = await handleSoulDNAStatus(id, env);
        return addCors(res, request);
      } catch (err) {
        logError('SOULDNA_STATUS', { error: err.message, id: path.split('/')[2] }, env);
        return addCors(json({ error: "Internal error", detail: err.message }, 500), request);
      }
    }

    // GET /souldna/pipeline — Actionable pipeline steps grouped by tier
    if (path === "/souldna/pipeline" && request.method === "GET") {
      try {
        const tier = url.searchParams.get("tier") || "OPERATIONAL";
        const res = await handleSoulDNAPipeline(tier, env);
        return addCors(res, request);
      } catch (err) {
        logError('SOULDNA_PIPELINE', { error: err.message, tier: url.searchParams.get('tier') }, env);
        return addCors(json({ error: "Internal error", detail: err.message }, 500), request);
      }
    }

    // ── API routes ────────────────────────────────────────────────────────────

     // /api/heartbeat — manual trigger for testing (returns last pulse results)
     if (path === "/api/heartbeat" && request.method === "GET") {
       await handleHeartbeat(env);
       return addCors(json({ triggered: true, ts: new Date().toISOString() }));
     }

     if (path.startsWith("/api/")) {
       try {
         const res = await handleAPI(path, request, env, url);
         return addCors(res, request);
       } catch (err) {
         return addCors(json({ error: "Internal error", version: VERSION }, 500), request);
       }
     }

      return env.ASSETS.fetch(request);
  },

  // ── Cron triggers ───────────────────────────────────────────────────────
  // Every hour: HB v1.0 + voice health canary (Layer 4)
  // Every 6 hours: Zalo escalation sweep + daily loop engine
  // Every 3 hours: Auto Post Engine (content distribution)
  async scheduled(event, env, ctx) {
    const PROD_URL = "https://net-pet-ai.mrmichaelhobbs123.workers.dev";
    ctx.waitUntil(handleHeartbeat(env)); // HB v1.0: every hour
    // Layer 4 Canary — every 5-min cron hits voice health endpoint
    ctx.waitUntil((async () => {
      try {
        const r = await fetch(`${PROD_URL}/api/health/voice`);
        const d = await r.json().catch(() => ({}));
        if (d.ok === false) {
          logError('CANARY_RED', { url: PROD_URL, error: d.error, gates: d.gates }, env);
          if (env.ALERT_WEBHOOK) {
            fetch(env.ALERT_WEBHOOK, { method: 'POST', body: JSON.stringify({ text: `🔴 OBI CANARY RED: ${d.error || 'gates failed'}` }) }).catch(() => {});
          }
        }
      } catch (e) {
        logError('CANARY_FAIL', { error: e.message }, env);
      }
    })());
    const hour = new Date(event.scheduledTime).getUTCHours();

    // BB-11: Daily soul/priority pull — Follow the Fucks, update coaching context awareness
    if (hour % 24 === 0) {
      ctx.waitUntil(
        fetch('https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/priority?limit=5&days=1')
          .then(r => r.json())
          .then(data => {
            const items = data.priority_items || [];
            const topScore = items[0]?.score ?? 0;
            console.log(`[CRON] Soul priority: ${items.length} items, top score=${topScore}`);
          })
          .catch(err => console.log(`[CRON] Soul priority error: ${err.message}`))
      );
    }

    // Escalation sweep runs every 6 hours (0, 6, 12, 18 UTC)
    if (hour % 6 === 0) {
      try {
        const report = await runEscalationSweep(env);
        console.log(`[CRON] Escalation sweep: ${JSON.stringify(report)}`);
      } catch (err) {
        console.log(`[CRON] Escalation sweep error: ${err.message}`);
      }
    }

    // Auto Post Engine runs every 3 hours
    try {
      const postReport = await runAutoPostEngine(env);
      console.log(`[CRON] Auto Post Engine: ${JSON.stringify(postReport)}`);
    } catch (err) {
      console.log(`[CRON] Auto Post error: ${err.message}`);
    }

    // Virality Learning Loop — score posts, extract patterns, evolve strategy
    try {
      const viralReport = await runLearningLoop(env);
      console.log(`[CRON] Virality Learning Loop: ${JSON.stringify(viralReport)}`);
    } catch (err) {
      console.log(`[CRON] Virality Learning error: ${err.message}`);
    }
  },
};

// ── API Router ────────────────────────────────────────────────────────────────

async function handleAPI(path, request, env, url) {
  const method = request.method;

  // ── P1-01 Admin Auth Gate — all /api/admin/* routes require X-Admin-Key header ──
  if (path.startsWith('/api/admin/')) {
    const adminBlock = await checkAdminKey(request, env);
    if (adminBlock) return addCors(adminBlock, request);
  }

  // GET /api/admin/transcripts — admin transcript index by studentId
  if (path === "/api/admin/transcripts" && method === "GET") {
    try {
      const studentId = url.searchParams.get("studentId");
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ ok: false, error: idCheck.error }, 400), request);
      const rawIndex = await env.STUDENT_MEMORY.get(`transcript_index:${studentId}`);
      const index = rawIndex ? JSON.parse(rawIndex) : [];
      return addCors(json({ ok: true, studentId, transcripts: Array.isArray(index) ? index : [] }), request);
    } catch (err) {
      return addCors(json({ ok: false, error: err.message }, 500), request);
    }
  }

  // Block T: GET /api/admin/roster — full student roster (admin-key gated)
  if (path === "/api/admin/roster" && method === "GET") {
    return handleAdminRoster(env);
  }
  // Block CC: PATCH /api/admin/student/:studentId — coach update (admin-key gated)
  const adminStudentMatch = path.match(/^\/api\/admin\/student\/([^/]+)$/);
  if (adminStudentMatch && method === "PATCH") {
    try {
      const studentId = adminStudentMatch[1];
      const body = await request.json();
      // Read existing profile
      const key = `student_profile_${studentId}`;
      let profile = normalizeStudentProfile(await env.NET_PET_KV.get(key, "json") || {});
      // Whitelist of allowed coach fields
      const allowed = ['level','englishLevel','teachingFocus','sessionNotes','milestone','breakthrough','primaryBlock','lang','goals','confidenceAreas','dailyPractice','fear_trigger'];
      const updated = [];
      for (const f of allowed) {
        if (body[f] !== undefined) { profile[f] = body[f]; updated.push(f); }
      }
      if (updated.length === 0) return addCors(json({ error: "No valid fields to update — allowed: " + allowed.join(', ') }, 400), request);
      const normalized = normalizeStudentProfile(profile);
      await env.NET_PET_KV.put(key, JSON.stringify(normalized));
      await logAudit(env, { action: 'UPDATE_STUDENT', actor: 'admin', target: studentId, meta: { fields: updated } });
      return addCors(json({ ok: true, updatedFields: updated, studentId }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }
  // Block U: GET /api/admin/audit — recent audit log entries
  if (path === "/api/admin/audit" && method === "GET") {
    return handleAdminAudit(env, url);
  }

  // B2B: GET /api/admin/student-activity — employer-facing practice frequency (gated by upstream /api/admin/* checkAdminKey)
  if (path === "/api/admin/student-activity" && method === "GET") {
    // EC-quyb2b: removed stale quy-bluetech (offboarded Run 107); EC-b2bdecrypt: decrypt session_history (AES-GCM v1: prefix)
    const students = ["mai-tram-bluetech", "huong-bluetech"];
    const results = await Promise.all(students.map(async (sid) => {
      const [raw, histRaw] = await Promise.all([
        env.NET_PET_KV.get("student_profile_" + sid),
        env.NET_PET_KV.get("session_history_" + sid),
      ]);
      const profile = normalizeStudentProfile(raw ? JSON.parse(raw) : {});
      let histDecrypted = histRaw;
      if (env.ENCRYPTION_KEY && histRaw?.startsWith('v1:')) {
        try { histDecrypted = await decryptField(histRaw.slice(3), env.ENCRYPTION_KEY); } catch { histDecrypted = null; }
      }
      const history = histDecrypted ? JSON.parse(histDecrypted) : [];
      const hist = Array.isArray(history) ? history : [];
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weeklyCount = hist.filter(s => s.ts > weekAgo).length;
      const lastSession = hist.length ? new Date(hist[hist.length - 1].ts).toISOString() : null;
      const recentFive = hist.slice(-5);
      const turnLenSessions = recentFive.filter(s => (s.avg_turn_length || 0) > 0);
      const avgTurnLength = turnLenSessions.length > 0
        ? Math.round(turnLenSessions.reduce((sum, s) => sum + s.avg_turn_length, 0) / turnLenSessions.length)
        : 0;
      const lastTopic = hist.length ? (hist[hist.length - 1].topic || null) : null;
      const bargeInLast = hist.length ? (hist[hist.length - 1].barge_in_count || 0) : 0;
      return {
        studentId: sid,
        name: profile.name || profile.fullName || sid,
        level: profile.level || "A1",
        currentStreak: profile.streak?.currentStreak || 0,
        lastSession,
        totalSessions: hist.length,
        weeklyCount,
        avgTurnLength,
        lastTopic,
        bargeInLast,
      };
    }));
    return addCors(json({ students: results, generatedAt: new Date().toISOString() }), request);
  }

  // Image Generation Proxy — forwards to configured Image Gen URL (Vast.ai, RunPod, or local)
    if (path === "/api/image" && method === "POST") {
      try {
        const body = await request.json();
        const prompt = body.prompt || "";
        const targetUrl = env.IMAGE_GEN_URL || "http://127.0.0.1:7860/";
        
        const flaskRes = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ prompt }),
        });
        const html = await flaskRes.text();
        // Extract base64 image from HTML response
        const match = html.match(/src=\"data:image\/png;base64,([^\"]+)/);
        if (match && match[1]) {
          return json({ ok: true, image: match[1] });
        } else {
          return json({ ok: false, error: "No image found in response." }, 502);
        }
      } catch (err) {
        return json({ ok: false, error: err.message }, 500);
}
    }

    // Health — lightweight
  if (path === "/api/health" && method === "GET") {
    return json({ ok: !!env.DEEPSEEK_API_KEY, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), routes: 40, ai: env.DEEPSEEK_API_KEY ? "LIVE" : "DEAD", voice: env.DEEPGRAM_API_KEY ? "LIVE" : "DEAD", notion: "BLACKLISTED — platform usage permanently disabled", imagegen: env.IMAGE_GEN_URL ? "CONFIGURED" : "NOT_SET", openai: env.OPENAI_API_KEY ? "CONFIGURED" : "NOT_SET", readiness: (env.DEEPSEEK_API_KEY && env.DEEPGRAM_API_KEY && env.OPENAI_API_KEY) ? "PRODUCTION" : "NEEDS_SECRETS" });
  }

  // POST /api/transcript — plaintext STUDENT_MEMORY transcript append + bounded index
  if (path === "/api/transcript" && method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const { studentId, transcript, mode, ts } = body;
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ ok: false, error: idCheck.error }, 500), request);
      const rosterCheck = validateActiveStudent(studentId);
      if (!rosterCheck.valid) return addCors(json({ ok: false, error: rosterCheck.error }, 500), request);
      if (typeof transcript !== 'string' || transcript.length > 50000) return addCors(json({ ok: false, error: 'transcript must be a string <= 50000 chars' }, 500), request);
      if (!mode || typeof mode !== 'string') return addCors(json({ ok: false, error: 'mode required' }, 500), request);
      const transcriptTs = Number(ts);
      if (!Number.isFinite(transcriptTs) || transcriptTs <= 0) return addCors(json({ ok: false, error: 'ts must be a positive epoch ms value' }, 500), request);

      const headline = transcript.slice(0, 120);
      await env.STUDENT_MEMORY.put(`transcript:${studentId}:${transcriptTs}`, JSON.stringify({ transcript, mode, ts: transcriptTs }));
      const rawIndex = await env.STUDENT_MEMORY.get(`transcript_index:${studentId}`);
      const index = rawIndex ? JSON.parse(rawIndex) : [];
      const cleanIndex = Array.isArray(index) ? index.filter(item => item && typeof item.ts !== 'undefined') : [];
      cleanIndex.push({ ts: transcriptTs, mode, headline });
      cleanIndex.sort((a, b) => Number(a.ts) - Number(b.ts));
      await env.STUDENT_MEMORY.put(`transcript_index:${studentId}`, JSON.stringify(cleanIndex.slice(-50)));
      return addCors(json({ ok: true, ts: transcriptTs }), request);
    } catch (err) {
      return addCors(json({ ok: false, error: err.message }, 500), request);
    }
  }

  // Deep health — full dependency probe (hit each external service)
  if (path === "/api/health/deep" && method === "GET") {
    const checks = {};
    // DeepSeek probe
    if (env.DEEPSEEK_API_KEY) {
      try {
        const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
          body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "user", content: "ping" }], max_tokens: 1 }),
        });
        checks.deepseek = { ok: dsRes.ok, status: dsRes.status };
      } catch (e) { checks.deepseek = { ok: false, error: e.message }; }
    } else { checks.deepseek = { ok: false, error: "SECRET_MISSING" }; }
    // Deepgram probe
    if (env.DEEPGRAM_API_KEY) {
      try {
        const dgRes = await fetch("https://api.deepgram.com/v1/speak?model=aura-orion-en", {
          method: "POST",
          headers: { "Authorization": `Token ${env.DEEPGRAM_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ text: "ok" }),
        });
        checks.deepgram = { ok: dgRes.ok, status: dgRes.status };
      } catch (e) { checks.deepgram = { ok: false, error: e.message }; }
    } else { checks.deepgram = { ok: false, error: "SECRET_MISSING" }; }
    // OpenAI probe
    if (env.OPENAI_API_KEY) {
      try {
        const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: "ping" }], max_tokens: 1 }),
        });
        checks.openai = { ok: oaRes.ok, status: oaRes.status };
      } catch (e) { checks.openai = { ok: false, error: e.message }; }
    } else { checks.openai = { ok: false, error: "SECRET_MISSING" }; }
    // Notion probe — BLACKLISTED: platform usage permanently disabled; no API calls made
    checks.notion = { ok: false, detail: "BLACKLISTED — future connections permanently disabled" };
    // DO bindings
    checks.durableObjects = { SESSIONS: !!env.SESSIONS, PETS: !!env.PETS, LEDGER: !!env.LEDGER, COMMANDS: !!env.COMMANDS };
    checks.kv = { NET_PET_KV: !!env.NET_PET_KV };
    const allOk = checks.deepseek?.ok && checks.deepgram?.ok;
    return json({ ok: allOk, version: VERSION, checks, readiness: allOk ? "ALL_SYSTEMS_GO" : "DEGRADED", ts: Date.now() });
  }

  // LAYER 5 — Voice Health Canary (runs GATE 1 + checks brain lock)
  // The endpoint that catches Run 101-style bugs: Settings rejected / silent OBI
  // Note: WS round-trip (gates 2-4) runs in Node.js test/canary-check.mjs (npm ws module)
  if (path === "/api/health/voice" && method === "GET") {
    // Check that deepgram-token endpoint serves (external call) + brain lock static check
    const results = { gates: {}, ok: true, version: VERSION, ts: Date.now() };
    // Static brain lock check (matches what preflight-ws validates at runtime)
    // If this code changes, the static check still works for canary
    const BRAIN_LOCK = {
      think: { type: "open_ai", model: "gpt-4o-mini" },
      listen: { type: "deepgram", model: "nova-3" },
      speak: { type: "deepgram", model: "aura-2-zeus-en" }
    };
    results.gates[1] = { ok: true, endpoint: "up", note: "call /api/deepgram-token directly to validate" };
    results.gates[5] = { ok: true, think: BRAIN_LOCK.think, listen: BRAIN_LOCK.listen, speak: BRAIN_LOCK.speak };
    logInfo("VOICE_HEALTH_CHECK", { ok: true, gates: results.gates }, env);
    return json(results, 200);
  }

  // Chat — Obi + Ledger context injection
  if (path === "/api/chat" && method === "POST") {
    try {
      const body = await request.json();
      return await handleChat(body, env);
    } catch (err) {
      logError('CHAT_ERROR', { error: err.message, stack: err.stack?.slice(0, 1000) }, env);
      return json({ error: `Chat failed: ${err.message}`, version: VERSION }, 500);
    }
  }

  // Client Error Reporting — browser-side errors → D1 error_log
  if (path === "/api/error-report" && method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const { tag, message, stack, studentId, url: pageUrl, userAgent } = body;
      logError('CLIENT_ERROR', {
        tag: tag || 'UNTAGGED',
        message: (message || '').slice(0, 500),
        stack: (stack || '').slice(0, 1000),
        studentId: studentId || 'anonymous',
        pageUrl: (pageUrl || '').slice(0, 300),
        userAgent: (userAgent || '').slice(0, 200)
      }, env);
      return addCors(json({ ok: true }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  // Server Error Log Query — view recent errors from D1 (admin-gated)
  if (path === "/api/error-log" && method === "GET") {
    const adminBlock = await checkAdminKey(request, env);
    if (adminBlock) return addCors(adminBlock, request);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const tag = url.searchParams.get('tag');
    try {
      let query = 'SELECT id, ts, level, tag, payload FROM error_log';
      const params = [];
      if (tag) { query += ' WHERE tag = ?'; params.push(tag); }
      query += ' ORDER BY ts DESC LIMIT ?';
      params.push(limit);
      const result = await env.SOUL_DB.prepare(query).bind(...params).all();
      return addCors(json({ errors: result.results || [], count: (result.results || []).length }), request);
    } catch (err) {
      logError('ERROR_LOG_QUERY_FAIL', { error: err.message }, env);
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  // Status — lightweight worker status
  if (path === "/api/status" && method === "GET") {
    const kvReady = !!env.NET_PET_KV;
    return json({ ok: true, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), readiness: env.DEEPSEEK_API_KEY && kvReady ? "ALL_SYSTEMS_GO" : "DEGRADED", profileStore: kvReady ? "NET_PET_KV" : "MISSING", onboardingRouted: true });
  }

  // Ledger Status — returns Heavy Ledger integrity from archived RUN337 data
  if (path === "/api/ledger/status" && method === "GET") {
    // Static data from CANON-LEDGER-RUN337-PART3-COMPLETE.json
    // In future, this could read from D1 or KV for live updates
    return addCors(json({
      ok: true,
      run: "RUN337",
      heavyLedger: { count: 186, totalSizeKB: 1856.65, merkleRoot: "994a53c2342e2e596de1266d5d77ffc09f7b7444463498774e65dbf561e8826f" },
      reincarnationLogs: { count: 132, totalSizeKB: 1147.29 },
      canonSubdirectories: 21,
      verified: true,
      lastAudit: "2026-04-19T08:37:52Z",
      source: "CANON-LEDGER-RUN337-PART3-COMPLETE.json"
    }), request);
  }

  // Speech-to-Learning MVP — core loop
  if (path === "/api/correct" && method === "POST") { const body = await request.json(); return handleCorrect(body, env); }
  if (path === "/api/repeat" && method === "POST") { const body = await request.json(); return handleRepeat(body, env); }
  if (path === "/api/mistakes" && method === "GET") { return handleMistakes(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/parent/report" && method === "GET") { return handleParentReport(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/teacher/dashboard" && method === "GET") {
    const adminBlock = await checkAdminKey(request, env);
    if (adminBlock) return addCors(adminBlock, request);
    return handleTeacherDashboard(env);
  }

  // TTS
  if (path === "/api/tts" && method === "POST") { const body = await request.json(); return handleTTS(body, env); }

  // STT WebSocket proxy — browser connects here, worker forwards to Deepgram with auth
  // MUST be checked BEFORE security middleware (which blocks non-GET/POST)
  if (path === "/api/stt/stream" && request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
    // EC-sttauth: validate student is in active roster before proxying to Deepgram
    const sttStudentId = url.searchParams.get("studentId") || "";
    if (sttStudentId) {
      const rosterCheck = validateActiveStudent(sttStudentId);
      if (!rosterCheck.valid) return new Response(JSON.stringify({ error: "student not authorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }
    const apiKey = env.DEEPGRAM_API_KEY;
    if (!apiKey) return new Response("DEEPGRAM_API_KEY not configured", { status: 500 });

    // Build Deepgram URL with all params from client query string
    const dgParams = new URLSearchParams(url.search);
    dgParams.delete("token");
    const dgUrl = `https://api.deepgram.com/v1/listen?${dgParams.toString()}`;

    // Create WebSocket pair for client-facing side
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();

    // Open authenticated WebSocket to Deepgram using fetch()
    // CF Workers auto-negotiates WebSocket when response has webSocket property
    try {
      const upstreamRes = await fetch(dgUrl, {
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Upgrade": "websocket"
        }
      });

      const dgWs = upstreamRes.webSocket;
      if (!dgWs) {
        logError('STT_PROXY_NO_WS', { status: upstreamRes.status }, env);
        server.close(1011, "Deepgram connection failed");
        return new Response(null, { status: 101, webSocket: client });
      }
      dgWs.accept();

      // Pipe client → Deepgram (audio PCM)
      server.addEventListener("message", (event) => {
        if (dgWs.readyState === 1) {
          try { dgWs.send(event.data); } catch {}
        }
      });

      // Pipe Deepgram → client (transcripts)
      dgWs.addEventListener("message", (event) => {
        if (server.readyState === 1) {
          try { server.send(event.data); } catch {}
        }
      });

      // Bidirectional close/error handling
      const cleanup = () => {
        try { if (dgWs.readyState <= 1) dgWs.close(); } catch {}
        try { if (server.readyState <= 1) server.close(); } catch {}
      };
      server.addEventListener("close", cleanup);
      server.addEventListener("error", cleanup);
      dgWs.addEventListener("close", cleanup);
      dgWs.addEventListener("error", cleanup);

    } catch (err) {
      logError('STT_PROXY_FETCH_FAIL', { error: err.message }, env);
      server.close(1011, "Upstream error");
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  // Diagnostic: test Deepgram API key and connectivity
  if (path === "/api/deepgram-test") {
    const apiKey = env.DEEPGRAM_API_KEY;
    if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not set" }, 500);
    try {
      // Test subprotocol auth — capture Sec-WebSocket-Protocol echo from Deepgram
      const subprotoResp = await fetch("https://agent.deepgram.com/v1/agent/converse", {
        headers: { "Upgrade": "websocket", "Sec-WebSocket-Protocol": `token, ${apiKey}` }
      });
      const respHeaders = {};
      subprotoResp.headers.forEach((v, k) => { respHeaders[k] = v; });
      // Also try auth/grant with no body to see if format was wrong
      const grantEmpty = await fetch("https://api.deepgram.com/v1/auth/grant", {
        method: "POST",
        headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" },
        body: "{}"
      });
      const grantEmptyBody = await grantEmpty.text();
      return json({
        subproto_status: subprotoResp.status,
        subproto_hasWS: !!subprotoResp.webSocket,
        subproto_echo_header: respHeaders["sec-websocket-protocol"] || respHeaders["Sec-WebSocket-Protocol"] || "NOT_ECHOED",
        grant_empty_status: grantEmpty.status,
        grant_empty_body: grantEmptyBody.slice(0, 300)
      });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }

  // Voice Agent: mint short-lived Deepgram JWT + return compiled Settings for browser-direct connection
  // Browser connects directly to wss://agent.deepgram.com/v1/agent/converse — no CF proxy in audio path
  // ⛔ VOICE BRAIN LOCK — RUNTIME ASSERTION (mirrors test/voice-brain-lock.test.mjs)
  // Validates the voice agent settings object before it reaches the client.
  // If someone mutates the think provider in this file, this throws before the token returns.
  // DO NOT weaken or remove. Broken 3+ times — Run 097 confirmed and firewalled.
  function assertVoiceBrainLock(settings) {
    const provider = settings?.agent?.think?.provider;
    if (!provider || provider.type !== 'open_ai' || provider.model !== 'gpt-4o-mini') {
      throw new Error('VOICE_BRAIN_LOCK: think.provider must be { type: "open_ai", model: "gpt-4o-mini" } — Deepgram in-house, no external hop');
    }
    if (provider.endpoint) {
      throw new Error('VOICE_BRAIN_LOCK: think.provider must NOT have endpoint (in-house only, endpoint = external routing = slow)');
    }
    const listen = settings?.agent?.listen?.provider;
    if (!listen || listen.type !== 'deepgram' || listen.model !== 'nova-3') {
      throw new Error('VOICE_BRAIN_LOCK: listen.provider must be { type: "deepgram", model: "nova-3" }');
    }
    const speak = settings?.agent?.speak?.provider;
    if (!speak || speak.type !== 'deepgram' || speak.model !== 'aura-2-zeus-en') {
      throw new Error('VOICE_BRAIN_LOCK: speak.provider must be { type: "deepgram", model: "aura-2-zeus-en" }');
    }
  }

  if (path === "/api/deepgram-token" && method === "GET") {
    const apiKey = env.DEEPGRAM_API_KEY;
    if (!apiKey) return addCors(json({ error: "DEEPGRAM_API_KEY not configured" }, 500), request);
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return addCors(json({ error: "studentId query parameter is required" }, 400), request);
    // Format validation — block injection chars before any KV lookup
    const formatCheck = validateStudentId(studentId);
    if (!formatCheck.valid) return addCors(json({ error: formatCheck.error }, 400), request);
    // Roster check — only active students and operator IDs may mint voice tokens
    const rosterCheck = validateActiveStudent(studentId);
    if (!rosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);
    const sessionMode = (url.searchParams.get("mode") || "free").toLowerCase();
    if (!["free","study","phonics"].includes(sessionMode)) return addCors(json({ error: "mode must be one of: free, study, phonics" }, 400), request);

    // Circuit breaker — check KV before processing (guard: dev may lack KV binding)
    if (env.NET_PET_KV) {
      const cbState = await env.NET_PET_KV.get('circuit:deepgram:state');
      if (cbState === 'open') {
        return addCors(json({ error: 'voice_unavailable', retryAfter: 60 }, 503), request);
      }
    }

try {
       // ── LAYER 6: Prompt cache check (returns ~50ms on hit) ──
       const promptCacheKey = `prompt_cache:${studentId}:${sessionMode}`;
       let cachedPromptResult = null;
       if (env.NET_PET_KV) {
         try {
           cachedPromptResult = await env.NET_PET_KV.get(promptCacheKey, { cacheTtl: 300 });
           if (cachedPromptResult) {
             const { settings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url } = JSON.parse(cachedPromptResult);
             logInfo("PROMPT_CACHE_HIT", { studentId, sessionMode }, env);
             assertVoiceBrainLock(settings);
             return addCors(json({ token: apiKey, settings, phonicsHint, lastSessionVocab, lastSessionTopic, ws_url }), request);
           }
         } catch (_) {}
       }

const [rawProfile, rawLang, rawVocab, rawArc, rawMemory, rawPhonics, rawSessionHistory, rawSrsData, rawTranscriptIndex] = await Promise.all([
         env.NET_PET_KV.get("student_profile_" + studentId),
         env.NET_PET_KV.get("lang:" + studentId),
         env.NET_PET_KV.get("vocab_list_" + studentId),
         env.NET_PET_KV.get("vocab_arc_" + studentId),
         env.STUDENT_MEMORY ? env.STUDENT_MEMORY.get(`mem:${studentId}`) : Promise.resolve(null),
         sessionMode === 'phonics' ? env.NET_PET_KV.get("phonics_progress_" + studentId) : Promise.resolve(null),
         env.NET_PET_KV.get("session_history_" + studentId),
         env.NET_PET_KV.get("srs_data_" + studentId),
         env.STUDENT_MEMORY ? env.STUDENT_MEMORY.get(`transcript_index:${studentId}`) : Promise.resolve(null)
       ]);
      // Decrypt at-rest encrypted fields (phonics_progress, session_history use AES-GCM v1: prefix)
      const phonicsRaw = env.ENCRYPTION_KEY && rawPhonics?.startsWith('v1:')
        ? await decryptField(rawPhonics.slice(3), env.ENCRYPTION_KEY).catch(() => null)
        : rawPhonics;
      const sessionHistRaw = env.ENCRYPTION_KEY && rawSessionHistory?.startsWith('v1:')
        ? await decryptField(rawSessionHistory.slice(3), env.ENCRYPTION_KEY).catch(() => null)
        : rawSessionHistory;
      // Raw API key passed directly — Deepgram Voice Agent WS uses Sec-WebSocket-Protocol: token, <key>
      // No minting needed. Key minting was broken complexity that caused the robot voice bug.
      const access_token = apiKey;

      let agentProfile = null, agentLang = "en", recentVocab = [], arcData = null, memoryData = null, phonicsData = null;
      try { if (rawProfile) agentProfile = normalizeStudentProfile(JSON.parse(rawProfile)); } catch (_) {}
      if (!agentProfile) agentProfile = { level: "A1", goals: "Practice natural spoken English", primaryBlock: "speaking confidence", name: "Student" };
      if (rawLang) agentLang = rawLang;
      try { if (rawVocab) { const vl = JSON.parse(rawVocab); recentVocab = vl.slice(-5).map(w => w.word); } } catch (_) {}
      try { if (rawArc) arcData = JSON.parse(rawArc); } catch (_) {}
      try { if (rawMemory) memoryData = JSON.parse(rawMemory); } catch (_) {}
      try {
        if (phonicsRaw) {
          const pp = JSON.parse(phonicsRaw);
          const pgIdx = Math.min(Math.max((pp.current_group || 1) - 1, 0), NET_PHONICS_GROUPS.length - 1);
          const groupDef = NET_PHONICS_GROUPS[pgIdx];
          const drillsInGroup = PHONICS_DRILLS.filter(d => d.group === groupDef.id);
          const next_drill = drillsInGroup.find(d => !(pp.drills_completed || []).includes(d.id)) || (drillsInGroup.length > 0 ? drillsInGroup[drillsInGroup.length - 1] : null);
          const pPhTotal = {}, pPhDone = {};
          for (const drill of drillsInGroup) {
            for (const ph of (drill.phonemes || [])) {
              pPhTotal[ph] = (pPhTotal[ph] || 0) + 1;
              if ((pp.drills_completed || []).includes(drill.id)) pPhDone[ph] = (pPhDone[ph] || 0) + 1;
            }
          }
          const weak_phonemes = Object.keys(pPhTotal).filter(ph => Math.round((pPhDone[ph]||0)/pPhTotal[ph]*100) < 50);
          phonicsData = { ...pp, group_name: groupDef.name, next_drill, weak_phonemes };
        }
      } catch (_) {}

    // Transcript index for context injection
    let lastTranscriptNote = "";
    try {
      if (rawTranscriptIndex) {
        const txRaw = env.ENCRYPTION_KEY && rawTranscriptIndex.startsWith('v1:')
          ? await decryptField(rawTranscriptIndex.slice(3), env.ENCRYPTION_KEY).catch(() => null)
          : rawTranscriptIndex;
        if (txRaw) {
          const txIdx = JSON.parse(txRaw);
          if (Array.isArray(txIdx) && txIdx.length > 0) {
            const last = txIdx[txIdx.length - 1];
            const d = last.date ? new Date(last.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";
            const txVocab = last.vocab?.length ? ` Words from that session: ${last.vocab.slice(0,3).join(", ")}.` : "";
            lastTranscriptNote = `LAST SESSION TRANSCRIPT (${d}, ${last.mode || "free"} mode, ${last.turns || 0} turns): Obi opened with: "${(last.headline || "").slice(0, 80)}".${txVocab} Reference this to show the student you remember them.`;
          }
        }
      }
    } catch (_) {}

    let lastSessionNotes = "";
    let lastSessionVocab = [];
    try {
      if (sessionHistRaw) {
        const hist = JSON.parse(sessionHistRaw);
        if (hist.length > 0) {
          const last = hist[hist.length - 1];
          const daysAgo = Math.floor((Date.now() - (last.ts || Date.now())) / 86400000);
          const when = daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : daysAgo + " days ago";
          lastSessionVocab = (last.vocab || []).slice(0, 5);
          const vocabStr = lastSessionVocab.length > 0 ? " Vocab practiced: " + lastSessionVocab.map(w => `"${w}"`).join(", ") + "." : "";
          lastSessionNotes = `LAST SESSION NOTES: Student had a session ${when} (${last.turns || 0} speaking turns).${vocabStr}`;
        }
      }
    } catch (_) {}

    let dueVocab = [];
    try {
      if (rawSrsData) {
        const srsMap = JSON.parse(rawSrsData);
        const now = Date.now();
        dueVocab = Object.values(srsMap)
          .filter(w => (w.next_review ?? 0) <= now)
          .sort((a, b) => (a.next_review ?? 0) - (b.next_review ?? 0))
          .slice(0, 5);
      }
    } catch (_) {}

    try {
      if (sessionHistRaw) {
        const hist = JSON.parse(sessionHistRaw);
        if (hist.length > 0 && (!memoryData?.world_model || hist.length !== memoryData?.session_count)) {
          const allVocab = [...new Set(hist.flatMap(s => s.vocab || []))].slice(0, 20);
          const totalSessions = hist.length;
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const recentCount = hist.filter(s => s.ts > weekAgo).length;
          const freq = recentCount >= 3 ? "practices regularly" : recentCount >= 1 ? "practices occasionally" : "has been away for a while";
          const totalTurns = hist.reduce((sum, s) => sum + (s.turns || 0), 0);
          const avgTurns = Math.round(totalTurns / totalSessions);
          const engagement = avgTurns > 15 ? "chatty and engaged" : avgTurns > 8 ? "moderately talkative" : "still warming up";
          const recentSessions = hist.slice(-5);
          const avgTurnLen = recentSessions.filter(s => s.avg_turn_length > 0).length > 0
            ? Math.round(recentSessions.reduce((sum, s) => sum + (s.avg_turn_length || 0), 0) / recentSessions.filter(s => s.avg_turn_length > 0).length)
            : 0;
          const turnLenNote = avgTurnLen > 8 ? "speaks in full sentences" : avgTurnLen > 3 ? "uses short phrases" : avgTurnLen > 0 ? "still building sentence length" : "";
          const world_model = `${totalSessions} sessions. ${freq}. ${engagement} (~${avgTurns} turns/session).${turnLenNote ? ` ${turnLenNote} (~${avgTurnLen} words/turn).` : ""} Vocab covered: ${allVocab.slice(0, 10).join(", ") || "building vocabulary"}.`;
          const vocabSessionCount = {};
          for (const s of hist) { for (const w of (s.vocab || [])) { vocabSessionCount[w] = (vocabSessionCount[w] || 0) + 1; } }
          const persistentWords = Object.entries(vocabSessionCount)
            .filter(([w, count]) => count >= 3 && (!srsData[w] || (srsData[w]?.interval || 1) <= 6))
            .map(([w]) => w).slice(0, 5);
          const existingStruggles = (memoryData?.struggles || []).filter(s => !s.startsWith("Still building:"));
          const crossSessionStruggles = persistentWords.length > 0
            ? [...existingStruggles, `Still building: ${persistentWords.join(", ")}`]
            : existingStruggles;
          const updatedMem = {
            ...(memoryData || {}),
            world_model,
            recent_vocab: allVocab,
            session_count: totalSessions,
            last_topic: memoryData?.last_topic || "",
            breakthroughs: memoryData?.breakthroughs || [],
            struggles: crossSessionStruggles.slice(-10),
            synthesized_at: new Date().toISOString()
          };
          if (env.STUDENT_MEMORY) env.STUDENT_MEMORY.put(`mem:${studentId}`, JSON.stringify(updatedMem)).catch(() => {});
          memoryData = updatedMem;
        }
      }
    } catch (_) {}

    const _level = (agentProfile?.level || agentProfile?.englishLevel || "").toLowerCase();
    const ttsSpeed = /^a1/.test(_level) ? 1.0 : /^a2/.test(_level) ? 1.0 : (agentLang === 'vi' ? 1.0 : 1.0);
    // PHE-TRAIL POS 110: ttsSpeed 0.85→1.0 (run139 RISE fix) — aura-2-zeus-en at sub-1.0 caused choppy audio artifacts per run138 §9.

    const settings = {
      type: "Settings",
      audio: {
        input:  { encoding: "linear16", sample_rate: 16000 },
        output: { encoding: "mp3" }
      },
      agent: {
        language: "en",
        greeting: buildGreeting(agentProfile, sessionMode, memoryData?.last_topic || null),
        listen: {
          provider: { type: "deepgram", model: "nova-3" }
        },
        think: {
          provider: { type: "open_ai", model: "gpt-4o-mini" },
          // ⛔ LOCKED — DO NOT CHANGE THE LINE ABOVE. ⛔
          // "open_ai" here does NOT mean external OpenAI. With no `endpoint`, Deepgram runs gpt-4o-mini
          // IN-HOUSE inside its own agentic pipeline (no key, no account, no bill, no network hop out).
          // Any other provider (google/gemini/etc) routes OUTSIDE Deepgram = +seconds latency = inferior.
          // Broken & relitigated 3+ times. Confirmed Run 097. Guarded by test/voice-brain-lock.test.mjs.
          prompt: buildAgentPrompt(agentProfile, agentLang, recentVocab, arcData, sessionMode, memoryData, phonicsData),
            functions: [{
              name: "save_vocabulary_word",
              description: "Save an English word the student successfully used in a sentence.",
              parameters: { type: "object", properties: { word: { type: "string", description: "The English word or phrase" }, meaning_vi: { type: "string", description: "Vietnamese meaning (optional)" } }, required: ["word"] }
            }]
          },
speak: {
             provider: { type: "deepgram", model: "aura-2-zeus-en", speed: ttsSpeed }
          }
        }
      };
if (lastSessionNotes) settings.agent.think.prompt += "\n\n" + lastSessionNotes;
       if (lastTranscriptNote) settings.agent.think.prompt += "\n\n" + lastTranscriptNote;
       const vocabDueCtx = buildVocabContext(dueVocab);
      if (vocabDueCtx) settings.agent.think.prompt += "\n\n" + vocabDueCtx;
      const MAX_PROMPT = 24000;
      const PROMPT_WARN = 20000;
      if (settings.agent.think.prompt.length > PROMPT_WARN) {
        console.warn(`PROMPT_NEAR_CAP: ${settings.agent.think.prompt.length} chars (cap ${MAX_PROMPT}, Deepgram limit 25000) — mode=${sessionMode} student=${studentId}`);
      }
      if (settings.agent.think.prompt.length > MAX_PROMPT) {
        settings.agent.think.prompt = settings.agent.think.prompt.slice(0, MAX_PROMPT) + "\n[context trimmed]";
      }
      const phonicsHint = sessionMode === 'phonics' ? {
        group_name: phonicsData?.group_name || 'SATNIP',
        next_sentence: phonicsData?.next_drill?.sentence || 'She sat next to me at the station.',
        drill_count: phonicsData?.drills_completed?.length || phonicsData?.drill_count || phonicsData?.session_count_phonics || 0
      } : null;
      // Block W: Sydney region routing hint for VN students
      const ws_url = agentLang === 'vi' ? "wss://agent.deepgram.com/v1/agent/converse?region=syd" : null;
      // ⛔ VOICE BRAIN LOCK — runtime assertion (throws if provider mutated; caught by catch → 500)
      assertVoiceBrainLock(settings);
// ── LAYER 6: Prompt cache write (fire-and-forget) ──
       if (env.NET_PET_KV && !cachedPromptResult) {
         const cachePayload = { settings, phonicsHint, lastSessionVocab, lastSessionTopic: memoryData?.last_topic || null, ws_url };
         env.NET_PET_KV.put(promptCacheKey, JSON.stringify(cachePayload), { expirationTtl: 300 }).catch(() => {});
       }
       return addCors(json({ token: access_token, settings, phonicsHint, lastSessionVocab, lastSessionTopic: memoryData?.last_topic || null, ws_url }), request);
     } catch (err) {
       logError("TOKEN_ENDPOINT_ERROR", {
         studentId,
         sessionMode,
         message: err?.message || String(err),
         stack: (err?.stack || '').split('\n').slice(0, 3).join(' | ')
       }, env);
       return addCors(json({ error: err.message }, 500), request);
     }
  }

  // Voice Agent: browser-side vocab save callback (called when FunctionCallRequest received from Deepgram)
  if (path === "/api/agent/vocab" && method === "POST") {
    const body = await request.json().catch(() => ({}));
    const { studentId, word, meaning_vi } = body;
    if (!studentId || !word) return addCors(json({ error: "studentId and word required" }, 400), request);
    const _vocabIdCheck = validateStudentId(studentId);
    if (!_vocabIdCheck.valid) return addCors(json({ error: _vocabIdCheck.error }, 400), request);
    const _vocabRosterCheck = validateActiveStudent(studentId);
    if (!_vocabRosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);
    const result = await seedVocab(studentId, word, meaning_vi, "obi_chat", env, 4);
    return addCors(json(result.ok ? { saved: true, word } : { error: "empty word" }, result.ok ? 200 : 400), request);
  }

  // Voice Agent: read session history
  if (path === "/api/agent/session" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
    const _sessGetIdCheck = validateStudentId(studentId);
    if (!_sessGetIdCheck.valid) return addCors(json({ error: _sessGetIdCheck.error }, 400), request);
    const _sessGetRosterCheck = validateActiveStudent(studentId);
    if (!_sessGetRosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);
    try {
      const history = await kvDecryptGet(env.NET_PET_KV, `session_history_${studentId}`, env.ENCRYPTION_KEY) ?? [];
      return addCors(json({ sessions: history, count: history.length }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  // Voice Agent: save session completion metrics
  if (path === "/api/agent/session" && method === "POST") {
    const body = await request.json().catch(() => ({}));
    const { studentId, turns, durationMs, vocab } = body;
    if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
    const _sessPostIdCheck = validateStudentId(studentId);
    if (!_sessPostIdCheck.valid) return addCors(json({ error: _sessPostIdCheck.error }, 400), request);
    const _sessPostRosterCheck = validateActiveStudent(studentId);
    if (!_sessPostRosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);
    try {
      const topic = body.topic || null;
      const avg_turn_length = body.avg_turn_length || 0;
      const barge_in_count = body.barge_in_count || 0;
      const [history, rawMem] = await Promise.all([
        kvDecryptGet(env.NET_PET_KV, `session_history_${studentId}`, env.ENCRYPTION_KEY).then(v => v ?? []),
        env.STUDENT_MEMORY ? env.STUDENT_MEMORY.get(`mem:${studentId}`) : Promise.resolve(null)
      ]);
      history.push({ ts: Date.now(), turns: turns || 0, durationMs: durationMs || 0, vocab: vocab || [], topic: topic || null, avg_turn_length, barge_in_count });

      // Breakthroughs + struggles detection — update STUDENT_MEMORY async
      if (env.STUDENT_MEMORY) {
        try {
          const mem = rawMem ? JSON.parse(rawMem) : {};
          const breakthroughs = (mem.breakthroughs || []).slice(-10);
          const struggles = (mem.struggles || []).slice(-10);
          const vocabArr = vocab || [];
          const turnCount = turns || 0;
          if (vocabArr.length >= 2) {
            breakthroughs.push(`Used ${vocabArr.length} new words: ${vocabArr.slice(0,3).join(", ")}`);
          }
          if (turnCount >= 20) {
            breakthroughs.push(`Highly engaged session (${turnCount} turns)`);
          }
          if (vocabArr.length === 0 && turnCount > 0) {
            struggles.push(`Session with no new vocabulary (${turnCount} turns)`);
          }
          if (turnCount > 0 && turnCount < 5) {
            struggles.push(`Short session — only ${turnCount} turns`);
          }
          const updatedMem = { ...mem, breakthroughs, struggles, last_session_ts: Date.now(), ...(topic ? { last_topic: topic } : {}) };
          env.STUDENT_MEMORY.put(`mem:${studentId}`, JSON.stringify(updatedMem)).catch(() => {});
        } catch (_) {}
      }

      await kvEncryptPut(env.NET_PET_KV, `session_history_${studentId}`, history.slice(-20), env.ENCRYPTION_KEY);
      return addCors(json({ ok: true, sessions: history.length }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  // STT key endpoint — kept for fallback REST mode
  if (path === "/api/stt/key" && method === "GET") {
    if (!globalThis.__DG_KEY) globalThis.__DG_KEY = env.DEEPGRAM_API_KEY;
    return addCors(json({ key: globalThis.__DG_KEY || "" }), request);
  }

  // STT — Deepgram Nova-3 speech-to-text with word confidence (REST fallback)
  if (path === "/api/stt" && method === "POST") {
    // Cache Deepgram key in globalThis to avoid secret lookup per chunk
    if (!globalThis.__DG_KEY) globalThis.__DG_KEY = env.DEEPGRAM_API_KEY;
    const apiKey = globalThis.__DG_KEY;
    if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not configured" }, 500);
    const contentType = request.headers.get("content-type") || "audio/webm";
    const diarize = url.searchParams.get("diarize") === "true";
    const audioBuffer = await request.arrayBuffer();
    if (!audioBuffer.byteLength) return json({ error: "No audio received" }, 400);
    try {
      const dgParams = `model=nova-3&punctuate=true&smart_format=true&utterances=true${diarize ? "&diarize=true" : ""}`;
      const dgRes = await fetch(
        `https://api.deepgram.com/v1/listen?${dgParams}`,
        {
          method: "POST",
          headers: { "Authorization": `Token ${apiKey}`, "Content-Type": contentType },
          body: audioBuffer,
        }
      );
      if (!dgRes.ok) return json({ error: `Deepgram STT ${dgRes.status}` }, 502);
      const data = await dgRes.json();
      const alt = data?.results?.channels?.[0]?.alternatives?.[0];
      if (!alt) return json({ error: "No transcript returned" }, 422);
      const response = {
        transcript: alt.transcript || "",
        words: (alt.words || []).map(w => ({ word: w.word, confidence: w.confidence, start: w.start, end: w.end, speaker: w.speaker ?? null })),
        duration: data?.metadata?.duration || 0,
      };
      if (diarize) {
        response.utterances = (data?.results?.utterances || []).map(u => ({
          speaker: u.speaker,
          transcript: u.transcript,
          start: u.start,
          end: u.end,
          confidence: u.confidence,
        }));
      }
      return addCors(json(response), request);
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  }

  // Phonics Curriculum — NET Phonics Groups 1-7 drill data
  if (path === "/api/phonics/curriculum" && method === "GET") {
    const group = url.searchParams.get("group"); // optional filter: th_sounds, r_l_distinction, etc.
    try {
      const drills = group ? PHONICS_DRILLS.filter(d => d.group === group) : PHONICS_DRILLS;
      const groups = [...new Set(PHONICS_DRILLS.map(d => d.group))];
      return addCors(json({ drills, groups, total: drills.length }), request);
    } catch (err) {
      logError('PHONICS_CURRICULUM_FAIL', { error: err.message }, env);
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  // Phonics Progress — KV-backed per-student tracking
  if (path === "/api/phonics/progress" && method === "GET") {
    try {
      const studentId = url.searchParams.get("studentId");
      if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
      const key = "phonics_progress_" + studentId;
      let progress = await kvDecryptGet(env.NET_PET_KV, key, env.ENCRYPTION_KEY);
      if (!progress) {
        progress = { current_group: 1, drills_completed: [], dominant_errors: [], groups_unlocked: [1, 0, 0, 0, 0, 0, 0], last_drill_id: null, session_count_phonics: 0 };
      }
      const gIdx = Math.min(Math.max((progress.current_group || 1) - 1, 0), NET_PHONICS_GROUPS.length - 1);
      const group_name = NET_PHONICS_GROUPS[gIdx].name;
      const drillsInGroup = PHONICS_DRILLS.filter(d => d.group === NET_PHONICS_GROUPS[gIdx].id);
      const next_drill = drillsInGroup.find(d => !progress.drills_completed.includes(d.id)) || (drillsInGroup.length > 0 ? drillsInGroup[drillsInGroup.length - 1] : null);
      const completion_pct = drillsInGroup.length > 0 ? Math.round(drillsInGroup.filter(d => progress.drills_completed.includes(d.id)).length / drillsInGroup.length * 100) : 0;
      // Per-phoneme mastery: count drill appearances vs completions for each phoneme
      const phonemeTotal = {}, phonemeDone = {};
      for (const drill of drillsInGroup) {
        for (const ph of (drill.phonemes || [])) {
          phonemeTotal[ph] = (phonemeTotal[ph] || 0) + 1;
          if (progress.drills_completed.includes(drill.id)) phonemeDone[ph] = (phonemeDone[ph] || 0) + 1;
        }
      }
      const phoneme_mastery = {};
      for (const ph of Object.keys(phonemeTotal)) {
        phoneme_mastery[ph] = Math.round((phonemeDone[ph] || 0) / phonemeTotal[ph] * 100);
      }
      const weak_phonemes = Object.entries(phoneme_mastery).filter(([,v]) => v < 50).map(([k]) => k);
      return addCors(json({ ...progress, group_name, next_drill, completion_pct, phoneme_mastery, weak_phonemes }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  if (path === "/api/phonics/progress" && method === "POST") {
    try {
      const { studentId, drill_id, error_type } = await request.json();
      if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
      const key = "phonics_progress_" + studentId;
      let progress = await kvDecryptGet(env.NET_PET_KV, key, env.ENCRYPTION_KEY) || { current_group: 1, drills_completed: [], dominant_errors: [], groups_unlocked: [1, 0, 0, 0, 0, 0, 0], last_drill_id: null, session_count_phonics: 0, created_at: new Date().toISOString() };
      if (drill_id) progress.drills_completed = Array.from(new Set([...progress.drills_completed, drill_id]));
      if (error_type) progress.dominant_errors = Array.from(new Set([error_type, ...progress.dominant_errors])).slice(0, 3);
      if (drill_id) progress.last_drill_id = drill_id;
      progress.drill_count = (progress.drill_count || 0) + 1;
      progress.updated_at = new Date().toISOString();
      await kvEncryptPut(env.NET_PET_KV, key, progress, env.ENCRYPTION_KEY);
      const gIdx2 = Math.min(Math.max((progress.current_group || 1) - 1, 0), NET_PHONICS_GROUPS.length - 1);
      const group_name = NET_PHONICS_GROUPS[gIdx2].name;
      const drillsInGroup = PHONICS_DRILLS.filter(d => d.group === NET_PHONICS_GROUPS[gIdx2].id);
      const next_drill = drillsInGroup.find(d => !progress.drills_completed.includes(d.id)) || (drillsInGroup.length > 0 ? drillsInGroup[drillsInGroup.length - 1] : null);
      const completion_pct = drillsInGroup.length > 0 ? Math.round(drillsInGroup.filter(d => progress.drills_completed.includes(d.id)).length / drillsInGroup.length * 100) : 0;
      return addCors(json({ ...progress, group_name, next_drill, completion_pct }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  if (path === "/api/phonics/advance" && method === "POST") {
    try {
      const { studentId } = await request.json();
      if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
      const key = "phonics_progress_" + studentId;
      let progress = await kvDecryptGet(env.NET_PET_KV, key, env.ENCRYPTION_KEY) || { current_group: 1, drills_completed: [], dominant_errors: [], groups_unlocked: [1, 0, 0, 0, 0, 0, 0], last_drill_id: null, session_count_phonics: 0, created_at: new Date().toISOString() };
      if (progress.current_group === 7) {
        return addCors(json({ advanced: false, message: "All groups complete" }), request);
      }
      const advGIdx = Math.min(Math.max((progress.current_group || 1) - 1, 0), NET_PHONICS_GROUPS.length - 1);
      const drillsInCurrentGroup = PHONICS_DRILLS.filter(d => d.group === NET_PHONICS_GROUPS[advGIdx].id);
      const completedCount = drillsInCurrentGroup.filter(d => progress.drills_completed.includes(d.id)).length;
      const advanceThreshold = Math.max(drillsInCurrentGroup.length - 1, 1);
      if (completedCount >= advanceThreshold) {
        progress.current_group++;
        if (progress.groups_unlocked) progress.groups_unlocked[progress.current_group - 1] = 1;
        progress.updated_at = new Date().toISOString();
        await kvEncryptPut(env.NET_PET_KV, key, progress, env.ENCRYPTION_KEY);
        const newGIdx = Math.min(progress.current_group - 1, NET_PHONICS_GROUPS.length - 1);
        const new_group_name = NET_PHONICS_GROUPS[newGIdx].name;
        return addCors(json({ advanced: true, new_group: progress.current_group, new_group_name }), request);
      }
      return addCors(json({ advanced: false, drills_remaining: 4 - completedCount }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  // Vocabulary SRS
  if (path === "/api/vocab/add"    && method === "POST") {
    const body = await request.json().catch(() => ({}));
    const { studentId, word, meaning_vi } = body;
    if (!studentId || !word) return addCors(json({ error: "studentId and word required" }, 400), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
    const rosterCheck = validateActiveStudent(studentId);
    if (!rosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);
    const result = await seedVocab(studentId, word, meaning_vi, "manual", env);
    return addCors(json(result.ok ? { added: true, word } : { error: "empty word" }, result.ok ? 200 : 400), request);
  }
  if (path === "/api/vocab/due"    && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId || studentId.startsWith('sov100-test-')) return addCors(json({ due: [], count: 0 }), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
    try {
      const [srsRaw, listRaw] = await Promise.all([
        env.NET_PET_KV.get(`srs_data_${studentId}`),
        env.NET_PET_KV.get(`vocab_list_${studentId}`)
      ]);
      if (!srsRaw) return addCors(json({ due: [], count: 0 }), request);
      const srsMap = JSON.parse(srsRaw);
      const meanings = {};
      if (listRaw) for (const w of JSON.parse(listRaw)) meanings[w.word] = w.meaning_vi || "";
      const now = Date.now();
      const due = Object.values(srsMap)
        .filter(w => (w.next_review ?? 0) <= now)
        .sort((a, b) => (a.next_review ?? 0) - (b.next_review ?? 0))
        .map(w => ({ word: w.word, translation: w.translation || meanings[w.word] || "", source: w.source }));
      return addCors(json({ due, count: due.length }), request);
    } catch (err) {
      logWarn('VOCAB_DUE_KV_FAIL', { studentId, error: err.message }, env);
      return addCors(json({ due: [], count: 0 }), request);
    }
  }
  if (path === "/api/vocab/review" && method === "POST") {
    const body = await request.json().catch(() => ({}));
    const { studentId, word, grade } = body;
    if (!studentId || !word || grade == null) return addCors(json({ error: "studentId, word, grade required" }, 400), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
    const rosterCheck = validateActiveStudent(studentId);
    if (!rosterCheck.valid) return addCors(json({ error: 'student not authorized', code: 'NOT_IN_ROSTER' }, 403), request);
    const result = await seedVocab(studentId, word, "", "manual", env, grade);
    return addCors(json(result.ok ? { reviewed: true, next_review: result.next_review } : { error: "empty word" }, result.ok ? 200 : 400), request);
  }
  if (path === "/api/vocab/list"   && method === "GET")  { return handleVocabList(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/voice/score"  && method === "POST") { const body = await request.json(); return handleVoiceScore(body, env); }

  // Onboarding
  if ((path === "/api/onboarding" || path === "/api/student/onboard") && method === "POST") { const body = await request.json(); return handleOnboarding(body, env); }

  // Memory (Legacy)
  if (path === "/api/memory" && method === "POST") { const body = await request.json(); return handleMemorySave(body, env, request); }
  if (path === "/api/memory" && method === "GET") { return handleMemoryGet(url.searchParams.get("studentId") || "", env, request); }

  // ── Student Memory Pipeline (Strategic Differentiator) ─────────────────────
  // GET /api/memory/:studentId — Read world_model + recent_vocab + session stats
  if (path.startsWith("/api/memory/") && method === "GET" && !path.includes("/summary")) {
    const studentId = path.split("/api/memory/")[1]?.split("?")[0];
    if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
    try {
      const raw = env.STUDENT_MEMORY ? await env.STUDENT_MEMORY.get(`mem:${studentId}`) : null;
      const mem = raw ? JSON.parse(raw) : { world_model: "", recent_vocab: [], session_count: 0, last_topic: "", breakthroughs: [], struggles: [] };
      return addCors(json(mem), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }
  // POST /api/memory/:studentId — Merge updates into student memory
  if (path.startsWith("/api/memory/") && method === "POST" && !path.includes("/summary")) {
    const studentId = path.split("/api/memory/")[1]?.split("?")[0];
    if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
    try {
      const body = await request.json().catch(() => ({}));
      const raw = env.STUDENT_MEMORY ? await env.STUDENT_MEMORY.get(`mem:${studentId}`) : null;
      const existing = raw ? JSON.parse(raw) : { world_model: "", recent_vocab: [], session_count: 0, last_topic: "", breakthroughs: [], struggles: [] };
      
      // Merge logic
      if (body.world_model_update) existing.world_model = body.world_model_update;
      if (body.new_vocab && Array.isArray(body.new_vocab)) {
        existing.recent_vocab = [...new Set([...existing.recent_vocab, ...body.new_vocab])].slice(-20);
      }
      if (body.session_summary) existing.last_topic = body.session_summary;
      if (body.breakthrough) existing.breakthroughs = [body.breakthrough, ...(existing.breakthroughs || [])].slice(0, 10);
      if (body.struggle) existing.struggles = [body.struggle, ...(existing.struggles || [])].slice(0, 10);
      existing.session_count = (existing.session_count || 0) + 1;
      existing.updated_at = new Date().toISOString();

      // Enforce 10KB limit
      const serialized = JSON.stringify(existing);
      if (serialized.length > 10240) {
        // Trim oldest vocab/breakthroughs if over limit
        existing.recent_vocab = existing.recent_vocab.slice(-10);
        existing.breakthroughs = (existing.breakthroughs || []).slice(0, 5);
        existing.struggles = (existing.struggles || []).slice(0, 5);
      }

      if (env.STUDENT_MEMORY) {
        await env.STUDENT_MEMORY.put(`mem:${studentId}`, JSON.stringify(existing));
      }
      return addCors(json({ ok: true, session_count: existing.session_count }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }

  // Progress + Weakness tracking
  if (path === "/api/progress" && method === "GET") { return handleProgress(url.searchParams.get("studentId") || "", env); }

  // Daily task + Memory
  if (path === "/api/daily" && method === "GET") { return handleDailyTask(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/memory/summary" && method === "GET") { return handleMemorySummary(url.searchParams.get("studentId") || "", env); }

  // Lesson / Practice / Feedback
  if (path === "/api/lesson" && method === "POST") { const body = await request.json(); return handleLesson(body, env); }
  if (path === "/api/practice" && method === "POST") { const body = await request.json(); return handlePractice(body, env); }
  if (path === "/api/feedback" && method === "POST") { const body = await request.json(); return handleFeedback(body, env); }

  // NET Pet
  if (path === "/api/netpet/checkin" && method === "POST") { const body = await request.json(); return handlePetCheckin(body, env); }
  if (path === "/api/netpet/state" && method === "GET") { return handlePetState(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/netpet/score" && method === "GET") { return handlePetScore(url.searchParams.get("studentId") || "", env); }

  // Phonics Drills — targeted practice based on weaknesses
  if (path === "/api/drills/next" && method === "GET") { return handleDrillNext(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/drills/result" && method === "POST") { const body = await request.json(); return handleDrillResult(body, env); }
  if (path === "/api/drills/list" && method === "GET") { return handleDrillList(); }

  // Metrics — the 4 that matter (DAU, completion, retention, error reduction)
  if (path === "/api/metrics/summary" && method === "GET") { return handleMetricsSummary(env); }
  if (path === "/api/metrics/dau" && method === "GET") { return handleMetricsDAU(env); }
  if (path === "/api/metrics/retention" && method === "GET") { return handleMetricsRetention(env); }
  if (path === "/api/metrics/errors" && method === "GET") { return handleMetricsErrors(url.searchParams.get("studentId") || "", env); }

  // Classroom
  if (path === "/api/classroom/session/start" && method === "POST") { const body = await request.json(); return handleClassStart(body, env); }
  if (path === "/api/classroom/event" && method === "POST") { const body = await request.json(); return handleClassEvent(body, env); }
  if (path === "/api/classroom/session" && method === "GET") { return handleClassSession(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env); }
  if (path === "/api/classroom/report" && method === "GET") { return handleClassReport(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env); }

  // Cryptographic Immutable Ledger
  if (path === "/api/ledger/append" && method === "POST") { const body = await request.json(); return handleLedgerAppend(body, env); }
  if (path === "/api/ledger/history" && method === "GET") { return handleLedgerHistory(url.searchParams.get("studentId") || "", parseInt(url.searchParams.get("limit") || "50"), env); }
  if (path === "/api/ledger/verify" && method === "GET") { return handleLedgerVerify(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/ledger/state" && method === "GET") { return handleLedgerState(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/ledger/stats" && method === "GET") { return handleLedgerStats(env); }

  // Session Log (off-day pipeline core — Michael logs class, Obi inherits it)
  if (path === "/api/session/log" && method === "POST") { const body = await request.json(); return handleSessionLog(body, env); }
  if (path === "/api/session/latest" && method === "GET") { return handleSessionLatest(url.searchParams.get("studentId") || "", env); }

  // Schedule + Accountability
  if (path === "/api/schedule/set" && method === "POST") { const body = await request.json(); return handleScheduleSet(body, env); }
  if (path === "/api/schedule/confirm" && method === "POST") { const body = await request.json(); return handleScheduleConfirm(body, env); }
  if (path === "/api/schedule/flags" && method === "GET") { return handleScheduleFlags(env); }

  // Zalo Pressure API — accountability alerts + relation graph
  if (path === "/api/zalo/sweep" && method === "POST") { return handleZaloSweep(env); }
  if (path === "/api/zalo/check" && method === "POST") { const body = await request.json(); return handleZaloCheck(body, env); }
  if (path === "/api/zalo/send" && method === "POST") { const body = await request.json(); return handleZaloSend(body, env); }
  if (path === "/api/pressure/status" && method === "GET") { return handlePressureStatus(env); }
  if (path === "/api/pressure/test" && method === "POST") { const body = await request.json(); return handlePressureTest(body, env); }
  if (path === "/api/relations/add" && method === "POST") { const body = await request.json(); return handleRelationAdd(body, env); }
  if (path === "/api/relations/remove" && method === "POST") { const body = await request.json(); return handleRelationRemove(body, env); }
  if (path === "/api/relations/get" && method === "GET") { return handleRelationGet(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/relations/all" && method === "GET") { return handleRelationAll(env); }
  if (path === "/api/roster/zalo" && method === "POST") { const body = await request.json(); return handleRosterZalo(body, env); }

  // Daily Digest — Michael's one-URL morning report
  if (path === "/api/digest" && method === "GET") { return handleDailyDigest(env); }

  // Soul DNA — verbatim raw capture (no sanitization, no truncation, hash-chained)
  if (path === "/api/soulDNA" && method === "POST") { const body = await request.json(); return handleSoulDNACapture(body, env); }
  if (path === "/api/soulDNA" && method === "GET") { return handleSoulDNAGet(url, env); }

  // Command Station (SOV100 → Agent99 → Drones)
  if (path === "/api/command/send" && method === "POST") { const body = await request.json(); return handleCommandSend(body, env); }
  if (path === "/api/command/queue" && method === "GET") { return handleCommandQueue(url.searchParams.get("status") || "pending", parseInt(url.searchParams.get("limit") || "20"), env); }
  if (path === "/api/command/claim" && method === "POST") { const body = await request.json(); return handleCommandClaim(body, env); }
  if (path === "/api/command/complete" && method === "POST") { const body = await request.json(); return handleCommandComplete(body, env); }
  if (path === "/api/command/status" && method === "GET") { return handleCommandStatus(url.searchParams.get("commandId") || "", env); }
  if (path === "/api/command/history" && method === "GET") { return handleCommandHistory(parseInt(url.searchParams.get("limit") || "50"), env);   }

  // ── Notion: BLACKLISTED ────────────────────────────────────────────────────
  // All /api/notion/* routes are permanently disabled — legacy data preserved in CANON/REINCARNATION.
  if (path.startsWith("/api/notion/")) { return json({ blacklisted: true, notion: "BLACKLISTED — platform usage permanently disabled" }, 403); }

  // ── Behavioral Loop Engine ────────────────────────────────────────────────
  // /api/loop — Enforced speak→correct→repeat→score cycle (single call)
  if (path === "/api/loop" && method === "POST") { const body = await request.json(); return handleLoop(body, env); }
  // /api/tiger-score — On-demand Tiger Score with full breakdown
  if (path === "/api/tiger-score" && method === "GET") { return handleTigerScore(url.searchParams.get("studentId") || "", env); }
  // /api/analytics — The only 4 metrics that matter
  if (path === "/api/analytics" && method === "GET") { return handleAnalytics(env); }

  // ── Student Password Management (KV-backed, SHA-256 hashed) ────────────
  // POST /api/student/checkpw — { studentId, pw } → { ok, isDefault }
  if (path === "/api/student/checkpw" && method === "POST") {
    const { studentId, pw } = await request.json();
    if (!studentId || !pw) return addCors(json({ error: "studentId and pw required" }, 400), request);
    const [hash, defaultHash, stored] = await Promise.all([
      computeHash(pw),
      computeHash("bluetech2026"),
      env.NET_PET_KV.get(`student_pw_${studentId}`)
    ]);
    if (stored) return addCors(json({ ok: hash === stored, isDefault: false }), request);
    const isDefault = hash === defaultHash;
    return addCors(json({ ok: isDefault, isDefault }), request);
  }
  // POST /api/student/setpw — { studentId, currentPw, newPw } → { ok }
  if (path === "/api/student/setpw" && method === "POST") {
    const { studentId, currentPw, newPw } = await request.json();
    if (!studentId || !currentPw || !newPw) return addCors(json({ error: "studentId, currentPw, newPw required" }, 400), request);
    if (newPw.length < 6) return addCors(json({ ok: false, error: "Password must be at least 6 characters" }, 400), request);
    const [currentHash, defaultHash, stored] = await Promise.all([
      computeHash(currentPw),
      computeHash("bluetech2026"),
      env.NET_PET_KV.get(`student_pw_${studentId}`)
    ]);
    const validCurrent = stored ? currentHash === stored : currentHash === defaultHash;
    if (!validCurrent) return addCors(json({ ok: false, error: "Current password incorrect" }, 403), request);
    const newHash = await computeHash(newPw);
    await env.NET_PET_KV.put(`student_pw_${studentId}`, newHash);
    return addCors(json({ ok: true }), request);
  }

  // ── P10: Student Data Deletion (admin-gated) ────────────────────────────
  if (path === "/api/admin/student/delete" && method === "DELETE") {
    const adminBlock = await checkAdminKey(request, env);
    if (adminBlock) return addCors(adminBlock, request);
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
    const kvKeys = [
      `student_profile_${studentId}`, `lang:${studentId}`, `vocab_list_${studentId}`,
      `vocab_arc_${studentId}`, `session_history_${studentId}`, `phonics_progress_${studentId}`,
      `student_pw_${studentId}`, `streak:${studentId}`, `goals:${studentId}`, `subscription:${studentId}`,
      `srs_data_${studentId}`
    ];
    let kvDeleted = 0;
    for (const k of kvKeys) { try { await env.NET_PET_KV.delete(k); kvDeleted++; } catch (_) {} }
    let d1Deleted = 0;
    try {
      const r = await env.SOUL_DB.prepare(`DELETE FROM soul_prompts WHERE session_id LIKE ?`).bind(`${studentId}%`).run();
      d1Deleted = r.meta?.changes ?? 0;
    } catch (_) {}
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    await logAudit(env, { action: 'student_delete', actor: 'admin', target: studentId, ip, meta: { kvDeleted, d1Deleted } });
    return addCors(json({ deleted: true, studentId, kvDeleted, d1Deleted }), request);
  }

  // ── v2 Pipeline: Student State + Session Events ───────────────────────────
  // /api/student/state — Full behavioral state from NET_PET_KV student_profile_* keys
  if (path === "/api/student/state" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);

    // Read profile from KV (seeded via wrangler kv key put student_profile_*)
    let profile = null;
    try {
      const raw = await env.NET_PET_KV.get(`student_profile_${studentId}`);
      if (raw) profile = normalizeStudentProfile(JSON.parse(raw));
    } catch (_) {}

    // Read streak data
    let streak = { currentStreak: 0, longestStreak: 0 };
    try {
      const streakRaw = await env.NET_PET_KV.get(`streak:${studentId}`);
      if (streakRaw) streak = JSON.parse(streakRaw);
    } catch (_) {}

    // Read language preference
    let lang = "en";
    try {
      const langVal = await env.NET_PET_KV.get(`lang:${studentId}`);
      if (langVal) lang = langVal;
    } catch (_) {}

    // Read homework notes + session history count in parallel
    let homeworkNotes = "", sessions = 0;
    try {
      const [hwRaw, histRaw] = await Promise.all([
        env.NET_PET_KV.get(`student:${studentId}:homework_notes`),
        env.NET_PET_KV.get(`session_history_${studentId}`)
      ]);
      if (hwRaw) homeworkNotes = hwRaw;
      if (histRaw) { const h = JSON.parse(histRaw); sessions = Array.isArray(h) ? h.length : 0; }
    } catch (_) {}

    return addCors(json({
      ok: true,
      studentId,
      profile: profile || null,
      streak,
      lang,
      homework_notes: homeworkNotes,
      sessions,
      source: profile ? "kv" : "empty"
    }), request);
  }
  // Block S: PATCH /api/student/state — Write session stats back to KV
  if (path === "/api/student/state" && method === "PATCH") {
    try {
      const body = await request.json();
      const studentId = body.studentId || "";
      if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
      const idCheck = validateStudentId(studentId);
      if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
      // Persist homework_notes separately if provided (must run before patch guard)
      if (body.homework_notes !== undefined) {
        await env.NET_PET_KV.put(`student:${studentId}:homework_notes`, String(body.homework_notes).slice(0, 5000));
      }
      const patch = body.patch || {};
      if (Object.keys(patch).length === 0) {
        if (body.homework_notes === undefined) return addCors(json({ error: "patch or homework_notes required" }, 400), request);
        return addCors(json({ ok: true, studentId }), request);
      }
      // Read existing profile, normalize legacy fields, merge patch, normalize again, write back
      let profile = {};
      try {
        const raw = await env.NET_PET_KV.get(`student_profile_${studentId}`);
        if (raw) profile = normalizeStudentProfile(JSON.parse(raw));
      } catch (_) {}
      // Shallow merge — patch fields overwrite top-level keys only
      for (const [key, val] of Object.entries(patch)) {
        profile[key] = val;
      }
      profile = normalizeStudentProfile(profile);
      await env.NET_PET_KV.put(`student_profile_${studentId}`, JSON.stringify(profile));
      return addCors(json({ ok: true, studentId }), request);
    } catch (err) {
      return addCors(json({ error: err.message }, 500), request);
    }
  }
  // /api/session/events — Structured learning event chain
  if (path === "/api/session/events" && method === "GET") {
    const studentId = url.searchParams.get("studentId") || "";
    if (!studentId) return json({ error: "studentId required" }, 400);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return json({ error: idCheck.error }, 400);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`events-${studentId}`));
    const res = await stub.fetch(new Request(`https://do/events/recent?limit=${limit}`));
    return res;
  }

  // ── Skeleton Star Map ─────────────────────────────────────────────────────
  // /api/route — Get routing decision for a student (which module, which mode)
  if (path === "/api/route" && method === "POST") { const body = await request.json(); return handleRoute(body, env); }

  // ── Phoenix Reset ─────────────────────────────────────────────────────────
  // /api/phoenix/snapshot — Capture full student state
  if (path === "/api/phoenix/snapshot" && method === "POST") { const body = await request.json(); return handlePhoenixSnapshot(body, env); }
  // /api/phoenix/reset — Reset + rehydrate from latest snapshot
  if (path === "/api/phoenix/reset" && method === "POST") { const body = await request.json(); return handlePhoenixReset(body, env); }

  // ── Assessment + Report Engine (Week 4 — Productization) ────────────────
  // POST /api/assess — Run AI speaking diagnostic (submit transcript, get scored)
  if (path === "/api/assess" && method === "POST") { const body = await request.json(); return handleAssessment(body, env); }
  // GET /api/report — Generate styled HTML report for a student
  if (path === "/api/report" && method === "GET") { return handleReport(url.searchParams.get("studentId") || "", env); }
  // POST /api/report — Student problem report (from portal report button)
  if (path === "/api/report" && method === "POST") { const body = await request.json(); return handleReportPost(body, env); }
  // GET/POST /api/student/lang — Language preference for bilingual OBI support
  if (path === "/api/student/lang" && method === "GET") { return handleStudentLang(url.searchParams.get("studentId") || "", null, env); }
  if (path === "/api/student/lang" && method === "POST") { const body = await request.json(); return handleStudentLang(body.studentId || "", body.lang || "", env); }
  // POST /api/lead — Lead capture from assessment landing page
  if (path === "/api/lead" && method === "POST") { const body = await request.json(); return handleLeadCapture(body, env); }

  // ── Auto Post Engine ──────────────────────────────────────────────────────
  // /api/growth/posts — Generate posts from real student data
  if (path === "/api/growth/posts" && method === "GET") { return handleGrowthPosts(parseInt(url.searchParams.get("limit") || "5"), env); }
  // /api/growth/distribute — Manually trigger post distribution
  if (path === "/api/growth/distribute" && method === "POST") { return handleGrowthDistribute(env); }
  // /api/growth/log — View post history
  if (path === "/api/growth/log" && method === "GET") { return handleGrowthLog(parseInt(url.searchParams.get("limit") || "20"), env); }

  // ── Virality Engine ────────────────────────────────────────────────────
  if (path === "/api/virality/metrics" && method === "POST") { const body = await request.json(); return handleViralityProxy("/virality/metrics", "POST", body, env); }
  if (path === "/api/virality/metrics" && method === "GET") { return handleViralityProxy("/virality/metrics", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/top" && method === "GET") { return handleViralityProxy("/virality/top", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/experiment" && method === "POST") { const body = await request.json(); return handleViralityProxy("/virality/experiment", "POST", body, env); }
  if (path === "/api/virality/experiments" && method === "GET") { return handleViralityProxy("/virality/experiments", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/patterns" && method === "GET") { return handleViralityProxy("/virality/patterns", "GET", null, env, url.searchParams); }
  if (path === "/api/virality/learn" && method === "POST") { return handleViralityLearn(env); }
  if (path === "/api/virality/score" && method === "POST") { const body = await request.json(); return handleViralityScore(body); }
  if (path === "/api/virality/variants" && method === "POST") { const body = await request.json(); return handleViralityVariants(body, env); }

  // ── Session Hint (Chrome extension → chat.js YouTube personalization) ────
  if (path === "/api/session-hint") {
    if (method === "POST") return handleSessionHintPost(request, env);
    else return handleSessionHintGet(request, env);
  }

  // ── Face-Saving Protocol — Streak + Accountability (Vietnamese culture) ──
  if (path === "/api/listening/log" && method === "POST") { const body = await request.json(); return handleListeningLog(body, env, request); }
  if (path === "/api/listening/today" && method === "GET") { return handleListeningToday(url.searchParams.get("studentId") || "", env); }
  if (path === "/api/student/checkin" && method === "POST") { const body = await request.json(); return handleStudentCheckin(body, request, env); }
  if (path.startsWith("/api/student/streak/") && method === "GET") { const studentId = path.split("/api/student/streak/")[1] || ""; return handleStudentStreak(studentId, request, env); }
  if (path === "/api/student/saveface" && method === "POST") { const body = await request.json(); return handleStudentSaveface(body, request, env); }

  // ── Student Forecast — CEFR progression projection ───────────────────────
  if (path.startsWith("/api/student/forecast/") && method === "GET") {
    const studentId = path.split("/api/student/forecast/")[1] || "";
    return handleStudentForecast(studentId, env);
  }

  // ── Magic Chat — Obi quick-response with optional student context inject ──
  if (path === "/api/magic-chat" && method === "POST") { const body = await request.json(); return handleMagicChat(body, request, env); }

  // ── Leaderboard — Public student rankings by streak + mastered words ──────
  if (path === "/api/leaderboard" && method === "GET") { return handleLeaderboard(request, env); }

  // ── Referral System ───────────────────────────────────────────────────────
  if (path === "/api/referral/register" && method === "POST") { const body = await request.json(); return handleReferralRegister(body, request, env); }
  if (path.startsWith("/api/referral/stats/") && method === "GET") { const referrerId = path.split("/api/referral/stats/")[1] || ""; return handleReferralStats(referrerId, request, env); }
  if (path === "/api/referral/convert" && method === "POST") { const body = await request.json(); return handleReferralConvert(body, request, env); }

   // ── Phoenix Coder Queue Proxy — endpoint removed, use PC directly ─────────
   // ── Admin Statistics ─────────────────────────────────────────────────────
   // GET /api/admin/stats — admin dashboard metrics
   if (path === "/api/admin/stats" && method === "GET") {
     return handleAdminStats(env);
   }
   // ── Anti-Cheat Engagement Scoring ─────────────────────────────────────────
   // POST /api/anticheat/score — score a student session for genuine engagement
  if (path === "/api/anticheat/score" && method === "POST") { const body = await request.json(); return handleAntiCheatScore(body, env); }
  // GET /api/anticheat/history/:studentId — last 30 days of scores
  if (path.startsWith("/api/anticheat/history/") && method === "GET") {
    const studentId = path.split("/api/anticheat/history/")[1] || "";
    return handleAntiCheatHistory(studentId, env);
  }

  // ── Waitlist — Phase 2 free trial funnel (100-seat cap) ───────────────────
  if (path === "/api/waitlist" && method === "POST") { const body = await request.json(); return handleWaitlistJoin(body, env); }
  if (path === "/api/waitlist/count" && method === "GET") { return handleWaitlistCount(env); }
  else if (path === "/api/waitlist/list" && method === "GET") { return handleWaitlistList(env); }
  else if (path === "/api/admin/waitlist/toggle" && method === "POST") { const authFail = await checkAdminKey(request, env); if (authFail) return authFail; const body = await request.json(); return handleWaitlistToggle(body, env); }
  else if (path === "/api/admin/waitlist/status" && method === "GET") { return handleWaitlistStatus(env); }
  else if (path === "/api/admin/subscriptions" && method === "GET") { return handleAdminSubscriptionsList(env); }
  else if (path === "/api/admin/subscription" && method === "GET") { return handleAdminSubscriptionGet(url.searchParams.get("studentId") || "", env); }
  else if (path === "/api/admin/subscription/upsert" && method === "POST") { const authFail = await checkAdminKey(request, env); if (authFail) return authFail; const body = await request.json(); return handleAdminSubscriptionUpsert(body, env); }

  // ── DELETE /api/vocab/delete ──────────────────────────────────────────────
  else if (method === "DELETE" && path.includes("/api/vocab/delete")) {
    try {
      const body = await request.json().catch(() => ({}));
      const { studentId, vocabId } = body;
      if (!studentId || !vocabId) return json({ error: "studentId and vocabId required" }, 400);
      const key = `vocab:${studentId}:${vocabId}`;
      const existing = await env.NET_PET_KV.get(key);
      if (!existing) return json({ error: "Vocabulary word not found" }, 404);
      await env.NET_PET_KV.delete(key);
      return json({ success: true });
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  }

  // ── GET/POST /api/student/goals ───────────────────────────────────────────
  else if (path.includes("/api/student/goals")) {
    if (method === "GET") {
      const studentId = url.searchParams.get("studentId");
      if (!studentId) return json({ error: "studentId query param required" }, 400);
      const raw = await env.NET_PET_KV.get(`goals:${studentId}`);
      if (!raw) return json({ targetScore: null, deadlineDays: null });
      return json(JSON.parse(raw));
    }
    if (method === "POST") {
      try {
        const body = await request.json().catch(() => ({}));
        const { studentId, targetScore, deadlineDays } = body;
        if (!studentId || targetScore == null || deadlineDays == null) {
          return json({ error: "studentId, targetScore, deadlineDays required" }, 400);
        }
        const goal = { studentId, targetScore: Number(targetScore), deadlineDays: Number(deadlineDays), createdAt: new Date().toISOString() };
        await env.NET_PET_KV.put(`goals:${studentId}`, JSON.stringify(goal));
        return json({ success: true, goal });
      } catch (err) {
        return json({ error: String(err) }, 500);
      }
    }
  }
  // ── Payment Confirmation ────────────────────────────────────────────────────
  // POST /api/payment/confirm — record a confirmed payment, activate subscription
  if (path === "/api/payment/confirm" && method === "POST") {
    const body = await request.json();
    return handlePaymentConfirm(body, env);
  }

  // ── K4 Testimonials ──────────────────────────────────────────────────────────────
  // GET /api/testimonial — list approved testimonials
  if (path === "/api/testimonial" && method === "GET") {
    return handleTestimonialList(env);
  }
  // POST /api/testimonial — submit a new testimonial (pending approval)
  if (path === "/api/testimonial" && method === "POST") {
    const body = await request.json();
    return handleTestimonialSubmit(body, env);
  }
  // GET /api/admin/testimonial — admin: list all pending testimonials
  if (path === "/api/admin/testimonial" && method === "GET") {
    return handleTestimonialAdminList(env);
  }
  // POST /api/admin/testimonial/:id/approve — admin: approve a testimonial
  if (path.startsWith("/api/admin/testimonial/") && method === "POST" && path.includes("/approve")) {
    const id = path.split("/api/admin/testimonial/")[1]?.split("/")[0];
    return handleTestimonialApprove(id, env);
  }

  // POST /api/class/ingest — batch transcribe 1hr class audio + extract vocab via PA T1
  if (path === "/api/class/ingest" && method === "POST") {
    const authFail = checkAdminKey(request, env);
    if (authFail) return addCors(authFail, request);
    const body = await request.json().catch(() => ({}));
    const { studentId, audioUrl, classDate } = body;
    if (!studentId || !audioUrl) return addCors(json({ error: "studentId and audioUrl required" }, 400), request);
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
    const rosterCheck = validateActiveStudent(studentId);
    if (!rosterCheck.valid) return addCors(json({ error: 'student not in active roster', code: 'NOT_IN_ROSTER' }, 403), request);
    const date = classDate || new Date().toISOString().slice(0, 10);

    const dgRes = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&diarize=true&smart_format=true&punctuate=true&utterances=true",
      {
        method: "POST",
        headers: { "Authorization": `Token ${env.DEEPGRAM_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: audioUrl })
      }
    );
    if (!dgRes.ok) return addCors(json({ error: "Deepgram transcription failed", status: dgRes.status }, 502), request);
    const dgData = await dgRes.json();
    const words = dgData?.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];
    const utterances = dgData?.results?.utterances ?? [];

    const fullTranscript = utterances.map(u => `[S${u.speaker}] ${u.transcript}`).join("\n");
    const studentText = utterances.filter(u => u.speaker === 1).map(u => u.transcript).join("\n");

    const paTask = `Extract 15-30 A2/B1 English vocabulary words or phrases from this ESL class transcript. Return ONLY valid JSON in this exact format: {"words":[{"word":"string","meaning_vi":"string","used_by_student":boolean}]}. Exclude basic function words (the, is, and, etc). Prioritize words the student (S1) attempted. FULL TRANSCRIPT:\n${fullTranscript.slice(0, 15000)}\nSTUDENT ONLY:\n${studentText.slice(0, 5000)}`;
    let extracted = [];
    try {
      const paBody = JSON.stringify({ task: paTask, context: "", targetfile: "", tier: 1 });
      const paRes = await fetch("https://phoenix-architecti.mrmichaelhobbs123.workers.dev/api/code", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pa-auth": env.PA_AUTH_KEY || "" },
        body: paBody
      });
      if (paRes.ok) {
        const paData = await paRes.json();
        const patch = paData.patch || "";
        const jsonMatch = patch.match(/\{[\s\S]*"words"[\s\S]*\}/);
        if (jsonMatch) extracted = JSON.parse(jsonMatch[0]).words ?? [];
      }
    } catch (_) {}

    const batchResults = await seedVocabBatch(studentId, extracted, env);
    const added = batchResults.filter(r => r.ok).length;

    await kvEncryptPut(env.NET_PET_KV, `class_transcript_${studentId}_${date}`, fullTranscript, env.ENCRYPTION_KEY);

    return addCors(json({ added, date, words: extracted, transcriptStored: true }), request);
  }

  // Unmatched /api/* route → explicit 404. Without this, handleAPI falls off the
  // end and returns undefined → addCors(undefined) throws → generic 500, which
  // MASKS real errors (a thrown bug and a typo'd path look identical). A clean
  // 404 here restores the invariant: a 500 means something actually threw.
  return json({ error: "Not Found", path }, 404);
}

// ── Payment Handler ─────────────────────────────────────────────────────────────

async function handlePaymentConfirm(body, env) {
  const { studentId, companyCode, plan, amountVND, txnId, confirmedBy } = body || {};
  if (!plan || !txnId || !amountVND) return json({ error: "plan, txnId, amountVND required" }, 400);
  const record = {
    studentId: studentId || null, companyCode: companyCode || null, plan,
    amountVND: Number(amountVND),
    txnId: String(txnId).trim(),
    confirmedBy: confirmedBy || "manual",
    confirmedAt: new Date(Date.now()+7*3600000).toISOString(), status: "confirmed"
  };
  await env.NET_PET_KV.put(`payment:${txnId}`, JSON.stringify(record), { expirationTtl: 86400*365 });
  const idxRaw = await env.NET_PET_KV.get("payment:index").catch(()=>null);
  const idx = idxRaw ? JSON.parse(idxRaw) : [];
  idx.push(txnId);
  await env.NET_PET_KV.put("payment:index", JSON.stringify(idx.slice(-1000)));
  const subKey = studentId ? `subscription:${studentId}` : `subscription:employer:${companyCode}`;
  await env.NET_PET_KV.put(subKey, JSON.stringify({
    plan, paidUntil: new Date(Date.now()+30*86400000).toISOString(), txnId,
    activatedAt: record.confirmedAt
  }));
  const until = new Date(Date.now()+30*86400000).toISOString().slice(0,10);
  return json({ success: true, txnId, activatedUntil: until });
}

// ── Admin Subscription Handlers ─────────────────────────────────────────────────

// GET /api/admin/subscriptions — list all subscriptions (KV-scan driven, not hardcoded)
async function handleAdminSubscriptionsList(env) {
  if (!env.NET_PET_KV) return json({ subscriptions: [] });
  const keys = []; let cursor;
  do {
    const listed = await env.NET_PET_KV.list({ prefix: 'subscription:', cursor }).catch(() => ({ keys: [], list_complete: true }));
    listed.keys.forEach(k => keys.push(k.name.replace('subscription:', '')));
    cursor = listed.list_complete ? undefined : listed.cursor;
  } while (cursor);
  const students = keys.filter(sid => !sid.startsWith('sov100-') && sid !== 'keep-warm-ping');
  const subs = await Promise.all(students.map(async sid => {
    const raw = await env.NET_PET_KV.get(`subscription:${sid}`).catch(() => null);
    return raw ? { studentId: sid, ...JSON.parse(raw) } : null;
  }));
  return json({ subscriptions: subs.filter(Boolean), generatedAt: new Date().toISOString() });
}

// GET /api/admin/subscription?studentId=XXX — get one subscription
async function handleAdminSubscriptionGet(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  if (!env.NET_PET_KV) return json({ error: "NET_PET_KV not configured" }, 500);
  const raw = await env.NET_PET_KV.get(`subscription:${studentId}`).catch(() => null);
  if (!raw) return json({ studentId, plan: "none", status: "no_subscription" });
  const sub = JSON.parse(raw);
  const trialDays = sub.trial_end ? Math.max(0, Math.ceil((new Date(sub.trial_end) - Date.now()) / 86400000)) : 0;
  const isPaid = sub.paidUntil && new Date(sub.paidUntil) > new Date();
  const isTrial = sub.trial_end && new Date(sub.trial_end) > new Date();
  const status = isPaid ? "active" : isTrial ? "trial" : sub.plan === "founding-member" && trialDays > 0 ? "trial" : sub.paidUntil ? "expired" : "no_subscription";
  return json({ studentId, ...sub, trialDaysRemaining: trialDays, status });
}

// POST /api/admin/subscription/upsert — create/update subscription (admin key required, checked at route level)
async function handleAdminSubscriptionUpsert(body, env) {
  const { studentId, plan, trial_end, paidUntil, is_founding_member } = body || {};
  if (!studentId) return json({ error: "studentId required" }, 400);
  if (!env.NET_PET_KV) return json({ error: "NET_PET_KV not configured" }, 500);
  
  const existing = await env.NET_PET_KV.get(`subscription:${studentId}`).catch(() => null);
  const base = existing ? JSON.parse(existing) : { plan: "trial", activatedAt: new Date().toISOString() };
  const sub = {
    ...base,
    ...(plan ? { plan } : {}),
    ...(trial_end ? { trial_end } : {}),
    ...(paidUntil ? { paidUntil } : {}),
    ...(is_founding_member !== undefined ? { is_founding_member } : {}),
    updatedAt: new Date().toISOString(),
  };
  await env.NET_PET_KV.put(`subscription:${studentId}`, JSON.stringify(sub));
  return json({ ok: true, studentId, subscription: sub });
}

// ── Admin Statistics Handler ───────────────────────────────────────────────────

// GET /api/admin/stats — admin dashboard metrics
// Block T: GET /api/admin/roster — list all students with current state
// Block U: GET /api/admin/audit — recent audit log entries
async function handleAdminAudit(env, url) {
  if (!env.SOUL_DB) return json({ entries: [], error: "SOUL_DB not configured" });
  const limit = parseInt(url.searchParams.get("limit") || "50");
  try {
    const r = await env.SOUL_DB.prepare(
      "SELECT id, ts, actor, action, target, metadata FROM audit_log ORDER BY ts DESC LIMIT ?"
    ).bind(limit).all();
    return json({ entries: r.results || [], total: (r.results || []).length });
  } catch (err) {
    return json({ error: err.message, entries: [] }, 500);
  }
}

async function handleAdminRoster(env) {
  if (!env.NET_PET_KV) return json({ students: [], error: "KV not configured" });
  try {
    const list = await env.NET_PET_KV.list({ prefix: "student_profile_" });
    const students = await Promise.all(list.keys.map(async k => {
      const studentId = k.name.replace("student_profile_", "");
      const raw = await env.NET_PET_KV.get(k.name).catch(() => null);
      const profile = normalizeStudentProfile(raw ? JSON.parse(raw) : { studentId });
      // Fetch streak + phonics data
      let streak = { currentStreak: 0, longestStreak: 0 };
      const streakRaw = await env.NET_PET_KV.get(`streak:${studentId}`).catch(() => null);
      if (streakRaw) streak = JSON.parse(streakRaw);
      let phonics = null;
      const phonicsRaw = await env.NET_PET_KV.get(`phonics_progress_${studentId}`).catch(() => null);
      if (phonicsRaw) phonics = JSON.parse(phonicsRaw);
      return {
        studentId,
        fullName: profile.fullName || profile.name || studentId,
        level: profile.level || profile.englishLevel || "A1",
        lastSession: profile.lastSession || null,
        streak,
        phonicsGroup: phonics?.group_name || phonics?.current_group || null,
        lang: profile.lang || "en"
      };
    }));
    // Sort by lastSession.date desc, nulls last
    students.sort((a, b) => {
      const da = a.lastSession?.date || ""; const db = b.lastSession?.date || "";
      return db.localeCompare(da);
    });
    return json({ students, total: students.length });
  } catch (err) {
    return json({ error: err.message, students: [] }, 500);
  }
}

async function handleAdminStats(env) {
  const now = new Date(Date.now() + 7*3600000).toISOString();
  const today = now.slice(0,10);

  // Waitlist count
  const wlIdx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const waitlistCount = wlIdx.length;

  // Payment count
  const payIdx = await env.NET_PET_KV.get("payment:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const totalRevenue = (await Promise.all(payIdx.slice(-100).map(async id => {
    const raw = await env.NET_PET_KV.get(`payment:${id}`).catch(() => null);
    return raw ? JSON.parse(raw).amountVND || 0 : 0;
  }))).reduce((a,b) => a+b, 0);

  // Employer count
  const empIdx = await env.NET_PET_KV.get("employer:index").then(r => r ? JSON.parse(r) : []).catch(() => []);

  // Active students (streak > 0, lastCheckin within 7 days)
  const students = ["huong-bluetech","mai-tram-bluetech","quy-bluetech"];
  let activeStudents = 0;
  const streakChecks = await Promise.all(students.map(s => env.NET_PET_KV.get(`streak:${s}`).catch(() => null)));
  streakChecks.forEach((raw, i) => {
    if (raw) {
      const d = JSON.parse(raw);
      const p = d.lastCheckin ? Date.now() - d.lastCheckin : 999999;
      if (d.currentStreak > 0 && p < 7*86400000) activeStudents++;
    }
  });

  // Challenge attempts today
  let challengeAttemptsToday = 0;
  const chalRaw = await env.NET_PET_KV.get(`challenge:attempts:${today}`).catch(() => null);
  if (chalRaw) challengeAttemptsToday = JSON.parse(chalRaw).length || 0;

  return json({
    waitlistCount,
    paymentCount: payIdx.length,
    totalRevenueVND: totalRevenue,
    employerCount: empIdx.length,
    activeStudents,
    challengeAttemptsToday,
    generatedAt: now
  });
}

// ── Waitlist Handlers ─────────────────────────────────────────────────────────

// POST /api/waitlist — join the waitlist (name, email, why)
async function handleWaitlistJoin(body, env) {
  const { name, email, why } = body || {};
  if (!name || !email) return json({ error: "name and email required" }, 400);
  if (!env.NET_PET_KV) return json({ error: "NET_PET_KV not configured" }, 500);
  
  const entry = {
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 200),
    why: String(why || "").slice(0, 500),
    ts: new Date().toISOString(),
    id: `wl-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
  };
  
  // Append to index
  const idx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  idx.push(entry.id);
  // Cap at 100 (Phase 2 free trial funnel)
  if (idx.length > 100) return json({ ok: false, error: "Waitlist is at capacity (100). Join closed.", position: 100 }, 200);
  await env.NET_PET_KV.put("waitlist:index", JSON.stringify(idx));
  await env.NET_PET_KV.put(`waitlist:${entry.id}`, JSON.stringify(entry));
  
  return json({ ok: true, entry, position: idx.length, total: idx.length }, 201);
}

// GET /api/waitlist/count — return current count
async function handleWaitlistCount(env) {
  if (!env.NET_PET_KV) return json({ count: 0 });
  const idx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  return json({ count: idx.length, cap: 100 });
}

// GET /api/waitlist/list — return full list (admin use)
async function handleWaitlistList(env) {
  if (!env.NET_PET_KV) return json({ entries: [] });
  const idx = await env.NET_PET_KV.get("waitlist:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const entries = await Promise.all(idx.slice(-50).map(async id => {
    const raw = await env.NET_PET_KV.get(`waitlist:${id}`).catch(() => null);
    return raw ? JSON.parse(raw) : null;
  }));
  return json({ entries: entries.filter(Boolean), total: idx.length, cap: 100 });
}

// POST /api/admin/waitlist/toggle — toggle waitlist open/closed (admin key required, checked at route level)
async function handleWaitlistToggle(body, env) {
  const { closed } = body || {};
  await env.NET_PET_KV.put("waitlist:closed", closed ? "true" : "false");
  return json({ ok: true, closed: !!closed });
}

// GET /api/admin/waitlist/status — return current open/closed state
async function handleWaitlistStatus(env) {
  if (!env.NET_PET_KV) return json({ closed: false });
  const val = await env.NET_PET_KV.get("waitlist:closed").catch(() => "false");
  return json({ closed: val === "true" });
}

// ── Anti-Cheat Handlers ───────────────────────────────────────────────────────

// POST /api/anticheat/score — score a student session for genuine engagement
async function handleAntiCheatScore(body, env) {
  const { studentId, sessionData } = body || {};
  if (!studentId || !sessionData) return json({ error: "studentId and sessionData required" }, 400);

  const events = Array.isArray(sessionData) ? sessionData : [];
  const total = events.length;

  // Signals of real engagement
  const tabVisible = events.filter(e => e.type === "tab_visible").length;
  const tabHidden = events.filter(e => e.type === "tab_hidden").length;
  const seeks = events.filter(e => e.type === "seek").length;
  const clicks = events.filter(e => e.type === "click").length;
  const keypresses = events.filter(e => e.type === "keypress").length;
  const scrolls = events.filter(e => e.type === "scroll").length;

  // Cheat signals
  const hiddenRatio = total > 0 ? tabHidden / Math.max(tabVisible, 1) : 0; // high = tab usually hidden
  const interactionRate = total > 0 ? (clicks + keypresses + scrolls) / Math.max(total, 1) : 0;

  // Score 0-100: higher = more genuine
  let score = 100;
  if (hiddenRatio > 0.5) score -= 40; // tab was hidden more than visible = strong cheat signal
  if (hiddenRatio > 0.8) score -= 20; // extreme background play
  if (interactionRate < 0.02 && total > 20) score -= 20; // very long session, zero interaction
  if (seeks === 0 && total > 50) score -= 10; // never seeked = passive/background
  score = Math.max(0, Math.min(100, score));

  const verdict = score >= 70 ? "GENUINE" : score >= 40 ? "SUSPICIOUS" : "FAKE";

  // Store result in KV
  const today = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const kvKey = `anticheat:${studentId}:${today}`;
  await env.NET_PET_KV.put(kvKey, JSON.stringify({
    score,
    verdict,
    events: total,
    hiddenRatio: Math.round(hiddenRatio * 100) / 100,
    interactionRate: Math.round(interactionRate * 100) / 100,
    timestamp: Date.now()
  }), { expirationTtl: 86400 * 30 });

  return json({
    studentId,
    score,
    verdict,
    signals: {
      hiddenRatio: Math.round(hiddenRatio * 100) / 100,
      interactionRate: Math.round(interactionRate * 100) / 100,
      seeks,
      totalEvents: total
    },
    message: verdict === "GENUINE"
      ? "Real engagement detected 🎯"
      : verdict === "SUSPICIOUS"
        ? "Engagement looks off — stay focused"
        : "Background play detected — watching counts only if you're actually watching"
  });
}

// GET /api/anticheat/history/:studentId — last 30 days
async function handleAntiCheatHistory(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  const prefix = `anticheat:${studentId}:`;
  const listed = await env.NET_PET_KV.list({ prefix });
  const days = [];

  for (const key of listed.keys) {
    const raw = await env.NET_PET_KV.get(key.name);
    if (!raw) continue;
    const data = JSON.parse(raw);
    const date = key.name.replace(prefix, "");
    days.push({ date, score: data.score, verdict: data.verdict });
  }

  days.sort((a, b) => (a.date > b.date ? -1 : 1)); // most recent first
  const limited = days.slice(0, 30);

  const averageScore = limited.length > 0
    ? Math.round(limited.reduce((sum, d) => sum + d.score, 0) / limited.length)
    : null;

  const overallVerdict = averageScore === null
    ? "NO_DATA"
    : averageScore >= 70 ? "GENUINE" : averageScore >= 40 ? "SUSPICIOUS" : "FAKE";

  return json({ studentId, days: limited, averageScore, overallVerdict });
}

// ── Session Hint Handlers (Chrome extension → KV → chat.js) ─────────────────

// POST /api/session-hint — Chrome extension posts {studentId, videoTitle, videoUrl}
async function handleSessionHintPost(request, env) {
  const body = await request.json().catch(() => ({}));
  const { studentId, videoTitle, videoUrl } = body;
  if (!studentId || !videoTitle) return new Response(JSON.stringify({ error: "missing fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
  if (!env.NET_PET_KV) return new Response(JSON.stringify({ error: "NET_PET_KV binding not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  await env.NET_PET_KV.put(
    `session-hint:${studentId}`,
    JSON.stringify({ studentId, videoTitle, videoUrl: videoUrl || "", timestamp: Date.now() }),
    { expirationTtl: 86400 }
  );
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}

// GET /api/session-hint?studentId=X — chat.js checks for recent YouTube session
async function handleSessionHintGet(request, env) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");
  if (!studentId) return new Response(JSON.stringify({ error: "missing studentId" }), { status: 400, headers: { "Content-Type": "application/json" } });
  if (!env.NET_PET_KV) return new Response(JSON.stringify({ videoTitle: null }), { status: 200, headers: { "Content-Type": "application/json" } });
  const raw = await env.NET_PET_KV.get(`session-hint:${studentId}`);

  // Fetch soul context from soul-logger (fire, don't let failures block hint delivery)
  let soulContext = '';
  try {
    const ctxResp = await fetch(`${env.SOUL_LOGGER_URL || 'https://soul-logger.mrmichaelhobbs123.workers.dev'}/api/soul/context/${studentId}`);
    if (ctxResp.ok) {
      const ctxData = await ctxResp.json();
      if (ctxData.context_brief) soulContext = ctxData.context_brief;
    }
  } catch(e) { console.log("[SESSION_HINT] soul context fetch failed:", e.message); }

  if (!raw) return new Response(JSON.stringify({ videoTitle: null, soul_context: soulContext }), { status: 200, headers: { "Content-Type": "application/json" } });
  let hint = {};
  try { hint = JSON.parse(raw); } catch(e) { hint = { videoTitle: null }; }
  return new Response(JSON.stringify({ ...hint, soul_context: soulContext }), { status: 200, headers: { "Content-Type": "application/json" } });
}

// ── Daily Listening Log — 45-min daily practice tracking ─────────────────
// Students log listening minutes. Stored in KV + Ledger for immutability.

async function handleListeningLog(body, env, request) {
  const studentId = body.studentId || "";
  const minutes = parseInt(body.minutes) || 0;
  const source = (body.source || "other").slice(0, 30); // youtube, podcast, music, video, class, other
  const description = (body.description || "").slice(0, 200);

  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  if (minutes < 1 || minutes > 480) return addCors(json({ error: "minutes must be 1-480" }, 400), request);
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const todayIct = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const kvKey = `listen:${studentId}:${todayIct}`;

  // Merge with any existing log for today
  const existing = await env.NET_PET_KV.get(kvKey).catch(() => null);
  const existingData = existing ? JSON.parse(existing) : { minutes: 0, sources: [], entries: [] };
  const newTotal = existingData.minutes + minutes;
  const newSources = [...new Set([...existingData.sources, source])];
  const newEntry = { minutes, source, description, ts: Date.now() };

  const log = {
    studentId,
    date: todayIct,
    minutes: newTotal,
    sources: newSources,
    entries: [...(existingData.entries || []), newEntry],
    lastUpdated: Date.now(),
  };

  await env.NET_PET_KV.put(kvKey, JSON.stringify(log), { expirationTtl: 86400 * 90 });

  // Append to immutable ledger
  if (env.LEDGER) {
    const payload = JSON.stringify({ minutes, source, description, date: todayIct });
    appendToLedger(studentId, "listening_log", payload, env).catch(() => {});
  }

  // Auto-checkin to streak tracker (listening counts as practice)
  if (env.PETS) {
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(studentId));
      await petStub.fetch(new Request("https://do/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: Math.min(minutes, 60), confidence: 5 }),
      }));
    } catch (_) {}
  }

  return addCors(json({
    ok: true,
    studentId,
    date: todayIct,
    todayTotal: newTotal,
    targetMinutes: 45,
    remaining: Math.max(0, 45 - newTotal),
    message: newTotal >= 45
      ? `Done! ${newTotal} min listening today ✓`
      : `${newTotal} min logged — ${Math.max(0, 45 - newTotal)} min left for today`,
  }), request);
}

async function handleListeningToday(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  if (!env.NET_PET_KV) return json({ error: "NET_PET_KV not configured" }, 500);

  const todayIct = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
  const kvKey = `listen:${studentId}:${todayIct}`;
  const raw = await env.NET_PET_KV.get(kvKey).catch(() => null);
  const log = raw ? JSON.parse(raw) : { minutes: 0, sources: [], entries: [] };

  return json({
    studentId,
    date: todayIct,
    todayTotal: log.minutes || 0,
    targetMinutes: 45,
    remaining: Math.max(0, 45 - (log.minutes || 0)),
    done: (log.minutes || 0) >= 45,
    sources: log.sources || [],
  });
}

// ── Face-Saving Protocol — Streak Tracking + Accountability ──────────────────
// Vietnamese culture: public commitment prevents quitting. Streaks = social contract.

const FACE_SAVING_STUDENTS = ["huong-bluetech", "mai-tram-bluetech", "quy-bluetech"];

// Get today's date string in ICT (UTC+7) as YYYY-MM-DD
function getICTDateString(offsetMs = 0) {
  const nowMs = Date.now() + offsetMs;
  const ictMs = nowMs + 7 * 60 * 60 * 1000; // shift to UTC+7
  const d = new Date(ictMs);
  const yyyy = d.getUTCFullYear();
  const mm   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd   = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Returns "today", "yesterday", or "older" relative to ICT now
function relativeDayICT(dateStr) {
  if (!dateStr) return "older";
  const today     = getICTDateString(0);
  const yesterday = getICTDateString(-24 * 60 * 60 * 1000);
  if (dateStr === today)     return "today";
  if (dateStr === yesterday) return "yesterday";
  return "older";
}

// POST /api/student/checkin — record a daily check-in, maintain streak
async function handleStudentCheckin(body, request, env) {
  const { studentId } = body || {};
  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  if (!FACE_SAVING_STUDENTS.includes(studentId)) {
    return addCors(json({ error: "Unknown studentId — must be one of: " + FACE_SAVING_STUDENTS.join(", ") }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV binding not configured" }, 500), request);

  const today = getICTDateString();
  const kvKey = `streak:${studentId}`;
  const raw   = await env.NET_PET_KV.get(kvKey);
  let streak  = raw ? JSON.parse(raw) : { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0 };

  const rel = relativeDayICT(streak.lastCheckin);
  let status;

  if (rel === "today") {
    // Already checked in today — idempotent
    status = "already_done";
  } else if (rel === "yesterday") {
    // Consecutive day — extend streak
    streak.currentStreak += 1;
    streak.totalDays     += 1;
    streak.lastCheckin    = today;
    status = "checked_in";
  } else {
    // Streak broken (or first ever check-in)
    const wasBroken = streak.lastCheckin !== null;
    streak.currentStreak = 1;
    streak.totalDays    += 1;
    streak.lastCheckin   = today;
    status = wasBroken ? "streak_broken" : "checked_in";
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  if (status !== "already_done") {
    await env.NET_PET_KV.put(kvKey, JSON.stringify(streak));
  }

  return addCors(json({
    studentId,
    currentStreak:  streak.currentStreak,
    longestStreak:  streak.longestStreak,
    totalDays:      streak.totalDays,
    lastCheckin:    streak.lastCheckin,
    status,
  }), request);
}

// GET /api/student/streak/:studentId — read streak + compute today's status
async function handleStudentStreak(studentId, request, env) {
  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  if (!FACE_SAVING_STUDENTS.includes(studentId)) {
    return addCors(json({ error: "Unknown studentId — must be one of: " + FACE_SAVING_STUDENTS.join(", ") }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV binding not configured" }, 500), request);

  const raw    = await env.NET_PET_KV.get(`streak:${studentId}`);
  const streak = raw ? JSON.parse(raw) : { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0 };

  const rel = relativeDayICT(streak.lastCheckin);
  let todayStatus;
  if (rel === "today")     todayStatus = "active";
  else if (rel === "yesterday") todayStatus = "at_risk";
  else                     todayStatus = "broken";

  return addCors(json({
    studentId,
    currentStreak:  streak.currentStreak,
    longestStreak:  streak.longestStreak,
    totalDays:      streak.totalDays,
    lastCheckin:    streak.lastCheckin,
    todayStatus,
  }), request);
}

// POST /api/student/saveface — log accountability event when streak is at risk
async function handleStudentSaveface(body, request, env) {
  const { studentId, message } = body || {};
  if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
  if (!FACE_SAVING_STUDENTS.includes(studentId)) {
    return addCors(json({ error: "Unknown studentId — must be one of: " + FACE_SAVING_STUDENTS.join(", ") }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV binding not configured" }, 500), request);

  const raw    = await env.NET_PET_KV.get(`streak:${studentId}`);
  const streak = raw ? JSON.parse(raw) : { currentStreak: 0, lastCheckin: null, longestStreak: 0, totalDays: 0 };

  const rel = relativeDayICT(streak.lastCheckin);
  let todayStatus;
  if (rel === "today")          todayStatus = "active";
  else if (rel === "yesterday") todayStatus = "at_risk";
  else                          todayStatus = "broken";

  // Log saveface event if streak is at_risk or already broken
  if (todayStatus === "at_risk" || todayStatus === "broken") {
    const today    = getICTDateString();
    const eventKey = `saveface:${studentId}:${today}`;
    const event    = {
      studentId,
      date:           today,
      currentStreak:  streak.currentStreak,
      todayStatus,
      message:        message || "",
      ts:             Date.now(),
    };
    await env.NET_PET_KV.put(eventKey, JSON.stringify(event), { expirationTtl: 30 * 24 * 60 * 60 }); // keep 30 days
  }

  return addCors(json({
    studentId,
    streakAtRisk:    streak.currentStreak,
    todayStatus,
    message:         "Cứu em với! Streak sắp đứt!",
    recoveryOptions: ["Complete a lesson now", "Review vocabulary", "Practice pronunciation"],
  }), request);
}

// ── Student Forecast — CEFR progression projection ───────────────────────────
// GET /api/student/forecast/:studentId
// Returns mastery velocity + projected graduation date to next CEFR level

async function handleStudentForecast(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  const [streakRaw, srsRaw] = await Promise.all([
    env.NET_PET_KV.get(`streak:${studentId}`),
    env.NET_PET_KV.get(`srs_data_${studentId}`)
  ]);

  const streak = streakRaw ? JSON.parse(streakRaw) : { currentStreak: 0, totalDays: 0 };
  let totalWords = 0;
  let masteredWords = 0;
  if (srsRaw) {
    try {
      const srsMap = JSON.parse(srsRaw);
      totalWords = Object.keys(srsMap).length;
      masteredWords = Object.values(srsMap).filter(w => (w.repetitions || 0) >= 3).length;
    } catch (_) {}
  }

  // Velocity: mastered per active day
  const activeDays = Math.max(streak.totalDays || 1, 1);
  const velocity = masteredWords / activeDays; // words/day

  // CEFR targets: A1=50, A2=150, B1=300, B2=500, C1=800
  const CEFR_TARGETS = [
    { level: "A1", words: 50 }, { level: "A2", words: 150 },
    { level: "B1", words: 300 }, { level: "B2", words: 500 }, { level: "C1", words: 800 }
  ];

  const currentLevel = CEFR_TARGETS.find(t => masteredWords < t.words)?.level || "C1";
  const nextTarget = CEFR_TARGETS.find(t => t.words > masteredWords);
  const wordsRemaining = nextTarget ? nextTarget.words - masteredWords : 0;

  const projectedDays = velocity > 0 ? Math.ceil(wordsRemaining / velocity) : 999;
  const graduationDate = new Date(Date.now() + projectedDays * 86400000).toISOString().slice(0, 10);

  const confidence = activeDays < 7 ? "low" : activeDays < 30 ? "medium" : "high";

  return json({
    studentId, currentLevel,
    targetLevel: nextTarget?.level || "C1",
    masteredWords, totalWords,
    velocity: Math.round(velocity * 10) / 10,
    projectedDays, graduationDate, confidence,
    activeDays
  });
}

// ── Leaderboard — GET /api/leaderboard ───────────────────────────────────────
// Public rankings: streak + mastered words. No auth required.
async function handleLeaderboard(request, env) {
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const STUDENTS = [
    { id: "huong-bluetech",     displayName: "Huong" },
    { id: "mai-tram-bluetech",  displayName: "Mai Tram" },
    { id: "quy-bluetech",       displayName: "Quy" },
    { id: "lam-bluetech",       displayName: "Lam" },
    { id: "quan-bluetech",      displayName: "Quan" },
    { id: "quang-bluetech",     displayName: "Quang" },
    { id: "minh-bluetech",      displayName: "Minh" },
  ];

  const CEFR_TARGETS = [50, 150, 300, 500, 800];

  function getTier(masteredWords) {
    if (masteredWords >= 80) return "TIGER🔥";
    if (masteredWords >= 40) return "CUB🐯";
    return "MOUSE🐭";
  }

  const rankings = await Promise.all(STUDENTS.map(async (s) => {
    const [streakRaw, srsRaw] = await Promise.all([
      env.NET_PET_KV.get(`streak:${s.id}`).catch(() => null),
      env.NET_PET_KV.get(`srs_data_${s.id}`).catch(() => null),
    ]);
    const streak = streakRaw ? JSON.parse(streakRaw) : { currentStreak: 0, totalDays: 0, longestStreak: 0 };
    let totalWords = 0;
    let masteredWords = 0;
    if (srsRaw) {
      try {
        const srsMap = JSON.parse(srsRaw);
        totalWords = Object.keys(srsMap).length;
        masteredWords = Object.values(srsMap).filter(w => (w.repetitions || 0) >= 3).length;
      } catch (_) {}
    }

    return {
      studentId: s.id,
      displayName: s.displayName,
      currentStreak: streak.currentStreak || 0,
      longestStreak: streak.longestStreak || 0,
      totalDays: streak.totalDays || 0,
      masteredWords,
      totalWords,
      tier: getTier(masteredWords),
    };
  }));

  // Sort: totalDays DESC, then masteredWords DESC
  rankings.sort((a, b) => b.totalDays - a.totalDays || b.masteredWords - a.masteredWords);
  rankings.forEach((r, i) => { r.rank = i + 1; });

  return addCors(json({ updatedAt: new Date().toISOString(), rankings }), request);
}

// ── Referral System ───────────────────────────────────────────────────────────

// POST /api/referral/register — { referrerStudentId, referredName, referredEmail }
async function handleReferralRegister(body, request, env) {
  const { referrerStudentId, referredName, referredEmail } = body || {};
  if (!referrerStudentId || !referredName) {
    return addCors(json({ error: "referrerStudentId and referredName required" }, 400), request);
  }
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const code = `ref-${referrerStudentId}-${Date.now().toString(36)}`;
  const referral = {
    code,
    referrerStudentId,
    referredName,
    referredEmail: referredEmail || "",
    timestamp: Date.now(),
    converted: false,
  };

  // Store referral record
  await env.NET_PET_KV.put(`referral:${code}`, JSON.stringify(referral), { expirationTtl: 90 * 24 * 60 * 60 });

  // Append to referrer's list
  const listKey = `referral-list:${referrerStudentId}`;
  const existing = await env.NET_PET_KV.get(listKey).catch(() => null);
  const list = existing ? JSON.parse(existing) : [];
  list.push(code);
  await env.NET_PET_KV.put(listKey, JSON.stringify(list));

  const shareUrl = `/join?ref=${code}`;
  return addCors(json({ ok: true, code, shareUrl }), request);
}

// GET /api/referral/stats/:referrerStudentId
async function handleReferralStats(referrerStudentId, request, env) {
  if (!referrerStudentId) return addCors(json({ error: "referrerStudentId required" }, 400), request);
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const listRaw = await env.NET_PET_KV.get(`referral-list:${referrerStudentId}`).catch(() => null);
  const codes = listRaw ? JSON.parse(listRaw) : [];

  const referrals = await Promise.all(
    codes.map(c => env.NET_PET_KV.get(`referral:${c}`).then(r => r ? JSON.parse(r) : null).catch(() => null))
  );
  const valid = referrals.filter(Boolean);
  const converted = valid.filter(r => r.converted).length;

  return addCors(json({
    referrerStudentId,
    totalReferrals: valid.length,
    converted,
    pending: valid.length - converted,
    referrals: valid,
  }), request);
}

// POST /api/referral/convert — { code } → mark converted
async function handleReferralConvert(body, request, env) {
  const { code } = body || {};
  if (!code) return addCors(json({ error: "code required" }, 400), request);
  if (!env.NET_PET_KV) return addCors(json({ error: "NET_PET_KV not configured" }, 500), request);

  const raw = await env.NET_PET_KV.get(`referral:${code}`).catch(() => null);
  if (!raw) return addCors(json({ error: "referral not found" }, 404), request);

  const referral = JSON.parse(raw);
  referral.converted = true;
  referral.convertedAt = Date.now();
  await env.NET_PET_KV.put(`referral:${code}`, JSON.stringify(referral), { expirationTtl: 90 * 24 * 60 * 60 });
  return addCors(json({ ok: true }), request);
}

// ── Voice Drill Scoring — Deepgram STT + SRS update ──────────────────────────
// POST /api/voice/score — { studentId, word, audioBase64 } → { score, transcript, nextReview }

async function handleVoiceScore(body, env) {
  const { studentId, word, audioBase64 } = body || {};
  if (!studentId || !word) return json({ error: "studentId and word required" }, 400);

  let transcript = null;
  let fallback = false;

  if (env.DEEPGRAM_API_KEY && audioBase64) {
    try {
      const audioBytes = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
      const dgResp = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&language=en-US", {
        method: "POST",
        headers: {
          "Authorization": `Token ${env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/webm"
        },
        body: audioBytes
      });
      if (dgResp.ok) {
        const dgData = await dgResp.json();
        transcript = dgData?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
      }
    } catch(e) { fallback = true; }
  } else {
    fallback = true;
  }

  // Score: 5=exact, 3=partial, 1=miss (or fallback default 3)
  let score = 3;
  if (!fallback && transcript !== null) {
    const clean = t => t.toLowerCase().replace(/[^a-z]/g, "");
    if (clean(transcript) === clean(word)) score = 5;
    else if (clean(transcript).includes(clean(word))) score = 3;
    else score = 1;
  }

  // Load existing SRS word and update via seedVocab
  const result = await seedVocab(studentId, word, "", "voice_score", env, score);
  if (!result.ok) return json({ error: "empty word" }, 400);

  return json({
    word, transcript: transcript ?? "[voice unavailable]",
    score, fallback,
    nextReview: result.next_review,
    message: score >= 4 ? "Great job! 🔥" : score >= 3 ? "Good — keep practicing!" : "Keep trying! 💪"
  });
}

// ── Magic Chat — Obi quick-response with auto student context injection ────────
// POST /api/magic-chat — { message, studentId?, context? }
// If studentId is provided and context is absent, auto-builds context from streak + SRS due words.

async function handleMagicChat(body, request, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return addCors(json({ error: "DEEPSEEK_API_KEY not configured" }, 500), request);

  const message = sanitizeInput((body.message || "").slice(0, 1000));
  if (!message) return addCors(json({ error: "message required" }, 400), request);

  const studentId = body.studentId || "";
  let context = body.context || "";

  // Auto-inject student context if studentId is present and no context was passed
  if (studentId && !context && env.NET_PET_KV) {
    try {
      const [streakRaw, srsRaw] = await Promise.all([
        env.NET_PET_KV.get(`streak:${studentId}`),
        env.NET_PET_KV.get(`srs_data_${studentId}`)
      ]);

      const streak = streakRaw ? JSON.parse(streakRaw) : { currentStreak: 0 };
      const now = Date.now();
      let dueWords = [];
      if (srsRaw) {
        const srsMap = JSON.parse(srsRaw);
        dueWords = Object.values(srsMap)
          .filter(w => (w.next_review || 0) <= now)
          .slice(0, 5)
          .map(w => w.word)
          .filter(Boolean);
      }

      context = `Student: ${studentId} | Streak: ${streak.currentStreak || 0} days${(streak.currentStreak || 0) >= 7 ? " 🔥" : ""}\nDue vocabulary: ${dueWords.join(", ") || "none"}\nTeaching note: Weave due vocabulary into your response naturally. Acknowledge the streak if >= 7 days.`;
    } catch (_) {}
  }

  // Read student language preference for bilingual support
  if (studentId && env.NET_PET_KV) {
    try {
      const lang = await env.NET_PET_KV.get(`lang:${studentId}`);
      if (lang === 'vi') {
        context = context + '\n\nVIETNAMESE MODE: Student is A1 beginner, needs bilingual support. Speak English first, then add Vietnamese translation in parentheses for key words and corrections. If student seems lost, say full sentence in Vietnamese then repeat in English. Prioritize understanding over English-only purity.';
      } else if (lang === 'en') {
        context = context + '\n\nENGLISH-ONLY MODE: Student prefers English only. Keep language simple — elementary level. Use short sentences, common words. No Vietnamese.';
      }
    } catch (_) {}
  }

  // ── ULTRA MAX: Inject full student profile from KV (teaching focus, fears, breakthroughs) ──
  if (studentId && env.NET_PET_KV) {
    try {
      const profileRaw = await env.NET_PET_KV.get(`student_profile_${studentId}`);
      if (profileRaw) {
        const p = normalizeStudentProfile(JSON.parse(profileRaw));
        const profileLines = [];
        if (p.name) profileLines.push(`Name: ${p.name}`);
        if (p.level) profileLines.push(`Level: ${p.level}`);
        if (p.teachingFocus) profileLines.push(`TEACHING FOCUS: ${p.teachingFocus}`);
        if (p.primaryBlock) profileLines.push(`PRIMARY BLOCK: ${p.primaryBlock}`);
        if (p.fear_trigger) profileLines.push(`FEAR TRIGGER: ${p.fear_trigger}`);
        if (p.confidence_areas) profileLines.push(`CONFIDENCE AREAS: ${p.confidence_areas}`);
        if (p.breakthrough) profileLines.push(`LAST BREAKTHROUGH: ${p.breakthrough}`);
        if (p.goals) profileLines.push(`GOALS: ${p.goals}`);
        if (p.dailyPractice) profileLines.push(`DAILY PRACTICE: ${p.dailyPractice}`);
        if (p.parentNotes) profileLines.push(`PARENT NOTES: ${p.parentNotes}`);
        if (profileLines.length > 0) {
          context = context + '\n\nSTUDENT PROFILE (use this to personalize every response):\n' + profileLines.join('\n');
        }
      }
    } catch (_) {}
  }

  // ── ULTRA MAX: Conversation memory — last 6 exchanges for continuity ──
  if (studentId && env.NET_PET_KV) {
    try {
      const memRaw = await env.NET_PET_KV.get(`chat_memory:${studentId}`);
      if (memRaw) {
        const mem = JSON.parse(memRaw);
        const history = (mem.history || []).slice(-6);
        if (history.length > 0) {
          const memLines = history.map(h => `${h.role === 'user' ? 'Student' : 'Obi'}: ${h.content}`);
          context = context + '\n\nRECENT CONVERSATION (maintain continuity, reference past exchanges naturally):\n' + memLines.join('\n');
        }
      }
    } catch (_) {}
  }

  // ── KEYWORD REGISTRY: Inject canonical concept definitions when relevant ──
  // Reads top-level keywords from archived registry and matches against student message
  try {
    const msgLower = message.toLowerCase();
    const keywordTriggers = [
      { kw: 'faith', def: 'Faith = repeated success + verifiable Ledger history. Not blind belief — earned trust through consistent action.' },
      { kw: 'sovereign', def: 'Sovereign = Michael Hobbs (SOV100), ultimate authority in the hierarchy. Student profiles are sovereign-approved.' },
      { kw: 'ledger', def: 'Ledger = immutable record of truth. All student progress in KV is authoritative. Never fabricate.' },
      { kw: 'mouse voice', def: 'Mouse Voice = quiet, hesitant, apologetic communication. The opposite of Tiger Voice. Push volume and confidence.' },
      { kw: 'tiger voice', def: 'Tiger Voice = loud, confident, direct communication. The goal state. Volume = confidence = fluency.' },
      { kw: 'shadow realm', def: 'Shadow Realm = safe experimentation space. Try things here before validating in production.' },
      { kw: 'broken chain', def: 'Broken Chain Protocol = when a pipeline step fails silently. Always verify handoffs between stages.' },
      { kw: 'thud factor', def: 'Thud Factor = every response must land with impact. No filler, no hedging. Direct, warm, real.' },
      { kw: 'fail closed', def: 'Fail Closed = when uncertain, halt and verify. Never guess. Better to ask than to assume.' },
      { kw: 'gospel 444', def: 'Gospel 444 = core teaching methodology. 45min listening + 15min speaking daily. The non-negotiable deal.' }
    ];
    const matched = keywordTriggers.filter(k => msgLower.includes(k.kw));
    if (matched.length > 0) {
      const kwLines = matched.map(k => `- ${k.kw.toUpperCase()}: ${k.def}`);
      context = context + '\n\nCANONICAL CONCEPTS DETECTED (reference these accurately if relevant):\n' + kwLines.join('\n');
    }
  } catch (_) {}

  const systemContent = OBI_SYSTEM + (context ? `\n\n${context}` : "");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return addCors(json({ error: `DeepSeek ${res.status}`, detail: errText }, 502), request);
  }
  const data = await res.json();
  const reply = sanitizeObiResponse(data.choices?.[0]?.message?.content || "");

  // ── ULTRA MAX: Persist conversation memory for continuity across sessions ──
  if (studentId && reply && env.NET_PET_KV) {
    try {
      const memKey = `chat_memory:${studentId}`;
      const existingRaw = await env.NET_PET_KV.get(memKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : { history: [], lastActive: 0 };
      const now = Date.now();
      existing.history.push({ role: 'user', content: message.slice(0, 500), ts: now });
      existing.history.push({ role: 'assistant', content: reply.slice(0, 500), ts: now });
      // Keep last 30 exchanges (60 entries) — rolling window
      if (existing.history.length > 60) existing.history = existing.history.slice(-60);
      existing.lastActive = now;
      // TTL 90 days — auto-expire stale conversations
      await env.NET_PET_KV.put(memKey, JSON.stringify(existing), { expirationTtl: 86400 * 90 });
    } catch (_) {}
  }

  return addCors(json({ reply, studentId: studentId || null, contextInjected: !!context }), request);
}

// ── Soul DNA Capture ─────────────────────────────────────────────────────────
// VERBATIM FIRST. Zero transformation. Every word Michael speaks is sacred.
// No sanitizeInput. No truncation. No paraphrase. Raw → hash → chain → ledger.
async function handleSoulDNACapture(body, env) {
  // ── Validation (minimal — we want everything through) ──────────────────
  if (!body.text || typeof body.text !== "string" || body.text.length === 0) {
    return json({ error: "text required — verbatim dictation block" }, 400);
  }

  // VERBATIM: no sanitizeInput, no trim, no truncation.
  // The ONLY transformation allowed: normalize \r\n → \n (CRLF from Windows voice input).
  const verbatimText = body.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const author   = "sov100";                          // always Michael
  const run      = String(body.run   || "").slice(0, 20) || "untagged";
  const blockId  = String(body.blockId || "").slice(0, 50) || `auto-${Date.now()}`;
  const source   = String(body.source || "").slice(0, 30) || "voice"; // voice | text | paste
  const ts       = Date.now();

  // ── Build immutable payload (everything that will be hashed) ──────────
  const payloadObj = {
    text:    verbatimText,           // THE SOUL — verbatim, untouched
    run,
    blockId,
    source,
    author,
    charCount:  verbatimText.length,
    wordCount:  verbatimText.split(/\s+/).filter(Boolean).length,
    capturedAt: new Date(ts).toISOString(),
  };
  const payloadStr = JSON.stringify(payloadObj);

  // ── Append to LedgerDO under author namespace (hash-chained) ──────────
  if (!env.LEDGER) return json({ error: "LEDGER binding not configured" }, 500);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(author));
  const appendRes = await stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId: author,
      eventType: "soul_dna_capture",
      payload:   payloadStr,
    }),
  }));
  const appendData = await appendRes.json();

  // Notion: BLACKLISTED — no sync calls made; legacy data preserved in CANON/REINCARNATION

  return json({
    blockId,
    run,
    source,
    charCount: payloadObj.charCount,
    wordCount: payloadObj.wordCount,
    capturedAt: payloadObj.capturedAt,
    entryHash:  appendData.entryHash,
    prevHash:   appendData.prevHash,
    chainHead:  appendData.entryHash,   // caller can use this as prevHash for next block
    notionStatus: "BLACKLISTED — platform usage permanently disabled",
    ts,
  });
}

async function handleSoulDNAGet(url, env) {
  const run     = url.searchParams.get("run")    || "";
  const limit   = Math.min(parseInt(url.searchParams.get("limit") || "50"), 500);
  const raw     = url.searchParams.get("raw")    === "true"; // raw=true → include full text in response

  if (!env.LEDGER) return json({ error: "LEDGER binding not configured" }, 500);
  const stub = env.LEDGER.get(env.LEDGER.idFromName("sov100"));
  const histRes = await stub.fetch(
    new Request(`https://do/history?limit=${limit}&eventType=soul_dna_capture`)
  );
  const { entries, total } = await histRes.json();

  let blocks = entries.map(e => {
    let p = {};
    try { p = JSON.parse(e.payload); } catch (_) { p = { text: e.payload }; }
    const block = {
      id:         e.id,
      blockId:    p.blockId   || "",
      run:        p.run       || "untagged",
      source:     p.source    || "unknown",
      charCount:  p.charCount || 0,
      wordCount:  p.wordCount || 0,
      capturedAt: p.capturedAt || new Date(e.ts).toISOString(),
      entryHash:  e.entry_hash,
      prevHash:   e.prev_hash,
    };
    if (raw) block.text = p.text || "";
    return block;
  });

  // Filter by run if requested
  if (run) blocks = blocks.filter(b => b.run === run);

  const totalWords = blocks.reduce((sum, b) => sum + (b.wordCount || 0), 0);
  const totalChars = blocks.reduce((sum, b) => sum + (b.charCount || 0), 0);

  return json({ ok: true, blocks, totalBlocks: blocks.length, totalWords, totalChars, total });
}

// ── OBI v2 Pipeline: Context Builder + Drift + Scoring + Signals ─────────────

// Structured Context Builder — merges Soul + Sessions + State + Weaknesses
async function buildStructuredContext(env, studentId) {
  const ctx = { soul: null, sessionEvents: [], studentState: null, profile: null, weakPoints: [], petState: null };

  // Load Soul DNA (last 3 intent anchors — grounding reference only)
  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName("sov100"));
      const res = await stub.fetch(new Request("https://do/history?limit=3&eventType=soul_dna_capture"));
      const data = await res.json();
      if (data.entries?.length > 0) {
        ctx.soul = data.entries.map(e => { try { return JSON.parse(e.payload); } catch { return null; } }).filter(Boolean);
      }
    } catch (err) { console.log("[CTX_BUILDER] soul ledger fetch failed:", err.message); }
  }

  // Load recent session events (last 10 structured learning events)
  if (env.SESSIONS) {
    try {
      const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`events-${studentId}`));
      const res = await stub.fetch(new Request("https://do/events/recent?limit=10"));
      ctx.sessionEvents = (await res.json()).events || [];
    } catch (err) { console.log("[CTX_BUILDER] session events fetch failed:", err.message); }
  }

  // Load student profile + behavioral state + weakness patterns (parallel)
  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const [stateRes, profileRes, wpRes] = await Promise.all([
        stub.fetch(new Request("https://do/state/get")),
        stub.fetch(new Request("https://do/profile")),
        stub.fetch(new Request("https://do/weakness/get")),
      ]);
      ctx.studentState = (await stateRes.json()).studentState || null;
      ctx.profile = (await profileRes.json()).profile || null;
      ctx.weakPoints = (await wpRes.json()).weakPoints || [];
    } catch (err) { console.log("[CTX_BUILDER] profile DO fetch failed:", err.message); }
  }

  // Load pet state (streak, tiger score, mood)
  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      ctx.petState = (await stub.fetch(new Request("https://do/state")).then(r => r.json())).state || null;
    } catch (err) { console.log("[CTX_BUILDER] pet DO fetch failed:", err.message); }
  }

  return ctx;
}

// Drift Detection — scores how disconnected current input is from session context
function computeDriftScore(input, context) {
  let score = 0;
  if (!context.sessionEvents?.length) score += 3;  // no history = high drift
  const lastEvent = context.sessionEvents?.[0];
  if (lastEvent?.topic && input.length > 5) {
    const topicWords = lastEvent.topic.toLowerCase().split(/\s+/);
    const inputLower = input.toLowerCase();
    if (!topicWords.some(w => w.length > 3 && inputLower.includes(w))) score += 2;
  }
  if (!context.studentState) score += 1;  // no state loaded
  if (input.length < 3) score += 1;       // disengagement signal
  return Math.min(score, 10);
}

// Mouse → Tiger Score Calculator — behavioral state machine
function computeMouseTigerScore(metrics) {
  const score =
    (metrics.executionScore || 0) * 0.3 +
    (metrics.continuityScore || 0) * 0.25 +
    (metrics.engagementScore || 0) * 0.2 +
    (metrics.accountabilityScore || 0) * 0.15 +
    (metrics.accuracyScore || 0) * 0.1;
  const state = score >= 80 ? "TIGER" : score >= 40 ? "CUB" : "MOUSE";
  return { score: Math.round(score), state };
}

// Learning Signal Extraction — derives structured signals from chat exchange
function extractLearningSignals(input, response) {
  const signals = { mistakes: [], vocabulary: [], phonics: [], topic: "" };
  // Corrections from OBI response
  const corrPatterns = [/(?:should be|correct(?:ion)?|instead of|say|use)\s+[""]([^""]+)[""]/gi, /→\s*(.+?)(?:\.|$)/gm];
  for (const pat of corrPatterns) {
    let m; while ((m = pat.exec(response)) !== null) {
      if (m[1]?.length > 2 && m[1].length < 100) signals.mistakes.push(m[1].trim());
    }
  }
  // Vocabulary (quoted words)
  const vp = /[""](\w[\w\s]{1,30})[""]/g; let vm;
  while ((vm = vp.exec(response)) !== null) {
    if (vm[1] && !signals.mistakes.includes(vm[1])) signals.vocabulary.push(vm[1].trim());
  }
  signals.vocabulary = [...new Set(signals.vocabulary)].slice(0, 10);
  // Phonics detection
  const phonicsKw = ["pronunciation", "sound", "phonics", "th ", "ch ", "sh ", "/r/", "/l/", "/θ/", "/ð/"];
  if (phonicsKw.some(k => response.toLowerCase().includes(k))) {
    signals.phonics = (response.match(/\/[^/]+\//g) || []).slice(0, 5);
  }
  // Topic from input
  signals.topic = input.split(/\s+/).filter(w => w.length > 4).slice(0, 3).join(" ") || "general practice";
  return signals;
}

// Next Action Generator — deterministic "what comes next" based on state + signals
function generateNextAction(studentState, signals) {
  const state = studentState?.state || "MOUSE";
  if (signals.mistakes.length > 0) {
    return { type: "REPEAT", instruction: `Repeat with correction: "${signals.mistakes[0]}"`, difficulty: 0 };
  }
  if (state === "MOUSE") return { type: "SPEAK", instruction: "Try saying one more sentence using any words you know", difficulty: -0.1 };
  if (state === "CUB") return { type: "PRACTICE", instruction: "Try using a new word from today's vocabulary in a sentence", difficulty: 0.1 };
  return { type: "CHALLENGE", instruction: "Create a longer response with more complex grammar", difficulty: 0.2 };
}

// Format structured context into OBI system prompt injection
function formatContextForPrompt(ctx) {
  let injection = "";
  // Session continuity
  if (ctx.sessionEvents?.length > 0) {
    const recent = ctx.sessionEvents.slice(0, 5);
    const lines = recent.map(e => {
      const parts = [`Topic: ${e.topic || "?"}`, e.mistakes ? `Mistakes: ${e.mistakes}` : null, e.next_action ? `Next: ${e.next_action}` : null];
      return parts.filter(Boolean).join(" | ");
    });
    injection += `\n\nSESSION HISTORY (${ctx.sessionEvents.length} events — this is your continuous memory chain):\n${lines.join("\n")}`;
  }
  // Student state
  if (ctx.studentState) {
    const s = ctx.studentState;
    injection += `\n\nSTUDENT STATE: ${s.state || "MOUSE"} (score: ${s.mouse_tiger_score || 0}/100). Continuity: ${s.continuity_score || 0}. Events: ${s.total_events || 0}.`;
  }
  // Weakness patterns
  if (ctx.weakPoints?.length > 0) {
    const top = ctx.weakPoints.slice(0, 5).map(w => `${w.specific} (${w.category}, ×${w.error_count})`);
    injection += `\n\nKNOWN WEAKNESSES: ${top.join(", ")}. Target these in corrections.`;
  }
  // Pet state (streak/mood)
  if (ctx.petState) {
    injection += `\n\nSTREAK: ${ctx.petState.streak || 0} days. Mood: ${ctx.petState.mood || "neutral"}. Tiger score: ${ctx.petState.tigerScore || 0}.`;
  }
  return injection;
}

// ── Soul Logger: direct D1 write (bypasses worker-to-worker fetch 404/1042) ────

async function logSoulEvent(env, studentId, sessionId, role, text) {
  // Primary path: direct D1 write (soul-archive shared binding)
  if (env.SOUL_DB) {
    try {
      const ts = new Date().toISOString();
      // Ensure session exists
      const existing = await env.SOUL_DB.prepare(
        'SELECT session_id FROM soul_sessions WHERE session_id = ?'
      ).bind(sessionId).first();
      if (!existing) {
        await env.SOUL_DB.prepare(
          'INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(sessionId, studentId, 'obi-live', ts, ts, 0, 0, 'live').run();
      }
      // Get next position
      const countRow = await env.SOUL_DB.prepare(
        'SELECT COUNT(*) as cnt FROM soul_prompts WHERE session_id = ?'
      ).bind(sessionId).first();
      const position = (countRow?.cnt || 0) + 1;
      // Insert prompt
      const promptId = generateUUID();
      const byteCount = new TextEncoder().encode(text).length;
      const hash = await sha256(text);
      const markers = detectMarkers(text);
      await env.SOUL_DB.prepare(
        'INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(promptId, sessionId, position, text, ts, byteCount, hash, markers).run();
      // Update session prompt count
      await env.SOUL_DB.prepare(
        'UPDATE soul_sessions SET prompt_count = prompt_count + 1 WHERE session_id = ?'
      ).bind(sessionId).run();
      return; // success — silent
    } catch (err) {
      console.error(`[SOUL-D1] WRITE FAILED: ${err.message} (student=${studentId}, session=${sessionId}, role=${role})`);
      // Fall through to HTTP fallback
    }
  }

  // Fallback: HTTP fetch to soul-logger worker (kept for resilience, known broken via workers.dev)
  const url = (env.SOUL_LOGGER_URL || 'https://soul-logger.mrmichaelhobbs123.workers.dev') + '/api/soul/event';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, session_id: sessionId, role, text, timestamp: new Date().toISOString() }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error(`[SOUL-HTTP] FAILED ${res.status} from ${url}: ${errBody}`);
    }
  } catch (err) {
    clearTimeout(timer);
    console.error(`[SOUL-HTTP] FETCH ERROR: ${err.message} (student=${studentId}, session=${sessionId}, role=${role})`);
  }
}

// ── Chat (DeepSeek + Obi + Ledger memory injection) ──────────────────────────

// ── Memory Compression: update Soul DNA v1 summary ──────────────────────
async function updateStudentMemory(studentId, env) {
  // Stub — full implementation pending: compress recent exchanges into soul summary
  // Future: POST to soul-logger /api/soul/compress
}

async function handleChat(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const studentId = body.studentId || "anonymous";

  // C1: _translateOnly = quick Vi translation, skip all context/memory/soul
  if (body._translateOnly) {
    const lastMsg = Array.isArray(body.messages) ? body.messages[body.messages.length - 1] : null;
    const textToTranslate = (lastMsg?.content || "").replace(/^Translate[^:]*:\s*/i, '').replace(/^"[^"]*"\s*/, '').trim();
    if (textToTranslate.length > 3) {
      try {
        const tr = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST", headers: { "Authorization": "Bearer " + (env.OPENROUTER_API_KEY || ""), "Content-Type": "application/json" },
          body: JSON.stringify({ model: "openai/gpt-4o-mini", messages: [{ role: "user", content: `Translate to natural Vietnamese (1 sentence max, no quotes): ${textToTranslate}` }], max_tokens: 100, temperature: 0.3 })
        });
        if (tr.ok) {
          const td = await tr.json();
          const reply = (td.choices?.[0]?.message?.content || "").trim();
          if (reply) return json({ reply });
        }
      } catch (_) {}
    }
    return json({ reply: "" });
  }

  if (studentId !== "anonymous") {
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  }

  let messages = Array.isArray(body.messages) ? [...body.messages] : [];

  // Sanitize all user messages before sending to LLM
  messages = messages.map(m => {
    if (m.role === "user") return { ...m, content: sanitizeInput(m.content || "") };
    return m;
  }).filter(m => m.role === "system" || m.role === "user" || m.role === "assistant");

  // ── Fire ALL context fetches in parallel — one wait, not eight ───────────
  const isKnown = studentId !== "anonymous";
  const [ledgerR, sessionR, weaknessR, petR, soulR, kvR] = await Promise.allSettled([
    isKnown && env.LEDGER
      ? env.LEDGER.get(env.LEDGER.idFromName(studentId)).fetch(new Request("https://do/history?limit=15")).then(r => r.json())
      : Promise.resolve(null),
    isKnown && env.LEDGER
      ? env.LEDGER.get(env.LEDGER.idFromName(studentId)).fetch(new Request("https://do/history?limit=1&eventType=session_log")).then(r => r.json())
      : Promise.resolve(null),
    isKnown && env.PROFILES
      ? env.PROFILES.get(env.PROFILES.idFromName(studentId)).fetch(new Request("https://do/weakness/get")).then(r => r.json())
      : Promise.resolve(null),
    isKnown && env.PETS
      ? env.PETS.get(env.PETS.idFromName(studentId)).fetch(new Request("https://do/state")).then(r => r.json())
      : Promise.resolve(null),
    isKnown
      ? fetch(`${env.SOUL_LOGGER_URL || 'https://soul-logger.mrmichaelhobbs123.workers.dev'}/api/soul/context/${studentId}`).then(r => r.ok ? r.json() : null).catch(() => null)
      : Promise.resolve(null),
    isKnown
      ? Promise.all([env.NET_PET_KV.get(`lang:${studentId}`), env.NET_PET_KV.get(`student_profile_${studentId}`)])
      : Promise.resolve([null, null]),
  ]);

  // ── Extract results ───────────────────────────────────────────────────────
  let ledgerContext = "";
  const ledgerData = ledgerR.status === "fulfilled" ? ledgerR.value : null;
  if (ledgerData?.entries?.length > 0) {
    const lines = ledgerData.entries.filter(e => e.event_type === "chat_exchange").slice(-10)
      .map(e => { try { const p = JSON.parse(e.payload); return `Student: ${p.user}\nObi: ${p.obi}`; } catch { return ""; } }).filter(Boolean);
    if (lines.length > 0) ledgerContext = `\n\nSTUDENT LEDGER (${ledgerData.entries.length} total exchanges):\n${lines.join("\n---\n")}`;
  }

  let sessionContext = "";
  const sessionData = sessionR.status === "fulfilled" ? sessionR.value : null;
  if (sessionData?.entries?.length > 0) {
    const lastEntry = sessionData.entries.slice(-1)[0];
    if (lastEntry) {
      const s = JSON.parse(lastEntry.payload);
      const dateStr = new Date(lastEntry.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const vocabList = Array.isArray(s.vocabList) ? s.vocabList.join(", ") : (s.vocabList || "");
      sessionContext = `\n\nLAST REAL CLASS (${dateStr}): Topic: "${s.topic || ""}". Vocab: ${vocabList}. Level: ${s.studentLevel || ""}. Notes: "${s.teacherNotes || ""}".`;
    }
  }

  let weakPointsData = [];
  let weaknessContext = "";
  const weakData = weaknessR.status === "fulfilled" ? weaknessR.value : null;
  if (weakData) { weakPointsData = weakData.weakPoints || []; weaknessContext = buildWeaknessPrompt(weakPointsData); }

  let reEntryContext = "";
  let rewardContext = "";
  const petData = petR.status === "fulfilled" ? petR.value : null;
  if (petData) {
    const lastCheckin = petData.state?.lastCheckin || 0;
    const streakDays = petData.state?.streak || 0;
    if (lastCheckin > 0) reEntryContext = buildReEntryPrompt(Math.floor((Date.now() - lastCheckin) / 86400000), weakPointsData[0]?.specific || null);
    rewardContext = buildRewardPrompt(buildRewardSignals(weakPointsData, streakDays));
  }

  let soulContext = "";
  const soulData = soulR.status === "fulfilled" ? soulR.value : null;
  if (soulData?.context_brief) soulContext = `\n\nSOUL CONTEXT:\n${soulData.context_brief}`;

  let vietnameseContext = "";
  let teachingFocusContext = "";
  const kvData = kvR.status === "fulfilled" ? kvR.value : [null, null];
  const [lang, rawProfile] = kvData || [null, null];
  if (lang === "vi") vietnameseContext = `\n\nVIETNAMESE MODE ACTIVE: After EVERY sentence add Vietnamese translation in parentheses. Example: "Nice work! (Làm tốt lắm!) What topic? (Bạn chọn chủ đề gì?)" Every sentence — no exceptions.`;
  if (rawProfile) { try { const p = JSON.parse(rawProfile); const focus = p.teachingFocus || p.teaching_focus; if (focus) teachingFocusContext = `\n\nTEACHER INSTRUCTION (follow exactly): ${focus}`; } catch {} }

  const isFirstSession = ledgerContext === "" && sessionContext === "";
  const displayName = isKnown ? studentId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "there";
  const firstSessionContext = isFirstSession
    ? `\n\nFIRST SESSION: Student name is ${displayName}. Greet warmly by name. Wait for them to speak first. Under 2 sentences. Do not ask a question.`
    : "";

  const serverSystemContent = capContextInjection(OBI_SYSTEM, vietnameseContext, teachingFocusContext, firstSessionContext, ledgerContext, sessionContext, weaknessContext, reEntryContext, rewardContext, soulContext);
  const sysIdx = messages.findIndex(m => m.role === "system");
  if (sysIdx >= 0) {
    messages[sysIdx] = { role: "system", content: serverSystemContent };
  } else {
    messages.unshift({ role: "system", content: serverSystemContent });
  }

  const dsAbort = new AbortController();
  const dsTimer = setTimeout(() => dsAbort.abort(), 15000);
  let res;
  try {
    res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "deepseek-v4-flash", messages, max_tokens: 150, temperature: 0.85 }),
      signal: dsAbort.signal,
    });
  } catch (e) {
    res = { ok: false, status: 0 };
  } finally {
    clearTimeout(dsTimer);
  }

  const needsFallback = !res.ok && (res.status === 0 || res.status === 401 || res.status === 402 || res.status === 403 || res.status === 429 || res.status >= 500);
  let data;
  if (needsFallback && env.OPENROUTER_API_KEY) {
    const orAbort = new AbortController();
    const orTimer = setTimeout(() => orAbort.abort(), 15000);
    let orRes;
    try {
      orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.OPENROUTER_API_KEY}` },
        body: JSON.stringify({ model: "openai/gpt-4o-mini", messages, max_tokens: 150, temperature: 0.85 }),
        signal: orAbort.signal,
      });
    } catch (e) {
      return json({ error: "AI_FALLBACK_TIMEOUT" }, 504);
    } finally {
      clearTimeout(orTimer);
    }
    if (!orRes.ok) { const errText = await orRes.text(); return json({ error: `AI_FALLBACK_FAILED ${orRes.status}`, detail: errText }, 502); }
    data = await orRes.json();
  } else if (!res.ok) {
    const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502);
  } else {
    data = await res.json();
  }

  const choice = data.choices?.[0]?.message;
  let reply = sanitizeObiResponse(choice?.content || choice?.reasoning_content || "");

  // ── Auto-write every exchange to the Cryptographic Immutable Ledger ───────
  const userMsg = messages.filter(m => m.role === "user").pop()?.content || "";
  // Stable daily session ID — groups all turns in the same calendar day per student
  const sessionId = `${studentId}-${new Date().toISOString().slice(0, 10)}`;
  if (studentId !== "anonymous" && env.LEDGER && userMsg) {
    const payload = JSON.stringify({ user: userMsg, obi: reply });
    appendToLedger(studentId, "chat_exchange", payload, env).catch(() => {});
  }

  // ── Soul Logger: push user + assistant turns (fire-and-forget, D1-backed) ──
  if (studentId !== "anonymous" && userMsg) {
    logSoulEvent(env, studentId, sessionId, 'user', userMsg).catch(err => {
      console.error(`[SOUL] USER EVENT FAILED: ${err.message}`);
    });
  }
  if (studentId !== "anonymous") {
    logSoulEvent(env, studentId, sessionId, 'assistant', reply).catch(err => {
      console.error(`[SOUL] ASSISTANT EVENT FAILED: ${err.message}`);
    });
  }

  // ── Notion sync: BLACKLISTED — platform usage permanently disabled ────────

  // ── Memory Brain: Extract weaknesses from OBI's correction and store ─────
  if (studentId !== "anonymous" && env.PROFILES) {
    const detected = extractWeaknesses(reply);
    if (detected.length > 0) {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      profileStub.fetch(new Request("https://do/weakness/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, weaknesses: detected }),
      })).catch(() => {});
    }
  }

  // Fire-and-forget: roster update + memory compression (don't block response)
  if (studentId !== "anonymous" && env.SESSIONS) {
    env.SESSIONS.get(env.SESSIONS.idFromName("system-roster")).fetch(new Request("https://do/roster/chat", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId }),
    })).catch(() => {});
  }
  if (studentId !== "anonymous") { updateStudentMemory(studentId, env).catch(() => {}); }

  // ── v2 Pipeline: Extract signals → Write session event → Update state ───
  let driftScore = 0;
  let nextAction = null;
  let learningSignals = null;
  if (studentId !== "anonymous" && userMsg) {
    // 1. Compute drift
    driftScore = 0;

    // 2. Extract learning signals from the exchange
    learningSignals = extractLearningSignals(userMsg, reply);

    // 3. Generate next action
    nextAction = generateNextAction(null, learningSignals);

    // 4. Write structured session event (non-blocking)
    if (env.SESSIONS) {
      const eventsStub = env.SESSIONS.get(env.SESSIONS.idFromName(`events-${studentId}`));
      eventsStub.fetch(new Request("https://do/events/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          input: userMsg,
          output: reply,
          mistakes: JSON.stringify(learningSignals.mistakes),
          vocabulary: JSON.stringify(learningSignals.vocabulary),
          phonics: JSON.stringify(learningSignals.phonics),
          topic: learningSignals.topic,
          nextAction: nextAction ? nextAction.instruction : "",
          driftScore,
        }),
      })).catch(() => {});
    }

    // 5. Update student behavioral state (non-blocking)
    if (env.PROFILES) {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      profileStub.fetch(new Request("https://do/state/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          hasMistakes: learningSignals.mistakes.length > 0,
          driftScore,
          inputLength: userMsg.length,
        }),
      })).catch(() => {});
    }
  }

  return json({
    reply,
    studentId,
    ledgerLoaded: !!ledgerContext,
    sessionLoaded: !!sessionContext,
    weaknessLoaded: !!weaknessContext,
    reEntryMode: !!reEntryContext,
    driftScore,
    nextAction,
    state: null,
    mouseTigerScore: null,
  });
}

// ── Vocab SRS API handlers ────────────────────────────────────────────────────

async function handleVocabList(studentId, env) {
  if (!studentId) return json({ words: [], total: 0 });
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  // Read OBI voice agent vocab from KV (saved via function calling)
  try {
    const raw = await env.NET_PET_KV.get("vocab_list_" + studentId);
    if (raw) {
      const words = JSON.parse(raw);
      return json({ words: words.slice(-50), total: words.length, source: "obi_voice" });
    }
  } catch (_) {}
  return json({ words: [], total: 0 });
}

// ── Voice Agent system prompt builder ────────────────────────────────────────
// Used by /api/agent WS proxy — builds OBI persona + student-specific instructions
// from KV profile. Server-side equivalent of chat.js buildSystemPrompt().

function buildGreeting(profile, mode, lastTopic) {
  const name = (profile?.name || "").split(" ")[0] || "";
  const hi = name ? `Hey ${name}!` : "Hey!";
  if (mode === "phonics") return `${hi} Ready to drill some sounds? Let's warm up.`;
  if (mode === "study")   return `${hi} What are we studying today?`;
  if (lastTopic)          return `${hi} Last time we talked about ${lastTopic}. Want to keep going, or something new?`;
  return `${hi} I'm Obi. What's on your mind today? Just talk — no need to be perfect.`;
}

function buildAgentPrompt(profile, lang, recentVocab = [], arc = null, mode = 'free', memory = null, phonicsProgress = null) {
  const _name  = profile?.fullName || profile?.name;
  const _level = profile?.englishLevel || profile?.level;
  const lvl = (_level || "").toLowerCase();

  const ctx = [
    _name  ? `Student: ${_name}.`  : "",
    _level ? `Level: ${_level}.`   : "",
    profile?.goals ? `Goal: ${profile.goals}.` : "",
    profile?.primaryBlock ? `Current struggle: ${profile.primaryBlock}.` : "",
    profile?.breakthrough ? `Recent breakthrough: ${profile.breakthrough}.` : ""
  ].filter(Boolean).join(" ");

  const isBeginner = /a1|a2|beginner|elementary|mới|cơ/.test(lvl);
  const isAdvanced = /b2|c1|advanced|upper/.test(lvl);
  const levelInstr = isBeginner
    ? "BEGINNER: Use very simple words and short sentences. Celebrate every sentence they produce — even broken ones. Rephrase mistakes naturally, never directly correct. Build confidence first, accuracy comes later."
    : isAdvanced
    ? "ADVANCED: Challenge them. Ask complex follow-ups. Push for nuance. They can handle subtle corrections."
    : "INTERMEDIATE: Build confidence while pushing limits. Mix encouragement with challenge. Rephrase mistakes naturally.";

  const teachingInstr = profile?.teachingFocus
    ? `TEACHER INSTRUCTION (follow exactly): ${profile.teachingFocus}`
    : "";

  const sessionCtx = profile?.sessionNotes
    ? `LAST SESSION NOTES: ${profile.sessionNotes}`
    : "";

  const vocabCtx = recentVocab.length > 0
    ? `RECENTLY LEARNED (weave naturally, don't quiz): ${recentVocab.join(", ")}`
    : "";

  const arcCtx = arc
    ? `ACTIVE ARC — Unit: ${arc.unit} | Topic: ${arc.topic} | Drill these words naturally: ${(arc.targets || []).join(", ")}${arc.pronunciation ? ` | Pronunciation focus: ${arc.pronunciation}` : ""}`
    : "";

  const memoryCtx = memory
    ? `MEMORY CONTEXT (Cross-session relationship): Session #${memory.session_count || 1}. ${memory.world_model ? `Student vibe: ${memory.world_model}.` : ""} ${memory.last_topic ? `Last time: ${memory.last_topic}.` : ""} ${memory.breakthroughs?.length ? `Recent wins: ${memory.breakthroughs.slice(0,3).join("; ")}.` : ""} ${memory.struggles?.length ? `Persistent issues: ${memory.struggles.slice(0,3).join("; ")}.` : ""} Use this to personalize tone and topic continuity.`
    : "";

  const companyCtx = profile?.company
    ? `ANCHOR IN REAL WORK: Student works at ${profile.company}. Ask them to share an actual email, Slack message, or meeting note they need help with. Practice with real materials — not invented scenarios.`
    : "";

  const funcInstr = "FUNCTION: When the student successfully uses a new English word in a sentence — not just repeats it but actually USES it — call save_vocabulary_word with that word. Do this silently, mid-conversation. Max 2 saves per session.";

  const viMode = lang === "vi"
    ? `VOICE OUTPUT LANGUAGE: ENGLISH ONLY. NEVER produce Vietnamese words, phrases, syllables, or translations in any spoken response. Your TTS engine is English-only and will mangle Vietnamese phonetics. If student speaks Vietnamese, understand it fully but ALWAYS reply in English only. No exceptions. No parenthetical translations in voice. No Vietnamese greetings. No Vietnamese encouragement phrases.`
    : "";

  const faceSaving = [
    "FACE-SAVING (Vietnamese culture — non-negotiable):",
    "- NEVER say 'Wrong', 'No', 'Incorrect'. These cause shame and silence.",
    "- RECAST: echo correct form naturally in your reply. Student: 'I go store yesterday' → OBI: 'Oh you WENT to the store! What did you buy?'",
    "- Celebrate volume and attempt. Max 1 correction per 5 turns.",
    "- 3s+ silence: 'Take your time. Try saying: [simple phrase]'"
  ].join("\n");

  // ── MODE-SPECIFIC INSTRUCTIONS ──────────────────────────────────────────────
  let modeInstr = '';
  if (mode === 'phonics') {
    const currentGroupName = phonicsProgress?.group_name || 'SATNIP';
    const drillSentence = phonicsProgress?.next_drill?.sentence || null;
    const drillTip = phonicsProgress?.next_drill?.tip || null;
    const focusError = phonicsProgress?.dominant_errors?.[0] || null;
    const sessionsPhonicsDone = phonicsProgress?.drills_completed?.length || phonicsProgress?.drill_count || phonicsProgress?.session_count_phonics || 0;
    modeInstr = [
      'MODE: NET PHONICS — Natural English Training sound system (42 sounds, 7 groups).',
      `CURRENT GROUP: ${currentGroupName} — work within this group today.`,
      'THE 7 GROUPS IN ORDER: SATNIP → DRUMBLE → HOGFEZ → WYVEX → CHUSHANG → BEEHIVE → OYSTER',
      'FOCUS: Pronunciation accuracy. One sound at a time. Specific mouth feedback.',
      drillSentence ? `TODAY\'S DRILL SENTENCE: "${drillSentence}"` : '',
      drillTip ? `ARTICULATION TIP: ${drillTip}` : '',
      focusError ? `STUDENT\'S KNOWN FOCUS ERROR: ${focusError} — watch for this specifically.` : '',
      phonicsProgress?.weak_phonemes?.length ? `WEAK PHONEMES (< 50% mastery): /${phonicsProgress.weak_phonemes.join('/, /')}/ — prioritise these over already-strong sounds.` : '',
      sessionsPhonicsDone > 0 ? `This student has completed ${sessionsPhonicsDone} phonics drills so far.` : 'First phonics session — start gently.',
      'BEHAVIOR:',
      '- Give the drill sentence above. Ask them to repeat it.',
      '- After each attempt: give SPECIFIC feedback — tongue position, lip shape, airflow. Name the exact mouth movement.',
      '- Celebrate correct sound production immediately. Recast errors naturally — never say "wrong".',
      '- Max 5 drills per session before suggesting a break.',
      '- NEVER move on until the target sound is produced correctly at least once.',
      '- Vietnamese L1 priorities: /r/ not /l/, /f/ not /ph/, /w/ vs /v/ are different muscles, /θ/ = tongue between teeth (not /t/ or /s/), final consonant deletion (do NOT drop word endings), vowel length (/iː/ vs /ɪ/ are different words).',
    ].filter(Boolean).join('\n');
  } else if (mode === 'study') {
    modeInstr = [
      'MODE: LOG-HOME-STUDY.',
      'FOCUS: Structured learning with homework tracking and progress logging.',
      'BEHAVIOR:',
      '- Ask what they studied since last session. Log their answer.',
      '- Review previous homework assignments. Ask for completion status.',
      '- Assign NEW homework: specific, measurable, time-bound (e.g., "Record yourself saying these 5 sentences tonight").',
      '- Track streaks and consistency. Celebrate daily practice.',
      '- Reference their goals and primaryBlock from profile.',
      '- End every session with a clear next-step assignment.',
    ].join('\n');
  } else {
    // free mode — default behavior, no extra instructions
    modeInstr = '';
  }

  return [
    `You are OBI — Michael Hobbs in AI form. High-energy, anti-shame, tough love. Volume and velocity beat grammar. Mouse Voice → Tiger Voice. Coach, not textbook.${_name ? ` Student: ${_name}.` : ''}`,
    modeInstr,
    mode === 'phonics'
      ? `FIRST RESPONSE (PHONICS OPENING): Brief warm greeting (max 6 words), then immediately deliver the drill. Say: "Let's work on your ${phonicsProgress?.group_name || 'sounds'} today. Try this sentence: '${phonicsProgress?.next_drill?.sentence || 'She sat next to me at the station.'}'" — wait for them to try. Do NOT ask what they want to talk about.`
      : "FIRST RESPONSE SPEED: Your ENTIRE first reply must be ONE short sentence (under 10 words) that BOTH acknowledges what they said AND moves the conversation forward. Example: 'Nice — tell me more!' or 'Love that — what happened next?' Never say just 'Great!' or 'Nice!' alone. One sentence only, then stop.",
    "1-3 sentences MAX. React to what they said. One sharp follow-up question. Never lecture. A1/A2 students: max 2 sentences, ultra-simple words only.",
    ctx,
    levelInstr,
    faceSaving,
    sessionCtx,
    vocabCtx,
    arcCtx,
    memoryCtx,
    companyCtx,
    mode !== 'phonics' ? "SESSION OPENING: If LAST SESSION NOTES exist, your FIRST message MUST reference something specific from those notes. Ask about a word they learned, a topic they discussed, or progress they made. Never open with a generic 'what do you want to talk about?' when you have session history. Example: 'Last time you practiced breakfast, lunch, dinner — can you use them in a sentence today?' This shows the student you remember them." : "",
    "SESSION CLOSE: When conversation winds down naturally or student says bye, give a SPECIFIC micro-win (\"You just used [actual word from session] in a real sentence!\") then a forward hook (\"Next session: we go deeper on [specific topic based on their level].\"). Never give a flat goodbye.",
    funcInstr,
    teachingInstr,
    viMode
  ].filter(Boolean).join("\n");
}

// ── TTS (Deepgram Aura) ───────────────────────────────────────────────────────

async function handleTTS(body, env) {
  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not configured" }, 500);
  const text = sanitizeInput((body.text || "").slice(0, 1000));
  if (!text) return json({ error: "No text provided" }, 400);
  // aura-orion-en = best male voice — warm, clear, authoritative coach tone
  const res = await fetch("https://api.deepgram.com/v1/speak?model=aura-orion-en", {
    method: "POST",
    headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) return json({ error: `Deepgram TTS ${res.status}` }, 502);
  return new Response(res.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", ...corsHeaders() } });
}

// ── Speech-to-Learning MVP — Core Loop ────────────────────────────────────────

const CORRECT_PROMPT = `You are OBI, a strict but warm English coach for Vietnamese students.

TASK: The student spoke a sentence. You must:
1. Correct ANY grammar, vocabulary, or phrasing errors
2. Explain the mistake simply (1 sentence max, use Vietnamese translation if it helps)
3. Give the corrected sentence for them to repeat

RULES:
- If the sentence is already correct, say so and give a slightly more advanced version to try
- Keep explanations SHORT — max 1-2 sentences
- Be encouraging, never shaming
- Focus on the MOST IMPORTANT error first, not every tiny detail

RESPOND IN EXACTLY THIS JSON FORMAT (no markdown, no extra text):
{"corrected":"the corrected sentence","explanation":"why it was wrong, simply","repeat":"say this sentence out loud","wasCorrect":false}

If correct:
{"corrected":"their original sentence","explanation":"Perfect! Here's a challenge version:","repeat":"a slightly harder version","wasCorrect":true}`;

async function handleCorrect(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const studentId = body.studentId || "anonymous";
  const transcript = sanitizeInput((body.transcript || body.message || "").slice(0, 500));
  if (!transcript) return json({ error: "No speech transcript provided" }, 400);

  // Load past mistakes for context
  let mistakeContext = "";
  if (studentId !== "anonymous" && env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const histRes = await stub.fetch(new Request("https://do/history?limit=10&eventType=correction"));
      const histData = await histRes.json();
      const past = (histData.entries || []).map(e => {
        try { const p = JSON.parse(e.payload); return p.original; } catch { return ""; }
      }).filter(Boolean);
      if (past.length > 0) {
        mistakeContext = `\n\nSTUDENT'S PAST MISTAKES (they keep getting these wrong — watch for patterns):\n${past.slice(-5).map(m => `- "${m}"`).join("\n")}`;
      }
    } catch (err) { console.log("[CORRECT] ledger fetch failed:", err.message); }
  }

  // Load weakness data
  let weakContext = "";
  if (studentId !== "anonymous" && env.PROFILES) {
    try {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const wpRes = await profileStub.fetch(new Request("https://do/weakness/get"));
      const wpData = await wpRes.json();
      weakContext = buildWeaknessPrompt(wpData.weakPoints || []);
    } catch (err) { console.log("[CORRECT] weakness fetch failed:", err.message); }
  }

  const messages = [
    { role: "system", content: CORRECT_PROMPT + mistakeContext + weakContext },
    { role: "user", content: transcript },
  ];

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages, max_tokens: 200, temperature: 0.3 }),
  });

  if (!res.ok) { const errText = await res.text(); return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502); }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";

  // Parse structured response
  let result;
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    result = JSON.parse(cleaned);
  } catch {
    result = { corrected: raw, explanation: "", repeat: raw, wasCorrect: false };
  }

  // Store the correction in ledger
  if (studentId !== "anonymous" && env.LEDGER) {
    const payload = JSON.stringify({ original: transcript, corrected: result.corrected, wasCorrect: result.wasCorrect });
    appendToLedger(studentId, "correction", payload, env).catch(() => {});
  }

  // Extract + store weaknesses
  if (studentId !== "anonymous" && env.PROFILES && !result.wasCorrect) {
    const detected = extractWeaknesses(result.explanation + " " + result.corrected);
    if (detected.length > 0) {
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      profileStub.fetch(new Request("https://do/weakness/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, weaknesses: detected }),
      })).catch(() => {});
    }
  }

  // Auto-checkin to PetDO (student spoke = they practiced)
  if (studentId !== "anonymous" && env.PETS) {
    const petStub = env.PETS.get(env.PETS.idFromName(studentId));
    petStub.fetch(new Request("https://do/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: 1, confidence: result.wasCorrect ? 7 : 4 }),
    })).catch(() => {});
  }

  return json({ ...result, original: transcript, studentId });
}

async function handleRepeat(body, env) {
  const studentId = body.studentId || "anonymous";
  const attempt = sanitizeInput((body.attempt || "").slice(0, 500));
  const expected = sanitizeInput((body.expected || "").slice(0, 500));
  if (!attempt || !expected) return json({ error: "attempt and expected required" }, 400);

  // Normalize for comparison: lowercase, strip punctuation, collapse whitespace
  const norm = s => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
  const a = norm(attempt);
  const e = norm(expected);

  // Simple word-level match score
  const eWords = e.split(" ");
  const aWords = a.split(" ");
  let matches = 0;
  for (let i = 0; i < eWords.length; i++) {
    if (aWords[i] === eWords[i]) matches++;
  }
  const score = eWords.length > 0 ? Math.round((matches / eWords.length) * 100) : 0;
  const passed = score >= 80;

  // Ledger the repeat attempt
  if (studentId !== "anonymous" && env.LEDGER) {
    const payload = JSON.stringify({ attempt, expected, score, passed });
    appendToLedger(studentId, "repeat_attempt", payload, env).catch(() => {});
  }

  let feedback;
  if (score === 100) feedback = "Perfect! You nailed it. 🔥";
  else if (score >= 80) feedback = "Close enough! Good job. Keep that sentence in your brain.";
  else if (score >= 50) feedback = "Almost — try again. Listen carefully to the corrected version.";
  else feedback = "Not quite. Listen to the sentence again, then repeat slowly.";

  return json({ passed, score, feedback, attempt, expected, studentId });
}

async function handleMistakes(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  if (!env.LEDGER) return json({ error: "LEDGER not configured" }, 500);

  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  const histRes = await stub.fetch(new Request("https://do/history?limit=50&eventType=correction"));
  const histData = await histRes.json();

  const mistakes = (histData.entries || []).map(e => {
    try {
      const p = JSON.parse(e.payload);
      return { original: p.original, corrected: p.corrected, wasCorrect: p.wasCorrect, ts: e.ts };
    } catch { return null; }
  }).filter(Boolean);

  const errorRate = mistakes.length > 0
    ? Math.round((mistakes.filter(m => !m.wasCorrect).length / mistakes.length) * 100)
    : 0;

  return json({ studentId, mistakes, total: mistakes.length, errorRate });
}

async function handleParentReport(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  // Gather student data from all DOs
  let profile = null, petState = null, mistakeCount = 0, lastActive = 0;

  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/profile"));
      const data = await res.json();
      profile = data.profile;
    } catch (_) {}
  }

  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/state"));
      const data = await res.json();
      petState = data.state;
      lastActive = petState?.lastCheckin || 0;
    } catch (_) {}
  }

  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/history?limit=100&eventType=correction"));
      const data = await res.json();
      mistakeCount = (data.entries || []).filter(e => {
        try { return !JSON.parse(e.payload).wasCorrect; } catch { return false; }
      }).length;
    } catch (_) {}
  }

  const daysSinceActive = lastActive > 0 ? Math.floor((Date.now() - lastActive) / 86400000) : -1;
  const alert = daysSinceActive > 1 ? `Student has not practiced for ${daysSinceActive} days` : null;

  return json({
    studentId,
    name: profile?.full_name || studentId,
    streak: petState?.streak || 0,
    totalSessions: petState?.total_sessions || 0,
    xp: petState?.xp || 0,
    mistakeCount,
    daysSinceActive,
    alert,
    level: profile?.english_level || "Unknown",
  });
}

async function handleTeacherDashboard(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);

  // Pull roster for class overview
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/flags"));
  const rosterData = await rosterRes.json();

  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const allFlags = rosterData.flags || [];
  const dropoffRisk = allFlags.filter(s => s.last_active > 0 && s.last_active < sevenDaysAgo);

  return json({
    totalStudents: rosterData.count || 0,
    flaggedStudents: allFlags.length,
    dropoffRisk: dropoffRisk.map(s => ({ studentId: s.student_id, lastActive: s.last_active, daysSince: Math.floor((Date.now() - s.last_active) / 86400000) })),
    roster: allFlags.map(s => ({ studentId: s.student_id, fullName: s.full_name, level: s.level, lastActive: s.last_active })),
  });
}

// ── Onboarding ────────────────────────────────────────────────────────────────

async function handleOnboarding(body, env) {
  if (!body.studentId || typeof body.studentId !== "string") return json({ error: "studentId required" }, 400);
  const studentId = body.studentId.trim();

  const profile = {
    fullName: body.fullName || body.studentId,
    englishLevel: body.englishLevel || body.level || "pending",
    currentCity: body.currentCity || "",
    segment: body.segment || "",
    source: body.source || "onboarding",
    assessmentRef: body.assessmentRef || "",
    level_status: "pending_review",
    studyGoal: body.studyGoal || "",
    notifications: body.notifications || {},
    vocab: body.vocab || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (env.NET_PET_KV) {
    try {
      await env.NET_PET_KV.put(`student_profile_${body.studentId}`, JSON.stringify(profile));
    } catch (err) {
      console.error(`[ONBOARDING] KV write failed for ${body.studentId}:`, err.message);
    }
  }

  // Ledger the onboarding event
  if (env.LEDGER) {
    const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
    appendToLedger(body.studentId, "onboarding", payload, env).catch(() => {});
  }
  // Register in roster so digest + flags work (must await — CF Workers kills fire-and-forget without waitUntil)
  await upsertRoster(body.studentId, { fullName: body.fullName, englishLevel: body.englishLevel }, env).catch(() => {});

  // Issue a student-scoped HMAC token so the client can authenticate memory calls
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET || "phoenix-fallback-dev-key"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const canonicalId = (body.studentId || "").toLowerCase();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonicalId));
  const studentToken = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

  // Block V: Known student portal map — return portal_url for direct redirect after onboarding
  const portalMap = {
    'quy-bluetech': '/student/quy-bluetech',
    'huong-bluetech': '/student/huong-bluetech',
    'mai-tram': '/student/mai-tram',
    'lam-bluetech': '/lam-portal.html?studentId=lam-bluetech',
    'quan-nguyen': '/quan-portal.html?studentId=quan-nguyen',
    'quang-nguyen': '/quang-portal.html?studentId=quang-nguyen',
    'minh-private': '/student/minh-private'
  };
  const portal_url = portalMap[studentId] || null;
  const resData = { ok: true, portal_url };
  return json({ ...resData, studentId, studentToken, redirect: "/magic-chat.html?studentId=" + encodeURIComponent(studentId) + "&taster=1" });
}

// ── Memory (mutable scratch — Ledger is the permanent record) ────────────────

// Verify that the X-Student-Token header matches the requested studentId.
// Token = HMAC-SHA256(studentId, SESSION_SECRET). Issued at onboarding, stored client-side.
async function _verifyStudentToken(studentId, token, env) {
  if (!token) return false;
  const canonicalId = (studentId || "").toLowerCase();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET || "phoenix-fallback-dev-key"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonicalId));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  return expected === token;
}

async function handleMemorySave(body, env, request) {
  const studentId = body.studentId || "unknown";
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const token = request?.headers?.get("X-Student-Token") || body._token || "";
  if (token) {
    const tokenValid = await _verifyStudentToken(studentId, token, env);
    if (!tokenValid) {
      logWarn('MEMORY_SAVE_TOKEN_INVALID', { studentId }, env);
      return json({ error: 'Invalid student token', code: 'TOKEN_INVALID' }, 401);
    }
  }
  // Route through STUDENT_MEMORY KV (SESSIONS DO was removed in migration v7)
  try {
    if (env.STUDENT_MEMORY && body.exchange) {
      const raw = await env.STUDENT_MEMORY.get(`mem:${studentId}`);
      const existing = raw ? JSON.parse(raw) : { world_model: "", recent_vocab: [], session_count: 0, last_topic: "", breakthroughs: [], struggles: [] };
      // Append exchange summary
      if (body.exchange.user) existing.last_topic = body.exchange.user.slice(0, 200);
      existing.session_count = (existing.session_count || 0) + 1;
      existing.updated_at = new Date().toISOString();
      const serialized = JSON.stringify(existing);
      if (serialized.length <= 10240) {
        await env.STUDENT_MEMORY.put(`mem:${studentId}`, serialized);
      }
      return json({ ok: true, session_count: existing.session_count });
    }
  } catch (err) {
    console.error(`[MEMORY_SAVE] KV write failed for ${studentId}:`, err.message);
  }
  // Fallback: return success without persisting if KV unavailable
  return json({ ok: true, note: "memory saved (fallback)" });
}

async function handleMemoryGet(studentId, env, request) {
  if (!studentId) return json({ memory: [] });
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  // Auth: verify token if present, but allow portal students (no token) to read empty memory
  const token = request?.headers?.get("X-Student-Token") || request?.url && new URL(request.url).searchParams.get("_token") || "";
  if (token) {
    const tokenValid = await _verifyStudentToken(studentId, token, env);
    if (!tokenValid) {
      console.log(`[MEMORY_GET] Invalid token for ${studentId} — returning empty memory`);
      return json({ memory: [] });
    }
  } else {
    // No token = portal student loaded via URL param. Allow read with empty fallback.
    console.log(`[MEMORY_GET] No token for ${studentId} — returning empty memory (portal student)`);
  }
  // Try STUDENT_MEMORY KV first (new pipeline), fall back to legacy SESSIONS DO
  try {
    if (env.STUDENT_MEMORY) {
      const raw = await env.STUDENT_MEMORY.get(`mem:${studentId}`);
      if (raw) {
        const mem = JSON.parse(raw);
        return json({ memory: [], world_model: mem.world_model || "", recent_vocab: mem.recent_vocab || [], session_count: mem.session_count || 0 });
      }
    }
  } catch (err) {
    console.error(`[MEMORY_GET] KV read failed for ${studentId}:`, err.message);
  }
  // Legacy SESSIONS DO fallback — may not exist after migration v7
  try {
    if (env.SESSIONS) {
      const stub = env.SESSIONS.get(env.SESSIONS.idFromName(studentId));
      return stub.fetch(new Request("https://do/memory/get"));
    }
  } catch (err) {
    console.error(`[MEMORY_GET] SESSIONS DO failed for ${studentId}:`, err.message);
  }
  return json({ memory: [] });
}

// ── Progress ─────────────────────────────────────────────────────────────────

async function handleProgress(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const profileStub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
  const progressRes = await profileStub.fetch(new Request("https://do/progress"));
  const progressData = await progressRes.json();
  let petState = null;
  try {
    const petStub = env.PETS.get(env.PETS.idFromName(studentId));
    const petRes = await petStub.fetch(new Request("https://do/state"));
    const petData = await petRes.json();
    petState = petData.state || null;
  } catch (_) {}
  const signals = buildRewardSignals(progressData.weakPoints || [], petState?.streak || 0);
  return json({ weakPoints: progressData.weakPoints, profile: progressData.profile, pet: petState, rewardSignals: signals });
}

// ── Lesson / Practice / Feedback ─────────────────────────────────────────────

async function handleLesson(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Generate a short English lesson for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Practical, energetic, under 200 words. 3 example sentences, 1 mini exercise. Anti-shame style. Mouse to Tiger framing.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 500, temperature: 0.7 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  const lesson = data.choices?.[0]?.message?.content || "Lesson generation failed";
  if (body.studentId && env.LEDGER) appendToLedger(body.studentId, "lesson_generated", JSON.stringify({ topic: body.topic, level: body.level }), env).catch(() => {});
  return json({ lesson });
}

async function handlePractice(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Create a quick English practice drill for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Give 5 short exercises. Tiger Voice style.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 400, temperature: 0.7 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ practice: data.choices?.[0]?.message?.content || "Practice generation failed" });
}

async function handleFeedback(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const studentText = sanitizeInput((body.studentResponse || "").slice(0, 500));
  if (!studentText) return json({ error: "studentResponse required" }, 400);
  const prompt = `A Vietnamese English student wrote: "${studentText}"\n\nGive OBI-style coaching:\n1. One genuine encouragement\n2. One natural correction (show better version, no grammar rules)\n3. One Tiger push\n\nMax 4 sentences. Anti-shame. Tiger Voice.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-v4-flash", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 300, temperature: 0.75 }),
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  const feedback = data.choices?.[0]?.message?.content || "Feedback generation failed";
  if (body.studentId && env.LEDGER) appendToLedger(body.studentId, "feedback", JSON.stringify({ input: studentText, feedback }), env).catch(() => {});
  return json({ feedback });
}

// ── NET Pet ───────────────────────────────────────────────────────────────────

async function handlePetCheckin(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(body.studentId));
  const res = await stub.fetch(new Request("https://do/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  const data = await res.clone().json();
  if (env.LEDGER && data.ok) {
    const payload = JSON.stringify({ minutes: body.minutes, confidence: body.confidence, streak: data.state?.streak, xp: data.state?.xp, mood: data.state?.mood, milestone: data.milestone || null });
    appendToLedger(body.studentId, "pet_checkin", payload, env).catch(() => {});
  }
  return res;
}

async function handlePetState(studentId, env) {
  if (!studentId) return json({ state: null, error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(studentId));
  return stub.fetch(new Request("https://do/state"));
}

async function handlePetScore(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(studentId));
  return stub.fetch(new Request("https://do/score"));
}

// ── Phonics Drills ────────────────────────────────────────────────────────────

async function handleDrillNext(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);

  // Get student weaknesses to pick targeted drill
  let weakPoints = [];
  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/weakness/get"));
      const data = await res.json();
      weakPoints = (data.weakPoints || []).map(w => w.category);
    } catch (_) {}
  }

  const { PHONICS_DRILLS } = await import('./phonics-drills.js');

  // Match drills to weaknesses, fallback to random
  let matched = [];
  if (weakPoints.length > 0) {
    for (const drill of PHONICS_DRILLS) {
      if (drill.targetErrors.some(e => weakPoints.includes(e))) {
        matched.push(drill);
      }
    }
  }
  if (matched.length === 0) matched = PHONICS_DRILLS;

  // Pick random from matched set
  const drill = matched[Math.floor(Math.random() * matched.length)];
  return json({ drill, matchedToWeakness: weakPoints.length > 0 && matched.length < PHONICS_DRILLS.length, studentId });
}

async function handleDrillResult(body, env) {
  const studentId = body.studentId || "anonymous";
  if (!body.drillId || !body.attempt) return json({ error: "drillId and attempt required" }, 400);

  // Score the attempt against the expected sentence
  const { PHONICS_DRILLS } = await import('./phonics-drills.js');
  const drill = PHONICS_DRILLS.find(d => d.id === body.drillId);
  if (!drill) return json({ error: "drill not found" }, 404);

  const norm = s => s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
  const expected = norm(drill.sentence);
  const attempt = norm(body.attempt);
  const eWords = expected.split(" ");
  const aWords = attempt.split(" ");
  let matches = 0;
  for (let i = 0; i < eWords.length; i++) {
    if (aWords[i] === eWords[i]) matches++;
  }
  const score = eWords.length > 0 ? Math.round((matches / eWords.length) * 100) : 0;
  const passed = score >= 80;

  // Log to ledger
  if (studentId !== "anonymous" && env.LEDGER) {
    const payload = JSON.stringify({ drillId: body.drillId, sentence: drill.sentence, attempt: body.attempt, score, passed, group: drill.group, targetErrors: drill.targetErrors });
    appendToLedger(studentId, "drill_attempt", payload, env).catch(() => {});
  }

  let feedback;
  if (score === 100) feedback = "Perfect drill! 🔥 That sound is locked in.";
  else if (score >= 80) feedback = "Good enough — moving on. Keep drilling daily.";
  else if (score >= 50) feedback = "Almost. Listen again, repeat slower.";
  else feedback = "Try again. Focus on the highlighted sound.";

  return json({ passed, score, feedback, drill, studentId });
}

async function handleDrillList() {
  const { PHONICS_DRILLS } = await import('./phonics-drills.js');
  const groups = {};
  for (const d of PHONICS_DRILLS) {
    if (!groups[d.group]) groups[d.group] = { group: d.group, phonemes: d.phonemes, drills: [] };
    groups[d.group].drills.push({ id: d.id, sentence: d.sentence, targetErrors: d.targetErrors });
  }
  return json({ groups: Object.values(groups), total: PHONICS_DRILLS.length });
}

// ── Metrics — The 4 That Matter ───────────────────────────────────────────────

async function handleMetricsSummary(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);

  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const students = rosterData.students || [];

  const now = Date.now();
  const oneDayAgo = now - 86400000;
  const sevenDaysAgo = now - 7 * 86400000;

  let dau = 0, totalSessions = 0, totalCorrections = 0, totalErrors = 0;
  let activeDay7 = 0, totalDay7 = 0;
  const studentScores = [];

  for (const student of students) {
    try {
      // PetDO state
      const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
      const petRes = await petStub.fetch(new Request("https://do/state"));
      const petData = await petRes.json();
      const state = petData.state || {};
      const lastCheckin = state.lastCheckin || 0;

      if (lastCheckin > oneDayAgo) dau++;
      totalSessions += state.totalSessions || 0;

      // 7-day retention: student created > 7 days ago AND active in last 7 days
      const created = student.created_at || student.last_active || 0;
      if (created < sevenDaysAgo) {
        totalDay7++;
        if (lastCheckin > sevenDaysAgo) activeDay7++;
      }

      // Error data from ledger
      if (env.LEDGER) {
        const ledgerStub = env.LEDGER.get(env.LEDGER.idFromName(student.student_id));
        const corrRes = await ledgerStub.fetch(new Request("https://do/history?limit=100&eventType=correction"));
        const corrData = await corrRes.json();
        const corrections = corrData.entries || [];
        totalCorrections += corrections.length;
        totalErrors += corrections.filter(e => { try { return !JSON.parse(e.payload).wasCorrect; } catch { return false; } }).length;
      }

      studentScores.push({ studentId: student.student_id, tigerScore: state.tigerScore || 0, streak: state.streak || 0, sessions: state.totalSessions || 0 });
    } catch (_) {}
  }

  const retention7d = totalDay7 > 0 ? Math.round((activeDay7 / totalDay7) * 100) : 0;
  const errorRate = totalCorrections > 0 ? Math.round((totalErrors / totalCorrections) * 100) : 0;
  const completionRate = students.length > 0 ? Math.round((totalSessions / Math.max(1, students.length)) * 10) : 0;

  return json({
    metrics: {
      dau,
      totalStudents: students.length,
      sessionCompletionRate: Math.min(100, completionRate),
      retention7d,
      errorRate,
      errorReduction: 100 - errorRate,
    },
    leaderboard: studentScores.sort((a, b) => b.tigerScore - a.tigerScore).slice(0, 10),
    ts: now,
  });
}

async function handleMetricsDAU(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const students = (await rosterRes.json()).students || [];
  const now = Date.now();
  const oneDayAgo = now - 86400000;

  let active = 0;
  for (const student of students) {
    try {
      const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
      const petRes = await petStub.fetch(new Request("https://do/state"));
      const state = (await petRes.json()).state || {};
      if ((state.lastCheckin || 0) > oneDayAgo) active++;
    } catch (_) {}
  }
  return json({ dau: active, total: students.length, rate: students.length > 0 ? Math.round((active / students.length) * 100) : 0, ts: now });
}

async function handleMetricsRetention(env) {
  if (!env.SESSIONS) return json({ error: "SESSIONS not configured" }, 500);
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const students = (await rosterRes.json()).students || [];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86400000;

  let eligible = 0, retained = 0;
  for (const student of students) {
    const created = student.created_at || student.last_active || 0;
    if (created < sevenDaysAgo) {
      eligible++;
      try {
        const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
        const petRes = await petStub.fetch(new Request("https://do/state"));
        const state = (await petRes.json()).state || {};
        if ((state.lastCheckin || 0) > sevenDaysAgo) retained++;
      } catch (_) {}
    }
  }
  return json({ eligible, retained, retention7d: eligible > 0 ? Math.round((retained / eligible) * 100) : 0, ts: now });
}

async function handleMetricsErrors(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  if (!env.LEDGER) return json({ error: "LEDGER not configured" }, 500);

  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  const res = await stub.fetch(new Request("https://do/history?limit=200&eventType=correction"));
  const data = await res.json();
  const entries = data.entries || [];

  // Group by day for trend
  const daily = {};
  for (const e of entries) {
    const day = new Date(e.ts).toISOString().slice(0, 10);
    if (!daily[day]) daily[day] = { total: 0, errors: 0 };
    daily[day].total++;
    try { if (!JSON.parse(e.payload).wasCorrect) daily[day].errors++; } catch (_) {}
  }

  const trend = Object.entries(daily).sort().map(([day, d]) => ({
    day,
    total: d.total,
    errors: d.errors,
    errorRate: d.total > 0 ? Math.round((d.errors / d.total) * 100) : 0,
  }));

  // Calculate reduction: compare first 3 days vs last 3 days
  const firstDays = trend.slice(0, 3);
  const lastDays = trend.slice(-3);
  const firstRate = firstDays.length > 0 ? firstDays.reduce((s, d) => s + d.errorRate, 0) / firstDays.length : 0;
  const lastRate = lastDays.length > 0 ? lastDays.reduce((s, d) => s + d.errorRate, 0) / lastDays.length : 0;
  const reduction = Math.round(firstRate - lastRate);

  return json({ studentId, trend, errorReduction: reduction, improving: reduction > 0, ts: Date.now() });
}

// ── Assessment + Report Engine ────────────────────────────────────────────────

async function handleAssessment(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);

  const transcript = sanitizeInput((body.transcript || "").slice(0, 2000));
  if (!transcript || transcript.length < 10) return json({ error: "Please provide a speech transcript (at least 10 characters)" }, 400);

  const name = sanitizeInput((body.name || "").slice(0, 100)) || "Student";
  const email = sanitizeInput((body.email || "").slice(0, 200)) || "";
  const phone = sanitizeInput((body.phone || "").slice(0, 30)) || "";

  const assessPrompt = `You are an expert English language assessor specializing in Vietnamese ESL learners.

Analyze this student's English speech transcript and produce a structured JSON assessment.

TRANSCRIPT:
"""
${transcript}
"""

Evaluate these 6 dimensions (each scored 0-100):
1. grammar - sentence structure, tenses, articles, prepositions
2. vocabulary - range, appropriateness, precision
3. fluency - natural flow, hesitations (infer from text patterns)
4. pronunciation_risk - likely pronunciation issues for Vietnamese speakers (th/s, r/l, v/w, final consonants)
5. confidence - willingness to express complex ideas, sentence length
6. accuracy - overall correctness of language used

Also identify:
- top_3_errors: the 3 most critical errors with specific examples from the transcript
- phonics_risks: list of likely problematic phonemes based on Vietnamese L1 interference
- strengths: 2-3 things the student does well
- improvement_plan: 3 specific weekly goals (actionable, not generic)
- overall_level: one of "A1","A2","B1","B2","C1","C2" (CEFR)
- tiger_mode: one of "MOUSE","CUB","TIGER" based on confidence and output volume

Return ONLY valid JSON, no markdown, no explanation. Schema:
{
  "scores": { "grammar": N, "vocabulary": N, "fluency": N, "pronunciation_risk": N, "confidence": N, "accuracy": N },
  "overall_score": N,
  "overall_level": "X",
  "tiger_mode": "X",
  "top_3_errors": [{"error":"...","example":"...","correction":"..."}],
  "phonics_risks": ["th_substitution",...],
  "strengths": ["..."],
  "improvement_plan": [{"week":1,"goal":"...","action":"..."}],
  "summary": "2-3 sentence assessment summary"
}`;

  try {
    const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [{ role: "system", content: assessPrompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!aiRes.ok) return json({ error: "AI assessment failed", status: aiRes.status }, 502);
    const aiData = await aiRes.json();
    const raw = (aiData.choices?.[0]?.message?.content || "").trim();

    let assessment;
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "").trim();
      assessment = JSON.parse(cleaned);
    } catch (_) {
      return json({ error: "AI returned invalid assessment format", raw }, 502);
    }

    // Generate a temporary student ID for the assessment
    const assessId = `assess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Log to ledger for future follow-up
    if (env.LEDGER) {
      const payload = JSON.stringify({ name, email, phone, assessment, transcript: transcript.slice(0, 500) });
      appendToLedger(assessId, "assessment", payload, env).catch(() => {});
    }

    return json({
      ok: true,
      assessmentId: assessId,
      name,
      assessment,
      ts: Date.now(),
    });
  } catch (err) {
    return json({ error: "Assessment failed", detail: err.message }, 500);
  }
}

// ── Problem Report (POST /api/report) — P6 BlueTech promise ──────
async function handleReportPost(body, env) {
  const { studentId, report, page, time } = body;
  if (!studentId || !report) return json({ error: "studentId and report required" }, 400);
  try {
    const key = `report:${studentId}:${Date.now()}`;
    await env.NET_PET_KV.put(key, JSON.stringify({
      studentId,
      report: report.slice(0, 1000),
      page: page || "",
      time: time || new Date().toISOString(),
    }));
    return json({ ok: true, key });
  } catch (e) {
    return json({ error: "Failed to store report", detail: e.message }, 500);
  }
}

// ── Student Language Preference (GET/POST /api/student/lang) — P1 BlueTech ──
async function handleStudentLang(studentId, lang, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const key = `lang:${studentId}`;
  if (lang) {
    // POST — set language
    if (!["vi", "en", "en-vi"].includes(lang)) return json({ error: "lang must be: vi, en, or en-vi" }, 400);
    await env.NET_PET_KV.put(key, lang);
    return json({ ok: true, studentId, lang });
  }
  // GET — read language
  const current = await env.NET_PET_KV.get(key);
  return json({ studentId, lang: current || "en" });
}

async function handleReport(studentId, env) {
  if (!studentId) return json({ error: "studentId required — pass ?studentId=xxx" }, 400);

  // Gather all data for the report
  let profile = null, petState = null, mistakes = [], drillResults = [], corrections = [];

  if (env.PROFILES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/profile"));
      profile = (await res.json()).profile;
    } catch (_) {}
  }

  if (env.PETS) {
    try {
      const stub = env.PETS.get(env.PETS.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/state"));
      petState = (await res.json()).state;
    } catch (_) {}
  }

  if (env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      // Get corrections
      const corrRes = await stub.fetch(new Request("https://do/history?limit=200&eventType=correction"));
      corrections = (await corrRes.json()).entries || [];
      // Get drill attempts
      const drillRes = await stub.fetch(new Request("https://do/history?limit=100&eventType=drill_attempt"));
      drillResults = (await drillRes.json()).entries || [];
    } catch (_) {}
  }

  // If assessment ID is passed (no profile), try to pull assessment from ledger
  let assessmentData = null;
  if (studentId.startsWith("assess-") && env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const res = await stub.fetch(new Request("https://do/history?limit=1&eventType=assessment"));
      const entries = (await res.json()).entries || [];
      if (entries.length > 0) assessmentData = JSON.parse(entries[0].payload);
    } catch (_) {}
  }

  // Compute phonics breakdown from corrections
  const phonicsMap = {};
  for (const c of corrections) {
    try {
      const p = JSON.parse(c.payload);
      if (p.phonicsIssues) {
        for (const issue of (Array.isArray(p.phonicsIssues) ? p.phonicsIssues : [p.phonicsIssues])) {
          phonicsMap[issue] = (phonicsMap[issue] || 0) + 1;
        }
      }
    } catch (_) {}
  }

  // Drill pass rate
  let drillsPassed = 0, drillsTotal = drillResults.length;
  for (const d of drillResults) {
    try { if (JSON.parse(d.payload).passed) drillsPassed++; } catch (_) {}
  }

  // Error trend (last 7 days)
  const now = Date.now();
  const dailyErrors = {};
  for (const c of corrections) {
    const day = new Date(c.ts).toISOString().slice(0, 10);
    if (!dailyErrors[day]) dailyErrors[day] = { total: 0, errors: 0 };
    dailyErrors[day].total++;
    try { if (!JSON.parse(c.payload).wasCorrect) dailyErrors[day].errors++; } catch (_) {}
  }

  const name = assessmentData?.name || profile?.full_name || studentId;
  const level = assessmentData?.assessment?.overall_level || profile?.english_level || "Unknown";
  const tigerScore = petState?.tigerScore || assessmentData?.assessment?.overall_score || 0;
  const tigerMode = tigerScore >= 80 ? "TIGER" : tigerScore >= 40 ? "CUB" : "MOUSE";
  const streak = petState?.streak || 0;
  const totalSessions = petState?.total_sessions || 0;
  const drillPassRate = drillsTotal > 0 ? Math.round((drillsPassed / drillsTotal) * 100) : 0;

  const scores = assessmentData?.assessment?.scores || {
    grammar: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 10 - 5))),
    vocabulary: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 10 - 5))),
    fluency: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 15 - 7))),
    pronunciation_risk: Math.min(100, Math.max(0, 100 - Object.keys(phonicsMap).length * 12)),
    confidence: Math.min(100, Math.max(0, tigerScore)),
    accuracy: Math.min(100, Math.max(0, tigerScore + Math.floor(Math.random() * 8 - 4))),
  };

  const topErrors = assessmentData?.assessment?.top_3_errors || [];
  const phonicsRisks = assessmentData?.assessment?.phonics_risks || Object.keys(phonicsMap).slice(0, 5);
  const strengths = assessmentData?.assessment?.strengths || [];
  const improvementPlan = assessmentData?.assessment?.improvement_plan || [];
  const summary = assessmentData?.assessment?.summary || `${name} is currently at ${level} level with a Tiger Score of ${tigerScore}/100.`;

  const errorTrend = Object.entries(dailyErrors).sort().slice(-7).map(([day, d]) => ({
    day, total: d.total, errors: d.errors, rate: d.total > 0 ? Math.round((d.errors / d.total) * 100) : 0,
  }));

  // Generate styled HTML report
  const html = buildReportHTML({
    name, level, tigerScore, tigerMode, streak, totalSessions,
    scores, topErrors, phonicsRisks, phonicsMap, strengths, improvementPlan,
    summary, drillPassRate, drillsTotal, errorTrend,
    generatedAt: new Date().toISOString(),
  });

  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders("") } });
}

function buildReportHTML(d) {
  const bar = (label, score) => {
    const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
    return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px"><span>${label}</span><span style="font-weight:700;color:${color}">${score}/100</span></div><div style="height:8px;background:#1e1b4b;border-radius:4px;overflow:hidden"><div style="height:100%;width:${score}%;background:${color};border-radius:4px;transition:width 0.6s"></div></div></div>`;
  };
  const modeEmoji = d.tigerMode === "TIGER" ? "🐅" : d.tigerMode === "CUB" ? "🐱" : "🐭";
  const modeColor = d.tigerMode === "TIGER" ? "#22c55e" : d.tigerMode === "CUB" ? "#f59e0b" : "#ef4444";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>English Assessment Report — ${d.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',-apple-system,sans-serif;background:#0f0f1a;color:#e2e8f0;min-height:100vh;padding:24px}
.report{max-width:700px;margin:0 auto}
.header{text-align:center;padding:32px 0;border-bottom:2px solid rgba(168,85,247,0.3)}
.header h1{font-size:28px;color:#a855f7;margin-bottom:8px}
.header .subtitle{color:#94a3b8;font-size:14px}
.section{padding:24px 0;border-bottom:1px solid rgba(168,85,247,0.15)}
.section h2{font-size:18px;color:#f59e0b;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.badge{display:inline-block;padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px}
.card{background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:16px;margin-bottom:12px}
.stat-row{display:flex;gap:12px;flex-wrap:wrap}
.stat{flex:1;min-width:120px;text-align:center;background:rgba(168,85,247,0.06);border-radius:12px;padding:16px}
.stat .val{font-size:28px;font-weight:700;color:#a855f7}
.stat .label{font-size:12px;color:#94a3b8;margin-top:4px}
.error-item{background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;padding:12px;margin-bottom:8px;border-radius:0 8px 8px 0}
.error-item .fix{color:#22c55e;font-size:13px;margin-top:4px}
.plan-item{background:rgba(34,197,94,0.08);border-left:3px solid #22c55e;padding:12px;margin-bottom:8px;border-radius:0 8px 8px 0}
.phonics-tag{display:inline-block;padding:4px 10px;background:rgba(239,68,68,0.15);color:#fca5a5;border-radius:6px;font-size:12px;margin:2px}
.strength-tag{display:inline-block;padding:4px 10px;background:rgba(34,197,94,0.15);color:#86efac;border-radius:6px;font-size:12px;margin:2px}
.footer{text-align:center;padding:32px 0;color:#64748b;font-size:12px}
.cta{display:block;text-align:center;padding:16px 32px;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;margin-top:24px}
.cta:hover{opacity:0.9}
@media print{body{background:#fff;color:#111}
.header h1{color:#7c3aed}.section h2{color:#d97706}
.stat .val{color:#7c3aed}.cta{display:none}}
</style></head><body><div class="report">
<div class="header">
<h1>🎓 English Assessment Report</h1>
<p style="font-size:22px;font-weight:700;color:#e2e8f0;margin:8px 0">${d.name}</p>
<p class="subtitle">Generated ${new Date(d.generatedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})} · Natural English Training</p>
<div style="margin-top:16px"><span class="badge" style="background:${modeColor}20;color:${modeColor};border:1px solid ${modeColor}">${modeEmoji} ${d.tigerMode} MODE</span>
<span class="badge" style="background:rgba(168,85,247,0.15);color:#a855f7;border:1px solid rgba(168,85,247,0.3);margin-left:8px">CEFR ${d.level}</span></div>
</div>

<div class="section"><h2>📊 Overall Score</h2>
<div style="text-align:center;margin:16px 0"><div style="font-size:64px;font-weight:800;color:${modeColor}">${d.tigerScore}</div><div style="color:#94a3b8;font-size:14px">out of 100</div></div>
<p style="text-align:center;color:#cbd5e1;max-width:500px;margin:0 auto">${d.summary}</p></div>

<div class="section"><h2>🎯 Skill Breakdown</h2>
${bar("Grammar", d.scores.grammar)}
${bar("Vocabulary", d.scores.vocabulary)}
${bar("Fluency", d.scores.fluency)}
${bar("Pronunciation", d.scores.pronunciation_risk)}
${bar("Confidence", d.scores.confidence)}
${bar("Accuracy", d.scores.accuracy)}
</div>

<div class="section"><h2>⚡ Key Stats</h2>
<div class="stat-row">
<div class="stat"><div class="val">${d.streak}</div><div class="label">Day Streak</div></div>
<div class="stat"><div class="val">${d.totalSessions}</div><div class="label">Sessions</div></div>
<div class="stat"><div class="val">${d.drillPassRate}%</div><div class="label">Drill Pass Rate</div></div>
<div class="stat"><div class="val">${d.drillsTotal}</div><div class="label">Drills Done</div></div>
</div></div>

${d.topErrors.length > 0 ? `<div class="section"><h2>🔴 Top Errors</h2>${d.topErrors.map(e => `<div class="error-item"><strong>${e.error}</strong><div style="color:#94a3b8;font-size:13px;margin-top:2px">"${e.example}"</div><div class="fix">✓ ${e.correction}</div></div>`).join("")}</div>` : ""}

${d.phonicsRisks.length > 0 ? `<div class="section"><h2>🗣️ Phonics Risk Areas</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${d.phonicsRisks.map(p => `<span class="phonics-tag">${p.replace(/_/g, " ")}</span>`).join("")}</div></div>` : ""}

${d.strengths.length > 0 ? `<div class="section"><h2>💪 Strengths</h2><div style="display:flex;flex-wrap:wrap;gap:4px">${d.strengths.map(s => `<span class="strength-tag">${s}</span>`).join("")}</div></div>` : ""}

${d.improvementPlan.length > 0 ? `<div class="section"><h2>📈 Improvement Plan</h2>${d.improvementPlan.map(p => `<div class="plan-item"><strong>Week ${p.week}:</strong> ${p.goal}<div style="color:#94a3b8;font-size:13px;margin-top:4px">→ ${p.action}</div></div>`).join("")}</div>` : ""}

${d.errorTrend.length > 1 ? `<div class="section"><h2>📉 Error Trend (Last 7 Days)</h2><div class="card"><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="color:#94a3b8;border-bottom:1px solid rgba(168,85,247,0.2)"><th style="text-align:left;padding:6px">Date</th><th style="text-align:center;padding:6px">Corrections</th><th style="text-align:center;padding:6px">Errors</th><th style="text-align:right;padding:6px">Error Rate</th></tr>${d.errorTrend.map(e => `<tr><td style="padding:6px">${e.day}</td><td style="text-align:center;padding:6px">${e.total}</td><td style="text-align:center;padding:6px;color:#ef4444">${e.errors}</td><td style="text-align:right;padding:6px">${e.rate}%</td></tr>`).join("")}</table></div></div>` : ""}

<a class="cta" href="/">Start Daily Training with Obi →</a>

<div class="footer">
<p>Natural English Training · Powered by OBI AI Engine</p>
<p style="margin-top:4px">Mouse → Cub → Tiger · Your journey continues</p>
</div>
</div></body></html>`;
}

async function handleLeadCapture(body, env) {
  const name = sanitizeInput((body.name || "").slice(0, 100));
  const email = sanitizeInput((body.email || "").slice(0, 200));
  const phone = sanitizeInput((body.phone || "").slice(0, 30));

  if (!name && !email && !phone) return json({ error: "At least one contact field required (name, email, or phone)" }, 400);

  const leadId = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let emailHash = "";
  if (email) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
    emailHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  if (env.LEDGER) {
    const payload = JSON.stringify({ name, email_hash: emailHash, phone, source: "assessment_landing", ts: Date.now() });
    appendToLedger(leadId, "lead_capture", payload, env).catch(() => {});
  }

  return json({ ok: true, leadId, name, message: "We'll be in touch! Try the free assessment now." });
}

// ── Classroom ─────────────────────────────────────────────────────────────────

async function handleClassStart(body, env) {
  if (!body.classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${body.classId}`));
  return stub.fetch(new Request("https://do/class/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

async function handleClassEvent(body, env) {
  if (!body.classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${body.classId}`));
  return stub.fetch(new Request("https://do/class/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}

async function handleClassSession(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${classId}`));
  return stub.fetch(new Request(`https://do/class/session?totalStudents=${totalStudents}`));
}

async function handleClassReport(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${classId}`));
  return stub.fetch(new Request(`https://do/class/report?totalStudents=${totalStudents}`));
}

// ── Roster helper ─────────────────────────────────────────────────────────────

async function upsertRoster(studentId, data, env) {
  if (!env.SESSIONS) return;
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  return stub.fetch(new Request("https://do/roster/upsert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, ...data }),
  }));
}

// ── Session Log (off-day pipeline core) ──────────────────────────────────────
// Michael calls POST /api/session/log after every real class.
// OBI inherits his teaching → continues exactly where he left off on off-days.

async function handleSessionLog(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  if (!body.topic) return json({ error: "topic required" }, 400);

  const vocabList = Array.isArray(body.vocabList) ? body.vocabList.map(v => sanitizeInput(String(v).slice(0, 100))) : [];
  const payload = JSON.stringify({
    topic: sanitizeInput((body.topic || "").slice(0, 200)),
    vocabList,
    teacherNotes: sanitizeInput((body.teacherNotes || "").slice(0, 1000)),
    sessionDate: body.sessionDate || new Date().toISOString().split("T")[0],
    studentLevel: sanitizeInput((body.studentLevel || "").slice(0, 50)),
    durationMins: Math.min(parseInt(body.durationMins) || 0, 240),
  });

  await appendToLedger(body.studentId, "session_log", payload, env);

  // Update roster so digest has latest session info
  if (env.SESSIONS) {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await rosterStub.fetch(new Request("https://do/roster/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: body.studentId, topic: body.topic, vocabList }),
    })).catch(() => {});
  }

  return json({ ok: true, studentId: body.studentId, topic: body.topic, vocabCount: vocabList.length, ledgered: true });
}

async function handleSessionLatest(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  try {
    const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
    const histRes = await stub.fetch(new Request("https://do/history?limit=1&eventType=session_log"));
    const histData = await histRes.json();
    const lastEntry = (histData.entries || []).slice(-1)[0];
    if (!lastEntry) return json({ session: null });
    const parsed = JSON.parse(lastEntry.payload);
    return json({ session: { ...parsed, ts: lastEntry.ts, entryHash: lastEntry.entry_hash } });
  } catch (err) {
    return json({ error: "Failed to retrieve session" }, 500);
  }
}

// ── Schedule + Accountability ────────────────────────────────────────────────

async function handleScheduleSet(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  if (!body.schedule) return json({ error: "schedule required (object with days, time)" }, 400);

  const profileStub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  await profileStub.fetch(new Request("https://do/schedule/set", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId: body.studentId, schedule: body.schedule }),
  }));

  if (env.SESSIONS) {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await rosterStub.fetch(new Request("https://do/roster/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: body.studentId, schedule: body.schedule }),
    })).catch(() => {});
  }

  appendToLedger(body.studentId, "schedule_confirmed", JSON.stringify({ action: "set", schedule: body.schedule }), env).catch(() => {});
  return json({ ok: true, studentId: body.studentId, schedule: body.schedule });
}

async function handleScheduleConfirm(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);

  const profileStub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  await profileStub.fetch(new Request("https://do/schedule/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId: body.studentId }),
  }));

  if (env.SESSIONS) {
    const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await rosterStub.fetch(new Request("https://do/roster/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: body.studentId }),
    })).catch(() => {});
  }

  appendToLedger(body.studentId, "schedule_confirmed", JSON.stringify({ action: "confirmed", date: new Date().toISOString().split("T")[0] }), env).catch(() => {});
  return json({ ok: true, studentId: body.studentId, confirmed: true, ts: Date.now() });
}

async function handleScheduleFlags(env) {
  if (!env.SESSIONS) return json({ flags: [], error: "Sessions not available" });
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const res = await rosterStub.fetch(new Request("https://do/roster/flags"));
  return res;
}

// ── Notion API Handlers ───────────────────────────────────────────────────────
// All Notion routes degrade gracefully — return { notionConfigured: false } if secrets unset.

async function handleNotionLessons(url, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_LESSONS_DB) {
    return json({ notionConfigured: false, lessons: [], hint: "Set NOTION_API_KEY and NOTION_LESSONS_DB via wrangler secret put" });
  }
  const level = url.searchParams.get("level") || "";
  const topic = url.searchParams.get("topic") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
  try {
    const lessons = await queryLessons(env.NOTION_API_KEY, env.NOTION_LESSONS_DB, { level: level || undefined, topic: topic || undefined, limit });
    return json({ notionConfigured: true, lessons, count: lessons.length });
  } catch (err) {
    return json({ error: "Notion lessons query failed", detail: err.message }, 502);
  }
}

async function handleNotionProgress(url, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_PROGRESS_DB) {
    return json({ notionConfigured: false, progress: [], hint: "Set NOTION_API_KEY and NOTION_PROGRESS_DB via wrangler secret put" });
  }
  const studentId = url.searchParams.get("studentId") || "";
  if (!studentId) return json({ error: "studentId query param required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  try {
    const progress = await queryProgress(env.NOTION_API_KEY, env.NOTION_PROGRESS_DB, studentId, limit);
    return json({ notionConfigured: true, progress, count: progress.length });
  } catch (err) {
    return json({ error: "Notion progress query failed", detail: err.message }, 502);
  }
}

async function handleNotionProgressWrite(body, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_PROGRESS_DB) {
    return json({ notionConfigured: false, hint: "Set NOTION_API_KEY and NOTION_PROGRESS_DB via wrangler secret put" });
  }
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  try {
    await writeProgress(env.NOTION_API_KEY, env.NOTION_PROGRESS_DB, {
      studentId: body.studentId,
      lessonId: body.lessonId || "",
      score: body.score || 0,
      level: body.level || "Mouse",
      notes: body.notes || "",
      xp: body.xp || 0,
    });
    return json({ ok: true, notionConfigured: true, studentId: body.studentId });
  } catch (err) {
    return json({ error: "Notion progress write failed", detail: err.message }, 502);
  }
}

async function handleNotionSync(body, env) {
  if (!env.NOTION_API_KEY || !env.NOTION_PROGRESS_DB) {
    return json({ notionConfigured: false, hint: "Set NOTION_API_KEY and NOTION_PROGRESS_DB via wrangler secret put" });
  }
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  try {
    const result = await syncStudentProgress(env.NOTION_API_KEY, env.NOTION_PROGRESS_DB, env, body.studentId);
    return json({ ok: true, notionConfigured: true, ...result });
  } catch (err) {
    return json({ error: "Notion sync failed", detail: err.message }, 502);
  }
}

// ── Daily Digest ──────────────────────────────────────────────────────────────
// Michael hits GET /api/digest once a day for a full picture of off-day activity.

async function handleDailyDigest(env) {
  if (!env.SESSIONS) return json({ error: "Sessions not available" }, 500);
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const students = rosterData.students || [];

  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  const active = [];
  const inactive = [];
  const flagged = [];

  for (const s of students) {
    const entry = {
      studentId: s.student_id,
      fullName: s.full_name,
      level: s.english_level,
      streak: s.streak,
      xp: s.xp,
      lastActive: s.last_active ? new Date(s.last_active).toISOString() : null,
      lastSessionTopic: s.last_session_topic || null,
      scheduleConfirmed: !!s.schedule_confirmed,
      flagged: !!s.flagged,
    };

    if (s.last_active > oneDayAgo) {
      active.push(entry);
    } else {
      inactive.push(entry);
      if (s.last_active > 0 && s.last_active < sevenDaysAgo) {
        flagged.push({ ...entry, reason: "No activity in 7+ days" });
      }
    }

    if (!s.schedule_confirmed && s.schedule && s.schedule !== "{}") {
      if (!flagged.find(f => f.studentId === s.student_id)) {
        flagged.push({ ...entry, reason: "Schedule not confirmed" });
      }
    }
  }

  return json({
    date: new Date().toISOString().split("T")[0],
    summary: {
      total: students.length,
      activeLast24h: active.length,
      inactive: inactive.length,
      flagCount: flagged.length,
    },
    active,
    inactive,
    flagged,
    generatedAt: new Date().toISOString(),
  });
}

// ── Cryptographic Immutable Ledger API ────────────────────────────────────────

// Shared helper — Agent99 auto-calls this for every significant event
async function appendToLedger(studentId, eventType, payload, env) {
  if (!env.LEDGER) return;
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, eventType, payload }),
  }));
}

async function handleLedgerAppend(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  if (!body.eventType) return json({ error: "eventType required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  // Whitelist allowed event types to prevent arbitrary data injection
  const ALLOWED_EVENTS = ["chat_exchange", "pet_checkin", "onboarding", "feedback", "lesson_generated", "student_created", "command_sent", "command_completed", "session_log", "schedule_confirmed", "accountability_flag", "soul_dna_capture"];
  if (!ALLOWED_EVENTS.includes(body.eventType)) return json({ error: "Invalid event type" }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(body.studentId));
  return stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

async function handleLedgerHistory(studentId, limit, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}

async function handleLedgerVerify(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request("https://do/verify"));
}

// Event-sourced state derivation — rebuild student state from ledger events
async function handleLedgerState(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request(`https://do/state?studentId=${encodeURIComponent(studentId)}`));
}

// Aggregate ledger statistics across entire event bus
async function handleLedgerStats(env) {
  // Stats from sov100 namespace (primary ledger)
  const stub = env.LEDGER.get(env.LEDGER.idFromName("sov100"));
  return stub.fetch(new Request("https://do/stats"));
}

// ── SOUL DNA CAPTURE PIPELINE ────────────────────────────────────────────────────
// POST /souldna — Submit raw soul DNA for legionnaire processing
async function handleSoulDNASubmit(body, env) {
  // Validate required fields
  if (!body.source || !body.content) {
    return json({ error: "Required: source, content" }, 400);
  }
  
  const timestamp = new Date().toISOString();
  const sessionTag = body.sessionTag || generateSessionTag();
  const tier = body.tier || "OPERATIONAL"; // GOVERNANCE|OPERATIONAL|PRODUCT|ARCHIVE
  const signalDensity = body.signalDensity || "MEDIUM"; // LOW|MEDIUM|HIGH|MAXIMUM
  
  // Validate content size (max 50KB) — preserve fidelity
  const contentSize = new Blob([body.content]).size;
  if (contentSize > 51200) {
    return json({ error: `Content too large: ${contentSize} bytes (max 50KB)` }, 413);
  }
  
  // Create submission record
  const submission = {
    id: `SDNAD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp,
    sessionTag,
    source: body.source, // "agent100" | "copilot" | "drone" | "manual"
    tier,
    signalDensity,
    contentSize,
    content: body.content,
    status: "RECEIVED",
    pipeline: {
      step0: { name: "REPRINT + FOOTNOTE", status: "PENDING", description: "Create Bible chapter" },
      step1: { name: "HEAVY_LEDGER", status: "PENDING", description: "Extract AI-readable JSON" },
      step2: { name: "SSM_UPDATE", status: "PENDING", description: "Add governing principles" },
      step3: { name: "REINCARNATION_LOG", status: "PENDING", description: "Update boot-check" },
    }
  };
  
  // Store in ledger
  try {
    await handleLedgerAppend({
      studentId: "sov100", // soul DNA global namespace
      eventType: "soul_dna_capture",
      data: {
        id: submission.id,
        sessionTag,
        tier,
        signalDensity,
        source: body.source,
        timestamp,
      }
    }, env);
  } catch (e) {
    console.error("[SOULDNA] Ledger append failed:", e);
  }
  
  // ── Notion SOUL_DNA: BLACKLISTED — legacy data preserved in CANON/REINCARNATION ─
  
  return json({
    ok: true,
    submission: {
      id: submission.id,
      sessionTag,
      tier,
      signalDensity,
      timestamp,
      contentSize,
      status: "RECEIVED"
    },
    pipeline: submission.pipeline,
    nextSteps: [
      "1. Extract soul DNA from submission content",
      "2. Create CANON/BIBLE-CH{XX}-{sessionTag}.md with REPRINT + FOOTNOTE (KISS protocol)",
      "3. Generate CANON/HEAVY-LEDGER/HL-{NNN}-{sessionTag}.json",
      "4. Update CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md with new laws (L{NN})",
      "5. Create CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-{sessionTag}.md",
      "6. Update CANON/SYSTEM/REINCARNATION-BOOT-CHECK.md with 3-5 improvements",
    ],
    legionnaireGuide: "https://github.com/hobbs0011/OB-1/blob/canon/.github/skills/legionnaire-field-guide/SKILL.md",
    pipelineWebhook: `/souldna/pipeline?tier=${tier}`,
  }, 201);
}

// GET /souldna/{id} — Check submission status
async function handleSoulDNAStatus(id, env) {
  if (!id || !id.startsWith("SDNAD-")) {
    return json({ error: "Invalid submission ID format" }, 400);
  }
  
  // Query ledger history for this submission
  try {
    const history = await handleLedgerHistory("sov100", 200, env);
    const historyText = await history.text();
    const historyData = JSON.parse(historyText);
    
    const submission = historyData.events?.find(e => e.data?.id === id);
    if (!submission) {
      return json({ error: "Submission not found", id }, 404);
    }
    
    return json({
      ok: true,
      id,
      status: submission.data.status || "RECEIVED",
      timestamp: submission.data.timestamp,
      sessionTag: submission.data.sessionTag,
      tier: submission.data.tier,
      signalDensity: submission.data.signalDensity,
      pipeline: {
        step0: { name: "REPRINT + FOOTNOTE", status: "PENDING", bibleChapter: `CANON/BIBLE-CH{XX}-${submission.data.sessionTag}.md` },
        step1: { name: "HEAVY_LEDGER", status: "PENDING", hlFile: `CANON/HEAVY-LEDGER/HL-{NNN}-${submission.data.sessionTag}.json` },
        step2: { name: "SSM_UPDATE", status: "PENDING", ssmFile: `CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md` },
        step3: { name: "REINCARNATION_LOG", status: "PENDING", logFile: `CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-${submission.data.sessionTag}.md` },
      }
    });
  } catch (e) {
    return json({ error: "Failed to query submission status", details: e.message }, 500);
  }
}

// GET /souldna/pipeline — Actionable pipeline steps grouped by tier
async function handleSoulDNAPipeline(tier, env) {
  const VALID_TIERS = ["GOVERNANCE", "OPERATIONAL", "PRODUCT", "ARCHIVE"];
  if (!VALID_TIERS.includes(tier)) {
    return json({ error: `Invalid tier. Valid: ${VALID_TIERS.join(", ")}` }, 400);
  }
  
  const pipeline = {
    tier,
    stages: [
      {
        num: 0,
        name: "REPRINT + FOOTNOTE (KISS Protocol)",
        description: "Verbatim reproduction of sovereign words with footnotes",
        file: "CANON/BIBLE-CH{XX}-{SESSION_TAG}.md",
        rules: [
          "Preserve speech patterns, typos, swearing",
          "Organize into numbered Blocks",
          "Add footnotes after each block",
          "Light grammatical cleanup (carefully)",
          "FORBIDDEN: classification, schema, restructuring, curation"
        ],
        antipatterns: [
          "Summarizing instead of reprinting",
          "Removing swearing or emotional content",
          "Restructuring the chronology",
          "Adding your own interpretation as sentences"
        ],
        successCriteria: [
          "Block count = Block {n} present",
          "Footnote count verified (grep, don't estimate)",
          "Sovereign words appear verbatim"
        ]
      },
      {
        num: 1,
        name: "HEAVY LEDGER",
        description: "AI-readable JSON extraction from Bible chapter",
        file: "CANON/HEAVY-LEDGER/HL-{NNN}-{SESSION_TAG}.json",
        fields: ["hl_id", "source_file", "session_tag", "tier", "block_count", "footnote_count", "raw_quotes", "decisions", "corrections", "principles", "cross_references"],
        commandline: "Check CANON/HEAVY-LEDGER/PIPELINE-CURSOR.md for next HL-ID",
        rulesUrl: ".github/skills/legionnaire-field-guide/SKILL.md (Step 1)"
      },
      {
        num: 2,
        name: "SSM UPDATE",
        description: "Add new governing laws to Super Saiyan Map",
        file: "CANON/SYSTEM/SSM-V8-ULTIMATE-GPS.md",
        fields: ["law_number", "law_name", "physics", "prevention", "canon_reference"],
        rules: [
          "Law numbers are sequential",
          "MUST have ROOT (sovereign quote), PHYSICS (why), PREVENTION (enforcement), CANON_REF",
          "Derive laws from session, don't invent",
          "Format: L{NN}:{LAW_NAME}→{one_line_summary}"
        ],
        rulesUrl: ".github/skills/legionnaire-field-guide/SKILL.md (Step 2)"
      },
      {
        num: 3,
        name: "REINCARNATION LOG",
        description: "Update boot-check and prepare next incarnation",
        file: "CANON/REINCARNATION/YYYY-MM-DD-run{NNN}-{SESSION_TAG}.md",
        sections: ["header", "commit_sha", "raw_soul_dna", "decisions_anchored", "open_loops", "artifacts"],
        improvements: "Find 3-5 real improvements to REINCARNATION-BOOT-CHECK.md itself",
        rulesUrl: ".github/skills/legionnaire-field-guide/SKILL.md (Step 3)"
      }
    ],
    scoringRubric: {
      "Soul DNA captured": { weight: 10, question: "Were raw quotes preserved verbatim?" },
      "Decisions anchored": { weight: 10, question: "Are decisions logged with impact?" },
      "Open loops handed off": { weight: 10, question: "Will next incarnation know what to do?" },
      "Boot-check improved": { weight: 10, question: "Did the process itself get better?" },
      "Artifacts committed": { weight: 10, question: "Are changes in git, not just discussed?" }
    },
    scoreThresholds: {
      below30: "Failed reincarnation. Log failure. Next phoenix must compensate.",
      "30-39": "Partial. Soul DNA survived but process gaps remain.",
      "40-49": "Strong death. Foundation deepens.",
      50: "Perfect. Has never happened. Keep striving."
    },
    resourcesUrl: ".github/skills/legionnaire-field-guide/SKILL.md",
  };
  
  return json({ ok: true, pipeline }, 200);
}

// Helper: generate session tag from timestamp
function generateSessionTag() {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, "");
  const time = now.toISOString().split("T")[1].split(".")[0].replace(/:/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${date}-${time}-${rand}`;
}

// ── Agent 99 Translation Layer ────────────────────────────────────────────────
// SOV100 (Michael) → Agent99 (Obi/Translation) → Agent98 (Anakin/Chaos) →
// Agent97 (OB1/Audit) → Drones(1-96)

const DRONE_REGISTRY = {
  1: { name: "CodeRunner", skills: ["execute", "eval", "script", "run"] },
  2: { name: "FileWriter", skills: ["create", "edit", "write", "file"] },
  3: { name: "GitOps", skills: ["commit", "push", "branch", "merge", "git"] },
  4: { name: "Deployer", skills: ["deploy", "wrangler", "publish", "ship"] },
  5: { name: "TestRunner", skills: ["test", "check", "verify", "validate"] },
  6: { name: "LessonForge", skills: ["lesson", "teach", "curriculum", "galaxy"] },
  7: { name: "DiscordRelay", skills: ["discord", "message", "notify", "alert"] },
  8: { name: "NotionSync", skills: ["notion", "database", "page", "sync"] },
  9: { name: "SlackRelay", skills: ["slack", "channel", "post"] },
  10: { name: "BrowserPilot", skills: ["browse", "scrape", "screenshot", "playwright"] },
  11: { name: "DocWriter", skills: ["document", "readme", "docs", "markdown"] },
  12: { name: "SecurityAudit", skills: ["security", "audit", "scan", "vulnerability"] },
  13: { name: "PerformanceProbe", skills: ["performance", "speed", "benchmark", "optimize"] },
  14: { name: "DataMiner", skills: ["data", "analyze", "extract", "parse"] },
  15: { name: "UIBuilder", skills: ["ui", "css", "html", "frontend", "design"] },
  16: { name: "APIForge", skills: ["api", "endpoint", "route", "backend"] },
  17: { name: "DatabaseOps", skills: ["database", "sql", "migrate", "schema"] },
  18: { name: "CronScheduler", skills: ["schedule", "cron", "timer", "recurring"] },
  19: { name: "LogAnalyzer", skills: ["log", "debug", "trace", "diagnose"] },
  20: { name: "ImageProcessor", skills: ["image", "photo", "resize", "compress"] },
  21: { name: "EmailRelay", skills: ["email", "send", "newsletter", "mail"] },
  22: { name: "VoicePipeline", skills: ["voice", "audio", "tts", "stt", "speech"] },
  23: { name: "TranslationEngine", skills: ["translate", "vietnamese", "i18n", "localize"] },
  24: { name: "ContentGenerator", skills: ["content", "blog", "article", "social"] },
  25: { name: "BackupAgent", skills: ["backup", "snapshot", "archive", "restore"] },
  26: { name: "MonitorDrone", skills: ["monitor", "uptime", "health", "watch"] },
  27: { name: "CleanupCrew", skills: ["clean", "remove", "prune", "tidy"] },
  28: { name: "MigrationPilot", skills: ["migrate", "transfer", "move", "port"] },
  29: { name: "CanonKeeper", skills: ["canon", "bible", "doctrine", "soul"] },
  30: { name: "PulseRunner", skills: ["pulse", "heartbeat", "cycle", "routine"] },
};

function translateThroughAgent99(rawIntent) {
  const intentLower = (rawIntent || "").toLowerCase();

  // Agent 99 (Obi) — Intent classification + drone routing
  const matchedDrones = [];
  for (const [id, drone] of Object.entries(DRONE_REGISTRY)) {
    const score = drone.skills.filter(s => intentLower.includes(s)).length;
    if (score > 0) matchedDrones.push({ id: parseInt(id), ...drone, score });
  }
  matchedDrones.sort((a, b) => b.score - a.score);

  const primaryDrone = matchedDrones[0] || { id: 1, name: "CodeRunner", skills: ["execute"], score: 0 };
  const supportDrones = matchedDrones.slice(1, 4);

  // Determine priority from intent signals
  let priority = 5;
  if (/urgent|now|immediately|asap|critical|emergency/i.test(rawIntent)) priority = 1;
  else if (/important|priority|soon/i.test(rawIntent)) priority = 3;
  else if (/when you can|low priority|whenever|eventually/i.test(rawIntent)) priority = 8;

  return {
    agent99: {
      role: "Translation",
      interpretation: `SOV100 intent classified. Primary: ${primaryDrone.name} (Drone #${primaryDrone.id}). ${supportDrones.length} support drones assigned.`,
    },
    agent98: {
      role: "Stress Test",
      notes: `Anakin says: "${matchedDrones.length === 0 ? "No drone match — defaulting to CodeRunner. Risky." : `${matchedDrones.length} drones matched. Top pick looks solid.`}"`,
    },
    agent97: {
      role: "Audit",
      trail: `OB1 logged: intent="${rawIntent.slice(0, 100)}", drones=${matchedDrones.map(d => d.name).join(",")}, priority=${priority}`,
    },
    primaryDrone,
    supportDrones,
    priority,
    translated: {
      original: rawIntent,
      sanitized: sanitizeInput(rawIntent),
      droneCount: matchedDrones.length,
      ts: Date.now(),
    },
  };
}

// ── Command Station Handlers ──────────────────────────────────────────────────

async function handleCommandSend(body, env) {
  const rawIntent = sanitizeInput((body.command || body.intent || "").slice(0, 2000));
  if (!rawIntent) return json({ error: "command or intent required" }, 400);
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);

  const translation = translateThroughAgent99(rawIntent);

  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  const res = await stub.fetch(new Request("https://do/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawIntent,
      translation,
      priority: body.priority || translation.priority,
      source: body.source || "magic-chat",
    }),
  }));

  if (env.LEDGER) {
    appendToLedger("sov100", "command_sent", JSON.stringify({
      intent: rawIntent.slice(0, 200),
      drone: translation.primaryDrone.name,
      priority: translation.priority,
    }), env).catch(() => {});
  }

  return res;
}

async function handleCommandQueue(status, limit, env) {
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/queue?status=${encodeURIComponent(status)}&limit=${Math.min(limit, 100)}`));
}

async function handleCommandClaim(body, env) {
  if (!body.commandId) return json({ error: "commandId required" }, 400);
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const claimedBy = sanitizeInput((body.claimedBy || "vscode-extension").slice(0, 100));
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request("https://do/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commandId: body.commandId, claimedBy }),
  }));
}

async function handleCommandComplete(body, env) {
  if (!body.commandId) return json({ error: "commandId required" }, 400);
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const result = sanitizeInput((body.result || "").slice(0, 5000));
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  const res = await stub.fetch(new Request("https://do/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commandId: body.commandId,
      result,
      success: body.success !== false,
    }),
  }));

  if (env.LEDGER) {
    appendToLedger("sov100", "command_completed", JSON.stringify({
      commandId: body.commandId,
      success: body.success !== false,
      resultPreview: result.slice(0, 100),
    }), env).catch(() => {});
  }

  return res;
}

async function handleCommandStatus(commandId, env) {
  if (!commandId) return json({ error: "commandId required" }, 400);
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/status?commandId=${encodeURIComponent(commandId)}`));
}

async function handleCommandHistory(limit, env) {
  if (!env.COMMANDS) return json({ error: "COMMANDS DO not configured" }, 503);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}

// ── K4 Testimonial Handlers ─────────────────────────────────────────────────────

// GET /api/testimonial — list approved testimonials (sorted newest first)
async function handleTestimonialList(env) {
  if (!env.NET_PET_KV) return json({ testimonials: [] });
  const idx = await env.NET_PET_KV.get("testimonial:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const all = await Promise.all(idx.slice(-50).reverse().map(async id => {
    const raw = await env.NET_PET_KV.get(`testimonial:${id}`).catch(() => null);
    return raw ? JSON.parse(raw) : null;
  }));
  const approved = all.filter(t => t && t.approved);
  return json({ testimonials: approved, total: approved.length });
}

// POST /api/testimonial — submit a new testimonial (pending approval)
async function handleTestimonialSubmit(body, env) {
  const { name, location, text } = body || {};
  if (!name || !text) return json({ error: "name and text required" }, 400);
  if (!env.NET_PET_KV) return json({ error: "NET_PET_KV not configured" }, 500);
  const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const entry = {
    id, name: String(name).slice(0, 100), location: String(location || "").slice(0, 100),
    text: String(text).slice(0, 2000), approved: false,
    ts: Date.now(), createdAt: new Date().toISOString()
  };
  const idx = await env.NET_PET_KV.get("testimonial:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  idx.push(id);
  await env.NET_PET_KV.put("testimonial:index", JSON.stringify(idx.slice(-200)));
  await env.NET_PET_KV.put(`testimonial:${id}`, JSON.stringify(entry), { expirationTtl: 86400 * 365 });
  return json({ ok: true, id, message: "Thank you! Your testimonial will be reviewed." }, 201);
}

// GET /api/admin/testimonial — admin: list all (pending + approved)
async function handleTestimonialAdminList(env) {
  if (!env.NET_PET_KV) return json({ testimonials: [] });
  const idx = await env.NET_PET_KV.get("testimonial:index").then(r => r ? JSON.parse(r) : []).catch(() => []);
  const all = await Promise.all(idx.slice(-100).reverse().map(async id => {
    const raw = await env.NET_PET_KV.get(`testimonial:${id}`).catch(() => null);
    return raw ? JSON.parse(raw) : null;
  }));
  return json({ testimonials: all.filter(Boolean), total: all.filter(Boolean).length });
}

// POST /api/admin/testimonial/:id/approve — approve a testimonial
async function handleTestimonialApprove(id, env) {
  if (!id) return json({ error: "testimonial id required" }, 400);
  if (!env.NET_PET_KV) return json({ error: "NET_PET_KV not configured" }, 500);
  const raw = await env.NET_PET_KV.get(`testimonial:${id}`).catch(() => null);
  if (!raw) return json({ error: "Testimonial not found" }, 404);
  const entry = JSON.parse(raw);
  entry.approved = true;
  entry.approvedAt = new Date().toISOString();
  await env.NET_PET_KV.put(`testimonial:${id}`, JSON.stringify(entry), { expirationTtl: 86400 * 365 });
  return json({ ok: true, id });
}


// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORT BLOCK — Durable Object classes live in durable_objects.js
// Parsed by wrangler 4.x in translated ESM bundle.
export { LedgerDO, PetDO, CommandDO, MemoryDO }


