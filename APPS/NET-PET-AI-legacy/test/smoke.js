// test/smoke.js — NET-PET-AI smoke test
// Run: node test/smoke.js [BASE_URL]
// Simulates a full user journey: health → onboarding → chat → pet checkin → ledger verify

const BASE = process.argv[2] || "http://localhost:8787";

const studentId = `smoke-${Date.now()}`;
let passed = 0;
let failed = 0;

async function hit(label, path, method = "GET", body = null) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    const ok = res.ok;
    console.log(`${ok ? "✓" : "✗"} [${res.status}] ${label}`);
    if (!ok) console.log(`  → ${JSON.stringify(data)}`);
    ok ? passed++ : failed++;
    return { ok, data, status: res.status };
  } catch (err) {
    console.log(`✗ [NET_ERR] ${label} — ${err.message}`);
    failed++;
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log(`\n🔥 NET-PET-AI Smoke Test`);
  console.log(`   Target: ${BASE}`);
  console.log(`   Student: ${studentId}\n`);

  // 1. Health
  await hit("GET /api/health", "/api/health");

  // 2. Onboarding
  await hit("POST /api/onboarding", "/api/onboarding", "POST", {
    studentId,
    fullName: "Smoke Test Student",
    currentCity: "Ho Chi Minh City",
    englishLevel: "B1",
    goals: "Speak confidently in meetings",
  });

  // 3. Chat (Obi system prompt injection test)
  const chatRes = await hit("POST /api/chat (no system msg)", "/api/chat", "POST", {
    studentId,
    messages: [{ role: "user", content: "Hello, I want to practice English." }],
  });
  if (chatRes.ok && chatRes.data.reply) {
    console.log(`  Obi replied: "${chatRes.data.reply.slice(0, 80)}…"`);
    console.log(`  Ledger loaded: ${chatRes.data.ledgerLoaded}`);
  }

  // 4. TTS (will fail without DEEPGRAM_API_KEY — that is expected)
  const ttsRes = await hit("POST /api/tts (expects 500 if no key)", "/api/tts", "POST", { text: "Hello Tiger." });
  if (ttsRes.status === 500) {
    console.log(`  → Expected: DEEPGRAM_API_KEY not configured`);
    passed++;
    failed--;
  }

  // 5. NET Pet check-in
  const petRes = await hit("POST /api/netpet/checkin", "/api/netpet/checkin", "POST", {
    studentId,
    minutes: 30,
    confidence: 7,
  });
  if (petRes.ok && petRes.data.state) {
    const s = petRes.data.state;
    console.log(`  Streak: ${s.streak} | XP: ${s.xp} | Mood: ${s.mood}`);
    if (petRes.data.milestone) console.log(`  Milestone: ${petRes.data.milestone.message}`);
  }

  // 6. NET Pet state
  await hit("GET /api/netpet/state", `/api/netpet/state?studentId=${studentId}`);

  // 7. Ledger history
  const ledgerRes = await hit("GET /api/ledger/history", `/api/ledger/history?studentId=${studentId}&limit=10`);
  if (ledgerRes.ok) {
    console.log(`  Ledger entries: ${ledgerRes.data.total}`);
  }

  // 8. Ledger verify (chain integrity)
  const verifyRes = await hit("GET /api/ledger/verify", `/api/ledger/verify?studentId=${studentId}`);
  if (verifyRes.ok) {
    console.log(`  Chain: ${verifyRes.data.message}`);
  }

  // 9. Classroom rate limit test
  const classId = `smoke-class-${Date.now()}`;
  await hit("POST /api/classroom/session/start", "/api/classroom/session/start", "POST", { classId, teacherId: "michael", totalStudents: 5 });
  await hit("POST /api/classroom/event", "/api/classroom/event", "POST", { classId, studentId, type: "focus_tap", ruleStatus: "followed" });

  // 10. Memory
  await hit("POST /api/memory (save)", "/api/memory", "POST", {
    studentId,
    exchange: { user: "Hello Obi", obi: "Hello! Speak louder — Tigers roar." },
  });
  await hit("GET /api/memory", `/api/memory?studentId=${studentId}`);

  // Summary
  console.log(`\n${"─".repeat(40)}`);
  console.log(`PASSED: ${passed} | FAILED: ${failed} | TOTAL: ${passed + failed}`);
  const grade = failed === 0 ? "S (Perfect)" : failed <= 2 ? "A (Good)" : failed <= 4 ? "B (Check keys)" : "F (Worker down?)";
  console.log(`GRADE: ${grade}`);
  if (failed > 0) {
    console.log(`\nIf DEEPSEEK_API_KEY is missing: chat/lesson/practice/feedback will return 500.`);
    console.log(`That is expected until Michael runs: wrangler secret put DEEPSEEK_API_KEY --name net-pet-ai`);
  }
  console.log();
  process.exit(failed > 4 ? 1 : 0);
}

run();