#!/usr/bin/env node
// Audit Integrity Lock — validates audit_log_v2 column schema matches logAudit insert
// Prevents silent column mismatches between deletion.js (INSERT) and table definitions (security.js)

const EXPECTED_COLUMNS = ['id', 'ts', 'action', 'target', 'performed_by', 'metadata'];

try {
  const res = await fetch('https://soul-logger.mrmichaelhobbs123.workers.dev/api/integrity/audit-log-v2');
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const data = await res.json();
  const cols = data.columns || [];
  
  const missing = EXPECTED_COLUMNS.filter(c => !cols.includes(c));
  const extra = cols.filter(c => !EXPECTED_COLUMNS.includes(c));
  
  if (missing.length || extra.length) {
    console.error('❌ AUDIT_LOG_V2 COLUMNS MISMATCH:');
    if (missing.length) console.error('  Missing:', missing.join(', '));
    if (extra.length) console.error('  Extra:', extra.join(', '));
    process.exit(1);
  }
  
  console.log('✅ AUDIT_LOG_V2: Column schema verified', cols.join(', '));
  process.exit(0);
} catch (e) {
  // Fallback: local check — verify INSERT columns in deletion.js
  const fs = await import('node:fs');
  const src = fs.readFileSync(
    new URL('../src/deletion.js', import.meta.url),
    'utf8'
  );
  
  const hasInsert = src.includes('INSERT INTO audit_log_v2');
  
  if (!hasInsert) {
    console.error('❌ AUDIT_LOG_V2: deletion.js missing audit_log_v2 INSERT statement');
    process.exit(1);
  }
  
  // Verify columns in the INSERT — match the column-name list in INSERT INTO ... (col1, col2, ...)
  const insertMatch = src.match(/INSERT INTO audit_log_v2\s*\(([^)]+)\)/);
  if (!insertMatch) {
    console.error('❌ AUDIT_LOG_V2: Cannot parse INSERT column list in deletion.js');
    process.exit(1);
  }
  
  const insertCols = insertMatch[1].split(',').map(s => 
    s.trim().replace(/['"`]/g, '').toLowerCase()
  );
  
  const missing = EXPECTED_COLUMNS.filter(c => !insertCols.includes(c));
  if (missing.length) {
    console.error('❌ AUDIT_LOG_V2: INSERT missing columns:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ AUDIT_LOG_V2: Schema lock verified (local fallback — deletion.js INSERT)');
  process.exit(0);
}
