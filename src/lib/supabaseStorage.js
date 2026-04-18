import { supabase } from '@/lib/supabase';

/** Supprime un fichier du bucket `logos` à partir de son URL publique. */
export async function deletePhotoFromLogosBucket(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string') return;
  try {
    const parts = photoUrl.split('/logos/');
    if (parts.length < 2) return;
    const filePath = parts[1].split('?')[0];
    const { error } = await supabase.storage.from('logos').remove([filePath]);
    if (error) console.error('[storage] logos remove:', error.message);
  } catch (e) {
    console.error('[storage]', e);
  }
}
