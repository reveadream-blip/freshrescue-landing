import { Link, useLocation } from 'react-router-dom';
import { Leaf, Store } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../lib/i18n';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const isMerchant = location.pathname.startsWith('/merchant');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-earth/80 backdrop-blur-xl border-b border-border/30">
      <Link to="/" className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-citrus">
          <Leaf className="w-5 h-5 text-earth" />
        </div>
        <span className="text-xl font-black tracking-tight text-foreground">
          Fresh<span className="text-citrus">Rescue</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          to="/explore"
          className={`hidden md:block text-sm font-semibold transition-colors ${
            location.pathname === '/explore' ? 'text-citrus' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('explore')}
        </Link>

        <LanguageSwitcher />

        <Link
          to="/merchant"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm font-semibold text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Store className="w-4 h-4" />
          <span className="hidden sm:block">{t('merchantLogin')}</span>
        </Link>
      </div>
    </nav>
  );
}