/** Utilitaires SEO partagés (app + scripts de build). */

export function truncateMeta(text, maxLen = 160) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

export function truncateTitle(text, maxLen = 60) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

/** URL canonique alignée sur les URLs servies avec slash final (sauf accueil). */
export function canonicalUrl(origin, pathname) {
  const base = String(origin || '').replace(/\/$/, '');
  if (!base) return '';
  const path = pathname.split('?')[0] || '/';
  const normalized = path.endsWith('/') && path.length > 1 ? path : path === '/' ? '/' : `${path}/`;
  return normalized === '/' ? `${base}/` : `${base}${normalized}`;
}

export function shortBlogSeoTitle(data) {
  const region = data.region || data.department || data.audience;
  if (region) {
    return truncateTitle(`${region} · anti-gaspi | FreshRescue`, 60);
  }
  const raw = (data.title || '').replace(/^FreshRescue\.app[^:]*:\s*/i, '');
  return truncateTitle(raw ? `${raw} | FreshRescue` : 'Blog | FreshRescue', 60);
}
