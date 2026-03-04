import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shouldUseExplicitBigIntId } from '@/infrastructure/rdb-id'
import prisma from '@/test/__mocks__/prisma'
import CommandImpl from './command-impl'

describe('CommandImpl', () => {
  let useCase: CommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    useCase = new CommandImpl(prisma)
  })

  describe('createActiveWithAuthenticationId', () => {
    it('displayName付きでActiveUserを作成できる', async () => {
      const createdUser = { userId: 2n, createdAt: new Date() }
      const createdActiveUser = {
        activeUserId: 1n,
        userId: 2n,
        email: 'test@example.com',
        displayName: '表示名',
        authenticationId: 'auth-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prisma.user.create.mockResolvedValue(createdUser)
      prisma.activeUser.create.mockResolvedValue(createdActiveUser)
      prisma.$transaction.mockImplementation(async (callback) => await callback(prisma))

      const result = await useCase.createActiveWithAuthenticationId(
        'test@example.com',
        'auth-id-123',
        '表示名',
      )

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.email).toBe('test@example.com')
        expect(result.data.displayName).toBe('表示名')
      }
      const userCreateArgs = prisma.user.create.mock.calls[0]?.[0]
      if (shouldUseExplicitBigIntId()) {
        expect(typeof userCreateArgs?.data?.userId).toBe('bigint')
      } else {
        expect(userCreateArgs).toEqual({ data: {} })
      }
      expect(prisma.activeUser.create).toHaveBeenCalledWith({
        data: {
          userId: 2n,
          email: 'test@example.com',
          authenticationId: 'auth-id-123',
          displayName: '表示名',
        },
      })
    })

    it('トランザクション失敗時にエラーを返す', async () => {
      prisma.$transaction.mockRejectedValue(new Error('create active failed'))

      const result = await useCase.createActiveWithAuthenticationId(
        'test@example.com',
        'auth-id-123',
      )

      expect(isFailure(result)).toBe(true)
      expect(prisma.user.delete).not.toHaveBeenCalled()
      if (isFailure(result)) {
        expect(result.error.message).toBe('Failed to create active user')
      }
    })
  })
})
