// src/telegram.js — Telegram Bot API + Accountability Bootstrap
// Sends accountability dashboards and progress reports via Telegram Bot API
// Supports: Boss Node (BlueTech ROI dashboard), Parent Node (progress transcripts)
// Simulation mode: when TELEGRAM_BOT_TOKEN is missing, logs messages locally

const TELEGRAM_API = "https://api.telegram.org/bot";

async function getTelegramAPI(env) {
  if (!env.TELEGRAM_BOT_TOKEN) return null;
  return `${TELEGRAM_API}${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
}

// ── Cooldown — prevent message spam (24h between same message type per recipient) ──
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

async function checkCooldown(env, recipientId, messageType) {
  try {
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    const res = await stub.fetch(
      new Request(
        `https://do/telegram-cooldown?recipientId=${encodeURIComponent(recipientId)}&messageType=${encodeURIComponent(messageType)}`
      )
    );
    const data = await res.json();
    if (data.lastMessage && Date.now() - data.lastMessage.ts < COOLDOWN_MS) {
      return {
        coolingDown: true,
        lastSentAt: data.lastMessage.ts,
        retryAfter: COOLDOWN_MS - (Date.now() - data.lastMessage.ts),
      };
    }
    return { coolingDown: false };
  } catch {
    return { coolingDown: false };
  }
}

// ── Log message to audit trail ───────────────────────────
async function logTelegramMessage(env, recipientId, recipientRole, messageType, content, simulated) {
  try {
    const stub = env.SESSIONS.get(env.SESSIONS.idFromName("system-roster"));
    await stub.fetch(new Request("https://do/telegram-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId,
        recipientRole,
        messageType,
        content: content.slice(0, 500),
        simulated,
        ts: Date.now(),
      }),
    }));
  } catch { /* non-fatal */ }
}

// ── Send raw Telegram message (live or simulated) ───────────
async function sendTelegramMessage(env, chatId, text, parseMode = "HTML") {
  const simulated = !env.TELEGRAM_BOT_TOKEN;

  if (simulated) {
    console.log(`[TELEGRAM-SIM] Would send to ${chatId}: ${text.slice(0, 80)}...`);
    return { ok: true, simulated: true, reason: "no_bot_token" };
  }

  if (!chatId) return { ok: false, simulated: false, reason: "missing_chat_id" };

  const telegramApi = await getTelegramAPI(env);
  const res = await fetch(telegramApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  });

  const data = await res.json();
  return { ok: data.ok === true, simulated: false, data };
}

// ── BLUEPRINTS ───────────────────────────────────────────

// Boss Node: God View ROI Dashboard for BlueTech
function buildBossNodeDashboard(students) {
  const studentList = students
    .map((s) => `👤 <strong>${s.name}</strong>\n   Level: ${s.level}\n   Streak: ${s.streak}d\n   45m Listen: ${s.completed45m ? "✅" : "❌"}\n   15m Speak: ${s.completed15m ? "✅" : "❌"}`)
    .join("\n\n");

  return `🎯 <strong>NET-PET-AI: God View ROI Dashboard</strong>\n\n<strong>BlueTech Employee Cohort</strong>\n\n${studentList}\n\n<strong>Dashboard Access:</strong>\nmrmichaelhobbs123.workers.dev/boss-dashboard\n\n<strong>Credentials:</strong>\nCreated automatically. Check your email for login details.\n\n<strong>What tracked:</strong>\n✓ Daily 45m passive listening\n✓ Daily 15m kinetic speaking\n✓ Streak maintenance\n✓ Progress vs. baseline\n\n<em>Questions? Message Michael directly.</em>`;
}

// Parent Node: Minh Progress Report
function buildParentProgressReport(studentName, progressSummary, transcriptUrl) {
  return `🌟 <strong>OBI Progress Report: ${studentName}</strong>\n\n<strong>Teaching Method Proof:</strong>\n${progressSummary}\n\n<strong>Raw Transcript Access:</strong>\n${transcriptUrl}\n\n<strong>Next Steps:</strong>\n1. Review transcripts to see Michael's live teaching\n2. Access parent dashboard to assign homework\n3. Monitor daily 10-5-5-3 streak (10 vocab, 5 idioms, 5 slang, 3 games)\n\n<strong>Your Role:</strong>\nYou can now assign lessons directly and see real-time progress.\n\n<em>Michael will check in after 7 days to discuss results.</em>`;
}

// Buddy System: Weekly session confirmation
function buildBuddySessionAlert(student1, student2, sessionTime) {
  return `🤝 <strong>Buddy Session Scheduled</strong>\n\n${student1} ↔ ${student2}\n<strong>Time:</strong> ${sessionTime} (Weekly)\n\n<strong>Rules:</strong>\n✓ 1 hour commitment\n✓ Both must attend\n✓ Streak protected if you both show up\n✓ Streak broken if either misses\n\n<em>See you there!</em>`;
}

// Escalation: Streak break alert
function buildStreakBreakAlert(studentName, daysInactive) {
  return `⚠️ <strong>Streak Broken</strong>\n\n${studentName}, your streak ended after ${daysInactive} days of inactivity.\n\n💪 <strong>Next streak starts today!</strong>\nJust log in and practice 15 minutes to restart.\n\n👉 naturalenglishtraining.net/login`;
}

export { getTelegramAPI, checkCooldown, logTelegramMessage, sendTelegramMessage, buildBossNodeDashboard, buildParentProgressReport, buildBuddySessionAlert, buildStreakBreakAlert };
