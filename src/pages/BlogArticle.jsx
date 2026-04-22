import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

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

const BY_SLUG = Object.fromEntries(
  Object.entries(rawArticles).map(([path, raw]) => {
    const slug = path.split('/').pop().replace(/\.md$/, '');
    return [slug, raw];
  })
);

const LANG_META = {
  fr: { flag: '🇫🇷', label: 'Français' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  it: { flag: '🇮🇹', label: 'Italiano' },
};

const UI = {
  fr: {
    backHome: "← Retour à l'accueil",
    allArticles: "← Tous les articles",
    seeAll: "← Voir tous les articles",
    download: "Télécharger FreshRescue →",
    notFound: 'Article introuvable',
    backBlog: '← Retour au blog',
    footer: "FreshRescue.app — l'application suisse anti-gaspillage",
  },
  de: {
    backHome: '← Zurück zur Startseite',
    allArticles: '← Alle Artikel',
    seeAll: '← Alle Artikel ansehen',
    download: 'FreshRescue herunterladen →',
    notFound: 'Artikel nicht gefunden',
    backBlog: '← Zurück zum Blog',
    footer: 'FreshRescue.app — die Schweizer Anti-Food-Waste-App',
  },
  it: {
    backHome: '← Torna alla home',
    allArticles: '← Tutti gli articoli',
    seeAll: '← Vedi tutti gli articoli',
    download: 'Scarica FreshRescue →',
    notFound: 'Articolo non trovato',
    backBlog: '← Torna al blog',
    footer: "FreshRescue.app — l'app svizzera antispreco",
  },
};

const cleanTitle = (title) =>
  (title || '')
    .replace(/^FreshRescue\.app dans le canton de /, '')
    .replace(/^FreshRescue\.app im Kanton /, '')
    .replace(/^FreshRescue\.app nel Cantone /, '');

export default function BlogArticle() {
  const { slug } = useParams();
  const raw = BY_SLUG[slug];

  const article = useMemo(() => {
    if (!raw) return null;
    return parseFrontMatter(raw);
  }, [raw]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article introuvable</h1>
          <Link to="/blog" className="text-citrus hover:underline">
            ← Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const { data, content } = article;
  const lang = data.lang || 'fr';
  const t = UI[lang] || UI.fr;
  const meta = LANG_META[lang] || LANG_META.fr;
  const title = cleanTitle(data.title);

  return (
    <div className="min-h-screen bg-earth text-white" lang={lang}>
      <header className="border-b border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-white/60 hover:text-citrus transition"
          >
            {t.allArticles}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mt-6 text-xs">
            {data.canton && (
              <span className="px-2.5 py-1 rounded-full bg-citrus/15 text-citrus font-semibold">
                {data.canton}
              </span>
            )}
            {data.region && <span className="text-white/60">{data.region}</span>}
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
              {meta.flag} {meta.label}
            </span>
            {data.date && <span className="text-white/40">· {data.date}</span>}
          </div>
          {title && (
            <h1 className="text-3xl md:text-5xl font-extrabold mt-4 tracking-tight text-white leading-tight">
              {title}
            </h1>
          )}
          {data.description && (
            <p className="text-base md:text-lg text-white/70 mt-4 leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-10">
          <ReactMarkdown
            components={{
              h1: () => null,
              h2: ({ node, ...props }) => (
                <h2
                  className="text-2xl md:text-3xl font-bold text-white mt-10 mb-4 first:mt-0"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-semibold text-white mt-8 mb-3" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p
                  className="text-base md:text-[17px] leading-[1.75] text-white/80 mb-5"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="list-disc pl-6 mb-5 space-y-2 text-white/80 marker:text-citrus"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="list-decimal pl-6 mb-5 space-y-2 text-white/80 marker:text-citrus"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-relaxed" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-citrus underline underline-offset-2 hover:opacity-80 transition"
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-white" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-white/90" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-citrus pl-4 italic text-white/70 my-5"
                  {...props}
                />
              ),
              hr: () => <hr className="border-white/10 my-8" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/blog"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/10 text-sm font-medium text-white hover:border-citrus hover:text-citrus transition"
          >
            {t.seeAll}
          </Link>
          <a
            href="https://freshrescue.app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-citrus text-black text-sm font-semibold hover:opacity-90 transition"
          >
            {t.download}
          </a>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-white/50">
          {t.footer}
        </div>
      </footer>
    </div>
  );
}
