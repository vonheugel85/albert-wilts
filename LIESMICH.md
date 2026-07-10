# Web-Projekt-Starter — Paket

Die wiederverwendbaren Bausteine aus dem Setup-Blueprint v2.0.

## Inhalt

- setup-blueprint-v2.0.md      Die vollständige Schablone (Referenz).
- prompts/                     Fertige, parametrisierte Copilot-Prompts.
    00-standard-geruest.md     Das Gerüst, auf das die anderen verweisen.
    01-neue-landingpage.md
    02-faq-eintrag.md
    03-analytics-aktivieren.md
    04-newsletter-anbinden.md
    05-schreibweisen-sweep.md
    06-commit-push.md
    07-legal-abschnitt.md
- site/scripts/preflight.mjs   Der Schreibzeit-Check.

## Wohin im neuen Repo

- setup-blueprint-v2.0.md und der ganze prompts/-Ordner kommen ins Repo-Root
  (oder wohin du magst, sie werden nicht deployed). Der Ordnername "agency" aus
  dem Blueprint war nur ein Beispiel, "prompts/" im Root reicht.
- site/scripts/preflight.mjs MUSS unter site/scripts/ liegen. Das ist die eine
  feste Vorgabe, weil npm das Skript aus dem site/-Ordner heraus startet.

## package.json ergänzen (im site/-Ordner)

In den "scripts"-Block aufnehmen:

  "preflight": "node scripts/preflight.mjs",
  "check": "npm run preflight && npm run test:responsive"

Dann fängt "npm run preflight" die häufigsten Schreibzeit-Fehler ab,
"npm run check" läuft Preflight plus Responsive-Audit vor dem Push.

## Prompts nutzen

Jede prompts/-Datei komplett markieren, kopieren, die {{Platzhalter}} ausfüllen
und in Copilot einfügen. Die Verweise auf "00-standard-geruest.md" sind das
gemeinsame Gerüst, das in jeder Aufgabe gilt.
