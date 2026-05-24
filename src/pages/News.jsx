import { Link } from 'react-router-dom';

import { ExternalLink, Facebook, Newspaper } from 'lucide-react';

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



export default function News() {

  const { t, lang } = useTranslation();



  const items = [...NEWS_ITEMS].sort((a, b) => b.date.localeCompare(a.date));



  const text = (entry) => entry[lang] || entry.fr || entry.en || '';



  return (

    <div className="min-h-screen bg-earth text-foreground">

      <Navbar />



      <main className="pt-28 pb-16 px-6 max-w-4xl mx-auto">

        <div className="mb-12 text-center">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-citrus/15 mb-6">

            <Newspaper className="w-7 h-7 text-citrus" aria-hidden />

          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight">

            {t('newsPageTitle')}

          </h1>

          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">

            {t('newsPageSubtitle')}

          </p>

        </div>



        <div className="space-y-5">

          {items.map((item) => (

            <article

              key={item.id}

              className="rounded-2xl border border-white/10 bg-card/60 p-6 sm:p-8 transition-colors hover:border-citrus/40 hover:bg-card/80"

            >

              <div className="flex flex-wrap items-center gap-3 mb-4">

                {item.category ? (

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 border border-amber-600/40 px-2 py-1 rounded-sm">

                    {item.category}

                  </span>

                ) : null}

                {(item.link || item.category) ? (

                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest inline-flex items-center gap-1">

                    <Facebook className="w-3 h-3 text-citrus" aria-hidden />

                    Réseau Autonomie &amp; Solidarité

                  </span>

                ) : (

                  <time

                    dateTime={item.date}

                    className="text-xs font-bold uppercase tracking-widest text-citrus"

                  >

                    {formatNewsDate(item.date, lang)}

                  </time>

                )}

              </div>

              <h2 className="text-xl sm:text-2xl font-black italic uppercase text-foreground leading-snug">

                {text(item.title)}

              </h2>

              <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">

                {text(item.excerpt)}

              </p>

              {(item.articleLink || item.link) ? (

                <div className="mt-6 flex flex-col sm:flex-row gap-3">

                  {item.articleLink ? (
                    item.articleLink.startsWith('/') ? (
                      <Link
                        to={item.articleLink}
                        className="inline-flex items-center justify-center px-6 py-3 bg-citrus text-earth font-black uppercase text-xs tracking-[0.18em] rounded-sm hover:opacity-90 transition"
                      >
                        Lire l'article
                      </Link>
                    ) : (
                      <a
                        href={item.articleLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3 bg-citrus text-earth font-black uppercase text-xs tracking-[0.18em] rounded-sm hover:opacity-90 transition"
                      >
                        Lire l'article
                      </a>
                    )
                  ) : null}

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

                </div>

              ) : null}

            </article>

          ))}

        </div>



        {items.length === 0 && (

          <p className="text-center text-muted-foreground py-16">{t('newsEmpty')}</p>

        )}



        <div className="mt-12 text-center">

          <Link

            to="/"

            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-citrus hover:underline"

          >

            ← {t('newsBackHome')}

          </Link>

        </div>

      </main>

    </div>

  );

}


