/**
 * Après `vite build`, génère dist/sitemap.xml et dist/robots.txt.
 * Netlify définit URL / DEPLOY_PRIME_URL ; sinon utiliser VITE_SITE_URL dans l’environnement de build.
 */
import { writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');

const baseRaw =
  process.env.VITE_SITE_URL ||
  process.env.URL ||
  process.env.DEPLOY_PRIME_URL ||
  '';
const base = baseRaw.replace(/\/$/, '');

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
      '[generate-sitemap] Aucune URL (VITE_SITE_URL / URL Netlify). sitemap.xml utilisera un placeholder à remplacer.'
    );
  }

  const origin = base || 'https://VOTRE-DOMAINE-PRODUCTION.ch';

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
  console.log(`[generate-sitemap] Écrit ${origin}/sitemap.xml et robots.txt dans dist/`);
}

main();
