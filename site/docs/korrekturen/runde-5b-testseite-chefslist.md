# Runde 5b: Testseite mit Chefslist Call to Action

Arbeitsanweisung für Claude Code. Dieses Paket ist unabhängig von
runde-5a-feedback-einbau.md und kann vorher oder nachher abgearbeitet werden.

## Ziel

Eine neue, nicht verlinkte Testseite, auf der ein kombinierter Call to Action
von Albert Wilts und Chefslist zur Abnahme steht. Der Block wird als eigene
Komponente gebaut, damit er später ohne Doppelpflege auf die vier
Gewerbeseiten übernommen werden kann. In diesem Paket wird er ausdrücklich
noch nicht dort eingebaut.

## Verbindliche Regeln

- Echte Umlaute und ß in allen Texten, auch in den Code-Blöcken. Keine
  Umschrift zu ae, oe, ue oder ss.
- Keine Gedankenstriche, weder lang noch halblang.
- Keine Gendersternchen.
- Ansprache durchgängig Sie.
- Die Texte unten sind mit dem Kunden abgestimmt und werden wörtlich
  übernommen. Nicht umformulieren, nicht kürzen, nichts ergänzen.
- Kein Einbetten von Fremdinhalten. Es wird ausschließlich verlinkt.

---

## Hintergrund, damit die Entscheidungen nachvollziehbar sind

Chefslist ist eine Bestellplattform für den Lebensmittelgroßhandel. Der
Großhändler bindet sie an seine Warenwirtschaft an, seine Gewerbekunden
bestellen über App oder Browser. Für die Gastronomie ist die Nutzung
kostenfrei. Der Zugang läuft ausschließlich über den Großhändler: Der Kunde
meldet sich an, Wilts schickt ihm einen persönlichen Registrierungscode.

Das Anmeldeformular liegt bei Chefslist, trägt aber das Albert-Wilts-Logo und
fragt in Schritt 2 "Sind Sie bereits Kunde bei uns?" mit Ja und Nein. Es
richtet sich also an Bestandskunden und an Neukunden gleichermaßen. Deshalb
ist dieser Block nicht nur eine Chefslist-Kachel, sondern der zentrale
Bestelleinstieg der Gewerbeseiten.

Chefslist ersetzt den bisherigen Bestellweg nicht. Telefon, Mail und
Außendienst bleiben. Der Block ist deshalb bewusst zweigleisig, damit sich
Stammkunden nicht vor den Kopf gestoßen fühlen.

Nicht verwendet werden drei Angaben von der Herstellerseite: die 13 Prozent
höheren Warenkörbe, die über 10.000 Kunden und das 60-Tage-Zahlungsziel. Die
ersten beiden sind unbelegte Eigenangaben, das dritte ist ein
Finanzierungsangebot, das Wilts nicht im Namen von Chefslist versprechen
sollte.

Ziel-URL des Formulars: https://chefslist.typeform.com/to/Isi7MsIh

Diese Adresse ist von Chefslist am 16.10.2026 schriftlich als die einzige
gültige Fassung bestätigt worden.

---

## Schritt 1: Komponente anlegen

Neue Datei: `src/components/ChefslistCta.astro`

Die Komponente bekommt keine Props. Sie bringt ihr eigenes CSS mit, in einem
`<style>`-Block ohne dynamisches JavaScript, damit der Tailwind-Scanner nicht
bricht. Klassenpräfix `cl-`, damit nichts mit den bestehenden `sub-`-Klassen
kollidiert.

Aufbau von oben nach unten:

1. Überschrift
2. Einleitungsabsatz
3. Sechs Nutzenpunkte als Liste in zwei Spalten, auf dem Smartphone
   einspaltig
4. Ablauf in drei nummerierten Schritten
5. Hinweiskasten für Neukunden, optisch abgesetzt
6. Zwei Aktionen nebeneinander: Primärbutton und Telefonnummer
7. Abbinder in kleiner Schrift

Farblich im bestehenden CI bleiben, also dunkles Grün als Fläche oder
Akzent und Orange ausschließlich für den Primärbutton. Der Block soll sich
vom gewohnten `sub-cta` klar abheben, weil er mehr Inhalt trägt, aber nicht
wie ein Fremdkörper wirken.

## Schritt 2: Die Texte, wörtlich zu übernehmen

**Überschrift**

Bestellen, wann es Ihnen passt

**Einleitung**

Ihre Bestellung erreicht uns weiterhin so, wie Sie es gewohnt sind:
telefonisch, per Mail oder über unseren Außendienst. Wer lieber digital
bestellt, nutzt Chefslist. Darüber erreichen Sie unser Sortiment rund um die
Uhr, auch dann, wenn bei uns gerade niemand ans Telefon geht.

**Nutzenpunkte, genau diese sechs, in dieser Reihenfolge**

- Rund um die Uhr bestellen, unabhängig von unseren Telefonzeiten
- Ihr Sortiment als Favoritenliste, wiederkehrende Bestellungen in Sekunden
- Zutaten und Allergene zu jedem Artikel direkt in der App
- Mehrere Betriebe mit einem Zugang
- Alle Rechnungen im Blick, inklusive E-Rechnung
- Für Sie kostenfrei

**Ablauf in drei Schritten**

1. Formular ausfüllen, das dauert eine Minute
2. Sie erhalten Ihren persönlichen Registrierungscode von uns
3. Code in der App eingeben und bestellen

**Hinweis für Neukunden, optisch abgesetzt**

Noch nicht Kunde bei uns? Dann ist das Formular Ihr erster Schritt. Wir
melden uns persönlich bei Ihnen und klären alles Weitere.

**Primärbutton**

Beschriftung: Zugang anfordern
Ziel: https://chefslist.typeform.com/to/Isi7MsIh
Attribute: `target="_blank"` und `rel="noopener noreferrer"`

**Sekundäre Aktion daneben, zurückhaltender gestaltet**

Lieber telefonisch? 04934 91060
Die Nummer als `tel:+49493491060` verlinken, im Muster der bestehenden
`sub-phone`-Links.

**Abbinder unter den Buttons, kleine Schrift**

Chefslist ist die Bestellplattform, über die wir unsere Gewerbekunden
digital beliefern. Die Registrierung läuft über uns.

## Schritt 3: Logo

Das Chefslist-Logo liegt noch nicht vor, es ist beim Anbieter angefragt.
Die Komponente so bauen, dass oberhalb der Überschrift ein Platz dafür
vorgesehen ist, aber ohne Platzhaltergrafik und ohne Fremdeinbindung von
chefslist.de. Stattdessen den üblichen Kommentar setzen:

```html
{/* BILDPLATZ: Chefslist-Logo, Breite maximal 160 Pixel, transparenter Hintergrund */}
```

Solange kein Logo da ist, steht der Markenname nur im Text. Das ist für die
Abnahme ausreichend.

---

## Schritt 4: Testseite anlegen

Neue Datei: `src/pages/test-chefslist.astro`

Die Seite nutzt `BaseLayout` wie alle anderen Seiten, bindet die neue
Komponente ein und enthält sonst nur eine kurze Einordnung für uns selbst,
also keine Kundentexte.

Aufbau:

- Titel: `Testseite Chefslist | nicht veröffentlichen`
- Darunter ein schmaler Hinweisstreifen mit dem Text: Interne Testseite.
  Dieser Stand ist nicht freigegeben und nicht verlinkt.
- Darunter die Komponente `ChefslistCta`
- Darunter ein zweiter Durchlauf derselben Komponente auf hellem Hintergrund,
  falls die Komponente zwei Flächenvarianten bekommt, sonst entfällt das

Die Seite darf nicht in die Navigation aufgenommen werden. `Nav.astro` wird
nicht angefasst.

## Schritt 5: Seite aus dem Index halten

Die Testseite muss `noindex` tragen. Prüfen, ob `BaseLayout.astro` dafür
bereits eine Prop hat. Falls nicht, eine optionale Prop `noindex` ergänzen,
die standardmäßig `false` ist und bei `true` im Head ausgibt:

```html
<meta name="robots" content="noindex, nofollow" />
```

Die bestehenden Seiten dürfen sich dadurch nicht verändern. Zusätzlich
prüfen, ob die Seite in einer Sitemap landet, und sie dort ausschließen.

---

## Was ausdrücklich nicht gemacht wird

- Kein Einbetten des Formulars, weder per Typeform-Skript noch per iframe.
  Es wird nur verlinkt. Dadurch wird kein fremdes Skript geladen, es braucht
  keinen Einwilligungsdialog und keine Ergänzung in der
  Datenschutzerklärung. Das ist eine bewusste Entscheidung, keine
  Vereinfachung aus Zeitgründen.
- Keine Einbindung des Blocks auf `fuer-gewerbekunden.astro`,
  `grosshandel-fuer-gastronomie.astro`, `grosshandel-fuer-hotellerie.astro`
  oder `grosshandel-fuer-grossverbraucher.astro`. Das folgt erst nach der
  Abnahme.
- Keine Aussage über individuell verhandelte Preise in der App. Die
  Plattform kann das, aber nur wenn der Großhändler es freigibt, und ob
  Wilts das tut, ist offen.
- Keine Logos oder Screenshots von chefslist.de einbinden.

## Abschluss

1. `npm run build` ausführen und prüfen, ob der Build fehlerfrei durchläuft.
2. Die Seite `/test-chefslist` im Browser ansehen, auf Desktop und in
   Smartphone-Breite. Besonders darauf achten, dass die beiden Aktionen
   nebeneinander nicht umbrechen und der Hinweiskasten für Neukunden sich
   sichtbar vom übrigen Text absetzt.
3. Prüfen, dass der Primärbutton tatsächlich auf die oben genannte Adresse
   führt und in einem neuen Tab öffnet.
4. Commit mit der Nachricht:
   `K5b: Testseite mit Chefslist Call to Action, noch nicht auf den Gewerbeseiten`

## Was am Ende gemeldet wird

- Screenshot oder Beschreibung, wie der Block auf Desktop und Smartphone wirkt
- Ob `BaseLayout` für noindex angepasst werden musste
- Alles, was nicht umgesetzt werden konnte, mit Begründung
