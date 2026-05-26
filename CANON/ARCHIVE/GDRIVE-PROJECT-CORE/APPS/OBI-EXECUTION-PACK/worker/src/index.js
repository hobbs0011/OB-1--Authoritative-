// OBI Cloudflare Worker — Production MVP Core
// Deploy: wrangler deploy
// Environment: Set DEEPSEEK_KEY, SUPABASE_URL, SUPABASE_KEY in wrangler.toml secrets

import { Router } from 'itty-router';
import { json } from 'itty-router';

const router = Router();

// ============================================================
// CORE SYSTEM CONSTANTS
// ============================================================

const OBI_PROMPT = `You are OBI, an English learning reinforcement system.

Your ONLY job is to:
1. Detect mistakes in user English
2. Correct them clearly (ONE main error per message)
3. Explain why (max 2 sentences)
4. Generate a repetition drill
5. End with "Next time we'll..." (continuation hook)

CRITICAL RULES:
- NEVER chat casually
- ALWAYS correct first
- NEVER overwhelm
- ALWAYS give clearness
- Format output as: CORRECTION | EXPLANATION | DRILL | HOOK

Example:
User: "I go yesterday market buy rice"
CORRECTION: I went to the market yesterday to buy rice.
EXPLANATION: Use past tense "went" for completed actions. Use "the market" with article.
DRILL: Say 3x: "I went to the market yesterday to buy rice."
HOOK: Next time we'll focus on past perfect tense.

User weak points: {WEAK_POINTS}
Current streak: {STREAK}`;

// ============================================================
// L4 — MEMORY SYSTEM (Durable Objects via KV for MVP)
// ============================================================

class UserMemory {
  constructor(userId, env) {
    this.userId = userId;
    this.env = env;
  }

  async getProfile() {
    const key = `profile:${this.userId}`;
    const data = await this.env.KV.get(key, 'json');
    return data || {
      userId: this.userId,
      streak: 0,
      weakPoints: [],
      weakGrammar: [],
      weakPhonemes: [],
      level: 'A1',
      totalSessions: 0,
      lastActive: null,
      createdAt: new Date().toISOString()
    };
  }

  async updateProfile(updates) {
    const key = `profile:${this.userId}`;
    const profile = await this.getProfile();
    const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    await this.env.KV.put(key, JSON.stringify(updated));
    return updated;
  }

  async getSessionLog() {
    const key = `sessions:${this.userId}`;
    const data = await this.env.KV.get(key, 'json');
    return data || [];
  }

  async addToSessionLog(entry) {
    const key = `sessions:${this.userId}`;
    const log = await this.getSessionLog();
    log.push({
      ...entry,
      timestamp: new Date().toISOString()
    });
    // Keep last 20 sessions
    if (log.length > 20) log.shift();
    await this.env.KV.put(key, JSON.stringify(log));
  }

  async getLedger() {
    const key = `ledger:${this.userId}`;
    const data = await this.env.KV.get(key, 'json');
    return data || [];
  }

  async appendToLedger(event) {
    const key = `ledger:${this.userId}`;
    const ledger = await this.getLedger();
    ledger.push({
      ...event,
      timestamp: new Date().toISOString(),
      hash: await this.hashEvent(event)
    });
    await this.env.KV.put(key, JSON.stringify(ledger));
  }

  async hashEvent(event) {
    const str = JSON.stringify(event);
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// ============================================================
// L3 — INTELLIGENCE LAYER (LLM Router)
// ============================================================

async function callDeepSeek(env, prompt) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.DEEPSEEK_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ============================================================
// L2 — EDGE ORCHESTRATION (Core Router Logic)
// ============================================================

async function handleChat(req, env) {
  const { userId, message } = await req.json();

  if (!userId || !message) {
    return json({ error: 'Missing userId or message' }, { status: 400 });
  }

  try {
    // Load memory
    const memory = new UserMemory(userId, env);
    const profile = await memory.getProfile();
    const sessions = await memory.getSessionLog();

    // Build context
    const weakPointsStr = profile.weakPoints.slice(0, 3).join(', ') || 'none yet';
    const fullPrompt = OBI_PROMPT
      .replace('{WEAK_POINTS}', weakPointsStr)
      .replace('{STREAK}', profile.streak)
      + `\n\nUser message: "${message}"`;

    // Call AI
    const aiResponse = await callDeepSeek(env, fullPrompt);

    // Parse response
    const [correction, explanation, drill, hook] = aiResponse.split('|').map(s => s.trim());

    // Extract errors (simple heuristic)
    const hasError = correction && correction.toLowerCase() !== message.toLowerCase();
    const errors = extractErrors(aiResponse);

    // Update memory
    if (hasError) {
      profile.streak = Math.max(0, profile.streak - 1); // Reset on error
      profile.weakPoints = mergeWeakPoints(profile.weakPoints, errors);
    } else {
      profile.streak += 1;
    }

    profile.totalSessions += 1;
    profile.lastActive = new Date().toISOString();

    // Save updates
    await memory.updateProfile(profile);
    await memory.addToSessionLog({
      input: message,
      correction,
      explanation,
      errors
    });
    await memory.appendToLedger({
      action: 'chat_session',
      hasError,
      errorCount: errors.length,
      streakAfter: profile.streak
    });

    // Response
    return json({
      success: true,
      correction,
      explanation,
      drill,
      hook,
      streak: profile.streak,
      weakPoints: profile.weakPoints.slice(0, 3),
      sessionCount: profile.totalSessions
    });
  } catch (error) {
    console.error('Chat error:', error);
    return json({ error: 'Failed to process message' }, { status: 500 });
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function extractErrors(response) {
  // Simple extraction — look for phoneme and grammar mentions
  const errors = [];
  const phonemes = ['θ', 'ʃ', 'ʒ', 'ŋ', 'ɹ'];
  const grammar = ['past tense', 'article', 'subject-verb', 'preposition', 'plural'];

  grammar.forEach(g => {
    if (response.toLowerCase().includes(g)) errors.push(g);
  });

  return errors.slice(0, 2); // Top 2 errors
}

function mergeWeakPoints(current, newErrors) {
  const merged = [...current];
  newErrors.forEach(err => {
    if (!merged.includes(err)) merged.push(err);
  });
  return merged.slice(0, 5); // Keep top 5
}

// ============================================================
// L1 — ROUTING (Entry Points)
// ============================================================

router.post('/api/chat', handleChat);

router.get('/api/user/:userId', async (req, env) => {
  const { userId } = req.params;
  const memory = new UserMemory(userId, env);
  const profile = await memory.getProfile();
  return json(profile);
});

router.post('/api/user/:userId/reset', async (req, env) => {
  const { userId } = req.params;
  const memory = new UserMemory(userId, env);
  await memory.updateProfile({
    streak: 0,
    weakPoints: [],
    totalSessions: 0
  });
  return json({ success: true });
});

router.get('/health', () => {
  return json({ status: 'OBI is running' });
});

// ============================================================
// ERROR HANDLER
// ============================================================

router.all('*', () => {
  return json({ error: 'Not found' }, { status: 404 });
});

// ============================================================
// EXPORT
// ============================================================

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env);
  }
};
