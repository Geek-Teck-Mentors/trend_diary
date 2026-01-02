import { failure, isFailure, isSuccess, success } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { ClientError, ServerError } from '@/common/errors'
import type { Command, Query } from '@/domain/user/repository'
import type { CurrentUser } from '@/domain/user/schema/activeUserSchema'
import type { AuthV2Repository } from './repository'
import type { AuthenticationSession } from './schema/authenticationSession'
import { AuthV2UseCase } from './useCase'

const mockAuthV2Repository = mockDeep<AuthV2Repository>()
const mockUserCommand = mockDeep<Command>()
const mockUserQuery = mockDeep<Query>()

const mockAuthUser = {
  id: 'auth-user-id-123',
  email: 'test@example.com',
  createdAt: new Date(),
}

const mockSession: AuthenticationSession = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-123',
  expiresIn: 3600,
  user: mockAuthUser,
}

const mockCurrentUser: CurrentUser = {
  activeUserId: BigInt(1),
  email: 'test@example.com',
  displayName: 'Test User',
  userId: BigInt(1),
  authenticationId: 'auth-user-id-123',
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AuthV2UseCase', () => {
  let useCase: AuthV2UseCase

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new AuthV2UseCase(mockAuthV2Repository, mockUserCommand, mockUserQuery)
  })

  describe('signup', () => {
    it('正常にサインアップできること', async () => {
      const email = 'test@example.com'
      const password = 'password123'

      mockAuthV2Repository.signup.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserCommand.createActiveWithAuthenticationId.mockResolvedValue(success(mockCurrentUser))

      const result = await useCase.signup(email, password)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.session).toEqual(mockSession)
        expect(result.data.activeUser).toEqual(mockCurrentUser)
      }

      expect(mockAuthV2Repository.signup).toHaveBeenCalledWith(email, password)
      expect(mockUserCommand.createActiveWithAuthenticationId).toHaveBeenCalledWith(
        email,
        'SUPABASE_AUTH_USER',
        mockAuthUser.id,
      )
    })

    it('認証失敗時にエラーを返すこと', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const authError = new ClientError('Invalid credentials', 401)

      mockAuthV2Repository.signup.mockResolvedValue(failure(authError))

      const result = await useCase.signup(email, password)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(authError)
      }

      expect(mockUserCommand.createActiveWithAuthenticationId).not.toHaveBeenCalled()
    })

    it('active_user作成失敗時にエラーを返すこと', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const dbError = new ServerError('Database error')

      mockAuthV2Repository.signup.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserCommand.createActiveWithAuthenticationId.mockResolvedValue(failure(dbError))

      const result = await useCase.signup(email, password)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(dbError)
      }
    })
  })

  describe('login', () => {
    it('正常にログインできること', async () => {
      const email = 'test@example.com'
      const password = 'password123'

      mockAuthV2Repository.login.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(success(mockCurrentUser))

      const result = await useCase.login(email, password)

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.session).toEqual(mockSession)
        expect(result.data.activeUser).toEqual(mockCurrentUser)
      }

      expect(mockAuthV2Repository.login).toHaveBeenCalledWith(email, password)
      expect(mockUserQuery.findActiveByAuthenticationId).toHaveBeenCalledWith(mockAuthUser.id)
    })

    it('認証失敗時にエラーを返すこと', async () => {
      const email = 'test@example.com'
      const password = 'wrong-password'
      const authError = new ClientError('Invalid credentials', 401)

      mockAuthV2Repository.login.mockResolvedValue(failure(authError))

      const result = await useCase.login(email, password)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(authError)
      }

      expect(mockUserQuery.findActiveByAuthenticationId).not.toHaveBeenCalled()
    })

    it('active_userが見つからない場合にエラーを返すこと', async () => {
      const email = 'test@example.com'
      const password = 'password123'

      mockAuthV2Repository.login.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(success(null))

      const result = await useCase.login(email, password)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ClientError)
        expect(result.error.message).toBe('User not found')
      }
    })

    it('active_user検索失敗時にServerErrorを返すこと', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const dbError = new Error('Database connection failed')

      mockAuthV2Repository.login.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(failure(dbError))

      const result = await useCase.login(email, password)

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
      }
    })
  })

  describe('logout', () => {
    it('正常にログアウトできること', async () => {
      mockAuthV2Repository.logout.mockResolvedValue(success(undefined))

      const result = await useCase.logout()

      expect(isSuccess(result)).toBe(true)
      expect(mockAuthV2Repository.logout).toHaveBeenCalledTimes(1)
    })

    it('ログアウト失敗時にエラーを返すこと', async () => {
      const logoutError = new ServerError('Logout failed')

      mockAuthV2Repository.logout.mockResolvedValue(failure(logoutError))

      const result = await useCase.logout()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(logoutError)
      }
    })
  })

  describe('getCurrentActiveUser', () => {
    it('正常に現在のユーザーを取得できること', async () => {
      mockAuthV2Repository.getCurrentUser.mockResolvedValue(success(mockAuthUser))

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(success(mockCurrentUser))

      const result = await useCase.getCurrentActiveUser()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockCurrentUser)
      }

      expect(mockAuthV2Repository.getCurrentUser).toHaveBeenCalledTimes(1)
      expect(mockUserQuery.findActiveByAuthenticationId).toHaveBeenCalledWith(mockAuthUser.id)
    })

    it('認証ユーザー取得失敗時にエラーを返すこと', async () => {
      const authError = new ClientError('Not authenticated', 401)

      mockAuthV2Repository.getCurrentUser.mockResolvedValue(failure(authError))

      const result = await useCase.getCurrentActiveUser()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(authError)
      }

      expect(mockUserQuery.findActiveByAuthenticationId).not.toHaveBeenCalled()
    })

    it('active_userが見つからない場合にエラーを返すこと', async () => {
      mockAuthV2Repository.getCurrentUser.mockResolvedValue(success(mockAuthUser))

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(success(null))

      const result = await useCase.getCurrentActiveUser()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ClientError)
        expect(result.error.message).toBe('User not found')
      }
    })
  })

  describe('refreshSession', () => {
    it('正常にセッションを更新できること', async () => {
      mockAuthV2Repository.refreshSession.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(success(mockCurrentUser))

      const result = await useCase.refreshSession()

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.session).toEqual(mockSession)
        expect(result.data.activeUser).toEqual(mockCurrentUser)
      }

      expect(mockAuthV2Repository.refreshSession).toHaveBeenCalledTimes(1)
      expect(mockUserQuery.findActiveByAuthenticationId).toHaveBeenCalledWith(mockAuthUser.id)
    })

    it('セッション更新失敗時にエラーを返すこと', async () => {
      const refreshError = new ClientError('Invalid refresh token', 401)

      mockAuthV2Repository.refreshSession.mockResolvedValue(failure(refreshError))

      const result = await useCase.refreshSession()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBe(refreshError)
      }

      expect(mockUserQuery.findActiveByAuthenticationId).not.toHaveBeenCalled()
    })

    it('active_user取得失敗時にエラーを返すこと', async () => {
      mockAuthV2Repository.refreshSession.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(success(null))

      const result = await useCase.refreshSession()

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ClientError)
        expect(result.error.message).toBe('User not found')
      }
    })
  })

  describe('findActiveUserByAuthenticationId (private method)', () => {
    it('データベースエラー時にServerErrorでラップして返すこと', async () => {
      const dbError = new Error('Connection timeout')

      mockAuthV2Repository.login.mockResolvedValue(
        success({
          user: mockAuthUser,
          session: mockSession,
        }),
      )

      mockUserQuery.findActiveByAuthenticationId.mockResolvedValue(failure(dbError))

      const result = await useCase.login('test@example.com', 'password')

      expect(isFailure(result)).toBe(true)
      if (isFailure(result)) {
        expect(result.error).toBeInstanceOf(ServerError)
        expect(result.error.message).toContain('Connection timeout')
      }
    })
  })
})
