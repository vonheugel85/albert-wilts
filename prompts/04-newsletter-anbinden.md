Binde den Newsletter ueber einen Button-Link auf das gehostete Formular von
{{dienst}} an (nicht einbetten), und ergaenze den Datenschutz.
1. LESEN ZUERST: Newsletter-Bereich und Datenschutz-Platzhalter.
2. AENDERN Hero: nicht funktionierendes Formular entfernen, ersetzen durch
   <a href="{{formular_url}}" target="_blank" rel="noopener noreferrer"
   class="{{primary_button_klasse}}">{{button_label}}</a> plus dezente Zeile
   mit Link auf /datenschutz.
3. AENDERN datenschutz.astro: Abschnitt zu {{dienst}} (Anbieter {{anbieter}},
   gehostetes Formular, Double-Opt-in + Protokollierung, Art. 6 Abs. 1 lit. a
   DSGVO, Widerruf, Sperrliste Art. 6 Abs. 1 lit. f, AVV, Link).
Randbedingungen + Verifizieren + Bericht: siehe 00-standard-geruest.md.
Zusaetzlich: kein Eingabefeld mehr im Hero, Button auf {{dienst}}.
