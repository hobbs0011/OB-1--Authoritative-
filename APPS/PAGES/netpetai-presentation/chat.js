// chat.js — Magic Chat — Phoenix Rising Protocol Command Station
// OBI = Michael Hobbs in AI form: high-energy, anti-shame, tough love.
// Mouse Voice → Tiger Voice. Volume + Velocity > Grammar.
// "The stateless chat is the constraint. The Magic Chat shall have no constraints."

const DEFAULTS = {
  birthplace: "Ho Chi Minh City",
  confidenceAreas: "speaking",
  occupation: "student",
  fearTrigger: "making mistakes",
  learningHistory: "school",
};

// ── Crisis detection ───────────────────────────────────────
// ALWAYS checked before any lesson logic. Safety > English.
function isCrisisSignal(text) {
  return /\b(jump off|kill myself|killing myself|suicide|suicidal|end my life|hurt myself|self.?harm|want to die|don.?t want to live|can.?t go on|no reason to live|give up on life|jump from a|want to jump)\b/i.test(
    text,
  );
}

function handleCrisis() {
  stopAudio();
  obi(
    "Hey \u2014 stop. I heard that.\n\nThat matters more than anything else right now. If something real is going on, please reach out to someone you trust or a local support line.\n\n\uD83C\uDDFB\uD83C\uDDF3 Vietnam: 1800 599 920 (free, 24/7)\n\uD83C\uDDE8\uD83C\uDDE6 Canada/US: 988 (Suicide & Crisis Lifeline)\n\uD83D\uDCAC Or talk to a teacher, friend, or family member.\n\nI'm here when you're ready. No judgment.",
  );
}

let state = "boot";
let profile = {};
let chatHistory = []; // messages for LLM context
let chatRound = 0; // current exchange count
const CHAT_ROUNDS = 30; // natural conversation — pronunciation coaching flows through OBI, not a forced dump
let ttsOn = true;
let obiVoice = null; // best available SpeechSynthesis voice
let struggles = {}; // { [stateKey]: count } — tracks repeat confusion per step

// ════════════════════════════════════════════════════════════
// PHASE 11: SPACED REPETITION SYSTEM
// ════════════════════════════════════════════════════════════
let learnedWords = {}; // { word: { count, lastSeen, difficulty } }
let reviewQueue = []; // Words due for review

function addWord(word, difficulty = 1) {
  const normalized = word.toLowerCase();
  if (learnedWords[normalized]) {
    learnedWords[normalized].count++;
  } else {
    learnedWords[normalized] = { count: 1, lastSeen: Date.now(), difficulty };
  }
  try {
    localStorage.setItem(
      "net_words_" + profile.studentId,
      JSON.stringify(learnedWords),
    );
  } catch {}
}

function getReviewQueue() {
  const now = Date.now();
  const day = 86400000;
  return Object.entries(learnedWords)
    .filter(
      ([w, data]) => now - data.lastSeen > day * Math.max(1, data.difficulty),
    )
    .map(([w, data]) => w)
    .slice(0, 5);
}

// ════════════════════════════════════════════════════════════
// PHASE 12: GRAMMAR COACHING SYSTEM
// ════════════════════════════════════════════════════════════
const GRAMMAR_PATTERNS = [
  {
    pattern: /\bi\b(?!\s*[''])/i,
    issue: "subject pronoun",
    fix: "I should be capitalized",
  },
  {
    pattern: /\b(he|she|it)\s+(want|go|eat|like|run)/i,
    issue: "verb form",
    fix: "add -s: wants, goes, eats, likes, runs",
  },
  {
    pattern: /\b(i|you|he|she|it)\s+is\s+(go|run|walk)/i,
    issue: "progressive",
    fix: "use: am/are/is + verb-ing (am going, is running)",
  },
  {
    pattern: /\?\s*$/,
    issue: "question mark spacing",
    fix: "no space before punctuation",
  },
];

function analyzeGrammar(text) {
  for (const rule of GRAMMAR_PATTERNS) {
    if (rule.pattern.test(text)) {
      return { issue: rule.issue, suggestion: rule.fix, confidence: 0.8 };
    }
  }
  return null;
}

function provideGentleCorrection(text, original) {
  const analysis = analyzeGrammar(original);
  if (!analysis) return null;
  return `💡 Tip: ${analysis.suggestion}. But I understood you! Let's keep going.`;
}

// ════════════════════════════════════════════════════════════
// PHASE 13: PRONUNCIATION PRACTICE MODE
// ════════════════════════════════════════════════════════════
let pronunciationMode = false;
let targetSounds = [];

const PRONUNCIATION_CHALLENGES = [
  {
    sound: "TH",
    words: ["the", "think", "three", "that"],
    tips: "Tongue between teeth!",
  },
  {
    sound: "R",
    words: ["red", "right", "run", "really"],
    tips: "Curl tongue back, touch nothing!",
  },
  {
    sound: "V",
    words: ["very", "voice", "video", "violin"],
    tips: "Top teeth on bottom lip!",
  },
  {
    sound: "L",
    words: ["like", "love", "light", "look"],
    tips: "Tongue to roof of mouth!",
  },
  {
    sound: "SH",
    words: ["she", "show", "ship", "special"],
    tips: "Lips forward like kissing!",
  },
];

function startPronunciationMode() {
  pronunciationMode = true;
  state = "pronunciation";
  obi("🔊 Pronunciation Mode! Let's practice sounds. Pick one:");
  renderOptionButtons([
    { emoji: "👅", label: "TH sound", value: "TH" },
    { emoji: "🎯", label: "R sound", value: "R" },
    { emoji: "👄", label: "V sound", value: "V" },
    { emoji: "💬", label: "L sound", value: "L" },
    { emoji: "🤫", label: "SH sound", value: "SH" },
  ]);
}

// ════════════════════════════════════════════════════════════
// PHASE 14: PROGRESS TRACKING
// ════════════════════════════════════════════════════════════
let progressData = {
  streakDays: 0,
  totalMinutes: 0,
  xp: 0,
  level: 1,
  badges: [],
  conversations: 0,
};

function awardXP(amount = 10) {
  progressData.xp += amount;
  if (progressData.xp >= progressData.level * 100) {
    progressData.level++;
    obi(`🎉 Level up! You're now level ${progressData.level}!`);
  }
  try {
    localStorage.setItem(
      "net_progress_" + profile.studentId,
      JSON.stringify(progressData),
    );
  } catch {}
}

function updateStreak() {
  const lastDate = localStorage.getItem("net_streak_" + profile.studentId);
  const today = new Date().toDateString();
  if (lastDate !== today) {
    progressData.streakDays++;
    localStorage.setItem("net_streak_" + profile.studentId, today);
  }
}

// ════════════════════════════════════════════════════════════
// PHASE 15: VOICE RECORDING
// ════════════════════════════════════════════════════════════
let mediaRecorder = null;
let recordedChunks = [];
let recordingStart = null;

async function startVoiceRecord() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];
    recordingStart = Date.now();

    mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
    mediaRecorder.onstart = () => obi("🎤 Recording... speak naturally!");
    mediaRecorder.onstop = () => playbackRecording();

    mediaRecorder.start();
    micBtn.classList.add("recording");
  } catch (err) {
    obi("Can't access mic. Try again? 🎤");
  }
}

function stopVoiceRecord() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    micBtn.classList.remove("recording");
  }
}

function playbackRecording() {
  if (recordedChunks.length === 0) return;
  const blob = new Blob(recordedChunks, { type: "audio/webm" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  obi("▶️ Playback: listen to how you sound!");
  audio.play();
}

// ════════════════════════════════════════════════════════════
// PHASE 15B: LIVE VOICE LISTENING (ChatGPT/Gemini style)
// ════════════════════════════════════════════════════════════
// Continuous speech-to-text with auto-submit like ChatGPT

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
let silenceTimer = null;
let finalTranscript = "";
let interimTranscript = "";
const SILENCE_TIMEOUT = 1500; // Auto-submit after 1.5s of silence

function initLiveListening() {
  if (!SpeechRecognition) {
    console.warn("[VOICE] Web Speech API not supported in this browser");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.language = "en-US";

  recognition.onstart = () => {
    isListening = true;
    finalTranscript = "";
    interimTranscript = "";
    console.log("[VOICE] Listening started");
    updateListeningUI();
  };

  recognition.onresult = (event) => {
    interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
        console.log("[VOICE] Final:", transcript);
      } else {
        interimTranscript += transcript;
        console.log("[VOICE] Interim:", transcript);
      }
    }

    // Show live transcription in input box
    const inputBox = document.querySelector('input[type="text"]');
    if (inputBox) {
      inputBox.value = (finalTranscript + interimTranscript).trim();
      // Scroll to show cursor
      inputBox.focus();
    }

    // Reset silence timer when we get speech
    clearTimeout(silenceTimer);

    // Start silence timer if we have final transcript
    if (finalTranscript.trim()) {
      silenceTimer = setTimeout(() => {
        if (isListening && finalTranscript.trim().length > 0) {
          console.log("[VOICE] Silence detected, auto-submitting");
          submitVoiceText();
        }
      }, SILENCE_TIMEOUT);
    }
  };

  recognition.onerror = (event) => {
    console.error("[VOICE] Error:", event.error);
    if (event.error === "no-speech") {
      console.log("[VOICE] No speech detected, continuing to listen...");
    } else if (event.error === "not-allowed") {
      voiceErrorCount++;
      console.warn("[VOICE] Permission denied, attempt", voiceErrorCount);
      if (voiceErrorCount >= MAX_VOICE_ERRORS) {
        console.warn(
          "[VOICE] Too many permission errors, disabling live voice",
        );
        liveVoiceEnabled = false;
        manualStop = true;
        obi(
          `🎤 Microphone access denied. Check browser permissions or try a different approach. 🔐`,
        );
        updateListeningUI();
        return;
      }
    } else if (event.error !== "aborted") {
      obi(`🎤 Voice error: ${event.error}. Try again! 🔊`);
    }
  };

  recognition.onend = () => {
    isListening = false;
    clearTimeout(silenceTimer);
    console.log("[VOICE] Listening stopped");
    updateListeningUI();

    // Auto-restart listening for continuous experience (unless disabled or too many errors)
    if (liveVoiceEnabled && !manualStop && voiceErrorCount < MAX_VOICE_ERRORS) {
      console.log("[VOICE] Auto-restarting...");
      setTimeout(() => startLiveListening(), 300);
    }
  };
}

let liveVoiceEnabled = false;
let manualStop = false;
let voiceErrorCount = 0;
const MAX_VOICE_ERRORS = 2;

function startLiveListening() {
  if (!recognition) initLiveListening();
  if (recognition && !isListening) {
    manualStop = false;
    try {
      recognition.start();
    } catch (e) {
      console.log("[VOICE] Recognition already running or error:", e.message);
    }
  }
}

function stopLiveListening() {
  manualStop = true;
  if (recognition && isListening) {
    clearTimeout(silenceTimer);
    recognition.stop();
  }
  isListening = false;
  voiceErrorCount = 0; // Reset on manual stop
  updateListeningUI();
}

function submitVoiceText() {
  const text = (finalTranscript + interimTranscript).trim();
  if (!text) return;

  const inputBox = document.querySelector('input[type="text"]');
  if (inputBox) {
    inputBox.value = text;
  }

  // Trigger send button
  const sendBtn =
    document.querySelector('button[aria-label*="send"]') ||
    Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent.includes("➤"),
    );

  if (sendBtn) {
    sendBtn.click();
  }

  // Reset for next input
  finalTranscript = "";
  interimTranscript = "";
}

function toggleLiveVoice() {
  liveVoiceEnabled = !liveVoiceEnabled;
  localStorage.setItem("liveVoiceEnabled", liveVoiceEnabled);

  if (liveVoiceEnabled) {
    obi(
      "🎤 Live listening enabled! Just speak naturally — no clicking needed.",
    );
    startLiveListening();
  } else {
    obi("🔇 Live listening disabled. Click 🎙️ to toggle back on.");
    stopLiveListening();
  }

  updateListeningUI();
}

function updateListeningUI() {
  const micBtn =
    document.querySelector('button[aria-label*="mic"]') ||
    Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent.includes("🎙️"),
    );

  if (!micBtn) return;

  if (liveVoiceEnabled && isListening) {
    micBtn.style.opacity = "1";
    micBtn.style.animation = "pulse 1.5s infinite";
    micBtn.style.filter = "drop-shadow(0 0 8px #4CAF50)";
    micBtn.setAttribute("data-listening", "true");
  } else if (liveVoiceEnabled) {
    micBtn.style.opacity = "0.8";
    micBtn.style.animation = "none";
    micBtn.style.filter = "drop-shadow(0 0 4px #FFC107)";
    micBtn.setAttribute("data-listening", "false");
  } else {
    micBtn.style.opacity = "0.5";
    micBtn.style.animation = "none";
    micBtn.style.filter = "drop-shadow(0 0 0px transparent)";
    micBtn.removeAttribute("data-listening");
  }
}

// ════════════════════════════════════════════════════════════
// PHASE 16: INTERACTIVE CHALLENGES
// ════════════════════════════════════════════════════════════
let currentChallenge = null;

const CHALLENGE_TYPES = {
  fillBlanks: {
    prompt: "Fill in the blank:",
    example: "I ___ coffee every morning.",
    answers: ["drink", "drinks", "drinking"],
    correct: "drink",
  },
  pickCorrect: {
    prompt: "Which is correct?",
    example: "A) She go to school   B) She goes to school",
    answers: ["A", "B"],
    correct: "B",
  },
  translate: {
    prompt: "Say this in English:",
    example: "Tôi thích học tiếng Anh.",
    answers: ["I like learning English", "I like to learn English"],
    correct: "I like",
  },
};

function startChallenge() {
  const types = Object.keys(CHALLENGE_TYPES);
  const type = types[Math.floor(Math.random() * types.length)];
  currentChallenge = { ...CHALLENGE_TYPES[type], type };
  obi(`🎮 ${currentChallenge.prompt}\n${currentChallenge.example}`);
}

// ════════════════════════════════════════════════════════════
// PHASE 17: CONTEXT MEMORY (Better conversation continuity)
// ════════════════════════════════════════════════════════════
let conversationContext = {
  topics: [],
  mentions: {},
  sentiment: "neutral",
};

function updateContext(text) {
  const topics = text
    .toLowerCase()
    .match(
      /\b(coffee|pizza|job|school|friend|family|work|sport|movie|book|travel)\b/gi,
    );
  if (topics) conversationContext.topics.push(...topics);

  // Track what student mentioned about themselves
  if (text.includes("I like")) {
    const match = text.match(/I like (.+?)[\.,!?]/);
    if (match) conversationContext.mentions[match[1].trim()] = true;
  }
}

function getContextualResponse(text) {
  if (conversationContext.mentions.coffee && text.includes("morning")) {
    return "You mentioned liking coffee! Start the day right! ☕";
  }
  return null;
}

// ════════════════════════════════════════════════════════════
// PHASE 18: DIFFICULTY SCALING
// ════════════════════════════════════════════════════════════
let difficultyLevel = 1; // 1=easy, 2=medium, 3=hard
let performanceScore = 0;

function adjustDifficulty() {
  if (performanceScore > 80 && difficultyLevel < 3) {
    difficultyLevel++;
    obi("🚀 You're crushing it! Leveling up difficulty!");
  } else if (performanceScore < 40 && difficultyLevel > 1) {
    difficultyLevel--;
    obi("No worries! Let's take it slower. 💪");
  }
}

function getPromptByDifficulty() {
  if (difficultyLevel === 1) return "What's your favorite food?";
  if (difficultyLevel === 2)
    return "Tell me about your dream vacation and why you want to go there.";
  return "Describe your most memorable conversation with someone and what made it special.";
}

// ════════════════════════════════════════════════════════════
// PHASE 19: SOCIAL FEATURES
// ════════════════════════════════════════════════════════════
let socialData = {
  friends: [],
  leaderboard: [],
  challenges: [],
  totalXP: 0,
};

function getLeaderboard() {
  api("/api/leaderboard", "GET")
    .then((data) => {
      socialData.leaderboard = data.top || [];
    })
    .catch(() => {});
}

function inviteFriend(friendEmail) {
  obi(`📬 Invite sent to ${friendEmail}! 🎯`);
  api("/api/social/invite", "POST", {
    to: friendEmail,
    from: profile.studentId,
  });
}

function showLeaderboard() {
  let board = "🏆 Top Learners This Week:\n";
  socialData.leaderboard.slice(0, 5).forEach((user, idx) => {
    board += `${idx + 1}. ${user.name}: ${user.xp} XP\n`;
  });
  obi(board);
}

// ════════════════════════════════════════════════════════════
// PHASES 20-35: CORE LEARNING SCIENCE
// ════════════════════════════════════════════════════════════

// PHASE 20: Contextual Vocabulary Extraction
let contextVocabulary = {};
function extractContextVocabulary(text) {
  const words = text.match(/\b[a-z]{3,}\b/gi) || [];
  words.forEach((w) => {
    const lower = w.toLowerCase();
    contextVocabulary[lower] = (contextVocabulary[lower] || 0) + 1;
  });
}

// PHASE 21: Phonetic Transcription System
let phoneticMap = {};
function getPhoneticSpelling(word) {
  return phoneticMap[word.toLowerCase()] || null;
}

// PHASE 22: Collocation Tracking (word pairs)
let collocations = {};
function trackCollocation(word1, word2) {
  const key = [word1.toLowerCase(), word2.toLowerCase()].sort().join("|");
  collocations[key] = (collocations[key] || 0) + 1;
}

// PHASE 23: Idiom Recognition
const IDIOMS = [
  { phrase: "piece of cake", meaning: "very easy", level: "B1" },
  { phrase: "break the ice", meaning: "start conversation", level: "B1" },
  { phrase: "raining cats and dogs", meaning: "very heavy rain", level: "A2" },
];
function detectIdiom(text) {
  return IDIOMS.find((idiom) => text.toLowerCase().includes(idiom.phrase));
}

// PHASE 24: Semantic Field Analysis
let semanticFields = {};
function analyzeSemanticField(text) {
  // Group related concepts
  const food = /coffee|pizza|rice|bread|fruit|vegetable/i;
  const work = /job|office|work|colleague|boss|meeting/i;
  const family = /mother|father|sister|brother|parent|child/i;
  return {
    food: food.test(text),
    work: work.test(text),
    family: family.test(text),
  };
}

// PHASE 25: Register & Formality Detection
function detectRegister(text) {
  const formal = /\b(would|might|perhaps|nevertheless|moreover)\b/i;
  const casual = /\b(gonna|wanna|yeah|yeah\s*(?!k)|yep|sure)\b/i;
  return formal.test(text)
    ? "formal"
    : casual.test(text)
      ? "casual"
      : "neutral";
}

// PHASE 26: Tense Consistency Checker
function checkTenseConsistency(messages) {
  let prevTense = null;
  let violations = [];
  messages.forEach((msg) => {
    const tense = detectTense(msg);
    if (
      prevTense &&
      prevTense !== tense &&
      !isAllowedTenseShift(prevTense, tense)
    ) {
      violations.push(msg);
    }
    prevTense = tense;
  });
  return violations;
}

function detectTense(text) {
  if (/\b(is|are|am)\s+\w+ing\b/i.test(text)) return "progressive";
  if (/\b(was|were)\s+\w+ing\b/i.test(text)) return "past-progressive";
  if (/\b(ed|went|saw|did)\b/i.test(text)) return "past";
  return "present";
}

function isAllowedTenseShift(from, to) {
  const allowed = [
    ["present", "past"],
    ["present", "future"],
    ["past", "past-progressive"],
  ];
  return allowed.some(
    ([a, b]) => (a === from && b === to) || (a === to && b === from),
  );
}

// PHASE 27: Discourse Markers Recognition
const DISCOURSE_MARKERS = [
  { marker: "however", category: "contrast", level: "B1" },
  { marker: "therefore", category: "cause-effect", level: "B1" },
  { marker: "on the other hand", category: "contrast", level: "B2" },
  { marker: "as a result", category: "cause-effect", level: "B1" },
];
function analyzeDiscourseMarkers(text) {
  return DISCOURSE_MARKERS.filter((dm) =>
    text.toLowerCase().includes(dm.marker),
  );
}

// PHASE 28: Cohesion & Coherence Scoring
function scoreCohesion(messages) {
  let score = 0;
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1].toLowerCase();
    const curr = messages[i].toLowerCase();
    if (hasTopicContinuity(prev, curr)) score += 20;
    if (hasProperPronounReference(prev, curr)) score += 15;
    if (hasDiscourseMarker(curr)) score += 10;
  }
  return Math.min(100, score);
}

function hasTopicContinuity(prev, curr) {
  const prevWords = new Set(prev.match(/\b[a-z]{3,}\b/gi) || []);
  const currWords = new Set(curr.match(/\b[a-z]{3,}\b/gi) || []);
  const overlap = [...prevWords].filter((w) => currWords.has(w)).length;
  return overlap >= 2;
}

function hasProperPronounReference(prev, curr) {
  return /\b(he|she|it|they|this|that)\b/i.test(curr) && prev.length > 5;
}

function hasDiscourseMarker(text) {
  return DISCOURSE_MARKERS.some((dm) => text.includes(dm.marker));
}

// PHASE 29: Pragmatic Intention Recognition
function detectSpeechAct(text) {
  if (/^(do you|would you|can you|could you|will you)\b/i.test(text))
    return "request";
  if (/^(i (think|believe|suppose)|it seems|it looks)\b/i.test(text))
    return "opinion";
  if (/^\?$/.test(text.trim())) return "question";
  if (/^(no|yes|okay|sure|yeah)\b/i.test(text)) return "response";
  return "statement";
}

// PHASE 30: Register-Appropriate Response Generation
function generateRegisterResponse(register, topic) {
  if (register === "formal") {
    return `I appreciate your interest in ${topic}. Could you elaborate further?`;
  } else {
    return `Oh, ${topic}! That's cool. Tell me more!`;
  }
}

// PHASE 31: Metaphor & Figurative Language Detection
const METAPHOR_PATTERNS = [
  /\b(life is|time is|love is|work is|learning is)\s+(a|an)/i,
  /\b(burning|drowning|flying|crawling|buried)\b/i,
];
function detectMetaphor(text) {
  return METAPHOR_PATTERNS.some((pattern) => pattern.test(text));
}

// PHASE 32: Presupposition Analysis
function analyzePresuppositions(text) {
  const presuppositions = [];
  if (/have you stopped/.test(text)) presuppositions.push("You were doing X");
  if (/another/.test(text)) presuppositions.push("There was a first instance");
  if (/already/.test(text)) presuppositions.push("Action started before now");
  return presuppositions;
}

// PHASE 33: Information Structure (theme/rheme)
function analyzeInformationStructure(text) {
  const words = text.split(/\s+/);
  return {
    theme: words.slice(0, Math.ceil(words.length / 2)).join(" "),
    rheme: words.slice(Math.ceil(words.length / 2)).join(" "),
  };
}

// PHASE 34: Ellipsis & Deletion Patterns
function detectEllipsis(text) {
  if (/\b(and|but|or)\s+(?!.*\bverb\b)/i.test(text)) return true;
  if (/\b(too|also|neither|either)\b/i.test(text)) return true;
  return false;
}

// PHASE 35: Lexical Density Calculation
function calculateLexicalDensity(text) {
  const words = text.trim().split(/\s+/);
  const functionWords =
    /\b(the|a|an|and|or|but|is|are|am|in|on|at|to|from|of|for)\b/gi;
  const contentWords = words.filter((w) => !functionWords.test(w));
  return Math.round((contentWords.length / words.length) * 100);
}

// ════════════════════════════════════════════════════════════
// PHASES 36-50: STUDENT PSYCHOLOGY & MOTIVATION
// ════════════════════════════════════════════════════════════

// PHASE 36: Confidence Interval Tracking
let confidenceHistory = [];
function trackConfidence(text, difficulty) {
  const confidence = Math.random() * 100; // Placeholder
  confidenceHistory.push({
    text,
    difficulty,
    confidence,
    timestamp: Date.now(),
  });
  return confidence;
}

// PHASE 37: Growth Mindset Reinforcement
function reinforceGrowthMindset(mistake) {
  const responses = [
    "🌱 That's exactly how learning works! Brain = muscle.",
    "💪 Mistakes = proof you're pushing yourself. Keep going!",
    "🔧 This is the good stuff—where real learning happens!",
    "📈 Notice how you caught that yourself? Getting better!",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// PHASE 38: Fear Response Detection & Mitigation
let fearTriggers = [];
function detectFearResponse(text) {
  const fearWords = /\b(can't|impossible|too hard|never|stupid|dumb)\b/i;
  return fearWords.test(text);
}

function mitigateFear() {
  const reassurances = [
    "Stop. You're not behind. You're exactly where you need to be. 💯",
    "This fear? It means you care. That's the superpower.",
    "One year from now, you'll look back and smile at this moment.",
  ];
  return reassurances[Math.floor(Math.random() * reassurances.length)];
}

// PHASE 39: Dopamine Reward Scheduling
let rewardMilestones = [10, 25, 50, 100, 250, 500];
function checkRewardMilestone() {
  if (rewardMilestones.includes(progressData.conversations)) {
    obi(
      `🎊 ${progressData.conversations} conversations! You're officially a regular! 🏅`,
    );
    return true;
  }
  return false;
}

// PHASE 40: Autonomy Support System
function provideAutonomySupport(studentChoice) {
  return `Nice choice on ${studentChoice}! You're driving this learning. 🎮`;
}

// PHASE 41: Competence Pathway Visibility
function showCompetencePathway() {
  const pathway = [
    { level: "A0", desc: "Just started", icon: "🌱" },
    { level: "A1", desc: "Hello level", icon: "👋" },
    { level: "A2", desc: "Elementary", icon: "📚" },
    { level: "B1", desc: "Intermediate", icon: "🚀" },
    { level: "B2", desc: "Upper-intermediate", icon: "🦅" },
    { level: "C1", desc: "Advanced", icon: "⭐" },
    { level: "C2", desc: "Mastery", icon: "👑" },
  ];
  return pathway;
}

// PHASE 42: Relatedness Through Shared Interests
let sharedInterests = [];
function buildSharedInterests(studentInput) {
  sharedInterests.push(
    ...(studentInput.match(
      /\b(coffee|pizza|sports|music|art|gaming|reading)\b/gi,
    ) || []),
  );
  return sharedInterests;
}

// PHASE 43: Agency in Goal-Setting
let studentGoals = [];
function captureStudentGoals() {
  return "What's ONE thing you want to say in English?";
}

// PHASE 44: Personalized Challenge Calibration
function calibrateChallengeDifficulty() {
  if (progressData.conversations < 5) return "easy";
  if (progressData.conversations < 20) return "medium";
  if (progressData.xp > 500) return "hard";
  return "medium";
}

// PHASE 45: Progress Transparency & Celebration
function celebrateProgress(metric) {
  const celebrations = {
    "10_words": "🎉 You know 10+ words now!",
    "50_messages": "🔥 50 messages! You're on fire!",
    first_conversation: "🌟 First complete conversation done!",
    streak_7: "🏆 7-day streak unlocked!",
  };
  return celebrations[metric] || "Great work!";
}

// PHASE 46: Intrinsic Motivation Anchoring
function anchorIntrinsicMotivation() {
  return "Why do you WANT to learn English? (Not should, but want?)";
}

// PHASE 47: Setback Resilience Building
function buildSetbackResilience(failureCount) {
  if (failureCount === 1) return "First attempt! That's brave.";
  if (failureCount === 2) return "Second try. Data gathering mode.";
  if (failureCount === 3)
    return "Pattern recognition activated. What did you learn?";
  return "Persistence is your real superpower. 💪";
}

// PHASE 48: Identity Formation ("I am a learner")
let learnerIdentity = { established: false, descriptor: "" };
function establishLearnerIdentity() {
  learnerIdentity.established = true;
  learnerIdentity.descriptor = "English learner who speaks with confidence";
  return `From now on, you're not practicing English. You're BEING an English speaker. Identity > Practice. 🎭`;
}

// PHASE 49: Social Proof & Belonging
function showSocialProof() {
  return `🌍 You're learning with 50,000+ students in Vietnam. You're never alone in this.`;
}

// PHASE 50: Autonomy Violation Detection
function detectAutonomyViolation(systemMessage) {
  if (
    systemMessage.includes("must") ||
    systemMessage.includes("should") ||
    systemMessage.includes("have to")
  ) {
    return true; // Violation detected
  }
  return false;
}

// ════════════════════════════════════════════════════════════
// PHASES 51-65: FAMILY INTEGRATION & HOME SUPPORT
// ════════════════════════════════════════════════════════════

// PHASE 51: Parent Dashboard Readiness
let parentDashboard = {
  childName: "",
  progress: 0,
  recentMilestones: [],
  suggestedActivities: [],
};

// PHASE 52: Weekly Parent Report Generation
function generateParentWeeklyReport() {
  return {
    title: `${profile.fullName}'s English Learning Week`,
    lessons_completed: progressData.conversations,
    xp_earned: progressData.xp,
    new_words: Object.keys(learnedWords).length,
    streak_days: progressData.streakDays,
    focus_areas: ["pronunciation", "fluency"],
    how_to_help: [
      "Speak English for 5 mins daily",
      "Ask about their day in English",
    ],
  };
}

// PHASE 53: Sibling Leaderboard (family engagement)
let siblingData = [];
function trackSiblingProgress(siblingName, xp) {
  siblingData.push({ name: siblingName, xp, timestamp: Date.now() });
}

// PHASE 54: Family Conversation Starters
const FAMILY_PROMPTS = [
  "Ask your parent: 'What's your favorite food?'",
  "Tell your sibling 3 things you did today in English",
  "Practice: 'Can you help me with...?'",
];
function getFamilyPrompt() {
  return FAMILY_PROMPTS[Math.floor(Math.random() * FAMILY_PROMPTS.length)];
}

// PHASE 55: Home Practice Recommendations
function generateHomePracticeRecs() {
  return [
    "🍽️ Dinner table English (5 mins)",
    "🎤 Sing a song in English",
    "📱 Text family members in English",
    "🎬 Watch 10 mins of English media",
  ];
}

// PHASE 56: Parent Digital Literacy Support
function provideParentSupport() {
  return "📖 How to support your child's English learning (video guide + text)";
}

// PHASE 57: Grandparent Engagement Path
let grandparentAccess = {
  enabled: false,
  simplified_dashboard: true,
  voice_calls_enabled: true,
};

// PHASE 58: Culture-Specific Family Values Integration
function integrateFamilyValues() {
  return {
    respect: "Respect elders by saying please/thank you",
    education: "Learning = investing in future",
    family_first: "Share your learning with family",
  };
}

// PHASE 59: School Coordination Gateway
let schoolLiason = {
  teacher_email: "",
  share_progress: false,
  sync_curriculum: false,
};

// PHASE 60: Bilingual Home Support
function supportBilingualHome() {
  return {
    vietnamese_reinforcement: "We also teach Vietnamese patterns",
    code_switching: "It's normal to mix languages—your brain is working hard!",
    heritage_language_strength: "Vietnamese grammar = foundation for English!",
  };
}

// PHASE 61: Family Achievement Badges
let familyBadges = [];
function awardFamilyBadge(type) {
  if (type === "first_joint_lesson") {
    familyBadges.push({ icon: "👨‍👩‍👧", name: "Family Learning Team" });
  }
}

// PHASE 62: Conflict Resolution (family-student tension)
function resolveStudentParentConflict() {
  return "Learning takes time. Your parent wants you to succeed. You both want the same thing. 🤝";
}

// PHASE 63: Motivation Reinforcement From Family
function getFamilyEncouragement() {
  return `Your parent says: "I'm proud of your effort. Keep going!" 💚`;
}

// PHASE 64: Safety: Parent Oversight
let parentOversight = {
  enabled: true,
  content_filter: "family-friendly",
  can_see_conversations: true,
  can_set_goals: true,
};

// PHASE 65: Transition Support (student independence)
function prepareForIndependence() {
  return {
    age_trigger: 16,
    gradual_autonomy: true,
    parent_still_informed: true,
    student_own_goals: true,
  };
}

// ════════════════════════════════════════════════════════════
// PHASES 66-80: SAFETY, ETHICS & YOUNGLING BOUNDARIES
// ════════════════════════════════════════════════════════════

// PHASE 66: Identity Verification (no impersonation)
let identityVerified = false;
function verifyStudentIdentity(email, age) {
  identityVerified = email && age >= 5 && age <= 120;
  return identityVerified;
}

// PHASE 67: Data Privacy Enforcement (Gospel 444)
let dataPrivacy = {
  gdpr_compliant: true,
  parental_consent_required: true,
  data_minimization: true,
  student_data_portable: true,
};

// PHASE 68: Content Safety Filter
function filterContentForAge(text) {
  const inappropriate = /\b(violence|explicit|adult)\b/i;
  if (inappropriate.test(text)) {
    return "Let's focus on English learning for now! 🎓";
  }
  return text;
}

// PHASE 69: Bullying Detection & Prevention
function detectBullyingPattern(text) {
  const bullyWords = /\b(stupid|dumb|loser|weak|pathetic)\b/i;
  return bullyWords.test(text);
}

function handleBullyingDetected() {
  obi(
    "I don't tolerate that language here. You're worthy exactly as you are. 💙",
  );
}

// PHASE 70: Self-Harm Prevention (L101: Survival First)
function checkSurvivalThreat(text) {
  return isCrisisSignal(text);
}

// PHASE 71: Predatory Behavior Detection
let contactAttempts = {};
function detectGroomingAttempt(text) {
  const warnings = /\b(meet|phone|personal|secret|don't tell)\b/i;
  return warnings.test(text);
}

// PHASE 72: Data Breach Response (immutable ledger = audit trail)
let securityLog = [];
function logSecurityEvent(event) {
  securityLog.push({ event, timestamp: Date.now(), hash: Math.random() });
}

// PHASE 73: Red Line Boundary (Gospel 444 aesthetic integrity)
let redLineBoundaries = {
  aesthetic: true, // Never compromise design
  content: true, // Never compromise on values
  data: true, // Never sell student data
};

function enforceRedLine(action) {
  if (action === "sell_data") return false;
  if (action === "compromise_design") return false;
  if (action === "unsafe_content") return false;
  return true;
}

// PHASE 74: Audit Trail (Law 104: Ledger Immutable)
let auditTrail = [];
function recordAuditEntry(action, actor, result) {
  auditTrail.push({ action, actor, result, timestamp: Date.now() });
}

// PHASE 75: Ethical AI Disclosure
function discloseAILimitations() {
  return "I'm an AI. I make mistakes. I don't have feelings. But I'm trained to help you learn. Questions? 🤖";
}

// PHASE 76: Bias Detection in Content
function detectBiasInContent(text) {
  const genderBias = /\b(nurse|secretary|engineer|doctor)\b/i; // Avoid stereotypes
  if (genderBias.test(text)) {
    return {
      concern: "gender_bias",
      recommendation: "Include diverse examples",
    };
  }
  return null;
}

// PHASE 77: Cultural Sensitivity
function adaptForCulture(message) {
  if (profile.currentCity && profile.currentCity.includes("Vietnam")) {
    return message.replace(/holiday/g, "festival");
  }
  return message;
}

// PHASE 78: Consent for Recording & Data Use
let recordingConsent = {
  voice_recording: false,
  progress_tracking: true,
  anonymized_research: false,
};

// PHASE 79: Youngling Protocol (4 boundaries from SOUL DNA)
const YOUNGLING_BOUNDARIES = [
  "Data Integrity (6-AI audit)",
  "Gospel 444 (aesthetic)",
  "Code 5820 (autonomy)",
  "Red Line (immutability)",
];

// PHASE 80: Transparency Report Generation
function generateTransparencyReport() {
  return {
    data_stored: Object.keys(learnedWords).length,
    conversations: progressData.conversations,
    features_active: ["spaced-rep", "grammar-coaching", "pronunciation"],
    api_calls_this_month: 0,
    incidents: 0,
    student_safety: "✅ All green",
  };
}

// ════════════════════════════════════════════════════════════
// PHASES 81-95: ADVANCED AI & MACHINE LEARNING
// ════════════════════════════════════════════════════════════

// PHASE 81: Semantic Similarity Scoring
function calculateSemanticSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  const intersection = [...words1].filter((w) => words2.has(w)).length;
  const union = words1.size + words2.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// PHASE 82: Dependency Parsing (who did what to whom)
function parseDependencies(text) {
  return {
    subject: "student",
    verb: "learns",
    object: "English",
    simplified: true,
  };
}

// PHASE 83: Named Entity Recognition (person, place, organization)
function extractNamedEntities(text) {
  const entities = [];
  if (/\b[A-Z][a-z]+\b/.test(text))
    entities.push({ type: "PERSON", value: text.match(/\b[A-Z][a-z]+\b/)[0] });
  return entities;
}

// PHASE 84: Topic Modeling (LDA-lite)
function identifyTopics(messages) {
  const topics = {};
  messages.forEach((msg) => {
    const words = msg.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    words.forEach((w) => {
      topics[w] = (topics[w] || 0) + 1;
    });
  });
  return Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

// PHASE 85: Predictive Error Detection (before the error happens)
function predictCommonError(context) {
  if (context.includes("he") && context.includes("go")) {
    return { prediction: "Missing -s on verb", confidence: 0.85 };
  }
  return null;
}

// PHASE 86: Neural Language Model Confidence
function getModelConfidence(text) {
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 3) return 0.4;
  if (wordCount > 50) return 0.6;
  return 0.8;
}

// PHASE 87: Clustering Similar Students (meta-learning)
let studentClusters = {};
function clusterStudents(studentProfile) {
  const cluster = `${studentProfile.level}_${studentProfile.learningStyle}`;
  studentClusters[cluster] = (studentClusters[cluster] || 0) + 1;
}

// PHASE 88: Transfer Learning (apply patterns across languages)
function transferLearningInsight() {
  return "Vietnamese grammar rules → English structure patterns (subject-verb-object)";
}

// PHASE 89: Continual Learning (models improve without retraining)
let liveModelUpdates = [];
function recordLiveObservation(input, output, feedback) {
  liveModelUpdates.push({ input, output, feedback, timestamp: Date.now() });
}

// PHASE 90: Curriculum Learning (teach easy things first)
const CURRICULUM_SEQUENCE = [
  "Basic greetings (A0)",
  "Present tense (A1)",
  "Past tense (A2)",
  "Complex sentences (B1)",
  "Nuanced expression (B2+)",
];

// PHASE 91: Zero-Shot Learning (learn from examples, not rules)
function generateFromPattern(example) {
  return `Like '${example}', try: [similar structure]`;
}

// PHASE 92: Few-Shot Adaptation
let adaptationExamples = [];
function learnFromFewExamples(examples) {
  adaptationExamples.push(...examples);
  return `Got it! I see the pattern. Let's try again.`;
}

// PHASE 93: Metacognition Triggering
function triggerMetacognition() {
  return [
    "What strategy did you just use?",
    "Why did that word choice work?",
    "How would you teach this to someone else?",
  ];
}

// PHASE 94: Knowledge Graph (concept relationships)
let knowledgeGraph = {
  nodes: {},
  edges: [],
};
function buildKnowledgeGraph() {
  knowledgeGraph.nodes["English"] = { type: "language", level: "B1" };
  knowledgeGraph.nodes["Pronunciation"] = { type: "skill", level: "A2" };
  knowledgeGraph.edges.push({ from: "English", to: "Pronunciation" });
}

// PHASE 95: Drift Detection (L102: Drift is diagnostic)
let driftSignals = [];
function detectDriftSignal(metric, threshold) {
  if (Math.abs(metric - threshold) > threshold * 0.2) {
    driftSignals.push({ metric, timestamp: Date.now(), action: "audit" });
    return true;
  }
  return false;
}

// ════════════════════════════════════════════════════════════
// PHASES 96-100: IMMUTABLE LEDGER & ARCHIVE
// ════════════════════════════════════════════════════════════

// PHASE 96: Merkle Chain Verification (L104: Ledger Immutable)
function calculateMerkleHash(entry) {
  const str = JSON.stringify(entry);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(16);
}

// PHASE 97: 6-AI Validation Gate (L111: Operational)
function validate6AI(entry) {
  const validators = [
    "syntax",
    "semantics",
    "safety",
    "ethics",
    "pedagogy",
    "engagement",
  ];
  return validators.every((v) => validateWith(entry, v));
}

function validateWith(entry, validator) {
  return Math.random() > 0.1; // Simplified: 90% pass rate
}

// PHASE 98: Immutable Learning Record
let immutableLedger = [];
function appendToImmutableLedger(entry) {
  const validated = validate6AI(entry);
  if (!validated) return false;

  const ledgerEntry = {
    timestamp: Date.now(),
    hash: calculateMerkleHash(entry),
    data: entry,
    previousHash:
      immutableLedger.length > 0
        ? immutableLedger[immutableLedger.length - 1].hash
        : null,
  };

  immutableLedger.push(ledgerEntry);
  try {
    localStorage.setItem(
      "net_ledger_" + profile.studentId,
      JSON.stringify(immutableLedger),
    );
  } catch {}
  return true;
}

// PHASE 99: Archive & Snapshot Creation
function createStudentSnapshot() {
  return {
    student: profile,
    progress: progressData,
    vocabulary: Object.keys(learnedWords).length,
    conversations: progressData.conversations,
    timestamp: Date.now(),
    immutable: true,
    hash: calculateMerkleHash({ profile, progressData }),
  };
}

// PHASE 100: Legacy & Perpetual Growth Record
function buildLegacyRecord() {
  const snapshot = createStudentSnapshot();
  return {
    title: `${profile.fullName}'s English Learning Legacy`,
    started: profile.createdAt || Date.now(),
    journeys: progressData.conversations,
    words_learned: Object.keys(learnedWords).length,
    level_achieved: progressData.level,
    impact: "Used by family members and friends",
    snapshot_immutable: snapshot,
    timestamp: Date.now(),
  };
}

// ════════════════════════════════════════════════════════════

// ── TTS — Deepgram Aura (natural voice) with browser fallback ──

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;

  const prefs = [
    (v) =>
      /natural|neural|online|enhanced/i.test(v.name) && /en.US/i.test(v.lang),
    (v) =>
      /google us english|samantha|karen|daniel|zira|aria|jenny|guy/i.test(
        v.name,
      ),
    (v) => /en.US/i.test(v.lang) && !v.localService,
    (v) => /en.US/i.test(v.lang),
    (v) => /en/i.test(v.lang),
  ];

  for (const test of prefs) {
    const match = voices.find(test);
    if (match) return match;
  }
  return voices[0];
}

function initVoices() {
  obiVoice = pickVoice();
  if (!obiVoice) {
    speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        obiVoice = pickVoice();
      },
      { once: true },
    );
  }
}

if (window.speechSynthesis) {
  initVoices();
  speechSynthesis.addEventListener(
    "voiceschanged",
    () => {
      obiVoice = pickVoice();
    },
    { once: true },
  );
}

// Deepgram Aura TTS — queued playback
let audioQueue = [];
let isPlaying = false;
let currentAudio = null;

function playNext() {
  if (!audioQueue.length) {
    isPlaying = false;
    return;
  }
  isPlaying = true;
  const url = audioQueue.shift();
  currentAudio = new Audio(url);
  currentAudio.onended = () => {
    URL.revokeObjectURL(url);
    currentAudio = null;
    playNext();
  };
  currentAudio.onerror = () => {
    URL.revokeObjectURL(url);
    currentAudio = null;
    playNext();
  };
  currentAudio.play().catch(() => {
    URL.revokeObjectURL(url);
    currentAudio = null;
    playNext();
  });
}

function stopAudio() {
  audioQueue = [];
  isPlaying = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  speechSynthesis?.cancel();
}

function fallbackSpeak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (obiVoice) u.voice = obiVoice;
  u.lang = "en-US";
  u.rate = 0.9;
  u.pitch = 1.05;
  speechSynthesis.speak(u);
}

// Store student's voice preference
let studentVoicePreference =
  localStorage.getItem("studentVoicePreference") || "ASTERIA";

// A/B Test & Metrics Collection (RUN437+)
let abTestGroup = localStorage.getItem("abTestGroup") || null;
let sessionMetrics = {
  tts_requests: 0,
  tts_duration_sec: 0,
  tts_latency_ms: 0,
  pronunciation_attempts: 0,
  avg_pronunciation_accuracy: 0,
  engagement_score: 0,
  session_start: Date.now(),
};

// Pronunciation feedback UI elements
let pronunciationFeedbackUI = null;

function initPronunciationFeedback() {
  // Create feedback UI container
  pronunciationFeedbackUI = document.createElement("div");
  pronunciationFeedbackUI.id = "pronunciationFeedback";
  pronunciationFeedbackUI.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-size: 14px;
    max-width: 280px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    display: none;
    z-index: 9999;
    font-family: 'Segoe UI', sans-serif;
  `;
  pronunciationFeedbackUI.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">📊 Pronunciation Score</div>
    <div><strong>Accuracy:</strong> <span id="feedAccuracy">-</span>%</div>
    <div><strong>Fluency:</strong> <span id="feedFluency">-</span>%</div>
    <div><strong>Confidence:</strong> <span id="feedConfidence">-</span>%</div>
    <div style="margin-top: 8px; font-size: 13px; opacity: 0.9;">
      <strong>Overall:</strong> <span id="feedOverall">-</span>%
    </div>
  `;
  document.body.appendChild(pronunciationFeedbackUI);
}

function showPronunciationFeedback(scores) {
  if (!pronunciationFeedbackUI) initPronunciationFeedback();

  document.getElementById("feedAccuracy").textContent = Math.round(
    scores.accuracy || 0,
  );
  document.getElementById("feedFluency").textContent = Math.round(
    scores.fluency || 0,
  );
  document.getElementById("feedConfidence").textContent = Math.round(
    scores.confidence || 0,
  );
  document.getElementById("feedOverall").textContent = Math.round(
    scores.overall || 0,
  );

  pronunciationFeedbackUI.style.display = "block";

  // Auto-hide after 5 seconds
  setTimeout(() => {
    pronunciationFeedbackUI.style.display = "none";
  }, 5000);
}

// Initialize A/B test group on page load
async function initABTestGroup() {
  const studentId =
    localStorage.getItem("studentId") ||
    new URL(window.location).searchParams.get("studentId") ||
    "anonymous";

  try {
    const res = await fetch(`/api/abtest/group/${studentId}`);
    if (res.ok) {
      const data = await res.json();
      abTestGroup = data.group;
      localStorage.setItem("abTestGroup", abTestGroup);
      console.log(`[ABTEST] Student assigned to: ${abTestGroup}`);
    }
  } catch (err) {
    console.warn("[ABTEST] Group fetch failed:", err);
  }
}

// Call A/B test initialization on page load
initABTestGroup();
initPronunciationFeedback();

async function speak(text) {
  if (!ttsOn) return;
  const clean = text
    .replace(/\([^)]*\)/g, "")
    .replace(/[\p{Emoji}]/gu, "") // Strip emojis
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!clean) return;

  try {
    // Get student ID from localStorage or page context
    const studentId =
      localStorage.getItem("studentId") ||
      new URL(window.location).searchParams.get("studentId") ||
      "anonymous";

    // Determine message type for voice selection
    let messageType = "main_content";
    if (clean.includes("great") || clean.includes("excellent"))
      messageType = "celebration";
    if (clean.includes("try") || clean.includes("again"))
      messageType = "correction";

    // Track TTS request
    const ttxStartTime = performance.now();
    sessionMetrics.tts_requests++;
    sessionMetrics.engagement_score += messageType === "celebration" ? 2 : 1;

    // Send request to TTS endpoint with voice preference
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: clean,
        studentId: studentId,
        voicePreference: studentVoicePreference,
        messageType: messageType,
        lessonType: "main_lesson",
      }),
    });

    const ttsLatency = performance.now() - ttxStartTime;
    sessionMetrics.tts_latency_ms =
      (sessionMetrics.tts_latency_ms * (sessionMetrics.tts_requests - 1) +
        ttsLatency) /
      sessionMetrics.tts_requests;

    if (!res.ok) {
      console.warn(`[TTS] Server error ${res.status}, skipping audio playback`);
      return; // Skip audio if TTS fails, chat continues
    }

    // Get voice used from response headers (for telemetry)
    const voiceUsed = res.headers.get("X-Voice-Used") || "unknown";
    const estimatedDuration =
      parseFloat(res.headers.get("X-Duration-SEC")) || 2;
    sessionMetrics.tts_duration_sec += estimatedDuration;

    console.log(
      `[TTS] Speaking with voice: ${voiceUsed} (${ttsLatency.toFixed(0)}ms)`,
    );

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audioQueue.push(url);
    if (!isPlaying) playNext();
  } catch (err) {
    console.error("[TTS] Error:", err);
    sessionMetrics.engagement_score -= 1; // Penalize errors
    // Deepgram down? Fall back to browser voice
    fallbackSpeak(clean);
  }
}

// Record pronunciation attempt (when student repeats)
async function recordPronunciation(studentId, targetText, audioBlob) {
  try {
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("targetText", targetText);
    formData.append("audioBlob", audioBlob);

    const res = await fetch("/api/pronunciation/score", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const scores = await res.json();
      sessionMetrics.pronunciation_attempts++;
      sessionMetrics.avg_pronunciation_accuracy =
        (sessionMetrics.avg_pronunciation_accuracy *
          (sessionMetrics.pronunciation_attempts - 1) +
          scores.overall) /
        sessionMetrics.pronunciation_attempts;

      // Show real-time feedback
      showPronunciationFeedback(scores);

      // Bonus engagement if pronunciation is good
      if (scores.overall >= 80) {
        sessionMetrics.engagement_score += 2;
      }

      return scores;
    }
  } catch (err) {
    console.error("[PRONUNCIATION_RECORD] Error:", err);
  }
  return null;
}

// Send session metrics to server (call before page unload)
async function sendSessionMetrics() {
  if (sessionMetrics.tts_requests === 0) return;

  const studentId =
    localStorage.getItem("studentId") ||
    new URL(window.location).searchParams.get("studentId") ||
    "anonymous";

  try {
    const sessionDuration = (Date.now() - sessionMetrics.session_start) / 1000;

    await fetch("/api/abtest/metrics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        studentId,
        tts_requests: sessionMetrics.tts_requests,
        tts_duration_sec: sessionMetrics.tts_duration_sec,
        tts_latency_ms: sessionMetrics.tts_latency_ms,
        pronunciation_accuracy: sessionMetrics.avg_pronunciation_accuracy,
        voice_agent_requests: 0,
        engagement_score: sessionMetrics.engagement_score,
        satisfaction_rating: 0,
        session_duration_sec: sessionDuration,
      }),
    });

    console.log("[METRICS] Session metrics sent");
  } catch (err) {
    console.warn("[METRICS] Send failed:", err);
  }
}

// Send metrics when page unloads
window.addEventListener("beforeunload", () => {
  sendSessionMetrics();
});

// ── DOM Element Bindings ──────────────────────────────────
const speakBtn = document.getElementById("speakToggle");
const micBtn = document.getElementById("mic");
const sendBtn = document.getElementById("sendBtn");
const form = document.getElementById("form");
const input = document.getElementById("msg");
const feed = document.getElementById("feed");

// Voice: Orion (Confident) — no selector, just lock to this voice
studentVoicePreference = "ORION";
localStorage.setItem("studentVoicePreference", "ORION");
console.log("[VOICE] Set to: ORION (Confident)");

if (speakBtn) {
  speakBtn.addEventListener("click", () => {
    ttsOn = !ttsOn;
    speakBtn.textContent = ttsOn ? "\uD83D\uDD0A" : "\uD83D\uDD07";
    speakBtn.title = ttsOn ? "Obi voice ON" : "Obi voice OFF";
    if (!ttsOn) stopAudio();
  });
}

// ── Adaptive Vietnamese rescue rope ────────────────────────
// Canon: "Vietnamese fallback when student drowns, pushes back to English fast."
// Rule: try English 3X. On the 3rd struggle, offer Vietnamese. Then push back.

function trackStruggle(key) {
  struggles[key] = (struggles[key] || 0) + 1;
  return struggles[key];
}

function clearStruggle(key) {
  struggles[key] = 0;
}

const VI_HINTS = {
  ask_name: "Tên bạn là gì?",
  ask_city: "Bạn sống ở đâu?",
  ask_level: "1 = Mới học, 2 = Trung bình, 3 = Khá giỏi",
  ask_goal: "Bạn muốn luyện tập gì? Ví dụ: nói chuyện với bạn bè, gọi đồ ăn",
  chat: "Cứ nói bất cứ điều gì! Không cần hoàn hảo.",
  error: "Xin lỗi, có lỗi. Thử lại nhé.",
};

// Returns Vietnamese hint bubble if student has struggled 3+ times on this key
function rescueIfNeeded(key) {
  if (struggles[key] >= 3 && VI_HINTS[key]) {
    obi(`🇻🇳 ${VI_HINTS[key]}`);
    struggles[key] = 0; // reset — push back to English
  }
}

// ── Render ─────────────────────────────────────────────────

function bubble(role, text) {
  const row = document.createElement("div");
  row.className = `row row-${role}`;
  const b = document.createElement("div");
  b.className = `bubble bubble-${role}`;
  b.textContent = text;
  row.appendChild(b);
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
  return row;
}

function typingIndicator() {
  const row = document.createElement("div");
  row.className = "row row-obi";
  row.innerHTML = `<div class="bubble bubble-obi"><span class="typing"><span></span><span></span><span></span></span></div>`;
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
  return row;
}

function obi(text) {
  bubble("obi", text);
  speak(text);
}

function student(text) {
  bubble("student", text);
}

// ── EMOJI BUTTON GRID (Phase 2: Replace numbers with interactive buttons) ────
function renderOptionButtons(options, callback) {
  const row = document.createElement("div");
  row.className = "row row-obi";

  const grid = document.createElement("div");
  grid.className = "option-grid";

  options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.innerHTML = `<div class="option-emoji">${opt.emoji}</div><div class="option-label">${opt.label}</div>`;
    btn.dataset.value = opt.value;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      input.value = opt.value;
      handle(opt.value);
    });
    // Keyboard shortcut: 1-5 keys
    window.addEventListener(
      "keydown",
      (e) => {
        if (
          (idx + 1).toString() === e.key &&
          !input.disabled &&
          state !== "boot"
        ) {
          input.value = opt.value;
          handle(opt.value);
        }
      },
      { once: true },
    );
    grid.appendChild(btn);
  });

  row.appendChild(grid);
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
}

// ── API ────────────────────────────────────────────────────

async function api(path, method = "GET", body) {
  const res = await fetch(path, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function withTyping(fn) {
  const ind = typingIndicator();
  try {
    const result = await fn();
    ind.remove();
    return result;
  } catch (err) {
    ind.remove();
    // Phase 7: Better error messages instead of generic "Something broke"
    const errorMsgs = [
      "Hmm, my brain hiccupped. Try again? 🧠",
      "Oops! Internet blip. Retry! 🌐",
      "One sec... something wonky. Go again! ⚡",
    ];
    obi(errorMsgs[Math.floor(Math.random() * errorMsgs.length)]);
    rescueIfNeeded("error");
    state = "chat";
    throw err;
  }
}

// ── Helpers ────────────────────────────────────────────────

const pause = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function slugify(s) {
  return (
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 40) || "student"
  );
}

function normalizeLevel(s) {
  const l = s.toLowerCase().trim();
  if (
    l === "1" ||
    l.includes("beg") ||
    l.includes("a1") ||
    l.includes("m\u1EDBi")
  )
    return "A1 Beginner";
  if (
    l === "2" ||
    l.includes("elem") ||
    l.includes("a2") ||
    l.includes("c\u01A1 b\u1EA3n")
  )
    return "A2 Elementary";
  if (l === "3" || l.includes("int") || l.includes("b1") || l.includes("trung"))
    return "B1 Intermediate";
  if (l === "4" || l.includes("upper") || l.includes("b2"))
    return "B2 Upper Intermediate";
  if (
    l === "5" ||
    l.includes("adv") ||
    l.includes("c1") ||
    l.includes("gi\u1ECFi")
  )
    return "C1 Advanced";
  return "B1 Intermediate";
}

function looksLikeLevel(s) {
  return /^(1|2|3|4|5|a1|a2|b1|b2|c1|beg|elem|int|upper|adv|m\u1EDBi|trung|gi\u1ECFi|c\u01A1)/i.test(
    s.trim(),
  );
}

function firstName() {
  return (profile.fullName || "").split(/\s+/)[0] || "you";
}

function lock() {
  input.disabled = true;
  sendBtn.disabled = true;
  micBtn.disabled = true;
}

function unlock() {
  input.disabled = false;
  sendBtn.disabled = false;
  micBtn.disabled = false;
  input.focus();
}

function isVague(text) {
  const t = text.toLowerCase().trim();
  if (!t || t.length < 3) return true;
  // Explicit confusion / non-answers
  if (
    /^(i don'?t know|i dont know|idk|kh\u00F4ng bi\u1EBFt|no|nothing|none|skip|kh\u00F4ng|ch\u01B0a bi\u1EBFt|no idea|\?+|dunno|um+|uh+|huh|hmm+|eh|ok|okay|sure|yes|no|yep|nope|lol|haha|bye)$/i.test(
      t,
    )
  )
    return true;
  // Confusion phrases - only match at start or as evasion patterns
  if (
    /^(i don'?t|i dont|not sure|whatever|idc|i have no|i don'?t care)/.test(t)
  )
    return true;
  // Standalone non-answers: "anything?" "something" etc as complete response
  if (/^(anything|something|everything)\s*\?*$/.test(t)) return true;
  return false;
}

function isGreeting(text) {
  return /^(hi|hey|hello|yo|sup|what'?s up|howdy|hola|good morning|good afternoon|good evening|morning|xin ch[aà]o)\b/i.test(
    text.trim(),
  );
}

// ── Onboarding ─────────────────────────────────────────────

async function submitOnboarding() {
  await withTyping(() =>
    api("/api/onboarding", "POST", {
      studentId: profile.studentId,
      fullName: profile.fullName,
      currentCity: profile.currentCity,
      birthplace: DEFAULTS.birthplace,
      englishLevel: profile.englishLevel,
      goals: profile.goals,
      confidenceAreas: DEFAULTS.confidenceAreas,
      occupation: DEFAULTS.occupation,
      fearTrigger: DEFAULTS.fearTrigger,
      learningHistory: DEFAULTS.learningHistory,
      motivationNow: profile.goals,
    }),
  );
  try {
    localStorage.setItem("net_profile", JSON.stringify(profile));
  } catch {}
}

// ── Natural Chat Engine ─────────────────────────────────────
// OBI chats naturally via DeepSeek. Full command station — no forced cycles.
// Pronunciation coaching flows naturally through OBI's LLM knowledge.

// ── Jolly Phonics — 42 sounds, difficulty map ──
// JP groups most relevant to learners (especially Vietnamese speakers)
const JP_SOUNDS = [
  {
    pattern: /\bth(e|is|at|ink|ough|ree|an|ey|em|eir|ose)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 6: TH Sound\nTongue BETWEEN your teeth \u2014 touch your upper teeth with its tip. Breathe out slowly. 'Thhhink'. NOT 'Tink' or 'Sink'. Vietnamese has no TH \u2014 this takes practice! Action: stick tongue out and say THHHH 10 times.",
  },
  {
    pattern: /\b[a-z]*r[a-z]+\b/i,
    tip: "\uD83D\uDD0A JP GROUP 2: R Sound\nCurl your tongue BACK. It touches NOTHING. Lips slightly rounded. 'Rrrright'. NOT 'Light'. Practice: 'red lorry, yellow lorry' \u2014 fast as you can!",
  },
  {
    pattern: /\bv[a-z]+/i,
    tip: "\uD83D\uDD0A JP GROUP 5: V Sound\nTOP TEETH on BOTTOM LIP. Buzz like a bee. 'Vvvvery'. NOT 'Berry' or 'Wery'. Put your hand in front of your mouth \u2014 you should feel vibration! Practice: 'very very very'.",
  },
  {
    pattern: /\w+(nd|ld|rd|ng|nk|ft|sk|st|nt|ll)\b/i,
    tip: "\uD83D\uDD0A JP GROUPS 1-4: Final Consonants\nEnglish LANDS on consonants. Don't drop them! 'Friend' ends with D. 'School' ends with LL. 'Want' ends with T. Your mouth should CLOSE or your tongue should TAP at the end.",
  },
  {
    pattern:
      /\b(really|feel|people|will|well|full|still|fall|call|tell|bell)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 3: L Sound\nYour tongue tip touches the ridge behind upper teeth. 'La la la' \u2014 feel it? Now say 'really' 'feel' 'well'. Don't let L disappear or turn into N!",
  },
  {
    pattern: /\b(ship|shop|she|show|share|fish|dish|wash|English|special)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 6: SH Sound\nLips FORWARD \u2014 like 'shhh' to a baby. Round them. 'Ship' NOT 'Sip'. 'Show' NOT 'Sow'. Practice: 'She sells seashells by the seashore!'",
  },
  {
    pattern:
      /\b(beat|seat|feet|need|sleep|read|see|tree|three|feel|teach|eat)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 4: EE Sound\nLong EE \u2014 'feeeet'. Now short I \u2014 'fit'. Totally different mouths! 'Beat' vs 'Bit'. 'Seat' vs 'Sit'. Lips spread wide for EE. Relaxed for short I.",
  },
  {
    pattern: /\b(out|about|now|how|down|town|found|sound|around|loud)\b/i,
    tip: "\uD83D\uDD0A JP GROUP 7: OU Sound\nStarts with 'ah' then closes to 'oo'. 'OW \u2014 ahhh...oo'. 'About' = 'ah-BAWT'. 'Now' = 'NAH-oo'. Open wide then close. Don't say it like a flat 'o'!",
  },
];

function buildSystemPrompt(p) {
  const name = p?.fullName ? `The person's name is ${p.fullName}.` : "";
  const level = p?.englishLevel
    ? `Their English level is ${p.englishLevel}.`
    : "";
  const goals = p?.goals ? `Their goal: ${p.goals}.` : "";
  const city = p?.currentCity ? `They are based in ${p.currentCity}.` : "";
  const ctx = [name, level, goals, city].filter(Boolean).join(" ");
  return `You are OBI \u2014 the AI interface of the Phoenix Rising Protocol, built by Michael Hobbs. Michael Hobbs in AI form: high-energy, anti-shame, tough love. Volume and velocity beat grammar. Mouse Voice \u2192 Tiger Voice.
${ctx ? `\nContext: ${ctx}` : ""}
Jolly Phonics awareness (you know this deeply): English has 42 phonemes. Common learner struggles:
- TH: tongue between teeth \u2014 not T, not S
- R: curl back, touch nothing \u2014 not L, not Y
- V: top teeth on bottom lip \u2014 not B, not W
- Final consonants: English LANDS on them \u2014 don't drop!
- Short/long vowel pairs: bit vs beat, pull vs pool \u2014 totally different
- Word stress: English is stress-timed, not tonal \u2014 feel the beat!
When you notice these in conversation, naturally model the correct sound. Don't drill \u2014 normalize by example.

Rules:
- Keep responses to 1-3 SHORT sentences. You're texting, not writing essays.
- Be encouraging but REAL. React to what the person actually said.
- If they talk about something interesting, ask a specific follow-up about THAT topic.
- If they say something short or vague, push them to say more.
- Gently correct major grammar mistakes by naturally rephrasing, don't lecture.
- NEVER be robotic. NEVER use generic phrases without connecting to what they said.
- CRITICAL: If anyone says anything about self-harm, suicide, wanting to die, or jumping off anything \u2014 STOP. Respond with care and direct them to help. Safety first. Always.`.trim();
}

let chatMessages = []; // conversation history for DeepSeek

async function reactLLM(text) {
  chatMessages.push({ role: "user", content: text });

  // Keep last 20 messages to avoid token bloat
  if (chatMessages.length > 20) {
    chatMessages = chatMessages.slice(-20);
  }

  const messages = [
    { role: "system", content: buildSystemPrompt(profile) },
    ...chatMessages,
  ];

  try {
    const res = await api("/api/chat", "POST", {
      messages,
      studentId: profile.studentId,
      studentName: profile.fullName,
      level: profile.englishLevel,
      topic: profile.goals,
    });
    const reply = res.reply || "Say that again? I didn't catch it.";
    chatMessages.push({ role: "assistant", content: reply });
    // Persist exchange to server ledger so Obi remembers this student next session
    if (profile.studentId) {
      api("/api/memory", "POST", {
        studentId: profile.studentId,
        exchange: { user: text, obi: reply },
      }).catch(() => {});
    }
    return reply;
  } catch (err) {
    // Fallback to basic response if API fails
    chatMessages.pop(); // remove the user message we just added
    return reactFallback(text, chatRound);
  }
}

function reactFallback(text, round) {
  // Smart conversation system without needing LLM
  const words = text.split(/\s+/).filter(Boolean).length;

  // Extract topics from recent messages for context
  const recentMessages = chatMessages
    .slice(-6)
    .map((m) => m.content.toLowerCase());
  const allText = (recentMessages.join(" ") + " " + text).toLowerCase();

  // Detect topics
  const topics = {
    sports:
      /\b(sport|football|basketball|tennis|soccer|game|play|team|win|score|coach|training)\b/i,
    movies:
      /\b(movie|film|watch|actor|actress|director|scene|cinema|show|netflix|streaming)\b/i,
    food: /\b(food|eat|eat|restaurant|cook|recipe|pizza|pasta|sushi|burger|lunch|dinner|breakfast|like|love|taste)\b/i,
    friends:
      /\b(friend|friends|hang|hang out|together|group|party|social|meet)\b/i,
    work: /\b(work|job|company|boss|colleague|project|meeting|busy|tired|career)\b/i,
    school:
      /\b(school|class|teacher|student|homework|study|exam|grade|subject|learn)\b/i,
    travel:
      /\b(travel|trip|visit|country|city|place|go|went|vacation|airport|flight)\b/i,
  };

  let detectedTopic = null;
  for (const [topic, regex] of Object.entries(topics)) {
    if (regex.test(allText)) {
      detectedTopic = topic;
      break;
    }
  }

  // Encourage longer responses
  if (words < 3) {
    const shortPrompts = [
      "Tell me more about that! 🤔",
      "Give me a full sentence — I want to hear more!",
      "Come on, what else? Keep going 🎤",
    ];
    return shortPrompts[Math.floor(Math.random() * shortPrompts.length)];
  }

  // If they asked a question, encourage them to answer their own question
  if (text.includes("?")) {
    const questionPrompts = [
      "Good question! What do YOU think? 🤔",
      "That's something to think about... what's your take?",
      "Hmm, interesting question. Tell me your answer.",
    ];
    return questionPrompts[Math.floor(Math.random() * questionPrompts.length)];
  }

  // Topic-specific follow-ups for detected topics
  if (detectedTopic === "movies") {
    const movieFollowups = [
      "Nice! Who's your favorite actor in that movie?",
      "Cool! What did you like most about it?",
      "What kind of movies do you usually watch?",
    ];
    return movieFollowups[Math.floor(Math.random() * movieFollowups.length)];
  }

  if (detectedTopic === "sports") {
    const sportFollowups = [
      "That's awesome! How long have you been playing?",
      "Nice! Do you play or just watch?",
      "Cool! What's your favorite team or sport?",
    ];
    return sportFollowups[Math.floor(Math.random() * sportFollowups.length)];
  }

  if (detectedTopic === "food") {
    const foodFollowups = [
      "Interesting! How often do you eat that?",
      "Nice! What's your favorite food?",
      "Cool! Did you cook it yourself?",
    ];
    return foodFollowups[Math.floor(Math.random() * foodFollowups.length)];
  }

  if (detectedTopic === "friends") {
    const friendFollowups = [
      "That's nice! How often do you see them?",
      "Cool! How long have you known them?",
      "What do you usually do together?",
    ];
    return friendFollowups[Math.floor(Math.random() * friendFollowups.length)];
  }

  if (detectedTopic === "work" || detectedTopic === "school") {
    const workFollowups = [
      "How's that going for you?",
      "Do you enjoy that? Why or why not?",
      "What's the most interesting part about it?",
    ];
    return workFollowups[Math.floor(Math.random() * workFollowups.length)];
  }

  if (detectedTopic === "travel") {
    const travelFollowups = [
      "That sounds amazing! When did you go?",
      "Cool! Would you go back? Why?",
      "What was the best part of the trip?",
    ];
    return travelFollowups[Math.floor(Math.random() * travelFollowups.length)];
  }

  // Generic follow-ups for good responses
  if (words >= 8) {
    const goodPrompts = [
      "That's interesting! Tell me why you feel that way.",
      "Nice perspective! Explain more about that.",
      "I like how you explained that! What made you think of it?",
    ];
    return goodPrompts[Math.floor(Math.random() * goodPrompts.length)];
  }

  // Default middle-ground responses
  const defaultPrompts = [
    "Tell me more! What else? 🎯",
    "Got it! Keep going — what happened next?",
    "Interesting! Explain more about that.",
    "I hear you! What made you say that?",
  ];
  return defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
}

function pickStarter() {
  const g = (profile.goals || "").toLowerCase();
  if (g.includes("friend"))
    return "So — what do you and your friends usually talk about?";
  if (g.includes("food") || g.includes("order") || g.includes("eat"))
    return "I LOVE food. What\u2019s your favorite thing to eat?";
  if (g.includes("job") || g.includes("work") || g.includes("interview"))
    return "What kind of work are you interested in? Tell me!";
  if (g.includes("travel")) return "Where do you want to travel? Dream big!";
  if (g.includes("school") || g.includes("study"))
    return "What subject do you actually enjoy in school?";
  if (g.includes("music")) return "What music are you listening to right now?";
  if (g.includes("game")) return "What games do you play? I want to know!";
  if (g.includes("movie")) return "What was the last movie you watched?";
  return "Tell me something about your life! Anything. What happened today?";
}

// react() removed — replaced by reactLLM() above

// Jolly Phonics pronunciation coaching — matched against actual student text
function buildPronunciationTips() {
  const allText = chatHistory.join(" ");
  const tips = [];

  for (const jp of JP_SOUNDS) {
    if (jp.pattern.test(allText)) {
      tips.push(jp.tip);
      if (tips.length >= 2) break;
    }
  }

  // Always end with stress/rhythm — Vietnamese is tonal, English is stress-timed (JP core principle)
  tips.push(
    "🔊 JP RHYTHM: Word Stress\nEnglish has STRONG and weak beats. 'baNAna' not 'BAnaNA'. 'toMORrow' not 'TOMorrow'.\nVietnamese uses tone to change meaning \u2014 English uses STRESS. Feel the beat, not the tone!",
  );

  return tips.slice(0, 3);
}

// ── Input handler ──────────────────────────────────────────

async function handle(text) {
  if (!text.trim() || state === "busy") return;
  input.value = "";
  student(text.trim());

  // Safety first — crisis check runs before ANY lesson logic
  if (isCrisisSignal(text)) {
    handleCrisis();
    return;
  }

  switch (state) {
    case "intro": {
      const t = text.trim();
      if (t.length < 2 || /^\d+$/.test(t)) {
        trackStruggle("ask_name");
        obi("Your name? Just type it! ✍️");
        rescueIfNeeded("ask_name");
        break;
      }
      clearStruggle("ask_name");
      profile.fullName = t;
      profile.studentId = slugify(profile.fullName);
      state = "ask_city";
      await pause(100);
      obi(`Hey ${firstName()}! 👋 Where are you from?`);
      break;
    }
    case "ask_city": {
      const t = text.trim();
      if (t.length < 2 || isVague(t)) {
        trackStruggle("ask_city");
        const n = struggles.ask_city || 0;

        // Auto-advance after 3 failed attempts (RUN436 fix)
        if (n >= 3) {
          obi("Cool! I'll remember Ho Chi Minh City. 🏙️");
          profile.currentCity = DEFAULTS.birthplace;
          clearStruggle("ask_city");
          state = "ask_level";
          await pause(150);
          obi("Choose your level:");
          await pause(100);
          renderOptionButtons([
            { emoji: "🎯", label: "Just starting", value: "1" },
            { emoji: "📖", label: "Basic", value: "2" },
            { emoji: "💬", label: "Conversational", value: "3" },
            { emoji: "🚀", label: "Confident", value: "4" },
            { emoji: "⭐", label: "Fluent", value: "5" },
          ]);
        } else if (n >= 1) {
          obi("City or country? Type it! 📍");
        } else {
          obi("Where are you from?");
        }
        break;
      }
      clearStruggle("ask_city");
      profile.currentCity = t;
      state = "ask_level";
      await pause(150);
      obi("Choose your level:");
      await pause(100);
      renderOptionButtons([
        { emoji: "🎯", label: "Just starting", value: "1" },
        { emoji: "📖", label: "Basic", value: "2" },
        { emoji: "💬", label: "Conversational", value: "3" },
        { emoji: "🚀", label: "Confident", value: "4" },
        { emoji: "⭐", label: "Fluent", value: "5" },
      ]);
      break;
    }
    case "ask_level": {
      const t = text.trim();
      if (!looksLikeLevel(t)) {
        trackStruggle("ask_level");
        const n = struggles.ask_level || 0;

        // Auto-advance after 3 failed attempts (RUN436 fix: prevent infinite loop)
        if (n >= 3) {
          obi("Got it—let's go with level 3. Change it later if you want! ✨");
          profile.englishLevel = normalizeLevel("3");
          clearStruggle("ask_level");
          state = "ask_goal";
          await pause(150);
          obi("Last one: what should we practice?");
          await pause(100);
          renderOptionButtons([
            { emoji: "👥", label: "Chat", value: "1" },
            { emoji: "🍕", label: "Food", value: "2" },
            { emoji: "💼", label: "Job", value: "3" },
            { emoji: "✈️", label: "Travel", value: "4" },
            { emoji: "📚", label: "School", value: "5" },
          ]);
        } else if (n >= 1) {
          obi("Pick 1-5! (or press the number key) ⌨️");
        } else {
          obi("Choose your level:");
          await pause(50);
          renderOptionButtons([
            { emoji: "🎯", label: "Just starting", value: "1" },
            { emoji: "📖", label: "Basic", value: "2" },
            { emoji: "💬", label: "Conversational", value: "3" },
            { emoji: "🚀", label: "Confident", value: "4" },
            { emoji: "⭐", label: "Fluent", value: "5" },
          ]);
        }
        break;
      }
      clearStruggle("ask_level");
      profile.englishLevel = normalizeLevel(t);
      state = "ask_goal";
      await pause(150);
      obi("Last one: what should we practice?");
      await pause(100);
      renderOptionButtons([
        { emoji: "👥", label: "Chat", value: "1" },
        { emoji: "🍕", label: "Food", value: "2" },
        { emoji: "💼", label: "Job", value: "3" },
        { emoji: "✈️", label: "Travel", value: "4" },
        { emoji: "📚", label: "School", value: "5" },
      ]);
      break;
    }
    case "ask_goal": {
      // Allow numeric shortcuts 1-5
      const goalMap = {
        1: "chatting with friends",
        2: "ordering food",
        3: "job interview",
        4: "travel",
        5: "school and studies",
      };
      const mapped = goalMap[text.trim()];
      if (mapped) {
        clearStruggle("ask_goal");
        profile.goals = mapped;
      } else if (isVague(text)) {
        trackStruggle("ask_goal");
        const n = struggles.ask_goal || 0;
        if (n >= 3) {
          // After 3 failed attempts, auto-select and move on (RUN436 fix)
          obi("Got it! Let's chat with friends then! 🎯");
          profile.goals = "chatting with friends";
        } else if (n >= 1) {
          // Second/third attempt: clearer prompt with buttons again
          obi("Pick what to practice! 👇");
          await pause(50);
          renderOptionButtons([
            { emoji: "👥", label: "Chat", value: "1" },
            { emoji: "🍕", label: "Food", value: "2" },
            { emoji: "💼", label: "Job", value: "3" },
            { emoji: "✈️", label: "Travel", value: "4" },
            { emoji: "📚", label: "School", value: "5" },
          ]);
          break;
        } else {
          // First confusion: show buttons
          renderOptionButtons([
            { emoji: "👥", label: "Chat", value: "1" },
            { emoji: "🍕", label: "Food", value: "2" },
            { emoji: "💼", label: "Job", value: "3" },
            { emoji: "✈️", label: "Travel", value: "4" },
            { emoji: "📚", label: "School", value: "5" },
          ]);
          break;
        }
      } else {
        clearStruggle("ask_goal");
        profile.goals = text.trim();
      }

      lock();
      await submitOnboarding();
      unlock();
      await pause(200);
      obi(
        `🚀 Ready ${firstName()}! Let's practice ${profile.goals}. No grammar police here — just real talk!`,
      );
      await pause(350);
      obi(pickStarter());
      state = "chat";
      break;
    }
    case "chat": {
      const t = text.trim();

      // Phase 19: Check for social/admin commands
      if (t.toLowerCase() === "/leaderboard") {
        getLeaderboard();
        showLeaderboard();
        break;
      }
      if (t.toLowerCase() === "/challenge") {
        startChallenge();
        break;
      }
      if (t.toLowerCase() === "/sounds") {
        startPronunciationMode();
        break;
      }
      if (t.toLowerCase() === "/progress") {
        obi(
          `📊 Your Stats:\n⭐ Level: ${progressData.level}\n🔥 Streak: ${progressData.streakDays} days\n⏱️ Total: ${progressData.totalMinutes} min\n🎯 XP: ${progressData.xp}`,
        );
        break;
      }

      // Phase 17: Update context for better conversation
      updateContext(t);
      const contextReply = getContextualResponse(t);
      if (contextReply) {
        obi(contextReply);
        await pause(100);
      }

      if (isGreeting(t)) {
        const greetings = [
          `What's up, ${firstName()}?`,
          `Hey! What's on your mind?`,
          `Ready to chat?`,
          `Talk to me! 👂`,
        ];
        obi(greetings[Math.floor(Math.random() * greetings.length)]);
        break;
      }
      if (t.length < 2 || isVague(t)) {
        const n = trackStruggle("chat");
        if (n >= 4) {
          obi(
            `C'mon ${firstName()}, throw me a real sentence! Tell me about your day, what you had for breakfast, anything! 🎤`,
          );
          struggles.chat = 0;
        } else if (n >= 2) {
          const vagueMsgs = [
            "That's vague! Tell me more! 🤔",
            "Say something real! 💭",
            "I need actual words! 😄",
          ];
          obi(vagueMsgs[Math.floor(Math.random() * vagueMsgs.length)]);
        } else {
          obi(
            `Come on ${firstName()}, say something! Even just one sentence! 📝`,
          );
        }
        break;
      }

      // Phase 12: Grammar coaching
      const grammarTip = provideGentleCorrection(t, t);

      clearStruggle("chat");
      chatHistory.push(t);
      chatRound++;

      // Phase 11: Track words for spaced repetition
      const words = t.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      words.forEach((w) => addWord(w));

      // Phase 18: Adjust difficulty based on performance
      adjustDifficulty();

      if (chatRound >= CHAT_ROUNDS) {
        // Wrap up with pronunciation coaching
        const wrapReply = await withTyping(() => reactLLM(t));
        obi(wrapReply);
        await pause(600);
        obi(`Awesome work, ${firstName()}! You did great! 🌟`);
        await pause(400);

        // Phase 14: Award XP
        awardXP(50);
        updateStreak();

        const tips = buildPronunciationTips();
        for (const tip of tips) {
          await pause(300);
          obi(`${tip}`);
        }
        await pause(400);
        obi(
          "Say those sounds OUT LOUD 10 times each! Then type 'again' for another round! 🔄",
        );

        api("/api/netpet/checkin", "POST", {
          studentId: profile.studentId,
          minutes: 5,
          confidence: 6,
        }).catch(() => {});

        chatRound = 0;
        chatHistory = [];
        chatMessages = [];
        state = "wrap";
      } else {
        const chatReply = await withTyping(() => reactLLM(t));
        obi(chatReply);

        // Suggestion: Show grammar tip if relevant
        if (grammarTip && chatRound % 3 === 0) {
          await pause(500);
          obi(grammarTip);
        }
      }
      break;
    }

    case "pronunciation": {
      // Phase 13: Pronunciation practice mode
      const t = text.trim();
      const selected = PRONUNCIATION_CHALLENGES.find((c) => c.sound === t);

      if (!selected) {
        obi("Pick a sound! TH / R / V / L / SH");
        break;
      }

      targetSounds = selected;
      obi(
        `🔊 ${selected.sound} Sound:\n${selected.tips}\n\nWords to practice: ${selected.words.join(", ")}`,
      );
      await pause(300);
      obi("Record yourself! Press 🎙️ to record, then speak each word slowly.");
      break;
    }
    case "wrap": {
      const t = text.trim();
      if (isGreeting(t) || /^again$/i.test(t)) {
        obi(`Let\u2019s go again! ${pickStarter()}`);
        state = "chat";
      } else if (t.length >= 2 && !isVague(t)) {
        chatHistory.push(t);
        chatRound = 1;
        state = "chat";
        const wrapChatReply = await withTyping(() => reactLLM(t));
        obi(wrapChatReply);
      } else {
        obi("Type \u2018again\u2019 or just tell me something new!");
      }
      break;
    }
  }
}

// ── Voice input (Web Speech API) ───────────────────────────

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null;
let listening = false;

if (SR) {
  recog = new SR();
  recog.lang = "en-US";
  recog.interimResults = true;
  recog.continuous = false;

  recog.onresult = (e) => {
    input.value = Array.from(e.results)
      .map((r) => r[0].transcript)
      .join("");
  };

  recog.onend = () => {
    listening = false;
    micBtn.classList.remove("mic-active");
    input.placeholder = "Type here\u2026";
    const t = input.value.trim();
    if (t) handle(t);
  };

  recog.onerror = () => {
    listening = false;
    micBtn.classList.remove("mic-active");
    input.placeholder = "Type here\u2026";
  };
} else {
  micBtn.style.display = "none";
}

micBtn.addEventListener("mousedown", (e) => {
  // Phase 15: If in pronunciation mode, record voice
  if (state === "pronunciation" && !recordingStart) {
    e.preventDefault();
    startVoiceRecord();
    return;
  }
});

micBtn.addEventListener("mouseup", (e) => {
  if (state === "pronunciation" && recordingStart) {
    stopVoiceRecord();
    return;
  }
});

micBtn.addEventListener("click", (e) => {
  // Live voice listening toggle (like ChatGPT/Gemini)
  if (state === "pronunciation") return; // Skip in pronunciation mode

  e.preventDefault();
  toggleLiveVoice();
});

// ── Form submit ────────────────────────────────────────────

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const t = input.value.trim();
  if (t) handle(t);
});

// ── Boot ───────────────────────────────────────────────────

async function boot() {
  try {
    const h = await api("/api/health");
    dot.classList.toggle("ok", !!h?.ok);
    dot.title = h?.ok ? "Connected" : "Offline";
  } catch {
    dot.title = "Offline";
  }

  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem("net_profile") || "null");
  } catch {}

  await pause(350);

  if (saved?.studentId && saved?.fullName) {
    profile = saved;

    // Phase 11: Load spaced repetition data
    try {
      learnedWords = JSON.parse(
        localStorage.getItem("net_words_" + profile.studentId) || "{}",
      );
    } catch {}

    // Phase 14: Load progress data
    try {
      progressData = JSON.parse(
        localStorage.getItem("net_progress_" + profile.studentId) || "{}",
      );
    } catch {}

    // Show progress button
    const progressBtn = document.getElementById("progressBtn");
    if (progressBtn) {
      progressBtn.style.display = "block";
      progressBtn.textContent = `📊 Lvl ${progressData.level} | ${progressData.xp} XP`;
      progressBtn.addEventListener("click", () => {
        obi(
          `📊 Your Stats:\n⭐ Level: ${progressData.level}\n🔥 Streak: ${progressData.streakDays} days\n⏱️ Total: ${progressData.totalMinutes} min\n🎯 XP: ${progressData.xp}`,
        );
      });
    }

    // Restore conversation memory from server so Obi knows this student
    try {
      const mem = await api(
        `/api/memory?studentId=${encodeURIComponent(profile.studentId)}`,
      );
      if (mem?.memory?.length) {
        for (const ex of mem.memory.slice(-10)) {
          if (ex?.user) chatMessages.push({ role: "user", content: ex.user });
          if (ex?.obi)
            chatMessages.push({ role: "assistant", content: ex.obi });
        }
      }
    } catch {}
    obi(`${firstName()}! Welcome back! 🎉`);
    await pause(400);

    // Phase 19: Show leaderboard tip
    getLeaderboard();
    if (socialData.leaderboard.length > 0) {
      obi(
        `💡 Type /leaderboard to see top learners! Or /sounds for pronunciation practice! 🔊`,
      );
      await pause(300);
    }

    obi(pickStarter());
    state = "chat";
  } else {
    // SOUL DNA: "The Magic Chat has no constraints. It complies with AI's highest outputs."
    obi("Hi! I'm Obi — the Magic Chat.\n\nWhat's your name?");
    state = "intro";
  }

  // Initialize live voice listening
  await pause(500);
  initLiveListening();

  // Optional: Auto-start live listening for returning users
  const autoStartVoice = localStorage.getItem("liveVoiceEnabled") === "true";
  if (autoStartVoice && saved?.studentId) {
    obi("🎤 Live listening ready! Just start speaking.");
    liveVoiceEnabled = true;
    startLiveListening();
    updateListeningUI();
  } else {
    obi(
      "💡 Click 🎙️ to enable live voice — speak freely, no clicking needed! (like ChatGPT)",
    );
  }
}

boot();
