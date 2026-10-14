import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';
import { Leaf } from 'lucide-react';
import { PUBLIC } from '../lib/publicPaths';

export default function Footer() {
  const { t } = useTranslation();

  const links = [
    { to: PUBLIC.explore, label: t('explore') },
    { to: PUBLIC.partenaires, label: t('navPartners') },
    { to: PUBLIC.actualites, label: t('navNews') },
    { to: PUBLIC.blog, label: t('footerBlog') },
    { to: PUBLIC.instructions, label: t('footerInstructions') },
    { to: PUBLIC.merchant, label: t('merchantLogin') },
    { to: PUBLIC.terms, label: t('footerTerms') },
  ];

  return (
    <footer className="border-t border-border/30 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold">
              Fresh<span className="text-primary">Rescue</span>
            </span>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">{t('footerTagline')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              © {new Date().getFullYear()} FreshRescue. {t('footerRights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
