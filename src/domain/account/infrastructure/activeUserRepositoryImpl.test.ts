import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { AlreadyExistsError } from '@/common/errors'
import { isError, isSuccess } from '@/common/types/utility'
import ActiveUserRepositoryImpl from './activeUserRepositoryImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

describe('ActiveUserRepositoryImpl', () => {
  let repository: ActiveUserRepositoryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new ActiveUserRepositoryImpl(mockDb)
  })

  describe('正常系', () => {
    it('ActiveUserを作成できる', async () => {
      // Arrange
      const userId = 1n
      const input = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: 'テストユーザー',
      }

      const mockActiveUser = {
        activeUserId: 2n,
        userId: 1n,
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: 'テストユーザー',
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.activeUser.create.mockResolvedValue(mockActiveUser)

      // Act
      const result = await repository.createActiveUser(userId, input.email, input.password, input.displayName ?? undefined)

      // Assert
      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.activeUserId).toBe(2n)
        expect(result.data.userId).toBe(1n)
        expect(result.data.email).toBe('test@example.com')
        expect(result.data.displayName).toBe('テストユーザー')
      }
      expect(mockDb.activeUser.create).toHaveBeenCalledWith({
        data: {
          userId: 1n,
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
        },
      })
    })

    it('ActiveUserをIDで検索できる', async () => {
      // Arrange
      const activeUserId = 1n
      const mockActiveUser = {
        activeUserId: 1n,
        userId: 2n,
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: 'テストユーザー',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.activeUser.findUnique.mockResolvedValue(mockActiveUser)

      // Act
      const result = await repository.findById(activeUserId)

      // Assert
      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data?.activeUserId).toBe(1n)
        expect(result.data?.email).toBe('test@example.com')
      }
      expect(mockDb.activeUser.findUnique).toHaveBeenCalledWith({
        where: { activeUserId: 1n },
      })
    })

    it('存在しないActiveUserの場合nullを返す', async () => {
      // Arrange
      const activeUserId = 999n
      mockDb.activeUser.findUnique.mockResolvedValue(null)

      // Act
      const result = await repository.findById(activeUserId)

      // Assert
      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data).toBeNull()
      }
    })
  })

  describe('準正常系', () => {
    it('displayNameがnullでもActiveUserを作成できる', async () => {
      // Arrange
      const userId = 1n
      const input = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: null,
      }

      const mockActiveUser = {
        activeUserId: 2n,
        userId: 1n,
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: null,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.activeUser.create.mockResolvedValue(mockActiveUser)

      // Act
      const result = await repository.createActiveUser(userId, input.email, input.password, input.displayName ?? undefined)

      // Assert
      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.displayName).toBeNull()
      }
    })
  })

  describe('異常系', () => {
    it('重複するメールアドレスでは作成に失敗する', async () => {
      // Arrange
      const userId = 1n
      const input = {
        email: 'duplicate@example.com',
        password: 'hashedPassword123',
        displayName: 'テストユーザー',
      }

      const prismaError = new Error('Unique constraint violation')
      ;(prismaError as any).code = 'P2002'
      mockDb.activeUser.create.mockRejectedValue(prismaError)

      // Act
      const result = await repository.createActiveUser(userId, input.email, input.password, input.displayName ?? undefined)

      // Assert
      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error).toBeInstanceOf(AlreadyExistsError)
      }
    })

    it('データベースエラー時は適切にエラーを返す', async () => {
      // Arrange
      const activeUserId = 1n
      const dbError = new Error('Database connection failed')
      mockDb.activeUser.findUnique.mockRejectedValue(dbError)

      // Act
      const result = await repository.findById(activeUserId)

      // Assert
      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error.message).toBe('Database connection failed')
      }
    })
  })
})