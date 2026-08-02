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

  /* ── Guardrails ── */
  const MAX_INPUT_LENGTH = 300;
  const GUARDRAIL_REPLY  = "I'm here to help with the Tiger Assessment. Please keep messages relevant and respectful. 🐯";

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
    ],
    'come on': [
      "It seems like you're feeling frustrated — that's totally okay. 🐯 Hard things feel hard at first.",
      "Take a breath and let me know what's giving you trouble. Is it recording, a specific section, or something else? I'm here to help."
    ],
    'ugh': [
      "Sounds like you hit a wall — it happens! 🐯 Tell me what's going wrong and we'll sort it out together."
    ],
    'this is hard': [
      "Hard is good — it means you're pushing past your comfort zone. 🐯 What part is tricky? Let me help you through it."
    ],
    'i give up': [
      "Don't give up — Tigers don't quit! 🐯 Tell me where you're stuck and we'll tackle it together."
    ],
    'too hard': [
      "Nothing is too hard with the right support. 🐯 What part is causing the most trouble? Let's break it down step by step."
    ],

    /* ── Teacher-facing topics (Classroom Manager) ── */
    'notes checker': [
      'The Notes Checker uses Google Gemini Vision to read a photo of student handwriting.',
      'Upload or snap a photo → pick the student and subject → tap "Check Notes with Obi". Gemini reads the page and gives Mouse→Tiger feedback you can copy or save. 📸'
    ],
    'roster': [
      'The Roster tab lets you add and remove students. Names are saved in your browser (localStorage) — no server needed.',
      'Students you add here automatically appear as quick-select chips in the Notes Checker. Click a name in the Roster tab to remove it.'
    ],
    'classroom': [
      'The Classroom Manager has three tabs: Notes Checker (AI-powered handwriting review), Class Log (session event tracker), and Roster (student list).',
      'Everything runs locally in your browser except the Gemini Vision call. Your data never touches NET servers. 🔒'
    ],
    'session log': [
      'Start a session from the Class Log tab to begin tracking events. Use the quick-log buttons to record attendance, behaviour, and participation.',
      'Events queue offline and flush automatically when the NET worker comes back online. The compliance rate updates in real time.'
    ],
    'api key': [
      'The Notes Checker needs a free Google Gemini API key — get one at aistudio.google.com/apikey.',
      'Paste the key into the field at the top of the Notes Checker tab and click Save. It stays in your browser only — never sent to NET. 🔑'
    ],
    'teacher': [
      'Hey teacher! 🐯 This Classroom Manager is built for you — check student notes with AI, track class events, and manage your roster all in one place.',
      'Try asking me about "notes checker", "roster", "session log", or "api key" for step-by-step help.'
    ],
    'youtube': [
      'Watch English YouTube for 10 minutes every day — news, vlogs, anything you enjoy.',
      'The NET Chrome extension logs what you watch and tells Obi. Then we can talk about it!'
    ],
    'chrome extension': [
      'Install the NET Chrome Extension — it tracks your English YouTube watching and gives Obi a heads-up before your session.',
      'Ask your teacher for the install link or find it in your student portal.'
    ],
    'my portal': [
      'Your student portal has your profile, action plan, career goals, methodology, and session transcripts.',
      'Ask your teacher for your portal link, or check the URL your teacher gave you.'
    ],
    'coach': [
      'Your coach is Michael Hobbs — he reviews every submission personally and contacts you within 24 hours.',
      'Email: hobbs@naturalenglishtraining.com | WhatsApp is also fine for quick questions.'
    ],
    'michael': [
      'Michael Hobbs is your NET coach. He reviews assessments, sets your learning plan, and coaches you live.',
      'Reach him at hobbs@naturalenglishtraining.com or WhatsApp.'
    ],
    'action plan': [
      'Your action plan is in your student portal — it shows your current focus areas and weekly targets.',
      'Ask your teacher for your portal link if you haven\'t seen it yet.'
    ],
    'listening': [
      'The program is 45 minutes of listening per day — content you actually enjoy. K-dramas, YouTube, podcasts, anything where you understand about 60-80% already.',
      'Start with Vietnamese subtitles, then switch to English subtitles, then try with no subtitles. That progression is the method.'
    ],
    'speaking': [
      'The 15-minute speaking practice is this chat with Obi — plus shadowing what you listen to.',
      'Volume and confidence beat perfect grammar. Say it loud, say it proud, fix the details later.'
    ],
    '45 minutes': [
      '45 minutes of listening per day — it sounds like a lot but you can do it on your commute, while cooking, getting ready, or at the gym.',
      'The rule is 60% comprehension: you should understand most of what you hear. If it is too hard, find easier content. If it is too easy, level up.'
    ],
    'how long': [
      'One hour a day total: 45 minutes listening + 15 minutes speaking with Obi.',
      'The listening fits into your existing routine — commute, cooking, gym. The 15 minutes speaking is this chat. That is the whole program.'
    ],
    'subtitles': [
      'Start with Vietnamese subtitles so you understand the content. Then switch to English subtitles. Then try without any subtitles.',
      'Do not rush the progression — each stage trains a different skill. Vietnamese subs first, English subs second, no subs third.'
    ],
    'what should i watch': [
      'Watch anything you actually enjoy — K-dramas, YouTube channels about your hobbies, Netflix shows, cooking videos, travel vlogs.',
      'The key is 60% comprehension. If you understand most of it without trying too hard, it is the right level. Do not force yourself through hard content.'
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

    /* ── Guardrail: enforce maximum input length ── */
    if (trimmed.length > MAX_INPUT_LENGTH) {
      appendMessage(GUARDRAIL_REPLY, 'agent');
      input.value = '';
      return;
    }

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
