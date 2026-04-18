/** Offres démo : 10 annonces par grande ville suisse (CHF, coordonnées dans la boîte CH). */

const hoursFromNow = (hours) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const makeI18nFields = (title, description) => ({
  title_fr: title.fr,
  description_fr: description.fr,
  title_en: title.en,
  description_en: description.en,
  title_de: title.de,
  description_de: description.de,
  title_ru: title.ru,
  description_ru: description.ru,
  title_it: title.it,
  description_it: description.it,
  title: title.fr,
  description: description.fr,
});

/** Une image par type d’offre (alignée titre / catégorie — pas de rotation par index). */
const IMG = {
  bakeryPastries:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
  bakeryBread:
    'https://images.unsplash.com/photo-1509722747051-b6168e6e49e8?auto=format&fit=crop&w=900&q=80',
  dairy:
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=900&q=80',
  prepared:
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
  fruits:
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80',
  vegetables:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
  meat:
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80',
  seafood:
    'https://images.unsplash.com/photo-1519708227418-c5fd843a0aeb?auto=format&fit=crop&w=900&q=80',
  beverages:
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
  chocolate:
    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=80',
};

/** 10 modèles d’offre (titres + descriptions i18n) réutilisés dans chaque ville. */
const OFFER_TEMPLATES = [
  {
    category: 'bakery',
    title: {
      fr: 'Panier viennoiseries du matin',
      en: 'Morning pastry basket',
      de: 'Morgengebäck-Korb',
      ru: 'Утренняя выпечка',
      it: 'Cesto di paste da colazione',
    },
    description: {
      fr: 'Croissants, pains au chocolat et baguette — invendus de fin de matinée.',
      en: 'Croissants, pain au chocolat and baguette — late-morning surplus.',
      de: 'Croissants, Schokoladebrötchen und Baguette — Rest vom Vormittag.',
      ru: 'Круассаны, шоколадные булочки и багет — остаток до полудня.',
      it: 'Cornetti, pain au chocolat e baguette — avanzo di metà mattina.',
    },
    original_price: 26,
    discount_price: 11,
    collect_h: 5,
    expiry_h: 24,
    consumption_mode: 'takeaway',
    needs_cool_bag: false,
    photo: IMG.bakeryPastries,
  },
  {
    category: 'dairy',
    title: {
      fr: 'Plateau fromages & charcuterie',
      en: 'Cheese & cold cuts board',
      de: 'Käse- und Aufschnittplatte',
      ru: 'Сыр и нарезка',
      it: 'Tagliere formaggi e affettati',
    },
    description: {
      fr: 'Sélection locale — portion invendue du comptoir.',
      en: 'Local selection — unsold counter portion.',
      de: 'Regionale Auswahl — Rest vom Tresen.',
      ru: 'Местный выбор — порция с прилавка.',
      it: 'Selezione locale — porzione invenduta del banco.',
    },
    original_price: 38,
    discount_price: 17,
    collect_h: 6,
    expiry_h: 36,
    consumption_mode: 'both',
    needs_cool_bag: true,
    photo: IMG.dairy,
  },
  {
    category: 'prepared',
    title: {
      fr: 'Plat du jour (emporter)',
      en: "Today's special (takeaway)",
      de: 'Tagesgericht zum Mitnehmen',
      ru: 'Блюдо дня навынос',
      it: 'Piatto del giorno da asporto',
    },
    description: {
      fr: 'Cuisine maison — surplus du service midi.',
      en: 'Home-style cooking — lunch service surplus.',
      de: 'Hausmannskost — Rest vom Mittagsservice.',
      ru: 'Домашняя кухня — остаток обеда.',
      it: 'Cucina casalinga — avanzo del pranzo.',
    },
    original_price: 32,
    discount_price: 14,
    collect_h: 4,
    expiry_h: 14,
    consumption_mode: 'takeaway',
    needs_cool_bag: true,
    photo: IMG.prepared,
  },
  {
    category: 'fruits',
    title: {
      fr: 'Caisse fruits de saison',
      en: 'Seasonal fruit box',
      de: 'Saison-Obstkiste',
      ru: 'Ящик сезонных фруктов',
      it: 'Cassetta frutta di stagione',
    },
    description: {
      fr: 'Pommes, poires et baies — lot invendu.',
      en: 'Apples, pears and berries — surplus lot.',
      de: 'Äpfel, Birnen und Beeren — Restlos.',
      ru: 'Яблоки, груши и ягоды — партия-остаток.',
      it: 'Mele, pere e frutti di bosco — lotto invenduto.',
    },
    original_price: 22,
    discount_price: 9,
    collect_h: 5,
    expiry_h: 30,
    consumption_mode: 'takeaway',
    needs_cool_bag: false,
    photo: IMG.fruits,
  },
  {
    category: 'vegetables',
    title: {
      fr: 'Panier légumes bio',
      en: 'Organic veg box',
      de: 'Bio-Gemüsekorb',
      ru: 'Овощной набор',
      it: 'Cassetta verdure bio',
    },
    description: {
      fr: 'Carottes, courgettes et salades — fin de marché.',
      en: 'Carrots, zucchini and greens — end of market day.',
      de: 'Karotten, Zucchini und Salat — Marktrest.',
      ru: 'Морковь, кабачки и зелень — конец рынка.',
      it: 'Carote, zucchine e insalate — fine mercato.',
    },
    original_price: 20,
    discount_price: 8,
    collect_h: 5,
    expiry_h: 20,
    consumption_mode: 'takeaway',
    needs_cool_bag: false,
    photo: IMG.vegetables,
  },
  {
    category: 'meat',
    title: {
      fr: 'Assiette viande grillée',
      en: 'Grilled meat platter',
      de: 'Gegrillte Fleischplatte',
      ru: 'Мясное ассорти',
      it: 'Tagliata di carne',
    },
    description: {
      fr: 'Poulet et saucisses — reste de service du soir.',
      en: 'Chicken and sausages — evening service surplus.',
      de: 'Hähnchen und Würste — Abendrest.',
      ru: 'Курица и колбаски — остаток вечерней смены.',
      it: 'Pollo e salsicce — avanzo serale.',
    },
    original_price: 34,
    discount_price: 15,
    collect_h: 5,
    expiry_h: 18,
    consumption_mode: 'both',
    needs_cool_bag: true,
    photo: IMG.meat,
  },
  {
    category: 'seafood',
    title: {
      fr: 'Plateau poisson fumé',
      en: 'Smoked fish platter',
      de: 'Geräucherte Fischplatte',
      ru: 'Копчёная рыба',
      it: 'Pesce affumicato',
    },
    description: {
      fr: 'Truite et saumon — à consommer rapidement.',
      en: 'Trout and salmon — eat soon.',
      de: 'Forelle und Lachs — bald verzehren.',
      ru: 'Форель и лосось — съесть скоро.',
      it: 'Trota e salmone — consumare presto.',
    },
    original_price: 40,
    discount_price: 18,
    collect_h: 4,
    expiry_h: 12,
    consumption_mode: 'takeaway',
    needs_cool_bag: true,
    photo: IMG.seafood,
  },
  {
    category: 'beverages',
    title: {
      fr: 'Lot jus pressés & thés glacés',
      en: 'Cold-pressed juices & iced tea',
      de: 'Frisch gepresste Säfte & Eistee',
      ru: 'Соки и холодный чай',
      it: 'Succhi spremuti e tè freddi',
    },
    description: {
      fr: 'Bouteilles invendues en fin de journée.',
      en: 'Unsold bottles from end of day.',
      de: 'Unverkaufte Flaschen vom Tagesende.',
      ru: 'Непроданные бутылки к концу дня.',
      it: 'Bottiglie invendute a fine giornata.',
    },
    original_price: 18,
    discount_price: 7,
    collect_h: 6,
    expiry_h: 48,
    consumption_mode: 'takeaway',
    needs_cool_bag: false,
    photo: IMG.beverages,
  },
  {
    category: 'other',
    title: {
      fr: 'Chocolats & confiseries artisanales',
      en: 'Artisan chocolates & sweets',
      de: 'Handgemachte Pralinen',
      ru: 'Шоколад и сладости',
      it: 'Cioccolatini artigianali',
    },
    description: {
      fr: 'Assortiment invendu du week-end.',
      en: 'Weekend surplus assortment.',
      de: 'Wochenend-Restsortiment.',
      ru: 'Ассорти выходного дня.',
      it: 'Assortimento avanzo weekend.',
    },
    original_price: 30,
    discount_price: 13,
    collect_h: 7,
    expiry_h: 72,
    consumption_mode: 'takeaway',
    needs_cool_bag: false,
    photo: IMG.chocolate,
  },
  {
    category: 'bakery',
    title: {
      fr: 'Pain artisan & sandwichs',
      en: 'Artisan bread & sandwiches',
      de: 'Handwerksbrot & Sandwiches',
      ru: 'Хлеб и сэндвичи',
      it: 'Pane artigianale e panini',
    },
    description: {
      fr: 'Préparés ce matin — invendus après 15h.',
      en: 'Made this morning — surplus after 3pm.',
      de: 'Heute Morgen gebacken — Rest nach 15 Uhr.',
      ru: 'С утра — остаток после 15:00.',
      it: 'Preparati stamattina — avanzo dopo le 15.',
    },
    original_price: 24,
    discount_price: 10,
    collect_h: 5,
    expiry_h: 16,
    consumption_mode: 'takeaway',
    needs_cool_bag: false,
    photo: IMG.bakeryBread,
  },
];

const SWISS_CITIES = [
  { slug: 'zurich', center: [47.3769, 8.5417], street: 'Limmatquai', num: (i) => 12 + i * 7, zip: '8001', name: 'Zürich' },
  { slug: 'geneve', center: [46.2044, 6.1432], street: 'Rue du Rhône', num: (i) => 18 + i * 5, zip: '1204', name: 'Genève' },
  { slug: 'basel', center: [47.5596, 7.5886], street: 'Freie Strasse', num: (i) => 20 + i * 4, zip: '4051', name: 'Basel' },
  { slug: 'lausanne', center: [46.5197, 6.6323], street: 'Rue de Bourg', num: (i) => 10 + i * 6, zip: '1003', name: 'Lausanne' },
  { slug: 'bern', center: [46.948, 7.4474], street: 'Kramgasse', num: (i) => 22 + i * 3, zip: '3011', name: 'Bern' },
  { slug: 'winterthur', center: [47.4979, 8.7248], street: 'Marktgasse', num: (i) => 5 + i * 8, zip: '8400', name: 'Winterthur' },
  { slug: 'luzern', center: [47.0502, 8.3093], street: 'Pilatusstrasse', num: (i) => 1 + i * 9, zip: '6003', name: 'Luzern' },
  { slug: 'stgallen', center: [47.4245, 9.3744], street: 'Marktplatz', num: (i) => 3 + i * 5, zip: '9000', name: 'St. Gallen' },
  { slug: 'lugano', center: [46.0037, 8.9511], street: 'Via Nassa', num: (i) => 4 + i * 3, zip: '6900', name: 'Lugano' },
  { slug: 'biel', center: [47.1362, 7.2467], street: 'Rue Centrale', num: (i) => 12 + i * 7, zip: '2502', name: 'Biel/Bienne' },
];

/** Décalage déterministe pour espacer les marqueurs sur la carte. */
function offsetLatLng(slug, index) {
  const seed = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const dLat = (((seed + index * 17) % 47) / 1800) - 0.012;
  const dLng = (((seed + index * 31) % 53) / 1600) - 0.015;
  return [dLat, dLng];
}

function buildOffers() {
  const list = [];
  for (const city of SWISS_CITIES) {
    const [baseLat, baseLng] = city.center;
    OFFER_TEMPLATES.forEach((tpl, i) => {
      const [dLat, dLng] = offsetLatLng(city.slug, i);
      const lat = Math.round((baseLat + dLat) * 1e6) / 1e6;
      const lng = Math.round((baseLng + dLng) * 1e6) / 1e6;
      const streetNo = city.num(i);
      list.push({
        ...makeI18nFields(tpl.title, tpl.description),
        id: `mock-ch-${city.slug}-${i + 1}`,
        is_demo: true,
        original_price: tpl.original_price + (i % 3) * 2,
        discount_price: tpl.discount_price + (i % 3),
        collect_before: hoursFromNow(tpl.collect_h + (i % 4)),
        expiry_date: hoursFromNow(tpl.expiry_h + i * 2),
        category: tpl.category,
        is_active: true,
        shop_name: `FreshRescue ${city.name}`,
        shop_address: `${city.street} ${streetNo}, ${city.zip} ${city.name}`,
        lat,
        lng,
        consumption_mode: tpl.consumption_mode,
        needs_cool_bag: tpl.needs_cool_bag,
        photo: tpl.photo,
      });
    });
  }
  return list;
}

export const MOCK_OFFERS = buildOffers();
