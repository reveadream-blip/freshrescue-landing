import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, Loader2, Globe, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/i18n';
import { isOfferInSwitzerland, distanceKm } from '../lib/swissGeo';
import { getOfferPhotoUrl } from '../lib/offerPhoto';
import MapView from '../components/MapView';
import { Link } from 'react-router-dom';
import { MOCK_OFFERS } from '../data/mockSwissOffers';
import { filterSwissCities, normalizeForSearch } from '../lib/swissCities';

const CATEGORIES = ['all', 'bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other'];

/** Rayon carte + liste des offres quand le GPS est disponible (en Suisse). */
const MAP_RADIUS_KM = 5;

export default function Explore() {
  const { t, dt, lang, setLanguage } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [locationError, setLocationError] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const blurTimeoutRef = useRef(null);

  const citySuggestions = useMemo(() => filterSwissCities(search, 14), [search]);
  const showCitySuggestions =
    searchFocused && search.trim().length > 0 && citySuggestions.length > 0;

  const loadOffers = async () => {
    setLoading(true);
    const now = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .gt('collect_before', now)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const merged = [...(data || []), ...MOCK_OFFERS];
      const formatted = merged.map((o) => ({
        ...o,
        lat: parseFloat(o.lat || o.latitude),
        lng: parseFloat(o.lng || o.longitude),
        photo: getOfferPhotoUrl(o),
      }));
      const swissOnly = formatted.filter((o) => isOfferInSwitzerland(o.lat, o.lng));
      setOffers(swissOnly);
    } catch (err) {
      console.error('Erreur Supabase:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestUserLocation = () => {
    if (!('geolocation' in navigator) || !window.isSecureContext) {
      setLocationError(true);
      setLocationBlocked(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        setLocationError(false);
        setLocationBlocked(false);
      },
      (err) => {
        setLocationError(true);
        setLocationBlocked(err.code === err.PERMISSION_DENIED);
        setUserCoords(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, []);

  const filtered = offers.filter((o) => {
    const now = new Date();
    const isNotExpired = new Date(o.collect_before) > now;
    const matchCat = activeCategory === 'all' || o.category === activeCategory;

    const displayTitle = dt(o, 'title') || '';
    const displayDesc = dt(o, 'description') || '';
    const displayShop = o.shop_name || '';
    const displayAddress = o.shop_address || '';
    const q = search.trim();

    const matchSearch =
      !q ||
      normalizeForSearch(displayTitle).includes(normalizeForSearch(q)) ||
      normalizeForSearch(displayDesc).includes(normalizeForSearch(q)) ||
      normalizeForSearch(displayShop).includes(normalizeForSearch(q)) ||
      normalizeForSearch(displayAddress).includes(normalizeForSearch(q));

    return isNotExpired && matchCat && matchSearch && isOfferInSwitzerland(o.lat, o.lng);
  });

  const offersOnMap = useMemo(() => {
    if (!userCoords) return filtered;
    if (!isOfferInSwitzerland(userCoords.lat, userCoords.lng)) return filtered;
    return filtered.filter((o) => {
      if (o.lat == null || o.lng == null || Number.isNaN(o.lat) || Number.isNaN(o.lng)) return false;
      return distanceKm(userCoords.lat, userCoords.lng, o.lat, o.lng) <= MAP_RADIUS_KM;
    });
  }, [filtered, userCoords]);

  const handlePickCity = (cityName) => {
    setSearch(cityName);
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setSearchFocused(false);
  };

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

      <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        
        {locationError && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500 text-sm flex items-center justify-between gap-3 font-bold italic uppercase">
            <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4" />
            {t('geoError')}
            </div>
            {locationBlocked && (
              <button
                type="button"
                onClick={() => requestUserLocation()}
                className="px-3 py-1 rounded-full border border-orange-500/30 hover:border-orange-500/60 text-[10px] tracking-wider"
              >
                ACTIVER GPS
              </button>
            )}
          </div>
        )}

        <div className="mb-10 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 italic uppercase">
              {t('activeOffers')}{' '}
              <span className="text-citrus">
                ({userCoords && isOfferInSwitzerland(userCoords.lat, userCoords.lng) ? offersOnMap.length : filtered.length})
              </span>
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest italic">
              {t('brandTagline')}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-[1] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
                setSearchFocused(true);
              }}
              onBlur={() => {
                blurTimeoutRef.current = setTimeout(() => setSearchFocused(false), 180);
              }}
              placeholder={t('productDescPlaceholder')}
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showCitySuggestions}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-citrus/30 transition-all font-bold relative z-[1]"
            />
            {showCitySuggestions && (
              <ul
                className="absolute left-0 right-0 top-full mt-2 py-2 bg-card border border-border rounded-2xl shadow-xl shadow-black/30 z-[60] max-h-64 overflow-y-auto"
                role="listbox"
              >
                <li className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/50 mb-1">
                  {t('swissCitiesHint')}
                </li>
                {citySuggestions.map((city) => (
                  <li key={city} role="option">
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-citrus/15 hover:text-citrus flex items-center gap-2 transition-colors"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handlePickCity(city)}
                    >
                      <MapPin className="w-4 h-4 shrink-0 text-citrus opacity-80" />
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
        ) : (
          <MapView offers={offersOnMap} userPosition={userCoords} mapRadiusKm={MAP_RADIUS_KM} />
        )}
      </div>
      <Navbar />
    </div>
  );
}