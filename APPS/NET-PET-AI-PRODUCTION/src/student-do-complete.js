// src/student-do-complete.js — Complete StudentDO (State Machine)
// Single source of truth for all student memory
// Replaces partial student-do.js with full implementation

export class StudentDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  // Initialize or retrieve student state
  async getState() {
    let data = await this.state.storage.get('student_data');

    if (!data) {
      data = {
        student_id: this.state.id.name,
        level: 'A1',
        streak: 0,
        lastActive: Date.now(),
        stats: {
          totalSessions: 0,
          totalCorrections: 0,
          totalMinutes: 0,
        },
        weakSkills: {
          phonemes: [],
          grammar: [],
          behavioral: [],
        },
        sessionHistory: [],
        summary: 'New student. No data yet.',
      };
      await this.state.storage.put('student_data', data);
    }

    return data;
  }

  // Start new session (increment streak if day changed)
  async startSession() {
    const data = await this.getState();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Check if new day
    if (now - data.lastActive > dayMs) {
      data.streak += 1;
    }

    data.lastActive = now;
    data.stats.totalSessions += 1;

    await this.state.storage.put('student_data', data);
    return data;
  }

  // Log interaction (every chat message → memory update)
  async logInteraction(interaction) {
    const data = await this.getState();

    // Structure: { input, correction, mistake_pattern, strategy, level }
    const event = {
      timestamp: Date.now(),
      input: interaction.input,
      correction: interaction.correction,
      mistake_pattern: interaction.mistake_pattern || null,
      strategy_used: interaction.strategy_used || null,
    };

    // Add to session history (keep last 50 for context window)
    data.sessionHistory.push(event);
    if (data.sessionHistory.length > 50) {
      data.sessionHistory.shift();
    }

    // Increment stats
    data.stats.totalCorrections += 1;

    // Extract weakness patterns
    if (interaction.mistake_pattern) {
      this.trackWeakness(data, interaction.mistake_pattern);
    }

    // Update level based on progress
    this.updateLevel(data);

    // Compress summary
    data.summary = this.compressSummary(data);

    await this.state.storage.put('student_data', data);
    return data;
  }

  // Track weakness (update phoneme/grammar weakness list)
  trackWeakness(data, mistakePattern) {
    // Pattern format: "phoneme_/θ/" or "grammar_past_tense"
    const [type, tag] = mistakePattern.split('_');

    if (type === 'phoneme' && !data.weakSkills.phonemes.includes(tag)) {
      data.weakSkills.phonemes.push(tag);
    } else if (type === 'grammar' && !data.weakSkills.grammar.includes(tag)) {
      data.weakSkills.grammar.push(tag);
    }
  }

  // Update level based on total corrections (Mouse → Cub → Tiger)
  updateLevel(data) {
    const corrections = data.stats.totalCorrections;

    if (corrections >= 100) {
      data.level = 'B1';
    } else if (corrections >= 40) {
      data.level = 'A2';
    } else {
      data.level = 'A1';
    }
  }

  // Compress session history into human-readable summary
  compressSummary(data) {
    if (data.sessionHistory.length === 0) {
      return 'No sessions yet. Ready to start.';
    }

    const recent = data.sessionHistory.slice(-10);
    const mistakes = recent.filter(e => e.mistake_pattern).length;
    const correction_rate = mistakes > 0 ? ((recent.length - mistakes) / recent.length * 100).toFixed(0) : 'N/A';

    const weakest = data.weakSkills.phonemes.length > 0
      ? data.weakSkills.phonemes[0]
      : (data.weakSkills.grammar.length > 0 ? data.weakSkills.grammar[0] : 'none');

    return `Streak: ${data.streak} days. Level: ${data.level}. Correction rate: ${correction_rate}%. Weakest: ${weakest}. Total corrections: ${data.stats.totalCorrections}.`;
  }

  // Durable Object fetch handler
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // GET /state — Return current student state
    if (path === '/state' && request.method === 'GET') {
      const state = await this.getState();
      return new Response(JSON.stringify(state), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /session-start — Begin new session
    if (path === '/session-start' && request.method === 'POST') {
      try {
        const state = await this.startSession();
        return new Response(JSON.stringify(state), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    // POST /log-interaction — Record chat interaction
    if (path === '/log-interaction' && request.method === 'POST') {
      try {
        const body = await request.json();
        const state = await this.logInteraction(body);
        return new Response(JSON.stringify(state), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    return new Response('StudentDO OK', { status: 200 });
  }
}
