/**
 * probe-nav.mjs
 * Misst die Desktop-Navigation auf dem Live-Staging (1280px).
 * Ergebnis: tmp/nav_computed.json
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const STAGING = 'https://wizardly-gauss.92-205-58-98.plesk.page/';
const OUT = 'tmp/nav_computed.json';
mkdirSync('tmp', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(STAGING, { waitUntil: 'networkidle' });

// Plesk-Schutzschirm wegklicken
try { await page.click('#onContinue', { timeout: 4000 }); await page.waitForLoadState('networkidle'); } catch {}
await page.waitForTimeout(500);

const data = await page.evaluate(() => {
  const vw = window.innerWidth;
  const vcx = vw / 2;

  // Nav-Container
  const navEl = document.querySelector('#header .mod_navigation, #header nav');
  const navR  = navEl ? navEl.getBoundingClientRect() : null;
  const navCs = navEl ? getComputedStyle(navEl) : null;

  // UL (die direkte Kindliste)
  const ulEl = navEl ? navEl.querySelector('ul') : null;
  const ulR  = ulEl ? ulEl.getBoundingClientRect() : null;
  const ulCs = ulEl ? getComputedStyle(ulEl) : null;

  // Alle LI auf Level 1
  const liEls = ulEl ? [...ulEl.children] : [];

  const items = liEls.map(li => {
    const r = li.getBoundingClientRect();
    const a = li.querySelector(':scope > a, :scope > span');
    const cs = getComputedStyle(li);
    const acs = a ? getComputedStyle(a) : null;
    const text = a ? a.textContent.trim() : li.textContent.trim().slice(0, 40);

    // Chevrons / Pfeilsymbole im LI?
    const chevrons = [...li.querySelectorAll('svg, .arrow, .chevron, [class*="arrow"], [class*="chevron"], [class*="caret"]')];

    return {
      text,
      x:     Math.round(r.left),
      right: Math.round(r.right),
      cx:    Math.round(r.left + r.width / 2),
      width: Math.round(r.width),
      y:     Math.round(r.top),
      h:     Math.round(r.height),
      bg:    acs?.backgroundColor || cs.backgroundColor,
      color: acs?.color || null,
      padding: acs ? `${acs.paddingTop} ${acs.paddingRight} ${acs.paddingBottom} ${acs.paddingLeft}` : null,
      borderRadius: acs?.borderRadius || null,
      lineHeight: acs?.lineHeight || null,
      fontSize: acs?.fontSize || null,
      hasChevron: chevrons.length > 0,
      chevronTags: chevrons.map(c => c.tagName + '.' + c.className).join(', '),
      hasFlyout: !!li.querySelector('ul'),
    };
  });

  // Gruppe-Bounding-Box (alle LI zusammen)
  const groupLeft  = items.length ? Math.min(...items.map(i => i.x))     : 0;
  const groupRight = items.length ? Math.max(...items.map(i => i.right))  : 0;
  const groupCx    = (groupLeft + groupRight) / 2;
  const groupW     = groupRight - groupLeft;
  const offsetFromCenter = Math.round(groupCx - vcx);

  // Nav-Grundlinie-Border
  const navBorderBottom = navCs ? `${navCs.borderBottomWidth} ${navCs.borderBottomStyle} ${navCs.borderBottomColor}` : null;
  const ulBorderBottom  = ulCs  ? `${ulCs.borderBottomWidth}  ${ulCs.borderBottomStyle}  ${ulCs.borderBottomColor}`  : null;

  // "Aktuelle Angebote" separat
  const ctaItem = items.find(i => i.text.toLowerCase().includes('angebot'));

  // ul display / justify
  const ulDisplay  = ulCs?.display    || null;
  const ulJustify  = ulCs?.justifyContent || null;
  const ulAlignI   = ulCs?.alignItems || null;
  const navDisplay = navCs?.display   || null;
  const navJustify = navCs?.justifyContent || null;

  return {
    viewport: { width: vw, centerX: vcx },
    nav: navR ? {
      x: Math.round(navR.left), right: Math.round(navR.right),
      width: Math.round(navR.width), cx: Math.round(navR.left + navR.width / 2),
      display: navDisplay, justifyContent: navJustify,
      borderBottom: navBorderBottom,
    } : null,
    ul: ulR ? {
      x: Math.round(ulR.left), right: Math.round(ulR.right),
      width: Math.round(ulR.width), cx: Math.round(ulR.left + ulR.width / 2),
      display: ulDisplay, justifyContent: ulJustify, alignItems: ulAlignI,
      borderBottom: ulBorderBottom,
    } : null,
    group: { left: groupLeft, right: groupRight, cx: Math.round(groupCx), width: groupW, offsetFromViewportCenter: offsetFromCenter },
    items,
    ctaItem,
    anyChevronInDom: items.some(i => i.hasChevron),
  };
});

writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log('Gespeichert:', OUT);
console.log('\n--- Zusammenfassung ---');
console.log(`Viewport-Center:      ${data.viewport.centerX}px`);
console.log(`Gruppen-Center:       ${data.group.cx}px`);
console.log(`Offset von Mitte:     ${data.group.offsetFromViewportCenter}px`);
console.log(`Gruppen-Breite:       ${data.group.width}px`);
console.log(`Nav display:          ${data.nav?.display}, justify: ${data.nav?.justifyContent}`);
console.log(`UL display:           ${data.ul?.display}, justify: ${data.ul?.justifyContent}, align: ${data.ul?.alignItems}`);
console.log(`Chevrons im DOM:      ${data.anyChevronInDom}`);
console.log('\n--- L1-Items (links → rechts) ---');
data.items.forEach(i => {
  console.log(`  x=${String(i.x).padStart(4)}  w=${String(i.width).padStart(3)}  "${i.text}"${i.hasChevron ? ' [CHEVRON]' : ''}`);
});
console.log('\n--- Aktuelle Angebote ---');
if (data.ctaItem) {
  console.log(`  bg:     ${data.ctaItem.bg}`);
  console.log(`  color:  ${data.ctaItem.color}`);
  console.log(`  pad:    ${data.ctaItem.padding}`);
  console.log(`  radius: ${data.ctaItem.borderRadius}`);
  console.log(`  h:      ${data.ctaItem.h}px`);
  console.log(`  lineH:  ${data.ctaItem.lineHeight}`);
}

await browser.close();
