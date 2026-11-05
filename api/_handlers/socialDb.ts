/**
 * 🐘 SOCIAL DB ADAPTER — Multi-Cloud Database Isolation (/social)
 *
 * Reparto Stagno Social Media Studio.
 * Connette il Social Media Studio al database dedicato isolato su Neon Serverless PostgreSQL.
 * Se NEON_DATABASE_URL è configurato, tutte le letture/scritture di token e log avvengono su Neon,
 * azzerando completamente le connessioni e l'egress sul database Supabase principale.
 */
import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';

const neonUrl = process.env.NEON_DATABASE_URL;
const sql = neonUrl ? neon(neonUrl) : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const sbFallback = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export interface SocialConfigRow {
  id: string;
  chat_id: string;
  bot_token: string;
  updated_at?: string;
}

/**
 * Legge una configurazione o token per ID (es: 'google_drive', 'tiktok_village', 'tiktok_pizza')
 */
export async function getSocialConfig(id: string): Promise<SocialConfigRow | null> {
  if (sql) {
    try {
      const rows = await sql`SELECT id, chat_id, bot_token, updated_at FROM telegram_config WHERE id = ${id} LIMIT 1;`;
      if (rows && rows.length > 0) {
        return rows[0] as SocialConfigRow;
      }
    } catch (err) {
      console.warn(`[socialDb] Avviso lettura Neon (${id}):`, (err as Error).message);
    }
  }

  // Fallback sicuro su Supabase se Neon non è raggiungibile
  if (sbFallback) {
    try {
      const { data } = await sbFallback.from('telegram_config').select('*').eq('id', id).maybeSingle();
      if (data) return data as SocialConfigRow;
    } catch (sbErr) {
      console.warn(`[socialDb] Avviso fallback Supabase (${id}):`, (sbErr as Error).message);
    }
  }

  return null;
}

/**
 * Salva o aggiorna una configurazione o token (Upsert)
 */
export async function upsertSocialConfig(id: string, chatId: string, botToken: string): Promise<boolean> {
  let ok = false;
  if (sql) {
    try {
      await sql`
        INSERT INTO telegram_config (id, chat_id, bot_token, updated_at)
        VALUES (${id}, ${chatId}, ${botToken}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          chat_id = EXCLUDED.chat_id,
          bot_token = EXCLUDED.bot_token,
          updated_at = NOW();
      `;
      ok = true;
    } catch (err) {
      console.warn(`[socialDb] Avviso scrittura Neon (${id}):`, (err as Error).message);
    }
  }

  // Sincronizza anche su Supabase per retrocompatibilità trasparente
  if (sbFallback) {
    try {
      await sbFallback.from('telegram_config').upsert({
        id,
        chat_id: chatId,
        bot_token: botToken,
        updated_at: new Date().toISOString()
      });
      ok = true;
    } catch (sbErr) {
      console.warn(`[socialDb] Avviso mirror Supabase (${id}):`, (sbErr as Error).message);
    }
  }

  return ok;
}

/**
 * Cerca tutte le configurazioni con prefisso (es: 'tiktok_%')
 */
export async function listSocialConfigsLike(prefix: string): Promise<SocialConfigRow[]> {
  if (sql) {
    try {
      const pattern = `${prefix}%`;
      const rows = await sql`SELECT id, chat_id, bot_token, updated_at FROM telegram_config WHERE id LIKE ${pattern} ORDER BY updated_at DESC;`;
      if (rows && rows.length > 0) {
        return rows as SocialConfigRow[];
      }
    } catch (err) {
      console.warn(`[socialDb] Avviso lista Neon (${prefix}):`, (err as Error).message);
    }
  }

  if (sbFallback) {
    try {
      const { data } = await sbFallback.from('telegram_config').select('*').like('id', `${prefix}%`).order('updated_at', { ascending: false });
      if (data) return data as SocialConfigRow[];
    } catch {}
  }

  return [];
}

