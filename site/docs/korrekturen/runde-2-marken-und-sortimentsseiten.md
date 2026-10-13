# Korrekturrunde 2 — Marken und Sortimentsseiten

Grundlage: Antworten von Andree Wilts vom 13.10.2026 auf den Fragenkatalog, plus
Recherche aller elf Herstellerseiten. Dieses Dokument ist die verbindliche
Arbeitsanweisung. Texte in Codeblöcken sind wörtlich zu übernehmen, inklusive Umlauten.

## Grundregeln

- Der Kunde prüft sehr genau. Keine Zusatzänderungen, keine stilistischen
  Umformulierungen außerhalb der hier genannten Stellen.
- Echte Umlaute und ß. Keine Gedankenstriche. Sie-Ansprache.
- Bestehende Komponenten und `.sub-*`-Klassen weiterverwenden.
- **Bewusst wenig Bebilderung.** Die neuen Unterseiten tragen über Typografie,
  Chips, Karten und Herstellerlogos. Fotos werden später nachgerüstet, ohne dass
  das Layout angefasst werden muss. Wo später ein Bild hinkommt, steht ein
  Astro-Kommentar `BILDPLATZ: <Motiv>`, aber **kein** Placeholder-Element.
- Neue CSS-Regeln ausschließlich nach `src/styles/subpages.css`, nie in einen
  `<style>`-Block einer Seite (Tailwind-v4-Scanner).
- Jede Datei vor der Änderung vollständig lesen.
- Kein Commit am Ende. Manuel prüft zuerst.

---

## Teil 1 — Faktenkorrekturen aus den Kundenantworten

### 1a) Wild von Nobis trennen

**Fakt:** Von Nobis kommen ausschließlich Ente und Gans. Das Wild stammt aus
heimischen Forsten von einem anderen Lieferanten.

In `src/pages/sortiment-und-leistungen.astro` den Chip `Ente und Wild` ersetzen
durch zwei getrennte Chips:

```
Ente und Gans
Wild aus heimischen Forsten
```

Beim Herstellerlink darf Nobis nur noch Ente und Gans zugeordnet sein.

### 1b) Eminent Food entfernen

**Fakt:** Der Kunde hat sich umentschieden. Die Marke soll nicht genannt werden,
weil Wilts bei Tomaten mehrere Marken fährt. Stattdessen allgemeiner formulieren.

- Den kompletten Absatz `<p class="sub-brandlinks">` mit dem Eminent-Food-Link in
  der Kategorie "Obst und Gemüse" ersatzlos entfernen.
- Den Chip `Tomaten- und Paprikaspezialitäten` ersetzen durch:

```
Über 20 Tomatensorten
```

### 1c) ELKA konkretisieren

**Fakt:** Klassiker ist Orangensaft, dazu das weitere ELKA-Sortiment. Gastronomie
wird im 3-Liter-Gebinde für den Offenausschank beliefert, keine kleinen Flaschen.

Den TODO-Kommentar zu den ELKA-Saftsorten entfernen. Der Kategorietext wird:

```
Frisch gepresste Säfte im Gastro-Gebinde sowie Fruchtpürees für Desserts, Bar und Patisserie.
```

### 1d) Norderneyer Seeluftschinken

**Fakt:** Geht in beide Kanäle. Im Großhandel am Stück und geschnitten, im
Ladenverkauf nur geschnitten.

Keine Änderung auf der Sortimentsseite nötig, aber in `src/pages/ladenverkauf.astro`
die Karte "Fleisch und Geflügel" um einen Satz ergänzen:

```
Dazu Norderneyer Seeluftschinken, auf der Insel gereift, für Sie aufgeschnitten.
```

### 1e) Kikok ohne Bezugskette

Der Bezug läuft über einen Zwischenhändler. Auf der Website wird die Bezugskette
**nicht** erwähnt, weder Borgmeier noch ein Zwischenhändler. Es bleibt bei
Produktname, Claim und Link auf kikok.de.

### 1f) Koppert Cress: Linkziel

Der Kunde bestätigt, dass Wilts dort Verkaufspartner ist. Die öffentliche
Partnerseite führt aktuell keine deutschen Händler. Deshalb:

- Verlinkt wird `https://www.koppertcress.com/de/`, **nicht** die Unterseite
  `/verkaufspartner`.
- Formulierung auf der Seite: "Wir sind Vertriebspartner von Koppert Cress."
  Keine Formulierung, die auf eine öffentliche Liste verweist.

---

## Teil 2 — Herstellerlogos beschaffen

Die Logonutzung ist mit allen Herstellern abgesprochen (Auskunft des Kunden).

Lege `public/logo/hersteller/` an und hole die Logos von den Herstellerseiten.
Bevorzugt SVG aus dem Quelltext der Startseite, sonst PNG in der größten
auffindbaren Auflösung. Dateinamen genau so:

| Datei | Quelle |
|---|---|
| `koppert-cress.svg` | https://www.koppertcress.com/de/ |
| `cresco.svg` | https://crescobv.com/ |
| `van-vugt-kruiden.svg` | https://www.vanvugtkruiden.nl/?lang=de |
| `van-der-plas.svg` | https://happysprouts.nl/de/ |
| `kikok.svg` | https://kikok.de/ |
| `gefluegelhof-nobis.svg` | https://gefluegelhof-nobis.de/ |
| `norderneyer-seeluftschinken.svg` | https://www.norderneyer-seeluftschinken.de/ |
| `tovano.svg` | https://www.tovano.nl/de/ |
| `elka-frische.svg` | https://www.elka-frische.de/ |
| `ponthier.svg` | https://www.ponthier.fr/en/ |

Regeln dafür:

- Dateiendung an das tatsächliche Format anpassen (`.svg` oder `.png`).
- Logos mit weißer Schrift auf transparentem Grund sind unbrauchbar, weil sie auf
  hellem Hintergrund stehen. In dem Fall die dunkle oder farbige Variante suchen.
- Was nicht beschaffbar ist, **melden** und im Markenblock die Textvariante ohne
  Logo rendern. Nicht selbst nachbauen, nicht ersetzen.
- Am Ende eine Liste ausgeben: Marke, Dateiname, Format, Pixelmaße, Herkunfts-URL.

---

## Teil 3 — Neue CSS-Bausteine in `subpages.css`

### 3a) Logo-Abbinder `.sub-logobar`

Schmales Band mit allen Herstellerlogos nebeneinander, mittig, umbrechend.
Logos in Graustufen mit reduzierter Deckkraft, bei Hover farbig und voll deckend.
Logohöhe 36px, Abstand 40px, mobil Höhe 28px und Abstand 24px.
Hintergrund `#F8F8F8`, Innenabstand oben und unten 40px.

### 3b) Markenblock `.sub-brands` / `.sub-brand`

Raster mit zwei Spalten ab 768px, darunter einspaltig. Je Marke:
Logo (max. Höhe 48px, linksbündig), darunter Name als h3, darunter zwei bis drei
Sätze, darunter der Herstellerlink in der bestehenden Klasse `.sub-brandlink`.
Karte mit hellem Hintergrund `#fff`, Innenabstand 28px, dezenter Rahmen `#E9E9E9`.

### 3c) Kategoriekarte mit Button `.sub-catcard`

Erweiterung der bestehenden `.sub-card` um einen Fußbereich mit Textlink
"Mehr erfahren" samt Pfeil, analog `.sub-navcard-more`.

---

## Teil 4 — Übersichtsseite umbauen

**Datei:** `src/pages/sortiment-und-leistungen.astro`

Die Seite wird zur Übersicht. Die vier großen Bild-Text-Reihen (`.sub-showcase`)
entfallen vollständig, damit verschwinden auch die beiden KI-Bilder
`obst-und-gemuese.webp` und `fleisch-wurst-gefluegel.webp` von dieser Seite.

Neuer Aufbau:

1. Hero (unverändert)
2. Trustbar (unverändert)
3. Einleitung "Alles aus einer Hand" (unverändert)
4. **NEU: Logo-Abbinder** (siehe 4a)
5. **NEU: Acht Kategoriekarten** (siehe 4b)
6. Sektion "Küchenfertig vorbereitet" (unverändert, behält `id="kuechenfertig"`)
7. Sektion "Mehr als nur Ware" (unverändert)
8. Abschluss-CTA (unverändert)

### 4a) Logo-Abbinder

Eigene Section mit `bg="#F8F8F8"`, darüber eine kurze zentrierte Zeile:

```
Marken, die Ihre Küche kennt
```

Darunter die `.sub-logobar` mit allen zehn Logos aus Teil 2. Jedes Logo ist ein
Link auf die Herstellerseite, `target="_blank" rel="noopener noreferrer"`, mit
`alt` gleich dem Markennamen.

### 4b) Acht Kategoriekarten

Überschrift zentriert:

```
Unsere Sortimente
```

Lead zentriert:

```
Acht Warengruppen, eine Lieferung. Fünf davon stellen wir Ihnen ausführlich vor.
```

Raster `.sub-cards sub-cards--start`, drei Spalten ab 992px. Reihenfolge und
Inhalt genau so:

**1. Obst und Gemüse** (mit Link auf `/sortiment-und-leistungen/obst-und-gemuese`)
```
Kartoffeln aus der Leybucht, Saisonware aus der Region und über 20 Tomatensorten. Dazu Exoten, wenn die Karte sie verlangt.
```

**2. Kräuter, Kresse und Sprossen** (Link auf `/sortiment-und-leistungen/kraeuter-kresse-und-sprossen`)
```
Für die feine Küche und für den Gasthof: Wildkräuter, Kresse-Sorten, Blattsalatmischungen und Sprossen.
```

**3. Fleisch, Wurst und Geflügel** (Link auf `/sortiment-und-leistungen/fleisch-wurst-und-gefluegel`)
```
Rind und Schwein, Kikok Maishähnchen, Ente und Gans, Wild aus heimischen Forsten und Norderneyer Seeluftschinken.
```

**4. Nüsse und Trockenfrüchte** (Link auf `/sortiment-und-leistungen/nuesse-und-trockenfruechte`)
```
Nüsse, Kerne und getrocknete Früchte für Küche, Patisserie und Buffet.
```

**5. Säfte und Fruchtpürees** (Link auf `/sortiment-und-leistungen/saefte-und-fruchtpuerees`)
```
Frisch gepresste Säfte im Gastro-Gebinde und über 55 Fruchtpürees für Patisserie und Bar.
```

**6. Eier** (kein Link)
```
Hier liegen unsere Wurzeln. Frische Eier aus der Region, als Stangenware oder im Karton, in bedarfsgerechten Gebinden.
```

**7. Kartoffeln und Ready Cut** (kein Link)
```
Geschälte und geschnittene Kartoffeln sowie küchenfertige Schnittware in Großgebinden.
```

**8. Küchenfertig vorbereitet** (Ankerlink `#kuechenfertig`)
```
Feinkost, Schnittware und marinierte Pfannengerichte, die Ihrem Team Arbeit abnehmen.
```

### 4c) Meta der Übersichtsseite

```
title:       Sortiment und Leistungen | Lebensmittel-Großhandel Ostfriesland | Albert Wilts
description: Acht Warengruppen aus einer Hand: Obst und Gemüse, Kräuter und Kresse, Fleisch und Geflügel, Nüsse, Säfte und Küchenfertiges. Albert Wilts liefert an sechs Tagen in ganz Ostfriesland.
```

---

## Teil 5 — Fünf neue Unterseiten

**Ablage:** `src/pages/sortiment-und-leistungen/<slug>.astro`. Astro erlaubt die
Datei `sortiment-und-leistungen.astro` und den gleichnamigen Ordner nebeneinander.

**Einheitlicher Aufbau jeder Unterseite:**

1. `sub-hero` **ohne** Bild (kein `sub-hero--image`), H1 und Subline, darunter
   `sub-hero-actions` mit Button "Sortimentsliste anfordern" auf `#kontakt` und
   der Telefonzeile wie auf den bestehenden Unterseiten.
   Darüber im Code ein Kommentar `BILDPLATZ: <Motiv>` für später.
2. Einleitungsblock `.sub-block` in `<Section bg="#fff">`.
3. Sortiment als `ChipRow`-Zeilen in `<Section bg="#F8F8F8">`.
4. Inhaltsblock der Seite (variiert, siehe unten).
5. Markenblock `.sub-brands` in `<Section bg="#fff">`, Überschrift
   `Mit wem wir arbeiten`. Entfällt auf der Obst-und-Gemüse-Seite.
6. Cross-Teaser `.sub-teaserband` mit Link zurück auf die Übersicht.
7. Abschluss-CTA `.sub-cta section-pad` mit `id="kontakt"`, Text siehe unten.

**JSON-LD:** Jede Unterseite bekommt über das `jsonLd`-Prop des BaseLayout eine
BreadcrumbList mit drei Stufen: Startseite, Sortiment und Leistungen, aktuelle Seite.

**Keine Änderung an der Navigation.** Die Unterseiten werden über die
Übersichtsseite erreicht, nicht über das Flyout.

---

### 5.1 Obst und Gemüse

**Datei:** `obst-und-gemuese.astro`

```
title:       Obst und Gemüse für die Gastronomie | Großhandel Ostfriesland | Albert Wilts
description: Kartoffeln aus der Leybucht, über 20 Tomatensorten, Saisonware und Exoten. Albert Wilts liefert Obst und Gemüse an sechs Tagen die Woche in ganz Ostfriesland.
```

H1:
```
Obst und Gemüse
```

Subline:
```
Von der Kiste Leybucht-Kartoffeln bis zur Flugananas. An sechs Tagen die Woche frisch geliefert.
```

BILDPLATZ im Hero: Gemüselager oder Warenannahme, Querformat.

Einleitung, H2 und zwei Absätze:
```
Das Herzstück unseres Betriebs
```
```
Angefangen hat alles mit Eiern, gewachsen sind wir mit Obst und Gemüse. Wir kaufen bevorzugt bei langjährigen Partnern aus der Region ein und ergänzen um internationale Ware, wo die Saison es verlangt. Entscheidend ist für uns dabei weniger der Katalog als die Frage, was heute wirklich gut ist.
```
```
Deshalb lohnt sich der Anruf: Sagen Sie uns, was auf die Karte soll, und wir sagen Ihnen, was gerade dafür spricht.
```

ChipRows unter der zentrierten H2 `Was wir liefern`:

- `Aus der Region` → Kartoffeln aus der Leybucht, Kohlsorten, Spargel in der Saison, Beeren
- `Tomaten` → Über 20 Sorten, Cherry und Rispe, Fleischtomaten, Mini-Sorten
- `Das ganze Jahr` → Salate, Zitrusfrüchte, Wurzelgemüse, Zwiebeln
- `Besonderes` → Flugananas, Chili und Paprika, Exoten auf Anfrage

Inhaltsblock, H2 und ein Absatz:
```
Frische ist eine Frage der Wege
```
```
Kurze Wege sind der eigentliche Qualitätsfaktor. Unsere Lkw sind an sechs Tagen in Ostfriesland unterwegs, auf dem Festland und auf den Inseln. Ware, die morgens im Lager steht, ist am selben Tag bei Ihnen in der Küche, und zwar in dem Zustand, in dem sie angekommen ist.
```

**Kein Markenblock** auf dieser Seite (Kundenentscheidung, siehe Teil 1b).

CTA:
```
Sagen Sie uns, was Sie brauchen
```
```
Wir stellen Ihre Lieferung zusammen, saisonal angepasst und in den Mengen, die zu Ihrem Betrieb passen.
```

---

### 5.2 Kräuter, Kresse und Sprossen

**Datei:** `kraeuter-kresse-und-sprossen.astro`

```
title:       Kresse, Wildkräuter und Sprossen für die Gastronomie | Albert Wilts
description: Kresse-Sorten von Koppert Cress und Cresco, Kräuter und essbare Blüten von Van Vugt, Sprossen von Van der Plas. Albert Wilts liefert in ganz Ostfriesland.
```

H1:
```
Kräuter, Kresse und Sprossen
```

Subline:
```
Die Zutaten, mit denen Sie einem Teller das letzte Prozent geben. Für die feine Küche und für den Gasthof.
```

BILDPLATZ im Hero: Kresse-Schalen oder Kräuter in der Kühlung, Querformat.

Einleitung:
```
Vier Lieferanten, drei verschiedene Aufgaben
```
```
Diese Warengruppe ist für viele Küchen der eigentliche Grund, bei uns zu bestellen. Dahinter stehen vier Betriebe aus den Niederlanden, die ganz unterschiedliche Dinge gut können: Spezialitäten mit eigenem Aroma, das tägliche Grundsortiment an Kräutern und Salaten, und Sprossen in Mengen, die eine Küche wirklich braucht.
```
```
Alle vier liegen per Lkw einen Tag von Upgant-Schott entfernt. Genau das macht den Unterschied bei Ware, die nach drei Tagen nichts mehr taugt.
```

ChipRows unter `Was wir liefern`:

- `Kresse und Mikrogrün` → Kresse-Sorten, essbare Blüten, Spezialblätter
- `Kräuter` → Frische Küchenkräuter, Wildkräuter, Bio-Kräuter
- `Salate` → Blattsalatmischungen, Baby Leaf, Wiesenkräutermischungen
- `Sprossen` → Alfalfa, Taugé, Rettich- und Kohlsprossen, Aromasprossen

Inhaltsblock mit drei Spalten (`.sub-featcols`), H2:
```
Drei Aufgaben, drei Lösungen
```

Spalte 1:
```
Aroma statt Deko
```
```
Kresse ist kein Streugut. Die Sorten unterscheiden sich klar im Geschmack, von Anis über Wasabi bis zu einer Austernnote, und lassen sich damit als Baustein einsetzen statt nur als Dekoration.
```

Spalte 2:
```
Das tägliche Grundsortiment
```
```
Kräuter, essbare Blüten und Blattsalat decken Sie bei uns ganzjährig ab, auch im Winter, wenn der eigene Garten nichts hergibt.
```

Spalte 3:
```
Menge für die Pfanne
```
```
Sprossen sind kein Garnierprodukt, sondern Volumen: für Wok, Bowl und vegetarische Gerichte, und als rohe Aromaquelle für Zwiebel- und Knoblauchnoten.
```

Markenblock `Mit wem wir arbeiten`:

**Koppert Cress** — https://www.koppertcress.com/de/
```
Die Kressen und Blüten kommen als lebende Pflanze zu Ihnen, nicht als Schnittgut. Sie ernten über mehrere Tage frisch, und der Schwund ist entsprechend gering. Das Sortiment ist nach Geschmacksrichtung geordnet, von bitter über salzig bis umami. Wir sind Vertriebspartner von Koppert Cress.
```

**Cresco** — https://crescobv.com/
```
Ein Familienbetrieb aus dem Westland, der Mischungen nach Wunsch zusammenstellt, statt dass Sie Standardschalen kombinieren. Dazu kommen Farbsorten für den Kontrast auf dem Teller und eine eigene Linie Bio-Küchenkräuter.
```

**Van Vugt Kruiden** — https://www.vanvugtkruiden.nl/?lang=de
```
Das Grundsortiment: rund 25 frische Kräuter, etwa 20 essbare Blüten und knapp 20 Baby-Leaf-Sorten, ganzjährig verfügbar. Wild- und Wiesenkräutermischungen gibt es fertig, ohne dass jemand selbst sammeln muss.
```

**Van der Plas** — https://happysprouts.nl/de/
```
Einer der größten Sprossenbetriebe Europas, in dritter Generation. Neben Alfalfa und Taugé auch Aromasprossen, mit denen sich Lauch- und Knoblauchnoten roh setzen lassen. Weil Sprossen mikrobiologisch heikel sind, zählt hier die Prüfkette, und die ist dort entsprechend streng.
```

CTA:
```
Erzählen Sie uns von Ihrer Karte
```
```
Wir schauen gemeinsam, welche Sorten zu Ihren Gerichten passen, und legen die Liefermenge so an, dass nichts verdirbt.
```

---

### 5.3 Fleisch, Wurst und Geflügel

**Datei:** `fleisch-wurst-und-gefluegel.astro`

```
title:       Fleisch, Geflügel und Wild für die Gastronomie | Großhandel | Albert Wilts
description: Kikok Maishähnchen, Südoldenburger Ente und Gans, Wild aus heimischen Forsten und Norderneyer Seeluftschinken. Albert Wilts liefert Fleisch in Metzgerqualität.
```

H1:
```
Fleisch, Wurst und Geflügel
```

Subline:
```
Qualität, die man am Ergebnis merkt. Mit Marken, die Ihre Gäste wiedererkennen.
```

BILDPLATZ im Hero: Kühlraum oder Fleischtheke, Querformat.

Einleitung:
```
Qualität entsteht vor der Küche
```
```
Bei Fleisch entscheidet sich die Qualität lange bevor die Pfanne heiß wird: bei der Fütterung, bei der Haltung und bei der Verarbeitung. Deshalb arbeiten wir mit Betrieben, die darüber Auskunft geben können, und nicht mit der nächstbesten Lieferung.
```
```
Geliefert wird in den Zuschnitten, die Sie brauchen, portioniert oder am Stück, auf Wunsch küchenfertig vorbereitet.
```

ChipRows unter `Was wir liefern`:

- `Rind und Schwein` → Diverse Zuschnitte, Portioniert oder am Stück, Küchenfertig gewürzt auf Wunsch
- `Geflügel` → Kikok Maishähnchen, Hähnchen und Pute, Ente und Gans, Hähnchen-Gyros
- `Wild` → Aus heimischen Forsten, Saisonal verfügbar
- `Wurst und Schinken` → Aufschnitt, Wurstspezialitäten, Norderneyer Seeluftschinken

Hinweisblock (`.sub-highlight` mit Badge `Saison`):
```
Gans und Ente rechtzeitig planen
```
```
Zwischen Martinstag und Weihnachten ist Gänsesaison, und in dieser Zeit ist die Ware knapp. Wer früh disponiert, bekommt die Gewichtsklasse, die er braucht. Sprechen Sie uns im Spätsommer an, dann planen wir gemeinsam.
```

Markenblock `Mit wem wir arbeiten`:

**Kikok** — https://kikok.de/
```
Kikok, das ganz besondere Maishähnchen. Mindestens die Hälfte des Futters ist Mais, daher die goldgelbe Haut, die man auf dem Teller sofort sieht. Die Tiere wachsen deutlich langsamer als üblich und stehen weniger dicht, als es die Vorschrift verlangt. Beides schmeckt man.
```

**Geflügelhof Nobis** — https://gefluegelhof-nobis.de/
```
Südoldenburger Ente und Gans aus Bakum, ein Familienbetrieb in vierter Generation. Dort wird trocken gerupft, also ohne Brühwasser und ohne Dampf. Die Oberhaut bleibt dadurch intakt, und genau das merken Sie beim Braten an der Kruste.
```

**Norderneyer Seeluftschinken** — https://www.norderneyer-seeluftschinken.de/
```
Von Hand mit Meersalz gesalzen und auf Norderney in der Nordseeluft gereift. Ein Rohschinken, der als Vorspeise, auf Brot oder zu Spargel und Melone funktioniert. Im Großhandel bekommen Sie ihn am Stück oder geschnitten, im Ladenverkauf aufgeschnitten.
```

CTA:
```
Wir schneiden, wie Sie es brauchen
```
```
Sagen Sie uns Gewicht, Zuschnitt und Liefertag, dann stellen wir Ihre Fleischbestellung passend zusammen.
```

---

### 5.4 Nüsse und Trockenfrüchte

**Datei:** `nuesse-und-trockenfruechte.astro`

```
title:       Nüsse und Trockenfrüchte für Küche und Buffet | Albert Wilts
description: Mandeln, Pistazien, Pekannüsse, Datteln und Feigen von Tovano. Rohware für Küche und Patisserie, fertige Schalen für Bar und Buffet, geliefert in ganz Ostfriesland.
```

H1:
```
Nüsse und Trockenfrüchte
```

Subline:
```
Rohware für Küche und Patisserie, fertig verpackt für Bar und Buffet.
```

BILDPLATZ im Hero: Nüsse und Trockenfrüchte in Schalen, Querformat.

Einleitung:
```
Die Warengruppe, die man erst vermisst, wenn sie fehlt
```
```
Nüsse und getrocknete Früchte tauchen überall auf: im Salat, in der Patisserie, auf dem Frühstücksbuffet und in der Hotelbar. Weil sie selten im Mittelpunkt stehen, werden sie gern bei irgendwem mitbestellt. Dabei merkt man den Unterschied sofort, wenn die Qualität nicht stimmt.
```
```
Wir liefern beides: Rohware zum Weiterverarbeiten und fertig verpackte Ware, die Sie direkt hinstellen können.
```

ChipRows unter `Was wir liefern`:

- `Nüsse` → Mandeln, Cashew, Haselnuss, Pistazien, Pekannüsse, Walnüsse, Macadamia
- `Kerne und Saaten` → Kürbiskerne, Pinienkerne, Sonnenblumenkerne
- `Trockenfrüchte` → Datteln, Feigen, Aprikosen, Mango, Ananas
- `Fertig verpackt` → Schalen fürs Buffet, Snacks für die Bar, Backsortiment

Markenblock `Mit wem wir arbeiten`:

**Tovano** — https://www.tovano.nl/de/
```
Ein niederländischer Familienbetrieb, der seit 1950 nichts anderes macht als Nüsse, Kerne und getrocknete Früchte. Eingekauft wird direkt bei den Erzeugern, mit Herkunftsnachweis bis zur Partie. Neben der Rohware gibt es Trockenfrüchte ohne Zuckerzusatz und fertige Schalen für Buffet und Bar.
```

CTA:
```
Ein Muster vorab?
```
```
Wenn Sie wissen wollen, ob die Qualität zu Ihrer Karte passt, legen wir Ihnen bei der nächsten Lieferung gern ein Muster dazu.
```

---

### 5.5 Säfte und Fruchtpürees

**Datei:** `saefte-und-fruchtpuerees.astro`

```
title:       Frisch gepresste Säfte und Fruchtpürees für die Gastronomie | Albert Wilts
description: Frisch gepresste Säfte von ELKA im 3-Liter-Gastro-Gebinde und über 55 Fruchtpürees von Ponthier für Patisserie und Bar. Albert Wilts liefert in ganz Ostfriesland.
```

H1:
```
Säfte und Fruchtpürees
```

Subline:
```
Frisch gepresst für den Offenausschank, Pürees mit festen Werten für Patisserie und Bar.
```

BILDPLATZ im Hero: Saftgläser oder Frühstücksbuffet, Querformat.

Einleitung:
```
Was im Glas landet, soll nach Frucht schmecken
```
```
Beim Saft trennt sich schnell, wer frisch presst und wer Konzentrat auflöst. Und in der Patisserie entscheidet sich an der Fruchtbasis, ob ein Dessert konstant gelingt oder jedes Mal anders schmeckt. Beide Warengruppen haben wir deshalb bewusst besetzt.
```

Zwei Inhaltsblöcke nebeneinander (`.sub-featcols`, zwei Spalten), H2:
```
Zwei Produkte, ein Anspruch
```

Block 1:
```
Frisch gepresste Säfte
```
```
Der Klassiker ist Orange, dazu liefern wir das weitere Sortiment. Gepresst statt aus Konzentrat, nicht erhitzt, gekühlt geliefert. Für die Gastronomie kommen die Säfte im 3-Liter-Gebinde für den Offenausschank, nicht in kleinen Flaschen.
```

Block 2:
```
Fruchtpürees und Coulis
```
```
Über 55 Sorten, von Passionsfrucht über Yuzu bis Sanddorn, gekühlt oder tiefgekühlt. Jede Sorte hat einen festen Zuckerwert und ein Geschmacksprofil, mit dem sich Süße und Säure im Rezept kalkulieren lassen. Gebinde von 500 Gramm bis fünf Kilo.
```

ChipRows unter `Was wir liefern`:

- `Säfte` → Orange, Weitere Sorten auf Anfrage, 3-Liter-Gebinde, Gekühlt geliefert
- `Fruchtpürees` → Über 55 Sorten, Gekühlt oder tiefgekühlt, 500 g bis 5 kg
- `Einsatz` → Frühstücksbuffet, Bar und Cocktails, Patisserie und Dessert

Markenblock `Mit wem wir arbeiten`:

**ELKA** — https://www.elka-frische.de/
```
Ein Spezialist, der ausschließlich Frischsäfte für die Gastronomie herstellt. Die Früchte werden gepresst und abgefüllt, ohne Erhitzen und ohne Konzentrat. Für Hotels, Frühstücksbuffets und Systemgastronomie kommen die Säfte im Kanister für den Offenausschank.
```

**Ponthier** — https://www.ponthier.fr/en/
```
Fruchtpürees aus der französischen Corrèze, seit 1946 in Familienhand. Für Küchen entscheidend: Jede Sorte ist mit festen Werten für Zuckergehalt und Geschmacksprofil dokumentiert, inklusive Säure und Süße. Damit lässt sich eine Rezeptur sauber nachrechnen, statt sie jedes Mal neu abzuschmecken.
```

CTA:
```
Sprechen Sie uns auf Ihre Karte an
```
```
Ob Frühstücksbuffet, Barkarte oder Dessert: Wir sagen Ihnen, welche Sorte sich dafür bewährt hat.
```

---

## Teil 6 — Cross-Teaser und Rückweg

Jede der fünf Unterseiten bekommt vor dem Abschluss-CTA ein `.sub-teaserband`:

```
Das ganze Sortiment
```
```
Acht Warengruppen liefern wir aus einer Hand, von Eiern über Kartoffeln bis zu küchenfertig vorbereiteter Ware.
```

Button: `Zur Sortimentsübersicht` auf `/sortiment-und-leistungen`.

---

## Abschlussprüfung

`npm run build` muss fehlerfrei durchlaufen. Danach ausgeben:

- Liste aller geänderten und neu angelegten Dateien
- Logo-Liste aus Teil 2 mit Format, Maßen und Quelle, plus die Marken, deren Logo
  nicht beschaffbar war
- Bestätigung, dass im gesamten `src/` weder "Eminent" noch "Ente und Wild" steht
- Bestätigung, dass die KI-Bilder `obst-und-gemuese.webp` und
  `fleisch-wurst-gefluegel.webp` nirgends mehr referenziert werden
- Bestätigung, dass alle fünf neuen Seiten unter `/sortiment-und-leistungen/<slug>`
  erreichbar sind und die Übersichtsseite auf alle fünf verlinkt
- Bestätigung, dass keine Bezugskette zu Kikok auf der Website steht

**Kein Commit.** Manuel prüft zuerst.

---

## Offen beim Kunden

- Chefslist: Ziel und Platzierung noch unklar
- Videos: welche eingebettet werden sollen und wo sie liegen
- Eigene Fotos als Ersatz für das letzte verbliebene KI-Bild
  (`hotellerie-fruehstuecksbuffet.webp` auf `/grosshandel-fuer-hotellerie`)
- Produktbilder für die Bildplätze der fünf neuen Unterseiten
- Perspektivbruch im Zeitstrahl auf `/ueber-uns`
