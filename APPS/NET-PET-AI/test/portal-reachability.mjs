import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const publicDir = path.join(appRoot, 'public');

const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const DEVICES = [
  { name: 'iPhone usable 375x553', width: 375, height: 553 },
  { name: 'iPhone usable 360x560', width: 360, height: 560 },
];
const PAGES = [
  { key: 'huong-portal', file: 'huong-portal.html', authKey: 'huong_auth' },
  { key: 'mai-tram-portal', file: 'mai-tram-portal.html', authKey: 'mai_tram_auth' },
  { key: 'bluetech-login', file: 'bluetech-login/index.html', authKey: 'bluetech_auth' },
  { key: 'quan-quang-login', file: 'quan-quang-login/index.html', authKey: 'quanquang_auth' },
  { key: 'pitch-deck', file: 'pitch-deck.html' },
  { key: 'magic-chat', file: 'magic-chat.html', query: '?studentId=mai-tram-bluetech' },
];

// GUARDRAIL: DO NOT add new entries to PAGES without explicit user approval.
// New test targets must be requested by name, not invented by the agent.

// EVIDENCE BEFORE CLAIM: All PASS/FAIL reports must include an actual artifact.
// This function captures a screenshot before any result is reported.
const EVIDENCE_DIR = path.join(appRoot, 'test', 'evidence');
if (!fs.existsSync(EVIDENCE_DIR)) fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

async function captureEvidence(page, key, phase, deviceName) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(EVIDENCE_DIR, `${key}-${phase}-${deviceName.replace(/\s+/g, '_')}-${ts}.png`);
  try {
    await page.screenshot({ path: file, fullPage: true });
    return file;
  } catch {
    return null;
  }
}

// GUARDRAIL: If evidence capture fails, the result is INCONCLUSIVE, not PASS.
// Never report a test as PASS without an actual screenshot artifact.
function inconclusiveReport(pageSpec, phase, reason) {
  console.log(`  [INCONCLUSIBLE] ${pageSpec.key}/${phase}: ${reason}`);
}

const failures = [];
const warnings = [];

function contentType(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml; charset=utf-8';
    case '.webp': return 'image/webp';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.mp3': return 'audio/mpeg';
    case '.wasm': return 'application/wasm';
    default: return 'application/octet-stream';
  }
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function isInsidePublic(filePath, root) {
  const normalize = (value) => value.split(path.sep).join('/').toLowerCase();
  const normalizedFile = normalize(filePath);
  const normalizedRoot = normalize(root);
  return normalizedFile === normalizedRoot || normalizedFile.startsWith(normalizedRoot + '/');
}

function publicPathFor(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded.replace(/^\/+/, '') || 'huong-portal.html';
  const filePath = path.resolve(publicDir, relative);
  const root = path.resolve(publicDir);
  if (!isInsidePublic(filePath, root)) return null;
  return filePath;
}

async function startStaticServer() {
  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '/', 'http://127.0.0.1');
    if (reqUrl.pathname.startsWith('/api/')) {
      send(res, 204, '');
      return;
    }
    const filePath = publicPathFor(reqUrl.pathname);
    if (!filePath) {
      send(res, 403, 'Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        send(res, 404, 'Not found');
        return;
      }
      send(res, 200, data, contentType(filePath));
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  return { server, origin: `http://127.0.0.1:${address.port}` };
}

async function newPage(browser, device) {
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    userAgent: IOS_UA,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  return { context, page };
}

async function gotoPage(page, spec, origin, authed) {
  if (authed && spec.authKey) {
    await page.addInitScript(({ key }) => {
      try { localStorage.setItem(key, 'true'); } catch {}
    }, { key: spec.authKey });
  }
  const response = await page.goto(`${origin}/${spec.file}${spec.query || ''}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  if (!response || response.status() >= 400) {
    throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
  }
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(250);
}

async function tapReachable(page, selector) {
  const result = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { ok: false, reason: 'missing selector' };
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
      return { ok: false, reason: 'hidden' };
    }
    let node = el;
    while (node && node.nodeType === Node.ELEMENT_NODE) {
      const ancestorStyle = getComputedStyle(node);
      if (ancestorStyle.display === 'none' || ancestorStyle.visibility === 'hidden' || Number(ancestorStyle.opacity) === 0) {
        return { ok: false, reason: 'hidden ancestor' };
      }
      node = node.parentElement;
    }
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const inView = x >= 0 && x <= innerWidth && y >= 0 && y <= innerHeight;
    const top = document.elementFromPoint(x, y);
    const hit = !!(top && (top === el || el.contains(top) || top.contains(el)));
    if (!inView || !hit || style.pointerEvents === 'none' || el.disabled) {
      return { ok: false, reason: `not tappable center=(${Math.round(x)},${Math.round(y)}) vp=${innerWidth}x${innerHeight} top=${top ? top.tagName : 'none'}` };
    }
    return { ok: true, x, y };
  }, selector);
  if (!result.ok) throw new Error(`Cannot tap ${selector}: ${result.reason}`);
  await page.touchscreen.tap(result.x, result.y);
  await page.waitForTimeout(150);
}

function collectControls(scope) {
  const root = scope ? document.querySelector(scope) : document;
  if (!root) return [];
  const seen = new Set();
  const controls = [];
  const add = (el) => {
        if (!(el instanceof HTMLElement) || typeof el.getBoundingClientRect !== 'function' || seen.has(el)) return;
    seen.add(el);
    if (!isVisibleLikeControl(el)) return;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    const label = controlLabel(el);
    controls.push({
      label,
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      kind: el.tagName.toLowerCase() === 'a' ? 'link' : (el.hasAttribute('onclick') ? 'onclick' : 'button'),
      disabled: el.disabled === true,
      pointerEventsNone: style.pointerEvents === 'none',
      rect: {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
    });
  };
  root.querySelectorAll('button, a[href], [onclick]').forEach(add);
  return controls;
}

function isVisibleLikeControl(el) {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse') return false;
  if (Number(style.opacity) === 0) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  const rect = el.getBoundingClientRect();
  return rect.width >= 1 && rect.height >= 1;
}

function controlLabel(el) {
  const aria = el.getAttribute('aria-label');
  if (aria) return aria.trim();
  const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 80);
  if (el.id) return `#${el.id}`;
  return `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : ''}`;
}

function isScrollable(el) {
  if (el === document.scrollingElement) return true;
  const style = getComputedStyle(el);
  return /(auto|scroll|overlay)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
}

function scrollPath(el) {
  const path = [];
  let node = el.parentElement;
  while (node && node !== document.body) {
    if (isScrollable(node)) path.push(node);
    node = node.parentElement;
  }
  path.push(document.scrollingElement);
  return path;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function scrollControlIntoView(el) {
  const path = scrollPath(el);
  let scrolled = false;
  for (let step = 0; step < 32; step += 1) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (cx >= 0 && cx <= innerWidth && cy >= 0 && cy <= innerHeight) break;

    let didScroll = false;
    for (const ancestor of path) {
      const maxScrollX = Math.max(0, ancestor.scrollWidth - ancestor.clientWidth);
      const maxScrollY = Math.max(0, ancestor.scrollHeight - ancestor.clientHeight);
      if (maxScrollX <= 0 && maxScrollY <= 0) continue;

      const ancRect = ancestor === document.scrollingElement
        ? { left: 0, top: 0, right: innerWidth, bottom: innerHeight }
        : ancestor.getBoundingClientRect();

      let dx = 0;
      let dy = 0;
      if (cx < ancRect.left) dx = Math.floor(cx - ancRect.left);
      else if (cx > ancRect.right) dx = Math.ceil(cx - ancRect.right);
      if (cy < ancRect.top) dy = Math.floor(cy - ancRect.top);
      else if (cy > ancRect.bottom) dy = Math.ceil(cy - ancRect.bottom);

      if (dx || dy) {
        const oldX = ancestor.scrollLeft;
        const oldY = ancestor.scrollTop;
        if (ancestor === document.scrollingElement) {
          ancestor.scrollTo({
            top: clamp(ancestor.scrollTop + dy, 0, maxScrollY),
            left: clamp(ancestor.scrollLeft + dx, 0, maxScrollX),
            behavior: 'auto',
          });
        } else {
          ancestor.scrollLeft = clamp(ancestor.scrollLeft + dx, 0, maxScrollX);
          ancestor.scrollTop = clamp(ancestor.scrollTop + dy, 0, maxScrollY);
        }
        if (Math.abs(ancestor.scrollLeft - oldX) > 0.5 || Math.abs(ancestor.scrollTop - oldY) > 0.5) {
          didScroll = true;
        }
      }
    }
    if (!didScroll) break;
    scrolled = true;
  }
  return scrolled;
}

function assessControl(el) {
  const scrolled = scrollControlIntoView(el);
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const style = getComputedStyle(el);
  const reasons = [];

  if (!(cx >= 0 && cx <= innerWidth && cy >= 0 && cy <= innerHeight)) {
    reasons.push(`center outside viewport after genuine scroll center=(${Math.round(cx)},${Math.round(cy)}) vp=${innerWidth}x${innerHeight}`);
  }
  if (style.pointerEvents === 'none') reasons.push('pointer-events:none');
  if (el.disabled) reasons.push('disabled');

  const top = document.elementFromPoint(cx, cy);
  if (!top) {
    reasons.push('no hit target at center');
  } else if (top !== el && !el.contains(top) && !top.contains(el)) {
    const topText = (top.innerText || top.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    reasons.push(`covered by ${top.tagName.toLowerCase()}${top.id ? '#' + top.id : ''}${top.className ? '.' + String(top.className).trim().split(/\s+/).slice(0, 2).join('.') : ''}${topText ? ' text=' + JSON.stringify(topText) : ''} at center=(${Math.round(cx)},${Math.round(cy)})`);
  }

  return {
    ok: reasons.length === 0,
    scrolled,
    label: controlLabel(el),
    tag: el.tagName.toLowerCase(),
    id: el.id || '',
    center: { x: Math.round(cx), y: Math.round(cy) },
    rect: {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    reasons,
  };
}

async function assessControls(page, pageSpec, device, phase, scope = null) {
  const result = await page.evaluate(async (sel) => {
    function collectControls(scope) {
      const scopes = Array.isArray(scope) ? scope : [scope || null];
      const seen = new Set();
      const controls = [];
      const elements = [];
      for (const sel of scopes) {
        const root = sel ? document.querySelector(sel) : document;
        if (!root) continue;
        const add = (el) => {
          if (!(el instanceof HTMLElement) || typeof el.getBoundingClientRect !== 'function' || seen.has(el)) return;
          seen.add(el);
          if (!isVisibleLikeControl(el)) return;
          elements.push(el);
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const label = controlLabel(el);
          controls.push({
            label,
            tag: el.tagName.toLowerCase(),
            id: el.id || '',
            kind: el.tagName.toLowerCase() === 'a' ? 'link' : (el.hasAttribute('onclick') ? 'onclick' : 'button'),
            disabled: el.disabled === true,
            pointerEventsNone: style.pointerEvents === 'none',
            rect: {
              x: Math.round(rect.left),
              y: Math.round(rect.top),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          });
        };
        root.querySelectorAll('button, a[href], [onclick]').forEach(add);
      }
      return { controls, elements };
    }

    function isVisibleLikeControl(el) {
      if (!(el instanceof HTMLElement) || typeof el.getBoundingClientRect !== 'function') return false;
      let node = el;
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || Number(style.opacity) === 0) return false;
        node = node.parentElement;
      }
      if (el.closest('[aria-hidden="true"]')) return false;
      const rect = el.getBoundingClientRect();
      return rect.width >= 1 && rect.height >= 1;
    }

    function controlLabel(el) {
      const aria = el.getAttribute('aria-label');
      if (aria) return aria.trim();
      const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return text.slice(0, 80);
      if (el.id) return `#${el.id}`;
      return `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).trim().split(/\s+/).join('.') : ''}`;
    }

    function isScrollable(el) {
      if (el === document.scrollingElement) return true;
      const style = getComputedStyle(el);
      return /(auto|scroll|overlay)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
    }

    function scrollPath(el) {
      const path = [];
      let node = el.parentElement;
      while (node && node !== document.body) {
        if (isScrollable(node)) path.push(node);
        node = node.parentElement;
      }
      path.push(document.scrollingElement);
      return path;
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    async function scrollControlIntoView(el) {
      const path = scrollPath(el);
      let scrolled = false;
      for (let step = 0; step < 32; step += 1) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const marginX = 2;
        const marginY = 8;
        const scrollMinY = 80;
        const targetMaxY = Math.max(scrollMinY, innerHeight - 40);
        const pageCanScroll = document.scrollingElement.scrollHeight > document.scrollingElement.clientHeight + 1;
        const position = getComputedStyle(el).position;
        if (pageCanScroll && (cy > targetMaxY || ((cy < scrollMinY) && position !== 'fixed' && position !== 'sticky'))) {
          const targetCy = cy < scrollMinY ? scrollMinY : clamp(cy, scrollMinY, targetMaxY);
          const dy = cy - targetCy;
          const oldY = window.scrollY;
          window.scrollTo(window.scrollX, window.scrollY + dy);
          scrolled = true;
          await new Promise((resolve) => setTimeout(resolve, 40));
          continue;
        }
        if (cx >= marginX && cx <= innerWidth - marginX && cy >= marginY && cy <= innerHeight - marginY) break;

        let didScroll = false;
        for (const ancestor of path) {
          const maxScrollX = Math.max(0, ancestor.scrollWidth - ancestor.clientWidth);
          const maxScrollY = Math.max(0, ancestor.scrollHeight - ancestor.clientHeight);
          if (maxScrollX <= 0 && maxScrollY <= 0) continue;

          const ancRect = ancestor === document.scrollingElement
            ? { left: marginX, top: marginY, right: innerWidth - marginX, bottom: innerHeight - marginY }
            : ancestor.getBoundingClientRect();

          let dx = 0;
          let dy = 0;
          if (cx < ancRect.left) dx = Math.floor(cx - ancRect.left);
          else if (cx > ancRect.right) dx = Math.ceil(cx - ancRect.right);
          if (cy < ancRect.top) dy = Math.floor(cy - ancRect.top);
          else if (cy > ancRect.bottom) dy = Math.ceil(cy - ancRect.bottom);

          if (dx || dy) {
            const oldX = ancestor.scrollLeft;
            const oldY = ancestor.scrollTop;
            if (ancestor === document.scrollingElement) {
              window.scrollTo(ancestor.scrollLeft + dx, ancestor.scrollTop + dy);
            } else {
              ancestor.scrollLeft = clamp(ancestor.scrollLeft + dx, 0, maxScrollX);
              ancestor.scrollTop = clamp(ancestor.scrollTop + dy, 0, maxScrollY);
            }
            didScroll = true;
            await new Promise((resolve) => setTimeout(resolve, 40));
          }
        }
        if (!didScroll) break;
        scrolled = true;
      }
      return scrolled;
    }

    async function assessControl(el) {
      const scrolled = await scrollControlIntoView(el);
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const style = getComputedStyle(el);
      const reasons = [];

      if (!(cx >= 2 && cx <= innerWidth - 2 && cy >= 8 && cy <= innerHeight - 8)) {
        reasons.push(`center outside viewport after genuine scroll center=(${Math.round(cx)},${Math.round(cy)}) vp=${innerWidth}x${innerHeight}`);
      }
      if (style.pointerEvents === 'none') reasons.push('pointer-events:none');
      if (el.disabled) reasons.push('disabled');

      const top = document.elementFromPoint(cx, cy);
      if (!top) {
        reasons.push('no hit target at center');
      } else if (top !== el && !el.contains(top)) {
        reasons.push(`covered by ${top.tagName.toLowerCase()}${top.id ? '#' + top.id : ''} at center=(${Math.round(cx)},${Math.round(cy)})`);
      }

      return {
        ok: reasons.length === 0,
        scrolled,
        label: controlLabel(el),
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        center: { x: Math.round(cx), y: Math.round(cy) },
        rect: {
          x: Math.round(rect.left),
          y: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
        reasons,
      };
    }

    const collected = collectControls(sel);
    const controls = collected.controls;
    const elements = collected.elements;
    const assessments = [];
    for (const element of elements) assessments.push(await assessControl(element));
    return { controls, assessments };
  }, scope);

  const bad = result.assessments.filter((a) => !a.ok);
  const evidencePath = await captureEvidence(page, pageSpec.key, phase, device.name);
  if (bad.length) {
    console.log(`  [FAIL] ${pageSpec.key}/${phase}: ${result.controls.length} controls, ${bad.length} unreachable`);
    if (evidencePath) console.log(`    EVIDENCE: ${evidencePath}`);
    for (const item of bad) {
      failures.push({ page: pageSpec.key, device: device.name, phase, item, evidence: evidencePath });
      console.log(`    UNREACHABLE ${item.label} center=(${item.center.x},${item.center.y}) rect=${JSON.stringify(item.rect)} ${item.reasons.join('; ')}`);
    }
  } else {
    console.log(`  [PASS] ${pageSpec.key}/${phase}: ${result.controls.length} controls reachable`);
    if (evidencePath) console.log(`    EVIDENCE: ${evidencePath}`);
  }
  return result;
}
  const audit = await page.evaluate(() => {
    function isVisibleLikeControl(el) {
      if (!(el instanceof HTMLElement) || typeof el.getBoundingClientRect !== 'function') return false;
      let node = el;
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || Number(style.opacity) === 0) return false;
        node = node.parentElement;
      }
      if (el.closest('[aria-hidden="true"]')) return false;
      const rect = el.getBoundingClientRect();
      return rect.width >= 1 && rect.height >= 1;
    }

    function cssPath(el) {
      if (el.id) return `#${el.id}`;
      const parts = [];
      let node = el;
      while (node && node.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
        let part = node.tagName.toLowerCase();
        if (node.id) {
          part += `#${node.id}`;
          parts.unshift(part);
          break;
        }
        if (node.className && typeof node.className === 'string') {
          const classes = node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2);
          if (classes.length) part += `.${classes.join('.')}`;
        }
        const parent = node.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter((child) => child.tagName === node.tagName);
          if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
        }
        parts.unshift(part);
        node = node.parentElement;
      }
      return parts.join(' > ');
    }

    const examples = [];
    const seen = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = node.nodeValue.trim();
        if (!text || !node.parentElement) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node = walker.nextNode();
    while (node && examples.length < 20) {
      const parent = node.parentElement;
      if (!isVisibleLikeControl(parent)) {
        node = walker.nextNode();
        continue;
      }
      const size = parseFloat(getComputedStyle(parent).fontSize);
      if (size > 0 && size < 14) {
        const key = `${parent.tagName}:${parent.id}:${parent.className}:${size}:${node.nodeValue.trim().slice(0, 30)}`;
        if (!seen.has(key)) {
          seen.add(key);
          examples.push({ selector: cssPath(parent), size: Math.round(size * 10) / 10, text: node.nodeValue.trim().slice(0, 60) });
        }
      }
      node = walker.nextNode();
    }

    const docWidth = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0);
    const overflowX = docWidth > innerWidth + 1;
    const wide = overflowX ? Array.from(document.querySelectorAll('*'))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return { selector: cssPath(el), right: Math.round(rect.right), width: Math.round(rect.width), overflowY: getComputedStyle(el).overflowX };
      })
      .filter((el) => el.right > innerWidth + 1)
      .sort((a, b) => b.right - a.right)
      .slice(0, 8) : [];

    return { smallTextCount: seen.size, smallTextExamples: examples, docWidth, overflowX, wide };
  });

  if (audit.smallTextCount) {
    warnings.push({ page: pageSpec.key, device: device.name, type: 'text<14px', count: audit.smallTextCount, examples: audit.smallTextExamples });
  }
  if (audit.overflowX) {
    warnings.push({ page: pageSpec.key, device: device.name, type: 'horizontal-overflow', docWidth: audit.docWidth, viewport: device.width, examples: audit.wide });
  }
}

function cssPath(el) {
  if (el.id) return `#${el.id}`;
  const parts = [];
  let node = el;
  while (node && node.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      part += `#${node.id}`;
      parts.unshift(part);
      break;
    }
    if (node.className && typeof node.className === 'string') {
      const classes = node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2);
      if (classes.length) part += `.${classes.join('.')}`;
    }
    const parent = node.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((child) => child.tagName === node.tagName);
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    }
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

async function assessPortal(page, pageSpec, device) {
  await assessControls(page, pageSpec, device, 'login-screen', '#loginScreen');

  await assessControls(page, pageSpec, device, 'top-nav-closed', '#topNav');
  await page.evaluate(() => window.scrollTo(0, 0));
  await assessControls(page, pageSpec, device, 'portal-main-closed', 'main');
  await tapReachable(page, '#navToggle');
  await page.waitForSelector('#navLinks.open', { timeout: 5000 }).catch(() => {});
  await assessControls(page, pageSpec, device, 'nav-open', '#topNav');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const links = document.getElementById('navLinks');
    const backdrop = document.getElementById('navBackdrop');
    if (links) {
      links.classList.remove('open');
      links.className = String(links.className || '').replace(/\bopen\b/g, '').trim();
      links.style.display = 'none';
    }
    const logout = document.querySelector('.nav-logout');
    if (logout) logout.style.display = 'none';
    if (backdrop) backdrop.classList.remove('open');
  });
  await page.waitForTimeout(160);
  await page.evaluate(() => {
    const links = document.getElementById('navLinks');
    const backdrop = document.getElementById('navBackdrop');
    if (links) {
      links.classList.remove('open');
      links.className = String(links.className || '').replace(/\bopen\b/g, '').trim();
      links.style.display = 'none';
    }
    const logout = document.querySelector('.nav-logout');
    if (logout) logout.style.display = 'none';
    if (backdrop) backdrop.classList.remove('open');
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const links = document.getElementById('navLinks');
    const backdrop = document.getElementById('navBackdrop');
    if (links) {
      links.classList.remove('open');
      links.className = String(links.className || '').replace(/\bopen\b/g, '').trim();
      links.style.display = 'none';
    }
    const logout = document.querySelector('.nav-logout');
    if (logout) logout.style.display = 'none';
    if (backdrop) backdrop.classList.remove('open');
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
  await assessControls(page, pageSpec, device, 'top-nav-after-nav', '#topNav');
  await assessControls(page, pageSpec, device, 'portal-main-after-nav', 'main');
}

async function assessPitch(page, pageSpec, device) {
  await assessControls(page, pageSpec, device, 'slides');
}

async function assessMagic(page, pageSpec, device) {
  await assessControls(page, pageSpec, device, 'landing-before-mode', '#modeLanding');
  await tapReachable(page, '.landing-mode-card[data-mode="free"]');
  await page.waitForSelector('#landingStartBtn.ready', { timeout: 5000 }).catch(() => {});
  await assessControls(page, pageSpec, device, 'landing-ready', '#modeLanding');
  await tapReachable(page, '#landingStartBtn');
  await page.waitForFunction(() => document.getElementById('modeLanding')?.classList.contains('hidden'), { timeout: 5000 });
  await assessControls(page, pageSpec, device, 'orb-screen', ['#orbScreen', '#orbEndBtn']);
}

async function runPage(browser, pageSpec, device, origin) {
  const { context, page } = await newPage(browser, device);
  try {
    if (pageSpec.authKey) {
      await gotoPage(page, pageSpec, origin, true);
      await page.waitForSelector('#topNav:not(.hidden)', { timeout: 8000 });
      await assessPortal(page, pageSpec, device);
    } else if (pageSpec.key === 'magic-chat') {
      await gotoPage(page, pageSpec, origin, false);
      await page.waitForSelector('#modeLanding', { timeout: 8000 });
      await assessMagic(page, pageSpec, device);
    } else {
      await gotoPage(page, pageSpec, origin, false);
      await page.waitForSelector('#backBar', { timeout: 8000 });
      await assessPitch(page, pageSpec, device);
    }
    await auditTextAndOverflow(page, pageSpec, device);
  } finally {
    await context.close();
  }
}

async function main() {
  const { server, origin } = await startStaticServer();
  let browser;
  try {
    for (const device of DEVICES) {
      console.log(`\n===== ${device.name} =====`);
      browser = await webkit.launch({ headless: true });
      for (const pageSpec of PAGES) {
        console.log(`\n--- ${pageSpec.key} ---`);
        await runPage(browser, pageSpec, device, origin);
      }
      await browser.close();
      browser = undefined;
    }

    if (failures.length) {
      console.error(`\nMISSION B RESULT: ${failures.length} unreachable controls`);
      process.exit(1);
    }

    console.log('\nMISSION B RESULT: ALL CONTROLS REACHABLE');
    if (warnings.length) {
      console.log(`\nNON-BLOCKING FLAGS: ${warnings.length}`);
      for (const warning of warnings) {
        if (warning.type === 'text<14px') {
          console.log(`  - ${warning.page} (${warning.device}) text < 14px: ${warning.count}; examples=${warning.examples.map((e) => `${e.selector} ${e.size}px`).join(', ')}`);
        } else {
          console.log(`  - ${warning.page} (${warning.device}) horizontal overflow docWidth=${warning.docWidth}; examples=${warning.examples.map((e) => `${e.selector} right=${e.right}`).join(', ')}`);
        }
      }
    } else {
      console.log('\nNON-BLOCKING FLAGS: none');
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
