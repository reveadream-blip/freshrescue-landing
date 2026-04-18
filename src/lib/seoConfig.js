/**
 * Métadonnées SEO (fr-CH par défaut — marché principal). Le composant Seo met à jour title / meta à la navigation.
 */

const BRAND = 'FreshRescue';

export const SEO_DEFAULT_OG_IMAGE = '/logo512.png';

const HOME = {
  title: `${BRAND} — App anti-gaspillage alimentaire en Suisse`,
  description:
    'FreshRescue : sauvez les invendus près de chez vous. Application suisse anti-gaspillage, carte nationale, offres anti-gaspi à prix flash pour les particuliers et les commerçants.',
};

const PAGES = {
  '/': HOME,
  '/explore': {
    title: `Carte des offres anti-gaspi — ${BRAND}`,
    description:
      'Parcourez les offres anti-gaspillage près de vous en Suisse : boulangerie, resto, épicerie. Carte interactive et recherche par ville.',
  },
  '/terms': {
    title: `Conditions d’utilisation — ${BRAND}`,
    description: `Conditions générales d’utilisation de l’application ${BRAND} (Suisse).`,
  },
  '/instructions': {
    title: `Instructions commerçants & clients — ${BRAND}`,
    description:
      'Guide pour publier une offre anti-gaspillage et pour les clients : installation de l’app FreshRescue.',
  },
  '/install': {
    title: `Installer l’app — ${BRAND}`,
    description: 'Installez FreshRescue sur votre téléphone : PWA anti-gaspillage pour la Suisse.',
  },
  '/merchant': {
    title: `Espace commerçant — ${BRAND}`,
    description:
      'Connectez-vous à votre espace commerçant FreshRescue : publiez vos invendus et luttez contre le gaspillage alimentaire.',
  },
  '/forgot-password': {
    title: `Mot de passe oublié — ${BRAND}`,
    description: `Réinitialisation du mot de passe ${BRAND}.`,
    robots: 'noindex, follow',
  },
  '/update-password': {
    title: `Nouveau mot de passe — ${BRAND}`,
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
      title: `Administration — ${BRAND}`,
      description: `Tableau de bord ${BRAND}.`,
      ...NOINDEX,
      jsonLd: null,
    };
  }
  if (normalized.startsWith('/merchant/post') || normalized.startsWith('/merchant/edit')) {
    return {
      title: `Publication d’offre — ${BRAND}`,
      description: `Publier une offre anti-gaspillage sur ${BRAND}.`,
      ...NOINDEX,
      jsonLd: null,
    };
  }
  if (normalized === '/merchant/setup') {
    return {
      title: `Configuration boutique — ${BRAND}`,
      description: `Paramétrage du profil commerçant ${BRAND}.`,
      ...NOINDEX,
      jsonLd: null,
    };
  }

  if (PAGES[normalized]) {
    const entry = PAGES[normalized];
    return {
      title: entry.title,
      description: entry.description,
      robots: entry.robots || 'index, follow',
      jsonLd: normalized === '/' ? 'home' : null,
    };
  }

  return {
    title: `Page introuvable — ${BRAND}`,
    description: HOME.description,
    ...NOINDEX,
    jsonLd: null,
  };
}
