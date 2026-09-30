/**
 * Pré-rendu HTML minimal pour les crawlers (H1, title, description, canonical).
 * Génère dist/<route>/index.html à partir du template dist/index.html.
 * Le bundle React remplace le contenu de #root au chargement.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { getSeoForPath } from '../src/lib/seoConfig.js';
import {
  canonicalUrl,
  shortBlogSeoTitle,
  truncateMeta,
  truncateTitle,
} from '../src/lib/seoUtils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const rootDir = resolve(__dirname, '..');
const blogDir = resolve(rootDir, 'blog');
const newsItemsPath = resolve(rootDir, 'src/data/newsItems.js');

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

function readSiteOrigin() {
  try {
    const cfg = JSON.parse(readFileSync(resolve(rootDir, 'site.config.json'), 'utf8'));
    const u = String(cfg.siteUrl || '')
      .trim()
      .replace(/\/$/, '');
    if (u) return u;
  } catch {
    /* ignore */
  }
  return process.env.VITE_SITE_URL?.replace(/\/$/, '') || 'https://freshrescue.app';
}

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

function cleanBlogH1(title) {
  return (title || '')
    .replace(/^FreshRescue\.app dans la r[eé]gion /, '')
    .replace(/^FreshRescue\.app dans le département /, '')
    .replace(/^FreshRescue\.app pour les /, '')
    .replace(/^FreshRescue\.app /, '');
}

function readBlogRoutes() {
  if (!existsSync(blogDir)) return [];
  return readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(resolve(blogDir, file), 'utf8');
      const data = parseFrontMatter(raw);
      const slug = basename(file, '.md');
      const title = data.title || slug;
      return {
        path: `/blog/${slug}`,
        title: shortBlogSeoTitle(data),
        description: truncateMeta(
          data.description ||
            'Article FreshRescue : anti-gaspillage alimentaire et offres près de chez vous.'
        ),
        h1: cleanBlogH1(title) || title,
      };
    });
}

function readNewsRoutes() {
  if (!existsSync(newsItemsPath)) return [];
  const raw = readFileSync(newsItemsPath, 'utf8');
  const routes = [];
  const idRe = /id:\s*'([^']+)'/g;
  let idMatch;
  while ((idMatch = idRe.exec(raw))) {
    const id = idMatch[1];
    const slice = raw.slice(idMatch.index, idMatch.index + 12000);
    const hasBody =
      slice.includes('contentHtml:') ||
      slice.includes(`articleLink: '/actualites/${id}'`) ||
      slice.includes(`articleLink: "/actualites/${id}"`);
    if (!hasBody) continue;
    // Ne prerender que les items avec vrai contenu HTML
    if (!slice.includes('contentHtml:')) continue;
    const frTitle = slice.match(/title:\s*\{[\s\S]*?fr:\s*'((?:\\'|[^'])*)'/);
    const frExcerpt = slice.match(/excerpt:\s*\{[\s\S]*?fr:\s*'((?:\\'|[^'])*)'/);
    const title = frTitle ? frTitle[1].replace(/\\'/g, "'") : id;
    const excerpt = frExcerpt
      ? frExcerpt[1].replace(/\\'/g, "'")
      : `Actualité FreshRescue : ${title}`;
    const h1 = title.replace(/^🔴\s*/, '');
    const seoTitle = title.includes('FreshRescue') ? title : `${h1} | FreshRescue`;
    routes.push({
      path: `/actualites/${id}`,
      title: truncateTitle(seoTitle),
      description: truncateMeta(excerpt),
      h1,
      robots: 'index, follow',
    });
  }
  return routes;
}

function getPageMeta(pathname, blogRoutes, newsRoutes) {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const blog = blogRoutes.find((r) => r.path === normalized);
  if (blog) {
    return {
      title: blog.title,
      description: blog.description,
      h1: blog.h1,
      robots: 'index, follow',
    };
  }

  const news = newsRoutes.find((r) => r.path === normalized);
  if (news) {
    return news;
  }

  const seo = getSeoForPath(normalized);
  return {
    title: seo.title,
    description: truncateMeta(seo.description),
    h1: seo.h1 || seo.title.replace(/\s* - \s*FreshRescue\s*$/i, ''),
    robots: seo.robots || 'index, follow',
  };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(template, { origin, path, title, description, h1, robots }) {
  const canonical = canonicalUrl(origin, path);
  const ogImage = `${origin}/logo512.png`;
  const rootPayload = `<main><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p></main>`;

  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta name="robots" content="[^"]*"\s*\/?>/,
    `<meta name="robots" content="${escapeHtml(robots)}" />`
  );

  const ogBlock = `    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="FreshRescue" />
    <meta property="og:locale" content="fr_FR" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
`;

  // Remplace le bloc OG du template s'il existe, sinon injecte avant </head>
  if (html.includes('property="og:title"')) {
    html = html.replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${escapeHtml(canonical)}" />`
    );
    html = html.replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escapeHtml(title)}" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    );
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    );
  } else {
    html = html.replace('</head>', `${ogBlock}  </head>`);
  }

  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeHtml(canonical)}" />`
    );
  } else {
    html = html.replace(
      '</head>',
      `    <link rel="canonical" href="${escapeHtml(canonical)}" />\n  </head>`
    );
  }

  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${rootPayload}</div>`
  );
  return html;
}

function writeForPath(html, pathname) {
  if (pathname === '/') {
    writeFileSync(join(distDir, 'index.html'), html, 'utf8');
    return;
  }
  const dir = join(distDir, ...pathname.slice(1).split('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
}

function main() {
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('[prerender-html] dist/index.html introuvable : lancez vite build avant.');
    process.exit(1);
  }

  const origin = readSiteOrigin();
  let template = readFileSync(join(distDir, 'index.html'), 'utf8');
  // Réinitialise #root (évite de réutiliser un prerender précédent si le script est relancé seul)
  template = template.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"></div>');
  const blogRoutes = readBlogRoutes();
  const newsRoutes = readNewsRoutes();

  const paths = [
    ...STATIC_PATHS,
    ...blogRoutes.map((r) => r.path),
    ...newsRoutes.map((r) => r.path),
  ];

  for (const path of paths) {
    const meta = getPageMeta(path, blogRoutes, newsRoutes);
    const html = buildHtml(template, { origin, path, ...meta });
    writeForPath(html, path);
  }

  console.log(`[prerender-html] OK : ${paths.length} pages (H1 + canonical) pour ${origin}`);
}

main();
