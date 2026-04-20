/**
 * Après `vite build`, génère dist/sitemap.xml et dist/robots.txt (URLs absolues, requis par Google Search Console).
 *
 * Ordre de priorité pour l’URL canonique :
 * 1. VITE_SITE_URL (Netlify > Environment variables)
 * 2. siteUrl dans site.config.json (domaine fixe dans le dépôt)
 * 3. URL (injecté par Netlify au build, ex. https://xxx.netlify.app)
 * 4. DEPLOY_PRIME_URL, DEPLOY_URL
 */
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const rootDir = resolve(__dirname, '..');

function readSiteConfigUrl() {
  try {
    const p = resolve(rootDir, 'site.config.json');
    if (!existsSync(p)) return '';
    const j = JSON.parse(readFileSync(p, 'utf8'));
    const u = String(j.siteUrl || '')
      .trim()
      .replace(/\/$/, '');
    return u || '';
  } catch {
    return '';
  }
}

function pickBaseUrl() {
  const fromEnv = [
    process.env.VITE_SITE_URL,
    readSiteConfigUrl(),
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.DEPLOY_URL,
  ]
    .map((s) => (typeof s === 'string' ? s.trim().replace(/\/$/, '') : ''))
    .find(Boolean);
  return fromEnv || '';
}

const base = pickBaseUrl();

const paths = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/explore', priority: '0.9', changefreq: 'weekly' },
  { loc: '/terms', priority: '0.5', changefreq: 'monthly' },
  { loc: '/instructions', priority: '0.6', changefreq: 'monthly' },
  { loc: '/install', priority: '0.7', changefreq: 'monthly' },
  { loc: '/merchant', priority: '0.7', changefreq: 'monthly' },
];

function main() {
  if (!existsSync(distDir)) {
    console.error('[generate-sitemap] dist/ introuvable — lancez vite build avant.');
    process.exit(1);
  }

  if (!base) {
    console.warn(
      '[generate-sitemap] Aucune URL canonique : définis VITE_SITE_URL (Netlify), ou remplis siteUrl dans site.config.json, ou build sur Netlify (URL). Placeholder utilisé — à corriger pour Google Search Console.'
    );
  }

  const origin = base || 'https://REMPLACE-PAR-TON-DOMAINE.ch';

  const urlEntries = paths
    .map(
      (p) => `  <url>
    <loc>${origin}${p.loc === '/' ? '/' : p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/
Disallow: /merchant/post
Disallow: /merchant/edit/
Disallow: /merchant/setup

Sitemap: ${origin}/sitemap.xml
`;

  writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');
  writeFileSync(resolve(distDir, 'robots.txt'), robots, 'utf8');
  console.log(`[generate-sitemap] OK — Sitemap pour Google : ${origin}/sitemap.xml (fichier dans dist/)`);
}

main();
