-- FreshRescue : admins (emails = src/lib/adminConfig.js) peuvent supprimer / modifier toutes les offres.
-- À exécuter dans Supabase → SQL Editor (tout le fichier).
-- Si tu changes l’email admin, mets à jour les deux endroits ci-dessous ET adminConfig.js

-- ─── Policies JWT (si ton JWT expose bien "email") ───
DROP POLICY IF EXISTS "offers_admin_delete" ON public.offers;
CREATE POLICY "offers_admin_delete"
ON public.offers
FOR DELETE
TO authenticated
USING (
  coalesce(auth.jwt() ->> 'email', '') IN (
    'reveadream@gmail.com'
  )
);

DROP POLICY IF EXISTS "offers_admin_update" ON public.offers;
CREATE POLICY "offers_admin_update"
ON public.offers
FOR UPDATE
TO authenticated
USING (
  coalesce(auth.jwt() ->> 'email', '') IN (
    'reveadream@gmail.com'
  )
)
WITH CHECK (true);

-- ─── RPC : contourne la RLS pendant le DELETE (row_security off dans la transaction) ───
CREATE OR REPLACE FUNCTION public.delete_offer_as_admin(target_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  deleted_count int;
BEGIN
  SELECT u.email INTO user_email FROM auth.users u WHERE u.id = auth.uid();
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF lower(trim(user_email)) <> lower('reveadream@gmail.com') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- Important : sans ceci, la RLS peut bloquer même dans une fonction SECURITY DEFINER
  PERFORM set_config('row_security', 'off', true);

  DELETE FROM public.offers WHERE id = target_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_offer_as_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_offer_as_admin(uuid) TO authenticated;
