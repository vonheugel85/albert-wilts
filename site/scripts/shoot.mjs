// scripts/shoot.mjs
// Screenshot-Hilfsskript für Footer- und Header-Abgleich.
// Aufruf (Footer): node scripts/shoot.mjs <url> <ausgabedatei> [viewport-breite]
// Aufruf (Header): node scripts/shoot.mjs <url> <ausgabe-praefix> [viewport-breite] header
//   Erzeugt: <praefix>_top.png, <praefix>_sticky.png, <praefix>_dropdown.png, <praefix>_mobile.png

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [,, url, outFile, widthArg, modeArg] = process.argv;
if (!url || !outFile) {
  console.error('Aufruf: node scripts/shoot.mjs <url> <ausgabedatei> [breite] [header|footer]');
  process.exit(1);
}

const viewportWidth  = parseInt(widthArg ?? '1280', 10);
const viewportHeight = 900;
const isHeaderMode   = (modeArg === 'header');
const DEVICE_SCALE   = 2; // identisch fuer Staging und Local

const browser = await chromium.launch();

// ── Hilfsfunktion: Seite deterministisch laden ─────────────────────────────
// Reihenfolge: goto networkidle → Fonts → Bilder/SVG → Settle 300ms
async function openPage(vw = viewportWidth) {
  const page = await browser.newPage({
    viewport: { width: vw, height: viewportHeight },
    deviceScaleFactor: DEVICE_SCALE,
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

  // Plesk-Schutzseite (ID "onContinue" oder Link-Text)
  try {
    const btn = page.locator('#onContinue, a, button').filter({ hasText: /continue to website|zur website/i });
    const n = await btn.count();
    if (n > 0) {
      await btn.first().click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 });
    } else {
      // Direkt per ID versuchen
      const direct = page.locator('#onContinue');
      if (await direct.count() > 0) {
        await direct.click();
        await page.waitForLoadState('networkidle', { timeout: 20_000 });
      }
    }
  } catch (_) {}

  // Cookie-Banner schliessen
  try {
    const cookieBtn = page.locator('button, a').filter({
      hasText: /alle ablehnen|alle akzeptieren|ablehnen|akzeptieren|accept all|reject all/i,
    });
    if (await cookieBtn.count() > 0) {
      await cookieBtn.first().click();
      await page.waitForTimeout(300);
    }
  } catch (_) {}

  // Modals + Overlays ausblenden
  await page.evaluate(() => {
    const selectors = [
      '#borlabs-cookie', '.borlabs-cookie', '[id*="cookie"]',
      '[class*="cookie-banner"]', '[class*="cookiebanner"]',
      '[class*="cookie-consent"]', '[class*="consent"]',
      '[class*="cc-"]', '[data-borlabs]',
      'div[class*="modal"]', 'div[class*="overlay"]', '.modal-backdrop',
    ];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(el => {
        const cs = getComputedStyle(el);
        const z  = parseInt(cs.zIndex || '0', 10);
        if ((cs.position === 'fixed' || cs.position === 'absolute') && z > 100) {
          el.style.setProperty('display', 'none', 'important');
        }
      });
    }
    document.body.style.overflow = '';
  });

  // Fonts abwarten
  await page.evaluate(() => document.fonts.ready);

  // Alle sichtbaren Bilder und SVG-img vollstaendig laden
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('img')].filter(img => {
      const cs = getComputedStyle(img);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    });
    await Promise.allSettled(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load',  resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
  });

  // Settle-Pause: Animationen, CSS-Transitions, lazy-load
  await page.waitForTimeout(300);

  return page;
}

// ══════════════════════════════════════════════════════════════════════════════
// HEADER-MODUS
// ══════════════════════════════════════════════════════════════════════════════
if (isHeaderMode) {
  const prefix = outFile.replace(/\.png$/i, '');

  // Hilfsfunktion: Element screenshot mit Dimensions-Ausgabe
  async function shootElement(page, selector, outPath, fallbackH = 160) {
    const dim = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    }, selector);

    if (!dim || dim.h === 0) {
      // Fallback: Clip von oben mit festem Fallback
      await page.screenshot({
        path: outPath,
        clip: { x: 0, y: 0, width: page.viewportSize().width, height: fallbackH },
        fullPage: false,
      });
      return { fallback: true, w: page.viewportSize().width, h: fallbackH };
    }

    // Element exakt screenshotten (Playwright screenshotet ab Oberkante des Elements)
    const el = page.locator(selector).first();
    await el.screenshot({ path: outPath });
    return { fallback: false, w: dim.w, h: dim.h };
  }

  // 1) Header oben (1280px)
  {
    const page = await openPage(viewportWidth);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(50);

    const dim = await shootElement(
      page,
      '#site-header, #header, header',
      `${prefix}_top.png`,
    );
    console.log(`Header-Top:      ${prefix}_top.png  [${dim.w}x${dim.h}]${dim.fallback ? ' (Fallback)' : ''}`);
    await page.close();
  }

  // 2) Sticky nach Scroll (1280px)
  {
    const page = await openPage(viewportWidth);
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
    await page.waitForTimeout(800); // Scroll-Listener + Transition 0.3s

    // Sticky per JS einblenden (headless Scroll-Events koennen den Listener verpassen)
    await page.evaluate(() => {
      const sticky = document.getElementById('sticky-header') ||
                     document.querySelector('.stickyheader')   ||
                     document.querySelector('[id*="sticky"]');
      if (sticky) {
        sticky.classList.add('is-visible');
        sticky.style.opacity      = '1';
        sticky.style.pointerEvents = 'auto';
      }
    });
    await page.waitForTimeout(200);

    const stickySelector = '#sticky-header, .stickyheader, [id*="sticky"]';
    const dim = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    }, stickySelector);

    if (dim && dim.h > 0) {
      const el = page.locator(stickySelector).first();
      await el.screenshot({ path: `${prefix}_sticky.png` });
      console.log(`Header-Sticky:   ${prefix}_sticky.png  [${dim.w}x${dim.h}]`);
    } else {
      // Fallback: Clip des fixed-Elements (y=0)
      await page.screenshot({
        path: `${prefix}_sticky.png`,
        clip: { x: 0, y: 0, width: viewportWidth, height: 160 },
        fullPage: false,
      });
      console.log(`Header-Sticky:   ${prefix}_sticky.png  (Fallback 160px)`);
    }
    await page.close();
  }

  // 3) Dropdown offen (1280px)
  {
    const page = await openPage(viewportWidth);
    await page.evaluate(() => window.scrollTo(0, 0));
    // Erstes Flyout-LI per JS aufmachen
    await page.evaluate(() => {
      const li = document.querySelector('.hd-item--dd, li.floatbox, header li:has(ul)');
      if (li) {
        const dd = li.querySelector('.hd-dd, ul.level_2, ul ul');
        if (dd) dd.style.setProperty('display', 'block', 'important');
      }
    });
    await page.waitForTimeout(200);

    // Clip: von oben bis Unterkante des offenen Dropdowns
    const clip = await page.evaluate(() => {
      const header = document.querySelector('#site-header, #header, header');
      const dd     = document.querySelector('.hd-dd, ul.level_2, header ul ul');
      const hr = header ? header.getBoundingClientRect() : { bottom: 160 };
      const dr = dd     ? dd.getBoundingClientRect()     : { bottom: hr.bottom };
      const bottom = Math.max(hr.bottom, dr.bottom) + 10;
      return { x: 0, y: 0, width: window.innerWidth, height: Math.round(bottom) };
    });
    await page.screenshot({ path: `${prefix}_dropdown.png`, clip, fullPage: false });
    console.log(`Header-Dropdown: ${prefix}_dropdown.png  [${clip.width}x${clip.height}]`);
    await page.close();
  }

  // 4) Mobil 375px
  {
    const page = await openPage(375);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(50);

    const dim = await shootElement(
      page,
      '.hd-mobile, #site-header, #header, header',
      `${prefix}_mobile.png`,
      75,
    );
    console.log(`Header-Mobile:   ${prefix}_mobile.png  [${dim.w}x${dim.h}]${dim.fallback ? ' (Fallback)' : ''}`);
    await page.close();
  }

  await browser.close();
  process.exit(0);
}

// ══════════════════════════════════════════════════════════════════════════════
// FOOTER-MODUS
// ══════════════════════════════════════════════════════════════════════════════
const page = await openPage();
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);

const footerBox = await page.evaluate(() => {
  const candidates = [
    document.querySelector('footer'),
    document.querySelector('#footer'),
    document.querySelector('[class*="footer"]'),
    document.querySelector('.mod_article:last-of-type'),
  ].filter(Boolean);

  const bodyH = document.body.scrollHeight;
  const vpW   = window.innerWidth;

  let best = null;
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    const top  = rect.top + window.scrollY;
    if (!best || top < best.top) best = { el, top };
  }

  if (best) {
    const puffer = 80;
    const top = Math.max(0, best.top - puffer);
    return { x: 0, y: top, width: vpW, height: bodyH - top };
  }

  const top = Math.floor(bodyH * 0.60);
  return { x: 0, y: top, width: vpW, height: bodyH - top };
});

const out = resolve(outFile);

if (footerBox && footerBox.height > 0) {
  await page.screenshot({
    path: out,
    clip: { x: footerBox.x, y: footerBox.y, width: footerBox.width, height: footerBox.height },
    fullPage: false,
  });
  console.log(`Screenshot gespeichert: ${out} (${viewportWidth}px, Footer-Clip)`);
} else {
  await page.screenshot({ path: out, fullPage: true });
  console.log(`Screenshot gespeichert (ganzseitig): ${out}`);
}

await browser.close();
