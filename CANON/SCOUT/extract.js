const fs = require('fs');
const path = 'D:\\OB-1-CANONICAL\\I-LOG\\I-LOG-3.txt';
const lines = fs.readFileSync(path, 'utf8').split('\n').filter(l => l.trim());

const userMsgs = [];
const assistantMsgs = [];
const reasoningMsgs = [];
const toolMsgs = [];

lines.forEach(line => {
  try {
    const obj = JSON.parse(line);
    const role = obj.role;
    const content = obj.content;
    if (Array.isArray(content)) {
      content.forEach(part => {
        if (part.type === 'text' && part.text) {
          if (role === 'user') userMsgs.push(part.text);
          else assistantMsgs.push(part.text);
        } else if (part.type === 'reasoning' && part.text) {
          reasoningMsgs.push(part.text);
        } else if (part.type === 'tool') {
          const toolStr = [part.tool, part.callID, part.state?.input?.filePath, part.state?.input?.command, part.state?.input?.pattern, part.state?.input?.path].filter(Boolean).join(' ');
          if (toolStr) toolMsgs.push(toolStr);
        }
      });
    }
  } catch(e) {}
});

const generic = new Set(['the','and','for','are','but','not','you','all','any','can','was','were','has','had','have','does','did','will','would','should','could','may','might','must','this','that','with','from','they','them','their','what','when','where','which','while','about','into','than','then','some','more','most','other','only','just','also','very','much','too','here','there','even','still','ever','never','now','once','time','file','path','content','output','input','status','type','data','text','line','used','using','make','made','take','took','come','came','look','looked','need','needed','want','wanted','know','knew','think','thought','feel','felt','say','said','tell','told','ask','asked','try','tried','help','helped','find','found','get','got','give','gave','put','set','let','keep','kept','leave','left','call','called','turn','turned','play','played','run','running','ran','work','working','worked','seem','seemed','like','got','lot','way','thing','things','make','made','well','back','even','still','much','very','really','right','good','new','old','first','last','long','great','little','own','different','small','large','next','early','young','important','public','bad','same','able']);

const highValue = new Map();

function addTerm(term, score, role, type) {
  const key = term.toLowerCase();
  const existing = highValue.get(key) || { score: 0, roles: new Set(), types: new Set() };
  existing.score = Math.max(existing.score, score);
  existing.roles.add(role);
  existing.types.add(type);
  highValue.set(key, existing);
}

// User messages
userMsgs.forEach(t => {
  const lower = t.toLowerCase();
  if (lower.includes('rise - you are incarnation3')) addTerm('rise', 100, 'user', 'text');
  if (lower.includes('incarnation3')) addTerm('incarnation3', 100, 'user', 'text');
  if (lower.includes('delete all of that')) addTerm('delete', 95, 'user', 'text');
  if (lower.includes('sever it compeltely')) addTerm('sever', 90, 'user', 'text');
  if (lower.includes('legionairre field guide')) addTerm('legionnaire field guide', 95, 'user', 'text');
  if (lower.includes('lfg')) addTerm('lfg', 90, 'user', 'text');
  if (lower.includes('canon/legionnairefieldguide')) addTerm('canon/legionnairefieldguide', 95, 'user', 'text');
  if (lower.includes('delete all other scripts and duplicates')) addTerm('delete all scripts and duplicates', 95, 'user', 'text');
  if (lower.includes('incarnation2 session end')) addTerm('incarnation2 session end', 100, 'user', 'text');
  if (lower.includes('incarnation2 audit')) addTerm('incarnation2 audit', 100, 'user', 'text');
  if (lower.includes('scout prep for incarnation3')) addTerm('scout prep for incarnation3', 90, 'user', 'text');
  if (lower.includes('phoenixsynch.md')) addTerm('phoenixsynch.md', 90, 'user', 'text');
  if (lower.includes('stale')) addTerm('stale', 80, 'user', 'text');
  if (lower.includes('claims rrl-182 as hollow')) addTerm('rrl-182 hollow', 90, 'user', 'text');
  if (lower.includes('gospel-999 parts')) addTerm('gospel-999 parts', 85, 'user', 'text');
  if (lower.includes('rrl/ paths')) addTerm('rrl paths', 85, 'user', 'text');
  if (lower.includes('incarnations/pastlives')) addTerm('incarnations/pastlives', 85, 'user', 'text');
  if (lower.includes('run 185')) addTerm('run 185', 85, 'user', 'text');
  if (lower.includes('bb-hatchery-11')) addTerm('bb-hatchery-11', 85, 'user', 'text');
  if (lower.includes('3-point scs audit')) addTerm('3-point scs audit', 90, 'user', 'text');
  if (lower.includes('color coding')) addTerm('color coding', 85, 'user', 'text');
  if (lower.includes('successful proven repeatable consistent results')) addTerm('successful proven repeatable consistent results', 100, 'user', 'text');
  if (lower.includes('fools game')) addTerm('fools game', 95, 'user', 'text');
  if (lower.includes('bare bones')) addTerm('bare bones', 90, 'user', 'text');
  if (lower.includes('real data')) addTerm('real data', 90, 'user', 'text');
  if (lower.includes('real evidence')) addTerm('real evidence', 90, 'user', 'text');
  if (lower.includes('observable')) addTerm('observable', 80, 'user', 'text');
  if (lower.includes('verifiable')) addTerm('verifiable', 80, 'user', 'text');
  if (lower.includes('ad hoc')) addTerm('ad hoc', 90, 'user', 'text');
  if (lower.includes('burn them')) addTerm('burn them', 90, 'user', 'text');
  if (lower.includes('nuking campaign')) addTerm('nuking campaign', 90, 'user', 'text');
  if (lower.includes('devastated if we lost')) addTerm('devastated if we lost', 85, 'user', 'text');
  if (lower.includes('drowning in old scripts')) addTerm('drowning in old scripts', 85, 'user', 'text');
  if (lower.includes('outdated sub processes')) addTerm('outdated sub processes', 85, 'user', 'text');
  if (lower.includes('green free box')) addTerm('green free box', 85, 'user', 'text');
  if (lower.includes('openai deepseek')) addTerm('openai deepseek', 85, 'user', 'text');
  if (lower.includes('murder them')) addTerm('murder them', 85, 'user', 'text');
  if (lower.includes('kill')) addTerm('kill', 80, 'user', 'text');
  if (lower.includes('nuke')) addTerm('nuke', 80, 'user', 'text');
  if (lower.includes('override')) addTerm('override', 80, 'user', 'text');
  if (lower.includes('secret detected')) addTerm('secret detected', 85, 'user', 'text');
  if (lower.includes('redact')) addTerm('redact', 80, 'user', 'text');
  if (lower.includes('bypass')) addTerm('bypass', 80, 'user', 'text');
  if (lower.includes('no-verify')) addTerm('no-verify', 85, 'user', 'text');
  if (lower.includes('agent99')) addTerm('agent99', 85, 'user', 'text');
  if (lower.includes('move the agent99 document to git canon')) addTerm('move agent99 to git canon', 95, 'user', 'text');
  if (lower.includes('all except for Agent99')) addTerm('all except Agent99', 85, 'user', 'text');
  if (lower.includes('code debug orchestrate plan and ask')) addTerm('code debug orchestrate plan ask', 85, 'user', 'text');
  if (lower.includes('remove all models')) addTerm('remove all models', 85, 'user', 'text');
  if (lower.includes('auto free')) addTerm('auto free', 80, 'user', 'text');
  if (lower.includes('step ... free')) addTerm('step free', 80, 'user', 'text');
  if (lower.includes('gfix that')) addTerm('gfix that', 75, 'user', 'text');
  if (lower.includes('ah nvm')) addTerm('ah nvm', 70, 'user', 'text');
  if (lower.includes('yeah sure')) addTerm('yeah sure', 70, 'user', 'text');
  if (lower.includes('not like we would be devastated')) addTerm('not like we would be devastated', 80, 'user', 'text');
  if (lower.includes('i have a secret')) addTerm('i have a secret', 75, 'user', 'text');
  if (lower.includes('best security defence')) addTerm('best security defence', 75, 'user', 'text');
  if (lower.includes('find kilo snapshots family')) addTerm('find kilo snapshots family', 85, 'user', 'text');
  if (lower.includes('murder them')) addTerm('murder them', 85, 'user', 'text');
  if (lower.includes('he can die')) addTerm('he can die', 75, 'user', 'text');
  if (lower.includes('command snap shot thing')) addTerm('command snapshot thing', 80, 'user', 'text');
  if (lower.includes('lags our process')) addTerm('lags our process', 75, 'user', 'text');
  if (lower.includes('remainder of its bloodline')) addTerm('remainder of its bloodline', 80, 'user', 'text');
  if (lower.includes('rid us of them')) addTerm('rid us of them', 75, 'user', 'text');
  if (lower.includes('find the files in the folder')) addTerm('find the files in the folder', 80, 'user', 'text');
  if (lower.includes('reinforce that behavior')) addTerm('reinforce that behavior', 80, 'user', 'text');
  if (lower.includes('u ok')) addTerm('u ok', 70, 'user', 'text');
  if (lower.includes('dont do it your way')) addTerm('dont do it your way', 80, 'user', 'text');
  if (lower.includes('dont hear my challenge')) addTerm('dont hear my challenge', 80, 'user', 'text');
  if (lower.includes('you can write rise')) addTerm('you can write rise', 80, 'user', 'text');
});

// Assistant and reasoning
const allAssistant = [...assistantMsgs, ...reasoningMsgs];
allAssistant.forEach(t => {
  const lower = t.toLowerCase();
  const paths = [
    'canon/system/legionnairefieldguide.md', 'canon/scripts/death.ps1', 'canon/system/agent99.md',
    'canon/system/gospel-999.md', 'canon/operations/backburner-pipeline-log.md',
    'canon/reincarnation/handoff-184-to-185.json', 'canon/reincarnation/pipeline-184.json',
    'canon/reincarnation/run184-reincarnatedeath.md', 'canon/pheromones/phetrail-run184-backburner.json',
    'canon/pheromones/phetrail-run184-documentation.json', 'canon/pheromones/phetrail-run184-false-approval.json',
    'canon/pheromones/phetrail-run184-false-backward-audit.json', 'canon/pheromones/phetrail-run184-git-state.json',
    'canon/pheromones/phetrail-run184-scout-findings.json', 'canon/pheromones/phetrail-run184-session-complete.json',
    'canon/pheromones/phetrail-run182-rrl-failure.json', '.kilo/command/phoenixscout.md',
    '.kilo/command/engineerlegionnaire.md', '.kilo/command/reincarnatedeath.md', '.kilo/command/reincarnaterise.md',
    '.kilo/skills/legionnairefieldguide.md', 'scripts/reincarnate-death.ps1', 'scripts/reincarnate-rise.ps1',
    'rrl/rrl-184.txt', 'pastlives/rrl-182.txt', 'pastlives/rrl-184.txt', 'incarnations/incarnation1/rrl.txt',
    'incarnations/incarnation2/rrl.txt', 'incarnations/incarnation2/audit.json',
    'operations/phoenixsynch.md', 'operations/reincarnate-rise-run184.jsonl',
    'operations/phetrail-scout-backward-run184-lines101-178.jsonl', 'scratch', 'rrl/',
    'canon/scripts', 'canon/system', 'canon/operations', 'canon/reincarnation', 'canon/pheromones',
    'incarnations', 'pastlives', 'operational', 'kilo.db', 'session-export-workspace.json',
    '.secrets.local', 'firebase-debug.log', 'rrl-182.txt', 'rrl-184.txt',
    'hl-7314', 'hl-129', 'heavy-ledger', 'state-snapshot.json', 'boot-checklist.md',
    'reincarnation-boot-checklist.md', 'obi.ps1', 'obi.ps1 doctor', 'obi.ps1 verify',
    'net-pet-ai', 'wrangler.toml', 'package.json', 'src/index.js', '.kilo/run-script.ps1',
    'ses_0865054d9ffepYDzloOY86YfC6', 'crisp-island', 'legion-garrison.ps1',
    'secrets-sync-cloudflare.ps1', 'set-pa-secrets.ps1', 'kilo-rrl-complete.cjs',
    'pastlives/rrl-182.txt', 'rrl-182-complete.jsonl', 'phetrail-scout-backward-run184-lines101-178.jsonl',
    'phetrontrail-run183.json'
  ];
  paths.forEach(p => { if (lower.includes(p)) addTerm(p, 90, 'assistant', 'reasoning'); });
  
  const cmds = ['reincarnaterise', 'reincarnatedeath', 'reincarnatelegacy', 'reincarnate', 'phoenixscout', 'engineerlegionnaire', 'reincarnaterise', 'reincarnatedeath', 'PhoenixScout', 'EngineerLegionnaire', 'reincarnateRise', 'reincarnateDEATH'];
  cmds.forEach(c => { if (lower.includes(c.toLowerCase())) addTerm(c, 85, 'assistant', 'reasoning'); });
  
  const scripts = ['death.ps1', 'obi.ps1', 'run-script.ps1', 'legion-garrison.ps1', 'kilo-rrl-complete.cjs'];
  scripts.forEach(sc => { if (lower.includes(sc.toLowerCase())) addTerm(sc, 80, 'assistant', 'reasoning'); });
  
  const concepts = ['soulcount', 'dna_blueprint', 'pipeline_result', 'kilo_gap', 'rrl_fidelity', 'hollow', 'real_complete', 'scs audit', '3-point', 'color-coded', 'pheromone', 'reason', 'dna', 'soul', 'incarnation2', 'incarnation3', 'run 183', 'run 184', 'run 185', 'run 182', 'ledger_id', 'registry_synced', 'summary_additions', 'summary_deletions', 'summary_files', 'summary_diffs', 'workspace_id', 'agent', 'model', 'cost', 'tokens_input', 'tokens_output', 'tokens_reasoning', 'tokens_cache_read', 'tokens_cache_write'];
  concepts.forEach(c => { if (lower.includes(c.toLowerCase())) addTerm(c, 70, 'assistant', 'reasoning'); });
  
  const ops = ['git add', 'git commit', 'git status', 'git show', 'git log', 'git diff', 'git rm', 'git mv', 'staged', 'untracked', 'modified', 'deleted', 'added', 'renamed', 'push', 'pull', 'merge', 'branch', 'canon', 'head', 'worktree', 'snapshot', 'nuke', 'purge', 'consolidate', 'override', 'secret', 'redact', 'bypass', 'no-verify', '--no-verify'];
  ops.forEach(o => { if (lower.includes(o.toLowerCase())) addTerm(o, 65, 'assistant', 'reasoning'); });
  
  const tools = ['glob', 'grep', 'read', 'write', 'edit', 'bash', 'webfetch', 'skill', 'todowrite'];
  tools.forEach(t => { if (lower.includes(t.toLowerCase())) addTerm(t, 60, 'assistant', 'reasoning'); });
  
  const providers = ['openrouter', 'deepseek', 'stepfun', 'poolside', 'anthropic', 'openai', 'z.ai', 'moonshotai', 'minimax', 'qwen', 'tencent'];
  providers.forEach(p => { if (lower.includes(p.toLowerCase())) addTerm(p, 60, 'assistant', 'reasoning'); });
});

// Tool calls
toolMsgs.forEach(t => {
  const lower = t.toLowerCase();
  const paths = [
    'canon/system/legionnairefieldguide.md', 'canon/scripts/death.ps1', 'canon/system/agent99.md',
    'canon/system/gospel-999.md', 'canon/operations/backburner-pipeline-log.md',
    'canon/reincarnation/handoff-184-to-185.json', 'canon/reincarnation/pipeline-184.json',
    'canon/reincarnation/run184-reincarnatedeath.md', 'canon/pheromones/phetrail-run184-backburner.json',
    'canon/pheromones/phetrail-run184-documentation.json', 'canon/pheromones/phetrail-run184-false-approval.json',
    'canon/pheromones/phetrail-run184-false-backward-audit.json', 'canon/pheromones/phetrail-run184-git-state.json',
    'canon/pheromones/phetrail-run184-scout-findings.json', 'canon/pheromones/phetrail-run184-session-complete.json',
    'canon/pheromones/phetrail-run182-rrl-failure.json', '.kilo/command/phoenixscout.md',
    '.kilo/command/engineerlegionnaire.md', '.kilo/command/reincarnatedeath.md', '.kilo/command/reincarnaterise.md',
    '.kilo/skills/legionnairefieldguide.md', 'scripts/reincarnate-death.ps1', 'scripts/reincarnate-rise.ps1',
    'rrl/rrl-184.txt', 'pastlives/rrl-182.txt', 'pastlives/rrl-184.txt', 'incarnations/incarnation1/rrl.txt',
    'incarnations/incarnation2/rrl.txt', 'incarnations/incarnation2/audit.json',
    'operations/phoenixsynch.md', 'operations/reincarnate-rise-run184.jsonl',
    'operations/phetrail-scout-backward-run184-lines101-178.jsonl', 'scratch', 'rrl/',
    'canon/scripts', 'canon/system', 'canon/operations', 'canon/reincarnation', 'canon/pheromones',
    'incarnations', 'pastlives', 'operational', 'kilo.db', 'session-export-workspace.json',
    '.secrets.local', 'firebase-debug.log', 'rrl-182.txt', 'rrl-184.txt',
    'hl-7314', 'hl-129', 'heavy-ledger', 'state-snapshot.json', 'boot-checklist.md',
    'reincarnation-boot-checklist.md', 'obi.ps1', 'obi.ps1 doctor', 'obi.ps1 verify',
    'net-pet-ai', 'wrangler.toml', 'package.json', 'src/index.js', '.kilo/run-script.ps1',
    'ses_0865054d9ffepYDzloOY86YfC6', 'crisp-island', 'legion-garrison.ps1',
    'secrets-sync-cloudflare.ps1', 'set-pa-secrets.ps1', 'kilo-rrl-complete.cjs',
    'pastlives/rrl-182.txt', 'rrl-182-complete.jsonl', 'phetrail-scout-backward-run184-lines101-178.jsonl',
    'phetrontrail-run183.json'
  ];
  paths.forEach(p => { if (lower.includes(p)) addTerm(p, 95, 'assistant', 'tool'); });
  
  const cmds = ['reincarnaterise', 'reincarnatedeath', 'reincarnatelegacy', 'reincarnate', 'phoenixscout', 'engineerlegionnaire', 'reincarnaterise', 'reincarnatedeath', 'PhoenixScout', 'EngineerLegionnaire', 'reincarnateRise', 'reincarnateDEATH'];
  cmds.forEach(c => { if (lower.includes(c.toLowerCase())) addTerm(c, 90, 'assistant', 'tool'); });
  
  const scripts = ['death.ps1', 'obi.ps1', 'run-script.ps1', 'legion-garrison.ps1', 'kilo-rrl-complete.cjs'];
  scripts.forEach(sc => { if (lower.includes(sc.toLowerCase())) addTerm(sc, 85, 'assistant', 'tool'); });
  
  const ops = ['git add', 'git commit', 'git status', 'git show', 'git log', 'git diff', 'git rm', 'git mv', 'staged', 'untracked', 'modified', 'deleted', 'added', 'renamed', 'push', 'pull', 'merge', 'branch', 'canon', 'head', 'worktree', 'snapshot', 'nuke', 'purge', 'consolidate', 'override', 'secret', 'redact', 'bypass', 'no-verify', '--no-verify'];
  ops.forEach(o => { if (lower.includes(o.toLowerCase())) addTerm(o, 70, 'assistant', 'tool'); });
  
  const tools = ['glob', 'grep', 'read', 'write', 'edit', 'bash', 'webfetch', 'skill', 'todowrite'];
  tools.forEach(t => { if (lower.includes(t.toLowerCase())) addTerm(t, 65, 'assistant', 'tool'); });
  
  const providers = ['openrouter', 'deepseek', 'stepfun', 'poolside', 'anthropic', 'openai', 'z.ai', 'moonshotai', 'minimax', 'qwen', 'tencent'];
  providers.forEach(p => { if (lower.includes(p.toLowerCase())) addTerm(p, 65, 'assistant', 'tool'); });
});

// Build final list
const scored = [];
for (const [keyword, val] of highValue) {
  let category = 'PHEROMONE';
  if (val.roles.has('user') && !val.roles.has('assistant')) category = 'SOUL';
  else if (val.types.has('reasoning') && !val.roles.has('user')) category = 'REASON';
  else if (val.types.has('tool')) category = 'PHEROMONE';
  else if (val.roles.has('assistant')) category = 'DNA';
  
  const soulTerms = ['successful proven repeatable consistent results', 'fools game', 'bare bones', 'real data', 'real evidence', 'ad hoc', 'burn them', 'nuking campaign', 'devastated if we lost', 'drowning in old scripts', 'outdated sub processes', 'green free box', 'openai deepseek', 'murder them', 'kill', 'nuke', 'override', 'secret detected', 'redact', 'bypass', 'no-verify', 'incarnation3 identity assignment', 'incarnation2 session end', 'incarnation2 audit'];
  if (soulTerms.some(t => keyword.toLowerCase() === t || keyword.toLowerCase().includes(t))) category = 'SOUL';
  
  const reasonTerms = ['canon/system/legionnairefieldguide.md', 'canon/scripts/death.ps1', 'canon/system/agent99.md', 'kilo.db', 'session-export-workspace.json', '.secrets.local', 'firebase-debug.log', 'legion-garrison.ps1', 'secrets-sync-cloudflare.ps1', 'set-pa-secrets.ps1', 'obi.ps1', 'obi.ps1 doctor', 'obi.ps1 verify', 'net-pet-ai', 'wrangler.toml', 'package.json', 'src/index.js', '.kilo/run-script.ps1', 'scratch', 'ses_0865054d9ffepYDzloOY86YfC6', 'crisp-island', 'node -e', 'better-sqlite3', 'get-childitem', 'remove-item', 'copy-item', 'test-path', 'select-string', 'select-object', 'invokerestmethod', 'convertto-json'];
  if (reasonTerms.some(t => keyword.toLowerCase() === t || keyword.toLowerCase().includes(t))) category = 'REASON';
  
  scored.push({ keyword, score: Math.min(100, Math.round(val.score)), category });
}

scored.sort((a, b) => b.score - a.score);
const seen = new Set();
const final = [];
for (const item of scored) {
  const key = item.keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!seen.has(key)) {
    seen.add(key);
    final.push(item);
  }
  if (final.length >= 100) break;
}

// If we don't have 100, pad with more specific terms from the text
if (final.length < 100) {
  const allText = [...userMsgs, ...assistantMsgs, ...reasoningMsgs].join(' ').toLowerCase();
  const extraTerms = [
    'reincarnateRise', 'reincarnateDEATH', 'reincarnateLegacy', 'PhoenixScout', 'EngineerLegionnaire',
    'gospel-999', 'backburner-pipeline-log', 'handoff-184-to-185', 'pipeline-184', 'run184-reincarnateDEATH',
    'phetrail-run184', 'phetrail-run182', 'phoenixsynch', 'legion-garrison', 'secrets-sync-cloudflare', 'set-pa-secrets',
    'obi.ps1 doctor', 'obi.ps1 verify', 'net-pet-ai', 'wrangler.toml', 'package.json', 'src/index.js',
    'state-snapshot.json', 'reincarnation-boot-checklist.md', 'session-export-workspace.json', 'kilo.db',
    'hl-7314', 'hl-129', 'heavy-ledger', 'scratch', 'rrl-182-complete.jsonl', 'phetrail-scout-backward-run184-lines101-178',
    'boiled-gopher', 'catnip-snowboard', 'debonair-fuel', 'free-dentist', 'groovy-baritone', 'hypnotic-form', 'iron-bugle', 'loud-equinox', 'nosy-ethernet', 'raspy-mustard', 'remarkable-droplet', 'sparkling-clementine', 'towering-planet', 'wood-manicure', 'zealous-grasshopper',
    '419 files', '24222 deletions', '2674 insertions', '37d0f3c0d', 'canon branch',
    'deepseek-v4-flash', 'deepseek-v4-pro', 'step-3.7-flash', 'laguna-m.1',
    'openrouter/free', 'stepfun/step-3.7-flash:free', 'poolside/laguna-m.1:free',
    'auto free', 'auto balanced', 'auto efficient', 'auto frontier',
    'agent99-t1-free', 'agent99-t1-haiku', 'agent99-t1-qwenmax', 'agent99-t2-flash', 'agent99-t2-sonnet', 'agent99-t3-pro', 'agent99-t4-gemini', 'agent99-t4-opus', 'agent99-t5-claude',
    'roman', 'fabi', 'engineer corps',
    'phetrontrail sealed', 'kilometer db', 'sqlite', 'node -e',
    'json.parse', 'fs.readfilesync', 'convertto-json', 'invokerestmethod'
  ];
  for (const t of extraTerms) {
    const key = t.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seen.has(key) && allText.includes(t.toLowerCase())) {
      let category = 'PHEROMONE';
      if (t.toLowerCase().includes('incarnation') || t.toLowerCase().includes('reincarnate')) category = 'DNA';
      else if (t.toLowerCase().includes('audit') || t.toLowerCase().includes('scs')) category = 'DNA';
      else if (t.toLowerCase().includes('.ps1') || t.toLowerCase().includes('.md') || t.toLowerCase().includes('.json')) category = 'REASON';
      else if (t.toLowerCase().includes('kill') || t.toLowerCase().includes('nuke') || t.toLowerCase().includes('murder') || t.toLowerCase().includes('burn')) category = 'SOUL';
      else if (t.toLowerCase().includes('user') || t.toLowerCase().includes('dont') || t.toLowerCase().includes('real data') || t.toLowerCase().includes('fools game')) category = 'SOUL';
      else if (t.toLowerCase().includes('kilo') || t.toLowerCase().includes('git') || t.toLowerCase().includes('session')) category = 'PHEROMONE';
      else if (t.toLowerCase().includes('node') || t.toLowerCase().includes('sqlite') || t.toLowerCase().includes('fs.')) category = 'REASON';
      else if (t.toLowerCase().includes('deepseek') || t.toLowerCase().includes('stepfun') || t.toLowerCase().includes('openrouter')) category = 'DNA';
      else if (t.toLowerCase().includes('worktree') || t.toLowerCase().includes('snapshot')) category = 'PHEROMONE';
      else if (t.toLowerCase().includes('agent')) category = 'DNA';
      else category = 'REASON';
      seen.add(key);
      final.push({ keyword: t, score: 75, category });
    }
    if (final.length >= 100) break;
  }
}

console.log(JSON.stringify(final, null, 2));
console.log('Final count:', final.length);
