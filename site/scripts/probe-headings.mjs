/**
 * probe-headings.mjs
 * Liest auf Staging computed font-weight, font-family und font-size
 * fuer h2 und h3 aus. Zusaetzlich wird geprueft ob die real geladene
 * Schriftart synthetisches faux-bold enthaelt (localFont !== 'Caladea').
 *
 * Aufruf: node scripts/probe-headings.mjs
 */

import { chromium } from 'playwright';

const STAGING = 'https://wizardly-gauss.92-205-58-98.plesk.page/';

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();

// Plesk-Schutzschirm umgehen
await page.goto(STAGING, { waitUntil: 'domcontentloaded' });
const continueBtn = page.locator('#onContinue');
if (await continueBtn.count() > 0) {
  await continueBtn.click();
  await page.waitForLoadState('networkidle');
}

const data = await page.evaluate(() => {
  const results = [];

  // Suche h2 und h3 Elemente
  const headings = [...document.querySelectorAll('h2, h3')];

  for (const el of headings) {
    const cs   = getComputedStyle(el);
    const text = el.textContent.trim().slice(0, 60);

    // Pruefen ob Schrift wirklich geladen wurde (document.fonts API)
    const fam    = cs.fontFamily;
    const weight = cs.fontWeight;
    const loaded = [...document.fonts].filter(f =>
      f.family.toLowerCase().includes('caladea')
    ).map(f => `${f.family} w${f.weight} s${f.style} (${f.status})`);

    results.push({
      tag:        el.tagName,
      text,
      fontFamily: fam,
      fontWeight: weight,
      fontSize:   cs.fontSize,
      lineHeight: cs.lineHeight,
      caladea_fonts: loaded.length > 0 ? loaded : ['(keins geladen)'],
    });
  }

  return results;
});

console.log('\n=== Staging Headings Probe ===\n');
for (const r of data) {
  console.log(`${r.tag}: "${r.text}"`);
  console.log(`  font-family:  ${r.fontFamily}`);
  console.log(`  font-weight:  ${r.fontWeight}`);
  console.log(`  font-size:    ${r.fontSize}`);
  console.log(`  line-height:  ${r.lineHeight}`);
  if (r.caladea_fonts[0] !== '(keins geladen)') {
    console.log(`  Caladea @fontface-Eintraege:`);
    for (const f of r.caladea_fonts) console.log(`    - ${f}`);
  }
  console.log();
}

await browser.close();
