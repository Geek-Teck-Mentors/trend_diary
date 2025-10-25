import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

export type AuthSupabaseClient = SupabaseClient

export function createAuthClient(supabaseUrl: string, supabaseAnonKey: string): AuthSupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Cookie-basedなのでfalse
      detectSessionInUrl: false,
    },
  })
}

// Admin用のSupabaseクライアント（service_role keyを使用）
export function createAdminAuthClient(
  supabaseUrl: string,
  supabaseServiceRoleKey: string,
): AuthSupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}
