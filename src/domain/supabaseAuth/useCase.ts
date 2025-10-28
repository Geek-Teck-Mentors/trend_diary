import type { ClientError, ServerError } from '@/common/errors'
import type { AsyncResult } from '@/common/types/utility'
import type { SupabaseAuthenticationRepository } from './repository'
import type { AuthenticationSession } from './schema/session'
import type { AuthenticationUser } from './schema/user'

/**
 * サインアップ結果
 */
export type SignupResult = {
  user: AuthenticationUser
  session: AuthenticationSession | null
}

/**
 * ログイン結果
 */
export type LoginResult = {
  user: AuthenticationUser
  session: AuthenticationSession
}

export class SupabaseAuthenticationUseCase {
  constructor(private readonly repository: SupabaseAuthenticationRepository) {}

  async signup(
    email: string,
    password: string,
  ): AsyncResult<SignupResult, ClientError | ServerError> {
    return this.repository.signup(email, password)
  }

  async login(
    email: string,
    password: string,
  ): AsyncResult<LoginResult, ClientError | ServerError> {
    return this.repository.login(email, password)
  }

  async logout(): AsyncResult<void, ServerError> {
    return this.repository.logout()
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser | null, ServerError> {
    return this.repository.getCurrentUser()
  }

  async refreshSession(): AsyncResult<LoginResult, ServerError> {
    return this.repository.refreshSession()
  }
}
