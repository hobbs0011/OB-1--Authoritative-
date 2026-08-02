// src/vocab-srs.js — SM-2 Spaced Repetition System for NET vocabulary
// grade 0-2 = forgot, grade 3-5 = remembered (Supermemo-2 standard)

export function computeNextReview(word, grade) {
  let interval     = word.interval     ?? 1;
  let repetitions  = word.repetitions  ?? 0;
  let ease_factor  = word.ease_factor  ?? 2.5;

  if (grade < 3) {
    interval    = 1;
    repetitions = 0;
  } else {
    if      (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * ease_factor);
    ease_factor = Math.max(1.3, ease_factor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    repetitions++;
  }

  return {
    interval,
    repetitions,
    ease_factor,
    next_review: Date.now() + interval * 86400000,
    last_grade:  grade,
  };
}

export function isDue(word) {
  return (word.next_review ?? 0) <= Date.now();
}

// Injects due-vocab list into OBI system prompt
export function buildVocabContext(dueWords) {
  if (!dueWords || dueWords.length === 0) return "";
  const list = dueWords.slice(0, 5)
    .map(w => `"${w.word}"${w.translation ? ` (${w.translation})` : ""}`)
    .join(", ");
  return `\nVOCAB DUE TODAY (${dueWords.length} word${dueWords.length === 1 ? "" : "s"}): ${list}. Weave these into your responses — ask the student to use each one in a real sentence today.`;
}

export function generateVocabId(studentId, word) {
  return `${studentId}:${word.toLowerCase().trim().replace(/\s+/g, "_")}`;
}
