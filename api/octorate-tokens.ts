import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl as string, serviceRoleKey as string);

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('octorate_tokens')
      .select('access_token, refresh_token, expires_in, updated_at')
      .eq('id', 'singleton')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  if (req.method === 'POST') {
    const { access_token, refresh_token, expires_in } = req.body;

    const { error } = await supabaseAdmin
      .from('octorate_tokens')
      .upsert({
        id: 'singleton',
        access_token,
        refresh_token,
        expires_in,
        updated_at: new Date().toISOString(),
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('octorate_tokens')
      .delete()
      .eq('id', 'singleton');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
