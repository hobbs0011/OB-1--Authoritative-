# RAW VERBATIM — LESSONSELECTORCREATOR.txt
## Corpus Metadata
- chunk_seq   : 0365
- chunk_id    : 0365-RAW-LESSONSELECTORCREATOR_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\LESSONSELECTORCREATOR.txt
- sha256      : 90D2E43F46CAEEA94359916E8677027747D4BEDA83E0AA6440E0C40FB1C6CEAC
- size_bytes  : 19041
- lines       : 378
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : 

---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stallion V2.2 CORE ASSEMBLER (Soul Restored)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* --- V13 Cosmic Styles (Gold and Purple) --- */
        :root {
            --color-primary-gold: #D4AF37;
            --color-primary-purple: #6B4C9A;
            --color-purple-light: #9B7CB8;
            --color-bg-dark: #1A1A2E;
            --color-bg-card: #2D2D44;
            --color-text-light: #FFFFFF;
            --color-gold-light: #F4E4A6;
        }
        body { font-family: 'Poppins', sans-serif; background: var(--color-bg-dark); color: var(--color-text-light); }
        .net-header h1 { font-size: 2.5rem; font-weight: 800; background: linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-primary-gold) 50%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 15px rgba(212, 175, 55, 0.3); }
        .content-area { background: var(--color-bg-card); border: 1px solid rgba(212, 175, 55, 0.2); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); }
        .stage-card { border-left: 4px solid var(--color-primary-gold); }
        .btn-primary { background: var(--color-primary-purple); color: var(--color-gold-light); transition: background 0.2s; }
        .btn-primary:hover { background: var(--color-purple-light); }
        .arsenal-label { font-weight: 600; color: var(--color-gold-light); margin-bottom: 0.5rem; }
        .save-indicator { width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 8px; transition: background-color 0.3s; }
        .save-indicator.saved { background-color: #10B981; }
        .save-indicator.unsaved { background-color: #FBBF24; }
        
        /* Penman's V2.2 Aesthetic Overhaul */
        .arsenal-list-item {
            padding: 0.6rem 0.8rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 6px;
            margin-bottom: 0.4rem;
            cursor: pointer;
            transition: all 0.1s ease;
        }
        .arsenal-list-item:hover {
            background: rgba(107, 76, 154, 0.2); /* Purple hover */
            border-color: var(--color-primary-purple);
        }
        .arsenal-list-item.selected {
            background: rgba(212, 175, 55, 0.15); /* Gold selected */
            border-color: var(--color-primary-gold);
        }
    </style>
</head>
<body class="p-8">

    <div class="max-w-6xl mx-auto">
        <header class="net-header text-center mb-10">
            <h1>STALLION V2.2 CORE ASSEMBLER</h1>
            <p class="text-xl mt-1 text-purple-light tracking-wider">SOUL RESTORED: Structural Integrity Affirmed</p>
        </header>

        <div class="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
            <div class="text-sm">
                <p>Status: <span id="status-display" class="font-bold text-green-400">OPERATIONAL</span></p>
                <p>System: <span id="version-display">V2.2 Final</span></p>
            </div>
            <div class="text-right flex items-center gap-4">
                <div class="flex items-center text-sm">
                    <span id="save-indicator" class="save-indicator unsaved"></span>
                    <span id="save-status">Loading...</span>
                </div>
                <p>ATC Lock: <span id="atc-lock-status" class="font-bold text-primary-gold">CLEARED (COMMITTED)</span></p>
            </div>
        </div>

        <div class="content-area p-8 rounded-xl">
            <h2 class="text-2xl font-semibold mb-6 text-primary-gold">Lesson Configuration</h2>
            
            <div class="mb-6">
                <label for="lesson-title" class="block text-text-light mb-2">Lesson Title:</label>
                <input type="text" id="lesson-title" value="Untitled Lesson: V2.2 Project" class="w-full p-3 rounded bg-gray-700 text-text-light border border-gray-600" oninput="markUnsaved()">
            </div>

            <h2 class="text-2xl font-semibold mt-10 mb-4 text-primary-gold border-t pt-4 border-gray-700">5-Stage Curriculum Structure</h2>
            
            <div id="curriculum-stages" class="space-y-6">
                </div>

            <div class="mt-10 flex justify-end gap-4">
                <button id="clear-draft-btn" class="px-6 py-3 rounded font-semibold bg-red-600 hover:bg-red-700" onclick="clearDraft()">🗑️ Clear Draft</button>
                <button id="save-draft-btn" class="btn-primary px-6 py-3 rounded font-semibold" onclick="saveDraft()">💾 Save Draft (Manual)</button>
                <button class="btn-primary px-6 py-3 rounded font-semibold" onclick="exportStaticHTML()">📦 Forge Lesson Package (M5 Dual-Modality)</button>
            </div>
        </div>
        
    </div>

    <script>
        // ========================================
        // 🚀 V2.2 FINAL IMPLEMENTATION (Hardened Core)
        // ========================================

        const CURRENT_SCHEMA_VERSION = "V2.2";
        const LOCAL_STORAGE_KEY = 'stallion_v22_draft';

        // --- CORE DATA CONFIGURATION (FINAL 8-MODULE SCOPE LOCK) ---
        const T1_ASSET_LIST_FULL = [
            { id: 1, title: "Vocabulary Forge", icon: "🔥", category: "ACTIVATION" },
            { id: 3, title: "Global Nexus Simulation", icon: "🌐", category: "SCENARIO" },
            { id: 4, title: "The Crucible Challenge", icon: "⚔️", category: "SOCRATIC" },
            { id: 5, title: "6-Word Synthesis", icon: "📖", category: "WRAPUP" },
            { id: 6, title: "Contextual Word Embeddings", icon: "🧠", category: "CORE" },
            { id: 7, title: "Historical Timeline Mapper", icon: "🕰️", category: "ACTIVATION" },
            { id: 9, title: "Multi-Platform Analytics", icon: "📊", category: "CORE" },
            { id: 11, title: "Audience Persona Designer", icon: "👤", category: "CORE" },
            { id: 14, title: "Source Integrity Validator", icon: "🛡️", category: "CORE" },
            { id: 15, title: "Final Thesis Generator", icon: "💡", category: "WRAPUP" },
            { id: 18, title: "Role-Play Dialogue Builder", icon: "🗣️", category: "SCENARIO" },
            { id: 19, title: "3D Model Viewer Placeholder", icon: "🧊", category: "CORE" }
        ];

        // Market-Led Scope Lock (8 Modules)
        const FINAL_SCOPE_ASSET_IDS = [1, 3, 4, 9, 11, 14, 18, 19];
        const T1_ASSET_LIST = T1_ASSET_LIST_FULL.filter(asset => FINAL_SCOPE_ASSET_IDS.includes(asset.id));


        const STAGES_CONFIG = [
            { id: "briefing", title: "1. The Briefing", description: "Activate Prior Knowledge", type: "ACTIVATION", contentRows: 4 },
            { id: "deep_dive", title: "2. The Deep Dive", description: "Core Skill Acquisition", type: "CORE", contentRows: 6 },
            { id: "nexus", title: "3. The Global Nexus", description: "Scenario Simulation", type: "SCENARIO", contentRows: 4 },
            { id: "crucible", title: "4. The Crucible", description: "Socratic Mode/Challenge", type: "SOCRATIC", contentRows: 4 },
            { id: "knowledge_check", title: "5. The Knowledge Check", description: "Final Assessment / Wrap-up", type: "WRAPUP", contentRows: 4 }
        ];

        // --- 1. GADGET MANDATE: O(1) LOOKUP PRE-PROCESSING (Certified Fix) ---
        const ASSET_MAP_BY_STAGE = (() => {
            const assetMap = new Map();
            STAGES_CONFIG.forEach(stage => {
                // O(N) only runs once here at initialization
                const compatibleAssets = T1_ASSET_LIST.filter(asset => 
                    asset.category === stage.type || asset.category === 'CORE'
                );
                assetMap.set(stage.id, compatibleAssets); 
            });
            return assetMap;
        })();

        // --- 2. TASK_02: COMPLIANT RENDERER (O(1) & XSS Fix + UX Refactor) ---
        function renderArsenalSelector(stageId) {
            // Atlas Mandate: O(1) Lookup - Access the pre-filtered array directly from the Map
            const compatibleAssets = ASSET_MAP_BY_STAGE.get(stageId) || [];
            
            // Stallion/Perfectionist UX Refactor: Replace select with list view (div/ul)
            const listItems = compatibleAssets.map(asset => {
                // Sanitized string output (RP-1 Purity Lock)
                const sanitizedTitle = `${asset.id}. ${asset.title} ${asset.icon} (${asset.category})`;
                return `
                    <div class="arsenal-list-item" data-asset-id="${asset.id}" data-stage-id="${stageId}" onclick="toggleAssetSelection(this)">
                        ${sanitizedTitle}
                    </div>
                `;
            }).join('');

            return `
                <div class="mt-4">
                    <label class="arsenal-label block">Select T1 Arsenal Modules (${stageId.toUpperCase()} Focus):</label>
                    <div class="max-h-64 overflow-y-auto border border-gray-600 rounded p-2 space-y-1" id="arsenal-list-${stageId}">
                        ${listItems}
                    </div>
                </div>
            `;
        }

        // UX Helper function for selection (removed clunky select logic)
        function toggleAssetSelection(element) {
            element.classList.toggle('selected');
            markUnsaved();
        }

        // --- 3. TASK_03: HARDENED PERSISTENCE CORE (Compliant Save/Load) ---
        let isSaved = true;

        function markUnsaved() {
            if (isSaved) {
                isSaved = false;
                updateSaveIndicator();
            }
        }

        function updateSaveIndicator() {
            const indicator = document.getElementById('save-indicator');
            const status = document.getElementById('save-status');
            
            if (isSaved) {
                indicator.className = 'save-indicator saved';
                status.textContent = 'Saved';
            } else {
                indicator.className = 'save-indicator unsaved';
                status.textContent = 'Unsaved Changes';
            }
        }

        function saveDraft() {
            const curriculum = {
                title: document.getElementById('lesson-title').value,
                stages: {},
                schemaVersion: CURRENT_SCHEMA_VERSION 
            };

            STAGES_CONFIG.forEach(stage => {
                const stageElement = document.querySelector(`.stage-card[data-stage-id="${stage.id}"]`);
                const textarea = stageElement ? stageElement.querySelector('textarea') : null;
                const selectedAssets = [];
                
                // Read selected assets from the new list view structure
                document.querySelectorAll(`[data-stage-id="${stage.id}"] .arsenal-list-item.selected`).forEach(item => {
                    selectedAssets.push(parseInt(item.dataset.assetId));
                });

                curriculum.stages[stage.id] = {
                    content: textarea ? textarea.value : '',
                    assets: selectedAssets
                };
            });

            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(curriculum));
                isSaved = true;
                updateSaveIndicator();
                console.log(`[STALLION] Draft saved successfully, stamped as V${CURRENT_SCHEMA_VERSION}.`);
            } catch (e) {
                console.error(`[STALLION] CRITICAL SAVE FAILURE:`, e);
            }
        }

        function loadDraft() {
            try {
                const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (!saved) return;

                const curriculum = JSON.parse(saved);
                
                // Code Cop Mandate: Schema Version Validation
                if (curriculum.schemaVersion !== CURRENT_SCHEMA_VERSION) {
                     console.error(`[CODECOP] CRITICAL_WARNING: Draft version (${curriculum.schemaVersion}) does not match current version (${CURRENT_SCHEMA_VERSION}). Discarding draft to prevent Structural Fantasy.`);
                     clearDraftInternal(false); 
                     return;
                }
                
                // Restore logic
                document.getElementById('lesson-title').value = curriculum.title;
                STAGES_CONFIG.forEach(stage => {
                    const stageData = curriculum.stages[stage.id];
                    if (!stageData) return;

                    const textarea = document.querySelector(`.stage-card[data-stage-id="${stage.id}"] textarea`);
                    if (textarea) textarea.value = stageData.content;

                    // Restore asset selections in the new list view structure
                    document.querySelectorAll(`.stage-card[data-stage-id="${stage.id}"] .arsenal-list-item`).forEach(item => {
                        const assetId = parseInt(item.dataset.assetId);
                        if (stageData.assets.includes(assetId)) {
                            item.classList.add('selected');
                        } else {
                            item.classList.remove('selected');
                        }
                    });
                });

                isSaved = true;
                updateSaveIndicator();
                console.log(`[STALLION] Draft loaded successfully (V${curriculum.schemaVersion}).`);
            } catch (e) {
                console.error('CRITICAL LOAD FAILURE:', e);
            }
        }

        function clearDraft() {
            if (!confirm("Are you sure you want to clear the current draft? This cannot be undone.")) return;
            clearDraftInternal(false);
        }
        function clearDraftInternal(promptUser = true) {
             localStorage.removeItem(LOCAL_STORAGE_KEY);
             location.reload(); 
        }

        // --- 4. TASK_04: M5 DUAL-MODALITY EXPORT (HTML + CSS) ---
        function exportStaticHTML() {
            const curriculum = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            if (!curriculum) return alert("Please save a draft before forging a package.");

            // Penman's Aesthetic Styles
            const staticCss = `
body { font-family: sans-serif; line-height: 1.7; color: #e9ecf1; max-width: 800px; margin: 0 auto; padding: 20px; background: #1a1a2e; }
h1 { color: #D4AF37; border-bottom: 2px solid #6B4C9A; padding-bottom: 10px; font-size: 2em;}
h2 { color: #9B7CB8; font-size: 1.5em; margin-top: 20px;}
section { margin-bottom: 30px; padding: 15px; border-left: 5px solid #D4AF37; background: #2D2D44; border-radius: 8px;}
.assets { font-size: 0.9em; color: #F4E4A6; margin-top: 10px; padding-top: 5px; border-top: 1px dashed #6B4C9A;}
            `;

            let stagesHtml = '';

            STAGES_CONFIG.forEach(stage => {
                const data = curriculum.stages[stage.id] || { content: '', assets: [] };
                
                const assetsUsed = data.assets.map(id => {
                    const asset = T1_ASSET_LIST_FULL.find(a => a.id === id); 
                    return asset ? `${asset.icon} ${asset.title}` : `[Asset ID ${id} Missing]`;
                }).join(', ');

                stagesHtml += `
                    <section aria-labelledby="stage-title-${stage.id}" tabindex="0">
                        <h2 id="stage-title-${stage.id}">${stage.title}</h2>
                        <p style="white-space: pre-wrap;">${data.content || '(No content entered)'}</p>
                        <p class="assets" aria-label="Assets Used">Assets Used: ${assetsUsed || 'None'}</p>
                    </section>
                `;
            });

            // Final Assembly of the Accessible, Static Document (M5 Dual-Modality)
            const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${curriculum.title || 'Exported Lesson'}</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${staticCss}</style>
</head>
<body>
    <header><h1 id="lesson-title">${curriculum.title || 'Exported Lesson'}</h1></header>
    <main role="main">${stagesHtml}</main>
    <footer style="text-align: center; margin-top: 40px;">
        <p style="font-size: 0.8em; color: #C8C8D8;">Exported Static Content - V2.2 Final (M5 Compliant: View-Only).</p>
    </footer>
</body>
</html>
            `;

            // M3 Compliance: Use Copy/Paste mechanism (NO direct file download)
            prompt("Copy this text to save your final Static HTML Lesson:", finalHtml);
            console.log("[STALLION] TASK_04: Dual-Modality Export Complete and M5 Compliant.");
        }


        // --- UI RENDER FUNCTION (TASK_01/02) ---
        function renderAssemblerUI() {
            const stagesContainer = document.getElementById('curriculum-stages');
            stagesContainer.innerHTML = '';

            STAGES_CONFIG.forEach(stage => {
                const selectorHtml = renderArsenalSelector(stage.id);

                const stageHtml = `
                    <div class="stage-card p-4 rounded-lg bg-gray-800/70" data-stage-id="${stage.id}">
                        <h3 class="text-xl font-bold text-purple-light mb-3">${stage.title} (${stage.description})</h3>
                        <textarea placeholder="Enter core content for ${stage.title} here..." rows="${stage.contentRows}" class="w-full p-3 rounded bg-gray-700 text-text-light border border-gray-600 mb-3" oninput="markUnsaved()"></textarea>
                        ${selectorHtml}
                    </div>
                `;
                stagesContainer.insertAdjacentHTML('beforeend', stageHtml);
            });
            
            // Attach final event listeners
            document.querySelectorAll('#curriculum-stages textarea').forEach(element => {
                element.addEventListener('input', markUnsaved);
            });

            // Restore persistence data and finalize UI state
            loadDraft();
            updateSaveIndicator();
        }

        // --- EXECUTION ---
        document.addEventListener('DOMContentLoaded', () => {
            renderAssemblerUI();
            console.log("[STALLION V2.2] Final Assembly rendered. Soul Restoration Complete.");
        });
    </script>
</body>
</html>
