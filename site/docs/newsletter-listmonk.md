# Newsletter: eigene Listmonk-Instanz

Stand: 2026-10-27. Entscheidungen und Begruendungen, keine Zustandsliste.

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
