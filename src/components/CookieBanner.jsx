import { useCallback, useEffect, useState } from 'react';

/**
 * Banniere de consentement cookies conforme RGPD (UE) et nLPD (Suisse).
 *
 * Fonctionnement :
 * - Au premier chargement, tout est "denied" via Consent Mode v2 (dans index.html).
 * - Ce composant lit le choix stocke dans localStorage et le re-applique via gtag('consent', 'update', ...).
 * - Si aucun choix : affiche la banniere.
 * - L'utilisateur peut re-ouvrir les parametres via un evenement `openCookieSettings`
 *   (ex. depuis le footer).
 */

const STORAGE_KEY = 'freshrescue_cookie_consent_v1';
const STORAGE_VERSION = 1;

// Traductions inline : la banniere doit rester autonome du systeme i18n principal
// (elle peut apparaitre sur des routes qui ne chargent pas le Provider).
const T = {
  fr: {
    title: 'Nous respectons votre vie privée',
    desc:
      "Nous utilisons des cookies pour mesurer l'audience de FreshRescue.app et améliorer notre application suisse anti-gaspillage. Vous pouvez accepter, refuser ou personnaliser vos choix. Vous pourrez revenir sur votre décision à tout moment depuis le lien « Cookies » en bas de page.",
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout refuser',
    customize: 'Personnaliser',
    save: 'Enregistrer mes choix',
    back: 'Retour',
    close: 'Fermer',
    necessaryTitle: 'Cookies nécessaires',
    necessaryDesc:
      "Indispensables au fonctionnement du site (sécurité, préférences de langue). Toujours actifs.",
    analyticsTitle: 'Mesure d’audience (Google Analytics)',
    analyticsDesc:
      "Nous aide à comprendre comment les visiteurs utilisent le site pour l’améliorer. Données anonymisées.",
    marketingTitle: 'Marketing',
    marketingDesc:
      'Cookies publicitaires tiers. Désactivés par défaut, nous ne les utilisons pas aujourd’hui.',
    always: 'Toujours actif',
    learnMore: 'En savoir plus',
  },
  de: {
    title: 'Wir respektieren Ihre Privatsphäre',
    desc:
      'Wir verwenden Cookies, um die Nutzung von FreshRescue.app zu messen und unsere Schweizer Anti-Food-Waste-App zu verbessern. Sie können akzeptieren, ablehnen oder Ihre Auswahl anpassen. Sie können Ihre Entscheidung jederzeit über den Link „Cookies" am Seitenende ändern.',
    acceptAll: 'Alle akzeptieren',
    rejectAll: 'Alle ablehnen',
    customize: 'Anpassen',
    save: 'Meine Auswahl speichern',
    back: 'Zurück',
    close: 'Schliessen',
    necessaryTitle: 'Notwendige Cookies',
    necessaryDesc:
      'Unverzichtbar für den Betrieb der Website (Sicherheit, Spracheinstellungen). Immer aktiv.',
    analyticsTitle: 'Besucherstatistik (Google Analytics)',
    analyticsDesc:
      'Hilft uns zu verstehen, wie Besucher die Website nutzen, um sie zu verbessern. Anonymisierte Daten.',
    marketingTitle: 'Marketing',
    marketingDesc:
      'Werbe-Cookies von Drittanbietern. Standardmässig deaktiviert, wir nutzen sie aktuell nicht.',
    always: 'Immer aktiv',
    learnMore: 'Mehr erfahren',
  },
  it: {
    title: 'Rispettiamo la tua privacy',
    desc:
      "Utilizziamo cookie per misurare l'uso di FreshRescue.app e migliorare la nostra app svizzera antispreco. Puoi accettare, rifiutare o personalizzare le tue scelte. Puoi cambiare idea in qualsiasi momento dal link «Cookie» in fondo alla pagina.",
    acceptAll: 'Accetta tutto',
    rejectAll: 'Rifiuta tutto',
    customize: 'Personalizza',
    save: 'Salva le mie scelte',
    back: 'Indietro',
    close: 'Chiudi',
    necessaryTitle: 'Cookie necessari',
    necessaryDesc:
      'Indispensabili al funzionamento del sito (sicurezza, preferenze linguistiche). Sempre attivi.',
    analyticsTitle: 'Misurazione audience (Google Analytics)',
    analyticsDesc:
      "Ci aiuta a capire come i visitatori usano il sito per migliorarlo. Dati anonimizzati.",
    marketingTitle: 'Marketing',
    marketingDesc:
      'Cookie pubblicitari di terze parti. Disattivati di default, attualmente non li usiamo.',
    always: 'Sempre attivo',
    learnMore: 'Scopri di più',
  },
  en: {
    title: 'We respect your privacy',
    desc:
      "We use cookies to measure usage of FreshRescue.app and improve our Swiss anti-food-waste app. You can accept, reject or customize your choices. You can change your mind anytime via the 'Cookies' link in the footer.",
    acceptAll: 'Accept all',
    rejectAll: 'Reject all',
    customize: 'Customize',
    save: 'Save my choices',
    back: 'Back',
    close: 'Close',
    necessaryTitle: 'Necessary cookies',
    necessaryDesc:
      'Required for the site to work (security, language preferences). Always active.',
    analyticsTitle: 'Audience measurement (Google Analytics)',
    analyticsDesc:
      'Helps us understand how visitors use the site so we can improve it. Anonymized data.',
    marketingTitle: 'Marketing',
    marketingDesc:
      "Third-party advertising cookies. Disabled by default, we don't use them today.",
    always: 'Always active',
    learnMore: 'Learn more',
  },
  ru: {
    title: 'Мы уважаем вашу конфиденциальность',
    desc:
      'Мы используем cookie, чтобы измерять использование FreshRescue.app и улучшать наше швейцарское приложение против пищевых отходов. Вы можете принять, отклонить или настроить выбор. Изменить решение можно в любое время через ссылку «Cookies» внизу страницы.',
    acceptAll: 'Принять всё',
    rejectAll: 'Отклонить всё',
    customize: 'Настроить',
    save: 'Сохранить выбор',
    back: 'Назад',
    close: 'Закрыть',
    necessaryTitle: 'Необходимые cookie',
    necessaryDesc:
      'Нужны для работы сайта (безопасность, языковые настройки). Всегда активны.',
    analyticsTitle: 'Аналитика (Google Analytics)',
    analyticsDesc:
      'Помогает нам понять, как посетители используют сайт, чтобы улучшить его. Данные анонимизированы.',
    marketingTitle: 'Маркетинг',
    marketingDesc:
      'Сторонние рекламные cookie. Отключены по умолчанию, сейчас мы их не используем.',
    always: 'Всегда активно',
    learnMore: 'Узнать больше',
  },
};

function getCurrentLang() {
  if (typeof window === 'undefined') return 'fr';
  const raw = localStorage.getItem('freshrescue_lang') || 'fr';
  const lang = raw === 'th' ? 'de' : raw;
  return T[lang] ? lang : 'fr';
}

function applyConsent({ analytics, marketing }) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  });
}

function loadStoredConsent() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent({ analytics, marketing }) {
  if (typeof window === 'undefined') return;
  const payload = {
    version: STORAGE_VERSION,
    analytics: !!analytics,
    marketing: !!marketing,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [lang, setLang] = useState('fr');

  // Initialisation : rejoue le choix stocke, sinon affiche la banniere
  useEffect(() => {
    setLang(getCurrentLang());
    const stored = loadStoredConsent();
    if (stored) {
      applyConsent({ analytics: stored.analytics, marketing: stored.marketing });
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
    } else {
      setVisible(true);
    }
  }, []);

  // Ecoute l'evenement "openCookieSettings" pour reouvrir la banniere depuis ailleurs (footer)
  useEffect(() => {
    const openHandler = () => {
      setLang(getCurrentLang());
      const stored = loadStoredConsent();
      if (stored) {
        setAnalytics(stored.analytics);
        setMarketing(stored.marketing);
      }
      setShowDetails(true);
      setVisible(true);
    };
    window.addEventListener('openCookieSettings', openHandler);
    return () => window.removeEventListener('openCookieSettings', openHandler);
  }, []);

  const handleAcceptAll = useCallback(() => {
    applyConsent({ analytics: true, marketing: true });
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    applyConsent({ analytics: false, marketing: false });
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
  }, []);

  const handleSave = useCallback(() => {
    applyConsent({ analytics, marketing });
    saveConsent({ analytics, marketing });
    setVisible(false);
    setShowDetails(false);
  }, [analytics, marketing]);

  if (!visible) return null;

  const t = T[lang] || T.fr;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
    >
      <div className="max-w-4xl mx-auto bg-earth border border-citrus/30 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {!showDetails ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white mb-2">{t.title}</h2>
                <p className="text-sm text-white/75 leading-relaxed">{t.desc}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-5">
              <button
                onClick={handleAcceptAll}
                className="order-1 sm:order-3 px-5 py-2.5 rounded-full bg-citrus text-black text-sm font-semibold hover:opacity-90 transition"
              >
                {t.acceptAll}
              </button>
              <button
                onClick={handleRejectAll}
                className="order-2 sm:order-2 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-sm font-semibold text-white hover:border-white/40 transition"
              >
                {t.rejectAll}
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="order-3 sm:order-1 px-5 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white underline underline-offset-2 transition"
              >
                {t.customize}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-white mb-4">{t.customize}</h2>

            <div className="space-y-3">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">
                      {t.necessaryTitle}
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      {t.necessaryDesc}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-white/50 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                    {t.always}
                  </span>
                </div>
              </div>

              <label className="block bg-white/[0.03] border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/[0.05] transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">
                      {t.analyticsTitle}
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      {t.analyticsDesc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="shrink-0 mt-1 w-5 h-5 rounded accent-citrus cursor-pointer"
                  />
                </div>
              </label>

              <label className="block bg-white/[0.03] border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/[0.05] transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">
                      {t.marketingTitle}
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      {t.marketingDesc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="shrink-0 mt-1 w-5 h-5 rounded accent-citrus cursor-pointer"
                  />
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-5">
              <button
                onClick={handleSave}
                className="order-1 sm:order-3 px-5 py-2.5 rounded-full bg-citrus text-black text-sm font-semibold hover:opacity-90 transition"
              >
                {t.save}
              </button>
              <button
                onClick={handleAcceptAll}
                className="order-2 sm:order-2 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/15 text-sm font-semibold text-white hover:border-white/40 transition"
              >
                {t.acceptAll}
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="order-3 sm:order-1 px-5 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white underline underline-offset-2 transition"
              >
                {t.back}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
