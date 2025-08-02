import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import UserRepositoryImpl from './userRepositoryImpl'

const mockDb = mockDeep<PrismaClient>()

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new UserRepositoryImpl(mockDb)
  })

  describe('create', () => {
    describe('基本動作', () => {
      it('Userを作成できる', async () => {
        // Arrange
        const mockUser = {
          userId: 1n,
          createdAt: new Date(),
        }

        mockDb.user.create.mockResolvedValue(mockUser)

        // Act
        const result = await repository.create()

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.userId).toBe(1n)
          expect(result.data.createdAt).toEqual(mockUser.createdAt)
        }
        expect(mockDb.user.create).toHaveBeenCalledWith({
          data: {},
        })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const dbError = new Error('Database connection failed')
        mockDb.user.create.mockRejectedValue(dbError)

        // Act
        const result = await repository.create()

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })

      it('非Errorオブジェクトがthrowされた場合も適切に処理する', async () => {
        // Arrange
        mockDb.user.create.mockRejectedValue('Unknown error')

        // Act
        const result = await repository.create()

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Unknown error')
        }
      })
    })
  })

  describe('findById', () => {
    describe('基本動作', () => {
      it('UserをIDで検索できる', async () => {
        // Arrange
        const userId = 1n
        const mockUser = {
          userId: 1n,
          createdAt: new Date(),
        }

        mockDb.user.findUnique.mockResolvedValue(mockUser)

        // Act
        const result = await repository.findById(userId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data?.userId).toBe(1n)
          expect(result.data?.createdAt).toEqual(mockUser.createdAt)
        }
        expect(mockDb.user.findUnique).toHaveBeenCalledWith({
          where: { userId },
        })
      })
    })

    describe('境界値・特殊値', () => {
      it('存在しないUserの場合nullを返す', async () => {
        // Arrange
        const userId = 999n
        mockDb.user.findUnique.mockResolvedValue(null)

        // Act
        const result = await repository.findById(userId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeNull()
        }
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const userId = 1n
        const dbError = new Error('Database connection failed')
        mockDb.user.findUnique.mockRejectedValue(dbError)

        // Act
        const result = await repository.findById(userId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })

      it('非Errorオブジェクトがthrowされた場合も適切に処理する', async () => {
        // Arrange
        const userId = 1n
        mockDb.user.findUnique.mockRejectedValue('Unknown error')

        // Act
        const result = await repository.findById(userId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Unknown error')
        }
      })
    })
  })

  describe('delete', () => {
    describe('基本動作', () => {
      it('Userを削除できる', async () => {
        // Arrange
        const userId = 1n
        mockDb.user.delete.mockResolvedValue({} as any)

        // Act
        const result = await repository.delete(userId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
        expect(mockDb.user.delete).toHaveBeenCalledWith({
          where: { userId },
        })
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const userId = 1n
        const dbError = new Error('Database connection failed')
        mockDb.user.delete.mockRejectedValue(dbError)

        // Act
        const result = await repository.delete(userId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })

      it('非Errorオブジェクトがthrowされた場合も適切に処理する', async () => {
        // Arrange
        const userId = 1n
        mockDb.user.delete.mockRejectedValue('Unknown error')

        // Act
        const result = await repository.delete(userId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Unknown error')
        }
      })
    })
  })
})
