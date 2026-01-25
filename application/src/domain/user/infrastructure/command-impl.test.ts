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

  describe('createActiveWithAuthenticationId', () => {
    describe('基本動作', () => {
      const testCases = [
        {
          name: 'displayNameなしでActiveUserを作成できる',
          email: 'test@example.com',
          authenticationId: 'auth-id-123',
          displayName: undefined,
          expectedDisplayName: null,
        },
        {
          name: 'displayName付きでActiveUserを作成できる',
          email: 'test2@example.com',
          authenticationId: 'auth-id-456',
          displayName: 'カスタム表示名',
          expectedDisplayName: 'カスタム表示名',
        },
        {
          name: 'displayNameがnullの場合もActiveUserを作成できる',
          email: 'test3@example.com',
          authenticationId: 'auth-id-789',
          displayName: null,
          expectedDisplayName: null,
        },
      ]

      it.each(testCases)(
        '$name',
        async ({ email, authenticationId, displayName, expectedDisplayName }) => {
          // Arrange
          const mockUser = { userId: 2n }

          const mockActiveUser = {
            activeUserId: 1n,
            userId: 2n,
            email,
            displayName: expectedDisplayName,
            authenticationId,
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
})
