// Zentrale Wochenangebote. Die Seite /aktuelle-angebote speist sich ausschliesslich hieraus.
// Pflege: jede Woche aus dem Angebots-Docx uebertragen (Quelle: Wochenblaetter Laden + Wochenmarkt).
//
// wochen ist eine Liste aus hoechstens zwei Eintraegen:
//   [0] = laufende Woche, [1] = naechste Woche (optional, sobald die neuen Blaetter da sind).
// Die Seite zeigt beide als Reiter/Swipe (orange = aktuelle, gruen = naechste Woche) und
// startet nach Datum automatisch auf der gueltigen Woche. Beim naechsten Update faellt die
// alte Woche raus: Eintrag [1] rueckt auf [0], die neue Woche kommt als [1] dazu.
// Sind alle Wochen abgelaufen, raeumt die Seite sich clientseitig leer.
//
// orte:      'laden' | 'markt' (ein Angebot kann an beiden Orten gelten)
// dauerhaft: true fuer Standardartikel, die jede Woche gelten. Sie stehen im Raster immer am Ende.
// preis:     normalerweise ein Betrag; 'Vorrätig' fuer Besonderheiten ohne Preisangabe.
// Das Mittagsgericht steht immer zuerst (eigener Block ueber dem Raster).

export const ortLabel = {
  laden: 'Laden',
  markt: 'Markt',
};

// Verfuegbarkeits-Zeilen fuer die Detailansicht
export const ortDetail = {
  laden: 'Ladenverkauf Upgant-Schott, Freitag 8 bis 18 Uhr',
  markt: 'Wochenmärkte: Dienstag, Donnerstag, Freitag und Samstag in Emden, Mittwoch auf Norderney',
};

export const wochen = [
  // ── Weihnachtsverkauf: Freitag, 27.11.2026 (Quelle: 27.11.2026 Weihnachtsverkauf_zeitung.pdf) ──
  {
    zeitraum: {
      von: '2026-11-27',
      bis: '2026-11-27',
      label: 'Weihnachtsverkauf am Freitag, den 27. November 2026',
    },
    mittagsgericht: {
      id: 'mittagsgericht',
      badge: 'Mittagsgericht am Freitag',
      titel: 'Gebratene Oldenburger Entenkeule',
      beschreibung: 'Knusprig gebraten, frisch im Ladenverkauf. Ideal zum Mitnehmen in der Mittagspause.',
      preis: '3,90 €',
      einheit: 'pro Stück',
      orte: ['laden'],
      detail: 'Knusprig gebratene Oldenburger Entenkeule, direkt zum Mitnehmen. Am Weihnachtsverkauf frisch im Ladenverkauf, solange der Vorrat reicht.',
      hinweis: 'Tipp für die Mittagspause: am besten vorbestellen unter 04934 91060.',
    },
    angebote: [
      {
        id: 'haehnchen-grillies',
        kategorie: 'Geflügel',
        titel: 'Frische Hähnchen-Grillies',
        beschreibung: 'Saftiges Hähnchenoberkeulenfleisch, fertig gewürzt.',
        preis: '7,90 €',
        einheit: 'pro kg',
        orte: ['laden'],
        detail: 'Saftiges Hähnchenoberkeulenfleisch, fertig gewürzt. Nur noch ab in die Pfanne oder auf den Grill.',
      },
      {
        id: 'kikok-roulade-italia',
        kategorie: 'Geflügel',
        titel: 'Frische KIKOK-Roulade Italia',
        beschreibung: 'Hähnchenkeulenfleisch vom Maishähnchen, gefüllt mit Gemüse und Mozzarella.',
        preis: '13,90 €',
        einheit: 'pro kg',
        orte: ['laden'],
        detail: 'Saftiges Hähnchenkeulenfleisch vom KIKOK-Maishähnchen, gefüllt mit Gemüse und Mozzarella.',
      },
      {
        id: 'jung-spanferkelruecken',
        kategorie: 'Schwein',
        titel: 'Frischer Jung-Spanferkelrücken',
        beschreibung: 'Mit Schwarte, fertig gewürzt.',
        preis: '6,49 €',
        einheit: 'pro kg',
        orte: ['laden'],
        detail: 'Frischer Jung-Spanferkelrücken mit Schwarte, fertig gewürzt für knusprigen Braten.',
      },
      {
        id: 'bauernschinken',
        kategorie: 'Schinken',
        titel: 'Ganze Bauernschinken',
        beschreibung: 'Luftgetrocknet oder geräuchert.',
        preis: '13,90 €',
        einheit: 'pro kg',
        orte: ['laden'],
        detail: 'Ganze Bauernschinken, wahlweise luftgetrocknet oder geräuchert.',
      },
      {
        id: 'wild-aktion',
        kategorie: 'Wild',
        titel: 'Große Wild-Aktion',
        beschreibung: 'Hirsch, Reh, Wildschwein und Hasen.',
        preis: 'Vorrätig',
        einheit: '',
        orte: ['laden'],
        detail: 'Große Wild-Aktion am Weihnachtsverkauf: Hirsch, Reh, Wildschwein und Hasen, frisch vorrätig.',
      },
      {
        id: 'kikok-maishaehnchen',
        kategorie: 'Geflügel',
        titel: 'KIKOK-Maishähnchen',
        beschreibung: 'Das ganz besondere Maishähnchen.',
        preis: 'Vorrätig',
        einheit: '',
        orte: ['laden'],
        detail: 'KIKOK, das ganz besondere Maishähnchen, am Weihnachtsverkauf frisch vorrätig.',
      },
      {
        id: 'highland-rindfleisch',
        kategorie: 'Rind',
        titel: 'Frisches Highland-Rindfleisch',
        beschreibung: 'Am Weihnachtsverkauf frisch vorrätig.',
        preis: 'Vorrätig',
        einheit: '',
        orte: ['laden'],
        detail: 'Frisches Highland-Rindfleisch, am Weihnachtsverkauf frisch vorrätig.',
      },
      {
        id: 'clementinen-orangen-nuesse',
        kategorie: 'Obst und Nüsse',
        titel: 'Clementinen, Orangen und Nüsse',
        beschreibung: 'Frisch vorrätig für die Adventszeit.',
        preis: 'Vorrätig',
        einheit: '',
        orte: ['laden'],
        detail: 'Clementinen, Orangen und Nüsse, am Weihnachtsverkauf frisch vorrätig.',
      },
      {
        id: 'kartoffeln-cilena',
        kategorie: 'Kartoffeln',
        titel: 'Kartoffeln Cilena',
        beschreibung: 'Festkochend.',
        preis: '4,99 €',
        einheit: 'je 4 kg',
        orte: ['laden'],
        detail: 'Festkochende Speisekartoffel im praktischen Gebinde.',
      },
      {
        id: 'klei-kartoffeln-glorietta',
        kategorie: 'Kartoffeln',
        titel: 'Klei-Kartoffeln Glorietta',
        beschreibung: 'Hiesige Klei-Kartoffeln, festkochend.',
        preis: '7,95 €',
        einheit: 'je 5 kg',
        orte: ['laden'],
        detail: 'Hiesige Klei-Kartoffeln der Sorte Glorietta, festkochend, im praktischen Gebinde.',
      },
      {
        id: 'haehnchenkeulen',
        kategorie: 'Jede Woche für Sie',
        titel: 'Frische Hähnchenkeulen',
        beschreibung: 'Zum Weihnachtsverkauf im Zehnerpack.',
        preis: '15,00 €',
        einheit: 'je 10 Stück',
        orte: ['laden'],
        dauerhaft: true,
        detail: 'Frische Hähnchenkeulen, zum Weihnachtsverkauf im Zehnerpack.',
      },
    ],
  },
];

// Saisonaler Hinweis unter dem Angebotsraster. Auf null setzen, wenn keiner ansteht.
export const saisonHinweis = {
  titel: 'Weihnachtsvorbestellung ab sofort möglich',
  text: 'Ganze Puten, Flugenten, Gänse, Kaninchen, Wildfleisch und mehr: Sprechen Sie unser Team am Marktstand oder im Ladenverkauf an. Der Weihnachtsverkauf in Upgant-Schott startet am 27. November.',
  linkHref: '/weihnachtsverkauf/#vorbestellen',
  linkLabel: 'Jetzt vorbestellen',
};
