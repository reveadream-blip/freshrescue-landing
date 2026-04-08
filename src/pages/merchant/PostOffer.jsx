import { useState, useEffect } from 'react';

import { useTranslation } from '../../lib/i18n';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['bakery', 'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'prepared', 'beverages', 'other'];

export default function PostOffer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    original_price: '',
    discount_price: '',
    collect_before: '',
    category: 'other',
    photo: null,
    shop_address: '', // Ajouté au formulaire pour contrôle
  });

  useEffect(() => {
    const load = async () => {
      
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        
        setForm(prev => ({ ...prev, shop_address: p.address || '' }));
      }
    };
    load();
  }, []);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    try {
      
      setForm((prev) => ({ ...prev, photo: file_url }));
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors du chargement de l'image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);

    try {
      
        title: form.title,
        description: form.description,
        original_price: form.original_price ? Number(form.original_price) : undefined,
        discount_price: Number(form.discount_price),
        collect_before: new Date(form.collect_before).toISOString(),
        category: form.category,
        photo: form.photo,
        is_active: true,
        shop_name: profile?.shop_name || 'My Shop',
        shop_address: form.shop_address, // On utilise l'adresse du formulaire !
        latitude: profile?.latitude || undefined,
        longitude: profile?.longitude || undefined,
      });
      navigate('/merchant');
    } catch (err) {
      alert("Erreur lors de la publication");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/merchant" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('myOffers')}
      </Link>

      <h1 className="text-3xl font-black tracking-tight mb-8">{t('postOffer')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('takePhoto')}</label>
          <label className="block cursor-pointer">
            {photoPreview || form.photo ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-card border border-border">
                <img src={photoPreview || form.photo} alt="Product" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border aspect-video flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors bg-card">
                <Camera className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('takePhoto')}</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
          </label>
        </div>

        {/* Adresse de collecte (AJOUTÉ POUR VÉRIFICATION) */}
        <div className="p-4 bg-muted/50 rounded-xl border border-border">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" /> {t('address') || 'Adresse de collecte'}
          </label>
          <input
            type="text"
            required
            value={form.shop_address}
            onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
            placeholder="Confirmez l'adresse de collecte"
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('productName')}</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t('originalPrice')}</label>
            <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm" placeholder="฿" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t('discountPrice')} *</label>
            <input type="number" required value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm" placeholder="฿" />
          </div>
        </div>

        {/* Collect before */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('collectDeadline')} *</label>
          <input type="datetime-local" required value={form.collect_before} onChange={(e) => setForm({ ...form, collect_before: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm" />
        </div>

        <button
          type="submit"
          disabled={publishing || !form.photo}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-4 rounded-xl text-base transition-all"
        >
          {publishing ? t('publishing') : t('publish')}
        </button>
      </form>
    </div>
  );
}