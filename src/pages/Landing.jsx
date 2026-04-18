import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, Zap, MapPin, 
  TrendingUp, ShieldCheck, Leaf, Store, Smartphone, Share, HelpCircle, Globe 
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';

const HERO_BG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop';

/** Visuels « Comment ça marche » — fichiers dans `public/images/how/` */
const howImg = (file) => `${import.meta.env.BASE_URL}images/how/${file}`;
const HOW_STEP1_IMG = howImg('step-01.png');
const HOW_STEP2_IMG = howImg('step-02.png');
const HOW_STEP3_IMG = howImg('step-03.png');

export default function Landing() {
  const { t, lang, setLanguage } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const installZoneRef = useRef(null);
  const installFromQr = searchParams.get('install') === '1';

  const promoText = {
    fr: { free: '1 mois OFFERT', test: 'Essayer !', hundredFree: '100% GRATUIT' },
    it: { free: '1 mese OFFERTO', test: 'Prova!', hundredFree: '100% GRATUITO' },
    de: { free: '1 Monat GRATIS', test: 'Jetzt testen!', hundredFree: '100% GRATIS' },
    ru: { free: '1 месяц БЕСПЛАТНО', test: 'Попробуй !', hundredFree: '100% БЕСПЛАТНО' },
    en: { free: '1 month FREE', test: 'Test it !', hundredFree: '100% FREE' }
  }[lang] || { free: '1 month FREE', test: 'Test it !', hundredFree: '100% FREE' };

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  /** Lien /?install=1 (ex. QR) : même flux que le bandeau — scroll + ouverture de la boîte d’installation si le navigateur l’autorise */
  useEffect(() => {
    if (!installFromQr) return;
    const scroll = () =>
      installZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const id = window.setTimeout(scroll, 80);
    return () => clearTimeout(id);
  }, [installFromQr]);

  useEffect(() => {
    if (!installFromQr || !deferredPrompt) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
      } catch {
        /* Certains navigateurs exigent un geste utilisateur : le bandeau reste visible */
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('install');
          return next;
        },
        { replace: true }
      );
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [installFromQr, deferredPrompt, setSearchParams]);

  /** Nettoie l’URL si aucune invite d’installation ne viendra (desktop, iOS, déjà installé…) */
  useEffect(() => {
    if (!installFromQr || deferredPrompt) return;
    const timer = window.setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('install');
          return next;
        },
        { replace: true }
      );
    }, 8000);
    return () => clearTimeout(timer);
  }, [installFromQr, deferredPrompt, setSearchParams]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const pricingPlans = [
    {
      title: 'planSingleMonth',
      price: '29,9',
      subtext: 'oneMonth',
      description: 'descSingle',
      highlight: false
    },
    {
      title: 'planSubscription',
      price: '29,9',
      subtext: 'perMonth',
      description: 'descSubscription',
      highlight: true
    },
    {
      title: 'planYearly',
      price: '299',
      subtext: 'twoMonthsFree',
      description: 'descYearly',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-earth text-foreground">
      {/* HEADER AVEC LOGO ET ROLLER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-earth/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-citrus flex items-center justify-center shadow-lg shadow-citrus/20">
              <Leaf className="w-6 h-6 text-earth" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Fresh<span className="text-citrus">Rescue</span></span>
          </div>

          <div className="flex items-center gap-4">
            {/* LE ROLLER DE LANGUE CORRIGÉ */}
<div className="relative group">
  <select
    value={lang}
    onChange={(e) => setLanguage(e.target.value)}
    className="appearance-none bg-white/10 border border-white/20 rounded-full pl-10 pr-8 py-2 text-sm font-bold cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-citrus/50 text-foreground"
    style={{ backgroundColor: '#1a1a1a', color: 'white' }} // Force le fond sombre et texte blanc pour le menu
  >
    <option value="en" className="bg-earth text-white">EN</option>
    <option value="fr" className="bg-earth text-white">FR</option>
    <option value="it" className="bg-earth text-white">IT</option>
    <option value="de" className="bg-earth text-white">DE</option>
    <option value="ru" className="bg-earth text-white">RU</option>
  </select>
  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-citrus" />
  
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <Link 
              to="/merchant" 
              className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full text-sm font-bold transition-all border border-white/10"
            >
              <Store className="w-4 h-4 text-citrus" />
              {t('merchantLogin')}
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <div
          ref={installZoneRef}
          id="pwa-install-zone"
          className="scroll-mt-28 space-y-3"
        >
          {deferredPrompt && (
            <div className="bg-citrus rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-citrus/20 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-earth rounded-xl flex items-center justify-center shadow-inner">
                  <Smartphone className="w-5 h-5 text-citrus" />
                </div>
                <div>
                  <p className="text-earth font-black text-sm">{t('pwaInstallTitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                className="bg-earth text-citrus px-5 py-2 rounded-full font-black text-xs hover:scale-105 transition-transform uppercase"
              >
                {t('pwaInstallBtn')}
              </button>
            </div>
          )}

          {isIOS && (
            <div className="bg-muted/50 border border-border rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-10 h-10 bg-citrus rounded-xl flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-earth" />
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-foreground">{t('iosInstallTitle')}</p>
                <div className="text-muted-foreground flex items-center flex-wrap gap-1">
                  {t('iosInstallDescBefore')}
                  <Share className="w-3 h-3 inline" />
                  {t('iosInstallDescAfter')}
                  <span className="font-bold text-citrus">"{t('iosInstallTarget')}"</span>.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-earth/60 via-transparent to-earth" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-96 h-96 rounded-full border border-citrus/10 animate-pulse-ring" />
          <div className="absolute inset-8 rounded-full border border-citrus/15 animate-pulse-ring [animation-delay:0.5s]" />
          <div className="absolute inset-16 rounded-full border border-citrus/20 animate-pulse-ring [animation-delay:1s]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-stem/10 border border-stem/30 rounded-full px-4 py-2 mb-8">
            <Leaf className="w-4 h-4 text-stem" />
            <span className="text-sm font-semibold text-stem">{t('brandTagline')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-8">
            {t('heroTitle').split('. ').map((part, i) => (
              <span key={i} className={i === 1 ? 'block text-citrus' : 'block text-foreground'}>
                {part}{i === 0 ? '.' : ''}
              </span>
            ))}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <Link
                  to="/explore"
                  className="flex items-center gap-2 bg-citrus text-earth px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-citrus/20"
                >
                  {t('exploreCta')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-citrus animate-pulse">
                  {promoText.hundredFree}
                </span>
              </div>

              <div className="relative">
                <div className="absolute -bottom-6 -right-2 bg-earth text-citrus px-3 py-1 rounded-xl shadow-xl rotate-12 animate-pulse border border-citrus flex flex-col items-center z-20 pointer-events-none">
                  <span className="text-[9px] font-black leading-none whitespace-nowrap uppercase">{promoText.free}</span>
                  <span className="text-[8px] font-bold uppercase tracking-tighter opacity-80">{promoText.test}</span>
                </div>
                <Link
                  to="/merchant"
                  className="flex items-center gap-2 bg-card border-2 border-border text-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-border/40 transition-all"
                >
                  <Store className="w-5 h-5 text-citrus" />
                  {t('merchantCta')}
                </Link>
              </div>
            </div>

            <Link 
              to="/instructions" 
              className="group flex items-center gap-2 text-muted-foreground hover:text-citrus transition-colors text-sm font-bold uppercase tracking-wider"
            >
              <HelpCircle className="w-5 h-5 group-hover:animate-bounce" />
              {lang === 'fr' ? 'Comment ça marche ?' : lang === 'de' ? 'Wie funktioniert das?' : lang === 'ru' ? 'Как это работает?' : lang === 'it' ? 'Come funciona?' : 'How it works?'}
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { num: '5', unit: 'km', label: t('notificationRadius') },
              { num: '0', unit: '%', label: t('commissionOnSales') },
              { num: '35', unit: '%', label: t('averageDiscount') },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-citrus">
                  {stat.num}<span className="text-stem">{stat.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reste du code (How it works, Benefits, Pricing, Footer) inchangé */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('howItWorks')}</h2>
            <div className="w-16 h-1 bg-citrus mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-7 h-7 text-earth" />,
                bg: 'bg-citrus',
                num: '01',
                title: t('step1Title'),
                desc: t('step1Desc'),
                img: HOW_STEP1_IMG,
              },
              {
                icon: <MapPin className="w-7 h-7 text-earth" />,
                bg: 'bg-stem',
                num: '02',
                title: t('step2Title'),
                desc: t('step2Desc'),
                img: HOW_STEP2_IMG,
              },
              {
                icon: <TrendingUp className="w-7 h-7 text-earth" />,
                bg: 'bg-citrus',
                num: '03',
                title: t('step3Title'),
                desc: t('step3Desc'),
                img: HOW_STEP3_IMG,
              },
            ].map((step, i) => (
              <div 
                key={i} 
                className="group relative rounded-3xl overflow-hidden bg-card border border-border hover:border-citrus/30 transition-all"
              >
                <div className="relative h-52 sm:h-56 overflow-hidden bg-muted/30">
                  <img
                    src={step.img}
                    alt=""
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/90" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${step.bg} flex items-center justify-center`}>
                      {step.icon}
                    </div>
                    <span className="text-4xl font-black text-border">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-citrus p-10 text-earth relative overflow-visible">
            <div className="absolute -top-6 -right-4 bg-earth text-citrus px-4 py-2 rounded-2xl shadow-2xl rotate-12 animate-pulse border-2 border-citrus flex flex-col items-center z-20 pointer-events-none">
              <span className="text-[14px] font-black leading-none uppercase">{promoText.free}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{promoText.test}</span>
            </div>

            <div className="w-12 h-12 bg-earth/10 rounded-2xl flex items-center justify-center mb-6">
              <Store className="w-6 h-6 text-earth" />
            </div>
            <h3 className="text-3xl font-black mb-8">{t('forMerchants')}</h3>
            <ul className="space-y-4">
              {[t('merchantBenefit1'), t('merchantBenefit2'), t('merchantBenefit3'), t('merchantBenefit4')].map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-earth" />
                  <span className="font-semibold text-lg">{b}</span>
                </li>
              ))}
            </ul>
            <Link to="/merchant" className="inline-flex items-center gap-2 mt-10 bg-earth text-foreground px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
              {t('getStarted')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-3xl bg-card border border-border p-10">
            <div className="w-12 h-12 bg-stem/10 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6 text-stem" />
            </div>
            <h3 className="text-3xl font-black mb-8">{t('forCustomers')}</h3>
            <ul className="space-y-4">
              {[t('customerBenefit1'), t('customerBenefit2'), t('customerBenefit3'), t('customerBenefit4')].map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-stem" />
                  <span className="font-semibold text-lg text-foreground">{b}</span>
                </li>
              ))}
            </ul>
            <Link to="/explore" className="inline-flex items-center gap-2 mt-10 bg-stem text-earth px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
              {t('exploreCta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`rounded-3xl bg-card border-2 ${plan.highlight ? 'border-citrus shadow-xl shadow-citrus/10' : 'border-citrus/40'} p-10 text-center relative overflow-hidden flex flex-col`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-citrus via-stem to-citrus" />
              
              <div className="inline-flex items-center justify-center gap-2 bg-citrus/10 border border-citrus/30 rounded-full px-4 py-2 mb-6 w-fit mx-auto">
                <ShieldCheck className="w-4 h-4 text-citrus" />
                <span className="text-[10px] font-bold text-citrus uppercase tracking-widest">{t(plan.title)}</span>
              </div>

              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-foreground">{plan.price}</span>
                <span className="text-xl font-bold text-citrus">CHF</span>
              </div>
              <div className="text-citrus font-bold uppercase tracking-widest text-sm mt-1">
                {t(plan.subtext)}
              </div>
              <p className="text-muted-foreground text-sm mt-4 min-h-[3rem]">
                {t(plan.description)}
              </p>

              <ul className="space-y-3 mb-10 text-left max-w-xs mx-auto flex-grow border-t border-border/50 pt-8 mt-6">
                {[
                  'featureUnlimited',
                  'featureGeo',
                  'featureStock',
                  'featureZeroComm',
                  'featureSupport'
                ].map((featureKey, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-citrus flex-shrink-0" />
                    <span className="font-medium text-foreground text-sm">
                      {t(featureKey)}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/merchant"
                className="inline-flex items-center justify-center gap-2 bg-citrus text-earth px-8 py-4 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-citrus/30 w-full"
              >
                {t('getStarted')} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6 bg-card/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-citrus flex items-center justify-center">
                <Leaf className="w-4 h-4 text-earth" />
              </div>
              <span className="text-lg font-black">Fresh<span className="text-citrus">Rescue</span></span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase italic tracking-wider">
              {t('footerTagline')}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex gap-6">
              <Link 
                to="/terms" 
                className="text-xs font-black uppercase italic text-muted-foreground hover:text-citrus transition-colors underline decoration-citrus/20 underline-offset-4"
              >
                {t('footerTerms')}
              </Link>
            </div>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">
              © 2026 FreshRescue. {t('footerRights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}