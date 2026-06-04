import { checkAdminKey } from './security.js';

const PA_URL = 'https://phoenix-architecti.mrmichaelhobbs123.workers.dev';

async function paT2(env, task, context) {
  const body = JSON.stringify({ task, context, tier: 2 });
  const auth = env.WORKER_ADMIN_KEY || env.PA_AUTH_SECRET || '';
  const resp = await fetch(`${PA_URL}/api/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-pa-auth': auth },
    body,
  });
  const j = await resp.json();
  try { return JSON.parse(j.patch); } catch { return {}; }
}

export async function handleArt(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === 'POST' && path === '/api/art/analyze') {
    try {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.content !== 'string') {
        return Response.json({ error: 'content required' }, { status: 400 });
      }
      const { content, source = 'unknown', save = false } = body;
      const snippet = content.slice(0, 4000);
      const SYS = 'You are an expert art analyst. Respond ONLY with valid JSON matching the requested structure. No explanation. No markdown.';

      const [r1, r2, r3] = await Promise.all([
        paT2(env, `From this art dossier (source: ${source}), extract ONLY: {"title":"...","artist":"...","style":"..."}. Text:\n${snippet}`, SYS),
        paT2(env, `From this art dossier (source: ${source}), extract ONLY: {"description":"...","tags":"comma,separated,tags"}. Text:\n${snippet}`, SYS),
        paT2(env, `From this art dossier (source: ${source}), extract ONLY: {"url":"...","notes":"..."}. Text:\n${snippet}`, SYS),
      ]);

      const piece = {
        title: r1.title || source,
        artist: r1.artist || null,
        style: r1.style || null,
        description: r2.description || null,
        tags: r2.tags || null,
        url: r3.url || null,
        notes: r3.notes || null,
      };

      let saved = false;
      let id;
      if (save) {
        id = 'ART-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        const added_at = new Date().toISOString();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS art_registry (
          id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, style TEXT,
          description TEXT, tags TEXT, url TEXT, notes TEXT, added_at TEXT
        )`).run();
        await env.DB.prepare(
          `INSERT INTO art_registry (id,title,artist,style,description,tags,url,notes,added_at) VALUES (?,?,?,?,?,?,?,?,?)`
        ).bind(id, piece.title, piece.artist, piece.style, piece.description, piece.tags, piece.url, piece.notes, added_at).run();
        saved = true;
      }

      return Response.json({ piece, saved, id: id || null });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

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
        `INSERT INTO art_registry (id,title,artist,style,description,tags,url,notes,added_at) VALUES (?,?,?,?,?,?,?,?,?)`
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
