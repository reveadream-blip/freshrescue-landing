/**
 * Boîte englobante par défaut pour le filtrage géographique des offres.
 *
 * Couvre l'Europe occidentale opérée par l'app (FR, CH, BE, LU, DE, IT, ES, PT,
 * NL, AT, GB) ; voir `countryGeo.js` pour le détail par pays. Le centrage carte
 * se fait par pays (cf. `getCountryMapView`) et n'utilise plus ces bornes.
 */
export const APP_BOUNDS_CORNERS = [
  [35.0, -10.5],
  [60.5, 19.0],
];

export const SWISS_BOUNDS_CORNERS = APP_BOUNDS_CORNERS;

export function isOfferInBounds(lat, lng) {
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (Number.isNaN(la) || Number.isNaN(ln)) return false;
  return (
    la >= APP_BOUNDS_CORNERS[0][0] &&
    la <= APP_BOUNDS_CORNERS[1][0] &&
    ln >= APP_BOUNDS_CORNERS[0][1] &&
    ln <= APP_BOUNDS_CORNERS[1][1]
  );
}

/** Distance à vol d’oiseau (km) entre deux points WGS84. */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const a = parseFloat(lat1);
  const b = parseFloat(lon1);
  const c = parseFloat(lat2);
  const d = parseFloat(lon2);
  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c) || Number.isNaN(d)) return Infinity;
  const R = 6371;
  const dLat = ((c - a) * Math.PI) / 180;
  const dLon = ((d - b) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
