// src/student-do.js — StudentDO Durable Object (CORE SYSTEM)
// Run 323: Student Memory Architecture
// SINGLE SOURCE OF TRUTH for all student state

export class StudentDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // GET /state — Return current student state snapshot
    if (path === '/state' && request.method === 'GET') {
      const state = await this.getState();
      return new Response(JSON.stringify(state), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /update — Log interaction + update state
    if (path === '/update' && request.method === 'POST') {
      try {
        const body = await request.json();
        await this.logInteraction(body);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // POST /session-start — Begin new session (increment streak if day changed)
    if (path === '/session-start' && request.method === 'POST') {
      try {
        await this.startSession();
        const state = await this.getState();
        return new Response(JSON.stringify(state), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  async getState() {
    const stored = await this.state.storage.get('studentState');

    if (stored) {
      return stored;
    }

    // Initialize new student
    const newState = {
      studentId: 'unknown',
      level: 'A1',
      streak: 0,
      lastActive: 0,
      weakSkills: { phonemes: [], grammar: [] },
      sessionHistory: [],
      summary: 'New student. Starting their English learning journey.',
      stats: {
        totalSessions: 0,
        totalCorrections: 0,
        improvementRate: 0,
      },
    };

    await this.state.storage.put('studentState', newState);
    return newState;
  }

  async logInteraction(data) {
    const state = await this.getState();
    const { input, correction, mistake } = data;

    // Add to session history
    state.sessionHistory.push({
      input,
      correction,
      mistake: mistake || 'general',
      timestamp: Date.now(),
    });

    // Keep last 50 interactions only (MVP constraint)
    if (state.sessionHistory.length > 50) {
      state.sessionHistory.shift();
    }

    // Extract weak patterns
    state.weakSkills = this.extractWeaknesses(state.sessionHistory);

    // Update summary
    state.summary = this.compressSummary(state);

    // Update stats
    state.stats.totalCorrections++;

    // Persist
    await this.state.storage.put('studentState', state);
  }

  async startSession() {
    const state = await this.getState();
    const now = Date.now();

    // Check if it's a new day
    if (state.lastActive === 0) {
      state.streak = 1;
    } else {
      const lastActiveDate = new Date(state.lastActive).toDateString();
      const todayDate = new Date(now).toDateString();

      if (lastActiveDate !== todayDate) {
        state.streak++;
      }
    }

    state.lastActive = now;
    state.stats.totalSessions++;

    await this.state.storage.put('studentState', state);
  }

  extractWeaknesses(history) {
    const mistakeMap = {};

    history.forEach(({ mistake }) => {
      if (!mistake || mistake === 'general') return;

      mistakeMap[mistake] = (mistakeMap[mistake] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.entries(mistakeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);

    // Classify by category
    const phonemes = sorted.filter(m =>
      ['th', 'r', 's', 'l', 'pronunciation'].some(p => m.includes(p))
    ).slice(0, 3);

    const grammar = sorted.filter(m =>
      ['article', 'tense', 'agreement', 'preposition'].some(g => m.includes(g))
    ).slice(0, 3);

    return { phonemes, grammar };
  }

  compressSummary(state) {
    const { level, streak, weakSkills, stats } = state;
    const recent = state.sessionHistory.slice(-3);

    let summary = `Level ${level}. `;

    if (streak > 0) {
      summary += `Active streak: ${streak} days. `;
    }

    const totalCorrections = stats.totalCorrections;
    if (totalCorrections > 0) {
      summary += `${totalCorrections} corrections made. `;
    }

    if (weakSkills.phonemes.length > 0) {
      summary += `Phoneme focus: ${weakSkills.phonemes.slice(0, 2).join(', ')}. `;
    }

    if (weakSkills.grammar.length > 0) {
      summary += `Grammar focus: ${weakSkills.grammar.slice(0, 2).join(', ')}.`;
    }

    if (summary.length === 0) {
      summary = 'New student, getting started.';
    }

    return summary.trim();
  }
}
