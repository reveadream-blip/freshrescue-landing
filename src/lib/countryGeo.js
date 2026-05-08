/**
 * Vue carte par défaut pour chaque pays (centre, bounds, zoom).
 * Permet de centrer la carte Explore sur le pays détecté (Cloudflare /cdn-cgi/trace
 * ou navigator.language) quand l'utilisateur n'a pas accordé la géolocalisation.
 *
 * Les bounds sont volontairement larges pour couvrir tout le territoire principal
 * (DOM-TOM exclus côté FR pour éviter une carte démesurée).
 */

const COUNTRY_VIEWS = {
  FR: {
    center: [46.6, 2.5],
    bounds: [[41.3, -5.2], [51.1, 9.6]],
    zoom: 6,
  },
  CH: {
    center: [46.85, 8.25],
    bounds: [[45.8, 5.9], [47.85, 10.5]],
    zoom: 8,
  },
  BE: {
    center: [50.6, 4.6],
    bounds: [[49.5, 2.5], [51.55, 6.4]],
    zoom: 8,
  },
  LU: {
    center: [49.8, 6.1],
    bounds: [[49.4, 5.7], [50.2, 6.55]],
    zoom: 9,
  },
  DE: {
    center: [51.1, 10.4],
    bounds: [[47.3, 5.9], [55.1, 15.0]],
    zoom: 6,
  },
  IT: {
    center: [42.5, 12.5],
    bounds: [[36.6, 6.7], [47.1, 18.5]],
    zoom: 6,
  },
  ES: {
    center: [40.4, -3.7],
    bounds: [[35.9, -9.5], [43.8, 4.4]],
    zoom: 6,
  },
  GB: {
    center: [54.0, -2.5],
    bounds: [[49.9, -8.6], [58.7, 1.8]],
    zoom: 6,
  },
  PT: {
    center: [39.5, -8.0],
    bounds: [[36.9, -9.6], [42.2, -6.0]],
    zoom: 7,
  },
  NL: {
    center: [52.2, 5.3],
    bounds: [[50.7, 3.3], [53.6, 7.3]],
    zoom: 7,
  },
  AT: {
    center: [47.6, 13.4],
    bounds: [[46.3, 9.5], [49.0, 17.2]],
    zoom: 7,
  },
};

const DEFAULT_VIEW = COUNTRY_VIEWS.FR;

/**
 * Vue carte (centre + bounds + zoom) pour un code pays ISO-3166 alpha-2.
 * Renvoie la France si le pays n'est pas connu : c'est notre marché principal.
 * @param {string|null|undefined} country
 */
export function getCountryMapView(country) {
  const code = String(country || '').toUpperCase();
  return COUNTRY_VIEWS[code] || DEFAULT_VIEW;
}

/**
 * Union approximative des bounds des pays supportés : utilisée pour `maxBounds`
 * quand on veut autoriser un large pan-européen (ex. visiteur sans pays connu).
 */
export const SUPPORTED_COUNTRIES_BOUNDS = (() => {
  let south = 90,
    west = 180,
    north = -90,
    east = -180;
  for (const view of Object.values(COUNTRY_VIEWS)) {
    const [[s, w], [n, e]] = view.bounds;
    if (s < south) south = s;
    if (w < west) west = w;
    if (n > north) north = n;
    if (e > east) east = e;
  }
  return [[south, west], [north, east]];
})();
