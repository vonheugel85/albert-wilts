// scripts/probe.mjs
// Zieht computed styles vom Staging-Footer und schreibt sie nach tmp/staging_computed.json.
// Aufruf: node scripts/probe.mjs
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const URL = 'https://wizardly-gauss.92-205-58-98.plesk.page/';
const OUT  = 'tmp/staging_computed.json';

mkdirSync('tmp', { recursive: true });

const browser = await chromium.launch();
const page    = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await page.goto(URL, { waitUntil: 'networkidle', timeout: 30_000 });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);

const data = await page.evaluate(() => {
  function pick(sel, props, pseudo) {
    const el = document.querySelector(sel);
    if (!el) return { _error: `${sel} nicht gefunden` };
    const s = getComputedStyle(el, pseudo ?? null);
    const out = { _selector: sel };
    if (pseudo) out._pseudo = pseudo;
    for (const p of props) out[p] = s.getPropertyValue(p).trim();
    const r = el.getBoundingClientRect();
    out._renderedWidth  = Math.round(r.width)  + 'px';
    out._renderedHeight = Math.round(r.height) + 'px';
    return out;
  }

  const results = {};

  results.footer = pick('#footer', ['background-color', 'padding-top', 'padding-bottom']);
  results.footerBefore = pick('#footer', ['background-image', 'height', 'width'], '::before');
  results.footerInside = pick('#footer .inside', ['max-width', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right']);

  const cols = document.querySelectorAll('#footer .autogrid_row .column');
  results.columns = Array.from(cols).map((el, i) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      index: i,
      renderedWidth: Math.round(r.width) + 'px',
      marginLeft: s.marginLeft,
      marginRight: s.marginRight,
    };
  });

  if (cols.length >= 2) {
    const r0 = cols[0].getBoundingClientRect();
    const r1 = cols[1].getBoundingClientRect();
    results.columnGapMeasured = Math.round(r1.left - r0.right) + 'px';
  }

  results.headline = pick('#footer .ce_headline.h4', ['font-family', 'font-size', 'font-weight', 'color', 'line-height']);
  results.text = pick('#footer .ce_text p', ['font-size', 'line-height', 'color', 'font-family']);
  results.strong = pick('#footer .ce_text strong', ['font-weight', 'color']);
  results.tableTd = pick('#footer .ce_table table td', ['padding', 'border-bottom', 'font-size', 'color', 'line-height']);
  results.signet = pick('#footer img', ['opacity', 'width', 'height']);
  results.bottom = pick('#bottom', ['background-color']);
  results.bottomInside = pick('#bottom .inside', ['padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'color', 'font-size']);

  return results;
});

writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`Computed styles gespeichert: ${OUT}`);

console.log('\n--- Zusammenfassung ---');
const s = data;
console.log('footer bg:          ', s.footer?.['background-color']);
console.log('footer::before h:   ', s.footerBefore?.height);
console.log('footer inside pad:  ', s.footerInside?.['padding-top'], '/', s.footerInside?.['padding-left']);
console.log('footer inside max-w:', s.footerInside?.['max-width']);
console.log('columns count:      ', s.columns?.length);
console.log('column widths:      ', s.columns?.map(c => c.renderedWidth).join(', '));
console.log('column gap:         ', s.columnGapMeasured);
console.log('headline font:      ', s.headline?.['font-family'], s.headline?.['font-size'], s.headline?.['font-weight'], s.headline?.color);
console.log('text font-size:     ', s.text?.['font-size'], '/', s.text?.['line-height']);
console.log('text color:         ', s.text?.color);
console.log('strong fw:          ', s.strong?.['font-weight']);
console.log('td padding:         ', s.tableTd?.padding);
console.log('td border-bottom:   ', s.tableTd?.['border-bottom']);
console.log('td font-size:       ', s.tableTd?.['font-size']);
console.log('signet opacity:     ', s.signet?.opacity);
console.log('signet width:       ', s.signet?._renderedWidth);
console.log('bottom bg:          ', s.bottom?.['background-color']);
console.log('bottom inside pad:  ', s.bottomInside?.['padding-top'], '/', s.bottomInside?.['padding-left']);
console.log('bottom color:       ', s.bottomInside?.color);
console.log('bottom font-size:   ', s.bottomInside?.['font-size']);

await browser.close();
