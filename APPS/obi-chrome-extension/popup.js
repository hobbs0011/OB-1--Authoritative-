/**
 * OBI Chrome Extension — Popup Controller
 * Handles chat input, sends to backend, renders responses.
 * Backend: Cloudflare Workers (naturalenglishtraining.net)
 * On-device: Gemini Nano APIs (Translation, Prompt, Language Detection)
 */

const BACKEND_URL = 'https://naturalenglishtraining.net/api/chat';
const messagesEl = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusEl = document.getElementById('status-indicator');
const sidePanelBtn = document.getElementById('open-sidepanel');

// --- Gemini Nano API stubs (Chrome 120+ built-in AI) ---

async function detectLanguage(text) {
  // Chrome Built-in AI: Language Detection API
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

async function translateOnDevice(text, sourceLanguage, targetLanguage) {
  // Chrome Built-in AI: Translation API
  if ('ai' in self && 'translator' in self.ai) {
    try {
      const translator = await self.ai.translator.create({
        sourceLanguage,
        targetLanguage,
      });
      return await translator.translate(text);
    } catch (e) {
      console.warn('Gemini Nano Translation unavailable:', e);
    }
  }
  return null; // fallback to backend
}

async function promptOnDevice(prompt) {
  // Chrome Built-in AI: Prompt API (Gemini Nano)
  if ('ai' in self && 'languageModel' in self.ai) {
    try {
      const session = await self.ai.languageModel.create({
        systemPrompt: 'You are OBI, a friendly English tutor for Vietnamese students. Use simple language. Encourage the student. Follow Mouse→Tiger: permission over perfection.',
      });
      return await session.prompt(prompt);
    } catch (e) {
      console.warn('Gemini Nano Prompt API unavailable:', e);
    }
  }
  return null; // fallback to backend
}

// --- Chat logic ---

function addMessage(text, sender = 'obi') {
  const div = document.createElement('div');
  div.className = `message ${sender}-message`;
  div.innerHTML = `<p>${escapeHtml(text)}</p>`;
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
  statusEl.textContent = '● Thinking...';

  try {
    // Step 1: Detect language on-device
    const lang = await detectLanguage(text);

    // Step 2: Try on-device response first ($0)
    let response = await promptOnDevice(text);

    // Step 3: If Gemini Nano unavailable, fall back to backend
    if (!response) {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language: lang }),
      });
      const data = await res.json();
      response = data.reply || 'Sorry, I had trouble understanding that. Try again?';
    }

    addMessage(response, 'obi');
  } catch (err) {
    console.error('OBI error:', err);
    addMessage('Connection issue. Check your internet and try again.', 'obi');
  } finally {
    statusEl.textContent = '● Online';
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
