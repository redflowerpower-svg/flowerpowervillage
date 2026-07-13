import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl as string, serviceRoleKey as string);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, redirectUri } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  const clientId = process.env.VITE_OCTORATE_CLIENT_ID;
  const clientSecret = process.env.OCTORATE_SECRET_KEY;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Server configuration missing (Client ID or Secret)' });
  }

  try {
    const octorateUrl = "https://api.octorate.com/octobook/rest/v1/identity/token";
    
    const bodyParams = new URLSearchParams({
      grant_type: "code",
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri || "https://localhost/",
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
      return res.status(response.status).json({ error: `Octorate exchange failed: ${errorBody}` });
    }

    const tokens = await response.json();

    // Salva direttamente nel database bypassando le policy pubbliche
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
      return res.status(500).json({ error: `Database storage failed: ${dbError.message}` });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
