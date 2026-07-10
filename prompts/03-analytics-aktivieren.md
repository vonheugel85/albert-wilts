Setze die echte GA4-Mess-ID in den einwilligungs-gesteuerten ConsentBanner und
ergaenze den Datenschutz. WICHTIG: nur nach Einwilligung laden, kein ungegateter
Snippet.
1. LESEN ZUERST: ConsentBanner vollstaendig, Gating im Bericht beschreiben.
2. AENDERN ConsentBanner: Platzhalter durch {{measurement_id}}. Etwaigen
   Platzhalter-Guard entfernen (blockiert sonst dauerhaft). Mechanik sonst gleich.
   Keine Lade-Logik vorhanden -> stoppen und melden.
3. AENDERN datenschutz.astro: GA4-Abschnitt (Google Ireland Ltd., Consent-Pflicht,
   IP nur kurz/nicht gespeichert, Art. 6 Abs. 1 lit. a DSGVO + § 25 Abs. 1 TDDDG,
   US-Transfer + Restrisiko, AVV, 14 Monate, Link policies.google.com/privacy).
Hinweis: GA4 ignoriert anonymize_ip, schadet nicht.
Randbedingungen + Verifizieren + Bericht: siehe 00-standard-geruest.md.
