import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import CommandServiceImpl from './commandServiceImpl'

// モックの設定
const mockDb = mockDeep<PrismaClient>()

describe('CommandServiceImpl', () => {
  let useCase: CommandServiceImpl

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CommandServiceImpl(mockDb)
  })

  describe('createActive', () => {
    describe('基本動作', () => {
      it('ActiveUserを作成できる', async () => {
        // Arrange
        const email = 'test@example.com'
        const hashedPassword = 'hashedPassword123'

        const mockUser = {
          userId: 2n,
        }

        const mockActiveUser = {
          activeUserId: 1n,
          userId: 2n,
          email,
          password: hashedPassword,
          displayName: 'テストユーザー',
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.$transaction.mockImplementation(async (callback) => {
          return await callback({
            user: { create: vi.fn().mockResolvedValue(mockUser) } as any,
            activeUser: { create: vi.fn().mockResolvedValue(mockActiveUser) } as any,
          } as any)
        })

        // Act
        const result = await useCase.createActive(email, hashedPassword)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.email).toBe(email)
          expect(result.data.password).toBe(hashedPassword)
        }
        expect(mockDb.$transaction).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const email = 'test@example.com'
        const hashedPassword = 'hashedPassword123'
        const dbError = new Error('Database connection failed')
        mockDb.$transaction.mockRejectedValue(dbError)

        // Act
        const result = await useCase.createActive(email, hashedPassword)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('saveActive', () => {
    describe('基本動作', () => {
      it('ActiveUserを保存できる', async () => {
        // Arrange
        const activeUser = {
          activeUserId: 1n,
          userId: 2n,
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }

        const mockUpdatedUser = {
          activeUserId: 1n,
          userId: 2n,
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        mockDb.activeUser.update.mockResolvedValue(mockUpdatedUser)

        // Act
        const result = await useCase.saveActive(activeUser)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUserId).toBe(1n)
          expect(result.data.email).toBe('test@example.com')
        }
        expect(mockDb.activeUser.update).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const activeUser = {
          activeUserId: 1n,
          userId: 2n,
          email: 'test@example.com',
          password: 'hashedPassword123',
          displayName: 'テストユーザー',
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        const dbError = new Error('Database connection failed')
        mockDb.activeUser.update.mockRejectedValue(dbError)

        // Act
        const result = await useCase.saveActive(activeUser)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('createSession', () => {
    describe('基本動作', () => {
      it('Sessionを作成できる', async () => {
        // Arrange
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const input = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }

        const mockSessionData = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date(),
        }

        mockDb.session.create.mockResolvedValue(mockSessionData)

        // Act
        const result = await useCase.createSession(input)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.sessionId).toBe('session123')
          expect(result.data.expiresAt).toEqual(futureDate)
        }
        expect(mockDb.session.create).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        const input = {
          sessionId: 'session123',
          activeUserId: 1n,
          sessionToken: 'token123',
          expiresAt: futureDate,
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }
        const dbError = new Error('Database connection failed')
        mockDb.session.create.mockRejectedValue(dbError)

        // Act
        const result = await useCase.createSession(input)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('deleteSession', () => {
    describe('基本動作', () => {
      it('Sessionを削除できる', async () => {
        // Arrange
        const sessionId = 'session123'
        mockDb.session.delete.mockResolvedValue({} as any)

        // Act
        const result = await useCase.deleteSession(sessionId)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data).toBeUndefined()
        }
        expect(mockDb.session.delete).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const sessionId = 'session123'
        const dbError = new Error('Database connection failed')
        mockDb.session.delete.mockRejectedValue(dbError)

        // Act
        const result = await useCase.deleteSession(sessionId)

        // Assert
        expect(isError(result)).toBe(true)
        if (isError(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })
})
