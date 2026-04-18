-- =============================================================================
-- FreshRescue — Admin : suppression / mise à jour des offres (RLS + RPC)
-- Colle TOUT ce fichier dans Supabase → SQL Editor → Run
-- =============================================================================
-- Avant d’exécuter : remplace reveadream@gmail.com partout ci-dessous si besoin,
-- et mets la même liste dans src/lib/adminConfig.js (+ Edge Function si tu l’utilises).
-- =============================================================================

-- ─── Policies : DELETE / UPDATE pour les comptes admin (JWT email) ───
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

-- ─── RPC : DELETE en SECURITY DEFINER (désactive RLS le temps du DELETE) ───
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

  PERFORM set_config('row_security', 'off', true);

  DELETE FROM public.offers WHERE id = target_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_offer_as_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_offer_as_admin(uuid) TO authenticated;

-- =============================================================================
-- Fin. Test : connecté en admin, appelle depuis l’app ou :
--   select public.delete_offer_as_admin('uuid-offer-ici'::uuid);
-- =============================================================================
