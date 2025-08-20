import { beforeEach, describe, expect, it, vi } from 'vitest'
import mockPrisma from '@/test/__mocks__/prisma'
import createPrivacyPolicyUseCase from './factory'
import { UseCase } from './useCase'

describe('createPrivacyPolicyUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('プロジェクト標準のmockPrismaでPrivacyPolicyServiceインスタンスを正常に作成する', () => {
    const service = createPrivacyPolicyUseCase(mockPrisma)

    expect(service).toBeInstanceOf(UseCase)
    expect(service).toBeDefined()
  })
})
