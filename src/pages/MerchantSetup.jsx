import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, MapPin, Leaf, Globe } from 'lucide-react'; 
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '../lib/i18n';
import { normalizeAppLocale, persistMerchantAppLocale } from '@/lib/merchantAppLocale';

export default function MerchantSetup() {
  const { t, lang, setLanguage } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [form, setForm] = useState({ 
    shop_name: '', 
    address: '', 
    phone: '', 
    category: 'bakery', 
    description: '',
    lat: null, 
    lng: null
  });

  useEffect(() => {
    if (currentUser?.id) loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (data) {
        setForm({
          shop_name: data.shop_name || '',
          address: data.address || '',
          phone: data.phone || '',
          category: data.category || 'bakery',
          description: data.description || '',
          lat: data.lat || null,
          lng: data.lng || null
        });
      }
    } catch (err) {
      console.log("Nouveau profil commerçant.");
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const getCoordsFromAddress = async (addressText) => {
    if (!addressText || addressText.length < 3) return null;
    try {
      const cleanAddress = addressText.trim();
      const query = `${cleanAddress}, Switzerland`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'User-Agent': 'FreshRescue-App-V2' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (error) {
      console.error("Erreur géocodage:", error);
      return null;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prefer explicit GPS coordinates when available; fallback to address geocoding.
      const coords = (form.lat && form.lng)
        ? { lat: Number(form.lat), lng: Number(form.lng) }
        : await getCoordsFromAddress(form.address);
      if (!coords) {
        alert(t('geocodeAddressFailed'));
        setLoading(false);
        return;
      }

      const { data: existingProfile } = await supabase
        .from('merchants')
        .select('trial_start_date')
        .eq('user_id', currentUser.id)
        .single();

      const merchantData = {
        user_id: currentUser.id,
        shop_name: form.shop_name,
        address: form.address,
        phone: form.phone,
        category: form.category,
        description: form.description,
        lat: coords.lat,
        lng: coords.lng,
        updated_at: new Date().toISOString(),
        app_locale: normalizeAppLocale(lang) ?? null,
      };

      if (!existingProfile?.trial_start_date) {
        merchantData.trial_start_date = new Date().toISOString();
        merchantData.subscription_status = 'trial';
      }

      const { error: merchantError } = await supabase
        .from('merchants')
        .upsert(merchantData, { onConflict: 'user_id' });

      if (merchantError) throw merchantError;

      await supabase
        .from('offers')
        .update({
          shop_address: form.address,
          lat: coords.lat,
          lng: coords.lng
        })
        .eq('user_id', currentUser.id);

      setSaved(true);
      setTimeout(() => navigate('/merchant'), 1500);

    } catch (err) {
      alert(t('errorWithMessage').replace('{message}', err.message));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-citrus/50 transition-colors";
  const labelClass = "block text-sm font-semibold text-muted-foreground mb-2";

  return (
    <div className="min-h-screen bg-earth">
      {/* HEADER AVEC LOGO ET ROLLER DE LANGUE */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-earth/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-citrus flex items-center justify-center shadow-lg shadow-citrus/20">
              <Leaf className="w-6 h-6 text-earth" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">Fresh<span className="text-citrus">Rescue</span></span>
          </Link>

          <div className="flex items-center gap-4">
            {/* ROLLER DE LANGUE (Fond forcé en sombre pour la visibilité) */}
            <div className="relative group">
              <select
                value={lang}
                onChange={async (e) => {
                  const v = e.target.value;
                  await persistMerchantAppLocale(supabase, currentUser?.id, v);
                  setLanguage(v);
                }}
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

      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black text-foreground">{t('shopSettings')}</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-3xl p-8 shadow-xl">
          <div>
            <label className={labelClass}>{t('shopName')} *</label>
            <input required type="text" value={form.shop_name} onChange={e => set('shop_name', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('shopAddress')} *</label>
            <div className="relative">
              <input 
                required 
                type="text" 
                placeholder={t('addressPlaceholderExample')}
                value={form.address} 
                onChange={e => set('address', e.target.value)} 
                className={inputClass} 
              />
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-citrus" />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('shopPhone')}</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-citrus text-earth py-4 rounded-2xl font-black text-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {saved ? <Check className="w-5 h-5" /> : loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}