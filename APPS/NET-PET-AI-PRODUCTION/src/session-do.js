// src/session-do.js — SessionDO Durable Object for tracking student session state
// Run 322: Minimal version — just logging corrections
// Run 325: Expand to mistake analysis + weakness detection

export class SessionDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/log-correction' && request.method === 'POST') {
      try {
        const body = await request.json();
        const correction = {
          timestamp: body.timestamp || new Date().toISOString(),
          original: body.original_text,
          corrected: body.corrected,
          mistake: body.mistake,
        };

        // Append to corrections log
        const key = 'corrections-' + new Date().toISOString().split('T')[0]; // Daily key
        const existing = await this.storage.get(key) || [];
        existing.push(correction);
        await this.storage.put(key, existing);

        return new Response(JSON.stringify({ ok: true, logged: correction }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (path === '/get-corrections' && request.method === 'GET') {
      try {
        const today = new Date().toISOString().split('T')[0];
        const corrections = await this.storage.get('corrections-' + today) || [];
        return new Response(JSON.stringify({ corrections }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
}
