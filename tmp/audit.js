const fs = require('fs');
const html = fs.readFileSync('WEBSITE/mailala/index.html', 'utf8');
const issues = [];

if (!html.includes('lang="en"')) issues.push('Missing lang');
if (!html.includes('charset')) issues.push('Missing charset');
if (!html.includes('viewport')) issues.push('Missing viewport');
if (!html.includes('theme-color')) issues.push('Missing theme-color');
if (!html.includes('canonical')) issues.push('Missing canonical');
if (!html.includes('og:title')) issues.push('Missing OG title');
if (!html.includes('twitter:card')) issues.push('Missing Twitter card');
if (!html.includes('application/ld+json')) issues.push('Missing JSON-LD');
if (!html.includes('skip-link')) issues.push('Missing skip link');
if (!html.includes('aria-label')) issues.push('Missing aria-label');

if (issues.length === 0) {
  console.log('All critical checks passed');
} else {
  console.log('Issues found:', issues.length);
  issues.forEach(i => console.log(' -', i));
}
