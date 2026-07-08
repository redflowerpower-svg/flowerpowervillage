// Re-export from the canonical Supabase client.
// All pizza module code should import directly from ../../lib/supabase and ../types.
export { supabase } from '../../lib/supabase';
export type { CartItemSaved, PizzaOrder } from '../types';
