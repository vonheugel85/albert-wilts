# Runde 5a: Einbau des Kundenfeedbacks vom 15. und 16.10.2026

Arbeitsanweisung für Claude Code. Grundlage sind die Sprachnachrichten von
Andree Wilts vom 15.10.2026, 21:54 bis 21:56 Uhr, als Antwort auf die Mail
"Website: offene Punkte Teil 2".

Dieses Paket enthält ausschließlich inhaltliche Ergänzungen an bestehenden
Seiten. Der Chefslist-Abschnitt ist bewusst nicht Teil dieses Pakets, dafür
gibt es runde-5b-testseite-chefslist.md.

## Verbindliche Regeln

- Echte Umlaute und ß in allen Texten, auch in dieser Datei und in den
  Code-Blöcken. Keine Umschrift zu ae, oe, ue oder ss.
- Keine Gedankenstriche, weder lang noch halblang. Komma, Punkt oder
  Doppelpunkt.
- Keine Gendersternchen.
- Ansprache auf der Website durchgängig Sie.
- Bilder niemals umbenennen oder verschieben, die URLs müssen stabil bleiben.
- Nichts erfinden. Wo eine Angabe weder aus dieser Datei noch von der
  Herstellerseite belegbar ist, lieber weglassen und am Ende melden.
- Nach jedem Teil prüfen, ob der Build durchläuft.

---

## Teil 1: Bedford als Partner aufnehmen

### Hintergrund, nicht wörtlich übernehmen

Andree im O-Ton: "Bedford, da beziehen wir, die kommen aus Osnabrück, die
machen im Endeffekt Premium-Convenience. Also wir machen vor allen Dingen
Hähnchenbrustschnitte, das heißt fertig gegarte und frittierte."

Zur Abgrenzung, ebenfalls O-Ton: "Wenn wir eine Hähnchen-Curry-Pfanne oder
eine Hähnchen-Bali-Pfanne machen, dann nehmen wir Hähnchenbrust frisch,
schneiden das in Streifen und veredeln das mit einer Marinade und auch mit
einer Gemüseeinlage. Das ist bei uns Pfannenfertiges. Von Bedford kommt
Premium-Convenience, was schon direkt essfertig ist. Bei unseren Sachen musst
du das im Endeffekt noch durcherhitzen."

Die Formulierung "frisch geschlachtet" aus der Sprachnachricht wird nicht
verwendet. Auf der Website steht "frische Hähnchenbrust".

Recherchierter Stand: Bedford GmbH + Co. KG, Osnabrück, Wurst- und
Schinkenmanufaktur seit 1909, mit Convenience-Linien frisch und tiefgekühlt
sowie einer Linie "Rein Geflügel". Website: https://www.bedford.de/

### Schritt 1.1: Logo beschaffen

Logo von bedford.de holen und unter `public/logo/hersteller/bedford.svg`
ablegen. Falls kein SVG verfügbar ist, PNG mit transparentem Hintergrund,
Dateiname dann `bedford.png`. Die Logos der Partner sind vom Kunden
freigegeben.

### Schritt 1.2: Marken-Array ergänzen

Datei: `src/pages/sortiment-und-leistungen.astro`, Konstante `hersteller` im
Frontmatter. Neuer Eintrag, hinter Heinemann:

```js
{ name: 'Bedford', url: 'https://www.bedford.de/', logo: 'bedford.svg' },
```

### Schritt 1.3: Abschnitt "Küchenfertig vorbereitet" erweitern

Datei: `src/pages/sortiment-und-leistungen.astro`, Section mit
`id="kuechenfertig"`. Dort stehen bisher zwei Karten. Es kommt eine dritte
dazu, eingefügt zwischen "Feinkost und Schnittware" und "Aus eigener
Vorbereitung":

```html
<div class="sub-card">
  <h3>Essfertige Geflügelspezialitäten</h3>
  <p>Premium-Convenience von Bedford aus Osnabrück, einer Wurst- und Schinkenmanufaktur mit eigener Geflügellinie. Fertig gegarte und frittierte Hähnchenbrustschnitten, die in Ihrer Küche nur noch angerichtet werden.</p>
  <p class="sub-brandlinks"><a class="sub-brandlink" href="https://www.bedford.de/" target="_blank" rel="noopener noreferrer">Zur Website von Bedford</a></p>
</div>
```

### Schritt 1.4: Eigene Herstellung abgrenzen

In derselben Section die Karte "Aus eigener Vorbereitung" ersetzen durch:

```html
<div class="sub-card">
  <h3>Aus eigener Vorbereitung</h3>
  <p>Unsere Pfannengerichte entstehen im Haus: frische Hähnchenbrust, in Streifen geschnitten und mit Marinade und Gemüseeinlage veredelt, etwa als Curry-, Bali- oder Kürbispfanne. Diese Ware erhitzen Sie in Ihrer Küche durch. Keine Industrieware, sondern Handarbeit aus unserem Haus.</p>
</div>
```

### Schritt 1.5: Unterseite Fleisch, Wurst und Geflügel

Datei: `src/pages/sortiment-und-leistungen/fleisch-wurst-und-gefluegel.astro`

Bedford in den dortigen Markenbereich aufnehmen, im selben Muster wie die
bereits vorhandenen Marken auf dieser Seite. Kein eigenes Layout erfinden.

Textbaustein:

Überschrift: Bedford

Fließtext: Essfertige Geflügelspezialitäten aus Osnabrück. Bedford stellt
seit 1909 Wurst und Schinken her und führt heute eine eigene Geflügellinie.
Von dort kommen unsere fertig gegarten und frittierten Hähnchenbrustschnitten,
die in Ihrer Küche nur noch angerichtet werden. Das ergänzt unsere eigenen
Pfannengerichte, die Sie vor dem Servieren durcherhitzen.

Link: https://www.bedford.de/

Zusätzlich in der Meta-Description der Seite prüfen, ob Bedford sinnvoll
ergänzt werden kann, ohne die Länge über 160 Zeichen zu treiben. Wenn nicht,
Description unverändert lassen und am Ende melden.

### Schritt 1.6: Belegprüfung Händlersuche

Bedford betreibt auf der eigenen Website eine Händlersuche. Andree hat
gesagt, Wilts sei dort als Vertriebspartner verlinkt. Prüfen, ob Albert Wilts
dort tatsächlich auftaucht. Wenn ja, den gefundenen Link am Ende melden, aber
noch nicht einbauen. Wenn nein, ebenfalls melden und auf der Seite nichts
über eine Partnerschaft behaupten.

---

## Teil 2: Nature's Pride als Partner aufnehmen

### Hintergrund, nicht wörtlich übernehmen

Andree im O-Ton: "Nature's Pride, das ist vor allen Dingen ein Händler für
Exoten. Von denen kriegen wir alles, was ready to eat ist, also Avocados
ready to eat, Mangos ready to eat. Von denen gibt es aber auch alles andere,
Papaya Formosa, eine Jackfrucht, wenn wir brauchen."

Hinweis zur Diktatfunktion: Andree spricht von "Papaya, Formosa". Formosa ist
eine Papaya-Sorte, gemeint ist also die Papaya Formosa als eine Position,
nicht zwei verschiedene Früchte. Entsprechend als eine Position schreiben.

Website: https://www.naturespride.eu

Das eigentliche Verkaufsargument ist der Reifegrad: verzehrfertige Ware
spart der Küche die Kalkulation, wann eine Avocado so weit ist. Das wird im
Text herausgestellt, nicht nur der Markenname.

### Schritt 2.1: Logo beschaffen

Logo von naturespride.eu holen und unter
`public/logo/hersteller/natures-pride.svg` ablegen, ersatzweise als PNG mit
transparentem Hintergrund unter `natures-pride.png`.

### Schritt 2.2: Marken-Array ergänzen

Datei: `src/pages/sortiment-und-leistungen.astro`, Konstante `hersteller`:

```js
{ name: "Nature's Pride", url: 'https://www.naturespride.eu', logo: 'natures-pride.svg' },
```

### Schritt 2.3: Unterseite Obst und Gemüse

Datei: `src/pages/sortiment-und-leistungen/obst-und-gemuese.astro`

Diese Seite hat bisher keinen Markenbereich. Einen anlegen, und zwar im
selben Muster wie auf `kraeuter-kresse-und-sprossen.astro`, damit die
Unterseiten einheitlich bleiben. Der Bereich kommt nach der Section
"Was wir liefern" und vor "Frische ist eine Frage der Wege".

Textbaustein:

Überschrift: Nature's Pride

Fließtext: Exoten aus den Niederlanden, mit einem Schwerpunkt, der für die
Küche den Unterschied macht: verzehrfertige Ware. Avocados und Mangos
kommen im richtigen Reifegrad bei Ihnen an, also genau dann einsatzbereit,
wenn Sie sie brauchen. Dazu Papaya Formosa, Jackfrucht und das übrige
Exotensortiment auf Anfrage.

Link: https://www.naturespride.eu

### Schritt 2.4: SpecRow "Besonderes" ergänzen

In derselben Datei, Section "Was wir liefern", die Zeile mit
`label="Besonderes"`. Neue Einträge ergänzen, bestehende behalten:

```html
<SpecRow label="Besonderes" items={['Flugananas', 'Chili und Paprika', 'Avocados und Mangos verzehrfertig', 'Papaya Formosa', 'Exoten auf Anfrage']} />
```

### Schritt 2.5: Kategoriekarte auf der Übersichtsseite

Datei: `src/pages/sortiment-und-leistungen.astro`, Karte "Obst und Gemüse".
Den letzten Satz "Dazu Exoten, wenn die Karte sie verlangt." ersetzen durch:
"Dazu Exoten von Nature's Pride, auf Wunsch verzehrfertig."

---

## Teil 3: Liefergebiet

### Hintergrund

Andree hat das Liefergebiet am 17.09. ausdrücklich gewünscht und am 15.10.
die Ortsliste nachgeliefert. O-Ton: "Liefergebiete, die wir regelmäßig
anfahren, ist praktisch das ostfriesische Festland. Das bedeutet grob, die
Krummhörn, also Greetsiel, dann Emden, Aurich, Norddeich, Norderney, Juist,
Baltrum, Langeoog, Spiekeroog, Esens."

Wichtig: Seine Überschrift "das ostfriesische Festland" passt nicht zur
Liste, weil darin fünf Inseln vorkommen. Auf der Website heißt der Bereich
deshalb "Ostfriesland und die Inseln". Norddeich wird als "Norden und
Norddeich" geführt, weil Norddeich ein Ortsteil von Norden ist.

### Schritt 3.1: Abschnitt anlegen

Datei: `src/pages/fuer-gewerbekunden.astro`. Neue Section nach "Warum
Gewerbekunden auf Wilts setzen" und vor dem Teaserband "Unser Sortiment im
Überblick".

Überschrift: Ostfriesland und die Inseln

Einleitung: Unsere Lkw sind an sechs Tagen die Woche unterwegs, auf dem
Festland und über die Fähren. Diese Orte fahren wir regelmäßig an. Ihr
Standort ist nicht dabei? Fragen Sie trotzdem, oft lässt sich eine Route
erweitern.

Zwei Gruppen, als zwei Listen nebeneinander, im Muster der vorhandenen
`sub-featcols`:

- Auf dem Festland: Emden, Aurich, Norden und Norddeich, Krummhörn mit
  Greetsiel, Esens
- Auf den Inseln: Norderney, Juist, Baltrum, Langeoog, Spiekeroog

### Schritt 3.2: Bildplatz für die Karte

Andree möchte an dieser Stelle eine Karte sehen, so wie auf der alten
Website. Die Karte wird in diesem Paket nicht gebaut, weil dafür noch keine
Grafik freigegeben ist. Stattdessen im selben Muster wie auf den anderen
Seiten einen Kommentar setzen:

```html
{/* BILDPLATZ: Karte Liefergebiet Ostfriesland mit Inseln, Querformat */}
```

Keinen Kartendienst einbinden, keine Platzhaltergrafik erzeugen.

---

## Teil 4: Pressebereich

### Hintergrund

Andree am 14.10.: "Bei dem Pressebereich kann man auf die Sachen teilweise
nicht zugreifen. Bei Ferien Ahoi passt die Verlinkung leider auch nicht,
aber da könnten wir vielleicht einfach das PDF hinterlegen, was wir gekriegt
haben von ihm."

Recherchiert: Der Beitrag über Albert Wilts steht in Ausgabe 44 des ahoi!
norderney Magazins, erschienen am 23.07.2026, Seiten 038 bis 041, Titel
"Mit der ersten Fähre. Wie Albert Wilts Obst und Gemüse auf die Insel
bringt", Fotos von Carsten Muecke. Dieser Beitrag fehlt bisher komplett in
den Pressedaten. Die beiden vorhandenen Ferien-Ahoi-Einträge beziehen sich
auf die Ausgaben 39 und 21.

### Schritt 4.1: PDF ablegen

Ordner `public/presse/` anlegen und das vom Verlag an Wilts gelieferte PDF
dort ablegen unter dem Dateinamen:

`ahoi-magazin-44-mit-der-ersten-faehre.pdf`

Die Datei liegt noch nicht im Repo. Wenn sie beim Start dieses Auftrags
fehlt, den Eintrag aus Schritt 4.2 trotzdem anlegen, aber am Ende melden,
dass das PDF nachgelegt werden muss. Keine Ersatzdatei erzeugen.

### Schritt 4.2: Neuer Presseeintrag

Datei: `src/data/presse.js`, Array `pressebeitraege`. Neuer Eintrag
unmittelbar vor dem Eintrag mit der id `ferien-ahoi-39`, damit die neueste
Ausgabe zuerst steht:

```js
{
  id: 'ferien-ahoi-44',
  kategorie: 'norderney',
  medium: 'Ferien Ahoi',
  datum: '2026-07-23',
  datumLabel: 'Ausgabe 44, 2026',
  titel: 'Mit der ersten Fähre',
  teaser: 'Das Norderneyer Reisemagazin begleitet einen kompletten Auslieferungstag, von der Bestellannahme am Donnerstag bis zurück aufs Festland am Freitagmittag.',
  url: '/presse/ahoi-magazin-44-mit-der-ersten-faehre.pdf',
  zugang: 'frei',
  format: 'Reisemagazin, PDF',
},
```

### Schritt 4.3: Alle Presselinks prüfen

Andree spricht von "teilweise" nicht erreichbaren Beiträgen. Deshalb jeden
Eintrag in `src/data/presse.js` mit gesetzter `url` einmal abrufen und das
Ergebnis in einer Tabelle melden: id, Status, Befund.

Regeln für den Umgang mit dem Ergebnis:

- Link erreichbar: nichts ändern.
- Link führt ins Leere oder auf eine Fehlerseite: die `url` entfernen und
  `zugang` auf `'offline'` setzen, damit der Eintrag sichtbar bleibt, aber
  nicht mehr ins Nichts führt. Den Fall melden.
- Link hinter einer Bezahlschranke: `zugang` auf `'paywall'` setzen.
- Keine Links raten, keine Ersatzquellen suchen, keine Einträge löschen.

Falls ein Beitrag ein Video betrifft: nicht anfassen. Das Videothema ist
beim Kunden weiterhin ungeklärt und wird separat behandelt.

---

## Teil 5: Zwei Funde, nur melden, nichts ändern

Beim Durchsehen des Repos sind zwei Punkte aufgefallen, die nicht
eigenmächtig korrigiert werden. Beide am Ende melden.

1. In `src/pages/sortiment-und-leistungen.astro`, Kategoriekarte "Säfte und
   Fruchtpürees", steht weiterhin "über 55 Fruchtpürees". Runde 4 hat die
   ersatzlose Streichung dieser Angabe verlangt, weil sie sich auf das
   Gesamtsortiment inklusive Tiefkühlware bezieht. Anscheinend wurde die
   Korrektur nur auf der Unterseite umgesetzt. Bitte prüfen und melden, an
   welchen Stellen die Angabe noch steht.

2. Im Trustbar derselben Seite steht "Dritte Generation". Der Beitrag im
   ahoi! Magazin spricht dagegen von der sechsten Generation. Das ist ein
   Widerspruch in freigegebenem Material und muss vom Kunden geklärt werden.
   Nicht ändern, nur melden.

---

## Abschluss

1. `npm run build` ausführen und sicherstellen, dass der Build fehlerfrei
   durchläuft.
2. Prüfen, ob die neuen Logodateien tatsächlich unter
   `public/logo/hersteller/` liegen. Dateien in `public/` werden nicht
   validiert, fehlende Bilder erzeugen still einen 404.
3. Die Logobar auf `/sortiment-und-leistungen` im Browser ansehen und
   prüfen, ob die beiden neuen Logos sauber laufen und die Höhen zu den
   übrigen passen.
4. Commit mit der Nachricht:
   `K5a: Bedford und Nature's Pride aufgenommen, Liefergebiet, ahoi-Ausgabe 44 im Pressebereich`

## Was am Ende gemeldet wird

- Ergebnis der Linkprüfung aus Schritt 4.3 als Tabelle
- Ob das PDF aus Schritt 4.1 vorhanden war
- Ob Albert Wilts in der Händlersuche von Bedford auftaucht, mit Link
- In welchem Format die beiden neuen Logos beschafft wurden
- Die beiden Funde aus Teil 5
- Alles, was nicht umgesetzt werden konnte, mit Begründung

## Was dieses Paket ausdrücklich nicht enthält

- Der Chefslist-Abschnitt, siehe runde-5b-testseite-chefslist.md
- Die Karte zum Liefergebiet als Grafik
- Die Statusanzeige im Header
- Alte Familienfotos für die Geschichtsseite, die liegen beim Kunden
