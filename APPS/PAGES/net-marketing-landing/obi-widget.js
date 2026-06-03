;(function () {
  'use strict';

  const CONFIG = {
    apiBase:    'https://net-pet-ai.mrmichaelhobbs123.workers.dev',
    avatarSrc:  './assets/NET-LION-VOICE-4.png',
    peekDelay:  4000,
    storageKey: 'obi-gateway-session'
  };

  const root = document.getElementById('obi-widget');
  if (!root) return;

  // ── State ──────────────────────────────────────────────────────────
  let sessionId  = null;
  let isOpen     = false;
  let peekFired  = false;

  try { sessionId = localStorage.getItem(CONFIG.storageKey); } catch(e) {}

  // ── DOM ─────────────────────────────────────────────────────────────
  root.innerHTML = `
    <div id="obi-panel" aria-live="polite" aria-label="OBI routing guide">
      <div class="obi-panel-header">
        <img class="obi-header-avatar" src="${CONFIG.avatarSrc}" alt="OBI the lion">
        <div class="obi-header-info">
          <span class="obi-header-title">OBI · NET Guide</span>
          <span class="obi-header-status">Online</span>
        </div>
        <button class="obi-close" id="obiClose" aria-label="Close OBI">✕</button>
      </div>
      <div class="obi-messages" id="obiMessages"></div>
      <div class="obi-chips" id="obiChips"></div>
      <div class="obi-input-row">
        <input class="obi-input" id="obiInput" type="text"
          placeholder="Ask OBI anything…" maxlength="300" autocomplete="off">
        <button class="obi-send" id="obiSend" aria-label="Send">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
    <button id="obi-fab" aria-label="Open OBI guide" aria-expanded="false">
      <img class="obi-fab-avatar" src="${CONFIG.avatarSrc}" alt="">
      <span id="obi-badge" class="obi-badge">1</span>
    </button>
  `;

  const fab      = document.getElementById('obi-fab');
  const panel    = document.getElementById('obi-panel');
  const messages = document.getElementById('obiMessages');
  const chips    = document.getElementById('obiChips');
  const input    = document.getElementById('obiInput');
  const badge    = document.getElementById('obi-badge');

  // ── Panel toggle ────────────────────────────────────────────────────
  function open() {
    isOpen = true;
    panel.classList.add('obi-panel--open');
    fab.setAttribute('aria-expanded', 'true');
    badge.hidden = true;
    input.focus();
  }

  function close() {
    isOpen = false;
    panel.classList.remove('obi-panel--open');
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', () => isOpen ? close() : open());
  document.getElementById('obiClose').addEventListener('click', close);

  // ── Messages ─────────────────────────────────────────────────────────
  function addMsg(text, role = 'agent') {
    const wrap = document.createElement('div');
    wrap.className = 'obi-msg ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'obi-bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }

  function setChips(chipDefs) {
    chips.innerHTML = '';
    chipDefs.forEach(({ label, msg }) => {
      const btn = document.createElement('button');
      btn.className = 'obi-chip';
      btn.textContent = label;
      btn.type = 'button';
      btn.addEventListener('click', () => {
        chips.innerHTML = '';
        send(msg);
      });
      chips.appendChild(btn);
    });
  }

  // ── Gate pulse ───────────────────────────────────────────────────────
  function pulseGate(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('gate-pulse');
    setTimeout(() => el.classList.remove('gate-pulse'), 2200);
  }

  function routeFromReply(text) {
    const t = text.toLowerCase();
    if (t.includes('tiger') || t.includes('tigers-4room')) pulseGate('.gate-tiger');
    else if (t.includes('professional') || t.includes('professional-4room')) pulseGate('.gate-pro');
  }

  // ── Offline fallback ─────────────────────────────────────────────────
  function offlineFallback(msg) {
    const t = msg.toLowerCase();
    if (/parent|child|kid|con|phụ huynh/.test(t) ||
        (/\b(\d{1,2})\b/.test(t) && parseInt(RegExp.$1) < 18)) {
      addMsg('Sounds like Tigers is the right path! Great for ages 3–17. → tigers-4room.pages.dev');
      pulseGate('.gate-tiger');
    } else if (/university|career|professional|work|adult|uni|việc|nghề/.test(t)) {
      addMsg('NET Professionals is your path — University & Career focused. → professional-4room.pages.dev');
      pulseGate('.gate-pro');
    } else {
      addMsg("Tell me your age or goal and I'll point you to the right path! / Cho tôi biết tuổi hoặc mục tiêu, tôi sẽ chỉ đường cho bạn!");
    }
  }

  // ── Send ──────────────────────────────────────────────────────────────
  async function send(msg) {
    if (!msg.trim()) return;
    addMsg(msg, 'user');

    try {
      const res = await fetch(`${CONFIG.apiBase}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg, sessionId, mode: 'gateway' })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.sessionId) {
        sessionId = data.sessionId;
        try { localStorage.setItem(CONFIG.storageKey, sessionId); } catch(e) {}
      }
      addMsg(data.reply || '');
      routeFromReply(data.reply || '');
    } catch (_) {
      offlineFallback(msg);
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const v = input.value.trim();
      input.value = '';
      if (v) send(v);
    }
  });

  document.getElementById('obiSend').addEventListener('click', () => {
    const v = input.value.trim();
    input.value = '';
    if (v) send(v);
  });

  // ── Peek after idle ──────────────────────────────────────────────────
  const peekTimer = setTimeout(() => {
    if (peekFired || isOpen) return;
    peekFired = true;
    open();
    addMsg('Not sure which path? Tell me your age or goal. / Chưa biết chọn hướng nào? Cho tôi biết tuổi hoặc mục tiêu của bạn. 🦁');
    setChips([
      { label: "I'm a parent",           msg: "I'm a parent looking for my child" },
      { label: "I'm a student (ages 3–17)", msg: "I'm a student aged under 18" },
      { label: "University / Career",     msg: "I want university or career English" }
    ]);
  }, CONFIG.peekDelay);

  // Cancel peek if user already interacts intentionally
  fab.addEventListener('click', () => { clearTimeout(peekTimer); peekFired = true; }, { once: true });

})();
