// scripts/preflight.mjs
// Faengt Schreibzeit-Fehler lokal ab, bevor sie eine Review-Runde kosten.
// Aufruf: node scripts/preflight.mjs  (oder via npm run preflight)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'src';
const EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.md', '.mdx']);

// Denylist bekannter Umschriften (erweiterbar). Bewusst KEINE breite
// ae/oe/ue-Regex, sonst zu viele False-Positives (neue, Steuer, Wasser ...).
const TRANSLITERATIONS = [
  'ueber', 'fuer', 'koenn', 'moegl', 'loesch', 'oeffn', 'schliess',
  'naechst', 'spaet', 'guenstig', 'waehr', 'gemaess', 'maessig',
  'zusaetz', 'gewaehr', 'behoerde', 'grundsaetz', 'datenuebertrag',
  'strasse', 'fuehl', 'tuer', 'beitraege', 'bestaetig',
  'einschraenk', 'vervielfaelt', 'europaeisch', 'verstoess'
];

// Token-Namen und URL-Slugs, die "Umschrift"-Fragmente legitim enthalten (pro Projekt pflegen).
const ALLOWLIST = [
  'text-gruen', 'bg-gruen', 'border-gruen', '--color-gruen',
  // URL-Slugs aus dem Marken-Anker (enthalten absichtlich ae/oe/ue als URL-Zeichen)
  '/fuer-', '-fuer-', '/ueber-', '/oeffn',
];

const EM_DASH = /\u2014/;
const PLACEHOLDERS = [
  /G-XXXX+/, /\bTODO\b/, /\bFIXME\b/, /lorem ipsum/i,
  /PLATZHALTER/i, /example\.com/
];

const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    if (EXTENSIONS.has(extname(full))) scan(full);
  }
}

function scan(file) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const n = i + 1;
    let work = line;
    for (const allowed of ALLOWLIST) work = work.split(allowed).join('');

    for (const t of TRANSLITERATIONS) {
      if (work.toLowerCase().includes(t)) {
        findings.push(`${file}:${n}  ASCII-Umschrift "${t}"  ->  ${line.trim()}`);
        break;
      }
    }
    if (EM_DASH.test(line)) findings.push(`${file}:${n}  Em-Dash  ->  ${line.trim()}`);
    for (const p of PLACEHOLDERS) {
      if (p.test(line)) { findings.push(`${file}:${n}  Platzhalter ${p}  ->  ${line.trim()}`); break; }
    }
  });
}

walk(ROOT);

if (findings.length) {
  console.error(`\nPreflight: ${findings.length} Treffer\n`);
  for (const f of findings) console.error('  ' + f);
  console.error('\nBitte vor dem Commit beheben.\n');
  process.exit(1);
}
console.log('Preflight: sauber, keine Treffer.');
