/* ═══════════════════════════════════════════════════════
   NET Professional Assessment — obi-widget.js
   OBI Agent: floating AI assistant widget behaviour
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const BADGE_DISPLAY_DELAY_MS    = 4000;
  const BASE_TYPING_DELAY_MS      = 900;
  const RANDOM_TYPING_VARIANCE_MS = 400;
  const MESSAGE_STAGGER_DELAY_MS  = 600;

  const responses = {
    'how does the assessment work': [
      'The Professional Assessment has 4 rooms covering your current English level, professional context, spoken confidence, and written expression.',
      'Complete each room, then click "Download Submission Pack." Michael reviews every submission personally and contacts you within 24 hours. 🎯'
    ],
    'what do i record': [
      'The speaking room includes a free-speak recording — 60–90 seconds on a professional topic of your choice.',
      'All audio is saved locally on your device and exported with your submission pack.'
    ],
    'how do i submit my answers': [
      'When you finish all four rooms, click "Download Submission Pack" at the bottom.',
      'This creates a JSON file with your answers. Send it to Michael via WhatsApp or at hobbs@naturalenglishtraining.com.'
    ],
    'speaking': [
      'The speaking room asks you to record yourself on a professional topic — a meeting scenario, a presentation intro, or a client explanation.',
      'Aim for 60–90 seconds. Clarity and confidence matter more than perfection.'
    ],
    'writing': [
      'The writing room includes short professional writing prompts — emails, reports, or summaries.',
      'Write as naturally as you can. Michael is looking at vocabulary range, clarity, and professional register.'
    ],
    'help': [
      'I can help with: how the assessment works, recording, writing, or submitting your pack.',
      'You can also ask in Vietnamese — Bạn có thể hỏi tôi bằng tiếng Việt! 🇻🇳'
    ],
    'tiếng việt': [
      'Chào bạn! Bài đánh giá Professional gồm 4 phòng: trình độ hiện tại, bối cảnh nghề nghiệp, nói tự tin, và viết chuyên nghiệp.',
      'Hoàn thành xong, tải "Submission Pack" và gửi cho Michael — anh ấy sẽ liên hệ trong 24 giờ.'
    ],
    'hello': [
      'Hello! Ready to start the Professional Assessment? Ask me anything or use a quick reply below. 🎯'
    ],
    'xin chao': [
      'Xin chào! OBI ở đây để hỗ trợ bạn hoàn thành bài đánh giá Professional. 🎯'
    ]
  };

  const fallbacks = [
    "I'm not sure about that one. Try asking about the assessment rooms, recording, or submitting your pack.",
    "Good question! For more help, email hobbs@naturalenglishtraining.com.",
    "Hmm — I handle questions about the assessment and submission. Can you rephrase?"
  ];

  function getTimestamp() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function normaliseText(text) {
    return text.normalize('NFC').toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ').replace(/\s+/g, ' ').trim();
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function matchResponse(text) {
    const normalised = normaliseText(text);
    const ordered = Object.entries(responses).sort(([a], [b]) => b.length - a.length);
    for (const [key, replies] of ordered) {
      const pattern = new RegExp(`(^|\\s)${escapeRegExp(normaliseText(key))}(?=\\s|$)`);
      if (pattern.test(normalised)) return replies;
    }
    return null;
  }

  const toggle   = document.getElementById('obiToggle');
  const panel    = document.getElementById('obiPanel');
  const messages = document.getElementById('obiMessages');
  const input    = document.getElementById('obiInput');
  const send     = document.getElementById('obiSend');
  const badge    = document.getElementById('obiBadge');
  const chips    = document.getElementById('obiChips');

  const required = { toggle, panel, messages, input, send, badge };
  const missing  = Object.entries(required).filter(([, el]) => !el).map(([n]) => n);
  if (missing.length > 0) {
    console.error('OBI widget failed to initialise. Missing: ' + missing.join(', '));
    return;
  }

  let isOpen = false, hasShownBadge = false, fallbackIndex = 0;
  const pendingTimeouts = new Set();

  function clearPendingTimeouts() {
    pendingTimeouts.forEach(id => clearTimeout(id));
    pendingTimeouts.clear();
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close OBI agent');
    badge.hidden = true;
    input.focus();
    scrollMessages();
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open OBI agent');
    clearPendingTimeouts();
  }

  toggle.addEventListener('click', () => { if (isOpen) closePanel(); else openPanel(); });

  setTimeout(() => {
    if (!isOpen && !hasShownBadge) { hasShownBadge = true; badge.hidden = false; }
  }, BADGE_DISPLAY_DELAY_MS);

  function appendMessage(text, role) {
    const wrapper = document.createElement('div');
    wrapper.className = 'obi-msg ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'obi-bubble';
    bubble.textContent = text;
    const ts = document.createElement('div');
    ts.className = 'obi-timestamp';
    ts.textContent = getTimestamp();
    wrapper.appendChild(bubble);
    wrapper.appendChild(ts);
    messages.appendChild(wrapper);
    scrollMessages();
    return wrapper;
  }

  function scrollMessages() { messages.scrollTop = messages.scrollHeight; }

  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'obi-msg agent obi-typing';
    wrapper.id = 'obiTyping';
    const bubble = document.createElement('div');
    bubble.className = 'obi-bubble';
    [1,2,3].forEach(() => {
      const dot = document.createElement('span');
      dot.className = 'obi-dot';
      bubble.appendChild(dot);
    });
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    scrollMessages();
  }

  function hideTyping() { document.getElementById('obiTyping')?.remove(); }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    input.value = '';
    appendMessage(trimmed, 'user');
    showTyping();
    setTimeout(() => {
      hideTyping();
      const replies = matchResponse(trimmed);
      if (replies) {
        replies.forEach((reply, i) => setTimeout(() => appendMessage(reply, 'agent'), i * MESSAGE_STAGGER_DELAY_MS));
      } else {
        appendMessage(fallbacks[fallbackIndex++ % fallbacks.length], 'agent');
      }
    }, BASE_TYPING_DELAY_MS + Math.random() * RANDOM_TYPING_VARIANCE_MS);
  }

  send.addEventListener('click', () => sendMessage(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  });

  function activateChip(chip) {
    if (!chip?.dataset.reply) return;
    if (!isOpen) openPanel();
    sendMessage(chip.dataset.reply);
  }

  chips.addEventListener('click', (e) => activateChip(e.target.closest('.obi-chip')));
  chips.addEventListener('keydown', (e) => {
    const chip = e.target.closest('.obi-chip');
    if (chip && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activateChip(chip); }
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) closePanel(); });
})();
