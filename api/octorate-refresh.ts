import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
  const clientSecret = process.env.OCTORATE_SECRET_KEY;


  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server configuration missing (Client ID or Secret)' });
  }

  try {
    // 1. Recupera il refresh token attuale dal database
    const { data: currentTokens, error: fetchError } = await supabaseAdmin
      .from('octorate_tokens')
      .select('refresh_token')
      .eq('id', 'singleton')
      .maybeSingle();

    if (fetchError || !currentTokens?.refresh_token) {
      return res.status(400).json({ error: 'No refresh token available in database' });
    }

    // 2. Prepara la chiamata verso Octorate
    const octorateUrl = "https://api.octorate.com/connect/rest/v1/identity/refresh";
    
    const bodyParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: currentTokens.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await fetch(octorateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({ error: `Octorate refresh failed: ${errorBody}` });
    }

    const tokens = await response.json();

    // 3. Aggiorna il database con i nuovi token
    const { error: dbError } = await supabaseAdmin
      .from('octorate_tokens')
      .upsert({
        id: 'singleton',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      return res.status(500).json({ error: `Database storage update failed: ${dbError.message}` });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
