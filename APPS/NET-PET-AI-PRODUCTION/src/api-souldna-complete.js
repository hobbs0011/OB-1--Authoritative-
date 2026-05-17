// src/api-souldna-complete.js — Complete Soul DNA API (Student Memory Capture)
// /api/souldna endpoints: capture sessions + retrieve student state

import { buildSystemPrompt, buildUserPrompt, parseAIResponse, shouldUpdateWeakness } from './prompt-builder-complete.js';
import { buildStarMapRoute } from './star-map-embedder.js';

export async function handleSoulDNACapture(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { student_id, message, voice_input } = body;

    if (!student_id || (!message && !voice_input)) {
      return new Response(JSON.stringify({ error: 'student_id and (message or voice_input) required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = message || voice_input;

    // Get StudentDO
    const doId = env.STUDENTS.idFromName(student_id);
    const stub = env.STUDENTS.get(doId);

    // Retrieve current student state
    const stateResponse = await stub.fetch(new Request('https://internal.student/state'));
    const studentState = await stateResponse.json();

    // Generate Star Map routing
    const fakeEmbedding = {}; // TODO: real embedding in production
    const starMapRoute = buildStarMapRoute(studentState, fakeEmbedding);

    // Build prompt
    const systemPrompt = buildSystemPrompt(studentState);
    const userPrompt = buildUserPrompt(text, studentState, starMapRoute);

    // Call LLM (DeepSeek)
    let aiResponse = '';
    try {
      const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!deepseekResponse.ok) {
        throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
      }

      const deepseekData = await deepseekResponse.json();
      aiResponse = deepseekData.choices?.[0]?.message?.content || 'Error generating response.';
    } catch (e) {
      console.error('[Soul DNA] DeepSeek error:', e.message);
      aiResponse = `Let me think about that. You said: "${text}". Try again, but louder this time.`;
    }

    // Parse AI response
    const parsed = parseAIResponse(aiResponse);

    // Detect weakness pattern
    const mistakePattern = shouldUpdateWeakness(aiResponse, text);

    // Log interaction to StudentDO
    const interactionData = {
      input: text,
      correction: parsed.correction,
      mistake_pattern: mistakePattern,
      strategy_used: starMapRoute.strategy.method,
      level: studentState.level,
    };

    const logResponse = await stub.fetch(new Request('https://internal.student/log-interaction', {
      method: 'POST',
      body: JSON.stringify(interactionData),
    }));

    if (!logResponse.ok) {
      throw new Error('Failed to log interaction');
    }

    const updatedState = await logResponse.json();

    // Build retention signal (streak flame, weak pattern focus, progress bar)
    const retentionSignal = {
      streak_flame: `🔥 ${updatedState.streak}-day streak`,
      weak_pattern: mistakePattern ? `Focus next: ${mistakePattern}` : 'Pattern discovered soon',
      progress_bar: `${updatedState.stats.totalCorrections} / 100 corrections`,
    };

    return new Response(JSON.stringify({
      correction: parsed.correction,
      next_action: starMapRoute.primarySkill,
      updated_state: {
        level: updatedState.level,
        streak: updatedState.streak,
        total_corrections: updatedState.stats.totalCorrections,
      },
      retention_signals: retentionSignal,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[handleSoulDNACapture] error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function handleSoulDNAStatus(request, env, student_id) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'GET only' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!student_id) {
      return new Response(JSON.stringify({ error: 'student_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get StudentDO
    const doId = env.STUDENTS.idFromName(student_id);
    const stub = env.STUDENTS.get(doId);

    // Retrieve current state
    const stateResponse = await stub.fetch(new Request('https://internal.student/state'));

    if (!stateResponse.ok) {
      return new Response(JSON.stringify({ error: 'Student not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const studentState = await stateResponse.json();

    return new Response(JSON.stringify({
      student_id: student_id,
      level: studentState.level,
      streak: studentState.streak,
      stats: studentState.stats,
      weakSkills: studentState.weakSkills,
      summary: studentState.summary,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[handleSoulDNAStatus] error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
