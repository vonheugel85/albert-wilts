# Newsletter: eigene Listmonk-Instanz

Stand: 2026-11-22. Entscheidungen und Begruendungen, keine Zustandsliste.

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

## Woechentlicher Ablauf

Seit KW 47 baut Claude den Newsletter komplett, Manuel liefert die
Angebotsblaetter und gibt frei. Verfahrensdetails stehen am Skript
(`scripts/newsletter-body.mjs`, Dateikopf), hier nur Reihenfolge und Gruende.

1. **Angebote auf die Website.** Die Word-Dateien (bisher je eine fuer Laden
   und Markt) in `src/data/angebote.js` uebertragen: abgelaufene Woche raus,
   laufende bleibt, neue Woche hinten anhaengen. Erst committen und pushen,
   denn der Button im Newsletter zeigt auf `/aktuelle-angebote/`; ist die
   Seite beim Versand nicht live, sehen die Leser die alte Woche.
2. **Body erzeugen.** `node scripts/newsletter-body.mjs --intro-datei intro.txt`
   aus `site/`. Die Einleitung ist ein Absatz pro Woche, alles andere kommt aus
   den Daten. Das Skript bricht bei Verstoessen gegen die Schreibregeln ab.
   "Hausgemacht" vom Angebotsblatt nur mit bekanntem Hersteller uebernehmen
   (`CLAUDE.md`).
3. **Kampagne anlegen.** `POST /api/campaigns`: Name "Wochenangebote KW nn",
   Liste 3, Template 5, Absender `Albert Wilts <info@albert-wilts.de>`,
   Betreff nach dem Muster "Unsere Angebote vom ... bis ..., mit X und Y".
4. **Testmail und Freigabe.** `POST /api/campaigns/<id>/test` an Manuel.
   Geplant wird erst nach seiner Freigabe.
5. **Planen.** Termin nennt Manuel (bisher KW 46 Dienstag 9.05 Uhr, KW 47
   Sonntag 18 Uhr vor der Angebotswoche). API-Aufrufe siehe unten.
6. **Versandkontrolle.** Nach dem Start `sent` gegen `to_send` in Listmonk,
   dann Brevo-Ereignisse `requests` und `error` fuer den Versandzeitraum.
   Fehler "insufficient credits" heisst Kontingent erschoepft, siehe Befund
   KW 46 und Abschnitt Tarif.
7. **Doku.** Kampagne unten mit ID, Termin, Empfaengerzahl und Abweichungen
   vom Angebotsblatt eintragen.

Regeln dabei: Token per `grep` aus `env.local`, nie per `source`, nie im
Chat ausgeben. Abonnenten nur zaehlen, keine Adressen in Chat oder Doku.

Herkunft KW 46: Kampagne 2 wurde am 08.11.2026 angelegt, nicht von Manuel
selbst und aus keiner Claude-Code-Sitzung auf dem Arbeitsrechner (Verlaeufe
am 22.11.2026 durchsucht). Wer sie gebaut hat, ist offen; Listmonk speichert
den Ersteller nicht.

## Kampagnen

Die erste Kampagne "Wochenangebote KW 46" (Listmonk-ID 2) ist vom Kunden
abgenommen und fuer den 10.11.2026, 9.05 Uhr deutscher Zeit geplant
(Status `scheduled`, in Listmonk als 08:05 UTC angezeigt). Zuerst war der
11.11.2026, 8 Uhr eingetragen, das war ein Missverstaendnis, der Versand
sollte von Anfang an am Dienstag erfolgen. Empfaenger sind
die bestaetigten Abonnenten der Liste "Albert Wilts Newsletter", unbestaetigte
bekommen nichts. Vor der Planung am 10.11.2026 geprueft: Inhalt wortgleich
mit den KW-46-Daten in `src/data/angebote.js`, Schreibregeln aus `CLAUDE.md`,
Template 5, Fusszeile mit Firmierung, Impressum, Datenschutz und
Abmeldelink, alle Links 200, SMTP Brevo aktiv, DKIM fuer Brevo in der Zone.

Zweite Kampagne "Wochenangebote KW 47" (Listmonk-ID 3): geplant fuer
Sonntag, 15.11.2026, 18.00 Uhr deutscher Zeit (17:00 UTC), also am Abend vor
der Angebotswoche 17. bis 21.11.2026, Empfaenger die bestaetigten Abonnenten
der Liste (878 am Planungstag). Der Body wurde nicht von Hand geschrieben,
sondern per Skript aus `wochen[1]` in `src/data/angebote.js` erzeugt, Kopf
bis Saison-Block neu, Fuss ab dem Button byteweise aus KW 46 uebernommen.
Website und Newsletter koennen so nicht auseinanderlaufen. Das Skript liegt seit
15.11.2026 im Repo: `scripts/newsletter-body.mjs`, Aufruf im Dateikopf. Abweichungen vom
Angebotsblatt: "Hausgemachte Erbsensuppe" und "Hausgemachter Gefluegelsalat"
stehen ohne "hausgemacht", weil der Hersteller nicht feststeht (Projektregel
in `CLAUDE.md`). Vor der Planung geprueft: gespeicherter Body gleich Datei,
Vorschau mit Template 5 gerendert, alle Links 200, Schreibregeln.

Dritte Kampagne "Weihnachtsverkauf 2026" (Listmonk-ID 4): Sonderausgabe zum
Weihnachtsverkauf am Freitag, 27.11.2026, versendet Sonntag, 22.11.2026,
20.00 Uhr an 903 bestaetigte Abonnenten (Listmonk fertig um 20.00 Uhr).
Brevo hat alle 903 bis 20.01 Uhr angenommen, kein Fehler, keine
Kontingentsperre; drei Mails mit "451 Try again later" zurueckgestellt
(Greylisting beim Empfaenger, Brevo stellt erneut zu).
Grundgeruest per Skript aus der Weihnachtsverkauf-Woche in `angebote.js`,
danach von Hand ergaenzt: Einladungs-Kasten mit Hirsch und Familienprogramm
vor dem Mittagsgericht, Adventsfreitage vor dem Button, Vorbestell-Block mit
Bestellschluss und Bestellwegen. Inhalte von `/weihnachtsverkauf`. Der Hirsch
liegt als JPG in der Listmonk-Mediathek (`/uploads/weihnachtsverkauf-hirsch-mail.jpg`),
weil nicht jedes Mailprogramm WebP zeigt. Bewusst weggelassen: "aus eigener
Schlachtung" beim Highland-Rind (Herstellerregel in `CLAUDE.md`, noch offen)
und die Knabbersalami-Aktion, die nur fuer Neuanmeldungen gilt. Mobil
gemessen: Der Titel "Weihnachtsverkauf" in 32 px hat die Mail bei 375 px um
70 px verbreitert, deshalb 26 px; Faustregel fuer eigene Bloecke: kein
einzelnes Wort ueber 260 px Breite inklusive Innenabstand.

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

## Versand KW 46: Befund Brevo (10. und 11.11.2026)

Listmonk hat alle 879 Mails fehlerfrei ans Brevo-Relay uebergeben (Log nur
Start und Ende, 17 Sekunden). Brevo hat sie aber in drei Schueben
verarbeitet: 419 um 9.05 Uhr, 300 um 11.21 Uhr, 161 am 11.11. gegen 1 Uhr
nachts. Grund laut Brevo-Ereignisprotokoll: "insufficient credits". Brevo
haelt Mails ohne Guthaben in einer Warteschlange und schiebt sie nach dem
Tageswechsel nach, verwirft sie nicht. 161 Kunden haben die Dienstagsangebote
deshalb erst Mittwoch frueh bekommen.

Ursache: Der SMTP-Zugang gehoert zum Brevo-Konto der Agentur, nicht zu einem
eigenen Konto fuer Albert Wilts. Ueber denselben Zugang laufen auch
Kontaktformulare und Mails anderer Projekte, das Tageskontingent teilen sich
alle. Das wiederholt sich bei jedem Wochenversand, solange der Tarif nicht
angehoben oder ein eigenes Konto angelegt wird. Entscheidung am 15.11.2026:
Agenturkonto auf Standard angehoben, kein eigenes Konto, siehe Abschnitt
"Brevo-Konto und Tarif".

Zustellung war sonst gut: 3 Hard Bounces, 9 Soft Bounces, 0 Spam-Meldungen,
0 Abmeldungen; rund 380 eindeutige Oeffnungen und 81 eindeutige Klicks auf
879 Mails.

Zweiter Befund: Listmonk zaehlt fuer die Kampagne 0 Oeffnungen, 0 Klicks und
0 Bounces, Brevo zaehlt alle drei. Der Bounce-Webhook von Brevo nach Listmonk
ist nicht wirksam, das Listmonk-Tracking greift nicht. Folge: gebouncte
Adressen bleiben in der Liste und werden erneut angeschrieben. Nicht
dringend, aber offen.

Pruefweg: Brevo-API `GET /v3/smtp/statistics/events?event=requests`
(auch `error`, `hardBounces`, `deferred`) mit `startDate`/`endDate`, Schluessel
`BREVO_API_KEY` aus `env.local`. Der Schluessel darf Konto und Guthaben nicht
lesen (`/v3/account` liefert 403), Tarif und Restguthaben zeigt nur das
Brevo-Dashboard. Abonnentenadressen aus den Ereignissen nicht in den Chat
schreiben, nur zaehlen.

## Brevo-Konto und Tarif (Stand 15.11.2026)

Der SMTP-Zugang und der API-Schluessel "albert-wilts-website" (angelegt
24.10.2026) gehoeren zum Brevo-Konto "von Heugel" der Agentur, Kontomails
gehen an Manuels Agenturadresse. Ueber dasselbe Konto laufen zwei
Wilts-Integrationen: Listmonk (Newsletter, Anmeldebestaetigungen) und das
Kontaktformular der Wilts-Website (BREVO_SMTP-Werte aus `env.local`, in
Coolify als Umgebungsvariablen der Website-App). Bei einem spaeteren
Kontowechsel muessen beide Stellen den neuen Schluessel bekommen.

Verteilung der letzten 30 Tage (16.10. bis 15.11.2026): rund 935 Mails von
info@albert-wilts.de, zusammen rund 140 von newsletter@, post@ und
manuel@vonheugel.de (Opt-in-Bestaetigungen, Kontaktformular, Stellwerk,
Website-Checks). Albert Wilts ist damit rund 90 Prozent des Kontos.

Entscheidung (Manuel, 15.11.2026): Das Agenturkonto wurde auf den Tarif
Standard angehoben, ein eigenes Konto fuer Albert Wilts wird vorerst nicht
angelegt. Gebucht laut Brevo-Dashboard am 15.11.2026: Standard, 5.000 Mails
pro Monat, Jahreszahlung bis 15.11.2027, Kontingent erneuert sich jeweils
am 15. des Monats (erstmals 15.12.2026). Damit entfaellt das Tageslimit, es
gilt nur noch das Monatsvolumen. Die 5.000 sind knapp: Wilts rund 3.900 plus
rund 140 der anderen Projekte, ein Monat mit fuenf Dienstagen oder ein
Zusatzmailing liegt darueber. Erster kritischer Abschnitt ist 15.12.2026 bis
15.01.2027 mit fuenf Dienstagen und Weihnachten. Vorher auf 10.000 heben
oder Prepaid-Guthaben nachlegen, sonst haelt Brevo den Rest wieder bis zur
Erneuerung zurueck. Grund gegen das eigene Konto: neuer
SMTP-Schluessel an zwei Stellen, erneute Domainpruefung, Freischaltfrist von
ein bis zwei Tagen vor dem naechsten Dienstagsversand.

Bedarf zur Einordnung: 879 Empfaenger woechentlich sind rund 3.900 Mails im
Monat, bei fuenf Dienstagen oder einem Zusatzmailing (Weihnachten) ueber
5.000. Die gebuchte Volumenstufe muss darueber liegen, sonst haelt Brevo
den Versand beim Erreichen des Monatsvolumens an. Preise am 15.11.2026
(EUR, monatlich): Starter 5k 7 Euro, Starter 10k 14 Euro, Standard 5k
15 Euro, Prepaid-Guthaben 30 Euro je 5.000 ohne Verfall. Quelle
https://www.brevo.com/de/pricing/ , Preise altern, vor einer neuen
Entscheidung nachsehen.

Brevo-Tracking: Brevo schreibt in SMTP-Mails alle Links und Bilder auf
eigene Tracking-Adressen (sendibt3.com) um. Deshalb zaehlt Listmonk fuer
die Kampagne 0 Oeffnungen und 0 Klicks, Brevo dagegen alles. Wer die Zahlen
in Listmonk haben will, schaltet das Tracking in den Brevo-Kontoeinstellungen
fuer Transaktionsmails ab. Noch nicht entschieden.

Zugriff per API: Der Schluessel darf Konto, Tarif und Guthaben nicht lesen,
Statistiken und Ereignisse schon. Tarif und Volumenstufe zeigt nur das
Brevo-Dashboard.
