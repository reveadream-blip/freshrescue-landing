import { useTranslation } from '../lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useTranslation();

  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'th', label: 'TH' },
    { code: 'ru', label: 'RU' },
    { code: 'it', label: 'IT' },
      ];

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 backdrop-blur-md rounded-full px-1.5 py-1 border border-border/50">
      {/* On cache l'icône Globe sur tout petit écran pour gagner de la place */}
      <Globe className="hidden xs:block w-3 h-3 text-muted-foreground mr-0.5" />
      
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
            lang === l.code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}