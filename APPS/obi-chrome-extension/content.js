/**
 * OBI Chrome Extension — Content Script
 * Injects inline OBI responses on selected text.
 * Minimal footprint — only activates on user action.
 */

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
    left: ${rect.left}px;
    max-width: 360px;
    padding: 12px 16px;
    background: #1a1a2e;
    color: #e0e0e0;
    border: 1px solid #4444ff;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 20px rgba(68, 68, 255, 0.3);
  `;
  tooltip.innerHTML = `<strong>OBI:</strong> Thinking about "${escapeHtml(selectedText.slice(0, 60))}"...`;
  document.body.appendChild(tooltip);

  // Auto-dismiss after 8 seconds
  setTimeout(() => tooltip.remove(), 8000);

  // Click outside to dismiss
  document.addEventListener('click', function dismiss(e) {
    if (!tooltip.contains(e.target)) {
      tooltip.remove();
      document.removeEventListener('click', dismiss);
    }
  });

  // TODO: Call Gemini Nano Prompt API or backend for actual response
  // and replace tooltip content with the answer
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, m => map[m]);
}
