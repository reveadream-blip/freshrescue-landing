/**
 * Webhook Stripe → met à jour public.merchants après paiement.
 *
 * Déploiement :
 *   supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_...
 *   supabase secrets set STRIPE_PRICE_RECURRING_MONTHLY=price_...
 *   supabase secrets set STRIPE_PRICE_ONE_MONTH=price_...
 *   supabase secrets set STRIPE_PRICE_YEARLY_SUB=price_...
 *   (optionnel) STRIPE_PRICE_YEARLY_ONETIME=price_... — paiement unique 12 mois sans renouvellement auto
 *
 * Stripe Dashboard : endpoint = https://<project>.supabase.co/functions/v1/stripe-webhook
 * Événements : checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.paid (optionnel)
 *
 * Payment Links : client_reference_id = UUID utilisateur (déjà utilisé dans MerchantDashboard).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!secret || !webhookSecret || !supabaseUrl || !serviceKey) {
    return json(500, { error: 'Missing STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, or Supabase service env' });
  }

  const stripe = new Stripe(secret, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() });
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return json(400, { error: 'Missing stripe-signature' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json(400, { error: `Webhook signature: ${msg}` });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  /** Price ID Stripe (price_...). Les URLs buy.stripe.com dans l’env sont ignorées avec un warning. */
  function stripePriceId(...keys: string[]): string | undefined {
    for (const key of keys) {
      const raw = Deno.env.get(key)?.trim();
      if (!raw) continue;
      if (raw.startsWith('http')) {
        console.warn(
          `[stripe-webhook] ${key} contient une URL ; mettez l’ID de prix Stripe (price_...) depuis Produits → Prix, pas le lien Payment Link.`,
        );
        continue;
      }
      if (!raw.startsWith('price_')) {
        console.warn(`[stripe-webhook] ${key}="${raw.slice(0, 12)}..." devrait commencer par price_`);
      }
      return raw;
    }
    return undefined;
  }

  const priceRecurring = stripePriceId('STRIPE_PRICE_RECURRING_MONTHLY');
  const priceOneMonth = stripePriceId('STRIPE_PRICE_ONE_MONTH');
  const priceYearlySub = stripePriceId('STRIPE_PRICE_YEARLY_SUB', 'STRIPE_PRICE_YEARLY');
  const priceYearlyOnce = stripePriceId('STRIPE_PRICE_YEARLY_ONETIME');

  async function updateMerchantByUserId(
    userId: string,
    patch: Record<string, string | null | undefined>,
  ) {
    const { error } = await admin.from('merchants').update(patch).eq('user_id', userId);
    if (error) console.error('merchants update', error);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        if (!uid || typeof uid !== 'string') {
          console.warn('checkout.session.completed sans client_reference_id');
          break;
        }

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price?.id;
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

          let plan = 'recurring_monthly';
          if (priceYearlySub && priceId === priceYearlySub) {
            plan = 'yearly_subscription';
          } else if (priceRecurring && priceId === priceRecurring) {
            plan = 'recurring_monthly';
          }

          await updateMerchantByUserId(uid, {
            subscription_status: 'active',
            subscription_plan: plan,
            stripe_subscription_id: sub.id,
            stripe_customer_id: customerId ?? null,
            subscription_end_date: periodEnd,
          });
        } else if (session.mode === 'payment') {
          const full = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items.data.price'],
          });
          const line = full.line_items?.data?.[0];
          const priceId = line?.price?.id;
          const now = new Date();

          if (priceOneMonth && priceId === priceOneMonth) {
            const end = new Date(now);
            end.setMonth(end.getMonth() + 1);
            await updateMerchantByUserId(uid, {
              subscription_status: 'active',
              subscription_plan: 'one_month',
              stripe_subscription_id: null,
              stripe_customer_id: customerId ?? null,
              subscription_end_date: end.toISOString(),
            });
          } else if (priceYearlyOnce && priceId === priceYearlyOnce) {
            const end = new Date(now);
            end.setFullYear(end.getFullYear() + 1);
            await updateMerchantByUserId(uid, {
              subscription_status: 'active',
              subscription_plan: 'yearly_onetime',
              stripe_subscription_id: null,
              stripe_customer_id: customerId ?? null,
              subscription_end_date: end.toISOString(),
            });
          } else {
            console.warn('checkout payment: price_id non mappé', priceId);
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        const { data: merchant } = await admin
          .from('merchants')
          .select('user_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();

        if (merchant?.user_id) {
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          const status =
            sub.status === 'active' || sub.status === 'trialing'
              ? 'active'
              : sub.status === 'canceled'
                ? 'canceled'
                : 'inactive';
          await updateMerchantByUserId(merchant.user_id, {
            subscription_status: status,
            subscription_end_date: periodEnd,
            stripe_customer_id: customerId ?? null,
          });
        } else if (customerId) {
          const { data: byCust } = await admin
            .from('merchants')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          if (byCust?.user_id) {
            const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
            await updateMerchantByUserId(byCust.user_id, {
              subscription_status: sub.status === 'active' || sub.status === 'trialing' ? 'active' : 'inactive',
              subscription_end_date: periodEnd,
              stripe_subscription_id: sub.id,
            });
          }
        }
        break;
      }
      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice;
        const subRef = inv.subscription;
        if (typeof subRef !== 'string') break;
        const sub = await stripe.subscriptions.retrieve(subRef);
        const { data: merchant } = await admin
          .from('merchants')
          .select('user_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();
        if (merchant?.user_id) {
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          await updateMerchantByUserId(merchant.user_id, {
            subscription_status: 'active',
            subscription_end_date: periodEnd,
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const { data: merchant } = await admin
          .from('merchants')
          .select('user_id')
          .eq('stripe_subscription_id', sub.id)
          .maybeSingle();
        if (merchant?.user_id) {
          await updateMerchantByUserId(merchant.user_id, {
            subscription_status: 'canceled',
            stripe_subscription_id: null,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('stripe-webhook handler', e);
    return json(500, { error: 'Handler error' });
  }

  return json(200, { received: true });
});
