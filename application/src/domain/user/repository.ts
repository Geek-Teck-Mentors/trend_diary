import { AsyncResult } from '@yuukihayashi0510/core'
import { ClientError, ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'

import type { CurrentUser } from './schema/active-user-schema'
import { AuthenticationSession, AuthenticationUser } from './schema/auth-schema'

export interface Query {
  findActiveById(id: bigint): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByAuthenticationId(authenticationId: string): AsyncResult<Nullable<CurrentUser>, Error>
}

export interface Command {
  createActiveWithAuthenticationId(
    email: string,
    authenticationId: string,
    displayName?: string | null,
  ): AsyncResult<CurrentUser, ServerError>
}

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

  /**
   * ユーザーを削除する（補償トランザクション用）
   */
  deleteUser(userId: string): AsyncResult<void, ServerError>
}
