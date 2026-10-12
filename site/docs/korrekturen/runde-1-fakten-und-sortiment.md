# Korrekturrunde 1 — Fakten und Sortiment

Grundlage: Kundenfeedback Andree Wilts vom 15.09.2026 (drei Sprachnachrichten) plus
Nachklärungen. Dieses Dokument ist die verbindliche Arbeitsanweisung. Alle hier in
Codeblöcken stehenden Texte sind wörtlich zu übernehmen, inklusive Umlauten.

## Grundregeln für diesen Auftrag

- Der Kunde prüft sehr genau. Keine Zusatzänderungen, keine stilistischen
  Umformulierungen außerhalb der hier genannten Stellen.
- Echte Umlaute und ß. Keine Gedankenstriche (weder Halbgeviert noch Geviert).
- Sie-Ansprache auf allen Seiten.
- Bestehende Komponenten und `.sub-*`-Klassen weiterverwenden, keine neuen
  Layout-Systeme erfinden.
- Jede Datei vor der Änderung vollständig lesen.
- Neue CSS-Regeln ausschließlich nach `src/styles/subpages.css`, niemals in einen
  `<style>`-Block einer Seite (Tailwind-v4-Scanner bricht an dynamischem JS).
- Kein Commit am Ende. Manuel schaut vorher drüber.

---

## Teil 1 — Faktenfehler Wochenmarkt (höchste Priorität)

**Datei:** `src/pages/wochenmarkt.astro`

**Fakt:** Auf dem Wochenmarkt verkauft Albert Wilts ausschließlich **Eier und
Geflügel**. Kein Obst, kein Gemüse, keine Exoten, keine Kartoffeln. Der Kunde hat
diesen Punkt ausdrücklich als "ganz entscheidenden Faktor" markiert.

### 1a) Zeile 9, `title`

```
Wochenmarkt Emden und Norderney | Frische Eier und Geflügel | Albert Wilts
```

### 1b) Zeile 10, `description`

```
Besuchen Sie Albert Wilts auf dem Wochenmarkt in Emden und auf Norderney. Frische Eier, Geflügel und ein persönlicher Schnack mit Anke Wilts.
```

### 1c) Zeile 37, Einleitungsabsatz

Der Halbsatz `hier leuchten saisonale Früchte um die Wette, ` wird ersatzlos
entfernt. Der übrige Absatz bleibt unverändert.

### 1d) Karte 2 ersetzen

Alt: `<h3>Obst und Gemüse</h3>` mit Kartoffeln, Äpfeln, Spargel, Beeren.

Neu:

```html
<h3>Frisches Geflügel</h3>
<p>Hähnchen und Pute in bester Qualität, frisch an der Theke und auf Wunsch zugeschnitten.</p>
```

### 1e) Karte 4 ersetzen

Alt: `<h3>Exoten</h3>`.

Neu:

```html
<h3>Kikok Maishähnchen</h3>
<p>Kikok, das ganz besondere Maishähnchen. Fragen Sie Anke Wilts danach, sie erklärt Ihnen gern den Unterschied.</p>
```

Hintergrund: Der Claim "Kikok, das ganz besondere Maishähnchen" wird von Anke Wilts
am Marktstand aktiv verwendet und soll bewusst weitergeführt werden.

### 1f) Karte 3 "Manufaktur to go"

Nur das Wort "hausgemachten" streichen (siehe Teil 3, Herkunftsfrage):

```html
<p>Ideal für die schnelle Küche zu Hause, etwa unsere Geflügelsalate oder vorbereiteten Pfannengerichte.</p>
```

### 1g) Zeile 165

`oder verraten Ihnen, welches Gemüse gerade besonders aromatisch ist`
wird zu
`oder verraten Ihnen, was sich gerade besonders lohnt`.

### 1h) Vollständigkeitsprüfung

Die gesamte Datei anschließend nach weiteren Erwähnungen von Obst, Gemüse,
Kartoffeln, Spargel, Beeren, Äpfeln, Früchten und Exoten durchsuchen. Jede weitere
Fundstelle melden, bevor sie geändert wird.

---

## Teil 2 — Molkerei entfernen

**Fakt:** Albert Wilts führt **keine Molkereiprodukte**.

### 2a) `src/pages/sortiment-und-leistungen.astro`, Karte "Eier und Molkerei"

- Überschrift wird `Eier`
- Bild-Label wird `Platzhalter Bild: Frische Eier (Querformat, echtes Foto)`
- Chips "Milch und Sahne" und "Quark und Joghurt" entfallen
- stattdessen ein Chip `Bedarfsgerechte Gebinde`
- Der Textabsatz bleibt inhaltlich bestehen

### 2b) `src/pages/grosshandel-fuer-gastronomie.astro`, Zeile 102

ChipRow-`label` von "Eier und Molkerei" auf `Eier` ändern. `items` bleiben.

### 2c) `src/pages/grosshandel-fuer-grossverbraucher.astro`, Zeile 92

ChipRow-`label` auf `Eier und Bio` ändern. Aus `items` den Eintrag
"Molkerei in Großgebinden" ersatzlos entfernen.

### 2d) `src/pages/fuer-gewerbekunden.astro`, Zeile 101

`vom frischen Fleisch bis zum Eimer Sahne`
wird zu
`vom frischen Fleisch bis zur Kiste Eier`.

### 2e) Ausdrücklich NICHT als Molkerei behandeln

`src/pages/grosshandel-fuer-hotellerie.astro`, Zeile 99: "Spezielle Milchsorten"
steht dort unter "Vegan und Allergiker" und meint pflanzliche Alternativen. Nur
präzisieren zu `Pflanzliche Milchalternativen`, nicht löschen.

---

## Teil 3 — Ready Cut von der eigenen Manufaktur trennen

**Fakt:** Schnittware und Feinkost kommen von einem Partnerbetrieb, nicht aus
eigener Herstellung. Der Partner wird **nicht namentlich genannt** (Entscheidung
Manuel). Als eigene Herstellung dürfen nur die **marinierten Pfannengerichte**
bezeichnet werden.

**Leitlinie für alle Formulierungen:** beschreiben, was der Kunde bekommt, nicht wer
es herstellt. Das Wort "hausgemacht" darf nach dieser Runde nur noch im Zusammenhang
mit marinierten Pfannengerichten vorkommen.

### 3a) `src/pages/sortiment-und-leistungen.astro`, Sektion "Unsere Manufaktur"

H2 wird `Küchenfertig vorbereitet`.

Lead:

```
Wir unterstützen Ihre Küche mit vorbereiteten Produkten, die Ihnen Arbeitszeit sparen, ohne dass die Qualität leidet.
```

Karte 1:

```html
<h3>Feinkost und Schnittware</h3>
<p>Salate, Dips sowie küchenfertig geschnittenes Obst und Gemüse. Frisch angeliefert und sofort einsatzbereit.</p>
```

Karte 2:

```html
<h3>Aus eigener Vorbereitung</h3>
<p>Marinierte Pfannengerichte wie unser Geschnetzeltes, abgeschmeckt nach eigener Art. Keine Industrieware, sondern Handarbeit aus unserem Haus.</p>
```

### 3b) `src/pages/fuer-gewerbekunden.astro`, Zeile 91/92

H3 wird `Küchenfertige Unterstützung`.

```
Ob küchenfertige Schnittware oder marinierte Spezialitäten, Sie bekommen Ware, die Ihrem Team Arbeit abnimmt, ohne dass die Qualität leidet.
```

### 3c) `src/components/SortimentSection.astro`, Kategorie Zeile 20/21

```js
titel: 'Küchenfertig & Vorbereitet',
text:  'Marinierte Pfannengerichte, Feinkostsalate und sorgfältig geschnittenes Gemüse.',
```

### 3d) `src/pages/ladenverkauf.astro`, Zeile 78/79

H3 wird `Küchenfertiges`.

```
Feinkostsalate, marinierte Spezialitäten und geschnittenes Gemüse für die schnelle Küche.
```

### 3e) `src/pages/grosshandel-fuer-hotellerie.astro`, Zeile 47

`Unser gewaschenes und geschnittenes Obst` wird zu
`Gewaschenes und geschnittenes Obst`.

### 3f) Ausdrücklich NICHT ändern

Die Ready-Cut-Stellen auf `grosshandel-fuer-gastronomie.astro` (Zeile 59/60) und
`grosshandel-fuer-grossverbraucher.astro` (Zeile 46/47) sowie alle Meta-Titel. Dort
steht nur, dass geliefert wird. Das ist korrekt.

---

## Teil 4 — Sortimentsseite auf acht Kategorien

**Datei:** `src/pages/sortiment-und-leistungen.astro`, Sektion "Unsere Produktwelten"

**Vorgabe des Kunden:** keine Volllistung (das Sortiment umfasst rund 1.200 Artikel),
sondern sieben bis acht Oberkategorien, je Kategorie ein Link zum Hersteller, weil
Gastro-Kunden die Marken kennen.

### 4a) Lead

`Vier Sortimente, eine Lieferung.` wird zu `Acht Sortimente, eine Lieferung.`

### 4b) Vier große Bild-Text-Reihen (bestehende `.sub-showcase`-Struktur)

**Reihe 1 — Obst und Gemüse**
Bild bleibt `/bilder/mit-ki/obst-und-gemuese.webp`, Placeholder-`label` ändern auf
`KI-Bild, wird durch echtes Foto ersetzt`.
Chips: Kartoffeln aus der Leybucht | Saisonaler Spargel | Beeren und Kohlsorten |
Flugananas | Tomaten- und Paprikaspezialitäten
Herstellerlink: Eminent Food — https://eminentfood.nl/de

**Reihe 2 — Kräuter, Kresse und Sprossen** (neu, `--reverse`)
Placeholder **ohne** `src`, `aspect="4/3"`,
`label="Platzhalter Bild: Kresse von Koppert Cress (Querformat, echtes Foto)"`.
Text:

```
Für die feine Küche und den Gasthof. Wir liefern die Zutaten, mit denen Sie einem Teller das letzte Prozent geben.
```

Chips: Wildkräuter | Blattsalatmischungen | Kresse-Sorten | Sprossen
Herstellerlinks:
- Koppert Cress — https://www.koppertcress.com/de/
- Cresco — https://crescobv.com/
- Van Vugt Kruiden — https://www.vanvugtkruiden.nl/?lang=de
- Van der Plas — https://happysprouts.nl/de/

**Reihe 3 — Fleisch, Wurst und Geflügel**
Bild bleibt `/bilder/mit-ki/fleisch-wurst-gefluegel.webp`, Label analog Reihe 1.
Chips: Rind und Schwein | Kikok Maishähnchen | Ente und Wild |
Norderneyer Seeluftschinken | Aufschnitt
Herstellerlinks:
- Kikok — https://kikok.de/
- Geflügelhof Nobis — https://gefluegelhof-nobis.de/
- Norderneyer Seeluftschinken — https://www.norderneyer-seeluftschinken.de/

**Reihe 4 — Eier** (`--reverse`)
Bild bleibt `eierkartons-braune-eier-ladenverkauf.webp`. Inhalt wie in Teil 2a.

### 4c) Kompaktes Kartenraster darunter (`.sub-cards`, drei bis vier Spalten)

**Kartoffeln und Ready Cut**
Geschälte und geschnittene Kartoffeln sowie küchenfertige Schnittware in
Großgebinden. **Kein Herstellerlink** (Entscheidung Manuel, siehe Teil 3).

**Nüsse und Trockenfrüchte**
Nüsse, Kerne und getrocknete Früchte für Küche, Buffet und Patisserie.
Link: Tovano — https://www.tovano.nl/de/

**Säfte und Fruchtpürees**
Frisch gepresste Säfte sowie Fruchtpürees für Desserts, Bar und Patisserie.
Links: ELKA — https://www.elka-frische.de/ | Ponthier — https://www.ponthier.fr/en/

Darüber einen Astro-Kommentar setzen:

```
TODO: konkrete ELKA-Saftsorten vom Kunden nachtragen, damit erkennbar wird, dass es frisch gepresste Säfte sind und keine Industrieware.
```

**Küchenfertig vorbereitet**
Verweist auf die Sektion aus Teil 3a. Kein Herstellerlink.

**Entfällt:** Die bisherige eigene Kategorie "Getränke" geht in "Säfte und
Fruchtpürees" auf. Das KI-Bild `getraenke.webp` wird nicht mehr referenziert.

### 4d) Herstellerlinks einheitlich

`target="_blank" rel="noopener noreferrer"`, neue Klasse `.sub-brandlink` in
`subpages.css`: klein, grün (#4F7146), dezenter External-Pfeil, mobile Variante im
bestehenden `@media (max-width: 768px)`-Block. In diesem Schritt **nur Textlinks,
keine Logos** (siehe Teil 6).

---

## Teil 5 — Gewerbeseiten angleichen

Die ChipRows auf den drei Branchenseiten dürfen der neuen Acht-Kategorien-Logik nicht
widersprechen.

- `grosshandel-fuer-gastronomie.astro`: neue ChipRow
  `label="Kräuter, Kresse und Sprossen"` mit
  `items={['Wildkräuter', 'Blattsalatmischungen', 'Kresse-Sorten', 'Sprossen']}`
- `grosshandel-fuer-hotellerie.astro`: in "Bar und Restaurant" die `items` um
  `'Fruchtpürees'` ergänzen
- `grosshandel-fuer-grossverbraucher.astro`: unverändert außer der Molkerei-Korrektur
  aus Teil 2c

Keine weiteren Änderungen an diesen Seiten.

---

## Teil 6 — Marken-Abbinder und Marken-Tabs (noch NICHT bauen)

Die Logo-Freigaben der Hersteller liegen laut Kunde vor, die Logodateien liegen aber
noch nicht im Repo. Dieser Teil wird erst umgesetzt, wenn unter
`public/logo/hersteller/` die Dateien liegen. Hier nur zur Vorbereitung dokumentiert,
damit Teil 4 nicht gegen die spätere Struktur arbeitet.

**Geplant:**

1. **Logo-Abbinder:** schmales Band mit allen Herstellerlogos, Graustufen, bei Hover
   farbig. Platzierung auf `/fuer-gewerbekunden` und `/sortiment-und-leistungen`,
   bewusst **nicht** auf der Startseite (verwässert dort die Privatkunden-Ansprache).
2. **Marken-Tabs:** eigene Sektion darunter, Überschrift "Mit wem wir arbeiten".
   Links die vertikale Markenliste, rechts Logo, Bild, kurzer Text und Herstellerlink.
   Auf Mobil dieselbe Struktur als Akkordeon.
3. **Texte:** nie das Unternehmensporträt des Herstellers schreiben, sondern was
   Wilts von dort liefert. Also nicht "Koppert Cress ist ein niederländischer
   Züchter", sondern "Über unsere Partnerschaft mit Koppert Cress bekommen Sie
   Cress-Sorten, die sonst kein Händler in Ostfriesland führt." Wilts ist bei Koppert
   Cress als Vertriebspartner gelistet, das ist ein Verkaufsargument.
4. **Nicht im Abbinder:** der Feinkost- und Schnittware-Partner, passend zur
   Entscheidung, ihn auf der Sortimentsseite nicht zu nennen.

---

## Abschlussprüfung

`npm run build` muss fehlerfrei durchlaufen. Danach ausgeben:

- Liste aller geänderten Dateien mit Zeilennummern
- alle Fundstellen aus Schritt 1h
- Bestätigung, dass im gesamten `src/` kein "Molkerei", "Milch und Sahne", "Quark",
  "Joghurt" und kein "Eimer Sahne" mehr steht
- Bestätigung, dass "hausgemacht" nur noch im Zusammenhang mit marinierten
  Pfannengerichten vorkommt
- Bestätigung, dass auf `wochenmarkt.astro` kein Obst und kein Gemüse mehr beworben
  wird

**Kein Commit.** Manuel prüft zuerst.

---

## Offene Punkte beim Kunden (nicht Teil dieses Auftrags)

- konkrete ELKA-Saftsorten
- Herstellerlogos als Dateien
- echte Fotos als Ersatz für die drei KI-Bilder
  (`obst-und-gemuese`, `fleisch-wurst-gefluegel`, `getraenke`) und für das
  Hotellerie-Frühstücksbuffet
- Produktbilder: Kresse von Koppert Cress, Nüsse, Basics wie Tomate und Gurke
- Chefslist-Link: Ziel und Platzierung noch unklar
- Videos: welche Videos eingebettet werden sollen und woher
- Perspektivbruch im Zeitstrahl auf `/ueber-uns` (Wir-Form gegen dritte Person)
- ob der Norderneyer Seeluftschinken auch ins Endkundensortiment gehört
