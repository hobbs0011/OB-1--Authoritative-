const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');

function minifyCss(input, output) {
  let css = fs.readFileSync(input, 'utf8');
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  css = css.replace(/\s+/g, ' ');
  css = css.replace(/\s*\{\s*/g, '{').replace(/\s*\}\s*/g, '}');
  css = css.replace(/\s*;\s*/g, ';').replace(/\s*:\s*/g, ':');
  css = css.replace(/\s*>\s*/g, '>').replace(/\s*\+\s*/g, '+').replace(/\s*~\s*/g, '~');
  css = css.replace(/\s*,\s*/g, ',').trim();
  fs.writeFileSync(output, css);
  console.log('Minified:', path.basename(input), '->', path.basename(output));
}

function minifyJs(input, output) {
  let js = fs.readFileSync(input, 'utf8');
  js = js.replace(/\/\/.*$/gm, '');
  js = js.replace(/\/\*[\s\S]*?\*\//g, '');
  js = js.replace(/\s+/g, ' ');
  js = js.replace(/\s*\{\s*/g, '{').replace(/\s*\}\s*/g, '}');
  js = js.replace(/\s*;\s*/g, ';').replace(/\s*:\s*/g, ':');
  js = js.replace(/\s*,\s*/g, ',').replace(/\s*\(\s*/g, '(').replace(/\s*\)\s*/g, ')');
  js = js.trim();
  fs.writeFileSync(output, js);
  console.log('Minified:', path.basename(input), '->', path.basename(output));
}

minifyCss(path.join(dir, 'style.css'), path.join(dir, 'style.min.css'));
minifyJs(path.join(dir, 'main.js'), path.join(dir, 'main.min.js'));
