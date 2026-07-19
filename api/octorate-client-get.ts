import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null as any;

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase configuration missing (URL or Service Role Key)' });
  }

  try {

    const { data, error } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token, refresh_token, expires_in, updated_at')
      .eq('id', 'singleton')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
