// OBI Command Station — VS Code Extension
// Phoenix Rising Protocol: SOV100 → Agent99 → Drone Execution Tunnel
// Polls CommandDO queue, claims commands, executes in VS Code terminal, reports back
// Magic Chat: WebView control plane — G09 sovereign command interface → Ledger + Drone routing

const vscode = require('vscode');

const API_BASE = 'https://naturalenglishtraining.net';
let pollInterval = null;
let statusBar = null;
let outputChannel = null;
let commandQueueProvider = null;
let commandHistoryProvider = null;
let magicChatPanel = null;

function activate(context) {
  outputChannel = vscode.window.createOutputChannel('OBI Command Station');
  outputChannel.appendLine('🔥 OBI Command Station activating...');

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.text = '$(zap) OBI: Disconnected';
  statusBar.command = 'obi.connectStation';
  statusBar.show();

  commandQueueProvider = new CommandTreeProvider('pending');
  commandHistoryProvider = new CommandTreeProvider('history');

  vscode.window.registerTreeDataProvider('obi.commandQueue', commandQueueProvider);
  vscode.window.registerTreeDataProvider('obi.commandHistory', commandHistoryProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('obi.connectStation', connectStation),
    vscode.commands.registerCommand('obi.disconnectStation', disconnectStation),
    vscode.commands.registerCommand('obi.sendCommand', sendCommand),
    vscode.commands.registerCommand('obi.openMagicChat', openMagicChat),
    statusBar,
    outputChannel,
  );

  outputChannel.appendLine('✅ OBI Command Station ready. Run "OBI: Connect" to start polling.');
  outputChannel.appendLine('💬 Run "OBI: Magic Chat" to open the chat panel.');
}

// ── Magic Chat WebView ────────────────────────────────────────────────────────
function openMagicChat() {
  if (magicChatPanel) {
    magicChatPanel.reveal(vscode.ViewColumn.Beside);
    return;
  }

  magicChatPanel = vscode.window.createWebviewPanel(
    'obiMagicChat',
    '� Magic Chat — Control Plane',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  magicChatPanel.webview.html = getMagicChatHTML();

  magicChatPanel.onDidDispose(() => {
    magicChatPanel = null;
  });

  magicChatPanel.webview.onDidReceiveMessage(msg => {
    if (msg.type === 'log') {
      outputChannel.appendLine(`[Magic Chat] ${msg.text}`);
    }
  });
}

function getMagicChatHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src https://naturalenglishtraining.net; script-src 'unsafe-inline'; style-src 'unsafe-inline';">
<title>Magic Chat — Control Plane</title>
<style>
  :root {
    --void: #0f0f1a;
    --void2: #1a1a2e;
    --void3: #16213e;
    --purple: #a855f7;
    --purple-dim: #7c3aed;
    --gold: #f59e0b;
    --gold-dim: #d97706;
    --text: #e2e8f0;
    --text-dim: #94a3b8;
    --bubble-sys: #1e1b4b;
    --bubble-sov: #1c1917;
    --success: #10b981;
    --danger: #ef4444;
    --locked: #ef4444;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--void);
    color: var(--text);
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 14px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, var(--void2), var(--void3));
    border-bottom: 2px solid var(--purple-dim);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .cp-avatar {
    width: 40px; height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--purple), var(--gold));
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 0 16px rgba(168,85,247,0.5);
  }
  .header-info { flex: 1; }
  .header-name { font-weight: 700; color: var(--gold); font-size: 15px; letter-spacing: 0.5px; }
  .header-status { font-size: 11px; color: var(--text-dim); }
  .header-status.online::before { content: '● '; color: var(--success); }
  .queue-badge {
    background: rgba(168,85,247,0.15);
    border: 1px solid var(--purple-dim);
    color: var(--purple);
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.2s;
  }
  .queue-badge:hover { background: rgba(168,85,247,0.25); }
  .queue-badge.has-pending { color: var(--gold); border-color: var(--gold-dim); background: rgba(245,158,11,0.1); }

  /* ── Messages ── */
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }
  .messages::-webkit-scrollbar { width: 4px; }
  .messages::-webkit-scrollbar-track { background: var(--void); }
  .messages::-webkit-scrollbar-thumb { background: var(--purple-dim); border-radius: 2px; }

  .msg { display: flex; gap: 8px; max-width: 90%; animation: fadeIn 0.2s ease; }
  .msg.sov { align-self: flex-end; flex-direction: row-reverse; }
  .msg.sys { align-self: flex-start; }
  .msg.event { align-self: center; max-width: 100%; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .msg-avatar {
    width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
    margin-top: 2px;
  }
  .msg.sys .msg-avatar { background: linear-gradient(135deg, var(--purple), var(--gold)); box-shadow: 0 0 8px rgba(168,85,247,0.3); }
  .msg.sov .msg-avatar { background: var(--void3); border: 1px solid var(--gold-dim); }

  .msg-bubble {
    padding: 10px 14px;
    border-radius: 12px;
    line-height: 1.5;
    word-break: break-word;
    font-size: 13px;
  }
  .msg.sys .msg-bubble {
    background: var(--bubble-sys);
    border: 1px solid rgba(168,85,247,0.3);
    border-bottom-left-radius: 4px;
    color: var(--text);
  }
  .msg.sov .msg-bubble {
    background: var(--bubble-sov);
    border: 1px solid rgba(245,158,11,0.25);
    border-bottom-right-radius: 4px;
    color: var(--text);
  }
  .msg.event .msg-bubble {
    background: transparent;
    border: none;
    color: var(--text-dim);
    font-size: 11px;
    text-align: center;
    padding: 2px 8px;
  }
  .msg-time { font-size: 10px; color: var(--text-dim); margin-top: 3px; padding: 0 2px; }
  .msg.sov .msg-time { text-align: right; }

  /* ack card */
  .ack-card {
    margin-top: 6px;
    background: rgba(168,85,247,0.08);
    border: 1px solid rgba(168,85,247,0.2);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 11px;
    color: var(--text-dim);
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .ack-card .drone { color: var(--gold); font-weight: 600; }
  .ack-card .cmd-id { color: var(--purple); font-weight: 600; }

  /* locked flash */
  .locked-flash {
    display: none;
    position: fixed; inset: 0;
    background: rgba(239,68,68,0.12);
    border: 2px solid var(--locked);
    border-radius: 0;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
    animation: flashIn 0.1s ease;
  }
  .locked-flash.show { display: flex; }
  @keyframes flashIn { from { opacity: 0; } to { opacity: 1; } }
  .locked-text { color: var(--locked); font-weight: 700; font-size: 16px; letter-spacing: 1px; text-align: center; }

  /* Typing indicator */
  .typing { display: none; align-self: flex-start; }
  .typing.active { display: flex; }
  .typing-dots { display: flex; gap: 4px; padding: 10px 14px; background: var(--bubble-sys); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; border-bottom-left-radius: 4px; }
  .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--purple); animation: bounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }

  /* ── Status bar ── */
  .status-bar {
    background: var(--void2);
    border-top: 1px solid rgba(168,85,247,0.15);
    padding: 5px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    color: var(--text-dim);
    flex-shrink: 0;
  }
  .tier-badge {
    background: linear-gradient(135deg, var(--purple-dim), var(--purple));
    color: white;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .cmd-count { margin-left: auto; color: var(--text-dim); }

  /* ── Input area ── */
  .input-area {
    background: var(--void2);
    border-top: 1px solid rgba(168,85,247,0.2);
    padding: 12px 16px;
    display: flex;
    gap: 8px;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .input-wrap { flex: 1; position: relative; }
  #cmd-input {
    width: 100%;
    background: var(--void);
    border: 1px solid var(--purple-dim);
    color: var(--text);
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-family: inherit;
    resize: none;
    min-height: 42px;
    max-height: 120px;
    overflow-y: auto;
    transition: border-color 0.2s;
  }
  #cmd-input:focus { outline: none; border-color: var(--purple); }
  #cmd-input::placeholder { color: var(--text-dim); }

  .btn {
    width: 42px; height: 42px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 17px;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.1s, opacity 0.2s;
    flex-shrink: 0;
  }
  .btn:active { transform: scale(0.92); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  #send-btn {
    background: linear-gradient(135deg, var(--gold-dim), var(--gold));
    color: var(--void);
  }
  #send-btn:hover:not(:disabled) { background: linear-gradient(135deg, var(--gold), #fbbf24); }

  #voice-btn {
    background: var(--void3);
    border: 1px solid var(--purple-dim);
    color: var(--text-dim);
  }
  #voice-btn.recording {
    background: rgba(239,68,68,0.15);
    border-color: var(--danger);
    color: var(--danger);
    animation: pulse 1s infinite;
  }
  @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }

  /* ── Welcome screen ── */
  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 28px 24px;
    text-align: center;
    color: var(--text-dim);
    font-size: 13px;
  }
  .welcome-logo {
    font-size: 48px;
    filter: drop-shadow(0 0 20px rgba(168,85,247,0.6));
    margin-bottom: 4px;
  }
  .welcome-title { font-size: 17px; font-weight: 700; color: var(--gold); letter-spacing: 0.5px; }
  .welcome-sub { color: var(--text-dim); max-width: 300px; line-height: 1.6; }
  .welcome-tier { color: var(--purple); font-weight: 600; margin-top: 4px; font-size: 12px; }

  .examples {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 8px;
    width: 100%;
    max-width: 320px;
  }
  .example-cmd {
    background: rgba(168,85,247,0.08);
    border: 1px solid rgba(168,85,247,0.2);
    border-radius: 8px;
    padding: 7px 12px;
    font-size: 12px;
    color: var(--text-dim);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
  }
  .example-cmd:hover { background: rgba(168,85,247,0.18); color: var(--text); }
  .example-cmd .cmd-arrow { color: var(--purple); margin-right: 6px; }
</style>
</head>
<body>

<div id="locked-flash" class="locked-flash">
  <div style="font-size:40px">🔒</div>
  <div class="locked-text">ACCESS DENIED<br>SOVEREIGNTY REQUIRED</div>
</div>

<div class="header">
  <div class="cp-avatar">⚡</div>
  <div class="header-info">
    <div class="header-name">MAGIC CHAT</div>
    <div class="header-status online" id="status-text">G09 Control Plane — SOV100</div>
  </div>
  <div class="queue-badge" id="queue-badge" onclick="loadQueue()">Queue: —</div>
</div>

<div class="messages" id="messages">
  <div class="welcome">
    <div class="welcome-logo">⚡</div>
    <div class="welcome-title">Control Plane Active</div>
    <div class="welcome-sub">Issue sovereign commands in natural language. Intent routes to the Ledger spine and Drone execution network.</div>
    <div class="welcome-tier">G09 · Tier 1 · Phoenix Rising Protocol</div>
    <div class="examples">
      <div class="example-cmd" onclick="fillExample(this)"><span class="cmd-arrow">›</span>deploy the worker to production</div>
      <div class="example-cmd" onclick="fillExample(this)"><span class="cmd-arrow">›</span>run wrangler dry-run on NET-PET-AI</div>
      <div class="example-cmd" onclick="fillExample(this)"><span class="cmd-arrow">›</span>push all pending commits to origin main</div>
      <div class="example-cmd" onclick="fillExample(this)"><span class="cmd-arrow">›</span>check the command queue status</div>
    </div>
  </div>
</div>

<div class="typing" id="typing">
  <div style="width:28px;height:28px;border-radius:6px;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-right:8px">⚡</div>
  <div class="typing-dots">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
</div>

<div class="status-bar">
  <span class="tier-badge">SOV100</span>
  <span id="plane-label">Awaiting sovereign intent</span>
  <span class="cmd-count" id="cmd-count">0 commands</span>
</div>

<div class="input-area">
  <div class="input-wrap">
    <textarea id="cmd-input" placeholder="Speak intent → system executes... (Enter to send)" rows="1"></textarea>
  </div>
  <button class="btn" id="voice-btn" title="Voice input">🎤</button>
  <button class="btn" id="send-btn" title="Issue command">↑</button>
</div>

<script>
  const API = 'https://naturalenglishtraining.net';
  let cmdCount = 0;
  let isLoading = false;
  let recognition = null;
  let isRecording = false;

  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('cmd-input');
  const sendBtn = document.getElementById('send-btn');
  const voiceBtn = document.getElementById('voice-btn');
  const statusEl = document.getElementById('status-text');
  const typingEl = document.getElementById('typing');
  const planeLabel = document.getElementById('plane-label');
  const cmdCountEl = document.getElementById('cmd-count');
  const queueBadge = document.getElementById('queue-badge');
  const lockedFlash = document.getElementById('locked-flash');

  function fillExample(el) {
    const text = el.textContent.replace('›', '').trim();
    inputEl.value = text;
    inputEl.focus();
    autoResize();
  }

  function updateCount() {
    cmdCountEl.textContent = cmdCount + ' command' + (cmdCount !== 1 ? 's' : '');
  }

  function formatTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function triggerLockedFlash() {
    lockedFlash.classList.add('show');
    setTimeout(() => lockedFlash.classList.remove('show'), 1800);
  }

  function addMessage(role, text, ackData) {
    const welcome = messagesEl.querySelector('.welcome');
    if (welcome) welcome.remove();

    const isSov = role === 'sov';
    const isEvent = role === 'event';
    const wrapper = document.createElement('div');
    wrapper.className = 'msg ' + (isSov ? 'sov' : isEvent ? 'event' : 'sys');

    if (!isEvent) {
      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar';
      avatar.textContent = isSov ? '👤' : '⚡';

      const inner = document.createElement('div');
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = text;

      if (ackData) {
        const card = document.createElement('div');
        card.className = 'ack-card';
        card.innerHTML =
          '<span>Command routed</span>' +
          '<span class="cmd-id">ID: #' + ackData.commandId + '</span>' +
          '<span class="drone">Drone: ' + (ackData.assignedDrone || 'Agent99') + '</span>';
        bubble.appendChild(card);
      }

      const time = document.createElement('div');
      time.className = 'msg-time';
      time.textContent = formatTime();

      inner.appendChild(bubble);
      inner.appendChild(time);
      wrapper.appendChild(avatar);
      wrapper.appendChild(inner);
    } else {
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = text;
      wrapper.appendChild(bubble);
    }

    messagesEl.insertBefore(wrapper, typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setTyping(show) {
    if (show) {
      typingEl.classList.add('active');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    } else {
      typingEl.classList.remove('active');
    }
  }

  async function loadQueue() {
    try {
      const res = await fetch(API + '/api/command/queue?status=pending&limit=10');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const cmds = data.commands || [];
      const count = cmds.length;

      queueBadge.textContent = 'Queue: ' + count + ' pending';
      queueBadge.className = 'queue-badge' + (count > 0 ? ' has-pending' : '');

      if (count === 0) {
        addMessage('event', '— Queue empty —');
      } else {
        addMessage('sys', 'Active queue: ' + count + ' pending command' + (count !== 1 ? 's' : '') + '.\\n' +
          cmds.map((c, i) => (i + 1) + '. [#' + c.id + '] ' + c.raw_intent).join('\\n'));
      }
    } catch (err) {
      addMessage('sys', '⚠ Queue fetch failed: ' + err.message);
    }
  }

  async function sendCommand() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    // Fail-closed: empty intent → sovereignty required
    if (text.length < 3) {
      triggerLockedFlash();
      return;
    }

    inputEl.value = '';
    inputEl.style.height = 'auto';
    isLoading = true;
    sendBtn.disabled = true;

    addMessage('sov', text);
    setTyping(true);
    planeLabel.textContent = 'Routing intent...';
    statusEl.textContent = 'G09 Control Plane — Routing';

    try {
      const res = await fetch(API + '/api/command/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text, source: 'vscode-magic-chat' }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'HTTP ' + res.status);
      }
      const data = await res.json();

      setTyping(false);

      if (data.ok) {
        addMessage('sys', 'Command acknowledged. Routing to execution network.', data);
        cmdCount++;
        updateCount();
        planeLabel.textContent = 'Last: #' + data.commandId + ' → ' + (data.assignedDrone || 'Agent99');
        statusEl.textContent = 'G09 Control Plane — SOV100';

        // Refresh queue badge
        try {
          const qRes = await fetch(API + '/api/command/queue?status=pending&limit=1');
          if (qRes.ok) {
            const qData = await qRes.json();
            const qCount = (qData.commands || []).length;
            queueBadge.textContent = 'Queue: ' + qCount + ' pending';
            queueBadge.className = 'queue-badge' + (qCount > 0 ? ' has-pending' : '');
          }
        } catch (_) {}
      } else {
        addMessage('sys', '⚠ Routing rejected: ' + (data.error || 'unknown'));
        planeLabel.textContent = 'Routing failed';
      }
    } catch (err) {
      setTyping(false);
      addMessage('sys', '⚡ Control plane error — ' + err.message);
      planeLabel.textContent = 'Error: ' + err.message.slice(0, 40);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
      statusEl.textContent = 'G09 Control Plane — SOV100';
    }
  }

  // ── Voice input ──────────────────────────────────────────────────────
  function setupVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.title = 'Voice not supported in this environment';
      voiceBtn.style.opacity = '0.3';
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      inputEl.value = transcript;
      autoResize();
    };
    recognition.onend = () => {
      isRecording = false;
      voiceBtn.classList.remove('recording');
      voiceBtn.textContent = '🎤';
    };
    recognition.onerror = () => {
      isRecording = false;
      voiceBtn.classList.remove('recording');
      voiceBtn.textContent = '🎤';
    };
  }

  voiceBtn.addEventListener('click', () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      isRecording = true;
      voiceBtn.classList.add('recording');
      voiceBtn.textContent = '⏹';
      recognition.start();
    }
  });

  sendBtn.addEventListener('click', sendCommand);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCommand();
    }
  });

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }
  inputEl.addEventListener('input', autoResize);

  // ── Init ────────────────────────────────────────────────────────────
  setupVoice();
  updateCount();
  inputEl.focus();

  // Initial queue load
  loadQueue();
</script>
</body>
</html>`;
}



async function connectStation() {
  if (pollInterval) {
    vscode.window.showInformationMessage('OBI Command Station already connected.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    const data = await res.json();
    outputChannel.appendLine(`✅ Connected to ${data.app} v${data.version}`);
  } catch (err) {
    vscode.window.showErrorMessage(`Cannot reach Command Station: ${err.message}`);
    return;
  }

  statusBar.text = '$(zap) OBI: Connected';
  statusBar.tooltip = 'Polling for commands...';
  vscode.window.showInformationMessage('🔥 OBI Command Station connected. Polling for commands...');

  pollInterval = setInterval(pollCommands, 5000);
  pollCommands();
}

function disconnectStation() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  statusBar.text = '$(zap) OBI: Disconnected';
  statusBar.tooltip = 'Click to connect';
  vscode.window.showInformationMessage('OBI Command Station disconnected.');
  outputChannel.appendLine('🔌 Disconnected from Command Station.');
}

async function pollCommands() {
  try {
    const res = await fetch(`${API_BASE}/api/command/queue?status=pending&limit=10`);
    if (!res.ok) return;
    const data = await res.json();

    commandQueueProvider.refresh(data.commands || []);

    if (data.commands && data.commands.length > 0) {
      statusBar.text = `$(zap) OBI: ${data.commands.length} pending`;

      for (const cmd of data.commands) {
        await executeCommand(cmd);
      }
    } else {
      statusBar.text = '$(zap) OBI: Connected';
    }

    // Refresh history
    const histRes = await fetch(`${API_BASE}/api/command/history?limit=20`);
    if (histRes.ok) {
      const histData = await histRes.json();
      commandHistoryProvider.refresh(histData.commands || []);
    }
  } catch (err) {
    outputChannel.appendLine(`⚠️ Poll error: ${err.message}`);
  }
}

async function executeCommand(cmd) {
  const translation = cmd.translation || {};
  const drone = translation.primaryDrone?.name || 'CodeRunner';

  outputChannel.appendLine(`\n🎯 Command #${cmd.id} — Drone: ${drone}`);
  outputChannel.appendLine(`   Intent: ${cmd.raw_intent}`);
  if (translation.agent99) outputChannel.appendLine(`   Agent 99: ${translation.agent99.interpretation}`);
  if (translation.agent98) outputChannel.appendLine(`   Agent 98: ${translation.agent98.notes}`);

  // Claim the command
  try {
    const claimRes = await fetch(`${API_BASE}/api/command/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commandId: cmd.id, claimedBy: 'vscode-extension' }),
    });
    if (!claimRes.ok) {
      const err = await claimRes.json();
      outputChannel.appendLine(`   ⚠️ Claim failed: ${err.error}`);
      return;
    }
  } catch (err) {
    outputChannel.appendLine(`   ⚠️ Claim error: ${err.message}`);
    return;
  }

  // Execute in terminal
  try {
    const terminal = vscode.window.createTerminal(`OBI Drone: ${drone}`);
    terminal.show();
    terminal.sendText(`# 🔥 OBI Command Station — Drone: ${drone}`);
    terminal.sendText(`# Intent: ${cmd.raw_intent}`);
    terminal.sendText(cmd.raw_intent);

    // Report completion after delay (terminal execution is async)
    setTimeout(async () => {
      try {
        await fetch(`${API_BASE}/api/command/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commandId: cmd.id,
            result: `Executed in VS Code terminal by ${drone}`,
            success: true,
          }),
        });
        outputChannel.appendLine(`   ✅ Command #${cmd.id} completed.`);
      } catch (err) {
        outputChannel.appendLine(`   ⚠️ Complete report failed: ${err.message}`);
      }
    }, 3000);
  } catch (err) {
    outputChannel.appendLine(`   ❌ Execution failed: ${err.message}`);
    try {
      await fetch(`${API_BASE}/api/command/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId: cmd.id, result: err.message, success: false }),
      });
    } catch (_) {}
  }
}

async function sendCommand() {
  const input = await vscode.window.showInputBox({
    prompt: 'Enter command for OBI (SOV100 → Agent99 → Drones)',
    placeHolder: 'deploy the worker, run tests, push to main...',
  });
  if (!input) return;

  try {
    const res = await fetch(`${API_BASE}/api/command/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: input, source: 'vscode' }),
    });
    const data = await res.json();
    if (data.ok) {
      outputChannel.appendLine(`📤 Sent command #${data.commandId}: ${input}`);
      vscode.window.showInformationMessage(`Command #${data.commandId} queued → ${data.assignedDrone}`);
    } else {
      vscode.window.showErrorMessage(`Command failed: ${data.error}`);
    }
  } catch (err) {
    vscode.window.showErrorMessage(`Send failed: ${err.message}`);
  }
}

class CommandTreeProvider {
  constructor(type) {
    this.type = type;
    this.commands = [];
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }

  refresh(commands) {
    this.commands = commands;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(cmd) {
    const statusIcon = { pending: '⏳', claimed: '🔄', completed: '✅', failed: '❌' };
    const icon = statusIcon[cmd.status] || '❓';
    const label = `${icon} #${cmd.id}: ${(cmd.raw_intent || '').slice(0, 50)}`;
    const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
    item.tooltip = `Drone: ${cmd.assigned_drone || 'unassigned'}\nPriority: ${cmd.priority}\nStatus: ${cmd.status}`;
    item.description = cmd.assigned_drone || '';
    return item;
  }

  getChildren() {
    return this.commands;
  }
}

function deactivate() {
  if (pollInterval) clearInterval(pollInterval);
}

module.exports = { activate, deactivate };
