/**
 * probe-nav-size.mjs
 * Misst die SICHTBAREN Desktop-Nav-Links auf Staging.
 * Wichtig: NICHT den Sticky-Klon messen (der ist display:none oder opacity:0).
 * Pro <a> der Hauptnav: textContent, fontSize, lineHeight, fontFamily,
 * letterSpacing, padding, boundingClientRect.
 * Plausibilitaet: Cap-Hoehe ~13px → fontSize ~18px.
 * Ergebnis: tmp/nav_size.json
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const STAGING = 'https://wizardly-gauss.92-205-58-98.plesk.page/';
const OUT = 'tmp/nav_size.json';
mkdirSync('tmp', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(STAGING, { waitUntil: 'networkidle' });

// Plesk-Schutzschirm
try {
  await page.click('#onContinue', { timeout: 4000 });
  await page.waitForLoadState('networkidle');
} catch {}
await page.waitForTimeout(500);

const data = await page.evaluate(() => {
  // Alle potenziellen Nav-Container: NICHT den Sticky-Klon
  // Staging-Contao: .stickyheader .header.cloned ist der Sticky-Klon → ausschliessen.
  // Sichtbare Haupt-Navigation: #header .inside nav, oder .nav_custom
  // Strategie: alle <nav> und <div class*="nav"> im #header finden,
  // die NICHT innerhalb von .stickyheader oder [class*="cloned"] liegen UND
  // die tatsaechlich sichtbar sind (display != none, visibility != hidden).

  function isVisible(el) {
    const cs = getComputedStyle(el);
    // Element selbst
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    // Vorfahren
    let p = el.parentElement;
    while (p && p !== document.body) {
      const pcs = getComputedStyle(p);
      if (pcs.display === 'none' || pcs.visibility === 'hidden') return false;
      p = p.parentElement;
    }
    return true;
  }

  // 1. Alle <a>-Tags im #header messen (NICHT im Sticky-Klon)
  const header = document.querySelector('#header, header#header, .header');
  if (!header) return { error: 'Kein #header gefunden', html: document.documentElement.outerHTML.slice(0, 2000) };

  // Sticky-Klon identifizieren: hat meist Klasse 'cloned', 'sticky', 'stickyheader'
  // Alle Kinder-Elemente die sticky sind, aus dem Scope nehmen
  const stickyContainers = header.querySelectorAll(
    '.cloned, .stickyheader, [class*="sticky"], [class*="clone"]'
  );
  const stickySet = new Set(stickyContainers);

  function isInStickyContainer(el) {
    let p = el;
    while (p) {
      if (stickySet.has(p)) return true;
      p = p.parentElement;
    }
    return false;
  }

  // Alle <a>-Tags der Haupt-Navigation (Level-1-Links, NICHT Flyout-Links)
  // Level-1: direkte Kind-<a> eines <li> in der ersten <ul>
  const navEls = header.querySelectorAll('.mod_navigation, nav, [class*="navigation"], [class*="nav_"]');
  
  // Ersten sichtbaren, nicht-sticky Nav-Container finden
  let mainNav = null;
  for (const el of navEls) {
    if (isInStickyContainer(el)) continue;
    if (!isVisible(el)) continue;
    mainNav = el;
    break;
  }

  if (!mainNav) {
    // Fallback: nimm alle sichtbaren <ul> im header
    return {
      error: 'Kein sichtbarer Nav-Container gefunden',
      navEls: [...navEls].map(el => ({
        tag: el.tagName,
        cls: el.className,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
        inSticky: isInStickyContainer(el),
      })),
    };
  }

  // Erste <ul> im Nav-Container (Level-1-Liste)
  const ul = mainNav.querySelector('ul');
  if (!ul) return { error: 'Kein <ul> im Nav-Container', navClass: mainNav.className };

  // Alle Level-1-<li>
  const lis = [...ul.children].filter(el => el.tagName === 'LI');

  const results = lis.map(li => {
    // Level-1-<a> ist das direkte Kind-<a> des <li>
    const a = li.querySelector(':scope > a');
    if (!a) return { li_text: li.textContent.trim().slice(0, 40), error: 'kein direktes <a>' };

    const cs = getComputedStyle(a);
    const r = a.getBoundingClientRect();
    const liR = li.getBoundingClientRect();

    // Fuer die Cap-Hoehe: messen wir die tatsaechliche Texthoehe mit Range
    let capHeight = null;
    try {
      const range = document.createRange();
      range.selectNodeContents(a);
      const rects = range.getClientRects();
      if (rects.length > 0) {
        capHeight = Math.round(rects[0].height);
      }
    } catch {}

    return {
      text:         a.textContent.trim(),
      visible:      isVisible(a),
      fontSize:     cs.fontSize,
      lineHeight:   cs.lineHeight,
      fontFamily:   cs.fontFamily,
      fontWeight:   cs.fontWeight,
      color:        cs.color,
      letterSpacing: cs.letterSpacing,
      padding:      `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      // Bounding boxes
      a_x:    Math.round(r.left),
      a_y:    Math.round(r.top),
      a_w:    Math.round(r.width),
      a_h:    Math.round(r.height),
      li_x:   Math.round(liR.left),
      li_y:   Math.round(liR.top),
      li_w:   Math.round(liR.width),
      li_h:   Math.round(liR.height),
      // Sichtbare Texthoehe (Range-Rechteck)
      textRangeHeight: capHeight,
    };
  });

  // Auch den Nav-Container selbst
  const navR = mainNav.getBoundingClientRect();
  const ulR  = ul.getBoundingClientRect();

  return {
    mainNavClass: mainNav.className,
    mainNavTag:   mainNav.tagName,
    nav: {
      x: Math.round(navR.left), y: Math.round(navR.top),
      w: Math.round(navR.width), h: Math.round(navR.height),
      display: getComputedStyle(mainNav).display,
    },
    ul: {
      x: Math.round(ulR.left), y: Math.round(ulR.top),
      w: Math.round(ulR.width), h: Math.round(ulR.height),
    },
    links: results,
  };
});

writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(JSON.stringify(data, null, 2));
await browser.close();
