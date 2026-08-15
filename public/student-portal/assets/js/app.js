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
  },
  quang: {
    theme: 'quang',
    sessionKey: 'quang_session',
    studentIdParam: 'studentId',
    nameParam: 'name',
    loginDest: '/nguyen-quang/',
    requireStudentCode: false,
    defaultStudentName: 'Quang'
  },
  quan: {
    theme: 'quan',
    sessionKey: 'quan_session',
    studentIdParam: 'studentId',
    nameParam: 'name',
    loginDest: '/nguyen-quan/',
    requireStudentCode: false,
    defaultStudentName: 'Quan'
  }
};

function getPortal() {
  const params = new URLSearchParams(window.location.search);
  const key = (params.get('portal') || params.get('brand') || '').toLowerCase();
  return PORTAL_CONFIG[key] || PORTAL_CONFIG.casa;
}

function getRole() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('role') || '').toLowerCase();
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

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

function updateProgressBar(barEl, pctEl, value, total) {
  if (!barEl || !pctEl) return;
  const safeTotal = Number(total) || 1;
  const pct = Math.min(100, Math.max(0, Math.round((Number(value) / safeTotal) * 100)));
  barEl.style.width = pct + '%';
  barEl.setAttribute('aria-valuenow', pct);
  if (pctEl) pctEl.textContent = pct + '%';
}

function validateDuration(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  return n >= 1 && n <= 480;
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
      updateProgressBar(document.getElementById('completionBar'), document.getElementById('completionPct'), 0, 1);
      document.getElementById('completedCount').textContent = '0 done';
      document.getElementById('totalCount').textContent = '0 tasks';
      return;
    }
    const completed = tasks.filter(t => t.status === 'done' || t.completed).length;
    container.innerHTML = tasks.map(t => `
      <div class="task-item">
        <div class="task-info">
          <div class="task-title">${escapeHtml(t.title)}</div>
          <div class="task-meta">${escapeHtml(t.category || 'general')} · ${t.dailyMinutes || 20} min · due ${t.dueDate || 'this week'}</div>
        </div>
        <button class="done-btn" onclick="completeTask('${escapeHtml(t.id)}')">Done</button>
      </div>
    `).join('');
    updateProgressBar(document.getElementById('completionBar'), document.getElementById('completionPct'), completed, tasks.length);
    document.getElementById('completedCount').textContent = `${completed} done`;
    document.getElementById('totalCount').textContent = `${tasks.length} tasks`;
  } catch {
    container.innerHTML = '<div class="empty-state">Failed to load tasks.</div>';
    showToast('Failed to load tasks', 'error');
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
      showToast('Task completed!', 'success');
      setTimeout(loadTasks, 600);
    } else {
      if (status) { status.textContent = d.error || 'Failed'; status.style.color = 'var(--danger)'; }
      showToast(d.error || 'Failed to log task', 'error');
    }
  } catch {
    const status = document.getElementById('wlStatus');
    if (status) { status.textContent = 'Network error'; status.style.color = 'var(--danger)'; }
    showToast('Network error', 'error');
  }
}

async function saveWorkLog() {
  if (!requireAuth()) return;
  const studentId = getStudentId();
  const activity = document.getElementById('wlActivity')?.value || 'Other';
  const duration = document.getElementById('wlDuration')?.value || 0;
  const notes = document.getElementById('wlNotes')?.value || '';
  const status = document.getElementById('wlStatus');

  if (!validateDuration(duration)) {
    if (status) { status.textContent = 'Enter valid minutes (1-480)'; status.style.color = 'var(--danger)'; }
    showToast('Enter valid minutes (1-480)', 'error');
    return;
  }

  if (status) { status.textContent = 'Saving...'; status.style.color = 'var(--muted)'; }
  try {
    await fetch(`${API}/api/practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, level: 'A1', topic: `${activity} - ${notes}` })
    });
    if (status) { status.textContent = 'Saved ✓'; status.style.color = 'var(--green)'; }
    showToast('Work log saved', 'success');
    setTimeout(() => { if (status) status.textContent = ''; }, 2000);
  } catch {
    if (status) { status.textContent = 'Save failed'; status.style.color = 'var(--danger)'; }
    showToast('Save failed', 'error');
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
  const role = getRole();
  const brandMap = {
    casa: { title: 'CASA English', sub: 'Student Portal', logo: 'C' },
    oktava: { title: 'Oktava English Class', sub: 'Natural English Training', logo: 'O' },
    bluetech: { title: 'Bluetech Portal', sub: 'Staff Development', logo: 'B' },
    nguyen: { title: 'Nguyen Family', sub: 'English + Career', logo: 'N' },
    quang: { title: 'Quang — English Portal', sub: 'Personal Learning Space', logo: 'Q' },
    quan: { title: 'Quan — English Portal', sub: 'Personal Learning Space', logo: 'Q' }
  };
  const roleTitleMap = {
    parent: 'Parent Portal',
    teacher: 'Teacher Dashboard',
    admin: 'Admin Dashboard'
  };
  const b = brandMap[portal.theme] || { title: 'Student Portal', sub: 'Natural English Training', logo: 'P' };
  const logoEl = document.getElementById('brandLogo');
  const titleEl = document.getElementById('brandTitle');
  const subEl = document.getElementById('brandSub');
  const welcomeEl = document.getElementById('welcomeTitle');
  if (logoEl) logoEl.textContent = b.logo;
  if (titleEl) titleEl.textContent = roleTitleMap[role] || b.title;
  if (subEl) subEl.textContent = b.sub;
  if (welcomeEl) welcomeEl.textContent = 'Welcome back, ' + getStudentName();
}

function initOfflineDetection() {
  const banner = document.getElementById('offlineBanner');
  const updateOnlineStatus = () => {
    if (banner) {
      banner.classList.toggle('show', !navigator.onLine);
    }
  };
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

function showView(role) {
  const views = {
    student: document.getElementById('studentViews'),
    parent: document.getElementById('parentViews'),
    teacher: document.getElementById('teacherViews'),
    admin: document.getElementById('adminViews')
  };
  Object.keys(views).forEach(key => {
    if (views[key]) views[key].style.display = key === role ? 'grid' : 'none';
  });
  const progress = document.getElementById('progressCard');
  if (progress) progress.style.display = role === 'student' ? 'block' : 'none';
}

function initRoleViews() {
  const role = getRole();
  if (!role) return;
  showView(role);
  if (role === 'parent') initParentView();
  if (role === 'teacher') initTeacherView();
  if (role === 'admin') initAdminView();
}

function initParentView() {
  const studentId = getStudentId();
  const portal = getPortal();
  const children = [
    { id: `${studentId}-1`, name: 'Child 1' },
    { id: `${studentId}-2`, name: 'Child 2' }
  ];
  const list = document.getElementById('parentChildList');
  if (!list) return;
  list.innerHTML = children.map(c => `
    <button class="student-btn" data-child="${c.id}" onclick="loadParentChild('${c.id}', '${escapeHtml(c.name)}')">${escapeHtml(c.name)}</button>
  `).join('');
}

async function loadParentChild(childId, childName) {
  const detail = document.getElementById('parentChildDetail');
  if (detail) detail.innerHTML = '<div class="empty-state">Loading...</div>';
  try {
    const weekId = getWeekId();
    const r = await fetch(`${API}/api/tasks/current?studentId=${encodeURIComponent(childId)}&weekId=${encodeURIComponent(weekId)}`);
    const d = await r.json();
    const tasks = d.tasks || [];
    const completed = tasks.filter(t => t.status === 'done' || t.completed).length;
    const total = tasks.length;
    const totalMinutes = tasks.reduce((sum, t) => sum + (Number(t.dailyMinutes) || 20), 0);
    if (detail) {
      detail.innerHTML = `
        <div style="margin-bottom:12px; font-weight:700; font-size:1.05rem;">${escapeHtml(childName)}</div>
        <div style="color:var(--muted); font-size:0.9rem;">${completed} of ${total} tasks completed this week</div>
        <div style="color:var(--muted); font-size:0.9rem;">${totalMinutes} min assigned</div>
      `;
    }
    updateProgressBar(document.getElementById('parentCompletionBar'), document.getElementById('parentCompletionPct'), completed, total);
    updateProgressBar(document.getElementById('parentMinutesBar'), document.getElementById('parentMinutesPct'), totalMinutes, totalMinutes || 1);
    document.getElementById('parentCompletedCount').textContent = `${completed} done`;
    document.getElementById('parentTotalCount').textContent = `${total} tasks`;
    document.getElementById('parentMinutesTarget').textContent = `${totalMinutes} min target`;
    document.getElementById('parentMinutesLogged').textContent = `${totalMinutes} min`;
  } catch {
    if (detail) detail.innerHTML = '<div class="empty-state">Failed to load child data.</div>';
  }
}

async function initTeacherView() {
  const portal = getPortal();
  const studentSelect = document.getElementById('teacherStudent');
  if (!studentSelect) return;
  const students = [
    { id: 'huong-bluetech', name: 'Huong' },
    { id: 'mai-tram-bluetech', name: 'Mai Tram' },
    { id: 'quy-bluetech', name: 'Quy' }
  ];
  studentSelect.innerHTML = students.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
  const assignBtn = document.getElementById('teacherAssignBtn');
  if (assignBtn) {
    assignBtn.addEventListener('click', async () => {
      const status = document.getElementById('teacherAssignStatus');
      if (status) status.textContent = 'Assigning...';
      const payload = {
        studentId: studentSelect.value,
        title: document.getElementById('teacherTitle')?.value || 'New Task',
        category: document.getElementById('teacherCategory')?.value || 'General',
        description: document.getElementById('teacherDesc')?.value || '',
        dailyMinutes: Number(document.getElementById('teacherDaily')?.value || 20),
        totalMinutes: Number(document.getElementById('teacherTotal')?.value || 140),
        dueDate: document.getElementById('teacherDue')?.value || ''
      };
      try {
        const r = await fetch(`${API}/api/tasks/current`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await r.json();
        if (status) {
          status.textContent = d.ok ? 'Task assigned ✓' : (d.error || 'Failed');
          status.style.color = d.ok ? 'var(--green)' : 'var(--danger)';
        }
        showToast(d.ok ? 'Task assigned' : (d.error || 'Failed'), d.ok ? 'success' : 'error');
      } catch {
        if (status) { status.textContent = 'Network error'; status.style.color = 'var(--danger)'; }
        showToast('Network error', 'error');
      }
    });
  }
  const roster = document.getElementById('teacherRoster');
  if (!roster) return;
  try {
    const r = await fetch(`${API}/api/tasks/current?studentId=all&weekId=${getWeekId()}`);
    const d = await r.json();
    const tasks = d.tasks || [];
    const grouped = tasks.reduce((acc, t) => { acc[t.studentId] = acc[t.studentId] || []; acc[t.studentId].push(t); return acc; }, {});
    roster.innerHTML = Object.keys(grouped).map(sid => {
      const items = grouped[sid];
      const done = items.filter(t => t.status === 'done' || t.completed).length;
      return `<div class="student-row"><div><div class="student-name">${escapeHtml(sid)}</div><div class="student-meta">${done}/${items.length} complete</div></div><span class="progress-pill ${done === items.length ? 'pill-ok' : done > 0 ? 'pill-warn' : 'pill-bad'}">${done === items.length ? 'Done' : done > 0 ? 'In progress' : 'Pending'}</span></div>`;
    }).join('') || '<div class="empty-state">No roster data.</div>';
  } catch {
    roster.innerHTML = '<div class="empty-state">Failed to load roster.</div>';
  }
}

function initAdminView() {
  const stats = document.getElementById('adminStats');
  const userList = document.getElementById('adminUserList');
  if (stats) stats.innerHTML = '<div class="empty-state">Admin stats require backend integration.</div>';
  if (userList) userList.innerHTML = '<div class="empty-state">User management requires backend integration.</div>';
}

function init() {
  initTheme();
  initBranding();
  initOfflineDetection();
  initRoleViews();
  const wlBtn = document.getElementById('wlSaveBtn');
  if (wlBtn) wlBtn.addEventListener('click', saveWorkLog);
  loadTasks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
