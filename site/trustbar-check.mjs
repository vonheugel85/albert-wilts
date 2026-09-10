import { chromium } from 'playwright';

const base = 'http://localhost:4321';
const routes = ['/fuer-gewerbekunden', '/wochenmarkt', '/ladenverkauf'];
const widths = [1024, 1280, 1536];

const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'load' });
    const r = await page.evaluate(() => {
      const items = [...document.querySelectorAll('.sub-trustbar-item')];
      const tops = new Set(items.map((el) => Math.round(el.getBoundingClientRect().top)));
      return { count: items.length, rows: tops.size };
    });
    console.log(`${w}px ${route.padEnd(22)} items=${r.count} zeilen=${r.rows} ${r.rows === 1 ? 'OK' : 'UMBRUCH'}`);
  }
  await ctx.close();
}
await browser.close();
