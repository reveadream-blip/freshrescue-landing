import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from '../../lib/i18n';
import { Link } from 'react-router-dom';
import { Plus, ToggleLeft, ToggleRight, Trash2, Store } from 'lucide-react';
import CountdownTimer from '../../components/CountdownTimer';

export default function MerchantDashboard() {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.MerchantProfile.filter({ created_by: user.email });
      if (profiles.length > 0) setProfile(profiles[0]);

      const myOffers = await base44.entities.Offer.filter({ created_by: user.email }, '-created_date', 50);
      setOffers(myOffers);
      setLoading(false);
    };
    load();
  }, []);

  const toggleOffer = async (offer) => {
    await base44.entities.Offer.update(offer.id, { is_active: !offer.is_active });
    setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, is_active: !o.is_active } : o));
  };

  const deleteOffer = async (offer) => {
    await base44.entities.Offer.delete(offer.id);
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t('myOffers')}</h1>
          {profile && (
            <p className="text-muted-foreground text-sm mt-1">{profile.shop_name}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            to="/merchant/settings"
            className="inline-flex items-center gap-2 bg-card border border-border hover:border-foreground/20 text-foreground font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
          >
            <Store className="w-4 h-4" />
            {t('shopSettings')}
          </Link>
          <Link
            to="/merchant/post"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('postOffer')}
          </Link>
        </div>
      </div>

      {/* No profile */}
      {!profile && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <Store className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">{t('noShopYet')}</p>
          <Link
            to="/merchant/settings"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            {t('setupShop')}
          </Link>
        </div>
      )}

      {/* Offers list */}
      {offers.length === 0 && profile && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <p className="text-muted-foreground">{t('noOffers')}</p>
        </div>
      )}

      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`flex items-center gap-4 bg-card border rounded-xl p-4 transition-all ${
              offer.is_active ? 'border-border/50' : 'border-border/20 opacity-60'
            }`}
          >
            {/* Photo */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img src={offer.photo} alt={offer.title} className="w-full h-full object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">{offer.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-primary font-bold text-sm">฿{offer.discount_price}</span>
                {offer.original_price && (
                  <span className="text-xs text-muted-foreground line-through">฿{offer.original_price}</span>
                )}
                <CountdownTimer deadline={offer.collect_before} />
              </div>
            </div>

            {/* Status badge */}
            <span className={`hidden sm:inline px-3 py-1 rounded-full text-xs font-bold ${
              offer.is_active ? 'bg-stem/10 text-stem' : 'bg-muted text-muted-foreground'
            }`}>
              {offer.is_active ? t('active') : t('inactive')}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleOffer(offer)}
                className={`p-2 rounded-lg transition-colors ${
                  offer.is_active
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title={offer.is_active ? t('deactivate') : t('reactivate')}
              >
                {offer.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button
                onClick={() => deleteOffer(offer)}
                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                title={t('deleteOffer')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}