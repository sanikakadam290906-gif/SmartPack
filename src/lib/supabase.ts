import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfigStatus } from './supabaseConfig';

const config = getSupabaseConfigStatus();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Supabase client instance.
 * If credentials are not properly configured, null is maintained to trigger graceful local fallback.
 */
export const supabase = config.isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export const isSupabaseReady = (): boolean => {
  return config.isConfigured && supabase !== null;
};
