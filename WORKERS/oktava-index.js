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
          return json({
            status: 'ok',
            service: 'OKTAVA-PORTAL',
            version: '0.1.0',
            timestamp: new Date().toISOString()
          }, corsHeaders);

        case '/api/deepgram':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleDeepgram(request, env, corsHeaders);

        case '/api/chat':
          if (request.method !== 'POST') return json({ error: 'POST only' }, corsHeaders, 405);
          return handleChat(request, env, corsHeaders);

        case '/api/stats':
          return handleStats(env, corsHeaders);

        default:
          return json({
            error: 'Not found',
            endpoints: ['/api/health', '/api/deepgram', '/api/chat', '/api/stats']
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