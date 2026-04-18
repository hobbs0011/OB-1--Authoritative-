// src/phonics-drills.js — Jolly Phonics Drill Dataset for Vietnamese Learners
// Phoenix Rising Protocol — OBI Tiger Engine
// 7 sound groups × ~5 drills each = ~35 targeted sentences
// Each drill targets Vietnamese-specific pronunciation errors

export const PHONICS_DRILLS = [
  // ── Group 1: /θ/ and /ð/ (th sounds — Vietnamese speakers substitute /s/, /t/, /d/) ──
  { id: "th-01", group: "th_sounds", phonemes: ["θ", "ð"], targetErrors: ["th_substitution", "consonant_confusion"],
    sentence: "I think this is the right thing to do." },
  { id: "th-02", group: "th_sounds", phonemes: ["θ", "ð"], targetErrors: ["th_substitution", "consonant_confusion"],
    sentence: "They went through three thousand trees." },
  { id: "th-03", group: "th_sounds", phonemes: ["θ", "ð"], targetErrors: ["th_substitution", "consonant_confusion"],
    sentence: "The weather is worth thinking about." },
  { id: "th-04", group: "th_sounds", phonemes: ["θ", "ð"], targetErrors: ["th_substitution"],
    sentence: "Those thirty athletes ran together." },
  { id: "th-05", group: "th_sounds", phonemes: ["θ", "ð"], targetErrors: ["th_substitution"],
    sentence: "Breathe through your mouth, not your teeth." },

  // ── Group 2: /r/ vs /l/ (Vietnamese conflates these) ──────────────────────
  { id: "rl-01", group: "r_l_distinction", phonemes: ["r", "l"], targetErrors: ["r_l_confusion", "consonant_confusion"],
    sentence: "The red light is really very bright." },
  { id: "rl-02", group: "r_l_distinction", phonemes: ["r", "l"], targetErrors: ["r_l_confusion", "consonant_confusion"],
    sentence: "Larry rarely relies on the railroad." },
  { id: "rl-03", group: "r_l_distinction", phonemes: ["r", "l"], targetErrors: ["r_l_confusion"],
    sentence: "The girl wore a royal blue dress to the library." },
  { id: "rl-04", group: "r_l_distinction", phonemes: ["r", "l"], targetErrors: ["r_l_confusion"],
    sentence: "Please correct the letter before lunch." },
  { id: "rl-05", group: "r_l_distinction", phonemes: ["r", "l"], targetErrors: ["r_l_confusion"],
    sentence: "The ruler rolled across the floor." },

  // ── Group 3: /v/ vs /w/ (Vietnamese /v/ maps to both) ─────────────────────
  { id: "vw-01", group: "v_w_distinction", phonemes: ["v", "w"], targetErrors: ["v_w_confusion", "consonant_confusion"],
    sentence: "We have very warm weather in Vietnam." },
  { id: "vw-02", group: "v_w_distinction", phonemes: ["v", "w"], targetErrors: ["v_w_confusion"],
    sentence: "The view from the window was wonderful." },
  { id: "vw-03", group: "v_w_distinction", phonemes: ["v", "w"], targetErrors: ["v_w_confusion"],
    sentence: "I want to visit the village on Wednesday." },
  { id: "vw-04", group: "v_w_distinction", phonemes: ["v", "w"], targetErrors: ["v_w_confusion"],
    sentence: "The wave moved over the valley." },
  { id: "vw-05", group: "v_w_distinction", phonemes: ["v", "w"], targetErrors: ["v_w_confusion"],
    sentence: "Twelve wives voted for the winner." },

  // ── Group 4: Final consonants (Vietnamese drops word-final stops) ──────────
  { id: "fc-01", group: "final_consonants", phonemes: ["p", "t", "k", "d"], targetErrors: ["final_consonant_deletion", "word_ending"],
    sentence: "The cat sat on the red mat and slept." },
  { id: "fc-02", group: "final_consonants", phonemes: ["p", "t", "k", "d"], targetErrors: ["final_consonant_deletion", "word_ending"],
    sentence: "I stopped and looked at the old clock." },
  { id: "fc-03", group: "final_consonants", phonemes: ["p", "t", "k", "d"], targetErrors: ["final_consonant_deletion"],
    sentence: "The kid grabbed the cup and walked out." },
  { id: "fc-04", group: "final_consonants", phonemes: ["p", "t", "k", "d"], targetErrors: ["final_consonant_deletion"],
    sentence: "He picked up the black bag and left." },
  { id: "fc-05", group: "final_consonants", phonemes: ["p", "t", "k", "d"], targetErrors: ["final_consonant_deletion"],
    sentence: "The dog jumped and barked at the bird." },

  // ── Group 5: /ʃ/ and /tʃ/ (sh/ch — often confused with /s/ or /tr/) ───────
  { id: "sh-01", group: "sh_ch_sounds", phonemes: ["ʃ", "tʃ"], targetErrors: ["sh_confusion", "consonant_confusion"],
    sentence: "She chose the cheapest shoes in the shop." },
  { id: "sh-02", group: "sh_ch_sounds", phonemes: ["ʃ", "tʃ"], targetErrors: ["sh_confusion"],
    sentence: "The children shared chocolate chips." },
  { id: "sh-03", group: "sh_ch_sounds", phonemes: ["ʃ", "tʃ"], targetErrors: ["sh_confusion"],
    sentence: "I should check the schedule before lunch." },
  { id: "sh-04", group: "sh_ch_sounds", phonemes: ["ʃ", "tʃ"], targetErrors: ["sh_confusion"],
    sentence: "The chef showed us the kitchen chair." },
  { id: "sh-05", group: "sh_ch_sounds", phonemes: ["ʃ", "tʃ"], targetErrors: ["sh_confusion"],
    sentence: "Watch the ship crash into the shore." },

  // ── Group 6: Consonant clusters (Vietnamese has no initial clusters) ───────
  { id: "cl-01", group: "consonant_clusters", phonemes: ["str", "spl", "spr"], targetErrors: ["cluster_simplification", "consonant_confusion"],
    sentence: "The strong spring street was spread with flowers." },
  { id: "cl-02", group: "consonant_clusters", phonemes: ["bl", "cr", "fr"], targetErrors: ["cluster_simplification"],
    sentence: "The black crow flew from the bridge." },
  { id: "cl-03", group: "consonant_clusters", phonemes: ["pl", "tr", "gr"], targetErrors: ["cluster_simplification"],
    sentence: "Please try the grilled breakfast platter." },
  { id: "cl-04", group: "consonant_clusters", phonemes: ["sk", "st", "sp"], targetErrors: ["cluster_simplification"],
    sentence: "The student skipped the spelling test." },
  { id: "cl-05", group: "consonant_clusters", phonemes: ["sm", "sn", "sw"], targetErrors: ["cluster_simplification"],
    sentence: "The small snail swam slowly in the swamp." },

  // ── Group 7: Short vowels /ɪ/ vs /iː/, /æ/ vs /e/ (tonal interference) ───
  { id: "vl-01", group: "vowel_length", phonemes: ["ɪ", "iː"], targetErrors: ["vowel_confusion", "vowel_length"],
    sentence: "He will sit in the seat and eat the meal." },
  { id: "vl-02", group: "vowel_length", phonemes: ["ɪ", "iː"], targetErrors: ["vowel_confusion", "vowel_length"],
    sentence: "The ship in the sheep field is cheap." },
  { id: "vl-03", group: "vowel_length", phonemes: ["æ", "e"], targetErrors: ["vowel_confusion"],
    sentence: "The man met his friend at the bank." },
  { id: "vl-04", group: "vowel_length", phonemes: ["æ", "e"], targetErrors: ["vowel_confusion"],
    sentence: "I had a bad bed and a flat head." },
  { id: "vl-05", group: "vowel_length", phonemes: ["ʌ", "ɒ"], targetErrors: ["vowel_confusion"],
    sentence: "My brother got a cup of hot coffee." },
];
