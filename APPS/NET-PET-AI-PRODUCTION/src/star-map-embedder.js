// src/star-map-embedder.js — Skeleton Star Map Layer
// Run 324: Routing index generator (NOT a database — a memory navigation system)
// Purpose: Given student input, output the relevant memory slice pointers (fast routing)

export const SKILL_TAGS = {
  // Phonemes (42 Jolly Phonics sounds)
  PHONEME_TH: '/θ/',
  PHONEME_DH: '/ð/',
  PHONEME_NG: '/ŋ/',
  PHONEME_SH: '/ʃ/',
  PHONEME_ZH: '/ʒ/',
  PHONEME_CH: '/tʃ/',
  PHONEME_J: '/dʒ/',
  PHONEME_W: '/w/',
  PHONEME_R: '/r/',
  PHONEME_Y: '/j/',

  // Grammar patterns (Vietnamese learner common mistakes)
  GRAMMAR_PAST_TENSE: 'past_tense',
  GRAMMAR_ARTICLES: 'articles',
  GRAMMAR_PERFECT: 'perfect_aspect',
  GRAMMAR_MODAL: 'modal_verbs',
  GRAMMAR_WORD_ORDER: 'word_order',
  GRAMMAR_PLURALS: 'plurals',

  // Behavioral patterns
  BEHAVIOR_SILENT: 'freeze_response',
  BEHAVIOR_REPETITION_RESPONSIVE: 'drill_responsive',
  BEHAVIOR_CHALLENGE_SEEKING: 'wants_harder',
  BEHAVIOR_CONFIDENCE_LOW: 'low_confidence',
  BEHAVIOR_STREAK_ACTIVE: 'daily_active',
};

export const STRATEGY_MAP = {
  '/θ/': { method: 'repetition', template: 'drill_01_theta', reps: 3 },
  'past_tense': { method: 'minimal_pairs', template: 'drill_02_past', reps: 2 },
  'articles': { method: 'contrast', template: 'drill_03_articles', reps: 3 },
  'pronunciation': { method: 'minimal_pairs', template: 'drill_04_phoneme', reps: 2 },
  'freeze_response': { method: 'permission', template: 'permission_01', reps: 1 },
  'starts_session': { method: 'recap', template: 'recap_01', reps: 1 },
};

// Simple embedding: convert input to weighted skill vector
export function generateEmbedding(input) {
  const embedding = {};

  // Phoneme detection
  if (input.match(/th[aeiou]|the|think|three/i)) {
    embedding[SKILL_TAGS.PHONEME_TH] = 0.95;
  }
  if (input.match(/[rd]h[aeiou]/i)) {
    embedding[SKILL_TAGS.PHONEME_DH] = 0.85;
  }
  if (input.match(/ng\b|ing\b|song|ring/i)) {
    embedding[SKILL_TAGS.PHONEME_NG] = 0.90;
  }

  // Grammar detection
  if (input.match(/was|were|did|had/i)) {
    embedding[SKILL_TAGS.GRAMMAR_PAST_TENSE] = 0.88;
  }
  if (input.match(/a\s|an\s|the\s/i)) {
    embedding[SKILL_TAGS.GRAMMAR_ARTICLES] = 0.80;
  }

  // Behavioral signals
  if (input.trim().length === 0) {
    embedding[SKILL_TAGS.BEHAVIOR_SILENT] = 1.0;
  }

  return embedding;
}

// Router: given embedding, find top K relevant skills
export function routeToSkills(embedding, topK = 3) {
  const sorted = Object.entries(embedding)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([skill, confidence]) => ({
      skill,
      confidence,
      strategy: STRATEGY_MAP[skill] || STRATEGY_MAP.pronunciation,
    }));

  return sorted;
}

// Build routing output: what memory to fetch
export function buildStarMapRoute(studentState, inputEmbedding) {
  const skills = routeToSkills(inputEmbedding, 3);

  // Combine with student state for urgency scoring
  const primarySkill = skills[0]?.skill || 'starts_session';
  const strategy = STRATEGY_MAP[primarySkill] || STRATEGY_MAP.starts_session;
  const urgency =
    skills[0]?.confidence > 0.9 ? 'high' :
    skills[0]?.confidence > 0.7 ? 'medium' : 'low';

  // Determine memory slice IDs to fetch from Heavy Ledger
  const memoryRefs = [];
  if (studentState.previousSessionIds) {
    memoryRefs.push(...studentState.previousSessionIds.slice(-3)); // last 3 sessions
  }
  memoryRefs.push(`skill_${primarySkill}`); // skill template reference

  return {
    primarySkill,
    strategy,
    urgency,
    memoryRefs,
    topSkills: skills,
  };
}

// Export as class for instantiation if needed
export class SkeletonStarMap {
  constructor(studentState) {
    this.state = studentState;
    this.nodes = this.buildNodes();
  }

  buildNodes() {
    // Initialize star map nodes from student state
    const nodes = [];

    // Add skill nodes
    if (this.state.weakSkills?.phonemes) {
      this.state.weakSkills.phonemes.forEach(ph => {
        nodes.push({
          id: `phoneme_${ph}`,
          skillTag: ph,
          confidence: 0.5,
          strategy: STRATEGY_MAP[ph]?.method || 'repetition',
          memoryRefs: [],
          embedding: [],
          lastUpdated: Date.now(),
        });
      });
    }

    // Add grammar nodes
    if (this.state.weakSkills?.grammar) {
      this.state.weakSkills.grammar.forEach(gr => {
        nodes.push({
          id: `grammar_${gr}`,
          skillTag: gr,
          confidence: 0.5,
          strategy: STRATEGY_MAP[gr]?.method || 'minimal_pairs',
          memoryRefs: [],
          embedding: [],
          lastUpdated: Date.now(),
        });
      });
    }

    return nodes;
  }

  route(inputEmbedding) {
    return buildStarMapRoute(this.state, inputEmbedding);
  }
}
