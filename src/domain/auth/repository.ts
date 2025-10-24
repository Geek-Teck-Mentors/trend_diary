import type { ClientError, ServerError } from '@/common/errors'
import type { AsyncResult } from '@/common/types/utility'

export type AuthUser = {
  id: string // Supabase Auth UUID
  email: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: AuthUser
}

export interface AuthRepository {
  /**
   * Supabase Authでユーザーを作成
   */
  signUp(email: string, password: string): AsyncResult<AuthUser, ClientError | ServerError>

  /**
   * Supabase Authでログイン
   */
  signIn(email: string, password: string): AsyncResult<AuthSession, ClientError | ServerError>

  /**
   * Supabase Authでログアウト
   */
  signOut(): AsyncResult<void, ClientError | ServerError>

  /**
   * アクセストークンからユーザー情報を取得
   */
  getUser(accessToken: string): AsyncResult<AuthUser, ClientError | ServerError>
}
