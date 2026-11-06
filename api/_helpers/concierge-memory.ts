import { createClient } from "@supabase/supabase-js";

export interface ConciergeMemoryItem {
  id: string;
  category: 'rule' | 'faq' | 'accommodation' | 'policy' | 'golden_example';
  title: string;
  content: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const FALLBACK_CONFIG_ID = 'concierge_memory_rules';

function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Legge tutte le regole e memorie salvate
 */
export async function getAllMemoryItems(): Promise<ConciergeMemoryItem[]> {
  const sb = getSupabaseClient();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from('concierge_memory')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as ConciergeMemoryItem[];
    }

    // Se la tabella non esiste (PGRST205), usa telegram_config come fallback
    if (error && (error.code === 'PGRST205' || error.message?.includes('does not exist') || error.message?.includes('schema cache'))) {
      const { data: fallbackRow } = await sb
        .from('telegram_config')
        .select('chat_id')
        .eq('id', FALLBACK_CONFIG_ID)
        .maybeSingle();

      if (fallbackRow?.chat_id) {
        try {
          const parsed = JSON.parse(fallbackRow.chat_id);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          return [];
        }
      }
    }
  } catch (err) {
    console.warn('[getAllMemoryItems] Error reading memory items:', err);
  }

  return [];
}

/**
 * Restituisce le regole attive formattate in blocco di testo per DeepSeek prompt injection
 */
export async function getActiveRulesPromptContext(): Promise<string> {
  const items = await getAllMemoryItems();
  const activeItems = items.filter(item => item.active !== false);

  if (activeItems.length === 0) {
    return '';
  }

  const lines = [
    '=== MANAGEMENT DIRECTIVES & LEARNED RULES (HIGHEST PRIORITY) ===',
    'The following directives were explicitly established by resort management (Marco) through past feedback.',
    'You MUST STRICTLY follow and incorporate these rules in your response:'
  ];

  activeItems.forEach((item, idx) => {
    lines.push(`[Rule #${idx + 1}] (${item.title}): ${item.content}`);
  });

  return lines.join('\n');
}

/**
 * Salva una nuova regola o direttiva appresa
 */
export async function saveMemoryItem(params: {
  title: string;
  content: string;
  category?: 'rule' | 'faq' | 'accommodation' | 'policy' | 'golden_example';
  active?: boolean;
}): Promise<ConciergeMemoryItem> {
  const sb = getSupabaseClient();
  const newItem: ConciergeMemoryItem = {
    id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    category: params.category || 'rule',
    title: params.title.trim(),
    content: params.content.trim(),
    active: params.active !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!sb) return newItem;

  try {
    // Prova ad inserire nella tabella dedicata
    const { data, error } = await sb
      .from('concierge_memory')
      .insert({
        category: newItem.category,
        title: newItem.title,
        content: newItem.content,
        active: newItem.active
      })
      .select()
      .single();

    if (!error && data) {
      return data as ConciergeMemoryItem;
    }

    // Fallback su telegram_config
    const existing = await getAllMemoryItems();
    const updated = [newItem, ...existing.filter(i => i.id !== newItem.id)];

    await sb
      .from('telegram_config')
      .upsert({
        id: FALLBACK_CONFIG_ID,
        bot_token: 'memory_store',
        chat_id: JSON.stringify(updated),
        updated_at: new Date().toISOString()
      });

    return newItem;
  } catch (err) {
    console.error('[saveMemoryItem] Error saving rule:', err);
    return newItem;
  }
}

/**
 * Attiva o disattiva una regola
 */
export async function toggleMemoryItem(id: string, active: boolean): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('concierge_memory')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) return true;

    // Fallback su telegram_config
    const existing = await getAllMemoryItems();
    const updated = existing.map(item => item.id === id ? { ...item, active, updated_at: new Date().toISOString() } : item);

    await sb
      .from('telegram_config')
      .upsert({
        id: FALLBACK_CONFIG_ID,
        bot_token: 'memory_store',
        chat_id: JSON.stringify(updated),
        updated_at: new Date().toISOString()
      });

    return true;
  } catch (err) {
    console.error('[toggleMemoryItem] Error toggling rule:', err);
    return false;
  }
}

/**
 * Elimina una regola memorizzata
 */
export async function deleteMemoryItem(id: string): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    const { error } = await sb
      .from('concierge_memory')
      .delete()
      .eq('id', id);

    if (!error) return true;

    // Fallback su telegram_config
    const existing = await getAllMemoryItems();
    const updated = existing.filter(item => item.id !== id);

    await sb
      .from('telegram_config')
      .upsert({
        id: FALLBACK_CONFIG_ID,
        bot_token: 'memory_store',
        chat_id: JSON.stringify(updated),
        updated_at: new Date().toISOString()
      });

    return true;
  } catch (err) {
    console.error('[deleteMemoryItem] Error deleting rule:', err);
    return false;
  }
}

