# Korrekturrunde 4 — Inhaltliche Korrekturen nach Kundenfeedback vom 14.10.2026

Grundlage: sechs Sprachnachrichten von Andree Wilts am 14.10.2026 zwischen 10:05
und 11:52, nach seiner Durchsicht von dev.albert-wilts.de.

Diese Runde enthält **nur inhaltliche Korrekturen**. Bilder, Logistik-Karte,
Chefslist und die Status-Anzeige sind bewusst nicht Teil dieses Auftrags, siehe
"Nicht in dieser Runde" am Ende.

## Grundregeln

- Der Kunde prüft sehr genau. Keine Zusatzänderungen außerhalb der genannten Stellen.
- Echte Umlaute und ß. Keine Gedankenstriche. Sie-Ansprache.
- Texte in Codeblöcken wörtlich übernehmen.
- Jede Datei vor der Änderung vollständig lesen.
- Kein Commit am Ende. Manuel prüft zuerst.

---

## Teil 1 — Ponthier: nur gekühlt, nur 1-Kilo-Gebinde

**Fakt:** Wilts bezieht von Ponthier ausschließlich die **gekühlten** Pürees und
ausschließlich im **1-Kilo-Gebinde**. Tiefgekühlte Ware und andere Gebindegrößen
gibt es nicht.

**Wichtig:** Die Angabe "über 55 Sorten" bezieht sich auf das Gesamtsortiment von
Ponthier inklusive Tiefkühlware. Für die gekühlte Linie ist die Sortenzahl kleiner
und uns nicht bekannt. Die Zahl wird deshalb überall ersatzlos gestrichen, nicht
durch eine andere Zahl ersetzt.

**Datei:** `src/pages/sortiment-und-leistungen/saefte-und-fruchtpuerees.astro`

### 1a) Meta-Description (Zeile 25)

```
Frisch gepresste Säfte von ELKA im 3-Liter-Gastro-Gebinde und gekühlte Fruchtpürees von Ponthier im 1-Kilo-Gebinde. Albert Wilts liefert in ganz Ostfriesland.
```

### 1b) SpecRow Fruchtpürees (Zeile 52)

```
items={['Gekühlte Pürees', '1-Kilo-Gebinde', 'Für Patisserie und Bar']}
```

### 1c) Absatz Fruchtpürees (Zeile 66)

```
Von Passionsfrucht über Yuzu bis Sanddorn, durchgehend gekühlt und im 1-Kilo-Gebinde. Jede Sorte hat einen festen Zuckerwert und ein Geschmacksprofil, mit dem sich Süße und Säure im Rezept kalkulieren lassen.
```

### 1d) Markenblock Ponthier

Den Beschreibungstext im Markenblock prüfen. Falls dort tiefgekühlte Ware,
Sortenzahlen oder andere Gebindegrößen vorkommen, entsprechend anpassen. Der
belegbare Kern bleibt: Familienbetrieb aus der französischen Corrèze seit 1946,
feste Werte für Zuckergehalt und Geschmacksprofil je Sorte.

### 1e) Gesamte Seite prüfen

Nach den Begriffen `tiefgekühlt`, `55 Sorten`, `500 g`, `5 kg` und `fünf Kilo`
suchen und jede weitere Fundstelle melden.

---

## Teil 2 — "Vollsortimenter" wird "Frische-Vollsortimenter"

**Fakt:** Wilts ist kein Vollsortimenter, sondern ein Frische-Vollsortimenter.
Trockensortiment und verarbeitete Grundstoffe wie Vollei gehören nicht dazu.

Die acht Fundstellen einzeln anpassen, nicht per Suchen-und-Ersetzen, weil der
Satzbau unterschiedlich ist:

| Datei | Zeile | Neu |
|---|---|---|
| `components/BereicheSection.astro` | 27 | `Produkte: Ready-Cut, Manufaktur & Frische-Vollsortiment` |
| `pages/sortiment-und-leistungen.astro` | 29 | `Vom Feld bis ins Kühlhaus: Entdecken Sie unser Frische-Sortiment für Profis und Genießer.` |
| `pages/grosshandel-fuer-hotellerie.astro` | 96 | `Bündeln Sie Ihren Einkauf. Als Frische-Vollsortimenter decken wir alle Touchpoints Ihres Hauses ab.` |
| `pages/fuer-gewerbekunden.astro` | 101 | `... Verschaffen Sie sich einen Überblick über unser Frische-Sortiment.` (nur das letzte Wort ändern) |
| `pages/grosshandel-fuer-gastronomie.astro` | 96 | `Reduzieren Sie Ihre Lieferantenanzahl und Ihre Prozesskosten. Als Frische-Vollsortimenter decken wir Ihren täglichen Bedarf ab:` |
| `pages/grosshandel-fuer-grossverbraucher.astro` | 88 | `Vereinfachen Sie Ihren Wareneingang. Als Frische-Vollsortimenter decken wir Ihren Frischebedarf komplett ab.` |
| `pages/ueber-uns.astro` | 9 | in der Description `Vollsortimenter` zu `Frische-Vollsortimenter` |
| `pages/ueber-uns.astro` | 51 | `Vom Eierhandel zum Frische-Vollsortimenter` |
| `pages/ueber-uns.astro` | 52 | im Absatz `Aus dem Eierhandel wuchs ein Frische-Vollsortimenter für Obst, Gemüse und Fleisch ...` |

---

## Teil 3 — Vollei entfernen

**Fakt:** Vollei gehört nicht zum Sortiment.

`src/pages/grosshandel-fuer-grossverbraucher.astro`, Zeile 92: Aus der ChipRow
`Eier und Bio` den Eintrag `'Vollei'` ersatzlos entfernen. Die übrigen Einträge
bleiben.

---

## Teil 4 — "Vegan und Allergiker" komplett streichen

**Fakt:** In diesem Bereich ist Wilts nicht aufgestellt. Der Kunde möchte den
kompletten Punkt entfernt haben.

**Datei:** `src/pages/grosshandel-fuer-hotellerie.astro`

- Zeile 99: Die komplette ChipRow `Vegan und Allergiker` ersatzlos entfernen.
- Zeile 12: In der Meta-Description den Teil `vegane Optionen` entfernen. Neue
  Description:

```
Ihr Premium-Großhandel für Hotellerie. Wir optimieren Ihr Frühstücksbuffet: kalkulationssicheres Ready-Cut-Obst, frische Säfte und 6-Tage-Logistik bis Norderney.
```

- Danach die gesamte Seite nach `vegan`, `Allergiker`, `Milchalternativ` und
  `glutenfrei` durchsuchen und jede weitere Fundstelle melden.

---

## Teil 5 — Heinemann als Partner aufnehmen

**Fakt:** Der Kunde hat die frühere Entscheidung revidiert. Heinemann darf bei
Kartoffeln, Ready Cut und Küchenfertigem genannt werden.

**Wichtige Unterscheidung, die im Text erkennbar sein muss:** Geschälte und
geschnittene Ware kommt von Heinemann. Die normalen Kartoffeln kommen weiterhin
aus der Leybucht.

**Unverändert bleibt:** Die Formulierung "Aus eigener Vorbereitung" für die
marinierten Pfannengerichte. Nur dort steht eigene Herstellung.

### 5a) Logo beschaffen

Logo von `https://www.heinemanngmbh.de/` holen und als
`public/logo/hersteller/heinemann.svg` bzw. `.png` ablegen, nach demselben Muster
wie die übrigen Herstellerlogos. Wenn nicht beschaffbar, melden und im Array
`logo: null` setzen, wie bei Cresco.

### 5b) Marken-Array auf der Übersichtsseite

In `src/pages/sortiment-und-leistungen.astro` das Array `hersteller` am Ende, nach
Ponthier, ergänzen:

```js
{ name: 'Heinemann', url: 'https://www.heinemanngmbh.de/', logo: 'heinemann.svg' },
```

### 5c) Kategoriekarte "Kartoffeln und Ready Cut" (Zeile 91/92)

```html
<h3>Kartoffeln und Ready Cut</h3>
<p>Kartoffeln aus der Leybucht, dazu geschälte Ware und küchenfertige Schnittware in Großgebinden von unserem Partner Heinemann.</p>
```

### 5d) Karte "Feinkost und Schnittware" (Zeile 107/108)

```html
<h3>Feinkost und Schnittware</h3>
<p>Salate, Dips sowie küchenfertig geschnittenes Obst und Gemüse von unserem Partner Heinemann aus Wiefelstede. Frisch angeliefert und sofort einsatzbereit.</p>
```

Darunter den Herstellerlink im bestehenden Muster ergänzen:

```html
<p class="sub-brandlinks"><a class="sub-brandlink" href="https://www.heinemanngmbh.de/" target="_blank" rel="noopener noreferrer">Zur Website von Heinemann</a></p>
```

### 5e) Obst-und-Gemüse-Unterseite

Auf `src/pages/sortiment-und-leistungen/obst-und-gemuese.astro` prüfen, ob die
Kartoffeln dort erwähnt sind. Falls ja, sicherstellen, dass dort die Leybucht als
Herkunft steht und nicht der Eindruck entsteht, alle Kartoffeln kämen geschält.

---

## Abschlussprüfung

`npm run build` muss fehlerfrei durchlaufen. Danach ausgeben:

- Liste aller geänderten Dateien mit Zeilen
- Bestätigung, dass im gesamten `src/` kein `Vollei` und kein alleinstehendes
  `Vollsortimenter` ohne `Frische-` mehr steht
- Bestätigung, dass `vegan`, `Allergiker` und `glutenfrei` nirgends mehr vorkommen
- Bestätigung, dass bei Ponthier nirgends mehr `tiefgekühlt`, eine Sortenzahl oder
  eine andere Gebindegröße als 1 Kilo steht
- Status des Heinemann-Logos
- alle Fundstellen aus den Prüfschritten 1e und Teil 4

**Kein Commit.** Manuel prüft zuerst.

---

## Nicht in dieser Runde (blockiert oder offen)

| Punkt | Was fehlt |
|---|---|
| Bilder auf den Unterseiten und bei Über uns | Manuel sortiert und bewertet die Bilder zuerst |
| Chefslist einbinden | Linkziel unbekannt: eigene Wilts-Adresse bei Chefslist oder allgemeiner Login |
| Ferien Ahoi im Pressebereich | PDF liegt beim Kunden, noch nicht geliefert |
| Videos im Pressebereich | Weiterhin unklar, welche Videos und woher |
| Logistik-Karte mit Lieferrouten | Belieferte Orte müssen benannt werden, besonders welche Inseln |
| Status- oder Ampelanzeige im Header | Entscheidung offen: Ampel wäre an sechs von sieben Tagen rot, Vorschlag ist stattdessen eine Tagesstatuszeile |
| Geschichte auf Über uns vervollständigen | Kunde sammelt Material mit der Familie |
