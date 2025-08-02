import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { AlreadyExistsError, NotFoundError } from '@/common/errors'
import { isError, isSuccess, resultSuccess } from '@/common/types/utility'
import ActiveUser from '../model/activeUser'
import { CommandService } from '../repository/commandService'
import { QueryService } from '../repository/queryService'
import ActiveUserService from './activeUserService'

// モックの設定
const mockQueryService = mockDeep<QueryService>()
const mockCommandService = mockDeep<CommandService>()

describe('ActiveUserService', () => {
  let service: ActiveUserService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ActiveUserService(mockQueryService, mockCommandService)
  })

  describe('signup', () => {
    describe('基本動作', () => {
      it('新規ユーザーを作成できる', async () => {
        const email = 'test@example.com'
        const password = 'password123'

        // Arrange - 重複チェックでnullを返す
        mockQueryService.findActiveByEmail.mockResolvedValue(resultSuccess(null))

        // ActiveUser作成
        const mockActiveUser = new ActiveUser(
          1n,
          2n,
          email,
          'hashedPassword',
          'テストユーザー',
          undefined,
          new Date(),
          new Date(),
        )
        mockCommandService.createActive.mockResolvedValue(resultSuccess(mockActiveUser))

        // Act
        const result = await service.signup(email, password)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.email).toBe(email)
        }
        expect(mockQueryService.findActiveByEmail).toHaveBeenCalledWith(email)
        expect(mockCommandService.createActive).toHaveBeenCalledWith(email, expect.any(String))
      })
    })

    describe('境界値・特殊値', () => {
      it('既存のユーザーが存在する場合でも作成できる', async () => {
        const email = 'test@example.com'
        const password = 'password123'

        // Arrange
        mockQueryService.findActiveByEmail.mockResolvedValue(resultSuccess(null))

        const mockActiveUser = new ActiveUser(
          1n,
          2n,
          email,
          'hashedPassword',
          null,
          undefined,
          new Date(),
          new Date(),
        )
        mockCommandService.createActive.mockResolvedValue(resultSuccess(mockActiveUser))

        // Act
        const result = await service.signup(email, password)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.displayName).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('重複するメールアドレスでは作成に失敗する', async () => {
        const email = 'duplicate@example.com'
        const password = 'password123'

        // Arrange - 既存ユーザーが存在
        const existingUser = new ActiveUser(
          1n,
          2n,
          email,
          'existingPassword',
          '既存ユーザー',
          undefined,
          new Date(),
          new Date(),
        )
        mockQueryService.findActiveByEmail.mockResolvedValue(resultSuccess(existingUser))

        // Act
        const result = await service.signup(email, password)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(AlreadyExistsError)
        }
      })
    })
  })

  describe('login', () => {
    describe('基本動作', () => {
      it('有効な認証情報でログインできる', async () => {
        const email = 'test@example.com'
        const password = 'password123'
        const hashedPassword = await bcrypt.hash(password, 10)

        // Arrange
        const mockActiveUser = new ActiveUser(
          1n,
          2n,
          email,
          hashedPassword,
          'テストユーザー',
          undefined,
          new Date(),
          new Date(),
        )
        mockQueryService.findActiveByEmail.mockResolvedValue(resultSuccess(mockActiveUser))

        mockCommandService.createSession.mockResolvedValue(
          resultSuccess({
            sessionId: 'session-123',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }),
        )

        // ActiveUser保存のモック
        const updatedActiveUser = new ActiveUser(
          1n,
          2n,
          email,
          hashedPassword,
          'テストユーザー',
          new Date(), // lastLoginが更新される
          new Date(),
          new Date(),
        )
        mockCommandService.saveActive.mockResolvedValue(resultSuccess(updatedActiveUser))

        // Act
        const result = await service.login(email, password, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUser.activeUserId).toBe(1n)
          expect(result.data.sessionId.length).toBeGreaterThan(0)
        }
      })
    })

    describe('例外・制約違反', () => {
      it('存在しないメールアドレスではログインに失敗する', async () => {
        const email = 'notfound@example.com'
        const password = 'password123'

        // Arrange
        mockQueryService.findActiveByEmail.mockResolvedValue(resultSuccess(null))

        // Act
        const result = await service.login(email, password, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error).toBeInstanceOf(NotFoundError)
        }
      })

      it('間違ったパスワードではログインに失敗する', async () => {
        const email = 'test@example.com'
        const correctPassword = 'password123'
        const wrongPassword = 'wrongpassword'
        const hashedPassword = await bcrypt.hash(correctPassword, 10)

        // Arrange
        const mockActiveUser = new ActiveUser(
          1n,
          2n,
          email,
          hashedPassword,
          'テストユーザー',
          undefined,
          new Date(),
          new Date(),
        )
        mockQueryService.findActiveByEmail.mockResolvedValue(resultSuccess(mockActiveUser))

        // Act
        const result = await service.login(email, wrongPassword, '192.168.1.1', 'Mozilla/5.0')

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toContain('Invalid credentials')
        }
      })
    })
  })
})
