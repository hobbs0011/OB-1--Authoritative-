// src/api-speak.js — /api/speak endpoint for voice correction
// Run 323 Correction Engine: LLM feedback + rule-based classification + pronunciation guidance

import {
  classifyErrorRules,
  enrichCorrectionResponse,
  PatternTracker,
  buildEscalationSignal,
  getRepeatInstruction,
} from './correction-engine.js';

// Global pattern tracker (in production, use Durable Object for persistence)
const globalPatternTracker = new PatternTracker();

export async function handleSpeak(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { text, student_id } = body;

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!student_id) {
      return new Response(JSON.stringify({ error: 'student_id required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate LLM key
    if (!env.DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: 'LLM not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // STEP 1: Rule-based error classification (faster than LLM)
    const ruleMatches = classifyErrorRules(text);

    // Call LLM for correction
    const correctionPrompt = `You are an English tutor for Vietnamese speakers. 
Student said: "${text}"

Task: Correct their English and find the ONE most important error.

Return ONLY valid JSON (no markdown, no extra text):
{
  "corrected": "the corrected sentence",
  "mistake": "the error type (e.g., 'missing article', 'wrong tense')",
  "explanation": "why this is wrong and how to fix it (1 sentence)",
  "pronunciation_note": "pronunciation guidance if relevant, else null",
  "repeat_instruction": "tell them what to say next"
}`;

    const llmResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: correctionPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text();
      console.error('LLM error:', llmResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'LLM request failed', details: errorText }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const llmData = await llmResponse.json();
    const llmMessage = llmData.choices?.[0]?.message?.content || '';

    // Parse LLM JSON response
    let correction;
    try {
      correction = JSON.parse(llmMessage);
    } catch (e) {
      console.error('Failed to parse LLM JSON:', llmMessage);
      return new Response(JSON.stringify({ error: 'LLM returned invalid JSON', raw: llmMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // STEP 2: Enrich LLM response with rule-based classification + pronunciation
    const enrichedCorrection = enrichCorrectionResponse(correction, ruleMatches, text);

    // STEP 3: Pattern detection for repeated errors
    const trackingResult = globalPatternTracker.detectRepeatedError(
      student_id,
      ruleMatches?.[0]?.category || correction.mistake
    );
    globalPatternTracker.recordError(
      student_id,
      ruleMatches?.[0]?.category || correction.mistake
    );

    // Build escalation signal if student stuck on same error
    const escalationSignal = buildEscalationSignal(trackingResult, student_id);

    // STEP 4: Smart repeat instruction based on error category
    const smartRepeatInstruction = ruleMatches
      ? getRepeatInstruction(ruleMatches[0].category, correction.corrected)
      : correction.repeat_instruction;

    // Log to Durable Object (Run 325 feature, but structure prepared now)
    try {
      const sessionDO = env.SESSIONS.get(student_id);
      await sessionDO.fetch('https://internal.session/log-correction', {
        method: 'POST',
        body: JSON.stringify({
          original_text: text,
          corrected: enrichedCorrection.corrected,
          mistake: enrichedCorrection.mistake,
          rule_category: ruleMatches?.[0]?.category || null,
          repeated_error: trackingResult.isRepeated,
          escalation_signal: escalationSignal,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (doError) {
      console.warn('Failed to log to DO:', doError);
      // Don't block response on logging failure
    }

    // Return correction response to client
    return new Response(JSON.stringify({
      success: true,
      original: text,
      corrected: enrichedCorrection.corrected,
      mistake: enrichedCorrection.mistake,
      explanation: enrichedCorrection.explanation,
      pronunciation_note: enrichedCorrection.pronunciation_note,
      pronunciation_category: enrichedCorrection.pronunciation_category || null,
      pronunciation_tip: enrichedCorrection.pronunciation_tip || null,
      repeat_instruction: smartRepeatInstruction,
      confidence: enrichedCorrection.confidence,
      rule_matches: enrichedCorrection.rule_matches,
      pattern_info: {
        is_repeated: trackingResult.isRepeated,
        error_count: trackingResult.count,
        escalation_signal: escalationSignal?.signal || null,
      },
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('speak endpoint error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
