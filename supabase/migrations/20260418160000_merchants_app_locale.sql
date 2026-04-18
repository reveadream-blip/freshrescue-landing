-- Langue d’interface du commerçant (pour relances admin, etc.)
ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS app_locale text;

ALTER TABLE public.merchants
  DROP CONSTRAINT IF EXISTS merchants_app_locale_check;

ALTER TABLE public.merchants
  ADD CONSTRAINT merchants_app_locale_check
  CHECK (app_locale IS NULL OR app_locale IN ('en', 'fr', 'de', 'it', 'ru'));

COMMENT ON COLUMN public.merchants.app_locale IS
  'Langue UI du commerçant (en/fr/de/it/ru). Synchronisée depuis l’app ; utilisée pour le texte des relances admin.';

-- Le commerçant peut mettre à jour sa propre ligne (ex. app_locale) en plus des politiques admin existantes.
DROP POLICY IF EXISTS "merchants_owner_update" ON public.merchants;
CREATE POLICY "merchants_owner_update"
ON public.merchants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
