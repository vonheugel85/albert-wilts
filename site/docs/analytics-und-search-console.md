# Search Console und Analytics

Stand: 2026-10-28. Entscheidungen und Begruendungen, keine Zustandsliste.
Beides liegt im Google-Konto manuel@vonheugel.de.

## Search Console

Property-Typ **URL-Praefix** auf `https://albert-wilts.de`, bestaetigt ueber die
Datei `site/public/google29a3962a71cb92d1.html`.

**Diese Datei muss liegen bleiben.** Google prueft sie regelmaessig nach; wird
sie entfernt, verfaellt die Bestaetigung und die Property verliert ihre Daten.

Eine **Domain-Property** waere vollstaendiger: Sie deckt zusaetzlich `www`,
`http` und alle Subdomains ab, etwa `dev.` und spaeter `news.`. Sie verlangt
aber einen DNS-TXT-Eintrag, den nur JCC setzen kann. Mit der Datei ging es ohne
fremde Mitwirkung.

Die Domain-Property ist seit 28.10.2026 angelegt und wartet auf den Eintrag:

```
TXT   albert-wilts.de   google-site-verification=U-1QpKBqXAa28DFLGi6QhvzGPAZ9wHI8o9-V7eU0vps
```

Sobald JCC ihn gesetzt hat, laesst sie sich in der Search Console bestaetigen.
Danach stehen beide Properties nebeneinander; die URL-Praefix-Property kann
bleiben, ihre Daten reichen weiter zurueck.

Sitemap `sitemap-index.xml` eingereicht, Status "Erfolgreich", 20 Seiten erkannt.
Direkt nach dem Einreichen stand dort "Konnte nicht abgerufen werden": Das ist
Googles Zwischenstand vor dem ersten Abruf, kein Fehler.

## Analytics

Eigenes Konto **"Albert Wilts e.K."**, passend zur Struktur der uebrigen Kunden
(ein Konto je Kunde). Property `albert-wilts.de`, Zeitzone Deutschland, Waehrung
Euro. Mess-ID **G-J8DQ250ZG2**, eingetragen in `ConsentBanner.astro`.

Geladen wird gtag ausschliesslich nach Einwilligung in die Kategorie Statistik.
Ohne Einwilligung und nach "Nur notwendige" entsteht keine Verbindung zu Google.

### Schluesselereignisse

Fuenf Ereignisse, im Code ausgeloest ueber `window.awEvent` (definiert in
`BaseLayout.astro`):

| Ereignis | ausgeloest durch |
|---|---|
| `kontaktformular` | Kontaktformular erfolgreich abgeschickt |
| `chefslist_anfrage` | Chefslist-Zugang angefordert, mit `bestandskunde` ja/nein |
| `newsletter_anmeldung` | Newsletter-Anmeldung abgeschickt |
| `telefon_klick` | Klick auf eine Telefonnummer, ueberall auf der Seite |
| `email_klick` | Klick auf eine E-Mail-Adresse |

Telefon und E-Mail haengen an einem Listener am Dokument, nicht an einzelnen
Links. Bei einem Grosshandel ist der Anruf der haeufigste Weg, nicht das Formular.

Angelegt wurden sie ueber "Ereignis erstellen" mit der Variante **"Mit Code
erstellen"**. Der uebliche Weg, den Stern in der Ereignisliste zu setzen, geht
erst, wenn ein Ereignis zum ersten Mal eingegangen ist, und das dauert bis zu
24 Stunden. Ueber die Code-Variante liessen sie sich sofort hinterlegen.

In der Liste stehen zusaetzlich `close_convert_lead`, `qualify_lead` und
`purchase`. Die hat Google aus den gewaehlten Geschaeftszielen angelegt. Sie
werden nie ausgeloest, weil es dafuer keinen Code gibt. Sie stoeren nicht und
bleiben deshalb stehen.

### Datenschutzeinstellungen

Bewusst gesetzt, nicht die Vorgabe:

- Datenfreigabe "Google-Produkte und -Dienste": **aus**. Sonst duerfte Google
  die Daten des Kunden fuer eigene Werbeprodukte verwenden.
- Datenfreigabe "Empfehlungen fuer Ihr Unternehmen": **aus**. Reines Marketing
  fuer Google, ohne Nutzen fuer den Kunden.
- Nutzungsbedingungen mit Region **Deutschland** akzeptiert, dazu die
  Datenverarbeitungsbedingungen nach DSGVO. Letztere sind der
  Auftragsverarbeitungsvertrag mit Google und fuer EWR-Unternehmen Pflicht.
- Datenaufbewahrung: Ereignisdaten 2 Monate, Nutzerdaten 14 Monate,
  "bei neuer Nutzeraktivitaet zuruecksetzen" **aus**. Mit dieser Option waere
  die Frist bei jedem Besuch neu gestartet, ein regelmaessiger Besucher waere
  nie geloescht worden. Die Datenschutzerklaerung nennt 14 Monate, das passt
  jetzt zusammen.

Die Daten laufen ueber `region1.google-analytics.com`, den EU-Endpunkt.

### Was noch offen ist

Andree Wilts hat keinen eigenen Zugriff auf Search Console und Analytics. Beides
haengt an manuel@vonheugel.de. Falls der Kunde selbst hineinsehen soll, braucht
er eine Einladung mit Leserechten.
