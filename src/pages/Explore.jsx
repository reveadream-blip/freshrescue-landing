import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, List, Map, Globe, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import OfferCard from '../components/OfferCard';
import { useTranslation } from '../lib/i18n';
import MapView from '../components/MapView';
import { Link } from 'react-router-dom';

const CATEGORIES = ['all', 'bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other'];

export default function Explore() {
  const { t, dt, lang, setLanguage } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationError, setLocationError] = useState(false);
  const [viewMode, setViewMode] = useState('list'); 

  // --- CHARGEMENT DES OFFRES ---
  const loadOffers = async (lat = null, lng = null) => {
    setLoading(true);
    const now = new Date().toISOString(); 
    
    try {
      let result;
      if (lat && lng) {
        const { data, error } = await supabase.rpc('nearby_offers', {
          user_lat: lat,
          user_lon: lng, 
          radius_km: 100
        });
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .gt('collect_before', now) 
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        result = data;
      }

      const formattedResult = (result || []).map(o => ({
        ...o,
        lat: parseFloat(o.lat || o.latitude),
        lng: parseFloat(o.lng || o.longitude)
      }));

      setOffers(formattedResult);
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

  // --- FILTRAGE CLIENT ---
  const filtered = offers.filter(o => {
    const now = new Date();
    const isNotExpired = new Date(o.collect_before) > now;
    const matchCat = activeCategory === 'all' || o.category === activeCategory;
    
    const displayTitle = (dt(o, 'title') || "").toLowerCase();
    const displayDesc = (dt(o, 'description') || "").toLowerCase();
    const displayShop = (o.shop_name || "").toLowerCase();
    const searchTerm = search.toLowerCase();

    const matchSearch = !search || 
      displayTitle.includes(searchTerm) || 
      displayDesc.includes(searchTerm) ||
      displayShop.includes(searchTerm);
    
    return isNotExpired && matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-earth text-foreground">
      {/* HEADER FIXE AVEC LOGO ET ROLLER DE LANGUE (Même style que Dashboard) */}
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
                <option value="th" className="bg-earth text-white">TH</option>
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

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        
        {locationError && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 text-sm flex items-center gap-3 animate-pulse font-bold italic uppercase">
            <MapPin className="w-4 h-4" />
            {t('geoError')}
          </div>
        )}

        <div className="mb-10 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 italic uppercase">
              {t('activeOffers')} <span className="text-citrus">({filtered.length})</span>
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest italic">
              {locationError ? t('allCategories') : `${t('notificationRadius')} : 100 KM`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border rounded-full p-1 w-fit shadow-lg shadow-black/20">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${
                viewMode === 'list' ? 'bg-citrus text-earth' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase transition-all ${
                viewMode === 'map' ? 'bg-citrus text-earth' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Map className="w-4 h-4" /> {t('explore')}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('productDescPlaceholder')}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-citrus/30 transition-all font-bold"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase italic whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? 'bg-citrus text-earth border-citrus shadow-lg shadow-citrus/20' 
                    : 'bg-card border-border text-muted-foreground hover:border-citrus/50'
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-citrus animate-spin mb-4" />
            <p className="text-muted-foreground font-black italic uppercase text-xs tracking-widest">
                {t('loadingOffers')}
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <MapView offers={filtered} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center text-4xl mb-6 shadow-inner">🥗</div>
            <p className="text-muted-foreground text-xl font-black italic uppercase leading-tight">{t('noOffers')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {filtered.map(offer => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
}