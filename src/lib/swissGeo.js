/** Boîte englobante approximative de la Suisse (WGS84), pour filtrage et carte. */
export const SWISS_BOUNDS_CORNERS = [
  [45.78, 5.85],
  [47.92, 10.55],
];

export function isOfferInSwitzerland(lat, lng) {
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (Number.isNaN(la) || Number.isNaN(ln)) return false;
  return la >= 45.78 && la <= 47.92 && ln >= 5.85 && ln <= 10.55;
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
