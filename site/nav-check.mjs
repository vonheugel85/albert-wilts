import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.addInitScript(() => localStorage.setItem('aw_consent', JSON.stringify({ v: 1, necessary: true, analytics: false, maps: false })));
await page.goto('http://localhost:4321/', { waitUntil: 'load' });
await page.waitForTimeout(300);

const measure = (sel) => page.evaluate((s) => {
  return [...document.querySelectorAll(s)].map((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const tr = range.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { tag: el.tagName, text: el.textContent.trim().slice(0, 18), boxTop: Math.round(r.top), boxH: Math.round(r.height), textTop: Math.round(tr.top), textMid: Math.round(tr.top + tr.height / 2) };
  });
}, sel);

console.log('=== TOP: .hd-l1 + .hd-cta ===');
console.table(await measure('#site-nav .hd-l1, #site-nav .hd-cta'));

await page.evaluate(() => window.scrollTo(0, 600));
await page.waitForTimeout(400);
console.log('=== STICKY: .sticky-l1 + .sticky-cta ===');
console.table(await measure('#sticky-header .sticky-l1, #sticky-header .sticky-cta'));

await browser.close();
