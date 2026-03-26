/**
 * OBI Chrome Extension — Side Panel Controller
 * Full-featured panel with translation, writing exercises, and chat.
 */

const BACKEND_URL = 'https://naturalenglishtraining.net/api/chat';

const messagesEl = document.getElementById('panel-messages');
const inputEl = document.getElementById('panel-input');
const sendBtn = document.getElementById('panel-send');
const translateBtn = document.getElementById('translate-btn');

function addMessage(text, sender = 'obi') {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerHTML = `<p>${text}</p>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  inputEl.value = '';

  try {
    // Try Gemini Nano first
    if ('ai' in self && 'languageModel' in self.ai) {
      const session = await self.ai.languageModel.create({
        systemPrompt: 'You are OBI, a friendly English tutor for Vietnamese students. Mouse→Tiger pedagogy.',
      });
      const reply = await session.prompt(text);
      addMessage(reply, 'obi');
      return;
    }

    // Fallback to backend
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    addMessage(data.reply || 'Hmm, try again?', 'obi');
  } catch (err) {
    addMessage('Connection issue. Try again.', 'obi');
  }
}

translateBtn.addEventListener('click', async () => {
  const text = inputEl.value.trim();
  if (!text) return;

  if ('ai' in self && 'translator' in self.ai) {
    try {
      // Detect → translate
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

  addMessage('Translation requires Chrome 120+ with Gemini Nano. Falling back...', 'obi');
});

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

addMessage('Welcome to OBI Full Panel! 🐭→🐯 Ask anything, translate, or practice writing.', 'obi');
