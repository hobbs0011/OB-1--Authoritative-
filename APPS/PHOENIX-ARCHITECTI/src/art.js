import { checkAdminKey } from './security.js';

export async function handleArt(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'POST' && path === '/api/art') {
    try {
      const body = await request.json().catch(() => null);
      if (!body) return Response.json({ error: 'invalid JSON' }, { status: 400 });

      const { title, artist, style, description, tags, url: artUrl, notes } = body;
      if (!title || !title.trim()) return Response.json({ error: 'title is required' }, { status: 400 });

      const id = 'ART-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const added_at = new Date().toISOString();

      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS art_registry (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, style TEXT,
        description TEXT, tags TEXT, url TEXT, notes TEXT, added_at TEXT
      )`).run();

      await env.DB.prepare(
        `INSERT INTO art_registry (id, title, artist, style, description, tags, url, notes, added_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, title, artist || null, style || null, description || null, tags || null, artUrl || null, notes || null, added_at).run();

      return Response.json({ id, title, added_at }, { status: 201 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (method === 'GET' && path === '/api/art') {
    try {
      const q = url.searchParams.get('q');
      let rows;
      if (q) {
        rows = await env.DB.prepare(
          `SELECT * FROM art_registry WHERE title LIKE ? OR description LIKE ? OR tags LIKE ? ORDER BY added_at DESC`
        ).bind('%' + q + '%', '%' + q + '%', '%' + q + '%').all();
      } else {
        rows = await env.DB.prepare(`SELECT * FROM art_registry ORDER BY added_at DESC`).all();
      }
      return Response.json({ count: rows.results.length, pieces: rows.results });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (method === 'GET' && path.startsWith('/api/art/')) {
    try {
      const id = path.split('/').pop();
      const rows = await env.DB.prepare(`SELECT * FROM art_registry WHERE id = ?`).bind(id).all();
      if (rows.results.length === 0) return Response.json({ error: 'not found' }, { status: 404 });
      return Response.json(rows.results[0]);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (method === 'DELETE' && path.startsWith('/api/art/')) {
    try {
      const authResp = await checkAdminKey(request, env);
      if (authResp) return authResp;
      const id = path.split('/').pop();
      await env.DB.prepare(`DELETE FROM art_registry WHERE id = ?`).bind(id).run();
      return Response.json({ deleted: id });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ error: 'not found' }, { status: 404 });
}
