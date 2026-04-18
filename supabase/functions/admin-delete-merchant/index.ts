/**
 * Supprime un commerçant et ses offres (service role). Déployer : supabase functions deploy admin-delete-merchant
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

    let body: { merchant_id?: string };
    try {
      body = await req.json();
    } catch {
      return json(400, { error: 'Invalid JSON' });
    }

    const merchantId = body.merchant_id;
    if (!merchantId || typeof merchantId !== 'string') {
      return json(400, { error: 'merchant_id required' });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: row, error: fetchErr } = await admin
      .from('merchants')
      .select('user_id')
      .eq('id', merchantId)
      .maybeSingle();

    if (fetchErr) {
      return json(500, { error: fetchErr.message });
    }
    if (!row?.user_id) {
      return json(404, { error: 'Merchant not found' });
    }

    const uid = row.user_id as string;

    const { error: offErr } = await admin.from('offers').delete().eq('user_id', uid);
    if (offErr) {
      return json(500, { error: offErr.message });
    }

    const { error: s1 } = await admin.from('subscriptions').delete().eq('merchant_id', merchantId);
    if (s1) {
      console.warn('[admin-delete-merchant] subscriptions merchant_id', s1.message);
    }
    const { error: s2 } = await admin.from('subscriptions').delete().eq('user_id', uid);
    if (s2) {
      console.warn('[admin-delete-merchant] subscriptions user_id', s2.message);
    }

    const { error: delErr } = await admin.from('merchants').delete().eq('id', merchantId);
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
