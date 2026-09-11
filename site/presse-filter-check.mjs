import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.addInitScript(() => localStorage.setItem('aw_consent', JSON.stringify({ v: 1, necessary: true, analytics: false, maps: false })));
await page.goto('http://localhost:4321/presse', { waitUntil: 'load' });
await page.waitForTimeout(400);

const tabs = await page.$$('.presse-tab');
for (const tab of tabs) {
  const key = await tab.getAttribute('data-filter');
  const expected = Number(await tab.$eval('.presse-tab-count', (e) => e.textContent));
  await tab.click();
  await page.waitForTimeout(350);
  const r = await page.evaluate((k) => {
    const cards = [...document.querySelectorAll('#presse-grid .pc')];
    const visible = cards.filter((c) => getComputedStyle(c).display !== 'none' && getComputedStyle(c).opacity === '1');
    const wrongKat = visible.filter((c) => k !== 'alle' && c.dataset.kategorie !== k).length;
    const dates = visible.map((c) => c.dataset.datum);
    const sorted = dates.every((d, i) => i === 0 || dates[i - 1] >= d);
    const active = document.querySelector('.presse-tab[aria-selected="true"]')?.dataset.filter;
    const hinweis = document.getElementById('presse-hinweis')?.textContent;
    return { visible: visible.length, wrongKat, sorted, active, hinweis };
  }, key);
  const ok = r.visible === expected && r.wrongKat === 0 && r.sorted && r.active === key;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${key.padEnd(10)} sichtbar=${r.visible}/${expected} falsch=${r.wrongKat} sortiert=${r.sorted}  „${r.hinweis}“`);
}
await browser.close();
