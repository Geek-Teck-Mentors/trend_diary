import { PrismaClient } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { isError, isSuccess } from '@/common/types/utility'
import { UserCommandRepositoryImpl } from './commandImpl'

const mockDb = mockDeep<PrismaClient>()

describe('UserCommandRepositoryImpl', () => {
  let repository: UserCommandRepositoryImpl

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new UserCommandRepositoryImpl(mockDb)
  })

  describe('create', () => {
    it('Userを作成できる', async () => {
      const supabaseId = '123e4567-e89b-12d3-a456-426614174000'
      const mockUser = {
        userId: 1n,
        supabaseId,
        createdAt: new Date(),
      }

      mockDb.user.create.mockResolvedValue(mockUser)

      const result = await repository.create({ supabaseId })

      expect(isSuccess(result)).toBe(true)
      if (isSuccess(result)) {
        expect(result.data.userId).toBe(1n)
        expect(result.data.supabaseId).toBe(supabaseId)
      }
      expect(mockDb.user.create).toHaveBeenCalledWith({
        data: { supabaseId },
      })
    })

    it('データベースエラー時は適切にエラーを返す', async () => {
      const supabaseId = '123e4567-e89b-12d3-a456-426614174000'
      const dbError = new Error('Database connection failed')
      mockDb.user.create.mockRejectedValue(dbError)

      const result = await repository.create({ supabaseId })

      expect(isError(result)).toBe(true)
      if (isError(result)) {
        expect(result.error.message).toBe('Database connection failed')
      }
    })
  })
})
