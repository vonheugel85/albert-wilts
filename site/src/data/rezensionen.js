// Zentral gepflegte Google-Bewertungen, kuratiert (5 Sterne, mit Text), neueste zuerst.
// Kein Live-Abruf, kein Google-Script auf der Seite (DSGVO).
// Quelle: CSV-Export der beiden Google-Unternehmensprofile (Stand 2026-09-15).
// Texte wörtlich übernommen (nur Zeilenumbrüche entfernt), Namen auf Vorname plus Initiale gekürzt.
// Gesamtwertung und Anzahl aus dem Export: Albert Wilts 148 Bewertungen, Schnitt 4,49; Box 7, alle 5 Sterne.

export const profile = {
  wilts: {
    name: 'Albert Wilts e.K.',
    rating: 4.5,
    count: 148,
    stand: '2026-09-15',
    profilUrl: 'https://www.google.com/maps/place/Albert+Wilts+e.K./@53.513262999999995,7.284403999999999,14z/data=!4m8!1m2!2m1!1sAlbert+Wilts+e.K.!3m4!1s0x47b63fd5d7faa73b:0x9b3bb6953ae7a23a!8m2!3d53.513262999999995!4d7.284403999999999',
    // » eintragen: Direktlink "Bewertung schreiben" aus dem Unternehmensprofil (g.page/r/.../review)
    bewertenUrl: null,
  },
  box: {
    name: 'Wilts Box 24/7',
    rating: 5.0,
    count: 7,
    stand: '2026-09-15',
    profilUrl: 'https://www.google.com/maps/place/Wilts+Box+24%2F7/@53.5138253,7.2852216,14z/data=!4m8!1m2!2m1!1sWilts+Box+24%2F7!3m4!1s0x47b63fc38b4ca677:0x1dfed9496d5958f3!8m2!3d53.5138253!4d7.2852216',
    bewertenUrl: null,
  },
};

export const rezensionen = {
  wilts: [
    { text: 'Immer einen Besuch wert, wenn man qualitätiv hochwertiges und frisches Fleisch oder Gemüse braucht. Sehr freundlich Mitarbeiter. Nach wie vor schade, dass der Wochenmarkt in Norden nicht angefahren wird.', name: 'Erik G.', rating: 5, datum: '2026-05-07' },
    { text: 'Sehr gutes Angebot an Wild, Geflügel und andere Fleischspezialitäten', name: 'Richard S.', rating: 5, datum: '2025-12-06' },
    { text: 'Absolute Empfehlung. Freundliche Mitarbeiter und Preis-Leistung passt', name: 'Jörg S.', rating: 5, datum: '2025-07-09' },
    { text: 'Wir kaufen jeden Freitag ein! Super Ware und extrem freundliches Personal!', name: 'Nicole U.', rating: 5, datum: '2025-03-30' },
    { text: 'Alles super frisch und große Auswahl. Angebote sind immer wechselnd. Die Mitarbeiter sind alle sehr freundlich.', name: 'Karin S.', rating: 5, datum: '2025-03-09' },
    { text: 'Kaufe dort immer Fleisch und Geflügel. Sehr gute Qualität und die Leute vor Ort sind sehr nett.', name: 'Heike S.', rating: 5, datum: '2025-01-02' },
    { text: 'Kann man sehr gut einkaufen große Auswahl sehr zu empfehlen 😊👍🏻', name: 'Juergen R.', rating: 5, datum: '2024-12-06' },
    { text: 'Hier gibt es super gute Angebote. Persönlich schmeckt mir der Geflügelsalat sehr gut. Das Fleisch ist von guter Qualität.', name: 'Wolfgang M.', rating: 5, datum: '2024-11-29' },
    { text: 'Auf dem Wochenendmarkt Emden ist immer ein super Trio, eine nette Bedienung, sind freundlich, immer frische Ware und sehr lecker.', name: 'Der Ostfriese', rating: 5, datum: '2024-11-13' },
    { text: 'Nette Bedienung und immer frische und leckere Ware. Auch Tagesgerichte gibt es hier zum mitnehmen. Einige Sachen sollte man aber vorbestellen.', name: 'Ralf M.', rating: 5, datum: '2024-07-09' },
    { text: 'Wie immer sehr freundlich und alles lecker', name: 'Sabrina K.', rating: 5, datum: '2023-11-03' },
    { text: 'alles sehr lecker! Und super nettes Personal!', name: 'Florian T.', rating: 5, datum: '2023-08-16' },
    { text: 'Jeden Freitag geöffnet mit super Angeboten. Das Fleisch, Eier und Kartoffeln waren bisher immer bestens. Schmeckt wirklich gut und die Preise sind top. Teilweise günstiger als im Discounter. Wir gehen regelmäßig dahin', name: 'Patrick M.', rating: 5, datum: '2023-06-06' },
    { text: 'Mit das beste Fleisch im Umkreis. Toller Schinken. Abwechlungsreiches Angebot. Top!', name: 'Ronald K.', rating: 5, datum: '2022-08-26' },
    { text: 'Tolle, frische, regionale und saisonale Produkte. Super nettes Personal.', name: 'Inge J.', rating: 5, datum: '2021-07-23' },
    { text: 'Bestes Fleisch und TOP Qualität , super Obst und Gemüse. Immer wieder gerne.', name: 'Nina', rating: 5, datum: '2021-06-25' },
  ],
  box: [
    { text: 'Waren heute da, alles top 🔝 🔝 🔝 🔝, faire Preise 24/7 hunnet', name: 'Bianca S.', rating: 5, datum: '2026-09-13' },
    { text: 'Top super. Preise angemessen!', name: 'Mike S.', rating: 5, datum: '2026-09-13' },
    { text: 'Mega Konzept! Der 24/7-Containerladen ist echt eine super Sache. Alles unkompliziert, die Preise sind wirklich entspannt und fair. Und der Kaffee ist überraschend geil! ☕😄 Gerade wenn man spontan noch etwas braucht, einfach perfekt. Klare Empfehlung, gerne wieder!', name: 'Peter S.', rating: 5, datum: '2026-09-06' },
    { text: 'Sehr überragend, Kleinigkeiten für den Alltag oder auf der schnelle sind vorhanden. Einfacher Umgang mit der Bezahlung. Nette Begrüßung und angenehme Musik im Hintergrund.', name: 'Eike H.', rating: 5, datum: '2026-08-30' },
    { text: 'Alles super, toller Laden. Für jeden was dabei', name: 'Kristin H.', rating: 5, datum: '2026-08-30' },
    { text: 'Wirklich praktisch! Die Technik funktioniert einwandfrei. Alles ausprobiert.', name: 'Bettina B.', rating: 5, datum: '2026-08-30' },
    { text: 'Alles Top!', name: 'Dietmar B.', rating: 5, datum: '2026-08-30' },
  ],
};
