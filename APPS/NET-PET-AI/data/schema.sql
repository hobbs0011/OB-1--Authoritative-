-- SQLite schema for localhost NET-PET-AI adapter
-- drizzle-orm SQLite dialect compatible

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS student_profiles (
  student_id TEXT PRIMARY KEY,
  name TEXT,
  mode TEXT DEFAULT 'free',
  level TEXT DEFAULT 'A1',
  streak INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  last_session_at INTEGER,
  world_model TEXT DEFAULT '{}',
  breakthroughs TEXT DEFAULT '[]',
  struggles TEXT DEFAULT '[]',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS srs_data (
  student_id TEXT NOT NULL,
  word TEXT NOT NULL,
  translation TEXT DEFAULT '',
  interval REAL DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  next_review INTEGER DEFAULT 0,
  last_grade INTEGER,
  source TEXT DEFAULT 'class_audio',
  first_seen INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  times_seen INTEGER DEFAULT 1,
  PRIMARY KEY (student_id, word)
);

CREATE TABLE IF NOT EXISTS vocab_list (
  student_id TEXT NOT NULL,
  word TEXT NOT NULL,
  meaning_vi TEXT DEFAULT '',
  source TEXT DEFAULT 'class_audio',
  ts INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  PRIMARY KEY (student_id, word)
);

CREATE TABLE IF NOT EXISTS soul_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  student_id TEXT DEFAULT 'sov100',
  byte_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_soul_events_session ON soul_events(session_id);
CREATE INDEX IF NOT EXISTS idx_soul_events_created ON soul_events(created_at);

CREATE TABLE IF NOT EXISTS chat_exchanges (
  exchange_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  mode TEXT DEFAULT 'free',
  turn_type TEXT DEFAULT 'user', -- user | assistant | system
  text TEXT DEFAULT '',
  sha256 TEXT DEFAULT '',
  source_session TEXT DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_chat_exchanges_student ON chat_exchanges(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_exchanges_session ON chat_exchanges(source_session);

CREATE TABLE IF NOT EXISTS ledger_entries (
  ledger_id TEXT PRIMARY KEY,
  wave INTEGER DEFAULT 0,
  entry_type TEXT DEFAULT 'VQ-NNN',
  title TEXT DEFAULT '',
  content TEXT DEFAULT '{}',
  source_file TEXT DEFAULT '',
  source_sha TEXT DEFAULT '',
  converted_by TEXT DEFAULT '',
  converted_at TEXT DEFAULT '',
  previous_hash TEXT DEFAULT '',
  merkle_root TEXT DEFAULT '',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_wave ON ledger_entries(wave);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_type ON ledger_entries(entry_type);

CREATE TABLE IF NOT EXISTS pets (
  pet_id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  name TEXT DEFAULT '',
  species TEXT DEFAULT '',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  state TEXT DEFAULT '{}',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_pets_student ON pets(student_id);
