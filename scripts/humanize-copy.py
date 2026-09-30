# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent if False else Path('.')

fixes = {
    'Controllo totale. disattiva quando vuoi': 'Controllo totale: disattiva quando vuoi',
    'Full control. deactivate anytime': 'Full control: deactivate anytime',
    'Contrôle total. désactivez à tout moment': 'Contrôle total: désactivez à tout moment',
    'Volle Kontrolle. jederzeit deaktivierbar': 'Volle Kontrolle: jederzeit deaktivierbar',
    'Полный контроль. отключайте в любое время': 'Полный контроль: отключайте в любое время',
    '≤ 30 km intorno a te. zoom e sposta la mappa': '≤ 30 km intorno a te. Zoom e sposta la mappa',
    '≤ 30 km around you. zoom & pan the map': '≤ 30 km around you. Zoom and pan the map',
    '≤ 30 km autour de vous. zoomez et déplacez la carte': '≤ 30 km autour de vous. Zoomez et déplacez la carte',
    '≤ 30 km um Sie. zoomen und Karte verschieben': '≤ 30 km um Sie. Zoomen und Karte verschieben',
    '≤ 5 км вокруг вас. масштаб и перемещение карты': '≤ 5 км вокруг вас. Масштаб и перемещение карты',
    'Anti-food waste locally. turning surplus into opportunity.': 'Anti-food waste locally: surplus becomes opportunity.',
    'Local players FreshRescue works with. short supply chains and responsible dining.': 'Sites and people we team up with around local food.',
    'Против пищевых отходов в Швейцарии. излишки в возможности.': 'Против пищевых отходов: излишки становятся возможностями.',
    "Snap surplus food, set a flash price and pickup time. less waste, more value for customers nearby.": "Snap surplus food, set a flash price and a pickup time. Less waste, more value for customers nearby.",
    "Fotografieren Sie Überschüsse, setzen Sie Blitzpreis und Abholzeit. weniger Waste, mehr Wert für lokale Kundinnen.": "Fotografieren Sie Überschüsse, setzen Sie Blitzpreis und Abholzeit. Weniger Waste, mehr Wert für lokale Kundinnen.",
}

partner = {
    'it': "Restaurants des Chefs è un annuario di chef privati, caterer, tavole Top Chef e ristoranti stellati in Francia. Cerchi una città o un nome, poi contatti. Collaboriamo perché entrambi puntiamo sul cibo locale.",
    'en': "Restaurants des Chefs is a directory of private chefs, caterers, Top Chef tables and starred restaurants in France. Search a city or a name, then get in touch. We work with them because we both care about local food.",
    'fr': "Restaurants des Chefs, c'est un annuaire de chefs privés, traiteurs, tables Top Chef et restos étoilés en France. On y cherche une ville ou un nom, puis on contacte directement. On collabore avec eux parce qu'on parle tous les deux de proximité et de bonne cuisine.",
    'de': "Restaurants des Chefs ist ein Verzeichnis für Privatköche, Caterer, Top-Chef-Tische und Sternerestaurants in Frankreich. Stadt oder Name suchen, dann kontaktieren. Wir arbeiten zusammen, weil lokale Küche uns beiden wichtig ist.",
    'ru': "Restaurants des Chefs: каталог частных шефов, кейтеринга, ресторанов Top Chef и заведений со звёздами во Франции. Ищете город или имя, потом пишете. Работаем вместе: и им, и нам важна еда рядом с домом.",
}

sub = {
    'fr': 'Des sites et des gens avec qui on avance, côté cuisine locale.',
    'en': 'Sites and people we team up with around local food.',
    'it': 'Siti e persone con cui collaboriamo sul cibo locale.',
    'de': 'Seiten und Leute, mit denen wir bei lokaler Küche zusammenarbeiten.',
    'ru': 'Сайты и люди, с которыми мы работаем вокруг местной еды.',
}

i18n_path = Path('src/lib/i18n.js')
i18n = i18n_path.read_text(encoding='utf-8')
for a, b in fixes.items():
    i18n = i18n.replace(a, b)

# Replace each partnerRestaurantsDesChefsDesc string (first occurrence after each lang block is sequential)
for lang, text in partner.items():
    # Replace whatever is currently between partnerRestaurantsDesChefsDesc: " ... ",
    # one at a time by finding the key and next partnerReadNews
    pass

# Count occurrences of key
parts = i18n.split('partnerRestaurantsDesChefsDesc:')
if len(parts) != 6:
    print('unexpected desc count', len(parts) - 1)
else:
    out = [parts[0]]
    for i, chunk in enumerate(parts[1:]):
        lang_order = ['it', 'en', 'fr', 'de', 'ru'][i]
        # replace first quoted string in chunk
        new_chunk, n = re.subn(
            r'\s*\n\s*"[^"]*"',
            '\n      "' + partner[lang_order].replace('\\', '\\\\').replace('"', '\\"') + '"',
            chunk,
            count=1,
        )
        print('desc', lang_order, 'n=', n)
        out.append(new_chunk)
    i18n = 'partnerRestaurantsDesChefsDesc:'.join(out)

# Subtitles: replace existing partnersPageSubtitle values
i18n = re.sub(
    r'partnersPageSubtitle: "[^"]*"',
    lambda m, it=iter(sub.values()): f'partnersPageSubtitle: "{next(it)}"',
    i18n,
    count=5,
)
# Wait order of langs in file is it, en, fr, de, ru - and sub dict order in py3.7+ is insertion order
# But I used sub.values() with fr,en,it,de,ru - WRONG order. Fix:
sub_ordered = [sub['it'], sub['en'], sub['fr'], sub['de'], sub['ru']]
# Re-read and do properly
i18n = i18n_path.read_text(encoding='utf-8')
for a, b in fixes.items():
    i18n = i18n.replace(a, b)

parts = i18n.split('partnerRestaurantsDesChefsDesc:')
out = [parts[0]]
lang_order = ['it', 'en', 'fr', 'de', 'ru']
for i, chunk in enumerate(parts[1:]):
    lang = lang_order[i]
    new_chunk, n = re.subn(
        r'\s*\n\s*"[^"]*"',
        '\n      "' + partner[lang].replace('\\', '\\\\').replace('"', '\\"') + '"',
        chunk,
        count=1,
    )
    print('desc', lang, 'n=', n)
    out.append(new_chunk)
i18n = 'partnerRestaurantsDesChefsDesc:'.join(out)

idx = 0
def repl_sub(m):
    global idx
    val = sub_ordered[idx]
    idx += 1
    return f'partnersPageSubtitle: "{val}"'

i18n = re.sub(r'partnersPageSubtitle: "[^"]*"', repl_sub, i18n, count=5)
i18n_path.write_text(i18n, encoding='utf-8', newline='\n')
print('i18n ok')

# Mock offers: '. lowercase' -> ': lowercase'
mock_path = Path('src/data/mockSwissOffers.js')
mock = mock_path.read_text(encoding='utf-8')
mock = re.sub(r"\. ([a-zàâäéèêëïîôùûüç])", lambda m: ': ' + m.group(1), mock)
mock_path.write_text(mock, encoding='utf-8', newline='\n')
print('mock ok')

# Rewrite news partnership article (human)
news = r'''/**
 * Actualités FreshRescue (fr, en, it, de, ru).
 */
export const NEWS_ITEMS = [
  {
    id: 'partenariat-restaurants-des-chefs',
    date: '2026-09-30',
    title: {
      fr: 'On s’associe à Restaurants des Chefs',
      en: 'We’re teaming up with Restaurants des Chefs',
      it: 'Collaboriamo con Restaurants des Chefs',
      de: 'Wir arbeiten mit Restaurants des Chefs zusammen',
      ru: 'Мы начинаем сотрудничество с Restaurants des Chefs',
    },
    excerpt: {
      fr: 'FreshRescue et restaurantsdeschefs.fr se donnent un coup de main: eux pour trouver un chef ou une table, nous pour les invendus près de chez vous.',
      en: 'FreshRescue and restaurantsdeschefs.fr are helping each other out: they help you find a chef or a restaurant, we help with surplus food nearby.',
      it: 'FreshRescue e restaurantsdeschefs.fr si danno una mano: loro per trovare uno chef o un tavolo, noi per gli invenduti vicino a te.',
      de: 'FreshRescue und restaurantsdeschefs.fr helfen einander: sie bei der Suche nach Koch oder Restaurant, wir bei Überschüssen in der Nähe.',
      ru: 'FreshRescue и restaurantsdeschefs.fr помогают друг другу: они : найти шефа или ресторан, мы : спасти непроданные продукты рядом.',
    },
    contentHtml: {
      fr: `<p>Petite news: on travaille désormais avec <strong><a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">Restaurants des Chefs</a></strong> (<a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a>).</p>
<p>Leur site liste des chefs privés, des traiteurs, des tables Top Chef et des restos étoilés en France. Tu cherches une ville ou un nom, tu ouvres la fiche, tu contactes. Simple.</p>
<p>De notre côté, FreshRescue sert à écouler les invendus du coin. Eux parlent cuisine et restos, nous parlons paniers du soir et anti-gaspi. Ça se croise bien.</p>
<p>Concrètement, tu trouveras leur logo en bas de notre page d’accueil, une page Partenaires, et ce petit article. Et un lien vers leur annuaire si tu veux peaufiner un repas ou trouver un chef.</p>
<p>Le site: <a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a></p>`,
      en: `<p>Quick update: we’re now working with <strong><a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">Restaurants des Chefs</a></strong> (<a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a>).</p>
<p>Their site lists private chefs, caterers, Top Chef tables and starred restaurants in France. Search a city or a name, open the page, get in touch.</p>
<p>FreshRescue is about surplus food nearby. They’re about chefs and restaurants. Same idea of local food, different angle.</p>
<p>You’ll see their logo on our home page, a Partners page, and this note. Plus a link to their directory if you need a chef or a table.</p>
<p>Here it is: <a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a></p>`,
      it: `<p>Novità: collaboriamo con <strong><a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">Restaurants des Chefs</a></strong> (<a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a>).</p>
<p>Il loro sito elenca chef privati, caterer, tavole Top Chef e ristoranti stellati in Francia. Cerchi città o nome, apri la scheda, contatti.</p>
<p>FreshRescue serve a salvare gli invenduti vicini. Loro parlano di cucina e ristoranti. Stessa idea di cibo locale, angolo diverso.</p>
<p>Troverai il loro logo in home, una pagina Partner e questo articolo, con il link all’annuario.</p>
<p>Il sito: <a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a></p>`,
      de: `<p>Kurzes Update: Wir arbeiten jetzt mit <strong><a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">Restaurants des Chefs</a></strong> (<a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a>) zusammen.</p>
<p>Auf ihrer Seite findest du Privatköche, Caterer, Top-Chef-Tische und Sternerestaurants in Frankreich. Stadt oder Name suchen, Profil öffnen, Kontakt aufnehmen.</p>
<p>FreshRescue rettet Überschüsse in der Nähe. Sie zeigen Köche und Restaurants. Beides lokal, nur anders herum.</p>
<p>Ihr Logo steht auf unserer Startseite, dazu eine Partner-Seite und dieser Text, mit Link zum Verzeichnis.</p>
<p>Hier entlang: <a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a></p>`,
      ru: `<p>Коротко: мы теперь вместе с <strong><a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">Restaurants des Chefs</a></strong> (<a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a>).</p>
<p>У них каталог частных шефов, кейтеринга, ресторанов Top Chef и заведений со звёздами во Франции. Ищете город или имя, открываете карточку, пишете.</p>
<p>FreshRescue про непроданные продукты рядом. Они про шефов и рестораны. Одна тема (еда рядом), разный угол.</p>
<p>Их логотип на главной, страница «Партнёры» и эта заметка, со ссылкой на каталог.</p>
<p>Сайт: <a href="https://restaurantsdeschefs.fr" target="_blank" rel="noopener noreferrer">restaurantsdeschefs.fr</a></p>`,
    },
  },
'''

# Keep the rest of newsItems after first item
old_news = Path('src/data/newsItems.js').read_text(encoding='utf-8')
# Find platform-launch start
marker = "  {\n    id: 'platform-launch',"
pos = old_news.find(marker)
if pos < 0:
    raise SystemExit('platform-launch not found')
rest = old_news[pos:]
# Fix em dashes left in rest excerpts
rest = rest.replace('\u2014', '-')
rest = re.sub(r'\. ([a-z])', lambda m: ', ' + m.group(1), rest)
Path('src/data/newsItems.js').write_text(news + rest, encoding='utf-8', newline='\n')
print('news ok')

# Fix RU excerpt if it still has em dash from my template - I used "они : найти" - fix
n = Path('src/data/newsItems.js').read_text(encoding='utf-8')
n = n.replace('они : найти', 'они помогают найти')
n = n.replace('мы : спасти', 'мы помогаем спасти')
# Remove any remaining em dashes in user content files
for p in [
    Path('src/lib/i18n.js'),
    Path('src/data/newsItems.js'),
    Path('src/data/mockSwissOffers.js'),
    Path('src/lib/seoConfig.js'),
    Path('src/pages/Landing.jsx'),
    Path('src/pages/Blog.jsx'),
    Path('src/pages/BlogArticle.jsx'),
    Path('src/components/landing/HeroSection.jsx'),
] + list(Path('blog').glob('*.md')):
    t = p.read_text(encoding='utf-8')
    if '\u2014' in t:
        t2 = t.replace('\u2014', '-')
        p.write_text(t2, encoding='utf-8', newline='\n')
        print('cleared emdash', p)

print('remaining emdash in src jsx:', sum(
    1 for p in Path('src').rglob('*')
    if p.suffix in {'.js', '.jsx'} and '\u2014' in p.read_text(encoding='utf-8', errors='ignore')
))

