// OBI Command Station — VS Code Extension
// Phoenix Rising Protocol: SOV100 → Agent99 → Drone Execution Tunnel
// Polls CommandDO queue, claims commands, executes in VS Code terminal, reports back

const vscode = require('vscode');

const API_BASE = 'https://naturalenglishtraining.net';
let pollInterval = null;
let statusBar = null;
let outputChannel = null;
let commandQueueProvider = null;
let commandHistoryProvider = null;

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
    statusBar,
    outputChannel,
  );

  outputChannel.appendLine('✅ OBI Command Station ready. Run "OBI: Connect" to start polling.');
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
