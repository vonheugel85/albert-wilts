import { chromium, devices } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = 'http://localhost:4321';
const routes = [
  '/', '/fuer-gewerbekunden', '/grosshandel-fuer-gastronomie',
  '/grosshandel-fuer-hotellerie', '/grosshandel-fuer-grossverbraucher',
  '/sortiment-und-leistungen', '/wochenmarkt', '/ueber-uns',
  '/kontakt', '/presse', '/impressum', '/datenschutz',
];

await mkdir('audit-mobile', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ ...devices['iPhone 12'] });
const page = await context.newPage();

for (const route of routes) {
  await page.goto(base + route, { waitUntil: 'load' });
  const name = route === '/' ? 'home' : route.replaceAll('/', '');
  await page.screenshot({ path: `audit-mobile/${name}.png`, fullPage: true });

  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const docW = document.documentElement.scrollWidth;
    const offenders = [];
    if (docW > vw) {
      document.querySelectorAll('*').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width > 20 && (b.right > vw + 1 || b.left < -1)) {
          const cls = typeof el.className === 'string' ? el.className.slice(0, 50) : '';
          offenders.push(`${el.tagName.toLowerCase()}.${cls}  right=${Math.round(b.right)} w=${Math.round(b.width)}`);
        }
      });
    }
    return { vw, docW, overflow: docW > vw, offenders: [...new Set(offenders)].slice(0, 12) };
  });

  console.log(`\n=== ${route} ===`);
  console.log(`viewport ${r.vw}px, inhalt ${r.docW}px, ueberlauf: ${r.overflow ? 'JA' : 'nein'}`);
  r.offenders.forEach((o) => console.log('  ' + o));
}

await browser.close();
