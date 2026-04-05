/**
 * OBI Chrome Extension — Classroom Management
 * Student attendance tracker and rule violation logger.
 * State is persisted in chrome.storage.local.
 */

function escHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

export function initClassroom() {
  const studentListEl = document.getElementById('student-list');
  const addStudentInput = document.getElementById('add-student-input');
  const addStudentBtn = document.getElementById('add-student-btn');
  const violationLog = document.getElementById('violation-log');
  const exportBtn = document.getElementById('export-violations-btn');
  const clearViolationsBtn = document.getElementById('clear-violations-btn');
  const violationFormEl = document.getElementById('violation-form');
  const violationNoteInput = document.getElementById('violation-note-input');
  const violationConfirmBtn = document.getElementById('violation-confirm-btn');
  const violationCancelBtn = document.getElementById('violation-cancel-btn');
  const violationFormLabel = document.getElementById('violation-form-label');
  const classroomStatus = document.getElementById('classroom-status');

  let students = [];
  let violations = [];
  let pendingViolationIdx = null;

  // ── Persistence ──

  async function loadData() {
    const data = await chrome.storage.local.get(['students', 'violations']);
    students = data.students || [];
    violations = data.violations || [];
    renderStudents();
    renderViolations();
  }

  async function saveStudents() {
    await chrome.storage.local.set({ students });
  }

  async function saveViolations() {
    await chrome.storage.local.set({ violations });
  }

  // ── Status message ──

  function showStatus(msg) {
    classroomStatus.textContent = msg;
    classroomStatus.classList.add('visible');
    setTimeout(() => {
      classroomStatus.textContent = '';
      classroomStatus.classList.remove('visible');
    }, 2500);
  }

  // ── Violation inline form ──

  function openViolationForm(idx) {
    pendingViolationIdx = idx;
    violationFormLabel.textContent = `Log violation for ${students[idx].name}:`;
    violationNoteInput.value = 'Talking in class';
    violationFormEl.classList.remove('hidden');
    violationNoteInput.focus();
    violationNoteInput.select();
  }

  function closeViolationForm() {
    violationFormEl.classList.add('hidden');
    pendingViolationIdx = null;
  }

  violationConfirmBtn.addEventListener('click', async () => {
    if (pendingViolationIdx === null) return;
    const student = students[pendingViolationIdx];
    violations.push({
      student: student.name,
      note: violationNoteInput.value.trim() || 'Noted',
      time: new Date().toLocaleString(),
    });
    await saveViolations();
    renderViolations();
    closeViolationForm();
  });

  violationCancelBtn.addEventListener('click', closeViolationForm);

  violationNoteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') violationConfirmBtn.click();
    if (e.key === 'Escape') closeViolationForm();
  });

  // ── Render students ──

  function renderStudents() {
    studentListEl.innerHTML = '';

    if (students.length === 0) {
      studentListEl.innerHTML =
        '<p class="no-students">No students yet. Add names above.</p>';
      return;
    }

    students.forEach((student, i) => {
      const item = document.createElement('div');
      item.className = `student-item${student.present ? '' : ' absent'}`;

      item.innerHTML = `
        <label class="student-check">
          <input type="checkbox" data-idx="${i}"${student.present ? ' checked' : ''}
            aria-label="${escHtml(student.name)} attendance">
          <span class="student-name">${escHtml(student.name)}</span>
        </label>
        <div class="student-actions">
          <button class="violation-btn" data-idx="${i}"
            aria-label="Log violation for ${escHtml(student.name)}">⚠️</button>
          <button class="remove-student-btn" data-idx="${i}"
            aria-label="Remove ${escHtml(student.name)}">✕</button>
        </div>`;

      studentListEl.appendChild(item);
    });

    // Attendance checkbox
    studentListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', async () => {
        const idx = +cb.dataset.idx;
        students[idx].present = cb.checked;
        cb.closest('.student-item').classList.toggle('absent', !cb.checked);
        await saveStudents();
      });
    });

    // Violation button → inline form
    studentListEl.querySelectorAll('.violation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openViolationForm(+btn.dataset.idx);
      });
    });

    // Remove student
    studentListEl.querySelectorAll('.remove-student-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = +btn.dataset.idx;
        students.splice(idx, 1);
        await saveStudents();
        renderStudents();
      });
    });
  }

  // ── Render violations ──

  function renderViolations() {
    if (violations.length === 0) {
      violationLog.innerHTML = '<p class="no-violations">No violations logged today.</p>';
      return;
    }

    violationLog.innerHTML = violations
      .map(
        (v, i) => `
        <div class="violation-item">
          <span class="v-icon">⚠️</span>
          <div class="v-body">
            <span class="v-student">${escHtml(v.student)}</span>
            <span class="v-note">${escHtml(v.note)}</span>
          </div>
          <span class="v-time">${escHtml(v.time)}</span>
          <button class="v-delete-btn" data-vidx="${i}"
            aria-label="Delete violation for ${escHtml(v.student)}">✕</button>
        </div>`
      )
      .join('');

    violationLog.querySelectorAll('.v-delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = +btn.dataset.vidx;
        violations.splice(idx, 1);
        await saveViolations();
        renderViolations();
      });
    });
  }

  // ── Add student ──

  addStudentBtn.addEventListener('click', async () => {
    const name = addStudentInput.value.trim();
    if (!name) return;
    students.push({ name, present: true });
    addStudentInput.value = '';
    await saveStudents();
    renderStudents();
  });

  addStudentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addStudentBtn.click();
  });

  // ── Export violations ──

  exportBtn.addEventListener('click', async () => {
    if (violations.length === 0) {
      showStatus('ℹ️ No violations to export yet.');
      return;
    }

    const { teacherName = '', className = '' } = await chrome.storage.local.get([
      'teacherName',
      'className',
    ]);

    const lines = [
      'OBI Classroom Violation Report',
      `Date: ${new Date().toLocaleDateString()}`,
      teacherName ? `Teacher: ${teacherName}` : '',
      className ? `Class: ${className}` : '',
      '─'.repeat(40),
      ...violations.map(v => `[${v.time}] ${v.student}: ${v.note}`),
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `violations-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // ── Clear violations ── (inline confirmation via button state)

  let clearPending = false;

  clearViolationsBtn.addEventListener('click', async () => {
    if (!clearPending) {
      clearPending = true;
      clearViolationsBtn.textContent = '⚠️ Confirm?';
      setTimeout(() => {
        clearPending = false;
        clearViolationsBtn.textContent = '🗑️ Clear';
      }, 3000);
      return;
    }
    clearPending = false;
    clearViolationsBtn.textContent = '🗑️ Clear';
    violations = [];
    await saveViolations();
    renderViolations();
    showStatus('✅ Violations cleared.');
  });

  loadData();
}

