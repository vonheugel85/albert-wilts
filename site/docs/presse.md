# Pressebereich

Stand: 2026-11-09. Entscheidungen und Begründungen. Welche Beiträge es gibt, steht
ausschließlich in `src/data/presse.js`, diese Datei wiederholt die Liste nicht.

## Eigene PDFs statt Fremdlinks

Beiträge, deren Original nicht dauerhaft erreichbar ist (Paywall, gelöschte Seite,
issuu-Viewer), liegen als PDF in `public/presse/` und werden aus `presse.js` relativ
verlinkt (`/presse/<datei>.pdf`). Voraussetzung ist die Freigabe des Verlags; sie liegt
für die ahoi!-Ausgaben vor (Manuel, 09.11.2026). Für andere Medien gibt es keine
Freigabe, deren Einträge bleiben Link oder `offline`.

Dateiname: `<medium>-<ausgabe>-<titel-als-slug>.pdf`, Kleinbuchstaben, Umlaute als
ae/oe/ue, nur im Dateinamen. Beispiel:

```
ahoi-magazin-44-mit-der-ersten-faehre.pdf
```

Die PDFs kommen vom Verlag über den Kunden. Die Druck-PDFs enthalten die Magazinseiten
mit Seitenzahlen und Fotonachweis, sie werden unverändert übernommen, nicht
beschnitten und nicht komprimiert.

## ahoi! norderney Magazin

Drei Beiträge, alle als PDF hinterlegt. Ausgabe 44 seit Runde 5a (Oktober 2026),
Ausgaben 21 und 39 seit 09.11.2026. Vorher verwies Ausgabe 21 auf issuu und Ausgabe 39
stand auf `offline`, weil keine Datei vorlag.

Ausgabe 44 nennt Andree Wilts als sechste Generation. Die Website bleibt bei der
dritten Generation (siehe `CLAUDE.md`, Fakten). Das PDF wird deshalb nicht angefasst;
es ist ein Fremdtext, der Widerspruch ist bekannt und entschieden (Manuel, 26.10. und
09.11.2026).

## Was weiterhin offline ist und warum

- Die beiden NDR-Beiträge: keine Mediathek-Fassung mehr, keine Videodatei beim Kunden.
  Andree wünscht sich eingebettete Videos (14.10.2026), welche gemeint sind, ist offen,
  siehe `korrekturen/offene-punkte.md`.
- Ostfriesischer Kurier 21.08.2024: kein Online-Artikel, kein PDF, keine Freigabe.

## Prüfen

Nach jeder Änderung an `presse.js` oder `public/presse/` jeden Eintrag mit `url` einmal
abrufen. Lokale PDFs müssen 200 und die Dateigröße aus `public/presse/` liefern,
externe Links 200 oder eine Paywall-Seite, nie 404.
