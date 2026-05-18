// OBI NET Companion — YouTube content script
// Fires when student watches YouTube, POSTs video title to /api/session-hint

const API = 'https://net-pet-ai.mrmichaelhobbs123.workers.dev';

function getVideoTitle() {
  return document.title.replace(/ - YouTube$/, '').trim();
}

let lastPosted = '';
let debounceTimer = null;

function maybePostHint() {
  chrome.storage.local.get(['studentId'], ({ studentId }) => {
    if (!studentId) return;
    const title = getVideoTitle();
    if (!title || title === lastPosted) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      lastPosted = title;
      const payload = {
        studentId,
        videoTitle: title,
        videoUrl: window.location.href
      };
      fetch(`${API}/api/session-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => {
        chrome.storage.local.set({ lastHint: { videoTitle: title, videoUrl: window.location.href, timestamp: Date.now() } });
      }).catch(() => {});
    }, 3000);
  });
}

// Fire on initial load
maybePostHint();

// YouTube is a SPA — watch for title changes (video navigation)
const titleObserver = new MutationObserver(() => maybePostHint());
titleObserver.observe(document.querySelector('title') || document.head, {
  childList: true,
  subtree: true,
  characterData: true
});
