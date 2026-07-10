/**
 * shoot-quicklinks.mjs
 * Nimmt einen zugeschnittenen Screenshot des rechten Viewport-Streifens auf,
 * der die Quicklinks-Bar enthaelt.
 * Staging-Messwerte: top:160px, h:256px, w:122px, right:0
 * Schnittbereich (CSS-Pixel): x=1085, y=100, w=195, h=380
 *
 * Aufruf: node scripts/shoot-quicklinks.mjs <url> <praefix>
 * Erzeugt: <praefix>_ql.png  (deviceScaleFactor:2 → 390x760 physikalisch)
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const DEVICE_SCALE = 2;
const VIEWPORT_W   = 1280;
const VIEWPORT_H   = 900;

// Schnittbereich in CSS-Pixeln
const CROP = { x: 1085, y: 100, width: 195, height: 380 };

const [,, url, outPfx] = process.argv;
if (!url || !outPfx) {
  console.error('Aufruf: node scripts/shoot-quicklinks.mjs <url> <praefix>');
  process.exit(1);
}
mkdirSync('tmp', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
  deviceScaleFactor: DEVICE_SCALE,
});

await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

// Plesk-Schutzschirm
try {
  const btn = page.locator('#onContinue, a, button').filter({
    hasText: /continue to website|zur website/i,
  });
  if (await btn.count() > 0) {
    await btn.first().click();
    await page.waitForLoadState('networkidle', { timeout: 20_000 });
  } else {
    const direct = page.locator('#onContinue');
    if (await direct.count() > 0) {
      await direct.click();
      await page.waitForLoadState('networkidle', { timeout: 20_000 });
    }
  }
} catch (_) {}

// Fonts + Bilder abwarten
await page.evaluate(() => document.fonts.ready);
await page.evaluate(async () => {
  const imgs = [...document.images];
  await Promise.allSettled(imgs.map(img => img.decode ? img.decode() : Promise.resolve()));
});
await page.waitForTimeout(400);

const buf = await page.screenshot({ clip: CROP });

const outFile = `${outPfx}_ql.png`;
writeFileSync(outFile, buf);
const physW = CROP.width  * DEVICE_SCALE;
const physH = CROP.height * DEVICE_SCALE;
console.log(`Quicklinks: ${outFile}  [${physW}x${physH}]`);

await browser.close();

