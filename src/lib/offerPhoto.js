/**
 * Résout l’URL d’affiche d’une offre : champs DB possibles + image par défaut selon la catégorie.
 * Les chaînes invalides (pas http/https) sont ignorées pour éviter des <img> cassées.
 */
const Q = '?auto=format&fit=crop&w=900&q=80';

/** Dernière image de secours (généralement fiable). */
export const OFFER_FALLBACK_IMAGE = `https://images.unsplash.com/photo-1542838132-92c53300491e${Q}`;

export const DEFAULT_PHOTO_BY_CATEGORY = {
  bakery: `https://images.unsplash.com/photo-1509440159596-0249088772ff${Q}`,
  dairy: `https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d${Q}`,
  prepared: `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38${Q}`,
  fruits: `https://images.unsplash.com/photo-1610832958506-aa56368176cf${Q}`,
  vegetables: `https://images.unsplash.com/photo-1540420773420-3366772f4999${Q}`,
  meat: `https://images.unsplash.com/photo-1600891964092-4316c288032e${Q}`,
  seafood: `https://images.unsplash.com/photo-1519708227418-c5fd843a0aeb${Q}`,
  beverages: `https://images.unsplash.com/photo-1544145945-f90425340c7e${Q}`,
  /** Chocolats / confiseries — URL stable (évite icône image cassée). */
  other: `https://images.unsplash.com/photo-1549007994-cb92caebd54b${Q}`,
};

function isHttpImageUrl(s) {
  if (s == null || typeof s !== 'string') return false;
  const t = s.trim();
  if (t === '' || t === 'null' || t === 'undefined') return false;
  return /^https?:\/\//i.test(t);
}

/**
 * Image par défaut pour une catégorie (secours onError + getOfferPhotoUrl).
 */
export function getCategoryDefaultPhotoUrl(category) {
  const cat = category && DEFAULT_PHOTO_BY_CATEGORY[category] ? category : 'other';
  return DEFAULT_PHOTO_BY_CATEGORY[cat] || OFFER_FALLBACK_IMAGE;
}

/**
 * Liste d’URLs uniques à essayer si la première ne charge pas (404, blocage, etc.).
 */
export function getOfferPhotoUrlChain(offer) {
  const primary = getOfferPhotoUrl(offer);
  const catUrl = getCategoryDefaultPhotoUrl(offer?.category);
  const chain = [primary, catUrl, OFFER_FALLBACK_IMAGE];
  const out = [];
  for (const u of chain) {
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

/**
 * @param {object} offer
 * @returns {string} URL toujours définie (fallback catégorie ou générique)
 */
export function getOfferPhotoUrl(offer) {
  if (!offer || typeof offer !== 'object') return OFFER_FALLBACK_IMAGE;
  const candidates = [offer.photo, offer.photo_url, offer.image_url];
  for (const u of candidates) {
    if (isHttpImageUrl(u)) {
      return String(u).trim();
    }
  }
  return getCategoryDefaultPhotoUrl(offer.category);
}
