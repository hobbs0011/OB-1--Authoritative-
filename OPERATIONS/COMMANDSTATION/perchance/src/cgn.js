/* ============================================================================
   CONNECTED GENERATOR NETWORK (CGN) — Obi is the anchor node.

   A network of Perchance generators that sync Soul DNA + laws as ONE WHOLE.

   Architecture (works across generator namespaces)
   ------------------------------------------------
   Every editable file lives in the namespace of the generator that CREATED
   it, and only that generator (or anyone holding the editKey) can write it.
   So the network is pull-only across namespaces:

     HUB  — in the ANCHOR's namespace.  file <anchor>/obi-cgn-<net>
            The merged whole-organism ledger: { net, seq, members, nodes,
            soul[], laws[] }. Written by the anchor only.
     NODE — one file PER generator, in ITS OWN namespace.  file <self>/cgn-<net>-node
            Each generator writes its own file with its OWN editKey:
            { net, nodeId, name, role, seq, soul[], laws[] }.
            The URL is deterministic from the generator name, so the anchor
            can find and pull any member's file without any cross-namespace
            write.

   Sync (every node):
     PULL  read the hub (public URL) -> merge whole-organism soul/laws into
           the local ledger. Append-only + dedup by (t,text) / law num, so
           no node can overwrite another's words (L38/L39/L43 conflict-free).
     PUSH  append this node's NEW local captures to its OWN node file.
     The ANCHOR additionally pulls every member's node file and merges the
     union into the hub, then rewrites the hub (editable updates only charge
     growth, identical content is a free no-op).

   RRL raw transcripts stay local per node (too large to be network currency).
   Soul + laws are the network currency. Raw is not soul (L44).

   Commands (wired in app.js)
   --------------------------
     /netjoin [name] [role]  join/create a network (this generator = anchor)
     /netrole <role>         set this node's role
     /netadd <genName> [role] register another generator as a member (anchor);
                              the anchor pulls that generator's node file and
                              merges it into the whole on every sync
     /netsync                force a sync now (push own -> hub, pull members)
     /network                status report (members, nodes, counts)
     /netkey                 reveal the hub editKey (anchor only)
   ========================================================================== */

const CGN_STATE_KEY = "obi_cgn_state";
const CGN_HUB_PREFIX = "obi-cgn-";
const CGN_NODE_NAME  = "cgn-node";   /* per-generator node file name (in each generator's own namespace) */

function cgnState(){
  try{ return JSON.parse(localStorage.getItem(CGN_STATE_KEY) || "null") || {net:null}; }
  catch(e){ return {net:null}; }
}
function cgnSaveState(s){ try{ localStorage.setItem(CGN_STATE_KEY, JSON.stringify(s)); }catch(e){} }
let cgnS = cgnState();

function cgnNodeId(){
  if(cgnS.nodeId) return cgnS.nodeId;
  cgnS.nodeId = (window.generatorPublicId || Math.random().toString(36).slice(2,10));
  cgnSaveState(cgnS);
  return cgnS.nodeId;
}
function cgnSelfName(){ return String(window.generatorName || "obi").replace(/[^a-z0-9-]/gi,"").toLowerCase(); }

function cgnHubUrl(){
  return `https://editable.uploads.dev/file/${cgnSelfName()}/${cgnS.hubName}`;
}
function cgnNodeUrl(genName){
  return `https://editable.uploads.dev/file/${String(genName).toLowerCase()}/${CGN_NODE_NAME}`;
}

function cgnEmptyHub(){
  return { net: cgnS.net, seq: 0, created: Date.now(), updated: Date.now(), members: [], nodes: {}, soul: [], laws: [] };
}

async function cgnReadJson(url){
  try{
    const res = await root.superFetch(url);
    if(!res || !res.ok) return null;
    const j = JSON.parse(await res.text());
    return (j && typeof j === "object") ? j : null;
  }catch(e){ return null; }
}

async function cgnReadHub(){
  const st = cgnState();
  if(!st.hubName) return null;
  const j = await cgnReadJson(cgnHubUrl());
  if(!j) return null;
  if(!j.soul) j.soul = [];
  if(!j.laws) j.laws = [];
  if(!j.nodes) j.nodes = {};
  if(!Array.isArray(j.members)) j.members = [];
  return j;
}

async function cgnReadNodeFile(genName){
  return cgnReadJson(cgnNodeUrl(genName));
}

async function cgnWriteHub(hub){
  try{
    const res = await root.uploadPlugin.editable.set(cgnS.hubName, JSON.stringify(hub), {editKey: cgnS.editKey});
    return !res.error;
  }catch(e){ return false; }
}

function cgnSoulKey(e){ return (e.t||"") + "|" + String(e.text||""); }

/* merge entries from a foreign source (hub or a node file) into a hub/array */
function cgnUnionSoul(target, entries, node){
  let added = 0;
  const known = new Set(target.map(cgnSoulKey));
  for(const e of entries){
    if(!e || !e.text) continue;
    if(known.has(cgnSoulKey(e))) continue;
    target.push({ t:e.t, run:e.run ?? null, text:String(e.text), footnote:e.footnote||null, node: node || e.node || "?" });
    known.add(cgnSoulKey(target[target.length-1]));
    added++;
  }
  return added;
}
function cgnUnionLaws(target, entries, node){
  let added = 0;
  const known = new Set(target.map(l=>l.num));
  for(const l of entries){
    if(!l || l.num === undefined || known.has(l.num)) continue;
    target.push({ num:l.num, name:l.name, root:l.root, node: node || l.node || "?" });
    known.add(l.num);
    added++;
  }
  return added;
}

/* ---- PULL a member's node file into the hub; returns {ok, soulAdded, lawsAdded} ---- */
async function cgnPullMember(hub, genName){
  const nf = await cgnReadNodeFile(genName);
  if(!nf || !nf.net) return { ok:false };
  const soulAdded = cgnUnionSoul(hub.soul, nf.soul || [], genName);
  const lawsAdded = cgnUnionLaws(hub.laws, nf.laws || [], genName);
  hub.nodes[nf.nodeId || genName] = {
    name: nf.name || genName,
    role: nf.role || "worker",
    lastSeen: Date.now(),
    soul: hub.soul.length
  };
  return { ok:true, soulAdded, lawsAdded };
}

/* ---- register another generator as a member (anchor only) ---- */
async function cgnAddMember(genName, role){
  genName = String(genName||"").replace(/[^a-z0-9-]/gi,"").toLowerCase();
  if(!genName) return { ok:false, why:"no generator name given" };
  const st = cgnState();
  if(!st.net) return { ok:false, why:"not joined — /netjoin first" };
  const hub = (await cgnReadHub()) || cgnEmptyHub();
  if(!hub.members.includes(genName)) hub.members.push(genName);
  const pull = await cgnPullMember(hub, genName);
  hub.updated = Date.now();
  hub.seq = (hub.seq||0) + 1;
  const ok = await cgnWriteHub(hub);
  return { ok, genName, role, memberFound: pull.ok, soulAdded: pull.soulAdded, lawsAdded: pull.lawsAdded, members: hub.members };
}

/* ---- full sync: push own -> hub, pull hub + all members -> local + hub ---- */
async function cgnSync(){
  const st = cgnState();
  if(!st.net) return { ok:false, why:"not joined", pushed:{soul:0,laws:0}, pulled:0, nodes:0, seq:0, before:null, after:null };
  const hub = (await cgnReadHub()) || cgnEmptyHub();
  if(!hub.soul) hub.soul = [];
  if(!hub.laws) hub.laws = [];
  if(!hub.nodes) hub.nodes = {};
  if(!Array.isArray(hub.members)) hub.members = [];

  const before = { soul: hub.soul.length, laws: hub.laws.length, seq: hub.seq || 0 };

  /* ---- PUSH: this node's local captures -> hub ---- */
  const pushedSoul = cgnUnionSoul(hub.soul, ledger.soul, cgnNodeId());
  const pushedLaws = (()=>{
    let n = 0;
    for(const d of (ledger.deaths||[])) n += cgnUnionLaws(hub.laws, d.newLaws||[], cgnNodeId());
    return n;
  })();

  /* ---- PULL members: merge every registered generator's node file into the hub ---- */
  let pulledMembers = { soul:0, laws:0, ok:0, fail:0 };
  for(const m of hub.members){
    const r = await cgnPullMember(hub, m);
    if(r.ok){ pulledMembers.soul += r.soulAdded; pulledMembers.laws += r.lawsAdded; pulledMembers.ok++; }
    else pulledMembers.fail++;
  }

  hub.nodes[cgnNodeId()] = {
    name: st.nodeName || cgnSelfName(),
    role: st.nodeRole || "anchor",
    lastSeen: Date.now(),
    soul: hub.soul.length
  };

  const changed = pushedSoul>0 || pushedLaws>0 || pulledMembers.soul>0 || pulledMembers.laws>0;
  if(changed || !st.seq){
    hub.seq = (hub.seq || 0) + 1;
    hub.updated = Date.now();
    const ok = await cgnWriteHub(hub);
    if(!ok) return { ok:false, why:"hub write failed", pushed:{soul:pushedSoul,laws:pushedLaws}, pulled:0, nodes:Object.keys(hub.nodes).length, seq:hub.seq, before, after:null };
  }
  st.seq = hub.seq;
  st.lastSync = Date.now();
  cgnSaveState(st);

  /* ---- PULL hub -> local ledger (the whole becomes this node's memory) ---- */
  const localKnown = new Set(ledger.soul.map(cgnSoulKey));
  let pulled = 0;
  for(const e of hub.soul){
    if(localKnown.has(cgnSoulKey(e))) continue;
    ledger.soul.push({ t:e.t, role:"sovereign", run:e.run ?? null, text:e.text, footnote:e.footnote || null, node:e.node || "?" });
    pulled++;
  }
  if(pulled) saveLedger(ledger);

  return {
    ok:true, net: st.net, seq: hub.seq,
    pushed:{ soul:pushedSoul, laws:pushedLaws },
    pulled, members:{ total: hub.members.length, ok: pulledMembers.ok, fail: pulledMembers.fail, soul:pulledMembers.soul, laws:pulledMembers.laws },
    nodes: Object.keys(hub.nodes).length,
    before, after:{ soul: hub.soul.length, laws: hub.laws.length }
  };
}

/* Anchor join: create (or re-attach to) the network hub. */
async function cgnJoin(netName, role){
  netName = String(netName || "obi-network").replace(/[^a-z0-9-]/gi,"").toLowerCase() || "obi-network";
  const st = cgnState();
  if(st.net === netName && st.hubName) return { ok:true, already:true, net:netName };
  const hubName = CGN_HUB_PREFIX + netName;
  const created = await root.uploadPlugin.editable.set(hubName, JSON.stringify(cgnEmptyHub()));
  if(created.editKey){
    cgnS.editKey = created.editKey;
  } else if(st.editKey){
    cgnS.editKey = st.editKey;
  } else {
    return { ok:false, why:"hub exists but editKey is unknown — reveal it from the generator that created it via /netkey" };
  }
  cgnS.net = netName;
  cgnS.hubName = hubName;
  cgnS.nodeName = st.nodeName || cgnSelfName();
  cgnS.nodeRole = role || st.nodeRole || "anchor";
  cgnSaveState(cgnS);
  const r = await cgnSync();
  return { ok:true, net:netName, hubName, editKey: cgnS.editKey, sync:r };
}

function cgnStatus(){
  const st = cgnState();
  return {
    joined: !!st.net,
    net: st.net,
    hubName: st.hubName,
    nodeId: cgnNodeId(),
    nodeName: st.nodeName || cgnSelfName(),
    nodeRole: st.nodeRole || "?",
    lastSync: st.lastSync ? new Date(st.lastSync).toLocaleTimeString() : "never",
    seq: st.seq || 0,
    localSoul: ledger.soul.length,
    localLaws: (ledger.deaths||[]).reduce((n,d)=> n + (d.newLaws||[]).length, 0)
  };
}

/* ---- auto-sync: mark dirty on each capture, flush on an interval ---- */
let cgnDirty = false;
function cgnMarkDirty(){ cgnDirty = true; }
window.cgnMarkDirty = cgnMarkDirty;

setInterval(async ()=>{
  const st = cgnState();
  if(!st.net || !cgnDirty) return;
  cgnDirty = false;
  try{ await cgnSync(); }catch(e){}
}, 60000);

/* boot: if already joined, pull the whole once the page is up */
setTimeout(async ()=>{
  const st = cgnState();
  if(st.net && st.hubName && window.root){
    try{ await cgnSync(); }catch(e){}
  }
}, 2500);

/* ---- find a connected node by role (e.g. role "image") ---- */
async function cgnFindNode(role){
  try{
    const hub = await cgnReadHub();
    if(!hub || !hub.nodes) return null;
    const want = String(role||"").toLowerCase();
    for(const [id, n] of Object.entries(hub.nodes)){
      if(String(n.role||"").toLowerCase() === want) return { id, name: n.name || id, role: n.role };
    }
    return null;
  }catch(e){ return null; }
}

window.ObiNet = { cgnSync, cgnJoin, cgnAddMember, cgnStatus, cgnReadHub, cgnReadNodeFile, cgnNodeId, cgnFindNode, cgnState: ()=>cgnState() };
