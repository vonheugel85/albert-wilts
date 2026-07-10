// scripts/diff.mjs – Pixel-Diff zweier PNG-Dateien
// Aufruf: node scripts/diff.mjs <img1> <img2> <ausgabe>
import { createReadStream, createWriteStream, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [,, file1, file2, outFile] = process.argv;
if (!file1 || !file2 || !outFile) {
  console.error('Aufruf: node scripts/diff.mjs <bild1> <bild2> <ausgabe>');
  process.exit(1);
}

function readPNG(path) {
  return new Promise((resolve, reject) => {
    const buf = readFileSync(path);
    PNG.sync ? resolve(PNG.sync.read(buf)) : createReadStream(path).pipe(new PNG()).on('parsed', function() { resolve(this); }).on('error', reject);
  });
}

// Synchron lesen ist einfacher
const img1 = PNG.sync.read(readFileSync(file1));
const img2 = PNG.sync.read(readFileSync(file2));

// Auf gemeinsame Größe normieren (kleinste Abmessung)
const w = Math.min(img1.width,  img2.width);
const h = Math.min(img1.height, img2.height);

// Bilder auf gleiche Größe croppen (neue Buffer anlegen)
function crop(img, w, h) {
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(img, out, 0, 0, w, h, 0, 0);
  return out;
}
const a = crop(img1, w, h);
const b = crop(img2, w, h);

const diff = new PNG({ width: w, height: h });
const numDiff = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.1 });

import { writeFileSync } from 'node:fs';
writeFileSync(outFile, PNG.sync.write(diff));

const pct = ((numDiff / (w * h)) * 100).toFixed(2);
console.log(`Diff: ${numDiff} Pixel (${pct}%) abweichend`);
console.log(`Ausgabe: ${outFile}`);
