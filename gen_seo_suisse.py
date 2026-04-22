"""
gen_seo_suisse.py
-----------------
Generateur d'articles SEO multilingues pour FreshRescue.app.

Pour chaque canton suisse, le script produit un fichier Markdown dans la
langue officielle dominante du canton (francais, allemand ou italien) :

  - 19 cantons alemaniques -> article en allemand
  -  6 cantons romands     -> article en francais
  -  1 canton italophone   -> article en italien

Chaque article fait environ 900-1100 mots et explique comment l'application
FreshRescue.app aide a reduire le gaspillage alimentaire en reliant
commercants et consommateurs dans un rayon de 5 km.

Usage :
    python gen_seo_suisse.py
"""

from __future__ import annotations

import os
import re
import unicodedata
from dataclasses import dataclass
from datetime import date
from pathlib import Path


# ---------------------------------------------------------------------------
# Donnees : 26 cantons suisses avec langue locale et noms natifs
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Canton:
    nom_local: str          # Nom dans la langue locale (Zurich -> "Zürich")
    nom_fr: str             # Nom en francais (pour reference / sorting)
    villes: tuple[str, ...] # Villes dans la langue locale
    region: str             # Region dans la langue locale
    lang: str               # "fr", "de" ou "it"


CANTONS: list[Canton] = [
    # --- Suisse alemanique (DE) - 19 cantons ---
    Canton("Zürich", "Zurich", ("Zürich", "Winterthur", "Uster"), "Deutschschweiz", "de"),
    Canton("Bern", "Berne", ("Bern", "Biel", "Thun"), "Deutschschweiz", "de"),
    Canton("Luzern", "Lucerne", ("Luzern", "Emmen", "Kriens"), "Zentralschweiz", "de"),
    Canton("Uri", "Uri", ("Altdorf", "Schattdorf", "Bürglen"), "Zentralschweiz", "de"),
    Canton("Schwyz", "Schwytz", ("Schwyz", "Einsiedeln", "Freienbach"), "Zentralschweiz", "de"),
    Canton("Obwalden", "Obwald", ("Sarnen", "Kerns", "Alpnach"), "Zentralschweiz", "de"),
    Canton("Nidwalden", "Nidwald", ("Stans", "Hergiswil", "Buochs"), "Zentralschweiz", "de"),
    Canton("Glarus", "Glaris", ("Glarus", "Näfels", "Schwanden"), "Ostschweiz", "de"),
    Canton("Zug", "Zoug", ("Zug", "Baar", "Cham"), "Zentralschweiz", "de"),
    Canton("Solothurn", "Soleure", ("Solothurn", "Olten", "Grenchen"), "Deutschschweiz", "de"),
    Canton("Basel-Stadt", "Bâle-Ville", ("Basel", "Riehen", "Bettingen"), "Deutschschweiz", "de"),
    Canton("Basel-Landschaft", "Bâle-Campagne", ("Liestal", "Allschwil", "Reinach"), "Deutschschweiz", "de"),
    Canton("Schaffhausen", "Schaffhouse", ("Schaffhausen", "Neuhausen am Rheinfall", "Thayngen"), "Deutschschweiz", "de"),
    Canton("Appenzell Ausserrhoden", "Appenzell Rhodes-Extérieures", ("Herisau", "Teufen", "Speicher"), "Ostschweiz", "de"),
    Canton("Appenzell Innerrhoden", "Appenzell Rhodes-Intérieures", ("Appenzell", "Oberegg", "Gonten"), "Ostschweiz", "de"),
    Canton("St. Gallen", "Saint-Gall", ("St. Gallen", "Rapperswil-Jona", "Wil"), "Ostschweiz", "de"),
    Canton("Graubünden", "Grisons", ("Chur", "Davos", "St. Moritz"), "Ostschweiz", "de"),
    Canton("Aargau", "Argovie", ("Aarau", "Baden", "Wettingen"), "Deutschschweiz", "de"),
    Canton("Thurgau", "Thurgovie", ("Frauenfeld", "Kreuzlingen", "Arbon"), "Ostschweiz", "de"),

    # --- Suisse italienne (IT) - 1 canton ---
    Canton("Ticino", "Tessin", ("Bellinzona", "Lugano", "Locarno"), "Svizzera italiana", "it"),

    # --- Suisse romande (FR) - 6 cantons ---
    Canton("Fribourg", "Fribourg", ("Fribourg", "Bulle", "Villars-sur-Glâne"), "Suisse romande", "fr"),
    Canton("Vaud", "Vaud", ("Lausanne", "Yverdon-les-Bains", "Montreux"), "Suisse romande", "fr"),
    Canton("Valais", "Valais", ("Sion", "Martigny", "Sierre"), "Suisse romande", "fr"),
    Canton("Neuchâtel", "Neuchâtel", ("Neuchâtel", "La Chaux-de-Fonds", "Le Locle"), "Suisse romande", "fr"),
    Canton("Genève", "Genève", ("Genève", "Vernier", "Lancy"), "Suisse romande", "fr"),
    Canton("Jura", "Jura", ("Delémont", "Porrentruy", "Saignelégier"), "Suisse romande", "fr"),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(value: str) -> str:
    """Transforme un nom en slug utilisable comme nom de fichier/URL."""
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value


def _join_list(items: tuple[str, ...], lang: str) -> str:
    """Joint une liste avec le bon mot de liaison selon la langue."""
    if len(items) == 1:
        return items[0]
    conjunctions = {"fr": "et", "de": "und", "it": "e"}
    conj = conjunctions.get(lang, "et")
    return ", ".join(items[:-1]) + f" {conj} " + items[-1]


# ---------------------------------------------------------------------------
# Template FRANCAIS
# ---------------------------------------------------------------------------

def _article_fr(canton: Canton) -> str:
    villes_txt = _join_list(canton.villes, "fr")
    ville_principale = canton.villes[0]
    aujourdhui = date.today().isoformat()
    slug = f"freshrescue-{slugify(canton.nom_local)}"

    return f"""---
title: "FreshRescue.app dans le canton de {canton.nom_local} : sauver les invendus et réduire le gaspillage alimentaire"
description: "Découvrez comment FreshRescue, l'application suisse anti-gaspillage, aide commerçants et consommateurs du canton de {canton.nom_local} à sauver les invendus avec des prix flash justes, dans un rayon de 5 km."
slug: "{slug}"
canton: "{canton.nom_local}"
region: "{canton.region}"
lang: "fr"
date: "{aujourdhui}"
author: "Équipe FreshRescue"
tags: ["FreshRescue", "anti-gaspillage", "Suisse", "{canton.nom_local}", "invendus", "prix flash"]
---

# FreshRescue.app dans le canton de {canton.nom_local} : sauver les invendus, réduire le gaspillage

Chaque année, la Suisse jette près de 2,8 millions de tonnes de nourriture encore consommable. Dans le canton de {canton.nom_local}, comme partout dans le pays, une part importante de ce gaspillage provient des invendus de boulangeries, d'épiceries, de restaurants et de supermarchés. **FreshRescue.app** est l'application suisse anti-gaspillage qui relie directement les commerçants de {villes_txt} aux consommateurs pour sauver ces invendus grâce à des **prix flash** justes. Dans cet article, nous détaillons comment la plateforme transforme concrètement la lutte contre le gaspillage alimentaire en {canton.region}, et pourquoi elle s'impose comme un réflexe quotidien pour de plus en plus d'habitants du canton.

## Le gaspillage alimentaire en {canton.region} : un défi local

Le canton de {canton.nom_local} compte de nombreuses boulangeries artisanales, supermarchés de proximité, traiteurs, primeurs et restaurants. Malgré leur volonté de bien faire, ces commerces se retrouvent chaque soir avec des produits parfaitement consommables qui ne peuvent pas être vendus le lendemain : pains de la journée, plats cuisinés, fruits et légumes mûrs, produits laitiers approchant leur date limite. À {ville_principale} comme dans les communes voisines, ces invendus finissent trop souvent à la poubelle, ce qui représente une perte économique directe pour le commerçant, un impact environnemental majeur (eau, énergie, CO₂) et une occasion manquée pour les ménages qui cherchent à mieux consommer. FreshRescue.app a été conçu précisément pour répondre à ce paradoxe suisse : des produits de qualité d'un côté, des consommateurs attentifs au budget et à l'environnement de l'autre.

## Comment fonctionne FreshRescue.app dans le canton de {canton.nom_local}

FreshRescue.app est disponible gratuitement sur smartphone et via **[FreshRescue.app](https://freshrescue.app)**. Le fonctionnement repose sur trois étapes simples, pensées pour les commerçants et les consommateurs de {villes_txt} :

### 1. Le Commerçant Publie

Photographiez l'invendu, fixez un **prix flash** et une heure limite : moins de gaspillage, plus de valeur pour vos clients en Suisse. Un boulanger, un restaurateur ou un épicier de {ville_principale} peut mettre en ligne une offre en moins d'une minute depuis son smartphone, sans matériel ni formation particulière.

### 2. Les Clients consultent

Les offres s'affichent dans un **rayon de 5 km** autour de vous. Où que vous soyez dans le canton de {canton.nom_local}, à {villes_txt} ou dans les communes voisines, vous voyez en temps réel les invendus disponibles près de chez vous et vous réservez en deux clics, sans paperasse et sans inscription complexe. La géolocalisation garantit que vous ne voyez que des offres accessibles en quelques minutes, à pied, à vélo ou en transports.

### 3. Récupérez & Savourez

Les clients récupèrent des produits frais à prix réduit avant la date limite. **Zéro déchet**, plaisir intact : du pain encore du jour, un plat cuisiné maison, un panier de fruits et légumes sauvé à temps, tout en soutenant le commerce local en {canton.region}.

## Les avantages pour les commerçants de {canton.nom_local}

Pour un commerce local à {villes_txt}, FreshRescue.app apporte plusieurs bénéfices concrets :

- **Récupérer de la marge** sur des produits qui étaient voués à la poubelle.
- **Attirer une nouvelle clientèle** sensible à l'anti-gaspillage et fidèle aux acteurs engagés.
- **Valoriser son image** de commerce responsable dans le canton de {canton.nom_local}.
- **Réduire les coûts** liés à la gestion et à l'élimination des déchets alimentaires.
- **Gagner du temps** grâce à une interface simple, en français, pensée pour la réalité suisse.

Boulangers, épiciers, restaurateurs, hôteliers, producteurs locaux et grandes surfaces du canton trouvent ainsi un outil unique pour transformer un problème quotidien en opportunité commerciale et citoyenne.

## Les avantages pour les consommateurs du canton de {canton.nom_local}

Du côté des habitants de {villes_txt}, FreshRescue.app, c'est d'abord un geste concret pour la planète et pour le porte-monnaie :

- **Des prix flash justes**, souvent jusqu'à -50 % ou -70 % par rapport au prix initial.
- **Des produits frais et de qualité** issus de commerces locaux, pas de déstockage industriel.
- **La découverte de nouveaux commerces** du quartier, souvent ignorés du grand public.
- **Un impact mesurable** : chaque panier sauvé est comptabilisé en kg de nourriture et en CO₂ évité.
- **Une expérience 100 % locale**, dans la langue du canton et avec un support client suisse.

Pour une famille, un étudiant ou un travailleur pressé de {ville_principale}, c'est la garantie de manger mieux, moins cher, et de contribuer directement à la réduction du gaspillage alimentaire.

## Prix flash justes et impact local dans le canton de {canton.nom_local}

FreshRescue.app défend une idée forte : un prix anti-gaspillage doit rester **juste pour tout le monde**. Pour le commerçant, qui récupère une partie de sa marge. Pour le consommateur, qui profite d'une vraie remise. Et pour la planète, puisque chaque produit sauvé évite des émissions inutiles. Plus la communauté d'utilisateurs grandit dans le canton de {canton.nom_local}, plus le nombre d'invendus sauvés augmente, et plus l'impact collectif devient visible : moins de déchets à traiter dans les communes, moins de pression sur les infrastructures locales, et une économie circulaire renforcée en {canton.region}.

## Rejoignez le mouvement FreshRescue à {ville_principale} et partout dans le canton de {canton.nom_local}

Que vous soyez commerçant à {villes_txt} ou consommateur quelque part dans le canton de {canton.nom_local}, FreshRescue.app est l'outil le plus simple et le plus suisse pour agir chaque jour contre le gaspillage alimentaire. **Téléchargez l'application**, créez votre compte en quelques secondes, et découvrez dès ce soir les invendus disponibles dans un rayon de 5 km autour de vous. Ensemble, transformons les surplus en opportunités, les invendus en repas, et le canton de {canton.nom_local} en exemple suisse d'une consommation plus responsable. Plus d'informations et inscription sur **[FreshRescue.app](https://freshrescue.app)**.
"""


# ---------------------------------------------------------------------------
# Template ALLEMAND (Deutsch)
# ---------------------------------------------------------------------------

def _article_de(canton: Canton) -> str:
    staedte_txt = _join_list(canton.villes, "de")
    hauptstadt = canton.villes[0]
    heute = date.today().isoformat()
    slug = f"freshrescue-{slugify(canton.nom_local)}"

    return f"""---
title: "FreshRescue.app im Kanton {canton.nom_local}: unverkaufte Lebensmittel retten und Food Waste reduzieren"
description: "Erfahre, wie FreshRescue, die Schweizer Anti-Food-Waste-App, Händlern und Kundinnen im Kanton {canton.nom_local} hilft, unverkaufte Lebensmittel mit fairen Flash-Preisen in einem Umkreis von 5 km zu retten."
slug: "{slug}"
canton: "{canton.nom_local}"
region: "{canton.region}"
lang: "de"
date: "{heute}"
author: "Das FreshRescue-Team"
tags: ["FreshRescue", "Food Waste", "Schweiz", "{canton.nom_local}", "unverkaufte Ware", "Flash-Preis"]
---

# FreshRescue.app im Kanton {canton.nom_local}: unverkaufte Lebensmittel retten, Food Waste reduzieren

Jedes Jahr werden in der Schweiz fast 2,8 Millionen Tonnen noch geniessbarer Lebensmittel weggeworfen. Im Kanton {canton.nom_local}, wie überall im Land, stammt ein grosser Teil dieser Verschwendung aus unverkauften Waren von Bäckereien, Lebensmittelgeschäften, Restaurants und Supermärkten. **FreshRescue.app** ist die Schweizer Anti-Food-Waste-App, die Händler aus {staedte_txt} direkt mit Konsumentinnen und Konsumenten verbindet, um diese Ware dank fairer **Flash-Preise** zu retten. In diesem Artikel zeigen wir, wie die Plattform den Kampf gegen Lebensmittelverschwendung in der {canton.region} konkret verändert – und warum sie für immer mehr Menschen im Kanton zum täglichen Reflex wird.

## Lebensmittelverschwendung in der {canton.region}: eine lokale Herausforderung

Der Kanton {canton.nom_local} zählt zahlreiche handwerkliche Bäckereien, Quartierläden, Take-aways, Hofläden und Restaurants. Trotz bester Absichten bleiben jeden Abend einwandfreie Produkte übrig, die am nächsten Tag nicht mehr verkauft werden können: Brot vom Tag, zubereitete Gerichte, reifes Obst und Gemüse, Milchprodukte nahe am Mindesthaltbarkeitsdatum. In {hauptstadt} und den umliegenden Gemeinden landen diese unverkauften Waren viel zu oft im Abfall. Das bedeutet einen direkten wirtschaftlichen Verlust für den Händler, eine grosse Umweltbelastung (Wasser, Energie, CO₂) und eine verpasste Chance für Haushalte, die bewusster einkaufen möchten. FreshRescue.app wurde genau für dieses Schweizer Paradox entwickelt: auf der einen Seite hochwertige Produkte, auf der anderen Seite Menschen, die auf Budget und Umwelt achten.

## Wie FreshRescue.app im Kanton {canton.nom_local} funktioniert

FreshRescue.app ist kostenlos auf dem Smartphone und über **[FreshRescue.app](https://freshrescue.app)** verfügbar. Das Konzept basiert auf drei einfachen Schritten, die für Händler und Konsumentinnen in {staedte_txt} entwickelt wurden:

### 1. Der Händler veröffentlicht

Fotografiere die unverkaufte Ware, lege einen **Flash-Preis** und eine Abholzeit fest: weniger Verschwendung, mehr Wert für deine Kundinnen und Kunden in der Schweiz. Eine Bäckerei, ein Restaurant oder ein Lebensmittelgeschäft in {hauptstadt} kann ein Angebot in weniger als einer Minute direkt vom Handy aus online stellen – ohne zusätzliche Geräte oder spezielle Schulung.

### 2. Die Kunden sehen die Angebote

Die Angebote werden in einem **Umkreis von 5 km** rund um deinen Standort angezeigt. Egal wo du dich im Kanton {canton.nom_local} befindest, in {staedte_txt} oder in den umliegenden Gemeinden: Du siehst in Echtzeit, was in deiner Nähe verfügbar ist, und reservierst in zwei Klicks – ohne Papierkram und ohne komplizierte Anmeldung. Die Geolokalisierung stellt sicher, dass du nur Angebote siehst, die in wenigen Minuten zu Fuss, mit dem Velo oder den öffentlichen Verkehrsmitteln erreichbar sind.

### 3. Abholen & Geniessen

Die Kundinnen holen frische Produkte zum reduzierten Preis vor Ablauf der Abholzeit ab. **Null Abfall**, voller Genuss: tagesfrisches Brot, ein hausgemachtes Gericht, ein geretteter Obst- und Gemüsekorb – und gleichzeitig unterstützt du den lokalen Handel in der {canton.region}.

## Die Vorteile für Händler im Kanton {canton.nom_local}

Für einen lokalen Betrieb in {staedte_txt} bringt FreshRescue.app mehrere konkrete Vorteile:

- **Marge zurückgewinnen** bei Produkten, die sonst im Abfall gelandet wären.
- **Neue Kundschaft gewinnen**, die auf Anti-Food-Waste sensibilisiert ist und engagierten Händlern die Treue hält.
- **Das Image** als verantwortungsbewusster Betrieb im Kanton {canton.nom_local} stärken.
- **Kosten senken**, die mit der Entsorgung von Lebensmittelabfällen verbunden sind.
- **Zeit sparen** dank einer einfachen, deutschsprachigen Oberfläche, die auf die Schweizer Realität zugeschnitten ist.

Bäckereien, Lebensmittelläden, Restaurants, Hotels, lokale Produzenten und Grossverteiler des Kantons finden so ein einzigartiges Werkzeug, um ein tägliches Problem in eine wirtschaftliche und bürgerliche Chance zu verwandeln.

## Die Vorteile für Konsumentinnen und Konsumenten im Kanton {canton.nom_local}

Für die Bewohnerinnen und Bewohner von {staedte_txt} ist FreshRescue.app vor allem eine konkrete Geste für den Planeten und den Geldbeutel:

- **Faire Flash-Preise**, oft bis zu -50 % oder -70 % gegenüber dem ursprünglichen Preis.
- **Frische Qualitätsprodukte** aus lokalen Geschäften, keine industrielle Lagerräumung.
- **Neue Geschäfte** im Quartier entdecken, die sonst oft unbekannt bleiben.
- **Messbarer Impact**: Jeder gerettete Korb wird in kg Lebensmittel und vermiedenem CO₂ erfasst.
- **Ein 100 % lokales Erlebnis**, in der Sprache des Kantons und mit Schweizer Kundensupport.

Für eine Familie, eine Studentin oder einen Berufstätigen im Alltag in {hauptstadt} bedeutet das: besser essen, weniger ausgeben und direkt zur Reduktion von Food Waste beitragen.

## Faire Flash-Preise und lokaler Impact im Kanton {canton.nom_local}

FreshRescue.app vertritt eine klare Idee: Ein Anti-Food-Waste-Preis muss **für alle fair** sein. Für den Händler, der einen Teil seiner Marge zurückgewinnt. Für die Konsumentin, die einen echten Rabatt erhält. Und für den Planeten, weil jedes gerettete Produkt unnötige Emissionen vermeidet. Je grösser die Community im Kanton {canton.nom_local} wächst, desto mehr unverkaufte Ware wird gerettet, und desto sichtbarer wird der kollektive Impact: weniger Abfall, weniger Druck auf kommunale Infrastrukturen und eine stärkere Kreislaufwirtschaft in der {canton.region}.

## Mach mit bei der FreshRescue-Bewegung in {hauptstadt} und im ganzen Kanton {canton.nom_local}

Ob Händlerin oder Händler in {staedte_txt} oder Konsument irgendwo im Kanton {canton.nom_local} – FreshRescue.app ist das einfachste und schweizerischste Werkzeug, um jeden Tag gegen Lebensmittelverschwendung zu handeln. **Lade die App herunter**, erstelle dein Konto in wenigen Sekunden und entdecke noch heute Abend die verfügbaren Angebote in einem Umkreis von 5 km um dich herum. Gemeinsam verwandeln wir Überschüsse in Chancen, unverkaufte Ware in Mahlzeiten und den Kanton {canton.nom_local} in ein Schweizer Vorbild für bewussteren Konsum. Mehr Informationen und Anmeldung unter **[FreshRescue.app](https://freshrescue.app)**.
"""


# ---------------------------------------------------------------------------
# Template ITALIEN (Italiano)
# ---------------------------------------------------------------------------

def _article_it(canton: Canton) -> str:
    citta_txt = _join_list(canton.villes, "it")
    citta_principale = canton.villes[0]
    oggi = date.today().isoformat()
    slug = f"freshrescue-{slugify(canton.nom_local)}"

    return f"""---
title: "FreshRescue.app nel Cantone {canton.nom_local}: salvare gli invenduti e ridurre lo spreco alimentare"
description: "Scopri come FreshRescue, l'app svizzera antispreco, aiuta commercianti e consumatori nel Cantone {canton.nom_local} a salvare gli invenduti con prezzi flash equi, entro un raggio di 5 km."
slug: "{slug}"
canton: "{canton.nom_local}"
region: "{canton.region}"
lang: "it"
date: "{oggi}"
author: "Il team FreshRescue"
tags: ["FreshRescue", "antispreco", "Svizzera", "{canton.nom_local}", "invenduti", "prezzo flash"]
---

# FreshRescue.app nel Cantone {canton.nom_local}: salvare gli invenduti, ridurre lo spreco alimentare

Ogni anno la Svizzera butta quasi 2,8 milioni di tonnellate di cibo ancora consumabile. Nel Cantone {canton.nom_local}, come in tutto il Paese, una parte importante di questo spreco proviene dagli invenduti di panetterie, alimentari, ristoranti e supermercati. **FreshRescue.app** è l'app svizzera antispreco che collega direttamente i commercianti di {citta_txt} ai consumatori per salvare questi invenduti grazie a **prezzi flash** equi. In questo articolo spieghiamo come la piattaforma trasforma concretamente la lotta allo spreco alimentare nella {canton.region}, e perché sta diventando un gesto quotidiano per sempre più abitanti del cantone.

## Lo spreco alimentare nella {canton.region}: una sfida locale

Il Cantone {canton.nom_local} conta numerose panetterie artigianali, negozi di vicinato, gastronomie, contadini e ristoranti. Nonostante la buona volontà, ogni sera questi commerci si ritrovano con prodotti perfettamente consumabili che non possono essere venduti il giorno dopo: pane di giornata, piatti pronti, frutta e verdura matura, latticini prossimi alla scadenza. A {citta_principale} come nei comuni vicini, questi invenduti finiscono troppo spesso nella spazzatura, con una perdita economica diretta per il commerciante, un impatto ambientale importante (acqua, energia, CO₂) e un'occasione mancata per le famiglie attente al budget e all'ambiente. FreshRescue.app è stata pensata proprio per rispondere a questo paradosso svizzero: prodotti di qualità da una parte, consumatori consapevoli dall'altra.

## Come funziona FreshRescue.app nel Cantone {canton.nom_local}

FreshRescue.app è disponibile gratuitamente su smartphone e tramite **[FreshRescue.app](https://freshrescue.app)**. Il funzionamento si basa su tre passaggi semplici, pensati per i commercianti e i consumatori di {citta_txt}:

### 1. Il commerciante pubblica

Fotografa l'invenduto, fissa un **prezzo flash** e un orario limite: meno spreco, più valore per i tuoi clienti in Svizzera. Un panettiere, un ristoratore o un negoziante di {citta_principale} può pubblicare un'offerta in meno di un minuto dal suo smartphone, senza attrezzature né formazione particolare.

### 2. I clienti consultano

Le offerte appaiono entro un **raggio di 5 km** attorno a te. Ovunque ti trovi nel Cantone {canton.nom_local}, a {citta_txt} o nei comuni vicini, vedi in tempo reale gli invenduti disponibili vicino a te e prenoti in due clic, senza scartoffie e senza registrazioni complicate. La geolocalizzazione garantisce che tu veda solo offerte raggiungibili in pochi minuti, a piedi, in bicicletta o con i trasporti pubblici.

### 3. Ritira & Gusta

I clienti ritirano prodotti freschi a prezzo ridotto prima della scadenza. **Zero sprechi**, piacere intatto: pane di giornata, un piatto fatto in casa, un cesto di frutta e verdura salvato in tempo, sostenendo al tempo stesso il commercio locale nella {canton.region}.

## I vantaggi per i commercianti del Cantone {canton.nom_local}

Per un commercio locale di {citta_txt}, FreshRescue.app porta diversi benefici concreti:

- **Recuperare margine** su prodotti destinati alla spazzatura.
- **Attirare nuovi clienti** sensibili all'antispreco e fedeli ai commercianti impegnati.
- **Valorizzare l'immagine** di commercio responsabile nel Cantone {canton.nom_local}.
- **Ridurre i costi** legati alla gestione e allo smaltimento degli scarti alimentari.
- **Guadagnare tempo** grazie a un'interfaccia semplice, in italiano, pensata per la realtà svizzera.

Panettieri, negozianti, ristoratori, albergatori, produttori locali e grande distribuzione del cantone trovano così uno strumento unico per trasformare un problema quotidiano in un'opportunità commerciale e civica.

## I vantaggi per i consumatori del Cantone {canton.nom_local}

Per gli abitanti di {citta_txt}, FreshRescue.app è prima di tutto un gesto concreto per il pianeta e per il portafoglio:

- **Prezzi flash equi**, spesso fino al -50 % o -70 % rispetto al prezzo iniziale.
- **Prodotti freschi e di qualità** provenienti da commerci locali, non da destoccaggi industriali.
- **La scoperta di nuovi commerci** di quartiere, spesso poco conosciuti dal grande pubblico.
- **Un impatto misurabile**: ogni cesto salvato viene conteggiato in kg di cibo e CO₂ evitata.
- **Un'esperienza 100 % locale**, nella lingua del cantone e con supporto clienti svizzero.

Per una famiglia, uno studente o un lavoratore di passaggio a {citta_principale}, è la garanzia di mangiare meglio, spendere meno e contribuire direttamente alla riduzione dello spreco alimentare.

## Prezzi flash equi e impatto locale nel Cantone {canton.nom_local}

FreshRescue.app difende un'idea forte: un prezzo antispreco deve restare **equo per tutti**. Per il commerciante, che recupera parte del suo margine. Per il consumatore, che approfitta di uno sconto reale. E per il pianeta, perché ogni prodotto salvato evita emissioni inutili. Più la comunità cresce nel Cantone {canton.nom_local}, più aumenta il numero di invenduti salvati, più diventa visibile l'impatto collettivo: meno rifiuti da gestire nei comuni, meno pressione sulle infrastrutture locali e un'economia circolare rafforzata nella {canton.region}.

## Unisciti al movimento FreshRescue a {citta_principale} e in tutto il Cantone {canton.nom_local}

Che tu sia un commerciante di {citta_txt} o un consumatore da qualche parte nel Cantone {canton.nom_local}, FreshRescue.app è lo strumento più semplice e più svizzero per agire ogni giorno contro lo spreco alimentare. **Scarica l'app**, crea il tuo account in pochi secondi e scopri già stasera gli invenduti disponibili entro un raggio di 5 km attorno a te. Insieme trasformiamo gli eccedenti in opportunità, gli invenduti in pasti e il Cantone {canton.nom_local} in un esempio svizzero di consumo più responsabile. Maggiori informazioni e iscrizione su **[FreshRescue.app](https://freshrescue.app)**.
"""


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------

_GENERATORS = {
    "fr": _article_fr,
    "de": _article_de,
    "it": _article_it,
}


def generate_article(canton: Canton) -> str:
    """Genere l'article dans la langue locale du canton."""
    generator = _GENERATORS.get(canton.lang)
    if generator is None:
        raise ValueError(f"Langue non supportee : {canton.lang}")
    return generator(canton)


# ---------------------------------------------------------------------------
# Sauvegarde
# ---------------------------------------------------------------------------

def save_article(canton: Canton, content: str, folder: str | os.PathLike = "blog") -> Path:
    """Sauvegarde l'article Markdown dans le dossier indique (par defaut `/blog`)."""
    output_dir = Path(folder)
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = f"freshrescue-{slugify(canton.nom_local)}.md"
    filepath = output_dir / filename
    filepath.write_text(content, encoding="utf-8")
    return filepath


def generate_all(folder: str | os.PathLike = "blog") -> list[Path]:
    """Genere et sauvegarde un article Markdown pour chaque canton suisse."""
    written: list[Path] = []
    for canton in CANTONS:
        article = generate_article(canton)
        path = save_article(canton, article, folder=folder)
        word_count = len(article.split())
        flag = {"fr": "FR", "de": "DE", "it": "IT"}[canton.lang]
        print(f"[{flag}] {canton.nom_local:28s} -> {path}  (~{word_count} mots)")
        written.append(path)
    return written


# ---------------------------------------------------------------------------
# Nettoyage des anciens fichiers FR par defaut (optionnel)
# ---------------------------------------------------------------------------

def cleanup_old_files(folder: str | os.PathLike = "blog") -> int:
    """Supprime les anciens fichiers qui ne correspondent plus aux slugs actuels."""
    output_dir = Path(folder)
    if not output_dir.exists():
        return 0
    expected = {f"freshrescue-{slugify(c.nom_local)}.md" for c in CANTONS}
    removed = 0
    for md in output_dir.glob("freshrescue-*.md"):
        if md.name not in expected:
            md.unlink()
            print(f"[rm] ancien fichier supprime : {md.name}")
            removed += 1
    return removed


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    print("Generation des articles SEO FreshRescue pour les 26 cantons suisses")
    print("(langue locale : FR / DE / IT selon le canton)\n")
    cleanup_old_files("blog")
    files = generate_all(folder="blog")
    summary = {"fr": 0, "de": 0, "it": 0}
    for c in CANTONS:
        summary[c.lang] += 1
    print(
        f"\n{len(files)} articles generes dans 'blog/' : "
        f"{summary['fr']} FR, {summary['de']} DE, {summary['it']} IT."
    )


if __name__ == "__main__":
    main()
