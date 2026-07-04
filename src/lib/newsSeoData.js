import { NEWS_ITEMS } from '@/data/newsItems';
import { truncateMeta, truncateTitle } from './seoUtils';

const BRAND = 'FreshRescue';

/**
 * @param {string} normalized pathname sans query
 */
export function getNewsPageSeo(normalized) {
  const m = normalized.match(/^\/actualites\/([^/]+)$/);
  if (!m) return null;

  const item = NEWS_ITEMS.find((entry) => entry.id === m[1]);
  if (!item) return null;

  const title =
    (item.title && (item.title.fr || item.title.en)) ||
    `${BRAND} — Actualités`;
  const description =
    (item.excerpt && (item.excerpt.fr || item.excerpt.en)) ||
    `Actualité ${BRAND} : anti-gaspillage et initiatives locales.`;

  const h1 = title.replace(/^🔴\s*/, '');
  const seoTitle = title.includes(BRAND) ? title : `${h1} — ${BRAND}`;

  return {
    title: truncateTitle(seoTitle),
    description: truncateMeta(description),
    robots: 'index, follow',
    jsonLd: null,
    h1,
  };
}
