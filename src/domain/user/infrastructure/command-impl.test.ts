import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import prisma from '@/test/__mocks__/prisma'
import CommandImpl from './command-impl'

describe('CommandImpl', () => {
  let useCase: CommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CommandImpl(prisma)
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
          authenticationId: null,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        prisma.$transaction.mockImplementation(async (callback) => {
          return await callback({
            // biome-ignore lint/suspicious/noExplicitAny: 戻り値の型が面倒なためanyを使用
            user: { create: vi.fn().mockResolvedValue(mockUser) } as any,
            // biome-ignore lint/suspicious/noExplicitAny: 戻り値の型が面倒なためanyを使用
            activeUser: { create: vi.fn().mockResolvedValue(mockActiveUser) } as any,
            // biome-ignore lint/suspicious/noExplicitAny: 戻り値の型が面倒なためanyを使用
          } as any)
        })

        // Act
        const result = await useCase.createActive(email, hashedPassword)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.email).toBe(email)
        }
        expect(prisma.$transaction).toHaveBeenCalled()
      })
    })

    describe('例外・制約違反', () => {
      it('データベースエラー時は適切にエラーを返す', async () => {
        // Arrange
        const email = 'test@example.com'
        const hashedPassword = 'hashedPassword123'
        const dbError = new Error('Database connection failed')
        prisma.$transaction.mockRejectedValue(dbError)

        // Act
        const result = await useCase.createActive(email, hashedPassword)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })

  describe('createActiveWithAuthenticationId', () => {
    describe('基本動作', () => {
      const testCases = [
        {
          name: 'displayNameなしでActiveUserを作成できる',
          email: 'test@example.com',
          hashedPassword: 'hashedPassword123',
          authenticationId: 'auth-id-123',
          displayName: undefined,
          expectedDisplayName: null,
        },
        {
          name: 'displayName付きでActiveUserを作成できる',
          email: 'test2@example.com',
          hashedPassword: 'hashedPassword456',
          authenticationId: 'auth-id-456',
          displayName: 'カスタム表示名',
          expectedDisplayName: 'カスタム表示名',
        },
        {
          name: 'displayNameがnullの場合もActiveUserを作成できる',
          email: 'test3@example.com',
          hashedPassword: 'hashedPassword789',
          authenticationId: 'auth-id-789',
          displayName: null,
          expectedDisplayName: null,
        },
      ]

      it.each(testCases)(
        '$name',
        async ({ email, hashedPassword, authenticationId, displayName, expectedDisplayName }) => {
          // Arrange
          const mockUser = { userId: 2n }

          const mockActiveUser = {
            activeUserId: 1n,
            userId: 2n,
            email,
            password: hashedPassword,
            displayName: expectedDisplayName,
            authenticationId,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          prisma.$transaction.mockImplementation(async (callback) => {
            return await callback({
              // biome-ignore lint/suspicious/noExplicitAny: 戻り値の型が面倒なためanyを使用
              user: { create: vi.fn().mockResolvedValue(mockUser) } as any,
              // biome-ignore lint/suspicious/noExplicitAny: 戻り値の型が面倒なためanyを使用
              activeUser: { create: vi.fn().mockResolvedValue(mockActiveUser) } as any,
              // biome-ignore lint/suspicious/noExplicitAny: 戻り値の型が面倒なためanyを使用
            } as any)
          })

          // Act
          const result = await useCase.createActiveWithAuthenticationId(
            email,
            hashedPassword,
            authenticationId,
            displayName,
          )

          // Assert
          expect(isSuccess(result)).toBe(true)
          if (isSuccess(result)) {
            expect(result.data.email).toBe(email)
            expect(result.data.displayName).toBe(expectedDisplayName)
          }
          expect(prisma.$transaction).toHaveBeenCalled()
        },
      )
    })

    describe('例外・制約違反', () => {
      const errorTestCases = [
        {
          name: 'データベース接続エラー時は適切にエラーを返す',
          error: new Error('Database connection failed'),
          expectedMessage: 'Database connection failed',
        },
        {
          name: 'ユニーク制約違反時は適切にエラーを返す',
          error: new Error('Unique constraint failed on the fields: (`email`)'),
          expectedMessage: 'Unique constraint failed on the fields: (`email`)',
        },
        {
          name: 'authenticationIdユニーク制約違反時は適切にエラーを返す',
          error: new Error('Unique constraint failed on the fields: (`authenticationId`)'),
          expectedMessage: 'Unique constraint failed on the fields: (`authenticationId`)',
        },
      ]

      it.each(errorTestCases)('$name', async ({ error, expectedMessage }) => {
        // Arrange
        prisma.$transaction.mockRejectedValue(error)

        // Act
        const result = await useCase.createActiveWithAuthenticationId(
          'test@example.com',
          'hashedPassword123',
          'auth-id-123',
        )

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe(expectedMessage)
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
          authenticationId: null,
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
          authenticationId: null,
          lastLogin: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        prisma.activeUser.update.mockResolvedValue(mockUpdatedUser)

        // Act
        const result = await useCase.saveActive(activeUser)

        // Assert
        expect(isSuccess(result)).toBe(true)
        if (isSuccess(result)) {
          expect(result.data.activeUserId).toBe(1n)
          expect(result.data.email).toBe('test@example.com')
        }
        expect(prisma.activeUser.update).toHaveBeenCalled()
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
          authenticationId: null,
          lastLogin: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          adminUserId: null,
        }
        const dbError = new Error('Database connection failed')
        prisma.activeUser.update.mockRejectedValue(dbError)

        // Act
        const result = await useCase.saveActive(activeUser)

        // Assert
        expect(isFailure(result)).toBe(true)
        if (isFailure(result)) {
          expect(result.error.message).toBe('Database connection failed')
        }
      })
    })
  })
})
