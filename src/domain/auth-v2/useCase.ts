import { type AsyncResult, failure, isFailure, success } from '@yuukihayashi0510/core'
import { ClientError, ServerError } from '@/common/errors'
import type { Command, Query } from '@/domain/user/repository'
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
 * サインアップ結果
 */
export type SignupResult = {
  session: AuthenticationSession | null
  activeUser: ActiveUser
}

/**
 * ログイン結果
 */
export type LoginResult = {
  session: AuthenticationSession
  activeUser: ActiveUser
}

export class AuthV2UseCase {
  constructor(
    private readonly repository: AuthV2Repository,
    private readonly userCommand: Command,
    private readonly userQuery: Query,
  ) {}

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
      return failure(activeUserResult.error)
    }

    return success({
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

    const activeUserResult = await this.findActiveUserByAuthenticationId(user.id)

    if (isFailure(activeUserResult)) return activeUserResult

    return success({
      session,
      activeUser: activeUserResult.data,
    })
  }

  async logout(): AsyncResult<void, ServerError> {
    return this.repository.logout()
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser, ClientError | ServerError> {
    const result = await this.repository.getCurrentUser()
    if (isFailure(result)) return result

    if (!result.data) {
      return failure(new ClientError('Unauthorized', 401))
    }

    return success(result.data)
  }

  async getCurrentActiveUser(): AsyncResult<ActiveUser, ClientError | ServerError> {
    const authUserResult = await this.getCurrentUser()
    if (isFailure(authUserResult)) {
      return authUserResult
    }

    return this.findActiveUserByAuthenticationId(authUserResult.data.id)
  }

  async refreshSession(): AsyncResult<LoginResult, ClientError | ServerError> {
    // 認証v2でセッション更新
    const authResult = await this.repository.refreshSession()
    if (isFailure(authResult)) return authResult

    const { user, session } = authResult.data

    const activeUserResult = await this.findActiveUserByAuthenticationId(user.id)

    if (isFailure(activeUserResult)) return activeUserResult

    return success({
      session,
      activeUser: activeUserResult.data,
    })
  }

  private async findActiveUserByAuthenticationId(
    authenticationId: string,
  ): AsyncResult<ActiveUser, ClientError | ServerError> {
    const activeUserResult = await this.userQuery.findActiveByAuthenticationId(authenticationId)

    if (isFailure(activeUserResult)) {
      return failure(new ServerError(activeUserResult.error))
    }

    if (!activeUserResult.data) {
      return failure(new ClientError('User not found', 404))
    }

    return success(activeUserResult.data)
  }
}
