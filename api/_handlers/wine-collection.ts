import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function handleWineCollection(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabaseAdmin();

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.storage
        .from('site-images')
        .download('wine_collection.json');

      if (error || !data) {
        return res.status(200).json({ success: false, message: 'No cloud collection found', collection: [] });
      }

      const text = await data.text();
      const collection = JSON.parse(text);
      return res.status(200).json({ success: true, collection });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { collection, uploadImage } = req.body || {};
      let uploadedImageUrl: string | undefined = undefined;

      // Se c'è un'immagine da caricare via backend con service_role (bypassa RLS 100%)
      if (uploadImage && uploadImage.dataBase64 && uploadImage.fileName) {
        const cleanName = uploadImage.fileName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || `bottle-${Date.now()}`;

        const storagePath = `14-Wines/${cleanName}.webp`;

        // Strip data:image/...;base64, prefix if present
        const base64Data = uploadImage.dataBase64.replace(/^data:image\/[a-z0-9]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const { error: upErr } = await supabase.storage
          .from('delivery_food')
          .upload(storagePath, buffer, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true
          });

        if (upErr) {
          console.error('[API wine-collection] Image upload error:', upErr);
          return res.status(500).json({ success: false, error: `Image upload failed: ${upErr.message}` });
        }

        const { data: pubData } = supabase.storage
          .from('delivery_food')
          .getPublicUrl(storagePath);

        uploadedImageUrl = pubData.publicUrl;
      }

      // Se viene inviata la collezione aggiornata, salvala sul cloud in site-images/wine_collection.json
      if (Array.isArray(collection) && collection.length > 0) {
        const jsonBuffer = Buffer.from(JSON.stringify(collection, null, 2), 'utf8');
        const { error: saveErr } = await supabase.storage
          .from('site-images')
          .upload('wine_collection.json', jsonBuffer, {
            contentType: 'application/json',
            cacheControl: '0',
            upsert: true
          });

        if (saveErr) {
          console.error('[API wine-collection] JSON save error:', saveErr);
          return res.status(500).json({ success: false, error: `JSON save failed: ${saveErr.message}` });
        }
      }

      return res.status(200).json({
        success: true,
        imageUrl: uploadedImageUrl,
        collectionCount: collection?.length || 0
      });
    } catch (err: any) {
      console.error('[API wine-collection] Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
