// src/zalo.js — Zalo OA Pressure API + Escalation Engine
// Sends accountability alerts via Zalo Official Account API v3.0
// Escalation ladder: Day 1 grace → Day 2 student nudge → Day 3 parent alert → Day 5 escalated → Day 7+ final
// Simulation mode: when ZALO_ACCESS_TOKEN is missing, logs alerts locally without sending

const ZALO_API = "https://openapi.zalo.me/v3.0/oa/message/cs";

// ── Cooldown — prevent alert spam (24h between same alert type per student) ──
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

async function checkCooldown(env, studentId, alertType) {
  try {
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    const res = await stub.fetch(new Request(`https://do/alerts/last?studentId=${encodeURIComponent(studentId)}&alertType=${encodeURIComponent(alertType)}`));
    const data = await res.json();
    if (data.lastAlert && (Date.now() - data.lastAlert.ts) < COOLDOWN_MS) {
      return { coolingDown: true, lastSentAt: data.lastAlert.ts, retryAfter: COOLDOWN_MS - (Date.now() - data.lastAlert.ts) };
    }
    return { coolingDown: false };
  } catch {
    return { coolingDown: false };
  }
}

// ── Log alert to alert_log table ───────────────────────────
async function logAlert(env, studentId, alertType, recipientRole, recipientId, message, simulated) {
  try {
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await stub.fetch(new Request("https://do/alerts/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, alertType, recipientRole, recipientId, message, simulated }),
    }));
  } catch { /* non-fatal */ }
}

// ── Append accountability_flag to immutable ledger ─────────
async function ledgerFlag(env, studentId, alertType, recipientRole, simulated) {
  try {
    const stub = env.LEDGER.get(env.LEDGER.idFromName(studentId));
    await stub.fetch(new Request("https://do/append", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        eventType: "accountability_flag",
        payload: JSON.stringify({ alertType, recipientRole, simulated, ts: Date.now() }),
      }),
    }));
  } catch { /* non-fatal */ }
}

// ── Send raw Zalo OA message (live or simulated) ───────────
async function sendZaloMessage(env, zaloUserId, text) {
  const simulated = !env.ZALO_ACCESS_TOKEN;

  if (simulated) {
    console.log(`[ZALO-SIM] Would send to ${zaloUserId}: ${text.slice(0, 80)}...`);
    return { ok: true, simulated: true, reason: "no_access_token" };
  }

  if (!zaloUserId) return { ok: false, simulated: false, reason: "missing_zalo_id" };

  const res = await fetch(ZALO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access_token": env.ZALO_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      recipient: { user_id: zaloUserId },
      message: { text },
    }),
  });

  const data = await res.json();
  return { ok: data.error === 0, simulated: false, data };
}

// ── Escalation messages (Vietnamese + English bilingual) ───
function buildStudentNudge(studentName, streak) {
  return `OBI nhắc nhở 📢

${studentName}, bạn chưa luyện tập hôm nay.

🔥 Streak: ${streak} ngày — đừng để mất!

Chỉ cần 5 phút nói tiếng Anh để giữ streak.
Just 5 minutes of speaking to keep your streak alive.

👉 naturalenglishtraining.net/speak`;
}

function buildParentAlert(studentName, streak, daysInactive) {
  return `OBI THÔNG BÁO 📉

${studentName} chưa luyện tập ${daysInactive} ngày.

🔥 Streak hiện tại: ${streak} ngày
📉 Tiến độ học đang bị ảnh hưởng

Khuyến nghị: 10 phút luyện nói hôm nay.
Recommendation: 10 minutes speaking practice today.

👉 naturalenglishtraining.net/speak`;
}

function buildEscalatedAlert(studentName, daysInactive) {
  return `OBI CẢNH BÁO 🚨

${studentName} đã nghỉ ${daysInactive} ngày liên tiếp.

📉 Tiger Score đang GIẢM
🔥 Streak đã bị reset

Cần hành động ngay để không mất tiến độ.
Immediate action needed to prevent learning loss.

👉 naturalenglishtraining.net/speak`;
}

function buildFinalNotice(studentName, daysInactive) {
  return `OBI THÔNG BÁO CUỐI ⚠️

${studentName} đã nghỉ ${daysInactive} ngày.

Streak đã bị RESET. Tiger Score giảm mạnh.

Đây đang ảnh hưởng nghiêm trọng đến quá trình học.
This is seriously affecting the learning process.

Khuyến nghị:
- Luyện nói 5 phút NGAY HÔM NAY
- Liên hệ Teacher Michael nếu cần hỗ trợ

👉 naturalenglishtraining.net/speak`;
}

// ── Escalation engine — check one student with cooldown ────
async function checkAndEscalate(env, student) {
  const now = Date.now();
  const lastActive = student.last_active || student.last_checkin || 0;
  if (lastActive === 0) return { action: "skip", reason: "never_active" };

  const hoursInactive = (now - lastActive) / 3600000;
  const daysInactive = Math.floor(hoursInactive / 24);
  const studentName = student.full_name || student.student_id || "Học sinh";
  const streak = student.streak || 0;
  const simulated = !env.ZALO_ACCESS_TOKEN;
  const results = [];

  // Day 1: grace period — no alerts
  if (daysInactive < 2) {
    return { action: "active", hoursInactive, daysInactive };
  }

  // Determine escalation tier
  let alertType, messageBuilder, sendToPartners;
  if (daysInactive >= 7) {
    alertType = "final_notice";
    messageBuilder = () => buildFinalNotice(studentName, daysInactive);
    sendToPartners = true;
  } else if (daysInactive >= 5) {
    alertType = "escalated";
    messageBuilder = () => buildEscalatedAlert(studentName, daysInactive);
    sendToPartners = true;
  } else if (daysInactive >= 3) {
    alertType = "parent_alert";
    messageBuilder = () => buildParentAlert(studentName, streak, daysInactive);
    sendToPartners = true;
  } else {
    // Day 2: student nudge only
    alertType = "student_nudge";
    messageBuilder = () => buildStudentNudge(studentName, streak);
    sendToPartners = false;
  }

  // Check cooldown
  const cooldown = await checkCooldown(env, student.student_id, alertType);
  if (cooldown.coolingDown) {
    return { action: "cooldown", alertType, hoursInactive, daysInactive, retryAfter: cooldown.retryAfter };
  }

  const message = messageBuilder();

  // Send to student if they have Zalo ID
  if (student.zalo_id) {
    const sent = await sendZaloMessage(env, student.zalo_id, message);
    results.push({ target: "student", sent });
    await logAlert(env, student.student_id, alertType, "student", student.zalo_id, message, simulated);
  }

  // Send to accountability partners (Day 3+)
  if (sendToPartners) {
    const links = await getAccountabilityLinks(env, student.student_id);
    for (const link of links) {
      if (link.zalo_id) {
        const sent = await sendZaloMessage(env, link.zalo_id, message);
        results.push({ target: link.role, sent });
        await logAlert(env, student.student_id, alertType, link.role, link.zalo_id, message, simulated);
      }
    }
  }

  // Ledger the accountability flag (immutable audit)
  if (env.LEDGER) {
    await ledgerFlag(env, student.student_id, alertType, sendToPartners ? "partners" : "student", simulated);
  }

  return { action: alertType, hoursInactive, daysInactive, sent: results.length, simulated, results };
}

// ── Get accountability links for a student ─────────────────
async function getAccountabilityLinks(env, studentId) {
  try {
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    const res = await stub.fetch(new Request(`https://do/relations/get?studentId=${encodeURIComponent(studentId)}`));
    const data = await res.json();
    return data.links || [];
  } catch {
    return [];
  }
}

// ── Full roster sweep (called from cron) ───────────────────
async function runEscalationSweep(env) {
  const rosterStub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
  const rosterRes = await rosterStub.fetch(new Request("https://do/roster/all"));
  const rosterData = await rosterRes.json();
  const students = rosterData.students || [];

  const report = { checked: 0, nudges: 0, parentAlerts: 0, escalated: 0, finalNotices: 0, active: 0, cooldowns: 0, skipped: 0, simulated: !env.ZALO_ACCESS_TOKEN, errors: [] };

  for (const student of students) {
    try {
      // Enrich with PetDO data (streak, last_checkin)
      const petStub = env.PETS.get(env.PETS.idFromName(student.student_id));
      const petRes = await petStub.fetch(new Request("https://do/state"));
      const petData = await petRes.json();
      const enriched = {
        ...student,
        streak: petData.state?.streak || student.streak || 0,
        last_checkin: petData.state?.lastCheckin || student.last_active || 0,
      };

      const result = await checkAndEscalate(env, enriched);
      report.checked++;
      if (result.action === "student_nudge") report.nudges++;
      else if (result.action === "parent_alert") report.parentAlerts++;
      else if (result.action === "escalated") report.escalated++;
      else if (result.action === "final_notice") report.finalNotices++;
      else if (result.action === "active") report.active++;
      else if (result.action === "cooldown") report.cooldowns++;
      else report.skipped++;
    } catch (err) {
      report.errors.push({ studentId: student.student_id, error: err.message });
    }
  }

  return report;
}

export { sendZaloMessage, checkAndEscalate, runEscalationSweep, getAccountabilityLinks };
