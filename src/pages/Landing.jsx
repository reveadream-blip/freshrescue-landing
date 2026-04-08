import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, ArrowRight, Zap, MapPin, 
  TrendingUp, ShieldCheck, Leaf, Store, Smartphone, Share 
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import Navbar from '../components/Navbar';

const HERO_BG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop';
const BAKERY_IMG = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop';
const FRUIT_IMG = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop';
const VEGGIE_IMG = 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=800&auto=format&fit=crop';

export default function Landing() {
  const { t, lang } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />

      {/* BANNIÈRE INSTALLATION PWA */}
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        {deferredPrompt && (
          <div className="bg-citrus rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-citrus/20 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-earth rounded-xl flex items-center justify-center shadow-inner">
                <Smartphone className="w-5 h-5 text-citrus" />
              </div>
              <div>
                <p className="text-earth font-black text-sm">{t('pwaInstallTitle')}</p>
                <p className="text-earth/70 text-[10px] font-bold">{t('pwaInstallDesc')}</p>
              </div>
            </div>
            <button 
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

      {/* HERO */}
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
            <span className="text-sm font-semibold text-stem">FreshRescue</span>
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/explore"
              className="flex items-center gap-2 bg-citrus text-earth px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-citrus/20"
            >
              {t('exploreCta')}
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* BOUTON COMMERÇANT AJOUTÉ ICI */}
            <Link
              to="/merchant"
              className="flex items-center gap-2 bg-card border-2 border-border text-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-border/40 transition-all"
            >
              <Store className="w-5 h-5 text-citrus" />
              {t('merchantCta')}
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { num: '10', unit: 'km', label: t('notificationRadius') },
              { num: '0', unit: '%', label: t('commissionOnSales') },
              { num: '70', unit: '%', label: t('averageDiscount') },
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

      {/* HOW IT WORKS */}
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
                img: BAKERY_IMG,
              },
              {
                icon: <MapPin className="w-7 h-7 text-earth" />,
                bg: 'bg-stem',
                num: '02',
                title: t('step2Title'),
                desc: t('step2Desc'),
                img: FRUIT_IMG,
              },
              {
                icon: <TrendingUp className="w-7 h-7 text-earth" />,
                bg: 'bg-citrus',
                num: '03',
                title: t('step3Title'),
                desc: t('step3Desc'),
                img: VEGGIE_IMG,
              },
            ].map((step, i) => (
              <div 
                key={i} 
                className="group relative rounded-3xl overflow-hidden bg-card border border-border hover:border-citrus/30 transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80" />
                  <div className="absolute inset-0 h-48 bg-gradient-to-b from-transparent to-card" />
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

      {/* FOR MERCHANTS vs CUSTOMERS */}
      <section className="py-28 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-citrus p-10 text-earth">
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

      {/* SUBSCRIPTION */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-3xl bg-card border-2 border-citrus/40 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-citrus via-stem to-citrus" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-citrus/5 rounded-full" />

            <div className="inline-flex items-center gap-2 bg-citrus/10 border border-citrus/30 rounded-full px-4 py-2 mb-6">
              <ShieldCheck className="w-4 h-4 text-citrus" />
              <span className="text-sm font-bold text-citrus">{t('subscriptionTitle')}</span>
            </div>

            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-7xl font-black text-foreground">{t('subscriptionPrice')}</span>
              <span className="text-2xl font-bold text-citrus">{t('subscriptionCurrency')}</span>
            </div>
            <p className="text-muted-foreground mb-10 text-lg">{t('subscriptionDesc')}</p>

            <ul className="space-y-3 mb-10 text-left max-w-xs mx-auto">
              {[
                t('subscriptionFeature1'),
                t('subscriptionFeature2'),
                t('subscriptionFeature3'),
                t('subscriptionFeature4'),
                t('subscriptionFeature5'),
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-citrus/15 border border-citrus/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-citrus" />
                  </div>
                  <span className="font-medium text-foreground">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/merchant"
              className="inline-flex items-center gap-2 bg-citrus text-earth px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-xl shadow-citrus/30"
            >
              {t('getStarted')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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