/**
 * Villes et communes suisses pour suggestions de recherche (noms d’affichage + recherche sans accents).
 */
const CITIES = [
  'Aarau',
  'Baden',
  'Basel',
  'Bellinzona',
  'Bern',
  'Biel/Bienne',
  'Bulle',
  'Chur',
  'Coire',
  'Dübendorf',
  'Emmen',
  'Fribourg',
  'Freiburg',
  'Genève',
  'Gland',
  'Herisau',
  'Horgen',
  'Kreuzlingen',
  'Köniz',
  'La Chaux-de-Fonds',
  'Lausanne',
  'Locarno',
  'Lugano',
  'Luzern',
  'Martigny',
  'Montreux',
  'Morges',
  'Neuchâtel',
  'Nyon',
  'Olten',
  'Rapperswil-Jona',
  'Renens',
  'Schaffhausen',
  'Schwyz',
  'Sion',
  'Solothurn',
  'St. Gallen',
  'Thun',
  'Uster',
  'Vernier',
  'Wettingen',
  'Winterthur',
  'Wohlen',
  'Yverdon-les-Bains',
  'Zug',
  'Zürich',
];

function stripDiacritics(s) {
  return s.normalize('NFD').replace(/\p{M}/gu, '');
}

/** Pour filtrer titres / adresses avec la même logique que les suggestions de villes. */
export function normalizeForSearch(s) {
  return stripDiacritics(String(s || '')).toLowerCase();
}

/**
 * @param {string} query
 * @param {number} [limit=12]
 * @returns {string[]} villes dont le nom correspond à la saisie
 */
export function filterSwissCities(query, limit = 12) {
  const raw = (query || '').trim();
  if (raw.length < 1) return [];

  const q = stripDiacritics(raw).toLowerCase();
  const matches = [];

  for (const city of CITIES) {
    const c = stripDiacritics(city).toLowerCase();
    if (c.includes(q)) {
      matches.push(city);
      continue;
    }
    if (q.length >= 2) {
      const parts = c.split(/[\s\-/]+/).filter(Boolean);
      if (parts.some((p) => p.startsWith(q))) {
        matches.push(city);
      }
    }
  }

  return matches.slice(0, limit);
}
