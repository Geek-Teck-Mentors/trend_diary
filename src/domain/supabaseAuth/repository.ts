import { type AsyncResult } from '@yuukihayashi0510/core'
import { ClientError, ServerError } from '@/common/errors'
import type { AuthenticationSession } from './schema/authenticationSession'
import type { AuthenticationUser } from './schema/authenticationUser'

/**
 * Supabase認証のサインアップ結果
 */
export type SupabaseSignupResult = {
  user: AuthenticationUser
  session: AuthenticationSession | null
}

/**
 * Supabase認証のログイン結果
 */
export type SupabaseLoginResult = {
  user: AuthenticationUser
  session: AuthenticationSession
}

export interface SupabaseAuthenticationRepository {
  /**
   * ユーザーを作成する
   */
  signup(
    email: string,
    password: string,
  ): AsyncResult<SupabaseSignupResult, ClientError | ServerError>

  /**
   * ログインする
   */
  login(
    email: string,
    password: string,
  ): AsyncResult<SupabaseLoginResult, ClientError | ServerError>

  /**
   * ログアウトする
   */
  logout(): AsyncResult<void, ServerError>

  /**
   * 現在のユーザーを取得する
   */
  getCurrentUser(): AsyncResult<AuthenticationUser | null, ServerError>

  /**
   * セッションを更新する
   */
  refreshSession(): AsyncResult<SupabaseLoginResult, ServerError>
}
