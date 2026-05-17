// OBI Chat Widget — Natural English Training
// Floating conversation widget with Mouse→Tiger progression
// Connects to /api/chat on Cloudflare Workers

(function() {
  'use strict';

  const CONFIG = {
    apiBase: 'https://net-obi-api.naturalenglishtraining.com',
    levels: ['mouse', 'cat', 'wolf', 'tiger'],
    levelEmoji: { mouse: '🐭', cat: '🐱', wolf: '🐺', tiger: '🐯' },
    levelColors: { mouse: '#93c5fd', cat: '#86efac', wolf: '#fbbf24', tiger: '#f87171' },
    storageKey: 'obi-session',
    maxMessages: 100
  };

  // === STATE ===
  let state = loadState();
  let isOpen = false;
  let isTyping = false;

  function loadState() {
    try {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      sessionId: null,
      level: 'mouse',
      messages: [],
      messageCount: 0,
      userName: ''
    };
  }

  function saveState() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    } catch(e) {}
  }

  // === UI CREATION ===
  function createWidget() {
    // Floating button
    const fab = document.createElement('div');
    fab.id = 'obi-fab';
    fab.innerHTML = `<span class="obi-fab-emoji">${CONFIG.levelEmoji[state.level]}</span>`;
    fab.title = 'Chat with OBI';
    fab.addEventListener('click', toggleWidget);
    document.body.appendChild(fab);

    // Chat panel
    const panel = document.createElement('div');
    panel.id = 'obi-panel';
    panel.classList.add('obi-hidden');
    panel.innerHTML = `
      <div class="obi-header">
        <div class="obi-header-info">
          <span class="obi-header-emoji">${CONFIG.levelEmoji[state.level]}</span>
          <div>
            <div class="obi-header-title">OBI</div>
            <div class="obi-header-subtitle">Your English conversation partner</div>
          </div>
        </div>
        <div class="obi-header-actions">
          <span class="obi-level-badge" id="obi-level-badge">${state.level.toUpperCase()}</span>
          <button class="obi-close" id="obi-close">✕</button>
        </div>
      </div>
      <div class="obi-messages" id="obi-messages"></div>
      <div class="obi-typing obi-hidden" id="obi-typing">
        <span class="obi-dot"></span><span class="obi-dot"></span><span class="obi-dot"></span>
      </div>
      <div class="obi-input-area">
        <input type="text" id="obi-input" placeholder="Type a message... (English or Thai!)" autocomplete="off">
        <button id="obi-send" class="obi-send-btn">→</button>
      </div>
    `;
    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('obi-close').addEventListener('click', toggleWidget);
    document.getElementById('obi-send').addEventListener('click', sendMessage);
    document.getElementById('obi-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });

    // Load existing messages
    renderMessages();

    // Welcome message if fresh session
    if (state.messages.length === 0) {
      addBotMessage("Hi! I'm OBI 🐭 Welcome to Natural English Training! Don't worry about mistakes — they're how we learn. What's your name?");
    }
  }

  function toggleWidget() {
    isOpen = !isOpen;
    const panel = document.getElementById('obi-panel');
    const fab = document.getElementById('obi-fab');
    if (isOpen) {
      panel.classList.remove('obi-hidden');
      panel.classList.add('obi-visible');
      fab.classList.add('obi-fab-active');
      document.getElementById('obi-input').focus();
      scrollToBottom();
    } else {
      panel.classList.remove('obi-visible');
      panel.classList.add('obi-hidden');
      fab.classList.remove('obi-fab-active');
    }
  }

  // === MESSAGES ===
  function addBotMessage(text) {
    state.messages.push({ role: 'assistant', content: text, time: Date.now() });
    if (state.messages.length > CONFIG.maxMessages) state.messages = state.messages.slice(-CONFIG.maxMessages);
    saveState();
    renderMessages();
    scrollToBottom();
  }

  function addUserMessage(text) {
    state.messages.push({ role: 'user', content: text, time: Date.now() });
    state.messageCount++;
    saveState();
    renderMessages();
    scrollToBottom();
  }

  function renderMessages() {
    const container = document.getElementById('obi-messages');
    if (!container) return;
    container.innerHTML = state.messages.map(m => `
      <div class="obi-msg obi-msg-${m.role}">
        <div class="obi-msg-bubble obi-bubble-${m.role}">${escapeHtml(m.content)}</div>
      </div>
    `).join('');
  }

  function scrollToBottom() {
    const container = document.getElementById('obi-messages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    isTyping = true;
    const el = document.getElementById('obi-typing');
    if (el) { el.classList.remove('obi-hidden'); el.classList.add('obi-visible'); }
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    const el = document.getElementById('obi-typing');
    if (el) { el.classList.remove('obi-visible'); el.classList.add('obi-hidden'); }
  }

  // === SEND MESSAGE ===
  async function sendMessage() {
    const input = document.getElementById('obi-input');
    const text = input.value.trim();
    if (!text || isTyping) return;

    input.value = '';
    addUserMessage(text);
    showTyping();

    try {
      const res = await fetch(`${CONFIG.apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: state.sessionId,
          level: state.level
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      hideTyping();

      if (data.sessionId) state.sessionId = data.sessionId;
      if (data.level) {
        if (data.level !== state.level) {
          state.level = data.level;
          updateLevelUI();
        }
      }

      addBotMessage(data.reply);

      if (data.encouragement) {
        setTimeout(() => addBotMessage(data.encouragement), 1500);
      }

    } catch(err) {
      hideTyping();
      // Offline fallback — still usable without API
      const fallback = getOfflineResponse(text);
      addBotMessage(fallback);
    }
  }

  // === OFFLINE FALLBACK ===
  function getOfflineResponse(text) {
    const lower = text.toLowerCase();
    if (state.messages.length <= 3 && !state.userName) {
      // First interaction — assume it's a name
      state.userName = text;
      saveState();
      return `Nice to meet you, ${text}! 😊 I'm OBI — your English practice buddy. I'm still getting my full AI brain connected, but we can already start practicing! Tell me — what do you do for work?`;
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('สวัสดี')) {
      return "Hello! Great to hear from you! How's your day going? 😊";
    }
    if (lower.includes('thank') || lower.includes('ขอบคุณ')) {
      return "You're welcome! Keep practicing — you're doing great! 💪";
    }
    if (lower.includes('help')) {
      return "I'm here to help! Just talk to me like you would a friend. There are no wrong answers, only practice! 🌟";
    }
    return `That's great that you're practicing! My full AI is being connected soon. For now, keep talking — every message makes you stronger! ${CONFIG.levelEmoji[state.level]}`;
  }

  function updateLevelUI() {
    const badge = document.getElementById('obi-level-badge');
    const fab = document.getElementById('obi-fab');
    if (badge) {
      badge.textContent = state.level.toUpperCase();
      badge.style.background = CONFIG.levelColors[state.level];
    }
    if (fab) {
      fab.querySelector('.obi-fab-emoji').textContent = CONFIG.levelEmoji[state.level];
    }
    saveState();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // === INIT ===
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
