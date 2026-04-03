import { useTranslation } from '../lib/i18n';
import { Leaf } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

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
          <p className="text-sm text-muted-foreground">{t('footerTagline')}</p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FreshRescue. {t('footerRights')}
          </p>
        </div>
      </div>
    </footer>
  );
}