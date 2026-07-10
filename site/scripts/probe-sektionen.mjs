/**
 * probe-sektionen.mjs
 * Misst auf Staging:
 *   - Hero: Gesamthöhe, Overlay-Gradient
 *   - Info-Leiste: Icon-Position (links oder oben)
 *   - Footer: Signet-Bildbreite und -höhe
 *
 * Aufruf: node scripts/probe-sektionen.mjs
 */

import { chromium } from 'playwright';

const STAGING = 'https://wizardly-gauss.92-205-58-98.plesk.page/';

const browser = await chromium.launch({ headless: true });
const page    = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

await page.goto(STAGING, { waitUntil: 'domcontentloaded' });
const cont = page.locator('#onContinue');
if (await cont.count() > 0) {
  await cont.click();
  await page.waitForLoadState('networkidle');
}

const data = await page.evaluate(() => {
  const out = {};

  // ── 1) Hero ──────────────────────────────────────────────────────────────
  // Auf Staging ist der Hero typischerweise ein RS-Slider oder ce_bgimage
  // Suche nach einem grossen BG-Bild-Container am Seitenanfang
  const heroSelectors = [
    '.rev_slider_wrapper',
    '.ce_bgimage',
    '.hero-section',
    '[class*="hero"]',
    '[class*="slider"]',
    '#article-1 > .inside',
    'article:first-of-type',
    '.mod_article:first-of-type',
    '#article-1',
    '#article-55',
  ];

  let heroEl = null;
  for (const sel of heroSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.height > 200) {
        heroEl = el;
        break;
      }
    }
  }

  if (heroEl) {
    const rect = heroEl.getBoundingClientRect();
    const cs   = getComputedStyle(heroEl);
    out.hero = {
      selector:   heroEl.tagName + (heroEl.id ? '#' + heroEl.id : '') + '.' + [...heroEl.classList].join('.'),
      height:     Math.round(rect.height) + 'px',
      width:      Math.round(rect.width) + 'px',
      background: cs.backgroundImage || cs.background,
      overflow:   cs.overflow,
    };

    // Overlay/Scrim suchen (Child mit background rgba)
    const children = [...heroEl.querySelectorAll('*')].slice(0, 20);
    const scrims = children.filter(c => {
      const bg = getComputedStyle(c).backgroundImage;
      return bg.includes('linear-gradient') || bg.includes('rgba');
    }).map(c => ({
      tag: c.tagName,
      cls: [...c.classList].join('.'),
      bg:  getComputedStyle(c).backgroundImage || getComputedStyle(c).background,
    }));
    out.hero.scrims = scrims;
  } else {
    // Fallback: alle grossen Elemente oben ausgeben
    const tall = [...document.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.top < 100 && r.height > 300 && r.width > 600;
    });
    out.hero = {
      error: 'Kein Hero gefunden, alle hohen Elemente oben:',
      candidates: tall.slice(0, 5).map(el => ({
        tag: el.tagName,
        id:  el.id,
        cls: [...el.classList].slice(0, 5).join('.'),
        h:   Math.round(el.getBoundingClientRect().height) + 'px',
        bg:  getComputedStyle(el).backgroundImage,
      })),
    };
  }

  // ── 2) Info-Leiste: Icon-Layout ──────────────────────────────────────────
  // Suche nach dem gruenen Streifen und schaue ob Icon links oder oben ist
  const greenEls = [...document.querySelectorAll('*')].filter(el => {
    const bg = getComputedStyle(el).backgroundColor;
    return bg.includes('79, 113, 70') || bg.includes('4f7146') || bg.includes('79,113,70');
  });

  if (greenEls.length > 0) {
    const infoLeiste = greenEls[0];
    // Icon im ersten Slot finden
    const firstCol = infoLeiste.querySelector('[class*="col"],[class*="spalte"],[class*="item"]');
    const icon = infoLeiste.querySelector('i[class*="fa"], img, svg');
    const title = infoLeiste.querySelector('h2, h3, strong, [class*="title"]');

    if (icon && title) {
      const iconRect  = icon.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const isLeft    = Math.abs(iconRect.left - titleRect.left) > 20 && iconRect.top > titleRect.top - 10;
      out.infoLeiste = {
        iconTop:    Math.round(iconRect.top) + 'px',
        iconLeft:   Math.round(iconRect.left) + 'px',
        titleTop:   Math.round(titleRect.top) + 'px',
        titleLeft:  Math.round(titleRect.left) + 'px',
        iconAbove:  iconRect.top < titleRect.top - 5,
        iconLeft_of_title: iconRect.left < titleRect.left - 5 && Math.abs(iconRect.top - titleRect.top) < 60,
        iconSize:   Math.round(iconRect.width) + 'x' + Math.round(iconRect.height) + 'px',
        iconFontSize: getComputedStyle(icon).fontSize,
        colLayout:  firstCol ? getComputedStyle(firstCol).display + ' ' + getComputedStyle(firstCol).flexDirection : '?',
      };
    } else {
      out.infoLeiste = { error: 'Kein Icon/Title in gruener Sektion', greenSelector: infoLeiste.tagName + '.' + [...infoLeiste.classList].slice(0,4).join('.') };
    }
  } else {
    out.infoLeiste = { error: 'Kein gruenes Element gefunden' };
  }

  // ── 3) Footer: Signet ────────────────────────────────────────────────────
  const footer = document.querySelector('footer, #footer, [id*="footer"]');
  if (footer) {
    const signet = footer.querySelector('img');
    if (signet) {
      const rect = signet.getBoundingClientRect();
      const cs   = getComputedStyle(signet);
      out.footer = {
        src:           signet.getAttribute('src'),
        renderedWidth:  Math.round(rect.width) + 'px',
        renderedHeight: Math.round(rect.height) + 'px',
        cssWidth:       cs.width,
        cssHeight:      cs.height,
        opacity:        cs.opacity,
        naturalWidth:   signet.naturalWidth + 'px',
        naturalHeight:  signet.naturalHeight + 'px',
      };
    } else {
      out.footer = { error: 'Kein img im Footer' };
    }
  } else {
    out.footer = { error: 'Kein Footer-Element' };
  }

  return out;
});

console.log('\n=== Staging Sektionen-Probe ===\n');
console.log('── Hero ──');
console.log(JSON.stringify(data.hero, null, 2));
console.log('\n── Info-Leiste ──');
console.log(JSON.stringify(data.infoLeiste, null, 2));
console.log('\n── Footer Signet ──');
console.log(JSON.stringify(data.footer, null, 2));

await browser.close();
