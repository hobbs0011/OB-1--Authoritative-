// submission-api — NET Assessment submission handler
// Rescued from Cloudflare Workers 2026-05-18 (bundled output)
// DB: net-submissions (1a7246ce-1227-4205-9234-76cbd036fa48)
// Env: DB (D1 net-submissions), RESEND_API_KEY
// Endpoints: GET /health, POST /api/submit
// CORS: allows *.{tigers-4room,cubs-4room,career-4room,university-4room}.pages.dev

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
var MAX_BODY_BYTES = 512 * 1024;
var RATE_LIMIT_MAX = 5;
var RATE_WINDOW_MS = 36e5;
var VALID_ASSESSMENTS = /* @__PURE__ */ new Set(["tigers-4room", "university-4room", "career-4room", "cubs-4room"]);
var REF_RE = /^NET-(TIG|UNI|CAR|CUB)-\d{8}-[A-Z0-9]{6}$/;
var NET_ORIGIN_RE = /^https:\/\/(?:[a-z0-9-]+\.)?(?:university-4room|career-4room|tigers-4room|cubs-4room)\.pages\.dev$/;
function corsHeaders(origin) {
  const allowed = origin && (NET_ORIGIN_RE.test(origin) || origin === "http://localhost:8788");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://university-4room.pages.dev",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}
__name(corsHeaders, "corsHeaders");
function sanitize(val, maxLen = 500) {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}
__name(sanitize, "sanitize");
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
__name(isValidEmail, "isValidEmail");
function esc(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(esc, "esc");
async function checkRateLimit(env, ip) {
  const hourKey = Math.floor(Date.now() / RATE_WINDOW_MS).toString();
  try {
    const row = await env.DB.prepare(
      `INSERT INTO rate_limits (ip, hour_key, count) VALUES (?, ?, 1)
       ON CONFLICT(ip, hour_key) DO UPDATE SET count = count + 1
       RETURNING count`
    ).bind(ip, hourKey).first();
    return (row?.count ?? 1) <= RATE_LIMIT_MAX;
  } catch {
    return true;
  }
}
__name(checkRateLimit, "checkRateLimit");
function maybeCleanRateLimits(env, ctx) {
  if (Math.random() > 0.01) return;
  const oldKey = (Math.floor(Date.now() / RATE_WINDOW_MS) - 3).toString();
  ctx.waitUntil(
    env.DB.prepare("DELETE FROM rate_limits WHERE hour_key <= ?").bind(oldKey).run().catch(() => {})
  );
}
__name(maybeCleanRateLimits, "maybeCleanRateLimits");
var index_default = {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") ?? "";
    const cors = corsHeaders(origin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse({ status: "ok" }, 200, cors);
    }
    if (request.method === "POST" && url.pathname === "/api/submit") {
      return handleSubmit(request, env, ctx, cors);
    }
    return jsonResponse({ error: "Not Found" }, 404, cors);
  }
};
async function handleSubmit(request, env, ctx, cors) {
  const cl = parseInt(request.headers.get("Content-Length") ?? "0", 10);
  if (cl > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Payload too large" }, 413, cors);
  }
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const allowed = await checkRateLimit(env, ip);
  maybeCleanRateLimits(env, ctx);
  if (!allowed) {
    return jsonResponse({ error: "Too many submissions. Please wait before trying again." }, 429, cors);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, cors);
  }
  const { submissionReference, assessment, submittedAt, rooms } = body ?? {};
  if (!submissionReference || !assessment || !rooms) {
    return jsonResponse({ error: "Missing required fields" }, 400, cors);
  }
  if (!VALID_ASSESSMENTS.has(assessment)) {
    return jsonResponse({ error: "Invalid assessment type" }, 400, cors);
  }
  if (!REF_RE.test(submissionReference)) {
    return jsonResponse({ error: "Invalid reference format" }, 400, cors);
  }
  const room1 = rooms?.room1 ?? {};
  const name = sanitize(room1.name ?? room1.parentName ?? "", 200);
  const email = isValidEmail(room1.email) ? sanitize(room1.email, 200) : "";
  const phone = sanitize(room1.phone ?? "", 50);
  const assessmentType = assessment.replace("-4room", "");
  const timestamp = typeof submittedAt === "string" ? sanitize(submittedAt, 30) : (/* @__PURE__ */ new Date()).toISOString();
  const strippedData = stripAudio(body);
  try {
    await env.DB.prepare(
      "INSERT INTO submissions (id, assessment_type, submitted_at, name, email, phone, data, notified) VALUES (?, ?, ?, ?, ?, ?, ?, 0)"
    ).bind(submissionReference, assessmentType, timestamp, name, email, phone, JSON.stringify(strippedData)).run();
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint failed")) {
      return jsonResponse({ success: true, reference: submissionReference, message: "Already received." }, 200, cors);
    }
    console.error("DB insert error:", err.message);
    return jsonResponse({ error: "Database error. Please email your pack to michael@netai.com directly." }, 500, cors);
  }
  ctx.waitUntil(sendNotification(env, { submissionReference, assessmentType, name, email, phone, rooms }));
  return jsonResponse({
    success: true,
    reference: submissionReference,
    message: "Submission received. Michael will contact you within 24 hours."
  }, 200, cors);
}
__name(handleSubmit, "handleSubmit");
function stripAudio(data) {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (key === "dataUrl" && typeof value === "string" && value.startsWith("data:audio")) {
      return "[audio-local-download]";
    }
    return value;
  }));
}
__name(stripAudio, "stripAudio");
async function sendNotification(env, { submissionReference, assessmentType, name, email, phone, rooms }) {
  if (!env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set — skipping email");
    return;
  }
  const typeLabel = {
    tigers: "NET Tigers (8–17)",
    university: "NET University",
    career: "NET Career",
    cubs: "NET Cubs (3–7)"
  }[assessmentType] ?? assessmentType;
  let resendError = null;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "NET Assessment <onboarding@resend.dev>",
        to: ["mrmichaelhobbs123@gmail.com"],
        subject: `[NET] New ${typeLabel} submission — ${submissionReference}`,
        html: buildEmailHtml({ submissionReference, typeLabel, name, email, phone, rooms })
      })
    });
    if (!res.ok) {
      resendError = `HTTP ${res.status}: ${await res.text()}`;
    }
  } catch (err) {
    resendError = err.message;
  }
  if (resendError) {
    console.error("Resend failed:", resendError);
    await logFailedNotification(env, submissionReference, resendError);
    try {
      await env.DB.prepare("UPDATE submissions SET notified = -1 WHERE id = ?").bind(submissionReference).run();
    } catch {}
  } else {
    try {
      await env.DB.prepare("UPDATE submissions SET notified = 1 WHERE id = ?").bind(submissionReference).run();
    } catch {}
  }
}
__name(sendNotification, "sendNotification");
async function logFailedNotification(env, submissionId, errorDetail) {
  try {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO failed_notifications (id, submission_id, failed_at, error_detail) VALUES (?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), submissionId, (/* @__PURE__ */ new Date()).toISOString(), sanitize(String(errorDetail ?? ""), 1e3)).run();
  } catch {}
}
__name(logFailedNotification, "logFailedNotification");
function buildEmailHtml({ submissionReference, typeLabel, name, email, phone, rooms }) {
  const r2 = rooms?.room2 ?? {};
  const blockers = Array.isArray(r2.blockers) ? r2.blockers.map(esc).join(", ") : esc(r2.blockers ?? "—");
  const reflection = esc(r2.reflection ?? r2.writtenReflection ?? "—");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;background:#0f0f1a;color:#e5e7eb;padding:32px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:#1a1a2e;border-radius:12px;padding:32px;border:1px solid rgba(245,158,11,0.2);">
    <h1 style="color:#f59e0b;margin:0 0 8px;">NET Assessment Submission</h1>
    <p style="color:#a855f7;margin:0 0 24px;font-size:0.9rem;">${esc(typeLabel)}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:8px 0;color:#9ca3af;width:140px;">Reference</td><td style="padding:8px 0;font-weight:bold;color:#f59e0b;">${esc(submissionReference)}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;">Name</td><td style="padding:8px 0;">${esc(name) || "—"}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;">Email</td><td style="padding:8px 0;">${esc(email) || "—"}</td></tr>
      <tr><td style="padding:8px 0;color:#9ca3af;">Phone / WhatsApp</td><td style="padding:8px 0;">${esc(phone) || "—"}</td></tr>
    </table>
    <div style="background:rgba(245,158,11,0.06);border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:16px;margin-bottom:16px;">
      <strong style="color:#f59e0b;">Room 2 — Blockers</strong>
      <p style="margin:8px 0 0;">${blockers}</p>
    </div>
    <div style="background:rgba(168,85,247,0.06);border-left:3px solid #a855f7;border-radius:0 8px 8px 0;padding:16px;margin-bottom:24px;">
      <strong style="color:#a855f7;">Room 2 — Reflection</strong>
      <p style="margin:8px 0 0;">${reflection}</p>
    </div>
    <p style="color:#6b7280;font-size:0.8rem;margin:0;">
      Full submission stored in D1 · Audio recordings downloaded locally by student.<br>
      notified=-1 means email previously failed — check failed_notifications table.
    </p>
  </div>
</body>
</html>`;
}
__name(buildEmailHtml, "buildEmailHtml");
function jsonResponse(data, status = 200, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors }
  });
}
__name(jsonResponse, "jsonResponse");
export { index_default as default };
