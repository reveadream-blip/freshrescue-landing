import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, MapPin } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/lib/AuthContext';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/i18n';

export default function MerchantSetup() {
  const { t } = useTranslation();
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
      const query = `${cleanAddress}, Phuket, Thailand`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'User-Agent': 'FreshRescue-App-V2' } }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }

      const simplified = cleanAddress.split(' ').slice(0, 2).join(' ');
      const fallbackQuery = `${simplified}, Phuket, Thailand`;
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`
      );
      const data2 = await res2.json();

      if (data2 && data2.length > 0) {
        return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
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
      // 1. On cherche les coordonnées GPS
      const coords = await getCoordsFromAddress(form.address);
      
      if (!coords) {
        alert("Impossible de localiser cette adresse. Essayez avec un lieu connu à proximité.");
        setLoading(false);
        return;
      }

      // 2. Mise à jour du profil MARCHAND (table 'merchants')
      const { error: merchantError } = await supabase
        .from('merchants')
        .upsert({
          user_id: currentUser.id,
          shop_name: form.shop_name,
          address: form.address,
          phone: form.phone,
          category: form.category,
          description: form.description,
          lat: coords.lat,
          lng: coords.lng,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (merchantError) throw merchantError;

      // 3. SYNCHRONISATION : Mise à jour de 'shop_address' dans la table 'offers'
      const { error: offersError } = await supabase
        .from('offers')
        .update({
          shop_address: form.address, // Mis à jour avec le bon nom de colonne
          lat: coords.lat,
          lng: coords.lng
        })
        .eq('user_id', currentUser.id);

      if (offersError) {
        console.warn("Erreur synchro offres:", offersError.message);
      } else {
        console.log("✅ Synchronisation réussie de shop_address.");
      }

      setSaved(true);
      setTimeout(() => navigate('/merchant'), 1500);

    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-citrus/50 transition-colors";
  const labelClass = "block text-sm font-semibold text-muted-foreground mb-2";

  return (
    <div className="min-h-screen bg-earth">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full border border-border hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black">{t('shopSettings')}</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-3xl p-8 shadow-xl">
          
          <div className="p-4 bg-citrus/10 border border-citrus/20 rounded-2xl">
              <p className="text-[10px] font-bold uppercase text-citrus mb-1">Localisation Synchronisée</p>
              <p className="text-xs text-muted-foreground">
                Toutes vos offres existantes seront mises à jour avec l'adresse <strong>{form.address || '...'}</strong>.
              </p>
          </div>

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
                placeholder="Ex: Soi Saiyuan, Rawai"
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