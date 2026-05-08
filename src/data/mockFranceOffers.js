/**
 * Offres démo France — 2 annonces par grande/moyenne ville.
 *
 * Reprend la même structure que `mockSwissOffers.js` (templates communs,
 * helper de coordonnées) afin que la carte / la liste / la SafeOfferImage
 * fonctionnent à l'identique. Données affichées avec la devise locale (€).
 *
 * Stratégie d'attribution des templates :
 *   - 2 templates par ville, désynchronisés cycliquement pour varier les
 *     catégories et les photos d'une ville à l'autre.
 *   - Décalage spatial déterministe (offsetLatLng) pour que les 2 marqueurs
 *     ne se superposent pas sur la carte.
 */

import {
  OFFER_TEMPLATES,
  hoursFromNow,
  makeI18nFields,
  offsetLatLng,
} from './mockSwissOffers';

/**
 * Liste des villes (≥ ~60k habitants) avec coordonnées du centre, rue
 * commerçante représentative et code postal central. Triée par taille
 * décroissante pour faciliter les ajouts ultérieurs.
 */
const FRANCE_CITIES = [
  // Grandes villes (≥ 150k hab)
  { slug: 'paris', center: [48.8566, 2.3522], street: 'Rue de Rivoli', zip: '75001', name: 'Paris' },
  { slug: 'marseille', center: [43.2965, 5.3698], street: 'La Canebière', zip: '13001', name: 'Marseille' },
  { slug: 'lyon', center: [45.7640, 4.8357], street: 'Place Bellecour', zip: '69002', name: 'Lyon' },
  { slug: 'toulouse', center: [43.6047, 1.4442], street: "Rue d'Alsace-Lorraine", zip: '31000', name: 'Toulouse' },
  { slug: 'nice', center: [43.7102, 7.2620], street: 'Avenue Jean Médecin', zip: '06000', name: 'Nice' },
  { slug: 'nantes', center: [47.2184, -1.5536], street: 'Rue Crébillon', zip: '44000', name: 'Nantes' },
  { slug: 'montpellier', center: [43.6108, 3.8767], street: 'Rue de la Loge', zip: '34000', name: 'Montpellier' },
  { slug: 'strasbourg', center: [48.5734, 7.7521], street: 'Rue des Grandes Arcades', zip: '67000', name: 'Strasbourg' },
  { slug: 'bordeaux', center: [44.8378, -0.5792], street: 'Rue Sainte-Catherine', zip: '33000', name: 'Bordeaux' },
  { slug: 'lille', center: [50.6292, 3.0573], street: 'Rue de Béthune', zip: '59000', name: 'Lille' },
  { slug: 'rennes', center: [48.1173, -1.6778], street: 'Rue Le Bastard', zip: '35000', name: 'Rennes' },
  { slug: 'reims', center: [49.2583, 4.0317], street: "Place d'Erlon", zip: '51100', name: 'Reims' },
  { slug: 'le-havre', center: [49.4944, 0.1079], street: 'Avenue Foch', zip: '76600', name: 'Le Havre' },
  { slug: 'saint-etienne', center: [45.4397, 4.3872], street: 'Rue des Martyrs de Vingré', zip: '42000', name: 'Saint-Étienne' },
  { slug: 'toulon', center: [43.1242, 5.9280], street: 'Rue Hoche', zip: '83000', name: 'Toulon' },
  { slug: 'grenoble', center: [45.1885, 5.7245], street: 'Rue Félix Poulat', zip: '38000', name: 'Grenoble' },
  { slug: 'dijon', center: [47.3220, 5.0415], street: 'Rue de la Liberté', zip: '21000', name: 'Dijon' },
  { slug: 'angers', center: [47.4784, -0.5632], street: 'Rue Lenepveu', zip: '49000', name: 'Angers' },
  { slug: 'nimes', center: [43.8367, 4.3601], street: 'Boulevard Victor Hugo', zip: '30000', name: 'Nîmes' },
  { slug: 'villeurbanne', center: [45.7665, 4.8795], street: 'Cours Émile Zola', zip: '69100', name: 'Villeurbanne' },
  { slug: 'clermont-ferrand', center: [45.7772, 3.0870], street: 'Rue des Gras', zip: '63000', name: 'Clermont-Ferrand' },

  // Villes moyennes (60k – 150k hab)
  { slug: 'aix-en-provence', center: [43.5297, 5.4474], street: 'Cours Mirabeau', zip: '13100', name: 'Aix-en-Provence' },
  { slug: 'le-mans', center: [47.9960, 0.1996], street: 'Rue Bolton', zip: '72000', name: 'Le Mans' },
  { slug: 'brest', center: [48.3904, -4.4861], street: 'Rue de Siam', zip: '29200', name: 'Brest' },
  { slug: 'tours', center: [47.3941, 0.6848], street: 'Rue Nationale', zip: '37000', name: 'Tours' },
  { slug: 'amiens', center: [49.8941, 2.2957], street: 'Rue des Trois Cailloux', zip: '80000', name: 'Amiens' },
  { slug: 'limoges', center: [45.8336, 1.2611], street: 'Avenue Garibaldi', zip: '87000', name: 'Limoges' },
  { slug: 'annecy', center: [45.8992, 6.1294], street: 'Rue Royale', zip: '74000', name: 'Annecy' },
  { slug: 'perpignan', center: [42.6886, 2.8949], street: 'Place Arago', zip: '66000', name: 'Perpignan' },
  { slug: 'metz', center: [49.1193, 6.1757], street: 'Rue Serpenoise', zip: '57000', name: 'Metz' },
  { slug: 'besancon', center: [47.2378, 6.0241], street: 'Grande Rue', zip: '25000', name: 'Besançon' },
  { slug: 'orleans', center: [47.9029, 1.9039], street: 'Rue de la République', zip: '45000', name: 'Orléans' },
  { slug: 'mulhouse', center: [47.7508, 7.3359], street: 'Rue du Sauvage', zip: '68100', name: 'Mulhouse' },
  { slug: 'rouen', center: [49.4432, 1.0993], street: 'Rue du Gros-Horloge', zip: '76000', name: 'Rouen' },
  { slug: 'caen', center: [49.1829, -0.3707], street: 'Rue Saint-Pierre', zip: '14000', name: 'Caen' },
  { slug: 'nancy', center: [48.6921, 6.1844], street: 'Place Stanislas', zip: '54000', name: 'Nancy' },
  { slug: 'avignon', center: [43.9493, 4.8055], street: 'Rue de la République', zip: '84000', name: 'Avignon' },
  { slug: 'poitiers', center: [46.5802, 0.3404], street: 'Rue des Cordeliers', zip: '86000', name: 'Poitiers' },
  { slug: 'versailles', center: [48.8049, 2.1204], street: 'Avenue de Saint-Cloud', zip: '78000', name: 'Versailles' },
  { slug: 'la-rochelle', center: [46.1591, -1.1517], street: 'Rue du Palais', zip: '17000', name: 'La Rochelle' },
  { slug: 'pau', center: [43.2951, -0.3708], street: 'Rue Maréchal Joffre', zip: '64000', name: 'Pau' },
  { slug: 'cannes', center: [43.5528, 7.0174], street: "Rue d'Antibes", zip: '06400', name: 'Cannes' },
  { slug: 'saint-nazaire', center: [47.2735, -2.2138], street: 'Avenue Léon Blum', zip: '44600', name: 'Saint-Nazaire' },
  { slug: 'antibes', center: [43.5805, 7.1252], street: 'Rue de la République', zip: '06600', name: 'Antibes' },
  { slug: 'ajaccio', center: [41.9192, 8.7386], street: 'Cours Napoléon', zip: '20000', name: 'Ajaccio' },
  { slug: 'valence', center: [44.9333, 4.8924], street: 'Boulevard Bancel', zip: '26000', name: 'Valence' },
  { slug: 'quimper', center: [47.9960, -4.0978], street: 'Rue Kéréon', zip: '29000', name: 'Quimper' },
  { slug: 'cherbourg', center: [49.6386, -1.6164], street: 'Rue de la Paix', zip: '50100', name: 'Cherbourg-en-Cotentin' },
  { slug: 'beziers', center: [43.3447, 3.2197], street: 'Rue de la République', zip: '34500', name: 'Béziers' },
  { slug: 'calais', center: [50.9513, 1.8587], street: 'Boulevard Jacquard', zip: '62100', name: 'Calais' },
];

/** Numérotation déterministe par template, pour rendre les adresses crédibles. */
function streetNumber(citySlug, templateIndex) {
  const seed = citySlug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 2 + ((seed + templateIndex * 11) % 96);
}

/** 2 templates distincts par ville (catégories différentes). */
function pickTwoTemplates(cityIndex) {
  const len = OFFER_TEMPLATES.length;
  const a = cityIndex % len;
  const b = (cityIndex + 4) % len;
  return [OFFER_TEMPLATES[a], a === b ? OFFER_TEMPLATES[(b + 1) % len] : OFFER_TEMPLATES[b]];
}

/** Suffixe de point de vente pour distinguer les 2 annonces de la même ville. */
const SHOP_SUFFIXES = ['Centre', 'Marché'];

function buildOffers() {
  const list = [];
  FRANCE_CITIES.forEach((city, cityIndex) => {
    const [baseLat, baseLng] = city.center;
    const templates = pickTwoTemplates(cityIndex);
    templates.forEach((tpl, slot) => {
      const [dLat, dLng] = offsetLatLng(city.slug, slot * 5 + 1);
      const lat = Math.round((baseLat + dLat) * 1e6) / 1e6;
      const lng = Math.round((baseLng + dLng) * 1e6) / 1e6;
      const num = streetNumber(city.slug, slot);
      list.push({
        ...makeI18nFields(tpl.title, tpl.description),
        id: `mock-fr-${city.slug}-${slot + 1}`,
        is_demo: true,
        original_price: tpl.original_price + (slot % 3) * 2,
        discount_price: tpl.discount_price + (slot % 3),
        collect_before: hoursFromNow(tpl.collect_h + (slot % 4)),
        expiry_date: hoursFromNow(tpl.expiry_h + slot * 2),
        category: tpl.category,
        is_active: true,
        shop_name: `FreshRescue ${city.name} ${SHOP_SUFFIXES[slot] || ''}`.trim(),
        shop_address: `${city.street} ${num}, ${city.zip} ${city.name}`,
        lat,
        lng,
        consumption_mode: tpl.consumption_mode,
        needs_cool_bag: tpl.needs_cool_bag,
        photo: tpl.photo,
      });
    });
  });
  return list;
}

export const MOCK_FRANCE_OFFERS = buildOffers();
