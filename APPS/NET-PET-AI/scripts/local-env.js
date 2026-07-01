const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './data/net-pet-ai.db';
const KV_PATH = process.env.KV_STORE_PATH || './data/kv-store.json';

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(path.dirname(KV_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const kv = new Map();
if (fs.existsSync(KV_PATH)) {
  try {
    const raw = JSON.parse(fs.readFileSync(KV_PATH, 'utf8'));
    for (const [k, v] of Object.entries(raw)) { kv.set(k, v); }
  } catch {}
}
setInterval(() => {
  const obj = Object.fromEntries(kv);
  fs.writeFileSync(KV_PATH, JSON.stringify(obj), 'utf8');
}, 30000);

module.exports = {
  SOUL_DB: {
    prepare: (sql) => db.prepare(sql),
    exec: (sql) => db.exec(sql),
    select: (sql, params) => db.prepare(sql).all(...params),
    insert: (sql, params) => db.prepare(sql).run(...params),
  },
  NET_PET_KV: {
    get: (k) => kv.get(k) || null,
    put: (k, v) => { kv.set(k, v); return true; },
    delete: (k) => { kv.delete(k); return true; },
    list: (prefix) => Array.from(kv.keys()).filter((k) => k.startsWith(prefix || '')),
  },
  PETS: class PetDO { constructor(id) { this.id = id; } async fetch() { return { id: this.id, state: {} }; } async storage() { return { get: () => null, put: () => {} }; } },
  LEDGER: class LedgerDO { constructor(id) { this.id = id; } async fetch() { return { id: this.id, state: {} }; } async storage() { return { get: () => null, put: () => {} }; } },
  MEMORY: class MemoryDO { constructor(id) { this.id = id; } async fetch() { return { id: this.id, state: {} }; } async storage() { return { get: () => null, put: () => {} }; } },
  COMMANDS: class CommandDO { constructor(id) { this.id = id; } async fetch() { return { id: this.id, state: {} }; } async storage() { return { get: () => null, put: () => {} }; } },
  ASSETS: { directory: './public', binding: 'ASSETS' },
  caches: { default: { async match() { return null; }, async put() { return undefined; }, async delete() { return false; } } },
};
