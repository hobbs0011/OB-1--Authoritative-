// OBI Background Service Worker
// Natural English Training — Chrome Extension

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('OBI installed — Welcome to Natural English Training!');
    chrome.storage.local.set({
      level: 'mouse',
      sessionId: null,
      chatHistory: [],
      messageCount: 0,
      installDate: new Date().toISOString()
    });
  }

  if (details.reason === 'update') {
    console.log(`OBI updated to v${chrome.runtime.getManifest().version}`);
  }
});

// Handle messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_SESSION':
      chrome.storage.local.get(['sessionId', 'level', 'messageCount'], (data) => {
        sendResponse(data);
      });
      return true; // async

    case 'RESET_SESSION':
      chrome.storage.local.set({
        sessionId: null,
        chatHistory: [],
        messageCount: 0,
        level: 'mouse'
      }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'GET_STATS':
      chrome.storage.local.get(['messageCount', 'installDate', 'level'], (data) => {
        sendResponse({
          ...data,
          daysActive: data.installDate
            ? Math.floor((Date.now() - new Date(data.installDate).getTime()) / 86400000)
            : 0
        });
      });
      return true;
  }
});
