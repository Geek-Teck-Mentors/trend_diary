import type { SupabaseAuthUser } from './user'

/**
 * Supabase Auth セッションモデル
 */
export type SupabaseAuthSession = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt?: number
  user: SupabaseAuthUser
}
