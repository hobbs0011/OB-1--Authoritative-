// OBI Command Station — VS Code Extension
// Phoenix Rising Protocol: SOV100 → Agent99 → Drone Execution Tunnel
// Polls CommandDO queue, claims commands, executes in VS Code terminal, reports back
// Magic Chat: WebView chat panel → OBI English tutor (Mouse → Tiger)

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
    '💬 OBI Magic Chat',
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
<title>OBI Magic Chat</title>
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
    --bubble-obi: #1e1b4b;
    --bubble-user: #1c1917;
    --success: #10b981;
    --danger: #ef4444;
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
    border-bottom: 1px solid var(--purple-dim);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .obi-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--purple), var(--gold));
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 0 12px rgba(168,85,247,0.4);
  }
  .header-info { flex: 1; }
  .header-name { font-weight: 700; color: var(--gold); font-size: 15px; }
  .header-status { font-size: 11px; color: var(--text-dim); }
  .header-status.online::before { content: '● '; color: var(--success); }
  .student-input {
    background: var(--void);
    border: 1px solid var(--purple-dim);
    color: var(--text);
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    width: 130px;
  }
  .student-input::placeholder { color: var(--text-dim); }
  .student-input:focus { outline: none; border-color: var(--purple); }

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

  .msg { display: flex; gap: 8px; max-width: 85%; animation: fadeIn 0.2s ease; }
  .msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .msg.obi { align-self: flex-start; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .msg-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 13px;
    margin-top: 2px;
  }
  .msg.obi .msg-avatar { background: linear-gradient(135deg, var(--purple), var(--gold)); box-shadow: 0 0 8px rgba(168,85,247,0.3); }
  .msg.user .msg-avatar { background: var(--void3); border: 1px solid var(--text-dim); }

  .msg-bubble {
    padding: 10px 14px;
    border-radius: 16px;
    line-height: 1.5;
    word-break: break-word;
  }
  .msg.obi .msg-bubble {
    background: var(--bubble-obi);
    border: 1px solid rgba(168,85,247,0.25);
    border-bottom-left-radius: 4px;
    color: var(--text);
  }
  .msg.user .msg-bubble {
    background: var(--bubble-user);
    border: 1px solid rgba(245,158,11,0.2);
    border-bottom-right-radius: 4px;
    color: var(--text);
  }
  .msg-time { font-size: 10px; color: var(--text-dim); margin-top: 3px; padding: 0 2px; }
  .msg.user .msg-time { text-align: right; }

  /* Typing indicator */
  .typing { display: none; align-self: flex-start; }
  .typing.active { display: flex; }
  .typing-dots { display: flex; gap: 4px; padding: 12px 16px; background: var(--bubble-obi); border: 1px solid rgba(168,85,247,0.25); border-radius: 16px; border-bottom-left-radius: 4px; }
  .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--purple); animation: bounce 1.2s infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

  /* ── Level badge ── */
  .level-bar {
    background: var(--void2);
    border-top: 1px solid rgba(168,85,247,0.15);
    padding: 6px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--text-dim);
    flex-shrink: 0;
  }
  .level-badge {
    background: linear-gradient(135deg, var(--purple-dim), var(--purple));
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
  .msg-count { margin-left: auto; }

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
  #msg-input {
    width: 100%;
    background: var(--void);
    border: 1px solid var(--purple-dim);
    color: var(--text);
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    min-height: 42px;
    max-height: 120px;
    overflow-y: auto;
    transition: border-color 0.2s;
  }
  #msg-input:focus { outline: none; border-color: var(--purple); }
  #msg-input::placeholder { color: var(--text-dim); }

  .btn {
    width: 42px; height: 42px;
    border-radius: 12px;
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
    gap: 12px;
    padding: 32px 24px;
    text-align: center;
    color: var(--text-dim);
    font-size: 13px;
  }
  .welcome-logo {
    font-size: 52px;
    filter: drop-shadow(0 0 16px rgba(168,85,247,0.5));
    margin-bottom: 8px;
  }
  .welcome-title { font-size: 18px; font-weight: 700; color: var(--gold); }
  .welcome-sub { color: var(--text-dim); max-width: 280px; line-height: 1.6; }
  .welcome-level { color: var(--purple); font-weight: 600; margin-top: 4px; }
</style>
</head>
<body>

<div class="header">
  <div class="obi-avatar">🔥</div>
  <div class="header-info">
    <div class="header-name">OBI</div>
    <div class="header-status online" id="status-text">English Tutor — Mouse → Tiger</div>
  </div>
  <input class="student-input" id="student-id" type="text" placeholder="Student ID (optional)" maxlength="40">
</div>

<div class="messages" id="messages">
  <div class="welcome">
    <div class="welcome-logo">🔥</div>
    <div class="welcome-title">Welcome to Magic Chat</div>
    <div class="welcome-sub">Talk to OBI in English or Vietnamese. He'll help you grow from 🐭 Mouse to 🐯 Tiger — one conversation at a time.</div>
    <div class="welcome-level">Natural English Training</div>
  </div>
</div>

<div class="typing" id="typing">
  <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-right:8px">🔥</div>
  <div class="typing-dots">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
</div>

<div class="level-bar">
  <span class="level-badge" id="level-badge">🐭 MOUSE</span>
  <span id="level-label">Start speaking — OBI adapts to your level</span>
  <span class="msg-count" id="msg-count">0 exchanges</span>
</div>

<div class="input-area">
  <div class="input-wrap">
    <textarea id="msg-input" placeholder="Type in English or Vietnamese... (Enter to send)" rows="1"></textarea>
  </div>
  <button class="btn" id="voice-btn" title="Voice input (microphone)">🎤</button>
  <button class="btn" id="send-btn" title="Send message">↑</button>
</div>

<script>
  const API = 'https://naturalenglishtraining.net';
  const LEVELS = ['🐭 MOUSE', '🐱 CAT', '🐺 WOLF', '🐯 TIGER'];
  let messages = [];
  let exchangeCount = 0;
  let isLoading = false;
  let recognition = null;
  let isRecording = false;

  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('msg-input');
  const sendBtn = document.getElementById('send-btn');
  const voiceBtn = document.getElementById('voice-btn');
  const statusEl = document.getElementById('status-text');
  const typingEl = document.getElementById('typing');
  const levelBadge = document.getElementById('level-badge');
  const levelLabel = document.getElementById('level-label');
  const msgCountEl = document.getElementById('msg-count');
  const studentIdEl = document.getElementById('student-id');

  function getStudentId() {
    return (studentIdEl.value || '').trim() || 'anonymous';
  }

  function updateLevel() {
    const idx = Math.min(Math.floor(exchangeCount / 5), LEVELS.length - 1);
    levelBadge.textContent = LEVELS[idx];
    msgCountEl.textContent = exchangeCount + ' exchange' + (exchangeCount !== 1 ? 's' : '');
  }

  function formatTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function addMessage(role, text) {
    const welcome = messagesEl.querySelector('.welcome');
    if (welcome) welcome.remove();

    const isObi = role === 'obi';
    const wrapper = document.createElement('div');
    wrapper.className = 'msg ' + (isObi ? 'obi' : 'user');

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = isObi ? '🔥' : '🧑';

    const inner = document.createElement('div');
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = formatTime();

    inner.appendChild(bubble);
    inner.appendChild(time);
    wrapper.appendChild(avatar);
    wrapper.appendChild(inner);

    messagesEl.insertBefore(wrapper, typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrapper;
  }

  function setTyping(show) {
    if (show) {
      typingEl.classList.add('active');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    } else {
      typingEl.classList.remove('active');
    }
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    isLoading = true;
    sendBtn.disabled = true;

    addMessage('user', text);
    messages.push({ role: 'user', content: text });
    setTyping(true);

    try {
      const res = await fetch(API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: getStudentId(),
          messages: messages.slice(-20),
        }),
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const reply = data.reply || 'Say that again?';

      setTyping(false);
      addMessage('obi', reply);
      messages.push({ role: 'assistant', content: reply });
      exchangeCount++;
      updateLevel();

      // TTS (optional — speaks OBI's reply)
      if (window.speechSynthesis && reply) {
        const utt = new SpeechSynthesisUtterance(reply);
        utt.rate = 0.9;
        utt.lang = 'en-US';
        window.speechSynthesis.speak(utt);
      }
    } catch (err) {
      setTyping(false);
      addMessage('obi', '⚡ Connection error — check if the worker is running. (' + err.message + ')');
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // ── Voice input ──────────────────────────────────────────────────────────
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

  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function autoResize() {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  }
  inputEl.addEventListener('input', autoResize);

  // ── Init ────────────────────────────────────────────────────────────────
  setupVoice();
  updateLevel();
  inputEl.focus();
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
