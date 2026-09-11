// Schrift-Rendering-Diagnose. Aufruf: node font-check.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const PAGES = ['/', '/presse'];
const OUT = 'audit-mobile';
fs.mkdirSync(OUT, { recursive: true });

// Projekt-Selektoren; Aufgabe nennt .aw-btn/.pc-title/.hero-text p, im Code heissen sie anders
const SELECTORS = {
  body: 'body', p: 'main p, .aw-section p', h1: 'h1', h2: 'h2', h3: 'h3', li: 'main li, .aw-section li',
  'nav a (=.hd-nav-list a)': '.hd-nav-list a', '.aw-btn (=.btn-primary)': '.btn-primary', '.pc-title (=.pc-titel)': '.pc-titel',
  '.pc-teaser': '.pc-teaser', '.hero-text p (=.hero-subline)': '.hero-subline',
};
const STYLE_PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'textShadow', 'webkitFontSmoothing', 'textRendering', 'transform', 'opacity', 'filter'];
const ANCESTOR_PROPS = {
  transform: 'none', opacity: '1', filter: 'none', willChange: 'auto', backfaceVisibility: 'visible',
  perspective: 'none', zoom: '1', contain: 'none', isolation: 'auto', mixBlendMode: 'normal',
};
const EXPECTED_FACES = [
  ['Caladea', '400', 'normal'], ['Caladea', '700', 'normal'], ['Caladea', '400', 'italic'],
  ['Arimo', '400', 'normal'], ['Arimo', '700', 'normal'], ['Arimo', '400', 'italic'],
];

const findings = [];
const note = (s) => findings.push(s);
const pad = (s, n) => String(s ?? '').padEnd(n).slice(0, n);

const b = await chromium.launch();
for (const path of PAGES) {
  const name = path === '/' ? 'home' : path.replace(/\//g, '') || 'home';
  console.log(`\n${'#'.repeat(78)}\n# ${path}\n${'#'.repeat(78)}`);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem('aw_consent', JSON.stringify({ v: 1, necessary: true })));

  // e) Netzwerk
  const fontReqs = [];
  p.on('response', async (r) => {
    const u = r.url();
    if (/\/fonts\/|fonts\.googleapis|fonts\.gstatic/.test(u)) {
      const h = r.headers();
      fontReqs.push({ url: u.replace(BASE, ''), status: r.status(), type: h['content-type'], size: h['content-length'] ?? (await r.body().catch(() => Buffer.alloc(0))).length });
    }
  });

  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });

  // a) + b) + g)
  const res = await p.evaluate(({ SELECTORS, STYLE_PROPS, ANCESTOR_PROPS }) => {
    const out = {};
    for (const [label, sel] of Object.entries(SELECTORS)) {
      const el = document.querySelector(sel);
      if (!el) { out[label] = null; continue; }
      const cs = getComputedStyle(el);
      const styles = Object.fromEntries(STYLE_PROPS.map((k) => [k, cs[k]]));
      const ancestors = [];
      let a = el;
      while (a && a !== document.documentElement.parentNode) {
        const acs = getComputedStyle(a);
        for (const [prop, def] of Object.entries(ANCESTOR_PROPS)) {
          if (acs[prop] !== def && acs[prop] !== '') ancestors.push({ tag: a.tagName.toLowerCase(), cls: a.className?.toString().slice(0, 60), prop, val: acs[prop] });
        }
        a = a.parentElement;
      }
      const r = el.getBoundingClientRect();
      const rect = { top: r.top, left: r.left, w: r.width, h: r.height };
      const layoutAncestors = [];
      a = el.parentElement;
      while (a) {
        const d = getComputedStyle(a).display;
        if (/grid|flex/.test(d)) {
          const ar = a.getBoundingClientRect();
          layoutAncestors.push({ tag: a.tagName.toLowerCase(), cls: a.className?.toString().slice(0, 50), display: d, top: ar.top, left: ar.left, w: ar.width });
        }
        a = a.parentElement;
      }
      out[label] = { sel, styles, ancestors, rect, layoutAncestors, text: el.textContent.trim().slice(0, 40) };
    }
    return out;
  }, { SELECTORS, STYLE_PROPS, ANCESTOR_PROPS });

  console.log('\n## a) Computed Styles');
  console.log(pad('Element', 28) + STYLE_PROPS.map((k) => pad(k, 18)).join(''));
  for (const [label, r] of Object.entries(res)) {
    if (!r) { console.log(pad(label, 28) + '— nicht gefunden'); continue; }
    console.log(pad(label, 28) + STYLE_PROPS.map((k) => pad(r.styles[k].replace(/rgb\((\d+), (\d+), (\d+)\)/, 'rgb($1,$2,$3)'), 18)).join(''));
  }

  console.log('\n## b) Vorfahren mit Compositing-relevanten Abweichungen');
  const seenAnc = new Set();
  for (const [label, r] of Object.entries(res)) {
    if (!r) continue;
    for (const a of r.ancestors) {
      const key = `${a.tag}.${a.cls}|${a.prop}`;
      console.log(`  ${pad(label, 28)} <${a.tag} class="${a.cls}"> ${a.prop}: ${a.val}`);
      if (!seenAnc.has(key)) { seenAnc.add(key); note(`[b ${path}] <${a.tag} class="${a.cls}"> ${a.prop}: ${a.val} (Vorfahr von ${label})`); }
    }
  }
  if (!seenAnc.size) console.log('  keine');

  // c) document.fonts
  const fonts = await p.evaluate(() => ({
    faces: [...document.fonts].map((f) => ({ family: f.family.replace(/"/g, ''), weight: f.weight, style: f.style, status: f.status })),
    checks: Object.fromEntries(['17px Arimo', '700 17px Arimo', '22px Caladea', '700 22px Caladea', 'italic 17px Arimo', 'italic 22px Caladea'].map((s) => [s, document.fonts.check(s)])),
  }));
  console.log('\n## c) document.fonts');
  for (const f of fonts.faces) console.log(`  ${pad(f.family, 14)} ${pad(f.weight, 5)} ${pad(f.style, 8)} ${f.status}`);
  for (const [k, v] of Object.entries(fonts.checks)) console.log(`  check("${k}") → ${v}`);
  for (const [fam, w, st] of EXPECTED_FACES) {
    const f = fonts.faces.find((x) => x.family === fam && x.weight === w && x.style === st);
    if (!f) note(`[c ${path}] FontFace ${fam} ${w} ${st} fehlt in document.fonts`);
    else if (f.status !== 'loaded') note(`[c ${path}] FontFace ${fam} ${w} ${st} status=${f.status} (nicht loaded; bei "unloaded" = Schnitt auf der Seite nicht genutzt)`);
  }
  for (const [k, v] of Object.entries(fonts.checks)) if (!v) note(`[c ${path}] document.fonts.check("${k}") false`);

  // d) @font-face-Regeln
  const faces = await p.evaluate(() => {
    const out = [];
    for (const ss of document.styleSheets) {
      let rules; try { rules = ss.cssRules; } catch { continue; }
      for (const r of rules) if (r instanceof CSSFontFaceRule) out.push({ css: r.cssText, family: r.style.getPropertyValue('font-family').replace(/["']/g, ''), weight: r.style.getPropertyValue('font-weight') || '400', style: r.style.getPropertyValue('font-style') || 'normal', src: r.style.getPropertyValue('src'), display: r.style.getPropertyValue('font-display'), range: r.style.getPropertyValue('unicode-range') });
    }
    return out;
  });
  console.log('\n## d) @font-face-Regeln');
  const comboSeen = new Map();
  for (const f of faces) {
    console.log('  ' + f.css.replace(/\s+/g, ' ').slice(0, 200));
    if (f.family === 'FontAwesome') continue;
    const key = `${f.family}|${f.weight}|${f.style}`;
    comboSeen.set(key, (comboSeen.get(key) ?? 0) + 1);
    const srcCount = (f.src.match(/url\(/g) ?? []).length;
    if (srcCount !== 1) note(`[d ${path}] ${key}: ${srcCount} src-Einträge statt 1`);
    if (!/format\(["']?woff2["']?\)/.test(f.src)) note(`[d ${path}] ${key}: src ohne format("woff2"): ${f.src}`);
    if (f.display !== 'swap') note(`[d ${path}] ${key}: font-display="${f.display}" statt swap`);
    if (f.range) note(`[d ${path}] ${key}: unicode-range gesetzt: ${f.range}`);
  }
  for (const [k, n] of comboSeen) if (n > 1) note(`[d ${path}] ${k}: ${n}× deklariert`);

  // e) Netzwerk auswerten
  console.log('\n## e) Font-Requests');
  for (const r of fontReqs) console.log(`  ${r.status} ${pad(r.type, 22)} ${pad(r.size, 7)} ${r.url}`);
  const local = fontReqs.filter((r) => r.url.startsWith('/fonts/'));
  if (local.length !== 6) note(`[e ${path}] ${local.length} /fonts/-Requests statt 6 (nicht genutzte Schnitte werden vom Browser nicht angefordert)`);
  for (const r of fontReqs) {
    if (/googleapis|gstatic/.test(r.url)) note(`[e ${path}] externer Font-Request: ${r.url}`);
    if (r.status !== 200) note(`[e ${path}] ${r.url} → HTTP ${r.status}`);
    if (r.url.startsWith('/fonts/') && r.type !== 'font/woff2') note(`[e ${path}] ${r.url} Content-Type "${r.type}" statt font/woff2`);
  }
  // Doppel-Download-Check
  const dupes = local.map((r) => r.url).filter((u, i, a) => a.indexOf(u) !== i);
  for (const u of new Set(dupes)) note(`[e ${path}] ${u} mehrfach geladen (Preload ohne crossorigin?)`);

  // f) Preloads
  const preloads = await p.evaluate(() => [...document.querySelectorAll('link[rel="preload"]')].map((l) => ({ href: l.getAttribute('href'), as: l.getAttribute('as'), type: l.getAttribute('type'), crossorigin: l.hasAttribute('crossorigin') ? (l.getAttribute('crossorigin') || 'anonymous') : null })));
  console.log('\n## f) <link rel="preload">');
  for (const l of preloads) console.log(`  ${JSON.stringify(l)}`);
  const fontPre = preloads.filter((l) => l.as === 'font');
  if (fontPre.length !== 2) note(`[f ${path}] ${fontPre.length} Font-Preloads statt 2`);
  for (const l of fontPre) {
    if (l.type !== 'font/woff2') note(`[f ${path}] Preload ${l.href}: type="${l.type}"`);
    if (l.crossorigin === null) note(`[f ${path}] Preload ${l.href}: crossorigin fehlt → Doppel-Download`);
  }
  if (!fontPre.some((l) => /caladea-latin-400-normal/.test(l.href))) note(`[f ${path}] Preload Caladea Regular fehlt`);
  if (!fontPre.some((l) => /arimo-latin-400-normal/.test(l.href))) note(`[f ${path}] Preload Arimo Regular fehlt`);

  // g) Subpixel
  console.log('\n## g) Subpixel-Positionen (DPR 2 → Vielfache von 0.5 ok)');
  const frac = (v) => Math.abs(v * 2 - Math.round(v * 2)) > 0.001;
  for (const [label, r] of Object.entries(res)) {
    if (!r) continue;
    const flag = frac(r.rect.top) || frac(r.rect.left);
    console.log(`  ${pad(label, 28)} top=${r.rect.top.toFixed(3)} left=${r.rect.left.toFixed(3)} w=${r.rect.w.toFixed(3)} ${flag ? '  ← SUBPIXEL' : ''}`);
    if (flag) note(`[g ${path}] ${label}: top=${r.rect.top.toFixed(3)} left=${r.rect.left.toFixed(3)}`);
    for (const la of r.layoutAncestors) {
      const lf = frac(la.top) || frac(la.left);
      if (lf) { console.log(`      ↳ <${la.tag} class="${la.cls}"> ${la.display} top=${la.top.toFixed(3)} left=${la.left.toFixed(3)} w=${la.w.toFixed(3)}  ← SUBPIXEL`); note(`[g ${path}] Container <${la.tag} class="${la.cls}"> (${la.display}) top=${la.top.toFixed(3)} left=${la.left.toFixed(3)} über ${label}`); }
    }
  }

  // h) + i) Screenshots
  const shots = path === '/'
    ? { hero: '.hero-headline', body: '.bereiche-text .bereiche-lead', card: '.pc', nav: '.hd-nav-list' }
    : { hero: 'h1', body: '.presse-hinweis, main p', card: '.pc', nav: '.hd-nav-list' };
  const shoot = async (suffix) => {
    for (const [area, sel] of Object.entries(shots)) {
      const loc = p.locator(sel).first();
      if (!(await loc.count())) { console.log(`  ${area}: ${sel} nicht gefunden`); continue; }
      await loc.scrollIntoViewIfNeeded();
      await p.waitForTimeout(150);
      const file = `${OUT}/font-check-${name}-${area}${suffix}.png`;
      await loc.screenshot({ path: file, scale: 'device' });
      console.log(`  ${file}`);
    }
  };
  console.log('\n## h) Screenshots (Webfonts)');
  await shoot('');
  console.log('\n## i) Screenshots (Referenz Georgia/Arial)');
  await p.addStyleTag({ content: `* { font-family: Arial, Helvetica, sans-serif !important } h1,h2,h3,.pc-titel,.pc-jahr,.presse-medien li,.hero-headline { font-family: Georgia, serif !important }` });
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(200);
  await shoot('-ref');

  await ctx.close();
}
await b.close();

console.log(`\n${'='.repeat(78)}\n# Zusammenfassung: ${findings.length} Befund(e)\n${'='.repeat(78)}`);
findings.forEach((f, i) => console.log(`${String(i + 1).padStart(2)}. ${f}`));
if (!findings.length) console.log('keine Abweichungen');
