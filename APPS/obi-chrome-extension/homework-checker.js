/**
 * OBI Chrome Extension — Homework Photo Checker
 * Captures a homework photo and sends it to Gemini 2.0 Flash for AI analysis.
 * Gospel 444 UI palette: void black #0f0f1a | soul purple #a855f7 | imperial gold #f59e0b
 */

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT =
  "You are OBI, a friendly English teacher's assistant for Vietnamese high school students. " +
  'Analyze this student\'s homework photo. Check for: ' +
  '1) Completeness - did they answer all questions? ' +
  '2) Accuracy - are the answers correct? ' +
  '3) English grammar and spelling errors. ' +
  'Provide feedback in a kind, encouraging tone. Use simple English. ' +
  "If you see Vietnamese text mixed in, that's okay - focus on the English portions. " +
  "Never say 'wrong' - say 'let\u2019s adjust this' or 'try this instead'. " +
  'Give a score out of 10.';

export function initHomeworkChecker() {
  const fileInput = document.getElementById('hw-file-input');
  const cameraBtn = document.getElementById('hw-camera-btn');
  const preview = document.getElementById('hw-preview');
  const analyzeBtn = document.getElementById('hw-analyze-btn');
  const spinner = document.getElementById('hw-spinner');
  const resultEl = document.getElementById('hw-result');

  let currentImageBase64 = null;
  let currentMimeType = 'image/jpeg';

  // Open the file/camera picker when the camera button is clicked
  cameraBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  // Handle selected file
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    currentMimeType = file.type || 'image/jpeg';

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      currentImageBase64 = dataUrl.split(',')[1];

      preview.src = dataUrl;
      preview.classList.remove('hidden');
      analyzeBtn.disabled = false;
      resultEl.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });

  // Analyze button
  analyzeBtn.addEventListener('click', async () => {
    if (!currentImageBase64) return;

    const { geminiKey } = await chrome.storage.local.get('geminiKey');
    if (!geminiKey) {
      showResult(
        '⚙️ No API key found. Please go to the Settings tab and enter your Gemini API key.',
        'error'
      );
      return;
    }

    spinner.classList.remove('hidden');
    analyzeBtn.disabled = true;
    resultEl.classList.add('hidden');

    try {
      const response = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                {
                  inlineData: {
                    mimeType: currentMimeType,
                    data: currentImageBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        'OBI could not read this image. Please try a clearer photo.';
      showResult(text, 'success');
    } catch (err) {
      showResult(`❌ ${err.message}`, 'error');
    } finally {
      spinner.classList.add('hidden');
      analyzeBtn.disabled = false;
    }
  });

  function showResult(text, type) {
    resultEl.textContent = text;
    resultEl.className = `hw-result ${type}`;
  }
}
