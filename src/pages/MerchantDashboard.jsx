import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ToggleLeft, ToggleRight, Trash2, Settings, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '../components/Navbar';
import CountdownTimer from '../components/CountdownTimer';
import { useTranslation } from '../lib/i18n';

export default function MerchantDashboard() {
  const { t } = useTranslation();
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    if (activeUser) {
      loadOffers();
    }
  }, [activeUser]);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('user_id', activeUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (offer) => {
    setToggling(prev => ({ ...prev, [offer.id]: true }));
    try {
      const { error } = await supabase
        .from('offers')
        .update({ is_active: !offer.is_active })
        .eq('id', offer.id);

      if (error) throw error;
      
      setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, is_active: !o.is_active } : o));
    } catch (err) {
      console.error("Erreur toggle:", err.message);
    } finally {
      setToggling(prev => ({ ...prev, [offer.id]: false }));
    }
  };

  const deleteOffer = async (offer) => {
    if (!window.confirm("Supprimer définitivement cette offre et sa photo ?")) return;
    
    try {
      setLoading(true);

      // 1. Supprimer le fichier dans le Storage (logos) si une photo existe
      if (offer.photo && offer.photo.includes('/logos/')) {
        const filePath = offer.photo.split('/logos/').pop();
        const { error: storageError } = await supabase.storage
          .from('logos')
          .remove([filePath]);
          
        if (storageError) console.warn("Note: Image non trouvée dans le storage.");
      }

      // 2. Supprimer la ligne en BDD
      const { error: dbError } = await supabase
        .from('offers')
        .delete()
        .eq('id', offer.id);

      if (dbError) throw dbError;

      setOffers(prev => prev.filter(o => o.id !== offer.id));
    } catch (err) {
      console.error("Erreur suppression:", err.message);
      alert("Erreur lors de la suppression.");
    } finally {
      setLoading(false);
    }
  };

  const activeCount = offers.filter(o => o.is_active).length;

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">{t('dashboard')}</h1>
            <p className="text-muted-foreground mt-1 font-medium">
              <span className="text-citrus font-bold">{activeCount}</span> {t('active').toLowerCase()} / <span className="font-semibold">{offers.length}</span> total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/merchant/setup"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border text-sm font-bold uppercase tracking-tight hover:border-citrus/40 transition-all"
            >
              <Settings className="w-4 h-4" />
              {t('shopSettings')}
            </Link>
            <Link
              to="/merchant/post"
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-citrus text-earth font-black text-sm uppercase italic hover:scale-105 transition-transform shadow-xl shadow-citrus/20"
            >
              <Plus className="w-4 h-4" />
              {t('postOffer')}
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Chargement de vos offres...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-[3rem] border-2 border-dashed border-border/50">
            <div className="text-6xl mb-6 opacity-20">🏪</div>
            <p className="text-xl font-black uppercase italic tracking-tight mb-4 text-muted-foreground">Aucune offre pour le moment</p>
            <Link to="/merchant/post" className="inline-flex items-center gap-2 bg-citrus text-earth px-8 py-3 rounded-full font-black uppercase italic text-sm">
              <Plus className="w-4 h-4" />
              Créer ma première offre
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => (
              <div
                key={offer.id}
                className={`flex items-center gap-5 p-4 rounded-[2rem] bg-card border transition-all ${
                  offer.is_active ? 'border-border shadow-sm' : 'border-border/40 opacity-60 grayscale-[0.5]'
                }`}
              >
                {/* Photo avec fallback */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-earth flex-shrink-0 border border-border">
                  {offer.photo ? (
                    <img 
                      src={offer.photo} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-2xl">
                      🥗
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-lg italic uppercase tracking-tighter truncate leading-none">
                      {offer.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-citrus font-black text-xl italic tracking-tighter">
                      {offer.discount_price} ฿
                    </span>
                    {offer.is_active && (
                      <div className="scale-75 origin-left">
                        <CountdownTimer targetDate={offer.collect_before} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* BOUTON MODIFIER */}
                  <Link 
                    to={`/merchant/edit/${offer.id}`}
                    className="p-3 rounded-full border border-border text-muted-foreground hover:text-citrus hover:border-citrus transition-all"
                    title="Modifier l'offre"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>

                  {/* BOUTON TOGGLE ACTIVE */}
                  <button
                    onClick={() => toggleActive(offer)}
                    disabled={toggling[offer.id]}
                    className={`p-3 rounded-full border transition-all ${
                      offer.is_active
                        ? 'bg-citrus/10 border-citrus text-citrus'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                    title={offer.is_active ? t('deactivate') : t('reactivate')}
                  >
                    {offer.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>

                  {/* BOUTON SUPPRIMER */}
                  <button
                    onClick={() => deleteOffer(offer)}
                    className="p-3 rounded-full border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}