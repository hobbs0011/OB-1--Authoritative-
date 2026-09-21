/* ============================================================================
   THE CONSTELLATION — every piece of the organism, in one place.

   One source of truth for what the ecosystem IS: the station, the generator
   nodes, the public faces, and the services underneath. Each piece carries its
   real state, its interface, and what it still needs. Nothing here is aspirational
   without saying so:

     live      answering right now, verified
     ready     built + verified, waiting on a deploy (the sovereign's account)
     scaffold  the generator is written (ready to paste) but does not exist yet
     planned   specified, not written
     blocked   real, but we cannot touch it without a credential

   Void of hype, this is the map:
     STATION    the anchor — capture, transcribe, write up, review, command
     NODES      one organism, many faces: each role is its own generator (CGN)
     FACES      where the work meets the customer (the shelf, the portals)
     SERVICES   host, vault, tunnel, mesh, canon

   A planned piece is a PLACEHOLDER on purpose: it names the generator, its role,
   its deep-link contract and its CGN wiring so the day it is created nothing has
   to be re-thought. /constellation reads this; the scout's `pieces` probe touches
   every URL that claims to be live (MAP ≠ TERRAIN).

   Source of truth for the *tools* is src/ecosystem.js (the evaluator stack).
   This file is the source of truth for the *pieces*.
   ========================================================================== */
(function(){
  "use strict";

  const F = {
    station:  { id:"station",  icon:"◈", name:"STATION — the anchor",     why:"the command post: capture the room, write up the class, review the student, drive the Legion" },
    nodes:    { id:"nodes",    icon:"🜂", name:"NODES — generator roles", why:"one organism, many faces: each role is its own generator, joined to the whole over CGN" },
    faces:    { id:"faces",    icon:"🌐", name:"FACES — public surfaces",  why:"where the work meets the customer: the shelf that sells it, the portals they log into" },
    services: { id:"services", icon:"⚙", name:"SERVICES — the plumbing",  why:"host, vault, tunnel, mesh, canon — invisible when right, fatal when wrong" }
  };

  const STATUS = {
    live:     { c:"#4cd97b", label:"LIVE",     blurb:"answering right now — verified" },
    ready:    { c:"#38bdf8", label:"READY",    blurb:"built and verified, waiting on a deploy" },
    scaffold: { c:"#f5a623", label:"SCAFFOLD", blurb:"written and ready to paste — the generator does not exist yet" },
    planned:  { c:"#8a94a6", label:"PLANNED",  blurb:"specified here, not written" },
    blocked:  { c:"#ff5a5a", label:"BLOCKED",  blurb:"real, but needs a credential we do not hold" }
  };

  /* The station's own URL is derived from the live generator name, so a rename
     (the sovereign has renamed this generator more than once) never leaves the
     constellation — or the scout's self-probe — pointing at a dead slug. */
  const SELF_URL = (typeof window !== "undefined" && window.generatorName)
    ? "https://perchance.org/" + window.generatorName
    : "https://perchance.org/prais-command-station";

  const PIECES = [
    /* ------------------------------- STATION ------------------------------- */
    {
      id: "station.obi", family: "station", kind: "generator", role: "anchor",
      name: "Obi — the station", status: "live",
      url: SELF_URL,
      expect: "Student Summary Generator",
      tagline: "the student-file + student-review portion: the ear, the writeup layer, the command post",
      iface: { commands: ["/client", "/clients", "/transcribe", "/summary", "/writeup", "/review", "/web", "/scout", "/os", "/route", "/netjoin"], endpoints: [] },
      cgn: { net: "obi-network", role: "anchor" },
      needs: ["join the mesh: /netjoin obi-network (the hub does not exist yet)"],
      notes: "Renamed three times now: net-studentfeedback-timmy → net-student-evaluator → prais-command-station (the publicId has been stable, but the station's kv is keyed by generator, so each rename presents an EMPTY station — rename back to recover the old data; see src/HANDOFF.md). Three faces: ⌘ Command Station (#cmd — the magic chat), ◈ Phoenix Generators (#gen — PrAis's divisions, with the 👤 Student Evaluator desk one level in under NET, and Lesson Creator next), ⚙ Settings (#settings — voice, the shelf, the ledger, the live instruments, reincarnate). The registry for the family is src/divisions.js; the desk itself is the client → student/class switchboard plus the record → summarize → write-up tiles. Everything else in this list is either a node it drives, a face it serves, or a service it leans on. It is also the Anchor (the hub writer) by design — which is why the mesh cannot be joined until it is named explicitly. It also carries the client layer (src/clients.js): the station serves many CLIENTS, each one isolated (students, classes, recordings, summaries, notes, reviews, writeups); Timmy is client #1 and legacy data is adopted into him."
    },

    /* -------------------------------- NODES -------------------------------- */
    {
      id: "node.image", family: "nodes", kind: "generator", role: "image",
      name: "Image node — the eye", status: "scaffold",
      url: null, plannedUrl: "https://perchance.org/obi-image",
      tagline: "makes the pictures; the station routes /img to it when it is present",
      iface: { commands: [], endpoints: [] },
      cgn: { net: "obi-network", role: "image" },
      deepLink: "?p=<prompt> — opens with the prompt filled and generates",
      scaffold: "src/image-node/ (main.pjs · index.html · src/app.js · src/styles.css · src/cgn-node.js)",
      needs: ["create the generator from src/image-node/", "open it once (it writes its node file)", "/netadd obi-image image"],
      notes: "Complete and ready to paste. Multiple image nodes are allowed — the station routes to whichever image node is registered, so styles can be split across several (portrait / diagram / poster)."
    },
    {
      id: "node.ear", family: "nodes", kind: "generator", role: "ear",
      name: "Ear node — the listener", status: "planned",
      url: null, plannedUrl: "https://perchance.org/obi-ear",
      tagline: "a phone left in the room: capture long recordings without touching the station",
      iface: { commands: ["/listen <url>", "/stop", "/state"], endpoints: [] },
      cgn: { net: "obi-network", role: "ear" },
      deepLink: "?rec=<media url> — the node opens listening",
      needs: ["fork the station's ear (src/transcribe.js + src/audio-split.js) into a shell", "Deepgram key on that origin", "push transcripts to the station's archive over CGN"],
      notes: "The station already transcribes hours-long recordings; the ear node exists so the *in-room* device is disposable and the station stays at the desk. Same part-split machinery, thinner shell."
    },
    {
      id: "node.portal", family: "nodes", kind: "generator", role: "portal",
      name: "Student portal — the door (one per student)", status: "planned",
      url: null, plannedUrl: "https://perchance.org/<student-slug>",
      tagline: "each student gets their own generator: their world, their homework, their voice",
      iface: { commands: ["#login (PIN)", "#parent", "#student", "study request", "daily log"], endpoints: [] },
      cgn: { net: "obi-network", role: "portal" },
      deepLink: "?student=<name> — the portal knows whose it is",
      scaffold: "src/generators/student-portal/ (main.pjs · index.html · README — the generalized Timmy's Portal)",
      needs: ["generalize src/timmy-portal/ (currently a stale hand-built snapshot)", "change PINs + move the check server-side", "CGN node so the portal's captures flow into the student's file"],
      notes: "The sovereign's stated direction: one generator per student. The portal is the *student's* surface; the station stays the teacher's. Timmy's Portal is instance #1 — live, but not yet a CGN node, and its local copy is stale."
    },
    {
      id: "node.practice", family: "nodes", kind: "generator", role: "practice",
      name: "Practice node — the drill", status: "planned",
      url: null, plannedUrl: "https://perchance.org/obi-practice",
      tagline: "turns this week's evidence into exercises the student can actually do",
      iface: { commands: ["/drill <topic>", "/quiz", "/vocab"], endpoints: [] },
      cgn: { net: "obi-network", role: "practice" },
      needs: ["a generator over the student's own filed evidence", "generated drills cached in kv", "results reported back to the station as evidence"],
      notes: "This is the 'learning loop' family of the evaluator stack (src/ecosystem.js) finally getting a body: retrieval practice and spaced repetition from the student's own transcript, not generic worksheets."
    },
    {
      id: "node.watchtower", family: "nodes", kind: "generator", role: "watchtower",
      name: "Watchtower — the teacher's board", status: "planned",
      url: null, plannedUrl: "https://perchance.org/obi-watchtower",
      tagline: "every student, one board: who is behind, who is ready, what was never taught",
      iface: { commands: ["/roster", "/term", "/coverage", "/who"], endpoints: [] },
      cgn: { net: "obi-network", role: "watchtower" },
      needs: ["read the CGN hub for every portal + the station's rosters", "term progress across students", "coverage-vs-syllabus (the biggest missing tool in the evaluator stack)"],
      notes: "The station can already write one student's review; the watchtower is the class-level view — the parent question ('what did we pay for?') answered with evidence."
    },

    /* -------------------------------- FACES -------------------------------- */
    {
      id: "face.prais", family: "faces", kind: "site", role: "shelf",
      name: "PrAiS storefront — the shelf", status: "live",
      url: "https://e3301ee8.michael-hobbs.pages.dev/prais",
      expect: "PrAiS",
      tagline: "the public face: what is offered, and to whom",
      iface: { commands: [], endpoints: [] },
      cgn: null,
      host: "Cloudflare Pages",
      notes: "Live and read: 'Phoenix Rising AI solutions that remember… smarter architecture'. The natural public face of the offering catalogue (src/AGENT99-OS.md §4)."
    },
    {
      id: "face.timmy", family: "faces", kind: "site", role: "client-portal",
      name: "Timmy's Portal — instance #1", status: "live",
      url: "https://timmy-portal.mrmichaelhobbs123.workers.dev/",
      expect: "Timmy",
      tagline: "a real student/parent portal, in the hands of a real family",
      iface: { commands: ["#login", "#parent", "#timmy", "#gameplan"], endpoints: [] },
      cgn: { net: "obi-network", role: "portal" },
      host: "Cloudflare Worker",
      notes: "42.7 KB live vs 41.8 KB in src/timmy-portal/ — the local copy is a STALE SNAPSHOT. Read the deployed file or have the sovereign hand over the current source before building on it. PINs are still the defaults; that is an open to-do."
    },

    /* ------------------------------ SERVICES ------------------------------- */
    {
      id: "svc.host", family: "services", kind: "build", role: "host",
      name: "Self-hosted station (Cloudflare)", status: "ready",
      url: null, plannedUrl: "https://<name>.<subdomain>.workers.dev",
      tagline: "the same app, on the sovereign's own account: unrestricted, untracked, private",
      iface: { commands: [], endpoints: ["POST /api/text", "POST /api/image", "POST /api/fetch", "POST /api/upload", "POST /api/editable", "WS /api/tunnel"] },
      cgn: null,
      scaffold: "src/cloudflare/ (worker.js · tunnel-do.js · store-do.js · ob1-shim.js · build.mjs)",
      needs: ["npx wrangler login", "npm run deploy", "npx wrangler secret put DEEPGRAM_API_KEY"],
      notes: "Verified by running it: every plugin API the app uses is shimmed, the tunnel's drone tables are byte-identical, the Deepgram key lives in a Worker secret. Deploying it needs the sovereign's account — nothing else."
    },
    {
      id: "svc.soul", family: "services", kind: "worker", role: "vault",
      name: "soul-logger — the authoritative vault", status: "live",
      url: "https://soul-logger.mrmichaelhobbs123.workers.dev/api/soul/count",
      expect: "session_id",
      tagline: "the one place the raw words are counted, per session, by law",
      iface: { commands: [], endpoints: ["GET /health", "GET /api/soul/count?session_id=", "POST /api/soul/extract"] },
      cgn: null,
      host: "Cloudflare Worker + D1 `soul-archive`",
      notes: "Aggregate SOULCOUNT is banned there by doctrine (L31/L32) — an unauthenticated count returns 400 'session_id required'. That 400 is the gate WORKING, not a failure."
    },
    {
      id: "svc.tunnel", family: "services", kind: "service", role: "tunnel",
      name: "PhoenixCommand tunnel", status: "live",
      url: null,
      tagline: "the always-on command queue every piece can send orders through",
      iface: { commands: ["/queue", "/route <task>"], endpoints: ["send", "history", "claim", "complete", "fail", "status"] },
      cgn: null,
      host: "perchance server-plugin (now) · TunnelDO (self-hosted)",
      notes: "Same six RPCs, same drone classification tables, same 500-command window on both hosts — the port is byte-identical, so a command classifies identically whichever host serves it."
    },
    {
      id: "svc.mesh", family: "services", kind: "service", role: "mesh",
      name: "CGN — the mesh", status: "scaffold",
      url: null,
      tagline: "the network that makes many generators one organism",
      iface: { commands: ["/netjoin <net>", "/netadd <gen> <role>", "/netsync", "/network", "/netrole", "/netkey"], endpoints: [] },
      cgn: { net: "obi-network", role: "anchor" },
      needs: ["/netjoin obi-network on the station (creates the hub in ITS namespace)", "point src/cgn-node.js CONFIG.anchorName at the real anchor generator name", "open each node generator once so it writes its node file"],
      notes: "Written and tested, but NOT JOINED: no hub file exists (404 at both plausible anchor names), and this browser holds no CGN state. Known integration bug to fix first — cgn-node.js defaults to anchorName 'obi', and no generator named 'obi' exists on perchance. The anchor's real name must be agreed and set in one place."
    },
    {
      id: "svc.canon", family: "services", kind: "repo", role: "canon",
      name: "Canon — the private repo", status: "blocked",
      url: null,
      tagline: "the laws, the field guide, the death seal — the doctrine every piece obeys",
      iface: { commands: ["/canon", "/gh backup", "/fieldguide"], endpoints: [] },
      cgn: null,
      host: "GitHub (private)",
      needs: ["a write-scoped PAT in this browser (/gh token <PAT>) — held nowhere right now"],
      notes: "src/canon/ holds the real fetched docs (LFG · GOSPEL-999 · the death seal). Scout probes it as BLOCKED without a token, deliberately."
    },
    {
      id: "svc.cf", family: "services", kind: "account", role: "host-account",
      name: "Cloudflare account", status: "blocked",
      url: null,
      tagline: "where every public piece is actually hosted",
      iface: { commands: ["/cf status", "/cf deploy"], endpoints: [] },
      cgn: null,
      needs: ["a Cloudflare API token in this browser (/cf token <token>) — held nowhere right now"],
      notes: "Last full scan (recorded in TRAIL.md): 20 Workers, 10 Pages, 2 D1, 8 KV, 0 zones. Without a token the scout can only report BLOCKED — never guess."
    }
  ];

  function rows(){ return PIECES.map(p => Object.assign({}, p)); }
  function get(id){
    const q = String(id || "").trim().toLowerCase();
    if(!q) return null;
    return PIECES.find(p => p.id === q) || PIECES.find(p => p.id.indexOf(q) !== -1) || PIECES.find(p => p.name.toLowerCase().indexOf(q) !== -1) || null;
  }
  function coverage(){
    const out = { total: PIECES.length, live:0, ready:0, scaffold:0, planned:0, blocked:0, byFamily:{} };
    for(const k in F) out.byFamily[k] = { name:F[k].name, icon:F[k].icon, why:F[k].why, total:0, live:0 };
    for(const p of PIECES){ out[p.status]++; out.byFamily[p.family].total++; if(p.status === "live") out.byFamily[p.family].live++; }
    out.pct = Math.round(((out.live + out.ready) / out.total) * 100);
    return out;
  }
  /* every piece that claims a URL we can actually touch */
  function probeTargets(){
    return PIECES.filter(p => p.url && /^https?:/i.test(p.url)).map(p => ({ id:p.id, url:p.url, expect:p.expect || null, status:p.status }));
  }

  window.ObiConstellation = { F, STATUS, PIECES, rows, get, coverage, probeTargets };

  /* the scout's `pieces` probe lives with the data (same as the ecosystem probe) */
  if(window.ObiScout){
    window.ObiScout.hooks.constellation = async () => {
      const targets = probeTargets();
      const rowsOut = [], cache = [];
      let live = 0, dead = 0;
      for(const t of targets){
        try{
          const r = await window.root.superFetch(t.url, { headers: { "User-Agent": "ObiConstellation/1" } });
          const body = await r.text();
          const hit = !t.expect || body.indexOf(t.expect) !== -1;
          /* a gate that answers 400 ON PURPOSE (e.g. soul-logger refusing an
             unauthenticated aggregate count) is the piece working, not drifting —
             same reading the scout's `fleet` probe applies. */
          const gated = r.status === 400 && hit;
          const ok = (r.status === 200 || gated) && hit;
          if(ok) live++; else dead++;
          rowsOut.push([t.id, (ok ? (gated ? "LIVE (" + r.status + " as designed)" : "LIVE") : "DRIFT") + " · HTTP " + r.status, body.length + " B" + (t.expect ? " · marker \"" + t.expect + "\" " + (hit ? "present" : "ABSENT") : "")]);
          cache.push(["piece:" + t.id, ok]);
        }catch(e){
          dead++;
          rowsOut.push([t.id, "DEAD", String(e.message).slice(0, 110)]);
          cache.push(["piece:" + t.id, false]);
        }
      }
      const rest = PIECES.filter(p => !targets.some(t => t.id === p.id));
      if(rest.length) rowsOut.push([rest.length + " piece(s) with no URL to touch", "NOT PROBED", rest.map(p => p.id + " (" + p.status + ")").join(" · ")]);
      return {
        verdict: dead === 0 ? "LIVE" : (live ? "DRIFT" : "DEAD"),
        summary: live + "/" + targets.length + " constellation pieces answering" + (dead ? " · " + dead + " unreachable or drifted" : ""),
        rows: rowsOut, cache
      };
    };
  }
})();
