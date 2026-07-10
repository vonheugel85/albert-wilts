// scripts/diff-header.mjs
// Vergleicht Staging- und Local-Header-Screenshots mit pixelmatch.
// Bricht bei unterschiedlichen Dimensionen ab, statt still zuzuschneiden.
// Aufruf: node scripts/diff-header.mjs <staging-praefix> <local-praefix> <diff-praefix>
// Beispiel: node scripts/diff-header.mjs tmp/hdr_staging tmp/hdr_local7 tmp/hdr_diff7

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';

const [,, stagingPfx, localPfx, diffPfx] = process.argv;
if (!stagingPfx || !localPfx || !diffPfx) {
  console.error('Aufruf: node scripts/diff-header.mjs <staging-praefix> <local-praefix> <diff-praefix>');
  process.exit(1);
}

const THRESHOLD = 0.12;
const VIEWS = ['top', 'sticky', 'mobile'];

let allOk = true;

for (const view of VIEWS) {
  const pathA = `${stagingPfx}_${view}.png`;
  const pathB = `${localPfx}_${view}.png`;
  const pathD = `${diffPfx}_${view}.png`;

  let ia, ib;
  try { ia = PNG.sync.read(readFileSync(pathA)); } catch (e) { console.error(`FEHLER: ${pathA} nicht lesbar`); allOk = false; continue; }
  try { ib = PNG.sync.read(readFileSync(pathB)); } catch (e) { console.error(`FEHLER: ${pathB} nicht lesbar`); allOk = false; continue; }

  const stagingDim = `${ia.width}x${ia.height}`;
  const localDim   = `${ib.width}x${ib.height}`;

  if (ia.width !== ib.width || ia.height !== ib.height) {
    console.log(`[${view}]  DIMENSIONEN ABWEICHEND  Staging ${stagingDim}  Local ${localDim}  -- kein Diff, echter Befund`);
    allOk = false;
    continue;
  }

  const { width: w, height: h } = ia;
  const od = new PNG({ width: w, height: h });
  const n  = pixelmatch(ia.data, ib.data, od.data, w, h, { threshold: THRESHOLD });
  writeFileSync(pathD, PNG.sync.write(od));

  const pct = ((n / (w * h)) * 100).toFixed(1);
  const ok  = parseFloat(pct) < 6;
  console.log(`[${view}]  ${pct}%  [${w}x${h}]  (${n} px)  ${ok ? 'OK' : 'PRUEFEN'}  -> ${pathD}`);
  if (!ok) allOk = false;
}

console.log(allOk ? '\nAlles im gruenen Bereich.' : '\nMindestens ein Wert ausserhalb Toleranz oder Dimensionsfehler.');
