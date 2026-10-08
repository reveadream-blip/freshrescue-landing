/** Chemins publics avec slash final (alignés Cloudflare Pages + sitemap). */

export function withTrailingSlash(path) {
  const raw = String(path || '/').split('?')[0] || '/';
  if (raw === '/') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

/** Compare pathnames en ignorant le slash final. */
export function pathsMatch(pathname, target) {
  const a = withTrailingSlash(pathname);
  const b = withTrailingSlash(target);
  return a === b;
}

export const PUBLIC = {
  home: '/',
  explore: '/explore/',
  partenaires: '/partenaires/',
  actualites: '/actualites/',
  blog: '/blog/',
  terms: '/terms/',
  instructions: '/instructions/',
  merchant: '/merchant/',
};
