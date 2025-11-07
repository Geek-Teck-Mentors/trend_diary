import { type AsyncResult, failure, isFailure, success } from '@yuukihayashi0510/core'
import { type ClientError, ServerError } from '@/common/errors'
import { isNull } from '@/common/types/utility'
import type { Command, Query } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/activeUserSchema'
import type { SupabaseAuthenticationRepository } from './repository'
import type { AuthenticationSession } from './schema/authenticationSession'
import type { AuthenticationUser } from './schema/authenticationUser'

/**
 * Supabase認証ユーザーのダミーパスワード
 * Supabase Authを使用するため、active_userテーブルのpasswordフィールドには実際のパスワードを保存しない
 */
const SUPABASE_AUTH_DUMMY_PASSWORD = 'SUPABASE_AUTH_USER' as const

/**
 * サインアップ結果（Supabase認証 + ActiveUser統合）
 */
export type SignupResult = {
  user: AuthenticationUser
  session: AuthenticationSession | null
  activeUser: ActiveUser
}

/**
 * ログイン結果（Supabase認証 + ActiveUser統合）
 */
export type LoginResult = {
  user: AuthenticationUser
  session: AuthenticationSession
  activeUser: ActiveUser
}

export class SupabaseAuthenticationUseCase {
  constructor(
    private readonly repository: SupabaseAuthenticationRepository,
    private readonly userQuery: Query,
    private readonly userCommand: Command,
  ) {}

  /**
   * AuthenticationUserに対応するActiveUserを取得、存在しない場合は作成する
   */
  private async getOrCreateActiveUser(
    user: AuthenticationUser,
  ): AsyncResult<ActiveUser, ServerError> {
    const activeUserResult = await this.userQuery.findActiveByAuthenticationId(user.id)
    if (isFailure(activeUserResult)) {
      return failure(this.toServerError(activeUserResult.error))
    }

    if (isNull(activeUserResult.data)) {
      const createResult = await this.userCommand.createActiveWithAuthenticationId(
        user.email,
        SUPABASE_AUTH_DUMMY_PASSWORD,
        user.id,
      )

      if (isFailure(createResult)) {
        return failure(this.toServerError(createResult.error))
      }

      return success(createResult.data)
    }

    return success(activeUserResult.data)
  }

  /**
   * ClientErrorまたはServerErrorをServerErrorに変換する
   */
  private toServerError(error: ClientError | ServerError | Error): ServerError {
    if (error instanceof ServerError) {
      return error
    }
    return new ServerError(error.message)
  }

  async signup(
    email: string,
    password: string,
  ): AsyncResult<SignupResult, ClientError | ServerError> {
    // Supabase認証でユーザー作成
    const authResult = await this.repository.signup(email, password)
    if (isFailure(authResult)) return authResult

    const { user, session } = authResult.data

    // active_userを作成（パスワードはダミーハッシュ、Supabase認証を使うため不要）
    const activeUserResult = await this.userCommand.createActiveWithAuthenticationId(
      user.email,
      SUPABASE_AUTH_DUMMY_PASSWORD,
      user.id,
    )

    if (isFailure(activeUserResult)) {
      return failure(this.toServerError(activeUserResult.error))
    }

    return success({
      user,
      session,
      activeUser: activeUserResult.data,
    })
  }

  async login(
    email: string,
    password: string,
  ): AsyncResult<LoginResult, ClientError | ServerError> {
    // Supabase認証でログイン
    const authResult = await this.repository.login(email, password)
    if (isFailure(authResult)) return authResult

    const { user, session } = authResult.data

    // authenticationIdからactive_userを取得または作成
    const activeUserResult = await this.getOrCreateActiveUser(user)
    if (isFailure(activeUserResult)) return activeUserResult

    return success({
      user,
      session,
      activeUser: activeUserResult.data,
    })
  }

  async logout(): AsyncResult<void, ServerError> {
    return this.repository.logout()
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser | null, ServerError> {
    return this.repository.getCurrentUser()
  }

  async refreshSession(): AsyncResult<LoginResult, ServerError> {
    // Supabase認証でセッション更新
    const authResult = await this.repository.refreshSession()
    if (isFailure(authResult)) return authResult

    const { user, session } = authResult.data

    // authenticationIdからactive_userを取得または作成
    const activeUserResult = await this.getOrCreateActiveUser(user)
    if (isFailure(activeUserResult)) return activeUserResult

    return success({
      user,
      session,
      activeUser: activeUserResult.data,
    })
  }
}
