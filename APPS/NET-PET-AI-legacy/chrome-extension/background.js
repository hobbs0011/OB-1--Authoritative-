// OBI NET Companion — service worker (minimal)
chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === 'get_tab_url') {
    respond({ url: sender.tab?.url || '' });
  }
});
