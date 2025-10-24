import { ClientError, ServerError } from '@/common/errors'
import { type AsyncResult, resultError, resultSuccess } from '@/common/types/utility'
import type { AuthRepository, AuthSession, AuthUser } from '@/domain/auth/repository'
import type { AuthSupabaseClient } from './supabaseClient'

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly supabase: AuthSupabaseClient) {}

  async signUp(email: string, password: string): AsyncResult<AuthUser, ClientError | ServerError> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return resultError(new ClientError(error.message))
      }

      if (!data.user) {
        return resultError(new ServerError('User creation failed'))
      }

      return resultSuccess({
        id: data.user.id,
        email: data.user.email ?? email,
      })
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }

  async signIn(
    email: string,
    password: string,
  ): AsyncResult<AuthSession, ClientError | ServerError> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return resultError(new ClientError(error.message))
      }

      if (!data.user || !data.session) {
        return resultError(new ClientError('Authentication failed'))
      }

      return resultSuccess({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at ?? 0,
        user: {
          id: data.user.id,
          email: data.user.email ?? email,
        },
      })
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }

  async signOut(): AsyncResult<void, ClientError | ServerError> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return resultError(new ClientError(error.message))
      }

      return resultSuccess(undefined)
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }

  async getUser(accessToken: string): AsyncResult<AuthUser, ClientError | ServerError> {
    try {
      const { data, error } = await this.supabase.auth.getUser(accessToken)

      if (error) {
        return resultError(new ClientError(error.message))
      }

      if (!data.user) {
        return resultError(new ClientError('User not found'))
      }

      return resultSuccess({
        id: data.user.id,
        email: data.user.email ?? '',
      })
    } catch (error) {
      return resultError(new ServerError(error))
    }
  }
}
