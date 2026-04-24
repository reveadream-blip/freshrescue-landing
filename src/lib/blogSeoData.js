/**
 * SEO pour les pages blog (hors seoConfig.js pour éviter import.meta.glob côté scripts Node).
 */

const BRAND = 'FreshRescue';

const rawArticles = import.meta.glob('../../blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function parseFrontMatter(raw) {
  const clean = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = clean.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: clean };
  const yaml = match[1];
  const content = match[2];
  const data = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim().replace(/^"|"$/g, ''));
    }
    data[m[1]] = value;
  }
  return { data, content };
}

const bySlug = Object.fromEntries(
  Object.entries(rawArticles).map(([path, raw]) => {
    const slug = path.split('/').pop().replace(/\.md$/, '');
    return [slug, raw];
  })
);

const OG_LOCALE_BY_LANG = {
  fr: 'fr_CH',
  de: 'de_CH',
  it: 'it_CH',
  en: 'en_US',
  ru: 'ru_CH',
};

/**
 * @param {string} normalized pathname sans query, sans slash final (sauf /)
 * @returns {{ title: string, description: string, robots: string, jsonLd: null, ogLocale?: string } | null}
 */
export function getBlogPageSeo(normalized) {
  if (normalized === '/blog') {
    return {
      title: `Blog — ${BRAND}`,
      description:
        'Articles FreshRescue par canton : anti-gaspi, invendus, carte des offres et rôle des commerçants en Suisse.',
      robots: 'index, follow',
      jsonLd: null,
      ogLocale: 'fr_CH',
    };
  }

  const m = normalized.match(/^\/blog\/([^/]+)$/);
  if (!m) return null;

  const slug = m[1];
  const raw = bySlug[slug];
  if (!raw) return null;

  const { data } = parseFrontMatter(raw);
  const title = data.title || `${BRAND} — Blog`;
  const description =
    data.description ||
    `Article ${BRAND} : anti-gaspillage alimentaire et offres près de chez vous en Suisse.`;
  const lang = data.lang || 'fr';

  return {
    title,
    description,
    robots: 'index, follow',
    jsonLd: null,
    ogLocale: OG_LOCALE_BY_LANG[lang] || 'fr_CH',
  };
}
