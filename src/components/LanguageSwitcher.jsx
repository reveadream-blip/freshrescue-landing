import { useTranslation } from '../lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useTranslation();

  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'th', label: 'TH' },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted/50 backdrop-blur-md rounded-full px-2 py-1 border border-border/50">
      <Globe className="w-3.5 h-3.5 text-muted-foreground mr-1" />
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
            lang === l.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}