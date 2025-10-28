import type { SupabaseClient } from '@supabase/supabase-js'
import { AlreadyExistsError, ClientError, NotFoundError, ServerError } from '@/common/errors'
import { type AsyncResult, resultError, resultSuccess } from '@/common/types/utility'
import type { LoginResult, SignupResult, SupabaseAuthUser } from '../dto'
import type { SupabaseAuthRepository } from '../repository'

export class SupabaseAuthImpl implements SupabaseAuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async signup(
    email: string,
    password: string,
  ): AsyncResult<SignupResult, ClientError | ServerError> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
      })

      if (error) {
        // 既に存在する場合
        if (error.message.includes('already registered')) {
          return resultError(new AlreadyExistsError('User already exists'))
        }

        // その他のエラー
        return resultError(new ServerError(error.message))
      }

      if (!data.user) {
        return resultError(new ServerError('User creation failed'))
      }

      const user: SupabaseAuthUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        emailConfirmedAt: data.user.email_confirmed_at
          ? new Date(data.user.email_confirmed_at)
          : null,
        createdAt: new Date(data.user.created_at),
      }

      let session: SignupResult['session'] = null
      if (data.session) {
        session = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in ?? 3600,
          expiresAt: data.session.expires_at,
          user,
        }
      }

      return resultSuccess({
        user,
        session,
      })
    } catch (error) {
      return resultError(new ServerError(error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async login(
    email: string,
    password: string,
  ): AsyncResult<LoginResult, ClientError | ServerError> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // 認証失敗
        if (error.message.includes('Invalid login credentials')) {
          return resultError(new ClientError('Invalid email or password', 401))
        }

        // ユーザーが見つからない
        if (error.message.includes('not found')) {
          return resultError(new NotFoundError('User not found'))
        }

        return resultError(new ServerError(error.message))
      }

      if (!data.user || !data.session) {
        return resultError(new ServerError('Login failed'))
      }

      const user: SupabaseAuthUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        emailConfirmedAt: data.user.email_confirmed_at
          ? new Date(data.user.email_confirmed_at)
          : null,
        createdAt: new Date(data.user.created_at),
      }

      const session: LoginResult['session'] = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in ?? 3600,
        expiresAt: data.session.expires_at,
        user,
      }

      return resultSuccess({
        user,
        session,
      })
    } catch (error) {
      return resultError(new ServerError(error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async logout(): AsyncResult<void, ServerError> {
    try {
      const { error } = await this.client.auth.signOut()

      if (error) {
        return resultError(new ServerError(error.message))
      }

      return resultSuccess(undefined)
    } catch (error) {
      return resultError(new ServerError(error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async getCurrentUser(): AsyncResult<SupabaseAuthUser | null, ServerError> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser()

      if (error) {
        return resultError(new ServerError(error.message))
      }

      if (!user) {
        return resultSuccess(null)
      }

      if (!user.email) {
        return resultError(new ServerError('User email is missing from Supabase response'))
      }

      const authUser: SupabaseAuthUser = {
        id: user.id,
        email: user.email,
        emailConfirmedAt: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        createdAt: new Date(user.created_at),
      }

      return resultSuccess(authUser)
    } catch (error) {
      return resultError(new ServerError(error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async refreshSession(): AsyncResult<LoginResult, ServerError> {
    try {
      const {
        data: { session },
        error,
      } = await this.client.auth.refreshSession()

      if (error || !session) {
        return resultError(new ServerError(error?.message ?? 'Session refresh failed'))
      }

      if (!session.user.email) {
        return resultError(new ServerError('User email is missing from Supabase response'))
      }

      const user: SupabaseAuthUser = {
        id: session.user.id,
        email: session.user.email,
        emailConfirmedAt: session.user.email_confirmed_at
          ? new Date(session.user.email_confirmed_at)
          : null,
        createdAt: new Date(session.user.created_at),
      }

      return resultSuccess({
        user,
        session: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in ?? 3600,
          expiresAt: session.expires_at,
          user,
        },
      })
    } catch (error) {
      return resultError(new ServerError(error instanceof Error ? error.message : 'Unknown error'))
    }
  }
}
