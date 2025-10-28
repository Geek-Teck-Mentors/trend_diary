import { ClientError, ServerError } from '@/common/errors'
import { AsyncResult } from '@/common/types/utility'
import type { SupabaseAuthUser } from './model/user'
import type { LoginResult, SignupResult } from './useCase'

export interface SupabaseAuthRepository {
  /**
   * ユーザーを作成する
   */
  signup(email: string, password: string): AsyncResult<SignupResult, ClientError | ServerError>

  /**
   * ログインする
   */
  login(email: string, password: string): AsyncResult<LoginResult, ClientError | ServerError>

  /**
   * ログアウトする
   */
  logout(): AsyncResult<void, ServerError>

  /**
   * 現在のユーザーを取得する
   */
  getCurrentUser(): AsyncResult<SupabaseAuthUser | null, ServerError>

  /**
   * セッションを更新する
   */
  refreshSession(): AsyncResult<LoginResult, ServerError>
}
