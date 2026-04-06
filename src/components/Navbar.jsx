import { Link, useLocation } from 'react-router-dom';
import { Leaf, Store } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../lib/i18n';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const isMerchant = location.pathname.startsWith('/merchant');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 md:px-6 py-4 bg-earth/80 backdrop-blur-xl border-b border-border/30">
      {/* Logo : On réduit un peu l'espace sur mobile pour laisser de la place au reste */}
      <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-citrus">
          <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-earth" />
        </div>
        <span className="text-lg sm:text-xl font-black tracking-tight text-foreground">
          Fresh<span className="text-citrus">Rescue</span>
        </span>
      </Link>

      {/* Conteneur de droite : On resserre le gap pour le mobile */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          to="/explore"
          className={`hidden md:block text-sm font-semibold transition-colors ${
            location.pathname === '/explore' ? 'text-citrus' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('explore')}
        </Link>

        {/* Le sélecteur de langue ne doit pas rétrécir */}
        <div className="flex-shrink-0">
          <LanguageSwitcher />
        </div>

        <Link
          to="/merchant"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-muted border border-border text-xs sm:text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all flex-shrink-0"
        >
          <Store className="w-3.5 h-3.5 sm:w-4 h-4" />
          <span className="hidden sm:block">{t('merchantLogin')}</span>
        </Link>
      </div>
    </nav>
  );
}