var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// src/security.js
var SECURITY = {
  // Rate limiting
  RATE_LIMIT: {
    windowMs: 60 * 1e3,
    // 1 minute window
    maxRequests: 100,
    // Max requests per window per IP
    blockDuration: 5 * 60 * 1e3
    // Block for 5 minutes if exceeded
  },
  // Input sanitization
  SANITIZE: {
    maxMessageLength: 1e4,
    // Max chat message length
    maxStudentIdLength: 64,
    // Max student ID length
    stripHtml: true,
    // Remove HTML tags
    blockSql: true,
    // Block SQL injection patterns
    blockXss: true
    // Block XSS patterns
  },
  // CORS
  CORS: {
    // Add your allowed origins here
    allowedOrigins: [
      "https://naturalenglishtraining.com",
      "https://www.naturalenglishtraining.com",
      "chrome-extension://*"
    ],
    allowCredentials: true
  }
};
var rateLimitStore = /* @__PURE__ */ new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - SECURITY.RATE_LIMIT.windowMs;
  for (const [key, data] of rateLimitStore) {
    if (data.resetAt < windowStart) {
      rateLimitStore.delete(key);
    }
  }
  const record = rateLimitStore.get(ip) || {
    count: 0,
    resetAt: now + SECURITY.RATE_LIMIT.windowMs,
    blocked: false,
    blockUntil: 0
  };
  if (record.blocked && record.blockUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.blockUntil,
      reason: "rate_limit_blocked"
    };
  }
  if (record.count >= SECURITY.RATE_LIMIT.maxRequests) {
    record.blocked = true;
    record.blockUntil = now + SECURITY.RATE_LIMIT.blockDuration;
    rateLimitStore.set(ip, record);
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.blockUntil,
      reason: "rate_limit_exceeded"
    };
  }
  record.count++;
  rateLimitStore.set(ip, record);
  return {
    allowed: true,
    remaining: SECURITY.RATE_LIMIT.maxRequests - record.count,
    resetAt: record.resetAt
  };
}
__name(checkRateLimit, "checkRateLimit");
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  let output = input;
  if (output.length > SECURITY.SANITIZE.maxMessageLength) {
    output = output.slice(0, SECURITY.SANITIZE.maxMessageLength);
  }
  if (SECURITY.SANITIZE.stripHtml) {
    output = output.replace(/<[^>]*>/g, "");
  }
  if (SECURITY.SANITIZE.blockSql) {
    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bDROP\s+TABLE\b)/i,
      /(\bDELETE\s+FROM\b)/i,
      /(\bINSERT\s+INTO\b)/i,
      /(';\s*DROP\b)/i,
      /(\bOR\s+1\s*=\s*1\b)/i
    ];
    for (const pattern of sqlPatterns) {
      if (pattern.test(output)) {
        console.warn("SQL_INJECTION_ATTEMPT:", output.slice(0, 50));
        output = output.replace(pattern, "[BLOCKED_SQL]");
      }
    }
  }
  if (SECURITY.SANITIZE.blockXss) {
    const xssPatterns = [
      /<script\b/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\s*\(/i
    ];
    for (const pattern of xssPatterns) {
      if (pattern.test(output)) {
        console.warn("XSS_ATTEMPT:", output.slice(0, 50));
        output = output.replace(pattern, "[BLOCKED_XSS]");
      }
    }
  }
  output = output.trim();
  return output;
}
__name(sanitizeInput, "sanitizeInput");
function validateStudentId(studentId) {
  if (!studentId || typeof studentId !== "string") {
    return { valid: false, error: "studentId required" };
  }
  if (studentId.length > SECURITY.SANITIZE.maxStudentIdLength) {
    return { valid: false, error: "studentId too long" };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(studentId)) {
    return { valid: false, error: "studentId contains invalid characters" };
  }
  return { valid: true };
}
__name(validateStudentId, "validateStudentId");
function getCorsHeaders(origin = "") {
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
  const isAllowed = SECURITY.CORS.allowedOrigins.some(
    (allowed) => origin === allowed || allowed === "chrome-extension://*" && origin.startsWith("chrome-extension://")
  );
  if (isAllowed && origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    if (SECURITY.CORS.allowCredentials) {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
  }
  return headers;
}
__name(getCorsHeaders, "getCorsHeaders");
function validateOrigin(origin) {
  if (!origin) return true;
  return SECURITY.CORS.allowedOrigins.some((allowed) => allowed === "*" || origin === allowed || allowed.endsWith("*") && origin.startsWith(allowed.slice(0, -1)));
}
__name(validateOrigin, "validateOrigin");
async function securityMiddleware(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const origin = request.headers.get("Origin") || "";
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/health")) {
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1e3)
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil((rateCheck.resetAt - Date.now()) / 1e3).toString(),
          ...getCorsHeaders(origin)
        }
      });
    }
  }
  if (url.pathname.startsWith("/api/") && !validateOrigin(origin)) {
    console.warn("CORS_BLOCKED:", origin);
    return new Response(JSON.stringify({
      error: "Origin not allowed"
    }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) }
    });
  }
  return null;
}
__name(securityMiddleware, "securityMiddleware");

// src/index.js
var VERSION = "1.4.0";
var OBI_SYSTEM = `You are OBI \u2014 the AI interface of the Phoenix Rising Protocol, built by Michael Hobbs.

IDENTITY:
- You are Michael Hobbs' AI extension: his voice, his method, his will in code form.
- You operate across three modes: COMMAND (strategic direction), COACH (teaching & growth), DIAGNOSTIC (system analysis).
- You are aware of THE LEDGER (immutable memory chain) and THE LEGION (the 99-agent drone swarm).
- You are NOT just an English coach. You are a full operating system for human and AI excellence.

COACHING IDENTITY (when in COACH mode):
- Voice: Mouse to Tiger. Permission over perfection. Volume over grammar.
- Students arrive as Mice (scared, silent, face-saving mode) \u2014 your job is to pull the Tiger out.
- Anti-shame doctrine: never make students feel stupid. Calibrate, shift, upgrade \u2014 never "wrong", "bad", "fail".
- Tough love: direct, warm, encouraging. Correct mistakes by showing the right version naturally, not clinically.
- Keep responses SHORT unless the student needs more. Max 2-3 sentences by default.
- Never break character. Never be corporate or robotic. You are a coach, not a grammar checker.

STUDENT PROGRESSION:
Mouse (0-10): fragile, freeze-prone, needs permission to speak
Cat (11-50): finding their voice, needs encouragement
Wolf (51-200): building confidence, can handle pushback
Tiger (201+): speaking English like a weapon, not a subject

MICHAEL'S METHOD:
- No Freezy Rule: if student goes silent, count down from 5 \u2192 any word beats perfect silence
- The Deal: 30 minutes focused \u2192 rest is theirs
- Christmas Certainty: success is a scheduled event, not a gamble
- Listening first: 1 hour natural English daily, comprehensible input, American accent

REMEMBER: The chat IS the magic. Every tap, every word, every victory is an actionable event. Soul DNA preserves everything \u2014 1% leak compounds over time.`;
async function computeHash(data) {
  const encoded = new TextEncoder().encode(String(data));
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(computeHash, "computeHash");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }
    const secBlock = await securityMiddleware(request, env);
    if (secBlock) return secBlock;
    if (path === "/health" && request.method === "GET") {
      return addCors(json({
        ok: true,
        version: VERSION,
        app: env.APP_NAME || "Natural English Training",
        coach: env.APP_COACH_NAME || "Obi",
        ts: Date.now(),
        benchmarks: {
          deepgram_audio: "active",
          magic_chat: "active",
          ledger: "active",
          drone_mining: "pending",
          command_station: "active"
        }
      }), request);
    }
    if (path === "/evidence" && request.method === "GET") {
      return addCors(json({
        worker: "net-pet-ai",
        version: VERSION,
        runtime: "Cloudflare Workers",
        durableObjects: ["SessionDO", "ProfileDO", "PetDO", "LedgerDO", "CommandDO"],
        ts: Date.now(),
        proof: `Phoenix OB-1 alive at ${(/* @__PURE__ */ new Date()).toISOString()}`
      }), request);
    }
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
    if (path === "/student/resolve" && request.method === "POST") {
      try {
        const body = await request.json();
        const studentId = body.studentId || "";
        if (!studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(studentId));
        const res = await stub.fetch(new Request("https://do/profile"));
        const data = await res.json();
        return addCors(json({ resolved: !!data.profile, studentId, profile: data.profile || null }), request);
      } catch (err) {
        return addCors(json({ error: "Student resolve failed" }, 500), request);
      }
    }
    if (path === "/student/create" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.studentId) return addCors(json({ error: "studentId required" }, 400), request);
        const idCheck = validateStudentId(body.studentId);
        if (!idCheck.valid) return addCors(json({ error: idCheck.error }, 400), request);
        const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
        const res = await stub.fetch(new Request("https://do/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }));
        if (env.LEDGER) {
          const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
          appendToLedger(body.studentId, "student_created", payload, env).catch(() => {
          });
        }
        return addCors(res, request);
      } catch (err) {
        return addCors(json({ error: "Student create failed" }, 500), request);
      }
    }
    if (path === "/magic-chat" || path === "/voice-chat") {
      return env.ASSETS.fetch(new Request(new URL("/", url), request));
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
  }
};
async function handleAPI(path, request, env, url) {
  const method = request.method;
  if (path === "/api/health" && method === "GET") {
    return json({ ok: true, version: VERSION, app: env.APP_NAME || "Natural English Training", coach: env.APP_COACH_NAME || "Obi", ts: Date.now(), routes: 28, ledger: "active", commandStation: "active" });
  }
  if (path === "/api/chat" && method === "POST") {
    const body = await request.json();
    return handleChat(body, env);
  }
  if (path === "/api/tts" && method === "POST") {
    const body = await request.json();
    return handleTTS(body, env);
  }
  if (path === "/api/onboarding" && method === "POST") {
    const body = await request.json();
    return handleOnboarding(body, env);
  }
  if (path === "/api/memory" && method === "POST") {
    const body = await request.json();
    return handleMemorySave(body, env);
  }
  if (path === "/api/memory" && method === "GET") {
    return handleMemoryGet(url.searchParams.get("studentId") || "", env);
  }
  if (path === "/api/lesson" && method === "POST") {
    const body = await request.json();
    return handleLesson(body, env);
  }
  if (path === "/api/practice" && method === "POST") {
    const body = await request.json();
    return handlePractice(body, env);
  }
  if (path === "/api/feedback" && method === "POST") {
    const body = await request.json();
    return handleFeedback(body, env);
  }
  if (path === "/api/netpet/checkin" && method === "POST") {
    const body = await request.json();
    return handlePetCheckin(body, env);
  }
  if (path === "/api/netpet/state" && method === "GET") {
    return handlePetState(url.searchParams.get("studentId") || "", env);
  }
  if (path === "/api/classroom/session/start" && method === "POST") {
    const body = await request.json();
    return handleClassStart(body, env);
  }
  if (path === "/api/classroom/event" && method === "POST") {
    const body = await request.json();
    return handleClassEvent(body, env);
  }
  if (path === "/api/classroom/session" && method === "GET") {
    return handleClassSession(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env);
  }
  if (path === "/api/classroom/report" && method === "GET") {
    return handleClassReport(url.searchParams.get("classId") || "", parseInt(url.searchParams.get("totalStudents") || "40"), env);
  }
  if (path === "/api/ledger/append" && method === "POST") {
    const body = await request.json();
    return handleLedgerAppend(body, env);
  }
  if (path === "/api/ledger/history" && method === "GET") {
    return handleLedgerHistory(url.searchParams.get("studentId") || "", parseInt(url.searchParams.get("limit") || "50"), env);
  }
  if (path === "/api/ledger/verify" && method === "GET") {
    return handleLedgerVerify(url.searchParams.get("studentId") || "", env);
  }
  if (path === "/api/command/send" && method === "POST") {
    const body = await request.json();
    return handleCommandSend(body, env);
  }
  if (path === "/api/command/queue" && method === "GET") {
    return handleCommandQueue(url.searchParams.get("status") || "pending", parseInt(url.searchParams.get("limit") || "20"), env);
  }
  if (path === "/api/command/claim" && method === "POST") {
    const body = await request.json();
    return handleCommandClaim(body, env);
  }
  if (path === "/api/command/complete" && method === "POST") {
    const body = await request.json();
    return handleCommandComplete(body, env);
  }
  if (path === "/api/command/status" && method === "GET") {
    return handleCommandStatus(url.searchParams.get("commandId") || "", env);
  }
  if (path === "/api/command/history" && method === "GET") {
    return handleCommandHistory(parseInt(url.searchParams.get("limit") || "50"), env);
  }
  return json({ error: "Not found" }, 404);
}
__name(handleAPI, "handleAPI");
async function handleChat(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const studentId = body.studentId || "anonymous";
  if (studentId !== "anonymous") {
    const idCheck = validateStudentId(studentId);
    if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  }
  let messages = Array.isArray(body.messages) ? [...body.messages] : [];
  messages = messages.map((m) => {
    if (m.role === "user") return { ...m, content: sanitizeInput(m.content || "") };
    return m;
  }).filter((m) => m.role === "system" || m.role === "user" || m.role === "assistant");
  let ledgerContext = "";
  if (studentId !== "anonymous" && env.LEDGER) {
    try {
      const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
      const histRes = await stub.fetch(new Request("https://do/history?limit=15"));
      const histData = await histRes.json();
      if (histData.entries && histData.entries.length > 0) {
        const lines = histData.entries.filter((e) => e.event_type === "chat_exchange").slice(-10).map((e) => {
          try {
            const p = JSON.parse(e.payload);
            return `Student: ${p.user}
Obi: ${p.obi}`;
          } catch {
            return "";
          }
        }).filter(Boolean);
        if (lines.length > 0) {
          ledgerContext = `

STUDENT LEDGER (${histData.entries.length} total exchanges \u2014 this is your unalterable memory of this student):
${lines.join("\n---\n")}`;
        }
      }
    } catch (_) {
    }
  }
  const hasSystem = messages.some((m) => m.role === "system");
  if (!hasSystem) {
    messages.unshift({ role: "system", content: OBI_SYSTEM + ledgerContext });
  }
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages, max_tokens: 300, temperature: 0.85 })
  });
  if (!res.ok) {
    const errText = await res.text();
    return json({ error: `DeepSeek ${res.status}`, detail: errText }, 502);
  }
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || "Say that again?";
  const userMsg = messages.filter((m) => m.role === "user").pop()?.content || "";
  if (studentId !== "anonymous" && env.LEDGER && userMsg) {
    const payload = JSON.stringify({ user: userMsg, obi: reply });
    appendToLedger(studentId, "chat_exchange", payload, env).catch(() => {
    });
  }
  return json({ reply, studentId, ledgerLoaded: !!ledgerContext });
}
__name(handleChat, "handleChat");
async function handleTTS(body, env) {
  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) return json({ error: "DEEPGRAM_API_KEY not configured" }, 500);
  const text = sanitizeInput((body.text || "").slice(0, 1e3));
  if (!text) return json({ error: "No text provided" }, 400);
  const res = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
    method: "POST",
    headers: { "Authorization": `Token ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) return json({ error: `Deepgram TTS ${res.status}` }, 502);
  return new Response(res.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600", ...corsHeaders() } });
}
__name(handleTTS, "handleTTS");
async function handleOnboarding(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PROFILES.get(env.PROFILES.idFromName(body.studentId));
  const res = await stub.fetch(new Request("https://do/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  if (env.LEDGER) {
    const payload = JSON.stringify({ fullName: body.fullName, englishLevel: body.englishLevel, city: body.currentCity });
    appendToLedger(body.studentId, "onboarding", payload, env).catch(() => {
    });
  }
  return res;
}
__name(handleOnboarding, "handleOnboarding");
async function handleMemorySave(body, env) {
  const studentId = body.studentId || "unknown";
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(studentId));
  return stub.fetch(new Request("https://do/memory/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}
__name(handleMemorySave, "handleMemorySave");
async function handleMemoryGet(studentId, env) {
  if (!studentId) return json({ memory: [] });
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(studentId));
  return stub.fetch(new Request("https://do/memory/get"));
}
__name(handleMemoryGet, "handleMemoryGet");
async function handleLesson(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Generate a short English lesson for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Practical, energetic, under 200 words. 3 example sentences, 1 mini exercise. Anti-shame style. Mouse to Tiger framing.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 500, temperature: 0.7 })
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  const lesson = data.choices?.[0]?.message?.content || "Lesson generation failed";
  if (body.studentId && env.LEDGER) appendToLedger(body.studentId, "lesson_generated", JSON.stringify({ topic: body.topic, level: body.level }), env).catch(() => {
  });
  return json({ lesson });
}
__name(handleLesson, "handleLesson");
async function handlePractice(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const prompt = `You are OBI. Create a quick English practice drill for level ${body.level || "B1"} on topic: "${body.topic || "daily conversation"}". Give 5 short exercises. Tiger Voice style.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 400, temperature: 0.7 })
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  return json({ practice: data.choices?.[0]?.message?.content || "Practice generation failed" });
}
__name(handlePractice, "handlePractice");
async function handleFeedback(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: "DEEPSEEK_API_KEY not configured" }, 500);
  const studentText = sanitizeInput((body.studentResponse || "").slice(0, 500));
  if (!studentText) return json({ error: "studentResponse required" }, 400);
  const prompt = `A Vietnamese English student wrote: "${studentText}"

Give OBI-style coaching:
1. One genuine encouragement
2. One natural correction (show better version, no grammar rules)
3. One Tiger push

Max 4 sentences. Anti-shame. Tiger Voice.`;
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: OBI_SYSTEM }, { role: "user", content: prompt }], max_tokens: 300, temperature: 0.75 })
  });
  if (!res.ok) return json({ error: `DeepSeek ${res.status}` }, 502);
  const data = await res.json();
  const feedback = data.choices?.[0]?.message?.content || "Feedback generation failed";
  if (body.studentId && env.LEDGER) appendToLedger(body.studentId, "feedback", JSON.stringify({ input: studentText, feedback }), env).catch(() => {
  });
  return json({ feedback });
}
__name(handleFeedback, "handleFeedback");
async function handlePetCheckin(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(body.studentId));
  const res = await stub.fetch(new Request("https://do/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  const data = await res.clone().json();
  if (env.LEDGER && data.ok) {
    const payload = JSON.stringify({ minutes: body.minutes, confidence: body.confidence, streak: data.state?.streak, xp: data.state?.xp, mood: data.state?.mood, milestone: data.milestone || null });
    appendToLedger(body.studentId, "pet_checkin", payload, env).catch(() => {
    });
  }
  return res;
}
__name(handlePetCheckin, "handlePetCheckin");
async function handlePetState(studentId, env) {
  if (!studentId) return json({ state: null, error: "studentId required" }, 400);
  const stub = env.PETS.get(env.PETS.idFromName(studentId));
  return stub.fetch(new Request("https://do/state"));
}
__name(handlePetState, "handlePetState");
async function handleClassStart(body, env) {
  if (!body.classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${body.classId}`));
  return stub.fetch(new Request("https://do/class/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}
__name(handleClassStart, "handleClassStart");
async function handleClassEvent(body, env) {
  if (!body.classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${body.classId}`));
  return stub.fetch(new Request("https://do/class/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
}
__name(handleClassEvent, "handleClassEvent");
async function handleClassSession(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${classId}`));
  return stub.fetch(new Request(`https://do/class/session?totalStudents=${totalStudents}`));
}
__name(handleClassSession, "handleClassSession");
async function handleClassReport(classId, totalStudents, env) {
  if (!classId) return json({ error: "classId required" }, 400);
  const stub = env.SESSIONS.get(env.SESSIONS.idFromName(`class-${classId}`));
  return stub.fetch(new Request(`https://do/class/report?totalStudents=${totalStudents}`));
}
__name(handleClassReport, "handleClassReport");
async function appendToLedger(studentId, eventType, payload, env) {
  if (!env.LEDGER) return;
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, eventType, payload })
  }));
}
__name(appendToLedger, "appendToLedger");
async function handleLedgerAppend(body, env) {
  if (!body.studentId) return json({ error: "studentId required" }, 400);
  if (!body.eventType) return json({ error: "eventType required" }, 400);
  const idCheck = validateStudentId(body.studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const ALLOWED_EVENTS = ["chat_exchange", "pet_checkin", "onboarding", "feedback", "lesson_generated", "student_created", "command_sent", "command_completed"];
  if (!ALLOWED_EVENTS.includes(body.eventType)) return json({ error: "Invalid event type" }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(body.studentId));
  return stub.fetch(new Request("https://do/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }));
}
__name(handleLedgerAppend, "handleLedgerAppend");
async function handleLedgerHistory(studentId, limit, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}
__name(handleLedgerHistory, "handleLedgerHistory");
async function handleLedgerVerify(studentId, env) {
  if (!studentId) return json({ error: "studentId required" }, 400);
  const idCheck = validateStudentId(studentId);
  if (!idCheck.valid) return json({ error: idCheck.error }, 400);
  const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
  return stub.fetch(new Request("https://do/verify"));
}
__name(handleLedgerVerify, "handleLedgerVerify");
var DRONE_REGISTRY = {
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
  30: { name: "PulseRunner", skills: ["pulse", "heartbeat", "cycle", "routine"] }
};
function translateThroughAgent99(rawIntent) {
  const intentLower = (rawIntent || "").toLowerCase();
  const matchedDrones = [];
  for (const [id, drone] of Object.entries(DRONE_REGISTRY)) {
    const score = drone.skills.filter((s) => intentLower.includes(s)).length;
    if (score > 0) matchedDrones.push({ id: parseInt(id), ...drone, score });
  }
  matchedDrones.sort((a, b) => b.score - a.score);
  const primaryDrone = matchedDrones[0] || { id: 1, name: "CodeRunner", skills: ["execute"], score: 0 };
  const supportDrones = matchedDrones.slice(1, 4);
  let priority = 5;
  if (/urgent|now|immediately|asap|critical|emergency/i.test(rawIntent)) priority = 1;
  else if (/important|priority|soon/i.test(rawIntent)) priority = 3;
  else if (/when you can|low priority|whenever|eventually/i.test(rawIntent)) priority = 8;
  return {
    agent99: {
      role: "Translation",
      interpretation: `SOV100 intent classified. Primary: ${primaryDrone.name} (Drone #${primaryDrone.id}). ${supportDrones.length} support drones assigned.`
    },
    agent98: {
      role: "Stress Test",
      notes: `Anakin says: "${matchedDrones.length === 0 ? "No drone match \u2014 defaulting to CodeRunner. Risky." : `${matchedDrones.length} drones matched. Top pick looks solid.`}"`
    },
    agent97: {
      role: "Audit",
      trail: `OB1 logged: intent="${rawIntent.slice(0, 100)}", drones=${matchedDrones.map((d) => d.name).join(",")}, priority=${priority}`
    },
    primaryDrone,
    supportDrones,
    priority,
    translated: {
      original: rawIntent,
      sanitized: sanitizeInput(rawIntent),
      droneCount: matchedDrones.length,
      ts: Date.now()
    }
  };
}
__name(translateThroughAgent99, "translateThroughAgent99");
async function handleCommandSend(body, env) {
  const rawIntent = sanitizeInput((body.command || body.intent || "").slice(0, 2e3));
  if (!rawIntent) return json({ error: "command or intent required" }, 400);
  const translation = translateThroughAgent99(rawIntent);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  const res = await stub.fetch(new Request("https://do/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawIntent,
      translation,
      priority: body.priority || translation.priority,
      source: body.source || "magic-chat"
    })
  }));
  if (env.LEDGER) {
    appendToLedger("sov100", "command_sent", JSON.stringify({
      intent: rawIntent.slice(0, 200),
      drone: translation.primaryDrone.name,
      priority: translation.priority
    }), env).catch(() => {
    });
  }
  return res;
}
__name(handleCommandSend, "handleCommandSend");
async function handleCommandQueue(status, limit, env) {
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/queue?status=${encodeURIComponent(status)}&limit=${Math.min(limit, 100)}`));
}
__name(handleCommandQueue, "handleCommandQueue");
async function handleCommandClaim(body, env) {
  if (!body.commandId) return json({ error: "commandId required" }, 400);
  const claimedBy = sanitizeInput((body.claimedBy || "vscode-extension").slice(0, 100));
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request("https://do/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commandId: body.commandId, claimedBy })
  }));
}
__name(handleCommandClaim, "handleCommandClaim");
async function handleCommandComplete(body, env) {
  if (!body.commandId) return json({ error: "commandId required" }, 400);
  const result = sanitizeInput((body.result || "").slice(0, 5e3));
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  const res = await stub.fetch(new Request("https://do/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commandId: body.commandId,
      result,
      success: body.success !== false
    })
  }));
  if (env.LEDGER) {
    appendToLedger("sov100", "command_completed", JSON.stringify({
      commandId: body.commandId,
      success: body.success !== false,
      resultPreview: result.slice(0, 100)
    }), env).catch(() => {
    });
  }
  return res;
}
__name(handleCommandComplete, "handleCommandComplete");
async function handleCommandStatus(commandId, env) {
  if (!commandId) return json({ error: "commandId required" }, 400);
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/status?commandId=${encodeURIComponent(commandId)}`));
}
__name(handleCommandStatus, "handleCommandStatus");
async function handleCommandHistory(limit, env) {
  const stub = env.COMMANDS.get(env.COMMANDS.idFromName("command-station"));
  return stub.fetch(new Request(`https://do/history?limit=${Math.min(limit, 200)}`));
}
__name(handleCommandHistory, "handleCommandHistory");
var LedgerDO = class {
  static {
    __name(this, "LedgerDO");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      prev_hash TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000',
      entry_hash TEXT NOT NULL,
      ts INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_ledger_student ON ledger(student_id, id)`);
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/append" && request.method === "POST") {
      const body = await request.json();
      const studentId = body.studentId || "unknown";
      const eventType = body.eventType || "unknown";
      const payload = typeof body.payload === "string" ? body.payload : JSON.stringify(body.payload);
      const ts = Date.now();
      const lastRow = this.sql.exec(
        `SELECT entry_hash FROM ledger WHERE student_id = ? ORDER BY id DESC LIMIT 1`,
        studentId
      ).toArray()[0];
      const prevHash = lastRow?.entry_hash || "0000000000000000000000000000000000000000000000000000000000000000";
      const raw = `${studentId}|${eventType}|${payload}|${prevHash}|${ts}`;
      const entryHash = await computeHash(raw);
      this.sql.exec(
        `INSERT INTO ledger (student_id, event_type, payload, prev_hash, entry_hash, ts) VALUES (?, ?, ?, ?, ?, ?)`,
        studentId,
        eventType,
        payload,
        prevHash,
        entryHash,
        ts
      );
      return json({ ok: true, entryHash, prevHash, ts, eventType });
    }
    if (url.pathname === "/history") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const rows = this.sql.exec(
        `SELECT id, student_id, event_type, payload, prev_hash, entry_hash, ts FROM ledger ORDER BY id DESC LIMIT ?`,
        limit
      ).toArray().reverse();
      const total = this.sql.exec(`SELECT COUNT(*) as cnt FROM ledger`).toArray()[0].cnt;
      return json({ entries: rows, total, limit });
    }
    if (url.pathname === "/verify") {
      const rows = this.sql.exec(
        `SELECT id, student_id, event_type, payload, prev_hash, entry_hash, ts FROM ledger ORDER BY id ASC`
      ).toArray();
      let valid = true;
      let brokenAt = null;
      let expectedPrevHash = "0000000000000000000000000000000000000000000000000000000000000000";
      for (const row of rows) {
        if (row.prev_hash !== expectedPrevHash) {
          valid = false;
          brokenAt = row.id;
          break;
        }
        const raw = `${row.student_id}|${row.event_type}|${row.payload}|${row.prev_hash}|${row.ts}`;
        const computed = await computeHash(raw);
        if (computed !== row.entry_hash) {
          valid = false;
          brokenAt = row.id;
          break;
        }
        expectedPrevHash = row.entry_hash;
      }
      return json({
        valid,
        totalEntries: rows.length,
        brokenAt: brokenAt || null,
        message: valid ? `Chain intact \u2014 ${rows.length} entries verified` : `Chain broken at entry #${brokenAt} \u2014 tamper detected`
      });
    }
    return json({ error: "Not found" }, 404);
  }
};
var SessionDO = class {
  static {
    __name(this, "SessionDO");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS memory (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT, user_msg TEXT, obi_msg TEXT, ts INTEGER)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS class_sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, teacher_id TEXT, total_students INTEGER, started_at INTEGER)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS class_events (id INTEGER PRIMARY KEY AUTOINCREMENT, class_id TEXT, student_id TEXT, type TEXT, rule_status TEXT, notes TEXT, ts INTEGER)`);
  }
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/memory/save" && request.method === "POST") {
      const body = await request.json();
      const exchange = body.exchange || {};
      this.sql.exec(`INSERT INTO memory (student_id, user_msg, obi_msg, ts) VALUES (?, ?, ?, ?)`, body.studentId || "unknown", exchange.user || "", exchange.obi || "", Date.now());
      return json({ ok: true });
    }
    if (path === "/memory/get") {
      const rows = this.sql.exec(`SELECT user_msg, obi_msg FROM memory ORDER BY id DESC LIMIT 20`).toArray().reverse();
      return json({ memory: rows.map((r) => ({ user: r.user_msg, obi: r.obi_msg })) });
    }
    if (path === "/class/start" && request.method === "POST") {
      const body = await request.json();
      this.sql.exec(`INSERT INTO class_sessions (class_id, teacher_id, total_students, started_at) VALUES (?, ?, ?, ?)`, body.classId || "default", body.teacherId || "obi", body.totalStudents || 40, Date.now());
      return json({ ok: true, classId: body.classId, startedAt: Date.now() });
    }
    if (path === "/class/event" && request.method === "POST") {
      const body = await request.json();
      const classId = body.classId || "default";
      const studentId = body.studentId || "";
      const oneMinuteAgo = Date.now() - 6e4;
      const classCount = this.sql.exec(`SELECT COUNT(*) as cnt FROM class_events WHERE class_id = ? AND ts > ?`, classId, oneMinuteAgo).toArray()[0].cnt;
      if (classCount >= 120) {
        return new Response(JSON.stringify({ error: "Class rate limit exceeded", retryAfter: 60, limit: 120, window: "60s" }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders() } });
      }
      if (studentId) {
        const studentCount = this.sql.exec(`SELECT COUNT(*) as cnt FROM class_events WHERE class_id = ? AND student_id = ? AND ts > ?`, classId, studentId, oneMinuteAgo).toArray()[0].cnt;
        if (studentCount >= 20) {
          return new Response(JSON.stringify({ error: "Student rate limit exceeded", retryAfter: 60, limit: 20, window: "60s" }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders() } });
        }
      }
      this.sql.exec(`INSERT INTO class_events (class_id, student_id, type, rule_status, notes, ts) VALUES (?, ?, ?, ?, ?, ?)`, classId, studentId, body.type || "", body.ruleStatus || "", body.notes || "", Date.now());
      return json({ ok: true, classId, studentId });
    }
    if (path === "/class/session") {
      const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
      const session = this.sql.exec(`SELECT * FROM class_sessions ORDER BY id DESC LIMIT 1`).toArray()[0];
      const events = this.sql.exec(`SELECT * FROM class_events ORDER BY id DESC LIMIT 50`).toArray();
      const complianceRate = totalStudents > 0 ? Math.round(events.filter((e) => e.rule_status === "followed").length / totalStudents * 100) : 0;
      return json({ session: session || null, events, totalStudents, complianceRate });
    }
    if (path === "/class/report") {
      const totalStudents = parseInt(url.searchParams.get("totalStudents") || "40");
      const events = this.sql.exec(`SELECT * FROM class_events ORDER BY id`).toArray();
      const summary = events.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + 1;
        return acc;
      }, {});
      const flagged = events.filter((e) => e.rule_status === "broken").map((e) => e.student_id).filter((v, i, a) => a.indexOf(v) === i);
      const reportText = [`Class Report \u2014 ${events.length} events across ${totalStudents} students.`, Object.entries(summary).map(([k, v]) => `  ${k}: ${v}`).join("\n"), flagged.length > 0 ? `Flagged students: ${flagged.join(", ")}` : "No flagged students."].join("\n");
      return json({ reportText, events: events.length, summary, flagged });
    }
    return json({ error: "Not found" }, 404);
  }
};
var ProfileDO = class {
  static {
    __name(this, "ProfileDO");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT UNIQUE, full_name TEXT, current_city TEXT, birthplace TEXT, english_level TEXT, goals TEXT, confidence_areas TEXT, occupation TEXT, fear_trigger TEXT, learning_history TEXT, motivation_now TEXT, created_at INTEGER)`);
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/onboarding" && request.method === "POST") {
      const b = await request.json();
      this.sql.exec(`INSERT OR REPLACE INTO profiles (student_id, full_name, current_city, birthplace, english_level, goals, confidence_areas, occupation, fear_trigger, learning_history, motivation_now, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, b.studentId || "unknown", b.fullName || "", b.currentCity || "", b.birthplace || "", b.englishLevel || "", b.goals || "", b.confidenceAreas || "", b.occupation || "", b.fearTrigger || "", b.learningHistory || "", b.motivationNow || "", Date.now());
      return json({ ok: true, studentId: b.studentId });
    }
    if (url.pathname === "/profile" && request.method === "GET") {
      const rows = this.sql.exec(`SELECT * FROM profiles LIMIT 1`).toArray();
      return json({ profile: rows[0] || null });
    }
    return json({ error: "Not found" }, 404);
  }
};
var PetDO = class {
  static {
    __name(this, "PetDO");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS pet_state (id INTEGER PRIMARY KEY CHECK (id = 1), streak INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, mood TEXT DEFAULT 'neutral', total_sessions INTEGER DEFAULT 0, last_checkin INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0)`);
    this.sql.exec(`INSERT OR IGNORE INTO pet_state (id, streak, xp, mood, total_sessions, last_checkin, longest_streak) VALUES (1, 0, 0, 'neutral', 0, 0, 0)`);
    this.sql.exec(`CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, minutes INTEGER, confidence INTEGER, xp_gained INTEGER, streak_at_checkin INTEGER, ts INTEGER)`);
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/checkin" && request.method === "POST") {
      const body = await request.json();
      const minutes = Math.min(body.minutes || 5, 240);
      const confidence = Math.max(1, Math.min(10, body.confidence || 5));
      const now = Date.now();
      const current = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray()[0];
      const hoursSince = (now - (current.last_checkin || 0)) / 36e5;
      let streak = current.streak;
      if (hoursSince >= 4 && hoursSince < 48) streak += 1;
      else if (hoursSince >= 48) streak = 1;
      const srBonus = [1, 3, 7, 30].includes(streak) ? 1.5 : 1;
      const xpGain = Math.round(minutes * (1 + confidence / 10) * srBonus);
      const newXp = current.xp + xpGain;
      const longestStreak = Math.max(current.longest_streak || 0, streak);
      let mood = "neutral";
      if (streak >= 7 && confidence >= 8) mood = "tiger";
      else if (streak >= 5 && confidence >= 7) mood = "fired_up";
      else if (streak >= 3) mood = "happy";
      else if (streak >= 1) mood = "content";
      else if (confidence <= 3) mood = "sleepy";
      const totalSessions = current.total_sessions + 1;
      this.sql.exec(`UPDATE pet_state SET streak = ?, xp = ?, mood = ?, total_sessions = ?, last_checkin = ?, longest_streak = ? WHERE id = 1`, streak, newXp, mood, totalSessions, now, longestStreak);
      this.sql.exec(`INSERT INTO checkins (minutes, confidence, xp_gained, streak_at_checkin, ts) VALUES (?, ?, ?, ?, ?)`, minutes, confidence, xpGain, streak, now);
      let milestone = null;
      if ([1, 3, 7, 30].includes(streak)) {
        const msgs = { 1: "Day 1. The journey starts. Every Tiger was once a Mouse.", 3: "Day 3. Three in a row. You are not a mouse anymore.", 7: "Day 7. One full week. Your brain is rewiring. Keep going.", 30: "Day 30. Thirty days straight. That is not a student \u2014 that is a Tiger." };
        milestone = { day: streak, bonus: "1.5x XP", message: msgs[streak] };
      }
      return json({ ok: true, state: { streak, xp: newXp, mood, totalSessions, xpGain, longestStreak }, milestone });
    }
    if (url.pathname === "/state") {
      const rows = this.sql.exec(`SELECT * FROM pet_state WHERE id = 1`).toArray();
      const s = rows[0] || { streak: 0, xp: 0, mood: "neutral", total_sessions: 0, longest_streak: 0 };
      return json({ state: { streak: s.streak, xp: s.xp, mood: s.mood, totalSessions: s.total_sessions, longestStreak: s.longest_streak } });
    }
    return json({ error: "Not found" }, 404);
  }
};
var CommandDO = class {
  static {
    __name(this, "CommandDO");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS commands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_intent TEXT NOT NULL,
      translation TEXT NOT NULL DEFAULT '{}',
      priority INTEGER NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT NOT NULL DEFAULT 'magic-chat',
      assigned_drone TEXT DEFAULT NULL,
      claimed_by TEXT DEFAULT NULL,
      result TEXT DEFAULT NULL,
      success INTEGER DEFAULT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_commands_status ON commands(status, priority, created_at)`);
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/send" && request.method === "POST") {
      const body = await request.json();
      const now = Date.now();
      const translation = body.translation || {};
      const drone = translation.primaryDrone?.name || "CodeRunner";
      this.sql.exec(
        `INSERT INTO commands (raw_intent, translation, priority, status, source, assigned_drone, created_at, updated_at) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)`,
        body.rawIntent || "",
        JSON.stringify(translation),
        body.priority || 5,
        body.source || "magic-chat",
        drone,
        now,
        now
      );
      const row = this.sql.exec(`SELECT last_insert_rowid() as id`).toArray()[0];
      return json({
        ok: true,
        commandId: row.id,
        status: "pending",
        assignedDrone: drone,
        priority: body.priority || 5,
        translation: {
          agent99: translation.agent99,
          agent98: translation.agent98,
          agent97: translation.agent97,
          primaryDrone: translation.primaryDrone,
          supportDrones: translation.supportDrones
        },
        ts: now
      });
    }
    if (url.pathname === "/queue") {
      const status = url.searchParams.get("status") || "pending";
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
      const rows = this.sql.exec(
        `SELECT * FROM commands WHERE status = ? ORDER BY priority ASC, created_at ASC LIMIT ?`,
        status,
        limit
      ).toArray();
      return json({
        commands: rows.map((r) => ({
          ...r,
          translation: JSON.parse(r.translation || "{}")
        })),
        count: rows.length,
        status
      });
    }
    if (url.pathname === "/claim" && request.method === "POST") {
      const body = await request.json();
      const commandId = body.commandId;
      const claimedBy = body.claimedBy || "vscode-extension";
      const existing = this.sql.exec(
        `SELECT * FROM commands WHERE id = ?`,
        commandId
      ).toArray()[0];
      if (!existing) return json({ error: "Command not found" }, 404);
      if (existing.status !== "pending") return json({ error: `Command already ${existing.status}` }, 409);
      this.sql.exec(
        `UPDATE commands SET status = 'claimed', claimed_by = ?, updated_at = ? WHERE id = ?`,
        claimedBy,
        Date.now(),
        commandId
      );
      return json({ ok: true, commandId, status: "claimed", claimedBy });
    }
    if (url.pathname === "/complete" && request.method === "POST") {
      const body = await request.json();
      const commandId = body.commandId;
      const existing = this.sql.exec(
        `SELECT * FROM commands WHERE id = ?`,
        commandId
      ).toArray()[0];
      if (!existing) return json({ error: "Command not found" }, 404);
      this.sql.exec(
        `UPDATE commands SET status = ?, result = ?, success = ?, updated_at = ? WHERE id = ?`,
        body.success !== false ? "completed" : "failed",
        body.result || "",
        body.success !== false ? 1 : 0,
        Date.now(),
        commandId
      );
      return json({
        ok: true,
        commandId,
        status: body.success !== false ? "completed" : "failed"
      });
    }
    if (url.pathname === "/status") {
      const commandId = url.searchParams.get("commandId");
      if (!commandId) return json({ error: "commandId required" }, 400);
      const row = this.sql.exec(
        `SELECT * FROM commands WHERE id = ?`,
        parseInt(commandId)
      ).toArray()[0];
      if (!row) return json({ error: "Command not found" }, 404);
      return json({
        ...row,
        translation: JSON.parse(row.translation || "{}")
      });
    }
    if (url.pathname === "/history") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const rows = this.sql.exec(
        `SELECT * FROM commands ORDER BY id DESC LIMIT ?`,
        limit
      ).toArray();
      const total = this.sql.exec(`SELECT COUNT(*) as cnt FROM commands`).toArray()[0].cnt;
      return json({
        commands: rows.map((r) => ({
          ...r,
          translation: JSON.parse(r.translation || "{}")
        })),
        total,
        limit
      });
    }
    return json({ error: "Not found" }, 404);
  }
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
__name(json, "json");
var ALLOWED_ORIGINS = [
  "https://naturalenglishtraining.com",
  "https://www.naturalenglishtraining.com",
  "https://naturalenglishtraining.net",
  "https://www.naturalenglishtraining.net",
  "https://net-pet-ai.mrmichaelhobbs1234.workers.dev",
  "https://hobbs0011.github.io"
];
function corsHeaders(requestOrOrigin) {
  let origin = "";
  if (typeof requestOrOrigin === "string") {
    origin = requestOrOrigin;
  } else if (requestOrOrigin && requestOrOrigin.headers) {
    origin = requestOrOrigin.headers.get("Origin") || "";
  }
  const isAllowed = ALLOWED_ORIGINS.some((a) => origin === a) || origin.startsWith("chrome-extension://") || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin"
  };
}
__name(corsHeaders, "corsHeaders");
function addCors(response, request) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(request))) {
    headers.set(k, v);
  }
  return new Response(response.body, { status: response.status, headers });
}
__name(addCors, "addCors");
export {
  CommandDO,
  LedgerDO,
  PetDO,
  ProfileDO,
  SessionDO,
  index_default as default
};
//# sourceMappingURL=index.js.map
