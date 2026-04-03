import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react'; // Ajout de Loader2 pour le visuel
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; // Utilisation de l'alias @ pour éviter les erreurs de chemin
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
  const [form, setForm] = useState({ 
    shop_name: '', 
    address: '', 
    phone: '', 
    category: 'bakery', 
    description: '' 
  });

  // Charger le profil existant au démarrage
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
        });
      }
    } catch (err) {
      console.log("Premier profil : aucune donnée à charger encore.");
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async (e) => {
  e.preventDefault();
  
  // SÉCURITÉ : On vérifie si l'utilisateur est connecté via Supabase
  if (!currentUser?.id) {
    alert("Vous devez être connecté pour créer une boutique.");
    navigate('/login'); // Redirige vers la page de connexion
    return;
  }

  setLoading(true);

  try {
    const { error } = await supabase
  .from('merchants')
  .upsert({
    user_id: currentUser.id, // On lie la boutique à l'utilisateur
    shop_name: form.shop_name,
    address: form.address,
    phone: form.phone,
    category: form.category,
    description: form.description, // La colonne qu'on vient d'ajouter en SQL
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' }); // Permet de mettre à jour si ça existe déjà

    if (error) throw error;

    setSaved(true);
    alert("Boutique enregistrée avec succès !");
    setTimeout(() => navigate('/merchant'), 1500);

  } catch (err) {
    console.error("Erreur de sauvegarde:", err.message);
    alert("Impossible d'enregistrer : " + err.message);
  } finally {
    setLoading(false);
  }
};

  const inputClass = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-citrus/50 transition-colors text-base";
  const labelClass = "block text-sm font-semibold text-muted-foreground mb-2";

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full border border-border hover:border-citrus/40 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black">{t('shopSettings')}</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-3xl p-8">
          <div>
            <label className={labelClass}>{t('shopName')} *</label>
            <input required type="text" value={form.shop_name} onChange={e => set('shop_name', e.target.value)} placeholder="My Fresh Bakery" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('shopAddress')} *</label>
            <input required type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main Street, Bangkok" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('shopPhone')}</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+66 xx xxx xxxx" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('shopCategory')}</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass}>
              {SHOP_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t('productDescription')}</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="A short description of your shop..." className={inputClass + ' resize-none'} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-citrus text-earth py-4 rounded-2xl font-black text-lg hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:scale-100 shadow-xl shadow-citrus/20"
          >
            {saved ? (
              <><Check className="w-5 h-5" /> {t('saved') || 'Saved!'}</>
            ) : loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('saving')}</>
            ) : (
              t('save')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}