(function() {
    const notesKey = 'net_homework';
    const sidKey = 'net_studentId';
    async function getStudentId() {
        return localStorage.getItem(sidKey) || document.body.dataset.studentId || '';
    }
    function saveToLocal(value) {
        try { localStorage.setItem(notesKey, value); } catch (e) {}
    }
    async function initHomeworkNotes() {
        const notesEl = document.getElementById('homeworkNotes');
        const saveBtn = document.getElementById('saveNotesBtn');
        const status = document.getElementById('notesStatus');
        if (!notesEl) return;
        notesEl.value = localStorage.getItem(notesKey) || '';
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const text = notesEl.value;
                saveToLocal(text);
                try {
                    const studentId = await getStudentId();
                    const r = await fetch('/api/student/state', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ homework_notes: text })
                    });
                    if (r.ok) {
                        if (status) { status.textContent = 'Saved'; status.style.color = '#22c55e'; }
                    } else {
                        if (status) { status.textContent = 'Saved locally'; status.style.color = '#f59e0b'; }
                        console.warn('Server state PATCH failed:', r.status);
                    }
                } catch (e) {
                    if (status) { status.textContent = 'Saved locally'; status.style.color = '#f59e0b'; }
                    console.warn('State PATCH network error:', e);
                }
            });
        }
    }
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', initHomeworkNotes);
    }
})();
