# RAW VERBATIM — BADSTUDENTSELECTOR.txt
## Corpus Metadata
- chunk_seq   : 0227
- chunk_id    : 0227-RAW-BADSTUDENTSELECTOR_txt
- source_file : C:\Users\mrmic\OneDrive\Documents\GitHub\phoenix-chat-logs\CHAT-LOGS-ONLY\BADSTUDENTSELECTOR.txt
- sha256      : E146DFC2B689746EBB89BFC8120447AF7BCC9EA0169AB46C822460C5ABDB8D25
- size_bytes  : 13789
- lines       : 387
- ingested    : 2026-04-05
- phase       : Phase 2 — Raw Chat Log Ingest
- policy      : VERBATIM — No edits, no summaries, no AI overlays
- keywords    : MR_HOBBS

---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bad Boy / Bad Girl Selector</title>
    <!-- Tailwind CSS for fast layout and styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Font for the "Bad" theme -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">

    <style>
        /* Define the neon colors and fonts */
        :root {
            --color-bg: #0a0a0f;
            --color-pink: #f0f;
            --color-blue: #0ff;
            --font-title: 'Bangers', cursive;
            --font-body: 'Inter', sans-serif;
        }

        body {
            background-color: var(--color-bg);
            font-family: var(--font-body);
            color: white;
            /* Center everything */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
            padding: 1rem;
        }

        /* Main title styling */
        .title {
            font-family: var(--font-title);
            font-size: 4rem; /* 64px */
            color: var(--color-pink);
            letter-spacing: 0.05em;
            /* Neon glow effect */
            text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px var(--color-pink), 0 0 30px var(--color-pink), 0 0 40px var(--color-pink);
            animation: flicker 3s infinite alternate;
        }

        /* Subtitle for Mr. Hobbs */
        .subtitle {
            font-family: var(--font-body);
            font-size: 1.25rem; /* 20px */
            font-weight: 700;
            color: var(--color-blue);
            text-shadow: 0 0 10px var(--color-blue);
            margin-bottom: 2rem; /* 32px */
            text-align: center;
        }
        
        /* Container for the wheel and pointer */
        #wheel-container {
            position: relative;
            width: 350px;
            height: 350px;
            margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
            #wheel-container {
                width: 450px;
                height: 450px;
            }
        }
        
        /* The static pointer that shows the winner */
        #selector-pointer {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            /* A downward-pointing triangle */
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            border-top: 30px solid var(--color-blue);
            z-index: 10;
            /* Neon glow for the pointer */
            filter: drop-shadow(0 -5px 10px var(--color-blue));
            transition: transform 0.3s ease;
        }
        
        /* The wheel itself */
        #wheel {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 5px solid var(--color-pink);
            /* Inset and outset glow for a cool neon hoop effect */
            box-shadow: 0 0 20px var(--color-pink), inset 0 0 20px var(--color-pink);
            background-color: #111;
            overflow: hidden;
            /* This is the magic: a 5-second spin with a slow-down effect */
            transition: transform 5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        /* Each segment of the wheel */
        .segment {
            position: absolute;
            width: 50%;
            height: 50%;
            top: 0;
            left: 50%;
            /* Origin at the center of the wheel */
            transform-origin: 0% 100%;
        }

        /* The text (number) inside each segment */
        .number {
            position: absolute;
            /* Position the number inside the segment */
            transform: skewY(54deg) rotate(18deg) translate(90px) rotate(-90deg);
            @media (min-width: 768px) {
                transform: skewY(54deg) rotate(18deg) translate(120px) rotate(-90deg);
            }
            font-size: 1.5rem; /* 24px */
            font-weight: 900;
            color: white;
            text-shadow: 0 0 5px #fff;
        }

        /* The spin button */
        #spin-btn {
            font-family: var(--font-title);
            font-size: 2.5rem; /* 40px */
            background-color: var(--color-pink);
            color: var(--color-bg);
            padding: 0.5rem 3rem;
            border-radius: 0.375rem; /* 6px */
            box-shadow: 0 0 20px var(--color-pink);
            transition: all 0.2s ease;
            cursor: pointer;
        }

        #spin-btn:hover {
            background-color: var(--color-blue);
            color: var(--color-bg);
            box-shadow: 0 0 30px var(--color-blue);
            transform: scale(1.05);
        }

        #spin-btn:active {
            transform: scale(0.95);
        }

        #spin-btn:disabled {
            background-color: #444;
            color: #888;
            box-shadow: none;
            cursor: not-allowed;
        }

        /* The modal that appears with the result */
        #result-display {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        #result-display.show {
            opacity: 1;
            pointer-events: auto;
        }

        #result-card {
            background-color: #111;
            border: 4px solid var(--color-pink);
            border-radius: 0.5rem; /* 8px */
            padding: 3rem;
            box-shadow: 0 0 40px var(--color-pink);
            text-align: center;
            animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        #result-title {
            font-family: var(--font-title);
            font-size: 3rem; /* 48px */
            color: var(--color-pink);
            text-shadow: 0 0 20px var(--color-pink);
            margin-bottom: 1rem;
        }

        #result-number {
            font-size: 8rem; /* 128px */
            font-weight: 900;
            color: white;
            text-shadow: 0 0 20px #fff;
            margin-bottom: 2rem;
        }

        #result-close {
            background-color: #333;
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 700;
            transition: background-color 0.2s;
        }

        #result-close:hover {
            background-color: #555;
        }
        
        /* Animations */
        @keyframes flicker {
            0%, 100% {
                opacity: 1;
                text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px var(--color-pink), 0 0 30px var(--color-pink);
            }
            50% {
                opacity: 0.8;
                text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px var(--color-pink);
            }
        }
        
        @keyframes pop-in {
            from {
                opacity: 0;
                transform: scale(0.5);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    </style>
</head>
<body class="bg-[#0a0a0f] text-white min-h-screen flex flex-col items-center justify-center p-4 font-['Inter']">

    <h1 class="title">BAD BOY / BAD GIRL SELECTOR</h1>
    <h2 class="subtitle">WHO'S IN TROUBLE NOW, MR. HOBBS?</h2>

    <div id="wheel-container">
        <!-- This pointer stays still -->
        <div id="selector-pointer"></div>
        <!-- This wheel spins -->
        <div id="wheel">
            <!-- Segments will be added here by JavaScript -->
        </div>
    </div>

    <button id="spin-btn">SPIN THE WHEEL</button>

    <!-- Result Modal (Hidden by default) -->
    <div id="result-display" class="hidden">
        <div id="result-card">
            <h3 id="result-title">The Chosen One Is...</h3>
            <div id="result-number">??</div>
            <button id="result-close">Try Again...</button>
        </div>
    </div>

    <script>
        // --- 1. CONFIGURATION ---
        const students = [42, 48, 25, 12, 6, 26, 40, 9, 13, 20];
        const numStudents = students.length;
        const anglePerSegment = 360 / numStudents; // 36 degrees
        const skewAngle = 90 - anglePerSegment;   // 54 degrees

        // --- 2. GET ELEMENTS ---
        const wheel = document.getElementById('wheel');
        const spinBtn = document.getElementById('spin-btn');
        const resultDisplay = document.getElementById('result-display');
        const resultNumber = document.getElementById('result-number');
        const resultClose = document.getElementById('result-close');

        // --- 3. STATE ---
        let isSpinning = false;
        let currentRotation = 0;

        // --- 4. FUNCTIONS ---

        /**
         * Creates the wheel segments and numbers
         */
        function createWheel() {
            students.forEach((student, i) => {
                const segment = document.createElement('div');
                segment.className = 'segment';
                // Rotate and skew each segment to form a perfect circle
                segment.style.transform = `rotate(${anglePerSegment * i}deg) skewY(-${skewAngle}deg)`;
                // Alternate background colors for contrast
                segment.style.background = i % 2 === 0 ? 'rgba(255,0,255,0.2)' : 'rgba(0,255,255,0.2)';

                const number = document.createElement('span');
                number.className = 'number';
                number.textContent = student;
                // Counter-skew and rotate the number to make it stand upright
                // 18deg = half of a segment (36/2)
                // 90px/120px = distance from center (radius)
                // -90deg = makes the number horizontal
                number.style.transform = `skewY(${skewAngle}deg) rotate(${anglePerSegment / 2}deg) translate(90px) rotate(-90deg)`;
                
                // Adjust for larger screens
                if (window.innerWidth >= 768) {
                    number.style.transform = `skewY(${skewAngle}deg) rotate(${anglePerSegment / 2}deg) translate(120px) rotate(-90deg)`;
                }

                segment.appendChild(number);
                wheel.appendChild(segment);
            });
        }

        /**
         * Spins the wheel to a new random position
         */
        function spinWheel() {
            if (isSpinning) return;
            isSpinning = true;
            spinBtn.disabled = true;
            spinBtn.textContent = 'SPINNING...';

            // Calculate a new random rotation
            // 8-11 full spins + a random final angle
            const randomSpins = (Math.floor(Math.random() * 4) + 8) * 360; 
            const randomAdditionalAngle = Math.random() * 360;
            
            // Add to the current rotation to make it spin from its last position
            currentRotation += randomSpins + randomAdditionalAngle;

            // Apply the new rotation to the wheel
            wheel.style.transform = `rotate(${currentRotation}deg)`;

            // --- Calculate the winner ---
            // Get the final angle (0-359)
            const finalAngle = currentRotation % 360;
            // The pointer is at 0 (top). The wheel spins clockwise.
            // We need to find which segment is at the top.
            // We must *invert* the index logic because the wheel spins clockwise
            // and the 0-degree mark is the *start* of the first segment.
            const winningIndex = numStudents - 1 - Math.floor(finalAngle / anglePerSegment);
            const selectedStudent = students[winningIndex];

            // Wait for the 5-second spin animation to end
            setTimeout(() => {
                isSpinning = false;
                spinBtn.disabled = false;
                spinBtn.textContent = 'SPIN AGAIN';
                showResult(selectedStudent);
            }, 5000); // This MUST match the CSS transition-duration
        }

        /**
         * Shows the result modal
         */
        function showResult(student) {
            resultNumber.textContent = student;
            resultDisplay.classList.remove('hidden');
            resultDisplay.classList.add('show');
        }

        // --- 5. EVENT LISTENERS ---
        spinBtn.addEventListener('click', spinWheel);
        resultClose.addEventListener('click', () => {
            resultDisplay.classList.remove('show');
            // Add a small delay to let the fade-out animation finish
            setTimeout(() => {
                resultDisplay.classList.add('hidden');
            }, 300);
        });

        // Build the wheel as soon as the page loads
        document.addEventListener('DOMContentLoaded', createWheel);
    </script>
</body>
</html>

