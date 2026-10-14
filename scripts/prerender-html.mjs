/**
 * Pré-rendu HTML pour crawlers (title, description, canonical, H1, corps, liens, JSON-LD).
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
import { SITE_NAV, STATIC_BODY } from './prerender-copy.mjs';

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

function parseFrontMatterFull(raw) {
  const clean = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = clean.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, content: clean };
  const data = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!mm) continue;
    let value = mm[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    data[mm[1]] = value;
  }
  return { data, content: m[2] || '' };
}

function cleanBlogH1(title) {
  return (title || '')
    .replace(/^FreshRescue\.app dans la r[eé]gion /, '')
    .replace(/^FreshRescue\.app dans le département /, '')
    .replace(/^FreshRescue\.app pour les /, '')
    .replace(/^FreshRescue\.app /, '');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Markdown blog → HTML simple (sans dépendances). */
function markdownToHtml(md) {
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [];

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(' ').trim();
    para = [];
    if (!text) return;
    const withInline = text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    out.push(`<p>${withInline}</p>`);
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushPara();
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushPara();
      out.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      flushPara();
      out.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }
    para.push(escapeHtml(trimmed.replace(/^[-*]\s+/, '')));
  }
  flushPara();
  return out.join('\n');
}

function buildNavHtml() {
  const links = SITE_NAV.map(
    (item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
  ).join(' · ');
  return `<nav aria-label="Navigation principale">${links}</nav>`;
}

function buildFooterHtml() {
  const links = SITE_NAV.map(
    (item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
  ).join(' · ');
  return `<footer><p>${links}</p><p>© FreshRescue · anti-gaspillage alimentaire</p></footer>`;
}

function pathHref(path) {
  if (path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
}

function buildBlogIndexLinks(blogRoutes) {
  if (!blogRoutes.length) return '';
  const items = blogRoutes
    .map((r) => `<li><a href="${escapeHtml(pathHref(r.path))}">${escapeHtml(r.h1)}</a></li>`)
    .join('');
  return `<h2>Tous les articles</h2><ul>${items}</ul>`;
}

function readBlogRoutes() {
  if (!existsSync(blogDir)) return [];
  return readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = readFileSync(resolve(blogDir, file), 'utf8');
      const { data, content } = parseFrontMatterFull(raw);
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
        bodyHtml: markdownToHtml(content),
        datePublished: data.date || undefined,
        jsonLd: 'article',
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
    if (!slice.includes('contentHtml:')) continue;
    const frTitle = slice.match(/title:\s*\{[\s\S]*?fr:\s*'((?:\\'|[^'])*)'/);
    const frExcerpt = slice.match(/excerpt:\s*\{[\s\S]*?fr:\s*'((?:\\'|[^'])*)'/);
    const frHtml = slice.match(/contentHtml:\s*\{[\s\S]*?fr:\s*`([\s\S]*?)`/);
    const title = frTitle ? frTitle[1].replace(/\\'/g, "'") : id;
    const excerpt = frExcerpt
      ? frExcerpt[1].replace(/\\'/g, "'")
      : `Actualité FreshRescue : ${title}`;
    const h1 = title.replace(/^🔴\s*/, '');
    const seoTitle = title.includes('FreshRescue') ? title : `${h1} | FreshRescue`;
    const dateMatch = slice.match(/date:\s*'([^']+)'/);
    routes.push({
      path: `/actualites/${id}`,
      title: truncateTitle(seoTitle),
      description: truncateMeta(excerpt),
      h1,
      robots: 'index, follow',
      bodyHtml: frHtml ? frHtml[1] : `<p>${escapeHtml(excerpt)}</p>`,
      datePublished: dateMatch ? dateMatch[1] : undefined,
      jsonLd: 'news',
    });
  }
  return routes;
}

function getPageMeta(pathname, blogRoutes, newsRoutes) {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const blog = blogRoutes.find((r) => r.path === normalized);
  if (blog) return { ...blog, robots: 'index, follow' };

  const news = newsRoutes.find((r) => r.path === normalized);
  if (news) return news;

  const seo = getSeoForPath(normalized);
  let bodyHtml = STATIC_BODY[normalized] || `<p>${escapeHtml(seo.description)}</p>`;
  if (normalized === '/blog') {
    bodyHtml += buildBlogIndexLinks(blogRoutes);
  }
  if (normalized === '/actualites' && newsRoutes.length) {
    const items = newsRoutes
      .map((r) => `<li><a href="${escapeHtml(r.path)}/">${escapeHtml(r.h1)}</a></li>`)
      .join('');
    bodyHtml += `<h2>Dernières actualités</h2><ul>${items}</ul>`;
  }

  return {
    title: seo.title,
    description: truncateMeta(seo.description),
    h1: seo.h1 || seo.title.replace(/\s* - \s*FreshRescue\s*$/i, ''),
    robots: seo.robots || 'index, follow',
    bodyHtml,
    jsonLd: normalized === '/' ? 'home' : 'webpage',
  };
}

function buildJsonLd({ origin, path, title, description, h1, jsonLd, datePublished }) {
  const canonical = canonicalUrl(origin, path);
  const ogImage = `${origin}/logo512.png`;

  if (jsonLd === 'home') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: 'FreshRescue',
          url: origin,
          logo: ogImage,
          description,
        },
        {
          '@type': 'WebSite',
          '@id': `${origin}/#website`,
          url: origin,
          name: 'FreshRescue',
          publisher: { '@id': `${origin}/#organization` },
          inLanguage: 'fr',
        },
      ],
    };
  }

  if (jsonLd === 'article' || jsonLd === 'news') {
    return {
      '@context': 'https://schema.org',
      '@type': jsonLd === 'news' ? 'NewsArticle' : 'BlogPosting',
      headline: h1 || title,
      description,
      datePublished: datePublished || undefined,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'FreshRescue' },
      publisher: {
        '@type': 'Organization',
        name: 'FreshRescue',
        logo: { '@type': 'ImageObject', url: ogImage },
      },
      image: ogImage,
      inLanguage: 'fr',
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'FreshRescue', url: origin },
    inLanguage: 'fr',
  };
}

function buildHtml(template, meta, origin, path) {
  const { title, description, h1, robots, bodyHtml = '', jsonLd = 'webpage', datePublished } = meta;
  const canonical = canonicalUrl(origin, path);
  const ogImage = `${origin}/logo512.png`;

  const related =
    path.startsWith('/blog/')
      ? `<p><a href="/blog/">Tous les articles</a> · <a href="/explore/">Voir la carte</a> · <a href="/">Accueil</a></p>`
      : path.startsWith('/actualites/')
        ? `<p><a href="/actualites/">Toutes les actualités</a> · <a href="/partenaires/">Partenaires</a> · <a href="/">Accueil</a></p>`
        : '';

  const rootPayload = `${buildNavHtml()}<main><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p>${bodyHtml}${related}</main>${buildFooterHtml()}`;

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

  const ld = buildJsonLd({
    origin,
    path,
    title,
    description,
    h1,
    jsonLd,
    datePublished,
  });
  const ldScript = `    <script type="application/ld+json">${JSON.stringify(ld)}</script>\n`;
  html = html.replace('</head>', `${ldScript}  </head>`);

  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${rootPayload}</div>`);
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
  template = template.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"></div>');
  // Retire un éventuel JSON-LD déjà injecté dans le template (homepage)
  template = template.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');

  const blogRoutes = readBlogRoutes();
  const newsRoutes = readNewsRoutes();

  const paths = [
    ...STATIC_PATHS,
    ...blogRoutes.map((r) => r.path),
    ...newsRoutes.map((r) => r.path),
  ];

  for (const path of paths) {
    const meta = getPageMeta(path, blogRoutes, newsRoutes);
    const html = buildHtml(template, meta, origin, path);
    writeForPath(html, path);
  }

  console.log(`[prerender-html] OK : ${paths.length} pages (contenu + JSON-LD + maillage) pour ${origin}`);
}

main();
