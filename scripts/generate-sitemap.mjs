/**
 * Après `vite build`, génère dist/sitemap.xml et dist/robots.txt (URLs absolues).
 *
 * URL canonique : VITE_SITE_URL → site.config.json → URL / DEPLOY_* (Cloudflare).
 *
 * Pages indexées : /, /explore, /actualites, /actualites/:id, /blog, /blog/:slug, …
 * Exclues : /admin/*, auth, merchant/post|edit|setup
 */
import { writeFileSync, existsSync, readFileSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const rootDir = resolve(__dirname, '..');
const blogDir = resolve(rootDir, 'blog');
const newsItemsPath = resolve(rootDir, 'src/data/newsItems.js');

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

/** Lit le front-matter YAML d'un fichier Markdown. */
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

/**
 * Slug canonique = nom du fichier .md (aligné sur Blog.jsx / BlogArticle.jsx).
 */
function readBlogPosts() {
  if (!existsSync(blogDir)) return [];
  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  return files
    .map((file) => {
      const raw = readFileSync(resolve(blogDir, file), 'utf8');
      const data = parseFrontMatter(raw);
      const slug = basename(file, '.md');
      return {
        loc: `/blog/${slug}`,
        lastmod: data.date || undefined,
      };
    })
    .sort((a, b) => {
      const da = a.lastmod || '';
      const db = b.lastmod || '';
      if (da !== db) return db.localeCompare(da);
      return a.loc.localeCompare(b.loc);
    });
}

/** Pages actualités avec article interne (/actualites/:id). */
function readNewsArticlePaths() {
  if (!existsSync(newsItemsPath)) return [];
  const raw = readFileSync(newsItemsPath, 'utf8');
  const paths = new Set();
  // Format actuel : id: 'slug'  →  /actualites/slug
  const idRe = /\bid:\s*['"]([a-z0-9-]+)['"]/g;
  let m;
  while ((m = idRe.exec(raw))) {
    paths.add(`/actualites/${m[1]}`);
  }
  // Ancien format éventuel : articleLink: '/actualites/...'
  const linkRe = /articleLink:\s*['"](\/actualites\/[^'"]+)['"]/g;
  while ((m = linkRe.exec(raw))) {
    paths.add(m[1]);
  }
  return [...paths]
    .sort()
    .map((loc) => ({ loc, lastmod: undefined }));
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Encode chaque segment de chemin (accents, espaces). */
function toAbsoluteUrl(origin, pathname) {
  if (pathname === '/') return `${origin}/`;
  const encoded = pathname
    .split('/')
    .map((seg) => (seg ? encodeURIComponent(seg) : ''))
    .join('/');
  return `${origin}${encoded}`;
}

function xmlUrl({ origin, loc, lastmod }) {
  const abs = escapeXml(toAbsoluteUrl(origin, loc));
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${abs}</loc>${lastmodTag}\n  </url>`;
}

const STATIC_PATHS = [
  '/',
  '/explore',
  '/partenaires',
  '/actualites',
  '/blog',
  '/terms',
  '/instructions',
  '/install',
  '/merchant',
];

function main() {
  if (!existsSync(distDir)) {
    console.error('[generate-sitemap] dist/ introuvable : lancez vite build avant.');
    process.exit(1);
  }

  if (!base) {
    console.warn(
      '[generate-sitemap] Aucune URL canonique : définis VITE_SITE_URL ou siteUrl dans site.config.json.'
    );
  }

  const origin = base || 'https://REMPLACE-PAR-TON-DOMAINE.ch';

  const buildLastmod = process.env.SOURCE_DATE_EPOCH
    ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const blogPosts = readBlogPosts();
  const newsPosts = readNewsArticlePaths();

  const staticEntries = STATIC_PATHS.map((loc) =>
    xmlUrl({ origin, loc, lastmod: buildLastmod })
  );

  const newsEntries = newsPosts.map((p) =>
    xmlUrl({ origin, loc: p.loc, lastmod: p.lastmod || buildLastmod })
  );

  const blogEntries = blogPosts.map((p) =>
    xmlUrl({ origin, loc: p.loc, lastmod: p.lastmod || buildLastmod })
  );

  const urlEntries = [...staticEntries, ...newsEntries, ...blogEntries].join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/
Disallow: /forgot-password
Disallow: /update-password
Disallow: /merchant/post
Disallow: /merchant/edit/
Disallow: /merchant/setup

Sitemap: ${origin}/sitemap.xml
`;

  writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');
  writeFileSync(resolve(distDir, 'robots.txt'), robots, 'utf8');

  const total = STATIC_PATHS.length + newsPosts.length + blogPosts.length;
  console.log(
    `[generate-sitemap] OK : ${total} URLs (${STATIC_PATHS.length} statiques + ${newsPosts.length} actualités + ${blogPosts.length} blog) → ${origin}/sitemap.xml`
  );
}

const base = pickBaseUrl();
main();
