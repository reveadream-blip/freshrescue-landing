import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, ArrowLeft, Check, Loader2, MapPin, Snowflake, Utensils } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/i18n';
// 1. IMPORT DE LA LIBRAIRIE DE COMPRESSION
import imageCompression from 'browser-image-compression';

// --- FONCTION DE TRADUCTION AUTOMATIQUE ---
async function translateText(text, targetLang) {
  if (!text || text.trim() === "") return "";
  try {
    const encodedText = encodeURIComponent(text);
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodedText}`
    );
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map((item) => item[0]).join("");
    }
    return text;
  } catch (error) {
    console.error(`Erreur Traduction vers ${targetLang}:`, error);
    return text; 
  }
}

const CATEGORIES = ['bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other', 'main_course', 'cheese', 'bread'];

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
    consumption_mode: 'takeaway',
    expiry_date: '',
    needs_cool_bag: false
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!activeUser) return;
    const loadInitialData = async () => {
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('shop_name, address')
        .eq('user_id', activeUser.id)
        .single();

      if (isEdit) {
        const { data: offerData } = await supabase.from('offers').select('*').eq('id', id).single();
        if (offerData) {
          const formattedDate = offerData.collect_before ? offerData.collect_before.substring(0, 16) : '';
          setForm({ 
            ...offerData, 
            collect_before: formattedDate,
            shop_address: merchantData?.address || offerData.shop_address,
            consumption_mode: offerData.consumption_mode || 'takeaway',
            expiry_date: offerData.expiry_date || '',
            needs_cool_bag: offerData.needs_cool_bag || false
          });
          if (offerData.photo) setPhotoPreview(offerData.photo);
        }
      } else if (merchantData) {
        setForm(prev => ({ ...prev, shop_name: merchantData.shop_name || '', shop_address: merchantData.address || '' }));
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
      // 1. Gestion de la Photo avec COMPRESSION
      let photoUrl = form.photo || '';
      if (photoFile) {
        // --- LOGIQUE DE COMPRESSION ---
        const options = {
          maxSizeMB: 0.6,          // Max 600 Ko
          maxWidthOrHeight: 1200,  // Redimensionnement max
          useWebWorker: true,
          fileType: 'image/jpeg'   // Conversion en JPEG pour un meilleur poids
        };

        console.log("Compression de l'image...");
        const compressedFile = await imageCompression(photoFile, options);
        console.log(`Poids réduit de ${(photoFile.size / 1024).toFixed(0)}Ko à ${(compressedFile.size / 1024).toFixed(0)}Ko`);

        const fileName = `${activeUser.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, compressedFile);

        if (!uploadError) {
          const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
          photoUrl = data.publicUrl;
        } else {
          throw uploadError;
        }
      }

      // --- 2. GÉNÉRATION DES TRADUCTIONS ---
      console.log("Traduction en cours...");
      const titleEn = await translateText(form.title, 'en');
      await new Promise(r => setTimeout(r, 300));
      const titleTh = await translateText(form.title, 'th');
      
      let descEn = "";
      let descTh = "";
      if (form.description && form.description.trim() !== "") {
        await new Promise(r => setTimeout(r, 300));
        descEn = await translateText(form.description, 'en');
        await new Promise(r => setTimeout(r, 300));
        descTh = await translateText(form.description, 'th');
      }

      // 3. Préparation des données complètes
      const submissionData = {
        user_id: activeUser.id,
        title: form.title,
        description: form.description,
        title_en: titleEn,
        description_en: descEn,
        title_th: titleTh,
        description_th: descTh,
        original_price: form.original_price ? Number(form.original_price) : null,
        discount_price: Number(form.discount_price),
        collect_before: new Date(form.collect_before).toISOString(),
        category: form.category,
        shop_name: form.shop_name,
        shop_address: form.shop_address, 
        photo: photoUrl,
        is_active: form.is_active,
        consumption_mode: form.consumption_mode,
        expiry_date: form.expiry_date || null,
        needs_cool_bag: form.needs_cool_bag
      };

      if (isEdit) submissionData.id = id;

      const { error } = await supabase.from('offers').upsert([submissionData]);
      if (error) throw error;
      
      setDone(true);
      setTimeout(() => navigate('/merchant'), 1500);
    } catch (err) {
      console.error("Erreur complète:", err);
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:border-citrus/50 transition-colors";
  const labelClass = "text-[10px] font-black uppercase ml-1 opacity-50 tracking-widest flex items-center gap-2 mb-2";

  if (done) return (
    <div className="min-h-screen bg-earth flex items-center justify-center text-center p-8">
      <div className="bg-card border border-border p-10 rounded-[3rem] shadow-2xl">
        <Check className="w-16 h-16 text-citrus mx-auto mb-4" />
        <h2 className="text-2xl font-black uppercase italic">{isEdit ? "Modifié !" : "Publié !"}</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-earth text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-full border border-border hover:border-citrus/40"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">{isEdit ? "Modifier" : "Publier"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block cursor-pointer group">
            <div className={`relative w-full h-48 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${photoPreview ? 'border-citrus' : 'border-border'}`}>
              {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <Camera className="opacity-20 w-10 h-10" />}
              {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8" /></div>}
            </div>
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>

          <div className="space-y-4">
            <input required placeholder="Nom du produit" className={inputClass} value={form.title} onChange={e => set('title', e.target.value)} />
            
            <textarea 
              placeholder="Description (Ingrédients, allergènes, quantité...)" 
              className={inputClass + " h-24 resize-none"} 
              value={form.description} 
              onChange={e => set('description', e.target.value)} 
            />

            <div>
              <label className={labelClass}><MapPin className="w-3 h-3" /> Lieu de retrait</label>
              <input required className={inputClass} value={form.shop_address} onChange={e => set('shop_address', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.01" placeholder="Prix Original" className={inputClass} value={form.original_price} onChange={e => set('original_price', e.target.value)} />
              <input required type="number" step="0.01" placeholder="Prix Flash" className={inputClass + " border-citrus text-citrus font-bold"} value={form.discount_price} onChange={e => set('discount_price', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className={labelClass}>Récupération avant :</label>
                 <input required type="datetime-local" className={inputClass} value={form.collect_before} onChange={e => set('collect_before', e.target.value)} />
               </div>
               <div>
                 <label className={labelClass}>Catégorie :</label>
                 <select className={inputClass + " font-bold text-xs uppercase"} value={form.category} onChange={e => set('category', e.target.value)}>
                   {CATEGORIES.map(c => <option key={c} value={c}>{t(c).toUpperCase()}</option>)}
                 </select>
               </div>
            </div>

            <div className="pt-2">
              <label className={labelClass}><Utensils className="w-3 h-3" /> {t('consumptionMode')}</label>
              <div className="grid grid-cols-3 gap-2">
                {['takeaway', 'onSite', 'both'].map(m => (
                  <button key={m} type="button" onClick={() => set('consumption_mode', m)} className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${form.consumption_mode === m ? 'bg-citrus text-earth border-citrus' : 'bg-muted border-border text-muted-foreground'}`}>
                    {t(m)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('expiryDate')}</label>
              <input type="date" className={inputClass} value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <Snowflake className={`w-5 h-5 ${form.needs_cool_bag ? 'text-blue-400' : 'opacity-20'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t('coolBag')}</span>
              </div>
              <input type="checkbox" className="w-6 h-6 accent-citrus" checked={form.needs_cool_bag} onChange={e => set('needs_cool_bag', e.target.checked)} />
            </div>

          </div>

          <button type="submit" disabled={loading} className="w-full bg-citrus text-earth py-5 rounded-[2rem] font-black text-xl shadow-xl uppercase italic">
            {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : (isEdit ? "Enregistrer" : "Publier")}
          </button>
        </form>
      </div>
    </div>
  );
}