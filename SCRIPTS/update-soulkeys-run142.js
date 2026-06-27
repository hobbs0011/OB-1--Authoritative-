const fs = require('fs');
const path = require('path');

const repo = 'D:\\OB-1-CANONICAL';
const run = process.argv[2] || '142';
const runPad = String(run).padStart(3, '0');
const rrlPath = path.join(repo, 'RRL', 'RRL-' + runPad + '.txt');
const dnaDir = path.join(repo, 'CANON', 'SOUL', 'EXTRACT');
const idxPath = path.join(repo, 'CANON', 'SOUL-KEYWORDS', 'inverted-index.json');
const kwPath = path.join(repo, 'CANON', 'SOUL-KEYWORDS', 'rfkw-run' + runPad + '.txt');

let text = fs.readFileSync(rrlPath, 'utf8');
try {
    const dnaPath = path.join(dnaDir, 'dna-run' + runPad + '.json');
    const dna = JSON.parse(fs.readFileSync(dnaPath, 'utf8'));
    if (Array.isArray(dna)) {
        text += '\n' + dna.map(r => r.text || '').join('\n');
    }
} catch (e) {}

const stopWords = new Set(['this','that','with','from','have','been','were','they','will','would','could','should','about','there','their','which','what','when','make','like','just','some','more','than','also','very','much','many','into','over','been','being','through','where','after','before','because','being','against','between','without','within','along','follow','coming','think','know','take','come','make','look','want','give','work','time','year','good','some','them','would','could','other','about','which','their','there','first','would','these','those','under','should','after','where','since','still','every','great','where','place','found','sound','below','seen','enough','while','both','show','those','taken','might','long','down','part','same','back','call','hand','high','last','next','left','turn','move','live','believe','happen','bring','write','provide','sit','stand','lose','pay','meet','include','continue','set','learn','change','lead','understand','watch','follow','stop','create','speak','read','allow','add','spend','grow','open','walk','win','offer','remember','love','consider','appear','buy','wait','serve','die','send','expect','build','stay','fall','cut','reach','kill','remain','suggest','raise','pass','sell','require','report','decide','pull','develop','return','explain','hope','describe','decide','share','provide','cover','fall','catch','draw','choose','wish','teach','test','wear','supply','shut','hold','push','close','deal','fill','break','support','record','cut','heat','watch','raise','reach','fly','land','cancel','graduate','enroll','register','complete','submit','assign','grade','assess','evaluate','review','approve','reject','confirm','notify','alert','remind','schedule','book','reserve','request','order','purchase','pay','charge','refund','invoice','receipt','transaction','payment','deposit','withdraw','transfer','balance','account','statement','ledger','audit','compliance','regulation','policy','contract','agreement','terms','conditions','liability','warranty','dispute','resolution','arbitration','mediation','escalate','appeal','petition','claim','evidence','document','certificate','attest','verify','validate','authenticate','authorize','deprecate','obsolete','retire','decommission','archive','purge','delete','destroy','shred','encrypt','decrypt','cipher','hash','salt','key','cert','token','session','cookie','cache','queue','buffer','stream','socket','pipe','channel','bandwidth','latency','throughput','capacity','quota','limit','threshold','rate','pace','burst','flow','routing','dispatch','deliver','notify','trigger','fire','emit','broadcast','cast','scatter','gather','collect','aggregate','summarize','compress','decompress','encode','decode','serialize','deserialize','parse','tokenize','lemmatize','stem','inflect','conjugate','decline','compare','diff','patch','merge','split','join','union','intersect','subtract','complement','normalize','denormalize','flatten','nest','wrap','unwrap','bundle','unbundle','package','container','image','snapshot','backup','restore','migrate','upgrade','downgrade','rollback','revert','reset','refresh','reboot','restart','shutdown','startup','initialize','configure','setup','install','uninstall','deploy','undeploy','provision','deprovision','allocate','deallocate','reserve','release','lock','unlock','acquire','surrender','claim','relinquish','assign','reassign','delegate','proxy','forward','redirect','relay','translate','transform','convert','adapt','evolve','iterate','increment','decrement','advance','retreat','proceed','abort','terminate','kill','cease','halt','pause','resume','continue','persist']);

const words = text.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]+/g, '')).filter(w => w.length > 4 && !stopWords.has(w));
const freq = {};
for (const w of words) { freq[w] = (freq[w] || 0) + 1; }
const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 30);

fs.writeFileSync(kwPath, sorted.map(([w,c]) => c + ' | ' + w).join('\n'), 'utf8');

const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
for (const [term, weight] of sorted) {
    const termLower = term.toLowerCase();
    if (!idx[termLower]) {
        idx[termLower] = [{
            term: termLower,
            weight: weight,
            runs: [parseInt(run)],
            count: 1,
            category: 'soul+key'
        }];
    } else {
        const existing = idx[termLower];
        const already = existing.some(e => e.run === parseInt(run));
        if (!already) {
            existing.push({
                term: termLower,
                weight: weight,
                runs: [parseInt(run)],
                count: existing.length + 1,
                category: 'soul+key'
            });
        }
    }
}

fs.writeFileSync(idxPath, JSON.stringify(idx, null, 2), 'utf8');
console.log('STAGE 6 OK SOULKEYS updated: ' + Object.keys(idx).length + ' terms');
