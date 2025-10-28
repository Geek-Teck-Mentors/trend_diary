import type { AuthenticationUser } from './user'

/**
 * 認証セッションモデル
 */
export type AuthenticationSession = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  expiresAt?: number
  user: AuthenticationUser
}
