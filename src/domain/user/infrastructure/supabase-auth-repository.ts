import {
  AuthInvalidCredentialsError,
  AuthSessionMissingError,
  type Session,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js'
import {
  type AsyncResult,
  failure,
  isFailure,
  type Result,
  success,
  wrapAsyncCall,
} from '@yuukihayashi0510/core'
import { AlreadyExistsError, ClientError, ServerError } from '@/common/errors'
import UnauthorizedError from '@/common/errors/unauthorized-error'
import type { AuthV2LoginResult, AuthV2Repository, AuthV2SignupResult } from '../repository'
import type { AuthenticationUser } from '../schema/auth-schema'

/**
 * Supabaseのユーザー登録エラーが「既に存在する」ことを示すかチェック
 * NOTE: Supabaseのバージョンアップでエラーメッセージが変わる可能性がある
 * 現時点では専用のエラー型が提供されていないため、メッセージ文字列で判定している
 */
function isUserAlreadyExistsError(error: { message: string }): boolean {
  return error.message.includes('already registered')
}

export class SupabaseAuthRepository implements AuthV2Repository {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Supabaseのユーザーオブジェクトを AuthenticationUser 型に変換する共通ヘルパー
   */
  private toAuthenticationUser(
    user: User,
    fallbackEmail?: string,
  ): Result<AuthenticationUser, ServerError> {
    const email = user.email ?? fallbackEmail
    if (!email) {
      return failure(new ServerError('User email is missing from Supabase response'))
    }

    return success({
      id: user.id,
      email,
      emailConfirmedAt: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      createdAt: new Date(user.created_at),
    })
  }

  /**
   * Supabaseのセッションオブジェクトを session 型に変換する共通ヘルパー
   */
  private toSessionObject(session: Session, user: AuthenticationUser) {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresIn: session.expires_in ?? 3600,
      expiresAt: session.expires_at,
      user,
    }
  }

  async signup(
    email: string,
    password: string,
  ): AsyncResult<AuthV2SignupResult, ClientError | ServerError> {
    const result = await wrapAsyncCall(() =>
      this.client.auth.signUp({
        email,
        password,
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const { data, error } = result.data
    if (error) {
      // 既に存在するユーザーの場合は AlreadyExistsError を返す
      // UX上、「既に使用されています」と明示することは一般的であり、
      // セキュリティリスクも比較的小さいと判断
      if (isUserAlreadyExistsError(error)) {
        return failure(new AlreadyExistsError('User already exists'))
      }

      // その他のエラーは一般化（Supabaseの内部エラーメッセージを露出しない）
      return failure(new ServerError('Authentication service error'))
    }

    if (!data.user) {
      return failure(new ServerError('User registration failed'))
    }

    const userResult = this.toAuthenticationUser(data.user, email)
    if (isFailure(userResult)) {
      return userResult
    }

    let session: AuthV2SignupResult['session'] = null
    if (data.session) {
      session = this.toSessionObject(data.session, userResult.data)
    }

    return success({
      user: userResult.data,
      session,
    })
  }

  async login(
    email: string,
    password: string,
  ): AsyncResult<AuthV2LoginResult, ClientError | ServerError> {
    const result = await wrapAsyncCall(() =>
      this.client.auth.signInWithPassword({
        email,
        password,
      }),
    )
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const { data, error } = result.data
    if (error) {
      // 認証失敗（型安全なチェック）
      if (error instanceof AuthInvalidCredentialsError) {
        return failure(new ClientError('Invalid email or password', 401))
      }

      // その他のエラーも一般化（Supabaseの内部エラーメッセージを露出しない）
      return failure(new ServerError('Authentication service error'))
    }

    if (!data.user || !data.session) {
      return failure(new ServerError('Authentication failed'))
    }

    const userResult = this.toAuthenticationUser(data.user, email)
    if (isFailure(userResult)) {
      return userResult
    }

    const session = this.toSessionObject(data.session, userResult.data)

    return success({
      user: userResult.data,
      session,
    })
  }

  async logout(): AsyncResult<void, ServerError> {
    const result = await wrapAsyncCall(() => this.client.auth.signOut())
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const { error } = result.data
    if (error) {
      // Supabaseの内部エラーメッセージを露出しない
      return failure(new ServerError('Logout failed'))
    }

    return success(undefined)
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser, ServerError> {
    const result = await wrapAsyncCall(() => this.client.auth.getUser())
    if (isFailure(result)) {
      if (result.error instanceof AuthSessionMissingError) {
        return failure(
          new UnauthorizedError('session not found', {
            sessionExists: false,
          }),
        )
      }
      return failure(new ServerError(result.error))
    }

    const {
      data: { user },
    } = result.data

    if (!user) {
      return failure(
        new UnauthorizedError('session not found', {
          sessionExists: true,
        }),
      )
    }

    const authUserResult = this.toAuthenticationUser(user)
    if (isFailure(authUserResult)) {
      return authUserResult
    }

    return success(authUserResult.data)
  }

  async refreshSession(): AsyncResult<AuthV2LoginResult, ServerError> {
    const result = await wrapAsyncCall(() => this.client.auth.refreshSession())
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const {
      data: { session },
      error,
    } = result.data
    if (error || !session) {
      // Supabaseの内部エラーメッセージを露出しない
      return failure(new ServerError('Session refresh failed'))
    }

    const userResult = this.toAuthenticationUser(session.user)
    if (isFailure(userResult)) {
      return userResult
    }

    return success({
      user: userResult.data,
      session: this.toSessionObject(session, userResult.data),
    })
  }

  async deleteUser(userId: string): AsyncResult<void, ServerError> {
    const result = await wrapAsyncCall(() => this.client.auth.admin.deleteUser(userId))
    if (isFailure(result)) {
      return failure(new ServerError(result.error))
    }

    const { error } = result.data
    if (error) {
      return failure(new ServerError('User deletion failed'))
    }

    return success(undefined)
  }
}
