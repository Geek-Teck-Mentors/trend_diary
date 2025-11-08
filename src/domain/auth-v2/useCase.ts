import { type AsyncResult, failure, isFailure, success } from '@yuukihayashi0510/core'
import { type ClientError, ServerError } from '@/common/errors'
import type { Command } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/activeUserSchema'
import type { AuthV2Repository } from './repository'
import type { AuthenticationSession } from './schema/authenticationSession'
import type { AuthenticationUser } from './schema/authenticationUser'

/**
 * 認証v2ユーザーのダミーパスワード
 * Supabase Authを使用するため、active_userテーブルのpasswordフィールドには実際のパスワードを保存しない
 */
const AUTH_V2_DUMMY_PASSWORD = 'SUPABASE_AUTH_USER' as const

/**
 * サインアップ結果（認証v2 + ActiveUser統合）
 */
export type SignupResult = {
  user: AuthenticationUser
  session: AuthenticationSession | null
  activeUser: ActiveUser
}

/**
 * ログイン結果（認証v2 + ActiveUser統合）
 */
export type LoginResult = {
  user: AuthenticationUser
  session: AuthenticationSession
  activeUser: ActiveUser
}

export class AuthV2UseCase {
  constructor(
    private readonly repository: AuthV2Repository,
    private readonly userCommand: Command,
  ) {}

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
    // 認証v2でユーザー作成
    const authResult = await this.repository.signup(email, password)
    if (isFailure(authResult)) return authResult

    const { user, session } = authResult.data

    // active_userを作成（パスワードはダミーハッシュ、認証v2を使うため不要）
    const activeUserResult = await this.userCommand.createActiveWithAuthenticationId(
      user.email,
      AUTH_V2_DUMMY_PASSWORD,
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
    // 認証v2でログイン
    const authResult = await this.repository.login(email, password)
    if (isFailure(authResult)) return authResult

    const { user, session } = authResult.data

    // active_userを作成
    const activeUserResult = await this.userCommand.createActiveWithAuthenticationId(
      user.email,
      AUTH_V2_DUMMY_PASSWORD,
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

  async logout(): AsyncResult<void, ServerError> {
    return this.repository.logout()
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser | null, ServerError> {
    return this.repository.getCurrentUser()
  }

  async refreshSession(): AsyncResult<LoginResult, ServerError> {
    // 認証v2でセッション更新
    const authResult = await this.repository.refreshSession()
    if (isFailure(authResult)) return authResult

    const { user, session } = authResult.data

    // active_userを作成
    const activeUserResult = await this.userCommand.createActiveWithAuthenticationId(
      user.email,
      AUTH_V2_DUMMY_PASSWORD,
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
}
