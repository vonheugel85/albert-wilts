Committe und pushe.
1. "git status" und "git log --oneline -6". Erwartet: {{dateien}}. Fremde Dateien
   -> stopp und melden.
2. CHANGELOG.md (falls vorhanden): Eintrag oben, heutiges Datum, Zusammenfassung.
3. Stage Quelldateien (und ggf. CHANGELOG). Kein dist/, keine report.md.
4. Commit-Nachricht: {{nachricht}}
5. Push: env -u GITHUB_TOKEN -u GITHUB_USER git push origin main
Bericht: status vorher, committete Dateien, Commit-Hash, Push-Ergebnis.
