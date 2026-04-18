import { adminTranslations } from './adminTranslations';

export const MERCHANT_APP_LOCALES = ['en', 'fr', 'de', 'it', 'ru'];

/** @param {string|null|undefined} lang */
export function normalizeAppLocale(lang) {
  if (!lang || typeof lang !== 'string') return null;
  const l = lang === 'th' ? 'de' : lang;
  return MERCHANT_APP_LOCALES.includes(l) ? l : null;
}

/**
 * Enregistre la langue UI du commerçant (table merchants.app_locale).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} userId
 * @param {string} lang
 */
export async function persistMerchantAppLocale(supabase, userId, lang) {
  const app_locale = normalizeAppLocale(lang);
  if (!userId || !app_locale) return;
  const { error } = await supabase.from('merchants').update({ app_locale }).eq('user_id', userId);
  if (error) console.warn('[merchantAppLocale]', error.message);
}

/**
 * Texte du mail de relance : langue commerçant si connue, sinon langue du tableau de bord admin.
 * @param {Record<string, unknown>|null|undefined} merchantRow
 * @param {string} adminFallbackLang
 */
export function getRelanceMailStrings(merchantRow, adminFallbackLang) {
  const loc = normalizeAppLocale(merchantRow?.app_locale) || adminFallbackLang;
  const pack = adminTranslations[loc] || adminTranslations.en;
  return {
    subject: pack.adminRelanceMailSubject,
    body: pack.adminRelanceMailBody,
  };
}
