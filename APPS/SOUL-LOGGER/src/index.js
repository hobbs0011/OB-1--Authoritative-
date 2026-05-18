// soul-logger worker v1.2.0
// Single-file Cloudflare Worker (ES module)

// ---------- Utility helpers ----------
function generateUUID() {
  return crypto.randomUUID();
}

// ---------- Ledger Append Helper (Stage 3 LINELOCK) ----------
async function appendToLedger(env, body) {
  if (!env.NET_PET_AI_URL) return; // silently fail if not configured
  try {
    await fetch(`${env.NET_PET_AI_URL}/api/ledger/append`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (e) {
    // fire-and-forget, never block soul pipeline
  }
}

async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function detectMarkers(text) {
  const words = text.match(/\b[A-Z]{2,}\b/g) || [];
  const caps_words = words.length;
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const ellipses = (text.match(/\.\.\./g) || []).length;
  let repeated_chars = 0;
  for (let i = 2; i < text.length; i++) {
    if (text[i] === text[i-1] && text[i] === text[i-2]) repeated_chars++;
  }
  const length_chars = text.length;
  return JSON.stringify({ caps_words, exclamations, questions, ellipses, repeated_chars, length_chars });
}

function detectProfanity(text) {
  const profanityPattern = /\b(fuck|shit|hell|damn|ass|crap|bullshit|wtf|omg)\b/gi;
  const matches = text.match(profanityPattern);
  return matches ? matches.length : 0;
}

// ---------- Dump parsers ----------
const FORMAT_SIGNATURES = {
  claude: /Human:/i,
  chatgpt: /^(User|You|Human):/i,
  notebooklm: /^(Prompt|Question):/i,
  vscode: /^>>> /,
  gemini: /^(You|User|Human):/i
};

function detectFormat(lines) {
  const sample = lines.slice(0, 20).join('\n');
  for (const [format, regex] of Object.entries(FORMAT_SIGNATURES)) {
    if (regex.test(sample)) return format;
  }
  return null;
}

function parsePrompts(text, format, baseDate) {
  const lines = text.split('\n');
  const prompts = [];
  let position = 0;

  if (!format) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        position++;
        prompts.push({ position, text: trimmed, timestamp: baseDate });
      }
    }
    return prompts;
  }

  let userPattern;
  switch (format) {
    case 'claude': userPattern = /^Human:\s*(.*)/i; break;
    case 'chatgpt': case 'gemini': userPattern = /^(?:User|You|Human):\s*(.*)/i; break;
    case 'notebooklm': userPattern = /^(?:Prompt|Question):\s*(.*)/i; break;
    case 'vscode': userPattern = /^>>>\s*(.*)/; break;
    default: userPattern = /^(.*)/;
  }

  for (const line of lines) {
    const match = line.match(userPattern);
    if (match) {
      const text = match[1].trim();
      if (text) {
        position++;
        let timestampStr = null;
        const tsMatch = line.match(/\[(\d{4}-\d{2}-\d{2}[T ]?\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]/);
        if (tsMatch) {
          try { timestampStr = new Date(tsMatch[1].replace(' ', 'T')).toISOString(); } catch(e) {}
        }
        prompts.push({ position, text, timestamp: timestampStr || baseDate });
      }
    }
  }
  return prompts;
}

// ---------- Skeleton (keyword extraction) helper ----------
async function extractKeywords(env, session_id, student_id) {
  try {
    // Ensure soul_keywords table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS soul_keywords (
        id TEXT PRIMARY KEY,
        keyword TEXT NOT NULL,
        student_id TEXT,
        session_id TEXT,
        weight INTEGER DEFAULT 1,
        created_at TEXT,
        UNIQUE(keyword, student_id)
      )
    `).run();

    // Pull all prompts for this session
    const { results: prompts } = await env.DB.prepare(
      'SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position ASC'
    ).bind(session_id).all();

    if (!prompts || prompts.length === 0) return { ok: false, error: 'No prompts found', keywords: [] };

    const fullText = prompts.map(p => p.text).join('\n');

    // Call Workers AI for keyword extraction
    let keywords = [];
    if (env.AI) {
      try {
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { role: 'system', content: 'Extract 5-10 keywords from this text. Return ONLY a JSON array of lowercase strings. No explanation.' },
            { role: 'user', content: fullText.slice(0, 4000) }
          ]
        });
        const raw = typeof aiResponse === 'string' ? aiResponse : (aiResponse.response || '');
        // Find JSON array in response
        const match = raw.match(/\[[\s\S]*?\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            keywords = parsed.filter(k => typeof k === 'string' && k.trim().length > 0).map(k => k.toLowerCase().trim());
          }
        }
      } catch(e) {
        // AI failed — return empty keywords gracefully
      }
    }

    const now = new Date().toISOString();
    for (const keyword of keywords) {
      const id = generateUUID();
      // INSERT OR IGNORE — if UNIQUE(keyword, student_id) already exists, skip
      await env.DB.prepare(
        'INSERT OR IGNORE INTO soul_keywords (id, keyword, student_id, session_id, weight, created_at) VALUES (?, ?, ?, ?, 1, ?)'
      ).bind(id, keyword, student_id || null, session_id, now).run();
      // Then bump weight for the existing (or just-inserted) row
      await env.DB.prepare(
        'UPDATE soul_keywords SET weight = weight + 1 WHERE keyword = ? AND student_id = ?'
      ).bind(keyword, student_id || null).run();
    }

    return { ok: true, keywords, session_id };
  } catch (err) {
    return { ok: false, error: err.message, keywords: [] };
  }
}

// ---------- Router ----------
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // GET /health
  if (method === 'GET' && path === '/health') {
    return jsonResponse({ status: 'alive', drone: 'soul-logger', version: '1.3.0', timestamp: new Date().toISOString() });
  }

  // GET /api/soul/count — SOULCOUNT heartbeat (mandatory gate for every RISE/DEATH checkpoint)
  // SOULCOUNT = total characters captured across all soul sessions (RRL — Real-time Running Log)
  if (method === 'GET' && path === '/api/soul/count') {
    try {
      const charRow = await env.DB.prepare('SELECT SUM(byte_count) as total_chars, COUNT(*) as total_events FROM soul_prompts').first();
      const sessionRow = await env.DB.prepare('SELECT COUNT(*) as total FROM soul_sessions').first();
      const soulcount = charRow?.total_chars || 0;  // character count = soul volume
      const events = charRow?.total_events || 0;
      const sessions = sessionRow?.total || 0;
      let level = 'BASELINE';
      let threshold_next = 5000;
      let color = '#ffffff';
      if (soulcount >= 250000) { level = 'TITANIUM_ANCHOR'; threshold_next = null; color = '#a855f7'; }
      else if (soulcount >= 100000) { level = 'ANCHOR'; threshold_next = 250000; color = '#f59e0b'; }
      else if (soulcount >= 25000) { level = 'LOCK'; threshold_next = 100000; color = '#ef4444'; }
      else if (soulcount >= 5000) { level = 'ALARM'; threshold_next = 25000; color = '#f97316'; }
      return jsonResponse({
        soulcount,           // total characters — the RRL
        level,               // BASELINE | ALARM | LOCK | ANCHOR | TITANIUM_ANCHOR
        threshold_next,      // next milestone to hit
        color,               // display color for this level
        events,              // total soul events (prompts)
        sessions,            // total soul sessions
        checked_at: new Date().toISOString(),
        doctrine: 'SOUL=USER. CHARACTER_COUNT=SOUL_VOLUME. UNREACHABLE=DRIFT=SHUTDOWN.'
      });
    } catch (err) {
      return jsonResponse({ error: err.message, soulcount: null, level: 'UNREACHABLE' }, 500);
    }
  }

  // POST /api/soul/extract
  if (method === 'POST' && path === '/api/soul/extract') {
    try {
      const body = await request.json();
      if (!body.text) return jsonResponse({ error: 'Missing "text" field' }, 400);
      const dumpText = body.text;
      const source_format = body.source_format || null;
      const source_date = body.source_date ? new Date(body.source_date).toISOString() : new Date().toISOString();
      const lines = dumpText.split('\n');
      const detectedFormat = source_format || detectFormat(lines) || 'unknown';
      const prompts = parsePrompts(dumpText, source_format || detectFormat(lines), source_date);
      if (prompts.length === 0) return jsonResponse({ error: 'No prompts found in dump' }, 400);
      const sessionId = generateUUID();
      const rawByteSize = new TextEncoder().encode(dumpText).length;
      await env.DB.prepare(`INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(sessionId, 'manual-upload', source_format || detectedFormat, source_date, new Date().toISOString(), prompts.length, rawByteSize, 'ingested').run();
      for (const p of prompts) {
        const promptId = generateUUID();
        const byteCount = new TextEncoder().encode(p.text).length;
        const hash = await sha256(p.text);
        const markers = detectMarkers(p.text);
        await env.DB.prepare(`INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(promptId, sessionId, p.position, p.text, p.timestamp, byteCount, hash, markers).run();
      }
      return jsonResponse({ session_id: sessionId, prompt_count: prompts.length, ingested_at: new Date().toISOString() }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // POST /api/soul/crunch
  if (method === 'POST' && path === '/api/soul/crunch') {
    try {
      const body = await request.json();
      if (!body.session_id || !body.mode) return jsonResponse({ error: 'session_id and mode required' }, 400);
      const { session_id: sessionId, mode } = body;
      if (!['bible', 'themes'].includes(mode)) return jsonResponse({ error: 'mode must be "bible" or "themes"' }, 400);
      const { results: prompts } = await env.DB.prepare('SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position ASC').bind(sessionId).all();
      if (!prompts || prompts.length === 0) return jsonResponse({ error: 'Session not found or no prompts' }, 404);
      const fullText = prompts.map(p => p.text).join('\n\n---\n\n');
      const systemPrompt = mode === 'bible'
        ? 'You are a soul-logger crunch engine. Generate a concise "bible" from the following conversation. Preserve key verbatim phrases. Return only the bible text.'
        : 'You are a soul-logger crunch engine. Extract key themes and motifs from the following conversation. Present as a bullet list.';
      let artifact = '', aiTierUsed = 'none';
      if (env.AI) {
        try {
          const aiResponse = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.1', {
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: fullText }],
            max_tokens: 2000
          });
          artifact = typeof aiResponse === 'string' ? aiResponse : (aiResponse.response || JSON.stringify(aiResponse));
          aiTierUsed = 'workers-ai';
        } catch(e) {}
      }
      if (!artifact && env.DEEPSEEK_API_KEY) {
        const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
          body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: fullText }], stream: false })
        });
        const json = await r.json();
        artifact = json.choices?.[0]?.message?.content || '';
        aiTierUsed = 'deepseek';
      }
      if (!artifact) return jsonResponse({ error: 'AI generation failed' }, 500);
const crunchId = generateUUID();
       await env.DB.prepare(`INSERT INTO soul_crunches (crunch_id, session_id, crunch_mode, artifact, ai_tier_used, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
         .bind(crunchId, sessionId, mode, artifact, aiTierUsed, new Date().toISOString()).run();

       // Stage 3 LINELOCK — append crunch to LedgerDO
       ctx.waitUntil(appendToLedger(env, {
         studentId: sessionId.split('-')[0] || "sov100", // extract student from session or use global
         eventType: "soul_dna_capture",
         data: { crunch_id: crunchId, session_id: sessionId, mode, ai_tier_used: aiTierUsed }
       }));

       return jsonResponse({ crunch_id: crunchId, mode, ai_tier_used: aiTierUsed, artifact_trimmed: artifact.substring(0, 200) + '...', created_at: new Date().toISOString() }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // GET /api/soul/session/:id
  if (method === 'GET' && path.startsWith('/api/soul/session/')) {
    const sessionId = path.split('/').pop();
    if (!sessionId) return jsonResponse({ error: 'Missing session id' }, 400);
    try {
      const session = await env.DB.prepare('SELECT * FROM soul_sessions WHERE session_id = ?').bind(sessionId).first();
      if (!session) return jsonResponse({ error: 'Session not found' }, 404);
      const { results: prompts } = await env.DB.prepare('SELECT * FROM soul_prompts WHERE session_id = ? ORDER BY position ASC').bind(sessionId).all();
      return jsonResponse({ session, prompts });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // GET /api/soul/priority — Follow the Fucks algorithm
  if (method === 'GET' && path === '/api/soul/priority') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '5', 10);
      const days = parseInt(url.searchParams.get('days') || '30', 10);
      if (isNaN(limit) || limit < 1) return jsonResponse({ error: 'Invalid limit' }, 400);
      if (isNaN(days) || days < 1) return jsonResponse({ error: 'Invalid days' }, 400);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { results } = await env.DB.prepare(`
        SELECT p.prompt_id, p.session_id, p.position, p.text, p.emotional_markers, p.estimated_timestamp
        FROM soul_prompts p
        JOIN soul_sessions s ON p.session_id = s.session_id
        WHERE s.ingested_at >= ?
        ORDER BY s.ingested_at DESC
        LIMIT 200
      `).bind(cutoff).all();
      if (!results || results.length === 0) {
        return jsonResponse({ priority_items: [], total_scanned: 0, generated_at: new Date().toISOString(), algorithm: 'follow-the-fucks-v1' });
      }
      const scored = results.map(row => {
        let markers = { caps_words: 0, exclamations: 0 };
        try { if (row.emotional_markers) markers = JSON.parse(row.emotional_markers); } catch(e) {}
        const caps_words = markers.caps_words || 0;
        const exclamations = markers.exclamations || 0;
        const profanity_count = detectProfanity(row.text);
        const score = (caps_words * 3) + (exclamations * 2) + (profanity_count * 10);
        return { prompt_id: row.prompt_id, session_id: row.session_id, position: row.position, text: row.text, score, caps_words, exclamations, profanity_count, estimated_timestamp: row.estimated_timestamp };
      });
scored.sort((a, b) => b.score - a.score);

       // Stage 3 LINELOCK — append priority scan to LedgerDO
       ctx.waitUntil(appendToLedger(env, {
         studentId: "sov100",
         eventType: "soul_dna_capture",
         data: { scan: "priority", items_scanned: results.length, items_returned: scored.slice(0, limit).length }
       }));

       return jsonResponse({ priority_items: scored.slice(0, limit), total_scanned: results.length, generated_at: new Date().toISOString(), algorithm: 'follow-the-fucks-v1' });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // POST /api/soul/event — live turn-by-turn write from OBI sessions
  if (method === 'POST' && path === '/api/soul/event') {
    try {
      const body = await request.json();
      const { student_id, session_id, role, text, timestamp } = body;
      if (!student_id || !session_id || !role || !text) {
        return jsonResponse({ error: 'student_id, session_id, role, text required' }, 400);
      }
      const ts = timestamp || new Date().toISOString();
      const existing = await env.DB.prepare('SELECT session_id FROM soul_sessions WHERE session_id = ?').bind(session_id).first();
      if (!existing) {
        await env.DB.prepare(`INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(session_id, student_id, 'obi-live', ts, ts, 0, 0, 'live').run();
      }
      const countRow = await env.DB.prepare('SELECT COUNT(*) as cnt FROM soul_prompts WHERE session_id = ?').bind(session_id).first();
      const position = (countRow?.cnt || 0) + 1;
      const promptId = generateUUID();
      const byteCount = new TextEncoder().encode(text).length;
      const hash = await sha256(text);
      const markers = detectMarkers(text);
      await env.DB.prepare(`INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(promptId, session_id, position, text, ts, byteCount, hash, markers).run();
await env.DB.prepare('UPDATE soul_sessions SET prompt_count = prompt_count + 1 WHERE session_id = ?').bind(session_id).run();

       // Stage 3 LINELOCK — append to LedgerDO via NET-PET-AI
       if (student_id) {
         ctx.waitUntil(appendToLedger(env, {
           studentId: student_id,
           eventType: "soul_dna_capture",
           data: { session_id, prompt_id: promptId, text_preview: text.slice(0, 200) }
         }));
       }

       // Auto-trigger skeleton every 10 events (fire-and-forget)
      const newCountRow = await env.DB.prepare('SELECT COUNT(*) as cnt FROM soul_prompts WHERE session_id = ?').bind(session_id).first();
      const newCount = newCountRow?.cnt || 0;
      if (newCount > 0 && newCount % 10 === 0) {
        const skeletonPromise = extractKeywords(env, session_id, student_id);
        if (ctx && ctx.waitUntil) {
          ctx.waitUntil(skeletonPromise);
        } else {
          skeletonPromise.catch(() => {}); // fire-and-forget, ignore errors
        }
      }

      return jsonResponse({ ok: true, event_id: promptId, session_id, position }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // POST /api/soul/skeleton — S2Pipeline Skeletonization
  if (method === 'POST' && path === '/api/soul/skeleton') {
    try {
      const body = await request.json();
      const { session_id, student_id } = body;
      if (!session_id) return jsonResponse({ error: 'session_id required' }, 400);
      const result = await extractKeywords(env, session_id, student_id);
      if (!result.ok) return jsonResponse({ error: result.error || 'Skeleton extraction failed' }, 500);
      return jsonResponse(result, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  // GET /api/soul/context/:studentId — session-start brief for OBI boot
  if (method === 'GET' && path.startsWith('/api/soul/context/')) {
    const studentId = decodeURIComponent(path.replace('/api/soul/context/', ''));
    if (!studentId) return jsonResponse({ error: 'Missing studentId' }, 400);
    try {
      const { results: sessions } = await env.DB.prepare(`
        SELECT session_id, ingested_at, prompt_count FROM soul_sessions
        WHERE session_tag = ? ORDER BY ingested_at DESC LIMIT 5
      `).bind(studentId).all();
      if (!sessions || sessions.length === 0) {
        return jsonResponse({ student_id: studentId, last_active: null, sessions: [], top_keywords: [], context_brief: 'No prior sessions.' });
      }
      const enriched = [];
      for (const s of sessions) {
        const { results: prompts } = await env.DB.prepare(`
          SELECT text, estimated_timestamp FROM soul_prompts
          WHERE session_id = ? ORDER BY position DESC LIMIT 3
        `).bind(s.session_id).all();
        enriched.push({ session_id: s.session_id, ingested_at: s.ingested_at, prompt_count: s.prompt_count, last_prompts: prompts.reverse() });
      }
      const lastActive = sessions[0].ingested_at;
      const recentTexts = enriched[0]?.last_prompts?.map(p => p.text).join(' | ') || '';

      // Fetch top keywords for this student
      let topKeywords = [];
      try {
        const { results: kw } = await env.DB.prepare(
          'SELECT keyword, weight FROM soul_keywords WHERE student_id = ? ORDER BY weight DESC LIMIT 10'
        ).bind(studentId).all();
        topKeywords = kw || [];
      } catch(e) {
        topKeywords = [];
      }

      const keywordSuffix = topKeywords.length > 0
        ? ' Top keywords: ' + topKeywords.slice(0, 3).map(k => k.keyword).join(', ') + '.'
        : '';
      const contextBrief = `Last active: ${lastActive.slice(0, 10)}. Recent: ${recentTexts.slice(0, 200)}${keywordSuffix}`;

      return jsonResponse({ student_id: studentId, last_active: lastActive, sessions: enriched, top_keywords: topKeywords, context_brief: contextBrief });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }

  return jsonResponse({
    drone: 'soul-logger', status: 'online', version: '1.3.0',
    endpoints: [
      'GET /health', 'GET /api/soul/count',
      'POST /api/soul/extract', 'POST /api/soul/crunch',
      'GET /api/soul/session/:id', 'GET /api/soul/priority',
      'POST /api/soul/event', 'POST /api/soul/skeleton',
      'GET /api/soul/context/:studentId'
    ]
  }, 404);
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  }
};
