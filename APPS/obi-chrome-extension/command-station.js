/**
 * OBI Command Station — Chrome Extension Module
 * Sends commands from Magic Chat → CommandDO → VS Code
 * Tab: 🎮 CMD in the sidepanel
 */

const CMD_API = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev/api/command';

let cmdHistoryEl, cmdInputEl, cmdSendBtn, cmdStatusEl, cmdQueueEl;
let cmdPollInterval = null;

export function initCommandStation() {
  cmdHistoryEl = document.getElementById('cmd-history');
  cmdInputEl = document.getElementById('cmd-input');
  cmdSendBtn = document.getElementById('cmd-send');
  cmdStatusEl = document.getElementById('cmd-status');
  cmdQueueEl = document.getElementById('cmd-queue');

  if (!cmdInputEl || !cmdSendBtn) return;

  cmdSendBtn.addEventListener('click', sendCommand);
  cmdInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCommand();
    }
  });

  // Voice command support
  const cmdMicBtn = document.getElementById('cmd-mic');
  if (cmdMicBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.onresult = (e) => {
      cmdInputEl.value = e.results[0][0].transcript;
      cmdMicBtn.classList.remove('recording');
      sendCommand();
    };
    recognition.onerror = () => cmdMicBtn.classList.remove('recording');
    recognition.onend = () => cmdMicBtn.classList.remove('recording');

    cmdMicBtn.addEventListener('click', () => {
      if (cmdMicBtn.classList.contains('recording')) {
        recognition.stop();
      } else {
        cmdMicBtn.classList.add('recording');
        recognition.start();
      }
    });
  }

  // Start polling for command status updates
  cmdPollInterval = setInterval(refreshQueue, 10000);
  refreshQueue();
}

async function sendCommand() {
  const text = (cmdInputEl.value || '').trim();
  if (!text) return;

  cmdSendBtn.disabled = true;
  cmdStatusEl.textContent = '⏳ Sending to Agent 99...';
  cmdInputEl.value = '';

  try {
    const res = await fetch(`${CMD_API}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: text, source: 'magic-chat' }),
    });
    const data = await res.json();

    if (data.ok) {
      const drone = data.assignedDrone || 'CodeRunner';
      const translation = data.translation || {};

      addCmdMessage('sent', `📤 Command #${data.commandId} queued`);
      addCmdMessage('agent99', `🧠 Agent 99: ${translation.agent99?.interpretation || 'Processing...'}`);
      addCmdMessage('agent98', `⚡ Agent 98: ${translation.agent98?.notes || ''}`);
      addCmdMessage('drone', `🤖 Assigned: ${drone} (Priority ${data.priority})`);

      cmdStatusEl.textContent = `✅ Command #${data.commandId} → ${drone}`;
    } else {
      cmdStatusEl.textContent = `❌ ${data.error}`;
    }
  } catch (err) {
    cmdStatusEl.textContent = '❌ Connection failed';
    addCmdMessage('error', `⚠️ ${err.message}`);
  } finally {
    cmdSendBtn.disabled = false;
  }

  refreshQueue();
}

async function refreshQueue() {
  if (!cmdQueueEl) return;
  try {
    const res = await fetch(`${CMD_API}/history?limit=10`);
    if (!res.ok) return;
    const data = await res.json();

    if (data.commands && data.commands.length > 0) {
      cmdQueueEl.innerHTML = data.commands.map(cmd => {
        const statusIcon = { pending: '⏳', claimed: '🔄', completed: '✅', failed: '❌' }[cmd.status] || '❓';
        const drone = cmd.assigned_drone || 'unassigned';
        const intent = (cmd.raw_intent || '').slice(0, 60);
        return `<div class="cmd-queue-item cmd-${cmd.status}">
          <span class="cmd-icon">${statusIcon}</span>
          <span class="cmd-id">#${cmd.id}</span>
          <span class="cmd-intent">${escapeHtmlCmd(intent)}</span>
          <span class="cmd-drone">${escapeHtmlCmd(drone)}</span>
        </div>`;
      }).join('');
    } else {
      cmdQueueEl.innerHTML = '<p class="cmd-empty">No commands yet. Deploy your will above.</p>';
    }
  } catch (_) {}
}

function addCmdMessage(type, text) {
  if (!cmdHistoryEl) return;
  const div = document.createElement('div');
  div.className = `cmd-msg cmd-msg-${type}`;
  div.textContent = text;
  cmdHistoryEl.appendChild(div);
  cmdHistoryEl.scrollTop = cmdHistoryEl.scrollHeight;
}

function escapeHtmlCmd(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return (str || '').replace(/[&<>"']/g, m => map[m]);
}
