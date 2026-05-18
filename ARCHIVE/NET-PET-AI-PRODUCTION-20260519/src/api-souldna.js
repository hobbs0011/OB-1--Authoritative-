// src/api-souldna.js — /souldna endpoint for student session capture
// Run 323-325: Student memory system activation
// This captures daily student speech/correction sessions for memory building

export async function handleSoulDNACapture(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { student_id, session_data } = body;

    if (!student_id || !session_data) {
      return new Response(JSON.stringify({ error: 'student_id and session_data required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Session data structure
    const {
      text_input,
      correction,
      mistake,
      level,
      streak,
      timestamp,
    } = session_data;

    if (!text_input || !correction) {
      return new Response(JSON.stringify({ error: 'text_input and correction required in session_data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get or create student Durable Object
    const doId = env.SESSIONS.idFromName(student_id);
    const doStub = env.SESSIONS.get(doId);

    // Update student state in DO
    const updateResponse = await doStub.fetch('https://internal.session/update', {
      method: 'POST',
      body: JSON.stringify({
        input: text_input,
        correction: correction,
        mistake: mistake || 'general',
        timestamp: timestamp || Date.now(),
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`DO update failed: ${updateResponse.status}`);
    }

    // Get updated state for response
    const stateResponse = await doStub.fetch('https://internal.session/state');
    const updatedState = await stateResponse.json();

    // Return success with updated student profile
    return new Response(JSON.stringify({
      success: true,
      submission: {
        student_id,
        session_id: `SESS-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: timestamp || Date.now(),
      },
      student_state: {
        level: updatedState.level,
        streak: updatedState.streak,
        weak_skills: updatedState.weakSkills,
        summary: updatedState.summary,
        stats: updatedState.stats,
      },
      next_action: buildNextAction(updatedState),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('souldna endpoint error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
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

    // Get student state from DO
    const doId = env.SESSIONS.idFromName(student_id);
    const doStub = env.SESSIONS.get(doId);

    const stateResponse = await doStub.fetch('https://internal.session/state');
    const studentState = await stateResponse.json();

    return new Response(JSON.stringify({
      success: true,
      student_id,
      state: {
        level: studentState.level,
        streak: studentState.streak,
        last_active: studentState.lastActive,
        weak_skills: studentState.weakSkills,
        summary: studentState.summary,
        stats: studentState.stats,
        session_count: studentState.sessionHistory.length,
      },
      retention_signal: buildRetentionSignal(studentState),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('souldna status error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function buildNextAction(studentState) {
  // Determine what student should do next based on their state
  if (studentState.streak === 0) {
    return { type: 'START_SESSION', instruction: 'Start a new session to build your streak!' };
  }

  if (studentState.weakSkills.phonemes.length > 0) {
    return {
      type: 'PRACTICE_WEAKNESS',
      instruction: `Practice your weak sound: ${studentState.weakSkills.phonemes[0]}`,
    };
  }

  if (studentState.stats.totalSessions % 5 === 0) {
    return { type: 'CHECKPOINT', instruction: 'Time for a checkpoint! Let\'s review your progress.' };
  }

  return { type: 'CONTINUE', instruction: 'Keep practicing! Speak 3 more sentences.' };
}

function buildRetentionSignal(studentState) {
  const signals = [];

  if (studentState.streak > 0) {
    signals.push(`🔥 Streak: ${studentState.streak} days!`);
  }

  if (studentState.weakSkills.phonemes.length > 0) {
    signals.push(`📚 Practice: ${studentState.weakSkills.phonemes[0]}`);
  }

  const progressPercent = Math.floor((studentState.stats.totalSessions % 20) / 20 * 100);
  signals.push(`📈 Progress: ${progressPercent}% to next level`);

  return signals;
}
