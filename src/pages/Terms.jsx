import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/i18n'; // Importation du hook de traduction

export default function Terms() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-card rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{t('footerTerms')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 mt-8 prose prose-invert">
        <h2 className="text-2xl font-bold mb-2">{t('termsMainTitle')}</h2>
        <p className="text-sm text-muted-foreground mb-8">{t('termsLastUpdate')}</p>

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">{t('termsSection1Title')}</h3>
          <p className="text-sm leading-relaxed">
            {t('termsSection1Content')}
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">{t('termsSection2Title')}</h3>
          <p className="text-sm leading-relaxed mb-2">
            <strong>{t('termsSection2Sub1Title')} :</strong> {t('termsSection2Sub1Content')}
          </p>
          <p className="text-sm leading-relaxed">
            <strong>{t('termsSection2Sub2Title')} :</strong> {t('termsSection2Sub2Content')}
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-primary">{t('termsSection3Title')}</h3>
          <p className="text-sm leading-relaxed">
            {t('termsSection3Content')}
            <br />
            <strong> {t('termsSection3AllergiesTitle')} :</strong> {t('termsSection3AllergiesContent')}
          </p>
        </section>

        <section className="mb-8 border-t border-border pt-6">
          <h3 className="text-lg font-semibold mb-3">{t('termsLegalTitle')}</h3>
          <div className="bg-card rounded-xl p-4 text-sm space-y-2">
            <p><span className="text-muted-foreground">{t('legalPublisher')} :</span> FreshRescue Management</p>
            <p><span className="text-muted-foreground">{t('legalHeadquarters')} :</span> Zürich, {t('legalCountry')}</p>
            <p><span className="text-muted-foreground">{t('legalContact')} :</span> contact.applimanagement@gmail.com</p>
            <p><span className="text-muted-foreground">{t('legalLaw')} :</span> {t('legalSwissLaw')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}