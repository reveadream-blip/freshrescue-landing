import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '../components/Navbar';
import OfferCard from '../components/OfferCard';
import { useTranslation } from '../lib/i18n';

const CATEGORIES = ['all', 'bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other'];

// 1. ON A SUPPRIMÉ LE TABLEAU MOCK_OFFERS QUI ÉTAIT ICI

export default function Explore() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      // 2. On récupère UNIQUEMENT les vraies offres depuis Supabase
      const { data: dbOffers, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 3. On ne met que les offres de la DB dans le state
      setOffers(dbOffers || []);
      
    } catch (err) {
      console.error("Erreur Supabase:", err.message);
      setOffers([]); // En cas d'erreur, on laisse vide au lieu d'afficher des faux
    } finally {
      setLoading(false);
    }
  };

  const filtered = offers.filter(o => {
    const matchCat = activeCategory === 'all' || o.category === activeCategory;
    const matchSearch = !search || 
      o.title?.toLowerCase().includes(search.toLowerCase()) || 
      o.shop_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            {t('activeOffers')} <span className="text-citrus">({filtered.length})</span>
          </h1>
          <div className="w-12 h-1 bg-citrus rounded-full mt-4" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search offers..."
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-citrus/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-citrus text-earth'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat === 'all' ? t('allCategories') : t(cat)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-2xl bg-card border border-border h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-7xl mb-6">🥗</div>
            <p className="text-muted-foreground text-xl">{t('noOffers')}</p>
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