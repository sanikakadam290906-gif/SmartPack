/**
 * Supabase Environment Configuration Checker for SmartPack
 * 
 * Safely inspects whether Supabase environment variables are present and valid
 * WITHOUT logging, printing, or exposing private keys or sensitive tokens.
 */

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasValidUrl: boolean;
  hasValidKey: boolean;
  projectHost: string | null;
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const isPlaceholderUrl = !url || url.includes('your-project-id') || url.includes('your-project-ref');
  const isPlaceholderKey = !key || key === 'your-anon-public-key';

  const hasValidUrl = typeof url === 'string' && url.startsWith('https://') && !isPlaceholderUrl;
  const hasValidKey = typeof key === 'string' && key.length > 20 && !isPlaceholderKey;

  let projectHost: string | null = null;
  if (hasValidUrl) {
    try {
      const parsed = new URL(url);
      projectHost = parsed.hostname; // e.g. "abcdefghijklm.supabase.co"
    } catch {
      projectHost = null;
    }
  }

  return {
    isConfigured: hasValidUrl && hasValidKey,
    hasValidUrl,
    hasValidKey,
    projectHost,
  };
}
