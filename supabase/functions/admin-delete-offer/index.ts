/**
 * Supprime une offre côté serveur avec la service role → contourne la RLS.
 * Déployer : supabase functions deploy admin-delete-offer
 * (Les secrets SUPABASE_* sont injectés automatiquement sur le projet hébergé.)
 *
 * Synchroniser les emails avec src/lib/adminConfig.js
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const ADMIN_EMAILS = ['reveadream@gmail.com'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json(500, { error: 'Missing Supabase env in Edge Function' });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json(401, { error: 'Missing Authorization' });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user?.email) {
      return json(401, { error: 'Unauthorized' });
    }

    const allowed = ADMIN_EMAILS.some((e) => e.toLowerCase() === user.email.toLowerCase());
    if (!allowed) {
      return json(403, { error: 'Forbidden' });
    }

    let body: { offer_id?: string };
    try {
      body = await req.json();
    } catch {
      return json(400, { error: 'Invalid JSON' });
    }

    const offerId = body.offer_id;
    if (!offerId || typeof offerId !== 'string') {
      return json(400, { error: 'offer_id required' });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: delErr } = await admin.from('offers').delete().eq('id', offerId);

    if (delErr) {
      return json(500, { error: delErr.message });
    }

    return json(200, { ok: true });
  } catch (e) {
    return json(500, { error: e instanceof Error ? e.message : String(e) });
  }
});

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
