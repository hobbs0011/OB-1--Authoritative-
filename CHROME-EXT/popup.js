// OBI Chrome Extension — Popup Chat Interface
// Natural English Training

const API_BASE = 'https://net-obi-api.mrmichaelhobbs1234.workers.dev';

const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const levelBadge = document.getElementById('level-badge');

let sessionId = null;
let level = 'mouse';
let messageCount = 0;

// === INIT ===
chrome.storage.local.get(['sessionId', 'level', 'chatHistory', 'messageCount'], (data) => {
  if (data.sessionId) sessionId = data.sessionId;
  if (data.level) level = data.level;
  if (data.messageCount) messageCount = data.messageCount;
  if (data.chatHistory && data.chatHistory.length > 0) {
    // Clear default welcome message
    chatArea.innerHTML = '';
    data.chatHistory.forEach(msg => addMessage(msg.text, msg.sender, false));
  }
  updateLevel(level);
});

// === EVENT LISTENERS ===
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) sendMessage();
});

// Auto-focus input
userInput.focus();

// === SEND MESSAGE ===
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  userInput.focus();
  messageCount++;

  // Show typing indicator
  showTyping();

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId, level })
    });

    hideTyping();

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    sessionId = data.sessionId;

    if (data.level) updateLevel(data.level);

    // Build reply with corrections
    let replyText = data.reply;
    addMessage(replyText, 'obi');

    // Show corrections as separate subtle messages
    if (data.corrections && data.corrections.length > 0) {
      setTimeout(() => {
        data.corrections.forEach(c => {
          addMessage(`<span class="correction">💡 ${c}</span>`, 'obi');
        });
      }, 500);
    }

    // Save state
    chrome.storage.local.set({ sessionId, level, messageCount });
    saveHistory();

  } catch (err) {
    hideTyping();
    addMessage("Hmm, I couldn't connect right now. Check your internet and try again! 🔌", 'obi');
    console.error('OBI chat error:', err);
  }
}

// === UI FUNCTIONS ===
function addMessage(text, sender, save = true) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerHTML = `<p>${escapeHtml(text)}</p>`;

  // If text contains HTML tags (corrections), don't escape
  if (text.includes('<span') || text.includes('<div')) {
    div.innerHTML = `<p>${text}</p>`;
  }

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'message typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function hideTyping() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

function updateLevel(newLevel) {
  level = newLevel;
  const levels = {
    mouse: { icon: '🐭', text: 'Mouse Level', progress: '0%', color: '#94a3b8' },
    cat:   { icon: '🐱', text: 'Cat Level',   progress: '25%', color: '#60a5fa' },
    wolf:  { icon: '🐺', text: 'Wolf Level',  progress: '60%', color: '#a78bfa' },
    tiger: { icon: '🐯', text: 'Tiger Level', progress: '100%', color: '#f59e0b' }
  };
  const l = levels[newLevel] || levels.mouse;
  levelBadge.querySelector('.level-icon').textContent = l.icon;
  levelBadge.querySelector('.level-text').textContent = l.text;
  levelBadge.querySelector('.level-progress').textContent = l.progress;
}

function saveHistory() {
  const messages = [...chatArea.querySelectorAll('.message:not(.typing)')].slice(-30).map(m => ({
    text: m.querySelector('p') ? m.querySelector('p').innerHTML : m.innerHTML,
    sender: m.classList.contains('user') ? 'user' : 'obi'
  }));
  chrome.storage.local.set({ chatHistory: messages });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
