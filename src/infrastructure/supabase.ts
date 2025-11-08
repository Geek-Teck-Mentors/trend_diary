import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'
import type { Context } from 'hono'

export type SupabaseAuthClient = ReturnType<typeof createSupabaseAuthClient>

export function createSupabaseAuthClient(c: Context) {
  const supabaseUrl = c.env.SUPABASE_URL
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables')
  }

  // TODO: セキュリティ - クッキー属性の確認と強制
  // Supabaseが設定するクッキーのセキュリティ属性を確認し、本番環境では以下を強制する:
  // - Secure: true (HTTPS必須、中間者攻撃対策)
  // - HttpOnly: true (XSS攻撃対策、JavaScriptからのアクセス防止)
  // - SameSite: 'Strict' または 'Lax' (CSRF攻撃対策)
  // 参考: https://supabase.com/docs/guides/auth/server-side/creating-a-client
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header('Cookie') ?? '').map((cookie) => ({
          name: cookie.name,
          value: cookie.value ?? '',
        }))
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
