// problem-report.js — Universal floating problem report button
// Include on any student-facing page: <script src="/problem-report.js"></script>
// P6 BlueTech promise — Michael Hobbs, 2026-05-21

(function() {
  if (document.getElementById('net-report-btn')) return; // already injected

  const BASE = location.hostname.includes('workers.dev')
    ? `https://${location.hostname}`
    : 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';

  // Extract studentId from URL or page context
  function getStudentId() {
    const params = new URLSearchParams(location.search);
    if (params.get('studentId')) return params.get('studentId');
    if (params.get('student')) return params.get('student');
    if (typeof studentId !== 'undefined') return studentId;
    // Try to guess from URL path
    const m = location.pathname.match(/\/([a-z]+-[a-z]+)\.html/);
    if (m) return m[1];
    return 'unknown';
  }

  // ── Create floating button ──
  const btn = document.createElement('button');
  btn.id = 'net-report-btn';
  btn.title = 'Report a Problem';
  btn.textContent = '!';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: '9999',
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
    color: '#f87171', fontSize: '20px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  });
  btn.onmouseenter = () => { btn.style.background = 'rgba(239,68,68,0.25)'; };
  btn.onmouseleave = () => { btn.style.background = 'rgba(239,68,68,0.15)'; };
  document.body.appendChild(btn);

  // ── Create modal ──
  const overlay = document.createElement('div');
  overlay.id = 'net-report-overlay';
  Object.assign(overlay.style, {
    display: 'none', position: 'fixed', inset: '0', zIndex: '10000',
    background: 'rgba(0,0,0,0.85)',
    alignItems: 'center', justifyContent: 'center',
  });

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="background:#1a1a2e;border:1px solid rgba(239,68,68,0.3);border-radius:16px;padding:24px;max-width:380px;width:90%;">
      <h3 style="color:#f87171;margin:0 0 8px 0;">Report a Problem</h3>
      <p style="color:#889;font-size:0.85rem;margin:0 0 14px 0;">Michael will see this and fix it.</p>
      <textarea id="net-report-text" rows="3" placeholder="Describe the issue..." style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:0.9rem;resize:vertical;box-sizing:border-box;"></textarea>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button id="net-report-send" style="flex:1;padding:10px;border-radius:10px;background:#ef4444;color:#fff;border:none;font-weight:600;cursor:pointer;">Send</button>
        <button id="net-report-cancel" style="flex:1;padding:10px;border-radius:10px;background:rgba(255,255,255,0.08);color:#889;border:1px solid rgba(255,255,255,0.1);cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // ── Event handlers ──
  btn.onclick = () => { overlay.style.display = 'flex'; };

  overlay.querySelector('#net-report-cancel').onclick = () => {
    overlay.style.display = 'none';
  };

  overlay.querySelector('#net-report-send').onclick = async () => {
    const text = overlay.querySelector('#net-report-text').value.trim();
    if (!text) return;
    try {
      await fetch(`${BASE}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: getStudentId(),
          report: text,
          page: location.href,
          time: new Date().toISOString()
        })
      });
      overlay.querySelector('#net-report-text').value = '';
      overlay.style.display = 'none';
      alert('Report sent. Michael will check it. Thanks!');
    } catch (e) {
      alert('Could not send. Please tell Michael directly.');
    }
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  };
})();
