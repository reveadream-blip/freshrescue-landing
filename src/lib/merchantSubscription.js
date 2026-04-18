/** Durée d'essai gratuite (jours calendaires, jour 1 = jour de début). */
export const TRIAL_DAYS = 30;

/** Numéro du jour courant dans l'essai (1 … TRIAL_DAYS), ou null si pas d'essai. */
export function trialCurrentDay(trialStartIso) {
  if (!trialStartIso) return null;
  const start = new Date(trialStartIso);
  const idx = Math.floor((Date.now() - start.getTime()) / 86400000);
  return Math.min(TRIAL_DAYS, Math.max(1, idx + 1));
}

/** Jours restants dans l'essai (0 le jour où l'essai est épuisé). */
export function trialDaysRemaining(trialStartIso, trialDays = TRIAL_DAYS) {
  if (!trialStartIso) return 0;
  const start = new Date(trialStartIso);
  const used = Math.floor((Date.now() - start.getTime()) / 86400000);
  return Math.max(0, trialDays - used);
}

/**
 * Abonnement payant actif : période non expirée, ou abonnement Stripe récurrent encore actif côté statut.
 * @param {Record<string, unknown>|null|undefined} profile — ligne merchants
 */
export function hasActivePaidSubscription(profile) {
  if (!profile) return false;
  const now = Date.now();
  const end = profile.subscription_end_date ? new Date(profile.subscription_end_date).getTime() : 0;
  if (end > now) return true;
  const status = String(profile.subscription_status || '').toLowerCase();
  if (profile.stripe_subscription_id && (status === 'active' || status === 'trialing')) {
    return true;
  }
  return false;
}

/**
 * Peut publier / activer des offres : essai en cours, ou période payée / Stripe actif.
 */
export function canMerchantPublish(profile) {
  if (!profile) return false;
  if (hasActivePaidSubscription(profile)) return true;
  if (profile.trial_start_date) {
    return trialDaysRemaining(profile.trial_start_date) > 0;
  }
  return false;
}

/**
 * Première visite tableau de bord : crée la ligne merchants avec essai 30 j. si absente.
 * @returns {Promise<Record<string, unknown>|null>}
 */
export async function ensureMerchantTrialRow(supabase, userId) {
  const { data: existing } = await supabase.from('merchants').select('*').eq('user_id', userId).maybeSingle();
  if (existing) return existing;
  const { data: created, error } = await supabase
    .from('merchants')
    .insert({
      user_id: userId,
      trial_start_date: new Date().toISOString(),
      subscription_status: 'trial',
      shop_name: '',
      address: '',
    })
    .select()
    .single();
  if (error) {
    console.error('ensureMerchantTrialRow', error);
    return null;
  }
  return created;
}
