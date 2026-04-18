import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Camera, ArrowLeft, Check, Loader2, MapPin, Snowflake, Utensils, Image as ImageIcon, Globe, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
// On n'importe plus Navbar car on va utiliser le header personnalisé
import { useTranslation } from '../lib/i18n';
import { ensureMerchantTrialRow, canMerchantPublish } from '@/lib/merchantSubscription';
import { normalizeAppLocale, persistMerchantAppLocale } from '@/lib/merchantAppLocale';
import { uploadOfferPhotoToStorage } from '@/lib/offerPhotoUpload';
import imageCompression from 'browser-image-compression';
import * as nsfwjs from 'nsfwjs';

// --- CONFIGURATION MODÉRATION ---
const BANNED_WORDS = [
  'porn', 'porno', 'nudes', 'naked', 'erotic', 'xxx', 'sex', 'hardcore', 'softcore',
  'penis', 'vagina', 'boobs', 'tits', 'asshole', 'clitoris', 'dick', 'pussy', 'butt',
  'intercourse', 'masturbation', 'orgasm', 'blowjob', 'handjob', 'rimjob', 'anal',
  'escort', 'prostitute', 'hooker', 'webcam', 'onlyfans', 'sugar daddy', 'sugar baby',
  'fuck', 'shit', 'bitch', 'bastard', 'cunt', 'motherfucker', 'dickhead', 'asshat',
  'nigger', 'faggot', 'retard', 'slut', 'whore',
  'drugs', 'cocaine', 'heroin', 'meth', 'marijuana', 'cannabis', 'pills', 'ecstasy'
];

const containsInappropriateContent = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
};

const checkImageSafety = async (file) => {
  try {
    const model = await nsfwjs.load();
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;

    return new Promise((resolve) => {
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        try {
          URL.revokeObjectURL(imageUrl);
        } catch {
          /* ignore */
        }
        resolve(ok);
      };

      const t = window.setTimeout(() => finish(true), 25000);

      img.onerror = () => {
        window.clearTimeout(t);
        finish(true);
      };

      img.onload = async () => {
        try {
          const predictions = await model.classify(img);
          window.clearTimeout(t);
          const unsafe = predictions.find(
            (p) =>
              (p.className === 'Porn' || p.className === 'Hentai' || p.className === 'Sexy') &&
              p.probability > 0.7
          );
          finish(!unsafe);
        } catch {
          window.clearTimeout(t);
          finish(true);
        }
      };
    });
  } catch (error) {
    console.error('Erreur analyse image:', error);
    return true;
  }
};

async function translateText(text, targetLang) {
  if (!text || text.trim() === "") return "";
  try {
    const encodedText = encodeURIComponent(text);
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`
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
  const { t, lang, setLanguage } = useTranslation(); // Ajout de lang et setLanguage
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user, currentUser } = useAuth(); 
  const activeUser = user || currentUser;
  const navigate = useNavigate();

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
    needs_cool_bag: false,
    lat: null,
    lng: null,
    photo: '',
    photo_url: ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [merchantProfile, setMerchantProfile] = useState(null);

  const canPublish = merchantProfile ? canMerchantPublish(merchantProfile) : false;

  useEffect(() => {
    if (!activeUser) return;
    const loadInitialData = async () => {
      setAccessLoading(true);
      let merchantData = (await supabase.from('merchants').select('*').eq('user_id', activeUser.id).maybeSingle()).data;
      if (!merchantData) {
        merchantData = await ensureMerchantTrialRow(supabase, activeUser.id);
      }
      if (merchantData && !merchantData.app_locale) {
        const loc = normalizeAppLocale(
          typeof window !== 'undefined' ? localStorage.getItem('freshrescue_lang') : null
        );
        if (loc) {
          await persistMerchantAppLocale(supabase, activeUser.id, loc);
          merchantData = { ...merchantData, app_locale: loc };
        }
      }
      setMerchantProfile(merchantData);

      if (!canMerchantPublish(merchantData)) {
        setAccessLoading(false);
        return;
      }

      if (isEdit) {
        const { data: offerData } = await supabase.from('offers').select('*').eq('id', id).single();
        if (offerData) {
          const formattedDate = offerData.collect_before ? offerData.collect_before.substring(0, 16) : '';
          const existingPhotoUrl = offerData.photo || offerData.photo_url || '';
          setForm({ 
            ...offerData, 
            photo: existingPhotoUrl,
            collect_before: formattedDate,
            shop_address: merchantData?.address || offerData.shop_address,
            consumption_mode: offerData.consumption_mode || 'takeaway',
            expiry_date: offerData.expiry_date || '',
            needs_cool_bag: offerData.needs_cool_bag || false,
            lat: offerData.lat || merchantData?.lat,
            lng: offerData.lng || merchantData?.lng
          });
          if (existingPhotoUrl) setPhotoPreview(existingPhotoUrl);
        }
      } else if (merchantData) {
        setForm(prev => ({ 
            ...prev, 
            shop_name: merchantData.shop_name || '', 
            shop_address: merchantData.address || '',
            lat: merchantData.lat,
            lng: merchantData.lng
        }));
      }
      setAccessLoading(false);
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
    if (!activeUser) return alert(t('loginRequired'));

    const { data: freshProfile } = await supabase
      .from('merchants')
      .select('*')
      .eq('user_id', activeUser.id)
      .maybeSingle();
    if (!canMerchantPublish(freshProfile)) {
      alert(t('merchantPublishBlocked'));
      return;
    }

    const titleOk = Boolean(form.title?.trim());
    const addrOk = Boolean(form.shop_address?.trim());
    const priceRaw = form.discount_price;
    const priceOk =
      priceRaw !== '' &&
      priceRaw != null &&
      !Number.isNaN(Number(priceRaw)) &&
      Number(priceRaw) >= 0;
    const dateOk = Boolean(form.collect_before?.trim());
    if (!titleOk || !addrOk || !priceOk || !dateOk) {
      alert(t('publishFormIncomplete'));
      return;
    }

    const existingPhotoUrl =
      (typeof form.photo === 'string' && form.photo.trim()) ||
      (typeof form.photo_url === 'string' && form.photo_url.trim());
    const hasImage = Boolean(photoFile) || (isEdit && Boolean(existingPhotoUrl));
    if (!hasImage) {
      alert(t('publishPhotoRequired'));
      return;
    }

    if (containsInappropriateContent(form.title) || containsInappropriateContent(form.description)) {
      alert(t('inappropriateContentError'));
      return;
    }

    setLoading(true);
    
    try {
      let photoUrl =
        typeof form.photo === 'string' && form.photo.trim()
          ? form.photo
          : typeof form.photo_url === 'string' && form.photo_url.trim()
            ? form.photo_url
            : '';
      if (photoFile) {
        const isSafe = await checkImageSafety(photoFile);
        if (!isSafe) {
          setLoading(false);
          alert(t('inappropriateImageError'));
          return;
        }

        const options = {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: 'image/jpeg'
        };

        const compressedFile = await imageCompression(photoFile, options);
        photoUrl = await uploadOfferPhotoToStorage(activeUser.id, compressedFile);
      }

      // --- TRADUCTIONS DES TEXTES (AJOUT IT) ---
      const [titleFr, titleEn, titleDe, titleRu, titleIt] = await Promise.all([
        translateText(form.title, 'fr'),
        translateText(form.title, 'en'),
        translateText(form.title, 'de'),
        translateText(form.title, 'ru'),
        translateText(form.title, 'it')
      ]);
      
      let descFr = "", descEn = "", descDe = "", descRu = "", descIt = "";
      if (form.description && form.description.trim() !== "") {
        [descFr, descEn, descDe, descRu, descIt] = await Promise.all([
          translateText(form.description, 'fr'),
          translateText(form.description, 'en'),
          translateText(form.description, 'de'),
          translateText(form.description, 'ru'),
          translateText(form.description, 'it')
        ]);
      }

      // --- TRADUCTIONS DES MODES DE CONSO (AJOUT IT) ---
      const consModeBase =
        form.consumption_mode === 'takeaway'
          ? t('takeaway')
          : form.consumption_mode === 'onSite'
            ? t('onSite')
            : t('both');
      const [consModeFr, consModeEn, consModeDe, consModeRu, consModeIt] = await Promise.all([
        translateText(consModeBase, 'fr'),
        translateText(consModeBase, 'en'),
        translateText(consModeBase, 'de'),
        translateText(consModeBase, 'ru'),
        translateText(consModeBase, 'it')
      ]);

      // --- TRADUCTIONS DES NOTICES (AJOUT IT) ---
      const bagNoticeBase = form.needs_cool_bag ? t('freezable') : '';
      const [bagNoticeFr, bagNoticeEn, bagNoticeDe, bagNoticeRu, bagNoticeIt] = await Promise.all([
        translateText(bagNoticeBase, 'fr'),
        translateText(bagNoticeBase, 'en'),
        translateText(bagNoticeBase, 'de'),
        translateText(bagNoticeBase, 'ru'),
        translateText(bagNoticeBase, 'it')
      ]);

      const submissionData = {
        user_id: activeUser.id,
        title: form.title, 
        description: form.description,
        title_fr: titleFr,
        description_fr: descFr,
        title_en: titleEn,
        description_en: descEn,
        title_de: titleDe,
        description_de: descDe,
        title_ru: titleRu,
        description_ru: descRu,
        title_it: titleIt,
        description_it: descIt,
        original_price: form.original_price ? Number(form.original_price) : null,
        discount_price: Number(form.discount_price),
        collect_before: new Date(form.collect_before).toISOString(),
        category: form.category,
        shop_name: form.shop_name,
        shop_address: form.shop_address, 
        photo: photoUrl,
        is_active: form.is_active,
        expiry_date: form.expiry_date || null,
        consumption_mode_fr: consModeFr,
        consumption_mode_en: consModeEn,
        consumption_mode_de: consModeDe,
        consumption_mode_ru: consModeRu,
        consumption_mode_it: consModeIt,
        needs_cool_bag: form.needs_cool_bag,
        bag_notice_fr: bagNoticeFr,
        bag_notice_en: bagNoticeEn,
        bag_notice_de: bagNoticeDe,
        bag_notice_ru: bagNoticeRu,
        bag_notice_it: bagNoticeIt,
        lat: form.lat,
        lng: form.lng
      };

      if (isEdit) submissionData.id = id;

      const { error } = await supabase.from('offers').upsert([submissionData]);
      if (error) throw error;
      
      setDone(true);
      setTimeout(() => navigate('/merchant'), 1500);
    } catch (err) {
      console.error("Erreur complète:", err);
      alert(t('errorWithMessage').replace('{message}', err.message));
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
        <h2 className="text-2xl font-black uppercase italic">
            {isEdit ? t('updated') : t('published')}
        </h2>
      </div>
    </div>
  );

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-earth flex items-center justify-center">
        <Loader2 className="animate-spin text-citrus w-10 h-10" aria-label={t('loading')} />
      </div>
    );
  }

  if (!canPublish) {
    return (
      <div className="min-h-screen bg-earth text-foreground flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-md bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl space-y-6">
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">{t('merchantPublishBlocked')}</p>
          <Link
            to="/merchant"
            className="inline-flex items-center justify-center w-full bg-citrus text-earth py-4 rounded-2xl font-black uppercase italic"
          >
            {t('dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth text-foreground">
      {/* HEADER FIXE AVEC LOGO ET ROLLER DE LANGUE */}
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
                onChange={async (e) => {
                  const v = e.target.value;
                  await persistMerchantAppLocale(supabase, activeUser?.id, v);
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
          <button type="button" onClick={() => navigate(-1)} className="p-2 rounded-full border border-border hover:border-citrus/40"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            {isEdit ? t('edit') : t('post')}
          </h1>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className={`relative w-full h-48 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${photoPreview ? 'border-citrus' : 'border-border'}`}>
              {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" alt={t('imagePreviewAlt')} /> : <Camera className="opacity-20 w-10 h-10" />}
              {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-white w-8 h-8" /></div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-muted border border-border rounded-2xl hover:border-citrus/50 transition-all"
              >
                <Camera className="w-6 h-6 text-citrus" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {t('camera')}
                </span>
                <input 
                  ref={cameraInputRef}
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handlePhoto} 
                  className="hidden" 
                />
              </button>

              <button 
                type="button" 
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-muted border border-border rounded-2xl hover:border-citrus/50 transition-all"
              >
                <ImageIcon className="w-6 h-6 text-citrus" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {t('gallery')}
                </span>
                <input 
                  ref={galleryInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhoto} 
                  className="hidden" 
                />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <input 
              required 
              type="text"
              placeholder={t('productName')} 
              className={inputClass} 
              value={form.title} 
              onChange={e => set('title', e.target.value)} 
            />
            
            <textarea 
              placeholder={t('productDescPlaceholder')} 
              className={inputClass + " h-24 resize-none"} 
              value={form.description} 
              onChange={e => set('description', e.target.value)} 
            />

            <div>
              <label className={labelClass}><MapPin className="w-3 h-3" /> {t('pickupLocation')}</label>
              <input required type="text" className={inputClass} value={form.shop_address} onChange={e => set('shop_address', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.01" placeholder={t('originalPrice')} className={inputClass} value={form.original_price} onChange={e => set('original_price', e.target.value)} />
              <input required type="number" step="0.01" placeholder={t('flashPrice')} className={inputClass + " border-citrus text-citrus font-bold"} value={form.discount_price} onChange={e => set('discount_price', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t('pickupBefore')}</label>
                  <input required type="datetime-local" className={inputClass} value={form.collect_before} onChange={e => set('collect_before', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>{t('categoryLabel')}</label>
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
                <span className="text-[10px] font-black uppercase tracking-widest">{t('freezable')}</span>
              </div>
              <input type="checkbox" className="w-6 h-6 accent-citrus" checked={form.needs_cool_bag} onChange={e => set('needs_cool_bag', e.target.checked)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-citrus text-earth py-5 rounded-[2rem] font-black text-xl shadow-xl uppercase italic">
            {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : (isEdit ? t('save') : t('post'))}
          </button>
        </form>
      </div>
    </div>
  );
}