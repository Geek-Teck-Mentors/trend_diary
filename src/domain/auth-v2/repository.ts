import { type AsyncResult } from '@yuukihayashi0510/core'
import { ClientError, ServerError } from '@/common/errors'
import type { AuthenticationSession } from './schema/authenticationSession'
import type { AuthenticationUser } from './schema/authenticationUser'

/**
 * 認証v2のサインアップ結果
 */
export type AuthV2SignupResult = {
  user: AuthenticationUser
  session: AuthenticationSession | null
}

/**
 * 認証v2のログイン結果
 */
export type AuthV2LoginResult = {
  user: AuthenticationUser
  session: AuthenticationSession
}

export interface AuthV2Repository {
  /**
   * ユーザーを作成する
   */
  signup(
    email: string,
    password: string,
  ): AsyncResult<AuthV2SignupResult, ClientError | ServerError>

  /**
   * ログインする
   */
  login(email: string, password: string): AsyncResult<AuthV2LoginResult, ClientError | ServerError>

  /**
   * ログアウトする
   */
  logout(): AsyncResult<void, ServerError>

  /**
   * 現在のユーザーを取得する
   */
  getCurrentUser(): AsyncResult<AuthenticationUser, ServerError>

  /**
   * セッションを更新する
   */
  refreshSession(): AsyncResult<AuthV2LoginResult, ServerError>
}
