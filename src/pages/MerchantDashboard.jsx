import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, ToggleLeft, ToggleRight, Trash2, Store, 
  Crown, AlertTriangle, Edit, ArrowLeft, Home, CheckCircle2
} from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

const STRIPE_RECURRING_URL = 'https://buy.stripe.com/3cIeV6bUrc37dym2oHcZa04';
const STRIPE_MONTHLY_ONETIME = 'https://buy.stripe.com/fZucMYaQnd7b3XM2oHcZa05';
const STRIPE_YEARLY_ONETIME = 'https://buy.stripe.com/00weV68If9UZama8N5cZa06';

const TRIAL_DAYS = 30;

const deletePhotoFromLogos = async (photoUrl) => {
  if (!photoUrl) return;
  try {
    const parts = photoUrl.split('/logos/');
    if (parts.length > 1) {
      const filePath = parts[1].split('?')[0]; 
      const { error } = await supabase.storage.from('logos').remove([filePath]);
      if (error) console.error("Erreur Storage:", error.message);
    }
  } catch (err) {
    console.error("Erreur extraction path photo:", err);
  }
};

// --- COMPOSANT BANNIÈRE & SÉLECTEUR DE FORMULES ---
function SubscriptionBanner({ profile }) {
  const { t } = useTranslation();
  if (!profile) return null;
  
  const status = profile.subscription_status || 'trial';
  const trialStart = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
  const subscriptionEnd = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
  
  const isPremium = status === 'active' || (subscriptionEnd && subscriptionEnd > new Date());
  const ref = `?client_reference_id=${profile.user_id}`;

  // Si déjà Premium, on affiche juste le badge de succès
  if (isPremium) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-bold text-emerald-500 uppercase italic">
            {t('premiumActive') || 'Abonnement Premium Actif 🌴'}
          </p>
        </div>
        {subscriptionEnd && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full font-bold">
            Fin : {subscriptionEnd.toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  const daysUsed = trialStart ? Math.floor((Date.now() - trialStart) / 86400000) : 0;
  const daysLeft = Math.max(0, TRIAL_DAYS - daysUsed);

  return (
    <div className="p-6 rounded-[2.5rem] bg-card border border-border mb-8 shadow-xl overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Crown className="w-32 h-32" />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-lg ${daysLeft > 0 ? 'bg-citrus text-earth' : 'bg-red-600 text-white'}`}>
          {daysLeft}
        </div>
        <div>
          <h3 className="font-black uppercase italic text-lg leading-tight">
            {/* CORRECTION ICI : On utilise t() en priorité */}
            {daysLeft > 0 ? (t('trialInProgress') || "Période d'essai") : (t('trialEnded') || "Essai terminé")}
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            {daysLeft > 0 
              ? t('trialDesc') || "Profitez de l'offre pour booster votre visibilité en Thaïlande." 
              : t('trialExpiredDesc') || "Votre visibilité est suspendue. Choisissez une formule pour reprendre."}
          </p>
        </div>
      </div>

      {/* GRILLE DES PRIX / SÉLECTEUR TRADUIT */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Option 1: Récurrent (CB) */}
  <a href={`${STRIPE_RECURRING_URL}${ref}`} target="_blank" rel="noopener noreferrer"
     className="group p-5 rounded-3xl border border-border hover:border-citrus transition-all bg-white/5 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-2">
        <p className="font-black italic uppercase text-sm">{t('planRecurring')}</p>
        <Crown className="w-4 h-4 text-citrus opacity-50" />
      </div>
      <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight mb-4">{t('descRecurring')}</p>
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="text-xs font-black uppercase italic text-citrus">{t('subscribe')}</span>
      <Plus className="w-4 h-4 text-citrus group-hover:rotate-90 transition-transform" />
    </div>
  </a>

  {/* Option 2: 1 Mois Ponctuel (PromptPay) */}
  <a href={`${STRIPE_MONTHLY_ONETIME}${ref}`} target="_blank" rel="noopener noreferrer"
     className="group p-5 rounded-3xl border border-border hover:border-citrus transition-all bg-white/5 flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-2">
        <p className="font-black italic uppercase text-sm">{t('planMonthly')}</p>
        <div className="px-2 py-0.5 rounded text-[8px] bg-blue-500/20 text-blue-400 font-bold">PROMPTPAY</div>
      </div>
      <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight mb-4">{t('descMonthly')}</p>
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="text-xs font-black uppercase italic text-citrus">{t('choose')}</span>
      <Plus className="w-4 h-4 text-citrus group-hover:rotate-90 transition-transform" />
    </div>
  </a>

  {/* Option 3: 1 An (Best Value) */}
  <a href={`${STRIPE_YEARLY_ONETIME}${ref}`} target="_blank" rel="noopener noreferrer"
     className="group p-5 rounded-3xl border-2 border-citrus/30 hover:border-citrus transition-all bg-citrus/5 flex flex-col justify-between relative overflow-hidden">
    <div className="absolute -right-6 -top-2 bg-citrus text-earth font-black text-[8px] px-8 py-1 rotate-45 uppercase">{t('promo')}</div>
    <div>
      <div className="flex justify-between items-start mb-2">
        <p className="font-black italic uppercase text-sm">{t('planYearly')}</p>
      </div>
      <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight mb-4">{t('descYearly')}</p>
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
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // LOGIQUE D'EXPIRATION HYBRIDE
  const isExpired = (() => {
    if (!profile) return false;
    if (profile.subscription_status === 'active') return false;
    if (profile.subscription_end_date && new Date(profile.subscription_end_date) > new Date()) return false;
    const trialStart = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
    const daysUsed = trialStart ? Math.floor((Date.now() - trialStart) / 86400000) : 0;
    return daysUsed >= TRIAL_DAYS;
  })();

  useEffect(() => {
    const loadAndCleanData = async () => {
      if (!currentUser?.id) return;
      try {
        const { data: profileData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          
          const subEnd = profileData.subscription_end_date ? new Date(profileData.subscription_end_date) : null;
          const trialStart = profileData.trial_start_date ? new Date(profileData.trial_start_date) : null;
          const daysUsed = trialStart ? Math.floor((Date.now() - trialStart) / 86400000) : 0;

          const reallyExpired = profileData.subscription_status !== 'active' && 
                                (!subEnd || subEnd < new Date()) && 
                                daysUsed >= TRIAL_DAYS;

          if (reallyExpired) {
            await supabase.from('offers').update({ is_active: false }).eq('user_id', currentUser.id);
          }
        }

        const { data: offersData } = await supabase
          .from('offers')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (offersData) {
          const now = new Date();
          const expired = offersData.filter(o => new Date(o.collect_before) < now);
          
          if (expired.length > 0) {
            for (const off of expired) {
              await deletePhotoFromLogos(off.photo_url || off.photo);
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
    if (isExpired) return; 
    const newStatus = !offer.is_active;
    const { error } = await supabase.from('offers').update({ is_active: newStatus }).eq('id', offer.id);
    if (!error) {
      setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, is_active: newStatus } : o));
    }
  };

  const deleteOffer = async (offer) => {
    if (!window.confirm("Supprimer cette offre ?")) return;
    await deletePhotoFromLogos(offer.photo_url || offer.photo);
    const { error } = await supabase.from('offers').delete().eq('id', offer.id);
    if (!error) {
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-citrus italic font-black uppercase tracking-widest">{t('saving')}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-citrus transition-colors font-bold uppercase italic text-xs">
          <ArrowLeft className="w-4 h-4" /> {t('backToHome') || 'Retour Accueil'}
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
          
          {isExpired ? (
            <button disabled className="inline-flex items-center gap-2 bg-muted text-muted-foreground font-black px-5 py-2.5 rounded-xl text-xs uppercase italic cursor-not-allowed opacity-50">
              <Plus className="w-4 h-4" /> {t('postOffer')}
            </button>
          ) : (
            <Link to="/merchant/post" className="inline-flex items-center gap-2 bg-citrus hover:brightness-110 text-earth font-black px-5 py-2.5 rounded-xl text-xs uppercase italic transition-all shadow-lg shadow-citrus/20">
              <Plus className="w-4 h-4" /> {t('postOffer')}
            </Link>
          )}
        </div>
      </div>

      <SubscriptionBanner profile={profile} />

      <div className="grid gap-4">
        {offers.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground italic uppercase text-xs font-bold tracking-widest opacity-50">Aucune offre active</p>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className={`flex items-center gap-4 bg-card border rounded-2xl p-4 transition-all ${offer.is_active ? 'border-border/50' : 'border-border/10 opacity-60 bg-black/5'}`}>
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                <img src={offer.photo_url || offer.photo} alt={offer.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm truncate uppercase italic mb-1">{offer.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-citrus font-black text-sm italic">฿{offer.discount_price}</span>
                  <CountdownTimer deadline={offer.collect_before} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/merchant/edit/${offer.id}`} className="p-2.5 rounded-xl bg-card border border-border hover:border-citrus/50 text-foreground transition-all shadow-sm"><Edit className="w-5 h-5" /></Link>
                
                <button 
                  onClick={() => toggleOffer(offer)} 
                  disabled={isExpired}
                  className={`p-2.5 rounded-xl transition-all ${isExpired ? 'cursor-not-allowed opacity-30' : ''} ${offer.is_active ? 'bg-citrus/10 text-citrus' : 'bg-muted text-muted-foreground'}`}
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
  );
}