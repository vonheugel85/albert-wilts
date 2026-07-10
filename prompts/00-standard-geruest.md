<Ziel in einem Satz.>

1. LESEN ZUERST: <Datei(en)> vollstaendig lesen, bevor etwas geaendert wird.
2. AENDERN: <praezise Aufgabe>. Bei Klassen-Fixes: erst ALLE betroffenen
   Stellen benennen, ohne zu aendern, dann in einem Zug fixen.
3. NICHT ANFASSEN: <Code, Klassen, URLs, Eigennamen, fremde Dateien>.

Randbedingungen:
- Echte Umlaute (ä, ö, ü, ß), keine Em-Dashes.
- Variablennamen Englisch, Kommentare Deutsch.
- Nur die genannten Dateien aendern, sonst nichts.
- Kein Commit, kein Push. Stopp nach dem Bericht.

Verifizieren:
- npm run preflight sauber.
- npm run build im Ordner site sauber.
- <projektspezifischer Grep-Beweis im dist/>.

Bericht: geaenderte Dateien, kurzer Auszug, Preflight- und Build-Ergebnis.
