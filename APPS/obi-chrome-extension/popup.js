/**
 * OBI Chrome Extension — Popup Controller
 * Handles chat input, sends to backend, renders responses.
 * Backend: Cloudflare Workers (naturalenglishtraining.net)
 * On-device: Gemini Nano APIs (Translation, Prompt, Language Detection)
 * Features: SpeechRecognition (mic), SpeechSynthesis (speak), Level tracking, Offline detection
 */

const BACKEND_URL = 'https://naturalenglishtraining.net/api/chat';

const messagesEl = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const speakerToggle = document.getElementById('speaker-toggle');
const statusEl = document.getElementById('status-indicator');
const sidePanelBtn = document.getElementById('open-sidepanel');
const offlineBanner = document.getElementById('offline-banner');
const levelLabel = document.getElementById('level-label');
const xpFill = document.getElementById('xp-fill');
const xpCount = document.getElementById('xp-count');

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
  statusEl.textContent = online ? '● Online' : '● Offline';
  statusEl.style.color = online ? '#22c55e' : '#f59e0b';
  sendBtn.disabled = false; // Gemini Nano works offline
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
  if (!autoSpeak || !('speechSynthesis' in window)) return;
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
    userInput.value = transcript;
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

// --- Gemini Nano API stubs (Chrome 120+ built-in AI) ---

async function detectLanguage(text) {
  if ('ai' in self && 'languageDetector' in self.ai) {
    try {
      const detector = await self.ai.languageDetector.create();
      const results = await detector.detect(text);
      return results[0]?.detectedLanguage || 'en';
    } catch (e) {
      console.warn('Gemini Nano Language Detection unavailable:', e);
    }
  }
  return 'unknown';
}

async function promptOnDevice(prompt) {
  if ('ai' in self && 'languageModel' in self.ai) {
    try {
      const session = await self.ai.languageModel.create({
        systemPrompt:
          'You are OBI, a friendly English tutor for Vietnamese students. ' +
          'Use simple language. Encourage the student. Follow Mouse→Tiger: permission over perfection.',
      });
      return await session.prompt(prompt);
    } catch (e) {
      console.warn('Gemini Nano Prompt API unavailable:', e);
    }
  }
  return null;
}

// --- Chat logic ---

function addMessage(text, sender = 'obi') {
  const div = document.createElement('div');
  div.className = `message ${sender}-message`;
  div.innerHTML = `<p>${escapeHtml(text)}</p>`;
  div.style.animationDelay = '0ms';
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;
  statusEl.textContent = '● Thinking...';

  try {
    const lang = await detectLanguage(text);
    let response = await promptOnDevice(text);

    if (!response) {
      if (!navigator.onLine) {
        response = 'I\'m offline right now. Gemini Nano is not available — check your connection!';
      } else {
        const res = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, language: lang }),
        });
        const data = await res.json();
        response = data.reply || 'Sorry, I had trouble understanding that. Try again?';
      }
    }

    addMessage(response, 'obi');
    speakText(response);

    const count = await incrementMessageCount();
    updateLevelDisplay(count);
  } catch (err) {
    console.error('OBI error:', err);
    addMessage('Connection issue. Check your internet and try again.', 'obi');
  } finally {
    sendBtn.disabled = false;
    updateOnlineStatus();
  }
}

// --- Event listeners ---

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sidePanelBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openSidePanel' });
});

// --- Init ---

(async () => {
  const count = await loadMessageCount();
  updateLevelDisplay(count);
})();
