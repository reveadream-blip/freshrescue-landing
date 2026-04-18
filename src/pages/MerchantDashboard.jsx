import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, ToggleLeft, ToggleRight, Trash2, Store, 
  Crown, Edit, ArrowLeft, Home, CheckCircle2, Globe, Leaf
} from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import SafeOfferImage from '@/components/SafeOfferImage';
import { deletePhotoFromLogosBucket } from '@/lib/supabaseStorage';
import {
  TRIAL_DAYS,
  trialCurrentDay,
  trialDaysRemaining,
  hasActivePaidSubscription,
  canMerchantPublish,
  ensureMerchantTrialRow,
} from '@/lib/merchantSubscription';
import { getStripePaymentLinkUrls } from '@/lib/stripePaymentLinks';

function premiumRenewalHint(profile, t) {
  const plan = profile?.subscription_plan;
  if (plan === 'recurring_monthly') return t('premiumRenewsMonthly');
  if (plan === 'yearly_subscription') return t('premiumRenewsYearly');
  if (plan === 'one_month') return t('premiumOneMonthNote');
  if (plan === 'yearly_onetime') return t('premiumYearlyOnetimeNote');
  if (profile?.stripe_subscription_id) return t('premiumRenewsMonthly');
  return t('premiumRenewalDefault');
}

// --- COMPOSANT BANNIÈRE & SÉLECTEUR DE FORMULES ---
function SubscriptionBanner({ profile }) {
  const { t } = useTranslation();
  const stripeLinks = getStripePaymentLinkUrls();
  if (!profile) return null;

  const subscriptionEnd = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
  const isPaid = hasActivePaidSubscription(profile);
  const ref = `?client_reference_id=${profile.user_id}`;

  if (isPaid) {
    return (
      <div className="space-y-3 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-bold text-emerald-500 uppercase italic">
              {t('premiumActive')}
            </p>
          </div>
          {subscriptionEnd && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full font-bold w-fit">
              {t('premiumValidUntil')} {subscriptionEnd.toLocaleDateString()}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed px-1">
          {premiumRenewalHint(profile, t)}
        </p>
      </div>
    );
  }

  const daysLeft = profile.trial_start_date ? trialDaysRemaining(profile.trial_start_date) : 0;
  const dayNum = profile.trial_start_date ? trialCurrentDay(profile.trial_start_date) : 1;

  return (
    <div className="p-6 rounded-[2.5rem] bg-card border border-border mb-8 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Crown className="w-32 h-32" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-lg ${daysLeft > 0 ? 'bg-citrus text-earth' : 'bg-red-600 text-white'}`}>
          {daysLeft}
        </div>
        <div>
          <h3 className="font-black uppercase italic text-lg leading-tight">
            {daysLeft > 0 ? t('trialInProgress') : t('trialEnded')}
          </h3>
          <p className="text-[10px] font-bold text-citrus/90 uppercase tracking-widest mt-1">
            {t('trialDayCounterFmt')
              .replace('{day}', String(dayNum))
              .replace('{total}', String(TRIAL_DAYS))}
          </p>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {daysLeft > 0 ? t('trialDesc') : t('trialExpiredDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href={`${stripeLinks.recurring}${ref}`} target="_blank" rel="noopener noreferrer"
           className="group p-5 rounded-3xl border border-border hover:border-citrus transition-all bg-white/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <p className="font-black italic uppercase text-sm">{t('planRecurring')}</p>
              <Crown className="w-4 h-4 text-citrus opacity-50" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight mb-2">{t('descRecurring')}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-black text-citrus italic tracking-tighter">29,9</span>
              <span className="text-[9px] font-bold text-citrus/80 uppercase">
                {t('currencyCHF')} / {t('month')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-black uppercase italic text-citrus">{t('subscribe')}</span>
            <Plus className="w-4 h-4 text-citrus group-hover:rotate-90 transition-transform" />
          </div>
        </a>

        <a href={`${stripeLinks.monthlyOnetime}${ref}`} target="_blank" rel="noopener noreferrer"
           className="group p-5 rounded-3xl border border-border hover:border-citrus transition-all bg-white/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <p className="font-black italic uppercase text-sm">{t('planMonthly')}</p>
              <div className="px-2 py-0.5 rounded text-[8px] bg-blue-500/20 text-blue-400 font-bold">1×</div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight mb-2">{t('descMonthly')}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-black text-foreground italic tracking-tighter">29,9</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase">
                {t('currencyCHF')} / 1 {t('month')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-black uppercase italic text-citrus">{t('choose')}</span>
            <Plus className="w-4 h-4 text-citrus group-hover:rotate-90 transition-transform" />
          </div>
        </a>

        <a href={`${stripeLinks.yearly}${ref}`} target="_blank" rel="noopener noreferrer"
           className="group p-5 rounded-3xl border-2 border-citrus/30 hover:border-citrus transition-all bg-citrus/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -top-2 bg-citrus text-earth font-black text-[8px] px-8 py-1 rotate-45 uppercase">{t('promo')}</div>
          <div>
            <div className="flex justify-between items-start gap-2 mb-2">
              <p className="font-black italic uppercase text-sm leading-tight">{t('planYearly')}</p>
              <span className="shrink-0 px-2 py-0.5 rounded-md text-[8px] bg-citrus/25 text-citrus font-black uppercase tracking-tight">
                {t('twoMonthsFree')}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold leading-snug mb-2">{t('descYearly')}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-2xl font-black text-citrus italic tracking-tighter">299</span>
              <span className="text-[9px] font-bold text-citrus/80 uppercase">
                {t('currencyCHF')} / {t('year')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-black uppercase italic text-citrus">{t('takeYear')}</span>
            <Plus className="w-4 h-4 text-citrus group-hover:rotate-90 transition-transform" />
          </div>
        </a>
      </div>
    </div>
  );
}

export default function MerchantDashboard() {
  const { t, lang, setLanguage } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const canPublish = profile ? canMerchantPublish(profile) : false;

  useEffect(() => {
    const loadAndCleanData = async () => {
      if (!currentUser?.id) return;
      try {
        let profileData = (await supabase.from('merchants').select('*').eq('user_id', currentUser.id).maybeSingle()).data;

        if (!profileData) {
          profileData = await ensureMerchantTrialRow(supabase, currentUser.id);
        }

        if (profileData) {
          setProfile(profileData);

          if (!canMerchantPublish(profileData)) {
            await supabase.from('offers').update({ is_active: false }).eq('user_id', currentUser.id);
          }
        }

        const { data: offersData } = await supabase.from('offers').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });

        if (offersData) {
          const now = new Date();
          const expired = offersData.filter(o => new Date(o.collect_before) < now);
          
          if (expired.length > 0) {
            for (const off of expired) {
              await deletePhotoFromLogosBucket(off.photo_url || off.photo);
              await supabase.from('offers').delete().eq('id', off.id);
            }
            setOffers(offersData.filter(o => new Date(o.collect_before) >= now));
          } else {
            setOffers(offersData);
          }
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAndCleanData();
  }, [currentUser]);

  const toggleOffer = async (offer) => {
    if (!canPublish) return; 
    const { error } = await supabase.from('offers').update({ is_active: !offer.is_active }).eq('id', offer.id);
    if (!error) setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, is_active: !o.is_active } : o));
  };

  const deleteOffer = async (offer) => {
    if (!window.confirm(t('confirmDelete'))) return;
    await deletePhotoFromLogosBucket(offer.photo_url || offer.photo);
    const { error } = await supabase.from('offers').delete().eq('id', offer.id);
    if (!error) setOffers((prev) => prev.filter((o) => o.id !== offer.id));
  };

  if (loading) return <div className="flex justify-center py-20 text-citrus italic font-black uppercase tracking-widest">{t('loading')}</div>;

  return (
    <div className="min-h-screen bg-earth text-foreground">
      {/* HEADER FIXE AVEC LOGO ET ROLLER DE LANGUE */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-earth/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-citrus flex items-center justify-center shadow-lg shadow-citrus/20">
              <Leaf className="w-6 h-6 text-earth" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Fresh<span className="text-citrus">Rescue</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-white/10 border border-white/20 rounded-full pl-10 pr-8 py-2 text-sm font-bold cursor-pointer hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-citrus/50 text-foreground"
                style={{ backgroundColor: '#1a1a1a', color: 'white' }}
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
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-citrus transition-colors font-bold uppercase italic text-xs">
            <ArrowLeft className="w-4 h-4" /> {t('backToHome')}
          </button>
          <Link to="/" className="text-citrus"><Home className="w-5 h-5" /></Link>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic leading-none">{t('myOffers')}</h1>
            {profile && <p className="text-citrus text-sm font-bold mt-2 uppercase tracking-[0.2em]">{profile.shop_name}</p>}
          </div>
          <div className="flex gap-3">
            <Link to="/merchant/setup" className="inline-flex items-center gap-2 bg-card border border-border hover:border-citrus/50 text-foreground font-bold px-4 py-2.5 rounded-xl text-xs uppercase transition-all shadow-sm">
              <Store className="w-4 h-4" /> {t('shopSettings')}
            </Link>
            <Link to="/merchant/post" className={!canPublish ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}>
               <button disabled={!canPublish} className="inline-flex items-center gap-2 bg-citrus hover:brightness-110 text-earth font-black px-5 py-2.5 rounded-xl text-xs uppercase italic transition-all shadow-lg shadow-citrus/20 disabled:opacity-50">
                 <Plus className="w-4 h-4" /> {t('postOffer')}
               </button>
            </Link>
          </div>
        </div>

        <SubscriptionBanner profile={profile} />

        <div className="grid gap-4">
          {offers.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground italic uppercase text-xs font-bold tracking-widest opacity-50">{t('merchantNoActiveOffers')}</p>
          ) : (
            offers.map((offer) => (
              <div key={offer.id} className={`flex items-center gap-4 bg-card border rounded-2xl p-4 transition-all ${offer.is_active ? 'border-border/50' : 'border-border/10 opacity-60 bg-black/5'}`}>
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <SafeOfferImage offer={offer} alt={offer.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm truncate uppercase italic mb-1">{offer.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-citrus font-black text-sm italic">{offer.discount_price} {t('currencyCHF')}</span>
                    <CountdownTimer deadline={offer.collect_before} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/merchant/edit/${offer.id}`}
                    className={`p-2.5 rounded-xl bg-card border border-border hover:border-citrus/50 text-foreground transition-all shadow-sm ${!canPublish ? 'pointer-events-none opacity-40' : ''}`}
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => toggleOffer(offer)} 
                    disabled={!canPublish}
                    className={`p-2.5 rounded-xl transition-all ${!canPublish ? 'cursor-not-allowed opacity-30' : ''} ${offer.is_active ? 'bg-citrus/10 text-citrus' : 'bg-muted text-muted-foreground'}`}
                  >
                    {offer.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => deleteOffer(offer)} className="p-2.5 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}