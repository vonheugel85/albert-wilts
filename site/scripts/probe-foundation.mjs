// scripts/probe-foundation.mjs
// Liest Fundamentwerte (Schriften, Container, Farben, CTA) vom Live-Staging aus.
// READ-ONLY – keine Aenderungen an Komponenten, Config oder CSS.
// Aufruf: node scripts/probe-foundation.mjs
// Ausgabe: tmp/foundation.json + lesbare Tabelle in der Konsole.

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const STAGING_URL = 'https://wizardly-gauss.92-205-58-98.plesk.page/';
const OUT_FILE    = 'tmp/foundation.json';
const WIDTHS_ROOT = [375, 768, 1024, 1280, 1440, 1920];

mkdirSync('tmp', { recursive: true });

const browser = await chromium.launch({ headless: true });

// ── Hilfsfunktion: Seite laden + Plesk-Schirm ueberwinden ──────────────────────
async function openPage(width = 1280) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(STAGING_URL, { waitUntil: 'networkidle', timeout: 40_000 });

  // Plesk-Schutzseite (Button #onContinue oder Text-Link)
  try {
    await page.click('#onContinue', { timeout: 4_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 });
  } catch {
    try {
      const btn = page.locator('a, button').filter({ hasText: /continue to website|zur website/i });
      if (await btn.count() > 0) {
        await btn.first().click();
        await page.waitForLoadState('networkidle', { timeout: 20_000 });
      }
    } catch { /* kein Schutzschirm */ }
  }

  await page.waitForTimeout(400);
  return page;
}

const result = {};

// ── 1) Root-Schriftgroesse bei verschiedenen Breiten ──────────────────────────
console.log('\n=== 1) Root-Schriftgroesse ===');
result.rootFontSize = {};
for (const vw of WIDTHS_ROOT) {
  const page = await openPage(vw);
  const fs = await page.evaluate(() =>
    getComputedStyle(document.documentElement).fontSize
  );
  result.rootFontSize[vw] = fs;
  console.log(`  ${String(vw).padStart(4)}px VP → root font-size: ${fs}`);
  await page.close();
}

// ── Ab hier immer bei 1280px ──────────────────────────────────────────────────
const page = await openPage(1280);

// ── 2) Body-Basiswerte ────────────────────────────────────────────────────────
console.log('\n=== 2) Body (bei 1280px) ===');
result.body = await page.evaluate(() => {
  const cs = getComputedStyle(document.body);
  return {
    fontFamily:  cs.fontFamily,
    fontSize:    cs.fontSize,
    lineHeight:  cs.lineHeight,
    color:       cs.color,
  };
});
for (const [k, v] of Object.entries(result.body)) {
  console.log(`  body.${k}: ${v}`);
}

// ── 3) Container-Breiten ─────────────────────────────────────────────────────
console.log('\n=== 3) Container-Breiten (bei 1280px) ===');
result.containers = await page.evaluate(() => {
  function measure(el, label) {
    if (!el) return { label, found: false };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      label,
      found: true,
      maxWidth:        cs.maxWidth,
      width:           cs.width,
      renderedWidth:   Math.round(rect.width),
      boxSizing:       cs.boxSizing,
      paddingLeft:     cs.paddingLeft,
      paddingRight:    cs.paddingRight,
      marginLeft:      cs.marginLeft,
      marginRight:     cs.marginRight,
      selector:        el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.trim().split(/\s+/).slice(0,3).join('.') : ''),
    };
  }

  // Header-Inside: pruefe mehrere Kandidaten
  const headerInside =
    document.querySelector('#header .inside') ||
    document.querySelector('header .inside') ||
    document.querySelector('.header-inside') ||
    document.querySelector('#header > *') ||
    document.querySelector('header > *');

  // Haupt-Inhaltscontainer: suche einen textuellen Block im Main
  const mainInside =
    document.querySelector('#main .inside') ||
    document.querySelector('main .inside') ||
    document.querySelector('.mod_article:not(#header):not(#footer) .inside') ||
    document.querySelector('#wrapper .mod_article .inside') ||
    document.querySelector('#main > .mod_article > .inside') ||
    document.querySelector('.main_column .inside') ||
    document.querySelector('#container .inside');

  // Gross-Bereich-Container (fuer "Unsere Geschichte" oder aehnliches)
  const aboutBlock =
    document.querySelector('[id*="geschichte"] .inside') ||
    document.querySelector('[class*="history"] .inside') ||
    document.querySelector('.ce_text .inside') ||
    document.querySelector('.mod_article .inside');

  // Footer-Inside (Referenz aus vorherigem Probe-Lauf)
  const footerInside =
    document.querySelector('#footer .inside') ||
    document.querySelector('footer .inside');

  return [
    measure(headerInside,   'header-inside'),
    measure(mainInside,     'main-inside'),
    measure(aboutBlock,     'about-block-inside'),
    measure(footerInside,   'footer-inside (Referenz)'),
  ];
});
for (const c of result.containers) {
  if (!c.found) {
    console.log(`  ${c.label}: NICHT GEFUNDEN`);
  } else {
    console.log(`  ${c.label} (${c.selector}):`);
    console.log(`    max-width: ${c.maxWidth} | rendered: ${c.renderedWidth}px | padding: ${c.paddingLeft}/${c.paddingRight}`);
  }
}

// ── 4) Ueberschriften-Skala ───────────────────────────────────────────────────
console.log('\n=== 4) Ueberschriften (bei 1280px) ===');
result.headings = await page.evaluate(() => {
  function probe(sel) {
    const el = document.querySelector(sel);
    if (!el) return { sel, found: false };
    const cs = getComputedStyle(el);
    return {
      sel,
      found:      true,
      text:       el.textContent.trim().slice(0, 50),
      fontFamily: cs.fontFamily,
      fontSize:   cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      color:      cs.color,
      marginTop:  cs.marginTop,
      marginBottom: cs.marginBottom,
    };
  }
  return [
    probe('h1'),
    // h1 faellt in RS-Slider oft weg; dann nehmen wir den ersten .h1-Kandidaten
    probe('.tp-caption.h1'),
    probe('h2'),
    probe('h3'),
    probe('h4'),
  ];
});
for (const h of result.headings) {
  if (!h.found) {
    console.log(`  ${h.sel}: nicht gefunden`);
    continue;
  }
  console.log(`  ${h.sel} "${h.text.slice(0,35)}"`);
  console.log(`    font: ${h.fontFamily} ${h.fontSize} / lh ${h.lineHeight} w${h.fontWeight}`);
  console.log(`    color: ${h.color} | margin: ${h.marginTop} / ${h.marginBottom}`);
}

// ── 5) CTA-Buttons ────────────────────────────────────────────────────────────
console.log('\n=== 5) CTA-Buttons (bei 1280px) ===');
result.buttons = await page.evaluate(() => {
  function probeBtn(sel, label) {
    const el = document.querySelector(sel);
    if (!el) return { label, sel, found: false };
    const cs = getComputedStyle(el);
    return {
      label, sel, found: true,
      text:            el.textContent.trim().slice(0, 40),
      background:      cs.background,
      backgroundColor: cs.backgroundColor,
      color:           cs.color,
      padding:         cs.padding,
      borderRadius:    cs.borderRadius,
      fontSize:        cs.fontSize,
      fontWeight:      cs.fontWeight,
      border:          cs.border,
      textTransform:   cs.textTransform,
      letterSpacing:   cs.letterSpacing,
    };
  }

  // Kandidaten: Slider-Buttons, Hero-CTA, Newsletter-Button, allgemeine .btn
  const candidates = [
    probeBtn('.btn-second',                    'btn-second'),
    probeBtn('.tp-caption a',                  'slider-link'),
    probeBtn('.ce_form input[type="submit"]',  'form-submit'),
    probeBtn('input[type="submit"]',           'submit (any)'),
    probeBtn('a.btn',                          'a.btn'),
    probeBtn('.submit',                        '.submit'),
    probeBtn('[class*="btn"]',                 '[class*=btn]'),
    probeBtn('a[class*="button"]',             'a[class*=button]'),
  ];
  return candidates;
});
for (const b of result.buttons) {
  if (!b.found) {
    console.log(`  ${b.label} (${b.sel}): nicht gefunden`);
    continue;
  }
  console.log(`  ${b.label} "${b.text}"`);
  console.log(`    bg: ${b.backgroundColor} | color: ${b.color} | padding: ${b.padding}`);
  console.log(`    border-radius: ${b.borderRadius} | font: ${b.fontSize} w${b.fontWeight}`);
}

// ── 6) Markenfarben ───────────────────────────────────────────────────────────
console.log('\n=== 6) Markenfarben (bei 1280px) ===');
result.brandColors = await page.evaluate(() => {
  function bg(sel, label) {
    const el = document.querySelector(sel);
    if (!el) return { label, sel, found: false };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      label, sel, found: true,
      backgroundColor: cs.backgroundColor,
      color:           cs.color,
      renderedWidth:   Math.round(rect.width),
      renderedHeight:  Math.round(rect.height),
    };
  }

  // Gruen-Leiste (Teaser-Info-Leiste)
  const greenTeaserCandidates = [
    bg('.bg-accent',                          'bg-accent'),
    bg('[class*="bg_accent"]',                'bg_accent (underscore)'),
    bg('.mod_article.bg-green',               'mod_article.bg-green'),
    bg('.mod_article[class*="green"]',        'mod_article[class*=green]'),
    bg('.mod_article[class*="accent"]',       'mod_article[class*=accent]'),
    // pct_theme: Teaserleiste hat oft eigene class aus Backend
    bg('#article-3',                          '#article-3'),
    bg('#article-4',                          '#article-4'),
    bg('#article-5',                          '#article-5'),
  ];

  // Orange-Bereich (Newsletter)
  const orangeCandidates = [
    bg('.bg-second',                          'bg-second'),
    bg('[class*="bg_second"]',                'bg_second (underscore)'),
    bg('.mod_article[class*="orange"]',       'mod_article[class*=orange]'),
    bg('.mod_article[class*="second"]',       'mod_article[class*=second]'),
    bg('#article-6',                          '#article-6'),
    bg('#article-7',                          '#article-7'),
    bg('#article-8',                          '#article-8'),
    bg('#article-9',                          '#article-9'),
  ];

  // Body-Link
  const link = (() => {
    const el = document.querySelector('#main a:not([class*="btn"]):not([class*="button"])');
    if (!el) return { label: 'body-link', found: false };
    const cs = getComputedStyle(el);
    return { label: 'body-link', found: true, color: cs.color, textDecoration: cs.textDecoration };
  })();

  // Body-Text
  const bodyText = (() => {
    const el = document.querySelector('#main p') || document.querySelector('main p') || document.querySelector('.ce_text p');
    if (!el) return { label: 'body-text', found: false };
    const cs = getComputedStyle(el);
    return { label: 'body-text', found: true, color: cs.color, fontSize: cs.fontSize };
  })();

  return {
    greenTeaser: greenTeaserCandidates.filter(c => c.found),
    orange:      orangeCandidates.filter(c => c.found),
    link,
    bodyText,
  };
});

// Gruen-Kandidaten: alle gefundenen anzeigen
if (result.brandColors.greenTeaser.length === 0) {
  console.log('  gruen-Teaser: kein Kandidat gefunden');
} else {
  for (const c of result.brandColors.greenTeaser) {
    console.log(`  gruen (${c.sel}): bg=${c.backgroundColor} | ${c.renderedWidth}x${c.renderedHeight}px`);
  }
}
if (result.brandColors.orange.length === 0) {
  console.log('  orange: kein Kandidat gefunden');
} else {
  for (const c of result.brandColors.orange) {
    console.log(`  orange (${c.sel}): bg=${c.backgroundColor} | ${c.renderedWidth}x${c.renderedHeight}px`);
  }
}
if (result.brandColors.link.found) {
  console.log(`  link color: ${result.brandColors.link.color}`);
} else {
  console.log('  link: nicht gefunden');
}
if (result.brandColors.bodyText.found) {
  console.log(`  body-text color: ${result.brandColors.bodyText.color} | ${result.brandColors.bodyText.fontSize}`);
} else {
  console.log('  body-text: nicht gefunden');
}

// ── Alle Article-IDs + deren background scannen (Hilfsscan) ──────────────────
console.log('\n=== HILFSSCAN: alle .mod_article mit nicht-weissem Hintergrund ===');
result.articleBgScan = await page.evaluate(() => {
  const arts = [...document.querySelectorAll('.mod_article[id]')];
  return arts.map(el => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    return { id: el.id, cls: el.className.trim().split(/\s+/).slice(0,6).join(' '), bg };
  }).filter(a =>
    // Filter: nicht transparent und nicht weiss
    a.bg !== 'rgba(0, 0, 0, 0)' && a.bg !== 'rgb(255, 255, 255)'
  );
});
for (const a of result.articleBgScan) {
  console.log(`  #${a.id}  bg: ${a.bg}  |  classes: ${a.cls}`);
}

// ── Dump ──────────────────────────────────────────────────────────────────────
await page.close();
await browser.close();

writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
console.log(`\n✓ Dump geschrieben: ${OUT_FILE}`);
