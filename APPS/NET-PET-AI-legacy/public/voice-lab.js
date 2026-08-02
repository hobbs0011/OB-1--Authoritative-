const scripts = [
  {
    id: "coach",
    name: "Coach Correction",
    text: "You are close. Do not hide behind safe English. Say it clean: I went to school yesterday, not I goed to school yesterday. One more time. Stronger.",
  },
  {
    id: "classroom",
    name: "Classroom Command",
    text: "Eyes here. Mouth open. We are not memorizing English, we are using it. Repeat after me with force: I can speak clearly, even when I feel nervous.",
  },
  {
    id: "parent",
    name: "Parent Trust",
    text: "Today your child showed stronger speaking confidence, better sentence control, and less hesitation under pressure. The next focus is past tense accuracy in live conversation.",
  },
  {
    id: "pitch",
    name: "Marketing Hook",
    text: "Natural English Training turns shy students into real speakers. Mouse to Tiger. No shame, no dead grammar drills, just practical English with pressure-tested coaching.",
  },
  {
    id: "vn",
    name: "Vietnamese Pronunciation Check",
    text: "Xin chao Mai Tram. Today we practice confidence, pronunciation, and real conversation. Speak slowly first. Then speak like you mean it.",
  },
];

const recommendedShootout = ["aura-stella-en", "aura-asteria-en", "aura-orion-en", "aura-helios-en"];

const scriptList = document.getElementById("scriptList");
const scriptInput = document.getElementById("scriptInput");
const voiceGrid = document.getElementById("voiceGrid");
const logEl = document.getElementById("log");
const statusPill = document.getElementById("statusPill");
const statusText = document.getElementById("statusText");
const savedVoiceEl = document.getElementById("savedVoice");
const shootoutBtn = document.getElementById("shootoutBtn");
const stopBtn = document.getElementById("stopBtn");
const copyCurlBtn = document.getElementById("copyCurlBtn");
const copyPowerShellBtn = document.getElementById("copyPowerShellBtn");

let selectedVoice = localStorage.getItem("obiDeepgramVoiceModel") || "aura-asteria-en";
let currentAudio = null;
let queue = [];
let voices = [];
let activeScriptId = scripts[0].id;

function setLog(message) {
  logEl.textContent = message;
}

function renderScripts() {
  scriptList.innerHTML = "";
  for (const script of scripts) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `script-chip${script.id === activeScriptId ? " active" : ""}`;
    button.innerHTML = `<strong>${script.name}</strong><small>${script.text}</small>`;
    button.addEventListener("click", () => {
      activeScriptId = script.id;
      scriptInput.value = script.text;
      renderScripts();
      setLog(`Loaded script: ${script.name}`);
    });
    scriptList.appendChild(button);
  }
}

function escapeForPowerShell(text) {
  return text.replace(/'/g, "''");
}

function escapeForShell(text) {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function copyCommand(kind) {
  const payload = { text: scriptInput.value.trim(), model: selectedVoice };
  const json = JSON.stringify(payload);
  const command = kind === "curl"
    ? `curl -X POST http://127.0.0.1:8790/api/tts -H \"Content-Type: application/json\" -d \"${escapeForShell(json)}\" --output obi-${selectedVoice}.mp3`
    : `$body = '${escapeForPowerShell(json)}'; Invoke-WebRequest 'http://127.0.0.1:8790/api/tts' -Method POST -ContentType 'application/json' -Body $body -OutFile 'obi-${selectedVoice}.mp3'`;
  await navigator.clipboard.writeText(command);
  setLog(`${kind === "curl" ? "cURL" : "PowerShell"} command copied for ${selectedVoice}.`);
}

function stopPlayback() {
  queue = [];
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function playBlob(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = () => {
    URL.revokeObjectURL(url);
    currentAudio = null;
    playQueue();
  };
  audio.onerror = () => {
    URL.revokeObjectURL(url);
    currentAudio = null;
    playQueue();
  };
  audio.play().catch(() => {
    URL.revokeObjectURL(url);
    currentAudio = null;
    playQueue();
  });
}

function playQueue() {
  if (currentAudio || queue.length === 0) return;
  const next = queue.shift();
  playBlob(next.blob);
  setLog(`Playing ${next.model}…`);
}

async function speakWith(model) {
  const text = scriptInput.value.trim();
  if (!text) {
    setLog("Add a script first.");
    return;
  }
  setLog(`Requesting ${model}…`);
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, model }),
  });
  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const data = await res.json();
      detail = data.error || JSON.stringify(data);
    } catch {}
    throw new Error(detail);
  }
  const blob = await res.blob();
  queue.push({ model, blob });
  playQueue();
}

function saveVoice(model) {
  selectedVoice = model;
  localStorage.setItem("obiDeepgramVoiceModel", model);
  savedVoiceEl.textContent = model;
  renderVoices();
  setLog(`Saved ${model} as Obi's default voice in this browser.`);
}

function renderVoices() {
  voiceGrid.innerHTML = "";
  for (const voice of voices) {
    const card = document.createElement("article");
    card.className = `voice-card${voice.id === selectedVoice ? " selected" : ""}`;
    card.innerHTML = `
      <div class="voice-head">
        <div>
          <h3 class="voice-name">${voice.name}</h3>
          <div class="voice-id">${voice.id}</div>
        </div>
      </div>
      <div class="voice-vibe">${voice.vibe}</div>
      <div class="voice-actions">
        <button type="button" class="primary" data-play="${voice.id}">Play</button>
        <button type="button" data-save="${voice.id}">Use In Obi</button>
      </div>
    `;
    card.querySelector("[data-play]").addEventListener("click", async () => {
      try {
        await speakWith(voice.id);
      } catch (error) {
        setLog(`Failed on ${voice.id}: ${error.message}`);
      }
    });
    card.querySelector("[data-save]").addEventListener("click", () => saveVoice(voice.id));
    voiceGrid.appendChild(card);
  }
}

async function loadStatus() {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    const deepgramOk = data.voice === "LIVE";
    statusPill.classList.toggle("ok", deepgramOk);
    statusText.textContent = deepgramOk
      ? "Deepgram key live. Real Aura playback ready."
      : "Deepgram key missing. Voice catalog works; live playback is blocked until the key is loaded.";
  } catch {
    statusText.textContent = "Health check failed.";
  }
}

async function loadVoices() {
  const res = await fetch("/api/tts/voices");
  const data = await res.json();
  voices = data.voices || [];
  if (!voices.find((voice) => voice.id === selectedVoice) && voices[0]) {
    selectedVoice = voices[0].id;
    localStorage.setItem("obiDeepgramVoiceModel", selectedVoice);
  }
  savedVoiceEl.textContent = selectedVoice;
  renderVoices();
}

async function runShootout() {
  stopPlayback();
  setLog("Running shootout…");
  for (const model of recommendedShootout) {
    try {
      await speakWith(model);
    } catch (error) {
      setLog(`Shootout stopped on ${model}: ${error.message}`);
      return;
    }
  }
  setLog(`Queued shootout for ${recommendedShootout.join(", ")}.`);
}

shootoutBtn.addEventListener("click", runShootout);
stopBtn.addEventListener("click", () => {
  stopPlayback();
  setLog("Playback stopped.");
});
copyCurlBtn.addEventListener("click", () => copyCommand("curl"));
copyPowerShellBtn.addEventListener("click", () => copyCommand("powershell"));

scriptInput.value = scripts[0].text;
renderScripts();
loadStatus();
loadVoices().catch((error) => setLog(`Voice catalog failed to load: ${error.message}`));