import fs from 'fs';
import path from 'path';

const files = [
  'APPS/NET-PET-AI-legacy/public/bluetech-cinematic/index.html',
  'APPS/NET-PET-AI-legacy/public/bluetech-login/index.html',
  'APPS/NET-PET-AI-legacy/public/bluetech-employer/index.html',
  'APPS/NET-PET-AI-legacy/public/bluetech-employee/index.html'
];

const checks = {
  'Google Fonts loaded': (c) => c.includes('fonts.googleapis.com'),
  'viewport meta': (c) => c.includes('viewport'),
  'theme-color meta': (c) => c.includes('theme-color'),
  'preconnect hints': (c) => c.includes('preconnect'),
  'CSS in style tag': (c) => c.includes('<style>'),
  'JS in script tag': (c) => c.includes('<script>'),
  'has nav element': (c) => c.includes('<nav'),
  'has footer/credits': (c) => c.includes('powered by NET'),
  'has CTA button': (c) => c.includes('cta-btn'),
  'uses CSS variables': (c) => c.includes('var(--'),
  'has hover states': (c) => c.includes(':hover'),
  'has transitions': (c) => c.includes('transition:'),
  'has animations': (c) => c.includes('@keyframes') || c.includes('animation:'),
  'has responsive media query': (c) => c.includes('@media'),
  'has focus styles': (c) => c.includes(':focus'),
  'has alt text for images': (c) => c.includes('alt="'),
  'has semantic headings': (c) => c.includes('<h1') && c.includes('<h2'),
  'has keyboard handler': (c) => c.includes('keydown') || c.includes('Enter'),
  'uses system fonts': (c) => c.includes("'Inter'"),
  'has brand logo': (c) => c.includes('bluetech-logo') || c.includes('bluetech-icon'),
  'has NET branding': (c) => c.includes('powered by NET'),
  'no hardcoded secrets': (c) => !/AIza|sk-[a-zA-Z0-9]{20,}/.test(c),
  'no alert/prompt/confirm': (c) => !c.includes('alert(') && !c.includes('prompt(') && !c.includes('confirm('),
  'has CORS/fetch handling': (c) => c.includes('fetch(') || c.includes('cors'),
  'has error UI': (c) => c.includes('error') || c.includes('Error'),
  'uses HTTPS or relative URLs': (c) => !c.includes('http://') || c.includes('https://'),
  'has loading state': (c) => c.includes('curtain') || c.includes('loading') || c.includes('fade'),
  'has glass/blur effect': (c) => c.includes('backdrop-filter') || c.includes('blur('),
  'has NET attribution': (c) => c.includes('powered by NET'),
  'has 2-year narrative': (c) => c.includes('2024') || c.includes('Since 2024') || c.includes('Year Three'),
  'has accountability banner': (c) => c.includes('accountability') || c.includes('Investment protection'),
  'has placeholder metrics': (c) => c.includes('87%') || c.includes('placeholder') || c.includes('—'),
  'has Obi chat embed': (c) => c.includes('magic-chat.html') || c.includes('Obi'),
  'has badges/gamification': (c) => c.includes('badge') || c.includes('Badge'),
  'has lessons/cards': (c) => c.includes('lesson-card') || c.includes('Lesson'),
};

const maxScore = Object.keys(checks).length;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`\n${file}: MISSING`);
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  let score = 0;
  const results = [];

  for (const [name, check] of Object.entries(checks)) {
    const pass = check(content, file);
    results.push(pass ? '✅' : '❌');
    if (pass) score++;
  }

  const pct = Math.round((score / maxScore) * 100);
  console.log(`\n${file}: ${score}/${maxScore} (${pct}%)`);
  console.log(results.join(' '));
}

console.log('\n');
