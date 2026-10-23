# Offene Punkte vor dem Livegang

Stand: 2026-10-23. Reine Zustandsliste, altert schnell: beim Abhaken Zeile entfernen, nicht ergänzen.
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
