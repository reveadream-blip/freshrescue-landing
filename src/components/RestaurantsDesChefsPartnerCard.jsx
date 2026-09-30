import { Link } from 'react-router-dom';
import { ExternalLink, Handshake } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

const PARTNER_URL = 'https://restaurantsdeschefs.fr';
const PARTNER_LOGO = `${import.meta.env.BASE_URL}images/partners/restaurantsdeschefs.png`;
const NEWS_PATH = '/actualites/partenariat-restaurants-des-chefs';

/**
 * Encart partenariat Restaurants des Chefs
 * (style carte sombre + badge + 2 CTAs, aligné sur le modèle AppliManagement).
 */
export default function RestaurantsDesChefsPartnerCard({ className = '' }) {
  const { t } = useTranslation();

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8 md:p-10 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, #0d0b14 0%, #161018 42%, #2a1815 100%)',
      }}
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9b466]/70 bg-[#d9b466]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d9b466]">
              <Handshake className="h-3.5 w-3.5" aria-hidden />
              {t('partnerBadge')}
            </span>
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm sm:h-14 sm:w-14">
              <img
                src={PARTNER_LOGO}
                alt=""
                className="h-full w-full object-contain"
                aria-hidden
              />
            </div>
          </div>

          <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Restaurants des Chefs
          </h2>

          <p className="mb-3 max-w-2xl text-sm leading-relaxed text-white/95 sm:text-[15px]">
            {t('partnerRestaurantsDesChefsLeadBefore')}{' '}
            <strong className="font-semibold text-white">restaurantsdeschefs.fr</strong>
            {t('partnerRestaurantsDesChefsLeadAfter')}
          </p>

          <p className="max-w-2xl text-sm leading-relaxed text-white/55 sm:text-[15px]">
            {t('partnerRestaurantsDesChefsSub')}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 sm:max-w-xs lg:w-auto">
          <a
            href={PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f59e0b] px-6 py-3.5 text-sm font-bold text-black transition hover:bg-[#fbbf24]"
          >
            {t('partnerSeeDirectory')}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
          <Link
            to={NEWS_PATH}
            className="inline-flex items-center justify-center rounded-full border border-white/25 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
          >
            {t('partnerReadNews')}
          </Link>
        </div>
      </div>
    </article>
  );
}
