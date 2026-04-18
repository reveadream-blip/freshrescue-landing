import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Bell,
  LogOut,
  TrendingUp,
  Package,
  Trash2,
  RefreshCw,
  Mail,
  MapPin,
  DollarSign,
  Send,
  History,
  AlertTriangle,
  CreditCard,
  Users,
  ToggleLeft,
  ToggleRight,
  Leaf,
  AlertCircle,
  Pencil,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { getOfferPhotoUrl } from '@/lib/offerPhoto';
import { deletePhotoFromLogosBucket } from '@/lib/supabaseStorage';

const MERCHANT_CATEGORIES = ['bakery', 'restaurant', 'grocery', 'market', 'cafe', 'other'];

function getOfferTitle(o, t) {
  if (!o) return t('adminUntitled');
  return (
    o.title ||
    o.title_fr ||
    o.title_en ||
    o.title_de ||
    o.title_it ||
    o.title_ru ||
    t('adminUntitled')
  );
}

/** Les offres sont liées au profil commerçant via user_id (cf. MerchantPost). */
function merchantForOffer(offer, merchants) {
  if (!offer || !merchants?.length) return null;
  return (
    merchants.find((m) => m.user_id === offer.user_id) ||
    merchants.find((m) => m.id === offer.merchant_id)
  );
}

function isAnnualPlan(planType) {
  const p = (planType || '').toLowerCase();
  return p.includes('annuel') || p === 'yearly' || p === 'annual' || p === 'year';
}

function isMonthlyPlan(planType) {
  const p = (planType || '').toLowerCase();
  return p.includes('mensuel') || p === 'monthly' || p === 'month';
}

const ADMIN_LOCALE = { fr: 'fr-CH', en: 'en-GB', de: 'de-CH', it: 'it-CH', ru: 'ru-RU' };

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { lang, setLanguage, t } = useTranslation();
  const adminLocale = ADMIN_LOCALE[lang] || 'en-CH';
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [fetchErrors, setFetchErrors] = useState([]);

  const [offers, setOffers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pushLogs, setPushLogs] = useState([]);

  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [pushSending, setPushSending] = useState(false);
  const [pushFeedback, setPushFeedback] = useState(null);

  /** null | { id, form } — édition commerçant (admin) */
  const [merchantEditing, setMerchantEditing] = useState(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setFetchErrors([]);
    const errors = [];

    const run = async (labelKey, promise) => {
      const { data, error } = await promise;
      if (error) {
        console.error(`[Admin] ${labelKey}:`, error.message);
        errors.push(`${t(labelKey)}: ${error.message}`);
        return [];
      }
      return data || [];
    };

    try {
      const [off, mer, sub, psh] = await Promise.all([
        run('adminDataOffers', supabase.from('offers').select('*').order('created_at', { ascending: false })),
        run('adminDataMerchants', supabase.from('merchants').select('*').order('shop_name', { ascending: true })),
        run(
          'adminDataSubscriptions',
          supabase.from('subscriptions').select('*').eq('status', 'active')
        ),
        run(
          'adminDataPushHistory',
          supabase.from('push_history').select('*').order('sent_at', { ascending: false }).limit(50)
        ),
      ]);

      setOffers(off);
      setMerchants(mer);
      setSubscriptions(sub);
      setPushLogs(psh);
      setFetchErrors(errors);
    } catch (e) {
      console.error('[Admin]', e);
      setFetchErrors((prev) => [...prev, e.message || t('adminUnknownError')]);
    } finally {
      setLoading(false);
    }
  }, [lang, t]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const deleteOffer = async (id) => {
    if (!window.confirm(t('adminConfirmDeleteOffer'))) return;
    const offer = offers.find((o) => o.id === id);
    if (!offer) {
      alert(t('adminOfferNotFound'));
      return;
    }
    await deletePhotoFromLogosBucket(offer.photo_url || offer.photo);

    const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (baseUrl && anonKey && token) {
      try {
        const res = await fetch(`${baseUrl}/functions/v1/admin-delete-offer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ offer_id: offer.id }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.ok) {
          await fetchAdminData();
          return;
        }
        console.warn('[Admin deleteOffer] Edge Function', res.status, json);
      } catch (e) {
        console.warn('[Admin deleteOffer] Edge Function unreachable', e);
      }
    }

    // 1) RPC admin (contourne la RLS si la fonction SQL est déployée)
    const { data: rpcOk, error: rpcError } = await supabase.rpc('delete_offer_as_admin', {
      target_id: offer.id,
    });

    if (!rpcError && rpcOk) {
      await fetchAdminData();
      return;
    }

    // 2) Secours : DELETE direct (ex. policy JWT admin ou propriétaire de l’offre)
    const { data: deletedRows, error: deleteError } = await supabase
      .from('offers')
      .delete()
      .eq('id', offer.id)
      .select('id');

    if (!deleteError && deletedRows?.length > 0) {
      await fetchAdminData();
      return;
    }

    console.error('[Admin deleteOffer]', { rpcError, rpcOk, deleteError, deletedRows });

    alert(
      `${t('adminDeleteOfferFailedLine')}\n\n` +
        (rpcError ? `${t('adminRpcError')} ${rpcError.message}\n` : '') +
        (rpcOk === false ? `${t('adminRpcNoRows')}\n` : '') +
        (deleteError ? `${t('adminDeleteError')} ${deleteError.message}\n` : '') +
        (!deleteError && !deletedRows?.length ? `${t('adminDeleteZeroRows')}\n` : '') +
        t('adminDeleteOfferHint')
    );
  };

  const openMerchantEdit = (m) => {
    setMerchantEditing({
      id: m.id,
      form: {
        shop_name: m.shop_name || '',
        address: m.address || '',
        phone: m.phone || '',
        city: m.city || '',
        category: m.category || 'other',
        description: m.description || '',
        lat: m.lat != null && m.lat !== '' ? String(m.lat) : '',
        lng: m.lng != null && m.lng !== '' ? String(m.lng) : '',
      },
    });
  };

  const saveMerchantEdit = async () => {
    if (!merchantEditing) return;
    const { id, form } = merchantEditing;
    const latNum =
      form.lat.trim() === '' ? null : Number(form.lat);
    const lngNum =
      form.lng.trim() === '' ? null : Number(form.lng);
    if ((form.lat.trim() !== '' && Number.isNaN(latNum)) || (form.lng.trim() !== '' && Number.isNaN(lngNum))) {
      alert(t('adminLatLngInvalid'));
      return;
    }

    const row = {
      shop_name: form.shop_name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      city: form.city.trim() || null,
      category: form.category,
      description: form.description.trim() || null,
      lat: latNum,
      lng: lngNum,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRows, error: upErr } = await supabase
      .from('merchants')
      .update(row)
      .eq('id', id)
      .select('id');

    if (!upErr && updatedRows?.length > 0) {
      setMerchantEditing(null);
      await fetchAdminData();
      return;
    }

    const patch = {
      shop_name: form.shop_name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      category: form.category,
      description: form.description.trim(),
    };
    if (latNum != null) patch.lat = latNum;
    if (lngNum != null) patch.lng = lngNum;

    const { data: rpcOk, error: rpcErr } = await supabase.rpc('update_merchant_as_admin', {
      target_id: id,
      patch,
    });

    if (!rpcErr && rpcOk) {
      setMerchantEditing(null);
      await fetchAdminData();
      return;
    }

    console.error('[Admin saveMerchantEdit]', upErr, rpcErr, rpcOk);
    alert(
      `${t('adminMerchantSaveFailed')}\n\n${upErr?.message || ''}\n${rpcErr?.message || ''}\n\n${t('adminMerchantSaveHint')}`
    );
  };

  const deleteMerchant = async (m) => {
    const name = m.shop_name || t('adminMerchantGeneric');
    if (!window.confirm(t('adminConfirmDeleteMerchant').replace('{{name}}', name))) {
      return;
    }

    const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (baseUrl && anonKey && token) {
      try {
        const res = await fetch(`${baseUrl}/functions/v1/admin-delete-merchant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: anonKey,
          },
          body: JSON.stringify({ merchant_id: m.id }),
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.ok) {
          setMerchantEditing((prev) => (prev?.id === m.id ? null : prev));
          await fetchAdminData();
          return;
        }
        console.warn('[Admin deleteMerchant] Edge Function', res.status, json);
      } catch (e) {
        console.warn('[Admin deleteMerchant] Edge Function unreachable', e);
      }
    }

    const { data: rpcOk, error: rpcError } = await supabase.rpc('delete_merchant_as_admin', {
      target_id: m.id,
    });

    if (!rpcError && rpcOk) {
      setMerchantEditing((prev) => (prev?.id === m.id ? null : prev));
      await fetchAdminData();
      return;
    }

    const { data: deletedRows, error: deleteError } = await supabase
      .from('merchants')
      .delete()
      .eq('id', m.id)
      .select('id');

    if (!deleteError && deletedRows?.length > 0) {
      setMerchantEditing((prev) => (prev?.id === m.id ? null : prev));
      await fetchAdminData();
      return;
    }

    console.error('[Admin deleteMerchant]', { rpcError, rpcOk, deleteError, deletedRows });

    alert(
      `${t('adminDeleteMerchantFailedLine')}\n\n` +
        (rpcError ? `${t('adminRpcError')} ${rpcError.message}\n` : '') +
        (rpcOk === false ? `${t('adminRpcNoRows')}\n` : '') +
        (deleteError ? `${t('adminDeleteError')} ${deleteError.message}\n` : '') +
        (!deleteError && !deletedRows?.length ? `${t('adminDeleteZeroRowsMerchant')}\n` : '') +
        t('adminDeleteMerchantHint')
    );
  };

  const toggleOfferActive = async (offer) => {
    const { error } = await supabase
      .from('offers')
      .update({ is_active: !offer.is_active })
      .eq('id', offer.id);
    if (error) {
      alert(error.message);
      return;
    }
    setOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, is_active: !o.is_active } : o))
    );
  };

  const sendPush = async (e) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMessage.trim()) {
      setPushFeedback({ type: 'err', text: t('adminPushNeedTitleMessage') });
      return;
    }
    setPushSending(true);
    setPushFeedback(null);
    try {
      const row = {
        title: pushTitle.trim(),
        message: pushMessage.trim(),
        sent_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('push_history').insert([row]);
      if (error) throw error;
      setPushTitle('');
      setPushMessage('');
      setPushFeedback({ type: 'ok', text: t('adminPushDraftSaved') });
      fetchAdminData();
    } catch (err) {
      setPushFeedback({ type: 'err', text: err.message || t('adminPushSaveFailed') });
    } finally {
      setPushSending(false);
    }
  };

  const mrr = useMemo(() => {
    return subscriptions.reduce((acc, s) => {
      const amount = Number(s.amount) || 0;
      return acc + (isAnnualPlan(s.plan_type) ? amount / 12 : amount);
    }, 0);
  }, [subscriptions]);

  const totalRevenue = useMemo(
    () => subscriptions.reduce((acc, s) => acc + (Number(s.amount) || 0), 0),
    [subscriptions]
  );

  const activeSubsCount = subscriptions.length;
  const monthlySubs = subscriptions.filter((s) => isMonthlyPlan(s.plan_type)).length;
  const yearlySubs = subscriptions.filter((s) => isAnnualPlan(s.plan_type)).length;

  const silentMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const mOffers = offers
        .filter((o) => o.user_id === m.user_id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (mOffers.length === 0) return true;
      const diff = (Date.now() - new Date(mOffers[0].created_at)) / (1000 * 60 * 60 * 24);
      return diff > 7;
    });
  }, [merchants, offers]);

  const activeOffersCount = offers.filter((o) => o.is_active).length;

  const relanceMailto = (m) => {
    const subject = encodeURIComponent(t('adminRelanceMailSubject').replace('{{shop}}', m.shop_name || ''));
    const body = encodeURIComponent(t('adminRelanceMailBody'));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const StatCard = ({ title, value, icon: Icon, accent = 'citrus' }) => {
    const accents = {
      citrus: 'from-citrus/20 to-citrus/5 border-citrus/30 text-citrus',
      stem: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/25 text-emerald-400',
      amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/25 text-amber-400',
      slate: 'from-white/10 to-white/5 border-white/10 text-muted-foreground',
    };
    return (
      <div
        className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-lg ${accents[accent] || accents.citrus}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-foreground">{value}</p>
          </div>
          <div className="rounded-2xl bg-earth/80 p-3 text-citrus shadow-inner">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black italic tracking-tight text-foreground">{t('adminOverviewTitle')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('adminOverviewSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('adminStatMrr')}
          value={`${Math.round(mrr).toLocaleString(adminLocale)} ${t('currencyCHF')}`}
          icon={DollarSign}
          accent="stem"
        />
        <StatCard title={t('adminStatActiveSubs')} value={activeSubsCount} icon={CreditCard} accent="citrus" />
        <StatCard title={t('adminStatActiveOffers')} value={activeOffersCount} icon={Package} accent="amber" />
        <StatCard title={t('adminStatMerchantsFollowUp')} value={silentMerchants.length} icon={AlertTriangle} accent="slate" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
            <TrendingUp className="h-5 w-5 text-citrus" />
            {t('adminSubscriptionsBlockTitle')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <span className="text-sm font-semibold text-muted-foreground">{t('adminMonthly')}</span>
              <span className="text-xl font-black text-citrus">{monthlySubs}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <span className="text-sm font-semibold text-muted-foreground">{t('adminYearly')}</span>
              <span className="text-xl font-black text-citrus">{yearlySubs}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-3xl border border-citrus/30 bg-gradient-to-br from-citrus/20 via-earth to-earth p-8 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('adminTotalCollected')}</p>
          <p className="mt-2 text-4xl font-black text-foreground">
            {totalRevenue.toLocaleString(adminLocale)} <span className="text-lg text-citrus">{t('currencyCHF')}</span>
          </p>
          <p className="mt-3 text-xs italic text-muted-foreground">{t('adminTotalCollectedHint')}</p>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic text-foreground">{t('adminRevenueTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('adminRevenueSubtitle')}</p>
        </div>
        <span className="rounded-full bg-citrus/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-citrus">
          {t('adminLiveBadge')}
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t('adminEmptyNoSubscriptions')}
          hint={t('adminEmptyNoSubscriptionsHint')}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-border bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">{t('adminColShop')}</th>
                  <th className="px-6 py-4">{t('adminColPlan')}</th>
                  <th className="px-6 py-4">{t('adminColAmount')}</th>
                  <th className="px-6 py-4">{t('adminColEndRenewal')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {subscriptions.map((s) => {
                  const m = merchants.find((mer) => mer.id === s.merchant_id || mer.user_id === s.user_id);
                  const end = s.end_date || s.current_period_end || s.renewal_date;
                  return (
                    <tr key={s.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-bold text-foreground">{m?.shop_name || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                            isAnnualPlan(s.plan_type)
                              ? 'bg-purple-500/15 text-purple-300'
                              : 'bg-citrus/15 text-citrus'
                          }`}
                        >
                          {isAnnualPlan(s.plan_type) ? t('adminPlanAnnual') : t('adminPlanMonthly')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-citrus">
                        {Number(s.amount || 0).toLocaleString(adminLocale)} {t('currencyCHF')}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {end ? new Date(end).toLocaleDateString(adminLocale) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderOffers = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic text-foreground">{t('adminAllOffersTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('adminRowsCount').replace('{{count}}', String(offers.length))}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchAdminData()}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition hover:border-citrus/50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {t('adminRefresh')}
        </button>
      </div>

      {offers.length === 0 ? (
        <EmptyState icon={ShoppingBag} title={t('adminEmptyNoOffers')} hint={t('adminEmptyNoOffersHint')} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-border bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-4">{t('adminColVisual')}</th>
                  <th className="px-4 py-4">{t('adminColOffer')}</th>
                  <th className="px-4 py-4">{t('adminColMerchant')}</th>
                  <th className="px-4 py-4">{t('adminColPrice')}</th>
                  <th className="px-4 py-4">{t('adminColActive')}</th>
                  <th className="px-4 py-4 text-right">{t('adminColActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {offers.map((o) => {
                  const m = merchantForOffer(o, merchants);
                  return (
                    <tr key={o.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <img
                          src={getOfferPhotoUrl(o)}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover ring-1 ring-border"
                        />
                      </td>
                      <td className="max-w-[220px] px-4 py-3 font-bold text-foreground">{getOfferTitle(o, t)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m?.shop_name || '—'}</td>
                      <td className="px-4 py-3 font-bold text-citrus">
                        {o.discount_price} {t('currencyCHF')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleOfferActive(o)}
                          className="text-muted-foreground transition hover:text-citrus"
                          title={o.is_active ? t('adminDeactivate') : t('adminActivate')}
                        >
                          {o.is_active ? <ToggleRight className="h-8 w-8 text-citrus" /> : <ToggleLeft className="h-8 w-8" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteOffer(o.id)}
                          className="rounded-xl p-2 text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                          aria-label={t('adminAriaDeleteOffer')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderMerchants = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div>
        <h2 className="text-2xl font-black italic text-foreground">{t('adminMerchantsTitle')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('adminPartnersCount').replace('{{count}}', String(merchants.length))}
        </p>
      </div>
      {merchants.length === 0 ? (
        <EmptyState icon={Store} title={t('adminEmptyNoMerchants')} hint={t('adminEmptyNoMerchantsHint')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {merchants.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg transition hover:border-citrus/40"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-citrus/10 transition group-hover:bg-citrus/20" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="rounded-2xl bg-muted p-3 text-citrus">
                  <Store size={22} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {m.city || t('adminCountryDefault')}
                </span>
              </div>
              <h3 className="relative mt-4 text-lg font-black text-foreground">{m.shop_name}</h3>
              <p className="relative mt-1 flex items-start gap-1 text-sm text-muted-foreground">
                <MapPin size={14} className="mt-0.5 shrink-0 text-citrus" />
                {m.address || t('adminAddressMissing')}
              </p>
              <div className="relative mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                {m.phone ? (
                  <a
                    href={`tel:${m.phone}`}
                    className="min-w-0 flex-1 rounded-2xl bg-citrus py-2.5 text-center text-xs font-black uppercase tracking-wide text-earth transition hover:brightness-110"
                  >
                    {t('adminCall')}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 rounded-2xl bg-muted py-2.5 text-center text-xs text-muted-foreground">
                    {t('adminNoPhone')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => openMerchantEdit(m)}
                  className="rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-citrus transition hover:border-citrus/50 hover:bg-citrus/10"
                  title={t('adminEdit')}
                  aria-label={t('adminEdit')}
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteMerchant(m)}
                  className="rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                  title={t('adminDelete')}
                  aria-label={t('adminDelete')}
                >
                  <Trash2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => relanceMailto(m)}
                  className="rounded-2xl border border-border bg-muted/50 px-4 py-2.5 text-muted-foreground transition hover:border-citrus/50 hover:text-citrus"
                  title={t('adminFollowUpEmailTitle')}
                >
                  <Mail size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPush = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2">
      <div>
        <h2 className="text-2xl font-black italic text-foreground">{t('adminPushTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('adminPushSubtitle')}</p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form onSubmit={sendPush} className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xl">
          <h3 className="font-black text-foreground">{t('adminNewMessage')}</h3>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminPushFieldTitle')}</label>
            <input
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
              placeholder={t('adminPushPlaceholderTitle')}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminPushFieldMessage')}</label>
            <textarea
              value={pushMessage}
              onChange={(e) => setPushMessage(e.target.value)}
              className="mt-1 h-36 w-full resize-none rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
              placeholder={t('adminPushPlaceholderMessage')}
            />
          </div>
          {pushFeedback && (
            <p className={`text-sm font-semibold ${pushFeedback.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
              {pushFeedback.text}
            </p>
          )}
          <button
            type="submit"
            disabled={pushSending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-citrus py-4 text-sm font-black uppercase tracking-wide text-earth shadow-lg shadow-citrus/20 transition hover:brightness-110 disabled:opacity-50"
          >
            <Send size={18} />
            {pushSending ? t('adminPushSending') : t('adminPushSaveHistory')}
          </button>
        </form>

        <div className="flex max-h-[480px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
          <h3 className="flex items-center gap-2 border-b border-border p-6 font-black text-foreground">
            <History size={20} className="text-citrus" />
            {t('adminHistoryTitle')}
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {pushLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('adminHistoryEmpty')}</p>
            ) : (
              pushLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                  <p className="font-bold text-foreground">{log.title || t('adminUntitledLog')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{log.message}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-citrus">
                    {log.sent_at ? new Date(log.sent_at).toLocaleString(adminLocale) : ''}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black italic text-foreground">{t('adminEngagementTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('adminEngagementSubtitle')}</p>
      </div>
      {silentMerchants.length === 0 ? (
        <EmptyState icon={Users} title={t('adminEmptyEngagementOk')} hint={t('adminEmptyEngagementOkHint')} />
      ) : (
        <div className="space-y-3">
          {silentMerchants.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-4 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-black text-foreground">{m.shop_name}</h3>
                <p className="text-xs text-muted-foreground">{t('adminSilentSubtitle')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => relanceMailto(m)}
                  className="rounded-2xl bg-citrus px-5 py-2.5 text-xs font-black uppercase tracking-wide text-earth transition hover:brightness-110"
                >
                  {t('adminRelanceEmail')}
                </button>
                {m.phone && (
                  <a
                    href={`tel:${m.phone}`}
                    className="rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-black uppercase text-foreground"
                  >
                    {t('adminCall')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {merchantEditing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="merchant-edit-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <h2 id="merchant-edit-title" className="text-xl font-black text-foreground">
              {t('adminMerchantModalTitle')}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('adminMerchantModalHint')}</p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormShopName')}</label>
                <input
                  value={merchantEditing.form.shop_name}
                  onChange={(e) =>
                    setMerchantEditing((prev) =>
                      prev ? { ...prev, form: { ...prev.form, shop_name: e.target.value } } : null
                    )
                  }
                  className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormAddress')}</label>
                <input
                  value={merchantEditing.form.address}
                  onChange={(e) =>
                    setMerchantEditing((prev) =>
                      prev ? { ...prev, form: { ...prev.form, address: e.target.value } } : null
                    )
                  }
                  className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormPhone')}</label>
                  <input
                    type="tel"
                    value={merchantEditing.form.phone}
                    onChange={(e) =>
                      setMerchantEditing((prev) =>
                        prev ? { ...prev, form: { ...prev.form, phone: e.target.value } } : null
                      )
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormCity')}</label>
                  <input
                    value={merchantEditing.form.city}
                    onChange={(e) =>
                      setMerchantEditing((prev) =>
                        prev ? { ...prev, form: { ...prev.form, city: e.target.value } } : null
                      )
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormCategory')}</label>
                <select
                  value={merchantEditing.form.category}
                  onChange={(e) =>
                    setMerchantEditing((prev) =>
                      prev ? { ...prev, form: { ...prev.form, category: e.target.value } } : null
                    )
                  }
                  className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                >
                  {MERCHANT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`adminCat_${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormDescription')}</label>
                <textarea
                  value={merchantEditing.form.description}
                  onChange={(e) =>
                    setMerchantEditing((prev) =>
                      prev ? { ...prev, form: { ...prev.form, description: e.target.value } } : null
                    )
                  }
                  rows={3}
                  className="mt-1 w-full resize-none rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormLat')}</label>
                  <input
                    value={merchantEditing.form.lat}
                    onChange={(e) =>
                      setMerchantEditing((prev) =>
                        prev ? { ...prev, form: { ...prev.form, lat: e.target.value } } : null
                      )
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                    placeholder={t('adminPlaceholderLat')}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('adminFormLng')}</label>
                  <input
                    value={merchantEditing.form.lng}
                    onChange={(e) =>
                      setMerchantEditing((prev) =>
                        prev ? { ...prev, form: { ...prev.form, lng: e.target.value } } : null
                      )
                    }
                    className="mt-1 w-full rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground focus:border-citrus focus:outline-none focus:ring-2 focus:ring-citrus/30"
                    placeholder={t('adminPlaceholderLng')}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setMerchantEditing(null)}
                className="rounded-2xl border border-border px-5 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-muted/50"
              >
                {t('adminCancel')}
              </button>
              <button
                type="button"
                onClick={() => saveMerchantEdit()}
                className="rounded-2xl bg-citrus px-5 py-2.5 text-sm font-black uppercase tracking-wide text-earth transition hover:brightness-110"
              >
                {t('adminSave')}
              </button>
            </div>
          </div>
        </div>
      )}
    <div className="flex h-screen overflow-hidden bg-earth font-sans text-foreground">
      <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-earth/95 backdrop-blur-md">
        <div className="border-b border-white/10 p-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-citrus shadow-lg shadow-citrus/20">
              <Leaf className="h-6 w-6 text-earth" />
            </div>
            <div>
              <h1 className="font-black italic tracking-tighter text-foreground">
                Fresh<span className="text-citrus">Rescue</span>
              </h1>
              <span className="mt-0.5 inline-block rounded-md bg-citrus/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-citrus">
                {t('adminBadgeAdmin')}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label={t('adminNavOverview')}
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <NavItem
            icon={<DollarSign size={20} />}
            label={t('adminNavRevenue')}
            active={activeTab === 'revenue'}
            onClick={() => setActiveTab('revenue')}
          />
          <NavItem
            icon={<AlertTriangle size={20} />}
            label={t('adminNavEngagement')}
            active={activeTab === 'engagement'}
            onClick={() => setActiveTab('engagement')}
          />
          <NavItem
            icon={<Bell size={20} />}
            label={t('adminNavNotifications')}
            active={activeTab === 'push'}
            onClick={() => setActiveTab('push')}
          />
          <div className="mx-2 my-4 h-px bg-white/10" />
          <NavItem
            icon={<ShoppingBag size={20} />}
            label={t('adminNavOffers')}
            active={activeTab === 'offers'}
            onClick={() => setActiveTab('offers')}
          />
          <NavItem
            icon={<Store size={20} />}
            label={t('adminNavMerchants')}
            active={activeTab === 'merchants'}
            onClick={() => setActiveTab('merchants')}
          />
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-2xl p-4 text-sm font-black uppercase tracking-wide text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={20} />
            {t('adminLogout')}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="border-b border-white/10 bg-earth/80 px-6 py-4 backdrop-blur-md md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-citrus">{t('adminBackOffice')}</p>
              <p className="text-lg font-bold text-foreground">{t('adminNationalDashboard')}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label={t('adminLanguageAria')}
                  className="appearance-none rounded-full border border-border bg-card py-2 pl-10 pr-9 text-xs font-black uppercase tracking-wider text-foreground transition hover:border-citrus/50 focus:outline-none focus:ring-2 focus:ring-citrus/30"
                >
                  <option value="en">EN</option>
                  <option value="fr">FR</option>
                  <option value="it">IT</option>
                  <option value="de">DE</option>
                  <option value="ru">RU</option>
                </select>
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-citrus" />
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                  <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchAdminData()}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-black uppercase tracking-wider text-foreground transition hover:border-citrus/50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin text-citrus' : ''} />
                {t('adminRefreshAll')}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          {fetchErrors.length > 0 && (
            <div className="mb-8 flex gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="font-bold">{t('adminFetchErrorTitle')}</p>
                <ul className="mt-2 list-inside list-disc text-xs opacity-90">
                  {fetchErrors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {loading && offers.length === 0 && merchants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <RefreshCw className="h-10 w-10 animate-spin text-citrus" />
              <p className="mt-4 text-sm font-bold uppercase tracking-widest text-muted-foreground">{t('adminLoading')}</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'revenue' && renderRevenue()}
              {activeTab === 'engagement' && renderEngagement()}
              {activeTab === 'push' && renderPush()}
              {activeTab === 'offers' && renderOffers()}
              {activeTab === 'merchants' && renderMerchants()}
            </>
          )}
        </div>
      </main>
    </div>
    </>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all ${
        active
          ? 'bg-citrus text-earth shadow-lg shadow-citrus/20'
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <span className={active ? 'text-earth' : 'text-citrus/80'}>{icon}</span>
      {label}
    </button>
  );
}

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="rounded-2xl bg-muted p-4 text-citrus">
        <Icon className="h-10 w-10" />
      </div>
      <p className="mt-4 text-lg font-black text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
