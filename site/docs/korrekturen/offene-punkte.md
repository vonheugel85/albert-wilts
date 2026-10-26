# Offene Punkte vor dem Livegang

Stand: 2026-10-26. Reine Zustandsliste, altert schnell: beim Abhaken Zeile entfernen, nicht ergänzen.
Entscheidungen und Material liegen bei Manuel beziehungsweise beim Kunden, die Umsetzung folgt auf Ansage.

## Entscheidungen (Manuel)

| Punkt | Wo | Warum offen |
|---|---|---|
| Formular-Backend | `server.mjs`, `kontakt.astro`, `ChefslistZugang.astro`, `NewsletterSection.astro` | Alle drei Formulare posten an Platzhalter. Vorschlag: Mail-Endpunkt in `server.mjs` über Brevo oder Resend, Zieladresse info@albert-wilts.de. Danach Datenschutz ergänzen. |
| Analytics | `ConsentBanner.astro` | GA4-Mess-ID steht auf Platzhalter. Entweder echte ID oder Statistik vorerst abschalten, dann wird der Banner schlanker. |
| Newsletter-Tool | `datenschutz.astro`, `NewsletterSection.astro` | Anbieter nicht entschieden, Datenschutz-Absatz ist Platzhalter. |
| Auftragsverarbeitung Hosting | `datenschutz.astro` | AVV mit dem Hoster abschließen, dann Absatz ersetzen. |
| Bildvorrat in `public/` | `bilder/stimmung/` (rund 50), `bilder/unternehmen/` (rund 20), drei Logovarianten | Keine Seite verweist darauf, über 10 MB je Deploy. Löschen oder als Reserve behalten. |
| Livegang | Coolify, DNS | Domain albert-wilts.de an die App hängen, DNS umstellen. www-Weiterleitung und noindex für andere Hosts sind im Server fertig. |

## Material (Kunde)

| Punkt | Wo | Platz vorbereitet |
|---|---|---|
| Video Wilts Box | `box.astro`, Hero | Einbau wie Startseite, sobald die Datei vorliegt |
| Wochenblatt | `aktuelle-angebote.astro` | Grauer Platzhalter, einziger sichtbarer Stub |
| Zitate (4) | Gastronomie, Hotellerie, Großverbraucher, Wochenmarkt | Kommentar `ZITATPLATZ` mit fertigem Gerüst |
| Fotos Warengruppen (5) | Obst, Fleisch, Kräuter, Nüsse, Säfte | Kommentar `BILDPLATZ` je Seite |
| Familienfotos Historie | `ueber-uns.astro` | Zeitstrahl ohne Bilder |
| Chefslist-Logo | `ChefslistZugang.astro` | Liegt vor und ist eingebaut, Punkt erledigt |
| Grillsortiment, Mittagsgericht, Weihnachtsverkauf, Vorbestellung | Ladenverkauf, Wochenmarkt | Siehe `offene-widersprueche.md`, kein Text vorhanden |

## Vom Kunden zu klären

- „Dritte Generation" (Trustbar Sortiment) gegen „sechste Generation" im ahoi-Artikel.
- „über 55 Fruchtpürees" in der Übersichtskarte Säfte, Unterseite ist bereinigt.
- Personen im Startseiten-Video (Familie am Vordach ab Sekunde 10) sind auf der Dev öffentlich sichtbar.

## Erledigt am 23.10.2026, nur zur Einordnung

Sitemap und robots.txt, noindex außerhalb der Live-Domain, JSON-LD-Logo-Pfad, Alt-Text BereicheSection,
vier ungenutzte Dateien entfernt, Cresco-Logo abgeleitet (Weiß durch Textgrau ersetzt, Bronze-Akzent original),
Chefslist-Zugang auf allen vier Gewerbeseiten.

## Abgleich mit Fruity Notes am 24.10.2026 (WhatsApp, Mails, Aufgaben seit April)

Quelle: Vorgänge „Website Relaunch" und „Verkaufspartner Website", Aufgaben 730, 732, 891, 892, 903, 905, 957, WhatsApp-Verlauf vollständig. Nur Punkte, die im Repo noch nicht oder anders umgesetzt sind.

| Datum | Wer | Aussage (wörtlich, gekürzt) | Stand im Repo |
|---|---|---|---|
| 23.10. | Anke | „Wir sind nun momentan am neuen Markt. Die Adresse stimmt leider nicht." | Wochenmarkt Emden steht auf „Stadtgarten, Emden" (Seite, Karte, Maps-Link). Standort offenbar saisonal wechselnd, Formulierung klären. |
| 22.10. | Andree | „Es ist besser, du gelobest nicht, als dass du gelobest und nicht haltest." Soll irgendwo eingebaut werden. | Alle Zitate sind seit F2 ausgeblendet. Drittes Vater-Zitat neben „Glocken" (17.09.) und einem Zitat auf einem Bild (16.09., Text unbekannt). |
| 17.10. | Andree | Chefslist-Vorteilstext „Zutaten und Allergene in jedem Artikel": „Kannst du dir irgendwas anderes einfallen lassen? Komplettes Sortiment, sichtbar oder so." | Nutzenpunkt „Zutaten und Allergene zu jedem Artikel" steht so im Block (Textfreigabe vom 23.10.). |
| 17.10. | Andree | Bestellwege als Liste: „Telefonat gern gesehen, Mail, Fax geht auch noch, per App Chefslist." Chefslist „nicht so zentral". | Block nennt nur Telefon. Mail und Fax als Bestellwege fehlen auf den Gewerbeseiten. |
| 17.10. | Andree | „Ich meine nicht nochmal ein weiteres Anmeldeformular … nur das Icon." und „Von mir aus können wir gerne dein Formular benutzen." | Eigenes Schrittformular plus Chefslist-Siegel, laut Manuel abgesprochen. Zur Kenntnis. |
| 14.10. | Andree | „Da hätte ich gerne aber noch Bilder bei den Unterkategorien." Produktbilder: Heinemann-Produktion, Kresse, Nüsse, Tomate, Gurke (15.09.). | Fünf Warengruppen-Seiten ohne Bild, Plätze markiert. Kein Material. |
| 14.10. / 15.09. | Andree | Presse: „Wie war das dann mit dem Video?" Seine Videos sollen eingebettet und anklickbar sein. | Beide TV-Einträge offline, keine Videodatei im Repo. Welche Videos gemeint sind, ist unklar. |
| 14.10. / 23.09. / 17.09. | Andree | Historie: Familie schreibt sie „vernünftig runter", Fotos von Opa, Papa, Oma für den Zeitstrahl. | Zeitstrahl seit F2 ausgeblendet, wartet auf Text und Fotos vom Kunden. Manuel hatte am 17.09. „Historie größer, mit Galerie" zugesagt. |
| 14.10. | Andree | Ampel „jetzt geöffnet" neben dem Burger-Menü, „ein bisschen Spielerei, aber clever". | Idee, nicht gebaut. |
| 15.09. | Andree | Bewertungen: nicht dynamisch, daher „gelegentlich manuell aktualisieren" (Hinweis Manuel). | Daten in rezensionen.js, Stand Oktober. Vor Livegang prüfen. |
| 14.09. | JCC Emden | Livegang: A-Record albert-wilts.de auf 178.104.134.190, www als CNAME, albertwilts.de als 301 in Plesk. „Nach der Abnahme und Ihrer Rückmeldung." | Server fertig. Manuel meldet sich bei Herrn van der Werf. |

Geprüft und in Ordnung: Wochenmarkt nennt kein Obst und Gemüse, Kikok-Claim steht, Mopro nirgends, USt-IdNr im Impressum, „Frische-Vollsortimenter" an allen Stellen, Elka alle Sorten im 3-Liter-Gebinde, Tomaten ohne Markenname, Nobis nur Ente und Gans mit Wild aus heimischen Forsten getrennt, Heinemann bei geschälter Ware und Schnittware, Leybucht-Kartoffeln, Nature's Pride und Bedford mit Abgrenzung zur Eigenproduktion, Liefergebiet als Karte mit Andrees Ortsliste, ahoi-PDF, Wilts Box mit Bildern beim Klick, Vegan und Allergiker gestrichen, Ponthier nur gekühlt im 1-Kilo-Gebinde.

## Aus dem Auftrag vom 26.10.2026 (K6) offen geblieben

| Punkt | Stand | Warum offen |
|---|---|---|
| Juist im Liefergebiet | Juist steht nicht auf der Seite | Andree nannte Juist am 15.10.2026 in seiner Ortsliste, Manuel strich die Insel am 25.10.2026 ausdrücklich als Fehler („liefert nicht nach Juist"). Der Auftrag vom 26.10. wollte sie wieder einfügen. Bis zur Klärung bleibt sie draußen, weil „wir liefern nach X" eine Zusage an Kunden ist. Betrifft Liste auf /fuer-gewerbekunden, Karte und CLAUDE.md. |
| Cresco-Logo auf der Kräuter-Seite | unverändert, Logo wird angezeigt | Der Auftrag ging davon aus, die Datei existiere nicht. Sie existiert seit 23.10.2026, ist von Weiß auf Textgrau umgefärbt und wird auf der Dev mit HTTP 200 ausgeliefert. |
| Manufaktur und hausgemacht | unverändert, 13 Fundstellen | Berührt die Abgrenzung zwischen eigener Herstellung, Heinemann und Bedford, wird separat entschieden. |
| Vertriebspartner Koppert Cress | Satz steht unverändert auf der Kräuter-Seite | Stützt sich allein auf eine telefonische Aussage des Kunden, auf der Partnerseite nicht nachweisbar. |
| Sortenlisten Ponthier und Tovano | stehen unverändert | Aus den Herstellersortimenten abgeleitet, vom Kunden nicht bestätigt. Ponthier: Passionsfrucht, Yuzu, Sanddorn. Tovano: sieben Nusssorten. |
