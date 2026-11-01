# Deploy: Push auf main ist live

Stand: 2026-11-01. Entscheidungen und Begruendungen, keine Zustandsliste.

## Wie es laeuft

Live ist https://albert-wilts.de, Coolify-App `albert-wilts` (UUID, Token
und API-Adresse in `env.local` als `COOLIFY_APP_UUID`, `COOLIFY_TOKEN`,
`COOLIFY_URL`). Base Directory `/site`, Branch `main`, Start ueber
`node server.mjs` aus `site/nixpacks.toml`. Die Testdomain
dev.albert-wilts.de haengt an derselben App, es gibt also genau einen Stand.

**Seit 01.11.2026 deployt Coolify bei jedem Push auf `main` von selbst.**
Am GitHub-Repo `vonheugel85/albert-wilts` haengt ein Webhook (Ereignis
`push`) auf `https://coolify.fruity-software.de/webhooks/source/github/events/manual`.
Das ist der manuelle Per-Repo-Weg, nicht die Coolify-GitHub-App aus dem
Blueprint (`setup-blueprint-v2.0.md`, Abschnitt 2): Die App hat `source_id 0`,
das Secret steht als `manual_webhook_secret_github` an der Coolify-App und
identisch im GitHub-Webhook. Gepruefte Wirkung: Push `83c85da` um 21:47 Uhr
loeste Deploy `yqzdhh7koopg1vbnrt3yrzld` vom Typ webhook aus, nach etwa zwei
Minuten live.

Vorher (September bis 31.10.2026) gab es keinen Webhook. Ein Push aenderte
nichts, der Deploy lief per API auf Ansage. Beides nebeneinander fuehrt zu
Doppel-Deploys, so geschehen am 01.11.2026 (webhook 21:47, manuell 21:49).

## Konsequenzen

- **Push nur auf Ansage.** Ein Push ist jetzt eine Veroeffentlichung.
  Lokal fertig pruefen (`npm run build` laeuft den Preflight mit), dann
  committen, dann auf Ansage pushen.
- **Kein manueller Deploy mehr nach dem Push.** Der Webhook macht es.
- Reine Doku-Commits loesen ebenfalls einen Build aus. Das ist harmlos,
  aber nicht noetig; Doku-Aenderungen sammeln und mit dem naechsten
  Code-Push mitnehmen, wenn es passt.

## Pruefen, ob der Deploy durch ist

Deploy-Historie der App, neuester Eintrag zuerst, Feld `is_webhook` zeigt
den Ausloeser:

```bash
curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_URL/api/v1/deployments/applications/$COOLIFY_APP_UUID?take=5"
```

Von aussen, Beleg dafuer, dass `server.mjs` laeuft und der neue Stand da ist:
`/box/` antwortet 200, `/presse` 301, die Antwort traegt einen ETag
`W/"..."` und `content-encoding: br`.

`env.local` nie per `source` einlesen, die Werte stehen in Anfuehrungszeichen;
per `grep`/`cut` holen und mit `tr -d '"'` bereinigen, sonst antwortet die
API 401.

## Fallback, wenn der Webhook nicht feuert

Zuerst am Repo nachsehen (`gh api repos/vonheugel85/albert-wilts/hooks`),
ob der Hook aktiv ist und die letzte Zustellung angekommen ist. Dann
manuell anstossen:

```bash
curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" -X POST \
  "$COOLIFY_URL/api/v1/deploy?uuid=$COOLIFY_APP_UUID&force=true"
```

Status unter `GET $COOLIFY_URL/api/v1/deployments/<deployment_uuid>` bis
`finished`. Ein fehlgeschlagener Deploy laesst den alten Container laufen,
die Seite bleibt erreichbar (am 01.11.2026 einmal passiert, Nixpacks-Download
abgebrochen, zweiter Versuch lief durch).
