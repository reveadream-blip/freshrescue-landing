/**
 * Après `vite build`, génère dist/sitemap.xml et dist/robots.txt (URLs absolues, requis par Google Search Console).
 *
 * URL canonique (ordre) : VITE_SITE_URL → site.config.json → URL / DEPLOY_* (Cloudflare Pages, etc.).
 *
 * Pages indexées (aligné sur `src/App.jsx` + SEO indexable) :
 *   /, /explore, /blog, /blog/:slug, /terms, /instructions, /install, /merchant
 *
 * Exclues du sitemap (noindex / zones privées) :
 *   /admin/*, /forgot-password, /update-password, /merchant/post, /merchant/edit/*, /merchant/setup
 *
 * Contenu :
 *   - pages statiques ci-dessous (+ lastmod = date de build)
 *   - articles blog depuis ../blog/*.md (lastmod = date front-matter si présente, hreflang selon lang)
 */
import { writeFileSync, existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const rootDir = resolve(__dirname, '..');
const blogDir = resolve(rootDir, 'blog');

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

/** Lit le front-matter YAML d'un fichier Markdown (pour recuperer slug + lang + date). */
function parseFrontMatter(raw) {
  const clean = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = clean.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!mm) continue;
    let value = mm[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    data[mm[1]] = value;
  }
  return data;
}

/** Retourne la liste des articles de blog trouves dans blog/*.md. */
function readBlogPosts() {
  if (!existsSync(blogDir)) return [];
  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  return files
    .map((file) => {
      const raw = readFileSync(resolve(blogDir, file), 'utf8');
      const data = parseFrontMatter(raw);
      const slug = data.slug || basename(file, '.md');
      return {
        loc: `/blog/${slug}`,
        lastmod: data.date || undefined,
        lang: data.lang || 'fr',
      };
    })
    .sort((a, b) => a.loc.localeCompare(b.loc));
}

const base = pickBaseUrl();

const staticPaths = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/explore', priority: '0.9', changefreq: 'weekly' },
  { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
  { loc: '/terms', priority: '0.5', changefreq: 'monthly' },
  { loc: '/instructions', priority: '0.6', changefreq: 'monthly' },
  { loc: '/install', priority: '0.7', changefreq: 'monthly' },
  { loc: '/merchant', priority: '0.7', changefreq: 'monthly' },
];

function xmlUrl({ origin, loc, priority = '0.7', changefreq = 'monthly', lastmod, lang }) {
  const locTag = `<loc>${origin}${loc === '/' ? '/' : loc}</loc>`;
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  const hreflangTag = lang
    ? `\n    <xhtml:link rel="alternate" hreflang="${lang}" href="${origin}${loc}" />`
    : '';
  return `  <url>
    ${locTag}${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${hreflangTag}
  </url>`;
}

function main() {
  if (!existsSync(distDir)) {
    console.error('[generate-sitemap] dist/ introuvable — lancez vite build avant.');
    process.exit(1);
  }

  if (!base) {
    console.warn(
      '[generate-sitemap] Aucune URL canonique : définis VITE_SITE_URL, ou remplis siteUrl dans site.config.json, ou build sur Cloudflare (URL). Placeholder utilisé — à corriger pour Google Search Console.'
    );
  }

  const origin = base || 'https://REMPLACE-PAR-TON-DOMAINE.ch';

  const buildLastmod = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const blogPosts = readBlogPosts();
  const blogEntries = blogPosts.map((p) =>
    xmlUrl({
      origin,
      loc: p.loc,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: p.lastmod || buildLastmod,
      lang: p.lang,
    })
  );

  const staticEntries = staticPaths.map((p) =>
    xmlUrl({
      origin,
      loc: p.loc,
      priority: p.priority,
      changefreq: p.changefreq,
      lastmod: buildLastmod,
    })
  );

  const urlEntries = [...staticEntries, ...blogEntries].join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
  const total = staticPaths.length + blogPosts.length;
  console.log(
    `[generate-sitemap] OK — ${total} URLs (${staticPaths.length} statiques + ${blogPosts.length} blog) → ${origin}/sitemap.xml`
  );
}

main();
