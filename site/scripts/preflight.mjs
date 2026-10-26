// scripts/preflight.mjs
// Faengt Schreibzeit-Fehler lokal ab, bevor sie eine Review-Runde kosten.
// Aufruf: node scripts/preflight.mjs  (oder via npm run preflight); laeuft seit A2 vor jedem Build.
//
// Geprueft wird nur, was Besucher lesen: Textknoten im Markup und die textfuehrenden
// Attribute (alt, title, label, description, aria-label, placeholder, content, badge, headline,
// teaser, datumLabel, medium, format). Codekommentare, Variablennamen, Klassennamen, Dateipfade
// und CSS bleiben aussen vor, sonst stehen Bezeichner wie pressebeitraege oder .lb-schliessen
// als Treffer da und blockieren den Build (A1, 26.10.2026).
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

// Halbgeviert-, Geviert- und Minusstrich: alle drei sind auf dieser Website unerwuenscht (A1, 26.10.2026)
const DASHES = /[\u2013\u2014\u2212]/;
// Bekannte Platzhalter aus docs/korrekturen/offene-punkte.md: sie warten auf Entscheidungen des
// Kunden und duerfen den Build nicht blockieren. Neue Platzhalter tun es sehr wohl. Erkennung ueber
// Datei und Textmerkmal, nicht ueber Zeilennummern, damit Verschiebungen die Liste nicht entwerten.
const BEKANNTE_PLATZHALTER = [
  { datei: 'src/components/ConsentBanner.astro', merkmal: 'GA_MEASUREMENT_ID' },  // bis Analytics live geht
  { datei: 'src/pages/aktuelle-angebote.astro',  merkmal: 'Wochenblatt' },        // Material fehlt
  { datei: 'src/pages/datenschutz.astro',        merkmal: 'Newsletter-Tool' },    // Anbieter noch offen
];
const istBekannt = (file, zeile) =>
  BEKANNTE_PLATZHALTER.some((b) => file.endsWith(b.datei) && zeile.includes(b.merkmal));

const PLACEHOLDERS = [
  /G-XXXX+/, /\bTODO\b/, /\bFIXME\b/, /lorem ipsum/i,
  /PLATZHALTER/i, /example\.com/
];

const findings = [];

const leerzeichen = (m) => m.replace(/[^\n]/g, ' ');

// Astro-Ausdruecke {...} sind Code oder Datenreferenzen, nie eigener Text. Sie koennen ueber
// mehrere Zeilen gehen, deshalb per Klammerzaehler statt Regex neutralisieren.
function ohneAusdruecke(text) {
  const zeichen = [...text];
  let tiefe = 0;
  for (let i = 0; i < zeichen.length; i++) {
    const c = zeichen[i];
    if (c === '{') { tiefe++; zeichen[i] = ' '; continue; }
    if (c === '}') { if (tiefe > 0) tiefe--; zeichen[i] = ' '; continue; }
    if (tiefe > 0 && c !== '\n') zeichen[i] = ' ';
  }
  return zeichen.join('');
}

// Kommentare neutralisieren, Zeilenstruktur bleibt erhalten (fuer korrekte Zeilennummern).
function ohneKommentare(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, leerzeichen)
    .replace(/<!--[\s\S]*?-->/g, leerzeichen)
    .replace(/(^|[^:/])\/\/[^\n]*/g, (m, vor) => vor + leerzeichen(m.slice(vor.length)));
}

// Sichtbarer Text: Textknoten zwischen Tags plus textfuehrende Attribute. Alles andere
// (Bezeichner, Klassen, Pfade, CSS, JS) wird verworfen.
const TEXT_FELDER = 'alt|title|titel|label|description|aria-label|placeholder|content|badge|headline|teaser|datumLabel|medium|format';
const TEXT_ATTRIBUT = new RegExp(`\\b(?:${TEXT_FELDER})\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{\`([^\`]*)\`\\}|\\{'([^']*)'\\})`, 'g');
const TEXT_FELD = new RegExp(`\\b(?:${TEXT_FELDER})\\s*:\\s*(?:"([^"]*)"|'([^']*)'|\`([^\`]*)\`)`, 'g');

function sichtbarerText(text, file) {
  const ohne = ohneKommentare(text);
  // <style> und <script> entfernen, deren Inhalt ist nie sichtbarer Text
  const rein = ohne
    .replace(/<style[\s\S]*?<\/style>/gi, leerzeichen)
    .replace(/<script[\s\S]*?<\/script>/gi, leerzeichen);
  const zeilen = rein.split('\n');
  const template = ohneAusdruecke(rein).split('\n');

  // Grenze zwischen Frontmatter (Code) und Template (Markup) bestimmen. In reinen Code-Dateien
  // gibt es kein Template, dort zaehlen nur textfuehrende Felder.
  let templateAb = Number.MAX_SAFE_INTEGER;
  if (extname(file) === '.astro' && zeilen[0]?.trim() === '---') {
    const zweite = zeilen.findIndex((z, i) => i > 0 && z.trim() === '---');
    if (zweite > 0) templateAb = zweite + 1;
  } else if (extname(file) === '.md' || extname(file) === '.mdx') {
    templateAb = 0;
  }

  return zeilen.map((zeile, i) => {
    const teile = [];
    if (i >= templateAb) for (const stueck of (template[i] || '').split(/<[^>]*>/)) teile.push(stueck);
    for (const m of zeile.matchAll(TEXT_ATTRIBUT)) teile.push(m[1] ?? m[2] ?? m[3] ?? m[4] ?? '');
    for (const m of zeile.matchAll(TEXT_FELD)) teile.push(m[1] ?? m[2] ?? m[3] ?? '');
    return teile.join(' ');
  });
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    if (EXTENSIONS.has(extname(full))) scan(full);
  }
}

function scan(file) {
  const inhalt = readFileSync(file, 'utf8');
  const zeilen = inhalt.split('\n');
  const text = sichtbarerText(inhalt, file); // nur was Besucher lesen
  const code = ohneKommentare(inhalt).split('\n'); // ohne Kommentare, fuer Platzhalter

  zeilen.forEach((line, i) => {
    const n = i + 1;
    let work = text[i] || '';
    for (const allowed of ALLOWLIST) work = work.split(allowed).join('');

    for (const t of TRANSLITERATIONS) {
      if (work.toLowerCase().includes(t)) {
        findings.push(`${file}:${n}  ASCII-Umschrift "${t}"  ->  ${line.trim()}`);
        break;
      }
    }
    if (DASHES.test(work)) findings.push(`${file}:${n}  Gedankenstrich  ->  ${line.trim()}`);
    if (!istBekannt(file, line)) {
      for (const p of PLACEHOLDERS) {
        if (p.test(code[i] || '')) { findings.push(`${file}:${n}  Platzhalter ${p}  ->  ${line.trim()}`); break; }
      }
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
