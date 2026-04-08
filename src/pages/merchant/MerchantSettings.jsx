import { useState, useEffect } from 'react';

import { useTranslation } from '../../lib/i18n';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin } from 'lucide-react';

const SHOP_CATEGORIES = ['bakery', 'restaurant', 'grocery', 'market', 'cafe', 'other'];

export default function MerchantSettings() {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [form, setForm] = useState({
    shop_name: '',
    address: '',
    phone: '',
    category: 'other',
    latitude: '',
    longitude: '',
    photo: '',
  });

  useEffect(() => {
    const load = async () => {
      
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        setForm({
          shop_name: p.shop_name || '',
          address: p.address || '',
          phone: p.phone || '',
          category: p.category || 'other',
          latitude: p.latitude || '',
          longitude: p.longitude || '',
          photo: p.photo || '',
        });
      }
    };
    load();
  }, []);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    
    setForm((prev) => ({ ...prev, photo: file_url }));
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      shop_name: form.shop_name,
      address: form.address,
      phone: form.phone,
      category: form.category,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      photo: form.photo || undefined,
    };

    if (profile) {
     
    } else {
      
    }

    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/merchant"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('dashboard')}
      </Link>

      <h1 className="text-3xl font-black tracking-tight mb-8">{t('shopSettings')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('shopPhoto')}</label>
          <label className="block cursor-pointer">
            {photoPreview || form.photo ? (
              <div className="relative rounded-2xl overflow-hidden w-32 h-32 bg-card border border-border">
                <img src={photoPreview || form.photo} alt="Shop" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border w-32 h-32 flex items-center justify-center hover:border-primary/50 transition-colors bg-card">
                <Camera className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </label>
        </div>

        {/* Shop name */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('shopName')} *</label>
          <input
            type="text"
            required
            value={form.shop_name}
            onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('shopAddress')} *</label>
          <input
            type="text"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('shopPhone')}</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-2">{t('shopCategory')}</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {SHOP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold mb-2">GPS Location</label>
          <div className="flex gap-3">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="button"
              onClick={detectLocation}
              className="bg-accent/10 text-accent hover:bg-accent/20 p-3 rounded-xl transition-colors"
              title="Detect location"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-4 rounded-xl text-base transition-all"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  );
}