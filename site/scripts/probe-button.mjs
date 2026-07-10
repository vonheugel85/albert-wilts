/**
 * probe-button.mjs
 * Liest auf Staging CTA-Buttons ("Weiterlesen", "Mehr Informationen") und
 * den Newsletter-"Anmelden"-Button aus. Gibt computed styles sowie
 * simuliertes Hover-Delta aus.
 *
 * Aufruf: node scripts/probe-button.mjs
 */

import { chromium } from 'playwright';

const STAGING = 'https://wizardly-gauss.92-205-58-98.plesk.page/';

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Plesk-Schutzschirm umgehen
await page.goto(STAGING, { waitUntil: 'domcontentloaded' });
const continueBtn = page.locator('#onContinue');
if (await continueBtn.count() > 0) {
  await continueBtn.click();
  await page.waitForLoadState('networkidle');
}

// Alle CTA-Links + Submit-Button auslesen
const data = await page.evaluate(() => {
  const results = [];

  // Hilfsfunktion: relevante computed styles aus einem Element lesen
  function probe(el, label) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      label,
      tag:              el.tagName,
      text:             el.textContent.trim().slice(0, 60),
      fontSize:         cs.fontSize,
      fontWeight:       cs.fontWeight,
      fontFamily:       cs.fontFamily,
      color:            cs.color,
      background:       cs.backgroundColor,
      paddingTop:       cs.paddingTop,
      paddingBottom:    cs.paddingBottom,
      paddingLeft:      cs.paddingLeft,
      paddingRight:     cs.paddingRight,
      borderRadius:     cs.borderRadius,
      borderTopLeftRadius: cs.borderTopLeftRadius,
      display:          cs.display,
      lineHeight:       cs.lineHeight,
      letterSpacing:    cs.letterSpacing,
      textTransform:    cs.textTransform,
      transition:       cs.transition,
      width:            Math.round(rect.width) + 'px',
      height:           Math.round(rect.height) + 'px',
      hasChevron: el.textContent.includes('›') || el.textContent.includes('»'),
    };
  }

  // 1) Alle <a>-Links die nach CTA aussehen (orange Hintergrund)
  const links = [...document.querySelectorAll('a')];
  for (const a of links) {
    const cs = getComputedStyle(a);
    const bg = cs.backgroundColor;
    // orange (#EF7F1A) => approx rgb(239, 127, 26)
    if (bg.includes('239') || bg.includes('ef7f') || bg.includes('EF7F')) {
      results.push(probe(a, 'CTA-Link (orange)'));
    }
  }

  // 2) Newsletter-Submit-Button
  const submitBtns = [...document.querySelectorAll('button[type="submit"], input[type="submit"]')];
  for (const btn of submitBtns) {
    results.push(probe(btn, 'Submit-Button'));
  }

  // 3) Falls keine orangen Links gefunden, alle sichtbaren <a> ausgeben
  if (results.filter(r => r.label === 'CTA-Link (orange)').length === 0) {
    for (const a of links.slice(0, 20)) {
      const cs = getComputedStyle(a);
      results.push({
        label: 'Alle Links (Fallback)',
        tag: 'A',
        text: a.textContent.trim().slice(0, 40),
        background: cs.backgroundColor,
        color: cs.color,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
        borderRadius: cs.borderRadius,
        fontSize: cs.fontSize,
      });
    }
  }

  return results;
});

// Hover: CTA-Link Pseudo-Klasse simulieren (transform/opacity nach Hover)
// Playwright kann echten CSS-Hover messen
let hoverData = null;
try {
  const ctaLinks = page.locator('a').filter({ hasNot: page.locator('header a') });
  // Ersten sichtbaren Link nehmen der orange ist
  const orangeLinks = page.locator('a').all();
  for (const link of await orangeLinks) {
    const bg = await link.evaluate(el => getComputedStyle(el).backgroundColor);
    if (bg.includes('239') || bg.includes('127')) {
      // Position vor Hover
      const beforeTransform = await link.evaluate(el =>
        getComputedStyle(el).transform
      );
      await link.hover();
      await page.waitForTimeout(200);
      const afterOpacity   = await link.evaluate(el => getComputedStyle(el).opacity);
      const afterTransform = await link.evaluate(el => getComputedStyle(el).transform);
      const afterBg        = await link.evaluate(el => getComputedStyle(el).backgroundColor);
      hoverData = { beforeTransform, afterOpacity, afterTransform, afterBg };
      break;
    }
  }
} catch (e) {
  hoverData = { error: String(e) };
}

console.log('\n=== Staging Button Probe ===\n');
for (const r of data) {
  console.log(`[${r.label}] <${r.tag}> "${r.text}"`);
  if (r.background)    console.log(`  background:      ${r.background}`);
  if (r.color)         console.log(`  color:           ${r.color}`);
  if (r.fontSize)      console.log(`  font-size:       ${r.fontSize}`);
  if (r.fontWeight)    console.log(`  font-weight:     ${r.fontWeight}`);
  if (r.paddingTop)    console.log(`  padding:         ${r.paddingTop} ${r.paddingRight} ${r.paddingBottom} ${r.paddingLeft}`);
  if (r.borderRadius)  console.log(`  border-radius:   ${r.borderRadius}`);
  if (r.lineHeight)    console.log(`  line-height:     ${r.lineHeight}`);
  if (r.transition)    console.log(`  transition:      ${r.transition}`);
  if (r.hasChevron !== undefined) console.log(`  hasChevron:      ${r.hasChevron}`);
  if (r.width)         console.log(`  rendered size:   ${r.width} x ${r.height}`);
  console.log();
}

if (hoverData) {
  console.log('=== Hover-Delta ===');
  console.log(JSON.stringify(hoverData, null, 2));
}

await browser.close();
