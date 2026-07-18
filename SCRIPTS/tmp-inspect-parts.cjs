const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db');
const rows = db.prepare(`
  SELECT p.id, p.data
  FROM part p
  WHERE p.session_id = ?
    AND json_extract(p.data, '$.type') IN ('tool', 'step-start', 'step-finish')
  ORDER BY p.time_created ASC
  LIMIT 5
`).all('ses_1161a41d0ffepxyVzjs98ME1fJ');
for (const r of rows) {
  console.log('PART', r.id, r.data.slice(0, 300));
  console.log('---');
}
db.close();
