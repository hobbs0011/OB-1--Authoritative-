const fs = require('fs');
const p = 'APPS/NET-PET-AI/src/index.js';

const raw = fs.readFileSync(p, 'utf8');
const lines = raw.split('\n');

// ── Cut the entire old Durable Objects block ─────────────────────────────────
const tail = lines.slice(3623);                            // keep line 3623 (blank before block) → remove 3624+
const keep = lines.slice(0, 3623);                         // everything before the block (3623 lines)

// ── Build final file ──────────────────────────────────────────────────────────
const exportBlock = [
  '',
  '// ═══════════════════════════════════════════════════════════════════════════════',
  '// RE-EXPORT BLOCK — Durable Object classes live in durable_objects.js',
  '// Parsed by wrangler 4.x in translated ESM bundle.',
  'export { LedgerDO, SessionDO, ProfileDO, PetDO, CommandDO, MemoryDO }',
];

const finalLines = [...keep, ...exportBlock];

fs.writeFileSync(p, finalLines.join('\n'), 'utf8');
console.log('PATCHED:', { kept: keep.length, removed: tail.length, total: finalLines.length });
console.log('Last 10 lines:');
finalLines.slice(-10).forEach(l => console.log(l));
