# RAW VERBATIM — HIGHSCHOOLLESSON.txt
## Corpus Metadata
- chunk_seq   : 0344
- chunk_id    : 0344-RAW-HIGHSCHOOLLESSON_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\HIGHSCHOOLLESSON.txt
- sha256      : A0267586F509A749E5CC0A62CF130C7CDD10E298B71F3AE4EC32F4511D1FCE43
- size_bytes  : 65851
- lines       : 1432
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : VIETNAM

---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lesson v2: What's Your Passion? (B1/B2)</title>
    <style>
        :root {
            /* New Academic Theme (Suggestion #1) */
            --bg-dark: #0a192f;        /* Navy Background */
            --purple-dark: #172a45;   /* Lighter Navy Panel */
            --purple-bright: #38b6ff;  /* Sky Blue Accent */
            --gold: #ffc107;          /* Gold Accent (Kept for pop) */
            --cyan: #64ffda;          /* Mint Green Accent */
            --text-light: #ccd6f6;    /* Light Text */
            --text-dark: #0a192f;
            --danger: #f772b2;
            --success: #64ffda;
            --warning: #ffc107;
            --shadow: rgba(0, 0, 0, 0.4);

            --bg-color: var(--bg-dark);
            --panel-color: var(--purple-dark);
            --text-primary: var(--text-light);
            --text-secondary: var(--gold);
            --accent-primary: var(--cyan);
            --accent-secondary: var(--purple-bright);
        }

        /* Light/Day Mode (Suggestion #8) */
        body.theme-light {
            --bg-color: #f0f4f8;
            --panel-color: #ffffff;
            --text-primary: #172a45;
            --text-secondary: #0b579e;
            --accent-primary: #007bff;
            --accent-secondary: #0056b3;
            --shadow: rgba(0, 0, 0, 0.1);
        }

        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: var(--bg-color);
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            transition: background-color 0.3s, color 0.3s;
        }
        header {
            background: var(--panel-color);
            color: var(--accent-primary);
            text-align: center;
            padding: 1.5em 1em;
            border-bottom: 3px solid var(--accent-secondary);
            box-shadow: 0 4px 20px var(--shadow);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        header h1 {
            margin: 0;
            font-size: 2em;
            text-shadow: 0 0 10px var(--accent-primary);
        }
        .theme-toggle {
            font-size: 1.5em;
            cursor: pointer;
            background: none;
            border: none;
            color: var(--text-secondary);
            padding: 0.5em;
            border-radius: 50%;
        }
        .theme-toggle:hover {
            background: rgba(100, 255, 218, 0.1);
        }
        main {
            padding: 2em;
            max-width: 1000px;
            margin: auto;
        }
        h1 { color: var(--accent-primary); }
        h2 {
            color: var(--text-secondary);
            border-bottom: 2px solid var(--accent-secondary);
            padding-bottom: 8px;
            margin-top: 2em;
            font-size: 1.6em;
        }
        h3 {
            color: var(--accent-primary);
            margin-top: 0;
        }
        p {
            font-size: 1.1em;
            line-height: 1.7em;
            color: var(--text-primary);
        }
        .progress-container {
            width: 100%;
            background: var(--panel-color);
            border-radius: 10px;
            border: 2px solid var(--accent-secondary);
            margin-bottom: 1.5em;
            box-shadow: 0 4px 15px var(--shadow);
            overflow: hidden;
        }
        .progress-bar {
            width: 0%;
            height: 30px;
            background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
            border-radius: 8px;
            text-align: center;
            line-height: 30px;
            color: var(--text-dark);
            font-weight: bold;
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 0 20px rgba(100, 255, 218, 0.5);
        }
        .progress-stats {
            display: flex;
            justify-content: space-around;
            margin-top: 1em;
            padding: 1em;
            background: rgba(23, 42, 69, 0.5);
            border-radius: 8px;
            border: 1px solid var(--accent-secondary);
        }
        body.theme-light .progress-stats {
             background: rgba(230, 240, 250, 0.5);
        }
        .stat-item {
            text-align: center;
            flex-basis: 0;
            flex-grow: 1;
        }
        .stat-label {
            font-size: 0.9em;
            color: var(--text-primary);
            margin-bottom: 0.3em;
        }
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: var(--accent-primary);
        }
        .stat-item.completed .stat-value {
            color: var(--success);
        }
        #global-mission-complete {
            display: none;
            font-size: 2.5em;
            text-align: center;
            padding: 1.5em;
            background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--gold) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: pulse 2s infinite, shimmer 3s infinite;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .vocab-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1em;
            margin-top: 1em;
        }
        .vocab-item {
            background: var(--panel-color);
            padding: 1em;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid var(--accent-secondary);
            text-align: center;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 10px var(--shadow);
        }
        .vocab-item:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 8px 25px rgba(56, 182, 255, 0.4);
            border-color: var(--accent-primary);
        }
        .vocab-header {
            font-size: 1.1em;
        }
        .vocab-listen {
            font-size: 0.8em;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .vocab-listen:hover {
            opacity: 1;
        }
        .vocab-details {
            display: none; 
            margin-top: 0.75em;
            padding: 0.75em;
            background: var(--bg-color);
            border-radius: 6px;
            text-align: left;
            border-left: 3px solid var(--accent-primary);
        }
        .vocab-details .definition {
            font-style: italic;
            color: var(--text-primary);
            font-weight: normal;
            cursor: pointer;
            padding: 0.5em;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .vocab-details .definition:hover {
            color: var(--accent-primary);
            background: rgba(100, 255, 218, 0.1);
        }
        .vocab-details .translation {
            display: none;
            font-style: normal;
            color: var(--accent-primary);
            font-weight: bold;
            margin-top: 0.5em;
            padding: 0.5em;
            background: rgba(100, 255, 218, 0.1);
            border-radius: 4px;
            animation: fadeIn 0.3s;
        }
        .vocab-item.active {
            background: linear-gradient(135deg, var(--accent-secondary) 0%, #1e90ff 100%);
            box-shadow: 0 0 30px rgba(56, 182, 255, 0.7);
        }
        .vocab-item.active .vocab-details {
            display: block;
            animation: slideDown 0.3s;
        }
        .module-container {
            background: var(--panel-color);
            padding: 2em;
            margin-top: 1.5em;
            border-radius: 12px;
            border-left: 6px solid var(--accent-secondary);
            box-shadow: 0 8px 30px var(--shadow);
            position: relative;
        }
        button {
            margin-top: 1em;
            padding: 0.8em 1.5em;
            background: linear-gradient(135deg, var(--accent-secondary) 0%, #007bff 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1em;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(56, 182, 255, 0.4);
            position: relative;
            overflow: hidden;
        }
        button:hover {
            background: linear-gradient(135deg, var(--accent-primary) 0%, #00cc88 100%);
            color: var(--text-dark);
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(100, 255, 218, 0.6);
        }
        button:active {
            transform: translateY(0) scale(0.98);
        }
        button:disabled {
            background: #555;
            cursor: not-allowed;
            box-shadow: none;
            opacity: 0.5;
        }
        input[type="text"], select, textarea {
            padding: 0.75em;
            border-radius: 8px;
            border: 2px solid var(--accent-secondary);
            background: var(--bg-color);
            color: var(--text-secondary);
            font-size: 1em;
            margin: 0.5em 0;
            width: 100%;
            transition: all 0.3s;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
        }
        textarea {
            min-height: 120px;
            font-family: 'Segoe UI', Arial, sans-serif;
            resize: vertical;
        }
        select {
            cursor: pointer;
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2338b6ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20128c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4l128-128c3.6-3.6%205.4-7.8%205.4-12.8%200-5-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
            background-repeat: no-repeat, repeat;
            background-position: right .7em top 50%, 0 0;
            background-size: .65em auto, 100%;
        }
        body.theme-light select {
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007bff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20128c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4l128-128c3.6-3.6%205.4-7.8%205.4-12.8%200-5-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
        }
        select option {
            background: var(--bg-color);
            color: var(--text-primary);
            padding: 10px;
        }
        input[type="text"]:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 20px rgba(100, 255, 218, 0.4);
            background: var(--panel-color);
        }
        .feedback {
            margin-top: 1em;
            font-style: italic;
            font-weight: bold;
            min-height: 1.5em;
            padding: 0.75em;
            border-radius: 6px;
            transition: all 0.3s;
        }
        .feedback.success { 
            color: var(--success);
            background: rgba(100, 255, 218, 0.1);
            border-left: 4px solid var(--success);
        }
        .feedback.error { 
            color: var(--danger);
            background: rgba(247, 114, 178, 0.1);
            border-left: 4px solid var(--danger);
        }
        .feedback.warning {
            color: var(--warning);
            background: rgba(255, 193, 7, 0.1);
            border-left: 4px solid var(--warning);
        }
        .mission-complete {
            display: none;
            font-size: 2em;
            color: var(--success);
            text-align: center;
            padding: 2em;
            font-weight: bold;
            animation: pulse 1.5s infinite, confetti 0.5s;
            text-shadow: 0 0 15px var(--success);
        }
        /* Game: Match */
        .match-game-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5em;
        }
        .match-col {
            display: flex;
            flex-direction: column;
            gap: 0.75em;
        }
        .match-col-header {
            font-weight: bold;
            font-size: 1.1em;
            color: var(--accent-primary);
            text-align: center;
            padding: 0.5em;
            background: rgba(56, 182, 255, 0.2);
            border-radius: 6px;
            margin-bottom: 0.5em;
        }
        .match-item {
            background: var(--panel-color);
            border: 2px solid var(--accent-secondary);
            padding: 1em;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            box-shadow: 0 4px 10px var(--shadow);
        }
        .match-item:hover:not(.matched) {
            background: linear-gradient(135deg, var(--accent-secondary) 0%, #007bff 100%);
            transform: translateX(5px);
            box-shadow: 0 4px 20px rgba(56, 182, 255, 0.5);
            color: white;
        }
        .match-item.selected {
            background: linear-gradient(135deg, var(--gold) 0%, #ffed4e 100%);
            color: var(--text-dark);
            border-color: var(--gold);
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
            font-weight: bold;
        }
        .match-item.matched {
            background: #2a3b53;
            color: #778da9;
            border-color: #49586f;
            cursor: not-allowed;
            opacity: 0.5;
            transform: scale(0.95);
        }
        body.theme-light .match-item.matched {
            background: #e9ecef;
            color: #adb5bd;
            border-color: #dee2e6;
        }
        /* Game: Gap-Fill */
        .gap-fill-container .gap-item {
            display: flex;
            align-items: center;
            margin-bottom: 1em;
            gap: 10px;
        }
        .gap-fill-container .gap-item label {
            flex-basis: 60%;
            line-height: 1.6;
            color: var(--text-primary);
        }
        .gap-fill-container .gap-item select {
            flex-basis: 40%;
        }
        /* Game: Flashcard (Suggestion #24) */
        .flashcard-container {
            perspective: 1000px;
            height: 250px;
            cursor: pointer;
        }
        .flashcard {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.6s;
        }
        .flashcard.is-flipped {
            transform: rotateX(180deg);
        }
        .flashcard-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1.5em;
            border-radius: 12px;
            box-shadow: 0 8px 30px var(--shadow);
        }
        .flashcard-front {
            background: linear-gradient(135deg, var(--accent-secondary) 0%, #007bff 100%);
            color: white;
            font-size: 1.8em;
            font-weight: bold;
        }
        .flashcard-back {
            background: var(--panel-color);
            border: 2px solid var(--accent-primary);
            color: var(--accent-primary);
            transform: rotateX(180deg);
            font-size: 1.2em;
            flex-direction: column;
        }
        .flashcard-back .definition {
            font-style: italic;
            color: var(--text-primary);
        }
        .flashcard-back .translation {
            font-weight: bold;
            color: var(--accent-primary);
            margin-top: 1em;
        }
        .flashcard-controls {
            display: flex;
            justify-content: center;
            gap: 1em;
            margin-top: 1em;
        }
        .flashcard-controls button {
            flex-grow: 1;
        }
        #flashcard-btn-no {
            background: linear-gradient(135deg, var(--danger) 0%, #c11f7e 100%);
        }
        #flashcard-btn-yes {
            background: linear-gradient(135deg, var(--success) 0%, #00cc88 100%);
            color: var(--text-dark);
        }

        .tip-box {
            background: linear-gradient(135deg, rgba(56, 182, 255, 0.2) 0%, rgba(100, 255, 218, 0.2) 100%);
            padding: 1.5em;
            border-radius: 10px;
            border: 2px solid var(--accent-primary);
            margin-top: 1em;
            box-shadow: 0 0 30px rgba(100, 255, 218, 0.3);
        }
        /* Teacher/Student Tools */
        .tools-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5em;
        }
        .tool-box {
            background: var(--panel-color);
            padding: 1.5em;
            border-radius: 12px;
            border-top: 4px solid var(--accent-secondary);
            box-shadow: 0 8px 30px var(--shadow);
        }
        .tool-box h3 {
            margin-top: 0;
        }
        #lesson-timer {
            font-size: 1.5em;
            font-weight: bold;
            color: var(--gold);
        }
        #teacher-controls {
            border-top-color: var(--danger);
        }
        #teacher-controls summary {
            cursor: pointer;
            font-weight: bold;
            color: var(--danger);
        }
        /* Animations */
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideDown {
            from { 
                opacity: 0;
                transform: translateY(-10px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes confetti {
            0% { transform: scale(0.5) rotate(-45deg); }
            50% { transform: scale(1.2) rotate(45deg); }
            100% { transform: scale(1) rotate(0deg); }
        }
        /* Responsive */
        @media (max-width: 768px) {
            main {
                padding: 1em;
            }
            header {
                flex-direction: column;
                gap: 10px;
            }
            header h1 {
                font-size: 1.5em;
            }
            .vocab-list, .match-game-container, .tools-grid {
                grid-template-columns: 1fr;
            }
            .gap-fill-container .gap-item {
                flex-direction: column;
                align-items: flex-start;
            }
            .gap-fill-container .gap-item select {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>B1/B2: What's Your Passion?</h1>
        <button class="theme-toggle" id="theme-toggle-btn" title="Toggle Theme" aria-label="Toggle Theme">🌙</button>
    </header>
    <main>
        <section>
            <h2>📊 Lesson Progress</h2>
            <div class="progress-container">
                <div class="progress-bar" id="lesson-progress-bar">0%</div>
            </div>
            <div class="progress-stats">
                <div class="stat-item" id="stat-reading">
                    <div class="stat-label">Reading Task</div>
                    <div class="stat-value">○</div>
                </div>
                <div class="stat-item" id="stat-game1">
                    <div class="stat-label">Game 1 (Flashcards)</div>
                    <div class="stat-value">○</div>
                </div>
                <div class="stat-item" id="stat-game2">
                    <div class="stat-label">Game 2 (Vocab Match)</div>
                    <div class="stat-value">○</div>
                </div>
                <div class="stat-item" id="stat-game3">
                    <div class="stat-label">Game 3 (Idiom Match)</div>
                    <div class="stat-value">○</div>
                </div>
            </div>
            <div id="global-mission-complete" class="mission-complete">
                🎉 LESSON PROTOCOL COMPLETE! 🎉
            </div>
        </section>

        <section class="tip-box">
            <h3 style="margin-top:0; color: var(--text-dark);">Today's Focus</h3>
            <p style="color: var(--text-dark);">
                <strong>Word of the Day:</strong> Perseverance (n.) - Continuing to try even when it is very difficult.
                <br>
                <strong>Idiom of the Day:</strong> Go the extra mile - To do more than what is expected of you.
            </p>
        </section>

        <section>
            <h2>📖 Lesson Overview</h2>
            <p>
                Welcome! This lesson explores 'passion'. Passion is that strong, deep feeling that pushes you to do amazing things. It is more than just a simple interest or hobby.
            </p>
            <p>
                We will explore what <strong>motivation</strong> and <strong>drive</strong> truly mean. You will learn 10 key vocabulary words and 5 new idioms to help you talk about your goals and your <strong>ambition</strong>. Let's begin!
            </p>
        </section>

        <section>
            <h2>📚 Key Vocabulary & Idioms</h2>
            <p style="color: var(--text-primary); font-style: italic;">Click on any word to see its definition. Click the definition to reveal the Vietnamese translation.</p>
            <div class="vocab-list" id="vocab-list-container">
                </div>
        </section>

        <section>
            <h2>✍️ Long Reading: The Anatomy of Passion</h2>
            <div class="module-container">
                <h3><span class="icon">📘</span> The Anatomy of Passion</h3>
                <p>
                    What is the difference between a simple hobby and a true <strong style="color:var(--gold)">passion</strong>? A hobby is something you enjoy, but a <strong>passion</strong> is something you feel you *must* do. It is the internal fire that guides your choices. It is often linked to your <strong style="color:var(--gold)">ambition</strong>, which is the external goal you want to achieve. Passion is the 'why', while ambition is the 'what'.
                </p>
                <p>
                    This fire often starts from a spark of <strong style="color:var(--gold)">curiosity</strong>. You ask a question: "Could I do that?" or "How does that work?" This initial interest, if you feed it, grows into <strong style="color:var(--gold)">enthusiasm</strong>. You start to enjoy the process of learning and improving, and this positive feeling becomes a powerful cycle.
                </p>
                <p>
                    This cycle creates internal <strong style="color:var(--gold)">motivation</strong>—the desire to act without an external reward. You do it because you love the activity itself. This motivation is the fuel for your <strong style="color:var(--gold)">drive</strong>, which is the energy you apply to move forward, even when it isn't easy. A person with strong drive is proactive and doesn't wait to be told what to do.
                </p>
                <p>
                    However, drive is not enough. You will always face challenges. This is where <strong style="color:var(--gold)">perseverance</strong> becomes essential. Perseverance is the ability to continue when things are difficult. It is closely related to <strong style="color:var(--gold)">resilience</strong>, which is your ability to recover—or 'bounce back'—after a failure or a setback.
                </p>
                <p>
                    To build this resilience, you need <strong style="color:var(--gold)">dedication</strong>. This means you <i>pour your heart and soul into</i> your work, giving it time and energy. This is not a part-time feeling; it is a full-time <strong style="color:var(--gold)">commitment</strong> to your goal. People with this level of focus often <i>burn the midnight oil</i> to get the job done.
                </p>
                <p>
                    When you combine <strong>passion</strong>, <strong>motivation</strong>, and <strong>perseverance</strong>, you find more than just a job; you <i>find your calling</i>. It is the result of <i>blood, sweat, and tears</i>, but it leads to a feeling of deep fulfillment. This is the ultimate goal of following your passion.
                </p>

                <hr style="border-color: var(--accent-secondary); margin-top: 2em;">

                <h3 style="margin-top: 1.5em;">Reading Task: Vocabulary Gap-Fill</h3>
                <p>Complete the sentences below. This is an auto-graded task for your class of 40. Use the 10 vocabulary words to fill the gaps. Each word is used only once.</p>
                <div class="gap-fill-container" id="gap-fill-container">
                    </div>
                <button id="writing-prompt-submit">Check Answers</button>
                <div id="writing-feedback" class="feedback" role="status" aria-live="polite"></div>

            </div>
        </section>

        <section>
            <h2>🎮 Game Module 1: Flashcard Review</h2>
            <p style="color: var(--text-primary); font-style: italic;">Review the first 5 words. Click the card to flip it. Then, mark if you knew the word or not.</p>
            <div class="module-container" id="gameContainer1">
                <div class="flashcard-container">
                    <div class="flashcard" id="flashcard" role="button" tabindex="0">
                        <div class="flashcard-face flashcard-front" id="flashcard-front">
                            Passion
                        </div>
                        <div class="flashcard-face flashcard-back" id="flashcard-back">
                            <div class="definition">...</div>
                            <div class="translation">...</div>
                        </div>
                    </div>
                </div>
                <div class="flashcard-controls">
                    <button id="flashcard-btn-no">I didn't know ❌</button>
                    <button id="flashcard-btn-yes">I knew this! ✅</button>
                </div>
                <div id="flashcard-progress" style="text-align:center; margin-top:1em; color: var(--accent-primary);">1 / 5</div>
            </div>
            <div id="game-feedback-1" class="feedback" role="status" aria-live="polite"></div>
            <div id="mission-complete-1" class="mission-complete">
                ✅ MODULE 1 COMPLETE!
            </div>
        </section>

        <section>
            <h2>🧩 Game Module 2: Definition Match (Vocab)</h2>
            <p style="color: var(--text-primary); font-style: italic;">Match the last 5 vocabulary words to their correct definition.</p>
            <div class="module-container" id="gameContainer2">
                </div>
            <div id="game-feedback-2" class="feedback" role="status" aria-live="polite"></div>
            <div id="mission-complete-2" class="mission-complete">
                ✅ MODULE 2 COMPLETE!
            </div>
        </section>
        
        <section>
            <h2>🚀 Game Module 3: Idiom Match</h2>
            <p style="color: var(--text-primary); font-style: italic;">Match the 5 idioms to their correct meaning. These are common in business and professional life.</p>
            <div class="module-container" id="gameContainer3">
                </div>
            <div id="game-feedback-3" class="feedback" role="status" aria-live="polite"></div>
            <div id="mission-complete-3" class="mission-complete">
                ✅ MODULE 3 COMPLETE!
            </div>
        </section>

        <section>
            <h2>🛠️ Student Tools</h2>
            <div class="tools-grid">
                <div class="tool-box" id="notes-tool">
                    <h3><span class="icon">🗒️</span> My Lesson Notes</h3>
                    <p style="font-size: 0.9em; opacity: 0.8;">Your notes are saved automatically in your browser.</p>
                    <textarea id="student-notes" placeholder="Type your personal reflections or questions here..." aria-label="Student Notes"></textarea>
                </div>
                <div class="tool-box" id="timer-tool">
                    <h3><span class="icon">⏱️</span> Lesson Timer</h3>
                    <p style="font-size: 0.9em; opacity: 0.8;">Total time spent on this lesson:</p>
                    <div id="lesson-timer">00:00</div>
                </div>
            </div>
        </section>

        <section>
            <details id="teacher-controls" class="tool-box">
                <summary>Teacher Control Panel (Simulated)</summary>
                <p>These controls manage the lesson data stored in your browser.</p>
                <button id="btn-reset-progress">Reset All Progress</button>
                <button id="btn-export-data">Export Student Data (JSON)</button>
            </details>
        </section>
    </main>
    <script>
        // --- Global State ---
        const lessonProgress = {
            reading: false,
            game1: false,
            game2: false,
            game3: false,
            totalTasks: 4
        };

        // B1/B2 Intermediate Vocabulary (10) and Idioms (5)
        // Keyed by a simple ID for easier filtering
        const vocabData = {
            'passion': { def: "A very strong feeling of love, enthusiasm, or desire for something.", trans: "Đam mê: Cảm giác yêu thích, nhiệt tình hoặc ham muốn mãnh liệt đối với một điều gì đó." },
            'motivation': { def: "The internal reason or desire that makes you do something.", trans: "Động lực: Lý do nội tại hoặc mong muốn khiến bạn làm điều gì đó." },
            'drive': { def: "A strong natural need or desire that makes you want to achieve things.", trans: "Nỗ lực/Thúc đẩy: Nhu cầu hoặc mong muốn tự nhiên mạnh mẽ khiến bạn muốn đạt được mọi thứ." },
            'dedication': { def: "A willingness to give a lot of time and energy to something because it is important.", trans: "Sự cống hiến: Sẵn sàng dành nhiều thời gian và năng lượng cho điều gì đó vì nó quan trọng." },
            'perseverance': { def: "Continuing to try to achieve something difficult, even when there are problems.", trans: "Sự kiên trì: Tiếp tục cố gắng đạt được điều gì đó khó khăn, ngay cả khi có vấn đề." },
            'ambition': { def: "A strong desire to be successful, powerful, or famous.", trans: "Tham vọng: Mong muốn mạnh mẽ để trở nên thành công, quyền lực hoặc nổi tiếng." },
            'curiosity': { def: "A strong desire to know or learn about something.", trans: "Sự tò mò: Mong muốn mạnh mẽ để biết hoặc tìm hiểu về điều gì đó." },
            'enthusiasm': { def: "A strong feeling of excitement and interest in something.", trans: "Lòng nhiệt tình: Cảm giác phấn khích và thích thú mạnh mẽ đối với một điều gì đó." },
            'commitment': { def: "A promise to do something; a strong belief in an idea.", trans: "Sự cam kết: Lời hứa làm điều gì đó; một niềm tin mạnh mẽ vào một ý tưởng." },
            'resilience': { def: "The ability to become strong, happy, or successful again after a difficult situation.", trans: "Sự kiên cường: Khả năng trở nên mạnh mẽ, hạnh phúc hoặc thành công trở lại sau một tình huống khó khăn." },
            // Idioms (Suggestion #23)
            'idiom_calling': { term: 'find your calling', def: "To discover the type of work or career that you are perfect for.", trans: "Tìm thấy tiếng gọi: Khám phá ra loại công việc hoặc sự nghiệp mà bạn hoàn toàn phù hợp." },
            'idiom_heart': { term: 'pour your heart and soul into', def: "To do something with the maximum amount of energy and passion.", trans: "Dồn hết tâm huyết: Làm điều gì đó với tối đa năng lượng và đam mê." },
            'idiom_mile': { term: 'go the extra mile', def: "To do more work or make more effort than is expected of you.", trans: "Nỗ lực hơn nữa: Làm nhiều việc hơn hoặc nỗ lực nhiều hơn những gì được mong đợi ở bạn." },
            'idiom_oil': { term: 'burn the midnight oil', def: "To work or study very late into the night.", trans: "Thức khuya làm việc: Làm việc hoặc học tập rất muộn vào ban đêm." },
            'idiom_sweat': { term: 'blood, sweat, and tears', def: "A very large amount of effort, hard work, and suffering.", trans: "Máu, mồ hôi và nước mắt: Một nỗ lực rất lớn, làm việc chăm chỉ và chịu đựng gian khổ." }
        };

        // --- 1. Progress & Theme Logic ---

        function updateLessonProgress() {
            let completedTasks = 0;
            if (lessonProgress.reading) completedTasks++;
            if (lessonProgress.game1) completedTasks++;
            if (lessonProgress.game2) completedTasks++;
            if (lessonProgress.game3) completedTasks++;
            
            const percentage = Math.round((completedTasks / lessonProgress.totalTasks) * 100);
            const progressBar = document.getElementById('lesson-progress-bar');
            
            progressBar.style.width = percentage + '%';
            progressBar.textContent = percentage + '%';
            
            document.getElementById('stat-reading').classList.toggle('completed', lessonProgress.reading);
            document.getElementById('stat-reading').querySelector('.stat-value').textContent = lessonProgress.reading ? '✓' : '○';
            
            document.getElementById('stat-game1').classList.toggle('completed', lessonProgress.game1);
            document.getElementById('stat-game1').querySelector('.stat-value').textContent = lessonProgress.game1 ? '✓' : '○';
            
            document.getElementById('stat-game2').classList.toggle('completed', lessonProgress.game2);
            document.getElementById('stat-game2').querySelector('.stat-value').textContent = lessonProgress.game2 ? '✓' : '○';

            document.getElementById('stat-game3').classList.toggle('completed', lessonProgress.game3);
            document.getElementById('stat-game3').querySelector('.stat-value').textContent = lessonProgress.game3 ? '✓' : '○';
            
            if (percentage === 100) {
                document.getElementById('global-mission-complete').style.display = 'block';
                progressBar.style.background = 'linear-gradient(90deg, var(--gold) 0%, var(--cyan) 100%)';
                document.getElementById('global-mission-complete').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // Save progress to localStorage (Suggestion #45)
            localStorage.setItem('lessonProgress', JSON.stringify(lessonProgress));
        }

        function loadProgress() {
            const savedProgress = JSON.parse(localStorage.getItem('lessonProgress'));
            if (savedProgress) {
                Object.assign(lessonProgress, savedProgress);
            }
            updateLessonProgress();
        }

        // --- 2. Vocab List ---

        function createVocabList() {
            const container = document.getElementById('vocab-list-container');
            container.innerHTML = ''; 
            for (const [key, data] of Object.entries(vocabData)) {
                const item = document.createElement('div');
                item.className = 'vocab-item';
                item.setAttribute('role', 'button');
                item.setAttribute('tabindex', '0');

                const term = data.term || key; // Use 'term' field if it exists (for idioms)
                const termText = term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                const header = document.createElement('div');
                header.className = 'vocab-header';
                header.textContent = termText;

                // Suggestion #19: Audio playback
                const listen = document.createElement('span');
                listen.className = 'vocab-listen';
                listen.textContent = ' 🎤 (listen)';
                listen.setAttribute('role', 'button');
                listen.setAttribute('aria-label', `Listen to ${termText}`);
                listen.onclick = (e) => {
                    e.stopPropagation();
                    // Mock audio playback
                    alert(`Playing audio for: ${termText}`);
                };
                header.appendChild(listen);
                item.appendChild(header);

                const details = document.createElement('div');
                details.className = 'vocab-details';
                
                const definition = document.createElement('div');
                definition.className = 'definition';
                definition.textContent = '📖 ' + data.def;
                definition.setAttribute('role', 'button');
                definition.setAttribute('tabindex', '0');
                
                const translation = document.createElement('div');
                translation.className = 'translation';
                translation.textContent = '🇻🇳 ' + data.trans;
                
                definition.onclick = (e) => {
                    e.stopPropagation();
                    const isVisible = translation.style.display === 'block';
                    translation.style.display = isVisible ? 'none' : 'block';
                };
                
                definition.onkeypress = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        definition.onclick(e);
                    }
                };
                
                details.appendChild(definition);
                details.appendChild(translation);
                item.appendChild(details);
                
                const toggleVocab = () => {
                    document.querySelectorAll('.vocab-item.active').forEach(activeItem => {
                        if(activeItem !== item) {
                            activeItem.classList.remove('active');
                            activeItem.querySelector('.translation').style.display = 'none';
                        }
                    });
                    item.classList.toggle('active');
                    if (!item.classList.contains('active')) {
                        translation.style.display = 'none';
                    }
                };
                
                item.onclick = toggleVocab;
                item.onkeypress = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleVocab();
                    }
                };
                
                container.appendChild(item);
            }
        }

        // --- 3. Reading Task: Gap-Fill ---

        const gapFillData = [
            { id: 'gap1', text: 'She had a strong ___ to become a doctor.', answer: 'ambition' },
            { id: 'gap2', text: 'You must have ___ and keep practicing, even when it is hard.', answer: 'perseverance' },
            { id: 'gap3', text: 'His ___ for science started when he was a child.', answer: 'passion' },
            { id: 'gap4', text: 'What is your ___ for working so hard?', answer: 'motivation' },
            { id: 'gap5', text: 'The team showed great ___ to the project.', answer: 'commitment' },
            { id: 'gap6', text: 'It takes ___ to start a new business from nothing.', answer: 'drive' },
            { id: 'gap7', text: 'He showed great ___ after losing his job; he found a new one quickly.', answer: 'resilience' },
            { id: 'gap8', text: 'Her ___ led her to explore the old library.', answer: 'curiosity' },
            { id: 'gap9', text: 'They showed a lot of ___ for the new plan.', answer: 'enthusiasm' },
            { id: 'gap10', text: 'Becoming a musician requires years of ___.', answer: 'dedication' }
        ];
        
        const vocabList = ['passion', 'motivation', 'drive', 'dedication', 'perseverance', 'ambition', 'curiosity', 'enthusiasm', 'commitment', 'resilience'];

        function createGapFill() {
            const container = document.getElementById('gap-fill-container');
            container.innerHTML = '';
            
            gapFillData.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'gap-item';
                
                const label = document.createElement('label');
                label.htmlFor = item.id;
                label.textContent = item.text.replace('___', ' _____ ');
                
                const select = document.createElement('select');
                select.id = item.id;
                select.name = item.id;
                select.dataset.answer = item.answer;
                
                const defaultOption = document.createElement('option');
                defaultOption.value = "";
                defaultOption.textContent = "--- Select a word ---";
                select.appendChild(defaultOption);
                
                vocabList.forEach(word => {
                    const option = document.createElement('option');
                    option.value = word;
                    option.textContent = word.charAt(0).toUpperCase() + word.slice(1);
                    select.appendChild(option);
                });
                
                itemDiv.appendChild(label);
                itemDiv.appendChild(select);
                container.appendChild(itemDiv);
            });
        }
        
        document.getElementById('writing-prompt-submit').addEventListener('click', () => {
            const feedback = document.getElementById('writing-feedback');
            let correctCount = 0;
            const total = gapFillData.length;
            
            gapFillData.forEach(item => {
                const select = document.getElementById(item.id);
                if (select.value === item.answer) {
                    correctCount++;
                    select.style.borderColor = 'var(--success)';
                } else {
                    select.style.borderColor = 'var(--danger)';
                }
            });
            
            if (correctCount === total) {
                feedback.textContent = `✅ Perfect! You got ${correctCount}/${total} correct. Your understanding of this vocabulary is excellent!`;
                feedback.className = "feedback success";
                if (!lessonProgress.reading) {
                    lessonProgress.reading = true;
                    updateLessonProgress();
                }
            } else if (correctCount >= total * 0.7) {
                feedback.textContent = `📝 Good job! You got ${correctCount}/${total} correct. Review the words you missed.`;
                feedback.className = "feedback warning";
                if (!lessonProgress.reading) {
                    lessonProgress.reading = true;
                    updateLessonProgress();
                }
            } else {
                feedback.textContent = `❌ Not quite. You got ${correctCount}/${total}. Please review the vocabulary and try again.`;
                feedback.className = "feedback error";
            }
            feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // --- Game 1: Flashcard Review (Suggestion #24) ---
        class FlashcardGame {
            constructor(containerId, words, feedbackId, onSuccessCallback) {
                this.container = document.getElementById(containerId);
                this.feedbackEl = document.getElementById(feedbackId);
                this.onSuccess = onSuccessCallback;
                this.words = this.shuffleArray([...words]);
                this.currentWordIndex = 0;

                this.card = document.getElementById('flashcard');
                this.cardFront = document.getElementById('flashcard-front');
                this.cardBack = document.getElementById('flashcard-back');
                this.btnYes = document.getElementById('flashcard-btn-yes');
                this.btnNo = document.getElementById('flashcard-btn-no');
                this.progressText = document.getElementById('flashcard-progress');
                
                this.card.addEventListener('click', () => this.flipCard());
                this.card.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') this.flipCard();
                });
                this.btnYes.addEventListener('click', () => this.nextCard(true));
                this.btnNo.addEventListener('click', () => this.nextCard(false));
                
                this.showCard();
            }

            shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            flipCard() {
                this.card.classList.toggle('is-flipped');
            }

            showCard() {
                if (this.currentWordIndex >= this.words.length) {
                    this.container.innerHTML = '';
                    this.setFeedback('🎉 Great review session! You have finished these flashcards.', 'success');
                    this.onSuccess();
                    return;
                }
                
                const key = this.words[this.currentWordIndex];
                const data = vocabData[key];
                const term = data.term || key;
                
                this.card.classList.remove('is-flipped');
                
                this.cardFront.textContent = term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                this.cardBack.querySelector('.definition').textContent = '📖 ' + data.def;
                this.cardBack.querySelector('.translation').textContent = '🇻🇳 ' + data.trans;
                this.progressText.textContent = `${this.currentWordIndex + 1} / ${this.words.length}`;
            }

            nextCard(known) {
                if (!this.card.classList.contains('is-flipped')) {
                    this.setFeedback('Flip the card to see the definition first!', 'warning');
                    return;
                }
                
                this.setFeedback('');
                this.currentWordIndex++;
                
                if (known) {
                    // You could add logic here to track 'known' words
                } else {
                    // Add logic to re-add this word to the deck later
                }
                
                setTimeout(() => this.showCard(), 300); // Wait for flip animation
            }
            
            setFeedback(message, className = '') {
                if (this.feedbackEl) {
                    this.feedbackEl.textContent = message;
                    this.feedbackEl.className = className ? 'feedback ' + className : 'feedback';
                }
            }
        }
        
        // --- Game 2 & 3: Definition Match (Reusable Class) ---
        class DefinitionMatchGame {
            constructor(containerId, items, feedbackId, onSuccessCallback) {
                this.container = document.getElementById(containerId);
                this.feedbackEl = document.getElementById(feedbackId);
                this.items = items; // This now expects an object like {'key': {def: '...', trans: '...'}}
                this.onSuccess = onSuccessCallback;
                this.itemKeys = Object.keys(items);
                this.definitions = this.itemKeys.map(key => ({ key, def: items[key].def }));
                this.selectedItem = null;
                this.selectedDef = null;
                this.matchedPairs = 0;
                this.attempts = 0;
                this.correctMatches = 0;
                this.init();
            }

            shuffleArray(array) {
                const newArray = [...array];
                for (let i = newArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
                }
                return newArray;
            }

            setFeedback(message, className = '') {
                if (this.feedbackEl) {
                    this.feedbackEl.textContent = message;
                    this.feedbackEl.className = className ? 'feedback ' + className : 'feedback';
                }
            }

            init() {
                this.container.innerHTML = '';
                this.setFeedback('🎯 Match each item to its definition. Select one item and one definition to make a pair.');
                
                const gameBox = document.createElement('div');
                gameBox.className = 'match-game-container';
                
                const itemCol = document.createElement('div');
                itemCol.className = 'match-col';
                const itemHeader = document.createElement('div');
                itemHeader.className = 'match-col-header';
                itemHeader.textContent = '📝 ITEMS';
                itemCol.appendChild(itemHeader);
                
                const defCol = document.createElement('div');
                defCol.className = 'match-col';
                const defHeader = document.createElement('div');
                defHeader.className = 'match-col-header';
                defHeader.textContent = '📖 DEFINITIONS';
                defCol.appendChild(defHeader);
                
                const shuffledKeys = this.shuffleArray([...this.itemKeys]);
                const shuffledDefs = this.shuffleArray([...this.definitions]);
                
                shuffledKeys.forEach(key => {
                    const el = document.createElement('div');
                    el.className = 'match-item';
                    const term = this.items[key].term || key; // Use 'term' field if available
                    el.textContent = term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    el.dataset.key = key;
                    el.setAttribute('role', 'button');
                    el.setAttribute('tabindex', '0');
                    el.onclick = () => this.selectItem(el);
                    el.onkeypress = (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.selectItem(el); }
                    };
                    itemCol.appendChild(el);
                });
                
                shuffledDefs.forEach(defObj => {
                    const el = document.createElement('div');
                    el.className = 'match-item';
                    el.textContent = defObj.def;
                    el.dataset.def = defObj.def;
                    el.dataset.key = defObj.key; // The key (e.g., 'passion') is the link
                    el.setAttribute('role', 'button');
                    el.setAttribute('tabindex', '0');
                    el.onclick = () => this.selectDef(el);
                    el.onkeypress = (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.selectDef(el); }
                    };
                    defCol.appendChild(el);
                });
                
                gameBox.appendChild(itemCol);
                gameBox.appendChild(defCol);
                this.container.appendChild(gameBox);
                
                const statsBox = document.createElement('div');
                statsBox.style.marginTop = '1em';
                statsBox.style.padding = '1em';
                statsBox.style.background = 'rgba(56, 182, 255, 0.1)';
                statsBox.style.borderRadius = '8px';
                statsBox.style.textAlign = 'center';
                statsBox.id = `match-stats-${this.container.id}`;
                statsBox.innerHTML = `<strong>Progress:</strong> ${this.matchedPairs} / ${this.itemKeys.length} pairs matched`;
                this.container.appendChild(statsBox);
            }

            updateStats() {
                const statsBox = document.getElementById(`match-stats-${this.container.id}`);
                if (statsBox) {
                    const accuracy = this.attempts > 0 ? Math.round((this.correctMatches / this.attempts) * 100) : 0;
                    statsBox.innerHTML = `<strong>Progress:</strong> ${this.matchedPairs} / ${this.itemKeys.length} pairs | <strong>Accuracy:</strong> ${accuracy}%`;
                }
            }

            selectItem(el) {
                if (el.classList.contains('matched')) return;
                this.container.querySelectorAll('.match-item[data-key]').forEach(item => {
                    if (item !== el) item.classList.remove('selected');
                });
                
                if (this.selectedItem === el) {
                    el.classList.remove('selected');
                    this.selectedItem = null;
                } else {
                    el.classList.add('selected');
                    this.selectedItem = el;
                }
                this.checkMatch();
            }

            selectDef(el) {
                if (el.classList.contains('matched')) return;
                this.container.querySelectorAll('.match-item[data-def]').forEach(item => {
                    if (item !== el) item.classList.remove('selected');
                });
                
                if (this.selectedDef === el) {
                    el.classList.remove('selected');
                    this.selectedDef = null;
                } else {
                    el.classList.add('selected');
                    this.selectedDef = el;
                }
                this.checkMatch();
            }

            checkMatch() {
                if (!this.selectedItem || !this.selectedDef) return;
                
                this.attempts++;
                const itemKey = this.selectedItem.dataset.key;
                const defKey = this.selectedDef.dataset.key;
                
                if (itemKey === defKey) {
                    this.correctMatches++;
                    this.setFeedback(`✅ Perfect match!`, 'success');
                    this.selectedItem.classList.add('matched');
                    this.selectedDef.classList.add('matched');
                    this.selectedItem.classList.remove('selected');
                    this.selectedDef.classList.remove('selected');
                    this.matchedPairs++;
                } else {
                    this.setFeedback(`❌ Not a match. Try again!`, 'error');
                    this.selectedItem.classList.remove('selected');
                    this.selectedDef.classList.remove('selected');
                }
                
                this.selectedItem = null;
                this.selectedDef = null;
                this.updateStats();
                
                if (this.matchedPairs === this.itemKeys.length) {
                    const accuracy = Math.round((this.correctMatches / this.attempts) * 100);
                    this.setFeedback(`🎉 All definitions matched! Final accuracy: ${accuracy}%`, 'success');
                    this.onSuccess();
                }
            }
        }
        
        // --- 4. Tool & Tip Logic ---

        function showTip() {
            const tipEl = document.getElementById('tip');
            const tipButton = document.getElementById('tip-button');
            tipEl.style.display = 'block';
            tipEl.innerHTML = `<div class="tip-box"><strong>💎 Wisdom for Cultivating Passion:</strong><br><br>Passion is not found, it is built. You build it with <strong>curiosity</strong> (asking questions), <strong>dedication</strong> (practicing), and <strong>resilience</strong> (learning from failure). If you want to find your passion, don't wait for a special feeling—start doing something you find interesting.</div>`;
            tipButton.disabled = true;
            tipButton.textContent = 'Wisdom Revealed ✓';
            tipEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        function initStudentTools() {
            // Notes (Suggestion #21)
            const notesEl = document.getElementById('student-notes');
            notesEl.value = localStorage.getItem('studentNotes') || '';
            notesEl.addEventListener('input', (e) => {
                localStorage.setItem('studentNotes', e.target.value);
            });

            // Timer (Suggestion #29)
            const timerEl = document.getElementById('lesson-timer');
            let totalSeconds = parseInt(localStorage.getItem('lessonTime') || 0);
            
            setInterval(() => {
                totalSeconds++;
                const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
                const seconds = (totalSeconds % 60).toString().padStart(2, '0');
                timerEl.textContent = `${minutes}:${seconds}`;
                localStorage.setItem('lessonTime', totalSeconds);
            }, 1000);
        }

        // --- 5. Teacher Controls (Suggestion #31-33) ---

        function initTeacherControls() {
            // Reset Progress
            document.getElementById('btn-reset-progress').addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all lesson progress? This cannot be undone.')) {
                    localStorage.removeItem('lessonProgress');
                    localStorage.removeItem('studentNotes');
                    localStorage.removeItem('lessonTime');
                    window.location.reload();
                }
            });

            // Export Data (Suggestion #32, #50)
            document.getElementById('btn-export-data').addEventListener('click', () => {
                const data = {
                    progress: JSON.parse(localStorage.getItem('lessonProgress') || '{}'),
                    notes: localStorage.getItem('studentNotes') || '',
                    timeSeconds: parseInt(localStorage.getItem('lessonTime') || 0)
                };
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                const dlElement = document.createElement('a');
                dlElement.setAttribute("href", dataStr);
                dlElement.setAttribute("download", "lesson_progress_export.json");
                dlElement.click();
            });
        }

        // --- 6. Theme Toggle (Suggestion #8) ---
        
        function initThemeToggle() {
            const toggleBtn = document.getElementById('theme-toggle-btn');
            const currentTheme = localStorage.getItem('theme');
            
            if (currentTheme === 'light') {
                document.body.classList.add('theme-light');
                toggleBtn.textContent = '☀️';
            }
            
            toggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('theme-light');
                let theme = 'dark';
                if (document.body.classList.contains('theme-light')) {
                    theme = 'light';
                    toggleBtn.textContent = '☀️';
                } else {
                    toggleBtn.textContent = '🌙';
                }
                localStorage.setItem('theme', theme);
            });
        }

        // --- Initialize Everything on DOM Load (Suggestion #43) ---
        document.addEventListener('DOMContentLoaded', () => {
            
            createVocabList();
            createGapFill();
            
            // --- Game 1 Setup (Flashcards) ---
            const flashcardWords = ['passion', 'drive', 'ambition', 'curiosity', 'commitment'];
            new FlashcardGame(
                'gameContainer1',
                flashcardWords,
                'game-feedback-1',
                () => {
                    const completeEl = document.getElementById('mission-complete-1');
                    completeEl.style.display = 'block';
                    completeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (!lessonProgress.game1) {
                        lessonProgress.game1 = true;
                        updateLessonProgress();
                    }
                }
            );
            
            // --- Game 2 Setup (Vocab Match) ---
            const matchVocab = {};
            ['motivation', 'dedication', 'perseverance', 'enthusiasm', 'resilience'].forEach(word => {
                matchVocab[word] = vocabData[word];
            });
            new DefinitionMatchGame(
                'gameContainer2',
                matchVocab,
                'game-feedback-2',
                () => {
                    const completeEl = document.getElementById('mission-complete-2');
                    completeEl.style.display = 'block';
                    completeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (!lessonProgress.game2) {
                        lessonProgress.game2 = true;
                        updateLessonProgress();
                    }
                }
            );

            // --- Game 3 Setup (Idiom Match) ---
            const idiomVocab = {};
            ['idiom_calling', 'idiom_heart', 'idiom_mile', 'idiom_oil', 'idiom_sweat'].forEach(key => {
                idiomVocab[key] = vocabData[key];
            });
            new DefinitionMatchGame(
                'gameContainer3',
                idiomVocab,
                'game-feedback-3',
                () => {
                    const completeEl = document.getElementById('mission-complete-3');
                    completeEl.style.display = 'block';
                    completeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (!lessonProgress.game3) {
                        lessonProgress.game3 = true;
                        updateLessonProgress();
                    }
                }
            );
            
            // Init Tools
            initStudentTools();
            initTeacherControls();
            initThemeToggle();

            // Load initial progress
            loadProgress();
        });
    </script>
</body>
</html>
