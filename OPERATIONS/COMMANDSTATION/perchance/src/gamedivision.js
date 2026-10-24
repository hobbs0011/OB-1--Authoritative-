/* PORTED 2026-10-22 from phoenix-rising-ai-solutions-agent99-gamingcommand (gamingcommand station, save 8) — the Gaming division recon hand (Roblox TRAIN 6-7 Survive a Brainrot mirror sweep). Byte-identical below this header; wired as /gaming in app.js dispatch + help table, loaded in index.html after pushpull.js. Reads one public GitHub endpoint, writes nothing except a local cache; embedded manifest fallback. */
/* THE GAMING DIVISION — src/gamedivision.js

   WHAT THIS IS. The Gaming division's recon hand. Its job, in the sovereign's
   own words: "you are gaming division building roblox 6-7 but its already built
   find it all /phoenixSCOUT".

   TRAIN 6-7 — "Survive a Brainrot" — is the Roblox wave-survival game built for
   the account PhoenixRisingGames in the Gospel 444 palette (purple #a855f7 ·
   gold #f59e0b · dark #0f0f1a — NO BLUE). It is NOT built here and it is not a
   perchance generator: it was built in the canon and is MIRRORED, whole, into the
   PUBLIC monorepo Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate. That is
   exactly why /phoenixSCOUT could not find it — the scout's CANON sector reads
   the PRIVATE authority (OB-1--Authoritative-@canon) and is BLOCKED with no PAT,
   and until now no sector read the public mirror at all. This module IS that
   sector, as a command.

   It sweeps the mirror's git tree (ONE public GitHub call — no token needed) and
   returns the WHOLE build: every path, grouped by its home, with its size. It
   downloads nothing and writes nothing — this is recon, like every other scout.
   The last sweep is cached locally, and a manifest of the build as it stood when
   this file shipped is EMBEDDED below, so the division still answers when the
   network or the rate limit says no — and it always names WHICH of the three it
   used (live · cached · embedded).

   HONEST LIMITS, stated the way /phoenixSCOUT states them:
     · the public mirror IS a mirror. The authoritative copy is the private canon;
       anything that lives only there is not visible from here (no PAT — /gh token).
     · a path this sweep did not find is "not found", never "does not exist"
       (RECON.001). The mirror moves: it held 156 of these files on 2026-09-21 and
       168 on 2026-09-23.
     · the game is CODE COMPLETE, NOT LIVE. Roblox rejects a purchase with product
       id 0; the 21 Game Pass / Dev Product ids are placeholders still, and the
       place has not been published. Source shipped is not game shipped.
   ========================================================================== */
(function(){
  "use strict";

  var VERSION = "GD.001";

  var MIRROR = {
    owner:"Phoenix-Rising-Ai-Solutions",
    repo:"Phoenix-Rising-Ultimate",
    branch:"main",
    page:"https://github.com/Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate"
  };
  var RAW = "https://raw.githubusercontent.com/Phoenix-Rising-Ai-Solutions/Phoenix-Rising-Ultimate/main/";

  var GAME = {
    id:"train-6-7",
    name:"Survive a Brainrot",
    lesson:"Train 6-7 — Natural English Training",
    account:"PhoenixRisingGames",
    engine:"Roblox · Lua · server-authoritative · 2-RemoteEvent architecture · mobile-first",
    framework:"20×20×20×20 — Classes × Weapons × Enemies × Bosses",
    palette:"GOSPEL 444 — Neon Purple #a855f7 · Brushed Gold #f59e0b · Deep Dark #0f0f1a · BLUE FORBIDDEN",
    phase1:"40-45 min demo · exactly 5 players (viral lobby gate) · Defense → Town (Rusted Depot) → Boss — Baron Skibidi (HP 2500) → '99 days to Sanctuary' · squad bonus +30% XP at 5/5"
  };

  /* THE RULING — the canon's own status documents, quoted, not paraphrased. */
  var RULING = {
    state:"CODE COMPLETE — NOT LIVE",
    words:"The canon's own status documents rule the game CODE COMPLETE and pin the ONE blocker to placeholder monetisation ids. Source shipped is not game shipped: the place has not been published, so the build is CODE COMPLETE and DEPLOY-BLOCKED, and this division never calls it live.",
    docs:[
      ["CANON/TRAIN-67/LAUNCH/LAUNCH-STATUS-FINAL.md", "Run 89 · 2026-03-28", "CODE COMPLETE — awaiting Michael for Product IDs + Publish. Supersedes the Turn-Key packet (stale March 25)."],
      ["CANON/TRAIN-67/DOCS/GAME-BIBLE-DEPLOY-STATUS-FINAL.md", "Run 92 · 2026-03-29", "all 41 modules ready, 0 hours remaining — 'ONLY BLOCKER: 21 PRODUCT IDs = 0.'"],
      ["CANON/TRAIN-67/DOCS/FINAL-CODE-INTEGRITY-REPORT.md", "Run 93 · 2026-03-29", "all 48 Lua files in CODE/ swept clean — zero HTML entities, zero broken requires. LAUNCH-READY (with 1 known blocker)."]
    ]
  };

  /* WHAT IS BETWEEN THIS BUILD AND THE PUBLIC — fail-loud, each with the exact hand that clears it. */
  var BLOCKERS = [
    { label:"MONETISATION IDS", blocks:true,
      what:"21 placeholder Product IDs = 0 — 10 Game Passes + 11 Dev Products. Roblox rejects a purchase with id 0, so the shop is dead until they are real.",
      need:"Michael creates them in the Roblox Creator Dashboard and pastes the real ids into GamePassConfig.lua + DevProductsConfig.lua — ProductIDReplacementGuide.md names every location." },
    { label:"PUBLISH", blocks:true,
      what:"the experience is not published as a live, public game — but the place itself is NOT a to-do: the deploy workflow already carries the real universe and place ids as its defaults, so the experience exists on Roblox and publishing is a DISPATCH, not a build-from-nothing.",
      need:"set the one GitHub secret the workflow names (`ROBLOX_API_KEY` — an Open Cloud key scoped to that universe), then run the Roblox Place Deploy workflow (Actions → Run workflow, or `gh workflow run roblox-place-deploy.yml`): Rojo builds default.project.json → build.rbxl and Open Cloud publishes it, fail-closed, 3 retries on a busy server. Studio copy/paste (StudioModulePlacementMap.md) is the manual FALLBACK, not the path. /gamedivision deploy prints the live ids and endpoint." },
    { label:"DEPLOY TREE DRIFT", blocks:true,
      what:"the automation's tree does not agree with the server's own boot script. default.project.json maps 39 of the 49 CODE files; the v2.2 boot order names modules the tree does not carry (DayScaling · CombatRewardsManager) and CombatSystem lazily requires two more it omits (WeaponData · EnemyData). Because those are optional/lazy, that build BOOTS and then runs combat with no weapon or enemy data — which is worse than a crash, because it looks like it worked.",
      need:"reconcile default.project.json + StudioModulePlacementMap.md against CODE/UnifiedServer.server.lua's BOOT_ORDER, then verify with a Studio F5 (or `rojo serve`). /gamedivision deploy reports the whole disagreement live — and the division only READS these files, so its finding is a flag for an engineer, never a proof." },
    { label:"OPEN CLOUD KEY", blocks:true,
      what:"no Open Cloud API key is bound for DataStore + MessagingService (the save layer and the cross-server messages ride on it).",
      need:"create.roblox.com → Credentials → API Keys → scope DataStore + MessagingService to the place; allow HTTP requests + API services in Studio." },
    { label:"DEFERRED SURGERY", blocks:false,
      what:"11 files still carry English-learning references in comments, dead code and internal names (zero player-facing English remains).",
      need:"Update 1.1 surgery (Launch Status FINAL §5). Michael's CODE COMPLETE ruling covers it, so it does not block the launch." }
  ];

  var ROOTS = [
    { id:"canon", path:"CANON/TRAIN-67",          label:"CANON/TRAIN-67 — the game's own canon (the plans, the audits, the deploy packet)" },
    { id:"app",   path:"APPS/TRAIN-6-7",          label:"APPS/TRAIN-6-7 — the build harness" },
    { id:"art",   path:"ASSETS/ARTWORK/TRAIN-67", label:"ASSETS/ARTWORK/TRAIN-67 — the artwork brief" }
  ];
  /* files ANYWHERE else in the mirror that carry the game's own words — the proofs,
     the RAW SOUL recapture of the Train 6-7 sessions, the Omega lesson archive */
  var LOOSE = /Train-?6-?7|brainrot|skibidi|survive a brainrot/i;
  /* and the ROBLOX WORK AROUND IT, which is not named after the game: the place-deploy
     workflow, the incubator submissions and countdown, the studio guides, the heavy
     ledger rows and the reincarnation session records of the Roblox runs. Without this
     the division would report 168 files and miss the deployment pipeline that publishes
     them — "find it ALL" cannot stop at the folder with the game's name on it. */
  var RELATED = /roblox|incubator/i;

  var CACHE_KEY = "obi_gd_mirror_v3", CACHE_TTL = 10 * 60 * 1000;

  /* THE MANIFEST AS IT STOOD WHEN THIS FILE SHIPPED — the fallback that needs no
     network. One "path|bytes" per line; rebuild it by re-running this file's own
     live sweep (/gamedivision rescan). */
  var EMBEDDED = ".github/workflows/roblox-place-deploy.yml|2903\nAPPS/TRAIN-6-7/Archive/DemoFramework.lua|3578\nAPPS/TRAIN-6-7/Archive/MainServer_v2_Production.lua|0\nAPPS/TRAIN-6-7/CommandBar/PitchDeckConstructor.lua|0\nAPPS/TRAIN-6-7/CommandBar/Stage18_WhaleTrap.lua|0\nAPPS/TRAIN-6-7/DEMO_BUILD_BLUEPRINT.lua|0\nASSETS/ARTWORK/TRAIN-67/README.md|641\nCANON/HEAVY-LEDGER/HL-114-incubator-submission-assets.json|3363\nCANON/HEAVY-LEDGER/HL-115-incubator-countdown-dual-publish.json|5135\nCANON/HEAVY-LEDGER/HL-119-roblox-studio-guide-48hr-launch.json|5678\nCANON/HEAVY-LEDGER/HL-124-roblox-deep-intel.json|7255\nCANON/HEAVY-LEDGER/HL-125-roblox-deploy-github-first-boot.json|8282\nCANON/PROOFS-CHAT-2026-04-05/PROOF-Phoenix-Transend-TRAIN-67-1-FIRST.md|1356\nCANON/PROOFS-CHAT-2026-04-05/PROOF-Phoenix-Transend-TRAIN-67-1-LAST.md|125\nCANON/PROOFS-CHAT-2026-04-05/PROOF-Phoenix-Transend-TRAIN-67-1-MIDDLE.md|395\nCANON/REINCARNATION/2026-03-26-roblox-deep-intel.md|4288\nCANON/REINCARNATION/2026-03-28-roblox-combat-recode-launch.md|10132\nCANON/REINCARNATION/2026-03-28-roblox-deploy-github-first-boot.md|8002\nCANON/REINCARNATION/2026-03-30-roblox-studio-guide-48hr-launch.md|5080\nCANON/REINCARNATION/2026-04-01-incubator-countdown-dual-publish.md|4350\nCANON/REINCARNATION/2026-04-01-incubator-submission-assets-t108h.md|1667\nCANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05/0132-RAW-_KEY3_-_PHOENIX_35.5_TRAIN-6-7_txt.md|2088038\nCANON/SOUL-DNA-BIBLE-RECAPTURE-UNFILTERED-2026-04-05/0704-RAW-Phoenix-Transend-TRAIN-67-1_txt.md|278987\nCANON/TRAIN-67/100-POINT-HARDENING-AUDIT.md|11834\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-10-DISCORD-RECON.md|5690\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-11-DISCORD-BOT-ARCHITECTURE.md|6817\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-12-CONTENT-CALENDAR.md|5583\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-13-DISCORD-BUILD-DEPLOY.md|7526\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-14-ARTWORK-INTAKE.md|5533\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-15-TEMPLATE-ENGINE.md|6485\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-16-CONTENT-GENERATION.md|7468\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-17-CROSS-PLATFORM-DISTRIBUTION.md|7337\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-18-INTEGRATION-TEST.md|6746\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-19-LOAD-STRESS-SIMULATION.md|7174\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-20-FINAL-BATTLE-REPORT.md|11576\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-3-GAME-SIMULATION.md|19433\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-4-TWO-SERVER-STRESS-TEST.md|6913\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-5-ECONOMY-BREAK-TEST.md|6392\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-6-ANTI-CHEAT-PENETRATION.md|7341\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-7-DATA-PERSISTENCE-TORTURE.md|7612\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-8-WEBSITE-DOMAIN-HEALTH.md|6546\nCANON/TRAIN-67/BATTLE-REPORT/STAGE-9-GITHUB-REPO-SECURITY.md|6865\nCANON/TRAIN-67/BATTLE-STAGE-02-ATTACK-SURFACE-MAP.md|5353\nCANON/TRAIN-67/BOT-BOOT-CONTRACT-V1.md|2021\nCANON/TRAIN-67/CODE/AnalyticsService.lua|15859\nCANON/TRAIN-67/CODE/AnomalyDetector.lua|16825\nCANON/TRAIN-67/CODE/BattlePass.lua|12841\nCANON/TRAIN-67/CODE/ChallengeManager.lua|15783\nCANON/TRAIN-67/CODE/ClientBridge.lua|6627\nCANON/TRAIN-67/CODE/CodexClient.lua|7169\nCANON/TRAIN-67/CODE/CodexData.lua|5274\nCANON/TRAIN-67/CODE/CombatRewardsManager.lua|7034\nCANON/TRAIN-67/CODE/CombatSystem.lua|28917\nCANON/TRAIN-67/CODE/CosmeticController.lua|46091\nCANON/TRAIN-67/CODE/DailyRewards.lua|12980\nCANON/TRAIN-67/CODE/DataStoreV2.lua|9430\nCANON/TRAIN-67/CODE/DayScaling.lua|8915\nCANON/TRAIN-67/CODE/DevProductsConfig.lua|10264\nCANON/TRAIN-67/CODE/EconomyManager.lua|17226\nCANON/TRAIN-67/CODE/EloManager.lua|32206\nCANON/TRAIN-67/CODE/EnemyData.lua|14088\nCANON/TRAIN-67/CODE/EnemyFactory.lua|10351\nCANON/TRAIN-67/CODE/EnglishRewardsManager.lua|41380\nCANON/TRAIN-67/CODE/FTUEController.lua|33080\nCANON/TRAIN-67/CODE/FTUEManager.lua|19168\nCANON/TRAIN-67/CODE/FTUEWiring.lua|5754\nCANON/TRAIN-67/CODE/GachaManager.lua|13629\nCANON/TRAIN-67/CODE/GameMain_PHASE1_REVISED.lua|27093\nCANON/TRAIN-67/CODE/GamePassConfig.lua|14701\nCANON/TRAIN-67/CODE/GuildManager.lua|15257\nCANON/TRAIN-67/CODE/HUDController_PHASE1_REVISED.lua|15476\nCANON/TRAIN-67/CODE/HUDController_v2.lua|17169\nCANON/TRAIN-67/CODE/LeaderboardManager.lua|14550\nCANON/TRAIN-67/CODE/LedgerSchema.lua|3863\nCANON/TRAIN-67/CODE/MainServer_v2.lua|17292\nCANON/TRAIN-67/CODE/MobileInputController.lua|39498\nCANON/TRAIN-67/CODE/MonetizationOrchestrator.lua|34124\nCANON/TRAIN-67/CODE/MonetizationServer.lua|9425\nCANON/TRAIN-67/CODE/PrestigeManager.lua|13911\nCANON/TRAIN-67/CODE/QuestionBank.lua|36122\nCANON/TRAIN-67/CODE/QuestionBankV2.lua|22702\nCANON/TRAIN-67/CODE/QuestionChunks/Mouse_A.lua|22012\nCANON/TRAIN-67/CODE/ReceiptRouter.lua|25869\nCANON/TRAIN-67/CODE/ReferralSystem.lua|12521\nCANON/TRAIN-67/CODE/RewardBridge.lua|9143\nCANON/TRAIN-67/CODE/SecurityLayer.lua|7568\nCANON/TRAIN-67/CODE/ServerGateway.lua|12192\nCANON/TRAIN-67/CODE/TradeManager.lua|16491\nCANON/TRAIN-67/CODE/UnifiedClient.client.lua|12385\nCANON/TRAIN-67/CODE/UnifiedServer.server.lua|16909\nCANON/TRAIN-67/CODE/WaveManager.lua|8246\nCANON/TRAIN-67/CODE/WeaponData.lua|17700\nCANON/TRAIN-67/CODE/WorldBoss.lua|12776\nCANON/TRAIN-67/COMBAT-REPLACEMENT-SPEC.md|12068\nCANON/TRAIN-67/COMBAT-RESEARCH-FULL-20-STAGE-PIPELINE.md|27929\nCANON/TRAIN-67/COMBAT-RESEARCH-PIPELINE.md|8423\nCANON/TRAIN-67/DEPLOYMENT-PIPELINE-20-STAGE.md|2652\nCANON/TRAIN-67/DOCS/10DayLaunchSprintAssessment.md|16876\nCANON/TRAIN-67/DOCS/AnalyticsTelemetryIntegrationSpec.md|43970\nCANON/TRAIN-67/DOCS/BATTLE-PASS-S1-DESIGN.md|2814\nCANON/TRAIN-67/DOCS/COMBAT-ENEMY-AUDIT-REPORT.md|5383\nCANON/TRAIN-67/DOCS/CombatEnglishBridgeSpec.md|49828\nCANON/TRAIN-67/DOCS/ContentCalendar.md|2183\nCANON/TRAIN-67/DOCS/CosmeticTrinityIntegrationSpec.md|45887\nCANON/TRAIN-67/DOCS/DAY1-HOTFIX-PLAYBOOK.md|13337\nCANON/TRAIN-67/DOCS/DISCORD-SERVER-SETUP-GUIDE.md|19694\nCANON/TRAIN-67/DOCS/DataStoreV2IntegrationSpec.md|28244\nCANON/TRAIN-67/DOCS/DiscordBotMVP.md|6311\nCANON/TRAIN-67/DOCS/ECONOMY-DATA-SCALING-AUDIT-REPORT.md|7094\nCANON/TRAIN-67/DOCS/ELO-SECURITY-AUDIT-REPORT.md|3269\nCANON/TRAIN-67/DOCS/EnglishRewardsManagerSpec.md|40283\nCANON/TRAIN-67/DOCS/FINAL-CODE-INTEGRITY-REPORT.md|7706\nCANON/TRAIN-67/DOCS/FTUE-AUDIT-REPORT.md|6300\nCANON/TRAIN-67/DOCS/FTUECompressionAnalysis.md|12791\nCANON/TRAIN-67/DOCS/FTUEImplementationSpec.md|38667\nCANON/TRAIN-67/DOCS/GAME-BIBLE-DEPLOY-STATUS-FINAL.md|3691\nCANON/TRAIN-67/DOCS/GAME-CODES-CONFIG.md|2210\nCANON/TRAIN-67/DOCS/GO-NO-GO-Assessment.md|2588\nCANON/TRAIN-67/DOCS/GamePageSEO.md|2854\nCANON/TRAIN-67/DOCS/GuildManagerIntegrationSpec.md|40017\nCANON/TRAIN-67/DOCS/INCUBATOR-SUBMISSION-ASSETS.md|8127\nCANON/TRAIN-67/DOCS/IntegrationTestPlan.md|6351\nCANON/TRAIN-67/DOCS/LAUNCH-DAY-PLAYBOOK.md|7008\nCANON/TRAIN-67/DOCS/LaunchAnnouncementPack.md|2334\nCANON/TRAIN-67/DOCS/MASTER-CODE-INTEGRITY-REPORT-V2.md|5727\nCANON/TRAIN-67/DOCS/MASTER-LAUNCH-READINESS-PACKET.md|7722\nCANON/TRAIN-67/DOCS/MONETIZATION-AUDIT-REPORT.md|6430\nCANON/TRAIN-67/DOCS/MobileFirstEnglishInputDesign.md|23784\nCANON/TRAIN-67/DOCS/MonetizationArchitectureDeepDive.md|21066\nCANON/TRAIN-67/DOCS/MonetizationOrchestratorSpec.md|43141\nCANON/TRAIN-67/DOCS/PHASE-B-CONTENT-AUDIT.md|2204\nCANON/TRAIN-67/DOCS/PostLaunchMonitorPlan.md|2083\nCANON/TRAIN-67/DOCS/PreLaunchGoLivePlaybook.md|15284\nCANON/TRAIN-67/DOCS/ProductIDReplacementGuide.md|9347\nCANON/TRAIN-67/DOCS/PublishChecklist.md|4195\nCANON/TRAIN-67/DOCS/QuestionBankV2-Studio-Chunking-Notes.md|2951\nCANON/TRAIN-67/DOCS/RobloxIncubatorApplicationDraft-V2.md|18986\nCANON/TRAIN-67/DOCS/RobloxIncubatorApplicationDraft.md|15510\nCANON/TRAIN-67/DOCS/RobloxLaunchIntelligence-DeepDive-GapClosure.md|19526\nCANON/TRAIN-67/DOCS/RobloxLaunchIntelligence-March2026.md|8077\nCANON/TRAIN-67/DOCS/RojoCICDOperationsGuide.md|9815\nCANON/TRAIN-67/DOCS/STORE-LISTING-COPY.md|8526\nCANON/TRAIN-67/DOCS/ServerArchitectureQuestionBankScaling.md|35699\nCANON/TRAIN-67/DOCS/Studio-Integration-Checklist.md|3539\nCANON/TRAIN-67/DOCS/StudioIntegrationChecklist.md|4667\nCANON/TRAIN-67/DOCS/StudioIntegrationGuide.md|6419\nCANON/TRAIN-67/DOCS/StudioModulePlacementMap.md|11777\nCANON/TRAIN-67/DOCS/StudioSmokeTestScript.md|3213\nCANON/TRAIN-67/DOCS/ThumbnailIconSpec.md|2984\nCANON/TRAIN-67/DOCS/WEEK1-CONTENT-CALENDAR.md|19748\nCANON/TRAIN-67/GAME-BIBLE-HUMAN-READABLE.md|43689\nCANON/TRAIN-67/LAUNCH/LAUNCH-CHECKLIST.md|620\nCANON/TRAIN-67/LAUNCH/LAUNCH-PIPELINE-10.md|2189\nCANON/TRAIN-67/LAUNCH/LAUNCH-STATUS-FINAL.md|9306\nCANON/TRAIN-67/LAUNCH/PIPELINE-TO-10.md|870\nCANON/TRAIN-67/LAUNCH/RUNBOOK.md|1511\nCANON/TRAIN-67/MARKET-RESEARCH-SYNTHESIS-Q1-Q20.md|9943\nCANON/TRAIN-67/MARKETPLACE-SPECS.md|3129\nCANON/TRAIN-67/MEME-RESEARCH-PIPELINE.md|6109\nCANON/TRAIN-67/MONEY-PRINTER-PIPELINE.md|18039\nCANON/TRAIN-67/QUICK-START-V1.md|5891\nCANON/TRAIN-67/README.md|9480\nCANON/TRAIN-67/REVISION-SUMMARY.md|7315\nCANON/TRAIN-67/ROBLOX-STRATEGY-CONSOLIDATED.md|21910\nCANON/TRAIN-67/SPECS/BATTLE-PASS-SEASON-1-SPEC.md|7867\nCANON/TRAIN-67/SPECS/DISCORD-AUTOMATION-PLAYBOOK.md|10995\nCANON/TRAIN-67/SPECS/MONETIZATION-IMPLEMENTATION-SPEC.md|12353\nCANON/TRAIN-67/SPECS/RNG-MUTATION-SYSTEM-SPEC.md|7553\nCANON/TRAIN-67/SPECS/TRADING-SYSTEM-SPEC.md|7758\nCANON/TRAIN-67/STAGE-01-FTUE-DESIGN-SPEC.md|5862\nCANON/TRAIN-67/STAGE-06-THUMBNAIL-ICON-SPEC.md|4237\nCANON/TRAIN-67/STAGE-07-MOBILE-CONTROLS-AUDIT.md|5032\nCANON/TRAIN-67/STAGE-08-ENGLISH-POWERUP-SPEC.md|7192\nCANON/TRAIN-67/STAGE-15-COSMETIC-TRINITY-SPEC.md|7699\nCANON/TRAIN-67/STAGE-18-LIMITED-TIME-EVENT-SPEC.md|6955\nCANON/TRAIN-67/STUDIO-INTEGRATION-CHECKLIST.md|5147\nCANON/TRAIN-67/SURGERY-COMPLETION-TRACKER.md|9685\nCANON/TRAIN-67/TURN-KEY-DEPLOY-PACKET.md|3357\nCANON/TRAIN-67/TWO-SERVER-PROBLEM-ARCHITECTURE.md|20847\nGALAXY-LESSONS/NET-Train-6-7-Omega-Archive.html|27879";
  var EMBEDDED_AT = "2026-09-23T22:06:37.315Z";

  /* ------------------------------ helpers ------------------------------ */
  function e(s){ return (typeof esc === "function") ? esc(s) : String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function size(b){
    b = b || 0;
    if(b < 1024) return b + " B";
    if(b < 1048576) return Math.round(b / 1024) + " KB";
    return (Math.round(b / 1048576 * 100) / 100) + " MB";
  }
  function when(ms){ try{ return new Date(ms).toLocaleString(); }catch(err){ return String(ms); } }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function rawUrl(p){ return RAW + String(p).split("/").map(encodeURIComponent).join("/"); }
  function link(p, text){ return '<a href="' + e(rawUrl(p)) + '" target="_blank" rel="noopener" style="color:var(--cyan)">' + e(text || p) + "</a>"; }
  function row(label, vd, rd, cls){ return '<div class="rrow' + (cls ? " " + cls : "") + '"><b>' + label + '</b><span class="vd">' + vd + "</span><div class=\"rd\">" + rd + "</div></div>"; }

  /* ------------------------------ the manifest ------------------------------ */
  function bucketOf(rel){
    if(!rel) return "(top)";
    var i = rel.indexOf("/");
    return i === -1 ? "(top)" : rel.slice(0, i) + "/";
  }

  function build(records, source){
    var m = { source:source, at:Date.now(), repo:MIRROR.owner + "/" + MIRROR.repo, branch:MIRROR.branch,
              verdict:"REAL", files:0, bytes:0, roots:[], strays:[], related:[], relatedFiles:0, relatedBytes:0, treeTotal:null, truncated:false, error:null };
    var byRoot = {};
    ROOTS.forEach(function(r){ byRoot[r.id] = { id:r.id, path:r.path, label:r.label, files:0, bytes:0, buckets:{}, names:[] }; });
    (records || []).forEach(function(rec){
      var p = rec.p, s = rec.s || 0, root = null;
      for(var i = 0; i < ROOTS.length; i++){
        var base = ROOTS[i].path;
        if(p === base || p.indexOf(base + "/") === 0){ root = byRoot[ROOTS[i].id]; break; }
      }
      if(root){
        root.files++; root.bytes += s;
        root.names.push(p);
        var rel = p.slice(root.path.length + 1), bkt = bucketOf(rel);
        var bb = root.buckets[bkt] || (root.buckets[bkt] = { files:0, bytes:0, names:[] });
        bb.files++; bb.bytes += s;
        bb.names.push(p);
      } else if(LOOSE.test(p)){
        m.strays.push({ p:p, s:s });
      } else if(RELATED.test(p)){
        m.related.push({ p:p, s:s });
      }
    });
    ROOTS.forEach(function(r){
      var rr = byRoot[r.id];
      if(rr.files){ m.roots.push(rr); m.files += rr.files; m.bytes += rr.bytes; }
    });
    m.strays.sort(function(a, b){ return a.p < b.p ? -1 : 1; });
    m.strays.forEach(function(x){ m.files++; m.bytes += x.s; });
    m.related.sort(function(a, b){ return a.p < b.p ? -1 : 1; });
    m.related.forEach(function(x){ m.relatedFiles++; m.relatedBytes += x.s; });
    m.verdict = (m.roots.length || m.strays.length) ? "REAL" : "MISSING";
    return m;
  }

  function embedded(){
    var recs = String(EMBEDDED).split("\n").filter(Boolean).map(function(l){
      var i = l.lastIndexOf("|");
      return { p:l.slice(0, i), s:Number(l.slice(i + 1)) || 0 };
    });
    var m = build(recs, "embedded");
    m.at = Date.parse(EMBEDDED_AT) || Date.now();
    return m;
  }

  function readCache(){
    try{
      var raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      var c = JSON.parse(raw);
      if(!c || !c.m || !c.m.roots) return null;
      c.m.source = "cached";
      return c;
    }catch(err){ return null; }
  }
  function writeCache(m){
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ at:Date.now(), m:m })); }catch(err){}
  }

  async function sweep(){
    var url = "https://api.github.com/repos/" + MIRROR.owner + "/" + MIRROR.repo + "/git/trees/" + MIRROR.branch + "?recursive=1";
    var r = await fetch(url, { headers:{ "Accept":"application/vnd.github+json" } });
    if(r.status !== 200){
      var why = r.status === 403 ? "GitHub rate limit (unauthenticated calls are 60/hour)"
              : r.status === 404 ? "the mirror answered 404 — repo or branch renamed"
              : "the mirror answered HTTP " + r.status;
      return { error:why, status:r.status };
    }
    var j = await r.json();
    var blobs = (j.tree || []).filter(function(t){ return t.type === "blob"; }).map(function(t){ return { p:t.path, s:t.size || 0 }; });
    var m = build(blobs, "live");
    m.treeTotal = (j.tree || []).length;
    m.truncated = !!j.truncated;
    return m;
  }

  /* find() — live if it can, cached if not, embedded as the floor. Never throws,
     never returns nothing, and always says which one it is. */
  async function find(opts){
    opts = opts || {};
    var cache = readCache();
    if(!opts.force && cache && (Date.now() - cache.at) < CACHE_TTL){ cache.m.source = "cached"; return cache.m; }
    var m = null, why = null;
    try{
      m = await sweep();
      if(m && !m.error){ writeCache(m); return m; }
      why = (m && m.error) || "the sweep returned nothing";
    }catch(err){ why = (err && err.message) || String(err); }
    var fb = cache ? cache.m : embedded();
    fb = clone(fb);
    fb.source = cache ? "cached" : "embedded";
    fb.error = why;
    if(!cache) fb.at = Date.parse(EMBEDDED_AT) || fb.at;
    return fb;
  }

  /* probe() — the same read, as one line, for the scout's MIRROR sector. */
  async function probe(){
    var m = await find({});
    var rows = [];
    m.roots.forEach(function(r){
      var parts = Object.keys(r.buckets).map(function(k){ return k.replace(/\/$/, "") + " " + r.buckets[k].files; });
      rows.push([r.path, r.files + " file(s) · " + size(r.bytes), parts.join(" · ")]);
    });
    if(m.strays.length) rows.push(["elsewhere in the mirror", m.strays.length + " file(s)", m.strays.slice(0, 4).map(function(x){ return x.p; }).join(" · ") + (m.strays.length > 4 ? " · …" : "")]);
    if(m.related && m.related.length) rows.push(["the Roblox work around it", m.relatedFiles + " file(s) · " + size(m.relatedBytes), m.related.slice(0, 5).map(function(x){ return x.p; }).join(" · ") + (m.related.length > 5 ? " · …" : "")]);
    var cache = m.roots.map(function(r){ return ["gd:" + r.path, true]; });
    if(m.verdict === "MISSING"){
      return { verdict:"FLAG", summary:"the mirror carries no TRAIN-6-7 path — the build is not in " + m.repo + "@" + m.branch + " (not found by this sweep, never 'does not exist' — RECON.001)", rows:rows, cache:cache };
    }
    return { verdict:"LIVE",
      summary:m.files + " file(s) · " + size(m.bytes) + " · " + m.roots.length + " root(s) in " + m.repo + "@" + m.branch + " (" + m.source + ") — " + RULING.state,
      rows:rows, cache:cache,
      facts:{ files:m.files, bytes:m.bytes, roots:m.roots.length, source:m.source } };
  }

  /* ------------------------------ cards ------------------------------ */
  function rootRows(m){
    return m.roots.map(function(r){
      var parts = Object.keys(r.buckets).sort().map(function(k){
        var bb = r.buckets[k];
        return "<b>" + e(k.replace(/\/$/, "")) + "</b> " + bb.files + " (" + size(bb.bytes) + ")";
      });
      return row("<code>" + e(r.id) + "</code>", r.files + " · " + size(r.bytes),
        e(r.path) + "<br>" + (parts.length ? parts.join(" · ") : "—"));
    }).join("");
  }

  function card(m){
    var srcLine = { live:"live sweep, just now", cached:"cached sweep (live last " + when(m.at) + ")", embedded:"EMBEDDED manifest (" + when(m.at) + ") — the network did not answer" }[m.source] || m.source;
    var html = '<div class="rise"><div class="rhead">🎮 THE GAMING DIVISION — ' + e(GAME.name) + " (" + e(GAME.lesson) + ")</div>";
    html += row("GAME", e(GAME.account), "<b>" + e(GAME.name) + "</b> — " + e(GAME.engine) + "<br>" + e(GAME.framework) + "<br>" + e(GAME.palette) + "<br>" + e(GAME.phase1));
    html += row("BUILD", '<span style="color:#f5a623">' + e(RULING.state) + "</span>", e(RULING.words));
    html += row("SWEPT", m.files + " FILES · " + size(m.bytes),
      "source: <b>" + e(srcLine) + "</b>" + (m.treeTotal ? " · the mirror tree holds " + m.treeTotal + " paths" + (m.truncated ? " (TRUNCATED by the API)" : "") : "") +
      "<br>" + link("CANON/TRAIN-67/README.md", m.repo + "@" + m.branch) + (m.error ? '<br><span style="color:#f5a623">the live sweep did not answer: ' + e(m.error) + " — this is the last known state, not a fresh read.</span>" : ""));
    html += rootRows(m);
    if(m.strays.length){
      html += row("CARRIED ELSEWHERE", m.strays.length + " FILES",
        m.strays.map(function(x){ return link(x.p, x.p) + " <span style=\"opacity:.6\">" + size(x.s) + "</span>"; }).join("<br>") +
        '<br><span style="opacity:.75">these are not under a TRAIN-67 root but they carry the game\'s own words — the chat PROOFS, the RAW SOUL recapture of the Train 6-7 sessions, the Omega lesson archive.</span>');
    }
    if(m.related && m.related.length){
      html += row("THE ROBLOX WORK AROUND IT", m.relatedFiles + " FILES · " + size(m.relatedBytes),
        m.related.map(function(x){ return link(x.p, x.p) + ' <span style="opacity:.6">' + size(x.s) + "</span>"; }).join("<br>") +
        '<br><span style="opacity:.75">not named after the game, but part of getting it live: the place-deploy workflow, the incubator submissions and countdown, the studio guides, the roblox intel and the launch session records.</span>');
    }
    html += row("THE RULING", '<span style="color:#4cd97b">' + e(RULING.state) + "</span>",
      RULING.docs.map(function(d){ return "<b>" + e(d[1]) + "</b> · " + link(d[0], d[0].split("/").pop()) + "<br><span style=\"opacity:.8\">" + e(d[2]) + "</span>"; }).join("<br>"));
    html += row("THE DEPLOY TREE", '<span style="color:#5ac8fa">RECONCILABLE</span>',
      "the mirror ships an <b>automated</b> publish path — GitHub Actions builds the place with Rojo and pushes it through Roblox Open Cloud, and the workflow already carries the real universe and place ids. <b>/gamedivision deploy</b> reads that path and reconciles the build tree against the server's own boot order (what it finds is a flag, not a verdict — the division cannot run Roblox; an F5 decides).");
    html += BLOCKERS.map(function(b){
      return row((b.blocks ? "🔴 " : "🟡 ") + e(b.label), b.blocks ? "BLOCKS LAUNCH" : "NON-BLOCKING", e(b.what) + "<br><b>to clear:</b> " + e(b.need));
    }).join("");
    html += '<div class="rfoot">Found — not built here: the game lives in the <b>public mirror</b> ' + e(m.repo) + " @" + e(m.branch) + ', whole. The <b>authoritative</b> copy is the private canon (no PAT from this browser, so any file that lives only there is outside this sweep). <b>/gamedivision code</b> · every module, linked · <b>/gamedivision docs</b> · the plan · <b>/gamedivision status</b> · the deploy truth · <b>/gamedivision rescan</b> · force a live sweep.</div></div>';
    return html;
  }

  function statusCard(){
    var html = '<div class="rise"><div class="rhead">🎮 ' + e(GAME.name) + " — THE DEPLOY TRUTH</div>";
    html += row("VERDICT", '<span style="color:#4cd97b">' + e(RULING.state) + "</span>", "the code is written, hardened and audited; the game is not on Roblox. " + e(RULING.words));
    html += row("AT LAUNCH", e(GAME.account), e(GAME.engine) + "<br>" + e(GAME.phase1));
    html += BLOCKERS.map(function(b){
      return row((b.blocks ? "🔴 " : "🟡 ") + e(b.label), b.blocks ? "BLOCKS LAUNCH" : "NON-BLOCKING", e(b.what) + "<br><b>to clear:</b> " + e(b.need));
    }).join("");
    html += row("MICHAEL'S PATH", "30-60 MIN", "1 · Creator Dashboard → create the 10 Game Passes + 11 Dev Products → copy every id. 2 · paste them into GamePassConfig.lua + DevProductsConfig.lua. 3 · paste the scripts into Studio per the placement map. 4 · F5-test. 5 · File → Publish, set Public.");
    html += '<div class="rfoot">' + RULING.docs.map(function(d){ return link(d[0], d[0].split("/").pop()); }).join(" · ") + " — this division reads those documents, it does not re-decide them.</div></div>";
    return html;
  }

  function fileCard(m, which){
    var titles = {
      code:{ head:"🎮 THE GAME'S CODE — every module", pick:function(k){ return k === "CODE/"; } },
      docs:{ head:"🎮 THE PLAN — canon documents", pick:function(k){ return k !== "CODE/"; } }
    };
    var t = titles[which] || titles.code;
    var root = m.roots.filter(function(r){ return r.id === "canon"; })[0];
    if(!root) return '<div class="rise"><div class="rhead">🎮 THE GAME</div>' + row("NO CANON ROOT", "MISSING", "the sweep found no CANON/TRAIN-67 — run /gamedivision rescan") + "</div>";
    /* every file, from the buckets themselves — not from a truncated name list.
       (The first cut read root.names, which held only the first 60 paths, so
       /gamedivision code showed 39 of the 49 modules and looked complete.) */
    var names = [], total = 0;
    Object.keys(root.buckets).sort().forEach(function(k){
      if(!t.pick(k)) return;
      total += root.buckets[k].files;
      root.buckets[k].names.forEach(function(p){ names.push(p); });
    });
    var lines = names.map(function(p){ return '<div style="margin:2px 0">' + link(p, p.slice(root.path.length + 1)) + "</div>"; }).join("");
    var html = '<div class="rise"><div class="rhead">' + t.head + " · " + names.length + (names.length !== total ? " shown of " + total : "") + "</div>";
    html += row("SOURCE", e(m.source), e(m.repo) + "@" + e(m.branch) + (m.error ? " — the live read failed (" + e(m.error) + "); this is the last known state" : ""));
    html += '<div class="rrow"><b>FILES</b><span class="vd">' + e(which === "code" ? "LUA" : "MD") + '</span><div class="rd" style="max-height:420px;overflow:auto">' + lines + "</div></div>";
    html += '<div class="rfoot">Every line opens the RAW file in the mirror. The authoritative copy is the private canon — some files may live only there (no PAT here).</div></div>';
    return html;
  }

  /* ==========================================================================
     THE DEPLOY TREE, RECONCILED — the division's second job.

     Finding the build is not enough: it has to reach Roblox. The canon ships an
     AUTOMATED path (a GitHub Actions workflow that builds the place with Rojo
     and publishes it through Open Cloud), so the division reads the three files
     that path depends on and asks whether they agree with each other:

        default.project.json            what the automation BELIEVES the game is
        CODE/UnifiedServer.server.lua   what the server actually BOOTS
        .github/workflows/…-deploy.yml  how it PUBLISHES, and to which place

        A map that disagrees with its own terrain is flagged, not averaged (L58).
        Every line here is read from the file it names, live. The division cannot
        execute Roblox, so a flag is a REQUEST FOR AN F5 — never a verdict on the
        game, and never a claim that anything is broken beyond what was read.
     ========================================================================== */
  var _rec = null, _recAt = 0, REC_TTL = 10 * 60 * 1000;

  function baseName(p){
    var n = String(p).split("/").pop();
    return n.replace(/\.lua$/i, "").replace(/\.(client|server)$/i, "");
  }

  async function getRaw(path){
    var r = await fetch(rawUrl(path), { cache:"no-store" });
    if(!r.ok) throw new Error("HTTP " + r.status + " reading " + path);
    return await r.text();
  }

  async function reconcile(opts){
    opts = opts || {};
    if(!opts.force && _rec && (Date.now() - _recAt) < REC_TTL) return _rec;
    var m = await find({});
    var canon = m.roots.filter(function(r){ return r.id === "canon"; })[0];
    var rec = { at:Date.now(), sweep:m.source, error:null,
      project:null, projectHasModulesFolder:false, workflow:null, boot:null, bootFound:false,
      codePaths:[], mappedPaths:[], unmapped:[], bootNames:[], bootMissing:[], requiredMissing:[],
      mappedNotBooted:[], bootSearchesModules:null, layout:null, stamps:{} };
    if(!canon){ rec.error = "the sweep found no CANON/TRAIN-67 — there is nothing to reconcile"; _rec = rec; _recAt = Date.now(); return rec; }
    rec.codePaths = ((canon.buckets["CODE/"] || { names:[] }).names).slice().sort();

    /* 1 — WHAT THE AUTOMATION BELIEVES THE GAME IS */
    try{
      var pjSrc = await getRaw("default.project.json");
      rec.stamps.project = "default.project.json";
      var pj = JSON.parse(pjSrc);
      rec.project = pj.name || null;
      var mapped = [];
      (function walk(n){
        for(var k in n){
          var v = n[k];
          if(v && typeof v === "object"){
            if(typeof v.$path === "string") mapped.push(v.$path);
            walk(v);
          }
        }
      })(pj.tree || {});
      rec.mappedPaths = mapped.sort();
      rec.projectHasModulesFolder = pjSrc.indexOf('"Modules"') !== -1;
      var mset = {}; mapped.forEach(function(p){ mset[p] = 1; });
      rec.unmapped = rec.codePaths.filter(function(p){ return !mset[p]; });
    }catch(err){ rec.error = "default.project.json: " + ((err && err.message) || err); }

    /* 2 — WHAT THE SERVER ACTUALLY BOOTS */
    try{
      var bootSrc = await getRaw("CANON/TRAIN-67/CODE/UnifiedServer.server.lua");
      rec.stamps.boot = "CANON/TRAIN-67/CODE/UnifiedServer.server.lua";
      var re = /name\s*=\s*"([^"]+)"\s*,\s*path\s*=\s*"([^"]+)"\s*,\s*required\s*=\s*(true|false)/g, hit;
      while((hit = re.exec(bootSrc))) rec.bootNames.push({ name:hit[1], path:hit[2], required:hit[3] === "true" });
      rec.bootFound = rec.bootNames.length > 0;
      /* does the boot know about a `Modules` folder at all? The tree puts every
         module inside one, so this one line decides whether the two agree. */
      rec.bootSearchesModules = /FindFirstChild\(\s*"Modules"\s*\)/.test(bootSrc) || /ServerScriptService:FindFirstChild\([^)]*,\s*true\s*\)/.test(bootSrc);
      rec.bootLookup = ((bootSrc.match(/local moduleScript = [\s\S]{0,240}?\)\s*\n/) || [""])[0] || "").replace(/\s+/g, " ").trim();
    }catch(err){ rec.error = (rec.error ? rec.error + " · " : "") + "UnifiedServer.server.lua: " + ((err && err.message) || err); }

    if(rec.mappedPaths.length && rec.bootFound){
      var mset2 = {}; rec.mappedPaths.forEach(function(p){ mset2[p] = 1; });
      var byName = {};
      rec.codePaths.forEach(function(p){ byName[baseName(p)] = p; });
      rec.bootMissing = rec.bootNames.filter(function(b){ return !mset2[byName[b.name] || ""]; }).map(function(b){ return { name:b.name, required:b.required }; });
      rec.requiredMissing = rec.bootMissing.filter(function(b){ return b.required; });
      var bset = {}; rec.bootNames.forEach(function(b){ bset[b.name] = 1; });
      rec.mappedNotBooted = rec.mappedPaths.filter(function(p){ return !bset[baseName(p)]; });
    }
    rec.layout = (rec.projectHasModulesFolder && rec.bootFound)
      ? (rec.bootSearchesModules
          ? { verdict:"COHERENT", detail:"the tree's Modules folder is searched by the boot — the two agree on where a module lives" }
          : { verdict:"FLAG", detail:"the tree puts every module inside a <b>Modules</b> folder, but the boot's lookup never searches one (it looks straight under a service) — on a Rojo-built place that is a module-not-found per required module" })
      : null;

    /* 3 — HOW IT PUBLISHES, AND TO WHICH PLACE */
    try{
      var wfSrc = await getRaw(".github/workflows/roblox-place-deploy.yml");
      var U = wfSrc.match(/universeId:[\s\S]{0,240}?default:\s*'(\d+)'/);
      var P = wfSrc.match(/placeId:[\s\S]{0,240}?default:\s*'(\d+)'/);
      var S = wfSrc.match(/secrets\.([A-Z0-9_]+)/);
      var B = wfSrc.match(/rojo build ([^\s]+)/);
      var E = wfSrc.match(/https:\/\/apis\.roblox\.com[^"'\s]+/);
      rec.workflow = { file:".github/workflows/roblox-place-deploy.yml",
        manual:/workflow_dispatch/.test(wfSrc), universe:U ? U[1] : null, place:P ? P[1] : null,
        secret:S ? S[1] : null, builder:B ? B[1] : null, endpoint:E ? E[0] : null,
        failClosed:/Fail-closed/.test(wfSrc), retries:/MAX_RETRIES=(\d+)/.test(wfSrc) ? Number(wfSrc.match(/MAX_RETRIES=(\d+)/)[1]) : null };
      rec.stamps.workflow = rec.workflow.file;
    }catch(err){ rec.error = (rec.error ? rec.error + " · " : "") + "workflow: " + ((err && err.message) || err); }

    /* 4 — DOES THE MANUAL PATH HAVE THE SAME GAP? (the placement map that a human
       follows in Studio). One more read, same question: is each unmapped module
       named there at all? A gap that appears in BOTH paths is not a typo. */
    try{
      var mapSrc = await getRaw("CANON/TRAIN-67/DOCS/StudioModulePlacementMap.md");
      rec.stamps.map = "CANON/TRAIN-67/DOCS/StudioModulePlacementMap.md";
      rec.mapDoc = { file:rec.stamps.map, missing:[] };
      rec.unmapped.forEach(function(p){
        var n = baseName(p);
        if(n === "Mouse_A") return;               /* a QuestionBankV2 overflow chunk, not a module */
        if(mapSrc.indexOf(n) === -1) rec.mapDoc.missing.push(n);
      });
    }catch(err){ rec.error = (rec.error ? rec.error + " · " : "") + "placement map: " + ((err && err.message) || err); }

    _rec = rec; _recAt = Date.now();
    return rec;
  }

  function deployCard(rec){
    var html = '<div class="rise"><div class="rhead">🎮 HOW ' + e(GAME.name).toUpperCase() + " REACHES ROBLOX — the tree, reconciled</div>";
    /* the automation */
    if(rec.workflow){
      var w = rec.workflow;
      html += row("THE PATH", '<span style="color:#4cd97b">AUTOMATED</span>',
        "<b>" + e(w.file) + "</b> — GitHub Actions installs Rojo, builds <code>" + e(w.builder || "default.project.json") + "</code> to <code>build.rbxl</code>, then publishes through Open Cloud" +
        (w.endpoint ? "<br><code>" + e(w.endpoint) + "</code>" : "") +
        "<br>trigger <b>" + e(w.manual ? "workflow_dispatch (a manual run)" : "unknown") + "</b>" + (w.retries ? " · " + w.retries + " retries on a busy server" : "") + (w.failClosed ? " · fail-closed: it refuses to publish with a blank id or a missing key" : "") +
        "<br><span style=\"opacity:.8\">No Studio copy/paste in this path — that is what makes it worth reconciling at all.</span>");
      html += row("THE PLACE", '<span style="color:#4cd97b">' + e(w.universe ? "UNIVERSE " + w.universe : "?") + " · " + e(w.place ? "PLACE " + w.place : "?") + "</span>",
        "the workflow carries the real ids as its defaults, so the experience already exists on Roblox. The one input missing is the secret <b>" + e(w.secret || "ROBLOX_API_KEY") + "</b> (an Open Cloud key scoped to that universe).");
    } else {
      html += row("THE PATH", "UNREAD", e(rec.error || "the deploy workflow could not be read from the mirror"));
    }
    /* the tree */
    if(rec.project){
      html += row("THE TREE", rec.mappedPaths.length + " OF " + rec.codePaths.length + " CODE FILES MAPPED",
        "Rojo project <b>" + e(rec.project) + "</b> — " + (rec.unmapped.length ? "<b>" + rec.unmapped.length + "</b> CODE file(s) are in no part of it." : "every CODE file is mapped.") +
        (rec.unmapped.length ? "<br>" + rec.unmapped.map(function(p){ return link(p, p.split("/").pop()); }).join(" · ") : ""));
    }
    /* the boot */
    if(rec.bootFound){
      html += row("THE BOOT", rec.bootNames.length + " MODULES · " + rec.requiredMissing.length + " REQUIRED & MISSING",
        "CODE/UnifiedServer.server.lua's own BOOT_ORDER — what the server loads, in order, at boot." +
        (rec.bootMissing.length
          ? "<br><b>" + rec.bootMissing.length + "</b> of them are in no part of the tree: " + rec.bootMissing.map(function(b){ return (b.required ? '<span style="color:#ff5a5a">' + e(b.name) + " (required)</span>" : e(b.name)); }).join(" · ")
          : "<br>every module it boots is in the tree.") +
        (rec.requiredMissing.length
          ? ""
          : '<br><span style="color:#4cd97b">no REQUIRED module is missing from the tree</span> — the two that are absent are optional, so a build from this tree logs a WARN and keeps going, not a FATAL.') +
        (rec.mappedNotBooted.length ? "<br><span style=\"opacity:.75\">mapped but not named in the BOOT_ORDER: " + e(rec.mappedNotBooted.map(function(p){ return baseName(p); }).join(" · ")) + " (the server boot script and the client boot themselves, plus config and data modules other modules require — informational, not a fault)</span>" : ""));
    } else if(rec.stamps.boot){
      html += row("THE BOOT", "UNREADABLE", "the boot order could not be parsed out of " + e(rec.stamps.boot) + " — the file's shape has changed, so nothing is claimed from it.");
    }
    /* the layout */
    if(rec.layout){
      html += row("THE LAYOUT", rec.layout.verdict === "FLAG" ? '<span style="color:#ff5a5a">FLAG</span>' : '<span style="color:#4cd97b">COHERENT</span>', rec.layout.detail + (rec.bootLookup ? '<br><code style="opacity:.7">' + e(rec.bootLookup) + "</code>" : ""));
    }
    if(rec.mapDoc){
      html += row("THE MANUAL PATH", rec.mapDoc.missing.length ? '<span style="color:#f5a623">SAME GAP</span>' : '<span style="color:#4cd97b">FULLER</span>',
        "StudioModulePlacementMap.md (the map a human follows in Studio) " +
        (rec.mapDoc.missing.length
          ? "also leaves out <b>" + e(rec.mapDoc.missing.join(" · ")) + "</b> — the same modules the Rojo tree omits, so this is a decision that was made twice, not a typo in one file."
          : "names every module the tree omits, so the two paths disagree with each other."));
    }
    html += row("WHAT IT MEANS", '<span style="color:#f5a623">FLAG — NEEDS AN F5</span>',
      "the automation's map and the server's boot do not fully agree. Because the modules in question are loaded lazily / optionally, a build from this tree would BOOT and then run combat with no weapon or enemy data — the failure mode that looks like success. Reconciling the tree is therefore part of the launch, not a detail after it." +
      "<br><b>To settle it:</b> open the place in Roblox Studio (or <code>rojo serve</code> against this repo), F5, and read the server console: UnifiedServer logs every module OK / WARN / FATAL by name.");
    html += '<div class="rfoot">Read live from ' + e([rec.stamps.project, rec.stamps.boot, rec.stamps.workflow].filter(Boolean).join(" · ")) +
      " — the mirror's own files, not a summary of them. <b>The division reads; it cannot run Roblox</b>, so this is a flag for an engineer, never a proof of breakage. <b>/gamedivision</b> · the find · <b>/gamedivision deploy rescan</b> · re-read all three.</div></div>";
    return html;
  }

  /* ------------------------------ the command ------------------------------ */
  async function cmd(arg){
    var a = String(arg || "").trim().toLowerCase();
    var t0 = Date.now();
    try{
      if(a === "status" || a === "truth"){
        addBubble("ass", statusCard());
        if(typeof logOp === "function") logOp({ kind:"scout", action:"gamedivision status", ok:true, detail:GAME.name, result:RULING.state });
        return;
      }
      var force = /rescan|refresh|scan|find|live|all/.test(a);
      /* the deploy path + the tree reconciliation (its own reads, its own cache) */
      if(a === "deploy" || a === "tree" || a === "drift" || a === "launch" || a === "launch path" || a === "publish"){
        var rec = await reconcile({ force:/rescan|refresh|live|force/.test(a) });
        addBubble("ass", deployCard(rec));
        if(typeof logOp === "function") logOp({ kind:"scout", action:"gamedivision deploy", ok:!rec.error,
          detail:(rec.stamps.workflow || "workflow unread") + " → " + (rec.workflow ? (rec.workflow.universe || "?") + "/" + (rec.workflow.place || "?") : "?") + " · " + MIRROR.repo + "@" + MIRROR.branch,
          result:"tree " + rec.mappedPaths.length + "/" + rec.codePaths.length + " mapped · boot " + rec.bootNames.length + " modules · " + rec.bootMissing.length + " booted-but-unmapped · layout " + (rec.layout ? rec.layout.verdict : "n/a") + (rec.error ? " · " + rec.error : "") + " · " + (Date.now() - t0) + "ms" });
        if(typeof rrlAppend === "function" && typeof runNoOf === "function") rrlAppend(runNoOf(), "DNA", "Obi: [gaming division deploy — tree " + rec.mappedPaths.length + "/" + rec.codePaths.length + " · " + rec.bootMissing.length + " booted-but-unmapped · layout " + (rec.layout ? rec.layout.verdict : "n/a") + "]");
        return;
      }
      var m = await find({ force:force });
      if(a === "code") addBubble("ass", fileCard(m, "code"));
      else if(a === "docs") addBubble("ass", fileCard(m, "docs"));
      else addBubble("ass", card(m));
      if(typeof logOp === "function") logOp({ kind:"scout", action:"gamedivision find", ok:m.verdict === "REAL",
        detail:m.repo + "@" + m.branch + (force ? " (forced rescan)" : ""),
        result:m.verdict + " · " + m.files + " file(s) · " + size(m.bytes) + " · " + m.roots.length + " root(s) · source " + m.source + (m.error ? " · " + m.error : "") + " · " + (Date.now() - t0) + "ms" });
      if(typeof rrlAppend === "function" && typeof runNoOf === "function") rrlAppend(runNoOf(), "DNA", "Obi: [gaming division find — " + m.files + " file(s) · " + m.roots.length + " root(s) · " + m.source + "]");
    }catch(err){
      addBubble("ass", "⚠ the gaming division's sweep failed: " + e((err && err.message) || err));
    }
  }

  window.ObiGameDivision = {
    VERSION:VERSION, MIRROR:MIRROR, RAW:RAW, GAME:GAME, RULING:RULING, BLOCKERS:BLOCKERS, ROOTS:ROOTS,
    find:find, probe:probe, sweep:sweep, embedded:embedded, card:card, statusCard:statusCard, cmd:cmd,
    reconcile:reconcile, deployCard:deployCard,
    size:size, rawUrl:rawUrl, embeddedAt:EMBEDDED_AT
  };
})();
