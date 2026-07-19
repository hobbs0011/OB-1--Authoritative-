# RAW VERBATIM — PROTOTYPE0.txt
## Corpus Metadata
- chunk_seq   : 0835
- chunk_id    : 0835-RAW-PROTOTYPE0_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\PROTOTYPE0.txt
- sha256      : BD86A16313DD20C481C14107AFEA8B5D74E16BFA523308098B3C5F4E02D37EF6
- size_bytes  : 15405
- lines       : 259
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : ROME_PROTOCOL

---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-PET // Operative Genesis Briefing v1.2 (Rome Protocol)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --nexus-gold: #FFD700;
            --nexus-purple: #9400D3;
            --nexus-cyan: #00FFFF;
            --nexus-bg: #0A0A1F;
            --nexus-card: #101024;
        }
        body {
            font-family: 'Rajdhani', sans-serif;
            background-color: var(--nexus-bg);
            color: #E0E0E0;
            overflow: hidden;
        }
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .neon-text { text-shadow: 0 0 5px var(--nexus-cyan), 0 0 10px var(--nexus-cyan), 0 0 15px var(--nexus-cyan); }
        .glow-border { border: 1px solid var(--nexus-purple); box-shadow: 0 0 20px rgba(148, 0, 211, 0.4); }
        .typewriter-cursor { border-right: .15em solid var(--nexus-gold); animation: blink-caret .75s step-end infinite; }
        @keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: var(--nexus-gold); } }
        .stage { transition: opacity 0.7s ease-in-out, transform 0.7s ease-in-out; }
        .stage.hidden { opacity: 0; transform: translateY(20px); pointer-events: none; position: absolute; }
        .next-btn {
            transition: all 0.3s ease;
            border: 2px solid var(--nexus-cyan);
            background: radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0) 70%);
        }
        .next-btn:hover { background-color: rgba(0, 255, 255, 0.2); box-shadow: 0 0 15px var(--nexus-cyan); }
        .next-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .reading-block { border-left: 3px solid var(--nexus-purple); background-color: rgba(148, 0, 211, 0.05); }
        .infographic-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw-line 2s ease-out forwards; }
        @keyframes draw-line { to { stroke-dashoffset: 0; } }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">

    <div id="briefing-container" class="w-full max-w-5xl h-[90vh] bg-nexus-card rounded-lg glow-border flex flex-col p-6 sm:p-8">
        <header class="text-center border-b-2 border-nexus-gold/30 pb-4">
            <h1 id="main-title" class="font-orbitron text-3xl sm:text-4xl font-bold text-nexus-gold"></h1>
        </header>

        <main id="stage-container" class="flex-grow relative py-6 overflow-y-auto">
            </main>

        <footer class="mt-auto pt-4 border-t border-nexus-purple/30 flex justify-end">
            <button id="next-btn" class="font-orbitron px-8 py-3 rounded text-lg text-nexus-cyan neon-text" disabled>Awaiting Initialization...</button>
        </footer>
    </div>

    <script>
        const BRIEFING_DATA = {
            title: "OPERATIVE GENESIS BRIEFING",
            stages: [
                {
                    type: 'title',
                    title: 'Welcome, Operatives Kiet & Nhan.',
                    subtitle: 'Initializing AI-PET Protocol...',
                    duration: 3000
                },
                {
                    type: 'narrative',
                    title: 'The Mission: Beyond the Textbook',
                    content: `
                        <p class="mb-4">Standard English classes are broken. They teach you rules, but they don't teach you how to think, how to debate, or how to use language with power. They are slow, inefficient, and impersonal.</p>
                        <p>We detected this flaw in the global education system. Our mission was to create something better. Not just a new method, but a new kind of partnership between a human mentor and an artificial intelligence: The **AI-PET (Personalized Engagement Trainer)**.</p>
                    `
                },
                {
                    type: 'narrative_reading',
                    title: 'The Problem: "Directive Amnesia"',
                    reading: {
                        person: 'Operative Kiet',
                        text: `
                            <p class="mb-4">The biggest challenge in learning is "Directive Amnesia" – the brain's natural tendency to forget. You can have a perfect lesson, but within hours, much of the information is lost. Within a week, it's almost gone completely.</p>
                            <p>This isn't a failure of effort; it's a failure of the system. Traditional homework can't solve this because it isn't timed to your brain's specific memory cycle.</p>
                        `
                    }
                },
                {
                    type: 'interactive_concept',
                    title: 'The Solution: Spaced Repetition Protocol',
                    concept: 'Spaced Repetition',
                    explanation: 'The AI-PET defeats "Directive Amnesia" by tracking your memory decay curve. It prompts you to review a concept at the precise moment you are most likely to forget it. Each successful recall strengthens the memory trace, making it last longer. Click to simulate the effect.',
                    interactive: {
                        initialText: 'Recall Memory Trace',
                        clicks: [
                            { strength: 20, text: 'Trace Strength: 20% (Weak)' },
                            { strength: 40, text: 'Trace Strength: 40% (Reinforced)' },
                            { strength: 70, text: 'Trace Strength: 70% (Strong)' },
                            { strength: 95, text: 'Trace Strength: 95% (Hardened)' }
                        ]
                    }
                },
                {
                    type: 'narrative_reading',
                    title: 'Our Philosophy: "Aggressive Evolution"',
                    reading: {
                        person: 'Operative Nhan',
                        text: `
                            <p class="mb-4">This system is designed to learn as fast as you do. We believe that finding a flaw isn't a failure—it's an opportunity. We call this the "Aggressive Evolution Protocol."</p>
                            <p>Every bug we find, every crash we experience, and every "crazy idea" for a lesson you provide is treated as valuable data. Your feedback is sent to the Master Brain, which analyzes the problem and immediately forges a stronger, better version of the system. You are not just students; you are co-developers.</p>
                        `
                    }
                },
                {
                    type: 'infographic',
                    title: 'How It Works: The AI-PET Loop',
                    steps: [
                        { name: 'Your Input', description: 'You complete missions, submit reflections, and provide feedback.' },
                        { name: 'AI-PET Analysis', description: 'The AI analyzes your language, identifies patterns, and calculates your progress.' },
                        { name: 'Trainer Oversight', description: 'The AI presents its findings to me, your human mentor, for final validation.' },
                        { name: 'Personalized Mission', description: 'I use the AI\'s insights to forge your next mission, perfectly targeted to your needs.' }
                    ]
                },
                {
                    type: 'final',
                    title: 'Your Role: The First Operatives',
                    content: `
                        <p class="mb-4">You are the first to be briefed on this new protocol. Your mission is to push the system to its limits, to provide the data we need to evolve, and to achieve a level of mastery that traditional methods cannot offer.</p>
                        <p class="font-bold text-nexus-gold">The system is ready. Your training begins now.</p>
                    `
                }
            ]
        };

        const state = { currentStage: 0 };
        const elements = {
            title: document.getElementById('main-title'),
            container: document.getElementById('stage-container'),
            nextBtn: document.getElementById('next-btn')
        };

        function typeWriter(element, text, onComplete) {
            let i = 0;
            element.innerHTML = '';
            element.classList.add('typewriter-cursor');
            const speed = 25;

            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    element.classList.remove('typewriter-cursor');
                    if (onComplete) onComplete();
                }
            }
            type();
        }

        function renderStage(stageIndex) {
            const stageData = BRIEFING_DATA.stages[stageIndex];
            elements.container.innerHTML = ''; 

            const stageDiv = document.createElement('div');
            stageDiv.className = 'stage p-4';
            let contentHTML = `<h2 class="font-orbitron text-3xl text-nexus-cyan mb-6">${stageData.title}</h2>`;

            switch (stageData.type) {
                case 'title':
                    contentHTML = `<div class="text-center mt-20">
                        <h2 class="font-orbitron text-5xl text-nexus-cyan neon-text mb-4">${stageData.title}</h2>
                        <p class="text-2xl text-nexus-purple">${stageData.subtitle}</p>
                    </div>`;
                    break;
                case 'narrative':
                    contentHTML += `<div class="text-xl leading-relaxed space-y-4">${stageData.content}</div>`;
                    break;
                case 'narrative_reading':
                    contentHTML += `
                        <div class="reading-block p-6 rounded-lg">
                            <p class="text-nexus-gold font-bold mb-4">Awaiting Input: ${stageData.reading.person}, please read the following aloud.</p>
                            <div class="text-xl leading-relaxed space-y-4">${stageData.reading.text}</div>
                        </div>`;
                    break;
                case 'interactive_concept':
                    contentHTML += `
                        <p class="text-xl mb-4">${stageData.explanation}</p>
                        <div class="text-center mt-8">
                            <button id="interactive-btn" class="font-orbitron text-2xl px-10 py-5 rounded-lg next-btn">${stageData.interactive.initialText}</button>
                            <div id="interactive-feedback" class="font-orbitron text-3xl text-nexus-gold mt-6 h-10"></div>
                        </div>
                    `;
                    break;
                case 'infographic':
                    contentHTML += `<div class="w-full h-80 flex items-center justify-center">
                        <svg id="infographic-svg" class="w-full h-full" viewBox="0 0 800 300">
                            <g class="node" transform="translate(100, 150)"><circle r="40" fill="var(--nexus-card)" stroke="var(--nexus-purple)" stroke-width="2"/><text y="5" text-anchor="middle" fill="var(--nexus-cyan)" class="font-orbitron text-xs">${stageData.steps[0].name}</text></g>
                            <g class="node" transform="translate(300, 150)"><circle r="40" fill="var(--nexus-card)" stroke="var(--nexus-purple)" stroke-width="2"/><text y="5" text-anchor="middle" fill="var(--nexus-cyan)" class="font-orbitron text-xs">${stageData.steps[1].name}</text></g>
                            <g class="node" transform="translate(500, 150)"><circle r="40" fill="var(--nexus-card)" stroke="var(--nexus-purple)" stroke-width="2"/><text y="5" text-anchor="middle" fill="var(--nexus-cyan)" class="font-orbitron text-xs">${stageData.steps[2].name}</text></g>
                            <g class="node" transform="translate(700, 150)"><circle r="40" fill="var(--nexus-card)" stroke="var(--nexus-purple)" stroke-width="2"/><text y="5" text-anchor="middle" fill="var(--nexus-cyan)" class="font-orbitron text-xs">${stageData.steps[3].name}</text></g>
                            <line x1="140" y1="150" x2="260" y2="150" stroke="var(--nexus-gold)" stroke-width="3" class="infographic-line" style="animation-delay: 0.5s;"/>
                            <line x1="340" y1="150" x2="460" y2="150" stroke="var(--nexus-gold)" stroke-width="3" class="infographic-line" style="animation-delay: 1s;"/>
                            <line x1="540" y1="150" x2="660" y2="150" stroke="var(--nexus-gold)" stroke-width="3" class="infographic-line" style="animation-delay: 1.5s;"/>
                        </svg>
                    </div>`;
                    break;
                 case 'final':
                    contentHTML += `<div class="text-xl leading-relaxed space-y-4">${stageData.content}</div>`;
                    break;
            }

            stageDiv.innerHTML = contentHTML;
            elements.container.appendChild(stageDiv);

            if (stageData.type === 'interactive_concept') {
                let clickCount = 0;
                const iBtn = document.getElementById('interactive-btn');
                const iFb = document.getElementById('interactive-feedback');
                iBtn.addEventListener('click', () => {
                    if (clickCount < stageData.interactive.clicks.length) {
                        iFb.textContent = stageData.interactive.clicks[clickCount].text;
                        iBtn.style.boxShadow = `0 0 ${stageData.interactive.clicks[clickCount].strength}px var(--nexus-cyan)`;
                        clickCount++;
                    }
                });
            }
        }
        
        function handleNext() {
            if (state.currentStage < BRIEFING_DATA.stages.length - 1) {
                elements.container.children[0].classList.add('hidden');
                setTimeout(() => {
                    state.currentStage++;
                    renderStage(state.currentStage);
                }, 700);
            } else {
                elements.nextBtn.textContent = "BRIEFING COMPLETE";
                elements.nextBtn.disabled = true;
            }
        }

        function init() {
            elements.nextBtn.addEventListener('click', handleNext);
            
            typeWriter(elements.title, BRIEFING_DATA.title, () => {
                renderStage(0);
                setTimeout(() => {
                    elements.nextBtn.disabled = false;
                    elements.nextBtn.textContent = "Begin Briefing";
                }, BRIEFING_DATA.stages[0].duration);
            });
        }
        
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>
