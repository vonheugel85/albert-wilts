// scripts/newsletter-body.mjs
// Erzeugt den Body der woechentlichen Angebots-Kampagne fuer Listmonk aus src/data/angebote.js,
// damit Website und Newsletter nicht auseinanderlaufen. Erstmals KW 47 (15.11.2026), vorher
// wurde der Body von Hand geschrieben.
//
// Aufruf:
//   node scripts/newsletter-body.mjs --intro-datei intro.txt            > body.html   (letzte Woche in `wochen`)
//   node scripts/newsletter-body.mjs --woche 0 --intro "Text ..."       > body.html   (bestimmter Index)
//
// Der Einleitungstext ist Pflicht und kommt pro Woche neu (ein Absatz, Sie-Ansprache, Regeln aus
// CLAUDE.md). Alles andere kommt aus den Daten: Mittagsgericht, Angebote in Dateireihenfolge,
// Gueltigkeitszeile, Saison-Block aus `saisonHinweis` (entfaellt, wenn null).
//
// Der Body ist nur der Mittelteil. Kopf (Logo) und Fuss (Firmierung, Abmelden, Impressum,
// Datenschutz) liefert das Listmonk-Template "Albert Wilts" (id 5). Der Block "Wo Sie uns finden"
// steht hier fest im Skript; Markttage und Ladenzeiten muessen zu /wochenmarkt und /ladenverkauf
// passen (Fakten in CLAUDE.md).
//
// Nicht-ASCII-Zeichen werden als numerische Entitaeten geschrieben, das Euro-Zeichen als &euro;.
// Das Skript prueft den Text zusaetzlich auf die harten Schreibregeln und bricht bei Treffern ab.
//
// Weiter geht es per Listmonk-API (siehe docs/newsletter-listmonk.md, Abschnitt Kampagnen):
// POST /api/campaigns mit body aus dieser Datei, template_id 5, send_at, danach
// PUT /api/campaigns/<id>/status {"status":"scheduled"}.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const hier = dirname(fileURLToPath(import.meta.url));
const { wochen, ortLabel, saisonHinweis } = await import(join(hier, '..', 'src', 'data', 'angebote.js'));

// ── Argumente ──
const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const wocheIndex = arg('--woche') !== undefined ? Number(arg('--woche')) : wochen.length - 1;
const woche = wochen[wocheIndex];
if (!woche) {
  console.error(`Keine Woche mit Index ${wocheIndex}. Vorhanden: 0 bis ${wochen.length - 1}.`);
  process.exit(1);
}
let intro = arg('--intro');
if (!intro && arg('--intro-datei')) intro = readFileSync(arg('--intro-datei'), 'utf8').trim();
if (!intro) {
  console.error('Einleitungstext fehlt: --intro "Text" oder --intro-datei pfad.txt');
  process.exit(1);
}

// ── Schreibregeln (CLAUDE.md), harte Treffer brechen ab ──
const alleTexte = [intro, woche.zeitraum.label, woche.mittagsgericht.titel, woche.mittagsgericht.beschreibung,
  ...woche.angebote.flatMap((a) => [a.titel, a.beschreibung, a.einheit]),
  ...(saisonHinweis ? [saisonHinweis.titel, saisonHinweis.text] : [])];
const regeln = [
  [/[–—]| - /, 'Gedankenstrich'],
  [/ & /, 'kaufmaennisches Und'],
  [/\*innen|:innen/, 'Gendersternchen'],
  [/\bscheinbar\b/, '"scheinbar" statt "anscheinend"'],
  [/Hofladen|Lagerverkauf/, 'Der Laden heisst Ladenverkauf'],
  [/\b(ae|oe|ue)\b/i, 'Umschrift statt Umlaut'],
];
for (const t of alleTexte) {
  for (const [re, grund] of regeln) {
    if (re.test(t)) {
      console.error(`Schreibregel verletzt (${grund}): ${t}`);
      process.exit(1);
    }
  }
}

// ── Bausteine ──
const esc = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/[ -￿]/g, (c) => `&#${c.charCodeAt(0)};`)
  .replace(/&#8364;/g, '&euro;');
const preis = (p) => esc(p).replace(' ', '&nbsp;');
const orte = (o) => esc(o.map((k) => ortLabel[k]).join(' und '));
const F = 'font-family:Arial,Helvetica,sans-serif;';
const G = "font-family:Georgia,'Times New Roman',serif;";

const zeile = (a, letzte) => {
  const bb = letzte ? '' : 'border-bottom:1px solid #EFEFEF;';
  return `  <tr>
    <td style="padding:14px 0;${bb}">
      <span style="${F}font-size:16px;font-weight:bold;color:#3B3C42;">${esc(a.titel)}</span><br>
      <span style="${F}font-size:14px;line-height:21px;color:#555555;">${esc(a.beschreibung)}</span><br>
      <span style="${F}font-size:12px;color:#4F7146;">${orte(a.orte)}</span>
    </td>
    <td align="right" valign="top" style="padding:14px 0 14px 12px;${bb}white-space:nowrap;">
      <span style="${G}font-size:20px;font-weight:bold;color:#EF7F1A;">${preis(a.preis)}</span><br>
      <span style="${F}font-size:12px;color:#7F7F7F;">${esc(a.einheit)}</span>
    </td>
  </tr>`;
};

const m = woche.mittagsgericht;
const zeilen = woche.angebote.map((a, i, arr) => zeile(a, i === arr.length - 1)).join('\n');

const saison = saisonHinweis ? `<!-- Saison-Block -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
  <tr>
    <td style="background-color:#EDF1EA;padding:18px 20px;">
      <span style="${G}font-size:19px;line-height:26px;color:#3B3C42;">${esc(saisonHinweis.titel)}</span>
      <p style="${F}font-size:14px;line-height:22px;color:#555555;margin:8px 0 0;">${esc(saisonHinweis.text)}</p>
    </td>
  </tr>
</table>

` : '';

const body = `<h1 style="${G}font-weight:normal;font-size:26px;line-height:34px;color:#3B3C42;margin:0 0 14px;">Moin aus Upgant-Schott!</h1>

<p style="${F}font-size:16px;line-height:26px;color:#555555;margin:0 0 24px;">
  ${esc(intro)}
</p>

<!-- Mittagsgericht -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
  <tr>
    <td style="background-color:#EDF1EA;border-left:4px solid #4F7146;padding:18px 20px;">
      <span style="display:inline-block;background-color:#4F7146;color:#ffffff;${F}font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;">${esc(m.badge)}</span>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        <tr>
          <td style="${G}font-size:19px;line-height:26px;color:#3B3C42;">${esc(m.titel)}</td>
          <td align="right" style="${G}font-size:22px;font-weight:bold;color:#EF7F1A;white-space:nowrap;">${preis(m.preis)}<br><span style="${F}font-size:12px;font-weight:normal;color:#7F7F7F;">${esc(m.einheit)}</span></td>
        </tr>
      </table>
      <p style="${F}font-size:14px;line-height:22px;color:#555555;margin:6px 0 0;">${esc(m.beschreibung)}</p>
    </td>
  </tr>
</table>

<h2 style="${G}font-weight:normal;font-size:22px;line-height:30px;color:#3B3C42;margin:0 0 6px;">Unsere Angebote der Woche</h2>

<!-- Angebote -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
${zeilen}
</table>

<!-- Gueltigkeit -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
  <tr>
    <td align="center">
      <span style="display:inline-block;background-color:#4F7146;color:#ffffff;${F}font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:6px 12px;">${esc(woche.zeitraum.label)}, solange der Vorrat reicht</span>
    </td>
  </tr>
</table>

${saison}<!-- Button -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="background-color:#EF7F1A;border-radius:5px;">
            <a href="https://albert-wilts.de/aktuelle-angebote/" style="display:inline-block;padding:12px 28px;${F}font-size:16px;color:#ffffff;text-decoration:none;">Alle Angebote ansehen</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Wo Sie uns finden -->
<h2 style="${G}font-weight:normal;font-size:22px;line-height:30px;color:#3B3C42;margin:0 0 12px;">Wo Sie uns finden</h2>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:1px solid #E9E9E9;">
  <tr>
    <td style="background-color:#4F7146;padding:10px 16px;${G}font-size:16px;color:#ffffff;">Unsere Wochenm&auml;rkte</td>
  </tr>
  <tr>
    <td style="padding:6px 16px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${F}font-size:14px;line-height:22px;color:#555555;">
        <tr><td width="130" style="padding:6px 0;border-bottom:1px solid #EFEFEF;font-weight:bold;color:#3B3C42;">Dienstag</td><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;">Emden</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;font-weight:bold;color:#3B3C42;">Mittwoch</td><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;">Norderney</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;font-weight:bold;color:#3B3C42;">Donnerstag</td><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;">Emden-Borssum</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;font-weight:bold;color:#3B3C42;">Freitag</td><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;">Emden</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;color:#3B3C42;">Samstag</td><td style="padding:6px 0;">Emden</td></tr>
      </table>
    </td>
  </tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;border:1px solid #E9E9E9;">
  <tr>
    <td style="background-color:#4F7146;padding:10px 16px;${G}font-size:16px;color:#ffffff;">Ladenverkauf Upgant-Schott</td>
  </tr>
  <tr>
    <td style="padding:12px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${F}font-size:14px;line-height:22px;color:#555555;">
        <tr><td width="130" style="padding:6px 0;border-bottom:1px solid #EFEFEF;font-weight:bold;color:#3B3C42;">Adresse</td><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;">Hansestra&szlig;e 4, 26529 Upgant-Schott</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;font-weight:bold;color:#3B3C42;">Freitag</td><td style="padding:6px 0;border-bottom:1px solid #EFEFEF;">8 bis 18 Uhr, durchgehend ge&ouml;ffnet</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;color:#3B3C42;">Rund um die Uhr</td><td style="padding:6px 0;">Wilts Box 24/7 auf dem Betriebsgel&auml;nde</td></tr>
      </table>
    </td>
  </tr>
</table>`;

process.stdout.write(body + "\n");
