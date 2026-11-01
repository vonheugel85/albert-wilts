# Newsletter: eigene Listmonk-Instanz

Stand: 2026-11-01. Entscheidungen und Begruendungen, keine Zustandsliste.

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

## Bekannte Einschraenkung: die Anrede

Die Mail begruesst mit "Guten Tag" und dem Namen des Abonnenten. Listmonk
setzt diesen Namen selbst auf den Teil vor dem @, wenn keiner uebergeben wird,
ein Weglassen in `server.mjs` aendert daran nichts. Die Anrede lautet deshalb
etwa "Guten Tag info". Zu aendern waere das nur ueber ein eigenes
Template-Verzeichnis (`LISTMONK_static_dir`), das sich ohne Dateizugriff auf
den Server nicht sauber bestuecken laesst.

## Altbestand aus MailPoet

Am 01.11.2026 wurden 472 Adressen aus der alten WordPress-Installation
importiert (Liste 3, Status confirmed, `overwrite: false`). Das sind
ausschliesslich die Abonnenten, fuer die MailPoet ein doppeltes Opt-in belegt
(`confirmed_at` und `confirmed_ip` gesetzt). Der Nachweis haengt an jedem
Abonnenten als Attribut: `optin`, `optin_datum`, `optin_ip`, `anmelde_ip`,
`angemeldet_am`, `bestaetigungen`, `quelle`, `formular_protokoll`, `herkunft`.
So bleibt bei einer Beschwerde nachvollziehbar, woher die Einwilligung stammt.

Ebenfalls am 01.11.2026, auf Manuels Entscheidung: 48 Adressen mit einfachem
Opt-in (Formularprotokoll und `subscribed_ip`, aber keine Bestaetigung),
gleichfalls als `confirmed` und ohne erneute Bestaetigungsmail. Sie tragen
`optin: single`, damit die Unterscheidung in der Liste sichtbar bleibt. Der
Vorschlag, sie als `unconfirmed` mit Bestaetigungsmail aufzunehmen, wurde
verworfen.

Als drittes, ebenfalls am 01.11.2026: 344 Adressen, fuer die MailPoet keinen
Einwilligungsbeleg enthaelt (342 davon mit Quelle `imported`, zwei
WordPress-Nutzer). Freigabe durch den Geschaeftsfuehrer: Die fehlende
Markierung geht auf einen Datenbankfehler in der alten Installation zurueck,
die Adressen gelten als rechtmaessig eingeworben. Importiert als `confirmed`
ohne Bestaetigungsmail, mit `optin: keiner` und einem Attribut `freigabe`, das
die Entscheidung und das Datum traegt. Wer spaeter nach dem Nachweis fragt,
findet ihn so am Abonnenten und nicht nur in dieser Datei.

Die Quelldateien liegen ausserhalb des Repos unter `backup/newsletter-export/`.

Stand nach den drei Importen: 865 Abonnenten in Liste 3, alle `confirmed`.
Das sind alle 864 in MailPoet aktiven Abonnenten plus eine Testadresse.

Eine Adresse (`aeckhardt459@gmail.com`) stand schon vor dem Import in der
Liste, Anmeldung ueber die neue Website am 29.10.2026. Sie wurde nicht
ueberschrieben, die neue Bestaetigung ist der frischere Nachweis.
