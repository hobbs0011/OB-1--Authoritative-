// src/retention-engine.js — Daily Retention Loop (Run 325)
// Purpose: Transform one-time corrections into daily behavioral habits
// System: Streak tracking, weak skill drilling, milestone bonuses, accountability

export async function handleRetentionCheck(env) {
  // Runs every 6 hours
  // Identify students who haven't checked in (24h+ silent)
  // Send retention signal (Telegram/Email)

  try {
    const ledger = env.LEDGER.get(env.LEDGER.idFromName('system-ledger'));
    const ledgerStats = await ledger.fetch(new Request('https://do/stats'));
    const stats = await ledgerStats.json();

    const students = stats.byStudent || [];
    const now = Date.now();
    const retention_targets = [];

    for (const student of students) {
      const sid = student.student_id;

      // Get current student state
      const stub = env.STUDENTS.get(env.STUDENTS.idFromName(sid));
      const stateRes = await stub.fetch(new Request('https://internal.student/state'));
      const state = await stateRes.json();

      const hoursSilent = (now - (state.lastActive || 0)) / 3600000;

      // Trigger notifications at key intervals
      let signal = null;
      if (hoursSilent >= 24 && hoursSilent < 30) {
        signal = 'day_1_silent'; // First missed day
      } else if (hoursSilent >= 48 && hoursSilent < 54) {
        signal = 'day_2_silent'; // Streak break risk
      } else if (hoursSilent >= 72) {
        signal = 'day_3_plus_silent'; // Critical reengagement needed
      }

      if (signal) {
        retention_targets.push({
          student_id: sid,
          signal: signal,
          hours_silent: Math.round(hoursSilent),
          streak_at_risk: state.streak || 0,
          level: state.level || 'A1',
          weak_skill: state.weakSkills?.phonemes?.[0] || state.weakSkills?.grammar?.[0] || 'general',
        });
      }
    }

    return {
      ok: true,
      targets_identified: retention_targets.length,
      targets: retention_targets,
      ts: now,
    };
  } catch (e) {
    console.error('[retention check] error:', e.message);
    return { error: e.message, ok: false };
  }
}

export async function handleStreakUpdate(studentId, env) {
  // Called after every successful session
  // Increments streak, checks milestones, logs to Heavy Ledger

  try {
    const stub = env.STUDENTS.get(env.STUDENTS.idFromName(studentId));
    const stateRes = await stub.fetch(new Request('https://internal.student/state'));
    const state = await stateRes.json();

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Check if new day
    const lastActive = state.lastActive || 0;
    const isNewDay = (now - lastActive) > dayMs;

    let updatedStreak = state.streak || 0;
    if (isNewDay) {
      updatedStreak += 1;
    }

    // Log to Heavy Ledger
    const ledger = env.LEDGER.get(env.LEDGER.idFromName('system-ledger'));
    await ledger.fetch(new Request('https://do/append', {
      method: 'POST',
      body: JSON.stringify({
        studentId: studentId,
        eventType: 'streak_update',
        payload: {
          streak: updatedStreak,
          is_new_day: isNewDay,
          milestone_triggered: STREAK_MILESTONES.includes(updatedStreak),
        },
      }),
    }));

    // Update DO
    const updateRes = await stub.fetch(new Request('https://internal.student/session-start', {
      method: 'POST',
    }));

    const updatedState = await updateRes.json();

    return {
      ok: true,
      student_id: studentId,
      streak: updatedState.streak,
      is_new_day: isNewDay,
      milestone: STREAK_MILESTONES.includes(updatedState.streak) ? updatedState.streak : null,
    };
  } catch (e) {
    console.error('[streak update] error:', e.message);
    return { error: e.message, ok: false };
  }
}

export async function handleWeakSkillDrill(studentId, env) {
  // Send targeted drill for student's weakest skill (from Star Map)
  // Called on Day 3, 7, 14 if streak is active

  try {
    const stub = env.STUDENTS.get(env.STUDENTS.idFromName(studentId));
    const stateRes = await stub.fetch(new Request('https://internal.student/state'));
    const state = await stateRes.json();

    if (state.weakSkills?.phonemes?.length === 0 && state.weakSkills?.grammar?.length === 0) {
      return { ok: true, message: 'no weak skills yet' };
    }

    const weakest = state.weakSkills.phonemes[0] || state.weakSkills.grammar[0];

    const drill = {
      student_id: studentId,
      skill: weakest,
      drill_type: weakest.startsWith('/') ? 'phoneme' : 'grammar',
      reps: 3,
      created_at: Date.now(),
      message: generateDrillPrompt(weakest, state.level),
    };

    // Log drill assignment
    const ledger = env.LEDGER.get(env.LEDGER.idFromName('system-ledger'));
    await ledger.fetch(new Request('https://do/append', {
      method: 'POST',
      body: JSON.stringify({
        studentId: studentId,
        eventType: 'drill_assigned',
        payload: drill,
      }),
    }));

    return { ok: true, drill };
  } catch (e) {
    console.error('[weak skill drill] error:', e.message);
    return { error: e.message, ok: false };
  }
}

export async function handleMilestoneBonus(streak, studentId, env) {
  // Award bonus XP + achievement unlocked at milestone days (1, 3, 7, 30)

  if (!STREAK_MILESTONES.includes(streak)) {
    return { ok: true, message: 'no milestone' };
  }

  try {
    const bonusXp = MILESTONE_BONUSES[streak] || 0;
    const message = MILESTONE_MESSAGES[streak] || 'Great work!';

    // Log to Heavy Ledger
    const ledger = env.LEDGER.get(env.LEDGER.idFromName('system-ledger'));
    await ledger.fetch(new Request('https://do/append', {
      method: 'POST',
      body: JSON.stringify({
        studentId: studentId,
        eventType: 'milestone_reached',
        payload: {
          streak: streak,
          bonus_xp: bonusXp,
          message: message,
        },
      }),
    }));

    return {
      ok: true,
      milestone: streak,
      bonus_xp: bonusXp,
      message: message,
    };
  } catch (e) {
    console.error('[milestone bonus] error:', e.message);
    return { error: e.message, ok: false };
  }
}

export async function handleDriftDetection(studentId, env) {
  // Compare Star Map expectation vs actual Ledger performance
  // Trigger recalibration if mismatch > threshold

  try {
    const stub = env.STUDENTS.get(env.STUDENTS.idFromName(studentId));
    const stateRes = await stub.fetch(new Request('https://internal.student/state'));
    const state = await stateRes.json();

    // Get recent ledger entries
    const ledger = env.LEDGER.get(env.LEDGER.idFromName('system-ledger'));
    const historyRes = await ledger.fetch(
      new Request(`https://do/history?limit=20`)
    );
    const history = await historyRes.json();

    // Count recent mistakes by skill
    const recentEvents = history.entries || [];
    const mistakesBySkill = {};

    for (const entry of recentEvents) {
      let payload = {};
      try { payload = JSON.parse(entry.payload); } catch (_) {}

      if (entry.event_type === 'student_interaction' && payload.mistake_pattern) {
        const skill = payload.mistake_pattern;
        mistakesBySkill[skill] = (mistakesBySkill[skill] || 0) + 1;
      }
    }

    // Compare Star Map (state.weakSkills) vs actual (mistakesBySkill)
    const driftScores = {};
    for (const skill of state.weakSkills.phonemes) {
      const actualMistakes = mistakesBySkill[`phoneme_${skill}`] || 0;
      const starMapConfidence = 0.5; // Assume equal confidence per tracked skill
      const driftScore = Math.abs(actualMistakes - starMapConfidence * 5);
      driftScores[skill] = driftScore;
    }

    // Identify high drift (threshold = 2.0)
    const DRIFT_THRESHOLD = 2.0;
    const highDriftSkills = Object.entries(driftScores)
      .filter(([_, score]) => score > DRIFT_THRESHOLD)
      .map(([skill, _]) => skill);

    if (highDriftSkills.length > 0) {
      // Log drift detected
      const ledger = env.LEDGER.get(env.LEDGER.idFromName('system-ledger'));
      await ledger.fetch(new Request('https://do/append', {
        method: 'POST',
        body: JSON.stringify({
          studentId: studentId,
          eventType: 'drift_detected',
          payload: {
            high_drift_skills: highDriftSkills,
            drift_scores: driftScores,
            action: 'invalidate_local_starmap',
          },
        }),
      }));

      return {
        ok: true,
        drift_detected: true,
        skills_affected: highDriftSkills,
        action: 'recalibrate_star_map',
      };
    }

    return { ok: true, drift_detected: false };
  } catch (e) {
    console.error('[drift detection] error:', e.message);
    return { error: e.message, ok: false };
  }
}

// ── Constants ──────────────────────────────────────────────────

const STREAK_MILESTONES = [1, 3, 7, 14, 30];

const MILESTONE_BONUSES = {
  1: 10,   // First day
  3: 25,   // Three in a row
  7: 50,   // One week
  14: 100, // Two weeks
  30: 250, // One month
};

const MILESTONE_MESSAGES = {
  1: '🐭 Day 1. The journey starts. Every Tiger was once a Mouse.',
  3: '🐱 Day 3. Three in a row. You are not a mouse anymore.',
  7: '🐯 Day 7. One full week. Your brain is rewiring. Keep going.',
  14: '⚡ Day 14. Two weeks straight. This is discipline.',
  30: '👑 Day 30. Thirty days straight. That is not a student — that is a Tiger.',
};

function generateDrillPrompt(skill, level) {
  const templates = {
    '/θ/': {
      A1: 'Say "think" slowly. /θ/ sound. Try: think, three, thank you.',
      A2: 'Minimal pairs: think vs sink. Which sounds different?',
      B1: 'Record yourself saying: "I think that\'s three thank yous."',
    },
    'past_tense': {
      A1: 'Past tense: I go → I went. You go → You went.',
      A2: 'Irregular verbs: go→went, see→saw, eat→ate.',
      B1: 'Yesterday I ___ (go). Yesterday I ___ (see) him.',
    },
    'articles': {
      A1: 'A vs The: "This is a book. The book is red."',
      A2: 'Use "a" for first mention, "the" for repeat.',
      B1: 'Fill the blanks with a/an/the correctly.',
    },
  };

  const skillTemplate = templates[skill] || templates['/θ/'];
  return skillTemplate[level] || skillTemplate.A1;
}
