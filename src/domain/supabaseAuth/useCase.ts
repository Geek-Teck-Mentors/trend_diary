import type { ClientError, ServerError } from '@/common/errors'
import type { AsyncResult } from '@/common/types/utility'
import type { SupabaseAuthSession } from './model/session'
import type { SupabaseAuthUser } from './model/user'
import type { SupabaseAuthRepository } from './repository'

/**
 * サインアップ結果
 */
export type SignupResult = {
  user: SupabaseAuthUser
  session: SupabaseAuthSession | null
}

/**
 * ログイン結果
 */
export type LoginResult = {
  user: SupabaseAuthUser
  session: SupabaseAuthSession
}

export class SupabaseAuthUseCase {
  constructor(private readonly repository: SupabaseAuthRepository) {}

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

  async getCurrentUser(): AsyncResult<SupabaseAuthUser | null, ServerError> {
    return this.repository.getCurrentUser()
  }

  async refreshSession(): AsyncResult<LoginResult, ServerError> {
    return this.repository.refreshSession()
  }
}
