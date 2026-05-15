/**
 * OBI Chrome Extension — Background Service Worker
 * Handles side panel, context menus, and Chrome Enterprise policy hooks.
 */

// Open side panel on action click (Chrome 114+)
chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false });

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'openSidePanel') {
    chrome.sidePanel?.open?.({ windowId: sender.tab?.windowId });
    sendResponse({ ok: true });
  }
});

// Context menu: "Ask OBI about this"
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ask-obi',
    title: 'Ask OBI about this',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'ask-obi' && info.selectionText) {
    // Send selected text to content script for inline OBI response
    chrome.tabs.sendMessage(tab.id, {
      action: 'askObi',
      text: info.selectionText,
    });
  }
});

// Heartbeat — keeps the service worker alive for Chrome Enterprise managed installs
setInterval(() => {
  console.log('[OBI] Service worker heartbeat', new Date().toISOString());
}, 25000);
