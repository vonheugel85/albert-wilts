# Offene Punkte

Stand: 2026-10-27, nach dem Livegang. Reine Zustandsliste, altert schnell: beim Abhaken Zeile entfernen, nicht ergänzen.
Entscheidungen und Material liegen bei Manuel beziehungsweise beim Kunden, die Umsetzung folgt auf Ansage.

## Entscheidungen (Manuel)

| Punkt | Wo | Warum offen |
|---|---|---|
| Newsletter an Listmonk | Coolify-Umgebung | Code steht, aber `LISTMONK_URL` und `LISTMONK_LIST_UUID` fehlen in der App. Gemessen am 27.10.2026: die Anmeldung auf der Dev antwortet 503. Voraussetzung ist, dass die Liste in Listmonk auf public und Double-Opt-in steht. |
| Brevo-Absender | Coolify-Umgebung | `albert-wilts.de` ist seit 27.10.2026 in Brevo authentifiziert, die vier DNS-Einträge stehen. `FORM_FROM_EMAIL` zeigt weiter auf `post@vonheugel.de`. Offen ist, ob auf eine Adresse des Kunden umgestellt wird, sie müsste dann in Brevo als Absender angelegt sein. |
| Brevo-Tracking-Pixel | Brevo-Konto | Brevo hängt auch an Textmails ein Zählpixel. Im Konto abschaltbar, bisher nicht geschehen. |
| Analytics | `ConsentBanner.astro` | Mess-ID steht auf `G-XXXXXXXXXX`, Analytics lädt dadurch nicht. Manuel setzt sie beim Livegang. |
| Bildvorrat in `public/` | 28 MB Bilder, 6 MB Video | Ein Teil der Dateien wird von keiner Seite verwendet. Löschen oder als Reserve behalten. |

## Material (Kunde)

| Punkt | Wo | Platz vorbereitet |
|---|---|---|
| Wochenblatt | `_aktuelle-angebote.astro` | Seite am 27.10.2026 komplett ausgeblendet, weil kein Angebot vorliegt. Unterstrich-Präfix hält sie aus Build und Sitemap. Verweise in Navigation, Info-Leiste, Quicklinks und auf Ladenverkauf stehen als Kommentar im Code. |
| Zitate (4) | Gastronomie, Hotellerie, Großverbraucher, Wochenmarkt | Blöcke sind ganz entfernt, Wiederaufbau über die Git-Historie. Das CSS für Zitat und O-Ton steht noch. |
| Fotos Warengruppen (5) | Obst, Fleisch, Kräuter, Nüsse, Säfte | Kommentar `BILDPLATZ` je Seite |
| Historie und Familienfotos | `ueber-uns.astro` | Zeitstrahl als Kommentar ausgeblendet, Text und Fotos fehlen |
| Personalfoto | `ueber-uns.astro`, Mitarbeiterblock | Kommentar `BILDPLATZ`, altes Flurfoto vom Kunden angekündigt |

## Vom Kunden zu klären

- Einwilligung der Personen im Startseiten-Video und auf den Marktfotos.
- „über 55 Fruchtpürees" in der Übersichtskarte Säfte, Unterseite ist bereinigt.
- Bewertungen in `rezensionen.js` stehen auf dem Stand Oktober und werden nicht automatisch nachgeladen.

## Abgleich mit Fruity Notes am 24.10.2026 (WhatsApp, Mails, Aufgaben seit April)

Quelle: Vorgänge „Website Relaunch" und „Verkaufspartner Website", Aufgaben 730, 732, 891, 892, 903, 905, 957, WhatsApp-Verlauf vollständig. Nur Punkte, die im Repo noch nicht oder anders umgesetzt sind.

| Datum | Wer | Aussage (wörtlich, gekürzt) | Stand im Repo |
|---|---|---|---|
| 23.10. | Anke | „Wir sind nun momentan am neuen Markt. Die Adresse stimmt leider nicht." | Erledigt am 23.10.2026, steht auf „Neuer Markt, Emden". |
| 22.10. | Andree | „Es ist besser, du gelobest nicht, als dass du gelobest und nicht haltest." Soll irgendwo eingebaut werden. | Alle Zitate sind seit F2 ausgeblendet. Drittes Vater-Zitat neben „Glocken" (17.09.) und einem Zitat auf einem Bild (16.09., Text unbekannt). |
| 17.10. | Andree | Chefslist-Vorteilstext „Zutaten und Allergene in jedem Artikel": „Kannst du dir irgendwas anderes einfallen lassen? Komplettes Sortiment, sichtbar oder so." | Nutzenpunkt „Zutaten und Allergene zu jedem Artikel" steht so im Block (Textfreigabe vom 23.10.). |
| 17.10. | Andree | Bestellwege als Liste: „Telefonat gern gesehen, Mail, Fax geht auch noch, per App Chefslist." Chefslist „nicht so zentral". | Block nennt nur Telefon. Mail und Fax als Bestellwege fehlen auf den Gewerbeseiten. |
| 17.10. | Andree | „Ich meine nicht nochmal ein weiteres Anmeldeformular … nur das Icon." und „Von mir aus können wir gerne dein Formular benutzen." | Eigenes Schrittformular plus Chefslist-Siegel, laut Manuel abgesprochen. Zur Kenntnis. |
| 14.10. | Andree | „Da hätte ich gerne aber noch Bilder bei den Unterkategorien." Produktbilder: Heinemann-Produktion, Kresse, Nüsse, Tomate, Gurke (15.09.). | Fünf Warengruppen-Seiten ohne Bild, Plätze markiert. Kein Material. |
| 14.10. / 15.09. | Andree | Presse: „Wie war das dann mit dem Video?" Seine Videos sollen eingebettet und anklickbar sein. | Beide TV-Einträge offline, keine Videodatei im Repo. Welche Videos gemeint sind, ist unklar. |
| 14.10. / 23.09. / 17.09. | Andree | Historie: Familie schreibt sie „vernünftig runter", Fotos von Opa, Papa, Oma für den Zeitstrahl. | Zeitstrahl als Kommentar ausgeblendet, wartet auf Text und Fotos. Siehe Tabelle Material oben. |
| 14.10. | Andree | Ampel „jetzt geöffnet" neben dem Burger-Menü, „ein bisschen Spielerei, aber clever". | Idee, nicht gebaut. |
| 15.09. | Andree | Bewertungen: nicht dynamisch, daher „gelegentlich manuell aktualisieren" (Hinweis Manuel). | Daten in rezensionen.js, Stand Oktober. Vor Livegang prüfen. |

Geprüft und in Ordnung: Wochenmarkt nennt kein Obst und Gemüse, Kikok-Claim steht, Mopro nirgends, USt-IdNr im Impressum, „Frische-Vollsortimenter" an allen Stellen, Elka alle Sorten im 3-Liter-Gebinde, Tomaten ohne Markenname, Nobis nur Ente und Gans mit Wild aus heimischen Forsten getrennt, Heinemann bei geschälter Ware und Schnittware, Leybucht-Kartoffeln, Nature's Pride und Bedford mit Abgrenzung zur Eigenproduktion, Liefergebiet als Karte mit Andrees Ortsliste, ahoi-PDF, Wilts Box mit Bildern beim Klick, Vegan und Allergiker gestrichen, Ponthier nur gekühlt im 1-Kilo-Gebinde.

## Aus dem Auftrag vom 26.10.2026 (K6) offen geblieben

| Punkt | Stand | Warum offen |
|---|---|---|
| Cresco-Logo auf der Kräuter-Seite | unverändert, Logo wird angezeigt | Der Auftrag ging davon aus, die Datei existiere nicht. Sie existiert seit 23.10.2026, ist von Weiß auf Textgrau umgefärbt und wird auf der Dev mit HTTP 200 ausgeliefert. |
| Manufaktur und hausgemacht | Regel steht seit 26.10.2026 in CLAUDE.md, zwei Fundstellen bleiben zu klären | Erlaubt, solange der richtige Hersteller gemeint ist. Offen: ob die Feinkostsalate in der Box und die Geflügelsalate auf dem Wochenmarkt aus eigener Herstellung kommen oder von Heinemann. Beide Stellen schreiben sie Wilts zu. |
| Vertriebspartner Koppert Cress | Satz steht unverändert auf der Kräuter-Seite | Stützt sich allein auf eine telefonische Aussage des Kunden, auf der Partnerseite nicht nachweisbar. |
| Sortenlisten Ponthier und Tovano | stehen unverändert | Aus den Herstellersortimenten abgeleitet, vom Kunden nicht bestätigt. Ponthier: Passionsfrucht, Yuzu, Sanddorn. Tovano: sieben Nusssorten. |
