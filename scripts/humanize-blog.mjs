/**
 * Réécrit le corps des articles blog (contenu unique par fichier).
 * Usage : node scripts/humanize-blog.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogDir = resolve(__dirname, '../blog');

/** @type {Record<string, { author?: string, sections: string[] }>} */
const BODIES = {
  'freshrescue-paris': {
    author: 'David',
    sections: [
      'À Paris, la fin de journée laisse souvent des viennoiseries, plateaux traiteur ou fruits mûrs invendus. Plutôt que de les jeter, des commerces du 11e, du Marais ou de Montreuil les proposent en offre flash sur **FreshRescue.app**, visible sur une carte par arrondissement.',
      '## Comment ça marche sur le terrain',
      'Le commerçant prend une photo, indique un prix réduit et un créneau de retrait (souvent 30 à 90 minutes). Les voisins consultent la carte, réservent mentalement leur passage et paient directement en caisse. Pas de livraison : le panier reste frais et le commerce garde la main sur la relation client.',
      '## Côté commerçants parisiens',
      'Boulangers, primeurs de marché couvert, cavistes ou traiteurs du quartier récupèrent une visite de plus en fin de service. L’offre est publiée en deux minutes depuis un téléphone ; pendant la période d’essai, aucune commission n’est prélevée sur la vente en magasin.',
      '## Côté habitants',
      'On parcourt les offres autour de son métro ou de son vélo, on compare les prix flash et on adapte son trajet du soir. C’est utile pour un dîner improvisé sans surconsommation ni commande opaque sur une plateforme nationale.',
      '## Pourquoi Paris est un bon terrain',
      'La densité de commerces alimentaires et les trajets courts favorisent une récupération rapide. FreshRescue mise sur cette proximité plutôt que sur des paniers mystère livrés à l’autre bout de la ville.',
      '## En bref',
      'Moins d’invendus jetés, plus de visibilité pour les commerces de proximité, et des paniers accessibles pour ceux qui vivent ou travaillent à Paris.',
    ],
  },
  'freshrescue-ile-de-france': {
    author: 'David',
    sections: [
      'En petite couronne comme en grande couronne, les invendus du jour finissent parfois à la benne faute de client à proximité. **FreshRescue.app** les affiche sur une carte locale pour que quelqu’un à quelques kilomètres puisse passer avant la fermeture.',
      '## Le principe',
      'Photo, prix flash, heure limite de retrait : le commerçant publie, les habitants filtrent par zone. Le paiement se fait en boutique, ce qui évite les frais de plateforme et les annulations de dernière minute liées à la livraison.',
      '## Commerces concernés',
      'Boulangeries de centre-bourg, restauration rapide en zone commerciale, primeurs et épiceries de quartier : autant de structures qui peuvent transformer un surplus en chiffre d’affaires additionnel plutôt qu’en perte sèche.',
      '## Pour les familles en IDF',
      'Les offres restent dans un rayon raisonnable (jusqu’à 30 km selon les réglages), ce qui limite les déplacements et encourage l’achat local plutôt que le tout-livré depuis un entrepôt lointain.',
      '## Spécificité francilienne',
      'Entre pôles denses et communes plus résidentielles, les horaires de fermeture varient : la carte permet de voir ce qui est encore disponible maintenant, pas demain matin quand ce sera trop tard.',
      '## En bref',
      'Une même application pour relier invendus et clients là où ils se croisent déjà au quotidien en Île-de-France.',
    ],
  },
  'freshrescue-bretagne': {
    author: 'David',
    sections: [
      'En Bretagne, poissons du jour, légumes de marée et viennoiseries de bord de mer méritent une seconde vie. FreshRescue met ces surplus en avant sur une carte que les habitants consultent avant de sortir du travail.',
      '## Sur le marché ou en boutique',
      'Le producteur ou le commerçant annonce ce qui reste : prix réduit, créneau de retrait clair. Le client vient sur place, souvent à pied ou en vélo, et règle en caisse comme pour un achat classique.',
      '## Pour les commerces bretons',
      'Crêperies, poissonneries, primeurs des Lices à Rennes ou épiceries de port : chacun peut tester la publication sans engagement long, avec un mois d’essai sans commission sur les ventes en magasin.',
      '## Pour les consommateurs',
      'On découvre des adresses de quartier, on mange mieux sans gaspiller et on soutient l’économie locale — surtout en saison touristique quand les stocks bougent vite.',
      '## L’atout breton',
      'Les liens courts entre producteurs, marchés et villages font de la récupération sur place une évidence. La carte FreshRescue s’inscrit dans cette logique de circuit court.',
      '## En bref',
      'Moins de perte en fin de journée, plus de visibilité pour les commerces qui nourrissent la région.',
    ],
  },
  'freshrescue-grand-est': {
    author: 'David',
    sections: [
      'Du Bas-Rhin à la Marne, boulangeries alsaciennes et épiceries de centre-ville génèrent des invendus dès que la météo ou le calendrier décalent la fréquentation. FreshRescue les rend visibles en temps réel sur une carte régionale.',
      '## Fonctionnement',
      'Une offre = une photo honnête, un prix flash, une heure de retrait. Les clients proches passent en boutique ; le commerçant encaisse comme d’habitude et évite le gaspillage en fin de journée.',
      '## Commerçants',
      'Traiteurs, boulangers, restaurateurs et primeurs peuvent publier depuis leur smartphone dès qu’ils constatent un surplus, sans refonte de caisse ni contrat opaque.',
      '## Consommateurs',
      'Comparer les offres du moment, choisir selon son trajet domicile-travail et récupérer des produits encore parfaitement consommables.',
      '## Contexte Grand Est',
      'Frontière, marchés de Noël, zones rurales et villes moyennes : les habitudes d’achat diffèrent, mais le besoin de proximité reste le même. Une carte locale répond mieux qu’un agrégateur national générique.',
      '## En bref',
      'Relier invendus et clients sur le territoire, sans complexifier la vente en magasin.',
    ],
  },
  'freshrescue-bas-rhin-strasbourg': {
    author: 'David',
    sections: [
      'À Strasbourg et dans le Bas-Rhin, la tradition du marché et la proximité avec l’Allemagne créent une offre alimentaire riche — et parfois des invendus en fin de journée. FreshRescue aide à les écouler vite, à deux pas du client.',
      '## En pratique',
      'Le commerçant publie ce qui reste (sandwiches, bretzels du jour, fruits mûrs) avec un créneau de retrait. Les étudiants, familles et travailleurs du centre voient l’offre sur la carte et passent avant la fermeture.',
      '## Pour les professionnels',
      'Winstubs, boulangeries, primeurs : un flux client supplémentaire sans publicité coûteuse, surtout les soirs où la salle ou le comptoir se calme plus tôt que prévu.',
      '## Pour les acheteurs',
      'Prix réduits, produits locaux, zéro livraison : on sait exactement où aller et jusqu’à quelle heure.',
      '## Pourquoi Strasbourg',
      'Ville à vélo, commerces accessibles et forte culture de marché : la récupération en boutique est naturelle. FreshRescue numérise seulement ce qui se faisait déjà au comptoir, en mieux informé.',
      '## En bref',
      'Visibilité locale, moins de pertes, plus de liens entre commerces et quartier.',
    ],
  },
  'freshrescue-ille-et-vilaine-rennes': {
    author: 'David',
    sections: [
      'À Rennes et en Ille-et-Vilaine, le rythme des marchés (dont les Lices) laisse parfois des stocks invendus le samedi soir. FreshRescue permet de les proposer immédiatement aux habitants dans un rayon court.',
      '## Comment publier',
      'Photo, prix, heure limite : trois champs suffisent. L’offre apparaît sur la carte ; les clients viennent récupérer et paient sur place.',
      '## Commerces',
      'Boulangeries, fromageries, traiteurs et restos de centre : ils gagnent une visite de plus au lieu de jeter des produits encore bons.',
      '## Consommateurs rennais',
      'Idéal pour compléter le panier du week-end ou réagir à une offre vue en sortant du bureau.',
      '## Spécificité locale',
      'Ville étudiante et pôle numérique : les habitants sont à l’aise avec une carte mobile, mais l’achat reste bien ancré en commerce physique — c’est le cœur du modèle FreshRescue.',
      '## En bref',
      'Anti-gaspi local, sans intermédiaire de livraison.',
    ],
  },
  'freshrescue-gironde-bordeaux': {
    author: 'David',
    sections: [
      'À Bordeaux et en Gironde, cavistes, boulangeries et halles alimentaires connaissent des fins de journée avec des invendus. FreshRescue les expose à ceux qui peuvent passer dans l’heure.',
      '## Le flux',
      'Publication mobile, consultation carte, retrait en magasin, paiement en caisse. Simple pour le commerçant, clair pour le client.',
      '## Professionnels',
      'Transformer un plateau fromage ou des viennoiseries restantes en vente additionnelle plutôt qu’en déchet.',
      '## Particuliers',
      'Découvrir des commerces de chartrons ou de banlieue proche, avec des prix flash transparents.',
      '## Bordeaux métropole',
      'Entre vignoble périurbain et centre UNESCO, les trajets courts permettent une vraie récupération de dernière minute.',
      '## En bref',
      'Moins de gaspillage, plus de trafic utile en boutique.',
    ],
  },
  'freshrescue-nouvelle-aquitaine': {
    author: 'David',
    sections: [
      'De la côte atlantique au Limousin, les commerces alimentaires jettent encore trop d’invendus faute de visibilité. FreshRescue centralise les offres du moment sur une carte régionale lisible.',
      '## Principe',
      'Chaque offre indique où aller, combien payer et jusqu’à quand. Pas de surprise : le produit est celui de la photo, récupéré chez le commerçant.',
      '## Commerçants',
      'Restaurants, primeurs, boulangeries de village ou de zone commerciale : tous peuvent essayer la plateforme avec un mois sans commission sur les ventes en magasin.',
      '## Consommateurs',
      'Manger local, payer moins, limiter les kilomètres inutiles.',
      '## Nouvelle-Aquitaine',
      'Territoire vaste mais habité de nombreux bourgs : le filtre par distance évite les fausses promesses de livraison lointaine.',
      '## En bref',
      'Une vitrine locale pour les surplus alimentaires du jour.',
    ],
  },
  'freshrescue-occitanie': {
    author: 'David',
    sections: [
      'En Occitanie, marchés du matin et commerces de centre historique laissent des invendus quand la chaleur accélère la maturation. FreshRescue alerte les clients à proximité avant la fermeture.',
      '## Mode d’emploi',
      'Le commerçant photographie, fixe un prix flash et une heure de retrait. Les utilisateurs parcourent la carte autour de leur position.',
      '## Côté pro',
      'Boulangeries, primeurs, traiteurs : réduire la casse de fin de journée tout en accueillant de nouveaux visages.',
      '## Côté client',
      'Profiter de produits encore frais sans commander un panier anonyme livré de loin.',
      '## Occitanie',
      'Villes moyennes et littoral : la diversité des commerces se prête bien à une carte d’offres géolocalisées.',
      '## En bref',
      'Relier surplus et foyers voisins, rapidement.',
    ],
  },
  'freshrescue-haute-garonne-toulouse': {
    author: 'David',
    sections: [
      'À Toulouse, entre Victor Hugo, Saint-Cyprien et les zones d’activité, les invendus du midi ou du soir trouvent preneur s’ils sont visibles à temps. FreshRescue joue ce rôle de relais local.',
      '## Sur le terrain',
      'Publication en quelques gestes, retrait en boutique, paiement direct. Le commerçant garde le contact humain avec le client.',
      '## Commerces toulousains',
      'Restauration, boulangerie, épicerie fine : limiter les pertes quand la affluence varie selon les jours de marché ou les matchs au stadium.',
      '## Habitants',
      'Repérer une offre sur la carte, s’y rendre à vélo ou en métro léger, compléter le repas du soir.',
      '## Pourquoi Toulouse',
      'Ville étudiante et dynamique : forte adoption mobile, mais volonté de soutenir le commerce de proximité plutôt que le tout-jetable.',
      '## En bref',
      'Anti-gaspi concret, ancré dans les quartiers toulousains.',
    ],
  },
  'freshrescue-rhone-lyon': {
    author: 'David',
    sections: [
      'À Lyon, les bouchons, halles et boulangeries de pentes génèrent des invendus dès que le service tourne plus vite que prévu. FreshRescue les affiche pour un passage rapide en boutique.',
      '## Fonctionnement',
      'Photo réelle, prix réduit, créneau de retrait : le client sait où et quand venir. Pas de commission sur la vente en magasin pendant l’essai commerçant.',
      '## Commerçants',
      'Traiteurs lyonnais, boulangers, primeurs des Halles : une vitrine supplémentaire sans campagne pub payante.',
      '## Consommateurs',
      'Découvrir des adresses de quartier, manger de qualité à prix doux, limiter le gaspillage.',
      '## Grand Lyon',
      'Densité urbaine et culture gastronomique : la récupération sur place est plus cohérente qu’une logistique de livraison froide.',
      '## En bref',
      'Des offres utiles, ici, maintenant — pas demain.',
    ],
  },
  'freshrescue-auvergne-rhone-alpes': {
    author: 'David',
    sections: [
      'Dans la région Auvergne-Rhône-Alpes, des Alpes à la plaine, les commerces alimentaires cherchent des solutions simples pour écouler les surplus. FreshRescue propose une carte unifiée sans imposer de livraison.',
      '## Principe',
      'Publier, géolocaliser, récupérer en magasin. Le modèle respecte le rythme du commerçant et celui du client.',
      '## Professionnels',
      'Fromageries, boulangeries, restos de station : réduire la casse quand la clientèle fluctue (saison ski, événements locaux).',
      '## Particuliers',
      'Voir ce qui est disponible près de chez soi ou sur le trajet du retour.',
      '## Région',
      'Relief et dispersion des communes : le filtre distance évite les déplacements absurdes.',
      '## En bref',
      'Anti-gaspi pensé pour des territoires variés, avec une même simplicité d’usage.',
    ],
  },
  'freshrescue-provence-alpes-cote-azur': {
    author: 'David',
    sections: [
      'Sur la Côte d’Azur et en arrière-pays, la saisonnalité pousse les stocks alimentaires. FreshRescue aide commerçants et clients à se rejoindre avant la fermeture du jour.',
      '## Utilisation',
      'Offre flash publiée depuis le téléphone, visible sur la carte ; retrait et paiement en boutique.',
      '## Commerces',
      'Poissonneries, boulangeries, traiteurs de ports ou de centres-villes : valoriser le frais plutôt que le jeter.',
      '## Clients',
      'Prix accessibles, circuit court, transparence sur le lieu de retrait.',
      '## PACA',
      'Tourisme et afflux variables : une vitrine instantanée compense les imprévus de fréquentation.',
      '## En bref',
      'Moins de perte en haute saison, plus de lien local toute l’année.',
    ],
  },
  'freshrescue-bouches-du-rhone-marseille': {
    author: 'David',
    sections: [
      'À Marseille, entre le Vieux-Port, la Plaine et les quartiers nord, les commerces alimentaires jettent encore des invendus chaque soir. FreshRescue les montre sur une carte pour un passage rapide.',
      '## Concrètement',
      'Le commerçant fixe prix et horaire ; le marseillais voit l’offre, passe à la boutique, paie en caisse. Pas de livraison ni de frais cachés.',
      '## Commerçants',
      'Boulangeries, épiceries, restauration : attirer du monde en fin de journée plutôt que de remplir la poubelle.',
      '## Consommateurs',
      'Manger bien sans se ruiner, soutenir le commerce du quartier.',
      '## Marseille',
      'Ville dense, habitudes de marché et de petite épicerie : la récupération à pied ou en bus colle au quotidien.',
      '## En bref',
      'Anti-gaspi de proximité, adapté au rythme marseillais.',
    ],
  },
  'freshrescue-hauts-de-france': {
    author: 'David',
    sections: [
      'Dans les Hauts-de-France, boulangeries et épiceries de centre-bourg connaissent des invendus quand le temps ou l’activité industrielle locale ralentit la rue. FreshRescue les rend visibles en ligne, pour une vente en magasin.',
      '## Mécanisme',
      'Photo, prix flash, heure de retrait — le client vient chercher sur place.',
      '## Commerces',
      'Pâtisseries, friteries, primeurs : une seconde chance pour les produits du jour.',
      '## Familles',
      'Compléter le panier à prix réduit tout en limitant les trajets.',
      '## Territoire',
      'Lien fort avec l’agriculture et les marchés : la carte prolonge cette logique de proximité.',
      '## En bref',
      'Moins de gaspillage, plus de solidarité commerciale locale.',
    ],
  },
  'freshrescue-nord-lille': {
    author: 'David',
    sections: [
      'À Lille et dans le Nord, friteries, boulangeries et épiceries du centre voient des invendus dès que le flux piéton change. FreshRescue alerte les habitants à proximité.',
      '## Comment faire',
      'Publier depuis le smartphone, consulter la carte, récupérer en boutique avant l’heure indiquée.',
      '## Commerçants lillois',
      'Transformer viennoiseries ou plats du jour en vente au lieu de perte sèche.',
      '## Consommateurs',
      'Découvrir des adresses du Vieux-Lille ou de Wazemmes, avec des prix clairs.',
      '## Nord',
      'Culture de convivialité et commerces de proximité : le modèle sans livraison s’y intègre naturellement.',
      '## En bref',
      'Offres locales, utiles, tout de suite.',
    ],
  },
  'freshrescue-commercants': {
    author: 'David',
    sections: [
      'Vous fermez dans deux heures et il reste des baguettes, un plateau traiteur ou des fruits trop mûrs ? Avant de tout jeter, **FreshRescue** vous permet de publier une offre flash en quelques minutes, visible par les habitants dans un rayon que vous maîtrisez.',
      '## Ce que vous publiez',
      'Une photo fidèle, un prix réduit et un créneau de retrait. Pas de catalogue à maintenir : une offre = un produit disponible maintenant.',
      '## Ce que vous ne payez pas (pendant l’essai)',
      'Aucune commission sur la vente réalisée en caisse. L’objectif est de tester si de nouveaux clients passent la porte grâce à la visibilité sur la carte.',
      '## Ce que vous gardez',
      'La relation en magasin, le paiement direct, la liberté d’annuler l’offre si tout est vendu avant l’heure prévue.',
      '## Types de commerces',
      'Boulangeries, épiceries, restaurants, primeurs, traiteurs : dès qu’il y a un surplus alimentaire consommable, FreshRescue peut servir de vitrine locale.',
      '## Pourquoi nous avons conçu ça',
      'Les grandes plateformes prennent des commissions et imposent parfois la livraison. Nous préférons un outil simple qui renforce le commerce de quartier plutôt qu’un intermédiaire opaque.',
      '## Prochaine étape',
      'Créez votre espace commerçant, publiez une première offre en fin de journée et observez qui vient — souvent des voisins qui ne connaissaient pas encore votre enseigne.',
    ],
  },
  'freshrescue-consommateurs': {
    author: 'David',
    sections: [
      'Vous cherchez un plat, des viennoiseries ou des fruits à prix réduit, sans parcourir dix sites différents ? **FreshRescue** regroupe les offres anti-gaspi des commerces autour de vous sur une seule carte.',
      '## Comment trouver une offre',
      'Ouvrez la carte, zoomez sur votre quartier, lisez le prix flash et l’heure limite de retrait. Chaque point correspond à un vrai commerce, pas à un entrepôt anonyme.',
      '## Comment récupérer',
      'Vous vous déplacez en boutique, vous payez sur place comme d’habitude. Pas de compte livraison ni de frais de service cachés sur le panier.',
      '## Pourquoi c’est différent d’une app nationale',
      'Pas de panier mystère : vous voyez la photo réelle et l’adresse exacte. Vous soutenez un commerçant local plutôt qu’une logistique centralisée.',
      '## Bonnes habitudes',
      'Vérifiez l’heure de retrait, prévoyez le trajet (vélo, marche, transport) et arrivez tant que l’offre est encore affichée — le premier arrivé est souvent servi.',
      '## Impact',
      'Moins de nourriture jetée, plus de liens de quartier, un budget courses allégé sur des produits encore excellents.',
      '## Commencer',
      'Consultez la carte depuis l’accueil FreshRescue et repérez ce qui est disponible près de vous ce soir.',
    ],
  },
};

function parseMd(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  return { front: match[1], body: match[2].trim() };
}

function patchFrontmatter(front, author) {
  let next = front.replace(/^author:.*$/m, `author: "${author}"`);
  if (!/^author:/m.test(next)) {
    next = next.replace(/^(date:.*)$/m, `$1\nauthor: "${author}"`);
  }
  next = next.replace(/^region:.*\r?\nregion:/m, 'departments:');
  return next;
}

function bodyToMarkdown(sections) {
  const [intro, ...rest] = sections;
  const h1FromFront = null;
  return [intro, ...rest].join('\n\n');
}

function main() {
  const files = readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  let updated = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const variant = BODIES[slug];
    if (!variant) {
      console.warn(`[humanize-blog] pas de variante pour ${file}`);
      continue;
    }

    const path = join(blogDir, file);
    const raw = readFileSync(path, 'utf8');
    const parsed = parseMd(raw);
    if (!parsed) {
      console.warn(`[humanize-blog] frontmatter invalide: ${file}`);
      continue;
    }

    const titleMatch = parsed.front.match(/^title:\s*"(.*)"/m);
    const h1 = titleMatch ? titleMatch[1] : slug;
    const author = variant.author || 'David';
    const newFront = patchFrontmatter(parsed.front, author);
    const newBody = `# ${h1}\n\n${bodyToMarkdown(variant.sections)}\n`;
    writeFileSync(path, `---\n${newFront}\n---\n\n${newBody}`, 'utf8');
    updated++;
  }

  console.log(`[humanize-blog] ${updated} article(s) mis à jour.`);
}

main();
