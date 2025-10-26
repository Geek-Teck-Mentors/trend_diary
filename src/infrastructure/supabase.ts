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
        const cookies = parseCookieHeader(c.req.header('Cookie') ?? '')
        // valueがundefinedの場合は空文字列に変換
        return cookies.map(({ name, value }) => ({ name, value: value ?? '' }))
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
