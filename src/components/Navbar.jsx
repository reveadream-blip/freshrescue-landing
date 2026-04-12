import { Link, useLocation } from 'react-router-dom';
import { Leaf, Store, Globe } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export default function Navbar() {
  const { t, lang, setLanguage } = useTranslation();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 md:px-6 py-4 bg-earth/80 backdrop-blur-xl border-b border-border/30">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-citrus shadow-lg shadow-citrus/20">
          <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-earth" />
        </div>
        <span className="text-lg sm:text-xl font-black tracking-tight text-foreground">
          Fresh<span className="text-citrus">Rescue</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          to="/explore"
          className={`hidden md:block text-xs font-black uppercase italic tracking-widest transition-colors ${
            location.pathname === '/explore' ? 'text-citrus' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('explore')}
        </Link>

        {/* --- ROLLER DE LANGUE AVEC FOND NOIR --- */}
        <div className="relative flex-shrink-0 group">
          <select
            value={lang}
            onChange={(e) => setLanguage(e.target.value)}
            // Changement : bg-[#1a1a1a] pour le noir et ajout de style pour les options
            className="appearance-none bg-[#1a1a1a] border border-border rounded-full pl-8 pr-8 py-1.5 text-[10px] font-black uppercase tracking-tighter cursor-pointer hover:border-citrus/50 transition-all focus:outline-none text-foreground"
          >
            <option value="en" className="bg-[#1a1a1a]">EN</option>
            <option value="fr" className="bg-[#1a1a1a]">FR</option>
            <option value="it" className="bg-[#1a1a1a]">IT</option>
            <option value="th" className="bg-[#1a1a1a]">TH</option>
            <option value="ru" className="bg-[#1a1a1a]">RU</option>
          </select>
          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-citrus" />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3 h-3 text-muted-foreground group-hover:text-citrus transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <Link
          to="/merchant"
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-muted border border-border text-[10px] sm:text-xs font-black uppercase italic transition-all flex-shrink-0 hover:bg-citrus hover:text-earth hover:border-citrus"
        >
          <Store className="w-3.5 h-3.5 sm:w-4 h-4" />
          <span className="hidden sm:block">{t('merchantLogin')}</span>
        </Link>
      </div>
    </nav>
  );
}