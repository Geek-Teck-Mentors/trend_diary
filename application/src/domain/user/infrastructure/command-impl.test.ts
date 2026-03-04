import { isFailure, isSuccess } from '@yuukihayashi0510/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import prisma from '@/test/__mocks__/prisma'
import CommandImpl from './command-impl'

describe('CommandImpl', () => {
  let useCase: CommandImpl

  beforeEach(() => {
    vi.clearAllMocks()
    prisma.user.findFirst.mockResolvedValue(null)
    prisma.activeUser.findFirst.mockResolvedValue(null)
    useCase = new CommandImpl(prisma)
  })

  describe('createActiveWithAuthenticationId', () => {
    it('displayName付きでActiveUserを作成できる', async () => {
      prisma.user.create.mockResolvedValue({ userId: 2n, createdAt: new Date() })
      prisma.activeUser.create.mockResolvedValue({
        activeUserId: 1n,
        userId: 2n,
        email: 'test@example.com',
        displayName: '表示名',
        authenticationId: 'auth-id-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

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
    })

    it('activeUser作成失敗時にuser削除の補償処理を行う', async () => {
      prisma.user.create.mockResolvedValue({ userId: 2n, createdAt: new Date() })
      prisma.activeUser.create.mockRejectedValue(new Error('create active failed'))
      prisma.user.delete.mockResolvedValue({ userId: 2n, createdAt: new Date() })

      const result = await useCase.createActiveWithAuthenticationId(
        'test@example.com',
        'auth-id-123',
      )

      expect(isFailure(result)).toBe(true)
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { userId: 2n } })
    })
  })
})
