# RAW VERBATIM — LAUNCHPAD-PHOENIX11.txt
## Corpus Metadata
- chunk_seq   : 0356
- chunk_id    : 0356-RAW-LAUNCHPAD-PHOENIX11_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\LAUNCHPAD-PHOENIX11.txt
- sha256      : D3E724CFC4AC563D8194C15E01617206D7CF5A4A457E125E26B5AEC473387F35
- size_bytes  : 11666
- lines       : 336
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : 

---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale-1.0">
    <title>Standalone HTML Renderer - V9.0 (Stealth Collapse)</title>
    <style>
        :root {
            --color-bg: #1e1e1e;
            --color-surface: #2d2d2d;
            --color-text: #cccccc;
            --color-accent: #6366f1;
            --color-border: #444;
            --collapsed-width: 25px; /* Ultra-Collapse width */
        }
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background: var(--color-bg);
            color: var(--color-text);
            display: flex;
            flex-direction: column;
            height: 100vh; 
            overflow: hidden;
        }
        
        .main-split-container {
            display: flex;
            flex-grow: 1;
            overflow: hidden;
            position: relative;
            width: 100%;
            height: 100%; 
        }
        
        .pane {
            flex-grow: 1;
            overflow: hidden;
            position: relative;
            transition: all 0.3s ease-in-out; 
        }

        /* --- Editor Pane --- */
        #editor-pane {
            overflow-y: scroll; /* Scrollbar is visible by default when expanded */
            scrollbar-width: thin;
            scrollbar-color: var(--color-accent) var(--color-surface);
        }
        #editor-pane::-webkit-scrollbar {
            width: 8px;
        }
        #editor-pane::-webkit-scrollbar-thumb {
            background: var(--color-accent);
            border-radius: 4px;
        }
        #editor-pane::-webkit-scrollbar-track {
            background: var(--color-surface);
        }

        #editor {
            width: 100%;
            height: 100%;
            padding: 10px;
            border: none;
            background: var(--color-surface);
            color: var(--color-text);
            font-family: monospace;
            font-size: 14px;
            resize: none;
            line-height: 1.4;
            tab-size: 4;
            transition: opacity 0.3s ease-in-out;
        }
        
        /* --- THIS IS THE V8/V9 COMBINED FIX --- */
        #editor-pane.collapsed {
            flex-basis: var(--collapsed-width) !important;
            min-width: var(--collapsed-width) !important;
            max-width: var(--collapsed-width) !important;
            overflow: hidden !important; /* V8: This completely removes the scrollbar */
        }
        #editor-pane.collapsed #editor {
            opacity: 0; 
            pointer-events: none;
        }


        /* --- Preview Pane --- */
        #preview-iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white; 
        }

        /* --- Resizer Bar (Stealth Mode) --- */
        .resizer {
            width: 8px;
            cursor: col-resize;
            background: var(--color-border);
            /* V9: Resizer is now invisible by default */
            opacity: 0;
            transition: opacity 0.3s ease, background 0.2s;
            position: relative; 
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 5; /* Behind button */
        }
        
        /* V9: Show resizer on hover */
        #editor-pane:hover + .resizer,
        .resizer:hover {
            opacity: 1;
            background: var(--color-accent);
        }

        
        /* Collapse Button (Stealth Mode) */
        #collapse-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            left: 0;
            width: 20px;
            height: 40px;
            background: var(--color-accent);
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            padding: 0;
            line-height: 40px;
            text-align: center;
            font-weight: bold;
            font-size: 0.8rem;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            transition: opacity 0.3s ease, left 0.3s ease;
            z-index: 10;
            /* V9: Button is invisible by default */
            opacity: 0;
        }
        
        /* V9: Show button on hover */
        #editor-pane:hover + .resizer #collapse-btn {
            opacity: 1;
        }
        
        /* Adjust button position based on state */
        #editor-pane.collapsed + .resizer #collapse-btn {
            left: -12px; 
        }
        
        /* V9: When collapsed, show button on hover of the *pane* */
        #editor-pane.collapsed:hover + .resizer #collapse-btn {
             opacity: 1;
        }


        /* Mobile adjustment: stack panes */
        @media (max-width: 768px) {
            .main-split-container {
                flex-direction: column;
            }
            .resizer {
                height: 8px;
                width: 100%;
                cursor: row-resize;
                opacity: 1; /* Always visible on mobile */
            }
            #collapse-btn {
                display: none; 
            }
        }
    </style>
</head>
<body>

    <div class="main-split-container">
        <!-- Left Pane: Code Editor -->
        <div id="editor-pane" class="pane">
            <textarea id="editor" placeholder="Paste your HTML code here (or start typing!). Changes auto-render..."></textarea>
        </div>
        
        <!-- Resizer Bar -->
        <div id="resizer" class="resizer">
            <button id="collapse-btn" title="Toggle Code Panel Visibility"><<</button>
        </div>

        <!-- Right Pane: Live Preview -->
        <div id="preview-pane" class="pane">
            <iframe id="preview-iframe"></iframe>
        </div>
    </div>

    <script>
        const editor = document.getElementById('editor');
        const editorPane = document.getElementById('editor-pane');
        const iframe = document.getElementById('preview-iframe');
        const resizer = document.getElementById('resizer');
        const splitContainer = document.querySelector('.main-split-container');
        const collapseBtn = document.getElementById('collapse-btn');
        
        const STORAGE_KEY = 'html_viewer_content';
        const WIDTH_KEY = 'html_viewer_width';
        const COLLAPSED_KEY = 'html_viewer_collapsed';
        const DEFAULT_WIDTH = '50%';
        
        let isCollapsed = false;
        let isResizing = false;
        let lastWidth = localStorage.getItem(WIDTH_KEY) || DEFAULT_WIDTH;

        // --- Core Rendering Function ---
        const renderHtml = () => {
            const content = editor.value;
            iframe.srcdoc = content;
            localStorage.setItem(STORAGE_KEY, content);
        };

        // --- Collapse/Expand Logic ---
        const toggleCollapse = () => {
            isCollapsed = !isCollapsed;
            
            if (isCollapsed) {
                // Collapse: save current width, set collapsed class
                if (editorPane.style.flexBasis && editorPane.style.flexBasis !== 'var(--collapsed-width)') {
                     lastWidth = editorPane.style.flexBasis;
                } else if (localStorage.getItem(WIDTH_KEY)) {
                     lastWidth = localStorage.getItem(WIDTH_KEY);
                } else {
                    lastWidth = DEFAULT_WIDTH;
                }
                
                editorPane.classList.add('collapsed');
                // CSS handles the rest (flex-basis, overflow: hidden)
                
                collapseBtn.textContent = '>>';
                localStorage.setItem(COLLAPSED_KEY, 'true');
            } else {
                // Expand: remove collapsed class, restore last saved width
                editorPane.classList.remove('collapsed');
                editorPane.style.flexBasis = lastWidth;
                collapseBtn.textContent = '<<';
                localStorage.setItem(COLLAPSED_KEY, 'false');
            }
        };
        
        // --- Initialization ---
        window.onload = () => {
            // Load saved content
            const savedContent = localStorage.getItem(STORAGE_KEY);
            if (savedContent) {
                editor.value = savedContent;
                renderHtml();
            }
            
            // Load state (Collapsed or Expanded width)
            isCollapsed = localStorage.getItem(COLLAPSED_KEY) === 'true';
            
            if (isCollapsed) {
                editorPane.classList.add('collapsed');
                collapseBtn.textContent = '>>';
            } else {
                const savedWidth = localStorage.getItem(WIDTH_KEY);
                if (savedWidth) {
                    editorPane.style.flexBasis = savedWidth;
                } else {
                    editorPane.style.flexBasis = DEFAULT_WIDTH; // Default to half screen if no settings found
                }
                collapseBtn.textContent = '<<';
            }
        };

        // --- Auto-Render on Input (Throttled) ---
        let renderTimeout;
        editor.addEventListener('input', () => {
            clearTimeout(renderTimeout);
            renderTimeout = setTimeout(renderHtml, 300); // Throttle rendering to every 300ms
        });
        
        // --- Button Click ---
        collapseBtn.addEventListener('click', toggleCollapse);

        // --- Resizing Logic ---
        resizer.addEventListener('mousedown', (e) => {
            if (window.innerWidth > 768) {
                isResizing = true;
                document.body.style.userSelect = 'none';
                e.preventDefault();
                
                // If collapsed, expand it first before resizing starts
                if (isCollapsed) {
                    editorPane.classList.remove('collapsed');
                    collapseBtn.textContent = '<<';
                    isCollapsed = false;
                    localStorage.setItem(COLLAPSED_KEY, 'false');
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            // Desktop: Horizontal Resize
            const containerRect = splitContainer.getBoundingClientRect();
            let newWidth = e.clientX - containerRect.left;
            
            // Ensure width is clamped between 10% and 90%
            const minWidth = containerRect.width * 0.1;
            const maxWidth = containerRect.width * 0.9;

            if (newWidth < minWidth) newWidth = minWidth;
            if (newWidth > maxWidth) newWidth = maxWidth;
            
            const widthPercent = (newWidth / containerRect.width) * 100;
            
            editorPane.style.flexBasis = `${widthPercent}%`;
            editorPane.style.width = `${widthPercent}%`;
            localStorage.setItem(WIDTH_KEY, `${widthPercent}%`);
            lastWidth = `${widthPercent}%`; // Update last width while dragging
            
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = 'auto';
            }
        });
        
    </script>
</body>
</html>


