import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, MapPin } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/lib/AuthContext';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/i18n';

const SHOP_CATS = ['bakery', 'restaurant', 'grocery', 'market', 'cafe', 'other'];

export default function MerchantSetup() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locating, setLocating] = useState(false); // Pour le bouton GPS
  
  const [form, setForm] = useState({ 
    shop_name: '', 
    address: '', 
    phone: '', 
    category: 'bakery', 
    description: '',
    lat: null, // AJOUTÉ
    lng: null  // AJOUTÉ
  });

  useEffect(() => {
    if (currentUser?.id) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
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
          lat: data.lat || null, // AJOUTÉ
          lng: data.lng || null  // AJOUTÉ
        });
      }
    } catch (err) {
      console.log("Premier profil : aucune donnée à charger encore.");
    }
  };

  // FONCTION POUR RÉCUPÉRER LE GPS DU COMMERÇANT
  const getMyLocation = () => {
    setLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          setLocating(false);
          alert("Position GPS capturée !");
        },
        (error) => {
          console.error(error);
          setLocating(false);
          alert("Erreur : Impossible de récupérer votre position. Vérifiez vos réglages GPS.");
        }
      );
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      alert("Vous devez être connecté.");
      navigate('/login');
      return;
    }

    // Vérification que le GPS est là
    if (!form.lat || !form.lng) {
      alert("Veuillez cliquer sur le bouton 'Ma position actuelle' pour que les clients puissent vous trouver à moins de 10km.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('merchants')
        .upsert({
          user_id: currentUser.id,
          shop_name: form.shop_name,
          address: form.address,
          phone: form.phone,
          category: form.category,
          description: form.description,
          lat: form.lat, // ENVOYÉ À SUPABASE
          lng: form.lng, // ENVOYÉ À SUPABASE
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

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
          <button onClick={() => navigate(-1)} className="p-2 rounded-full border border-border">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black">{t('shopSettings')}</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-3xl p-8">
          
          {/* BOUTON GPS - TRÈS IMPORTANT */}
          <div className="p-4 bg-citrus/10 border border-citrus/20 rounded-2xl flex flex-col items-center gap-3">
             <p className="text-xs font-bold uppercase text-citrus text-center">Géolocalisation de la boutique</p>
             <button 
               type="button" 
               onClick={getMyLocation}
               className="flex items-center gap-2 bg-citrus text-earth px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
             >
               {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
               {form.lat ? "Position capturée ✓" : "Utiliser ma position actuelle"}
             </button>
             {form.lat && <p className="text-[10px] text-muted-foreground">Lat: {form.lat.toFixed(4)} | Lng: {form.lng.toFixed(4)}</p>}
          </div>

          <div>
            <label className={labelClass}>{t('shopName')} *</label>
            <input required type="text" value={form.shop_name} onChange={e => set('shop_name', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('shopAddress')} *</label>
            <input required type="text" value={form.address} onChange={e => set('address', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('shopPhone')}</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-citrus text-earth py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {saved ? <Check className="w-5 h-5" /> : loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('save')}
          </button>
        </form>
      </div>
    </div>
  );
}