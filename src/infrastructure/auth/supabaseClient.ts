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
