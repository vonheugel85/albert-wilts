# Newsletter: eigene Listmonk-Instanz

Stand: 2026-11-10. Entscheidungen und Begruendungen, keine Zustandsliste.

## Warum eine eigene Instanz

Bis zum 27.10.2026 zeigte die Konfiguration auf `news.vonheugel.de`. Diese
Instanz wurde am 10.07.2026 als Teil des eigenen Infrastruktur-Blueprints
aufgesetzt (dort als "App C" gefuehrt); der Konfigurationsblock war samt
Kommentar ins Kundenprojekt kopiert worden, die eingetragene Listen-UUID war
nie gueltig.

Dagegen sprachen drei Dinge: Bestaetigungs- und Abmeldelinks haetten eine
fremde Domain getragen, die Abonnentendaten des Kunden haetten neben eigenen
gelegen, und der Newsletter haenge dauerhaft an fremder Infrastruktur.
Umgestellt wurde, solange die Liste null Abonnenten hatte, weil ein spaeterer
Wechsel neue Einwilligungen erfordert haette.

Coolify-Service `albert-wilts-newsletter` im Projekt `albert-wilts`, eigener
Container mit eigener Postgres. Zugangsdaten, UUIDs und API-Token stehen in
`env.local` unter dem Praefix `AW_LISTMONK_`.

## Domain

Seit 01.11.2026 laeuft die Instanz unter `https://news.albert-wilts.de` mit
Let's-Encrypt-Zertifikat. Davor lief sie unter einer sslip.io-Adresse ohne TLS,
weil der A-Record bei JCC fehlte. Gesetzt in Coolify am Service-Container
`listmonk` als `https://news.albert-wilts.de:9000`; das `:9000` ist der
Container-Port, den Coolify fuer das Routing braucht, nach aussen bleibt es 443.
Per API laesst sich die Domain eines Service-Containers nicht setzen, das ging
nur ueber die Oberflaeche.

`app.root_url` in Listmonk zeigt auf die neue Domain, ebenso `LISTMONK_URL`
der Website in Coolify. Die alte sslip.io-Adresse antwortet mit 404.

Zum Zeitpunkt der Umstellung hatte die Liste einen echten Abonnenten
(angemeldet am 29.10.2026). Sein Abmeldelink aus der Bestaetigungsmail zeigt
noch auf die alte Adresse und ist damit tot; er kann sich ueber den Link in
jeder kuenftigen Newsletter-Mail abmelden.

## Die Sie-Ansprache haengt an einer Datei im Volume

Listmonk duzt in der Standardauslieferung. Eine eigene Vorlage fuer die
Opt-in-Mail ist nicht moeglich, die Datenbank kennt nur die Template-Typen
`campaign`, `campaign_visual` und `tx`. Der Text kommt aus der Sprachdatei.

Deshalb liegt eine angepasste `de.json` im Upload-Volume des Containers
(`/listmonk/uploads/de.json`, hochgeladen ueber die Medien-API), und
`LISTMONK_i18n_dir` zeigt auf `/listmonk/uploads`. Geaendert sind 18 Strings
in den Namensraeumen `email.*` und `public.*`, also alles, was ein Abonnent
zu sehen bekommt. Die Admin-Oberflaeche bleibt beim Original.

**Diese Datei liegt nicht im Repo.** Sie ueberlebt Neustarts, aber nicht das
Loeschen des Volumes.

**Beim Listmonk-Update pruefen.** Die Datei muss zur laufenden Version passen:
Sie ersetzt die eingebaute vollstaendig, und ein Schluessel, den die neue
Version erwartet und der in der Datei fehlt, faellt stumm auf Englisch zurueck.
Genau das passierte am 27.10.2026, als zuerst die Datei vom `master`-Branch
verwendet wurde, waehrend der Container v6.0.0 fuhr: Das Template erwartet
`email.optin.confirmSubTitle`, `email.optin.confirmSubInfo` und
`email.optin.confirmSub`, in `master` heissen dieselben Texte
`globals.buttons.confirmSubscription` und `public.confirmSubInfo`. Ergebnis war
eine halb englische Bestaetigungsmail. Richtige Quelle ist daher immer der Tag
der laufenden Version, nicht `master`.

Nach jedem Update eine Testanmeldung durchfuehren und die Mail ansehen.

## Die Anrede

Listmonks Opt-in-Vorlage begruesst mit "Guten Tag" und dem Vornamen. Das
Website-Formular uebergibt keinen Namen, Listmonk setzt dann den Teil vor dem
@ ein ("Guten Tag info"). Seit 01.11.2026 lautet die Anrede in der eigenen
`subscriber-optin.html` schlicht "Guten Tag," ohne Namen, siehe unten.

## Erscheinungsbild im CI der Website

Listmonk kommt in Blau (`#0055d4`) mit eigenem Logo. Am 01.11.2026 auf das CI
der Website umgestellt (Gruen `#4F7146`, Hover `#3D5A36`, Schrift IBM Plex Sans
und Caladea, Radius 6px). Drei Stellen, drei Mechanismen:

**Oeffentliche Seiten** (Anmeldung, Opt-in-Bestaetigung, Abmeldung): ueber
`appearance.public.custom_css` in den Settings, wird als `/public/custom.css`
nach dem Standard-Stylesheet geladen und ueberschreibt nur Farben, Schrift
und Radien. Die Schriften liegen als woff2 in den Listmonk-Medien
(`/uploads/`), nicht bei Google, aus demselben Grund wie auf der Website.
Logo ueber `app.logo_url`, Favicon ueber `app.favicon_url`. Listmonks Seitenfuss
"Unterstuetzt von listmonk" ist per `footer.container { display: none }`
ausgeblendet.

**Kampagnen**: eigenes Template "Albert Wilts" (id 5) als Standard. Kopf mit
Logo, Fuss mit Firmierung, Adresse, Telefon, Abmelden, Im-Browser-ansehen,
Impressum und Datenschutz. Die mitgelieferten Templates 1 bis 4 bleiben
unveraendert liegen.

**Systemmails** (Opt-in-Bestaetigung, Abmeldung, SMTP-Test usw.) kommen aus
Listmonks eingebetteten `static/email-templates`. Ueberlagert ueber
`LISTMONK_static_dir=/listmonk/uploads/static`: Listmonk mischt daraus Datei
fuer Datei ueber die eingebetteten (`fs.Merge` in `cmd/init.go`), und nur die
Unterordner, die es dort gibt. Es liegen zwei Dateien darin:
`base.html` (Kopf mit Logo 160px, Farben, Fuss mit Firmierung, Adresse,
Telefon, Impressum, Datenschutz, ohne "Unterstuetzt von listmonk") und
`subscriber-optin.html` (Anrede ohne Namen). Alle anderen Vorlagen bleiben
die eingebetteten, erben aber Kopf und Fuss aus `base.html`.

Der Medien-Upload legt keine Unterordner an. Deshalb hat der
Listmonk-Container in der Coolify-Compose ein `command`, das beim Start
`/listmonk/uploads/static/email-templates/` anlegt, `base.html` und
`subscriber-optin.html` aus `/listmonk/uploads/` hineinkopiert und dann
`exec ./listmonk` ausfuehrt. Die Quelldateien liegen also als normale
Medien in Listmonk (`/uploads/base.html`, `/uploads/subscriber-optin.html`).

**Vorlage aendern:** Medieneintrag in Listmonk loeschen, neue Datei mit
demselben Namen hochladen (sonst haengt Listmonk ein Suffix an), Service in
Coolify neu starten, Testanmeldung, Mail ansehen, Testabonnent loeschen.
Beim Listmonk-Update dasselbe pruefen wie bei der Sprachdatei: Die
Vorlagen muessen zur Version passen, Quelle ist der Tag der laufenden
Version (`static/email-templates/` im Repo).

**Logo als PNG, nicht SVG.** `app.logo_url` gilt fuer Seiten und Mails
zugleich. Gmail und Outlook zeigen SVG in Mails nicht an, deshalb liegt das
Logo als PNG (360px breit, aus dem SVG gerendert) unter
`/uploads/albert-wilts-logo-mail.png`. Das SVG liegt daneben, wird aber
nicht referenziert. Die Breite in der Mail setzt `base.html` fest auf
160px; ohne diese Angabe erschien das PNG in voller Groesse. Geprueft mit
drei Testanmeldungen (SVG, PNG ohne Breite, PNG mit eigener Vorlage),
Testabonnenten danach geloescht.

**Falle bei `PUT /api/settings`.** Die Route will das komplette
Settings-Objekt. Das SMTP-Passwort kommt beim GET maskiert zurueck; Listmonk
behaelt beim PUT zwar den alten Wert, wenn die Maske zurueckgeschickt wird,
aber wer es explizit setzt, muss den richtigen Schluessel nehmen: Der
Listmonk-SMTP-Benutzer ist `BREVO_SMTP_USER`, das Passwort `BREVO_SMTP_KEY`
aus `env.local`. `SMTP_PASS` dort gehoert zu einem anderen Konto. Genau das
ging am 01.11.2026 einmal schief und wurde mit einem zweiten PUT behoben,
Versand danach per Testanmeldung bestaetigt. Jeder PUT startet Listmonk neu
(etwa acht Sekunden).

Beobachtung: Gmail sortierte die Opt-in-Mail unter "Werbung" ein.

## Kampagnen

Die erste Kampagne "Wochenangebote KW 46" (Listmonk-ID 2) ist vom Kunden
abgenommen und fuer den 11.11.2026, 8.00 Uhr deutscher Zeit geplant
(Status `scheduled`, in Listmonk als 07:00 UTC angezeigt). Empfaenger sind
die bestaetigten Abonnenten der Liste "Albert Wilts Newsletter", unbestaetigte
bekommen nichts. Vor der Planung am 10.11.2026 geprueft: Inhalt wortgleich
mit den KW-46-Daten in `src/data/angebote.js`, Schreibregeln aus `CLAUDE.md`,
Template 5, Fusszeile mit Firmierung, Impressum, Datenschutz und
Abmeldelink, alle Links 200, SMTP Brevo aktiv, DKIM fuer Brevo in der Zone.

Planen per API: `PUT /api/campaigns/<id>` mit dem vollstaendigen
Kampagnenobjekt und `send_at` als ISO-Zeit mit Offset, danach
`PUT /api/campaigns/<id>/status` mit `{"status":"scheduled"}`. Das Feld
`to_send` bleibt bis zum Start 0, das ist kein Fehler.

Zwei bekannte Schwaechen, nicht blockierend: Der Preheader im Template ist
leer, Mailprogramme zeigen den ersten Satz des Textes. Die Ortskuerzel
"Laden" und "Markt" kommen aus `ortLabel` in `angebote.js` und stehen so auch
auf der Website; die Projektregel "Ladenverkauf" gilt fuer Fliesstext, eine
Umstellung muesste an beiden Stellen erfolgen.

Der SPF-Eintrag von albert-wilts.de nennt Brevo nicht (`include:ispgateway.de
-all`). Zustellung funktioniert, weil Brevo einen eigenen Rueckweg nutzt und
DKIM fuer DMARC reicht. Brevo empfiehlt `include:spf.brevo.com`, das waere ein
weiterer Eintrag fuer JCC.
