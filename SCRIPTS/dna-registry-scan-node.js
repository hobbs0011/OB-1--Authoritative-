const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

async function main() {
    const run = parseInt(process.argv[2]) || 142;
    const runPad = String(run).padStart(3, '0');
    const repo = 'D:\\OB-1-CANONICAL';
    const outPath = path.join(repo, 'CANON', 'REGISTRY', `dna-registry-run${runPad}.json`);
    const idxPath = path.join(repo, 'CANON', 'SOUL-KEYWORDS', 'inverted-index.json');

    function classifyDoc(p, h) {
        p = p.toLowerCase();
        h = h.toLowerCase();
        if (p.includes('command')) return 'COMMAND';
        if (p.includes('reincarnat')) return 'REINCARNATION';
        if (p.includes('pheromone') || p.includes('phetrail')) return 'PHEROMONE';
        if (p.includes('phoenix') || p.includes('execute.js') || p.includes('src\\index')) return 'PHOENIX-ARCHITECTI';
        if (p.includes('ledger') || p.includes('hl-')) return 'LEDGER';
        if (p.includes('mandatory-reads')) return 'MANDATORY-READS';
        if (p.includes('cold-start-boot')) return 'BOOT';
        if (p.includes('bible')) return 'BIBLE';
        if (p.includes('soul')) return 'SOUL';
        if (p.includes('dna')) return 'DNA';
        if (p.includes('starmap')) return 'STARMAP';
        if (p.includes('keyword') || p.includes('soul-key') || p.includes('rfkw')) return 'SOULKEYS';
        if (p.includes('pipeline')) return 'PIPELINE';
        if (p.includes('registry')) return 'REGISTRY';
        if (p.includes('research')) return 'RESEARCH';
        if (p.includes('operations')) return 'OPERATIONS';
        if (p.includes('student-portal')) return 'STUDENT-PORTAL';
        if (p.includes('deepgram')) return 'DEEPGRAM-RESEARCH';
        if (p.includes('train')) return 'TRAIN-67';
        if (p.includes('marketing')) return 'MARKETING';
        if (p.includes('vault')) return 'VAULT';
        if (p.includes('proof')) return 'PROOF';
        if (p.includes('reincarnation-log')) return 'REINCARNATION-LOG';
        if (h.includes('reincarnat') || h.includes('death') || h.includes('rise')) return 'REINCARNATION';
        if (h.includes('mandatory') || h.includes('dispatch')) return 'MANDATORY-READS';
        if (h.includes('registry') || h.includes('art-arsenal')) return 'REGISTRY';
        if (h.includes('soul') || h.includes('sovereign')) return 'SOUL';
        if (h.includes('starmap') || h.includes('pointer')) return 'STARMAP';
        if (h.includes('keyword') || h.includes('freq')) return 'SOULKEYS';
        if (h.includes('pipeline') || h.includes('stage')) return 'PIPELINE';
        if (h.includes('ledger') || h.includes('merkle')) return 'LEDGER';
        if (h.includes('pheromone') || h.includes('trail')) return 'PHEROMONE';
        if (h.includes('bible') || h.includes('sovereign')) return 'BIBLE';
        return 'UNCLASSIFIED';
    }

    const stageMap = {
        'COMMAND': ['DEATH','RISE','PHE','REGISTRY'],
        'REINCARNATION': ['RRL','DEATH','RISE'],
        'PHEROMONE': ['PHE'],
        'LEDGER': ['LEDGER'],
        'HEAVY-LEDGER': ['LEDGER','PIPELINE'],
        'MANDATORY-READS': ['ALL'],
        'BOOT': ['BOOT','RISE'],
        'BIBLE': ['SOUL','DNA'],
        'SOUL': ['SOUL'],
        'DNA': ['DNA'],
        'STARMAP': ['STARMAP'],
        'SOULKEYS': ['SOULKEYS'],
        'PIPELINE': ['PIPELINE'],
        'REGISTRY': ['REGISTRY','RISE','DEATH'],
        'RESEARCH': ['DNA','ALL'],
        'OPERATIONS': ['DEATH'],
        'STUDENT-PORTAL': ['ALL'],
        'DEEPGRAM-RESEARCH': ['DNA','RESEARCH'],
        'TRAIN-67': ['ALL'],
        'MARKETING': ['ALL'],
        'PHOENIX-ARCHITECTI': ['DNA','RESEARCH','ALL'],
        'VAULT': ['SOUL','DNA'],
        'PROOF': ['SOUL','DNA'],
        'REINCARNATION-LOG': ['REINCARNATION'],
        'ASSET-MANIFEST': ['TRAIN-67','ALL'],
        'UNCLASSIFIED': ['UNKNOWN']
    };

    const scanRoots = [
        path.join(repo, 'CANON'),
        path.join(repo, 'OPERATIONS'),
        path.join(repo, 'CANON', 'SYSTEM'),
        path.join(repo, 'CANON', 'RESEARCH'),
        path.join(repo, '.kilo', 'command'),
        path.join(repo, '.claude', 'commands'),
        path.join(repo, 'CANON', 'SOUL'),
        path.join(repo, 'CANON', 'TRAIN-67'),
        path.join(repo, 'CANON', 'MARKETING'),
        path.join(repo, 'APPS', 'PHOENIX-ARCHITECTI'),
        path.join(repo, 'CANON', 'PIPELINE'),
        path.join(repo, 'CANON', 'PHEROMONES'),
        path.join(repo, 'CANON', 'HEAVY-LEDGER'),
        path.join(repo, 'CANON', 'LEDGER'),
        path.join(repo, 'CANON', 'VAULT'),
        path.join(repo, 'CANON', 'REGISTRY'),
        path.join(repo, 'CANON', 'SOUL-KEYWORDS'),
        path.join(repo, 'RRL')
    ];

    const excludePatterns = [
        'node_modules', '\\.git\\', 'ARCHIVE', 'backup', 'PROOFS-CHAT',
        'SOUL-DNA-BIBLE-RECAPTURE', '\\.kilo\\worktrees', 'SOUL-SEGMENTS',
        'SOUL-LOG-VERBATIM', 'CASESTUDY\\registries', 'PROOFS-KEY-SOUL',
        'RRL\\DNA-LOG'
    ];

    const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));

    function shouldSkip(relPath) {
        return excludePatterns.some(p => relPath.includes(p));
    }

    function getRegId(rel, size, mtime) {
        const input = rel + '|' + size + '|' + mtime;
        return 'REG-' + crypto.createHash('sha256')
            .update(Buffer.from(input, 'utf8'))
            .digest('hex').substring(0, 8).toUpperCase();
    }

    async function* walk(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    yield* walk(full);
                } else if (entry.name.endsWith('.md')) {
                    yield full;
                }
            }
        } catch (e) {
            // skip inaccessible dirs
        }
    }

    const entries = [];
    let skipped = 0;
    let scanned = 0;

    for (const root of scanRoots) {
        if (!fs.existsSync(root)) continue;
        for await (const filePath of walk(root)) {
            scanned++;
            const rel = path.relative(repo, filePath).replace(/\//g, '\\');
            if (shouldSkip(rel)) { skipped++; continue; }
            try {
                const stat = fs.statSync(filePath);
                if (stat.size <= 50) { skipped++; continue; }
                let content = fs.readFileSync(filePath, 'utf8');
                if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
                const first200 = content.substring(0, 200).replace(/[\n\r]/g, ' ');
                const shaPrefix = crypto.createHash('sha256')
                    .update(fs.readFileSync(filePath))
                    .digest('hex').substring(0, 12);
                const regId = getRegId(rel, stat.size, stat.mtimeMs);

                const matchedKeywords = [];
                const keywords = Object.keys(idx);
                for (const kw of keywords) {
                    if (content.includes(kw)) {
                        matchedKeywords.push(kw);
                    }
                }

                const category = classifyDoc(rel, first200);
                const stage = stageMap[category] || ['UNKNOWN'];

                entries.push({
                    reg_id: regId,
                    path: rel,
                    size_bytes: stat.size,
                    last_modified: new Date(stat.mtime).toISOString(),
                    sha256_prefix: shaPrefix,
                    category: category,
                    first_tokens: first200,
                    keyword_hits: matchedKeywords.length,
                    top_keywords: matchedKeywords
                        .sort((a, b) => (idx[b]?.weight || 0) - (idx[a]?.weight || 0))
                        .slice(0, 10),
                    linked_stages: stage
                });
            } catch (e) {
                skipped++;
            }
        }
    }

    const byCat = {};
    for (const e of entries) {
        byCat[e.category] = (byCat[e.category] || 0) + 1;
    }

    const digest = {
        generated_at: new Date().toISOString(),
        total_entries: entries.length,
        scanned,
        skipped,
        by_category: Object.entries(byCat).map(([k, v]) => `${k}=${v}`).sort().join(', '),
        entry_count_by_category: Object.entries(byCat)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => a.category.localeCompare(b.category)),
        paths: entries.map(e => e.path).sort(),
        all_entries: entries
    };

    fs.writeFileSync(outPath, JSON.stringify(digest, null, 2), 'utf8');
    console.log('dnaREGISTRY WRITTEN:', outPath);
    console.log('ENTRIES=' + entries.length + ' SCANNED=' + scanned + ' SKIPPED=' + skipped);
    for (const [cat, count] of Object.entries(byCat).sort()) {
        console.log('  ' + cat + '=' + count);
    }
}

main().catch(e => console.error('Scanner failed:', e));
