-- =============================================================================
-- FreshRescue — Admin : commerçants (RLS + RPC update / delete)
-- Colle TOUT ce fichier dans Supabase → SQL Editor → Run
-- =============================================================================
-- Remplace reveadream@gmail.com partout si besoin (idem adminConfig.js + Edge Functions).
-- =============================================================================

DROP POLICY IF EXISTS "merchants_admin_delete" ON public.merchants;
CREATE POLICY "merchants_admin_delete"
ON public.merchants
FOR DELETE
TO authenticated
USING (
  coalesce(auth.jwt() ->> 'email', '') IN (
    'reveadream@gmail.com'
  )
);

DROP POLICY IF EXISTS "merchants_admin_update" ON public.merchants;
CREATE POLICY "merchants_admin_update"
ON public.merchants
FOR UPDATE
TO authenticated
USING (
  coalesce(auth.jwt() ->> 'email', '') IN (
    'reveadream@gmail.com'
  )
)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.delete_merchant_as_admin(target_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  uid uuid;
  deleted_count int;
BEGIN
  SELECT u.email INTO user_email FROM auth.users u WHERE u.id = auth.uid();
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF lower(trim(user_email)) <> lower('reveadream@gmail.com') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT m.user_id INTO uid FROM public.merchants m WHERE m.id = target_id;
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  PERFORM set_config('row_security', 'off', true);

  DELETE FROM public.offers WHERE user_id = uid;
  DELETE FROM public.merchants WHERE id = target_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_merchant_as_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_merchant_as_admin(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_merchant_as_admin(target_id uuid, patch jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  n int;
BEGIN
  SELECT u.email INTO user_email FROM auth.users u WHERE u.id = auth.uid();
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF lower(trim(user_email)) <> lower('reveadream@gmail.com') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  PERFORM set_config('row_security', 'off', true);

  UPDATE public.merchants SET
    shop_name = COALESCE(NULLIF(patch->>'shop_name', ''), shop_name),
    address = COALESCE(NULLIF(patch->>'address', ''), address),
    phone = NULLIF(patch->>'phone', ''),
    city = NULLIF(patch->>'city', ''),
    category = COALESCE(NULLIF(patch->>'category', ''), category),
    description = NULLIF(patch->>'description', ''),
    lat = CASE
      WHEN patch ? 'lat' AND nullif(trim(patch->>'lat'), '') IS NOT NULL
      THEN (patch->>'lat')::double precision
      ELSE lat
    END,
    lng = CASE
      WHEN patch ? 'lng' AND nullif(trim(patch->>'lng'), '') IS NOT NULL
      THEN (patch->>'lng')::double precision
      ELSE lng
    END,
    updated_at = now()
  WHERE id = target_id;

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.update_merchant_as_admin(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_merchant_as_admin(uuid, jsonb) TO authenticated;
