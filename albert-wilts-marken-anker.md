# Marken-Anker Albert Wilts

Single Source of Truth für die projektspezifischen Vorgaben. Werte aus dem
freigegebenen Contao-Entwurf und dem Marken-Sheet extrahiert. Punkte mit
`» bestätigen` sind noch offen.

## Stammdaten

- **Entwicklung:** lokal (dev) zuerst · Staging-Domain `» folgt` · Produktiv-Domain `» bestätigen` (vermutlich albert-wilts.de — dort läuft aktuell noch die alte WordPress-Seite)
- **Betreiber / Rechtsform (exakt):** Albert Wilts e. K.
- **Handelsregister:** Amtsgericht Aurich, HRA 100864
- **Registeradresse:** Hansestraße 4, 26529 Upgant-Schott
- **Kontakt:** 04934 91060 (zweite Nummer: 04934 910629) · info@albert-wilts.de
- **USt-IdNr.:** `» eintragen`
- **Verantwortlich i. S. d. § 18 Abs. 2 MStV:** Andree Wilts (Inhaber)  `» bestätigen`

## Marke

- **Wortmarke:** „Albert Wilts" · juristisch „Albert Wilts e. K." (Leerzeichen vor e. K.)
- **Claim:** Frische aus Tradition. · Zusatz „seit 1958"
- **Hero-Headline (exakt):** „Frische verbindet – vom Großverbraucher bis zum Familientisch"
- **Standort-Regel:** immer **Upgant-Schott** (nie Marienhafe oder andere Varianten)
- **Generation:** dritte Generation (Andree, Anke und Anita Wilts) — nicht „4./5." wie auf der alten Seite
- **Logo:** PNG mit transparentem Hintergrund; Footer-Signet als Line-Art (Deckkraft 60 %)

## Farben

| Token | Hex | Verwendung |
|---|---|---|
| `--color-primary` | `#4F7146` | Grün — Primärflächen: Footer, Info-Leiste, Badges, Häkchen; theme-color |
| `--color-primary-hover` | `#3D5A36` | dunkleres Grün für Grün-Button-Hover; Copyright-Band |
| `--color-cta` | `#EF7F1A` | Orange — Buttons, aktive Navigation, Akzente, Newsletter-Band |
| `--color-heading` | `#3B3C42` | Überschriftenfarbe h1–h6 (live gemessen: rgb(59,60,66)) |
| `--color-dark` | `#454545` | dunkle Bildflächen / Platzhalter (nicht für Headlines) |
| `--color-surface` | `#F8F8F8` | helle Sektions-Tönung (live: Medien-Abschnitt, rgb(248,248,248)) |

- **theme-color:** `#4F7146`

## Schriften

- **Headlines:** Caladea (700) — metrisch kompatibel zu Cambria
- **Fließtext:** Arimo (400 / 500 / 700, plus italic) — metrisch kompatibel zu Arial
- Lokal via `@fontsource`, keine Google-CDN (DSGVO). Im Build bereits so umgesetzt.

## Seiten

```
/                                  Startseite
/fuer-gewerbekunden                Für Gewerbekunden (Hub)
  /grosshandel-fuer-gastronomie    Gastronomie
  /grosshandel-fuer-hotellerie     Hotellerie
  /grosshandel-fuer-grossverbraucher  Großverbraucher
  /sortiment-und-leistungen        Sortiment & Leistungen
/wochenmarkt                       Wochenmarkt
/ladenverkauf                      Ladenverkauf
/ueber-uns                         Über uns
/kontakt                           Kontakt
/impressum   /datenschutz          Recht (Footer)
```

## Tonalität

- **Anrede:** Website durchgängig **„Sie"**. (Das informelle „Du" gilt nur intern
  zwischen Agentur und Andree Wilts, nicht auf der Website.)
- **Stil:** warm, bodenständig, ostfriesisch, persönlich („Schnack"), ehrlich —
  nicht überversprechen.
- **Gendersprache:** immer ausgeschriebene Paarform („Kundinnen und Kunden"),
  nie generisches Maskulinum, keine Gender-Kurzformen.
- **Schreibzeit-Regeln (Blueprint 12):** echte Umlaute (ä ö ü ß), keine Em-Dashes.

## Verbotene Formulierungen (Brand-Schutz)

- Agentur-/Startup-Jargon (Onboarding, Roadmap, Stakeholder, skalieren, disruptiv …)
- In Beschwerde-Antworten: kein „wiedergutmachen" (impliziert Schuldeingeständnis),
  kein Eigenlob/Produktstolz. Stattdessen Empathie („das tut uns leid").

## Effekt-Referenz (für die Komponenten, nicht für global.css)

Damit die Anmutung erhalten bleibt — Zielwerte aus dem Entwurf:

- **Button:** Orange-Fläche, weiß, Radius 5px, Padding 10/20px, min-width 140px,
  `transition all .2s ease-out`. „›"-Pfeil davor, rutscht bei Hover 5 → 10px nach
  rechts (`transition margin .1s`). Orange dimmt auf Deckkraft 80 %, Grün dunkelt
  auf `#3D5A36`.
- **Check-Liste:** grünes „✓", 30px Einzug.
- **Navigation:** aktiver/Hover-Punkt mit 6px orangem Unterbalken, Ecken oben
  abgerundet (4px). „Aktuelle Angebote" = gefüllter Orange-Button im Menü.
- **Sticky-Header:** geklont, Schatten `0 4px 16px rgba(0,0,0,.12)`, Höhe 70px.
- **Quicklinks rechts:** fixe Leiste, nur 48px-Icon sichtbar, fährt bei Hover per
  `translateX(0)` heraus (`.35s cubic-bezier(.4,0,.2,1)`). Standard grün,
  „Angebote" orange. Mobil unten statt rechts oben, 38px.
- **Footer:** Grün, geschwungene Oberkante (SVG-Bogen Orange → Grün), Höhe 50px.
- **Hero:** feine 4px-Verlaufslinie oben (weiß → orange → weiß).
- **Newsletter:** weiße Pille (Radius 30px), innenliegender grüner „Anmelden"-Button.

## Maße

- **Content-Container:** fluid `max-width: 85%`, padding-inline 40px (mobil 20px). Bei 1280px VP ergibt das 1088px gerenderter Innenbreite. Kein harter px-Cap bis Probe bei ≥ 1920px bestätigt.
- **Root-Schriftgröße live (Contao):** 15px (fix, kein fluid-Scaling). Astro-Projekt behält Browser-Standard 16px. Daher Headlines in `px` codiert, nicht in `rem`.
- **Headline-Skala (px, live gemessen):**
  - h2 auf heller Fläche: 37.5px / 48.75px / Caladea 700 / margin-bottom 25px
  - h3: 30px / 39px / Caladea 700 / margin-bottom 25px
  - h2 auf Farbfläche (Teaser-Stripe): 28.5px / 37.05px / Caladea 700
- **Buttons (zwei Stile, live gemessen):**
  - CTA (Nav, Hero): bg `#EF7F1A`, Text weiß, padding 10px 20px, radius 5px, 16px / 400
  - Form-Submit (Pille): bg `#4F7146`, Text weiß, padding 15px 20px, radius 30px, 13.5px / 400
- **Copyright-Band:** bg `#3D5A36` (= `--color-primary-hover`), color `rgba(255,255,255,0.4)`, 16.74px
- Button-Radius 5px (CTA) / 30px (Pille) · Body 18px / Zeilenhöhe 1.5

## Was NICHT aus der Schablone übernommen wird

- Sprachumschalter (EN/PL) und Theme-Demo-Reste (`info@yourmail.com`, „75% OFF") —
  waren nur ausgeblendete Template-Inhalte.
- Knowledge-/Blog-Collection vorerst nicht.
- Newsletter: Link-out auf gehostetes Formular statt Embed (Dienst `» offen`).
