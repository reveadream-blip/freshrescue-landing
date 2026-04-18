import { supabase } from '@/lib/supabase';

const BUCKET = 'logos';

/**
 * Upload image offre vers Storage Supabase (bucket `logos`).
 * Chemin : `{userId}/{timestamp}.jpg` — doit correspondre aux policies RLS (dossier = auth.uid()).
 */
export async function uploadOfferPhotoToStorage(userId, jpegBlob) {
  const fileName = `${userId}/${Date.now()}.jpg`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(fileName, jpegBlob, {
    contentType: 'image/jpeg',
    upsert: true,
    cacheControl: '3600',
  });

  if (error) {
    const hint =
      error.message?.includes('Bucket not found') || error.message?.includes('not found')
        ? ' — Créez le bucket « logos » dans Supabase Storage ou appliquez la migration SQL du dépôt.'
        : error.message?.includes('new row violates row-level security') ||
            error.message?.includes('RLS')
          ? ' — Vérifiez les policies Storage sur le bucket logos (fichier dans dossier = votre user id).'
          : '';
    throw new Error(`${error.message}${hint}`);
  }

  const path = data?.path || fileName;
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}
