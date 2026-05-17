(function () {
  'use strict';

  const BADGE_DISPLAY_DELAY_MS    = 4000;
  const BASE_TYPING_DELAY_MS      = 900;
  const RANDOM_TYPING_VARIANCE_MS = 400;
  const MESSAGE_STAGGER_DELAY_MS  = 600;

  const responses = {
    'how does the assessment work': [
      'The Career Assessment has 4 rooms: About You (professional profile), Truth Filter (what\'s really blocking you at work), Comfort Zone Test (business read-aloud scenarios), and AI Fluency.',
      'Complete all four rooms, download your submission pack, and send it to Michael. He reviews every pack personally and follows up within 24 hours. 🎯'
    ],
    'what do i record': [
      'Room 2 has a 30–60 second spoken response about how you\'d work differently with fluent English.',
      'Room 3 has 5 read-aloud business scenarios — meetings, client calls, presentations, emails, negotiations. Room 4 has a 60–90 second AI fluency response. All audio exports in your submission pack.'
    ],
    'how do i submit my answers': [
      'Finish all four rooms, then click "Download Submission Pack" at the bottom of the page.',
      'You\'ll get a JSON file with all your responses. Send it to Michael at michael@netai.com or via WhatsApp.'
    ],
    'comfort zone': [
      'Room 3 has five real business scenarios — a project update, a client call, a partnership email, a quarterly presentation, and a negotiation.',
      'Read each passage aloud naturally — no preparation. Michael is listening for how you sound under real professional pressure.'
    ],
    'truth filter': [
      'Room 2 is about honesty — what\'s actually blocking your English at work? Select the blockers that resonate, write a short reflection, and record a spoken answer.',
      'This is not a test. It helps Michael understand the real barrier so he can give you targeted, useful feedback.'
    ],
    'ai fluency': [
      'Room 4 has two parts: a written response about how you use AI at work, and a spoken answer about how English + AI mastery would make you irreplaceable.',
      'Aim for 80–120 words written and 60–90 seconds spoken. Be honest — there are no wrong answers.'
    ],
    'help': [
      'I can help with: how the assessment works, recording, the comfort zone test, truth filter, AI fluency, or submitting your pack.',
      'You can also ask in Vietnamese — Bạn có thể hỏi tôi bằng tiếng Việt! 🇻🇳'
    ],
    'tiếng việt': [
      'Chào bạn! Bài đánh giá Career gồm 4 phòng: Hồ sơ, Truth Filter, bài đọc kịch bản kinh doanh, và AI Fluency.',
      'Hoàn thành xong, tải "Submission Pack" và gửi cho Michael — anh ấy sẽ liên hệ trong 24 giờ.'
    ],
    'hello': [
      'Hello! Ready to start the Career Assessment? Ask me anything or use a quick reply below. 🎯'
    ],
    'xin chao': [
      'Xin chào! OBI ở đây để hỗ trợ bạn hoàn thành bài đánh giá Career. 🎯'
    ]
  };

  const fallbacks = [
    "I'm not sure about that one. Try asking about the rooms, recording, or how to submit.",
    "Good question! For more help, email michael@netai.com.",
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
  if (missing.length > 0) { console.error('OBI widget failed. Missing: ' + missing.join(', ')); return; }

  let isOpen = false, hasShownBadge = false, fallbackIndex = 0;
  const pendingTimeouts = new Set();

  function clearPendingTimeouts() { pendingTimeouts.forEach(id => clearTimeout(id)); pendingTimeouts.clear(); }

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
    [1,2,3].forEach(() => { const dot = document.createElement('span'); dot.className = 'obi-dot'; bubble.appendChild(dot); });
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
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); } });

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
