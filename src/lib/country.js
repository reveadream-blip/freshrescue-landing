/**
 * Détection du pays visiteur + helpers d'affichage (devise, label localisé).
 *
 * Stratégie :
 *   1) Cache `sessionStorage` pour éviter un round-trip à chaque navigation.
 *   2) Lecture du `loc=XX` exposé par Cloudflare via /cdn-cgi/trace
 *      (zéro coût, déjà sur le même domaine).
 *   3) Fallback : analyse de `navigator.language` (`fr-FR`, `fr-BE`, `fr-LU`…).
 *   4) Défaut : 'FR' (marché francophone principal).
 *
 * NOTE : volontairement *non* utilisé pour le SEO côté Googlebot — les balises
 *        meta et JSON-LD restent stables. Ce module sert l'UI dynamique
 *        (devise, mentions visibles, options pays-spécifiques).
 */

const CACHE_KEY = 'freshrescue_country_v3';
const DEFAULT_COUNTRY = 'FR';

/** Liste des pays où l'app a une couverture opérée (carte centrée, offres mock).
 *  Le pays détecté reste brut (ex. "TH") — ce set sert seulement à identifier
 *  les visiteurs hors zone pour `getOperatedCountry`. */
const OPERATED_COUNTRIES = new Set([
  'FR', 'CH', 'BE', 'LU', 'DE', 'IT', 'ES', 'GB', 'PT', 'NL', 'AT',
]);

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
 * Renvoie le code pays ISO-3166 BRUT (ex. "FR", "CH", "TH", "JP") détecté pour
 * ce visiteur, sans rabat. Utilisé pour les libellés visibles (tagline,
 * label localisé). Pour la logique d'app (carte, offres), passer plutôt par
 * `getOperatedCountry` qui rabat les pays hors zone vers le défaut.
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
      // Cloudflare est notre source la plus fiable. navigator.language n'est
      // utilisé qu'en dernier recours (en dev local notamment) car il reflète
      // la langue de l'OS et non la position réelle de l'utilisateur.
      const detected = cf || fromNavigatorLanguage() || DEFAULT_COUNTRY;
      writeCache(detected);
      memo = detected;
      return detected;
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

/**
 * Pays opéré par l'app : si le visiteur est dans un pays où FreshRescue a une
 * couverture (carte + offres mock), on retourne ce pays. Sinon on rabat vers
 * le pays par défaut (FR) pour éviter de servir une carte/devise vide.
 */
export function getOperatedCountrySync(country = getCountrySync()) {
  const code = String(country || '').toUpperCase();
  return OPERATED_COUNTRIES.has(code) ? code : DEFAULT_COUNTRY;
}

/** Devise par défaut visible côté UI selon le pays détecté. */
export function getCurrencyCode() {
  return 'EUR';
}

/** Symbole compact pour affichage simple (ex. dans un prix produit). */
export function getCurrencySymbol(country = getCountrySync()) {
  const code = getCurrencyCode(country);
  switch (code) {
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'USD':
      return '$';
    default:
      return code;
  }
}

const COUNTRY_NAMES = {
  fr: {
    FR: 'France',
    CH: 'Suisse',
    BE: 'Belgique',
    LU: 'Luxembourg',
    IT: 'Italie',
    DE: 'Allemagne',
    ES: 'Espagne',
    GB: 'Royaume-Uni',
    US: 'États-Unis',
  },
  en: {
    FR: 'France',
    CH: 'Switzerland',
    BE: 'Belgium',
    LU: 'Luxembourg',
    IT: 'Italy',
    DE: 'Germany',
    ES: 'Spain',
    GB: 'United Kingdom',
    US: 'United States',
  },
  de: {
    FR: 'Frankreich',
    CH: 'Schweiz',
    BE: 'Belgien',
    LU: 'Luxemburg',
    IT: 'Italien',
    DE: 'Deutschland',
    ES: 'Spanien',
    GB: 'Vereinigtes Königreich',
    US: 'Vereinigte Staaten',
  },
  it: {
    FR: 'Francia',
    CH: 'Svizzera',
    BE: 'Belgio',
    LU: 'Lussemburgo',
    IT: 'Italia',
    DE: 'Germania',
    ES: 'Spagna',
    GB: 'Regno Unito',
    US: 'Stati Uniti',
  },
};

/**
 * Nom localisé d'un pays. Priorité :
 *   1) Liste curatée (orthographe maîtrisée pour les marchés opérés).
 *   2) `Intl.DisplayNames` (couvre tous les codes ISO-3166 dans toutes les
 *      langues supportées par l'OS — y compris Thaïlande, Japon, etc.).
 *   3) Code brut (FR, TH…) en dernier recours.
 */
export function getCountryName(country = getCountrySync(), lang = 'fr') {
  const code = String(country || DEFAULT_COUNTRY).toUpperCase();
  const pack = COUNTRY_NAMES[lang] || COUNTRY_NAMES.fr;
  if (pack[code]) return pack[code];
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      const dn = new Intl.DisplayNames([lang, 'en'], { type: 'region' });
      const localized = dn.of(code);
      if (localized && localized !== code) return localized;
    }
  } catch {
    /* Intl.DisplayNames indispo : on retombe sur le code brut. */
  }
  return code;
}

/** Pré-charge la détection au démarrage de l'app (à appeler une fois). */
export function preloadCountry() {
  return Promise.resolve(getCountry()).catch(() => DEFAULT_COUNTRY);
}
