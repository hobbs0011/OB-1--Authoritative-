/**
 * OBI Chrome Extension — Content Script
 * Injects inline OBI responses on selected text.
 * Minimal footprint — only activates on user action.
 */

const BACKEND_URL = 'https://naturalenglishtraining.net/api/chat';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'askObi' && msg.text) {
    showObiTooltip(msg.text);
  }
});

function showObiTooltip(selectedText) {
  // Remove any existing tooltip
  const existing = document.getElementById('obi-tooltip');
  if (existing) existing.remove();

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const tooltip = document.createElement('div');
  tooltip.id = 'obi-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 8}px;
    left: ${Math.min(rect.left, window.innerWidth - 380)}px;
    max-width: 360px;
    padding: 12px 16px;
    background: #0f0f1a;
    color: #e0e0e0;
    border: 1px solid #a855f7;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
    line-height: 1.5;
  `;
  tooltip.innerHTML = `<strong style="color:#a855f7">OBI:</strong> Thinking about "<em>${escapeHtml(selectedText.slice(0, 60))}</em>"...`;
  document.body.appendChild(tooltip);

  let dismissTimer = setTimeout(() => tooltip.remove(), 8000);

  // Click outside to dismiss
  const dismissHandler = (e) => {
    if (!tooltip.contains(e.target)) {
      tooltip.remove();
      document.removeEventListener('click', dismissHandler);
      clearTimeout(dismissTimer);
    }
  };
  document.addEventListener('click', dismissHandler);

  // Call Gemini Nano Prompt API or fall back to backend
  getObiResponse(selectedText).then((answer) => {
    if (!document.getElementById('obi-tooltip')) return; // already dismissed
    tooltip.innerHTML = `<strong style="color:#a855f7">OBI:</strong> ${escapeHtml(answer)}`;
    // Reset auto-dismiss timer after response arrives
    clearTimeout(dismissTimer);
    dismissTimer = setTimeout(() => tooltip.remove(), 8000);
  });
}

async function getObiResponse(text) {
  // Try Gemini Nano Prompt API first ($0 on-device)
  if (typeof self !== 'undefined' && 'ai' in self && 'languageModel' in self.ai) {
    try {
      const session = await self.ai.languageModel.create({
        systemPrompt:
          'You are OBI, a friendly English tutor for Vietnamese students. ' +
          'Give a short, helpful explanation in simple English. Maximum 2 sentences.',
      });
      const reply = await session.prompt(
        `Explain this for an English learner: "${text}"`
      );
      if (reply && reply.trim()) return reply.trim();
    } catch (e) {
      console.warn('[OBI] Gemini Nano unavailable in content script:', e);
    }
  }

  // Fallback to Cloudflare backend
  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Explain briefly for an English learner: "${text}"` }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply || 'I couldn\'t find an explanation right now. Try again!';
  } catch (err) {
    console.warn('[OBI] Backend fallback failed:', err);
    return 'Offline or connection issue — open OBI popup for help!';
  }
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}
