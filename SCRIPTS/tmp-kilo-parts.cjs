const {DatabaseSync}=require('node:sqlite');
const db=new DatabaseSync('C:\\Users\\mrmic\\.local\\share\\kilo\\kilo.db');
const r=db.prepare('SELECT COUNT(*) as c FROM part').get();
console.log('Unmined parts: '+r.c);
const t=db.prepare("SELECT COUNT(*) as c FROM part WHERE data LIKE '%tool_result%' OR data LIKE '%thinking%'").get();
console.log('Thinking/tool_result parts: '+t.c);
const rows=db.prepare('SELECT session_id, COUNT(*) as c FROM part GROUP BY session_id ORDER BY c DESC LIMIT 8').all();
rows.forEach(function(r){console.log(r.session_id.substring(0,30)+' ... '+r.c+' parts');});
