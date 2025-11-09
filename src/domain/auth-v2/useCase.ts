import { type AsyncResult, failure, isFailure, success } from '@yuukihayashi0510/core'
import { v4 as uuidv4 } from 'uuid'
import { SESSION_DURATION } from '@/common/constants'
import { ClientError, ServerError } from '@/common/errors'
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
 * サインアップ結果
 */
export type SignupResult = {
  session: AuthenticationSession | null
  activeUser: ActiveUser
  sessionId: string
  expiresAt: Date
}

/**
 * ログイン結果
 */
export type LoginResult = {
  session: AuthenticationSession
  activeUser: ActiveUser
  sessionId: string
  expiresAt: Date
}

export class AuthV2UseCase {
  constructor(
    private readonly repository: AuthV2Repository,
    private readonly userCommand: Command,
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

    // HTTPセッションを作成
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)
    const sessionResult = await this.userCommand.createSession({
      sessionId,
      activeUserId: activeUserResult.data.activeUserId,
      sessionToken: uuidv4(),
      expiresAt,
    })

    if (isFailure(sessionResult)) {
      return failure(sessionResult.error)
    }

    return success({
      session,
      activeUser: activeUserResult.data,
      sessionId,
      expiresAt,
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
      return failure(activeUserResult.error)
    }

    // HTTPセッションを作成
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)
    const sessionResult = await this.userCommand.createSession({
      sessionId,
      activeUserId: activeUserResult.data.activeUserId,
      sessionToken: uuidv4(),
      expiresAt,
    })

    if (isFailure(sessionResult)) {
      return failure(sessionResult.error)
    }

    return success({
      session,
      activeUser: activeUserResult.data,
      sessionId,
      expiresAt,
    })
  }

  async logout(): AsyncResult<void, ServerError> {
    return this.repository.logout()
  }

  async deleteSession(sessionId: string): AsyncResult<void, ServerError> {
    return this.userCommand.deleteSession(sessionId)
  }

  async getCurrentUser(): AsyncResult<AuthenticationUser, ClientError | ServerError> {
    const result = await this.repository.getCurrentUser()
    if (isFailure(result)) return result

    if (!result.data) {
      return failure(new ClientError('Unauthorized', 401))
    }

    return success(result.data)
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
      return failure(activeUserResult.error)
    }

    // HTTPセッションを作成
    const sessionId = uuidv4()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)
    const sessionResult = await this.userCommand.createSession({
      sessionId,
      activeUserId: activeUserResult.data.activeUserId,
      sessionToken: uuidv4(),
      expiresAt,
    })

    if (isFailure(sessionResult)) {
      return failure(sessionResult.error)
    }

    return success({
      session,
      activeUser: activeUserResult.data,
      sessionId,
      expiresAt,
    })
  }
}
