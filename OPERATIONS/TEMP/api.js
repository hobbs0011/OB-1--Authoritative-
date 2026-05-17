// OBI API — Natural English Training
// Cloudflare Workers API Router
// Deploy: wrangler deploy

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      switch (url.pathname) {
        case '/api/health':
          return json({
            status: 'ok',
            service: 'NET-OBI-API',
            version: '0.1.0',
            timestamp: new Date().toISOString()
          }, corsHeaders);

        case '/api/waitlist':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleWaitlist(request, env, corsHeaders);

        case '/api/chat':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleChat(request, env, corsHeaders);

        case '/api/stats':
          return handleStats(env, corsHeaders);

        default:
          return json({
            error: 'Not found',
            endpoints: ['/api/health', '/api/waitlist', '/api/chat', '/api/stats']
          }, corsHeaders, 404);
      }
    } catch (err) {
      return json({ error: 'Internal error', message: err.message }, corsHeaders, 500);
    }
  }
};

// === WAITLIST HANDLER ===
async function handleWaitlist(request, env, corsHeaders) {
  const body = await request.json();
  const { email, name, source } = body;

  if (!email || !email.includes('@')) {
    return json({ error: 'Valid email required' }, corsHeaders, 400);
  }

  const entry = {
    email: email.toLowerCase().trim(),
    name: name || '',
    source: source || 'website',
    timestamp: new Date().toISOString(),
    ip: request.headers.get('CF-Connecting-IP') || 'unknown',
    country: request.headers.get('CF-IPCountry') || 'unknown'
  };

  // Store in KV (key = email for dedup, value = entry JSON)
  if (env.WAITLIST) {
    const existing = await env.WAITLIST.get(email.toLowerCase());
    if (existing) {
      return json({ success: true, message: 'Already on the waitlist!', duplicate: true }, corsHeaders);
    }
    await env.WAITLIST.put(email.toLowerCase(), JSON.stringify(entry));
  }

  return json({ success: true, message: 'Welcome to the waitlist!' }, corsHeaders);
}

// === CHAT HANDLER ===
async function handleChat(request, env, corsHeaders) {
  const { message, sessionId, level } = await request.json();

  if (!message || typeof message !== 'string') {
    return json({ error: 'Message required' }, corsHeaders, 400);
  }

  // Session management
  const sid = sessionId || crypto.randomUUID();
  const currentLevel = level || 'mouse';

  // Load conversation history from KV if available
  let history = [];
  if (env.SESSIONS && sessionId) {
    const stored = await env.SESSIONS.get(`session:${sessionId}`);
    if (stored) history = JSON.parse(stored);
  }

  // Add user message to history
  history.push({ role: 'user', content: message, timestamp: new Date().toISOString() });

  // === AI RESPONSE ===
  // TODO: Wire to Cloudflare Workers AI (@cf/meta/llama-3-8b-instruct or similar)
  // For now, contextual placeholder responses based on level
  let reply, corrections = [], encouragement = '';

  if (currentLevel === 'mouse') {
    reply = getMouseResponse(message);
    encouragement = getEncouragement('mouse');
  } else if (currentLevel === 'cat') {
    reply = "That's a great point! Let me think about that... I'm still getting my AI brain connected. Check back soon for real conversations!";
    encouragement = getEncouragement('cat');
  } else {
    reply = "I hear you! My full AI capabilities are coming online soon. For now, I'm just a friendly placeholder. 🐯";
    encouragement = getEncouragement(currentLevel);
  }

  // Add bot response to history
  history.push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });

  // Save session (keep last 50 messages)
  if (env.SESSIONS) {
    const trimmed = history.slice(-50);
    await env.SESSIONS.put(`session:${sid}`, JSON.stringify(trimmed), { expirationTtl: 86400 * 7 });
  }

  return json({
    reply,
    sessionId: sid,
    level: currentLevel,
    corrections,
    encouragement,
    messageCount: history.length
  }, corsHeaders);
}

// === STATS HANDLER ===
async function handleStats(env, corsHeaders) {
  // Basic stats for admin dashboard
  return json({
    service: 'NET-OBI-API',
    version: '0.1.0',
    features: {
      waitlist: !!env.WAITLIST,
      sessions: !!env.SESSIONS,
      ai: false // TODO: enable when Workers AI is wired
    },
    levels: ['mouse', 'cat', 'wolf', 'tiger']
  }, corsHeaders);
}

// === HELPER FUNCTIONS ===
function getMouseResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! Welcome! I'm so glad you're here. How are you feeling today? (Don't worry about mistakes — they're how we learn! 😊)";
  }
  if (lower.includes('good') || lower.includes('fine') || lower.includes('great')) {
    return "That's wonderful to hear! Tell me something interesting about your day. Even one sentence is perfect!";
  }
  if (lower.includes('help') || lower.includes('learn')) {
    return "I'm here to help! The best way to learn is just to talk. Tell me about yourself — what do you do? Where are you from?";
  }
  return "That's great — you're already practicing! My full AI brain is still being connected, but I can already tell you're going to be a Tiger in no time. Keep talking! 🐯";
}

function getEncouragement(level) {
  const encouragements = {
    mouse: ["Every word you type is progress! 🐭", "You're braver than you think! 💪", "Mistakes are just practice in disguise ✨"],
    cat: ["Your English is getting stronger! 🐱", "Look how far you've come! 🌟", "Keep this energy going! 🔥"],
    wolf: ["You're having real conversations now! 🐺", "Almost Tiger level! 💪", "Your fluency is showing! ⚡"],
    tiger: ["You're a Tiger! Own it! 🐯", "Confident and fluent — that's you! 🔥", "Time to help other Mice! 🌟"]
  };
  const pool = encouragements[level] || encouragements.mouse;
  return pool[Math.floor(Math.random() * pool.length)];
}

function json(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
