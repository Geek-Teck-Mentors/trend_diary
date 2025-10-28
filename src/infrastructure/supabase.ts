import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { Context } from 'hono'

export type SupabaseAuthClient = ReturnType<typeof createSupabaseAuthClient>

export function createSupabaseAuthClient(c: Context) {
  const supabaseUrl = c.env.SUPABASE_URL
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header('Cookie') ?? '') as { name: string; value: string }[]
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          c.header('Set-Cookie', serializeCookieHeader(name, value, options), {
            append: true,
          })
        })
      },
    },
  })
}
