import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, Handshake } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/i18n';

const PARTNER_LOGO = `${import.meta.env.BASE_URL}images/partners/restaurantsdeschefs.png`;

export default function Partners() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-stem/15 mb-6">
            <Handshake className="w-7 h-7 text-stem" aria-hidden />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic uppercase tracking-tight">
            {t('partnersPageTitle')}
          </h1>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {t('partnersPageSubtitle')}
          </p>
        </div>

        <article className="rounded-3xl border border-white/10 bg-card/60 p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
            <a
              href="https://restaurantsdeschefs.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 mx-auto sm:mx-0 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={PARTNER_LOGO}
                alt="Restaurants des Chefs"
                className="h-16 w-auto max-w-[220px] object-contain"
              />
            </a>
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stem mb-2">
                {t('partnerCategorySites')}
              </p>
              <h2 className="text-2xl font-black italic uppercase tracking-tight">
                Restaurants des Chefs
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
            {t('partnerRestaurantsDesChefsDesc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://restaurantsdeschefs.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-stem text-earth px-6 py-3 rounded-full font-black text-sm uppercase tracking-wide hover:opacity-90 transition"
            >
              restaurantsdeschefs.fr
              <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
            <Link
              to="/actualites/partenariat-restaurants-des-chefs"
              className="inline-flex items-center justify-center gap-2 border border-white/15 bg-white/5 px-6 py-3 rounded-full font-bold text-sm hover:border-citrus/50 hover:text-citrus transition-colors"
            >
              {t('partnerReadNews')}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </article>

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
