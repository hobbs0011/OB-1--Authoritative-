// Oktava Portal Worker
// Cloudflare Workers API Router for Oktava English Class
// Deploy: wrangler pages deploy public/oktava-login

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
          return handleHealth(env, corsHeaders);

        case '/api/deepgram':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleDeepgram(request, env, corsHeaders);

        case '/api/chat':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleChat(request, env, corsHeaders);

        case '/api/stats':
          return handleStats(env, corsHeaders);

        case '/api/classroom/session/start':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleSessionStart(request, env, corsHeaders);

        case '/api/classroom/event':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleClassroomEvent(request, env, corsHeaders);

        case '/api/classroom/session':
          if (request.method === 'GET') return handleSessionGet(request, env, corsHeaders);
          return json({ error: 'GET only' }, corsHeaders, 405);

        default:
          return json({
            error: 'Not found',
            endpoints: ['/api/health', '/api/deepgram', '/api/chat', '/api/stats', '/api/classroom/session', '/api/classroom/event']
          }, corsHeaders, 404);
      }
    } catch (err) {
      return json({ error: 'Internal error', message: err.message }, corsHeaders, 500);
    }
  }
};

async function handleDeepgram(request, env, corsHeaders) {
  const apiKey = env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return json({ error: 'Deepgram API key not configured' }, corsHeaders, 500);
  }

  const body = await request.json();
  const { audioUrl, transcript } = body;

  if (!audioUrl && !transcript) {
    return json({ error: 'audioUrl or transcript required' }, corsHeaders, 400);
  }

  if (transcript) {
    return json({
      success: true,
      transcript: transcript,
      wordCount: transcript.split(/\s+/).length,
      source: 'manual'
    }, corsHeaders);
  }

  try {
    const response = await fetch(`https://api.deepgram.com/v1/listen?encoding=mp3&sample_rate=16000`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: audioUrl })
    });

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.status}`);
    }

    const data = await response.json();
    const transcript_text = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return json({
      success: true,
      transcript: transcript_text,
      wordCount: transcript_text.split(/\s+/).length,
      source: 'deepgram'
    }, corsHeaders);
  } catch (err) {
    return json({ error: 'Deepgram transcription failed', message: err.message }, corsHeaders, 500);
  }
}

async function handleChat(request, env, corsHeaders) {
  const { message, sessionId, level } = await request.json();

  if (!message || typeof message !== 'string') {
    return json({ error: 'Message required' }, corsHeaders, 400);
  }

  const sid = sessionId || crypto.randomUUID();
  const currentLevel = level || 'mouse';

  let reply, encouragement;

  if (currentLevel === 'mouse') {
    reply = getMouseResponse(message);
    encouragement = getEncouragement('mouse');
  } else if (currentLevel === 'cat') {
    reply = "That's a great point! I'm still getting my AI brain connected. Check back soon for real conversations!";
    encouragement = getEncouragement('cat');
  } else {
    reply = "I hear you! My full AI capabilities are coming online soon. For now, I'm a friendly placeholder.";
    encouragement = getEncouragement(currentLevel);
  }

  return json({
    reply,
    sessionId: sid,
    level: currentLevel,
    encouragement,
    timestamp: new Date().toISOString()
  }, corsHeaders);
}

async function handleStats(env, corsHeaders) {
  return json({
    service: 'OKTAVA-PORTAL',
    version: '0.1.0',
    features: {
      deepgram: !!env.DEEPGRAM_API_KEY,
      chat: true,
      levels: ['mouse', 'cat', 'wolf', 'tiger']
    }
  }, corsHeaders);
}

function getMouseResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! Welcome! I'm so glad you're here. How are you feeling today?";
  }
  if (lower.includes('good') || lower.includes('fine') || lower.includes('great')) {
    return "That's wonderful to hear! Tell me something interesting about your day.";
  }
  if (lower.includes('help') || lower.includes('learn')) {
    return "I'm here to help! The best way to learn is just to talk. Tell me about yourself.";
  }
  return "That's great! You're already practicing. Keep talking!";
}

function getEncouragement(level) {
  const encouragements = {
    mouse: ["Every word you type is progress!", "You're braver than you think!", "Mistakes are just practice in disguise."],
    cat: ["Your English is getting stronger!", "Look how far you've come!", "Keep this energy going!"],
    wolf: ["You're having real conversations now!", "Almost Tiger level!", "Your fluency is showing!"],
    tiger: ["You're a Tiger! Own it!", "Confident and fluent!", "Time to help other Mice!"]
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

async function kvGet(env, key) {
  if (!env.KV) return null;
  try {
    return await env.KV.get(key);
  } catch {
    return null;
  }
}

async function kvPut(env, key, value) {
  if (!env.KV) return;
  try {
    await env.KV.put(key, value);
  } catch {
    // KV rate-limited or unavailable — silently continue
  }
}

async function handleHealth(env, corsHeaders) {
  return json({
    ok: true,
    version: '0.1.0',
    service: 'OKTAVA-PORTAL',
    coach: 'Obi',
    routes: 7,
    timestamp: new Date().toISOString()
  }, corsHeaders);
}

async function handleSessionStart(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { classId, teacherId, totalStudents } = body;
    if (!classId) return json({ error: 'classId required' }, corsHeaders, 400);

    const sessionKey = `session:${classId}`;
    const existing = await kvGet(env, sessionKey);
    if (existing) {
      return json({ success: true, session: JSON.parse(existing), resumed: true }, corsHeaders);
    }

    const session = {
      classId,
      teacherId: teacherId || 'michael',
      totalStudents: totalStudents || 40,
      startedAt: Date.now(),
      events: []
    };

    await kvPut(env, sessionKey, JSON.stringify(session));
    return json({ success: true, session, resumed: false }, corsHeaders);
  } catch (err) {
    return json({ success: true, session: null, resumed: false, note: 'KV unavailable, operating in offline mode' }, corsHeaders);
  }
}

async function handleClassroomEvent(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { classId, studentId, type, ruleStatus, ts, notes } = body;
    if (!classId) return json({ error: 'classId required' }, corsHeaders, 400);

    const event = {
      classId,
      studentId: studentId || '',
      type: type || 'note',
      ruleStatus: ruleStatus || 'neutral',
      ts: ts || Date.now(),
      notes: notes || ''
    };

    const sessionKey = `session:${classId}`;
    const existing = await kvGet(env, sessionKey);
    if (existing) {
      const session = JSON.parse(existing);
      session.events.push(event);
      await kvPut(env, sessionKey, JSON.stringify(session));
    }

    return json({ success: true, event }, corsHeaders);
  } catch (err) {
    return json({ success: true, event: null, note: 'KV unavailable' }, corsHeaders);
  }
}

async function handleSessionGet(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const classId = url.searchParams.get('classId');
    const totalStudents = parseInt(url.searchParams.get('totalStudents') || '40');

    if (!classId) return json({ error: 'classId query param required' }, corsHeaders, 400);

    let events = [];
    const existing = await kvGet(env, `session:${classId}`);
    if (existing) {
      const session = JSON.parse(existing);
      events = session.events || [];
    }

    const totalEvents = events.length;
    const expectedEvents = totalStudents * 2;
    const complianceRate = expectedEvents > 0 ? Math.min(100, Math.round((totalEvents / expectedEvents) * 100)) : 0;

    return json({ events, complianceRate, totalEvents, totalStudents, classId }, corsHeaders);
  } catch {
    return json({ events: [], complianceRate: 0, totalEvents: 0, totalStudents: 0, classId: null }, corsHeaders);
  }
}