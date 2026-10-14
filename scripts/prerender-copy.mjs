/**
 * Textes HTML visibles dans le pré-rendu (crawlers sans JS).
 * Ton humain, sans stuffing. Pas de tiret cadratin.
 */

export const SITE_NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/explore/', label: 'Carte des offres' },
  { href: '/partenaires/', label: 'Partenaires' },
  { href: '/actualites/', label: 'Actualités' },
  { href: '/blog/', label: 'Blog' },
  { href: '/instructions/', label: 'Instructions' },
  { href: '/merchant/', label: 'Espace commerçant' },
  { href: '/terms/', label: 'CGU' },
];

/** Blocs de contenu pour pages sans markdown (mots utiles pour RankFlow / Google). */
export const STATIC_BODY = {
  '/': `
<p>FreshRescue est une application anti-gaspillage alimentaire pour la France et la Suisse. Les commerces du coin (boulangeries, épiceries, restaurants, primeurs) publient leurs invendus du jour à prix flash. Vous les voyez sur une carte, près de chez vous, et vous allez les chercher en boutique.</p>
<p>Pas besoin de créer un compte pour consulter les offres. Pas de panier mystère : une photo, un prix, une adresse et une heure limite de retrait. Le paiement se fait sur place, directement chez le commerçant.</p>
<p>Côté commerçant, publier une offre prend quelques minutes. Pendant l’essai, pas de commission sur la vente. L’idée est simple : moins de nourriture jetée, plus de clients locaux, un budget courses un peu allégé.</p>
<p>FreshRescue, c’est aussi un rescue pack du soir quand il reste des plats ou des viennoiseries avant la fermeture. Ouvrez la carte, zoomez sur votre quartier, et voyez ce qui est encore disponible maintenant.</p>
<h2>Comment ça marche</h2>
<p>1. Le commerçant publie une offre avec photo, prix et créneau de retrait.</p>
<p>2. Vous ouvrez la carte FreshRescue et filtrez près de chez vous.</p>
<p>3. Vous vous déplacez avant l’heure limite et payez en magasin.</p>
<h2>Questions fréquentes</h2>
<p><strong>FreshRescue est-elle une application anti-gaspillage alimentaire en France ?</strong> Oui. La carte regroupe des offres locales pour limiter le gaspillage alimentaire, sans livraison obligatoire.</p>
<p><strong>Qu’est-ce qu’un rescue pack ?</strong> C’est une offre flash d’invendus (plats, pain, fruits…) proposée juste avant la fermeture, à prix réduit.</p>
<p><strong>Faut-il s’inscrire pour voir les offres ?</strong> Non pour les clients. Les commerçants ont un espace dédié pour publier.</p>
`,
  '/explore': `
<p>La carte FreshRescue affiche les offres anti-gaspi près de vous : boulangerie, resto, épicerie, fruits et légumes. Cherchez une ville, zoomez sur votre quartier, lisez le prix flash et l’heure de retrait.</p>
<p>Chaque point correspond à un commerce réel. Vous voyez la photo du produit, pas un panier anonyme. Ensuite vous allez récupérer l’offre sur place avant la fin du créneau.</p>
<p>Utile le soir en semaine, le week-end, ou quand vous passez déjà dans le coin. Moins de gaspillage alimentaire, plus d’achats locaux.</p>
<p>Vous pouvez filtrer par catégorie, autoriser la géolocalisation pour centrer la carte, ou taper le nom d’une ville. Les offres disparaissent à l’heure limite : le premier arrivé est souvent servi.</p>
<p>FreshRescue ne livre pas. C’est voulu : on privilégie le retrait en boutique pour garder le contact avec le commerçant et éviter les frais de plateforme sur le panier.</p>
<p>Envie d’aller plus loin ? Lisez le <a href="/blog/">blog par région</a>, les <a href="/instructions/">instructions</a>, ou créez un <a href="/merchant/">espace commerçant</a> pour publier vos propres invendus.</p>
`,
  '/partenaires': `
<p>FreshRescue collabore avec des acteurs de la restauration et du commerce local. Sur cette page, vous trouvez nos partenaires et comment on avance ensemble autour de la cuisine de proximité et de l’anti-gaspillage.</p>
<p>Restaurants des Chefs, par exemple, liste des tables et des chefs en France. Nous, on aide à écouler les invendus du soir. Deux angles complémentaires sur la même idée : manger mieux, plus près, avec moins de pertes.</p>
<p>Si vous représentez un annuaire, une association ou un réseau de commerces et que l’anti-gaspi vous parle, écrivez-nous via les canaux indiqués sur le site. On préfère des partenariats concrets à des logos empilés sans suite.</p>
<p>Voir aussi les <a href="/actualites/">actualités</a> et la <a href="/explore/">carte des offres</a>.</p>
`,
  '/actualites': `
<p>Les actualités FreshRescue : lancements, partenariats commerçants, nouveautés sur la carte anti-gaspi. On y raconte ce qui change pour les clients et pour les boutiques partenaires.</p>
<p>Pas de newsletter obligatoire : cette page suffit pour suivre les annonces. Pour le fond (régions, conseils commerçants), le <a href="/blog/">blog</a> complète les brèves.</p>
`,
  '/blog': `
<p>Le blog FreshRescue parle d’anti-gaspillage alimentaire par région et par public. Articles pour les commerçants qui veulent publier des invendus, et pour les clients qui cherchent des offres près de chez eux.</p>
<p>Parcourez les pages locales (Paris, Lyon, Bordeaux, Bretagne, Grand Est…) ou les guides commerçants et consommateurs.</p>
<p>Chaque article explique le même principe : photo, prix flash, retrait en boutique. Ce qui change, c’est le territoire et le public. Ensuite, ouvrez la <a href="/explore/">carte</a> pour voir ce qui est dispo maintenant.</p>
`,
  '/terms': `
<p>Conditions générales d’utilisation de FreshRescue : règles d’usage de la plateforme anti-gaspillage, responsabilités des commerces et des clients, cookies et mesure d’audience.</p>
<p>FreshRescue met en relation des commerces et des clients autour d’offres d’invendus. La qualité et la conformité des produits restent à la charge du magasin. Le client vérifie allergies et ingrédients sur place.</p>
<p>Le détail des articles (réservation, collecte, cookies, données) figure dans le texte complet affiché sur cette page une fois l’application chargée.</p>
`,
  '/instructions': `
<p>Guide pratique FreshRescue pour commerçants et clients. Côté boutique : créer un compte, publier une offre, gérer le créneau de retrait. Côté client : ouvrir la carte, choisir une offre, venir la chercher avant l’heure limite.</p>
<p>Commerçant : une photo fidèle, un prix clair et une heure de fin évitent les malentendus. Client : arrivez un peu en avance, le stock peut partir vite.</p>
<p>Besoin du contexte local ? Le <a href="/blog/">blog</a> et la page <a href="/merchant/">espace commerçant</a> complètent ce guide.</p>
`,
  '/merchant': `
<p>Espace commerçant FreshRescue : connectez-vous pour publier vos invendus alimentaires à prix flash, suivre vos offres et limiter les pertes en fin de journée. Essai possible, sans commission sur les ventes pendant la période test.</p>
<p>Boulangeries, épiceries, restaurants, primeurs : dès qu’il reste quelque chose de bon à vendre avant la fermeture, vous pouvez le mettre sur la carte. Les habitants du coin voient l’offre et viennent en magasin.</p>
<p>Pas sûr du parcours ? Lisez les <a href="/instructions/">instructions</a> ou l’article <a href="/blog/freshrescue-commercants/">FreshRescue pour les commerçants</a>.</p>
`,
};
