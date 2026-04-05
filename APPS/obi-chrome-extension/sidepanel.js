/**
 * OBI Chrome Extension — Side Panel Controller
 * Full-featured panel with translation, summarizer, rewriter, and chat.
 * Features: SpeechRecognition (mic), SpeechSynthesis (speak), Level tracking, Offline detection
 * Tabs: Chat, Homework Checker, Classroom, Settings
 */

import { initHomeworkChecker } from './homework-checker.js';
import { initClassroom } from './classroom.js';
import { initSettings } from './settings.js';

const BACKEND_URL = 'https://naturalenglishtraining.net/api/chat';

const messagesEl = document.getElementById('panel-messages');
const inputEl = document.getElementById('panel-input');
const sendBtn = document.getElementById('panel-send');
const translateBtn = document.getElementById('translate-btn');
const summarizeBtn = document.getElementById('summarize-btn');
const rewriteBtn = document.getElementById('rewrite-btn');
const micBtn = document.getElementById('mic-btn');
const speakerToggle = document.getElementById('speaker-toggle');
const offlineBanner = document.getElementById('offline-banner');
const levelLabel = document.getElementById('level-label');
const xpFill = document.getElementById('xp-fill');
const xpCount = document.getElementById('xp-count');

// ── Tab switching ──

const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.toggle('active', b === btn));
    tabPanels.forEach(p => p.classList.toggle('active', p.id === `tab-${target}`));
  });
});

// --- Level system ---

const LEVELS = [
  { name: 'Mouse', emoji: '🐭', min: 0, max: 10 },
  { name: 'Cat', emoji: '🐱', min: 11, max: 50 },
  { name: 'Wolf', emoji: '🐺', min: 51, max: 200 },
  { name: 'Tiger', emoji: '🐯', min: 201, max: Infinity },
];

async function loadMessageCount() {
  const result = await chrome.storage.local.get('messageCount');
  return result.messageCount || 0;
}

async function incrementMessageCount() {
  const count = await loadMessageCount();
  const newCount = count + 1;
  await chrome.storage.local.set({ messageCount: newCount });
  return newCount;
}

function getLevelInfo(count) {
  for (const lvl of LEVELS) {
    if (count >= lvl.min && count <= lvl.max) return lvl;
  }
  return LEVELS[LEVELS.length - 1];
}

function updateLevelDisplay(count) {
  const lvl = getLevelInfo(count);
  levelLabel.textContent = `${lvl.emoji} ${lvl.name}`;
  const nextLvl = LEVELS[LEVELS.indexOf(lvl) + 1];
  if (nextLvl) {
    const range = nextLvl.min - lvl.min;
    const progress = count - lvl.min;
    xpFill.style.width = `${Math.min(100, (progress / range) * 100)}%`;
    xpCount.textContent = `${count} XP`;
  } else {
    xpFill.style.width = '100%';
    xpCount.textContent = `${count} XP ✓`;
  }
}

// --- Offline detection ---

function updateOnlineStatus() {
  const online = navigator.onLine;
  offlineBanner.classList.toggle('hidden', online);
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// --- Speech Synthesis ---

let autoSpeak = true;

speakerToggle.addEventListener('click', () => {
  autoSpeak = !autoSpeak;
  speakerToggle.textContent = autoSpeak ? '🔊' : '🔇';
  speakerToggle.title = autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF';
});

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

// --- Speech Recognition (mic) ---

let recognition = null;
let isRecording = false;

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    inputEl.value = transcript;
    stopRecording();
    sendMessage();
  };

  recognition.onerror = () => stopRecording();
  recognition.onend = () => stopRecording();
}

function startRecording() {
  if (!recognition) {
    addMessage('Speech recognition not supported in this browser.', 'obi');
    return;
  }
  isRecording = true;
  micBtn.classList.add('recording');
  micBtn.title = 'Listening...';
  recognition.start();
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
  micBtn.title = 'Speak your message';
}

micBtn.addEventListener('click', () => {
  if (isRecording) {
    recognition?.stop();
    stopRecording();
  } else {
    startRecording();
  }
});

// --- Message rendering ---

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}

function addMessage(text, sender = 'obi') {
  const div = document.createElement('div');
  div.className = `message ${sender}`;

  if (sender === 'obi') {
    const p = document.createElement('p');
    p.textContent = text;

    const speakBtn = document.createElement('button');
    speakBtn.className = 'msg-speak-btn';
    speakBtn.title = 'Read aloud';
    speakBtn.textContent = '🔊';
    speakBtn.addEventListener('click', () => speakText(text));

    div.appendChild(p);
    div.appendChild(speakBtn);
  } else {
    div.innerHTML = `<p>${escapeHtml(text)}</p>`;
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// --- Chat ---

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  inputEl.value = '';
  sendBtn.disabled = true;

  try {
    let reply = null;

    if ('ai' in self && 'languageModel' in self.ai) {
      const session = await self.ai.languageModel.create({
        systemPrompt:
          'You are OBI, a friendly English tutor for Vietnamese students. Mouse→Tiger pedagogy.',
      });
      reply = await session.prompt(text);
    }

    if (!reply) {
      if (!navigator.onLine) {
        reply = 'I\'m offline. Gemini Nano is not available — check your connection!';
      } else {
        const res = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();
        reply = data.reply || 'Hmm, try again?';
      }
    }

    addMessage(reply, 'obi');
    if (autoSpeak) speakText(reply);

    const count = await incrementMessageCount();
    updateLevelDisplay(count);
  } catch (err) {
    addMessage('Connection issue. Try again.', 'obi');
  } finally {
    sendBtn.disabled = false;
  }
}

// --- Translate ---

translateBtn.addEventListener('click', async () => {
  const text = inputEl.value.trim();
  if (!text) {
    addMessage('Paste or type text in the box above, then click Translate.', 'obi');
    return;
  }

  if ('ai' in self && 'translator' in self.ai) {
    try {
      const detector = await self.ai.languageDetector.create();
      const detected = await detector.detect(text);
      const sourceLang = detected[0]?.detectedLanguage || 'vi';
      const targetLang = sourceLang === 'en' ? 'vi' : 'en';

      const translator = await self.ai.translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
      });
      const result = await translator.translate(text);
      addMessage(`🔄 ${sourceLang} → ${targetLang}: ${result}`, 'obi');
      return;
    } catch (e) {
      console.warn('On-device translation failed:', e);
    }
  }

  addMessage(
    'Translation requires Chrome 120+ with Gemini Nano enabled at chrome://flags. ' +
    'Try enabling "Prompt API for Gemini Nano" flag.',
    'obi'
  );
});

// --- Summarizer API ---

summarizeBtn.addEventListener('click', async () => {
  const text = inputEl.value.trim();
  if (!text) {
    addMessage('Paste text in the box above, then click Summarize.', 'obi');
    return;
  }

  if ('ai' in self && 'summarizer' in self.ai) {
    try {
      const summarizer = await self.ai.summarizer.create({
        type: 'key-points',
        format: 'plain-text',
        length: 'short',
      });
      const summary = await summarizer.summarize(text);
      addMessage(`📋 Summary:\n${summary}`, 'obi');
      return;
    } catch (e) {
      console.warn('Summarizer API failed:', e);
    }
  }

  // Fallback: ask OBI to summarize via prompt
  if ('ai' in self && 'languageModel' in self.ai) {
    try {
      const session = await self.ai.languageModel.create({
        systemPrompt: 'You are OBI, a helpful English tutor. Summarize text in 2-3 short bullet points for a language learner.',
      });
      const summary = await session.prompt(`Please summarize this text briefly:\n\n${text}`);
      addMessage(`📋 Summary (via OBI):\n${summary}`, 'obi');
      return;
    } catch (e) {
      console.warn('Fallback summarizer failed:', e);
    }
  }

  addMessage(
    'Summarizer API requires Chrome 120+ with Gemini Nano. ' +
    'Enable it at chrome://flags → "Summarization API for Gemini Nano".',
    'obi'
  );
});

// --- Rewriter (Simplify) API ---

rewriteBtn.addEventListener('click', async () => {
  const text = inputEl.value.trim();
  if (!text) {
    addMessage('Paste text in the box above, then click Simplify.', 'obi');
    return;
  }

  if ('ai' in self && 'rewriter' in self.ai) {
    try {
      const rewriter = await self.ai.rewriter.create({
        tone: 'more-casual',
        length: 'shorter',
        sharedContext: 'Simplify for an English language learner at beginner level.',
      });
      const simplified = await rewriter.rewrite(text);
      addMessage(`✏️ Simplified:\n${simplified}`, 'obi');
      return;
    } catch (e) {
      console.warn('Rewriter API failed:', e);
    }
  }

  // Fallback: ask OBI to simplify via prompt
  if ('ai' in self && 'languageModel' in self.ai) {
    try {
      const session = await self.ai.languageModel.create({
        systemPrompt: 'You are OBI. Rewrite text in simple English for a Vietnamese beginner learner. Use short sentences and common words.',
      });
      const simplified = await session.prompt(`Please simplify this text:\n\n${text}`);
      addMessage(`✏️ Simplified (via OBI):\n${simplified}`, 'obi');
      return;
    } catch (e) {
      console.warn('Fallback rewriter failed:', e);
    }
  }

  addMessage(
    'Rewriter API requires Chrome 120+ with Gemini Nano. ' +
    'Enable it at chrome://flags → "Rewriter API for Gemini Nano".',
    'obi'
  );
});

// --- Event listeners ---

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// --- Init ---

(async () => {
  addMessage('Welcome to OBI! 🐭→🐯 Ask anything, translate, summarize, or practice writing.', 'obi');
  const count = await loadMessageCount();
  updateLevelDisplay(count);

  initHomeworkChecker();
  initClassroom();
  initSettings();
})();
