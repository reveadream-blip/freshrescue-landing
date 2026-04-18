/**
 * URL canonique du site (SEO, Open Graph). Définir VITE_SITE_URL en prod (ex. https://freshrescue.ch).
 */
export function getSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
