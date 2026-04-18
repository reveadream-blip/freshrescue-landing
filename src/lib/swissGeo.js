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
