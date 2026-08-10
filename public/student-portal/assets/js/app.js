const API = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';

const PORTAL_CONFIG = {
  casa: {
    theme: 'casa',
    sessionKey: 'casa_session',
    studentIdParam: 'student',
    nameParam: 'name',
    loginDest: '/casa-login/',
    requireStudentCode: true,
    defaultStudentName: 'Student'
  },
  oktava: {
    theme: 'oktava',
    sessionKey: 'oktava_session',
    studentIdParam: 'student',
    nameParam: 'name',
    loginDest: '/oktava-login/',
    requireStudentCode: false,
    defaultStudentName: 'Oktava Student'
  },
  bluetech: {
    theme: 'bluetech',
    sessionKey: 'bluetech_session',
    studentIdParam: 'studentId',
    nameParam: 'name',
    loginDest: '/bluetech-login/',
    requireStudentCode: false,
    defaultStudentName: 'Employee'
  },
  nguyen: {
    theme: 'nguyen',
    sessionKey: 'nguyen_session',
    studentIdParam: 'studentId',
    nameParam: 'name',
    loginDest: '/nguyen-login/',
    requireStudentCode: false,
    defaultStudentName: 'Student'
  }
};

function getPortal() {
  const params = new URLSearchParams(window.location.search);
  const key = (params.get('portal') || params.get('brand') || '').toLowerCase();
  return PORTAL_CONFIG[key] || PORTAL_CONFIG.casa;
}

function requireAuth() {
  const portal = getPortal();
  const session = localStorage.getItem(portal.sessionKey);
  if (!session) { window.location.replace(portal.loginDest); return false; }
  try {
    const data = JSON.parse(session);
    if (!data.role && !data.studentId) { window.location.replace(portal.loginDest); return false; }
    return true;
  } catch {
    window.location.replace(portal.loginDest);
    return false;
  }
}

function logout() {
  const portal = getPortal();
  localStorage.removeItem(portal.sessionKey);
  window.location.replace(portal.loginDest);
}

function getStudentId() {
  const portal = getPortal();
  const session = JSON.parse(localStorage.getItem(portal.sessionKey) || '{}');
  return session.studentId || session.role || new URLSearchParams(window.location.search).get(portal.studentIdParam) || '';
}

function getStudentName() {
  const portal = getPortal();
  const session = JSON.parse(localStorage.getItem(portal.sessionKey) || '{}');
  return session.name || new URLSearchParams(window.location.search).get(portal.nameParam) || portal.defaultStudentName;
}

function getWeekId(date = new Date()) {
  const d = new Date(date);
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const year = thursday.getFullYear();
  const week = Math.floor((thursday - new Date(year, 0, 1)) / 604800000) + 1;
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

async function loadTasks() {
  if (!requireAuth()) return;
  const studentId = getStudentId();
  const weekId = getWeekId();
  const container = document.getElementById('taskList');
  try {
    const r = await fetch(`${API}/api/tasks/current?studentId=${encodeURIComponent(studentId)}&weekId=${encodeURIComponent(weekId)}`);
    const d = await r.json();
    const tasks = d.tasks || [];
    if (!tasks.length) {
      container.innerHTML = '<div class="empty-state">No tasks assigned this week. Check back later!</div>';
      return;
    }
    container.innerHTML = tasks.map(t => `
      <div class="task-item">
        <div class="task-info">
          <div class="task-title">${escapeHtml(t.title)}</div>
          <div class="task-meta">${escapeHtml(t.category || 'general')} · ${t.dailyMinutes || 20} min · due ${t.dueDate || 'this week'}</div>
        </div>
        <button class="done-btn" onclick="completeTask('${t.id}')">Done</button>
      </div>
    `).join('');
  } catch {
    container.innerHTML = '<div class="empty-state">Failed to load tasks.</div>';
  }
}

async function completeTask(taskId) {
  if (!requireAuth()) return;
  const studentId = getStudentId();
  const today = new Date().toISOString().slice(0, 10);
  const duration = document.getElementById('wlDuration')?.value || 20;
  const notes = document.getElementById('wlNotes')?.value || '';
  try {
    const r = await fetch(`${API}/api/tasks/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, studentId, date: today, completed: true, minutesSpent: Number(duration), notes })
    });
    const d = await r.json();
    const status = document.getElementById('wlStatus');
    if (d.ok) {
      if (status) { status.textContent = 'Task logged ✓'; status.style.color = 'var(--green)'; }
      setTimeout(loadTasks, 600);
    } else {
      if (status) { status.textContent = d.error || 'Failed'; status.style.color = 'var(--danger)'; }
    }
  } catch {
    const status = document.getElementById('wlStatus');
    if (status) { status.textContent = 'Network error'; status.style.color = 'var(--danger)'; }
  }
}

async function saveWorkLog() {
  if (!requireAuth()) return;
  const studentId = getStudentId();
  const activity = document.getElementById('wlActivity')?.value || 'Other';
  const duration = document.getElementById('wlDuration')?.value || 0;
  const notes = document.getElementById('wlNotes')?.value || '';
  const status = document.getElementById('wlStatus');
  if (!duration) { if (status) { status.textContent = 'Enter minutes'; status.style.color = 'var(--danger)'; } return; }
  if (status) { status.textContent = 'Saving...'; status.style.color = 'var(--muted)'; }
  try {
    await fetch(`${API}/api/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, level: 'A1', topic: `${activity} - ${notes}` })
    });
    if (status) { status.textContent = 'Saved ✓'; status.style.color = 'var(--green)'; }
    setTimeout(() => { if (status) status.textContent = ''; }, 2000);
  } catch {
    if (status) { status.textContent = 'Save failed'; status.style.color = 'var(--danger)'; }
  }
}

function initTheme() {
  const portal = getPortal();
  if (portal.theme) {
    document.body.setAttribute('data-theme', portal.theme);
    document.documentElement.setAttribute('lang', portal.lang || 'en');
  }
}

function initBranding() {
  const portal = getPortal();
  const brandMap = {
    casa: { title: 'CASA English', sub: 'Student Portal', logo: 'C' },
    oktava: { title: 'Oktava English Class', sub: 'Natural English Training', logo: 'O' },
    bluetech: { title: 'Bluetech Portal', sub: 'Staff Development', logo: 'B' },
    nguyen: { title: 'Nguyen Family', sub: 'English + Career', logo: 'N' }
  };
  const b = brandMap[portal.theme] || { title: 'Student Portal', sub: 'Natural English Training', logo: 'P' };
  const logoEl = document.getElementById('brandLogo');
  const titleEl = document.getElementById('brandTitle');
  const subEl = document.getElementById('brandSub');
  const welcomeEl = document.getElementById('welcomeTitle');
  if (logoEl) logoEl.textContent = b.logo;
  if (titleEl) titleEl.textContent = b.title;
  if (subEl) subEl.textContent = b.sub;
  if (welcomeEl) welcomeEl.textContent = 'Welcome back, ' + getStudentName();
}

function init() {
  initTheme();
  initBranding();
  const wlBtn = document.getElementById('wlSaveBtn');
  if (wlBtn) wlBtn.addEventListener('click', saveWorkLog);
  loadTasks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
