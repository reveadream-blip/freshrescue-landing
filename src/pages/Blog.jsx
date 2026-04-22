import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

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

function getSlugFromPath(path) {
  return path.split('/').pop().replace(/\.md$/, '');
}

const LANG_META = {
  fr: { flag: '🇫🇷', label: 'Français', short: 'FR' },
  de: { flag: '🇩🇪', label: 'Deutsch', short: 'DE' },
  it: { flag: '🇮🇹', label: 'Italiano', short: 'IT' },
};

const UI_TEXT = {
  title: {
    fr: 'Blog FreshRescue',
    de: 'FreshRescue Blog',
    it: 'Blog FreshRescue',
  },
  subtitle: {
    fr: "Comment FreshRescue relie commerçants et consommateurs dans chaque canton suisse pour sauver les invendus et réduire le gaspillage alimentaire.",
    de: 'Wie FreshRescue Händler und Kundschaft in jedem Schweizer Kanton verbindet, um unverkaufte Ware zu retten und Food Waste zu reduzieren.',
    it: 'Come FreshRescue collega commercianti e consumatori in ogni cantone svizzero per salvare gli invenduti e ridurre lo spreco alimentare.',
  },
};

export default function Blog() {
  const [activeLang, setActiveLang] = useState('all');

  const articles = useMemo(() => {
    return Object.entries(rawArticles)
      .map(([path, raw]) => {
        const { data } = parseFrontMatter(raw);
        return {
          slug: getSlugFromPath(path),
          title: data.title || getSlugFromPath(path),
          description: data.description || '',
          canton: data.canton || '',
          region: data.region || '',
          lang: data.lang || 'fr',
          date: data.date || '',
        };
      })
      .sort((a, b) => a.canton.localeCompare(b.canton, 'fr'));
  }, []);

  const counts = useMemo(() => {
    const c = { all: articles.length, fr: 0, de: 0, it: 0 };
    articles.forEach((a) => {
      c[a.lang] = (c[a.lang] || 0) + 1;
    });
    return c;
  }, [articles]);

  const filtered =
    activeLang === 'all' ? articles : articles.filter((a) => a.lang === activeLang);

  const cleanTitle = (title) =>
    title
      .replace(/^FreshRescue\.app dans le canton de /, '')
      .replace(/^FreshRescue\.app im Kanton /, '')
      .replace(/^FreshRescue\.app nel Cantone /, '');

  return (
    <div className="min-h-screen bg-earth text-white">
      <header className="border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-white/60 hover:text-citrus transition"
          >
            ← Retour à l'accueil
          </Link>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 tracking-tight text-white">
            Blog <span className="text-citrus">FreshRescue</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 mt-4 max-w-2xl leading-relaxed">
            Un article par canton suisse, rédigé dans la langue locale, pour expliquer comment
            FreshRescue relie commerçants et consommateurs dans un rayon de 5 km.
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {['all', 'fr', 'de', 'it'].map((l) => {
              const isActive = activeLang === l;
              const label =
                l === 'all'
                  ? `Tous (${counts.all})`
                  : `${LANG_META[l].flag} ${LANG_META[l].label} (${counts[l] || 0})`;
              return (
                <button
                  key={l}
                  onClick={() => setActiveLang(l)}
                  className={
                    'px-4 py-2 rounded-full text-sm font-medium transition border ' +
                    (isActive
                      ? 'bg-citrus text-black border-citrus'
                      : 'bg-white/[0.04] text-white/80 border-white/10 hover:border-white/30')
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const meta = LANG_META[a.lang] || LANG_META.fr;
            return (
              <Link
                key={a.slug}
                to={`/blog/${a.slug}`}
                className="group block bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-citrus/60 rounded-2xl p-6 transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-citrus/15 text-citrus text-xs font-semibold">
                      {a.canton || 'Suisse'}
                    </span>
                    {a.region && (
                      <span className="text-xs text-white/50">{a.region}</span>
                    )}
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium"
                    title={meta.label}
                  >
                    {meta.flag} {meta.short}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug group-hover:text-citrus transition">
                  {cleanTitle(a.title)}
                </h2>
                <p className="text-sm text-white/65 mt-3 leading-relaxed line-clamp-3">
                  {a.description}
                </p>
                <span className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-citrus group-hover:gap-2 transition-all">
                  {a.lang === 'de'
                    ? 'Artikel lesen →'
                    : a.lang === 'it'
                    ? "Leggi l'articolo →"
                    : "Lire l'article →"}
                </span>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-white/60 py-16">
            Aucun article dans cette langue.
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-white/50">
          {articles.length} articles · FreshRescue.app — l'application suisse anti-gaspillage
        </div>
      </footer>
    </div>
  );
}
