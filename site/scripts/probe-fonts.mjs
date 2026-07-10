// probe-fonts.mjs
// Audit: jedes Text-Element hierarchisch (Groesse, Gewicht, Zeilenhoehe,
// CSS-Familie + tatsaechlich gerenderte Schrift), plus Landmarks fuer den
// Vergleich Staging vs Lokal. Ueberspringt den Plesk-Schutzschirm.
// Nutzung: node scripts/probe-fonts.mjs [url]   (Default: http://localhost:4321/)

import { chromium } from 'playwright';

const URL = process.argv[2] || 'http://localhost:4321/';

function ersteFamilie(stack) {
  return (stack || '').split(',')[0].replace(/["']/g, '').trim();
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(URL, { waitUntil: 'domcontentloaded' });

// Plesk-Schutzschirm ueberspringen, falls vorhanden
try {
  const cont = await page.$('#onContinue, button#onContinue, a#onContinue');
  if (cont) {
    await cont.click();
    await page.waitForLoadState('networkidle').catch(() => {});
  }
} catch (e) { /* kein Schild */ }

await page.waitForLoadState('networkidle').catch(() => {});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

// @font-face Status
const fontStatus = await page.evaluate(() => {
  const out = { geladen: [], checks: {} };
  document.fonts.forEach(f => out.geladen.push({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
  const probes = [['Caladea','400'],['Caladea','700'],['Arimo','400'],['Arimo','700']];
  for (const [fam, w] of probes) out.checks[`${fam} ${w}`] = document.fonts.check(`${w} 20px "${fam}"`);
  return out;
});

// Root + Body
const basis = await page.evaluate(() => ({
  root: getComputedStyle(document.documentElement).fontSize,
  body: getComputedStyle(document.body).fontSize,
  bodyFamily: getComputedStyle(document.body).fontFamily,
}));

// Alle sichtbaren Text-Elemente sammeln + markieren + Tiefe
const rows = await page.evaluate(() => {
  const SEL = 'h1,h2,h3,h4,h5,h6,p,li,a,button,input,textarea,span,blockquote,th,td,figcaption,label';
  const sichtbar = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && (r.width > 0 || r.height > 0);
  };
  const hatText = (el) => {
    if (['INPUT','TEXTAREA','SELECT'].includes(el.tagName)) return true;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim().length > 0) return true;
    return false;
  };
  const tiefe = (el) => { let d = 0, p = el.parentElement; while (p && p !== document.documentElement) { d++; p = p.parentElement; } return d; };
  const res = [];
  let i = 0;
  document.querySelectorAll(SEL).forEach(el => {
    if (!hatText(el) || !sichtbar(el)) return;
    const cs = getComputedStyle(el);
    el.setAttribute('data-fontprobe', String(i));
    const txt = (el.tagName === 'INPUT'
      ? (el.getAttribute('placeholder') || '[input]')
      : el.textContent.trim().replace(/\s+/g, ' ')).slice(0, 50);
    res.push({
      idx: i, tag: el.tagName.toLowerCase(),
      klasse: (el.getAttribute('class') || '').split(' ').filter(Boolean)[0] || '',
      tiefe: tiefe(el), text: txt,
      fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, cssFamily: cs.fontFamily,
    });
    i++;
  });
  return res;
});

// CDP: tatsaechlich gerenderte Schrift je Element
const client = await page.context().newCDPSession(page);
await client.send('DOM.enable');
await client.send('CSS.enable');
const { root } = await client.send('DOM.getDocument', { depth: -1 });
const { nodeIds } = await client.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-fontprobe]' });
for (let k = 0; k < nodeIds.length; k++) {
  let g = '?';
  try {
    const { fonts } = await client.send('CSS.getPlatformFontsForNode', { nodeId: nodeIds[k] });
    if (fonts && fonts.length) { fonts.sort((a,b)=>b.glyphCount-a.glyphCount); g = fonts[0].familyName; }
  } catch (e) { g = 'ERR'; }
  if (rows[k]) rows[k].gerendert = g;
}

await browser.close();

const num = (s) => parseFloat(s) || 0;

console.log('\n############################################################');
console.log('# URL: ' + URL);
console.log('############################################################');

console.log('\n=== @font-face geladen ===');
for (const f of fontStatus.geladen) console.log(`  ${String(f.family).padEnd(14)} w${String(f.weight).padEnd(4)} ${String(f.style).padEnd(7)} ${f.status}`);
console.log('\n=== document.fonts.check ===');
for (const [k, v] of Object.entries(fontStatus.checks)) console.log(`  ${k.padEnd(14)} ${v ? 'OK verfuegbar' : 'FEHLT'}`);

let groesstes = null, absatz = null;
for (const r of rows) { if (!groesstes || num(r.fontSize) > num(groesstes.fontSize)) groesstes = r; }
for (const r of rows) {
  if (r.tag === 'p' && num(r.fontSize) >= 15 && num(r.fontSize) <= 21) {
    if (!absatz || r.text.length > absatz.text.length) absatz = r;
  }
}

console.log('\n=== Landmarks (fuer Vergleich Staging vs Lokal) ===');
console.log('  root (html) font-size: ' + basis.root);
console.log('  body        font-size: ' + basis.body + '   CSS-Familie: ' + ersteFamilie(basis.bodyFamily));
if (groesstes) console.log('  groesste Schrift: ' + groesstes.fontSize + ' / w' + groesstes.fontWeight + ' / lh ' + groesstes.lineHeight + '  CSS ' + ersteFamilie(groesstes.cssFamily) + ' -> gerendert ' + groesstes.gerendert + '  [' + groesstes.tag + '.' + groesstes.klasse + '] "' + groesstes.text + '"');
if (absatz) console.log('  Beispiel-Absatz:  ' + absatz.fontSize + ' / w' + absatz.fontWeight + ' / lh ' + absatz.lineHeight + '  CSS ' + ersteFamilie(absatz.cssFamily) + ' -> gerendert ' + absatz.gerendert + '  "' + absatz.text + '"');

console.log('\n=== Alle Text-Elemente (Dokumentreihenfolge, eingerueckt nach Tiefe) ===');
console.log('  [size / weight / line-h]   CSS->gerendert        tag.class : Text');
const minTiefe = rows.length ? Math.min(...rows.map(r => r.tiefe)) : 0;
for (const r of rows) {
  const ind = '  '.repeat(Math.min(r.tiefe - minTiefe, 10));
  const sizeBlock = `[${r.fontSize} / ${r.fontWeight} / ${r.lineHeight}]`.padEnd(26);
  const fam = `${ersteFamilie(r.cssFamily)}->${r.gerendert || '?'}`.padEnd(22);
  console.log(`  ${ind}${sizeBlock} ${fam} ${r.tag}${r.klasse ? '.' + r.klasse : ''} : ${r.text}`);
}
console.log('');
