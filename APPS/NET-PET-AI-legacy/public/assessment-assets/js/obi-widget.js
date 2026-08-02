/* ═══════════════════════════════════════════════════════
   NET Tiger Assessment — obi-widget.js
   OBI Agent: floating AI assistant widget behaviour
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Timing constants ── */
  const BADGE_DISPLAY_DELAY_MS   = 4000;
  const BASE_TYPING_DELAY_MS     = 900;
  const RANDOM_TYPING_VARIANCE_MS = 400;
  const MESSAGE_STAGGER_DELAY_MS = 600;

  /* ── Knowledge base ── */
  const responses = {
    'how does the assessment work': [
      'The Tiger Assessment has 5 parts: Personal Info, Phonics (42 sounds), Reading, Writing, and Free Speaking.',
      'Complete each section, then click "Download Submission Pack" at the bottom. Michael reviews every submission personally and contacts you within 24 hours. 🐯'
    ],
    'what do i record': [
      'In Part 2 (Phonics) you record yourself saying each sound — tap the microphone icon next to each sound.',
      'In Part 5 (Free Speaking) you record 30–60 seconds of free speech on any topic.',
      'All audio is saved locally on your device and exported with the submission pack.'
    ],
    'how do i submit my answers': [
      'When you finish all five sections, scroll to "Complete the Assessment" at the bottom and click "Download Submission Pack".',
      'This creates a JSON file with your answers and metadata. Send it to Michael via WhatsApp or at hobbs@naturalenglishtraining.com.'
    ],
    'phonics': [
      'Part 2 covers all 42 Jolly Phonics sounds across 7 groups.',
      'Tap 🎙 to record yourself saying each sound, then tap ⏹ to stop. You can listen back before moving on.'
    ],
    'speaking': [
      'Part 5 is free speaking — talk naturally for 30–60 seconds about any topic you like.',
      'Ideas: introduce yourself, describe your family, talk about your day, or share a hobby.'
    ],
    'reading': [
      'Part 3 asks you to read a passage aloud and answer comprehension questions.',
      'Record your reading so Michael can assess pronunciation, fluency, and comprehension.'
    ],
    'writing': [
      'Part 4 has 5 writing prompts — write as much as you can in English.',
      'Mistakes are fine! Authentic language matters more than perfection.'
    ],
    'help': [
      'I can help with: how the assessment works, phonics recording, reading, writing, speaking, or submitting your pack.',
      'You can also ask in Vietnamese — Bạn có thể hỏi tôi bằng tiếng Việt! 🇻🇳'
    ],
    'tiếng việt': [
      'Chào bạn! Bài đánh giá gồm 5 phần: Thông tin cá nhân, Âm học (42 âm), Đọc hiểu, Viết, và Nói tự do.',
      'Hoàn thành xong, tải "Submission Pack" và gửi cho Michael — anh ấy sẽ liên hệ trong 24 giờ.'
    ],
    'xin chao': [
      'Xin chào! Bạn cần giúp gì không? OBI sẵn sàng hỗ trợ bài đánh giá của bạn. 🐯'
    ],
    'hello': [
      'Hello! Great to meet you. Ready to start the Tiger Assessment? Ask me anything or choose a quick reply below. 🌟'
    ]
  };

  const fallbacks = [
    "I'm not sure about that one. Try asking about phonics, recording, reading, writing, or submitting your pack.",
    "Good question! For more specific help, you can also email hobbs@naturalenglishtraining.com.",
    "Hmm, let me think… I handle questions about the assessment sections and submission. Can you rephrase?"
  ];

  /* ── Helpers ── */
  function getTimestamp() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function normaliseText(text) {
    return text
      .normalize('NFC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function matchResponse(text) {
    const normalised = normaliseText(text);
    const orderedResponses = Object.entries(responses)
      .sort(([a], [b]) => b.length - a.length);

    for (const [key, replies] of orderedResponses) {
      const normalisedKey = normaliseText(key);
      const pattern = new RegExp(`(^|\\s)${escapeRegExp(normalisedKey)}(?=\\s|$)`);
      if (pattern.test(normalised)) return replies;
    }
    return null;
  }

  /* ── DOM refs ── */
  const toggle   = document.getElementById('obiToggle');
  const panel    = document.getElementById('obiPanel');
  const messages = document.getElementById('obiMessages');
  const input    = document.getElementById('obiInput');
  const send     = document.getElementById('obiSend');
  const badge    = document.getElementById('obiBadge');
  const chips    = document.getElementById('obiChips');

  const requiredElements = {
    toggle,
    panel,
    messages,
    input,
    send,
    badge
  };
  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error(
      'OBI widget failed to initialise. Missing required DOM element(s): ' +
      missingElements.join(', ')
    );
    return;
  }
  let isOpen = false;
  let hasShownBadge = false;
  let fallbackIndex = 0;
  const pendingTimeouts = new Set();

  /* ── Cleanup pending timeouts ── */
  function clearPendingTimeouts() {
    pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    pendingTimeouts.clear();
  }

  /* ── Open / close ── */
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

  toggle.addEventListener('click', () => {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  });

  /* ── Badge hint after short delay ── */
  setTimeout(() => {
    if (!isOpen && !hasShownBadge) {
      hasShownBadge = true;
      badge.hidden = false;
    }
  }, BADGE_DISPLAY_DELAY_MS);

  /* ── Append messages ── */
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

  function scrollMessages() {
    messages.scrollTop = messages.scrollHeight;
  }

  /* ── Typing indicator ── */
  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'obi-msg agent obi-typing';
    wrapper.id = 'obiTyping';

    const bubble = document.createElement('div');
    bubble.className = 'obi-bubble';
    [1, 2, 3].forEach(() => {
      const dot = document.createElement('span');
      dot.className = 'obi-dot';
      bubble.appendChild(dot);
    });

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    scrollMessages();
  }

  function hideTyping() {
    const el = document.getElementById('obiTyping');
    if (el) el.remove();
  }

  /* ── Send a message ── */
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
        replies.forEach((reply, i) => {
          setTimeout(() => appendMessage(reply, 'agent'), i * MESSAGE_STAGGER_DELAY_MS);
        });
      } else {
        const fallback = fallbacks[fallbackIndex % fallbacks.length];
        fallbackIndex++;
        appendMessage(fallback, 'agent');
      }
    }, BASE_TYPING_DELAY_MS + Math.random() * RANDOM_TYPING_VARIANCE_MS);
  }

  /* ── Events ── */
  send.addEventListener('click', () => sendMessage(input.value));

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });
  function activateChip(chip) {
    if (!chip) return;
    const reply = chip.dataset.reply;
    if (reply) {
      if (!isOpen) openPanel();
      sendMessage(reply);
    }
  }

  chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.obi-chip');
    activateChip(chip);
  });

  chips.addEventListener('keydown', (e) => {
    const chip = e.target.closest('.obi-chip');
    if (!chip) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      activateChip(chip);
    }
  });

  /* ── Keyboard: close on Escape ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });
})();
