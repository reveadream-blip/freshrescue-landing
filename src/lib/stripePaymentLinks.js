/**
 * Liens Stripe Payment Link (mode test ou live selon votre compte Stripe).
 * Définissez les variables VITE_* dans Cloudflare Pages / .env pour ne pas coder les URLs en dur.
 *
 * TODO devise : ces Payment Links doivent être vérifiés côté Stripe pour l'ouverture France.
 *               À recréer en EUR si nécessaire puis remplacer les URLs ci-dessous
 *               (ou exposer via VITE_STRIPE_PAYMENT_LINK_*) avant ouverture FR.
 *
 * Configuration Stripe à vérifier pour chaque lien :
 * - Produits / prix alignés (29,90 mensuel, 299 annuel, etc.)
 * - Payment Link : « Collectez le téléphone » optionnel ; l'app envoie client_reference_id = user UUID
 * - Après paiement : webhook Supabase (Edge Function stripe-webhook) avec les STRIPE_PRICE_* correspondant aux Price ID Stripe
 */

const FALLBACK = {
  recurring: 'https://buy.stripe.com/dRmeV68Ifc37bqe7J1cZa0a',
  monthlyOnetime: 'https://buy.stripe.com/9B67sE1fN5EJ2TI0gzcZa0b',
  yearly: 'https://buy.stripe.com/fZudR2e2z7MRdym8N5cZa0c',
};

export function getStripePaymentLinkUrls() {
  return {
    recurring: import.meta.env.VITE_STRIPE_PAYMENT_LINK_RECURRING || FALLBACK.recurring,
    monthlyOnetime: import.meta.env.VITE_STRIPE_PAYMENT_LINK_MONTHLY_ONETIME || FALLBACK.monthlyOnetime,
    yearly: import.meta.env.VITE_STRIPE_PAYMENT_LINK_YEARLY || FALLBACK.yearly,
  };
}
