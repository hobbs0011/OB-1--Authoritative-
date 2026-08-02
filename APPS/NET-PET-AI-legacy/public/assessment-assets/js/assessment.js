const mediaAssets = {
  brainPodcast: 'Giỏi_tiếng_Anh_nhờ_cơ_chế_não.m4a',
  aiPodcast: 'Làm_chủ_tiếng_Anh_AI_cùng_NET.m4a',
  brandFilm: 'NET__Một_Bản_Sắc_Mới.mp4'
};

const storySlides = [
  {
    image: 'assets/dossier/tiger-dossier/slide-01.webp',
    title: 'Lakeview opener',
    summary: 'A polished first impression for parents and professionals who want a real assessment path, not another generic center brochure.'
  },
  {
    image: 'assets/dossier/tiger-dossier/slide-02.webp',
    title: 'The mouse-mode trap',
    summary: 'This frame names the real problem directly: silent students are usually carrying fear, over-translation, and classroom residue.'
  },
  {
    image: 'assets/dossier/tiger-dossier/slide-03.webp',
    title: 'Break the chain',
    summary: 'The story moves from diagnosis to permission, showing why old systems keep learners quiet and why NET takes a different route.'
  },
  {
    image: 'assets/dossier/tiger-dossier/slide-04.webp',
    title: 'Stop translating',
    summary: 'A cleaner explanation of why comprehension and flow matter more than word-for-word decoding when the goal is actual speech.'
  },
  {
    image: 'assets/dossier/tiger-dossier/slide-05.webp',
    title: 'English plus AI',
    summary: 'The deck positions communication and AI literacy together as a practical edge for the next wave of work and opportunity.'
  },
  {
    image: 'assets/dossier/tiger-dossier/slide-06.webp',
    title: 'The one-hour system',
    summary: 'This slide makes the method tangible: habit, input, output, and rhythm instead of homework theater and grammar fatigue.'
  }
];

const phonicsGroups = [
  { name: 'Group 1 / Nhóm 1', sounds: [{ s: 's', ex: 'sun', vi: 'như xờ' }, { s: 'a', ex: 'ant', vi: 'như a' }, { s: 't', ex: 'tap', vi: 'như tờ' }, { s: 'i', ex: 'ink', vi: 'như i' }, { s: 'p', ex: 'pan', vi: 'như pờ' }, { s: 'n', ex: 'net', vi: 'như nờ' }] },
  { name: 'Group 2 / Nhóm 2', sounds: [{ s: 'ck', ex: 'cat', vi: 'như cờ' }, { s: 'e', ex: 'egg', vi: 'như e' }, { s: 'h', ex: 'hat', vi: 'như hờ' }, { s: 'r', ex: 'rat', vi: 'như rờ' }, { s: 'm', ex: 'man', vi: 'như mờ' }, { s: 'd', ex: 'dog', vi: 'như đờ' }] },
  { name: 'Group 3 / Nhóm 3', sounds: [{ s: 'g', ex: 'go', vi: 'như gờ' }, { s: 'o', ex: 'on', vi: 'như o' }, { s: 'u', ex: 'up', vi: 'như ư' }, { s: 'l', ex: 'leg', vi: 'như lờ' }, { s: 'f', ex: 'fun', vi: 'như fờ' }, { s: 'b', ex: 'bus', vi: 'như bờ' }] },
  { name: 'Group 4 / Nhóm 4', sounds: [{ s: 'ai', ex: 'rain', vi: 'như ây' }, { s: 'j', ex: 'jug', vi: 'như jờ' }, { s: 'oa', ex: 'boat', vi: 'như âu' }, { s: 'ie', ex: 'pie', vi: 'như ai' }, { s: 'ee', ex: 'see', vi: 'i dài' }, { s: 'or', ex: 'fork', vi: 'o dài' }] },
  { name: 'Group 5 / Nhóm 5', sounds: [{ s: 'z', ex: 'zip', vi: 'như zờ' }, { s: 'w', ex: 'web', vi: 'như guờ' }, { s: 'ng', ex: 'ring', vi: 'như ngờ' }, { s: 'v', ex: 'van', vi: 'như vờ' }, { s: 'oo', ex: 'book', vi: 'oo ngắn' }, { s: 'oo', ex: 'moon', vi: 'oo dài' }] },
  { name: 'Group 6 / Nhóm 6', sounds: [{ s: 'y', ex: 'yes', vi: 'như dờ' }, { s: 'x', ex: 'box', vi: 'như xờ' }, { s: 'ch', ex: 'chip', vi: 'như chờ' }, { s: 'sh', ex: 'shop', vi: 'như sờ' }, { s: 'th', ex: 'this', vi: 'th hữu thanh' }, { s: 'th', ex: 'thin', vi: 'th vô thanh' }] },
  { name: 'Group 7 / Nhóm 7', sounds: [{ s: 'qu', ex: 'quiz', vi: 'như quờ' }, { s: 'ou', ex: 'out', vi: 'như ao' }, { s: 'oi', ex: 'oil', vi: 'như oi' }, { s: 'ue', ex: 'blue', vi: 'như iu' }, { s: 'er', ex: 'her', vi: 'như ơ' }, { s: 'ar', ex: 'car', vi: 'a dài' }] }
];

const recordings = {};
let activeRecorder = null;
let activeStream = null;
let storyIndex = 0;

function applyMediaAssets() {
  document.querySelectorAll('[data-asset]').forEach((element) => {
    const file = mediaAssets[element.dataset.asset];
    if (!file) return;
    element.src = encodeURI(file);
    if (element.parentElement && typeof element.parentElement.load === 'function') {
      element.parentElement.load();
    }
  });
}

function initStoryDeck() {
  const slideImage = document.getElementById('storySlide');
  const slideTitle = document.getElementById('storyTitle');
  const slideSummary = document.getElementById('storySummary');
  const slideMeta = document.getElementById('storyMeta');
  const thumbRow = document.getElementById('storyThumbs');
  const prev = document.getElementById('storyPrev');
  const next = document.getElementById('storyNext');
  if (!slideImage || !slideTitle || !slideSummary || !slideMeta || !thumbRow || !prev || !next) return;

  thumbRow.innerHTML = '';
  storySlides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'story-thumb';
    button.setAttribute('aria-label', `Open ${slide.title}`);
    button.innerHTML = `<img src="${slide.image}" alt="${slide.title}">`;
    button.addEventListener('click', () => {
      storyIndex = index;
      renderStorySlide();
    });
    thumbRow.appendChild(button);
  });

  prev.addEventListener('click', () => {
    storyIndex = Math.max(0, storyIndex - 1);
    renderStorySlide();
  });

  next.addEventListener('click', () => {
    storyIndex = Math.min(storySlides.length - 1, storyIndex + 1);
    renderStorySlide();
  });

  slideImage.addEventListener('click', () => {
    storyIndex = (storyIndex + 1) % storySlides.length;
    renderStorySlide();
  });

  // Keyboard navigation — arrow keys when the story section is focused
  const storySection = document.getElementById('dossierSlideshow');
  if (storySection) {
    storySection.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        storyIndex = Math.min(storySlides.length - 1, storyIndex + 1);
        renderStorySlide();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        storyIndex = Math.max(0, storyIndex - 1);
        renderStorySlide();
      }
    });
  }

  renderStorySlide();
}

function renderStorySlide() {
  const slideImage = document.getElementById('storySlide');
  const slideTitle = document.getElementById('storyTitle');
  const slideSummary = document.getElementById('storySummary');
  const slideMeta = document.getElementById('storyMeta');
  const prev = document.getElementById('storyPrev');
  const next = document.getElementById('storyNext');
  const thumbButtons = document.querySelectorAll('.story-thumb');
  const slide = storySlides[storyIndex];
  if (!slideImage || !slideTitle || !slideSummary || !slideMeta || !prev || !next || !slide) return;

  slideImage.src = slide.image;
  slideImage.alt = slide.title;
  slideTitle.textContent = slide.title;
  slideSummary.textContent = slide.summary;
  slideMeta.textContent = `Chapter ${String(storyIndex + 1).padStart(2, '0')} / ${String(storySlides.length).padStart(2, '0')}`;
  prev.disabled = storyIndex === 0;
  next.disabled = storyIndex === storySlides.length - 1;
  thumbButtons.forEach((button, index) => {
    button.classList.toggle('active', index === storyIndex);
  });
}

async function requestMic() {
  const prompt = document.getElementById('micPrompt');
  if (!prompt) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    prompt.innerHTML = '<p style="color:var(--danger)">Recording is not supported on this browser.</p>';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    prompt.innerHTML = '<p style="color:var(--green)">Microphone ready. Bạn đã sẵn sàng ghi âm.</p>';
    setTimeout(() => {
      prompt.classList.add('hidden');
    }, 1500);
  } catch (error) {
    prompt.innerHTML = '<p style="color:var(--danger)">Không thể truy cập microphone. Vui lòng cho phép trong cài đặt trình duyệt.<br>Cannot access the microphone. Please allow it in browser settings.</p>';
  }
}

function createRecorder(containerId, recordId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const wrap = document.createElement('div');
  wrap.className = 'recorder-wrap';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'rec-btn';
  button.dataset.state = 'idle';
  button.textContent = 'Record';

  const status = document.createElement('div');
  status.className = 'rec-status';
  status.textContent = 'Tap record when you are ready.';

  const playback = document.createElement('div');
  playback.className = 'rec-playback hidden';

  button.addEventListener('click', async () => {
    if (!window.MediaRecorder) {
      status.textContent = 'MediaRecorder is not supported in this browser.';
      status.style.color = 'var(--danger)';
      return;
    }
    const state = button.dataset.state;
    if (state === 'idle' || state === 'done') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        activeStream = stream;
        const recorder = new MediaRecorder(stream);
        activeRecorder = recorder;
        const chunks = [];

        recorder.ondataavailable = (event) => chunks.push(event.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          recordings[recordId] = blob;
          const audio = document.createElement('audio');
          audio.controls = true;
          audio.src = URL.createObjectURL(blob);
          playback.innerHTML = '';
          playback.appendChild(audio);
          playback.classList.remove('hidden');
          button.className = 'rec-btn done';
          button.textContent = 'Re-record';
          button.dataset.state = 'done';
          status.textContent = 'Recorded successfully. Bạn có thể nghe lại hoặc ghi lại.';
          status.style.color = 'var(--green)';
          stream.getTracks().forEach((track) => track.stop());
          activeRecorder = null;
          activeStream = null;
          updateProgress();
        };

        recorder.start();
        button.className = 'rec-btn recording';
        button.textContent = 'Stop';
        button.dataset.state = 'recording';
        status.textContent = 'Recording... nói rõ và tự nhiên rồi nhấn Stop.';
        status.style.color = 'var(--danger)';
      } catch (error) {
        status.textContent = 'Cannot record. Please allow microphone access in your browser.';
        status.style.color = 'var(--danger)';
      }
    } else if (state === 'recording') {
      if (activeRecorder && activeRecorder.state === 'recording') activeRecorder.stop();
      if (activeStream) activeStream.getTracks().forEach((track) => track.stop());
    }
  });

  wrap.appendChild(button);
  wrap.appendChild(status);
  wrap.appendChild(playback);
  container.appendChild(wrap);
}

function buildPhonics() {
  const container = document.getElementById('phonicsGroups');
  if (!container) return;
  phonicsGroups.forEach((group, index) => {
    const panel = document.createElement('div');
    panel.className = 'phonics-panel';
    let html = `<div class="phonics-title">${group.name}</div><div class="sound-grid">`;
    group.sounds.forEach((sound) => {
      html += `<div class="sound-chip"><div class="sound">${sound.s}</div><div class="example">${sound.ex}</div><div style="font-size:0.8rem;color:var(--muted);margin-top:3px;">${sound.vi}</div></div>`;
    });
    html += `</div><p class="helper vi" style="margin-top:12px;margin-bottom:0;">Nhấn ghi âm và đọc rõ từng âm: ${group.sounds.map((sound) => `&quot;${sound.s}&quot;`).join(', ')}</p><div id="phonicsRec${index}" class="recorder-wrap"></div>`;
    panel.innerHTML = html;
    container.appendChild(panel);
    createRecorder(`phonicsRec${index}`, `phonics_group_${index + 1}`);
  });
}

function buildReadingRecorders() {
  createRecorder('readRec1', 'reading_passage_1');
  createRecorder('readRec2', 'reading_passage_2');
  createRecorder('readRec3', 'reading_passage_3');
  createRecorder('freeRec', 'free_speaking');
}

function updateProgress() {
  const fill = document.getElementById('progressFill');
  const percent = document.getElementById('progressPct');
  const text = document.getElementById('progressText');
  if (!fill || !percent || !text) return;

  const fields = ['fullName', 'age', 'school', 'engHistory', 'whyEnglish', 'family', 'favorites', 'dreamJob', 'engUse', 'write1', 'write2', 'write3', 'write4', 'write5', 'comp1', 'comp2', 'comp3', 'comp4', 'comp5', 'otherHobbies'];
  let filled = 0;
  fields.forEach((id) => {
    const element = document.getElementById(id);
    if (element && element.value && element.value.trim()) filled += 1;
  });

  filled += document.querySelectorAll('input[name="hobby"]:checked').length > 0 ? 1 : 0;
  filled += document.querySelectorAll('input[name="challenge"]:checked').length > 0 ? 1 : 0;

  const totalRecordings = 11;
  const completedRecordings = Object.keys(recordings).length;
  const totalItems = fields.length + 2 + totalRecordings;
  const completedItems = filled + completedRecordings;
  const pct = Math.round((completedItems / totalItems) * 100);

  fill.style.width = `${pct}%`;
  percent.textContent = `${pct}%`;
  const section = pct < 20 ? '1 of 5' : pct < 40 ? '2 of 5' : pct < 60 ? '3 of 5' : pct < 80 ? '4 of 5' : '5 of 5';
  text.textContent = `Assessment progress · Part ${section}`;
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF]/g, '_').slice(0, 30);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4200);
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
}

function fallbackHashHex(input) {
  // Deterministic fallback hash (FNV-1a 32-bit) when subtle crypto is unavailable.
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

async function computeSubmissionHash(payload) {
  const canonical = canonicalize(payload);
  if (window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(canonical);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return fallbackHashHex(canonical);
}

function setSubmissionReference(reference) {
  const panel = document.getElementById('submissionRefPanel');
  const value = document.getElementById('submissionRefValue');
  if (!panel || !value) return;
  value.textContent = reference;
  panel.style.display = 'block';
}

async function downloadResults() {
  const name = document.getElementById('fullName')?.value || 'student';
  const recordingManifest = Object.entries(recordings).map(([key, blob]) => ({
    key,
    sizeBytes: blob.size,
    mimeType: blob.type || 'audio/webm'
  }));
  const data = {
    timestamp: new Date().toISOString(),
    assessment: 'NET Tiger Assessment Guided Review Edition',
    workflow: {
      resultDelivery: 'Human follow-up within 24 hours',
      offer: 'Free in-person class or remote video call',
      packageType: 'Submission pack'
    },
    personal: {
      fullName: name,
      age: document.getElementById('age')?.value || '',
      school: document.getElementById('school')?.value || '',
      engHistory: document.getElementById('engHistory')?.value || '',
      hobbies: [...document.querySelectorAll('input[name="hobby"]:checked')].map((choice) => choice.value),
      otherHobbies: document.getElementById('otherHobbies')?.value || '',
      family: document.getElementById('family')?.value || '',
      challenges: [...document.querySelectorAll('input[name="challenge"]:checked')].map((choice) => choice.value),
      whyEnglish: document.getElementById('whyEnglish')?.value || '',
      favorites: document.getElementById('favorites')?.value || '',
      dreamJob: document.getElementById('dreamJob')?.value || '',
      engUse: document.getElementById('engUse')?.value || ''
    },
    comprehension: {
      q1_dogColor: document.getElementById('comp1')?.value || '',
      q2_lanAge: document.getElementById('comp2')?.value || '',
      q3_catAbility: document.getElementById('comp3')?.value || '',
      q4_bestFriend: document.getElementById('comp4')?.value || '',
      q5_dogLocation: document.getElementById('comp5')?.value || ''
    },
    writing: {
      aboutYourself: document.getElementById('write1')?.value || '',
      family: document.getElementById('write2')?.value || '',
      yesterday: document.getElementById('write3')?.value || '',
      goals: document.getElementById('write4')?.value || '',
      house: document.getElementById('write5')?.value || ''
    },
    audioRecordings: Object.keys(recordings),
    recordingManifest
  };

  const hash = await computeSubmissionHash(data);
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const submissionReference = `NET-${stamp}-${hash.slice(0, 12).toUpperCase()}`;
  data.submissionReference = submissionReference;
  data.integrity = {
    algorithm: window.crypto && window.crypto.subtle ? 'SHA-256' : 'FNV-1A-32',
    digestHex: hash
  };

  setSubmissionReference(submissionReference);

  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const dateStamp = new Date().toISOString().slice(0, 10);
  downloadBlob(jsonBlob, `NET-Submission-Pack-${safeName(name)}-${dateStamp}-${submissionReference}.json`);
  Object.entries(recordings).forEach(([key, blob]) => {
    downloadBlob(blob, `NET-Submission-Pack-${safeName(name)}-${key}-${submissionReference}.webm`);
  });
  showToast(`Submission pack downloaded. Reference: ${submissionReference}`);
}

function wireAssessmentButtons() {
  document.getElementById('requestMicBtn')?.addEventListener('click', requestMic);
  document.getElementById('downloadResultsBtn')?.addEventListener('click', downloadResults);
}

function initAssessmentPage() {
  applyMediaAssets();
  initStoryDeck();
  wireAssessmentButtons();
  buildPhonics();
  buildReadingRecorders();
  updateProgress();
  document.addEventListener('input', updateProgress);
  document.addEventListener('change', updateProgress);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.page === 'assessment') {
    initAssessmentPage();
  }
});
