/**
 * Boîte englobante par défaut pour le filtrage des offres et le centrage carte.
 *
 * NOTE : couvre actuellement Suisse + une grande partie de la France métropolitaine
 *        (lat 41–51, lng -5–10). À ajuster selon la liste des pays opérés.
 *        Le SWISS_BOUNDS_CORNERS legacy reste exporté pour compat ascendante.
 */
export const APP_BOUNDS_CORNERS = [
  [41.0, -5.5],
  [51.5, 10.55],
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

/** @deprecated nom historique : utiliser `isOfferInBounds`. */
export const isOfferInSwitzerland = isOfferInBounds;

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
