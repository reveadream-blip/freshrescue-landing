import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import OfferCard from '../components/OfferCard';
import { useTranslation } from '../lib/i18n';

const CATEGORIES = ['all', 'bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other'];

export default function Explore() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationError, setLocationError] = useState(false);

  // Fonction de chargement mémorisée pour éviter les boucles
  const loadOffers = async (lat = null, lng = null) => {
    setLoading(true);
    try {
      let result;
      if (lat && lng) {
        const { data, error } = await supabase.rpc('nearby_offers', {
          user_lat: lat,
          user_lng: lng,
          radius_km: 10
        });
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        result = data;
      }
      setOffers(result || []);
    } catch (err) {
      console.error("Erreur Supabase:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) loadOffers(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Géolocalisation refusée :", error);
          if (isMounted) {
            setLocationError(true);
            loadOffers();
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      loadOffers();
    }

    return () => { isMounted = false; };
  }, []);

  const filtered = offers.filter(o => {
    const matchCat = activeCategory === 'all' || o.category === activeCategory;
    const matchSearch = !search || 
      o.product_name?.toLowerCase().includes(search.toLowerCase()) || // Changé o.title en o.product_name selon ton schéma habituel
      o.shop_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        
        {locationError && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 text-sm flex items-center gap-3 animate-pulse">
            <MapPin className="w-4 h-4" />
            {t('locationErrorMsg') || "Position non détectée. Affichage de toutes les offres."}
          </div>
        )}

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2 italic uppercase">
            {t('activeOffers')} <span className="text-citrus">({filtered.length})</span>
          </h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
            {locationError ? "Monde entier" : "Dans un rayon de 10 KM autour de vous"}
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit ou un commerce..."
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-citrus/30 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'bg-citrus text-earth' : 'bg-card border border-border text-muted-foreground hover:border-citrus/50'
                }`}
              >
                {cat === 'all' ? t('allCategories') : t(cat)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-citrus animate-spin mb-4" />
            <p className="text-muted-foreground font-black italic uppercase text-xs">Calcul de la distance en cours...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-7xl mb-6">🥗</div>
            <p className="text-muted-foreground text-xl font-bold">{t('noOffers')}</p>
            <p className="text-xs uppercase mt-2 opacity-50">Essayez de modifier vos filtres ou revenez plus tard</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}