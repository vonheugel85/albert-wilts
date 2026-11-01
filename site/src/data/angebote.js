// Zentrale Wochenangebote. Die Seite /aktuelle-angebote speist sich ausschliesslich hieraus.
// Pflege: jede Woche aus dem Angebots-Docx uebertragen (Quelle: Wochenblaetter Laden + Wochenmarkt).
// orte:      'laden' | 'markt' (ein Angebot kann an beiden Orten gelten)
// dauerhaft: true fuer Standardartikel, die jede Woche gelten. Sie stehen im Raster immer am Ende.
// Reihenfolge im Raster: Datenreihenfolge, dauerhafte Artikel ans Ende sortiert.
// Das Mittagsgericht steht immer zuerst (eigener Block ueber dem Raster).

export const zeitraum = {
  von: '2026-11-03',
  bis: '2026-11-07',
  label: 'Gültig vom 03. bis 07. November 2026',
};

export const ortLabel = {
  laden: 'Laden',
  markt: 'Markt',
};

// Verfuegbarkeits-Zeilen fuer die Detailansicht
export const ortDetail = {
  laden: 'Ladenverkauf Upgant-Schott, Freitag 8 bis 18 Uhr',
  markt: 'Wochenmärkte: Dienstag, Donnerstag, Freitag und Samstag in Emden, Mittwoch auf Norderney',
};

export const mittagsgericht = {
  id: 'mittagsgericht',
  badge: 'Mittagsgericht am Freitag',
  titel: 'Halbes gebratenes Hähnchen',
  beschreibung: 'Knusprig vom Grill, frisch im Ladenverkauf. Ideal zum Mitnehmen in der Mittagspause.',
  preis: '3,90 €',
  einheit: 'pro Stück',
  orte: ['laden'],
  detail: 'Knusprig gegrillt und direkt zum Mitnehmen. Freitags frisch im Ladenverkauf, solange der Vorrat reicht.',
  hinweis: 'Tipp für die Mittagspause: am besten vorbestellen unter 04934 91060.',
};

export const angebote = [
  {
    id: 'haehnchen-gyros',
    kategorie: 'Geflügel',
    titel: 'Frisches Hähnchen-Gyros',
    beschreibung: 'Saftiges Hähnchenkeulenfleisch, fertig gewürzt für die Pfanne.',
    preis: '10,90 €',
    einheit: 'pro kg',
    orte: ['laden', 'markt'],
    detail: 'Saftiges Hähnchenkeulenfleisch, fertig gewürzt. Nur noch ab in die Pfanne.',
  },
  {
    id: 'putenschnitzel',
    kategorie: 'Geflügel',
    titel: 'Frische Putenschnitzel',
    beschreibung: 'Zartes Putenbrustfilet, geschnitten für die schnelle Küche.',
    preis: '13,90 €',
    einheit: 'pro kg',
    orte: ['laden', 'markt'],
    detail: 'Zartes Putenbrustfilet, als Schnitzel geschnitten. Mager, schnell gebraten und vielseitig.',
  },
  {
    id: 'snirtjebraten',
    kategorie: 'Schwein',
    titel: 'Frischer Schweine-Snirtjebraten',
    beschreibung: 'Der ostfriesische Klassiker, bratfertig gewürzt.',
    preis: '8,95 €',
    einheit: 'pro kg',
    orte: ['laden'],
    detail: 'Der ostfriesische Klassiker für die kalte Jahreszeit, bratfertig gewürzt.',
  },
  {
    id: 'gefluegelsalat',
    kategorie: 'Feinkost',
    titel: 'Geflügelsalat',
    beschreibung: 'Klassisch mit Salatmayonnaise, Ananas, Spargel und Mandarinen.',
    preis: '1,49 €',
    einheit: 'pro 100 g',
    orte: ['markt'],
    detail: 'Klassischer Geflügelsalat mit Salatmayonnaise, Ananas, Spargel und Mandarinen.',
  },
  {
    id: 'kartoffeln-cilena',
    kategorie: 'Kartoffeln',
    titel: 'Kartoffeln Cilena',
    beschreibung: 'Festkochend, Herkunft Deutschland.',
    preis: '4,99 €',
    einheit: 'je 4 kg',
    orte: ['laden'],
    detail: 'Festkochende Speisekartoffel im praktischen Gebinde, Herkunft Deutschland.',
  },
  {
    id: 'klei-kartoffeln-glorietta',
    kategorie: 'Kartoffeln',
    titel: 'Klei-Kartoffeln Glorietta',
    beschreibung: 'Festkochend, Herkunft Deutschland.',
    preis: '7,95 €',
    einheit: 'je 5 kg',
    orte: ['laden'],
    detail: 'Festkochende Klei-Kartoffel im praktischen Gebinde, Herkunft Deutschland.',
  },
  {
    id: 'haehnchenkeulen',
    kategorie: 'Jede Woche für Sie',
    titel: 'Frische Hähnchenkeulen',
    beschreibung: 'Unser Standard, jede Woche frisch an Laden und Marktstand.',
    preis: '1,50 €',
    einheit: 'pro Stück',
    orte: ['laden', 'markt'],
    dauerhaft: true,
    detail: 'Frische Hähnchenkeulen, jede Woche am Marktstand und im Ladenverkauf. Preis der aktuellen Woche.',
  },
];

// Saisonaler Hinweis unter dem Angebotsraster. Auf null setzen, wenn keiner ansteht.
export const saisonHinweis = {
  titel: 'Weihnachtsverkauf ab dem 27. November',
  text: 'Vielfältige Weihnachtsangebote von Geflügel, Schwein, Rind und Wildfleisch, direkt bei uns in Upgant-Schott.',
  linkHref: '/ladenverkauf',
  linkLabel: 'Zum Ladenverkauf',
};
