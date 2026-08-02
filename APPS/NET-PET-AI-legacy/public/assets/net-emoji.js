// NET Brand Emoji Engine v1.0
// Usage: <ne-emoji code="tiger"> | .ne-tiger CSS class | NEEmoji.render('tiger','2em')
// Auto-replaces standard Unicode emoji in DOM text nodes with brand art.
(function () {
  // Local clean versions (text-removed, verified) served from /isolated/
  // CDN fallback for pieces not yet locally cleaned
  const CDN = 'https://net-art-arsenal.pages.dev/isolated/';
  const LOCAL = '/isolated/';
  const MAP = {
    // --- LOCALLY CLEANED (textless, verified) ---
    'tiger':         LOCAL + 'tiger-portrait-clean.png',
    'tiger-cub':     LOCAL + 'tiger-cub-clean.png',
    'tiger-roaring': LOCAL + 'tiger-roaring-clean.png',
    'tiger-portrait':LOCAL + 'tiger-portrait-clean.png',
    'tiger-child':   LOCAL + 'tiger-child-clean.png',
    'tiger-neon':    LOCAL + 'tiger-face-neon-clean.png',
    'phoenix':       LOCAL + 'phoenix-crest-clean.png',
    'phoenix-neon':  LOCAL + 'phoenix-neon-clean.png',
    'phoenix-dna':   LOCAL + 'phoenix-dna-fusion-clean.png',
    'mouse':         LOCAL + 'mouse-clean.png',
    // --- CDN (not yet locally processed) ---
    'tiger-eye':     CDN + 'tiger-eye-hd.png',
    'phoenix-lowpoly':CDN + 'phoenix-lowpoly-hd.png',
    'mouse-caged':   CDN + 'mouse-caged-hd.png',
    'elephant':      CDN + 'elephant-chain-hd.png',
    'dna':           CDN + 'dna-helix-hd.png',
    'shield':        CDN + 'data-shield-hd.png',
    'chain':         CDN + 'broken-chain-hd.png',
    'gear':          CDN + 'gear-chain-hd.png',
    'brain':         CDN + 'brain-circuit-hd.png',
    'wave':          CDN + 'audio-waveform-hd.png',
    'ring':          CDN + 'ring-45-15-hd.png',
    'lock':          CDN + 'merkle-lock-hd.png',
    'crest':         CDN + 'university-crest-hd.png',
    'wordmark':      CDN + 'net-wordmark-hd.png',
    'tesseract':     CDN + 'tesseract-core-hd.png',
    'sigma':         CDN + 'sigma-walker-hd.png',
    'train':         CDN + 'train-engine-hd.png',
    'sniper':        CDN + 'class-sniper-hd.png',
    'medic':         CDN + 'class-medic-hd.png',
    'thief':         CDN + 'class-thief-hd.png',
    'railrunner':    CDN + 'class-railrunner-hd.png',
    'shambler':      CDN + 'shambler-enemy-hd.png',
    'baron':         CDN + 'baron-skibidi-hd.png',
  };

  const UNICODE = {
    '\u{1F42D}': 'mouse',
    '\u{1F42F}': 'tiger-cub',
    '\u{1F525}': 'phoenix-neon',
    '\u{1F985}': 'phoenix',
    '\u{1F981}': 'tiger-roaring',
    '\u{1F9E0}': 'brain',
    '\u{1F393}': 'phoenix',
    '\u{1F480}': 'baron',
    '\u{1F512}': 'lock',
    '\u{1F6E1}️': 'shield',
    '\u{1F517}': 'chain',
    '⚙️': 'gear',
    '\u{1F9EC}': 'dna',
    '\u{1F3B5}': 'wave',
  };

  const SKIP = new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA','INPUT','SVG']);

  function src(code) { const v = MAP[code]; return v || (CDN + code + '-hd.png'); }

  function imgTag(code, size) {
    size = size || '1em';
    return '<img src="' + src(code) + '" alt="' + code + '" class="ne-img" style="width:' + size + ';height:' + size + ';object-fit:contain;vertical-align:middle;display:inline-block;border-radius:2px" loading="lazy">';
  }

  const uKeys = Object.keys(UNICODE);
  let uRegex = null;
  if (uKeys.length) {
    const escaped = uKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    uRegex = new RegExp(escaped.join('|'), 'gu');
  }

  function patchText(text) {
    if (!uRegex || !text) return null;
    uRegex.lastIndex = 0;
    if (!uRegex.test(text)) return null;
    uRegex.lastIndex = 0;
    return text.replace(uRegex, m => {
      const code = UNICODE[m];
      return code ? imgTag(code, '1.1em') : m;
    });
  }

  function patch(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let p = node.parentElement;
        while (p) {
          if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT;
          p = p.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const replaced = patchText(node.nodeValue);
      if (replaced !== null) {
        const span = document.createElement('span');
        span.innerHTML = replaced;
        node.parentNode.replaceChild(span, node);
      }
    }
  }

  // <ne-emoji code="tiger" size="2em">
  if (typeof customElements !== 'undefined') {
    class NEEmoji extends HTMLElement {
      connectedCallback() { this._render(); }
      attributeChangedCallback() { this._render(); }
      static get observedAttributes() { return ['code','name','size']; }
      _render() {
        const code = this.getAttribute('code') || this.getAttribute('name') || 'phoenix';
        const size = this.getAttribute('size') || '1em';
        this.innerHTML = imgTag(code, size);
        this.style.cssText = 'display:inline-block;line-height:1;vertical-align:middle';
      }
    }
    customElements.define('ne-emoji', NEEmoji);
  }

  // CSS utility classes
  const css = Object.entries(MAP).map(([k, v]) =>
    `.ne-${k}{display:inline-block;width:1em;height:1em;background:url(${CDN}${v})center/contain no-repeat;vertical-align:middle}`
  ).join('') +
  '.ne-sm{font-size:.75em}.ne-lg{font-size:1.5em}.ne-xl{font-size:2em}.ne-2xl{font-size:3em}.ne-hero{font-size:6em}' +
  '.ne-img{border-radius:2px}';

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  (document.head || document.documentElement).appendChild(styleEl);

  window.NEEmoji = { MAP, render: imgTag, patch, src };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => patch(document.body));
  } else {
    patch(document.body);
  }
})();
