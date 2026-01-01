import { AsyncResult } from '@yuukihayashi0510/core'
import { ClientError, ServerError } from '@/common/errors'
import { Nullable } from '@/common/types/utility'

import { CreateSessionInput } from './dto'
import type { ActiveUser, CurrentUser } from './schema/activeUserSchema'
import { AuthenticationSession } from './schema/authenticationSession'
import { AuthenticationUser } from './schema/authenticationUser'

export interface Query {
  findActiveById(id: bigint): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByEmail(email: string): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByEmailForAuth(email: string): AsyncResult<Nullable<ActiveUser>, Error>
  findActiveBySessionId(sessionId: string): AsyncResult<Nullable<CurrentUser>, Error>
  findActiveByAuthenticationId(authenticationId: string): AsyncResult<Nullable<CurrentUser>, Error>
}

export interface Command {
  createActive(email: string, hashedPassword: string): AsyncResult<CurrentUser, ServerError>
  createActiveWithAuthenticationId(
    email: string,
    hashedPassword: string,
    authenticationId: string,
    displayName?: string | null,
  ): AsyncResult<CurrentUser, ServerError>
  saveActive(activeUser: ActiveUser): AsyncResult<CurrentUser, ServerError>
  createSession(
    input: CreateSessionInput,
  ): AsyncResult<{ sessionId: string; expiresAt: Date }, ServerError>
  deleteSession(sessionId: string): AsyncResult<void, ServerError>
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
}
