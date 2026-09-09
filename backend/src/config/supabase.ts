import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || serviceRoleKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && (serviceRoleKey || anonKey));

// Admin client with full service-role capabilities
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Anon client for public Supabase auth operations (like verifyOtp)
export const supabaseAnon: SupabaseClient | null = isSupabaseConfigured && anonKey
  ? createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Default client backward-compatibility
export const supabase: SupabaseClient | null = supabaseAdmin || supabaseAnon;

export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Backend Supabase client is not configured. Please supply SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return supabase;
};
