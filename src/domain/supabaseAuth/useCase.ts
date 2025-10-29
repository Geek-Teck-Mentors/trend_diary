import { type ClientError, ServerError } from '@/common/errors'
import {
  type AsyncResult,
  isError,
  isNull,
  resultError,
  resultSuccess,
} from '@/common/types/utility'
import type { Command, Query } from '@/domain/user/repository'
import type { ActiveUser } from '@/domain/user/schema/activeUserSchema'
import type { SupabaseAuthenticationRepository } from './repository'
import type { AuthenticationSession } from './schema/authenticationSession'
import type { AuthenticationUser } from './schema/authenticationUser'

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

  async signup(
    email: string,
    password: string,
  ): AsyncResult<SignupResult, ClientError | ServerError> {
    // Supabase認証でユーザー作成
    const authResult = await this.repository.signup(email, password)
    if (isError(authResult)) return authResult

    const { user, session } = authResult.data

    // active_userを作成（パスワードはダミーハッシュ、Supabase認証を使うため不要）
    const activeUserResult = await this.userCommand.createActiveWithAuthenticationId(
      user.email,
      'SUPABASE_AUTH_USER', // ダミーパスワード
      user.id, // authenticationId
    )

    if (isError(activeUserResult)) {
      return resultError(
        activeUserResult.error instanceof ServerError
          ? activeUserResult.error
          : new ServerError(activeUserResult.error.message),
      )
    }

    return resultSuccess({
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
    if (isError(authResult)) return authResult

    const { user, session } = authResult.data

    // authenticationIdからactive_userを取得
    const activeUserResult = await this.userQuery.findActiveByAuthenticationId(user.id)
    if (isError(activeUserResult)) {
      return resultError(
        activeUserResult.error instanceof ServerError
          ? activeUserResult.error
          : new ServerError(activeUserResult.error.message),
      )
    }

    // active_userが存在しない場合は作成
    if (isNull(activeUserResult.data)) {
      const createResult = await this.userCommand.createActiveWithAuthenticationId(
        user.email,
        'SUPABASE_AUTH_USER', // ダミーパスワード
        user.id, // authenticationId
      )

      if (isError(createResult)) {
        return resultError(
          createResult.error instanceof ServerError
            ? createResult.error
            : new ServerError(createResult.error.message),
        )
      }

      return resultSuccess({
        user,
        session,
        activeUser: createResult.data,
      })
    }

    return resultSuccess({
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
    if (isError(authResult)) return authResult

    const { user, session } = authResult.data

    // authenticationIdからactive_userを取得
    const activeUserResult = await this.userQuery.findActiveByAuthenticationId(user.id)
    if (isError(activeUserResult)) {
      return resultError(
        activeUserResult.error instanceof ServerError
          ? activeUserResult.error
          : new ServerError(activeUserResult.error.message),
      )
    }

    // active_userが存在しない場合は作成
    if (isNull(activeUserResult.data)) {
      const createResult = await this.userCommand.createActiveWithAuthenticationId(
        user.email,
        'SUPABASE_AUTH_USER', // ダミーパスワード
        user.id, // authenticationId
      )

      if (isError(createResult)) {
        return resultError(
          createResult.error instanceof ServerError
            ? createResult.error
            : new ServerError(createResult.error.message),
        )
      }

      return resultSuccess({
        user,
        session,
        activeUser: createResult.data,
      })
    }

    return resultSuccess({
      user,
      session,
      activeUser: activeUserResult.data,
    })
  }
}
