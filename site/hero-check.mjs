import { chromium } from 'playwright';

const browser = await chromium.launch();
for (const w of [1280, 1536, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('aw_consent', JSON.stringify({ v: 1, necessary: true, analytics: false, maps: false })));
  await page.goto('http://localhost:4321/', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const h = await page.evaluate(() => Math.round(document.querySelector('.hero-section').getBoundingClientRect().height));
  await page.screenshot({ path: `audit-mobile/hero-${w}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h + 260, 800) } });
  console.log(`${w}px hero-hoehe=${h}px → audit-mobile/hero-${w}.png`);
  await ctx.close();
}
await browser.close();
