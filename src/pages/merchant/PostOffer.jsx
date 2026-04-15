import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, ArrowLeft, MapPin } from 'lucide-react';

export default function PostOffer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    title: '',
    original_price: '',
    discount_price: '',
    collect_before: '',
    shop_address: '',
  });

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    try {
      // Legacy fallback page: submission handled in the newer merchant flow.
      navigate('/merchant');
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
        <div>
          <label className="block text-sm font-semibold mb-2">{t('takePhoto')}</label>
          <label className="block cursor-pointer">
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-card border border-border">
                <img src={photoPreview} alt="Product" className="w-full h-full object-cover" />
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

        <div className="p-4 bg-muted/50 rounded-xl border border-border">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" /> {t('address') || 'Adresse de collecte'}
          </label>
          <input
            type="text"
            required
            value={form.shop_address}
            onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

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

        <div>
          <label className="block text-sm font-semibold mb-2">{t('collectDeadline')} *</label>
          <input type="datetime-local" required value={form.collect_before} onChange={(e) => setForm({ ...form, collect_before: e.target.value })} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm" />
        </div>

        <button
          type="submit"
          disabled={publishing}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-4 rounded-xl text-base transition-all"
        >
          {publishing ? t('publishing') : t('publish')}
        </button>
      </form>
    </div>
  );
}