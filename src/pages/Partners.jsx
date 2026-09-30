import { Link } from 'react-router-dom';
import { Handshake } from 'lucide-react';
import Navbar from '../components/Navbar';
import RestaurantsDesChefsPartnerCard from '../components/RestaurantsDesChefsPartnerCard';
import { useTranslation } from '../lib/i18n';

export default function Partners() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-28">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stem/15">
            <Handshake className="h-7 w-7 text-stem" aria-hidden />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight sm:text-4xl md:text-5xl">
            {t('partnersPageTitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t('partnersPageSubtitle')}
          </p>
        </div>

        <RestaurantsDesChefsPartnerCard />

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
