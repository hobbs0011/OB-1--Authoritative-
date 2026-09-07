// src/tasks.js — Multi-tenant task assignment + daily logging system
// Storage: D1 (soul-archive) via env.SOUL_DB
// Tables:
//   {prefix}_tasks: id, week_id, student_id, category, title, description, daily_minutes, total_minutes, due_date, created_at, created_by, status
//   {prefix}_task_logs: task_id, date, student_id, completed, minutes_spent, notes, audio_url, submitted_at
//   {prefix}_task_summaries: week_id, student_id, total_tasks, completed_tasks, total_minutes_planned, total_minutes_logged, categories, streak, generated_at
//   {prefix}_settings: key, value, updated_at

function table(prefix, name) {
  return `${prefix}_${name}`;
}

export function getWeekId(date = new Date()) {
  const d = new Date(date);
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const year = thursday.getFullYear();
  const week = Math.floor((thursday - new Date(year, 0, 1)) / 604800000) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export async function getTasks(studentId, weekId, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return [];
  try {
    const result = await env.SOUL_DB.prepare(`SELECT * FROM ${table(prefix, 'tasks')} WHERE student_id = ? AND week_id = ?`).bind(studentId, weekId).all();
    return result.results.map(row => ({
      id: row.id, weekId: row.week_id, studentId: row.student_id, category: row.category,
      title: row.title, description: row.description, dailyMinutes: row.daily_minutes,
      totalMinutes: row.total_minutes, dueDate: row.due_date, createdAt: row.created_at,
      createdBy: row.created_by, status: row.status
    }));
  } catch { return []; }
}

export async function setTask(task, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return { ok: false, error: 'no d1' };
  const studentId = String(task.studentId || '').trim();
  const weekId = task.weekId || getWeekId();
  if (!studentId) return { ok: false, error: 'studentId required' };
  const record = {
    id: task.id || crypto.randomUUID(),
    week_id: weekId,
    student_id: studentId,
    category: String(task.category || 'general').slice(0, 50),
    title: String(task.title || '').trim().slice(0, 200),
    description: String(task.description || '').trim().slice(0, 1000),
    daily_minutes: Math.max(1, Math.min(480, Number(task.dailyMinutes) || 20)),
    total_minutes: Math.max(1, Math.min(5000, Number(task.totalMinutes) || 140)),
    due_date: String(task.dueDate || '').slice(0, 10),
    created_at: task.createdAt || new Date().toISOString(),
    created_by: String(task.createdBy || 'teacher').slice(0, 50),
    status: String(task.status || 'active').slice(0, 20)
  };
  try {
    await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'tasks')} (id, week_id, student_id, category, title, description, daily_minutes, total_minutes, due_date, created_at, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(record.id, record.week_id, record.student_id, record.category, record.title, record.description, record.daily_minutes, record.total_minutes, record.due_date, record.created_at, record.created_by, record.status).run();
    await invalidateSummary(studentId, weekId, env, prefix);
    return { ok: true, task: { ...record, weekId: record.week_id, studentId: record.student_id, dailyMinutes: record.daily_minutes, totalMinutes: record.total_minutes, dueDate: record.due_date, createdAt: record.created_at, createdBy: record.created_by } };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function logTaskCompletion(log, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return { ok: false, error: 'no d1' };
  const { taskId, date, studentId, completed, minutesSpent, notes, audioUrl } = log;
  if (!taskId || !studentId || !date) return { ok: false, error: 'taskId, studentId, date required' };
  const entry = {
    task_id: taskId, date, student_id: studentId,
    completed: !!completed ? 1 : 0,
    minutes_spent: Math.max(0, Math.min(480, Number(minutesSpent) || 0)),
    notes: String(notes || '').slice(0, 500),
    audio_url: String(audioUrl || '').slice(0, 500),
    submitted_at: new Date().toISOString()
  };
  try {
    await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'task_logs')} (task_id, date, student_id, completed, minutes_spent, notes, audio_url, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(entry.task_id, entry.date, entry.student_id, entry.completed, entry.minutes_spent, entry.notes, entry.audio_url, entry.submitted_at).run();
    if (completed) {
      const weekId = getWeekId(date);
      await env.SOUL_DB.prepare(`UPDATE ${table(prefix, 'tasks')} SET status = ?, created_at = ? WHERE id = ?`).bind('completed', entry.submitted_at, taskId).run();
    }
    await invalidateSummary(studentId, getWeekId(date), env, prefix);
    return { ok: true, log: { ...entry, taskId: entry.task_id, studentId: entry.student_id, date: entry.date, completed: !!entry.completed, minutesSpent: entry.minutes_spent, notes: entry.notes, audioUrl: entry.audio_url, submittedAt: entry.submitted_at } };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function getTaskLogs(studentId, date, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return [];
  try {
    const result = await env.SOUL_DB.prepare(`SELECT * FROM ${table(prefix, 'task_logs')} WHERE student_id = ? AND date = ?`).bind(studentId, date).all();
    return result.results.map(row => ({
      taskId: row.task_id, date: row.date, studentId: row.student_id,
      completed: !!row.completed, minutesSpent: row.minutes_spent,
      notes: row.notes, audioUrl: row.audio_url, submittedAt: row.submitted_at
    }));
  } catch { return []; }
}

export async function getTaskSummary(studentId, weekId, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return null;
  try {
    const result = await env.SOUL_DB.prepare(`SELECT * FROM ${table(prefix, 'task_summaries')} WHERE week_id = ? AND student_id = ?`).bind(weekId, studentId).first();
    if (!result) return null;
    return {
      weekId: result.week_id, studentId: result.student_id,
      totalTasks: result.total_tasks, completedTasks: result.completed_tasks,
      totalMinutesPlanned: result.total_minutes_planned, totalMinutesLogged: result.total_minutes_logged,
      categories: JSON.parse(result.categories || '{}'), streak: result.streak,
      generatedAt: result.generated_at
    };
  } catch { return null; }
}

async function invalidateSummary(studentId, weekId, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return;
  try {
    const tasks = await getTasks(studentId, weekId, env, prefix);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalMinutesPlanned = tasks.reduce((s, t) => s + (t.totalMinutes || 0), 0);
    const categories = {};
    for (const t of tasks) {
      if (!categories[t.category]) categories[t.category] = { planned: 0, logged: 0 };
      categories[t.category].planned += t.totalMinutes || 0;
    }
    const now = new Date();
    const weekStart = new Date(weekId + 'T00:00:00');
    let totalMinutesLogged = 0;
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      if (d > now) break;
      const date = d.toISOString().slice(0, 10);
      const logs = await getTaskLogs(studentId, date, env, prefix);
      const dayMinutes = logs.reduce((s, l) => s + (l.minutesSpent || 0), 0);
      totalMinutesLogged += dayMinutes;
      if (logs.filter(l => l.completed).length > 0) streak++;
    }
    const summary = {
      week_id: weekId, student_id: studentId,
      total_tasks: totalTasks, completed_tasks: completedTasks,
      total_minutes_planned: totalMinutesPlanned, total_minutes_logged: totalMinutesLogged,
      categories: JSON.stringify(categories), streak,
      generated_at: new Date().toISOString()
    };
    await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'task_summaries')} (week_id, student_id, total_tasks, completed_tasks, total_minutes_planned, total_minutes_logged, categories, streak, generated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(summary.week_id, summary.student_id, summary.total_tasks, summary.completed_tasks, summary.total_minutes_planned, summary.total_minutes_logged, summary.categories, summary.streak, summary.generated_at).run();
  } catch {}
}

export async function getStudentTasksWithLogs(studentId, weekId, env, prefix = 'nguyen') {
  const tasks = await getTasks(studentId, weekId, env, prefix);
  const result = [];
  for (const task of tasks) {
    const logs = await getTaskLogs(studentId, task.createdAt ? task.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10), env, prefix);
    const today = new Date().toISOString().slice(0, 10);
    const todayLog = logs.find(l => l.taskId === task.id && l.date === today);
    result.push({ ...task, todayLog, logs });
  }
  return result;
}

export async function getParentEmail(env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return null;
  try {
    const row = await env.SOUL_DB.prepare(`SELECT value FROM ${table(prefix, 'settings')} WHERE key = ?`).bind('parent_email').first();
    return row ? row.value : null;
  } catch { return null; }
}

export async function setParentEmail(email, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return { ok: false, error: 'no d1' };
  try {
    await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'settings')} (key, value, updated_at) VALUES (?, ?, ?)`).bind('parent_email', String(email).slice(0, 200), new Date().toISOString()).run();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function getTeacherEmail(env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return null;
  try {
    const row = await env.SOUL_DB.prepare(`SELECT value FROM ${table(prefix, 'settings')} WHERE key = ?`).bind('teacher_email').first();
    return row ? row.value : null;
  } catch { return null; }
}

export async function setTeacherEmail(email, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return { ok: false, error: 'no d1' };
  try {
    await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'settings')} (key, value, updated_at) VALUES (?, ?, ?)`).bind('teacher_email', String(email).slice(0, 200), new Date().toISOString()).run();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function getAdminEmail(env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return null;
  try {
    const row = await env.SOUL_DB.prepare(`SELECT value FROM ${table(prefix, 'settings')} WHERE key = ?`).bind('admin_email').first();
    return row ? row.value : null;
  } catch { return null; }
}

export async function setAdminEmail(email, env, prefix = 'nguyen') {
  if (!env.SOUL_DB) return { ok: false, error: 'no d1' };
  try {
    await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'settings')} (key, value, updated_at) VALUES (?, ?, ?)`).bind('admin_email', String(email).slice(0, 200), new Date().toISOString()).run();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function validateParentPin(pin, env, prefix = 'nguyen') {
  if (!pin) return false;
  const hash = await computeHash(pin);
  if (env.NET_PET_KV) {
    const stored = await env.NET_PET_KV.get(`parent:${prefix}:pin_hash`);
    if (stored) return stored === hash;
  }
  if (env.SOUL_DB) {
    try {
      const row = await env.SOUL_DB.prepare(`SELECT value FROM ${table(prefix, 'settings')} WHERE key = ?`).bind('parent_pin_hash').first();
      if (row && row.value) return row.value === hash;
    } catch {}
  }
  const FALLBACK_HASHES = ['03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', '00170842'];
  return FALLBACK_HASHES.includes(hash);
}

export async function setParentPin(pin, env, prefix = 'nguyen') {
  const hash = await computeHash(pin);
  if (env.NET_PET_KV) {
    await env.NET_PET_KV.put(`parent:${prefix}:pin_hash`, hash);
  }
  if (env.SOUL_DB) {
    try {
      await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'settings')} (key, value, updated_at) VALUES (?, ?, ?)`).bind('parent_pin_hash', hash, new Date().toISOString()).run();
    } catch (e) {
      return { ok: env.NET_PET_KV ? true : false, store: env.NET_PET_KV ? 'kv' : 'none', error: env.NET_PET_KV ? undefined : e.message };
    }
  }
  return { ok: true, store: env.SOUL_DB ? 'd1' : 'kv' };
}

export async function setStudentPin(studentId, pin, env, prefix = 'nguyen') {
  const hash = await computeHash(pin);
  const key = `student_pin_${studentId}`;
  if (env.NET_PET_KV) {
    await env.NET_PET_KV.put(key, hash);
  }
  if (env.SOUL_DB) {
    try {
      await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'settings')} (key, value, updated_at) VALUES (?, ?, ?)`).bind(key, hash, new Date().toISOString()).run();
    } catch {}
  }
  return { ok: true, store: env.NET_PET_KV ? 'kv' : 'd1' };
}

export async function validateTeacherPin(pin, env, prefix = 'nguyen') {
  if (!pin) return false;
  const hash = await computeHash(pin);
  if (env.SOUL_DB) {
    try {
      const row = await env.SOUL_DB.prepare(`SELECT value FROM ${table(prefix, 'settings')} WHERE key = ?`).bind('teacher_pin_hash').first();
      if (row && row.value) return row.value === hash;
    } catch {}
  }
  if (env.NET_PET_KV) {
    const stored = await env.NET_PET_KV.get(`teacher:${prefix}:pin_hash`);
    if (stored) return stored === hash;
  }
  return false;
}

export async function setTeacherPin(pin, env, prefix = 'nguyen') {
  const hash = await computeHash(pin);
  if (env.SOUL_DB) {
    try {
      await env.SOUL_DB.prepare(`INSERT OR REPLACE INTO ${table(prefix, 'settings')} (key, value, updated_at) VALUES (?, ?, ?)`).bind('teacher_pin_hash', hash, new Date().toISOString()).run();
      return { ok: true, store: 'd1' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  if (env.NET_PET_KV) {
    await env.NET_PET_KV.put(`teacher:${prefix}:pin_hash`, hash);
    return { ok: true, store: 'kv' };
  }
  return { ok: false, error: 'no store available' };
}

async function computeHash(text) {
  try {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 0;
    for (let i = 0; i < String(text).length; i++) { h = (h * 31 + String(text).charCodeAt(i)) | 0; }
    return Math.abs(h).toString(16).padStart(8, '0');
  }
}
