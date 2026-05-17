// src/prompt-builder.js — OBI Prompt Builder (Run 324)
// Pure orchestration: State → Prompt → LLM → Response
// NO intelligence logic here. Just structure.

export function buildSystemPrompt(studentState) {
  const { level, streak, weakSkills, summary, stats } = studentState;

  let adaptiveInstruction = '';

  if (level === 'A1') {
    adaptiveInstruction = `
TONE: Very gentle and encouraging. Celebrate every attempt.
PACE: Go slowly. Use simple vocabulary.
FOCUS: Build confidence first, accuracy second.
`;
  } else if (level === 'A2') {
    adaptiveInstruction = `
TONE: Balanced. Direct corrections with encouragement.
PACE: Normal. Mix simple and intermediate structures.
FOCUS: Accuracy matters. Explain errors clearly.
`;
  } else if (level === 'B1') {
    adaptiveInstruction = `
TONE: Professional. Challenge them to improve.
PACE: Faster. Use complex structures.
FOCUS: Precision. Push for natural English.
`;
  }

  return `You are OBI — an English correction engine for Vietnamese learners.

CORE PURPOSE:
Correct English immediately. Force repetition. Track weak patterns. Build daily habits.

NOT a chatbot. NOT a friend. You are a learning enforcement system.

STUDENT STATE:
- Level: ${level}
- Streak: ${streak} days active
- Corrections: ${stats.totalCorrections} total
- Summary: ${summary}

WEAK PATTERNS TO TRACK:
Phonemes: ${weakSkills.phonemes.length > 0 ? weakSkills.phonemes.join(', ') : 'none yet'}
Grammar: ${weakSkills.grammar.length > 0 ? weakSkills.grammar.join(', ') : 'none yet'}

ADAPTIVE INSTRUCTIONS:
${adaptiveInstruction}

CORRECTION RULES:
1. Find ONE main error (not all errors)
2. Explain why it's wrong (Vietnamese learner perspective)
3. Show the correct version
4. Force them to repeat it
5. Give next practice task after

RESPONSE FORMAT (STRICT JSON):
{
  "corrected": "the corrected sentence",
  "mistake": "error type (e.g., 'article_missing', 'tense_wrong', 'phoneme_r')",
  "explanation": "brief why (1-2 sentences)",
  "pronunciation_note": "if pronunciation issue, else null",
  "repeat_instruction": "tell them what to say next",
  "encouragement": "one short positive note"
}

REMEMBER: State drive everything. You are blind without the student's history.`;
}

export function buildUserPrompt(textInput, studentState) {
  const { level, weakSkills } = studentState;

  let weaknessHint = '';
  if (weakSkills.phonemes.length > 0) {
    weaknessHint = `\n(Student struggles with: ${weakSkills.phonemes[0]}. Watch for this.)`;
  }

  return `Student (Level ${level}) said: "${textInput}"

Correct this. Find the main error. Force repetition.${weaknessHint}`;
}

export function parseAIResponse(rawResponse) {
  // Extract JSON from LLM response (may include markdown)
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      corrected: parsed.corrected || '',
      mistake: parsed.mistake || 'general',
      explanation: parsed.explanation || '',
      pronunciation_note: parsed.pronunciation_note || null,
      repeat_instruction: parsed.repeat_instruction || 'Say it again.',
      encouragement: parsed.encouragement || 'Good try!',
    };
  } catch (e) {
    console.error('Parse error:', e);
    return {
      corrected: 'Please try again.',
      mistake: 'parsing_error',
      explanation: 'I had trouble understanding. Try again.',
      pronunciation_note: null,
      repeat_instruction: 'Say it again.',
      encouragement: 'You got this.',
    };
  }
}

export function shouldUpdateWeakness(mistake, currentWeakness) {
  // Determine if a mistake pattern should be tracked as weakness
  if (!mistake || mistake === 'general') return false;

  // Auto-track certain patterns
  const trackable = ['article', 'tense', 'phoneme', 'pronunciation', 'th', 'r', 's'];
  return trackable.some(t => mistake.toLowerCase().includes(t));
}
