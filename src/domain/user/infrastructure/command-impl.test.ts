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
