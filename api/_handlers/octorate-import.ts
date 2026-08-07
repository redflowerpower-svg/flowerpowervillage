import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

/**
 * Filter to exclude virtual rate plans, channel sub-derivations, and non-physical room entries.
 */
export function isValidPhysicalBooking(room: any): boolean {
  if (!room) return false;
  const name = String(room.name || room.title || room.basicName || '').toLowerCase();
  
  // Exclude virtual OTA derived rate plans and test keywords if not a physical room
  const isVirtualPlan = name.includes('14d') || 
                        name.includes('7d') || 
                        name.includes('airbnb ac') || 
                        name.includes('non rimborsabile') || 
                        name.includes('notrefundable') || 
                        name.includes('derived');
                        
  if (isVirtualPlan) return false;
  return true;
}

export async function handleOctorateImport(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  try {
    // 1. GET Request: Compare Octorate Live Specs vs Supabase DB
    if (req.method === 'GET') {
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('octorate_tokens')
        .select('access_token')
        .eq('id', 'singleton')
        .maybeSingle();

      if (tokenError || !tokenData?.access_token) {
        return res.status(400).json({ error: 'Nessun token di accesso Octorate valido presente nel database.' });
      }

      const accessToken = tokenData.access_token;
      const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || "366879";

      // Query Octorate REST API v3 / v2 for room rates & amenities
      let octorateRawRooms: any[] = [];
      const v3Url = `https://api.octorate.com/connect/rest/v3/roomrates/${structureId}`;
      let octRes = await fetch(v3Url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!octRes.ok) {
        // Fallback to v2 roomrates if v3 requires different parameters
        const v2Url = `https://api.octorate.com/connect/rest/v2/roomrates/${structureId}`;
        octRes = await fetch(v2Url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
      }

      if (!octRes.ok) {
        // Second Fallback to v1 roomrates
        const v1Url = `https://api.octorate.com/connect/rest/v1/roomrates/${structureId}`;
        octRes = await fetch(v1Url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
      }

      if (octRes.ok) {
        const json = await octRes.json();
        octorateRawRooms = Array.isArray(json) ? json : (json.data || json.roomRates || json.rooms || []);
      } else {
        console.warn('[octorate-import] Warning: Octorate roomrates returned status', octRes.status);
      }

      // Filter physical rooms
      const physicalOctorateRooms = octorateRawRooms.filter(isValidPhysicalBooking);

      // Read current Supabase DB accommodations
      const { data: dbAccommodations, error: dbError } = await supabaseAdmin
        .from('accommodations')
        .select('*')
        .order('name');

      if (dbError) {
        return res.status(500).json({ error: `Impossibile leggere la tabella accommodations da Supabase: ${dbError.message}` });
      }

      // Map comparison
      const comparisons = (dbAccommodations || []).map((dbItem: any) => {
        // Find matching live room from Octorate by octorateId or name match
        const octMatch = physicalOctorateRooms.find((r: any) => 
          (r.id && Number(r.id) === Number(dbItem.octorateId)) ||
          (r.accommodationId && Number(r.accommodationId) === Number(dbItem.octorateId)) ||
          (r.name && String(r.name).toLowerCase().includes(String(dbItem.name || dbItem.slug).toLowerCase()))
        ) || null;

        const octAmenities = octMatch ? (
          Array.isArray(octMatch.roomAmenities) ? octMatch.roomAmenities :
          Array.isArray(octMatch.amenities) ? octMatch.amenities :
          (typeof octMatch.roomAmenities === 'string' ? octMatch.roomAmenities.split(',') : [])
        ) : [];

        return {
          id: dbItem.id,
          slug: dbItem.slug,
          name: dbItem.name || dbItem.title,
          category: dbItem.category || dbItem.type,
          octorateId: dbItem.octorateId,
          dbData: {
            rooms: dbItem.rooms || dbItem.bedroomQuantity || 1,
            bathrooms: dbItem.bathrooms || dbItem.bathroomQuantity || 1,
            beds: dbItem.beds || (dbItem.bedQuantity ? `${dbItem.bedQuantity} Letti` : '1 Letti'),
            squareMeters: dbItem.squareMeters || dbItem.squareMetersSize || 0,
            features: Array.isArray(dbItem.features) ? dbItem.features : (dbItem.features ? [dbItem.features] : []),
            headline: dbItem.headline || dbItem.title || '',
            description: dbItem.description || ''
          },
          octorateData: octMatch ? {
            id: octMatch.id,
            name: octMatch.name || octMatch.headline || '',
            bedroomQuantity: octMatch.bedroomQuantity ?? octMatch.rooms ?? 1,
            bathroomQuantity: octMatch.bathroomQuantity ?? octMatch.bathrooms ?? 1,
            bedQuantity: octMatch.bedQuantity ?? 1,
            squareMetersSize: octMatch.squareMetersSize ?? octMatch.squareMeters ?? 0,
            roomAmenities: octAmenities.map((a: any) => typeof a === 'string' ? a.trim() : (a.name || String(a))).filter(Boolean),
            headline: octMatch.headline || octMatch.name || '',
            description: octMatch.description || ''
          } : null
        };
      });

      return res.status(200).json({
        success: true,
        count: comparisons.length,
        comparisons
      });
    }

    // 2. POST Request: Apply Selected Import Updates to Supabase Table 'accommodations'
    if (req.method === 'POST') {
      const { updates } = req.body || {};
      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Payload vuoto. Fornire un array "updates" di alloggi da aggiornare.' });
      }

      const updateResults: any[] = [];
      for (const item of updates) {
        if (!item.id && !item.slug) continue;

        const updatePayload: Record<string, any> = {};

        if (item.syncBedsBath) {
          if (item.bedroomQuantity !== undefined) updatePayload.rooms = item.bedroomQuantity;
          if (item.bathroomQuantity !== undefined) updatePayload.bathrooms = item.bathroomQuantity;
          if (item.bedQuantity !== undefined) updatePayload.beds = `${item.bedQuantity} Letti`;
          if (item.squareMetersSize !== undefined) updatePayload.squareMeters = item.squareMetersSize;
        }

        if (item.syncAmenities && Array.isArray(item.roomAmenities)) {
          updatePayload.features = item.roomAmenities;
        }

        if (item.syncDescription) {
          if (item.headline) updatePayload.headline = item.headline;
          if (item.description) updatePayload.description = item.description;
        }

        if (Object.keys(updatePayload).length === 0) continue;

        let query = supabaseAdmin.from('accommodations').update(updatePayload);
        if (item.id) {
          query = query.eq('id', item.id);
        } else {
          query = query.eq('slug', item.slug);
        }

        const { data, error } = await query.select();
        if (error) {
          console.error(`[octorate-import] Error updating room ${item.id || item.slug}:`, error);
          updateResults.push({ id: item.id || item.slug, success: false, error: error.message });
        } else {
          updateResults.push({ id: item.id || item.slug, success: true, updatedFields: Object.keys(updatePayload) });
        }
      }

      return res.status(200).json({
        success: true,
        updatedCount: updateResults.filter(r => r.success).length,
        results: updateResults
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[api/resort/octorate-import] Exception:', error);
    return res.status(500).json({ error: error.message });
  }
}
