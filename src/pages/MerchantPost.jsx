import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, ArrowLeft, Check, Loader2, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/i18n';

const CATEGORIES = ['bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other'];

export default function MerchantPost() {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user, currentUser } = useAuth(); 
  const activeUser = user || currentUser;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    original_price: '',
    discount_price: '',
    collect_before: '',
    category: 'bakery',
    shop_name: '',
    shop_address: '', 
    is_active: true,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!activeUser) return;

    const loadInitialData = async () => {
      // 1. D'abord, on récupère TOUJOURS les infos actuelles du marchand (la source de vérité)
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('shop_name, address')
        .eq('user_id', activeUser.id)
        .single();

      if (isEdit) {
        // Mode ÉDITION : On charge l'offre
        const { data: offerData } = await supabase
          .from('offers')
          .select('*')
          .eq('id', id)
          .single();

        if (offerData) {
          const formattedDate = offerData.collect_before ? offerData.collect_before.substring(0, 16) : '';
          
          setForm({ 
            ...offerData, 
            collect_before: formattedDate,
            // FORCE l'adresse actuelle du marchand si celle de l'offre est différente
            // ou si tu préfères garder celle de l'offre par défaut, retire la ligne suivante :
            shop_address: merchantData?.address || offerData.shop_address 
          });
          if (offerData.photo) setPhotoPreview(offerData.photo);
        }
      } else {
        // Mode CRÉATION
        if (merchantData) {
          setForm(prev => ({ 
            ...prev, 
            shop_name: merchantData.shop_name || '', 
            shop_address: merchantData.address || '' 
          }));
        }
      }
    };

    loadInitialData();
  }, [activeUser, id, isEdit]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeUser) return alert("Veuillez vous connecter");
    setLoading(true);

    try {
      let photoUrl = form.photo || '';

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${activeUser.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, photoFile);
        if (!uploadError) {
          const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
          photoUrl = data.publicUrl;
        }
      }

      const submissionData = {
        user_id: activeUser.id,
        title: form.title,
        description: form.description,
        original_price: form.original_price ? Number(form.original_price) : null,
        discount_price: Number(form.discount_price),
        collect_before: new Date(form.collect_before).toISOString(),
        category: form.category,
        shop_name: form.shop_name,
        shop_address: form.shop_address, 
        photo: photoUrl,
        is_active: form.is_active
      };

      if (isEdit) submissionData.id = id;

      const { error } = await supabase.from('offers').upsert([submissionData]);
      if (error) throw error;

      setDone(true);
      setTimeout(() => navigate('/merchant'), 1500);
    } catch (err) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-citrus/50 transition-colors";
  const labelClass = "block text-sm font-semibold text-muted-foreground mb-2";

  if (done) {
    return (
      <div className="min-h-screen bg-earth flex items-center justify-center">
        <div className="text-center p-8 bg-card border border-border rounded-[3rem] shadow-2xl">
          <div className="w-20 h-20 bg-citrus rounded-full flex items-center justify-center mx-auto mb-6 scale-up-center">
            <Check className="w-10 h-10 text-earth" />
          </div>
          <h2 className="text-3xl font-black text-foreground uppercase italic">{isEdit ? "Offre Modifiée !" : "Offre Publiée !"}</h2>
          <p className="text-muted-foreground mt-2 font-medium uppercase text-[10px] tracking-widest">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full border border-border hover:border-citrus/40 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">{isEdit ? "Modifier l'offre" : "Publier une offre"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo */}
          <div>
            <label className={labelClass}>{t('takePhoto')}</label>
            <label className="block group cursor-pointer">
              <div className={`relative w-full h-56 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${photoPreview ? 'border-citrus ring-4 ring-citrus/10' : 'border-border hover:border-citrus/50'}`}>
                {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <Camera className="w-12 h-12 opacity-20" />}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-white font-black uppercase italic text-xs">Changer la photo</p>
                </div>
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          </div>

          <div className="space-y-4">
            <input required placeholder="Nom du produit" className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} />
            
            {/* ADRESSE SYNCHRONISÉE */}
            <div>
              <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Lieu de retrait
              </label>
              <input 
                required 
                placeholder="Adresse de la boutique" 
                className={inputClass + " border-citrus/20"} 
                value={form.shop_address} 
                onChange={e => set('shop_address', e.target.value)} 
              />
              <p className="text-[9px] text-muted-foreground mt-1 ml-1 uppercase">L'adresse de votre boutique est utilisée par défaut.</p>
            </div>

            <textarea placeholder="Description" className={inputClass + " h-24 resize-none"} value={form.description} onChange={e => set('description', e.target.value)} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Prix Original</label>
                <input type="number" step="0.01" className={inputClass} value={form.original_price} onChange={e => set('original_price', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase ml-1 text-citrus tracking-widest">Prix FreshRescue</label>
                <input required type="number" step="0.01" className={inputClass + " border-citrus/40 font-bold text-citrus"} value={form.discount_price} onChange={e => set('discount_price', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest">Récupération limite :</label>
              <input required type="datetime-local" className={inputClass} value={form.collect_before} onChange={e => set('collect_before', e.target.value)} />
            </div>

            <select className={inputClass + " font-bold text-sm"} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{t(c).toUpperCase()}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-citrus text-earth py-5 rounded-[2rem] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-citrus/20 uppercase italic">
            {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : (isEdit ? "Enregistrer les modifications" : "Mettre en ligne l'offre")}
          </button>
        </form>
      </div>
    </div>
  );
}