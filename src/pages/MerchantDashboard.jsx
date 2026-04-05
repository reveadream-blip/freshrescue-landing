import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, ToggleLeft, ToggleRight, Trash2, Store, 
  Crown, AlertTriangle, Edit, ArrowLeft, Home 
} from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

const STRIPE_BASE_URL = 'https://buy.stripe.com/3cIeV6bUrc37dym2oHcZa04';
const TRIAL_DAYS = 15;

// --- FONCTION DE NETTOYAGE DU BUCKET LOGOS ---
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

function SubscriptionBanner({ profile }) {
  if (!profile) return null;
  const status = profile.subscription_status || 'trial';
  const trialStart = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
  const checkoutUrl = `${STRIPE_BASE_URL}?client_reference_id=${profile.user_id}`;
  
  if (!trialStart && status === 'trial') return null;

  const daysUsed = Math.floor((Date.now() - trialStart) / 86400000);
  const daysLeft = Math.max(0, TRIAL_DAYS - daysUsed);

  if (status === 'active') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-8">
        <Crown className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <p className="text-sm font-bold text-emerald-500 uppercase italic">Abonnement Premium Actif 🌴</p>
      </div>
    );
  }

  if (daysLeft === 0) {
    return (
      <div className="p-6 rounded-3xl bg-red-600/10 border-2 border-red-600/40 text-center mb-8">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
        <h3 className="font-black text-xl text-foreground uppercase italic leading-tight">Essai gratuit terminé</h3>
        <p className="text-muted-foreground text-sm mb-5">Votre boutique n'est plus visible sur la carte. Abonnez-vous pour reprendre vos ventes.</p>
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" 
           className="inline-flex items-center gap-2 bg-citrus text-earth px-10 py-4 rounded-2xl font-black uppercase italic hover:scale-[1.02] transition-transform shadow-lg shadow-citrus/20 text-sm">
          Activer mon accès (1 000 THB / mois)
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-citrus/10 border border-citrus/30 mb-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-citrus flex items-center justify-center text-earth font-black text-xl italic shadow-inner">
          {daysLeft}
        </div>
        <div>
          <p className="text-sm font-black uppercase italic leading-none">Jours d'essai restants</p>
          <p className="text-xs text-muted-foreground mt-1">Votre visibilité à Phuket est actuellement gratuite.</p>
        </div>
      </div>
      <a href={checkoutUrl} target="_blank" rel="noopener noreferrer"
         className="flex items-center gap-2 bg-citrus/20 hover:bg-citrus text-citrus hover:text-earth px-6 py-3 rounded-xl text-xs font-black uppercase italic transition-all border border-citrus/30">
        <Crown className="w-4 h-4" /> Devenir Premium
      </a>
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

  useEffect(() => {
    const loadAndCleanData = async () => {
      if (!currentUser?.id) return;
      try {
        const { data: profileData } = await supabase
          .from('merchants')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();
        if (profileData) setProfile(profileData);

        const { data: offersData } = await supabase
          .from('offers')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (offersData) {
          const now = new Date();
          const expired = offersData.filter(o => new Date(o.collect_before) < now);
          
          if (expired.length > 0) {
            // NETTOYAGE AUTO (Storage + BDD)
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

  if (loading) return <div className="flex justify-center py-20 text-citrus italic font-black uppercase tracking-widest">Nettoyage et Chargement...</div>;

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
          <Link to="/merchant/post" className="inline-flex items-center gap-2 bg-citrus hover:brightness-110 text-earth font-black px-5 py-2.5 rounded-xl text-xs uppercase italic transition-all shadow-lg shadow-citrus/20">
            <Plus className="w-4 h-4" /> {t('postOffer')}
          </Link>
        </div>
      </div>

      <SubscriptionBanner profile={profile} />

      {!profile && (
        <div className="bg-card border border-border rounded-[2rem] p-12 text-center space-y-4">
          <Store className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
          <p className="text-muted-foreground font-bold">{t('noShopYet')}</p>
          <Link to="/merchant/setup" className="inline-flex items-center gap-2 bg-citrus text-earth font-black px-8 py-4 rounded-2xl text-sm uppercase italic transition-all">
            {t('setupShop')}
          </Link>
        </div>
      )}

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
                <button onClick={() => toggleOffer(offer)} className={`p-2.5 rounded-xl transition-all ${offer.is_active ? 'bg-citrus/10 text-citrus' : 'bg-muted text-muted-foreground'}`}>
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