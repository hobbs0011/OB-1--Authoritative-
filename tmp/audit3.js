const fs = require('fs');
const html = fs.readFileSync('WEBSITE/mailala/index.html', 'utf8');
const links = html.match(/href="[^"]+"/g) || [];
const external = links.filter(l => l.includes('http'));
const internal = links.filter(l => !l.includes('http'));

console.log('Total links:', links.length);
console.log('External links:', external.length);
console.log('Internal links:', internal.length);
external.forEach(l => console.log(' -', l));
