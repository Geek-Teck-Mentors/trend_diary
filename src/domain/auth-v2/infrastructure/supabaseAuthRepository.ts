import { AuthInvalidCredentialsError, type SupabaseClient } from '@supabase/supabase-js'
import { type AsyncResult, failure, success } from '@yuukihayashi0510/core'
import { AlreadyExistsError, ClientError, ServerError } from '@/common/errors'
import type { AuthV2LoginResult, AuthV2Repository, AuthV2SignupResult } from '../repository'
import type { AuthenticationUser } from '../schema/authenticationUser'

/**
 * Supabaseのユーザー登録エラーが「既に存在する」ことを示すかチェック
 * NOTE: Supabaseのバージョンアップでエラーメッセージが変わる可能性がある
 * 現時点では専用のエラー型が提供されていないため、メッセージ文字列で判定している
 */
function isUserAlreadyExistsError(error: { message: string }): boolean {
  return error.message.includes('already registered')
}

type SupabaseUser = {
  id: string
  email?: string | null
  // biome-ignore lint/style/useNamingConvention: Supabase API response uses snake_case
  email_confirmed_at?: string | null
  // biome-ignore lint/style/useNamingConvention: Supabase API response uses snake_case
  created_at: string
}

type SupabaseSession = {
  // biome-ignore lint/style/useNamingConvention: Supabase API response uses snake_case
  access_token: string
  // biome-ignore lint/style/useNamingConvention: Supabase API response uses snake_case
  refresh_token: string
  // biome-ignore lint/style/useNamingConvention: Supabase API response uses snake_case
  expires_in?: number
  // biome-ignore lint/style/useNamingConvention: Supabase API response uses snake_case
  expires_at?: number
}

export class SupabaseAuthRepository implements AuthV2Repository {
  constructor(private readonly client: SupabaseClient) {}

  /**
   * try-catchブロックで捕捉したエラーをServerErrorに変換する共通ヘルパー
   */
  private handleCatchError(error: unknown): ServerError {
    return new ServerError(error instanceof Error ? error.message : 'Unknown error')
  }

  /**
   * Supabaseのユーザーオブジェクトを AuthenticationUser 型に変換する共通ヘルパー
   */
  private toAuthenticationUser(user: SupabaseUser, fallbackEmail?: string): AuthenticationUser {
    const email = user.email ?? fallbackEmail
    if (!email) {
      throw new ServerError('User email is missing from Supabase response')
    }

    return {
      id: user.id,
      email,
      emailConfirmedAt: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      createdAt: new Date(user.created_at),
    }
  }

  /**
   * Supabaseのセッションオブジェクトを session 型に変換する共通ヘルパー
   */
  private toSessionObject(session: SupabaseSession, user: AuthenticationUser) {
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
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
      })

      if (error) {
        // 既に存在する場合（ヘルパー関数で判定）
        if (isUserAlreadyExistsError(error)) {
          return failure(new AlreadyExistsError('User already exists'))
        }

        // その他のエラー
        return failure(new ServerError(error.message))
      }

      if (!data.user) {
        return failure(new ServerError('User creation failed'))
      }

      const user = this.toAuthenticationUser(data.user, email)

      let session: AuthV2SignupResult['session'] = null
      if (data.session) {
        session = this.toSessionObject(data.session, user)
      }

      return success({
        user,
        session,
      })
    } catch (error) {
      return failure(this.handleCatchError(error))
    }
  }

  async login(
    email: string,
    password: string,
  ): AsyncResult<AuthV2LoginResult, ClientError | ServerError> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 認証失敗（型安全なチェック）
        if (error instanceof AuthInvalidCredentialsError) {
          return failure(new ClientError('Invalid email or password', 401))
        }

        return failure(new ServerError(error.message))
      }

      if (!data.user || !data.session) {
        return failure(new ServerError('Login failed'))
      }

      const user = this.toAuthenticationUser(data.user, email)
      const session = this.toSessionObject(data.session, user)

      return success({
        user,
        session,
      })
    } catch (error) {
      return failure(this.handleCatchError(error))
    }
  }

  async logout(): AsyncResult<void, ServerError> {
    try {
      const { error } = await this.client.auth.signOut()

      if (error) {
        return failure(new ServerError(error.message))
      }

      return success(undefined)
    } catch (error) {
      return failure(this.handleCatchError(error))
    }
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser | null, ServerError> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser()

      if (error) {
        return failure(new ServerError(error.message))
      }

      if (!user) {
        return success(null)
      }

      const authUser = this.toAuthenticationUser(user)

      return success(authUser)
    } catch (error) {
      return failure(this.handleCatchError(error))
    }
  }

  async refreshSession(): AsyncResult<AuthV2LoginResult, ServerError> {
    try {
      const {
        data: { session },
        error,
      } = await this.client.auth.refreshSession()

      if (error || !session) {
        return failure(new ServerError(error?.message ?? 'Session refresh failed'))
      }

      const user = this.toAuthenticationUser(session.user)

      return success({
        user,
        session: this.toSessionObject(session, user),
      })
    } catch (error) {
      return failure(this.handleCatchError(error))
    }
  }
}
