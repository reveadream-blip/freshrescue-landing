/**
 * Détection du pays visiteur + helpers d'affichage (devise, label localisé).
 *
 * Stratégie :
 *   1) Cache `sessionStorage` pour éviter un round-trip à chaque navigation.
 *   2) Lecture du `loc=XX` exposé par Cloudflare via /cdn-cgi/trace
 *      (zéro coût, déjà sur le même domaine).
 *   3) Fallback : analyse de `navigator.language` (`fr-CH`, `fr-FR`, `it-CH`…).
 *   4) Défaut : 'FR' (marché principal post-Suisse).
 *
 * NOTE : volontairement *non* utilisé pour le SEO côté Googlebot — les balises
 *        meta et JSON-LD restent stables. Ce module sert l'UI dynamique
 *        (devise, mentions visibles, options pays-spécifiques).
 */

const CACHE_KEY = 'freshrescue_country_v1';
const DEFAULT_COUNTRY = 'FR';

let inflight = null;
let memo = null;

function readCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { country, ts } = JSON.parse(raw);
    if (typeof country !== 'string') return null;
    if (Date.now() - ts > 24 * 3600 * 1000) return null;
    return country.toUpperCase();
  } catch {
    return null;
  }
}

function writeCache(country) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ country, ts: Date.now() }));
  } catch {
    /* quota plein, ignorer */
  }
}

function fromNavigatorLanguage() {
  if (typeof navigator === 'undefined') return null;
  const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const tag of langs) {
    const parts = String(tag).split('-');
    if (parts.length >= 2) {
      const region = parts[1].toUpperCase();
      if (/^[A-Z]{2}$/.test(region)) return region;
    }
  }
  return null;
}

async function fromCloudflareTrace() {
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetch('/cdn-cgi/trace', { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    const match = text.match(/^loc=([A-Z]{2})/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Renvoie le code pays ISO-3166 (ex. "FR", "CH", "BE") détecté pour ce visiteur.
 * Synchrone si déjà résolu, sinon Promise.
 */
export function getCountry() {
  if (memo) return memo;
  const cached = readCache();
  if (cached) {
    memo = cached;
    return memo;
  }

  if (!inflight) {
    inflight = (async () => {
      const cf = await fromCloudflareTrace();
      const fallback = cf || fromNavigatorLanguage() || DEFAULT_COUNTRY;
      writeCache(fallback);
      memo = fallback;
      return fallback;
    })();
  }
  return inflight;
}

/** Version synchrone, jamais bloquante : renvoie le pays connu, sinon le défaut. */
export function getCountrySync() {
  if (memo) return memo;
  const cached = readCache();
  if (cached) {
    memo = cached;
    return memo;
  }
  return DEFAULT_COUNTRY;
}

/** Devise par défaut visible côté UI selon le pays détecté. */
export function getCurrencyCode(country = getCountrySync()) {
  switch (country) {
    case 'CH':
    case 'LI':
      return 'CHF';
    case 'GB':
      return 'GBP';
    case 'US':
      return 'USD';
    default:
      return 'EUR';
  }
}

/** Symbole compact pour affichage simple (ex. dans un prix produit). */
export function getCurrencySymbol(country = getCountrySync()) {
  const code = getCurrencyCode(country);
  switch (code) {
    case 'EUR':
      return '€';
    case 'CHF':
      return 'CHF';
    case 'GBP':
      return '£';
    case 'USD':
      return '$';
    default:
      return code;
  }
}

/** Pré-charge la détection au démarrage de l'app (à appeler une fois). */
export function preloadCountry() {
  return Promise.resolve(getCountry()).catch(() => DEFAULT_COUNTRY);
}
