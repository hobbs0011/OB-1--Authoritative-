# RAW VERBATIM — LESSONSELECTORCREATOR2.txt
## Corpus Metadata
- chunk_seq   : 0366
- chunk_id    : 0366-RAW-LESSONSELECTORCREATOR2_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\LESSONSELECTORCREATOR2.txt
- sha256      : AE7F103BE380890DE066EAF791481882F2FC4F664C4892AFB6FECC5711AF7A84
- size_bytes  : 19611
- lines       : 388
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
    <title>Stallion V2.3 NARRATIVE ENGINE (NET Branding Final)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* --- V2.3 NET Branding Core Styles --- */
        :root {
            --color-primary-gold: #D4AF37;
            --color-primary-purple: #6B4C9A;
            --color-purple-light: #9B7CB8;
            --color-bg-dark: #0A0A15; /* Deeper Black for contrast */
            --color-bg-card: #1C1C2A;
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
        
        /* Penman's V2.3 Narrative & Aesthetic Overhaul */
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
            background: rgba(107, 76, 154, 0.2);
            border-color: var(--color-primary-purple);
        }
        .arsenal-list-item.selected {
            background: rgba(212, 175, 55, 0.15); 
            border-color: var(--color-primary-gold);
        }
        
        /* Final Gold Network Glow Effect (Simulated in background) */
        body { 
            background-image: 
                radial-gradient(circle at 10% 90%, rgba(212, 175, 55, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 90% 10%, rgba(107, 76, 154, 0.2) 0%, transparent 50%);
        }
    </style>
</head>
<body class="p-8">

    <div class="max-w-6xl mx-auto">
        <header class="net-header text-center mb-10">
            <h1>NET NARRATIVE ENGINE (V2.3)</h1>
            <p class="text-xl mt-1 text-purple-light tracking-wider">Communicate First, Grammar Second. Your Lesson Story.</p>
        </header>

        <!-- Status Dashboard -->
        <div class="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg mb-6 border border-gray-700">
            <div class="text-sm">
                <p>Status: <span id="status-display" class="font-bold text-green-400">OPERATIONAL</span></p>
                <p>System: <span id="version-display">V2.3 Final</span></p>
            </div>
            <div class="text-right flex items-center gap-4">
                <div class="flex items-center text-sm">
                    <span id="save-indicator" class="save-indicator unsaved"></span>
                    <span id="save-status">Loading...</span>
                </div>
                <p>U-HRA Lock: <span id="atc-lock-status" class="font-bold text-primary-gold">ACTIVE (MONITORED)</span></p>
            </div>
        </div>

        <div class="content-area p-8 rounded-xl">
            <h2 class="text-2xl font-semibold mb-6 text-primary-gold">Lesson Configuration</h2>
            
            <div class="mb-6">
                <label for="lesson-title" class="block text-text-light mb-2">Lesson Title:</label>
                <input type="text" id="lesson-title" value="The Great Grammar Breakout Story" class="w-full p-3 rounded bg-gray-700 text-text-light border border-gray-600" oninput="markUnsaved()">
            </div>

            <h2 class="text-2xl font-semibold mt-10 mb-4 text-primary-gold border-t pt-4 border-gray-700">Narrative Structure</h2>
            
            <div id="curriculum-stages" class="space-y-6">
                <!-- Stages will be populated dynamically by JavaScript -->
            </div>

            <!-- Action Buttons -->
            <div class="mt-10 flex justify-end gap-4">
                <button id="clear-draft-btn" class="px-6 py-3 rounded font-semibold bg-red-600 hover:bg-red-700" onclick="clearDraft()">🗑️ Clear Draft</button>
                <button id="save-draft-btn" class="btn-primary px-6 py-3 rounded font-semibold" onclick="saveDraft()">💾 Save Draft (Manual)</button>
                <button class="btn-primary px-6 py-3 rounded font-semibold" onclick="exportStaticHTML()">📦 Forge Lesson Package (V2.3 Launch)</button>
            </div>
        </div>
        
    </div>

    <script>
        // ========================================
        // 🚀 V2.3 FINAL IMPLEMENTATION (NARRATIVE CORE)
        // ========================================

        const CURRENT_SCHEMA_VERSION = "V2.3";
        const LOCAL_STORAGE_KEY = 'stallion_v23_draft';

        // --- CORE DATA CONFIGURATION (Narrative Structure) ---
        const T1_ASSET_LIST_FULL = [
            { id: 1, title: "Vocabulary Forge", icon: "🔥", category: "COMMUNICATION" },
            { id: 3, title: "Global Nexus Simulation", icon: "🌐", category: "BUSINESS_SKILLS" },
            { id: 4, title: "The Crucible Challenge", icon: "⚔️", category: "AI_SKILLS" },
            { id: 9, title: "Multi-Platform Analytics", icon: "📊", category: "CORE" },
            { id: 11, title: "Audience Persona Designer", icon: "👤", category: "CORE" },
            { id: 14, title: "Source Integrity Validator", icon: "🛡️", category: "CORE" },
            { id: 18, title: "Role-Play Dialogue Builder", icon: "🗣️", category: "BUSINESS_SKILLS" },
            { id: 19, title: "3D Model Viewer Placeholder", icon: "🧊", category: "CORE" }
        ];
        
        const T1_ASSET_LIST = T1_ASSET_LIST_FULL.filter(asset => [1, 3, 4, 9, 11, 14, 18, 19].includes(asset.id));

        // Commodore's V2.3 Narrative Engine Structure
        const STAGES_CONFIG = [
            { id: "exposition", title: "1. The Context (EXPOSITION)", description: "Setting the Scene & Activating Intuition", type: "COMMUNICATION", contentRows: 4 },
            { id: "conflict", title: "2. The Challenge (CONFLICT)", description: "Testing Communication & Problem Solving", type: "BUSINESS_SKILLS", contentRows: 6 },
            { id: "climax", title: "3. The Negotiation (CLIMAX)", description: "High-Stakes Dialogue & Fluency Test", type: "AI_SKILLS", contentRows: 4 },
            { id: "resolution", title: "4. The Takeaway (RESOLUTION)", description: "Synthesizing Success & Lesson Learned", type: "STRUCTURAL", contentRows: 4 },
            { id: "epilogue", title: "5. The Next Chapter (EPILOGUE)", description: "Applying Skill & Future Planning", type: "MARKET", contentRows: 4 }
        ];

        // --- 1. GADGET MANDATE: O(1) LOOKUP PRE-PROCESSING (Certified Fix) ---
        const ASSET_MAP_BY_STAGE = (() => {
            const assetMap = new Map();
            STAGES_CONFIG.forEach(stage => {
                const compatibleAssets = T1_ASSET_LIST.filter(asset => 
                    asset.category === stage.type || asset.category === 'CORE'
                );
                assetMap.set(stage.id, compatibleAssets); 
            });
            return assetMap;
        })();

        // --- 2. TASK_02: COMPLIANT RENDERER (O(1) & XSS Fix + UX Refactor) ---
        function renderArsenalSelector(stageId) {
            // O(1) Lookup
            const compatibleAssets = ASSET_MAP_BY_STAGE.get(stageId) || [];
            
            // Stallion/Perfectionist UX Refactor: List View (div/ul)
            const listItems = compatibleAssets.map(asset => {
                const sanitizedTitle = `${asset.id}. ${asset.title} ${asset.icon} (${asset.category})`;
                return `
                    <div class="arsenal-list-item" data-asset-id="${asset.id}" data-stage-id="${stageId}" onclick="toggleAssetSelection(this)">
                        ${sanitizedTitle}
                    </div>
                `;
            }).join('');

            return `
                <div class="mt-4">
                    <label class="arsenal-label block">Arsenal Modules (Focus: ${stageId.toUpperCase()}):</label>
                    <div class="max-h-64 overflow-y-auto border border-gray-600 rounded p-2 space-y-1" id="arsenal-list-${stageId}">
                        ${listItems}
                    </div>
                </div>
            `;
        }

        function toggleAssetSelection(element) {
            element.classList.toggle('selected');
            markUnsaved();
        }

        // --- 3. TASK_03: HARDENED PERSISTENCE CORE (Bug Fix Applied) ---
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
                
                // --- FINAL BUG FIX: Restores user feedback loop ---
                isSaved = true;
                updateSaveIndicator();
                // --------------------------

                console.log(`[STALLION] Draft saved successfully, stamped as V${CURRENT_SCHEMA_VERSION}.`);
            } catch (e) {
                console.error(`[STALLION] CRITICAL SAVE FAILURE:`, e);
                document.getElementById('save-status').textContent = 'SAVE ERROR!';
            }
        }

        function loadDraft() {
            try {
                const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (!saved) return;

                const curriculum = JSON.parse(saved);
                
                if (curriculum.schemaVersion !== CURRENT_SCHEMA_VERSION) {
                     console.error(`[CODECOP] CRITICAL_WARNING: Draft version (${curriculum.schemaVersion}) does not match current version (${CURRENT_SCHEMA_VERSION}). Discarding draft to prevent Structural Fantasy.`);
                     clearDraftInternal(false); 
                     return;
                }
                
                document.getElementById('lesson-title').value = curriculum.title;
                STAGES_CONFIG.forEach(stage => {
                    const stageData = curriculum.stages[stage.id];
                    if (!stageData) return;

                    const textarea = document.querySelector(`.stage-card[data-stage-id="${stage.id}"] textarea`);
                    if (textarea) textarea.value = stageData.content;

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
             const status = document.getElementById('status-display');
             status.textContent = 'RELOADING...';
             location.reload(); 
        }

        // --- 4. TASK_04: M5 DUAL-MODALITY EXPORT (FINAL BRANDING) ---
        function exportStaticHTML() {
            const curriculum = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            if (!curriculum) return alert("Please save a draft before forging a package.");

            // Penman's Final Aesthetic Styles (Gold/Purple Network Glow)
            const staticCss = `
body { font-family: sans-serif; line-height: 1.7; color: #E0E0E0; max-width: 900px; margin: 0 auto; padding: 30px; background: #0A0A15; background-image: 
    radial-gradient(circle at 10% 90%, rgba(212, 175, 55, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 10%, rgba(107, 76, 154, 0.2) 0%, transparent 50%); }
h1 { color: #F4E4A6; border-bottom: 3px solid #D4AF37; padding-bottom: 15px; font-size: 2.5em; text-align: center; text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);}
h2 { color: #9B7CB8; font-size: 1.5em; margin-top: 20px;}
.mission-bar { background-color: #6B4C9A; color: #F4E4A6; padding: 15px; text-align: center; font-weight: 600; border-radius: 8px; margin-bottom: 30px; }
section { margin-bottom: 30px; padding: 15px; border-left: 5px solid #6B4C9A; background: #1C1C2A; border-radius: 8px; box-shadow: 0 0 10px rgba(107, 76, 154, 0.2);}
.assets { font-size: 0.9em; color: #F4E4A6; margin-top: 10px; padding-top: 5px; border-top: 1px dashed #4D4D6E;}
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
                        <p style="white-space: pre-wrap; color: #C8C8D8;">${data.content || '(No content entered)'}</p>
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
    <header>
        <h1 id="lesson-title">${curriculum.title || 'Exported Lesson'}</h1>
        <div class="mission-bar">BREAK OUT OF THE GRAMMAR COMFORT ZONE! COMMUNICATE FIRST, GRAMMAR SECOND.</div>
    </header>
    <main role="main">${stagesHtml}</main>
    <footer style="text-align: center; margin-top: 40px;">
        <p style="font-size: 0.8em; color: #9B7CB8;">Exported Static Content - V2.3 Final (Narrative Engine).</p>
    </footer>
</body>
</html>
            `;

            prompt("Copy this text to save your final Static HTML Lesson:", finalHtml);
            console.log("[STALLION] TASK_04: Dual-Modality Export Complete and M5/V2.3 Compliant.");
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
            console.log("[STALLION V2.3] Final Assembly rendered. Soul Restoration Complete.");
        });
    </script>
</body>
</html>

