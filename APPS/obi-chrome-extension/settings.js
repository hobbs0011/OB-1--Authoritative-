/**
 * OBI Chrome Extension — Settings
 * Manages Gemini API key, teacher name, class name, and voice toggle.
 * All values stored in chrome.storage.local.
 */

export function initSettings() {
  const apiKeyInput = document.getElementById('settings-api-key');
  const teacherNameInput = document.getElementById('settings-teacher-name');
  const classNameInput = document.getElementById('settings-class-name');
  const voiceToggle = document.getElementById('settings-voice-toggle');
  const saveBtn = document.getElementById('settings-save-btn');
  const statusEl = document.getElementById('settings-status');

  async function loadSettings() {
    const data = await chrome.storage.local.get([
      'geminiKey',
      'teacherName',
      'className',
      'voiceEnabled',
    ]);
    apiKeyInput.value = data.geminiKey || '';
    teacherNameInput.value = data.teacherName || '';
    classNameInput.value = data.className || '';
    // voiceEnabled defaults to true if not yet set
    voiceToggle.checked = data.voiceEnabled !== false;
  }

  saveBtn.addEventListener('click', async () => {
    const settings = {
      geminiKey: apiKeyInput.value.trim(),
      teacherName: teacherNameInput.value.trim(),
      className: classNameInput.value.trim(),
      voiceEnabled: voiceToggle.checked,
    };

    await chrome.storage.local.set(settings);

    statusEl.textContent = '✅ Saved!';
    statusEl.className = 'settings-status success';
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'settings-status';
    }, 2500);
  });

  loadSettings();
}
