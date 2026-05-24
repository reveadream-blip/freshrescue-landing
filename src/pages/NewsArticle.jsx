import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Facebook } from 'lucide-react';

import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/i18n';
import { NEWS_ITEMS } from '../data/newsItems';

function formatNewsDate(isoDate, lang) {
  try {
    const locale = { fr: 'fr-FR', en: 'en-GB', it: 'it-IT', de: 'de-CH', ru: 'ru-RU' }[lang] || 'fr-FR';
    return new Date(isoDate).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

function ArticleContent({ html, plain }) {
  if (html && (html.includes('<p>') || html.includes('<br'))) {
    return (
      <div
        className="text-sm sm:text-base text-muted-foreground leading-relaxed prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
      {plain}
    </div>
  );
}

export default function NewsArticle() {
  const { id } = useParams();
  const { lang } = useTranslation();
  const item = NEWS_ITEMS.find((entry) => entry.id === id);

  const text = (entry) => entry?.[lang] || entry?.fr || entry?.en || '';

  if (!item) {
    return (
      <div className="min-h-screen bg-earth text-foreground">
        <Navbar />
        <main className="pt-28 pb-16 px-6 max-w-3xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">Article introuvable.</p>
          <Link to="/actualites" className="text-citrus font-bold uppercase tracking-widest text-sm hover:underline">
            ← Retour aux actualités
          </Link>
        </main>
      </div>
    );
  }

  const title = text(item.title);
  const excerpt = text(item.excerpt);
  const contentHtml = item.contentHtml ? text(item.contentHtml) : excerpt;

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />

      <main className="pt-28 pb-16 px-6 max-w-3xl mx-auto">
        <div className="mb-8">
          {item.category ? (
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 border border-amber-600/40 px-2 py-1 rounded-sm">
              {item.category}
            </span>
          ) : null}
          <p className="mt-4 text-xs text-muted-foreground uppercase tracking-widest inline-flex items-center gap-2">
            <Facebook className="w-3 h-3 text-citrus" aria-hidden />
            Réseau Autonomie &amp; Solidarité · {formatNewsDate(item.date, lang)}
          </p>
          <h1 className="mt-4 text-2xl sm:text-4xl font-black italic uppercase tracking-tight leading-snug">
            {title}
          </h1>
        </div>

        <article className="rounded-2xl border border-white/10 bg-card/60 p-6 sm:p-8">
          <ArticleContent html={contentHtml} plain={contentHtml} />

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/30 text-foreground font-black uppercase text-xs tracking-[0.18em] rounded-sm hover:border-citrus hover:text-citrus transition"
              >
                Voir sur Facebook
                <ExternalLink className="w-3 h-3 ml-2" aria-hidden />
              </a>
            ) : null}
            <Link
              to="/actualites"
              className="inline-flex items-center justify-center px-6 py-3 bg-citrus text-earth font-black uppercase text-xs tracking-[0.18em] rounded-sm hover:opacity-90 transition"
            >
              ← Toutes les actualités
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
