import { checkAdminKey } from './security.js';

export async function createBBEntry(env, { title, description, source, priority = '!', metadata = '' }) {
  const bb_id = `BB-${Date.now()}`;
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO backburner (bb_id, title, description, source, priority, created_at, updated_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(bb_id, title, description || '', source, priority, now, now, typeof metadata === 'string' ? metadata : JSON.stringify(metadata)).run();
  return { bb_id, title, source, priority, status: 'OPEN', created_at: now };
}

export async function handleBackburner(request, env) {
  const authCheck = await checkAdminKey(request, env);
  if (authCheck) return authCheck;

  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;

  if (method === 'POST' && pathname === '/api/backburner') {
    const body = await request.json().catch(() => ({}));
    if (!body.title || !body.source) return Response.json({ error: 'title and source required' }, { status: 400 });
    const entry = await createBBEntry(env, body);
    return Response.json(entry, { status: 201 });
  }

  if (method === 'GET' && pathname === '/api/backburner') {
    const status = url.searchParams.get('status') || 'OPEN';
    const source = url.searchParams.get('source') || null;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);
    const rows = source
      ? await env.DB.prepare('SELECT * FROM backburner WHERE status = ? AND source = ? ORDER BY created_at DESC LIMIT ?').bind(status, source, limit).all()
      : await env.DB.prepare('SELECT * FROM backburner WHERE status = ? ORDER BY created_at DESC LIMIT ?').bind(status, limit).all();
    return Response.json(rows.results);
  }

  if (method === 'PATCH' && pathname.startsWith('/api/backburner/')) {
    const bbId = pathname.split('/').filter(Boolean)[2];
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();

    // L81 F&F LAW — "No Soul left behind"
    // Agents may only set PENDING_CLOSE. Only the system/operator can grant DONE.
    if (body.status === 'DONE' && body.granted_by !== 'operator') {
      return Response.json({
        error: 'L81 F&F LAW: agents cannot self-authorize DONE. Set status=PENDING_CLOSE and await system grant.',
        law: 'L81',
      }, { status: 403 });
    }

    // System grants DONE — enforce rebook for recurring tasks
    if (body.status === 'DONE' && body.granted_by === 'operator') {
      const existing = await env.DB.prepare('SELECT * FROM backburner WHERE bb_id = ?').bind(bbId).first();
      if (!existing) return Response.json({ error: 'entry not found' }, { status: 404 });

      const isOneTime = body.one_time === true || !existing.recurrence;
      if (!isOneTime) {
        const nextCycle = (existing.cycle_count || 0) + 1;
        await env.DB.prepare('UPDATE backburner SET status = ?, updated_at = ?, cycle_count = ?, granted_by = ? WHERE bb_id = ?')
          .bind('DONE', now, nextCycle - 1, 'operator', bbId).run();
        const nextEntry = await createBBEntry(env, {
          title: existing.title,
          description: `[Cycle ${nextCycle}] ${existing.description || ''}`,
          source: existing.source,
          priority: existing.priority,
          metadata: JSON.stringify({ rebooked_from: bbId, cycle: nextCycle, recurrence: existing.recurrence }),
        });
        await env.DB.prepare('UPDATE backburner SET recurrence = ?, cycle_count = ? WHERE bb_id = ?')
          .bind(existing.recurrence, nextCycle, nextEntry.bb_id).run();
        return Response.json({ ok: true, bb_id: bbId, status: 'DONE', rebooked_as: nextEntry.bb_id, cycle: nextCycle });
      }
    }

    const updates = [];
    const values = [];
    if (body.status) { updates.push('status = ?'); values.push(body.status); }
    if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
    if (body.recurrence !== undefined) { updates.push('recurrence = ?'); values.push(body.recurrence); }
    if (body.close_reason !== undefined) { updates.push('close_reason = ?'); values.push(body.close_reason); }
    if (body.granted_by !== undefined) { updates.push('granted_by = ?'); values.push(body.granted_by); }
    if (!updates.length) return Response.json({ error: 'nothing to update' }, { status: 400 });
    updates.push('updated_at = ?'); values.push(now);
    values.push(bbId);
    await env.DB.prepare(`UPDATE backburner SET ${updates.join(', ')} WHERE bb_id = ?`).bind(...values).run();
    return Response.json({ ok: true, bb_id: bbId, updated_at: now });
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
}
