/**
 * Métadonnées SEO (fr par défaut, marché francophone, multi-pays). Le composant Seo met à jour title / meta à la navigation.
 */

const BRAND = 'FreshRescue';

function truncateMeta(text, maxLen = 160) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trimEnd()}…`;
}

export const SEO_DEFAULT_OG_IMAGE = '/logo512.png';

const HOME = {
  title: `${BRAND} : app anti-gaspillage alimentaire`,
  description: truncateMeta(
    'FreshRescue : sauvez les invendus près de chez vous. Carte locale, offres anti-gaspi à prix flash, sans inscription pour les clients.'
  ),
  h1: 'Anti-gaspillage alimentaire. Près de chez vous.',
};

/** Titre visible recommandé pour le H1 (audit SEO / crawlers). */
export const PAGE_H1 = {
  '/': HOME.h1,
  '/explore': 'Carte des offres anti-gaspi près de chez vous',
  '/partenaires': 'Partenaires FreshRescue',
  '/actualites': 'Actualités FreshRescue',
  '/blog': 'Blog FreshRescue',
  '/terms': 'Conditions générales d’utilisation',
  '/instructions': 'Instructions commerçants et clients',
  '/install': 'Installer l’application FreshRescue',
  '/merchant': 'Espace commerçant FreshRescue',
};

const PAGES = {
  '/': HOME,
  '/explore': {
    title: `Carte des offres anti-gaspi | ${BRAND}`,
    description:
      'Parcourez les offres anti-gaspillage près de chez vous : boulangerie, resto, épicerie. Carte interactive, rayon local et recherche par ville.',
  },
  '/partenaires': {
    title: `Partenaires | ${BRAND}`,
    description: truncateMeta(
      'Partenaires FreshRescue : Restaurants des Chefs et acteurs locaux. Découvrez avec qui on travaille autour de la bouffe de proximité.'
    ),
  },
  '/actualites': {
    title: `Actualités | ${BRAND}`,
    description: truncateMeta(
      'Ce qui bouge chez FreshRescue : lancements, partenariats commerçants et nouveautés anti-gaspillage près de chez vous.'
    ),
  },
  '/blog': {
    title: `Blog | ${BRAND}`,
    description: truncateMeta(
      'Articles FreshRescue par région et public : anti-gaspi, invendus du coin, carte des offres et conseils pour commerçants et clients.'
    ),
  },
  '/terms': {
    title: `Conditions d’utilisation | ${BRAND}`,
    description: `Conditions générales d’utilisation de l’application ${BRAND} : offres, collecte et cookies.`,
  },
  '/instructions': {
    title: `Instructions commerçants et clients | ${BRAND}`,
    description:
      'Guide pratique FreshRescue : publier une offre anti-gaspillage côté commerçant, ou installer l’app et récupérer une offre côté client.',
  },
  '/install': {
    title: `Installer l’app | ${BRAND}`,
    description:
      'Installez FreshRescue sur votre téléphone (PWA) pour voir les invendus près de chez vous et les prix flash du jour.',
  },
  '/merchant': {
    title: `Espace commerçant | ${BRAND}`,
    description:
      'Espace commerçant FreshRescue : connectez-vous, publiez vos invendus et suivez vos offres anti-gaspillage en local.',
  },
  '/forgot-password': {
    title: `Mot de passe oublié | ${BRAND}`,
    description: `Réinitialisation du mot de passe ${BRAND}.`,
    robots: 'noindex, follow',
  },
  '/update-password': {
    title: `Nouveau mot de passe | ${BRAND}`,
    description: `Définir un nouveau mot de passe ${BRAND}.`,
    robots: 'noindex, follow',
  },
};

const NOINDEX = {
  robots: 'noindex, follow',
};

/**
 * @param {string} pathname
 * @returns {{ title: string, description: string, robots?: string, jsonLd?: 'home' | null }}
 */
export function getSeoForPath(pathname) {
  const path = pathname.split('?')[0] || '/';
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

  if (normalized.startsWith('/admin')) {
    return {
      title: `Administration | ${BRAND}`,
      description: `Tableau de bord ${BRAND}.`,
      ...NOINDEX,
      jsonLd: null,
    };
  }
  if (normalized.startsWith('/merchant/post') || normalized.startsWith('/merchant/edit')) {
    return {
      title: `Publication d’offre | ${BRAND}`,
      description: `Publier une offre anti-gaspillage sur ${BRAND}.`,
      ...NOINDEX,
      jsonLd: null,
    };
  }
  if (normalized === '/merchant/setup') {
    return {
      title: `Configuration boutique | ${BRAND}`,
      description: `Paramétrage du profil commerçant ${BRAND}.`,
      ...NOINDEX,
      jsonLd: null,
    };
  }

  if (PAGES[normalized]) {
    const entry = PAGES[normalized];
    return {
      title: entry.title,
      description: truncateMeta(entry.description),
      robots: entry.robots || 'index, follow',
      jsonLd: normalized === '/' ? 'home' : null,
      h1: PAGE_H1[normalized] || entry.title.replace(/\s*-\s*FreshRescue\s*$/i, ''),
    };
  }

  return {
    title: `Page introuvable | ${BRAND}`,
    description: HOME.description,
    ...NOINDEX,
    jsonLd: null,
  };
}
