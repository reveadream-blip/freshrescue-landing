-- Bucket public pour photos offres / logos (chemin : {auth.uid()}/ fichier).
-- À appliquer sur le projet Supabase : supabase db push / SQL Editor.

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "logos_public_read" ON storage.objects;
CREATE POLICY "logos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "logos_authenticated_insert_own_folder" ON storage.objects;
CREATE POLICY "logos_authenticated_insert_own_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "logos_authenticated_update_own_folder" ON storage.objects;
CREATE POLICY "logos_authenticated_update_own_folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'logos'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "logos_authenticated_delete_own_folder" ON storage.objects;
CREATE POLICY "logos_authenticated_delete_own_folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (string_to_array(name, '/'))[1] = auth.uid()::text
);
