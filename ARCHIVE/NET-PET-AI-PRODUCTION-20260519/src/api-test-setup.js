// src/api-test-setup.js — Test Fixture Setup for Gate 7 Production Validation
// Purpose: Create 3 test users with seeded conversation data for validation gates
// Gate 7 Requirement: 3 test users + conversation data seeded
// Output: Fixtures ready for /api/chat, /api/memory/store, /api/daily-drill validation

export async function handleTestSetup(request, env) {
  const method = request.method;

  // GET /api/test-setup/status — Check fixture state
  if (method === "GET") {
    return await getTestFixtureStatus(env);
  }

  // POST /api/test-setup/create — Initialize all 3 test users
  if (method === "POST") {
    const body = await request.json();
    const { forceReset = false, seedConversations = true } = body;
    return await createTestFixtures(env, forceReset, seedConversations);
  }

  return json({ error: "Method not allowed" }, 405);
}

// Test fixture definitions (3 users for Gate 7 validation)
const TEST_FIXTURES = [
  {
    studentId: "test-user-001",
    fullName: "Test Student One",
    englishLevel: "A1",
    currentCity: "Ho Chi Minh City",
    phoneticLevel: "A1_beginner",
    weakSkills: ["phoneme_/θ/", "grammar_present_simple"],
  },
  {
    studentId: "test-user-002",
    fullName: "Test Student Two",
    englishLevel: "A2",
    currentCity: "Hanoi",
    phoneticLevel: "A2_developing",
    weakSkills: ["phoneme_/ð/", "grammar_past_tense"],
  },
  {
    studentId: "test-user-003",
    fullName: "Test Student Three",
    englishLevel: "B1",
    currentCity: "Da Nang",
    phoneticLevel: "B1_intermediate",
    weakSkills: ["grammar_conditional", "pronunciation_stress"],
  },
];

// Seeded conversation data for each test user
const SEEDED_CONVERSATIONS = {
  "test-user-001": [
    {
      timestamp: Date.now() - 86400000,
      input: "I am a student",
      correction: "I am *a* student (correct!) — Focus: indefinite article usage",
      mistake_pattern: "grammar_article",
      strategy_used: "repetition_with_context",
    },
    {
      timestamp: Date.now() - 43200000,
      input: "She go to school",
      correction: "She **goes** to school — Third person singular '-s' on present tense verbs",
      mistake_pattern: "grammar_present_simple",
      strategy_used: "morphology_drill",
    },
  ],
  "test-user-002": [
    {
      timestamp: Date.now() - 129600000,
      input: "I was go to market yesterday",
      correction: "I **went** to market yesterday — Past simple of 'go' is 'went' (irregular)",
      mistake_pattern: "grammar_past_tense",
      strategy_used: "irregular_verb_anchoring",
    },
    {
      timestamp: Date.now() - 64800000,
      input: "Thank you for you help",
      correction: "Thank you for **your** help — Possessive pronoun, not subject pronoun",
      mistake_pattern: "grammar_pronoun",
      strategy_used: "contrastive_pair",
    },
  ],
  "test-user-003": [
    {
      timestamp: Date.now() - 172800000,
      input: "If I would know, I tell you",
      correction: "**If I knew**, I **would tell** you — Conditional: past simple in if-clause, would + infinitive in main",
      mistake_pattern: "grammar_conditional",
      strategy_used: "conditional_structure_rule",
    },
    {
      timestamp: Date.now() - 86400000,
      input: "She speak English very fluent",
      correction: "She speaks English very **fluently** — Adverb from adjective 'fluent' → 'fluently'",
      mistake_pattern: "grammar_adverb_formation",
      strategy_used: "morphology_anchoring",
    },
  ],
};

// Get current fixture status
async function getTestFixtureStatus(env) {
  const status = {
    fixtures_available: TEST_FIXTURES.length,
    fixtures: [],
    timestamp: Date.now(),
  };

  for (const fixture of TEST_FIXTURES) {
    try {
      const stub = env.PROFILES.get(env.PROFILES.idFromName(fixture.studentId));
      const res = await stub.fetch(new Request("https://do/profile"));
      const data = await res.json();
      status.fixtures.push({
        studentId: fixture.studentId,
        exists: !!data.profile,
        profile: data.profile || null,
      });
    } catch (err) {
      status.fixtures.push({
        studentId: fixture.studentId,
        exists: false,
        error: err.message,
      });
    }
  }

  const allExist = status.fixtures.every((f) => f.exists);
  return json({
    ok: true,
    status: allExist ? "READY_FOR_GATES" : "INCOMPLETE",
    fixtures: status.fixtures,
    timestamp: status.timestamp,
  });
}

// Create all test fixtures with seeded data
async function createTestFixtures(env, forceReset = false, seedConversations = true) {
  const results = {
    created: [],
    errors: [],
    timestamp: Date.now(),
  };

  for (const fixture of TEST_FIXTURES) {
    try {
      // 1. Create profile via ProfileDO
      const profileStub = env.PROFILES.get(env.PROFILES.idFromName(fixture.studentId));
      const profileRes = await profileStub.fetch(new Request("https://do/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fixture),
      }));

      const profileData = await profileRes.json();

      // 2. Initialize StudentDO state
      const studentStub = env.SESSIONS.get(env.SESSIONS.idFromName(fixture.studentId));
      await studentStub.fetch(new Request("https://do/start-session", { method: "POST" }));

      // 3. Seed conversation data if requested
      let conversationCount = 0;
      if (seedConversations) {
        const conversations = SEEDED_CONVERSATIONS[fixture.studentId] || [];
        for (const conv of conversations) {
          await studentStub.fetch(new Request("https://do/log-interaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(conv),
          }));
          conversationCount++;
        }
      }

      // 4. Log to ledger if available
      if (env.LEDGER) {
        const ledgerStub = env.LEDGER.get(env.LEDGER.idFromName(fixture.studentId));
        const payload = JSON.stringify({
          event: "test_fixture_created",
          level: fixture.englishLevel,
          conversations_seeded: conversationCount,
        });
        await ledgerStub.fetch(new Request("https://do/append", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "test_setup",
            payload,
          }),
        })).catch(() => {});
      }

      results.created.push({
        studentId: fixture.studentId,
        profile: profileData.profile || fixture,
        conversationsSeeded: conversationCount,
        ok: true,
      });
    } catch (err) {
      results.errors.push({
        studentId: fixture.studentId,
        error: err.message,
      });
    }
  }

  const gateReady = results.created.length === TEST_FIXTURES.length && results.errors.length === 0;

  return json({
    ok: gateReady,
    status: gateReady ? "GATE_7_READY" : "PARTIAL_FAILURE",
    created: results.created,
    errors: results.errors,
    gate_status: {
      gate_7_test_users: results.created.length,
      gate_7_conversations_seeded: results.created.reduce((sum, c) => sum + (c.conversationsSeeded || 0), 0),
      gate_7_ready: gateReady,
      gate_8_chat_endpoint: "/api/chat",
      gate_9_memory_store: "/api/memory/store",
      gate_10_daily_drill: "/api/daily-drill",
    },
    timestamp: results.timestamp,
  });
}

// Helper: JSON response
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
